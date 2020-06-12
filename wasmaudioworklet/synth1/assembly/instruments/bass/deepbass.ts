
import { SAMPLERATE } from '../../environment';

import { StereoSignal } from '../../synth/stereosignal.class';
import { Envelope } from '../../synth/envelope.class';
import { SawOscillator } from '../../synth/sawoscillator.class';

import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../../synth/biquad';
import { notefreq } from '../../synth/note';

import { Instrument } from '../instrument.class';

export class DeepBass extends Instrument {
    readonly envelope: Envelope = new Envelope(0.01, 0.2, 0.70, 0.2);
    readonly filterenv: Envelope = new Envelope(0.01, 0.4, 0.0, 0.2);
    readonly sawoscillator: SawOscillator = new SawOscillator();
    readonly sawoscillator2: SawOscillator = new SawOscillator();
    readonly filter: BiQuadFilter = new BiQuadFilter();
    readonly hpfilterl: BiQuadFilter = new BiQuadFilter();
    readonly hpfilterr: BiQuadFilter = new BiQuadFilter();
    
    readonly lpfilterl: BiQuadFilter = new BiQuadFilter();
    readonly lpfilterr: BiQuadFilter = new BiQuadFilter();

    constructor() {
        super();
        this.hpfilterl.update_coeffecients(FilterType.HighPass, SAMPLERATE, 35, Q_BUTTERWORTH);
        this.hpfilterr.update_coeffecients(FilterType.HighPass, SAMPLERATE, 35, Q_BUTTERWORTH);   
    }

    set note(note: f32) {        
        if(note > 1) {            
            this.sawoscillator.frequency = notefreq(note + 0.1) / 2;
            this.sawoscillator2.frequency = notefreq(note - 0.1) / 2;
            this.envelope.attack();   
            this.filterenv.attack();                     
        } else {
            this.envelope.release();
            this.filterenv.release();
        }
    }

    next(): void {        
        let env: f32 = this.envelope.next();
        if(env === 0) {
            this.signal.clear();
            return;
        }
        // this.signal.clear();
        let filterenv = this.filterenv.next();
        this.signal.left *= 0.9 * env; // feedback
        this.signal.right *= 0.9 * env; // feedback
        this.lpfilterl.update_coeffecients(FilterType.LowPass, SAMPLERATE, 300 + (100 * filterenv), Q_BUTTERWORTH);
        this.lpfilterr.update_coeffecients(FilterType.LowPass, SAMPLERATE, 300 + (100 * filterenv), Q_BUTTERWORTH);
        
        this.signal.addMonoSignal(
            this.lpfilterl.process(this.hpfilterl.process(this.sawoscillator.next() * env)), 0.3, 0.3
        );
        this.signal.addMonoSignal(
            this.lpfilterr.process(this.hpfilterr.process(this.sawoscillator2.next() * env)), 0.3, 0.7
        );
    } 
}
  