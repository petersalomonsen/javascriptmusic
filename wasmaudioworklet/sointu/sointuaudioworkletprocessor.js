const SAMPLE_FRAMES = 128;

class SointuAudioWorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.processorActive = true;
        this.playing = true;
        this.port.onmessage = async (msg) => {
            if (msg.data.wasm) {
                let tick = 0;
                let row = 0;
                let pattern = 0;
                let sample = 0;
                let outputBufPtr;

                if (this.wasmInstance && msg.data.livewasmreplace) {
                    tick = this.wasmInstance.tick.value;
                    row = this.wasmInstance.row.value;
                    pattern = this.wasmInstance.pattern.value;
                    sample = this.wasmInstance.sample.value;
                    outputBufPtr = this.wasmInstance.outputBufPtr.value;
                }

                this.wasmInstance = (await WebAssembly.instantiate(msg.data.wasm, {})).instance.exports;
                this.wasmInstance.update_voices();
                this.channelValues = {};

                console.log('replacing wasm', tick, pattern, row, sample);
                this.wasmInstance.tick.value = tick;
                this.wasmInstance.pattern.value = pattern;
                this.wasmInstance.row.value = row;
                this.wasmInstance.sample.value = sample;
                if (outputBufPtr) {
                    this.wasmInstance.outputBufPtr.value = outputBufPtr;
                }

                this.samplebuf = new Float32Array(
                    this.wasmInstance.m.buffer,
                    this.wasmInstance.s.value,
                    this.wasmInstance.l.value / 4
                );
            }

            if (msg.data.channel !== undefined && msg.data.note !== undefined) {
                this.wasmInstance.update_single_voice(msg.data.channel, msg.data.note);
                if (msg.data.note) {
                    this.channelValues[msg.data.channel] = msg.data.note;
                } else {
                    delete this.channelValues[msg.data.channel];
                }
            }

            if(msg.data.toggleSongPlay!==undefined) {    
                this.playing = msg.data.toggleSongPlay;
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

        if (this.wasmInstance) {
            let bufpos = this.wasmInstance.tick.value * 2;

            const shouldUpdateVoices = this.wasmInstance.render_128_samples();
            if (this.playing && shouldUpdateVoices) {
                this.wasmInstance.update_voices();
            }

            for (let i = 0; i < SAMPLE_FRAMES; i++) {
                output[0][i] = this.samplebuf[bufpos++];
                output[1][i] = this.samplebuf[bufpos++];
            }
        }

        return this.processorActive;
    }
}

registerProcessor('sointu-audio-worklet-processor', SointuAudioWorkletProcessor);
