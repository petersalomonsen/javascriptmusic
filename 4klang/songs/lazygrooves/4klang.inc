
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

; // -------------------------------
; // Single tick rendering
%define AUTHORING
%define SINGLE_TICK_RENDERING
%define GO4K_USE_ENVELOPE_RECORDINGS	; // removing this skips envelope recording code
%define GO4K_USE_NOTE_RECORDINGS		; // removing this skips note recording code
; // -------------------------------

%define	SAMPLE_RATE	44100
%define	MAX_INSTRUMENTS	14
%define	MAX_VOICES 1
%define	HLD	1 ;	// can be adjusted to give crinkler	some other possibilities
%define	BPM	280
%define	MAX_PATTERNS 201
%define	PATTERN_SIZE_SHIFT 3
%define	PATTERN_SIZE (1	<< PATTERN_SIZE_SHIFT)
%define	MAX_TICKS (MAX_PATTERNS*PATTERN_SIZE)
%define	SAMPLES_PER_TICK (SAMPLE_RATE*4*60/(BPM*PATTERN_SIZE))
%define	DEF_LFO_NORMALIZE 0.000038
%define	MAX_SAMPLES	(SAMPLES_PER_TICK*MAX_TICKS)
; //----------------------------------------------------------------------------------------
; //	some defines for unit usage, which reduce synth	code size
; //----------------------------------------------------------------------------------------
;%define 	GO4K_USE_16BIT_OUTPUT			; // removing this will output to 32bit floating point buffer
;%define	GO4K_USE_GROOVE_PATTERN			; // removing this skips groove pattern code
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
    times 8 db 0
    db 64, 0, 0, 0, 0, 0, 64, 0
