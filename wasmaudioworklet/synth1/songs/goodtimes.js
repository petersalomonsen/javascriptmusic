/**
 * Copyright (c) 2019 - Peter Johan Salomonsen - All rights reserved
 */
global.bpm =  90;
global.pattern_size_shift = 4;
// global.looptimes = 100;

/*soloInstrument('pad1');
soloInstrument('pad2');
soloInstrument('pad3');*/
// soloInstrument('lead1');
/*soloInstrument('kick');
soloInstrument('hihat');
soloInstrument('snare');
soloInstrument('bass');*/

addInstrument('bell', {type: 'note'});
addInstrument('bass', {type: 'note'});
addInstrument('pad1', {type: 'note'});
addInstrument('pad2', {type: 'note'});
addInstrument('pad3', {type: 'note'});
addInstrumentGroup('pads', ['pad1', 'pad2', 'pad3']);
addInstrument('kick', {type: 'number'});

addInstrument('snare', {type: 'number'});
addInstrumentGroup('drums', ['kick', 'snare']);
addInstrument('drivelead', {type: 'note'});
addInstrument('hihat', {type: 'number'});
addInstrument('squarelead', {type: 'note'});

for(let n=0;n<2;n++) {
    playPatterns({
    	drivelead: pp(4, [
    	    as4,c5,d5,f5,
    	    as5(0.5),,c6,as5(1),
    	    ,,a5,g5(1),
    	    ,,f5,g5(1),
    	    ,,a5,g5(1),
    	    ,,f5,d5(2)
    	]),
    	pads: pp(0.5,[
    	    [as4(2),d5(2),f5(2)],
    	    [a4(2),d5(2),f5(2)],
    	    [g4(2),d5(2),as5(2)],
    	    [c5(2),f5(2),a5(2)]
        ],3)
    },2);


   playPatterns({
    	drivelead: pp(4, [
    	    f6,as5(0.5),,c6,
    	    d6(1),,ds6,d6(1),
    	    ,,c6,as5(1),
    	    ,,f5,c6(3),
    	    ,,,,
    	    ,,,,
    	    ,,,,
    	].concat(n===1 ? 
    	    [d6,c6,as5,c6] : [])),
    	pads: pp(0.5,[
    	    [as4(2),ds5(2),g5(2)],
    	    [a4(2),d5(2),f5(2)],
    	    [g4(2),ds5(2),c5(2)],
    	    [c5(2),f5(2),a4(2)]
        ],3)
    },2);
}


for(let n=0;n<2;n++) {
    playPatterns({
    	squarelead: pp(4,[
    	    as5,as5,f6,as5,
    	    c6,,d6,as5,
    	    ,,,,
    	    ,,,,
    	    as5,as5,f6,as5,
    	    c6,,d6,c6,
    	    ,as5,,a5,
    	    ,f5
	    ]),
	    bass: pp(0.5, [
	        ds2(2),
	        as1(2),
	        g2(2),
	        f2(2)
        ]),
    	pads: pp(0.5,[
    	    [as4(2),ds5(2),g5(2)],
    	    [as4(2),d5(2),f5(2)],
    	    [d5(2),g5(2),as5(2)],
    	    [c5(2),f5(2),a5(2)]
        ],3)
    },2);
}

