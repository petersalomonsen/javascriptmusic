import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from "../synth/biquad";
import { SAMPLERATE } from "../environment";

export class EQBand {
    lpfilter: BiQuadFilter = new BiQuadFilter();
    hpfilter: BiQuadFilter = new BiQuadFilter();
    lpfilter2: BiQuadFilter = new BiQuadFilter();
    hpfilter2: BiQuadFilter = new BiQuadFilter();
    
    
    constructor(lowfreq: f32, hifreq: f32) {
        this.lpfilter.update_coeffecients(FilterType.LowPass, SAMPLERATE, hifreq, Q_BUTTERWORTH);
        this.lpfilter2.update_coeffecients(FilterType.LowPass, SAMPLERATE, hifreq, Q_BUTTERWORTH);
        this.hpfilter.update_coeffecients(FilterType.HighPass, SAMPLERATE, lowfreq, Q_BUTTERWORTH);
        this.hpfilter2.update_coeffecients(FilterType.HighPass, SAMPLERATE, lowfreq, Q_BUTTERWORTH);        
    }

    process(left: f32): f32 {
        return this.lpfilter2.process(this.lpfilter.process(this.hpfilter2.process(this.hpfilter.process(left))));                
    }
}