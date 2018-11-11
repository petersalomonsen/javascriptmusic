const output = require('../midi/output.js');
const TrackerPattern = require('../pattern/trackerpattern.class.js');
const RecordConverter = require('../pattern/recordconverter.js');
global.bpm = 120;

if(require('../tools/livecodingscheduler').enableLiveRestart()) {
    console.log('livereload');
    return;
}

const Recorder = require('../midi/recorder.class.js');
const recorder = new Recorder(11, output);

const upbeatintrolead = require('./upbeatintrolead.js')

const drums = new TrackerPattern(output, 1, 4);
drums.play([
    controlchange(7, 120, 120)
]);

const rhodes = new TrackerPattern(output, 0, 4);
rhodes.play([controlchange(7, 95), controlchange(10, 40), controlchange(11, 100)]);

const pad = new TrackerPattern(output, 2, 4);
pad.play([controlchange(7, 105, 105), controlchange(10, 72, 72)]);

const strings = new TrackerPattern(output, 6, 4);
strings.play([controlchange(7, 55), controlchange(10, 35)]);

const lead = new TrackerPattern(output, 8, 4);
lead.play([controlchange(7, 105), controlchange(10, 70)]);

const lead2 = new TrackerPattern(output, 5, 4);
lead2.play([controlchange(7, 120), controlchange(11, 110), controlchange(10, 80)]);

const base = new TrackerPattern(output, 7, 4);
base.play([controlchange(7, 70), controlchange(11, 65)]);

const lead3 = new TrackerPattern(output, 11, 4);
lead3.play([controlchange(7, 120), controlchange(11, 120)]);

