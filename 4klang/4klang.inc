%include "notes.inc"
; //----------------------------------------------------------------------------------------
; //	useful macros
; //----------------------------------------------------------------------------------------
; //	export function	(make it accessable	from main.cpp)
; //----------------------------------------------------------------------------------------
%macro export_func 1
   global _%1
   _%1:
%endmacro
;%define USE_SECTIONS
; //----------------------------------------------------------------------------------------
; //	basic defines for the song/synth
; //----------------------------------------------------------------------------------------
%define AUTHORING
%define	SAMPLE_RATE	44100
%define	MAX_INSTRUMENTS	9
%define	MAX_VOICES 1
%define	HLD	1 ;	// can be adjusted to give crinkler	some other possibilities
%define	BPM	100
%define	MAX_PATTERNS 1
%define	PATTERN_SIZE_SHIFT 4
%define	PATTERN_SIZE (1	<< PATTERN_SIZE_SHIFT)
%define	MAX_TICKS (MAX_PATTERNS*PATTERN_SIZE)
%define	SAMPLES_PER_TICK (SAMPLE_RATE*4*60/(BPM*16))
%define	DEF_LFO_NORMALIZE 0.000038
%define	MAX_SAMPLES	(SAMPLES_PER_TICK*MAX_TICKS)
; //----------------------------------------------------------------------------------------
; //	some defines for unit usage, which reduce synth	code size
; //----------------------------------------------------------------------------------------
;%define 	GO4K_USE_16BIT_OUTPUT			; // removing this will output to 32bit floating point buffer
;%define	GO4K_USE_GROOVE_PATTERN			; // removing this skips groove pattern code
;%define 	GO4K_USE_ENVELOPE_RECORDINGS	; // removing this skips envelope recording code
;%define 	GO4K_USE_NOTE_RECORDINGS		; // removing this skips note recording code
%define		GO4K_USE_UNDENORMALIZE			; // removing this skips denormalization code in the units
%define		GO4K_CLIP_OUTPUT				; // removing this skips clipping code for the final output
%define		GO4K_USE_DST					; // removing this will	skip DST unit
%define		GO4K_USE_DLL					; // removing this will	skip DLL unit
%define		GO4K_USE_PAN					; // removing this will	skip PAN unit
%define		GO4K_USE_GLOBAL_DLL				; // removing this will	skip global	dll	processing
%define		GO4K_USE_FSTG					; // removing this will	skip global	store unit
%define		GO4K_USE_FLD					; // removing this will	skip float load unit
%define		GO4K_USE_GLITCH					; // removing this will	skip GLITCH unit
%define		GO4K_USE_ENV_CHECK				; // removing this skips checks	if processing is needed
%define		GO4K_USE_ENV_MOD_GM				; // removing this will	skip env gain modulation code
%define		GO4K_USE_ENV_MOD_ADR			; // removing this will skip env attack/decay/release modulation code
%define		GO4K_USE_VCO_CHECK				; // removing this skips checks	if processing is needed
%define		GO4K_USE_VCO_PHASE_OFFSET		; // removing this will	skip initial phase offset code
%define		GO4K_USE_VCO_SHAPE				; // removing this skips waveshaping code
%define		GO4K_USE_VCO_GATE				; // removing this skips gate code
%define		GO4K_USE_VCO_MOD_FM				; // removing this skips frequency modulation code
%define		GO4K_USE_VCO_MOD_PM				; // removing this skips phase modulation code
%define		GO4K_USE_VCO_MOD_TM				; // removing this skips transpose modulation code
%define		GO4K_USE_VCO_MOD_DM				; // removing this skips detune	modulation code
%define		GO4K_USE_VCO_MOD_CM				; // removing this skips color modulation code
%define		GO4K_USE_VCO_MOD_GM				; // removing this skips gain modulation code
%define		GO4K_USE_VCO_MOD_SM				; // removing this skips shaping modulation	code
%define		GO4K_USE_VCO_STEREO				; // removing this skips stereo code
%define		GO4K_USE_VCF_CHECK				; // removing this skips checks	if processing is needed
%define		GO4K_USE_VCF_MOD_FM				; // removing this skips frequency modulation code
%define		GO4K_USE_VCF_MOD_RM				; // removing this skips resonance modulation code
%define		GO4K_USE_VCF_HIGH				; // removing this skips code for high output
%define		GO4K_USE_VCF_BAND				; // removing this skips code for band output
%define		GO4K_USE_VCF_PEAK				; // removing this skips code for peak output
%define		GO4K_USE_VCF_STEREO				; // removing this skips code for stereo filter output
%define		GO4K_USE_DST_CHECK				; // removing this skips checks	if processing is needed
%define		GO4K_USE_DST_SH					; // removing this skips sample	and	hold code
%define		GO4K_USE_DST_MOD_DM				; // removing this skips distortion	modulation code
%define		GO4K_USE_DST_MOD_SH				; // removing this skips sample	and	hold modulation	code
%define		GO4K_USE_DST_STEREO				; // removing this skips stereo processing
%define		GO4K_USE_DLL_NOTE_SYNC			; // removing this will	skip delay length adjusting	code (karplus strong)
%define		GO4K_USE_DLL_CHORUS				; // removing this will	skip delay chorus/flanger code
%define		GO4K_USE_DLL_CHORUS_CLAMP		; // removing this will skip chorus lfo phase clamping
%define		GO4K_USE_DLL_DAMP				; // removing this will	skip dll damping code
%define		GO4K_USE_DLL_DC_FILTER			; // removing this will	skip dll dc	offset removal code
%define		GO4K_USE_FSTG_CHECK				; // removing this skips checks	if processing is needed
%define		GO4K_USE_PAN_MOD				; // removing this will	skip panning modulation	code
%define		GO4K_USE_OUT_MOD_AM				; // removing this skips output	aux	send modulation	code
%define		GO4K_USE_OUT_MOD_GM				; // removing this skips output	gain modulation	code
%define		GO4K_USE_WAVESHAPER_CLIP		; // removing this will	skip clipping code
%define		GO4K_USE_FLD_MOD_VM				; // removing this will	skip float load modulation	code
%define 	GO4K_USE_DLL_MOD				; // define this to enable modulations for delay line
%define 	GO4K_USE_DLL_MOD_PM				; // define this to enable pregain modulation for delay line
%define 	GO4K_USE_DLL_MOD_FM				; // define this to enable feebback modulation for delay line
%define 	GO4K_USE_DLL_MOD_IM				; // define this to enable dry modulation for delay line
%define 	GO4K_USE_DLL_MOD_DM				; // define this to enable damping modulation for delay line
%define 	GO4K_USE_DLL_MOD_SM				; // define this to enable lfo freq modulation for delay line
%define 	GO4K_USE_DLL_MOD_AM				; // define this to enable lfo depth modulation for delay line

