// Faust-generated synth bundle
// Auto-transpiled from Faust DSP by faust2as.js
// Sources: dx7.dsp

import { notefreq, midichannels, MidiChannel, MidiVoice } from '../mixes/globalimports';
import { SAMPLERATE } from '../environment';

@inline function _fcast<T>(x: T): f32 { return <f32>x; }
@inline function _icast<T>(x: T): i32 { return <i32>x; }

// Feedback (CC 0)
let dx7_fHslider126: f32 = 0;
// Transpose (CC 1)
let dx7_fHslider2: f32 = 0;
// Osc Key Sync (CC 2)
let dx7_fHslider22: f32 = 1;
// L1 (CC 3)
let dx7_fHslider27: f32 = 50;
// L2 (CC 4)
let dx7_fHslider30: f32 = 50;
// L3 (CC 5)
let dx7_fHslider31: f32 = 50;
// L4 (CC 6)
let dx7_fHslider26: f32 = 50;
// R1 (CC 8)
let dx7_fHslider29: f32 = 99;
// R2 (CC 9)
let dx7_fHslider32: f32 = 99;
// R3 (CC 11)
let dx7_fHslider33: f32 = 99;
// R4 (CC 12)
let dx7_fHslider28: f32 = 99;
// Wave (CC 13)
let dx7_fEntry2: f32 = 0;
// Speed (CC 14)
let dx7_fHslider20: f32 = 35;
// Delay (CC 15)
let dx7_fHslider21: f32 = 0;
// PMD (CC 16)
let dx7_fHslider34: f32 = 0;
// AMD (CC 17)
let dx7_fHslider18: f32 = 0;
// Sync (CC 18)
let dx7_fHslider19: f32 = 1;
// P Mod Sens (CC 19)
let dx7_fHslider35: f32 = 3;
// Tune (CC 20)
let dx7_fHslider23: f32 = 0;
// Coarse (CC 21)
let dx7_fHslider24: f32 = 1;
// Fine (CC 22)
let dx7_fHslider25: f32 = 0;
// L1 (CC 23)
let dx7_fHslider0: f32 = 99;
// L2 (CC 24)
let dx7_fHslider13: f32 = 99;
// L3 (CC 25)
let dx7_fHslider14: f32 = 99;
// L4 (CC 26)
let dx7_fHslider11: f32 = 0;
// R1 (CC 27)
let dx7_fHslider9: f32 = 99;
// R2 (CC 28)
let dx7_fHslider15: f32 = 99;
// R3 (CC 29)
let dx7_fHslider16: f32 = 99;
// R4 (CC 30)
let dx7_fHslider12: f32 = 99;
// Level (CC 31)
let dx7_fHslider1: f32 = 99;
// Key Vel (CC 32)
let dx7_fHslider7: f32 = 0;
// A Mod Sens (CC 33)
let dx7_fHslider17: f32 = 0;
// Rate Scaling (CC 34)
let dx7_fHslider10: f32 = 0;
// Breakpoint (CC 35)
let dx7_fHslider4: f32 = 0;
// L Depth (CC 36)
let dx7_fHslider5: f32 = 0;
// R Depth (CC 37)
let dx7_fHslider6: f32 = 0;
// L Curve (CC 38)
let dx7_fEntry0: f32 = 0;
// R Curve (CC 39)
let dx7_fEntry1: f32 = 0;
// Tune (CC 40)
let dx7_fHslider51: f32 = 0;
// Coarse (CC 41)
let dx7_fHslider52: f32 = 1;
// Fine (CC 42)
let dx7_fHslider53: f32 = 0;
// L1 (CC 43)
let dx7_fHslider36: f32 = 99;
// L2 (CC 44)
let dx7_fHslider46: f32 = 99;
// L3 (CC 45)
let dx7_fHslider47: f32 = 99;
// L4 (CC 46)
let dx7_fHslider44: f32 = 0;
// R1 (CC 47)
let dx7_fHslider42: f32 = 99;
// R2 (CC 48)
let dx7_fHslider48: f32 = 99;
// R3 (CC 49)
let dx7_fHslider49: f32 = 99;
// R4 (CC 50)
let dx7_fHslider45: f32 = 99;
// Level (CC 51)
let dx7_fHslider37: f32 = 0;
// Key Vel (CC 52)
let dx7_fHslider41: f32 = 0;
// A Mod Sens (CC 53)
let dx7_fHslider50: f32 = 0;
// Rate Scaling (CC 54)
let dx7_fHslider43: f32 = 0;
// Breakpoint (CC 55)
let dx7_fHslider38: f32 = 0;
// L Depth (CC 56)
let dx7_fHslider39: f32 = 0;
// R Depth (CC 57)
let dx7_fHslider40: f32 = 0;
// L Curve (CC 58)
let dx7_fEntry3: f32 = 0;
// R Curve (CC 59)
let dx7_fEntry4: f32 = 0;
// Tune (CC 60)
let dx7_fHslider69: f32 = 0;
// Coarse (CC 61)
let dx7_fHslider70: f32 = 1;
// Fine (CC 62)
let dx7_fHslider71: f32 = 0;
// L1 (CC 63)
let dx7_fHslider54: f32 = 99;
// L2 (CC 65)
let dx7_fHslider64: f32 = 99;
// L3 (CC 66)
let dx7_fHslider65: f32 = 99;
// L4 (CC 67)
let dx7_fHslider62: f32 = 0;
// R1 (CC 68)
let dx7_fHslider60: f32 = 99;
// R2 (CC 69)
let dx7_fHslider66: f32 = 99;
// R3 (CC 70)
let dx7_fHslider67: f32 = 99;
// R4 (CC 71)
let dx7_fHslider63: f32 = 99;
// Level (CC 72)
let dx7_fHslider55: f32 = 0;
// Key Vel (CC 73)
let dx7_fHslider59: f32 = 0;
// A Mod Sens (CC 74)
let dx7_fHslider68: f32 = 0;
// Rate Scaling (CC 75)
let dx7_fHslider61: f32 = 0;
// Breakpoint (CC 76)
let dx7_fHslider56: f32 = 0;
// L Depth (CC 77)
let dx7_fHslider57: f32 = 0;
// R Depth (CC 78)
let dx7_fHslider58: f32 = 0;
// L Curve (CC 79)
let dx7_fEntry5: f32 = 0;
// R Curve (CC 80)
let dx7_fEntry6: f32 = 0;
// Tune (CC 81)
let dx7_fHslider87: f32 = 0;
// Coarse (CC 82)
let dx7_fHslider88: f32 = 1;
// Fine (CC 83)
let dx7_fHslider89: f32 = 0;
// L1 (CC 84)
let dx7_fHslider72: f32 = 99;
// L2 (CC 85)
let dx7_fHslider82: f32 = 99;
// L3 (CC 86)
let dx7_fHslider83: f32 = 99;
// L4 (CC 87)
let dx7_fHslider80: f32 = 0;
// R1 (CC 88)
let dx7_fHslider78: f32 = 99;
// R2 (CC 89)
let dx7_fHslider84: f32 = 99;
// R3 (CC 90)
let dx7_fHslider85: f32 = 99;
// R4 (CC 92)
let dx7_fHslider81: f32 = 99;
// Level (CC 93)
let dx7_fHslider73: f32 = 0;
// Key Vel (CC 94)
let dx7_fHslider77: f32 = 0;
// A Mod Sens (CC 95)
let dx7_fHslider86: f32 = 0;
// Rate Scaling (CC 96)
let dx7_fHslider79: f32 = 0;
// Breakpoint (CC 97)
let dx7_fHslider74: f32 = 0;
// L Depth (CC 98)
let dx7_fHslider75: f32 = 0;
// R Depth (CC 99)
let dx7_fHslider76: f32 = 0;
// L Curve (CC 100)
let dx7_fEntry7: f32 = 0;
// R Curve (CC 101)
let dx7_fEntry8: f32 = 0;
// Tune (CC 102)
let dx7_fHslider105: f32 = 0;
// Coarse (CC 103)
let dx7_fHslider106: f32 = 1;
// Fine (CC 104)
let dx7_fHslider107: f32 = 0;
// L1 (CC 105)
let dx7_fHslider90: f32 = 99;
// L2 (CC 106)
let dx7_fHslider100: f32 = 99;
// L3 (CC 107)
let dx7_fHslider101: f32 = 99;
// L4 (CC 108)
let dx7_fHslider98: f32 = 0;
// R1 (CC 109)
let dx7_fHslider96: f32 = 99;
// R2 (CC 110)
let dx7_fHslider102: f32 = 99;
// R3 (CC 111)
let dx7_fHslider103: f32 = 99;
// R4 (CC 112)
let dx7_fHslider99: f32 = 99;
// Level (CC 113)
let dx7_fHslider91: f32 = 0;
// Key Vel (CC 114)
let dx7_fHslider95: f32 = 0;
// A Mod Sens (CC 115)
let dx7_fHslider104: f32 = 0;
// Rate Scaling (CC 116)
let dx7_fHslider97: f32 = 0;
// Breakpoint (CC 117)
let dx7_fHslider92: f32 = 0;
// L Depth (CC 118)
let dx7_fHslider93: f32 = 0;
// R Depth (CC 119)
let dx7_fHslider94: f32 = 0;
// L Curve (CC 120)
let dx7_fEntry9: f32 = 0;
// R Curve (CC 121)
let dx7_fEntry10: f32 = 0;
// Tune (CC 122)
let dx7_fHslider123: f32 = 0;
// Coarse (CC 123)
let dx7_fHslider124: f32 = 1;
// Fine (CC 124)
let dx7_fHslider125: f32 = 0;
// L1 (CC 125)
let dx7_fHslider108: f32 = 99;
// L2 (CC 126)
let dx7_fHslider118: f32 = 99;
// L3 (CC 127)
let dx7_fHslider119: f32 = 99;
// L4
let dx7_fHslider116: f32 = 0;
// R1
let dx7_fHslider114: f32 = 99;
// R2
let dx7_fHslider120: f32 = 99;
// R3
let dx7_fHslider121: f32 = 99;
// R4
let dx7_fHslider117: f32 = 99;
// Level
let dx7_fHslider109: f32 = 0;
// Key Vel
let dx7_fHslider113: f32 = 0;
// A Mod Sens
let dx7_fHslider122: f32 = 0;
// Rate Scaling
let dx7_fHslider115: f32 = 0;
// Breakpoint
let dx7_fHslider110: f32 = 0;
// L Depth
let dx7_fHslider111: f32 = 0;
// R Depth
let dx7_fHslider112: f32 = 0;
// L Curve
let dx7_fEntry11: f32 = 0;
// R Curve
let dx7_fEntry12: f32 = 0;

const Dx7_wave_SIG0Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 5, 9, 13, 17, 20, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 42, 43, 45, 46]);
const Dx7_wave_SIG1Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14, 16, 19, 23, 27, 33, 39, 47, 56, 66, 80, 94, 110, 126, 142, 158, 174, 190, 206, 222, 238, 250]);
const Dx7_wave_SIG2Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 70, 86, 97, 106, 114, 121, 126, 132, 138, 142, 148, 152, 156, 160, 163, 166, 170, 173, 174, 178, 181, 184, 186, 189, 190, 194, 196, 198, 200, 202, 205, 206, 209, 211, 214, 216, 218, 220, 222, 224, 225, 227, 229, 230, 232, 233, 235, 237, 238, 240, 241, 242, 243, 244, 246, 246, 248, 249, 250, 251, 252, 253, 254]);
const Dx7_wave_SIG3Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1764000, 1764000, 1411200, 1411200, 1190700, 1014300, 992250, 882000, 705600, 705600, 584325, 507150, 502740, 441000, 418950, 352800, 308700, 286650, 253575, 220500, 220500, 176400, 145530, 145530, 125685, 110250, 110250, 88200, 88200, 74970, 61740, 61740, 55125, 48510, 44100, 37485, 31311, 30870, 27562, 27562, 22050, 18522, 17640, 15435, 14112, 13230, 11025, 9261, 9261, 7717, 6615, 6615, 5512, 5512, 4410, 3969, 3969, 3439, 2866, 2690, 2249, 1984, 1896, 1808, 1411, 1367, 1234, 1146, 926, 837, 837, 705, 573, 573, 529, 441, 441]);
const Dx7_wave_SIG4Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 4342338, 7171437, 16777216]);
const Dx7_wave_SIG5Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-16777216, 0, 16777216, 26591258, 33554432, 38955489, 43368474, 47099600, 50331648, 53182516, 55732705, 58039632, 60145690, 62083076, 63876816, 65546747, 67108864, 68576247, 69959732, 71268397, 72509921, 73690858, 74816848, 75892776, 76922906, 77910978, 78860292, 79773775, 80654032, 81503396, 82323963, 83117622]);
const Dx7_wave_SIG6Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-128, -116, -104, -95, -85, -76, -68, -61, -56, -52, -49, -46, -43, -41, -39, -37, -35, -33, -32, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 38, 40, 43, 46, 49, 53, 58, 65, 73, 82, 92, 103, 115, 127]);
const Dx7_wave_SIG7Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 33, 34, 36, 37, 38, 39, 41, 42, 44, 46, 47, 49, 51, 53, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 79, 82, 85, 88, 91, 94, 98, 102, 106, 110, 115, 120, 125, 130, 135, 141, 147, 153, 159, 165, 171, 178, 185, 193, 202, 211, 232, 243, 254, 255]);
const Dx7_wave_SIG8Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 10, 20, 33, 55, 92, 153, 255]);

const Dx7_itbl0SIG0: StaticArray<i32> = new StaticArray<i32>(20);
const Dx7_itbl1SIG1: StaticArray<i32> = new StaticArray<i32>(33);
const Dx7_itbl2SIG2: StaticArray<i32> = new StaticArray<i32>(64);
const Dx7_itbl3SIG3: StaticArray<i32> = new StaticArray<i32>(77);
const Dx7_itbl4SIG4: StaticArray<i32> = new StaticArray<i32>(4);
const Dx7_itbl5SIG5: StaticArray<i32> = new StaticArray<i32>(32);
const Dx7_itbl6SIG6: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_itbl7SIG7: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_itbl8SIG8: StaticArray<i32> = new StaticArray<i32>(8);
let _Dx7_sig0_initialized: bool = false;

function _Dx7_initSIG0Tables(): void {
    if (_Dx7_sig0_initialized) return;
    _Dx7_sig0_initialized = true;
    let sig0_iDx7SIG0Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_itbl0SIG0.length; i++) {
        Dx7_itbl0SIG0[i] = Dx7_wave_SIG0Wave0[sig0_iDx7SIG0Wave0_idx];
        sig0_iDx7SIG0Wave0_idx = (1 + sig0_iDx7SIG0Wave0_idx) % 20;
    }
    let sig1_iDx7SIG1Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_itbl1SIG1.length; i++) {
        Dx7_itbl1SIG1[i] = Dx7_wave_SIG1Wave0[sig1_iDx7SIG1Wave0_idx];
        sig1_iDx7SIG1Wave0_idx = (1 + sig1_iDx7SIG1Wave0_idx) % 33;
    }
    let sig2_iDx7SIG2Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_itbl2SIG2.length; i++) {
        Dx7_itbl2SIG2[i] = Dx7_wave_SIG2Wave0[sig2_iDx7SIG2Wave0_idx];
        sig2_iDx7SIG2Wave0_idx = (1 + sig2_iDx7SIG2Wave0_idx) % 64;
    }
    let sig3_iDx7SIG3Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_itbl3SIG3.length; i++) {
        Dx7_itbl3SIG3[i] = Dx7_wave_SIG3Wave0[sig3_iDx7SIG3Wave0_idx];
        sig3_iDx7SIG3Wave0_idx = (1 + sig3_iDx7SIG3Wave0_idx) % 77;
    }
    let sig4_iDx7SIG4Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_itbl4SIG4.length; i++) {
        Dx7_itbl4SIG4[i] = Dx7_wave_SIG4Wave0[sig4_iDx7SIG4Wave0_idx];
        sig4_iDx7SIG4Wave0_idx = (1 + sig4_iDx7SIG4Wave0_idx) % 4;
    }
    let sig5_iDx7SIG5Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_itbl5SIG5.length; i++) {
        Dx7_itbl5SIG5[i] = Dx7_wave_SIG5Wave0[sig5_iDx7SIG5Wave0_idx];
        sig5_iDx7SIG5Wave0_idx = (1 + sig5_iDx7SIG5Wave0_idx) % 32;
    }
    let sig6_iDx7SIG6Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_itbl6SIG6.length; i++) {
        Dx7_itbl6SIG6[i] = Dx7_wave_SIG6Wave0[sig6_iDx7SIG6Wave0_idx];
        sig6_iDx7SIG6Wave0_idx = (1 + sig6_iDx7SIG6Wave0_idx) % 100;
    }
    let sig7_iDx7SIG7Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_itbl7SIG7.length; i++) {
        Dx7_itbl7SIG7[i] = Dx7_wave_SIG7Wave0[sig7_iDx7SIG7Wave0_idx];
        sig7_iDx7SIG7Wave0_idx = (1 + sig7_iDx7SIG7Wave0_idx) % 100;
    }
    let sig8_iDx7SIG8Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_itbl8SIG8.length; i++) {
        Dx7_itbl8SIG8[i] = Dx7_wave_SIG8Wave0[sig8_iDx7SIG8Wave0_idx];
        sig8_iDx7SIG8Wave0_idx = (1 + sig8_iDx7SIG8Wave0_idx) % 8;
    }
}

