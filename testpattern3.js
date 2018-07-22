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

const pattern = (new class extends Pattern {
    constructor() {
        super(output);
        this.stepsperbeat = 4;
        this.offset = 0;
        this.channel = 4;
    }
    async play(variation, basenote) {
        
        const variations = [
            [0, 2, 3, 7, 12, 7, 3, 2],
            [0, 2, 4, 7, 12, 7, 4, 2],
            [4, 5, 7, 12, 7, 5, 4, 0],
            [3, 5, 7, 12, 7, 5, 3, 0],
            [-5, 0, 2, 4, 7, 4, 2, 0],
            [-5, 0, 2, 3, 7, 3, 2, 0]
        ];

        const notes = variations[variation];
                
        for(let ndx=0;ndx<notes.length;) {
            await this.waitForStep(ndx++);
            this.velocity = Math.floor(Math.random() * 64 + 16);
            const note = this.toNoteNumber(basenote) + notes[ndx%notes.length];
            this.note(note, 1 / this.stepsperbeat);
            (async () => {
                await this.waitForStep(ndx + 2);
                this.velocity = Math.floor(this.velocity * (1/3));
                this.note(note+12, 1 / this.stepsperbeat * 2);
            })();
        }
        this.offset += notes.length / this.stepsperbeat;
    }
});
(async function() {
    while(true) {
        await pattern.play(0, 'c5');
        await pattern.play(0, 'c5');
        await pattern.play(2, 'a#4');
        await pattern.play(2, 'a#4');
        await pattern.play(0, 'f5');
        await pattern.play(0, 'f5');
        await pattern.play(2, 'd#5');
        await pattern.play(2, 'd#5');
    }
})();