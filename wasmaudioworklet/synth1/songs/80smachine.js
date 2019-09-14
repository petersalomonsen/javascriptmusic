/**
 * Copyright (c) 2019 - Peter Johan Salomonsen - All rights reserved
 */

global.bpm =  110;
global.pattern_size_shift = 4;
// global.looptimes = 100;


// soloInstrument('bass');
// soloInstrument('kick');
// global.WASM_SYNTH_LOCATION = 'https://gist.githubusercontent.com/petersalomonsen/8ed949e2cfada00b82845828e415a8b8/raw/15404228b2c4bebf79f5f2a18dcecc50d0fb8721/synth.wasm';

var pianoVoices = [];
for(let n=1;n<=8;n++) {
  pianoVoices.push('piano'+n);
  addInstrument('piano'+n, {type: 'note'});
}
addInstrumentGroup('piano', pianoVoices);
addInstrument('kick', {type: 'number'});
addInstrument('snare', {type: 'number'});
addInstrument('hihat', {type: 'number'});
addInstrument('bass', {type: 'note'});
addInstrument('eftang', {type: 'note'});
var padVoices = [];
for(let n=1;n<=8;n++) {
  padVoices.push('pad'+n);
  addInstrument('pad'+n, {type: 'note'});
}
addInstrumentGroup('pads', padVoices);
addInstrument('sinelead', {type: 'note'});

for(let n=0;n<2;n++) {  
  playPatterns({
    "kick": pp(4, [
    	100,,,,
        100,,,8,
        100,,,,
        100
    ]),

    "piano1": pp(4, [e3,hld,hld,hld,d6,e5,e4,fs5,d4,hld,hld,b3,hld,d4,e4,hld]),
    "piano2": pp(4, [,,b4,hld,,b4,hld,a4,hld,fs5,hld,,fs5,hld,b4,hld]),
    "piano3": pp(4, [,,g5,hld,,g5,hld,d5,hld,a4,hld,,d5,hld,g5,hld]),
	"bass": pp(4, [e2(1),,,e2,
                   e3,,e2,,
                   b2,,,b2,
                   ,,d3,e3])
  });
  
  playPatterns({

    "kick": pp(4, [
    	100,,,,
        100,,,8,
        100,,,,
        100,,40
    ]),


    "piano1": pp(4, [e5,hld,e6,e5,hld,d6,b5,fs5,hld,hld,fs5,hld,hld,hld,d5,hld]),
  "piano2": pp(4, [a3,hld,hld,hld,hld,e5,hld,d5,hld,hld,d5,hld,hld,e5,hld,e5]),
  "piano3": pp(4, [c5,hld,,c5,hld,b4,,a4,hld,hld,a4,hld,,d5,hld,]),
  "piano4": pp(4, [,a2,hld,hld,hld,g5,hld,b3,hld,hld,hld,hld,hld,a4,hld,]),
  "piano5": pp(4, [,,,,,,,b2,hld,hld,hld,hld,,,,]),
   "bass": pp(4, [c2,,,c3,
                   ,,c2,,
                   d2,,,d2,
                   d3,,d2])
  });
}
for(let n=0;n<2;n++) {  
  playPatterns({

    "kick": pp(4, [
    	100,,,,
        100,,,8,
        100,,,,
        100
    ]),

	"eftang": pp(4, [,,b4,,e5,,fs5,g5,,,fs5,,e5,,g5,fs5,,,,,,,e5,,fs5,,g5,,fs5,d5,b4,e5,hld,,,,,,,,,,,,,]),



    "piano1": pp(4, [e3,hld,hld,hld,d6,e5,e4,fs5,d4,hld,hld,b3,hld,d4,e4,hld]),
    "piano2": pp(4, [,,b4,hld,,b4,hld,a4,hld,fs5,hld,,fs5,hld,b4,hld]),
    "piano3": pp(4, [,,g5,hld,,g5,hld,d5,hld,a4,hld,,d5,hld,g5,hld]),
	"bass": pp(4, [e2(1),,,e2,
                   e3,,e2,,
                   b2,,,b2,
                   ,,d3,e3])
  });
  
  playPatterns({

    "kick": pp(4, [
    	100,,,,
        100,,,8,
        100,,,,
        100,,40
    ]),


    "piano1": pp(4, [e5,hld,e6,e5,hld,d6,b5,fs5,hld,hld,fs5,hld,hld,hld,d5,hld]),
  "piano2": pp(4, [a3,hld,hld,hld,hld,e5,hld,d5,hld,hld,d5,hld,hld,e5,hld,e5]),
  "piano3": pp(4, [c5,hld,,c5,hld,b4,,a4,hld,hld,a4,hld,,d5,hld,]),
  "piano4": pp(4, [,a2,hld,hld,hld,g5,hld,b3,hld,hld,hld,hld,hld,a4,hld,]),
  "piano5": pp(4, [,,,,,,,b2,hld,hld,hld,hld,,,,]),
   "bass": pp(4, [c2,,,c3,
                   ,,c2,,
                   d2,,,d2,
                   d3,,d2])
  });
  
  playPatterns({

    "kick": pp(4, [
    	100,,,,
        100,,,8,
        100,,,,
        100
    ]),

	
    "piano1": pp(4, [e3,hld,hld,hld,d6,e5,e4,fs5,d4,hld,hld,b3,hld,d4,e4,hld]),
    "piano2": pp(4, [,,b4,hld,,b4,hld,a4,hld,fs5,hld,,fs5,hld,b4,hld]),
    "piano3": pp(4, [,,g5,hld,,g5,hld,d5,hld,a4,hld,,d5,hld,g5,hld]),
	"bass": pp(4, [e2(1),,,e2,
                   e3,,e2,,
                   b2,,,b2,
                   ,,d3,e3])
  });
  playPatterns({

    "kick": pp(4, [
    	100,,,,
        100,,,8,
        100,,,,
        100,,40
    ]),


    "piano1": pp(4, [e5,hld,e6,e5,hld,d6,b5,fs5,hld,hld,fs5,hld,hld,hld,d5,hld]),
  "piano2": pp(4, [a3,hld,hld,hld,hld,e5,hld,d5,hld,hld,d5,hld,hld,e5,hld,e5]),
  "piano3": pp(4, [c5,hld,,c5,hld,b4,,a4,hld,hld,a4,hld,,d5,hld,]),
  "piano4": pp(4, [,a2,hld,hld,hld,g5,hld,b3,hld,hld,hld,hld,hld,a4,hld,]),
  "piano5": pp(4, [,,,,,,,b2,hld,hld,hld,hld,,,,]),
   "bass": pp(4, [c2,,,c3,
                   ,,c2,,
                   d2,,,d2,
                   d3,,d2])
  });
}
// loopHere();

