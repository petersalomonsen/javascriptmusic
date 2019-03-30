const vierklang = require('../../../4klang/4klang_inc/pattern_tools.js');

global.bpm = 120;
global.pattern_size_shift = 4;
// global.looptimes = 100;

/*soloInstrument('pad1');
soloInstrument('pad2');
soloInstrument('pad3');*/
// soloInstrument('lead1');

addInstrument('lead1', '');
addInstrument('bass', '');
addInstrument('pad1', '');
addInstrument('pad2', '');
addInstrument('pad3', '');
addInstrumentGroup('pads', ['pad1', 'pad2', 'pad3']);
addInstrument('kick', '');
addInstrument('snare', '');
addInstrumentGroup('drums', ['kick', 'snare']);
addInstrument('drivelead', '');
addInstrument('hihat', '');

playPatterns({
	kick: pp(4, [
		64, , , ,
		64, , , ,
		64, , , ,
		64, , , ,])
});
const patterns = vierklang.generatePatterns();
const instrumentPatternLists = vierklang.generateInstrumentPatternLists();

module.exports = {
    patterns: patterns,
    instrumentPatternLists: instrumentPatternLists
}

require('fs').writeFileSync('kickbeat.json', JSON.stringify(module.exports));