; //----------------------------------------------------------------------------------------
; // synth defines
; //----------------------------------------------------------------------------------------
%define	MAX_DELAY			65536
%define MAX_UNITS			64
%define	MAX_UNIT_SLOTS		16
%define GO4K_BEGIN_CMDDEF(def_name)
%define GO4K_END_CMDDEF db 0
%define GO4K_BEGIN_PARAMDEF(def_name)
%define GO4K_END_PARAMDEF
; //----------------------------------------------------------------------------------------
; // ENV structs
; //----------------------------------------------------------------------------------------
GO4K_ENV_ID		equ		1
%macro	GO4K_ENV 5
	db	%1
	db	%2
	db	%3
	db	%4
	db	%5
%endmacro
%define	ATTAC(val)		val	
%define	DECAY(val)		val	
%define	SUSTAIN(val)	val	
%define	RELEASE(val)	val	
%define	GAIN(val)		val	
struc	go4kENV_val
;//	unit paramters
	.attac		resd	1
	.decay		resd	1
	.sustain	resd	1
	.release	resd	1
	.gain		resd	1
	.size
endstruc
struc	go4kENV_wrk
;//	work variables	
	.state		resd	1
	.level		resd	1
;//	modulation targets
	.gm			resd	1
	.am			resd	1
	.dm			resd	1
	.sm			resd	1
	.rm			resd	1
	.size
endstruc
%define	ENV_STATE_ATTAC		0
%define	ENV_STATE_DECAY		1
%define	ENV_STATE_SUSTAIN	2
%define	ENV_STATE_RELEASE	3
%define	ENV_STATE_OFF		4
; //----------------------------------------------------------------------------------------
; // VCO structs
; //----------------------------------------------------------------------------------------
GO4K_VCO_ID		equ		2

%macro	GO4K_VCO 8
	db	%1
	db	%2
%ifdef GO4K_USE_VCO_PHASE_OFFSET	
	db	%3
