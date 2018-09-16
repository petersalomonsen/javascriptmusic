const Pattern = require('./pattern.class.js');

// Note functions
new Array(128).fill(null).map((v, ndx) => 
    (['c','cs','d','ds','e','f','fs','g','gs','a','as','b'])[ndx%12]+''+Math.floor(ndx/12)
).forEach((note, ndx) => global[note] = (duration, velocity, offset) => async (pattern, rowbeat) => {    
    await pattern.waitForBeat(rowbeat + (offset ? offset : 0));          
    pattern.velocity = velocity ? velocity : pattern.defaultvelocity;
    if(!duration) {
        duration = 1 / pattern.stepsperbeat;
    }    
    pattern.note(ndx, duration);
});

global.pitchbend = (start, target, duration, steps) => async (pattern, rowbeat) => {
    await pattern.waitForBeat(rowbeat);
    pattern.pitchbend(start, target, duration, steps);
};

global.controlchange = (controller, start, target, duration, steps) => async (pattern, rowbeat) => {
    await pattern.waitForBeat(rowbeat);
    pattern.controlchange(controller, start, target, duration, steps)
};

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
                
        if(typeof rows[0]==='function') {                        
            rows = [[0].concat(rows)];
        }
        for(let ndx=0;ndx<rows.length;ndx++) {
            const cols = rows[ndx];
            
            if(!rowbeatcolumnmode) {
                rowbeat = cols[0];
            }
            
            for(let colndx = 1; colndx < cols.length; colndx++) {
                const col = cols[colndx];                       
                if(col.constructor.name === 'AsyncFunction') {
                    col(this, rowbeat);                
                } else {
                    (async () => {                        
                        await this.waitForBeat(rowbeat);                        
                        col(this, rowbeat);
                    })();
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