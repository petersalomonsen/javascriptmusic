import { StereoSignal } from '../../synth/stereosignal.class';
import { Envelope } from '../../synth/envelope.class';
import { Noise } from '../../synth/noise.class';
import { BandPass } from '../../fx/bandpass';
import { notefreq } from '../../synth/note';
import { SquareOscillator } from '../../synth/squareoscillator.class';
import { SineOscillator } from '../../synth/sineoscillator.class';

export class SubPiano {
    private _note: f32;
    private pan: f32;

    readonly lfo: SineOscillator = new SineOscillator();
    readonly osc: SquareOscillator = new SquareOscillator();
    readonly env1: Envelope = new Envelope(0.02, 1.5, 0.1, 0.4);
    readonly bp1: BandPass = new BandPass(200, 350);
    readonly env2: Envelope = new Envelope(0.01, 0.6, 0.02, 0.2);
    readonly bp2: BandPass = new BandPass(3000, 7000);    
    
    readonly env3: Envelope = new Envelope(0.01, 0.1, 0.00, 0.1);
    readonly bp3: BandPass = new BandPass(10, 150);    
    
    readonly signal: StereoSignal = new StereoSignal();

    constructor() {
       
    }

    set note(note: f32) {        
        if(note > 1) {            
            let freq : f32 = notefreq(note);
            this.osc.frequency = freq;
            this.lfo.frequency = 5.0;
            this.pan = note / 128.0;

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
                
        let osc: f32 = this.osc.next();
        
        const lfo: f32 = this.lfo.next();
        const filterlfo = lfo + 1;
        const panlfo = lfo * 0.2 + 1;
        const freq: f32 = this.osc.frequency;
        this.bp1.update_frequencies(freq, freq + filterlfo * 30);
        this.bp2.update_frequencies(freq * 1.5, freq * 1.5 + filterlfo * 300);
        this.bp3.update_frequencies(freq * 2.25, freq * 2.25  + filterlfo * 800);
        
        let sig1 = this.bp1.process(osc) * env1 * 12;
        let sig2 = this.bp2.process(osc) * env2 * 6;
        let sig3 = this.bp3.process(osc) * env3 * 10;

        this.signal.left = this.pan * (sig1 * panlfo + sig2 * 0.8 * -panlfo + sig3 * panlfo);
        this.signal.right = 1 - this.pan * (sig1 * 0.8 * -panlfo + sig2 * panlfo + sig3 - panlfo * 0.2);
    } 
}
  