const subdelaylead = new TrackerPattern(output, 10, 4);
subdelaylead.play([
    controlchange(7, 127),
    controlchange(11, 120),
    controlchange(10, 75)]);

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

    const realchoruslead = () => lead3.play([
        [ 0, e5(3/8, 127) ],
        [ 3/4, e5(3/8, 110) ],
        [ 1 + 3/8, b5(1/8, 127) ],
        [ 1 + 1/2, c6(1/2, 127) ],
        [ 2, b5(1, 127) ],
        [ 3, g5(1/2, 127) ],
        [ 4, b5(1/2, 127) ],
        [ 4 + 3/4, b5(3/8, 110) ],
        [ 5 + 3/8, b5(1/8, 127) ],
        [ 5 + 4/8, c6(1/2, 127) ],
        [ 6, b5(1, 127) ],
        [ 7, g5(1/2, 127) ],
        [ 8, e5(1/2, 127) ],
        [ 8 + 3/4, e5(1/2, 127) ],
        [ 9 + 3/8, b5(1/8, 127) ],
        [ 9 + 4/8, c6(1/2, 127) ],
        [ 10, b5(1, 127) ],
        [ 11, g5(1/2, 127) ],
        [ 11 + 7/8, d6(1/8, 127) ],
        [ 12, e6(1/2, 127) ],
        [ 12 + 1/2, d6(1/2, 127) ],
        [ 13, b5(3/8, 127) ],
        [ 13 + 1/2, a5(1/4, 127) ],
        [ 13 + 6/8, b5(1/4, 127) ],
        [ 13 + 7/8, a5(1/8, 127) ],
        [ 14, g5(3/4, 127) ]]);

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
        [4, () => upbeatintrolead(subdelaylead), 
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

    const intro2 = async () => new TrackerPattern().play([
        [4, () => upbeatintrolead(subdelaylead), 
            kickbeat, 
            ddbase,
            () => strings.play([g4(8), d5(8), b5(8)]),
        ],        
        [4, kickbeat, ddbase],        
        [3.5, kickbeat, ddbase,
            () => strings.play([f4(8), c5(8), a5(8)]),
        ],
        [0.5, () => rhodes.steps(4, [
            d5, g5, a5, d6, g5, a5, d6, g6,
            d6, g6, a6, d7, g6, a6, d7, g7
            ])],
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
    
    const chorus_second_time = async () => new TrackerPattern()
        .play([
            [2, drumpattern, basepattern, 
                () => rhodes.steps(2, [
                    [c5(2), e5(2), controlchange(7, 110)],
                    ,
                    ,
                    ,
                    [d5(2), fs5(2)]
                    ,
                    ,
                    ,
                    [e5(2), g5(2)]
                    ,
                    ,
                    ,
                    [g5(2), b5(1)]
                    ,
                    ,
                    [d5(2), fs5(1)]
                ]),
                () => strings.play([[0, c5(2), e5(2)]]),
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
                        [b5(1/8, 100), g5(1/8, 100)],[a5,d5],e6(1/8, 80)
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
    
    const realchorus2 = async () => new TrackerPattern().play([
        [
            4, () => base.steps(4, [a3,,a3(1/16,50),a4,a5(1/16,60),a4(1/16),b3, , e4, , e5(1/16), e5(1/16,40), fs4, , g4,g5(1/16,40)]),        
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
            ]),
            () => drums.steps(6,[
                c3,,,
                gs3,,,
                c3(1,100),,,
                gs3,,,
                [c3(1,100)],,,
                fs3,,,
                [c3(1,100), d3(1,127)],,,
                [fs3],,,
                c3(1,100),,,
                fs3,,,
                c3(1,100),,,
                fs3,,,  
                c3,,,
                gs3,,,
                [c3(1,100), d3(1,127)],,,
                gs3,,d3(1,70),
                [c3(1,100)],,,
                fs3,,,
                c3(1,100),,,
                [fs3],,,
                c3(1,100),,,
                fs3,,,
                c3(1,100),,,
                fs3,,,              
            ])
        ],
        [
            4, () => base.steps(4, [g4,,g5(1/16,50),g5,g4(1/16,60),g4(1/16),d3, , c4, , c5(1/16), b5(1/16,40), b4, , g4,b5(1/16,40)]),            
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
    
    await waitForFixedStartTime();
        
    while(true) {                
        await intro();
        
        await chorus();
        await chorus();
        await chargeup();
                
        await new TrackerPattern().play([
            [16, 
                () => lead2.steps(1, [
                    [c6(4, 90), g6(4, 90)],
                    ,
                    ,
                    ,
                    [g5(4, 70), d6(4, 70)],
                    ,
                    ,
                    ,
                    e5(4, 70)
                ]),
                () => drums.steps(1,[
                    [c3, ds3]
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    c3(1,70),
                    c3(1,80),
                    c3(1,90),
                    c3(1,100),
                ]),
                () => pad.steps(1/4,[
                    [a4(4), c5(4),e5(4),g5(4), c6(4), g6(4)],
                    [e4(4), e5(4),g5(4),b5(4), e6(4), b6(4)],
                    [g4(4), g5(4),b5(4),d6(4), g6(4), d7(4)],
                    [c4(4), c5(4),g5(4),c6(4), g6(4), e7(4)]
                ]),
               realchoruslead
            ] 
        ], 1);
        await realchorus();        
        await realchorus();

        realchoruslead();
        await realchorus();
        await realchorus();

        realchoruslead();
        await realchorus();
        
        await realchorus();

        await new TrackerPattern().play([
            [4, () => drums.steps(4, [c3,,,,[c3,e3],,,d3(1/16,90),c3,,,d3(1/16,60),[c3,e3]]),
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
                ]), () => lead3.steps(4, [
                e6(1/4, 110),
                d6,
                ,b5,
                ,a5,
                ,g5,
                ,g5,
                e5,
                ,g5,
                ,a5
                ]),
            () => base.steps(4, [
                a3,,,
                b4,,
                b4,b3,,
                c4,,
                c5,c4(1/32),
                d4,,
                d5
            ]),
            () => lead.steps(1, [
                [e6(1,60),a6(1,60),c7(1,60)],
                [d6(1,60),g6(1,60),b6(1,60)],
                [c6(1,60),e6(1,60),g6(1,60)],
                [a5(1,60),d6(1,60),fs6(1,60)]
            ])
        ]
        ], 1);
        await intro2(); 
        await chorus_second_time();
        await chorus_second_time();
        rhodes.steps(2, [
            [a5(2), c6(2), controlchange(7, 110)],
            ,
            ,
            ,
            [b5(2), d6(2)],
            ,
            ,
            ,
            [c6(2), e6(2)],
            ,
            ,
            ,
            [e6(2), g6(1)]
            ,
            ,
            [d6(2), fs6(1)]
        ]);
        await chargeup();
        
        await new TrackerPattern().play([
            [16, 
                () => rhodes.steps(2, [
                    [e6(2), g6(2)]
                ]),
                () => lead2.steps(1, [
                    [c6(4, 90), g6(4, 90)],
                    ,
                    ,
                    ,
                    [g5(4, 70), d6(4, 70)],
                    ,
                    ,
                    ,
                    e5(4, 70)
                ]),
                () => drums.steps(6,[
                    [c3, ds3],,,
                    gs3,,,
                    c3(1,100),,,
                    gs3,,c3(1,70),
                    [c3(1,100), a3(1,127)],,,
                    fs3,,a3(1,110),
                    c3(1,100),,,
                    [fs3, a3],,,
                    c3(1,100),,,
                    fs3,,,
                    c3(1,100),,,
                    fs3,,,
                    [c3(1,100), a3(1,127)],,,
                    fs3,,a3(1,110),
                    c3(1,100),,,
                    [fs3, a3],,,
                    c3(1,100),,,
                    fs3,,,
                    c3(1,100),,,
                    fs3,,,
                    [c3(1,100), a3(1,127)],,,
                    fs3,,a3(1,110),
                    c3(1,100),,,
                    [fs3, a3],,,
                    c3(1,100),,,
                    fs3,,,
                    c3(1,100),,,
                    fs3,,,
                    [c3(1,100), a3(1,127)],,,
                    fs3,,a3(1,110),
                    c3(1,100),,a3,
                    [fs3, a3],,a3,
                    c3(1,100),,,
                    fs3,,a3,
                ]),
                () => pad.steps(1/4,[
                    [a4(4), c5(4),e5(4),g5(4), c6(4), g6(4)],
                    [e4(4), e5(4),g5(4),b5(4), e6(4), b6(4)],
                    [g4(4), g5(4),b5(4),d6(4), g6(4), d7(4)],
                    [c4(4), c5(4),g5(4),c6(4), g6(4), e7(4)]
                ]),
               realchoruslead
            ] 
        ], 1);  
        await realchorus2();
        await realchorus2();

        realchoruslead();
        await realchorus2();
        await realchorus2();

        realchoruslead();
        await realchorus2();
        
        await realchorus2();
       
    }
})();