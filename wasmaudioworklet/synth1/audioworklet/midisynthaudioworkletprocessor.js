export function AssemblyScriptMidiSynthAudioWorkletProcessorModule() {
  const SAMPLE_FRAMES = 128;
  class AssemblyScriptMidiSynthAudioWorkletProcessor extends AudioWorkletProcessor {

    constructor() {
      super();
      this.processorActive = true;
      this.playMidiSequence = true;
      AudioWorkletGlobalScope.midisequencer.currentFrame = 0;
      // Sequencer fires this from inside onprocess when a SEQ_MSG_BROADCAST_SEND
      // event is hit. Wire it to a port message so the main thread can
      // forward to its BroadcastChannel.
      AudioWorkletGlobalScope.midisequencer.broadcastSender = (name) => {
        this.port.postMessage({ broadcastSend: name });
      };

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
            const insertAudioInWasm = (buf) => {
              const data = new Float32Array(buf);
              const ptr = wasmInstance.allocateAudioBuffer(data.length);
              const arr = new Float32Array(wasmInstance.memory.buffer,
                ptr,
                data.length);
              arr.set(data);
            };
            msg.data.audio.forEach(audio => {
              insertAudioInWasm(audio.leftbuffer);
              insertAudioInWasm(audio.rightbuffer);
            });            
          }
          this.wasmInstance = wasmInstance;
          this.port.postMessage({ wasmloaded: true });
        }

        if (msg.data.sequencedata) {
          this.allNotesOff();
          AudioWorkletGlobalScope.midisequencer.setSequenceData(msg.data.sequencedata);
        }

        if (msg.data.toggleSongPlay !== undefined) {
          if (!this.playMidiSequence && msg.data.toggleSongPlay) {
            AudioWorkletGlobalScope.midisequencer.clearRecording();
          }
          this.playMidiSequence = msg.data.toggleSongPlay;
          if (msg.data.toggleSongPlay === false) {
            this.allNotesOff();
          }
          // Manual play overrides a pending broadcast wait — the user
          // explicitly asked for playback to resume, bypass the signal.
          if (msg.data.toggleSongPlay === true) {
            AudioWorkletGlobalScope.midisequencer.waitingForSignal = null;
          }
        }

        if (msg.data.broadcastReceived !== undefined) {
          // Only unblock if we're actually parked on this exact name —
          // stale signals from before the wait engaged are ignored.
          const seq = AudioWorkletGlobalScope.midisequencer;
          if (seq.waitingForSignal === msg.data.broadcastReceived) {
            seq.waitingForSignal = null;
            this.playMidiSequence = true;
            this.port.postMessage({ broadcastResumed: msg.data.broadcastReceived });
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

    process(inputs, outputs, parameters) {
      const output = outputs[0];

      if (this.wasmInstance) {
        if (this.playMidiSequence) {
          const seq = AudioWorkletGlobalScope.midisequencer;
          const wasWaiting = seq.waitingForSignal;
          seq.onprocess();
          // Newly hit a wait this tick — flip playback off so the UI can
          // reflect the pause, and silence any held notes.
          if (!wasWaiting && seq.waitingForSignal) {
            this.playMidiSequence = false;
            this.allNotesOff();
            this.port.postMessage({ broadcastWaiting: seq.waitingForSignal });
          }
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