%endif
%ifdef GO4K_USE_VCO_GATE
	db	%4
%endif	
	db	%5
%ifdef GO4K_USE_VCO_SHAPE
	db	%6
%else
%endif	
	db	%7
	db	%8
%endmacro
%define	TRANSPOSE(val)	val	
%define	DETUNE(val)		val	
%define	PHASE(val)		val
%define GATES(val)		val		
%define	COLOR(val)		val
%define	SHAPE(val)		val	
%define	FLAGS(val)		val	
%define	SINE		0x01
%define	TRISAW		0x02
%define	PULSE		0x04
%define	NOISE		0x08
%define	LFO			0x10
%define	GATE		0x20
%define	VCO_STEREO	0x40
struc	go4kVCO_val
;//	unit paramters
	.transpose	resd	1
	.detune		resd	1
%ifdef GO4K_USE_VCO_PHASE_OFFSET	
	.phaseofs	resd	1
%endif	
%ifdef GO4K_USE_VCO_GATE
	.gate		resd	1
%endif	
	.color		resd	1
%ifdef GO4K_USE_VCO_SHAPE	
	.shape		resd	1
%endif
	.gain		resd	1
	.flags		resd	1	
	.size
endstruc
struc	go4kVCO_wrk
;//	work variables
	.phase		resd	1
;//	modulation targets
	.tm			resd	1
	.dm			resd	1
	.fm			resd	1
	.pm			resd	1
	.cm			resd	1
	.sm			resd	1
	.gm			resd	1
;// stero variables	
	.phase2		resd	1
	.size
endstruc
; //----------------------------------------------------------------------------------------
; // VCF structs
; //----------------------------------------------------------------------------------------
GO4K_VCF_ID		equ		3
%macro	GO4K_VCF 3
	db	%1
	db	%2
	db	%3
%endmacro
%define	LOWPASS		0x1
%define	HIGHPASS	0x2
%define	BANDPASS	0x4
%define	BANDSTOP	0x3
%define	ALLPASS		0x7
%define	PEAK		0x8
%define STEREO		0x10
%define	FREQUENCY(val)	val
%define	RESONANCE(val)	val
%define	VCFTYPE(val)	val
struc	go4kVCF_val
;//	unit paramters
	.freq		resd	1
	.res		resd	1
	.type		resd	1
	.size
endstruc
struc	go4kVCF_wrk
;//	work variables
	.low		resd	1
	.high		resd	1
	.band		resd	1
	.freq		resd	1 ;// unused but kept so modulation target offsets stay same
;//	modulation targets
	.fm			resd	1
	.rm			resd	1
;// stereo variables	
	.low2		resd	1
	.high2		resd	1
	.band2		resd	1	
	.size
endstruc
; //----------------------------------------------------------------------------------------
; // DST structs
; //----------------------------------------------------------------------------------------
GO4K_DST_ID		equ		4
%macro	GO4K_DST 3
	db	%1
%ifdef GO4K_USE_DST_SH	
	db	%2
	%ifdef GO4K_USE_DST_STEREO	
		db	%3
	%endif
%else
	%ifdef GO4K_USE_DST_STEREO	
		db	%3
	%endif
%endif
%endmacro
%define	DRIVE(val)		val
%define	SNHFREQ(val)	val
%define	FLAGS(val)		val
struc	go4kDST_val
;//	unit paramters
	.drive		resd	1
%ifdef GO4K_USE_DST_SH	
	.snhfreq	resd	1
%endif	
	.flags		resd	1
	.size
endstruc
struc	go4kDST_wrk
;//	work variables
	.out		resd	1
	.snhphase	resd	1
;//	modulation targets
	.dm			resd	1
	.sm			resd	1
;// stereo variables
	.out2		resd	1
	.size
endstruc
; //----------------------------------------------------------------------------------------
; // DLL structs
; //----------------------------------------------------------------------------------------
GO4K_DLL_ID		equ		5
%macro	GO4K_DLL 8
	db	%1
	db	%2
	db	%3
%ifdef GO4K_USE_DLL_DAMP	
	db	%4
%endif		
%ifdef GO4K_USE_DLL_CHORUS
	db	%5
	db	%6
%endif
	db	%7
	db	%8
%endmacro
%define	PREGAIN(val)	val
%define	DRY(val)		val
%define	FEEDBACK(val)	val
%define	DEPTH(val)		val
%define	DAMP(val)		val
%define	DELAY(val)		val
%define	COUNT(val)		val
struc	go4kDLL_val
;//	unit paramters
	.pregain	resd	1
	.dry		resd	1
	.feedback	resd	1
