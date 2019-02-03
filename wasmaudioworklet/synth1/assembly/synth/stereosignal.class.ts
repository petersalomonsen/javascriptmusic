

export class StereoSignal {
    left: f32 = 0;
    right: f32 = 0;

    @inline clear(): void {
        this.left = 0;
        this.right = 0;
    }

    @inline addStereoSignal(signal: StereoSignal, level: f32, pan: f32): void {
        this.left += signal.left * pan * level;
        this.right += signal.right * (1 - pan) * level;
    }

    @inline addMonoSignal(signal: f32, level: f32, pan: f32): void {
        this.left += signal * pan * level;
        this.right += signal * (1 - pan) * level;
    }
}