
/**
 * Freeverb implementation taken from Rust implementation here:
 * https://github.com/irh/freeverb-rs/blob/master/freeverb/src/freeverb.rs
 */
import { Comb } from './comb';
import { AllPass } from './allpass';
import { SAMPLERATE as SAMPLERATE_f32 } from '../environment';
import { StereoSignal } from '../synth/stereosignal.class';

let SAMPLERATE = SAMPLERATE_f32 as usize;
const FIXED_GAIN: f32 = 0.015;

const SCALE_WET: f32 = 3.0;
const SCALE_DAMPENING: f32 = 0.4;

const SCALE_ROOM: f32 = 0.28;
const OFFSET_ROOM: f32 = 0.7;

const STEREO_SPREAD: usize = 23;

const COMB_TUNING_L1: usize = 1116;
const COMB_TUNING_R1: usize = 1116 + STEREO_SPREAD;
const COMB_TUNING_L2: usize = 1188;
const COMB_TUNING_R2: usize = 1188 + STEREO_SPREAD;
const COMB_TUNING_L3: usize = 1277;
const COMB_TUNING_R3: usize = 1277 + STEREO_SPREAD;
const COMB_TUNING_L4: usize = 1356;
const COMB_TUNING_R4: usize = 1356 + STEREO_SPREAD;
const COMB_TUNING_L5: usize = 1422;
const COMB_TUNING_R5: usize = 1422 + STEREO_SPREAD;
const COMB_TUNING_L6: usize = 1491;
const COMB_TUNING_R6: usize = 1491 + STEREO_SPREAD;
const COMB_TUNING_L7: usize = 1557;
const COMB_TUNING_R7: usize = 1557 + STEREO_SPREAD;
const COMB_TUNING_L8: usize = 1617;
const COMB_TUNING_R8: usize = 1617 + STEREO_SPREAD;

const ALLPASS_TUNING_L1: usize = 556;
const ALLPASS_TUNING_R1: usize = 556 + STEREO_SPREAD;
const ALLPASS_TUNING_L2: usize = 441;
const ALLPASS_TUNING_R2: usize = 441 + STEREO_SPREAD;
const ALLPASS_TUNING_L3: usize = 341;
const ALLPASS_TUNING_R3: usize = 341 + STEREO_SPREAD;
const ALLPASS_TUNING_L4: usize = 225;
const ALLPASS_TUNING_R4: usize = 225 + STEREO_SPREAD;

@inline function adjust_length(length: usize, sr: usize): usize {
    return ((length as f32) * (sr as f32) / SAMPLERATE_f32) as usize;
}

export class Freeverb {    
    readonly COMB1_L: Comb = new Comb(adjust_length(COMB_TUNING_L1, SAMPLERATE));
    readonly COMB1_R: Comb = new Comb(adjust_length(COMB_TUNING_L1, SAMPLERATE));
    readonly COMB2_L: Comb = new Comb(adjust_length(COMB_TUNING_R2, SAMPLERATE));
    readonly COMB2_R: Comb = new Comb(adjust_length(COMB_TUNING_L2, SAMPLERATE));
    readonly COMB3_L: Comb = new Comb(adjust_length(COMB_TUNING_R3, SAMPLERATE));
    readonly COMB3_R: Comb = new Comb(adjust_length(COMB_TUNING_L3, SAMPLERATE));
    readonly COMB4_L: Comb = new Comb(adjust_length(COMB_TUNING_R4, SAMPLERATE));
    readonly COMB4_R: Comb = new Comb(adjust_length(COMB_TUNING_L4, SAMPLERATE));
    readonly COMB5_L: Comb = new Comb(adjust_length(COMB_TUNING_R5, SAMPLERATE));
    readonly COMB5_R: Comb = new Comb(adjust_length(COMB_TUNING_L5, SAMPLERATE));
    readonly COMB6_L: Comb = new Comb(adjust_length(COMB_TUNING_R6, SAMPLERATE));
    readonly COMB6_R: Comb = new Comb(adjust_length(COMB_TUNING_L6, SAMPLERATE));
    readonly COMB7_L: Comb = new Comb(adjust_length(COMB_TUNING_R7, SAMPLERATE));
    readonly COMB7_R: Comb = new Comb(adjust_length(COMB_TUNING_L7, SAMPLERATE));
    readonly COMB8_L: Comb = new Comb(adjust_length(COMB_TUNING_R8, SAMPLERATE));
    readonly COMB8_R: Comb = new Comb(adjust_length(COMB_TUNING_L8, SAMPLERATE));

    readonly ALL1_L: AllPass = new AllPass(adjust_length(ALLPASS_TUNING_L1, SAMPLERATE));
    readonly ALL1_R: AllPass = new AllPass(adjust_length(ALLPASS_TUNING_R1, SAMPLERATE));
    readonly ALL2_L: AllPass = new AllPass(adjust_length(ALLPASS_TUNING_L2, SAMPLERATE));
    readonly ALL2_R: AllPass = new AllPass(adjust_length(ALLPASS_TUNING_R2, SAMPLERATE));
    readonly ALL3_L: AllPass = new AllPass(adjust_length(ALLPASS_TUNING_L3, SAMPLERATE));
    readonly ALL3_R: AllPass = new AllPass(adjust_length(ALLPASS_TUNING_R3, SAMPLERATE));
    readonly ALL4_L: AllPass = new AllPass(adjust_length(ALLPASS_TUNING_L4, SAMPLERATE));
    readonly ALL4_R: AllPass = new AllPass(adjust_length(ALLPASS_TUNING_R4, SAMPLERATE));

