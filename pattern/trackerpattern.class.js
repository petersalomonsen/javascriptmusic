const Pattern = require('./pattern.class.js');

// Note functions
new Array(128).fill(null).map((v, ndx) => 
    (['c','cs','d','ds','e','f','fs','g','gs','a','as','b'])[ndx%12]+''+Math.floor(ndx/12)
).forEach((note, ndx) => eval(`global.${note} = (duration, velocity, offset) => [${ndx}, duration, velocity, offset];`));

global.pitchbend = (start, target, duration, steps) => (pattern) => pattern.pitchbend(start, target, duration, steps);
global.controlchange = (controller, start, target, duration, steps) => (pattern) => pattern.controlchange(controller, start, target, duration, steps);

class TrackerPattern extends Pattern {
    constructor(output, channel, stepsperbeat, defaultvelocity = 100) {
        super(output);            
        this.channel = channel;
        this.stepsperbeat = stepsperbeat;
        this.defaultvelocity = defaultvelocity;
    }
    
    async play(rows, rowbeatcolumnmode) {           
        this.offset = Math.round(global.currentBeat());                              
                      
        let rowbeat = 0;

        for(let ndx=0;ndx<rows.length;ndx++) {
            const cols = rows[ndx];
            
            if(!rowbeatcolumnmode) {
                rowbeat = cols[0];
            }
            
            for(let colndx = 1; colndx < cols.length; colndx++) {
                const col = cols[colndx];
                if(typeof col === 'function' ) {
                    await this.waitForBeat(rowbeat);     
                    this.velocity = this.defaultvelocity;               
                    col(this);
                } else {
                    const note = col[0];
                    const duration = col[1] ? col[1] : 1 / this.stepsperbeat;
                    const velocity = col[2] ? col[2] : this.defaultvelocity;
                    const offset = col[3] ? col[3] : 0;

                    await this.waitForBeat(rowbeat + offset);                                
                    this.velocity = velocity;
                    this.note(note, duration);
                }
            };   
            
            if(rowbeatcolumnmode===1) {
                rowbeat += cols[0];
            }
        }   
        await this.waitForBeat(rowbeat);      
    }
}

module.exports = TrackerPattern;