//playFromHere();
for(let n=0;n<4;n++) {
    playPatterns({
    	squarelead: pp(4,[
    	    as5,as5,f6,as5,
    	    c6,,d6,as5,
    	    ,,,,
    	    ,,,,
    	    as5,as5,f6,as5,
    	    c6,,d6,c6,
    	    ,as5,,a5,
    	    ,f5
	    ]),
	    bell: n >= 2 ? pp(4, [
	        as5,as5,f6,f6,
	        as6,as6,f6,f6,
	        as5,as5,f6,f6,
	        as6,as6,f6,f6,
	        as5,as5,f6,f6,
	        as6,as6,f6,f6,
	        as5,as5,f6,f6,
	        a6,a6,as6,as6,
        ]): null,
	    bass: pp(4,[
	        ds2(1),,,ds3,
	        ,ds3,ds3,,
	        as2(1),,,f3,
	        as3(1),,,,
	        g2(1),,,g3(0.5),
	        ,g2(1),,,
	        f2(1),,,a2,
	        as2(0.5),,f2(0.5)
        ]),
        hihat: pp(4,[
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            ]),
        snare: pp(4, n>=1 ? n===3 ? [
            ,,,,
            70,,,,
            ,,,,
            70,,,20,
            ,,,,
            70,,,,
            ,,,20,
            70,40,10,60,
            ]
        
            : [
            ,,,,
            70,,,,
            ,,,,
            70,,,,
            ,,,,
            70,,,,
            ,,,20,
            70,,,50,
            ]: []),
	    kick: pp(1,[
	        90,90,90,90,
	        90,90,90,90
        ]),
    	pads: pp(0.5,[
    	    [as4(2),ds5(2),g5(2)],
    	    [as4(2),d5(2),f5(2)],
    	    [d5(2),g5(2),as5(2)],
    	    [c5(2),f5(2),a5(2)]
        ],3)
    },2);
}

const drums1 = {
    hihat: pp(4,[
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            ]),
        snare: pp(4,[
            ,,,,
            70,,,,
            ,,,,
            70,,,,
            ,,,,
            70,,,,
            ,,,20,
            70,,,50,
            ]),
	    kick: pp(4,[
	        90,,,,
	        90,,,,
	        90,,,,
	        90,,,,
	        90,,,,
	        90,,,,
	        90,,,20,
	        90,,,,
        ]),
};

const drums2 = {
    hihat: pp(4,[
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            ]),
        snare: pp(4,[
            ,,,,
            70,,,,
            ,,,,
            70,,,,
            ,,,,
            70,,,,
            ,,,20,
            70,,,50,
            ]),
	    kick: pp(4,[
	        90,,,,
	        90,,,,
	        90,,,,
	        90,,,,
	        90,,,,
	        90,,,,
	        90,,,40,
	        90,,90,,
        ]),
};

// playFromHere();
for(let n=0;n<2;n++) {
    playPatterns(Object.assign({
        bell: pp(4,[
            as5,f6,f6,as5,
            f6,as6,c6,as6,
            as5,f6,f6,as5,
            f6,as6,c6,as6,
            g5,d6,g6,g5,
            g5,d6,as6,g5,
            f5,c6,f6,f5,
            f5,c6,a6,f5,
            ]),
        bass: pp(4,[
            as2(0.5),,,as3,
            ,as2,,,
            d2(0.5),,,d2,
            d3(0.5),,d2,,
            g2(0.5),,,g3(0.5),
            ,g2(0.5),,,
            f2(0.5),,,f3,
            ,f3,f2(0.5)
        ]),
    	drivelead: pp(4, [
    	    as4,c5,d5,f5,
    	    as5(0.5),,c6,as5(1),
    	    ,,a5,g5(1),
    	    ,,f5,g5(1),
    	    ,,a5,g5(1),
    	    ,,f5,d5(2)
    	]),
    	pads: pp(0.5,[
    	    [as4(2),d5(2),f5(2)],
    	    [a4(2),d5(2),f5(2)],
    	    [g4(2),d5(2),as5(2)],
    	    [c5(2),f5(2),a5(2)]
        ],3)
    },drums1),2);


   playPatterns(Object.assign({
        bell: pp(4,[
            ds5,as5,ds6,as5,
            ds5,g6,g6,ds5,
            d5,a5,d6,a5,
            d5,f6,f6,d5,
            ds5,g5,c6,ds5,
            g5,c6,ds6,g5,
            c6,f6,a6,c6,
            f6,a6,c6,f6
        ]),
       bass: pp(4,[
            ds2(0.5),,,ds3,
            ,ds2(0.5),,,
            d2(0.5),,,d2,
            d3(0.5),,d2,,
            c2(0.5),,,c3(0.5),
            ,c2(0.5),,,
            f2(0.5),,,f3,
            ,f3,f2(0.5)
        ]),
    	drivelead: pp(4, [
    	    f6,as5(0.5),,c6,
    	    d6(1),,ds6,d6(1),
    	    ,,c6,as5(1),
    	    ,,f5,c6(3),
    	    ,,,,
    	    ,,,,
    	    ,,,,
    	].concat(n===1 ? 
    	    [d6,c6,as5,c6] : [])),
    	pads: pp(0.5,[
    	    [as4(2),ds5(2),g5(2)],
    	    [a4(2),d5(2),f5(2)],
    	    [g4(2),ds5(2),c5(2)],
    	    [c5(2),f5(2),a4(2)]
        ],3)
    },drums2),2);
}

