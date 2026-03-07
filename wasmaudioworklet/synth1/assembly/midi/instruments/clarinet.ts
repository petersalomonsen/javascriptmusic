// Faust-generated Clarinet
// Auto-transpiled from Faust DSP by faust2as.js
// Source: clarinetMIDI.dsp

import { MidiVoice, MidiChannel } from "../midisynth";
import { notefreq } from "../../synth/note";
import { SAMPLERATE } from "../../environment";

const ftbl0SIG0: StaticArray<f32> = new StaticArray<f32>(65536);
let _sig0_initialized: bool = false;

function _initSIG0Tables(): void {
    if (_sig0_initialized) return;
    _sig0_initialized = true;
    const sig0_iVec0: StaticArray<i32> = new StaticArray<i32>(2);
    const sig0_iRec15: StaticArray<i32> = new StaticArray<i32>(2);
    for (let i = 0; i < ftbl0SIG0.length; i++) {
        sig0_iVec0[0] = 1;
        sig0_iRec15[0] = ((sig0_iVec0[1] + sig0_iRec15[1]) % 65536);
        ftbl0SIG0[i] = Mathf.sin((9.58738019e-05 * <f32>sig0_iRec15[0]));
        sig0_iVec0[1] = sig0_iVec0[0];
        sig0_iRec15[1] = sig0_iRec15[0];
    }
}

function faustpower2_f(value: f32): f32 { return (value * value); }

export class Clarinet extends MidiVoice {
    private fHslider0: f32 = 0.5;
    private iRec6: StaticArray<i32> = new StaticArray<i32>(2);
    private fHslider1: f32 = 0.5;
    private fRec12: StaticArray<f32> = new StaticArray<f32>(2);
    private fHslider2: f32 = 0.25;
    private fConst1: f32;
    private fHslider3: f32 = 5;
    private fRec16: StaticArray<f32> = new StaticArray<f32>(2);
    private fHslider4: f32 = 1;
    private fButton0: f32 = 0;
    private fHslider5: f32 = 0;
    private fVec1: StaticArray<f32> = new StaticArray<f32>(2);
    private fHslider6: f32 = 0.6;
    private fRec17: StaticArray<f32> = new StaticArray<f32>(2);
    private fConst5: f32;
    private iRec19: StaticArray<i32> = new StaticArray<i32>(2);
    private fConst6: f32;
    private fConst7: f32;
    private fConst8: f32;
    private fRec18: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec13: StaticArray<f32> = new StaticArray<f32>(2);
    private fHslider7: f32 = 0.5;
    private IOTA: i32 = 0;
    private fRec14: StaticArray<f32> = new StaticArray<f32>(2048);
    private fConst9: f32;
    private fConst10: f32;
    private fHslider8: f32 = 440;
    private fHslider9: f32 = 0;
    private fRec20: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec2: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec11: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec2: StaticArray<f32> = new StaticArray<f32>(2048);
    private fRec0: StaticArray<f32> = new StaticArray<f32>(2);
    private silentSamples: i32 = 0;

    constructor(channel: MidiChannel) {
        super(channel);
        _initSIG0Tables();
        this.instanceConstants();
        this.instanceClear();
    }

    private instanceConstants(): void {
        const fConst0: f32 = Mathf.min(192000.0, Mathf.max(1.0, SAMPLERATE));
        this.fConst1 = (1.0 / fConst0);
        const fConst2: f32 = Mathf.tan((6283.18555 / fConst0));
        const fConst3: f32 = (1.0 / fConst2);
        const fConst4: f32 = (((fConst3 + 1.41421354) / fConst2) + 1.0);
        this.fConst5 = (0.0500000007 / fConst4);
        this.fConst6 = (1.0 / fConst4);
        this.fConst7 = (((fConst3 + -1.41421354) / fConst2) + 1.0);
        this.fConst8 = (2.0 * (1.0 - (1.0 / faustpower2_f(fConst2))));
        this.fConst9 = (0.00882352982 * fConst0);
        this.fConst10 = (0.00147058826 * fConst0);
    }

