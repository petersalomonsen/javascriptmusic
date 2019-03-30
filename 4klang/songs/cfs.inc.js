const incMake4k = require('../4klang_inc/4klang_inc.make.js');

global.bpm = 280;
global.pattern_size_shift = 3;
calculatePatternSize();
global.looptimes = 2;


const epiano = (pan, phase) => {
	return `GO4K_ENV	ATTAC(32),DECAY(80),SUSTAIN(30),RELEASE(40),GAIN(45)
	GO4K_VCO	TRANSPOSE(76),DETUNE(64),PHASE(${phase}),GATES(0),COLOR(100),SHAPE(32),GAIN(128),FLAGS(SINE|VCO_STEREO)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_VCO	TRANSPOSE(1),DETUNE(32),PHASE(0),GATES(85),COLOR(96),SHAPE(64),GAIN(128),FLAGS(SINE)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_PAN	PANNING(${pan})
	GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(32),COUNT(1)
	GO4K_OUT	GAIN(45), AUXSEND(50)`;
}
addInstrument('epiano', epiano(30,0));
addInstrument('epiano2', epiano(60,32));
addInstrument('epiano3', epiano(90,64));
addInstrument('epiano4', epiano(70,120));

addInstrumentGroup('epianos', ['epiano','epiano2','epiano3','epiano4']);

addInstrument('leadpitchbend', `
	GO4K_FOP	OP(FOP_LOADNOTE)
	${GO4K_FSTG(0,5,6,2)}	
	${GO4K_FSTG(0,13,8,2)}	
	GO4K_FOP	OP(FOP_POP)	
`);
addInstrument('lead', `GO4K_ENV	ATTAC(56),DECAY(80),SUSTAIN(90),RELEASE(32),GAIN(15)
GO4K_ENV	ATTAC(88),DECAY(80),SUSTAIN(120),RELEASE(32),GAIN(120)
GO4K_VCO	TRANSPOSE(86),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(SINE|LFO)	
GO4K_FOP	OP(FOP_MULP)
GO4K_FST	AMOUNT(16),DEST(6*MAX_UNIT_SLOTS+2+FST_ADD)
GO4K_FOP	OP(FOP_POP)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(85),COLOR(0),SHAPE(64),GAIN(128),FLAGS(TRISAW)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(85),COLOR(0),SHAPE(64),GAIN(20),FLAGS(NOISE)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCF	FREQUENCY(60),RESONANCE(90),VCFTYPE(HIGHPASS)
GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(64),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(17),COUNT(1)
GO4K_PAN	PANNING(76)
GO4K_OUT	GAIN(80), AUXSEND(96)

`);

addInstrument('kick', `	GO4K_ENV	ATTAC(0),DECAY(64),SUSTAIN(96),RELEASE(64),GAIN(120)
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
GO4K_OUT	GAIN(18), AUXSEND(1)`);

addInstrument('clap', `	GO4K_ENV	ATTAC(0),DECAY(76),SUSTAIN(0),RELEASE(0),GAIN(56)
GO4K_FST	AMOUNT(128),DEST(0*MAX_UNIT_SLOTS+2+FST_SET)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(50),FLAGS(NOISE)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCF	FREQUENCY(80),RESONANCE(128),VCFTYPE(LOWPASS)
GO4K_FOP	OP(FOP_LOADNOTE)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(80)
GO4K_OUT	GAIN(11), AUXSEND(2)
`);

addInstrument('bass', `
GO4K_ENV	ATTAC(32),DECAY(70),SUSTAIN(60),RELEASE(75),GAIN(25)
GO4K_FST	AMOUNT(120),DEST(0*MAX_UNIT_SLOTS+2+FST_SET)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(32),GATES(85),COLOR(80),SHAPE(64),GAIN(128),FLAGS(PULSE)
GO4K_VCO	TRANSPOSE(64),DETUNE(72),PHASE(32),GATES(85),COLOR(96),SHAPE(64),GAIN(128),FLAGS(TRISAW)
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
GO4K_OUT	GAIN(22), AUXSEND(10)
`);

addInstrument('hihat', `	GO4K_ENV	ATTAC(0),DECAY(64),SUSTAIN(15),RELEASE(32),GAIN(110)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(NOISE)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCF	FREQUENCY(128),RESONANCE(128),VCFTYPE(BANDPASS)
GO4K_FOP	OP(FOP_LOADNOTE)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(56)
GO4K_OUT	GAIN(60), AUXSEND(0)
`);

