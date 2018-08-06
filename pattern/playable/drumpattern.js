const Pattern = require('../pattern.class.js');


class DrumPattern extends Pattern {
    constructor(output) {
        super(output);
        this.stepsperbeat = 4;
        this.offset = 0;
        this.channel = 1;
    }

    async play() {                
        const rows = 
            [
                [['c3', 100],['f#3', 40]],
                [],
                [['f#3', 30]],
                [],
                [['f#3',40], ['c#3',100]],
                [],
                [['f#3',30]],
                [['c#3',60]],
                [['f#3',60]],
                [],
                [['c3', 100],['f#3', 30],['c#3',40]],
                [],
                [['f#3',40], ['c#3',100]],
                [],
                [['f#3',70]],
                []
            ];
            
                
        for(let ndx=0;ndx<rows.length;) {
            await this.waitForStep(ndx++);
            const row = rows[ndx%rows.length];
            
            row.forEach((note) => {
                this.velocity = note[1];
                this.note(this.toNoteNumber(note[0]), 1 / this.stepsperbeat);
            });
            
        }
        this.offset += rows.length / this.stepsperbeat;
    }
}

module.exports = DrumPattern;