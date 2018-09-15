const output = require('../midi/output.js');
const TrackerPattern = require('../pattern/trackerpattern.class.js');
global.bpm = 120;

const drums = new TrackerPattern(output, 1, 4);
drums.play([
    controlchange(7, 110, 110)
]);

const strings = new TrackerPattern(output, 6, 4);
strings.play([controlchange(7, 65, 65)]);

const lead = new TrackerPattern(output, 8, 4);
lead.play([controlchange(7, 105, 105)]);

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
        
        await new TrackerPattern()
            .play([
                [2, drumpattern, basepattern, () => strings.play([[0, c4(2), e4(2)]]),
                    () => lead.play([
                        [0, b6(1/4)],
                        [1/2, b6(1/4)],
                        [1, a6(1/4)],
                        [1 + 1/2, g6(1/4)],
                        [2 , a6(1/4)],
                        [2 + 3/4, d7(1/4)]
                    ])
                ],
                [2, () => strings.play([[0, d4(2), fs4(2)]]),
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
                [2, drumpattern, () => strings.play([[0, e4(2), g4(2)]])],
                [2, () => strings.play([[0, b3(2), d4(2)]])]
            ], 1);         
    }   
})();