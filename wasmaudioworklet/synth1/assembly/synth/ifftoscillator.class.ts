
import { SAMPLERATE } from '../environment';
import { FFT } from '../math/fft';

export class IFFTOscillator {
    position: f32 = 0;
    positionincrement: f32 = 0;
    buffersize: f32;
    buffermask: u32;
    fft: FFT;
    scalefactor: f32;

    constructor(buffersize_shift: i32) {
        this.fft = new FFT(buffersize_shift);
        this.buffersize = (1 << buffersize_shift) as f32;
        this.buffermask = ~(0xffffffff << buffersize_shift);
        this.scalefactor = (this.buffersize / 2) - 1;
    }

    set frequency(frequency: f32) {
        this.positionincrement = (frequency * this.buffersize) / SAMPLERATE;
    }

    createWave(real: f32[], imaginary: f32[]): void {        
        for (let n = 1; n <= real.length &&
                n <= imaginary.length &&
                n < (this.fft.buffer.length / 2) - 1; n++) {
            this.fft.buffer[n].re = -real[n - 1] * this.scalefactor;
            this.fft.buffer[this.fft.buffer.length - n].re = real[n -1] * this.scalefactor;

            this.fft.buffer[n].im = -imaginary[n -1] * this.scalefactor;
            this.fft.buffer[this.fft.buffer.length - n].im = imaginary[n -1] * this.scalefactor;
        }
    }

    next(): f32 {
        const bufferposfloor = NativeMathf.floor(this.position);
        const bufferpos = bufferposfloor as i32;
        const t = this.position - bufferposfloor;

        const x0 = this.fft.buffer[(bufferpos - 1) & this.buffermask].re;
        const x1 = this.fft.buffer[bufferpos].re;
        const x2 = this.fft.buffer[(bufferpos + 1) & this.buffermask].re;
        const x3 = this.fft.buffer[(bufferpos + 2) & this.buffermask].re;
        
        // cubic interpolation
                
        const a0 = x3 - x2 - x0 + x1;
        const a1 = x0 - x1 - a0;
        const a2 = x2 - x0;
        const a3 = x1;
        const ret = (a0 * (t * t * t)) + (a1 * (t * t)) + (a2 * t) + (a3);

        // increment position
        this.position += this.positionincrement;
        this.position %= this.buffersize;
        
        return ret;    
    }
}
