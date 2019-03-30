const incMake4k = require('../../4klang_inc/4klang_inc.make.js');

global.bpm = 280;
global.pattern_size_shift = 3;
calculatePatternSize();
// global.looptimes = 100;


const epiano = (pan, phase) => {
	return `GO4K_ENV	ATTAC(32),DECAY(80),SUSTAIN(30),RELEASE(40),GAIN(45)
	GO4K_VCO	TRANSPOSE(76),DETUNE(64),PHASE(${phase}),GATES(0),COLOR(100),SHAPE(32),GAIN(128),FLAGS(SINE|VCO_STEREO)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_VCO	TRANSPOSE(1),DETUNE(32),PHASE(0),GATES(85),COLOR(96),SHAPE(64),GAIN(128),FLAGS(SINE)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_PAN	PANNING(${pan})
	GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(32),COUNT(1)
	GO4K_OUT	GAIN(60), AUXSEND(100)`;
}
addInstrument('epiano', epiano(30,0));
addInstrument('epiano2', epiano(60,32));
addInstrument('epiano3', epiano(90,64));
addInstrument('epiano4', epiano(70,120));

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

addPattern('piano1', pattern(2, [,,,b4,,, ,,,  b4,,,  ,,,b4,,, ,,,b4,,, ,,,b4,,, ,,,b4,,, ,,,b4,,, ,,,b4,,,]));
addPattern('piano2', pattern(2, [,,,d5,,, ,,,  d5,,,  ,,,e5,,, ,,,e5,,, ,,,e5,,, ,,,e5,,, ,,,e5,,, ,,,e5,,,]));
addPattern('piano3', pattern(2, [,,,fs5,,, ,,, fs5,,, ,,,g5,,, ,,,a5,,, ,,,a5,,, ,,,g5,,, ,,,g5,,, ,,,g5,,,]));

addPattern('piano4', pattern(2, [,,,b5(4),,,       ,,,       ,,,     ,,,b5(4),,,     ,,,b4,,, ,,,b4,,, ,,,b4,,, ,,,b4,,, ,,,b4,,,]));
addPattern('piano5', pattern(2, [,,,     ,,, e5(4) ,,,       ,,,a5(4),,,     ,,,a5(4),,,e5,,, ,,,e5,,, ,,,e5,,, ,,,e5,,, ,,,e5,,,]));
addPattern('piano6', pattern(2, [,,,     ,,,       ,,, g5(4) ,,,     ,,,     ,,,     ,,,a5,,, ,,,a5,,, ,,,g5,,, ,,,g5,,, ,,,g5,,,]));

addPattern('lead',   pattern(2, [b7(2),,, ,,, a7(1),,, g7(1),,a7, ,, b7(3),,, ]));
addPattern('leadpb', pattern(2, [127,64,32,16 ,2,, ,,, ,,,        ,, 127,64,32,16 ,2,, ]));

addPattern('lead2',   pattern(2, [a7(1),,, g7(1),,, a7(2),,, b7(1),,g7]));
addPattern('leadpb2', pattern(2, [,,, ,,, 64,32,2, ,,,]));

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
addPattern('verselead', pattern(2, [,,, ,,b5, d6(1),,, d6,,, d6(1),,e6, ,,, ,,, ,,g6, ,,g6, e6(1/2),,, g6,,e6, a6,,e6, b6(1),,, a6,,, g6(1),,e6 ]));
addPattern('verseleadpitchbend',
					    pattern(2, [2,,, ,,, ,,,       ,,,   ,,,        ,,, ,,, ,,,  ,,,   ,,,   ,,,   ,,,   64,32,2, ]));

const versePianoPatterns = pattern(2, [
	[e5,g5,b5],,, ,,,
	,,, ,,,
	[e4(4)],,, ,,[,b4(4)],
	,,, ,,,
	[,,e4(3)],[,as4(6)],[d5(6)], ,,,
], 3);

addPattern('versepiano1', versePianoPatterns[0]);
addPattern('versepiano2', versePianoPatterns[1]);
addPattern('versepiano3', versePianoPatterns[2]);

