
import { SAMPLERATE } from '../../environment';
import { StereoSignal } from '../../synth/stereosignal.class';
import { Envelope } from '../../synth/envelope.class';
import { SawOscillator } from '../../synth/sawoscillator.class';
import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../../synth/biquad';
import { notefreq } from '../../synth/note';
import { SineOscillator } from '../../synth/sineoscillator.class';

export class SoftPad {
    private _note: f32;
    readonly envelope: Envelope = new Envelope(0.2, 0.6, 0.75, 0.5);
    readonly filterenvelope: Envelope = new Envelope(0.8, 1.0, 0.6, 0.5);
    readonly hipassfilterenvelope: Envelope = new Envelope(0.02, 3, 0.2, 2.0);
    readonly sawoscillator: SawOscillator = new SawOscillator();
    readonly sawoscillator2: SawOscillator = new SawOscillator();
    readonly sawoscillator3: SawOscillator = new SawOscillator();
    readonly sawoscillator4: SawOscillator = new SawOscillator();
    readonly sawoscillator5: SawOscillator = new SawOscillator();
    readonly lfo: SineOscillator = new SineOscillator();
    
    readonly filterl: BiQuadFilter = new BiQuadFilter();
    readonly filterr: BiQuadFilter = new BiQuadFilter();
    readonly signal: StereoSignal = new StereoSignal();

    set note(note: f32) {        
        if(note > 1) {            
            this.lfo.frequency = 1;
            this.lfo.position = 0;
            this.sawoscillator.frequency = notefreq(note);
            this.sawoscillator2.frequency = notefreq(note + 0.03);
            this.sawoscillator3.frequency = notefreq(note - 0.03);
            this.sawoscillator4.frequency = notefreq(note + 0.06);
            this.sawoscillator5.frequency = notefreq(note - 0.06);
            
            this.envelope.attack();           
            this.filterenvelope.attack();             
            this.hipassfilterenvelope.attack();  
            this._note = note;       
        } else {
            this.envelope.release();
            this.filterenvelope.release();
            this.hipassfilterenvelope.release();   
        }
        
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

        const lfo: f32 = this.lfo.next();

        const note = this.note;
        if(note<2) {
            return;
        }
        this.sawoscillator2.frequency = notefreq(note + 0.05 + (0.02 * lfo));
        this.sawoscillator3.frequency = notefreq(note - 0.05 - (0.02 * lfo));
        this.sawoscillator4.frequency = notefreq(note + 0.1 + (0.03 * lfo));
        this.sawoscillator5.frequency = notefreq(note - 0.1 - (0.03 * lfo));
        
        
        let osc: f32 = this.sawoscillator.next();
        let osc2: f32 = this.sawoscillator2.next();
        let osc3: f32 = this.sawoscillator3.next();
        let osc4: f32 = this.sawoscillator4.next();
        let osc5: f32 = this.sawoscillator5.next();
        
        let left = env * (osc + osc2 + osc5);
        let right = env * (osc + osc3 + osc4 );

        const filterlfo = lfo + 1;
        this.filterl.update_coeffecients(FilterType.LowPass, SAMPLERATE, 
            200 + this.filterenvelope.next() * filterlfo * 2000 + 20 * (127 - this.note), Q_BUTTERWORTH);
        
        this.filterr.update_coeffecients(FilterType.LowPass, SAMPLERATE, 
                200 + this.filterenvelope.next() * filterlfo * 2000 + 20 * (this.note), Q_BUTTERWORTH);
            
        this.signal.left = this.filterl.process(left );
        this.signal.right = this.filterr.process(right );
    } 
}
  