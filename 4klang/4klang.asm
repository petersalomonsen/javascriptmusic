bits	32

%define WRK	ebp				; // alias for unit workspace
%define	VAL esi				; // alias for unit values (transformed/untransformed)
%define COM ebx				; // alias for instrument opcodes

%include "4klang.inc"

;// conditional defines

%ifdef GO4K_USE_VCO_SHAPE
	%define INCLUDE_WAVESHAPER
%endif
%ifdef GO4K_USE_DST
	%define INCLUDE_WAVESHAPER
%endif

%ifdef GO4K_USE_VCO_MOD_PM	
	%define PHASE_RENORMALIZE
%endif
%ifdef GO4K_USE_VCO_PHASE_OFFSET
	%define PHASE_RENORMALIZE
%endif

%ifdef GO4K_USE_ENVELOPE_RECORDINGS
	%define GO4K_USE_BUFFER_RECORDINGS
%endif
%ifdef GO4K_USE_NOTE_RECORDINGS
	%define GO4K_USE_BUFFER_RECORDINGS
%endif

; //========================================================================================
; //	.bss section
; //========================================================================================
%ifdef USE_SECTIONS
section		.g4kbss1	bss		align=1
%else
section .bss
%endif

; // the one and only synth object
%if MAX_VOICES > 1
go4k_voiceindex 		resd	16
%endif
go4k_transformed_values	resd	16
go4k_synth_wrk			resb	go4k_synth.size
global _go4k_delay_buffer_ofs
_go4k_delay_buffer_ofs	resd	1
global _go4k_delay_buffer		
_go4k_delay_buffer		resd	16*16*go4kDLL_wrk.size

%ifdef AUTHORING
global __4klang_current_tick
__4klang_current_tick	resd	0
%endif

%ifdef GO4K_USE_ENVELOPE_RECORDINGS
global __4klang_envelope_buffer
__4klang_envelope_buffer	resd	((MAX_SAMPLES)/8) ; // samples every 256 samples and stores 16*2 = 32 values
%endif
%ifdef GO4K_USE_NOTE_RECORDINGS
global __4klang_note_buffer
__4klang_note_buffer		resd	((MAX_SAMPLES)/8) ; // samples every 256 samples and stores 16*2 = 32 values
%endif

; //========================================================================================
; //	.g4kdat section (initialized data for go4k)
; //========================================================================================
%ifdef USE_SECTIONS
section		.g4kdat1	data	align=1
%else
section .data
%endif

; // some synth constants
go4k_synth_commands		dd	0
						dd	_go4kENV_func@0
						dd	_go4kVCO_func@0					
						dd	_go4kVCF_func@0
						dd	_go4kDST_func@0
						dd	_go4kDLL_func@0
						dd	_go4kFOP_func@0
						dd	_go4kFST_func@0
						dd	_go4kPAN_func@0
						dd	_go4kOUT_func@0
						dd	_go4kACC_func@0		
						dd	_go4kFLD_func@0
%ifdef	GO4K_USE_FSTG						
						dd	_go4kFSTG_func@0
%endif						

%ifdef USE_SECTIONS						
section		.g4kdat2	data	align=1
%else
section .data
%endif

%ifdef GO4K_USE_16BIT_OUTPUT
c_32767					dd		32767.0
%endif
c_i128					dd		0.0078125
c_RandDiv				dd		65536*32768
c_0_5					dd		0.5
%ifdef GO4K_USE_VCO_GATE
c_16					dd		16.0
%endif
%ifdef GO4K_USE_DLL_CHORUS
DLL_DEPTH				dd		1024.0
%endif
%ifdef GO4K_USE_DLL_DC_FILTER
c_dc_const				dd		0.99609375		; R = 1 - (pi*2 * frequency /samplerate) 
%else
	%ifdef GO4K_USE_VCO_GATE
c_dc_const				dd		0.99609375		; R = 1 - (pi*2 * frequency /samplerate) 
	%endif
%endif
global _RandSeed
_RandSeed				dd		1
c_24					dd		24
c_i12					dd		0x3DAAAAAA
FREQ_NORMALIZE			dd		0.000092696138	; // 220.0/(2^(69/12)) / 44100.0
global _LFO_NORMALIZE
_LFO_NORMALIZE			dd		DEF_LFO_NORMALIZE
%ifdef GO4K_USE_GROOVE_PATTERN
go4k_groove_pattern		dw		0011100111001110b
%endif

; //========================================================================================
; //	.crtemui section (emulates crt functions)
; //========================================================================================
%ifdef USE_SECTIONS
section		.crtemui	code	align=1
%else
section .text
%endif

export_func	FloatRandomNumber@0
	push	eax
	imul    eax,dword [_RandSeed],16007
	mov     dword [_RandSeed], eax 
	fild	dword [_RandSeed]
	fidiv	dword [c_RandDiv]
	pop		eax
	ret
	
; //========================================================================================
; //	.g4kcod* sections (code for go4k)
; //========================================================================================

%ifdef INCLUDE_WAVESHAPER

%ifdef USE_SECTIONS
section		.g4kcod2	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	Waveshaper function
; //----------------------------------------------------------------------------------------
; //	Input :		st0		:	shaping coeff
; //				st1		:	input
; //	Output:		st0		:	result
; //----------------------------------------------------------------------------------------
	
go4kWaveshaper:
%ifdef GO4K_USE_WAVESHAPER_CLIP
	fxch
	fld1									; //	1		val
	fucomi	st1								; //	1		val
	jbe		short go4kWaveshaper_clip
	fchs									; //	-1		val
	fucomi	st1								; //	-1		val
	fcmovb	st0, st1						; //	val		-1		(if val > -1)
go4kWaveshaper_clip:
	fstp	st1								; //	newval
	fxch
%endif	
	fsub	dword [c_0_5]
	fadd	st0
	fst		dword [esp-4]					; // amnt	in
	fadd	st0								; // 2*amnt	in
	fld1									; // 1		2*amnt	in
	fsub	dword [esp-4]					; // 1-amnt 2*amnt	in
	fdivp	st1, st0						; // k		in
	fld		st1								; // sin	k		in
	fabs									; // a(in)	k		in
	fmul	st1								; // k*a(in)	k	in
	fld1	
	faddp	st1, st0						; // 1+k*a(in)	k	in
	fxch	st1								; // k		1+k*a(in)		in
	fld1
	faddp	st1, st0						; // 1+k	1+k*a(in)		in
	fmulp	st2								; // 1+k*a(in)		(1+k)*in
	fdivp	st1, st0						; // out		
	ret

%endif

%ifdef USE_SECTIONS
section		.g4kcod3	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	unit values preparation/transform
; //----------------------------------------------------------------------------------------
go4kTransformValues:
	push	ecx
	xor		ecx, ecx
	xor		eax, eax
	mov		edx, go4k_transformed_values
go4kTransformValues_loop:	
	lodsb	
	push	eax
	fild	dword [esp]
	fmul	dword [c_i128]
	fstp	dword [edx+ecx*4]
	pop		eax
	inc		ecx
	cmp		ecx, dword [esp+8]
	jl		go4kTransformValues_loop	
	pop		ecx
	ret		4