const versePianoPatterns2 = pattern(2, [
	[b3(2)],[,e3(3),a4(3)],, ,,,
	[,b5(0.5),g5],,, ,,,
	,,, ,,,
	g4(1),,[,fs4], [,,e4],,,
	b3(6),,, ,,,
	,,, ,,,
	[,,d4(6)]
], 3);
addPattern('versepiano4', versePianoPatterns2[0]);
addPattern('versepiano5', versePianoPatterns2[1]);
addPattern('versepiano6', versePianoPatterns2[2]);




playPatterns({
	kick: 'introkick',
	hihat: 'introhihat'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass2',	
	lead: 'verselead',
	leadpitchbend: 'verseleadpitchbend'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass2',	
	lead: 'verselead',
	leadpitchbend: 'verseleadpitchbend'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap'
},3);


playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass',
	epiano: 'piano1',
	epiano2: 'piano2',
	epiano3: 'piano3',
	lead: 'lead',
	leadpitchbend: 'leadpb'
},3);
playPatterns({
	clap: 'clap',
	lead: 'lead2',
	leadpitchbend: 'leadpb2'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass',
	epiano: 'piano4',
	epiano2: 'piano5',
	epiano3: 'piano6',
	lead: 'lead',
	leadpitchbend: 'leadpb'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap',
	lead: 'lead2',
	leadpitchbend: 'leadpb2'
},3);

playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass2',	
	lead: 'verselead',
	leadpitchbend: 'verseleadpitchbend',
	epiano: 'versepiano1',
	epiano2: 'versepiano2',
	epiano3: 'versepiano3'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass2',	
	lead: 'verselead',
	leadpitchbend: 'verseleadpitchbend',	
	epiano: 'versepiano4',
	epiano2: 'versepiano5',
	epiano3: 'versepiano6'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap'
},3);

// Piano and Trumpet solo
const pianosolo = pattern(2, [
	,,,g5 ,,[,e5(2)],
	,,,[,,d5] ,,[,b4(1)],
	,,[,,a4(1)], ,,g4(4),
	,,, ,,,
	[,cs4(4)],[e4(4),,a4(4)],[,,,g6(2),64], [,,,,32],[,,,,2],[,,,e6],
	[,,,g6(1)],,[,,,e6], [e4(4),b4(4)],,[,,,a6],
	,,[,,,b6(2),64], [,,,,32],[,,,,2],,
	[,,,a6(2),64],[,,,,32],[,,,g6(2),2], [,,,e6(1)],,[,,,d6],
	,,g5,[,a5(2)] ,,[,,b5(1)],
	,,d6, ,,[fs5(2),a5(2)],
	,,[,,g5], ,,e5,[,g5]
	,,, [,,d5],,e5(2),[,cs4(3),a4(3)]
	,,, ,,g5(2),
	[,e4(3),b5(3)],,, [b4(4)],,
	[,,g5(3)],,, ,[,,,d7],,
	,[,,,d7(2)],, [e5,g5,b5,e7],,[,,,g7]
], 5);
addPattern('pianosolo1', pianosolo[0]);
addPattern('pianosolo2', pianosolo[1]);
addPattern('pianosolo3', pianosolo[2]);
addPattern('pianosolotrumpet', pianosolo[3]);
addPattern('pianosolotrumpetpitchbend', pianosolo[4]);

// playFromHere();
playPatterns({
	kick: addPattern(null, pattern(2, [
		e5,,, ,,,
		,,, ,,e4,
		, ,e4 , , ,e4 ,
		, , , , ,e2,	
	])),
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass2',	
	epiano: 'pianosolo1',
	epiano2: 'pianosolo2',
	epiano3: 'pianosolo3',
	lead: 'pianosolotrumpet',
	leadpitchbend: 'pianosolotrumpetpitchbend'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass2',
},3);
playPatterns({
	kick: 'kick',
	clap: 'clapfill'
},3);

