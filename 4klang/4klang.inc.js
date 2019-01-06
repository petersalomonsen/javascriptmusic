const incMake4k = require('./4klang_inc/4klang_inc.make.js');
const instrmap = require('./instruments/instrumentmap.js');
const fs = require('fs');

const flute = `GO4K_ENV        ATTAC(48),DECAY(80),SUSTAIN(64),RELEASE(64),GAIN(40)
GO4K_VCO        TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(64),FLAGS(NOISE)
GO4K_DST        DRIVE(64), SNHFREQ(0), FLAGS(0)
GO4K_VCO        TRANSPOSE(16),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(TRISAW|LFO)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FST        AMOUNT(40),DEST(10*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FST        AMOUNT(58),DEST(10*MAX_UNIT_SLOTS+5+FST_SET)
GO4K_FOP        OP(FOP_POP)
GO4K_VCO        TRANSPOSE(88),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(SINE)
GO4K_VCO        TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(5),FLAGS(NOISE)
GO4K_VCF        FREQUENCY(77),RESONANCE(24),VCFTYPE(BANDPASS)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_PUSH)
GO4K_VCF        FREQUENCY(32),RESONANCE(128),VCFTYPE(BANDPASS)
GO4K_FOP        OP(FOP_XCH)
GO4K_VCF        FREQUENCY(96),RESONANCE(128),VCFTYPE(BANDPASS)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_MULP)
GO4K_DLL        PREGAIN(64),DRY(128),FEEDBACK(64),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(17),COUNT(1) ; ERROR
GO4K_PAN        PANNING(80)
GO4K_OUT        GAIN(65), AUXSEND(80)`;

const pad = `GO4K_ENV        ATTAC(85),DECAY(128),SUSTAIN(100),RELEASE(80),GAIN(50)
GO4K_VCO        TRANSPOSE(16),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(TRISAW|LFO)
GO4K_FST        AMOUNT(80),DEST(13*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FST        AMOUNT(48),DEST(9*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FST        AMOUNT(58),DEST(9*MAX_UNIT_SLOTS+5+FST_SET)
GO4K_FOP        OP(FOP_POP)
GO4K_VCO        TRANSPOSE(64),DETUNE(56),PHASE(0),GATES(85),COLOR(4),SHAPE(64),GAIN(128),FLAGS(TRISAW)
GO4K_VCO        TRANSPOSE(76),DETUNE(72),PHASE(0),GATES(85),COLOR(8),SHAPE(64),GAIN(128),FLAGS(TRISAW)
GO4K_VCO        TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(16),FLAGS(NOISE)
GO4K_VCF        FREQUENCY(105),RESONANCE(18),VCFTYPE(BANDPASS)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_PUSH)
GO4K_VCF        FREQUENCY(26),RESONANCE(128),VCFTYPE(BANDPASS)
GO4K_FOP        OP(FOP_XCH)
GO4K_VCF        FREQUENCY(96),RESONANCE(128),VCFTYPE(LOWPASS)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_MULP)
GO4K_DLL        PREGAIN(112),DRY(64),FEEDBACK(64),DAMP(64),FREQUENCY(56),DEPTH(48),DELAY(17),COUNT(1)
GO4K_PAN        PANNING(40)
GO4K_OUT        GAIN(34), AUXSEND(20)`;

const lead = `

GO4K_ENV        ATTAC(48),DECAY(48),SUSTAIN(100),RELEASE(48),GAIN(45)

GO4K_VCO        TRANSPOSE(64),DETUNE(68),PHASE(0),GATES(127),COLOR(8),SHAPE(64),GAIN(128),FLAGS(PULSE)
GO4K_VCO        TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(127),COLOR(8),SHAPE(64),GAIN(128),FLAGS(PULSE)
GO4K_VCO        TRANSPOSE(64),DETUNE(60),PHASE(128),GATES(127),COLOR(8),SHAPE(64),GAIN(128),FLAGS(PULSE)

GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_ADDP)

GO4K_FOP        OP(FOP_MULP)

GO4K_VCO        TRANSPOSE(32),DETUNE(64),PHASE(64),GATES(0x80),COLOR(127),SHAPE(64),GAIN(50),FLAGS(SINE|LFO)
GO4K_FST        AMOUNT(104),DEST(10*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FOP        OP(FOP_POP)
GO4K_VCF        FREQUENCY(80),RESONANCE(128),VCFTYPE(LOWPASS)

GO4K_DLL        PREGAIN(64),DRY(90),FEEDBACK(50),DAMP(64),FREQUENCY(56),DEPTH(48),DELAY(17),COUNT(1)
GO4K_PAN		PANNING(64)
GO4K_OUT        GAIN(31), AUXSEND(55)`;

