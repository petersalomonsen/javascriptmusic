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
lead2.play([controlchange(7, 105, 105), controlchange(10, 90, 90)]);
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

    const drumpattern2 = () => drums.play([
        [0, c3(1, 110), gs3(1, 80)],
        [1/2, gs3(1, 30)],
        [1, c3(1, 110), d3(1, 120), gs3(1, 80)],
        [1 + 1/2, gs3(1, 40)],
        [2, gs3(1, 80), c3(1, 110)],        
        [2 + 1/2, gs3(1, 40)],
        [3,  d3(1, 120), gs3(1, 80)],
        [3 + 1/4, c3(1, 110)],
        [3 + 1/2, fs3(1, 60)],
        [3 + 3/4, c3(1, 60)],
        [4 + 0, c3(1, 110), gs3(1, 80)],
        [4 + 1/2, gs3(1, 30)],
        [4 + 1, c3(1, 110), d3(1, 120), gs3(1, 80)],
        [4 + 1 + 1/2, gs3(1, 40)],
        [4 + 2, gs3(1, 80), c3(1, 110)],        
        [4 + 2 + 1/2, gs3(1, 40)],
        [4 + 3,  c3(1, 110), d3(1, 120), gs3(1, 80)],        
        [4 + 3 + 1/2, fs3(1, 80), d3(1/16, 100)],
        [4 + 3 + 3/4, c3(1, 60), d3(1/16, 120)]
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
        const introbeat2 = () => drums.steps(4, [
            [c3, gs3(1/8,50)], gs3(1/8,20), gs3(1/8,50), gs3(1/8,20),
            [c3, gs3(1/8,50)], gs3(1/8,20), gs3(1/8,50), [gs3(1/8,20), d3(1/8, 110)],
            [c3, gs3(1/8,50)], [gs3(1/8,20), d3(1/8, 110)], gs3(1/8,50), gs3(1/8,20),
            [c3, gs3(1/8,50), ds3(1, 60)], gs3(1/8,20), gs3(1/8,50), gs3(1/8,20)
        ]);

        const ddbase = () => base.play([
            [0, g3()],
            [1 + 3/4, g4()],
            [2 + 1/4, g4(1/8)],
            [2 + 2/4, g3(1/4)],
            [3 , d4(1/4)],
            [3 + 1/2, f4(1/4)]
        ]);
                
        
        const intro = async () => new TrackerPattern().play([
            [4, () => upbeatintrolead.play(), 
                kickbeat, 
                ddbase,
                () => strings.play([g4(8), d5(8), b5(8)]),
            ],
            [4, kickbeat, ddbase],
            [4, kickbeat, ddbase,
                () => strings.play([f4(8), c5(8), a5(8)]),
            ],
            [4, () => drums.steps(4, [c3,,,,c3,,,d3,c3,d3(1/4, 110),,,[c3,d3(1/4, 110),ds3(1/4, 70)],,,d3(1/4, 90)]), ddbase],
            [4, introbeat2, ddbase,
                () => strings.play([g4(8), d5(8), b5(8)]),
            ],
            [4, introbeat2, ddbase],
            [4, introbeat2, ddbase,
                () => strings.play([f4(8), c5(8), a5(8)]),
            ],
            [4, introbeat2, ddbase]
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
        
        const chargeup = async () => new TrackerPattern().play([
                [2, () => base.steps(4, [a2,,,a3,,a3(1/16),a2]), drumpattern2,
                     () => lead2.steps(4,
                        [[d6(2), pitchbend(0x1000, 0x2000, 1/8, 8)],,,,
                          c6, b5, a5, g5, d5(2),,,,,,,,
                          e5,,g5(1/4,80),,g5,,a5(1/4,80),,b5,,[d6(1/2, 90),
                            b5(1/2, 90), pitchbend(0,0x2000,1/8, 8)],,
                            [a5(1/4,90),c6(1/4,90)],
                            [b5(1/8, 100), g5(1/8, 100)],[a5,d5],g6(1/32, 80)
                        ]),
                    () => strings.play([
                        [0, a4, c5],
                        [2, b4, d5],
                        [4, d5, g5],
                        [6, d5, fs5,  a5]
                    ])
                ],
                [2, () => base.steps(4, [b2,,,b3,,b3(1/16),b2])],
                [2, () => base.steps(4, [c3,,c4,,g5(1/16),c4(1/8),g3(1/16),c4(1/32)])],
                [2, () => base.steps(4, [d3,,d4,d3,,d3(1/32),d4,d3(1/32)])]
            ],1);

        const realchorus = async () => new TrackerPattern().play([
            [
                4, () => base.steps(4, [a3,,a3(1/16,50),a4,a5(1/16,60),a4(1/16),b3, , e4, , e5(1/16), e5(1/16,40), fs4, , g4,g5(1/16,40)]),
                () => drums.steps(4, [c3,,,,[c3,e3],,,d3(1/16,90),c3,,,d3(1/16,60),[c3,e3]]),
                () => drums.steps(4, [
                        gs3(1/8,30),
                        gs3(1/8,30),
                        gs3(1/8,80),
                        gs3(1/8,30),
                        gs3(1/8,30),
                        gs3(1/8,80),
                        gs3(1/8,30),
                        gs3(1/8,30),                        
                        gs3(1/8,80),
                        gs3(1/8,30),
                        gs3(1/8,30),
                        fs3(1/8,40),                        
                        gs3(1/8,30),
                        gs3(1/8,30),
                        fs3(1/8,40),
                        gs3(1/8,30)                        
                    ]),
                () => lead.steps(4, [
                    [c5(1/2),c6(1/2), e6(1/2)]
                    ,
                    ,
                    ,[c5(1/2), c6(1/2), e6(1/2)]
                    ,
                    ,[c6(1/8,70), c7(1/8,70), e7(1/8,70)]
                    ,[d5(1/2), d6(1/2), fs6(1/2)]
                    ,
                    ,[e5, e6, g6]
                ])
            ],
            [
                4, () => base.steps(4, [g4,,g5(1/16,50),g5,g4(1/16,60),g4(1/16),d3, , c4, , c5(1/16), b5(1/16,40), b4, , g4,b5(1/16,40)]),
                () => drums.steps(4, [c3,,,,[c3,e3],,,d3(1/16,90),c3,,,d3(1/16,60),[c3,e3]]),
                () => drums.steps(4, [
                        gs3(1/8,30),
                        gs3(1/8,30),
                        gs3(1/8,80),
                        gs3(1/8,30),
                        gs3(1/8,30),
                        gs3(1/8,80),
                        gs3(1/8,30),
                        gs3(1/8,30),                        
                        gs3(1/8,80),
                        gs3(1/8,30),
                        gs3(1/8,30),
                        fs3(1/8,40),                        
                        gs3(1/8,30),
                        gs3(1/8,30),
                        fs3(1/8,40),
                        gs3(1/8,30)                        
                    ]),                    
                () => lead.steps(4, [
                    [g5(1/2),g6(1/2), b6(1/2)]
                    ,
                    ,
                    ,[g5(1/2), g6(1/2), b6(1/2)]
                    ,
                    ,[g6(1/8,70), g7(1/8,70), b7(1/8,70)]
                    ,[d5(1/2), d6(1/2), fs6(1/2)]
                    ,
                    ,[c5, e6, g6]
                ])
            ]
        ],1);
        
        
        //await intro();
        
       // await chorus();
       // await chorus();
        await chargeup();
        await realchorus();
        await realchorus();
    }
})();