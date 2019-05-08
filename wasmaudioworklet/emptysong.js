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

playPatterns({
	kick: pp(4, [
		64, , , ,
		64, , , ,
		64, , , ,
		64, , , ,])
});