const pad = (panning) => `GO4K_ENV        ATTAC(64),DECAY(128),SUSTAIN(100),RELEASE(64),GAIN(12)
GO4K_VCO        TRANSPOSE(16),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(TRISAW|LFO)
GO4K_FST        AMOUNT(80),DEST(13*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FST        AMOUNT(48),DEST(9*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FST        AMOUNT(58),DEST(9*MAX_UNIT_SLOTS+5+FST_SET)
GO4K_FOP        OP(FOP_POP)
GO4K_VCO        TRANSPOSE(64),DETUNE(60),PHASE(0),GATES(85),COLOR(10),SHAPE(70),GAIN(128),FLAGS(TRISAW)
GO4K_VCO        TRANSPOSE(64),DETUNE(68),PHASE(32),GATES(85),COLOR(10),SHAPE(70),GAIN(128),FLAGS(TRISAW)
GO4K_VCO        TRANSPOSE(74),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(24),FLAGS(NOISE)
GO4K_VCF        FREQUENCY(105),RESONANCE(18),VCFTYPE(BANDPASS)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_PUSH)
GO4K_VCF        FREQUENCY(26),RESONANCE(128),VCFTYPE(BANDPASS)
GO4K_FOP        OP(FOP_XCH)
GO4K_VCF        FREQUENCY(88),RESONANCE(120),VCFTYPE(LOWPASS)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FOP        OP(FOP_MULP)
GO4K_DLL        PREGAIN(112),DRY(64),FEEDBACK(64),DAMP(64),FREQUENCY(56),DEPTH(48),DELAY(17),COUNT(1)
GO4K_PAN        PANNING(${panning})
GO4K_OUT        GAIN(20), AUXSEND(32)`;

addInstrument('pad1', pad(30));
addInstrument('pad2', pad(60));
addInstrument('pad3', pad(100));

addInstrumentGroup('pads', ['pad1', 'pad2', 'pad3']);
addInstrument('flute', `GO4K_ENV        ATTAC(48),DECAY(80),SUSTAIN(64),RELEASE(64),GAIN(40)
GO4K_VCO        TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(64),FLAGS(NOISE)
GO4K_DST        DRIVE(64), SNHFREQ(0), FLAGS(0)
GO4K_VCO        TRANSPOSE(16),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(TRISAW|LFO)
GO4K_FOP        OP(FOP_ADDP)
GO4K_FST        AMOUNT(40),DEST(10*MAX_UNIT_SLOTS+4+FST_SET)
GO4K_FST        AMOUNT(58),DEST(10*MAX_UNIT_SLOTS+5+FST_SET)
GO4K_FOP        OP(FOP_POP)
GO4K_VCO        TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(SINE)
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
GO4K_PAN        PANNING(36)
GO4K_OUT        GAIN(65), AUXSEND(80)`);

addInstrumentGroup('sax', ['lead', 'flute', 'leadpitchbend']);
addInstrumentGroup('flutepitchbend', ['flute', 'leadpitchbend']);

addPattern('kick', pattern(2, [
	e5, , , , , ,
	e5, , , , , ,
	e5, , ,e3 , , ,
	e5, , , , ,e2,	
]));
addPattern('introkick', pattern(2, [
	e5, , , , , ,
	e5, , , , , ,
	e5, , , , ,e3 ,
	e5, , , , , ,	
]));
addPattern('clap', pattern(2, [
	, , , , , ,
	e7, , , , ,e7 ,
	, ,e3 , , ,e1,
	e7, , ,e2 , , ,
]));

addPattern('clapfill', pattern(2, [
	, , , , , ,
	e7, , , , ,e7 ,
	, ,e3 , , ,e1,
	e7, , e1,e5 , ,e6 ,
]));

addPattern('hihat', pattern(2, [
	, ,e1,e5 , , ,
	, , ,e5 , , ,
	, , ,e5 , , ,
	, ,e1,e5 , ,,	
	, ,e1,e5 , , ,
	, , ,e5 , , ,
	, , ,e5 , , ,
	, ,e1,e5(1) , ,e1
]));

addPattern('introhihat', pattern(2, [
	b1, ,c1,e5 , , ,
	b1, , ,e5 , ,c1,
	b1, , ,e5 , , ,
	b1, ,e1,e5(1) , ,e1
]));
addPattern('bass', pattern(2, [
	fs4(2),,, ,,
	b2(1),,,b2,d3,,ds3,
	e3(2),,,,,
	g3(2),,,,a3(2),,,
	e3(2),,,,,e3,
	d3(2),,,,,,
	c3(2),,,,,,
	b2(2),,b3,b4,,b3
]));

addPattern('bass2', pattern(2, [
	e3(2),,, ,,a2(2),
	,,a2, ,,,
	b2(2),,, ,,,
	g3(4),,, ,,fs3,
	e3(2),,, ,,a2(2),
	,,a2, ,,,
	g2(2),,, ,,as3,
	b3(2),,, ,,,
]));

