import { DelayLine } from "./delayline";
import { SAMPLERATE } from "../environment";
import { StereoSignal } from "../synth/stereosignal.class";

export class StereoCompressor {
    leftDelay: DelayLine;
    rightDelay: DelayLine;

    resultSignal: StereoSignal = new StereoSignal();

    gain: f64 = 1.0;
    targetgain: f64 = 1.0;
    gainChangePerSample: f64 = 0;
    delaybuffersamplecount: f64;

    constructor(numsamples: usize) {
        this.delaybuffersamplecount = numsamples as f64;

        this.leftDelay = new DelayLine(numsamples);
        this.rightDelay = new DelayLine(numsamples);
    }

    process(left: f32, right: f32, threshold: f32, makeupgain: f32): void {
        this.leftDelay.write_and_advance(left);
        this.rightDelay.write_and_advance(right);

        let currentTargetGain: f64 = this.targetgain;
        let currentGain: f64 = this.gain;
        
        let leftpeak: f64 = this.leftDelay.getPeakValue();
        let rightpeak: f64 = this.rightDelay.getPeakValue();

        let peak: f64 = leftpeak > rightpeak ? leftpeak : rightpeak;

        if(peak > threshold) {
            let targetGain = threshold / peak;

            if(targetGain !== currentTargetGain) {
                currentTargetGain = targetGain;
                this.targetgain = targetGain;

                this.gainChangePerSample = (currentTargetGain - currentGain) / this.delaybuffersamplecount;
            }   
        } else if(currentTargetGain < 1.0) {
            currentTargetGain = 1.0;
            this.targetgain = currentTargetGain;            
            this.gainChangePerSample = (currentTargetGain - currentGain) / this.delaybuffersamplecount;
        }
        
        let gainChangePerSample: f64 = this.gainChangePerSample;
        if((gainChangePerSample < 0 && currentTargetGain < currentGain) ||
            (gainChangePerSample > 0 && currentTargetGain > currentGain)) {
            currentGain += gainChangePerSample;
            this.gain = currentGain;
        }

        this.resultSignal.left = this.leftDelay.read() * currentGain as f32 * makeupgain;
        this.resultSignal.right = this.rightDelay.read() * currentGain as f32 * makeupgain;
    }
}