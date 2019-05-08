
import { SineOscillator } from '../synth/sineoscillator.class';
import { StereoSignal } from '../synth/stereosignal.class';
import { Envelope } from '../synth/envelope.class';
import { SawOscillator } from '../synth/sawoscillator.class';
import { notefreq } from '../synth/note';

export class Test4KlangString {
    private _note: f32;
    readonly env0: Envelope = new Envelope(0.01, 0.2, 0.8, 0.2);
    readonly vco1: SineOscillator = new SineOscillator();
    readonly vco5: SawOscillator = new SawOscillator();
    readonly vco6: SawOscillator = new SawOscillator();

    readonly signal: StereoSignal = new StereoSignal();

    notefreq: f32;

    set note(note: f32) {        
        if(note > 1) {           
            this.notefreq = notefreq(note);
            this.vco1.frequency = this.notefreq / 1000;

            this.env0.attack();                        
        } else {
            this.env0.release();
        }
        this._note = note;
    }

    get note(): f32 {
        return this._note;
    }

    next(): void {        
        let f_0:f32 = this.env0.next(); // GO4K_ENV     ATTAC(88),DECAY(88),SUSTAIN(88),RELEASE(88),GAIN(88)
        let f_1:f32 = this.vco1.next(); // GO4K_VCO     TRANSPOSE(76),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(64),FLAGS(SINE|LFO)
        this.vco5.frequency = this.notefreq + f_1; // GO4K_FST   AMOUNT(70),DEST(5*MAX_UNIT_SLOTS+2+FST_SET)
        this.vco6.frequency = this.notefreq - f_1;  // GO4K_FST   AMOUNT(70),DEST(6*MAX_UNIT_SLOTS+5+FST_SET)

        f_1 = this.vco5.next(); // GO4K_VCO     TRANSPOSE(64),DETUNE(65),PHASE(64),GATES(85),COLOR(52),SHAPE(64),GAIN(64),FLAGS(TRISAW)
        let f_2:f32 = this.vco6.next(); // GO4K_VCO     TRANSPOSE(64),DETUNE(63),PHASE(64),GATES(85),COLOR(52),SHAPE(64),GAIN(64),FLAGS(TRISAW)
        f_1 += f_2; // GO4K_FOP OP(FOP_ADDP)
        f_0 *= f_1; // GO4K_FOP OP(FOP_MULP)
        f_1 = f_0; // GO4K_PAN   PANNING(64)
        this.signal.left = f_1;
        this.signal.right = f_0; // GO4K_OUT    GAIN(0), AUXSEND(128)
    } 
}
  