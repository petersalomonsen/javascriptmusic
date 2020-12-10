import { Limiter } from '../../fx/limiter';
import { SineOscillator } from '../../synth/sineoscillator.class';

describe('limiter', () => {
    it('should limit signal', () => {
        const limiter = new Limiter(10, 10);
        const osc = new SineOscillator();
        osc.frequency = 440;

        let peak1: f32 = 0;
        for (let frame = 0; frame < 500; frame++) {
            const val = limiter.process(osc.next() * 2);
            const abs = Mathf.abs(val);
            if (abs > peak1) {
                peak1 = abs;
            }
        }

        let peak2: f32 = 0;
        for (let frame = 0; frame < 100; frame++) {
            const val = limiter.process(osc.next() * 2);
            const abs = Mathf.abs(val);
            if (abs > peak2) {
                peak2 = abs;
            }
        }
        expect(peak1 / peak2).toBeCloseTo(1.27 as f32);
    });
});
