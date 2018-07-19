const Pattern = require('./pattern/pattern.class.js');

const midi = require('midi');
global.startTime = Date.now();
global.bpm = 120;

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
        this.setChannel(1);
        this.velocity = 127;
        
        while(true) {            
            this.playNote('c3', 1);
            this.playNote('g#3', 1);
            await this.waitForBeat(1);
            
            this.playNote('e3', 1); 
            this.playNote('g#3', 1);
            await this.waitForBeat(2);
            this.playNote('g#3', 1);               
            await this.waitForBeat(2.5);
            this.playNote('c3', 1);
            await this.waitForBeat(3);
            this.playNote('g#3', 1);               
            this.playNote('e3', 1);   
            await this.waitForBeat(4); 
            this.offset+=4;            
        }
    }
};
  
const pattern2 = new class extends Pattern {
    constructor() {
        super(output);
    }
    async play() {
        this.channel = 2;
        this.velocity = 50;
        while(true) {   
            await this.waitForBeat(0); 
            this.playNote('c6', 0.5);
            this.playNote('d#6', 0.5);
            this.playNote('g6', 0.5);
            await this.waitForBeat(1.3); 
            this.playNote('c6', 0.5);
            this.playNote('f6', 0.5);
            this.playNote('g6', 0.5);
            await this.waitForBeat(3); 
            this.playNote('c6', 0.5);
            this.playNote('d6', 0.5);
            this.playNote('g6', 0.5);
            await this.waitForBeat(8); 
            this.offset+=8;      
        }
    }
};
pattern1.play();
pattern2.play();