db 0, 0, 0, 0, 64, 0, 0, 40
db 0, 0, 64, 0, 0, 0, 0, 28
db 0, 0, 0, 0, 64, 0, 0, 0
db 0, 40, 64, 0, 0, 0, 0, 0
db 0, 0, 0, 0, 0, 0, 88, 0
db 0, 0, 0, 88, 0, 0, 40, 0
db 0, 16, 88, 0, 0, 28, 0, 0
db 0, 16, 88, 0, 16, 64, 0, 76
db 0, 0, 16, 64, 0, 0, 0, 0
db 0, 64, 0, 0, 0, 0, 0, 64
db 0, 0, 0, 0, 16, 64, 0, 0
db 0, 0, 0, 0, 16, 64, 1, 16
db 23, 0, 12, 64, 0, 0, 23, 0
db 0, 64, 0, 12, 23, 0, 0, 64
db 0, 0, 23, 0, 16, 64, 1, 16
db 54, 1, 1, 1, 0, 35, 1, 0
db 35, 38, 0, 39, 40, 1, 1, 1
db 0, 43, 1, 1, 1, 45, 1, 1
db 40, 1, 1, 1, 0, 40, 38, 1
db 1, 1, 0, 0, 36, 1, 1, 1
db 0, 0, 35, 1, 47, 59, 0, 47
db 0, 0, 0, 59, 0, 0, 0, 0
db 0, 59, 0, 0, 0, 0, 0, 59
db 0, 0, 0, 0, 0, 59, 0, 0
db 0, 0, 0, 62, 0, 0, 0, 0
db 0, 62, 0, 0, 0, 0, 0, 64
db 0, 0, 0, 0, 0, 64, 0, 0
db 0, 0, 0, 64, 0, 0, 0, 0
db 0, 0, 0, 66, 0, 0, 0, 0
db 0, 66, 0, 0, 0, 0, 0, 67
db 0, 0, 0, 0, 0, 69, 0, 0
db 0, 0, 0, 69, 0, 0, 0, 0
db 0, 67, 0, 0, 0, 0, 0, 67
db 0, 0, 0, 0, 0, 67, 0, 0
db 0, 0, 0, 71, 1, 1, 1, 1
db 1, 1, 1, 0, 0, 0, 0, 71
db 1, 1, 1, 1, 1, 59, 1, 0
db 0, 0, 0, 0, 0, 0, 64, 1
db 1, 1, 1, 1, 69, 1, 1, 1
db 1, 1, 69, 1, 1, 64, 1, 1
db 1, 1, 0, 64, 0, 0, 0, 0
db 0, 67, 1, 1, 1, 1, 1, 1
db 1, 0, 0, 0, 0, 69, 0, 0
db 95, 1, 1, 1, 0, 0, 93, 1
db 0, 91, 1, 93, 0, 0, 95, 1
db 1, 1, 1, 1, 0, 0, 0, 0
db 127, 64, 32, 16, 2, 0, 0, 0
db 0, 0, 0, 0, 0, 0, 127, 64
db 32, 16, 2, 0, 0, 0, 0, 0
db 93, 1, 0, 91, 1, 0, 93, 1
db 1, 95, 1, 91, 0, 0, 0, 0
db 0, 0, 0, 0, 0, 0, 64, 32
db 2, 0, 0, 0, 0, 0, 0, 0
db 40, 1, 1, 1, 0, 33, 1, 1
db 33, 0, 0, 0, 35, 1, 1, 1
db 0, 0, 43, 1, 1, 1, 1, 42
db 33, 0, 0, 0, 31, 1, 1, 1
db 0, 46, 47, 1, 1, 1, 0, 0
db 0, 0, 0, 0, 0, 71, 74, 1
db 0, 74, 0, 0, 74, 1, 76, 0
db 0, 0, 0, 0, 0, 0, 0, 79
db 0, 0, 79, 76, 0, 0, 79, 0
db 76, 81, 0, 76, 83, 1, 0, 81
db 0, 0, 79, 1, 76, 0, 0, 0
db 0, 0, 0, 0, 64, 32, 2, 0
db 64, 0, 0, 0, 0, 0, 0, 0
db 0, 0, 0, 0, 52, 1, 1, 1
db 0, 0, 62, 1, 1, 1, 1, 1
db 1, 1, 1, 1, 1, 1, 0, 0
db 67, 0, 0, 0, 0, 0, 0, 0
db 0, 59, 1, 1, 1, 1, 1, 1
db 1, 58, 1, 1, 1, 1, 1, 1
db 1, 1, 1, 1, 1, 0, 0, 0
db 71, 0, 0, 0, 0, 0, 0, 0
db 52, 1, 1, 1, 1, 1, 0, 0
db 47, 1, 1, 1, 0, 0, 0, 0
db 0, 0, 55, 1, 0, 0, 0, 0
db 47, 1, 1, 1, 1, 1, 1, 1
db 0, 40, 1, 1, 1, 1, 71, 0
db 0, 0, 0, 0, 54, 0, 0, 0
db 0, 57, 1, 1, 1, 1, 67, 0
db 0, 0, 0, 0, 0, 52, 0, 0
db 0, 0, 0, 0, 50, 1, 1, 1
db 1, 1, 1, 1, 1, 1, 1, 1
db 0, 0, 0, 67, 0, 0, 0, 0
db 0, 55, 1, 1, 1, 1, 1, 1
db 1, 52, 1, 1, 1, 1, 1, 1
db 1, 0, 0, 0, 0, 0, 0, 0
db 0, 0, 67, 0, 0, 0, 0, 0
db 74, 0, 0, 66, 1, 1, 1, 0
db 1, 1, 1, 0, 0, 67, 1, 1
db 1, 59, 1, 1, 1, 1, 1, 1
db 1, 0, 0, 0, 64, 0, 0, 0
db 0, 0, 0, 0, 0, 64, 1, 1
db 1, 0, 0, 59, 1, 0, 0, 0
db 49, 1, 1, 1, 1, 1, 1, 1
db 0, 0, 0, 69, 1, 1, 1, 0
db 49, 1, 1, 1, 1, 1, 52, 1
db 0, 0, 0, 0, 67, 0, 0, 0
db 0, 62, 0, 0, 0, 0, 57, 1
db 0, 57, 1, 1, 1, 1, 1, 1
db 0, 0, 0, 0, 0, 71, 1, 0
db 0, 0, 0, 0, 0, 0, 67, 0
db 0, 0, 0, 0, 0, 62, 0, 0
db 57, 1, 1, 1, 1, 1, 71, 1
db 1, 1, 1, 67, 1, 1, 1, 1
db 1, 0, 0, 0, 71, 0, 0, 0
db 0, 0, 79, 1, 1, 76, 79, 1
db 76, 0, 0, 81, 0, 0, 83, 1
db 1, 1, 81, 1, 79, 76, 1, 74
db 0, 0, 0, 0, 0, 0, 0, 86
db 0, 0, 86, 1, 88, 1, 91, 0
db 0, 0, 64, 32, 2, 0, 0, 0
db 2, 0, 64, 32, 2, 0, 0, 0
db 0, 0, 0, 52, 0, 0, 52, 0
db 0, 52, 0, 0, 0, 0, 0, 28
db 21, 0, 16, 64, 1, 1, 21, 0
db 0, 64, 1, 1, 21, 0, 0, 64
db 1, 1, 21, 0, 16, 64, 1, 12
db 0, 0, 0, 0, 0, 0, 52, 1
db 0, 0, 0, 0, 0, 0, 0, 57
db 1, 1, 1, 1, 1, 1, 1, 0
db 60, 1, 1, 1, 1, 1, 1, 1
db 45, 1, 1, 33, 1, 55, 1, 1
db 57, 1, 1, 60, 0, 0, 60, 24
db 0, 59, 33, 1, 57, 1, 1, 1
db 78, 1, 79, 78, 1, 79, 81, 1
db 1, 79, 0, 78, 0, 0, 79, 0
db 0, 0, 0, 83, 0, 0, 81, 1
db 79, 76, 1, 74, 79, 1, 76, 0
db 0, 79, 0, 0, 81, 0, 0, 78
db 2, 0, 0, 0, 0, 0, 32, 16
db 0, 0, 0, 0, 0, 0, 0, 64
db 48, 32, 16, 2, 0, 0, 0, 0
db 72, 1, 1, 1, 1, 1, 1, 1
db 71, 1, 1, 1, 1, 1, 1, 1
db 76, 1, 1, 1, 1, 1, 1, 1
db 79, 1, 1, 1, 1, 1, 1, 1
db 0, 0, 0, 0, 0, 0, 0, 55
db 62, 1, 1, 1, 1, 1, 1, 1
db 40, 1, 1, 28, 1, 50, 1, 1
db 52, 1, 1, 67, 0, 0, 67, 31
db 0, 54, 28, 1, 52, 1, 1, 1
db 0, 0, 0, 0, 0, 0, 52, 0
db 0, 0, 52, 0, 0, 0, 0, 0
db 0, 79, 0, 0, 81, 1, 1, 74
db 1, 0, 0, 0, 0, 74, 1, 76
db 77, 1, 77, 0, 0, 77, 0, 0
db 79, 1, 1, 76, 1, 0, 74, 0
db 0, 72, 1, 1, 74, 0, 0, 0
db 43, 1, 1, 1, 0, 43, 55, 1
db 1, 1, 0, 0, 47, 1, 59, 0
db 0, 59, 0, 0, 59, 47, 1, 1
db 50, 1, 1, 1, 0, 62, 1, 1
db 1, 50, 1, 1, 45, 1, 1, 1
db 1, 45, 57, 1, 1, 1, 1, 1
db 55, 1, 1, 1, 1, 1, 0, 0
db 43, 55, 1, 0, 54, 1, 1, 1
db 50, 1, 1, 1, 1, 1, 1, 1
db 1, 1, 0, 0, 57, 1, 1, 1
db 1, 1, 0, 0, 45, 57, 1, 0
db 59, 1, 1, 1, 1, 55, 0, 0
db 0, 59, 1, 0, 0, 50, 1, 1
db 1, 1, 0, 0, 60, 1, 1, 1
db 1, 57, 0, 0, 0, 60, 1, 0
db 62, 1, 1, 1, 1, 59, 0, 0
db 0, 62, 1, 0, 0, 0, 0, 0
db 65, 1, 1, 1, 1, 1, 1, 1
db 1, 1, 0, 0, 64, 1, 1, 1
db 1, 60, 0, 0, 0, 64, 1, 0
db 0, 71, 1, 1, 1, 1, 1, 0
db 57, 1, 1, 1, 1, 1, 1, 1
db 1, 1, 0, 0, 0, 0, 0, 0
db 0, 64, 0, 0, 0, 67, 1, 0
db 0, 0, 0, 0, 71, 1, 1, 1
db 69, 1, 1, 1, 1, 1, 1, 1
db 0, 0, 0, 0, 69, 1, 1, 1
db 74, 1, 1, 1, 1, 1, 1, 1
db 0, 0, 0, 0, 74, 1, 1, 1
db 0, 0, 0, 0, 72, 1, 1, 1
db 0, 0, 0, 0, 78, 1, 1, 1
db 77, 1, 1, 1, 1, 1, 1, 1
db 0, 0, 0, 0, 76, 1, 1, 1
db 71, 1, 1, 74, 1, 1, 81, 1
db 1, 79, 1, 1, 1, 0, 0, 0
db 0, 0, 0, 0, 0, 74, 1, 76
db 2, 0, 0, 0, 0, 0, 64, 32
db 64, 48, 32, 16, 2, 0, 0, 0
db 75, 1, 1, 1, 1, 1, 1, 1
db 41, 1, 1, 1, 1, 1, 1, 1
db 0, 48, 1, 1, 1, 1, 1, 1
db 0, 0, 63, 1, 1, 1, 1, 1
db 0, 0, 0, 67, 1, 1, 1, 1
db 1, 1, 1, 0, 0, 0, 0, 0
db 73, 1, 1, 1, 1, 1, 1, 1
db 83, 1, 1, 1, 1, 1, 1, 1
db 82, 1, 1, 1, 1, 1, 1, 1
db 81, 1, 1, 1, 1, 1, 1, 1
db 74, 1, 1, 1, 1, 1, 0, 0
db 78, 1, 1, 1, 1, 1, 0, 0
db 0, 0, 0, 0, 79, 1, 1, 1
db 81, 1, 1, 1, 1, 1, 0, 0
db 35, 1, 1, 1, 1, 1, 1, 1

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
Instrument0List		db	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 23, 24, 25, 23, 24, 25, 36, 37, 38, 23, 24, 25, 67, 68, 47, 69, 70, 0, 77, 0, 78, 79, 47, 0, 86, 0, 87, 88, 88, 89, 90, 91, 11, 92, 93, 94, 23, 24, 25, 23, 24, 25, 36, 37, 38, 23, 24, 25, 23, 24, 25, 23, 24, 25, 36, 37, 38, 23, 24, 25, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 121, 70, 0, 158, 159, 0, 160, 161, 162, 158, 159, 0, 160, 161, 162, 158, 159, 0, 160, 161, 162, 191, 0, 0, 67, 68, 47, 69, 70, 0, 77, 0, 78, 79, 47, 0, 86, 0, 87, 88, 88, 89, 90, 91, 11, 92, 93, 94, 23, 24, 25, 23, 24, 25, 36, 37, 38, 23, 24, 25, 0, 0, 0;
Instrument1List		db	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26, 27, 28, 29, 11, 28, 39, 40, 41, 42, 11, 28, 71, 0, 72, 73, 74, 0, 80, 0, 81, 0, 0, 0, 95, 96, 0, 97, 72, 89, 98, 98, 90, 99, 47, 100, 26, 27, 28, 29, 11, 28, 39, 40, 41, 42, 11, 28, 26, 27, 28, 29, 11, 28, 39, 40, 41, 42, 11, 28, 122, 123, 0, 122, 123, 0, 140, 123, 0, 140, 123, 0, 122, 123, 0, 122, 123, 0, 140, 123, 0, 140, 123, 0, 122, 123, 0, 122, 123, 0, 140, 123, 0, 140, 123, 0, 122, 123, 0, 122, 123, 0, 140, 123, 0, 140, 123, 0, 122, 123, 0, 122, 123, 0, 140, 123, 0, 140, 123, 0, 122, 123, 0, 122, 123, 0, 163, 164, 89, 141, 165, 166, 163, 164, 89, 141, 165, 166, 163, 164, 89, 141, 165, 166, 192, 89, 0, 71, 0, 72, 73, 74, 0, 80, 0, 81, 0, 0, 0, 95, 96, 0, 97, 72, 89, 98, 98, 90, 99, 47, 100, 26, 27, 28, 29, 11, 28, 39, 40, 41, 42, 11, 28, 0, 0, 0;
Instrument2List		db	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 31, 32, 33, 34, 35, 0, 43, 44, 33, 34, 35, 75, 0, 0, 76, 0, 0, 82, 0, 83, 0, 84, 85, 0, 101, 0, 102, 89, 0, 103, 104, 105, 106, 107, 108, 30, 31, 32, 33, 34, 35, 0, 43, 44, 33, 34, 35, 30, 31, 32, 33, 34, 35, 0, 43, 44, 33, 34, 35, 0, 124, 0, 0, 124, 0, 0, 141, 0, 0, 141, 0, 0, 124, 0, 0, 124, 0, 0, 141, 0, 0, 141, 0, 0, 124, 0, 0, 124, 0, 0, 141, 0, 0, 141, 0, 0, 124, 0, 0, 124, 0, 0, 141, 0, 0, 141, 0, 0, 124, 0, 0, 124, 0, 0, 141, 0, 0, 141, 0, 0, 124, 0, 0, 124, 0, 167, 168, 0, 169, 170, 171, 167, 168, 0, 169, 170, 171, 167, 168, 0, 169, 170, 171, 193, 174, 0, 75, 0, 0, 76, 0, 0, 82, 0, 83, 0, 84, 85, 0, 101, 0, 102, 89, 0, 103, 104, 105, 106, 107, 108, 30, 31, 32, 33, 34, 35, 0, 43, 44, 33, 34, 35, 0, 0, 0;
Instrument3List		db	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 0, 43, 89, 105, 172, 0, 173, 174, 175, 105, 172, 0, 173, 174, 175, 105, 172, 0, 173, 174, 175, 194, 195, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0;
Instrument4List		db	0, 0, 0, 54, 0, 0, 0, 66, 0, 54, 0, 0, 0, 66, 0, 48, 49, 50, 53, 54, 0, 48, 49, 50, 53, 54, 0, 54, 0, 0, 0, 66, 0, 54, 0, 0, 0, 66, 0, 0, 0, 0, 114, 53, 115, 0, 0, 0, 0, 0, 0, 48, 49, 50, 53, 54, 0, 48, 49, 50, 53, 54, 0, 48, 49, 50, 53, 54, 0, 48, 49, 50, 53, 54, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 133, 54, 0, 0, 0, 134, 135, 0, 0, 0, 0, 0, 133, 54, 0, 0, 0, 134, 135, 0, 0, 0, 0, 0, 133, 54, 0, 0, 0, 134, 135, 0, 0, 0, 0, 0, 133, 54, 0, 0, 0, 66, 0, 0, 0, 0, 50, 0, 188, 54, 0, 0, 50, 0, 188, 54, 0, 0, 50, 0, 189, 0, 0, 54, 0, 0, 0, 66, 0, 54, 0, 0, 0, 66, 0, 0, 0, 0, 114, 53, 115, 0, 0, 0, 0, 0, 0, 48, 49, 50, 53, 54, 0, 48, 49, 50, 53, 54, 0, 0, 0, 0;
Instrument5List		db	0, 0, 0, 60, 61, 62, 63, 64, 65, 60, 61, 62, 63, 64, 65, 45, 46, 47, 51, 52, 0, 45, 46, 47, 51, 52, 0, 60, 61, 62, 63, 64, 65, 60, 61, 62, 63, 64, 65, 0, 0, 0, 109, 110, 111, 0, 0, 0, 0, 112, 113, 45, 46, 47, 51, 52, 0, 45, 46, 47, 51, 52, 0, 45, 46, 47, 51, 52, 0, 45, 46, 47, 51, 52, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 129, 0, 130, 131, 132, 85, 123, 0, 0, 0, 0, 128, 129, 0, 130, 131, 132, 85, 123, 0, 0, 0, 0, 128, 129, 0, 130, 131, 132, 85, 123, 0, 0, 0, 0, 128, 129, 0, 130, 131, 147, 85, 85, 148, 149, 150, 151, 185, 186, 187, 149, 150, 151, 185, 186, 187, 149, 150, 151, 139, 85, 0, 60, 61, 62, 63, 64, 65, 60, 61, 62, 63, 64, 65, 0, 0, 0, 109, 110, 111, 0, 0, 0, 0, 112, 113, 45, 46, 47, 51, 52, 0, 45, 46, 47, 51, 52, 0, 0, 0, 0;
Instrument6List		db	1, 4, 5, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 0, 0, 0, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 67, 116, 117, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 0, 0, 0, 1, 2, 3, 1, 2, 3, 1, 2, 3, 0, 0, 0, 1, 2, 3, 1, 2, 3, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 4, 5, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 0, 0, 0, 1, 4, 5, 0, 0, 0, 0, 0, 0;
Instrument7List		db	0, 0, 0, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 9, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 9, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 145, 0, 146, 145, 0, 146, 145, 0, 146, 145, 0, 146, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 145, 0, 146, 145, 0, 146, 145, 0, 146, 145, 0, 146, 145, 0, 146, 145, 0, 146, 145, 0, 146, 145, 0, 146, 145, 0, 146, 145, 0, 146, 145, 0, 146, 145, 0, 146, 0, 0, 0, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 8, 6, 7, 9, 6, 7, 8, 6, 7, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0;
Instrument8List		db	0, 0, 0, 55, 56, 57, 55, 58, 59, 55, 56, 57, 55, 58, 59, 17, 18, 19, 20, 21, 22, 17, 18, 19, 20, 21, 22, 55, 56, 57, 55, 58, 59, 55, 56, 57, 55, 58, 59, 55, 56, 57, 55, 58, 59, 55, 56, 57, 55, 58, 59, 17, 18, 19, 20, 21, 22, 17, 18, 19, 20, 21, 22, 17, 18, 19, 20, 21, 22, 17, 18, 19, 20, 21, 22, 125, 126, 127, 125, 126, 127, 142, 143, 144, 142, 143, 144, 125, 126, 127, 125, 126, 127, 142, 143, 144, 142, 143, 144, 125, 126, 127, 125, 126, 127, 142, 143, 144, 142, 143, 144, 125, 126, 127, 125, 126, 127, 142, 143, 144, 142, 143, 144, 125, 126, 127, 125, 126, 127, 142, 143, 144, 142, 143, 144, 125, 126, 127, 125, 126, 127, 152, 153, 154, 155, 156, 157, 152, 153, 154, 155, 156, 157, 152, 153, 154, 155, 156, 157, 191, 47, 0, 55, 56, 57, 55, 58, 59, 55, 56, 57, 55, 58, 59, 55, 56, 57, 55, 58, 59, 55, 56, 57, 55, 58, 59, 17, 18, 19, 20, 21, 22, 204, 85, 0, 0, 0, 0, 0, 0, 0;
Instrument9List		db	14, 15, 16, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 118, 119, 120, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 10, 11, 12, 10, 11, 13, 14, 15, 16, 0, 0, 0, 0, 0, 0;
Instrument10List		db	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 136, 85, 85, 85, 85, 0, 137, 85, 85, 85, 85, 0, 136, 85, 85, 85, 85, 0, 137, 85, 85, 85, 85, 0, 136, 85, 85, 85, 85, 0, 137, 85, 85, 85, 85, 0, 136, 85, 85, 85, 85, 0, 137, 176, 47, 177, 178, 47, 137, 176, 47, 177, 178, 47, 137, 176, 47, 177, 178, 47, 190, 174, 0, 138, 47, 0, 138, 47, 0, 196, 47, 0, 137, 47, 0, 138, 47, 0, 196, 47, 0, 197, 47, 0, 177, 47, 0, 200, 184, 85, 85, 47, 0, 200, 184, 85, 85, 47, 0, 0, 0, 0;
Instrument11List		db	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 138, 85, 85, 85, 85, 0, 138, 85, 85, 85, 85, 0, 138, 85, 85, 85, 85, 0, 138, 85, 85, 85, 85, 0, 138, 85, 85, 85, 85, 0, 138, 85, 85, 85, 85, 0, 138, 85, 85, 85, 85, 0, 179, 180, 47, 179, 181, 47, 179, 180, 47, 179, 181, 47, 179, 180, 47, 179, 181, 47, 136, 174, 0, 139, 47, 0, 139, 47, 0, 138, 47, 0, 138, 47, 0, 139, 47, 0, 138, 47, 0, 179, 47, 0, 196, 47, 0, 201, 202, 174, 203, 202, 174, 201, 202, 174, 203, 202, 174, 0, 0, 0;
Instrument12List		db	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 139, 85, 85, 85, 85, 0, 139, 85, 85, 85, 85, 0, 139, 85, 85, 85, 85, 0, 139, 85, 85, 85, 85, 0, 139, 85, 85, 85, 85, 0, 139, 85, 85, 85, 85, 0, 139, 85, 85, 85, 85, 0, 139, 182, 47, 183, 184, 47, 139, 182, 47, 183, 184, 47, 139, 182, 47, 183, 184, 47, 139, 174, 0, 197, 47, 0, 198, 47, 0, 199, 47, 0, 139, 47, 0, 197, 47, 0, 199, 47, 0, 139, 47, 0, 139, 47, 0, 197, 85, 85, 70, 0, 0, 197, 85, 85, 70, 0, 0, 0, 0, 0;
Instrument13List		db	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 129, 0, 130, 131, 132, 85, 123, 0, 0, 0, 0, 128, 129, 0, 130, 131, 132, 85, 123, 0, 0, 0, 0, 128, 129, 0, 130, 131, 132, 85, 123, 0, 0, 0, 0, 128, 129, 0, 130, 131, 147, 85, 85, 148, 149, 150, 151, 185, 186, 187, 149, 150, 151, 185, 186, 187, 149, 150, 151, 139, 85, 0, 60, 61, 62, 63, 64, 65, 60, 61, 62, 63, 64, 65, 0, 0, 0, 109, 110, 111, 0, 0, 0, 0, 112, 113, 45, 46, 47, 51, 52, 0, 45, 46, 47, 51, 52, 0, 0, 0, 0;

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
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_PAN_ID
	db GO4K_DLL_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument1)
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_PAN_ID
	db GO4K_DLL_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument2)
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_PAN_ID
	db GO4K_DLL_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument3)
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_PAN_ID
	db GO4K_DLL_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument4)
	db GO4K_FOP_ID
	db GO4K_FSTG_ID
	db GO4K_FSTG_ID
	db GO4K_FOP_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument5)
	db GO4K_ENV_ID
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_FST_ID
	db GO4K_FOP_ID
	db GO4K_VCO_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_DLL_ID
	db GO4K_PAN_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument6)
	db GO4K_ENV_ID
	db GO4K_FST_ID
	db GO4K_ENV_ID
	db GO4K_DST_ID
	db GO4K_FST_ID
	db GO4K_FOP_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_PAN_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument7)
	db GO4K_ENV_ID
	db GO4K_FST_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_PAN_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument8)
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
GO4K_BEGIN_CMDDEF(Instrument9)
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_PAN_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument10)
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_FST_ID
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
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_DLL_ID
	db GO4K_PAN_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument11)
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_FST_ID
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
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_DLL_ID
	db GO4K_PAN_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument12)
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_FST_ID
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
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_DLL_ID
	db GO4K_PAN_ID
	db GO4K_OUT_ID
