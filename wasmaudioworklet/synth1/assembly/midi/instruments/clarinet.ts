// Faust-generated Clarinet
// Auto-transpiled from Faust DSP by faust2as.js (AS backend)
// Source: clarinetMIDI.dsp

import { MidiVoice, MidiChannel, midichannels } from '../midisynth';
import { notefreq } from '../../synth/note';
import { SAMPLERATE } from '../../environment';

const ftbl0SIG0: StaticArray<f32> = new StaticArray<f32>(65536);
let _sig0_initialized: bool = false;

function _initSIG0Tables(): void {
    if (_sig0_initialized) return;
    _sig0_initialized = true;
    const sig0_iVec2: StaticArray<i32> = new StaticArray<i32>(2);
    const sig0_iRec15: StaticArray<i32> = new StaticArray<i32>(2);
    for (let i: i32 = 0; i < ftbl0SIG0.length; i = i + 1) {
        sig0_iVec2[0] = 1;
        sig0_iRec15[0] = (sig0_iVec2[1] + sig0_iRec15[1]) % 65536;
        ftbl0SIG0[i] = Mathf.sin(9.58738e-05 * <f32>(sig0_iRec15[0]));
        sig0_iVec2[1] = sig0_iVec2[0];
        sig0_iRec15[1] = sig0_iRec15[0];
    }
}

// bend (CC 0)
let clarinetMIDI_fHslider3: f32 = 0.0;
// envAttack (CC 1)
let clarinetMIDI_fHslider7: f32 = 1.0;
// sustain (CC 2)
let clarinetMIDI_fHslider4: f32 = 0.0;
// reedStiffness (CC 3)
let clarinetMIDI_fHslider9: f32 = 0.5;
// bellOpening (CC 4)
let clarinetMIDI_fHslider1: f32 = 0.5;
// vibratoFreq (CC 5)
let clarinetMIDI_fHslider8: f32 = 5.0;
// vibratoGain (CC 6)
let clarinetMIDI_fHslider5: f32 = 0.25;
// outGain (CC 8)
let clarinetMIDI_fHslider0: f32 = 0.5;

export class Clarinet extends MidiVoice {
    private iRec6: StaticArray<i32> = new StaticArray<i32>(2);
    private iVec0: StaticArray<i32> = new StaticArray<i32>(2);
    private fRec12: StaticArray<f32> = new StaticArray<f32>(2);
    private fConst0: f32;
    private fConst1: f32;
    private fHslider2: f32 = 4.4e+02;
    private fButton0: f32 = 0.0;
    private fVec1: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec13: StaticArray<f32> = new StaticArray<f32>(2);
    private fHslider6: f32 = 0.6;
    private fConst2: f32;
    private fRec14: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec16: StaticArray<f32> = new StaticArray<f32>(2);
    private fConst3: f32;
    private fConst4: f32;
    private fConst5: f32;
    private fConst6: f32;
    private iRec20: StaticArray<i32> = new StaticArray<i32>(2);
    private fConst7: f32;
    private fConst8: f32;
    private fConst9: f32;
    private fRec19: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec17: StaticArray<f32> = new StaticArray<f32>(2);
    private IOTA0: i32 = 0;
    private fRec18: StaticArray<f32> = new StaticArray<f32>(2048);
    private fConst10: f32;
    private fVec3: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec11: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec2: StaticArray<f32> = new StaticArray<f32>(2048);
    private fRec0: StaticArray<f32> = new StaticArray<f32>(2);
    private silentSamples: i32 = 0;
    private releaseSamples: i32 = 0;

    constructor(channel: MidiChannel) {
        super(channel);
        _initSIG0Tables();
        this.instanceConstants();
        this.instanceClear();
    }

    private instanceConstants(): void {
        this.fConst0 = min<f32>(1.92e+05, max<f32>(1.0, SAMPLERATE));
        this.fConst1 = 0.0014705883 * this.fConst0;
        this.fConst2 = 1.0 / this.fConst0;
        this.fConst3 = Mathf.tan(6283.1855 / this.fConst0);
        this.fConst4 = 1.0 / this.fConst3;
        this.fConst5 = (this.fConst4 + 1.4142135) / this.fConst3 + 1.0;
        this.fConst6 = 0.05 / this.fConst5;
        this.fConst7 = 1.0 / this.fConst5;
        this.fConst8 = (this.fConst4 + -1.4142135) / this.fConst3 + 1.0;
        this.fConst9 = 2.0 * (1.0 - 1.0 / Mathf.pow(this.fConst3, 2.0));
        this.fConst10 = 0.00882353 * this.fConst0;
    }