%ifdef USE_SECTIONS	
section		.g4kcod4	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	Envelope param mapping
; //----------------------------------------------------------------------------------------
go4kENVMap:
	fld		dword [edx+eax*4]
%ifdef GO4K_USE_ENV_MOD_ADR	
	fadd	dword [WRK+go4kENV_wrk.am+eax*4]
%endif	
	fimul	dword [c_24]
	fchs
; //----------------------------------------------------------------------------------------
; //	Power function (2^x)
; //----------------------------------------------------------------------------------------
; //	Input :		st0		:	base
; //				st1		:	exponent
; //	Output:		st0		:	result
; //----------------------------------------------------------------------------------------
export_func	Power@0	; // base				exp	
	fld1
	fadd	st0	
	fyl2x				; // log2_base
	fld1				; // 1					log2_base
	fld		st1			; // log2_base			1					log2_base
	fprem				; // (frac)log2_base	1					log2_base
	f2xm1				; // 2 ^ '' -	1		1					log2_base
	faddp	st1, st0	; // 2 ^ ''			(int)log2_base
	fscale
	fstp	st1
	ret
	
%ifdef USE_SECTIONS
section		.g4kcoda	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	ENV Tick
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		
; // DIRTY	:		eax
; //----------------------------------------------------------------------------------------
export_func	go4kENV_func@0
	push	5
	call	go4kTransformValues
%ifdef GO4K_USE_ENV_CHECK
; check if current note still active
	mov		eax, dword [ecx-4]
	test	eax, eax
	jne		go4kENV_func_do
	fldz
	ret
%endif
go4kENV_func_do:
	mov		eax, dword [ecx-8]					; // is the instrument in release mode (note off)?
	test	eax, eax
	je		go4kENV_func_process
	mov		dword [WRK+go4kENV_wrk.state], ENV_STATE_RELEASE
go4kENV_func_process:	
	mov		eax, dword [WRK+go4kENV_wrk.state]
	fld		dword [WRK+go4kENV_wrk.level]		; //	val		-
; // check for sustain state	
	cmp		al, ENV_STATE_SUSTAIN
	je		short go4kENV_func_leave2
go4kENV_func_attac:
	cmp		al, ENV_STATE_ATTAC
	jne		short go4kENV_func_decay
	call	go4kENVMap						; //	newval
	faddp	st1, st0
; // check for end of attac
	fld1									; //	1		newval
	fucomi	st1								; //	1		newval
	fcmovnb	st0, st1						; //	newval	1		(if newval < 1)
	jbe		short go4kENV_func_statechange
go4kENV_func_decay:
	cmp		al, ENV_STATE_DECAY
	jne		short go4kENV_func_release		
	call	go4kENVMap						; //	newval
	fsubp	st1, st0
; // check for end of decay
	fld		dword [edx+go4kENV_val.sustain]	; //	sustain	newval
	fucomi	st1								; //	sustain newval
	fcmovb	st0, st1						; //	newval	sustain	(if newval > sustain)
	jnc		short go4kENV_func_statechange
go4kENV_func_release:
; // release state?
	cmp		al, ENV_STATE_RELEASE
	jne		short go4kENV_func_leave
	call	go4kENVMap						; //	newval
	fsubp	st1, st0
; // check for end of release
	fldz									; //	0		newval
	fucomi	st1								; //	0		newval
	fcmovb	st0, st1						; //	newval	0	(if newval > 0)
	jc		short go4kENV_func_leave
go4kENV_func_statechange:					; //	newval
	inc		dword [WRK+go4kENV_wrk.state]
go4kENV_func_leave:						; //	newval	bla
	fstp	st1	
; // store new env value
	fst		dword [WRK+go4kENV_wrk.level]
go4kENV_func_leave2:	
; // mul by gain
%ifdef GO4K_USE_ENV_MOD_GM
	fld		dword [edx+go4kENV_val.gain]
	fadd	dword [WRK+go4kENV_wrk.gm]
	fmulp	st1, st0
%else
	fmul	dword [edx+go4kENV_val.gain]
%endif
	ret


; //----------------------------------------------------------------------------------------
; //	VCO Tick
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		
; // DIRTY	:		eax
; //----------------------------------------------------------------------------------------
%ifdef USE_SECTIONS
section		.g4kcodp	code	align=1
%else
section .text
%endif
go4kVCO_pulse:
	fucomi	st1								; // c		p
	fld1
	jnc		short go4kVCO_func_pulse_up		; // +1		c		p
	fchs									; // -1		c		p
go4kVCO_func_pulse_up:
	fstp	st1								; // +-1	p
	fstp	st1								; // +-1
	ret

%ifdef USE_SECTIONS	
section		.g4kcodt	code	align=1	
%else
section .text
%endif
go4kVCO_trisaw:
	fucomi	st1								; // c		p
	jnc		short go4kVCO_func_trisaw_up
	fld1									; // 1		c		p
	fsubr	st2, st0						; // 1		c		1-p
	fsubrp	st1, st0						; // 1-c	1-p
go4kVCO_func_trisaw_up:
	fdivp	st1, st0						; // tp'/tc	
	fadd	st0								; // 2*''	
	fld1									; // 1		2*''	
	fsubp	st1, st0						; // 2*''-1
	ret

%ifdef USE_SECTIONS	
section		.g4kcods	code	align=1		
%else
section .text
%endif	
go4kVCO_sine:	
	fucomi	st1								; // c		p
	jnc		short go4kVCO_func_sine_do
	fstp	st1
	fsub	st0, st0						; // 0
	ret	
go4kVCO_func_sine_do	
	fdivp	st1, st0						; // p/c
	fldpi									; // pi		p
	fadd	st0								; // 2*pi	p
	fmulp	st1, st0						; // 2*pi*p
	fsin									; // sin(2*pi*p)
	ret	

%ifdef GO4K_USE_VCO_GATE
%ifdef USE_SECTIONS	
section		.g4kcodq	code	align=1		
%else
section .text
%endif	
go4kVCO_gate:	
	fxch									; // p		c
	fstp	st1								; // p		
	fmul	dword [c_16]					; // p'
	push	eax
	push	eax
	fistp	dword [esp]						; // -
	fld1									; // 1
	pop		eax
	and		al, 0xf
	bt		word [VAL-5],ax
	jc		go4kVCO_gate_bit
	fsub	st0, st0						; // 0
go4kVCO_gate_bit:
	fld		dword [WRK+go4kVCO_wrk.cm]		; // f		x
	fsub	st1								; // f-x	x
	fmul	dword [c_dc_const]				; // c(f-x)	x
	faddp	st1, st0						; // x'
	fst		dword [WRK+go4kVCO_wrk.cm]	
	pop		eax
	ret	
%endif

%ifdef USE_SECTIONS	
section		.g4kcodb	code	align=1
%else
section .text
%endif
export_func	go4kVCO_func@0
%ifdef GO4K_USE_VCO_PHASE_OFFSET
	%ifdef GO4K_USE_VCO_SHAPE
		%ifdef GO4K_USE_VCO_GATE
			push 8
		%else
			push 7
		%endif
	%else
		%ifdef GO4K_USE_VCO_GATE
			push 7
		%else
			push 6
		%endif
	%endif
