/**
 * Copyright (c) 2019 - Peter Johan Salomonsen - All rights reserved
 */

global.bpm =  120;
global.pattern_size_shift = 4;
// global.looptimes = 100;


//soloInstrument('bass');
//soloInstrument('kick');
// global.WASM_SYNTH_LOCATION = 'https://gist.githubusercontent.com/petersalomonsen/ea73551e352440d5f470c6af89d7fe7c/raw/b23b32ba55c1c15e972f39724ae164025f569c76/webchipmusic.wasm';

addInstrument('bass', {type: 'note'});
addInstrument('lead', {type: 'note'});
addInstrument('sinelead', {type: 'note'});
addInstrument('kick', {type: 'number'});
addInstrument('snare', {type: 'number'});
addInstrument('hihat', {type: 'number'});

const padVoices = [];
for(let n=1;n<10;n++) {
  padVoices.push('pad'+n);
  addInstrument('pad'+n, {type: 'note'});
}

addInstrumentGroup('pads', padVoices);


const intro = {
	"bass": pp(4, [d2(3/4),,,,
        a2(1/2),,c3,d3,
        ,c3(1/2),,a2,
        c3,,d3(1/2),,
        ].repeat(2)
		.concat([
			a2(1/4),,a3,,
  			,,a2(1),,
  			c3(1/8),,c4,,
            c3,c4,,d4
		])
	),
      
  	"kick": pp(4, [
    	100,,,,
      	100,,,10,
      	100,,,,
      	100,,,,
    ].repeat(3)),
      "hihat": pp(4, [
      	90,20,90,20,
        90,20,90,20,
        90,20,90,20,
        90,20,90,20
      ].repeat(3)),
      "snare": pp(4, [
      	,,,,
        60,,,,
        ,,,,
        60
        ,,,,
      ].repeat(3)),
      
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
};

playPatterns(intro, 4);
playPatterns(intro, 4);

const lead = [,,a4(1/2),,
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
        ];


// playFromHere();

playPatterns(Object.assign({}, intro, {lead: pp(4, lead)}, 4), 4);

playPatterns(Object.assign({}, intro, {lead: pp(4,
        lead.slice(0,48)
        .concat([d5,e5,g5,,
                b5,,,d6,
                 ,g5
                ])
  )}, 4), 4);


const sineleadpartbass = pattern(4, [
      g2(1/8),,g3,,
      ,,,,
      d2,d3,,f3,
      ,f3,g3,,
    ]);

const sineleadnotes = [
    	,,g5,,
      	g5,,g5,b5,
      	,c6,,b5,
      	,g5,f5,,
      	,,,,
      	,,,,
      	,,,,
      	,,,f5,
      	,f5,d5,,
      	f5,,g5,,
      	a5,,,g5,
      	,,e5
    ];
const sineleadpart = {
	kick: intro.kick,
  	snare: intro.snare,
  	hihat: intro.hihat,
  	bass: pp(4, sineleadpartbass
             	.concat(sineleadpartbass.transposeNotes(-5))
             	.concat(sineleadpartbass.transposeNotes(-2))
             	.concat(sineleadpartbass.transposeNotes(-7))
            ),
  	sinelead: pp(4, sineleadnotes),
  	"pads": pp(1, [
    	[d5(4),g5(4),b5(4)],,,,
      	[f5(4),a5(4),c6(4),d5(4)],,,,
      	[f5(4),a5(4),c6(4)],,,,
        [e5(4),g5(4),c6(4)],,,,
    ],4)
  
};

playPatterns(sineleadpart,4);

playPatterns(Object.assign({}, sineleadpart,{
  
  "sinelead": pp(4, sineleadnotes.slice(0,32).concat([
    ,f5,d5,,
      	f5,,g5,,
      	a5,,,g5,
      	,,,c6,
    	,c6,b5,,
    	c6,,d6,,
    	b5,,,g5
    
    ]))
}),4);