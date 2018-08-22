const noteStringToNoteNumberMap = 
    new Array(128).fill(null).map((v, ndx) => 
        (['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'])[ndx%12]+''+Math.floor(ndx/12)
    ).reduce((prev, curr, ndx) => {
        prev[curr] = ndx;
        return prev;
    }, {});

global.startTime = Date.now();
global.bpm = 110;
global.currentBeat = () =>
    ((Date.now() -
        global.startTime)/
        (60*1000)
) * global.bpm; 

global.waitForBeat = (beatNo) => {           
        let timeout = Math.floor((((beatNo) / global.bpm) * (60*1000)) - 
                (Date.now() -
                global.startTime)); 
        
        if(timeout<0) {
            timeout = 0;
        }

        return new Promise((resolve, reject) =>
            setTimeout(() => {                
                resolve();
            },
              timeout  
            )
        );
    };

class Pattern {
    constructor(output) {
        this.currentbeat = 0;
        this.output = output;
        this.channel = 0;
        this.velocity = 100;
        this.offset = 0;
        this.stepsperbeat = 16;
    }

    setChannel(channel) {
        this.channel = channel;
    }


    waitForStep(stepno) {
        return this.waitForBeat(stepno / this.stepsperbeat);
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

    toNoteNumber(note) {
        return noteStringToNoteNumberMap[note];
    }

    async waitDuration(duration) {
        const timeout = (duration*60*1000) / global.bpm; 
        
        return new Promise((resolve, reject) =>
            setTimeout(() => {
                resolve();
            },
              timeout  
            )
        );
    }

    async note(noteNumber, duration) {
        this.output.sendMessage([0x90 + this.channel, noteNumber, this.velocity]);
        
        await this.waitDuration(duration);
        this.output.sendMessage([0x80 + this.channel, noteNumber, 0]);        
    }    

    async playNote(note, duration) {
        this.output.sendMessage([0x90 + this.channel, noteStringToNoteNumberMap[note], this.velocity]);
        
        await this.waitDuration(duration);
        this.output.sendMessage([0x80 + this.channel, noteStringToNoteNumberMap[note], 0]);
        
    }    
}

module.exports = Pattern