    private instanceClear(): void {
        for (let l0: i32 = 0; l0 < 2; l0 = l0 + 1) { this.iRec6[l0] = 0; }
        for (let l1: i32 = 0; l1 < 2; l1 = l1 + 1) { this.iVec0[l1] = 0; }
        for (let l2: i32 = 0; l2 < 2; l2 = l2 + 1) { this.fRec12[l2] = 0.0; }
        for (let l3: i32 = 0; l3 < 2; l3 = l3 + 1) { this.fVec1[l3] = 0.0; }
        for (let l4: i32 = 0; l4 < 2; l4 = l4 + 1) { this.fRec13[l4] = 0.0; }
        for (let l5: i32 = 0; l5 < 2; l5 = l5 + 1) { this.fRec14[l5] = 0.0; }
        for (let l8: i32 = 0; l8 < 2; l8 = l8 + 1) { this.fRec16[l8] = 0.0; }
        for (let l9: i32 = 0; l9 < 2; l9 = l9 + 1) { this.iRec20[l9] = 0; }
        for (let l10: i32 = 0; l10 < 3; l10 = l10 + 1) { this.fRec19[l10] = 0.0; }
        for (let l11: i32 = 0; l11 < 2; l11 = l11 + 1) { this.fRec17[l11] = 0.0; }
        this.IOTA0 = 0;
        for (let l12: i32 = 0; l12 < 2048; l12 = l12 + 1) { this.fRec18[l12] = 0.0; }
        for (let l13: i32 = 0; l13 < 2; l13 = l13 + 1) { this.fVec3[l13] = 0.0; }
        for (let l14: i32 = 0; l14 < 2; l14 = l14 + 1) { this.fRec11[l14] = 0.0; }
        for (let l15: i32 = 0; l15 < 2048; l15 = l15 + 1) { this.fRec2[l15] = 0.0; }
        for (let l16: i32 = 0; l16 < 2; l16 = l16 + 1) { this.fRec0[l16] = 0.0; }
    }

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.fHslider2 = notefreq(note);
        this.fHslider6 = <f32>velocity / 127.0;
        this.fButton0 = 0.0;
        this.nextframe();
        this.fButton0 = 1.0;
        this.silentSamples = 0;
        this.releaseSamples = 0;
    }

    noteoff(): void {
        this.fButton0 = 0.0;
        this.silentSamples = 0;
        this.releaseSamples = 0;
    }

    isDone(): boolean {
        return this.fButton0 == 0.0 && (this.silentSamples > 4410 || this.releaseSamples > 132300);
    }

    nextframe(): void {
        const fSlow0: f32 = clarinetMIDI_fHslider0;
        const fSlow1: f32 = clarinetMIDI_fHslider1;
        const fSlow2: f32 = 1.0 - fSlow1;
        const fSlow3: f32 = 1.7e+02 / this.fHslider2;
        const fSlow4: f32 = Mathf.pow(2.0, 0.083333336 * clarinetMIDI_fHslider3);
        const fSlow5: f32 = min<f32>(1.0, this.fButton0 + clarinetMIDI_fHslider4);
        const iSlow6: i32 = fSlow5 == 0.0;
        const fSlow7: f32 = 0.01 * clarinetMIDI_fHslider5;
        const fSlow8: f32 = 0.001 * clarinetMIDI_fHslider7;
        const iSlow9: i32 = Mathf.abs(fSlow8) < 1.1920929e-07;
        const fSlow10: f32 = ((iSlow9) ? 0.0 : Mathf.exp(-(this.fConst2 / ((iSlow9) ? 1.0 : fSlow8))));
        const fSlow11: f32 = this.fHslider6 * fSlow5 * (1.0 - fSlow10);
        const fSlow12: f32 = this.fConst2 * clarinetMIDI_fHslider8;
        const fSlow13: f32 = 0.26 * clarinetMIDI_fHslider9 + -0.44;

        this.iRec6[0] = 0;
        this.iVec0[0] = 1;
        this.fRec12[0] = fSlow2 * this.fRec11[1] + fSlow1 * this.fRec12[1];
        const fRec10: f32 = this.fRec12[0] + <f32>(this.iRec6[1]);
        this.fVec1[0] = fSlow5;
        const fTemp0: f32 = <f32>((fSlow5 == this.fVec1[1]) | iSlow6);
        this.fRec13[0] = fSlow4 * (1.0 - 0.999 * fTemp0) + 0.999 * fTemp0 * this.fRec13[1];
        this.fRec14[0] = fSlow11 + fSlow10 * this.fRec14[1];
        const fTemp1: f32 = ((1 - this.iVec0[1]) ? 0.0 : fSlow12 + this.fRec16[1]);
        this.fRec16[0] = fTemp1 - Mathf.floor(fTemp1);
        const fTemp2: f32 = ftbl0SIG0[max<i32>(0, min<i32>(<i32>(65536.0 * this.fRec16[0]), 65535))];
        const fTemp3: f32 = this.fConst1 * (fSlow3 / (this.fRec13[0] * (fSlow7 * this.fRec14[0] * fTemp2 + 1.0)) + -0.05);
        const fTemp4: f32 = fTemp3 + -1.499995;
        const fTemp5: f32 = Mathf.floor(fTemp4);
        const fTemp6: f32 = fTemp3 + (-4.0 - fTemp5);
        const fTemp7: f32 = fTemp3 + (-3.0 - fTemp5);
        const fTemp8: f32 = fTemp3 + (-2.0 - fTemp5);
        this.iRec20[0] = 1103515245 * this.iRec20[1] + 12345;
        this.fRec19[0] = 4.656613e-10 * <f32>(this.iRec20[0]) - this.fConst7 * (this.fConst8 * this.fRec19[2] + this.fConst9 * this.fRec19[1]);
        const fTemp9: f32 = this.fRec14[0] * (this.fConst6 * (this.fRec19[2] + this.fRec19[0] + 2.0 * this.fRec19[1]) + 1.0);
        const fTemp10: f32 = fSlow7 * fTemp2;
        this.fRec17[0] = fTemp9 + this.fRec0[1] + fTemp10;
        this.fRec18[this.IOTA0 & 2047] = fTemp10 + fTemp9 - this.fRec17[1] * max<f32>(-1.0, min<f32>(1.0, 0.7 - fSlow13 * this.fRec17[1]));
        const iTemp11: i32 = <i32>(fTemp4);
        const iTemp12: i32 = <i32>(min<f32>(this.fConst10, <f32>(max<i32>(0, iTemp11)))) + 1;
        const fTemp13: f32 = fTemp3 + (-1.0 - fTemp5);
        const fTemp14: f32 = fTemp3 - fTemp5;
        const iTemp15: i32 = <i32>(min<f32>(this.fConst10, <f32>(max<i32>(0, iTemp11 + 1)))) + 1;
        const fTemp16: f32 = fTemp14 * fTemp13;
        const iTemp17: i32 = <i32>(min<f32>(this.fConst10, <f32>(max<i32>(0, iTemp11 + 2)))) + 1;
        const fTemp18: f32 = fTemp16 * fTemp8;
        const iTemp19: i32 = <i32>(min<f32>(this.fConst10, <f32>(max<i32>(0, iTemp11 + 3)))) + 1;
        const fTemp20: f32 = fTemp18 * fTemp7;
        const iTemp21: i32 = <i32>(min<f32>(this.fConst10, <f32>(max<i32>(0, iTemp11 + 4)))) + 1;
        this.fVec3[0] = fTemp6 * (fTemp7 * (fTemp8 * (0.041666668 * this.fRec18[(this.IOTA0 - iTemp12) & 2047] * fTemp13 - 0.16666667 * fTemp14 * this.fRec18[(this.IOTA0 - iTemp15) & 2047]) + 0.25 * fTemp16 * this.fRec18[(this.IOTA0 - iTemp17) & 2047]) - 0.16666667 * fTemp18 * this.fRec18[(this.IOTA0 - iTemp19) & 2047]) + 0.041666668 * fTemp20 * this.fRec18[(this.IOTA0 - iTemp21) & 2047];
        this.fRec11[0] = this.fVec3[1];
        const fRec7: f32 = fRec10;
        const fRec8: f32 = this.fRec11[0];
        const fRec9: f32 = this.fRec11[0];
        this.fRec2[this.IOTA0 & 2047] = fRec7;
        const fRec3: f32 = fTemp6 * (fTemp7 * (fTemp8 * (0.041666668 * fTemp13 * this.fRec2[(this.IOTA0 - iTemp12) & 2047] - 0.16666667 * fTemp14 * this.fRec2[(this.IOTA0 - iTemp15) & 2047]) + 0.25 * fTemp16 * this.fRec2[(this.IOTA0 - iTemp17) & 2047]) - 0.16666667 * fTemp18 * this.fRec2[(this.IOTA0 - iTemp19) & 2047]) + 0.041666668 * fTemp20 * this.fRec2[(this.IOTA0 - iTemp21) & 2047];
        const fRec4: f32 = fRec8;
        const fRec5: f32 = fRec9;
        this.fRec0[0] = fRec3;
        const fRec1: f32 = fRec5;
        const fTemp22: f32 = fSlow0 * fRec1;
        const output: f32 = fTemp22;

        this.iRec6[1] = this.iRec6[0];
        this.iVec0[1] = this.iVec0[0];
        this.fRec12[1] = this.fRec12[0];
        this.fVec1[1] = this.fVec1[0];
        this.fRec13[1] = this.fRec13[0];
        this.fRec14[1] = this.fRec14[0];
        this.fRec16[1] = this.fRec16[0];
        this.iRec20[1] = this.iRec20[0];
        this.fRec19[2] = this.fRec19[1];
        this.fRec19[1] = this.fRec19[0];
        this.fRec17[1] = this.fRec17[0];
        this.IOTA0 = this.IOTA0 + 1;
        this.fVec3[1] = this.fVec3[0];
        this.fRec11[1] = this.fRec11[0];
        this.fRec0[1] = this.fRec0[0];

        if (Mathf.abs(output) < 0.001) {
            this.silentSamples++;
        } else {
            this.silentSamples = 0;
        }
        if (this.fButton0 == 0.0) this.releaseSamples++;

        this.channel.signal.addMonoSignal(output, 0.5, 0.5);
    }
}

