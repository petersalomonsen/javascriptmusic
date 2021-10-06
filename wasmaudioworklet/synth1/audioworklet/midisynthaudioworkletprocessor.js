export function AssemblyScriptMidiSynthAudioWorkletProcessorModule() {
  const SAMPLE_FRAMES = 128;
  class AssemblyScriptMidiSynthAudioWorkletProcessor extends AudioWorkletProcessor {

    constructor() {
      super();
      this.processorActive = true;
      this.playMidiSequence = true;
      AudioWorkletGlobalScope.midisequencer.currentFrame = 0;

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