//playFromHere();
playPatterns({

  "kick": pp(4, [
    100,,,,
    100,,,8,
    100,,,,
    100,,40,,
    100,,,,
    100,,,,
    100,,,,
    100,,,10
  ]),

  "piano1": pp(4, [g4,hld,,e5,,e5,hld,hld,,,g6,fs6,,,b4(0.5),,c5,,,g5,hld,,g5,,g5,hld,,a4,hld,,c5,hld]),
  "piano2": pp(4, [c5,hld,,c5,,g4,hld,hld,,,,,,d6,d5,,e5,hld,,d5,,,d5,,d5,,,d5,hld,,g4,hld]),
    "piano3": pp(4, [e5,hld,,g4,,c5,hld,hld,,,,,,,g4,,g4,hld,,b4,,,b4,,b4,,,fs5,hld,,e5,hld]),

      "eftang": pp(4, [,,,,g6,,,,fs6,hld,,,d6,,,b5,,,a5,hld,hld,,g5,,a5,,b5,,a5,,g5,e5]),

        "bass": pp(4, [a1,,,a2,
                       ,,a1,,
                       a1,,,a1,
                       b2,,b1,,
                       c2,,,c3,
                       ,,c2,,
                       c2,,,c2,
                       d3,,d2
                      ])
}, 2);
playPatterns({

  "kick": pp(4, [
    100,,,,
    100,,,8,
    100,,,,
    100,,40,,
    100,,,,
    100,,,,
    100,,,,
    100,,,10
  ]),

  "piano1": pp(4, [g4,hld,,e5,,e5,hld,hld,,,g6,fs6,,,b4(0.5),,c5,,,g5,hld,,g5,,g5,hld,,a4,hld,,c5,hld]),
  "piano2": pp(4, [c5,hld,,c5,,g4,hld,hld,,,,,,d6,d5,,e5,hld,,d5,,,d5,,d5,,,d5,hld,,g4,hld]),
    "piano3": pp(4, [e5,hld,,g4,,c5,hld,hld,,,,,,,g4,,g4,hld,,b4,,,b4,,b4,,,fs5,hld,,e5,hld]),


      "eftang": pp(4, [,,d5,e5,hld,g5,,,,,,,,,,,,,d5,e5,hld,,g5,,a5,hld,hld,hld,hld,,,]),


        "bass": pp(4, [a1,,,a2,
                       ,,a1,,
                       a1,,,a1,
                       b2,,b1,,
                       c2,,,c3,
                       ,,c2,,
                       c2,,,c2,
                       d3,,d2
                      ])
}, 2);

