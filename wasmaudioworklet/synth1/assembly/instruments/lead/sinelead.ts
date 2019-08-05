
import { SAMPLERATE } from '../../environment';
import { StereoSignal } from '../../synth/stereosignal.class';
import { Envelope } from '../../synth/envelope.class';

import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../../synth/biquad';
import { Noise } from '../../synth/noise.class';
import { BandPass } from '../../fx/bandpass';
import { SawOscillator } from '../../synth/sawoscillator.class';
import { notefreq } from '../../synth/note';
import { SineOscillator } from '../../synth/sineoscillator.class';

export class SineLead {
    private _note: f32;
    

    readonly osc: SineOscillator = new SineOscillator();
    readonly osc2: SineOscillator = new SineOscillator();
    
    readonly env1: Envelope = new Envelope(0.02, 0.15, 0.05, 0.3);
    
    readonly signal: StereoSignal = new StereoSignal();

    constructor() {
       
    }

    set note(note: f32) {        
        if(note > 1) { 
            this.osc.frequency = notefreq(note) * 2;
            this.osc2.frequency = notefreq(note);
            this._note = note;
            this.env1.attack();           
        } else {
            this.env1.release();            
        }
        
    }

    get note(): f32 {
        return this._note;
    }

    next(): void {        
        const env1: f32 = this.env1.next();
                
        let osc: f32 = this.osc.next();
        let osc2: f32 = this.osc2.next() * 0.2 * env1;
        osc *= env1;

        const pan = this._note / 127;

        this.signal.left = osc * pan + osc2 * (1-pan);
        this.signal.right = osc * (1 - pan) + osc2 * pan;
        
        
    } 
}
  