// Chorus
playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass',
	epiano: 'piano1',
	epiano2: 'piano2',
	epiano3: 'piano3',
	lead: 'lead',
	leadpitchbend: 'leadpb'
},3);
playPatterns({
	clap: 'clap',
	lead: 'lead2',
	leadpitchbend: 'leadpb2'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass',
	epiano: 'piano4',
	epiano2: 'piano5',
	epiano3: 'piano6',
	lead: 'lead',
	leadpitchbend: 'leadpb'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clapfill',
	lead: 'lead2',
	leadpitchbend: 'leadpb2'
},3);
// playFromHere();
playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass',
	epiano: 'piano1',
	epiano2: 'piano2',
	epiano3: 'piano3',
	lead: 'lead',
	leadpitchbend: 'leadpb'
},3);
playPatterns({
	clap: 'clap',
	lead: 'lead2',
	leadpitchbend: 'leadpb2'
},3);

playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass',
	epiano: 'piano4',
	epiano2: 'piano5',
	epiano3: 'piano6',
	lead: 'lead',
	leadpitchbend: 'leadpb'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clapfill',
	lead: 'lead2',
	leadpitchbend: 'leadpb2'
},3);

addPattern('hihatsection2', pattern(2,[
	a1, ,e1,e5(1.5) , , ,
	a1, , ,e5(1.5) , , ,
	a1, , ,e5(1.5) , , ,
	a1, ,e1,e5(1.5) , ,c1,	
]));

const section2pianopatterns = pattern(2,[
	,,, ,,,
	[e4(4)],[,a4(4)],[,,c5(4)],[,,,g5(4)]
],4);
addPattern('section2piano1', section2pianopatterns[0] );
addPattern('section2piano2', section2pianopatterns[1] );
addPattern('section2piano3', section2pianopatterns[2] );
addPattern('section2piano4', section2pianopatterns[3] );

addPattern('section2bass', pattern(2, [
	a3(4),,,a2(1) ,,g4,
	,,a4(2), ,,c5,
	,,c5,c2 ,,b4,
	a2(1),,a4(2)
]));

const section2lead = pattern(2, [
	[fs6(2),2],,g6, fs6(2),,g6,
	[a6(2),32],[,16],[,2], g6,,fs6,
	,,g6, ,,,
	,,, ,,,
	,,, b6,,,
	a6(2),,g6, e6(1),,d6,
	g6(1.5),,e6, ,,g6,
	,,a6, ,,[fs6(8),64],
	[,48],[,32],[,16],[,2]
],2);
addPattern('section2flute', section2lead[0]);
addPattern('section2pitchbend', section2lead[1]);

const section2pads = pattern(1/24, [
	[c6(20),e6(20),g6(20)],
	[b5(20),e6(20),g6(20)]
],3);
addPattern('section2pads1', section2pads[0]);
addPattern('section2pads2', section2pads[1]);
addPattern('section2pads3', section2pads[2]);

for(let n=0;n<2;n++) {
	playPatterns({
		kick: 'introkick',
		hihat: 'hihatsection2',	
		bass: 'section2bass',
		epiano: 'section2piano1',
		epiano2: 'section2piano2',
		epiano3: 'section2piano3',
		epiano4: 'section2piano4',
	},3);
}
const section2pianopatterns2 = pattern(2,[
	,,, ,,,
	[e4(4)],[,g4(4)],[,,d5(4)],[,,,g5(4)]
],4);
addPattern('section2piano21', section2pianopatterns2[0] );
addPattern('section2piano22', section2pianopatterns2[1] );
addPattern('section2piano23', section2pianopatterns2[2] );
addPattern('section2piano24', section2pianopatterns2[3] );

addPattern('section2bass2', pattern(2, [
	e3(4),,,e2(1) ,,d4,
	,,e4(2), ,,g5,
	,,g5,g2 ,,fs4,
	e2(1),,e4(2)
]));

for(let n=0;n<2;n++) {
	playPatterns({
		kick: 'introkick',
		hihat: 'hihatsection2',	
		bass: 'section2bass2',
		epiano: 'section2piano21',
		epiano2: 'section2piano22',
		epiano3: 'section2piano23',
		epiano4: 'section2piano24'
	},3);
}

addPattern('section2clap', pattern(2, [
	, , , , , ,
	e4, , , , , ,
	, , , , ,,
	e4,,, ,,,
]));