%ifdef GO4K_USE_DLL_DAMP	
	.damp		resd	1	
%endif
%ifdef GO4K_USE_DLL_CHORUS
	.freq		resd	1
	.depth
%endif	
	.delay		resd	1
	.count		resd	1
	.size
endstruc
struc	go4kDLL_wrk
;//	work variables
	.index		resd	1
	.store		resd	1
	.dcin		resd	1
	.dcout		resd	1
	.phase		resd	1
;// the delay buffer	
	.buffer		resd	MAX_DELAY
	.size
endstruc
struc	go4kDLL_wrk2
;//	modulation targets
	.pm			resd	1
	.fm			resd	1
	.im			resd	1	
	.dm			resd	1
	.sm			resd	1
	.am			resd	1
	.size
endstruc
; //----------------------------------------------------------------------------------------
; // FOP structs
; //----------------------------------------------------------------------------------------
GO4K_FOP_ID	equ			6
%macro	GO4K_FOP 1
	db	%1
%endmacro
%define	OP(val)			val
%define	FOP_POP			0x1
%define	FOP_ADDP		0x2
%define	FOP_MULP		0x3
%define	FOP_PUSH		0x4
%define	FOP_XCH			0x5
%define	FOP_ADD			0x6
%define	FOP_MUL			0x7
%define	FOP_ADDP2		0x8
%define FOP_LOADNOTE	0x9
%define	FOP_MULP2		0xa
struc	go4kFOP_val
	.flags		resd	1
	.size
endstruc
struc	go4kFOP_wrk
	.size
endstruc
; //----------------------------------------------------------------------------------------
; // FST structs
; //----------------------------------------------------------------------------------------
GO4K_FST_ID		equ		7
%macro	GO4K_FST 2
	db	%1
	dw	%2
%endmacro
%define	AMOUNT(val)		val
%define	DEST(val)		val
%define	FST_SET			0x0000
%define	FST_ADD			0x4000
%define	FST_POP			0x8000
struc	go4kFST_val
	.amount		resd	1
	.op1		resd	1
	.size
endstruc
struc	go4kFST_wrk
	.size
endstruc
; //----------------------------------------------------------------------------------------
; // PAN structs
; //----------------------------------------------------------------------------------------
GO4K_PAN_ID		equ		8
%macro	GO4K_PAN 1
%ifdef GO4K_USE_PAN
	db	%1
%endif
%endmacro
%define	PANNING(val)	val
struc	go4kPAN_val
%ifdef GO4K_USE_PAN
	.panning	resd	1
%endif
	.size
endstruc
struc	go4kPAN_wrk
;//	modulation targets
	.pm			resd	1
	.size
endstruc
; //----------------------------------------------------------------------------------------
; // OUT structs
; //----------------------------------------------------------------------------------------
GO4K_OUT_ID		equ		9
%macro	GO4K_OUT 2
	db	%1
%ifdef GO4K_USE_GLOBAL_DLL	
	db	%2
%endif	
%endmacro
%define	AUXSEND(val)	val
struc	go4kOUT_val
	.gain		resd	1
%ifdef GO4K_USE_GLOBAL_DLL	
	.auxsend	resd	1
%endif
	.size
endstruc
struc	go4kOUT_wrk
;//	modulation targets
	.am			resd	1
	.gm			resd	1
	.size
endstruc
; //----------------------------------------------------------------------------------------
; // ACC structs (this is for the synth	def	only)
; //----------------------------------------------------------------------------------------
GO4K_ACC_ID		equ		10
%macro	GO4K_ACC 1
	db	%1
%endmacro
%define	OUTPUT			0
%define	AUX				8
%define	ACCTYPE(val)	val
struc	go4kACC_val
	.acctype	resd	1
	.size
endstruc
struc	go4kACC_wrk
	.size
endstruc
%ifdef GO4K_USE_FLD
; //----------------------------------------------------------------------------------------
; // FLD structs
; //----------------------------------------------------------------------------------------
GO4K_FLD_ID	equ		11
%macro	GO4K_FLD 1
	db	%1
%endmacro
%define	VALUE(val)	val
struc	go4kFLD_val
	.value		resd	1
	.size
endstruc
struc	go4kFLD_wrk
;//	modulation targets
	.vm			resd	1
	.size