// playFromHere();
for(let n=0;n<4;n++) {
    playPatterns({
    	drivelead: pp(4,n < 2 ? [
    	    as5,hld,f6,as5,
    	    c6,,d6,as5,
    	    ,,,,
    	    ,,,,
    	    as5,hld,f6,as5,
    	    c6,,d6,c6,
    	    ,as5,,a5,
    	    ,f5
	    ]: [
	        g5(2),,,,
	        ,f5,g5,f5,
	        ,,,,
	        f5,g5,as5,,
	        c6(2),,,,
	        ,,as5,a5,
	        ,as5,,a5,
	        ,f5
        ]),
    	squarelead: pp(4,[
    	    as5,as5,f6,as5,
    	    c6,,d6,as5,
    	    ,,,,
    	    ,,,,
    	    as5,as5,f6,as5,
    	    c6,,d6,c6,
    	    ,as5,,a5,
    	    ,f5
	    ]),
	    bass: pp(4,[
	        ds2(1),,,ds3,
	        ,ds3,ds3,,
	        as2(1),,,f3,
	        as3(1),,,,
	        g2(1),,,g3(0.5),
	        ,g2(1),,,
	        f2(1),,,a2,
	        as2(0.5),,f2(0.5)
        ]),
        hihat: pp(4,[
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            ]),
        snare: pp(4, [
            ,,,,
            70,,,,
            ,,,,
            70,,,,
            ,,,,
            70,,,,
            ,,,20,
            70,,,50,
            ]),
	    kick: pp(1,[
	        90,90,90,90,
	        90,90,90,90
        ]),
    	pads: pp(0.5,[
    	    [as4(2),ds5(2),g5(2)],
    	    [as4(2),d5(2),f5(2)],
    	    [d5(2),g5(2),as5(2)],
    	    [c5(2),f5(2),a5(2)]
        ],3)
    },2);
}



const leadpattern24 = pp(4, [
   as4,f5,as5,f5,
   c6,as5,a5,as5,
   d5,f5,as5,f5,
   c6,as5,a5,as5,
   ,f5,d6,f5,c6,
   f5,as5,f5,a5,
   as5,a5,g5,,
   f5(0.5)
]);


// Same pattern one octave up
const leadpattern25 = pp(4, 
    (getPatternByName(`${leadpattern24}_0`).concat(getPatternByName(`${leadpattern24}_1`))
        .map(note => note > 1 ? note + 12 : note))
);


for(let n=0;n<4;n++) {
    playPatterns(Object.assign({
        bell: pp(4,[
            as5,f6,f6,as5,
            f6,as6,c6,as6,
            as5,f6,f6,as5,
            f6,as6,c6,as6,
            g5,d6,g6,g5,
            g5,d6,as6,g5,
            f5,c6,f6,f5,
            f5,c6,a6,f5,
            ]),
        bass: pp(4,[
            as2(0.5),,,as3,
            ,as2,,,
            d2(0.5),,,d2,
            d3(0.5),,d2,,
            g2(0.5),,,g3(0.5),
            ,g2(0.5),,,
            f2(0.5),,,f3,
            ,f3,f2(0.5)
        ]),
    	drivelead:leadpattern24,
    	squarelead: n >= 2 ? leadpattern25 : null,
    	pads: pp(0.5,[
    	    [as4(2),d5(2),f5(2)],
    	    [a4(2),d5(2),f5(2)],
    	    [g4(2),d5(2),as5(2)],
    	    [c5(2),f5(2),a5(2)]
        ],3)
    },drums1),2);
}

