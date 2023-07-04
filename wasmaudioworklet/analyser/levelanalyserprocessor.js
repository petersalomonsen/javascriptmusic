class LevelAnalyserProcessor extends AudioWorkletProcessor {
    stats = {
        clips: []
    };

    position = 0;

    constructor() {
        super();

        this.port.onmessage = async (msg) => {
            if (msg.data.stats) {
                this.port.postMessage(this.stats);
                this.stats.clips = [];
            }
        };
    }

    process(inputs, outputs, parameters) {
        const numChannels = inputs[0].length;
        const threshold = 1.0;

        for (let ch = 0; ch < numChannels; ch++) {
            const channeldata = inputs[0][ch];
            for (let n = 0; n < channeldata.length; n++) {
                if (Math.abs(channeldata[n]) > threshold) {
                    this.stats.clips.push({
                        channel: ch,
                        position: this.position + n,
                        time: ((this.position + n) / sampleRate),
                        currentTime: currentTime,
                        value: channeldata[n]
                    });
                }

            }
        }
        this.position += inputs[0][0].length;
        return true;
    }
}

registerProcessor('levelanalyserprocessor', LevelAnalyserProcessor);