%else
	%ifdef GO4K_USE_VCO_SHAPE
		%ifdef GO4K_USE_VCO_GATE
			push 7
		%else
			push 6
		%endif
	%else
		%ifdef GO4K_USE_VCO_GATE
			push 6
		%else
			push 5
		%endif
	%endif
%endif
	call	go4kTransformValues
%ifdef GO4K_USE_VCO_CHECK
; check if current note still active
	mov		eax, dword [ecx-4]
	test	eax, eax
	jne		go4kVCO_func_do
%ifdef GO4K_USE_VCO_STEREO
	movzx	eax, byte [VAL-1]			; // get flags and check for stereo		
	test	al, byte VCO_STEREO
	jz		short go4kVCO_func_nostereoout	
	fldz
go4kVCO_func_nostereoout:
%endif
	fldz
	ret
go4kVCO_func_do:	
%endif
	movzx	eax, byte [VAL-1]			; // get flags
%ifdef GO4K_USE_VCO_STEREO	
	test	al, byte VCO_STEREO
	jz		short go4kVCO_func_nopswap
	fld		dword [WRK+go4kVCO_wrk.phase]	;// swap left/right phase values for first stereo run
	fld		dword [WRK+go4kVCO_wrk.phase2]
	fstp	dword [WRK+go4kVCO_wrk.phase]
	fstp	dword [WRK+go4kVCO_wrk.phase2]
go4kVCO_func_nopswap:
%endif	
go4kVCO_func_process:
	fld		dword [edx+go4kVCO_val.transpose]
	fsub	dword [c_0_5]
%ifdef GO4K_USE_VCO_MOD_TM
	fadd	dword [WRK+go4kVCO_wrk.tm]	
%endif
	fdiv	dword [c_i128]
	fld		dword [edx+go4kVCO_val.detune]
	fsub	dword [c_0_5]
	fadd	st0
%ifdef GO4K_USE_VCO_STEREO
	test	al, byte VCO_STEREO
	jz		short go4kVCO_func_nodswap
	fchs	;// negate detune for stereo
go4kVCO_func_nodswap:	
%endif	
	faddp	st1
%ifdef GO4K_USE_VCO_MOD_DM	
	fadd	dword [WRK+go4kVCO_wrk.dm]
%endif		
	; // st0 now contains the transpose+detune offset
	test	al, byte LFO
	jnz		go4kVCO_func_skipnote
	fiadd	dword [ecx-4]				; // st0 is note, st1 is t+d offset
go4kVCO_func_skipnote:		
	fmul	dword [c_i12]
	call	_Power@0
	test	al, byte LFO
	jz		short go4kVCO_func_normalize_note
	fmul	dword [_LFO_NORMALIZE]	; // st0 is now frequency for lfo  
	jmp		short go4kVCO_func_normalized
go4kVCO_func_normalize_note:	
	fmul	dword [FREQ_NORMALIZE]	; // st0 is now frequency
go4kVCO_func_normalized:
	fadd	dword [WRK+go4kVCO_wrk.phase]	
%ifdef GO4K_USE_VCO_MOD_FM	
	fadd	dword [WRK+go4kVCO_wrk.fm]
%endif		
	fld1
	fadd	st1, st0
	fxch	
	fprem	
	fstp	st1
	fst		dword [WRK+go4kVCO_wrk.phase]
%ifdef GO4K_USE_VCO_MOD_PM	
	fadd	dword [WRK+go4kVCO_wrk.pm]
%endif
%ifdef GO4K_USE_VCO_PHASE_OFFSET
	fadd	dword [edx+go4kVCO_val.phaseofs]
%endif
%ifdef PHASE_RENORMALIZE	
	fld1
	fadd	st1, st0
	fxch	
	fprem	
	fstp	st1											; // p
%endif	
	fld		dword [edx+go4kVCO_val.color]				; // c		p
%ifdef GO4K_USE_VCO_MOD_CM	
	fadd	dword [WRK+go4kVCO_wrk.cm]					; // c		p
%endif
go4kVCO_func_sine:	
	test	al, byte SINE
	jz		short go4kVCO_func_trisaw
	call	go4kVCO_sine	
go4kVCO_func_trisaw:
	test	al, byte TRISAW
	jz		short go4kVCO_func_pulse	
	call	go4kVCO_trisaw
go4kVCO_func_pulse:
	test	al, byte PULSE
%ifdef GO4K_USE_VCO_GATE	
	jz		short go4kVCO_func_gate
%else
	jz		short go4kVCO_func_noise
%endif	
	call	go4kVCO_pulse
%ifdef GO4K_USE_VCO_GATE	
go4kVCO_func_gate:
	test	al, byte GATE
	jz		short go4kVCO_func_noise
	call	go4kVCO_gate
%endif		
go4kVCO_func_noise:	
	test	al, byte NOISE
	jz		short go4kVCO_func_end
	call	_FloatRandomNumber@0
	fstp	st1
	fstp	st1
go4kVCO_func_end:
%ifdef GO4K_USE_VCO_SHAPE
	fld		dword [edx+go4kVCO_val.shape]
%ifdef GO4K_USE_VCO_MOD_SM	
	fadd	dword [WRK+go4kVCO_wrk.sm]
%endif
	call	go4kWaveshaper	
%endif	
	fld		dword [edx+go4kVCO_val.gain]
%ifdef GO4K_USE_VCO_MOD_GM	
	fadd	dword [WRK+go4kVCO_wrk.gm]
%endif
	fmulp	st1, st0	
	
%ifdef GO4K_USE_VCO_STEREO	
	test	al, byte VCO_STEREO
	jz		short go4kVCO_func_stereodone
	sub		al, byte VCO_STEREO
	fld		dword [WRK+go4kVCO_wrk.phase]	;// swap left/right phase values again for second stereo run
	fld		dword [WRK+go4kVCO_wrk.phase2]
	fstp	dword [WRK+go4kVCO_wrk.phase]
	fstp	dword [WRK+go4kVCO_wrk.phase2]
	jmp		go4kVCO_func_process
go4kVCO_func_stereodone:
%endif		
	ret

%ifdef USE_SECTIONS
section		.g4kcodc	code	align=1
%else
section .text
%endif	
; //----------------------------------------------------------------------------------------
; //	VCF Tick
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		
; // DIRTY	:		eax
; //----------------------------------------------------------------------------------------
export_func	go4kVCF_func@0
	push	3
	call	go4kTransformValues
%ifdef GO4K_USE_VCF_CHECK
; check if current note still active
	mov		eax, dword [ecx-4]
	test	eax, eax
	jne		go4kVCF_func_do
	ret	
go4kVCF_func_do:
%endif
	movzx	eax, byte [VAL-1]				; // get type flag 	
	
	fld		dword [edx+go4kVCF_val.res]		; //	r		in
%ifdef GO4K_USE_VCF_MOD_RM	
	fadd	dword [WRK+go4kVCF_wrk.rm]			
%endif
	fstp	dword [esp-8]
	
	fld		dword [edx+go4kVCF_val.freq]	; //	f		in
%ifdef GO4K_USE_VCF_MOD_FM	
	fadd	dword [WRK+go4kVCF_wrk.fm]
