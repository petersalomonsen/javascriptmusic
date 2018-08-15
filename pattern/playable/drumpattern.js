const Pattern = require('../pattern.class.js');

const patterns = {
    'baseandhihats': [        
        [['c3', 100],['fg#3',80]],
        [],
        [['g#3', 20]],
        [['f#3', 80]],
        [],
        [],
        [['c3',100],['g#3',80]],
        [],
        [],
        [['f#3', 80]],
        [],
        [['d#3',10]],
        [['c3',100],['g#3',80]],
        [],
        [['g#3', 20]],
        [['f#3', 80]],
        [],
        [['g#3', 20],['e3',30]],
        [['c3',100],['g#3',80]],
        [],
        [['g#3', 10],['c#3',40]],
        [['f#3', 80],['c#3',60]],
        [],                
        [['c3',30],['g#3', 20]]        
    ],
    'baseandsnare': [
        [['c3', 100],['fg#3',80]],
        [],
        [['g#3', 20]],
        [['f#3', 80]],
        [],
        [],
        [['c3',100],['g#3',80],['e3',100]],
        [],
        [],
        [['f#3', 80]],
        [],
        [['d#3',10]],
        [['c3',100],['g#3',80]],
        [],
        [['g#3', 20]],
        [['f#3', 80]],
        [],
        [['g#3', 20],['e3',30]],
        [['c3',100],['g#3',80],['e3',100]],
        [],
        [['g#3', 10],['c#3',40]],
        [['f#3', 80],['c#3',60]],
        [],                
        [['c3',30],['g#3', 20]]
    ]
};

class DrumPattern extends Pattern {
    constructor(output) {
        super(output);
        this.stepsperbeat = 6;
        this.offset = 0;
        this.channel = 1;
    }

    async play(patternName) {           
        this.offset = Math.round(global.currentBeat());      
                        
        const rows = patterns[patternName];
            
                
        for(let ndx=0;ndx<rows.length;ndx++) {                        
            await this.waitForStep(ndx);
            const row = rows[ndx];
            
            row.forEach((note) => {
                this.velocity = note[1];
                this.note(this.toNoteNumber(note[0]), 0.5 / this.stepsperbeat);
            });            
        }        
    }
}

module.exports = DrumPattern;