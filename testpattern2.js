const Pattern = require('./pattern/pattern.class.js');

const midi = require('midi');
global.startTime = Date.now();
global.bpm = 100;

// Set up a new output.
const output = new midi.output();
let outputIndex;
for(var n=0;n<output.getPortCount(); n++) {
    if(output.getPortName(n) === 'virtual1') {
        outputIndex = n;
    }
}
output.openPort(outputIndex);

const pattern1 = new class extends Pattern {
    constructor() {
        super(output);
    }
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
    constructor() {
        super(output);
    }
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

