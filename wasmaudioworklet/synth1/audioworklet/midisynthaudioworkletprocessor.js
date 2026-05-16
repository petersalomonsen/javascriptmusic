export function AssemblyScriptMidiSynthAudioWorkletProcessorModule() {
  // AudioWorklet render quantum size. Fixed at 128 in the original spec
  // and remains the default in `AudioContext({renderQuantumSize})`; we
  // pull it into a constant so the assumption is named in one place. Note
  // that the wasm synth's sample buffer is also sized to this — if the
  // engine ever ships a non-128 quantum, the AssemblyScript synth would
  // need a matching change.
  const RENDER_QUANTUM_FRAMES = 128;

  class AssemblyScriptMidiSynthAudioWorkletProcessor extends AudioWorkletProcessor {

    constructor(options) {
      super();
      this.processorActive = true;
      this.playMidiSequence = true;
      // Each processor owns its own sequencer instance (rather than
      // sharing AudioWorkletGlobalScope.midisequencer). Lets multiple
      // AudioWorkletNodes coexist briefly during a quantized save handoff
      // without their sequencer state stomping on each other.
      this.sequencer = new AudioWorkletGlobalScope.MidiSequencerClass();
      this.sequencer.currentFrame = 0;
      this.playingBpm = 0;
      // When > 0, this processor stays silent (and doesn't advance its
      // sequencer) until ctx.currentTime reaches this value. Used for
      // the per-save-new-node handoff: the new node is created in advance,
      // pre-loads its wasm, but only starts producing audio at the
      // quantize-aligned beat. ctx-time-aligned with a GainNode crossfade
      // for sample-accurate handoff.
      this.swapAtCtxTime = 0;
      this._swapAnnounced = false;
      // Symmetric to swapAtCtxTime but for the *outgoing* node: when the
      // newer node takes over, we tell this node to freeze (stop
      // advancing its sequencer / firing noteons) so it doesn't keep
      // emitting trace events to the main thread until cleanup.
      this.stopAtCtxTime = Infinity;

      const opts = (options && options.processorOptions) || {};
      // New-style construction: wasm Module + sequencedata baked into
      // processorOptions. Module structured-clones via processorOptions
      // even on Chrome (chromium issue 40855462 only affects port
      // postMessage), so we get the Module to the worklet without the
      // audible compile-on-audio-thread glitch the bytes path causes.
      if (opts.wasmModule) {
        this._initFromProcessorOptions(opts);
      }

      this.port.onmessage = async (msg) => {
        // Legacy 'wasm' bytes message — kept so existing call sites that
        // don't yet use processorOptions (e.g. exportToWav, pianorolldemo)
        // keep working. Synchronously instantiates on the audio thread.
        if (msg.data.wasm) {
          const wasmInstance = (await WebAssembly.instantiate(msg.data.wasm, {
            environment: { SAMPLERATE: msg.data.samplerate || sampleRate },
            env: {
              abort: () => console.log('webassembly synth abort, should not happen')
            }
          })).instance.exports;
          this.sequencer.addMidiReceiver(wasmInstance.shortmessage);
          if (msg.data.audio) {
            this.loadAudioIntoWasm(wasmInstance, msg.data.audio);
          }
          this.wasmInstance = wasmInstance;
          this.playingBpm = msg.data.bpm || this.playingBpm;
          this._installTracingReceiver();
          this.port.postMessage({ wasmloaded: true });
        }

        if (msg.data.sequencedata) {
          // Plain immediate setSequenceData. quantized-save now creates a
          // new AudioWorkletNode rather than deferring inside an existing
          // one, so this branch only handles the N=0 / non-quantized path.
          this.allNotesOff();
          this.sequencer.setSequenceData(msg.data.sequencedata);
          this.playingBpm = msg.data.bpm || this.playingBpm;
        }

        if (msg.data.toggleSongPlay !== undefined) {
          if (!this.playMidiSequence && msg.data.toggleSongPlay) {
            this.sequencer.clearRecording();
          }
          this.playMidiSequence = msg.data.toggleSongPlay;
          if (msg.data.toggleSongPlay === false) {
            this.allNotesOff();
          }
        }

        if (msg.data.midishortmsg) {
          if (this.wasmInstance) {
            this.wasmInstance.shortmessage(
              msg.data.midishortmsg[0],
              msg.data.midishortmsg[1],
              msg.data.midishortmsg[2]
            );
          }
          this.sequencer.onmidi(msg.data.midishortmsg);
        }

        if (msg.data.recorded) {
          this.port.postMessage({ 'recorded': this.sequencer.getRecorded() });
        }

        if (msg.data.currentTime) {
          this.port.postMessage({
            currentTime:
              this.processorActive ?
                this.sequencer.getCurrentTime() : null
          });
        }

        if (msg.data.seek !== undefined) {
          this.allNotesOff();
          this.sequencer.setCurrentTime(msg.data.seek);
        }

        if (msg.data.stopAtCtxTime !== undefined) {
          this.stopAtCtxTime = msg.data.stopAtCtxTime;
        }

        if (msg.data.terminate) {
          this.processorActive = false;
          this.port.close();
        }
      };
      this.port.start();
    }

    _initFromProcessorOptions(opts) {
      // Synchronous instantiate from a pre-compiled Module is just the
      // linking step — microseconds, not the ~85 ms a parse+compile of
      // bytes would take. Cheap enough to do on the audio thread.
      this.wasmInstance = new WebAssembly.Instance(opts.wasmModule, {
        environment: { SAMPLERATE: sampleRate },
        env: {
          abort: () => console.log('webassembly synth abort, should not happen'),
        },
      }).exports;
      if (opts.audio) {
        this.loadAudioIntoWasm(this.wasmInstance, opts.audio);
      }
      if (opts.sequencedata) {
        this.sequencer.setSequenceData(opts.sequencedata);
      }
      this.sequencer.addMidiReceiver(this.wasmInstance.shortmessage);
      this._installTracingReceiver();
      if (opts.toggleSongPlay !== undefined) {
        this.playMidiSequence = opts.toggleSongPlay;
      }
      if (opts.bpm) {
        this.playingBpm = opts.bpm;
      }
      if (typeof opts.swapAtCtxTime === 'number') {
        this.swapAtCtxTime = opts.swapAtCtxTime;
      }
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
      // can observe noteons posted to whichever wasm is currently active.
      // Cheap on the audio thread: one cmp + occasional postMessage on noteon.
      const send = this.wasmInstance.shortmessage;
      const port = this.port;
      const sequencer = this.sequencer;
      this.sequencer.addMidiReceiver((a, b, c) => {
        if ((a & 0xf0) === 0x90 && c > 0) {
          const ct = sequencer.currentFrame / sampleRate * 1000;
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

    process(inputs, outputs, parameters) {
      const output = outputs[0];

      if (!this.wasmInstance) {
        return this.processorActive;
      }

      // Pre-swap silent prelude. Don't advance the sequencer — we want
      // the first audible quantum to be the new song's beat 0, not
      // beat (swapDelaySeconds * bpm / 60).
      if (this.swapAtCtxTime > 0 && currentTime < this.swapAtCtxTime) {
        return this.processorActive;
      }
      // Post-stop freeze. The newer node has taken over; stay silent and
      // don't fire any more sequencer events while we wait for cleanup.
      if (currentTime >= this.stopAtCtxTime) {
        return this.processorActive;
      }

      // First quantum at or past the swap moment. Tell the main thread
      // so the beat indicator can pick up the new bpm.
      if (this.swapAtCtxTime > 0 && !this._swapAnnounced) {
        this._swapAnnounced = true;
        this.port.postMessage({
          quantizedSwapApplied: true,
          ct: currentTime * 1000,
          bpm: this.playingBpm,
        });
      }

      if (this.playMidiSequence) {
        this.sequencer.onprocess();
      }
      this.wasmInstance.fillSampleBuffer();
      output[0].set(new Float32Array(this.wasmInstance.memory.buffer,
        this.wasmInstance.samplebuffer,
        RENDER_QUANTUM_FRAMES));
      output[1].set(new Float32Array(this.wasmInstance.memory.buffer,
        this.wasmInstance.samplebuffer + (RENDER_QUANTUM_FRAMES * 4),
        RENDER_QUANTUM_FRAMES));

      return this.processorActive;
    }
  }

  registerProcessor('asc-midisynth-audio-worklet-processor', AssemblyScriptMidiSynthAudioWorkletProcessor);
}
