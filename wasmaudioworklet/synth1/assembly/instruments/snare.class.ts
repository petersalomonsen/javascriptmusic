
import { SAMPLERATE } from '../environment';
import { StereoSignal } from '../synth/stereosignal.class';
import { Envelope } from '../synth/envelope.class';
import { SawOscillator } from '../synth/sawoscillator.class';
import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../synth/biquad';
import { Noise } from '../synth/noise.class';
import { Instrument } from './instrument.class';

export class Snare extends Instrument {
    private velocity: f32;
    readonly envelope: Envelope = new Envelope(0.01, 0.2, 0, 0.2);
    readonly hpfilterenvelope: Envelope = new Envelope(0.01, 0.5, 0.5, 0.3);
    
    readonly sawoscillator: SawOscillator = new SawOscillator();
    readonly noise: Noise = new Noise();
    
    readonly hpfilter: BiQuadFilter = new BiQuadFilter();
    readonly lpfilter: BiQuadFilter = new BiQuadFilter();

    constructor() {
        super();
        this.lpfilter.update_coeffecients(FilterType.LowPass, SAMPLERATE, 
           13000 , Q_BUTTERWORTH);
    }

    set note(note: f32) {        
        if(note > 1) {            
            this.sawoscillator.frequency = 200;
            this.velocity = note / 16;    
            this.envelope.attack();           
            this.hpfilterenvelope.attack();        
        } else {
            this.envelope.release();
            this.hpfilterenvelope.release();
        }
    }

    next(): void {        
        let env: f32 = this.envelope.next();
        if(env === 0) {
            this.signal.clear();
            return;
        }
        this.sawoscillator.frequency = 20.0 + (env * 200.0);
        
                
        this.hpfilter.update_coeffecients(FilterType.HighPass, SAMPLERATE, 
            20000 - (19900 * this.hpfilterenvelope.next()) , Q_BUTTERWORTH);

        let osc1: f32 = this.sawoscillator.next() * 0.6 + this.noise.next();
        osc1= this.hpfilter.process(osc1);
        osc1 = this.lpfilter.process(osc1);

        this.signal.left = this.velocity * env * osc1;
        this.signal.right = this.velocity * env * osc1;
        
        
    } 
}
  