endstruc
%endif
%ifdef GO4K_USE_GLITCH
; //----------------------------------------------------------------------------------------
; // GLITCH structs
; //----------------------------------------------------------------------------------------
GO4K_GLITCH_ID		equ		12
%macro	GO4K_GLITCH 5
	db	%1
	db	%2
	db	%3
	db	%4
	db	%5
%endmacro
%define	ACTIVE(val)		val
%define	SLICEFACTOR(val)val
%define	PITCHFACTOR(val)val
%define	SLICESIZE(val)	val
struc	go4kGLITCH_val
;//	unit paramters
	.active		resd	1
	.dry		resd	1
	.dsize		resd	1
	.dpitch		resd	1
	.slicesize	resd	1
	.size
endstruc
struc	go4kGLITCH_wrk
;//	work variables
	.index		resd	1
	.store		resd	1
	.slizesize	resd	1
	.slicepitch	resd	1
	.unused		resd	1
;// the delay buffer	
	.buffer		resd	MAX_DELAY
	.size
endstruc
struc	go4kGLITCH_wrk2
;//	modulation targets
	.am			resd	1
	.dm			resd	1
	.sm			resd	1
	.pm			resd	1
	.size
endstruc
%endif
%ifdef GO4K_USE_FSTG
; //----------------------------------------------------------------------------------------
; // FSTG structs
; //----------------------------------------------------------------------------------------
GO4K_FSTG_ID	equ		13
%macro	GO4K_FSTG 2
	db	%1
	dw	%2
%endmacro
struc	go4kFSTG_val
	.amount		resd	1
	.op1		resd	1
	.size
endstruc
struc	go4kFSTG_wrk
	.size
endstruc
%endif
; //----------------------------------------------------------------------------------------
; // Voice struct
; //----------------------------------------------------------------------------------------
struc	go4k_instrument
	.release	resd	1
	.note		resd	1
	.workspace	resd	MAX_UNITS*MAX_UNIT_SLOTS
	.dlloutl	resd	1
	.dlloutr	resd	1
	.outl		resd	1
	.outr		resd	1
	.size
endstruc
; //----------------------------------------------------------------------------------------
; // Synth struct
; //----------------------------------------------------------------------------------------
struc	go4k_synth
	.instruments	resb	go4k_instrument.size * MAX_INSTRUMENTS * MAX_VOICES
	.global			resb	go4k_instrument.size * MAX_VOICES
	.size
endstruc
; //----------------------------------------------------------------------------------------
; // Pattern Data, reduced by 967 patterns
; //----------------------------------------------------------------------------------------
%ifdef USE_SECTIONS
section	.g4kmuc1 data align=1
%else
section .data align=1
%endif
go4k_patterns
	times 16 db 0
	db	d4,	f4,	0, d5, 0, d5, d4, 0, f4, HLD,	f5, HLD,	g4, HLD, g5, HLD,	
	db	c3,	0,	0, 0, c3, 0, 0, 0, c3, 0, 0, 0,	c3, 0, 0, 0,	
go4k_patterns_end
; //----------------------------------------------------------------------------------------
; // Pattern Index List
; //----------------------------------------------------------------------------------------
%ifdef USE_SECTIONS
section	.g4kmuc2 data align=1
%else
section .data
%endif
go4k_pattern_lists
Instrument0List		db	0
Instrument1List		db	0
Instrument2List		db	1
Instrument3List		db	0
Instrument4List		db	2
Instrument5List		db	0
Instrument6List		db	0
Instrument7List		db	0
Instrument8List		db	0
go4k_pattern_lists_end
; //----------------------------------------------------------------------------------------
; // Instrument	Commands
; //----------------------------------------------------------------------------------------
%ifdef USE_SECTIONS
section	.g4kmuc3 data align=1
%else
section .data
%endif
go4k_synth_instructions
GO4K_BEGIN_CMDDEF(Instrument0)
	db GO4K_ENV_ID
	db GO4K_FST_ID
	db GO4K_VCO_ID
	db GO4K_VCO_ID
	db GO4K_VCO_ID
	db GO4K_FST_ID
	db GO4K_FST_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_VCF_ID
	db GO4K_DST_ID
	db GO4K_PAN_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument1)
	db GO4K_ENV_ID
	db GO4K_FST_ID
	db GO4K_VCO_ID
	db GO4K_VCO_ID
	db GO4K_VCO_ID
	db GO4K_FST_ID
	db GO4K_FST_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_VCF_ID
	db GO4K_DST_ID
	db GO4K_PAN_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument2)
	db GO4K_ENV_ID
	db GO4K_FST_ID
	db GO4K_VCO_ID
	db GO4K_VCO_ID
	db GO4K_VCO_ID
	db GO4K_FST_ID
	db GO4K_FST_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_VCF_ID
	db GO4K_DST_ID
	db GO4K_PAN_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument3)
	db GO4K_ENV_ID
	db GO4K_FST_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_PAN_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument4)
	db GO4K_ENV_ID
	db GO4K_FST_ID
	db GO4K_ENV_ID
	db GO4K_DST_ID
	db GO4K_FST_ID
	db GO4K_FOP_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_PAN_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument5)
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_PAN_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument6)
	db GO4K_ENV_ID
	db GO4K_FST_ID
	db GO4K_ENV_ID
	db GO4K_FST_ID
	db GO4K_FST_ID
	db GO4K_FOP_ID
	db GO4K_VCO_ID
	db GO4K_VCO_ID
	db GO4K_VCO_ID
	db GO4K_VCF_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_PAN_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument7)
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_PAN_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument8)
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_FSTG_ID
	db GO4K_FSTG_ID
	db GO4K_FOP_ID