// playFromHere();
for(let n=0;n<2;n++) {
    playPatterns(Object.assign({
        bell: pp(4,[
            as5,f6,f6,as5,
            f6,as6,c6,as6,
            as5,f6,f6,as5,
            f6,as6,c6,as6,
            g5,d6,g6,g5,
            g5,d6,as6,g5,
            f5,c6,f6,f5,
            f5,c6,a6,f5,
            ]),
        bass: pp(4,[
            as2(0.5),,,as3,
            ,as2,,,
            d2(0.5),,,d2,
            d3(0.5),,d2,,
            g2(0.5),,,g3(0.5),
            ,g2(0.5),,,
            f2(0.5),,,f3,
            ,f3,f2(0.5)
        ]),
    	drivelead: pp(4, [
    	    f6(1.5),,,
    	    ,,ds6,d6,c6,
    	    ,as5,,c6,,
    	    d6(1),,f5(2)
    	    ,,,,
    	    ,,g5,a5,
    	    as5,,c6,,
    	    as5,,a5(1)
    	    ]),
    	squarelead: leadpattern25,
    	pads: pp(0.5,[
    	    [as4(2),d5(2),f5(2)],
    	    [a4(2),d5(2),f5(2)],
    	    [g4(2),d5(2),as5(2)],
    	    [c5(2),f5(2),a5(2)]
        ],3)
    },drums1),2);
}
// playFromHere();
for(let n=0;n<2;n++) {
    playPatterns(Object.assign({
        bell: pp(4,[
            as5,f6,f6,as5,
            f6,as6,c6,as6,
            as5,f6,f6,as5,
            f6,as6,c6,as6,
            g5,d6,g6,g5,
            g5,d6,as6,g5,
            f5,c6,f6,f5,
            f5,c6,a6,f5,
            ]),
        bass: pp(4,[
            as2(0.5),,,as3,
            ,as2,,,
            d2(0.5),,,d2,
            d3(0.5),,d2,,
            g2(0.5),,,g3(0.5),
            ,g2(0.5),,,
            f2(0.5),,,f3,
            ,f3,f2(0.5)
        ]),
    	drivelead: n===0 ? pp(4, [
    	    as5(4)
    	    ]) : 
	    pp(4, [
    	    ,,,,
    	    ,,,,
    	    ,,,,
    	    f5,g5,as5,c6,
    	    ,,,,
    	    f5,g5,as5,c6,
    	    d6(1),,,,
    	    c6(1)
	    ]),
    	squarelead: leadpattern25,
    	pads: pp(0.5,[
    	    [as4(2),d5(2),f5(2)],
    	    [a4(2),d5(2),f5(2)],
    	    [g4(2),d5(2),as5(2)],
    	    [c5(2),f5(2),a5(2)]
        ],3)
    },drums1),2);
}

