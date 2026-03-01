// Faust-generated synth bundle
// Auto-transpiled from Faust DSP by faust2as.js
// Sources: dx7_alg5.dsp, dx7_alg16.dsp, dx7_alg2.dsp, dx7_alg5_bells.dsp, dx7_alg17.dsp, dx7_alg21.dsp, dx7_alg5_hat.dsp

import { notefreq, midichannels, MidiChannel, MidiVoice } from '../mixes/globalimports';
import { SAMPLERATE } from '../environment';

@inline function _fcast<T>(x: T): f32 { return <f32>x; }
@inline function _icast<T>(x: T): i32 { return <i32>x; }

// Feedback (NRPN 0)
let dx7_alg5_fHslider126: f32 = 0;
// Transpose (NRPN 1)
let dx7_alg5_fHslider2: f32 = 0;
// Osc Key Sync (NRPN 2)
let dx7_alg5_fHslider22: f32 = 1;
// L1 (NRPN 3)
let dx7_alg5_fHslider27: f32 = 50;
// L2 (NRPN 4)
let dx7_alg5_fHslider30: f32 = 50;
// L3 (NRPN 5)
let dx7_alg5_fHslider31: f32 = 50;
// L4 (NRPN 6)
let dx7_alg5_fHslider26: f32 = 50;
// R1 (NRPN 7)
let dx7_alg5_fHslider29: f32 = 99;
// R2 (NRPN 8)
let dx7_alg5_fHslider32: f32 = 99;
// R3 (NRPN 9)
let dx7_alg5_fHslider33: f32 = 99;
// R4 (NRPN 10)
let dx7_alg5_fHslider28: f32 = 99;
// Wave (NRPN 11)
let dx7_alg5_fEntry2: f32 = 0;
// Speed (NRPN 12)
let dx7_alg5_fHslider20: f32 = 35;
// Delay (NRPN 13)
let dx7_alg5_fHslider21: f32 = 0;
// PMD (NRPN 14)
let dx7_alg5_fHslider34: f32 = 0;
// AMD (NRPN 15)
let dx7_alg5_fHslider18: f32 = 0;
// Sync (NRPN 16)
let dx7_alg5_fHslider19: f32 = 1;
// P Mod Sens (NRPN 17)
let dx7_alg5_fHslider35: f32 = 3;
// Tune (NRPN 18)
let dx7_alg5_fHslider23: f32 = 0;
// Coarse (NRPN 19)
let dx7_alg5_fHslider24: f32 = 1;
// Fine (NRPN 20)
let dx7_alg5_fHslider25: f32 = 0;
// L1 (NRPN 21)
let dx7_alg5_fHslider0: f32 = 99;
// L2 (NRPN 22)
let dx7_alg5_fHslider13: f32 = 99;
// L3 (NRPN 23)
let dx7_alg5_fHslider14: f32 = 99;
// L4 (NRPN 24)
let dx7_alg5_fHslider11: f32 = 0;
// R1 (NRPN 25)
let dx7_alg5_fHslider9: f32 = 99;
// R2 (NRPN 26)
let dx7_alg5_fHslider15: f32 = 99;
// R3 (NRPN 27)
let dx7_alg5_fHslider16: f32 = 99;
// R4 (NRPN 28)
let dx7_alg5_fHslider12: f32 = 99;
// Level (NRPN 29)
let dx7_alg5_fHslider1: f32 = 99;
// Key Vel (NRPN 30)
let dx7_alg5_fHslider7: f32 = 0;
// A Mod Sens (NRPN 31)
let dx7_alg5_fHslider17: f32 = 0;
// Rate Scaling (NRPN 32)
let dx7_alg5_fHslider10: f32 = 0;
// Breakpoint (NRPN 33)
let dx7_alg5_fHslider4: f32 = 0;
// L Depth (NRPN 34)
let dx7_alg5_fHslider5: f32 = 0;
// R Depth (NRPN 35)
let dx7_alg5_fHslider6: f32 = 0;
// L Curve (NRPN 36)
let dx7_alg5_fEntry0: f32 = 0;
// R Curve (NRPN 37)
let dx7_alg5_fEntry1: f32 = 0;
// Tune (NRPN 38)
let dx7_alg5_fHslider51: f32 = 0;
// Coarse (NRPN 39)
let dx7_alg5_fHslider52: f32 = 1;
// Fine (NRPN 40)
let dx7_alg5_fHslider53: f32 = 0;
// L1 (NRPN 41)
let dx7_alg5_fHslider36: f32 = 99;
// L2 (NRPN 42)
let dx7_alg5_fHslider46: f32 = 99;
// L3 (NRPN 43)
let dx7_alg5_fHslider47: f32 = 99;
// L4 (NRPN 44)
let dx7_alg5_fHslider44: f32 = 0;
// R1 (NRPN 45)
let dx7_alg5_fHslider42: f32 = 99;
// R2 (NRPN 46)
let dx7_alg5_fHslider48: f32 = 99;
// R3 (NRPN 47)
let dx7_alg5_fHslider49: f32 = 99;
// R4 (NRPN 48)
let dx7_alg5_fHslider45: f32 = 99;
// Level (NRPN 49)
let dx7_alg5_fHslider37: f32 = 0;
// Key Vel (NRPN 50)
let dx7_alg5_fHslider41: f32 = 0;
// A Mod Sens (NRPN 51)
let dx7_alg5_fHslider50: f32 = 0;
// Rate Scaling (NRPN 52)
let dx7_alg5_fHslider43: f32 = 0;
// Breakpoint (NRPN 53)
let dx7_alg5_fHslider38: f32 = 0;
// L Depth (NRPN 54)
let dx7_alg5_fHslider39: f32 = 0;
// R Depth (NRPN 55)
let dx7_alg5_fHslider40: f32 = 0;
// L Curve (NRPN 56)
let dx7_alg5_fEntry3: f32 = 0;
// R Curve (NRPN 57)
let dx7_alg5_fEntry4: f32 = 0;
// Tune (NRPN 58)
let dx7_alg5_fHslider69: f32 = 0;
// Coarse (NRPN 59)
let dx7_alg5_fHslider70: f32 = 1;
// Fine (NRPN 60)
let dx7_alg5_fHslider71: f32 = 0;
// L1 (NRPN 61)
let dx7_alg5_fHslider54: f32 = 99;
// L2 (NRPN 62)
let dx7_alg5_fHslider64: f32 = 99;
// L3 (NRPN 63)
let dx7_alg5_fHslider65: f32 = 99;
// L4 (NRPN 64)
let dx7_alg5_fHslider62: f32 = 0;
// R1 (NRPN 65)
let dx7_alg5_fHslider60: f32 = 99;
// R2 (NRPN 66)
let dx7_alg5_fHslider66: f32 = 99;
// R3 (NRPN 67)
let dx7_alg5_fHslider67: f32 = 99;
// R4 (NRPN 68)
let dx7_alg5_fHslider63: f32 = 99;
// Level (NRPN 69)
let dx7_alg5_fHslider55: f32 = 0;
// Key Vel (NRPN 70)
let dx7_alg5_fHslider59: f32 = 0;
// A Mod Sens (NRPN 71)
let dx7_alg5_fHslider68: f32 = 0;
// Rate Scaling (NRPN 72)
let dx7_alg5_fHslider61: f32 = 0;
// Breakpoint (NRPN 73)
let dx7_alg5_fHslider56: f32 = 0;
// L Depth (NRPN 74)
let dx7_alg5_fHslider57: f32 = 0;
// R Depth (NRPN 75)
let dx7_alg5_fHslider58: f32 = 0;
// L Curve (NRPN 76)
let dx7_alg5_fEntry5: f32 = 0;
// R Curve (NRPN 77)
let dx7_alg5_fEntry6: f32 = 0;
// Tune (NRPN 78)
let dx7_alg5_fHslider87: f32 = 0;
// Coarse (NRPN 79)
let dx7_alg5_fHslider88: f32 = 1;
// Fine (NRPN 80)
let dx7_alg5_fHslider89: f32 = 0;
// L1 (NRPN 81)
let dx7_alg5_fHslider72: f32 = 99;
// L2 (NRPN 82)
let dx7_alg5_fHslider82: f32 = 99;
// L3 (NRPN 83)
let dx7_alg5_fHslider83: f32 = 99;
// L4 (NRPN 84)
let dx7_alg5_fHslider80: f32 = 0;
// R1 (NRPN 85)
let dx7_alg5_fHslider78: f32 = 99;
// R2 (NRPN 86)
let dx7_alg5_fHslider84: f32 = 99;
// R3 (NRPN 87)
let dx7_alg5_fHslider85: f32 = 99;
// R4 (NRPN 88)
let dx7_alg5_fHslider81: f32 = 99;
// Level (NRPN 89)
let dx7_alg5_fHslider73: f32 = 0;
// Key Vel (NRPN 90)
let dx7_alg5_fHslider77: f32 = 0;
// A Mod Sens (NRPN 91)
let dx7_alg5_fHslider86: f32 = 0;
// Rate Scaling (NRPN 92)
let dx7_alg5_fHslider79: f32 = 0;
// Breakpoint (NRPN 93)
let dx7_alg5_fHslider74: f32 = 0;
// L Depth (NRPN 94)
let dx7_alg5_fHslider75: f32 = 0;
// R Depth (NRPN 95)
let dx7_alg5_fHslider76: f32 = 0;
// L Curve (NRPN 96)
let dx7_alg5_fEntry7: f32 = 0;
// R Curve (NRPN 97)
let dx7_alg5_fEntry8: f32 = 0;
// Tune (NRPN 98)
let dx7_alg5_fHslider105: f32 = 0;
// Coarse (NRPN 99)
let dx7_alg5_fHslider106: f32 = 1;
// Fine (NRPN 100)
let dx7_alg5_fHslider107: f32 = 0;
// L1 (NRPN 101)
let dx7_alg5_fHslider90: f32 = 99;
// L2 (NRPN 102)
let dx7_alg5_fHslider100: f32 = 99;
// L3 (NRPN 103)
let dx7_alg5_fHslider101: f32 = 99;
// L4 (NRPN 104)
let dx7_alg5_fHslider98: f32 = 0;
// R1 (NRPN 105)
let dx7_alg5_fHslider96: f32 = 99;
// R2 (NRPN 106)
let dx7_alg5_fHslider102: f32 = 99;
// R3 (NRPN 107)
let dx7_alg5_fHslider103: f32 = 99;
// R4 (NRPN 108)
let dx7_alg5_fHslider99: f32 = 99;
// Level (NRPN 109)
let dx7_alg5_fHslider91: f32 = 0;
// Key Vel (NRPN 110)
let dx7_alg5_fHslider95: f32 = 0;
// A Mod Sens (NRPN 111)
let dx7_alg5_fHslider104: f32 = 0;
// Rate Scaling (NRPN 112)
let dx7_alg5_fHslider97: f32 = 0;
// Breakpoint (NRPN 113)
let dx7_alg5_fHslider92: f32 = 0;
// L Depth (NRPN 114)
let dx7_alg5_fHslider93: f32 = 0;
// R Depth (NRPN 115)
let dx7_alg5_fHslider94: f32 = 0;
// L Curve (NRPN 116)
let dx7_alg5_fEntry9: f32 = 0;
// R Curve (NRPN 117)
let dx7_alg5_fEntry10: f32 = 0;
// Tune (NRPN 118)
let dx7_alg5_fHslider123: f32 = 0;
// Coarse (NRPN 119)
let dx7_alg5_fHslider124: f32 = 1;
// Fine (NRPN 120)
let dx7_alg5_fHslider125: f32 = 0;
// L1 (NRPN 121)
let dx7_alg5_fHslider108: f32 = 99;
// L2 (NRPN 122)
let dx7_alg5_fHslider118: f32 = 99;
// L3 (NRPN 123)
let dx7_alg5_fHslider119: f32 = 99;
// L4 (NRPN 124)
let dx7_alg5_fHslider116: f32 = 0;
// R1 (NRPN 125)
let dx7_alg5_fHslider114: f32 = 99;
// R2 (NRPN 126)
let dx7_alg5_fHslider120: f32 = 99;
// R3 (NRPN 127)
let dx7_alg5_fHslider121: f32 = 99;
// R4 (NRPN 128)
let dx7_alg5_fHslider117: f32 = 99;
// Level (NRPN 129)
let dx7_alg5_fHslider109: f32 = 0;
// Key Vel (NRPN 130)
let dx7_alg5_fHslider113: f32 = 0;
// A Mod Sens (NRPN 131)
let dx7_alg5_fHslider122: f32 = 0;
// Rate Scaling (NRPN 132)
let dx7_alg5_fHslider115: f32 = 0;
// Breakpoint (NRPN 133)
let dx7_alg5_fHslider110: f32 = 0;
// L Depth (NRPN 134)
let dx7_alg5_fHslider111: f32 = 0;
// R Depth (NRPN 135)
let dx7_alg5_fHslider112: f32 = 0;
// L Curve (NRPN 136)
let dx7_alg5_fEntry11: f32 = 0;
// R Curve (NRPN 137)
let dx7_alg5_fEntry12: f32 = 0;

const Dx7_alg5_wave_SIG0Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 5, 9, 13, 17, 20, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 42, 43, 45, 46]);
const Dx7_alg5_wave_SIG1Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14, 16, 19, 23, 27, 33, 39, 47, 56, 66, 80, 94, 110, 126, 142, 158, 174, 190, 206, 222, 238, 250]);
const Dx7_alg5_wave_SIG2Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 70, 86, 97, 106, 114, 121, 126, 132, 138, 142, 148, 152, 156, 160, 163, 166, 170, 173, 174, 178, 181, 184, 186, 189, 190, 194, 196, 198, 200, 202, 205, 206, 209, 211, 214, 216, 218, 220, 222, 224, 225, 227, 229, 230, 232, 233, 235, 237, 238, 240, 241, 242, 243, 244, 246, 246, 248, 249, 250, 251, 252, 253, 254]);
const Dx7_alg5_wave_SIG3Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1764000, 1764000, 1411200, 1411200, 1190700, 1014300, 992250, 882000, 705600, 705600, 584325, 507150, 502740, 441000, 418950, 352800, 308700, 286650, 253575, 220500, 220500, 176400, 145530, 145530, 125685, 110250, 110250, 88200, 88200, 74970, 61740, 61740, 55125, 48510, 44100, 37485, 31311, 30870, 27562, 27562, 22050, 18522, 17640, 15435, 14112, 13230, 11025, 9261, 9261, 7717, 6615, 6615, 5512, 5512, 4410, 3969, 3969, 3439, 2866, 2690, 2249, 1984, 1896, 1808, 1411, 1367, 1234, 1146, 926, 837, 837, 705, 573, 573, 529, 441, 441]);
const Dx7_alg5_wave_SIG4Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 4342338, 7171437, 16777216]);
const Dx7_alg5_wave_SIG5Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-16777216, 0, 16777216, 26591258, 33554432, 38955489, 43368474, 47099600, 50331648, 53182516, 55732705, 58039632, 60145690, 62083076, 63876816, 65546747, 67108864, 68576247, 69959732, 71268397, 72509921, 73690858, 74816848, 75892776, 76922906, 77910978, 78860292, 79773775, 80654032, 81503396, 82323963, 83117622]);
const Dx7_alg5_wave_SIG6Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-128, -116, -104, -95, -85, -76, -68, -61, -56, -52, -49, -46, -43, -41, -39, -37, -35, -33, -32, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 38, 40, 43, 46, 49, 53, 58, 65, 73, 82, 92, 103, 115, 127]);
const Dx7_alg5_wave_SIG7Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 33, 34, 36, 37, 38, 39, 41, 42, 44, 46, 47, 49, 51, 53, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 79, 82, 85, 88, 91, 94, 98, 102, 106, 110, 115, 120, 125, 130, 135, 141, 147, 153, 159, 165, 171, 178, 185, 193, 202, 211, 232, 243, 254, 255]);
const Dx7_alg5_wave_SIG8Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 10, 20, 33, 55, 92, 153, 255]);

const Dx7_alg5_itbl0SIG0: StaticArray<i32> = new StaticArray<i32>(20);
const Dx7_alg5_itbl1SIG1: StaticArray<i32> = new StaticArray<i32>(33);
const Dx7_alg5_itbl2SIG2: StaticArray<i32> = new StaticArray<i32>(64);
const Dx7_alg5_itbl3SIG3: StaticArray<i32> = new StaticArray<i32>(77);
const Dx7_alg5_itbl4SIG4: StaticArray<i32> = new StaticArray<i32>(4);
const Dx7_alg5_itbl5SIG5: StaticArray<i32> = new StaticArray<i32>(32);
const Dx7_alg5_itbl6SIG6: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg5_itbl7SIG7: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg5_itbl8SIG8: StaticArray<i32> = new StaticArray<i32>(8);
let _Dx7_alg5_sig0_initialized: bool = false;

function _Dx7_alg5_initSIG0Tables(): void {
    if (_Dx7_alg5_sig0_initialized) return;
    _Dx7_alg5_sig0_initialized = true;
    let sig0_iDx7_alg5SIG0Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_itbl0SIG0.length; i++) {
        Dx7_alg5_itbl0SIG0[i] = Dx7_alg5_wave_SIG0Wave0[sig0_iDx7_alg5SIG0Wave0_idx];
        sig0_iDx7_alg5SIG0Wave0_idx = (1 + sig0_iDx7_alg5SIG0Wave0_idx) % 20;
    }
    let sig1_iDx7_alg5SIG1Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_itbl1SIG1.length; i++) {
        Dx7_alg5_itbl1SIG1[i] = Dx7_alg5_wave_SIG1Wave0[sig1_iDx7_alg5SIG1Wave0_idx];
        sig1_iDx7_alg5SIG1Wave0_idx = (1 + sig1_iDx7_alg5SIG1Wave0_idx) % 33;
    }
    let sig2_iDx7_alg5SIG2Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_itbl2SIG2.length; i++) {
        Dx7_alg5_itbl2SIG2[i] = Dx7_alg5_wave_SIG2Wave0[sig2_iDx7_alg5SIG2Wave0_idx];
        sig2_iDx7_alg5SIG2Wave0_idx = (1 + sig2_iDx7_alg5SIG2Wave0_idx) % 64;
    }
    let sig3_iDx7_alg5SIG3Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_itbl3SIG3.length; i++) {
        Dx7_alg5_itbl3SIG3[i] = Dx7_alg5_wave_SIG3Wave0[sig3_iDx7_alg5SIG3Wave0_idx];
        sig3_iDx7_alg5SIG3Wave0_idx = (1 + sig3_iDx7_alg5SIG3Wave0_idx) % 77;
    }
    let sig4_iDx7_alg5SIG4Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_itbl4SIG4.length; i++) {
        Dx7_alg5_itbl4SIG4[i] = Dx7_alg5_wave_SIG4Wave0[sig4_iDx7_alg5SIG4Wave0_idx];
        sig4_iDx7_alg5SIG4Wave0_idx = (1 + sig4_iDx7_alg5SIG4Wave0_idx) % 4;
    }
    let sig5_iDx7_alg5SIG5Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_itbl5SIG5.length; i++) {
        Dx7_alg5_itbl5SIG5[i] = Dx7_alg5_wave_SIG5Wave0[sig5_iDx7_alg5SIG5Wave0_idx];
        sig5_iDx7_alg5SIG5Wave0_idx = (1 + sig5_iDx7_alg5SIG5Wave0_idx) % 32;
    }
    let sig6_iDx7_alg5SIG6Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_itbl6SIG6.length; i++) {
        Dx7_alg5_itbl6SIG6[i] = Dx7_alg5_wave_SIG6Wave0[sig6_iDx7_alg5SIG6Wave0_idx];
        sig6_iDx7_alg5SIG6Wave0_idx = (1 + sig6_iDx7_alg5SIG6Wave0_idx) % 100;
    }
    let sig7_iDx7_alg5SIG7Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_itbl7SIG7.length; i++) {
        Dx7_alg5_itbl7SIG7[i] = Dx7_alg5_wave_SIG7Wave0[sig7_iDx7_alg5SIG7Wave0_idx];
        sig7_iDx7_alg5SIG7Wave0_idx = (1 + sig7_iDx7_alg5SIG7Wave0_idx) % 100;
    }
    let sig8_iDx7_alg5SIG8Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_itbl8SIG8.length; i++) {
        Dx7_alg5_itbl8SIG8[i] = Dx7_alg5_wave_SIG8Wave0[sig8_iDx7_alg5SIG8Wave0_idx];
        sig8_iDx7_alg5SIG8Wave0_idx = (1 + sig8_iDx7_alg5SIG8Wave0_idx) % 8;
    }
}

export class Dx7_alg5 extends MidiVoice {
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
        _Dx7_alg5_initSIG0Tables();
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
        this.fHslider8 = <f32>velocity / 127.0;
        this.fButton0 = 0.0;
        this.nextframe();
        this.fButton0 = 1.0;
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
        const fSlow1: f32 = Mathf.round(_fcast(dx7_alg5_fHslider0));
        const fSlow2: f32 = Mathf.round(_fcast(dx7_alg5_fHslider1));
        const fSlow3: f32 = Mathf.pow(2.0, 0.083333336 * (Mathf.round(_fcast(dx7_alg5_fHslider2)) + 17.31234 * Mathf.log(0.0022727272 * _fcast(this.fHslider3))));
        const fSlow4: f32 = Mathf.round(17.31234 * Mathf.log(fSlow3) + 69.0);
        const fSlow5: f32 = Mathf.round(_fcast(dx7_alg5_fHslider4));
        const fSlow6: f32 = Mathf.round(_fcast(dx7_alg5_fEntry0));
        const fSlow7: f32 = Mathf.round(_fcast(dx7_alg5_fHslider5));
        const fSlow8: f32 = fSlow4 + (-18.0 - fSlow5);
        const iSlow9: i32 = (((fSlow6 == 0.0 ? 1 : 0) | (fSlow6 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow7 * fSlow8)) >> 12 : _icast(329.0 * fSlow7 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow8))), 32))])) >> 15);
        const fSlow10: f32 = Mathf.round(_fcast(dx7_alg5_fEntry1));
        const fSlow11: f32 = Mathf.round(_fcast(dx7_alg5_fHslider6));
        const fSlow12: f32 = fSlow4 + (-16.0 - fSlow5);
        const iSlow13: i32 = (((fSlow10 == 0.0 ? 1 : 0) | (fSlow10 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow11 * fSlow12) >> 12 : _icast(329.0 * fSlow11 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow12)), 32))])) >> 15);
        const fSlow14: f32 = _fcast(Dx7_alg5_itbl2SIG2[_icast(Mathf.round(_fcast(_icast(Mathf.max(0.0, Mathf.min(127.0, 127.0 * _fcast(this.fHslider8)))) >> 1)))] + -239);
        const fSlow15: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow2 >= 2e+01 ? 1 : 0) ? fSlow2 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow2)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow5)) >= 0.0) ? ((fSlow10 < 2.0 ? 1 : 0) ? -iSlow13 : iSlow13) : ((fSlow6 < 2.0 ? 1 : 0) ? -iSlow9 : iSlow9)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_fHslider7)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow16: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow1 >= 2e+01 ? 1 : 0) ? fSlow1 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow1)), 19))]))) >> 1) << 6) + fSlow15 + -4256.0)) << 16;
        const iSlow17: i32 = fSlow1 == 0.0;
        const fSlow18: f32 = Mathf.round(_fcast(dx7_alg5_fHslider9));
        const fSlow19: f32 = Mathf.round(_fcast(dx7_alg5_fHslider10));
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
        const fSlow31: f32 = ((iSlow30) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow29)), 76))]) : 2e+01 * (99.0 - fSlow29));
        const iSlow32: i32 = (((iSlow16 == 0 ? 1 : 0) | iSlow17) ? _icast(this.fConst1 * ((iSlow30 & iSlow17) ? 0.05 * fSlow31 : fSlow31)) : 0);
        const fSlow33: f32 = Mathf.round(_fcast(dx7_alg5_fHslider11));
        const iSlow34: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fSlow33 >= 2e+01 ? 1 : 0) ? fSlow33 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow33)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow35: f32 = Mathf.round(_fcast(dx7_alg5_fHslider12));
        const fSlow36: f32 = Mathf.min(fSlow35 + fSlow28, 99.0);
        const iSlow37: i32 = _icast(this.fConst1 * ((fSlow36 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow36)), 76))]) : 2e+01 * (99.0 - fSlow36)));
        const fSlow38: f32 = Mathf.round(_fcast(dx7_alg5_fHslider13));
        const fSlow39: f32 = Mathf.round(_fcast(dx7_alg5_fHslider14));
        const fSlow40: f32 = Mathf.round(_fcast(dx7_alg5_fHslider15));
        const fSlow41: f32 = Mathf.round(_fcast(dx7_alg5_fHslider16));
        const iSlow42: i32 = iSlow16 > 0;
        const iSlow43: i32 = min<i32>(63, ((41 * _icast(fSlow18)) >> 6) + iSlow27);
        const iSlow44: i32 = _icast(this.fConst1 * _fcast(((iSlow43 & 3) + 4) << ((iSlow43 >> 2) + 2)));
        const iSlow45: i32 = min<i32>(63, ((41 * _icast(fSlow35)) >> 6) + iSlow27);
        const iSlow46: i32 = _icast(this.fConst1 * _fcast(((iSlow45 & 3) + 4) << ((iSlow45 >> 2) + 2)));
        const iSlow47: i32 = Dx7_alg5_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_fHslider17))))];
        const iSlow48: i32 = iSlow47 != 0;
        const fSlow49: f32 = 2.6972606e-09 * Mathf.round(_fcast(dx7_alg5_fHslider18));
        const iSlow50: i32 = _icast(Mathf.round(_fcast(dx7_alg5_fHslider19)));
        const fSlow51: f32 = Mathf.round(_fcast(dx7_alg5_fHslider20));
        const fSlow52: f32 = this.fConst2 * (((0.01010101 * fSlow51) <= 0.656566) ? 0.15806305 * fSlow51 + 0.036478 : 1.100254 * fSlow51 + -61.205933);
        const fSlow53: f32 = 99.0 - Mathf.round(_fcast(dx7_alg5_fHslider21));
        const iSlow54: i32 = (fSlow53 == 99.0 ? 1 : 0) >= 1;
        const iSlow55: i32 = _icast(fSlow53);
        const iSlow56: i32 = ((iSlow55 & 15) + 16) << ((iSlow55 >> 4) + 1);
        const fSlow57: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(max<i32>(iSlow56 & 65408, 128)));
        const fSlow58: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(iSlow56));
        const fSlow59: f32 = Mathf.round(_fcast(dx7_alg5_fEntry2));
        const iSlow60: i32 = fSlow59 >= 3.0;
        const iSlow61: i32 = fSlow59 >= 5.0;
        const iSlow62: i32 = fSlow59 >= 2.0;
        const iSlow63: i32 = fSlow59 >= 1.0;
        const iSlow64: i32 = fSlow59 >= 4.0;
        const fSlow65: f32 = _fcast(iSlow47);
        const iSlow66: i32 = _icast(Mathf.round(_fcast(dx7_alg5_fHslider22)));
        const iSlow67: i32 = _icast(Mathf.round(_fcast(this.fCheckbox0)));
        const fSlow68: f32 = Mathf.log(4.4e+02 * fSlow3);
        const fSlow69: f32 = Mathf.round(_fcast(dx7_alg5_fHslider23));
        const fSlow70: f32 = Mathf.exp(-0.57130724 * fSlow68);
        const iSlow71: i32 = _icast(Mathf.round(_fcast(dx7_alg5_fHslider24)));
        const fSlow72: f32 = Mathf.round(_fcast(dx7_alg5_fHslider25));
        const fSlow73: f32 = ((iSlow67) ? _fcast(_icast(4458616.0 * (fSlow72 + _fcast(100 * (iSlow71 & 3)))) >> 3) + ((fSlow69 > 0.0 ? 1 : 0) ? 13457.0 * fSlow69 : 0.0) : fSlow68 * (72267.445 * fSlow69 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow71 & 31)))]) + _fcast(((_icast(fSlow72)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow72 + 1.0) + 0.5)) : 0)));
        const fSlow74: f32 = Mathf.round(_fcast(dx7_alg5_fHslider26));
        const iSlow75: i32 = Dx7_alg5_itbl6SIG6[_icast(Mathf.round(fSlow74))];
        const fSlow76: f32 = _fcast(iSlow75);
        const fSlow77: f32 = Mathf.round(_fcast(dx7_alg5_fHslider27));
        const iSlow78: i32 = Dx7_alg5_itbl6SIG6[_icast(Mathf.round(fSlow77))];
        const iSlow79: i32 = iSlow78 > iSlow75;
        const fSlow80: f32 = Mathf.round(_fcast(dx7_alg5_fHslider28));
        const fSlow81: f32 = this.fConst4 * _fcast(Dx7_alg5_itbl7SIG7[_icast(Mathf.round(fSlow80))]);
        const fSlow82: f32 = Mathf.round(_fcast(dx7_alg5_fHslider29));
        const fSlow83: f32 = this.fConst4 * _fcast(Dx7_alg5_itbl7SIG7[_icast(Mathf.round(fSlow82))]);
        const fSlow84: f32 = Mathf.round(_fcast(dx7_alg5_fHslider30));
        const fSlow85: f32 = Mathf.round(_fcast(dx7_alg5_fHslider31));
        const fSlow86: f32 = Mathf.round(_fcast(dx7_alg5_fHslider32));
        const fSlow87: f32 = Mathf.round(_fcast(dx7_alg5_fHslider33));
        const fSlow88: f32 = 7.891414e-05 * Mathf.round(_fcast(dx7_alg5_fHslider34));
        const fSlow89: f32 = _fcast(Dx7_alg5_itbl8SIG8[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_fHslider35))))]);
        const fSlow90: f32 = Mathf.round(_fcast(dx7_alg5_fHslider36));
        const fSlow91: f32 = Mathf.round(_fcast(dx7_alg5_fHslider37));
        const fSlow92: f32 = Mathf.round(_fcast(dx7_alg5_fHslider38));
        const fSlow93: f32 = Mathf.round(_fcast(dx7_alg5_fEntry3));
        const fSlow94: f32 = Mathf.round(_fcast(dx7_alg5_fHslider39));
        const fSlow95: f32 = fSlow4 + (-18.0 - fSlow92);
        const iSlow96: i32 = (((fSlow93 == 0.0 ? 1 : 0) | (fSlow93 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow94 * fSlow95)) >> 12 : _icast(329.0 * fSlow94 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow95))), 32))])) >> 15);
        const fSlow97: f32 = Mathf.round(_fcast(dx7_alg5_fEntry4));
        const fSlow98: f32 = Mathf.round(_fcast(dx7_alg5_fHslider40));
        const fSlow99: f32 = fSlow4 + (-16.0 - fSlow92);
        const iSlow100: i32 = (((fSlow97 == 0.0 ? 1 : 0) | (fSlow97 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow98 * fSlow99) >> 12 : _icast(329.0 * fSlow98 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow99)), 32))])) >> 15);
        const fSlow101: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow91 >= 2e+01 ? 1 : 0) ? fSlow91 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow91)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow92)) >= 0.0) ? ((fSlow97 < 2.0 ? 1 : 0) ? -iSlow100 : iSlow100) : ((fSlow93 < 2.0 ? 1 : 0) ? -iSlow96 : iSlow96)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_fHslider41)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow102: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow90 >= 2e+01 ? 1 : 0) ? fSlow90 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow90)), 19))]))) >> 1) << 6) + fSlow101 + -4256.0)) << 16;
        const iSlow103: i32 = fSlow90 == 0.0;
        const fSlow104: f32 = Mathf.round(_fcast(dx7_alg5_fHslider42));
        const fSlow105: f32 = Mathf.round(_fcast(dx7_alg5_fHslider43));
        const iSlow106: i32 = _icast(fSlow105 * fSlow25) >> 3;
        const iSlow107: i32 = (((fSlow105 == 3.0 ? 1 : 0) & iSlow22) ? iSlow106 + -1 : ((((fSlow105 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow106 + 1 : iSlow106));
        const fSlow108: f32 = _fcast(iSlow107);
        const fSlow109: f32 = Mathf.min(fSlow104 + fSlow108, 99.0);
        const iSlow110: i32 = fSlow109 < 77.0;
        const fSlow111: f32 = ((iSlow110) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow109)), 76))]) : 2e+01 * (99.0 - fSlow109));
        const iSlow112: i32 = (((iSlow102 == 0 ? 1 : 0) | iSlow103) ? _icast(this.fConst1 * ((iSlow110 & iSlow103) ? 0.05 * fSlow111 : fSlow111)) : 0);
        const fSlow113: f32 = Mathf.round(_fcast(dx7_alg5_fHslider44));
        const iSlow114: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fSlow113 >= 2e+01 ? 1 : 0) ? fSlow113 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow113)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow115: f32 = Mathf.round(_fcast(dx7_alg5_fHslider45));
        const fSlow116: f32 = Mathf.min(fSlow115 + fSlow108, 99.0);
        const iSlow117: i32 = _icast(this.fConst1 * ((fSlow116 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow116)), 76))]) : 2e+01 * (99.0 - fSlow116)));
        const fSlow118: f32 = Mathf.round(_fcast(dx7_alg5_fHslider46));
        const fSlow119: f32 = Mathf.round(_fcast(dx7_alg5_fHslider47));
        const fSlow120: f32 = Mathf.round(_fcast(dx7_alg5_fHslider48));
        const fSlow121: f32 = Mathf.round(_fcast(dx7_alg5_fHslider49));
        const iSlow122: i32 = iSlow102 > 0;
        const iSlow123: i32 = min<i32>(63, ((41 * _icast(fSlow104)) >> 6) + iSlow107);
        const iSlow124: i32 = _icast(this.fConst1 * _fcast(((iSlow123 & 3) + 4) << ((iSlow123 >> 2) + 2)));
        const iSlow125: i32 = min<i32>(63, ((41 * _icast(fSlow115)) >> 6) + iSlow107);
        const iSlow126: i32 = _icast(this.fConst1 * _fcast(((iSlow125 & 3) + 4) << ((iSlow125 >> 2) + 2)));
        const iSlow127: i32 = Dx7_alg5_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_fHslider50))))];
        const iSlow128: i32 = iSlow127 != 0;
        const fSlow129: f32 = _fcast(iSlow127);
        const iSlow130: i32 = _icast(Mathf.round(_fcast(this.fCheckbox1)));
        const fSlow131: f32 = Mathf.round(_fcast(dx7_alg5_fHslider51));
        const iSlow132: i32 = _icast(Mathf.round(_fcast(dx7_alg5_fHslider52)));
        const fSlow133: f32 = Mathf.round(_fcast(dx7_alg5_fHslider53));
        const fSlow134: f32 = ((iSlow130) ? _fcast(_icast(4458616.0 * (fSlow133 + _fcast(100 * (iSlow132 & 3)))) >> 3) + ((fSlow131 > 0.0 ? 1 : 0) ? 13457.0 * fSlow131 : 0.0) : fSlow68 * (72267.445 * fSlow131 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow132 & 31)))]) + _fcast(((_icast(fSlow133)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow133 + 1.0) + 0.5)) : 0)));
        const fSlow135: f32 = Mathf.round(_fcast(dx7_alg5_fHslider54));
        const fSlow136: f32 = Mathf.round(_fcast(dx7_alg5_fHslider55));
        const fSlow137: f32 = Mathf.round(_fcast(dx7_alg5_fHslider56));
        const fSlow138: f32 = Mathf.round(_fcast(dx7_alg5_fEntry5));
        const fSlow139: f32 = Mathf.round(_fcast(dx7_alg5_fHslider57));
        const fSlow140: f32 = fSlow4 + (-18.0 - fSlow137);
        const iSlow141: i32 = (((fSlow138 == 0.0 ? 1 : 0) | (fSlow138 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow139 * fSlow140)) >> 12 : _icast(329.0 * fSlow139 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow140))), 32))])) >> 15);
        const fSlow142: f32 = Mathf.round(_fcast(dx7_alg5_fEntry6));
        const fSlow143: f32 = Mathf.round(_fcast(dx7_alg5_fHslider58));
        const fSlow144: f32 = fSlow4 + (-16.0 - fSlow137);
        const iSlow145: i32 = (((fSlow142 == 0.0 ? 1 : 0) | (fSlow142 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow143 * fSlow144) >> 12 : _icast(329.0 * fSlow143 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow144)), 32))])) >> 15);
        const fSlow146: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow136 >= 2e+01 ? 1 : 0) ? fSlow136 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow136)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow137)) >= 0.0) ? ((fSlow142 < 2.0 ? 1 : 0) ? -iSlow145 : iSlow145) : ((fSlow138 < 2.0 ? 1 : 0) ? -iSlow141 : iSlow141)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_fHslider59)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow147: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow135 >= 2e+01 ? 1 : 0) ? fSlow135 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow135)), 19))]))) >> 1) << 6) + fSlow146 + -4256.0)) << 16;
        const iSlow148: i32 = fSlow135 == 0.0;
        const fSlow149: f32 = Mathf.round(_fcast(dx7_alg5_fHslider60));
        const fSlow150: f32 = Mathf.round(_fcast(dx7_alg5_fHslider61));
        const iSlow151: i32 = _icast(fSlow150 * fSlow25) >> 3;
        const iSlow152: i32 = (((fSlow150 == 3.0 ? 1 : 0) & iSlow22) ? iSlow151 + -1 : ((((fSlow150 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow151 + 1 : iSlow151));
        const fSlow153: f32 = _fcast(iSlow152);
        const fSlow154: f32 = Mathf.min(fSlow149 + fSlow153, 99.0);
        const iSlow155: i32 = fSlow154 < 77.0;
        const fSlow156: f32 = ((iSlow155) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow154)), 76))]) : 2e+01 * (99.0 - fSlow154));
        const iSlow157: i32 = (((iSlow147 == 0 ? 1 : 0) | iSlow148) ? _icast(this.fConst1 * ((iSlow155 & iSlow148) ? 0.05 * fSlow156 : fSlow156)) : 0);
        const fSlow158: f32 = Mathf.round(_fcast(dx7_alg5_fHslider62));
        const iSlow159: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fSlow158 >= 2e+01 ? 1 : 0) ? fSlow158 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow158)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow160: f32 = Mathf.round(_fcast(dx7_alg5_fHslider63));
        const fSlow161: f32 = Mathf.min(fSlow160 + fSlow153, 99.0);
        const iSlow162: i32 = _icast(this.fConst1 * ((fSlow161 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow161)), 76))]) : 2e+01 * (99.0 - fSlow161)));
        const fSlow163: f32 = Mathf.round(_fcast(dx7_alg5_fHslider64));
        const fSlow164: f32 = Mathf.round(_fcast(dx7_alg5_fHslider65));
        const fSlow165: f32 = Mathf.round(_fcast(dx7_alg5_fHslider66));
        const fSlow166: f32 = Mathf.round(_fcast(dx7_alg5_fHslider67));
        const iSlow167: i32 = iSlow147 > 0;
        const iSlow168: i32 = min<i32>(63, ((41 * _icast(fSlow149)) >> 6) + iSlow152);
        const iSlow169: i32 = _icast(this.fConst1 * _fcast(((iSlow168 & 3) + 4) << ((iSlow168 >> 2) + 2)));
        const iSlow170: i32 = min<i32>(63, ((41 * _icast(fSlow160)) >> 6) + iSlow152);
        const iSlow171: i32 = _icast(this.fConst1 * _fcast(((iSlow170 & 3) + 4) << ((iSlow170 >> 2) + 2)));
        const iSlow172: i32 = Dx7_alg5_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_fHslider68))))];
        const iSlow173: i32 = iSlow172 != 0;
        const fSlow174: f32 = _fcast(iSlow172);
        const iSlow175: i32 = _icast(Mathf.round(_fcast(this.fCheckbox2)));
        const fSlow176: f32 = Mathf.round(_fcast(dx7_alg5_fHslider69));
        const iSlow177: i32 = _icast(Mathf.round(_fcast(dx7_alg5_fHslider70)));
        const fSlow178: f32 = Mathf.round(_fcast(dx7_alg5_fHslider71));
        const fSlow179: f32 = ((iSlow175) ? _fcast(_icast(4458616.0 * (fSlow178 + _fcast(100 * (iSlow177 & 3)))) >> 3) + ((fSlow176 > 0.0 ? 1 : 0) ? 13457.0 * fSlow176 : 0.0) : fSlow68 * (72267.445 * fSlow176 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow177 & 31)))]) + _fcast(((_icast(fSlow178)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow178 + 1.0) + 0.5)) : 0)));
        const fSlow180: f32 = Mathf.round(_fcast(dx7_alg5_fHslider72));
        const fSlow181: f32 = Mathf.round(_fcast(dx7_alg5_fHslider73));
        const fSlow182: f32 = Mathf.round(_fcast(dx7_alg5_fHslider74));
        const fSlow183: f32 = Mathf.round(_fcast(dx7_alg5_fEntry7));
        const fSlow184: f32 = Mathf.round(_fcast(dx7_alg5_fHslider75));
        const fSlow185: f32 = fSlow4 + (-18.0 - fSlow182);
        const iSlow186: i32 = (((fSlow183 == 0.0 ? 1 : 0) | (fSlow183 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow184 * fSlow185)) >> 12 : _icast(329.0 * fSlow184 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow185))), 32))])) >> 15);
        const fSlow187: f32 = Mathf.round(_fcast(dx7_alg5_fEntry8));
        const fSlow188: f32 = Mathf.round(_fcast(dx7_alg5_fHslider76));
        const fSlow189: f32 = fSlow4 + (-16.0 - fSlow182);
        const iSlow190: i32 = (((fSlow187 == 0.0 ? 1 : 0) | (fSlow187 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow188 * fSlow189) >> 12 : _icast(329.0 * fSlow188 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow189)), 32))])) >> 15);
        const fSlow191: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow181 >= 2e+01 ? 1 : 0) ? fSlow181 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow181)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow182)) >= 0.0) ? ((fSlow187 < 2.0 ? 1 : 0) ? -iSlow190 : iSlow190) : ((fSlow183 < 2.0 ? 1 : 0) ? -iSlow186 : iSlow186)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_fHslider77)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow192: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow180 >= 2e+01 ? 1 : 0) ? fSlow180 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow180)), 19))]))) >> 1) << 6) + fSlow191 + -4256.0)) << 16;
        const iSlow193: i32 = fSlow180 == 0.0;
        const fSlow194: f32 = Mathf.round(_fcast(dx7_alg5_fHslider78));
        const fSlow195: f32 = Mathf.round(_fcast(dx7_alg5_fHslider79));
        const iSlow196: i32 = _icast(fSlow195 * fSlow25) >> 3;
        const iSlow197: i32 = (((fSlow195 == 3.0 ? 1 : 0) & iSlow22) ? iSlow196 + -1 : ((((fSlow195 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow196 + 1 : iSlow196));
        const fSlow198: f32 = _fcast(iSlow197);
        const fSlow199: f32 = Mathf.min(fSlow194 + fSlow198, 99.0);
        const iSlow200: i32 = fSlow199 < 77.0;
        const fSlow201: f32 = ((iSlow200) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow199)), 76))]) : 2e+01 * (99.0 - fSlow199));
        const iSlow202: i32 = (((iSlow192 == 0 ? 1 : 0) | iSlow193) ? _icast(this.fConst1 * ((iSlow200 & iSlow193) ? 0.05 * fSlow201 : fSlow201)) : 0);
        const fSlow203: f32 = Mathf.round(_fcast(dx7_alg5_fHslider80));
        const iSlow204: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fSlow203 >= 2e+01 ? 1 : 0) ? fSlow203 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow203)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow205: f32 = Mathf.round(_fcast(dx7_alg5_fHslider81));
        const fSlow206: f32 = Mathf.min(fSlow205 + fSlow198, 99.0);
        const iSlow207: i32 = _icast(this.fConst1 * ((fSlow206 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow206)), 76))]) : 2e+01 * (99.0 - fSlow206)));
        const fSlow208: f32 = Mathf.round(_fcast(dx7_alg5_fHslider82));
        const fSlow209: f32 = Mathf.round(_fcast(dx7_alg5_fHslider83));
        const fSlow210: f32 = Mathf.round(_fcast(dx7_alg5_fHslider84));
        const fSlow211: f32 = Mathf.round(_fcast(dx7_alg5_fHslider85));
        const iSlow212: i32 = iSlow192 > 0;
        const iSlow213: i32 = min<i32>(63, ((41 * _icast(fSlow194)) >> 6) + iSlow197);
        const iSlow214: i32 = _icast(this.fConst1 * _fcast(((iSlow213 & 3) + 4) << ((iSlow213 >> 2) + 2)));
        const iSlow215: i32 = min<i32>(63, ((41 * _icast(fSlow205)) >> 6) + iSlow197);
        const iSlow216: i32 = _icast(this.fConst1 * _fcast(((iSlow215 & 3) + 4) << ((iSlow215 >> 2) + 2)));
        const iSlow217: i32 = Dx7_alg5_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_fHslider86))))];
        const iSlow218: i32 = iSlow217 != 0;
        const fSlow219: f32 = _fcast(iSlow217);
        const iSlow220: i32 = _icast(Mathf.round(_fcast(this.fCheckbox3)));
        const fSlow221: f32 = Mathf.round(_fcast(dx7_alg5_fHslider87));
        const iSlow222: i32 = _icast(Mathf.round(_fcast(dx7_alg5_fHslider88)));
        const fSlow223: f32 = Mathf.round(_fcast(dx7_alg5_fHslider89));
        const fSlow224: f32 = ((iSlow220) ? _fcast(_icast(4458616.0 * (fSlow223 + _fcast(100 * (iSlow222 & 3)))) >> 3) + ((fSlow221 > 0.0 ? 1 : 0) ? 13457.0 * fSlow221 : 0.0) : fSlow68 * (72267.445 * fSlow221 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow222 & 31)))]) + _fcast(((_icast(fSlow223)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow223 + 1.0) + 0.5)) : 0)));
        const fSlow225: f32 = Mathf.round(_fcast(dx7_alg5_fHslider90));
        const fSlow226: f32 = Mathf.round(_fcast(dx7_alg5_fHslider91));
        const fSlow227: f32 = Mathf.round(_fcast(dx7_alg5_fHslider92));
        const fSlow228: f32 = Mathf.round(_fcast(dx7_alg5_fEntry9));
        const fSlow229: f32 = Mathf.round(_fcast(dx7_alg5_fHslider93));
        const fSlow230: f32 = fSlow4 + (-18.0 - fSlow227);
        const iSlow231: i32 = (((fSlow228 == 0.0 ? 1 : 0) | (fSlow228 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow229 * fSlow230)) >> 12 : _icast(329.0 * fSlow229 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow230))), 32))])) >> 15);
        const fSlow232: f32 = Mathf.round(_fcast(dx7_alg5_fEntry10));
        const fSlow233: f32 = Mathf.round(_fcast(dx7_alg5_fHslider94));
        const fSlow234: f32 = fSlow4 + (-16.0 - fSlow227);
        const iSlow235: i32 = (((fSlow232 == 0.0 ? 1 : 0) | (fSlow232 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow233 * fSlow234) >> 12 : _icast(329.0 * fSlow233 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow234)), 32))])) >> 15);
        const fSlow236: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow226 >= 2e+01 ? 1 : 0) ? fSlow226 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow226)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow227)) >= 0.0) ? ((fSlow232 < 2.0 ? 1 : 0) ? -iSlow235 : iSlow235) : ((fSlow228 < 2.0 ? 1 : 0) ? -iSlow231 : iSlow231)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_fHslider95)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow237: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow225 >= 2e+01 ? 1 : 0) ? fSlow225 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow225)), 19))]))) >> 1) << 6) + fSlow236 + -4256.0)) << 16;
        const iSlow238: i32 = fSlow225 == 0.0;
        const fSlow239: f32 = Mathf.round(_fcast(dx7_alg5_fHslider96));
        const fSlow240: f32 = Mathf.round(_fcast(dx7_alg5_fHslider97));
        const iSlow241: i32 = _icast(fSlow240 * fSlow25) >> 3;
        const iSlow242: i32 = (((fSlow240 == 3.0 ? 1 : 0) & iSlow22) ? iSlow241 + -1 : ((((fSlow240 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow241 + 1 : iSlow241));
        const fSlow243: f32 = _fcast(iSlow242);
        const fSlow244: f32 = Mathf.min(fSlow239 + fSlow243, 99.0);
        const iSlow245: i32 = fSlow244 < 77.0;
        const fSlow246: f32 = ((iSlow245) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow244)), 76))]) : 2e+01 * (99.0 - fSlow244));
        const iSlow247: i32 = (((iSlow237 == 0 ? 1 : 0) | iSlow238) ? _icast(this.fConst1 * ((iSlow245 & iSlow238) ? 0.05 * fSlow246 : fSlow246)) : 0);
        const fSlow248: f32 = Mathf.round(_fcast(dx7_alg5_fHslider98));
        const iSlow249: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fSlow248 >= 2e+01 ? 1 : 0) ? fSlow248 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow248)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow250: f32 = Mathf.round(_fcast(dx7_alg5_fHslider99));
        const fSlow251: f32 = Mathf.min(fSlow250 + fSlow243, 99.0);
        const iSlow252: i32 = _icast(this.fConst1 * ((fSlow251 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow251)), 76))]) : 2e+01 * (99.0 - fSlow251)));
        const fSlow253: f32 = Mathf.round(_fcast(dx7_alg5_fHslider100));
        const fSlow254: f32 = Mathf.round(_fcast(dx7_alg5_fHslider101));
        const fSlow255: f32 = Mathf.round(_fcast(dx7_alg5_fHslider102));
        const fSlow256: f32 = Mathf.round(_fcast(dx7_alg5_fHslider103));
        const iSlow257: i32 = iSlow237 > 0;
        const iSlow258: i32 = min<i32>(63, ((41 * _icast(fSlow239)) >> 6) + iSlow242);
        const iSlow259: i32 = _icast(this.fConst1 * _fcast(((iSlow258 & 3) + 4) << ((iSlow258 >> 2) + 2)));
        const iSlow260: i32 = min<i32>(63, ((41 * _icast(fSlow250)) >> 6) + iSlow242);
        const iSlow261: i32 = _icast(this.fConst1 * _fcast(((iSlow260 & 3) + 4) << ((iSlow260 >> 2) + 2)));
        const iSlow262: i32 = Dx7_alg5_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_fHslider104))))];
        const iSlow263: i32 = iSlow262 != 0;
        const fSlow264: f32 = _fcast(iSlow262);
        const iSlow265: i32 = _icast(Mathf.round(_fcast(this.fCheckbox4)));
        const fSlow266: f32 = Mathf.round(_fcast(dx7_alg5_fHslider105));
        const iSlow267: i32 = _icast(Mathf.round(_fcast(dx7_alg5_fHslider106)));
        const fSlow268: f32 = Mathf.round(_fcast(dx7_alg5_fHslider107));
        const fSlow269: f32 = ((iSlow265) ? _fcast(_icast(4458616.0 * (fSlow268 + _fcast(100 * (iSlow267 & 3)))) >> 3) + ((fSlow266 > 0.0 ? 1 : 0) ? 13457.0 * fSlow266 : 0.0) : fSlow68 * (72267.445 * fSlow266 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow267 & 31)))]) + _fcast(((_icast(fSlow268)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow268 + 1.0) + 0.5)) : 0)));
        const fSlow270: f32 = Mathf.round(_fcast(dx7_alg5_fHslider108));
        const fSlow271: f32 = Mathf.round(_fcast(dx7_alg5_fHslider109));
        const fSlow272: f32 = Mathf.round(_fcast(dx7_alg5_fHslider110));
        const fSlow273: f32 = Mathf.round(_fcast(dx7_alg5_fEntry11));
        const fSlow274: f32 = Mathf.round(_fcast(dx7_alg5_fHslider111));
        const fSlow275: f32 = fSlow4 + (-18.0 - fSlow272);
        const iSlow276: i32 = (((fSlow273 == 0.0 ? 1 : 0) | (fSlow273 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow274 * fSlow275)) >> 12 : _icast(329.0 * fSlow274 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow275))), 32))])) >> 15);
        const fSlow277: f32 = Mathf.round(_fcast(dx7_alg5_fEntry12));
        const fSlow278: f32 = Mathf.round(_fcast(dx7_alg5_fHslider112));
        const fSlow279: f32 = fSlow4 + (-16.0 - fSlow272);
        const iSlow280: i32 = (((fSlow277 == 0.0 ? 1 : 0) | (fSlow277 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow278 * fSlow279) >> 12 : _icast(329.0 * fSlow278 * _fcast(Dx7_alg5_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow279)), 32))])) >> 15);
        const fSlow281: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow271 >= 2e+01 ? 1 : 0) ? fSlow271 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow271)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow272)) >= 0.0) ? ((fSlow277 < 2.0 ? 1 : 0) ? -iSlow280 : iSlow280) : ((fSlow273 < 2.0 ? 1 : 0) ? -iSlow276 : iSlow276)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_fHslider113)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow282: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow270 >= 2e+01 ? 1 : 0) ? fSlow270 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow270)), 19))]))) >> 1) << 6) + fSlow281 + -4256.0)) << 16;
        const iSlow283: i32 = fSlow270 == 0.0;
        const fSlow284: f32 = Mathf.round(_fcast(dx7_alg5_fHslider114));
        const fSlow285: f32 = Mathf.round(_fcast(dx7_alg5_fHslider115));
        const iSlow286: i32 = _icast(fSlow285 * fSlow25) >> 3;
        const iSlow287: i32 = (((fSlow285 == 3.0 ? 1 : 0) & iSlow22) ? iSlow286 + -1 : ((((fSlow285 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow286 + 1 : iSlow286));
        const fSlow288: f32 = _fcast(iSlow287);
        const fSlow289: f32 = Mathf.min(fSlow284 + fSlow288, 99.0);
        const iSlow290: i32 = fSlow289 < 77.0;
        const fSlow291: f32 = ((iSlow290) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow289)), 76))]) : 2e+01 * (99.0 - fSlow289));
        const iSlow292: i32 = (((iSlow282 == 0 ? 1 : 0) | iSlow283) ? _icast(this.fConst1 * ((iSlow290 & iSlow283) ? 0.05 * fSlow291 : fSlow291)) : 0);
        const fSlow293: f32 = Mathf.round(_fcast(dx7_alg5_fHslider116));
        const iSlow294: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fSlow293 >= 2e+01 ? 1 : 0) ? fSlow293 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow293)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow295: f32 = Mathf.round(_fcast(dx7_alg5_fHslider117));
        const fSlow296: f32 = Mathf.min(fSlow295 + fSlow288, 99.0);
        const iSlow297: i32 = _icast(this.fConst1 * ((fSlow296 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow296)), 76))]) : 2e+01 * (99.0 - fSlow296)));
        const fSlow298: f32 = Mathf.round(_fcast(dx7_alg5_fHslider118));
        const fSlow299: f32 = Mathf.round(_fcast(dx7_alg5_fHslider119));
        const fSlow300: f32 = Mathf.round(_fcast(dx7_alg5_fHslider120));
        const fSlow301: f32 = Mathf.round(_fcast(dx7_alg5_fHslider121));
        const iSlow302: i32 = iSlow282 > 0;
        const iSlow303: i32 = min<i32>(63, ((41 * _icast(fSlow284)) >> 6) + iSlow287);
        const iSlow304: i32 = _icast(this.fConst1 * _fcast(((iSlow303 & 3) + 4) << ((iSlow303 >> 2) + 2)));
        const iSlow305: i32 = min<i32>(63, ((41 * _icast(fSlow295)) >> 6) + iSlow287);
        const iSlow306: i32 = _icast(this.fConst1 * _fcast(((iSlow305 & 3) + 4) << ((iSlow305 >> 2) + 2)));
        const iSlow307: i32 = Dx7_alg5_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_fHslider122))))];
        const iSlow308: i32 = iSlow307 != 0;
        const fSlow309: f32 = _fcast(iSlow307);
        const iSlow310: i32 = _icast(Mathf.round(_fcast(this.fCheckbox5)));
        const fSlow311: f32 = Mathf.round(_fcast(dx7_alg5_fHslider123));
        const iSlow312: i32 = _icast(Mathf.round(_fcast(dx7_alg5_fHslider124)));
        const fSlow313: f32 = Mathf.round(_fcast(dx7_alg5_fHslider125));
        const fSlow314: f32 = ((iSlow310) ? _fcast(_icast(4458616.0 * (fSlow313 + _fcast(100 * (iSlow312 & 3)))) >> 3) + ((fSlow311 > 0.0 ? 1 : 0) ? 13457.0 * fSlow311 : 0.0) : fSlow68 * (72267.445 * fSlow311 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow312 & 31)))]) + _fcast(((_icast(fSlow313)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow313 + 1.0) + 0.5)) : 0)));
        const fSlow315: f32 = Mathf.round(_fcast(dx7_alg5_fHslider126));
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
        const iTemp17: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp16 >= 2e+01 ? 1 : 0) ? fTemp16 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp16)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp18: i32 = iTemp8 == 0;
        const iTemp19: i32 = fTemp16 == 0.0;
        const fTemp20: f32 = ((iTemp13) ? ((iTemp15) ? fSlow35 : fSlow41) : ((iTemp14) ? fSlow40 : fSlow18));
        const fTemp21: f32 = Mathf.min(fSlow28 + fTemp20, 99.0);
        const iTemp22: i32 = fTemp21 < 77.0;
        const fTemp23: f32 = ((iTemp22) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp21)), 76))]) : 2e+01 * (99.0 - fTemp21));
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
        const iTemp46: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp45 >= 2e+01 ? 1 : 0) ? fTemp45 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp45)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp56: f32 = ((iTemp55) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp54)), 76))]) : 2e+01 * (99.0 - fTemp54));
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
        const iTemp89: i32 = Dx7_alg5_itbl6SIG6[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow74 : fSlow85) : ((iTemp87) ? fSlow84 : fSlow77))))];
        const iTemp90: i32 = ((iTemp85) ? iTemp89 : iTemp79);
        this.iRec15[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp90 : iTemp79) : ((iTemp81) ? iTemp90 : iTemp79)) : iTemp79);
        const iTemp91: i32 = ((iTemp85) ? iTemp89 > iTemp79 : iTemp75);
        this.iRec16[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp91 : iTemp75) : ((iTemp81) ? iTemp91 : iTemp75)) : iTemp75);
        const fTemp92: f32 = ((iTemp85) ? this.fConst4 * _fcast(Dx7_alg5_itbl7SIG7[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow80 : fSlow87) : ((iTemp87) ? fSlow86 : fSlow82))))]) : fTemp77);
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
        const iTemp110: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp109 >= 2e+01 ? 1 : 0) ? fTemp109 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp109)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp111: i32 = iTemp101 == 0;
        const iTemp112: i32 = fTemp109 == 0.0;
        const fTemp113: f32 = ((iTemp106) ? ((iTemp108) ? fSlow115 : fSlow121) : ((iTemp107) ? fSlow120 : fSlow104));
        const fTemp114: f32 = Mathf.min(fSlow108 + fTemp113, 99.0);
        const iTemp115: i32 = fTemp114 < 77.0;
        const fTemp116: f32 = ((iTemp115) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp114)), 76))]) : 2e+01 * (99.0 - fTemp114));
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
        const iTemp139: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp138 >= 2e+01 ? 1 : 0) ? fTemp138 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp138)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp149: f32 = ((iTemp148) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp147)), 76))]) : 2e+01 * (99.0 - fTemp147));
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
        const iTemp166: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fTemp165 >= 2e+01 ? 1 : 0) ? fTemp165 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp165)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp167: i32 = iTemp157 == 0;
        const iTemp168: i32 = fTemp165 == 0.0;
        const fTemp169: f32 = ((iTemp162) ? ((iTemp164) ? fSlow160 : fSlow166) : ((iTemp163) ? fSlow165 : fSlow149));
        const fTemp170: f32 = Mathf.min(fSlow153 + fTemp169, 99.0);
        const iTemp171: i32 = fTemp170 < 77.0;
        const fTemp172: f32 = ((iTemp171) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp170)), 76))]) : 2e+01 * (99.0 - fTemp170));
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
        const iTemp195: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fTemp194 >= 2e+01 ? 1 : 0) ? fTemp194 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp194)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp205: f32 = ((iTemp204) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp203)), 76))]) : 2e+01 * (99.0 - fTemp203));
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
        const iTemp222: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fTemp221 >= 2e+01 ? 1 : 0) ? fTemp221 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp221)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp223: i32 = iTemp213 == 0;
        const iTemp224: i32 = fTemp221 == 0.0;
        const fTemp225: f32 = ((iTemp218) ? ((iTemp220) ? fSlow205 : fSlow211) : ((iTemp219) ? fSlow210 : fSlow194));
        const fTemp226: f32 = Mathf.min(fSlow198 + fTemp225, 99.0);
        const iTemp227: i32 = fTemp226 < 77.0;
        const fTemp228: f32 = ((iTemp227) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp226)), 76))]) : 2e+01 * (99.0 - fTemp226));
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
        const iTemp251: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fTemp250 >= 2e+01 ? 1 : 0) ? fTemp250 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp250)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp261: f32 = ((iTemp260) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp259)), 76))]) : 2e+01 * (99.0 - fTemp259));
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
        const iTemp278: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fTemp277 >= 2e+01 ? 1 : 0) ? fTemp277 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp277)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp279: i32 = iTemp269 == 0;
        const iTemp280: i32 = fTemp277 == 0.0;
        const fTemp281: f32 = ((iTemp274) ? ((iTemp276) ? fSlow250 : fSlow256) : ((iTemp275) ? fSlow255 : fSlow239));
        const fTemp282: f32 = Mathf.min(fSlow243 + fTemp281, 99.0);
        const iTemp283: i32 = fTemp282 < 77.0;
        const fTemp284: f32 = ((iTemp283) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp282)), 76))]) : 2e+01 * (99.0 - fTemp282));
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
        const iTemp307: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fTemp306 >= 2e+01 ? 1 : 0) ? fTemp306 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp306)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp317: f32 = ((iTemp316) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp315)), 76))]) : 2e+01 * (99.0 - fTemp315));
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
        const iTemp334: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp333 >= 2e+01 ? 1 : 0) ? fTemp333 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp333)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp335: i32 = iTemp325 == 0;
        const iTemp336: i32 = fTemp333 == 0.0;
        const fTemp337: f32 = ((iTemp330) ? ((iTemp332) ? fSlow295 : fSlow301) : ((iTemp331) ? fSlow300 : fSlow284));
        const fTemp338: f32 = Mathf.min(fSlow288 + fTemp337, 99.0);
        const iTemp339: i32 = fTemp338 < 77.0;
        const fTemp340: f32 = ((iTemp339) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp338)), 76))]) : 2e+01 * (99.0 - fTemp338));
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
        const iTemp363: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp362 >= 2e+01 ? 1 : 0) ? fTemp362 + 28.0 : _fcast(Dx7_alg5_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp362)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp373: f32 = ((iTemp372) ? _fcast(Dx7_alg5_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp371)), 76))]) : 2e+01 * (99.0 - fTemp371));
        const iTemp374: i32 = ((iTemp358) ? (((iTemp363 == iTemp353 ? 1 : 0) | (iTemp369 & iTemp370)) ? _icast(this.fConst1 * (((iTemp372 & iTemp369) & iTemp370) ? 0.05 * fTemp373 : fTemp373)) : 0) : iTemp341);
        this.iRec58[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp374 : iTemp341) : ((iTemp346) ? ((iTemp354) ? iTemp374 : iTemp341) : iTemp341)) : iTemp341);
        const fTemp375: f32 = ((iTemp70) ? 0.0 : this.fRec59[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow314 + ((iSlow310) ? 0.0 : fTemp94))));
        this.fRec59[0] = fTemp375 - Mathf.floor(fTemp375);
        this.fRec51[0] = 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec52[0] + (-234881024 - ((iSlow308) ? _icast(5.9604645e-08 * _fcast(this.iRec52[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow309 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec59[0] + this.fRec51[1] * fSlow316));
        const fTemp376: f32 = 0.5 * (Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec0[0] + (-234881024 - ((iSlow48) ? _icast(5.9604645e-08 * _fcast(this.iRec0[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow65 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec12[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec19[0] + (-234881024 - ((iSlow128) ? _icast(5.9604645e-08 * _fcast(this.iRec19[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow129 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec26[0]))) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec27[0] + (-234881024 - ((iSlow173) ? _icast(5.9604645e-08 * _fcast(this.iRec27[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow174 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec34[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec35[0] + (-234881024 - ((iSlow218) ? _icast(5.9604645e-08 * _fcast(this.iRec35[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow219 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec42[0]))) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec43[0] + (-234881024 - ((iSlow263) ? _icast(5.9604645e-08 * _fcast(this.iRec43[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow264 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec50[0] + this.fRec51[0])));
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

export class Dx7_alg5Channel extends MidiChannel {
    private _nrpnMsb: u8 = 127;
    private _nrpnLsb: u8 = 127;

    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case 99: this._nrpnMsb = value; break;
            case 98: this._nrpnLsb = value; break;
            case 6:
                this._setParam(<u16>this._nrpnMsb * 128 + <u16>this._nrpnLsb, value);
                break;
        }
    }

    private _setParam(param: u16, value: u8): void {
        switch (param) {
            case 0: dx7_alg5_fHslider126 = <f32>value / 127.0 * 7; break;
            case 1: dx7_alg5_fHslider2 = -24 + <f32>value / 127.0 * 48; break;
            case 2: dx7_alg5_fHslider22 = <f32>value / 127.0; break;
            case 3: dx7_alg5_fHslider27 = <f32>value / 127.0 * 99; break;
            case 4: dx7_alg5_fHslider30 = <f32>value / 127.0 * 99; break;
            case 5: dx7_alg5_fHslider31 = <f32>value / 127.0 * 99; break;
            case 6: dx7_alg5_fHslider26 = <f32>value / 127.0 * 99; break;
            case 7: dx7_alg5_fHslider29 = <f32>value / 127.0 * 99; break;
            case 8: dx7_alg5_fHslider32 = <f32>value / 127.0 * 99; break;
            case 9: dx7_alg5_fHslider33 = <f32>value / 127.0 * 99; break;
            case 10: dx7_alg5_fHslider28 = <f32>value / 127.0 * 99; break;
            case 11: dx7_alg5_fEntry2 = <f32>value / 127.0 * 5; break;
            case 12: dx7_alg5_fHslider20 = <f32>value / 127.0 * 99; break;
            case 13: dx7_alg5_fHslider21 = <f32>value / 127.0 * 99; break;
            case 14: dx7_alg5_fHslider34 = <f32>value / 127.0 * 99; break;
            case 15: dx7_alg5_fHslider18 = <f32>value / 127.0 * 99; break;
            case 16: dx7_alg5_fHslider19 = <f32>value / 127.0; break;
            case 17: dx7_alg5_fHslider35 = <f32>value / 127.0 * 7; break;
            case 18: dx7_alg5_fHslider23 = -7 + <f32>value / 127.0 * 14; break;
            case 19: dx7_alg5_fHslider24 = <f32>value / 127.0 * 31; break;
            case 20: dx7_alg5_fHslider25 = <f32>value / 127.0 * 99; break;
            case 21: dx7_alg5_fHslider0 = <f32>value / 127.0 * 99; break;
            case 22: dx7_alg5_fHslider13 = <f32>value / 127.0 * 99; break;
            case 23: dx7_alg5_fHslider14 = <f32>value / 127.0 * 99; break;
            case 24: dx7_alg5_fHslider11 = <f32>value / 127.0 * 99; break;
            case 25: dx7_alg5_fHslider9 = <f32>value / 127.0 * 99; break;
            case 26: dx7_alg5_fHslider15 = <f32>value / 127.0 * 99; break;
            case 27: dx7_alg5_fHslider16 = <f32>value / 127.0 * 99; break;
            case 28: dx7_alg5_fHslider12 = <f32>value / 127.0 * 99; break;
            case 29: dx7_alg5_fHslider1 = <f32>value / 127.0 * 99; break;
            case 30: dx7_alg5_fHslider7 = <f32>value / 127.0 * 7; break;
            case 31: dx7_alg5_fHslider17 = <f32>value / 127.0 * 3; break;
            case 32: dx7_alg5_fHslider10 = <f32>value / 127.0 * 7; break;
            case 33: dx7_alg5_fHslider4 = <f32>value / 127.0 * 99; break;
            case 34: dx7_alg5_fHslider5 = <f32>value / 127.0 * 99; break;
            case 35: dx7_alg5_fHslider6 = <f32>value / 127.0 * 99; break;
            case 36: dx7_alg5_fEntry0 = <f32>value / 127.0 * 3; break;
            case 37: dx7_alg5_fEntry1 = <f32>value / 127.0 * 3; break;
            case 38: dx7_alg5_fHslider51 = -7 + <f32>value / 127.0 * 14; break;
            case 39: dx7_alg5_fHslider52 = <f32>value / 127.0 * 31; break;
            case 40: dx7_alg5_fHslider53 = <f32>value / 127.0 * 99; break;
            case 41: dx7_alg5_fHslider36 = <f32>value / 127.0 * 99; break;
            case 42: dx7_alg5_fHslider46 = <f32>value / 127.0 * 99; break;
            case 43: dx7_alg5_fHslider47 = <f32>value / 127.0 * 99; break;
            case 44: dx7_alg5_fHslider44 = <f32>value / 127.0 * 99; break;
            case 45: dx7_alg5_fHslider42 = <f32>value / 127.0 * 99; break;
            case 46: dx7_alg5_fHslider48 = <f32>value / 127.0 * 99; break;
            case 47: dx7_alg5_fHslider49 = <f32>value / 127.0 * 99; break;
            case 48: dx7_alg5_fHslider45 = <f32>value / 127.0 * 99; break;
            case 49: dx7_alg5_fHslider37 = <f32>value / 127.0 * 99; break;
            case 50: dx7_alg5_fHslider41 = <f32>value / 127.0 * 7; break;
            case 51: dx7_alg5_fHslider50 = <f32>value / 127.0 * 3; break;
            case 52: dx7_alg5_fHslider43 = <f32>value / 127.0 * 7; break;
            case 53: dx7_alg5_fHslider38 = <f32>value / 127.0 * 99; break;
            case 54: dx7_alg5_fHslider39 = <f32>value / 127.0 * 99; break;
            case 55: dx7_alg5_fHslider40 = <f32>value / 127.0 * 99; break;
            case 56: dx7_alg5_fEntry3 = <f32>value / 127.0 * 3; break;
            case 57: dx7_alg5_fEntry4 = <f32>value / 127.0 * 3; break;
            case 58: dx7_alg5_fHslider69 = -7 + <f32>value / 127.0 * 14; break;
            case 59: dx7_alg5_fHslider70 = <f32>value / 127.0 * 31; break;
            case 60: dx7_alg5_fHslider71 = <f32>value / 127.0 * 99; break;
            case 61: dx7_alg5_fHslider54 = <f32>value / 127.0 * 99; break;
            case 62: dx7_alg5_fHslider64 = <f32>value / 127.0 * 99; break;
            case 63: dx7_alg5_fHslider65 = <f32>value / 127.0 * 99; break;
            case 64: dx7_alg5_fHslider62 = <f32>value / 127.0 * 99; break;
            case 65: dx7_alg5_fHslider60 = <f32>value / 127.0 * 99; break;
            case 66: dx7_alg5_fHslider66 = <f32>value / 127.0 * 99; break;
            case 67: dx7_alg5_fHslider67 = <f32>value / 127.0 * 99; break;
            case 68: dx7_alg5_fHslider63 = <f32>value / 127.0 * 99; break;
            case 69: dx7_alg5_fHslider55 = <f32>value / 127.0 * 99; break;
            case 70: dx7_alg5_fHslider59 = <f32>value / 127.0 * 7; break;
            case 71: dx7_alg5_fHslider68 = <f32>value / 127.0 * 3; break;
            case 72: dx7_alg5_fHslider61 = <f32>value / 127.0 * 7; break;
            case 73: dx7_alg5_fHslider56 = <f32>value / 127.0 * 99; break;
            case 74: dx7_alg5_fHslider57 = <f32>value / 127.0 * 99; break;
            case 75: dx7_alg5_fHslider58 = <f32>value / 127.0 * 99; break;
            case 76: dx7_alg5_fEntry5 = <f32>value / 127.0 * 3; break;
            case 77: dx7_alg5_fEntry6 = <f32>value / 127.0 * 3; break;
            case 78: dx7_alg5_fHslider87 = -7 + <f32>value / 127.0 * 14; break;
            case 79: dx7_alg5_fHslider88 = <f32>value / 127.0 * 31; break;
            case 80: dx7_alg5_fHslider89 = <f32>value / 127.0 * 99; break;
            case 81: dx7_alg5_fHslider72 = <f32>value / 127.0 * 99; break;
            case 82: dx7_alg5_fHslider82 = <f32>value / 127.0 * 99; break;
            case 83: dx7_alg5_fHslider83 = <f32>value / 127.0 * 99; break;
            case 84: dx7_alg5_fHslider80 = <f32>value / 127.0 * 99; break;
            case 85: dx7_alg5_fHslider78 = <f32>value / 127.0 * 99; break;
            case 86: dx7_alg5_fHslider84 = <f32>value / 127.0 * 99; break;
            case 87: dx7_alg5_fHslider85 = <f32>value / 127.0 * 99; break;
            case 88: dx7_alg5_fHslider81 = <f32>value / 127.0 * 99; break;
            case 89: dx7_alg5_fHslider73 = <f32>value / 127.0 * 99; break;
            case 90: dx7_alg5_fHslider77 = <f32>value / 127.0 * 7; break;
            case 91: dx7_alg5_fHslider86 = <f32>value / 127.0 * 3; break;
            case 92: dx7_alg5_fHslider79 = <f32>value / 127.0 * 7; break;
            case 93: dx7_alg5_fHslider74 = <f32>value / 127.0 * 99; break;
            case 94: dx7_alg5_fHslider75 = <f32>value / 127.0 * 99; break;
            case 95: dx7_alg5_fHslider76 = <f32>value / 127.0 * 99; break;
            case 96: dx7_alg5_fEntry7 = <f32>value / 127.0 * 3; break;
            case 97: dx7_alg5_fEntry8 = <f32>value / 127.0 * 3; break;
            case 98: dx7_alg5_fHslider105 = -7 + <f32>value / 127.0 * 14; break;
            case 99: dx7_alg5_fHslider106 = <f32>value / 127.0 * 31; break;
            case 100: dx7_alg5_fHslider107 = <f32>value / 127.0 * 99; break;
            case 101: dx7_alg5_fHslider90 = <f32>value / 127.0 * 99; break;
            case 102: dx7_alg5_fHslider100 = <f32>value / 127.0 * 99; break;
            case 103: dx7_alg5_fHslider101 = <f32>value / 127.0 * 99; break;
            case 104: dx7_alg5_fHslider98 = <f32>value / 127.0 * 99; break;
            case 105: dx7_alg5_fHslider96 = <f32>value / 127.0 * 99; break;
            case 106: dx7_alg5_fHslider102 = <f32>value / 127.0 * 99; break;
            case 107: dx7_alg5_fHslider103 = <f32>value / 127.0 * 99; break;
            case 108: dx7_alg5_fHslider99 = <f32>value / 127.0 * 99; break;
            case 109: dx7_alg5_fHslider91 = <f32>value / 127.0 * 99; break;
            case 110: dx7_alg5_fHslider95 = <f32>value / 127.0 * 7; break;
            case 111: dx7_alg5_fHslider104 = <f32>value / 127.0 * 3; break;
            case 112: dx7_alg5_fHslider97 = <f32>value / 127.0 * 7; break;
            case 113: dx7_alg5_fHslider92 = <f32>value / 127.0 * 99; break;
            case 114: dx7_alg5_fHslider93 = <f32>value / 127.0 * 99; break;
            case 115: dx7_alg5_fHslider94 = <f32>value / 127.0 * 99; break;
            case 116: dx7_alg5_fEntry9 = <f32>value / 127.0 * 3; break;
            case 117: dx7_alg5_fEntry10 = <f32>value / 127.0 * 3; break;
            case 118: dx7_alg5_fHslider123 = -7 + <f32>value / 127.0 * 14; break;
            case 119: dx7_alg5_fHslider124 = <f32>value / 127.0 * 31; break;
            case 120: dx7_alg5_fHslider125 = <f32>value / 127.0 * 99; break;
            case 121: dx7_alg5_fHslider108 = <f32>value / 127.0 * 99; break;
            case 122: dx7_alg5_fHslider118 = <f32>value / 127.0 * 99; break;
            case 123: dx7_alg5_fHslider119 = <f32>value / 127.0 * 99; break;
            case 124: dx7_alg5_fHslider116 = <f32>value / 127.0 * 99; break;
            case 125: dx7_alg5_fHslider114 = <f32>value / 127.0 * 99; break;
            case 126: dx7_alg5_fHslider120 = <f32>value / 127.0 * 99; break;
            case 127: dx7_alg5_fHslider121 = <f32>value / 127.0 * 99; break;
            case 128: dx7_alg5_fHslider117 = <f32>value / 127.0 * 99; break;
            case 129: dx7_alg5_fHslider109 = <f32>value / 127.0 * 99; break;
            case 130: dx7_alg5_fHslider113 = <f32>value / 127.0 * 7; break;
            case 131: dx7_alg5_fHslider122 = <f32>value / 127.0 * 3; break;
            case 132: dx7_alg5_fHslider115 = <f32>value / 127.0 * 7; break;
            case 133: dx7_alg5_fHslider110 = <f32>value / 127.0 * 99; break;
            case 134: dx7_alg5_fHslider111 = <f32>value / 127.0 * 99; break;
            case 135: dx7_alg5_fHslider112 = <f32>value / 127.0 * 99; break;
            case 136: dx7_alg5_fEntry11 = <f32>value / 127.0 * 3; break;
            case 137: dx7_alg5_fEntry12 = <f32>value / 127.0 * 3; break;
        }
    }
}

// Feedback (NRPN 0)
let dx7_alg16_fHslider126: f32 = 0;
// Transpose (NRPN 1)
let dx7_alg16_fHslider2: f32 = 0;
// Osc Key Sync (NRPN 2)
let dx7_alg16_fHslider22: f32 = 1;
// L1 (NRPN 3)
let dx7_alg16_fHslider27: f32 = 50;
// L2 (NRPN 4)
let dx7_alg16_fHslider30: f32 = 50;
// L3 (NRPN 5)
let dx7_alg16_fHslider31: f32 = 50;
// L4 (NRPN 6)
let dx7_alg16_fHslider26: f32 = 50;
// R1 (NRPN 7)
let dx7_alg16_fHslider29: f32 = 99;
// R2 (NRPN 8)
let dx7_alg16_fHslider32: f32 = 99;
// R3 (NRPN 9)
let dx7_alg16_fHslider33: f32 = 99;
// R4 (NRPN 10)
let dx7_alg16_fHslider28: f32 = 99;
// Wave (NRPN 11)
let dx7_alg16_fEntry2: f32 = 0;
// Speed (NRPN 12)
let dx7_alg16_fHslider20: f32 = 35;
// Delay (NRPN 13)
let dx7_alg16_fHslider21: f32 = 0;
// PMD (NRPN 14)
let dx7_alg16_fHslider34: f32 = 0;
// AMD (NRPN 15)
let dx7_alg16_fHslider18: f32 = 0;
// Sync (NRPN 16)
let dx7_alg16_fHslider19: f32 = 1;
// P Mod Sens (NRPN 17)
let dx7_alg16_fHslider35: f32 = 3;
// Tune (NRPN 18)
let dx7_alg16_fHslider23: f32 = 0;
// Coarse (NRPN 19)
let dx7_alg16_fHslider24: f32 = 1;
// Fine (NRPN 20)
let dx7_alg16_fHslider25: f32 = 0;
// L1 (NRPN 21)
let dx7_alg16_fHslider0: f32 = 99;
// L2 (NRPN 22)
let dx7_alg16_fHslider13: f32 = 99;
// L3 (NRPN 23)
let dx7_alg16_fHslider14: f32 = 99;
// L4 (NRPN 24)
let dx7_alg16_fHslider11: f32 = 0;
// R1 (NRPN 25)
let dx7_alg16_fHslider9: f32 = 99;
// R2 (NRPN 26)
let dx7_alg16_fHslider15: f32 = 99;
// R3 (NRPN 27)
let dx7_alg16_fHslider16: f32 = 99;
// R4 (NRPN 28)
let dx7_alg16_fHslider12: f32 = 99;
// Level (NRPN 29)
let dx7_alg16_fHslider1: f32 = 99;
// Key Vel (NRPN 30)
let dx7_alg16_fHslider7: f32 = 0;
// A Mod Sens (NRPN 31)
let dx7_alg16_fHslider17: f32 = 0;
// Rate Scaling (NRPN 32)
let dx7_alg16_fHslider10: f32 = 0;
// Breakpoint (NRPN 33)
let dx7_alg16_fHslider4: f32 = 0;
// L Depth (NRPN 34)
let dx7_alg16_fHslider5: f32 = 0;
// R Depth (NRPN 35)
let dx7_alg16_fHslider6: f32 = 0;
// L Curve (NRPN 36)
let dx7_alg16_fEntry0: f32 = 0;
// R Curve (NRPN 37)
let dx7_alg16_fEntry1: f32 = 0;
// Tune (NRPN 38)
let dx7_alg16_fHslider51: f32 = 0;
// Coarse (NRPN 39)
let dx7_alg16_fHslider52: f32 = 1;
// Fine (NRPN 40)
let dx7_alg16_fHslider53: f32 = 0;
// L1 (NRPN 41)
let dx7_alg16_fHslider36: f32 = 99;
// L2 (NRPN 42)
let dx7_alg16_fHslider46: f32 = 99;
// L3 (NRPN 43)
let dx7_alg16_fHslider47: f32 = 99;
// L4 (NRPN 44)
let dx7_alg16_fHslider44: f32 = 0;
// R1 (NRPN 45)
let dx7_alg16_fHslider42: f32 = 99;
// R2 (NRPN 46)
let dx7_alg16_fHslider48: f32 = 99;
// R3 (NRPN 47)
let dx7_alg16_fHslider49: f32 = 99;
// R4 (NRPN 48)
let dx7_alg16_fHslider45: f32 = 99;
// Level (NRPN 49)
let dx7_alg16_fHslider37: f32 = 0;
// Key Vel (NRPN 50)
let dx7_alg16_fHslider41: f32 = 0;
// A Mod Sens (NRPN 51)
let dx7_alg16_fHslider50: f32 = 0;
// Rate Scaling (NRPN 52)
let dx7_alg16_fHslider43: f32 = 0;
// Breakpoint (NRPN 53)
let dx7_alg16_fHslider38: f32 = 0;
// L Depth (NRPN 54)
let dx7_alg16_fHslider39: f32 = 0;
// R Depth (NRPN 55)
let dx7_alg16_fHslider40: f32 = 0;
// L Curve (NRPN 56)
let dx7_alg16_fEntry3: f32 = 0;
// R Curve (NRPN 57)
let dx7_alg16_fEntry4: f32 = 0;
// Tune (NRPN 58)
let dx7_alg16_fHslider69: f32 = 0;
// Coarse (NRPN 59)
let dx7_alg16_fHslider70: f32 = 1;
// Fine (NRPN 60)
let dx7_alg16_fHslider71: f32 = 0;
// L1 (NRPN 61)
let dx7_alg16_fHslider54: f32 = 99;
// L2 (NRPN 62)
let dx7_alg16_fHslider64: f32 = 99;
// L3 (NRPN 63)
let dx7_alg16_fHslider65: f32 = 99;
// L4 (NRPN 64)
let dx7_alg16_fHslider62: f32 = 0;
// R1 (NRPN 65)
let dx7_alg16_fHslider60: f32 = 99;
// R2 (NRPN 66)
let dx7_alg16_fHslider66: f32 = 99;
// R3 (NRPN 67)
let dx7_alg16_fHslider67: f32 = 99;
// R4 (NRPN 68)
let dx7_alg16_fHslider63: f32 = 99;
// Level (NRPN 69)
let dx7_alg16_fHslider55: f32 = 0;
// Key Vel (NRPN 70)
let dx7_alg16_fHslider59: f32 = 0;
// A Mod Sens (NRPN 71)
let dx7_alg16_fHslider68: f32 = 0;
// Rate Scaling (NRPN 72)
let dx7_alg16_fHslider61: f32 = 0;
// Breakpoint (NRPN 73)
let dx7_alg16_fHslider56: f32 = 0;
// L Depth (NRPN 74)
let dx7_alg16_fHslider57: f32 = 0;
// R Depth (NRPN 75)
let dx7_alg16_fHslider58: f32 = 0;
// L Curve (NRPN 76)
let dx7_alg16_fEntry5: f32 = 0;
// R Curve (NRPN 77)
let dx7_alg16_fEntry6: f32 = 0;
// Tune (NRPN 78)
let dx7_alg16_fHslider87: f32 = 0;
// Coarse (NRPN 79)
let dx7_alg16_fHslider88: f32 = 1;
// Fine (NRPN 80)
let dx7_alg16_fHslider89: f32 = 0;
// L1 (NRPN 81)
let dx7_alg16_fHslider72: f32 = 99;
// L2 (NRPN 82)
let dx7_alg16_fHslider82: f32 = 99;
// L3 (NRPN 83)
let dx7_alg16_fHslider83: f32 = 99;
// L4 (NRPN 84)
let dx7_alg16_fHslider80: f32 = 0;
// R1 (NRPN 85)
let dx7_alg16_fHslider78: f32 = 99;
// R2 (NRPN 86)
let dx7_alg16_fHslider84: f32 = 99;
// R3 (NRPN 87)
let dx7_alg16_fHslider85: f32 = 99;
// R4 (NRPN 88)
let dx7_alg16_fHslider81: f32 = 99;
// Level (NRPN 89)
let dx7_alg16_fHslider73: f32 = 0;
// Key Vel (NRPN 90)
let dx7_alg16_fHslider77: f32 = 0;
// A Mod Sens (NRPN 91)
let dx7_alg16_fHslider86: f32 = 0;
// Rate Scaling (NRPN 92)
let dx7_alg16_fHslider79: f32 = 0;
// Breakpoint (NRPN 93)
let dx7_alg16_fHslider74: f32 = 0;
// L Depth (NRPN 94)
let dx7_alg16_fHslider75: f32 = 0;
// R Depth (NRPN 95)
let dx7_alg16_fHslider76: f32 = 0;
// L Curve (NRPN 96)
let dx7_alg16_fEntry7: f32 = 0;
// R Curve (NRPN 97)
let dx7_alg16_fEntry8: f32 = 0;
// Tune (NRPN 98)
let dx7_alg16_fHslider105: f32 = 0;
// Coarse (NRPN 99)
let dx7_alg16_fHslider106: f32 = 1;
// Fine (NRPN 100)
let dx7_alg16_fHslider107: f32 = 0;
// L1 (NRPN 101)
let dx7_alg16_fHslider90: f32 = 99;
// L2 (NRPN 102)
let dx7_alg16_fHslider100: f32 = 99;
// L3 (NRPN 103)
let dx7_alg16_fHslider101: f32 = 99;
// L4 (NRPN 104)
let dx7_alg16_fHslider98: f32 = 0;
// R1 (NRPN 105)
let dx7_alg16_fHslider96: f32 = 99;
// R2 (NRPN 106)
let dx7_alg16_fHslider102: f32 = 99;
// R3 (NRPN 107)
let dx7_alg16_fHslider103: f32 = 99;
// R4 (NRPN 108)
let dx7_alg16_fHslider99: f32 = 99;
// Level (NRPN 109)
let dx7_alg16_fHslider91: f32 = 0;
// Key Vel (NRPN 110)
let dx7_alg16_fHslider95: f32 = 0;
// A Mod Sens (NRPN 111)
let dx7_alg16_fHslider104: f32 = 0;
// Rate Scaling (NRPN 112)
let dx7_alg16_fHslider97: f32 = 0;
// Breakpoint (NRPN 113)
let dx7_alg16_fHslider92: f32 = 0;
// L Depth (NRPN 114)
let dx7_alg16_fHslider93: f32 = 0;
// R Depth (NRPN 115)
let dx7_alg16_fHslider94: f32 = 0;
// L Curve (NRPN 116)
let dx7_alg16_fEntry9: f32 = 0;
// R Curve (NRPN 117)
let dx7_alg16_fEntry10: f32 = 0;
// Tune (NRPN 118)
let dx7_alg16_fHslider123: f32 = 0;
// Coarse (NRPN 119)
let dx7_alg16_fHslider124: f32 = 1;
// Fine (NRPN 120)
let dx7_alg16_fHslider125: f32 = 0;
// L1 (NRPN 121)
let dx7_alg16_fHslider108: f32 = 99;
// L2 (NRPN 122)
let dx7_alg16_fHslider118: f32 = 99;
// L3 (NRPN 123)
let dx7_alg16_fHslider119: f32 = 99;
// L4 (NRPN 124)
let dx7_alg16_fHslider116: f32 = 0;
// R1 (NRPN 125)
let dx7_alg16_fHslider114: f32 = 99;
// R2 (NRPN 126)
let dx7_alg16_fHslider120: f32 = 99;
// R3 (NRPN 127)
let dx7_alg16_fHslider121: f32 = 99;
// R4 (NRPN 128)
let dx7_alg16_fHslider117: f32 = 99;
// Level (NRPN 129)
let dx7_alg16_fHslider109: f32 = 0;
// Key Vel (NRPN 130)
let dx7_alg16_fHslider113: f32 = 0;
// A Mod Sens (NRPN 131)
let dx7_alg16_fHslider122: f32 = 0;
// Rate Scaling (NRPN 132)
let dx7_alg16_fHslider115: f32 = 0;
// Breakpoint (NRPN 133)
let dx7_alg16_fHslider110: f32 = 0;
// L Depth (NRPN 134)
let dx7_alg16_fHslider111: f32 = 0;
// R Depth (NRPN 135)
let dx7_alg16_fHslider112: f32 = 0;
// L Curve (NRPN 136)
let dx7_alg16_fEntry11: f32 = 0;
// R Curve (NRPN 137)
let dx7_alg16_fEntry12: f32 = 0;

const Dx7_alg16_wave_SIG0Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 5, 9, 13, 17, 20, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 42, 43, 45, 46]);
const Dx7_alg16_wave_SIG1Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14, 16, 19, 23, 27, 33, 39, 47, 56, 66, 80, 94, 110, 126, 142, 158, 174, 190, 206, 222, 238, 250]);
const Dx7_alg16_wave_SIG2Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 70, 86, 97, 106, 114, 121, 126, 132, 138, 142, 148, 152, 156, 160, 163, 166, 170, 173, 174, 178, 181, 184, 186, 189, 190, 194, 196, 198, 200, 202, 205, 206, 209, 211, 214, 216, 218, 220, 222, 224, 225, 227, 229, 230, 232, 233, 235, 237, 238, 240, 241, 242, 243, 244, 246, 246, 248, 249, 250, 251, 252, 253, 254]);
const Dx7_alg16_wave_SIG3Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1764000, 1764000, 1411200, 1411200, 1190700, 1014300, 992250, 882000, 705600, 705600, 584325, 507150, 502740, 441000, 418950, 352800, 308700, 286650, 253575, 220500, 220500, 176400, 145530, 145530, 125685, 110250, 110250, 88200, 88200, 74970, 61740, 61740, 55125, 48510, 44100, 37485, 31311, 30870, 27562, 27562, 22050, 18522, 17640, 15435, 14112, 13230, 11025, 9261, 9261, 7717, 6615, 6615, 5512, 5512, 4410, 3969, 3969, 3439, 2866, 2690, 2249, 1984, 1896, 1808, 1411, 1367, 1234, 1146, 926, 837, 837, 705, 573, 573, 529, 441, 441]);
const Dx7_alg16_wave_SIG4Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 4342338, 7171437, 16777216]);
const Dx7_alg16_wave_SIG5Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-16777216, 0, 16777216, 26591258, 33554432, 38955489, 43368474, 47099600, 50331648, 53182516, 55732705, 58039632, 60145690, 62083076, 63876816, 65546747, 67108864, 68576247, 69959732, 71268397, 72509921, 73690858, 74816848, 75892776, 76922906, 77910978, 78860292, 79773775, 80654032, 81503396, 82323963, 83117622]);
const Dx7_alg16_wave_SIG6Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-128, -116, -104, -95, -85, -76, -68, -61, -56, -52, -49, -46, -43, -41, -39, -37, -35, -33, -32, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 38, 40, 43, 46, 49, 53, 58, 65, 73, 82, 92, 103, 115, 127]);
const Dx7_alg16_wave_SIG7Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 33, 34, 36, 37, 38, 39, 41, 42, 44, 46, 47, 49, 51, 53, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 79, 82, 85, 88, 91, 94, 98, 102, 106, 110, 115, 120, 125, 130, 135, 141, 147, 153, 159, 165, 171, 178, 185, 193, 202, 211, 232, 243, 254, 255]);
const Dx7_alg16_wave_SIG8Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 10, 20, 33, 55, 92, 153, 255]);

const Dx7_alg16_itbl0SIG0: StaticArray<i32> = new StaticArray<i32>(20);
const Dx7_alg16_itbl1SIG1: StaticArray<i32> = new StaticArray<i32>(33);
const Dx7_alg16_itbl2SIG2: StaticArray<i32> = new StaticArray<i32>(64);
const Dx7_alg16_itbl3SIG3: StaticArray<i32> = new StaticArray<i32>(77);
const Dx7_alg16_itbl4SIG4: StaticArray<i32> = new StaticArray<i32>(4);
const Dx7_alg16_itbl5SIG5: StaticArray<i32> = new StaticArray<i32>(32);
const Dx7_alg16_itbl6SIG6: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg16_itbl7SIG7: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg16_itbl8SIG8: StaticArray<i32> = new StaticArray<i32>(8);
let _Dx7_alg16_sig0_initialized: bool = false;

function _Dx7_alg16_initSIG0Tables(): void {
    if (_Dx7_alg16_sig0_initialized) return;
    _Dx7_alg16_sig0_initialized = true;
    let sig0_iDx7_alg16SIG0Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg16_itbl0SIG0.length; i++) {
        Dx7_alg16_itbl0SIG0[i] = Dx7_alg16_wave_SIG0Wave0[sig0_iDx7_alg16SIG0Wave0_idx];
        sig0_iDx7_alg16SIG0Wave0_idx = (1 + sig0_iDx7_alg16SIG0Wave0_idx) % 20;
    }
    let sig1_iDx7_alg16SIG1Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg16_itbl1SIG1.length; i++) {
        Dx7_alg16_itbl1SIG1[i] = Dx7_alg16_wave_SIG1Wave0[sig1_iDx7_alg16SIG1Wave0_idx];
        sig1_iDx7_alg16SIG1Wave0_idx = (1 + sig1_iDx7_alg16SIG1Wave0_idx) % 33;
    }
    let sig2_iDx7_alg16SIG2Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg16_itbl2SIG2.length; i++) {
        Dx7_alg16_itbl2SIG2[i] = Dx7_alg16_wave_SIG2Wave0[sig2_iDx7_alg16SIG2Wave0_idx];
        sig2_iDx7_alg16SIG2Wave0_idx = (1 + sig2_iDx7_alg16SIG2Wave0_idx) % 64;
    }
    let sig3_iDx7_alg16SIG3Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg16_itbl3SIG3.length; i++) {
        Dx7_alg16_itbl3SIG3[i] = Dx7_alg16_wave_SIG3Wave0[sig3_iDx7_alg16SIG3Wave0_idx];
        sig3_iDx7_alg16SIG3Wave0_idx = (1 + sig3_iDx7_alg16SIG3Wave0_idx) % 77;
    }
    let sig4_iDx7_alg16SIG4Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg16_itbl4SIG4.length; i++) {
        Dx7_alg16_itbl4SIG4[i] = Dx7_alg16_wave_SIG4Wave0[sig4_iDx7_alg16SIG4Wave0_idx];
        sig4_iDx7_alg16SIG4Wave0_idx = (1 + sig4_iDx7_alg16SIG4Wave0_idx) % 4;
    }
    let sig5_iDx7_alg16SIG5Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg16_itbl5SIG5.length; i++) {
        Dx7_alg16_itbl5SIG5[i] = Dx7_alg16_wave_SIG5Wave0[sig5_iDx7_alg16SIG5Wave0_idx];
        sig5_iDx7_alg16SIG5Wave0_idx = (1 + sig5_iDx7_alg16SIG5Wave0_idx) % 32;
    }
    let sig6_iDx7_alg16SIG6Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg16_itbl6SIG6.length; i++) {
        Dx7_alg16_itbl6SIG6[i] = Dx7_alg16_wave_SIG6Wave0[sig6_iDx7_alg16SIG6Wave0_idx];
        sig6_iDx7_alg16SIG6Wave0_idx = (1 + sig6_iDx7_alg16SIG6Wave0_idx) % 100;
    }
    let sig7_iDx7_alg16SIG7Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg16_itbl7SIG7.length; i++) {
        Dx7_alg16_itbl7SIG7[i] = Dx7_alg16_wave_SIG7Wave0[sig7_iDx7_alg16SIG7Wave0_idx];
        sig7_iDx7_alg16SIG7Wave0_idx = (1 + sig7_iDx7_alg16SIG7Wave0_idx) % 100;
    }
    let sig8_iDx7_alg16SIG8Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg16_itbl8SIG8.length; i++) {
        Dx7_alg16_itbl8SIG8[i] = Dx7_alg16_wave_SIG8Wave0[sig8_iDx7_alg16SIG8Wave0_idx];
        sig8_iDx7_alg16SIG8Wave0_idx = (1 + sig8_iDx7_alg16SIG8Wave0_idx) % 8;
    }
}

export class Dx7_alg16 extends MidiVoice {
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
        _Dx7_alg16_initSIG0Tables();
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
        this.fHslider8 = <f32>velocity / 127.0;
        this.fButton0 = 0.0;
        this.nextframe();
        this.fButton0 = 1.0;
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
        const fSlow1: f32 = Mathf.round(_fcast(dx7_alg16_fHslider0));
        const fSlow2: f32 = Mathf.round(_fcast(dx7_alg16_fHslider1));
        const fSlow3: f32 = Mathf.pow(2.0, 0.083333336 * (Mathf.round(_fcast(dx7_alg16_fHslider2)) + 17.31234 * Mathf.log(0.0022727272 * _fcast(this.fHslider3))));
        const fSlow4: f32 = Mathf.round(17.31234 * Mathf.log(fSlow3) + 69.0);
        const fSlow5: f32 = Mathf.round(_fcast(dx7_alg16_fHslider4));
        const fSlow6: f32 = Mathf.round(_fcast(dx7_alg16_fEntry0));
        const fSlow7: f32 = Mathf.round(_fcast(dx7_alg16_fHslider5));
        const fSlow8: f32 = fSlow4 + (-18.0 - fSlow5);
        const iSlow9: i32 = (((fSlow6 == 0.0 ? 1 : 0) | (fSlow6 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow7 * fSlow8)) >> 12 : _icast(329.0 * fSlow7 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow8))), 32))])) >> 15);
        const fSlow10: f32 = Mathf.round(_fcast(dx7_alg16_fEntry1));
        const fSlow11: f32 = Mathf.round(_fcast(dx7_alg16_fHslider6));
        const fSlow12: f32 = fSlow4 + (-16.0 - fSlow5);
        const iSlow13: i32 = (((fSlow10 == 0.0 ? 1 : 0) | (fSlow10 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow11 * fSlow12) >> 12 : _icast(329.0 * fSlow11 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow12)), 32))])) >> 15);
        const fSlow14: f32 = _fcast(Dx7_alg16_itbl2SIG2[_icast(Mathf.round(_fcast(_icast(Mathf.max(0.0, Mathf.min(127.0, 127.0 * _fcast(this.fHslider8)))) >> 1)))] + -239);
        const fSlow15: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow2 >= 2e+01 ? 1 : 0) ? fSlow2 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow2)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow5)) >= 0.0) ? ((fSlow10 < 2.0 ? 1 : 0) ? -iSlow13 : iSlow13) : ((fSlow6 < 2.0 ? 1 : 0) ? -iSlow9 : iSlow9)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg16_fHslider7)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow16: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow1 >= 2e+01 ? 1 : 0) ? fSlow1 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow1)), 19))]))) >> 1) << 6) + fSlow15 + -4256.0)) << 16;
        const iSlow17: i32 = fSlow1 == 0.0;
        const fSlow18: f32 = Mathf.round(_fcast(dx7_alg16_fHslider9));
        const fSlow19: f32 = Mathf.round(_fcast(dx7_alg16_fHslider10));
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
        const fSlow31: f32 = ((iSlow30) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow29)), 76))]) : 2e+01 * (99.0 - fSlow29));
        const iSlow32: i32 = (((iSlow16 == 0 ? 1 : 0) | iSlow17) ? _icast(this.fConst1 * ((iSlow30 & iSlow17) ? 0.05 * fSlow31 : fSlow31)) : 0);
        const fSlow33: f32 = Mathf.round(_fcast(dx7_alg16_fHslider11));
        const iSlow34: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fSlow33 >= 2e+01 ? 1 : 0) ? fSlow33 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow33)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow35: f32 = Mathf.round(_fcast(dx7_alg16_fHslider12));
        const fSlow36: f32 = Mathf.min(fSlow35 + fSlow28, 99.0);
        const iSlow37: i32 = _icast(this.fConst1 * ((fSlow36 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow36)), 76))]) : 2e+01 * (99.0 - fSlow36)));
        const fSlow38: f32 = Mathf.round(_fcast(dx7_alg16_fHslider13));
        const fSlow39: f32 = Mathf.round(_fcast(dx7_alg16_fHslider14));
        const fSlow40: f32 = Mathf.round(_fcast(dx7_alg16_fHslider15));
        const fSlow41: f32 = Mathf.round(_fcast(dx7_alg16_fHslider16));
        const iSlow42: i32 = iSlow16 > 0;
        const iSlow43: i32 = min<i32>(63, ((41 * _icast(fSlow18)) >> 6) + iSlow27);
        const iSlow44: i32 = _icast(this.fConst1 * _fcast(((iSlow43 & 3) + 4) << ((iSlow43 >> 2) + 2)));
        const iSlow45: i32 = min<i32>(63, ((41 * _icast(fSlow35)) >> 6) + iSlow27);
        const iSlow46: i32 = _icast(this.fConst1 * _fcast(((iSlow45 & 3) + 4) << ((iSlow45 >> 2) + 2)));
        const iSlow47: i32 = Dx7_alg16_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg16_fHslider17))))];
        const iSlow48: i32 = iSlow47 != 0;
        const fSlow49: f32 = 2.6972606e-09 * Mathf.round(_fcast(dx7_alg16_fHslider18));
        const iSlow50: i32 = _icast(Mathf.round(_fcast(dx7_alg16_fHslider19)));
        const fSlow51: f32 = Mathf.round(_fcast(dx7_alg16_fHslider20));
        const fSlow52: f32 = this.fConst2 * (((0.01010101 * fSlow51) <= 0.656566) ? 0.15806305 * fSlow51 + 0.036478 : 1.100254 * fSlow51 + -61.205933);
        const fSlow53: f32 = 99.0 - Mathf.round(_fcast(dx7_alg16_fHslider21));
        const iSlow54: i32 = (fSlow53 == 99.0 ? 1 : 0) >= 1;
        const iSlow55: i32 = _icast(fSlow53);
        const iSlow56: i32 = ((iSlow55 & 15) + 16) << ((iSlow55 >> 4) + 1);
        const fSlow57: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(max<i32>(iSlow56 & 65408, 128)));
        const fSlow58: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(iSlow56));
        const fSlow59: f32 = Mathf.round(_fcast(dx7_alg16_fEntry2));
        const iSlow60: i32 = fSlow59 >= 3.0;
        const iSlow61: i32 = fSlow59 >= 5.0;
        const iSlow62: i32 = fSlow59 >= 2.0;
        const iSlow63: i32 = fSlow59 >= 1.0;
        const iSlow64: i32 = fSlow59 >= 4.0;
        const fSlow65: f32 = _fcast(iSlow47);
        const iSlow66: i32 = _icast(Mathf.round(_fcast(dx7_alg16_fHslider22)));
        const iSlow67: i32 = _icast(Mathf.round(_fcast(this.fCheckbox0)));
        const fSlow68: f32 = Mathf.log(4.4e+02 * fSlow3);
        const fSlow69: f32 = Mathf.round(_fcast(dx7_alg16_fHslider23));
        const fSlow70: f32 = Mathf.exp(-0.57130724 * fSlow68);
        const iSlow71: i32 = _icast(Mathf.round(_fcast(dx7_alg16_fHslider24)));
        const fSlow72: f32 = Mathf.round(_fcast(dx7_alg16_fHslider25));
        const fSlow73: f32 = ((iSlow67) ? _fcast(_icast(4458616.0 * (fSlow72 + _fcast(100 * (iSlow71 & 3)))) >> 3) + ((fSlow69 > 0.0 ? 1 : 0) ? 13457.0 * fSlow69 : 0.0) : fSlow68 * (72267.445 * fSlow69 * fSlow70 + 24204406.0) + _fcast(Dx7_alg16_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow71 & 31)))]) + _fcast(((_icast(fSlow72)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow72 + 1.0) + 0.5)) : 0)));
        const fSlow74: f32 = Mathf.round(_fcast(dx7_alg16_fHslider26));
        const iSlow75: i32 = Dx7_alg16_itbl6SIG6[_icast(Mathf.round(fSlow74))];
        const fSlow76: f32 = _fcast(iSlow75);
        const fSlow77: f32 = Mathf.round(_fcast(dx7_alg16_fHslider27));
        const iSlow78: i32 = Dx7_alg16_itbl6SIG6[_icast(Mathf.round(fSlow77))];
        const iSlow79: i32 = iSlow78 > iSlow75;
        const fSlow80: f32 = Mathf.round(_fcast(dx7_alg16_fHslider28));
        const fSlow81: f32 = this.fConst4 * _fcast(Dx7_alg16_itbl7SIG7[_icast(Mathf.round(fSlow80))]);
        const fSlow82: f32 = Mathf.round(_fcast(dx7_alg16_fHslider29));
        const fSlow83: f32 = this.fConst4 * _fcast(Dx7_alg16_itbl7SIG7[_icast(Mathf.round(fSlow82))]);
        const fSlow84: f32 = Mathf.round(_fcast(dx7_alg16_fHslider30));
        const fSlow85: f32 = Mathf.round(_fcast(dx7_alg16_fHslider31));
        const fSlow86: f32 = Mathf.round(_fcast(dx7_alg16_fHslider32));
        const fSlow87: f32 = Mathf.round(_fcast(dx7_alg16_fHslider33));
        const fSlow88: f32 = 7.891414e-05 * Mathf.round(_fcast(dx7_alg16_fHslider34));
        const fSlow89: f32 = _fcast(Dx7_alg16_itbl8SIG8[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg16_fHslider35))))]);
        const fSlow90: f32 = Mathf.round(_fcast(dx7_alg16_fHslider36));
        const fSlow91: f32 = Mathf.round(_fcast(dx7_alg16_fHslider37));
        const fSlow92: f32 = Mathf.round(_fcast(dx7_alg16_fHslider38));
        const fSlow93: f32 = Mathf.round(_fcast(dx7_alg16_fEntry3));
        const fSlow94: f32 = Mathf.round(_fcast(dx7_alg16_fHslider39));
        const fSlow95: f32 = fSlow4 + (-18.0 - fSlow92);
        const iSlow96: i32 = (((fSlow93 == 0.0 ? 1 : 0) | (fSlow93 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow94 * fSlow95)) >> 12 : _icast(329.0 * fSlow94 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow95))), 32))])) >> 15);
        const fSlow97: f32 = Mathf.round(_fcast(dx7_alg16_fEntry4));
        const fSlow98: f32 = Mathf.round(_fcast(dx7_alg16_fHslider40));
        const fSlow99: f32 = fSlow4 + (-16.0 - fSlow92);
        const iSlow100: i32 = (((fSlow97 == 0.0 ? 1 : 0) | (fSlow97 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow98 * fSlow99) >> 12 : _icast(329.0 * fSlow98 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow99)), 32))])) >> 15);
        const fSlow101: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow91 >= 2e+01 ? 1 : 0) ? fSlow91 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow91)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow92)) >= 0.0) ? ((fSlow97 < 2.0 ? 1 : 0) ? -iSlow100 : iSlow100) : ((fSlow93 < 2.0 ? 1 : 0) ? -iSlow96 : iSlow96)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg16_fHslider41)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow102: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow90 >= 2e+01 ? 1 : 0) ? fSlow90 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow90)), 19))]))) >> 1) << 6) + fSlow101 + -4256.0)) << 16;
        const iSlow103: i32 = fSlow90 == 0.0;
        const fSlow104: f32 = Mathf.round(_fcast(dx7_alg16_fHslider42));
        const fSlow105: f32 = Mathf.round(_fcast(dx7_alg16_fHslider43));
        const iSlow106: i32 = _icast(fSlow105 * fSlow25) >> 3;
        const iSlow107: i32 = (((fSlow105 == 3.0 ? 1 : 0) & iSlow22) ? iSlow106 + -1 : ((((fSlow105 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow106 + 1 : iSlow106));
        const fSlow108: f32 = _fcast(iSlow107);
        const fSlow109: f32 = Mathf.min(fSlow104 + fSlow108, 99.0);
        const iSlow110: i32 = fSlow109 < 77.0;
        const fSlow111: f32 = ((iSlow110) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow109)), 76))]) : 2e+01 * (99.0 - fSlow109));
        const iSlow112: i32 = (((iSlow102 == 0 ? 1 : 0) | iSlow103) ? _icast(this.fConst1 * ((iSlow110 & iSlow103) ? 0.05 * fSlow111 : fSlow111)) : 0);
        const fSlow113: f32 = Mathf.round(_fcast(dx7_alg16_fHslider44));
        const iSlow114: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fSlow113 >= 2e+01 ? 1 : 0) ? fSlow113 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow113)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow115: f32 = Mathf.round(_fcast(dx7_alg16_fHslider45));
        const fSlow116: f32 = Mathf.min(fSlow115 + fSlow108, 99.0);
        const iSlow117: i32 = _icast(this.fConst1 * ((fSlow116 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow116)), 76))]) : 2e+01 * (99.0 - fSlow116)));
        const fSlow118: f32 = Mathf.round(_fcast(dx7_alg16_fHslider46));
        const fSlow119: f32 = Mathf.round(_fcast(dx7_alg16_fHslider47));
        const fSlow120: f32 = Mathf.round(_fcast(dx7_alg16_fHslider48));
        const fSlow121: f32 = Mathf.round(_fcast(dx7_alg16_fHslider49));
        const iSlow122: i32 = iSlow102 > 0;
        const iSlow123: i32 = min<i32>(63, ((41 * _icast(fSlow104)) >> 6) + iSlow107);
        const iSlow124: i32 = _icast(this.fConst1 * _fcast(((iSlow123 & 3) + 4) << ((iSlow123 >> 2) + 2)));
        const iSlow125: i32 = min<i32>(63, ((41 * _icast(fSlow115)) >> 6) + iSlow107);
        const iSlow126: i32 = _icast(this.fConst1 * _fcast(((iSlow125 & 3) + 4) << ((iSlow125 >> 2) + 2)));
        const iSlow127: i32 = Dx7_alg16_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg16_fHslider50))))];
        const iSlow128: i32 = iSlow127 != 0;
        const fSlow129: f32 = _fcast(iSlow127);
        const iSlow130: i32 = _icast(Mathf.round(_fcast(this.fCheckbox1)));
        const fSlow131: f32 = Mathf.round(_fcast(dx7_alg16_fHslider51));
        const iSlow132: i32 = _icast(Mathf.round(_fcast(dx7_alg16_fHslider52)));
        const fSlow133: f32 = Mathf.round(_fcast(dx7_alg16_fHslider53));
        const fSlow134: f32 = ((iSlow130) ? _fcast(_icast(4458616.0 * (fSlow133 + _fcast(100 * (iSlow132 & 3)))) >> 3) + ((fSlow131 > 0.0 ? 1 : 0) ? 13457.0 * fSlow131 : 0.0) : fSlow68 * (72267.445 * fSlow131 * fSlow70 + 24204406.0) + _fcast(Dx7_alg16_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow132 & 31)))]) + _fcast(((_icast(fSlow133)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow133 + 1.0) + 0.5)) : 0)));
        const fSlow135: f32 = Mathf.round(_fcast(dx7_alg16_fHslider54));
        const fSlow136: f32 = Mathf.round(_fcast(dx7_alg16_fHslider55));
        const fSlow137: f32 = Mathf.round(_fcast(dx7_alg16_fHslider56));
        const fSlow138: f32 = Mathf.round(_fcast(dx7_alg16_fEntry5));
        const fSlow139: f32 = Mathf.round(_fcast(dx7_alg16_fHslider57));
        const fSlow140: f32 = fSlow4 + (-18.0 - fSlow137);
        const iSlow141: i32 = (((fSlow138 == 0.0 ? 1 : 0) | (fSlow138 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow139 * fSlow140)) >> 12 : _icast(329.0 * fSlow139 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow140))), 32))])) >> 15);
        const fSlow142: f32 = Mathf.round(_fcast(dx7_alg16_fEntry6));
        const fSlow143: f32 = Mathf.round(_fcast(dx7_alg16_fHslider58));
        const fSlow144: f32 = fSlow4 + (-16.0 - fSlow137);
        const iSlow145: i32 = (((fSlow142 == 0.0 ? 1 : 0) | (fSlow142 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow143 * fSlow144) >> 12 : _icast(329.0 * fSlow143 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow144)), 32))])) >> 15);
        const fSlow146: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow136 >= 2e+01 ? 1 : 0) ? fSlow136 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow136)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow137)) >= 0.0) ? ((fSlow142 < 2.0 ? 1 : 0) ? -iSlow145 : iSlow145) : ((fSlow138 < 2.0 ? 1 : 0) ? -iSlow141 : iSlow141)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg16_fHslider59)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow147: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow135 >= 2e+01 ? 1 : 0) ? fSlow135 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow135)), 19))]))) >> 1) << 6) + fSlow146 + -4256.0)) << 16;
        const iSlow148: i32 = fSlow135 == 0.0;
        const fSlow149: f32 = Mathf.round(_fcast(dx7_alg16_fHslider60));
        const fSlow150: f32 = Mathf.round(_fcast(dx7_alg16_fHslider61));
        const iSlow151: i32 = _icast(fSlow150 * fSlow25) >> 3;
        const iSlow152: i32 = (((fSlow150 == 3.0 ? 1 : 0) & iSlow22) ? iSlow151 + -1 : ((((fSlow150 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow151 + 1 : iSlow151));
        const fSlow153: f32 = _fcast(iSlow152);
        const fSlow154: f32 = Mathf.min(fSlow149 + fSlow153, 99.0);
        const iSlow155: i32 = fSlow154 < 77.0;
        const fSlow156: f32 = ((iSlow155) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow154)), 76))]) : 2e+01 * (99.0 - fSlow154));
        const iSlow157: i32 = (((iSlow147 == 0 ? 1 : 0) | iSlow148) ? _icast(this.fConst1 * ((iSlow155 & iSlow148) ? 0.05 * fSlow156 : fSlow156)) : 0);
        const fSlow158: f32 = Mathf.round(_fcast(dx7_alg16_fHslider62));
        const iSlow159: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fSlow158 >= 2e+01 ? 1 : 0) ? fSlow158 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow158)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow160: f32 = Mathf.round(_fcast(dx7_alg16_fHslider63));
        const fSlow161: f32 = Mathf.min(fSlow160 + fSlow153, 99.0);
        const iSlow162: i32 = _icast(this.fConst1 * ((fSlow161 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow161)), 76))]) : 2e+01 * (99.0 - fSlow161)));
        const fSlow163: f32 = Mathf.round(_fcast(dx7_alg16_fHslider64));
        const fSlow164: f32 = Mathf.round(_fcast(dx7_alg16_fHslider65));
        const fSlow165: f32 = Mathf.round(_fcast(dx7_alg16_fHslider66));
        const fSlow166: f32 = Mathf.round(_fcast(dx7_alg16_fHslider67));
        const iSlow167: i32 = iSlow147 > 0;
        const iSlow168: i32 = min<i32>(63, ((41 * _icast(fSlow149)) >> 6) + iSlow152);
        const iSlow169: i32 = _icast(this.fConst1 * _fcast(((iSlow168 & 3) + 4) << ((iSlow168 >> 2) + 2)));
        const iSlow170: i32 = min<i32>(63, ((41 * _icast(fSlow160)) >> 6) + iSlow152);
        const iSlow171: i32 = _icast(this.fConst1 * _fcast(((iSlow170 & 3) + 4) << ((iSlow170 >> 2) + 2)));
        const iSlow172: i32 = Dx7_alg16_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg16_fHslider68))))];
        const iSlow173: i32 = iSlow172 != 0;
        const fSlow174: f32 = _fcast(iSlow172);
        const iSlow175: i32 = _icast(Mathf.round(_fcast(this.fCheckbox2)));
        const fSlow176: f32 = Mathf.round(_fcast(dx7_alg16_fHslider69));
        const iSlow177: i32 = _icast(Mathf.round(_fcast(dx7_alg16_fHslider70)));
        const fSlow178: f32 = Mathf.round(_fcast(dx7_alg16_fHslider71));
        const fSlow179: f32 = ((iSlow175) ? _fcast(_icast(4458616.0 * (fSlow178 + _fcast(100 * (iSlow177 & 3)))) >> 3) + ((fSlow176 > 0.0 ? 1 : 0) ? 13457.0 * fSlow176 : 0.0) : fSlow68 * (72267.445 * fSlow176 * fSlow70 + 24204406.0) + _fcast(Dx7_alg16_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow177 & 31)))]) + _fcast(((_icast(fSlow178)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow178 + 1.0) + 0.5)) : 0)));
        const fSlow180: f32 = Mathf.round(_fcast(dx7_alg16_fHslider72));
        const fSlow181: f32 = Mathf.round(_fcast(dx7_alg16_fHslider73));
        const fSlow182: f32 = Mathf.round(_fcast(dx7_alg16_fHslider74));
        const fSlow183: f32 = Mathf.round(_fcast(dx7_alg16_fEntry7));
        const fSlow184: f32 = Mathf.round(_fcast(dx7_alg16_fHslider75));
        const fSlow185: f32 = fSlow4 + (-18.0 - fSlow182);
        const iSlow186: i32 = (((fSlow183 == 0.0 ? 1 : 0) | (fSlow183 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow184 * fSlow185)) >> 12 : _icast(329.0 * fSlow184 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow185))), 32))])) >> 15);
        const fSlow187: f32 = Mathf.round(_fcast(dx7_alg16_fEntry8));
        const fSlow188: f32 = Mathf.round(_fcast(dx7_alg16_fHslider76));
        const fSlow189: f32 = fSlow4 + (-16.0 - fSlow182);
        const iSlow190: i32 = (((fSlow187 == 0.0 ? 1 : 0) | (fSlow187 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow188 * fSlow189) >> 12 : _icast(329.0 * fSlow188 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow189)), 32))])) >> 15);
        const fSlow191: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow181 >= 2e+01 ? 1 : 0) ? fSlow181 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow181)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow182)) >= 0.0) ? ((fSlow187 < 2.0 ? 1 : 0) ? -iSlow190 : iSlow190) : ((fSlow183 < 2.0 ? 1 : 0) ? -iSlow186 : iSlow186)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg16_fHslider77)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow192: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow180 >= 2e+01 ? 1 : 0) ? fSlow180 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow180)), 19))]))) >> 1) << 6) + fSlow191 + -4256.0)) << 16;
        const iSlow193: i32 = fSlow180 == 0.0;
        const fSlow194: f32 = Mathf.round(_fcast(dx7_alg16_fHslider78));
        const fSlow195: f32 = Mathf.round(_fcast(dx7_alg16_fHslider79));
        const iSlow196: i32 = _icast(fSlow195 * fSlow25) >> 3;
        const iSlow197: i32 = (((fSlow195 == 3.0 ? 1 : 0) & iSlow22) ? iSlow196 + -1 : ((((fSlow195 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow196 + 1 : iSlow196));
        const fSlow198: f32 = _fcast(iSlow197);
        const fSlow199: f32 = Mathf.min(fSlow194 + fSlow198, 99.0);
        const iSlow200: i32 = fSlow199 < 77.0;
        const fSlow201: f32 = ((iSlow200) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow199)), 76))]) : 2e+01 * (99.0 - fSlow199));
        const iSlow202: i32 = (((iSlow192 == 0 ? 1 : 0) | iSlow193) ? _icast(this.fConst1 * ((iSlow200 & iSlow193) ? 0.05 * fSlow201 : fSlow201)) : 0);
        const fSlow203: f32 = Mathf.round(_fcast(dx7_alg16_fHslider80));
        const iSlow204: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fSlow203 >= 2e+01 ? 1 : 0) ? fSlow203 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow203)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow205: f32 = Mathf.round(_fcast(dx7_alg16_fHslider81));
        const fSlow206: f32 = Mathf.min(fSlow205 + fSlow198, 99.0);
        const iSlow207: i32 = _icast(this.fConst1 * ((fSlow206 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow206)), 76))]) : 2e+01 * (99.0 - fSlow206)));
        const fSlow208: f32 = Mathf.round(_fcast(dx7_alg16_fHslider82));
        const fSlow209: f32 = Mathf.round(_fcast(dx7_alg16_fHslider83));
        const fSlow210: f32 = Mathf.round(_fcast(dx7_alg16_fHslider84));
        const fSlow211: f32 = Mathf.round(_fcast(dx7_alg16_fHslider85));
        const iSlow212: i32 = iSlow192 > 0;
        const iSlow213: i32 = min<i32>(63, ((41 * _icast(fSlow194)) >> 6) + iSlow197);
        const iSlow214: i32 = _icast(this.fConst1 * _fcast(((iSlow213 & 3) + 4) << ((iSlow213 >> 2) + 2)));
        const iSlow215: i32 = min<i32>(63, ((41 * _icast(fSlow205)) >> 6) + iSlow197);
        const iSlow216: i32 = _icast(this.fConst1 * _fcast(((iSlow215 & 3) + 4) << ((iSlow215 >> 2) + 2)));
        const iSlow217: i32 = Dx7_alg16_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg16_fHslider86))))];
        const iSlow218: i32 = iSlow217 != 0;
        const fSlow219: f32 = _fcast(iSlow217);
        const iSlow220: i32 = _icast(Mathf.round(_fcast(this.fCheckbox3)));
        const fSlow221: f32 = Mathf.round(_fcast(dx7_alg16_fHslider87));
        const iSlow222: i32 = _icast(Mathf.round(_fcast(dx7_alg16_fHslider88)));
        const fSlow223: f32 = Mathf.round(_fcast(dx7_alg16_fHslider89));
        const fSlow224: f32 = ((iSlow220) ? _fcast(_icast(4458616.0 * (fSlow223 + _fcast(100 * (iSlow222 & 3)))) >> 3) + ((fSlow221 > 0.0 ? 1 : 0) ? 13457.0 * fSlow221 : 0.0) : fSlow68 * (72267.445 * fSlow221 * fSlow70 + 24204406.0) + _fcast(Dx7_alg16_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow222 & 31)))]) + _fcast(((_icast(fSlow223)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow223 + 1.0) + 0.5)) : 0)));
        const fSlow225: f32 = Mathf.round(_fcast(dx7_alg16_fHslider90));
        const fSlow226: f32 = Mathf.round(_fcast(dx7_alg16_fHslider91));
        const fSlow227: f32 = Mathf.round(_fcast(dx7_alg16_fHslider92));
        const fSlow228: f32 = Mathf.round(_fcast(dx7_alg16_fEntry9));
        const fSlow229: f32 = Mathf.round(_fcast(dx7_alg16_fHslider93));
        const fSlow230: f32 = fSlow4 + (-18.0 - fSlow227);
        const iSlow231: i32 = (((fSlow228 == 0.0 ? 1 : 0) | (fSlow228 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow229 * fSlow230)) >> 12 : _icast(329.0 * fSlow229 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow230))), 32))])) >> 15);
        const fSlow232: f32 = Mathf.round(_fcast(dx7_alg16_fEntry10));
        const fSlow233: f32 = Mathf.round(_fcast(dx7_alg16_fHslider94));
        const fSlow234: f32 = fSlow4 + (-16.0 - fSlow227);
        const iSlow235: i32 = (((fSlow232 == 0.0 ? 1 : 0) | (fSlow232 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow233 * fSlow234) >> 12 : _icast(329.0 * fSlow233 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow234)), 32))])) >> 15);
        const fSlow236: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow226 >= 2e+01 ? 1 : 0) ? fSlow226 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow226)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow227)) >= 0.0) ? ((fSlow232 < 2.0 ? 1 : 0) ? -iSlow235 : iSlow235) : ((fSlow228 < 2.0 ? 1 : 0) ? -iSlow231 : iSlow231)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg16_fHslider95)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow237: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow225 >= 2e+01 ? 1 : 0) ? fSlow225 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow225)), 19))]))) >> 1) << 6) + fSlow236 + -4256.0)) << 16;
        const iSlow238: i32 = fSlow225 == 0.0;
        const fSlow239: f32 = Mathf.round(_fcast(dx7_alg16_fHslider96));
        const fSlow240: f32 = Mathf.round(_fcast(dx7_alg16_fHslider97));
        const iSlow241: i32 = _icast(fSlow240 * fSlow25) >> 3;
        const iSlow242: i32 = (((fSlow240 == 3.0 ? 1 : 0) & iSlow22) ? iSlow241 + -1 : ((((fSlow240 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow241 + 1 : iSlow241));
        const fSlow243: f32 = _fcast(iSlow242);
        const fSlow244: f32 = Mathf.min(fSlow239 + fSlow243, 99.0);
        const iSlow245: i32 = fSlow244 < 77.0;
        const fSlow246: f32 = ((iSlow245) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow244)), 76))]) : 2e+01 * (99.0 - fSlow244));
        const iSlow247: i32 = (((iSlow237 == 0 ? 1 : 0) | iSlow238) ? _icast(this.fConst1 * ((iSlow245 & iSlow238) ? 0.05 * fSlow246 : fSlow246)) : 0);
        const fSlow248: f32 = Mathf.round(_fcast(dx7_alg16_fHslider98));
        const iSlow249: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fSlow248 >= 2e+01 ? 1 : 0) ? fSlow248 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow248)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow250: f32 = Mathf.round(_fcast(dx7_alg16_fHslider99));
        const fSlow251: f32 = Mathf.min(fSlow250 + fSlow243, 99.0);
        const iSlow252: i32 = _icast(this.fConst1 * ((fSlow251 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow251)), 76))]) : 2e+01 * (99.0 - fSlow251)));
        const fSlow253: f32 = Mathf.round(_fcast(dx7_alg16_fHslider100));
        const fSlow254: f32 = Mathf.round(_fcast(dx7_alg16_fHslider101));
        const fSlow255: f32 = Mathf.round(_fcast(dx7_alg16_fHslider102));
        const fSlow256: f32 = Mathf.round(_fcast(dx7_alg16_fHslider103));
        const iSlow257: i32 = iSlow237 > 0;
        const iSlow258: i32 = min<i32>(63, ((41 * _icast(fSlow239)) >> 6) + iSlow242);
        const iSlow259: i32 = _icast(this.fConst1 * _fcast(((iSlow258 & 3) + 4) << ((iSlow258 >> 2) + 2)));
        const iSlow260: i32 = min<i32>(63, ((41 * _icast(fSlow250)) >> 6) + iSlow242);
        const iSlow261: i32 = _icast(this.fConst1 * _fcast(((iSlow260 & 3) + 4) << ((iSlow260 >> 2) + 2)));
        const iSlow262: i32 = Dx7_alg16_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg16_fHslider104))))];
        const iSlow263: i32 = iSlow262 != 0;
        const fSlow264: f32 = _fcast(iSlow262);
        const iSlow265: i32 = _icast(Mathf.round(_fcast(this.fCheckbox4)));
        const fSlow266: f32 = Mathf.round(_fcast(dx7_alg16_fHslider105));
        const iSlow267: i32 = _icast(Mathf.round(_fcast(dx7_alg16_fHslider106)));
        const fSlow268: f32 = Mathf.round(_fcast(dx7_alg16_fHslider107));
        const fSlow269: f32 = ((iSlow265) ? _fcast(_icast(4458616.0 * (fSlow268 + _fcast(100 * (iSlow267 & 3)))) >> 3) + ((fSlow266 > 0.0 ? 1 : 0) ? 13457.0 * fSlow266 : 0.0) : fSlow68 * (72267.445 * fSlow266 * fSlow70 + 24204406.0) + _fcast(Dx7_alg16_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow267 & 31)))]) + _fcast(((_icast(fSlow268)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow268 + 1.0) + 0.5)) : 0)));
        const fSlow270: f32 = Mathf.round(_fcast(dx7_alg16_fHslider108));
        const fSlow271: f32 = Mathf.round(_fcast(dx7_alg16_fHslider109));
        const fSlow272: f32 = Mathf.round(_fcast(dx7_alg16_fHslider110));
        const fSlow273: f32 = Mathf.round(_fcast(dx7_alg16_fEntry11));
        const fSlow274: f32 = Mathf.round(_fcast(dx7_alg16_fHslider111));
        const fSlow275: f32 = fSlow4 + (-18.0 - fSlow272);
        const iSlow276: i32 = (((fSlow273 == 0.0 ? 1 : 0) | (fSlow273 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow274 * fSlow275)) >> 12 : _icast(329.0 * fSlow274 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow275))), 32))])) >> 15);
        const fSlow277: f32 = Mathf.round(_fcast(dx7_alg16_fEntry12));
        const fSlow278: f32 = Mathf.round(_fcast(dx7_alg16_fHslider112));
        const fSlow279: f32 = fSlow4 + (-16.0 - fSlow272);
        const iSlow280: i32 = (((fSlow277 == 0.0 ? 1 : 0) | (fSlow277 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow278 * fSlow279) >> 12 : _icast(329.0 * fSlow278 * _fcast(Dx7_alg16_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow279)), 32))])) >> 15);
        const fSlow281: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow271 >= 2e+01 ? 1 : 0) ? fSlow271 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow271)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow272)) >= 0.0) ? ((fSlow277 < 2.0 ? 1 : 0) ? -iSlow280 : iSlow280) : ((fSlow273 < 2.0 ? 1 : 0) ? -iSlow276 : iSlow276)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg16_fHslider113)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow282: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow270 >= 2e+01 ? 1 : 0) ? fSlow270 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow270)), 19))]))) >> 1) << 6) + fSlow281 + -4256.0)) << 16;
        const iSlow283: i32 = fSlow270 == 0.0;
        const fSlow284: f32 = Mathf.round(_fcast(dx7_alg16_fHslider114));
        const fSlow285: f32 = Mathf.round(_fcast(dx7_alg16_fHslider115));
        const iSlow286: i32 = _icast(fSlow285 * fSlow25) >> 3;
        const iSlow287: i32 = (((fSlow285 == 3.0 ? 1 : 0) & iSlow22) ? iSlow286 + -1 : ((((fSlow285 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow286 + 1 : iSlow286));
        const fSlow288: f32 = _fcast(iSlow287);
        const fSlow289: f32 = Mathf.min(fSlow284 + fSlow288, 99.0);
        const iSlow290: i32 = fSlow289 < 77.0;
        const fSlow291: f32 = ((iSlow290) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow289)), 76))]) : 2e+01 * (99.0 - fSlow289));
        const iSlow292: i32 = (((iSlow282 == 0 ? 1 : 0) | iSlow283) ? _icast(this.fConst1 * ((iSlow290 & iSlow283) ? 0.05 * fSlow291 : fSlow291)) : 0);
        const fSlow293: f32 = Mathf.round(_fcast(dx7_alg16_fHslider116));
        const iSlow294: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fSlow293 >= 2e+01 ? 1 : 0) ? fSlow293 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow293)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow295: f32 = Mathf.round(_fcast(dx7_alg16_fHslider117));
        const fSlow296: f32 = Mathf.min(fSlow295 + fSlow288, 99.0);
        const iSlow297: i32 = _icast(this.fConst1 * ((fSlow296 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow296)), 76))]) : 2e+01 * (99.0 - fSlow296)));
        const fSlow298: f32 = Mathf.round(_fcast(dx7_alg16_fHslider118));
        const fSlow299: f32 = Mathf.round(_fcast(dx7_alg16_fHslider119));
        const fSlow300: f32 = Mathf.round(_fcast(dx7_alg16_fHslider120));
        const fSlow301: f32 = Mathf.round(_fcast(dx7_alg16_fHslider121));
        const iSlow302: i32 = iSlow282 > 0;
        const iSlow303: i32 = min<i32>(63, ((41 * _icast(fSlow284)) >> 6) + iSlow287);
        const iSlow304: i32 = _icast(this.fConst1 * _fcast(((iSlow303 & 3) + 4) << ((iSlow303 >> 2) + 2)));
        const iSlow305: i32 = min<i32>(63, ((41 * _icast(fSlow295)) >> 6) + iSlow287);
        const iSlow306: i32 = _icast(this.fConst1 * _fcast(((iSlow305 & 3) + 4) << ((iSlow305 >> 2) + 2)));
        const iSlow307: i32 = Dx7_alg16_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg16_fHslider122))))];
        const iSlow308: i32 = iSlow307 != 0;
        const fSlow309: f32 = _fcast(iSlow307);
        const iSlow310: i32 = _icast(Mathf.round(_fcast(this.fCheckbox5)));
        const fSlow311: f32 = Mathf.round(_fcast(dx7_alg16_fHslider123));
        const iSlow312: i32 = _icast(Mathf.round(_fcast(dx7_alg16_fHslider124)));
        const fSlow313: f32 = Mathf.round(_fcast(dx7_alg16_fHslider125));
        const fSlow314: f32 = ((iSlow310) ? _fcast(_icast(4458616.0 * (fSlow313 + _fcast(100 * (iSlow312 & 3)))) >> 3) + ((fSlow311 > 0.0 ? 1 : 0) ? 13457.0 * fSlow311 : 0.0) : fSlow68 * (72267.445 * fSlow311 * fSlow70 + 24204406.0) + _fcast(Dx7_alg16_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow312 & 31)))]) + _fcast(((_icast(fSlow313)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow313 + 1.0) + 0.5)) : 0)));
        const fSlow315: f32 = Mathf.round(_fcast(dx7_alg16_fHslider126));
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
        const iTemp17: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp16 >= 2e+01 ? 1 : 0) ? fTemp16 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp16)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp18: i32 = iTemp8 == 0;
        const iTemp19: i32 = fTemp16 == 0.0;
        const fTemp20: f32 = ((iTemp13) ? ((iTemp15) ? fSlow35 : fSlow41) : ((iTemp14) ? fSlow40 : fSlow18));
        const fTemp21: f32 = Mathf.min(fSlow28 + fTemp20, 99.0);
        const iTemp22: i32 = fTemp21 < 77.0;
        const fTemp23: f32 = ((iTemp22) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp21)), 76))]) : 2e+01 * (99.0 - fTemp21));
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
        const iTemp46: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp45 >= 2e+01 ? 1 : 0) ? fTemp45 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp45)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp56: f32 = ((iTemp55) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp54)), 76))]) : 2e+01 * (99.0 - fTemp54));
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
        const iTemp89: i32 = Dx7_alg16_itbl6SIG6[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow74 : fSlow85) : ((iTemp87) ? fSlow84 : fSlow77))))];
        const iTemp90: i32 = ((iTemp85) ? iTemp89 : iTemp79);
        this.iRec15[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp90 : iTemp79) : ((iTemp81) ? iTemp90 : iTemp79)) : iTemp79);
        const iTemp91: i32 = ((iTemp85) ? iTemp89 > iTemp79 : iTemp75);
        this.iRec16[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp91 : iTemp75) : ((iTemp81) ? iTemp91 : iTemp75)) : iTemp75);
        const fTemp92: f32 = ((iTemp85) ? this.fConst4 * _fcast(Dx7_alg16_itbl7SIG7[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow80 : fSlow87) : ((iTemp87) ? fSlow86 : fSlow82))))]) : fTemp77);
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
        const iTemp110: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp109 >= 2e+01 ? 1 : 0) ? fTemp109 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp109)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp111: i32 = iTemp101 == 0;
        const iTemp112: i32 = fTemp109 == 0.0;
        const fTemp113: f32 = ((iTemp106) ? ((iTemp108) ? fSlow115 : fSlow121) : ((iTemp107) ? fSlow120 : fSlow104));
        const fTemp114: f32 = Mathf.min(fSlow108 + fTemp113, 99.0);
        const iTemp115: i32 = fTemp114 < 77.0;
        const fTemp116: f32 = ((iTemp115) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp114)), 76))]) : 2e+01 * (99.0 - fTemp114));
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
        const iTemp139: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp138 >= 2e+01 ? 1 : 0) ? fTemp138 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp138)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp149: f32 = ((iTemp148) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp147)), 76))]) : 2e+01 * (99.0 - fTemp147));
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
        const iTemp166: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fTemp165 >= 2e+01 ? 1 : 0) ? fTemp165 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp165)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp167: i32 = iTemp157 == 0;
        const iTemp168: i32 = fTemp165 == 0.0;
        const fTemp169: f32 = ((iTemp162) ? ((iTemp164) ? fSlow160 : fSlow166) : ((iTemp163) ? fSlow165 : fSlow149));
        const fTemp170: f32 = Mathf.min(fSlow153 + fTemp169, 99.0);
        const iTemp171: i32 = fTemp170 < 77.0;
        const fTemp172: f32 = ((iTemp171) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp170)), 76))]) : 2e+01 * (99.0 - fTemp170));
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
        const iTemp195: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fTemp194 >= 2e+01 ? 1 : 0) ? fTemp194 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp194)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp205: f32 = ((iTemp204) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp203)), 76))]) : 2e+01 * (99.0 - fTemp203));
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
        const iTemp222: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fTemp221 >= 2e+01 ? 1 : 0) ? fTemp221 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp221)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp223: i32 = iTemp213 == 0;
        const iTemp224: i32 = fTemp221 == 0.0;
        const fTemp225: f32 = ((iTemp218) ? ((iTemp220) ? fSlow205 : fSlow211) : ((iTemp219) ? fSlow210 : fSlow194));
        const fTemp226: f32 = Mathf.min(fSlow198 + fTemp225, 99.0);
        const iTemp227: i32 = fTemp226 < 77.0;
        const fTemp228: f32 = ((iTemp227) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp226)), 76))]) : 2e+01 * (99.0 - fTemp226));
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
        const iTemp251: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fTemp250 >= 2e+01 ? 1 : 0) ? fTemp250 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp250)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp261: f32 = ((iTemp260) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp259)), 76))]) : 2e+01 * (99.0 - fTemp259));
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
        const iTemp278: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fTemp277 >= 2e+01 ? 1 : 0) ? fTemp277 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp277)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp279: i32 = iTemp269 == 0;
        const iTemp280: i32 = fTemp277 == 0.0;
        const fTemp281: f32 = ((iTemp274) ? ((iTemp276) ? fSlow250 : fSlow256) : ((iTemp275) ? fSlow255 : fSlow239));
        const fTemp282: f32 = Mathf.min(fSlow243 + fTemp281, 99.0);
        const iTemp283: i32 = fTemp282 < 77.0;
        const fTemp284: f32 = ((iTemp283) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp282)), 76))]) : 2e+01 * (99.0 - fTemp282));
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
        const iTemp307: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fTemp306 >= 2e+01 ? 1 : 0) ? fTemp306 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp306)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp317: f32 = ((iTemp316) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp315)), 76))]) : 2e+01 * (99.0 - fTemp315));
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
        const iTemp334: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp333 >= 2e+01 ? 1 : 0) ? fTemp333 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp333)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp335: i32 = iTemp325 == 0;
        const iTemp336: i32 = fTemp333 == 0.0;
        const fTemp337: f32 = ((iTemp330) ? ((iTemp332) ? fSlow295 : fSlow301) : ((iTemp331) ? fSlow300 : fSlow284));
        const fTemp338: f32 = Mathf.min(fSlow288 + fTemp337, 99.0);
        const iTemp339: i32 = fTemp338 < 77.0;
        const fTemp340: f32 = ((iTemp339) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp338)), 76))]) : 2e+01 * (99.0 - fTemp338));
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
        const iTemp363: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp362 >= 2e+01 ? 1 : 0) ? fTemp362 + 28.0 : _fcast(Dx7_alg16_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp362)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp373: f32 = ((iTemp372) ? _fcast(Dx7_alg16_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp371)), 76))]) : 2e+01 * (99.0 - fTemp371));
        const iTemp374: i32 = ((iTemp358) ? (((iTemp363 == iTemp353 ? 1 : 0) | (iTemp369 & iTemp370)) ? _icast(this.fConst1 * (((iTemp372 & iTemp369) & iTemp370) ? 0.05 * fTemp373 : fTemp373)) : 0) : iTemp341);
        this.iRec58[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp374 : iTemp341) : ((iTemp346) ? ((iTemp354) ? iTemp374 : iTemp341) : iTemp341)) : iTemp341);
        const fTemp375: f32 = ((iTemp70) ? 0.0 : this.fRec59[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow314 + ((iSlow310) ? 0.0 : fTemp94))));
        this.fRec59[0] = fTemp375 - Mathf.floor(fTemp375);
        this.fRec51[0] = 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec52[0] + (-234881024 - ((iSlow308) ? _icast(5.9604645e-08 * _fcast(this.iRec52[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow309 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec59[0] + this.fRec51[1] * fSlow316));
        const fTemp376: f32 = 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec0[0] + (-234881024 - ((iSlow48) ? _icast(5.9604645e-08 * _fcast(this.iRec0[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow65 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec12[0] + 0.5 * (Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec19[0] + (-234881024 - ((iSlow128) ? _icast(5.9604645e-08 * _fcast(this.iRec19[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow129 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec26[0]) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec27[0] + (-234881024 - ((iSlow173) ? _icast(5.9604645e-08 * _fcast(this.iRec27[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow174 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec34[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec35[0] + (-234881024 - ((iSlow218) ? _icast(5.9604645e-08 * _fcast(this.iRec35[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow219 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec42[0]))) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec43[0] + (-234881024 - ((iSlow263) ? _icast(5.9604645e-08 * _fcast(this.iRec43[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow264 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec50[0] + this.fRec51[0])))));
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

export class Dx7_alg16Channel extends MidiChannel {
    private _nrpnMsb: u8 = 127;
    private _nrpnLsb: u8 = 127;

    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case 99: this._nrpnMsb = value; break;
            case 98: this._nrpnLsb = value; break;
            case 6:
                this._setParam(<u16>this._nrpnMsb * 128 + <u16>this._nrpnLsb, value);
                break;
        }
    }

    private _setParam(param: u16, value: u8): void {
        switch (param) {
            case 0: dx7_alg16_fHslider126 = <f32>value / 127.0 * 7; break;
            case 1: dx7_alg16_fHslider2 = -24 + <f32>value / 127.0 * 48; break;
            case 2: dx7_alg16_fHslider22 = <f32>value / 127.0; break;
            case 3: dx7_alg16_fHslider27 = <f32>value / 127.0 * 99; break;
            case 4: dx7_alg16_fHslider30 = <f32>value / 127.0 * 99; break;
            case 5: dx7_alg16_fHslider31 = <f32>value / 127.0 * 99; break;
            case 6: dx7_alg16_fHslider26 = <f32>value / 127.0 * 99; break;
            case 7: dx7_alg16_fHslider29 = <f32>value / 127.0 * 99; break;
            case 8: dx7_alg16_fHslider32 = <f32>value / 127.0 * 99; break;
            case 9: dx7_alg16_fHslider33 = <f32>value / 127.0 * 99; break;
            case 10: dx7_alg16_fHslider28 = <f32>value / 127.0 * 99; break;
            case 11: dx7_alg16_fEntry2 = <f32>value / 127.0 * 5; break;
            case 12: dx7_alg16_fHslider20 = <f32>value / 127.0 * 99; break;
            case 13: dx7_alg16_fHslider21 = <f32>value / 127.0 * 99; break;
            case 14: dx7_alg16_fHslider34 = <f32>value / 127.0 * 99; break;
            case 15: dx7_alg16_fHslider18 = <f32>value / 127.0 * 99; break;
            case 16: dx7_alg16_fHslider19 = <f32>value / 127.0; break;
            case 17: dx7_alg16_fHslider35 = <f32>value / 127.0 * 7; break;
            case 18: dx7_alg16_fHslider23 = -7 + <f32>value / 127.0 * 14; break;
            case 19: dx7_alg16_fHslider24 = <f32>value / 127.0 * 31; break;
            case 20: dx7_alg16_fHslider25 = <f32>value / 127.0 * 99; break;
            case 21: dx7_alg16_fHslider0 = <f32>value / 127.0 * 99; break;
            case 22: dx7_alg16_fHslider13 = <f32>value / 127.0 * 99; break;
            case 23: dx7_alg16_fHslider14 = <f32>value / 127.0 * 99; break;
            case 24: dx7_alg16_fHslider11 = <f32>value / 127.0 * 99; break;
            case 25: dx7_alg16_fHslider9 = <f32>value / 127.0 * 99; break;
            case 26: dx7_alg16_fHslider15 = <f32>value / 127.0 * 99; break;
            case 27: dx7_alg16_fHslider16 = <f32>value / 127.0 * 99; break;
            case 28: dx7_alg16_fHslider12 = <f32>value / 127.0 * 99; break;
            case 29: dx7_alg16_fHslider1 = <f32>value / 127.0 * 99; break;
            case 30: dx7_alg16_fHslider7 = <f32>value / 127.0 * 7; break;
            case 31: dx7_alg16_fHslider17 = <f32>value / 127.0 * 3; break;
            case 32: dx7_alg16_fHslider10 = <f32>value / 127.0 * 7; break;
            case 33: dx7_alg16_fHslider4 = <f32>value / 127.0 * 99; break;
            case 34: dx7_alg16_fHslider5 = <f32>value / 127.0 * 99; break;
            case 35: dx7_alg16_fHslider6 = <f32>value / 127.0 * 99; break;
            case 36: dx7_alg16_fEntry0 = <f32>value / 127.0 * 3; break;
            case 37: dx7_alg16_fEntry1 = <f32>value / 127.0 * 3; break;
            case 38: dx7_alg16_fHslider51 = -7 + <f32>value / 127.0 * 14; break;
            case 39: dx7_alg16_fHslider52 = <f32>value / 127.0 * 31; break;
            case 40: dx7_alg16_fHslider53 = <f32>value / 127.0 * 99; break;
            case 41: dx7_alg16_fHslider36 = <f32>value / 127.0 * 99; break;
            case 42: dx7_alg16_fHslider46 = <f32>value / 127.0 * 99; break;
            case 43: dx7_alg16_fHslider47 = <f32>value / 127.0 * 99; break;
            case 44: dx7_alg16_fHslider44 = <f32>value / 127.0 * 99; break;
            case 45: dx7_alg16_fHslider42 = <f32>value / 127.0 * 99; break;
            case 46: dx7_alg16_fHslider48 = <f32>value / 127.0 * 99; break;
            case 47: dx7_alg16_fHslider49 = <f32>value / 127.0 * 99; break;
            case 48: dx7_alg16_fHslider45 = <f32>value / 127.0 * 99; break;
            case 49: dx7_alg16_fHslider37 = <f32>value / 127.0 * 99; break;
            case 50: dx7_alg16_fHslider41 = <f32>value / 127.0 * 7; break;
            case 51: dx7_alg16_fHslider50 = <f32>value / 127.0 * 3; break;
            case 52: dx7_alg16_fHslider43 = <f32>value / 127.0 * 7; break;
            case 53: dx7_alg16_fHslider38 = <f32>value / 127.0 * 99; break;
            case 54: dx7_alg16_fHslider39 = <f32>value / 127.0 * 99; break;
            case 55: dx7_alg16_fHslider40 = <f32>value / 127.0 * 99; break;
            case 56: dx7_alg16_fEntry3 = <f32>value / 127.0 * 3; break;
            case 57: dx7_alg16_fEntry4 = <f32>value / 127.0 * 3; break;
            case 58: dx7_alg16_fHslider69 = -7 + <f32>value / 127.0 * 14; break;
            case 59: dx7_alg16_fHslider70 = <f32>value / 127.0 * 31; break;
            case 60: dx7_alg16_fHslider71 = <f32>value / 127.0 * 99; break;
            case 61: dx7_alg16_fHslider54 = <f32>value / 127.0 * 99; break;
            case 62: dx7_alg16_fHslider64 = <f32>value / 127.0 * 99; break;
            case 63: dx7_alg16_fHslider65 = <f32>value / 127.0 * 99; break;
            case 64: dx7_alg16_fHslider62 = <f32>value / 127.0 * 99; break;
            case 65: dx7_alg16_fHslider60 = <f32>value / 127.0 * 99; break;
            case 66: dx7_alg16_fHslider66 = <f32>value / 127.0 * 99; break;
            case 67: dx7_alg16_fHslider67 = <f32>value / 127.0 * 99; break;
            case 68: dx7_alg16_fHslider63 = <f32>value / 127.0 * 99; break;
            case 69: dx7_alg16_fHslider55 = <f32>value / 127.0 * 99; break;
            case 70: dx7_alg16_fHslider59 = <f32>value / 127.0 * 7; break;
            case 71: dx7_alg16_fHslider68 = <f32>value / 127.0 * 3; break;
            case 72: dx7_alg16_fHslider61 = <f32>value / 127.0 * 7; break;
            case 73: dx7_alg16_fHslider56 = <f32>value / 127.0 * 99; break;
            case 74: dx7_alg16_fHslider57 = <f32>value / 127.0 * 99; break;
            case 75: dx7_alg16_fHslider58 = <f32>value / 127.0 * 99; break;
            case 76: dx7_alg16_fEntry5 = <f32>value / 127.0 * 3; break;
            case 77: dx7_alg16_fEntry6 = <f32>value / 127.0 * 3; break;
            case 78: dx7_alg16_fHslider87 = -7 + <f32>value / 127.0 * 14; break;
            case 79: dx7_alg16_fHslider88 = <f32>value / 127.0 * 31; break;
            case 80: dx7_alg16_fHslider89 = <f32>value / 127.0 * 99; break;
            case 81: dx7_alg16_fHslider72 = <f32>value / 127.0 * 99; break;
            case 82: dx7_alg16_fHslider82 = <f32>value / 127.0 * 99; break;
            case 83: dx7_alg16_fHslider83 = <f32>value / 127.0 * 99; break;
            case 84: dx7_alg16_fHslider80 = <f32>value / 127.0 * 99; break;
            case 85: dx7_alg16_fHslider78 = <f32>value / 127.0 * 99; break;
            case 86: dx7_alg16_fHslider84 = <f32>value / 127.0 * 99; break;
            case 87: dx7_alg16_fHslider85 = <f32>value / 127.0 * 99; break;
            case 88: dx7_alg16_fHslider81 = <f32>value / 127.0 * 99; break;
            case 89: dx7_alg16_fHslider73 = <f32>value / 127.0 * 99; break;
            case 90: dx7_alg16_fHslider77 = <f32>value / 127.0 * 7; break;
            case 91: dx7_alg16_fHslider86 = <f32>value / 127.0 * 3; break;
            case 92: dx7_alg16_fHslider79 = <f32>value / 127.0 * 7; break;
            case 93: dx7_alg16_fHslider74 = <f32>value / 127.0 * 99; break;
            case 94: dx7_alg16_fHslider75 = <f32>value / 127.0 * 99; break;
            case 95: dx7_alg16_fHslider76 = <f32>value / 127.0 * 99; break;
            case 96: dx7_alg16_fEntry7 = <f32>value / 127.0 * 3; break;
            case 97: dx7_alg16_fEntry8 = <f32>value / 127.0 * 3; break;
            case 98: dx7_alg16_fHslider105 = -7 + <f32>value / 127.0 * 14; break;
            case 99: dx7_alg16_fHslider106 = <f32>value / 127.0 * 31; break;
            case 100: dx7_alg16_fHslider107 = <f32>value / 127.0 * 99; break;
            case 101: dx7_alg16_fHslider90 = <f32>value / 127.0 * 99; break;
            case 102: dx7_alg16_fHslider100 = <f32>value / 127.0 * 99; break;
            case 103: dx7_alg16_fHslider101 = <f32>value / 127.0 * 99; break;
            case 104: dx7_alg16_fHslider98 = <f32>value / 127.0 * 99; break;
            case 105: dx7_alg16_fHslider96 = <f32>value / 127.0 * 99; break;
            case 106: dx7_alg16_fHslider102 = <f32>value / 127.0 * 99; break;
            case 107: dx7_alg16_fHslider103 = <f32>value / 127.0 * 99; break;
            case 108: dx7_alg16_fHslider99 = <f32>value / 127.0 * 99; break;
            case 109: dx7_alg16_fHslider91 = <f32>value / 127.0 * 99; break;
            case 110: dx7_alg16_fHslider95 = <f32>value / 127.0 * 7; break;
            case 111: dx7_alg16_fHslider104 = <f32>value / 127.0 * 3; break;
            case 112: dx7_alg16_fHslider97 = <f32>value / 127.0 * 7; break;
            case 113: dx7_alg16_fHslider92 = <f32>value / 127.0 * 99; break;
            case 114: dx7_alg16_fHslider93 = <f32>value / 127.0 * 99; break;
            case 115: dx7_alg16_fHslider94 = <f32>value / 127.0 * 99; break;
            case 116: dx7_alg16_fEntry9 = <f32>value / 127.0 * 3; break;
            case 117: dx7_alg16_fEntry10 = <f32>value / 127.0 * 3; break;
            case 118: dx7_alg16_fHslider123 = -7 + <f32>value / 127.0 * 14; break;
            case 119: dx7_alg16_fHslider124 = <f32>value / 127.0 * 31; break;
            case 120: dx7_alg16_fHslider125 = <f32>value / 127.0 * 99; break;
            case 121: dx7_alg16_fHslider108 = <f32>value / 127.0 * 99; break;
            case 122: dx7_alg16_fHslider118 = <f32>value / 127.0 * 99; break;
            case 123: dx7_alg16_fHslider119 = <f32>value / 127.0 * 99; break;
            case 124: dx7_alg16_fHslider116 = <f32>value / 127.0 * 99; break;
            case 125: dx7_alg16_fHslider114 = <f32>value / 127.0 * 99; break;
            case 126: dx7_alg16_fHslider120 = <f32>value / 127.0 * 99; break;
            case 127: dx7_alg16_fHslider121 = <f32>value / 127.0 * 99; break;
            case 128: dx7_alg16_fHslider117 = <f32>value / 127.0 * 99; break;
            case 129: dx7_alg16_fHslider109 = <f32>value / 127.0 * 99; break;
            case 130: dx7_alg16_fHslider113 = <f32>value / 127.0 * 7; break;
            case 131: dx7_alg16_fHslider122 = <f32>value / 127.0 * 3; break;
            case 132: dx7_alg16_fHslider115 = <f32>value / 127.0 * 7; break;
            case 133: dx7_alg16_fHslider110 = <f32>value / 127.0 * 99; break;
            case 134: dx7_alg16_fHslider111 = <f32>value / 127.0 * 99; break;
            case 135: dx7_alg16_fHslider112 = <f32>value / 127.0 * 99; break;
            case 136: dx7_alg16_fEntry11 = <f32>value / 127.0 * 3; break;
            case 137: dx7_alg16_fEntry12 = <f32>value / 127.0 * 3; break;
        }
    }
}

// Feedback (NRPN 0)
let dx7_alg2_fHslider54: f32 = 0;
// Transpose (NRPN 1)
let dx7_alg2_fHslider2: f32 = 0;
// Osc Key Sync (NRPN 2)
let dx7_alg2_fHslider22: f32 = 1;
// L1 (NRPN 3)
let dx7_alg2_fHslider27: f32 = 50;
// L2 (NRPN 4)
let dx7_alg2_fHslider30: f32 = 50;
// L3 (NRPN 5)
let dx7_alg2_fHslider31: f32 = 50;
// L4 (NRPN 6)
let dx7_alg2_fHslider26: f32 = 50;
// R1 (NRPN 7)
let dx7_alg2_fHslider29: f32 = 99;
// R2 (NRPN 8)
let dx7_alg2_fHslider32: f32 = 99;
// R3 (NRPN 9)
let dx7_alg2_fHslider33: f32 = 99;
// R4 (NRPN 10)
let dx7_alg2_fHslider28: f32 = 99;
// Wave (NRPN 11)
let dx7_alg2_fEntry2: f32 = 0;
// Speed (NRPN 12)
let dx7_alg2_fHslider20: f32 = 35;
// Delay (NRPN 13)
let dx7_alg2_fHslider21: f32 = 0;
// PMD (NRPN 14)
let dx7_alg2_fHslider34: f32 = 0;
// AMD (NRPN 15)
let dx7_alg2_fHslider18: f32 = 0;
// Sync (NRPN 16)
let dx7_alg2_fHslider19: f32 = 1;
// P Mod Sens (NRPN 17)
let dx7_alg2_fHslider35: f32 = 3;
// Tune (NRPN 18)
let dx7_alg2_fHslider23: f32 = 0;
// Coarse (NRPN 19)
let dx7_alg2_fHslider24: f32 = 1;
// Fine (NRPN 20)
let dx7_alg2_fHslider25: f32 = 0;
// L1 (NRPN 21)
let dx7_alg2_fHslider0: f32 = 99;
// L2 (NRPN 22)
let dx7_alg2_fHslider13: f32 = 99;
// L3 (NRPN 23)
let dx7_alg2_fHslider14: f32 = 99;
// L4 (NRPN 24)
let dx7_alg2_fHslider11: f32 = 0;
// R1 (NRPN 25)
let dx7_alg2_fHslider9: f32 = 99;
// R2 (NRPN 26)
let dx7_alg2_fHslider15: f32 = 99;
// R3 (NRPN 27)
let dx7_alg2_fHslider16: f32 = 99;
// R4 (NRPN 28)
let dx7_alg2_fHslider12: f32 = 99;
// Level (NRPN 29)
let dx7_alg2_fHslider1: f32 = 99;
// Key Vel (NRPN 30)
let dx7_alg2_fHslider7: f32 = 0;
// A Mod Sens (NRPN 31)
let dx7_alg2_fHslider17: f32 = 0;
// Rate Scaling (NRPN 32)
let dx7_alg2_fHslider10: f32 = 0;
// Breakpoint (NRPN 33)
let dx7_alg2_fHslider4: f32 = 0;
// L Depth (NRPN 34)
let dx7_alg2_fHslider5: f32 = 0;
// R Depth (NRPN 35)
let dx7_alg2_fHslider6: f32 = 0;
// L Curve (NRPN 36)
let dx7_alg2_fEntry0: f32 = 0;
// R Curve (NRPN 37)
let dx7_alg2_fEntry1: f32 = 0;
// Tune (NRPN 38)
let dx7_alg2_fHslider51: f32 = 0;
// Coarse (NRPN 39)
let dx7_alg2_fHslider52: f32 = 1;
// Fine (NRPN 40)
let dx7_alg2_fHslider53: f32 = 0;
// L1 (NRPN 41)
let dx7_alg2_fHslider36: f32 = 99;
// L2 (NRPN 42)
let dx7_alg2_fHslider46: f32 = 99;
// L3 (NRPN 43)
let dx7_alg2_fHslider47: f32 = 99;
// L4 (NRPN 44)
let dx7_alg2_fHslider44: f32 = 0;
// R1 (NRPN 45)
let dx7_alg2_fHslider42: f32 = 99;
// R2 (NRPN 46)
let dx7_alg2_fHslider48: f32 = 99;
// R3 (NRPN 47)
let dx7_alg2_fHslider49: f32 = 99;
// R4 (NRPN 48)
let dx7_alg2_fHslider45: f32 = 99;
// Level (NRPN 49)
let dx7_alg2_fHslider37: f32 = 0;
// Key Vel (NRPN 50)
let dx7_alg2_fHslider41: f32 = 0;
// A Mod Sens (NRPN 51)
let dx7_alg2_fHslider50: f32 = 0;
// Rate Scaling (NRPN 52)
let dx7_alg2_fHslider43: f32 = 0;
// Breakpoint (NRPN 53)
let dx7_alg2_fHslider38: f32 = 0;
// L Depth (NRPN 54)
let dx7_alg2_fHslider39: f32 = 0;
// R Depth (NRPN 55)
let dx7_alg2_fHslider40: f32 = 0;
// L Curve (NRPN 56)
let dx7_alg2_fEntry3: f32 = 0;
// R Curve (NRPN 57)
let dx7_alg2_fEntry4: f32 = 0;
// Tune (NRPN 58)
let dx7_alg2_fHslider70: f32 = 0;
// Coarse (NRPN 59)
let dx7_alg2_fHslider71: f32 = 1;
// Fine (NRPN 60)
let dx7_alg2_fHslider72: f32 = 0;
// L1 (NRPN 61)
let dx7_alg2_fHslider55: f32 = 99;
// L2 (NRPN 62)
let dx7_alg2_fHslider65: f32 = 99;
// L3 (NRPN 63)
let dx7_alg2_fHslider66: f32 = 99;
// L4 (NRPN 64)
let dx7_alg2_fHslider63: f32 = 0;
// R1 (NRPN 65)
let dx7_alg2_fHslider61: f32 = 99;
// R2 (NRPN 66)
let dx7_alg2_fHslider67: f32 = 99;
// R3 (NRPN 67)
let dx7_alg2_fHslider68: f32 = 99;
// R4 (NRPN 68)
let dx7_alg2_fHslider64: f32 = 99;
// Level (NRPN 69)
let dx7_alg2_fHslider56: f32 = 0;
// Key Vel (NRPN 70)
let dx7_alg2_fHslider60: f32 = 0;
// A Mod Sens (NRPN 71)
let dx7_alg2_fHslider69: f32 = 0;
// Rate Scaling (NRPN 72)
let dx7_alg2_fHslider62: f32 = 0;
// Breakpoint (NRPN 73)
let dx7_alg2_fHslider57: f32 = 0;
// L Depth (NRPN 74)
let dx7_alg2_fHslider58: f32 = 0;
// R Depth (NRPN 75)
let dx7_alg2_fHslider59: f32 = 0;
// L Curve (NRPN 76)
let dx7_alg2_fEntry5: f32 = 0;
// R Curve (NRPN 77)
let dx7_alg2_fEntry6: f32 = 0;
// Tune (NRPN 78)
let dx7_alg2_fHslider88: f32 = 0;
// Coarse (NRPN 79)
let dx7_alg2_fHslider89: f32 = 1;
// Fine (NRPN 80)
let dx7_alg2_fHslider90: f32 = 0;
// L1 (NRPN 81)
let dx7_alg2_fHslider73: f32 = 99;
// L2 (NRPN 82)
let dx7_alg2_fHslider83: f32 = 99;
// L3 (NRPN 83)
let dx7_alg2_fHslider84: f32 = 99;
// L4 (NRPN 84)
let dx7_alg2_fHslider81: f32 = 0;
// R1 (NRPN 85)
let dx7_alg2_fHslider79: f32 = 99;
// R2 (NRPN 86)
let dx7_alg2_fHslider85: f32 = 99;
// R3 (NRPN 87)
let dx7_alg2_fHslider86: f32 = 99;
// R4 (NRPN 88)
let dx7_alg2_fHslider82: f32 = 99;
// Level (NRPN 89)
let dx7_alg2_fHslider74: f32 = 0;
// Key Vel (NRPN 90)
let dx7_alg2_fHslider78: f32 = 0;
// A Mod Sens (NRPN 91)
let dx7_alg2_fHslider87: f32 = 0;
// Rate Scaling (NRPN 92)
let dx7_alg2_fHslider80: f32 = 0;
// Breakpoint (NRPN 93)
let dx7_alg2_fHslider75: f32 = 0;
// L Depth (NRPN 94)
let dx7_alg2_fHslider76: f32 = 0;
// R Depth (NRPN 95)
let dx7_alg2_fHslider77: f32 = 0;
// L Curve (NRPN 96)
let dx7_alg2_fEntry7: f32 = 0;
// R Curve (NRPN 97)
let dx7_alg2_fEntry8: f32 = 0;
// Tune (NRPN 98)
let dx7_alg2_fHslider106: f32 = 0;
// Coarse (NRPN 99)
let dx7_alg2_fHslider107: f32 = 1;
// Fine (NRPN 100)
let dx7_alg2_fHslider108: f32 = 0;
// L1 (NRPN 101)
let dx7_alg2_fHslider91: f32 = 99;
// L2 (NRPN 102)
let dx7_alg2_fHslider101: f32 = 99;
// L3 (NRPN 103)
let dx7_alg2_fHslider102: f32 = 99;
// L4 (NRPN 104)
let dx7_alg2_fHslider99: f32 = 0;
// R1 (NRPN 105)
let dx7_alg2_fHslider97: f32 = 99;
// R2 (NRPN 106)
let dx7_alg2_fHslider103: f32 = 99;
// R3 (NRPN 107)
let dx7_alg2_fHslider104: f32 = 99;
// R4 (NRPN 108)
let dx7_alg2_fHslider100: f32 = 99;
// Level (NRPN 109)
let dx7_alg2_fHslider92: f32 = 0;
// Key Vel (NRPN 110)
let dx7_alg2_fHslider96: f32 = 0;
// A Mod Sens (NRPN 111)
let dx7_alg2_fHslider105: f32 = 0;
// Rate Scaling (NRPN 112)
let dx7_alg2_fHslider98: f32 = 0;
// Breakpoint (NRPN 113)
let dx7_alg2_fHslider93: f32 = 0;
// L Depth (NRPN 114)
let dx7_alg2_fHslider94: f32 = 0;
// R Depth (NRPN 115)
let dx7_alg2_fHslider95: f32 = 0;
// L Curve (NRPN 116)
let dx7_alg2_fEntry9: f32 = 0;
// R Curve (NRPN 117)
let dx7_alg2_fEntry10: f32 = 0;
// Tune (NRPN 118)
let dx7_alg2_fHslider124: f32 = 0;
// Coarse (NRPN 119)
let dx7_alg2_fHslider125: f32 = 1;
// Fine (NRPN 120)
let dx7_alg2_fHslider126: f32 = 0;
// L1 (NRPN 121)
let dx7_alg2_fHslider109: f32 = 99;
// L2 (NRPN 122)
let dx7_alg2_fHslider119: f32 = 99;
// L3 (NRPN 123)
let dx7_alg2_fHslider120: f32 = 99;
// L4 (NRPN 124)
let dx7_alg2_fHslider117: f32 = 0;
// R1 (NRPN 125)
let dx7_alg2_fHslider115: f32 = 99;
// R2 (NRPN 126)
let dx7_alg2_fHslider121: f32 = 99;
// R3 (NRPN 127)
let dx7_alg2_fHslider122: f32 = 99;
// R4 (NRPN 128)
let dx7_alg2_fHslider118: f32 = 99;
// Level (NRPN 129)
let dx7_alg2_fHslider110: f32 = 0;
// Key Vel (NRPN 130)
let dx7_alg2_fHslider114: f32 = 0;
// A Mod Sens (NRPN 131)
let dx7_alg2_fHslider123: f32 = 0;
// Rate Scaling (NRPN 132)
let dx7_alg2_fHslider116: f32 = 0;
// Breakpoint (NRPN 133)
let dx7_alg2_fHslider111: f32 = 0;
// L Depth (NRPN 134)
let dx7_alg2_fHslider112: f32 = 0;
// R Depth (NRPN 135)
let dx7_alg2_fHslider113: f32 = 0;
// L Curve (NRPN 136)
let dx7_alg2_fEntry11: f32 = 0;
// R Curve (NRPN 137)
let dx7_alg2_fEntry12: f32 = 0;

const Dx7_alg2_wave_SIG0Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 5, 9, 13, 17, 20, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 42, 43, 45, 46]);
const Dx7_alg2_wave_SIG1Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14, 16, 19, 23, 27, 33, 39, 47, 56, 66, 80, 94, 110, 126, 142, 158, 174, 190, 206, 222, 238, 250]);
const Dx7_alg2_wave_SIG2Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 70, 86, 97, 106, 114, 121, 126, 132, 138, 142, 148, 152, 156, 160, 163, 166, 170, 173, 174, 178, 181, 184, 186, 189, 190, 194, 196, 198, 200, 202, 205, 206, 209, 211, 214, 216, 218, 220, 222, 224, 225, 227, 229, 230, 232, 233, 235, 237, 238, 240, 241, 242, 243, 244, 246, 246, 248, 249, 250, 251, 252, 253, 254]);
const Dx7_alg2_wave_SIG3Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1764000, 1764000, 1411200, 1411200, 1190700, 1014300, 992250, 882000, 705600, 705600, 584325, 507150, 502740, 441000, 418950, 352800, 308700, 286650, 253575, 220500, 220500, 176400, 145530, 145530, 125685, 110250, 110250, 88200, 88200, 74970, 61740, 61740, 55125, 48510, 44100, 37485, 31311, 30870, 27562, 27562, 22050, 18522, 17640, 15435, 14112, 13230, 11025, 9261, 9261, 7717, 6615, 6615, 5512, 5512, 4410, 3969, 3969, 3439, 2866, 2690, 2249, 1984, 1896, 1808, 1411, 1367, 1234, 1146, 926, 837, 837, 705, 573, 573, 529, 441, 441]);
const Dx7_alg2_wave_SIG4Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 4342338, 7171437, 16777216]);
const Dx7_alg2_wave_SIG5Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-16777216, 0, 16777216, 26591258, 33554432, 38955489, 43368474, 47099600, 50331648, 53182516, 55732705, 58039632, 60145690, 62083076, 63876816, 65546747, 67108864, 68576247, 69959732, 71268397, 72509921, 73690858, 74816848, 75892776, 76922906, 77910978, 78860292, 79773775, 80654032, 81503396, 82323963, 83117622]);
const Dx7_alg2_wave_SIG6Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-128, -116, -104, -95, -85, -76, -68, -61, -56, -52, -49, -46, -43, -41, -39, -37, -35, -33, -32, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 38, 40, 43, 46, 49, 53, 58, 65, 73, 82, 92, 103, 115, 127]);
const Dx7_alg2_wave_SIG7Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 33, 34, 36, 37, 38, 39, 41, 42, 44, 46, 47, 49, 51, 53, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 79, 82, 85, 88, 91, 94, 98, 102, 106, 110, 115, 120, 125, 130, 135, 141, 147, 153, 159, 165, 171, 178, 185, 193, 202, 211, 232, 243, 254, 255]);
const Dx7_alg2_wave_SIG8Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 10, 20, 33, 55, 92, 153, 255]);

const Dx7_alg2_itbl0SIG0: StaticArray<i32> = new StaticArray<i32>(20);
const Dx7_alg2_itbl1SIG1: StaticArray<i32> = new StaticArray<i32>(33);
const Dx7_alg2_itbl2SIG2: StaticArray<i32> = new StaticArray<i32>(64);
const Dx7_alg2_itbl3SIG3: StaticArray<i32> = new StaticArray<i32>(77);
const Dx7_alg2_itbl4SIG4: StaticArray<i32> = new StaticArray<i32>(4);
const Dx7_alg2_itbl5SIG5: StaticArray<i32> = new StaticArray<i32>(32);
const Dx7_alg2_itbl6SIG6: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg2_itbl7SIG7: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg2_itbl8SIG8: StaticArray<i32> = new StaticArray<i32>(8);
let _Dx7_alg2_sig0_initialized: bool = false;

function _Dx7_alg2_initSIG0Tables(): void {
    if (_Dx7_alg2_sig0_initialized) return;
    _Dx7_alg2_sig0_initialized = true;
    let sig0_iDx7_alg2SIG0Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg2_itbl0SIG0.length; i++) {
        Dx7_alg2_itbl0SIG0[i] = Dx7_alg2_wave_SIG0Wave0[sig0_iDx7_alg2SIG0Wave0_idx];
        sig0_iDx7_alg2SIG0Wave0_idx = (1 + sig0_iDx7_alg2SIG0Wave0_idx) % 20;
    }
    let sig1_iDx7_alg2SIG1Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg2_itbl1SIG1.length; i++) {
        Dx7_alg2_itbl1SIG1[i] = Dx7_alg2_wave_SIG1Wave0[sig1_iDx7_alg2SIG1Wave0_idx];
        sig1_iDx7_alg2SIG1Wave0_idx = (1 + sig1_iDx7_alg2SIG1Wave0_idx) % 33;
    }
    let sig2_iDx7_alg2SIG2Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg2_itbl2SIG2.length; i++) {
        Dx7_alg2_itbl2SIG2[i] = Dx7_alg2_wave_SIG2Wave0[sig2_iDx7_alg2SIG2Wave0_idx];
        sig2_iDx7_alg2SIG2Wave0_idx = (1 + sig2_iDx7_alg2SIG2Wave0_idx) % 64;
    }
    let sig3_iDx7_alg2SIG3Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg2_itbl3SIG3.length; i++) {
        Dx7_alg2_itbl3SIG3[i] = Dx7_alg2_wave_SIG3Wave0[sig3_iDx7_alg2SIG3Wave0_idx];
        sig3_iDx7_alg2SIG3Wave0_idx = (1 + sig3_iDx7_alg2SIG3Wave0_idx) % 77;
    }
    let sig4_iDx7_alg2SIG4Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg2_itbl4SIG4.length; i++) {
        Dx7_alg2_itbl4SIG4[i] = Dx7_alg2_wave_SIG4Wave0[sig4_iDx7_alg2SIG4Wave0_idx];
        sig4_iDx7_alg2SIG4Wave0_idx = (1 + sig4_iDx7_alg2SIG4Wave0_idx) % 4;
    }
    let sig5_iDx7_alg2SIG5Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg2_itbl5SIG5.length; i++) {
        Dx7_alg2_itbl5SIG5[i] = Dx7_alg2_wave_SIG5Wave0[sig5_iDx7_alg2SIG5Wave0_idx];
        sig5_iDx7_alg2SIG5Wave0_idx = (1 + sig5_iDx7_alg2SIG5Wave0_idx) % 32;
    }
    let sig6_iDx7_alg2SIG6Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg2_itbl6SIG6.length; i++) {
        Dx7_alg2_itbl6SIG6[i] = Dx7_alg2_wave_SIG6Wave0[sig6_iDx7_alg2SIG6Wave0_idx];
        sig6_iDx7_alg2SIG6Wave0_idx = (1 + sig6_iDx7_alg2SIG6Wave0_idx) % 100;
    }
    let sig7_iDx7_alg2SIG7Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg2_itbl7SIG7.length; i++) {
        Dx7_alg2_itbl7SIG7[i] = Dx7_alg2_wave_SIG7Wave0[sig7_iDx7_alg2SIG7Wave0_idx];
        sig7_iDx7_alg2SIG7Wave0_idx = (1 + sig7_iDx7_alg2SIG7Wave0_idx) % 100;
    }
    let sig8_iDx7_alg2SIG8Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg2_itbl8SIG8.length; i++) {
        Dx7_alg2_itbl8SIG8[i] = Dx7_alg2_wave_SIG8Wave0[sig8_iDx7_alg2SIG8Wave0_idx];
        sig8_iDx7_alg2SIG8Wave0_idx = (1 + sig8_iDx7_alg2SIG8Wave0_idx) % 8;
    }
}

export class Dx7_alg2 extends MidiVoice {
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
    private iRec20: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec21: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec22: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec23: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec24: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec25: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec26: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox1: f32 = 0;
    private fRec27: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec19: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec28: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec29: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec30: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec31: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec32: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec33: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec34: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox2: f32 = 0;
    private fRec35: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec36: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec37: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec38: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec39: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec40: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec41: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec42: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox3: f32 = 0;
    private fRec43: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec44: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec45: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec46: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec47: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec48: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec49: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec50: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox4: f32 = 0;
    private fRec51: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec52: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec53: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec54: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec55: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec56: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec57: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec58: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox5: f32 = 0;
    private fRec59: StaticArray<f32> = new StaticArray<f32>(2);
    private silentSamples: i32 = 0;

    constructor(channel: MidiChannel) {
        super(channel);
        _Dx7_alg2_initSIG0Tables();
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
        for (let i = 0; i < 2; i++) { this.iRec20[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec21[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec22[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec23[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec24[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec25[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec26[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec27[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec19[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec28[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec29[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec30[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec31[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec32[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec33[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec34[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec35[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec36[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec37[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec38[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec39[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec40[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec41[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec42[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec43[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec44[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec45[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec46[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec47[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec48[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec49[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec50[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec51[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec52[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec53[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec54[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec55[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec56[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec57[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec58[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec59[i] = 0.0; }
    }

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.fHslider3 = notefreq(note);
        this.fHslider8 = <f32>velocity / 127.0;
        this.fButton0 = 0.0;
        this.nextframe();
        this.fButton0 = 1.0;
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
        const fSlow1: f32 = Mathf.round(_fcast(dx7_alg2_fHslider0));
        const fSlow2: f32 = Mathf.round(_fcast(dx7_alg2_fHslider1));
        const fSlow3: f32 = Mathf.pow(2.0, 0.083333336 * (Mathf.round(_fcast(dx7_alg2_fHslider2)) + 17.31234 * Mathf.log(0.0022727272 * _fcast(this.fHslider3))));
        const fSlow4: f32 = Mathf.round(17.31234 * Mathf.log(fSlow3) + 69.0);
        const fSlow5: f32 = Mathf.round(_fcast(dx7_alg2_fHslider4));
        const fSlow6: f32 = Mathf.round(_fcast(dx7_alg2_fEntry0));
        const fSlow7: f32 = Mathf.round(_fcast(dx7_alg2_fHslider5));
        const fSlow8: f32 = fSlow4 + (-18.0 - fSlow5);
        const iSlow9: i32 = (((fSlow6 == 0.0 ? 1 : 0) | (fSlow6 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow7 * fSlow8)) >> 12 : _icast(329.0 * fSlow7 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow8))), 32))])) >> 15);
        const fSlow10: f32 = Mathf.round(_fcast(dx7_alg2_fEntry1));
        const fSlow11: f32 = Mathf.round(_fcast(dx7_alg2_fHslider6));
        const fSlow12: f32 = fSlow4 + (-16.0 - fSlow5);
        const iSlow13: i32 = (((fSlow10 == 0.0 ? 1 : 0) | (fSlow10 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow11 * fSlow12) >> 12 : _icast(329.0 * fSlow11 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow12)), 32))])) >> 15);
        const fSlow14: f32 = _fcast(Dx7_alg2_itbl2SIG2[_icast(Mathf.round(_fcast(_icast(Mathf.max(0.0, Mathf.min(127.0, 127.0 * _fcast(this.fHslider8)))) >> 1)))] + -239);
        const fSlow15: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow2 >= 2e+01 ? 1 : 0) ? fSlow2 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow2)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow5)) >= 0.0) ? ((fSlow10 < 2.0 ? 1 : 0) ? -iSlow13 : iSlow13) : ((fSlow6 < 2.0 ? 1 : 0) ? -iSlow9 : iSlow9)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg2_fHslider7)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow16: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow1 >= 2e+01 ? 1 : 0) ? fSlow1 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow1)), 19))]))) >> 1) << 6) + fSlow15 + -4256.0)) << 16;
        const iSlow17: i32 = fSlow1 == 0.0;
        const fSlow18: f32 = Mathf.round(_fcast(dx7_alg2_fHslider9));
        const fSlow19: f32 = Mathf.round(_fcast(dx7_alg2_fHslider10));
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
        const fSlow31: f32 = ((iSlow30) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow29)), 76))]) : 2e+01 * (99.0 - fSlow29));
        const iSlow32: i32 = (((iSlow16 == 0 ? 1 : 0) | iSlow17) ? _icast(this.fConst1 * ((iSlow30 & iSlow17) ? 0.05 * fSlow31 : fSlow31)) : 0);
        const fSlow33: f32 = Mathf.round(_fcast(dx7_alg2_fHslider11));
        const iSlow34: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fSlow33 >= 2e+01 ? 1 : 0) ? fSlow33 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow33)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow35: f32 = Mathf.round(_fcast(dx7_alg2_fHslider12));
        const fSlow36: f32 = Mathf.min(fSlow35 + fSlow28, 99.0);
        const iSlow37: i32 = _icast(this.fConst1 * ((fSlow36 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow36)), 76))]) : 2e+01 * (99.0 - fSlow36)));
        const fSlow38: f32 = Mathf.round(_fcast(dx7_alg2_fHslider13));
        const fSlow39: f32 = Mathf.round(_fcast(dx7_alg2_fHslider14));
        const fSlow40: f32 = Mathf.round(_fcast(dx7_alg2_fHslider15));
        const fSlow41: f32 = Mathf.round(_fcast(dx7_alg2_fHslider16));
        const iSlow42: i32 = iSlow16 > 0;
        const iSlow43: i32 = min<i32>(63, ((41 * _icast(fSlow18)) >> 6) + iSlow27);
        const iSlow44: i32 = _icast(this.fConst1 * _fcast(((iSlow43 & 3) + 4) << ((iSlow43 >> 2) + 2)));
        const iSlow45: i32 = min<i32>(63, ((41 * _icast(fSlow35)) >> 6) + iSlow27);
        const iSlow46: i32 = _icast(this.fConst1 * _fcast(((iSlow45 & 3) + 4) << ((iSlow45 >> 2) + 2)));
        const iSlow47: i32 = Dx7_alg2_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg2_fHslider17))))];
        const iSlow48: i32 = iSlow47 != 0;
        const fSlow49: f32 = 2.6972606e-09 * Mathf.round(_fcast(dx7_alg2_fHslider18));
        const iSlow50: i32 = _icast(Mathf.round(_fcast(dx7_alg2_fHslider19)));
        const fSlow51: f32 = Mathf.round(_fcast(dx7_alg2_fHslider20));
        const fSlow52: f32 = this.fConst2 * (((0.01010101 * fSlow51) <= 0.656566) ? 0.15806305 * fSlow51 + 0.036478 : 1.100254 * fSlow51 + -61.205933);
        const fSlow53: f32 = 99.0 - Mathf.round(_fcast(dx7_alg2_fHslider21));
        const iSlow54: i32 = (fSlow53 == 99.0 ? 1 : 0) >= 1;
        const iSlow55: i32 = _icast(fSlow53);
        const iSlow56: i32 = ((iSlow55 & 15) + 16) << ((iSlow55 >> 4) + 1);
        const fSlow57: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(max<i32>(iSlow56 & 65408, 128)));
        const fSlow58: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(iSlow56));
        const fSlow59: f32 = Mathf.round(_fcast(dx7_alg2_fEntry2));
        const iSlow60: i32 = fSlow59 >= 3.0;
        const iSlow61: i32 = fSlow59 >= 5.0;
        const iSlow62: i32 = fSlow59 >= 2.0;
        const iSlow63: i32 = fSlow59 >= 1.0;
        const iSlow64: i32 = fSlow59 >= 4.0;
        const fSlow65: f32 = _fcast(iSlow47);
        const iSlow66: i32 = _icast(Mathf.round(_fcast(dx7_alg2_fHslider22)));
        const iSlow67: i32 = _icast(Mathf.round(_fcast(this.fCheckbox0)));
        const fSlow68: f32 = Mathf.log(4.4e+02 * fSlow3);
        const fSlow69: f32 = Mathf.round(_fcast(dx7_alg2_fHslider23));
        const fSlow70: f32 = Mathf.exp(-0.57130724 * fSlow68);
        const iSlow71: i32 = _icast(Mathf.round(_fcast(dx7_alg2_fHslider24)));
        const fSlow72: f32 = Mathf.round(_fcast(dx7_alg2_fHslider25));
        const fSlow73: f32 = ((iSlow67) ? _fcast(_icast(4458616.0 * (fSlow72 + _fcast(100 * (iSlow71 & 3)))) >> 3) + ((fSlow69 > 0.0 ? 1 : 0) ? 13457.0 * fSlow69 : 0.0) : fSlow68 * (72267.445 * fSlow69 * fSlow70 + 24204406.0) + _fcast(Dx7_alg2_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow71 & 31)))]) + _fcast(((_icast(fSlow72)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow72 + 1.0) + 0.5)) : 0)));
        const fSlow74: f32 = Mathf.round(_fcast(dx7_alg2_fHslider26));
        const iSlow75: i32 = Dx7_alg2_itbl6SIG6[_icast(Mathf.round(fSlow74))];
        const fSlow76: f32 = _fcast(iSlow75);
        const fSlow77: f32 = Mathf.round(_fcast(dx7_alg2_fHslider27));
        const iSlow78: i32 = Dx7_alg2_itbl6SIG6[_icast(Mathf.round(fSlow77))];
        const iSlow79: i32 = iSlow78 > iSlow75;
        const fSlow80: f32 = Mathf.round(_fcast(dx7_alg2_fHslider28));
        const fSlow81: f32 = this.fConst4 * _fcast(Dx7_alg2_itbl7SIG7[_icast(Mathf.round(fSlow80))]);
        const fSlow82: f32 = Mathf.round(_fcast(dx7_alg2_fHslider29));
        const fSlow83: f32 = this.fConst4 * _fcast(Dx7_alg2_itbl7SIG7[_icast(Mathf.round(fSlow82))]);
        const fSlow84: f32 = Mathf.round(_fcast(dx7_alg2_fHslider30));
        const fSlow85: f32 = Mathf.round(_fcast(dx7_alg2_fHslider31));
        const fSlow86: f32 = Mathf.round(_fcast(dx7_alg2_fHslider32));
        const fSlow87: f32 = Mathf.round(_fcast(dx7_alg2_fHslider33));
        const fSlow88: f32 = 7.891414e-05 * Mathf.round(_fcast(dx7_alg2_fHslider34));
        const fSlow89: f32 = _fcast(Dx7_alg2_itbl8SIG8[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg2_fHslider35))))]);
        const fSlow90: f32 = Mathf.round(_fcast(dx7_alg2_fHslider36));
        const fSlow91: f32 = Mathf.round(_fcast(dx7_alg2_fHslider37));
        const fSlow92: f32 = Mathf.round(_fcast(dx7_alg2_fHslider38));
        const fSlow93: f32 = Mathf.round(_fcast(dx7_alg2_fEntry3));
        const fSlow94: f32 = Mathf.round(_fcast(dx7_alg2_fHslider39));
        const fSlow95: f32 = fSlow4 + (-18.0 - fSlow92);
        const iSlow96: i32 = (((fSlow93 == 0.0 ? 1 : 0) | (fSlow93 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow94 * fSlow95)) >> 12 : _icast(329.0 * fSlow94 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow95))), 32))])) >> 15);
        const fSlow97: f32 = Mathf.round(_fcast(dx7_alg2_fEntry4));
        const fSlow98: f32 = Mathf.round(_fcast(dx7_alg2_fHslider40));
        const fSlow99: f32 = fSlow4 + (-16.0 - fSlow92);
        const iSlow100: i32 = (((fSlow97 == 0.0 ? 1 : 0) | (fSlow97 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow98 * fSlow99) >> 12 : _icast(329.0 * fSlow98 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow99)), 32))])) >> 15);
        const fSlow101: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow91 >= 2e+01 ? 1 : 0) ? fSlow91 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow91)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow92)) >= 0.0) ? ((fSlow97 < 2.0 ? 1 : 0) ? -iSlow100 : iSlow100) : ((fSlow93 < 2.0 ? 1 : 0) ? -iSlow96 : iSlow96)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg2_fHslider41)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow102: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow90 >= 2e+01 ? 1 : 0) ? fSlow90 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow90)), 19))]))) >> 1) << 6) + fSlow101 + -4256.0)) << 16;
        const iSlow103: i32 = fSlow90 == 0.0;
        const fSlow104: f32 = Mathf.round(_fcast(dx7_alg2_fHslider42));
        const fSlow105: f32 = Mathf.round(_fcast(dx7_alg2_fHslider43));
        const iSlow106: i32 = _icast(fSlow105 * fSlow25) >> 3;
        const iSlow107: i32 = (((fSlow105 == 3.0 ? 1 : 0) & iSlow22) ? iSlow106 + -1 : ((((fSlow105 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow106 + 1 : iSlow106));
        const fSlow108: f32 = _fcast(iSlow107);
        const fSlow109: f32 = Mathf.min(fSlow104 + fSlow108, 99.0);
        const iSlow110: i32 = fSlow109 < 77.0;
        const fSlow111: f32 = ((iSlow110) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow109)), 76))]) : 2e+01 * (99.0 - fSlow109));
        const iSlow112: i32 = (((iSlow102 == 0 ? 1 : 0) | iSlow103) ? _icast(this.fConst1 * ((iSlow110 & iSlow103) ? 0.05 * fSlow111 : fSlow111)) : 0);
        const fSlow113: f32 = Mathf.round(_fcast(dx7_alg2_fHslider44));
        const iSlow114: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fSlow113 >= 2e+01 ? 1 : 0) ? fSlow113 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow113)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow115: f32 = Mathf.round(_fcast(dx7_alg2_fHslider45));
        const fSlow116: f32 = Mathf.min(fSlow115 + fSlow108, 99.0);
        const iSlow117: i32 = _icast(this.fConst1 * ((fSlow116 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow116)), 76))]) : 2e+01 * (99.0 - fSlow116)));
        const fSlow118: f32 = Mathf.round(_fcast(dx7_alg2_fHslider46));
        const fSlow119: f32 = Mathf.round(_fcast(dx7_alg2_fHslider47));
        const fSlow120: f32 = Mathf.round(_fcast(dx7_alg2_fHslider48));
        const fSlow121: f32 = Mathf.round(_fcast(dx7_alg2_fHslider49));
        const iSlow122: i32 = iSlow102 > 0;
        const iSlow123: i32 = min<i32>(63, ((41 * _icast(fSlow104)) >> 6) + iSlow107);
        const iSlow124: i32 = _icast(this.fConst1 * _fcast(((iSlow123 & 3) + 4) << ((iSlow123 >> 2) + 2)));
        const iSlow125: i32 = min<i32>(63, ((41 * _icast(fSlow115)) >> 6) + iSlow107);
        const iSlow126: i32 = _icast(this.fConst1 * _fcast(((iSlow125 & 3) + 4) << ((iSlow125 >> 2) + 2)));
        const iSlow127: i32 = Dx7_alg2_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg2_fHslider50))))];
        const iSlow128: i32 = iSlow127 != 0;
        const fSlow129: f32 = _fcast(iSlow127);
        const iSlow130: i32 = _icast(Mathf.round(_fcast(this.fCheckbox1)));
        const fSlow131: f32 = Mathf.round(_fcast(dx7_alg2_fHslider51));
        const iSlow132: i32 = _icast(Mathf.round(_fcast(dx7_alg2_fHslider52)));
        const fSlow133: f32 = Mathf.round(_fcast(dx7_alg2_fHslider53));
        const fSlow134: f32 = ((iSlow130) ? _fcast(_icast(4458616.0 * (fSlow133 + _fcast(100 * (iSlow132 & 3)))) >> 3) + ((fSlow131 > 0.0 ? 1 : 0) ? 13457.0 * fSlow131 : 0.0) : fSlow68 * (72267.445 * fSlow131 * fSlow70 + 24204406.0) + _fcast(Dx7_alg2_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow132 & 31)))]) + _fcast(((_icast(fSlow133)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow133 + 1.0) + 0.5)) : 0)));
        const fSlow135: f32 = Mathf.round(_fcast(dx7_alg2_fHslider54));
        const fSlow136: f32 = ((fSlow135 == 0.0 ? 1 : 0) ? 0.0 : Mathf.pow(2.0, fSlow135 + -7.0));
        const fSlow137: f32 = Mathf.round(_fcast(dx7_alg2_fHslider55));
        const fSlow138: f32 = Mathf.round(_fcast(dx7_alg2_fHslider56));
        const fSlow139: f32 = Mathf.round(_fcast(dx7_alg2_fHslider57));
        const fSlow140: f32 = Mathf.round(_fcast(dx7_alg2_fEntry5));
        const fSlow141: f32 = Mathf.round(_fcast(dx7_alg2_fHslider58));
        const fSlow142: f32 = fSlow4 + (-18.0 - fSlow139);
        const iSlow143: i32 = (((fSlow140 == 0.0 ? 1 : 0) | (fSlow140 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow141 * fSlow142)) >> 12 : _icast(329.0 * fSlow141 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow142))), 32))])) >> 15);
        const fSlow144: f32 = Mathf.round(_fcast(dx7_alg2_fEntry6));
        const fSlow145: f32 = Mathf.round(_fcast(dx7_alg2_fHslider59));
        const fSlow146: f32 = fSlow4 + (-16.0 - fSlow139);
        const iSlow147: i32 = (((fSlow144 == 0.0 ? 1 : 0) | (fSlow144 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow145 * fSlow146) >> 12 : _icast(329.0 * fSlow145 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow146)), 32))])) >> 15);
        const fSlow148: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow138 >= 2e+01 ? 1 : 0) ? fSlow138 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow138)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow139)) >= 0.0) ? ((fSlow144 < 2.0 ? 1 : 0) ? -iSlow147 : iSlow147) : ((fSlow140 < 2.0 ? 1 : 0) ? -iSlow143 : iSlow143)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg2_fHslider60)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow149: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow137 >= 2e+01 ? 1 : 0) ? fSlow137 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow137)), 19))]))) >> 1) << 6) + fSlow148 + -4256.0)) << 16;
        const iSlow150: i32 = fSlow137 == 0.0;
        const fSlow151: f32 = Mathf.round(_fcast(dx7_alg2_fHslider61));
        const fSlow152: f32 = Mathf.round(_fcast(dx7_alg2_fHslider62));
        const iSlow153: i32 = _icast(fSlow152 * fSlow25) >> 3;
        const iSlow154: i32 = (((fSlow152 == 3.0 ? 1 : 0) & iSlow22) ? iSlow153 + -1 : ((((fSlow152 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow153 + 1 : iSlow153));
        const fSlow155: f32 = _fcast(iSlow154);
        const fSlow156: f32 = Mathf.min(fSlow151 + fSlow155, 99.0);
        const iSlow157: i32 = fSlow156 < 77.0;
        const fSlow158: f32 = ((iSlow157) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow156)), 76))]) : 2e+01 * (99.0 - fSlow156));
        const iSlow159: i32 = (((iSlow149 == 0 ? 1 : 0) | iSlow150) ? _icast(this.fConst1 * ((iSlow157 & iSlow150) ? 0.05 * fSlow158 : fSlow158)) : 0);
        const fSlow160: f32 = Mathf.round(_fcast(dx7_alg2_fHslider63));
        const iSlow161: i32 = _icast(Mathf.max(16.0, fSlow148 + _fcast((_icast(((fSlow160 >= 2e+01 ? 1 : 0) ? fSlow160 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow160)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow162: f32 = Mathf.round(_fcast(dx7_alg2_fHslider64));
        const fSlow163: f32 = Mathf.min(fSlow162 + fSlow155, 99.0);
        const iSlow164: i32 = _icast(this.fConst1 * ((fSlow163 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow163)), 76))]) : 2e+01 * (99.0 - fSlow163)));
        const fSlow165: f32 = Mathf.round(_fcast(dx7_alg2_fHslider65));
        const fSlow166: f32 = Mathf.round(_fcast(dx7_alg2_fHslider66));
        const fSlow167: f32 = Mathf.round(_fcast(dx7_alg2_fHslider67));
        const fSlow168: f32 = Mathf.round(_fcast(dx7_alg2_fHslider68));
        const iSlow169: i32 = iSlow149 > 0;
        const iSlow170: i32 = min<i32>(63, ((41 * _icast(fSlow151)) >> 6) + iSlow154);
        const iSlow171: i32 = _icast(this.fConst1 * _fcast(((iSlow170 & 3) + 4) << ((iSlow170 >> 2) + 2)));
        const iSlow172: i32 = min<i32>(63, ((41 * _icast(fSlow162)) >> 6) + iSlow154);
        const iSlow173: i32 = _icast(this.fConst1 * _fcast(((iSlow172 & 3) + 4) << ((iSlow172 >> 2) + 2)));
        const iSlow174: i32 = Dx7_alg2_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg2_fHslider69))))];
        const iSlow175: i32 = iSlow174 != 0;
        const fSlow176: f32 = _fcast(iSlow174);
        const iSlow177: i32 = _icast(Mathf.round(_fcast(this.fCheckbox2)));
        const fSlow178: f32 = Mathf.round(_fcast(dx7_alg2_fHslider70));
        const iSlow179: i32 = _icast(Mathf.round(_fcast(dx7_alg2_fHslider71)));
        const fSlow180: f32 = Mathf.round(_fcast(dx7_alg2_fHslider72));
        const fSlow181: f32 = ((iSlow177) ? _fcast(_icast(4458616.0 * (fSlow180 + _fcast(100 * (iSlow179 & 3)))) >> 3) + ((fSlow178 > 0.0 ? 1 : 0) ? 13457.0 * fSlow178 : 0.0) : fSlow68 * (72267.445 * fSlow178 * fSlow70 + 24204406.0) + _fcast(Dx7_alg2_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow179 & 31)))]) + _fcast(((_icast(fSlow180)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow180 + 1.0) + 0.5)) : 0)));
        const fSlow182: f32 = Mathf.round(_fcast(dx7_alg2_fHslider73));
        const fSlow183: f32 = Mathf.round(_fcast(dx7_alg2_fHslider74));
        const fSlow184: f32 = Mathf.round(_fcast(dx7_alg2_fHslider75));
        const fSlow185: f32 = Mathf.round(_fcast(dx7_alg2_fEntry7));
        const fSlow186: f32 = Mathf.round(_fcast(dx7_alg2_fHslider76));
        const fSlow187: f32 = fSlow4 + (-18.0 - fSlow184);
        const iSlow188: i32 = (((fSlow185 == 0.0 ? 1 : 0) | (fSlow185 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow186 * fSlow187)) >> 12 : _icast(329.0 * fSlow186 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow187))), 32))])) >> 15);
        const fSlow189: f32 = Mathf.round(_fcast(dx7_alg2_fEntry8));
        const fSlow190: f32 = Mathf.round(_fcast(dx7_alg2_fHslider77));
        const fSlow191: f32 = fSlow4 + (-16.0 - fSlow184);
        const iSlow192: i32 = (((fSlow189 == 0.0 ? 1 : 0) | (fSlow189 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow190 * fSlow191) >> 12 : _icast(329.0 * fSlow190 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow191)), 32))])) >> 15);
        const fSlow193: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow183 >= 2e+01 ? 1 : 0) ? fSlow183 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow183)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow184)) >= 0.0) ? ((fSlow189 < 2.0 ? 1 : 0) ? -iSlow192 : iSlow192) : ((fSlow185 < 2.0 ? 1 : 0) ? -iSlow188 : iSlow188)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg2_fHslider78)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow194: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow182 >= 2e+01 ? 1 : 0) ? fSlow182 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow182)), 19))]))) >> 1) << 6) + fSlow193 + -4256.0)) << 16;
        const iSlow195: i32 = fSlow182 == 0.0;
        const fSlow196: f32 = Mathf.round(_fcast(dx7_alg2_fHslider79));
        const fSlow197: f32 = Mathf.round(_fcast(dx7_alg2_fHslider80));
        const iSlow198: i32 = _icast(fSlow197 * fSlow25) >> 3;
        const iSlow199: i32 = (((fSlow197 == 3.0 ? 1 : 0) & iSlow22) ? iSlow198 + -1 : ((((fSlow197 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow198 + 1 : iSlow198));
        const fSlow200: f32 = _fcast(iSlow199);
        const fSlow201: f32 = Mathf.min(fSlow196 + fSlow200, 99.0);
        const iSlow202: i32 = fSlow201 < 77.0;
        const fSlow203: f32 = ((iSlow202) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow201)), 76))]) : 2e+01 * (99.0 - fSlow201));
        const iSlow204: i32 = (((iSlow194 == 0 ? 1 : 0) | iSlow195) ? _icast(this.fConst1 * ((iSlow202 & iSlow195) ? 0.05 * fSlow203 : fSlow203)) : 0);
        const fSlow205: f32 = Mathf.round(_fcast(dx7_alg2_fHslider81));
        const iSlow206: i32 = _icast(Mathf.max(16.0, fSlow193 + _fcast((_icast(((fSlow205 >= 2e+01 ? 1 : 0) ? fSlow205 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow205)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow207: f32 = Mathf.round(_fcast(dx7_alg2_fHslider82));
        const fSlow208: f32 = Mathf.min(fSlow207 + fSlow200, 99.0);
        const iSlow209: i32 = _icast(this.fConst1 * ((fSlow208 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow208)), 76))]) : 2e+01 * (99.0 - fSlow208)));
        const fSlow210: f32 = Mathf.round(_fcast(dx7_alg2_fHslider83));
        const fSlow211: f32 = Mathf.round(_fcast(dx7_alg2_fHslider84));
        const fSlow212: f32 = Mathf.round(_fcast(dx7_alg2_fHslider85));
        const fSlow213: f32 = Mathf.round(_fcast(dx7_alg2_fHslider86));
        const iSlow214: i32 = iSlow194 > 0;
        const iSlow215: i32 = min<i32>(63, ((41 * _icast(fSlow196)) >> 6) + iSlow199);
        const iSlow216: i32 = _icast(this.fConst1 * _fcast(((iSlow215 & 3) + 4) << ((iSlow215 >> 2) + 2)));
        const iSlow217: i32 = min<i32>(63, ((41 * _icast(fSlow207)) >> 6) + iSlow199);
        const iSlow218: i32 = _icast(this.fConst1 * _fcast(((iSlow217 & 3) + 4) << ((iSlow217 >> 2) + 2)));
        const iSlow219: i32 = Dx7_alg2_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg2_fHslider87))))];
        const iSlow220: i32 = iSlow219 != 0;
        const fSlow221: f32 = _fcast(iSlow219);
        const iSlow222: i32 = _icast(Mathf.round(_fcast(this.fCheckbox3)));
        const fSlow223: f32 = Mathf.round(_fcast(dx7_alg2_fHslider88));
        const iSlow224: i32 = _icast(Mathf.round(_fcast(dx7_alg2_fHslider89)));
        const fSlow225: f32 = Mathf.round(_fcast(dx7_alg2_fHslider90));
        const fSlow226: f32 = ((iSlow222) ? _fcast(_icast(4458616.0 * (fSlow225 + _fcast(100 * (iSlow224 & 3)))) >> 3) + ((fSlow223 > 0.0 ? 1 : 0) ? 13457.0 * fSlow223 : 0.0) : fSlow68 * (72267.445 * fSlow223 * fSlow70 + 24204406.0) + _fcast(Dx7_alg2_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow224 & 31)))]) + _fcast(((_icast(fSlow225)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow225 + 1.0) + 0.5)) : 0)));
        const fSlow227: f32 = Mathf.round(_fcast(dx7_alg2_fHslider91));
        const fSlow228: f32 = Mathf.round(_fcast(dx7_alg2_fHslider92));
        const fSlow229: f32 = Mathf.round(_fcast(dx7_alg2_fHslider93));
        const fSlow230: f32 = Mathf.round(_fcast(dx7_alg2_fEntry9));
        const fSlow231: f32 = Mathf.round(_fcast(dx7_alg2_fHslider94));
        const fSlow232: f32 = fSlow4 + (-18.0 - fSlow229);
        const iSlow233: i32 = (((fSlow230 == 0.0 ? 1 : 0) | (fSlow230 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow231 * fSlow232)) >> 12 : _icast(329.0 * fSlow231 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow232))), 32))])) >> 15);
        const fSlow234: f32 = Mathf.round(_fcast(dx7_alg2_fEntry10));
        const fSlow235: f32 = Mathf.round(_fcast(dx7_alg2_fHslider95));
        const fSlow236: f32 = fSlow4 + (-16.0 - fSlow229);
        const iSlow237: i32 = (((fSlow234 == 0.0 ? 1 : 0) | (fSlow234 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow235 * fSlow236) >> 12 : _icast(329.0 * fSlow235 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow236)), 32))])) >> 15);
        const fSlow238: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow228 >= 2e+01 ? 1 : 0) ? fSlow228 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow228)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow229)) >= 0.0) ? ((fSlow234 < 2.0 ? 1 : 0) ? -iSlow237 : iSlow237) : ((fSlow230 < 2.0 ? 1 : 0) ? -iSlow233 : iSlow233)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg2_fHslider96)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow239: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow227 >= 2e+01 ? 1 : 0) ? fSlow227 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow227)), 19))]))) >> 1) << 6) + fSlow238 + -4256.0)) << 16;
        const iSlow240: i32 = fSlow227 == 0.0;
        const fSlow241: f32 = Mathf.round(_fcast(dx7_alg2_fHslider97));
        const fSlow242: f32 = Mathf.round(_fcast(dx7_alg2_fHslider98));
        const iSlow243: i32 = _icast(fSlow242 * fSlow25) >> 3;
        const iSlow244: i32 = (((fSlow242 == 3.0 ? 1 : 0) & iSlow22) ? iSlow243 + -1 : ((((fSlow242 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow243 + 1 : iSlow243));
        const fSlow245: f32 = _fcast(iSlow244);
        const fSlow246: f32 = Mathf.min(fSlow241 + fSlow245, 99.0);
        const iSlow247: i32 = fSlow246 < 77.0;
        const fSlow248: f32 = ((iSlow247) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow246)), 76))]) : 2e+01 * (99.0 - fSlow246));
        const iSlow249: i32 = (((iSlow239 == 0 ? 1 : 0) | iSlow240) ? _icast(this.fConst1 * ((iSlow247 & iSlow240) ? 0.05 * fSlow248 : fSlow248)) : 0);
        const fSlow250: f32 = Mathf.round(_fcast(dx7_alg2_fHslider99));
        const iSlow251: i32 = _icast(Mathf.max(16.0, fSlow238 + _fcast((_icast(((fSlow250 >= 2e+01 ? 1 : 0) ? fSlow250 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow250)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow252: f32 = Mathf.round(_fcast(dx7_alg2_fHslider100));
        const fSlow253: f32 = Mathf.min(fSlow252 + fSlow245, 99.0);
        const iSlow254: i32 = _icast(this.fConst1 * ((fSlow253 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow253)), 76))]) : 2e+01 * (99.0 - fSlow253)));
        const fSlow255: f32 = Mathf.round(_fcast(dx7_alg2_fHslider101));
        const fSlow256: f32 = Mathf.round(_fcast(dx7_alg2_fHslider102));
        const fSlow257: f32 = Mathf.round(_fcast(dx7_alg2_fHslider103));
        const fSlow258: f32 = Mathf.round(_fcast(dx7_alg2_fHslider104));
        const iSlow259: i32 = iSlow239 > 0;
        const iSlow260: i32 = min<i32>(63, ((41 * _icast(fSlow241)) >> 6) + iSlow244);
        const iSlow261: i32 = _icast(this.fConst1 * _fcast(((iSlow260 & 3) + 4) << ((iSlow260 >> 2) + 2)));
        const iSlow262: i32 = min<i32>(63, ((41 * _icast(fSlow252)) >> 6) + iSlow244);
        const iSlow263: i32 = _icast(this.fConst1 * _fcast(((iSlow262 & 3) + 4) << ((iSlow262 >> 2) + 2)));
        const iSlow264: i32 = Dx7_alg2_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg2_fHslider105))))];
        const iSlow265: i32 = iSlow264 != 0;
        const fSlow266: f32 = _fcast(iSlow264);
        const iSlow267: i32 = _icast(Mathf.round(_fcast(this.fCheckbox4)));
        const fSlow268: f32 = Mathf.round(_fcast(dx7_alg2_fHslider106));
        const iSlow269: i32 = _icast(Mathf.round(_fcast(dx7_alg2_fHslider107)));
        const fSlow270: f32 = Mathf.round(_fcast(dx7_alg2_fHslider108));
        const fSlow271: f32 = ((iSlow267) ? _fcast(_icast(4458616.0 * (fSlow270 + _fcast(100 * (iSlow269 & 3)))) >> 3) + ((fSlow268 > 0.0 ? 1 : 0) ? 13457.0 * fSlow268 : 0.0) : fSlow68 * (72267.445 * fSlow268 * fSlow70 + 24204406.0) + _fcast(Dx7_alg2_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow269 & 31)))]) + _fcast(((_icast(fSlow270)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow270 + 1.0) + 0.5)) : 0)));
        const fSlow272: f32 = Mathf.round(_fcast(dx7_alg2_fHslider109));
        const fSlow273: f32 = Mathf.round(_fcast(dx7_alg2_fHslider110));
        const fSlow274: f32 = Mathf.round(_fcast(dx7_alg2_fHslider111));
        const fSlow275: f32 = Mathf.round(_fcast(dx7_alg2_fEntry11));
        const fSlow276: f32 = Mathf.round(_fcast(dx7_alg2_fHslider112));
        const fSlow277: f32 = fSlow4 + (-18.0 - fSlow274);
        const iSlow278: i32 = (((fSlow275 == 0.0 ? 1 : 0) | (fSlow275 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow276 * fSlow277)) >> 12 : _icast(329.0 * fSlow276 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow277))), 32))])) >> 15);
        const fSlow279: f32 = Mathf.round(_fcast(dx7_alg2_fEntry12));
        const fSlow280: f32 = Mathf.round(_fcast(dx7_alg2_fHslider113));
        const fSlow281: f32 = fSlow4 + (-16.0 - fSlow274);
        const iSlow282: i32 = (((fSlow279 == 0.0 ? 1 : 0) | (fSlow279 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow280 * fSlow281) >> 12 : _icast(329.0 * fSlow280 * _fcast(Dx7_alg2_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow281)), 32))])) >> 15);
        const fSlow283: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow273 >= 2e+01 ? 1 : 0) ? fSlow273 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow273)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow274)) >= 0.0) ? ((fSlow279 < 2.0 ? 1 : 0) ? -iSlow282 : iSlow282) : ((fSlow275 < 2.0 ? 1 : 0) ? -iSlow278 : iSlow278)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg2_fHslider114)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow284: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow272 >= 2e+01 ? 1 : 0) ? fSlow272 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow272)), 19))]))) >> 1) << 6) + fSlow283 + -4256.0)) << 16;
        const iSlow285: i32 = fSlow272 == 0.0;
        const fSlow286: f32 = Mathf.round(_fcast(dx7_alg2_fHslider115));
        const fSlow287: f32 = Mathf.round(_fcast(dx7_alg2_fHslider116));
        const iSlow288: i32 = _icast(fSlow287 * fSlow25) >> 3;
        const iSlow289: i32 = (((fSlow287 == 3.0 ? 1 : 0) & iSlow22) ? iSlow288 + -1 : ((((fSlow287 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow288 + 1 : iSlow288));
        const fSlow290: f32 = _fcast(iSlow289);
        const fSlow291: f32 = Mathf.min(fSlow286 + fSlow290, 99.0);
        const iSlow292: i32 = fSlow291 < 77.0;
        const fSlow293: f32 = ((iSlow292) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow291)), 76))]) : 2e+01 * (99.0 - fSlow291));
        const iSlow294: i32 = (((iSlow284 == 0 ? 1 : 0) | iSlow285) ? _icast(this.fConst1 * ((iSlow292 & iSlow285) ? 0.05 * fSlow293 : fSlow293)) : 0);
        const fSlow295: f32 = Mathf.round(_fcast(dx7_alg2_fHslider117));
        const iSlow296: i32 = _icast(Mathf.max(16.0, fSlow283 + _fcast((_icast(((fSlow295 >= 2e+01 ? 1 : 0) ? fSlow295 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow295)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow297: f32 = Mathf.round(_fcast(dx7_alg2_fHslider118));
        const fSlow298: f32 = Mathf.min(fSlow297 + fSlow290, 99.0);
        const iSlow299: i32 = _icast(this.fConst1 * ((fSlow298 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow298)), 76))]) : 2e+01 * (99.0 - fSlow298)));
        const fSlow300: f32 = Mathf.round(_fcast(dx7_alg2_fHslider119));
        const fSlow301: f32 = Mathf.round(_fcast(dx7_alg2_fHslider120));
        const fSlow302: f32 = Mathf.round(_fcast(dx7_alg2_fHslider121));
        const fSlow303: f32 = Mathf.round(_fcast(dx7_alg2_fHslider122));
        const iSlow304: i32 = iSlow284 > 0;
        const iSlow305: i32 = min<i32>(63, ((41 * _icast(fSlow286)) >> 6) + iSlow289);
        const iSlow306: i32 = _icast(this.fConst1 * _fcast(((iSlow305 & 3) + 4) << ((iSlow305 >> 2) + 2)));
        const iSlow307: i32 = min<i32>(63, ((41 * _icast(fSlow297)) >> 6) + iSlow289);
        const iSlow308: i32 = _icast(this.fConst1 * _fcast(((iSlow307 & 3) + 4) << ((iSlow307 >> 2) + 2)));
        const iSlow309: i32 = Dx7_alg2_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg2_fHslider123))))];
        const iSlow310: i32 = iSlow309 != 0;
        const fSlow311: f32 = _fcast(iSlow309);
        const iSlow312: i32 = _icast(Mathf.round(_fcast(this.fCheckbox5)));
        const fSlow313: f32 = Mathf.round(_fcast(dx7_alg2_fHslider124));
        const iSlow314: i32 = _icast(Mathf.round(_fcast(dx7_alg2_fHslider125)));
        const fSlow315: f32 = Mathf.round(_fcast(dx7_alg2_fHslider126));
        const fSlow316: f32 = ((iSlow312) ? _fcast(_icast(4458616.0 * (fSlow315 + _fcast(100 * (iSlow314 & 3)))) >> 3) + ((fSlow313 > 0.0 ? 1 : 0) ? 13457.0 * fSlow313 : 0.0) : fSlow68 * (72267.445 * fSlow313 * fSlow70 + 24204406.0) + _fcast(Dx7_alg2_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow314 & 31)))]) + _fcast(((_icast(fSlow315)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow315 + 1.0) + 0.5)) : 0)));

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
        const iTemp17: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp16 >= 2e+01 ? 1 : 0) ? fTemp16 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp16)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp18: i32 = iTemp8 == 0;
        const iTemp19: i32 = fTemp16 == 0.0;
        const fTemp20: f32 = ((iTemp13) ? ((iTemp15) ? fSlow35 : fSlow41) : ((iTemp14) ? fSlow40 : fSlow18));
        const fTemp21: f32 = Mathf.min(fSlow28 + fTemp20, 99.0);
        const iTemp22: i32 = fTemp21 < 77.0;
        const fTemp23: f32 = ((iTemp22) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp21)), 76))]) : 2e+01 * (99.0 - fTemp21));
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
        const iTemp46: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp45 >= 2e+01 ? 1 : 0) ? fTemp45 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp45)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp56: f32 = ((iTemp55) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp54)), 76))]) : 2e+01 * (99.0 - fTemp54));
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
        const iTemp89: i32 = Dx7_alg2_itbl6SIG6[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow74 : fSlow85) : ((iTemp87) ? fSlow84 : fSlow77))))];
        const iTemp90: i32 = ((iTemp85) ? iTemp89 : iTemp79);
        this.iRec15[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp90 : iTemp79) : ((iTemp81) ? iTemp90 : iTemp79)) : iTemp79);
        const iTemp91: i32 = ((iTemp85) ? iTemp89 > iTemp79 : iTemp75);
        this.iRec16[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp91 : iTemp75) : ((iTemp81) ? iTemp91 : iTemp75)) : iTemp75);
        const fTemp92: f32 = ((iTemp85) ? this.fConst4 * _fcast(Dx7_alg2_itbl7SIG7[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow80 : fSlow87) : ((iTemp87) ? fSlow86 : fSlow82))))]) : fTemp77);
        this.fRec17[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? fTemp92 : fTemp77) : ((iTemp81) ? fTemp92 : fTemp77)) : fTemp77);
        this.iRec18[0] = iTemp72;
        const fTemp93: f32 = fRec10 + -0.5;
        const fTemp94: f32 = 524288.0 * this.fRec13[0] + 16777216.0 * Mathf.abs(fSlow88 * fRec11 * fSlow89 * fTemp93) * (((0.00390625 * fSlow89 * fTemp93) < 0.0) ? -1.0 : 1.0);
        const fTemp95: f32 = ((iTemp70) ? 0.0 : this.fRec12[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow73 + ((iSlow67) ? 0.0 : fTemp94))));
        this.fRec12[0] = fTemp95 - Mathf.floor(fTemp95);
        const iTemp96: i32 = ((iTemp2) ? 0 : this.iRec20[1]);
        const iTemp97: i32 = ((iTemp0) ? ((iSlow114 == iTemp96 ? 1 : 0) ? iSlow117 : 0) : ((iTemp2) ? iSlow112 : this.iRec26[1]));
        const iTemp98: i32 = iTemp97 != 0;
        const iTemp99: i32 = (iTemp98 & (iTemp97 <= 1 ? 1 : 0)) >= 1;
        const iTemp100: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec21[1]));
        const iTemp101: i32 = iTemp100 + 1;
        const iTemp102: i32 = ((iTemp99) ? iTemp101 : iTemp100);
        const iTemp103: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec25[1]));
        const iTemp104: i32 = ((iTemp102 < 3 ? 1 : 0) | ((iTemp102 < 4 ? 1 : 0) & (iTemp103 ^ -1))) >= 1;
        const iTemp105: i32 = (iTemp101 < 4 ? 1 : 0) >= 1;
        const iTemp106: i32 = iTemp101 >= 2;
        const iTemp107: i32 = iTemp101 >= 1;
        const iTemp108: i32 = iTemp101 >= 3;
        const fTemp109: f32 = ((iTemp106) ? ((iTemp108) ? fSlow113 : fSlow119) : ((iTemp107) ? fSlow118 : fSlow90));
        const iTemp110: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp109 >= 2e+01 ? 1 : 0) ? fTemp109 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp109)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp111: i32 = iTemp101 == 0;
        const iTemp112: i32 = fTemp109 == 0.0;
        const fTemp113: f32 = ((iTemp106) ? ((iTemp108) ? fSlow115 : fSlow121) : ((iTemp107) ? fSlow120 : fSlow104));
        const fTemp114: f32 = Mathf.min(fSlow108 + fTemp113, 99.0);
        const iTemp115: i32 = fTemp114 < 77.0;
        const fTemp116: f32 = ((iTemp115) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp114)), 76))]) : 2e+01 * (99.0 - fTemp114));
        const iTemp117: i32 = ((iTemp99) ? ((iTemp105) ? (((iTemp110 == iTemp96 ? 1 : 0) | (iTemp111 & iTemp112)) ? _icast(this.fConst1 * (((iTemp115 & iTemp111) & iTemp112) ? 0.05 * fTemp116 : fTemp116)) : 0) : 0) : iTemp97 - ((iTemp98) ? 1 : 0));
        const iTemp118: i32 = ((iTemp0) ? iSlow114 > iTemp96 : ((iTemp2) ? iSlow122 : this.iRec23[1]));
        const iTemp119: i32 = ((iTemp99) ? ((iTemp105) ? iTemp110 > iTemp96 : iTemp118) : iTemp118);
        const iTemp120: i32 = (iTemp117 == 0 ? 1 : 0) * ((iTemp119 == 0 ? 1 : 0) + 1);
        const iTemp121: i32 = iTemp120 >= 2;
        const iTemp122: i32 = iTemp120 >= 1;
        const iTemp123: i32 = max<i32>(112459776, iTemp96);
        const iTemp124: i32 = ((iTemp0) ? iSlow126 : ((iTemp2) ? iSlow124 : this.iRec24[1]));
        const iTemp125: i32 = min<i32>(63, iSlow107 + ((41 * _icast(fTemp113)) >> 6));
        const iTemp126: i32 = ((iTemp99) ? ((iTemp105) ? _icast(this.fConst1 * _fcast(((iTemp125 & 3) + 4) << ((iTemp125 >> 2) + 2))) : iTemp124) : iTemp124);
        const iTemp127: i32 = iTemp123 + ((285212672 - iTemp123) >> 24) * iTemp126;
        const iTemp128: i32 = ((iTemp0) ? iSlow114 : ((iTemp2) ? iSlow102 : this.iRec22[1]));
        const iTemp129: i32 = ((iTemp99) ? ((iTemp105) ? iTemp110 : iTemp128) : iTemp128);
        const iTemp130: i32 = (iTemp127 >= iTemp129 ? 1 : 0) >= 1;
        const iTemp131: i32 = iTemp96 - iTemp126;
        const iTemp132: i32 = (iTemp131 <= iTemp129 ? 1 : 0) >= 1;
        this.iRec20[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp129 : iTemp131) : ((iTemp122) ? ((iTemp130) ? iTemp129 : iTemp127) : iTemp96)) : iTemp96);
        const iTemp133: i32 = iTemp102 + 1;
        this.iRec21[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp133 : iTemp102) : ((iTemp122) ? ((iTemp130) ? iTemp133 : iTemp102) : iTemp102)) : iTemp102);
        const iTemp134: i32 = (iTemp133 < 4 ? 1 : 0) >= 1;
        const iTemp135: i32 = iTemp133 >= 2;
        const iTemp136: i32 = iTemp133 >= 1;
        const iTemp137: i32 = iTemp133 >= 3;
        const fTemp138: f32 = ((iTemp135) ? ((iTemp137) ? fSlow113 : fSlow119) : ((iTemp136) ? fSlow118 : fSlow90));
        const iTemp139: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp138 >= 2e+01 ? 1 : 0) ? fTemp138 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp138)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp140: i32 = ((iTemp134) ? iTemp139 : iTemp129);
        this.iRec22[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp140 : iTemp129) : ((iTemp122) ? ((iTemp130) ? iTemp140 : iTemp129) : iTemp129)) : iTemp129);
        const iTemp141: i32 = ((iTemp134) ? iTemp139 > iTemp129 : iTemp119);
        this.iRec23[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp141 : iTemp119) : ((iTemp122) ? ((iTemp130) ? iTemp141 : iTemp119) : iTemp119)) : iTemp119);
        const fTemp142: f32 = ((iTemp135) ? ((iTemp137) ? fSlow115 : fSlow121) : ((iTemp136) ? fSlow120 : fSlow104));
        const iTemp143: i32 = min<i32>(63, iSlow107 + ((41 * _icast(fTemp142)) >> 6));
        const iTemp144: i32 = ((iTemp134) ? _icast(this.fConst1 * _fcast(((iTemp143 & 3) + 4) << ((iTemp143 >> 2) + 2))) : iTemp126);
        this.iRec24[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp144 : iTemp126) : ((iTemp122) ? ((iTemp130) ? iTemp144 : iTemp126) : iTemp126)) : iTemp126);
        this.iRec25[0] = iTemp103;
        const iTemp145: i32 = iTemp133 == 0;
        const iTemp146: i32 = fTemp138 == 0.0;
        const fTemp147: f32 = Mathf.min(fSlow108 + fTemp142, 99.0);
        const iTemp148: i32 = fTemp147 < 77.0;
        const fTemp149: f32 = ((iTemp148) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp147)), 76))]) : 2e+01 * (99.0 - fTemp147));
        const iTemp150: i32 = ((iTemp134) ? (((iTemp139 == iTemp129 ? 1 : 0) | (iTemp145 & iTemp146)) ? _icast(this.fConst1 * (((iTemp148 & iTemp145) & iTemp146) ? 0.05 * fTemp149 : fTemp149)) : 0) : iTemp117);
        this.iRec26[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp150 : iTemp117) : ((iTemp122) ? ((iTemp130) ? iTemp150 : iTemp117) : iTemp117)) : iTemp117);
        const fTemp151: f32 = ((iTemp70) ? 0.0 : this.fRec27[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow134 + ((iSlow130) ? 0.0 : fTemp94))));
        this.fRec27[0] = fTemp151 - Mathf.floor(fTemp151);
        this.fRec19[0] = 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec20[0] + (-234881024 - ((iSlow128) ? _icast(5.9604645e-08 * _fcast(this.iRec20[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow129 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec27[0] + this.fRec19[1] * fSlow136));
        const iTemp152: i32 = ((iTemp2) ? 0 : this.iRec28[1]);
        const iTemp153: i32 = ((iTemp0) ? ((iSlow161 == iTemp152 ? 1 : 0) ? iSlow164 : 0) : ((iTemp2) ? iSlow159 : this.iRec34[1]));
        const iTemp154: i32 = iTemp153 != 0;
        const iTemp155: i32 = (iTemp154 & (iTemp153 <= 1 ? 1 : 0)) >= 1;
        const iTemp156: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec29[1]));
        const iTemp157: i32 = iTemp156 + 1;
        const iTemp158: i32 = ((iTemp155) ? iTemp157 : iTemp156);
        const iTemp159: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec33[1]));
        const iTemp160: i32 = ((iTemp158 < 3 ? 1 : 0) | ((iTemp158 < 4 ? 1 : 0) & (iTemp159 ^ -1))) >= 1;
        const iTemp161: i32 = (iTemp157 < 4 ? 1 : 0) >= 1;
        const iTemp162: i32 = iTemp157 >= 2;
        const iTemp163: i32 = iTemp157 >= 1;
        const iTemp164: i32 = iTemp157 >= 3;
        const fTemp165: f32 = ((iTemp162) ? ((iTemp164) ? fSlow160 : fSlow166) : ((iTemp163) ? fSlow165 : fSlow137));
        const iTemp166: i32 = _icast(Mathf.max(16.0, fSlow148 + _fcast((_icast(((fTemp165 >= 2e+01 ? 1 : 0) ? fTemp165 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp165)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp167: i32 = iTemp157 == 0;
        const iTemp168: i32 = fTemp165 == 0.0;
        const fTemp169: f32 = ((iTemp162) ? ((iTemp164) ? fSlow162 : fSlow168) : ((iTemp163) ? fSlow167 : fSlow151));
        const fTemp170: f32 = Mathf.min(fSlow155 + fTemp169, 99.0);
        const iTemp171: i32 = fTemp170 < 77.0;
        const fTemp172: f32 = ((iTemp171) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp170)), 76))]) : 2e+01 * (99.0 - fTemp170));
        const iTemp173: i32 = ((iTemp155) ? ((iTemp161) ? (((iTemp166 == iTemp152 ? 1 : 0) | (iTemp167 & iTemp168)) ? _icast(this.fConst1 * (((iTemp171 & iTemp167) & iTemp168) ? 0.05 * fTemp172 : fTemp172)) : 0) : 0) : iTemp153 - ((iTemp154) ? 1 : 0));
        const iTemp174: i32 = ((iTemp0) ? iSlow161 > iTemp152 : ((iTemp2) ? iSlow169 : this.iRec31[1]));
        const iTemp175: i32 = ((iTemp155) ? ((iTemp161) ? iTemp166 > iTemp152 : iTemp174) : iTemp174);
        const iTemp176: i32 = (iTemp173 == 0 ? 1 : 0) * ((iTemp175 == 0 ? 1 : 0) + 1);
        const iTemp177: i32 = iTemp176 >= 2;
        const iTemp178: i32 = iTemp176 >= 1;
        const iTemp179: i32 = max<i32>(112459776, iTemp152);
        const iTemp180: i32 = ((iTemp0) ? iSlow173 : ((iTemp2) ? iSlow171 : this.iRec32[1]));
        const iTemp181: i32 = min<i32>(63, iSlow154 + ((41 * _icast(fTemp169)) >> 6));
        const iTemp182: i32 = ((iTemp155) ? ((iTemp161) ? _icast(this.fConst1 * _fcast(((iTemp181 & 3) + 4) << ((iTemp181 >> 2) + 2))) : iTemp180) : iTemp180);
        const iTemp183: i32 = iTemp179 + ((285212672 - iTemp179) >> 24) * iTemp182;
        const iTemp184: i32 = ((iTemp0) ? iSlow161 : ((iTemp2) ? iSlow149 : this.iRec30[1]));
        const iTemp185: i32 = ((iTemp155) ? ((iTemp161) ? iTemp166 : iTemp184) : iTemp184);
        const iTemp186: i32 = (iTemp183 >= iTemp185 ? 1 : 0) >= 1;
        const iTemp187: i32 = iTemp152 - iTemp182;
        const iTemp188: i32 = (iTemp187 <= iTemp185 ? 1 : 0) >= 1;
        this.iRec28[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp185 : iTemp187) : ((iTemp178) ? ((iTemp186) ? iTemp185 : iTemp183) : iTemp152)) : iTemp152);
        const iTemp189: i32 = iTemp158 + 1;
        this.iRec29[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp189 : iTemp158) : ((iTemp178) ? ((iTemp186) ? iTemp189 : iTemp158) : iTemp158)) : iTemp158);
        const iTemp190: i32 = (iTemp189 < 4 ? 1 : 0) >= 1;
        const iTemp191: i32 = iTemp189 >= 2;
        const iTemp192: i32 = iTemp189 >= 1;
        const iTemp193: i32 = iTemp189 >= 3;
        const fTemp194: f32 = ((iTemp191) ? ((iTemp193) ? fSlow160 : fSlow166) : ((iTemp192) ? fSlow165 : fSlow137));
        const iTemp195: i32 = _icast(Mathf.max(16.0, fSlow148 + _fcast((_icast(((fTemp194 >= 2e+01 ? 1 : 0) ? fTemp194 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp194)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp196: i32 = ((iTemp190) ? iTemp195 : iTemp185);
        this.iRec30[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp196 : iTemp185) : ((iTemp178) ? ((iTemp186) ? iTemp196 : iTemp185) : iTemp185)) : iTemp185);
        const iTemp197: i32 = ((iTemp190) ? iTemp195 > iTemp185 : iTemp175);
        this.iRec31[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp197 : iTemp175) : ((iTemp178) ? ((iTemp186) ? iTemp197 : iTemp175) : iTemp175)) : iTemp175);
        const fTemp198: f32 = ((iTemp191) ? ((iTemp193) ? fSlow162 : fSlow168) : ((iTemp192) ? fSlow167 : fSlow151));
        const iTemp199: i32 = min<i32>(63, iSlow154 + ((41 * _icast(fTemp198)) >> 6));
        const iTemp200: i32 = ((iTemp190) ? _icast(this.fConst1 * _fcast(((iTemp199 & 3) + 4) << ((iTemp199 >> 2) + 2))) : iTemp182);
        this.iRec32[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp200 : iTemp182) : ((iTemp178) ? ((iTemp186) ? iTemp200 : iTemp182) : iTemp182)) : iTemp182);
        this.iRec33[0] = iTemp159;
        const iTemp201: i32 = iTemp189 == 0;
        const iTemp202: i32 = fTemp194 == 0.0;
        const fTemp203: f32 = Mathf.min(fSlow155 + fTemp198, 99.0);
        const iTemp204: i32 = fTemp203 < 77.0;
        const fTemp205: f32 = ((iTemp204) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp203)), 76))]) : 2e+01 * (99.0 - fTemp203));
        const iTemp206: i32 = ((iTemp190) ? (((iTemp195 == iTemp185 ? 1 : 0) | (iTemp201 & iTemp202)) ? _icast(this.fConst1 * (((iTemp204 & iTemp201) & iTemp202) ? 0.05 * fTemp205 : fTemp205)) : 0) : iTemp173);
        this.iRec34[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp206 : iTemp173) : ((iTemp178) ? ((iTemp186) ? iTemp206 : iTemp173) : iTemp173)) : iTemp173);
        const fTemp207: f32 = ((iTemp70) ? 0.0 : this.fRec35[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow181 + ((iSlow177) ? 0.0 : fTemp94))));
        this.fRec35[0] = fTemp207 - Mathf.floor(fTemp207);
        const iTemp208: i32 = ((iTemp2) ? 0 : this.iRec36[1]);
        const iTemp209: i32 = ((iTemp0) ? ((iSlow206 == iTemp208 ? 1 : 0) ? iSlow209 : 0) : ((iTemp2) ? iSlow204 : this.iRec42[1]));
        const iTemp210: i32 = iTemp209 != 0;
        const iTemp211: i32 = (iTemp210 & (iTemp209 <= 1 ? 1 : 0)) >= 1;
        const iTemp212: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec37[1]));
        const iTemp213: i32 = iTemp212 + 1;
        const iTemp214: i32 = ((iTemp211) ? iTemp213 : iTemp212);
        const iTemp215: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec41[1]));
        const iTemp216: i32 = ((iTemp214 < 3 ? 1 : 0) | ((iTemp214 < 4 ? 1 : 0) & (iTemp215 ^ -1))) >= 1;
        const iTemp217: i32 = (iTemp213 < 4 ? 1 : 0) >= 1;
        const iTemp218: i32 = iTemp213 >= 2;
        const iTemp219: i32 = iTemp213 >= 1;
        const iTemp220: i32 = iTemp213 >= 3;
        const fTemp221: f32 = ((iTemp218) ? ((iTemp220) ? fSlow205 : fSlow211) : ((iTemp219) ? fSlow210 : fSlow182));
        const iTemp222: i32 = _icast(Mathf.max(16.0, fSlow193 + _fcast((_icast(((fTemp221 >= 2e+01 ? 1 : 0) ? fTemp221 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp221)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp223: i32 = iTemp213 == 0;
        const iTemp224: i32 = fTemp221 == 0.0;
        const fTemp225: f32 = ((iTemp218) ? ((iTemp220) ? fSlow207 : fSlow213) : ((iTemp219) ? fSlow212 : fSlow196));
        const fTemp226: f32 = Mathf.min(fSlow200 + fTemp225, 99.0);
        const iTemp227: i32 = fTemp226 < 77.0;
        const fTemp228: f32 = ((iTemp227) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp226)), 76))]) : 2e+01 * (99.0 - fTemp226));
        const iTemp229: i32 = ((iTemp211) ? ((iTemp217) ? (((iTemp222 == iTemp208 ? 1 : 0) | (iTemp223 & iTemp224)) ? _icast(this.fConst1 * (((iTemp227 & iTemp223) & iTemp224) ? 0.05 * fTemp228 : fTemp228)) : 0) : 0) : iTemp209 - ((iTemp210) ? 1 : 0));
        const iTemp230: i32 = ((iTemp0) ? iSlow206 > iTemp208 : ((iTemp2) ? iSlow214 : this.iRec39[1]));
        const iTemp231: i32 = ((iTemp211) ? ((iTemp217) ? iTemp222 > iTemp208 : iTemp230) : iTemp230);
        const iTemp232: i32 = (iTemp229 == 0 ? 1 : 0) * ((iTemp231 == 0 ? 1 : 0) + 1);
        const iTemp233: i32 = iTemp232 >= 2;
        const iTemp234: i32 = iTemp232 >= 1;
        const iTemp235: i32 = max<i32>(112459776, iTemp208);
        const iTemp236: i32 = ((iTemp0) ? iSlow218 : ((iTemp2) ? iSlow216 : this.iRec40[1]));
        const iTemp237: i32 = min<i32>(63, iSlow199 + ((41 * _icast(fTemp225)) >> 6));
        const iTemp238: i32 = ((iTemp211) ? ((iTemp217) ? _icast(this.fConst1 * _fcast(((iTemp237 & 3) + 4) << ((iTemp237 >> 2) + 2))) : iTemp236) : iTemp236);
        const iTemp239: i32 = iTemp235 + ((285212672 - iTemp235) >> 24) * iTemp238;
        const iTemp240: i32 = ((iTemp0) ? iSlow206 : ((iTemp2) ? iSlow194 : this.iRec38[1]));
        const iTemp241: i32 = ((iTemp211) ? ((iTemp217) ? iTemp222 : iTemp240) : iTemp240);
        const iTemp242: i32 = (iTemp239 >= iTemp241 ? 1 : 0) >= 1;
        const iTemp243: i32 = iTemp208 - iTemp238;
        const iTemp244: i32 = (iTemp243 <= iTemp241 ? 1 : 0) >= 1;
        this.iRec36[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp241 : iTemp243) : ((iTemp234) ? ((iTemp242) ? iTemp241 : iTemp239) : iTemp208)) : iTemp208);
        const iTemp245: i32 = iTemp214 + 1;
        this.iRec37[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp245 : iTemp214) : ((iTemp234) ? ((iTemp242) ? iTemp245 : iTemp214) : iTemp214)) : iTemp214);
        const iTemp246: i32 = (iTemp245 < 4 ? 1 : 0) >= 1;
        const iTemp247: i32 = iTemp245 >= 2;
        const iTemp248: i32 = iTemp245 >= 1;
        const iTemp249: i32 = iTemp245 >= 3;
        const fTemp250: f32 = ((iTemp247) ? ((iTemp249) ? fSlow205 : fSlow211) : ((iTemp248) ? fSlow210 : fSlow182));
        const iTemp251: i32 = _icast(Mathf.max(16.0, fSlow193 + _fcast((_icast(((fTemp250 >= 2e+01 ? 1 : 0) ? fTemp250 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp250)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp252: i32 = ((iTemp246) ? iTemp251 : iTemp241);
        this.iRec38[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp252 : iTemp241) : ((iTemp234) ? ((iTemp242) ? iTemp252 : iTemp241) : iTemp241)) : iTemp241);
        const iTemp253: i32 = ((iTemp246) ? iTemp251 > iTemp241 : iTemp231);
        this.iRec39[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp253 : iTemp231) : ((iTemp234) ? ((iTemp242) ? iTemp253 : iTemp231) : iTemp231)) : iTemp231);
        const fTemp254: f32 = ((iTemp247) ? ((iTemp249) ? fSlow207 : fSlow213) : ((iTemp248) ? fSlow212 : fSlow196));
        const iTemp255: i32 = min<i32>(63, iSlow199 + ((41 * _icast(fTemp254)) >> 6));
        const iTemp256: i32 = ((iTemp246) ? _icast(this.fConst1 * _fcast(((iTemp255 & 3) + 4) << ((iTemp255 >> 2) + 2))) : iTemp238);
        this.iRec40[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp256 : iTemp238) : ((iTemp234) ? ((iTemp242) ? iTemp256 : iTemp238) : iTemp238)) : iTemp238);
        this.iRec41[0] = iTemp215;
        const iTemp257: i32 = iTemp245 == 0;
        const iTemp258: i32 = fTemp250 == 0.0;
        const fTemp259: f32 = Mathf.min(fSlow200 + fTemp254, 99.0);
        const iTemp260: i32 = fTemp259 < 77.0;
        const fTemp261: f32 = ((iTemp260) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp259)), 76))]) : 2e+01 * (99.0 - fTemp259));
        const iTemp262: i32 = ((iTemp246) ? (((iTemp251 == iTemp241 ? 1 : 0) | (iTemp257 & iTemp258)) ? _icast(this.fConst1 * (((iTemp260 & iTemp257) & iTemp258) ? 0.05 * fTemp261 : fTemp261)) : 0) : iTemp229);
        this.iRec42[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp262 : iTemp229) : ((iTemp234) ? ((iTemp242) ? iTemp262 : iTemp229) : iTemp229)) : iTemp229);
        const fTemp263: f32 = ((iTemp70) ? 0.0 : this.fRec43[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow226 + ((iSlow222) ? 0.0 : fTemp94))));
        this.fRec43[0] = fTemp263 - Mathf.floor(fTemp263);
        const iTemp264: i32 = ((iTemp2) ? 0 : this.iRec44[1]);
        const iTemp265: i32 = ((iTemp0) ? ((iSlow251 == iTemp264 ? 1 : 0) ? iSlow254 : 0) : ((iTemp2) ? iSlow249 : this.iRec50[1]));
        const iTemp266: i32 = iTemp265 != 0;
        const iTemp267: i32 = (iTemp266 & (iTemp265 <= 1 ? 1 : 0)) >= 1;
        const iTemp268: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec45[1]));
        const iTemp269: i32 = iTemp268 + 1;
        const iTemp270: i32 = ((iTemp267) ? iTemp269 : iTemp268);
        const iTemp271: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec49[1]));
        const iTemp272: i32 = ((iTemp270 < 3 ? 1 : 0) | ((iTemp270 < 4 ? 1 : 0) & (iTemp271 ^ -1))) >= 1;
        const iTemp273: i32 = (iTemp269 < 4 ? 1 : 0) >= 1;
        const iTemp274: i32 = iTemp269 >= 2;
        const iTemp275: i32 = iTemp269 >= 1;
        const iTemp276: i32 = iTemp269 >= 3;
        const fTemp277: f32 = ((iTemp274) ? ((iTemp276) ? fSlow250 : fSlow256) : ((iTemp275) ? fSlow255 : fSlow227));
        const iTemp278: i32 = _icast(Mathf.max(16.0, fSlow238 + _fcast((_icast(((fTemp277 >= 2e+01 ? 1 : 0) ? fTemp277 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp277)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp279: i32 = iTemp269 == 0;
        const iTemp280: i32 = fTemp277 == 0.0;
        const fTemp281: f32 = ((iTemp274) ? ((iTemp276) ? fSlow252 : fSlow258) : ((iTemp275) ? fSlow257 : fSlow241));
        const fTemp282: f32 = Mathf.min(fSlow245 + fTemp281, 99.0);
        const iTemp283: i32 = fTemp282 < 77.0;
        const fTemp284: f32 = ((iTemp283) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp282)), 76))]) : 2e+01 * (99.0 - fTemp282));
        const iTemp285: i32 = ((iTemp267) ? ((iTemp273) ? (((iTemp278 == iTemp264 ? 1 : 0) | (iTemp279 & iTemp280)) ? _icast(this.fConst1 * (((iTemp283 & iTemp279) & iTemp280) ? 0.05 * fTemp284 : fTemp284)) : 0) : 0) : iTemp265 - ((iTemp266) ? 1 : 0));
        const iTemp286: i32 = ((iTemp0) ? iSlow251 > iTemp264 : ((iTemp2) ? iSlow259 : this.iRec47[1]));
        const iTemp287: i32 = ((iTemp267) ? ((iTemp273) ? iTemp278 > iTemp264 : iTemp286) : iTemp286);
        const iTemp288: i32 = (iTemp285 == 0 ? 1 : 0) * ((iTemp287 == 0 ? 1 : 0) + 1);
        const iTemp289: i32 = iTemp288 >= 2;
        const iTemp290: i32 = iTemp288 >= 1;
        const iTemp291: i32 = max<i32>(112459776, iTemp264);
        const iTemp292: i32 = ((iTemp0) ? iSlow263 : ((iTemp2) ? iSlow261 : this.iRec48[1]));
        const iTemp293: i32 = min<i32>(63, iSlow244 + ((41 * _icast(fTemp281)) >> 6));
        const iTemp294: i32 = ((iTemp267) ? ((iTemp273) ? _icast(this.fConst1 * _fcast(((iTemp293 & 3) + 4) << ((iTemp293 >> 2) + 2))) : iTemp292) : iTemp292);
        const iTemp295: i32 = iTemp291 + ((285212672 - iTemp291) >> 24) * iTemp294;
        const iTemp296: i32 = ((iTemp0) ? iSlow251 : ((iTemp2) ? iSlow239 : this.iRec46[1]));
        const iTemp297: i32 = ((iTemp267) ? ((iTemp273) ? iTemp278 : iTemp296) : iTemp296);
        const iTemp298: i32 = (iTemp295 >= iTemp297 ? 1 : 0) >= 1;
        const iTemp299: i32 = iTemp264 - iTemp294;
        const iTemp300: i32 = (iTemp299 <= iTemp297 ? 1 : 0) >= 1;
        this.iRec44[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp297 : iTemp299) : ((iTemp290) ? ((iTemp298) ? iTemp297 : iTemp295) : iTemp264)) : iTemp264);
        const iTemp301: i32 = iTemp270 + 1;
        this.iRec45[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp301 : iTemp270) : ((iTemp290) ? ((iTemp298) ? iTemp301 : iTemp270) : iTemp270)) : iTemp270);
        const iTemp302: i32 = (iTemp301 < 4 ? 1 : 0) >= 1;
        const iTemp303: i32 = iTemp301 >= 2;
        const iTemp304: i32 = iTemp301 >= 1;
        const iTemp305: i32 = iTemp301 >= 3;
        const fTemp306: f32 = ((iTemp303) ? ((iTemp305) ? fSlow250 : fSlow256) : ((iTemp304) ? fSlow255 : fSlow227));
        const iTemp307: i32 = _icast(Mathf.max(16.0, fSlow238 + _fcast((_icast(((fTemp306 >= 2e+01 ? 1 : 0) ? fTemp306 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp306)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp308: i32 = ((iTemp302) ? iTemp307 : iTemp297);
        this.iRec46[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp308 : iTemp297) : ((iTemp290) ? ((iTemp298) ? iTemp308 : iTemp297) : iTemp297)) : iTemp297);
        const iTemp309: i32 = ((iTemp302) ? iTemp307 > iTemp297 : iTemp287);
        this.iRec47[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp309 : iTemp287) : ((iTemp290) ? ((iTemp298) ? iTemp309 : iTemp287) : iTemp287)) : iTemp287);
        const fTemp310: f32 = ((iTemp303) ? ((iTemp305) ? fSlow252 : fSlow258) : ((iTemp304) ? fSlow257 : fSlow241));
        const iTemp311: i32 = min<i32>(63, iSlow244 + ((41 * _icast(fTemp310)) >> 6));
        const iTemp312: i32 = ((iTemp302) ? _icast(this.fConst1 * _fcast(((iTemp311 & 3) + 4) << ((iTemp311 >> 2) + 2))) : iTemp294);
        this.iRec48[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp312 : iTemp294) : ((iTemp290) ? ((iTemp298) ? iTemp312 : iTemp294) : iTemp294)) : iTemp294);
        this.iRec49[0] = iTemp271;
        const iTemp313: i32 = iTemp301 == 0;
        const iTemp314: i32 = fTemp306 == 0.0;
        const fTemp315: f32 = Mathf.min(fSlow245 + fTemp310, 99.0);
        const iTemp316: i32 = fTemp315 < 77.0;
        const fTemp317: f32 = ((iTemp316) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp315)), 76))]) : 2e+01 * (99.0 - fTemp315));
        const iTemp318: i32 = ((iTemp302) ? (((iTemp307 == iTemp297 ? 1 : 0) | (iTemp313 & iTemp314)) ? _icast(this.fConst1 * (((iTemp316 & iTemp313) & iTemp314) ? 0.05 * fTemp317 : fTemp317)) : 0) : iTemp285);
        this.iRec50[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp318 : iTemp285) : ((iTemp290) ? ((iTemp298) ? iTemp318 : iTemp285) : iTemp285)) : iTemp285);
        const fTemp319: f32 = ((iTemp70) ? 0.0 : this.fRec51[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow271 + ((iSlow267) ? 0.0 : fTemp94))));
        this.fRec51[0] = fTemp319 - Mathf.floor(fTemp319);
        const iTemp320: i32 = ((iTemp2) ? 0 : this.iRec52[1]);
        const iTemp321: i32 = ((iTemp0) ? ((iSlow296 == iTemp320 ? 1 : 0) ? iSlow299 : 0) : ((iTemp2) ? iSlow294 : this.iRec58[1]));
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
        const fTemp333: f32 = ((iTemp330) ? ((iTemp332) ? fSlow295 : fSlow301) : ((iTemp331) ? fSlow300 : fSlow272));
        const iTemp334: i32 = _icast(Mathf.max(16.0, fSlow283 + _fcast((_icast(((fTemp333 >= 2e+01 ? 1 : 0) ? fTemp333 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp333)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp335: i32 = iTemp325 == 0;
        const iTemp336: i32 = fTemp333 == 0.0;
        const fTemp337: f32 = ((iTemp330) ? ((iTemp332) ? fSlow297 : fSlow303) : ((iTemp331) ? fSlow302 : fSlow286));
        const fTemp338: f32 = Mathf.min(fSlow290 + fTemp337, 99.0);
        const iTemp339: i32 = fTemp338 < 77.0;
        const fTemp340: f32 = ((iTemp339) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp338)), 76))]) : 2e+01 * (99.0 - fTemp338));
        const iTemp341: i32 = ((iTemp323) ? ((iTemp329) ? (((iTemp334 == iTemp320 ? 1 : 0) | (iTemp335 & iTemp336)) ? _icast(this.fConst1 * (((iTemp339 & iTemp335) & iTemp336) ? 0.05 * fTemp340 : fTemp340)) : 0) : 0) : iTemp321 - ((iTemp322) ? 1 : 0));
        const iTemp342: i32 = ((iTemp0) ? iSlow296 > iTemp320 : ((iTemp2) ? iSlow304 : this.iRec55[1]));
        const iTemp343: i32 = ((iTemp323) ? ((iTemp329) ? iTemp334 > iTemp320 : iTemp342) : iTemp342);
        const iTemp344: i32 = (iTemp341 == 0 ? 1 : 0) * ((iTemp343 == 0 ? 1 : 0) + 1);
        const iTemp345: i32 = iTemp344 >= 2;
        const iTemp346: i32 = iTemp344 >= 1;
        const iTemp347: i32 = max<i32>(112459776, iTemp320);
        const iTemp348: i32 = ((iTemp0) ? iSlow308 : ((iTemp2) ? iSlow306 : this.iRec56[1]));
        const iTemp349: i32 = min<i32>(63, iSlow289 + ((41 * _icast(fTemp337)) >> 6));
        const iTemp350: i32 = ((iTemp323) ? ((iTemp329) ? _icast(this.fConst1 * _fcast(((iTemp349 & 3) + 4) << ((iTemp349 >> 2) + 2))) : iTemp348) : iTemp348);
        const iTemp351: i32 = iTemp347 + ((285212672 - iTemp347) >> 24) * iTemp350;
        const iTemp352: i32 = ((iTemp0) ? iSlow296 : ((iTemp2) ? iSlow284 : this.iRec54[1]));
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
        const fTemp362: f32 = ((iTemp359) ? ((iTemp361) ? fSlow295 : fSlow301) : ((iTemp360) ? fSlow300 : fSlow272));
        const iTemp363: i32 = _icast(Mathf.max(16.0, fSlow283 + _fcast((_icast(((fTemp362 >= 2e+01 ? 1 : 0) ? fTemp362 + 28.0 : _fcast(Dx7_alg2_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp362)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp364: i32 = ((iTemp358) ? iTemp363 : iTemp353);
        this.iRec54[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp364 : iTemp353) : ((iTemp346) ? ((iTemp354) ? iTemp364 : iTemp353) : iTemp353)) : iTemp353);
        const iTemp365: i32 = ((iTemp358) ? iTemp363 > iTemp353 : iTemp343);
        this.iRec55[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp365 : iTemp343) : ((iTemp346) ? ((iTemp354) ? iTemp365 : iTemp343) : iTemp343)) : iTemp343);
        const fTemp366: f32 = ((iTemp359) ? ((iTemp361) ? fSlow297 : fSlow303) : ((iTemp360) ? fSlow302 : fSlow286));
        const iTemp367: i32 = min<i32>(63, iSlow289 + ((41 * _icast(fTemp366)) >> 6));
        const iTemp368: i32 = ((iTemp358) ? _icast(this.fConst1 * _fcast(((iTemp367 & 3) + 4) << ((iTemp367 >> 2) + 2))) : iTemp350);
        this.iRec56[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp368 : iTemp350) : ((iTemp346) ? ((iTemp354) ? iTemp368 : iTemp350) : iTemp350)) : iTemp350);
        this.iRec57[0] = iTemp327;
        const iTemp369: i32 = iTemp357 == 0;
        const iTemp370: i32 = fTemp362 == 0.0;
        const fTemp371: f32 = Mathf.min(fSlow290 + fTemp366, 99.0);
        const iTemp372: i32 = fTemp371 < 77.0;
        const fTemp373: f32 = ((iTemp372) ? _fcast(Dx7_alg2_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp371)), 76))]) : 2e+01 * (99.0 - fTemp371));
        const iTemp374: i32 = ((iTemp358) ? (((iTemp363 == iTemp353 ? 1 : 0) | (iTemp369 & iTemp370)) ? _icast(this.fConst1 * (((iTemp372 & iTemp369) & iTemp370) ? 0.05 * fTemp373 : fTemp373)) : 0) : iTemp341);
        this.iRec58[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp374 : iTemp341) : ((iTemp346) ? ((iTemp354) ? iTemp374 : iTemp341) : iTemp341)) : iTemp341);
        const fTemp375: f32 = ((iTemp70) ? 0.0 : this.fRec59[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow316 + ((iSlow312) ? 0.0 : fTemp94))));
        this.fRec59[0] = fTemp375 - Mathf.floor(fTemp375);
        const fTemp376: f32 = 0.5 * (Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec0[0] + (-234881024 - ((iSlow48) ? _icast(5.9604645e-08 * _fcast(this.iRec0[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow65 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec12[0] + this.fRec19[0])) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec28[0] + (-234881024 - ((iSlow175) ? _icast(5.9604645e-08 * _fcast(this.iRec28[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow176 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec35[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec36[0] + (-234881024 - ((iSlow220) ? _icast(5.9604645e-08 * _fcast(this.iRec36[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow221 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec43[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec44[0] + (-234881024 - ((iSlow265) ? _icast(5.9604645e-08 * _fcast(this.iRec44[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow266 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec51[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec52[0] + (-234881024 - ((iSlow310) ? _icast(5.9604645e-08 * _fcast(this.iRec52[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow311 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec59[0]))))))));
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
        this.iRec20[1] = this.iRec20[0];
        this.iRec21[1] = this.iRec21[0];
        this.iRec22[1] = this.iRec22[0];
        this.iRec23[1] = this.iRec23[0];
        this.iRec24[1] = this.iRec24[0];
        this.iRec25[1] = this.iRec25[0];
        this.iRec26[1] = this.iRec26[0];
        this.fRec27[1] = this.fRec27[0];
        this.fRec19[1] = this.fRec19[0];
        this.iRec28[1] = this.iRec28[0];
        this.iRec29[1] = this.iRec29[0];
        this.iRec30[1] = this.iRec30[0];
        this.iRec31[1] = this.iRec31[0];
        this.iRec32[1] = this.iRec32[0];
        this.iRec33[1] = this.iRec33[0];
        this.iRec34[1] = this.iRec34[0];
        this.fRec35[1] = this.fRec35[0];
        this.iRec36[1] = this.iRec36[0];
        this.iRec37[1] = this.iRec37[0];
        this.iRec38[1] = this.iRec38[0];
        this.iRec39[1] = this.iRec39[0];
        this.iRec40[1] = this.iRec40[0];
        this.iRec41[1] = this.iRec41[0];
        this.iRec42[1] = this.iRec42[0];
        this.fRec43[1] = this.fRec43[0];
        this.iRec44[1] = this.iRec44[0];
        this.iRec45[1] = this.iRec45[0];
        this.iRec46[1] = this.iRec46[0];
        this.iRec47[1] = this.iRec47[0];
        this.iRec48[1] = this.iRec48[0];
        this.iRec49[1] = this.iRec49[0];
        this.iRec50[1] = this.iRec50[0];
        this.fRec51[1] = this.fRec51[0];
        this.iRec52[1] = this.iRec52[0];
        this.iRec53[1] = this.iRec53[0];
        this.iRec54[1] = this.iRec54[0];
        this.iRec55[1] = this.iRec55[0];
        this.iRec56[1] = this.iRec56[0];
        this.iRec57[1] = this.iRec57[0];
        this.iRec58[1] = this.iRec58[0];
        this.fRec59[1] = this.fRec59[0];

        if (Mathf.abs(output) < 0.00001) {
            this.silentSamples++;
        } else {
            this.silentSamples = 0;
        }

        this.channel.signal.addMonoSignal(output, 0.5, 0.5);
    }
}

export class Dx7_alg2Channel extends MidiChannel {
    private _nrpnMsb: u8 = 127;
    private _nrpnLsb: u8 = 127;

    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case 99: this._nrpnMsb = value; break;
            case 98: this._nrpnLsb = value; break;
            case 6:
                this._setParam(<u16>this._nrpnMsb * 128 + <u16>this._nrpnLsb, value);
                break;
        }
    }

    private _setParam(param: u16, value: u8): void {
        switch (param) {
            case 0: dx7_alg2_fHslider54 = <f32>value / 127.0 * 7; break;
            case 1: dx7_alg2_fHslider2 = -24 + <f32>value / 127.0 * 48; break;
            case 2: dx7_alg2_fHslider22 = <f32>value / 127.0; break;
            case 3: dx7_alg2_fHslider27 = <f32>value / 127.0 * 99; break;
            case 4: dx7_alg2_fHslider30 = <f32>value / 127.0 * 99; break;
            case 5: dx7_alg2_fHslider31 = <f32>value / 127.0 * 99; break;
            case 6: dx7_alg2_fHslider26 = <f32>value / 127.0 * 99; break;
            case 7: dx7_alg2_fHslider29 = <f32>value / 127.0 * 99; break;
            case 8: dx7_alg2_fHslider32 = <f32>value / 127.0 * 99; break;
            case 9: dx7_alg2_fHslider33 = <f32>value / 127.0 * 99; break;
            case 10: dx7_alg2_fHslider28 = <f32>value / 127.0 * 99; break;
            case 11: dx7_alg2_fEntry2 = <f32>value / 127.0 * 5; break;
            case 12: dx7_alg2_fHslider20 = <f32>value / 127.0 * 99; break;
            case 13: dx7_alg2_fHslider21 = <f32>value / 127.0 * 99; break;
            case 14: dx7_alg2_fHslider34 = <f32>value / 127.0 * 99; break;
            case 15: dx7_alg2_fHslider18 = <f32>value / 127.0 * 99; break;
            case 16: dx7_alg2_fHslider19 = <f32>value / 127.0; break;
            case 17: dx7_alg2_fHslider35 = <f32>value / 127.0 * 7; break;
            case 18: dx7_alg2_fHslider23 = -7 + <f32>value / 127.0 * 14; break;
            case 19: dx7_alg2_fHslider24 = <f32>value / 127.0 * 31; break;
            case 20: dx7_alg2_fHslider25 = <f32>value / 127.0 * 99; break;
            case 21: dx7_alg2_fHslider0 = <f32>value / 127.0 * 99; break;
            case 22: dx7_alg2_fHslider13 = <f32>value / 127.0 * 99; break;
            case 23: dx7_alg2_fHslider14 = <f32>value / 127.0 * 99; break;
            case 24: dx7_alg2_fHslider11 = <f32>value / 127.0 * 99; break;
            case 25: dx7_alg2_fHslider9 = <f32>value / 127.0 * 99; break;
            case 26: dx7_alg2_fHslider15 = <f32>value / 127.0 * 99; break;
            case 27: dx7_alg2_fHslider16 = <f32>value / 127.0 * 99; break;
            case 28: dx7_alg2_fHslider12 = <f32>value / 127.0 * 99; break;
            case 29: dx7_alg2_fHslider1 = <f32>value / 127.0 * 99; break;
            case 30: dx7_alg2_fHslider7 = <f32>value / 127.0 * 7; break;
            case 31: dx7_alg2_fHslider17 = <f32>value / 127.0 * 3; break;
            case 32: dx7_alg2_fHslider10 = <f32>value / 127.0 * 7; break;
            case 33: dx7_alg2_fHslider4 = <f32>value / 127.0 * 99; break;
            case 34: dx7_alg2_fHslider5 = <f32>value / 127.0 * 99; break;
            case 35: dx7_alg2_fHslider6 = <f32>value / 127.0 * 99; break;
            case 36: dx7_alg2_fEntry0 = <f32>value / 127.0 * 3; break;
            case 37: dx7_alg2_fEntry1 = <f32>value / 127.0 * 3; break;
            case 38: dx7_alg2_fHslider51 = -7 + <f32>value / 127.0 * 14; break;
            case 39: dx7_alg2_fHslider52 = <f32>value / 127.0 * 31; break;
            case 40: dx7_alg2_fHslider53 = <f32>value / 127.0 * 99; break;
            case 41: dx7_alg2_fHslider36 = <f32>value / 127.0 * 99; break;
            case 42: dx7_alg2_fHslider46 = <f32>value / 127.0 * 99; break;
            case 43: dx7_alg2_fHslider47 = <f32>value / 127.0 * 99; break;
            case 44: dx7_alg2_fHslider44 = <f32>value / 127.0 * 99; break;
            case 45: dx7_alg2_fHslider42 = <f32>value / 127.0 * 99; break;
            case 46: dx7_alg2_fHslider48 = <f32>value / 127.0 * 99; break;
            case 47: dx7_alg2_fHslider49 = <f32>value / 127.0 * 99; break;
            case 48: dx7_alg2_fHslider45 = <f32>value / 127.0 * 99; break;
            case 49: dx7_alg2_fHslider37 = <f32>value / 127.0 * 99; break;
            case 50: dx7_alg2_fHslider41 = <f32>value / 127.0 * 7; break;
            case 51: dx7_alg2_fHslider50 = <f32>value / 127.0 * 3; break;
            case 52: dx7_alg2_fHslider43 = <f32>value / 127.0 * 7; break;
            case 53: dx7_alg2_fHslider38 = <f32>value / 127.0 * 99; break;
            case 54: dx7_alg2_fHslider39 = <f32>value / 127.0 * 99; break;
            case 55: dx7_alg2_fHslider40 = <f32>value / 127.0 * 99; break;
            case 56: dx7_alg2_fEntry3 = <f32>value / 127.0 * 3; break;
            case 57: dx7_alg2_fEntry4 = <f32>value / 127.0 * 3; break;
            case 58: dx7_alg2_fHslider70 = -7 + <f32>value / 127.0 * 14; break;
            case 59: dx7_alg2_fHslider71 = <f32>value / 127.0 * 31; break;
            case 60: dx7_alg2_fHslider72 = <f32>value / 127.0 * 99; break;
            case 61: dx7_alg2_fHslider55 = <f32>value / 127.0 * 99; break;
            case 62: dx7_alg2_fHslider65 = <f32>value / 127.0 * 99; break;
            case 63: dx7_alg2_fHslider66 = <f32>value / 127.0 * 99; break;
            case 64: dx7_alg2_fHslider63 = <f32>value / 127.0 * 99; break;
            case 65: dx7_alg2_fHslider61 = <f32>value / 127.0 * 99; break;
            case 66: dx7_alg2_fHslider67 = <f32>value / 127.0 * 99; break;
            case 67: dx7_alg2_fHslider68 = <f32>value / 127.0 * 99; break;
            case 68: dx7_alg2_fHslider64 = <f32>value / 127.0 * 99; break;
            case 69: dx7_alg2_fHslider56 = <f32>value / 127.0 * 99; break;
            case 70: dx7_alg2_fHslider60 = <f32>value / 127.0 * 7; break;
            case 71: dx7_alg2_fHslider69 = <f32>value / 127.0 * 3; break;
            case 72: dx7_alg2_fHslider62 = <f32>value / 127.0 * 7; break;
            case 73: dx7_alg2_fHslider57 = <f32>value / 127.0 * 99; break;
            case 74: dx7_alg2_fHslider58 = <f32>value / 127.0 * 99; break;
            case 75: dx7_alg2_fHslider59 = <f32>value / 127.0 * 99; break;
            case 76: dx7_alg2_fEntry5 = <f32>value / 127.0 * 3; break;
            case 77: dx7_alg2_fEntry6 = <f32>value / 127.0 * 3; break;
            case 78: dx7_alg2_fHslider88 = -7 + <f32>value / 127.0 * 14; break;
            case 79: dx7_alg2_fHslider89 = <f32>value / 127.0 * 31; break;
            case 80: dx7_alg2_fHslider90 = <f32>value / 127.0 * 99; break;
            case 81: dx7_alg2_fHslider73 = <f32>value / 127.0 * 99; break;
            case 82: dx7_alg2_fHslider83 = <f32>value / 127.0 * 99; break;
            case 83: dx7_alg2_fHslider84 = <f32>value / 127.0 * 99; break;
            case 84: dx7_alg2_fHslider81 = <f32>value / 127.0 * 99; break;
            case 85: dx7_alg2_fHslider79 = <f32>value / 127.0 * 99; break;
            case 86: dx7_alg2_fHslider85 = <f32>value / 127.0 * 99; break;
            case 87: dx7_alg2_fHslider86 = <f32>value / 127.0 * 99; break;
            case 88: dx7_alg2_fHslider82 = <f32>value / 127.0 * 99; break;
            case 89: dx7_alg2_fHslider74 = <f32>value / 127.0 * 99; break;
            case 90: dx7_alg2_fHslider78 = <f32>value / 127.0 * 7; break;
            case 91: dx7_alg2_fHslider87 = <f32>value / 127.0 * 3; break;
            case 92: dx7_alg2_fHslider80 = <f32>value / 127.0 * 7; break;
            case 93: dx7_alg2_fHslider75 = <f32>value / 127.0 * 99; break;
            case 94: dx7_alg2_fHslider76 = <f32>value / 127.0 * 99; break;
            case 95: dx7_alg2_fHslider77 = <f32>value / 127.0 * 99; break;
            case 96: dx7_alg2_fEntry7 = <f32>value / 127.0 * 3; break;
            case 97: dx7_alg2_fEntry8 = <f32>value / 127.0 * 3; break;
            case 98: dx7_alg2_fHslider106 = -7 + <f32>value / 127.0 * 14; break;
            case 99: dx7_alg2_fHslider107 = <f32>value / 127.0 * 31; break;
            case 100: dx7_alg2_fHslider108 = <f32>value / 127.0 * 99; break;
            case 101: dx7_alg2_fHslider91 = <f32>value / 127.0 * 99; break;
            case 102: dx7_alg2_fHslider101 = <f32>value / 127.0 * 99; break;
            case 103: dx7_alg2_fHslider102 = <f32>value / 127.0 * 99; break;
            case 104: dx7_alg2_fHslider99 = <f32>value / 127.0 * 99; break;
            case 105: dx7_alg2_fHslider97 = <f32>value / 127.0 * 99; break;
            case 106: dx7_alg2_fHslider103 = <f32>value / 127.0 * 99; break;
            case 107: dx7_alg2_fHslider104 = <f32>value / 127.0 * 99; break;
            case 108: dx7_alg2_fHslider100 = <f32>value / 127.0 * 99; break;
            case 109: dx7_alg2_fHslider92 = <f32>value / 127.0 * 99; break;
            case 110: dx7_alg2_fHslider96 = <f32>value / 127.0 * 7; break;
            case 111: dx7_alg2_fHslider105 = <f32>value / 127.0 * 3; break;
            case 112: dx7_alg2_fHslider98 = <f32>value / 127.0 * 7; break;
            case 113: dx7_alg2_fHslider93 = <f32>value / 127.0 * 99; break;
            case 114: dx7_alg2_fHslider94 = <f32>value / 127.0 * 99; break;
            case 115: dx7_alg2_fHslider95 = <f32>value / 127.0 * 99; break;
            case 116: dx7_alg2_fEntry9 = <f32>value / 127.0 * 3; break;
            case 117: dx7_alg2_fEntry10 = <f32>value / 127.0 * 3; break;
            case 118: dx7_alg2_fHslider124 = -7 + <f32>value / 127.0 * 14; break;
            case 119: dx7_alg2_fHslider125 = <f32>value / 127.0 * 31; break;
            case 120: dx7_alg2_fHslider126 = <f32>value / 127.0 * 99; break;
            case 121: dx7_alg2_fHslider109 = <f32>value / 127.0 * 99; break;
            case 122: dx7_alg2_fHslider119 = <f32>value / 127.0 * 99; break;
            case 123: dx7_alg2_fHslider120 = <f32>value / 127.0 * 99; break;
            case 124: dx7_alg2_fHslider117 = <f32>value / 127.0 * 99; break;
            case 125: dx7_alg2_fHslider115 = <f32>value / 127.0 * 99; break;
            case 126: dx7_alg2_fHslider121 = <f32>value / 127.0 * 99; break;
            case 127: dx7_alg2_fHslider122 = <f32>value / 127.0 * 99; break;
            case 128: dx7_alg2_fHslider118 = <f32>value / 127.0 * 99; break;
            case 129: dx7_alg2_fHslider110 = <f32>value / 127.0 * 99; break;
            case 130: dx7_alg2_fHslider114 = <f32>value / 127.0 * 7; break;
            case 131: dx7_alg2_fHslider123 = <f32>value / 127.0 * 3; break;
            case 132: dx7_alg2_fHslider116 = <f32>value / 127.0 * 7; break;
            case 133: dx7_alg2_fHslider111 = <f32>value / 127.0 * 99; break;
            case 134: dx7_alg2_fHslider112 = <f32>value / 127.0 * 99; break;
            case 135: dx7_alg2_fHslider113 = <f32>value / 127.0 * 99; break;
            case 136: dx7_alg2_fEntry11 = <f32>value / 127.0 * 3; break;
            case 137: dx7_alg2_fEntry12 = <f32>value / 127.0 * 3; break;
        }
    }
}

// Feedback (NRPN 0)
let dx7_alg5_bells_fHslider126: f32 = 0;
// Transpose (NRPN 1)
let dx7_alg5_bells_fHslider2: f32 = 0;
// Osc Key Sync (NRPN 2)
let dx7_alg5_bells_fHslider22: f32 = 1;
// L1 (NRPN 3)
let dx7_alg5_bells_fHslider27: f32 = 50;
// L2 (NRPN 4)
let dx7_alg5_bells_fHslider30: f32 = 50;
// L3 (NRPN 5)
let dx7_alg5_bells_fHslider31: f32 = 50;
// L4 (NRPN 6)
let dx7_alg5_bells_fHslider26: f32 = 50;
// R1 (NRPN 7)
let dx7_alg5_bells_fHslider29: f32 = 99;
// R2 (NRPN 8)
let dx7_alg5_bells_fHslider32: f32 = 99;
// R3 (NRPN 9)
let dx7_alg5_bells_fHslider33: f32 = 99;
// R4 (NRPN 10)
let dx7_alg5_bells_fHslider28: f32 = 99;
// Wave (NRPN 11)
let dx7_alg5_bells_fEntry2: f32 = 0;
// Speed (NRPN 12)
let dx7_alg5_bells_fHslider20: f32 = 35;
// Delay (NRPN 13)
let dx7_alg5_bells_fHslider21: f32 = 0;
// PMD (NRPN 14)
let dx7_alg5_bells_fHslider34: f32 = 0;
// AMD (NRPN 15)
let dx7_alg5_bells_fHslider18: f32 = 0;
// Sync (NRPN 16)
let dx7_alg5_bells_fHslider19: f32 = 1;
// P Mod Sens (NRPN 17)
let dx7_alg5_bells_fHslider35: f32 = 3;
// Tune (NRPN 18)
let dx7_alg5_bells_fHslider23: f32 = 0;
// Coarse (NRPN 19)
let dx7_alg5_bells_fHslider24: f32 = 1;
// Fine (NRPN 20)
let dx7_alg5_bells_fHslider25: f32 = 0;
// L1 (NRPN 21)
let dx7_alg5_bells_fHslider0: f32 = 99;
// L2 (NRPN 22)
let dx7_alg5_bells_fHslider13: f32 = 99;
// L3 (NRPN 23)
let dx7_alg5_bells_fHslider14: f32 = 99;
// L4 (NRPN 24)
let dx7_alg5_bells_fHslider11: f32 = 0;
// R1 (NRPN 25)
let dx7_alg5_bells_fHslider9: f32 = 99;
// R2 (NRPN 26)
let dx7_alg5_bells_fHslider15: f32 = 99;
// R3 (NRPN 27)
let dx7_alg5_bells_fHslider16: f32 = 99;
// R4 (NRPN 28)
let dx7_alg5_bells_fHslider12: f32 = 99;
// Level (NRPN 29)
let dx7_alg5_bells_fHslider1: f32 = 99;
// Key Vel (NRPN 30)
let dx7_alg5_bells_fHslider7: f32 = 0;
// A Mod Sens (NRPN 31)
let dx7_alg5_bells_fHslider17: f32 = 0;
// Rate Scaling (NRPN 32)
let dx7_alg5_bells_fHslider10: f32 = 0;
// Breakpoint (NRPN 33)
let dx7_alg5_bells_fHslider4: f32 = 0;
// L Depth (NRPN 34)
let dx7_alg5_bells_fHslider5: f32 = 0;
// R Depth (NRPN 35)
let dx7_alg5_bells_fHslider6: f32 = 0;
// L Curve (NRPN 36)
let dx7_alg5_bells_fEntry0: f32 = 0;
// R Curve (NRPN 37)
let dx7_alg5_bells_fEntry1: f32 = 0;
// Tune (NRPN 38)
let dx7_alg5_bells_fHslider51: f32 = 0;
// Coarse (NRPN 39)
let dx7_alg5_bells_fHslider52: f32 = 1;
// Fine (NRPN 40)
let dx7_alg5_bells_fHslider53: f32 = 0;
// L1 (NRPN 41)
let dx7_alg5_bells_fHslider36: f32 = 99;
// L2 (NRPN 42)
let dx7_alg5_bells_fHslider46: f32 = 99;
// L3 (NRPN 43)
let dx7_alg5_bells_fHslider47: f32 = 99;
// L4 (NRPN 44)
let dx7_alg5_bells_fHslider44: f32 = 0;
// R1 (NRPN 45)
let dx7_alg5_bells_fHslider42: f32 = 99;
// R2 (NRPN 46)
let dx7_alg5_bells_fHslider48: f32 = 99;
// R3 (NRPN 47)
let dx7_alg5_bells_fHslider49: f32 = 99;
// R4 (NRPN 48)
let dx7_alg5_bells_fHslider45: f32 = 99;
// Level (NRPN 49)
let dx7_alg5_bells_fHslider37: f32 = 0;
// Key Vel (NRPN 50)
let dx7_alg5_bells_fHslider41: f32 = 0;
// A Mod Sens (NRPN 51)
let dx7_alg5_bells_fHslider50: f32 = 0;
// Rate Scaling (NRPN 52)
let dx7_alg5_bells_fHslider43: f32 = 0;
// Breakpoint (NRPN 53)
let dx7_alg5_bells_fHslider38: f32 = 0;
// L Depth (NRPN 54)
let dx7_alg5_bells_fHslider39: f32 = 0;
// R Depth (NRPN 55)
let dx7_alg5_bells_fHslider40: f32 = 0;
// L Curve (NRPN 56)
let dx7_alg5_bells_fEntry3: f32 = 0;
// R Curve (NRPN 57)
let dx7_alg5_bells_fEntry4: f32 = 0;
// Tune (NRPN 58)
let dx7_alg5_bells_fHslider69: f32 = 0;
// Coarse (NRPN 59)
let dx7_alg5_bells_fHslider70: f32 = 1;
// Fine (NRPN 60)
let dx7_alg5_bells_fHslider71: f32 = 0;
// L1 (NRPN 61)
let dx7_alg5_bells_fHslider54: f32 = 99;
// L2 (NRPN 62)
let dx7_alg5_bells_fHslider64: f32 = 99;
// L3 (NRPN 63)
let dx7_alg5_bells_fHslider65: f32 = 99;
// L4 (NRPN 64)
let dx7_alg5_bells_fHslider62: f32 = 0;
// R1 (NRPN 65)
let dx7_alg5_bells_fHslider60: f32 = 99;
// R2 (NRPN 66)
let dx7_alg5_bells_fHslider66: f32 = 99;
// R3 (NRPN 67)
let dx7_alg5_bells_fHslider67: f32 = 99;
// R4 (NRPN 68)
let dx7_alg5_bells_fHslider63: f32 = 99;
// Level (NRPN 69)
let dx7_alg5_bells_fHslider55: f32 = 0;
// Key Vel (NRPN 70)
let dx7_alg5_bells_fHslider59: f32 = 0;
// A Mod Sens (NRPN 71)
let dx7_alg5_bells_fHslider68: f32 = 0;
// Rate Scaling (NRPN 72)
let dx7_alg5_bells_fHslider61: f32 = 0;
// Breakpoint (NRPN 73)
let dx7_alg5_bells_fHslider56: f32 = 0;
// L Depth (NRPN 74)
let dx7_alg5_bells_fHslider57: f32 = 0;
// R Depth (NRPN 75)
let dx7_alg5_bells_fHslider58: f32 = 0;
// L Curve (NRPN 76)
let dx7_alg5_bells_fEntry5: f32 = 0;
// R Curve (NRPN 77)
let dx7_alg5_bells_fEntry6: f32 = 0;
// Tune (NRPN 78)
let dx7_alg5_bells_fHslider87: f32 = 0;
// Coarse (NRPN 79)
let dx7_alg5_bells_fHslider88: f32 = 1;
// Fine (NRPN 80)
let dx7_alg5_bells_fHslider89: f32 = 0;
// L1 (NRPN 81)
let dx7_alg5_bells_fHslider72: f32 = 99;
// L2 (NRPN 82)
let dx7_alg5_bells_fHslider82: f32 = 99;
// L3 (NRPN 83)
let dx7_alg5_bells_fHslider83: f32 = 99;
// L4 (NRPN 84)
let dx7_alg5_bells_fHslider80: f32 = 0;
// R1 (NRPN 85)
let dx7_alg5_bells_fHslider78: f32 = 99;
// R2 (NRPN 86)
let dx7_alg5_bells_fHslider84: f32 = 99;
// R3 (NRPN 87)
let dx7_alg5_bells_fHslider85: f32 = 99;
// R4 (NRPN 88)
let dx7_alg5_bells_fHslider81: f32 = 99;
// Level (NRPN 89)
let dx7_alg5_bells_fHslider73: f32 = 0;
// Key Vel (NRPN 90)
let dx7_alg5_bells_fHslider77: f32 = 0;
// A Mod Sens (NRPN 91)
let dx7_alg5_bells_fHslider86: f32 = 0;
// Rate Scaling (NRPN 92)
let dx7_alg5_bells_fHslider79: f32 = 0;
// Breakpoint (NRPN 93)
let dx7_alg5_bells_fHslider74: f32 = 0;
// L Depth (NRPN 94)
let dx7_alg5_bells_fHslider75: f32 = 0;
// R Depth (NRPN 95)
let dx7_alg5_bells_fHslider76: f32 = 0;
// L Curve (NRPN 96)
let dx7_alg5_bells_fEntry7: f32 = 0;
// R Curve (NRPN 97)
let dx7_alg5_bells_fEntry8: f32 = 0;
// Tune (NRPN 98)
let dx7_alg5_bells_fHslider105: f32 = 0;
// Coarse (NRPN 99)
let dx7_alg5_bells_fHslider106: f32 = 1;
// Fine (NRPN 100)
let dx7_alg5_bells_fHslider107: f32 = 0;
// L1 (NRPN 101)
let dx7_alg5_bells_fHslider90: f32 = 99;
// L2 (NRPN 102)
let dx7_alg5_bells_fHslider100: f32 = 99;
// L3 (NRPN 103)
let dx7_alg5_bells_fHslider101: f32 = 99;
// L4 (NRPN 104)
let dx7_alg5_bells_fHslider98: f32 = 0;
// R1 (NRPN 105)
let dx7_alg5_bells_fHslider96: f32 = 99;
// R2 (NRPN 106)
let dx7_alg5_bells_fHslider102: f32 = 99;
// R3 (NRPN 107)
let dx7_alg5_bells_fHslider103: f32 = 99;
// R4 (NRPN 108)
let dx7_alg5_bells_fHslider99: f32 = 99;
// Level (NRPN 109)
let dx7_alg5_bells_fHslider91: f32 = 0;
// Key Vel (NRPN 110)
let dx7_alg5_bells_fHslider95: f32 = 0;
// A Mod Sens (NRPN 111)
let dx7_alg5_bells_fHslider104: f32 = 0;
// Rate Scaling (NRPN 112)
let dx7_alg5_bells_fHslider97: f32 = 0;
// Breakpoint (NRPN 113)
let dx7_alg5_bells_fHslider92: f32 = 0;
// L Depth (NRPN 114)
let dx7_alg5_bells_fHslider93: f32 = 0;
// R Depth (NRPN 115)
let dx7_alg5_bells_fHslider94: f32 = 0;
// L Curve (NRPN 116)
let dx7_alg5_bells_fEntry9: f32 = 0;
// R Curve (NRPN 117)
let dx7_alg5_bells_fEntry10: f32 = 0;
// Tune (NRPN 118)
let dx7_alg5_bells_fHslider123: f32 = 0;
// Coarse (NRPN 119)
let dx7_alg5_bells_fHslider124: f32 = 1;
// Fine (NRPN 120)
let dx7_alg5_bells_fHslider125: f32 = 0;
// L1 (NRPN 121)
let dx7_alg5_bells_fHslider108: f32 = 99;
// L2 (NRPN 122)
let dx7_alg5_bells_fHslider118: f32 = 99;
// L3 (NRPN 123)
let dx7_alg5_bells_fHslider119: f32 = 99;
// L4 (NRPN 124)
let dx7_alg5_bells_fHslider116: f32 = 0;
// R1 (NRPN 125)
let dx7_alg5_bells_fHslider114: f32 = 99;
// R2 (NRPN 126)
let dx7_alg5_bells_fHslider120: f32 = 99;
// R3 (NRPN 127)
let dx7_alg5_bells_fHslider121: f32 = 99;
// R4 (NRPN 128)
let dx7_alg5_bells_fHslider117: f32 = 99;
// Level (NRPN 129)
let dx7_alg5_bells_fHslider109: f32 = 0;
// Key Vel (NRPN 130)
let dx7_alg5_bells_fHslider113: f32 = 0;
// A Mod Sens (NRPN 131)
let dx7_alg5_bells_fHslider122: f32 = 0;
// Rate Scaling (NRPN 132)
let dx7_alg5_bells_fHslider115: f32 = 0;
// Breakpoint (NRPN 133)
let dx7_alg5_bells_fHslider110: f32 = 0;
// L Depth (NRPN 134)
let dx7_alg5_bells_fHslider111: f32 = 0;
// R Depth (NRPN 135)
let dx7_alg5_bells_fHslider112: f32 = 0;
// L Curve (NRPN 136)
let dx7_alg5_bells_fEntry11: f32 = 0;
// R Curve (NRPN 137)
let dx7_alg5_bells_fEntry12: f32 = 0;

const Dx7_alg5_bells_wave_SIG0Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 5, 9, 13, 17, 20, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 42, 43, 45, 46]);
const Dx7_alg5_bells_wave_SIG1Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14, 16, 19, 23, 27, 33, 39, 47, 56, 66, 80, 94, 110, 126, 142, 158, 174, 190, 206, 222, 238, 250]);
const Dx7_alg5_bells_wave_SIG2Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 70, 86, 97, 106, 114, 121, 126, 132, 138, 142, 148, 152, 156, 160, 163, 166, 170, 173, 174, 178, 181, 184, 186, 189, 190, 194, 196, 198, 200, 202, 205, 206, 209, 211, 214, 216, 218, 220, 222, 224, 225, 227, 229, 230, 232, 233, 235, 237, 238, 240, 241, 242, 243, 244, 246, 246, 248, 249, 250, 251, 252, 253, 254]);
const Dx7_alg5_bells_wave_SIG3Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1764000, 1764000, 1411200, 1411200, 1190700, 1014300, 992250, 882000, 705600, 705600, 584325, 507150, 502740, 441000, 418950, 352800, 308700, 286650, 253575, 220500, 220500, 176400, 145530, 145530, 125685, 110250, 110250, 88200, 88200, 74970, 61740, 61740, 55125, 48510, 44100, 37485, 31311, 30870, 27562, 27562, 22050, 18522, 17640, 15435, 14112, 13230, 11025, 9261, 9261, 7717, 6615, 6615, 5512, 5512, 4410, 3969, 3969, 3439, 2866, 2690, 2249, 1984, 1896, 1808, 1411, 1367, 1234, 1146, 926, 837, 837, 705, 573, 573, 529, 441, 441]);
const Dx7_alg5_bells_wave_SIG4Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 4342338, 7171437, 16777216]);
const Dx7_alg5_bells_wave_SIG5Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-16777216, 0, 16777216, 26591258, 33554432, 38955489, 43368474, 47099600, 50331648, 53182516, 55732705, 58039632, 60145690, 62083076, 63876816, 65546747, 67108864, 68576247, 69959732, 71268397, 72509921, 73690858, 74816848, 75892776, 76922906, 77910978, 78860292, 79773775, 80654032, 81503396, 82323963, 83117622]);
const Dx7_alg5_bells_wave_SIG6Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-128, -116, -104, -95, -85, -76, -68, -61, -56, -52, -49, -46, -43, -41, -39, -37, -35, -33, -32, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 38, 40, 43, 46, 49, 53, 58, 65, 73, 82, 92, 103, 115, 127]);
const Dx7_alg5_bells_wave_SIG7Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 33, 34, 36, 37, 38, 39, 41, 42, 44, 46, 47, 49, 51, 53, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 79, 82, 85, 88, 91, 94, 98, 102, 106, 110, 115, 120, 125, 130, 135, 141, 147, 153, 159, 165, 171, 178, 185, 193, 202, 211, 232, 243, 254, 255]);
const Dx7_alg5_bells_wave_SIG8Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 10, 20, 33, 55, 92, 153, 255]);

const Dx7_alg5_bells_itbl0SIG0: StaticArray<i32> = new StaticArray<i32>(20);
const Dx7_alg5_bells_itbl1SIG1: StaticArray<i32> = new StaticArray<i32>(33);
const Dx7_alg5_bells_itbl2SIG2: StaticArray<i32> = new StaticArray<i32>(64);
const Dx7_alg5_bells_itbl3SIG3: StaticArray<i32> = new StaticArray<i32>(77);
const Dx7_alg5_bells_itbl4SIG4: StaticArray<i32> = new StaticArray<i32>(4);
const Dx7_alg5_bells_itbl5SIG5: StaticArray<i32> = new StaticArray<i32>(32);
const Dx7_alg5_bells_itbl6SIG6: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg5_bells_itbl7SIG7: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg5_bells_itbl8SIG8: StaticArray<i32> = new StaticArray<i32>(8);
let _Dx7_alg5_bells_sig0_initialized: bool = false;

function _Dx7_alg5_bells_initSIG0Tables(): void {
    if (_Dx7_alg5_bells_sig0_initialized) return;
    _Dx7_alg5_bells_sig0_initialized = true;
    let sig0_iDx7_alg5_bellsSIG0Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_bells_itbl0SIG0.length; i++) {
        Dx7_alg5_bells_itbl0SIG0[i] = Dx7_alg5_bells_wave_SIG0Wave0[sig0_iDx7_alg5_bellsSIG0Wave0_idx];
        sig0_iDx7_alg5_bellsSIG0Wave0_idx = (1 + sig0_iDx7_alg5_bellsSIG0Wave0_idx) % 20;
    }
    let sig1_iDx7_alg5_bellsSIG1Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_bells_itbl1SIG1.length; i++) {
        Dx7_alg5_bells_itbl1SIG1[i] = Dx7_alg5_bells_wave_SIG1Wave0[sig1_iDx7_alg5_bellsSIG1Wave0_idx];
        sig1_iDx7_alg5_bellsSIG1Wave0_idx = (1 + sig1_iDx7_alg5_bellsSIG1Wave0_idx) % 33;
    }
    let sig2_iDx7_alg5_bellsSIG2Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_bells_itbl2SIG2.length; i++) {
        Dx7_alg5_bells_itbl2SIG2[i] = Dx7_alg5_bells_wave_SIG2Wave0[sig2_iDx7_alg5_bellsSIG2Wave0_idx];
        sig2_iDx7_alg5_bellsSIG2Wave0_idx = (1 + sig2_iDx7_alg5_bellsSIG2Wave0_idx) % 64;
    }
    let sig3_iDx7_alg5_bellsSIG3Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_bells_itbl3SIG3.length; i++) {
        Dx7_alg5_bells_itbl3SIG3[i] = Dx7_alg5_bells_wave_SIG3Wave0[sig3_iDx7_alg5_bellsSIG3Wave0_idx];
        sig3_iDx7_alg5_bellsSIG3Wave0_idx = (1 + sig3_iDx7_alg5_bellsSIG3Wave0_idx) % 77;
    }
    let sig4_iDx7_alg5_bellsSIG4Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_bells_itbl4SIG4.length; i++) {
        Dx7_alg5_bells_itbl4SIG4[i] = Dx7_alg5_bells_wave_SIG4Wave0[sig4_iDx7_alg5_bellsSIG4Wave0_idx];
        sig4_iDx7_alg5_bellsSIG4Wave0_idx = (1 + sig4_iDx7_alg5_bellsSIG4Wave0_idx) % 4;
    }
    let sig5_iDx7_alg5_bellsSIG5Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_bells_itbl5SIG5.length; i++) {
        Dx7_alg5_bells_itbl5SIG5[i] = Dx7_alg5_bells_wave_SIG5Wave0[sig5_iDx7_alg5_bellsSIG5Wave0_idx];
        sig5_iDx7_alg5_bellsSIG5Wave0_idx = (1 + sig5_iDx7_alg5_bellsSIG5Wave0_idx) % 32;
    }
    let sig6_iDx7_alg5_bellsSIG6Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_bells_itbl6SIG6.length; i++) {
        Dx7_alg5_bells_itbl6SIG6[i] = Dx7_alg5_bells_wave_SIG6Wave0[sig6_iDx7_alg5_bellsSIG6Wave0_idx];
        sig6_iDx7_alg5_bellsSIG6Wave0_idx = (1 + sig6_iDx7_alg5_bellsSIG6Wave0_idx) % 100;
    }
    let sig7_iDx7_alg5_bellsSIG7Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_bells_itbl7SIG7.length; i++) {
        Dx7_alg5_bells_itbl7SIG7[i] = Dx7_alg5_bells_wave_SIG7Wave0[sig7_iDx7_alg5_bellsSIG7Wave0_idx];
        sig7_iDx7_alg5_bellsSIG7Wave0_idx = (1 + sig7_iDx7_alg5_bellsSIG7Wave0_idx) % 100;
    }
    let sig8_iDx7_alg5_bellsSIG8Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_bells_itbl8SIG8.length; i++) {
        Dx7_alg5_bells_itbl8SIG8[i] = Dx7_alg5_bells_wave_SIG8Wave0[sig8_iDx7_alg5_bellsSIG8Wave0_idx];
        sig8_iDx7_alg5_bellsSIG8Wave0_idx = (1 + sig8_iDx7_alg5_bellsSIG8Wave0_idx) % 8;
    }
}

export class Dx7_alg5_bells extends MidiVoice {
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
        _Dx7_alg5_bells_initSIG0Tables();
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
        this.fHslider8 = <f32>velocity / 127.0;
        this.fButton0 = 0.0;
        this.nextframe();
        this.fButton0 = 1.0;
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
        const fSlow1: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider0));
        const fSlow2: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider1));
        const fSlow3: f32 = Mathf.pow(2.0, 0.083333336 * (Mathf.round(_fcast(dx7_alg5_bells_fHslider2)) + 17.31234 * Mathf.log(0.0022727272 * _fcast(this.fHslider3))));
        const fSlow4: f32 = Mathf.round(17.31234 * Mathf.log(fSlow3) + 69.0);
        const fSlow5: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider4));
        const fSlow6: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry0));
        const fSlow7: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider5));
        const fSlow8: f32 = fSlow4 + (-18.0 - fSlow5);
        const iSlow9: i32 = (((fSlow6 == 0.0 ? 1 : 0) | (fSlow6 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow7 * fSlow8)) >> 12 : _icast(329.0 * fSlow7 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow8))), 32))])) >> 15);
        const fSlow10: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry1));
        const fSlow11: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider6));
        const fSlow12: f32 = fSlow4 + (-16.0 - fSlow5);
        const iSlow13: i32 = (((fSlow10 == 0.0 ? 1 : 0) | (fSlow10 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow11 * fSlow12) >> 12 : _icast(329.0 * fSlow11 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow12)), 32))])) >> 15);
        const fSlow14: f32 = _fcast(Dx7_alg5_bells_itbl2SIG2[_icast(Mathf.round(_fcast(_icast(Mathf.max(0.0, Mathf.min(127.0, 127.0 * _fcast(this.fHslider8)))) >> 1)))] + -239);
        const fSlow15: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow2 >= 2e+01 ? 1 : 0) ? fSlow2 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow2)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow5)) >= 0.0) ? ((fSlow10 < 2.0 ? 1 : 0) ? -iSlow13 : iSlow13) : ((fSlow6 < 2.0 ? 1 : 0) ? -iSlow9 : iSlow9)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider7)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow16: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow1 >= 2e+01 ? 1 : 0) ? fSlow1 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow1)), 19))]))) >> 1) << 6) + fSlow15 + -4256.0)) << 16;
        const iSlow17: i32 = fSlow1 == 0.0;
        const fSlow18: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider9));
        const fSlow19: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider10));
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
        const fSlow31: f32 = ((iSlow30) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow29)), 76))]) : 2e+01 * (99.0 - fSlow29));
        const iSlow32: i32 = (((iSlow16 == 0 ? 1 : 0) | iSlow17) ? _icast(this.fConst1 * ((iSlow30 & iSlow17) ? 0.05 * fSlow31 : fSlow31)) : 0);
        const fSlow33: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider11));
        const iSlow34: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fSlow33 >= 2e+01 ? 1 : 0) ? fSlow33 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow33)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow35: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider12));
        const fSlow36: f32 = Mathf.min(fSlow35 + fSlow28, 99.0);
        const iSlow37: i32 = _icast(this.fConst1 * ((fSlow36 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow36)), 76))]) : 2e+01 * (99.0 - fSlow36)));
        const fSlow38: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider13));
        const fSlow39: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider14));
        const fSlow40: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider15));
        const fSlow41: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider16));
        const iSlow42: i32 = iSlow16 > 0;
        const iSlow43: i32 = min<i32>(63, ((41 * _icast(fSlow18)) >> 6) + iSlow27);
        const iSlow44: i32 = _icast(this.fConst1 * _fcast(((iSlow43 & 3) + 4) << ((iSlow43 >> 2) + 2)));
        const iSlow45: i32 = min<i32>(63, ((41 * _icast(fSlow35)) >> 6) + iSlow27);
        const iSlow46: i32 = _icast(this.fConst1 * _fcast(((iSlow45 & 3) + 4) << ((iSlow45 >> 2) + 2)));
        const iSlow47: i32 = Dx7_alg5_bells_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_bells_fHslider17))))];
        const iSlow48: i32 = iSlow47 != 0;
        const fSlow49: f32 = 2.6972606e-09 * Mathf.round(_fcast(dx7_alg5_bells_fHslider18));
        const iSlow50: i32 = _icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider19)));
        const fSlow51: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider20));
        const fSlow52: f32 = this.fConst2 * (((0.01010101 * fSlow51) <= 0.656566) ? 0.15806305 * fSlow51 + 0.036478 : 1.100254 * fSlow51 + -61.205933);
        const fSlow53: f32 = 99.0 - Mathf.round(_fcast(dx7_alg5_bells_fHslider21));
        const iSlow54: i32 = (fSlow53 == 99.0 ? 1 : 0) >= 1;
        const iSlow55: i32 = _icast(fSlow53);
        const iSlow56: i32 = ((iSlow55 & 15) + 16) << ((iSlow55 >> 4) + 1);
        const fSlow57: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(max<i32>(iSlow56 & 65408, 128)));
        const fSlow58: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(iSlow56));
        const fSlow59: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry2));
        const iSlow60: i32 = fSlow59 >= 3.0;
        const iSlow61: i32 = fSlow59 >= 5.0;
        const iSlow62: i32 = fSlow59 >= 2.0;
        const iSlow63: i32 = fSlow59 >= 1.0;
        const iSlow64: i32 = fSlow59 >= 4.0;
        const fSlow65: f32 = _fcast(iSlow47);
        const iSlow66: i32 = _icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider22)));
        const iSlow67: i32 = _icast(Mathf.round(_fcast(this.fCheckbox0)));
        const fSlow68: f32 = Mathf.log(4.4e+02 * fSlow3);
        const fSlow69: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider23));
        const fSlow70: f32 = Mathf.exp(-0.57130724 * fSlow68);
        const iSlow71: i32 = _icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider24)));
        const fSlow72: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider25));
        const fSlow73: f32 = ((iSlow67) ? _fcast(_icast(4458616.0 * (fSlow72 + _fcast(100 * (iSlow71 & 3)))) >> 3) + ((fSlow69 > 0.0 ? 1 : 0) ? 13457.0 * fSlow69 : 0.0) : fSlow68 * (72267.445 * fSlow69 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_bells_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow71 & 31)))]) + _fcast(((_icast(fSlow72)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow72 + 1.0) + 0.5)) : 0)));
        const fSlow74: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider26));
        const iSlow75: i32 = Dx7_alg5_bells_itbl6SIG6[_icast(Mathf.round(fSlow74))];
        const fSlow76: f32 = _fcast(iSlow75);
        const fSlow77: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider27));
        const iSlow78: i32 = Dx7_alg5_bells_itbl6SIG6[_icast(Mathf.round(fSlow77))];
        const iSlow79: i32 = iSlow78 > iSlow75;
        const fSlow80: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider28));
        const fSlow81: f32 = this.fConst4 * _fcast(Dx7_alg5_bells_itbl7SIG7[_icast(Mathf.round(fSlow80))]);
        const fSlow82: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider29));
        const fSlow83: f32 = this.fConst4 * _fcast(Dx7_alg5_bells_itbl7SIG7[_icast(Mathf.round(fSlow82))]);
        const fSlow84: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider30));
        const fSlow85: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider31));
        const fSlow86: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider32));
        const fSlow87: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider33));
        const fSlow88: f32 = 7.891414e-05 * Mathf.round(_fcast(dx7_alg5_bells_fHslider34));
        const fSlow89: f32 = _fcast(Dx7_alg5_bells_itbl8SIG8[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_bells_fHslider35))))]);
        const fSlow90: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider36));
        const fSlow91: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider37));
        const fSlow92: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider38));
        const fSlow93: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry3));
        const fSlow94: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider39));
        const fSlow95: f32 = fSlow4 + (-18.0 - fSlow92);
        const iSlow96: i32 = (((fSlow93 == 0.0 ? 1 : 0) | (fSlow93 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow94 * fSlow95)) >> 12 : _icast(329.0 * fSlow94 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow95))), 32))])) >> 15);
        const fSlow97: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry4));
        const fSlow98: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider40));
        const fSlow99: f32 = fSlow4 + (-16.0 - fSlow92);
        const iSlow100: i32 = (((fSlow97 == 0.0 ? 1 : 0) | (fSlow97 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow98 * fSlow99) >> 12 : _icast(329.0 * fSlow98 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow99)), 32))])) >> 15);
        const fSlow101: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow91 >= 2e+01 ? 1 : 0) ? fSlow91 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow91)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow92)) >= 0.0) ? ((fSlow97 < 2.0 ? 1 : 0) ? -iSlow100 : iSlow100) : ((fSlow93 < 2.0 ? 1 : 0) ? -iSlow96 : iSlow96)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider41)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow102: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow90 >= 2e+01 ? 1 : 0) ? fSlow90 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow90)), 19))]))) >> 1) << 6) + fSlow101 + -4256.0)) << 16;
        const iSlow103: i32 = fSlow90 == 0.0;
        const fSlow104: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider42));
        const fSlow105: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider43));
        const iSlow106: i32 = _icast(fSlow105 * fSlow25) >> 3;
        const iSlow107: i32 = (((fSlow105 == 3.0 ? 1 : 0) & iSlow22) ? iSlow106 + -1 : ((((fSlow105 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow106 + 1 : iSlow106));
        const fSlow108: f32 = _fcast(iSlow107);
        const fSlow109: f32 = Mathf.min(fSlow104 + fSlow108, 99.0);
        const iSlow110: i32 = fSlow109 < 77.0;
        const fSlow111: f32 = ((iSlow110) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow109)), 76))]) : 2e+01 * (99.0 - fSlow109));
        const iSlow112: i32 = (((iSlow102 == 0 ? 1 : 0) | iSlow103) ? _icast(this.fConst1 * ((iSlow110 & iSlow103) ? 0.05 * fSlow111 : fSlow111)) : 0);
        const fSlow113: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider44));
        const iSlow114: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fSlow113 >= 2e+01 ? 1 : 0) ? fSlow113 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow113)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow115: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider45));
        const fSlow116: f32 = Mathf.min(fSlow115 + fSlow108, 99.0);
        const iSlow117: i32 = _icast(this.fConst1 * ((fSlow116 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow116)), 76))]) : 2e+01 * (99.0 - fSlow116)));
        const fSlow118: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider46));
        const fSlow119: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider47));
        const fSlow120: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider48));
        const fSlow121: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider49));
        const iSlow122: i32 = iSlow102 > 0;
        const iSlow123: i32 = min<i32>(63, ((41 * _icast(fSlow104)) >> 6) + iSlow107);
        const iSlow124: i32 = _icast(this.fConst1 * _fcast(((iSlow123 & 3) + 4) << ((iSlow123 >> 2) + 2)));
        const iSlow125: i32 = min<i32>(63, ((41 * _icast(fSlow115)) >> 6) + iSlow107);
        const iSlow126: i32 = _icast(this.fConst1 * _fcast(((iSlow125 & 3) + 4) << ((iSlow125 >> 2) + 2)));
        const iSlow127: i32 = Dx7_alg5_bells_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_bells_fHslider50))))];
        const iSlow128: i32 = iSlow127 != 0;
        const fSlow129: f32 = _fcast(iSlow127);
        const iSlow130: i32 = _icast(Mathf.round(_fcast(this.fCheckbox1)));
        const fSlow131: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider51));
        const iSlow132: i32 = _icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider52)));
        const fSlow133: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider53));
        const fSlow134: f32 = ((iSlow130) ? _fcast(_icast(4458616.0 * (fSlow133 + _fcast(100 * (iSlow132 & 3)))) >> 3) + ((fSlow131 > 0.0 ? 1 : 0) ? 13457.0 * fSlow131 : 0.0) : fSlow68 * (72267.445 * fSlow131 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_bells_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow132 & 31)))]) + _fcast(((_icast(fSlow133)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow133 + 1.0) + 0.5)) : 0)));
        const fSlow135: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider54));
        const fSlow136: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider55));
        const fSlow137: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider56));
        const fSlow138: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry5));
        const fSlow139: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider57));
        const fSlow140: f32 = fSlow4 + (-18.0 - fSlow137);
        const iSlow141: i32 = (((fSlow138 == 0.0 ? 1 : 0) | (fSlow138 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow139 * fSlow140)) >> 12 : _icast(329.0 * fSlow139 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow140))), 32))])) >> 15);
        const fSlow142: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry6));
        const fSlow143: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider58));
        const fSlow144: f32 = fSlow4 + (-16.0 - fSlow137);
        const iSlow145: i32 = (((fSlow142 == 0.0 ? 1 : 0) | (fSlow142 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow143 * fSlow144) >> 12 : _icast(329.0 * fSlow143 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow144)), 32))])) >> 15);
        const fSlow146: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow136 >= 2e+01 ? 1 : 0) ? fSlow136 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow136)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow137)) >= 0.0) ? ((fSlow142 < 2.0 ? 1 : 0) ? -iSlow145 : iSlow145) : ((fSlow138 < 2.0 ? 1 : 0) ? -iSlow141 : iSlow141)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider59)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow147: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow135 >= 2e+01 ? 1 : 0) ? fSlow135 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow135)), 19))]))) >> 1) << 6) + fSlow146 + -4256.0)) << 16;
        const iSlow148: i32 = fSlow135 == 0.0;
        const fSlow149: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider60));
        const fSlow150: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider61));
        const iSlow151: i32 = _icast(fSlow150 * fSlow25) >> 3;
        const iSlow152: i32 = (((fSlow150 == 3.0 ? 1 : 0) & iSlow22) ? iSlow151 + -1 : ((((fSlow150 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow151 + 1 : iSlow151));
        const fSlow153: f32 = _fcast(iSlow152);
        const fSlow154: f32 = Mathf.min(fSlow149 + fSlow153, 99.0);
        const iSlow155: i32 = fSlow154 < 77.0;
        const fSlow156: f32 = ((iSlow155) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow154)), 76))]) : 2e+01 * (99.0 - fSlow154));
        const iSlow157: i32 = (((iSlow147 == 0 ? 1 : 0) | iSlow148) ? _icast(this.fConst1 * ((iSlow155 & iSlow148) ? 0.05 * fSlow156 : fSlow156)) : 0);
        const fSlow158: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider62));
        const iSlow159: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fSlow158 >= 2e+01 ? 1 : 0) ? fSlow158 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow158)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow160: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider63));
        const fSlow161: f32 = Mathf.min(fSlow160 + fSlow153, 99.0);
        const iSlow162: i32 = _icast(this.fConst1 * ((fSlow161 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow161)), 76))]) : 2e+01 * (99.0 - fSlow161)));
        const fSlow163: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider64));
        const fSlow164: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider65));
        const fSlow165: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider66));
        const fSlow166: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider67));
        const iSlow167: i32 = iSlow147 > 0;
        const iSlow168: i32 = min<i32>(63, ((41 * _icast(fSlow149)) >> 6) + iSlow152);
        const iSlow169: i32 = _icast(this.fConst1 * _fcast(((iSlow168 & 3) + 4) << ((iSlow168 >> 2) + 2)));
        const iSlow170: i32 = min<i32>(63, ((41 * _icast(fSlow160)) >> 6) + iSlow152);
        const iSlow171: i32 = _icast(this.fConst1 * _fcast(((iSlow170 & 3) + 4) << ((iSlow170 >> 2) + 2)));
        const iSlow172: i32 = Dx7_alg5_bells_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_bells_fHslider68))))];
        const iSlow173: i32 = iSlow172 != 0;
        const fSlow174: f32 = _fcast(iSlow172);
        const iSlow175: i32 = _icast(Mathf.round(_fcast(this.fCheckbox2)));
        const fSlow176: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider69));
        const iSlow177: i32 = _icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider70)));
        const fSlow178: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider71));
        const fSlow179: f32 = ((iSlow175) ? _fcast(_icast(4458616.0 * (fSlow178 + _fcast(100 * (iSlow177 & 3)))) >> 3) + ((fSlow176 > 0.0 ? 1 : 0) ? 13457.0 * fSlow176 : 0.0) : fSlow68 * (72267.445 * fSlow176 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_bells_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow177 & 31)))]) + _fcast(((_icast(fSlow178)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow178 + 1.0) + 0.5)) : 0)));
        const fSlow180: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider72));
        const fSlow181: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider73));
        const fSlow182: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider74));
        const fSlow183: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry7));
        const fSlow184: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider75));
        const fSlow185: f32 = fSlow4 + (-18.0 - fSlow182);
        const iSlow186: i32 = (((fSlow183 == 0.0 ? 1 : 0) | (fSlow183 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow184 * fSlow185)) >> 12 : _icast(329.0 * fSlow184 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow185))), 32))])) >> 15);
        const fSlow187: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry8));
        const fSlow188: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider76));
        const fSlow189: f32 = fSlow4 + (-16.0 - fSlow182);
        const iSlow190: i32 = (((fSlow187 == 0.0 ? 1 : 0) | (fSlow187 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow188 * fSlow189) >> 12 : _icast(329.0 * fSlow188 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow189)), 32))])) >> 15);
        const fSlow191: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow181 >= 2e+01 ? 1 : 0) ? fSlow181 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow181)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow182)) >= 0.0) ? ((fSlow187 < 2.0 ? 1 : 0) ? -iSlow190 : iSlow190) : ((fSlow183 < 2.0 ? 1 : 0) ? -iSlow186 : iSlow186)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider77)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow192: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow180 >= 2e+01 ? 1 : 0) ? fSlow180 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow180)), 19))]))) >> 1) << 6) + fSlow191 + -4256.0)) << 16;
        const iSlow193: i32 = fSlow180 == 0.0;
        const fSlow194: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider78));
        const fSlow195: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider79));
        const iSlow196: i32 = _icast(fSlow195 * fSlow25) >> 3;
        const iSlow197: i32 = (((fSlow195 == 3.0 ? 1 : 0) & iSlow22) ? iSlow196 + -1 : ((((fSlow195 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow196 + 1 : iSlow196));
        const fSlow198: f32 = _fcast(iSlow197);
        const fSlow199: f32 = Mathf.min(fSlow194 + fSlow198, 99.0);
        const iSlow200: i32 = fSlow199 < 77.0;
        const fSlow201: f32 = ((iSlow200) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow199)), 76))]) : 2e+01 * (99.0 - fSlow199));
        const iSlow202: i32 = (((iSlow192 == 0 ? 1 : 0) | iSlow193) ? _icast(this.fConst1 * ((iSlow200 & iSlow193) ? 0.05 * fSlow201 : fSlow201)) : 0);
        const fSlow203: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider80));
        const iSlow204: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fSlow203 >= 2e+01 ? 1 : 0) ? fSlow203 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow203)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow205: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider81));
        const fSlow206: f32 = Mathf.min(fSlow205 + fSlow198, 99.0);
        const iSlow207: i32 = _icast(this.fConst1 * ((fSlow206 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow206)), 76))]) : 2e+01 * (99.0 - fSlow206)));
        const fSlow208: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider82));
        const fSlow209: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider83));
        const fSlow210: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider84));
        const fSlow211: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider85));
        const iSlow212: i32 = iSlow192 > 0;
        const iSlow213: i32 = min<i32>(63, ((41 * _icast(fSlow194)) >> 6) + iSlow197);
        const iSlow214: i32 = _icast(this.fConst1 * _fcast(((iSlow213 & 3) + 4) << ((iSlow213 >> 2) + 2)));
        const iSlow215: i32 = min<i32>(63, ((41 * _icast(fSlow205)) >> 6) + iSlow197);
        const iSlow216: i32 = _icast(this.fConst1 * _fcast(((iSlow215 & 3) + 4) << ((iSlow215 >> 2) + 2)));
        const iSlow217: i32 = Dx7_alg5_bells_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_bells_fHslider86))))];
        const iSlow218: i32 = iSlow217 != 0;
        const fSlow219: f32 = _fcast(iSlow217);
        const iSlow220: i32 = _icast(Mathf.round(_fcast(this.fCheckbox3)));
        const fSlow221: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider87));
        const iSlow222: i32 = _icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider88)));
        const fSlow223: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider89));
        const fSlow224: f32 = ((iSlow220) ? _fcast(_icast(4458616.0 * (fSlow223 + _fcast(100 * (iSlow222 & 3)))) >> 3) + ((fSlow221 > 0.0 ? 1 : 0) ? 13457.0 * fSlow221 : 0.0) : fSlow68 * (72267.445 * fSlow221 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_bells_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow222 & 31)))]) + _fcast(((_icast(fSlow223)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow223 + 1.0) + 0.5)) : 0)));
        const fSlow225: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider90));
        const fSlow226: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider91));
        const fSlow227: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider92));
        const fSlow228: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry9));
        const fSlow229: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider93));
        const fSlow230: f32 = fSlow4 + (-18.0 - fSlow227);
        const iSlow231: i32 = (((fSlow228 == 0.0 ? 1 : 0) | (fSlow228 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow229 * fSlow230)) >> 12 : _icast(329.0 * fSlow229 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow230))), 32))])) >> 15);
        const fSlow232: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry10));
        const fSlow233: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider94));
        const fSlow234: f32 = fSlow4 + (-16.0 - fSlow227);
        const iSlow235: i32 = (((fSlow232 == 0.0 ? 1 : 0) | (fSlow232 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow233 * fSlow234) >> 12 : _icast(329.0 * fSlow233 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow234)), 32))])) >> 15);
        const fSlow236: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow226 >= 2e+01 ? 1 : 0) ? fSlow226 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow226)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow227)) >= 0.0) ? ((fSlow232 < 2.0 ? 1 : 0) ? -iSlow235 : iSlow235) : ((fSlow228 < 2.0 ? 1 : 0) ? -iSlow231 : iSlow231)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider95)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow237: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow225 >= 2e+01 ? 1 : 0) ? fSlow225 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow225)), 19))]))) >> 1) << 6) + fSlow236 + -4256.0)) << 16;
        const iSlow238: i32 = fSlow225 == 0.0;
        const fSlow239: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider96));
        const fSlow240: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider97));
        const iSlow241: i32 = _icast(fSlow240 * fSlow25) >> 3;
        const iSlow242: i32 = (((fSlow240 == 3.0 ? 1 : 0) & iSlow22) ? iSlow241 + -1 : ((((fSlow240 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow241 + 1 : iSlow241));
        const fSlow243: f32 = _fcast(iSlow242);
        const fSlow244: f32 = Mathf.min(fSlow239 + fSlow243, 99.0);
        const iSlow245: i32 = fSlow244 < 77.0;
        const fSlow246: f32 = ((iSlow245) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow244)), 76))]) : 2e+01 * (99.0 - fSlow244));
        const iSlow247: i32 = (((iSlow237 == 0 ? 1 : 0) | iSlow238) ? _icast(this.fConst1 * ((iSlow245 & iSlow238) ? 0.05 * fSlow246 : fSlow246)) : 0);
        const fSlow248: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider98));
        const iSlow249: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fSlow248 >= 2e+01 ? 1 : 0) ? fSlow248 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow248)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow250: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider99));
        const fSlow251: f32 = Mathf.min(fSlow250 + fSlow243, 99.0);
        const iSlow252: i32 = _icast(this.fConst1 * ((fSlow251 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow251)), 76))]) : 2e+01 * (99.0 - fSlow251)));
        const fSlow253: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider100));
        const fSlow254: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider101));
        const fSlow255: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider102));
        const fSlow256: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider103));
        const iSlow257: i32 = iSlow237 > 0;
        const iSlow258: i32 = min<i32>(63, ((41 * _icast(fSlow239)) >> 6) + iSlow242);
        const iSlow259: i32 = _icast(this.fConst1 * _fcast(((iSlow258 & 3) + 4) << ((iSlow258 >> 2) + 2)));
        const iSlow260: i32 = min<i32>(63, ((41 * _icast(fSlow250)) >> 6) + iSlow242);
        const iSlow261: i32 = _icast(this.fConst1 * _fcast(((iSlow260 & 3) + 4) << ((iSlow260 >> 2) + 2)));
        const iSlow262: i32 = Dx7_alg5_bells_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_bells_fHslider104))))];
        const iSlow263: i32 = iSlow262 != 0;
        const fSlow264: f32 = _fcast(iSlow262);
        const iSlow265: i32 = _icast(Mathf.round(_fcast(this.fCheckbox4)));
        const fSlow266: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider105));
        const iSlow267: i32 = _icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider106)));
        const fSlow268: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider107));
        const fSlow269: f32 = ((iSlow265) ? _fcast(_icast(4458616.0 * (fSlow268 + _fcast(100 * (iSlow267 & 3)))) >> 3) + ((fSlow266 > 0.0 ? 1 : 0) ? 13457.0 * fSlow266 : 0.0) : fSlow68 * (72267.445 * fSlow266 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_bells_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow267 & 31)))]) + _fcast(((_icast(fSlow268)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow268 + 1.0) + 0.5)) : 0)));
        const fSlow270: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider108));
        const fSlow271: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider109));
        const fSlow272: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider110));
        const fSlow273: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry11));
        const fSlow274: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider111));
        const fSlow275: f32 = fSlow4 + (-18.0 - fSlow272);
        const iSlow276: i32 = (((fSlow273 == 0.0 ? 1 : 0) | (fSlow273 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow274 * fSlow275)) >> 12 : _icast(329.0 * fSlow274 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow275))), 32))])) >> 15);
        const fSlow277: f32 = Mathf.round(_fcast(dx7_alg5_bells_fEntry12));
        const fSlow278: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider112));
        const fSlow279: f32 = fSlow4 + (-16.0 - fSlow272);
        const iSlow280: i32 = (((fSlow277 == 0.0 ? 1 : 0) | (fSlow277 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow278 * fSlow279) >> 12 : _icast(329.0 * fSlow278 * _fcast(Dx7_alg5_bells_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow279)), 32))])) >> 15);
        const fSlow281: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow271 >= 2e+01 ? 1 : 0) ? fSlow271 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow271)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow272)) >= 0.0) ? ((fSlow277 < 2.0 ? 1 : 0) ? -iSlow280 : iSlow280) : ((fSlow273 < 2.0 ? 1 : 0) ? -iSlow276 : iSlow276)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider113)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow282: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow270 >= 2e+01 ? 1 : 0) ? fSlow270 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow270)), 19))]))) >> 1) << 6) + fSlow281 + -4256.0)) << 16;
        const iSlow283: i32 = fSlow270 == 0.0;
        const fSlow284: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider114));
        const fSlow285: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider115));
        const iSlow286: i32 = _icast(fSlow285 * fSlow25) >> 3;
        const iSlow287: i32 = (((fSlow285 == 3.0 ? 1 : 0) & iSlow22) ? iSlow286 + -1 : ((((fSlow285 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow286 + 1 : iSlow286));
        const fSlow288: f32 = _fcast(iSlow287);
        const fSlow289: f32 = Mathf.min(fSlow284 + fSlow288, 99.0);
        const iSlow290: i32 = fSlow289 < 77.0;
        const fSlow291: f32 = ((iSlow290) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow289)), 76))]) : 2e+01 * (99.0 - fSlow289));
        const iSlow292: i32 = (((iSlow282 == 0 ? 1 : 0) | iSlow283) ? _icast(this.fConst1 * ((iSlow290 & iSlow283) ? 0.05 * fSlow291 : fSlow291)) : 0);
        const fSlow293: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider116));
        const iSlow294: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fSlow293 >= 2e+01 ? 1 : 0) ? fSlow293 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow293)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow295: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider117));
        const fSlow296: f32 = Mathf.min(fSlow295 + fSlow288, 99.0);
        const iSlow297: i32 = _icast(this.fConst1 * ((fSlow296 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow296)), 76))]) : 2e+01 * (99.0 - fSlow296)));
        const fSlow298: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider118));
        const fSlow299: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider119));
        const fSlow300: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider120));
        const fSlow301: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider121));
        const iSlow302: i32 = iSlow282 > 0;
        const iSlow303: i32 = min<i32>(63, ((41 * _icast(fSlow284)) >> 6) + iSlow287);
        const iSlow304: i32 = _icast(this.fConst1 * _fcast(((iSlow303 & 3) + 4) << ((iSlow303 >> 2) + 2)));
        const iSlow305: i32 = min<i32>(63, ((41 * _icast(fSlow295)) >> 6) + iSlow287);
        const iSlow306: i32 = _icast(this.fConst1 * _fcast(((iSlow305 & 3) + 4) << ((iSlow305 >> 2) + 2)));
        const iSlow307: i32 = Dx7_alg5_bells_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_bells_fHslider122))))];
        const iSlow308: i32 = iSlow307 != 0;
        const fSlow309: f32 = _fcast(iSlow307);
        const iSlow310: i32 = _icast(Mathf.round(_fcast(this.fCheckbox5)));
        const fSlow311: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider123));
        const iSlow312: i32 = _icast(Mathf.round(_fcast(dx7_alg5_bells_fHslider124)));
        const fSlow313: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider125));
        const fSlow314: f32 = ((iSlow310) ? _fcast(_icast(4458616.0 * (fSlow313 + _fcast(100 * (iSlow312 & 3)))) >> 3) + ((fSlow311 > 0.0 ? 1 : 0) ? 13457.0 * fSlow311 : 0.0) : fSlow68 * (72267.445 * fSlow311 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_bells_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow312 & 31)))]) + _fcast(((_icast(fSlow313)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow313 + 1.0) + 0.5)) : 0)));
        const fSlow315: f32 = Mathf.round(_fcast(dx7_alg5_bells_fHslider126));
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
        const iTemp17: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp16 >= 2e+01 ? 1 : 0) ? fTemp16 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp16)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp18: i32 = iTemp8 == 0;
        const iTemp19: i32 = fTemp16 == 0.0;
        const fTemp20: f32 = ((iTemp13) ? ((iTemp15) ? fSlow35 : fSlow41) : ((iTemp14) ? fSlow40 : fSlow18));
        const fTemp21: f32 = Mathf.min(fSlow28 + fTemp20, 99.0);
        const iTemp22: i32 = fTemp21 < 77.0;
        const fTemp23: f32 = ((iTemp22) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp21)), 76))]) : 2e+01 * (99.0 - fTemp21));
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
        const iTemp46: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp45 >= 2e+01 ? 1 : 0) ? fTemp45 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp45)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp56: f32 = ((iTemp55) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp54)), 76))]) : 2e+01 * (99.0 - fTemp54));
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
        const iTemp89: i32 = Dx7_alg5_bells_itbl6SIG6[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow74 : fSlow85) : ((iTemp87) ? fSlow84 : fSlow77))))];
        const iTemp90: i32 = ((iTemp85) ? iTemp89 : iTemp79);
        this.iRec15[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp90 : iTemp79) : ((iTemp81) ? iTemp90 : iTemp79)) : iTemp79);
        const iTemp91: i32 = ((iTemp85) ? iTemp89 > iTemp79 : iTemp75);
        this.iRec16[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp91 : iTemp75) : ((iTemp81) ? iTemp91 : iTemp75)) : iTemp75);
        const fTemp92: f32 = ((iTemp85) ? this.fConst4 * _fcast(Dx7_alg5_bells_itbl7SIG7[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow80 : fSlow87) : ((iTemp87) ? fSlow86 : fSlow82))))]) : fTemp77);
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
        const iTemp110: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp109 >= 2e+01 ? 1 : 0) ? fTemp109 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp109)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp111: i32 = iTemp101 == 0;
        const iTemp112: i32 = fTemp109 == 0.0;
        const fTemp113: f32 = ((iTemp106) ? ((iTemp108) ? fSlow115 : fSlow121) : ((iTemp107) ? fSlow120 : fSlow104));
        const fTemp114: f32 = Mathf.min(fSlow108 + fTemp113, 99.0);
        const iTemp115: i32 = fTemp114 < 77.0;
        const fTemp116: f32 = ((iTemp115) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp114)), 76))]) : 2e+01 * (99.0 - fTemp114));
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
        const iTemp139: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp138 >= 2e+01 ? 1 : 0) ? fTemp138 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp138)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp149: f32 = ((iTemp148) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp147)), 76))]) : 2e+01 * (99.0 - fTemp147));
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
        const iTemp166: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fTemp165 >= 2e+01 ? 1 : 0) ? fTemp165 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp165)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp167: i32 = iTemp157 == 0;
        const iTemp168: i32 = fTemp165 == 0.0;
        const fTemp169: f32 = ((iTemp162) ? ((iTemp164) ? fSlow160 : fSlow166) : ((iTemp163) ? fSlow165 : fSlow149));
        const fTemp170: f32 = Mathf.min(fSlow153 + fTemp169, 99.0);
        const iTemp171: i32 = fTemp170 < 77.0;
        const fTemp172: f32 = ((iTemp171) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp170)), 76))]) : 2e+01 * (99.0 - fTemp170));
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
        const iTemp195: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fTemp194 >= 2e+01 ? 1 : 0) ? fTemp194 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp194)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp205: f32 = ((iTemp204) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp203)), 76))]) : 2e+01 * (99.0 - fTemp203));
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
        const iTemp222: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fTemp221 >= 2e+01 ? 1 : 0) ? fTemp221 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp221)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp223: i32 = iTemp213 == 0;
        const iTemp224: i32 = fTemp221 == 0.0;
        const fTemp225: f32 = ((iTemp218) ? ((iTemp220) ? fSlow205 : fSlow211) : ((iTemp219) ? fSlow210 : fSlow194));
        const fTemp226: f32 = Mathf.min(fSlow198 + fTemp225, 99.0);
        const iTemp227: i32 = fTemp226 < 77.0;
        const fTemp228: f32 = ((iTemp227) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp226)), 76))]) : 2e+01 * (99.0 - fTemp226));
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
        const iTemp251: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fTemp250 >= 2e+01 ? 1 : 0) ? fTemp250 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp250)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp261: f32 = ((iTemp260) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp259)), 76))]) : 2e+01 * (99.0 - fTemp259));
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
        const iTemp278: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fTemp277 >= 2e+01 ? 1 : 0) ? fTemp277 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp277)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp279: i32 = iTemp269 == 0;
        const iTemp280: i32 = fTemp277 == 0.0;
        const fTemp281: f32 = ((iTemp274) ? ((iTemp276) ? fSlow250 : fSlow256) : ((iTemp275) ? fSlow255 : fSlow239));
        const fTemp282: f32 = Mathf.min(fSlow243 + fTemp281, 99.0);
        const iTemp283: i32 = fTemp282 < 77.0;
        const fTemp284: f32 = ((iTemp283) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp282)), 76))]) : 2e+01 * (99.0 - fTemp282));
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
        const iTemp307: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fTemp306 >= 2e+01 ? 1 : 0) ? fTemp306 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp306)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp317: f32 = ((iTemp316) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp315)), 76))]) : 2e+01 * (99.0 - fTemp315));
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
        const iTemp334: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp333 >= 2e+01 ? 1 : 0) ? fTemp333 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp333)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp335: i32 = iTemp325 == 0;
        const iTemp336: i32 = fTemp333 == 0.0;
        const fTemp337: f32 = ((iTemp330) ? ((iTemp332) ? fSlow295 : fSlow301) : ((iTemp331) ? fSlow300 : fSlow284));
        const fTemp338: f32 = Mathf.min(fSlow288 + fTemp337, 99.0);
        const iTemp339: i32 = fTemp338 < 77.0;
        const fTemp340: f32 = ((iTemp339) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp338)), 76))]) : 2e+01 * (99.0 - fTemp338));
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
        const iTemp363: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp362 >= 2e+01 ? 1 : 0) ? fTemp362 + 28.0 : _fcast(Dx7_alg5_bells_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp362)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp373: f32 = ((iTemp372) ? _fcast(Dx7_alg5_bells_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp371)), 76))]) : 2e+01 * (99.0 - fTemp371));
        const iTemp374: i32 = ((iTemp358) ? (((iTemp363 == iTemp353 ? 1 : 0) | (iTemp369 & iTemp370)) ? _icast(this.fConst1 * (((iTemp372 & iTemp369) & iTemp370) ? 0.05 * fTemp373 : fTemp373)) : 0) : iTemp341);
        this.iRec58[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp374 : iTemp341) : ((iTemp346) ? ((iTemp354) ? iTemp374 : iTemp341) : iTemp341)) : iTemp341);
        const fTemp375: f32 = ((iTemp70) ? 0.0 : this.fRec59[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow314 + ((iSlow310) ? 0.0 : fTemp94))));
        this.fRec59[0] = fTemp375 - Mathf.floor(fTemp375);
        this.fRec51[0] = 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec52[0] + (-234881024 - ((iSlow308) ? _icast(5.9604645e-08 * _fcast(this.iRec52[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow309 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec59[0] + this.fRec51[1] * fSlow316));
        const fTemp376: f32 = 0.5 * (Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec0[0] + (-234881024 - ((iSlow48) ? _icast(5.9604645e-08 * _fcast(this.iRec0[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow65 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec12[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec19[0] + (-234881024 - ((iSlow128) ? _icast(5.9604645e-08 * _fcast(this.iRec19[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow129 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec26[0]))) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec27[0] + (-234881024 - ((iSlow173) ? _icast(5.9604645e-08 * _fcast(this.iRec27[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow174 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec34[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec35[0] + (-234881024 - ((iSlow218) ? _icast(5.9604645e-08 * _fcast(this.iRec35[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow219 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec42[0]))) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec43[0] + (-234881024 - ((iSlow263) ? _icast(5.9604645e-08 * _fcast(this.iRec43[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow264 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec50[0] + this.fRec51[0])));
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

export class Dx7_alg5_bellsChannel extends MidiChannel {
    private _nrpnMsb: u8 = 127;
    private _nrpnLsb: u8 = 127;

    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case 99: this._nrpnMsb = value; break;
            case 98: this._nrpnLsb = value; break;
            case 6:
                this._setParam(<u16>this._nrpnMsb * 128 + <u16>this._nrpnLsb, value);
                break;
        }
    }

    private _setParam(param: u16, value: u8): void {
        switch (param) {
            case 0: dx7_alg5_bells_fHslider126 = <f32>value / 127.0 * 7; break;
            case 1: dx7_alg5_bells_fHslider2 = -24 + <f32>value / 127.0 * 48; break;
            case 2: dx7_alg5_bells_fHslider22 = <f32>value / 127.0; break;
            case 3: dx7_alg5_bells_fHslider27 = <f32>value / 127.0 * 99; break;
            case 4: dx7_alg5_bells_fHslider30 = <f32>value / 127.0 * 99; break;
            case 5: dx7_alg5_bells_fHslider31 = <f32>value / 127.0 * 99; break;
            case 6: dx7_alg5_bells_fHslider26 = <f32>value / 127.0 * 99; break;
            case 7: dx7_alg5_bells_fHslider29 = <f32>value / 127.0 * 99; break;
            case 8: dx7_alg5_bells_fHslider32 = <f32>value / 127.0 * 99; break;
            case 9: dx7_alg5_bells_fHslider33 = <f32>value / 127.0 * 99; break;
            case 10: dx7_alg5_bells_fHslider28 = <f32>value / 127.0 * 99; break;
            case 11: dx7_alg5_bells_fEntry2 = <f32>value / 127.0 * 5; break;
            case 12: dx7_alg5_bells_fHslider20 = <f32>value / 127.0 * 99; break;
            case 13: dx7_alg5_bells_fHslider21 = <f32>value / 127.0 * 99; break;
            case 14: dx7_alg5_bells_fHslider34 = <f32>value / 127.0 * 99; break;
            case 15: dx7_alg5_bells_fHslider18 = <f32>value / 127.0 * 99; break;
            case 16: dx7_alg5_bells_fHslider19 = <f32>value / 127.0; break;
            case 17: dx7_alg5_bells_fHslider35 = <f32>value / 127.0 * 7; break;
            case 18: dx7_alg5_bells_fHslider23 = -7 + <f32>value / 127.0 * 14; break;
            case 19: dx7_alg5_bells_fHslider24 = <f32>value / 127.0 * 31; break;
            case 20: dx7_alg5_bells_fHslider25 = <f32>value / 127.0 * 99; break;
            case 21: dx7_alg5_bells_fHslider0 = <f32>value / 127.0 * 99; break;
            case 22: dx7_alg5_bells_fHslider13 = <f32>value / 127.0 * 99; break;
            case 23: dx7_alg5_bells_fHslider14 = <f32>value / 127.0 * 99; break;
            case 24: dx7_alg5_bells_fHslider11 = <f32>value / 127.0 * 99; break;
            case 25: dx7_alg5_bells_fHslider9 = <f32>value / 127.0 * 99; break;
            case 26: dx7_alg5_bells_fHslider15 = <f32>value / 127.0 * 99; break;
            case 27: dx7_alg5_bells_fHslider16 = <f32>value / 127.0 * 99; break;
            case 28: dx7_alg5_bells_fHslider12 = <f32>value / 127.0 * 99; break;
            case 29: dx7_alg5_bells_fHslider1 = <f32>value / 127.0 * 99; break;
            case 30: dx7_alg5_bells_fHslider7 = <f32>value / 127.0 * 7; break;
            case 31: dx7_alg5_bells_fHslider17 = <f32>value / 127.0 * 3; break;
            case 32: dx7_alg5_bells_fHslider10 = <f32>value / 127.0 * 7; break;
            case 33: dx7_alg5_bells_fHslider4 = <f32>value / 127.0 * 99; break;
            case 34: dx7_alg5_bells_fHslider5 = <f32>value / 127.0 * 99; break;
            case 35: dx7_alg5_bells_fHslider6 = <f32>value / 127.0 * 99; break;
            case 36: dx7_alg5_bells_fEntry0 = <f32>value / 127.0 * 3; break;
            case 37: dx7_alg5_bells_fEntry1 = <f32>value / 127.0 * 3; break;
            case 38: dx7_alg5_bells_fHslider51 = -7 + <f32>value / 127.0 * 14; break;
            case 39: dx7_alg5_bells_fHslider52 = <f32>value / 127.0 * 31; break;
            case 40: dx7_alg5_bells_fHslider53 = <f32>value / 127.0 * 99; break;
            case 41: dx7_alg5_bells_fHslider36 = <f32>value / 127.0 * 99; break;
            case 42: dx7_alg5_bells_fHslider46 = <f32>value / 127.0 * 99; break;
            case 43: dx7_alg5_bells_fHslider47 = <f32>value / 127.0 * 99; break;
            case 44: dx7_alg5_bells_fHslider44 = <f32>value / 127.0 * 99; break;
            case 45: dx7_alg5_bells_fHslider42 = <f32>value / 127.0 * 99; break;
            case 46: dx7_alg5_bells_fHslider48 = <f32>value / 127.0 * 99; break;
            case 47: dx7_alg5_bells_fHslider49 = <f32>value / 127.0 * 99; break;
            case 48: dx7_alg5_bells_fHslider45 = <f32>value / 127.0 * 99; break;
            case 49: dx7_alg5_bells_fHslider37 = <f32>value / 127.0 * 99; break;
            case 50: dx7_alg5_bells_fHslider41 = <f32>value / 127.0 * 7; break;
            case 51: dx7_alg5_bells_fHslider50 = <f32>value / 127.0 * 3; break;
            case 52: dx7_alg5_bells_fHslider43 = <f32>value / 127.0 * 7; break;
            case 53: dx7_alg5_bells_fHslider38 = <f32>value / 127.0 * 99; break;
            case 54: dx7_alg5_bells_fHslider39 = <f32>value / 127.0 * 99; break;
            case 55: dx7_alg5_bells_fHslider40 = <f32>value / 127.0 * 99; break;
            case 56: dx7_alg5_bells_fEntry3 = <f32>value / 127.0 * 3; break;
            case 57: dx7_alg5_bells_fEntry4 = <f32>value / 127.0 * 3; break;
            case 58: dx7_alg5_bells_fHslider69 = -7 + <f32>value / 127.0 * 14; break;
            case 59: dx7_alg5_bells_fHslider70 = <f32>value / 127.0 * 31; break;
            case 60: dx7_alg5_bells_fHslider71 = <f32>value / 127.0 * 99; break;
            case 61: dx7_alg5_bells_fHslider54 = <f32>value / 127.0 * 99; break;
            case 62: dx7_alg5_bells_fHslider64 = <f32>value / 127.0 * 99; break;
            case 63: dx7_alg5_bells_fHslider65 = <f32>value / 127.0 * 99; break;
            case 64: dx7_alg5_bells_fHslider62 = <f32>value / 127.0 * 99; break;
            case 65: dx7_alg5_bells_fHslider60 = <f32>value / 127.0 * 99; break;
            case 66: dx7_alg5_bells_fHslider66 = <f32>value / 127.0 * 99; break;
            case 67: dx7_alg5_bells_fHslider67 = <f32>value / 127.0 * 99; break;
            case 68: dx7_alg5_bells_fHslider63 = <f32>value / 127.0 * 99; break;
            case 69: dx7_alg5_bells_fHslider55 = <f32>value / 127.0 * 99; break;
            case 70: dx7_alg5_bells_fHslider59 = <f32>value / 127.0 * 7; break;
            case 71: dx7_alg5_bells_fHslider68 = <f32>value / 127.0 * 3; break;
            case 72: dx7_alg5_bells_fHslider61 = <f32>value / 127.0 * 7; break;
            case 73: dx7_alg5_bells_fHslider56 = <f32>value / 127.0 * 99; break;
            case 74: dx7_alg5_bells_fHslider57 = <f32>value / 127.0 * 99; break;
            case 75: dx7_alg5_bells_fHslider58 = <f32>value / 127.0 * 99; break;
            case 76: dx7_alg5_bells_fEntry5 = <f32>value / 127.0 * 3; break;
            case 77: dx7_alg5_bells_fEntry6 = <f32>value / 127.0 * 3; break;
            case 78: dx7_alg5_bells_fHslider87 = -7 + <f32>value / 127.0 * 14; break;
            case 79: dx7_alg5_bells_fHslider88 = <f32>value / 127.0 * 31; break;
            case 80: dx7_alg5_bells_fHslider89 = <f32>value / 127.0 * 99; break;
            case 81: dx7_alg5_bells_fHslider72 = <f32>value / 127.0 * 99; break;
            case 82: dx7_alg5_bells_fHslider82 = <f32>value / 127.0 * 99; break;
            case 83: dx7_alg5_bells_fHslider83 = <f32>value / 127.0 * 99; break;
            case 84: dx7_alg5_bells_fHslider80 = <f32>value / 127.0 * 99; break;
            case 85: dx7_alg5_bells_fHslider78 = <f32>value / 127.0 * 99; break;
            case 86: dx7_alg5_bells_fHslider84 = <f32>value / 127.0 * 99; break;
            case 87: dx7_alg5_bells_fHslider85 = <f32>value / 127.0 * 99; break;
            case 88: dx7_alg5_bells_fHslider81 = <f32>value / 127.0 * 99; break;
            case 89: dx7_alg5_bells_fHslider73 = <f32>value / 127.0 * 99; break;
            case 90: dx7_alg5_bells_fHslider77 = <f32>value / 127.0 * 7; break;
            case 91: dx7_alg5_bells_fHslider86 = <f32>value / 127.0 * 3; break;
            case 92: dx7_alg5_bells_fHslider79 = <f32>value / 127.0 * 7; break;
            case 93: dx7_alg5_bells_fHslider74 = <f32>value / 127.0 * 99; break;
            case 94: dx7_alg5_bells_fHslider75 = <f32>value / 127.0 * 99; break;
            case 95: dx7_alg5_bells_fHslider76 = <f32>value / 127.0 * 99; break;
            case 96: dx7_alg5_bells_fEntry7 = <f32>value / 127.0 * 3; break;
            case 97: dx7_alg5_bells_fEntry8 = <f32>value / 127.0 * 3; break;
            case 98: dx7_alg5_bells_fHslider105 = -7 + <f32>value / 127.0 * 14; break;
            case 99: dx7_alg5_bells_fHslider106 = <f32>value / 127.0 * 31; break;
            case 100: dx7_alg5_bells_fHslider107 = <f32>value / 127.0 * 99; break;
            case 101: dx7_alg5_bells_fHslider90 = <f32>value / 127.0 * 99; break;
            case 102: dx7_alg5_bells_fHslider100 = <f32>value / 127.0 * 99; break;
            case 103: dx7_alg5_bells_fHslider101 = <f32>value / 127.0 * 99; break;
            case 104: dx7_alg5_bells_fHslider98 = <f32>value / 127.0 * 99; break;
            case 105: dx7_alg5_bells_fHslider96 = <f32>value / 127.0 * 99; break;
            case 106: dx7_alg5_bells_fHslider102 = <f32>value / 127.0 * 99; break;
            case 107: dx7_alg5_bells_fHslider103 = <f32>value / 127.0 * 99; break;
            case 108: dx7_alg5_bells_fHslider99 = <f32>value / 127.0 * 99; break;
            case 109: dx7_alg5_bells_fHslider91 = <f32>value / 127.0 * 99; break;
            case 110: dx7_alg5_bells_fHslider95 = <f32>value / 127.0 * 7; break;
            case 111: dx7_alg5_bells_fHslider104 = <f32>value / 127.0 * 3; break;
            case 112: dx7_alg5_bells_fHslider97 = <f32>value / 127.0 * 7; break;
            case 113: dx7_alg5_bells_fHslider92 = <f32>value / 127.0 * 99; break;
            case 114: dx7_alg5_bells_fHslider93 = <f32>value / 127.0 * 99; break;
            case 115: dx7_alg5_bells_fHslider94 = <f32>value / 127.0 * 99; break;
            case 116: dx7_alg5_bells_fEntry9 = <f32>value / 127.0 * 3; break;
            case 117: dx7_alg5_bells_fEntry10 = <f32>value / 127.0 * 3; break;
            case 118: dx7_alg5_bells_fHslider123 = -7 + <f32>value / 127.0 * 14; break;
            case 119: dx7_alg5_bells_fHslider124 = <f32>value / 127.0 * 31; break;
            case 120: dx7_alg5_bells_fHslider125 = <f32>value / 127.0 * 99; break;
            case 121: dx7_alg5_bells_fHslider108 = <f32>value / 127.0 * 99; break;
            case 122: dx7_alg5_bells_fHslider118 = <f32>value / 127.0 * 99; break;
            case 123: dx7_alg5_bells_fHslider119 = <f32>value / 127.0 * 99; break;
            case 124: dx7_alg5_bells_fHslider116 = <f32>value / 127.0 * 99; break;
            case 125: dx7_alg5_bells_fHslider114 = <f32>value / 127.0 * 99; break;
            case 126: dx7_alg5_bells_fHslider120 = <f32>value / 127.0 * 99; break;
            case 127: dx7_alg5_bells_fHslider121 = <f32>value / 127.0 * 99; break;
            case 128: dx7_alg5_bells_fHslider117 = <f32>value / 127.0 * 99; break;
            case 129: dx7_alg5_bells_fHslider109 = <f32>value / 127.0 * 99; break;
            case 130: dx7_alg5_bells_fHslider113 = <f32>value / 127.0 * 7; break;
            case 131: dx7_alg5_bells_fHslider122 = <f32>value / 127.0 * 3; break;
            case 132: dx7_alg5_bells_fHslider115 = <f32>value / 127.0 * 7; break;
            case 133: dx7_alg5_bells_fHslider110 = <f32>value / 127.0 * 99; break;
            case 134: dx7_alg5_bells_fHslider111 = <f32>value / 127.0 * 99; break;
            case 135: dx7_alg5_bells_fHslider112 = <f32>value / 127.0 * 99; break;
            case 136: dx7_alg5_bells_fEntry11 = <f32>value / 127.0 * 3; break;
            case 137: dx7_alg5_bells_fEntry12 = <f32>value / 127.0 * 3; break;
        }
    }
}

// Feedback (NRPN 0)
let dx7_alg17_fHslider126: f32 = 0;
// Transpose (NRPN 1)
let dx7_alg17_fHslider2: f32 = 0;
// Osc Key Sync (NRPN 2)
let dx7_alg17_fHslider37: f32 = 1;
// L1 (NRPN 3)
let dx7_alg17_fHslider42: f32 = 50;
// L2 (NRPN 4)
let dx7_alg17_fHslider45: f32 = 50;
// L3 (NRPN 5)
let dx7_alg17_fHslider46: f32 = 50;
// L4 (NRPN 6)
let dx7_alg17_fHslider41: f32 = 50;
// R1 (NRPN 7)
let dx7_alg17_fHslider44: f32 = 99;
// R2 (NRPN 8)
let dx7_alg17_fHslider47: f32 = 99;
// R3 (NRPN 9)
let dx7_alg17_fHslider48: f32 = 99;
// R4 (NRPN 10)
let dx7_alg17_fHslider43: f32 = 99;
// Wave (NRPN 11)
let dx7_alg17_fEntry2: f32 = 0;
// Speed (NRPN 12)
let dx7_alg17_fHslider20: f32 = 35;
// Delay (NRPN 13)
let dx7_alg17_fHslider21: f32 = 0;
// PMD (NRPN 14)
let dx7_alg17_fHslider49: f32 = 0;
// AMD (NRPN 15)
let dx7_alg17_fHslider18: f32 = 0;
// Sync (NRPN 16)
let dx7_alg17_fHslider19: f32 = 1;
// P Mod Sens (NRPN 17)
let dx7_alg17_fHslider50: f32 = 3;
// Tune (NRPN 18)
let dx7_alg17_fHslider105: f32 = 0;
// Coarse (NRPN 19)
let dx7_alg17_fHslider106: f32 = 1;
// Fine (NRPN 20)
let dx7_alg17_fHslider107: f32 = 0;
// L1 (NRPN 21)
let dx7_alg17_fHslider0: f32 = 99;
// L2 (NRPN 22)
let dx7_alg17_fHslider13: f32 = 99;
// L3 (NRPN 23)
let dx7_alg17_fHslider14: f32 = 99;
// L4 (NRPN 24)
let dx7_alg17_fHslider11: f32 = 0;
// R1 (NRPN 25)
let dx7_alg17_fHslider9: f32 = 99;
// R2 (NRPN 26)
let dx7_alg17_fHslider15: f32 = 99;
// R3 (NRPN 27)
let dx7_alg17_fHslider16: f32 = 99;
// R4 (NRPN 28)
let dx7_alg17_fHslider12: f32 = 99;
// Level (NRPN 29)
let dx7_alg17_fHslider1: f32 = 99;
// Key Vel (NRPN 30)
let dx7_alg17_fHslider7: f32 = 0;
// A Mod Sens (NRPN 31)
let dx7_alg17_fHslider17: f32 = 0;
// Rate Scaling (NRPN 32)
let dx7_alg17_fHslider10: f32 = 0;
// Breakpoint (NRPN 33)
let dx7_alg17_fHslider4: f32 = 0;
// L Depth (NRPN 34)
let dx7_alg17_fHslider5: f32 = 0;
// R Depth (NRPN 35)
let dx7_alg17_fHslider6: f32 = 0;
// L Curve (NRPN 36)
let dx7_alg17_fEntry0: f32 = 0;
// R Curve (NRPN 37)
let dx7_alg17_fEntry1: f32 = 0;
// Tune (NRPN 38)
let dx7_alg17_fHslider123: f32 = 0;
// Coarse (NRPN 39)
let dx7_alg17_fHslider124: f32 = 1;
// Fine (NRPN 40)
let dx7_alg17_fHslider125: f32 = 0;
// L1 (NRPN 41)
let dx7_alg17_fHslider108: f32 = 99;
// L2 (NRPN 42)
let dx7_alg17_fHslider118: f32 = 99;
// L3 (NRPN 43)
let dx7_alg17_fHslider119: f32 = 99;
// L4 (NRPN 44)
let dx7_alg17_fHslider116: f32 = 0;
// R1 (NRPN 45)
let dx7_alg17_fHslider114: f32 = 99;
// R2 (NRPN 46)
let dx7_alg17_fHslider120: f32 = 99;
// R3 (NRPN 47)
let dx7_alg17_fHslider121: f32 = 99;
// R4 (NRPN 48)
let dx7_alg17_fHslider117: f32 = 99;
// Level (NRPN 49)
let dx7_alg17_fHslider109: f32 = 0;
// Key Vel (NRPN 50)
let dx7_alg17_fHslider113: f32 = 0;
// A Mod Sens (NRPN 51)
let dx7_alg17_fHslider122: f32 = 0;
// Rate Scaling (NRPN 52)
let dx7_alg17_fHslider115: f32 = 0;
// Breakpoint (NRPN 53)
let dx7_alg17_fHslider110: f32 = 0;
// L Depth (NRPN 54)
let dx7_alg17_fHslider111: f32 = 0;
// R Depth (NRPN 55)
let dx7_alg17_fHslider112: f32 = 0;
// L Curve (NRPN 56)
let dx7_alg17_fEntry11: f32 = 0;
// R Curve (NRPN 57)
let dx7_alg17_fEntry12: f32 = 0;
// Tune (NRPN 58)
let dx7_alg17_fHslider38: f32 = 0;
// Coarse (NRPN 59)
let dx7_alg17_fHslider39: f32 = 1;
// Fine (NRPN 60)
let dx7_alg17_fHslider40: f32 = 0;
// L1 (NRPN 61)
let dx7_alg17_fHslider22: f32 = 99;
// L2 (NRPN 62)
let dx7_alg17_fHslider32: f32 = 99;
// L3 (NRPN 63)
let dx7_alg17_fHslider33: f32 = 99;
// L4 (NRPN 64)
let dx7_alg17_fHslider30: f32 = 0;
// R1 (NRPN 65)
let dx7_alg17_fHslider28: f32 = 99;
// R2 (NRPN 66)
let dx7_alg17_fHslider34: f32 = 99;
// R3 (NRPN 67)
let dx7_alg17_fHslider35: f32 = 99;
// R4 (NRPN 68)
let dx7_alg17_fHslider31: f32 = 99;
// Level (NRPN 69)
let dx7_alg17_fHslider23: f32 = 0;
// Key Vel (NRPN 70)
let dx7_alg17_fHslider27: f32 = 0;
// A Mod Sens (NRPN 71)
let dx7_alg17_fHslider36: f32 = 0;
// Rate Scaling (NRPN 72)
let dx7_alg17_fHslider29: f32 = 0;
// Breakpoint (NRPN 73)
let dx7_alg17_fHslider24: f32 = 0;
// L Depth (NRPN 74)
let dx7_alg17_fHslider25: f32 = 0;
// R Depth (NRPN 75)
let dx7_alg17_fHslider26: f32 = 0;
// L Curve (NRPN 76)
let dx7_alg17_fEntry3: f32 = 0;
// R Curve (NRPN 77)
let dx7_alg17_fEntry4: f32 = 0;
// Tune (NRPN 78)
let dx7_alg17_fHslider66: f32 = 0;
// Coarse (NRPN 79)
let dx7_alg17_fHslider67: f32 = 1;
// Fine (NRPN 80)
let dx7_alg17_fHslider68: f32 = 0;
// L1 (NRPN 81)
let dx7_alg17_fHslider51: f32 = 99;
// L2 (NRPN 82)
let dx7_alg17_fHslider61: f32 = 99;
// L3 (NRPN 83)
let dx7_alg17_fHslider62: f32 = 99;
// L4 (NRPN 84)
let dx7_alg17_fHslider59: f32 = 0;
// R1 (NRPN 85)
let dx7_alg17_fHslider57: f32 = 99;
// R2 (NRPN 86)
let dx7_alg17_fHslider63: f32 = 99;
// R3 (NRPN 87)
let dx7_alg17_fHslider64: f32 = 99;
// R4 (NRPN 88)
let dx7_alg17_fHslider60: f32 = 99;
// Level (NRPN 89)
let dx7_alg17_fHslider52: f32 = 0;
// Key Vel (NRPN 90)
let dx7_alg17_fHslider56: f32 = 0;
// A Mod Sens (NRPN 91)
let dx7_alg17_fHslider65: f32 = 0;
// Rate Scaling (NRPN 92)
let dx7_alg17_fHslider58: f32 = 0;
// Breakpoint (NRPN 93)
let dx7_alg17_fHslider53: f32 = 0;
// L Depth (NRPN 94)
let dx7_alg17_fHslider54: f32 = 0;
// R Depth (NRPN 95)
let dx7_alg17_fHslider55: f32 = 0;
// L Curve (NRPN 96)
let dx7_alg17_fEntry5: f32 = 0;
// R Curve (NRPN 97)
let dx7_alg17_fEntry6: f32 = 0;
// Tune (NRPN 98)
let dx7_alg17_fHslider84: f32 = 0;
// Coarse (NRPN 99)
let dx7_alg17_fHslider85: f32 = 1;
// Fine (NRPN 100)
let dx7_alg17_fHslider86: f32 = 0;
// L1 (NRPN 101)
let dx7_alg17_fHslider69: f32 = 99;
// L2 (NRPN 102)
let dx7_alg17_fHslider79: f32 = 99;
// L3 (NRPN 103)
let dx7_alg17_fHslider80: f32 = 99;
// L4 (NRPN 104)
let dx7_alg17_fHslider77: f32 = 0;
// R1 (NRPN 105)
let dx7_alg17_fHslider75: f32 = 99;
// R2 (NRPN 106)
let dx7_alg17_fHslider81: f32 = 99;
// R3 (NRPN 107)
let dx7_alg17_fHslider82: f32 = 99;
// R4 (NRPN 108)
let dx7_alg17_fHslider78: f32 = 99;
// Level (NRPN 109)
let dx7_alg17_fHslider70: f32 = 0;
// Key Vel (NRPN 110)
let dx7_alg17_fHslider74: f32 = 0;
// A Mod Sens (NRPN 111)
let dx7_alg17_fHslider83: f32 = 0;
// Rate Scaling (NRPN 112)
let dx7_alg17_fHslider76: f32 = 0;
// Breakpoint (NRPN 113)
let dx7_alg17_fHslider71: f32 = 0;
// L Depth (NRPN 114)
let dx7_alg17_fHslider72: f32 = 0;
// R Depth (NRPN 115)
let dx7_alg17_fHslider73: f32 = 0;
// L Curve (NRPN 116)
let dx7_alg17_fEntry7: f32 = 0;
// R Curve (NRPN 117)
let dx7_alg17_fEntry8: f32 = 0;
// Tune (NRPN 118)
let dx7_alg17_fHslider102: f32 = 0;
// Coarse (NRPN 119)
let dx7_alg17_fHslider103: f32 = 1;
// Fine (NRPN 120)
let dx7_alg17_fHslider104: f32 = 0;
// L1 (NRPN 121)
let dx7_alg17_fHslider87: f32 = 99;
// L2 (NRPN 122)
let dx7_alg17_fHslider97: f32 = 99;
// L3 (NRPN 123)
let dx7_alg17_fHslider98: f32 = 99;
// L4 (NRPN 124)
let dx7_alg17_fHslider95: f32 = 0;
// R1 (NRPN 125)
let dx7_alg17_fHslider93: f32 = 99;
// R2 (NRPN 126)
let dx7_alg17_fHslider99: f32 = 99;
// R3 (NRPN 127)
let dx7_alg17_fHslider100: f32 = 99;
// R4 (NRPN 128)
let dx7_alg17_fHslider96: f32 = 99;
// Level (NRPN 129)
let dx7_alg17_fHslider88: f32 = 0;
// Key Vel (NRPN 130)
let dx7_alg17_fHslider92: f32 = 0;
// A Mod Sens (NRPN 131)
let dx7_alg17_fHslider101: f32 = 0;
// Rate Scaling (NRPN 132)
let dx7_alg17_fHslider94: f32 = 0;
// Breakpoint (NRPN 133)
let dx7_alg17_fHslider89: f32 = 0;
// L Depth (NRPN 134)
let dx7_alg17_fHslider90: f32 = 0;
// R Depth (NRPN 135)
let dx7_alg17_fHslider91: f32 = 0;
// L Curve (NRPN 136)
let dx7_alg17_fEntry9: f32 = 0;
// R Curve (NRPN 137)
let dx7_alg17_fEntry10: f32 = 0;

const Dx7_alg17_wave_SIG0Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 5, 9, 13, 17, 20, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 42, 43, 45, 46]);
const Dx7_alg17_wave_SIG1Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14, 16, 19, 23, 27, 33, 39, 47, 56, 66, 80, 94, 110, 126, 142, 158, 174, 190, 206, 222, 238, 250]);
const Dx7_alg17_wave_SIG2Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 70, 86, 97, 106, 114, 121, 126, 132, 138, 142, 148, 152, 156, 160, 163, 166, 170, 173, 174, 178, 181, 184, 186, 189, 190, 194, 196, 198, 200, 202, 205, 206, 209, 211, 214, 216, 218, 220, 222, 224, 225, 227, 229, 230, 232, 233, 235, 237, 238, 240, 241, 242, 243, 244, 246, 246, 248, 249, 250, 251, 252, 253, 254]);
const Dx7_alg17_wave_SIG3Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1764000, 1764000, 1411200, 1411200, 1190700, 1014300, 992250, 882000, 705600, 705600, 584325, 507150, 502740, 441000, 418950, 352800, 308700, 286650, 253575, 220500, 220500, 176400, 145530, 145530, 125685, 110250, 110250, 88200, 88200, 74970, 61740, 61740, 55125, 48510, 44100, 37485, 31311, 30870, 27562, 27562, 22050, 18522, 17640, 15435, 14112, 13230, 11025, 9261, 9261, 7717, 6615, 6615, 5512, 5512, 4410, 3969, 3969, 3439, 2866, 2690, 2249, 1984, 1896, 1808, 1411, 1367, 1234, 1146, 926, 837, 837, 705, 573, 573, 529, 441, 441]);
const Dx7_alg17_wave_SIG4Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 4342338, 7171437, 16777216]);
const Dx7_alg17_wave_SIG5Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-16777216, 0, 16777216, 26591258, 33554432, 38955489, 43368474, 47099600, 50331648, 53182516, 55732705, 58039632, 60145690, 62083076, 63876816, 65546747, 67108864, 68576247, 69959732, 71268397, 72509921, 73690858, 74816848, 75892776, 76922906, 77910978, 78860292, 79773775, 80654032, 81503396, 82323963, 83117622]);
const Dx7_alg17_wave_SIG6Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-128, -116, -104, -95, -85, -76, -68, -61, -56, -52, -49, -46, -43, -41, -39, -37, -35, -33, -32, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 38, 40, 43, 46, 49, 53, 58, 65, 73, 82, 92, 103, 115, 127]);
const Dx7_alg17_wave_SIG7Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 33, 34, 36, 37, 38, 39, 41, 42, 44, 46, 47, 49, 51, 53, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 79, 82, 85, 88, 91, 94, 98, 102, 106, 110, 115, 120, 125, 130, 135, 141, 147, 153, 159, 165, 171, 178, 185, 193, 202, 211, 232, 243, 254, 255]);
const Dx7_alg17_wave_SIG8Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 10, 20, 33, 55, 92, 153, 255]);

const Dx7_alg17_itbl0SIG0: StaticArray<i32> = new StaticArray<i32>(20);
const Dx7_alg17_itbl1SIG1: StaticArray<i32> = new StaticArray<i32>(33);
const Dx7_alg17_itbl2SIG2: StaticArray<i32> = new StaticArray<i32>(64);
const Dx7_alg17_itbl3SIG3: StaticArray<i32> = new StaticArray<i32>(77);
const Dx7_alg17_itbl4SIG4: StaticArray<i32> = new StaticArray<i32>(4);
const Dx7_alg17_itbl5SIG5: StaticArray<i32> = new StaticArray<i32>(32);
const Dx7_alg17_itbl6SIG6: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg17_itbl7SIG7: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg17_itbl8SIG8: StaticArray<i32> = new StaticArray<i32>(8);
let _Dx7_alg17_sig0_initialized: bool = false;

function _Dx7_alg17_initSIG0Tables(): void {
    if (_Dx7_alg17_sig0_initialized) return;
    _Dx7_alg17_sig0_initialized = true;
    let sig0_iDx7_alg17SIG0Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg17_itbl0SIG0.length; i++) {
        Dx7_alg17_itbl0SIG0[i] = Dx7_alg17_wave_SIG0Wave0[sig0_iDx7_alg17SIG0Wave0_idx];
        sig0_iDx7_alg17SIG0Wave0_idx = (1 + sig0_iDx7_alg17SIG0Wave0_idx) % 20;
    }
    let sig1_iDx7_alg17SIG1Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg17_itbl1SIG1.length; i++) {
        Dx7_alg17_itbl1SIG1[i] = Dx7_alg17_wave_SIG1Wave0[sig1_iDx7_alg17SIG1Wave0_idx];
        sig1_iDx7_alg17SIG1Wave0_idx = (1 + sig1_iDx7_alg17SIG1Wave0_idx) % 33;
    }
    let sig2_iDx7_alg17SIG2Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg17_itbl2SIG2.length; i++) {
        Dx7_alg17_itbl2SIG2[i] = Dx7_alg17_wave_SIG2Wave0[sig2_iDx7_alg17SIG2Wave0_idx];
        sig2_iDx7_alg17SIG2Wave0_idx = (1 + sig2_iDx7_alg17SIG2Wave0_idx) % 64;
    }
    let sig3_iDx7_alg17SIG3Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg17_itbl3SIG3.length; i++) {
        Dx7_alg17_itbl3SIG3[i] = Dx7_alg17_wave_SIG3Wave0[sig3_iDx7_alg17SIG3Wave0_idx];
        sig3_iDx7_alg17SIG3Wave0_idx = (1 + sig3_iDx7_alg17SIG3Wave0_idx) % 77;
    }
    let sig4_iDx7_alg17SIG4Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg17_itbl4SIG4.length; i++) {
        Dx7_alg17_itbl4SIG4[i] = Dx7_alg17_wave_SIG4Wave0[sig4_iDx7_alg17SIG4Wave0_idx];
        sig4_iDx7_alg17SIG4Wave0_idx = (1 + sig4_iDx7_alg17SIG4Wave0_idx) % 4;
    }
    let sig5_iDx7_alg17SIG5Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg17_itbl5SIG5.length; i++) {
        Dx7_alg17_itbl5SIG5[i] = Dx7_alg17_wave_SIG5Wave0[sig5_iDx7_alg17SIG5Wave0_idx];
        sig5_iDx7_alg17SIG5Wave0_idx = (1 + sig5_iDx7_alg17SIG5Wave0_idx) % 32;
    }
    let sig6_iDx7_alg17SIG6Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg17_itbl6SIG6.length; i++) {
        Dx7_alg17_itbl6SIG6[i] = Dx7_alg17_wave_SIG6Wave0[sig6_iDx7_alg17SIG6Wave0_idx];
        sig6_iDx7_alg17SIG6Wave0_idx = (1 + sig6_iDx7_alg17SIG6Wave0_idx) % 100;
    }
    let sig7_iDx7_alg17SIG7Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg17_itbl7SIG7.length; i++) {
        Dx7_alg17_itbl7SIG7[i] = Dx7_alg17_wave_SIG7Wave0[sig7_iDx7_alg17SIG7Wave0_idx];
        sig7_iDx7_alg17SIG7Wave0_idx = (1 + sig7_iDx7_alg17SIG7Wave0_idx) % 100;
    }
    let sig8_iDx7_alg17SIG8Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg17_itbl8SIG8.length; i++) {
        Dx7_alg17_itbl8SIG8[i] = Dx7_alg17_wave_SIG8Wave0[sig8_iDx7_alg17SIG8Wave0_idx];
        sig8_iDx7_alg17SIG8Wave0_idx = (1 + sig8_iDx7_alg17SIG8Wave0_idx) % 8;
    }
}

export class Dx7_alg17 extends MidiVoice {
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
    private iRec12: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec13: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec14: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec15: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec16: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec17: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec18: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox0: f32 = 0;
    private fConst4: f32;
    private fRec20: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec21: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec22: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec23: StaticArray<i32> = new StaticArray<i32>(2);
    private fRec24: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec25: StaticArray<i32> = new StaticArray<i32>(2);
    private fRec19: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec26: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec27: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec28: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec29: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec30: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec31: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec32: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox1: f32 = 0;
    private fRec33: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec34: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec35: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec36: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec37: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec38: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec39: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec40: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox2: f32 = 0;
    private fRec41: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec42: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec43: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec44: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec45: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec46: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec47: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec48: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox3: f32 = 0;
    private fRec49: StaticArray<f32> = new StaticArray<f32>(2);
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
        _Dx7_alg17_initSIG0Tables();
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
        for (let i = 0; i < 2; i++) { this.iRec12[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec13[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec14[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec15[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec16[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec17[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec18[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec20[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec21[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec22[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec23[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec24[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec25[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec19[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec26[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec27[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec28[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec29[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec30[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec31[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec32[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec33[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec34[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec35[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec36[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec37[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec38[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec39[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec40[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec41[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec42[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec43[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec44[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec45[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec46[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec47[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec48[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec49[i] = 0.0; }
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
        this.fHslider8 = <f32>velocity / 127.0;
        this.fButton0 = 0.0;
        this.nextframe();
        this.fButton0 = 1.0;
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
        const fSlow1: f32 = Mathf.round(_fcast(dx7_alg17_fHslider0));
        const fSlow2: f32 = Mathf.round(_fcast(dx7_alg17_fHslider1));
        const fSlow3: f32 = Mathf.pow(2.0, 0.083333336 * (Mathf.round(_fcast(dx7_alg17_fHslider2)) + 17.31234 * Mathf.log(0.0022727272 * _fcast(this.fHslider3))));
        const fSlow4: f32 = Mathf.round(17.31234 * Mathf.log(fSlow3) + 69.0);
        const fSlow5: f32 = Mathf.round(_fcast(dx7_alg17_fHslider4));
        const fSlow6: f32 = Mathf.round(_fcast(dx7_alg17_fEntry0));
        const fSlow7: f32 = Mathf.round(_fcast(dx7_alg17_fHslider5));
        const fSlow8: f32 = fSlow4 + (-18.0 - fSlow5);
        const iSlow9: i32 = (((fSlow6 == 0.0 ? 1 : 0) | (fSlow6 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow7 * fSlow8)) >> 12 : _icast(329.0 * fSlow7 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow8))), 32))])) >> 15);
        const fSlow10: f32 = Mathf.round(_fcast(dx7_alg17_fEntry1));
        const fSlow11: f32 = Mathf.round(_fcast(dx7_alg17_fHslider6));
        const fSlow12: f32 = fSlow4 + (-16.0 - fSlow5);
        const iSlow13: i32 = (((fSlow10 == 0.0 ? 1 : 0) | (fSlow10 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow11 * fSlow12) >> 12 : _icast(329.0 * fSlow11 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow12)), 32))])) >> 15);
        const fSlow14: f32 = _fcast(Dx7_alg17_itbl2SIG2[_icast(Mathf.round(_fcast(_icast(Mathf.max(0.0, Mathf.min(127.0, 127.0 * _fcast(this.fHslider8)))) >> 1)))] + -239);
        const fSlow15: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow2 >= 2e+01 ? 1 : 0) ? fSlow2 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow2)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow5)) >= 0.0) ? ((fSlow10 < 2.0 ? 1 : 0) ? -iSlow13 : iSlow13) : ((fSlow6 < 2.0 ? 1 : 0) ? -iSlow9 : iSlow9)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg17_fHslider7)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow16: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow1 >= 2e+01 ? 1 : 0) ? fSlow1 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow1)), 19))]))) >> 1) << 6) + fSlow15 + -4256.0)) << 16;
        const iSlow17: i32 = fSlow1 == 0.0;
        const fSlow18: f32 = Mathf.round(_fcast(dx7_alg17_fHslider9));
        const fSlow19: f32 = Mathf.round(_fcast(dx7_alg17_fHslider10));
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
        const fSlow31: f32 = ((iSlow30) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow29)), 76))]) : 2e+01 * (99.0 - fSlow29));
        const iSlow32: i32 = (((iSlow16 == 0 ? 1 : 0) | iSlow17) ? _icast(this.fConst1 * ((iSlow30 & iSlow17) ? 0.05 * fSlow31 : fSlow31)) : 0);
        const fSlow33: f32 = Mathf.round(_fcast(dx7_alg17_fHslider11));
        const iSlow34: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fSlow33 >= 2e+01 ? 1 : 0) ? fSlow33 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow33)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow35: f32 = Mathf.round(_fcast(dx7_alg17_fHslider12));
        const fSlow36: f32 = Mathf.min(fSlow35 + fSlow28, 99.0);
        const iSlow37: i32 = _icast(this.fConst1 * ((fSlow36 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow36)), 76))]) : 2e+01 * (99.0 - fSlow36)));
        const fSlow38: f32 = Mathf.round(_fcast(dx7_alg17_fHslider13));
        const fSlow39: f32 = Mathf.round(_fcast(dx7_alg17_fHslider14));
        const fSlow40: f32 = Mathf.round(_fcast(dx7_alg17_fHslider15));
        const fSlow41: f32 = Mathf.round(_fcast(dx7_alg17_fHslider16));
        const iSlow42: i32 = iSlow16 > 0;
        const iSlow43: i32 = min<i32>(63, ((41 * _icast(fSlow18)) >> 6) + iSlow27);
        const iSlow44: i32 = _icast(this.fConst1 * _fcast(((iSlow43 & 3) + 4) << ((iSlow43 >> 2) + 2)));
        const iSlow45: i32 = min<i32>(63, ((41 * _icast(fSlow35)) >> 6) + iSlow27);
        const iSlow46: i32 = _icast(this.fConst1 * _fcast(((iSlow45 & 3) + 4) << ((iSlow45 >> 2) + 2)));
        const iSlow47: i32 = Dx7_alg17_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg17_fHslider17))))];
        const iSlow48: i32 = iSlow47 != 0;
        const fSlow49: f32 = 2.6972606e-09 * Mathf.round(_fcast(dx7_alg17_fHslider18));
        const iSlow50: i32 = _icast(Mathf.round(_fcast(dx7_alg17_fHslider19)));
        const fSlow51: f32 = Mathf.round(_fcast(dx7_alg17_fHslider20));
        const fSlow52: f32 = this.fConst2 * (((0.01010101 * fSlow51) <= 0.656566) ? 0.15806305 * fSlow51 + 0.036478 : 1.100254 * fSlow51 + -61.205933);
        const fSlow53: f32 = 99.0 - Mathf.round(_fcast(dx7_alg17_fHslider21));
        const iSlow54: i32 = (fSlow53 == 99.0 ? 1 : 0) >= 1;
        const iSlow55: i32 = _icast(fSlow53);
        const iSlow56: i32 = ((iSlow55 & 15) + 16) << ((iSlow55 >> 4) + 1);
        const fSlow57: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(max<i32>(iSlow56 & 65408, 128)));
        const fSlow58: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(iSlow56));
        const fSlow59: f32 = Mathf.round(_fcast(dx7_alg17_fEntry2));
        const iSlow60: i32 = fSlow59 >= 3.0;
        const iSlow61: i32 = fSlow59 >= 5.0;
        const iSlow62: i32 = fSlow59 >= 2.0;
        const iSlow63: i32 = fSlow59 >= 1.0;
        const iSlow64: i32 = fSlow59 >= 4.0;
        const fSlow65: f32 = _fcast(iSlow47);
        const fSlow66: f32 = Mathf.round(_fcast(dx7_alg17_fHslider22));
        const fSlow67: f32 = Mathf.round(_fcast(dx7_alg17_fHslider23));
        const fSlow68: f32 = Mathf.round(_fcast(dx7_alg17_fHslider24));
        const fSlow69: f32 = Mathf.round(_fcast(dx7_alg17_fEntry3));
        const fSlow70: f32 = Mathf.round(_fcast(dx7_alg17_fHslider25));
        const fSlow71: f32 = fSlow4 + (-18.0 - fSlow68);
        const iSlow72: i32 = (((fSlow69 == 0.0 ? 1 : 0) | (fSlow69 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow70 * fSlow71)) >> 12 : _icast(329.0 * fSlow70 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow71))), 32))])) >> 15);
        const fSlow73: f32 = Mathf.round(_fcast(dx7_alg17_fEntry4));
        const fSlow74: f32 = Mathf.round(_fcast(dx7_alg17_fHslider26));
        const fSlow75: f32 = fSlow4 + (-16.0 - fSlow68);
        const iSlow76: i32 = (((fSlow73 == 0.0 ? 1 : 0) | (fSlow73 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow74 * fSlow75) >> 12 : _icast(329.0 * fSlow74 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow75)), 32))])) >> 15);
        const fSlow77: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow67 >= 2e+01 ? 1 : 0) ? fSlow67 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow67)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow68)) >= 0.0) ? ((fSlow73 < 2.0 ? 1 : 0) ? -iSlow76 : iSlow76) : ((fSlow69 < 2.0 ? 1 : 0) ? -iSlow72 : iSlow72)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg17_fHslider27)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow78: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow66 >= 2e+01 ? 1 : 0) ? fSlow66 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow66)), 19))]))) >> 1) << 6) + fSlow77 + -4256.0)) << 16;
        const iSlow79: i32 = fSlow66 == 0.0;
        const fSlow80: f32 = Mathf.round(_fcast(dx7_alg17_fHslider28));
        const fSlow81: f32 = Mathf.round(_fcast(dx7_alg17_fHslider29));
        const iSlow82: i32 = _icast(fSlow81 * fSlow25) >> 3;
        const iSlow83: i32 = (((fSlow81 == 3.0 ? 1 : 0) & iSlow22) ? iSlow82 + -1 : ((((fSlow81 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow82 + 1 : iSlow82));
        const fSlow84: f32 = _fcast(iSlow83);
        const fSlow85: f32 = Mathf.min(fSlow80 + fSlow84, 99.0);
        const iSlow86: i32 = fSlow85 < 77.0;
        const fSlow87: f32 = ((iSlow86) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow85)), 76))]) : 2e+01 * (99.0 - fSlow85));
        const iSlow88: i32 = (((iSlow78 == 0 ? 1 : 0) | iSlow79) ? _icast(this.fConst1 * ((iSlow86 & iSlow79) ? 0.05 * fSlow87 : fSlow87)) : 0);
        const fSlow89: f32 = Mathf.round(_fcast(dx7_alg17_fHslider30));
        const iSlow90: i32 = _icast(Mathf.max(16.0, fSlow77 + _fcast((_icast(((fSlow89 >= 2e+01 ? 1 : 0) ? fSlow89 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow89)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow91: f32 = Mathf.round(_fcast(dx7_alg17_fHslider31));
        const fSlow92: f32 = Mathf.min(fSlow91 + fSlow84, 99.0);
        const iSlow93: i32 = _icast(this.fConst1 * ((fSlow92 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow92)), 76))]) : 2e+01 * (99.0 - fSlow92)));
        const fSlow94: f32 = Mathf.round(_fcast(dx7_alg17_fHslider32));
        const fSlow95: f32 = Mathf.round(_fcast(dx7_alg17_fHslider33));
        const fSlow96: f32 = Mathf.round(_fcast(dx7_alg17_fHslider34));
        const fSlow97: f32 = Mathf.round(_fcast(dx7_alg17_fHslider35));
        const iSlow98: i32 = iSlow78 > 0;
        const iSlow99: i32 = min<i32>(63, ((41 * _icast(fSlow80)) >> 6) + iSlow83);
        const iSlow100: i32 = _icast(this.fConst1 * _fcast(((iSlow99 & 3) + 4) << ((iSlow99 >> 2) + 2)));
        const iSlow101: i32 = min<i32>(63, ((41 * _icast(fSlow91)) >> 6) + iSlow83);
        const iSlow102: i32 = _icast(this.fConst1 * _fcast(((iSlow101 & 3) + 4) << ((iSlow101 >> 2) + 2)));
        const iSlow103: i32 = Dx7_alg17_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg17_fHslider36))))];
        const iSlow104: i32 = iSlow103 != 0;
        const fSlow105: f32 = _fcast(iSlow103);
        const iSlow106: i32 = _icast(Mathf.round(_fcast(dx7_alg17_fHslider37)));
        const iSlow107: i32 = _icast(Mathf.round(_fcast(this.fCheckbox0)));
        const fSlow108: f32 = Mathf.log(4.4e+02 * fSlow3);
        const fSlow109: f32 = Mathf.round(_fcast(dx7_alg17_fHslider38));
        const fSlow110: f32 = Mathf.exp(-0.57130724 * fSlow108);
        const iSlow111: i32 = _icast(Mathf.round(_fcast(dx7_alg17_fHslider39)));
        const fSlow112: f32 = Mathf.round(_fcast(dx7_alg17_fHslider40));
        const fSlow113: f32 = ((iSlow107) ? _fcast(_icast(4458616.0 * (fSlow112 + _fcast(100 * (iSlow111 & 3)))) >> 3) + ((fSlow109 > 0.0 ? 1 : 0) ? 13457.0 * fSlow109 : 0.0) : fSlow108 * (72267.445 * fSlow109 * fSlow110 + 24204406.0) + _fcast(Dx7_alg17_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow111 & 31)))]) + _fcast(((_icast(fSlow112)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow112 + 1.0) + 0.5)) : 0)));
        const fSlow114: f32 = Mathf.round(_fcast(dx7_alg17_fHslider41));
        const iSlow115: i32 = Dx7_alg17_itbl6SIG6[_icast(Mathf.round(fSlow114))];
        const fSlow116: f32 = _fcast(iSlow115);
        const fSlow117: f32 = Mathf.round(_fcast(dx7_alg17_fHslider42));
        const iSlow118: i32 = Dx7_alg17_itbl6SIG6[_icast(Mathf.round(fSlow117))];
        const iSlow119: i32 = iSlow118 > iSlow115;
        const fSlow120: f32 = Mathf.round(_fcast(dx7_alg17_fHslider43));
        const fSlow121: f32 = this.fConst4 * _fcast(Dx7_alg17_itbl7SIG7[_icast(Mathf.round(fSlow120))]);
        const fSlow122: f32 = Mathf.round(_fcast(dx7_alg17_fHslider44));
        const fSlow123: f32 = this.fConst4 * _fcast(Dx7_alg17_itbl7SIG7[_icast(Mathf.round(fSlow122))]);
        const fSlow124: f32 = Mathf.round(_fcast(dx7_alg17_fHslider45));
        const fSlow125: f32 = Mathf.round(_fcast(dx7_alg17_fHslider46));
        const fSlow126: f32 = Mathf.round(_fcast(dx7_alg17_fHslider47));
        const fSlow127: f32 = Mathf.round(_fcast(dx7_alg17_fHslider48));
        const fSlow128: f32 = 7.891414e-05 * Mathf.round(_fcast(dx7_alg17_fHslider49));
        const fSlow129: f32 = _fcast(Dx7_alg17_itbl8SIG8[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg17_fHslider50))))]);
        const fSlow130: f32 = Mathf.round(_fcast(dx7_alg17_fHslider51));
        const fSlow131: f32 = Mathf.round(_fcast(dx7_alg17_fHslider52));
        const fSlow132: f32 = Mathf.round(_fcast(dx7_alg17_fHslider53));
        const fSlow133: f32 = Mathf.round(_fcast(dx7_alg17_fEntry5));
        const fSlow134: f32 = Mathf.round(_fcast(dx7_alg17_fHslider54));
        const fSlow135: f32 = fSlow4 + (-18.0 - fSlow132);
        const iSlow136: i32 = (((fSlow133 == 0.0 ? 1 : 0) | (fSlow133 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow134 * fSlow135)) >> 12 : _icast(329.0 * fSlow134 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow135))), 32))])) >> 15);
        const fSlow137: f32 = Mathf.round(_fcast(dx7_alg17_fEntry6));
        const fSlow138: f32 = Mathf.round(_fcast(dx7_alg17_fHslider55));
        const fSlow139: f32 = fSlow4 + (-16.0 - fSlow132);
        const iSlow140: i32 = (((fSlow137 == 0.0 ? 1 : 0) | (fSlow137 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow138 * fSlow139) >> 12 : _icast(329.0 * fSlow138 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow139)), 32))])) >> 15);
        const fSlow141: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow131 >= 2e+01 ? 1 : 0) ? fSlow131 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow131)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow132)) >= 0.0) ? ((fSlow137 < 2.0 ? 1 : 0) ? -iSlow140 : iSlow140) : ((fSlow133 < 2.0 ? 1 : 0) ? -iSlow136 : iSlow136)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg17_fHslider56)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow142: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow130 >= 2e+01 ? 1 : 0) ? fSlow130 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow130)), 19))]))) >> 1) << 6) + fSlow141 + -4256.0)) << 16;
        const iSlow143: i32 = fSlow130 == 0.0;
        const fSlow144: f32 = Mathf.round(_fcast(dx7_alg17_fHslider57));
        const fSlow145: f32 = Mathf.round(_fcast(dx7_alg17_fHslider58));
        const iSlow146: i32 = _icast(fSlow145 * fSlow25) >> 3;
        const iSlow147: i32 = (((fSlow145 == 3.0 ? 1 : 0) & iSlow22) ? iSlow146 + -1 : ((((fSlow145 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow146 + 1 : iSlow146));
        const fSlow148: f32 = _fcast(iSlow147);
        const fSlow149: f32 = Mathf.min(fSlow144 + fSlow148, 99.0);
        const iSlow150: i32 = fSlow149 < 77.0;
        const fSlow151: f32 = ((iSlow150) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow149)), 76))]) : 2e+01 * (99.0 - fSlow149));
        const iSlow152: i32 = (((iSlow142 == 0 ? 1 : 0) | iSlow143) ? _icast(this.fConst1 * ((iSlow150 & iSlow143) ? 0.05 * fSlow151 : fSlow151)) : 0);
        const fSlow153: f32 = Mathf.round(_fcast(dx7_alg17_fHslider59));
        const iSlow154: i32 = _icast(Mathf.max(16.0, fSlow141 + _fcast((_icast(((fSlow153 >= 2e+01 ? 1 : 0) ? fSlow153 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow153)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow155: f32 = Mathf.round(_fcast(dx7_alg17_fHslider60));
        const fSlow156: f32 = Mathf.min(fSlow155 + fSlow148, 99.0);
        const iSlow157: i32 = _icast(this.fConst1 * ((fSlow156 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow156)), 76))]) : 2e+01 * (99.0 - fSlow156)));
        const fSlow158: f32 = Mathf.round(_fcast(dx7_alg17_fHslider61));
        const fSlow159: f32 = Mathf.round(_fcast(dx7_alg17_fHslider62));
        const fSlow160: f32 = Mathf.round(_fcast(dx7_alg17_fHslider63));
        const fSlow161: f32 = Mathf.round(_fcast(dx7_alg17_fHslider64));
        const iSlow162: i32 = iSlow142 > 0;
        const iSlow163: i32 = min<i32>(63, ((41 * _icast(fSlow144)) >> 6) + iSlow147);
        const iSlow164: i32 = _icast(this.fConst1 * _fcast(((iSlow163 & 3) + 4) << ((iSlow163 >> 2) + 2)));
        const iSlow165: i32 = min<i32>(63, ((41 * _icast(fSlow155)) >> 6) + iSlow147);
        const iSlow166: i32 = _icast(this.fConst1 * _fcast(((iSlow165 & 3) + 4) << ((iSlow165 >> 2) + 2)));
        const iSlow167: i32 = Dx7_alg17_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg17_fHslider65))))];
        const iSlow168: i32 = iSlow167 != 0;
        const fSlow169: f32 = _fcast(iSlow167);
        const iSlow170: i32 = _icast(Mathf.round(_fcast(this.fCheckbox1)));
        const fSlow171: f32 = Mathf.round(_fcast(dx7_alg17_fHslider66));
        const iSlow172: i32 = _icast(Mathf.round(_fcast(dx7_alg17_fHslider67)));
        const fSlow173: f32 = Mathf.round(_fcast(dx7_alg17_fHslider68));
        const fSlow174: f32 = ((iSlow170) ? _fcast(_icast(4458616.0 * (fSlow173 + _fcast(100 * (iSlow172 & 3)))) >> 3) + ((fSlow171 > 0.0 ? 1 : 0) ? 13457.0 * fSlow171 : 0.0) : fSlow108 * (72267.445 * fSlow171 * fSlow110 + 24204406.0) + _fcast(Dx7_alg17_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow172 & 31)))]) + _fcast(((_icast(fSlow173)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow173 + 1.0) + 0.5)) : 0)));
        const fSlow175: f32 = Mathf.round(_fcast(dx7_alg17_fHslider69));
        const fSlow176: f32 = Mathf.round(_fcast(dx7_alg17_fHslider70));
        const fSlow177: f32 = Mathf.round(_fcast(dx7_alg17_fHslider71));
        const fSlow178: f32 = Mathf.round(_fcast(dx7_alg17_fEntry7));
        const fSlow179: f32 = Mathf.round(_fcast(dx7_alg17_fHslider72));
        const fSlow180: f32 = fSlow4 + (-18.0 - fSlow177);
        const iSlow181: i32 = (((fSlow178 == 0.0 ? 1 : 0) | (fSlow178 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow179 * fSlow180)) >> 12 : _icast(329.0 * fSlow179 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow180))), 32))])) >> 15);
        const fSlow182: f32 = Mathf.round(_fcast(dx7_alg17_fEntry8));
        const fSlow183: f32 = Mathf.round(_fcast(dx7_alg17_fHslider73));
        const fSlow184: f32 = fSlow4 + (-16.0 - fSlow177);
        const iSlow185: i32 = (((fSlow182 == 0.0 ? 1 : 0) | (fSlow182 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow183 * fSlow184) >> 12 : _icast(329.0 * fSlow183 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow184)), 32))])) >> 15);
        const fSlow186: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow176 >= 2e+01 ? 1 : 0) ? fSlow176 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow176)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow177)) >= 0.0) ? ((fSlow182 < 2.0 ? 1 : 0) ? -iSlow185 : iSlow185) : ((fSlow178 < 2.0 ? 1 : 0) ? -iSlow181 : iSlow181)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg17_fHslider74)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow187: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow175 >= 2e+01 ? 1 : 0) ? fSlow175 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow175)), 19))]))) >> 1) << 6) + fSlow186 + -4256.0)) << 16;
        const iSlow188: i32 = fSlow175 == 0.0;
        const fSlow189: f32 = Mathf.round(_fcast(dx7_alg17_fHslider75));
        const fSlow190: f32 = Mathf.round(_fcast(dx7_alg17_fHslider76));
        const iSlow191: i32 = _icast(fSlow190 * fSlow25) >> 3;
        const iSlow192: i32 = (((fSlow190 == 3.0 ? 1 : 0) & iSlow22) ? iSlow191 + -1 : ((((fSlow190 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow191 + 1 : iSlow191));
        const fSlow193: f32 = _fcast(iSlow192);
        const fSlow194: f32 = Mathf.min(fSlow189 + fSlow193, 99.0);
        const iSlow195: i32 = fSlow194 < 77.0;
        const fSlow196: f32 = ((iSlow195) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow194)), 76))]) : 2e+01 * (99.0 - fSlow194));
        const iSlow197: i32 = (((iSlow187 == 0 ? 1 : 0) | iSlow188) ? _icast(this.fConst1 * ((iSlow195 & iSlow188) ? 0.05 * fSlow196 : fSlow196)) : 0);
        const fSlow198: f32 = Mathf.round(_fcast(dx7_alg17_fHslider77));
        const iSlow199: i32 = _icast(Mathf.max(16.0, fSlow186 + _fcast((_icast(((fSlow198 >= 2e+01 ? 1 : 0) ? fSlow198 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow198)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow200: f32 = Mathf.round(_fcast(dx7_alg17_fHslider78));
        const fSlow201: f32 = Mathf.min(fSlow200 + fSlow193, 99.0);
        const iSlow202: i32 = _icast(this.fConst1 * ((fSlow201 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow201)), 76))]) : 2e+01 * (99.0 - fSlow201)));
        const fSlow203: f32 = Mathf.round(_fcast(dx7_alg17_fHslider79));
        const fSlow204: f32 = Mathf.round(_fcast(dx7_alg17_fHslider80));
        const fSlow205: f32 = Mathf.round(_fcast(dx7_alg17_fHslider81));
        const fSlow206: f32 = Mathf.round(_fcast(dx7_alg17_fHslider82));
        const iSlow207: i32 = iSlow187 > 0;
        const iSlow208: i32 = min<i32>(63, ((41 * _icast(fSlow189)) >> 6) + iSlow192);
        const iSlow209: i32 = _icast(this.fConst1 * _fcast(((iSlow208 & 3) + 4) << ((iSlow208 >> 2) + 2)));
        const iSlow210: i32 = min<i32>(63, ((41 * _icast(fSlow200)) >> 6) + iSlow192);
        const iSlow211: i32 = _icast(this.fConst1 * _fcast(((iSlow210 & 3) + 4) << ((iSlow210 >> 2) + 2)));
        const iSlow212: i32 = Dx7_alg17_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg17_fHslider83))))];
        const iSlow213: i32 = iSlow212 != 0;
        const fSlow214: f32 = _fcast(iSlow212);
        const iSlow215: i32 = _icast(Mathf.round(_fcast(this.fCheckbox2)));
        const fSlow216: f32 = Mathf.round(_fcast(dx7_alg17_fHslider84));
        const iSlow217: i32 = _icast(Mathf.round(_fcast(dx7_alg17_fHslider85)));
        const fSlow218: f32 = Mathf.round(_fcast(dx7_alg17_fHslider86));
        const fSlow219: f32 = ((iSlow215) ? _fcast(_icast(4458616.0 * (fSlow218 + _fcast(100 * (iSlow217 & 3)))) >> 3) + ((fSlow216 > 0.0 ? 1 : 0) ? 13457.0 * fSlow216 : 0.0) : fSlow108 * (72267.445 * fSlow216 * fSlow110 + 24204406.0) + _fcast(Dx7_alg17_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow217 & 31)))]) + _fcast(((_icast(fSlow218)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow218 + 1.0) + 0.5)) : 0)));
        const fSlow220: f32 = Mathf.round(_fcast(dx7_alg17_fHslider87));
        const fSlow221: f32 = Mathf.round(_fcast(dx7_alg17_fHslider88));
        const fSlow222: f32 = Mathf.round(_fcast(dx7_alg17_fHslider89));
        const fSlow223: f32 = Mathf.round(_fcast(dx7_alg17_fEntry9));
        const fSlow224: f32 = Mathf.round(_fcast(dx7_alg17_fHslider90));
        const fSlow225: f32 = fSlow4 + (-18.0 - fSlow222);
        const iSlow226: i32 = (((fSlow223 == 0.0 ? 1 : 0) | (fSlow223 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow224 * fSlow225)) >> 12 : _icast(329.0 * fSlow224 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow225))), 32))])) >> 15);
        const fSlow227: f32 = Mathf.round(_fcast(dx7_alg17_fEntry10));
        const fSlow228: f32 = Mathf.round(_fcast(dx7_alg17_fHslider91));
        const fSlow229: f32 = fSlow4 + (-16.0 - fSlow222);
        const iSlow230: i32 = (((fSlow227 == 0.0 ? 1 : 0) | (fSlow227 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow228 * fSlow229) >> 12 : _icast(329.0 * fSlow228 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow229)), 32))])) >> 15);
        const fSlow231: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow221 >= 2e+01 ? 1 : 0) ? fSlow221 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow221)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow222)) >= 0.0) ? ((fSlow227 < 2.0 ? 1 : 0) ? -iSlow230 : iSlow230) : ((fSlow223 < 2.0 ? 1 : 0) ? -iSlow226 : iSlow226)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg17_fHslider92)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow232: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow220 >= 2e+01 ? 1 : 0) ? fSlow220 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow220)), 19))]))) >> 1) << 6) + fSlow231 + -4256.0)) << 16;
        const iSlow233: i32 = fSlow220 == 0.0;
        const fSlow234: f32 = Mathf.round(_fcast(dx7_alg17_fHslider93));
        const fSlow235: f32 = Mathf.round(_fcast(dx7_alg17_fHslider94));
        const iSlow236: i32 = _icast(fSlow235 * fSlow25) >> 3;
        const iSlow237: i32 = (((fSlow235 == 3.0 ? 1 : 0) & iSlow22) ? iSlow236 + -1 : ((((fSlow235 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow236 + 1 : iSlow236));
        const fSlow238: f32 = _fcast(iSlow237);
        const fSlow239: f32 = Mathf.min(fSlow234 + fSlow238, 99.0);
        const iSlow240: i32 = fSlow239 < 77.0;
        const fSlow241: f32 = ((iSlow240) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow239)), 76))]) : 2e+01 * (99.0 - fSlow239));
        const iSlow242: i32 = (((iSlow232 == 0 ? 1 : 0) | iSlow233) ? _icast(this.fConst1 * ((iSlow240 & iSlow233) ? 0.05 * fSlow241 : fSlow241)) : 0);
        const fSlow243: f32 = Mathf.round(_fcast(dx7_alg17_fHslider95));
        const iSlow244: i32 = _icast(Mathf.max(16.0, fSlow231 + _fcast((_icast(((fSlow243 >= 2e+01 ? 1 : 0) ? fSlow243 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow243)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow245: f32 = Mathf.round(_fcast(dx7_alg17_fHslider96));
        const fSlow246: f32 = Mathf.min(fSlow245 + fSlow238, 99.0);
        const iSlow247: i32 = _icast(this.fConst1 * ((fSlow246 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow246)), 76))]) : 2e+01 * (99.0 - fSlow246)));
        const fSlow248: f32 = Mathf.round(_fcast(dx7_alg17_fHslider97));
        const fSlow249: f32 = Mathf.round(_fcast(dx7_alg17_fHslider98));
        const fSlow250: f32 = Mathf.round(_fcast(dx7_alg17_fHslider99));
        const fSlow251: f32 = Mathf.round(_fcast(dx7_alg17_fHslider100));
        const iSlow252: i32 = iSlow232 > 0;
        const iSlow253: i32 = min<i32>(63, ((41 * _icast(fSlow234)) >> 6) + iSlow237);
        const iSlow254: i32 = _icast(this.fConst1 * _fcast(((iSlow253 & 3) + 4) << ((iSlow253 >> 2) + 2)));
        const iSlow255: i32 = min<i32>(63, ((41 * _icast(fSlow245)) >> 6) + iSlow237);
        const iSlow256: i32 = _icast(this.fConst1 * _fcast(((iSlow255 & 3) + 4) << ((iSlow255 >> 2) + 2)));
        const iSlow257: i32 = Dx7_alg17_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg17_fHslider101))))];
        const iSlow258: i32 = iSlow257 != 0;
        const fSlow259: f32 = _fcast(iSlow257);
        const iSlow260: i32 = _icast(Mathf.round(_fcast(this.fCheckbox3)));
        const fSlow261: f32 = Mathf.round(_fcast(dx7_alg17_fHslider102));
        const iSlow262: i32 = _icast(Mathf.round(_fcast(dx7_alg17_fHslider103)));
        const fSlow263: f32 = Mathf.round(_fcast(dx7_alg17_fHslider104));
        const fSlow264: f32 = ((iSlow260) ? _fcast(_icast(4458616.0 * (fSlow263 + _fcast(100 * (iSlow262 & 3)))) >> 3) + ((fSlow261 > 0.0 ? 1 : 0) ? 13457.0 * fSlow261 : 0.0) : fSlow108 * (72267.445 * fSlow261 * fSlow110 + 24204406.0) + _fcast(Dx7_alg17_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow262 & 31)))]) + _fcast(((_icast(fSlow263)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow263 + 1.0) + 0.5)) : 0)));
        const iSlow265: i32 = _icast(Mathf.round(_fcast(this.fCheckbox4)));
        const fSlow266: f32 = Mathf.round(_fcast(dx7_alg17_fHslider105));
        const iSlow267: i32 = _icast(Mathf.round(_fcast(dx7_alg17_fHslider106)));
        const fSlow268: f32 = Mathf.round(_fcast(dx7_alg17_fHslider107));
        const fSlow269: f32 = ((iSlow265) ? _fcast(_icast(4458616.0 * (fSlow268 + _fcast(100 * (iSlow267 & 3)))) >> 3) + ((fSlow266 > 0.0 ? 1 : 0) ? 13457.0 * fSlow266 : 0.0) : fSlow108 * (72267.445 * fSlow266 * fSlow110 + 24204406.0) + _fcast(Dx7_alg17_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow267 & 31)))]) + _fcast(((_icast(fSlow268)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow268 + 1.0) + 0.5)) : 0)));
        const fSlow270: f32 = Mathf.round(_fcast(dx7_alg17_fHslider108));
        const fSlow271: f32 = Mathf.round(_fcast(dx7_alg17_fHslider109));
        const fSlow272: f32 = Mathf.round(_fcast(dx7_alg17_fHslider110));
        const fSlow273: f32 = Mathf.round(_fcast(dx7_alg17_fEntry11));
        const fSlow274: f32 = Mathf.round(_fcast(dx7_alg17_fHslider111));
        const fSlow275: f32 = fSlow4 + (-18.0 - fSlow272);
        const iSlow276: i32 = (((fSlow273 == 0.0 ? 1 : 0) | (fSlow273 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow274 * fSlow275)) >> 12 : _icast(329.0 * fSlow274 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow275))), 32))])) >> 15);
        const fSlow277: f32 = Mathf.round(_fcast(dx7_alg17_fEntry12));
        const fSlow278: f32 = Mathf.round(_fcast(dx7_alg17_fHslider112));
        const fSlow279: f32 = fSlow4 + (-16.0 - fSlow272);
        const iSlow280: i32 = (((fSlow277 == 0.0 ? 1 : 0) | (fSlow277 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow278 * fSlow279) >> 12 : _icast(329.0 * fSlow278 * _fcast(Dx7_alg17_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow279)), 32))])) >> 15);
        const fSlow281: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow271 >= 2e+01 ? 1 : 0) ? fSlow271 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow271)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow272)) >= 0.0) ? ((fSlow277 < 2.0 ? 1 : 0) ? -iSlow280 : iSlow280) : ((fSlow273 < 2.0 ? 1 : 0) ? -iSlow276 : iSlow276)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg17_fHslider113)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow282: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow270 >= 2e+01 ? 1 : 0) ? fSlow270 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow270)), 19))]))) >> 1) << 6) + fSlow281 + -4256.0)) << 16;
        const iSlow283: i32 = fSlow270 == 0.0;
        const fSlow284: f32 = Mathf.round(_fcast(dx7_alg17_fHslider114));
        const fSlow285: f32 = Mathf.round(_fcast(dx7_alg17_fHslider115));
        const iSlow286: i32 = _icast(fSlow285 * fSlow25) >> 3;
        const iSlow287: i32 = (((fSlow285 == 3.0 ? 1 : 0) & iSlow22) ? iSlow286 + -1 : ((((fSlow285 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow286 + 1 : iSlow286));
        const fSlow288: f32 = _fcast(iSlow287);
        const fSlow289: f32 = Mathf.min(fSlow284 + fSlow288, 99.0);
        const iSlow290: i32 = fSlow289 < 77.0;
        const fSlow291: f32 = ((iSlow290) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow289)), 76))]) : 2e+01 * (99.0 - fSlow289));
        const iSlow292: i32 = (((iSlow282 == 0 ? 1 : 0) | iSlow283) ? _icast(this.fConst1 * ((iSlow290 & iSlow283) ? 0.05 * fSlow291 : fSlow291)) : 0);
        const fSlow293: f32 = Mathf.round(_fcast(dx7_alg17_fHslider116));
        const iSlow294: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fSlow293 >= 2e+01 ? 1 : 0) ? fSlow293 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow293)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow295: f32 = Mathf.round(_fcast(dx7_alg17_fHslider117));
        const fSlow296: f32 = Mathf.min(fSlow295 + fSlow288, 99.0);
        const iSlow297: i32 = _icast(this.fConst1 * ((fSlow296 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow296)), 76))]) : 2e+01 * (99.0 - fSlow296)));
        const fSlow298: f32 = Mathf.round(_fcast(dx7_alg17_fHslider118));
        const fSlow299: f32 = Mathf.round(_fcast(dx7_alg17_fHslider119));
        const fSlow300: f32 = Mathf.round(_fcast(dx7_alg17_fHslider120));
        const fSlow301: f32 = Mathf.round(_fcast(dx7_alg17_fHslider121));
        const iSlow302: i32 = iSlow282 > 0;
        const iSlow303: i32 = min<i32>(63, ((41 * _icast(fSlow284)) >> 6) + iSlow287);
        const iSlow304: i32 = _icast(this.fConst1 * _fcast(((iSlow303 & 3) + 4) << ((iSlow303 >> 2) + 2)));
        const iSlow305: i32 = min<i32>(63, ((41 * _icast(fSlow295)) >> 6) + iSlow287);
        const iSlow306: i32 = _icast(this.fConst1 * _fcast(((iSlow305 & 3) + 4) << ((iSlow305 >> 2) + 2)));
        const iSlow307: i32 = Dx7_alg17_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg17_fHslider122))))];
        const iSlow308: i32 = iSlow307 != 0;
        const fSlow309: f32 = _fcast(iSlow307);
        const iSlow310: i32 = _icast(Mathf.round(_fcast(this.fCheckbox5)));
        const fSlow311: f32 = Mathf.round(_fcast(dx7_alg17_fHslider123));
        const iSlow312: i32 = _icast(Mathf.round(_fcast(dx7_alg17_fHslider124)));
        const fSlow313: f32 = Mathf.round(_fcast(dx7_alg17_fHslider125));
        const fSlow314: f32 = ((iSlow310) ? _fcast(_icast(4458616.0 * (fSlow313 + _fcast(100 * (iSlow312 & 3)))) >> 3) + ((fSlow311 > 0.0 ? 1 : 0) ? 13457.0 * fSlow311 : 0.0) : fSlow108 * (72267.445 * fSlow311 * fSlow110 + 24204406.0) + _fcast(Dx7_alg17_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow312 & 31)))]) + _fcast(((_icast(fSlow313)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow313 + 1.0) + 0.5)) : 0)));
        const fSlow315: f32 = Mathf.round(_fcast(dx7_alg17_fHslider126));
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
        const iTemp17: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp16 >= 2e+01 ? 1 : 0) ? fTemp16 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp16)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp18: i32 = iTemp8 == 0;
        const iTemp19: i32 = fTemp16 == 0.0;
        const fTemp20: f32 = ((iTemp13) ? ((iTemp15) ? fSlow35 : fSlow41) : ((iTemp14) ? fSlow40 : fSlow18));
        const fTemp21: f32 = Mathf.min(fSlow28 + fTemp20, 99.0);
        const iTemp22: i32 = fTemp21 < 77.0;
        const fTemp23: f32 = ((iTemp22) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp21)), 76))]) : 2e+01 * (99.0 - fTemp21));
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
        const iTemp46: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp45 >= 2e+01 ? 1 : 0) ? fTemp45 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp45)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp56: f32 = ((iTemp55) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp54)), 76))]) : 2e+01 * (99.0 - fTemp54));
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
        const iTemp70: i32 = ((iTemp2) ? 0 : this.iRec12[1]);
        const iTemp71: i32 = ((iTemp0) ? ((iSlow90 == iTemp70 ? 1 : 0) ? iSlow93 : 0) : ((iTemp2) ? iSlow88 : this.iRec18[1]));
        const iTemp72: i32 = iTemp71 != 0;
        const iTemp73: i32 = (iTemp72 & (iTemp71 <= 1 ? 1 : 0)) >= 1;
        const iTemp74: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec13[1]));
        const iTemp75: i32 = iTemp74 + 1;
        const iTemp76: i32 = ((iTemp73) ? iTemp75 : iTemp74);
        const iTemp77: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec17[1]));
        const iTemp78: i32 = ((iTemp76 < 3 ? 1 : 0) | ((iTemp76 < 4 ? 1 : 0) & (iTemp77 ^ -1))) >= 1;
        const iTemp79: i32 = (iTemp75 < 4 ? 1 : 0) >= 1;
        const iTemp80: i32 = iTemp75 >= 2;
        const iTemp81: i32 = iTemp75 >= 1;
        const iTemp82: i32 = iTemp75 >= 3;
        const fTemp83: f32 = ((iTemp80) ? ((iTemp82) ? fSlow89 : fSlow95) : ((iTemp81) ? fSlow94 : fSlow66));
        const iTemp84: i32 = _icast(Mathf.max(16.0, fSlow77 + _fcast((_icast(((fTemp83 >= 2e+01 ? 1 : 0) ? fTemp83 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp83)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp85: i32 = iTemp75 == 0;
        const iTemp86: i32 = fTemp83 == 0.0;
        const fTemp87: f32 = ((iTemp80) ? ((iTemp82) ? fSlow91 : fSlow97) : ((iTemp81) ? fSlow96 : fSlow80));
        const fTemp88: f32 = Mathf.min(fSlow84 + fTemp87, 99.0);
        const iTemp89: i32 = fTemp88 < 77.0;
        const fTemp90: f32 = ((iTemp89) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp88)), 76))]) : 2e+01 * (99.0 - fTemp88));
        const iTemp91: i32 = ((iTemp73) ? ((iTemp79) ? (((iTemp84 == iTemp70 ? 1 : 0) | (iTemp85 & iTemp86)) ? _icast(this.fConst1 * (((iTemp89 & iTemp85) & iTemp86) ? 0.05 * fTemp90 : fTemp90)) : 0) : 0) : iTemp71 - ((iTemp72) ? 1 : 0));
        const iTemp92: i32 = ((iTemp0) ? iSlow90 > iTemp70 : ((iTemp2) ? iSlow98 : this.iRec15[1]));
        const iTemp93: i32 = ((iTemp73) ? ((iTemp79) ? iTemp84 > iTemp70 : iTemp92) : iTemp92);
        const iTemp94: i32 = (iTemp91 == 0 ? 1 : 0) * ((iTemp93 == 0 ? 1 : 0) + 1);
        const iTemp95: i32 = iTemp94 >= 2;
        const iTemp96: i32 = iTemp94 >= 1;
        const iTemp97: i32 = max<i32>(112459776, iTemp70);
        const iTemp98: i32 = ((iTemp0) ? iSlow102 : ((iTemp2) ? iSlow100 : this.iRec16[1]));
        const iTemp99: i32 = min<i32>(63, iSlow83 + ((41 * _icast(fTemp87)) >> 6));
        const iTemp100: i32 = ((iTemp73) ? ((iTemp79) ? _icast(this.fConst1 * _fcast(((iTemp99 & 3) + 4) << ((iTemp99 >> 2) + 2))) : iTemp98) : iTemp98);
        const iTemp101: i32 = iTemp97 + ((285212672 - iTemp97) >> 24) * iTemp100;
        const iTemp102: i32 = ((iTemp0) ? iSlow90 : ((iTemp2) ? iSlow78 : this.iRec14[1]));
        const iTemp103: i32 = ((iTemp73) ? ((iTemp79) ? iTemp84 : iTemp102) : iTemp102);
        const iTemp104: i32 = (iTemp101 >= iTemp103 ? 1 : 0) >= 1;
        const iTemp105: i32 = iTemp70 - iTemp100;
        const iTemp106: i32 = (iTemp105 <= iTemp103 ? 1 : 0) >= 1;
        this.iRec12[0] = ((iTemp78) ? ((iTemp95) ? ((iTemp106) ? iTemp103 : iTemp105) : ((iTemp96) ? ((iTemp104) ? iTemp103 : iTemp101) : iTemp70)) : iTemp70);
        const iTemp107: i32 = iTemp76 + 1;
        this.iRec13[0] = ((iTemp78) ? ((iTemp95) ? ((iTemp106) ? iTemp107 : iTemp76) : ((iTemp96) ? ((iTemp104) ? iTemp107 : iTemp76) : iTemp76)) : iTemp76);
        const iTemp108: i32 = (iTemp107 < 4 ? 1 : 0) >= 1;
        const iTemp109: i32 = iTemp107 >= 2;
        const iTemp110: i32 = iTemp107 >= 1;
        const iTemp111: i32 = iTemp107 >= 3;
        const fTemp112: f32 = ((iTemp109) ? ((iTemp111) ? fSlow89 : fSlow95) : ((iTemp110) ? fSlow94 : fSlow66));
        const iTemp113: i32 = _icast(Mathf.max(16.0, fSlow77 + _fcast((_icast(((fTemp112 >= 2e+01 ? 1 : 0) ? fTemp112 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp112)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp114: i32 = ((iTemp108) ? iTemp113 : iTemp103);
        this.iRec14[0] = ((iTemp78) ? ((iTemp95) ? ((iTemp106) ? iTemp114 : iTemp103) : ((iTemp96) ? ((iTemp104) ? iTemp114 : iTemp103) : iTemp103)) : iTemp103);
        const iTemp115: i32 = ((iTemp108) ? iTemp113 > iTemp103 : iTemp93);
        this.iRec15[0] = ((iTemp78) ? ((iTemp95) ? ((iTemp106) ? iTemp115 : iTemp93) : ((iTemp96) ? ((iTemp104) ? iTemp115 : iTemp93) : iTemp93)) : iTemp93);
        const fTemp116: f32 = ((iTemp109) ? ((iTemp111) ? fSlow91 : fSlow97) : ((iTemp110) ? fSlow96 : fSlow80));
        const iTemp117: i32 = min<i32>(63, iSlow83 + ((41 * _icast(fTemp116)) >> 6));
        const iTemp118: i32 = ((iTemp108) ? _icast(this.fConst1 * _fcast(((iTemp117 & 3) + 4) << ((iTemp117 >> 2) + 2))) : iTemp100);
        this.iRec16[0] = ((iTemp78) ? ((iTemp95) ? ((iTemp106) ? iTemp118 : iTemp100) : ((iTemp96) ? ((iTemp104) ? iTemp118 : iTemp100) : iTemp100)) : iTemp100);
        this.iRec17[0] = iTemp77;
        const iTemp119: i32 = iTemp107 == 0;
        const iTemp120: i32 = fTemp112 == 0.0;
        const fTemp121: f32 = Mathf.min(fSlow84 + fTemp116, 99.0);
        const iTemp122: i32 = fTemp121 < 77.0;
        const fTemp123: f32 = ((iTemp122) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp121)), 76))]) : 2e+01 * (99.0 - fTemp121));
        const iTemp124: i32 = ((iTemp108) ? (((iTemp113 == iTemp103 ? 1 : 0) | (iTemp119 & iTemp120)) ? _icast(this.fConst1 * (((iTemp122 & iTemp119) & iTemp120) ? 0.05 * fTemp123 : fTemp123)) : 0) : iTemp91);
        this.iRec18[0] = ((iTemp78) ? ((iTemp95) ? ((iTemp106) ? iTemp124 : iTemp91) : ((iTemp96) ? ((iTemp104) ? iTemp124 : iTemp91) : iTemp91)) : iTemp91);
        const iTemp125: i32 = iSlow106 & iTemp1;
        const iTemp126: i32 = ((iTemp2) ? 0 : ((iTemp0) ? 3 : this.iRec21[1]));
        const iTemp127: i32 = ((iTemp2) ? 1 : ((iTemp0) ? 0 : this.iRec25[1]));
        const iTemp128: i32 = ((iTemp126 < 3 ? 1 : 0) | ((iTemp126 < 4 ? 1 : 0) & (1 - iTemp127))) >= 1;
        const fTemp129: f32 = ((iTemp2) ? fSlow116 : this.fRec20[1]);
        const iTemp130: i32 = ((iTemp2) ? iSlow119 : ((iTemp0) ? fSlow116 > this.fRec20[1] : this.iRec23[1]));
        const iTemp131: i32 = iTemp130 >= 1;
        const fTemp132: f32 = ((iTemp2) ? fSlow123 : ((iTemp0) ? fSlow121 : this.fRec24[1]));
        const fTemp133: f32 = fTemp129 - fTemp132;
        const iTemp134: i32 = ((iTemp2) ? iSlow118 : ((iTemp0) ? iSlow115 : this.iRec22[1]));
        const fTemp135: f32 = _fcast(iTemp134);
        const iTemp136: i32 = (fTemp133 <= fTemp135 ? 1 : 0) >= 1;
        const fTemp137: f32 = fTemp129 + fTemp132;
        const iTemp138: i32 = (fTemp137 >= fTemp135 ? 1 : 0) >= 1;
        this.fRec20[0] = ((iTemp128) ? ((iTemp131) ? ((iTemp138) ? fTemp135 : fTemp137) : ((iTemp136) ? fTemp135 : fTemp133)) : fTemp129);
        const iTemp139: i32 = iTemp126 + 1;
        this.iRec21[0] = ((iTemp128) ? ((iTemp131) ? ((iTemp138) ? iTemp139 : iTemp126) : ((iTemp136) ? iTemp139 : iTemp126)) : iTemp126);
        const iTemp140: i32 = (iTemp139 < 4 ? 1 : 0) >= 1;
        const iTemp141: i32 = iTemp139 >= 2;
        const iTemp142: i32 = iTemp139 >= 1;
        const iTemp143: i32 = iTemp139 >= 3;
        const iTemp144: i32 = Dx7_alg17_itbl6SIG6[_icast(Mathf.round(((iTemp141) ? ((iTemp143) ? fSlow114 : fSlow125) : ((iTemp142) ? fSlow124 : fSlow117))))];
        const iTemp145: i32 = ((iTemp140) ? iTemp144 : iTemp134);
        this.iRec22[0] = ((iTemp128) ? ((iTemp131) ? ((iTemp138) ? iTemp145 : iTemp134) : ((iTemp136) ? iTemp145 : iTemp134)) : iTemp134);
        const iTemp146: i32 = ((iTemp140) ? iTemp144 > iTemp134 : iTemp130);
        this.iRec23[0] = ((iTemp128) ? ((iTemp131) ? ((iTemp138) ? iTemp146 : iTemp130) : ((iTemp136) ? iTemp146 : iTemp130)) : iTemp130);
        const fTemp147: f32 = ((iTemp140) ? this.fConst4 * _fcast(Dx7_alg17_itbl7SIG7[_icast(Mathf.round(((iTemp141) ? ((iTemp143) ? fSlow120 : fSlow127) : ((iTemp142) ? fSlow126 : fSlow122))))]) : fTemp132);
        this.fRec24[0] = ((iTemp128) ? ((iTemp131) ? ((iTemp138) ? fTemp147 : fTemp132) : ((iTemp136) ? fTemp147 : fTemp132)) : fTemp132);
        this.iRec25[0] = iTemp127;
        const fTemp148: f32 = fRec10 + -0.5;
        const fTemp149: f32 = 524288.0 * this.fRec20[0] + 16777216.0 * Mathf.abs(fSlow128 * fRec11 * fSlow129 * fTemp148) * (((0.00390625 * fSlow129 * fTemp148) < 0.0) ? -1.0 : 1.0);
        const fTemp150: f32 = ((iTemp125) ? 0.0 : this.fRec19[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow113 + ((iSlow107) ? 0.0 : fTemp149))));
        this.fRec19[0] = fTemp150 - Mathf.floor(fTemp150);
        const iTemp151: i32 = ((iTemp2) ? 0 : this.iRec26[1]);
        const iTemp152: i32 = ((iTemp0) ? ((iSlow154 == iTemp151 ? 1 : 0) ? iSlow157 : 0) : ((iTemp2) ? iSlow152 : this.iRec32[1]));
        const iTemp153: i32 = iTemp152 != 0;
        const iTemp154: i32 = (iTemp153 & (iTemp152 <= 1 ? 1 : 0)) >= 1;
        const iTemp155: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec27[1]));
        const iTemp156: i32 = iTemp155 + 1;
        const iTemp157: i32 = ((iTemp154) ? iTemp156 : iTemp155);
        const iTemp158: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec31[1]));
        const iTemp159: i32 = ((iTemp157 < 3 ? 1 : 0) | ((iTemp157 < 4 ? 1 : 0) & (iTemp158 ^ -1))) >= 1;
        const iTemp160: i32 = (iTemp156 < 4 ? 1 : 0) >= 1;
        const iTemp161: i32 = iTemp156 >= 2;
        const iTemp162: i32 = iTemp156 >= 1;
        const iTemp163: i32 = iTemp156 >= 3;
        const fTemp164: f32 = ((iTemp161) ? ((iTemp163) ? fSlow153 : fSlow159) : ((iTemp162) ? fSlow158 : fSlow130));
        const iTemp165: i32 = _icast(Mathf.max(16.0, fSlow141 + _fcast((_icast(((fTemp164 >= 2e+01 ? 1 : 0) ? fTemp164 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp164)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp166: i32 = iTemp156 == 0;
        const iTemp167: i32 = fTemp164 == 0.0;
        const fTemp168: f32 = ((iTemp161) ? ((iTemp163) ? fSlow155 : fSlow161) : ((iTemp162) ? fSlow160 : fSlow144));
        const fTemp169: f32 = Mathf.min(fSlow148 + fTemp168, 99.0);
        const iTemp170: i32 = fTemp169 < 77.0;
        const fTemp171: f32 = ((iTemp170) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp169)), 76))]) : 2e+01 * (99.0 - fTemp169));
        const iTemp172: i32 = ((iTemp154) ? ((iTemp160) ? (((iTemp165 == iTemp151 ? 1 : 0) | (iTemp166 & iTemp167)) ? _icast(this.fConst1 * (((iTemp170 & iTemp166) & iTemp167) ? 0.05 * fTemp171 : fTemp171)) : 0) : 0) : iTemp152 - ((iTemp153) ? 1 : 0));
        const iTemp173: i32 = ((iTemp0) ? iSlow154 > iTemp151 : ((iTemp2) ? iSlow162 : this.iRec29[1]));
        const iTemp174: i32 = ((iTemp154) ? ((iTemp160) ? iTemp165 > iTemp151 : iTemp173) : iTemp173);
        const iTemp175: i32 = (iTemp172 == 0 ? 1 : 0) * ((iTemp174 == 0 ? 1 : 0) + 1);
        const iTemp176: i32 = iTemp175 >= 2;
        const iTemp177: i32 = iTemp175 >= 1;
        const iTemp178: i32 = max<i32>(112459776, iTemp151);
        const iTemp179: i32 = ((iTemp0) ? iSlow166 : ((iTemp2) ? iSlow164 : this.iRec30[1]));
        const iTemp180: i32 = min<i32>(63, iSlow147 + ((41 * _icast(fTemp168)) >> 6));
        const iTemp181: i32 = ((iTemp154) ? ((iTemp160) ? _icast(this.fConst1 * _fcast(((iTemp180 & 3) + 4) << ((iTemp180 >> 2) + 2))) : iTemp179) : iTemp179);
        const iTemp182: i32 = iTemp178 + ((285212672 - iTemp178) >> 24) * iTemp181;
        const iTemp183: i32 = ((iTemp0) ? iSlow154 : ((iTemp2) ? iSlow142 : this.iRec28[1]));
        const iTemp184: i32 = ((iTemp154) ? ((iTemp160) ? iTemp165 : iTemp183) : iTemp183);
        const iTemp185: i32 = (iTemp182 >= iTemp184 ? 1 : 0) >= 1;
        const iTemp186: i32 = iTemp151 - iTemp181;
        const iTemp187: i32 = (iTemp186 <= iTemp184 ? 1 : 0) >= 1;
        this.iRec26[0] = ((iTemp159) ? ((iTemp176) ? ((iTemp187) ? iTemp184 : iTemp186) : ((iTemp177) ? ((iTemp185) ? iTemp184 : iTemp182) : iTemp151)) : iTemp151);
        const iTemp188: i32 = iTemp157 + 1;
        this.iRec27[0] = ((iTemp159) ? ((iTemp176) ? ((iTemp187) ? iTemp188 : iTemp157) : ((iTemp177) ? ((iTemp185) ? iTemp188 : iTemp157) : iTemp157)) : iTemp157);
        const iTemp189: i32 = (iTemp188 < 4 ? 1 : 0) >= 1;
        const iTemp190: i32 = iTemp188 >= 2;
        const iTemp191: i32 = iTemp188 >= 1;
        const iTemp192: i32 = iTemp188 >= 3;
        const fTemp193: f32 = ((iTemp190) ? ((iTemp192) ? fSlow153 : fSlow159) : ((iTemp191) ? fSlow158 : fSlow130));
        const iTemp194: i32 = _icast(Mathf.max(16.0, fSlow141 + _fcast((_icast(((fTemp193 >= 2e+01 ? 1 : 0) ? fTemp193 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp193)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp195: i32 = ((iTemp189) ? iTemp194 : iTemp184);
        this.iRec28[0] = ((iTemp159) ? ((iTemp176) ? ((iTemp187) ? iTemp195 : iTemp184) : ((iTemp177) ? ((iTemp185) ? iTemp195 : iTemp184) : iTemp184)) : iTemp184);
        const iTemp196: i32 = ((iTemp189) ? iTemp194 > iTemp184 : iTemp174);
        this.iRec29[0] = ((iTemp159) ? ((iTemp176) ? ((iTemp187) ? iTemp196 : iTemp174) : ((iTemp177) ? ((iTemp185) ? iTemp196 : iTemp174) : iTemp174)) : iTemp174);
        const fTemp197: f32 = ((iTemp190) ? ((iTemp192) ? fSlow155 : fSlow161) : ((iTemp191) ? fSlow160 : fSlow144));
        const iTemp198: i32 = min<i32>(63, iSlow147 + ((41 * _icast(fTemp197)) >> 6));
        const iTemp199: i32 = ((iTemp189) ? _icast(this.fConst1 * _fcast(((iTemp198 & 3) + 4) << ((iTemp198 >> 2) + 2))) : iTemp181);
        this.iRec30[0] = ((iTemp159) ? ((iTemp176) ? ((iTemp187) ? iTemp199 : iTemp181) : ((iTemp177) ? ((iTemp185) ? iTemp199 : iTemp181) : iTemp181)) : iTemp181);
        this.iRec31[0] = iTemp158;
        const iTemp200: i32 = iTemp188 == 0;
        const iTemp201: i32 = fTemp193 == 0.0;
        const fTemp202: f32 = Mathf.min(fSlow148 + fTemp197, 99.0);
        const iTemp203: i32 = fTemp202 < 77.0;
        const fTemp204: f32 = ((iTemp203) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp202)), 76))]) : 2e+01 * (99.0 - fTemp202));
        const iTemp205: i32 = ((iTemp189) ? (((iTemp194 == iTemp184 ? 1 : 0) | (iTemp200 & iTemp201)) ? _icast(this.fConst1 * (((iTemp203 & iTemp200) & iTemp201) ? 0.05 * fTemp204 : fTemp204)) : 0) : iTemp172);
        this.iRec32[0] = ((iTemp159) ? ((iTemp176) ? ((iTemp187) ? iTemp205 : iTemp172) : ((iTemp177) ? ((iTemp185) ? iTemp205 : iTemp172) : iTemp172)) : iTemp172);
        const fTemp206: f32 = ((iTemp125) ? 0.0 : this.fRec33[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow174 + ((iSlow170) ? 0.0 : fTemp149))));
        this.fRec33[0] = fTemp206 - Mathf.floor(fTemp206);
        const iTemp207: i32 = ((iTemp2) ? 0 : this.iRec34[1]);
        const iTemp208: i32 = ((iTemp0) ? ((iSlow199 == iTemp207 ? 1 : 0) ? iSlow202 : 0) : ((iTemp2) ? iSlow197 : this.iRec40[1]));
        const iTemp209: i32 = iTemp208 != 0;
        const iTemp210: i32 = (iTemp209 & (iTemp208 <= 1 ? 1 : 0)) >= 1;
        const iTemp211: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec35[1]));
        const iTemp212: i32 = iTemp211 + 1;
        const iTemp213: i32 = ((iTemp210) ? iTemp212 : iTemp211);
        const iTemp214: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec39[1]));
        const iTemp215: i32 = ((iTemp213 < 3 ? 1 : 0) | ((iTemp213 < 4 ? 1 : 0) & (iTemp214 ^ -1))) >= 1;
        const iTemp216: i32 = (iTemp212 < 4 ? 1 : 0) >= 1;
        const iTemp217: i32 = iTemp212 >= 2;
        const iTemp218: i32 = iTemp212 >= 1;
        const iTemp219: i32 = iTemp212 >= 3;
        const fTemp220: f32 = ((iTemp217) ? ((iTemp219) ? fSlow198 : fSlow204) : ((iTemp218) ? fSlow203 : fSlow175));
        const iTemp221: i32 = _icast(Mathf.max(16.0, fSlow186 + _fcast((_icast(((fTemp220 >= 2e+01 ? 1 : 0) ? fTemp220 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp220)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp222: i32 = iTemp212 == 0;
        const iTemp223: i32 = fTemp220 == 0.0;
        const fTemp224: f32 = ((iTemp217) ? ((iTemp219) ? fSlow200 : fSlow206) : ((iTemp218) ? fSlow205 : fSlow189));
        const fTemp225: f32 = Mathf.min(fSlow193 + fTemp224, 99.0);
        const iTemp226: i32 = fTemp225 < 77.0;
        const fTemp227: f32 = ((iTemp226) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp225)), 76))]) : 2e+01 * (99.0 - fTemp225));
        const iTemp228: i32 = ((iTemp210) ? ((iTemp216) ? (((iTemp221 == iTemp207 ? 1 : 0) | (iTemp222 & iTemp223)) ? _icast(this.fConst1 * (((iTemp226 & iTemp222) & iTemp223) ? 0.05 * fTemp227 : fTemp227)) : 0) : 0) : iTemp208 - ((iTemp209) ? 1 : 0));
        const iTemp229: i32 = ((iTemp0) ? iSlow199 > iTemp207 : ((iTemp2) ? iSlow207 : this.iRec37[1]));
        const iTemp230: i32 = ((iTemp210) ? ((iTemp216) ? iTemp221 > iTemp207 : iTemp229) : iTemp229);
        const iTemp231: i32 = (iTemp228 == 0 ? 1 : 0) * ((iTemp230 == 0 ? 1 : 0) + 1);
        const iTemp232: i32 = iTemp231 >= 2;
        const iTemp233: i32 = iTemp231 >= 1;
        const iTemp234: i32 = max<i32>(112459776, iTemp207);
        const iTemp235: i32 = ((iTemp0) ? iSlow211 : ((iTemp2) ? iSlow209 : this.iRec38[1]));
        const iTemp236: i32 = min<i32>(63, iSlow192 + ((41 * _icast(fTemp224)) >> 6));
        const iTemp237: i32 = ((iTemp210) ? ((iTemp216) ? _icast(this.fConst1 * _fcast(((iTemp236 & 3) + 4) << ((iTemp236 >> 2) + 2))) : iTemp235) : iTemp235);
        const iTemp238: i32 = iTemp234 + ((285212672 - iTemp234) >> 24) * iTemp237;
        const iTemp239: i32 = ((iTemp0) ? iSlow199 : ((iTemp2) ? iSlow187 : this.iRec36[1]));
        const iTemp240: i32 = ((iTemp210) ? ((iTemp216) ? iTemp221 : iTemp239) : iTemp239);
        const iTemp241: i32 = (iTemp238 >= iTemp240 ? 1 : 0) >= 1;
        const iTemp242: i32 = iTemp207 - iTemp237;
        const iTemp243: i32 = (iTemp242 <= iTemp240 ? 1 : 0) >= 1;
        this.iRec34[0] = ((iTemp215) ? ((iTemp232) ? ((iTemp243) ? iTemp240 : iTemp242) : ((iTemp233) ? ((iTemp241) ? iTemp240 : iTemp238) : iTemp207)) : iTemp207);
        const iTemp244: i32 = iTemp213 + 1;
        this.iRec35[0] = ((iTemp215) ? ((iTemp232) ? ((iTemp243) ? iTemp244 : iTemp213) : ((iTemp233) ? ((iTemp241) ? iTemp244 : iTemp213) : iTemp213)) : iTemp213);
        const iTemp245: i32 = (iTemp244 < 4 ? 1 : 0) >= 1;
        const iTemp246: i32 = iTemp244 >= 2;
        const iTemp247: i32 = iTemp244 >= 1;
        const iTemp248: i32 = iTemp244 >= 3;
        const fTemp249: f32 = ((iTemp246) ? ((iTemp248) ? fSlow198 : fSlow204) : ((iTemp247) ? fSlow203 : fSlow175));
        const iTemp250: i32 = _icast(Mathf.max(16.0, fSlow186 + _fcast((_icast(((fTemp249 >= 2e+01 ? 1 : 0) ? fTemp249 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp249)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp251: i32 = ((iTemp245) ? iTemp250 : iTemp240);
        this.iRec36[0] = ((iTemp215) ? ((iTemp232) ? ((iTemp243) ? iTemp251 : iTemp240) : ((iTemp233) ? ((iTemp241) ? iTemp251 : iTemp240) : iTemp240)) : iTemp240);
        const iTemp252: i32 = ((iTemp245) ? iTemp250 > iTemp240 : iTemp230);
        this.iRec37[0] = ((iTemp215) ? ((iTemp232) ? ((iTemp243) ? iTemp252 : iTemp230) : ((iTemp233) ? ((iTemp241) ? iTemp252 : iTemp230) : iTemp230)) : iTemp230);
        const fTemp253: f32 = ((iTemp246) ? ((iTemp248) ? fSlow200 : fSlow206) : ((iTemp247) ? fSlow205 : fSlow189));
        const iTemp254: i32 = min<i32>(63, iSlow192 + ((41 * _icast(fTemp253)) >> 6));
        const iTemp255: i32 = ((iTemp245) ? _icast(this.fConst1 * _fcast(((iTemp254 & 3) + 4) << ((iTemp254 >> 2) + 2))) : iTemp237);
        this.iRec38[0] = ((iTemp215) ? ((iTemp232) ? ((iTemp243) ? iTemp255 : iTemp237) : ((iTemp233) ? ((iTemp241) ? iTemp255 : iTemp237) : iTemp237)) : iTemp237);
        this.iRec39[0] = iTemp214;
        const iTemp256: i32 = iTemp244 == 0;
        const iTemp257: i32 = fTemp249 == 0.0;
        const fTemp258: f32 = Mathf.min(fSlow193 + fTemp253, 99.0);
        const iTemp259: i32 = fTemp258 < 77.0;
        const fTemp260: f32 = ((iTemp259) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp258)), 76))]) : 2e+01 * (99.0 - fTemp258));
        const iTemp261: i32 = ((iTemp245) ? (((iTemp250 == iTemp240 ? 1 : 0) | (iTemp256 & iTemp257)) ? _icast(this.fConst1 * (((iTemp259 & iTemp256) & iTemp257) ? 0.05 * fTemp260 : fTemp260)) : 0) : iTemp228);
        this.iRec40[0] = ((iTemp215) ? ((iTemp232) ? ((iTemp243) ? iTemp261 : iTemp228) : ((iTemp233) ? ((iTemp241) ? iTemp261 : iTemp228) : iTemp228)) : iTemp228);
        const fTemp262: f32 = ((iTemp125) ? 0.0 : this.fRec41[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow219 + ((iSlow215) ? 0.0 : fTemp149))));
        this.fRec41[0] = fTemp262 - Mathf.floor(fTemp262);
        const iTemp263: i32 = ((iTemp2) ? 0 : this.iRec42[1]);
        const iTemp264: i32 = ((iTemp0) ? ((iSlow244 == iTemp263 ? 1 : 0) ? iSlow247 : 0) : ((iTemp2) ? iSlow242 : this.iRec48[1]));
        const iTemp265: i32 = iTemp264 != 0;
        const iTemp266: i32 = (iTemp265 & (iTemp264 <= 1 ? 1 : 0)) >= 1;
        const iTemp267: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec43[1]));
        const iTemp268: i32 = iTemp267 + 1;
        const iTemp269: i32 = ((iTemp266) ? iTemp268 : iTemp267);
        const iTemp270: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec47[1]));
        const iTemp271: i32 = ((iTemp269 < 3 ? 1 : 0) | ((iTemp269 < 4 ? 1 : 0) & (iTemp270 ^ -1))) >= 1;
        const iTemp272: i32 = (iTemp268 < 4 ? 1 : 0) >= 1;
        const iTemp273: i32 = iTemp268 >= 2;
        const iTemp274: i32 = iTemp268 >= 1;
        const iTemp275: i32 = iTemp268 >= 3;
        const fTemp276: f32 = ((iTemp273) ? ((iTemp275) ? fSlow243 : fSlow249) : ((iTemp274) ? fSlow248 : fSlow220));
        const iTemp277: i32 = _icast(Mathf.max(16.0, fSlow231 + _fcast((_icast(((fTemp276 >= 2e+01 ? 1 : 0) ? fTemp276 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp276)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp278: i32 = iTemp268 == 0;
        const iTemp279: i32 = fTemp276 == 0.0;
        const fTemp280: f32 = ((iTemp273) ? ((iTemp275) ? fSlow245 : fSlow251) : ((iTemp274) ? fSlow250 : fSlow234));
        const fTemp281: f32 = Mathf.min(fSlow238 + fTemp280, 99.0);
        const iTemp282: i32 = fTemp281 < 77.0;
        const fTemp283: f32 = ((iTemp282) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp281)), 76))]) : 2e+01 * (99.0 - fTemp281));
        const iTemp284: i32 = ((iTemp266) ? ((iTemp272) ? (((iTemp277 == iTemp263 ? 1 : 0) | (iTemp278 & iTemp279)) ? _icast(this.fConst1 * (((iTemp282 & iTemp278) & iTemp279) ? 0.05 * fTemp283 : fTemp283)) : 0) : 0) : iTemp264 - ((iTemp265) ? 1 : 0));
        const iTemp285: i32 = ((iTemp0) ? iSlow244 > iTemp263 : ((iTemp2) ? iSlow252 : this.iRec45[1]));
        const iTemp286: i32 = ((iTemp266) ? ((iTemp272) ? iTemp277 > iTemp263 : iTemp285) : iTemp285);
        const iTemp287: i32 = (iTemp284 == 0 ? 1 : 0) * ((iTemp286 == 0 ? 1 : 0) + 1);
        const iTemp288: i32 = iTemp287 >= 2;
        const iTemp289: i32 = iTemp287 >= 1;
        const iTemp290: i32 = max<i32>(112459776, iTemp263);
        const iTemp291: i32 = ((iTemp0) ? iSlow256 : ((iTemp2) ? iSlow254 : this.iRec46[1]));
        const iTemp292: i32 = min<i32>(63, iSlow237 + ((41 * _icast(fTemp280)) >> 6));
        const iTemp293: i32 = ((iTemp266) ? ((iTemp272) ? _icast(this.fConst1 * _fcast(((iTemp292 & 3) + 4) << ((iTemp292 >> 2) + 2))) : iTemp291) : iTemp291);
        const iTemp294: i32 = iTemp290 + ((285212672 - iTemp290) >> 24) * iTemp293;
        const iTemp295: i32 = ((iTemp0) ? iSlow244 : ((iTemp2) ? iSlow232 : this.iRec44[1]));
        const iTemp296: i32 = ((iTemp266) ? ((iTemp272) ? iTemp277 : iTemp295) : iTemp295);
        const iTemp297: i32 = (iTemp294 >= iTemp296 ? 1 : 0) >= 1;
        const iTemp298: i32 = iTemp263 - iTemp293;
        const iTemp299: i32 = (iTemp298 <= iTemp296 ? 1 : 0) >= 1;
        this.iRec42[0] = ((iTemp271) ? ((iTemp288) ? ((iTemp299) ? iTemp296 : iTemp298) : ((iTemp289) ? ((iTemp297) ? iTemp296 : iTemp294) : iTemp263)) : iTemp263);
        const iTemp300: i32 = iTemp269 + 1;
        this.iRec43[0] = ((iTemp271) ? ((iTemp288) ? ((iTemp299) ? iTemp300 : iTemp269) : ((iTemp289) ? ((iTemp297) ? iTemp300 : iTemp269) : iTemp269)) : iTemp269);
        const iTemp301: i32 = (iTemp300 < 4 ? 1 : 0) >= 1;
        const iTemp302: i32 = iTemp300 >= 2;
        const iTemp303: i32 = iTemp300 >= 1;
        const iTemp304: i32 = iTemp300 >= 3;
        const fTemp305: f32 = ((iTemp302) ? ((iTemp304) ? fSlow243 : fSlow249) : ((iTemp303) ? fSlow248 : fSlow220));
        const iTemp306: i32 = _icast(Mathf.max(16.0, fSlow231 + _fcast((_icast(((fTemp305 >= 2e+01 ? 1 : 0) ? fTemp305 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp305)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp307: i32 = ((iTemp301) ? iTemp306 : iTemp296);
        this.iRec44[0] = ((iTemp271) ? ((iTemp288) ? ((iTemp299) ? iTemp307 : iTemp296) : ((iTemp289) ? ((iTemp297) ? iTemp307 : iTemp296) : iTemp296)) : iTemp296);
        const iTemp308: i32 = ((iTemp301) ? iTemp306 > iTemp296 : iTemp286);
        this.iRec45[0] = ((iTemp271) ? ((iTemp288) ? ((iTemp299) ? iTemp308 : iTemp286) : ((iTemp289) ? ((iTemp297) ? iTemp308 : iTemp286) : iTemp286)) : iTemp286);
        const fTemp309: f32 = ((iTemp302) ? ((iTemp304) ? fSlow245 : fSlow251) : ((iTemp303) ? fSlow250 : fSlow234));
        const iTemp310: i32 = min<i32>(63, iSlow237 + ((41 * _icast(fTemp309)) >> 6));
        const iTemp311: i32 = ((iTemp301) ? _icast(this.fConst1 * _fcast(((iTemp310 & 3) + 4) << ((iTemp310 >> 2) + 2))) : iTemp293);
        this.iRec46[0] = ((iTemp271) ? ((iTemp288) ? ((iTemp299) ? iTemp311 : iTemp293) : ((iTemp289) ? ((iTemp297) ? iTemp311 : iTemp293) : iTemp293)) : iTemp293);
        this.iRec47[0] = iTemp270;
        const iTemp312: i32 = iTemp300 == 0;
        const iTemp313: i32 = fTemp305 == 0.0;
        const fTemp314: f32 = Mathf.min(fSlow238 + fTemp309, 99.0);
        const iTemp315: i32 = fTemp314 < 77.0;
        const fTemp316: f32 = ((iTemp315) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp314)), 76))]) : 2e+01 * (99.0 - fTemp314));
        const iTemp317: i32 = ((iTemp301) ? (((iTemp306 == iTemp296 ? 1 : 0) | (iTemp312 & iTemp313)) ? _icast(this.fConst1 * (((iTemp315 & iTemp312) & iTemp313) ? 0.05 * fTemp316 : fTemp316)) : 0) : iTemp284);
        this.iRec48[0] = ((iTemp271) ? ((iTemp288) ? ((iTemp299) ? iTemp317 : iTemp284) : ((iTemp289) ? ((iTemp297) ? iTemp317 : iTemp284) : iTemp284)) : iTemp284);
        const fTemp318: f32 = ((iTemp125) ? 0.0 : this.fRec49[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow264 + ((iSlow260) ? 0.0 : fTemp149))));
        this.fRec49[0] = fTemp318 - Mathf.floor(fTemp318);
        const fTemp319: f32 = ((iTemp125) ? 0.0 : this.fRec50[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow269 + ((iSlow265) ? 0.0 : fTemp149))));
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
        const iTemp334: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp333 >= 2e+01 ? 1 : 0) ? fTemp333 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp333)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp335: i32 = iTemp325 == 0;
        const iTemp336: i32 = fTemp333 == 0.0;
        const fTemp337: f32 = ((iTemp330) ? ((iTemp332) ? fSlow295 : fSlow301) : ((iTemp331) ? fSlow300 : fSlow284));
        const fTemp338: f32 = Mathf.min(fSlow288 + fTemp337, 99.0);
        const iTemp339: i32 = fTemp338 < 77.0;
        const fTemp340: f32 = ((iTemp339) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp338)), 76))]) : 2e+01 * (99.0 - fTemp338));
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
        const iTemp363: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp362 >= 2e+01 ? 1 : 0) ? fTemp362 + 28.0 : _fcast(Dx7_alg17_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp362)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp373: f32 = ((iTemp372) ? _fcast(Dx7_alg17_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp371)), 76))]) : 2e+01 * (99.0 - fTemp371));
        const iTemp374: i32 = ((iTemp358) ? (((iTemp363 == iTemp353 ? 1 : 0) | (iTemp369 & iTemp370)) ? _icast(this.fConst1 * (((iTemp372 & iTemp369) & iTemp370) ? 0.05 * fTemp373 : fTemp373)) : 0) : iTemp341);
        this.iRec58[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp374 : iTemp341) : ((iTemp346) ? ((iTemp354) ? iTemp374 : iTemp341) : iTemp341)) : iTemp341);
        const fTemp375: f32 = ((iTemp125) ? 0.0 : this.fRec59[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow314 + ((iSlow310) ? 0.0 : fTemp149))));
        this.fRec59[0] = fTemp375 - Mathf.floor(fTemp375);
        this.fRec51[0] = 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec52[0] + (-234881024 - ((iSlow308) ? _icast(5.9604645e-08 * _fcast(this.iRec52[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow309 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec59[0] + this.fRec51[1] * fSlow316));
        const fTemp376: f32 = 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec0[0] + (-234881024 - ((iSlow48) ? _icast(5.9604645e-08 * _fcast(this.iRec0[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow65 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (0.5 * (Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec12[0] + (-234881024 - ((iSlow104) ? _icast(5.9604645e-08 * _fcast(this.iRec12[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow105 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec19[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec26[0] + (-234881024 - ((iSlow168) ? _icast(5.9604645e-08 * _fcast(this.iRec26[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow169 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec33[0]))) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec34[0] + (-234881024 - ((iSlow213) ? _icast(5.9604645e-08 * _fcast(this.iRec34[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow214 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec41[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec42[0] + (-234881024 - ((iSlow258) ? _icast(5.9604645e-08 * _fcast(this.iRec42[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow259 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec49[0])))) + this.fRec50[0] + this.fRec51[0]));
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
        this.iRec12[1] = this.iRec12[0];
        this.iRec13[1] = this.iRec13[0];
        this.iRec14[1] = this.iRec14[0];
        this.iRec15[1] = this.iRec15[0];
        this.iRec16[1] = this.iRec16[0];
        this.iRec17[1] = this.iRec17[0];
        this.iRec18[1] = this.iRec18[0];
        this.fRec20[1] = this.fRec20[0];
        this.iRec21[1] = this.iRec21[0];
        this.iRec22[1] = this.iRec22[0];
        this.iRec23[1] = this.iRec23[0];
        this.fRec24[1] = this.fRec24[0];
        this.iRec25[1] = this.iRec25[0];
        this.fRec19[1] = this.fRec19[0];
        this.iRec26[1] = this.iRec26[0];
        this.iRec27[1] = this.iRec27[0];
        this.iRec28[1] = this.iRec28[0];
        this.iRec29[1] = this.iRec29[0];
        this.iRec30[1] = this.iRec30[0];
        this.iRec31[1] = this.iRec31[0];
        this.iRec32[1] = this.iRec32[0];
        this.fRec33[1] = this.fRec33[0];
        this.iRec34[1] = this.iRec34[0];
        this.iRec35[1] = this.iRec35[0];
        this.iRec36[1] = this.iRec36[0];
        this.iRec37[1] = this.iRec37[0];
        this.iRec38[1] = this.iRec38[0];
        this.iRec39[1] = this.iRec39[0];
        this.iRec40[1] = this.iRec40[0];
        this.fRec41[1] = this.fRec41[0];
        this.iRec42[1] = this.iRec42[0];
        this.iRec43[1] = this.iRec43[0];
        this.iRec44[1] = this.iRec44[0];
        this.iRec45[1] = this.iRec45[0];
        this.iRec46[1] = this.iRec46[0];
        this.iRec47[1] = this.iRec47[0];
        this.iRec48[1] = this.iRec48[0];
        this.fRec49[1] = this.fRec49[0];
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

export class Dx7_alg17Channel extends MidiChannel {
    private _nrpnMsb: u8 = 127;
    private _nrpnLsb: u8 = 127;

    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case 99: this._nrpnMsb = value; break;
            case 98: this._nrpnLsb = value; break;
            case 6:
                this._setParam(<u16>this._nrpnMsb * 128 + <u16>this._nrpnLsb, value);
                break;
        }
    }

    private _setParam(param: u16, value: u8): void {
        switch (param) {
            case 0: dx7_alg17_fHslider126 = <f32>value / 127.0 * 7; break;
            case 1: dx7_alg17_fHslider2 = -24 + <f32>value / 127.0 * 48; break;
            case 2: dx7_alg17_fHslider37 = <f32>value / 127.0; break;
            case 3: dx7_alg17_fHslider42 = <f32>value / 127.0 * 99; break;
            case 4: dx7_alg17_fHslider45 = <f32>value / 127.0 * 99; break;
            case 5: dx7_alg17_fHslider46 = <f32>value / 127.0 * 99; break;
            case 6: dx7_alg17_fHslider41 = <f32>value / 127.0 * 99; break;
            case 7: dx7_alg17_fHslider44 = <f32>value / 127.0 * 99; break;
            case 8: dx7_alg17_fHslider47 = <f32>value / 127.0 * 99; break;
            case 9: dx7_alg17_fHslider48 = <f32>value / 127.0 * 99; break;
            case 10: dx7_alg17_fHslider43 = <f32>value / 127.0 * 99; break;
            case 11: dx7_alg17_fEntry2 = <f32>value / 127.0 * 5; break;
            case 12: dx7_alg17_fHslider20 = <f32>value / 127.0 * 99; break;
            case 13: dx7_alg17_fHslider21 = <f32>value / 127.0 * 99; break;
            case 14: dx7_alg17_fHslider49 = <f32>value / 127.0 * 99; break;
            case 15: dx7_alg17_fHslider18 = <f32>value / 127.0 * 99; break;
            case 16: dx7_alg17_fHslider19 = <f32>value / 127.0; break;
            case 17: dx7_alg17_fHslider50 = <f32>value / 127.0 * 7; break;
            case 18: dx7_alg17_fHslider105 = -7 + <f32>value / 127.0 * 14; break;
            case 19: dx7_alg17_fHslider106 = <f32>value / 127.0 * 31; break;
            case 20: dx7_alg17_fHslider107 = <f32>value / 127.0 * 99; break;
            case 21: dx7_alg17_fHslider0 = <f32>value / 127.0 * 99; break;
            case 22: dx7_alg17_fHslider13 = <f32>value / 127.0 * 99; break;
            case 23: dx7_alg17_fHslider14 = <f32>value / 127.0 * 99; break;
            case 24: dx7_alg17_fHslider11 = <f32>value / 127.0 * 99; break;
            case 25: dx7_alg17_fHslider9 = <f32>value / 127.0 * 99; break;
            case 26: dx7_alg17_fHslider15 = <f32>value / 127.0 * 99; break;
            case 27: dx7_alg17_fHslider16 = <f32>value / 127.0 * 99; break;
            case 28: dx7_alg17_fHslider12 = <f32>value / 127.0 * 99; break;
            case 29: dx7_alg17_fHslider1 = <f32>value / 127.0 * 99; break;
            case 30: dx7_alg17_fHslider7 = <f32>value / 127.0 * 7; break;
            case 31: dx7_alg17_fHslider17 = <f32>value / 127.0 * 3; break;
            case 32: dx7_alg17_fHslider10 = <f32>value / 127.0 * 7; break;
            case 33: dx7_alg17_fHslider4 = <f32>value / 127.0 * 99; break;
            case 34: dx7_alg17_fHslider5 = <f32>value / 127.0 * 99; break;
            case 35: dx7_alg17_fHslider6 = <f32>value / 127.0 * 99; break;
            case 36: dx7_alg17_fEntry0 = <f32>value / 127.0 * 3; break;
            case 37: dx7_alg17_fEntry1 = <f32>value / 127.0 * 3; break;
            case 38: dx7_alg17_fHslider123 = -7 + <f32>value / 127.0 * 14; break;
            case 39: dx7_alg17_fHslider124 = <f32>value / 127.0 * 31; break;
            case 40: dx7_alg17_fHslider125 = <f32>value / 127.0 * 99; break;
            case 41: dx7_alg17_fHslider108 = <f32>value / 127.0 * 99; break;
            case 42: dx7_alg17_fHslider118 = <f32>value / 127.0 * 99; break;
            case 43: dx7_alg17_fHslider119 = <f32>value / 127.0 * 99; break;
            case 44: dx7_alg17_fHslider116 = <f32>value / 127.0 * 99; break;
            case 45: dx7_alg17_fHslider114 = <f32>value / 127.0 * 99; break;
            case 46: dx7_alg17_fHslider120 = <f32>value / 127.0 * 99; break;
            case 47: dx7_alg17_fHslider121 = <f32>value / 127.0 * 99; break;
            case 48: dx7_alg17_fHslider117 = <f32>value / 127.0 * 99; break;
            case 49: dx7_alg17_fHslider109 = <f32>value / 127.0 * 99; break;
            case 50: dx7_alg17_fHslider113 = <f32>value / 127.0 * 7; break;
            case 51: dx7_alg17_fHslider122 = <f32>value / 127.0 * 3; break;
            case 52: dx7_alg17_fHslider115 = <f32>value / 127.0 * 7; break;
            case 53: dx7_alg17_fHslider110 = <f32>value / 127.0 * 99; break;
            case 54: dx7_alg17_fHslider111 = <f32>value / 127.0 * 99; break;
            case 55: dx7_alg17_fHslider112 = <f32>value / 127.0 * 99; break;
            case 56: dx7_alg17_fEntry11 = <f32>value / 127.0 * 3; break;
            case 57: dx7_alg17_fEntry12 = <f32>value / 127.0 * 3; break;
            case 58: dx7_alg17_fHslider38 = -7 + <f32>value / 127.0 * 14; break;
            case 59: dx7_alg17_fHslider39 = <f32>value / 127.0 * 31; break;
            case 60: dx7_alg17_fHslider40 = <f32>value / 127.0 * 99; break;
            case 61: dx7_alg17_fHslider22 = <f32>value / 127.0 * 99; break;
            case 62: dx7_alg17_fHslider32 = <f32>value / 127.0 * 99; break;
            case 63: dx7_alg17_fHslider33 = <f32>value / 127.0 * 99; break;
            case 64: dx7_alg17_fHslider30 = <f32>value / 127.0 * 99; break;
            case 65: dx7_alg17_fHslider28 = <f32>value / 127.0 * 99; break;
            case 66: dx7_alg17_fHslider34 = <f32>value / 127.0 * 99; break;
            case 67: dx7_alg17_fHslider35 = <f32>value / 127.0 * 99; break;
            case 68: dx7_alg17_fHslider31 = <f32>value / 127.0 * 99; break;
            case 69: dx7_alg17_fHslider23 = <f32>value / 127.0 * 99; break;
            case 70: dx7_alg17_fHslider27 = <f32>value / 127.0 * 7; break;
            case 71: dx7_alg17_fHslider36 = <f32>value / 127.0 * 3; break;
            case 72: dx7_alg17_fHslider29 = <f32>value / 127.0 * 7; break;
            case 73: dx7_alg17_fHslider24 = <f32>value / 127.0 * 99; break;
            case 74: dx7_alg17_fHslider25 = <f32>value / 127.0 * 99; break;
            case 75: dx7_alg17_fHslider26 = <f32>value / 127.0 * 99; break;
            case 76: dx7_alg17_fEntry3 = <f32>value / 127.0 * 3; break;
            case 77: dx7_alg17_fEntry4 = <f32>value / 127.0 * 3; break;
            case 78: dx7_alg17_fHslider66 = -7 + <f32>value / 127.0 * 14; break;
            case 79: dx7_alg17_fHslider67 = <f32>value / 127.0 * 31; break;
            case 80: dx7_alg17_fHslider68 = <f32>value / 127.0 * 99; break;
            case 81: dx7_alg17_fHslider51 = <f32>value / 127.0 * 99; break;
            case 82: dx7_alg17_fHslider61 = <f32>value / 127.0 * 99; break;
            case 83: dx7_alg17_fHslider62 = <f32>value / 127.0 * 99; break;
            case 84: dx7_alg17_fHslider59 = <f32>value / 127.0 * 99; break;
            case 85: dx7_alg17_fHslider57 = <f32>value / 127.0 * 99; break;
            case 86: dx7_alg17_fHslider63 = <f32>value / 127.0 * 99; break;
            case 87: dx7_alg17_fHslider64 = <f32>value / 127.0 * 99; break;
            case 88: dx7_alg17_fHslider60 = <f32>value / 127.0 * 99; break;
            case 89: dx7_alg17_fHslider52 = <f32>value / 127.0 * 99; break;
            case 90: dx7_alg17_fHslider56 = <f32>value / 127.0 * 7; break;
            case 91: dx7_alg17_fHslider65 = <f32>value / 127.0 * 3; break;
            case 92: dx7_alg17_fHslider58 = <f32>value / 127.0 * 7; break;
            case 93: dx7_alg17_fHslider53 = <f32>value / 127.0 * 99; break;
            case 94: dx7_alg17_fHslider54 = <f32>value / 127.0 * 99; break;
            case 95: dx7_alg17_fHslider55 = <f32>value / 127.0 * 99; break;
            case 96: dx7_alg17_fEntry5 = <f32>value / 127.0 * 3; break;
            case 97: dx7_alg17_fEntry6 = <f32>value / 127.0 * 3; break;
            case 98: dx7_alg17_fHslider84 = -7 + <f32>value / 127.0 * 14; break;
            case 99: dx7_alg17_fHslider85 = <f32>value / 127.0 * 31; break;
            case 100: dx7_alg17_fHslider86 = <f32>value / 127.0 * 99; break;
            case 101: dx7_alg17_fHslider69 = <f32>value / 127.0 * 99; break;
            case 102: dx7_alg17_fHslider79 = <f32>value / 127.0 * 99; break;
            case 103: dx7_alg17_fHslider80 = <f32>value / 127.0 * 99; break;
            case 104: dx7_alg17_fHslider77 = <f32>value / 127.0 * 99; break;
            case 105: dx7_alg17_fHslider75 = <f32>value / 127.0 * 99; break;
            case 106: dx7_alg17_fHslider81 = <f32>value / 127.0 * 99; break;
            case 107: dx7_alg17_fHslider82 = <f32>value / 127.0 * 99; break;
            case 108: dx7_alg17_fHslider78 = <f32>value / 127.0 * 99; break;
            case 109: dx7_alg17_fHslider70 = <f32>value / 127.0 * 99; break;
            case 110: dx7_alg17_fHslider74 = <f32>value / 127.0 * 7; break;
            case 111: dx7_alg17_fHslider83 = <f32>value / 127.0 * 3; break;
            case 112: dx7_alg17_fHslider76 = <f32>value / 127.0 * 7; break;
            case 113: dx7_alg17_fHslider71 = <f32>value / 127.0 * 99; break;
            case 114: dx7_alg17_fHslider72 = <f32>value / 127.0 * 99; break;
            case 115: dx7_alg17_fHslider73 = <f32>value / 127.0 * 99; break;
            case 116: dx7_alg17_fEntry7 = <f32>value / 127.0 * 3; break;
            case 117: dx7_alg17_fEntry8 = <f32>value / 127.0 * 3; break;
            case 118: dx7_alg17_fHslider102 = -7 + <f32>value / 127.0 * 14; break;
            case 119: dx7_alg17_fHslider103 = <f32>value / 127.0 * 31; break;
            case 120: dx7_alg17_fHslider104 = <f32>value / 127.0 * 99; break;
            case 121: dx7_alg17_fHslider87 = <f32>value / 127.0 * 99; break;
            case 122: dx7_alg17_fHslider97 = <f32>value / 127.0 * 99; break;
            case 123: dx7_alg17_fHslider98 = <f32>value / 127.0 * 99; break;
            case 124: dx7_alg17_fHslider95 = <f32>value / 127.0 * 99; break;
            case 125: dx7_alg17_fHslider93 = <f32>value / 127.0 * 99; break;
            case 126: dx7_alg17_fHslider99 = <f32>value / 127.0 * 99; break;
            case 127: dx7_alg17_fHslider100 = <f32>value / 127.0 * 99; break;
            case 128: dx7_alg17_fHslider96 = <f32>value / 127.0 * 99; break;
            case 129: dx7_alg17_fHslider88 = <f32>value / 127.0 * 99; break;
            case 130: dx7_alg17_fHslider92 = <f32>value / 127.0 * 7; break;
            case 131: dx7_alg17_fHslider101 = <f32>value / 127.0 * 3; break;
            case 132: dx7_alg17_fHslider94 = <f32>value / 127.0 * 7; break;
            case 133: dx7_alg17_fHslider89 = <f32>value / 127.0 * 99; break;
            case 134: dx7_alg17_fHslider90 = <f32>value / 127.0 * 99; break;
            case 135: dx7_alg17_fHslider91 = <f32>value / 127.0 * 99; break;
            case 136: dx7_alg17_fEntry9 = <f32>value / 127.0 * 3; break;
            case 137: dx7_alg17_fEntry10 = <f32>value / 127.0 * 3; break;
        }
    }
}

// Feedback (NRPN 0)
let dx7_alg21_fHslider54: f32 = 0;
// Transpose (NRPN 1)
let dx7_alg21_fHslider2: f32 = 0;
// Osc Key Sync (NRPN 2)
let dx7_alg21_fHslider22: f32 = 1;
// L1 (NRPN 3)
let dx7_alg21_fHslider27: f32 = 50;
// L2 (NRPN 4)
let dx7_alg21_fHslider30: f32 = 50;
// L3 (NRPN 5)
let dx7_alg21_fHslider31: f32 = 50;
// L4 (NRPN 6)
let dx7_alg21_fHslider26: f32 = 50;
// R1 (NRPN 7)
let dx7_alg21_fHslider29: f32 = 99;
// R2 (NRPN 8)
let dx7_alg21_fHslider32: f32 = 99;
// R3 (NRPN 9)
let dx7_alg21_fHslider33: f32 = 99;
// R4 (NRPN 10)
let dx7_alg21_fHslider28: f32 = 99;
// Wave (NRPN 11)
let dx7_alg21_fEntry2: f32 = 0;
// Speed (NRPN 12)
let dx7_alg21_fHslider20: f32 = 35;
// Delay (NRPN 13)
let dx7_alg21_fHslider21: f32 = 0;
// PMD (NRPN 14)
let dx7_alg21_fHslider34: f32 = 0;
// AMD (NRPN 15)
let dx7_alg21_fHslider18: f32 = 0;
// Sync (NRPN 16)
let dx7_alg21_fHslider19: f32 = 1;
// P Mod Sens (NRPN 17)
let dx7_alg21_fHslider35: f32 = 3;
// Tune (NRPN 18)
let dx7_alg21_fHslider23: f32 = 0;
// Coarse (NRPN 19)
let dx7_alg21_fHslider24: f32 = 1;
// Fine (NRPN 20)
let dx7_alg21_fHslider25: f32 = 0;
// L1 (NRPN 21)
let dx7_alg21_fHslider0: f32 = 99;
// L2 (NRPN 22)
let dx7_alg21_fHslider13: f32 = 99;
// L3 (NRPN 23)
let dx7_alg21_fHslider14: f32 = 99;
// L4 (NRPN 24)
let dx7_alg21_fHslider11: f32 = 0;
// R1 (NRPN 25)
let dx7_alg21_fHslider9: f32 = 99;
// R2 (NRPN 26)
let dx7_alg21_fHslider15: f32 = 99;
// R3 (NRPN 27)
let dx7_alg21_fHslider16: f32 = 99;
// R4 (NRPN 28)
let dx7_alg21_fHslider12: f32 = 99;
// Level (NRPN 29)
let dx7_alg21_fHslider1: f32 = 99;
// Key Vel (NRPN 30)
let dx7_alg21_fHslider7: f32 = 0;
// A Mod Sens (NRPN 31)
let dx7_alg21_fHslider17: f32 = 0;
// Rate Scaling (NRPN 32)
let dx7_alg21_fHslider10: f32 = 0;
// Breakpoint (NRPN 33)
let dx7_alg21_fHslider4: f32 = 0;
// L Depth (NRPN 34)
let dx7_alg21_fHslider5: f32 = 0;
// R Depth (NRPN 35)
let dx7_alg21_fHslider6: f32 = 0;
// L Curve (NRPN 36)
let dx7_alg21_fEntry0: f32 = 0;
// R Curve (NRPN 37)
let dx7_alg21_fEntry1: f32 = 0;
// Tune (NRPN 38)
let dx7_alg21_fHslider70: f32 = 0;
// Coarse (NRPN 39)
let dx7_alg21_fHslider71: f32 = 1;
// Fine (NRPN 40)
let dx7_alg21_fHslider72: f32 = 0;
// L1 (NRPN 41)
let dx7_alg21_fHslider55: f32 = 99;
// L2 (NRPN 42)
let dx7_alg21_fHslider65: f32 = 99;
// L3 (NRPN 43)
let dx7_alg21_fHslider66: f32 = 99;
// L4 (NRPN 44)
let dx7_alg21_fHslider63: f32 = 0;
// R1 (NRPN 45)
let dx7_alg21_fHslider61: f32 = 99;
// R2 (NRPN 46)
let dx7_alg21_fHslider67: f32 = 99;
// R3 (NRPN 47)
let dx7_alg21_fHslider68: f32 = 99;
// R4 (NRPN 48)
let dx7_alg21_fHslider64: f32 = 99;
// Level (NRPN 49)
let dx7_alg21_fHslider56: f32 = 0;
// Key Vel (NRPN 50)
let dx7_alg21_fHslider60: f32 = 0;
// A Mod Sens (NRPN 51)
let dx7_alg21_fHslider69: f32 = 0;
// Rate Scaling (NRPN 52)
let dx7_alg21_fHslider62: f32 = 0;
// Breakpoint (NRPN 53)
let dx7_alg21_fHslider57: f32 = 0;
// L Depth (NRPN 54)
let dx7_alg21_fHslider58: f32 = 0;
// R Depth (NRPN 55)
let dx7_alg21_fHslider59: f32 = 0;
// L Curve (NRPN 56)
let dx7_alg21_fEntry5: f32 = 0;
// R Curve (NRPN 57)
let dx7_alg21_fEntry6: f32 = 0;
// Tune (NRPN 58)
let dx7_alg21_fHslider51: f32 = 0;
// Coarse (NRPN 59)
let dx7_alg21_fHslider52: f32 = 1;
// Fine (NRPN 60)
let dx7_alg21_fHslider53: f32 = 0;
// L1 (NRPN 61)
let dx7_alg21_fHslider36: f32 = 99;
// L2 (NRPN 62)
let dx7_alg21_fHslider46: f32 = 99;
// L3 (NRPN 63)
let dx7_alg21_fHslider47: f32 = 99;
// L4 (NRPN 64)
let dx7_alg21_fHslider44: f32 = 0;
// R1 (NRPN 65)
let dx7_alg21_fHslider42: f32 = 99;
// R2 (NRPN 66)
let dx7_alg21_fHslider48: f32 = 99;
// R3 (NRPN 67)
let dx7_alg21_fHslider49: f32 = 99;
// R4 (NRPN 68)
let dx7_alg21_fHslider45: f32 = 99;
// Level (NRPN 69)
let dx7_alg21_fHslider37: f32 = 0;
// Key Vel (NRPN 70)
let dx7_alg21_fHslider41: f32 = 0;
// A Mod Sens (NRPN 71)
let dx7_alg21_fHslider50: f32 = 0;
// Rate Scaling (NRPN 72)
let dx7_alg21_fHslider43: f32 = 0;
// Breakpoint (NRPN 73)
let dx7_alg21_fHslider38: f32 = 0;
// L Depth (NRPN 74)
let dx7_alg21_fHslider39: f32 = 0;
// R Depth (NRPN 75)
let dx7_alg21_fHslider40: f32 = 0;
// L Curve (NRPN 76)
let dx7_alg21_fEntry3: f32 = 0;
// R Curve (NRPN 77)
let dx7_alg21_fEntry4: f32 = 0;
// Tune (NRPN 78)
let dx7_alg21_fHslider88: f32 = 0;
// Coarse (NRPN 79)
let dx7_alg21_fHslider89: f32 = 1;
// Fine (NRPN 80)
let dx7_alg21_fHslider90: f32 = 0;
// L1 (NRPN 81)
let dx7_alg21_fHslider73: f32 = 99;
// L2 (NRPN 82)
let dx7_alg21_fHslider83: f32 = 99;
// L3 (NRPN 83)
let dx7_alg21_fHslider84: f32 = 99;
// L4 (NRPN 84)
let dx7_alg21_fHslider81: f32 = 0;
// R1 (NRPN 85)
let dx7_alg21_fHslider79: f32 = 99;
// R2 (NRPN 86)
let dx7_alg21_fHslider85: f32 = 99;
// R3 (NRPN 87)
let dx7_alg21_fHslider86: f32 = 99;
// R4 (NRPN 88)
let dx7_alg21_fHslider82: f32 = 99;
// Level (NRPN 89)
let dx7_alg21_fHslider74: f32 = 0;
// Key Vel (NRPN 90)
let dx7_alg21_fHslider78: f32 = 0;
// A Mod Sens (NRPN 91)
let dx7_alg21_fHslider87: f32 = 0;
// Rate Scaling (NRPN 92)
let dx7_alg21_fHslider80: f32 = 0;
// Breakpoint (NRPN 93)
let dx7_alg21_fHslider75: f32 = 0;
// L Depth (NRPN 94)
let dx7_alg21_fHslider76: f32 = 0;
// R Depth (NRPN 95)
let dx7_alg21_fHslider77: f32 = 0;
// L Curve (NRPN 96)
let dx7_alg21_fEntry7: f32 = 0;
// R Curve (NRPN 97)
let dx7_alg21_fEntry8: f32 = 0;
// Tune (NRPN 98)
let dx7_alg21_fHslider124: f32 = 0;
// Coarse (NRPN 99)
let dx7_alg21_fHslider125: f32 = 1;
// Fine (NRPN 100)
let dx7_alg21_fHslider126: f32 = 0;
// L1 (NRPN 101)
let dx7_alg21_fHslider109: f32 = 99;
// L2 (NRPN 102)
let dx7_alg21_fHslider119: f32 = 99;
// L3 (NRPN 103)
let dx7_alg21_fHslider120: f32 = 99;
// L4 (NRPN 104)
let dx7_alg21_fHslider117: f32 = 0;
// R1 (NRPN 105)
let dx7_alg21_fHslider115: f32 = 99;
// R2 (NRPN 106)
let dx7_alg21_fHslider121: f32 = 99;
// R3 (NRPN 107)
let dx7_alg21_fHslider122: f32 = 99;
// R4 (NRPN 108)
let dx7_alg21_fHslider118: f32 = 99;
// Level (NRPN 109)
let dx7_alg21_fHslider110: f32 = 0;
// Key Vel (NRPN 110)
let dx7_alg21_fHslider114: f32 = 0;
// A Mod Sens (NRPN 111)
let dx7_alg21_fHslider123: f32 = 0;
// Rate Scaling (NRPN 112)
let dx7_alg21_fHslider116: f32 = 0;
// Breakpoint (NRPN 113)
let dx7_alg21_fHslider111: f32 = 0;
// L Depth (NRPN 114)
let dx7_alg21_fHslider112: f32 = 0;
// R Depth (NRPN 115)
let dx7_alg21_fHslider113: f32 = 0;
// L Curve (NRPN 116)
let dx7_alg21_fEntry11: f32 = 0;
// R Curve (NRPN 117)
let dx7_alg21_fEntry12: f32 = 0;
// Tune (NRPN 118)
let dx7_alg21_fHslider106: f32 = 0;
// Coarse (NRPN 119)
let dx7_alg21_fHslider107: f32 = 1;
// Fine (NRPN 120)
let dx7_alg21_fHslider108: f32 = 0;
// L1 (NRPN 121)
let dx7_alg21_fHslider91: f32 = 99;
// L2 (NRPN 122)
let dx7_alg21_fHslider101: f32 = 99;
// L3 (NRPN 123)
let dx7_alg21_fHslider102: f32 = 99;
// L4 (NRPN 124)
let dx7_alg21_fHslider99: f32 = 0;
// R1 (NRPN 125)
let dx7_alg21_fHslider97: f32 = 99;
// R2 (NRPN 126)
let dx7_alg21_fHslider103: f32 = 99;
// R3 (NRPN 127)
let dx7_alg21_fHslider104: f32 = 99;
// R4 (NRPN 128)
let dx7_alg21_fHslider100: f32 = 99;
// Level (NRPN 129)
let dx7_alg21_fHslider92: f32 = 0;
// Key Vel (NRPN 130)
let dx7_alg21_fHslider96: f32 = 0;
// A Mod Sens (NRPN 131)
let dx7_alg21_fHslider105: f32 = 0;
// Rate Scaling (NRPN 132)
let dx7_alg21_fHslider98: f32 = 0;
// Breakpoint (NRPN 133)
let dx7_alg21_fHslider93: f32 = 0;
// L Depth (NRPN 134)
let dx7_alg21_fHslider94: f32 = 0;
// R Depth (NRPN 135)
let dx7_alg21_fHslider95: f32 = 0;
// L Curve (NRPN 136)
let dx7_alg21_fEntry9: f32 = 0;
// R Curve (NRPN 137)
let dx7_alg21_fEntry10: f32 = 0;

const Dx7_alg21_wave_SIG0Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 5, 9, 13, 17, 20, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 42, 43, 45, 46]);
const Dx7_alg21_wave_SIG1Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14, 16, 19, 23, 27, 33, 39, 47, 56, 66, 80, 94, 110, 126, 142, 158, 174, 190, 206, 222, 238, 250]);
const Dx7_alg21_wave_SIG2Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 70, 86, 97, 106, 114, 121, 126, 132, 138, 142, 148, 152, 156, 160, 163, 166, 170, 173, 174, 178, 181, 184, 186, 189, 190, 194, 196, 198, 200, 202, 205, 206, 209, 211, 214, 216, 218, 220, 222, 224, 225, 227, 229, 230, 232, 233, 235, 237, 238, 240, 241, 242, 243, 244, 246, 246, 248, 249, 250, 251, 252, 253, 254]);
const Dx7_alg21_wave_SIG3Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1764000, 1764000, 1411200, 1411200, 1190700, 1014300, 992250, 882000, 705600, 705600, 584325, 507150, 502740, 441000, 418950, 352800, 308700, 286650, 253575, 220500, 220500, 176400, 145530, 145530, 125685, 110250, 110250, 88200, 88200, 74970, 61740, 61740, 55125, 48510, 44100, 37485, 31311, 30870, 27562, 27562, 22050, 18522, 17640, 15435, 14112, 13230, 11025, 9261, 9261, 7717, 6615, 6615, 5512, 5512, 4410, 3969, 3969, 3439, 2866, 2690, 2249, 1984, 1896, 1808, 1411, 1367, 1234, 1146, 926, 837, 837, 705, 573, 573, 529, 441, 441]);
const Dx7_alg21_wave_SIG4Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 4342338, 7171437, 16777216]);
const Dx7_alg21_wave_SIG5Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-16777216, 0, 16777216, 26591258, 33554432, 38955489, 43368474, 47099600, 50331648, 53182516, 55732705, 58039632, 60145690, 62083076, 63876816, 65546747, 67108864, 68576247, 69959732, 71268397, 72509921, 73690858, 74816848, 75892776, 76922906, 77910978, 78860292, 79773775, 80654032, 81503396, 82323963, 83117622]);
const Dx7_alg21_wave_SIG6Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-128, -116, -104, -95, -85, -76, -68, -61, -56, -52, -49, -46, -43, -41, -39, -37, -35, -33, -32, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 38, 40, 43, 46, 49, 53, 58, 65, 73, 82, 92, 103, 115, 127]);
const Dx7_alg21_wave_SIG7Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 33, 34, 36, 37, 38, 39, 41, 42, 44, 46, 47, 49, 51, 53, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 79, 82, 85, 88, 91, 94, 98, 102, 106, 110, 115, 120, 125, 130, 135, 141, 147, 153, 159, 165, 171, 178, 185, 193, 202, 211, 232, 243, 254, 255]);
const Dx7_alg21_wave_SIG8Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 10, 20, 33, 55, 92, 153, 255]);

const Dx7_alg21_itbl0SIG0: StaticArray<i32> = new StaticArray<i32>(20);
const Dx7_alg21_itbl1SIG1: StaticArray<i32> = new StaticArray<i32>(33);
const Dx7_alg21_itbl2SIG2: StaticArray<i32> = new StaticArray<i32>(64);
const Dx7_alg21_itbl3SIG3: StaticArray<i32> = new StaticArray<i32>(77);
const Dx7_alg21_itbl4SIG4: StaticArray<i32> = new StaticArray<i32>(4);
const Dx7_alg21_itbl5SIG5: StaticArray<i32> = new StaticArray<i32>(32);
const Dx7_alg21_itbl6SIG6: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg21_itbl7SIG7: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg21_itbl8SIG8: StaticArray<i32> = new StaticArray<i32>(8);
let _Dx7_alg21_sig0_initialized: bool = false;

function _Dx7_alg21_initSIG0Tables(): void {
    if (_Dx7_alg21_sig0_initialized) return;
    _Dx7_alg21_sig0_initialized = true;
    let sig0_iDx7_alg21SIG0Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg21_itbl0SIG0.length; i++) {
        Dx7_alg21_itbl0SIG0[i] = Dx7_alg21_wave_SIG0Wave0[sig0_iDx7_alg21SIG0Wave0_idx];
        sig0_iDx7_alg21SIG0Wave0_idx = (1 + sig0_iDx7_alg21SIG0Wave0_idx) % 20;
    }
    let sig1_iDx7_alg21SIG1Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg21_itbl1SIG1.length; i++) {
        Dx7_alg21_itbl1SIG1[i] = Dx7_alg21_wave_SIG1Wave0[sig1_iDx7_alg21SIG1Wave0_idx];
        sig1_iDx7_alg21SIG1Wave0_idx = (1 + sig1_iDx7_alg21SIG1Wave0_idx) % 33;
    }
    let sig2_iDx7_alg21SIG2Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg21_itbl2SIG2.length; i++) {
        Dx7_alg21_itbl2SIG2[i] = Dx7_alg21_wave_SIG2Wave0[sig2_iDx7_alg21SIG2Wave0_idx];
        sig2_iDx7_alg21SIG2Wave0_idx = (1 + sig2_iDx7_alg21SIG2Wave0_idx) % 64;
    }
    let sig3_iDx7_alg21SIG3Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg21_itbl3SIG3.length; i++) {
        Dx7_alg21_itbl3SIG3[i] = Dx7_alg21_wave_SIG3Wave0[sig3_iDx7_alg21SIG3Wave0_idx];
        sig3_iDx7_alg21SIG3Wave0_idx = (1 + sig3_iDx7_alg21SIG3Wave0_idx) % 77;
    }
    let sig4_iDx7_alg21SIG4Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg21_itbl4SIG4.length; i++) {
        Dx7_alg21_itbl4SIG4[i] = Dx7_alg21_wave_SIG4Wave0[sig4_iDx7_alg21SIG4Wave0_idx];
        sig4_iDx7_alg21SIG4Wave0_idx = (1 + sig4_iDx7_alg21SIG4Wave0_idx) % 4;
    }
    let sig5_iDx7_alg21SIG5Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg21_itbl5SIG5.length; i++) {
        Dx7_alg21_itbl5SIG5[i] = Dx7_alg21_wave_SIG5Wave0[sig5_iDx7_alg21SIG5Wave0_idx];
        sig5_iDx7_alg21SIG5Wave0_idx = (1 + sig5_iDx7_alg21SIG5Wave0_idx) % 32;
    }
    let sig6_iDx7_alg21SIG6Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg21_itbl6SIG6.length; i++) {
        Dx7_alg21_itbl6SIG6[i] = Dx7_alg21_wave_SIG6Wave0[sig6_iDx7_alg21SIG6Wave0_idx];
        sig6_iDx7_alg21SIG6Wave0_idx = (1 + sig6_iDx7_alg21SIG6Wave0_idx) % 100;
    }
    let sig7_iDx7_alg21SIG7Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg21_itbl7SIG7.length; i++) {
        Dx7_alg21_itbl7SIG7[i] = Dx7_alg21_wave_SIG7Wave0[sig7_iDx7_alg21SIG7Wave0_idx];
        sig7_iDx7_alg21SIG7Wave0_idx = (1 + sig7_iDx7_alg21SIG7Wave0_idx) % 100;
    }
    let sig8_iDx7_alg21SIG8Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg21_itbl8SIG8.length; i++) {
        Dx7_alg21_itbl8SIG8[i] = Dx7_alg21_wave_SIG8Wave0[sig8_iDx7_alg21SIG8Wave0_idx];
        sig8_iDx7_alg21SIG8Wave0_idx = (1 + sig8_iDx7_alg21SIG8Wave0_idx) % 8;
    }
}

export class Dx7_alg21 extends MidiVoice {
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
    private iRec20: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec21: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec22: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec23: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec24: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec25: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec26: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox1: f32 = 0;
    private fRec27: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec19: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec28: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec29: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec30: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec31: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec32: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec33: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec34: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox2: f32 = 0;
    private fRec35: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec36: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec37: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec38: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec39: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec40: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec41: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec42: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox3: f32 = 0;
    private fRec43: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec44: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec45: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec46: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec47: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec48: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec49: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec50: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox4: f32 = 0;
    private fRec51: StaticArray<f32> = new StaticArray<f32>(2);
    private iRec52: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec53: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec54: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec55: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec56: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec57: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec58: StaticArray<i32> = new StaticArray<i32>(2);
    private fCheckbox5: f32 = 0;
    private fRec59: StaticArray<f32> = new StaticArray<f32>(2);
    private silentSamples: i32 = 0;

    constructor(channel: MidiChannel) {
        super(channel);
        _Dx7_alg21_initSIG0Tables();
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
        for (let i = 0; i < 2; i++) { this.iRec20[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec21[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec22[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec23[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec24[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec25[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec26[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec27[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.fRec19[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec28[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec29[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec30[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec31[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec32[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec33[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec34[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec35[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec36[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec37[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec38[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec39[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec40[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec41[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec42[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec43[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec44[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec45[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec46[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec47[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec48[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec49[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec50[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec51[i] = 0.0; }
        for (let i = 0; i < 2; i++) { this.iRec52[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec53[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec54[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec55[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec56[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec57[i] = 0; }
        for (let i = 0; i < 2; i++) { this.iRec58[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec59[i] = 0.0; }
    }

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.fHslider3 = notefreq(note);
        this.fHslider8 = <f32>velocity / 127.0;
        this.fButton0 = 0.0;
        this.nextframe();
        this.fButton0 = 1.0;
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
        const fSlow1: f32 = Mathf.round(_fcast(dx7_alg21_fHslider0));
        const fSlow2: f32 = Mathf.round(_fcast(dx7_alg21_fHslider1));
        const fSlow3: f32 = Mathf.pow(2.0, 0.083333336 * (Mathf.round(_fcast(dx7_alg21_fHslider2)) + 17.31234 * Mathf.log(0.0022727272 * _fcast(this.fHslider3))));
        const fSlow4: f32 = Mathf.round(17.31234 * Mathf.log(fSlow3) + 69.0);
        const fSlow5: f32 = Mathf.round(_fcast(dx7_alg21_fHslider4));
        const fSlow6: f32 = Mathf.round(_fcast(dx7_alg21_fEntry0));
        const fSlow7: f32 = Mathf.round(_fcast(dx7_alg21_fHslider5));
        const fSlow8: f32 = fSlow4 + (-18.0 - fSlow5);
        const iSlow9: i32 = (((fSlow6 == 0.0 ? 1 : 0) | (fSlow6 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow7 * fSlow8)) >> 12 : _icast(329.0 * fSlow7 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow8))), 32))])) >> 15);
        const fSlow10: f32 = Mathf.round(_fcast(dx7_alg21_fEntry1));
        const fSlow11: f32 = Mathf.round(_fcast(dx7_alg21_fHslider6));
        const fSlow12: f32 = fSlow4 + (-16.0 - fSlow5);
        const iSlow13: i32 = (((fSlow10 == 0.0 ? 1 : 0) | (fSlow10 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow11 * fSlow12) >> 12 : _icast(329.0 * fSlow11 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow12)), 32))])) >> 15);
        const fSlow14: f32 = _fcast(Dx7_alg21_itbl2SIG2[_icast(Mathf.round(_fcast(_icast(Mathf.max(0.0, Mathf.min(127.0, 127.0 * _fcast(this.fHslider8)))) >> 1)))] + -239);
        const fSlow15: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow2 >= 2e+01 ? 1 : 0) ? fSlow2 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow2)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow5)) >= 0.0) ? ((fSlow10 < 2.0 ? 1 : 0) ? -iSlow13 : iSlow13) : ((fSlow6 < 2.0 ? 1 : 0) ? -iSlow9 : iSlow9)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg21_fHslider7)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow16: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow1 >= 2e+01 ? 1 : 0) ? fSlow1 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow1)), 19))]))) >> 1) << 6) + fSlow15 + -4256.0)) << 16;
        const iSlow17: i32 = fSlow1 == 0.0;
        const fSlow18: f32 = Mathf.round(_fcast(dx7_alg21_fHslider9));
        const fSlow19: f32 = Mathf.round(_fcast(dx7_alg21_fHslider10));
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
        const fSlow31: f32 = ((iSlow30) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow29)), 76))]) : 2e+01 * (99.0 - fSlow29));
        const iSlow32: i32 = (((iSlow16 == 0 ? 1 : 0) | iSlow17) ? _icast(this.fConst1 * ((iSlow30 & iSlow17) ? 0.05 * fSlow31 : fSlow31)) : 0);
        const fSlow33: f32 = Mathf.round(_fcast(dx7_alg21_fHslider11));
        const iSlow34: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fSlow33 >= 2e+01 ? 1 : 0) ? fSlow33 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow33)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow35: f32 = Mathf.round(_fcast(dx7_alg21_fHslider12));
        const fSlow36: f32 = Mathf.min(fSlow35 + fSlow28, 99.0);
        const iSlow37: i32 = _icast(this.fConst1 * ((fSlow36 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow36)), 76))]) : 2e+01 * (99.0 - fSlow36)));
        const fSlow38: f32 = Mathf.round(_fcast(dx7_alg21_fHslider13));
        const fSlow39: f32 = Mathf.round(_fcast(dx7_alg21_fHslider14));
        const fSlow40: f32 = Mathf.round(_fcast(dx7_alg21_fHslider15));
        const fSlow41: f32 = Mathf.round(_fcast(dx7_alg21_fHslider16));
        const iSlow42: i32 = iSlow16 > 0;
        const iSlow43: i32 = min<i32>(63, ((41 * _icast(fSlow18)) >> 6) + iSlow27);
        const iSlow44: i32 = _icast(this.fConst1 * _fcast(((iSlow43 & 3) + 4) << ((iSlow43 >> 2) + 2)));
        const iSlow45: i32 = min<i32>(63, ((41 * _icast(fSlow35)) >> 6) + iSlow27);
        const iSlow46: i32 = _icast(this.fConst1 * _fcast(((iSlow45 & 3) + 4) << ((iSlow45 >> 2) + 2)));
        const iSlow47: i32 = Dx7_alg21_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg21_fHslider17))))];
        const iSlow48: i32 = iSlow47 != 0;
        const fSlow49: f32 = 2.6972606e-09 * Mathf.round(_fcast(dx7_alg21_fHslider18));
        const iSlow50: i32 = _icast(Mathf.round(_fcast(dx7_alg21_fHslider19)));
        const fSlow51: f32 = Mathf.round(_fcast(dx7_alg21_fHslider20));
        const fSlow52: f32 = this.fConst2 * (((0.01010101 * fSlow51) <= 0.656566) ? 0.15806305 * fSlow51 + 0.036478 : 1.100254 * fSlow51 + -61.205933);
        const fSlow53: f32 = 99.0 - Mathf.round(_fcast(dx7_alg21_fHslider21));
        const iSlow54: i32 = (fSlow53 == 99.0 ? 1 : 0) >= 1;
        const iSlow55: i32 = _icast(fSlow53);
        const iSlow56: i32 = ((iSlow55 & 15) + 16) << ((iSlow55 >> 4) + 1);
        const fSlow57: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(max<i32>(iSlow56 & 65408, 128)));
        const fSlow58: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(iSlow56));
        const fSlow59: f32 = Mathf.round(_fcast(dx7_alg21_fEntry2));
        const iSlow60: i32 = fSlow59 >= 3.0;
        const iSlow61: i32 = fSlow59 >= 5.0;
        const iSlow62: i32 = fSlow59 >= 2.0;
        const iSlow63: i32 = fSlow59 >= 1.0;
        const iSlow64: i32 = fSlow59 >= 4.0;
        const fSlow65: f32 = _fcast(iSlow47);
        const iSlow66: i32 = _icast(Mathf.round(_fcast(dx7_alg21_fHslider22)));
        const iSlow67: i32 = _icast(Mathf.round(_fcast(this.fCheckbox0)));
        const fSlow68: f32 = Mathf.log(4.4e+02 * fSlow3);
        const fSlow69: f32 = Mathf.round(_fcast(dx7_alg21_fHslider23));
        const fSlow70: f32 = Mathf.exp(-0.57130724 * fSlow68);
        const iSlow71: i32 = _icast(Mathf.round(_fcast(dx7_alg21_fHslider24)));
        const fSlow72: f32 = Mathf.round(_fcast(dx7_alg21_fHslider25));
        const fSlow73: f32 = ((iSlow67) ? _fcast(_icast(4458616.0 * (fSlow72 + _fcast(100 * (iSlow71 & 3)))) >> 3) + ((fSlow69 > 0.0 ? 1 : 0) ? 13457.0 * fSlow69 : 0.0) : fSlow68 * (72267.445 * fSlow69 * fSlow70 + 24204406.0) + _fcast(Dx7_alg21_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow71 & 31)))]) + _fcast(((_icast(fSlow72)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow72 + 1.0) + 0.5)) : 0)));
        const fSlow74: f32 = Mathf.round(_fcast(dx7_alg21_fHslider26));
        const iSlow75: i32 = Dx7_alg21_itbl6SIG6[_icast(Mathf.round(fSlow74))];
        const fSlow76: f32 = _fcast(iSlow75);
        const fSlow77: f32 = Mathf.round(_fcast(dx7_alg21_fHslider27));
        const iSlow78: i32 = Dx7_alg21_itbl6SIG6[_icast(Mathf.round(fSlow77))];
        const iSlow79: i32 = iSlow78 > iSlow75;
        const fSlow80: f32 = Mathf.round(_fcast(dx7_alg21_fHslider28));
        const fSlow81: f32 = this.fConst4 * _fcast(Dx7_alg21_itbl7SIG7[_icast(Mathf.round(fSlow80))]);
        const fSlow82: f32 = Mathf.round(_fcast(dx7_alg21_fHslider29));
        const fSlow83: f32 = this.fConst4 * _fcast(Dx7_alg21_itbl7SIG7[_icast(Mathf.round(fSlow82))]);
        const fSlow84: f32 = Mathf.round(_fcast(dx7_alg21_fHslider30));
        const fSlow85: f32 = Mathf.round(_fcast(dx7_alg21_fHslider31));
        const fSlow86: f32 = Mathf.round(_fcast(dx7_alg21_fHslider32));
        const fSlow87: f32 = Mathf.round(_fcast(dx7_alg21_fHslider33));
        const fSlow88: f32 = 7.891414e-05 * Mathf.round(_fcast(dx7_alg21_fHslider34));
        const fSlow89: f32 = _fcast(Dx7_alg21_itbl8SIG8[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg21_fHslider35))))]);
        const fSlow90: f32 = Mathf.round(_fcast(dx7_alg21_fHslider36));
        const fSlow91: f32 = Mathf.round(_fcast(dx7_alg21_fHslider37));
        const fSlow92: f32 = Mathf.round(_fcast(dx7_alg21_fHslider38));
        const fSlow93: f32 = Mathf.round(_fcast(dx7_alg21_fEntry3));
        const fSlow94: f32 = Mathf.round(_fcast(dx7_alg21_fHslider39));
        const fSlow95: f32 = fSlow4 + (-18.0 - fSlow92);
        const iSlow96: i32 = (((fSlow93 == 0.0 ? 1 : 0) | (fSlow93 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow94 * fSlow95)) >> 12 : _icast(329.0 * fSlow94 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow95))), 32))])) >> 15);
        const fSlow97: f32 = Mathf.round(_fcast(dx7_alg21_fEntry4));
        const fSlow98: f32 = Mathf.round(_fcast(dx7_alg21_fHslider40));
        const fSlow99: f32 = fSlow4 + (-16.0 - fSlow92);
        const iSlow100: i32 = (((fSlow97 == 0.0 ? 1 : 0) | (fSlow97 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow98 * fSlow99) >> 12 : _icast(329.0 * fSlow98 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow99)), 32))])) >> 15);
        const fSlow101: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow91 >= 2e+01 ? 1 : 0) ? fSlow91 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow91)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow92)) >= 0.0) ? ((fSlow97 < 2.0 ? 1 : 0) ? -iSlow100 : iSlow100) : ((fSlow93 < 2.0 ? 1 : 0) ? -iSlow96 : iSlow96)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg21_fHslider41)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow102: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow90 >= 2e+01 ? 1 : 0) ? fSlow90 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow90)), 19))]))) >> 1) << 6) + fSlow101 + -4256.0)) << 16;
        const iSlow103: i32 = fSlow90 == 0.0;
        const fSlow104: f32 = Mathf.round(_fcast(dx7_alg21_fHslider42));
        const fSlow105: f32 = Mathf.round(_fcast(dx7_alg21_fHslider43));
        const iSlow106: i32 = _icast(fSlow105 * fSlow25) >> 3;
        const iSlow107: i32 = (((fSlow105 == 3.0 ? 1 : 0) & iSlow22) ? iSlow106 + -1 : ((((fSlow105 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow106 + 1 : iSlow106));
        const fSlow108: f32 = _fcast(iSlow107);
        const fSlow109: f32 = Mathf.min(fSlow104 + fSlow108, 99.0);
        const iSlow110: i32 = fSlow109 < 77.0;
        const fSlow111: f32 = ((iSlow110) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow109)), 76))]) : 2e+01 * (99.0 - fSlow109));
        const iSlow112: i32 = (((iSlow102 == 0 ? 1 : 0) | iSlow103) ? _icast(this.fConst1 * ((iSlow110 & iSlow103) ? 0.05 * fSlow111 : fSlow111)) : 0);
        const fSlow113: f32 = Mathf.round(_fcast(dx7_alg21_fHslider44));
        const iSlow114: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fSlow113 >= 2e+01 ? 1 : 0) ? fSlow113 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow113)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow115: f32 = Mathf.round(_fcast(dx7_alg21_fHslider45));
        const fSlow116: f32 = Mathf.min(fSlow115 + fSlow108, 99.0);
        const iSlow117: i32 = _icast(this.fConst1 * ((fSlow116 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow116)), 76))]) : 2e+01 * (99.0 - fSlow116)));
        const fSlow118: f32 = Mathf.round(_fcast(dx7_alg21_fHslider46));
        const fSlow119: f32 = Mathf.round(_fcast(dx7_alg21_fHslider47));
        const fSlow120: f32 = Mathf.round(_fcast(dx7_alg21_fHslider48));
        const fSlow121: f32 = Mathf.round(_fcast(dx7_alg21_fHslider49));
        const iSlow122: i32 = iSlow102 > 0;
        const iSlow123: i32 = min<i32>(63, ((41 * _icast(fSlow104)) >> 6) + iSlow107);
        const iSlow124: i32 = _icast(this.fConst1 * _fcast(((iSlow123 & 3) + 4) << ((iSlow123 >> 2) + 2)));
        const iSlow125: i32 = min<i32>(63, ((41 * _icast(fSlow115)) >> 6) + iSlow107);
        const iSlow126: i32 = _icast(this.fConst1 * _fcast(((iSlow125 & 3) + 4) << ((iSlow125 >> 2) + 2)));
        const iSlow127: i32 = Dx7_alg21_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg21_fHslider50))))];
        const iSlow128: i32 = iSlow127 != 0;
        const fSlow129: f32 = _fcast(iSlow127);
        const iSlow130: i32 = _icast(Mathf.round(_fcast(this.fCheckbox1)));
        const fSlow131: f32 = Mathf.round(_fcast(dx7_alg21_fHslider51));
        const iSlow132: i32 = _icast(Mathf.round(_fcast(dx7_alg21_fHslider52)));
        const fSlow133: f32 = Mathf.round(_fcast(dx7_alg21_fHslider53));
        const fSlow134: f32 = ((iSlow130) ? _fcast(_icast(4458616.0 * (fSlow133 + _fcast(100 * (iSlow132 & 3)))) >> 3) + ((fSlow131 > 0.0 ? 1 : 0) ? 13457.0 * fSlow131 : 0.0) : fSlow68 * (72267.445 * fSlow131 * fSlow70 + 24204406.0) + _fcast(Dx7_alg21_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow132 & 31)))]) + _fcast(((_icast(fSlow133)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow133 + 1.0) + 0.5)) : 0)));
        const fSlow135: f32 = Mathf.round(_fcast(dx7_alg21_fHslider54));
        const fSlow136: f32 = ((fSlow135 == 0.0 ? 1 : 0) ? 0.0 : Mathf.pow(2.0, fSlow135 + -7.0));
        const fSlow137: f32 = Mathf.round(_fcast(dx7_alg21_fHslider55));
        const fSlow138: f32 = Mathf.round(_fcast(dx7_alg21_fHslider56));
        const fSlow139: f32 = Mathf.round(_fcast(dx7_alg21_fHslider57));
        const fSlow140: f32 = Mathf.round(_fcast(dx7_alg21_fEntry5));
        const fSlow141: f32 = Mathf.round(_fcast(dx7_alg21_fHslider58));
        const fSlow142: f32 = fSlow4 + (-18.0 - fSlow139);
        const iSlow143: i32 = (((fSlow140 == 0.0 ? 1 : 0) | (fSlow140 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow141 * fSlow142)) >> 12 : _icast(329.0 * fSlow141 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow142))), 32))])) >> 15);
        const fSlow144: f32 = Mathf.round(_fcast(dx7_alg21_fEntry6));
        const fSlow145: f32 = Mathf.round(_fcast(dx7_alg21_fHslider59));
        const fSlow146: f32 = fSlow4 + (-16.0 - fSlow139);
        const iSlow147: i32 = (((fSlow144 == 0.0 ? 1 : 0) | (fSlow144 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow145 * fSlow146) >> 12 : _icast(329.0 * fSlow145 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow146)), 32))])) >> 15);
        const fSlow148: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow138 >= 2e+01 ? 1 : 0) ? fSlow138 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow138)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow139)) >= 0.0) ? ((fSlow144 < 2.0 ? 1 : 0) ? -iSlow147 : iSlow147) : ((fSlow140 < 2.0 ? 1 : 0) ? -iSlow143 : iSlow143)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg21_fHslider60)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow149: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow137 >= 2e+01 ? 1 : 0) ? fSlow137 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow137)), 19))]))) >> 1) << 6) + fSlow148 + -4256.0)) << 16;
        const iSlow150: i32 = fSlow137 == 0.0;
        const fSlow151: f32 = Mathf.round(_fcast(dx7_alg21_fHslider61));
        const fSlow152: f32 = Mathf.round(_fcast(dx7_alg21_fHslider62));
        const iSlow153: i32 = _icast(fSlow152 * fSlow25) >> 3;
        const iSlow154: i32 = (((fSlow152 == 3.0 ? 1 : 0) & iSlow22) ? iSlow153 + -1 : ((((fSlow152 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow153 + 1 : iSlow153));
        const fSlow155: f32 = _fcast(iSlow154);
        const fSlow156: f32 = Mathf.min(fSlow151 + fSlow155, 99.0);
        const iSlow157: i32 = fSlow156 < 77.0;
        const fSlow158: f32 = ((iSlow157) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow156)), 76))]) : 2e+01 * (99.0 - fSlow156));
        const iSlow159: i32 = (((iSlow149 == 0 ? 1 : 0) | iSlow150) ? _icast(this.fConst1 * ((iSlow157 & iSlow150) ? 0.05 * fSlow158 : fSlow158)) : 0);
        const fSlow160: f32 = Mathf.round(_fcast(dx7_alg21_fHslider63));
        const iSlow161: i32 = _icast(Mathf.max(16.0, fSlow148 + _fcast((_icast(((fSlow160 >= 2e+01 ? 1 : 0) ? fSlow160 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow160)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow162: f32 = Mathf.round(_fcast(dx7_alg21_fHslider64));
        const fSlow163: f32 = Mathf.min(fSlow162 + fSlow155, 99.0);
        const iSlow164: i32 = _icast(this.fConst1 * ((fSlow163 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow163)), 76))]) : 2e+01 * (99.0 - fSlow163)));
        const fSlow165: f32 = Mathf.round(_fcast(dx7_alg21_fHslider65));
        const fSlow166: f32 = Mathf.round(_fcast(dx7_alg21_fHslider66));
        const fSlow167: f32 = Mathf.round(_fcast(dx7_alg21_fHslider67));
        const fSlow168: f32 = Mathf.round(_fcast(dx7_alg21_fHslider68));
        const iSlow169: i32 = iSlow149 > 0;
        const iSlow170: i32 = min<i32>(63, ((41 * _icast(fSlow151)) >> 6) + iSlow154);
        const iSlow171: i32 = _icast(this.fConst1 * _fcast(((iSlow170 & 3) + 4) << ((iSlow170 >> 2) + 2)));
        const iSlow172: i32 = min<i32>(63, ((41 * _icast(fSlow162)) >> 6) + iSlow154);
        const iSlow173: i32 = _icast(this.fConst1 * _fcast(((iSlow172 & 3) + 4) << ((iSlow172 >> 2) + 2)));
        const iSlow174: i32 = Dx7_alg21_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg21_fHslider69))))];
        const iSlow175: i32 = iSlow174 != 0;
        const fSlow176: f32 = _fcast(iSlow174);
        const iSlow177: i32 = _icast(Mathf.round(_fcast(this.fCheckbox2)));
        const fSlow178: f32 = Mathf.round(_fcast(dx7_alg21_fHslider70));
        const iSlow179: i32 = _icast(Mathf.round(_fcast(dx7_alg21_fHslider71)));
        const fSlow180: f32 = Mathf.round(_fcast(dx7_alg21_fHslider72));
        const fSlow181: f32 = ((iSlow177) ? _fcast(_icast(4458616.0 * (fSlow180 + _fcast(100 * (iSlow179 & 3)))) >> 3) + ((fSlow178 > 0.0 ? 1 : 0) ? 13457.0 * fSlow178 : 0.0) : fSlow68 * (72267.445 * fSlow178 * fSlow70 + 24204406.0) + _fcast(Dx7_alg21_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow179 & 31)))]) + _fcast(((_icast(fSlow180)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow180 + 1.0) + 0.5)) : 0)));
        const fSlow182: f32 = Mathf.round(_fcast(dx7_alg21_fHslider73));
        const fSlow183: f32 = Mathf.round(_fcast(dx7_alg21_fHslider74));
        const fSlow184: f32 = Mathf.round(_fcast(dx7_alg21_fHslider75));
        const fSlow185: f32 = Mathf.round(_fcast(dx7_alg21_fEntry7));
        const fSlow186: f32 = Mathf.round(_fcast(dx7_alg21_fHslider76));
        const fSlow187: f32 = fSlow4 + (-18.0 - fSlow184);
        const iSlow188: i32 = (((fSlow185 == 0.0 ? 1 : 0) | (fSlow185 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow186 * fSlow187)) >> 12 : _icast(329.0 * fSlow186 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow187))), 32))])) >> 15);
        const fSlow189: f32 = Mathf.round(_fcast(dx7_alg21_fEntry8));
        const fSlow190: f32 = Mathf.round(_fcast(dx7_alg21_fHslider77));
        const fSlow191: f32 = fSlow4 + (-16.0 - fSlow184);
        const iSlow192: i32 = (((fSlow189 == 0.0 ? 1 : 0) | (fSlow189 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow190 * fSlow191) >> 12 : _icast(329.0 * fSlow190 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow191)), 32))])) >> 15);
        const fSlow193: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow183 >= 2e+01 ? 1 : 0) ? fSlow183 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow183)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow184)) >= 0.0) ? ((fSlow189 < 2.0 ? 1 : 0) ? -iSlow192 : iSlow192) : ((fSlow185 < 2.0 ? 1 : 0) ? -iSlow188 : iSlow188)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg21_fHslider78)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow194: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow182 >= 2e+01 ? 1 : 0) ? fSlow182 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow182)), 19))]))) >> 1) << 6) + fSlow193 + -4256.0)) << 16;
        const iSlow195: i32 = fSlow182 == 0.0;
        const fSlow196: f32 = Mathf.round(_fcast(dx7_alg21_fHslider79));
        const fSlow197: f32 = Mathf.round(_fcast(dx7_alg21_fHslider80));
        const iSlow198: i32 = _icast(fSlow197 * fSlow25) >> 3;
        const iSlow199: i32 = (((fSlow197 == 3.0 ? 1 : 0) & iSlow22) ? iSlow198 + -1 : ((((fSlow197 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow198 + 1 : iSlow198));
        const fSlow200: f32 = _fcast(iSlow199);
        const fSlow201: f32 = Mathf.min(fSlow196 + fSlow200, 99.0);
        const iSlow202: i32 = fSlow201 < 77.0;
        const fSlow203: f32 = ((iSlow202) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow201)), 76))]) : 2e+01 * (99.0 - fSlow201));
        const iSlow204: i32 = (((iSlow194 == 0 ? 1 : 0) | iSlow195) ? _icast(this.fConst1 * ((iSlow202 & iSlow195) ? 0.05 * fSlow203 : fSlow203)) : 0);
        const fSlow205: f32 = Mathf.round(_fcast(dx7_alg21_fHslider81));
        const iSlow206: i32 = _icast(Mathf.max(16.0, fSlow193 + _fcast((_icast(((fSlow205 >= 2e+01 ? 1 : 0) ? fSlow205 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow205)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow207: f32 = Mathf.round(_fcast(dx7_alg21_fHslider82));
        const fSlow208: f32 = Mathf.min(fSlow207 + fSlow200, 99.0);
        const iSlow209: i32 = _icast(this.fConst1 * ((fSlow208 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow208)), 76))]) : 2e+01 * (99.0 - fSlow208)));
        const fSlow210: f32 = Mathf.round(_fcast(dx7_alg21_fHslider83));
        const fSlow211: f32 = Mathf.round(_fcast(dx7_alg21_fHslider84));
        const fSlow212: f32 = Mathf.round(_fcast(dx7_alg21_fHslider85));
        const fSlow213: f32 = Mathf.round(_fcast(dx7_alg21_fHslider86));
        const iSlow214: i32 = iSlow194 > 0;
        const iSlow215: i32 = min<i32>(63, ((41 * _icast(fSlow196)) >> 6) + iSlow199);
        const iSlow216: i32 = _icast(this.fConst1 * _fcast(((iSlow215 & 3) + 4) << ((iSlow215 >> 2) + 2)));
        const iSlow217: i32 = min<i32>(63, ((41 * _icast(fSlow207)) >> 6) + iSlow199);
        const iSlow218: i32 = _icast(this.fConst1 * _fcast(((iSlow217 & 3) + 4) << ((iSlow217 >> 2) + 2)));
        const iSlow219: i32 = Dx7_alg21_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg21_fHslider87))))];
        const iSlow220: i32 = iSlow219 != 0;
        const fSlow221: f32 = _fcast(iSlow219);
        const iSlow222: i32 = _icast(Mathf.round(_fcast(this.fCheckbox3)));
        const fSlow223: f32 = Mathf.round(_fcast(dx7_alg21_fHslider88));
        const iSlow224: i32 = _icast(Mathf.round(_fcast(dx7_alg21_fHslider89)));
        const fSlow225: f32 = Mathf.round(_fcast(dx7_alg21_fHslider90));
        const fSlow226: f32 = ((iSlow222) ? _fcast(_icast(4458616.0 * (fSlow225 + _fcast(100 * (iSlow224 & 3)))) >> 3) + ((fSlow223 > 0.0 ? 1 : 0) ? 13457.0 * fSlow223 : 0.0) : fSlow68 * (72267.445 * fSlow223 * fSlow70 + 24204406.0) + _fcast(Dx7_alg21_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow224 & 31)))]) + _fcast(((_icast(fSlow225)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow225 + 1.0) + 0.5)) : 0)));
        const fSlow227: f32 = Mathf.round(_fcast(dx7_alg21_fHslider91));
        const fSlow228: f32 = Mathf.round(_fcast(dx7_alg21_fHslider92));
        const fSlow229: f32 = Mathf.round(_fcast(dx7_alg21_fHslider93));
        const fSlow230: f32 = Mathf.round(_fcast(dx7_alg21_fEntry9));
        const fSlow231: f32 = Mathf.round(_fcast(dx7_alg21_fHslider94));
        const fSlow232: f32 = fSlow4 + (-18.0 - fSlow229);
        const iSlow233: i32 = (((fSlow230 == 0.0 ? 1 : 0) | (fSlow230 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow231 * fSlow232)) >> 12 : _icast(329.0 * fSlow231 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow232))), 32))])) >> 15);
        const fSlow234: f32 = Mathf.round(_fcast(dx7_alg21_fEntry10));
        const fSlow235: f32 = Mathf.round(_fcast(dx7_alg21_fHslider95));
        const fSlow236: f32 = fSlow4 + (-16.0 - fSlow229);
        const iSlow237: i32 = (((fSlow234 == 0.0 ? 1 : 0) | (fSlow234 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow235 * fSlow236) >> 12 : _icast(329.0 * fSlow235 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow236)), 32))])) >> 15);
        const fSlow238: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow228 >= 2e+01 ? 1 : 0) ? fSlow228 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow228)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow229)) >= 0.0) ? ((fSlow234 < 2.0 ? 1 : 0) ? -iSlow237 : iSlow237) : ((fSlow230 < 2.0 ? 1 : 0) ? -iSlow233 : iSlow233)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg21_fHslider96)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow239: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow227 >= 2e+01 ? 1 : 0) ? fSlow227 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow227)), 19))]))) >> 1) << 6) + fSlow238 + -4256.0)) << 16;
        const iSlow240: i32 = fSlow227 == 0.0;
        const fSlow241: f32 = Mathf.round(_fcast(dx7_alg21_fHslider97));
        const fSlow242: f32 = Mathf.round(_fcast(dx7_alg21_fHslider98));
        const iSlow243: i32 = _icast(fSlow242 * fSlow25) >> 3;
        const iSlow244: i32 = (((fSlow242 == 3.0 ? 1 : 0) & iSlow22) ? iSlow243 + -1 : ((((fSlow242 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow243 + 1 : iSlow243));
        const fSlow245: f32 = _fcast(iSlow244);
        const fSlow246: f32 = Mathf.min(fSlow241 + fSlow245, 99.0);
        const iSlow247: i32 = fSlow246 < 77.0;
        const fSlow248: f32 = ((iSlow247) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow246)), 76))]) : 2e+01 * (99.0 - fSlow246));
        const iSlow249: i32 = (((iSlow239 == 0 ? 1 : 0) | iSlow240) ? _icast(this.fConst1 * ((iSlow247 & iSlow240) ? 0.05 * fSlow248 : fSlow248)) : 0);
        const fSlow250: f32 = Mathf.round(_fcast(dx7_alg21_fHslider99));
        const iSlow251: i32 = _icast(Mathf.max(16.0, fSlow238 + _fcast((_icast(((fSlow250 >= 2e+01 ? 1 : 0) ? fSlow250 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow250)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow252: f32 = Mathf.round(_fcast(dx7_alg21_fHslider100));
        const fSlow253: f32 = Mathf.min(fSlow252 + fSlow245, 99.0);
        const iSlow254: i32 = _icast(this.fConst1 * ((fSlow253 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow253)), 76))]) : 2e+01 * (99.0 - fSlow253)));
        const fSlow255: f32 = Mathf.round(_fcast(dx7_alg21_fHslider101));
        const fSlow256: f32 = Mathf.round(_fcast(dx7_alg21_fHslider102));
        const fSlow257: f32 = Mathf.round(_fcast(dx7_alg21_fHslider103));
        const fSlow258: f32 = Mathf.round(_fcast(dx7_alg21_fHslider104));
        const iSlow259: i32 = iSlow239 > 0;
        const iSlow260: i32 = min<i32>(63, ((41 * _icast(fSlow241)) >> 6) + iSlow244);
        const iSlow261: i32 = _icast(this.fConst1 * _fcast(((iSlow260 & 3) + 4) << ((iSlow260 >> 2) + 2)));
        const iSlow262: i32 = min<i32>(63, ((41 * _icast(fSlow252)) >> 6) + iSlow244);
        const iSlow263: i32 = _icast(this.fConst1 * _fcast(((iSlow262 & 3) + 4) << ((iSlow262 >> 2) + 2)));
        const iSlow264: i32 = Dx7_alg21_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg21_fHslider105))))];
        const iSlow265: i32 = iSlow264 != 0;
        const fSlow266: f32 = _fcast(iSlow264);
        const iSlow267: i32 = _icast(Mathf.round(_fcast(this.fCheckbox4)));
        const fSlow268: f32 = Mathf.round(_fcast(dx7_alg21_fHslider106));
        const iSlow269: i32 = _icast(Mathf.round(_fcast(dx7_alg21_fHslider107)));
        const fSlow270: f32 = Mathf.round(_fcast(dx7_alg21_fHslider108));
        const fSlow271: f32 = ((iSlow267) ? _fcast(_icast(4458616.0 * (fSlow270 + _fcast(100 * (iSlow269 & 3)))) >> 3) + ((fSlow268 > 0.0 ? 1 : 0) ? 13457.0 * fSlow268 : 0.0) : fSlow68 * (72267.445 * fSlow268 * fSlow70 + 24204406.0) + _fcast(Dx7_alg21_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow269 & 31)))]) + _fcast(((_icast(fSlow270)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow270 + 1.0) + 0.5)) : 0)));
        const fSlow272: f32 = Mathf.round(_fcast(dx7_alg21_fHslider109));
        const fSlow273: f32 = Mathf.round(_fcast(dx7_alg21_fHslider110));
        const fSlow274: f32 = Mathf.round(_fcast(dx7_alg21_fHslider111));
        const fSlow275: f32 = Mathf.round(_fcast(dx7_alg21_fEntry11));
        const fSlow276: f32 = Mathf.round(_fcast(dx7_alg21_fHslider112));
        const fSlow277: f32 = fSlow4 + (-18.0 - fSlow274);
        const iSlow278: i32 = (((fSlow275 == 0.0 ? 1 : 0) | (fSlow275 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow276 * fSlow277)) >> 12 : _icast(329.0 * fSlow276 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow277))), 32))])) >> 15);
        const fSlow279: f32 = Mathf.round(_fcast(dx7_alg21_fEntry12));
        const fSlow280: f32 = Mathf.round(_fcast(dx7_alg21_fHslider113));
        const fSlow281: f32 = fSlow4 + (-16.0 - fSlow274);
        const iSlow282: i32 = (((fSlow279 == 0.0 ? 1 : 0) | (fSlow279 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow280 * fSlow281) >> 12 : _icast(329.0 * fSlow280 * _fcast(Dx7_alg21_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow281)), 32))])) >> 15);
        const fSlow283: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow273 >= 2e+01 ? 1 : 0) ? fSlow273 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow273)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow274)) >= 0.0) ? ((fSlow279 < 2.0 ? 1 : 0) ? -iSlow282 : iSlow282) : ((fSlow275 < 2.0 ? 1 : 0) ? -iSlow278 : iSlow278)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg21_fHslider114)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow284: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow272 >= 2e+01 ? 1 : 0) ? fSlow272 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow272)), 19))]))) >> 1) << 6) + fSlow283 + -4256.0)) << 16;
        const iSlow285: i32 = fSlow272 == 0.0;
        const fSlow286: f32 = Mathf.round(_fcast(dx7_alg21_fHslider115));
        const fSlow287: f32 = Mathf.round(_fcast(dx7_alg21_fHslider116));
        const iSlow288: i32 = _icast(fSlow287 * fSlow25) >> 3;
        const iSlow289: i32 = (((fSlow287 == 3.0 ? 1 : 0) & iSlow22) ? iSlow288 + -1 : ((((fSlow287 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow288 + 1 : iSlow288));
        const fSlow290: f32 = _fcast(iSlow289);
        const fSlow291: f32 = Mathf.min(fSlow286 + fSlow290, 99.0);
        const iSlow292: i32 = fSlow291 < 77.0;
        const fSlow293: f32 = ((iSlow292) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow291)), 76))]) : 2e+01 * (99.0 - fSlow291));
        const iSlow294: i32 = (((iSlow284 == 0 ? 1 : 0) | iSlow285) ? _icast(this.fConst1 * ((iSlow292 & iSlow285) ? 0.05 * fSlow293 : fSlow293)) : 0);
        const fSlow295: f32 = Mathf.round(_fcast(dx7_alg21_fHslider117));
        const iSlow296: i32 = _icast(Mathf.max(16.0, fSlow283 + _fcast((_icast(((fSlow295 >= 2e+01 ? 1 : 0) ? fSlow295 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow295)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow297: f32 = Mathf.round(_fcast(dx7_alg21_fHslider118));
        const fSlow298: f32 = Mathf.min(fSlow297 + fSlow290, 99.0);
        const iSlow299: i32 = _icast(this.fConst1 * ((fSlow298 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow298)), 76))]) : 2e+01 * (99.0 - fSlow298)));
        const fSlow300: f32 = Mathf.round(_fcast(dx7_alg21_fHslider119));
        const fSlow301: f32 = Mathf.round(_fcast(dx7_alg21_fHslider120));
        const fSlow302: f32 = Mathf.round(_fcast(dx7_alg21_fHslider121));
        const fSlow303: f32 = Mathf.round(_fcast(dx7_alg21_fHslider122));
        const iSlow304: i32 = iSlow284 > 0;
        const iSlow305: i32 = min<i32>(63, ((41 * _icast(fSlow286)) >> 6) + iSlow289);
        const iSlow306: i32 = _icast(this.fConst1 * _fcast(((iSlow305 & 3) + 4) << ((iSlow305 >> 2) + 2)));
        const iSlow307: i32 = min<i32>(63, ((41 * _icast(fSlow297)) >> 6) + iSlow289);
        const iSlow308: i32 = _icast(this.fConst1 * _fcast(((iSlow307 & 3) + 4) << ((iSlow307 >> 2) + 2)));
        const iSlow309: i32 = Dx7_alg21_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg21_fHslider123))))];
        const iSlow310: i32 = iSlow309 != 0;
        const fSlow311: f32 = _fcast(iSlow309);
        const iSlow312: i32 = _icast(Mathf.round(_fcast(this.fCheckbox5)));
        const fSlow313: f32 = Mathf.round(_fcast(dx7_alg21_fHslider124));
        const iSlow314: i32 = _icast(Mathf.round(_fcast(dx7_alg21_fHslider125)));
        const fSlow315: f32 = Mathf.round(_fcast(dx7_alg21_fHslider126));
        const fSlow316: f32 = ((iSlow312) ? _fcast(_icast(4458616.0 * (fSlow315 + _fcast(100 * (iSlow314 & 3)))) >> 3) + ((fSlow313 > 0.0 ? 1 : 0) ? 13457.0 * fSlow313 : 0.0) : fSlow68 * (72267.445 * fSlow313 * fSlow70 + 24204406.0) + _fcast(Dx7_alg21_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow314 & 31)))]) + _fcast(((_icast(fSlow315)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow315 + 1.0) + 0.5)) : 0)));

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
        const iTemp17: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp16 >= 2e+01 ? 1 : 0) ? fTemp16 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp16)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp18: i32 = iTemp8 == 0;
        const iTemp19: i32 = fTemp16 == 0.0;
        const fTemp20: f32 = ((iTemp13) ? ((iTemp15) ? fSlow35 : fSlow41) : ((iTemp14) ? fSlow40 : fSlow18));
        const fTemp21: f32 = Mathf.min(fSlow28 + fTemp20, 99.0);
        const iTemp22: i32 = fTemp21 < 77.0;
        const fTemp23: f32 = ((iTemp22) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp21)), 76))]) : 2e+01 * (99.0 - fTemp21));
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
        const iTemp46: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp45 >= 2e+01 ? 1 : 0) ? fTemp45 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp45)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp56: f32 = ((iTemp55) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp54)), 76))]) : 2e+01 * (99.0 - fTemp54));
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
        const iTemp89: i32 = Dx7_alg21_itbl6SIG6[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow74 : fSlow85) : ((iTemp87) ? fSlow84 : fSlow77))))];
        const iTemp90: i32 = ((iTemp85) ? iTemp89 : iTemp79);
        this.iRec15[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp90 : iTemp79) : ((iTemp81) ? iTemp90 : iTemp79)) : iTemp79);
        const iTemp91: i32 = ((iTemp85) ? iTemp89 > iTemp79 : iTemp75);
        this.iRec16[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp91 : iTemp75) : ((iTemp81) ? iTemp91 : iTemp75)) : iTemp75);
        const fTemp92: f32 = ((iTemp85) ? this.fConst4 * _fcast(Dx7_alg21_itbl7SIG7[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow80 : fSlow87) : ((iTemp87) ? fSlow86 : fSlow82))))]) : fTemp77);
        this.fRec17[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? fTemp92 : fTemp77) : ((iTemp81) ? fTemp92 : fTemp77)) : fTemp77);
        this.iRec18[0] = iTemp72;
        const fTemp93: f32 = fRec10 + -0.5;
        const fTemp94: f32 = 524288.0 * this.fRec13[0] + 16777216.0 * Mathf.abs(fSlow88 * fRec11 * fSlow89 * fTemp93) * (((0.00390625 * fSlow89 * fTemp93) < 0.0) ? -1.0 : 1.0);
        const fTemp95: f32 = ((iTemp70) ? 0.0 : this.fRec12[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow73 + ((iSlow67) ? 0.0 : fTemp94))));
        this.fRec12[0] = fTemp95 - Mathf.floor(fTemp95);
        const iTemp96: i32 = ((iTemp2) ? 0 : this.iRec20[1]);
        const iTemp97: i32 = ((iTemp0) ? ((iSlow114 == iTemp96 ? 1 : 0) ? iSlow117 : 0) : ((iTemp2) ? iSlow112 : this.iRec26[1]));
        const iTemp98: i32 = iTemp97 != 0;
        const iTemp99: i32 = (iTemp98 & (iTemp97 <= 1 ? 1 : 0)) >= 1;
        const iTemp100: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec21[1]));
        const iTemp101: i32 = iTemp100 + 1;
        const iTemp102: i32 = ((iTemp99) ? iTemp101 : iTemp100);
        const iTemp103: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec25[1]));
        const iTemp104: i32 = ((iTemp102 < 3 ? 1 : 0) | ((iTemp102 < 4 ? 1 : 0) & (iTemp103 ^ -1))) >= 1;
        const iTemp105: i32 = (iTemp101 < 4 ? 1 : 0) >= 1;
        const iTemp106: i32 = iTemp101 >= 2;
        const iTemp107: i32 = iTemp101 >= 1;
        const iTemp108: i32 = iTemp101 >= 3;
        const fTemp109: f32 = ((iTemp106) ? ((iTemp108) ? fSlow113 : fSlow119) : ((iTemp107) ? fSlow118 : fSlow90));
        const iTemp110: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp109 >= 2e+01 ? 1 : 0) ? fTemp109 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp109)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp111: i32 = iTemp101 == 0;
        const iTemp112: i32 = fTemp109 == 0.0;
        const fTemp113: f32 = ((iTemp106) ? ((iTemp108) ? fSlow115 : fSlow121) : ((iTemp107) ? fSlow120 : fSlow104));
        const fTemp114: f32 = Mathf.min(fSlow108 + fTemp113, 99.0);
        const iTemp115: i32 = fTemp114 < 77.0;
        const fTemp116: f32 = ((iTemp115) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp114)), 76))]) : 2e+01 * (99.0 - fTemp114));
        const iTemp117: i32 = ((iTemp99) ? ((iTemp105) ? (((iTemp110 == iTemp96 ? 1 : 0) | (iTemp111 & iTemp112)) ? _icast(this.fConst1 * (((iTemp115 & iTemp111) & iTemp112) ? 0.05 * fTemp116 : fTemp116)) : 0) : 0) : iTemp97 - ((iTemp98) ? 1 : 0));
        const iTemp118: i32 = ((iTemp0) ? iSlow114 > iTemp96 : ((iTemp2) ? iSlow122 : this.iRec23[1]));
        const iTemp119: i32 = ((iTemp99) ? ((iTemp105) ? iTemp110 > iTemp96 : iTemp118) : iTemp118);
        const iTemp120: i32 = (iTemp117 == 0 ? 1 : 0) * ((iTemp119 == 0 ? 1 : 0) + 1);
        const iTemp121: i32 = iTemp120 >= 2;
        const iTemp122: i32 = iTemp120 >= 1;
        const iTemp123: i32 = max<i32>(112459776, iTemp96);
        const iTemp124: i32 = ((iTemp0) ? iSlow126 : ((iTemp2) ? iSlow124 : this.iRec24[1]));
        const iTemp125: i32 = min<i32>(63, iSlow107 + ((41 * _icast(fTemp113)) >> 6));
        const iTemp126: i32 = ((iTemp99) ? ((iTemp105) ? _icast(this.fConst1 * _fcast(((iTemp125 & 3) + 4) << ((iTemp125 >> 2) + 2))) : iTemp124) : iTemp124);
        const iTemp127: i32 = iTemp123 + ((285212672 - iTemp123) >> 24) * iTemp126;
        const iTemp128: i32 = ((iTemp0) ? iSlow114 : ((iTemp2) ? iSlow102 : this.iRec22[1]));
        const iTemp129: i32 = ((iTemp99) ? ((iTemp105) ? iTemp110 : iTemp128) : iTemp128);
        const iTemp130: i32 = (iTemp127 >= iTemp129 ? 1 : 0) >= 1;
        const iTemp131: i32 = iTemp96 - iTemp126;
        const iTemp132: i32 = (iTemp131 <= iTemp129 ? 1 : 0) >= 1;
        this.iRec20[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp129 : iTemp131) : ((iTemp122) ? ((iTemp130) ? iTemp129 : iTemp127) : iTemp96)) : iTemp96);
        const iTemp133: i32 = iTemp102 + 1;
        this.iRec21[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp133 : iTemp102) : ((iTemp122) ? ((iTemp130) ? iTemp133 : iTemp102) : iTemp102)) : iTemp102);
        const iTemp134: i32 = (iTemp133 < 4 ? 1 : 0) >= 1;
        const iTemp135: i32 = iTemp133 >= 2;
        const iTemp136: i32 = iTemp133 >= 1;
        const iTemp137: i32 = iTemp133 >= 3;
        const fTemp138: f32 = ((iTemp135) ? ((iTemp137) ? fSlow113 : fSlow119) : ((iTemp136) ? fSlow118 : fSlow90));
        const iTemp139: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp138 >= 2e+01 ? 1 : 0) ? fTemp138 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp138)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp140: i32 = ((iTemp134) ? iTemp139 : iTemp129);
        this.iRec22[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp140 : iTemp129) : ((iTemp122) ? ((iTemp130) ? iTemp140 : iTemp129) : iTemp129)) : iTemp129);
        const iTemp141: i32 = ((iTemp134) ? iTemp139 > iTemp129 : iTemp119);
        this.iRec23[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp141 : iTemp119) : ((iTemp122) ? ((iTemp130) ? iTemp141 : iTemp119) : iTemp119)) : iTemp119);
        const fTemp142: f32 = ((iTemp135) ? ((iTemp137) ? fSlow115 : fSlow121) : ((iTemp136) ? fSlow120 : fSlow104));
        const iTemp143: i32 = min<i32>(63, iSlow107 + ((41 * _icast(fTemp142)) >> 6));
        const iTemp144: i32 = ((iTemp134) ? _icast(this.fConst1 * _fcast(((iTemp143 & 3) + 4) << ((iTemp143 >> 2) + 2))) : iTemp126);
        this.iRec24[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp144 : iTemp126) : ((iTemp122) ? ((iTemp130) ? iTemp144 : iTemp126) : iTemp126)) : iTemp126);
        this.iRec25[0] = iTemp103;
        const iTemp145: i32 = iTemp133 == 0;
        const iTemp146: i32 = fTemp138 == 0.0;
        const fTemp147: f32 = Mathf.min(fSlow108 + fTemp142, 99.0);
        const iTemp148: i32 = fTemp147 < 77.0;
        const fTemp149: f32 = ((iTemp148) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp147)), 76))]) : 2e+01 * (99.0 - fTemp147));
        const iTemp150: i32 = ((iTemp134) ? (((iTemp139 == iTemp129 ? 1 : 0) | (iTemp145 & iTemp146)) ? _icast(this.fConst1 * (((iTemp148 & iTemp145) & iTemp146) ? 0.05 * fTemp149 : fTemp149)) : 0) : iTemp117);
        this.iRec26[0] = ((iTemp104) ? ((iTemp121) ? ((iTemp132) ? iTemp150 : iTemp117) : ((iTemp122) ? ((iTemp130) ? iTemp150 : iTemp117) : iTemp117)) : iTemp117);
        const fTemp151: f32 = ((iTemp70) ? 0.0 : this.fRec27[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow134 + ((iSlow130) ? 0.0 : fTemp94))));
        this.fRec27[0] = fTemp151 - Mathf.floor(fTemp151);
        this.fRec19[0] = 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec20[0] + (-234881024 - ((iSlow128) ? _icast(5.9604645e-08 * _fcast(this.iRec20[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow129 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec27[0] + this.fRec19[1] * fSlow136));
        const iTemp152: i32 = ((iTemp2) ? 0 : this.iRec28[1]);
        const iTemp153: i32 = ((iTemp0) ? ((iSlow161 == iTemp152 ? 1 : 0) ? iSlow164 : 0) : ((iTemp2) ? iSlow159 : this.iRec34[1]));
        const iTemp154: i32 = iTemp153 != 0;
        const iTemp155: i32 = (iTemp154 & (iTemp153 <= 1 ? 1 : 0)) >= 1;
        const iTemp156: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec29[1]));
        const iTemp157: i32 = iTemp156 + 1;
        const iTemp158: i32 = ((iTemp155) ? iTemp157 : iTemp156);
        const iTemp159: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec33[1]));
        const iTemp160: i32 = ((iTemp158 < 3 ? 1 : 0) | ((iTemp158 < 4 ? 1 : 0) & (iTemp159 ^ -1))) >= 1;
        const iTemp161: i32 = (iTemp157 < 4 ? 1 : 0) >= 1;
        const iTemp162: i32 = iTemp157 >= 2;
        const iTemp163: i32 = iTemp157 >= 1;
        const iTemp164: i32 = iTemp157 >= 3;
        const fTemp165: f32 = ((iTemp162) ? ((iTemp164) ? fSlow160 : fSlow166) : ((iTemp163) ? fSlow165 : fSlow137));
        const iTemp166: i32 = _icast(Mathf.max(16.0, fSlow148 + _fcast((_icast(((fTemp165 >= 2e+01 ? 1 : 0) ? fTemp165 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp165)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp167: i32 = iTemp157 == 0;
        const iTemp168: i32 = fTemp165 == 0.0;
        const fTemp169: f32 = ((iTemp162) ? ((iTemp164) ? fSlow162 : fSlow168) : ((iTemp163) ? fSlow167 : fSlow151));
        const fTemp170: f32 = Mathf.min(fSlow155 + fTemp169, 99.0);
        const iTemp171: i32 = fTemp170 < 77.0;
        const fTemp172: f32 = ((iTemp171) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp170)), 76))]) : 2e+01 * (99.0 - fTemp170));
        const iTemp173: i32 = ((iTemp155) ? ((iTemp161) ? (((iTemp166 == iTemp152 ? 1 : 0) | (iTemp167 & iTemp168)) ? _icast(this.fConst1 * (((iTemp171 & iTemp167) & iTemp168) ? 0.05 * fTemp172 : fTemp172)) : 0) : 0) : iTemp153 - ((iTemp154) ? 1 : 0));
        const iTemp174: i32 = ((iTemp0) ? iSlow161 > iTemp152 : ((iTemp2) ? iSlow169 : this.iRec31[1]));
        const iTemp175: i32 = ((iTemp155) ? ((iTemp161) ? iTemp166 > iTemp152 : iTemp174) : iTemp174);
        const iTemp176: i32 = (iTemp173 == 0 ? 1 : 0) * ((iTemp175 == 0 ? 1 : 0) + 1);
        const iTemp177: i32 = iTemp176 >= 2;
        const iTemp178: i32 = iTemp176 >= 1;
        const iTemp179: i32 = max<i32>(112459776, iTemp152);
        const iTemp180: i32 = ((iTemp0) ? iSlow173 : ((iTemp2) ? iSlow171 : this.iRec32[1]));
        const iTemp181: i32 = min<i32>(63, iSlow154 + ((41 * _icast(fTemp169)) >> 6));
        const iTemp182: i32 = ((iTemp155) ? ((iTemp161) ? _icast(this.fConst1 * _fcast(((iTemp181 & 3) + 4) << ((iTemp181 >> 2) + 2))) : iTemp180) : iTemp180);
        const iTemp183: i32 = iTemp179 + ((285212672 - iTemp179) >> 24) * iTemp182;
        const iTemp184: i32 = ((iTemp0) ? iSlow161 : ((iTemp2) ? iSlow149 : this.iRec30[1]));
        const iTemp185: i32 = ((iTemp155) ? ((iTemp161) ? iTemp166 : iTemp184) : iTemp184);
        const iTemp186: i32 = (iTemp183 >= iTemp185 ? 1 : 0) >= 1;
        const iTemp187: i32 = iTemp152 - iTemp182;
        const iTemp188: i32 = (iTemp187 <= iTemp185 ? 1 : 0) >= 1;
        this.iRec28[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp185 : iTemp187) : ((iTemp178) ? ((iTemp186) ? iTemp185 : iTemp183) : iTemp152)) : iTemp152);
        const iTemp189: i32 = iTemp158 + 1;
        this.iRec29[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp189 : iTemp158) : ((iTemp178) ? ((iTemp186) ? iTemp189 : iTemp158) : iTemp158)) : iTemp158);
        const iTemp190: i32 = (iTemp189 < 4 ? 1 : 0) >= 1;
        const iTemp191: i32 = iTemp189 >= 2;
        const iTemp192: i32 = iTemp189 >= 1;
        const iTemp193: i32 = iTemp189 >= 3;
        const fTemp194: f32 = ((iTemp191) ? ((iTemp193) ? fSlow160 : fSlow166) : ((iTemp192) ? fSlow165 : fSlow137));
        const iTemp195: i32 = _icast(Mathf.max(16.0, fSlow148 + _fcast((_icast(((fTemp194 >= 2e+01 ? 1 : 0) ? fTemp194 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp194)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp196: i32 = ((iTemp190) ? iTemp195 : iTemp185);
        this.iRec30[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp196 : iTemp185) : ((iTemp178) ? ((iTemp186) ? iTemp196 : iTemp185) : iTemp185)) : iTemp185);
        const iTemp197: i32 = ((iTemp190) ? iTemp195 > iTemp185 : iTemp175);
        this.iRec31[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp197 : iTemp175) : ((iTemp178) ? ((iTemp186) ? iTemp197 : iTemp175) : iTemp175)) : iTemp175);
        const fTemp198: f32 = ((iTemp191) ? ((iTemp193) ? fSlow162 : fSlow168) : ((iTemp192) ? fSlow167 : fSlow151));
        const iTemp199: i32 = min<i32>(63, iSlow154 + ((41 * _icast(fTemp198)) >> 6));
        const iTemp200: i32 = ((iTemp190) ? _icast(this.fConst1 * _fcast(((iTemp199 & 3) + 4) << ((iTemp199 >> 2) + 2))) : iTemp182);
        this.iRec32[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp200 : iTemp182) : ((iTemp178) ? ((iTemp186) ? iTemp200 : iTemp182) : iTemp182)) : iTemp182);
        this.iRec33[0] = iTemp159;
        const iTemp201: i32 = iTemp189 == 0;
        const iTemp202: i32 = fTemp194 == 0.0;
        const fTemp203: f32 = Mathf.min(fSlow155 + fTemp198, 99.0);
        const iTemp204: i32 = fTemp203 < 77.0;
        const fTemp205: f32 = ((iTemp204) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp203)), 76))]) : 2e+01 * (99.0 - fTemp203));
        const iTemp206: i32 = ((iTemp190) ? (((iTemp195 == iTemp185 ? 1 : 0) | (iTemp201 & iTemp202)) ? _icast(this.fConst1 * (((iTemp204 & iTemp201) & iTemp202) ? 0.05 * fTemp205 : fTemp205)) : 0) : iTemp173);
        this.iRec34[0] = ((iTemp160) ? ((iTemp177) ? ((iTemp188) ? iTemp206 : iTemp173) : ((iTemp178) ? ((iTemp186) ? iTemp206 : iTemp173) : iTemp173)) : iTemp173);
        const fTemp207: f32 = ((iTemp70) ? 0.0 : this.fRec35[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow181 + ((iSlow177) ? 0.0 : fTemp94))));
        this.fRec35[0] = fTemp207 - Mathf.floor(fTemp207);
        const iTemp208: i32 = ((iTemp2) ? 0 : this.iRec36[1]);
        const iTemp209: i32 = ((iTemp0) ? ((iSlow206 == iTemp208 ? 1 : 0) ? iSlow209 : 0) : ((iTemp2) ? iSlow204 : this.iRec42[1]));
        const iTemp210: i32 = iTemp209 != 0;
        const iTemp211: i32 = (iTemp210 & (iTemp209 <= 1 ? 1 : 0)) >= 1;
        const iTemp212: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec37[1]));
        const iTemp213: i32 = iTemp212 + 1;
        const iTemp214: i32 = ((iTemp211) ? iTemp213 : iTemp212);
        const iTemp215: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec41[1]));
        const iTemp216: i32 = ((iTemp214 < 3 ? 1 : 0) | ((iTemp214 < 4 ? 1 : 0) & (iTemp215 ^ -1))) >= 1;
        const iTemp217: i32 = (iTemp213 < 4 ? 1 : 0) >= 1;
        const iTemp218: i32 = iTemp213 >= 2;
        const iTemp219: i32 = iTemp213 >= 1;
        const iTemp220: i32 = iTemp213 >= 3;
        const fTemp221: f32 = ((iTemp218) ? ((iTemp220) ? fSlow205 : fSlow211) : ((iTemp219) ? fSlow210 : fSlow182));
        const iTemp222: i32 = _icast(Mathf.max(16.0, fSlow193 + _fcast((_icast(((fTemp221 >= 2e+01 ? 1 : 0) ? fTemp221 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp221)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp223: i32 = iTemp213 == 0;
        const iTemp224: i32 = fTemp221 == 0.0;
        const fTemp225: f32 = ((iTemp218) ? ((iTemp220) ? fSlow207 : fSlow213) : ((iTemp219) ? fSlow212 : fSlow196));
        const fTemp226: f32 = Mathf.min(fSlow200 + fTemp225, 99.0);
        const iTemp227: i32 = fTemp226 < 77.0;
        const fTemp228: f32 = ((iTemp227) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp226)), 76))]) : 2e+01 * (99.0 - fTemp226));
        const iTemp229: i32 = ((iTemp211) ? ((iTemp217) ? (((iTemp222 == iTemp208 ? 1 : 0) | (iTemp223 & iTemp224)) ? _icast(this.fConst1 * (((iTemp227 & iTemp223) & iTemp224) ? 0.05 * fTemp228 : fTemp228)) : 0) : 0) : iTemp209 - ((iTemp210) ? 1 : 0));
        const iTemp230: i32 = ((iTemp0) ? iSlow206 > iTemp208 : ((iTemp2) ? iSlow214 : this.iRec39[1]));
        const iTemp231: i32 = ((iTemp211) ? ((iTemp217) ? iTemp222 > iTemp208 : iTemp230) : iTemp230);
        const iTemp232: i32 = (iTemp229 == 0 ? 1 : 0) * ((iTemp231 == 0 ? 1 : 0) + 1);
        const iTemp233: i32 = iTemp232 >= 2;
        const iTemp234: i32 = iTemp232 >= 1;
        const iTemp235: i32 = max<i32>(112459776, iTemp208);
        const iTemp236: i32 = ((iTemp0) ? iSlow218 : ((iTemp2) ? iSlow216 : this.iRec40[1]));
        const iTemp237: i32 = min<i32>(63, iSlow199 + ((41 * _icast(fTemp225)) >> 6));
        const iTemp238: i32 = ((iTemp211) ? ((iTemp217) ? _icast(this.fConst1 * _fcast(((iTemp237 & 3) + 4) << ((iTemp237 >> 2) + 2))) : iTemp236) : iTemp236);
        const iTemp239: i32 = iTemp235 + ((285212672 - iTemp235) >> 24) * iTemp238;
        const iTemp240: i32 = ((iTemp0) ? iSlow206 : ((iTemp2) ? iSlow194 : this.iRec38[1]));
        const iTemp241: i32 = ((iTemp211) ? ((iTemp217) ? iTemp222 : iTemp240) : iTemp240);
        const iTemp242: i32 = (iTemp239 >= iTemp241 ? 1 : 0) >= 1;
        const iTemp243: i32 = iTemp208 - iTemp238;
        const iTemp244: i32 = (iTemp243 <= iTemp241 ? 1 : 0) >= 1;
        this.iRec36[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp241 : iTemp243) : ((iTemp234) ? ((iTemp242) ? iTemp241 : iTemp239) : iTemp208)) : iTemp208);
        const iTemp245: i32 = iTemp214 + 1;
        this.iRec37[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp245 : iTemp214) : ((iTemp234) ? ((iTemp242) ? iTemp245 : iTemp214) : iTemp214)) : iTemp214);
        const iTemp246: i32 = (iTemp245 < 4 ? 1 : 0) >= 1;
        const iTemp247: i32 = iTemp245 >= 2;
        const iTemp248: i32 = iTemp245 >= 1;
        const iTemp249: i32 = iTemp245 >= 3;
        const fTemp250: f32 = ((iTemp247) ? ((iTemp249) ? fSlow205 : fSlow211) : ((iTemp248) ? fSlow210 : fSlow182));
        const iTemp251: i32 = _icast(Mathf.max(16.0, fSlow193 + _fcast((_icast(((fTemp250 >= 2e+01 ? 1 : 0) ? fTemp250 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp250)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp252: i32 = ((iTemp246) ? iTemp251 : iTemp241);
        this.iRec38[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp252 : iTemp241) : ((iTemp234) ? ((iTemp242) ? iTemp252 : iTemp241) : iTemp241)) : iTemp241);
        const iTemp253: i32 = ((iTemp246) ? iTemp251 > iTemp241 : iTemp231);
        this.iRec39[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp253 : iTemp231) : ((iTemp234) ? ((iTemp242) ? iTemp253 : iTemp231) : iTemp231)) : iTemp231);
        const fTemp254: f32 = ((iTemp247) ? ((iTemp249) ? fSlow207 : fSlow213) : ((iTemp248) ? fSlow212 : fSlow196));
        const iTemp255: i32 = min<i32>(63, iSlow199 + ((41 * _icast(fTemp254)) >> 6));
        const iTemp256: i32 = ((iTemp246) ? _icast(this.fConst1 * _fcast(((iTemp255 & 3) + 4) << ((iTemp255 >> 2) + 2))) : iTemp238);
        this.iRec40[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp256 : iTemp238) : ((iTemp234) ? ((iTemp242) ? iTemp256 : iTemp238) : iTemp238)) : iTemp238);
        this.iRec41[0] = iTemp215;
        const iTemp257: i32 = iTemp245 == 0;
        const iTemp258: i32 = fTemp250 == 0.0;
        const fTemp259: f32 = Mathf.min(fSlow200 + fTemp254, 99.0);
        const iTemp260: i32 = fTemp259 < 77.0;
        const fTemp261: f32 = ((iTemp260) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp259)), 76))]) : 2e+01 * (99.0 - fTemp259));
        const iTemp262: i32 = ((iTemp246) ? (((iTemp251 == iTemp241 ? 1 : 0) | (iTemp257 & iTemp258)) ? _icast(this.fConst1 * (((iTemp260 & iTemp257) & iTemp258) ? 0.05 * fTemp261 : fTemp261)) : 0) : iTemp229);
        this.iRec42[0] = ((iTemp216) ? ((iTemp233) ? ((iTemp244) ? iTemp262 : iTemp229) : ((iTemp234) ? ((iTemp242) ? iTemp262 : iTemp229) : iTemp229)) : iTemp229);
        const fTemp263: f32 = ((iTemp70) ? 0.0 : this.fRec43[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow226 + ((iSlow222) ? 0.0 : fTemp94))));
        this.fRec43[0] = fTemp263 - Mathf.floor(fTemp263);
        const iTemp264: i32 = ((iTemp2) ? 0 : this.iRec44[1]);
        const iTemp265: i32 = ((iTemp0) ? ((iSlow251 == iTemp264 ? 1 : 0) ? iSlow254 : 0) : ((iTemp2) ? iSlow249 : this.iRec50[1]));
        const iTemp266: i32 = iTemp265 != 0;
        const iTemp267: i32 = (iTemp266 & (iTemp265 <= 1 ? 1 : 0)) >= 1;
        const iTemp268: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec45[1]));
        const iTemp269: i32 = iTemp268 + 1;
        const iTemp270: i32 = ((iTemp267) ? iTemp269 : iTemp268);
        const iTemp271: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec49[1]));
        const iTemp272: i32 = ((iTemp270 < 3 ? 1 : 0) | ((iTemp270 < 4 ? 1 : 0) & (iTemp271 ^ -1))) >= 1;
        const iTemp273: i32 = (iTemp269 < 4 ? 1 : 0) >= 1;
        const iTemp274: i32 = iTemp269 >= 2;
        const iTemp275: i32 = iTemp269 >= 1;
        const iTemp276: i32 = iTemp269 >= 3;
        const fTemp277: f32 = ((iTemp274) ? ((iTemp276) ? fSlow250 : fSlow256) : ((iTemp275) ? fSlow255 : fSlow227));
        const iTemp278: i32 = _icast(Mathf.max(16.0, fSlow238 + _fcast((_icast(((fTemp277 >= 2e+01 ? 1 : 0) ? fTemp277 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp277)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp279: i32 = iTemp269 == 0;
        const iTemp280: i32 = fTemp277 == 0.0;
        const fTemp281: f32 = ((iTemp274) ? ((iTemp276) ? fSlow252 : fSlow258) : ((iTemp275) ? fSlow257 : fSlow241));
        const fTemp282: f32 = Mathf.min(fSlow245 + fTemp281, 99.0);
        const iTemp283: i32 = fTemp282 < 77.0;
        const fTemp284: f32 = ((iTemp283) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp282)), 76))]) : 2e+01 * (99.0 - fTemp282));
        const iTemp285: i32 = ((iTemp267) ? ((iTemp273) ? (((iTemp278 == iTemp264 ? 1 : 0) | (iTemp279 & iTemp280)) ? _icast(this.fConst1 * (((iTemp283 & iTemp279) & iTemp280) ? 0.05 * fTemp284 : fTemp284)) : 0) : 0) : iTemp265 - ((iTemp266) ? 1 : 0));
        const iTemp286: i32 = ((iTemp0) ? iSlow251 > iTemp264 : ((iTemp2) ? iSlow259 : this.iRec47[1]));
        const iTemp287: i32 = ((iTemp267) ? ((iTemp273) ? iTemp278 > iTemp264 : iTemp286) : iTemp286);
        const iTemp288: i32 = (iTemp285 == 0 ? 1 : 0) * ((iTemp287 == 0 ? 1 : 0) + 1);
        const iTemp289: i32 = iTemp288 >= 2;
        const iTemp290: i32 = iTemp288 >= 1;
        const iTemp291: i32 = max<i32>(112459776, iTemp264);
        const iTemp292: i32 = ((iTemp0) ? iSlow263 : ((iTemp2) ? iSlow261 : this.iRec48[1]));
        const iTemp293: i32 = min<i32>(63, iSlow244 + ((41 * _icast(fTemp281)) >> 6));
        const iTemp294: i32 = ((iTemp267) ? ((iTemp273) ? _icast(this.fConst1 * _fcast(((iTemp293 & 3) + 4) << ((iTemp293 >> 2) + 2))) : iTemp292) : iTemp292);
        const iTemp295: i32 = iTemp291 + ((285212672 - iTemp291) >> 24) * iTemp294;
        const iTemp296: i32 = ((iTemp0) ? iSlow251 : ((iTemp2) ? iSlow239 : this.iRec46[1]));
        const iTemp297: i32 = ((iTemp267) ? ((iTemp273) ? iTemp278 : iTemp296) : iTemp296);
        const iTemp298: i32 = (iTemp295 >= iTemp297 ? 1 : 0) >= 1;
        const iTemp299: i32 = iTemp264 - iTemp294;
        const iTemp300: i32 = (iTemp299 <= iTemp297 ? 1 : 0) >= 1;
        this.iRec44[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp297 : iTemp299) : ((iTemp290) ? ((iTemp298) ? iTemp297 : iTemp295) : iTemp264)) : iTemp264);
        const iTemp301: i32 = iTemp270 + 1;
        this.iRec45[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp301 : iTemp270) : ((iTemp290) ? ((iTemp298) ? iTemp301 : iTemp270) : iTemp270)) : iTemp270);
        const iTemp302: i32 = (iTemp301 < 4 ? 1 : 0) >= 1;
        const iTemp303: i32 = iTemp301 >= 2;
        const iTemp304: i32 = iTemp301 >= 1;
        const iTemp305: i32 = iTemp301 >= 3;
        const fTemp306: f32 = ((iTemp303) ? ((iTemp305) ? fSlow250 : fSlow256) : ((iTemp304) ? fSlow255 : fSlow227));
        const iTemp307: i32 = _icast(Mathf.max(16.0, fSlow238 + _fcast((_icast(((fTemp306 >= 2e+01 ? 1 : 0) ? fTemp306 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp306)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp308: i32 = ((iTemp302) ? iTemp307 : iTemp297);
        this.iRec46[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp308 : iTemp297) : ((iTemp290) ? ((iTemp298) ? iTemp308 : iTemp297) : iTemp297)) : iTemp297);
        const iTemp309: i32 = ((iTemp302) ? iTemp307 > iTemp297 : iTemp287);
        this.iRec47[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp309 : iTemp287) : ((iTemp290) ? ((iTemp298) ? iTemp309 : iTemp287) : iTemp287)) : iTemp287);
        const fTemp310: f32 = ((iTemp303) ? ((iTemp305) ? fSlow252 : fSlow258) : ((iTemp304) ? fSlow257 : fSlow241));
        const iTemp311: i32 = min<i32>(63, iSlow244 + ((41 * _icast(fTemp310)) >> 6));
        const iTemp312: i32 = ((iTemp302) ? _icast(this.fConst1 * _fcast(((iTemp311 & 3) + 4) << ((iTemp311 >> 2) + 2))) : iTemp294);
        this.iRec48[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp312 : iTemp294) : ((iTemp290) ? ((iTemp298) ? iTemp312 : iTemp294) : iTemp294)) : iTemp294);
        this.iRec49[0] = iTemp271;
        const iTemp313: i32 = iTemp301 == 0;
        const iTemp314: i32 = fTemp306 == 0.0;
        const fTemp315: f32 = Mathf.min(fSlow245 + fTemp310, 99.0);
        const iTemp316: i32 = fTemp315 < 77.0;
        const fTemp317: f32 = ((iTemp316) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp315)), 76))]) : 2e+01 * (99.0 - fTemp315));
        const iTemp318: i32 = ((iTemp302) ? (((iTemp307 == iTemp297 ? 1 : 0) | (iTemp313 & iTemp314)) ? _icast(this.fConst1 * (((iTemp316 & iTemp313) & iTemp314) ? 0.05 * fTemp317 : fTemp317)) : 0) : iTemp285);
        this.iRec50[0] = ((iTemp272) ? ((iTemp289) ? ((iTemp300) ? iTemp318 : iTemp285) : ((iTemp290) ? ((iTemp298) ? iTemp318 : iTemp285) : iTemp285)) : iTemp285);
        const fTemp319: f32 = ((iTemp70) ? 0.0 : this.fRec51[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow271 + ((iSlow267) ? 0.0 : fTemp94))));
        this.fRec51[0] = fTemp319 - Mathf.floor(fTemp319);
        const fTemp320: f32 = 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec44[0] + (-234881024 - ((iSlow265) ? _icast(5.9604645e-08 * _fcast(this.iRec44[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow266 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec51[0]);
        const iTemp321: i32 = ((iTemp2) ? 0 : this.iRec52[1]);
        const iTemp322: i32 = ((iTemp0) ? ((iSlow296 == iTemp321 ? 1 : 0) ? iSlow299 : 0) : ((iTemp2) ? iSlow294 : this.iRec58[1]));
        const iTemp323: i32 = iTemp322 != 0;
        const iTemp324: i32 = (iTemp323 & (iTemp322 <= 1 ? 1 : 0)) >= 1;
        const iTemp325: i32 = ((iTemp0) ? 3 : ((iTemp2) ? 0 : this.iRec53[1]));
        const iTemp326: i32 = iTemp325 + 1;
        const iTemp327: i32 = ((iTemp324) ? iTemp326 : iTemp325);
        const iTemp328: i32 = ((iTemp0) ? 0 : ((iTemp2) ? 1 : this.iRec57[1]));
        const iTemp329: i32 = ((iTemp327 < 3 ? 1 : 0) | ((iTemp327 < 4 ? 1 : 0) & (iTemp328 ^ -1))) >= 1;
        const iTemp330: i32 = (iTemp326 < 4 ? 1 : 0) >= 1;
        const iTemp331: i32 = iTemp326 >= 2;
        const iTemp332: i32 = iTemp326 >= 1;
        const iTemp333: i32 = iTemp326 >= 3;
        const fTemp334: f32 = ((iTemp331) ? ((iTemp333) ? fSlow295 : fSlow301) : ((iTemp332) ? fSlow300 : fSlow272));
        const iTemp335: i32 = _icast(Mathf.max(16.0, fSlow283 + _fcast((_icast(((fTemp334 >= 2e+01 ? 1 : 0) ? fTemp334 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp334)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp336: i32 = iTemp326 == 0;
        const iTemp337: i32 = fTemp334 == 0.0;
        const fTemp338: f32 = ((iTemp331) ? ((iTemp333) ? fSlow297 : fSlow303) : ((iTemp332) ? fSlow302 : fSlow286));
        const fTemp339: f32 = Mathf.min(fSlow290 + fTemp338, 99.0);
        const iTemp340: i32 = fTemp339 < 77.0;
        const fTemp341: f32 = ((iTemp340) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp339)), 76))]) : 2e+01 * (99.0 - fTemp339));
        const iTemp342: i32 = ((iTemp324) ? ((iTemp330) ? (((iTemp335 == iTemp321 ? 1 : 0) | (iTemp336 & iTemp337)) ? _icast(this.fConst1 * (((iTemp340 & iTemp336) & iTemp337) ? 0.05 * fTemp341 : fTemp341)) : 0) : 0) : iTemp322 - ((iTemp323) ? 1 : 0));
        const iTemp343: i32 = ((iTemp0) ? iSlow296 > iTemp321 : ((iTemp2) ? iSlow304 : this.iRec55[1]));
        const iTemp344: i32 = ((iTemp324) ? ((iTemp330) ? iTemp335 > iTemp321 : iTemp343) : iTemp343);
        const iTemp345: i32 = (iTemp342 == 0 ? 1 : 0) * ((iTemp344 == 0 ? 1 : 0) + 1);
        const iTemp346: i32 = iTemp345 >= 2;
        const iTemp347: i32 = iTemp345 >= 1;
        const iTemp348: i32 = max<i32>(112459776, iTemp321);
        const iTemp349: i32 = ((iTemp0) ? iSlow308 : ((iTemp2) ? iSlow306 : this.iRec56[1]));
        const iTemp350: i32 = min<i32>(63, iSlow289 + ((41 * _icast(fTemp338)) >> 6));
        const iTemp351: i32 = ((iTemp324) ? ((iTemp330) ? _icast(this.fConst1 * _fcast(((iTemp350 & 3) + 4) << ((iTemp350 >> 2) + 2))) : iTemp349) : iTemp349);
        const iTemp352: i32 = iTemp348 + ((285212672 - iTemp348) >> 24) * iTemp351;
        const iTemp353: i32 = ((iTemp0) ? iSlow296 : ((iTemp2) ? iSlow284 : this.iRec54[1]));
        const iTemp354: i32 = ((iTemp324) ? ((iTemp330) ? iTemp335 : iTemp353) : iTemp353);
        const iTemp355: i32 = (iTemp352 >= iTemp354 ? 1 : 0) >= 1;
        const iTemp356: i32 = iTemp321 - iTemp351;
        const iTemp357: i32 = (iTemp356 <= iTemp354 ? 1 : 0) >= 1;
        this.iRec52[0] = ((iTemp329) ? ((iTemp346) ? ((iTemp357) ? iTemp354 : iTemp356) : ((iTemp347) ? ((iTemp355) ? iTemp354 : iTemp352) : iTemp321)) : iTemp321);
        const iTemp358: i32 = iTemp327 + 1;
        this.iRec53[0] = ((iTemp329) ? ((iTemp346) ? ((iTemp357) ? iTemp358 : iTemp327) : ((iTemp347) ? ((iTemp355) ? iTemp358 : iTemp327) : iTemp327)) : iTemp327);
        const iTemp359: i32 = (iTemp358 < 4 ? 1 : 0) >= 1;
        const iTemp360: i32 = iTemp358 >= 2;
        const iTemp361: i32 = iTemp358 >= 1;
        const iTemp362: i32 = iTemp358 >= 3;
        const fTemp363: f32 = ((iTemp360) ? ((iTemp362) ? fSlow295 : fSlow301) : ((iTemp361) ? fSlow300 : fSlow272));
        const iTemp364: i32 = _icast(Mathf.max(16.0, fSlow283 + _fcast((_icast(((fTemp363 >= 2e+01 ? 1 : 0) ? fTemp363 + 28.0 : _fcast(Dx7_alg21_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp363)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp365: i32 = ((iTemp359) ? iTemp364 : iTemp354);
        this.iRec54[0] = ((iTemp329) ? ((iTemp346) ? ((iTemp357) ? iTemp365 : iTemp354) : ((iTemp347) ? ((iTemp355) ? iTemp365 : iTemp354) : iTemp354)) : iTemp354);
        const iTemp366: i32 = ((iTemp359) ? iTemp364 > iTemp354 : iTemp344);
        this.iRec55[0] = ((iTemp329) ? ((iTemp346) ? ((iTemp357) ? iTemp366 : iTemp344) : ((iTemp347) ? ((iTemp355) ? iTemp366 : iTemp344) : iTemp344)) : iTemp344);
        const fTemp367: f32 = ((iTemp360) ? ((iTemp362) ? fSlow297 : fSlow303) : ((iTemp361) ? fSlow302 : fSlow286));
        const iTemp368: i32 = min<i32>(63, iSlow289 + ((41 * _icast(fTemp367)) >> 6));
        const iTemp369: i32 = ((iTemp359) ? _icast(this.fConst1 * _fcast(((iTemp368 & 3) + 4) << ((iTemp368 >> 2) + 2))) : iTemp351);
        this.iRec56[0] = ((iTemp329) ? ((iTemp346) ? ((iTemp357) ? iTemp369 : iTemp351) : ((iTemp347) ? ((iTemp355) ? iTemp369 : iTemp351) : iTemp351)) : iTemp351);
        this.iRec57[0] = iTemp328;
        const iTemp370: i32 = iTemp358 == 0;
        const iTemp371: i32 = fTemp363 == 0.0;
        const fTemp372: f32 = Mathf.min(fSlow290 + fTemp367, 99.0);
        const iTemp373: i32 = fTemp372 < 77.0;
        const fTemp374: f32 = ((iTemp373) ? _fcast(Dx7_alg21_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp372)), 76))]) : 2e+01 * (99.0 - fTemp372));
        const iTemp375: i32 = ((iTemp359) ? (((iTemp364 == iTemp354 ? 1 : 0) | (iTemp370 & iTemp371)) ? _icast(this.fConst1 * (((iTemp373 & iTemp370) & iTemp371) ? 0.05 * fTemp374 : fTemp374)) : 0) : iTemp342);
        this.iRec58[0] = ((iTemp329) ? ((iTemp346) ? ((iTemp357) ? iTemp375 : iTemp342) : ((iTemp347) ? ((iTemp355) ? iTemp375 : iTemp342) : iTemp342)) : iTemp342);
        const fTemp376: f32 = ((iTemp70) ? 0.0 : this.fRec59[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow316 + ((iSlow312) ? 0.0 : fTemp94))));
        this.fRec59[0] = fTemp376 - Mathf.floor(fTemp376);
        const fTemp377: f32 = 0.5 * (Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec0[0] + (-234881024 - ((iSlow48) ? _icast(5.9604645e-08 * _fcast(this.iRec0[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow65 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec12[0] + this.fRec19[0])) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec28[0] + (-234881024 - ((iSlow175) ? _icast(5.9604645e-08 * _fcast(this.iRec28[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow176 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec19[0] + this.fRec35[0])) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec36[0] + (-234881024 - ((iSlow220) ? _icast(5.9604645e-08 * _fcast(this.iRec36[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow221 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec43[0] + fTemp320)) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec52[0] + (-234881024 - ((iSlow310) ? _icast(5.9604645e-08 * _fcast(this.iRec52[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow311 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec59[0] + fTemp320)));
        const output: f32 = (fTemp377);

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
        this.iRec20[1] = this.iRec20[0];
        this.iRec21[1] = this.iRec21[0];
        this.iRec22[1] = this.iRec22[0];
        this.iRec23[1] = this.iRec23[0];
        this.iRec24[1] = this.iRec24[0];
        this.iRec25[1] = this.iRec25[0];
        this.iRec26[1] = this.iRec26[0];
        this.fRec27[1] = this.fRec27[0];
        this.fRec19[1] = this.fRec19[0];
        this.iRec28[1] = this.iRec28[0];
        this.iRec29[1] = this.iRec29[0];
        this.iRec30[1] = this.iRec30[0];
        this.iRec31[1] = this.iRec31[0];
        this.iRec32[1] = this.iRec32[0];
        this.iRec33[1] = this.iRec33[0];
        this.iRec34[1] = this.iRec34[0];
        this.fRec35[1] = this.fRec35[0];
        this.iRec36[1] = this.iRec36[0];
        this.iRec37[1] = this.iRec37[0];
        this.iRec38[1] = this.iRec38[0];
        this.iRec39[1] = this.iRec39[0];
        this.iRec40[1] = this.iRec40[0];
        this.iRec41[1] = this.iRec41[0];
        this.iRec42[1] = this.iRec42[0];
        this.fRec43[1] = this.fRec43[0];
        this.iRec44[1] = this.iRec44[0];
        this.iRec45[1] = this.iRec45[0];
        this.iRec46[1] = this.iRec46[0];
        this.iRec47[1] = this.iRec47[0];
        this.iRec48[1] = this.iRec48[0];
        this.iRec49[1] = this.iRec49[0];
        this.iRec50[1] = this.iRec50[0];
        this.fRec51[1] = this.fRec51[0];
        this.iRec52[1] = this.iRec52[0];
        this.iRec53[1] = this.iRec53[0];
        this.iRec54[1] = this.iRec54[0];
        this.iRec55[1] = this.iRec55[0];
        this.iRec56[1] = this.iRec56[0];
        this.iRec57[1] = this.iRec57[0];
        this.iRec58[1] = this.iRec58[0];
        this.fRec59[1] = this.fRec59[0];

        if (Mathf.abs(output) < 0.00001) {
            this.silentSamples++;
        } else {
            this.silentSamples = 0;
        }

        this.channel.signal.addMonoSignal(output, 0.5, 0.5);
    }
}

export class Dx7_alg21Channel extends MidiChannel {
    private _nrpnMsb: u8 = 127;
    private _nrpnLsb: u8 = 127;

    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case 99: this._nrpnMsb = value; break;
            case 98: this._nrpnLsb = value; break;
            case 6:
                this._setParam(<u16>this._nrpnMsb * 128 + <u16>this._nrpnLsb, value);
                break;
        }
    }

    private _setParam(param: u16, value: u8): void {
        switch (param) {
            case 0: dx7_alg21_fHslider54 = <f32>value / 127.0 * 7; break;
            case 1: dx7_alg21_fHslider2 = -24 + <f32>value / 127.0 * 48; break;
            case 2: dx7_alg21_fHslider22 = <f32>value / 127.0; break;
            case 3: dx7_alg21_fHslider27 = <f32>value / 127.0 * 99; break;
            case 4: dx7_alg21_fHslider30 = <f32>value / 127.0 * 99; break;
            case 5: dx7_alg21_fHslider31 = <f32>value / 127.0 * 99; break;
            case 6: dx7_alg21_fHslider26 = <f32>value / 127.0 * 99; break;
            case 7: dx7_alg21_fHslider29 = <f32>value / 127.0 * 99; break;
            case 8: dx7_alg21_fHslider32 = <f32>value / 127.0 * 99; break;
            case 9: dx7_alg21_fHslider33 = <f32>value / 127.0 * 99; break;
            case 10: dx7_alg21_fHslider28 = <f32>value / 127.0 * 99; break;
            case 11: dx7_alg21_fEntry2 = <f32>value / 127.0 * 5; break;
            case 12: dx7_alg21_fHslider20 = <f32>value / 127.0 * 99; break;
            case 13: dx7_alg21_fHslider21 = <f32>value / 127.0 * 99; break;
            case 14: dx7_alg21_fHslider34 = <f32>value / 127.0 * 99; break;
            case 15: dx7_alg21_fHslider18 = <f32>value / 127.0 * 99; break;
            case 16: dx7_alg21_fHslider19 = <f32>value / 127.0; break;
            case 17: dx7_alg21_fHslider35 = <f32>value / 127.0 * 7; break;
            case 18: dx7_alg21_fHslider23 = -7 + <f32>value / 127.0 * 14; break;
            case 19: dx7_alg21_fHslider24 = <f32>value / 127.0 * 31; break;
            case 20: dx7_alg21_fHslider25 = <f32>value / 127.0 * 99; break;
            case 21: dx7_alg21_fHslider0 = <f32>value / 127.0 * 99; break;
            case 22: dx7_alg21_fHslider13 = <f32>value / 127.0 * 99; break;
            case 23: dx7_alg21_fHslider14 = <f32>value / 127.0 * 99; break;
            case 24: dx7_alg21_fHslider11 = <f32>value / 127.0 * 99; break;
            case 25: dx7_alg21_fHslider9 = <f32>value / 127.0 * 99; break;
            case 26: dx7_alg21_fHslider15 = <f32>value / 127.0 * 99; break;
            case 27: dx7_alg21_fHslider16 = <f32>value / 127.0 * 99; break;
            case 28: dx7_alg21_fHslider12 = <f32>value / 127.0 * 99; break;
            case 29: dx7_alg21_fHslider1 = <f32>value / 127.0 * 99; break;
            case 30: dx7_alg21_fHslider7 = <f32>value / 127.0 * 7; break;
            case 31: dx7_alg21_fHslider17 = <f32>value / 127.0 * 3; break;
            case 32: dx7_alg21_fHslider10 = <f32>value / 127.0 * 7; break;
            case 33: dx7_alg21_fHslider4 = <f32>value / 127.0 * 99; break;
            case 34: dx7_alg21_fHslider5 = <f32>value / 127.0 * 99; break;
            case 35: dx7_alg21_fHslider6 = <f32>value / 127.0 * 99; break;
            case 36: dx7_alg21_fEntry0 = <f32>value / 127.0 * 3; break;
            case 37: dx7_alg21_fEntry1 = <f32>value / 127.0 * 3; break;
            case 38: dx7_alg21_fHslider70 = -7 + <f32>value / 127.0 * 14; break;
            case 39: dx7_alg21_fHslider71 = <f32>value / 127.0 * 31; break;
            case 40: dx7_alg21_fHslider72 = <f32>value / 127.0 * 99; break;
            case 41: dx7_alg21_fHslider55 = <f32>value / 127.0 * 99; break;
            case 42: dx7_alg21_fHslider65 = <f32>value / 127.0 * 99; break;
            case 43: dx7_alg21_fHslider66 = <f32>value / 127.0 * 99; break;
            case 44: dx7_alg21_fHslider63 = <f32>value / 127.0 * 99; break;
            case 45: dx7_alg21_fHslider61 = <f32>value / 127.0 * 99; break;
            case 46: dx7_alg21_fHslider67 = <f32>value / 127.0 * 99; break;
            case 47: dx7_alg21_fHslider68 = <f32>value / 127.0 * 99; break;
            case 48: dx7_alg21_fHslider64 = <f32>value / 127.0 * 99; break;
            case 49: dx7_alg21_fHslider56 = <f32>value / 127.0 * 99; break;
            case 50: dx7_alg21_fHslider60 = <f32>value / 127.0 * 7; break;
            case 51: dx7_alg21_fHslider69 = <f32>value / 127.0 * 3; break;
            case 52: dx7_alg21_fHslider62 = <f32>value / 127.0 * 7; break;
            case 53: dx7_alg21_fHslider57 = <f32>value / 127.0 * 99; break;
            case 54: dx7_alg21_fHslider58 = <f32>value / 127.0 * 99; break;
            case 55: dx7_alg21_fHslider59 = <f32>value / 127.0 * 99; break;
            case 56: dx7_alg21_fEntry5 = <f32>value / 127.0 * 3; break;
            case 57: dx7_alg21_fEntry6 = <f32>value / 127.0 * 3; break;
            case 58: dx7_alg21_fHslider51 = -7 + <f32>value / 127.0 * 14; break;
            case 59: dx7_alg21_fHslider52 = <f32>value / 127.0 * 31; break;
            case 60: dx7_alg21_fHslider53 = <f32>value / 127.0 * 99; break;
            case 61: dx7_alg21_fHslider36 = <f32>value / 127.0 * 99; break;
            case 62: dx7_alg21_fHslider46 = <f32>value / 127.0 * 99; break;
            case 63: dx7_alg21_fHslider47 = <f32>value / 127.0 * 99; break;
            case 64: dx7_alg21_fHslider44 = <f32>value / 127.0 * 99; break;
            case 65: dx7_alg21_fHslider42 = <f32>value / 127.0 * 99; break;
            case 66: dx7_alg21_fHslider48 = <f32>value / 127.0 * 99; break;
            case 67: dx7_alg21_fHslider49 = <f32>value / 127.0 * 99; break;
            case 68: dx7_alg21_fHslider45 = <f32>value / 127.0 * 99; break;
            case 69: dx7_alg21_fHslider37 = <f32>value / 127.0 * 99; break;
            case 70: dx7_alg21_fHslider41 = <f32>value / 127.0 * 7; break;
            case 71: dx7_alg21_fHslider50 = <f32>value / 127.0 * 3; break;
            case 72: dx7_alg21_fHslider43 = <f32>value / 127.0 * 7; break;
            case 73: dx7_alg21_fHslider38 = <f32>value / 127.0 * 99; break;
            case 74: dx7_alg21_fHslider39 = <f32>value / 127.0 * 99; break;
            case 75: dx7_alg21_fHslider40 = <f32>value / 127.0 * 99; break;
            case 76: dx7_alg21_fEntry3 = <f32>value / 127.0 * 3; break;
            case 77: dx7_alg21_fEntry4 = <f32>value / 127.0 * 3; break;
            case 78: dx7_alg21_fHslider88 = -7 + <f32>value / 127.0 * 14; break;
            case 79: dx7_alg21_fHslider89 = <f32>value / 127.0 * 31; break;
            case 80: dx7_alg21_fHslider90 = <f32>value / 127.0 * 99; break;
            case 81: dx7_alg21_fHslider73 = <f32>value / 127.0 * 99; break;
            case 82: dx7_alg21_fHslider83 = <f32>value / 127.0 * 99; break;
            case 83: dx7_alg21_fHslider84 = <f32>value / 127.0 * 99; break;
            case 84: dx7_alg21_fHslider81 = <f32>value / 127.0 * 99; break;
            case 85: dx7_alg21_fHslider79 = <f32>value / 127.0 * 99; break;
            case 86: dx7_alg21_fHslider85 = <f32>value / 127.0 * 99; break;
            case 87: dx7_alg21_fHslider86 = <f32>value / 127.0 * 99; break;
            case 88: dx7_alg21_fHslider82 = <f32>value / 127.0 * 99; break;
            case 89: dx7_alg21_fHslider74 = <f32>value / 127.0 * 99; break;
            case 90: dx7_alg21_fHslider78 = <f32>value / 127.0 * 7; break;
            case 91: dx7_alg21_fHslider87 = <f32>value / 127.0 * 3; break;
            case 92: dx7_alg21_fHslider80 = <f32>value / 127.0 * 7; break;
            case 93: dx7_alg21_fHslider75 = <f32>value / 127.0 * 99; break;
            case 94: dx7_alg21_fHslider76 = <f32>value / 127.0 * 99; break;
            case 95: dx7_alg21_fHslider77 = <f32>value / 127.0 * 99; break;
            case 96: dx7_alg21_fEntry7 = <f32>value / 127.0 * 3; break;
            case 97: dx7_alg21_fEntry8 = <f32>value / 127.0 * 3; break;
            case 98: dx7_alg21_fHslider124 = -7 + <f32>value / 127.0 * 14; break;
            case 99: dx7_alg21_fHslider125 = <f32>value / 127.0 * 31; break;
            case 100: dx7_alg21_fHslider126 = <f32>value / 127.0 * 99; break;
            case 101: dx7_alg21_fHslider109 = <f32>value / 127.0 * 99; break;
            case 102: dx7_alg21_fHslider119 = <f32>value / 127.0 * 99; break;
            case 103: dx7_alg21_fHslider120 = <f32>value / 127.0 * 99; break;
            case 104: dx7_alg21_fHslider117 = <f32>value / 127.0 * 99; break;
            case 105: dx7_alg21_fHslider115 = <f32>value / 127.0 * 99; break;
            case 106: dx7_alg21_fHslider121 = <f32>value / 127.0 * 99; break;
            case 107: dx7_alg21_fHslider122 = <f32>value / 127.0 * 99; break;
            case 108: dx7_alg21_fHslider118 = <f32>value / 127.0 * 99; break;
            case 109: dx7_alg21_fHslider110 = <f32>value / 127.0 * 99; break;
            case 110: dx7_alg21_fHslider114 = <f32>value / 127.0 * 7; break;
            case 111: dx7_alg21_fHslider123 = <f32>value / 127.0 * 3; break;
            case 112: dx7_alg21_fHslider116 = <f32>value / 127.0 * 7; break;
            case 113: dx7_alg21_fHslider111 = <f32>value / 127.0 * 99; break;
            case 114: dx7_alg21_fHslider112 = <f32>value / 127.0 * 99; break;
            case 115: dx7_alg21_fHslider113 = <f32>value / 127.0 * 99; break;
            case 116: dx7_alg21_fEntry11 = <f32>value / 127.0 * 3; break;
            case 117: dx7_alg21_fEntry12 = <f32>value / 127.0 * 3; break;
            case 118: dx7_alg21_fHslider106 = -7 + <f32>value / 127.0 * 14; break;
            case 119: dx7_alg21_fHslider107 = <f32>value / 127.0 * 31; break;
            case 120: dx7_alg21_fHslider108 = <f32>value / 127.0 * 99; break;
            case 121: dx7_alg21_fHslider91 = <f32>value / 127.0 * 99; break;
            case 122: dx7_alg21_fHslider101 = <f32>value / 127.0 * 99; break;
            case 123: dx7_alg21_fHslider102 = <f32>value / 127.0 * 99; break;
            case 124: dx7_alg21_fHslider99 = <f32>value / 127.0 * 99; break;
            case 125: dx7_alg21_fHslider97 = <f32>value / 127.0 * 99; break;
            case 126: dx7_alg21_fHslider103 = <f32>value / 127.0 * 99; break;
            case 127: dx7_alg21_fHslider104 = <f32>value / 127.0 * 99; break;
            case 128: dx7_alg21_fHslider100 = <f32>value / 127.0 * 99; break;
            case 129: dx7_alg21_fHslider92 = <f32>value / 127.0 * 99; break;
            case 130: dx7_alg21_fHslider96 = <f32>value / 127.0 * 7; break;
            case 131: dx7_alg21_fHslider105 = <f32>value / 127.0 * 3; break;
            case 132: dx7_alg21_fHslider98 = <f32>value / 127.0 * 7; break;
            case 133: dx7_alg21_fHslider93 = <f32>value / 127.0 * 99; break;
            case 134: dx7_alg21_fHslider94 = <f32>value / 127.0 * 99; break;
            case 135: dx7_alg21_fHslider95 = <f32>value / 127.0 * 99; break;
            case 136: dx7_alg21_fEntry9 = <f32>value / 127.0 * 3; break;
            case 137: dx7_alg21_fEntry10 = <f32>value / 127.0 * 3; break;
        }
    }
}

// Feedback (NRPN 0)
let dx7_alg5_hat_fHslider126: f32 = 0;
// Transpose (NRPN 1)
let dx7_alg5_hat_fHslider2: f32 = 0;
// Osc Key Sync (NRPN 2)
let dx7_alg5_hat_fHslider22: f32 = 1;
// L1 (NRPN 3)
let dx7_alg5_hat_fHslider27: f32 = 50;
// L2 (NRPN 4)
let dx7_alg5_hat_fHslider30: f32 = 50;
// L3 (NRPN 5)
let dx7_alg5_hat_fHslider31: f32 = 50;
// L4 (NRPN 6)
let dx7_alg5_hat_fHslider26: f32 = 50;
// R1 (NRPN 7)
let dx7_alg5_hat_fHslider29: f32 = 99;
// R2 (NRPN 8)
let dx7_alg5_hat_fHslider32: f32 = 99;
// R3 (NRPN 9)
let dx7_alg5_hat_fHslider33: f32 = 99;
// R4 (NRPN 10)
let dx7_alg5_hat_fHslider28: f32 = 99;
// Wave (NRPN 11)
let dx7_alg5_hat_fEntry2: f32 = 0;
// Speed (NRPN 12)
let dx7_alg5_hat_fHslider20: f32 = 35;
// Delay (NRPN 13)
let dx7_alg5_hat_fHslider21: f32 = 0;
// PMD (NRPN 14)
let dx7_alg5_hat_fHslider34: f32 = 0;
// AMD (NRPN 15)
let dx7_alg5_hat_fHslider18: f32 = 0;
// Sync (NRPN 16)
let dx7_alg5_hat_fHslider19: f32 = 1;
// P Mod Sens (NRPN 17)
let dx7_alg5_hat_fHslider35: f32 = 3;
// Tune (NRPN 18)
let dx7_alg5_hat_fHslider23: f32 = 0;
// Coarse (NRPN 19)
let dx7_alg5_hat_fHslider24: f32 = 1;
// Fine (NRPN 20)
let dx7_alg5_hat_fHslider25: f32 = 0;
// L1 (NRPN 21)
let dx7_alg5_hat_fHslider0: f32 = 99;
// L2 (NRPN 22)
let dx7_alg5_hat_fHslider13: f32 = 99;
// L3 (NRPN 23)
let dx7_alg5_hat_fHslider14: f32 = 99;
// L4 (NRPN 24)
let dx7_alg5_hat_fHslider11: f32 = 0;
// R1 (NRPN 25)
let dx7_alg5_hat_fHslider9: f32 = 99;
// R2 (NRPN 26)
let dx7_alg5_hat_fHslider15: f32 = 99;
// R3 (NRPN 27)
let dx7_alg5_hat_fHslider16: f32 = 99;
// R4 (NRPN 28)
let dx7_alg5_hat_fHslider12: f32 = 99;
// Level (NRPN 29)
let dx7_alg5_hat_fHslider1: f32 = 99;
// Key Vel (NRPN 30)
let dx7_alg5_hat_fHslider7: f32 = 0;
// A Mod Sens (NRPN 31)
let dx7_alg5_hat_fHslider17: f32 = 0;
// Rate Scaling (NRPN 32)
let dx7_alg5_hat_fHslider10: f32 = 0;
// Breakpoint (NRPN 33)
let dx7_alg5_hat_fHslider4: f32 = 0;
// L Depth (NRPN 34)
let dx7_alg5_hat_fHslider5: f32 = 0;
// R Depth (NRPN 35)
let dx7_alg5_hat_fHslider6: f32 = 0;
// L Curve (NRPN 36)
let dx7_alg5_hat_fEntry0: f32 = 0;
// R Curve (NRPN 37)
let dx7_alg5_hat_fEntry1: f32 = 0;
// Tune (NRPN 38)
let dx7_alg5_hat_fHslider51: f32 = 0;
// Coarse (NRPN 39)
let dx7_alg5_hat_fHslider52: f32 = 1;
// Fine (NRPN 40)
let dx7_alg5_hat_fHslider53: f32 = 0;
// L1 (NRPN 41)
let dx7_alg5_hat_fHslider36: f32 = 99;
// L2 (NRPN 42)
let dx7_alg5_hat_fHslider46: f32 = 99;
// L3 (NRPN 43)
let dx7_alg5_hat_fHslider47: f32 = 99;
// L4 (NRPN 44)
let dx7_alg5_hat_fHslider44: f32 = 0;
// R1 (NRPN 45)
let dx7_alg5_hat_fHslider42: f32 = 99;
// R2 (NRPN 46)
let dx7_alg5_hat_fHslider48: f32 = 99;
// R3 (NRPN 47)
let dx7_alg5_hat_fHslider49: f32 = 99;
// R4 (NRPN 48)
let dx7_alg5_hat_fHslider45: f32 = 99;
// Level (NRPN 49)
let dx7_alg5_hat_fHslider37: f32 = 0;
// Key Vel (NRPN 50)
let dx7_alg5_hat_fHslider41: f32 = 0;
// A Mod Sens (NRPN 51)
let dx7_alg5_hat_fHslider50: f32 = 0;
// Rate Scaling (NRPN 52)
let dx7_alg5_hat_fHslider43: f32 = 0;
// Breakpoint (NRPN 53)
let dx7_alg5_hat_fHslider38: f32 = 0;
// L Depth (NRPN 54)
let dx7_alg5_hat_fHslider39: f32 = 0;
// R Depth (NRPN 55)
let dx7_alg5_hat_fHslider40: f32 = 0;
// L Curve (NRPN 56)
let dx7_alg5_hat_fEntry3: f32 = 0;
// R Curve (NRPN 57)
let dx7_alg5_hat_fEntry4: f32 = 0;
// Tune (NRPN 58)
let dx7_alg5_hat_fHslider69: f32 = 0;
// Coarse (NRPN 59)
let dx7_alg5_hat_fHslider70: f32 = 1;
// Fine (NRPN 60)
let dx7_alg5_hat_fHslider71: f32 = 0;
// L1 (NRPN 61)
let dx7_alg5_hat_fHslider54: f32 = 99;
// L2 (NRPN 62)
let dx7_alg5_hat_fHslider64: f32 = 99;
// L3 (NRPN 63)
let dx7_alg5_hat_fHslider65: f32 = 99;
// L4 (NRPN 64)
let dx7_alg5_hat_fHslider62: f32 = 0;
// R1 (NRPN 65)
let dx7_alg5_hat_fHslider60: f32 = 99;
// R2 (NRPN 66)
let dx7_alg5_hat_fHslider66: f32 = 99;
// R3 (NRPN 67)
let dx7_alg5_hat_fHslider67: f32 = 99;
// R4 (NRPN 68)
let dx7_alg5_hat_fHslider63: f32 = 99;
// Level (NRPN 69)
let dx7_alg5_hat_fHslider55: f32 = 0;
// Key Vel (NRPN 70)
let dx7_alg5_hat_fHslider59: f32 = 0;
// A Mod Sens (NRPN 71)
let dx7_alg5_hat_fHslider68: f32 = 0;
// Rate Scaling (NRPN 72)
let dx7_alg5_hat_fHslider61: f32 = 0;
// Breakpoint (NRPN 73)
let dx7_alg5_hat_fHslider56: f32 = 0;
// L Depth (NRPN 74)
let dx7_alg5_hat_fHslider57: f32 = 0;
// R Depth (NRPN 75)
let dx7_alg5_hat_fHslider58: f32 = 0;
// L Curve (NRPN 76)
let dx7_alg5_hat_fEntry5: f32 = 0;
// R Curve (NRPN 77)
let dx7_alg5_hat_fEntry6: f32 = 0;
// Tune (NRPN 78)
let dx7_alg5_hat_fHslider87: f32 = 0;
// Coarse (NRPN 79)
let dx7_alg5_hat_fHslider88: f32 = 1;
// Fine (NRPN 80)
let dx7_alg5_hat_fHslider89: f32 = 0;
// L1 (NRPN 81)
let dx7_alg5_hat_fHslider72: f32 = 99;
// L2 (NRPN 82)
let dx7_alg5_hat_fHslider82: f32 = 99;
// L3 (NRPN 83)
let dx7_alg5_hat_fHslider83: f32 = 99;
// L4 (NRPN 84)
let dx7_alg5_hat_fHslider80: f32 = 0;
// R1 (NRPN 85)
let dx7_alg5_hat_fHslider78: f32 = 99;
// R2 (NRPN 86)
let dx7_alg5_hat_fHslider84: f32 = 99;
// R3 (NRPN 87)
let dx7_alg5_hat_fHslider85: f32 = 99;
// R4 (NRPN 88)
let dx7_alg5_hat_fHslider81: f32 = 99;
// Level (NRPN 89)
let dx7_alg5_hat_fHslider73: f32 = 0;
// Key Vel (NRPN 90)
let dx7_alg5_hat_fHslider77: f32 = 0;
// A Mod Sens (NRPN 91)
let dx7_alg5_hat_fHslider86: f32 = 0;
// Rate Scaling (NRPN 92)
let dx7_alg5_hat_fHslider79: f32 = 0;
// Breakpoint (NRPN 93)
let dx7_alg5_hat_fHslider74: f32 = 0;
// L Depth (NRPN 94)
let dx7_alg5_hat_fHslider75: f32 = 0;
// R Depth (NRPN 95)
let dx7_alg5_hat_fHslider76: f32 = 0;
// L Curve (NRPN 96)
let dx7_alg5_hat_fEntry7: f32 = 0;
// R Curve (NRPN 97)
let dx7_alg5_hat_fEntry8: f32 = 0;
// Tune (NRPN 98)
let dx7_alg5_hat_fHslider105: f32 = 0;
// Coarse (NRPN 99)
let dx7_alg5_hat_fHslider106: f32 = 1;
// Fine (NRPN 100)
let dx7_alg5_hat_fHslider107: f32 = 0;
// L1 (NRPN 101)
let dx7_alg5_hat_fHslider90: f32 = 99;
// L2 (NRPN 102)
let dx7_alg5_hat_fHslider100: f32 = 99;
// L3 (NRPN 103)
let dx7_alg5_hat_fHslider101: f32 = 99;
// L4 (NRPN 104)
let dx7_alg5_hat_fHslider98: f32 = 0;
// R1 (NRPN 105)
let dx7_alg5_hat_fHslider96: f32 = 99;
// R2 (NRPN 106)
let dx7_alg5_hat_fHslider102: f32 = 99;
// R3 (NRPN 107)
let dx7_alg5_hat_fHslider103: f32 = 99;
// R4 (NRPN 108)
let dx7_alg5_hat_fHslider99: f32 = 99;
// Level (NRPN 109)
let dx7_alg5_hat_fHslider91: f32 = 0;
// Key Vel (NRPN 110)
let dx7_alg5_hat_fHslider95: f32 = 0;
// A Mod Sens (NRPN 111)
let dx7_alg5_hat_fHslider104: f32 = 0;
// Rate Scaling (NRPN 112)
let dx7_alg5_hat_fHslider97: f32 = 0;
// Breakpoint (NRPN 113)
let dx7_alg5_hat_fHslider92: f32 = 0;
// L Depth (NRPN 114)
let dx7_alg5_hat_fHslider93: f32 = 0;
// R Depth (NRPN 115)
let dx7_alg5_hat_fHslider94: f32 = 0;
// L Curve (NRPN 116)
let dx7_alg5_hat_fEntry9: f32 = 0;
// R Curve (NRPN 117)
let dx7_alg5_hat_fEntry10: f32 = 0;
// Tune (NRPN 118)
let dx7_alg5_hat_fHslider123: f32 = 0;
// Coarse (NRPN 119)
let dx7_alg5_hat_fHslider124: f32 = 1;
// Fine (NRPN 120)
let dx7_alg5_hat_fHslider125: f32 = 0;
// L1 (NRPN 121)
let dx7_alg5_hat_fHslider108: f32 = 99;
// L2 (NRPN 122)
let dx7_alg5_hat_fHslider118: f32 = 99;
// L3 (NRPN 123)
let dx7_alg5_hat_fHslider119: f32 = 99;
// L4 (NRPN 124)
let dx7_alg5_hat_fHslider116: f32 = 0;
// R1 (NRPN 125)
let dx7_alg5_hat_fHslider114: f32 = 99;
// R2 (NRPN 126)
let dx7_alg5_hat_fHslider120: f32 = 99;
// R3 (NRPN 127)
let dx7_alg5_hat_fHslider121: f32 = 99;
// R4 (NRPN 128)
let dx7_alg5_hat_fHslider117: f32 = 99;
// Level (NRPN 129)
let dx7_alg5_hat_fHslider109: f32 = 0;
// Key Vel (NRPN 130)
let dx7_alg5_hat_fHslider113: f32 = 0;
// A Mod Sens (NRPN 131)
let dx7_alg5_hat_fHslider122: f32 = 0;
// Rate Scaling (NRPN 132)
let dx7_alg5_hat_fHslider115: f32 = 0;
// Breakpoint (NRPN 133)
let dx7_alg5_hat_fHslider110: f32 = 0;
// L Depth (NRPN 134)
let dx7_alg5_hat_fHslider111: f32 = 0;
// R Depth (NRPN 135)
let dx7_alg5_hat_fHslider112: f32 = 0;
// L Curve (NRPN 136)
let dx7_alg5_hat_fEntry11: f32 = 0;
// R Curve (NRPN 137)
let dx7_alg5_hat_fEntry12: f32 = 0;

const Dx7_alg5_hat_wave_SIG0Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 5, 9, 13, 17, 20, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 42, 43, 45, 46]);
const Dx7_alg5_hat_wave_SIG1Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14, 16, 19, 23, 27, 33, 39, 47, 56, 66, 80, 94, 110, 126, 142, 158, 174, 190, 206, 222, 238, 250]);
const Dx7_alg5_hat_wave_SIG2Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 70, 86, 97, 106, 114, 121, 126, 132, 138, 142, 148, 152, 156, 160, 163, 166, 170, 173, 174, 178, 181, 184, 186, 189, 190, 194, 196, 198, 200, 202, 205, 206, 209, 211, 214, 216, 218, 220, 222, 224, 225, 227, 229, 230, 232, 233, 235, 237, 238, 240, 241, 242, 243, 244, 246, 246, 248, 249, 250, 251, 252, 253, 254]);
const Dx7_alg5_hat_wave_SIG3Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1764000, 1764000, 1411200, 1411200, 1190700, 1014300, 992250, 882000, 705600, 705600, 584325, 507150, 502740, 441000, 418950, 352800, 308700, 286650, 253575, 220500, 220500, 176400, 145530, 145530, 125685, 110250, 110250, 88200, 88200, 74970, 61740, 61740, 55125, 48510, 44100, 37485, 31311, 30870, 27562, 27562, 22050, 18522, 17640, 15435, 14112, 13230, 11025, 9261, 9261, 7717, 6615, 6615, 5512, 5512, 4410, 3969, 3969, 3439, 2866, 2690, 2249, 1984, 1896, 1808, 1411, 1367, 1234, 1146, 926, 837, 837, 705, 573, 573, 529, 441, 441]);
const Dx7_alg5_hat_wave_SIG4Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 4342338, 7171437, 16777216]);
const Dx7_alg5_hat_wave_SIG5Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-16777216, 0, 16777216, 26591258, 33554432, 38955489, 43368474, 47099600, 50331648, 53182516, 55732705, 58039632, 60145690, 62083076, 63876816, 65546747, 67108864, 68576247, 69959732, 71268397, 72509921, 73690858, 74816848, 75892776, 76922906, 77910978, 78860292, 79773775, 80654032, 81503396, 82323963, 83117622]);
const Dx7_alg5_hat_wave_SIG6Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([-128, -116, -104, -95, -85, -76, -68, -61, -56, -52, -49, -46, -43, -41, -39, -37, -35, -33, -32, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 38, 40, 43, 46, 49, 53, 58, 65, 73, 82, 92, 103, 115, 127]);
const Dx7_alg5_hat_wave_SIG7Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 33, 34, 36, 37, 38, 39, 41, 42, 44, 46, 47, 49, 51, 53, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 79, 82, 85, 88, 91, 94, 98, 102, 106, 110, 115, 120, 125, 130, 135, 141, 147, 153, 159, 165, 171, 178, 185, 193, 202, 211, 232, 243, 254, 255]);
const Dx7_alg5_hat_wave_SIG8Wave0: StaticArray<i32> = StaticArray.fromArray<i32>([0, 10, 20, 33, 55, 92, 153, 255]);

const Dx7_alg5_hat_itbl0SIG0: StaticArray<i32> = new StaticArray<i32>(20);
const Dx7_alg5_hat_itbl1SIG1: StaticArray<i32> = new StaticArray<i32>(33);
const Dx7_alg5_hat_itbl2SIG2: StaticArray<i32> = new StaticArray<i32>(64);
const Dx7_alg5_hat_itbl3SIG3: StaticArray<i32> = new StaticArray<i32>(77);
const Dx7_alg5_hat_itbl4SIG4: StaticArray<i32> = new StaticArray<i32>(4);
const Dx7_alg5_hat_itbl5SIG5: StaticArray<i32> = new StaticArray<i32>(32);
const Dx7_alg5_hat_itbl6SIG6: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg5_hat_itbl7SIG7: StaticArray<i32> = new StaticArray<i32>(100);
const Dx7_alg5_hat_itbl8SIG8: StaticArray<i32> = new StaticArray<i32>(8);
let _Dx7_alg5_hat_sig0_initialized: bool = false;

function _Dx7_alg5_hat_initSIG0Tables(): void {
    if (_Dx7_alg5_hat_sig0_initialized) return;
    _Dx7_alg5_hat_sig0_initialized = true;
    let sig0_iDx7_alg5_hatSIG0Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_hat_itbl0SIG0.length; i++) {
        Dx7_alg5_hat_itbl0SIG0[i] = Dx7_alg5_hat_wave_SIG0Wave0[sig0_iDx7_alg5_hatSIG0Wave0_idx];
        sig0_iDx7_alg5_hatSIG0Wave0_idx = (1 + sig0_iDx7_alg5_hatSIG0Wave0_idx) % 20;
    }
    let sig1_iDx7_alg5_hatSIG1Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_hat_itbl1SIG1.length; i++) {
        Dx7_alg5_hat_itbl1SIG1[i] = Dx7_alg5_hat_wave_SIG1Wave0[sig1_iDx7_alg5_hatSIG1Wave0_idx];
        sig1_iDx7_alg5_hatSIG1Wave0_idx = (1 + sig1_iDx7_alg5_hatSIG1Wave0_idx) % 33;
    }
    let sig2_iDx7_alg5_hatSIG2Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_hat_itbl2SIG2.length; i++) {
        Dx7_alg5_hat_itbl2SIG2[i] = Dx7_alg5_hat_wave_SIG2Wave0[sig2_iDx7_alg5_hatSIG2Wave0_idx];
        sig2_iDx7_alg5_hatSIG2Wave0_idx = (1 + sig2_iDx7_alg5_hatSIG2Wave0_idx) % 64;
    }
    let sig3_iDx7_alg5_hatSIG3Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_hat_itbl3SIG3.length; i++) {
        Dx7_alg5_hat_itbl3SIG3[i] = Dx7_alg5_hat_wave_SIG3Wave0[sig3_iDx7_alg5_hatSIG3Wave0_idx];
        sig3_iDx7_alg5_hatSIG3Wave0_idx = (1 + sig3_iDx7_alg5_hatSIG3Wave0_idx) % 77;
    }
    let sig4_iDx7_alg5_hatSIG4Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_hat_itbl4SIG4.length; i++) {
        Dx7_alg5_hat_itbl4SIG4[i] = Dx7_alg5_hat_wave_SIG4Wave0[sig4_iDx7_alg5_hatSIG4Wave0_idx];
        sig4_iDx7_alg5_hatSIG4Wave0_idx = (1 + sig4_iDx7_alg5_hatSIG4Wave0_idx) % 4;
    }
    let sig5_iDx7_alg5_hatSIG5Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_hat_itbl5SIG5.length; i++) {
        Dx7_alg5_hat_itbl5SIG5[i] = Dx7_alg5_hat_wave_SIG5Wave0[sig5_iDx7_alg5_hatSIG5Wave0_idx];
        sig5_iDx7_alg5_hatSIG5Wave0_idx = (1 + sig5_iDx7_alg5_hatSIG5Wave0_idx) % 32;
    }
    let sig6_iDx7_alg5_hatSIG6Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_hat_itbl6SIG6.length; i++) {
        Dx7_alg5_hat_itbl6SIG6[i] = Dx7_alg5_hat_wave_SIG6Wave0[sig6_iDx7_alg5_hatSIG6Wave0_idx];
        sig6_iDx7_alg5_hatSIG6Wave0_idx = (1 + sig6_iDx7_alg5_hatSIG6Wave0_idx) % 100;
    }
    let sig7_iDx7_alg5_hatSIG7Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_hat_itbl7SIG7.length; i++) {
        Dx7_alg5_hat_itbl7SIG7[i] = Dx7_alg5_hat_wave_SIG7Wave0[sig7_iDx7_alg5_hatSIG7Wave0_idx];
        sig7_iDx7_alg5_hatSIG7Wave0_idx = (1 + sig7_iDx7_alg5_hatSIG7Wave0_idx) % 100;
    }
    let sig8_iDx7_alg5_hatSIG8Wave0_idx: i32 = 0;
    for (let i = 0; i < Dx7_alg5_hat_itbl8SIG8.length; i++) {
        Dx7_alg5_hat_itbl8SIG8[i] = Dx7_alg5_hat_wave_SIG8Wave0[sig8_iDx7_alg5_hatSIG8Wave0_idx];
        sig8_iDx7_alg5_hatSIG8Wave0_idx = (1 + sig8_iDx7_alg5_hatSIG8Wave0_idx) % 8;
    }
}

export class Dx7_alg5_hat extends MidiVoice {
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
        _Dx7_alg5_hat_initSIG0Tables();
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
        this.fHslider8 = <f32>velocity / 127.0;
        this.fButton0 = 0.0;
        this.nextframe();
        this.fButton0 = 1.0;
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
        const fSlow1: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider0));
        const fSlow2: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider1));
        const fSlow3: f32 = Mathf.pow(2.0, 0.083333336 * (Mathf.round(_fcast(dx7_alg5_hat_fHslider2)) + 17.31234 * Mathf.log(0.0022727272 * _fcast(this.fHslider3))));
        const fSlow4: f32 = Mathf.round(17.31234 * Mathf.log(fSlow3) + 69.0);
        const fSlow5: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider4));
        const fSlow6: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry0));
        const fSlow7: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider5));
        const fSlow8: f32 = fSlow4 + (-18.0 - fSlow5);
        const iSlow9: i32 = (((fSlow6 == 0.0 ? 1 : 0) | (fSlow6 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow7 * fSlow8)) >> 12 : _icast(329.0 * fSlow7 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow8))), 32))])) >> 15);
        const fSlow10: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry1));
        const fSlow11: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider6));
        const fSlow12: f32 = fSlow4 + (-16.0 - fSlow5);
        const iSlow13: i32 = (((fSlow10 == 0.0 ? 1 : 0) | (fSlow10 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow11 * fSlow12) >> 12 : _icast(329.0 * fSlow11 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow12)), 32))])) >> 15);
        const fSlow14: f32 = _fcast(Dx7_alg5_hat_itbl2SIG2[_icast(Mathf.round(_fcast(_icast(Mathf.max(0.0, Mathf.min(127.0, 127.0 * _fcast(this.fHslider8)))) >> 1)))] + -239);
        const fSlow15: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow2 >= 2e+01 ? 1 : 0) ? fSlow2 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow2)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow5)) >= 0.0) ? ((fSlow10 < 2.0 ? 1 : 0) ? -iSlow13 : iSlow13) : ((fSlow6 < 2.0 ? 1 : 0) ? -iSlow9 : iSlow9)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider7)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow16: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow1 >= 2e+01 ? 1 : 0) ? fSlow1 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow1)), 19))]))) >> 1) << 6) + fSlow15 + -4256.0)) << 16;
        const iSlow17: i32 = fSlow1 == 0.0;
        const fSlow18: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider9));
        const fSlow19: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider10));
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
        const fSlow31: f32 = ((iSlow30) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow29)), 76))]) : 2e+01 * (99.0 - fSlow29));
        const iSlow32: i32 = (((iSlow16 == 0 ? 1 : 0) | iSlow17) ? _icast(this.fConst1 * ((iSlow30 & iSlow17) ? 0.05 * fSlow31 : fSlow31)) : 0);
        const fSlow33: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider11));
        const iSlow34: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fSlow33 >= 2e+01 ? 1 : 0) ? fSlow33 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow33)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow35: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider12));
        const fSlow36: f32 = Mathf.min(fSlow35 + fSlow28, 99.0);
        const iSlow37: i32 = _icast(this.fConst1 * ((fSlow36 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow36)), 76))]) : 2e+01 * (99.0 - fSlow36)));
        const fSlow38: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider13));
        const fSlow39: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider14));
        const fSlow40: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider15));
        const fSlow41: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider16));
        const iSlow42: i32 = iSlow16 > 0;
        const iSlow43: i32 = min<i32>(63, ((41 * _icast(fSlow18)) >> 6) + iSlow27);
        const iSlow44: i32 = _icast(this.fConst1 * _fcast(((iSlow43 & 3) + 4) << ((iSlow43 >> 2) + 2)));
        const iSlow45: i32 = min<i32>(63, ((41 * _icast(fSlow35)) >> 6) + iSlow27);
        const iSlow46: i32 = _icast(this.fConst1 * _fcast(((iSlow45 & 3) + 4) << ((iSlow45 >> 2) + 2)));
        const iSlow47: i32 = Dx7_alg5_hat_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_hat_fHslider17))))];
        const iSlow48: i32 = iSlow47 != 0;
        const fSlow49: f32 = 2.6972606e-09 * Mathf.round(_fcast(dx7_alg5_hat_fHslider18));
        const iSlow50: i32 = _icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider19)));
        const fSlow51: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider20));
        const fSlow52: f32 = this.fConst2 * (((0.01010101 * fSlow51) <= 0.656566) ? 0.15806305 * fSlow51 + 0.036478 : 1.100254 * fSlow51 + -61.205933);
        const fSlow53: f32 = 99.0 - Mathf.round(_fcast(dx7_alg5_hat_fHslider21));
        const iSlow54: i32 = (fSlow53 == 99.0 ? 1 : 0) >= 1;
        const iSlow55: i32 = _icast(fSlow53);
        const iSlow56: i32 = ((iSlow55 & 15) + 16) << ((iSlow55 >> 4) + 1);
        const fSlow57: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(max<i32>(iSlow56 & 65408, 128)));
        const fSlow58: f32 = ((iSlow54) ? 1.0 : this.fConst3 * _fcast(iSlow56));
        const fSlow59: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry2));
        const iSlow60: i32 = fSlow59 >= 3.0;
        const iSlow61: i32 = fSlow59 >= 5.0;
        const iSlow62: i32 = fSlow59 >= 2.0;
        const iSlow63: i32 = fSlow59 >= 1.0;
        const iSlow64: i32 = fSlow59 >= 4.0;
        const fSlow65: f32 = _fcast(iSlow47);
        const iSlow66: i32 = _icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider22)));
        const iSlow67: i32 = _icast(Mathf.round(_fcast(this.fCheckbox0)));
        const fSlow68: f32 = Mathf.log(4.4e+02 * fSlow3);
        const fSlow69: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider23));
        const fSlow70: f32 = Mathf.exp(-0.57130724 * fSlow68);
        const iSlow71: i32 = _icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider24)));
        const fSlow72: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider25));
        const fSlow73: f32 = ((iSlow67) ? _fcast(_icast(4458616.0 * (fSlow72 + _fcast(100 * (iSlow71 & 3)))) >> 3) + ((fSlow69 > 0.0 ? 1 : 0) ? 13457.0 * fSlow69 : 0.0) : fSlow68 * (72267.445 * fSlow69 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_hat_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow71 & 31)))]) + _fcast(((_icast(fSlow72)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow72 + 1.0) + 0.5)) : 0)));
        const fSlow74: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider26));
        const iSlow75: i32 = Dx7_alg5_hat_itbl6SIG6[_icast(Mathf.round(fSlow74))];
        const fSlow76: f32 = _fcast(iSlow75);
        const fSlow77: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider27));
        const iSlow78: i32 = Dx7_alg5_hat_itbl6SIG6[_icast(Mathf.round(fSlow77))];
        const iSlow79: i32 = iSlow78 > iSlow75;
        const fSlow80: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider28));
        const fSlow81: f32 = this.fConst4 * _fcast(Dx7_alg5_hat_itbl7SIG7[_icast(Mathf.round(fSlow80))]);
        const fSlow82: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider29));
        const fSlow83: f32 = this.fConst4 * _fcast(Dx7_alg5_hat_itbl7SIG7[_icast(Mathf.round(fSlow82))]);
        const fSlow84: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider30));
        const fSlow85: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider31));
        const fSlow86: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider32));
        const fSlow87: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider33));
        const fSlow88: f32 = 7.891414e-05 * Mathf.round(_fcast(dx7_alg5_hat_fHslider34));
        const fSlow89: f32 = _fcast(Dx7_alg5_hat_itbl8SIG8[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_hat_fHslider35))))]);
        const fSlow90: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider36));
        const fSlow91: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider37));
        const fSlow92: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider38));
        const fSlow93: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry3));
        const fSlow94: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider39));
        const fSlow95: f32 = fSlow4 + (-18.0 - fSlow92);
        const iSlow96: i32 = (((fSlow93 == 0.0 ? 1 : 0) | (fSlow93 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow94 * fSlow95)) >> 12 : _icast(329.0 * fSlow94 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow95))), 32))])) >> 15);
        const fSlow97: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry4));
        const fSlow98: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider40));
        const fSlow99: f32 = fSlow4 + (-16.0 - fSlow92);
        const iSlow100: i32 = (((fSlow97 == 0.0 ? 1 : 0) | (fSlow97 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow98 * fSlow99) >> 12 : _icast(329.0 * fSlow98 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow99)), 32))])) >> 15);
        const fSlow101: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow91 >= 2e+01 ? 1 : 0) ? fSlow91 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow91)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow92)) >= 0.0) ? ((fSlow97 < 2.0 ? 1 : 0) ? -iSlow100 : iSlow100) : ((fSlow93 < 2.0 ? 1 : 0) ? -iSlow96 : iSlow96)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider41)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow102: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow90 >= 2e+01 ? 1 : 0) ? fSlow90 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow90)), 19))]))) >> 1) << 6) + fSlow101 + -4256.0)) << 16;
        const iSlow103: i32 = fSlow90 == 0.0;
        const fSlow104: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider42));
        const fSlow105: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider43));
        const iSlow106: i32 = _icast(fSlow105 * fSlow25) >> 3;
        const iSlow107: i32 = (((fSlow105 == 3.0 ? 1 : 0) & iSlow22) ? iSlow106 + -1 : ((((fSlow105 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow106 + 1 : iSlow106));
        const fSlow108: f32 = _fcast(iSlow107);
        const fSlow109: f32 = Mathf.min(fSlow104 + fSlow108, 99.0);
        const iSlow110: i32 = fSlow109 < 77.0;
        const fSlow111: f32 = ((iSlow110) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow109)), 76))]) : 2e+01 * (99.0 - fSlow109));
        const iSlow112: i32 = (((iSlow102 == 0 ? 1 : 0) | iSlow103) ? _icast(this.fConst1 * ((iSlow110 & iSlow103) ? 0.05 * fSlow111 : fSlow111)) : 0);
        const fSlow113: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider44));
        const iSlow114: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fSlow113 >= 2e+01 ? 1 : 0) ? fSlow113 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow113)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow115: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider45));
        const fSlow116: f32 = Mathf.min(fSlow115 + fSlow108, 99.0);
        const iSlow117: i32 = _icast(this.fConst1 * ((fSlow116 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow116)), 76))]) : 2e+01 * (99.0 - fSlow116)));
        const fSlow118: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider46));
        const fSlow119: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider47));
        const fSlow120: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider48));
        const fSlow121: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider49));
        const iSlow122: i32 = iSlow102 > 0;
        const iSlow123: i32 = min<i32>(63, ((41 * _icast(fSlow104)) >> 6) + iSlow107);
        const iSlow124: i32 = _icast(this.fConst1 * _fcast(((iSlow123 & 3) + 4) << ((iSlow123 >> 2) + 2)));
        const iSlow125: i32 = min<i32>(63, ((41 * _icast(fSlow115)) >> 6) + iSlow107);
        const iSlow126: i32 = _icast(this.fConst1 * _fcast(((iSlow125 & 3) + 4) << ((iSlow125 >> 2) + 2)));
        const iSlow127: i32 = Dx7_alg5_hat_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_hat_fHslider50))))];
        const iSlow128: i32 = iSlow127 != 0;
        const fSlow129: f32 = _fcast(iSlow127);
        const iSlow130: i32 = _icast(Mathf.round(_fcast(this.fCheckbox1)));
        const fSlow131: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider51));
        const iSlow132: i32 = _icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider52)));
        const fSlow133: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider53));
        const fSlow134: f32 = ((iSlow130) ? _fcast(_icast(4458616.0 * (fSlow133 + _fcast(100 * (iSlow132 & 3)))) >> 3) + ((fSlow131 > 0.0 ? 1 : 0) ? 13457.0 * fSlow131 : 0.0) : fSlow68 * (72267.445 * fSlow131 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_hat_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow132 & 31)))]) + _fcast(((_icast(fSlow133)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow133 + 1.0) + 0.5)) : 0)));
        const fSlow135: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider54));
        const fSlow136: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider55));
        const fSlow137: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider56));
        const fSlow138: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry5));
        const fSlow139: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider57));
        const fSlow140: f32 = fSlow4 + (-18.0 - fSlow137);
        const iSlow141: i32 = (((fSlow138 == 0.0 ? 1 : 0) | (fSlow138 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow139 * fSlow140)) >> 12 : _icast(329.0 * fSlow139 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow140))), 32))])) >> 15);
        const fSlow142: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry6));
        const fSlow143: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider58));
        const fSlow144: f32 = fSlow4 + (-16.0 - fSlow137);
        const iSlow145: i32 = (((fSlow142 == 0.0 ? 1 : 0) | (fSlow142 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow143 * fSlow144) >> 12 : _icast(329.0 * fSlow143 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow144)), 32))])) >> 15);
        const fSlow146: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow136 >= 2e+01 ? 1 : 0) ? fSlow136 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow136)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow137)) >= 0.0) ? ((fSlow142 < 2.0 ? 1 : 0) ? -iSlow145 : iSlow145) : ((fSlow138 < 2.0 ? 1 : 0) ? -iSlow141 : iSlow141)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider59)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow147: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow135 >= 2e+01 ? 1 : 0) ? fSlow135 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow135)), 19))]))) >> 1) << 6) + fSlow146 + -4256.0)) << 16;
        const iSlow148: i32 = fSlow135 == 0.0;
        const fSlow149: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider60));
        const fSlow150: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider61));
        const iSlow151: i32 = _icast(fSlow150 * fSlow25) >> 3;
        const iSlow152: i32 = (((fSlow150 == 3.0 ? 1 : 0) & iSlow22) ? iSlow151 + -1 : ((((fSlow150 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow151 + 1 : iSlow151));
        const fSlow153: f32 = _fcast(iSlow152);
        const fSlow154: f32 = Mathf.min(fSlow149 + fSlow153, 99.0);
        const iSlow155: i32 = fSlow154 < 77.0;
        const fSlow156: f32 = ((iSlow155) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow154)), 76))]) : 2e+01 * (99.0 - fSlow154));
        const iSlow157: i32 = (((iSlow147 == 0 ? 1 : 0) | iSlow148) ? _icast(this.fConst1 * ((iSlow155 & iSlow148) ? 0.05 * fSlow156 : fSlow156)) : 0);
        const fSlow158: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider62));
        const iSlow159: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fSlow158 >= 2e+01 ? 1 : 0) ? fSlow158 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow158)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow160: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider63));
        const fSlow161: f32 = Mathf.min(fSlow160 + fSlow153, 99.0);
        const iSlow162: i32 = _icast(this.fConst1 * ((fSlow161 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow161)), 76))]) : 2e+01 * (99.0 - fSlow161)));
        const fSlow163: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider64));
        const fSlow164: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider65));
        const fSlow165: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider66));
        const fSlow166: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider67));
        const iSlow167: i32 = iSlow147 > 0;
        const iSlow168: i32 = min<i32>(63, ((41 * _icast(fSlow149)) >> 6) + iSlow152);
        const iSlow169: i32 = _icast(this.fConst1 * _fcast(((iSlow168 & 3) + 4) << ((iSlow168 >> 2) + 2)));
        const iSlow170: i32 = min<i32>(63, ((41 * _icast(fSlow160)) >> 6) + iSlow152);
        const iSlow171: i32 = _icast(this.fConst1 * _fcast(((iSlow170 & 3) + 4) << ((iSlow170 >> 2) + 2)));
        const iSlow172: i32 = Dx7_alg5_hat_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_hat_fHslider68))))];
        const iSlow173: i32 = iSlow172 != 0;
        const fSlow174: f32 = _fcast(iSlow172);
        const iSlow175: i32 = _icast(Mathf.round(_fcast(this.fCheckbox2)));
        const fSlow176: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider69));
        const iSlow177: i32 = _icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider70)));
        const fSlow178: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider71));
        const fSlow179: f32 = ((iSlow175) ? _fcast(_icast(4458616.0 * (fSlow178 + _fcast(100 * (iSlow177 & 3)))) >> 3) + ((fSlow176 > 0.0 ? 1 : 0) ? 13457.0 * fSlow176 : 0.0) : fSlow68 * (72267.445 * fSlow176 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_hat_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow177 & 31)))]) + _fcast(((_icast(fSlow178)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow178 + 1.0) + 0.5)) : 0)));
        const fSlow180: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider72));
        const fSlow181: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider73));
        const fSlow182: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider74));
        const fSlow183: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry7));
        const fSlow184: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider75));
        const fSlow185: f32 = fSlow4 + (-18.0 - fSlow182);
        const iSlow186: i32 = (((fSlow183 == 0.0 ? 1 : 0) | (fSlow183 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow184 * fSlow185)) >> 12 : _icast(329.0 * fSlow184 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow185))), 32))])) >> 15);
        const fSlow187: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry8));
        const fSlow188: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider76));
        const fSlow189: f32 = fSlow4 + (-16.0 - fSlow182);
        const iSlow190: i32 = (((fSlow187 == 0.0 ? 1 : 0) | (fSlow187 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow188 * fSlow189) >> 12 : _icast(329.0 * fSlow188 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow189)), 32))])) >> 15);
        const fSlow191: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow181 >= 2e+01 ? 1 : 0) ? fSlow181 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow181)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow182)) >= 0.0) ? ((fSlow187 < 2.0 ? 1 : 0) ? -iSlow190 : iSlow190) : ((fSlow183 < 2.0 ? 1 : 0) ? -iSlow186 : iSlow186)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider77)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow192: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow180 >= 2e+01 ? 1 : 0) ? fSlow180 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow180)), 19))]))) >> 1) << 6) + fSlow191 + -4256.0)) << 16;
        const iSlow193: i32 = fSlow180 == 0.0;
        const fSlow194: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider78));
        const fSlow195: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider79));
        const iSlow196: i32 = _icast(fSlow195 * fSlow25) >> 3;
        const iSlow197: i32 = (((fSlow195 == 3.0 ? 1 : 0) & iSlow22) ? iSlow196 + -1 : ((((fSlow195 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow196 + 1 : iSlow196));
        const fSlow198: f32 = _fcast(iSlow197);
        const fSlow199: f32 = Mathf.min(fSlow194 + fSlow198, 99.0);
        const iSlow200: i32 = fSlow199 < 77.0;
        const fSlow201: f32 = ((iSlow200) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow199)), 76))]) : 2e+01 * (99.0 - fSlow199));
        const iSlow202: i32 = (((iSlow192 == 0 ? 1 : 0) | iSlow193) ? _icast(this.fConst1 * ((iSlow200 & iSlow193) ? 0.05 * fSlow201 : fSlow201)) : 0);
        const fSlow203: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider80));
        const iSlow204: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fSlow203 >= 2e+01 ? 1 : 0) ? fSlow203 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow203)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow205: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider81));
        const fSlow206: f32 = Mathf.min(fSlow205 + fSlow198, 99.0);
        const iSlow207: i32 = _icast(this.fConst1 * ((fSlow206 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow206)), 76))]) : 2e+01 * (99.0 - fSlow206)));
        const fSlow208: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider82));
        const fSlow209: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider83));
        const fSlow210: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider84));
        const fSlow211: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider85));
        const iSlow212: i32 = iSlow192 > 0;
        const iSlow213: i32 = min<i32>(63, ((41 * _icast(fSlow194)) >> 6) + iSlow197);
        const iSlow214: i32 = _icast(this.fConst1 * _fcast(((iSlow213 & 3) + 4) << ((iSlow213 >> 2) + 2)));
        const iSlow215: i32 = min<i32>(63, ((41 * _icast(fSlow205)) >> 6) + iSlow197);
        const iSlow216: i32 = _icast(this.fConst1 * _fcast(((iSlow215 & 3) + 4) << ((iSlow215 >> 2) + 2)));
        const iSlow217: i32 = Dx7_alg5_hat_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_hat_fHslider86))))];
        const iSlow218: i32 = iSlow217 != 0;
        const fSlow219: f32 = _fcast(iSlow217);
        const iSlow220: i32 = _icast(Mathf.round(_fcast(this.fCheckbox3)));
        const fSlow221: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider87));
        const iSlow222: i32 = _icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider88)));
        const fSlow223: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider89));
        const fSlow224: f32 = ((iSlow220) ? _fcast(_icast(4458616.0 * (fSlow223 + _fcast(100 * (iSlow222 & 3)))) >> 3) + ((fSlow221 > 0.0 ? 1 : 0) ? 13457.0 * fSlow221 : 0.0) : fSlow68 * (72267.445 * fSlow221 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_hat_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow222 & 31)))]) + _fcast(((_icast(fSlow223)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow223 + 1.0) + 0.5)) : 0)));
        const fSlow225: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider90));
        const fSlow226: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider91));
        const fSlow227: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider92));
        const fSlow228: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry9));
        const fSlow229: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider93));
        const fSlow230: f32 = fSlow4 + (-18.0 - fSlow227);
        const iSlow231: i32 = (((fSlow228 == 0.0 ? 1 : 0) | (fSlow228 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow229 * fSlow230)) >> 12 : _icast(329.0 * fSlow229 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow230))), 32))])) >> 15);
        const fSlow232: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry10));
        const fSlow233: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider94));
        const fSlow234: f32 = fSlow4 + (-16.0 - fSlow227);
        const iSlow235: i32 = (((fSlow232 == 0.0 ? 1 : 0) | (fSlow232 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow233 * fSlow234) >> 12 : _icast(329.0 * fSlow233 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow234)), 32))])) >> 15);
        const fSlow236: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow226 >= 2e+01 ? 1 : 0) ? fSlow226 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow226)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow227)) >= 0.0) ? ((fSlow232 < 2.0 ? 1 : 0) ? -iSlow235 : iSlow235) : ((fSlow228 < 2.0 ? 1 : 0) ? -iSlow231 : iSlow231)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider95)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow237: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow225 >= 2e+01 ? 1 : 0) ? fSlow225 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow225)), 19))]))) >> 1) << 6) + fSlow236 + -4256.0)) << 16;
        const iSlow238: i32 = fSlow225 == 0.0;
        const fSlow239: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider96));
        const fSlow240: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider97));
        const iSlow241: i32 = _icast(fSlow240 * fSlow25) >> 3;
        const iSlow242: i32 = (((fSlow240 == 3.0 ? 1 : 0) & iSlow22) ? iSlow241 + -1 : ((((fSlow240 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow241 + 1 : iSlow241));
        const fSlow243: f32 = _fcast(iSlow242);
        const fSlow244: f32 = Mathf.min(fSlow239 + fSlow243, 99.0);
        const iSlow245: i32 = fSlow244 < 77.0;
        const fSlow246: f32 = ((iSlow245) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow244)), 76))]) : 2e+01 * (99.0 - fSlow244));
        const iSlow247: i32 = (((iSlow237 == 0 ? 1 : 0) | iSlow238) ? _icast(this.fConst1 * ((iSlow245 & iSlow238) ? 0.05 * fSlow246 : fSlow246)) : 0);
        const fSlow248: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider98));
        const iSlow249: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fSlow248 >= 2e+01 ? 1 : 0) ? fSlow248 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow248)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow250: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider99));
        const fSlow251: f32 = Mathf.min(fSlow250 + fSlow243, 99.0);
        const iSlow252: i32 = _icast(this.fConst1 * ((fSlow251 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow251)), 76))]) : 2e+01 * (99.0 - fSlow251)));
        const fSlow253: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider100));
        const fSlow254: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider101));
        const fSlow255: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider102));
        const fSlow256: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider103));
        const iSlow257: i32 = iSlow237 > 0;
        const iSlow258: i32 = min<i32>(63, ((41 * _icast(fSlow239)) >> 6) + iSlow242);
        const iSlow259: i32 = _icast(this.fConst1 * _fcast(((iSlow258 & 3) + 4) << ((iSlow258 >> 2) + 2)));
        const iSlow260: i32 = min<i32>(63, ((41 * _icast(fSlow250)) >> 6) + iSlow242);
        const iSlow261: i32 = _icast(this.fConst1 * _fcast(((iSlow260 & 3) + 4) << ((iSlow260 >> 2) + 2)));
        const iSlow262: i32 = Dx7_alg5_hat_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_hat_fHslider104))))];
        const iSlow263: i32 = iSlow262 != 0;
        const fSlow264: f32 = _fcast(iSlow262);
        const iSlow265: i32 = _icast(Mathf.round(_fcast(this.fCheckbox4)));
        const fSlow266: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider105));
        const iSlow267: i32 = _icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider106)));
        const fSlow268: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider107));
        const fSlow269: f32 = ((iSlow265) ? _fcast(_icast(4458616.0 * (fSlow268 + _fcast(100 * (iSlow267 & 3)))) >> 3) + ((fSlow266 > 0.0 ? 1 : 0) ? 13457.0 * fSlow266 : 0.0) : fSlow68 * (72267.445 * fSlow266 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_hat_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow267 & 31)))]) + _fcast(((_icast(fSlow268)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow268 + 1.0) + 0.5)) : 0)));
        const fSlow270: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider108));
        const fSlow271: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider109));
        const fSlow272: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider110));
        const fSlow273: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry11));
        const fSlow274: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider111));
        const fSlow275: f32 = fSlow4 + (-18.0 - fSlow272);
        const iSlow276: i32 = (((fSlow273 == 0.0 ? 1 : 0) | (fSlow273 == 3.0 ? 1 : 0)) ? _icast(-(109.666664 * fSlow274 * fSlow275)) >> 12 : _icast(329.0 * fSlow274 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(-(0.33333334 * fSlow275))), 32))])) >> 15);
        const fSlow277: f32 = Mathf.round(_fcast(dx7_alg5_hat_fEntry12));
        const fSlow278: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider112));
        const fSlow279: f32 = fSlow4 + (-16.0 - fSlow272);
        const iSlow280: i32 = (((fSlow277 == 0.0 ? 1 : 0) | (fSlow277 == 3.0 ? 1 : 0)) ? _icast(109.666664 * fSlow278 * fSlow279) >> 12 : _icast(329.0 * fSlow278 * _fcast(Dx7_alg5_hat_itbl1SIG1[max<i32>(0, min<i32>(_icast(Mathf.round(0.33333334 * fSlow279)), 32))])) >> 15);
        const fSlow281: f32 = Mathf.max(0.0, 32.0 * Mathf.min(127.0, ((fSlow271 >= 2e+01 ? 1 : 0) ? fSlow271 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow271)), 19))])) + _fcast((((fSlow4 + (-17.0 - fSlow272)) >= 0.0) ? ((fSlow277 < 2.0 ? 1 : 0) ? -iSlow280 : iSlow280) : ((fSlow273 < 2.0 ? 1 : 0) ? -iSlow276 : iSlow276)))) + _fcast((_icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider113)) * fSlow14 + 7.0) >> 3) << 4));
        const iSlow282: i32 = _icast(Mathf.max(16.0, _fcast((_icast(((fSlow270 >= 2e+01 ? 1 : 0) ? fSlow270 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow270)), 19))]))) >> 1) << 6) + fSlow281 + -4256.0)) << 16;
        const iSlow283: i32 = fSlow270 == 0.0;
        const fSlow284: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider114));
        const fSlow285: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider115));
        const iSlow286: i32 = _icast(fSlow285 * fSlow25) >> 3;
        const iSlow287: i32 = (((fSlow285 == 3.0 ? 1 : 0) & iSlow22) ? iSlow286 + -1 : ((((fSlow285 == 7.0 ? 1 : 0) & iSlow23) & iSlow24) ? iSlow286 + 1 : iSlow286));
        const fSlow288: f32 = _fcast(iSlow287);
        const fSlow289: f32 = Mathf.min(fSlow284 + fSlow288, 99.0);
        const iSlow290: i32 = fSlow289 < 77.0;
        const fSlow291: f32 = ((iSlow290) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow289)), 76))]) : 2e+01 * (99.0 - fSlow289));
        const iSlow292: i32 = (((iSlow282 == 0 ? 1 : 0) | iSlow283) ? _icast(this.fConst1 * ((iSlow290 & iSlow283) ? 0.05 * fSlow291 : fSlow291)) : 0);
        const fSlow293: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider116));
        const iSlow294: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fSlow293 >= 2e+01 ? 1 : 0) ? fSlow293 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow293)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const fSlow295: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider117));
        const fSlow296: f32 = Mathf.min(fSlow295 + fSlow288, 99.0);
        const iSlow297: i32 = _icast(this.fConst1 * ((fSlow296 < 77.0 ? 1 : 0) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fSlow296)), 76))]) : 2e+01 * (99.0 - fSlow296)));
        const fSlow298: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider118));
        const fSlow299: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider119));
        const fSlow300: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider120));
        const fSlow301: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider121));
        const iSlow302: i32 = iSlow282 > 0;
        const iSlow303: i32 = min<i32>(63, ((41 * _icast(fSlow284)) >> 6) + iSlow287);
        const iSlow304: i32 = _icast(this.fConst1 * _fcast(((iSlow303 & 3) + 4) << ((iSlow303 >> 2) + 2)));
        const iSlow305: i32 = min<i32>(63, ((41 * _icast(fSlow295)) >> 6) + iSlow287);
        const iSlow306: i32 = _icast(this.fConst1 * _fcast(((iSlow305 & 3) + 4) << ((iSlow305 >> 2) + 2)));
        const iSlow307: i32 = Dx7_alg5_hat_itbl4SIG4[_icast(Mathf.round(Mathf.round(_fcast(dx7_alg5_hat_fHslider122))))];
        const iSlow308: i32 = iSlow307 != 0;
        const fSlow309: f32 = _fcast(iSlow307);
        const iSlow310: i32 = _icast(Mathf.round(_fcast(this.fCheckbox5)));
        const fSlow311: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider123));
        const iSlow312: i32 = _icast(Mathf.round(_fcast(dx7_alg5_hat_fHslider124)));
        const fSlow313: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider125));
        const fSlow314: f32 = ((iSlow310) ? _fcast(_icast(4458616.0 * (fSlow313 + _fcast(100 * (iSlow312 & 3)))) >> 3) + ((fSlow311 > 0.0 ? 1 : 0) ? 13457.0 * fSlow311 : 0.0) : fSlow68 * (72267.445 * fSlow311 * fSlow70 + 24204406.0) + _fcast(Dx7_alg5_hat_itbl5SIG5[_icast(Mathf.round(_fcast(iSlow312 & 31)))]) + _fcast(((_icast(fSlow313)) ? _icast(Mathf.floor(24204406.0 * Mathf.log(0.01 * fSlow313 + 1.0) + 0.5)) : 0)));
        const fSlow315: f32 = Mathf.round(_fcast(dx7_alg5_hat_fHslider126));
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
        const iTemp17: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp16 >= 2e+01 ? 1 : 0) ? fTemp16 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp16)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp18: i32 = iTemp8 == 0;
        const iTemp19: i32 = fTemp16 == 0.0;
        const fTemp20: f32 = ((iTemp13) ? ((iTemp15) ? fSlow35 : fSlow41) : ((iTemp14) ? fSlow40 : fSlow18));
        const fTemp21: f32 = Mathf.min(fSlow28 + fTemp20, 99.0);
        const iTemp22: i32 = fTemp21 < 77.0;
        const fTemp23: f32 = ((iTemp22) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp21)), 76))]) : 2e+01 * (99.0 - fTemp21));
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
        const iTemp46: i32 = _icast(Mathf.max(16.0, fSlow15 + _fcast((_icast(((fTemp45 >= 2e+01 ? 1 : 0) ? fTemp45 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp45)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp56: f32 = ((iTemp55) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp54)), 76))]) : 2e+01 * (99.0 - fTemp54));
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
        const iTemp89: i32 = Dx7_alg5_hat_itbl6SIG6[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow74 : fSlow85) : ((iTemp87) ? fSlow84 : fSlow77))))];
        const iTemp90: i32 = ((iTemp85) ? iTemp89 : iTemp79);
        this.iRec15[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp90 : iTemp79) : ((iTemp81) ? iTemp90 : iTemp79)) : iTemp79);
        const iTemp91: i32 = ((iTemp85) ? iTemp89 > iTemp79 : iTemp75);
        this.iRec16[0] = ((iTemp73) ? ((iTemp76) ? ((iTemp83) ? iTemp91 : iTemp75) : ((iTemp81) ? iTemp91 : iTemp75)) : iTemp75);
        const fTemp92: f32 = ((iTemp85) ? this.fConst4 * _fcast(Dx7_alg5_hat_itbl7SIG7[_icast(Mathf.round(((iTemp86) ? ((iTemp88) ? fSlow80 : fSlow87) : ((iTemp87) ? fSlow86 : fSlow82))))]) : fTemp77);
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
        const iTemp110: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp109 >= 2e+01 ? 1 : 0) ? fTemp109 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp109)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp111: i32 = iTemp101 == 0;
        const iTemp112: i32 = fTemp109 == 0.0;
        const fTemp113: f32 = ((iTemp106) ? ((iTemp108) ? fSlow115 : fSlow121) : ((iTemp107) ? fSlow120 : fSlow104));
        const fTemp114: f32 = Mathf.min(fSlow108 + fTemp113, 99.0);
        const iTemp115: i32 = fTemp114 < 77.0;
        const fTemp116: f32 = ((iTemp115) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp114)), 76))]) : 2e+01 * (99.0 - fTemp114));
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
        const iTemp139: i32 = _icast(Mathf.max(16.0, fSlow101 + _fcast((_icast(((fTemp138 >= 2e+01 ? 1 : 0) ? fTemp138 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp138)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp149: f32 = ((iTemp148) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp147)), 76))]) : 2e+01 * (99.0 - fTemp147));
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
        const iTemp166: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fTemp165 >= 2e+01 ? 1 : 0) ? fTemp165 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp165)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp167: i32 = iTemp157 == 0;
        const iTemp168: i32 = fTemp165 == 0.0;
        const fTemp169: f32 = ((iTemp162) ? ((iTemp164) ? fSlow160 : fSlow166) : ((iTemp163) ? fSlow165 : fSlow149));
        const fTemp170: f32 = Mathf.min(fSlow153 + fTemp169, 99.0);
        const iTemp171: i32 = fTemp170 < 77.0;
        const fTemp172: f32 = ((iTemp171) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp170)), 76))]) : 2e+01 * (99.0 - fTemp170));
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
        const iTemp195: i32 = _icast(Mathf.max(16.0, fSlow146 + _fcast((_icast(((fTemp194 >= 2e+01 ? 1 : 0) ? fTemp194 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp194)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp205: f32 = ((iTemp204) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp203)), 76))]) : 2e+01 * (99.0 - fTemp203));
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
        const iTemp222: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fTemp221 >= 2e+01 ? 1 : 0) ? fTemp221 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp221)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp223: i32 = iTemp213 == 0;
        const iTemp224: i32 = fTemp221 == 0.0;
        const fTemp225: f32 = ((iTemp218) ? ((iTemp220) ? fSlow205 : fSlow211) : ((iTemp219) ? fSlow210 : fSlow194));
        const fTemp226: f32 = Mathf.min(fSlow198 + fTemp225, 99.0);
        const iTemp227: i32 = fTemp226 < 77.0;
        const fTemp228: f32 = ((iTemp227) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp226)), 76))]) : 2e+01 * (99.0 - fTemp226));
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
        const iTemp251: i32 = _icast(Mathf.max(16.0, fSlow191 + _fcast((_icast(((fTemp250 >= 2e+01 ? 1 : 0) ? fTemp250 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp250)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp261: f32 = ((iTemp260) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp259)), 76))]) : 2e+01 * (99.0 - fTemp259));
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
        const iTemp278: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fTemp277 >= 2e+01 ? 1 : 0) ? fTemp277 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp277)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp279: i32 = iTemp269 == 0;
        const iTemp280: i32 = fTemp277 == 0.0;
        const fTemp281: f32 = ((iTemp274) ? ((iTemp276) ? fSlow250 : fSlow256) : ((iTemp275) ? fSlow255 : fSlow239));
        const fTemp282: f32 = Mathf.min(fSlow243 + fTemp281, 99.0);
        const iTemp283: i32 = fTemp282 < 77.0;
        const fTemp284: f32 = ((iTemp283) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp282)), 76))]) : 2e+01 * (99.0 - fTemp282));
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
        const iTemp307: i32 = _icast(Mathf.max(16.0, fSlow236 + _fcast((_icast(((fTemp306 >= 2e+01 ? 1 : 0) ? fTemp306 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp306)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp317: f32 = ((iTemp316) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp315)), 76))]) : 2e+01 * (99.0 - fTemp315));
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
        const iTemp334: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp333 >= 2e+01 ? 1 : 0) ? fTemp333 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp333)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
        const iTemp335: i32 = iTemp325 == 0;
        const iTemp336: i32 = fTemp333 == 0.0;
        const fTemp337: f32 = ((iTemp330) ? ((iTemp332) ? fSlow295 : fSlow301) : ((iTemp331) ? fSlow300 : fSlow284));
        const fTemp338: f32 = Mathf.min(fSlow288 + fTemp337, 99.0);
        const iTemp339: i32 = fTemp338 < 77.0;
        const fTemp340: f32 = ((iTemp339) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp338)), 76))]) : 2e+01 * (99.0 - fTemp338));
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
        const iTemp363: i32 = _icast(Mathf.max(16.0, fSlow281 + _fcast((_icast(((fTemp362 >= 2e+01 ? 1 : 0) ? fTemp362 + 28.0 : _fcast(Dx7_alg5_hat_itbl0SIG0[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp362)), 19))]))) >> 1) << 6) + -4256.0)) << 16;
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
        const fTemp373: f32 = ((iTemp372) ? _fcast(Dx7_alg5_hat_itbl3SIG3[max<i32>(0, min<i32>(_icast(Mathf.round(fTemp371)), 76))]) : 2e+01 * (99.0 - fTemp371));
        const iTemp374: i32 = ((iTemp358) ? (((iTemp363 == iTemp353 ? 1 : 0) | (iTemp369 & iTemp370)) ? _icast(this.fConst1 * (((iTemp372 & iTemp369) & iTemp370) ? 0.05 * fTemp373 : fTemp373)) : 0) : iTemp341);
        this.iRec58[0] = ((iTemp328) ? ((iTemp345) ? ((iTemp356) ? iTemp374 : iTemp341) : ((iTemp346) ? ((iTemp354) ? iTemp374 : iTemp341) : iTemp341)) : iTemp341);
        const fTemp375: f32 = ((iTemp70) ? 0.0 : this.fRec59[1] + this.fConst2 * Mathf.pow(2.0, 5.9604645e-08 * (fSlow314 + ((iSlow310) ? 0.0 : fTemp94))));
        this.fRec59[0] = fTemp375 - Mathf.floor(fTemp375);
        this.fRec51[0] = 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec52[0] + (-234881024 - ((iSlow308) ? _icast(5.9604645e-08 * _fcast(this.iRec52[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow309 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec59[0] + this.fRec51[1] * fSlow316));
        const fTemp376: f32 = 0.5 * (Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec0[0] + (-234881024 - ((iSlow48) ? _icast(5.9604645e-08 * _fcast(this.iRec0[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow65 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec12[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec19[0] + (-234881024 - ((iSlow128) ? _icast(5.9604645e-08 * _fcast(this.iRec19[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow129 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec26[0]))) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec27[0] + (-234881024 - ((iSlow173) ? _icast(5.9604645e-08 * _fcast(this.iRec27[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow174 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec34[0] + 0.5 * Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec35[0] + (-234881024 - ((iSlow218) ? _icast(5.9604645e-08 * _fcast(this.iRec35[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow219 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * this.fRec42[0]))) + Mathf.pow(2.0, 5.9604645e-08 * _fcast(this.iRec43[0] + (-234881024 - ((iSlow263) ? _icast(5.9604645e-08 * _fcast(this.iRec43[0]) * Mathf.exp(fSlow49 * fTemp69 * fSlow264 + 12.2) + 0.5) : 0)))) * Mathf.sin(6.2831855 * (this.fRec50[0] + this.fRec51[0])));
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

export class Dx7_alg5_hatChannel extends MidiChannel {
    private _nrpnMsb: u8 = 127;
    private _nrpnLsb: u8 = 127;

    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case 99: this._nrpnMsb = value; break;
            case 98: this._nrpnLsb = value; break;
            case 6:
                this._setParam(<u16>this._nrpnMsb * 128 + <u16>this._nrpnLsb, value);
                break;
        }
    }

    private _setParam(param: u16, value: u8): void {
        switch (param) {
            case 0: dx7_alg5_hat_fHslider126 = <f32>value / 127.0 * 7; break;
            case 1: dx7_alg5_hat_fHslider2 = -24 + <f32>value / 127.0 * 48; break;
            case 2: dx7_alg5_hat_fHslider22 = <f32>value / 127.0; break;
            case 3: dx7_alg5_hat_fHslider27 = <f32>value / 127.0 * 99; break;
            case 4: dx7_alg5_hat_fHslider30 = <f32>value / 127.0 * 99; break;
            case 5: dx7_alg5_hat_fHslider31 = <f32>value / 127.0 * 99; break;
            case 6: dx7_alg5_hat_fHslider26 = <f32>value / 127.0 * 99; break;
            case 7: dx7_alg5_hat_fHslider29 = <f32>value / 127.0 * 99; break;
            case 8: dx7_alg5_hat_fHslider32 = <f32>value / 127.0 * 99; break;
            case 9: dx7_alg5_hat_fHslider33 = <f32>value / 127.0 * 99; break;
            case 10: dx7_alg5_hat_fHslider28 = <f32>value / 127.0 * 99; break;
            case 11: dx7_alg5_hat_fEntry2 = <f32>value / 127.0 * 5; break;
            case 12: dx7_alg5_hat_fHslider20 = <f32>value / 127.0 * 99; break;
            case 13: dx7_alg5_hat_fHslider21 = <f32>value / 127.0 * 99; break;
            case 14: dx7_alg5_hat_fHslider34 = <f32>value / 127.0 * 99; break;
            case 15: dx7_alg5_hat_fHslider18 = <f32>value / 127.0 * 99; break;
            case 16: dx7_alg5_hat_fHslider19 = <f32>value / 127.0; break;
            case 17: dx7_alg5_hat_fHslider35 = <f32>value / 127.0 * 7; break;
            case 18: dx7_alg5_hat_fHslider23 = -7 + <f32>value / 127.0 * 14; break;
            case 19: dx7_alg5_hat_fHslider24 = <f32>value / 127.0 * 31; break;
            case 20: dx7_alg5_hat_fHslider25 = <f32>value / 127.0 * 99; break;
            case 21: dx7_alg5_hat_fHslider0 = <f32>value / 127.0 * 99; break;
            case 22: dx7_alg5_hat_fHslider13 = <f32>value / 127.0 * 99; break;
            case 23: dx7_alg5_hat_fHslider14 = <f32>value / 127.0 * 99; break;
            case 24: dx7_alg5_hat_fHslider11 = <f32>value / 127.0 * 99; break;
            case 25: dx7_alg5_hat_fHslider9 = <f32>value / 127.0 * 99; break;
            case 26: dx7_alg5_hat_fHslider15 = <f32>value / 127.0 * 99; break;
            case 27: dx7_alg5_hat_fHslider16 = <f32>value / 127.0 * 99; break;
            case 28: dx7_alg5_hat_fHslider12 = <f32>value / 127.0 * 99; break;
            case 29: dx7_alg5_hat_fHslider1 = <f32>value / 127.0 * 99; break;
            case 30: dx7_alg5_hat_fHslider7 = <f32>value / 127.0 * 7; break;
            case 31: dx7_alg5_hat_fHslider17 = <f32>value / 127.0 * 3; break;
            case 32: dx7_alg5_hat_fHslider10 = <f32>value / 127.0 * 7; break;
            case 33: dx7_alg5_hat_fHslider4 = <f32>value / 127.0 * 99; break;
            case 34: dx7_alg5_hat_fHslider5 = <f32>value / 127.0 * 99; break;
            case 35: dx7_alg5_hat_fHslider6 = <f32>value / 127.0 * 99; break;
            case 36: dx7_alg5_hat_fEntry0 = <f32>value / 127.0 * 3; break;
            case 37: dx7_alg5_hat_fEntry1 = <f32>value / 127.0 * 3; break;
            case 38: dx7_alg5_hat_fHslider51 = -7 + <f32>value / 127.0 * 14; break;
            case 39: dx7_alg5_hat_fHslider52 = <f32>value / 127.0 * 31; break;
            case 40: dx7_alg5_hat_fHslider53 = <f32>value / 127.0 * 99; break;
            case 41: dx7_alg5_hat_fHslider36 = <f32>value / 127.0 * 99; break;
            case 42: dx7_alg5_hat_fHslider46 = <f32>value / 127.0 * 99; break;
            case 43: dx7_alg5_hat_fHslider47 = <f32>value / 127.0 * 99; break;
            case 44: dx7_alg5_hat_fHslider44 = <f32>value / 127.0 * 99; break;
            case 45: dx7_alg5_hat_fHslider42 = <f32>value / 127.0 * 99; break;
            case 46: dx7_alg5_hat_fHslider48 = <f32>value / 127.0 * 99; break;
            case 47: dx7_alg5_hat_fHslider49 = <f32>value / 127.0 * 99; break;
            case 48: dx7_alg5_hat_fHslider45 = <f32>value / 127.0 * 99; break;
            case 49: dx7_alg5_hat_fHslider37 = <f32>value / 127.0 * 99; break;
            case 50: dx7_alg5_hat_fHslider41 = <f32>value / 127.0 * 7; break;
            case 51: dx7_alg5_hat_fHslider50 = <f32>value / 127.0 * 3; break;
            case 52: dx7_alg5_hat_fHslider43 = <f32>value / 127.0 * 7; break;
            case 53: dx7_alg5_hat_fHslider38 = <f32>value / 127.0 * 99; break;
            case 54: dx7_alg5_hat_fHslider39 = <f32>value / 127.0 * 99; break;
            case 55: dx7_alg5_hat_fHslider40 = <f32>value / 127.0 * 99; break;
            case 56: dx7_alg5_hat_fEntry3 = <f32>value / 127.0 * 3; break;
            case 57: dx7_alg5_hat_fEntry4 = <f32>value / 127.0 * 3; break;
            case 58: dx7_alg5_hat_fHslider69 = -7 + <f32>value / 127.0 * 14; break;
            case 59: dx7_alg5_hat_fHslider70 = <f32>value / 127.0 * 31; break;
            case 60: dx7_alg5_hat_fHslider71 = <f32>value / 127.0 * 99; break;
            case 61: dx7_alg5_hat_fHslider54 = <f32>value / 127.0 * 99; break;
            case 62: dx7_alg5_hat_fHslider64 = <f32>value / 127.0 * 99; break;
            case 63: dx7_alg5_hat_fHslider65 = <f32>value / 127.0 * 99; break;
            case 64: dx7_alg5_hat_fHslider62 = <f32>value / 127.0 * 99; break;
            case 65: dx7_alg5_hat_fHslider60 = <f32>value / 127.0 * 99; break;
            case 66: dx7_alg5_hat_fHslider66 = <f32>value / 127.0 * 99; break;
            case 67: dx7_alg5_hat_fHslider67 = <f32>value / 127.0 * 99; break;
            case 68: dx7_alg5_hat_fHslider63 = <f32>value / 127.0 * 99; break;
            case 69: dx7_alg5_hat_fHslider55 = <f32>value / 127.0 * 99; break;
            case 70: dx7_alg5_hat_fHslider59 = <f32>value / 127.0 * 7; break;
            case 71: dx7_alg5_hat_fHslider68 = <f32>value / 127.0 * 3; break;
            case 72: dx7_alg5_hat_fHslider61 = <f32>value / 127.0 * 7; break;
            case 73: dx7_alg5_hat_fHslider56 = <f32>value / 127.0 * 99; break;
            case 74: dx7_alg5_hat_fHslider57 = <f32>value / 127.0 * 99; break;
            case 75: dx7_alg5_hat_fHslider58 = <f32>value / 127.0 * 99; break;
            case 76: dx7_alg5_hat_fEntry5 = <f32>value / 127.0 * 3; break;
            case 77: dx7_alg5_hat_fEntry6 = <f32>value / 127.0 * 3; break;
            case 78: dx7_alg5_hat_fHslider87 = -7 + <f32>value / 127.0 * 14; break;
            case 79: dx7_alg5_hat_fHslider88 = <f32>value / 127.0 * 31; break;
            case 80: dx7_alg5_hat_fHslider89 = <f32>value / 127.0 * 99; break;
            case 81: dx7_alg5_hat_fHslider72 = <f32>value / 127.0 * 99; break;
            case 82: dx7_alg5_hat_fHslider82 = <f32>value / 127.0 * 99; break;
            case 83: dx7_alg5_hat_fHslider83 = <f32>value / 127.0 * 99; break;
            case 84: dx7_alg5_hat_fHslider80 = <f32>value / 127.0 * 99; break;
            case 85: dx7_alg5_hat_fHslider78 = <f32>value / 127.0 * 99; break;
            case 86: dx7_alg5_hat_fHslider84 = <f32>value / 127.0 * 99; break;
            case 87: dx7_alg5_hat_fHslider85 = <f32>value / 127.0 * 99; break;
            case 88: dx7_alg5_hat_fHslider81 = <f32>value / 127.0 * 99; break;
            case 89: dx7_alg5_hat_fHslider73 = <f32>value / 127.0 * 99; break;
            case 90: dx7_alg5_hat_fHslider77 = <f32>value / 127.0 * 7; break;
            case 91: dx7_alg5_hat_fHslider86 = <f32>value / 127.0 * 3; break;
            case 92: dx7_alg5_hat_fHslider79 = <f32>value / 127.0 * 7; break;
            case 93: dx7_alg5_hat_fHslider74 = <f32>value / 127.0 * 99; break;
            case 94: dx7_alg5_hat_fHslider75 = <f32>value / 127.0 * 99; break;
            case 95: dx7_alg5_hat_fHslider76 = <f32>value / 127.0 * 99; break;
            case 96: dx7_alg5_hat_fEntry7 = <f32>value / 127.0 * 3; break;
            case 97: dx7_alg5_hat_fEntry8 = <f32>value / 127.0 * 3; break;
            case 98: dx7_alg5_hat_fHslider105 = -7 + <f32>value / 127.0 * 14; break;
            case 99: dx7_alg5_hat_fHslider106 = <f32>value / 127.0 * 31; break;
            case 100: dx7_alg5_hat_fHslider107 = <f32>value / 127.0 * 99; break;
            case 101: dx7_alg5_hat_fHslider90 = <f32>value / 127.0 * 99; break;
            case 102: dx7_alg5_hat_fHslider100 = <f32>value / 127.0 * 99; break;
            case 103: dx7_alg5_hat_fHslider101 = <f32>value / 127.0 * 99; break;
            case 104: dx7_alg5_hat_fHslider98 = <f32>value / 127.0 * 99; break;
            case 105: dx7_alg5_hat_fHslider96 = <f32>value / 127.0 * 99; break;
            case 106: dx7_alg5_hat_fHslider102 = <f32>value / 127.0 * 99; break;
            case 107: dx7_alg5_hat_fHslider103 = <f32>value / 127.0 * 99; break;
            case 108: dx7_alg5_hat_fHslider99 = <f32>value / 127.0 * 99; break;
            case 109: dx7_alg5_hat_fHslider91 = <f32>value / 127.0 * 99; break;
            case 110: dx7_alg5_hat_fHslider95 = <f32>value / 127.0 * 7; break;
            case 111: dx7_alg5_hat_fHslider104 = <f32>value / 127.0 * 3; break;
            case 112: dx7_alg5_hat_fHslider97 = <f32>value / 127.0 * 7; break;
            case 113: dx7_alg5_hat_fHslider92 = <f32>value / 127.0 * 99; break;
            case 114: dx7_alg5_hat_fHslider93 = <f32>value / 127.0 * 99; break;
            case 115: dx7_alg5_hat_fHslider94 = <f32>value / 127.0 * 99; break;
            case 116: dx7_alg5_hat_fEntry9 = <f32>value / 127.0 * 3; break;
            case 117: dx7_alg5_hat_fEntry10 = <f32>value / 127.0 * 3; break;
            case 118: dx7_alg5_hat_fHslider123 = -7 + <f32>value / 127.0 * 14; break;
            case 119: dx7_alg5_hat_fHslider124 = <f32>value / 127.0 * 31; break;
            case 120: dx7_alg5_hat_fHslider125 = <f32>value / 127.0 * 99; break;
            case 121: dx7_alg5_hat_fHslider108 = <f32>value / 127.0 * 99; break;
            case 122: dx7_alg5_hat_fHslider118 = <f32>value / 127.0 * 99; break;
            case 123: dx7_alg5_hat_fHslider119 = <f32>value / 127.0 * 99; break;
            case 124: dx7_alg5_hat_fHslider116 = <f32>value / 127.0 * 99; break;
            case 125: dx7_alg5_hat_fHslider114 = <f32>value / 127.0 * 99; break;
            case 126: dx7_alg5_hat_fHslider120 = <f32>value / 127.0 * 99; break;
            case 127: dx7_alg5_hat_fHslider121 = <f32>value / 127.0 * 99; break;
            case 128: dx7_alg5_hat_fHslider117 = <f32>value / 127.0 * 99; break;
            case 129: dx7_alg5_hat_fHslider109 = <f32>value / 127.0 * 99; break;
            case 130: dx7_alg5_hat_fHslider113 = <f32>value / 127.0 * 7; break;
            case 131: dx7_alg5_hat_fHslider122 = <f32>value / 127.0 * 3; break;
            case 132: dx7_alg5_hat_fHslider115 = <f32>value / 127.0 * 7; break;
            case 133: dx7_alg5_hat_fHslider110 = <f32>value / 127.0 * 99; break;
            case 134: dx7_alg5_hat_fHslider111 = <f32>value / 127.0 * 99; break;
            case 135: dx7_alg5_hat_fHslider112 = <f32>value / 127.0 * 99; break;
            case 136: dx7_alg5_hat_fEntry11 = <f32>value / 127.0 * 3; break;
            case 137: dx7_alg5_hat_fEntry12 = <f32>value / 127.0 * 3; break;
        }
    }
}


// --- Drum Kit Channel: routes NRPNs to kick (0-137), snare (138-275), hat (276-413) ---
export class Dx7DrumKitChannel extends MidiChannel {
    private _nrpnMsb: u8 = 127;
    private _nrpnLsb: u8 = 127;
    private _kickRouter: Dx7_alg17Channel;
    private _snareRouter: Dx7_alg21Channel;
    private _hatRouter: Dx7_alg5_hatChannel;

    constructor(numvoices: i32, factoryFunc: (channel: MidiChannel, voiceindex: i32) => MidiVoice) {
        super(numvoices, factoryFunc);
        this._kickRouter = new Dx7_alg17Channel(1, (channel: MidiChannel) => new Dx7_alg17(channel));
        this._snareRouter = new Dx7_alg21Channel(1, (channel: MidiChannel) => new Dx7_alg21(channel));
        this._hatRouter = new Dx7_alg5_hatChannel(1, (channel: MidiChannel) => new Dx7_alg5_hat(channel));
    }

    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case 99: this._nrpnMsb = value; break;
            case 98: this._nrpnLsb = value; break;
            case 6: {
                const param: u16 = <u16>this._nrpnMsb * 128 + <u16>this._nrpnLsb;
                if (param < 138) {
                    this._kickRouter.controlchange(99, <u8>(param >> 7));
                    this._kickRouter.controlchange(98, <u8>(param & 127));
                    this._kickRouter.controlchange(6, value);
                } else if (param < 276) {
                    const p: u16 = param - 138;
                    this._snareRouter.controlchange(99, <u8>(p >> 7));
                    this._snareRouter.controlchange(98, <u8>(p & 127));
                    this._snareRouter.controlchange(6, value);
                } else if (param < 414) {
                    const p: u16 = param - 276;
                    this._hatRouter.controlchange(99, <u8>(p >> 7));
                    this._hatRouter.controlchange(98, <u8>(p & 127));
                    this._hatRouter.controlchange(6, value);
                }
                break;
            }
        }
    }
}

export function initializeMidiSynth(): void {
    midichannels[0] = new Dx7_alg5Channel(10, (channel: MidiChannel) => new Dx7_alg5(channel));
    midichannels[0].controlchange(7, 100);
    midichannels[0].controlchange(10, 64);
    midichannels[0].controlchange(91, 10);

    // Feedback (NRPN 0, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 0);
    midichannels[0].controlchange(6, 0);
    // Transpose (NRPN 1, range: -24–24, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 1);
    midichannels[0].controlchange(6, 64);
    // Osc Key Sync (NRPN 2, range: 0–1, default: 1)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 2);
    midichannels[0].controlchange(6, 127);
    // L1 (NRPN 3, range: 0–99, default: 50)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 3);
    midichannels[0].controlchange(6, 64);
    // L2 (NRPN 4, range: 0–99, default: 50)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 4);
    midichannels[0].controlchange(6, 64);
    // L3 (NRPN 5, range: 0–99, default: 50)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 5);
    midichannels[0].controlchange(6, 64);
    // L4 (NRPN 6, range: 0–99, default: 50)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 6);
    midichannels[0].controlchange(6, 64);
    // R1 (NRPN 7, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 7);
    midichannels[0].controlchange(6, 127);
    // R2 (NRPN 8, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 8);
    midichannels[0].controlchange(6, 127);
    // R3 (NRPN 9, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 9);
    midichannels[0].controlchange(6, 127);
    // R4 (NRPN 10, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 10);
    midichannels[0].controlchange(6, 127);
    // Wave (NRPN 11, range: 0–5, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 11);
    midichannels[0].controlchange(6, 0);
    // Speed (NRPN 12, range: 0–99, default: 35)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 12);
    midichannels[0].controlchange(6, 45);
    // Delay (NRPN 13, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 13);
    midichannels[0].controlchange(6, 0);
    // PMD (NRPN 14, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 14);
    midichannels[0].controlchange(6, 0);
    // AMD (NRPN 15, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 15);
    midichannels[0].controlchange(6, 0);
    // Sync (NRPN 16, range: 0–1, default: 1)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 16);
    midichannels[0].controlchange(6, 127);
    // P Mod Sens (NRPN 17, range: 0–7, default: 3)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 17);
    midichannels[0].controlchange(6, 54);
    // Tune (NRPN 18, range: -7–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 18);
    midichannels[0].controlchange(6, 64);
    // Coarse (NRPN 19, range: 0–31, default: 1)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 19);
    midichannels[0].controlchange(6, 4);
    // Fine (NRPN 20, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 20);
    midichannels[0].controlchange(6, 0);
    // L1 (NRPN 21, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 21);
    midichannels[0].controlchange(6, 127);
    // L2 (NRPN 22, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 22);
    midichannels[0].controlchange(6, 127);
    // L3 (NRPN 23, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 23);
    midichannels[0].controlchange(6, 127);
    // L4 (NRPN 24, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 24);
    midichannels[0].controlchange(6, 0);
    // R1 (NRPN 25, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 25);
    midichannels[0].controlchange(6, 127);
    // R2 (NRPN 26, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 26);
    midichannels[0].controlchange(6, 127);
    // R3 (NRPN 27, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 27);
    midichannels[0].controlchange(6, 127);
    // R4 (NRPN 28, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 28);
    midichannels[0].controlchange(6, 127);
    // Level (NRPN 29, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 29);
    midichannels[0].controlchange(6, 127);
    // Key Vel (NRPN 30, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 30);
    midichannels[0].controlchange(6, 0);
    // A Mod Sens (NRPN 31, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 31);
    midichannels[0].controlchange(6, 0);
    // Rate Scaling (NRPN 32, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 32);
    midichannels[0].controlchange(6, 0);
    // Breakpoint (NRPN 33, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 33);
    midichannels[0].controlchange(6, 0);
    // L Depth (NRPN 34, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 34);
    midichannels[0].controlchange(6, 0);
    // R Depth (NRPN 35, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 35);
    midichannels[0].controlchange(6, 0);
    // L Curve (NRPN 36, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 36);
    midichannels[0].controlchange(6, 0);
    // R Curve (NRPN 37, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 37);
    midichannels[0].controlchange(6, 0);
    // Tune (NRPN 38, range: -7–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 38);
    midichannels[0].controlchange(6, 64);
    // Coarse (NRPN 39, range: 0–31, default: 1)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 39);
    midichannels[0].controlchange(6, 4);
    // Fine (NRPN 40, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 40);
    midichannels[0].controlchange(6, 0);
    // L1 (NRPN 41, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 41);
    midichannels[0].controlchange(6, 127);
    // L2 (NRPN 42, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 42);
    midichannels[0].controlchange(6, 127);
    // L3 (NRPN 43, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 43);
    midichannels[0].controlchange(6, 127);
    // L4 (NRPN 44, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 44);
    midichannels[0].controlchange(6, 0);
    // R1 (NRPN 45, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 45);
    midichannels[0].controlchange(6, 127);
    // R2 (NRPN 46, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 46);
    midichannels[0].controlchange(6, 127);
    // R3 (NRPN 47, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 47);
    midichannels[0].controlchange(6, 127);
    // R4 (NRPN 48, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 48);
    midichannels[0].controlchange(6, 127);
    // Level (NRPN 49, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 49);
    midichannels[0].controlchange(6, 0);
    // Key Vel (NRPN 50, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 50);
    midichannels[0].controlchange(6, 0);
    // A Mod Sens (NRPN 51, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 51);
    midichannels[0].controlchange(6, 0);
    // Rate Scaling (NRPN 52, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 52);
    midichannels[0].controlchange(6, 0);
    // Breakpoint (NRPN 53, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 53);
    midichannels[0].controlchange(6, 0);
    // L Depth (NRPN 54, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 54);
    midichannels[0].controlchange(6, 0);
    // R Depth (NRPN 55, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 55);
    midichannels[0].controlchange(6, 0);
    // L Curve (NRPN 56, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 56);
    midichannels[0].controlchange(6, 0);
    // R Curve (NRPN 57, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 57);
    midichannels[0].controlchange(6, 0);
    // Tune (NRPN 58, range: -7–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 58);
    midichannels[0].controlchange(6, 64);
    // Coarse (NRPN 59, range: 0–31, default: 1)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 59);
    midichannels[0].controlchange(6, 4);
    // Fine (NRPN 60, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 60);
    midichannels[0].controlchange(6, 0);
    // L1 (NRPN 61, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 61);
    midichannels[0].controlchange(6, 127);
    // L2 (NRPN 62, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 62);
    midichannels[0].controlchange(6, 127);
    // L3 (NRPN 63, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 63);
    midichannels[0].controlchange(6, 127);
    // L4 (NRPN 64, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 64);
    midichannels[0].controlchange(6, 0);
    // R1 (NRPN 65, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 65);
    midichannels[0].controlchange(6, 127);
    // R2 (NRPN 66, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 66);
    midichannels[0].controlchange(6, 127);
    // R3 (NRPN 67, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 67);
    midichannels[0].controlchange(6, 127);
    // R4 (NRPN 68, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 68);
    midichannels[0].controlchange(6, 127);
    // Level (NRPN 69, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 69);
    midichannels[0].controlchange(6, 0);
    // Key Vel (NRPN 70, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 70);
    midichannels[0].controlchange(6, 0);
    // A Mod Sens (NRPN 71, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 71);
    midichannels[0].controlchange(6, 0);
    // Rate Scaling (NRPN 72, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 72);
    midichannels[0].controlchange(6, 0);
    // Breakpoint (NRPN 73, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 73);
    midichannels[0].controlchange(6, 0);
    // L Depth (NRPN 74, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 74);
    midichannels[0].controlchange(6, 0);
    // R Depth (NRPN 75, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 75);
    midichannels[0].controlchange(6, 0);
    // L Curve (NRPN 76, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 76);
    midichannels[0].controlchange(6, 0);
    // R Curve (NRPN 77, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 77);
    midichannels[0].controlchange(6, 0);
    // Tune (NRPN 78, range: -7–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 78);
    midichannels[0].controlchange(6, 64);
    // Coarse (NRPN 79, range: 0–31, default: 1)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 79);
    midichannels[0].controlchange(6, 4);
    // Fine (NRPN 80, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 80);
    midichannels[0].controlchange(6, 0);
    // L1 (NRPN 81, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 81);
    midichannels[0].controlchange(6, 127);
    // L2 (NRPN 82, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 82);
    midichannels[0].controlchange(6, 127);
    // L3 (NRPN 83, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 83);
    midichannels[0].controlchange(6, 127);
    // L4 (NRPN 84, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 84);
    midichannels[0].controlchange(6, 0);
    // R1 (NRPN 85, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 85);
    midichannels[0].controlchange(6, 127);
    // R2 (NRPN 86, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 86);
    midichannels[0].controlchange(6, 127);
    // R3 (NRPN 87, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 87);
    midichannels[0].controlchange(6, 127);
    // R4 (NRPN 88, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 88);
    midichannels[0].controlchange(6, 127);
    // Level (NRPN 89, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 89);
    midichannels[0].controlchange(6, 0);
    // Key Vel (NRPN 90, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 90);
    midichannels[0].controlchange(6, 0);
    // A Mod Sens (NRPN 91, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 91);
    midichannels[0].controlchange(6, 0);
    // Rate Scaling (NRPN 92, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 92);
    midichannels[0].controlchange(6, 0);
    // Breakpoint (NRPN 93, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 93);
    midichannels[0].controlchange(6, 0);
    // L Depth (NRPN 94, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 94);
    midichannels[0].controlchange(6, 0);
    // R Depth (NRPN 95, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 95);
    midichannels[0].controlchange(6, 0);
    // L Curve (NRPN 96, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 96);
    midichannels[0].controlchange(6, 0);
    // R Curve (NRPN 97, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 97);
    midichannels[0].controlchange(6, 0);
    // Tune (NRPN 98, range: -7–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 98);
    midichannels[0].controlchange(6, 64);
    // Coarse (NRPN 99, range: 0–31, default: 1)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 99);
    midichannels[0].controlchange(6, 4);
    // Fine (NRPN 100, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 100);
    midichannels[0].controlchange(6, 0);
    // L1 (NRPN 101, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 101);
    midichannels[0].controlchange(6, 127);
    // L2 (NRPN 102, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 102);
    midichannels[0].controlchange(6, 127);
    // L3 (NRPN 103, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 103);
    midichannels[0].controlchange(6, 127);
    // L4 (NRPN 104, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 104);
    midichannels[0].controlchange(6, 0);
    // R1 (NRPN 105, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 105);
    midichannels[0].controlchange(6, 127);
    // R2 (NRPN 106, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 106);
    midichannels[0].controlchange(6, 127);
    // R3 (NRPN 107, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 107);
    midichannels[0].controlchange(6, 127);
    // R4 (NRPN 108, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 108);
    midichannels[0].controlchange(6, 127);
    // Level (NRPN 109, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 109);
    midichannels[0].controlchange(6, 0);
    // Key Vel (NRPN 110, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 110);
    midichannels[0].controlchange(6, 0);
    // A Mod Sens (NRPN 111, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 111);
    midichannels[0].controlchange(6, 0);
    // Rate Scaling (NRPN 112, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 112);
    midichannels[0].controlchange(6, 0);
    // Breakpoint (NRPN 113, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 113);
    midichannels[0].controlchange(6, 0);
    // L Depth (NRPN 114, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 114);
    midichannels[0].controlchange(6, 0);
    // R Depth (NRPN 115, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 115);
    midichannels[0].controlchange(6, 0);
    // L Curve (NRPN 116, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 116);
    midichannels[0].controlchange(6, 0);
    // R Curve (NRPN 117, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 117);
    midichannels[0].controlchange(6, 0);
    // Tune (NRPN 118, range: -7–7, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 118);
    midichannels[0].controlchange(6, 64);
    // Coarse (NRPN 119, range: 0–31, default: 1)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 119);
    midichannels[0].controlchange(6, 4);
    // Fine (NRPN 120, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 120);
    midichannels[0].controlchange(6, 0);
    // L1 (NRPN 121, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 121);
    midichannels[0].controlchange(6, 127);
    // L2 (NRPN 122, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 122);
    midichannels[0].controlchange(6, 127);
    // L3 (NRPN 123, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 123);
    midichannels[0].controlchange(6, 127);
    // L4 (NRPN 124, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 124);
    midichannels[0].controlchange(6, 0);
    // R1 (NRPN 125, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 125);
    midichannels[0].controlchange(6, 127);
    // R2 (NRPN 126, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 126);
    midichannels[0].controlchange(6, 127);
    // R3 (NRPN 127, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 0);
    midichannels[0].controlchange(98, 127);
    midichannels[0].controlchange(6, 127);
    // R4 (NRPN 128, range: 0–99, default: 99)
    midichannels[0].controlchange(99, 1);
    midichannels[0].controlchange(98, 0);
    midichannels[0].controlchange(6, 127);
    // Level (NRPN 129, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 1);
    midichannels[0].controlchange(98, 1);
    midichannels[0].controlchange(6, 0);
    // Key Vel (NRPN 130, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 1);
    midichannels[0].controlchange(98, 2);
    midichannels[0].controlchange(6, 0);
    // A Mod Sens (NRPN 131, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 1);
    midichannels[0].controlchange(98, 3);
    midichannels[0].controlchange(6, 0);
    // Rate Scaling (NRPN 132, range: 0–7, default: 0)
    midichannels[0].controlchange(99, 1);
    midichannels[0].controlchange(98, 4);
    midichannels[0].controlchange(6, 0);
    // Breakpoint (NRPN 133, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 1);
    midichannels[0].controlchange(98, 5);
    midichannels[0].controlchange(6, 0);
    // L Depth (NRPN 134, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 1);
    midichannels[0].controlchange(98, 6);
    midichannels[0].controlchange(6, 0);
    // R Depth (NRPN 135, range: 0–99, default: 0)
    midichannels[0].controlchange(99, 1);
    midichannels[0].controlchange(98, 7);
    midichannels[0].controlchange(6, 0);
    // L Curve (NRPN 136, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 1);
    midichannels[0].controlchange(98, 8);
    midichannels[0].controlchange(6, 0);
    // R Curve (NRPN 137, range: 0–3, default: 0)
    midichannels[0].controlchange(99, 1);
    midichannels[0].controlchange(98, 9);
    midichannels[0].controlchange(6, 0);

    midichannels[1] = new Dx7_alg16Channel(10, (channel: MidiChannel) => new Dx7_alg16(channel));
    midichannels[1].controlchange(7, 100);
    midichannels[1].controlchange(10, 64);
    midichannels[1].controlchange(91, 10);

    // Feedback (NRPN 0, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 0);
    midichannels[1].controlchange(6, 0);
    // Transpose (NRPN 1, range: -24–24, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 1);
    midichannels[1].controlchange(6, 64);
    // Osc Key Sync (NRPN 2, range: 0–1, default: 1)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 2);
    midichannels[1].controlchange(6, 127);
    // L1 (NRPN 3, range: 0–99, default: 50)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 3);
    midichannels[1].controlchange(6, 64);
    // L2 (NRPN 4, range: 0–99, default: 50)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 4);
    midichannels[1].controlchange(6, 64);
    // L3 (NRPN 5, range: 0–99, default: 50)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 5);
    midichannels[1].controlchange(6, 64);
    // L4 (NRPN 6, range: 0–99, default: 50)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 6);
    midichannels[1].controlchange(6, 64);
    // R1 (NRPN 7, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 7);
    midichannels[1].controlchange(6, 127);
    // R2 (NRPN 8, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 8);
    midichannels[1].controlchange(6, 127);
    // R3 (NRPN 9, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 9);
    midichannels[1].controlchange(6, 127);
    // R4 (NRPN 10, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 10);
    midichannels[1].controlchange(6, 127);
    // Wave (NRPN 11, range: 0–5, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 11);
    midichannels[1].controlchange(6, 0);
    // Speed (NRPN 12, range: 0–99, default: 35)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 12);
    midichannels[1].controlchange(6, 45);
    // Delay (NRPN 13, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 13);
    midichannels[1].controlchange(6, 0);
    // PMD (NRPN 14, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 14);
    midichannels[1].controlchange(6, 0);
    // AMD (NRPN 15, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 15);
    midichannels[1].controlchange(6, 0);
    // Sync (NRPN 16, range: 0–1, default: 1)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 16);
    midichannels[1].controlchange(6, 127);
    // P Mod Sens (NRPN 17, range: 0–7, default: 3)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 17);
    midichannels[1].controlchange(6, 54);
    // Tune (NRPN 18, range: -7–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 18);
    midichannels[1].controlchange(6, 64);
    // Coarse (NRPN 19, range: 0–31, default: 1)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 19);
    midichannels[1].controlchange(6, 4);
    // Fine (NRPN 20, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 20);
    midichannels[1].controlchange(6, 0);
    // L1 (NRPN 21, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 21);
    midichannels[1].controlchange(6, 127);
    // L2 (NRPN 22, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 22);
    midichannels[1].controlchange(6, 127);
    // L3 (NRPN 23, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 23);
    midichannels[1].controlchange(6, 127);
    // L4 (NRPN 24, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 24);
    midichannels[1].controlchange(6, 0);
    // R1 (NRPN 25, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 25);
    midichannels[1].controlchange(6, 127);
    // R2 (NRPN 26, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 26);
    midichannels[1].controlchange(6, 127);
    // R3 (NRPN 27, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 27);
    midichannels[1].controlchange(6, 127);
    // R4 (NRPN 28, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 28);
    midichannels[1].controlchange(6, 127);
    // Level (NRPN 29, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 29);
    midichannels[1].controlchange(6, 127);
    // Key Vel (NRPN 30, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 30);
    midichannels[1].controlchange(6, 0);
    // A Mod Sens (NRPN 31, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 31);
    midichannels[1].controlchange(6, 0);
    // Rate Scaling (NRPN 32, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 32);
    midichannels[1].controlchange(6, 0);
    // Breakpoint (NRPN 33, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 33);
    midichannels[1].controlchange(6, 0);
    // L Depth (NRPN 34, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 34);
    midichannels[1].controlchange(6, 0);
    // R Depth (NRPN 35, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 35);
    midichannels[1].controlchange(6, 0);
    // L Curve (NRPN 36, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 36);
    midichannels[1].controlchange(6, 0);
    // R Curve (NRPN 37, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 37);
    midichannels[1].controlchange(6, 0);
    // Tune (NRPN 38, range: -7–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 38);
    midichannels[1].controlchange(6, 64);
    // Coarse (NRPN 39, range: 0–31, default: 1)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 39);
    midichannels[1].controlchange(6, 4);
    // Fine (NRPN 40, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 40);
    midichannels[1].controlchange(6, 0);
    // L1 (NRPN 41, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 41);
    midichannels[1].controlchange(6, 127);
    // L2 (NRPN 42, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 42);
    midichannels[1].controlchange(6, 127);
    // L3 (NRPN 43, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 43);
    midichannels[1].controlchange(6, 127);
    // L4 (NRPN 44, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 44);
    midichannels[1].controlchange(6, 0);
    // R1 (NRPN 45, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 45);
    midichannels[1].controlchange(6, 127);
    // R2 (NRPN 46, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 46);
    midichannels[1].controlchange(6, 127);
    // R3 (NRPN 47, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 47);
    midichannels[1].controlchange(6, 127);
    // R4 (NRPN 48, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 48);
    midichannels[1].controlchange(6, 127);
    // Level (NRPN 49, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 49);
    midichannels[1].controlchange(6, 0);
    // Key Vel (NRPN 50, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 50);
    midichannels[1].controlchange(6, 0);
    // A Mod Sens (NRPN 51, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 51);
    midichannels[1].controlchange(6, 0);
    // Rate Scaling (NRPN 52, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 52);
    midichannels[1].controlchange(6, 0);
    // Breakpoint (NRPN 53, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 53);
    midichannels[1].controlchange(6, 0);
    // L Depth (NRPN 54, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 54);
    midichannels[1].controlchange(6, 0);
    // R Depth (NRPN 55, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 55);
    midichannels[1].controlchange(6, 0);
    // L Curve (NRPN 56, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 56);
    midichannels[1].controlchange(6, 0);
    // R Curve (NRPN 57, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 57);
    midichannels[1].controlchange(6, 0);
    // Tune (NRPN 58, range: -7–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 58);
    midichannels[1].controlchange(6, 64);
    // Coarse (NRPN 59, range: 0–31, default: 1)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 59);
    midichannels[1].controlchange(6, 4);
    // Fine (NRPN 60, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 60);
    midichannels[1].controlchange(6, 0);
    // L1 (NRPN 61, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 61);
    midichannels[1].controlchange(6, 127);
    // L2 (NRPN 62, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 62);
    midichannels[1].controlchange(6, 127);
    // L3 (NRPN 63, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 63);
    midichannels[1].controlchange(6, 127);
    // L4 (NRPN 64, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 64);
    midichannels[1].controlchange(6, 0);
    // R1 (NRPN 65, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 65);
    midichannels[1].controlchange(6, 127);
    // R2 (NRPN 66, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 66);
    midichannels[1].controlchange(6, 127);
    // R3 (NRPN 67, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 67);
    midichannels[1].controlchange(6, 127);
    // R4 (NRPN 68, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 68);
    midichannels[1].controlchange(6, 127);
    // Level (NRPN 69, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 69);
    midichannels[1].controlchange(6, 0);
    // Key Vel (NRPN 70, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 70);
    midichannels[1].controlchange(6, 0);
    // A Mod Sens (NRPN 71, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 71);
    midichannels[1].controlchange(6, 0);
    // Rate Scaling (NRPN 72, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 72);
    midichannels[1].controlchange(6, 0);
    // Breakpoint (NRPN 73, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 73);
    midichannels[1].controlchange(6, 0);
    // L Depth (NRPN 74, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 74);
    midichannels[1].controlchange(6, 0);
    // R Depth (NRPN 75, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 75);
    midichannels[1].controlchange(6, 0);
    // L Curve (NRPN 76, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 76);
    midichannels[1].controlchange(6, 0);
    // R Curve (NRPN 77, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 77);
    midichannels[1].controlchange(6, 0);
    // Tune (NRPN 78, range: -7–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 78);
    midichannels[1].controlchange(6, 64);
    // Coarse (NRPN 79, range: 0–31, default: 1)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 79);
    midichannels[1].controlchange(6, 4);
    // Fine (NRPN 80, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 80);
    midichannels[1].controlchange(6, 0);
    // L1 (NRPN 81, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 81);
    midichannels[1].controlchange(6, 127);
    // L2 (NRPN 82, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 82);
    midichannels[1].controlchange(6, 127);
    // L3 (NRPN 83, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 83);
    midichannels[1].controlchange(6, 127);
    // L4 (NRPN 84, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 84);
    midichannels[1].controlchange(6, 0);
    // R1 (NRPN 85, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 85);
    midichannels[1].controlchange(6, 127);
    // R2 (NRPN 86, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 86);
    midichannels[1].controlchange(6, 127);
    // R3 (NRPN 87, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 87);
    midichannels[1].controlchange(6, 127);
    // R4 (NRPN 88, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 88);
    midichannels[1].controlchange(6, 127);
    // Level (NRPN 89, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 89);
    midichannels[1].controlchange(6, 0);
    // Key Vel (NRPN 90, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 90);
    midichannels[1].controlchange(6, 0);
    // A Mod Sens (NRPN 91, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 91);
    midichannels[1].controlchange(6, 0);
    // Rate Scaling (NRPN 92, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 92);
    midichannels[1].controlchange(6, 0);
    // Breakpoint (NRPN 93, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 93);
    midichannels[1].controlchange(6, 0);
    // L Depth (NRPN 94, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 94);
    midichannels[1].controlchange(6, 0);
    // R Depth (NRPN 95, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 95);
    midichannels[1].controlchange(6, 0);
    // L Curve (NRPN 96, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 96);
    midichannels[1].controlchange(6, 0);
    // R Curve (NRPN 97, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 97);
    midichannels[1].controlchange(6, 0);
    // Tune (NRPN 98, range: -7–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 98);
    midichannels[1].controlchange(6, 64);
    // Coarse (NRPN 99, range: 0–31, default: 1)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 99);
    midichannels[1].controlchange(6, 4);
    // Fine (NRPN 100, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 100);
    midichannels[1].controlchange(6, 0);
    // L1 (NRPN 101, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 101);
    midichannels[1].controlchange(6, 127);
    // L2 (NRPN 102, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 102);
    midichannels[1].controlchange(6, 127);
    // L3 (NRPN 103, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 103);
    midichannels[1].controlchange(6, 127);
    // L4 (NRPN 104, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 104);
    midichannels[1].controlchange(6, 0);
    // R1 (NRPN 105, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 105);
    midichannels[1].controlchange(6, 127);
    // R2 (NRPN 106, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 106);
    midichannels[1].controlchange(6, 127);
    // R3 (NRPN 107, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 107);
    midichannels[1].controlchange(6, 127);
    // R4 (NRPN 108, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 108);
    midichannels[1].controlchange(6, 127);
    // Level (NRPN 109, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 109);
    midichannels[1].controlchange(6, 0);
    // Key Vel (NRPN 110, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 110);
    midichannels[1].controlchange(6, 0);
    // A Mod Sens (NRPN 111, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 111);
    midichannels[1].controlchange(6, 0);
    // Rate Scaling (NRPN 112, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 112);
    midichannels[1].controlchange(6, 0);
    // Breakpoint (NRPN 113, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 113);
    midichannels[1].controlchange(6, 0);
    // L Depth (NRPN 114, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 114);
    midichannels[1].controlchange(6, 0);
    // R Depth (NRPN 115, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 115);
    midichannels[1].controlchange(6, 0);
    // L Curve (NRPN 116, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 116);
    midichannels[1].controlchange(6, 0);
    // R Curve (NRPN 117, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 117);
    midichannels[1].controlchange(6, 0);
    // Tune (NRPN 118, range: -7–7, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 118);
    midichannels[1].controlchange(6, 64);
    // Coarse (NRPN 119, range: 0–31, default: 1)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 119);
    midichannels[1].controlchange(6, 4);
    // Fine (NRPN 120, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 120);
    midichannels[1].controlchange(6, 0);
    // L1 (NRPN 121, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 121);
    midichannels[1].controlchange(6, 127);
    // L2 (NRPN 122, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 122);
    midichannels[1].controlchange(6, 127);
    // L3 (NRPN 123, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 123);
    midichannels[1].controlchange(6, 127);
    // L4 (NRPN 124, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 124);
    midichannels[1].controlchange(6, 0);
    // R1 (NRPN 125, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 125);
    midichannels[1].controlchange(6, 127);
    // R2 (NRPN 126, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 126);
    midichannels[1].controlchange(6, 127);
    // R3 (NRPN 127, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 0);
    midichannels[1].controlchange(98, 127);
    midichannels[1].controlchange(6, 127);
    // R4 (NRPN 128, range: 0–99, default: 99)
    midichannels[1].controlchange(99, 1);
    midichannels[1].controlchange(98, 0);
    midichannels[1].controlchange(6, 127);
    // Level (NRPN 129, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 1);
    midichannels[1].controlchange(98, 1);
    midichannels[1].controlchange(6, 0);
    // Key Vel (NRPN 130, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 1);
    midichannels[1].controlchange(98, 2);
    midichannels[1].controlchange(6, 0);
    // A Mod Sens (NRPN 131, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 1);
    midichannels[1].controlchange(98, 3);
    midichannels[1].controlchange(6, 0);
    // Rate Scaling (NRPN 132, range: 0–7, default: 0)
    midichannels[1].controlchange(99, 1);
    midichannels[1].controlchange(98, 4);
    midichannels[1].controlchange(6, 0);
    // Breakpoint (NRPN 133, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 1);
    midichannels[1].controlchange(98, 5);
    midichannels[1].controlchange(6, 0);
    // L Depth (NRPN 134, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 1);
    midichannels[1].controlchange(98, 6);
    midichannels[1].controlchange(6, 0);
    // R Depth (NRPN 135, range: 0–99, default: 0)
    midichannels[1].controlchange(99, 1);
    midichannels[1].controlchange(98, 7);
    midichannels[1].controlchange(6, 0);
    // L Curve (NRPN 136, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 1);
    midichannels[1].controlchange(98, 8);
    midichannels[1].controlchange(6, 0);
    // R Curve (NRPN 137, range: 0–3, default: 0)
    midichannels[1].controlchange(99, 1);
    midichannels[1].controlchange(98, 9);
    midichannels[1].controlchange(6, 0);

    midichannels[2] = new Dx7_alg2Channel(10, (channel: MidiChannel) => new Dx7_alg2(channel));
    midichannels[2].controlchange(7, 100);
    midichannels[2].controlchange(10, 64);
    midichannels[2].controlchange(91, 10);

    // Feedback (NRPN 0, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 0);
    midichannels[2].controlchange(6, 0);
    // Transpose (NRPN 1, range: -24–24, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 1);
    midichannels[2].controlchange(6, 64);
    // Osc Key Sync (NRPN 2, range: 0–1, default: 1)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 2);
    midichannels[2].controlchange(6, 127);
    // L1 (NRPN 3, range: 0–99, default: 50)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 3);
    midichannels[2].controlchange(6, 64);
    // L2 (NRPN 4, range: 0–99, default: 50)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 4);
    midichannels[2].controlchange(6, 64);
    // L3 (NRPN 5, range: 0–99, default: 50)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 5);
    midichannels[2].controlchange(6, 64);
    // L4 (NRPN 6, range: 0–99, default: 50)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 6);
    midichannels[2].controlchange(6, 64);
    // R1 (NRPN 7, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 7);
    midichannels[2].controlchange(6, 127);
    // R2 (NRPN 8, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 8);
    midichannels[2].controlchange(6, 127);
    // R3 (NRPN 9, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 9);
    midichannels[2].controlchange(6, 127);
    // R4 (NRPN 10, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 10);
    midichannels[2].controlchange(6, 127);
    // Wave (NRPN 11, range: 0–5, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 11);
    midichannels[2].controlchange(6, 0);
    // Speed (NRPN 12, range: 0–99, default: 35)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 12);
    midichannels[2].controlchange(6, 45);
    // Delay (NRPN 13, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 13);
    midichannels[2].controlchange(6, 0);
    // PMD (NRPN 14, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 14);
    midichannels[2].controlchange(6, 0);
    // AMD (NRPN 15, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 15);
    midichannels[2].controlchange(6, 0);
    // Sync (NRPN 16, range: 0–1, default: 1)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 16);
    midichannels[2].controlchange(6, 127);
    // P Mod Sens (NRPN 17, range: 0–7, default: 3)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 17);
    midichannels[2].controlchange(6, 54);
    // Tune (NRPN 18, range: -7–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 18);
    midichannels[2].controlchange(6, 64);
    // Coarse (NRPN 19, range: 0–31, default: 1)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 19);
    midichannels[2].controlchange(6, 4);
    // Fine (NRPN 20, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 20);
    midichannels[2].controlchange(6, 0);
    // L1 (NRPN 21, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 21);
    midichannels[2].controlchange(6, 127);
    // L2 (NRPN 22, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 22);
    midichannels[2].controlchange(6, 127);
    // L3 (NRPN 23, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 23);
    midichannels[2].controlchange(6, 127);
    // L4 (NRPN 24, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 24);
    midichannels[2].controlchange(6, 0);
    // R1 (NRPN 25, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 25);
    midichannels[2].controlchange(6, 127);
    // R2 (NRPN 26, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 26);
    midichannels[2].controlchange(6, 127);
    // R3 (NRPN 27, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 27);
    midichannels[2].controlchange(6, 127);
    // R4 (NRPN 28, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 28);
    midichannels[2].controlchange(6, 127);
    // Level (NRPN 29, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 29);
    midichannels[2].controlchange(6, 127);
    // Key Vel (NRPN 30, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 30);
    midichannels[2].controlchange(6, 0);
    // A Mod Sens (NRPN 31, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 31);
    midichannels[2].controlchange(6, 0);
    // Rate Scaling (NRPN 32, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 32);
    midichannels[2].controlchange(6, 0);
    // Breakpoint (NRPN 33, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 33);
    midichannels[2].controlchange(6, 0);
    // L Depth (NRPN 34, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 34);
    midichannels[2].controlchange(6, 0);
    // R Depth (NRPN 35, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 35);
    midichannels[2].controlchange(6, 0);
    // L Curve (NRPN 36, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 36);
    midichannels[2].controlchange(6, 0);
    // R Curve (NRPN 37, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 37);
    midichannels[2].controlchange(6, 0);
    // Tune (NRPN 38, range: -7–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 38);
    midichannels[2].controlchange(6, 64);
    // Coarse (NRPN 39, range: 0–31, default: 1)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 39);
    midichannels[2].controlchange(6, 4);
    // Fine (NRPN 40, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 40);
    midichannels[2].controlchange(6, 0);
    // L1 (NRPN 41, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 41);
    midichannels[2].controlchange(6, 127);
    // L2 (NRPN 42, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 42);
    midichannels[2].controlchange(6, 127);
    // L3 (NRPN 43, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 43);
    midichannels[2].controlchange(6, 127);
    // L4 (NRPN 44, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 44);
    midichannels[2].controlchange(6, 0);
    // R1 (NRPN 45, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 45);
    midichannels[2].controlchange(6, 127);
    // R2 (NRPN 46, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 46);
    midichannels[2].controlchange(6, 127);
    // R3 (NRPN 47, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 47);
    midichannels[2].controlchange(6, 127);
    // R4 (NRPN 48, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 48);
    midichannels[2].controlchange(6, 127);
    // Level (NRPN 49, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 49);
    midichannels[2].controlchange(6, 0);
    // Key Vel (NRPN 50, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 50);
    midichannels[2].controlchange(6, 0);
    // A Mod Sens (NRPN 51, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 51);
    midichannels[2].controlchange(6, 0);
    // Rate Scaling (NRPN 52, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 52);
    midichannels[2].controlchange(6, 0);
    // Breakpoint (NRPN 53, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 53);
    midichannels[2].controlchange(6, 0);
    // L Depth (NRPN 54, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 54);
    midichannels[2].controlchange(6, 0);
    // R Depth (NRPN 55, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 55);
    midichannels[2].controlchange(6, 0);
    // L Curve (NRPN 56, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 56);
    midichannels[2].controlchange(6, 0);
    // R Curve (NRPN 57, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 57);
    midichannels[2].controlchange(6, 0);
    // Tune (NRPN 58, range: -7–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 58);
    midichannels[2].controlchange(6, 64);
    // Coarse (NRPN 59, range: 0–31, default: 1)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 59);
    midichannels[2].controlchange(6, 4);
    // Fine (NRPN 60, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 60);
    midichannels[2].controlchange(6, 0);
    // L1 (NRPN 61, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 61);
    midichannels[2].controlchange(6, 127);
    // L2 (NRPN 62, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 62);
    midichannels[2].controlchange(6, 127);
    // L3 (NRPN 63, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 63);
    midichannels[2].controlchange(6, 127);
    // L4 (NRPN 64, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 64);
    midichannels[2].controlchange(6, 0);
    // R1 (NRPN 65, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 65);
    midichannels[2].controlchange(6, 127);
    // R2 (NRPN 66, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 66);
    midichannels[2].controlchange(6, 127);
    // R3 (NRPN 67, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 67);
    midichannels[2].controlchange(6, 127);
    // R4 (NRPN 68, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 68);
    midichannels[2].controlchange(6, 127);
    // Level (NRPN 69, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 69);
    midichannels[2].controlchange(6, 0);
    // Key Vel (NRPN 70, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 70);
    midichannels[2].controlchange(6, 0);
    // A Mod Sens (NRPN 71, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 71);
    midichannels[2].controlchange(6, 0);
    // Rate Scaling (NRPN 72, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 72);
    midichannels[2].controlchange(6, 0);
    // Breakpoint (NRPN 73, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 73);
    midichannels[2].controlchange(6, 0);
    // L Depth (NRPN 74, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 74);
    midichannels[2].controlchange(6, 0);
    // R Depth (NRPN 75, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 75);
    midichannels[2].controlchange(6, 0);
    // L Curve (NRPN 76, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 76);
    midichannels[2].controlchange(6, 0);
    // R Curve (NRPN 77, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 77);
    midichannels[2].controlchange(6, 0);
    // Tune (NRPN 78, range: -7–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 78);
    midichannels[2].controlchange(6, 64);
    // Coarse (NRPN 79, range: 0–31, default: 1)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 79);
    midichannels[2].controlchange(6, 4);
    // Fine (NRPN 80, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 80);
    midichannels[2].controlchange(6, 0);
    // L1 (NRPN 81, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 81);
    midichannels[2].controlchange(6, 127);
    // L2 (NRPN 82, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 82);
    midichannels[2].controlchange(6, 127);
    // L3 (NRPN 83, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 83);
    midichannels[2].controlchange(6, 127);
    // L4 (NRPN 84, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 84);
    midichannels[2].controlchange(6, 0);
    // R1 (NRPN 85, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 85);
    midichannels[2].controlchange(6, 127);
    // R2 (NRPN 86, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 86);
    midichannels[2].controlchange(6, 127);
    // R3 (NRPN 87, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 87);
    midichannels[2].controlchange(6, 127);
    // R4 (NRPN 88, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 88);
    midichannels[2].controlchange(6, 127);
    // Level (NRPN 89, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 89);
    midichannels[2].controlchange(6, 0);
    // Key Vel (NRPN 90, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 90);
    midichannels[2].controlchange(6, 0);
    // A Mod Sens (NRPN 91, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 91);
    midichannels[2].controlchange(6, 0);
    // Rate Scaling (NRPN 92, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 92);
    midichannels[2].controlchange(6, 0);
    // Breakpoint (NRPN 93, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 93);
    midichannels[2].controlchange(6, 0);
    // L Depth (NRPN 94, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 94);
    midichannels[2].controlchange(6, 0);
    // R Depth (NRPN 95, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 95);
    midichannels[2].controlchange(6, 0);
    // L Curve (NRPN 96, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 96);
    midichannels[2].controlchange(6, 0);
    // R Curve (NRPN 97, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 97);
    midichannels[2].controlchange(6, 0);
    // Tune (NRPN 98, range: -7–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 98);
    midichannels[2].controlchange(6, 64);
    // Coarse (NRPN 99, range: 0–31, default: 1)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 99);
    midichannels[2].controlchange(6, 4);
    // Fine (NRPN 100, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 100);
    midichannels[2].controlchange(6, 0);
    // L1 (NRPN 101, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 101);
    midichannels[2].controlchange(6, 127);
    // L2 (NRPN 102, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 102);
    midichannels[2].controlchange(6, 127);
    // L3 (NRPN 103, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 103);
    midichannels[2].controlchange(6, 127);
    // L4 (NRPN 104, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 104);
    midichannels[2].controlchange(6, 0);
    // R1 (NRPN 105, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 105);
    midichannels[2].controlchange(6, 127);
    // R2 (NRPN 106, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 106);
    midichannels[2].controlchange(6, 127);
    // R3 (NRPN 107, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 107);
    midichannels[2].controlchange(6, 127);
    // R4 (NRPN 108, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 108);
    midichannels[2].controlchange(6, 127);
    // Level (NRPN 109, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 109);
    midichannels[2].controlchange(6, 0);
    // Key Vel (NRPN 110, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 110);
    midichannels[2].controlchange(6, 0);
    // A Mod Sens (NRPN 111, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 111);
    midichannels[2].controlchange(6, 0);
    // Rate Scaling (NRPN 112, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 112);
    midichannels[2].controlchange(6, 0);
    // Breakpoint (NRPN 113, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 113);
    midichannels[2].controlchange(6, 0);
    // L Depth (NRPN 114, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 114);
    midichannels[2].controlchange(6, 0);
    // R Depth (NRPN 115, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 115);
    midichannels[2].controlchange(6, 0);
    // L Curve (NRPN 116, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 116);
    midichannels[2].controlchange(6, 0);
    // R Curve (NRPN 117, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 117);
    midichannels[2].controlchange(6, 0);
    // Tune (NRPN 118, range: -7–7, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 118);
    midichannels[2].controlchange(6, 64);
    // Coarse (NRPN 119, range: 0–31, default: 1)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 119);
    midichannels[2].controlchange(6, 4);
    // Fine (NRPN 120, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 120);
    midichannels[2].controlchange(6, 0);
    // L1 (NRPN 121, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 121);
    midichannels[2].controlchange(6, 127);
    // L2 (NRPN 122, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 122);
    midichannels[2].controlchange(6, 127);
    // L3 (NRPN 123, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 123);
    midichannels[2].controlchange(6, 127);
    // L4 (NRPN 124, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 124);
    midichannels[2].controlchange(6, 0);
    // R1 (NRPN 125, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 125);
    midichannels[2].controlchange(6, 127);
    // R2 (NRPN 126, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 126);
    midichannels[2].controlchange(6, 127);
    // R3 (NRPN 127, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 0);
    midichannels[2].controlchange(98, 127);
    midichannels[2].controlchange(6, 127);
    // R4 (NRPN 128, range: 0–99, default: 99)
    midichannels[2].controlchange(99, 1);
    midichannels[2].controlchange(98, 0);
    midichannels[2].controlchange(6, 127);
    // Level (NRPN 129, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 1);
    midichannels[2].controlchange(98, 1);
    midichannels[2].controlchange(6, 0);
    // Key Vel (NRPN 130, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 1);
    midichannels[2].controlchange(98, 2);
    midichannels[2].controlchange(6, 0);
    // A Mod Sens (NRPN 131, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 1);
    midichannels[2].controlchange(98, 3);
    midichannels[2].controlchange(6, 0);
    // Rate Scaling (NRPN 132, range: 0–7, default: 0)
    midichannels[2].controlchange(99, 1);
    midichannels[2].controlchange(98, 4);
    midichannels[2].controlchange(6, 0);
    // Breakpoint (NRPN 133, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 1);
    midichannels[2].controlchange(98, 5);
    midichannels[2].controlchange(6, 0);
    // L Depth (NRPN 134, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 1);
    midichannels[2].controlchange(98, 6);
    midichannels[2].controlchange(6, 0);
    // R Depth (NRPN 135, range: 0–99, default: 0)
    midichannels[2].controlchange(99, 1);
    midichannels[2].controlchange(98, 7);
    midichannels[2].controlchange(6, 0);
    // L Curve (NRPN 136, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 1);
    midichannels[2].controlchange(98, 8);
    midichannels[2].controlchange(6, 0);
    // R Curve (NRPN 137, range: 0–3, default: 0)
    midichannels[2].controlchange(99, 1);
    midichannels[2].controlchange(98, 9);
    midichannels[2].controlchange(6, 0);

    midichannels[3] = new Dx7_alg5_bellsChannel(10, (channel: MidiChannel) => new Dx7_alg5_bells(channel));
    midichannels[3].controlchange(7, 100);
    midichannels[3].controlchange(10, 64);
    midichannels[3].controlchange(91, 10);

    // Feedback (NRPN 0, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 0);
    midichannels[3].controlchange(6, 0);
    // Transpose (NRPN 1, range: -24–24, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 1);
    midichannels[3].controlchange(6, 64);
    // Osc Key Sync (NRPN 2, range: 0–1, default: 1)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 2);
    midichannels[3].controlchange(6, 127);
    // L1 (NRPN 3, range: 0–99, default: 50)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 3);
    midichannels[3].controlchange(6, 64);
    // L2 (NRPN 4, range: 0–99, default: 50)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 4);
    midichannels[3].controlchange(6, 64);
    // L3 (NRPN 5, range: 0–99, default: 50)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 5);
    midichannels[3].controlchange(6, 64);
    // L4 (NRPN 6, range: 0–99, default: 50)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 6);
    midichannels[3].controlchange(6, 64);
    // R1 (NRPN 7, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 7);
    midichannels[3].controlchange(6, 127);
    // R2 (NRPN 8, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 8);
    midichannels[3].controlchange(6, 127);
    // R3 (NRPN 9, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 9);
    midichannels[3].controlchange(6, 127);
    // R4 (NRPN 10, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 10);
    midichannels[3].controlchange(6, 127);
    // Wave (NRPN 11, range: 0–5, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 11);
    midichannels[3].controlchange(6, 0);
    // Speed (NRPN 12, range: 0–99, default: 35)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 12);
    midichannels[3].controlchange(6, 45);
    // Delay (NRPN 13, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 13);
    midichannels[3].controlchange(6, 0);
    // PMD (NRPN 14, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 14);
    midichannels[3].controlchange(6, 0);
    // AMD (NRPN 15, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 15);
    midichannels[3].controlchange(6, 0);
    // Sync (NRPN 16, range: 0–1, default: 1)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 16);
    midichannels[3].controlchange(6, 127);
    // P Mod Sens (NRPN 17, range: 0–7, default: 3)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 17);
    midichannels[3].controlchange(6, 54);
    // Tune (NRPN 18, range: -7–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 18);
    midichannels[3].controlchange(6, 64);
    // Coarse (NRPN 19, range: 0–31, default: 1)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 19);
    midichannels[3].controlchange(6, 4);
    // Fine (NRPN 20, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 20);
    midichannels[3].controlchange(6, 0);
    // L1 (NRPN 21, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 21);
    midichannels[3].controlchange(6, 127);
    // L2 (NRPN 22, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 22);
    midichannels[3].controlchange(6, 127);
    // L3 (NRPN 23, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 23);
    midichannels[3].controlchange(6, 127);
    // L4 (NRPN 24, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 24);
    midichannels[3].controlchange(6, 0);
    // R1 (NRPN 25, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 25);
    midichannels[3].controlchange(6, 127);
    // R2 (NRPN 26, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 26);
    midichannels[3].controlchange(6, 127);
    // R3 (NRPN 27, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 27);
    midichannels[3].controlchange(6, 127);
    // R4 (NRPN 28, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 28);
    midichannels[3].controlchange(6, 127);
    // Level (NRPN 29, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 29);
    midichannels[3].controlchange(6, 127);
    // Key Vel (NRPN 30, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 30);
    midichannels[3].controlchange(6, 0);
    // A Mod Sens (NRPN 31, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 31);
    midichannels[3].controlchange(6, 0);
    // Rate Scaling (NRPN 32, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 32);
    midichannels[3].controlchange(6, 0);
    // Breakpoint (NRPN 33, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 33);
    midichannels[3].controlchange(6, 0);
    // L Depth (NRPN 34, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 34);
    midichannels[3].controlchange(6, 0);
    // R Depth (NRPN 35, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 35);
    midichannels[3].controlchange(6, 0);
    // L Curve (NRPN 36, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 36);
    midichannels[3].controlchange(6, 0);
    // R Curve (NRPN 37, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 37);
    midichannels[3].controlchange(6, 0);
    // Tune (NRPN 38, range: -7–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 38);
    midichannels[3].controlchange(6, 64);
    // Coarse (NRPN 39, range: 0–31, default: 1)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 39);
    midichannels[3].controlchange(6, 4);
    // Fine (NRPN 40, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 40);
    midichannels[3].controlchange(6, 0);
    // L1 (NRPN 41, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 41);
    midichannels[3].controlchange(6, 127);
    // L2 (NRPN 42, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 42);
    midichannels[3].controlchange(6, 127);
    // L3 (NRPN 43, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 43);
    midichannels[3].controlchange(6, 127);
    // L4 (NRPN 44, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 44);
    midichannels[3].controlchange(6, 0);
    // R1 (NRPN 45, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 45);
    midichannels[3].controlchange(6, 127);
    // R2 (NRPN 46, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 46);
    midichannels[3].controlchange(6, 127);
    // R3 (NRPN 47, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 47);
    midichannels[3].controlchange(6, 127);
    // R4 (NRPN 48, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 48);
    midichannels[3].controlchange(6, 127);
    // Level (NRPN 49, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 49);
    midichannels[3].controlchange(6, 0);
    // Key Vel (NRPN 50, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 50);
    midichannels[3].controlchange(6, 0);
    // A Mod Sens (NRPN 51, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 51);
    midichannels[3].controlchange(6, 0);
    // Rate Scaling (NRPN 52, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 52);
    midichannels[3].controlchange(6, 0);
    // Breakpoint (NRPN 53, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 53);
    midichannels[3].controlchange(6, 0);
    // L Depth (NRPN 54, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 54);
    midichannels[3].controlchange(6, 0);
    // R Depth (NRPN 55, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 55);
    midichannels[3].controlchange(6, 0);
    // L Curve (NRPN 56, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 56);
    midichannels[3].controlchange(6, 0);
    // R Curve (NRPN 57, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 57);
    midichannels[3].controlchange(6, 0);
    // Tune (NRPN 58, range: -7–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 58);
    midichannels[3].controlchange(6, 64);
    // Coarse (NRPN 59, range: 0–31, default: 1)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 59);
    midichannels[3].controlchange(6, 4);
    // Fine (NRPN 60, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 60);
    midichannels[3].controlchange(6, 0);
    // L1 (NRPN 61, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 61);
    midichannels[3].controlchange(6, 127);
    // L2 (NRPN 62, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 62);
    midichannels[3].controlchange(6, 127);
    // L3 (NRPN 63, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 63);
    midichannels[3].controlchange(6, 127);
    // L4 (NRPN 64, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 64);
    midichannels[3].controlchange(6, 0);
    // R1 (NRPN 65, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 65);
    midichannels[3].controlchange(6, 127);
    // R2 (NRPN 66, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 66);
    midichannels[3].controlchange(6, 127);
    // R3 (NRPN 67, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 67);
    midichannels[3].controlchange(6, 127);
    // R4 (NRPN 68, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 68);
    midichannels[3].controlchange(6, 127);
    // Level (NRPN 69, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 69);
    midichannels[3].controlchange(6, 0);
    // Key Vel (NRPN 70, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 70);
    midichannels[3].controlchange(6, 0);
    // A Mod Sens (NRPN 71, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 71);
    midichannels[3].controlchange(6, 0);
    // Rate Scaling (NRPN 72, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 72);
    midichannels[3].controlchange(6, 0);
    // Breakpoint (NRPN 73, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 73);
    midichannels[3].controlchange(6, 0);
    // L Depth (NRPN 74, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 74);
    midichannels[3].controlchange(6, 0);
    // R Depth (NRPN 75, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 75);
    midichannels[3].controlchange(6, 0);
    // L Curve (NRPN 76, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 76);
    midichannels[3].controlchange(6, 0);
    // R Curve (NRPN 77, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 77);
    midichannels[3].controlchange(6, 0);
    // Tune (NRPN 78, range: -7–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 78);
    midichannels[3].controlchange(6, 64);
    // Coarse (NRPN 79, range: 0–31, default: 1)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 79);
    midichannels[3].controlchange(6, 4);
    // Fine (NRPN 80, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 80);
    midichannels[3].controlchange(6, 0);
    // L1 (NRPN 81, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 81);
    midichannels[3].controlchange(6, 127);
    // L2 (NRPN 82, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 82);
    midichannels[3].controlchange(6, 127);
    // L3 (NRPN 83, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 83);
    midichannels[3].controlchange(6, 127);
    // L4 (NRPN 84, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 84);
    midichannels[3].controlchange(6, 0);
    // R1 (NRPN 85, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 85);
    midichannels[3].controlchange(6, 127);
    // R2 (NRPN 86, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 86);
    midichannels[3].controlchange(6, 127);
    // R3 (NRPN 87, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 87);
    midichannels[3].controlchange(6, 127);
    // R4 (NRPN 88, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 88);
    midichannels[3].controlchange(6, 127);
    // Level (NRPN 89, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 89);
    midichannels[3].controlchange(6, 0);
    // Key Vel (NRPN 90, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 90);
    midichannels[3].controlchange(6, 0);
    // A Mod Sens (NRPN 91, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 91);
    midichannels[3].controlchange(6, 0);
    // Rate Scaling (NRPN 92, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 92);
    midichannels[3].controlchange(6, 0);
    // Breakpoint (NRPN 93, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 93);
    midichannels[3].controlchange(6, 0);
    // L Depth (NRPN 94, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 94);
    midichannels[3].controlchange(6, 0);
    // R Depth (NRPN 95, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 95);
    midichannels[3].controlchange(6, 0);
    // L Curve (NRPN 96, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 96);
    midichannels[3].controlchange(6, 0);
    // R Curve (NRPN 97, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 97);
    midichannels[3].controlchange(6, 0);
    // Tune (NRPN 98, range: -7–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 98);
    midichannels[3].controlchange(6, 64);
    // Coarse (NRPN 99, range: 0–31, default: 1)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 99);
    midichannels[3].controlchange(6, 4);
    // Fine (NRPN 100, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 100);
    midichannels[3].controlchange(6, 0);
    // L1 (NRPN 101, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 101);
    midichannels[3].controlchange(6, 127);
    // L2 (NRPN 102, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 102);
    midichannels[3].controlchange(6, 127);
    // L3 (NRPN 103, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 103);
    midichannels[3].controlchange(6, 127);
    // L4 (NRPN 104, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 104);
    midichannels[3].controlchange(6, 0);
    // R1 (NRPN 105, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 105);
    midichannels[3].controlchange(6, 127);
    // R2 (NRPN 106, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 106);
    midichannels[3].controlchange(6, 127);
    // R3 (NRPN 107, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 107);
    midichannels[3].controlchange(6, 127);
    // R4 (NRPN 108, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 108);
    midichannels[3].controlchange(6, 127);
    // Level (NRPN 109, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 109);
    midichannels[3].controlchange(6, 0);
    // Key Vel (NRPN 110, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 110);
    midichannels[3].controlchange(6, 0);
    // A Mod Sens (NRPN 111, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 111);
    midichannels[3].controlchange(6, 0);
    // Rate Scaling (NRPN 112, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 112);
    midichannels[3].controlchange(6, 0);
    // Breakpoint (NRPN 113, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 113);
    midichannels[3].controlchange(6, 0);
    // L Depth (NRPN 114, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 114);
    midichannels[3].controlchange(6, 0);
    // R Depth (NRPN 115, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 115);
    midichannels[3].controlchange(6, 0);
    // L Curve (NRPN 116, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 116);
    midichannels[3].controlchange(6, 0);
    // R Curve (NRPN 117, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 117);
    midichannels[3].controlchange(6, 0);
    // Tune (NRPN 118, range: -7–7, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 118);
    midichannels[3].controlchange(6, 64);
    // Coarse (NRPN 119, range: 0–31, default: 1)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 119);
    midichannels[3].controlchange(6, 4);
    // Fine (NRPN 120, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 120);
    midichannels[3].controlchange(6, 0);
    // L1 (NRPN 121, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 121);
    midichannels[3].controlchange(6, 127);
    // L2 (NRPN 122, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 122);
    midichannels[3].controlchange(6, 127);
    // L3 (NRPN 123, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 123);
    midichannels[3].controlchange(6, 127);
    // L4 (NRPN 124, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 124);
    midichannels[3].controlchange(6, 0);
    // R1 (NRPN 125, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 125);
    midichannels[3].controlchange(6, 127);
    // R2 (NRPN 126, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 126);
    midichannels[3].controlchange(6, 127);
    // R3 (NRPN 127, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 0);
    midichannels[3].controlchange(98, 127);
    midichannels[3].controlchange(6, 127);
    // R4 (NRPN 128, range: 0–99, default: 99)
    midichannels[3].controlchange(99, 1);
    midichannels[3].controlchange(98, 0);
    midichannels[3].controlchange(6, 127);
    // Level (NRPN 129, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 1);
    midichannels[3].controlchange(98, 1);
    midichannels[3].controlchange(6, 0);
    // Key Vel (NRPN 130, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 1);
    midichannels[3].controlchange(98, 2);
    midichannels[3].controlchange(6, 0);
    // A Mod Sens (NRPN 131, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 1);
    midichannels[3].controlchange(98, 3);
    midichannels[3].controlchange(6, 0);
    // Rate Scaling (NRPN 132, range: 0–7, default: 0)
    midichannels[3].controlchange(99, 1);
    midichannels[3].controlchange(98, 4);
    midichannels[3].controlchange(6, 0);
    // Breakpoint (NRPN 133, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 1);
    midichannels[3].controlchange(98, 5);
    midichannels[3].controlchange(6, 0);
    // L Depth (NRPN 134, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 1);
    midichannels[3].controlchange(98, 6);
    midichannels[3].controlchange(6, 0);
    // R Depth (NRPN 135, range: 0–99, default: 0)
    midichannels[3].controlchange(99, 1);
    midichannels[3].controlchange(98, 7);
    midichannels[3].controlchange(6, 0);
    // L Curve (NRPN 136, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 1);
    midichannels[3].controlchange(98, 8);
    midichannels[3].controlchange(6, 0);
    // R Curve (NRPN 137, range: 0–3, default: 0)
    midichannels[3].controlchange(99, 1);
    midichannels[3].controlchange(98, 9);
    midichannels[3].controlchange(6, 0);

    // --- Channel 4: DX7 Drum Kit (Kick=c2, Snare=d2, Hat=fs3) ---
    // Note: Kick/Snare mapped to octave 2 because Faust DX7 lacks fixed-frequency
    // operator mode — lower base frequency compensates for ratio-mode interpretation.
    midichannels[4] = new Dx7DrumKitChannel(6, (channel: MidiChannel, n: i32): MidiVoice => {
        if (n < 2) { const v = new Dx7_alg17(channel); v.minnote = 24; v.maxnote = 24; return v; }
        if (n < 4) { const v = new Dx7_alg21(channel); v.minnote = 26; v.maxnote = 26; return v; }
        const v = new Dx7_alg5_hat(channel); v.minnote = 42; v.maxnote = 42; return v;
    });
    midichannels[4].controlchange(7, 100);
    midichannels[4].controlchange(10, 64);
    midichannels[4].controlchange(91, 10);


    // Feedback (NRPN 0, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 0);
    midichannels[4].controlchange(6, 0);
    // Transpose (NRPN 1, range: -24–24, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 1);
    midichannels[4].controlchange(6, 64);
    // Osc Key Sync (NRPN 2, range: 0–1, default: 1)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 2);
    midichannels[4].controlchange(6, 127);
    // L1 (NRPN 3, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 3);
    midichannels[4].controlchange(6, 64);
    // L2 (NRPN 4, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 4);
    midichannels[4].controlchange(6, 64);
    // L3 (NRPN 5, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 5);
    midichannels[4].controlchange(6, 64);
    // L4 (NRPN 6, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 6);
    midichannels[4].controlchange(6, 64);
    // R1 (NRPN 7, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 7);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 8, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 8);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 9, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 9);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 10, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 10);
    midichannels[4].controlchange(6, 127);
    // Wave (NRPN 11, range: 0–5, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 11);
    midichannels[4].controlchange(6, 0);
    // Speed (NRPN 12, range: 0–99, default: 35)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 12);
    midichannels[4].controlchange(6, 45);
    // Delay (NRPN 13, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 13);
    midichannels[4].controlchange(6, 0);
    // PMD (NRPN 14, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 14);
    midichannels[4].controlchange(6, 0);
    // AMD (NRPN 15, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 15);
    midichannels[4].controlchange(6, 0);
    // Sync (NRPN 16, range: 0–1, default: 1)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 16);
    midichannels[4].controlchange(6, 127);
    // P Mod Sens (NRPN 17, range: 0–7, default: 3)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 17);
    midichannels[4].controlchange(6, 54);
    // Tune (NRPN 18, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 18);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 19, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 19);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 20, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 20);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 21, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 21);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 22, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 22);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 23, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 23);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 24, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 24);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 25, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 25);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 26, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 26);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 27, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 27);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 28, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 28);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 29, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 29);
    midichannels[4].controlchange(6, 127);
    // Key Vel (NRPN 30, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 30);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 31, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 31);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 32, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 32);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 33, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 33);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 34, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 34);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 35, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 35);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 36, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 36);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 37, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 37);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 38, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 38);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 39, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 39);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 40, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 40);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 41, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 41);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 42, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 42);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 43, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 43);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 44, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 44);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 45, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 45);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 46, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 46);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 47, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 47);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 48, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 48);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 49, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 49);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 50, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 50);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 51, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 51);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 52, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 52);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 53, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 53);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 54, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 54);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 55, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 55);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 56, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 56);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 57, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 57);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 58, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 58);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 59, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 59);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 60, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 60);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 61, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 61);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 62, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 62);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 63, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 63);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 64, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 64);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 65, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 65);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 66, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 66);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 67, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 67);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 68, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 68);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 69, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 69);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 70, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 70);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 71, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 71);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 72, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 72);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 73, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 73);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 74, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 74);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 75, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 75);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 76, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 76);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 77, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 77);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 78, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 78);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 79, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 79);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 80, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 80);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 81, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 81);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 82, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 82);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 83, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 83);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 84, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 84);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 85, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 85);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 86, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 86);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 87, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 87);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 88, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 88);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 89, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 89);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 90, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 90);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 91, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 91);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 92, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 92);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 93, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 93);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 94, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 94);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 95, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 95);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 96, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 96);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 97, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 97);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 98, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 98);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 99, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 99);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 100, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 100);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 101, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 101);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 102, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 102);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 103, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 103);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 104, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 104);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 105, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 105);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 106, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 106);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 107, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 107);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 108, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 108);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 109, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 109);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 110, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 110);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 111, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 111);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 112, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 112);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 113, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 113);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 114, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 114);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 115, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 115);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 116, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 116);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 117, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 117);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 118, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 118);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 119, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 119);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 120, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 120);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 121, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 121);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 122, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 122);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 123, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 123);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 124, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 124);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 125, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 125);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 126, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 126);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 127, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 0);
    midichannels[4].controlchange(98, 127);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 128, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 0);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 129, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 1);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 130, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 2);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 131, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 3);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 132, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 4);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 133, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 5);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 134, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 6);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 135, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 7);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 136, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 8);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 137, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 9);
    midichannels[4].controlchange(6, 0);


    // --- Snare (Dx7_alg21) defaults: NRPN 138–275 ---

    // Feedback (NRPN 138, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 10);
    midichannels[4].controlchange(6, 0);
    // Transpose (NRPN 139, range: -24–24, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 11);
    midichannels[4].controlchange(6, 64);
    // Osc Key Sync (NRPN 140, range: 0–1, default: 1)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 12);
    midichannels[4].controlchange(6, 127);
    // L1 (NRPN 141, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 13);
    midichannels[4].controlchange(6, 64);
    // L2 (NRPN 142, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 14);
    midichannels[4].controlchange(6, 64);
    // L3 (NRPN 143, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 15);
    midichannels[4].controlchange(6, 64);
    // L4 (NRPN 144, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 16);
    midichannels[4].controlchange(6, 64);
    // R1 (NRPN 145, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 17);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 146, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 18);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 147, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 19);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 148, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 20);
    midichannels[4].controlchange(6, 127);
    // Wave (NRPN 149, range: 0–5, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 21);
    midichannels[4].controlchange(6, 0);
    // Speed (NRPN 150, range: 0–99, default: 35)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 22);
    midichannels[4].controlchange(6, 45);
    // Delay (NRPN 151, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 23);
    midichannels[4].controlchange(6, 0);
    // PMD (NRPN 152, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 24);
    midichannels[4].controlchange(6, 0);
    // AMD (NRPN 153, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 25);
    midichannels[4].controlchange(6, 0);
    // Sync (NRPN 154, range: 0–1, default: 1)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 26);
    midichannels[4].controlchange(6, 127);
    // P Mod Sens (NRPN 155, range: 0–7, default: 3)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 27);
    midichannels[4].controlchange(6, 54);
    // Tune (NRPN 156, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 28);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 157, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 29);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 158, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 30);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 159, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 31);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 160, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 32);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 161, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 33);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 162, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 34);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 163, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 35);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 164, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 36);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 165, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 37);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 166, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 38);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 167, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 39);
    midichannels[4].controlchange(6, 127);
    // Key Vel (NRPN 168, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 40);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 169, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 41);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 170, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 42);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 171, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 43);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 172, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 44);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 173, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 45);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 174, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 46);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 175, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 47);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 176, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 48);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 177, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 49);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 178, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 50);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 179, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 51);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 180, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 52);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 181, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 53);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 182, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 54);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 183, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 55);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 184, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 56);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 185, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 57);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 186, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 58);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 187, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 59);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 188, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 60);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 189, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 61);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 190, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 62);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 191, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 63);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 192, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 64);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 193, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 65);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 194, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 66);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 195, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 67);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 196, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 68);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 197, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 69);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 198, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 70);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 199, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 71);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 200, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 72);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 201, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 73);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 202, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 74);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 203, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 75);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 204, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 76);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 205, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 77);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 206, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 78);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 207, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 79);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 208, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 80);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 209, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 81);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 210, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 82);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 211, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 83);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 212, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 84);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 213, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 85);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 214, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 86);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 215, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 87);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 216, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 88);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 217, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 89);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 218, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 90);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 219, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 91);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 220, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 92);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 221, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 93);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 222, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 94);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 223, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 95);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 224, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 96);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 225, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 97);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 226, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 98);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 227, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 99);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 228, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 100);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 229, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 101);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 230, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 102);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 231, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 103);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 232, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 104);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 233, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 105);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 234, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 106);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 235, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 107);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 236, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 108);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 237, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 109);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 238, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 110);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 239, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 111);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 240, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 112);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 241, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 113);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 242, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 114);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 243, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 115);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 244, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 116);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 245, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 117);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 246, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 118);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 247, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 119);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 248, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 120);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 249, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 121);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 250, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 122);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 251, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 123);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 252, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 124);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 253, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 125);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 254, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 126);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 255, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 1);
    midichannels[4].controlchange(98, 127);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 256, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 0);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 257, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 1);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 258, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 2);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 259, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 3);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 260, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 4);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 261, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 5);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 262, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 6);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 263, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 7);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 264, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 8);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 265, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 9);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 266, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 10);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 267, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 11);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 268, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 12);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 269, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 13);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 270, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 14);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 271, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 15);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 272, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 16);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 273, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 17);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 274, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 18);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 275, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 19);
    midichannels[4].controlchange(6, 0);


    // --- Hat (Dx7_alg5_hat) defaults: NRPN 276–413 ---

    // Feedback (NRPN 276, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 20);
    midichannels[4].controlchange(6, 0);
    // Transpose (NRPN 277, range: -24–24, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 21);
    midichannels[4].controlchange(6, 64);
    // Osc Key Sync (NRPN 278, range: 0–1, default: 1)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 22);
    midichannels[4].controlchange(6, 127);
    // L1 (NRPN 279, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 23);
    midichannels[4].controlchange(6, 64);
    // L2 (NRPN 280, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 24);
    midichannels[4].controlchange(6, 64);
    // L3 (NRPN 281, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 25);
    midichannels[4].controlchange(6, 64);
    // L4 (NRPN 282, range: 0–99, default: 50)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 26);
    midichannels[4].controlchange(6, 64);
    // R1 (NRPN 283, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 27);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 284, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 28);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 285, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 29);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 286, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 30);
    midichannels[4].controlchange(6, 127);
    // Wave (NRPN 287, range: 0–5, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 31);
    midichannels[4].controlchange(6, 0);
    // Speed (NRPN 288, range: 0–99, default: 35)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 32);
    midichannels[4].controlchange(6, 45);
    // Delay (NRPN 289, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 33);
    midichannels[4].controlchange(6, 0);
    // PMD (NRPN 290, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 34);
    midichannels[4].controlchange(6, 0);
    // AMD (NRPN 291, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 35);
    midichannels[4].controlchange(6, 0);
    // Sync (NRPN 292, range: 0–1, default: 1)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 36);
    midichannels[4].controlchange(6, 127);
    // P Mod Sens (NRPN 293, range: 0–7, default: 3)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 37);
    midichannels[4].controlchange(6, 54);
    // Tune (NRPN 294, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 38);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 295, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 39);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 296, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 40);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 297, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 41);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 298, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 42);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 299, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 43);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 300, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 44);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 301, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 45);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 302, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 46);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 303, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 47);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 304, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 48);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 305, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 49);
    midichannels[4].controlchange(6, 127);
    // Key Vel (NRPN 306, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 50);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 307, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 51);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 308, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 52);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 309, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 53);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 310, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 54);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 311, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 55);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 312, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 56);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 313, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 57);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 314, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 58);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 315, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 59);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 316, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 60);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 317, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 61);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 318, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 62);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 319, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 63);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 320, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 64);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 321, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 65);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 322, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 66);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 323, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 67);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 324, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 68);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 325, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 69);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 326, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 70);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 327, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 71);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 328, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 72);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 329, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 73);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 330, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 74);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 331, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 75);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 332, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 76);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 333, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 77);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 334, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 78);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 335, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 79);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 336, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 80);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 337, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 81);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 338, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 82);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 339, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 83);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 340, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 84);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 341, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 85);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 342, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 86);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 343, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 87);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 344, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 88);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 345, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 89);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 346, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 90);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 347, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 91);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 348, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 92);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 349, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 93);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 350, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 94);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 351, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 95);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 352, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 96);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 353, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 97);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 354, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 98);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 355, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 99);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 356, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 100);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 357, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 101);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 358, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 102);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 359, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 103);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 360, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 104);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 361, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 105);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 362, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 106);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 363, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 107);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 364, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 108);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 365, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 109);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 366, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 110);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 367, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 111);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 368, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 112);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 369, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 113);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 370, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 114);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 371, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 115);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 372, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 116);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 373, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 117);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 374, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 118);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 375, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 119);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 376, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 120);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 377, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 121);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 378, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 122);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 379, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 123);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 380, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 124);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 381, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 125);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 382, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 126);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 383, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 2);
    midichannels[4].controlchange(98, 127);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 384, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 0);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 385, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 1);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 386, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 2);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 387, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 3);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 388, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 4);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 389, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 5);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 390, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 6);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 391, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 7);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 392, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 8);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 393, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 9);
    midichannels[4].controlchange(6, 0);
    // Tune (NRPN 394, range: -7–7, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 10);
    midichannels[4].controlchange(6, 64);
    // Coarse (NRPN 395, range: 0–31, default: 1)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 11);
    midichannels[4].controlchange(6, 4);
    // Fine (NRPN 396, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 12);
    midichannels[4].controlchange(6, 0);
    // L1 (NRPN 397, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 13);
    midichannels[4].controlchange(6, 127);
    // L2 (NRPN 398, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 14);
    midichannels[4].controlchange(6, 127);
    // L3 (NRPN 399, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 15);
    midichannels[4].controlchange(6, 127);
    // L4 (NRPN 400, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 16);
    midichannels[4].controlchange(6, 0);
    // R1 (NRPN 401, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 17);
    midichannels[4].controlchange(6, 127);
    // R2 (NRPN 402, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 18);
    midichannels[4].controlchange(6, 127);
    // R3 (NRPN 403, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 19);
    midichannels[4].controlchange(6, 127);
    // R4 (NRPN 404, range: 0–99, default: 99)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 20);
    midichannels[4].controlchange(6, 127);
    // Level (NRPN 405, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 21);
    midichannels[4].controlchange(6, 0);
    // Key Vel (NRPN 406, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 22);
    midichannels[4].controlchange(6, 0);
    // A Mod Sens (NRPN 407, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 23);
    midichannels[4].controlchange(6, 0);
    // Rate Scaling (NRPN 408, range: 0–7, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 24);
    midichannels[4].controlchange(6, 0);
    // Breakpoint (NRPN 409, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 25);
    midichannels[4].controlchange(6, 0);
    // L Depth (NRPN 410, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 26);
    midichannels[4].controlchange(6, 0);
    // R Depth (NRPN 411, range: 0–99, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 27);
    midichannels[4].controlchange(6, 0);
    // L Curve (NRPN 412, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 28);
    midichannels[4].controlchange(6, 0);
    // R Curve (NRPN 413, range: 0–3, default: 0)
    midichannels[4].controlchange(99, 3);
    midichannels[4].controlchange(98, 29);
    midichannels[4].controlchange(6, 0);
}

export function postprocess(): void {
}
