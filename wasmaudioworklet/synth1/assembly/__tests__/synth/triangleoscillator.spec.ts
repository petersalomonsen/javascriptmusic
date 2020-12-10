import { TriangleOscillator } from '../../synth/triangleoscillator.class';

describe('triangleoscillator', () => {
    it('should output a triangle wave on 440 hz', () => {
        const osc = new TriangleOscillator();
        osc.frequency = 440;

        const framesPerCycle: f64 = 44100 / 440;
        for (let n: f64 = 0; n < framesPerCycle * 1; n++) {
            const sample = osc.next();

            const wavepos = (n % framesPerCycle) / framesPerCycle;
            const expectedSample: f64 = wavepos < 0.5 ?
                (wavepos * 4.0) - 1.0 :
                (-(wavepos - 0.5) * 4.0) + 1.0;

            expect(sample).toBeCloseTo(expectedSample as f32, 1);
        }
    });
});