%endif
	fmul	st0, st0						; // square the input so we never get negative and also have a smoother behaviour in the lower frequencies
	fstp	dword [esp-4]					; //	in

%ifdef GO4K_USE_VCF_STEREO	
	test	al, byte STEREO
	jz		short go4kVCF_func_process
	add		WRK, go4kVCF_wrk.low2
go4kVCF_func_stereoloop:					; // switch channels	
	fxch	st1								; //	inr		inl		
%endif

go4kVCF_func_process:
	fld		dword [esp-8]
	fld		dword [esp-4]
	fmul	dword [WRK+go4kVCF_wrk.band]	; //	f*b		r		in
	fadd	dword [WRK+go4kVCF_wrk.low]		; //    l'		r		in
	fst		dword [WRK+go4kVCF_wrk.low]		; //    l'		r		in
	fsubp	st2, st0						; //	r		in-l'
	fmul	dword [WRK+go4kVCF_wrk.band]	; //	r*b		in-l'
	fsubp	st1, st0						; // 	h'
	fst		dword [WRK+go4kVCF_wrk.high]	; //    h'
	fmul	dword [esp-4]					; //    h'*f
	fadd	dword [WRK+go4kVCF_wrk.band]	; //	b'
	fstp	dword [WRK+go4kVCF_wrk.band]
	fldz
go4kVCF_func_low:	
	test	al, byte LOWPASS
	jz		short go4kVCF_func_high
	fadd	dword [WRK+go4kVCF_wrk.low]
go4kVCF_func_high:
%ifdef GO4K_USE_VCF_HIGH
	test	al, byte HIGHPASS
	jz		short go4kVCF_func_band
	fadd	dword [WRK+go4kVCF_wrk.high]
%endif	
go4kVCF_func_band:
%ifdef GO4K_USE_VCF_BAND
	test	al, byte BANDPASS
	jz		short go4kVCF_func_peak
	fadd	dword [WRK+go4kVCF_wrk.band]
%endif
go4kVCF_func_peak:
%ifdef GO4K_USE_VCF_PEAK
	test	al, byte PEAK
	jz		short go4kVCF_func_processdone
	fadd	dword [WRK+go4kVCF_wrk.low]
	fsub	dword [WRK+go4kVCF_wrk.high]
%endif
go4kVCF_func_processdone:
	
%ifdef GO4K_USE_VCF_STEREO		
	test	al, byte STEREO					; // outr	inl
	jz		short go4kVCF_func_end
	sub		al, byte STEREO
	sub		WRK, go4kVCF_wrk.low2
	jmp 	go4kVCF_func_stereoloop
%endif	
	
go4kVCF_func_end:							; // value	-		-		-		-
	ret

%ifdef USE_SECTIONS
section		.g4kcodd	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	DST Tick
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		
; // DIRTY	:		eax
; //----------------------------------------------------------------------------------------
export_func	go4kDST_func@0
%ifdef GO4K_USE_DST
%ifdef GO4K_USE_DST_SH
	%ifdef GO4K_USE_DST_STEREO
		push	3
	%else
		push	2
	%endif
%else
	%ifdef GO4K_USE_DST_STEREO
		push	2
	%else
		push	1
	%endif
%endif
	call	go4kTransformValues
%ifdef GO4K_USE_DST_CHECK
; check if current note still active
	mov		eax, dword [ecx-4]
	test	eax, eax
	jne		go4kDST_func_do
	ret	
go4kDST_func_do:
%endif
	movzx	eax, byte [VAL-1]				; // get type flag
%ifdef	GO4K_USE_DST_SH
	fld		dword [edx+go4kDST_val.snhfreq]	; //	snh		in
%ifdef 	GO4K_USE_DST_MOD_SH	
	fadd	dword [WRK+go4kDST_wrk.sm]		; // 	snh'	in
%endif
	fmul	st0, st0						; // square the input so we never get negative and also have a smoother behaviour in the lower frequencies
	fchs
	fadd	dword [WRK+go4kDST_wrk.snhphase]; // 	snh'	in
	fst		dword [WRK+go4kDST_wrk.snhphase]
	fldz									; //	0		snh'	in
	fucomip	st1								; //	0		snh'	in
	jc		short go4kDST_func_hold			
	fld1									; //	1		snh'	in
	faddp	st1, st0						; //	1+snh'	in
	fstp	dword [WRK+go4kDST_wrk.snhphase]; // 	in
%endif	
; // calc pregain and postgain	
%ifdef GO4K_USE_DST_STEREO
	test	al, byte STEREO					; // outr	inl
	jz		short go4kDST_func_mono
	fxch	st1								; // 	inr		inl
	fld		dword [edx+go4kDST_val.drive]	; // 	drive		inr		inl
%ifdef GO4K_USE_DST_MOD_DM	
	fadd	dword [WRK+go4kDST_wrk.dm]
%endif
	call	go4kWaveshaper					; // 	outr	inl
%ifdef	GO4K_USE_DST_SH		
	fst		dword [WRK+go4kDST_wrk.out2]	; // 	outr	inl
%endif	
	fxch	st1								; // 	inl		outr
go4kDST_func_mono:	
%endif	
	fld		dword [edx+go4kDST_val.drive]	; // 	drive		in
%ifdef GO4K_USE_DST_MOD_DM	
	fadd	dword [WRK+go4kDST_wrk.dm]
%endif
	call	go4kWaveshaper					; // out
%ifdef	GO4K_USE_DST_SH		
	fst		dword [WRK+go4kDST_wrk.out]		; // out'
%endif	
	ret										; // out'
%ifdef	GO4K_USE_DST_SH	
go4kDST_func_hold:	
	fstp	st0								; // in
	fstp	st0
%ifdef GO4K_USE_DST_STEREO
	test	al, byte STEREO					; // outr	inl
	jz		short go4kDST_func_monohold
	fld		dword [WRK+go4kDST_wrk.out2]	; // out2
go4kDST_func_monohold:	
%endif	
	fld		dword [WRK+go4kDST_wrk.out]		; // out
	ret
%endif	

%endif

%ifdef USE_SECTIONS	
section		.g4kcodf	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	DLL Tick
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		
; // DIRTY	:		eax
; //----------------------------------------------------------------------------------------
export_func	go4kDLL_func@0
%ifdef GO4K_USE_DLL
%ifdef GO4K_USE_DLL_CHORUS
	%ifdef GO4K_USE_DLL_DAMP
		push	8
	%else
		push	7
	%endif		
%else
	%ifdef GO4K_USE_DLL_DAMP
		push	6
	%else
		push	5
	%endif		
%endif	
	call	go4kTransformValues
	pushad
	movzx	ebx, byte [VAL-(go4kDLL_val.size-go4kDLL_val.delay)/4]	;// delay length index
%ifdef GO4K_USE_DLL_NOTE_SYNC
	test	ebx, ebx
	jne		go4kDLL_func_process
	fld1
	fild	dword [ecx-4]			; // load note freq
	fmul	dword [c_i12]
	call	_Power@0
	fmul	dword [FREQ_NORMALIZE]	; // normalize
	fdivp	st1, st0				; // invert to get numer of samples
	fistp	word [_go4k_delay_times+ebx*2]	; store current comb size
