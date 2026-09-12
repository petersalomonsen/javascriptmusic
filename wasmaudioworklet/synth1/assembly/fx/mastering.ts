// Mastering effect: Mastering
// Auto-transpiled from Faust DSP by faust2asc.js (--effect --library, native control/frame)
// Source: mastering.dsp

import { outputline, midichannels, StereoSignal } from '../mixes/globalimports';
import { SAMPLERATE } from '../environment';

function _fmodf(a: f32, b: f32): f32 {
  return a % b;
}

function _remainderf(a: f32, b: f32): f32 {
  return a - _rintf(a / b) * b;
}

function _rintf(x: f32): f32 {
  let floor: f32 = Mathf.floor(x);
  let frac: f32 = x - floor;
  if (frac < 0.5) return floor;
  if (frac > 0.5) return floor + 1.0;
  let i: i32 = <i32>floor;
  return (i & 1) == 0 ? floor : floor + 1.0;
}

function _exp10f(x: f32): f32 {
  return Mathf.pow(10.0, x);
}

function _isnanf(x: f32): i32 {
  return isNaN<f32>(x) ? 1 : 0;
}

function _isinff(x: f32): i32 {
  return isFinite<f32>(x) ? 0 : (isNaN<f32>(x) ? 0 : 1);
}

function _copysignf(a: f32, b: f32): f32 {
  let sign: bool = b < 0.0 || (b == 0.0 && 1.0 / b < 0.0);
  return sign ? -Mathf.abs(a) : Mathf.abs(a);
}

function _fmod(a: f64, b: f64): f64 {
  return a % b;
}

function _remainder(a: f64, b: f64): f64 {
  return a - _rint(a / b) * b;
}

function _rint(x: f64): f64 {
  let floor: f64 = Math.floor(x);
  let frac: f64 = x - floor;
  if (frac < 0.5) return floor;
  if (frac > 0.5) return floor + 1.0;
  let i: i64 = <i64>floor;
  return (i & 1) == 0 ? floor : floor + 1.0;
}

function _exp10(x: f64): f64 {
  return Math.pow(10.0, x);
}

function _isnan(x: f64): i32 {
  return isNaN<f64>(x) ? 1 : 0;
}

function _isinf(x: f64): i32 {
  return isFinite<f64>(x) ? 0 : (isNaN<f64>(x) ? 0 : 1);
}

function _copysign(a: f64, b: f64): f64 {
  let sign: bool = b < 0.0 || (b == 0.0 && 1.0 / b < 0.0);
  return sign ? -Math.abs(a) : Math.abs(a);
}

export class MasteringDsp {
    fSampleRate: i32;
    fVec7006: StaticArray<f32> = new StaticArray<f32>(2);
    fVec7024: StaticArray<f32> = new StaticArray<f32>(2);
    fVec7084: StaticArray<f32> = new StaticArray<f32>(2);
    fVec7102: StaticArray<f32> = new StaticArray<f32>(2);
    fVec7548: StaticArray<f32> = new StaticArray<f32>(1024);
    fVec7563: StaticArray<f32> = new StaticArray<f32>(1024);
    fVec7565: StaticArray<f32> = new StaticArray<f32>(2);
    fVec7569: StaticArray<f32> = new StaticArray<f32>(3);
    fVec7573: StaticArray<f32> = new StaticArray<f32>(7);
    fVec7577: StaticArray<f32> = new StaticArray<f32>(15);
    fVec7581: StaticArray<f32> = new StaticArray<f32>(32);
    fVec7585: StaticArray<f32> = new StaticArray<f32>(64);
    fVec7589: StaticArray<f32> = new StaticArray<f32>(128);
    fVec7593: StaticArray<f32> = new StaticArray<f32>(256);
    fVec7597: StaticArray<f32> = new StaticArray<f32>(512);
    fVec7601: StaticArray<f32> = new StaticArray<f32>(1024);
    fVec7605: StaticArray<f32> = new StaticArray<f32>(2048);
    fVec7624: StaticArray<f32> = new StaticArray<f32>(2);
    fVec7626: StaticArray<f32> = new StaticArray<f32>(3);
    fVec7632: StaticArray<f32> = new StaticArray<f32>(7);
    fVec7636: StaticArray<f32> = new StaticArray<f32>(15);
    fVec7640: StaticArray<f32> = new StaticArray<f32>(32);
    fVec7644: StaticArray<f32> = new StaticArray<f32>(64);
    fVec7648: StaticArray<f32> = new StaticArray<f32>(128);
    fVec7652: StaticArray<f32> = new StaticArray<f32>(256);
    fVec7656: StaticArray<f32> = new StaticArray<f32>(512);
    fVec7660: StaticArray<f32> = new StaticArray<f32>(1024);
    fVec7662: StaticArray<f32> = new StaticArray<f32>(2048);
    fHslider9: f32;
    fSlow0: f32;
    fHslider11: f32;
    fSlow1: f32;
    fHslider12: f32;
    fSlow2: f32;
    fHslider0: f32;
    iSlow0: i32;
    fConst1: f32;
    fConst2: f32;
    fConst3: f32;
    fConst4: f32;
    fHslider1: f32;
    fSlow3: f32;
    fConst5: f32;
    fHslider2: f32;
    fSlow4: f32;
    fSlow5: f32;
    fSlow6: f32;
    fSlow7: f32;
    fSlow8: f32;
    fConst6: f32;
    fHslider3: f32;
    fSlow9: f32;
    fHslider4: f32;
    fSlow10: f32;
    fSlow11: f32;
    fSlow12: f32;
    fSlow13: f32;
    fSlow14: f32;
    fSlow15: f32;
    fHslider5: f32;
    fSlow16: f32;
    fSlow17: f32;
    fSlow18: f32;
    fSlow19: f32;
    fSlow20: f32;
    fHslider6: f32;
    fSlow21: f32;
    fSlow22: f32;
    fSlow23: f32;
    fSlow24: f32;
    fSlow25: f32;
    fHslider13: f32;
    fSlow26: f32;
    iConst1: i32;
    iConst2: i32;
    iConst3: i32;
    iConst5: i32;
    iConst6: i32;
    iConst7: i32;
    iConst9: i32;
    iConst10: i32;
    iConst12: i32;
    iConst13: i32;
    iConst15: i32;
    iConst16: i32;
    iConst18: i32;
    iConst19: i32;
    iConst21: i32;
    iConst22: i32;
    iConst24: i32;
    iConst25: i32;
    iConst27: i32;
    iConst28: i32;
    iConst29: i32;
    fHslider14: f32;
    fSlow27: f32;
    fConst8: f32;
    fSlow28: f32;
    fSlow29: f32;
    fSlow30: f32;
    fSlow31: f32;
    fSlow32: f32;
    fSlow33: f32;
    fSlow34: f32;
    fSlow35: f32;
    fSlow36: f32;
    fSlow37: f32;
    fSlow38: f32;
    fSlow39: f32;
    fSlow40: f32;
    fSlow41: f32;
    fHslider10: f32;
    fHslider8: f32;
    fSlow42: f32;
    fSlow43: f32;
    iSlow1: i32;
    fConst9: f32;
    fSlow44: f32;
    fSlow45: f32;
    fHslider7: f32;
    fSlow46: f32;
    iSlow2: i32;
    fSlow47: f32;
    fSlow48: f32;
    iSlow3: i32;
    fSlow49: f32;
    fSlow50: f32;
    fSlow51: f32;
    fHslider15: f32;
    fSlow52: f32;
    iSlow4: i32;
    fSlow53: f32;
    fRec6243: f32;
    fRec6247: f32;
    fRec6252: f32;
    fRec7032: f32;
    fRec7014: f32;
    fRec6260: f32;
    fRec6999: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7021: f32;
    fRec7040: f32;
    fRec7052: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7064: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7138: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7110: f32;
    fRec7092: f32;
    fRec7077: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7099: f32;
    fRec7118: f32;
    fRec7126: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7159: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7178: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7190: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7207: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7219: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7234: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7367: f32;
    fRec7264: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7279: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7291: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7304: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7316: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7331: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7357: f32;
    fRec7382: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7395: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7407: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7478: f32;
    fRec7425: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7438: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7450: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7468: f32;
    fRec7492: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7540: f32;
    fRec7512: StaticArray<f32> = new StaticArray<f32>(3);
    fRec7530: f32;
    fRec7622: f32;
    fIOTA: i32;

