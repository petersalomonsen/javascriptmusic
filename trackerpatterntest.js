const output = require('./midi/output.js');
const TrackerPattern = require('./pattern/trackerpattern.class.js');

const ch4 = new TrackerPattern(output, 3, 2);
const ch2 = new TrackerPattern(output, 1, 4);
const ch7 = new TrackerPattern(output, 6, 2);
const ch6 = new TrackerPattern(output, 5, 2);
// output.solo([6]);
(async function() {
    
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

    const littlepat2 = [
        [0, c6(2/3, 100), pitchbend(0, 0x2000, 1/2, 8)],
        [1/2, as5(1/4, 100)],
        [2/2, g5(1/4, 100)],
        [3/2, fs5(2/3, 100), pitchbend(0x1000, 0x2000, 1/2, 8)],
        [4/2, f5(1/4, 100)],
        [5/2, e5(1/4, 100)],
        [6/2, c5(1/4, 100)],
        [6.5/2, fs5(1/4, 60)],
        [7/2, g5(1/4, 100)]
    ];

    const intro = () => new TrackerPattern().play([
            [4, drumbase, () => ch7.play([
                [0, c4(), c5(), d5(), g5(), controlchange(10, 0, 127, 2, 16), controlchange(7, 50, 127, 2, 16)]                
                ]), () => ch6.play(littlepat)
            ],
            [4, drumbase, () => ch7.play([
                [0, as3(), as4(), c5(), f5(), controlchange(10, 127, 0, 2, 16)]
                ])
            ],
            [4, drumbase, () => ch7.play([
                [0, a3(), a4(), c5(), f5(), controlchange(10, 0, 127, 2, 16)]
                ]), () => ch6.play(littlepat2)
            ],
            [4, drumbase, () => ch7.play([
                [0, c4(), g4(), c5(), e5(), controlchange(10, 127, 0, 2, 16)]
                ])
            ]
        ], 1);

    new TrackerPattern()
        .play([
            [16, intro],
            [16, intro],
            [16, intro],
            [16, intro]
        ], 1);

    
})();