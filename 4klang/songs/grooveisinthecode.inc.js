const incMake4k = require('../4klang_inc/4klang_inc.make.js');
global.bpm = 120;
global.pattern_size_shift = 4;
calculatePatternSize();
global.looptimes = 1;

addInstrument('lead1',`GO4K_ENV        ATTAC(24),DECAY(70),SUSTAIN(32),RELEASE(64),GAIN(60)
GO4K_VCO        TRANSPOSE(76),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(64),FLAGS(NOISE)
GO4K_DST        DRIVE(64), SNHFREQ(0), FLAGS(0)
GO4K_VCO        TRANSPOSE(16),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(TRISAW|LFO)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FST        AMOUNT(40),DEST(10*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FST        AMOUNT(58),DEST(10*MAX_UNIT_SLOTS+5+FST_SET)
GO4K_FOP        OP(FOP_POP)
GO4K_VCO        TRANSPOSE(76),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(SINE)
GO4K_VCO        TRANSPOSE(83),DETUNE(64),PHASE(64),GATES(85),COLOR(90),SHAPE(64),GAIN(48),FLAGS(SINE)
GO4K_VCF        FREQUENCY(77),RESONANCE(24),VCFTYPE(BANDPASS)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_PUSH)
GO4K_VCF        FREQUENCY(32),RESONANCE(128),VCFTYPE(BANDPASS)
GO4K_FOP        OP(FOP_XCH)
GO4K_VCF        FREQUENCY(96),RESONANCE(128),VCFTYPE(BANDPASS)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_MULP)
GO4K_DLL        PREGAIN(64),DRY(100),FEEDBACK(70),DAMP(64),FREQUENCY(56),DEPTH(48),DELAY(17),COUNT(2)
GO4K_PAN        PANNING(36)
GO4K_OUT        GAIN(65), AUXSEND(80)`);
addInstrument('bass', `
GO4K_ENV	ATTAC(32),DECAY(70),SUSTAIN(60),RELEASE(75),GAIN(32)
GO4K_FST	AMOUNT(120),DEST(0*MAX_UNIT_SLOTS+2+FST_SET)
GO4K_VCO	TRANSPOSE(76),DETUNE(64),PHASE(32),GATES(85),COLOR(80),SHAPE(64),GAIN(128),FLAGS(PULSE)
GO4K_VCO	TRANSPOSE(76),DETUNE(72),PHASE(32),GATES(85),COLOR(96),SHAPE(64),GAIN(128),FLAGS(TRISAW)
GO4K_VCO	TRANSPOSE(32),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(90),GAIN(128),FLAGS(SINE|LFO)
GO4K_FST	AMOUNT(68),DEST(2*MAX_UNIT_SLOTS+2+FST_SET)
GO4K_FST	AMOUNT(60),DEST(3*MAX_UNIT_SLOTS+2+FST_SET)
GO4K_FOP	OP(FOP_POP)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCF	FREQUENCY(18),RESONANCE(64),VCFTYPE(PEAK)
GO4K_VCF	FREQUENCY(32),RESONANCE(48),VCFTYPE(LOWPASS)
GO4K_DST	DRIVE(88), SNHFREQ(128), FLAGS(0)
GO4K_PAN	PANNING(80)
GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(17),COUNT(1) ; ERROR
GO4K_FOP	OP(FOP_XCH)
GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(64),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(18),COUNT(1) ; ERROR
GO4K_FOP	OP(FOP_XCH)
GO4K_OUT	GAIN(18), AUXSEND(10)
`);

const pad = (panning) => `	GO4K_ENV	ATTAC(32),DECAY(70),SUSTAIN(80),RELEASE(70),GAIN(80)
GO4K_VCO	TRANSPOSE(16),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(120),FLAGS(TRISAW|LFO)
GO4K_FST	AMOUNT(80),DEST(13*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FST	AMOUNT(48),DEST(9*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FST	AMOUNT(58),DEST(9*MAX_UNIT_SLOTS+5+FST_SET)
GO4K_FOP	OP(FOP_POP)
GO4K_VCO	TRANSPOSE(76),DETUNE(64),PHASE(0),GATES(85),COLOR(30),SHAPE(64),GAIN(128),FLAGS(TRISAW)
GO4K_VCO	TRANSPOSE(76),DETUNE(64),PHASE(32),GATES(85),COLOR(90),SHAPE(64),GAIN(64),FLAGS(TRISAW)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(8),FLAGS(NOISE)
GO4K_VCF	FREQUENCY(105),RESONANCE(20),VCFTYPE(BANDPASS)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_PUSH)
GO4K_VCF	FREQUENCY(14),RESONANCE(128),VCFTYPE(BANDPASS)
GO4K_FOP	OP(FOP_XCH)
GO4K_VCF	FREQUENCY(70),RESONANCE(128),VCFTYPE(BANDPASS)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_MULP)
GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(64),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(11),COUNT(1)
GO4K_PAN	PANNING(${panning})
GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(64),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(11),COUNT(1)
GO4K_OUT	GAIN(32), AUXSEND(64)
`;