    getSampleRate(): i32 {
        return this.fSampleRate;
    }
    getNumInputs(): i32 {
        return 2;
    }
    getNumOutputs(): i32 {
        return 2;
    }
    metadata(m: usize): void {
    }
    buildUserInterface(ui_interface: usize): void {
        // ui openbox mastering
        // ui slider bypass
        // metadata unit
        // ui slider gainDb
        // metadata unit
        // ui slider highpassHz
        // metadata unit
        // ui slider tiltDb
        // metadata unit
        // ui slider lowMonoHz
        // metadata unit
        // ui slider lowCrossoverHz
        // metadata unit
        // ui slider highCrossoverHz
        // metadata unit
        // ui slider compReleaseMs
        // metadata unit
        // ui slider compAttackMs
        // metadata unit
        // ui slider lowThresholdDb
        // ui slider compRatio
        // metadata unit
        // ui slider midThresholdDb
        // metadata unit
        // ui slider highThresholdDb
        // metadata unit
        // ui slider compMakeupDb
        // metadata unit
        // ui slider limiterCeilingDb
        // metadata unit
        // ui slider limiterReleaseMs
        // ui closebox
    }
    static classInit(sample_rate: i32): void {
    }
    instanceResetUserInterface(): void {
        this.fHslider9 = -18.0;
        this.fHslider11 = -18.0;
        this.fHslider12 = -18.0;
        this.fHslider0 = 0.0;
        this.fHslider1 = 0.0;
        this.fHslider2 = 25.0;
        this.fHslider3 = 0.0;
        this.fHslider4 = 0.0;
        this.fHslider5 = 150.0;
        this.fHslider6 = 3000.0;
        this.fHslider13 = 0.0;
        this.fHslider14 = -1.2000000476837158;
        this.fHslider10 = 2.0;
        this.fHslider8 = 15.0;
        this.fHslider7 = 150.0;
        this.fHslider15 = 80.0;
    }
    instanceClear(): void {
        for (let lDelay0: i32 = 0; lDelay0 < <i32>(2); lDelay0 = lDelay0 + 1) {
            this.fVec7006[lDelay0] = 0.0;
        }
        for (let lDelay1: i32 = 0; lDelay1 < <i32>(2); lDelay1 = lDelay1 + 1) {
            this.fVec7024[lDelay1] = 0.0;
        }
        for (let lDelay2: i32 = 0; lDelay2 < <i32>(2); lDelay2 = lDelay2 + 1) {
            this.fVec7084[lDelay2] = 0.0;
        }
        for (let lDelay3: i32 = 0; lDelay3 < <i32>(2); lDelay3 = lDelay3 + 1) {
            this.fVec7102[lDelay3] = 0.0;
        }
        for (let lDelay4: i32 = 0; lDelay4 < <i32>(1024); lDelay4 = lDelay4 + 1) {
            this.fVec7548[lDelay4] = 0.0;
        }
        for (let lDelay5: i32 = 0; lDelay5 < <i32>(1024); lDelay5 = lDelay5 + 1) {
            this.fVec7563[lDelay5] = 0.0;
        }
        for (let lDelay6: i32 = 0; lDelay6 < <i32>(2); lDelay6 = lDelay6 + 1) {
            this.fVec7565[lDelay6] = 0.0;
        }
        for (let lDelay7: i32 = 0; lDelay7 < <i32>(3); lDelay7 = lDelay7 + 1) {
            this.fVec7569[lDelay7] = 0.0;
        }
        for (let lDelay8: i32 = 0; lDelay8 < <i32>(7); lDelay8 = lDelay8 + 1) {
            this.fVec7573[lDelay8] = 0.0;
        }
        for (let lDelay9: i32 = 0; lDelay9 < <i32>(15); lDelay9 = lDelay9 + 1) {
            this.fVec7577[lDelay9] = 0.0;
        }
        for (let lDelay10: i32 = 0; lDelay10 < <i32>(32); lDelay10 = lDelay10 + 1) {
            this.fVec7581[lDelay10] = 0.0;
        }
        for (let lDelay11: i32 = 0; lDelay11 < <i32>(64); lDelay11 = lDelay11 + 1) {
            this.fVec7585[lDelay11] = 0.0;
        }
        for (let lDelay12: i32 = 0; lDelay12 < <i32>(128); lDelay12 = lDelay12 + 1) {
            this.fVec7589[lDelay12] = 0.0;
        }
        for (let lDelay13: i32 = 0; lDelay13 < <i32>(256); lDelay13 = lDelay13 + 1) {
            this.fVec7593[lDelay13] = 0.0;
        }
        for (let lDelay14: i32 = 0; lDelay14 < <i32>(512); lDelay14 = lDelay14 + 1) {
            this.fVec7597[lDelay14] = 0.0;
        }
        for (let lDelay15: i32 = 0; lDelay15 < <i32>(1024); lDelay15 = lDelay15 + 1) {
            this.fVec7601[lDelay15] = 0.0;
        }
        for (let lDelay16: i32 = 0; lDelay16 < <i32>(2048); lDelay16 = lDelay16 + 1) {
            this.fVec7605[lDelay16] = 0.0;
        }
        for (let lDelay17: i32 = 0; lDelay17 < <i32>(2); lDelay17 = lDelay17 + 1) {
            this.fVec7624[lDelay17] = 0.0;
        }
        for (let lDelay18: i32 = 0; lDelay18 < <i32>(3); lDelay18 = lDelay18 + 1) {
            this.fVec7626[lDelay18] = 0.0;
        }
        for (let lDelay19: i32 = 0; lDelay19 < <i32>(7); lDelay19 = lDelay19 + 1) {
            this.fVec7632[lDelay19] = 0.0;
        }
        for (let lDelay20: i32 = 0; lDelay20 < <i32>(15); lDelay20 = lDelay20 + 1) {
            this.fVec7636[lDelay20] = 0.0;
        }
        for (let lDelay21: i32 = 0; lDelay21 < <i32>(32); lDelay21 = lDelay21 + 1) {
            this.fVec7640[lDelay21] = 0.0;
        }
        for (let lDelay22: i32 = 0; lDelay22 < <i32>(64); lDelay22 = lDelay22 + 1) {
            this.fVec7644[lDelay22] = 0.0;
        }
        for (let lDelay23: i32 = 0; lDelay23 < <i32>(128); lDelay23 = lDelay23 + 1) {
            this.fVec7648[lDelay23] = 0.0;
        }
        for (let lDelay24: i32 = 0; lDelay24 < <i32>(256); lDelay24 = lDelay24 + 1) {
            this.fVec7652[lDelay24] = 0.0;
        }
        for (let lDelay25: i32 = 0; lDelay25 < <i32>(512); lDelay25 = lDelay25 + 1) {
            this.fVec7656[lDelay25] = 0.0;
        }
        for (let lDelay26: i32 = 0; lDelay26 < <i32>(1024); lDelay26 = lDelay26 + 1) {
            this.fVec7660[lDelay26] = 0.0;
        }
        for (let lDelay27: i32 = 0; lDelay27 < <i32>(2048); lDelay27 = lDelay27 + 1) {
            this.fVec7662[lDelay27] = 0.0;
        }
        this.fRec6243 = 0.0;
        this.fRec6247 = 0.0;
        this.fRec6252 = 0.0;
        this.fRec7032 = 0.0;
        this.fRec7014 = 0.0;
        this.fRec6260 = 0.0;
        for (let lRec28: i32 = 0; lRec28 < <i32>(3); lRec28 = lRec28 + 1) {
            this.fRec6999[lRec28] = 0.0;
        }
        this.fRec7021 = 0.0;
        this.fRec7040 = 0.0;
        for (let lRec29: i32 = 0; lRec29 < <i32>(3); lRec29 = lRec29 + 1) {
            this.fRec7052[lRec29] = 0.0;
        }
        for (let lRec30: i32 = 0; lRec30 < <i32>(3); lRec30 = lRec30 + 1) {
            this.fRec7064[lRec30] = 0.0;
        }
        for (let lRec31: i32 = 0; lRec31 < <i32>(3); lRec31 = lRec31 + 1) {
            this.fRec7138[lRec31] = 0.0;
        }
        this.fRec7110 = 0.0;
        this.fRec7092 = 0.0;
        for (let lRec32: i32 = 0; lRec32 < <i32>(3); lRec32 = lRec32 + 1) {
            this.fRec7077[lRec32] = 0.0;
        }
        this.fRec7099 = 0.0;
        this.fRec7118 = 0.0;
        for (let lRec33: i32 = 0; lRec33 < <i32>(3); lRec33 = lRec33 + 1) {
            this.fRec7126[lRec33] = 0.0;
        }
        for (let lRec34: i32 = 0; lRec34 < <i32>(3); lRec34 = lRec34 + 1) {
            this.fRec7159[lRec34] = 0.0;
        }
        for (let lRec35: i32 = 0; lRec35 < <i32>(3); lRec35 = lRec35 + 1) {
            this.fRec7178[lRec35] = 0.0;
        }
        for (let lRec36: i32 = 0; lRec36 < <i32>(3); lRec36 = lRec36 + 1) {
            this.fRec7190[lRec36] = 0.0;
        }
        for (let lRec37: i32 = 0; lRec37 < <i32>(3); lRec37 = lRec37 + 1) {
            this.fRec7207[lRec37] = 0.0;
        }
        for (let lRec38: i32 = 0; lRec38 < <i32>(3); lRec38 = lRec38 + 1) {
            this.fRec7219[lRec38] = 0.0;
        }
        for (let lRec39: i32 = 0; lRec39 < <i32>(3); lRec39 = lRec39 + 1) {
            this.fRec7234[lRec39] = 0.0;
        }
        this.fRec7367 = 0.0;
        for (let lRec40: i32 = 0; lRec40 < <i32>(3); lRec40 = lRec40 + 1) {
            this.fRec7264[lRec40] = 0.0;
        }
        for (let lRec41: i32 = 0; lRec41 < <i32>(3); lRec41 = lRec41 + 1) {
            this.fRec7279[lRec41] = 0.0;
        }
        for (let lRec42: i32 = 0; lRec42 < <i32>(3); lRec42 = lRec42 + 1) {
            this.fRec7291[lRec42] = 0.0;
        }
        for (let lRec43: i32 = 0; lRec43 < <i32>(3); lRec43 = lRec43 + 1) {
            this.fRec7304[lRec43] = 0.0;
        }
        for (let lRec44: i32 = 0; lRec44 < <i32>(3); lRec44 = lRec44 + 1) {
            this.fRec7316[lRec44] = 0.0;
        }
        for (let lRec45: i32 = 0; lRec45 < <i32>(3); lRec45 = lRec45 + 1) {
            this.fRec7331[lRec45] = 0.0;
        }
        this.fRec7357 = 0.0;
        for (let lRec46: i32 = 0; lRec46 < <i32>(3); lRec46 = lRec46 + 1) {
            this.fRec7382[lRec46] = 0.0;
        }
        for (let lRec47: i32 = 0; lRec47 < <i32>(3); lRec47 = lRec47 + 1) {
            this.fRec7395[lRec47] = 0.0;
        }
        for (let lRec48: i32 = 0; lRec48 < <i32>(3); lRec48 = lRec48 + 1) {
            this.fRec7407[lRec48] = 0.0;
        }
        this.fRec7478 = 0.0;
        for (let lRec49: i32 = 0; lRec49 < <i32>(3); lRec49 = lRec49 + 1) {
            this.fRec7425[lRec49] = 0.0;
        }
        for (let lRec50: i32 = 0; lRec50 < <i32>(3); lRec50 = lRec50 + 1) {
            this.fRec7438[lRec50] = 0.0;
        }
        for (let lRec51: i32 = 0; lRec51 < <i32>(3); lRec51 = lRec51 + 1) {
            this.fRec7450[lRec51] = 0.0;
        }
        this.fRec7468 = 0.0;
        for (let lRec52: i32 = 0; lRec52 < <i32>(3); lRec52 = lRec52 + 1) {
            this.fRec7492[lRec52] = 0.0;
        }
        this.fRec7540 = 0.0;
        for (let lRec53: i32 = 0; lRec53 < <i32>(3); lRec53 = lRec53 + 1) {
            this.fRec7512[lRec53] = 0.0;
        }
        this.fRec7530 = 0.0;
        this.fRec7622 = 0.0;
        this.fIOTA = <i32>(0);
    }
    instanceConstants(sample_rate: i32): void {
        this.fSampleRate = sample_rate;
        let fConst0: f32 = min<f32>(192000.0, max<f32>(1.0, <f32>(this.fSampleRate)));
        this.fConst1 = (1.0 / Mathf.tan((1979.203369140625 / fConst0)));
        this.fConst2 = (1.0 - this.fConst1);
        this.fConst3 = (44.099998474121094 / fConst0);
        this.fConst4 = (1.0 - this.fConst3);
        this.fConst5 = (3.1415927410125732 / fConst0);
        this.fConst6 = (1.0 / (1.0 + this.fConst1));
        let iConst0: i32 = <i32>((fConst0 * 0.004999999888241291));
        this.iConst1 = (iConst0 - <i32>(1));
        let fConst7: f32 = <f32>(iConst0);
        this.iConst2 = (<i32>(Mathf.floor((fConst7 * 0.0009765625))) % <i32>(2));
        this.iConst3 = (<i32>(Mathf.floor((fConst7 * 0.5))) % <i32>(2));
        let iConst4: i32 = (<i32>(2) * this.iConst3);
        this.iConst5 = (<i32>(Mathf.floor(fConst7)) % <i32>(2));
        this.iConst6 = (iConst4 + this.iConst5);
        this.iConst7 = (<i32>(Mathf.floor((fConst7 * 0.25))) % <i32>(2));
        let iConst8: i32 = (iConst4 + (<i32>(4) * this.iConst7));
        this.iConst9 = (iConst8 + this.iConst5);
        this.iConst10 = (<i32>(Mathf.floor((fConst7 * 0.125))) % <i32>(2));
        let iConst11: i32 = (iConst8 + (<i32>(8) * this.iConst10));
        this.iConst12 = (iConst11 + this.iConst5);
        this.iConst13 = (<i32>(Mathf.floor((fConst7 * 0.0625))) % <i32>(2));
        let iConst14: i32 = (iConst11 + (<i32>(16) * this.iConst13));
        this.iConst15 = (iConst14 + this.iConst5);
        this.iConst16 = (<i32>(Mathf.floor((fConst7 * 0.03125))) % <i32>(2));
        let iConst17: i32 = (iConst14 + (<i32>(32) * this.iConst16));
        this.iConst18 = (iConst17 + this.iConst5);
        this.iConst19 = (<i32>(Mathf.floor((fConst7 * 0.015625))) % <i32>(2));
        let iConst20: i32 = (iConst17 + (<i32>(64) * this.iConst19));
        this.iConst21 = (iConst20 + this.iConst5);
        this.iConst22 = (<i32>(Mathf.floor((fConst7 * 0.0078125))) % <i32>(2));
        let iConst23: i32 = (iConst20 + (<i32>(128) * this.iConst22));
        this.iConst24 = (iConst23 + this.iConst5);
        this.iConst25 = (<i32>(Mathf.floor((fConst7 * 0.00390625))) % <i32>(2));
        let iConst26: i32 = (iConst23 + (<i32>(256) * this.iConst25));
        this.iConst27 = (iConst26 + this.iConst5);
        this.iConst28 = (<i32>(Mathf.floor((fConst7 * 0.001953125))) % <i32>(2));
        this.iConst29 = ((iConst26 + (<i32>(512) * this.iConst28)) + this.iConst5);
        this.fConst8 = (1.0 / fConst7);
        this.fConst9 = (1.0 / fConst0);
    }
    instanceInit(sample_rate: i32): void {
        this.instanceConstants(sample_rate);
        this.instanceResetUserInterface();
        this.instanceClear();
    }
    init(sample_rate: i32): void {
        MasteringDsp.classInit(sample_rate);
        this.instanceInit(sample_rate);
    }
    control(): void {
        this.fSlow0 = <f32>(this.fHslider9);
        this.fSlow1 = <f32>(this.fHslider11);
        this.fSlow2 = <f32>(this.fHslider12);
        this.iSlow0 = <i32>(<f32>(this.fHslider0));
        this.fSlow3 = (this.fConst3 * Mathf.pow(10.0, (0.05000000074505806 * <f32>(this.fHslider1))));
        this.fSlow4 = Mathf.tan((this.fConst5 * <f32>(this.fHslider2)));
        this.fSlow5 = (1.0 / this.fSlow4);
        this.fSlow6 = (((this.fSlow5 - 1.4142135381698608) / this.fSlow4) + 1.0);
        this.fSlow7 = (((this.fSlow5 + 1.4142135381698608) / this.fSlow4) + 1.0);
        this.fSlow8 = (1.0 / this.fSlow7);
        this.fSlow9 = (this.fConst3 * <f32>(this.fHslider3));
        this.fSlow10 = <f32>(this.fHslider4);
        this.fSlow11 = Mathf.tan((this.fConst5 * max<f32>(this.fSlow10, 20.0)));
        this.fSlow12 = (1.0 / this.fSlow11);
        this.fSlow13 = (((this.fSlow12 - 1.4142135381698608) / this.fSlow11) + 1.0);
        this.fSlow14 = (1.0 / (((this.fSlow12 + 1.4142135381698608) / this.fSlow11) + 1.0));
        this.fSlow15 = (this.fConst3 * <f32>((this.fSlow10 > 0.0)));
        this.fSlow16 = Mathf.tan((this.fConst5 * <f32>(this.fHslider5)));
        this.fSlow17 = (1.0 / this.fSlow16);
        this.fSlow18 = (((this.fSlow17 - 1.4142135381698608) / this.fSlow16) + 1.0);
        this.fSlow19 = (((this.fSlow17 + 1.4142135381698608) / this.fSlow16) + 1.0);
        this.fSlow20 = (1.0 / this.fSlow19);
        this.fSlow21 = Mathf.tan((this.fConst5 * <f32>(this.fHslider6)));
        this.fSlow22 = (1.0 / this.fSlow21);
        this.fSlow23 = (((this.fSlow22 - 1.4142135381698608) / this.fSlow21) + 1.0);
        this.fSlow24 = (((this.fSlow22 + 1.4142135381698608) / this.fSlow21) + 1.0);
        this.fSlow25 = (1.0 / this.fSlow24);
        this.fSlow26 = (this.fConst3 * Mathf.pow(10.0, (0.05000000074505806 * <f32>(this.fHslider13))));
        this.fSlow27 = (1.0 / Mathf.pow(10.0, (0.05000000074505806 * <f32>(this.fHslider14))));
        this.fSlow28 = Mathf.pow(this.fSlow4, 2.0);
        this.fSlow29 = (1.0 / (this.fSlow28 * this.fSlow7));
        this.fSlow30 = (2.0 * (1.0 - (1.0 / this.fSlow28)));
        this.fSlow31 = (1.0 / Mathf.pow(this.fSlow11, 2.0));
        this.fSlow32 = (1.0 - this.fSlow31);
        this.fSlow33 = (2.0 * this.fSlow32);
        this.fSlow34 = Mathf.pow(this.fSlow16, 2.0);
        this.fSlow35 = (1.0 / this.fSlow34);
        this.fSlow36 = (1.0 - this.fSlow35);
        this.fSlow37 = (2.0 * this.fSlow36);
        this.fSlow38 = Mathf.pow(this.fSlow21, 2.0);
        this.fSlow39 = (1.0 / this.fSlow38);
        this.fSlow40 = (1.0 - this.fSlow39);
        this.fSlow41 = (2.0 * this.fSlow40);
        this.fSlow42 = <f32>(this.fHslider8);
        this.fSlow43 = (0.0005000000237487257 * this.fSlow42);
        this.iSlow1 = (Mathf.abs(this.fSlow43) < 0.00000011920928955078125);
        this.fSlow44 = (this.iSlow1 ? 0.0 : Mathf.exp((-1.0 * (this.fConst9 / (this.iSlow1 ? 1.0 : this.fSlow43)))));
        this.fSlow45 = (((1.0 / max<f32>(0.00000011920928955078125, <f32>(this.fHslider10))) - 1.0) * (1.0 - this.fSlow44));
        this.fSlow46 = (0.0010000000474974513 * <f32>(this.fHslider7));
        this.iSlow2 = (Mathf.abs(this.fSlow46) < 0.00000011920928955078125);
        this.fSlow47 = (this.iSlow2 ? 0.0 : Mathf.exp((-1.0 * (this.fConst9 / (this.iSlow2 ? 1.0 : this.fSlow46)))));
        this.fSlow48 = (0.0010000000474974513 * this.fSlow42);
        this.iSlow3 = (Mathf.abs(this.fSlow48) < 0.00000011920928955078125);
        this.fSlow49 = (this.iSlow3 ? 0.0 : Mathf.exp((-1.0 * (this.fConst9 / (this.iSlow3 ? 1.0 : this.fSlow48)))));
        this.fSlow50 = (1.0 / (this.fSlow34 * this.fSlow19));
        this.fSlow51 = (1.0 / (this.fSlow38 * this.fSlow24));
        this.fSlow52 = (0.0010000000474974513 * <f32>(this.fHslider15));
        this.iSlow4 = (Mathf.abs(this.fSlow52) < 0.00000011920928955078125);
        this.fSlow53 = (this.iSlow4 ? 0.0 : Mathf.exp((-1.0 * (this.fConst9 / (this.iSlow4 ? 1.0 : this.fSlow52)))));
    }
    frame(inputs: StaticArray<f32>, outputs: StaticArray<f32>): void {
        let fRecCur6243: f32 = (this.fSlow26 + (this.fConst4 * this.fRec6243));
        let fRecCur6247: f32 = (this.fSlow15 + (this.fConst4 * this.fRec6247));
        let fTemp0: f32 = (1.0 - fRecCur6247);
        let fRecCur6252: f32 = (this.fSlow9 + (this.fConst4 * this.fRec6252));
        let fTemp1: f32 = Mathf.pow(10.0, (0.05000000074505806 * fRecCur6252));
        let fTemp2: f32 = <f32>(inputs[<i32>(0)]);
        let fRecCur6260: f32 = (this.fSlow3 + (this.fConst4 * this.fRec6260));
        let fTemp3: f32 = this.fRec6999[<i32>(1)];
        this.fRec6999[<i32>(0)] = (((this.iSlow0 ? 0.0 : fTemp2) * fRecCur6260) - (this.fSlow8 * ((this.fSlow6 * this.fRec6999[<i32>(2)]) + (this.fSlow30 * fTemp3))));
        let fTemp4: f32 = (this.fSlow29 * ((this.fRec6999[<i32>(0)] + this.fRec6999[<i32>(2)]) - (2.0 * this.fRec6999[<i32>(1)])));
        this.fVec7006[<i32>(0)] = fTemp4;
        let fTemp5: f32 = this.fVec7006[<i32>(1)];
        let fRecCur7014: f32 = (-1.0 * (this.fConst6 * ((this.fConst2 * this.fRec7014) - (this.fConst1 * (fTemp4 - fTemp5)))));
        let fRecCur7021: f32 = (-1.0 * (this.fConst6 * ((this.fConst2 * this.fRec7021) - (fTemp4 + fTemp5))));
        let fTemp6: f32 = Mathf.pow(10.0, (-0.05000000074505806 * fRecCur6252));
        let fTemp7: f32 = (fRecCur7014 + (fRecCur7021 * fTemp6));
        this.fVec7024[<i32>(0)] = fTemp7;
        let fTemp8: f32 = this.fVec7024[<i32>(1)];
        let fRecCur7032: f32 = (-1.0 * (this.fConst6 * ((this.fConst2 * this.fRec7032) - (this.fConst1 * (fTemp7 - fTemp8)))));
        let fRecCur7040: f32 = (-1.0 * (this.fConst6 * ((this.fConst2 * this.fRec7040) - (fTemp7 + fTemp8))));
        let fTemp9: f32 = this.fRec7052[<i32>(1)];
        this.fRec7052[<i32>(0)] = (((fTemp1 * fRecCur7032) + fRecCur7040) - (this.fSlow14 * ((this.fSlow13 * this.fRec7052[<i32>(2)]) + (this.fSlow33 * fTemp9))));
        let fTemp10: f32 = (this.fRec7052[<i32>(0)] + this.fRec7052[<i32>(2)]);
        let fTemp11: f32 = this.fRec7064[<i32>(1)];
        let fTemp12: f32 = this.fRec7052[<i32>(1)];
        this.fRec7064[<i32>(0)] = (this.fSlow14 * (fTemp10 - ((this.fSlow13 * this.fRec7064[<i32>(2)]) + (2.0 * ((this.fSlow32 * fTemp11) - fTemp12)))));
        let fTemp13: f32 = this.fRec7064[<i32>(1)];
        let fTemp14: f32 = this.fRec7064[<i32>(2)];
        let fTemp15: f32 = this.fRec7138[<i32>(1)];
        let fTemp16: f32 = this.fRec7138[<i32>(2)];
        let fTemp17: f32 = <f32>(inputs[<i32>(1)]);
        let fTemp18: f32 = this.fRec7077[<i32>(1)];
        this.fRec7077[<i32>(0)] = (((this.iSlow0 ? 0.0 : fTemp17) * fRecCur6260) - (this.fSlow8 * ((this.fSlow6 * this.fRec7077[<i32>(2)]) + (this.fSlow30 * fTemp18))));
        let fTemp19: f32 = (this.fSlow29 * ((this.fRec7077[<i32>(0)] + this.fRec7077[<i32>(2)]) - (2.0 * this.fRec7077[<i32>(1)])));
        this.fVec7084[<i32>(0)] = fTemp19;
        let fTemp20: f32 = this.fVec7084[<i32>(1)];
        let fRecCur7092: f32 = (-1.0 * (this.fConst6 * ((this.fConst2 * this.fRec7092) - (this.fConst1 * (fTemp19 - fTemp20)))));
        let fRecCur7099: f32 = (-1.0 * (this.fConst6 * ((this.fConst2 * this.fRec7099) - (fTemp19 + fTemp20))));
        let fTemp21: f32 = (fRecCur7092 + (fTemp6 * fRecCur7099));
        this.fVec7102[<i32>(0)] = fTemp21;
        let fTemp22: f32 = this.fVec7102[<i32>(1)];
        let fRecCur7110: f32 = (-1.0 * (this.fConst6 * ((this.fConst2 * this.fRec7110) - (this.fConst1 * (fTemp21 - fTemp22)))));
        let fRecCur7118: f32 = (-1.0 * (this.fConst6 * ((this.fConst2 * this.fRec7118) - (fTemp21 + fTemp22))));
        let fTemp23: f32 = this.fRec7126[<i32>(1)];
        this.fRec7126[<i32>(0)] = (((fTemp1 * fRecCur7110) + fRecCur7118) - (this.fSlow14 * ((this.fSlow13 * this.fRec7126[<i32>(2)]) + (this.fSlow33 * fTemp23))));
        let fTemp24: f32 = (this.fRec7126[<i32>(0)] + this.fRec7126[<i32>(2)]);
        let fTemp25: f32 = this.fRec7138[<i32>(1)];
        let fTemp26: f32 = this.fRec7126[<i32>(1)];
        this.fRec7138[<i32>(0)] = (this.fSlow14 * (fTemp24 - ((this.fSlow13 * this.fRec7138[<i32>(2)]) + (2.0 * ((this.fSlow32 * fTemp25) - fTemp26)))));
        let fTemp27: f32 = (0.5 * (fRecCur6247 * ((2.0 * (fTemp13 + fTemp15)) + (fTemp16 + (this.fRec7138[<i32>(0)] + (this.fRec7064[<i32>(0)] + fTemp14))))));
        let fTemp28: f32 = this.fRec7159[<i32>(1)];
        this.fRec7159[<i32>(0)] = (this.fSlow14 * ((this.fSlow31 * (fTemp10 - (2.0 * fTemp12))) - ((this.fSlow13 * this.fRec7159[<i32>(2)]) + (this.fSlow33 * fTemp28))));
        let fTemp29: f32 = this.fRec7178[<i32>(1)];
        this.fRec7178[<i32>(0)] = ((this.fSlow14 * (((fTemp0 * ((this.fRec7064[<i32>(0)] + (2.0 * fTemp13)) + fTemp14)) + fTemp27) + (this.fSlow31 * ((this.fRec7159[<i32>(0)] + this.fRec7159[<i32>(2)]) - (2.0 * this.fRec7159[<i32>(1)]))))) - (this.fSlow20 * ((this.fSlow18 * this.fRec7178[<i32>(2)]) + (this.fSlow37 * fTemp29))));
        let fTemp30: f32 = (this.fRec7178[<i32>(0)] + this.fRec7178[<i32>(2)]);
        let fTemp31: f32 = this.fRec7190[<i32>(1)];
        let fTemp32: f32 = this.fRec7178[<i32>(1)];
        this.fRec7190[<i32>(0)] = (this.fSlow20 * (fTemp30 - ((this.fSlow18 * this.fRec7190[<i32>(2)]) + (2.0 * ((this.fSlow36 * fTemp31) - fTemp32)))));
        let fTemp33: f32 = this.fRec7207[<i32>(1)];
        this.fRec7207[<i32>(0)] = ((this.fSlow20 * ((this.fRec7190[<i32>(0)] + (2.0 * this.fRec7190[<i32>(1)])) + this.fRec7190[<i32>(2)])) - (this.fSlow25 * ((this.fSlow23 * this.fRec7207[<i32>(2)]) + (this.fSlow41 * fTemp33))));
        let fTemp34: f32 = (this.fRec7207[<i32>(0)] + this.fRec7207[<i32>(2)]);
        let fTemp35: f32 = this.fRec7219[<i32>(1)];
        let fTemp36: f32 = this.fRec7207[<i32>(1)];
        this.fRec7219[<i32>(0)] = (this.fSlow25 * (fTemp34 - ((this.fSlow23 * this.fRec7219[<i32>(2)]) + (2.0 * ((this.fSlow40 * fTemp35) - fTemp36)))));
        let fTemp37: f32 = this.fRec7234[<i32>(1)];
        this.fRec7234[<i32>(0)] = (this.fSlow25 * ((this.fSlow39 * (fTemp34 - (2.0 * fTemp36))) - ((this.fSlow23 * this.fRec7234[<i32>(2)]) + (this.fSlow41 * fTemp37))));
        let fTemp38: f32 = (((this.fRec7219[<i32>(0)] + (2.0 * this.fRec7219[<i32>(1)])) + this.fRec7219[<i32>(2)]) + (this.fSlow39 * ((this.fRec7234[<i32>(0)] + this.fRec7234[<i32>(2)]) - (2.0 * this.fRec7234[<i32>(1)]))));
        let fTemp39: f32 = this.fRec7264[<i32>(1)];
        this.fRec7264[<i32>(0)] = (this.fSlow14 * ((this.fSlow31 * (fTemp24 - (2.0 * fTemp26))) - ((this.fSlow13 * this.fRec7264[<i32>(2)]) + (this.fSlow33 * fTemp39))));
        let fTemp40: f32 = this.fRec7279[<i32>(1)];
        this.fRec7279[<i32>(0)] = ((this.fSlow14 * ((fTemp27 + (fTemp0 * ((this.fRec7138[<i32>(0)] + (2.0 * fTemp15)) + fTemp16))) + (this.fSlow31 * ((this.fRec7264[<i32>(0)] + this.fRec7264[<i32>(2)]) - (2.0 * this.fRec7264[<i32>(1)]))))) - (this.fSlow20 * ((this.fSlow18 * this.fRec7279[<i32>(2)]) + (this.fSlow37 * fTemp40))));
        let fTemp41: f32 = (this.fRec7279[<i32>(0)] + this.fRec7279[<i32>(2)]);
        let fTemp42: f32 = this.fRec7291[<i32>(1)];
        let fTemp43: f32 = this.fRec7279[<i32>(1)];
        this.fRec7291[<i32>(0)] = (this.fSlow20 * (fTemp41 - ((this.fSlow18 * this.fRec7291[<i32>(2)]) + (2.0 * ((this.fSlow36 * fTemp42) - fTemp43)))));
        let fTemp44: f32 = this.fRec7304[<i32>(1)];
        this.fRec7304[<i32>(0)] = ((this.fSlow20 * ((this.fRec7291[<i32>(0)] + (2.0 * this.fRec7291[<i32>(1)])) + this.fRec7291[<i32>(2)])) - (this.fSlow25 * ((this.fSlow23 * this.fRec7304[<i32>(2)]) + (this.fSlow41 * fTemp44))));
        let fTemp45: f32 = (this.fRec7304[<i32>(0)] + this.fRec7304[<i32>(2)]);
        let fTemp46: f32 = this.fRec7316[<i32>(1)];
        let fTemp47: f32 = this.fRec7304[<i32>(1)];
        this.fRec7316[<i32>(0)] = (this.fSlow25 * (fTemp45 - ((this.fSlow23 * this.fRec7316[<i32>(2)]) + (2.0 * ((this.fSlow40 * fTemp46) - fTemp47)))));
        let fTemp48: f32 = this.fRec7331[<i32>(1)];
        this.fRec7331[<i32>(0)] = (this.fSlow25 * ((this.fSlow39 * (fTemp45 - (2.0 * fTemp47))) - ((this.fSlow23 * this.fRec7331[<i32>(2)]) + (this.fSlow41 * fTemp48))));
        let fTemp49: f32 = (((this.fRec7316[<i32>(0)] + (2.0 * this.fRec7316[<i32>(1)])) + this.fRec7316[<i32>(2)]) + (this.fSlow39 * ((this.fRec7331[<i32>(0)] + this.fRec7331[<i32>(2)]) - (2.0 * this.fRec7331[<i32>(1)]))));
        let fTemp50: f32 = Mathf.abs((Mathf.abs((this.fSlow25 * fTemp38)) + Mathf.abs((this.fSlow25 * fTemp49))));
        let fTemp51: f32 = ((fTemp50 > this.fRec7357) ? this.fSlow49 : this.fSlow47);
        let fRecCur7357: f32 = ((fTemp50 * (1.0 - fTemp51)) + (this.fRec7357 * fTemp51));
        let fRecCur7367: f32 = ((this.fSlow44 * this.fRec7367) + (this.fSlow45 * max<f32>(((20.0 * Mathf.log10(max<f32>(0.000000000000000000000000000000000000011754943508222875, fRecCur7357))) - this.fSlow0), 0.0)));
        let fTemp52: f32 = Mathf.pow(10.0, (0.05000000074505806 * fRecCur7367));
        let fTemp53: f32 = this.fRec7382[<i32>(1)];
        this.fRec7382[<i32>(0)] = (this.fSlow20 * ((this.fSlow35 * (fTemp30 - (2.0 * fTemp32))) - ((this.fSlow18 * this.fRec7382[<i32>(2)]) + (this.fSlow37 * fTemp53))));
        let fTemp54: f32 = this.fRec7395[<i32>(1)];
        this.fRec7395[<i32>(0)] = ((this.fSlow50 * ((this.fRec7382[<i32>(0)] + this.fRec7382[<i32>(2)]) - (2.0 * this.fRec7382[<i32>(1)]))) - (this.fSlow25 * ((this.fSlow23 * this.fRec7395[<i32>(2)]) + (this.fSlow41 * fTemp54))));
        let fTemp55: f32 = (this.fRec7395[<i32>(0)] + this.fRec7395[<i32>(2)]);
        let fTemp56: f32 = this.fRec7407[<i32>(1)];
        let fTemp57: f32 = this.fRec7395[<i32>(1)];
        this.fRec7407[<i32>(0)] = (this.fSlow25 * (fTemp55 - ((this.fSlow23 * this.fRec7407[<i32>(2)]) + (2.0 * ((this.fSlow40 * fTemp56) - fTemp57)))));
        let fTemp58: f32 = ((this.fRec7407[<i32>(0)] + (2.0 * this.fRec7407[<i32>(1)])) + this.fRec7407[<i32>(2)]);
        let fTemp59: f32 = this.fRec7425[<i32>(1)];
        this.fRec7425[<i32>(0)] = (this.fSlow20 * ((this.fSlow35 * (fTemp41 - (2.0 * fTemp43))) - ((this.fSlow18 * this.fRec7425[<i32>(2)]) + (this.fSlow37 * fTemp59))));
        let fTemp60: f32 = this.fRec7438[<i32>(1)];
        this.fRec7438[<i32>(0)] = ((this.fSlow50 * ((this.fRec7425[<i32>(0)] + this.fRec7425[<i32>(2)]) - (2.0 * this.fRec7425[<i32>(1)]))) - (this.fSlow25 * ((this.fSlow23 * this.fRec7438[<i32>(2)]) + (this.fSlow41 * fTemp60))));
        let fTemp61: f32 = (this.fRec7438[<i32>(0)] + this.fRec7438[<i32>(2)]);
        let fTemp62: f32 = this.fRec7450[<i32>(1)];
        let fTemp63: f32 = this.fRec7438[<i32>(1)];
        this.fRec7450[<i32>(0)] = (this.fSlow25 * (fTemp61 - ((this.fSlow23 * this.fRec7450[<i32>(2)]) + (2.0 * ((this.fSlow40 * fTemp62) - fTemp63)))));
        let fTemp64: f32 = ((this.fRec7450[<i32>(0)] + (2.0 * this.fRec7450[<i32>(1)])) + this.fRec7450[<i32>(2)]);
        let fTemp65: f32 = Mathf.abs((Mathf.abs((this.fSlow25 * fTemp58)) + Mathf.abs((this.fSlow25 * fTemp64))));
        let fTemp66: f32 = ((fTemp65 > this.fRec7468) ? this.fSlow49 : this.fSlow47);
        let fRecCur7468: f32 = ((fTemp65 * (1.0 - fTemp66)) + (this.fRec7468 * fTemp66));
        let fRecCur7478: f32 = ((this.fSlow44 * this.fRec7478) + (this.fSlow45 * max<f32>(((20.0 * Mathf.log10(max<f32>(0.000000000000000000000000000000000000011754943508222875, fRecCur7468))) - this.fSlow1), 0.0)));
        let fTemp67: f32 = Mathf.pow(10.0, (0.05000000074505806 * fRecCur7478));
        let fTemp68: f32 = this.fRec7492[<i32>(1)];
        this.fRec7492[<i32>(0)] = (this.fSlow25 * ((this.fSlow39 * (fTemp55 - (2.0 * fTemp57))) - ((this.fSlow23 * this.fRec7492[<i32>(2)]) + (this.fSlow41 * fTemp68))));
        let fTemp69: f32 = ((this.fRec7492[<i32>(0)] + this.fRec7492[<i32>(2)]) - (2.0 * this.fRec7492[<i32>(1)]));
        let fTemp70: f32 = this.fRec7512[<i32>(1)];
        this.fRec7512[<i32>(0)] = (this.fSlow25 * ((this.fSlow39 * (fTemp61 - (2.0 * fTemp63))) - ((this.fSlow23 * this.fRec7512[<i32>(2)]) + (this.fSlow41 * fTemp70))));
        let fTemp71: f32 = ((this.fRec7512[<i32>(0)] + this.fRec7512[<i32>(2)]) - (2.0 * this.fRec7512[<i32>(1)]));
        let fTemp72: f32 = Mathf.abs((Mathf.abs((this.fSlow51 * fTemp69)) + Mathf.abs((this.fSlow51 * fTemp71))));
        let fTemp73: f32 = ((fTemp72 > this.fRec7530) ? this.fSlow49 : this.fSlow47);
        let fRecCur7530: f32 = ((fTemp72 * (1.0 - fTemp73)) + (this.fRec7530 * fTemp73));
        let fRecCur7540: f32 = ((this.fSlow44 * this.fRec7540) + (this.fSlow45 * max<f32>(((20.0 * Mathf.log10(max<f32>(0.000000000000000000000000000000000000011754943508222875, fRecCur7530))) - this.fSlow2), 0.0)));
        let fTemp74: f32 = Mathf.pow(10.0, (0.05000000074505806 * fRecCur7540));
        let fTemp75: f32 = (this.fSlow25 * (fRecCur6243 * (((fTemp38 * fTemp52) + (fTemp58 * fTemp67)) + (this.fSlow39 * (fTemp69 * fTemp74)))));
        let iTemp0: i32 = (this.fIOTA & <i32>(1023));
        this.fVec7548[iTemp0] = fTemp75;
        let fTemp76: f32 = (this.fSlow25 * (fRecCur6243 * (((fTemp49 * fTemp52) + (fTemp64 * fTemp67)) + (this.fSlow39 * (fTemp71 * fTemp74)))));
        let fTemp77: f32 = max<f32>(Mathf.abs(fTemp75), Mathf.abs(fTemp76));
        this.fVec7565[<i32>(0)] = fTemp77;
        let fTemp78: f32 = max<f32>(fTemp77, this.fVec7565[<i32>(1)]);
        this.fVec7569[<i32>(0)] = fTemp78;
        let fTemp79: f32 = max<f32>(fTemp78, this.fVec7569[<i32>(2)]);
        this.fVec7573[<i32>(0)] = fTemp79;
        let fTemp80: f32 = max<f32>(fTemp79, this.fVec7573[<i32>(4)]);
        this.fVec7577[<i32>(0)] = fTemp80;
        let fTemp81: f32 = max<f32>(fTemp80, this.fVec7577[<i32>(8)]);
        let iTemp1: i32 = (this.fIOTA & <i32>(31));
        this.fVec7581[iTemp1] = fTemp81;
        let iTemp2: i32 = ((this.fIOTA - <i32>(16)) & <i32>(31));
        let fTemp82: f32 = max<f32>(fTemp81, this.fVec7581[iTemp2]);
        let iTemp3: i32 = (this.fIOTA & <i32>(63));
        this.fVec7585[iTemp3] = fTemp82;
        let iTemp4: i32 = ((this.fIOTA - <i32>(32)) & <i32>(63));
        let fTemp83: f32 = max<f32>(fTemp82, this.fVec7585[iTemp4]);
        let iTemp5: i32 = (this.fIOTA & <i32>(127));
        this.fVec7589[iTemp5] = fTemp83;
        let iTemp6: i32 = ((this.fIOTA - <i32>(64)) & <i32>(127));
        let fTemp84: f32 = max<f32>(fTemp83, this.fVec7589[iTemp6]);
        let iTemp7: i32 = (this.fIOTA & <i32>(255));
        this.fVec7593[iTemp7] = fTemp84;
        let iTemp8: i32 = ((this.fIOTA - <i32>(128)) & <i32>(255));
        let fTemp85: f32 = max<f32>(fTemp84, this.fVec7593[iTemp8]);
        let iTemp9: i32 = (this.fIOTA & <i32>(511));
        this.fVec7597[iTemp9] = fTemp85;
        let iTemp10: i32 = ((this.fIOTA - <i32>(256)) & <i32>(511));
        let fTemp86: f32 = max<f32>(fTemp85, this.fVec7597[iTemp10]);
        this.fVec7601[iTemp0] = fTemp86;
        let iTemp11: i32 = (this.fIOTA & <i32>(2047));
        let iTemp12: i32 = ((this.fIOTA - <i32>(512)) & <i32>(1023));
        this.fVec7605[iTemp11] = max<f32>(fTemp86, this.fVec7601[iTemp12]);
        let iTemp13: i32 = ((this.fIOTA - this.iConst12) & <i32>(31));
        let iTemp14: i32 = ((this.fIOTA - this.iConst15) & <i32>(63));
        let iTemp15: i32 = ((this.fIOTA - this.iConst18) & <i32>(127));
        let iTemp16: i32 = ((this.fIOTA - this.iConst21) & <i32>(255));
        let iTemp17: i32 = ((this.fIOTA - this.iConst24) & <i32>(511));
        let iTemp18: i32 = ((this.fIOTA - this.iConst27) & <i32>(1023));
        let iTemp19: i32 = ((this.fIOTA - this.iConst29) & <i32>(2047));
        let fRecCur7622: f32 = max<f32>(((this.fSlow53 * (this.fRec7622 - 1.0)) + 1.0), max<f32>(1.0, (this.fSlow27 * max<f32>((this.iConst5 ? fTemp77 : -340282346638528860000000000000000000000.0), max<f32>((this.iConst3 ? this.fVec7569[this.iConst5] : -340282346638528860000000000000000000000.0), max<f32>((this.iConst7 ? this.fVec7573[this.iConst6] : -340282346638528860000000000000000000000.0), max<f32>((this.iConst10 ? this.fVec7577[this.iConst9] : -340282346638528860000000000000000000000.0), max<f32>((this.iConst13 ? this.fVec7581[iTemp13] : -340282346638528860000000000000000000000.0), max<f32>((this.iConst16 ? this.fVec7585[iTemp14] : -340282346638528860000000000000000000000.0), max<f32>((this.iConst19 ? this.fVec7589[iTemp15] : -340282346638528860000000000000000000000.0), max<f32>((this.iConst22 ? this.fVec7593[iTemp16] : -340282346638528860000000000000000000000.0), max<f32>((this.iConst25 ? this.fVec7597[iTemp17] : -340282346638528860000000000000000000000.0), max<f32>((this.iConst28 ? this.fVec7601[iTemp18] : -340282346638528860000000000000000000000.0), (this.iConst2 ? this.fVec7605[iTemp19] : -340282346638528860000000000000000000000.0))))))))))))));
        let fTemp87: f32 = (1.0 / fRecCur7622);
        this.fVec7624[<i32>(0)] = fTemp87;
        let fTemp88: f32 = (fTemp87 + this.fVec7624[<i32>(1)]);
        this.fVec7626[<i32>(0)] = fTemp88;
        let fTemp89: f32 = (fTemp88 + this.fVec7626[<i32>(2)]);
        this.fVec7632[<i32>(0)] = fTemp89;
        let fTemp90: f32 = (fTemp89 + this.fVec7632[<i32>(4)]);
        this.fVec7636[<i32>(0)] = fTemp90;
        let fTemp91: f32 = (fTemp90 + this.fVec7636[<i32>(8)]);
        this.fVec7640[iTemp1] = fTemp91;
        let fTemp92: f32 = (fTemp91 + this.fVec7640[iTemp2]);
        this.fVec7644[iTemp3] = fTemp92;
        let fTemp93: f32 = (fTemp92 + this.fVec7644[iTemp4]);
        this.fVec7648[iTemp5] = fTemp93;
        let fTemp94: f32 = (fTemp93 + this.fVec7648[iTemp6]);
        this.fVec7652[iTemp7] = fTemp94;
        let fTemp95: f32 = (fTemp94 + this.fVec7652[iTemp8]);
        this.fVec7656[iTemp9] = fTemp95;
        let fTemp96: f32 = (fTemp95 + this.fVec7656[iTemp10]);
        this.fVec7660[iTemp0] = fTemp96;
        this.fVec7662[iTemp11] = (fTemp96 + this.fVec7660[iTemp12]);
        let fTemp97: f32 = ((this.iConst3 ? this.fVec7626[this.iConst5] : 0.0) + ((this.iConst5 ? fTemp87 : 0.0) + ((this.iConst7 ? this.fVec7632[this.iConst6] : 0.0) + ((this.iConst10 ? this.fVec7636[this.iConst9] : 0.0) + ((this.iConst13 ? this.fVec7640[iTemp13] : 0.0) + ((this.iConst16 ? this.fVec7644[iTemp14] : 0.0) + ((this.iConst19 ? this.fVec7648[iTemp15] : 0.0) + ((this.iConst22 ? this.fVec7652[iTemp16] : 0.0) + ((this.iConst25 ? this.fVec7656[iTemp17] : 0.0) + ((this.iConst2 ? this.fVec7662[iTemp19] : 0.0) + (this.iConst28 ? this.fVec7660[iTemp18] : 0.0)))))))))));
        this.fVec7563[iTemp0] = fTemp76;
        let iTemp20: i32 = ((this.fIOTA - this.iConst1) & <i32>(1023));
        outputs[<i32>(0)] = <f32>((this.iSlow0 ? fTemp2 : min<f32>(max<f32>((this.fConst8 * (this.fVec7548[iTemp20] * fTemp97)), -1.0), 1.0)));
        outputs[<i32>(1)] = <f32>((this.iSlow0 ? fTemp17 : min<f32>(max<f32>((this.fConst8 * (fTemp97 * this.fVec7563[iTemp20])), -1.0), 1.0)));
        this.fRec6243 = fRecCur6243;
        this.fRec6247 = fRecCur6247;
        this.fRec6252 = fRecCur6252;
        this.fRec6260 = fRecCur6260;
        this.fRec6999[<i32>(2)] = this.fRec6999[<i32>(1)];
        this.fRec6999[<i32>(1)] = this.fRec6999[<i32>(0)];
        this.fVec7006[<i32>(1)] = this.fVec7006[<i32>(0)];
        this.fRec7014 = fRecCur7014;
        this.fRec7021 = fRecCur7021;
        this.fVec7024[<i32>(1)] = this.fVec7024[<i32>(0)];
        this.fRec7032 = fRecCur7032;
        this.fRec7040 = fRecCur7040;
        this.fRec7052[<i32>(2)] = this.fRec7052[<i32>(1)];
        this.fRec7052[<i32>(1)] = this.fRec7052[<i32>(0)];
        this.fRec7064[<i32>(2)] = this.fRec7064[<i32>(1)];
        this.fRec7064[<i32>(1)] = this.fRec7064[<i32>(0)];
        this.fRec7077[<i32>(2)] = this.fRec7077[<i32>(1)];
        this.fRec7077[<i32>(1)] = this.fRec7077[<i32>(0)];
        this.fVec7084[<i32>(1)] = this.fVec7084[<i32>(0)];
        this.fRec7092 = fRecCur7092;
        this.fRec7099 = fRecCur7099;
        this.fVec7102[<i32>(1)] = this.fVec7102[<i32>(0)];
        this.fRec7110 = fRecCur7110;
        this.fRec7118 = fRecCur7118;
        this.fRec7126[<i32>(2)] = this.fRec7126[<i32>(1)];
        this.fRec7126[<i32>(1)] = this.fRec7126[<i32>(0)];
        this.fRec7138[<i32>(2)] = this.fRec7138[<i32>(1)];
        this.fRec7138[<i32>(1)] = this.fRec7138[<i32>(0)];
        this.fRec7159[<i32>(2)] = this.fRec7159[<i32>(1)];
        this.fRec7159[<i32>(1)] = this.fRec7159[<i32>(0)];
        this.fRec7178[<i32>(2)] = this.fRec7178[<i32>(1)];
        this.fRec7178[<i32>(1)] = this.fRec7178[<i32>(0)];
        this.fRec7190[<i32>(2)] = this.fRec7190[<i32>(1)];
        this.fRec7190[<i32>(1)] = this.fRec7190[<i32>(0)];
        this.fRec7207[<i32>(2)] = this.fRec7207[<i32>(1)];
        this.fRec7207[<i32>(1)] = this.fRec7207[<i32>(0)];
        this.fRec7219[<i32>(2)] = this.fRec7219[<i32>(1)];
        this.fRec7219[<i32>(1)] = this.fRec7219[<i32>(0)];
        this.fRec7234[<i32>(2)] = this.fRec7234[<i32>(1)];
        this.fRec7234[<i32>(1)] = this.fRec7234[<i32>(0)];
        this.fRec7264[<i32>(2)] = this.fRec7264[<i32>(1)];
        this.fRec7264[<i32>(1)] = this.fRec7264[<i32>(0)];
        this.fRec7279[<i32>(2)] = this.fRec7279[<i32>(1)];
        this.fRec7279[<i32>(1)] = this.fRec7279[<i32>(0)];
        this.fRec7291[<i32>(2)] = this.fRec7291[<i32>(1)];
        this.fRec7291[<i32>(1)] = this.fRec7291[<i32>(0)];
        this.fRec7304[<i32>(2)] = this.fRec7304[<i32>(1)];
        this.fRec7304[<i32>(1)] = this.fRec7304[<i32>(0)];
        this.fRec7316[<i32>(2)] = this.fRec7316[<i32>(1)];
        this.fRec7316[<i32>(1)] = this.fRec7316[<i32>(0)];
        this.fRec7331[<i32>(2)] = this.fRec7331[<i32>(1)];
        this.fRec7331[<i32>(1)] = this.fRec7331[<i32>(0)];
        this.fRec7357 = fRecCur7357;
        this.fRec7367 = fRecCur7367;
        this.fRec7382[<i32>(2)] = this.fRec7382[<i32>(1)];
        this.fRec7382[<i32>(1)] = this.fRec7382[<i32>(0)];
        this.fRec7395[<i32>(2)] = this.fRec7395[<i32>(1)];
        this.fRec7395[<i32>(1)] = this.fRec7395[<i32>(0)];
        this.fRec7407[<i32>(2)] = this.fRec7407[<i32>(1)];
        this.fRec7407[<i32>(1)] = this.fRec7407[<i32>(0)];
        this.fRec7425[<i32>(2)] = this.fRec7425[<i32>(1)];
        this.fRec7425[<i32>(1)] = this.fRec7425[<i32>(0)];
        this.fRec7438[<i32>(2)] = this.fRec7438[<i32>(1)];
        this.fRec7438[<i32>(1)] = this.fRec7438[<i32>(0)];
        this.fRec7450[<i32>(2)] = this.fRec7450[<i32>(1)];
        this.fRec7450[<i32>(1)] = this.fRec7450[<i32>(0)];
        this.fRec7468 = fRecCur7468;
        this.fRec7478 = fRecCur7478;
        this.fRec7492[<i32>(2)] = this.fRec7492[<i32>(1)];
        this.fRec7492[<i32>(1)] = this.fRec7492[<i32>(0)];
        this.fRec7512[<i32>(2)] = this.fRec7512[<i32>(1)];
        this.fRec7512[<i32>(1)] = this.fRec7512[<i32>(0)];
        this.fRec7530 = fRecCur7530;
        this.fRec7540 = fRecCur7540;
        this.fVec7565[<i32>(1)] = this.fVec7565[<i32>(0)];
        this.fVec7569[<i32>(2)] = this.fVec7569[<i32>(1)];
        this.fVec7569[<i32>(1)] = this.fVec7569[<i32>(0)];
        for (let j54: i32 = <i32>(6); j54 > <i32>(0); j54 = j54 + <i32>(-1)) {
            this.fVec7573[j54] = this.fVec7573[(j54 - <i32>(1))];
        }
        for (let j55: i32 = <i32>(14); j55 > <i32>(0); j55 = j55 + <i32>(-1)) {
            this.fVec7577[j55] = this.fVec7577[(j55 - <i32>(1))];
        }
        this.fRec7622 = fRecCur7622;
        this.fVec7624[<i32>(1)] = this.fVec7624[<i32>(0)];
        this.fVec7626[<i32>(2)] = this.fVec7626[<i32>(1)];
        this.fVec7626[<i32>(1)] = this.fVec7626[<i32>(0)];
        for (let j56: i32 = <i32>(6); j56 > <i32>(0); j56 = j56 + <i32>(-1)) {
            this.fVec7632[j56] = this.fVec7632[(j56 - <i32>(1))];
        }
        for (let j57: i32 = <i32>(14); j57 > <i32>(0); j57 = j57 + <i32>(-1)) {
            this.fVec7636[j57] = this.fVec7636[(j57 - <i32>(1))];
        }
        this.fIOTA = (this.fIOTA + <i32>(1));
    }
    compute(count: i32, inputs: Array<StaticArray<f32>>, outputs: Array<StaticArray<f32>>): void {
    }
}

