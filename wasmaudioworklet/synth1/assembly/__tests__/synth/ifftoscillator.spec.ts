import { IFFTOscillator } from "../../synth/ifftoscillator.class";

// 44100 / 440 would be integer division (100), which is a 441 Hz reference
// rather than the 440 Hz the oscillator is actually running at. The resulting
// phase drift grew with every sample and was the dominant error in this spec.
const framesPerCycle: f32 = 44100.0 / 440.0;

function idealSine(n: i32): f32 {
    return NativeMathf.sin((n as f32) * 2 * NativeMathf.PI / framesPerCycle);
}

describe('ifftoscillator', () => {
    it('should output a sine wave on 440 hz', () => {
        const osc = new IFFTOscillator(11);
        osc.frequency = 440;
        osc.createWave([0.0], [1.0]);
        expect(osc.fft.buffer[1].im).toBeCloseTo(-1023);
        expect(osc.fft.buffer[2047].im).toBeCloseTo(1023);
        osc.fft.calculateInverse();
        // A 2048 point wavetable tracks the ideal sine to within ~0.001.
        const frames = (framesPerCycle * 5) as i32;
        for (let n = 0; n < frames; n++) {
            expect(osc.next()).toBeCloseTo(idealSine(n), 2);
        }
    });
    it('should output an approximate (interpolated) sine wave on 440 hz', () => {
        const osc = new IFFTOscillator(5);
        osc.frequency = 440;
        osc.createWave([0.0], [1.0]);
        expect(osc.fft.buffer[1].im).toBeCloseTo(-15);
        expect(osc.fft.buffer[31].im).toBeCloseTo(15);
        osc.fft.calculateInverse();
        // Only 32 points per cycle, so cubic interpolation leaves a real
        // approximation error of ~0.063 -- stated explicitly rather than
        // leaning on a toBeCloseTo decimal place that cannot express it.
        const frames = framesPerCycle as i32;
        for (let n = 0; n < frames; n++) {
            expect(NativeMathf.abs(osc.next() - idealSine(n))).toBeLessThan(0.1);
        }
    });
});
