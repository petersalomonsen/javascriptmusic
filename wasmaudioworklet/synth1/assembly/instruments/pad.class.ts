
import { SAMPLERATE } from '../environment';
import { StereoSignal } from '../synth/stereosignal.class';
import { Envelope } from '../synth/envelope.class';
import { SawOscillator } from '../synth/sawoscillator.class';
import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../synth/biquad';
import { notefreq } from '../synth/note';
import { WaveShaper } from '../synth/shaper';



export class Pad {
    private _note: f32;
    readonly envelope: Envelope = new Envelope(0.05, 0.6, 0.75, 0.3);
    readonly filterenvelope: Envelope = new Envelope(0.06, 0.6, 0.3, 0.3);
    readonly hipassfilterenvelope: Envelope = new Envelope(0.02, 3, 0.2, 2.0);
    readonly sawoscillator: SawOscillator = new SawOscillator();
    readonly sawoscillator2: SawOscillator = new SawOscillator();
    readonly sawoscillator3: SawOscillator = new SawOscillator();
    readonly sawoscillator4: SawOscillator = new SawOscillator();
    readonly sawoscillator5: SawOscillator = new SawOscillator();
    
    readonly filter: BiQuadFilter = new BiQuadFilter();
    readonly hipassfilterl: BiQuadFilter = new BiQuadFilter();
    readonly hipassfilterr: BiQuadFilter = new BiQuadFilter();
    readonly signal: StereoSignal = new StereoSignal();

    set note(note: f32) {        
        if(note > 1) {            
            this.sawoscillator.frequency = notefreq(note);
            this.sawoscillator2.frequency = notefreq(note + 0.05);
            this.sawoscillator3.frequency = notefreq(note - 0.05);
            this.sawoscillator4.frequency = notefreq(note + 0.1);
            this.sawoscillator5.frequency = notefreq(note - 0.1);
            
            this.envelope.attack();           
            this.filterenvelope.attack();             
            this.hipassfilterenvelope.attack();         
        } else {
            this.envelope.release();
            this.filterenvelope.release();
            this.hipassfilterenvelope.release();   
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
        let osc: f32 = this.sawoscillator.next();
        let osc2: f32 = this.sawoscillator2.next();
        let osc3: f32 = this.sawoscillator3.next();
        let osc4: f32 = this.sawoscillator4.next();
        let osc5: f32 = this.sawoscillator5.next();
        
        let left = env * (osc + osc2 + osc5);
        let right = env * (osc + osc3 + osc4 );

        this.filter.update_coeffecients(FilterType.LowPass, SAMPLERATE, 
            200 + this.filterenvelope.next() * 18000, 0.2);
        let hpfilterfreq: f32 = 0 + (1-this.hipassfilterenvelope.next()) * 500;
        this.hipassfilterl.update_coeffecients(FilterType.HighPass, SAMPLERATE, 
            hpfilterfreq, 0.3);
        this.hipassfilterr.update_coeffecients(FilterType.HighPass, SAMPLERATE, 
            hpfilterfreq, 0.3);
        
        this.signal.left = this.hipassfilterl.process(this.filter.process(left ));
        this.signal.right = this.hipassfilterr.process(this.filter.process(right ));
    } 
}
  