GO4K_END_CMDDEF
;//	global commands
GO4K_BEGIN_CMDDEF(Global)
	db GO4K_ACC_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_DLL_ID
	db GO4K_FOP_ID
	db GO4K_ACC_ID
	db GO4K_FOP_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
go4k_synth_instructions_end
; //----------------------------------------------------------------------------------------
; // Intrument Data
; //----------------------------------------------------------------------------------------
%ifdef USE_SECTIONS
section	.g4kmuc4 data align=1
%else
section .data
%endif
go4k_synth_parameter_values
GO4K_BEGIN_PARAMDEF(Instrument0)
	GO4K_ENV	ATTAC(72),DECAY(96),SUSTAIN(96),RELEASE(88),GAIN(128)
	GO4K_FST	AMOUNT(64),DEST(0*MAX_UNIT_SLOTS+2)
	GO4K_VCO	TRANSPOSE(64),DETUNE(60),PHASE(32),GATES(0),COLOR(80),SHAPE(64),GAIN(128),FLAGS(PULSE)
	GO4K_VCO	TRANSPOSE(64),DETUNE(72),PHASE(32),GATES(0),COLOR(96),SHAPE(64),GAIN(128),FLAGS(TRISAW)
	GO4K_VCO	TRANSPOSE(32),DETUNE(64),PHASE(0),GATES(0),COLOR(64),SHAPE(96),GAIN(128),FLAGS(SINE|LFO)
	GO4K_FST	AMOUNT(68),DEST(2*MAX_UNIT_SLOTS+2)
	GO4K_FST	AMOUNT(61),DEST(3*MAX_UNIT_SLOTS+2)
	GO4K_FOP	OP(FOP_POP)
	GO4K_FOP	OP(FOP_ADDP)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_VCF	FREQUENCY(26),RESONANCE(128),VCFTYPE(PEAK)
	GO4K_VCF	FREQUENCY(64),RESONANCE(64),VCFTYPE(LOWPASS)
	GO4K_DST	DRIVE(104),	SNHFREQ(128), FLAGS(0)
	GO4K_PAN	PANNING(64)
	GO4K_DLL	PREGAIN(96),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(16),COUNT(1)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_DLL	PREGAIN(96),DRY(128),FEEDBACK(64),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(17),COUNT(1)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_OUT	GAIN(0), AUXSEND(32)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument1)
	GO4K_ENV	ATTAC(72),DECAY(96),SUSTAIN(96),RELEASE(88),GAIN(128)
	GO4K_FST	AMOUNT(64),DEST(0*MAX_UNIT_SLOTS+2)
	GO4K_VCO	TRANSPOSE(64),DETUNE(60),PHASE(32),GATES(0),COLOR(80),SHAPE(64),GAIN(128),FLAGS(TRISAW)
	GO4K_VCO	TRANSPOSE(64),DETUNE(72),PHASE(32),GATES(0),COLOR(96),SHAPE(112),GAIN(64),FLAGS(SINE)
	GO4K_VCO	TRANSPOSE(80),DETUNE(112),PHASE(0),GATES(0),COLOR(64),SHAPE(16),GAIN(128),FLAGS(PULSE|LFO)
	GO4K_FST	AMOUNT(68),DEST(2*MAX_UNIT_SLOTS+2)
	GO4K_FST	AMOUNT(60),DEST(3*MAX_UNIT_SLOTS+2)
	GO4K_FOP	OP(FOP_POP)
	GO4K_FOP	OP(FOP_ADDP)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_VCF	FREQUENCY(80),RESONANCE(24),VCFTYPE(LOWPASS)
	GO4K_VCF	FREQUENCY(48),RESONANCE(24),VCFTYPE(HIGHPASS)
	GO4K_DST	DRIVE(64), SNHFREQ(128), FLAGS(0)
	GO4K_PAN	PANNING(64)
	GO4K_DLL	PREGAIN(96),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(16),COUNT(1)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_DLL	PREGAIN(96),DRY(128),FEEDBACK(64),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(17),COUNT(1)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_OUT	GAIN(0), AUXSEND(32)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument2)
	GO4K_ENV	ATTAC(32),DECAY(64),SUSTAIN(64),RELEASE(64),GAIN(64)
	GO4K_FST	AMOUNT(120),DEST(0*MAX_UNIT_SLOTS+2)
	GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(32),GATES(0),COLOR(80),SHAPE(64),GAIN(128),FLAGS(PULSE)
	GO4K_VCO	TRANSPOSE(64),DETUNE(72),PHASE(32),GATES(0),COLOR(96),SHAPE(64),GAIN(128),FLAGS(TRISAW)
	GO4K_VCO	TRANSPOSE(32),DETUNE(64),PHASE(0),GATES(0),COLOR(64),SHAPE(96),GAIN(128),FLAGS(SINE|LFO)
	GO4K_FST	AMOUNT(68),DEST(2*MAX_UNIT_SLOTS+2)
	GO4K_FST	AMOUNT(60),DEST(3*MAX_UNIT_SLOTS+2)
	GO4K_FOP	OP(FOP_POP)
	GO4K_FOP	OP(FOP_ADDP)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_VCF	FREQUENCY(18),RESONANCE(64),VCFTYPE(PEAK)
	GO4K_VCF	FREQUENCY(32),RESONANCE(48),VCFTYPE(LOWPASS)
	GO4K_DST	DRIVE(88), SNHFREQ(128), FLAGS(0)
	GO4K_PAN	PANNING(64)
	GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(16),COUNT(1)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(64),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(17),COUNT(1)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_OUT	GAIN(64), AUXSEND(64)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument3)
	GO4K_ENV	ATTAC(0),DECAY(76),SUSTAIN(0),RELEASE(0),GAIN(32)
	GO4K_FST	AMOUNT(128),DEST(0*MAX_UNIT_SLOTS+2)
	GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(0),COLOR(64),SHAPE(64),GAIN(128),FLAGS(NOISE)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_VCF	FREQUENCY(80),RESONANCE(128),VCFTYPE(LOWPASS)
	GO4K_PAN	PANNING(64)
	GO4K_OUT	GAIN(64), AUXSEND(0)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument4)
	GO4K_ENV	ATTAC(0),DECAY(64),SUSTAIN(96),RELEASE(64),GAIN(128)
	GO4K_FST	AMOUNT(128),DEST(0*MAX_UNIT_SLOTS+2)
	GO4K_ENV	ATTAC(0),DECAY(70),SUSTAIN(0),RELEASE(0),GAIN(128)
	GO4K_DST	DRIVE(32), SNHFREQ(128), FLAGS(0)
	GO4K_FST	AMOUNT(80),DEST(6*MAX_UNIT_SLOTS+1)
	GO4K_FOP	OP(FOP_POP)
	GO4K_VCO	TRANSPOSE(46),DETUNE(64),PHASE(0),GATES(0),COLOR(64),SHAPE(64),GAIN(128),FLAGS(TRISAW)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_PAN	PANNING(64)
	GO4K_OUT	GAIN(128), AUXSEND(0)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument5)
	GO4K_ENV	ATTAC(0),DECAY(64),SUSTAIN(0),RELEASE(0),GAIN(128)
	GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(0),COLOR(64),SHAPE(64),GAIN(128),FLAGS(NOISE)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_VCF	FREQUENCY(128),RESONANCE(128),VCFTYPE(BANDPASS)
	GO4K_PAN	PANNING(64)
	GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(16),COUNT(1)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(64),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(17),COUNT(1)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_OUT	GAIN(64), AUXSEND(0)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument6)
	GO4K_ENV	ATTAC(0),DECAY(72),SUSTAIN(0),RELEASE(72),GAIN(128)
	GO4K_FST	AMOUNT(128),DEST(0*MAX_UNIT_SLOTS+2)
	GO4K_ENV	ATTAC(0),DECAY(56),SUSTAIN(0),RELEASE(0),GAIN(128)
	GO4K_FST	AMOUNT(108),DEST(6*MAX_UNIT_SLOTS+1)
	GO4K_FST	AMOUNT(72),DEST(7*MAX_UNIT_SLOTS+1)
	GO4K_FOP	OP(FOP_POP)
	GO4K_VCO	TRANSPOSE(32),DETUNE(64),PHASE(0),GATES(0),COLOR(64),SHAPE(32),GAIN(64),FLAGS(SINE)
	GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(0),COLOR(64),SHAPE(80),GAIN(64),FLAGS(SINE)
	GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(0),COLOR(64),SHAPE(64),GAIN(64),FLAGS(NOISE)
	GO4K_VCF	FREQUENCY(104),RESONANCE(128),VCFTYPE(LOWPASS)
	GO4K_FOP	OP(FOP_ADDP)
	GO4K_FOP	OP(FOP_ADDP)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_VCF	FREQUENCY(22),RESONANCE(32),VCFTYPE(HIGHPASS)
	GO4K_PAN	PANNING(64)
	GO4K_OUT	GAIN(64), AUXSEND(0)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument7)
	GO4K_ENV	ATTAC(0),DECAY(0),SUSTAIN(96),RELEASE(32),GAIN(128)
	GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(0),GATES(0),COLOR(80),SHAPE(64),GAIN(128),FLAGS(PULSE)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_PAN	PANNING(64)
	GO4K_DLL	PREGAIN(96),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(16),COUNT(1)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_DLL	PREGAIN(96),DRY(128),FEEDBACK(64),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(17),COUNT(1)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_OUT	GAIN(0), AUXSEND(64)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument8)
	GO4K_ENV	ATTAC(0),DECAY(0),SUSTAIN(128),RELEASE(0),GAIN(128)
	GO4K_VCO	TRANSPOSE(48),DETUNE(64),PHASE(0),GATES(0),COLOR(64),SHAPE(64),GAIN(128),FLAGS(TRISAW|LFO)
	GO4K_FOP	OP(FOP_MULP)
	GO4K_FSTG	AMOUNT(72),DEST(2*go4k_instrument.size*MAX_VOICES+10*MAX_UNIT_SLOTS*4+4*4+go4k_instrument.workspace)
	GO4K_FSTG	AMOUNT(66),DEST(1*go4k_instrument.size*MAX_VOICES+10*MAX_UNIT_SLOTS*4+4*4+go4k_instrument.workspace)
	GO4K_FOP	OP(FOP_POP)
