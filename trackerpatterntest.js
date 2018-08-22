const output = require('./midi/output.js');
const TrackerPattern = require('./pattern/trackerpattern.class.js');

const ch4 = new TrackerPattern(output, 3, 2);
const ch2 = new TrackerPattern(output, 1, 4);
const ch7 = new TrackerPattern(output, 6, 2);

(async function() {
    let beat = 0;
    function drumbase() {
        ch2.play([
            [0, c3(), gs3()],
            [1, ds3(), gs3()],
            [2, gs3()],
            [2.5, c3()],
            [3, ds3(), gs3()]
        ]);
        ch4.play([
            [0, c3()],
            [0.5, c4()],
            [1.5, c4( 0.25, 100)],
            [2.25, c4( 0.15, 80)],
            [2.5, c3( 0.25, 100)],
            [3, c4( 0.25, 100)],
            [3.5, c3( 0.10, 100)]
        ]);
    }
        
    drumbase();
    ch7.play([
        [0, c4(), c5(), d5(), g5()]
        
    ]);
    await waitForBeat(beat+=4);    
    drumbase();
    ch7.play([
        [0, as3(), as4(), c5(), f5()]
        
    ]);
    await waitForBeat(beat+=4);    
    drumbase();
    ch7.play([
        [0, a3(), a4(), c5(), f5()]
        
    ]);
    await waitForBeat(beat+=4);    

    drumbase();
    ch7.play([
        [0, c4(), g4(), c5(), e5()]
        
    ]);
    await waitForBeat(beat+=4);    

})();