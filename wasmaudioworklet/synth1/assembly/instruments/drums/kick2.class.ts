
import { StereoSignal } from '../../synth/stereosignal.class';
import { Envelope } from '../../synth/envelope.class';
import { Noise } from '../../synth/noise.class';
import { BandPass } from '../../fx/bandpass';
import { Instrument } from '../instrument.class';

export class Kick2 extends Instrument {
    private velocity: f32;
    
    readonly noise: Noise = new Noise();
    
    readonly env2: Envelope = new Envelope(0.001, 0.01, 0.0, 1);
    readonly bp2: BandPass = new BandPass(4000, 5000);    
    
    readonly env3: Envelope = new Envelope(0.001, 0.1, 0.05, 0.1);
    readonly bp3: BandPass = new BandPass(10, 100);

    set note(note: f32) {        
        if(note > 1) {            
            this.velocity = note / 16;    
            this.env2.attack();        
            this.env3.attack();  
        } else {
            
            this.env2.release();            
            this.env3.release();            
        }
    }

    next(): void {
        let env2: f32 = this.env2.next();
        let env3: f32 = this.env3.next();
                
        let osc: f32 = this.noise.next();
        
        
        let sig2 = this.bp2.process(osc) * env2 ;
        let sig3 = this.bp3.process(osc) * env3 * 8;

        this.signal.left = this.velocity * (-sig2  + sig3);
        this.signal.right = this.velocity * ( + sig2 - sig3);        
    } 
}
  