const bass = `GO4K_ENV        ATTAC(16),DECAY(64),SUSTAIN(96),RELEASE(86),GAIN(80)
GO4K_ENV        ATTAC(16),DECAY(72),SUSTAIN(64),RELEASE(70),GAIN(100)
GO4K_FST        AMOUNT(104),DEST(9*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FOP        OP(FOP_POP)
GO4K_VCO        TRANSPOSE(64),DETUNE(68),PHASE(0),GATES(85),COLOR(0),SHAPE(64),GAIN(128),FLAGS(TRISAW)
GO4K_VCO        TRANSPOSE(64),DETUNE(60),PHASE(0),GATES(85),COLOR(0),SHAPE(64),GAIN(128),FLAGS(TRISAW)
GO4K_VCO        TRANSPOSE(76),DETUNE(64),PHASE(0),GATES(85),COLOR(6),SHAPE(64),GAIN(128),FLAGS(TRISAW)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_ADDP)
GO4K_VCF        FREQUENCY(32),RESONANCE(128),VCFTYPE(LOWPASS)
GO4K_FOP        OP(FOP_MULP)
GO4K_DLL        PREGAIN(64),DRY(128),FEEDBACK(55),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(9),COUNT(8) ; ERROR
GO4K_PAN        PANNING(70)
GO4K_DLL        PREGAIN(64),DRY(128),FEEDBACK(28),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(17),COUNT(1) ; ERROR
GO4K_FOP        OP(FOP_XCH)
GO4K_DLL        PREGAIN(64),DRY(128),FEEDBACK(28),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(18),COUNT(1) ; ERROR
GO4K_OUT        GAIN(29), AUXSEND(5)`;

const kick = `GO4K_ENV	ATTAC(1),DECAY(64),SUSTAIN(96),RELEASE(64),GAIN(45)
GO4K_FST	AMOUNT(128),DEST(0*MAX_UNIT_SLOTS+2)
GO4K_ENV	ATTAC(1),DECAY(70),SUSTAIN(0),RELEASE(0),GAIN(128)
GO4K_DST	DRIVE(32), SNHFREQ(128), FLAGS(0)
GO4K_FST	AMOUNT(80),DEST(6*MAX_UNIT_SLOTS+1)
GO4K_FOP	OP(FOP_POP)
GO4K_VCO	TRANSPOSE(46),DETUNE(64),PHASE(0),GATES(0),COLOR(64),SHAPE(64),GAIN(128),FLAGS(TRISAW)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(64)
GO4K_OUT	GAIN(10), AUXSEND(2)`;

const snare = `GO4K_ENV	ATTAC(0),DECAY(72),SUSTAIN(0),RELEASE(72),GAIN(25)
GO4K_FST	AMOUNT(128),DEST(0*MAX_UNIT_SLOTS+2+FST_SET)
GO4K_ENV	ATTAC(0),DECAY(56),SUSTAIN(0),RELEASE(0),GAIN(128)
GO4K_FST	AMOUNT(108),DEST(6*MAX_UNIT_SLOTS+1+FST_SET)
GO4K_FST	AMOUNT(72),DEST(7*MAX_UNIT_SLOTS+1+FST_SET)
GO4K_FOP	OP(FOP_POP)
GO4K_VCO	TRANSPOSE(32),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(32),GAIN(64),FLAGS(SINE)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(80),GAIN(64),FLAGS(SINE)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(10),GAIN(64),FLAGS(NOISE)
GO4K_VCF	FREQUENCY(96),RESONANCE(128),VCFTYPE(LOWPASS)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(16),FLAGS(NOISE)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCF	FREQUENCY(22),RESONANCE(32),VCFTYPE(HIGHPASS)
GO4K_PAN	PANNING(64)
GO4K_OUT	GAIN(5), AUXSEND(2)`;

const hihat = `GO4K_ENV	ATTAC(0),DECAY(64),SUSTAIN(0),RELEASE(0),GAIN(61)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(NOISE)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCF	FREQUENCY(128),RESONANCE(128),VCFTYPE(HIGHPASS)
GO4K_PAN	PANNING(64)
GO4K_OUT	GAIN(30), AUXSEND(1)`;

addInstrument('flute', flute);
addInstrument('bass', bass);
addInstrument('pad1', pad);
addInstrument('pad2', pad);
addInstrument('pad3', pad);
addInstrument('lead', lead);
addInstrument('kick', kick);
addInstrument('snare', snare);
addInstrument('hihat', hihat);

addPattern('kick', pattern(4,[c4,,,, ,,,,c4, ,,,, ]));
addPattern('snare1', pattern(4,[,,,,e3,,,e3,,e3,,,e3,,,]));
addPattern('hihat', pattern(4, [,,e3,,,,e3,,,,e3,,,,e3,,]));
addPattern('flute', pattern(4, [
	fs5,,,,,,b5,as5,,fs5,,,,,cs5,ds5,
	e5,,,,,, e5,ds5,,cs5,,,,,   ,
]));

