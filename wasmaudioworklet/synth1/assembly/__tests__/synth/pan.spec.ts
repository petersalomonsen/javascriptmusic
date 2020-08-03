import { Pan } from "../../synth/pan.class";

describe('pan', () => {
    it('should center pan', () => {
        const pan = new Pan();
        pan.setPan(0.5);
        expect<f32>(pan.leftLevel).toBeCloseTo(NativeMathf.sqrt(1/2));
        expect<f32>(pan.rightLevel).toBeCloseTo(NativeMathf.sqrt(1/2));
    });
    it('should pan left', () => {
        const pan = new Pan();
        pan.setPan(0.0);
        expect<f32>(pan.leftLevel).toBeCloseTo(1.0);
        expect<f32>(pan.rightLevel).toBeCloseTo(0);
    });
    it('should pan right', () => {
        const pan = new Pan();
        pan.setPan(1.0);
        expect<f32>(pan.leftLevel).toBeCloseTo(0);
        expect<f32>(pan.rightLevel).toBeCloseTo(1.0);
    });
    it('should pan medium left', () => {
        const pan = new Pan();
        pan.setPan(0.25);
        expect<f32>(pan.leftLevel).toBeGreaterThan(NativeMathf.sqrt(1/2));
        expect<f32>(pan.rightLevel).toBeLessThan(NativeMathf.sqrt(1/2));
    });
    it('should pan medium right', () => {
        const pan = new Pan();
        pan.setPan(0.75);
        expect<f32>(pan.rightLevel).toBeGreaterThan(NativeMathf.sqrt(1/2));
        expect<f32>(pan.leftLevel).toBeLessThan(NativeMathf.sqrt(1/2));
    });
});