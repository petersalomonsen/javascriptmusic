const incMake4k = require('../4klang_inc/4klang_inc.make.js');
const fs = require('fs');

global.bpm = 120;
global.pattern_size_shift = 4;
calculatePatternSize();
global.looptimes = 2;

addInstrument('instr1', fs.readFileSync('./instruments/LD_AlphaOmegaMS.inc').toString());

playPatterns({instr1: pp(4,[
    c5(2),,,,
    e5(2),,,,
    g5(2),,,,
])})

incMake4k.makeVierKlangInc();