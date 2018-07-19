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
        
        let timeout = Math.floor((((beatNo + this.offset) / global.bpm) * (60*1000)) - 
                (Date.now() -
                global.startTime)); 
        
        if(timeout<0) {
            timeout = 0;
        }

        return new Promise((resolve, reject) =>
            setTimeout(() => {
                this.currentbeat = beatNo;
                resolve();
            },
              timeout  
            )
        );
    }

    async playNote(note, duration) {
        this.output.sendMessage([0x90 + this.channel, noteStringToNoteNumberMap[note], this.velocity]);
        
        await this.waitForBeat(this.currentbeat + duration);
        this.output.sendMessage([0x80 + this.channel, noteStringToNoteNumberMap[note], 0]);
        
    }    
}

module.exports = Pattern