playPatterns({

  "kick": pp(4, [
    100,,,,
    100,,,8,
    100,,,,
    100,,40,,
    100,,,,
    100,,,,
    100,,,,
    100,,,10
  ]),

  "piano1": pp(4, [g4,hld,,e5,,e5,hld,hld,,,g6,fs6,,,b4(0.5),,c5,,,g5,hld,,g5,,g5,hld,,a4,hld,,c5,hld]),
  "piano2": pp(4, [c5,hld,,c5,,g4,hld,hld,,,,,,d6,d5,,e5,hld,,d5,,,d5,,d5,,,d5,hld,,g4,hld]),
    "piano3": pp(4, [e5,hld,,g4,,c5,hld,hld,,,,,,,g4,,g4,hld,,b4,,,b4,,b4,,,fs5,hld,,e5,hld]),

      "eftang": pp(4, [,,,,g6,,,,fs6,hld,,,d6,,,b5,,,a5,hld,hld,,g5,,a5,,b5,,a5,,g5,e5]),

        "bass": pp(4, [a1,,,a2,
                       ,,a1,,
                       a1,,,a1,
                       b2,,b1,,
                       c2,,,c3,
                       ,,c2,,
                       c2,,,c2,
                       d3,,d2
                      ])
}, 2);


playPatterns({
  "kick": pp(4, [
    100,,,,
    100,,,8,
    100,,,,
    100,,40,,
    100,,,,
    100,,,,
    100,,,,
    100,,,10
  ]),

  "piano1": pp(4, [g4,hld,,e5,,e5,hld,hld,,,g6,fs6,,,b4(0.5),,c5,,,g5,hld,,g5,,g5,hld,,a4,hld,,c5,hld]),
  "piano2": pp(4, [c5,hld,,c5,,g4,hld,hld,,,,,,d6,d5,,e5,hld,,d5,,,d5,,d5,,,d5,hld,,g4,hld]),
    "piano3": pp(4, [e5,hld,,g4,,c5,hld,hld,,,,,,,g4,,g4,hld,,b4,,,b4,,b4,,,fs5,hld,,e5,hld]),


      "eftang": pp(4, [,,d5,e5,hld,g5,,,,,,,,,,,,,d5,e5,hld,,g5,,a5,hld,hld,hld,
                       b5(1),,,]),


     "bass": pp(4, [a1,,,a2,
                    ,,a1,,
                    a1,,,a1,
                    b2,,b1,,
                    c2,,,c3,
                    ,,c2,,
                    c2(0.5),,c3(0.5),,
          d2(0.5),,d3(0.5)
])
}, 2);

playFromHere();
  playPatterns({

    "kick": pp(4, [
    	100,,,,
        100,,,8,
        100,,,,
        100
    ]),
    
	"pads": pp(0.5, [
      [e5(2),g5(2),b4(2),d5(2)],
      [fs5(2),a5(2),d4(2),cs5(2)],
      [g5(2),b5(2),c4(2),e4(2)],
      [d6(2),a5(2),b3(2)],
      [e6(6),b5(6),e4(6),g5(6),d5(6)],
    ], 5),

	"eftang": pp(1, [g5(1.5),,a5(1.5),,fs5(1),,,g5(1)]),



    "piano1": pp(4, [e3,hld,hld,hld,d6,e5,e4,fs5,d4,hld,hld,b3,hld,d4,e4,hld]),
    "piano2": pp(4, [,,b4,hld,,b4,hld,a4,hld,fs5,hld,,fs5,hld,b4,hld]),
    "piano3": pp(4, [,,g5,hld,,g5,hld,d5,hld,a4,hld,,d5,hld,g5,hld]),
	"bass": pp(4, [e2(1),,,e2,
                   e3,,e2,,
                   b2,,,b2,
                   ,,d3,e3])
  });
  
  playPatterns({

    "kick": pp(4, [
    	100,,,,
        100,,,8,
        100,,,,
        100,,40
    ]),

    

    "piano1": pp(4, [e5,hld,e6,e5,hld,d6,b5,fs5,hld,hld,fs5,hld,hld,hld,d5,hld]),
  "piano2": pp(4, [a3,hld,hld,hld,hld,e5,hld,d5,hld,hld,d5,hld,hld,e5,hld,e5]),
  "piano3": pp(4, [c5,hld,,c5,hld,b4,,a4,hld,hld,a4,hld,,d5,hld,]),
  "piano4": pp(4, [,a2,hld,hld,hld,g5,hld,b3,hld,hld,hld,hld,hld,a4,hld,]),
  "piano5": pp(4, [,,,,,,,b2,hld,hld,hld,hld,,,,]),
   "bass": pp(4, [c2,,,c3,
                   ,,c2,,
                   d2,,,d2,
                   d3,,d2])
  });


