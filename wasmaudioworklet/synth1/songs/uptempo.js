global.bpm = 120;
global.pattern_size_shift = 4;
// global.looptimes = 100;

/*soloInstrument('pad1');
soloInstrument('pad2');
soloInstrument('pad3');*/
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
addInstrument('squarelead', {type: 'number'});

function part1() {
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		, , , 20,
    		64,, 64, ,
    		, ,40 , ,]),
    	snare: pp(4, [
    		, , , ,
    		64, , , ,
    		, , , ,
    		64, , , ,]),
    	hihat: pp(4, [
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,45,
    	    
        ]),
    	"pads": pp(4, [
    	    [a5(0.5),cs6(0.5),e6(0.5)],,,[a5,cs6,e6],
    	    ,,[a5(0.5),d6(0.5),fs6(0.5)],,
    	    [g5(0.5),b5(0.5),d6(0.5)],,,[b5,d6,fs6],
    	    ,,[a5(0.75),cs6(0.75),e6(0.75)],,
        ],3),
        "bass": pp(4, [a2,a2,a3,a3,a2,a2,a3,a2,g2,g2,g3,g2,g3,g2,g2,g3]),
    
    
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		, , , 20,
    		64,, 64, ,
    		, ,40 , ,]),
    	snare: pp(4, [
    		, , , ,
    		64, , , ,
    		, , , ,
    		64, , , ,]),
    	hihat: pp(4, [
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,45,
    	    
        ]),
        "squarelead": pp(4, [
            a4,a5,a4,,
            d6,cs6,a6,e6,
            d6,cs6,a5,g5,
            e5,e6
        ]),
        "bass": pp(4, [a2,a2,a3,a3,a2,a2,a3,a2,g2,g2,g3,g2,g3,g2,g2,g3]),
    });
}

part1();
part1();

function part2() {
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		, , , 20,
    		64,, 64, ,
    		, ,40 , ,]),
    	snare: pp(4, [
    		, , , ,
    		64, , , ,
    		, , , ,
    		64, , , ,]),
    	hihat: pp(4, [
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,45,
    	    
        ]),
    	"pads": pp(4, [
    	    [a5,cs6,e6],,,[a5,cs6,e6],
    	    ,,[a5,d6,fs6],,
    	    [a5,d6,g6],,,[b5,d6,fs6],
    	    ,,[a5,cs6,e6],,
        ],3),
        "bass": pp(4, [d2,d2,d3,d3,d2,d2,d3,d2,g2,g2,g3,g2,g3,g2,g2,g3]),
    
    
    });
     playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		, , , 20,
    		64,, 64, ,
    		, ,40 , ,]),
    	snare: pp(4, [
    		, , , ,
    		64, , , ,
    		, , , ,
    		64, , , ,]),
    	hihat: pp(4, [
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,45,
    	    
        ]),
    
        "bass": pp(4, [d2,d2,d3,d3,d2,d2,d3,d2,c2,c2,c3,c2,c3,c2,c2,c3]),
    
    
    });
    
}

part2();

part1();

function part3() {
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		, , , 20,
    		64,, 64, ,
    		, ,40 , ,]),
    	snare: pp(4, [
    		, , , ,
    		64, , , ,
    		, , , ,
    		64, , , ,]),
    	hihat: pp(4, [
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,45,
    	    
        ]),
    
        "pads": pp(0.25, [
    	    [c5(4),e5(4),g5(4)],
    	    [d5(4),fs5(4),a5(4)]
        ],3),
        "bass": pp(4, [c2,c2,c3,c3,c2,c2,c3,c2,c2,c2,c3,c2,c3,c2,c2,c3]),
        "drivelead": pp(4, [
            ,,g5,a5,
            c6(0.5),,d6,,
            e6(0.5),,d6,c6,
            d6,c6,a5(0.5),,
            ,,g5,a5,
            c6(0.5),,d6,,
            e6,g6,d6,c6,
            d6,c6,a5(0.5),
        ])
    
    });
     playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		, , , 20,
    		64,, 64, ,
    		, ,40 , ,]),
    	snare: pp(4, [
    		, , , ,
    		64, , , ,
    		, , , ,
    		64, , , ,]),
    	hihat: pp(4, [
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,20,
    	    50,20,50,45,
    	    
        ]),
    
        
        "bass": pp(4, [d2,d2,d3,d3,d2,d2,d3,d2,g2,g2,g3,g2,g3,g2,g2,g3]),
    
    
    });
    
}

part3();
part1();
