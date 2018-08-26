const output = require('../midi/output.js');
const TrackerPattern = require('../pattern/trackerpattern.class.js');

global.bpm = 100;

const ch4 = new TrackerPattern(output, 3, 2);
const ch2 = new TrackerPattern(output, 1, 4);
ch2.play([
    controlchange(0, 7, 90, 90)
]);
const ch7 = new TrackerPattern(output, 6, 2);
ch7.play([[0, 
        controlchange(10, 64, 64),
        controlchange(7, 100, 80)]
    ]);
 // output.mute([5]);
const ch6 = new TrackerPattern(output, 5, 2);
ch6.play([[
    0,controlchange(7, 127, 127)
]],0);
const ch8 = new TrackerPattern(output, 7, 2);

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
       [0, d3(10/6, 110)],
       [ 11/6, c4(1/6, 110)],
       [ 14/6, c4(1/6, 110)],
       [ 15/6, c3(3/6, 110)],
       [ 4, e3(11/6, 110)],
       [ 4 + 11/6, d4(1/6, 110)],
       [ 4 + 14/6, d4(1/6, 110)],
       [ 4 + 15/6, d3(2/6, 110)],
       [ 4 + 17/6, gs3(1/6, 110)],
       [ 4 + 18/6, a3(3/6, 110)],
       [ 4 + 21/6, c4(3/6, 110)]       
    ]);

    const melody = () => ch6.play([
        [0, d5(1/4), controlchange(10, 64, 20, 1/4, 4)],
        [3/4, d5(1/4)],
        [4/ 4, a5(1/4),  controlchange(10, 64, 100, 1/4, 4)],
        [7/4 , d5(1/4)],
        [9 / 4, d5(1/4),  controlchange(10, 64, 20, 1/4, 4)],
        [11 / 4, d5(1/4)],
        [12 / 4, a5(), pitchbend(0x1000, 0x2000, 1/4, 8),  controlchange(10, 64, 90, 1/4, 4)],
        [14 / 4, e5()],
    ]);

    new TrackerPattern()
        .play([
            [4, drumpattern, strings, bass, melody],
            [4, drumpattern, melody],
            [4, drumpattern, strings, bass, melody],
            [4, drumpattern, melody],
            [4, drumpattern, strings, bass],
            [4, drumpattern],
            [4, drumpattern, strings, bass],
            [4, drumpattern]
        ], 1);

})();