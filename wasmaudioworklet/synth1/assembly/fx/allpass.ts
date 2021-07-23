import { DelayLine } from "./delayline";

export class AllPass {
    readonly delay_line: DelayLine;

    constructor(delay_length: usize) {
        this.delay_line = new DelayLine(delay_length);
    }

    tick(input: f32): f32 {
        let delayed: f32 = this.delay_line.read();
        let output: f32 = -input + delayed;

        // in the original version of freeverb this is a member which is never modified
        const feedback: f32 = 0.5;

        this.delay_line
            .write_and_advance(input + delayed * feedback);

        return output;
    }
}

export class AllPassFloat {
    coeff: f32;
    previousinput: f32;
    previousoutput: f32;

    setDelta(delta: f32): void {
        this.coeff = (1 - delta) / (1 + delta);
    }

    clearBuffers(): void {
        this.previousinput = 0;
        this.previousoutput = 0;
    }

    process(input: f32): f32 {
        const output = this.coeff * (input
            - this.previousoutput)
            + this.previousinput;
        this.previousoutput = output;
        this.previousinput = input;
        return output;
    }
}
