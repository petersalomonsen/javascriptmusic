const output = require('../midi/output.js');
const TrackerPattern = require('../pattern/trackerpattern.class.js');
const Recorder = require('../midi/recorder.class.js');
const recorder = new Recorder(5, output);

global.bpm = 100;

const ch2 = new TrackerPattern(output, 1, 4);
ch2.play([
    controlchange(0, 7, 90, 90)
]);


const ch1 = new TrackerPattern(output, 0, 4);

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
    
    while(true) {
        recorder.start();
        await new TrackerPattern()
            .play([
                [4, drumpattern],
                [4, drumpattern],
                [4, drumpattern],
                [4, drumpattern]
            ], 1);
        recorder.save();
    }
})();