GO4K_END_PARAMDEF
;//	global parameters
GO4K_BEGIN_PARAMDEF(Global)
	GO4K_ACC	ACCTYPE(AUX)
	GO4K_DLL	PREGAIN(40),DRY(128),FEEDBACK(125),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(0),COUNT(8)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_DLL	PREGAIN(40),DRY(128),FEEDBACK(125),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(8),COUNT(8)
	GO4K_FOP	OP(FOP_XCH)
	GO4K_ACC	ACCTYPE(OUTPUT)
	GO4K_FOP	OP(FOP_ADDP2)
	GO4K_OUT	GAIN(64), AUXSEND(0)
GO4K_END_PARAMDEF
go4k_synth_parameter_values_end
; //----------------------------------------------------------------------------------------
; // Delay/Reverb Times
; //----------------------------------------------------------------------------------------
%ifdef USE_SECTIONS
section	.g4kmuc5 data align=1
%else
section .data
%endif
%ifdef GO4K_USE_DLL
global _go4k_delay_times
_go4k_delay_times
	dw 0
	dw 1116
	dw 1188
	dw 1276
	dw 1356
	dw 1422
	dw 1492
	dw 1556
	dw 1618
	dw 1140
	dw 1212
	dw 1300
	dw 1380
	dw 1446
	dw 1516
	dw 1580
	dw 1642
	dw 22050
	dw 16537
	dw 11025
%endif