export class ClarinetChannel extends MidiChannel {
    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case 0:
                clarinetMIDI_fHslider3 = -2 + <f32>value / 127.0 * 4;
                break;
            case 1:
                clarinetMIDI_fHslider7 = <f32>value / 127.0 * 30;
                break;
            case 2:
                clarinetMIDI_fHslider4 = <f32>value / 127.0;
                break;
            case 3:
                clarinetMIDI_fHslider9 = <f32>value / 127.0;
                break;
            case 4:
                clarinetMIDI_fHslider1 = <f32>value / 127.0;
                break;
            case 5:
                clarinetMIDI_fHslider8 = 1 + <f32>value / 127.0 * 9;
                break;
            case 6:
                clarinetMIDI_fHslider5 = <f32>value / 127.0;
                break;
            case 8:
                clarinetMIDI_fHslider0 = <f32>value / 127.0;
                break;
        }
    }
}

export function initializeMidiSynth(): void {
    midichannels[0] = new ClarinetChannel(10, (channel: MidiChannel) => new Clarinet(channel));
    midichannels[0].controlchange(7, 100);
    midichannels[0].controlchange(10, 64);
    midichannels[0].controlchange(91, 10);

    // bend (CC 0, range: -2–2, default: 0)
    midichannels[0].controlchange(0, 64);
    // envAttack (CC 1, range: 0–30, default: 1)
    midichannels[0].controlchange(1, 4);
    // sustain (CC 2, range: 0–1, default: 0)
    midichannels[0].controlchange(2, 0);
    // reedStiffness (CC 3, range: 0–1, default: 0.5)
    midichannels[0].controlchange(3, 64);
    // bellOpening (CC 4, range: 0–1, default: 0.5)
    midichannels[0].controlchange(4, 64);
    // vibratoFreq (CC 5, range: 1–10, default: 5)
    midichannels[0].controlchange(5, 56);
    // vibratoGain (CC 6, range: 0–1, default: 0.25)
    midichannels[0].controlchange(6, 32);
    // outGain (CC 8, range: 0–1, default: 0.5)
    midichannels[0].controlchange(8, 64);
}

export function postprocess(): void {
}