playPatterns({

    "kick": pp(4, [
    	100,,,,
        100,,,8,
        100,,,,
        100
    ]),
  "snare": pp(4, [
          ,,,,
          100,,,,
          ,,,,
          100
      ]),
"pads": pp(4, [[g5(2),e5(7/4),b5(2)],,,,,,,,[d5(2),fs5(2),a5(2)],,,,,,,,[e5(7/4),g5(2),c5(7/4)],,,,,,,,[fs5(7/4),d5(7/4),b4(7/4)],,,,,,,], 8),

	"eftang": pp(1, [e5(2)]),

    "piano1": pp(4, [e3,hld,hld,hld,d6,e5,e4,fs5,d4,hld,hld,b3,hld,d4,e4,hld]),
    "piano2": pp(4, [,,b4,hld,,b4,hld,a4,hld,fs5,hld,,fs5,hld,b4,hld]),
    "piano3": pp(4, [,,g5,hld,,g5,hld,d5,hld,a4,hld,,d5,hld,g5,hld]),
	"bass": pp(4, [e2(1),,,e2,
                   e3,,e2,,
                   b2,,,b2,
                   ,,d3,e3])
  });
  
  playPatterns({

    "kick": pp(4, [
    	100,,,,
        100,,,8,
        100,,,,
        100,,40
    ]),
"snare": pp(4, [
          ,,,,
          100,,,,
          ,,,,
          100
      ]),

    "piano1": pp(4, [e5,hld,e6,e5,hld,d6,b5,fs5,hld,hld,fs5,hld,hld,hld,d5,hld]),
  "piano2": pp(4, [a3,hld,hld,hld,hld,e5,hld,d5,hld,hld,d5,hld,hld,e5,hld,e5]),
  "piano3": pp(4, [c5,hld,,c5,hld,b4,,a4,hld,hld,a4,hld,,d5,hld,]),
  "piano4": pp(4, [,a2,hld,hld,hld,g5,hld,b3,hld,hld,hld,hld,hld,a4,hld,]),
  "piano5": pp(4, [,,,,,,,b2,hld,hld,hld,hld,,,,]),
   "bass": pp(4, [c2,,,c3,
                   ,,c2,,
                   d2,,,d2,
                   d3,,d2])
  });



