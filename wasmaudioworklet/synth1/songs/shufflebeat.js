global.bpm =  80;
global.pattern_size_shift = 3;
global.beats_per_pattern_shift = 1;
calculatePatternSize();
// global.looptimes = 100;


 
// soloInstrument('sinelead');
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
  hihat: pp(4, [
    60,,30,60,,30,
    60,,30,60,,30,
    60,,30,60,,30,
    60,,30,60,,30
  ]),
  kick: pp(4, [
    60,,,,,,
  	,,,,,,
    ,,,60,,20,
  	]),
  snare: pp(4, [
    ,,,,,,60
    ,,,,,40,
    ,,10,,,,60
    ,,,,,20
  ])
});