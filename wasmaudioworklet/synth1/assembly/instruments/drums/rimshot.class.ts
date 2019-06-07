
import { SAMPLERATE } from '../../environment';
import { StereoSignal } from '../../synth/stereosignal.class';
import { Envelope } from '../../synth/envelope.class';
import { SawOscillator } from '../../synth/sawoscillator.class';
import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../../synth/biquad';
import { Noise } from '../../synth/noise.class';
import { BandPass } from '../../fx/bandpass';

export class Rimshot {
    private _note: f32;
    private velocity: f32;
    
    readonly noise: Noise = new Noise();
    readonly env1: Envelope = new Envelope(0.001, 1.0, 0.8, 0.3);
    readonly bp1: BandPass = new BandPass(200, 350);
    readonly env2: Envelope = new Envelope(0.001, 0.08, 0.06, 1);
    readonly bp2: BandPass = new BandPass(3000, 7000);    
    
    readonly env3: Envelope = new Envelope(0.001, 0.05, 0.01, 0.1);
    readonly bp3: BandPass = new BandPass(10, 150);    
    
    readonly signal: StereoSignal = new StereoSignal();

    constructor() {
       
    }

    set note(note: f32) {        
        if(note > 1) {            
            this.velocity = note / 16;    
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
        let env1: f32 = this.env1.next();
        let env2: f32 = this.env2.next();
        let env3: f32 = this.env3.next();
                
        let osc: f32 = this.noise.next();
        
        let sig1 = this.bp1.process(osc) * env1;
        let sig2 = this.bp2.process(osc) * env2 * 2;
        let sig3 = this.bp3.process(osc) * env3 * 16;

        this.signal.left = this.velocity * (sig1 + sig2 * 0.8 + sig3);
        this.signal.right = this.velocity * (sig1 * 0.8 + sig2 + sig3);
        
        
    } 
}
  