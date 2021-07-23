import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from "../synth/biquad";
import { SAMPLERATE } from "../environment";

export class BandPass {
    lpfilter: BiQuadFilter = new BiQuadFilter();
    hpfilter: BiQuadFilter = new BiQuadFilter();
    
    constructor(lowfreq: f32, hifreq: f32) {
        this.update_frequencies(lowfreq, hifreq);
    }

    clearBuffers(): void {
        this.hpfilter.clearBuffers();
        this.lpfilter.clearBuffers();
    }

    update_frequencies(lowfreq: f32, hifreq: f32): void {
        this.lpfilter.update_coeffecients(FilterType.LowPass, SAMPLERATE, hifreq, Q_BUTTERWORTH);
        this.hpfilter.update_coeffecients(FilterType.HighPass, SAMPLERATE, lowfreq, Q_BUTTERWORTH);
    }

    process(sample: f32): f32 {
        return this.lpfilter.process(this.hpfilter.process(sample));                
    }
}