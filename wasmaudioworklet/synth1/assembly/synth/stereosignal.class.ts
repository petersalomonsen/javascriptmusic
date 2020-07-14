import { Pan } from './pan.class';

export class StereoSignal {
    left: f32 = 0;
    right: f32 = 0;

    clear(): void {
        this.left = 0;
        this.right = 0;
    }

    /**
     * Add left and right values directly to the signal
     * @param left
     * @param right 
     */
    @inline
    add(left: f32, right:f32): void {
        this.left += left;
        this.right += right;
    }

    /**
     * Add stereo signal with simple (not proper) panning
     * @param signal 
     * @param level 
     * @param pan 0.0 - 1.0
     */
    addStereoSignal(signal: StereoSignal, level: f32, pan: f32): void {
        this.left += signal.left * pan * level;
        this.right += signal.right * (1 - pan) * level;
    }

    addMonoSignal(signal: f32, level: f32, pan: f32): void {
        this.left += signal * pan * level;
        this.right += signal * (1 - pan) * level;
    }
}