for(let n=0;n<2;n++) {
    playPatterns(Object.assign({
        bell: pp(4,[
            as5,f6,f6,as5,
            f6,as6,c6,as6,
            as5,f6,f6,as5,
            f6,as6,c6,as6,
            g5,d6,g6,g5,
            g5,d6,as6,g5,
            f5,c6,f6,f5,
            f5,c6,a6,f5,
            ]),
        bass: pp(4,[
            as2(0.5),,,as3,
            ,as2,,,
            d2(0.5),,,d2,
            d3(0.5),,d2,,
            g2(0.5),,,g3(0.5),
            ,g2(0.5),,,
            f2(0.5),,,f3,
            ,f3,f2(0.5)
        ]),
    	drivelead: pp(4, [
    	    as4,c5,d5,f5,
    	    as5(0.5),,c6,as5(1),
    	    ,,a5,g5(1),
    	    ,,f5,g5(1),
    	    ,,a5,g5(1),
    	    ,,f5,d5(2)
    	]),
    	squarelead: pp(4, [
    	    as4,c5,d5,f5,
    	    as5(0.5),,c6,as5(1),
    	    ,,a5,g5(1),
    	    ,,f5,g5(1),
    	    ,,a5,g5(1),
    	    ,,f5,d5(2)
    	]),
    	pads: pp(0.5,[
    	    [as4(2),d5(2),f5(2)],
    	    [a4(2),d5(2),f5(2)],
    	    [g4(2),d5(2),as5(2)],
    	    [c5(2),f5(2),a5(2)]
        ],3)
    },drums1),2);


   playPatterns(Object.assign({
        bell: pp(4,[
            ds5,as5,ds6,as5,
            ds5,g6,g6,ds5,
            d5,a5,d6,a5,
            d5,f6,f6,d5,
            ds5,g5,c6,ds5,
            g5,c6,ds6,g5,
            c6,f6,a6,c6,
            f6,a6,c6,f6
        ]),
       bass: pp(4,[
            ds2(0.5),,,ds3,
            ,ds2(0.5),,,
            d2(0.5),,,d2,
            d3(0.5),,d2,,
            c2(0.5),,,c3(0.5),
            ,c2(0.5),,,
            f2(0.5),,,f3,
            ,f3,f2(0.5)
        ]),
    	drivelead: pp(4, [
    	    f6,as5(0.5),,c6,
    	    d6(1),,ds6,d6(1),
    	    ,,c6,as5(1),
    	    ,,f5,c6(3),
    	    ,,,,
    	    ,,,,
    	    ,,,,
    	].concat(n===1 ? 
    	    [d6,c6,as5,c6] : [])),
	    squarelead: pp(4, [
    	    f6,as5(0.5),,c6,
    	    d6(1),,ds6,d6(1),
    	    ,,c6,as5(1),
    	    ,,f5,c6(3),
    	    ,,,,
    	    ,,,,
    	    ,,,,
    	].concat(n===1 ? 
    	    [d6,c6,as5,c6] : [])),
    	pads: pp(0.5,[
    	    [as4(2),ds5(2),g5(2)],
    	    [a4(2),d5(2),f5(2)],
    	    [g4(2),ds5(2),c5(2)],
    	    [c5(2),f5(2),a4(2)]
        ],3)
    },drums2),2);
}

playPatterns({
    bell: pp(4,[
        as5,f6,f6,as5,
        f6,as6,c6,as6,
        as5,f6,f6,as5,
        f6,as6,c6,as6,
        g5,d6,g6,g5,
        g5,d6,as6,g5,
        f5,c6,f6,f5,
        f5,c6,a6,f5,
        ]),
    drivelead:pp(4, [
    	    as5(4)
    	    ]),
    bass: pp(4,[
        as2(0.5),,,as3,
        ,as2,,,
        d2(0.5),,,d2,
        d3(0.5),,d2,,
        g2(0.5),,,g3(0.5),
        ,g2(0.5),,,
        f2(0.5),,,f3,
        ,f3,f2(0.5)
    ]),
	pads: pp(0.5,[
	    [as4(2),d5(2),f5(2)],
	    [a4(2),d5(2),f5(2)],
	    [g4(2),d5(2),as5(2)],
	    [c5(2),f5(2),a5(2)]
    ],3),
    hihat: pp(4,[
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            20,20,50,20,
            ]),
    snare: pp(4, [70,,,40,,,20]),
    kick: pp(4, [
        90
    ])
    
}, 2);

playPatterns({
    bell: pp(4,[
        as5,f6,f6,as5,
        f6,as6,c6,as6,
        as5,f6,f6,as5,
        f6,as6,c6,as6,
        g5,d6,g6,g5,
        g5,d6,as6,g5,
        f5,c6,f6,f5,
        f5,c6,a6,f5,
        f6,a6,c7,f5
        ]),
    hihat: pp(4, [50,10,40,10,20,5,10,5]),
    bass: pp(4,[
        as2(0.5),,,as3,
        ,as2,,,
        d2(0.5),,,d2,
        d3(0.5),,d2,,
        g2(0.5),,,g3(0.5),
        ,g2(0.5),,,
        f2(0.5),,,f3,
        ,f3,f2(3)
    ]),
	pads: pp(0.5,[
	    [as4(2),d5(2),f5(2)],
	    [a4(2),d5(2),f5(2)],
	    [g4(2),d5(2),as5(2)],
	    [c5(3),f5(3),a5(3)]
    ],3)
}, 4);

