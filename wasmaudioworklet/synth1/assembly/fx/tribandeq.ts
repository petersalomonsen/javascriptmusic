import { EQBand } from "./eqband";

export class TriBandEQ {
    
    lowerband: EQBand;
    midband: EQBand;
    hiband: EQBand;

    constructor(low: f32, midlo: f32, midhi: f32, high: f32) {
        this.lowerband = new EQBand(low, midlo);
        this.midband = new EQBand(midlo, midhi);
        this.hiband = new EQBand(midhi, high);
    }

    process(signal: f32, lolevel: f32, midlevel: f32, hilevel: f32): f32 {
        return this.lowerband.process(signal) * lolevel +
                this.midband.process(signal) * midlevel +
                this.hiband.process(signal) * hilevel;
    }
}