%endif	
go4kDLL_func_process:
	mov		ecx, eax							;// ecx is delay counter	
%ifdef 	GO4K_USE_DLL_MOD
	mov		edi, WRK							;// edi is modulation workspace
%endif
	mov		WRK, dword [_go4k_delay_buffer_ofs]	;// ebp is current delay
	fld		st0									;// in		in
%ifdef GO4K_USE_DLL_MOD_IM
	fld		dword [edx+go4kDLL_val.dry]			;// dry		in		in
	fadd	dword [edi+go4kDLL_wrk2.im]			;// dry'	in		in
	fmulp	st1, st0							;// out		in
%else	
	fmul	dword [edx+go4kDLL_val.dry]			;// out		in
%endif	
	fxch										;// in		out
%ifdef GO4K_USE_DLL_MOD_PM
	fld		dword [edx+go4kDLL_val.pregain]		;// pg		in		out
	fadd	dword [edi+go4kDLL_wrk2.pm]			;// pg'		in		out
	fmul	st0, st0							;// pg''	in		out
	fmulp	st1, st0							;// in'		out
%else	
	fmul	dword [edx+go4kDLL_val.pregain]		;// in'		out
	fmul	dword [edx+go4kDLL_val.pregain]		;// in'		out
%endif	

%ifdef GO4K_USE_DLL_CHORUS	
;// update saw lfo for chorus/flanger
	fld		dword [edx+go4kDLL_val.freq]		;// f		in'		out
%ifdef GO4K_USE_DLL_MOD_SM
	fadd	dword [edi+go4kDLL_wrk2.sm]			;// f'		in'		out
%endif	
	fmul	st0, st0
	fmul	st0, st0
	fdiv	dword [DLL_DEPTH]
	fadd	dword [WRK+go4kDLL_wrk.phase]		;// p'		in'		out
;// clamp phase to 0,1 (only in editor, since delay can be active quite long)
%ifdef GO4K_USE_DLL_CHORUS_CLAMP
	fld1										;// 1		p'		in'		out
	fadd	st1, st0							;// 1		1+p'	in'		out
	fxch										;// 1+p'	1		in'		out
	fprem										;// p''		1		in'		out
	fstp	st1									;// p''		in'		out
%endif
	fst		dword [WRK+go4kDLL_wrk.phase]
;// get current sine value
	fldpi										; // pi		p		in'		out
	fadd	st0									; // 2*pi	p		in'		out
	fmulp	st1, st0							; // 2*pi*p	in'		out
	fsin										; // sin	in'		out	
	fld1										; // 1		sin		in'		out	
	faddp	st1, st0							; // 1+sin	in'		out		
;// mul with depth and convert to samples	
	fld		dword [edx+go4kDLL_val.depth]		; // d		1+sin	in'		out
%ifdef GO4K_USE_DLL_MOD_AM
	fadd	dword [edi+go4kDLL_wrk2.am]			; // d'		1+sin	in'		out
%endif	
	fmul	st0, st0
	fmul	st0, st0
	fmul	dword [DLL_DEPTH]
	fmulp	st1, st0
	fistp   dword [esp-4]						; // in'	out	
%endif	
	
go4kDLL_func_loop:
	movzx	esi, word [_go4k_delay_times+ebx*2]	; fetch comb size
	mov 	eax, dword [WRK+go4kDLL_wrk.index]	;// eax is current comb index

%ifdef GO4K_USE_DLL_CHORUS	
	;// add lfo offset and wrap buffer
	add		eax, dword [esp-4]
	cmp		eax, esi
	jl		short go4kDLL_func_buffer_nowrap1
	sub		eax, esi
go4kDLL_func_buffer_nowrap1:		
%endif
		
	fld		dword [WRK+eax*4+go4kDLL_wrk.buffer];//	cout		in'			out		

%ifdef GO4K_USE_DLL_CHORUS	
	mov 	eax, dword [WRK+go4kDLL_wrk.index]
%endif	
	
	;// add comb output to current output
	fadd	st2, st0							;//	cout		in'			out'
%ifdef GO4K_USE_DLL_DAMP
	fld1										;//	1			cout		in'			out'		
	fsub 	dword [edx+go4kDLL_val.damp]		;//	1-damp		cout		in'			out'
%ifdef GO4K_USE_DLL_MOD_DM
	fsub	dword [edi+go4kDLL_wrk2.dm]			;//	1-damp'		cout		in'			out'
%endif	
	fmulp	st1, st0							;//	cout*d2		in'			out'		
	fld		dword [edx+go4kDLL_val.damp]		;//	d1   		cout*d2		in'			out'
%ifdef GO4K_USE_DLL_MOD_DM
	fadd	dword [edi+go4kDLL_wrk2.dm]			;//	d1'   		cout*d2		in'			out'
%endif	
	fmul	dword [WRK+go4kDLL_wrk.store]		;//	store*d1	cout*d2		in'			out'		
	faddp	st1, st0							;//	store'		in'			out'	
	fst		dword [WRK+go4kDLL_wrk.store]		;//	store'		in'			out'		
%endif	
%ifdef GO4K_USE_DLL_MOD_FM
	fld		dword [edx+go4kDLL_val.feedback]	;//	fb			cout		in'			out'
	fadd 	dword [edi+go4kDLL_wrk2.fm]			;//	fb'			cout		in'			out'
	fmulp	st1, st0							;//	cout*fb'	in'			out'
%else
	fmul	dword [edx+go4kDLL_val.feedback]	;//	cout*fb		in'			out'
%endif	
%ifdef GO4K_USE_DLL_DC_FILTER		
	fadd	st0, st1							;//	store		in'			out'
	fstp	dword [WRK+eax*4+go4kDLL_wrk.buffer];//	in'			out'
%else	
	fsub	st0, st1							;//	store		in'			out'	
	fstp	dword [WRK+eax*4+go4kDLL_wrk.buffer];//	in'			out'
	fneg		
%endif
	;// wrap comb buffer pos
	inc 	eax
	cmp		eax, esi
	jl		short go4kDLL_func_buffer_nowrap2
%ifdef GO4K_USE_DLL_CHORUS	
	sub		eax, esi
%else
	xor		eax, eax
%endif	
go4kDLL_func_buffer_nowrap2:	
	mov 	dword [WRK+go4kDLL_wrk.index], eax		
	;// increment buffer pointer to next buffer
	inc		ebx									;// go to next delay length index
	add		WRK, go4kDLL_wrk.size				;// go to next delay
	mov		dword [_go4k_delay_buffer_ofs], WRK	;// store next delay offset
	loopne	go4kDLL_func_loop	
	fstp	st0									;//	out'
	;// process a dc filter to prevent heavy offsets in reverb
	;// we're using the dc filter variables from the next delay line here, but doesnt hurt anyway				
%ifdef GO4K_USE_DLL_DC_FILTER
; 	y(n) = x(n) - x(n-1) + R * y(n-1) 
	fld		dword [WRK+go4kDLL_wrk.dcout]		;//	dco			out'
	fmul	dword [c_dc_const]					;//	dcc*dco		out'
	fsub	dword [WRK+go4kDLL_wrk.dcin]		;//	dcc*dco-dci	out'
	fxch										;//	out'		dcc*dco-dci
	fst		dword [WRK+go4kDLL_wrk.dcin]		;//	out'		dcc*dco-dci
	faddp	st1									;//	out'