for(let n=0;n<2;n++) {
	playPatterns({
		kick: 'introkick',
		clap: 'section2clap',
		hihat: 'hihatsection2',	
		bass: 'section2bass',
		epiano: 'section2piano1',
		epiano2: 'section2piano2',
		epiano3: 'section2piano3',
		epiano4: 'section2piano4',
	},3);
}

for(let n=0;n<2;n++) {
	playPatterns({
		kick: 'introkick',
		hihat: 'hihatsection2',	
		clap: 'section2clap',
		bass: 'section2bass2',
		epiano: 'section2piano21',
		epiano2: 'section2piano22',
		epiano3: 'section2piano23',
		epiano4: 'section2piano24'
	},3);
}

// playFromHere();

const section2lead2 = pattern(2, [
	[fs6(2),2],,g6, fs6(2),,g6,
	[a6(2),32],[,16],[,2], g6,,fs6,
	,,g6, ,,,
	,,, ,,,
	,,, b6,,,
	a6(2),,g6, e6(1),,d6,
	g6(1.5),,e6, ,,g6,
	,,[a6(3),64],[,32] ,[,2],d6(9),
	,,, ,,,
	,,, ,,,
	,,, ,,,
	,,, d6(1),,e6,
	f6(1),,f6 , ,,f6,
	,,[g6(2),32],[,16] ,[,2],e6(1),
	,,d6, ,,c6(1.5),
	,,d6, ,,,
],2);
addPattern('section2flute2', section2lead2[0]);
addPattern('section2pitchbend2', section2lead2[1]);

addPattern('section2bass3', pattern(2, [
	g3(2),,, ,,g3,
	g4(2),,, ,,,
	b3(1),,b4, ,,b4,
	,,b4, b3(1.5),,,
	d4(2),,, ,,d5(2),
	,,,d4(2),,,
	a3(3),,, ,,a3,
	a4(3),,, ,,,
]));

const section2piano3 = pattern(2, [
	[g4(3),b4(3),d5(3)],,, ,,[,g4,b4,d5],
	,,g3, [g4(1),b4(1),d5(1),b5(3)],,,
	[fs4(2)],[,d4(2)],, ,,,
	,,, ,,,
	[d4(5),d5(5),f5(5),a4(5)],,, ,,,
	,,, ,,,
	[a4(3),c5(3),e5(3)],,, ,,[,a4,c5,e5],
	,,a3,[a4(1),c5(1),e5(1),g5(1)],		
],4);

addPattern('section2piano31', section2piano3[0]);
addPattern('section2piano32', section2piano3[1]);
addPattern('section2piano33', section2piano3[2]);
addPattern('section2piano34', section2piano3[3]);

const section2pads2 = pattern(1/6, [
	[c6(20),e6(20),g6(20)],
	,
	,
	,
	[b5(4),d6(4),g6(4)],
	[b5(4),d6(4),fs6(4)],
	[a5(4),d6(4),f6(4)],
	[a5(4),c6(4),e6(4)]
],3);
addPattern('section2pads4', section2pads2[0]);
addPattern('section2pads5', section2pads2[1]);
addPattern('section2pads6', section2pads2[2]);

