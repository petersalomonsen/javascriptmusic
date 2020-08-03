import { IFFTOscillator } from "../../synth/ifftoscillator.class";

describe('ifftoscillator', () => {
    it('should output a sine wave on 440 hz', () => {
        const osc = new IFFTOscillator(11);
        osc.frequency = 440;
        osc.createWave([0.0], [1.0]);
        expect(osc.fft.buffer[1].im).toBeCloseTo(-1023);
        expect(osc.fft.buffer[2047].im).toBeCloseTo(1023);
        osc.fft.calculateInverse();
        const framesPerCycle = 44100 / 440;
        for (let n = 0;n < framesPerCycle * 5; n++) {
            const sample = osc.next();
            expect(sample).toBeCloseTo(
                        NativeMathf.sin((n as f32) * 2 * NativeMathf.PI /
                            (framesPerCycle as f32)), 1);
        }        
    });
    it('should output an approximate (interpolated) sine wave on 440 hz', () => {
        const osc = new IFFTOscillator(5);
        osc.frequency = 440;
        osc.createWave([0.0], [1.0]);
        expect(osc.fft.buffer[1].im).toBeCloseTo(-15);
        expect(osc.fft.buffer[31].im).toBeCloseTo(15);
        osc.fft.calculateInverse();
        const framesPerCycle = 44100 / 440;
        for (let n = 0;n < framesPerCycle; n++) {
            const sample = osc.next();            
            expect(sample).toBeCloseTo(
                        NativeMathf.sin((n as f32) * 2 * NativeMathf.PI /
                            (framesPerCycle as f32)), 1);
        }        
    });
});