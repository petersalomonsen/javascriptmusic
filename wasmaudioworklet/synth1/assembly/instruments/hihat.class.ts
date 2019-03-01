
import { SAMPLERATE } from '../environment';
import { StereoSignal } from '../synth/stereosignal.class';
import { Envelope } from '../synth/envelope.class';
import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../synth/biquad';
import { Noise } from '../synth/noise.class';

export class Hihat {
    private _note: f32;
    private velocity: f32;

    readonly envelope: Envelope = new Envelope(0.0, 0.1, 0, 0.1);    
    readonly noise: Noise = new Noise();
    
    readonly filter: BiQuadFilter = new BiQuadFilter();
    readonly signal: StereoSignal = new StereoSignal();

    set note(note: f32) {        
        if(note > 1) {        
            this.velocity = note / 32;    
            this.envelope.attack();           
        } else {
            this.envelope.release();
        }
        this._note = note;
    }

    get note(): f32 {
        return this._note;
    }

    next(): void {        
        let env: f32 = this.envelope.next();        
        let osc: f32 = this.noise.next();        
        let signal = this.velocity * env * osc;
        
        this.filter.update_coeffecients(FilterType.HighPass, SAMPLERATE, 
            12000, Q_BUTTERWORTH);

        signal = this.filter.process(signal);

        this.signal.left = signal;
        this.signal.right = signal;
    } 
}
  