    wet_gain_left: f32 = 0;
    wet_gain_right: f32 = 0;
    
    wet: f32 = 0;
    width: f32 = 0;
    dry: f32 = 0;
    input_gain: f32 = 0;
    dampening: f32 = 0;
    room_size: f32 = 0;
    frozen: bool = 0;

    constructor() {
        this.set_wet(1.0);
        this.set_width(0.5);
        this.set_dampening(0.5);
        this.set_room_size(0.7);
        this.set_frozen(false);        
    }

    tick(signal: StereoSignal): void {
        let input_mixed = (signal.left + signal.right) * FIXED_GAIN * this.input_gain;

        let leftoutput:f32 = 0;
        let rightoutput:f32 = 0;

        leftoutput += this.COMB1_L.tick(input_mixed);
        rightoutput+= this.COMB1_R.tick(input_mixed);
        leftoutput += this.COMB2_L.tick(input_mixed);
        rightoutput+= this.COMB2_R.tick(input_mixed);
        leftoutput += this.COMB3_L.tick(input_mixed);
        rightoutput+= this.COMB3_R.tick(input_mixed);
        leftoutput += this.COMB4_L.tick(input_mixed);
        rightoutput+= this.COMB4_R.tick(input_mixed);
        leftoutput += this.COMB5_L.tick(input_mixed);
        rightoutput+= this.COMB5_R.tick(input_mixed);
        leftoutput += this.COMB6_L.tick(input_mixed);
        rightoutput+= this.COMB6_R.tick(input_mixed);
        leftoutput += this.COMB7_L.tick(input_mixed);
        rightoutput+= this.COMB7_R.tick(input_mixed);
        leftoutput += this.COMB8_L.tick(input_mixed);
        rightoutput+= this.COMB8_R.tick(input_mixed);
        
        leftoutput= this.ALL1_L.tick(leftoutput);
        rightoutput = this.ALL1_R.tick(rightoutput);
        leftoutput= this.ALL2_L.tick(leftoutput);
        rightoutput = this.ALL2_R.tick(rightoutput);
        leftoutput= this.ALL3_L.tick(leftoutput);
        rightoutput = this.ALL3_R.tick(rightoutput);
        leftoutput= this.ALL4_L.tick(leftoutput);
        rightoutput = this.ALL4_R.tick(rightoutput);

        signal.left = leftoutput * this.wet_gain_left +
                                rightoutput * this.wet_gain_right +
                                signal.left * this.dry;
        signal.right = rightoutput * this.wet_gain_left +
                                leftoutput * this.wet_gain_right +
                                signal.right * this.dry;        
    }

    update_combs(): void {
        let feedback: f32;
        let dampening: f32;

        if(this.frozen) {
            feedback =1.0;
            dampening = 0.0;
        } else {
            feedback = this.room_size;
            dampening = this.dampening;
        }
        
        this.COMB1_L.set_feedback(feedback);
        this.COMB1_R.set_feedback(feedback);
        this.COMB1_L.set_dampening(dampening);
        this.COMB1_R.set_dampening(dampening);
        this.COMB2_L.set_feedback(feedback);
        this.COMB2_R.set_feedback(feedback);
        this.COMB2_L.set_dampening(dampening);
        this.COMB2_R.set_dampening(dampening);
        this.COMB3_L.set_feedback(feedback);
        this.COMB3_R.set_feedback(feedback);
        this.COMB3_L.set_dampening(dampening);
        this.COMB3_R.set_dampening(dampening);
        this.COMB4_L.set_feedback(feedback);
        this.COMB4_R.set_feedback(feedback);
        this.COMB4_L.set_dampening(dampening);
        this.COMB4_R.set_dampening(dampening);
        this.COMB5_L.set_feedback(feedback);
        this.COMB5_R.set_feedback(feedback);
        this.COMB5_L.set_dampening(dampening);
        this.COMB5_R.set_dampening(dampening);
        this.COMB6_L.set_feedback(feedback);
        this.COMB6_R.set_feedback(feedback);
        this.COMB6_L.set_dampening(dampening);
        this.COMB6_R.set_dampening(dampening);
        this.COMB7_L.set_feedback(feedback);
        this.COMB7_R.set_feedback(feedback);
        this.COMB7_L.set_dampening(dampening);
        this.COMB7_R.set_dampening(dampening);
        this.COMB8_L.set_feedback(feedback);
        this.COMB8_R.set_feedback(feedback);
        this.COMB8_L.set_dampening(dampening);
        this.COMB8_R.set_dampening(dampening);
    }

    set_dampening(value: f32): void {
        this.dampening = value * SCALE_DAMPENING;
        this.update_combs();
    }

    set_freeze(frozen: bool): void {
        this.frozen = frozen;
        this.update_combs();
    }

    set_wet(value: f32): void {
        this.wet = value * SCALE_WET;
        this.update_wet_gains();
    }

    set_width(value: f32): void {
        this.width = value;
        this.update_wet_gains();
    }

    update_wet_gains(): void {
        this.wet_gain_left = this.wet * (this.width / 2.0 + 0.5);
        this.wet_gain_right = this.wet * ((1.0 - this.width) / 2.0);    
    }

    set_frozen(frozen: bool): void {
        this.frozen = frozen;
        this.input_gain = frozen ? 0.0 : 1.0;
        this.update_combs();
    }

    set_room_size(value: f32): void {
        this.room_size = value * SCALE_ROOM + OFFSET_ROOM;
        this.update_combs();
    }

    set_dry(value: f32): void {
        this.dry = value;
    }
}
