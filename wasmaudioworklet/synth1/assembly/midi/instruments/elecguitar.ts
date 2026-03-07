// Faust-generated ElecGuitar
// Auto-transpiled from Faust DSP by faust2as.js
// Source: elecGuitarMIDI.dsp

import { MidiVoice, MidiChannel } from "../midisynth";
import { notefreq } from "../../synth/note";
import { SAMPLERATE } from "../../environment";

function faustpower2_f(value: f32): f32 { return (value * value); }

export class ElecGuitar extends MidiVoice {
    private fHslider0: f32 = 0.5;
    private fConst1: f32;
    private fConst2: f32;
    private fConst3: f32;
    private fHslider1: f32 = 0.8;
    private fConst4: f32;
    private fRec29: StaticArray<f32> = new StaticArray<f32>(2);
    private fHslider2: f32 = 440;
    private fButton0: f32 = 0;
    private fHslider3: f32 = 0;
    private fVec0: StaticArray<f32> = new StaticArray<f32>(2);
    private fHslider4: f32 = 0;
    private fRec30: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec25: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec31: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec33: StaticArray<f32> = new StaticArray<f32>(4);
    private IOTA: i32 = 0;
    private fRec34: StaticArray<f32> = new StaticArray<f32>(2048);
    private fVec1: StaticArray<f32> = new StaticArray<f32>(2);
    private fHslider5: f32 = 0.8;
    private iRec36: StaticArray<i32> = new StaticArray<i32>(2);
    private fConst5: f32;
    private fRec35: StaticArray<f32> = new StaticArray<f32>(3);
    private iRec37: StaticArray<i32> = new StaticArray<i32>(2);
    private fConst6: f32;
    private fVec2: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec32: StaticArray<f32> = new StaticArray<f32>(2048);
    private fRec21: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec17: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec13: StaticArray<f32> = new StaticArray<f32>(2048);
    private fRec15: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec11: StaticArray<f32> = new StaticArray<f32>(4);
    private fRec6: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec2: StaticArray<f32> = new StaticArray<f32>(2048);
    private fRec0: StaticArray<f32> = new StaticArray<f32>(2);
    private silentSamples: i32 = 0;

    constructor(channel: MidiChannel) {
        super(channel);
        this.instanceConstants();
        this.instanceClear();
    }

    private instanceConstants(): void {
        const fConst0: f32 = Mathf.min(192000.0, Mathf.max(1.0, SAMPLERATE));
        this.fConst1 = (0.00882352982 * fConst0);
        this.fConst2 = (0.00147058826 * fConst0);
        this.fConst3 = (44.0999985 / fConst0);
        this.fConst4 = (1.0 - this.fConst3);
        this.fConst5 = (15.707963 / fConst0);
        this.fConst6 = (0.00200000009 * fConst0);
    }