GO4K_END_CMDDEF
GO4K_BEGIN_CMDDEF(Instrument13)
	db GO4K_ENV_ID
	db GO4K_VCO_ID
	db GO4K_DST_ID
	db GO4K_VCO_ID
	db GO4K_FOP_ID
	db GO4K_FST_ID
	db GO4K_FST_ID
	db GO4K_FOP_ID
	db GO4K_VCO_ID
	db GO4K_VCO_ID
	db GO4K_VCF_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_FOP_ID
	db GO4K_VCF_ID
	db GO4K_FOP_ID
	db GO4K_FOP_ID
	db GO4K_DLL_ID
	db GO4K_PAN_ID
	db GO4K_OUT_ID
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
	GO4K_ENV	ATTAC(32),DECAY(80),SUSTAIN(30),RELEASE(40),GAIN(45)
GO4K_VCO	TRANSPOSE(76),DETUNE(64),PHASE(0),GATES(0),COLOR(100),SHAPE(32),GAIN(128),FLAGS(SINE|VCO_STEREO)
GO4K_FOP	OP(FOP_MULP)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCO	TRANSPOSE(1),DETUNE(32),PHASE(0),GATES(85),COLOR(96),SHAPE(64),GAIN(128),FLAGS(SINE)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(30)
GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(32),COUNT(1)
GO4K_OUT	GAIN(60), AUXSEND(100)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument1)
	GO4K_ENV	ATTAC(32),DECAY(80),SUSTAIN(30),RELEASE(40),GAIN(45)
