// Faust-generated ElecGuitar
// Auto-transpiled from Faust DSP by faust2as.js (AS backend)
// Source: elecGuitarMIDI.dsp

import { MidiVoice, MidiChannel, midichannels } from '../midisynth';
import { notefreq } from '../../synth/note';
import { SAMPLERATE } from '../../environment';

// bend (CC 0)
let elecGuitarMIDI_fHslider3: f32 = 0.0;
// sustain (CC 1)
let elecGuitarMIDI_fHslider4: f32 = 0.0;
// pluckPosition (CC 2)
let elecGuitarMIDI_fHslider1: f32 = 0.8;
// outGain (CC 3)
let elecGuitarMIDI_fHslider0: f32 = 0.5;

export class ElecGuitar extends MidiVoice {
    private fConst0: f32;
    private fConst1: f32;
    private fConst2: f32;
    private fConst3: f32;
    private fRec29: StaticArray<f32> = new StaticArray<f32>(2);
    private fHslider2: f32 = 4.4e+02;
    private fButton0: f32 = 0.0;
    private fVec0: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec30: StaticArray<f32> = new StaticArray<f32>(2);
    private IOTA0: i32 = 0;
    private fConst4: f32;
    private fRec25: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec31: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec33: StaticArray<f32> = new StaticArray<f32>(4);
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
    private releaseSamples: i32 = 0;

    constructor(channel: MidiChannel) {
        super(channel);
        this.instanceConstants();
        this.instanceClear();
    }

    private instanceConstants(): void {
        this.fConst0 = min<f32>(1.92e+05, max<f32>(1.0, SAMPLERATE));
        this.fConst1 = 0.0014705883 * this.fConst0;
        this.fConst2 = 44.1 / this.fConst0;
        this.fConst3 = 1.0 - this.fConst2;
        this.fConst4 = 0.00882353 * this.fConst0;
        this.fConst5 = 15.707963 / this.fConst0;
        this.fConst6 = 0.002 * this.fConst0;
    }

    private instanceClear(): void {
        for (let l0: i32 = 0; l0 < 2; l0 = l0 + 1) { this.fRec29[l0] = 0.0; }
        for (let l1: i32 = 0; l1 < 2; l1 = l1 + 1) { this.fVec0[l1] = 0.0; }
        for (let l2: i32 = 0; l2 < 2; l2 = l2 + 1) { this.fRec30[l2] = 0.0; }
        this.IOTA0 = 0;
        for (let l3: i32 = 0; l3 < 2; l3 = l3 + 1) { this.fRec25[l3] = 0.0; }
        for (let l4: i32 = 0; l4 < 2; l4 = l4 + 1) { this.fRec31[l4] = 0.0; }
        for (let l5: i32 = 0; l5 < 4; l5 = l5 + 1) { this.fRec33[l5] = 0.0; }
        for (let l6: i32 = 0; l6 < 2048; l6 = l6 + 1) { this.fRec34[l6] = 0.0; }
        for (let l7: i32 = 0; l7 < 2; l7 = l7 + 1) { this.fVec1[l7] = 0.0; }
        for (let l8: i32 = 0; l8 < 2; l8 = l8 + 1) { this.iRec36[l8] = 0; }
        for (let l9: i32 = 0; l9 < 3; l9 = l9 + 1) { this.fRec35[l9] = 0.0; }
        for (let l10: i32 = 0; l10 < 2; l10 = l10 + 1) { this.iRec37[l10] = 0; }
        for (let l11: i32 = 0; l11 < 3; l11 = l11 + 1) { this.fVec2[l11] = 0.0; }
        for (let l12: i32 = 0; l12 < 2048; l12 = l12 + 1) { this.fRec32[l12] = 0.0; }
        for (let l13: i32 = 0; l13 < 2; l13 = l13 + 1) { this.fRec21[l13] = 0.0; }
        for (let l14: i32 = 0; l14 < 2; l14 = l14 + 1) { this.fRec17[l14] = 0.0; }
        for (let l15: i32 = 0; l15 < 2048; l15 = l15 + 1) { this.fRec13[l15] = 0.0; }
        for (let l16: i32 = 0; l16 < 2; l16 = l16 + 1) { this.fRec15[l16] = 0.0; }
        for (let l17: i32 = 0; l17 < 4; l17 = l17 + 1) { this.fRec11[l17] = 0.0; }
        for (let l18: i32 = 0; l18 < 2; l18 = l18 + 1) { this.fRec6[l18] = 0.0; }
        for (let l19: i32 = 0; l19 < 2048; l19 = l19 + 1) { this.fRec2[l19] = 0.0; }
        for (let l20: i32 = 0; l20 < 2; l20 = l20 + 1) { this.fRec0[l20] = 0.0; }
    }

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.fHslider2 = notefreq(note);
        this.fHslider5 = <f32>velocity / 127.0;
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
        const fSlow0: f32 = elecGuitarMIDI_fHslider0;
        const fSlow1: f32 = this.fConst2 * elecGuitarMIDI_fHslider1;
        const fSlow2: f32 = this.fHslider2;
        const fSlow3: f32 = 3.4e+02 / fSlow2;
        const fSlow4: f32 = Mathf.pow(2.0, 0.083333336 * elecGuitarMIDI_fHslider3);
        const fSlow5: f32 = min<f32>(1.0, this.fButton0 + elecGuitarMIDI_fHslider4);
        const iSlow6: i32 = fSlow5 == 0.0;
        const fSlow7: f32 = this.fHslider5;
        const fSlow8: f32 = this.fConst5 * fSlow2;
        const fSlow9: f32 = 0.0005 * fSlow2;

