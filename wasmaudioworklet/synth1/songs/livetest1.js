global.bpm = 120;
global.pattern_size_shift = 4;
// global.looptimes = 100;

/*soloInstrument('pad1');
soloInstrument('pad2');
soloInstrument('pad3');*/
// soloInstrument('lead1');

/*soloInstrument('kick');
soloInstrument('hihat');
soloInstrument('snare');*/
//soloInstrument('squarelead');
// soloInstrument('lead1');

addInstrument('lead1', {type: 'note'});
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

for(var n=0;n<2;n++) {
    playPatterns({
    	kick: pp(4,[
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [d2,hld,,d3,hld,,d3,hld,d2,hld,,,,,,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "snare": n === 1 ? pp(4, [,,,,79,1,,,,,,,79,]) : null
    
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": n === 1 ? pp(4, [,,,,79,1,,,,,,,79,]) : null
    });
    
    playPatterns({
    	kick: pp(4,[
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": n === 1 ? pp(4, [,,,,79,1,,,,,,,79,]) : null
    });
    
    playPatterns({
    	kick: pp(4,[
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": n === 1 ? pp(4, [,,,,79,1,,,,,,50,79,,,30]) : null
    });
}

for(var n=0;n<2;n++) {

    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [d2,hld,,d3,hld,,d3,hld,d2,hld,hld,hld,hld,hld,hld,]),
        "pad1": pp(4, [f5,hld,,a5,hld,,as5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "pad2": pp(4, [d5,hld,,f5,hld,,f5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "pad3": pp(4, [a5,hld,,d5,hld,,d5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,hld,d5,hld,hld,]),
        "drivelead": pp(4, [
        ,,,,d6,hld,hld,,c6,d6,hld,hld,
        c6,hld,a5,hld,f6,hld,
        c6,d6,hld,hld,c6,hld,hld,hld,hld,hld,hld,,c6,d6,
        ,,g6,hld,hld,,
        g6,hld,hld,hld,hld,hld,f6,hld,d6,,f6,hld,,g6,hld,hld,f6,hld,hld,hld,e6,hld,d6,hld,c6,hld]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,hld,hld,hld,hld,hld,]),
        "pad1": pp(4, [f5,hld,,f5,hld,hld,c5,hld,hld,hld,hld,hld,hld,hld,hld,]),
    "pad2": pp(4, [a5,hld,,c5,hld,hld,e5,hld,hld,hld,hld,hld,hld,hld,hld,]),
    "pad3": pp(4, [c5,hld,,a5,hld,hld,g5,hld,hld,hld,hld,hld,hld,hld,hld,]),
    
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,hld,hld,hld,hld,hld,]),
        "pad1": pp(4, [f5,hld,,a5,hld,,as5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "pad2": pp(4, [d5,hld,,f5,hld,,f5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "pad3": pp(4, [a5,hld,,d5,hld,,d5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,40,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,hld,hld,hld,hld,hld,]),
        "pad1": pp(4, [f5,hld,,f5,hld,hld,c5,hld,hld,hld,hld,hld,hld,hld,hld,]),
    "pad2": pp(4, [a5,hld,,c5,hld,hld,e5,hld,hld,hld,hld,hld,hld,hld,hld,]),
    "pad3": pp(4, [c5,hld,,a5,hld,hld,g5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "hihat": pp(4, [79,1,43,1,20,1,43,1,79,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,66,1,,,,,,,79,]),
    });
}

for(var n=0;n<2;n++) {
   playPatterns({
    	kick: pp(4,[
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [d2,hld,,d3,hld,,d3,hld,d2,hld,,,,,,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    "drivelead": pp(4, [
        ,,a4,hld,
        d5,hld,a4,a5,
        hld,a4,g5,hld,
        f5,,e5,,
        d5,hld,a4,hld,
        d5,hld,a4,a5,
        hld,a4,g5,hld,
        f5,hld,e5,,
        d5,hld,hld,hld,
        ,,,,
        ,,,,
        ,,,g5,
        a5,hld,hld,hld,c6,hld,a5,hld,hld,hld,hld,,,,,]),

    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
}

// playFromHere();

for(var n=0;n<2;n++) {
    playPatterns({
    	kick: pp(4,[
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [d2,hld,,d3,hld,,d3,hld,d2,hld,,,,,,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    "drivelead": pp(4, [,,,,
    ,,,a5,
    d6,,d6,,
    a5,hld,d6,e6,
    ,,,,
    ,,,a5,
    e6,,e6,hld,
    a5,e6,,e6,
    f6,hld,e6,hld,
    d6,hld,c6,a5,
    hld,,,,
    ,,,g5,
    a5,hld,c6,hld,
    a5,hld,g5,a5,
    f5,hld,hld,hld,
    ,,,]),
    "pad1": pp(1/4, [d5(4),c6(4),as5(4),a5(4)]),
"pad2": pp(1/4, [f5(4),g5(4),g5(4),f5(4)]),
"pad3": pp(1/4, [a5(4),e5(4),d5(4),c5(4)]),


    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
}

playPatterns({
	kick: pp(4, [
		64, , , ,
		64, , , ,
		64, , , ,
		64, , , ,]),
	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    
    "drivelead": pp(4, [,,,,,,,,,,c5,d5,f5,hld,g5,,,,,,,,,,,,,,,,,]),
});

playPatterns({
	kick: pp(4, [
		64, , , ,
		64, , , ,
		64, , , ,
		64, , , ,]),
	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,])
});


playPatterns({
	kick: pp(4, [
		64, , , ,
		64, , , ,
		64, , , ,
		64, , , ,]),
	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,])
});

// playFromHere();

playPatterns({
	kick: pp(4, [
		64, , , ,
		64, , , ,
		64, , ,32,
		64, , , ,]),
	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,d2,hld,d3,,f2,,f3,hld]),
	"pads": pp(1, [,,[g5(1),e5(1),c5(1)],[a5(1),f5(1),d5(1)]], 3),
    "hihat": pp(4, [79,1,43,20,79,1,43,1,79,1,43,20,79,1,43,30]),
    "lead1": pp(4, [f6,hld,e6,hld,,,c6,hld,hld,,g5,hld,hld,e5,hld]),
    "snare": pp(4, [,,,,79,1,,,,,,30,79,,,20])
});

// playFromHere();

const kickpattern22 = pp(4, [
    	    64,,,,
    	    ,,,,
    	    ,20,64,,
    	    ,,,,
    		]);
const hihatpattern22 = pp(4, [
    	    80,10,80,40,
    	    80,10,80,30,
    	    80,10,80,40,
    	    80,40,80,30,
    		]);
    		


for(var n=0;n<2;n++) {
    playPatterns({
    	kick: kickpattern22,
    	"bass": pp(4, [
    	    g2(1),,,,
    	    ,,,g3,
    	    ,g3,g2,,
    	    d3,,g3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [
            [g5(0.5),as5(0.5),d5(0.5)],,,,
            ,,,[g5,as5,d5],
            ,[g5(0.5),as5(0.5),d5(0.5)]
        ], 3),
        "squarelead": pp(4, [,,g5,,
            g5,,f5,g5,
            ,g5,d5,,
            f5,,g5,,
            a5,,,,
            ,,,,
            a5,c6,a5,c5,
            g5,,f5,,
            c6,g5,,g5,
            ,,f5,g5,
            ,,a5,g5,
            ,,f5,d5]),
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
    });
    
    
    playPatterns({
        kick: kickpattern22,
    	"bass": pp(4, [
    	    f2(1),,,,
    	    ,,,f3,
    	    ,f3,f2,,
    	    c3,,f3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [
            [a5(0.5),f5(0.5),c5(0.5)],,,,
            ,,,[a5,f5,c5],
            ,[a5(0.5),f5(0.5),c5(0.5)]
        ], 3),
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
    });
    
    playPatterns({
        kick: kickpattern22,
    	"bass": pp(4, [
    	    a2(1),,,a3,
    	    ,,a2,,
    	    c3(1),,,c4,
    	    ,,c3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [
            [g5,e5,c5],,,[g5,e5,c5],
            ,,,,
            [g5,ds5,c5],,,[g5,ds5,c5],
            ,,,,
            
            ], 3),
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
        
    });
    
    playPatterns({
        kick: kickpattern22,
    	"bass": pp(4, [
    	    g2(1),,,,
    	    ,,,g3,
    	    ,g3,g2,,
    	    d3,,g3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [
            [f5,as4,d4],,,,
            ,,[f5(1),as4(1),d4(1)]
        ], 3),
        "squarelead": n==1 ? pp(4, [,,,,
                ,,,,
                c5,d5,,
                f5,,g5,,
                f5
            ]) : null,
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
    });
}    


// playFromHere();

for(var n=0;n<2;n++) {
    playPatterns({
    	kick: kickpattern22,
    	"bass": pp(4, [
    	    f2(1),,,,
    	    ,,,f3,
    	    ,f3,f2,,
    	    c3,,f3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [
            [a4(0.5),c5(0.5),f5(0.5)],,,,
            ,,,[a4,c5,f5]
        ], 3),
        "squarelead": pp(4, [
                    ,,a5,,
                    a5,,f5,g5,
                    ,g5,f5,,
                    g5,,a5,g5,
                    ,g5,f5,g5,c6,
                    ,f5,g5,,
                    g5,f5,g5,c6,
                    ,g5,f5
                ]),
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
    });
    playPatterns({
    	kick: kickpattern22,
    	"bass": pp(4, [
    	    a2(1),,,,
    	    ,,,a3,
    	    ,a3,a2,,
    	    e3,,a3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [[a4(0.5),c5(0.5),e5(0.5)],,,,
        ,,,[a4,c5,e5]], 3),
        
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
    });
    playPatterns({
    	kick: kickpattern22,
    	"bass": pp(4, [
    	    c3(1),,,c4,
    	    ,,c3(0.5),,
    	    g2(1),,,g3,
    	    ,,g2(0.5)]),
        "hihat": hihatpattern22,
        "pads": pp(0.5, [
            [g4(2),c5(2),ds5(2)],
            [f4(2),as4(2),d5(2)]
        ], 3),
        "squarelead": pp(4, [,,,,
                ,,,,
                c5,d5,,
                f5,,g5,,
                f5
            ]),
        "snare": pp(4, [,,,,79,,,80,,20,70,,20,70,,30])
    });
}    

    
let patterns25 = {
	kick: pp(4,[
		64, , , ,
		64, , , ,
		64, , , ,
		64, , , ,]),
	"bass": pp(4, [d2,hld,,d3,hld,,d3,hld,d2,hld,,,,,,]),
	"squarelead": pp(4, [
	            f5,d5,,,
	            ,,g5,,
	            ,,a5
            ]),
    "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1])
};

for(var n=0; n<4;n ++) {
    playPatterns(patterns25);
}

patterns25 = Object.assign({},patterns25,{
    "snare": pp(4, [,,,,79,1,,,,,,,79,])
});


for(var n=0;n<2;n++) {
    playPatterns(patterns25);
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
    }));
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,,,,,,]),
    }));
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,,,,,,]),
    }));

    patterns25 = Object.assign({}, patterns25, {
    	"squarelead": pp(4, [
	            f5,d5,,,
	            ,,g5,,
	            ,,a5,,
	            c6,,d6
            ]),
    });
}

for(var n=0;n<2;n++) {
    playPatterns(Object.assign({},patterns25,{
         "drivelead": pp(4, [
            ,,,,d6,hld,hld,,c6,d6,hld,hld,
            c6,hld,a5,hld,f6,hld,
            c6,d6,hld,hld,c6,hld,hld,hld,hld,hld,hld,,c6,d6,
            ,,g6,hld,hld,,
            g6,hld,hld,hld,hld,hld,f6,hld,d6,,f6,hld,,g6,hld,hld,f6,hld,hld,hld,e6,hld,d6,hld,c6,hld]),
    }));
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
    }));
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,,,,,,]),
    }));
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,,,,,,]),
    }));
}

playPatterns(patterns25);
playPatterns(patterns25);
playPatterns(patterns25);
playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [d2(4)]),
        "snare": undefined,
        "kick": pp(4, [64])
}),4);



