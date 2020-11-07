const SAMPLE_FRAMES = 128;

class AssemblyScriptMidiSynthAudioWorkletProcessor extends AudioWorkletProcessor {

    constructor() {
        super();
        this.processorActive = true;
        this.playSong = true;

        this.port.onmessage = async (msg) => {
            if (msg.data.wasm) {
                this.wasmInstancePromise = WebAssembly.instantiate(msg.data.wasm, {});
                this.wasmInstance = (await this.wasmInstancePromise).instance.exports;

                this.port.postMessage({ wasmloaded: true });
            }

            if (this.wasmInstance) {
                if (msg.data.toggleSongPlay !== undefined) {
                    if (msg.data.toggleSongPlay === false) {
                        this.wasmInstance.allNotesOff();
                        this.playSong = false;
                    } else {
                        this.playSong = true;
                    }
                }

                if (msg.data.seek !== undefined) {
                    this.wasmInstance.allNotesOff();
                    this.wasmInstance.seek(msg.data.seek);
                }

                if (msg.data.currentTime) {
                    this.port.postMessage({
                        currentTime: this.wasmInstance.currentTimeMillis.value
                    });
                }
            }

            if (msg.data.midishortmsg) {
                (await this.wasmInstancePromise).instance.exports.shortmessage(
                    msg.data.midishortmsg[0],
                    msg.data.midishortmsg[1],
                    msg.data.midishortmsg[2]
                );
            }

            if (msg.data.terminate) {
                this.processorActive = false;
                this.port.close();
            }
        };
        this.port.start();
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];

        if (this.wasmInstance) {
            if (this.playSong) {
                this.wasmInstance.playEventsAndFillSampleBuffer();
            } else {
                this.wasmInstance.fillSampleBuffer();
            }

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
