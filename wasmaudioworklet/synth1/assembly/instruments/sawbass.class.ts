
import { SAMPLERATE } from '../environment';
import { SineOscillator } from '../synth/sineoscillator.class';
import { StereoSignal } from '../synth/stereosignal.class';
import { Envelope } from '../synth/envelope.class';
import { SawOscillator } from '../synth/sawoscillator.class';
import { Noise } from '../synth/noise.class';
import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../synth/biquad';
import { notefreq } from '../synth/note';


export class SawBass {
    private _note: f32;
    readonly envelope: Envelope = new Envelope(0.01, 0.2, 0.8, 0.2);
    readonly sawoscillator: SawOscillator = new SawOscillator();
    readonly sawoscillator2: SawOscillator = new SawOscillator();
    readonly filter: BiQuadFilter = new BiQuadFilter();
    readonly hpfilterl: BiQuadFilter = new BiQuadFilter();
    readonly hpfilterr: BiQuadFilter = new BiQuadFilter();
    
    readonly signal: StereoSignal = new StereoSignal();

    constructor() {
        this.hpfilterl.update_coeffecients(FilterType.HighPass, SAMPLERATE, 35, Q_BUTTERWORTH);
        this.hpfilterr.update_coeffecients(FilterType.HighPass, SAMPLERATE, 35, Q_BUTTERWORTH);
    }

    set note(note: f32) {        
        if(note > 1) {            
            this.sawoscillator.frequency = notefreq(note + 0.1);
            this.sawoscillator2.frequency = notefreq(note - 0.1);
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
        if(env === 0) {
            this.signal.clear();
            return;
        }
        // this.signal.clear();
        this.signal.left /= 1.03; // feedback
        this.signal.right /= 1.03; // feedback
        this.signal.addMonoSignal(
            this.hpfilterl.process(this.sawoscillator.next() * env), 0.3, 0.3
        );
        this.signal.addMonoSignal(
            this.hpfilterr.process(this.sawoscillator2.next() * env), 0.3, 0.7
        );
    } 
}
  