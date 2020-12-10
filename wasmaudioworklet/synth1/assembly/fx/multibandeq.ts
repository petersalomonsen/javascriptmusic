import { EQBand } from './eqband';
export class MultiBandEQ {
    bands: StaticArray<EQBand>;

    constructor(freqs: f32[]) {
        this.bands = new StaticArray<EQBand>(freqs.length - 1);
        for (let n = 1; n < freqs.length; n++) {
            this.bands[n - 1] = new EQBand(freqs[n - 1], freqs[n]);
        }
    }


    process(signal: f32, levels: f32[]): f32 {
        let ret: f32 = 0;
        const numbands = this.bands.length;
        for (let n = 0; n < numbands; n++) {
            ret += this.bands[n].process(signal) * levels[n];
        }
        return ret;
    }
}