GO4K_VCO	TRANSPOSE(76),DETUNE(64),PHASE(32),GATES(0),COLOR(100),SHAPE(32),GAIN(128),FLAGS(SINE|VCO_STEREO)
GO4K_FOP	OP(FOP_MULP)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCO	TRANSPOSE(1),DETUNE(32),PHASE(0),GATES(85),COLOR(96),SHAPE(64),GAIN(128),FLAGS(SINE)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(60)
GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(32),COUNT(1)
GO4K_OUT	GAIN(60), AUXSEND(100)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument2)
	GO4K_ENV	ATTAC(32),DECAY(80),SUSTAIN(30),RELEASE(40),GAIN(45)
GO4K_VCO	TRANSPOSE(76),DETUNE(64),PHASE(64),GATES(0),COLOR(100),SHAPE(32),GAIN(128),FLAGS(SINE|VCO_STEREO)
GO4K_FOP	OP(FOP_MULP)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCO	TRANSPOSE(1),DETUNE(32),PHASE(0),GATES(85),COLOR(96),SHAPE(64),GAIN(128),FLAGS(SINE)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(90)
GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(32),COUNT(1)
GO4K_OUT	GAIN(60), AUXSEND(100)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument3)
	GO4K_ENV	ATTAC(32),DECAY(80),SUSTAIN(30),RELEASE(40),GAIN(45)