        const fRec10: f32 = -(0.9973053 * (0.9 * this.fRec11[2] + 0.05 * (this.fRec11[1] + this.fRec11[3])));
        this.fRec29[0] = fSlow1 + this.fConst3 * this.fRec29[1];
        this.fVec0[0] = fSlow5;
        const fTemp0: f32 = <f32>((fSlow5 == this.fVec0[1]) | iSlow6);
        this.fRec30[0] = fSlow4 * (1.0 - 0.999 * fTemp0) + 0.999 * fTemp0 * this.fRec30[1];
        const fTemp1: f32 = fSlow3 / this.fRec30[0] + -0.11;
        const fTemp2: f32 = this.fConst1 * (1.0 - this.fRec29[0]) * fTemp1;
        const fTemp3: f32 = fTemp2 + -1.499995;
        const fTemp4: f32 = Mathf.floor(fTemp3);
        const fTemp5: f32 = fTemp2 + (-4.0 - fTemp4);
        const fTemp6: f32 = fTemp2 + (-3.0 - fTemp4);
        const fTemp7: f32 = fTemp2 + (-2.0 - fTemp4);
        const iTemp8: i32 = <i32>(fTemp3);
        const iTemp9: i32 = <i32>(min<f32>(this.fConst4, <f32>(max<i32>(0, iTemp8))));
        const fTemp10: f32 = fTemp2 + (-1.0 - fTemp4);
        const fTemp11: f32 = fTemp2 - fTemp4;
        const iTemp12: i32 = <i32>(min<f32>(this.fConst4, <f32>(max<i32>(0, iTemp8 + 1))));
        const fTemp13: f32 = fTemp11 * fTemp10;
        const iTemp14: i32 = <i32>(min<f32>(this.fConst4, <f32>(max<i32>(0, iTemp8 + 2))));
        const fTemp15: f32 = fTemp13 * fTemp7;
        const iTemp16: i32 = <i32>(min<f32>(this.fConst4, <f32>(max<i32>(0, iTemp8 + 3))));
        const fTemp17: f32 = fTemp15 * fTemp6;
        const iTemp18: i32 = <i32>(min<f32>(this.fConst4, <f32>(max<i32>(0, iTemp8 + 4))));
        this.fRec25[0] = fTemp5 * (fTemp6 * (fTemp7 * (0.041666668 * this.fRec2[(this.IOTA0 - (iTemp9 + 1)) & 2047] * fTemp10 - 0.16666667 * fTemp11 * this.fRec2[(this.IOTA0 - (iTemp12 + 1)) & 2047]) + 0.25 * fTemp13 * this.fRec2[(this.IOTA0 - (iTemp14 + 1)) & 2047]) - 0.16666667 * fTemp15 * this.fRec2[(this.IOTA0 - (iTemp16 + 1)) & 2047]) + 0.041666668 * fTemp17 * this.fRec2[(this.IOTA0 - (iTemp18 + 1)) & 2047];
        this.fRec31[0] = 0.95 * this.fRec25[1] + 0.05 * this.fRec31[1];
        const fRec26: f32 = this.fRec31[0];
        const fTemp19: f32 = this.fConst1 * this.fRec29[0] * fTemp1;
        const fTemp20: f32 = fTemp19 + -1.499995;
        const fTemp21: f32 = Mathf.floor(fTemp20);
        const fTemp22: f32 = fTemp19 + (-4.0 - fTemp21);
        const fTemp23: f32 = fTemp19 + (-3.0 - fTemp21);
        const fTemp24: f32 = fTemp19 + (-2.0 - fTemp21);
        this.fRec33[0] = this.fRec0[1];
        this.fRec34[this.IOTA0 & 2047] = -(0.9973053 * (0.9 * this.fRec33[2] + 0.05 * (this.fRec33[1] + this.fRec33[3])));
        const iTemp25: i32 = <i32>(fTemp20);
        const iTemp26: i32 = <i32>(min<f32>(this.fConst4, <f32>(max<i32>(0, iTemp25))));
        const fTemp27: f32 = fTemp19 + (-1.0 - fTemp21);
        const fTemp28: f32 = fTemp19 - fTemp21;
        const iTemp29: i32 = <i32>(min<f32>(this.fConst4, <f32>(max<i32>(0, iTemp25 + 1))));
        const fTemp30: f32 = fTemp28 * fTemp27;
        const iTemp31: i32 = <i32>(min<f32>(this.fConst4, <f32>(max<i32>(0, iTemp25 + 2))));
        const fTemp32: f32 = fTemp30 * fTemp24;
        const iTemp33: i32 = <i32>(min<f32>(this.fConst4, <f32>(max<i32>(0, iTemp25 + 3))));
        const fTemp34: f32 = fTemp32 * fTemp23;
        const iTemp35: i32 = <i32>(min<f32>(this.fConst4, <f32>(max<i32>(0, iTemp25 + 4))));
        this.fVec1[0] = fTemp22 * (fTemp23 * (fTemp24 * (0.041666668 * this.fRec34[(this.IOTA0 - (iTemp26 + 2)) & 2047] * fTemp27 - 0.16666667 * fTemp28 * this.fRec34[(this.IOTA0 - (iTemp29 + 2)) & 2047]) + 0.25 * fTemp30 * this.fRec34[(this.IOTA0 - (iTemp31 + 2)) & 2047]) - 0.16666667 * fTemp32 * this.fRec34[(this.IOTA0 - (iTemp33 + 2)) & 2047]) + 0.041666668 * fTemp34 * this.fRec34[(this.IOTA0 - (iTemp35 + 2)) & 2047];
        this.iRec36[0] = 1103515245 * this.iRec36[1] + 12345;
        const fTemp36: f32 = Mathf.tan(fSlow8 * this.fRec30[0]);
        const fTemp37: f32 = 1.0 / fTemp36;
        const fTemp38: f32 = (fTemp37 + 1.4142135) / fTemp36 + 1.0;
        this.fRec35[0] = 4.656613e-10 * <f32>(this.iRec36[0]) - (this.fRec35[2] * ((fTemp37 + -1.4142135) / fTemp36 + 1.0) + 2.0 * this.fRec35[1] * (1.0 - 1.0 / Mathf.pow(fTemp36, 2.0))) / fTemp38;
        this.iRec37[0] = (this.iRec37[1] + (this.iRec37[1] > 0)) * (fSlow5 <= this.fVec0[1]) + (fSlow5 > this.fVec0[1]);
        const fTemp39: f32 = <f32>(this.iRec37[0]) / max<f32>(1.0, this.fConst6 * Mathf.pow(1.0 - fSlow9 * this.fRec30[0], 2.0));
        const fTemp40: f32 = fSlow7 * ((this.fRec35[2] + this.fRec35[0] + 2.0 * this.fRec35[1]) * max<f32>(0.0, min<f32>(fTemp39, 2.0 - fTemp39)) / fTemp38);
        const fTemp41: f32 = this.fVec1[1] + fTemp40;
        this.fVec2[0] = fTemp41;
        this.fRec32[this.IOTA0 & 2047] = 0.95 * this.fVec2[2] + 0.05 * this.fRec32[(this.IOTA0 - 1) & 2047];
        const fRec27: f32 = fTemp5 * (fTemp6 * (fTemp7 * (0.041666668 * fTemp10 * this.fRec32[(this.IOTA0 - iTemp9) & 2047] - 0.16666667 * fTemp11 * this.fRec32[(this.IOTA0 - iTemp12) & 2047]) + 0.25 * fTemp13 * this.fRec32[(this.IOTA0 - iTemp14) & 2047]) - 0.16666667 * fTemp15 * this.fRec32[(this.IOTA0 - iTemp16) & 2047]) + 0.041666668 * fTemp17 * this.fRec32[(this.IOTA0 - iTemp18) & 2047];
        const fRec28: f32 = this.fVec2[1] + this.fRec21[1];
        this.fRec21[0] = fRec26;
        const fRec22: f32 = this.fRec21[1];
        const fRec23: f32 = fRec27;
        const fRec24: f32 = fRec28;
        this.fRec17[0] = fRec22;
        const fRec18: f32 = fTemp40 + this.fRec17[1];
        const fRec19: f32 = fRec23;
        const fRec20: f32 = fRec24;
        this.fRec13[this.IOTA0 & 2047] = fRec18;
        const fRec14: f32 = fTemp22 * (fTemp23 * (fTemp24 * (0.041666668 * fTemp27 * this.fRec13[(this.IOTA0 - (iTemp26 + 1)) & 2047] - 0.16666667 * fTemp28 * this.fRec13[(this.IOTA0 - (iTemp29 + 1)) & 2047]) + 0.25 * fTemp30 * this.fRec13[(this.IOTA0 - (iTemp31 + 1)) & 2047]) - 0.16666667 * fTemp32 * this.fRec13[(this.IOTA0 - (iTemp33 + 1)) & 2047]) + 0.041666668 * fTemp34 * this.fRec13[(this.IOTA0 - (iTemp35 + 1)) & 2047];
        this.fRec15[0] = fRec19;
        const fRec16: f32 = fRec20;
        this.fRec11[0] = this.fRec15[1];
        const fRec12: f32 = fRec16;
        this.fRec6[0] = fRec10;
        const fRec7: f32 = this.fRec6[1];
        const fRec8: f32 = this.fRec11[0];
        const fRec9: f32 = fRec12;
        this.fRec2[this.IOTA0 & 2047] = fRec7;
        const fRec3: f32 = fRec14;
        const fRec4: f32 = fRec8;
        const fRec5: f32 = fRec9;
        this.fRec0[0] = fRec3;
        const fRec1: f32 = fRec5;
        const fTemp42: f32 = fSlow0 * fRec1;
        const output: f32 = fTemp42;

