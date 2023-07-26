export class DelayLine {
    readonly bufferPointer: usize;
    index: usize = 0;
    length: usize = 0;
    currentPeak: f32 = 0;
    currentPeakSamplesToLive: usize = 0;

    private numsamplesf64: f64 = 0
    private meanSquared: f64 = 0;

    constructor(private numsamples: usize) {
        this.numsamplesf64 = numsamples as f64;
        this.length = numsamples * 4 as usize;
        this.bufferPointer = __new(this.length, 0);
    }

    read(): f32 {
        return load<f32>(this.bufferPointer + this.index);
    }

    calculateRMS(): f32 {
        let ndx = this.index;
        let bufferPointer = this.bufferPointer;

        let leastrecentsample: f64 = load<f32>(bufferPointer + ndx) as f64;
        if (ndx === 0) {
            ndx = this.length;
        }
        ndx -= 4;
        let mostrecentsample: f64 = load<f32>(bufferPointer + ndx) as f64;

        let meanSquared: f64 = this.meanSquared;
        let numSamples: f64 = this.numsamplesf64;
        meanSquared += ((mostrecentsample * mostrecentsample) / numSamples);
        meanSquared -= ((leastrecentsample * leastrecentsample) / numSamples);
        this.meanSquared = meanSquared;

        return Math.sqrt(meanSquared) as f32;
    }

    getPeakValue(): f32 {
        let ndx = this.index;
        if (ndx === 0) {
            ndx = this.length;
        }
        ndx -= 4;
        let mostrecentsample: f32 = load<f32>(this.bufferPointer + ndx) as f32;
        if (mostrecentsample < 0) {
            mostrecentsample = -mostrecentsample;
        }
        if (mostrecentsample > this.currentPeak) {
            this.currentPeak = mostrecentsample;
            this.currentPeakSamplesToLive = this.numsamples;
        } else if (this.currentPeakSamplesToLive > 0) {
            this.currentPeakSamplesToLive--;
            if (this.currentPeakSamplesToLive === 0) {
                this.currentPeak = this.calculatePeakValue();
            }
        }
        return this.currentPeak;
    }

    private calculatePeakValue(): f32 {
        let peak: f32 = 0.0;
        for (let i: usize = 0; i < this.length; i += 4) {
            let value = load<f32>(this.bufferPointer + i);
            if (value < 0) {
              value = -value;
            }
            if (value > peak) {
                peak = value;
            }
        }
        return peak;
    }

    write_and_advance(value: f32): void {
        store<f32>(this.bufferPointer + this.index, value);

        if (this.index === this.length - 4) {
            this.index = 0;
        } else {
            this.index += 4;
        }
    }
}

export class MonoCompressor {
    delay: DelayLine;

    gain: f64 = 1.0;
    targetgain: f64 = 1.0;
    gainChangePerSample: f64 = 0;
    delaybuffersamplecount: f64;

    constructor(numsamples: usize) {
        this.delaybuffersamplecount = numsamples as f64;
        this.delay = new DelayLine(numsamples);
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
            this.gainChangePerSample = (currentTargetGain - currentGain) / this.delaybuffersamplecount;
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

const COMPRESSOR_DELAY = 0.05;
export class TriBandStereoCompressor {
    lowerbandl: EQBand;    
    midbandl: EQBand;    
    hibandl: EQBand;
    
    lowerbandr: EQBand;    
    midbandr: EQBand;    
    hibandr: EQBand;
    
    compressorLow: StereoCompressor = new StereoCompressor((SAMPLERATE * COMPRESSOR_DELAY) as usize);
    compressorMid: StereoCompressor = new StereoCompressor((SAMPLERATE * COMPRESSOR_DELAY) as usize);
    compressorHigh: StereoCompressor = new StereoCompressor((SAMPLERATE * COMPRESSOR_DELAY) as usize);

    stereosignal: StereoSignal = new StereoSignal();

    constructor(low: f32, midlo: f32, midhi: f32, high: f32) {
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