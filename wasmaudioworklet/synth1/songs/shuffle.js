global.bpm =  90;
global.pattern_size_shift = 3;
global.beats_per_pattern_shift = 0;
calculatePatternSize();
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


playPatterns({
  kick: pp(4,[
    80, , , ,
    80, , , ,
    80, , , ,
    80, , 30, ,]),
  hihat: pp(6,[
    80,,20,80,,50,
  	80,,20,80,,50,
  	80,,20,80,,50,
  	80,,20,80,,50,]),
  snare: pp(6,[
    ,,,,,,
  	80,,,,,30,
  	,,60,,,20,
  	80,,,,,30,]),
  bass: pp(6,[
  	d2(1),,,,,c3,
    d3,,,,,c3,
    ,,c3,,,a2,
    c3(0.5),,,d3
  ]),
  piano: pp(6,[
  	,,,[a4,d5,fs5],,,
    ,,[a4,d5,fs5],,,
    [b4,d5,g5],,,[c5,e5,a5],,,
    ,,,,[a4,d5,fs5],    
  ],4)
});

