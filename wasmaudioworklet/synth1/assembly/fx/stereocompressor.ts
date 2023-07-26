import { StereoSignal } from "../synth/stereosignal.class";
import { MonoCompressor } from "./monocompressor";

export class StereoCompressor {
    leftCompressor: MonoCompressor;
    rightCompressor: MonoCompressor;

    resultSignal: StereoSignal = new StereoSignal();
    
    constructor(numsamples: usize) {
        this.leftCompressor = new MonoCompressor(numsamples);
        this.rightCompressor = new MonoCompressor(numsamples);
    }

    process(left: f32, right: f32, threshold: f32, makeupgain: f32): void {
        this.resultSignal.left = this.leftCompressor.process(left, threshold, makeupgain);
      	this.resultSignal.right = this.rightCompressor.process(right, threshold, makeupgain);        
    }
}
