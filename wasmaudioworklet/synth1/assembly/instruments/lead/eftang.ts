
import { SAMPLERATE } from '../../environment';
import { StereoSignal } from '../../synth/stereosignal.class';
import { Envelope } from '../../synth/envelope.class';
import { SawOscillator } from '../../synth/sawoscillator.class';
import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../../synth/biquad';
import { Noise } from '../../synth/noise.class';
import { BandPass } from '../../fx/bandpass';
import { SawOscillator } from '../../synth/sawoscillator.class';
import { notefreq } from '../../synth/note';
import { SineOscillator } from '../../synth/sineoscillator.class';

export class Eftang {
    private _note: f32;
    

    readonly lfo: SineOscillator = new SineOscillator();
    readonly osc: SawOscillator = new SawOscillator();
    readonly osc2: SawOscillator = new SawOscillator();
    readonly osc3: SawOscillator = new SawOscillator();
    
    readonly noise: Noise = new Noise();
    readonly env1: Envelope = new Envelope(0.001, 1.0, 0.8, 0.3);
    readonly bp1: BandPass = new BandPass(200, 350);
    readonly env2: Envelope = new Envelope(0.1, 0.2, 0.5, 1);
    readonly bp2: BandPass = new BandPass(3000, 7000);    
    
    readonly env3: Envelope = new Envelope(0.001, 0.3, 0.1, 0.1);
    readonly bp3: BandPass = new BandPass(10, 150);    
    
    readonly signal: StereoSignal = new StereoSignal();

    constructor() {
       
    }

    set note(note: f32) {        
        if(note > 1) {            
            this.osc.frequency = notefreq(note);
            this.osc2.frequency = notefreq(note - 0.1);
            this.osc3.frequency = notefreq(note + 0.1);
            this.lfo.position = 0;
            this.lfo.frequency = 4;
            
            this.env1.attack();           
            this.env2.attack();        
            this.env3.attack();  
        } else {
            this.env1.release();
            this.env2.release();            
            this.env3.release();            
        }
        this._note = note;
    }

    get note(): f32 {
        return this._note;
    }

    next(): void {        
        const env1: f32 = this.env1.next();
        const env2: f32 = this.env2.next();
        const env3: f32 = this.env3.next();
                
        const osc: f32 = this.osc.next() + this.osc2.next() + this.osc3.next();
        
        const lfo = this.lfo.next() + 1;
        const basefreq = this.osc.frequency;
        this.bp1.update_frequencies(20, basefreq + 1);
        this.bp2.update_frequencies(basefreq * 1.5,basefreq * 1.6);
        this.bp3.update_frequencies(basefreq * 12, 8000 + (lfo * 5000));
        const noise = this.noise.next();

        const sig1 = this.bp1.process(osc) * env1;
        const sig2 = this.bp2.process(osc) * env2;
        const sig3 = this.bp3.process(osc +  noise * 0.2) * env3;

        this.signal.left = (sig1 + sig3);
        this.signal.right = ( sig1 + sig2 );
        
        
    } 
}
  