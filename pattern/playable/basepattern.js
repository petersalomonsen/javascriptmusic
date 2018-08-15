const Pattern = require('../pattern.class.js');
const patterns = {
    'basic': [        
        [['c3', 100]],
        [['c3', 100]],
        [['c3', 100]],
        [['c3', 100]], 
        [],             
        [['c3', 100]], 
        [],             
        [['c3', 100]]                
    ]    
};

class BasePattern extends Pattern {
    constructor(output) {
        super(output);
        this.stepsperbeat = 4;
        this.offset = 0;
        this.channel = 3;
    }

    async play(patternName, transpose) {           
        this.offset = Math.round(global.currentBeat());      
                        
        const rows = patterns[patternName];
                            
        for(let ndx=0;ndx<rows.length;ndx++) {                        
            await this.waitForStep(ndx);
            const row = rows[ndx];
            
            row.forEach((note) => {
                this.velocity = note[1];
                this.note(this.toNoteNumber(note[0]) + transpose, 0.5 / this.stepsperbeat);
            });            
        }        
    }
}

module.exports = BasePattern;