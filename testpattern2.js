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

const pattern3 = new class extends Pattern {
    constructor() {
        super(output);
    }
    async play() {
        this.channel = 3;
        this.velocity = 100;
        
        await this.waitForBeat(0); 
        this.playNote('c3', 0.5);
        await this.waitForBeat(0.5); 
        this.playNote('c4', 0.25);
        await this.waitForBeat(2.5); 
        this.playNote('c3', 0.25);
        await this.waitForBeat(2.75); 
        this.playNote('c4', 0.25);
        await this.waitForBeat(3.5); 
        this.playNote('c3', 0.15);
        await this.waitForBeat(4); 
        
        this.playNote('c3', 0.5);
        await this.waitForBeat(4.5); 
        this.playNote('a#3', 0.25);
        await this.waitForBeat(6.5); 
        this.playNote('c3', 0.25);
        await this.waitForBeat(6.75); 
        this.playNote('a#3', 0.25);
        await this.waitForBeat(7.5); 
        this.playNote('c4', 0.5);

        await this.waitForBeat(8); 
            
        
    }
};

const pattern4 = new class extends Pattern {
    constructor() {
        super(output);
    }
    async play() {
        
        this.channel = 3;
        this.velocity = 100;
            
        
        await this.waitForBeat(0); 
        this.playNote('g#2', 0.5);
        await this.waitForBeat(0.5); 
        this.playNote('g#3', 0.25);
        await this.waitForBeat(2.5); 
        this.playNote('g#2', 0.25);
        await this.waitForBeat(2.75); 
        this.playNote('g#3', 0.25);
        await this.waitForBeat(3.5); 
        this.playNote('g#2', 0.15);
        await this.waitForBeat(4); 
        
        this.playNote('g2', 0.5);
        await this.waitForBeat(4.5); 
        this.playNote('g3', 0.25);
        await this.waitForBeat(6.5); 
        this.playNote('g2', 0.25);
        await this.waitForBeat(6.75); 
        this.playNote('g3', 0.25);
        await this.waitForBeat(7.5); 
        this.playNote('g2', 0.5);

        await this.waitForBeat(8);                     
            
        
    }
};

pattern1.play();
pattern2.play();

(async function() {
    pattern4.offset = 8;
    while(true) {
        console.log('pattern 3');
        await pattern3.play();
        pattern3.offset += 16;
        
        console.log('pattern 4');
        await pattern4.play();
        pattern4.offset += 16;
    }
})();

(new class extends Pattern {
    constructor() {
        super(output);
        this.stepsperbeat = 4;
        this.offset = 16;
    }
    async play() {
        
        const notes = [0, 2, 3, 7, 12, 7, 3, 2];
        let ndx = 0;
        while(true) {
            await this.waitForStep(ndx++);
            this.velocity = Math.floor(Math.random() * 64 + 16);
            const note = this.toNoteNumber('c5') + notes[ndx%notes.length];
            this.note(note, 1 / this.stepsperbeat);
            (async () => {
                await this.waitForStep(ndx + 2);
                this.velocity = Math.floor(this.velocity * (2/3));
                this.note(note+12, 1 / this.stepsperbeat * 2);
            })();
        };
        
    }
}).play();