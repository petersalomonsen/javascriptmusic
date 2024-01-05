import { EQBand } from "./eqband";
import { StereoSignal } from "../synth/stereosignal.class";
import { StereoCompressor } from "./stereocompressor";
import { SAMPLERATE } from "../environment";

export class TriBandStereoCompressor {
    lowerbandl: EQBand;    
    midbandl: EQBand;    
    hibandl: EQBand;
    
    lowerbandr: EQBand;    
    midbandr: EQBand;    
    hibandr: EQBand;
    
    compressorLow: StereoCompressor;
    compressorMid: StereoCompressor;
    compressorHigh: StereoCompressor;

    stereosignal: StereoSignal = new StereoSignal();

    constructor(low: f32, midlo: f32, midhi: f32, high: f32, compressor_delay: f32 = 0.2) {
        this.compressorLow = new StereoCompressor((SAMPLERATE * compressor_delay) as usize);
        this.compressorMid = new StereoCompressor((SAMPLERATE * compressor_delay) as usize);
        this.compressorHigh = new StereoCompressor((SAMPLERATE * compressor_delay) as usize);

        this.lowerbandl = new EQBand(low, midlo);
        this.lowerbandr = new EQBand(low, midlo);
        
        this.midbandl = new EQBand(midlo, midhi);
        this.midbandr = new EQBand(midlo, midhi);
        
        this.hibandl = new EQBand(midhi, high);
        this.hibandr = new EQBand(midhi, high);
    }

    process(left: f32, right: f32, 
        lolevel: f32, 
        midlevel: f32, 
        hilevel: f32,
        lomakeupgain: f32,
        midmakeupgain: f32,
        himakeupgain: f32): void {
        let lowleft = this.lowerbandl.process(left);
        let midleft = this.midbandl.process(left);
        let hileft = this.hibandl.process(left);

        let lowright = this.lowerbandr.process(right);
        let midright = this.midbandr.process(right);
        let hiright = this.hibandr.process(right);

        this.compressorLow.process(lowleft,lowright,lolevel,lomakeupgain);
        this.compressorMid.process(midleft,midright,midlevel,midmakeupgain);
        this.compressorHigh.process(hileft,hiright,hilevel,himakeupgain);
        
        this.stereosignal.left = this.compressorLow.resultSignal.left + this.compressorMid.resultSignal.left + this.compressorHigh.resultSignal.left;
        this.stereosignal.right = this.compressorLow.resultSignal.right + this.compressorMid.resultSignal.right + this.compressorHigh.resultSignal.right;
    }
}