GO4K_VCO	TRANSPOSE(76),DETUNE(64),PHASE(120),GATES(0),COLOR(100),SHAPE(32),GAIN(128),FLAGS(SINE|VCO_STEREO)
GO4K_FOP	OP(FOP_MULP)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCO	TRANSPOSE(1),DETUNE(32),PHASE(0),GATES(85),COLOR(96),SHAPE(64),GAIN(128),FLAGS(SINE)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(70)
GO4K_DLL	PREGAIN(64),DRY(128),FEEDBACK(96),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(32),COUNT(1)
GO4K_OUT	GAIN(60), AUXSEND(100)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument4)
	GO4K_FOP	OP(FOP_LOADNOTE)
GO4K_FSTG	AMOUNT(0),DEST((5*go4k_instrument.size*MAX_VOICES/4)+(6*MAX_UNIT_SLOTS+2)+(go4k_instrument.workspace/4)+FST_SET)
GO4K_FSTG	AMOUNT(0),DEST((13*go4k_instrument.size*MAX_VOICES/4)+(8*MAX_UNIT_SLOTS+2)+(go4k_instrument.workspace/4)+FST_SET)
GO4K_FOP	OP(FOP_POP)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument5)
	GO4K_ENV	ATTAC(56),DECAY(80),SUSTAIN(90),RELEASE(32),GAIN(15)
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
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument6)
	GO4K_ENV	ATTAC(0),DECAY(64),SUSTAIN(96),RELEASE(64),GAIN(120)
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
GO4K_OUT	GAIN(18), AUXSEND(1)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument7)
	GO4K_ENV	ATTAC(0),DECAY(76),SUSTAIN(0),RELEASE(0),GAIN(56)
