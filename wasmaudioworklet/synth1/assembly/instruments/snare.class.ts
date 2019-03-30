
import { SAMPLERATE } from '../environment';
import { StereoSignal } from '../synth/stereosignal.class';
import { Envelope } from '../synth/envelope.class';
import { SawOscillator } from '../synth/sawoscillator.class';
import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../synth/biquad';
import { Noise } from '../synth/noise.class';

export class Snare {
    private _note: f32;
    readonly envelope: Envelope = new Envelope(0.0, 0.3, 0, 0.3);
    readonly filterenvelope: Envelope = new Envelope(0.0, 0.2, 0.0, 0.1);
    readonly sawoscillator: SawOscillator = new SawOscillator();
    readonly noise: Noise = new Noise();
    
    readonly filter: BiQuadFilter = new BiQuadFilter();
    readonly signal: StereoSignal = new StereoSignal();

    set note(note: f32) {        
        if(note > 1) {            
            this.sawoscillator.frequency = 200;
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
        this.sawoscillator.frequency = 20.0 + (env * 200.0);
        
        let osc1: f32 = this.sawoscillator.next() + this.noise.next();
        
        this.signal.left = env * osc1;
        this.signal.right = env * osc1;
        
        this.filter.update_coeffecients(FilterType.Notch, SAMPLERATE, 
            (-800 * env) + 900, Q_BUTTERWORTH);

        this.signal.left = this.filter.process(this.signal.left);
        this.signal.right = this.filter.process(this.signal.right);
    } 
}
  