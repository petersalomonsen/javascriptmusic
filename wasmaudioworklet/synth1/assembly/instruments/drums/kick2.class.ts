
import { SAMPLERATE } from '../../environment';
import { StereoSignal } from '../../synth/stereosignal.class';
import { Envelope } from '../../synth/envelope.class';
import { SawOscillator } from '../../synth/sawoscillator.class';
import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../../synth/biquad';
import { Noise } from '../../synth/noise.class';
import { BandPass } from '../../fx/bandpass';

export class Kick2 {
    private _note: f32;
    private velocity: f32;
    
    readonly noise: Noise = new Noise();
    
    readonly env2: Envelope = new Envelope(0.001, 0.01, 0.01, 1);
    readonly bp2: BandPass = new BandPass(3000, 7000);    
    
    readonly env3: Envelope = new Envelope(0.001, 0.05, 0.05, 0.1);
    readonly bp3: BandPass = new BandPass(10, 150);    
    
    readonly signal: StereoSignal = new StereoSignal();

    constructor() {
       
    }

    set note(note: f32) {        
        if(note > 1) {            
            this.velocity = note / 16;    
            this.env2.attack();        
            this.env3.attack();  
        } else {
            
            this.env2.release();            
            this.env3.release();            
        }
        this._note = note;
    }

    get note(): f32 {
        return this._note;
    }

    next(): void {        
        
        let env2: f32 = this.env2.next();
        let env3: f32 = this.env3.next();
                
        let osc: f32 = this.noise.next();
        
        
        let sig2 = this.bp2.process(osc) * env2 ;
        let sig3 = this.bp3.process(osc) * env3 * 8;

        this.signal.left = this.velocity * (sig2 * 0.8 + sig3);
        this.signal.right = this.velocity * ( sig2 + sig3 * 0.8);
        
        
    } 
}
  