export class Dx7 extends MidiVoice {
    private fButton0: f32 = 0;
    private fVec0: StaticArray<f32> = new StaticArray<f32>(2);
    private fHslider3: f32 = 400;
    private fHslider8: f32 = 0.8;
    private fConst0: f32;
    private fConst1: f32;
    private iRec0: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec1: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec2: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec3: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec4: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec5: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec6: StaticArray<i32> = new StaticArray<i32>(2);
    private fConst2: f32;
    private fRec7: StaticArray<f32> = new StaticArray<f32>(2);
    private fConst3: f32;
    private fRec8: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec9: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox0: f32 = 0;
    private fConst4: f32;
    private fRec13: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec14: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec15: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec16: StaticArray<i32> = new StaticArray<i32>(2);
    private fRec17: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec18: StaticArray<i32> = new StaticArray<i32>(2);
    private fRec12: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec19: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec20: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec21: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec22: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec23: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec24: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec25: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox1: f32 = 0;
    private fRec26: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec27: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec28: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec29: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec30: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec31: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec32: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec33: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox2: f32 = 0;
    private fRec34: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec35: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec36: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec37: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec38: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec39: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec40: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec41: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox3: f32 = 0;
    private fRec42: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec43: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec44: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec45: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec46: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec47: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec48: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec49: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox4: f32 = 0;
    private fRec50: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec52: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec53: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec54: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec55: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec56: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec57: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec58: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox5: f32 = 0;
    private fRec59: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec51: StaticArray<f32> = new StaticArray<f32>(2);
    private silentSamples: i32 = 0;

    constructor(channel: MidiChannel) {
        super(channel);
        _Dx7_initSIG0Tables();
        this.instanceConstants();
        this.instanceClear();
    }

    private instanceConstants(): void {
        this.fConst0 = Mathf.min(1.92e+05, Mathf.max(1.0, SAMPLERATE));
        this.fConst1 = 4.41e+04 / this.fConst0;
        this.fConst2 = 1.0 / this.fConst0;
        this.fConst3 = 0.0058651026 / this.fConst0;
        this.fConst4 = 1.5023475 / this.fConst0;
    }

