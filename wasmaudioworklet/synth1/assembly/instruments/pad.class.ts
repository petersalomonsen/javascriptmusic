
import { SAMPLERATE } from '../environment';
import { StereoSignal } from '../synth/stereosignal.class';
import { Envelope } from '../synth/envelope.class';
import { SawOscillator } from '../synth/sawoscillator.class';
import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../synth/biquad';
import { notefreq } from '../synth/note';



export class Pad {
    private _note: f32;
    readonly envelope: Envelope = new Envelope(0.2, 0.5, 0.7, 0.3);
    readonly filterenvelope: Envelope = new Envelope(0.4, 4, 0.9, 0.3);
    readonly sawoscillator: SawOscillator = new SawOscillator();
    readonly sawoscillator2: SawOscillator = new SawOscillator();
    readonly sawoscillator3: SawOscillator = new SawOscillator();
    readonly filter: BiQuadFilter = new BiQuadFilter();
    readonly signal: StereoSignal = new StereoSignal();

    set note(note: f32) {        
        if(note > 1) {            
            this.sawoscillator.frequency = notefreq(note);
            this.sawoscillator2.frequency = notefreq(note - 0.05);
            this.sawoscillator3.frequency = notefreq(note + 0.05);
            this.envelope.attack();           
            this.filterenvelope.attack();             
        } else {
            this.envelope.release();
            this.filterenvelope.release();
        }
        this._note = note;
    }

    get note(): f32 {
        return this._note;
    }

    next(): void {        
        let env: f32 = this.envelope.next();
        if(env === 0) {
            this.signal.clear();
            return;
        }
        let osc1: f32 = this.sawoscillator.next();
        let osc2: f32 = this.sawoscillator2.next();
        let osc3: f32 = this.sawoscillator3.next();
        this.signal.left = env * osc1 * 0.5 + osc2 * 0.2 + osc3 * 0.2;
        this.signal.right = env * osc1 * 0.5 + osc2 * 0.8 + osc3 * 0.8;

        this.filter.update_coeffecients(FilterType.LowPass, SAMPLERATE, 
            200 + this.filterenvelope.next() * 14000, Q_BUTTERWORTH);
        this.signal.left = this.filter.process(this.signal.left);
        this.signal.right = this.filter.process(this.signal.right);
    } 
}
  