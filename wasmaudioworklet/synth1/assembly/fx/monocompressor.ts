import { DelayLine } from "./delayline";
export class MonoCompressor {
    delay: DelayLine;

    gain: f64 = 1.0;
    targetgain: f64 = 1.0;
    gainChangePerSample: f64 = 0;
    delaybuffersamplecount: f64;
    releasesamplecount: f64;

    constructor(numsamples: usize) {
        this.delay = new DelayLine(numsamples);
        this.delaybuffersamplecount = numsamples as f64;
        this.releasesamplecount = this.delaybuffersamplecount;
    }

    setRelaseSampleCount(releasesamplecount: f64): void {
        this.releasesamplecount = releasesamplecount;
    }

    process(signal: f32, threshold: f32, makeupgain: f32): f32 {
        this.delay.write_and_advance(signal);

        let currentTargetGain: f64 = this.targetgain;
        let currentGain: f64 = this.gain;

        let peak: f64 = this.delay.getPeakValue();

        if(peak > threshold) {
            let targetGain = threshold / peak;

            if(targetGain < currentTargetGain) {
              currentTargetGain = targetGain;
              this.targetgain = targetGain;

              let newGainChangePerSample = (currentTargetGain - currentGain) / this.delaybuffersamplecount;
        
              if(newGainChangePerSample < this.gainChangePerSample) {
                  this.gainChangePerSample = newGainChangePerSample;
              }
            }   
        } else if(currentTargetGain < 1.0) {
            currentTargetGain = 1.0;
            this.targetgain = currentTargetGain;            
            this.gainChangePerSample = (currentTargetGain - currentGain) / this.releasesamplecount;
        }

        let gainChangePerSample: f64 = this.gainChangePerSample;
        if((gainChangePerSample < 0 && currentTargetGain < currentGain) ||
            (gainChangePerSample > 0 && currentTargetGain > currentGain)) {
            currentGain += gainChangePerSample;
            this.gain = currentGain;
        }

        return this.delay.read() * currentGain as f32 * makeupgain;
    }
}

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
