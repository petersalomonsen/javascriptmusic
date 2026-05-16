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
      this.pendingSequencedata = null;
      this.pendingToggleSongPlay = null;
      this.pendingQuantizeN = 0;
      this.pendingBpm = 0;
      this.lastBeat = -1; // for edge-detecting beat crossings
      // Deferred-instantiate state. The save click only stashes bytes;
      // WebAssembly.instantiate is kicked off at the beat boundary
      // inside tryQuantizedSwap. The audio thread blocks there for the
      // compile, so the glitch happens at the (musically-aligned) swap
      // moment rather than at the click — the lesser of two evils, since
      // pre-compiling on click also blocks while the *currently*-playing
      // wasm is rendering.
      this.pendingWasmBytesDeferred = null;
      this.pendingAudioDeferred = null;
      this.swapInstantiateInFlight = false;
      // BPM of whatever wasm/sequencedata is *currently audible*. Beat math
      // in tryQuantizedSwap uses this — not pendingBpm — so deciding when
      // to swap aligns with what the listener hears, regardless of whether
      // the user changed BPM in the song they're swapping in.
      this.playingBpm = 0;

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
          // Stash only — instantiate is deferred to the swap moment in
          // tryQuantizedSwap. Save click stays glitch-free; the audible
          // pause moves to the beat boundary where the listener at least
          // expects something to change.
          this.pendingWasmBytesDeferred = msg.data.pendingWasmBytes;
          this.pendingAudioDeferred = msg.data.audio;
          this.pendingQuantizeN = msg.data.quantizeN || 1;
          this.pendingBpm = msg.data.bpm || this.pendingBpm;
          if (msg.data.pendingSequencedata !== undefined) {
            this.pendingSequencedata = msg.data.pendingSequencedata;
          }
          if (msg.data.pendingToggleSongPlay !== undefined) {
            this.pendingToggleSongPlay = msg.data.pendingToggleSongPlay;
          }
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
        || this.pendingWasmBytesDeferred
        || this.pendingSequencedata
        || this.pendingToggleSongPlay != null;
      if (!hasPending) {
        this.lastBeat = -1;
        this.swapInstantiateInFlight = false;
        return;
      }

      // Mid-instantiate: we kicked off WebAssembly.instantiate on a
      // previous process() call and are waiting for the .then to populate
      // pendingInstance. Don't re-trigger; just see if it landed.
      if (this.swapInstantiateInFlight) {
        if (this.pendingInstance) {
          this._applySwap();
        }
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

      // Beat boundary hit. If we have deferred bytes that haven't been
      // instantiated yet, kick off the compile NOW (audio thread blocks
      // here). Otherwise (sequencedata-only swap), proceed directly.
      if (this.pendingWasmBytesDeferred && !this.pendingInstance) {
        this.swapInstantiateInFlight = true;
        const bytes = this.pendingWasmBytesDeferred;
        const audio = this.pendingAudioDeferred;
        this.pendingWasmBytesDeferred = null;
        this.pendingAudioDeferred = null;
        WebAssembly.instantiate(bytes, {
          environment: { SAMPLERATE: sampleRate },
          env: {
            abort: () => console.log('webassembly synth abort, should not happen'),
          },
        }).then((result) => {
          const instance = result.instance.exports;
          if (audio) {
            this.loadAudioIntoWasm(instance, audio);
          }
          this.pendingInstance = instance;
          // Next process() call sees pendingInstance + swapInstantiateInFlight
          // and calls _applySwap.
        }).catch((err) => {
          console.log('wasm instantiate error:', err);
          this.swapInstantiateInFlight = false;
        });
        return;
      }

      this._applySwap();
    }

    _applySwap() {
      this.port.postMessage({
        quantizedSwapApplied: true,
        beat: this.lastBeat,
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
      this.pendingWasmBytesDeferred = null;
      this.pendingAudioDeferred = null;
      this.pendingSequencedata = null;
      this.pendingToggleSongPlay = null;
      this.pendingQuantizeN = 0;
      this.swapInstantiateInFlight = false;
    }

    process(inputs, outputs, parameters) {
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
