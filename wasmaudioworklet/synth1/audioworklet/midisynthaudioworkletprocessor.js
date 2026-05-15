export function AssemblyScriptMidiSynthAudioWorkletProcessorModule() {
  // AudioWorklet render quantum size. Fixed at 128 in the original spec
  // and remains the default in `AudioContext({renderQuantumSize})`; we
  // pull it into a constant so the assumption is named in one place. Note
  // that the wasm synth's sample buffer is also sized to this — if the
  // engine ever ships a non-128 quantum, the AssemblyScript synth would
  // need a matching change.
  const RENDER_QUANTUM_FRAMES = 128;
  class AssemblyScriptMidiSynthAudioWorkletProcessor extends AudioWorkletProcessor {

    constructor() {
      super();
      this.processorActive = true;
      this.playMidiSequence = true;
      AudioWorkletGlobalScope.midisequencer.currentFrame = 0;

      // Quantized-save state. When a save arrives with quantizeN > 0,
      // the new wasm / sequencedata land here and the swap happens at
      // the start of the next process() frame whose `currentBeat`
      // satisfies `currentBeat % quantizeN == 0`. Last-save-wins —
      // saving again before the trigger replaces the pending entries.
      this.pendingInstance = null;
      this.pendingAudio = null;
      this.pendingSequencedata = null;
      this.pendingToggleSongPlay = null;
      this.pendingQuantizeN = 0;
      this.pendingBpm = 0;
      this.lastBeat = -1; // for edge-detecting beat crossings
      // BPM of whatever wasm/sequencedata is *currently audible*. Beat math
      // in tryQuantizedSwap uses this — not pendingBpm — so deciding when
      // to swap aligns with what the listener hears, regardless of whether
      // the user changed BPM in the song they're swapping in.
      this.playingBpm = 0;

      // TEMPORARY: counts every process() call so the swap-receive
      // handler can detect missed render quanta during instantiate.
      this._processCallsTotal = 0;

      this.port.onmessage = async (msg) => {
        if (msg.data.wasm) {
          this.wasmInstancePromise = WebAssembly.instantiate(msg.data.wasm, {
            environment: { SAMPLERATE: msg.data.samplerate },
            env: {
              abort: () => console.log('webassembly synth abort, should not happen')
            }
          });

          const wasmInstance = (await this.wasmInstancePromise).instance.exports;
          AudioWorkletGlobalScope.midisequencer.addMidiReceiver(wasmInstance.shortmessage);
          if (msg.data.audio) {
            this.loadAudioIntoWasm(wasmInstance, msg.data.audio);
          }
          this.wasmInstance = wasmInstance;
          this.playingBpm = msg.data.bpm || this.playingBpm;
          this._installTracingReceiver();
          this.port.postMessage({ wasmloaded: true });
        }

        if (msg.data.pendingWasmBytes) {
          // TEMPORARY: ping back immediately so the main thread can measure
          // the wall-clock time from postMessage to onmessage-entry. That
          // window is when structured-clone *deserialization* runs on the
          // audio thread, blocking process() — and we suspect cloning 7347
          // small {time, message: [...]} event objects is the bottleneck.
          this.port.postMessage({ _onMessageEntered: true });

          // Single path: await WebAssembly.instantiate on the bytes inside
          // the worklet. Module structured-clone over AudioWorkletNode.port
          // doesn't reliably work across browsers, so we keep one uniform
          // implementation instead of branching on engine capability.
          //
          // TEMPORARY: timing instrumentation. `currentTime` here is the
          // audio context's clock — it advances at wall-clock rate even
          // when the audio thread is blocked, so subtracting it across
          // steps tells us how much wall-clock time each step consumed.
          // We also count process() calls before/after to detect render
          // quanta that got skipped (i.e. underruns / glitch). Posts a
          // diagnostic message to the main thread, doesn't affect audio.
          const tStart = currentTime;
          const processCallsAtStart = this._processCallsTotal;
          const compileResult = await WebAssembly.instantiate(msg.data.pendingWasmBytes, {
            environment: { SAMPLERATE: sampleRate },
            env: {
              abort: () => console.log('webassembly synth abort, should not happen'),
            },
          });
          const tAfterInstantiate = currentTime;
          const processCallsAfterInstantiate = this._processCallsTotal;
          const instance = compileResult.instance.exports;
          if (msg.data.audio) {
            this.loadAudioIntoWasm(instance, msg.data.audio);
          }
          const tAfterLoadAudio = currentTime;
          this.pendingInstance = instance;
          this.pendingQuantizeN = msg.data.quantizeN || 1;
          this.pendingBpm = msg.data.bpm || this.pendingBpm;
          if (msg.data.pendingSequencedata !== undefined) {
            this.pendingSequencedata = msg.data.pendingSequencedata;
          }
          if (msg.data.pendingToggleSongPlay !== undefined) {
            this.pendingToggleSongPlay = msg.data.pendingToggleSongPlay;
          }
          const tAfterStash = currentTime;
          const processCallsAtEnd = this._processCallsTotal;
          // Expected process() calls during instantiate, given elapsed
          // wall-clock time. If actual < expected, the audio thread was
          // blocked and we underran.
          const elapsedDuringInstantiate = tAfterInstantiate - tStart;
          const expectedProcessCalls = Math.floor(elapsedDuringInstantiate * sampleRate / RENDER_QUANTUM_FRAMES);
          const actualProcessCalls = processCallsAfterInstantiate - processCallsAtStart;
          this.port.postMessage({
            _swapTiming: {
              wasmBytes: msg.data.pendingWasmBytes.byteLength,
              audioItems: msg.data.audio ? msg.data.audio.length : 0,
              instantiateMs: +(elapsedDuringInstantiate * 1000).toFixed(2),
              loadAudioMs: +((tAfterLoadAudio - tAfterInstantiate) * 1000).toFixed(2),
              stashMs: +((tAfterStash - tAfterLoadAudio) * 1000).toFixed(2),
              totalMs: +((tAfterStash - tStart) * 1000).toFixed(2),
              expectedProcessCallsDuringInstantiate: expectedProcessCalls,
              actualProcessCallsDuringInstantiate: actualProcessCalls,
              missedDuringInstantiate: Math.max(0, expectedProcessCalls - actualProcessCalls),
              processCallsTotalAtEnd: processCallsAtEnd,
            },
          });
          this.port.postMessage({ pendingWasmReady: true });
        }

        if (msg.data.sequencedata) {
          if (msg.data.quantizeN && msg.data.quantizeN > 0) {
            // Defer the new sequence until the bar boundary too.
            this.pendingSequencedata = msg.data.sequencedata;
            this.pendingToggleSongPlay = msg.data.toggleSongPlay;
            this.pendingQuantizeN = msg.data.quantizeN;
            this.pendingBpm = msg.data.bpm || this.pendingBpm;
          } else {
            this.allNotesOff();
            AudioWorkletGlobalScope.midisequencer.setSequenceData(msg.data.sequencedata);
            this.playingBpm = msg.data.bpm || this.playingBpm;
          }
        }

        if (msg.data.toggleSongPlay !== undefined && !(msg.data.quantizeN && msg.data.quantizeN > 0)) {
          if (!this.playMidiSequence && msg.data.toggleSongPlay) {
            AudioWorkletGlobalScope.midisequencer.clearRecording();
          }
          this.playMidiSequence = msg.data.toggleSongPlay;
          if (msg.data.toggleSongPlay === false) {
            this.allNotesOff();
          }
        }

        if (msg.data.midishortmsg) {
          (await this.wasmInstancePromise).instance.exports.shortmessage(
            msg.data.midishortmsg[0],
            msg.data.midishortmsg[1],
            msg.data.midishortmsg[2]
          );
          AudioWorkletGlobalScope.midisequencer.onmidi(msg.data.midishortmsg);
        }

        if (msg.data.recorded) {
          this.port.postMessage({ 'recorded': AudioWorkletGlobalScope.midisequencer.getRecorded() });
        }

        if (msg.data.currentTime) {
          this.port.postMessage({
            currentTime:
              this.processorActive ?
                AudioWorkletGlobalScope.midisequencer.getCurrentTime() : null
          });
        }

        if (msg.data.seek !== undefined) {
          this.allNotesOff();
          AudioWorkletGlobalScope.midisequencer.setCurrentTime(msg.data.seek);
        }

        if (msg.data.terminate) {
          this.processorActive = false;
          this.port.close();
        }
      };
      this.port.start();
    }

    allNotesOff() {
      if (this.wasmInstance) {
        this.wasmInstance.allNotesOff();
        for (let ch = 0; ch < 16; ch++) {
          this.wasmInstance.shortmessage(
            0xb0 + ch, 64, 0  // reset sustain pedal
          );
        }
      }
    }

    _installTracingReceiver() {
      // Wraps wasm.shortmessage so the test (or any main-thread listener)
      // can observe noteons posted to whichever wasm is *currently* active.
      // Cheap on the audio thread: one cmp + occasional postMessage on noteon.
      const send = this.wasmInstance.shortmessage;
      const port = this.port;
      AudioWorkletGlobalScope.midisequencer.addMidiReceiver((a, b, c) => {
        if ((a & 0xf0) === 0x90 && c > 0) {
          const ct = AudioWorkletGlobalScope.midisequencer.currentFrame / sampleRate * 1000;
          port.postMessage({ _trace_noteon: { note: b, vel: c, ct } });
        }
        send(a, b, c);
      });
    }

    loadAudioIntoWasm(instance, audioArray) {
      const insert = (buf) => {
        const data = new Float32Array(buf);
        const ptr = instance.allocateAudioBuffer(data.length);
        const arr = new Float32Array(instance.memory.buffer, ptr, data.length);
        arr.set(data);
      };
      audioArray.forEach(audio => {
        insert(audio.leftbuffer);
        insert(audio.rightbuffer);
      });
    }

    tryQuantizedSwap() {
      // No pending state → nothing to do. Reset lastBeat so the next save
      // starts fresh (otherwise a stale lastBeat from a previous swap can
      // make the first cross-check after the next save fire immediately).
      const hasPending = this.pendingInstance
        || this.pendingSequencedata
        || this.pendingToggleSongPlay != null;
      if (!hasPending) {
        this.lastBeat = -1;
        return;
      }
      // Beat math runs against the *currently playing* bpm, not pendingBpm.
      // If the user switched to a song with a different BPM, pendingBpm
      // is the new song's BPM but the listener is still hearing the old
      // one — using it here would land the swap on the wrong audible beat.
      const beatBpm = this.playingBpm || this.pendingBpm;
      if (this.pendingQuantizeN <= 0 || beatBpm <= 0) return;

      const framesPerBeat = sampleRate * 60 / beatBpm;
      const currentBeat = Math.floor(
        AudioWorkletGlobalScope.midisequencer.currentFrame / framesPerBeat
      );
      // First check after a save lands here. Anchor lastBeat to the beat
      // the save fell inside so we never swap *within* that beat — we only
      // swap once we've crossed into a new beat that satisfies the
      // quantize. Without this, saving anywhere inside an N-aligned beat
      // would fire the swap on the very next process call (~3 ms later).
      if (this.lastBeat === -1) {
        this.lastBeat = currentBeat;
        return;
      }
      // Edge-detect beat crossings. `!==` (not `>`) so wrap-around when the
      // song loops back to frame 0 still triggers.
      if (currentBeat === this.lastBeat) return;
      this.lastBeat = currentBeat;
      if (currentBeat % this.pendingQuantizeN !== 0) return;
      this.port.postMessage({
        quantizedSwapApplied: true,
        beat: currentBeat,
        ct: AudioWorkletGlobalScope.midisequencer.currentFrame / sampleRate * 1000,
        bpm: this.pendingBpm,
      });

      // Atomic swap. allNotesOff on the *old* instance before replacing it.
      if (this.pendingInstance) {
        this.allNotesOff();
        this.wasmInstance = this.pendingInstance;
        this._installTracingReceiver();
      }
      if (this.pendingSequencedata) {
        if (!this.pendingInstance) this.allNotesOff();
        // Reset the sequencer's clock to 0 so the new song plays from its
        // beat 0 at the swap moment, regardless of where the old song's
        // event grid was. Otherwise a swap at currentTime T leaves the new
        // song waiting for its next event at time > T — at 120 BPM that's
        // up to 500 ms of silence after the swap fires.
        AudioWorkletGlobalScope.midisequencer.currentFrame = 0;
        AudioWorkletGlobalScope.midisequencer.setSequenceData(this.pendingSequencedata);
      }
      if (this.pendingToggleSongPlay != null) {
        if (!this.playMidiSequence && this.pendingToggleSongPlay) {
          AudioWorkletGlobalScope.midisequencer.clearRecording();
        }
        this.playMidiSequence = this.pendingToggleSongPlay;
        if (this.pendingToggleSongPlay === false) {
          this.allNotesOff();
        }
      }
      // The swap is now audible. From this point on, beat math must use
      // the bpm of the song that just took over.
      if (this.pendingBpm > 0) this.playingBpm = this.pendingBpm;
      this.pendingInstance = null;
      this.pendingAudio = null;
      this.pendingSequencedata = null;
      this.pendingToggleSongPlay = null;
      this.pendingQuantizeN = 0;
    }

    process(inputs, outputs, parameters) {
      this._processCallsTotal++;
      // TEMPORARY: detect render-quantum gaps that exceed ~1.5 quanta.
      // currentTime advances at wall-clock rate; process() should fire
      // every RENDER_QUANTUM_FRAMES / sampleRate seconds. A larger gap
      // means the audio thread missed at least one quantum → audible
      // glitch. We post each gap to the main thread for correlation
      // with click-save timing.
      const expectedQuantumSec = RENDER_QUANTUM_FRAMES / sampleRate;
      if (this._lastProcessTime !== undefined) {
        const gap = currentTime - this._lastProcessTime;
        if (gap > expectedQuantumSec * 1.5) {
          this.port.postMessage({
            _processGap: {
              gapMs: +((gap * 1000).toFixed(2)),
              expectedMs: +((expectedQuantumSec * 1000).toFixed(2)),
              missedQuanta: Math.round(gap / expectedQuantumSec) - 1,
              atCurrentTime: +(currentTime.toFixed(4)),
            },
          });
        }
      }
      this._lastProcessTime = currentTime;
      const output = outputs[0];

      if (this.wasmInstance) {
        this.tryQuantizedSwap();
        if (this.playMidiSequence) {
          AudioWorkletGlobalScope.midisequencer.onprocess();
        }
        this.wasmInstance.fillSampleBuffer();
        output[0].set(new Float32Array(this.wasmInstance.memory.buffer,
          this.wasmInstance.samplebuffer,
          RENDER_QUANTUM_FRAMES));
        output[1].set(new Float32Array(this.wasmInstance.memory.buffer,
          this.wasmInstance.samplebuffer + (RENDER_QUANTUM_FRAMES * 4),
          RENDER_QUANTUM_FRAMES));
      }

      return this.processorActive;
    }
  }

  registerProcessor('asc-midisynth-audio-worklet-processor', AssemblyScriptMidiSynthAudioWorkletProcessor);
}
