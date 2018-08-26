const output = require('../midi/output.js');
const TrackerPattern = require('../pattern/trackerpattern.class.js');

global.bpm = 100;

const ch4 = new TrackerPattern(output, 3, 2);
const ch2 = new TrackerPattern(output, 1, 4);
const ch7 = new TrackerPattern(output, 6, 2);
ch7.play([[0, 
        controlchange(10, 64, 64),
        controlchange(7, 100, 80)]
    ]);
// output.mute([6]);
const ch6 = new TrackerPattern(output, 5, 2);

const ch8 = new TrackerPattern(output, 7, 2);
ch7.play([
        controlchange(0, 7, 110, 110)
    ]);
(async function() {

    const drumpattern = () => ch2.play([
        [0, c3(1, 100), gs3()],
        [3/6, fs3()],
        [5 / 6, gs3()],
        [6/6, c3(), gs3(), d3()],
        [9/6, fs3()],
        [12 / 6, c3(), cs3()],        
        [15 / 6, fs3()],
        [17 / 6, c3(0.5, 50)],
        [18 / 6, c3(1, 100), d3(), gs3()],
        [21 / 6, c3(1, 80), fs3()],
    ]);
    
    const strings = () => ch7.play([
        [0, a4(), d5(), fs5()],
        [3/2, g4(), c5(), e5()],
        [8/2, b4(), e5(), g5()],
        [11/2, a4(), d5(), fs5()]
    ]);

    const bass = () => ch8.play([
       [0, d2(3/6, 110)],
       [ 11/6, c3(1/6, 110)],
       [ 14/6, c3(1/6, 110)],
       [ 15/6, c2(1/6, 110)],
       [ 4, e2(3/6, 110)],
       [ 4 + 11/6, d3(1/6, 110)],
       [ 4 + 14/6, d3(1/6, 110)],
       [ 4 + 15/6, d2(1/6, 110)],
       [ 4 + 18/6, a2(3/6, 110)],
       [ 4 + 21/6, c3(3/6, 110)]       
    ]);

    new TrackerPattern()
        .play([
            [4, drumpattern, strings, bass],
            [4, drumpattern],
            [4, drumpattern, strings, bass],
            [4, drumpattern]
        ], 1);

})();