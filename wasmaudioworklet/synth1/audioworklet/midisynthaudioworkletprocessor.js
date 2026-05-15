export function AssemblyScriptMidiSynthAudioWorkletProcessorModule() {
  const SAMPLE_FRAMES = 128;
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
          this.port.postMessage({ wasmloaded: true });
        }

        if (msg.data.pendingWasmModule) {
          // Caller pre-compiled the bytes to a Module on the main thread
          // (see updateSynth). `new WebAssembly.Instance` is synchronous
          // but only does linking + memory setup, no parse/JIT, so the
          // audio thread can absorb it inside a single render quantum.
          // Going through WebAssembly.instantiate(bytes) here instead would
          // sync-compile on the render thread and audibly glitch on save.
          const instance = new WebAssembly.Instance(msg.data.pendingWasmModule, {
            environment: { SAMPLERATE: sampleRate },
            env: {
              abort: () => console.log('webassembly synth abort, should not happen')
            }
          }).exports;
          if (msg.data.audio) {
            this.loadAudioIntoWasm(instance, msg.data.audio);
          }
          this.pendingInstance = instance;
          this.pendingQuantizeN = msg.data.quantizeN || 1;
          this.pendingBpm = msg.data.bpm || this.pendingBpm;
          // Bundled save: stash sequencedata + toggleSongPlay atomically
          // with the new wasm, so a beat-boundary that fires between the
          // wasm-ack and a separate sequencedata message can't swap a
          // half-applied save (new synth, old song).
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

      // Atomic swap. allNotesOff on the *old* instance before replacing it.
      if (this.pendingInstance) {
        this.allNotesOff();
        this.wasmInstance = this.pendingInstance;
        AudioWorkletGlobalScope.midisequencer.addMidiReceiver(this.wasmInstance.shortmessage);
      }
      if (this.pendingSequencedata) {
        if (!this.pendingInstance) this.allNotesOff();
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
      const output = outputs[0];

      if (this.wasmInstance) {
        this.tryQuantizedSwap();
        if (this.playMidiSequence) {
          AudioWorkletGlobalScope.midisequencer.onprocess();
        }
        this.wasmInstance.fillSampleBuffer();
        output[0].set(new Float32Array(this.wasmInstance.memory.buffer,
          this.wasmInstance.samplebuffer,
          SAMPLE_FRAMES));
        output[1].set(new Float32Array(this.wasmInstance.memory.buffer,
          this.wasmInstance.samplebuffer + (SAMPLE_FRAMES * 4),
          SAMPLE_FRAMES));
      }

      return this.processorActive;
    }
  }

  registerProcessor('asc-midisynth-audio-worklet-processor', AssemblyScriptMidiSynthAudioWorkletProcessor);
}
