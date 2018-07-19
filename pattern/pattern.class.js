const noteStringToNoteNumberMap = 
    new Array(128).fill(null).map((v, ndx) => 
        (['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'])[ndx%12]+''+Math.floor(ndx/12)
    ).reduce((prev, curr, ndx) => {
        prev[curr] = ndx;
        return prev;
    }, {});


class  Pattern {
    constructor(output) {
        this.currentbeat = 0;
        this.output = output;
        this.channel = 0;
        this.velocity = 100;
        this.offset = 0;
    }

    setChannel(channel) {
        this.channel = channel;
    }

    waitForBeat(beatNo) {   
        beatNo += this.offset;     
        return new Promise((resolve, reject) =>
            setTimeout(() => {
                this.currentbeat = beatNo;
                resolve();
            },
                ((beatNo / global.bpm) * (60*1000)) - 
                    (Date.now() -
                    global.startTime)
            )
        );
    }

    async playNote(note, duration) {
        this.output.sendMessage([0x90 + this.channel, noteStringToNoteNumberMap[note], this.velocity]);
        await this.waitForBeat(this.currentbeat + duration);
        this.output.sendMessage([0x90 + this.channel, noteStringToNoteNumberMap[note], 0]);
    }    
}

module.exports = Pattern