addPattern('pad1_1', pattern(1/4, [ cs5(2),cs5(2) ]));
addPattern('pad1_2', pattern(1/4, [ fs5(2),e5(2) ]));
addPattern('pad1_3', pattern(1/4, [ as5(2),b5(2) ]));

addPattern('lead', pattern(4, [
		,,as6,,as6,,gs6,as6,,as6,,gs6,as6,,cs7,,
		b6,,,,,,,b6(1/2),,as6(1/2),,gs6(1/2),,fs6,,
		cs6(1),,,,,,,,,fs6,gs6,,as6,,fs6(1/2),,gs6(2)
	]));


addPattern('bass', pattern(4,[
	fs3(1/2),,,fs4,,,,,,,e4,,e4,fs4,,,
	,,,,,,,b3,,b3,c4,,cs4,,e4
]));

addPattern('pad2_1', pattern(1, [ b4(2),,, gs5(1),ds5(2),,,ds5(1),ds5(2),,cs5(2),,fs5(2) ]));
addPattern('pad2_2', pattern(1, [ ds5(2),,,f5(1),fs5(2),,, g5(1) ,gs5(2),,fs5(2),,b5(2) ]));
addPattern('pad2_3', pattern(1, [ fs5(2),,,cs5(1),as5(2),,,as5(1),b5(2) ,,as5(2),,ds6(2) ]));
addPattern('flute2', pattern(4, [
	,,ds5,,ds5,,cs5,ds5,,ds5,,cs5,fs5(1/2),,ds5,,
	,,as5,,as5,,gs5,as5,,as5,,gs5,g5(1/2),,ds5,,
	b5,as5,,gs5,,fs5,,as5,,gs5,,fs5,,cs5,ds5,,
	,,,,,,,fs3,b3,ds4,fs4,b4,ds5,fs5,b4
]));


addPattern('bass2', pattern(4,[
	b3(1/2),,,b4,,b4,b3(1/2),,,,,b4,cs4,,cs5,,
	ds4,,,,,,,,ds5,ds4,,f4,,g4,,,
	gs3(1/2),,,gs4,,gs4,gs3,,as3,,,as3,as4,,as3,,
	b3(1),,,,,,,b4,,b4,b3,,ds4,,fs4(1/2)
]));

addPattern('leadafterintermission', pattern(4, [
	fs5,,,,,,fs5,cs6,,,,,,cs6,ds6,e6,,,,,,,,,ds6(1),,,,b5(1),,,,
	fs6,cs6,fs6,cs6,,,,,,,,,,,,,e6(1),,,,ds6(1),,,,b5(1),,,,cs6(1)
]));

addPattern('leadintermission', pattern(1,[ds5(4),,,b5(1),as5(4),,,,b5(2),,cs6(2),,fs5(4)]));

addPattern('kick2', pattern(4, [c4,,,,c4,,,c4,c4,,,,c4]))
addPattern('pad3_1', pattern(1/2, [ cs6(3),,cs6(3),,b5(3),,a5(7/4), b5(7/4)]));
addPattern('pad3_2', pattern(1/2, [ fs6(3),,e6(3) ,,ds6(3),,d6(7/4),e6(7/4)]));
addPattern('pad3_3', pattern(1/2, [ as6(3),,a6(3) ,,fs6(4),,,       gs6(7/4)]));
addPattern('bass3', pattern(1/2, [ 
	fs3(4),,a3(4),,b3(4),,d3(2),e3(2)
]));
addPattern('lead4', pattern(4, [ 
	fs6(5),,,,,,,,,,,,,,,,,,
	,e6(4),,,,,,,,,,,cs6,e6,
	fs6(4),,,,,,,,,,,,,,a6,b6,
	cs7(1),,,,b6(1),,,,a6(1/2),,fs6(2)
]));
addPattern('flute3', pattern(4,[
	fs4,cs5,fs5,e5,fs5,,e5,fs5,,fs5,e5,cs5,e5,fs5
]));