for(var n=0;n<2;n++) {
  playPatterns({

      "kick": pp(4, [
          100,,,,
          100,,,8,
          100,,,,
          100
      ]),
      "snare": pp(4, [
          ,,,,
          100,,,,
          ,,,,
          100
      ]),
      "hihat": pp(4, [
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
      ]),
  "pads": pp(4, [[e6(2),b5(7/4),g6(2)],,,,,,,,[fs6(2),d6(3/2),a5(11/2)],,,,,,,,[e6(2),c6(7/4),],,,,,,,,[d6(3/2),fs6(3/2),],,,,,,,], 8),

  "sinelead": pp(4, [,,fs5,,fs5(1/2),,e5,fs5,,fs5,e5(1/2),,fs5,,g5(1/2),,e4(1/2),,d5,e5(1/2),,d5,,b4,,as4,a4(1/2),,g4,,e4,d4]),


      "piano1": pp(4, [e3,hld,hld,hld,d6,e5,e4,fs5,d4,hld,hld,b3,hld,d4,e4,hld]),
      "piano2": pp(4, [,,b4,hld,,b4,hld,a4,hld,fs5,hld,,fs5,hld,b4,hld]),
      "piano3": pp(4, [,,g5,hld,,g5,hld,d5,hld,a4,hld,,d5,hld,g5,hld]),
      "bass": pp(4, [e2(1),,,e2,
                     e3,,e2,,
                     b2,,,b2,
                     ,,d3,e3])
    });

    playPatterns({

      "kick": pp(4, [
          100,,,,
          100,,,8,
          100,,,,
          100,,40
      ]),
      "hihat": pp(4, [
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
      ]),
  snare: pp(4, [
          ,,,,
          100,,,,
          ,,,50,
          100,,,30
      ]),
      "piano1": pp(4, [e5,hld,e6,e5,hld,d6,b5,fs5,hld,hld,fs5,hld,hld,hld,d5,hld]),
    "piano2": pp(4, [a3,hld,hld,hld,hld,e5,hld,d5,hld,hld,d5,hld,hld,e5,hld,e5]),
    "piano3": pp(4, [c5,hld,,c5,hld,b4,,a4,hld,hld,a4,hld,,d5,hld,]),
    "piano4": pp(4, [,a2,hld,hld,hld,g5,hld,b3,hld,hld,hld,hld,hld,a4,hld,]),
    "piano5": pp(4, [,,,,,,,b2,hld,hld,hld,hld,,,,]),
     "bass": pp(4, [c2,,,c3,
                     ,,c2,,
                     d2,,,d2,
                     d3,,d2]),
      
    });

  playPatterns({
		
      "kick": pp(4, [
          100,,,,
          100,,,8,
          100,,,,
          100
      ]),
      "snare": pp(4, [
          ,,,,
          100,,,,
          ,,,,
          100
      ]),
      "hihat": pp(4, [
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
      ]),
      "sinelead": pp(4, [e5(1/2),,g5(1/2),,a5(1/2),,b5,e5(1/2),,,,,,,,,,,g5(1/2),,a5,,b5,a5(1/2),,,b5(1/2),,d6(1/2),,,]),
      "bass": pp(4, [a2(1),,,,,,,a3,g2,,g2(1/2),,g3,g2(1/2),,,b2(3/4),,,,,,,b2(1/2),,,b2(1/2),,fs3,a3,,b3]),
	
		"piano": pp(4, [,b5(1/2),[,e6(1/2)],,g6(1/2),,fs6,d6(1/2),,,,,,,,,,,b5(1/2),,d6(1/2),,e6,b5(3/4),,,,,,,,], 8),
		"pads": pp(4, [[e6(9/4),c5(7/4),c6(2),g5(2),],,,,,,,,[,g5(7/4),d6(6),b4(2),g6(2)],,,,,,,,
  				[fs6(4),d5(4),,a6(4),a5(4)],,,,,,,,,,,,,,,], 8),


    });

    playPatterns({
		"piano": pp(4, [,,,[g7(1/2),fs5(1/2)],,[d7(1/2),b4(1/2)]], 8),
	"eftang": pp(4, [,,,,,,,,e5,b5,d6,g6,a6,d7(1/2),,e7]),


      "kick": pp(4, [
          100,,,,
          100,,,8,
          100,,,,
          100,,40
      ]),
      "hihat": pp(4, [
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
      ]),
  snare: pp(4, [
          ,,,,
          100,,,,
          ,,,50,
          100,30,,90
      ]),


    });

}


