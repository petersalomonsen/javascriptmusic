import { MonoCompressor } from '../../fx/monocompressor';
import { SineOscillator } from '../../synth/sineoscillator.class';

describe('compressor', () => {
    it('should compress signal', () => {
        const NUM_SAMPLES = 40;
        const compressor = new MonoCompressor(NUM_SAMPLES);
        let ret: f32 = 0;
        for (let n = 0; n < NUM_SAMPLES; n++) {
            ret = compressor.process(1.3, 1.0, 1.0);

        }
        expect(compressor.delay.currentPeak).toBeCloseTo(1.3);
        expect(compressor.gain).toBeCloseTo(0.769);
        for (let n = 0; n < NUM_SAMPLES; n++) {
            ret = compressor.process(-0.8, 1.0, 1.0);
        }
        expect(compressor.delay.currentPeak).toBeCloseTo(0.8);
        expect(compressor.gain).toBeCloseTo(0.769);
        expect(compressor.targetgain).toBeCloseTo(1.0);
        for (let n = 0; n < NUM_SAMPLES; n++) {
            ret = compressor.process(0.5, 1.0, 1.0);
        }
        expect(compressor.delay.currentPeak).toBeCloseTo(0.5);
        expect(compressor.gain).toBeCloseTo(1.0);
        expect(compressor.targetgain).toBeCloseTo(1.0);

        for (let n = 0; n < NUM_SAMPLES; n++) {
            ret = compressor.process(-4.0, 1.0, 1.0);
        }
        expect(compressor.delay.currentPeak).toBeCloseTo(4.0);
        expect(compressor.gain).toBeCloseTo(0.25);
        expect(compressor.targetgain).toBeCloseTo(0.25);

        for (let n = 0; n < NUM_SAMPLES; n++) {
            ret = compressor.process(0.5, 1.0, 1.0);
        }
        expect(compressor.delay.currentPeak).toBeCloseTo(0.5);
        expect(compressor.targetgain).toBeCloseTo(1.0);

        for (let n = 0; n < NUM_SAMPLES; n++) {
            ret = compressor.process(2.0, 1.0, 1.0);
        }
        expect(compressor.delay.currentPeak).toBeCloseTo(2.0);
        expect(compressor.targetgain).toBeCloseTo(0.5);
        expect(compressor.gain).toBeCloseTo(0.5);
    });

    it('should be able to set release different from buffer size', () => {
        const NUM_SAMPLES = 40;
        const compressor = new MonoCompressor(NUM_SAMPLES);
        compressor.setRelaseSampleCount(80);
        let ret: f32 = 0;
        for (let n = 0; n < NUM_SAMPLES; n++) {
            ret = compressor.process(1.3, 1.0, 1.0);

        }
        expect(compressor.delay.currentPeak).toBeCloseTo(1.3);
        expect(compressor.gain).toBeCloseTo(1.0 / 1.3);
        for (let n = 0; n < NUM_SAMPLES; n++) {
            ret = compressor.process(-0.8, 1.0, 1.0);
        }
        expect(compressor.delay.currentPeak).toBeCloseTo(0.8);
        expect(compressor.gain).toBeCloseTo(1.0 / 1.3);
        expect(compressor.targetgain).toBeCloseTo(1.0);

        for (let n = 0; n < NUM_SAMPLES; n++) {
            ret = compressor.process(0.5, 1.0, 1.0);
        }
        expect(compressor.delay.currentPeak).toBeCloseTo(0.5);
        expect(compressor.gain).toBeCloseTo((1.0 - (1.0 - (1.0 / 1.3)) / 2.0));
        expect(compressor.targetgain).toBeCloseTo(1.0);

        for (let n = 0; n < NUM_SAMPLES; n++) {
            ret = compressor.process(0.5, 1.0, 1.0);
        }
        expect(compressor.delay.currentPeak).toBeCloseTo(0.5);
        expect(compressor.gain).toBeCloseTo(1.0);
        expect(compressor.targetgain).toBeCloseTo(1.0);

    });
});
