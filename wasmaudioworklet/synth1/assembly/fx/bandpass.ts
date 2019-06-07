import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from "../synth/biquad";
import { SAMPLERATE } from "../environment";

export class BandPass {
    lpfilter: BiQuadFilter = new BiQuadFilter();
    hpfilter: BiQuadFilter = new BiQuadFilter();
    
    
    constructor(lowfreq: f32, hifreq: f32) {
        this.lpfilter.update_coeffecients(FilterType.LowPass, SAMPLERATE, hifreq, Q_BUTTERWORTH);
        this.hpfilter.update_coeffecients(FilterType.HighPass, SAMPLERATE, lowfreq, Q_BUTTERWORTH);    
    }

    process(sample: f32): f32 {
        return this.lpfilter.process(this.hpfilter.process(sample));                
    }
}