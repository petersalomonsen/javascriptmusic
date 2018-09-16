const output = require('../midi/output.js');
const TrackerPattern = require('../pattern/trackerpattern.class.js');
global.bpm = 120;

const Recorder = require('../midi/recorder.class.js');
const recorder = new Recorder(10, output);

const RecordedPattern = require('../pattern/recordedpattern.class.js');
const upbeatintrolead = new RecordedPattern(output, 'songs/upbeatintrolead.json');
const drums = new TrackerPattern(output, 1, 4);
drums.play([
    controlchange(7, 120, 120)
]);

const strings = new TrackerPattern(output, 6, 4);
strings.play([controlchange(7, 50, 50), controlchange(10, 20, 20)]);

const lead = new TrackerPattern(output, 8, 4);
lead.play([controlchange(7, 100, 100), controlchange(10, 90, 90)]);

const lead2 = new TrackerPattern(output, 5, 4);
const base = new TrackerPattern(output, 7, 4);
base.play([controlchange(7, 110, 110)]);

(async function() {

    const drumpattern = () => drums.play([
        [0, c3(1, 110), gs3(1, 80)],
        [1/2, gs3(1, 30)],
        [1, c3(1, 110), d3(1, 120), gs3(1, 80)],
        [1 + 1/2, gs3(1, 40)],
        [2, gs3(1, 80)],
        [2 + 1/4, c3(1, 110)],
        [2 + 1/2, gs3(1, 40)],
        [3,  d3(1, 120), gs3(1, 80)],
        [3 + 1/4, c3(1, 110)],
        [3 + 1/2, fs3(1, 60)],
        [3 + 3/4, c3(1, 60)]
    ]);

    const basepattern = () => base.play([
        [0, c3(1)],
        [1, c4(1/4)],
        [2, d3(1/4)],
        [2 + 1/4, d4(1/8)],
        [2 + 3/4, d3(1/4)],
        [3, d4(1/4)],
        [3 + 1/2, d3(1/4)],
        [4 + 0, e3(1)],
        [4 + 1, e4(1/4)],
        [4 + 2, b3(1/4)],
        [4 + 2 + 1/4, b4(1/8)],
        [4 + 2 + 3/4, b3(1/4)],
        [4 + 3, b4(1/4)],
        [4 + 3 + 1/2, b3(1/4)]
    ]);    
    while(true) {  
        const kickbeat = () => drums.steps(1, [c3, c3, c3, c3]);
                 
        const ddbase = () => base.play([
            [0, g3()],
            [1 + 3/4, g4()],
            [2 + 1/4, g4(1/8)],
            [2 + 2/4, g3(1/4)],
            [3 , d4(1/4)],
            [3 + 1/2, f4(1/4)]
        ]);
        await new TrackerPattern().play([[4, kickbeat]], 1);
        // recorder.start();
        
        await new TrackerPattern().play([
            [4, () => upbeatintrolead.play(), kickbeat, ddbase,
                () => strings.play([g4(8), d5(8), b5(8)]),
            ],
            [4, kickbeat, ddbase],
            [4, kickbeat, ddbase,
                () => strings.play([f4(8), c5(8), a5(8)]),
            ],
            [4, kickbeat, ddbase],
            [4, kickbeat, ddbase,
                () => strings.play([g4(8), d5(8), b5(8)]),
            ],
            [4, kickbeat, ddbase],
            [4, kickbeat, ddbase,
                () => strings.play([f4(8), c5(8), a5(8)]),
            ],
            [4, kickbeat, ddbase]
        ], 1);
        // recorder.save();

        const chorus = async () => new TrackerPattern()
            .play([
                [2, drumpattern, basepattern, () => strings.play([[0, c5(2), e5(2)]]),
                    () => lead.play([
                        [0, b6(1/4)],
                        [1/2, b6(1/4)],
                        [1, a6(1/4)],
                        [1 + 1/2, g6(1/4)],
                        [2 , a6(1/4)],
                        [2 + 3/4, d7(1/4)]
                    ])
                ],
                [2, () => strings.play([[0, d5(2), fs5(2)]]),
                    () => lead.play([
                        [2 + -1/4, b6(1/4)],
                        [2 + 1/2, b6(1/4)],
                        [2 + 1, a6(1/4)],
                        [2 + 1 + 1/2, g6(1/4)],
                        [2 + 2 , a6(1/4)],
                        [2 + 2 + 2/4, b6(1/4)],
                        [2 + 2 + 3/4, a6(1/4)],
                        [2 + 3 + 1/4, g6(1/4)]
                ])
                ],
                [2, drumpattern, () => strings.play([[0, e5(2), g5(2)]])],
                [2, () => strings.play([[0, b4(2), d5(2)]])]
            ], 1);    
        await chorus();
        await chorus();  
    } 
})();