export class Mastering {
    signal: StereoSignal = new StereoSignal();
    readonly dsp: MasteringDsp = new MasteringDsp();
    private fin: StaticArray<f32> = new StaticArray<f32>(2);
    private fout: StaticArray<f32> = new StaticArray<f32>(2);
    private _paramsDirty: bool = true;

    private _bypass: f32 = <f32>(0);
    /** bypass [init: 0, min: 0, max: 1, step: 1] */
    get bypass(): f32 { return this._bypass; }
    set bypass(value: f32) { this._bypass = value; this._paramsDirty = true; }
    private _gainDb: f32 = <f32>(0);
    /** gainDb [init: 0, min: -24, max: 24, step: 0.1, unit: dB] */
    get gainDb(): f32 { return this._gainDb; }
    set gainDb(value: f32) { this._gainDb = value; this._paramsDirty = true; }
    private _highpassHz: f32 = <f32>(25);
    /** highpassHz [init: 25, min: 10, max: 120, step: 1, unit: Hz] */
    get highpassHz(): f32 { return this._highpassHz; }
    set highpassHz(value: f32) { this._highpassHz = value; this._paramsDirty = true; }
    private _tiltDb: f32 = <f32>(0);
    /** tiltDb [init: 0, min: -6, max: 6, step: 0.1, unit: dB] */
    get tiltDb(): f32 { return this._tiltDb; }
    set tiltDb(value: f32) { this._tiltDb = value; this._paramsDirty = true; }
    private _lowMonoHz: f32 = <f32>(0);
    /** lowMonoHz [init: 0, min: 0, max: 300, step: 1, unit: Hz] */
    get lowMonoHz(): f32 { return this._lowMonoHz; }
    set lowMonoHz(value: f32) { this._lowMonoHz = value; this._paramsDirty = true; }
    private _lowCrossoverHz: f32 = <f32>(150);
    /** lowCrossoverHz [init: 150, min: 40, max: 500, step: 1, unit: Hz] */
    get lowCrossoverHz(): f32 { return this._lowCrossoverHz; }
    set lowCrossoverHz(value: f32) { this._lowCrossoverHz = value; this._paramsDirty = true; }
    private _highCrossoverHz: f32 = <f32>(3000);
    /** highCrossoverHz [init: 3000, min: 1000, max: 10000, step: 10, unit: Hz] */
    get highCrossoverHz(): f32 { return this._highCrossoverHz; }
    set highCrossoverHz(value: f32) { this._highCrossoverHz = value; this._paramsDirty = true; }
    private _compReleaseMs: f32 = <f32>(150);
    /** compReleaseMs [init: 150, min: 10, max: 1000, step: 1, unit: ms] */
    get compReleaseMs(): f32 { return this._compReleaseMs; }
    set compReleaseMs(value: f32) { this._compReleaseMs = value; this._paramsDirty = true; }
    private _compAttackMs: f32 = <f32>(15);
    /** compAttackMs [init: 15, min: 0.1, max: 100, step: 0.1, unit: ms] */
    get compAttackMs(): f32 { return this._compAttackMs; }
    set compAttackMs(value: f32) { this._compAttackMs = value; this._paramsDirty = true; }
    private _lowThresholdDb: f32 = <f32>(-18);
    /** lowThresholdDb [init: -18, min: -60, max: 0, step: 0.5, unit: dB] */
    get lowThresholdDb(): f32 { return this._lowThresholdDb; }
    set lowThresholdDb(value: f32) { this._lowThresholdDb = value; this._paramsDirty = true; }
    private _compRatio: f32 = <f32>(2);
    /** compRatio [init: 2, min: 1, max: 10, step: 0.1] */
    get compRatio(): f32 { return this._compRatio; }
    set compRatio(value: f32) { this._compRatio = value; this._paramsDirty = true; }
    private _midThresholdDb: f32 = <f32>(-18);
    /** midThresholdDb [init: -18, min: -60, max: 0, step: 0.5, unit: dB] */
    get midThresholdDb(): f32 { return this._midThresholdDb; }
    set midThresholdDb(value: f32) { this._midThresholdDb = value; this._paramsDirty = true; }
    private _highThresholdDb: f32 = <f32>(-18);
    /** highThresholdDb [init: -18, min: -60, max: 0, step: 0.5, unit: dB] */
    get highThresholdDb(): f32 { return this._highThresholdDb; }
    set highThresholdDb(value: f32) { this._highThresholdDb = value; this._paramsDirty = true; }
    private _compMakeupDb: f32 = <f32>(0);
    /** compMakeupDb [init: 0, min: 0, max: 24, step: 0.1, unit: dB] */
    get compMakeupDb(): f32 { return this._compMakeupDb; }
    set compMakeupDb(value: f32) { this._compMakeupDb = value; this._paramsDirty = true; }
    private _limiterCeilingDb: f32 = <f32>(-1.2);
    /** limiterCeilingDb [init: -1.2, min: -12, max: 0, step: 0.1, unit: dB] */
    get limiterCeilingDb(): f32 { return this._limiterCeilingDb; }
    set limiterCeilingDb(value: f32) { this._limiterCeilingDb = value; this._paramsDirty = true; }
    private _limiterReleaseMs: f32 = <f32>(80);
    /** limiterReleaseMs [init: 80, min: 10, max: 1000, step: 1, unit: ms] */
    get limiterReleaseMs(): f32 { return this._limiterReleaseMs; }
    set limiterReleaseMs(value: f32) { this._limiterReleaseMs = value; this._paramsDirty = true; }

