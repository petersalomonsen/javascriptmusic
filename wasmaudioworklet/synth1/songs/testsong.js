const vierklang = require('../../../4klang/4klang_inc/4klang_inc.make.js');

global.bpm = 120;
global.pattern_size_shift = 4;
// global.looptimes = 100;

/*soloInstrument('pad1');
soloInstrument('pad2');
soloInstrument('pad3');*/
// soloInstrument('lead');

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

playPatterns({
	drivelead: pp(4, [
		a5(8),,,,
		,,,,
		,,,,
		,,as5,c6,
		g5(4),,,,
		,,,,
		,,,,
		,,f5,e5,
		f5(2),,,d5(2)
	]),
	lead1: pp(4, [
		a6(1),,,f6,
		,,,,
		,,,,
		,,,,
		e6(1),,,c6
	]),
	bass: pp(4, [
		d3,,,,
		d3,,,c3,
		,,,,
		,,,,
		a2(2),,,a3,
		a2,,a2,as2,
		,,,,
		c3,,c4
	]),
	drums: pp(4,[
		50,,,,
		[,50],,,50,
		,,50,,
		[,50],,,,
		50,,,,
		[,50],,,50,
		,20,50,,
		[,50],,,,
	],2),
	pads: pp(4, [
		[d5,f5,a5],,,[d5,f5,a5],
		,,[d5,f5,as5],,
		,,[d5,f5,a5],,
		,,,,
		[c5,e5,g5],,,[c5,e5,g5],
		,,[c5,e5,a5],,
		,,[c5,e5,g5]
	],3)
},2);

playPatterns({
	lead1: pp(4, [
		f6(1),,,d6,
		,,,,
		,,,,
		,,,,
		g6(1),,,e6
	]),
	bass: pp(4, [
		g2,,,,
		g3,,,g3,
		,,,,
		,,,,
		c2(2),,,c3,
		c2,,c2,c2,
		,,,,
		c3,,c4
	]),
	drums: pp(4,[
		50,,,,
		[,50],,,50,
		,,50,,
		[,50],,,,
		50,,,,
		[,50],,,50,
		,20,50,,
		[,50],,,,
	],2),
	pads: pp(4, [
		[as4,d5,f5],,,[as4,d5,f5],
		,,[as4,d5,g5],,
		,,[as4,d5,f5],,
		,,,,
		[c5,e5,g5],,,[c5,e5,g5],
		,,[c5,f5,g5],,
		,,[c5,e5,g5]
	],3)
},2);

const patterns = vierklang.generatePatterns();
const instrumentPatternLists = vierklang.generateInstrumentPatternLists();

module.exports = {
    patterns: patterns,
    instrumentPatternLists: instrumentPatternLists
}

require('fs').writeFileSync('testsong.json', JSON.stringify(module.exports));