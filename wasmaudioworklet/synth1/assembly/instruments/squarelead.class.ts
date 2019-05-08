
import { SineOscillator } from '../synth/sineoscillator.class';
import { StereoSignal } from '../synth/stereosignal.class';
import { Envelope } from '../synth/envelope.class';
import { WaveShaper } from '../synth/shaper';
import { notefreq } from '../synth/note';
import { SquareOscillator } from '../synth/squareoscillator.class';
import { BiQuadFilter, Q_BUTTERWORTH, FilterType } from '../synth/biquad';
import { SAMPLERATE } from '../environment';


export class SquareLead {
    private _note: f32;
    readonly envelope: Envelope = new Envelope(0.02, 0.2, 0.2, 0.2);
    readonly filterenvelope: Envelope = new Envelope(0.02, 0.1, 0.4, 0.2);
    readonly squareoscillatorl: SquareOscillator = new SquareOscillator();
    readonly squareoscillatorr: SquareOscillator = new SquareOscillator();
    readonly lpfilterleft: BiQuadFilter = new BiQuadFilter();
    readonly lpfilterright: BiQuadFilter = new BiQuadFilter();
    readonly shaper: WaveShaper = new WaveShaper();
    readonly signal: StereoSignal = new StereoSignal();
    
    baseFrequency : f32;

    set note(note: f32) {        
        if(note > 1) {   
            this.shaper.drive = 0.5;         
            this.baseFrequency = notefreq(note);
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
        let filterenv: f32 = this.filterenvelope.next();
        if(env===0 && filterenv===0) {
            this.signal.clear();
            return;
        }
        
        this.squareoscillatorl.frequency = this.baseFrequency + 0.3;
        this.squareoscillatorr.frequency = this.baseFrequency - 0.3;
        
        this.lpfilterleft.update_coeffecients(FilterType.LowPass, SAMPLERATE,
            filterenv * 3000, Q_BUTTERWORTH);
        this.lpfilterright.update_coeffecients(FilterType.LowPass, SAMPLERATE,
            filterenv * 3000, Q_BUTTERWORTH);
                    
        let left = env* this.squareoscillatorl.next();
        left = this.shaper.process(left);
        left = this.lpfilterleft.process(left);

        let right = env* this.squareoscillatorr.next();
        right = this.shaper.process(right);
        right = this.lpfilterright.process(right);

        this.signal.left = left;
        this.signal.right = right;  
    } 
}
  