
import { SAMPLERATE } from '../../environment';
import { StereoSignal } from '../../synth/stereosignal.class';
import { Envelope } from '../../synth/envelope.class';

import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../../synth/biquad';

import { SineOscillator } from '../../synth/sineoscillator.class';
import { notefreq } from '../../synth/note';
import { SawOscillator } from '../../synth/sawoscillator.class';

export class BrassyLead {
    private _note: f32;
    
    readonly osc: SineOscillator = new SineOscillator();
    readonly osc2: SawOscillator = new SawOscillator();
    
    readonly env1: Envelope = new Envelope(0.01, 0.1, 0.4, 0.3);
    
    readonly filterenv: Envelope = new Envelope(0.01, 0.1, 0.1, 0.3);
    
    readonly lopass: BiQuadFilter = new BiQuadFilter();
    readonly signal: StereoSignal = new StereoSignal();

    constructor() {
       
    }

    set note(note: f32) {        
        if(note > 1) { 
            this.osc.frequency = notefreq(note);
            this.osc2.frequency = notefreq(note);
            this._note = note;
            this.env1.attack();
            
            this.filterenv.attack();           
        } else {
            this.env1.release();  
            
            this.filterenv.release();          
        }
        
    }

    get note(): f32 {
        return this._note;
    }

    next(): void {        
        const env1: f32 = this.env1.next();
        if(env1 === 0) {
            this.signal.clear();
            return;
        }
        
        let osc: f32 = this.osc.next() * 0.05;
        let osc2: f32 = this.osc2.next() * env1 * 0.2;

        const pan = this._note / 127;

        let sig = osc + osc2;

        const filterenv = this.filterenv.next();
        this.lopass.update_coeffecients(FilterType.LowPass, SAMPLERATE, 
            (14000 * filterenv) , Q_BUTTERWORTH);
        sig = this.lopass.process(sig);
        
        this.signal.left = sig;
        this.signal.right = sig;
        
        
    } 
}
  