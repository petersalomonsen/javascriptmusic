import { DelayLine } from "./delayline";

export class Comb {
    readonly delay_line: DelayLine;
    feedback: f32;
    filter_state: f32;
    dampening: f32;
    dampening_inverse: f32;

    constructor(delay_length: usize) {        
        this.delay_line = new DelayLine(delay_length);
        this.feedback= 0.5;
        this.filter_state = 0.0;
        this.dampening = 0.5;
        this.dampening_inverse = 0.5;
        
    }

    set_dampening(value: f32): void{
        this.dampening = value;
        this.dampening_inverse = 1.0 - value;
    }

    set_feedback(value: f32): void {
        this.feedback = value;
    }

    tick(input: f32): f32 {
        let output = this.delay_line.read();

        this.filter_state =
            output * this.dampening_inverse + this.filter_state * this.dampening;

        this.delay_line
            .write_and_advance(input + this.filter_state * this.feedback);

        return output;
    }
}
