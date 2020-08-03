import { FFT } from "../../math/fft";

const fft = new FFT(3);
const buffer = fft.buffer;

const fft2 = new FFT(10);
const buffer2 = fft2.buffer;

describe('fft', () => {
    
    it('should transform to frequency domain', () => {
        for(let n = 0; n<8; n++) {
            fft.buffer[n].re = n >= 4 ? 0 : 1;
            fft.buffer[n].im = 0;
        }
     
        fft.calculate();

        expect<f32>(buffer[0].re).toBeCloseTo(4);
        expect<f32>(buffer[0].im).toBeCloseTo(0);

        expect<f32>(buffer[1].re).toBeCloseTo(1);
        expect<f32>(buffer[1].im).toBeCloseTo(-2.414214);

        expect<f32>(buffer[2].re).toBeCloseTo(0);
        expect<f32>(buffer[2].im).toBeCloseTo(0);

        expect<f32>(buffer[3].re).toBeCloseTo(1);
        expect<f32>(buffer[3].im).toBeCloseTo(-0.414214);

        expect<f32>(buffer[4].re).toBeCloseTo(0);
        expect<f32>(buffer[4].im).toBeCloseTo(0);

        expect<f32>(buffer[5].re).toBeCloseTo(1);
        expect<f32>(buffer[5].im).toBeCloseTo(0.414214);

        expect<f32>(buffer[6].re).toBeCloseTo(0);
        expect<f32>(buffer[6].im).toBeCloseTo(0);

        expect<f32>(buffer[7].re).toBeCloseTo(1);
        expect<f32>(buffer[7].im).toBeCloseTo(2.414214);
    });
    it('should transform back to time domain', () => {
        fft.calculateInverse();

        expect<f32>(buffer[0].re).toBeCloseTo(1);
        expect<f32>(buffer[0].im).toBeCloseTo(0);

        expect<f32>(buffer[1].re).toBeCloseTo(1);
        expect<f32>(buffer[1].im).toBeCloseTo(0);

        expect<f32>(buffer[2].re).toBeCloseTo(1);
        expect<f32>(buffer[2].im).toBeCloseTo(0);

        expect<f32>(buffer[3].re).toBeCloseTo(1);
        expect<f32>(buffer[3].im).toBeCloseTo(0);

        expect<f32>(buffer[4].re).toBeCloseTo(0);
        expect<f32>(buffer[4].im).toBeCloseTo(0);

        expect<f32>(buffer[5].re).toBeCloseTo(0);
        expect<f32>(buffer[5].im).toBeCloseTo(0);

        expect<f32>(buffer[6].re).toBeCloseTo(0);
        expect<f32>(buffer[6].im).toBeCloseTo(0);

        expect<f32>(buffer[7].re).toBeCloseTo(0);
        expect<f32>(buffer[7].im).toBeCloseTo(0);
    });
    it('should transform a larger buffer to frequency domain', () => {
        expect(buffer2.length).toBe(1024);
        for (let n=0; n<buffer2.length; n++) {
            buffer2[n].re = NativeMathf.sin(2 * NativeMathf.PI * ((n as f32)/ (buffer2.length as f32)));
            buffer2[n].re += 0.5 * NativeMathf.sin(2 * NativeMathf.PI * ((n as f32) * 2 / (buffer2.length as f32)));
        }
        fft2.calculate();
        expect<f32>(buffer2[0].re).toBeCloseTo(0);
        expect<f32>(buffer2[0].im).toBeCloseTo(0);

        expect<f32>(buffer2[1].re).toBeCloseTo(0);
        expect<f32>(buffer2[1].im).toBeCloseTo(-512);

        expect<f32>(buffer2[2].re).toBeCloseTo(0);
        expect<f32>(buffer2[2].im).toBeCloseTo(-256);

        for (let n = 3; n < buffer2.length - 2; n++) {
            expect<f32>(buffer2[n].re).toBeCloseTo(0);
            expect<f32>(buffer2[n].im).toBeCloseTo(0);

        }

        expect<f32>(buffer2[1023].re).toBeCloseTo(0);
        expect<f32>(buffer2[1023].im).toBeCloseTo(512);

        expect<f32>(buffer2[1022].re).toBeCloseTo(0);
        expect<f32>(buffer2[1022].im).toBeCloseTo(256);
    });
});