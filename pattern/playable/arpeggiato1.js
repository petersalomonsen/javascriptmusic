const Pattern = require('../pattern.class.js');

class Arpeggiator extends Pattern {
    constructor(output) {
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
            [-5, 0, 2, 3, 7, 3, 2, 0],
            [-5, 0, 5, 7, 5, 0, -5, 0]
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
}

module.exports = Arpeggiator;