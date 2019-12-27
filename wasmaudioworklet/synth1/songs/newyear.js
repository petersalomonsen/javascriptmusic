/**
 * Copyright (c) 2019 - Peter Johan Salomonsen - All rights reserved
 */

global.bpm =  120;
global.pattern_size_shift = 4;
// global.looptimes = 100;


// soloInstrument('bass');
// soloInstrument('kick');
// global.WASM_SYNTH_LOCATION = 'https://gist.githubusercontent.com/petersalomonsen/ea73551e352440d5f470c6af89d7fe7c/raw/b23b32ba55c1c15e972f39724ae164025f569c76/webchipmusic.wasm';

addInstrument('bass', {type: 'note'});
addInstrument('lead', {type: 'note'});
addInstrument('kick', {type: 'number'});
addInstrument('snare', {type: 'number'});
addInstrument('hihat', {type: 'number'});
addInstrument('brassylead', {type: 'note'});
const padVoices = [];
for(let n=1;n<4;n++) {
  padVoices.push('pad'+n);
  addInstrument('pad'+n, {type: 'note'});
}
addInstrumentGroup('pads', ['pad1', 'pad2', 'pad3']);


playPatterns({
	"bass": pp(4, [d2(3/4),,,,
        a2(1/2),,c3,d3,
        ,c3(1/2),,a2,
        c3,,d3(1/2),,
        ].repeat(2)),
  	"kick": pp(4, [
    	100,,,,
      	100,,,10,
      	100,,,,
      	100,,,,
    ].repeat(3)),
      "lead": pp(4, [,,a4(1/2),,
        d5(1/2),,a4(1/2),,
        d5(3/4),,,e5(3/4),
        ,,c5(1),,
        ,,b4(1/2),,
        c5(1/2),,b4(1/2),,
        c5(3/4),,,b4(3/4),
        ,,a4(1/4),,
        ,,,,
        ,,,,
        ,,,,
        ,,,,
        ,,g5(1/2),,
        g5(1/2),,g5(1/2),,
        g5(1/2),,,a5(3/4),
        ,,fs5
        ]),
    "pads": pp(4, [
    	[d5(1),fs5(1),a4(1)],,,,
      	,,,,
      	,,,,
      	[d5(1),fs5(1),a4(1)],,,,
  		[e5(1),g5(1),c5(1)]
		,,,,
      	,,,,
        ,,,,
        [e5(1),g5(1),b5(1)],,,,
  		[d5(1),fs5(1),a5(1)],,,,
        ,,,,
        ,,,,
        ,,,,
        [e5(1/4),g5(1/4),c6(1/4)],,,[e5,g5,c6],
        ,,,,
        [d5(1/4),g5(1/4),b5(1/4)],,,[d5,g5,b5],
        ,,,,
    ], 3)
});