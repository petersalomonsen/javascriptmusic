	GO4K_ENV	ATTAC(80),DECAY(128),SUSTAIN(128),RELEASE(80),GAIN(128)
	GO4K_VCO	TRANSPOSE(16),DETUNE(64),PHASE(0),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(TRISAW|LFO)
	GO4K_FST	AMOUNT(80),DEST(13*MAX_UNIT_SLOTS+4+FST_SET)
	GO4K_FST	AMOUNT(48),DEST(9*MAX_UNIT_SLOTS+4+FST_SET)
	GO4K_FST	AMOUNT(58),DEST(9*MAX_UNIT_SLOTS+5+FST_SET)
	GO4K_FOP	OP(FOP_POP)
	GO4K_VCO	TRANSPOSE(64),DETUNE(56),PHASE(0),GATES(85),COLOR(4),SHAPE(64),GAIN(128),FLAGS(TRISAW)
	GO4K_VCO	TRANSPOSE(76),DETUNE(72),PHASE(0),GATES(85),COLOR(8),SHAPE(64),GAIN(128),FLAGS(TRISAW)
	GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(16),FLAGS(NOISE)
	GO4K_VCF	FREQUENCY(105),RESONANCE(18),VCFTYPE(BANDPASS)
	GO4K_FOP	OP(FOP_ADDP)
	GO4K_FOP	OP(FOP_ADDP)
	GO4K_FOP	OP(FOP_PUSH)
	GO4K_VCF	FREQUENCY(26),RESONANCE(128),VCFTYPE(BANDPASS)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_VCF	FREQUENCY(96),RESONANCE(128),VCFTYPE(BANDPASS)
	GO4K_FOP	OP(FOP_ADDP)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_DLL	PREGAIN(112),DRY(64),FEEDBACK(64),DAMP(64),FREQUENCY(56),DEPTH(48),DELAY(17),COUNT(1) ; ERROR
	GO4K_PAN	PANNING(64)
	GO4K_OUT	GAIN(64), AUXSEND(64)
