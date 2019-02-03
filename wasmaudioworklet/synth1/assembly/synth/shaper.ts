/**
 * Taken from https://github.com/hzdgopher/64klang/blob/master/Player/Player/SynthNode.cpp#L2050
 */
import { min, abs } from '../math/f32';

const NOISEGEN_B0: f32 = 0.99765014648437500;

export class WaveShaper {
    drive: f32 = 0.5;
    
    process(input: f32): f32 {     
        // clamp to -1..1 (a little less)
        let f: f32 = this.drive < NOISEGEN_B0 ? this.drive > -NOISEGEN_B0 ?
                        this.drive : -NOISEGEN_B0 : 
                        NOISEGEN_B0;

        // k = 2*amount/(1-amount);
        let v = (f+f)/(1.0-f);

        // process f(x) = (1+k)*x/(1+k*abs(x))
        return (1.0 + v) *
                    input/
                (1.0 + v * min(abs(input), 1.0));   
    }
}