    private instanceClear(): void {
        for (let i = 0; i < 2; i++) { this.iRec6[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec12[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec16[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fVec1[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec17[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec19[i] = 0; }
        for (let i = 0; i < 3; i++) { this.fRec18[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec13[i] = 0.0; }
        this.IOTA = 0;
        for (let i = 0; i < 2048; i++) { this.fRec14[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec20[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fVec2[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec11[i] = 0.0; }
        for (let i = 0; i < 2048; i++) { this.fRec2[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec0[i] = 0.0; }
    }

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.fHslider8 = notefreq(note);
        this.fButton0 = 1.0;
        this.fHslider6 = <f32>velocity / 127.0;
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
        const fSlow1: f32 = <f32>this.fHslider1;
        const fSlow2: f32 = (1.0 - fSlow1);
        const fSlow3: f32 = (0.00999999978 * <f32>this.fHslider2);
        const fSlow4: f32 = (this.fConst1 * <f32>this.fHslider3);
        const fSlow5: f32 = (0.00100000005 * <f32>this.fHslider4);
        const iSlow6: i32 = (Mathf.abs(fSlow5) < 1.1920929e-07 ? 1 : 0);
        const fSlow7: f32 = (iSlow6 ? 0.0 : Mathf.exp((0.0 - (this.fConst1 / (iSlow6 ? 1.0 : fSlow5)))));
        const fSlow8: f32 = Mathf.min(1.0, (<f32>this.fButton0 + <f32>this.fHslider5));
        const fSlow9: f32 = ((fSlow8 * <f32>this.fHslider6) * (1.0 - fSlow7));
        const fSlow10: f32 = ((0.25999999 * <f32>this.fHslider7) + -0.439999998);
        const fSlow11: f32 = (170.0 / <f32>this.fHslider8);
        const iSlow12: i32 = (fSlow8 == 0.0 ? 1 : 0);
        const fSlow13: f32 = Mathf.pow(2.0, (0.0833333358 * <f32>this.fHslider9));

        this.iRec6[0] = 0;
        this.fRec12[0] = ((fSlow1 * this.fRec12[1]) + (fSlow2 * this.fRec11[1]));
        const fRec10: f32 = (this.fRec12[0] + <f32>this.iRec6[1]);
        this.fRec16[0] = (fSlow4 + (this.fRec16[1] - Mathf.floor((fSlow4 + this.fRec16[1]))));
        const fTemp0: f32 = ftbl0SIG0[<i32>(65536.0 * this.fRec16[0])];
        const fTemp1: f32 = (fSlow3 * fTemp0);
        this.fVec1[0] = fSlow8;
        this.fRec17[0] = ((this.fRec17[1] * fSlow7) + fSlow9);
        this.iRec19[0] = ((1103515245 * this.iRec19[1]) + 12345);
        this.fRec18[0] = ((4.65661287e-10 * <f32>this.iRec19[0]) - (this.fConst6 * ((this.fConst7 * this.fRec18[2]) + (this.fConst8 * this.fRec18[1]))));
        const fTemp2: f32 = (this.fRec17[0] * ((this.fConst5 * (this.fRec18[2] + (this.fRec18[0] + (2.0 * this.fRec18[1])))) + 1.0));
        this.fRec13[0] = (fTemp1 + (this.fRec0[1] + fTemp2));
        const fTemp3: f32 = (0.0 - this.fRec13[1]);
        this.fRec14[(this.IOTA & 2047)] = (fTemp1 + (fTemp2 + (fTemp3 * Mathf.max(-1.0, Mathf.min(1.0, ((fSlow10 * fTemp3) + 0.699999988))))));
        const fTemp4: f32 = <f32>((fSlow8 == this.fVec1[1] ? 1 : 0) | iSlow12);
        this.fRec20[0] = ((0.999000013 * (fTemp4 * this.fRec20[1])) + (fSlow13 * (1.0 - (0.999000013 * fTemp4))));
        const fTemp5: f32 = (this.fConst10 * ((fSlow11 / (this.fRec20[0] * ((fSlow3 * (this.fRec17[0] * fTemp0)) + 1.0))) + -0.0500000007));
        const fTemp6: f32 = (fTemp5 + -1.49999499);
        const iTemp7: i32 = <i32>fTemp6;
        const iTemp8: i32 = (<i32>Mathf.min(this.fConst9, <f32>max(0, <i32>iTemp7)) + 1);
        const fTemp9: f32 = Mathf.floor(fTemp6);
        const fTemp10: f32 = (fTemp5 + (-1.0 - fTemp9));
        const fTemp11: f32 = (0.0 - fTemp10);
        const fTemp12: f32 = (fTemp5 + (-2.0 - fTemp9));
        const fTemp13: f32 = (0.0 - (0.5 * fTemp12));
        const fTemp14: f32 = (fTemp5 + (-3.0 - fTemp9));
        const fTemp15: f32 = (0.0 - (0.333333343 * fTemp14));
        const fTemp16: f32 = (fTemp5 + (-4.0 - fTemp9));
        const fTemp17: f32 = (0.0 - (0.25 * fTemp16));
        const fTemp18: f32 = (fTemp5 - fTemp9);
        const iTemp19: i32 = (<i32>Mathf.min(this.fConst9, <f32>max(0, <i32>(iTemp7 + 1))) + 1);
        const fTemp20: f32 = (0.0 - fTemp12);
        const fTemp21: f32 = (0.0 - (0.5 * fTemp14));
        const fTemp22: f32 = (0.0 - (0.333333343 * fTemp16));
        const iTemp23: i32 = (<i32>Mathf.min(this.fConst9, <f32>max(0, <i32>(iTemp7 + 2))) + 1);
        const fTemp24: f32 = (0.0 - fTemp14);
        const fTemp25: f32 = (0.0 - (0.5 * fTemp16));
        const fTemp26: f32 = (fTemp10 * fTemp12);
        const iTemp27: i32 = (<i32>Mathf.min(this.fConst9, <f32>max(0, <i32>(iTemp7 + 3))) + 1);
        const fTemp28: f32 = (0.0 - fTemp16);
        const fTemp29: f32 = (fTemp26 * fTemp14);
        const iTemp30: i32 = (<i32>Mathf.min(this.fConst9, <f32>max(0, <i32>(iTemp7 + 4))) + 1);
        this.fVec2[0] = (((((this.fRec14[((this.IOTA - iTemp8) & 2047)] * fTemp11) * fTemp13) * fTemp15) * fTemp17) + (fTemp18 * ((((((this.fRec14[((this.IOTA - iTemp19) & 2047)] * fTemp20) * fTemp21) * fTemp22) + (0.5 * (((fTemp10 * this.fRec14[((this.IOTA - iTemp23) & 2047)]) * fTemp24) * fTemp25))) + (0.166666672 * ((fTemp26 * this.fRec14[((this.IOTA - iTemp27) & 2047)]) * fTemp28))) + (0.0416666679 * (fTemp29 * this.fRec14[((this.IOTA - iTemp30) & 2047)])))));
        this.fRec11[0] = this.fVec2[1];
        const fRec7: f32 = fRec10;
        const fRec8: f32 = this.fRec11[0];
        const fRec9: f32 = this.fRec11[0];
        this.fRec2[(this.IOTA & 2047)] = fRec7;
        const fRec3: f32 = (((((fTemp11 * fTemp13) * fTemp15) * fTemp17) * this.fRec2[((this.IOTA - iTemp8) & 2047)]) + (fTemp18 * ((((((fTemp20 * fTemp21) * fTemp22) * this.fRec2[((this.IOTA - iTemp19) & 2047)]) + (0.5 * (((fTemp10 * fTemp24) * fTemp25) * this.fRec2[((this.IOTA - iTemp23) & 2047)]))) + (0.166666672 * ((fTemp26 * fTemp28) * this.fRec2[((this.IOTA - iTemp27) & 2047)]))) + (0.0416666679 * (fTemp29 * this.fRec2[((this.IOTA - iTemp30) & 2047)])))));
        const fRec4: f32 = fRec8;
        const fRec5: f32 = fRec9;
        this.fRec0[0] = fRec3;
        const fRec1: f32 = fRec5;
        const fTemp31: f32 = (fSlow0 * fRec1);
        const output: f32 = fTemp31;

        this.iRec6[1] = this.iRec6[0];
        this.fRec12[1] = this.fRec12[0];
        this.fRec16[1] = this.fRec16[0];
        this.fVec1[1] = this.fVec1[0];
        this.fRec17[1] = this.fRec17[0];
        this.iRec19[1] = this.iRec19[0];
        this.fRec18[2] = this.fRec18[1];
        this.fRec18[1] = this.fRec18[0];
        this.fRec13[1] = this.fRec13[0];
        this.IOTA = (this.IOTA + 1);
        this.fRec20[1] = this.fRec20[0];
        this.fVec2[1] = this.fVec2[0];
        this.fRec11[1] = this.fRec11[0];
        this.fRec0[1] = this.fRec0[0];

        if (Mathf.abs(output) < 0.00001) {
            this.silentSamples++;
        } else {
            this.silentSamples = 0;
        }

        this.channel.signal.addMonoSignal(output, 0.5, 0.5);
    }
}