%ifdef GO4K_USE_UNDENORMALIZE
	fadd	dword [c_0_5]						;// add and sub small offset to prevent denormalization
	fsub	dword [c_0_5]
%endif	
	fst		dword [WRK+go4kDLL_wrk.dcout]
%endif
	popad
	ret
%endif

%ifdef USE_SECTIONS
section		.g4kcodg	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	FOP Tick (various fp stack based operations)
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		
; // DIRTY	:		
; //----------------------------------------------------------------------------------------
export_func	go4kFOP_func@0
	push	1
	call	go4kTransformValues
go4kFOP_func_pop:	
	dec		eax
	jnz		go4kFOP_func_addp	
	fstp	st0
	ret
go4kFOP_func_addp:		
	dec		eax
	jnz		go4kFOP_func_mulp
	faddp	st1, st0
	ret
go4kFOP_func_mulp:		
	dec		eax
	jnz		go4kFOP_func_push
	fmulp	st1, st0
	ret		
go4kFOP_func_push:
	dec		eax
	jnz		go4kFOP_func_xch
	fld		st0
	ret
go4kFOP_func_xch:		
	dec		eax
	jnz		go4kFOP_func_add
	fxch
	ret	
go4kFOP_func_add:		
	dec		eax
	jnz		go4kFOP_func_mul
	fadd	st1
	ret
go4kFOP_func_mul:		
	dec		eax
	jnz		go4kFOP_func_addp2
	fmul	st1
	ret
go4kFOP_func_addp2:
	dec		eax
	jnz		go4kFOP_func_loadnote
	faddp	st2, st0
	faddp	st2, st0
	ret
go4kFOP_func_loadnote:		
	dec		eax
	jnz		go4kFOP_func_mulp2			
	fild	dword [ecx-4]
	fmul	dword [c_i128]
	ret
go4kFOP_func_mulp2:
	fmulp	st2, st0
	fmulp	st2, st0
	ret
	
%ifdef USE_SECTIONS	
section		.g4kcodh	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	FST Tick (stores a value somewhere in the local workspace)
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		
; // DIRTY	:		
; //----------------------------------------------------------------------------------------
export_func	go4kFST_func@0
	push	1
	call	go4kTransformValues
	fld		dword [edx+go4kFST_val.amount]
	fsub	dword [c_0_5]
	fadd	st0
	fmul	st1
	lodsw											
	and		eax, 0x00003fff					; // eax is destination slot
	test	word [VAL-2], FST_ADD
	jz		go4kFST_func_set
	fadd	dword [ecx+eax*4]
go4kFST_func_set:	
	fstp	dword [ecx+eax*4]	
	test	word [VAL-2], FST_POP
	jz		go4kFST_func_done
	fstp	st0
go4kFST_func_done:	
	ret

%ifdef USE_SECTIONS	
section		.g4kcodm	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	FLD Tick (load a value on stack, optionally add a modulation signal beforehand)
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		signal-signal*pan , signal*pan
; // DIRTY	:		
; //----------------------------------------------------------------------------------------	
export_func	go4kFLD_func@0								;// in		main env
%ifdef GO4K_USE_FLD
	push	1
	call	go4kTransformValues
	fld		dword [edx+go4kFLD_val.value]				;// value		in
	fsub	dword [c_0_5]
	fadd	st0
%ifdef GO4K_USE_FLD_MOD_VM
	fadd	dword [WRK+go4kFLD_wrk.vm]					;// value'		in
%endif
%endif	
	ret		
	
%ifdef GO4K_USE_FSTG
%ifdef USE_SECTIONS	
section		.g4kcodi	code	align=1
%else
section .text
%endif	
; //----------------------------------------------------------------------------------------
; //	FSTG Tick (stores a value anywhere in the synth (and in each voice))
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		
; // DIRTY	:		
; //----------------------------------------------------------------------------------------
export_func	go4kFSTG_func@0
	push	1
	call	go4kTransformValues
%ifdef GO4K_USE_FSTG_CHECK
; check if current note still active
	mov		eax, dword [ecx-4]
	test	eax, eax
	jne		go4kFSTG_func_do
	lodsw
	jmp		go4kFSTG_func_testpop
go4kFSTG_func_do:	
%endif
	fld		dword [edx+go4kFST_val.amount]
	fsub	dword [c_0_5]
	fadd	st0
	fmul	st1	
	lodsw											
	and		eax, 0x00003fff					; // eax is destination slot
	test	word [VAL-2], FST_ADD
	jz		go4kFSTG_func_set
	fadd	dword [go4k_synth_wrk+eax*4]
go4kFSTG_func_set:	
%if MAX_VOICES > 1	
	fst		dword [go4k_synth_wrk+eax*4]
	fstp	dword [go4k_synth_wrk+eax*4+go4k_instrument.size]
%else
	fstp	dword [go4k_synth_wrk+eax*4]	
%endif
go4kFSTG_func_testpop:	
	test	word [VAL-2], FST_POP
	jz		go4kFSTG_func_done
	fstp	st0
go4kFSTG_func_done:	
	ret
%endif	

%ifdef USE_SECTIONS	
section		.g4kcodj	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	PAN Tick (multiplies signal with main envelope and converts to stereo)
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		signal-signal*pan , signal*pan
; // DIRTY	:		
; //----------------------------------------------------------------------------------------	
export_func	go4kPAN_func@0								;// in		main env
%ifdef GO4K_USE_PAN
	push	1
	call	go4kTransformValues
	fld		dword [edx+go4kPAN_val.panning]				;// pan		in
%ifdef GO4K_USE_PAN_MOD	
	fadd	dword [WRK+go4kPAN_wrk.pm]					;// pan		in
%endif
	fmul	st1											;// r		in
	fsub	st1, st0									;// r		l
	fxch												;// l		r
%else
	fmul	dword [c_0_5]
	fld		st0
%endif	
	ret

%ifdef USE_SECTIONS	
section		.g4kcodk	code	align=1
%else
section .text
%endif	
; //----------------------------------------------------------------------------------------
; //	OUT Tick ( stores stereo signal pair in temp buffers of the instrument)
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		
; // DIRTY	:		
; //----------------------------------------------------------------------------------------
export_func	go4kOUT_func@0								;// l		r
%ifdef	GO4K_USE_GLOBAL_DLL
	push	2
	call	go4kTransformValues
	pushad
	lea		edi, [ecx+MAX_UNITS*MAX_UNIT_SLOTS*4]
	fld		st1											;//	r		l		r
	fld		st1											;// l		r		l		r
	fld		dword [edx+go4kOUT_val.auxsend]				;// as		l		r		l		r
%ifdef 	GO4K_USE_OUT_MOD_AM
	fadd	dword [WRK+go4kOUT_wrk.am]					;//	am		l		r		l		r
%endif	
	fmulp	st1, st0									;//	l'		r		l		r
	fstp	dword [edi]									;// r		l		r
	scasd
	fld		dword [edx+go4kOUT_val.auxsend]				;// as		r		l		r