addInstrument('pad1', pad(30));
addInstrument('pad2', pad(60));
addInstrument('pad3', pad(100));
addInstrumentGroup('pads', ['pad1', 'pad2', 'pad3']);
addInstrument('kick', `	GO4K_ENV	ATTAC(0),DECAY(64),SUSTAIN(96),RELEASE(64),GAIN(90)
GO4K_FST	AMOUNT(128),DEST(0*MAX_UNIT_SLOTS+2+FST_SET)
GO4K_ENV	ATTAC(0),DECAY(70),SUSTAIN(0),RELEASE(0),GAIN(100)
GO4K_DST	DRIVE(32), SNHFREQ(128), FLAGS(0)
GO4K_FST	AMOUNT(80),DEST(6*MAX_UNIT_SLOTS+1+FST_SET)
GO4K_FOP	OP(FOP_POP)
GO4K_VCO	TRANSPOSE(46),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(48),FLAGS(TRISAW)
GO4K_FOP	OP(FOP_MULP)
GO4K_FOP	OP(FOP_LOADNOTE)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(40)
GO4K_OUT	GAIN(12), AUXSEND(1)`);
addInstrument('snare', `GO4K_ENV	ATTAC(0),DECAY(72),SUSTAIN(0),RELEASE(72),GAIN(25)
GO4K_FST	AMOUNT(128),DEST(0*MAX_UNIT_SLOTS+2+FST_SET)
GO4K_ENV	ATTAC(0),DECAY(56),SUSTAIN(0),RELEASE(0),GAIN(128)
GO4K_FST	AMOUNT(108),DEST(6*MAX_UNIT_SLOTS+1+FST_SET)
GO4K_FST	AMOUNT(72),DEST(7*MAX_UNIT_SLOTS+1+FST_SET)
GO4K_FOP	OP(FOP_POP)
GO4K_VCO	TRANSPOSE(16),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(32),GAIN(64),FLAGS(SINE)
GO4K_VCO	TRANSPOSE(32),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(80),GAIN(64),FLAGS(SINE)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(10),GAIN(64),FLAGS(NOISE)
GO4K_VCF	FREQUENCY(96),RESONANCE(128),VCFTYPE(LOWPASS)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(16),FLAGS(NOISE)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCF	FREQUENCY(22),RESONANCE(32),VCFTYPE(HIGHPASS)
GO4K_FOP	OP(FOP_LOADNOTE)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(56)
GO4K_OUT	GAIN(4), AUXSEND(2)
GO4K_FLD    AMOUNT(100)
GO4K_FST	AMOUNT(64),DEST(6*MAX_UNIT_SLOTS+1+FST_SET)
GO4K_FST	AMOUNT(64),DEST(7*MAX_UNIT_SLOTS+1+FST_SET)
GO4K_FOP	OP(FOP_POP)
`);

