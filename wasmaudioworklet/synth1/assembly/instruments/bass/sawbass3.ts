
import { SAMPLERATE } from '../../environment';

import { StereoSignal } from '../../synth/stereosignal.class';
import { Envelope } from '../../synth/envelope.class';
import { SawOscillator } from '../../synth/sawoscillator.class';

import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../../synth/biquad';
import { notefreq } from '../../synth/note';
import { BandPass } from '../../fx/bandpass';


export class SawBass3 {
    private _note: f32;
    readonly envelope: Envelope = new Envelope(0.01, 0.3, 0.8, 0.2);
    readonly filterenv: Envelope = new Envelope(0.01, 0.2, 0.1, 0.2);
    readonly sawoscillator: SawOscillator = new SawOscillator();
    
    readonly filter: BiQuadFilter = new BiQuadFilter();
   
    readonly lpfilter: BiQuadFilter = new BiQuadFilter();
    readonly band1: BandPass = new BandPass(1000, 2000);
    readonly signal: StereoSignal = new StereoSignal();

    constructor() {
        
        
    }

    set note(note: f32) {        
        if(note > 1) {            
            this.sawoscillator.frequency = notefreq(note);
            
            this.envelope.attack();   
            this.filterenv.attack();                     
        } else {
            this.envelope.release();
            this.filterenv.release();
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
        
        let filterenv = this.filterenv.next();
        
        let signal = this.sawoscillator.next();
        signal *= env;
        
        this.lpfilter.update_coeffecients(FilterType.LowPass, SAMPLERATE,
                this.sawoscillator.frequency + (16 * this.sawoscillator.frequency * filterenv), Q_BUTTERWORTH);
    
        const band1freq = this.sawoscillator.frequency * 4;
        this.band1.update_frequencies(band1freq, band1freq + env * this.sawoscillator.frequency);

        let band1 = this.band1.process(signal);
        signal = this.lpfilter.process(signal);
        
        this.signal.left = signal * 2 + band1;        
        this.signal.right = signal * 2 - band1;
        
    } 
}
  