GO4K_FST	AMOUNT(128),DEST(0*MAX_UNIT_SLOTS+2+FST_SET)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(50),FLAGS(NOISE)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCF	FREQUENCY(80),RESONANCE(128),VCFTYPE(LOWPASS)
GO4K_FOP	OP(FOP_LOADNOTE)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(80)
GO4K_OUT	GAIN(11), AUXSEND(2)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument8)
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
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument9)
	GO4K_ENV	ATTAC(0),DECAY(64),SUSTAIN(15),RELEASE(32),GAIN(110)
GO4K_VCO	TRANSPOSE(64),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(128),FLAGS(NOISE)
GO4K_FOP	OP(FOP_MULP)
GO4K_VCF	FREQUENCY(128),RESONANCE(128),VCFTYPE(BANDPASS)
GO4K_FOP	OP(FOP_LOADNOTE)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(56)
GO4K_OUT	GAIN(60), AUXSEND(0)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument10)
	GO4K_ENV        ATTAC(64),DECAY(128),SUSTAIN(100),RELEASE(64),GAIN(12)
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
GO4K_PAN        PANNING(30)
GO4K_OUT        GAIN(20), AUXSEND(32)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument11)
	GO4K_ENV        ATTAC(64),DECAY(128),SUSTAIN(100),RELEASE(64),GAIN(12)
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
GO4K_PAN        PANNING(60)
GO4K_OUT        GAIN(20), AUXSEND(32)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument12)
	GO4K_ENV        ATTAC(64),DECAY(128),SUSTAIN(100),RELEASE(64),GAIN(12)
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
GO4K_PAN        PANNING(100)
GO4K_OUT        GAIN(20), AUXSEND(32)
GO4K_END_PARAMDEF
GO4K_BEGIN_PARAMDEF(Instrument13)
	GO4K_ENV        ATTAC(48),DECAY(80),SUSTAIN(64),RELEASE(64),GAIN(40)
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
GO4K_OUT        GAIN(65), AUXSEND(80)
GO4K_END_PARAMDEF

;//	global parameters
GO4K_BEGIN_PARAMDEF(Global)
	GO4K_ACC	ACCTYPE(AUX)
GO4K_DLL	PREGAIN(55),DRY(70),FEEDBACK(100),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(0),COUNT(8)
GO4K_FOP	OP(FOP_XCH)
GO4K_DLL	PREGAIN(55),DRY(70),FEEDBACK(100),DAMP(64),FREQUENCY(0),DEPTH(0),DELAY(8),COUNT(8)
GO4K_FOP	OP(FOP_XCH)
GO4K_ACC	ACCTYPE(OUTPUT)
GO4K_FOP	OP(FOP_ADDP2)
GO4K_OUT	GAIN(128), AUXSEND(0)
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
