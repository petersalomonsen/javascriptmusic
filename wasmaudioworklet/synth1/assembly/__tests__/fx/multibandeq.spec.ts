import { MultiBandEQ } from '../../fx/multibandeq';
import { SineOscillator } from '../../synth/sineoscillator.class';
import { TriBandEQ } from '../../fx/tribandeq';

describe('multibandeq', () => {
    it('should create eq with 3 bands', () => {
        const eq = new MultiBandEQ([20, 200, 400, 600]);
        const eq2 = new TriBandEQ(20, 200, 400, 600);
        const osc = new SineOscillator();
        osc.frequency = 440;

        let peak1: f32 = 0;
        for (let frame = 0; frame < 1000; frame++) {
            const nextosc = osc.next();
            const val = eq.process(nextosc, [1.0, 0.0, 0.0]);
            const val2 = eq2.process(nextosc, 1.0, 0.0, 0.0);

            expect(val).toBe(val2);

            const abs = Mathf.abs(val);
            if (abs > peak1) {
                peak1 = abs;
            }
        }
        expect(peak1).toBeLessThan(0.2);

        let peak2: f32 = 0;
        for (let frame = 0; frame < 1000; frame++) {
            const nextosc = osc.next();
            const val = eq.process(nextosc, [0.0, 0.0, 1.0]);
            const val2 = eq2.process(nextosc, 0.0, 0.0, 1.0);
            expect(val).toBe(val2);

            const abs = Mathf.abs(val);
            if (abs > peak2) {
                peak2 = abs;
            }
        }
        expect(peak2).toBeGreaterThan(0.4);
    });
});