for(let l=0;l<1;l++) {
	for(let n=0;n<2;n++) {
	playPatterns({
		kick: 'kick',
		clap: 'clap',
		hihat: 'hihat',
		bass: pp(2,[
			g3(2),,, ,,g3,
			d4(2),,, ,,,
			,,c3(1), ,,c3,
			g3(2),,, ,,,
			g3(1),,, ,,d4,
			,,d4, g3,,,
			d4,,, a3,,,
			d4,,, a4,,a3,
		]),	
		epianos: pp(2, [
			,,,
			[g4,d5,g5,b4]
			,,,
			,,,
			[g4,d5,g5,b4]
			,,,
			,,,
			[c4,c5,g5,e5]
			,,,
			,,,
			[c4,c5,g5,e5]
			,,,
			,,,
			[g4,d5,g5,b4]
			,,,
			,,,
			[g4,d5,g5,b4]
			,,,
			,,,
			[d4,d5,fs5,a5]
			,,,
			,,,
			[d4,d5,fs5,a5]
		],4),
		sax: pp(2, [
			,,, [b5,b5,2],,,
			[a5,a5],,, [g5,g5],,,
			,,, [g5,g5],,,
			[fs5,fs5],,, [e5,e5],,,
			[d5,d5],,[g5,g5], ,,[d5,d5],
			[g5,g5],,, [d5,d5], 
			,[a5,a5],,,[a5,a5],
			[b5,b5],,, [a5,a5],,,
			[g5,g5]

		], 3)
	},3);
	playPatterns({
		kick: 'kick',
		clap: 'clap'
	},3);
	}


	for(let n=0;n<2;n++) {
	playPatterns({
		kick: 'kick',
		clap: 'clap',
		hihat: 'hihat',
		bass: pp(2,[
			g3(2),,, ,,g3,
			d4(2),,, ,,,
			,,c3(1), ,,c3,
			g3(2),,, ,,,
			g3(1),,, ,,d4,
			,,d4, g3,,,
			d4,,, a3,,,
			d4,,, a4,,a3,
		]),	
		epianos: pp(2, [
			,,,
			[g4,d5,g5,b4]
			,,,
			,,,
			[g4,d5,g5,b4]
			,,,
			,,,
			[c4,c5,g5,e5]
			,,,
			,,,
			[c4,c5,g5,e5]
			,,,
			,,,
			[g4,d5,g5,b4]
			,,,
			,,,
			[g4,d5,g5,b4]
			,,,
			,,,
			[d4,d5,fs5,a5]
			,,,
			,,,
			[d4,d5,fs5,a5]
		],4),
		sax: pp(2, [
			[d6(2),d6(2),64],[,,32],[,,2], ,,,
			[b5(2),b5(2)],,, ,,[a5,a5],
			,,[a5,a5,2], [g5(1),g5(1)],,,
			[a5(1),a5(1)],,, [g5(1),g5(1)],,,
			[a5(1),a5(1)],,[b5(1),b5(1)], ,,[d6(1),d6(1)],
			,,[b5(1),b5(1)], ,,[g5(1),g5(1)],
			[a5(1),a5(1)],,[,d7],[,e7] ,,[,d7],
			[,e7],,[,d7],[,g7],,[,e7]

		], 3)
	},3);
	playPatterns({
		kick: 'kick',
		clap: 'clap'
	},3);
	}
}


playPatterns({
	bass: pp(2,[
		a3,,,e4,,,
		a4,,, ,,b4(2),
		,,, ,,,
		a4(1),,g4, e4,,,
		c4(1),,, g4,,,
		c5,,, ,,d5(2),
		,,, ,,c3,
		a4(1),,g4(1),,,,
		g3(1),,g4, ,,g3,
		g4(1),,, ,,,
		a4(2),,, ,,,
		g4(1),,e4, ,,,
		d4(2),,, ,,,
		,,, ,,d4,
		,,d5, a3(2),,,
		d4(1),,, e4(1)
	]),
	kick: 'introkick',
	hihat: pp(2,[
		a1, ,e1,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, ,e1,e5(1.5) , ,c1,	
	]),	
	clap: pp(2, [
		, , , , , ,
		e4, , , , , ,
		, , , , ,,
		e4,,, ,,,
	]),
	pads: pp(1/12,[
		[e5(10),a5(10),c6(10)],
		[g5(10),e6(10),c6(10)],
		[g5(10),d6(10),b5(10)],
		[a5(10),d6(10),fs6(10)],
	], 3),	
	flutepitchbend: pp(2, [
		,,e7,g7 ,, e7,
		g7,,, a7,,,
		[b7(2),127],,[,2], a7(1),,g7,
		,,,e7 ,,g7 ,

		,,e7,g7 ,, e7,
		g7,,, a7,,,
		[b7(2),127],,[,2], a7(1),,g7,
		,,,e7 ,,d7 ,

		,,e7,g7 ,, e7,
		g7,,, a7,,,
		[b7(2),127],,[,2], a7(1),,g7,
		,,,e7 ,,a7 ,
		,,a7,g7,,,
		a7,,, b7,,,
		d8,,, b7(1),,,
		a7(1),,g7
	],2)
},3);
playPatterns({
	kick: 'introkick',
	hihat: pp(2,[
		a1, ,e1,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, ,e1,e5(1.5) , ,c1,	
	]),	
	clap: pp(2, [
		, , , , , ,
		e4, , , , , ,
		, , , , ,,
		e4,,, ,,,
	])
},3);
playPatterns({
	kick: 'introkick',
	hihat: pp(2,[
		a1, ,e1,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, ,e1,e5(1.5) , ,c1,	
	]),	
	clap: pp(2, [
		, , , , , ,
		e4, , , , , ,
		, , , , ,,
		e4,,, ,,,
	])
},3);
playPatterns({
	kick: 'introkick',
	hihat: pp(2,[
		a1, ,e1,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, ,e1,e5(1.5) , ,c1,	
	]),	
	clap: pp(2, [
		, , , , , ,
		e4, , , , , ,
		, , , , ,,
		e4,,, ,,,
	])
},3);

