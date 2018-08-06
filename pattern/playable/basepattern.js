const Pattern = require('../pattern.class.js');

class BasePattern extends Pattern {
    constructor(output) {
        super(output);
        this.stepsperbeat = 4;
        this.offset = 0;
        this.channel = 3;
    }

    async play() {                
        const rows = 
            [
                ['c3'],
                [],
                [],
                ['g3'],
                [],
                ['a#3'],
                ['c3'],
                []
            ];
            
                
        for(let ndx=0;ndx<rows.length;) {
            await this.waitForStep(ndx++);
            const row = rows[ndx%rows.length];
            row.forEach((note) => this.note(this.toNoteNumber(note), 1 / this.stepsperbeat));
            
        }
        this.offset += rows.length / this.stepsperbeat;
    }
}

module.exports = BasePattern;