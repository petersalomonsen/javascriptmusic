global.bpm =  90;
global.pattern_size_shift = 4;
// global.looptimes = 100;

/*soloInstrument('pad1');
soloInstrument('pad2');
soloInstrument('pad3');*/
// soloInstrument('lead1');

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

playPatterns({
	drivelead: pp(4, [,,,e5,
	    a5,b5,c6,,
	    b5,,a5,e5,
	    ,,,,
	    ,,,d5,
	    g5,a5,b5,,
	    a5,,g5,d5,
	    ,,,,
	    ,,,c5,
	    f5,g5,a5,,
	    g5,,d5,e5
	    ,,f5,,
	    e5,,,,
	    ,,,,
	    ,,,,
	    ,,,,
	])
},4);

playPatterns({
	drivelead: pp(4, [,,,e5,
	    a5,b5,c6,,
	    b5,,a5,e5,
	    ,,,,
	    ,,,d5,
	    g5,a5,b5,,
	    a5,,g5,d5,
	    ,,,,
	    ,,,c6,
	    f6,g6,a6,,
	    g6,,d6,e6
	    ,,f6,,
	    e6(3),,,,
	    ,,,,
	    ,,,,
	    ,,,,
	]),
 	squarelead: pp(4, [
 	    a5,e5,e5,a5,
 	    f5,e5,c5,a5,
 	    a5,e6,,a5,e6
 	    ,,,,
 	    g5,d5,d5,g5,
 	    d5,c5,b5,d5,
 	    g5,d6,,g5,d6
 	    ,,,,
 	    f4,c5,f5,f4,
 	    c5,f5,c5,f5,
 	    g4,d5,g5,g4,
 	    d5,g5,d5,g5,
 	    a4,e5,a5,a4,
 	    e5,a5,a4,e5,
 	    a5,e6
     ])
},4);

playPatterns({
    bell: pp(2,[
        e5,a5,c6,e5,c6,b5,g5,a5,
        d5,g5,b5,g5,c6,b5,g5,d5,
        c5,f5,a5,c5,d5,g5,b5,d5,
        e5,a5,c6,e5,a5
    ])
},200);

