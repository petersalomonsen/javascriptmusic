const SAMPLE_FRAMES = 128;

class SointuAudioWorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.processorActive = true;
        this.port.onmessage = async (msg) => {
            if (msg.data.wasm) {
                let tick = 0;
                if (this.wasmInstance && msg.data.livewasmreplace) {
                    tick = this.wasmInstance.getTick();
                }
                this.wasmInstance = (await WebAssembly.instantiate(msg.data.wasm, {
                    m: {
                        pow: Math.pow,
                        log2: Math.log2,
                        sin: Math.sin
                    }
                })).instance.exports;

                this.samplebuf = new Float32Array(this.wasmInstance.m.buffer,
                    this.wasmInstance.s.value,
                    this.wasmInstance.l.value / 4);
                this.samplepos = 0;
            }
            if (msg.data.terminate) {
                this.processorActive = false;
                console.log('terminate');
            }
        };
        this.port.start();

    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];

        if (this.wasmInstance && this.samplepos < this.samplebuf.length) {
            this.wasmInstance.render_128_samples();
            
            let bufpos = this.samplepos * 2;
            for (let i = 0; i < SAMPLE_FRAMES && this.samplepos < this.samplebuf.length; i++) {                
                output[0][i] = this.samplebuf[bufpos++];
                output[1][i] = this.samplebuf[bufpos++];
                
            }
            this.samplepos += SAMPLE_FRAMES;
        }

        return this.processorActive;
    }
}

registerProcessor('sointu-audio-worklet-processor', SointuAudioWorkletProcessor);