%ifdef 	GO4K_USE_OUT_MOD_AM
	fadd	dword [WRK+go4kOUT_wrk.am]					;//	am		r		l		r
%endif	
	fmulp	st1, st0									;//	r'		l		r
	fstp	dword [edi]									;// l		r
	scasd
	fld		dword [edx+go4kOUT_val.gain]				;// g		l		r
%ifdef 	GO4K_USE_OUT_MOD_GM
	fadd	dword [WRK+go4kOUT_wrk.gm]					;//	gm		l		r
%endif	
	fmulp	st1, st0									;//	l'		r
	fstp	dword [edi]									;// r
	scasd
	fld		dword [edx+go4kOUT_val.gain]				;// g		r
%ifdef 	GO4K_USE_OUT_MOD_GM
	fadd	dword [WRK+go4kOUT_wrk.gm]					;//	gm		r
%endif	
	fmulp	st1, st0									;//	r'
	fstp	dword [edi]									;// -
	scasd
	popad
%else
	push	1
	call	go4kTransformValues

	fld		dword [edx+go4kOUT_val.gain]				;// g		l		r
%ifdef 	GO4K_USE_OUT_MOD_GM
	fadd	dword [WRK+go4kOUT_wrk.gm]					;//	gm		l		r
%endif	
	fmulp	st1, st0									;//	l'		r
	fstp	dword [ecx+MAX_UNITS*MAX_UNIT_SLOTS*4+0]							;// r
	fld		dword [edx+go4kOUT_val.gain]				;// g		r
%ifdef 	GO4K_USE_OUT_MOD_GM
	fadd	dword [WRK+go4kOUT_wrk.gm]					;//	gm		r
%endif	
	fmulp	st1, st0									;//	r'
	fstp	dword [ecx+MAX_UNITS*MAX_UNIT_SLOTS*4+4]							;// -
	
%endif		
	ret	

%ifdef USE_SECTIONS	
section		.g4kcodl	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	ACC Tick (stereo signal accumulation for synth commands only -> dont use in instrument commands)
; //----------------------------------------------------------------------------------------
; // IN		:		WRK	= unit workspace
; // IN		:		VAL	= unit values
; // IN		:		ecx	= global workspace
; // OUT	:		
; // DIRTY	:		eax
; //----------------------------------------------------------------------------------------
export_func	go4kACC_func@0
	push	1
	call	go4kTransformValues
	pushad
	mov		edi, go4k_synth_wrk
	add		edi, go4k_instrument.size
	sub		edi, eax					; // eax already contains the accumulation offset from the go4kTransformValues call
	mov		cl, MAX_INSTRUMENTS*MAX_VOICES
	fldz								;// 0
	fldz								;//	0		0
go4kACC_func_loop:	
	fadd	dword [edi-8]				;// l		0
	fxch								;// 0		l
	fadd	dword [edi-4]				;// r		l
	fxch								;// l		r
	add		edi, go4k_instrument.size
	dec		cl
	jnz		go4kACC_func_loop
	popad
	ret
	
%ifdef USE_SECTIONS
section		.g4kcodw	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	Update Instrument (allocate voices, set voice to release)
; //----------------------------------------------------------------------------------------
; // IN		:		
; // IN		:		
; // OUT	:		
; // DIRTY	:		
; //----------------------------------------------------------------------------------------
go4kUpdateInstrument:
; // get new note
	mov		eax, dword [esp+4+4]					; // eax = current tick
	shr		eax, PATTERN_SIZE_SHIFT					; // eax = current pattern
	imul	edx, ecx, dword MAX_PATTERNS				; // edx = instrument pattern list index
	movzx	edx, byte [edx+eax+go4k_pattern_lists]	; // edx = pattern index
	mov		eax, dword [esp+4+4]					; // eax = current tick
	shl		edx, PATTERN_SIZE_SHIFT					
	and		eax, PATTERN_SIZE-1
	movzx	edx, byte [edx+eax+go4k_patterns]	; // edx = requested note in new patterntick
; // apply note changes
	cmp		dl, HLD									; // anything but hold causes action
	je		short go4kUpdateInstrument_done
	inc		dword [edi]								; // set release flag if needed
%if MAX_VOICES > 1	
	inc		dword [edi+go4k_instrument.size]		; // set release flag if needed
%endif	
	cmp		dl, HLD									; // check for new note
	jl		short go4kUpdateInstrument_done
%if MAX_VOICES > 1
	pushad
	xchg	eax, dword [go4k_voiceindex + ecx*4]
	test	eax, eax
	je		go4kUpdateInstrument_newNote
	add		edi, go4k_instrument.size
go4kUpdateInstrument_newNote:
	xor		al,1
	xchg	dword [go4k_voiceindex + ecx*4], eax
%endif	
	pushad
	xor		eax, eax
	mov		ecx, (8+MAX_UNITS*MAX_UNIT_SLOTS*4)/4	; // clear only relase, note and workspace
	rep		stosd
	popad
	mov		dword [edi+4], edx						; // set requested note as current note
%if MAX_VOICES > 1	
	popad
%endif
	jmp		short go4kUpdateInstrument_done
go4kUpdateInstrument_done:
	ret

%ifdef USE_SECTIONS
section		.g4kcodx	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	Render Voices
; //----------------------------------------------------------------------------------------
; // IN		:		
; // IN		:		
; // OUT	:		
; // DIRTY	:		
; //----------------------------------------------------------------------------------------
go4kRenderVoices:
	push	ecx								; // save current instrument counter
%if MAX_VOICES > 1	
	push	COM								; // save current instrument command index
	push	VAL								; // save current instrument values index
%endif	
	call	go4k_VM_process					; //  call synth vm for instrument voices
	mov 	eax, dword [ecx+go4kENV_wrk.state]
	cmp		al, byte ENV_STATE_OFF
	jne		go4kRenderVoices_next
	xor		eax, eax
	mov		dword [ecx-4], eax				; // kill note if voice is done
go4kRenderVoices_next:
%if MAX_VOICES > 1			
	pop		VAL								; // restore instrument value index
	pop		COM								; // restore instrument command index
%endif

%ifdef GO4K_USE_BUFFER_RECORDINGS
	mov		eax, dword [esp+16]				; // get current tick
	shr		eax, 8							; // every 256th sample = ~ 172 hz
	shl		eax, 5							; // for 16 instruments a 2 voices
	add		eax, dword [esp]				
	add		eax, dword [esp]				; // + 2*currentinstrument+0
%ifdef GO4K_USE_ENVELOPE_RECORDINGS
	mov		edx, dword [ecx+go4kENV_wrk.level]
	mov		dword [__4klang_envelope_buffer+eax*4], edx
%endif	
%ifdef GO4K_USE_NOTE_RECORDINGS
	mov		edx, dword [ecx-4]
	mov		dword [__4klang_note_buffer+eax*4], edx
%endif		
%endif

%if MAX_VOICES > 1			
	call	go4k_VM_process					; //  call synth vm for instrument voices
	mov 	eax, dword [ecx+go4kENV_wrk.state]
	cmp		al, byte ENV_STATE_OFF
	jne		go4k_render_instrument_next2
	xor		eax, eax
	mov		dword [ecx-4], eax				; // kill note if voice is done
