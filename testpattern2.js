const midi = require('midi');
const startTime = Date.now();
const bpm = 100;

// Set up a new output.
const output = new midi.output();
let outputIndex;
for(var n=0;n<output.getPortCount(); n++) {
    if(output.getPortName(n) === 'virtual1') {
        outputIndex = n;
    }
}
output.openPort(outputIndex);

const noteStringToNoteNumberMap = 
    new Array(128).fill(null).map((v, ndx) => 
        (['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'])[ndx%12]+''+Math.floor(ndx/12)
    ).reduce((prev, curr, ndx) => {
        prev[curr] = ndx;
        return prev;
    }, {});


class Pattern {
    constructor() {
        this.currentbeat = 0;
    }

    waitForBeat(beatNo) {
        
        return new Promise((resolve, reject) =>
            setTimeout(() => {
                this.currentbeat = beatNo;
                resolve();
            },
                ((beatNo / bpm) * (60*1000)) - 
                    (Date.now() -
                    startTime)
            )
        );
    }

    async playNote(note, duration) {
        output.sendMessage([0x90, noteStringToNoteNumberMap[note], 127]);
        await this.waitForBeat(this.currentbeat + duration);
        output.sendMessage([0x90, noteStringToNoteNumberMap[note], 0]);
    }    
}

const pattern1 = new class extends Pattern {
    async play() {
        this.playNote('c5', 1);
        await this.waitForBeat(1);
        this.playNote('d5', 1);
        await this.waitForBeat(2);
        this.playNote('e5', 1);
        await this.waitForBeat(3);
        this.playNote('f5', 1);
        await this.waitForBeat(4);
        this.playNote('g5', 1);
    }
};
  
const pattern2 = new class extends Pattern {
    async play() {
        this.playNote('e5', 2);
        await this.waitForBeat(2);
        this.playNote('g5', 2);
        await this.waitForBeat(4);
        this.playNote('b5', 2);
        
    }
};
pattern1.play();
pattern2.play();