addInstrumentGroup('drums', ['kick', 'snare']);
addInstrument('drivelead', `GO4K_ENV        ATTAC(32),DECAY(64),SUSTAIN(90),RELEASE(48),GAIN(35)

GO4K_VCO        TRANSPOSE(76),DETUNE(70),PHASE(0),GATES(127),COLOR(10),SHAPE(110),GAIN(128),FLAGS(PULSE)
GO4K_VCO        TRANSPOSE(76),DETUNE(64),PHASE(64),GATES(127),COLOR(20),SHAPE(20),GAIN(128),FLAGS(PULSE)
GO4K_VCO        TRANSPOSE(76),DETUNE(58),PHASE(128),GATES(127),COLOR(30),SHAPE(110),GAIN(128),FLAGS(PULSE)

GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_ADDP)

GO4K_FOP        OP(FOP_MULP)

GO4K_VCO        TRANSPOSE(48),DETUNE(64),PHASE(64),GATES(0x80),COLOR(127),SHAPE(64),GAIN(50),FLAGS(SINE|LFO)
GO4K_FST        AMOUNT(104),DEST(10*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FOP        OP(FOP_POP)
GO4K_VCF        FREQUENCY(94),RESONANCE(120),VCFTYPE(LOWPASS)

GO4K_DLL        PREGAIN(64),DRY(100),FEEDBACK(70),DAMP(64),FREQUENCY(56),DEPTH(48),DELAY(17),COUNT(2)
GO4K_PAN		PANNING(50)
GO4K_DLL        PREGAIN(64),DRY(100),FEEDBACK(70),DAMP(64),FREQUENCY(56),DEPTH(48),DELAY(16),COUNT(1)
GO4K_OUT        GAIN(10), AUXSEND(52)`);

addInstrument('hihat', `	GO4K_ENV	ATTAC(0),DECAY(64),SUSTAIN(15),RELEASE(32),GAIN(100)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(NOISE)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCF	FREQUENCY(128),RESONANCE(128),VCFTYPE(BANDPASS)
GO4K_FOP	OP(FOP_LOADNOTE)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(56)
GO4K_OUT	GAIN(44), AUXSEND(0)
`);
addInstrument('squarelead', `GO4K_ENV	ATTAC(0),DECAY(70),SUSTAIN(0),RELEASE(70),GAIN(64)
GO4K_ENV	ATTAC(0),DECAY(80),SUSTAIN(0),RELEASE(80),GAIN(128)
GO4K_FST	AMOUNT(96),DEST(18*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FST	AMOUNT(96),DEST(19*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FOP	OP(FOP_POP)
GO4K_FOP	OP(FOP_PUSH)
GO4K_VCO	TRANSPOSE(72),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(SINE|LFO)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FST	AMOUNT(32),DEST(13*MAX_UNIT_SLOTS+5+FST_SET)
GO4K_FOP	OP(FOP_POP)
GO4K_VCO	TRANSPOSE(96),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(SINE|LFO)
GO4K_FST	AMOUNT(80),DEST(15*MAX_UNIT_SLOTS+2+FST_SET)
GO4K_FOP	OP(FOP_POP)
GO4K_VCO	TRANSPOSE(76),DETUNE(64),PHASE(0),GATES(85),COLOR(128),SHAPE(64),GAIN(128),FLAGS(PULSE)
GO4K_VCO	TRANSPOSE(88),DETUNE(64),PHASE(0),GATES(85),COLOR(100),SHAPE(64),GAIN(128),FLAGS(TRISAW)
GO4K_FOP	OP(FOP_ADDP)
GO4K_VCF	FREQUENCY(82),RESONANCE(96),VCFTYPE(LOWPASS)
GO4K_VCF	FREQUENCY(64),RESONANCE(96),VCFTYPE(LOWPASS)
GO4K_FOP	OP(FOP_MULP)
GO4K_DLL    PREGAIN(64),DRY(100),FEEDBACK(70),DAMP(64),FREQUENCY(56),DEPTH(48),DELAY(17),COUNT(2)
GO4K_PAN	PANNING(64)
GO4K_DLL    PREGAIN(64),DRY(100),FEEDBACK(70),DAMP(64),FREQUENCY(56),DEPTH(48),DELAY(18),COUNT(2)
GO4K_OUT	GAIN(16), AUXSEND(32)
`);

setGlobalParamDefs(`GO4K_ACC	ACCTYPE(AUX)
GO4K_DLL	PREGAIN(55),DRY(70),FEEDBACK(100),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(0),COUNT(8)
GO4K_FOP	OP(FOP_XCH)
GO4K_DLL	PREGAIN(55),DRY(70),FEEDBACK(100),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(8),COUNT(8)
GO4K_FOP	OP(FOP_XCH)
GO4K_ACC	ACCTYPE(OUTPUT)
GO4K_FOP	OP(FOP_ADDP2)
GO4K_OUT	GAIN(128), AUXSEND(0)
`);