go4k_render_instrument_next2:

%ifdef GO4K_USE_BUFFER_RECORDINGS
	mov		eax, dword [esp+16]				; // get current tick
	shr		eax, 8							; // every 256th sample = ~ 172 hz
	shl		eax, 5							; // for 16 instruments a 2 voices
	add		eax, dword [esp]				
	add		eax, dword [esp]				; // + 2*currentinstrument+0
%ifdef GO4K_USE_ENVELOPE_RECORDINGS
	mov		edx, dword [ecx+go4kENV_wrk.level]
	mov		dword [__4klang_envelope_buffer+eax*4+4], edx
%endif	
%ifdef GO4K_USE_NOTE_RECORDINGS
	mov		edx, dword [ecx-4]
	mov		dword [__4klang_note_buffer+eax*4+4], edx
%endif		
%endif

%endif		
	pop		ecx								; // restore instrument counter	
	ret

%ifdef USE_SECTIONS				
section		.g4kcody	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	the entry point for the synth
; //----------------------------------------------------------------------------------------
%ifdef USE_SECTIONS
export_func	_4klang_render@4
%else
export_func	_4klang_render
%endif
	pushad
	xor		ecx, ecx
%ifdef GO4K_USE_BUFFER_RECORDINGS		
	push	ecx
%endif	
; loop all ticks	
go4k_render_tickloop:	
	push	ecx
	xor		ecx, ecx
; loop all samples per tick	
go4k_render_sampleloop:	
		push	ecx
		xor		ecx, ecx
		mov		ebx, go4k_synth_instructions	; // ebx = instrument command index
		mov		VAL, go4k_synth_parameter_values; // VAL = instrument values index
		mov		edi, _go4k_delay_buffer			; // get offset of first delay buffer
		mov		dword [_go4k_delay_buffer_ofs], edi	; // store offset in delaybuffer offset variable
		mov		edi, go4k_synth_wrk				; // edi = first instrument
; loop all instruments		
go4k_render_instrumentloop:	
			mov		eax, dword [esp]				; // eax = current tick sample
			and		eax, eax
			jnz		go4k_render_instrument_process	; // tick change? (first sample in current tick)	
			call	go4kUpdateInstrument			; // update instrument state
; process instrument			
go4k_render_instrument_process:
			call	go4kRenderVoices			
			inc		ecx
			cmp		cl, byte MAX_INSTRUMENTS
			jl		go4k_render_instrumentloop
		mov		dword [edi+4], ecx		; // move a value != 0 into note slot, so processing will be done
		call	go4k_VM_process			; //  call synth vm for synth
go4k_render_output_sample:
%ifdef GO4K_USE_BUFFER_RECORDINGS	
		inc		dword [esp+8]
		xchg	esi, dword [esp+48]		; // edx = destbuffer
%else
		xchg	esi, dword [esp+44]		; // edx = destbuffer
%endif
%ifdef 	GO4K_CLIP_OUTPUT
		fld		dword [edi-8]
		fld1									; //	1		val
		fucomi	st1								; //	1		val
		jbe		short go4k_render_clip1
		fchs									; //	-1		val
		fucomi	st1								; //	-1		val
		fcmovb	st0, st1						; //	val		-1		(if val > -1)
go4k_render_clip1:
		fstp	st1								; //	newval
%ifdef GO4K_USE_16BIT_OUTPUT		
		push	eax
		fmul	dword [c_32767]
		fistp	dword [esp]
		pop		eax
		mov		word [esi],ax	; // store integer converted left sample
		lodsw
%else
		fstp	dword [esi]		; // store left sample
		lodsd
%endif		
		fld		dword [edi-4]
		fld1									; //	1		val
		fucomi	st1								; //	1		val
		jbe		short go4k_render_clip2
		fchs									; //	-1		val
		fucomi	st1								; //	-1		val
		fcmovb	st0, st1						; //	val		-1		(if val > -1)
go4k_render_clip2:
		fstp	st1								; //	newval
%ifdef GO4K_USE_16BIT_OUTPUT		
		push	eax
		fmul	dword [c_32767]
		fistp	dword [esp]
		pop		eax
		mov		word [esi],ax	; // store integer converted right sample
		lodsw
%else
		fstp	dword [esi]		; // store right sample
		lodsd
%endif		
%else
		fld		dword [edi-8]
%ifdef GO4K_USE_16BIT_OUTPUT
		push	eax
		fmul	dword [c_32767]
		fistp	dword [esp]
		pop		eax
		mov		word [esi],ax	; // store integer converted left sample
		lodsw
%else		
		fstp	dword [esi]		; // store left sample
		lodsd
%endif		
		fld		dword [edi-4]
%ifdef GO4K_USE_16BIT_OUTPUT
		push	eax
		fmul	dword [c_32767]
		fistp	dword [esp]
		pop		eax
		mov		word [esi],ax	; // store integer converted right sample
		lodsw
%else				
		fstp	dword [esi]		; // store right sample		
		lodsd
%endif		
%endif		
%ifdef GO4K_USE_BUFFER_RECORDINGS			
		xchg	esi, dword [esp+48]
%else
		xchg	esi, dword [esp+44]
%endif
		pop		ecx
		inc		ecx
%ifdef GO4K_USE_GROOVE_PATTERN
		mov		ebx, dword SAMPLES_PER_TICK
		mov		eax, dword [esp]
		and		eax, 0x0f
		bt		dword [go4k_groove_pattern],eax
		jnc		go4k_render_nogroove
		sub		ebx, dword 3000
go4k_render_nogroove:				
		cmp		ecx, ebx
%else
		cmp		ecx, dword SAMPLES_PER_TICK
%endif
		jl		go4k_render_sampleloop	
	pop		ecx	
	inc		ecx
%ifdef AUTHORING
	mov		dword[__4klang_current_tick], ecx
%endif
	cmp		ecx, dword MAX_TICKS
	jl		go4k_render_tickloop
%ifdef GO4K_USE_BUFFER_RECORDINGS	
	pop		ecx
%endif	
	popad
	ret		4      

%ifdef USE_SECTIONS
section		.g4kcodz	code	align=1
%else
section .text
%endif
; //----------------------------------------------------------------------------------------
; //	the magic behind it :)
; //----------------------------------------------------------------------------------------
; // IN		:		edi	= instrument pointer
; // IN		:		esi	= instrumet values
; // IN		: 		ebx = instrument instructions
; // OUT	:		
; // DIRTY	:
; //----------------------------------------------------------------------------------------
go4k_VM_process:
	lea		WRK, [edi+8]								; // get current workspace pointer
	mov		ecx, WRK									; // ecx = workspace start
go4k_VM_process_loop:
	movzx	eax, byte [ebx]								; // get command byte
	inc		ebx
	test	eax, eax	
	je		go4k_VM_process_done						; // command byte = 0? so done
	call	dword [eax*4+go4k_synth_commands]
	add		WRK, MAX_UNIT_SLOTS*4					; // go to next workspace slot
	jmp		short go4k_VM_process_loop
go4k_VM_process_done:	
	add		edi, go4k_instrument.size		; // go to next instrument voice
	ret