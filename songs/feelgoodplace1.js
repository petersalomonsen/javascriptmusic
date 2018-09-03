const output = require('../midi/output.js');
const TrackerPattern = require('../pattern/trackerpattern.class.js');
const Recorder = require('../midi/recorder.class.js');
const recorder = new Recorder('songs');
const fs = require('fs');
const RecordedPattern = require('../pattern/recordedpattern.class.js');
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
const ch5 = new TrackerPattern(output, 4, 8);
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
    
    const drumpattern2 = () => ch2.play([
        [0, c3(1, 100), gs3()],
        [3/6, fs3()],
        [5 / 6, gs3()],
        [6/6, c3(), gs3(), e3(1, 127)],
        [9/6, fs3(1/6, 100)],
        [12 / 6, c3(), cs3()],        
        [15 / 6, fs3()],
        [17 / 6, c3(0.5, 50)],
        [18 / 6, c3(1, 100), e3(1, 127), gs3()],
        [21 / 6, c3(1, 80), fs3()],
    ]);
    
    const strings = () => ch7.play([
        [0, a4(), d5(), fs5()],
        [3/2, g4(), c5(), e5()],
        [8/2, b4(), e5(), g5()],
        [11/2, a4(), d5(), fs5()]
    ]);

    const strings2 = () => ch7.play([
        [0, g3(3/2), b4(3/2), d5(3/2), g5(3/2)],
        [3/2, f3(5/2), c5(5/2), e5(5/2), g5(5/2)],
        [8/2, d3(3/2), c5(3/2), f5(3/2), a5(3/2)],
        [11/2, c3(5/2), c5(5/2), e5(5/2), g5(5/2)]
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

    const bass2 = () => ch8.play([
        [0, g3(3/6, 110)],
        [ 4/4, g4(1/6, 110)],
        [ 7/4, f3(1/6, 110)],  
        [ 10/4, f4(1/6, 110)],
        [ 16/4, d3(3/6, 110)],
        [ 20/4, d4(1/6, 110)],
        [ 23/4, c3(1/6, 110)],
        [ 24/4 + 2/6, c4(1/6, 110)],
        [ 24/4 + 3/6, c3(1/6, 110)],
        [ 24/4 + 5/6, cs4(1/12, 110)],
        [ 24/4 + 6/6, d4(1/6, 110)],
        [ 24/4 + 9/6, f4(1/6, 110)]
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

    const melody2 = () => ch5.play([
        [0, controlchange(7, 100, 100)],
        [3/4, d5()],
        [4/4, g5()],
        [5/4, a5()],
        [6/4, b5()],
        [7/4, c6(1), pitchbend(0x1000, 0x2000, 1/4, 8)],
        [9/4, b5()],
        [10/4, a5()],
        [12/4, g5()],
        [13/4, d6(1),  pitchbend(0x1000, 0x2000, 1/4, 8)]
    ]);

    const fgtake1 = new RecordedPattern(output, JSON.parse(fs.readFileSync('songs/fgtake1.json')));
    while(true) {
        recorder.start();
        await new TrackerPattern()
            .play([
                [4, drumpattern, strings, bass, melody],
                [4, drumpattern, melody],
                [4, drumpattern, strings, bass, melody],
                [4, drumpattern, melody],
                [4, drumpattern, strings, bass],
                [4, drumpattern],
                [4, drumpattern, strings, bass],
                [4, drumpattern],
                [4, drumpattern2, bass2, strings2],
                [4, drumpattern2],
                [4, drumpattern2, bass2, strings2, () => fgtake1.play()],
                [4, drumpattern2],
                [4, drumpattern2, bass2, strings2],
                [4, drumpattern2]
            ], 1);        
        recorder.save();        
    }   
})();