for(var n=0;n<2;n++) {
    playPatterns({
    	kick: pp(4,[
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [d2,hld,,d3,hld,,d3,hld,d2,hld,,,,,,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "snare": n === 1 ? pp(4, [,,,,79,1,,,,,,,79,]) : null
    
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": n === 1 ? pp(4, [,,,,79,1,,,,,,,79,]) : null
    });
    
    playPatterns({
    	kick: pp(4,[
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": n === 1 ? pp(4, [,,,,79,1,,,,,,,79,]) : null
    });
    
    playPatterns({
    	kick: pp(4,[
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": n === 1 ? pp(4, [,,,,79,1,,,,,,50,79,,,30]) : null
    });
}
//playFromHere();
for(var n=0;n<2;n++) {

    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [d2,hld,,d3,hld,,d3,hld,d2,hld,hld,hld,hld,hld,hld,]),
        "pad1": pp(4, [f5,hld,,a5,hld,,as5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "pad2": pp(4, [d5,hld,,f5,hld,,f5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "pad3": pp(4, [a5,hld,,d5,hld,,d5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,hld,d5,hld,hld,]),
        "drivelead": pp(4, [
        ,,,,d6,hld,hld,,c6,d6,hld,hld,
        c6,hld,a5,hld,f6,hld,
        c6,d6,hld,hld,c6,hld,hld,hld,hld,hld,hld,,c6,d6,
        ,,g6,hld,hld,,
        g6,hld,hld,hld,hld,hld,f6,hld,d6,,f6,hld,,g6,hld,hld,f6,hld,hld,hld,e6,hld,d6,hld,c6,hld]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,hld,hld,hld,hld,hld,]),
        "pad1": pp(4, [f5,hld,,f5,hld,hld,c5,hld,hld,hld,hld,hld,hld,hld,hld,]),
    "pad2": pp(4, [a5,hld,,c5,hld,hld,e5,hld,hld,hld,hld,hld,hld,hld,hld,]),
    "pad3": pp(4, [c5,hld,,a5,hld,hld,g5,hld,hld,hld,hld,hld,hld,hld,hld,]),
    
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,hld,hld,hld,hld,hld,]),
        "pad1": pp(4, [f5,hld,,a5,hld,,as5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "pad2": pp(4, [d5,hld,,f5,hld,,f5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "pad3": pp(4, [a5,hld,,d5,hld,,d5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,40,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,hld,hld,hld,hld,hld,]),
        "pad1": pp(4, [f5,hld,,f5,hld,hld,c5,hld,hld,hld,hld,hld,hld,hld,hld,]),
    "pad2": pp(4, [a5,hld,,c5,hld,hld,e5,hld,hld,hld,hld,hld,hld,hld,hld,]),
    "pad3": pp(4, [c5,hld,,a5,hld,hld,g5,hld,hld,hld,hld,hld,hld,hld,hld,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "hihat": pp(4, [79,1,43,1,20,1,43,1,79,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    });
}

for(var n=0;n<2;n++) {
   playPatterns({
    	kick: pp(4,[
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [d2,hld,,d3,hld,,d3,hld,d2,hld,,,,,,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    "drivelead": pp(4, [
        ,,a4,hld,
        d5,hld,a4,a5,
        hld,a4,g5,hld,
        f5,,e5,,
        d5,hld,a4,hld,
        d5,hld,a4,a5,
        hld,a4,g5,hld,
        f5,hld,e5,,
        d5,hld,hld,hld,
        ,,,,
        ,,,,
        ,,,g5,
        a5,hld,hld,hld,c6,hld,a5,hld,hld,hld,hld,,,,,]),

    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
}

// playFromHere();

for(var n=0;n<2;n++) {
    playPatterns({
    	kick: pp(4,[
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [d2,hld,,d3,hld,,d3,hld,d2,hld,,,,,,]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    "drivelead": pp(4, [,,,,
    ,,,a5,
    d6,,d6,,
    a5,hld,d6,e6,
    ,,,,
    ,,,a5,
    e6,,e6,hld,
    a5,e6,,e6,
    f6,hld,e6,hld,
    d6,hld,c6,a5,
    hld,,,,
    ,,,g5,
    a5,hld,c6,hld,
    a5,hld,g5,a5,
    f5,hld,hld,hld,
    ,,,]),
    "pad1": pp(1/4, [d5(4),c6(4),as5(4),a5(4)]),
"pad2": pp(1/4, [f5(4),g5(4),g5(4),f5(4)]),
"pad3": pp(1/4, [a5(4),e5(4),d5(4),c5(4)]),


    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
        "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
    
    playPatterns({
    	kick: pp(4, [
    		64, , , ,
    		64, , , ,
    		64, , , ,
    		64, , , ,]),
    	"bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,,,,,,]),
    	"hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
        "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
        "snare": pp(4, [,,,,79,1,,,,,,,79,])
    });
}

playPatterns({
	kick: pp(4, [
		64, , , ,
		64, , , ,
		64, , , ,
		64, , , ,]),
	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,]),
    
    "drivelead": pp(4, [,,,,,,,,,,c5,d5,f5,hld,g5,,,,,,,,,,,,,,,,,]),
});

playPatterns({
	kick: pp(4, [
		64, , , ,
		64, , , ,
		64, , , ,
		64, , , ,]),
	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,])
});


playPatterns({
	kick: pp(4, [
		64, , , ,
		64, , , ,
		64, , , ,
		64, , , ,]),
	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1]),
    "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "snare": pp(4, [,,,,79,1,,,,,,,79,])
});

// playFromHere();

playPatterns({
	kick: pp(4, [
		64, , , ,
		64, , , ,
		64, , ,32,
		64, , , ,]),
	"bass": pp(4, [c2,hld,,c3,hld,,c3,hld,d2,hld,d3,,f2,,f3,hld]),
	"pads": pp(1, [,,[g5(1),e5(1),c5(1)],[a5(1),f5(1),d5(1)]], 3),
    "hihat": pp(4, [79,1,43,20,79,1,43,1,79,1,43,20,79,1,43,30]),
    "lead1": pp(4, [f6,hld,e6,hld,,,c6,hld,hld,,g5,hld,hld,e5,hld]),
    "snare": pp(4, [,,,,79,1,,,,,,30,79,,,20])
});

// playFromHere();

const kickpattern22 = pp(4, [
    	    64,,,,
    	    ,,,,
    	    ,20,64,,
    	    ,,,,
    		]);
const hihatpattern22 = pp(4, [
    	    80,10,80,40,
    	    80,10,80,30,
    	    80,10,80,40,
    	    80,40,80,30,
    		]);
    		


for(var n=0;n<2;n++) {
    playPatterns({
    	kick: kickpattern22,
    	"bass": pp(4, [
    	    g2(1),,,,
    	    ,,,g3,
    	    ,g3,g2,,
    	    d3,,g3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [
            [g5(0.5),as5(0.5),d5(0.5)],,,,
            ,,,[g5,as5,d5],
            ,[g5(0.5),as5(0.5),d5(0.5)]
        ], 3),
        "squarelead": pp(4, [,,g5,,
            g5,,f5,g5,
            ,g5,d5,,
            f5,,g5,,
            a5,,,,
            ,,,,
            a5,c6,a5,c5,
            g5,,f5,,
            c6,g5,,g5,
            ,,f5,g5,
            ,,a5,g5,
            ,,f5,d5]),
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
    });
    
    
    playPatterns({
        kick: kickpattern22,
    	"bass": pp(4, [
    	    f2(1),,,,
    	    ,,,f3,
    	    ,f3,f2,,
    	    c3,,f3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [
            [a5(0.5),f5(0.5),c5(0.5)],,,,
            ,,,[a5,f5,c5],
            ,[a5(0.5),f5(0.5),c5(0.5)]
        ], 3),
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
    });
    
    playPatterns({
        kick: kickpattern22,
    	"bass": pp(4, [
    	    a2(1),,,a3,
    	    ,,a2,,
    	    c3(1),,,c4,
    	    ,,c3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [
            [g5,e5,c5],,,[g5,e5,c5],
            ,,,,
            [g5,ds5,c5],,,[g5,ds5,c5],
            ,,,,
            
            ], 3),
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
        
    });
    
    playPatterns({
        kick: kickpattern22,
    	"bass": pp(4, [
    	    g2(1),,,,
    	    ,,,g3,
    	    ,g3,g2,,
    	    d3,,g3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [
            [f5,as4,d4],,,,
            ,,[f5(1),as4(1),d4(1)]
        ], 3),
        "squarelead": n==1 ? pp(4, [,,,,
                ,,,,
                c5,d5,,
                f5,,g5,,
                f5
            ]) : null,
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
    });
}    


// playFromHere();

for(var n=0;n<2;n++) {
    playPatterns({
    	kick: kickpattern22,
    	"bass": pp(4, [
    	    f2(1),,,,
    	    ,,,f3,
    	    ,f3,f2,,
    	    c3,,f3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [
            [a4(0.5),c5(0.5),f5(0.5)],,,,
            ,,,[a4,c5,f5]
        ], 3),
        "squarelead": pp(4, [
                    ,,a5,,
                    a5,,f5,g5,
                    ,g5,f5,,
                    g5,,a5,g5,
                    ,g5,f5,g5,c6,
                    ,f5,g5,,
                    g5,f5,g5,c6,
                    ,g5,f5
                ]),
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
    });
    playPatterns({
    	kick: kickpattern22,
    	"bass": pp(4, [
    	    a2(1),,,,
    	    ,,,a3,
    	    ,a3,a2,,
    	    e3,,a3]),
        "hihat": hihatpattern22,
        "pads": pp(4, [[a4(0.5),c5(0.5),e5(0.5)],,,,
        ,,,[a4,c5,e5]], 3),
        
        "snare": pp(4, [,,,,79,,,80,,30,,,80])
    });
    playPatterns({
    	kick: kickpattern22,
    	"bass": pp(4, [
    	    c3(1),,,c4,
    	    ,,c3(0.5),,
    	    g2(1),,,g3,
    	    ,,g2(0.5)]),
        "hihat": hihatpattern22,
        "pads": pp(0.5, [
            [g4(2),c5(2),ds5(2)],
            [f4(2),as4(2),d5(2)]
        ], 3),
        "squarelead": pp(4, [,,,,
                ,,,,
                c5,d5,,
                f5,,g5,,
                f5
            ]),
        "snare": pp(4, [,,,,79,,,80,,20,70,,20,70,,30])
    });
}    

    
let patterns25 = {
	kick: pp(4,[
		64, , , ,
		64, , , ,
		64, , , ,
		64, , , ,]),
	"bass": pp(4, [d2,hld,,d3,hld,,d3,hld,d2,hld,,,,,,]),
	"squarelead": pp(4, [
	            f5,d5,,,
	            ,,g5,,
	            ,,a5
            ]),
    "lead1": pp(4, [d6,hld,c6,hld,,,g5,hld,hld,,a5,hld,hld,,d5,hld]),
    "hihat": pp(4, [79,1,43,1,79,1,43,1,79,1,43,1,79,1,43,1])
};

for(var n=0; n<4;n ++) {
    playPatterns(patterns25);
}

patterns25 = Object.assign({},patterns25,{
    "snare": pp(4, [,,,,79,1,,,,,,,79,])
});

// playFromHere();
for(var n=0;n<2;n++) {
    playPatterns(patterns25);
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
    }));
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,,,,,,]),
    }));
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,,,,,,]),
    }));

    patterns25 = Object.assign({}, patterns25, {
    	"squarelead": pp(4, [
	            f5,d5,,,
	            ,,g5,,
	            ,,a5,,
	            c6,,d6
            ]),
    });
}

for(var n=0;n<2;n++) {
    playPatterns(Object.assign({},patterns25,{
         "drivelead": pp(4, [
            ,,,,d6,hld,hld,,c6,d6,hld,hld,
            c6,hld,a5,hld,f6,hld,
            c6,d6,hld,hld,c6,hld,hld,hld,hld,hld,hld,,c6,d6,
            ,,g6,hld,hld,,
            g6,hld,hld,hld,hld,hld,f6,hld,d6,,f6,hld,,g6,hld,hld,f6,hld,hld,hld,e6,hld,d6,hld,c6,hld]),
    }));
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [c2,hld,,c3,hld,,c3,hld,c2,hld,,,,,,]),
    }));
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [g2,hld,,g3,hld,,g3,hld,g2,hld,,,,,,]),
    }));
    
    playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [f2,hld,,f3,hld,,f3,hld,f2,hld,,,,,,]),
    }));
}

playPatterns(patterns25);
playPatterns(patterns25);
playPatterns(patterns25);
playPatterns(Object.assign({},patterns25,{
        "bass": pp(4, [d2(4)]),
        "snare": undefined,
        "kick": pp(4, [64])
}),4);

incMake4k.makeVierKlangInc();