const SAMPLE_FRAMES = 128;

class AssemblyPatternSeqAudioWorkletProcessor extends AudioWorkletProcessor {

    constructor() {
        super();
        this.processorActive = true;

        this.port.onmessage = async (msg) => {
            if (msg.data.wasm) {
                this.wasmInstancePromise = WebAssembly.instantiate(msg.data.wasm, {});
                this.wasmInstance = (await this.wasmInstancePromise).instance.exports;
                this.samplebufferptr = this.wasmInstance.allocateSampleBuffer(SAMPLE_FRAMES);
            }

            if (this.wasmInstance) {
                if (msg.data.toggleSongPlay !== undefined) {
                    this.wasmInstance.toggleSongPlay(msg.data.toggleSongPlay);
                }

                if (msg.data.seek !== undefined) {
                    this.wasmInstance.setTick(msg.data.seek);
                }

                if (msg.data.bpm !== undefined) {
                    this.wasmInstance.setBPM(msg.data.bpm);
                }

                if (msg.data.currentTime) {
                    this.port.postMessage({
                        currentTime: this.wasmInstance.getTick(),
                        playing: this.wasmInstance.isPlaying()
                    });
                }
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
            this.wasmInstance.fillSampleBuffer();

            output[0].set(new Float32Array(this.wasmInstance.memory.buffer,
                this.samplebufferptr,
                SAMPLE_FRAMES));
            output[1].set(new Float32Array(this.wasmInstance.memory.buffer,
                this.samplebufferptr + (SAMPLE_FRAMES * 4),
                SAMPLE_FRAMES));
        }

        return this.processorActive;
    }
}

registerProcessor('asc-patternseqsynth-audio-worklet-processor', AssemblyPatternSeqAudioWorkletProcessor);
