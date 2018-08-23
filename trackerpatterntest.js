const output = require('./midi/output.js');
const TrackerPattern = require('./pattern/trackerpattern.class.js');

const ch4 = new TrackerPattern(output, 3, 2);
const ch2 = new TrackerPattern(output, 1, 4);
const ch7 = new TrackerPattern(output, 6, 2);
const ch6 = new TrackerPattern(output, 5, 2);
// output.solo([1,3, 5]);
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
        
    const littlepat = [
        [0, c5(2/3, 100), pitchbend(0, 0x2000, 1/2, 8)],
        [1/2, g5(1/4, 100)],
        [2/2, f5(1/4, 100)],
        [3/2, g5(2/3, 100), pitchbend(0x1000, 0x2000, 1/2, 8)],
        [4/2, as5(1/4, 100)],
        [5/2, a5(1/4, 100)],
        [6/2, f5(1/4, 100)],
        [6.5/2, fs5(1/4, 60)],
        [7/2, g5(1/4, 100)],
    ];

    for(let lp = 0; lp < 10 ; lp++) {
        ch6.play(littlepat);
        
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
        ch6.play(littlepat);
        ch7.play([
            [0, a3(), a4(), c5(), f5()]
            
        ]);
        await waitForBeat(beat+=4);    

        drumbase();
        ch7.play([
            [0, c4(), g4(), c5(), e5()]
            
        ]);
        await waitForBeat(beat+=4);    
    }
})();