playPatterns({
	bass: pp(2,[
		a3,,,e4,,,
		a4,,, ,,b4(2),
		,,, ,,,
		a4(1),,g4, e4,,,
		c4(1),,, g4,,,
		c5,,, ,,d5(2),
		,,, ,,c3,
		a4(1),,g4(1),,,,
		g3(1),,g4, ,,g3,
		g4(1),,, ,,,
		a4(2),,, ,,,
		g4(1),,e4, ,,,
		d4(2),,, ,,,
		,,, ,,d4,
		,,d5, a3(2),,,
		d4(1),,, e4(1)
	]),
	kick: 'introkick',
	hihat: pp(2,[
		a1, ,e1,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, ,e1,e5(1.5) , ,c1,	
	]),	
	clap: pp(2, [
		, , , , , ,
		e4, , , , , ,
		, , , , ,,
		e4,,, ,,,
	]),
	pads: pp(1/12,[
		[e5(10),a5(10),c6(10)],
		[g5(10),e6(10),c6(10)],
		[g5(10),d6(10),b5(10)],
		[a5(10),d6(10),fs6(10)],
	], 3),
	epianos: pp(2, [
		,,e6,[,g6] ,, [,,e6],
		g6,,, [,,,a6],,,
		[as6(2)],,[,,b6], a6(1),,[,g6],
		,,,[,,,e6] ,,[,g6] ,

		,,[,,e6],[,g6] ,, e6,
		g6,,, [,,,a6],,,
		[as6(2)],,[,b6], a6(1),,g6,
		,,,e6 ,,[,,,d6] ,

		,,e6,[,,g6] ,, [,e6],
		g6,,, [,,,a6],,,
		[as6(2)],,b6, [,,a6(1)],,[,,,g6],
		,,,[,e6] ,,[,,,a6] ,
		,,a6,[,g6],,,
		a6,,, [,,b6],,,
		d7,,, [,,,b6(1)],,,
		a6(1),,[,,g6]
	],4),
	flutepitchbend: pp(2, [
		,,e7,g7 ,, e7,
		g7,,, a7,,,
		[b7(2),127],,[,2], a7(1),,g7,
		,,,e7 ,,g7 ,

		,,e7,g7 ,, e7,
		g7,,, a7,,,
		[b7(2),127],,[,2], a7(1),,g7,
		,,,e7 ,,d7 ,

		,,e7,g7 ,, e7,
		g7,,, a7,,,
		[b7(2),127],,[,2], a7(1),,g7,
		,,,e7 ,,a7 ,
		,,a7,g7,,,
		a7,,, b7,,,
		d8,,, b7(1),,,
		a7(1),,g7
	],2)
},3);
playPatterns({
	kick: 'introkick',
	hihat: pp(2,[
		a1, ,e1,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, ,e1,e5(1.5) , ,c1,	
	]),	
	clap: pp(2, [
		, , , , , ,
		e4, , , , , ,
		, , , , ,,
		e4,,, ,,,
	])
},3);
playPatterns({
	kick: 'introkick',
	hihat: pp(2,[
		a1, ,e1,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, ,e1,e5(1.5) , ,c1,	
	]),	
	clap: pp(2, [
		, , , , , ,
		e4, , , , , ,
		, , , , ,,
		e4,,, ,,,
	])
},3);
playPatterns({
	kick: 'introkick',
	hihat: pp(2,[
		a1, ,e1,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, , ,e5(1.5) , , ,
		a1, ,e1,e5(1.5) , ,c1,	
	]),	
	clap: pp(2, [
		, , , , , ,
		e4, , , , , ,
		, , , , ,,
		e4,,, ,,,
	])
},3);
incMake4k.makeVierKlangInc();