    private instanceClear(): void {
        for (let i = 0; i < 2; i++) { this.fRec29[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fVec0[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec30[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec25[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec31[i] = 0.0; }
        for (let i = 0; i < 4; i++) { this.fRec33[i] = 0.0; }
        this.IOTA = 0;
        for (let i = 0; i < 2048; i++) { this.fRec34[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fVec1[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec36[i] = 0; }
        for (let i = 0; i < 3; i++) { this.fRec35[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec37[i] = 0; }
        for (let i = 0; i < 3; i++) { this.fVec2[i] = 0.0; }
        for (let i = 0; i < 2048; i++) { this.fRec32[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec21[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec17[i] = 0.0; }
        for (let i = 0; i < 2048; i++) { this.fRec13[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec15[i] = 0.0; }
        for (let i = 0; i < 4; i++) { this.fRec11[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec6[i] = 0.0; }
        for (let i = 0; i < 2048; i++) { this.fRec2[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec0[i] = 0.0; }
    }

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.fHslider2 = notefreq(note);
        this.fButton0 = 1.0;
        this.fHslider5 = <f32>velocity / 127.0;
        this.silentSamples = 0;
    }

    noteoff(): void {
        this.fButton0 = 0.0;
    }

    isDone(): boolean {
        return this.fButton0 == 0.0 && this.silentSamples > 4410;
    }

    nextframe(): void {
        const fSlow0: f32 = <f32>this.fHslider0;
        const fSlow1: f32 = (this.fConst3 * <f32>this.fHslider1);
        const fSlow2: f32 = <f32>this.fHslider2;
        const fSlow3: f32 = (340.0 / fSlow2);
        const fSlow4: f32 = Mathf.min(1.0, (<f32>this.fButton0 + <f32>this.fHslider3));
        const iSlow5: i32 = (fSlow4 == 0.0 ? 1 : 0);
        const fSlow6: f32 = Mathf.pow(2.0, (0.0833333358 * <f32>this.fHslider4));
        const fSlow7: f32 = <f32>this.fHslider5;
        const fSlow8: f32 = (this.fConst5 * fSlow2);
        const fSlow9: f32 = (0.000500000024 * fSlow2);

        const fRec10: f32 = (-1.0 * (0.997305274 * ((0.899999976 * this.fRec11[2]) + (0.0500000007 * (this.fRec11[1] + this.fRec11[3])))));
        this.fRec29[0] = (fSlow1 + (this.fConst4 * this.fRec29[1]));
        this.fVec0[0] = fSlow4;
        const fTemp0: f32 = <f32>((fSlow4 == this.fVec0[1] ? 1 : 0) | iSlow5);
        this.fRec30[0] = ((0.999000013 * (fTemp0 * this.fRec30[1])) + (fSlow6 * (1.0 - (0.999000013 * fTemp0))));
        const fTemp1: f32 = ((fSlow3 / this.fRec30[0]) + -0.109999999);
        const fTemp2: f32 = (this.fConst2 * ((1.0 - this.fRec29[0]) * fTemp1));
        const fTemp3: f32 = (fTemp2 + -1.49999499);
        const iTemp4: i32 = <i32>fTemp3;
        const iTemp5: i32 = <i32>Mathf.min(this.fConst1, <f32>max(0, <i32>iTemp4));
        const fTemp6: f32 = Mathf.floor(fTemp3);
        const fTemp7: f32 = (fTemp2 + (-1.0 - fTemp6));
        const fTemp8: f32 = (0.0 - fTemp7);
        const fTemp9: f32 = (fTemp2 + (-2.0 - fTemp6));
        const fTemp10: f32 = (0.0 - (0.5 * fTemp9));
        const fTemp11: f32 = (fTemp2 + (-3.0 - fTemp6));
        const fTemp12: f32 = (0.0 - (0.333333343 * fTemp11));
        const fTemp13: f32 = (fTemp2 + (-4.0 - fTemp6));
        const fTemp14: f32 = (0.0 - (0.25 * fTemp13));
        const fTemp15: f32 = (fTemp2 - fTemp6);
        const iTemp16: i32 = <i32>Mathf.min(this.fConst1, <f32>max(0, <i32>(iTemp4 + 1)));
        const fTemp17: f32 = (0.0 - fTemp9);
        const fTemp18: f32 = (0.0 - (0.5 * fTemp11));
        const fTemp19: f32 = (0.0 - (0.333333343 * fTemp13));
        const iTemp20: i32 = <i32>Mathf.min(this.fConst1, <f32>max(0, <i32>(iTemp4 + 2)));
        const fTemp21: f32 = (0.0 - fTemp11);
        const fTemp22: f32 = (0.0 - (0.5 * fTemp13));
        const fTemp23: f32 = (fTemp7 * fTemp9);
        const iTemp24: i32 = <i32>Mathf.min(this.fConst1, <f32>max(0, <i32>(iTemp4 + 3)));
        const fTemp25: f32 = (0.0 - fTemp13);
        const fTemp26: f32 = (fTemp23 * fTemp11);
        const iTemp27: i32 = <i32>Mathf.min(this.fConst1, <f32>max(0, <i32>(iTemp4 + 4)));
        this.fRec25[0] = (((((this.fRec2[((this.IOTA - (iTemp5 + 1)) & 2047)] * fTemp8) * fTemp10) * fTemp12) * fTemp14) + (fTemp15 * ((((((this.fRec2[((this.IOTA - (iTemp16 + 1)) & 2047)] * fTemp17) * fTemp18) * fTemp19) + (0.5 * (((fTemp7 * this.fRec2[((this.IOTA - (iTemp20 + 1)) & 2047)]) * fTemp21) * fTemp22))) + (0.166666672 * ((fTemp23 * this.fRec2[((this.IOTA - (iTemp24 + 1)) & 2047)]) * fTemp25))) + (0.0416666679 * (fTemp26 * this.fRec2[((this.IOTA - (iTemp27 + 1)) & 2047)])))));
        this.fRec31[0] = ((0.0500000007 * this.fRec31[1]) + (0.949999988 * this.fRec25[1]));
        const fRec26: f32 = this.fRec31[0];
        this.fRec33[0] = this.fRec0[1];
        this.fRec34[(this.IOTA & 2047)] = (-1.0 * (0.997305274 * ((0.899999976 * this.fRec33[2]) + (0.0500000007 * (this.fRec33[1] + this.fRec33[3])))));
        const fTemp28: f32 = (this.fConst2 * (this.fRec29[0] * fTemp1));
        const fTemp29: f32 = (fTemp28 + -1.49999499);
        const iTemp30: i32 = <i32>fTemp29;
        const iTemp31: i32 = <i32>Mathf.min(this.fConst1, <f32>max(0, <i32>iTemp30));
        const fTemp32: f32 = Mathf.floor(fTemp29);
        const fTemp33: f32 = (fTemp28 + (-1.0 - fTemp32));
        const fTemp34: f32 = (0.0 - fTemp33);
        const fTemp35: f32 = (fTemp28 + (-2.0 - fTemp32));
        const fTemp36: f32 = (0.0 - (0.5 * fTemp35));
        const fTemp37: f32 = (fTemp28 + (-3.0 - fTemp32));
        const fTemp38: f32 = (0.0 - (0.333333343 * fTemp37));
        const fTemp39: f32 = (fTemp28 + (-4.0 - fTemp32));
        const fTemp40: f32 = (0.0 - (0.25 * fTemp39));
        const fTemp41: f32 = (fTemp28 - fTemp32);
        const iTemp42: i32 = <i32>Mathf.min(this.fConst1, <f32>max(0, <i32>(iTemp30 + 1)));
        const fTemp43: f32 = (0.0 - fTemp35);
        const fTemp44: f32 = (0.0 - (0.5 * fTemp37));
        const fTemp45: f32 = (0.0 - (0.333333343 * fTemp39));
        const iTemp46: i32 = <i32>Mathf.min(this.fConst1, <f32>max(0, <i32>(iTemp30 + 2)));
        const fTemp47: f32 = (0.0 - fTemp37);
        const fTemp48: f32 = (0.0 - (0.5 * fTemp39));
        const fTemp49: f32 = (fTemp33 * fTemp35);
        const iTemp50: i32 = <i32>Mathf.min(this.fConst1, <f32>max(0, <i32>(iTemp30 + 3)));
        const fTemp51: f32 = (0.0 - fTemp39);
        const fTemp52: f32 = (fTemp49 * fTemp37);
        const iTemp53: i32 = <i32>Mathf.min(this.fConst1, <f32>max(0, <i32>(iTemp30 + 4)));
        this.fVec1[0] = (((((this.fRec34[((this.IOTA - (iTemp31 + 2)) & 2047)] * fTemp34) * fTemp36) * fTemp38) * fTemp40) + (fTemp41 * ((((((this.fRec34[((this.IOTA - (iTemp42 + 2)) & 2047)] * fTemp43) * fTemp44) * fTemp45) + (0.5 * (((fTemp33 * this.fRec34[((this.IOTA - (iTemp46 + 2)) & 2047)]) * fTemp47) * fTemp48))) + (0.166666672 * ((fTemp49 * this.fRec34[((this.IOTA - (iTemp50 + 2)) & 2047)]) * fTemp51))) + (0.0416666679 * (fTemp52 * this.fRec34[((this.IOTA - (iTemp53 + 2)) & 2047)])))));
        this.iRec36[0] = ((1103515245 * this.iRec36[1]) + 12345);
        const fTemp54: f32 = Mathf.tan((fSlow8 * this.fRec30[0]));
        const fTemp55: f32 = (1.0 / fTemp54);
        const fTemp56: f32 = (((fTemp55 + 1.41421354) / fTemp54) + 1.0);
        this.fRec35[0] = ((4.65661287e-10 * <f32>this.iRec36[0]) - (((this.fRec35[2] * (((fTemp55 + -1.41421354) / fTemp54) + 1.0)) + (2.0 * (this.fRec35[1] * (1.0 - (1.0 / faustpower2_f(fTemp54)))))) / fTemp56));
        this.iRec37[0] = (((this.iRec37[1] + (this.iRec37[1] > 0 ? 1 : 0)) * (fSlow4 <= this.fVec0[1] ? 1 : 0)) + (fSlow4 > this.fVec0[1] ? 1 : 0));
        const fTemp57: f32 = (<f32>this.iRec37[0] / Mathf.max(1.0, (this.fConst6 * faustpower2_f((1.0 - (fSlow9 * this.fRec30[0]))))));
        const fTemp58: f32 = (fSlow7 * (((this.fRec35[2] + (this.fRec35[0] + (2.0 * this.fRec35[1]))) * Mathf.max(0.0, Mathf.min(fTemp57, (2.0 - fTemp57)))) / fTemp56));
        const fTemp59: f32 = (this.fVec1[1] + fTemp58);
        this.fVec2[0] = fTemp59;
        this.fRec32[(this.IOTA & 2047)] = ((0.0500000007 * this.fRec32[((this.IOTA - 1) & 2047)]) + (0.949999988 * this.fVec2[2]));
        const fRec27: f32 = (((((fTemp8 * fTemp10) * fTemp12) * fTemp14) * this.fRec32[((this.IOTA - iTemp5) & 2047)]) + (fTemp15 * ((((((fTemp17 * fTemp18) * fTemp19) * this.fRec32[((this.IOTA - iTemp16) & 2047)]) + (0.5 * (((fTemp7 * fTemp21) * fTemp22) * this.fRec32[((this.IOTA - iTemp20) & 2047)]))) + (0.166666672 * ((fTemp23 * fTemp25) * this.fRec32[((this.IOTA - iTemp24) & 2047)]))) + (0.0416666679 * (fTemp26 * this.fRec32[((this.IOTA - iTemp27) & 2047)])))));
        const fRec28: f32 = (this.fVec2[1] + this.fRec21[1]);
        this.fRec21[0] = fRec26;
        const fRec22: f32 = this.fRec21[1];
        const fRec23: f32 = fRec27;
        const fRec24: f32 = fRec28;
        this.fRec17[0] = fRec22;
        const fRec18: f32 = (fTemp58 + this.fRec17[1]);
        const fRec19: f32 = fRec23;
        const fRec20: f32 = fRec24;
        this.fRec13[(this.IOTA & 2047)] = fRec18;
        const fRec14: f32 = (((((fTemp34 * fTemp36) * fTemp38) * fTemp40) * this.fRec13[((this.IOTA - (iTemp31 + 1)) & 2047)]) + (fTemp41 * ((((((fTemp43 * fTemp44) * fTemp45) * this.fRec13[((this.IOTA - (iTemp42 + 1)) & 2047)]) + (0.5 * (((fTemp33 * fTemp47) * fTemp48) * this.fRec13[((this.IOTA - (iTemp46 + 1)) & 2047)]))) + (0.166666672 * ((fTemp49 * fTemp51) * this.fRec13[((this.IOTA - (iTemp50 + 1)) & 2047)]))) + (0.0416666679 * (fTemp52 * this.fRec13[((this.IOTA - (iTemp53 + 1)) & 2047)])))));
        this.fRec15[0] = fRec19;
        const fRec16: f32 = fRec20;
        this.fRec11[0] = this.fRec15[1];
        const fRec12: f32 = fRec16;
        this.fRec6[0] = fRec10;
        const fRec7: f32 = this.fRec6[1];
        const fRec8: f32 = this.fRec11[0];
        const fRec9: f32 = fRec12;
        this.fRec2[(this.IOTA & 2047)] = fRec7;
        const fRec3: f32 = fRec14;
        const fRec4: f32 = fRec8;
        const fRec5: f32 = fRec9;
        this.fRec0[0] = fRec3;
        const fRec1: f32 = fRec5;
        const fTemp60: f32 = (fSlow0 * fRec1);
        const output: f32 = fTemp60;

        this.fRec29[1] = this.fRec29[0];
        this.fVec0[1] = this.fVec0[0];
        this.fRec30[1] = this.fRec30[0];
        this.fRec25[1] = this.fRec25[0];
        this.fRec31[1] = this.fRec31[0];
        this.fRec33[3] = this.fRec33[2];
        this.fRec33[2] = this.fRec33[1];
        this.fRec33[1] = this.fRec33[0];
        this.IOTA = (this.IOTA + 1);
        this.fVec1[1] = this.fVec1[0];
        this.iRec36[1] = this.iRec36[0];
        this.fRec35[2] = this.fRec35[1];
        this.fRec35[1] = this.fRec35[0];
        this.iRec37[1] = this.iRec37[0];
        this.fVec2[2] = this.fVec2[1];
        this.fVec2[1] = this.fVec2[0];
        this.fRec21[1] = this.fRec21[0];
        this.fRec17[1] = this.fRec17[0];
        this.fRec15[1] = this.fRec15[0];
        this.fRec11[3] = this.fRec11[2];
        this.fRec11[2] = this.fRec11[1];
        this.fRec11[1] = this.fRec11[0];
        this.fRec6[1] = this.fRec6[0];
        this.fRec0[1] = this.fRec0[0];

        if (Mathf.abs(output) < 0.00001) {
            this.silentSamples++;
        } else {
            this.silentSamples = 0;
        }

        this.channel.signal.addMonoSignal(output, 0.5, 0.5);
    }
}