    constructor() {
        this.dsp.init(<i32>SAMPLERATE);
    }

    process(inL: f32, inR: f32): void {
        if (this._paramsDirty) {
            this._paramsDirty = false;
            this.dsp.fHslider0 = this._bypass;
            this.dsp.fHslider1 = this._gainDb;
            this.dsp.fHslider2 = this._highpassHz;
            this.dsp.fHslider3 = this._tiltDb;
            this.dsp.fHslider4 = this._lowMonoHz;
            this.dsp.fHslider5 = this._lowCrossoverHz;
            this.dsp.fHslider6 = this._highCrossoverHz;
            this.dsp.fHslider7 = this._compReleaseMs;
            this.dsp.fHslider8 = this._compAttackMs;
            this.dsp.fHslider9 = this._lowThresholdDb;
            this.dsp.fHslider10 = this._compRatio;
            this.dsp.fHslider11 = this._midThresholdDb;
            this.dsp.fHslider12 = this._highThresholdDb;
            this.dsp.fHslider13 = this._compMakeupDb;
            this.dsp.fHslider14 = this._limiterCeilingDb;
            this.dsp.fHslider15 = this._limiterReleaseMs;
            this.dsp.control();
        }
        this.fin[0] = inL;
        this.fin[1] = inR;
        this.dsp.frame(this.fin, this.fout);
        this.signal.left = this.fout[0];
        this.signal.right = this.fout[1];
    }

    /** Process `outputline` in place: the whole of a master-insert postprocess(). */
    processOutputline(): void {
        this.process(outputline.left, outputline.right);
        outputline.left = this.signal.left;
        outputline.right = this.signal.right;
    }
}