// playFromHere();
repeatSection(4, (count) => {
	playPatterns({
		kick: 'introkick',
		hihat: 'hihatsection2',	
		clap: count >= 2 ? 'section2clap' : undefined,
		bass: 'section2bass',
		epiano: 'section2piano1',
		epiano2: 'section2piano2',
		epiano3: 'section2piano3',
		epiano4: 'section2piano4',
		pad1: count===3 ? 'section2pads4' : 'section2pads1',
		pad2: count===3 ? 'section2pads5' : 'section2pads2',
		pad3: count===3 ? 'section2pads6' : 'section2pads3',		
		flute: count ===3 ? 'section2flute2' : 'section2flute',
		lead: count ===3 ? 'section2flute2' : 'section2flute',
		leadpitchbend: count===3 ? 'section2pitchbend2' : 'section2pitchbend'
	},3);

	playPatterns({
		kick: 'introkick',
		hihat: 'hihatsection2',	
		clap: count >= 2 ? 'section2clap' : undefined,
		bass: 'section2bass',
		epiano: 'section2piano1',
		epiano2: 'section2piano2',
		epiano3: 'section2piano3',
		epiano4: 'section2piano4',	
	},3);

	for(let n=0;n<2;n++) {
		playPatterns({
			kick: 'introkick',
			hihat: 'hihatsection2',	
			clap: count >= 2 ? 'section2clap' : undefined,
			bass: count ==3 ? n==0 ? 'section2bass3' : undefined : 'section2bass2',
			epiano: count ==3  ? n==0 ? 'section2piano31' : undefined : 'section2piano21',
			epiano2: count ==3  ? n==0 ?'section2piano32' : undefined : 'section2piano22',
			epiano3: count ==3  ? n==0 ?'section2piano33' : undefined : 'section2piano23',
			epiano4: count ==3  ? n==0 ? 'section2piano34' : undefined : 'section2piano24'
		},3);
	}
}, 0);



const section2pads3 = pattern(1/6, [
	[b5(4),d6(4),g6(4)],
	[b5(4),d6(4),fs6(4)],
	[a5(4),d6(4),f6(4)],
	[a5(4),c6(4),e6(4)]
],3);
addPattern('section2pads7', section2pads3[0]);
addPattern('section2pads8', section2pads3[1]);
addPattern('section2pads9', section2pads3[2]);

const section2lead3 = pattern(2,[
	[b5(2),2],,, d6(2),,,
	[a6(2),64],[,32],[,2], g6(2),,,
	,,, ,,,
	,,, d6(1),,e6,
	f6(1),,f6 , ,,f6,
	,,[g6(2),32],[,16] ,[,2],e6(1),
	,,d6, ,,c6(1.5),
	,,d6, ,,,
],2);

addPattern('section2lead3', section2lead3[0]);
addPattern('section2lead3pitchbend', section2lead3[1]);
// playFromHere();
repeatSection(2, () => {
	playPatterns({
		kick: 'introkick',
		hihat: 'hihatsection2',	
		clap: 'section2clap',
		pad1: 'section2pads7',
		pad2: 'section2pads8',
		pad3: 'section2pads9',
		bass: 'section2bass3',
		epiano: 'section2piano31',
		epiano2: 'section2piano32',
		epiano3: 'section2piano33',
		epiano4: 'section2piano34',
		flute: 'section2lead3',
		lead: 'section2lead3',
		leadpitchbend: 'section2lead3pitchbend'
	},3);
	playPatterns({
		kick: 'introkick',
		hihat: 'hihatsection2',	
		clap: 'section2clap',
	},3 );
});
//loopHere();
const section2endlead = pattern(2, [
	[g6(8),64],[,48],[,32],[,16],[,2]
], 2);
const section2endleadtone = addPattern(null,section2endlead[0]);
const section2endpitchbend = addPattern(null,section2endlead[1]);
const section2endpad = pattern(1/6, [
	[ds6(5),c6(5),g6(5)]
],3);
// playFromHere();
const section2endpiano = pattern(2,[
	[f3(4)],[,c4(4)],[,,ds5(4)],[,,,g5(4)]
],4);
playPatterns({
	flute: section2endleadtone,
	lead: section2endleadtone,
	leadpitchbend: section2endpitchbend,
	pad1: addPattern(null,section2endpad[0]),
	pad2: addPattern(null,section2endpad[1]),
	pad3: addPattern(null,section2endpad[2]),
	epiano: addPattern(null, section2endpiano[0]),
	epiano2: addPattern(null, section2endpiano[1]),
	epiano3: addPattern(null, section2endpiano[2]),
	epiano4: addPattern(null, section2endpiano[3]),
	bass: addPattern(null, pattern(2, [f3(6)])),
	kick: 'introkick',
	hihat: 'hihatsection2',	
},3);

// ---------- back to start

