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
        this.bufferPointer = __alloc(this.length, 0);   
    }

    read(): f32 {
        return load<f32>(this.bufferPointer + this.index );
    }

    calculateRMS(): f32 {
        let ndx = this.index;
        let bufferPointer = this.bufferPointer;

        let leastrecentsample: f64 = load<f32>(bufferPointer + ndx) as f64;
        if ( ndx === 0 ) {
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
        if ( ndx === 0 ) {
            ndx = this.length;
        }
        ndx -= 4;
        let mostrecentsample: f32 = load<f32>(this.bufferPointer + ndx) as f32;
        if(mostrecentsample < 0 ) {
            mostrecentsample = -mostrecentsample;
        }
        if (mostrecentsample > this.currentPeak) {
            this.currentPeak = mostrecentsample;
            this.currentPeakSamplesToLive = this.numsamples;
        } else if(this.currentPeakSamplesToLive > 0) {
            this.currentPeakSamplesToLive --;
            if(this.currentPeakSamplesToLive === 0) {
                this.currentPeak = 0;
            }
        }
        return this.currentPeak;
    }

    write_and_advance(value: f32) :void {
        store<f32>(this.bufferPointer + this.index, value);

        if (this.index === this.length - 4) {
            this.index = 0;
        } else {
            this.index+=4;
        }
    }
}