for(let n = 0; n<2; n++) {
	
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat',
		flute: 'flute',
		bass: 'bass',
		pad1: 'pad1_1',
		pad2: 'pad1_2',
		pad3: 'pad1_3'
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat',
		flute: 'flute',
		bass: 'bass',
		pad1: 'pad1_1',
		pad2: 'pad1_2',
		pad3: 'pad1_3',
		
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat',
		flute: 'flute',
		bass: 'bass',
		pad1: 'pad1_1',
		pad2: 'pad1_2',
		pad3: 'pad1_3',
		lead: 'lead'
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat',
		flute: 'flute',
		bass: 'bass',
		pad1: 'pad1_1',
		pad2: 'pad1_2',
		pad3: 'pad1_3',
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'
	});

	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat',
		flute: 'flute',
		bass: 'bass',
		pad1: 'pad1_1',
		pad2: 'pad1_2',
		pad3: 'pad1_3',
		lead: 'lead'
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat',
		flute: 'flute',
		bass: 'bass',
		pad1: 'pad1_1',
		pad2: 'pad1_2',
		pad3: 'pad1_3',
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'
	});

	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat',
		bass: 'bass2',
		flute: 'flute2',
		pad1: 'pad2_1',
		pad2: 'pad2_2',
		pad3: 'pad2_3'
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat',
		bass: 'bass2',
		flute: 'flute2',
		pad1: 'pad2_1',
		pad2: 'pad2_2',
		pad3: 'pad2_3',
		lead: 'leadintermission'
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});


	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat',
		flute: 'flute',
		bass: 'bass',
		pad1: 'pad1_1',
		pad2: 'pad1_2',
		pad3: 'pad1_3',
		lead: 'leadafterintermission'
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});

	playPatterns({
		flute: 'flute',
		bass: 'bass',
		pad1: 'pad1_1',
		pad2: 'pad1_2',
		pad3: 'pad1_3',
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});

	playPatterns({
		flute: 'flute',
		bass: 'bass',
		pad1: 'pad1_1',
		pad2: 'pad1_2',
		pad3: 'pad1_3',
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});

	playPatterns({
		flute: 'flute',
		bass: 'bass',
		pad1: 'pad1_1',
		pad2: 'pad1_2',
		pad3: 'pad1_3',
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});
	playPatterns({
		kick: 'kick',
		snare: 'snare1',
		hihat: 'hihat'	
	});

	playPatterns({
		bass: 'bass3',
		pad1: 'pad3_1',
		pad2: 'pad3_2',
		pad3: 'pad3_3',
		lead: 'lead4',
		kick: 'kick2'
	});
	playPatterns({	
		kick: 'kick2'
	});
	playPatterns({	
		kick: 'kick2'
	});
	playPatterns({	
		kick: 'kick2'
	});
	playPatterns({
		bass: 'bass3',
		pad1: 'pad3_1',
		pad2: 'pad3_2',
		pad3: 'pad3_3',
		lead: 'lead4',
		kick: 'kick2',
		hihat: 'hihat'
	});
	playPatterns({	
		kick: 'kick2',
		hihat: 'hihat'
	});
	playPatterns({	
		kick: 'kick2',
		hihat: 'hihat'
	});
	playPatterns({	
		kick: 'kick2',
		hihat: 'hihat'
	});

	playPatterns({
		bass: 'bass3',
		pad1: 'pad3_1',
		pad2: 'pad3_2',
		pad3: 'pad3_3',
		lead: 'lead4',
		kick: 'kick',
		flute: 'flute3',
		hihat: 'hihat',
		snare: 'snare1'
	});
	playPatterns({	
		kick: 'kick',
		flute: 'flute3',
		hihat: 'hihat',
		snare: 'snare1'
	});
	playPatterns({	
		kick: 'kick',
		flute: 'flute3',
		hihat: 'hihat',
		snare: 'snare1'
	});
	playPatterns({	
		kick: 'kick',
		flute: 'flute3',
		hihat: 'hihat',
		snare: 'snare1'
	});

	playPatterns({
		bass: 'bass3',
		pad1: 'pad3_1',
		pad2: 'pad3_2',
		pad3: 'pad3_3',
		lead: 'lead4',
		kick: 'kick',
		flute: 'flute3',
		hihat: 'hihat',
		snare: 'snare1'
	});
	playPatterns({	
		kick: 'kick',
		flute: 'flute3',
		hihat: 'hihat',
		snare: 'snare1'
	});
	playPatterns({	
		kick: 'kick',
		flute: 'flute3',
		hihat: 'hihat',
		snare: 'snare1'
	});
	playPatterns({	
		kick: 'kick',
		flute: 'flute3',
		hihat: 'hihat',
		snare: 'snare1'
	});
}

for(let n=0;n<2; n++) {
	playPatterns({
		kick: 'kick2',		
		hihat: 'hihat',
		flute: 'flute',
		bass: 'bass',
		pad1: 'pad1_1',
		pad2: 'pad1_2',
		pad3: 'pad1_3'
	});
	playPatterns({
		kick: 'kick2',
		hihat: 'hihat'
	});
}
playPatterns({
	flute: 'flute',
	pad1: 'pad1_1',
	pad2: 'pad1_2',
	pad3: 'pad1_3'
},4);



fs.writeFileSync('4klang.inc', incMake4k.makeVierKlangInc());