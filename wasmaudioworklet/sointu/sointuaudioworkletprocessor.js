const SAMPLE_FRAMES = 128;
const SAMPLE_RATE = 44100;

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
                this.channelHoldStartIndices = {};

                if (this.wasmInstance && msg.data.livewasmreplace) {
                    tick = this.wasmInstance.tick.value;
                    row = this.wasmInstance.row.value;
                    pattern = this.wasmInstance.pattern.value;
                    sample = this.wasmInstance.sample.value;
                    outputBufPtr = this.wasmInstance.outputBufPtr.value;
                }

                this.wasmInstance = (await WebAssembly.instantiate(msg.data.wasm, {})).instance.exports;
                this.allNotesOff();

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

            if (msg.data.song) {
                this.song = msg.data.song;
                this.patternsize = this.song.patterns[0].length;

                this.patternsbuffersize = 256 * this.patternsize;
                this.availablePatternNo = this.song.patterns.length;
                this.songlength = this.song.instrumentPatternLists[0].length;
                this.instrumentpatternslistsize = this.song.instrumentPatternLists.length * this.songlength;                
            }

            if (msg.data.channel !== undefined && msg.data.note !== undefined) {
                this.wasmInstance.update_single_voice(msg.data.channel, msg.data.note);

                if (this.playing) {
                    const patternsbuffer = new Uint8Array(this.wasmInstance.m.buffer, 0, this.patternsbuffersize);
                    const instrumentpatternslist = new Uint8Array(this.wasmInstance.m.buffer, this.patternsbuffersize, this.instrumentpatternslistsize);
                    const timePositionSeconds = (this.wasmInstance.tick.value / SAMPLE_RATE);
                    const currentBeat = (timePositionSeconds / 60) * this.song.BPM;
                    const currentTick = this.song.rowsperbeat * currentBeat;

                    const quantizedTick = Math.round(currentTick);
                    const patternIndex = Math.floor(quantizedTick / this.patternsize) % this.songlength;
                    const patternNoteIndex = quantizedTick % this.patternsize;

                    const currentInstrumentPatternIndex = msg.data.channel * this.songlength + patternIndex;

                    let patternNo = instrumentpatternslist[currentInstrumentPatternIndex];

                    if (patternNo === 0) {
                        patternNo = (this.availablePatternNo++);
                        instrumentpatternslist[currentInstrumentPatternIndex] = patternNo;
                    }
                    const patternsBufferNdx = patternNo * this.patternsize + patternNoteIndex;
                    if (msg.data.note > 0) {
                        patternsbuffer[patternsBufferNdx] = msg.data.note;
                        this.channelHoldStartIndices[msg.data.channel] = {patternIndex, patternNoteIndex};
                    } else {
                        const holdStartIndices = this.channelHoldStartIndices[msg.data.channel];
                        let holdPatternIndex = holdStartIndices.patternIndex;
                        let holdPatternNoteIndex = holdStartIndices.patternNoteIndex;

                        while (holdPatternIndex != patternIndex || holdPatternNoteIndex != patternNoteIndex) {
                            if (holdPatternIndex != holdStartIndices.patternIndex ||
                                holdPatternNoteIndex != holdStartIndices.patternNoteIndex) {
                                const holdInstrumentPatternIndex = msg.data.channel * this.songlength + holdPatternIndex;
                                const holdPatternNo = instrumentpatternslist[holdInstrumentPatternIndex];
                                patternsbuffer[holdPatternNo * this.patternsize + holdPatternNoteIndex] = 1;
                                
                            }

                            holdPatternNoteIndex ++;
                            if (holdPatternNoteIndex == this.patternsize) {
                                holdPatternNoteIndex = 0;
                                holdPatternIndex++;
                            }
                            if (holdPatternIndex == this.songlength) {
                                break;
                            }
                        }
                    }

                    // send pattern back to main thread for storing
                    this.port.postMessage({
                        instrumentPatternIndex: patternIndex,
                        channel: msg.data.channel,
                        recordedPatternNo: patternNo,
                        patternData: Array.from(patternsbuffer.slice(
                            patternNo * this.patternsize,
                            patternNo * this.patternsize + this.patternsize
                        )
                        )
                    });
                }
            }

            if (msg.data.toggleSongPlay !== undefined) {
                this.playing = msg.data.toggleSongPlay;
                if (!this.playing) {
                    this.allNotesOff();
                }
            }

            if (msg.data.songPositionMillis) {
                // this.wasmInstance.setMilliSecondPosition(this.wasmInstance.tick.value / SAMPLE_RATE);
            }

            if (msg.data.terminate) {
                this.processorActive = false;
                console.log('terminate');
            }
        };
        this.port.start();

    }

    allNotesOff() {
        if (!this.wasmInstance) {
            return;
        }
        for (let channel = 0; channel < 32; channel++) {
            this.wasmInstance.update_single_voice(channel, 0);
        }
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
