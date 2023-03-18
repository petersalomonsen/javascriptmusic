(module


;;------------------------------------------------------------------------------
;; Import the difficult math functions from javascript
;; (seriously now, it's 2020)
;;------------------------------------------------------------------------------
(func $pow (import "m" "pow") (param f32) (param f32) (result f32))
(func $log2 (import "m" "log2") (param f32) (result f32))
(func $sin (import "m" "sin") (param f32) (result f32))

;;------------------------------------------------------------------------------
;; Types. Only useful to define the jump table type, which is
;; (int stereo) void
;;------------------------------------------------------------------------------
(type $opcode_func_signature (func (param i32)))

;;------------------------------------------------------------------------------
;; The one and only memory
;;------------------------------------------------------------------------------
(memory (export "m") 357)

;;------------------------------------------------------------------------------
;; Globals. Putting all with same initialization value should compress most
;;------------------------------------------------------------------------------
(global $WRK (mut i32) (i32.const 0))
(global $COM (mut i32) (i32.const 0))
(global $VAL (mut i32) (i32.const 0))
(global $delayWRK (mut i32) (i32.const 0))
(global $globaltick (export "g") (mut i32) (i32.const 0))
(global $row (mut i32) (i32.const 0))
(global $pattern (mut i32) (i32.const 0))
(global $sample (mut i32) (i32.const 0))
(global $voice (mut i32) (i32.const 0))
(global $voicesRemain (mut i32) (i32.const 0))
(global $randseed (mut i32) (i32.const 1))
(global $sp (mut i32) (i32.const 1280))
(global $outputBufPtr (mut i32) (i32.const 6424448))
;; TODO: only export start and length with certain compiler options; in demo use, they can be hard coded
;; in the intro
(global $outputStart (export "s") i32 (i32.const 6424448))
(global $outputLength (export "l") i32 (i32.const 16932864))
(global $output16bit (export "t") i32 (i32.const 0))


;;------------------------------------------------------------------------------
;; Functions to emulate FPU stack in software
;;------------------------------------------------------------------------------
(func $peek (result f32)
    (f32.load (global.get $sp))
)

(func $peek2 (result f32)
    (f32.load offset=4 (global.get $sp))
)

(func $pop (result f32)
    (call $peek)
    (global.set $sp (i32.add (global.get $sp) (i32.const 4)))
)

(func $push (param $value f32)
    (global.set $sp (i32.sub (global.get $sp) (i32.const 4)))
    (f32.store (global.get $sp) (local.get $value))
)

;;------------------------------------------------------------------------------
;; Helper functions
;;------------------------------------------------------------------------------
(func $swap (param f32 f32) (result f32 f32) ;; x,y -> y,x
    local.get 1
    local.get 0
)

(func $scanValueByte (result i32)        ;; scans positions $VAL for a byte, incrementing $VAL afterwards
    (i32.load8_u (global.get $VAL))      ;; in other words: returns byte [$VAL++]
    (global.set $VAL (i32.add (global.get $VAL) (i32.const 1))) ;; $VAL++
)

;;------------------------------------------------------------------------------
;; "Entry point" for the player
;;------------------------------------------------------------------------------
;; (start $render) ;; we run render automagically when the module is instantiated

(func $render (param)
    (local $rendersamplecount i32) 
    (if (i32.eq (global.get $sample) (i32.const 0))
        (then
            (call $su_update_voices)
        )
    )
    (i32.const 0)
    (local.set $rendersamplecount)
    (loop $sample_loop
        (global.set $COM (i32.const 504))
        (global.set $VAL (i32.const 609))
        (global.set $WRK (i32.const 1472))
        (global.set $voice (i32.const 1472))
        (global.set $voicesRemain (i32.const 7))
        (global.set $delayWRK (i32.const 132608))
        (call $su_run_vm)
        (i64.store (global.get $outputBufPtr) (i64.load (i32.const 1440))) ;; load the sample from left & right channels as one 64bit int and store it in the address pointed by outputBufPtr
        (global.set $outputBufPtr (i32.add (global.get $outputBufPtr) (i32.const 8)))      ;; advance outputbufptr
        (i64.store (i32.const 1440) (i64.const 0)) ;; clear the left and right ports
        (global.set $sample (i32.add (global.get $sample) (i32.const 1)))
        (global.set $globaltick (i32.add (global.get $globaltick) (i32.const 1)))
        (if (i32.eq (global.get $sample) (i32.const 5512))
            (then
                (global.set $sample (i32.const 0))
                (global.set $row (i32.add (global.get $row) (i32.const 1)))
                (call $su_update_voices)
            )
        )
        (local.set $rendersamplecount (i32.add (local.get $rendersamplecount) (i32.const 1)))      
        (br_if $sample_loop (i32.lt_s (local.get $rendersamplecount) (i32.const 128)))
    )
    (if $row_loop (i32.eq (global.get $row) (i32.const 16))
        ( then
            (global.set $row (i32.const 0))
            (global.set $pattern (i32.add (global.get $pattern) (i32.const 1)))
        )
    )    
)
(export "render" (func $render))
;; the simple implementation of update_voices: each track has exactly one voice
(func $su_update_voices (local $si i32) (local $di i32) (local $tracksRemaining i32) (local $note i32)
    (local.set $tracksRemaining (i32.const 7))
    (local.set $si (global.get $pattern))
    (local.set $di (i32.const 1472))
    loop $track_loop
        (i32.load8_u offset=336 (local.get $si))
        (i32.mul (i32.const 16))
        (i32.add (global.get $row))
        (i32.load8_u offset=0)
        (local.tee $note)
        (if (i32.ne (i32.const 1))(then
            (i32.store offset=4 (local.get $di) (i32.const 1)) ;; release the note
            (if (i32.gt_u (local.get $note) (i32.const 1))(then
                (memory.fill (local.get $di) (i32.const 0) (i32.const 4096))
                (i32.store (local.get $di) (local.get $note))
            ))
        ))
        (local.set $di (i32.add (local.get $di) (i32.const 4096)))
        (local.set $si (i32.add (local.get $si) (i32.const 24)))
        (br_if $track_loop (local.tee $tracksRemaining (i32.sub (local.get $tracksRemaining) (i32.const 1))))
    end
)

;;-------------------------------------------------------------------------------
;;   su_run_vm function: runs the entire virtual machine once, creating 1 sample
;;-------------------------------------------------------------------------------
(func $su_run_vm (local $opcodeWithStereo i32) (local $opcode i32) (local $paramNum i32) (local $paramX4 i32) (local $WRKplusparam i32)
    loop $vm_loop
        (local.set $opcodeWithStereo (i32.load8_u (global.get $COM)))
        (global.set $COM (i32.add (global.get $COM) (i32.const 1)))  ;; move to next instruction
        (global.set $WRK (i32.add (global.get $WRK) (i32.const 64))) ;; move WRK to next unit
        (if (local.tee $opcode (i32.shr_u (local.get $opcodeWithStereo) (i32.const 1)))(then ;; if $opcode = $opcodeStereo >> 1; $opcode != 0 {
            (local.set $paramNum (i32.const 0))
            (local.set $paramX4 (i32.const 0))
            loop $transform_values_loop
                (if (i32.lt_u (local.get $paramNum) (i32.load8_u offset=918 (local.get $opcode)))(then ;;(i32.ge (local.get $paramNum) (i32.load8_u (local.get $opcode)))  /*TODO: offset to transformvalues
                    (local.set $WRKplusparam (i32.add (global.get $WRK) (local.get $paramX4)))
                    (f32.store offset=1280
                        (local.get $paramX4)
                        (f32.add
                            (f32.mul
                                (f32.convert_i32_u (call $scanValueByte))
                                (f32.const 0.0078125) ;; scale from 0-128 to 0.0 - 1.0
                            )
                            (f32.load offset=32 (local.get $WRKplusparam)) ;; add modulation
                        )
                    )
                    (f32.store offset=32 (local.get $WRKplusparam) (f32.const 0.0)) ;; clear modulations
                    (local.set $paramNum (i32.add (local.get $paramNum) (i32.const 1))) ;; $paramNum++
                    (local.set $paramX4 (i32.add (local.get $paramX4) (i32.const 4)))
                    br $transform_values_loop ;; continue looping
                ))
                ;; paramNum was >= the number of parameters to transform, exiting loop
            end
            (call_indirect (type $opcode_func_signature) (i32.and (local.get $opcodeWithStereo) (i32.const 1)) (local.get $opcode))
        )(else ;; advance to next voice
            (global.set $voice (i32.add (global.get $voice) (i32.const 4096))) ;; advance to next voice
            (global.set $WRK (global.get $voice)) ;; set WRK point to beginning of voice
            (global.set $voicesRemain (i32.sub (global.get $voicesRemain) (i32.const 1)))
            (br_if 2 (i32.eqz (global.get $voicesRemain))) ;; if no more voices remain, return from function
        ))
        br $vm_loop
    end
)
;;-------------------------------------------------------------------------------
;;   ADDP opcode: add the two top most signals on the stack and pop
;;-------------------------------------------------------------------------------
;;   Mono:   a b -> a+b
;;   Stereo: a b c d -> a+c b+d
;;-------------------------------------------------------------------------------
(func $su_op_addp (param $stereo i32)
    (if (local.get $stereo) (then
        call $pop  ;; a
        call $pop  ;; b a
        call $swap ;; a b
        call $pop  ;; c a b
        f32.add    ;; c+a b
        call $swap ;; b c+a
        call $pop  ;; d b c+a
        f32.add    ;; d+b c+a
        call $push ;; c+a
        call $push
    )(else
        (call $push (f32.add (call $pop) (call $pop)))
    ))
)

;;-------------------------------------------------------------------------------
;;   MULP opcode: multiply the two top most signals on the stack and pop
;;-------------------------------------------------------------------------------
;;   Mono:   a b -> a*b
;;   Stereo: a b c d -> a*c b*d
;;-------------------------------------------------------------------------------
(func $su_op_mulp (param $stereo i32)
    (if (local.get $stereo) (then
        call $pop  ;; a
        call $pop  ;; b a
        call $swap ;; a b
        call $pop  ;; c a b
        f32.mul    ;; c*a b
        call $swap ;; b c*a
        call $pop  ;; d b c*a
        f32.mul    ;; d*b c*a
        call $push ;; c*a
        call $push
    )(else
        (call $push (f32.mul (call $pop) (call $pop)))
    ))
)

;;-------------------------------------------------------------------------------
;;   PUSH opcode: push the topmost signal on the stack
;;-------------------------------------------------------------------------------
;;   Mono:   a -> a a
;;   Stereo: a b -> a b a b
;;-------------------------------------------------------------------------------
(func $su_op_push (param $stereo i32)
    (call $push (call $peek))
)

;;-------------------------------------------------------------------------------
;;   XCH opcode: exchange the signals on the stack
;;-------------------------------------------------------------------------------
;;   Mono:   a b -> b a
;;   stereo: a b c d -> c d a b
;;-------------------------------------------------------------------------------
(func $su_op_xch (param $stereo i32)
    call $pop
    call $pop
        call $swap
    call $push
    call $push
)


;;-------------------------------------------------------------------------------
;;   DISTORT opcode: apply distortion on the signal
;;-------------------------------------------------------------------------------
;;   Mono:   x   ->  x*a/(1-a+(2*a-1)*abs(x))            where x is clamped first
;;   Stereo: l r ->  l*a/(1-a+(2*a-1)*abs(l)) r*a/(1-a+(2*a-1)*abs(r))
;;-------------------------------------------------------------------------------
(func $su_op_distort (param $stereo i32)
    (call $pop)
    (call $waveshaper (call $input (i32.const 0)))
    (call $push)
)

;;-------------------------------------------------------------------------------
;;   FILTER opcode: perform low/high/band-pass/notch etc. filtering on the signal
;;-------------------------------------------------------------------------------
;;   Mono:   x   ->  filtered(x)
;;   Stereo: l r ->  filtered(l) filtered(r)
;;-------------------------------------------------------------------------------
(func $su_op_filter (param $stereo i32) (local $flags i32) (local $freq f32) (local $high f32) (local $low f32) (local $band f32) (local $retval f32)
    (call $stereoHelper (local.get $stereo) (i32.const 4))
    (if (local.get $stereo)(then
        ;; This is hacky: rewind the $VAL one byte backwards as the right channel already
        ;; scanned it once. Find a way to avoid rewind
        (global.set $VAL (i32.sub (global.get $VAL) (i32.const 1)))
    ))
    (local.set $flags (call $scanValueByte))
    (local.set $freq (f32.mul
        (call $input (i32.const 0))
        (call $input (i32.const 0))
    ))
    (local.set $low ;; l' = f2*b + l
        (f32.add ;; f2*b+l
            (f32.mul ;; f2*b
                (local.tee $band (f32.load offset=4 (global.get $WRK))) ;; b
                (local.get $freq)                     ;; f2
            )
            (f32.load (global.get $WRK)) ;; l
        )
    )
    (local.set $high ;; h' = x - l' - r*b
        (f32.sub ;; x - l' - r*b
            (f32.sub ;; x - l'
                (call $pop)      ;; x (signal)
                (local.get $low) ;; l'
            )
            (f32.mul ;; r*b
                (call $input (i32.const 1)) ;; r
                (local.get $band) ;; b
            )
        )
    )
    (local.set $band ;; b' = f2 * h' + b
        (f32.add ;; f2 * h' +  b
            (f32.mul ;; f2 * h'
                (local.get $freq) ;; f2
                (local.get $high) ;; h'
            )
            (local.get $band) ;; b
        )
    )
    (local.set $retval (f32.const 0))
    (if (i32.and (local.get $flags) (i32.const 0x40)) (then
        (local.set $retval (f32.add (local.get $retval) (local.get $low)))
    ))
    (if (i32.and (local.get $flags) (i32.const 0x10)) (then
        (local.set $retval (f32.add (local.get $retval) (local.get $high)))
    ))
    (f32.store (global.get $WRK) (local.get $low))
    (f32.store offset=4 (global.get $WRK) (local.get $band))
    (call $push (local.get $retval))
)
;;-------------------------------------------------------------------------------
;;   PAN opcode: pan the signal
;;-------------------------------------------------------------------------------
;;   Mono:   s   ->  s*(1-p) s*p
;;   Stereo: l r ->  l*(1-p) r*p
;;
;;   where p is the panning in [0,1] range
;;-------------------------------------------------------------------------------
(func $su_op_pan (param $stereo i32)
    (call $peek) ;; F: s       P: s
    (f32.mul
        (call $input (i32.const 0))
        (call $pop)
    )            ;; F:         P: p*s s
    (call $push) ;; F: p*s     P: s
    (call $peek) ;; F: p*s     P: p*s s
    f32.sub      ;; F: p*s     P: s-p*s
    (call $push) ;; F: (1-p)*s p*s
)

;;-------------------------------------------------------------------------------
;;   DELAY opcode: adds delay effect to the signal
;;-------------------------------------------------------------------------------
;;   Mono:   perform delay on ST0, using delaycount delaylines starting
;;           at delayindex from the delaytable
;;   Stereo: perform delay on ST1, using delaycount delaylines starting
;;           at delayindex + delaycount from the delaytable (so the right delays
;;           can be different)
;;-------------------------------------------------------------------------------
(func $su_op_delay (param $stereo i32) (local $delayIndex i32) (local $delayCount i32) (local $output f32) (local $s f32) (local $filtstate f32) (local $delayCountStash i32)
    (local.set $delayIndex (i32.mul (call $scanValueByte) (i32.const 2)))
    (local.set $delayCountStash (call $scanValueByte))
    (if (local.get $stereo)(then
        (call $su_op_xch (i32.const 0))
    ))
    loop $stereoLoop
    (local.set $delayCount (local.get $delayCountStash))
    (local.set $output (f32.mul
        (call $input (i32.const 1))
        (call $peek)
    ))
    loop $delayLoop
        (local.tee $s (f32.load offset=12
            (i32.add ;; delayWRK + ((globalTick-delaytimes[delayIndex])&65535)*4
                (i32.mul ;; ((globalTick-delaytimes[delayIndex])&65535)*4
                    (i32.and ;; (globalTick-delaytimes[delayIndex])&65535
                        (i32.sub ;; globalTick-delaytimes[delayIndex]
                            (global.get $globaltick)
                            (i32.load16_u
                                offset=899
                                (local.get $delayIndex)
                            )
                        )
                        (i32.const 65535)
                    )
                    (i32.const 4)
                )
                (global.get $delayWRK)
            )
        ))
        (local.set $output (f32.add (local.get $output)))
        (f32.store
            (global.get $delayWRK)
            (local.tee $filtstate
                (f32.add
                    (f32.mul
                        (f32.sub
                            (f32.load (global.get $delayWRK))
                            (local.get $s)
                        )
                        (call $input (i32.const 3))
                    )
                    (local.get $s)
                )
            )
        )
        (f32.store offset=12
            (i32.add ;; delayWRK + globalTick*4
                (i32.mul ;; globalTick)&65535)*4
                    (i32.and ;; globalTick&65535
                        (global.get $globaltick)
                        (i32.const 65535)
                    )
                    (i32.const 4)
                )
                (global.get $delayWRK)
            )
            (f32.add
                (f32.mul
                    (call $input (i32.const 2))
                    (local.get $filtstate)
                )
                (f32.mul
                    (f32.mul
                        (call $input (i32.const 0))
                        (call $input (i32.const 0))
                    )
                    (call $peek)
                )
            )
        )
        (global.set $delayWRK (i32.add (global.get $delayWRK) (i32.const 262156)))
        (local.set $delayIndex (i32.add (local.get $delayIndex) (i32.const 2)))
        (br_if $delayLoop (i32.gt_s (local.tee $delayCount (i32.sub (local.get $delayCount) (i32.const 2))) (i32.const 0)))
    end
    (f32.store offset=4
        (global.get $delayWRK)
        (local.tee $filtstate
            (f32.add
                (local.get $output)
                (f32.sub
                    (f32.mul
                        (f32.const 0.99609375)
                        (f32.load offset=4 (global.get $delayWRK))
                    )
                    (f32.load offset=8 (global.get $delayWRK))
                )
            )
        )
    )
    (f32.store offset=8
        (global.get $delayWRK)
        (local.get $output)
    )
    (drop (call $pop))
    (call $push (local.get $filtstate))
    (call $su_op_xch (i32.const 0))
    (br_if $stereoLoop (i32.eqz (local.tee $stereo (i32.eqz (local.get $stereo)))))
    end
    (call $su_op_xch (i32.const 0))
)

;;-------------------------------------------------------------------------------
;;   COMPRES opcode: push compressor gain to stack
;;-------------------------------------------------------------------------------
;;   Mono:   push g on stack, where g is a suitable gain for the signal
;;           you can either MULP to compress the signal or SEND it to a GAIN
;;           somewhere else for compressor side-chaining.
;;   Stereo: push g g on stack, where g is calculated using l^2 + r^2
;;-------------------------------------------------------------------------------
(func $su_op_compressor (param $stereo i32) (local $x2 f32) (local $level f32) (local $t2 f32)
    (local.tee $x2 (f32.mul
        (call $peek)
        (call $peek)
    ))
    (local.tee $level (f32.load (global.get $WRK)))
    f32.lt
    call $nonLinearMap ;; $nonlinearMap(x^2<level) (let's call it c)
    (local.tee $level (f32.add ;; l'=l + c*(x^2-l)
        (f32.mul ;; c was already on stack, so c*(x^2-l)
            (f32.sub ;; x^2-l
                (local.get $x2)
                (local.get $level)
            )
        )
        (local.get $level)
    ))
    (local.tee $t2 (f32.mul ;; t^2
        (call $input (i32.const 3))
        (call $input (i32.const 3))
    ))
    (if (f32.gt) (then ;; if $level > $threshold, note the local.tees
        (call $push
            (call $pow ;; (t^2/l)^(r/2)
                (f32.div ;; t^2/l
                    (local.get $t2)
                    (local.get $level)
                )
                (f32.mul ;; r/2
                    (call $input (i32.const 4)) ;; r
                    (f32.const 0.5)  ;; 0.5
                )
            )
        )
    )(else
        (call $push (f32.const 1)) ;; unity gain if we are below threshold
    ))
    (call $push (f32.div ;; apply post-gain ("make up gain")
        (call $pop)
        (call $input (i32.const 2))
    ))
    (f32.store (global.get $WRK) (local.get $level)) ;; save the updated levels
)



;;-------------------------------------------------------------------------------
;;   ENVELOPE opcode: pushes an ADSR envelope value on stack [0,1]
;;-------------------------------------------------------------------------------
;;   Mono:   push the envelope value on stack
;;   Stereo: push the envelope valeu on stack twice
;;-------------------------------------------------------------------------------
(func $su_op_envelope (param $stereo i32) (local $state i32) (local $level f32) (local $delta f32)
    (if (i32.load offset=4 (global.get $voice)) (then ;; if voice.release > 0
        (i32.store (global.get $WRK) (i32.const 3)) ;; set envelope state to release
    ))
    (local.set $state (i32.load (global.get $WRK)))
    (local.set $level (f32.load offset=4 (global.get $WRK)))
    (local.set $delta (call $nonLinearMap (local.get $state)))
    (if (local.get $state) (then
        (if (i32.eq (local.get $state) (i32.const 1))(then ;; state is 1 aka decay
            (local.set $level (f32.sub (local.get $level) (local.get $delta)))
            (if (f32.le (local.get $level) (call $input (i32.const 2)))(then
                (local.set $level (call $input (i32.const 2)))
                (local.set $state (i32.const 2))
            ))
        ))
        (if (i32.eq (local.get $state) (i32.const 3))(then ;; state is 3 aka release
            (local.set $level (f32.sub (local.get $level) (local.get $delta)))
            (if (f32.le (local.get $level) (f32.const 0)) (then
                (local.set $level (f32.const 0))
            ))
        ))
    )(else ;; the state is 0 aka attack
        (local.set $level (f32.add (local.get $level) (local.get $delta)))
        (if (f32.ge (local.get $level) (f32.const 1))(then
            (local.set $level (f32.const 1))
            (local.set $state (i32.const 1))
        ))
    ))
    (i32.store (global.get $WRK) (local.get $state))
    (f32.store offset=4 (global.get $WRK) (local.get $level))
    (call $push (f32.mul (local.get $level) (call $input (i32.const 4))))
    (if (local.get $stereo)(then
        (call $push (call $peek))
    ))
)

;;-------------------------------------------------------------------------------
;;   NOISE opcode: creates noise
;;-------------------------------------------------------------------------------
;;   Mono:   push a random value [-1,1] value on stack
;;   Stereo: push two (different) random values on stack
;;-------------------------------------------------------------------------------
(func $su_op_noise (param $stereo i32)
    (if (local.get $stereo) (then
        (call $su_op_noise (i32.const 0))
    ))
    (global.set $randseed (i32.mul (global.get $randseed) (i32.const 16007)))
    (f32.mul
        (call $waveshaper
            ;; Note: in x86 code, the constant looks like a positive integer, but has actually the MSB set i.e. is considered negative by the FPU. This tripped me big time.
            (f32.div (f32.convert_i32_s (global.get $randseed)) (f32.const -2147483648))
            (call $input (i32.const 0))
        )
        (call $input (i32.const 1))
    )
    (call $push)
)

;;-------------------------------------------------------------------------------
;;   OSCILLAT opcode: oscillator, the heart of the synth
;;-------------------------------------------------------------------------------
;;   Mono:   push oscillator value on stack
;;   Stereo: push l r on stack, where l has opposite detune compared to r
;;-------------------------------------------------------------------------------
(func $su_op_oscillator (param $stereo i32) (local $flags i32) (local $detune f32) (local $phase f32) (local $color f32) (local $amplitude f32)
    (local $unison i32) (local $WRK_stash i32) (local $detune_stash f32)
    (local.set $flags (call $scanValueByte))
    (local.set $detune (call $inputSigned (i32.const 1)))
    loop $stereoLoop
    (local.set $unison (i32.add (i32.and (local.get $flags) (i32.const 3)) (i32.const 1)))
    (local.set $WRK_stash (global.get $WRK))
    (local.set $detune_stash (local.get $detune))
    (call $push (f32.const 0))
    loop $unisonLoop
    (f32.store ;; update phase
        (global.get $WRK)
        (local.tee $phase
            (f32.sub
                (local.tee $phase
                    ;; Transpose calculation starts
                    (f32.div
                        (call $inputSigned (i32.const 0))
                        (f32.const 0.015625)
                    ) ;; scale back to 0 - 128
                    (f32.add (local.get $detune)) ;; add detune. detune is -1 to 1 so can detune a full note up or down at max
                    (f32.add (select
                        (f32.const 0)
                        (f32.convert_i32_u (i32.load (global.get $voice)))
                        (i32.and (local.get $flags) (i32.const 0x8))
                    ))  ;; if lfo is not enabled, add the note number to it
                    (f32.mul (f32.const 0.0833333)) ;; /12, in full octaves
                    (call $pow2)
                    (f32.mul (select
                        (f32.const 0.000038) ;; pretty random scaling constant to get LFOs into reasonable range. Historical reasons, goes all the way back to 4klang
                        (f32.const 0.000092696138) ;; scaling constant to get middle-C to where it should be
                        (i32.and (local.get $flags) (i32.const 0x8))
                    ))
                    (f32.add (f32.load (global.get $WRK))) ;; add the current phase of the oscillator
                )
                (f32.floor (local.get $phase))
            )
        )
    )
    (f32.add (local.get $phase) (call $input (i32.const 2)))
    (local.set $phase (f32.sub (local.tee $phase) (f32.floor (local.get $phase)))) ;; phase = phase mod 1.0
    (local.set $color (call $input (i32.const 3)))
    (if (i32.and (local.get $flags) (i32.const 0x40)) (then
        (local.set $amplitude (call $oscillator_sine (local.get $phase) (local.get $color)))
    ))
    (if (i32.and (local.get $flags) (i32.const 0x20)) (then
        (local.set $amplitude (call $oscillator_trisaw (local.get $phase) (local.get $color)))
    ))
    (call $waveshaper (local.get $amplitude) (call $input (i32.const 4)))
    (call $push (f32.mul
        (call $input (i32.const 5))
    ))
    (call $push (f32.add (call $pop) (call $pop)))
    (if (local.tee $unison (i32.sub (local.get $unison) (i32.const 1)))(then
        (f32.store offset=1288 (i32.const 0)
            (f32.add
                (call $input (i32.const 2))
                (f32.const 0.08333333) ;; 1/12, add small phase shift so all oscillators don't start in phase
            )
        )
        (global.set $WRK (i32.add (global.get $WRK) (i32.const 8))) ;; WARNING: this is a bug. WRK should be nonvolatile, but we are changing it. It does not cause immediate problems but modulations will be off.
        (local.set $detune (f32.neg (f32.mul
            (local.get $detune) ;; each unison oscillator has a detune with flipped sign and halved amount... this creates detunes that concentrate around the fundamental
            (f32.const 0.5)
        )))
        br $unisonLoop
    ))
    end
    (global.set $WRK (local.get $WRK_stash))
    (local.set $detune (local.get $detune_stash))
    (local.set $detune (f32.neg (local.get $detune))) ;; flip the detune for secon round
    (global.set $WRK (i32.add (global.get $WRK) (i32.const 4))) ;; WARNING: this is a bug. WRK should be nonvolatile, but we are changing it. It does not cause immediate problems but modulations will be off.
    (br_if $stereoLoop (i32.eqz (local.tee $stereo (i32.eqz (local.get $stereo)))))
    end
)
(func $oscillator_sine (param $phase f32) (param $color f32) (result f32)
    (select
        (f32.const 0)
        (call $sin (f32.mul
            (f32.div
                (local.get $phase)
                (local.get $color)
            )
            (f32.const 6.28318530718)
        ))
        (f32.ge (local.get $phase) (local.get $color))
    )
)

(func $oscillator_trisaw (param $phase f32) (param $color f32) (result f32)
    (if (f32.ge (local.get $phase) (local.get $color)) (then
        (local.set $phase (f32.sub (f32.const 1) (local.get $phase)))
        (local.set $color (f32.sub (f32.const 1) (local.get $color)))
    ))
    (f32.div (local.get $phase) (local.get $color))
    (f32.mul (f32.const 2))
    (f32.sub (f32.const 1))
)




;;-------------------------------------------------------------------------------
;;   OUTAUX opcode: outputs to main and aux1 outputs and pops the signal
;;-------------------------------------------------------------------------------
;;   Mono: add outgain*ST0 to main left port and auxgain*ST0 to aux1 left
;;   Stereo: also add outgain*ST1 to main right port and auxgain*ST1 to aux1 right
;;-------------------------------------------------------------------------------
(func $su_op_outaux (param $stereo i32) (local $addr i32)
    (local.set $addr (i32.const 1440))
    loop $stereoLoop
        (f32.store ;; send
            (local.get $addr)
            (f32.add
                (f32.mul
                    (call $peek)
                    (call $input (i32.const 0))
                )
                (f32.load (local.get $addr))
            )
        )
        (f32.store offset=8
            (local.get $addr)
            (f32.add
                (f32.mul
                    (call $pop)
                    (call $input (i32.const 1))
                )
                (f32.load offset=8 (local.get $addr))
            )
        )
        (local.set $addr (i32.add (local.get $addr) (i32.const 4)))
        (br_if $stereoLoop (i32.eqz (local.tee $stereo (i32.eqz (local.get $stereo)))))
    end
)

;;-------------------------------------------------------------------------------
;;   SEND opcode: adds the signal to a port
;;-------------------------------------------------------------------------------
;;   Mono: adds signal to a memory address, defined by a word in VAL stream
;;   Stereo: also add right signal to the following address
;;-------------------------------------------------------------------------------
(func $su_op_send (param $stereo i32) (local $address i32) (local $scaledAddress i32)
    (local.set $address (i32.add (call $scanValueByte) (i32.shl (call $scanValueByte) (i32.const 8))))
    (if (i32.eqz (i32.and (local.get $address) (i32.const 8)))(then
            (call $push (call $peek))
    ))
    (local.set $scaledAddress (i32.add (i32.mul (i32.and (local.get $address) (i32.const 0x7FF7)) (i32.const 4))
        (select
            (i32.const 1408)
            (global.get $voice)
            (i32.and (local.get $address)(i32.const 0x8000))
        )
    ))
    (f32.store offset=32
        (local.get $scaledAddress)
        (f32.add
            (f32.load offset=32 (local.get $scaledAddress))
            (f32.mul
                (call $inputSigned (i32.const 0))
                (call $pop)
            )
        )
    )
)

;;-------------------------------------------------------------------------------
;;   OUT opcode: outputs and pops the signal
;;-------------------------------------------------------------------------------
;;   Stereo: add ST0 to left out and ST1 to right out, then pop
;;-------------------------------------------------------------------------------
(func $su_op_out (param $stereo i32) (local $ptr i32)
    (local.set $ptr (i32.const 1440)) ;; synth.left
    (f32.store (local.get $ptr)
        (f32.add
            (f32.mul
                (call $pop)
                (call $input (i32.const 0))
            )
            (f32.load (local.get $ptr))
        )
    )
    (local.set $ptr (i32.const 1444)) ;; synth.right, note that ATM does not seem to support mono ocpode at all
    (f32.store (local.get $ptr)
        (f32.add
            (f32.mul
                (call $pop)
                (call $input (i32.const 0))
            )
            (f32.load (local.get $ptr))
        )
    )
)



;;-------------------------------------------------------------------------------
;; $input returns the float value of a transformed to 0.0 - 1.0f range.
;; The transformed values start at 512 (TODO: change magic constants somehow)
;;-------------------------------------------------------------------------------
(func $input (param $inputNumber i32) (result f32)
    (f32.load offset=1280 (i32.mul (local.get $inputNumber) (i32.const 4)))
)

;;-------------------------------------------------------------------------------
;; $inputSigned returns the float value of a transformed to -1.0 - 1.0f range.
;;-------------------------------------------------------------------------------
(func $inputSigned (param $inputNumber i32) (result f32)
    (f32.sub (f32.mul (call $input (local.get $inputNumber)) (f32.const 2)) (f32.const 1))
)

;;-------------------------------------------------------------------------------
;; $nonLinearMap: x -> 2^(-24*input[x])
;;-------------------------------------------------------------------------------
(func $nonLinearMap (param $value i32) (result f32)
    (call $pow2
        (f32.mul
            (f32.const -24)
            (call $input (local.get $value))
        )
    )
)

;;-------------------------------------------------------------------------------
;; $pow2: x -> 2^x
;;-------------------------------------------------------------------------------
(func $pow2 (param $value f32) (result f32)
    (call $pow (f32.const 2) (local.get $value))
)

;;-------------------------------------------------------------------------------
;; Waveshaper(x,a): "distorts" signal x by amount a
;; Returns  x*a/(1-a+(2*a-1)*abs(x))
;;-------------------------------------------------------------------------------
(func $waveshaper (param $signal f32) (param $amount f32) (result f32)
    (local.set $signal (call $clip (local.get $signal)))
    (f32.mul
        (local.get $signal)
        (f32.div
            (local.get $amount)
            (f32.add
                (f32.const 1)
                (f32.sub
                    (f32.mul
                        (f32.sub
                            (f32.add (local.get $amount) (local.get $amount))
                            (f32.const 1)
                        )
                        (f32.abs (local.get $signal))
                    )
                    (local.get $amount)
                )
            )
        )
    )
)

;;-------------------------------------------------------------------------------
;; Clip(a : f32) returns min(max(a,-1),1)
;;-------------------------------------------------------------------------------
(func $clip (param $value f32) (result f32)
    (f32.min (f32.max (local.get $value) (f32.const -1.0)) (f32.const 1.0))
)

(func $stereoHelper (param $stereo i32) (param $tableIndex i32)
    (if (local.get $stereo)(then
        (call $pop)
        (global.set $WRK (i32.add (global.get $WRK) (i32.const 16)))
        (call_indirect (type $opcode_func_signature) (i32.const 0) (local.get $tableIndex))
        (global.set $WRK (i32.sub (global.get $WRK) (i32.const 16)))
        (call $push)
    ))
)

;;-------------------------------------------------------------------------------
;; The opcode table jump table. This is constructed to only include the opcodes
;; that are used so that the jump table is as small as possible.
;;-------------------------------------------------------------------------------
(table 15 funcref)
(elem (i32.const 1) ;; start the indices at 1, as 0 is reserved for advance
    $su_op_oscillator
    $su_op_addp
    $su_op_noise
    $su_op_filter
    $su_op_envelope
    $su_op_mulp
    $su_op_delay
    $su_op_outaux
    $su_op_distort
    $su_op_pan
    $su_op_out
    $su_op_send
    $su_op_push
    $su_op_compressor
)



;; All data is collected into a byte buffer and emitted at once
(data (i32.const 0) "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\4a\01\48\01\00\00\43\01\01\00\45\01\01\01\3e\01\1a\01\00\26\01\00\26\01\1a\01\00\00\00\00\00\00\18\01\00\24\01\00\24\01\18\01\00\00\00\00\00\00\1f\01\00\2b\01\00\2b\01\1f\01\00\00\00\00\00\00\1d\01\00\29\01\00\29\01\1d\01\00\00\00\00\00\00\1a\01\00\26\01\00\26\01\1a\01\01\01\01\01\01\00\18\01\00\24\01\00\24\01\18\01\01\01\01\01\01\00\1f\01\00\2b\01\00\2b\01\1f\01\01\01\01\01\01\00\1d\01\00\29\01\00\29\01\1d\01\01\01\01\01\01\00\4a\01\48\01\00\00\43\01\01\00\45\01\01\00\3e\01\41\01\00\45\01\00\46\01\01\01\01\01\01\01\01\00\41\01\00\41\01\01\3c\01\01\01\01\01\01\01\01\00\3e\01\00\41\01\00\41\01\01\01\01\01\01\01\01\00\45\01\00\3c\01\01\40\01\01\01\01\01\01\01\01\00\45\01\00\3e\01\00\3e\01\01\01\01\01\01\01\01\00\3c\01\00\45\01\01\43\01\01\01\01\01\01\01\01\00\40\00\00\00\40\00\00\00\40\00\00\00\40\00\00\00\00\00\00\00\4f\01\00\00\00\00\00\00\4f\00\00\00\00\00\00\00\4f\01\00\00\00\00\00\32\4f\00\00\1e\00\00\00\00\42\01\00\00\00\00\00\00\4f\00\00\00\0a\0a\0a\0a\0a\0a\0a\0a\01\0a\0a\0a\01\0a\0a\0a\0a\0a\0a\0a\0a\0a\0a\0a\02\03\04\05\02\03\04\05\06\07\08\09\06\07\08\09\02\03\04\05\02\03\04\05\00\00\00\00\00\00\00\00\0b\0c\0b\0c\0b\0c\0b\0c\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\0d\0e\0d\0e\0d\0e\0d\0e\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\0f\10\0f\10\0f\10\0f\10\00\00\00\00\00\00\00\00\11\11\11\11\11\11\11\11\11\11\11\11\11\11\11\11\11\11\11\11\11\11\11\11\00\00\00\00\12\12\12\13\12\12\12\14\12\12\12\14\12\12\12\12\12\12\12\12\03\03\05\03\05\07\09\05\0b\0d\09\0f\11\00\0a\12\02\0c\08\08\14\17\0a\12\18\00\03\03\05\03\05\07\09\05\0b\0d\09\0f\11\00\03\03\05\03\05\07\09\05\0b\0d\09\0f\11\00\03\03\05\03\05\07\09\05\0b\0d\09\0f\11\00\0a\12\02\0c\08\1a\08\0e\04\14\17\0a\12\18\0a\12\18\00\0a\02\0c\0a\12\06\0c\08\04\12\0e\1c\0c\14\11\0a\12\18\00\40\30\00\02\3f\10\23\40\4e\00\7e\40\10\23\40\3b\00\02\40\10\23\40\06\80\80\10\32\40\40\40\60\20\80\10\40\40\40\40\00\01\00\80\30\3f\00\40\80\70\40\40\40\00\40\80\20\10\80\10\16\80\40\40\80\00\40\00\00\80\20\4f\68\00\40\30\00\02\3f\10\23\40\4e\00\7e\40\10\23\40\3b\00\02\40\10\23\40\06\80\80\10\32\40\40\40\60\20\80\10\40\40\40\40\00\01\00\80\40\30\00\02\3f\10\23\40\4e\00\7e\40\10\23\40\3b\00\02\40\10\23\40\06\80\80\10\32\40\40\40\60\20\80\10\40\40\40\40\00\01\00\80\40\30\00\02\3f\10\23\40\4e\00\7e\40\10\23\40\3b\00\02\40\10\23\40\06\80\80\10\32\40\40\40\60\20\80\10\40\40\40\40\00\01\00\80\24\45\00\20\80\70\40\40\00\80\40\80\40\0e\80\10\10\80\40\20\00\60\40\02\0f\40\40\00\46\00\46\80\05\65\48\94\30\3a\00\00\80\40\20\4d\94\20\3c\00\00\80\40\40\00\40\40\80\20\20\40\00\42\40\20\40\40\6a\80\10\70\18\80\28\00\02\0f\33\31\40\40\70\44\40\00\00\3c\00\00\80\05\5a\38\98\e3\23\e3\23\5c\04\a4\04\fc\04\4c\05\8e\05\d4\05\14\06\52\06\06\00\02\02\05\00\04\02\01\01\01\01\00\05")

;;(data (i32.const 8388610) "\52\49\46\46\b2\eb\0c\20\57\41\56\45\66\6d\74\20\12\20\20\20\03\20\02\20\44\ac\20\20\20\62\05\20\08\20\20\20\20\20\66\61\63\74\04\20\20\20\e0\3a\03\20\64\61\74\61\80\eb\0c\20")

) ;; END MODULE
