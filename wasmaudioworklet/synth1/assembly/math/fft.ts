/**
 * Originally ported from http://rosettacode.org/wiki/Fast_Fourier_transform#C_sharp
 * 
 * Optimized by reusing Complex objects instead of creating new, avoiding garbage collection
 * Precalculating of twiddles, making reuse of the FFT instance faster 
 */ 


export class Complex {
    re: f32 = 0;
    im: f32 = 0;
 
    public clone(b: Complex): void {
        this.re = b.re;
        this.im = b.im;
    }

    public add(b: Complex): void {
        this.re += b.re;
        this.im += b.im;
    }
 
    public sub(b: Complex): void {
        this.re -= b.re;
        this.im -= b.im;
    }
 
    public mult(b: Complex): void {
        const re: f32 = this.re;

        this.re = re * b.re - this.im * b.im;
        this.im = re * b.im + this.im * b.re;
    }

    public scale(n: f32): void {
        this.re *= n;
        this.im *= n;
    }

    public conjugate(): void {
        this.im = -this.im;
    }
}

function bitReverse(n: i32, bits: i32): i32 {
    let reversedN: i32 = n;
    let count: i32 = bits - 1;

    n >>= 1;
    while (n > 0) {
        reversedN = (reversedN << 1) | (n & 1);
        count--;
        n >>= 1;
    }

    return ((reversedN << count) & ((1 << bits) - 1));
}
 
/* Uses Cooley-Tukey iterative in-place algorithm with radix-2 DIT case
 * assumes no of points provided are a power of 2 */
export class FFT {
    buffer: StaticArray<Complex>;
    bits: i32;
    exps: StaticArray<Complex>;
    tmp: Complex = new Complex();

    /**
     * 
     * @param buffersize_shift buffersize will be 2^buffersize_shift
     */
    constructor(buffersize_shift: i32) {
        const buffersize = 1 << buffersize_shift;
        const buffer = new StaticArray<Complex>(buffersize);
        for (let n=0;n<buffersize;n++) {
            buffer[n] = new Complex();
        }
        this.buffer = buffer;
        this.bits = buffersize_shift;
        
        this.exps = new StaticArray<Complex>((
                    buffersize as f32 *
                    NativeMathf.log2(buffersize as f32)
                ) as i32);

        let expsIndex = 0;
        for (let N: i32 = 2; N <= buffer.length; N <<= 1) {
            for (let i: i32 = 0; i < buffer.length; i += N) {
                for (let k: i32 = 0; k < (N >> 1); k++) {
                    const term: f32 = -2 * NativeMathf.PI * (k as f32) / (N as f32);
                    const exp: Complex = new Complex();
                    exp.re = NativeMathf.cos(term);
                    exp.im = NativeMathf.sin(term);
                    this.exps[expsIndex++] = exp;
                }
            }
        }
    }

    calculateInverse(): void {
        const N = this.buffer.length;
        const iN: f32 = 1 / (N as f32);

        for (let n=0;n<N;n++) {
            this.buffer[n].conjugate();
        }
        this.calculate();
        for (let n=0;n<N;n++) {
            this.buffer[n].conjugate();
            this.buffer[n].scale(iN);
        }
    }

    calculate(): void {
        const buffer = this.buffer;
        const bits = this.bits;

        for (let j = 1; j < buffer.length; j++) {
            const swapPos: i32 = bitReverse(j, bits);
            if (swapPos <= j) {
                continue;
            }
            const temp = buffer[j];
            buffer[j] = buffer[swapPos];
            buffer[swapPos] = temp;
        }

        let expsIndex = 0;
        for (let N: i32 = 2; N <= buffer.length; N <<= 1) {
            for (let i: i32 = 0; i < buffer.length; i += N) {
                for (let k: i32 = 0; k < (N >> 1); k++) {
                    const evenIndex = i + k;
                    const oddIndex = i + k + (N >> 1);
                    const even = buffer[evenIndex];
                    const odd = buffer[oddIndex];
                    const exp = this.tmp;
                    exp.clone(this.exps[expsIndex++]);

                    exp.mult(odd);

                    odd.clone(even);
                    even.add(exp);
                    odd.sub(exp);
                }
            }
        }
    }
}

export function createFFT(buffersize_shift: i32): usize {
    return changetype<usize>(new FFT(buffersize_shift));
}

export function setComplex(instance: usize, arrayIndex: i32, re: f32, im: f32): void {
    const buffer = changetype<FFT>(instance).buffer;
    buffer[arrayIndex].re = re;
    buffer[arrayIndex].im = im;
}

export function getComplexRe(instance: usize, arrayIndex: i32): f32 {
    return changetype<FFT>(instance).buffer[arrayIndex].re;
}

export function getComplexIm(instance: usize, arrayIndex: i32): f32 {
    return changetype<FFT>(instance).buffer[arrayIndex].im;
}

export function calculateFFT(instance: usize): void {
    changetype<FFT>(instance).calculate();
}

export function calculateIFFT(instance: usize): void {
    changetype<FFT>(instance).calculateInverse();
}