// playFromHere();
const versepads = pattern(1/12, [
	[e6(6),g6(6),b6(6)],
	[e6(6),g6(6),as6(6)],
	[cs6(6),e6(6),a6(6)],
	[b5(6),e6(6),g6(6)],
],3);
addPattern('versepad1',versepads[0]);
addPattern('versepad2',versepads[1]);
addPattern('versepad3',versepads[2]);

playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass2',	
	lead: 'verselead',
	flute: 'verselead',
	leadpitchbend: 'verseleadpitchbend',
	epiano: 'versepiano1',
	epiano2: 'versepiano2',
	epiano3: 'versepiano3',
	pad1: 'versepad1',
	pad2: 'versepad2',
	pad3: 'versepad3'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass2',	
	lead: 'verselead',
	flute: 'verselead',
	leadpitchbend: 'verseleadpitchbend',	
	epiano: 'versepiano4',
	epiano2: 'versepiano5',
	epiano3: 'versepiano6'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap'
},3);

const versepads2 = pattern(1/12, [
	[e6(6),g6(6),b6(6)],
	[cs6(6),e6(6),a6(6)],
	[b6(6),d6(6),g6(6)],
	[a5(6),cs6(6),g6(6)],
],3);
addPattern('versepad4',versepads2[0]);
addPattern('versepad5',versepads2[1]);
addPattern('versepad6',versepads2[2]);

playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass2',	
	epiano: 'pianosolo1',
	epiano2: 'pianosolo2',
	epiano3: 'pianosolo3',
	lead: 'pianosolotrumpet',
	flute: 'pianosolotrumpet',
	leadpitchbend: 'pianosolotrumpetpitchbend',
	pad1: 'versepad4',
	pad2: 'versepad5',
	pad3: 'versepad6'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap'
},3);
playPatterns({
	kick: 'kick',
	clap: 'clap',
	hihat: 'hihat',
	bass: 'bass2',
},3);
playPatterns({
	kick: 'kick',
	clap: 'clapfill'
},3);

const choruspads = pattern(1/6, [
	[d6(3),fs6(3),b6(15)],
	[e6(12),g6(3),],
	[,a6(3),],
	[,g6(3),],
	[d6(3),fs6(3),b6(15)],
	[e6(12),g6(3),],
	[,a6(3),],
	[,g6(3),],
],3);
addPattern('choruspad1',choruspads[0]);
addPattern('choruspad2',choruspads[1]);
addPattern('choruspad3',choruspads[2]);

// chorus
repeatSection(2, (count) => {
	playPatterns({
		kick: 'kick',
		clap: 'clap',
		hihat: 'hihat',
		bass: 'bass',
		epiano: 'piano1',
		epiano2: 'piano2',
		epiano3: 'piano3',
		lead: 'lead',
		flute: 'lead',
		leadpitchbend: 'leadpb',
		pad1: 'choruspad1',
		pad2: 'choruspad2',
		pad3: 'choruspad3'
	},3);
	playPatterns({
		clap: 'clap',
		lead: 'lead2',
		flute: 'lead2',
		leadpitchbend: 'leadpb2'
	},3);
	if(count===0) {
		playPatterns({
			kick: 'kick',
			clap: 'clap',
			hihat: 'hihat',
			bass: 'bass',
			epiano: 'piano4',
			epiano2: 'piano5',
			epiano3: 'piano6',
			lead: 'lead',
			flute: 'lead',
			leadpitchbend: 'leadpb'
		},3);
	
		playPatterns({
			kick: 'kick',
			clap: 'clapfill',
			lead: 'lead2',
			flute: 'lead2',
			leadpitchbend: 'leadpb2'
		},3);
	} else {
		playPatterns({
			epiano: 'piano4',
			epiano2: 'piano5',
			epiano3: 'piano6',			
			lead: 'lead',
			bass: addPattern(null, pattern(2, [b2(8)])),
			kick: 'introkick',
			hihat: 'introhihat',
			flute: 'lead',
			leadpitchbend: 'leadpb'
		},3);
	
		playPatterns({
			lead: 'lead2',
			flute: 'lead2',
			leadpitchbend: 'leadpb2'
		},3);
	}
}, 1);
playPatterns({
	
},3);
incMake4k.makeVierKlangInc();