    private instanceClear(): void {
        for (let i = 0; i < 2; i++) { this.fVec0[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec0[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec1[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec2[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec3[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec4[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec5[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec6[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec7[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec8[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec9[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec13[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec14[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec15[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec16[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec17[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec18[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec12[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec19[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec20[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec21[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec22[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec23[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec24[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec25[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec26[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec27[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec28[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec29[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec30[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec31[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec32[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec33[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec34[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec35[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec36[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec37[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec38[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec39[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec40[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec41[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec42[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec43[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec44[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec45[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec46[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec47[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec48[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec49[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec50[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec52[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec53[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec54[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec55[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec56[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec57[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec58[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec59[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec51[i] = 0.0; }
    }

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.fHslider3 = notefreq(note);
        this.fButton0 = 1.0;
        this.fHslider8 = <f32>velocity / 127.0;
        this.silentSamples = 0;
    }

    noteoff(): void {
        this.fButton0 = 0.0;
    }

    isDone(): boolean {
        return this.fButton0 == 0.0 && this.silentSamples > 4410;
    }

    nextframe(): void {
        const fSlow0: f32 = _fcast(this.fButton0);
        const fSlow1: f32 = Mathf.round(_fcast(dx7_fHslider0));
        const fSlow2: f32 = Mathf.round(_fcast(dx7_fHslider1));
        const fSlow3: f32 = Mathf.pow(2.0, 0.083333336 * (Mathf.round(_fcast(dx7_fHslider2)) + 17.31234 * Mathf.log(0.0022727272 * _fcast(this.fHslider3))));
        const fSlow4: f32 = Mathf.round(17.31234 * Mathf.log(fSlow3) + 69.0);
        const fSlow5: f32 = Mathf.round(_fcast(dx7_fHslider4));
        const fSlow6: f32 = Mathf.round(_fcast(dx7_fEntry0));
        const fSlow7: f32 = Mathf.round(_fcast(dx7_fHslider5));
        const fSlow8: f32 = fSlow4 + (-18.0 - fSlow5);
        const iSlow9: i32 = (((fSlow6 == 0.0 ? 1 : 0) | (fSlow6 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow7 * fSlow8)) >> 12 : _icast(329.0 * fSlow7 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow8))), 32))])) >> 15);
        const fSlow10: f32 = Mathf.round(_fcast(dx7_fEntry1));
        const fSlow11: f32 = Mathf.round(_fcast(dx7_fHslider6));
        const fSlow12: f32 = fSlow4 + (-16.0 - fSlow5);
        const iSlow13: i32 = (((fSlow10 == 0.0 ? 1 : 0) | (fSlow10 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow11 * fSlow12) >> 12 : _icast(329.0 * fSlow11 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow12)), 32))])) >> 15);
        const fSlow14: f32 = _fcast(Dx7_itbl2SIG2[_icast(Mathf.round(_fcast(_icast(Mathf.max(0.0, Mathf.min(127.0, 127.0 * _fcast(this.fHslider8)))) >> 1)))] + -239);
        const fSlow15: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow2 >= 2e+01 ? 1 : 0) ? fSlow2 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow2)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow5)) >= 0.0) ? ((fSlow10 < 2.0 ? 1 : 0) ? -iSlow13 : iSlow13) : ((fSlow6 < 2.0 ? 1 : 0) ? -iSlow9 : iSlow9)))) + _fcast((_icast(Mathf.round(_fcast(dx7_fHslider7)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow16: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow1 >= 2e+01 ? 1 : 0) ? fSlow1 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow1)), 19))]))) >> 1) << 6) + fSlow15 + -4256.0)) << 16;
        const iSlow17: i32 = fSlow1 == 0.0;
        const fSlow18: f32 = Mathf.round(_fcast(dx7_fHslider9));
        const fSlow19: f32 = Mathf.round(_fcast(dx7_fHslider10));
        const iSlow20: i32 = min<i32>(31, max<i32>(0, _icast(0.33333334 * fSlow4) + -7));
        const iSlow21: i32 = iSlow20 & 7;
        const iSlow22: i32 = iSlow21 == 3;
        const iSlow23: i32 = iSlow21 > 0;
        const iSlow24: i32 = iSlow21 < 4;
        const fSlow25: f32 = _fcast(iSlow20);
        const iSlow26: i32 = _icast(fSlow19 * fSlow25) >> 3;
        const iSlow27: i32 = (((fSlow19 == 3.0 ? 1 : 0) & iSlow22) ? iSlow26 + -1 : ((((fSlow19 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow26 + 1 : iSlow26));
        const fSlow28: f32 = _fcast(iSlow27);
        const fSlow29: f32 = Mathf.min(fSlow18 + fSlow28, 99.0);
        const iSlow30: i32 = fSlow29 < 77.0;
        const fSlow31: f32 = ((iSlow30) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow29)), 76))]) : 2e+01 * (99.0 - fSlow29));
        const iSlow32: i32 = (((iSlow16 == 0 ? 1 : 0) | iSlow17) ? _icast(this.fConst1 * ((iSlow30 & iSlow17) ? 0.05 * fSlow31 : fSlow31)) : 0);
        const fSlow33: f32 = Mathf.round(_fcast(dx7_fHslider11));
        const iSlow34: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fSlow33 >= 2e+01 ? 1 : 0) ? fSlow33 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow33)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow35: f32 = Mathf.round(_fcast(dx7_fHslider12));
        const fSlow36: f32 = Mathf.min(fSlow35 + fSlow28, 99.0);
        const iSlow37: i32 = _icast(this.fConst1 * ((fSlow36 < 77.0 ? 1 : 0) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow36)), 76))]) : 2e+01 * (99.0 - fSlow36)));
        const fSlow38: f32 = Mathf.round(_fcast(dx7_fHslider13));
        const fSlow39: f32 = Mathf.round(_fcast(dx7_fHslider14));
        const fSlow40: f32 = Mathf.round(_fcast(dx7_fHslider15));
        const fSlow41: f32 = Mathf.round(_fcast(dx7_fHslider16));
        const iSlow42: i32 = iSlow16 > 0;
        const iSlow43: i32 = min<i32>(63, ((41 * _icast(fSlow18)) >> 6) + iSlow27);
        const iSlow44: i32 = _icast(this.fConst1 * _fcast(((iSlow43 & 3) + 4) << ((iSlow43 >> 2) + 2)));
        const iSlow45: i32 = min<i32>(63, ((41 * _icast(fSlow35)) >> 6) + iSlow27);
        const iSlow46: i32 = _icast(this.fConst1 * _fcast(((iSlow45 & 3) + 4) << ((iSlow45 >> 2) + 2)));
        const iSlow47: i32 = Dx7_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_fHslider17))))];
        const iSlow48: i32 = iSlow47 != 0;
        const fSlow49: f32 = 2.6972606e-09 * Mathf.round(_fcast(dx7_fHslider18));
        const iSlow50: i32 = _icast(Mathf.round(_fcast(dx7_fHslider19)));
        const fSlow51: f32 = Mathf.round(_fcast(dx7_fHslider20));
        const fSlow52: f32 = this.fConst2 * (((0.01010101 * fSlow51) <= 0.656566) ? 0.15806305 * fSlow51 + 0.036478 : 1.100254 * fSlow51 + -61.205933);
        const fSlow53: f32 = 99.0 - Mathf.round(_fcast(dx7_fHslider21));
        const iSlow54: i32 = (fSlow53 == 99.0 ? 1 : 0) >= 1;
        const iSlow55: i32 = _icast(fSlow53);
        const iSlow56: i32 = ((iSlow55 & 15) + 16) << ((iSlow55 >> 4) + 1);
        const fSlow57: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(max<i32>(iSlow56 & 65408, 128)));
        const fSlow58: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(iSlow56));
        const fSlow59: f32 = Mathf.round(_fcast(dx7_fEntry2));
        const iSlow60: i32 = fSlow59 >= 3.0;
        const iSlow61: i32 = fSlow59 >= 5.0;
        const iSlow62: i32 = fSlow59 >= 2.0;
        const iSlow63: i32 = fSlow59 >= 1.0;
        const iSlow64: i32 = fSlow59 >= 4.0;
        const fSlow65: f32 = _fcast(iSlow47);
        const iSlow66: i32 = _icast(Mathf.round(_fcast(dx7_fHslider22)));
        const iSlow67: i32 = _icast(Mathf.round(_fcast(this.fCheckbox0)));
        const fSlow68: f32 = Mathf.log(4.4e+02 * fSlow3);
        const fSlow69: f32 = Mathf.round(_fcast(dx7_fHslider23));
        const fSlow70: f32 = Mathf.exp(-0.57130724 * fSlow68);
        const iSlow71: i32 = _icast(Mathf.round(_fcast(dx7_fHslider24)));
        const fSlow72: f32 = Mathf.round(_fcast(dx7_fHslider25));
        const fSlow73: f32 = ((iSlow67) ? _fcast(_icast(4458616.0 * (fSlow72 + _fcast(100 * (iSlow71 & 3)))) >> 3) + ((fSlow69 > 0.0 ? 1 : 0) ? 13457.0 * fSlow69 : 0.0) : fSlow68 * (72267.445 * fSlow69 * fSlow70 + 24204406.0) + _fcast(Dx7_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow71 & 31)))]) + _fcast(((_icast(fSlow72)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow72 + 1.0) + 0.5)) : 0)));
        const fSlow74: f32 = Mathf.round(_fcast(dx7_fHslider26));
        const iSlow75: i32 = Dx7_itbl6SIG6[_icast(Mathf.round(fSlow74))];
        const fSlow76: f32 = _fcast(iSlow75);
        const fSlow77: f32 = Mathf.round(_fcast(dx7_fHslider27));
        const iSlow78: i32 = Dx7_itbl6SIG6[_icast(Mathf.round(fSlow77))];
        const iSlow79: i32 = iSlow78 > iSlow75;
        const fSlow80: f32 = Mathf.round(_fcast(dx7_fHslider28));
        const fSlow81: f32 = this.fConst4 * _fcast(Dx7_itbl7SIG7[_icast(Mathf.round(fSlow80))]);
        const fSlow82: f32 = Mathf.round(_fcast(dx7_fHslider29));
        const fSlow83: f32 = this.fConst4 * _fcast(Dx7_itbl7SIG7[_icast(Mathf.round(fSlow82))]);
        const fSlow84: f32 = Mathf.round(_fcast(dx7_fHslider30));
        const fSlow85: f32 = Mathf.round(_fcast(dx7_fHslider31));
        const fSlow86: f32 = Mathf.round(_fcast(dx7_fHslider32));
        const fSlow87: f32 = Mathf.round(_fcast(dx7_fHslider33));
        const fSlow88: f32 = 7.891414e-05 * Mathf.round(_fcast(dx7_fHslider34));
        const fSlow89: f32 = _fcast(Dx7_itbl8SIG8[_icast(Mathf.round(Mathf.round(_fcast(dx7_fHslider35))))]);
        const fSlow90: f32 = Mathf.round(_fcast(dx7_fHslider36));
        const fSlow91: f32 = Mathf.round(_fcast(dx7_fHslider37));
        const fSlow92: f32 = Mathf.round(_fcast(dx7_fHslider38));
        const fSlow93: f32 = Mathf.round(_fcast(dx7_fEntry3));
        const fSlow94: f32 = Mathf.round(_fcast(dx7_fHslider39));
        const fSlow95: f32 = fSlow4 + (-18.0 - fSlow92);
        const iSlow96: i32 = (((fSlow93 == 0.0 ? 1 : 0) | (fSlow93 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow94 * fSlow95)) >> 12 : _icast(329.0 * fSlow94 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow95))), 32))])) >> 15);
        const fSlow97: f32 = Mathf.round(_fcast(dx7_fEntry4));
        const fSlow98: f32 = Mathf.round(_fcast(dx7_fHslider40));
        const fSlow99: f32 = fSlow4 + (-16.0 - fSlow92);
        const iSlow100: i32 = (((fSlow97 == 0.0 ? 1 : 0) | (fSlow97 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow98 * fSlow99) >> 12 : _icast(329.0 * fSlow98 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow99)), 32))])) >> 15);
        const fSlow101: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow91 >= 2e+01 ? 1 : 0) ? fSlow91 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow91)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow92)) >= 0.0) ? ((fSlow97 < 2.0 ? 1 : 0) ? -iSlow100 : iSlow100) : ((fSlow93 < 2.0 ? 1 : 0) ? -iSlow96 : iSlow96)))) + _fcast((_icast(Mathf.round(_fcast(dx7_fHslider41)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow102: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow90 >= 2e+01 ? 1 : 0) ? fSlow90 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow90)), 19))]))) >> 1) << 6) + fSlow101 + -4256.0)) << 16;
        const iSlow103: i32 = fSlow90 == 0.0;
        const fSlow104: f32 = Mathf.round(_fcast(dx7_fHslider42));
        const fSlow105: f32 = Mathf.round(_fcast(dx7_fHslider43));
        const iSlow106: i32 = _icast(fSlow105 * fSlow25) >> 3;
        const iSlow107: i32 = (((fSlow105 == 3.0 ? 1 : 0) & iSlow22) ? iSlow106 + -1 : ((((fSlow105 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow106 + 1 : iSlow106));
        const fSlow108: f32 = _fcast(iSlow107);
        const fSlow109: f32 = Mathf.min(fSlow104 + fSlow108, 99.0);
        const iSlow110: i32 = fSlow109 < 77.0;
        const fSlow111: f32 = ((iSlow110) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow109)), 76))]) : 2e+01 * (99.0 - fSlow109));
        const iSlow112: i32 = (((iSlow102 == 0 ? 1 : 0) | iSlow103) ? _icast(this.fConst1 * ((iSlow110 & iSlow103) ? 0.05 * fSlow111 : fSlow111)) : 0);
        const fSlow113: f32 = Mathf.round(_fcast(dx7_fHslider44));
        const iSlow114: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fSlow113 >= 2e+01 ? 1 : 0) ? fSlow113 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow113)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow115: f32 = Mathf.round(_fcast(dx7_fHslider45));
        const fSlow116: f32 = Mathf.min(fSlow115 + fSlow108, 99.0);
        const iSlow117: i32 = _icast(this.fConst1 * ((fSlow116 < 77.0 ? 1 : 0) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow116)), 76))]) : 2e+01 * (99.0 - fSlow116)));
        const fSlow118: f32 = Mathf.round(_fcast(dx7_fHslider46));
        const fSlow119: f32 = Mathf.round(_fcast(dx7_fHslider47));
        const fSlow120: f32 = Mathf.round(_fcast(dx7_fHslider48));
        const fSlow121: f32 = Mathf.round(_fcast(dx7_fHslider49));
        const iSlow122: i32 = iSlow102 > 0;
        const iSlow123: i32 = min<i32>(63, ((41 * _icast(fSlow104)) >> 6) + iSlow107);
        const iSlow124: i32 = _icast(this.fConst1 * _fcast(((iSlow123 & 3) + 4) << ((iSlow123 >> 2) + 2)));
        const iSlow125: i32 = min<i32>(63, ((41 * _icast(fSlow115)) >> 6) + iSlow107);
        const iSlow126: i32 = _icast(this.fConst1 * _fcast(((iSlow125 & 3) + 4) << ((iSlow125 >> 2) + 2)));
        const iSlow127: i32 = Dx7_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_fHslider50))))];
        const iSlow128: i32 = iSlow127 != 0;
        const fSlow129: f32 = _fcast(iSlow127);
        const iSlow130: i32 = _icast(Mathf.round(_fcast(this.fCheckbox1)));
        const fSlow131: f32 = Mathf.round(_fcast(dx7_fHslider51));
        const iSlow132: i32 = _icast(Mathf.round(_fcast(dx7_fHslider52)));
        const fSlow133: f32 = Mathf.round(_fcast(dx7_fHslider53));
        const fSlow134: f32 = ((iSlow130) ? _fcast(_icast(4458616.0 * (fSlow133 + _fcast(100 * (iSlow132 & 3)))) >> 3) + ((fSlow131 > 0.0 ? 1 : 0) ? 13457.0 * fSlow131 : 0.0) : fSlow68 * (72267.445 * fSlow131 * fSlow70 + 24204406.0) + _fcast(Dx7_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow132 & 31)))]) + _fcast(((_icast(fSlow133)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow133 + 1.0) + 0.5)) : 0)));
        const fSlow135: f32 = Mathf.round(_fcast(dx7_fHslider54));
        const fSlow136: f32 = Mathf.round(_fcast(dx7_fHslider55));
        const fSlow137: f32 = Mathf.round(_fcast(dx7_fHslider56));
        const fSlow138: f32 = Mathf.round(_fcast(dx7_fEntry5));
        const fSlow139: f32 = Mathf.round(_fcast(dx7_fHslider57));
        const fSlow140: f32 = fSlow4 + (-18.0 - fSlow137);
        const iSlow141: i32 = (((fSlow138 == 0.0 ? 1 : 0) | (fSlow138 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow139 * fSlow140)) >> 12 : _icast(329.0 * fSlow139 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow140))), 32))])) >> 15);
        const fSlow142: f32 = Mathf.round(_fcast(dx7_fEntry6));
        const fSlow143: f32 = Mathf.round(_fcast(dx7_fHslider58));
        const fSlow144: f32 = fSlow4 + (-16.0 - fSlow137);
        const iSlow145: i32 = (((fSlow142 == 0.0 ? 1 : 0) | (fSlow142 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow143 * fSlow144) >> 12 : _icast(329.0 * fSlow143 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow144)), 32))])) >> 15);
        const fSlow146: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow136 >= 2e+01 ? 1 : 0) ? fSlow136 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow136)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow137)) >= 0.0) ? ((fSlow142 < 2.0 ? 1 : 0) ? -iSlow145 : iSlow145) : ((fSlow138 < 2.0 ? 1 : 0) ? -iSlow141 : iSlow141)))) + _fcast((_icast(Mathf.round(_fcast(dx7_fHslider59)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow147: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow135 >= 2e+01 ? 1 : 0) ? fSlow135 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow135)), 19))]))) >> 1) << 6) + fSlow146 + -4256.0)) << 16;
        const iSlow148: i32 = fSlow135 == 0.0;
        const fSlow149: f32 = Mathf.round(_fcast(dx7_fHslider60));
        const fSlow150: f32 = Mathf.round(_fcast(dx7_fHslider61));
        const iSlow151: i32 = _icast(fSlow150 * fSlow25) >> 3;
        const iSlow152: i32 = (((fSlow150 == 3.0 ? 1 : 0) & iSlow22) ? iSlow151 + -1 : ((((fSlow150 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow151 + 1 : iSlow151));
        const fSlow153: f32 = _fcast(iSlow152);
        const fSlow154: f32 = Mathf.min(fSlow149 + fSlow153, 99.0);
        const iSlow155: i32 = fSlow154 < 77.0;
        const fSlow156: f32 = ((iSlow155) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow154)), 76))]) : 2e+01 * (99.0 - fSlow154));
        const iSlow157: i32 = (((iSlow147 == 0 ? 1 : 0) | iSlow148) ? _icast(this.fConst1 * ((iSlow155 & iSlow148) ? 0.05 * fSlow156 : fSlow156)) : 0);
        const fSlow158: f32 = Mathf.round(_fcast(dx7_fHslider62));
        const iSlow159: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fSlow158 >= 2e+01 ? 1 : 0) ? fSlow158 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow158)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow160: f32 = Mathf.round(_fcast(dx7_fHslider63));
        const fSlow161: f32 = Mathf.min(fSlow160 + fSlow153, 99.0);
        const iSlow162: i32 = _icast(this.fConst1 * ((fSlow161 < 77.0 ? 1 : 0) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow161)), 76))]) : 2e+01 * (99.0 - fSlow161)));
        const fSlow163: f32 = Mathf.round(_fcast(dx7_fHslider64));
        const fSlow164: f32 = Mathf.round(_fcast(dx7_fHslider65));
        const fSlow165: f32 = Mathf.round(_fcast(dx7_fHslider66));
        const fSlow166: f32 = Mathf.round(_fcast(dx7_fHslider67));
        const iSlow167: i32 = iSlow147 > 0;
        const iSlow168: i32 = min<i32>(63, ((41 * _icast(fSlow149)) >> 6) + iSlow152);
        const iSlow169: i32 = _icast(this.fConst1 * _fcast(((iSlow168 & 3) + 4) << ((iSlow168 >> 2) + 2)));
        const iSlow170: i32 = min<i32>(63, ((41 * _icast(fSlow160)) >> 6) + iSlow152);
        const iSlow171: i32 = _icast(this.fConst1 * _fcast(((iSlow170 & 3) + 4) << ((iSlow170 >> 2) + 2)));
        const iSlow172: i32 = Dx7_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_fHslider68))))];
        const iSlow173: i32 = iSlow172 != 0;
        const fSlow174: f32 = _fcast(iSlow172);
        const iSlow175: i32 = _icast(Mathf.round(_fcast(this.fCheckbox2)));
        const fSlow176: f32 = Mathf.round(_fcast(dx7_fHslider69));
        const iSlow177: i32 = _icast(Mathf.round(_fcast(dx7_fHslider70)));
        const fSlow178: f32 = Mathf.round(_fcast(dx7_fHslider71));
        const fSlow179: f32 = ((iSlow175) ? _fcast(_icast(4458616.0 * (fSlow178 + _fcast(100 * (iSlow177 & 3)))) >> 3) + ((fSlow176 > 0.0 ? 1 : 0) ? 13457.0 * fSlow176 : 0.0) : fSlow68 * (72267.445 * fSlow176 * fSlow70 + 24204406.0) + _fcast(Dx7_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow177 & 31)))]) + _fcast(((_icast(fSlow178)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow178 + 1.0) + 0.5)) : 0)));
        const fSlow180: f32 = Mathf.round(_fcast(dx7_fHslider72));
        const fSlow181: f32 = Mathf.round(_fcast(dx7_fHslider73));
        const fSlow182: f32 = Mathf.round(_fcast(dx7_fHslider74));
        const fSlow183: f32 = Mathf.round(_fcast(dx7_fEntry7));
        const fSlow184: f32 = Mathf.round(_fcast(dx7_fHslider75));
        const fSlow185: f32 = fSlow4 + (-18.0 - fSlow182);
        const iSlow186: i32 = (((fSlow183 == 0.0 ? 1 : 0) | (fSlow183 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow184 * fSlow185)) >> 12 : _icast(329.0 * fSlow184 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow185))), 32))])) >> 15);
        const fSlow187: f32 = Mathf.round(_fcast(dx7_fEntry8));
        const fSlow188: f32 = Mathf.round(_fcast(dx7_fHslider76));
        const fSlow189: f32 = fSlow4 + (-16.0 - fSlow182);
        const iSlow190: i32 = (((fSlow187 == 0.0 ? 1 : 0) | (fSlow187 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow188 * fSlow189) >> 12 : _icast(329.0 * fSlow188 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow189)), 32))])) >> 15);
        const fSlow191: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow181 >= 2e+01 ? 1 : 0) ? fSlow181 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow181)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow182)) >= 0.0) ? ((fSlow187 < 2.0 ? 1 : 0) ? -iSlow190 : iSlow190) : ((fSlow183 < 2.0 ? 1 : 0) ? -iSlow186 : iSlow186)))) + _fcast((_icast(Mathf.round(_fcast(dx7_fHslider77)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow192: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow180 >= 2e+01 ? 1 : 0) ? fSlow180 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow180)), 19))]))) >> 1) << 6) + fSlow191 + -4256.0)) << 16;
        const iSlow193: i32 = fSlow180 == 0.0;
        const fSlow194: f32 = Mathf.round(_fcast(dx7_fHslider78));
        const fSlow195: f32 = Mathf.round(_fcast(dx7_fHslider79));
        const iSlow196: i32 = _icast(fSlow195 * fSlow25) >> 3;
        const iSlow197: i32 = (((fSlow195 == 3.0 ? 1 : 0) & iSlow22) ? iSlow196 + -1 : ((((fSlow195 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow196 + 1 : iSlow196));
        const fSlow198: f32 = _fcast(iSlow197);
        const fSlow199: f32 = Mathf.min(fSlow194 + fSlow198, 99.0);
        const iSlow200: i32 = fSlow199 < 77.0;
        const fSlow201: f32 = ((iSlow200) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow199)), 76))]) : 2e+01 * (99.0 - fSlow199));
        const iSlow202: i32 = (((iSlow192 == 0 ? 1 : 0) | iSlow193) ? _icast(this.fConst1 * ((iSlow200 & iSlow193) ? 0.05 * fSlow201 : fSlow201)) : 0);
        const fSlow203: f32 = Mathf.round(_fcast(dx7_fHslider80));
        const iSlow204: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fSlow203 >= 2e+01 ? 1 : 0) ? fSlow203 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow203)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow205: f32 = Mathf.round(_fcast(dx7_fHslider81));
        const fSlow206: f32 = Mathf.min(fSlow205 + fSlow198, 99.0);
        const iSlow207: i32 = _icast(this.fConst1 * ((fSlow206 < 77.0 ? 1 : 0) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow206)), 76))]) : 2e+01 * (99.0 - fSlow206)));
        const fSlow208: f32 = Mathf.round(_fcast(dx7_fHslider82));
        const fSlow209: f32 = Mathf.round(_fcast(dx7_fHslider83));
        const fSlow210: f32 = Mathf.round(_fcast(dx7_fHslider84));
        const fSlow211: f32 = Mathf.round(_fcast(dx7_fHslider85));
        const iSlow212: i32 = iSlow192 > 0;
        const iSlow213: i32 = min<i32>(63, ((41 * _icast(fSlow194)) >> 6) + iSlow197);
        const iSlow214: i32 = _icast(this.fConst1 * _fcast(((iSlow213 & 3) + 4) << ((iSlow213 >> 2) + 2)));
        const iSlow215: i32 = min<i32>(63, ((41 * _icast(fSlow205)) >> 6) + iSlow197);
        const iSlow216: i32 = _icast(this.fConst1 * _fcast(((iSlow215 & 3) + 4) << ((iSlow215 >> 2) + 2)));
        const iSlow217: i32 = Dx7_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_fHslider86))))];
        const iSlow218: i32 = iSlow217 != 0;
        const fSlow219: f32 = _fcast(iSlow217);
        const iSlow220: i32 = _icast(Mathf.round(_fcast(this.fCheckbox3)));
        const fSlow221: f32 = Mathf.round(_fcast(dx7_fHslider87));
        const iSlow222: i32 = _icast(Mathf.round(_fcast(dx7_fHslider88)));
        const fSlow223: f32 = Mathf.round(_fcast(dx7_fHslider89));
        const fSlow224: f32 = ((iSlow220) ? _fcast(_icast(4458616.0 * (fSlow223 + _fcast(100 * (iSlow222 & 3)))) >> 3) + ((fSlow221 > 0.0 ? 1 : 0) ? 13457.0 * fSlow221 : 0.0) : fSlow68 * (72267.445 * fSlow221 * fSlow70 + 24204406.0) + _fcast(Dx7_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow222 & 31)))]) + _fcast(((_icast(fSlow223)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow223 + 1.0) + 0.5)) : 0)));
        const fSlow225: f32 = Mathf.round(_fcast(dx7_fHslider90));
        const fSlow226: f32 = Mathf.round(_fcast(dx7_fHslider91));
        const fSlow227: f32 = Mathf.round(_fcast(dx7_fHslider92));
        const fSlow228: f32 = Mathf.round(_fcast(dx7_fEntry9));
        const fSlow229: f32 = Mathf.round(_fcast(dx7_fHslider93));
        const fSlow230: f32 = fSlow4 + (-18.0 - fSlow227);
        const iSlow231: i32 = (((fSlow228 == 0.0 ? 1 : 0) | (fSlow228 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow229 * fSlow230)) >> 12 : _icast(329.0 * fSlow229 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow230))), 32))])) >> 15);
        const fSlow232: f32 = Mathf.round(_fcast(dx7_fEntry10));
        const fSlow233: f32 = Mathf.round(_fcast(dx7_fHslider94));
        const fSlow234: f32 = fSlow4 + (-16.0 - fSlow227);
        const iSlow235: i32 = (((fSlow232 == 0.0 ? 1 : 0) | (fSlow232 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow233 * fSlow234) >> 12 : _icast(329.0 * fSlow233 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow234)), 32))])) >> 15);
        const fSlow236: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow226 >= 2e+01 ? 1 : 0) ? fSlow226 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow226)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow227)) >= 0.0) ? ((fSlow232 < 2.0 ? 1 : 0) ? -iSlow235 : iSlow235) : ((fSlow228 < 2.0 ? 1 : 0) ? -iSlow231 : iSlow231)))) + _fcast((_icast(Mathf.round(_fcast(dx7_fHslider95)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow237: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow225 >= 2e+01 ? 1 : 0) ? fSlow225 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow225)), 19))]))) >> 1) << 6) + fSlow236 + -4256.0)) << 16;
        const iSlow238: i32 = fSlow225 == 0.0;
        const fSlow239: f32 = Mathf.round(_fcast(dx7_fHslider96));
        const fSlow240: f32 = Mathf.round(_fcast(dx7_fHslider97));
        const iSlow241: i32 = _icast(fSlow240 * fSlow25) >> 3;
        const iSlow242: i32 = (((fSlow240 == 3.0 ? 1 : 0) & iSlow22) ? iSlow241 + -1 : ((((fSlow240 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow241 + 1 : iSlow241));
        const fSlow243: f32 = _fcast(iSlow242);
        const fSlow244: f32 = Mathf.min(fSlow239 + fSlow243, 99.0);
        const iSlow245: i32 = fSlow244 < 77.0;
        const fSlow246: f32 = ((iSlow245) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow244)), 76))]) : 2e+01 * (99.0 - fSlow244));
        const iSlow247: i32 = (((iSlow237 == 0 ? 1 : 0) | iSlow238) ? _icast(this.fConst1 * ((iSlow245 & iSlow238) ? 0.05 * fSlow246 : fSlow246)) : 0);
        const fSlow248: f32 = Mathf.round(_fcast(dx7_fHslider98));
        const iSlow249: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fSlow248 >= 2e+01 ? 1 : 0) ? fSlow248 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow248)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow250: f32 = Mathf.round(_fcast(dx7_fHslider99));
        const fSlow251: f32 = Mathf.min(fSlow250 + fSlow243, 99.0);
        const iSlow252: i32 = _icast(this.fConst1 * ((fSlow251 < 77.0 ? 1 : 0) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow251)), 76))]) : 2e+01 * (99.0 - fSlow251)));
        const fSlow253: f32 = Mathf.round(_fcast(dx7_fHslider100));
        const fSlow254: f32 = Mathf.round(_fcast(dx7_fHslider101));
        const fSlow255: f32 = Mathf.round(_fcast(dx7_fHslider102));
        const fSlow256: f32 = Mathf.round(_fcast(dx7_fHslider103));
        const iSlow257: i32 = iSlow237 > 0;
        const iSlow258: i32 = min<i32>(63, ((41 * _icast(fSlow239)) >> 6) + iSlow242);
        const iSlow259: i32 = _icast(this.fConst1 * _fcast(((iSlow258 & 3) + 4) << ((iSlow258 >> 2) + 2)));
        const iSlow260: i32 = min<i32>(63, ((41 * _icast(fSlow250)) >> 6) + iSlow242);
        const iSlow261: i32 = _icast(this.fConst1 * _fcast(((iSlow260 & 3) + 4) << ((iSlow260 >> 2) + 2)));
        const iSlow262: i32 = Dx7_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_fHslider104))))];
        const iSlow263: i32 = iSlow262 != 0;
        const fSlow264: f32 = _fcast(iSlow262);
        const iSlow265: i32 = _icast(Mathf.round(_fcast(this.fCheckbox4)));
        const fSlow266: f32 = Mathf.round(_fcast(dx7_fHslider105));
        const iSlow267: i32 = _icast(Mathf.round(_fcast(dx7_fHslider106)));
        const fSlow268: f32 = Mathf.round(_fcast(dx7_fHslider107));
        const fSlow269: f32 = ((iSlow265) ? _fcast(_icast(4458616.0 * (fSlow268 + _fcast(100 * (iSlow267 & 3)))) >> 3) + ((fSlow266 > 0.0 ? 1 : 0) ? 13457.0 * fSlow266 : 0.0) : fSlow68 * (72267.445 * fSlow266 * fSlow70 + 24204406.0) + _fcast(Dx7_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow267 & 31)))]) + _fcast(((_icast(fSlow268)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow268 + 1.0) + 0.5)) : 0)));
        const fSlow270: f32 = Mathf.round(_fcast(dx7_fHslider108));
        const fSlow271: f32 = Mathf.round(_fcast(dx7_fHslider109));
        const fSlow272: f32 = Mathf.round(_fcast(dx7_fHslider110));
        const fSlow273: f32 = Mathf.round(_fcast(dx7_fEntry11));
        const fSlow274: f32 = Mathf.round(_fcast(dx7_fHslider111));
        const fSlow275: f32 = fSlow4 + (-18.0 - fSlow272);
        const iSlow276: i32 = (((fSlow273 == 0.0 ? 1 : 0) | (fSlow273 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow274 * fSlow275)) >> 12 : _icast(329.0 * fSlow274 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow275))), 32))])) >> 15);
        const fSlow277: f32 = Mathf.round(_fcast(dx7_fEntry12));
        const fSlow278: f32 = Mathf.round(_fcast(dx7_fHslider112));
        const fSlow279: f32 = fSlow4 + (-16.0 - fSlow272);
        const iSlow280: i32 = (((fSlow277 == 0.0 ? 1 : 0) | (fSlow277 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow278 * fSlow279) >> 12 : _icast(329.0 * fSlow278 * _fcast(Dx7_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow279)), 32))])) >> 15);
        const fSlow281: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow271 >= 2e+01 ? 1 : 0) ? fSlow271 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow271)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow272)) >= 0.0) ? ((fSlow277 < 2.0 ? 1 : 0) ? -iSlow280 : iSlow280) : ((fSlow273 < 2.0 ? 1 : 0) ? -iSlow276 : iSlow276)))) + _fcast((_icast(Mathf.round(_fcast(dx7_fHslider113)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow282: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow270 >= 2e+01 ? 1 : 0) ? fSlow270 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow270)), 19))]))) >> 1) << 6) + fSlow281 + -4256.0)) << 16;
        const iSlow283: i32 = fSlow270 == 0.0;
        const fSlow284: f32 = Mathf.round(_fcast(dx7_fHslider114));
        const fSlow285: f32 = Mathf.round(_fcast(dx7_fHslider115));
        const iSlow286: i32 = _icast(fSlow285 * fSlow25) >> 3;
        const iSlow287: i32 = (((fSlow285 == 3.0 ? 1 : 0) & iSlow22) ? iSlow286 + -1 : ((((fSlow285 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow286 + 1 : iSlow286));
        const fSlow288: f32 = _fcast(iSlow287);
        const fSlow289: f32 = Mathf.min(fSlow284 + fSlow288, 99.0);
        const iSlow290: i32 = fSlow289 < 77.0;
        const fSlow291: f32 = ((iSlow290) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow289)), 76))]) : 2e+01 * (99.0 - fSlow289));
        const iSlow292: i32 = (((iSlow282 == 0 ? 1 : 0) | iSlow283) ? _icast(this.fConst1 * ((iSlow290 & iSlow283) ? 0.05 * fSlow291 : fSlow291)) : 0);
        const fSlow293: f32 = Mathf.round(_fcast(dx7_fHslider116));
        const iSlow294: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fSlow293 >= 2e+01 ? 1 : 0) ? fSlow293 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow293)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow295: f32 = Mathf.round(_fcast(dx7_fHslider117));
        const fSlow296: f32 = Mathf.min(fSlow295 + fSlow288, 99.0);
        const iSlow297: i32 = _icast(this.fConst1 * ((fSlow296 < 77.0 ? 1 : 0) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow296)), 76))]) : 2e+01 * (99.0 - fSlow296)));
        const fSlow298: f32 = Mathf.round(_fcast(dx7_fHslider118));
        const fSlow299: f32 = Mathf.round(_fcast(dx7_fHslider119));
        const fSlow300: f32 = Mathf.round(_fcast(dx7_fHslider120));
        const fSlow301: f32 = Mathf.round(_fcast(dx7_fHslider121));
        const iSlow302: i32 = iSlow282 > 0;
        const iSlow303: i32 = min<i32>(63, ((41 * _icast(fSlow284)) >> 6) + iSlow287);
        const iSlow304: i32 = _icast(this.fConst1 * _fcast(((iSlow303 & 3) + 4) << ((iSlow303 >> 2) + 2)));
        const iSlow305: i32 = min<i32>(63, ((41 * _icast(fSlow295)) >> 6) + iSlow287);
        const iSlow306: i32 = _icast(this.fConst1 * _fcast(((iSlow305 & 3) + 4) << ((iSlow305 >> 2) + 2)));
        const iSlow307: i32 = Dx7_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_fHslider122))))];
        const iSlow308: i32 = iSlow307 != 0;
        const fSlow309: f32 = _fcast(iSlow307);
        const iSlow310: i32 = _icast(Mathf.round(_fcast(this.fCheckbox5)));
        const fSlow311: f32 = Mathf.round(_fcast(dx7_fHslider123));
        const iSlow312: i32 = _icast(Mathf.round(_fcast(dx7_fHslider124)));
        const fSlow313: f32 = Mathf.round(_fcast(dx7_fHslider125));
        const fSlow314: f32 = ((iSlow310) ? _fcast(_icast(4458616.0 * (fSlow313 + _fcast(100 * (iSlow312 & 3)))) >> 3) + ((fSlow311 > 0.0 ? 1 : 0) ? 13457.0 * fSlow311 : 0.0) : fSlow68 * (72267.445 * fSlow311 * fSlow70 + 24204406.0) + _fcast(Dx7_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow312 & 31)))]) + _fcast(((_icast(fSlow313)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow313 + 1.0) + 0.5)) : 0)));
        const fSlow315: f32 = Mathf.round(_fcast(dx7_fHslider126));
        const fSlow316: f32 = ((fSlow315 == 0.0 ? 1 : 0) ? 0.0 : Mathf.pow(2.0, fSlow315 + -7.0));

        this.fVec0[0] = fSlow0;
        const iTemp0: i32 = (fSlow0 < this.fVec0[1] ? 1 : 0) >= 1;
        const iTemp1: i32 = fSlow0 > this.fVec0[1];
        const iTemp2: i32 = iTemp1 >= 1;
        const iTemp3: i32 = ((iTemp2) ? 0 : this.iRec0[1]);
        const iTemp4: i32 = ((iTemp0) ? ((iSlow34 == iTemp3 ? 1 : 0) ? iSlow37 : 0) : ((iTemp2) ? iSlow32 : this.iRec6[1]));
        const iTemp5: i32 = iTemp4 != 0;
        const iTemp6: i32 = (iTemp5 & (iTemp4 <= 1 ? 1 : 0)) >= 1;
        const iTemp7: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec1[1]));
        const iTemp8: i32 = iTemp7 + 1;
        const iTemp9: i32 = ((iTemp6) ? iTemp8 : iTemp7);
        const iTemp10: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec5[1]));
        const iTemp11: i32 = ((iTemp9 < 3 ? 1 : 0) | ((iTemp9 < 4 ? 1 : 0) & (iTemp10 ^ -1))) >= 1;
        const iTemp12: i32 = (iTemp8 < 4 ? 1 : 0) >= 1;
        const iTemp13: i32 = iTemp8 >= 2;
        const iTemp14: i32 = iTemp8 >= 1;
        const iTemp15: i32 = iTemp8 >= 3;
        const fTemp16: f32 = ((iTemp13) ? ((iTemp15) ? fSlow33 : fSlow39) : ((iTemp14) ? fSlow38 : fSlow1));
        const iTemp17: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp16 >= 2e+01 ? 1 : 0) ? fTemp16 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp16)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp18: i32 = iTemp8 == 0;
        const iTemp19: i32 = fTemp16 == 0.0;
        const fTemp20: f32 = ((iTemp13) ? ((iTemp15) ? fSlow35 : fSlow41) : ((iTemp14) ? fSlow40 : fSlow18));
        const fTemp21: f32 = Mathf.min(fSlow28 + fTemp20, 99.0);
        const iTemp22: i32 = fTemp21 < 77.0;
        const fTemp23: f32 = ((iTemp22) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp21)), 76))]) : 2e+01 * (99.0 - fTemp21));
        const iTemp24: i32 = ((iTemp6) ? ((iTemp12) ? (((iTemp17 == iTemp3 ? 1 : 0) | (iTemp18 & iTemp19)) ? _icast(this.fConst1 * (((iTemp22 & iTemp18) & iTemp19) ? 0.05 * fTemp23 : fTemp23)) : 0) : 0) : iTemp4 - ((iTemp5) ? 1 : 0));
        const iTemp25: i32 = ((iTemp0) ? iSlow34 > iTemp3 : ((iTemp2) ? iSlow42 : this.iRec3[1]));
        const iTemp26: i32 = ((iTemp6) ? ((iTemp12) ? iTemp17 > iTemp3 : iTemp25) : iTemp25);
        const iTemp27: i32 = (iTemp24 == 0 ? 1 : 0) * ((iTemp26 == 0 ? 1 : 0) + 1);
        const iTemp28: i32 = iTemp27 >= 2;
        const iTemp29: i32 = iTemp27 >= 1;
        const iTemp30: i32 = max<i32>(112459776, iTemp3);
        const iTemp31: i32 = ((iTemp0) ? iSlow46 : ((iTemp2) ? iSlow44 : this.iRec4[1]));
        const iTemp32: i32 = min<i32>(63, iSlow27 + ((41 * _icast(fTemp20)) >> 6));
        const iTemp33: i32 = ((iTemp6) ? ((iTemp12) ? _icast(this.fConst1 * _fcast(((iTemp32 & 3) + 4) << ((iTemp32 >> 2) + 2))) : iTemp31) : iTemp31);
        const iTemp34: i32 = iTemp30 + ((285212672 - iTemp30) >> 24) * iTemp33;
        const iTemp35: i32 = ((iTemp0) ? iSlow34 : ((iTemp2) ? iSlow16 : this.iRec2[1]));
        const iTemp36: i32 = ((iTemp6) ? ((iTemp12) ? iTemp17 : iTemp35) : iTemp35);
        const iTemp37: i32 = (iTemp34 >= iTemp36 ? 1 : 0) >= 1;
        const iTemp38: i32 = iTemp3 - iTemp33;
        const iTemp39: i32 = (iTemp38 <= iTemp36 ? 1 : 0) >= 1;
        this.iRec0[0] = ((iTemp11) ? ((iTemp28) ? ((iTemp39) ? iTemp36 : iTemp38) : ((iTemp29) ? ((iTemp37) ? iTemp36 : iTemp34) : iTemp3)) : iTemp3);
        const iTemp40: i32 = iTemp9 + 1;
        this.iRec1[0] = ((iTemp11) ? ((iTemp28) ? ((iTemp39) ? iTemp40 : iTemp9) : ((iTemp29) ? ((iTemp37) ? iTemp40 : iTemp9) : iTemp9)) : iTemp9);
        const iTemp41: i32 = (iTemp40 < 4 ? 1 : 0) >= 1;
        const iTemp42: i32 = iTemp40 >= 2;
        const iTemp43: i32 = iTemp40 >= 1;
        const iTemp44: i32 = iTemp40 >= 3;
        const fTemp45: f32 = ((iTemp42) ? ((iTemp44) ? fSlow33 : fSlow39) : ((iTemp43) ? fSlow38 : fSlow1));
        const iTemp46: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp45 >= 2e+01 ? 1 : 0) ? fTemp45 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp45)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp47: i32 = ((iTemp41) ? iTemp46 : iTemp36);
        this.iRec2[0] = ((iTemp11) ? ((iTemp28) ? ((iTemp39) ? iTemp47 : iTemp36) : ((iTemp29) ? ((iTemp37) ? iTemp47 : iTemp36) : iTemp36)) : iTemp36);
        const iTemp48: i32 = ((iTemp41) ? iTemp46 > iTemp36 : iTemp26);
        this.iRec3[0] = ((iTemp11) ? ((iTemp28) ? ((iTemp39) ? iTemp48 : iTemp26) : ((iTemp29) ? ((iTemp37) ? iTemp48 : iTemp26) : iTemp26)) : iTemp26);
        const fTemp49: f32 = ((iTemp42) ? ((iTemp44) ? fSlow35 : fSlow41) : ((iTemp43) ? fSlow40 : fSlow18));
        const iTemp50: i32 = min<i32>(63, iSlow27 + ((41 * _icast(fTemp49)) >> 6));
        const iTemp51: i32 = ((iTemp41) ? _icast(this.fConst1 * _fcast(((iTemp50 & 3) + 4) << ((iTemp50 >> 2) + 2))) : iTemp33);
        this.iRec4[0] = ((iTemp11) ? ((iTemp28) ? ((iTemp39) ? iTemp51 : iTemp33) : ((iTemp29) ? ((iTemp37) ? iTemp51 : iTemp33) : iTemp33)) : iTemp33);
        this.iRec5[0] = iTemp10;
        const iTemp52: i32 = iTemp40 == 0;
        const iTemp53: i32 = fTemp45 == 0.0;
        const fTemp54: f32 = Mathf.min(fSlow28 + fTemp49, 99.0);
        const iTemp55: i32 = fTemp54 < 77.0;
        const fTemp56: f32 = ((iTemp55) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp54)), 76))]) : 2e+01 * (99.0 - fTemp54));
        const iTemp57: i32 = ((iTemp41) ? (((iTemp46 == iTemp36 ? 1 : 0) | (iTemp52 & iTemp53)) ? _icast(this.fConst1 * (((iTemp55 & iTemp52) & iTemp53) ? 0.05 * fTemp56 : fTemp56)) : 0) : iTemp24);
        this.iRec6[0] = ((iTemp11) ? ((iTemp28) ? ((iTemp39) ? iTemp57 : iTemp24) : ((iTemp29) ? ((iTemp37) ? iTemp57 : iTemp24) : iTemp24)) : iTemp24);
        const fTemp58: f32 = ((iSlow50 & iTemp1) ? 0.0 : this.fRec7[1]);
        const fTemp59: f32 = fTemp58 + fSlow52;
        const fTemp60: f32 = Mathf.floor(fTemp59);
        const fTemp61: f32 = fTemp59 - fTemp60;
        this.fRec7[0] = fTemp61;
        const fTemp62: f32 = ((iTemp1) ? 0.0 : this.fRec8[1]);
        const fTemp63: f32 = fTemp62 + ((fTemp62 < 1.0 ? 1 : 0) ? fSlow58 : fSlow57);
        const iTemp64: i32 = (fTemp63 <= 2.0 ? 1 : 0) * (2 - (fTemp63 < 1.0 ? 1 : 0));
        const iTemp65: i32 = iTemp64 >= 2;
        const iTemp66: i32 = iTemp64 >= 1;
        this.fRec8[0] = ((iTemp65) ? fTemp63 : ((iTemp66) ? fTemp63 : fTemp62));
        const iTemp67: i32 = ((fTemp61 < fSlow52 ? 1 : 0) ? (179 * this.iRec9[1] + 17) & 255 : this.iRec9[1]);
        this.iRec9[0] = ((iSlow60) ? ((iSlow61) ? iTemp67 : this.iRec9[1]) : this.iRec9[1]);
        const iTemp68: i32 = fTemp61 < 0.5;
        const fRec10: f32 = ((iSlow60) ? ((iSlow61) ? 0.003921569 * _fcast(iTemp67) : ((iSlow64) ? 0.5 * (Mathf.sin(6.2831855 * fTemp61) + 1.0) : ((iTemp68) ? 1.0 : 0.0))) : ((iSlow62) ? fTemp61 : ((iSlow63) ? fTemp60 + (1.0 - fTemp59) : ((iTemp68) ? 2.0 * fTemp61 : 2.0 * (1.0 - fTemp58)))));
        const fRec11: f32 = ((iTemp65) ? fTemp63 + -1.0 : ((iTemp66) ? 0.0 : 1.0));
        const fTemp69: f32 = fRec11 * (1.0 - fRec10);
        const iTemp70: i32 = iSlow66 & iTemp1;
        const iTemp71: i32 = ((iTemp2) ? 0 : ((iTemp0) ? 3 : this.iRec14[1]));
        const iTemp72: i32 = ((iTemp2) ? 1 : ((iTemp0) ? 0 : this.iRec18[1]));
        const iTemp73: i32 = ((iTemp71 < 3 ? 1 : 0) | ((iTemp71 < 4 ? 1 : 0) & (1 - iTemp72))) >= 1;
        const fTemp74: f32 = ((iTemp2) ? fSlow76 : this.fRec13[1]);
        const iTemp75: i32 = ((iTemp2) ? iSlow79 : ((iTemp0) ? fSlow76 > this.fRec13[1] : this.iRec16[1]));
        const iTemp76: i32 = iTemp75 >= 1;
        const fTemp77: f32 = ((iTemp2) ? fSlow83 : ((iTemp0) ? fSlow81 : this.fRec17[1]));
        const fTemp78: f32 = fTemp74 - fTemp77;
        const iTemp79: i32 = ((iTemp2) ? iSlow78 : ((iTemp0) ? iSlow75 : this.iRec15[1]));
        const fTemp80: f32 = _fcast(iTemp79);
        const iTemp81: i32 = (fTemp78 <= fTemp80 ? 1 : 0) >= 1;
        const fTemp82: f32 = fTemp74 + fTemp77;
        const iTemp83: i32 = (fTemp82 >= fTemp80 ? 1 : 0) >= 1;
        this.fRec13[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? fTemp80 : fTemp82) : ((iTemp81) ? fTemp80 : fTemp78)) : fTemp74);
        const iTemp84: i32 = iTemp71 + 1;
        this.iRec14[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp84 : iTemp71) : ((iTemp81) ? iTemp84 : iTemp71)) : iTemp71);
        const iTemp85: i32 = (iTemp84 < 4 ? 1 : 0) >= 1;
        const iTemp86: i32 = iTemp84 >= 2;
        const iTemp87: i32 = iTemp84 >= 1;
        const iTemp88: i32 = iTemp84 >= 3;
        const iTemp89: i32 = Dx7_itbl6SIG6[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow74 : fSlow85) : ((iTemp87) ? fSlow84 : fSlow77))))];
        const iTemp90: i32 = ((iTemp85) ? iTemp89 : iTemp79);
        this.iRec15[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp90 : iTemp79) : ((iTemp81) ? iTemp90 : iTemp79)) : iTemp79);
        const iTemp91: i32 = ((iTemp85) ? iTemp89 > iTemp79 : iTemp75);
        this.iRec16[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp91 : iTemp75) : ((iTemp81) ? iTemp91 : iTemp75)) : iTemp75);
        const fTemp92: f32 = ((iTemp85) ? this.fConst4 * _fcast(Dx7_itbl7SIG7[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow80 : fSlow87) : ((iTemp87) ? fSlow86 : fSlow82))))]) : fTemp77);
        this.fRec17[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? fTemp92 : fTemp77) : ((iTemp81) ? fTemp92 : fTemp77)) : fTemp77);
        this.iRec18[0] = iTemp72;
        const fTemp93: f32 = fRec10 + -0.5;
        const fTemp94: f32 = 524288.0 * this.fRec13[0] + 16777216.0 * Mathf.abs(fSlow88 * fRec11 * fSlow89 * fTemp93) * (((0.00390625 * fSlow89 * fTemp93) < 0.0) ? -1.0 : 1.0);
        const fTemp95: f32 = ((iTemp70) ? 0.0 : this.fRec12[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow73 + ((iSlow67) ? 0.0 : fTemp94))));
        this.fRec12[0] = fTemp95 - Mathf.floor(fTemp95);
        const iTemp96: i32 = ((iTemp2) ? 0 : this.iRec19[1]);
        const iTemp97: i32 = ((iTemp0) ? ((iSlow114 == iTemp96 ? 1 : 0) ? iSlow117 : 0) : ((iTemp2) ? iSlow112 : this.iRec25[1]));
        const iTemp98: i32 = iTemp97 != 0;
        const iTemp99: i32 = (iTemp98 & (iTemp97 <= 1 ? 1 : 0)) >= 1;
        const iTemp100: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec20[1]));
        const iTemp101: i32 = iTemp100 + 1;
        const iTemp102: i32 = ((iTemp99) ? iTemp101 : iTemp100);
        const iTemp103: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec24[1]));
        const iTemp104: i32 = ((iTemp102 < 3 ? 1 : 0) | ((iTemp102 < 4 ? 1 : 0) & (iTemp103 ^ -1))) >= 1;
        const iTemp105: i32 = (iTemp101 < 4 ? 1 : 0) >= 1;
        const iTemp106: i32 = iTemp101 >= 2;
        const iTemp107: i32 = iTemp101 >= 1;
        const iTemp108: i32 = iTemp101 >= 3;
        const fTemp109: f32 = ((iTemp106) ? ((iTemp108) ? fSlow113 : fSlow119) : ((iTemp107) ? fSlow118 : fSlow90));
        const iTemp110: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp109 >= 2e+01 ? 1 : 0) ? fTemp109 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp109)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp111: i32 = iTemp101 == 0;
        const iTemp112: i32 = fTemp109 == 0.0;
        const fTemp113: f32 = ((iTemp106) ? ((iTemp108) ? fSlow115 : fSlow121) : ((iTemp107) ? fSlow120 : fSlow104));
        const fTemp114: f32 = Mathf.min(fSlow108 + fTemp113, 99.0);
        const iTemp115: i32 = fTemp114 < 77.0;
        const fTemp116: f32 = ((iTemp115) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp114)), 76))]) : 2e+01 * (99.0 - fTemp114));
        const iTemp117: i32 = ((iTemp99) ? ((iTemp105) ? (((iTemp110 == iTemp96 ? 1 : 0) | (iTemp111 & iTemp112)) ? _icast(this.fConst1 * (((iTemp115 & iTemp111) & iTemp112) ? 0.05 * fTemp116 : fTemp116)) : 0) : 0) : iTemp97 - ((iTemp98) ? 1 : 0));
        const iTemp118: i32 = ((iTemp0) ? iSlow114 > iTemp96 : ((iTemp2) ? iSlow122 : this.iRec22[1]));
        const iTemp119: i32 = ((iTemp99) ? ((iTemp105) ? iTemp110 > iTemp96 : iTemp118) : iTemp118);
        const iTemp120: i32 = (iTemp117 == 0 ? 1 : 0) * ((iTemp119 == 0 ? 1 : 0) + 1);
        const iTemp121: i32 = iTemp120 >= 2;
        const iTemp122: i32 = iTemp120 >= 1;
        const iTemp123: i32 = max<i32>(112459776, iTemp96);
        const iTemp124: i32 = ((iTemp0) ? iSlow126 : ((iTemp2) ? iSlow124 : this.iRec23[1]));
        const iTemp125: i32 = min<i32>(63, iSlow107 + ((41 * _icast(fTemp113)) >> 6));
        const iTemp126: i32 = ((iTemp99) ? ((iTemp105) ? _icast(this.fConst1 * _fcast(((iTemp125 & 3) + 4) << ((iTemp125 >> 2) + 2))) : iTemp124) : iTemp124);
        const iTemp127: i32 = iTemp123 + ((285212672 - iTemp123) >> 24) * iTemp126;
        const iTemp128: i32 = ((iTemp0) ? iSlow114 : ((iTemp2) ? iSlow102 : this.iRec21[1]));
        const iTemp129: i32 = ((iTemp99) ? ((iTemp105) ? iTemp110 : iTemp128) : iTemp128);
        const iTemp130: i32 = (iTemp127 >= iTemp129 ? 1 : 0) >= 1;
        const iTemp131: i32 = iTemp96 - iTemp126;
        const iTemp132: i32 = (iTemp131 <= iTemp129 ? 1 : 0) >= 1;
        this.iRec19[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp129 : iTemp131) : ((iTemp122) ? ((iTemp130) ? iTemp129 : iTemp127) : iTemp96)) : iTemp96);
        const iTemp133: i32 = iTemp102 + 1;
        this.iRec20[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp133 : iTemp102) : ((iTemp122) ? ((iTemp130) ? iTemp133 : iTemp102) : iTemp102)) : iTemp102);
        const iTemp134: i32 = (iTemp133 < 4 ? 1 : 0) >= 1;
        const iTemp135: i32 = iTemp133 >= 2;
        const iTemp136: i32 = iTemp133 >= 1;
        const iTemp137: i32 = iTemp133 >= 3;
        const fTemp138: f32 = ((iTemp135) ? ((iTemp137) ? fSlow113 : fSlow119) : ((iTemp136) ? fSlow118 : fSlow90));
        const iTemp139: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp138 >= 2e+01 ? 1 : 0) ? fTemp138 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp138)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp140: i32 = ((iTemp134) ? iTemp139 : iTemp129);
        this.iRec21[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp140 : iTemp129) : ((iTemp122) ? ((iTemp130) ? iTemp140 : iTemp129) : iTemp129)) : iTemp129);
        const iTemp141: i32 = ((iTemp134) ? iTemp139 > iTemp129 : iTemp119);
        this.iRec22[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp141 : iTemp119) : ((iTemp122) ? ((iTemp130) ? iTemp141 : iTemp119) : iTemp119)) : iTemp119);
        const fTemp142: f32 = ((iTemp135) ? ((iTemp137) ? fSlow115 : fSlow121) : ((iTemp136) ? fSlow120 : fSlow104));
        const iTemp143: i32 = min<i32>(63, iSlow107 + ((41 * _icast(fTemp142)) >> 6));
        const iTemp144: i32 = ((iTemp134) ? _icast(this.fConst1 * _fcast(((iTemp143 & 3) + 4) << ((iTemp143 >> 2) + 2))) : iTemp126);
        this.iRec23[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp144 : iTemp126) : ((iTemp122) ? ((iTemp130) ? iTemp144 : iTemp126) : iTemp126)) : iTemp126);
        this.iRec24[0] = iTemp103;
        const iTemp145: i32 = iTemp133 == 0;
        const iTemp146: i32 = fTemp138 == 0.0;
        const fTemp147: f32 = Mathf.min(fSlow108 + fTemp142, 99.0);
        const iTemp148: i32 = fTemp147 < 77.0;
        const fTemp149: f32 = ((iTemp148) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp147)), 76))]) : 2e+01 * (99.0 - fTemp147));
        const iTemp150: i32 = ((iTemp134) ? (((iTemp139 == iTemp129 ? 1 : 0) | (iTemp145 & iTemp146)) ? _icast(this.fConst1 * (((iTemp148 & iTemp145) & iTemp146) ? 0.05 * fTemp149 : fTemp149)) : 0) : iTemp117);
        this.iRec25[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp150 : iTemp117) : ((iTemp122) ? ((iTemp130) ? iTemp150 : iTemp117) : iTemp117)) : iTemp117);
        const fTemp151: f32 = ((iTemp70) ? 0.0 : this.fRec26[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow134 + ((iSlow130) ? 0.0 : fTemp94))));
        this.fRec26[0] = fTemp151 - Mathf.floor(fTemp151);
        const iTemp152: i32 = ((iTemp2) ? 0 : this.iRec27[1]);
        const iTemp153: i32 = ((iTemp0) ? ((iSlow159 == iTemp152 ? 1 : 0) ? iSlow162 : 0) : ((iTemp2) ? iSlow157 : this.iRec33[1]));
        const iTemp154: i32 = iTemp153 != 0;
        const iTemp155: i32 = (iTemp154 & (iTemp153 <= 1 ? 1 : 0)) >= 1;
        const iTemp156: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec28[1]));
        const iTemp157: i32 = iTemp156 + 1;
        const iTemp158: i32 = ((iTemp155) ? iTemp157 : iTemp156);
        const iTemp159: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec32[1]));
        const iTemp160: i32 = ((iTemp158 < 3 ? 1 : 0) | ((iTemp158 < 4 ? 1 : 0) & (iTemp159 ^ -1))) >= 1;
        const iTemp161: i32 = (iTemp157 < 4 ? 1 : 0) >= 1;
        const iTemp162: i32 = iTemp157 >= 2;
        const iTemp163: i32 = iTemp157 >= 1;
        const iTemp164: i32 = iTemp157 >= 3;
        const fTemp165: f32 = ((iTemp162) ? ((iTemp164) ? fSlow158 : fSlow164) : ((iTemp163) ? fSlow163 : fSlow135));
        const iTemp166: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fTemp165 >= 2e+01 ? 1 : 0) ? fTemp165 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp165)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp167: i32 = iTemp157 == 0;
        const iTemp168: i32 = fTemp165 == 0.0;
        const fTemp169: f32 = ((iTemp162) ? ((iTemp164) ? fSlow160 : fSlow166) : ((iTemp163) ? fSlow165 : fSlow149));
        const fTemp170: f32 = Mathf.min(fSlow153 + fTemp169, 99.0);
        const iTemp171: i32 = fTemp170 < 77.0;
        const fTemp172: f32 = ((iTemp171) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp170)), 76))]) : 2e+01 * (99.0 - fTemp170));
        const iTemp173: i32 = ((iTemp155) ? ((iTemp161) ? (((iTemp166 == iTemp152 ? 1 : 0) | (iTemp167 & iTemp168)) ? _icast(this.fConst1 * (((iTemp171 & iTemp167) & iTemp168) ? 0.05 * fTemp172 : fTemp172)) : 0) : 0) : iTemp153 - ((iTemp154) ? 1 : 0));
        const iTemp174: i32 = ((iTemp0) ? iSlow159 > iTemp152 : ((iTemp2) ? iSlow167 : this.iRec30[1]));
        const iTemp175: i32 = ((iTemp155) ? ((iTemp161) ? iTemp166 > iTemp152 : iTemp174) : iTemp174);
        const iTemp176: i32 = (iTemp173 == 0 ? 1 : 0) * ((iTemp175 == 0 ? 1 : 0) + 1);
        const iTemp177: i32 = iTemp176 >= 2;
        const iTemp178: i32 = iTemp176 >= 1;
        const iTemp179: i32 = max<i32>(112459776, iTemp152);
        const iTemp180: i32 = ((iTemp0) ? iSlow171 : ((iTemp2) ? iSlow169 : this.iRec31[1]));
        const iTemp181: i32 = min<i32>(63, iSlow152 + ((41 * _icast(fTemp169)) >> 6));
        const iTemp182: i32 = ((iTemp155) ? ((iTemp161) ? _icast(this.fConst1 * _fcast(((iTemp181 & 3) + 4) << ((iTemp181 >> 2) + 2))) : iTemp180) : iTemp180);
        const iTemp183: i32 = iTemp179 + ((285212672 - iTemp179) >> 24) * iTemp182;
        const iTemp184: i32 = ((iTemp0) ? iSlow159 : ((iTemp2) ? iSlow147 : this.iRec29[1]));
        const iTemp185: i32 = ((iTemp155) ? ((iTemp161) ? iTemp166 : iTemp184) : iTemp184);
        const iTemp186: i32 = (iTemp183 >= iTemp185 ? 1 : 0) >= 1;
        const iTemp187: i32 = iTemp152 - iTemp182;
        const iTemp188: i32 = (iTemp187 <= iTemp185 ? 1 : 0) >= 1;
        this.iRec27[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp185 : iTemp187) : ((iTemp178) ? ((iTemp186) ? iTemp185 : iTemp183) : iTemp152)) : iTemp152);
        const iTemp189: i32 = iTemp158 + 1;
        this.iRec28[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp189 : iTemp158) : ((iTemp178) ? ((iTemp186) ? iTemp189 : iTemp158) : iTemp158)) : iTemp158);
        const iTemp190: i32 = (iTemp189 < 4 ? 1 : 0) >= 1;
        const iTemp191: i32 = iTemp189 >= 2;
        const iTemp192: i32 = iTemp189 >= 1;
        const iTemp193: i32 = iTemp189 >= 3;
        const fTemp194: f32 = ((iTemp191) ? ((iTemp193) ? fSlow158 : fSlow164) : ((iTemp192) ? fSlow163 : fSlow135));
        const iTemp195: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fTemp194 >= 2e+01 ? 1 : 0) ? fTemp194 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp194)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp196: i32 = ((iTemp190) ? iTemp195 : iTemp185);
        this.iRec29[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp196 : iTemp185) : ((iTemp178) ? ((iTemp186) ? iTemp196 : iTemp185) : iTemp185)) : iTemp185);
        const iTemp197: i32 = ((iTemp190) ? iTemp195 > iTemp185 : iTemp175);
        this.iRec30[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp197 : iTemp175) : ((iTemp178) ? ((iTemp186) ? iTemp197 : iTemp175) : iTemp175)) : iTemp175);
        const fTemp198: f32 = ((iTemp191) ? ((iTemp193) ? fSlow160 : fSlow166) : ((iTemp192) ? fSlow165 : fSlow149));
        const iTemp199: i32 = min<i32>(63, iSlow152 + ((41 * _icast(fTemp198)) >> 6));
        const iTemp200: i32 = ((iTemp190) ? _icast(this.fConst1 * _fcast(((iTemp199 & 3) + 4) << ((iTemp199 >> 2) + 2))) : iTemp182);
        this.iRec31[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp200 : iTemp182) : ((iTemp178) ? ((iTemp186) ? iTemp200 : iTemp182) : iTemp182)) : iTemp182);
        this.iRec32[0] = iTemp159;
        const iTemp201: i32 = iTemp189 == 0;
        const iTemp202: i32 = fTemp194 == 0.0;
        const fTemp203: f32 = Mathf.min(fSlow153 + fTemp198, 99.0);
        const iTemp204: i32 = fTemp203 < 77.0;
        const fTemp205: f32 = ((iTemp204) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp203)), 76))]) : 2e+01 * (99.0 - fTemp203));
        const iTemp206: i32 = ((iTemp190) ? (((iTemp195 == iTemp185 ? 1 : 0) | (iTemp201 & iTemp202)) ? _icast(this.fConst1 * (((iTemp204 & iTemp201) & iTemp202) ? 0.05 * fTemp205 : fTemp205)) : 0) : iTemp173);
        this.iRec33[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp206 : iTemp173) : ((iTemp178) ? ((iTemp186) ? iTemp206 : iTemp173) : iTemp173)) : iTemp173);
        const fTemp207: f32 = ((iTemp70) ? 0.0 : this.fRec34[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow179 + ((iSlow175) ? 0.0 : fTemp94))));
        this.fRec34[0] = fTemp207 - Mathf.floor(fTemp207);
        const iTemp208: i32 = ((iTemp2) ? 0 : this.iRec35[1]);
        const iTemp209: i32 = ((iTemp0) ? ((iSlow204 == iTemp208 ? 1 : 0) ? iSlow207 : 0) : ((iTemp2) ? iSlow202 : this.iRec41[1]));
        const iTemp210: i32 = iTemp209 != 0;
        const iTemp211: i32 = (iTemp210 & (iTemp209 <= 1 ? 1 : 0)) >= 1;
        const iTemp212: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec36[1]));
        const iTemp213: i32 = iTemp212 + 1;
        const iTemp214: i32 = ((iTemp211) ? iTemp213 : iTemp212);
        const iTemp215: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec40[1]));
        const iTemp216: i32 = ((iTemp214 < 3 ? 1 : 0) | ((iTemp214 < 4 ? 1 : 0) & (iTemp215 ^ -1))) >= 1;
        const iTemp217: i32 = (iTemp213 < 4 ? 1 : 0) >= 1;
        const iTemp218: i32 = iTemp213 >= 2;
        const iTemp219: i32 = iTemp213 >= 1;
        const iTemp220: i32 = iTemp213 >= 3;
        const fTemp221: f32 = ((iTemp218) ? ((iTemp220) ? fSlow203 : fSlow209) : ((iTemp219) ? fSlow208 : fSlow180));
        const iTemp222: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fTemp221 >= 2e+01 ? 1 : 0) ? fTemp221 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp221)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp223: i32 = iTemp213 == 0;
        const iTemp224: i32 = fTemp221 == 0.0;
        const fTemp225: f32 = ((iTemp218) ? ((iTemp220) ? fSlow205 : fSlow211) : ((iTemp219) ? fSlow210 : fSlow194));
        const fTemp226: f32 = Mathf.min(fSlow198 + fTemp225, 99.0);
        const iTemp227: i32 = fTemp226 < 77.0;
        const fTemp228: f32 = ((iTemp227) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp226)), 76))]) : 2e+01 * (99.0 - fTemp226));
        const iTemp229: i32 = ((iTemp211) ? ((iTemp217) ? (((iTemp222 == iTemp208 ? 1 : 0) | (iTemp223 & iTemp224)) ? _icast(this.fConst1 * (((iTemp227 & iTemp223) & iTemp224) ? 0.05 * fTemp228 : fTemp228)) : 0) : 0) : iTemp209 - ((iTemp210) ? 1 : 0));
        const iTemp230: i32 = ((iTemp0) ? iSlow204 > iTemp208 : ((iTemp2) ? iSlow212 : this.iRec38[1]));
        const iTemp231: i32 = ((iTemp211) ? ((iTemp217) ? iTemp222 > iTemp208 : iTemp230) : iTemp230);
        const iTemp232: i32 = (iTemp229 == 0 ? 1 : 0) * ((iTemp231 == 0 ? 1 : 0) + 1);
        const iTemp233: i32 = iTemp232 >= 2;
        const iTemp234: i32 = iTemp232 >= 1;
        const iTemp235: i32 = max<i32>(112459776, iTemp208);
        const iTemp236: i32 = ((iTemp0) ? iSlow216 : ((iTemp2) ? iSlow214 : this.iRec39[1]));
        const iTemp237: i32 = min<i32>(63, iSlow197 + ((41 * _icast(fTemp225)) >> 6));
        const iTemp238: i32 = ((iTemp211) ? ((iTemp217) ? _icast(this.fConst1 * _fcast(((iTemp237 & 3) + 4) << ((iTemp237 >> 2) + 2))) : iTemp236) : iTemp236);
        const iTemp239: i32 = iTemp235 + ((285212672 - iTemp235) >> 24) * iTemp238;
        const iTemp240: i32 = ((iTemp0) ? iSlow204 : ((iTemp2) ? iSlow192 : this.iRec37[1]));
        const iTemp241: i32 = ((iTemp211) ? ((iTemp217) ? iTemp222 : iTemp240) : iTemp240);
        const iTemp242: i32 = (iTemp239 >= iTemp241 ? 1 : 0) >= 1;
        const iTemp243: i32 = iTemp208 - iTemp238;
        const iTemp244: i32 = (iTemp243 <= iTemp241 ? 1 : 0) >= 1;
        this.iRec35[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp241 : iTemp243) : ((iTemp234) ? ((iTemp242) ? iTemp241 : iTemp239) : iTemp208)) : iTemp208);
        const iTemp245: i32 = iTemp214 + 1;
        this.iRec36[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp245 : iTemp214) : ((iTemp234) ? ((iTemp242) ? iTemp245 : iTemp214) : iTemp214)) : iTemp214);
        const iTemp246: i32 = (iTemp245 < 4 ? 1 : 0) >= 1;
        const iTemp247: i32 = iTemp245 >= 2;
        const iTemp248: i32 = iTemp245 >= 1;
        const iTemp249: i32 = iTemp245 >= 3;
        const fTemp250: f32 = ((iTemp247) ? ((iTemp249) ? fSlow203 : fSlow209) : ((iTemp248) ? fSlow208 : fSlow180));
        const iTemp251: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fTemp250 >= 2e+01 ? 1 : 0) ? fTemp250 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp250)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp252: i32 = ((iTemp246) ? iTemp251 : iTemp241);
        this.iRec37[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp252 : iTemp241) : ((iTemp234) ? ((iTemp242) ? iTemp252 : iTemp241) : iTemp241)) : iTemp241);
        const iTemp253: i32 = ((iTemp246) ? iTemp251 > iTemp241 : iTemp231);
        this.iRec38[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp253 : iTemp231) : ((iTemp234) ? ((iTemp242) ? iTemp253 : iTemp231) : iTemp231)) : iTemp231);
        const fTemp254: f32 = ((iTemp247) ? ((iTemp249) ? fSlow205 : fSlow211) : ((iTemp248) ? fSlow210 : fSlow194));
        const iTemp255: i32 = min<i32>(63, iSlow197 + ((41 * _icast(fTemp254)) >> 6));
        const iTemp256: i32 = ((iTemp246) ? _icast(this.fConst1 * _fcast(((iTemp255 & 3) + 4) << ((iTemp255 >> 2) + 2))) : iTemp238);
        this.iRec39[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp256 : iTemp238) : ((iTemp234) ? ((iTemp242) ? iTemp256 : iTemp238) : iTemp238)) : iTemp238);
        this.iRec40[0] = iTemp215;
        const iTemp257: i32 = iTemp245 == 0;
        const iTemp258: i32 = fTemp250 == 0.0;
        const fTemp259: f32 = Mathf.min(fSlow198 + fTemp254, 99.0);
        const iTemp260: i32 = fTemp259 < 77.0;
        const fTemp261: f32 = ((iTemp260) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp259)), 76))]) : 2e+01 * (99.0 - fTemp259));
        const iTemp262: i32 = ((iTemp246) ? (((iTemp251 == iTemp241 ? 1 : 0) | (iTemp257 & iTemp258)) ? _icast(this.fConst1 * (((iTemp260 & iTemp257) & iTemp258) ? 0.05 * fTemp261 : fTemp261)) : 0) : iTemp229);
        this.iRec41[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp262 : iTemp229) : ((iTemp234) ? ((iTemp242) ? iTemp262 : iTemp229) : iTemp229)) : iTemp229);
        const fTemp263: f32 = ((iTemp70) ? 0.0 : this.fRec42[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow224 + ((iSlow220) ? 0.0 : fTemp94))));
        this.fRec42[0] = fTemp263 - Mathf.floor(fTemp263);
        const iTemp264: i32 = ((iTemp2) ? 0 : this.iRec43[1]);
        const iTemp265: i32 = ((iTemp0) ? ((iSlow249 == iTemp264 ? 1 : 0) ? iSlow252 : 0) : ((iTemp2) ? iSlow247 : this.iRec49[1]));
        const iTemp266: i32 = iTemp265 != 0;
        const iTemp267: i32 = (iTemp266 & (iTemp265 <= 1 ? 1 : 0)) >= 1;
        const iTemp268: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec44[1]));
        const iTemp269: i32 = iTemp268 + 1;
        const iTemp270: i32 = ((iTemp267) ? iTemp269 : iTemp268);
        const iTemp271: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec48[1]));
        const iTemp272: i32 = ((iTemp270 < 3 ? 1 : 0) | ((iTemp270 < 4 ? 1 : 0) & (iTemp271 ^ -1))) >= 1;
        const iTemp273: i32 = (iTemp269 < 4 ? 1 : 0) >= 1;
        const iTemp274: i32 = iTemp269 >= 2;
        const iTemp275: i32 = iTemp269 >= 1;
        const iTemp276: i32 = iTemp269 >= 3;
        const fTemp277: f32 = ((iTemp274) ? ((iTemp276) ? fSlow248 : fSlow254) : ((iTemp275) ? fSlow253 : fSlow225));
        const iTemp278: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fTemp277 >= 2e+01 ? 1 : 0) ? fTemp277 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp277)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp279: i32 = iTemp269 == 0;
        const iTemp280: i32 = fTemp277 == 0.0;
        const fTemp281: f32 = ((iTemp274) ? ((iTemp276) ? fSlow250 : fSlow256) : ((iTemp275) ? fSlow255 : fSlow239));
        const fTemp282: f32 = Mathf.min(fSlow243 + fTemp281, 99.0);
        const iTemp283: i32 = fTemp282 < 77.0;
        const fTemp284: f32 = ((iTemp283) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp282)), 76))]) : 2e+01 * (99.0 - fTemp282));
        const iTemp285: i32 = ((iTemp267) ? ((iTemp273) ? (((iTemp278 == iTemp264 ? 1 : 0) | (iTemp279 & iTemp280)) ? _icast(this.fConst1 * (((iTemp283 & iTemp279) & iTemp280) ? 0.05 * fTemp284 : fTemp284)) : 0) : 0) : iTemp265 - ((iTemp266) ? 1 : 0));
        const iTemp286: i32 = ((iTemp0) ? iSlow249 > iTemp264 : ((iTemp2) ? iSlow257 : this.iRec46[1]));
        const iTemp287: i32 = ((iTemp267) ? ((iTemp273) ? iTemp278 > iTemp264 : iTemp286) : iTemp286);
        const iTemp288: i32 = (iTemp285 == 0 ? 1 : 0) * ((iTemp287 == 0 ? 1 : 0) + 1);
        const iTemp289: i32 = iTemp288 >= 2;
        const iTemp290: i32 = iTemp288 >= 1;
        const iTemp291: i32 = max<i32>(112459776, iTemp264);
        const iTemp292: i32 = ((iTemp0) ? iSlow261 : ((iTemp2) ? iSlow259 : this.iRec47[1]));
        const iTemp293: i32 = min<i32>(63, iSlow242 + ((41 * _icast(fTemp281)) >> 6));
        const iTemp294: i32 = ((iTemp267) ? ((iTemp273) ? _icast(this.fConst1 * _fcast(((iTemp293 & 3) + 4) << ((iTemp293 >> 2) + 2))) : iTemp292) : iTemp292);
        const iTemp295: i32 = iTemp291 + ((285212672 - iTemp291) >> 24) * iTemp294;
        const iTemp296: i32 = ((iTemp0) ? iSlow249 : ((iTemp2) ? iSlow237 : this.iRec45[1]));
        const iTemp297: i32 = ((iTemp267) ? ((iTemp273) ? iTemp278 : iTemp296) : iTemp296);
        const iTemp298: i32 = (iTemp295 >= iTemp297 ? 1 : 0) >= 1;
        const iTemp299: i32 = iTemp264 - iTemp294;
        const iTemp300: i32 = (iTemp299 <= iTemp297 ? 1 : 0) >= 1;
        this.iRec43[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp297 : iTemp299) : ((iTemp290) ? ((iTemp298) ? iTemp297 : iTemp295) : iTemp264)) : iTemp264);
        const iTemp301: i32 = iTemp270 + 1;
        this.iRec44[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp301 : iTemp270) : ((iTemp290) ? ((iTemp298) ? iTemp301 : iTemp270) : iTemp270)) : iTemp270);
        const iTemp302: i32 = (iTemp301 < 4 ? 1 : 0) >= 1;
        const iTemp303: i32 = iTemp301 >= 2;
        const iTemp304: i32 = iTemp301 >= 1;
        const iTemp305: i32 = iTemp301 >= 3;
        const fTemp306: f32 = ((iTemp303) ? ((iTemp305) ? fSlow248 : fSlow254) : ((iTemp304) ? fSlow253 : fSlow225));
        const iTemp307: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fTemp306 >= 2e+01 ? 1 : 0) ? fTemp306 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp306)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp308: i32 = ((iTemp302) ? iTemp307 : iTemp297);
        this.iRec45[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp308 : iTemp297) : ((iTemp290) ? ((iTemp298) ? iTemp308 : iTemp297) : iTemp297)) : iTemp297);
        const iTemp309: i32 = ((iTemp302) ? iTemp307 > iTemp297 : iTemp287);
        this.iRec46[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp309 : iTemp287) : ((iTemp290) ? ((iTemp298) ? iTemp309 : iTemp287) : iTemp287)) : iTemp287);
        const fTemp310: f32 = ((iTemp303) ? ((iTemp305) ? fSlow250 : fSlow256) : ((iTemp304) ? fSlow255 : fSlow239));
        const iTemp311: i32 = min<i32>(63, iSlow242 + ((41 * _icast(fTemp310)) >> 6));
        const iTemp312: i32 = ((iTemp302) ? _icast(this.fConst1 * _fcast(((iTemp311 & 3) + 4) << ((iTemp311 >> 2) + 2))) : iTemp294);
        this.iRec47[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp312 : iTemp294) : ((iTemp290) ? ((iTemp298) ? iTemp312 : iTemp294) : iTemp294)) : iTemp294);
        this.iRec48[0] = iTemp271;
        const iTemp313: i32 = iTemp301 == 0;
        const iTemp314: i32 = fTemp306 == 0.0;
        const fTemp315: f32 = Mathf.min(fSlow243 + fTemp310, 99.0);
        const iTemp316: i32 = fTemp315 < 77.0;
        const fTemp317: f32 = ((iTemp316) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp315)), 76))]) : 2e+01 * (99.0 - fTemp315));
        const iTemp318: i32 = ((iTemp302) ? (((iTemp307 == iTemp297 ? 1 : 0) | (iTemp313 & iTemp314)) ? _icast(this.fConst1 * (((iTemp316 & iTemp313) & iTemp314) ? 0.05 * fTemp317 : fTemp317)) : 0) : iTemp285);
        this.iRec49[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp318 : iTemp285) : ((iTemp290) ? ((iTemp298) ? iTemp318 : iTemp285) : iTemp285)) : iTemp285);
        const fTemp319: f32 = ((iTemp70) ? 0.0 : this.fRec50[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow269 + ((iSlow265) ? 0.0 : fTemp94))));
        this.fRec50[0] = fTemp319 - Mathf.floor(fTemp319);
        const iTemp320: i32 = ((iTemp2) ? 0 : this.iRec52[1]);
        const iTemp321: i32 = ((iTemp0) ? ((iSlow294 == iTemp320 ? 1 : 0) ? iSlow297 : 0) : ((iTemp2) ? iSlow292 : this.iRec58[1]));
        const iTemp322: i32 = iTemp321 != 0;
        const iTemp323: i32 = (iTemp322 & (iTemp321 <= 1 ? 1 : 0)) >= 1;
        const iTemp324: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec53[1]));
        const iTemp325: i32 = iTemp324 + 1;
        const iTemp326: i32 = ((iTemp323) ? iTemp325 : iTemp324);
        const iTemp327: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec57[1]));
        const iTemp328: i32 = ((iTemp326 < 3 ? 1 : 0) | ((iTemp326 < 4 ? 1 : 0) & (iTemp327 ^ -1))) >= 1;
        const iTemp329: i32 = (iTemp325 < 4 ? 1 : 0) >= 1;
        const iTemp330: i32 = iTemp325 >= 2;
        const iTemp331: i32 = iTemp325 >= 1;
        const iTemp332: i32 = iTemp325 >= 3;
        const fTemp333: f32 = ((iTemp330) ? ((iTemp332) ? fSlow293 : fSlow299) : ((iTemp331) ? fSlow298 : fSlow270));
        const iTemp334: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp333 >= 2e+01 ? 1 : 0) ? fTemp333 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp333)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp335: i32 = iTemp325 == 0;
        const iTemp336: i32 = fTemp333 == 0.0;
        const fTemp337: f32 = ((iTemp330) ? ((iTemp332) ? fSlow295 : fSlow301) : ((iTemp331) ? fSlow300 : fSlow284));
        const fTemp338: f32 = Mathf.min(fSlow288 + fTemp337, 99.0);
        const iTemp339: i32 = fTemp338 < 77.0;
        const fTemp340: f32 = ((iTemp339) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp338)), 76))]) : 2e+01 * (99.0 - fTemp338));
        const iTemp341: i32 = ((iTemp323) ? ((iTemp329) ? (((iTemp334 == iTemp320 ? 1 : 0) | (iTemp335 & iTemp336)) ? _icast(this.fConst1 * (((iTemp339 & iTemp335) & iTemp336) ? 0.05 * fTemp340 : fTemp340)) : 0) : 0) : iTemp321 - ((iTemp322) ? 1 : 0));
        const iTemp342: i32 = ((iTemp0) ? iSlow294 > iTemp320 : ((iTemp2) ? iSlow302 : this.iRec55[1]));
        const iTemp343: i32 = ((iTemp323) ? ((iTemp329) ? iTemp334 > iTemp320 : iTemp342) : iTemp342);
        const iTemp344: i32 = (iTemp341 == 0 ? 1 : 0) * ((iTemp343 == 0 ? 1 : 0) + 1);
        const iTemp345: i32 = iTemp344 >= 2;
        const iTemp346: i32 = iTemp344 >= 1;
        const iTemp347: i32 = max<i32>(112459776, iTemp320);
        const iTemp348: i32 = ((iTemp0) ? iSlow306 : ((iTemp2) ? iSlow304 : this.iRec56[1]));
        const iTemp349: i32 = min<i32>(63, iSlow287 + ((41 * _icast(fTemp337)) >> 6));
        const iTemp350: i32 = ((iTemp323) ? ((iTemp329) ? _icast(this.fConst1 * _fcast(((iTemp349 & 3) + 4) << ((iTemp349 >> 2) + 2))) : iTemp348) : iTemp348);
        const iTemp351: i32 = iTemp347 + ((285212672 - iTemp347) >> 24) * iTemp350;
        const iTemp352: i32 = ((iTemp0) ? iSlow294 : ((iTemp2) ? iSlow282 : this.iRec54[1]));
        const iTemp353: i32 = ((iTemp323) ? ((iTemp329) ? iTemp334 : iTemp352) : iTemp352);
        const iTemp354: i32 = (iTemp351 >= iTemp353 ? 1 : 0) >= 1;
        const iTemp355: i32 = iTemp320 - iTemp350;
        const iTemp356: i32 = (iTemp355 <= iTemp353 ? 1 : 0) >= 1;
        this.iRec52[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp353 : iTemp355) : ((iTemp346) ? ((iTemp354) ? iTemp353 : iTemp351) : iTemp320)) : iTemp320);
        const iTemp357: i32 = iTemp326 + 1;
        this.iRec53[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp357 : iTemp326) : ((iTemp346) ? ((iTemp354) ? iTemp357 : iTemp326) : iTemp326)) : iTemp326);
        const iTemp358: i32 = (iTemp357 < 4 ? 1 : 0) >= 1;
        const iTemp359: i32 = iTemp357 >= 2;
        const iTemp360: i32 = iTemp357 >= 1;
        const iTemp361: i32 = iTemp357 >= 3;
        const fTemp362: f32 = ((iTemp359) ? ((iTemp361) ? fSlow293 : fSlow299) : ((iTemp360) ? fSlow298 : fSlow270));
        const iTemp363: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp362 >= 2e+01 ? 1 : 0) ? fTemp362 + 28.0 : _fcast(Dx7_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp362)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp364: i32 = ((iTemp358) ? iTemp363 : iTemp353);
        this.iRec54[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp364 : iTemp353) : ((iTemp346) ? ((iTemp354) ? iTemp364 : iTemp353) : iTemp353)) : iTemp353);
        const iTemp365: i32 = ((iTemp358) ? iTemp363 > iTemp353 : iTemp343);
        this.iRec55[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp365 : iTemp343) : ((iTemp346) ? ((iTemp354) ? iTemp365 : iTemp343) : iTemp343)) : iTemp343);
        const fTemp366: f32 = ((iTemp359) ? ((iTemp361) ? fSlow295 : fSlow301) : ((iTemp360) ? fSlow300 : fSlow284));
        const iTemp367: i32 = min<i32>(63, iSlow287 + ((41 * _icast(fTemp366)) >> 6));
        const iTemp368: i32 = ((iTemp358) ? _icast(this.fConst1 * _fcast(((iTemp367 & 3) + 4) << ((iTemp367 >> 2) + 2))) : iTemp350);
        this.iRec56[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp368 : iTemp350) : ((iTemp346) ? ((iTemp354) ? iTemp368 : iTemp350) : iTemp350)) : iTemp350);
        this.iRec57[0] = iTemp327;
        const iTemp369: i32 = iTemp357 == 0;
        const iTemp370: i32 = fTemp362 == 0.0;
        const fTemp371: f32 = Mathf.min(fSlow288 + fTemp366, 99.0);
        const iTemp372: i32 = fTemp371 < 77.0;
        const fTemp373: f32 = ((iTemp372) ? _fcast(Dx7_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp371)), 76))]) : 2e+01 * (99.0 - fTemp371));
        const iTemp374: i32 = ((iTemp358) ? (((iTemp363 == iTemp353 ? 1 : 0) | (iTemp369 & iTemp370)) ? _icast(this.fConst1 * (((iTemp372 & iTemp369) & iTemp370) ? 0.05 * fTemp373 : fTemp373)) : 0) : iTemp341);
        this.iRec58[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp374 : iTemp341) : ((iTemp346) ? ((iTemp354) ? iTemp374 : iTemp341) : iTemp341)) : iTemp341);
        const fTemp375: f32 = ((iTemp70) ? 0.0 : this.fRec59[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow314 + ((iSlow310) ? 0.0 : fTemp94))));
        this.fRec59[0] = fTemp375 - Mathf.floor(fTemp375);
        this.fRec51[0] = 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec52[0] + (-234881024 - ((iSlow308) ? _icast(5.9604645e-08 * _fcast(this.iRec52[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow309 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec59[0] + this.fRec51[1] * fSlow316));
        const fTemp376: f32 = 0.5 * (Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec0[0] + (-234881024 - ((iSlow48) ? _icast(5.9604645e-08 * _fcast(this.iRec0[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow65 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec12[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec19[0] + (-234881024 - ((iSlow128) ? _icast(5.9604645e-08 * _fcast(this.iRec19[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow129 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec26[0]))) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec27[0] + (-234881024 - ((iSlow173) ? _icast(5.9604645e-08 * _fcast(this.iRec27[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow174 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec34[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec35[0] + (-234881024 - ((iSlow218) ? _icast(5.9604645e-08 * _fcast(this.iRec35[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow219 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec42[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec43[0] + (-234881024 - ((iSlow263) ? _icast(5.9604645e-08 * _fcast(this.iRec43[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow264 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec50[0] + this.fRec51[0])))))));
        const output: f32 = (fTemp376);

        this.fVec0[1] = this.fVec0[0];
        this.iRec0[1] = this.iRec0[0];
        this.iRec1[1] = this.iRec1[0];
        this.iRec2[1] = this.iRec2[0];
        this.iRec3[1] = this.iRec3[0];
        this.iRec4[1] = this.iRec4[0];
        this.iRec5[1] = this.iRec5[0];
        this.iRec6[1] = this.iRec6[0];
        this.fRec7[1] = this.fRec7[0];
        this.fRec8[1] = this.fRec8[0];
        this.iRec9[1] = this.iRec9[0];
        this.fRec13[1] = this.fRec13[0];
        this.iRec14[1] = this.iRec14[0];
        this.iRec15[1] = this.iRec15[0];
        this.iRec16[1] = this.iRec16[0];
        this.fRec17[1] = this.fRec17[0];
        this.iRec18[1] = this.iRec18[0];
        this.fRec12[1] = this.fRec12[0];
        this.iRec19[1] = this.iRec19[0];
        this.iRec20[1] = this.iRec20[0];
        this.iRec21[1] = this.iRec21[0];
        this.iRec22[1] = this.iRec22[0];
        this.iRec23[1] = this.iRec23[0];
        this.iRec24[1] = this.iRec24[0];
        this.iRec25[1] = this.iRec25[0];
        this.fRec26[1] = this.fRec26[0];
        this.iRec27[1] = this.iRec27[0];
        this.iRec28[1] = this.iRec28[0];
        this.iRec29[1] = this.iRec29[0];
        this.iRec30[1] = this.iRec30[0];
        this.iRec31[1] = this.iRec31[0];
        this.iRec32[1] = this.iRec32[0];
        this.iRec33[1] = this.iRec33[0];
        this.fRec34[1] = this.fRec34[0];
        this.iRec35[1] = this.iRec35[0];
        this.iRec36[1] = this.iRec36[0];
        this.iRec37[1] = this.iRec37[0];
        this.iRec38[1] = this.iRec38[0];
        this.iRec39[1] = this.iRec39[0];
        this.iRec40[1] = this.iRec40[0];
        this.iRec41[1] = this.iRec41[0];
        this.fRec42[1] = this.fRec42[0];
        this.iRec43[1] = this.iRec43[0];
        this.iRec44[1] = this.iRec44[0];
        this.iRec45[1] = this.iRec45[0];
        this.iRec46[1] = this.iRec46[0];
        this.iRec47[1] = this.iRec47[0];
        this.iRec48[1] = this.iRec48[0];
        this.iRec49[1] = this.iRec49[0];
        this.fRec50[1] = this.fRec50[0];
        this.iRec52[1] = this.iRec52[0];
        this.iRec53[1] = this.iRec53[0];
        this.iRec54[1] = this.iRec54[0];
        this.iRec55[1] = this.iRec55[0];
        this.iRec56[1] = this.iRec56[0];
        this.iRec57[1] = this.iRec57[0];
        this.iRec58[1] = this.iRec58[0];
        this.fRec59[1] = this.fRec59[0];
        this.fRec51[1] = this.fRec51[0];

        if (Mathf.abs(output) < 0.00001) {
            this.silentSamples++;
        } else {
            this.silentSamples = 0;
        }

        this.channel.signal.addMonoSignal(output, 0.5, 0.5);
    }
}

export class Dx7Channel extends MidiChannel {
    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case 0:
                dx7_fHslider126 = <f32>value / 127.0 * 7;
                break;
            case 1:
                dx7_fHslider2 = -24 + <f32>value / 127.0 * 48;
                break;
            case 2:
                dx7_fHslider22 = <f32>value / 127.0;
                break;
            case 3:
                dx7_fHslider27 = <f32>value / 127.0 * 99;
                break;
            case 4:
                dx7_fHslider30 = <f32>value / 127.0 * 99;
                break;
            case 5:
                dx7_fHslider31 = <f32>value / 127.0 * 99;
                break;
            case 6:
                dx7_fHslider26 = <f32>value / 127.0 * 99;
                break;
            case 8:
                dx7_fHslider29 = <f32>value / 127.0 * 99;
                break;
            case 9:
                dx7_fHslider32 = <f32>value / 127.0 * 99;
                break;
            case 11:
                dx7_fHslider33 = <f32>value / 127.0 * 99;
                break;
            case 12:
                dx7_fHslider28 = <f32>value / 127.0 * 99;
                break;
            case 13:
                dx7_fEntry2 = <f32>value / 127.0 * 5;
                break;
            case 14:
                dx7_fHslider20 = <f32>value / 127.0 * 99;
                break;
            case 15:
                dx7_fHslider21 = <f32>value / 127.0 * 99;
                break;
            case 16:
                dx7_fHslider34 = <f32>value / 127.0 * 99;
                break;
            case 17:
                dx7_fHslider18 = <f32>value / 127.0 * 99;
                break;
            case 18:
                dx7_fHslider19 = <f32>value / 127.0;
                break;
            case 19:
                dx7_fHslider35 = <f32>value / 127.0 * 7;
                break;
            case 20:
                dx7_fHslider23 = -7 + <f32>value / 127.0 * 14;
                break;
            case 21:
                dx7_fHslider24 = <f32>value / 127.0 * 31;
                break;
            case 22:
                dx7_fHslider25 = <f32>value / 127.0 * 99;
                break;
            case 23:
                dx7_fHslider0 = <f32>value / 127.0 * 99;
                break;
            case 24:
                dx7_fHslider13 = <f32>value / 127.0 * 99;
                break;
            case 25:
                dx7_fHslider14 = <f32>value / 127.0 * 99;
                break;
            case 26:
                dx7_fHslider11 = <f32>value / 127.0 * 99;
                break;
            case 27:
                dx7_fHslider9 = <f32>value / 127.0 * 99;
                break;
            case 28:
                dx7_fHslider15 = <f32>value / 127.0 * 99;
                break;
            case 29:
                dx7_fHslider16 = <f32>value / 127.0 * 99;
                break;
            case 30:
                dx7_fHslider12 = <f32>value / 127.0 * 99;
                break;
            case 31:
                dx7_fHslider1 = <f32>value / 127.0 * 99;
                break;
            case 32:
                dx7_fHslider7 = <f32>value / 127.0 * 7;
                break;
            case 33:
                dx7_fHslider17 = <f32>value / 127.0 * 3;
                break;
            case 34:
                dx7_fHslider10 = <f32>value / 127.0 * 7;
                break;
            case 35:
                dx7_fHslider4 = <f32>value / 127.0 * 99;
                break;
            case 36:
                dx7_fHslider5 = <f32>value / 127.0 * 99;
                break;
            case 37:
                dx7_fHslider6 = <f32>value / 127.0 * 99;
                break;
            case 38:
                dx7_fEntry0 = <f32>value / 127.0 * 3;
                break;
            case 39:
                dx7_fEntry1 = <f32>value / 127.0 * 3;
                break;
            case 40:
                dx7_fHslider51 = -7 + <f32>value / 127.0 * 14;
                break;
            case 41:
                dx7_fHslider52 = <f32>value / 127.0 * 31;
                break;
            case 42:
                dx7_fHslider53 = <f32>value / 127.0 * 99;
                break;
            case 43:
                dx7_fHslider36 = <f32>value / 127.0 * 99;
                break;
            case 44:
                dx7_fHslider46 = <f32>value / 127.0 * 99;
                break;
            case 45:
                dx7_fHslider47 = <f32>value / 127.0 * 99;
                break;
            case 46:
                dx7_fHslider44 = <f32>value / 127.0 * 99;
                break;
            case 47:
                dx7_fHslider42 = <f32>value / 127.0 * 99;
                break;
            case 48:
                dx7_fHslider48 = <f32>value / 127.0 * 99;
                break;
            case 49:
                dx7_fHslider49 = <f32>value / 127.0 * 99;
                break;
            case 50:
                dx7_fHslider45 = <f32>value / 127.0 * 99;
                break;
            case 51:
                dx7_fHslider37 = <f32>value / 127.0 * 99;
                break;
            case 52:
                dx7_fHslider41 = <f32>value / 127.0 * 7;
                break;
            case 53:
                dx7_fHslider50 = <f32>value / 127.0 * 3;
                break;
            case 54:
                dx7_fHslider43 = <f32>value / 127.0 * 7;
                break;
            case 55:
                dx7_fHslider38 = <f32>value / 127.0 * 99;
                break;
            case 56:
                dx7_fHslider39 = <f32>value / 127.0 * 99;
                break;
            case 57:
                dx7_fHslider40 = <f32>value / 127.0 * 99;
                break;
            case 58:
                dx7_fEntry3 = <f32>value / 127.0 * 3;
                break;
            case 59:
                dx7_fEntry4 = <f32>value / 127.0 * 3;
                break;
            case 60:
                dx7_fHslider69 = -7 + <f32>value / 127.0 * 14;
                break;
            case 61:
                dx7_fHslider70 = <f32>value / 127.0 * 31;
                break;
            case 62:
                dx7_fHslider71 = <f32>value / 127.0 * 99;
                break;
            case 63:
                dx7_fHslider54 = <f32>value / 127.0 * 99;
                break;
            case 65:
                dx7_fHslider64 = <f32>value / 127.0 * 99;
                break;
            case 66:
                dx7_fHslider65 = <f32>value / 127.0 * 99;
                break;
            case 67:
                dx7_fHslider62 = <f32>value / 127.0 * 99;
                break;
            case 68:
                dx7_fHslider60 = <f32>value / 127.0 * 99;
                break;
            case 69:
                dx7_fHslider66 = <f32>value / 127.0 * 99;
                break;
            case 70:
                dx7_fHslider67 = <f32>value / 127.0 * 99;
                break;
            case 71:
                dx7_fHslider63 = <f32>value / 127.0 * 99;
                break;
            case 72:
                dx7_fHslider55 = <f32>value / 127.0 * 99;
                break;
            case 73:
                dx7_fHslider59 = <f32>value / 127.0 * 7;
                break;
            case 74:
                dx7_fHslider68 = <f32>value / 127.0 * 3;
                break;
            case 75:
                dx7_fHslider61 = <f32>value / 127.0 * 7;
                break;
            case 76:
                dx7_fHslider56 = <f32>value / 127.0 * 99;
                break;
            case 77:
                dx7_fHslider57 = <f32>value / 127.0 * 99;
                break;
            case 78:
                dx7_fHslider58 = <f32>value / 127.0 * 99;
                break;
            case 79:
                dx7_fEntry5 = <f32>value / 127.0 * 3;
                break;
            case 80:
                dx7_fEntry6 = <f32>value / 127.0 * 3;
                break;
            case 81:
                dx7_fHslider87 = -7 + <f32>value / 127.0 * 14;
                break;
            case 82:
                dx7_fHslider88 = <f32>value / 127.0 * 31;
                break;
            case 83:
                dx7_fHslider89 = <f32>value / 127.0 * 99;
                break;
            case 84:
                dx7_fHslider72 = <f32>value / 127.0 * 99;
                break;
            case 85:
                dx7_fHslider82 = <f32>value / 127.0 * 99;
                break;
            case 86:
                dx7_fHslider83 = <f32>value / 127.0 * 99;
                break;
            case 87:
                dx7_fHslider80 = <f32>value / 127.0 * 99;
                break;
            case 88:
                dx7_fHslider78 = <f32>value / 127.0 * 99;
                break;
            case 89:
                dx7_fHslider84 = <f32>value / 127.0 * 99;
                break;
            case 90:
                dx7_fHslider85 = <f32>value / 127.0 * 99;
                break;
            case 92:
                dx7_fHslider81 = <f32>value / 127.0 * 99;
                break;
            case 93:
                dx7_fHslider73 = <f32>value / 127.0 * 99;
                break;
            case 94:
                dx7_fHslider77 = <f32>value / 127.0 * 7;
                break;
            case 95:
                dx7_fHslider86 = <f32>value / 127.0 * 3;
                break;
            case 96:
                dx7_fHslider79 = <f32>value / 127.0 * 7;
                break;
            case 97:
                dx7_fHslider74 = <f32>value / 127.0 * 99;
                break;
            case 98:
                dx7_fHslider75 = <f32>value / 127.0 * 99;
                break;
            case 99:
                dx7_fHslider76 = <f32>value / 127.0 * 99;
                break;
            case 100:
                dx7_fEntry7 = <f32>value / 127.0 * 3;
                break;
            case 101:
                dx7_fEntry8 = <f32>value / 127.0 * 3;
                break;
            case 102:
                dx7_fHslider105 = -7 + <f32>value / 127.0 * 14;
                break;
            case 103:
                dx7_fHslider106 = <f32>value / 127.0 * 31;
                break;
            case 104:
                dx7_fHslider107 = <f32>value / 127.0 * 99;
                break;
            case 105:
                dx7_fHslider90 = <f32>value / 127.0 * 99;
                break;
            case 106:
                dx7_fHslider100 = <f32>value / 127.0 * 99;
                break;
            case 107:
                dx7_fHslider101 = <f32>value / 127.0 * 99;
                break;
            case 108:
                dx7_fHslider98 = <f32>value / 127.0 * 99;
                break;
            case 109:
                dx7_fHslider96 = <f32>value / 127.0 * 99;
                break;
            case 110:
                dx7_fHslider102 = <f32>value / 127.0 * 99;
                break;
            case 111:
                dx7_fHslider103 = <f32>value / 127.0 * 99;
                break;
            case 112:
                dx7_fHslider99 = <f32>value / 127.0 * 99;
                break;
            case 113:
                dx7_fHslider91 = <f32>value / 127.0 * 99;
                break;
            case 114:
                dx7_fHslider95 = <f32>value / 127.0 * 7;
                break;
            case 115:
                dx7_fHslider104 = <f32>value / 127.0 * 3;
                break;
            case 116:
                dx7_fHslider97 = <f32>value / 127.0 * 7;
                break;
            case 117:
                dx7_fHslider92 = <f32>value / 127.0 * 99;
                break;
            case 118:
                dx7_fHslider93 = <f32>value / 127.0 * 99;
                break;
            case 119:
                dx7_fHslider94 = <f32>value / 127.0 * 99;
                break;
            case 120:
                dx7_fEntry9 = <f32>value / 127.0 * 3;
                break;
            case 121:
                dx7_fEntry10 = <f32>value / 127.0 * 3;
                break;
            case 122:
                dx7_fHslider123 = -7 + <f32>value / 127.0 * 14;
                break;
            case 123:
                dx7_fHslider124 = <f32>value / 127.0 * 31;
                break;
            case 124:
                dx7_fHslider125 = <f32>value / 127.0 * 99;
                break;
            case 125:
                dx7_fHslider108 = <f32>value / 127.0 * 99;
                break;
            case 126:
                dx7_fHslider118 = <f32>value / 127.0 * 99;
                break;
            case 127:
                dx7_fHslider119 = <f32>value / 127.0 * 99;
                break;
        }
    }
}

export function initializeMidiSynth(): void {
    midichannels[0] = new Dx7Channel(10, (channel: MidiChannel) => new Dx7(channel));
    midichannels[0].controlchange(7, 100);
    midichannels[0].controlchange(10, 64);
    midichannels[0].controlchange(91, 10);

    // Feedback (CC 0, range: 0–7, default: 0)
    midichannels[0].controlchange(0, 0);
    // Transpose (CC 1, range: -24–24, default: 0)
    midichannels[0].controlchange(1, 64);
    // Osc Key Sync (CC 2, range: 0–1, default: 1)
    midichannels[0].controlchange(2, 127);
    // L1 (CC 3, range: 0–99, default: 50)
    midichannels[0].controlchange(3, 64);
    // L2 (CC 4, range: 0–99, default: 50)
    midichannels[0].controlchange(4, 64);
    // L3 (CC 5, range: 0–99, default: 50)
    midichannels[0].controlchange(5, 64);
    // L4 (CC 6, range: 0–99, default: 50)
    midichannels[0].controlchange(6, 64);
    // R1 (CC 8, range: 0–99, default: 99)
    midichannels[0].controlchange(8, 127);
    // R2 (CC 9, range: 0–99, default: 99)
    midichannels[0].controlchange(9, 127);
    // R3 (CC 11, range: 0–99, default: 99)
    midichannels[0].controlchange(11, 127);
    // R4 (CC 12, range: 0–99, default: 99)
    midichannels[0].controlchange(12, 127);
    // Wave (CC 13, range: 0–5, default: 0)
    midichannels[0].controlchange(13, 0);
    // Speed (CC 14, range: 0–99, default: 35)
    midichannels[0].controlchange(14, 45);
    // Delay (CC 15, range: 0–99, default: 0)
    midichannels[0].controlchange(15, 0);
    // PMD (CC 16, range: 0–99, default: 0)
    midichannels[0].controlchange(16, 0);
    // AMD (CC 17, range: 0–99, default: 0)
    midichannels[0].controlchange(17, 0);
    // Sync (CC 18, range: 0–1, default: 1)
    midichannels[0].controlchange(18, 127);
    // P Mod Sens (CC 19, range: 0–7, default: 3)
    midichannels[0].controlchange(19, 54);
    // Tune (CC 20, range: -7–7, default: 0)
    midichannels[0].controlchange(20, 64);
    // Coarse (CC 21, range: 0–31, default: 1)
    midichannels[0].controlchange(21, 4);
    // Fine (CC 22, range: 0–99, default: 0)
    midichannels[0].controlchange(22, 0);
    // L1 (CC 23, range: 0–99, default: 99)
    midichannels[0].controlchange(23, 127);
    // L2 (CC 24, range: 0–99, default: 99)
    midichannels[0].controlchange(24, 127);
    // L3 (CC 25, range: 0–99, default: 99)
    midichannels[0].controlchange(25, 127);
    // L4 (CC 26, range: 0–99, default: 0)
    midichannels[0].controlchange(26, 0);
    // R1 (CC 27, range: 0–99, default: 99)
    midichannels[0].controlchange(27, 127);
    // R2 (CC 28, range: 0–99, default: 99)
    midichannels[0].controlchange(28, 127);
    // R3 (CC 29, range: 0–99, default: 99)
    midichannels[0].controlchange(29, 127);
    // R4 (CC 30, range: 0–99, default: 99)
    midichannels[0].controlchange(30, 127);
    // Level (CC 31, range: 0–99, default: 99)
    midichannels[0].controlchange(31, 127);
    // Key Vel (CC 32, range: 0–7, default: 0)
    midichannels[0].controlchange(32, 0);
    // A Mod Sens (CC 33, range: 0–3, default: 0)
    midichannels[0].controlchange(33, 0);
    // Rate Scaling (CC 34, range: 0–7, default: 0)
    midichannels[0].controlchange(34, 0);
    // Breakpoint (CC 35, range: 0–99, default: 0)
    midichannels[0].controlchange(35, 0);
    // L Depth (CC 36, range: 0–99, default: 0)
    midichannels[0].controlchange(36, 0);
    // R Depth (CC 37, range: 0–99, default: 0)
    midichannels[0].controlchange(37, 0);
    // L Curve (CC 38, range: 0–3, default: 0)
    midichannels[0].controlchange(38, 0);
    // R Curve (CC 39, range: 0–3, default: 0)
    midichannels[0].controlchange(39, 0);
    // Tune (CC 40, range: -7–7, default: 0)
    midichannels[0].controlchange(40, 64);
    // Coarse (CC 41, range: 0–31, default: 1)
    midichannels[0].controlchange(41, 4);
    // Fine (CC 42, range: 0–99, default: 0)
    midichannels[0].controlchange(42, 0);
    // L1 (CC 43, range: 0–99, default: 99)
    midichannels[0].controlchange(43, 127);
    // L2 (CC 44, range: 0–99, default: 99)
    midichannels[0].controlchange(44, 127);
    // L3 (CC 45, range: 0–99, default: 99)
    midichannels[0].controlchange(45, 127);
    // L4 (CC 46, range: 0–99, default: 0)
    midichannels[0].controlchange(46, 0);
    // R1 (CC 47, range: 0–99, default: 99)
    midichannels[0].controlchange(47, 127);
    // R2 (CC 48, range: 0–99, default: 99)
    midichannels[0].controlchange(48, 127);
    // R3 (CC 49, range: 0–99, default: 99)
    midichannels[0].controlchange(49, 127);
    // R4 (CC 50, range: 0–99, default: 99)
    midichannels[0].controlchange(50, 127);
    // Level (CC 51, range: 0–99, default: 0)
    midichannels[0].controlchange(51, 0);
    // Key Vel (CC 52, range: 0–7, default: 0)
    midichannels[0].controlchange(52, 0);
    // A Mod Sens (CC 53, range: 0–3, default: 0)
    midichannels[0].controlchange(53, 0);
    // Rate Scaling (CC 54, range: 0–7, default: 0)
    midichannels[0].controlchange(54, 0);
    // Breakpoint (CC 55, range: 0–99, default: 0)
    midichannels[0].controlchange(55, 0);
    // L Depth (CC 56, range: 0–99, default: 0)
    midichannels[0].controlchange(56, 0);
    // R Depth (CC 57, range: 0–99, default: 0)
    midichannels[0].controlchange(57, 0);
    // L Curve (CC 58, range: 0–3, default: 0)
    midichannels[0].controlchange(58, 0);
    // R Curve (CC 59, range: 0–3, default: 0)
    midichannels[0].controlchange(59, 0);
    // Tune (CC 60, range: -7–7, default: 0)
    midichannels[0].controlchange(60, 64);
    // Coarse (CC 61, range: 0–31, default: 1)
    midichannels[0].controlchange(61, 4);
    // Fine (CC 62, range: 0–99, default: 0)
    midichannels[0].controlchange(62, 0);
    // L1 (CC 63, range: 0–99, default: 99)
    midichannels[0].controlchange(63, 127);
    // L2 (CC 65, range: 0–99, default: 99)
    midichannels[0].controlchange(65, 127);
    // L3 (CC 66, range: 0–99, default: 99)
    midichannels[0].controlchange(66, 127);
    // L4 (CC 67, range: 0–99, default: 0)
    midichannels[0].controlchange(67, 0);
    // R1 (CC 68, range: 0–99, default: 99)
    midichannels[0].controlchange(68, 127);
    // R2 (CC 69, range: 0–99, default: 99)
    midichannels[0].controlchange(69, 127);
    // R3 (CC 70, range: 0–99, default: 99)
    midichannels[0].controlchange(70, 127);
    // R4 (CC 71, range: 0–99, default: 99)
    midichannels[0].controlchange(71, 127);
    // Level (CC 72, range: 0–99, default: 0)
    midichannels[0].controlchange(72, 0);
    // Key Vel (CC 73, range: 0–7, default: 0)
    midichannels[0].controlchange(73, 0);
    // A Mod Sens (CC 74, range: 0–3, default: 0)
    midichannels[0].controlchange(74, 0);
    // Rate Scaling (CC 75, range: 0–7, default: 0)
    midichannels[0].controlchange(75, 0);
    // Breakpoint (CC 76, range: 0–99, default: 0)
    midichannels[0].controlchange(76, 0);
    // L Depth (CC 77, range: 0–99, default: 0)
    midichannels[0].controlchange(77, 0);
    // R Depth (CC 78, range: 0–99, default: 0)
    midichannels[0].controlchange(78, 0);
    // L Curve (CC 79, range: 0–3, default: 0)
    midichannels[0].controlchange(79, 0);
    // R Curve (CC 80, range: 0–3, default: 0)
    midichannels[0].controlchange(80, 0);
    // Tune (CC 81, range: -7–7, default: 0)
    midichannels[0].controlchange(81, 64);
    // Coarse (CC 82, range: 0–31, default: 1)
    midichannels[0].controlchange(82, 4);
    // Fine (CC 83, range: 0–99, default: 0)
    midichannels[0].controlchange(83, 0);
    // L1 (CC 84, range: 0–99, default: 99)
    midichannels[0].controlchange(84, 127);
    // L2 (CC 85, range: 0–99, default: 99)
    midichannels[0].controlchange(85, 127);
    // L3 (CC 86, range: 0–99, default: 99)
    midichannels[0].controlchange(86, 127);
    // L4 (CC 87, range: 0–99, default: 0)
    midichannels[0].controlchange(87, 0);
    // R1 (CC 88, range: 0–99, default: 99)
    midichannels[0].controlchange(88, 127);
    // R2 (CC 89, range: 0–99, default: 99)
    midichannels[0].controlchange(89, 127);
    // R3 (CC 90, range: 0–99, default: 99)
    midichannels[0].controlchange(90, 127);
    // R4 (CC 92, range: 0–99, default: 99)
    midichannels[0].controlchange(92, 127);
    // Level (CC 93, range: 0–99, default: 0)
    midichannels[0].controlchange(93, 0);
    // Key Vel (CC 94, range: 0–7, default: 0)
    midichannels[0].controlchange(94, 0);
    // A Mod Sens (CC 95, range: 0–3, default: 0)
    midichannels[0].controlchange(95, 0);
    // Rate Scaling (CC 96, range: 0–7, default: 0)
    midichannels[0].controlchange(96, 0);
    // Breakpoint (CC 97, range: 0–99, default: 0)
    midichannels[0].controlchange(97, 0);
    // L Depth (CC 98, range: 0–99, default: 0)
    midichannels[0].controlchange(98, 0);
    // R Depth (CC 99, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    // L Curve (CC 100, range: 0–3, default: 0)
    midichannels[0].controlchange(100, 0);
    // R Curve (CC 101, range: 0–3, default: 0)
    midichannels[0].controlchange(101, 0);
    // Tune (CC 102, range: -7–7, default: 0)
    midichannels[0].controlchange(102, 64);
    // Coarse (CC 103, range: 0–31, default: 1)
    midichannels[0].controlchange(103, 4);
    // Fine (CC 104, range: 0–99, default: 0)
    midichannels[0].controlchange(104, 0);
    // L1 (CC 105, range: 0–99, default: 99)
    midichannels[0].controlchange(105, 127);
    // L2 (CC 106, range: 0–99, default: 99)
    midichannels[0].controlchange(106, 127);
    // L3 (CC 107, range: 0–99, default: 99)
    midichannels[0].controlchange(107, 127);
    // L4 (CC 108, range: 0–99, default: 0)
    midichannels[0].controlchange(108, 0);
    // R1 (CC 109, range: 0–99, default: 99)
    midichannels[0].controlchange(109, 127);
    // R2 (CC 110, range: 0–99, default: 99)
    midichannels[0].controlchange(110, 127);
    // R3 (CC 111, range: 0–99, default: 99)
    midichannels[0].controlchange(111, 127);
    // R4 (CC 112, range: 0–99, default: 99)
    midichannels[0].controlchange(112, 127);
    // Level (CC 113, range: 0–99, default: 0)
    midichannels[0].controlchange(113, 0);
    // Key Vel (CC 114, range: 0–7, default: 0)
    midichannels[0].controlchange(114, 0);
    // A Mod Sens (CC 115, range: 0–3, default: 0)
    midichannels[0].controlchange(115, 0);
    // Rate Scaling (CC 116, range: 0–7, default: 0)
    midichannels[0].controlchange(116, 0);
    // Breakpoint (CC 117, range: 0–99, default: 0)
    midichannels[0].controlchange(117, 0);
    // L Depth (CC 118, range: 0–99, default: 0)
    midichannels[0].controlchange(118, 0);
    // R Depth (CC 119, range: 0–99, default: 0)
    midichannels[0].controlchange(119, 0);
    // L Curve (CC 120, range: 0–3, default: 0)
    midichannels[0].controlchange(120, 0);
    // R Curve (CC 121, range: 0–3, default: 0)
    midichannels[0].controlchange(121, 0);
    // Tune (CC 122, range: -7–7, default: 0)
    midichannels[0].controlchange(122, 64);
    // Coarse (CC 123, range: 0–31, default: 1)
    midichannels[0].controlchange(123, 4);
    // Fine (CC 124, range: 0–99, default: 0)
    midichannels[0].controlchange(124, 0);
    // L1 (CC 125, range: 0–99, default: 99)
    midichannels[0].controlchange(125, 127);
    // L2 (CC 126, range: 0–99, default: 99)
    midichannels[0].controlchange(126, 127);
    // L3 (CC 127, range: 0–99, default: 99)
    midichannels[0].controlchange(127, 127);
}

export function postprocess(): void {
}
