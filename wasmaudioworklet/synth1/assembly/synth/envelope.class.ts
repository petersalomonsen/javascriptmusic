import { SAMPLERATE } from "../environment";

export enum EnvelopeState {
    ATTACK = 0,
    DECAY = 1,
    SUSTAIN = 2,
    RELEASE = 3,
    DONE = 4
}

export class Envelope {
    attackStep: f32;
    decayStep: f32;
    sustainLevel: f32;
    releaseStep: f32;
    
    val: f32 = 0;
    state: EnvelopeState = EnvelopeState.DONE;

    constructor(attackTime: f32, decayTime: f32, sustainLevel: f32, releaseTime: f32) {
        this.attackStep = 1.0 / (attackTime * SAMPLERATE);
        this.decayStep = 1.0 / (decayTime * SAMPLERATE);
        this.releaseStep = 1.0 / (releaseTime * SAMPLERATE);
        this.sustainLevel = sustainLevel;
    }

    next(): f32 {
        switch(this.state) {
            case EnvelopeState.ATTACK:
                this.val += this.attackStep;
                if(this.val >= 1.0) {
                    this.val = 1.0;
                    this.state = EnvelopeState.DECAY;
                }
                break;
            case EnvelopeState.DECAY:
                this.val -= this.decayStep;
                if(this.val <= this.sustainLevel) {
                    this.val = this.sustainLevel;
                    this.state = EnvelopeState.SUSTAIN;
                }
                break;
            case EnvelopeState.SUSTAIN:
                break;
            case EnvelopeState.RELEASE:
                this.val -= this.releaseStep;
                if(this.val <= 0) {
                    this.val = 0;
                    this.state = EnvelopeState.DONE;
                }
                break;
            case EnvelopeState.DONE:
                break;
        }
        return this.val;
    }

    attack(): void {
        this.state = EnvelopeState.ATTACK;
    }
    
    release(): void {
        this.state = EnvelopeState.RELEASE;
    }

    isDone(): boolean {
        return this.state === EnvelopeState.DONE;
    }
}