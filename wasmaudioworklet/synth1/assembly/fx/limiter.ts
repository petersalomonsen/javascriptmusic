import { SAMPLERATE } from '../environment';

export class Limiter {
    attack: f32 = 0;
    release: f32 = 0;
    envelope: f32 = 0;

    constructor(attackMs: f32, releaseMs: f32) {
        this.attack = Mathf.pow(0.01, 1.0 / (attackMs * SAMPLERATE * 0.001));
        this.release = Mathf.pow(0.01, 1.0 / (releaseMs * SAMPLERATE * 0.001));
    }

    process(signal: f32): f32 {
        const v = Mathf.abs(signal);
        if (v > this.envelope) {
            this.envelope = this.attack * (this.envelope - v) + v;
        } else {
            this.envelope = this.release * (this.envelope - v) + v;
        }

        if (this.envelope > 1) {
            signal /= this.envelope;
        }
        return signal;
    }
}