        this.fRec29[1] = this.fRec29[0];
        this.fVec0[1] = this.fVec0[0];
        this.fRec30[1] = this.fRec30[0];
        this.IOTA0 = this.IOTA0 + 1;
        this.fRec25[1] = this.fRec25[0];
        this.fRec31[1] = this.fRec31[0];
        for (let j0: i32 = 3; j0 > 0; j0 = j0 - 1) {
        this.fRec33[j0] = this.fRec33[j0 - 1];
        }
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
        for (let j1: i32 = 3; j1 > 0; j1 = j1 - 1) {
        this.fRec11[j1] = this.fRec11[j1 - 1];
        }
        this.fRec6[1] = this.fRec6[0];
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

export class ElecGuitarChannel extends MidiChannel {
    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case 0:
                elecGuitarMIDI_fHslider3 = -2 + <f32>value / 127.0 * 4;
                break;
            case 1:
                elecGuitarMIDI_fHslider4 = <f32>value / 127.0;
                break;
            case 2:
                elecGuitarMIDI_fHslider1 = <f32>value / 127.0;
                break;
            case 3:
                elecGuitarMIDI_fHslider0 = <f32>value / 127.0;
                break;
        }
    }
}

export function initializeMidiSynth(): void {
    midichannels[0] = new ElecGuitarChannel(10, (channel: MidiChannel) => new ElecGuitar(channel));
    midichannels[0].controlchange(7, 100);
    midichannels[0].controlchange(10, 64);
    midichannels[0].controlchange(91, 10);

    // bend (CC 0, range: -2–2, default: 0)
    midichannels[0].controlchange(0, 64);
    // sustain (CC 1, range: 0–1, default: 0)
    midichannels[0].controlchange(1, 0);
    // pluckPosition (CC 2, range: 0–1, default: 0.8)
    midichannels[0].controlchange(2, 102);
    // outGain (CC 3, range: 0–1, default: 0.5)
    midichannels[0].controlchange(3, 64);
}

export function postprocess(): void {
}
