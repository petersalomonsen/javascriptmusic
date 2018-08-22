const Pattern = require('./pattern/pattern.class.js');
const output = require('./midi/output.js');
const recorder = require('./midi/recorder.js');
const TrackerPattern = require('./pattern/trackerpattern.class.js');

const fs = require('fs');

global.startTime = Date.now();
global.bpm = 110;
global.currentBeat = () =>
    ((Date.now() -
        global.startTime)/
        (60*1000)
) * global.bpm; 
                        
const midi = require('midi');

const ch1 = new TrackerPattern(output, 0, 4);
ch1.velocity = 50;
const ch2 = new TrackerPattern(output, 1, 4);

(async function() {
    let beat = 0;

    while(true) {
        ch2.play([
            [0, c3()],
            [1, e3()],
            [2.5, c3()],
            [3, e3()]
        ]);
        ch1.play([
            [0, c5(),  d5(1, 100, 1)],
            [3, e5(1, 100, -1), f5()]
        ]);
        
        beat +=4;
        console.log(beat);
        await waitForBeat(beat);
    }
   
})();