for(var n=0;n<2;n++) {
playPatterns({
  		"eftang": pp(4, [a3(1/2),,e5(1/2),,a5,b5(1/2),,c6(1/2),,b5,a5,g5(1/2),,d5(3/4),,]),
  		"bass": pp(4, [a2(1),,,,g3(1/2),,,g3,a3(1/2),,e3(1/2),,g3(1/2),,a3(1/2),,,,,,,,,,,,,,,,,]),

		"piano": pp(4, [[a5(1/2),e5(1/2),c6(1/2)],,,[a5(1/2),e5(1/2),c6(1/2)],,,[a5(1/2),e5(1/2),c6(1/2)],,,,[e5(1/2),a5(1/2),c6(1/2)],,,[a5(1/2),e5(1/2),c6(1/2)],,,[d5(1/2),g5(3/4),b5(3/4)],,,[g5(1/2),b5(1/2),d5(1/2)],,,,[a5(1/2),fs5(1/2),d5(1/2)],,,[fs5(3/4),d5(1/2),a5(1/2)],,,,[fs5(1/2),a5(1/2),d5(1/2)],], 8),
		"pads": pp(4, [[a3(4),e5(4),c6(4)],,,,,,,,,,,,,,,,[d6(4),b3(2),g5(2)],,,,,,,,[,fs5(2),d4(2)],,,,,,,], 8),

      "kick": pp(4, [
          100,,,,
          100,,,8,
          100,,,,
          100
      ]),
      "snare": pp(4, [
          ,,,,
          100,,,,
          ,,,,
          100
      ]),
      "hihat": pp(4, [
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
      ])
});
playPatterns({
		"eftang": pp(4, [b5(1/2),,d6(1/2),,b5,a5,g5,a5(3/4),,,b5(1/2),,a5,g5,e5,d5]),
  		"bass": pp(4, [b2(3/4),,,b3(1/2),,b3(1/2),,c3,d3(1/2),,d4(1/2),,,d3,e4,]),
		

      "kick": pp(4, [
          100,,,,
          100,,,8,
          100,,,,
          100
      ]),
      "snare": pp(4, [
          ,,,,
          100,,,,
          ,,,,
          100
      ]),
      "hihat": pp(4, [
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
      ])
});


playPatterns({
  		"eftang": pp(4, [a3(1/2),,e5(1/2),,a5,b5(1/2),,c6(1/2),,b5,a5,g5(1/2),,d5(3/4),,]),
  		"sinelead": pp(4, [a3(1/2),,e5(1/2),,a5,b5(1/2),,c6(1/2),,b5,a5,g5(1/2),,d5(3/4),,]),
  		"bass": pp(4, [a2(1),,,,g3(1/2),,,g3,a3(1/2),,e3(1/2),,g3(1/2),,a3(1/2),,,,,,,,,,,,,,,,,]),

		"pads": pp(4, [[a3(4),e5(4),c6(4)],,,,,,,,,,,,,,,,[d6(4),b3(2),g5(2)],,,,,,,,[,fs5(2),d4(2)],,,,,,,], 8),

      "kick": pp(4, [
          100,,,,
          100,,,8,
          100,,,,
          100
      ]),
      "snare": pp(4, [
          ,,,,
          100,,,,
          ,,,,
          100
      ]),
      "hihat": pp(4, [
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
      ])
});
playPatterns({
		"eftang": pp(4, [b5(1/2),,d6(1/2),,b5,a5,g5,a5(3/4),,,b5(1/2),,a5,g5,e5,d5]),
  		"sinelead": pp(4, [b5(1/2),,d6(1/2),,b5,a5,g5,a5(3/4),,,b5(1/2),,a5,g5,e5,d5]),
  		"bass": pp(4, [b2(3/4),,,b3(1/2),,b3(1/2),,c3,d3(1/2),,d4(1/2),,,d3,e4,]),

		"piano": pp(4, [[d5(1/2),g5(3/4)],,,[g5(1/2),b5(1/2)],,,,[a5(1/2),fs5(1/2)],,,[fs5(1/2),d5(1/2)],,g7(1/2),[,fs7(1/2)],d7(1/2),[,a6]], 8),

      "kick": pp(4, [
          100,,,,
          100,,,8,
          100,,,,
          100
      ]),
      "snare": pp(4, [
          ,,,,
          100,20,,,
          ,,,70,
          100,,,60
      ]),
      "hihat": pp(4, [
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
          30,30,90,30,
      ])
});
}
for(var n=0;n<4;n++) {
  playPatterns({
    "bass": pp(4, 
               
               [
      				[e2(8)],
      				[],
      				[
                      e2(0.5),,,e2,
                   	,,a2,as2,
                  	b2,,,d3,
                  	,,e3(0.5)
                  	],
      				[
                      e2(0.5),,,e2,
                   		,,a2,as2,
                  		b2,,b3,d3,
                  		,d4,e3(0.5)
                  	],
      				
    			]
               [n]
              
              ),
    "pads": pp(4, [[d6(2),g5(2),,,,,],[,,b5(2),d5(2),d6(2),b4(2),fs6(2)],,,,,,,,,,,,,], 8),
    "piano": pp(4, [[e3(7/4),g6(1/2),],[,,fs6(1/2)],[,d6,],[,a5(1/2),],[,,g5(5/4)],,,,,,fs5(3/4),,,,,], 8),
  "sinelead": pp(4, [e5,b5,e6,a6,d7(3/4),,,,,,,,,,,]),

    "kick": pp(4, [
            100,,,,
            100,,,8,
            100,,,,
            100
        ]),
    "hihat": pp(4, [
            30,30,90,30,
            30,30,90,30,
            30,30,90,30,
            30,30,90,30,
        ])
  });
}
