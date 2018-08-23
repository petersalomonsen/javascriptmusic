const Pattern = require('./pattern.class.js');

// Note functions
new Array(128).fill(null).map((v, ndx) => 
    (['c','cs','d','ds','e','f','fs','g','gs','a','as','b'])[ndx%12]+''+Math.floor(ndx/12)
).forEach((note, ndx) => eval(`global.${note} = (duration, velocity, offset) => [${ndx}, duration, velocity, offset];`));

global.pitchbend = (start, target, duration, steps) => (pattern) => pattern.pitchbend(start, target, duration, steps);

class TrackerPattern extends Pattern {
    constructor(output, channel, stepsperbeat) {
        super(output);            
        this.channel = channel;
        this.stepsperbeat = stepsperbeat;
    }

    async play(rows) {           
        this.offset = Math.round(global.currentBeat());                              
                            
        for(let ndx=0;ndx<rows.length;ndx++) {
            const cols = rows[ndx];
            const rowbeat = cols[0];
            
            for(let colndx = 1; colndx < cols.length; colndx++) {
                const col = cols[colndx];
                if(typeof col === 'function' ) {
                    await this.waitForBeat(rowbeat);                    
                    col(this);
                } else {
                    const note = col[0];
                    const duration = col[1] ? col[1] : 1 / this.stepsperbeat;
                    const velocity = col[2] ? col[2] : this.velocity;
                    const offset = col[3] ? col[3] : 0;

                    await this.waitForBeat(rowbeat + offset);                                
                    this.velocity = velocity;
                    this.note(note, duration);
                }
            };            
        }        
    }
}

module.exports = TrackerPattern;