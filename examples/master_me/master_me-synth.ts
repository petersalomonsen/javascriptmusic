// Mastering effect: MasterMe
// Auto-transpiled from Faust DSP by faust2asc.js (--mastering)
// Source: master_me.dsp

import { outputline, midichannels } from '../mixes/globalimports';
import { SAMPLERATE } from '../environment';

export class MasterMe {
    private fConst0: f32;
    private fConst1: f32;
    private fConst2: f32;
    private fCheckbox0: f32 = <f32>(0.0);
    private fConst3: f32;
    private fRec1: StaticArray<f32> = new StaticArray<f32>(2);
    private fCheckbox1: f32 = <f32>(0.0);
    private fRec8: StaticArray<f32> = new StaticArray<f32>(2);
    private fCheckbox2: f32 = <f32>(0.0);
    private fRec9: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider0: f32 = <f32>(2e+01);
    private iConst4: i32;
    private fCheckbox3: f32 = <f32>(0.0);
    private fRec13: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider1: f32 = <f32>(0.0);
    private fVslider2: f32 = <f32>(5e+02);
    private fConst5: f32;
    private fCheckbox4: f32 = <f32>(0.0);
    private fRec16: StaticArray<f32> = new StaticArray<f32>(2);
    private fCheckbox5: f32 = <f32>(0.0);
    private fRec17: StaticArray<f32> = new StaticArray<f32>(2);
    private fCheckbox6: f32 = <f32>(0.0);
    private fVslider3: f32 = <f32>(0.0);
    private fRec19: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec18: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph0: f32;
    private fVec0: StaticArray<f32> = new StaticArray<f32>(2);
    private fCheckbox7: f32 = <f32>(0.0);
    private fRec20: StaticArray<f32> = new StaticArray<f32>(2);
    private fConst6: f32;
    private fConst7: f32;
    private fConst8: f32;
    private fRec21: StaticArray<f32> = new StaticArray<f32>(2);
    private fCheckbox8: f32 = <f32>(0.0);
    private fConst9: f32;
    private fConst10: f32;
    private iConst11: i32;
    private fConst12: f32;
    private fConst13: f32;
    private fConst14: f32;
    private fConst15: f32;
    private fConst16: f32;
    private fConst17: f32;
    private fConst18: f32;
    private fConst19: f32;
    private fConst20: f32;
    private fConst21: f32;
    private fConst22: f32;
    private fConst23: f32;
    private fVec1: StaticArray<f32> = new StaticArray<f32>(2);
    private fConst24: f32;
    private fConst25: f32;
    private fRec26: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec25: StaticArray<f32> = new StaticArray<f32>(2);
    private fConst26: f32;
    private fVec2: StaticArray<f32> = new StaticArray<f32>(2);
    private fConst27: f32;
    private fRec24: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec23: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec3: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec4: StaticArray<f32> = new StaticArray<f32>(3);
    private fVec5: StaticArray<f32> = new StaticArray<f32>(5);
    private fVec6: StaticArray<f32> = new StaticArray<f32>(12);
    private IOTA0: i32 = 0;
    private fVec7: StaticArray<f32> = new StaticArray<f32>(32);
    private fVec8: StaticArray<f32> = new StaticArray<f32>(64);
    private fVec9: StaticArray<f32> = new StaticArray<f32>(128);
    private fVec10: StaticArray<f32> = new StaticArray<f32>(256);
    private fVec11: StaticArray<f32> = new StaticArray<f32>(512);
    private fVec12: StaticArray<f32> = new StaticArray<f32>(1024);
    private fVec13: StaticArray<f32> = new StaticArray<f32>(2048);
    private fVec14: StaticArray<f32> = new StaticArray<f32>(4096);
    private fVec15: StaticArray<f32> = new StaticArray<f32>(8192);
    private fVec16: StaticArray<f32> = new StaticArray<f32>(16384);
    private fVec17: StaticArray<f32> = new StaticArray<f32>(32768);
    private fVec18: StaticArray<f32> = new StaticArray<f32>(65536);
    private fVec19: StaticArray<f32> = new StaticArray<f32>(131072);
    private fVec20: StaticArray<f32> = new StaticArray<f32>(262144);
    private fVec21: StaticArray<f32> = new StaticArray<f32>(524288);
    private fVec22: StaticArray<f32> = new StaticArray<f32>(1048576);
    private iConst28: i32;
    private iConst29: i32;
    private iConst30: i32;
    private iConst31: i32;
    private iConst32: i32;
    private iConst33: i32;
    private iConst34: i32;
    private iConst35: i32;
    private iConst36: i32;
    private iConst37: i32;
    private iConst38: i32;
    private iConst39: i32;
    private iConst40: i32;
    private iConst41: i32;
    private iConst42: i32;
    private iConst43: i32;
    private iConst44: i32;
    private iConst45: i32;
    private iConst46: i32;
    private iConst47: i32;
    private iConst48: i32;
    private iConst49: i32;
    private iConst50: i32;
    private iConst51: i32;
    private iConst52: i32;
    private iConst53: i32;
    private iConst54: i32;
    private iConst55: i32;
    private iConst56: i32;
    private iConst57: i32;
    private iConst58: i32;
    private iConst59: i32;
    private iConst60: i32;
    private iConst61: i32;
    private iConst62: i32;
    private iConst63: i32;
    private iConst64: i32;
    private fRec31: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph1: f32;
    private fVec23: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec24: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec30: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec29: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec25: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec28: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec27: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec26: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec27: StaticArray<f32> = new StaticArray<f32>(3);
    private fVec28: StaticArray<f32> = new StaticArray<f32>(5);
    private fVec29: StaticArray<f32> = new StaticArray<f32>(12);
    private fVec30: StaticArray<f32> = new StaticArray<f32>(32);
    private fVec31: StaticArray<f32> = new StaticArray<f32>(64);
    private fVec32: StaticArray<f32> = new StaticArray<f32>(128);
    private fVec33: StaticArray<f32> = new StaticArray<f32>(256);
    private fVec34: StaticArray<f32> = new StaticArray<f32>(512);
    private fVec35: StaticArray<f32> = new StaticArray<f32>(1024);
    private fVec36: StaticArray<f32> = new StaticArray<f32>(2048);
    private fVec37: StaticArray<f32> = new StaticArray<f32>(4096);
    private fVec38: StaticArray<f32> = new StaticArray<f32>(8192);
    private fVec39: StaticArray<f32> = new StaticArray<f32>(16384);
    private fVec40: StaticArray<f32> = new StaticArray<f32>(32768);
    private fVec41: StaticArray<f32> = new StaticArray<f32>(65536);
    private fVec42: StaticArray<f32> = new StaticArray<f32>(131072);
    private fVec43: StaticArray<f32> = new StaticArray<f32>(262144);
    private fVec44: StaticArray<f32> = new StaticArray<f32>(524288);
    private fVec45: StaticArray<f32> = new StaticArray<f32>(1048576);
    private fVbargraph2: f32;
    private fVec46: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec22: StaticArray<f32> = new StaticArray<f32>(2);
    private fConst65: f32;
    private fConst66: f32;
    private fConst67: f32;
    private fConst68: f32;
    private fRec35: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec36: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec34: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec37: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec38: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec33: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec32: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec40: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec39: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec42: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec41: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec44: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec43: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec46: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec45: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec48: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider4: f32 = <f32>(-9e+01);
    private iVec47: StaticArray<i32> = new StaticArray<i32>(2);
    private fConst69: f32;
    private fVslider5: f32 = <f32>(5e+01);
    private iRec49: StaticArray<i32> = new StaticArray<i32>(2);
    private fRec47: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph3: f32;
    private fRec15: StaticArray<f32> = new StaticArray<f32>(2);
    private iVec48: StaticArray<i32> = new StaticArray<i32>(2);
    private iRec50: StaticArray<i32> = new StaticArray<i32>(2);
    private fRec14: StaticArray<f32> = new StaticArray<f32>(2);
    private fCheckbox9: f32 = <f32>(0.0);
    private fRec51: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec49: StaticArray<f32> = new StaticArray<f32>(2);
    private fConst70: f32;
    private fConst71: f32;
    private fConst72: f32;
    private fConst73: f32;
    private fVslider6: f32 = <f32>(5.0);
    private fRec54: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec53: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec55: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider7: f32 = <f32>(0.0);
    private fRec56: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec50: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec52: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec57: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec51: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec60: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec59: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec61: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec52: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec58: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec62: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider8: f32 = <f32>(6e+02);
    private fVslider9: f32 = <f32>(1.0);
    private fVslider10: f32 = <f32>(0.0);
    private fRec71: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec67: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec68: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec63: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec64: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec53: StaticArray<f32> = new StaticArray<f32>(2);
    private iConst74: i32;
    private fVec54: StaticArray<f32> = new StaticArray<f32>(3);
    private iConst75: i32;
    private fVec55: StaticArray<f32> = new StaticArray<f32>(5);
    private iConst76: i32;
    private iConst77: i32;
    private fVec56: StaticArray<f32> = new StaticArray<f32>(12);
    private iConst78: i32;
    private iConst79: i32;
    private fVec57: StaticArray<f32> = new StaticArray<f32>(32);
    private iConst80: i32;
    private iConst81: i32;
    private fVec58: StaticArray<f32> = new StaticArray<f32>(64);
    private iConst82: i32;
    private iConst83: i32;
    private fVec59: StaticArray<f32> = new StaticArray<f32>(128);
    private iConst84: i32;
    private iConst85: i32;
    private fVec60: StaticArray<f32> = new StaticArray<f32>(256);
    private iConst86: i32;
    private iConst87: i32;
    private fVec61: StaticArray<f32> = new StaticArray<f32>(512);
    private iConst88: i32;
    private iConst89: i32;
    private fVec62: StaticArray<f32> = new StaticArray<f32>(1024);
    private iConst90: i32;
    private iConst91: i32;
    private fVec63: StaticArray<f32> = new StaticArray<f32>(2048);
    private iConst92: i32;
    private iConst93: i32;
    private fVec64: StaticArray<f32> = new StaticArray<f32>(4096);
    private iConst94: i32;
    private iConst95: i32;
    private fVec65: StaticArray<f32> = new StaticArray<f32>(8192);
    private iConst96: i32;
    private iConst97: i32;
    private fVec66: StaticArray<f32> = new StaticArray<f32>(16384);
    private iConst98: i32;
    private iConst99: i32;
    private fVec67: StaticArray<f32> = new StaticArray<f32>(32768);
    private iConst100: i32;
    private fVslider11: f32 = <f32>(-14.0);
    private fConst101: f32;
    private fConst102: f32;
    private fRec12: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph4: f32;
    private fVslider12: f32 = <f32>(2e+01);
    private fVslider13: f32 = <f32>(2e+01);
    private fVslider14: f32 = <f32>(-18.0);
    private fConst103: f32;
    private fConst104: f32;
    private iConst105: i32;
    private fVec68: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec75: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec74: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec69: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec73: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec72: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec70: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec71: StaticArray<f32> = new StaticArray<f32>(3);
    private fVec72: StaticArray<f32> = new StaticArray<f32>(5);
    private fVec73: StaticArray<f32> = new StaticArray<f32>(12);
    private fVec74: StaticArray<f32> = new StaticArray<f32>(32);
    private fVec75: StaticArray<f32> = new StaticArray<f32>(64);
    private fVec76: StaticArray<f32> = new StaticArray<f32>(128);
    private fVec77: StaticArray<f32> = new StaticArray<f32>(256);
    private fVec78: StaticArray<f32> = new StaticArray<f32>(512);
    private fVec79: StaticArray<f32> = new StaticArray<f32>(1024);
    private fVec80: StaticArray<f32> = new StaticArray<f32>(2048);
    private fVec81: StaticArray<f32> = new StaticArray<f32>(4096);
    private fVec82: StaticArray<f32> = new StaticArray<f32>(8192);
    private fVec83: StaticArray<f32> = new StaticArray<f32>(16384);
    private fVec84: StaticArray<f32> = new StaticArray<f32>(32768);
    private fVec85: StaticArray<f32> = new StaticArray<f32>(65536);
    private fVec86: StaticArray<f32> = new StaticArray<f32>(131072);
    private iConst106: i32;
    private iConst107: i32;
    private iConst108: i32;
    private iConst109: i32;
    private iConst110: i32;
    private iConst111: i32;
    private iConst112: i32;
    private iConst113: i32;
    private iConst114: i32;
    private iConst115: i32;
    private iConst116: i32;
    private iConst117: i32;
    private iConst118: i32;
    private iConst119: i32;
    private iConst120: i32;
    private iConst121: i32;
    private iConst122: i32;
    private iConst123: i32;
    private iConst124: i32;
    private iConst125: i32;
    private iConst126: i32;
    private iConst127: i32;
    private iConst128: i32;
    private iConst129: i32;
    private iConst130: i32;
    private iConst131: i32;
    private iConst132: i32;
    private iConst133: i32;
    private iConst134: i32;
    private iConst135: i32;
    private iConst136: i32;
    private fVec87: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec79: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec78: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec88: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec77: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec76: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec89: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec90: StaticArray<f32> = new StaticArray<f32>(3);
    private fVec91: StaticArray<f32> = new StaticArray<f32>(5);
    private fVec92: StaticArray<f32> = new StaticArray<f32>(12);
    private fVec93: StaticArray<f32> = new StaticArray<f32>(32);
    private fVec94: StaticArray<f32> = new StaticArray<f32>(64);
    private fVec95: StaticArray<f32> = new StaticArray<f32>(128);
    private fVec96: StaticArray<f32> = new StaticArray<f32>(256);
    private fVec97: StaticArray<f32> = new StaticArray<f32>(512);
    private fVec98: StaticArray<f32> = new StaticArray<f32>(1024);
    private fVec99: StaticArray<f32> = new StaticArray<f32>(2048);
    private fVec100: StaticArray<f32> = new StaticArray<f32>(4096);
    private fVec101: StaticArray<f32> = new StaticArray<f32>(8192);
    private fVec102: StaticArray<f32> = new StaticArray<f32>(16384);
    private fVec103: StaticArray<f32> = new StaticArray<f32>(32768);
    private fVec104: StaticArray<f32> = new StaticArray<f32>(65536);
    private fVec105: StaticArray<f32> = new StaticArray<f32>(131072);
    private fRec11: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph5: f32;
    private fRec10: StaticArray<f32> = new StaticArray<f32>(2);
    private fConst137: f32;
    private fVslider15: f32 = <f32>(1e+02);
    private fRec80: StaticArray<f32> = new StaticArray<f32>(2);
    private fCheckbox10: f32 = <f32>(0.0);
    private fRec81: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider16: f32 = <f32>(0.0);
    private fRec82: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider17: f32 = <f32>(2e+01);
    private fVslider18: f32 = <f32>(2e+02);
    private fVslider19: f32 = <f32>(5e+01);
    private fRec84: StaticArray<f32> = new StaticArray<f32>(262144);
    private fVslider20: f32 = <f32>(2e+01);
    private fRec83: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider21: f32 = <f32>(-6.0);
    private fVslider22: f32 = <f32>(6.0);
    private fVslider23: f32 = <f32>(6e+01);
    private fRec86: StaticArray<f32> = new StaticArray<f32>(262144);
    private fRec85: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph6: f32;
    private fVbargraph7: f32;
    private fVslider24: f32 = <f32>(1.0);
    private fRec87: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider25: f32 = <f32>(1e+01);
    private fVslider26: f32 = <f32>(1e+01);
    private fVslider27: f32 = <f32>(6e+01);
    private fVslider28: f32 = <f32>(8e+03);
    private fRec91: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec90: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec89: StaticArray<f32> = new StaticArray<f32>(3);
    private fVslider29: f32 = <f32>(-12.0);
    private fVslider30: f32 = <f32>(12.0);
    private fVslider31: f32 = <f32>(15.0);
    private fVslider32: f32 = <f32>(3.0);
    private fVslider33: f32 = <f32>(1.5e+02);
    private fVslider34: f32 = <f32>(3e+01);
    private fRec88: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider35: f32 = <f32>(6e+01);
    private fVslider36: f32 = <f32>(3e+01);
    private fRec95: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec94: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec93: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec92: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph8: f32;
    private fRec326: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec325: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec324: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec323: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec322: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec321: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec320: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec319: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec318: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec317: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec316: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec315: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec314: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec313: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec312: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec311: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec310: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec309: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec308: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec307: StaticArray<f32> = new StaticArray<f32>(3);
    private fVslider37: f32 = <f32>(-6.0);
    private fVslider38: f32 = <f32>(12.0);
    private fRec306: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec347: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec346: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec345: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec344: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec343: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec342: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec341: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec340: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec339: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec338: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec337: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec336: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec335: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec334: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec333: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec332: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec331: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec330: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec329: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec328: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec327: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph9: f32;
    private fRec301: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec302: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec296: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec297: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec291: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec292: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec350: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec349: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec348: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec353: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec352: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec351: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph10: f32;
    private fRec286: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec287: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec281: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec282: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec276: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec277: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec271: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec272: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec266: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec267: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec261: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec262: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec356: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec355: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec354: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec359: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec358: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec357: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph11: f32;
    private fRec256: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec257: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec251: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec252: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec246: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec247: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec241: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec242: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec236: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec237: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec231: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec232: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec362: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec361: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec360: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec365: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec364: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec363: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph12: f32;
    private fRec226: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec227: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec221: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec222: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec216: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec217: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec211: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec212: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec206: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec207: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec201: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec202: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec368: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec367: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec366: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec371: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec370: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec369: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph13: f32;
    private fRec196: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec197: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec191: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec192: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec186: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec187: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec181: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec182: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec176: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec177: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec171: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec172: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec374: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec373: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec372: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec377: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec376: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec375: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph14: f32;
    private fRec166: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec167: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec161: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec162: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec156: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec157: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec151: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec152: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec146: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec147: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec141: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec142: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec380: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec379: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec378: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec383: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec382: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec381: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph15: f32;
    private fRec136: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec137: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec131: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec132: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec126: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec127: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec121: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec122: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec116: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec117: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec111: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec112: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec106: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec107: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec101: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec102: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec96: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec97: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph16: f32;
    private fVbargraph17: f32;
    private fRec589: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec590: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec584: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec585: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec579: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec580: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph18: f32;
    private fRec574: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec575: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec569: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec570: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec564: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec565: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec559: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec560: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec554: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec555: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec549: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec550: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph19: f32;
    private fRec544: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec545: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec539: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec540: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec534: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec535: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec529: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec530: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec524: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec525: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec519: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec520: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph20: f32;
    private fRec514: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec515: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec509: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec510: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec504: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec505: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec499: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec500: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec494: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec495: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec489: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec490: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph21: f32;
    private fRec484: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec485: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec479: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec480: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec474: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec475: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec469: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec470: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec464: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec465: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec459: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec460: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph22: f32;
    private fRec454: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec455: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec449: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec450: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec444: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec445: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec439: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec440: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec434: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec435: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec429: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec430: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph23: f32;
    private fRec424: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec425: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec419: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec420: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec414: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec415: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec409: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec410: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec404: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec405: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec399: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec400: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec394: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec395: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec389: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec390: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec384: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec385: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider39: f32 = <f32>(8e+01);
    private fVslider40: f32 = <f32>(5e+01);
    private fVslider41: f32 = <f32>(4e+01);
    private fRec595: StaticArray<f32> = new StaticArray<f32>(131072);
    private fVslider42: f32 = <f32>(1.0);
    private fRec594: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider43: f32 = <f32>(6.0);
    private fVslider44: f32 = <f32>(8.0);
    private fRec597: StaticArray<f32> = new StaticArray<f32>(131072);
    private fRec596: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph24: f32;
    private fRec6: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec7: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider45: f32 = <f32>(0.0);
    private fRec598: StaticArray<f32> = new StaticArray<f32>(2);
    private fCheckbox11: f32 = <f32>(0.0);
    private fRec599: StaticArray<f32> = new StaticArray<f32>(2);
    private fCheckbox12: f32 = <f32>(0.0);
    private fRec600: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider46: f32 = <f32>(75.0);
    private fRec601: StaticArray<f32> = new StaticArray<f32>(2);
    private fVslider47: f32 = <f32>(-1.0);
    private fRec602: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph25: f32;
    private fRec4: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec5: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec2: StaticArray<f32> = new StaticArray<f32>(3);
    private fRec3: StaticArray<f32> = new StaticArray<f32>(3);
    private fVec106: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec0: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph26: f32;
    private fVec107: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec607: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec606: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec108: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec605: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec604: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec109: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec110: StaticArray<f32> = new StaticArray<f32>(3);
    private fVec111: StaticArray<f32> = new StaticArray<f32>(5);
    private fVec112: StaticArray<f32> = new StaticArray<f32>(12);
    private fVec113: StaticArray<f32> = new StaticArray<f32>(32);
    private fVec114: StaticArray<f32> = new StaticArray<f32>(64);
    private fVec115: StaticArray<f32> = new StaticArray<f32>(128);
    private fVec116: StaticArray<f32> = new StaticArray<f32>(256);
    private fVec117: StaticArray<f32> = new StaticArray<f32>(512);
    private fVec118: StaticArray<f32> = new StaticArray<f32>(1024);
    private fVec119: StaticArray<f32> = new StaticArray<f32>(2048);
    private fVec120: StaticArray<f32> = new StaticArray<f32>(4096);
    private fVec121: StaticArray<f32> = new StaticArray<f32>(8192);
    private fVec122: StaticArray<f32> = new StaticArray<f32>(16384);
    private fVec123: StaticArray<f32> = new StaticArray<f32>(32768);
    private fVec124: StaticArray<f32> = new StaticArray<f32>(65536);
    private fVec125: StaticArray<f32> = new StaticArray<f32>(131072);
    private fVec126: StaticArray<f32> = new StaticArray<f32>(262144);
    private fVec127: StaticArray<f32> = new StaticArray<f32>(524288);
    private fVec128: StaticArray<f32> = new StaticArray<f32>(1048576);
    private fVec129: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec130: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec611: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec610: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec131: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec609: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec608: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec132: StaticArray<f32> = new StaticArray<f32>(2);
    private fVec133: StaticArray<f32> = new StaticArray<f32>(3);
    private fVec134: StaticArray<f32> = new StaticArray<f32>(5);
    private fVec135: StaticArray<f32> = new StaticArray<f32>(12);
    private fVec136: StaticArray<f32> = new StaticArray<f32>(32);
    private fVec137: StaticArray<f32> = new StaticArray<f32>(64);
    private fVec138: StaticArray<f32> = new StaticArray<f32>(128);
    private fVec139: StaticArray<f32> = new StaticArray<f32>(256);
    private fVec140: StaticArray<f32> = new StaticArray<f32>(512);
    private fVec141: StaticArray<f32> = new StaticArray<f32>(1024);
    private fVec142: StaticArray<f32> = new StaticArray<f32>(2048);
    private fVec143: StaticArray<f32> = new StaticArray<f32>(4096);
    private fVec144: StaticArray<f32> = new StaticArray<f32>(8192);
    private fVec145: StaticArray<f32> = new StaticArray<f32>(16384);
    private fVec146: StaticArray<f32> = new StaticArray<f32>(32768);
    private fVec147: StaticArray<f32> = new StaticArray<f32>(65536);
    private fVec148: StaticArray<f32> = new StaticArray<f32>(131072);
    private fVec149: StaticArray<f32> = new StaticArray<f32>(262144);
    private fVec150: StaticArray<f32> = new StaticArray<f32>(524288);
    private fVec151: StaticArray<f32> = new StaticArray<f32>(1048576);
    private fVbargraph27: f32;
    private fRec603: StaticArray<f32> = new StaticArray<f32>(2);
    private fVbargraph28: f32;

    constructor() {
        this.instanceConstants();
        this.instanceClear();
    }

    private instanceConstants(): void {
        this.fConst0 = min<f32>(<f32>(1.92e+05), max<f32>(<f32>(1.0), SAMPLERATE));
        this.fConst1 = (<f32>(8e+01) / this.fConst0);
        this.fConst2 = (<f32>(44.1) / this.fConst0);
        this.fConst3 = (<f32>(1.0) - this.fConst2);
        this.iConst4 = (<i32>(Mathf.floor((<f32>(0.1) * this.fConst0))) % <i32>(2));
        this.fConst5 = (<f32>(1.0) / this.fConst0);
        this.fConst6 = (<f32>(31.415926) / this.fConst0);
        this.fConst7 = (<f32>(1.0) / (this.fConst6 + <f32>(1.0)));
        this.fConst8 = (<f32>(1.0) - this.fConst6);
        this.fConst9 = Mathf.round((<f32>(3.0) * this.fConst0));
        this.fConst10 = (<f32>(1.0) / max<f32>(this.fConst9, <f32>(1.1920929e-07)));
        this.iConst11 = (<i32>(Mathf.floor((<f32>(1.9073486e-06) * this.fConst9))) % <i32>(2));
        this.fConst12 = Mathf.tan((<f32>(119.806114) / this.fConst0));
        this.fConst13 = Mathf.pow(this.fConst12, <f32>(2.0));
        this.fConst14 = (<f32>(0.50032705) * (this.fConst13 + <f32>(1.0)));
        this.fConst15 = (<f32>(1.0) / (this.fConst12 + this.fConst14));
        this.fConst16 = Mathf.tan((<f32>(5283.415) / this.fConst0));
        this.fConst17 = Mathf.pow(this.fConst16, <f32>(2.0));
        this.fConst18 = (<f32>(1.4142135) * this.fConst16);
        this.fConst19 = (<f32>(1.0) / ((this.fConst17 + this.fConst18) + <f32>(1.0)));
        this.fConst20 = (<f32>(2.0) * (this.fConst17 + <f32>(-1.5848527)));
        this.fConst21 = (this.fConst17 + (<f32>(1.0) - this.fConst18));
        this.fConst22 = (<f32>(1.7803667) * this.fConst16);
        this.fConst23 = (this.fConst17 + (<f32>(1.5848527) - this.fConst22));
        this.fConst24 = (<f32>(2.0) * (this.fConst17 + <f32>(-1.0)));
        this.fConst25 = ((this.fConst17 + this.fConst22) + <f32>(1.5848527));
        this.fConst26 = (this.fConst14 - this.fConst12);
        this.fConst27 = (<f32>(1.0006541) * (this.fConst13 + <f32>(-1.0)));
        this.iConst28 = (<i32>(Mathf.floor(this.fConst9)) % <i32>(2));
        this.iConst29 = (<i32>(Mathf.floor((<f32>(0.5) * this.fConst9))) % <i32>(2));
        this.iConst30 = (this.iConst28 + (<i32>(2) * this.iConst29));
        this.iConst31 = (<i32>(Mathf.floor((<f32>(0.25) * this.fConst9))) % <i32>(2));
        this.iConst32 = (this.iConst30 + (<i32>(4) * this.iConst31));
        this.iConst33 = (<i32>(Mathf.floor((<f32>(0.125) * this.fConst9))) % <i32>(2));
        this.iConst34 = (this.iConst32 + (<i32>(8) * this.iConst33));
        this.iConst35 = (<i32>(Mathf.floor((<f32>(0.0625) * this.fConst9))) % <i32>(2));
        this.iConst36 = (this.iConst34 + (<i32>(16) * this.iConst35));
        this.iConst37 = (<i32>(Mathf.floor((<f32>(0.03125) * this.fConst9))) % <i32>(2));
        this.iConst38 = (this.iConst36 + (<i32>(32) * this.iConst37));
        this.iConst39 = (<i32>(Mathf.floor((<f32>(0.015625) * this.fConst9))) % <i32>(2));
        this.iConst40 = (this.iConst38 + (<i32>(64) * this.iConst39));
        this.iConst41 = (<i32>(Mathf.floor((<f32>(0.0078125) * this.fConst9))) % <i32>(2));
        this.iConst42 = (this.iConst40 + (<i32>(128) * this.iConst41));
        this.iConst43 = (<i32>(Mathf.floor((<f32>(0.00390625) * this.fConst9))) % <i32>(2));
        this.iConst44 = (this.iConst42 + (<i32>(256) * this.iConst43));
        this.iConst45 = (<i32>(Mathf.floor((<f32>(0.001953125) * this.fConst9))) % <i32>(2));
        this.iConst46 = (this.iConst44 + (<i32>(512) * this.iConst45));
        this.iConst47 = (<i32>(Mathf.floor((<f32>(0.0009765625) * this.fConst9))) % <i32>(2));
        this.iConst48 = (this.iConst46 + (<i32>(1024) * this.iConst47));
        this.iConst49 = (<i32>(Mathf.floor((<f32>(0.00048828125) * this.fConst9))) % <i32>(2));
        this.iConst50 = (this.iConst48 + (<i32>(2048) * this.iConst49));
        this.iConst51 = (<i32>(Mathf.floor((<f32>(0.00024414062) * this.fConst9))) % <i32>(2));
        this.iConst52 = (this.iConst50 + (<i32>(4096) * this.iConst51));
        this.iConst53 = (<i32>(Mathf.floor((<f32>(0.00012207031) * this.fConst9))) % <i32>(2));
        this.iConst54 = (this.iConst52 + (<i32>(8192) * this.iConst53));
        this.iConst55 = (<i32>(Mathf.floor((<f32>(6.1035156e-05) * this.fConst9))) % <i32>(2));
        this.iConst56 = (this.iConst54 + (<i32>(16384) * this.iConst55));
        this.iConst57 = (<i32>(Mathf.floor((<f32>(3.0517578e-05) * this.fConst9))) % <i32>(2));
        this.iConst58 = (this.iConst56 + (<i32>(32768) * this.iConst57));
        this.iConst59 = (<i32>(Mathf.floor((<f32>(1.5258789e-05) * this.fConst9))) % <i32>(2));
        this.iConst60 = (this.iConst58 + (<i32>(65536) * this.iConst59));
        this.iConst61 = (<i32>(Mathf.floor((<f32>(7.6293945e-06) * this.fConst9))) % <i32>(2));
        this.iConst62 = (this.iConst60 + (<i32>(131072) * this.iConst61));
        this.iConst63 = (<i32>(Mathf.floor((<f32>(3.8146973e-06) * this.fConst9))) % <i32>(2));
        this.iConst64 = (this.iConst62 + (<i32>(262144) * this.iConst63));
        this.fConst65 = Mathf.exp(-((<f32>(12.566371) / this.fConst0)));
        this.fConst66 = (<f32>(1.0) - this.fConst65);
        this.fConst67 = Mathf.exp(-this.fConst6);
        this.fConst68 = (<f32>(1.0) - this.fConst67);
        this.fConst69 = (<f32>(0.001) * this.fConst0);
        this.fConst70 = (<f32>(1.0) / Mathf.tan((<f32>(1979.2034) / this.fConst0)));
        this.fConst71 = (<f32>(1.0) / (this.fConst70 + <f32>(1.0)));
        this.fConst72 = (<f32>(1.0) - this.fConst70);
        this.fConst73 = (<f32>(3.1415927) / this.fConst0);
        this.iConst74 = (<i32>(Mathf.floor((<f32>(0.05) * this.fConst0))) % <i32>(2));
        this.iConst75 = (<i32>(Mathf.floor((<f32>(0.025) * this.fConst0))) % <i32>(2));
        this.iConst76 = (this.iConst4 + (<i32>(2) * this.iConst74));
        this.iConst77 = (<i32>(Mathf.floor((<f32>(0.0125) * this.fConst0))) % <i32>(2));
        this.iConst78 = (this.iConst76 + (<i32>(4) * this.iConst75));
        this.iConst79 = (<i32>(Mathf.floor((<f32>(0.00625) * this.fConst0))) % <i32>(2));
        this.iConst80 = (this.iConst78 + (<i32>(8) * this.iConst77));
        this.iConst81 = (<i32>(Mathf.floor((<f32>(0.003125) * this.fConst0))) % <i32>(2));
        this.iConst82 = (this.iConst80 + (<i32>(16) * this.iConst79));
        this.iConst83 = (<i32>(Mathf.floor((<f32>(0.0015625) * this.fConst0))) % <i32>(2));
        this.iConst84 = (this.iConst82 + (<i32>(32) * this.iConst81));
        this.iConst85 = (<i32>(Mathf.floor((<f32>(0.00078125) * this.fConst0))) % <i32>(2));
        this.iConst86 = (this.iConst84 + (<i32>(64) * this.iConst83));
        this.iConst87 = (<i32>(Mathf.floor((<f32>(0.000390625) * this.fConst0))) % <i32>(2));
        this.iConst88 = (this.iConst86 + (<i32>(128) * this.iConst85));
        this.iConst89 = (<i32>(Mathf.floor((<f32>(0.0001953125) * this.fConst0))) % <i32>(2));
        this.iConst90 = (this.iConst88 + (<i32>(256) * this.iConst87));
        this.iConst91 = (<i32>(Mathf.floor((<f32>(9.765625e-05) * this.fConst0))) % <i32>(2));
        this.iConst92 = (this.iConst90 + (<i32>(512) * this.iConst89));
        this.iConst93 = (<i32>(Mathf.floor((<f32>(4.8828126e-05) * this.fConst0))) % <i32>(2));
        this.iConst94 = (this.iConst92 + (<i32>(1024) * this.iConst91));
        this.iConst95 = (<i32>(Mathf.floor((<f32>(2.4414063e-05) * this.fConst0))) % <i32>(2));
        this.iConst96 = (this.iConst94 + (<i32>(2048) * this.iConst93));
        this.iConst97 = (<i32>(Mathf.floor((<f32>(1.2207031e-05) * this.fConst0))) % <i32>(2));
        this.iConst98 = (this.iConst96 + (<i32>(4096) * this.iConst95));
        this.iConst99 = (<i32>(Mathf.floor((<f32>(6.1035157e-06) * this.fConst0))) % <i32>(2));
        this.iConst100 = (this.iConst98 + (<i32>(8192) * this.iConst97));
        this.fConst101 = Mathf.exp(-((<f32>(3.3333333) / this.fConst0)));
        this.fConst102 = Mathf.exp(-((<f32>(2e+01) / this.fConst0)));
        this.fConst103 = Mathf.round((<f32>(0.4) * this.fConst0));
        this.fConst104 = (<f32>(1.0) / max<f32>(this.fConst103, <f32>(1.1920929e-07)));
        this.iConst105 = (<i32>(Mathf.floor((<f32>(1.5258789e-05) * this.fConst103))) % <i32>(2));
        this.iConst106 = (<i32>(Mathf.floor(this.fConst103)) % <i32>(2));
        this.iConst107 = (<i32>(Mathf.floor((<f32>(0.5) * this.fConst103))) % <i32>(2));
        this.iConst108 = (this.iConst106 + (<i32>(2) * this.iConst107));
        this.iConst109 = (<i32>(Mathf.floor((<f32>(0.25) * this.fConst103))) % <i32>(2));
        this.iConst110 = (this.iConst108 + (<i32>(4) * this.iConst109));
        this.iConst111 = (<i32>(Mathf.floor((<f32>(0.125) * this.fConst103))) % <i32>(2));
        this.iConst112 = (this.iConst110 + (<i32>(8) * this.iConst111));
        this.iConst113 = (<i32>(Mathf.floor((<f32>(0.0625) * this.fConst103))) % <i32>(2));
        this.iConst114 = (this.iConst112 + (<i32>(16) * this.iConst113));
        this.iConst115 = (<i32>(Mathf.floor((<f32>(0.03125) * this.fConst103))) % <i32>(2));
        this.iConst116 = (this.iConst114 + (<i32>(32) * this.iConst115));
        this.iConst117 = (<i32>(Mathf.floor((<f32>(0.015625) * this.fConst103))) % <i32>(2));
        this.iConst118 = (this.iConst116 + (<i32>(64) * this.iConst117));
        this.iConst119 = (<i32>(Mathf.floor((<f32>(0.0078125) * this.fConst103))) % <i32>(2));
        this.iConst120 = (this.iConst118 + (<i32>(128) * this.iConst119));
        this.iConst121 = (<i32>(Mathf.floor((<f32>(0.00390625) * this.fConst103))) % <i32>(2));
        this.iConst122 = (this.iConst120 + (<i32>(256) * this.iConst121));
        this.iConst123 = (<i32>(Mathf.floor((<f32>(0.001953125) * this.fConst103))) % <i32>(2));
        this.iConst124 = (this.iConst122 + (<i32>(512) * this.iConst123));
        this.iConst125 = (<i32>(Mathf.floor((<f32>(0.0009765625) * this.fConst103))) % <i32>(2));
        this.iConst126 = (this.iConst124 + (<i32>(1024) * this.iConst125));
        this.iConst127 = (<i32>(Mathf.floor((<f32>(0.00048828125) * this.fConst103))) % <i32>(2));
        this.iConst128 = (this.iConst126 + (<i32>(2048) * this.iConst127));
        this.iConst129 = (<i32>(Mathf.floor((<f32>(0.00024414062) * this.fConst103))) % <i32>(2));
        this.iConst130 = (this.iConst128 + (<i32>(4096) * this.iConst129));
        this.iConst131 = (<i32>(Mathf.floor((<f32>(0.00012207031) * this.fConst103))) % <i32>(2));
        this.iConst132 = (this.iConst130 + (<i32>(8192) * this.iConst131));
        this.iConst133 = (<i32>(Mathf.floor((<f32>(6.1035156e-05) * this.fConst103))) % <i32>(2));
        this.iConst134 = (this.iConst132 + (<i32>(16384) * this.iConst133));
        this.iConst135 = (<i32>(Mathf.floor((<f32>(3.0517578e-05) * this.fConst103))) % <i32>(2));
        this.iConst136 = (this.iConst134 + (<i32>(32768) * this.iConst135));
        this.fConst137 = (<f32>(0.441) / this.fConst0);
    }

    private instanceClear(): void {
        for (let l0: i32 = 0; l0 < 2; l0 = (l0 + 1)) { this.fRec1[l0] = <f32>(0.0); }
        for (let l1: i32 = 0; l1 < 2; l1 = (l1 + 1)) { this.fRec8[l1] = <f32>(0.0); }
        for (let l2: i32 = 0; l2 < 2; l2 = (l2 + 1)) { this.fRec9[l2] = <f32>(0.0); }
        for (let l3: i32 = 0; l3 < 2; l3 = (l3 + 1)) { this.fRec13[l3] = <f32>(0.0); }
        for (let l4: i32 = 0; l4 < 2; l4 = (l4 + 1)) { this.fRec16[l4] = <f32>(0.0); }
        for (let l5: i32 = 0; l5 < 2; l5 = (l5 + 1)) { this.fRec17[l5] = <f32>(0.0); }
        for (let l6: i32 = 0; l6 < 2; l6 = (l6 + 1)) { this.fRec19[l6] = <f32>(0.0); }
        for (let l7: i32 = 0; l7 < 2; l7 = (l7 + 1)) { this.fRec18[l7] = <f32>(0.0); }
        for (let l8: i32 = 0; l8 < 2; l8 = (l8 + 1)) { this.fVec0[l8] = <f32>(0.0); }
        for (let l9: i32 = 0; l9 < 2; l9 = (l9 + 1)) { this.fRec20[l9] = <f32>(0.0); }
        for (let l10: i32 = 0; l10 < 2; l10 = (l10 + 1)) { this.fRec21[l10] = <f32>(0.0); }
        for (let l11: i32 = 0; l11 < 2; l11 = (l11 + 1)) { this.fVec1[l11] = <f32>(0.0); }
        for (let l12: i32 = 0; l12 < 2; l12 = (l12 + 1)) { this.fRec26[l12] = <f32>(0.0); }
        for (let l13: i32 = 0; l13 < 2; l13 = (l13 + 1)) { this.fRec25[l13] = <f32>(0.0); }
        for (let l14: i32 = 0; l14 < 2; l14 = (l14 + 1)) { this.fVec2[l14] = <f32>(0.0); }
        for (let l15: i32 = 0; l15 < 2; l15 = (l15 + 1)) { this.fRec24[l15] = <f32>(0.0); }
        for (let l16: i32 = 0; l16 < 2; l16 = (l16 + 1)) { this.fRec23[l16] = <f32>(0.0); }
        for (let l17: i32 = 0; l17 < 2; l17 = (l17 + 1)) { this.fVec3[l17] = <f32>(0.0); }
        for (let l18: i32 = 0; l18 < 3; l18 = (l18 + 1)) { this.fVec4[l18] = <f32>(0.0); }
        for (let l19: i32 = 0; l19 < 5; l19 = (l19 + 1)) { this.fVec5[l19] = <f32>(0.0); }
        for (let l20: i32 = 0; l20 < 12; l20 = (l20 + 1)) { this.fVec6[l20] = <f32>(0.0); }
        this.IOTA0 = <i32>(0);
        for (let l21: i32 = 0; l21 < 32; l21 = (l21 + 1)) { this.fVec7[l21] = <f32>(0.0); }
        for (let l22: i32 = 0; l22 < 64; l22 = (l22 + 1)) { this.fVec8[l22] = <f32>(0.0); }
        for (let l23: i32 = 0; l23 < 128; l23 = (l23 + 1)) { this.fVec9[l23] = <f32>(0.0); }
        for (let l24: i32 = 0; l24 < 256; l24 = (l24 + 1)) { this.fVec10[l24] = <f32>(0.0); }
        for (let l25: i32 = 0; l25 < 512; l25 = (l25 + 1)) { this.fVec11[l25] = <f32>(0.0); }
        for (let l26: i32 = 0; l26 < 1024; l26 = (l26 + 1)) { this.fVec12[l26] = <f32>(0.0); }
        for (let l27: i32 = 0; l27 < 2048; l27 = (l27 + 1)) { this.fVec13[l27] = <f32>(0.0); }
        for (let l28: i32 = 0; l28 < 4096; l28 = (l28 + 1)) { this.fVec14[l28] = <f32>(0.0); }
        for (let l29: i32 = 0; l29 < 8192; l29 = (l29 + 1)) { this.fVec15[l29] = <f32>(0.0); }
        for (let l30: i32 = 0; l30 < 16384; l30 = (l30 + 1)) { this.fVec16[l30] = <f32>(0.0); }
        for (let l31: i32 = 0; l31 < 32768; l31 = (l31 + 1)) { this.fVec17[l31] = <f32>(0.0); }
        for (let l32: i32 = 0; l32 < 65536; l32 = (l32 + 1)) { this.fVec18[l32] = <f32>(0.0); }
        for (let l33: i32 = 0; l33 < 131072; l33 = (l33 + 1)) { this.fVec19[l33] = <f32>(0.0); }
        for (let l34: i32 = 0; l34 < 262144; l34 = (l34 + 1)) { this.fVec20[l34] = <f32>(0.0); }
        for (let l35: i32 = 0; l35 < 524288; l35 = (l35 + 1)) { this.fVec21[l35] = <f32>(0.0); }
        for (let l36: i32 = 0; l36 < 1048576; l36 = (l36 + 1)) { this.fVec22[l36] = <f32>(0.0); }
        for (let l37: i32 = 0; l37 < 2; l37 = (l37 + 1)) { this.fRec31[l37] = <f32>(0.0); }
        for (let l38: i32 = 0; l38 < 2; l38 = (l38 + 1)) { this.fVec23[l38] = <f32>(0.0); }
        for (let l39: i32 = 0; l39 < 2; l39 = (l39 + 1)) { this.fVec24[l39] = <f32>(0.0); }
        for (let l40: i32 = 0; l40 < 2; l40 = (l40 + 1)) { this.fRec30[l40] = <f32>(0.0); }
        for (let l41: i32 = 0; l41 < 2; l41 = (l41 + 1)) { this.fRec29[l41] = <f32>(0.0); }
        for (let l42: i32 = 0; l42 < 2; l42 = (l42 + 1)) { this.fVec25[l42] = <f32>(0.0); }
        for (let l43: i32 = 0; l43 < 2; l43 = (l43 + 1)) { this.fRec28[l43] = <f32>(0.0); }
        for (let l44: i32 = 0; l44 < 2; l44 = (l44 + 1)) { this.fRec27[l44] = <f32>(0.0); }
        for (let l45: i32 = 0; l45 < 2; l45 = (l45 + 1)) { this.fVec26[l45] = <f32>(0.0); }
        for (let l46: i32 = 0; l46 < 3; l46 = (l46 + 1)) { this.fVec27[l46] = <f32>(0.0); }
        for (let l47: i32 = 0; l47 < 5; l47 = (l47 + 1)) { this.fVec28[l47] = <f32>(0.0); }
        for (let l48: i32 = 0; l48 < 12; l48 = (l48 + 1)) { this.fVec29[l48] = <f32>(0.0); }
        for (let l49: i32 = 0; l49 < 32; l49 = (l49 + 1)) { this.fVec30[l49] = <f32>(0.0); }
        for (let l50: i32 = 0; l50 < 64; l50 = (l50 + 1)) { this.fVec31[l50] = <f32>(0.0); }
        for (let l51: i32 = 0; l51 < 128; l51 = (l51 + 1)) { this.fVec32[l51] = <f32>(0.0); }
        for (let l52: i32 = 0; l52 < 256; l52 = (l52 + 1)) { this.fVec33[l52] = <f32>(0.0); }
        for (let l53: i32 = 0; l53 < 512; l53 = (l53 + 1)) { this.fVec34[l53] = <f32>(0.0); }
        for (let l54: i32 = 0; l54 < 1024; l54 = (l54 + 1)) { this.fVec35[l54] = <f32>(0.0); }
        for (let l55: i32 = 0; l55 < 2048; l55 = (l55 + 1)) { this.fVec36[l55] = <f32>(0.0); }
        for (let l56: i32 = 0; l56 < 4096; l56 = (l56 + 1)) { this.fVec37[l56] = <f32>(0.0); }
        for (let l57: i32 = 0; l57 < 8192; l57 = (l57 + 1)) { this.fVec38[l57] = <f32>(0.0); }
        for (let l58: i32 = 0; l58 < 16384; l58 = (l58 + 1)) { this.fVec39[l58] = <f32>(0.0); }
        for (let l59: i32 = 0; l59 < 32768; l59 = (l59 + 1)) { this.fVec40[l59] = <f32>(0.0); }
        for (let l60: i32 = 0; l60 < 65536; l60 = (l60 + 1)) { this.fVec41[l60] = <f32>(0.0); }
        for (let l61: i32 = 0; l61 < 131072; l61 = (l61 + 1)) { this.fVec42[l61] = <f32>(0.0); }
        for (let l62: i32 = 0; l62 < 262144; l62 = (l62 + 1)) { this.fVec43[l62] = <f32>(0.0); }
        for (let l63: i32 = 0; l63 < 524288; l63 = (l63 + 1)) { this.fVec44[l63] = <f32>(0.0); }
        for (let l64: i32 = 0; l64 < 1048576; l64 = (l64 + 1)) { this.fVec45[l64] = <f32>(0.0); }
        for (let l65: i32 = 0; l65 < 2; l65 = (l65 + 1)) { this.fVec46[l65] = <f32>(0.0); }
        for (let l66: i32 = 0; l66 < 2; l66 = (l66 + 1)) { this.fRec22[l66] = <f32>(0.0); }
        for (let l67: i32 = 0; l67 < 2; l67 = (l67 + 1)) { this.fRec35[l67] = <f32>(0.0); }
        for (let l68: i32 = 0; l68 < 2; l68 = (l68 + 1)) { this.fRec36[l68] = <f32>(0.0); }
        for (let l69: i32 = 0; l69 < 2; l69 = (l69 + 1)) { this.fRec34[l69] = <f32>(0.0); }
        for (let l70: i32 = 0; l70 < 2; l70 = (l70 + 1)) { this.fRec37[l70] = <f32>(0.0); }
        for (let l71: i32 = 0; l71 < 2; l71 = (l71 + 1)) { this.fRec38[l71] = <f32>(0.0); }
        for (let l72: i32 = 0; l72 < 2; l72 = (l72 + 1)) { this.fRec33[l72] = <f32>(0.0); }
        for (let l73: i32 = 0; l73 < 2; l73 = (l73 + 1)) { this.fRec32[l73] = <f32>(0.0); }
        for (let l74: i32 = 0; l74 < 2; l74 = (l74 + 1)) { this.fRec40[l74] = <f32>(0.0); }
        for (let l75: i32 = 0; l75 < 2; l75 = (l75 + 1)) { this.fRec39[l75] = <f32>(0.0); }
        for (let l76: i32 = 0; l76 < 2; l76 = (l76 + 1)) { this.fRec42[l76] = <f32>(0.0); }
        for (let l77: i32 = 0; l77 < 2; l77 = (l77 + 1)) { this.fRec41[l77] = <f32>(0.0); }
        for (let l78: i32 = 0; l78 < 2; l78 = (l78 + 1)) { this.fRec44[l78] = <f32>(0.0); }
        for (let l79: i32 = 0; l79 < 2; l79 = (l79 + 1)) { this.fRec43[l79] = <f32>(0.0); }
        for (let l80: i32 = 0; l80 < 2; l80 = (l80 + 1)) { this.fRec46[l80] = <f32>(0.0); }
        for (let l81: i32 = 0; l81 < 2; l81 = (l81 + 1)) { this.fRec45[l81] = <f32>(0.0); }
        for (let l82: i32 = 0; l82 < 2; l82 = (l82 + 1)) { this.fRec48[l82] = <f32>(0.0); }
        for (let l83: i32 = 0; l83 < 2; l83 = (l83 + 1)) { this.iVec47[l83] = <i32>(0); }
        for (let l84: i32 = 0; l84 < 2; l84 = (l84 + 1)) { this.iRec49[l84] = <i32>(0); }
        for (let l85: i32 = 0; l85 < 2; l85 = (l85 + 1)) { this.fRec47[l85] = <f32>(0.0); }
        for (let l86: i32 = 0; l86 < 2; l86 = (l86 + 1)) { this.fRec15[l86] = <f32>(0.0); }
        for (let l87: i32 = 0; l87 < 2; l87 = (l87 + 1)) { this.iVec48[l87] = <i32>(0); }
        for (let l88: i32 = 0; l88 < 2; l88 = (l88 + 1)) { this.iRec50[l88] = <i32>(0); }
        for (let l89: i32 = 0; l89 < 2; l89 = (l89 + 1)) { this.fRec14[l89] = <f32>(0.0); }
        for (let l90: i32 = 0; l90 < 2; l90 = (l90 + 1)) { this.fRec51[l90] = <f32>(0.0); }
        for (let l91: i32 = 0; l91 < 2; l91 = (l91 + 1)) { this.fVec49[l91] = <f32>(0.0); }
        for (let l92: i32 = 0; l92 < 2; l92 = (l92 + 1)) { this.fRec54[l92] = <f32>(0.0); }
        for (let l93: i32 = 0; l93 < 2; l93 = (l93 + 1)) { this.fRec53[l93] = <f32>(0.0); }
        for (let l94: i32 = 0; l94 < 2; l94 = (l94 + 1)) { this.fRec55[l94] = <f32>(0.0); }
        for (let l95: i32 = 0; l95 < 2; l95 = (l95 + 1)) { this.fRec56[l95] = <f32>(0.0); }
        for (let l96: i32 = 0; l96 < 2; l96 = (l96 + 1)) { this.fVec50[l96] = <f32>(0.0); }
        for (let l97: i32 = 0; l97 < 2; l97 = (l97 + 1)) { this.fRec52[l97] = <f32>(0.0); }
        for (let l98: i32 = 0; l98 < 2; l98 = (l98 + 1)) { this.fRec57[l98] = <f32>(0.0); }
        for (let l99: i32 = 0; l99 < 2; l99 = (l99 + 1)) { this.fVec51[l99] = <f32>(0.0); }
        for (let l100: i32 = 0; l100 < 2; l100 = (l100 + 1)) { this.fRec60[l100] = <f32>(0.0); }
        for (let l101: i32 = 0; l101 < 2; l101 = (l101 + 1)) { this.fRec59[l101] = <f32>(0.0); }
        for (let l102: i32 = 0; l102 < 2; l102 = (l102 + 1)) { this.fRec61[l102] = <f32>(0.0); }
        for (let l103: i32 = 0; l103 < 2; l103 = (l103 + 1)) { this.fVec52[l103] = <f32>(0.0); }
        for (let l104: i32 = 0; l104 < 2; l104 = (l104 + 1)) { this.fRec58[l104] = <f32>(0.0); }
        for (let l105: i32 = 0; l105 < 2; l105 = (l105 + 1)) { this.fRec62[l105] = <f32>(0.0); }
        for (let l106: i32 = 0; l106 < 2; l106 = (l106 + 1)) { this.fRec71[l106] = <f32>(0.0); }
        for (let l107: i32 = 0; l107 < 2; l107 = (l107 + 1)) { this.fRec67[l107] = <f32>(0.0); }
        for (let l108: i32 = 0; l108 < 2; l108 = (l108 + 1)) { this.fRec68[l108] = <f32>(0.0); }
        for (let l109: i32 = 0; l109 < 2; l109 = (l109 + 1)) { this.fRec63[l109] = <f32>(0.0); }
        for (let l110: i32 = 0; l110 < 2; l110 = (l110 + 1)) { this.fRec64[l110] = <f32>(0.0); }
        for (let l111: i32 = 0; l111 < 2; l111 = (l111 + 1)) { this.fVec53[l111] = <f32>(0.0); }
        for (let l112: i32 = 0; l112 < 3; l112 = (l112 + 1)) { this.fVec54[l112] = <f32>(0.0); }
        for (let l113: i32 = 0; l113 < 5; l113 = (l113 + 1)) { this.fVec55[l113] = <f32>(0.0); }
        for (let l114: i32 = 0; l114 < 12; l114 = (l114 + 1)) { this.fVec56[l114] = <f32>(0.0); }
        for (let l115: i32 = 0; l115 < 32; l115 = (l115 + 1)) { this.fVec57[l115] = <f32>(0.0); }
        for (let l116: i32 = 0; l116 < 64; l116 = (l116 + 1)) { this.fVec58[l116] = <f32>(0.0); }
        for (let l117: i32 = 0; l117 < 128; l117 = (l117 + 1)) { this.fVec59[l117] = <f32>(0.0); }
        for (let l118: i32 = 0; l118 < 256; l118 = (l118 + 1)) { this.fVec60[l118] = <f32>(0.0); }
        for (let l119: i32 = 0; l119 < 512; l119 = (l119 + 1)) { this.fVec61[l119] = <f32>(0.0); }
        for (let l120: i32 = 0; l120 < 1024; l120 = (l120 + 1)) { this.fVec62[l120] = <f32>(0.0); }
        for (let l121: i32 = 0; l121 < 2048; l121 = (l121 + 1)) { this.fVec63[l121] = <f32>(0.0); }
        for (let l122: i32 = 0; l122 < 4096; l122 = (l122 + 1)) { this.fVec64[l122] = <f32>(0.0); }
        for (let l123: i32 = 0; l123 < 8192; l123 = (l123 + 1)) { this.fVec65[l123] = <f32>(0.0); }
        for (let l124: i32 = 0; l124 < 16384; l124 = (l124 + 1)) { this.fVec66[l124] = <f32>(0.0); }
        for (let l125: i32 = 0; l125 < 32768; l125 = (l125 + 1)) { this.fVec67[l125] = <f32>(0.0); }
        for (let l126: i32 = 0; l126 < 2; l126 = (l126 + 1)) { this.fRec12[l126] = <f32>(0.0); }
        for (let l127: i32 = 0; l127 < 2; l127 = (l127 + 1)) { this.fVec68[l127] = <f32>(0.0); }
        for (let l128: i32 = 0; l128 < 2; l128 = (l128 + 1)) { this.fRec75[l128] = <f32>(0.0); }
        for (let l129: i32 = 0; l129 < 2; l129 = (l129 + 1)) { this.fRec74[l129] = <f32>(0.0); }
        for (let l130: i32 = 0; l130 < 2; l130 = (l130 + 1)) { this.fVec69[l130] = <f32>(0.0); }
        for (let l131: i32 = 0; l131 < 2; l131 = (l131 + 1)) { this.fRec73[l131] = <f32>(0.0); }
        for (let l132: i32 = 0; l132 < 2; l132 = (l132 + 1)) { this.fRec72[l132] = <f32>(0.0); }
        for (let l133: i32 = 0; l133 < 2; l133 = (l133 + 1)) { this.fVec70[l133] = <f32>(0.0); }
        for (let l134: i32 = 0; l134 < 3; l134 = (l134 + 1)) { this.fVec71[l134] = <f32>(0.0); }
        for (let l135: i32 = 0; l135 < 5; l135 = (l135 + 1)) { this.fVec72[l135] = <f32>(0.0); }
        for (let l136: i32 = 0; l136 < 12; l136 = (l136 + 1)) { this.fVec73[l136] = <f32>(0.0); }
        for (let l137: i32 = 0; l137 < 32; l137 = (l137 + 1)) { this.fVec74[l137] = <f32>(0.0); }
        for (let l138: i32 = 0; l138 < 64; l138 = (l138 + 1)) { this.fVec75[l138] = <f32>(0.0); }
        for (let l139: i32 = 0; l139 < 128; l139 = (l139 + 1)) { this.fVec76[l139] = <f32>(0.0); }
        for (let l140: i32 = 0; l140 < 256; l140 = (l140 + 1)) { this.fVec77[l140] = <f32>(0.0); }
        for (let l141: i32 = 0; l141 < 512; l141 = (l141 + 1)) { this.fVec78[l141] = <f32>(0.0); }
        for (let l142: i32 = 0; l142 < 1024; l142 = (l142 + 1)) { this.fVec79[l142] = <f32>(0.0); }
        for (let l143: i32 = 0; l143 < 2048; l143 = (l143 + 1)) { this.fVec80[l143] = <f32>(0.0); }
        for (let l144: i32 = 0; l144 < 4096; l144 = (l144 + 1)) { this.fVec81[l144] = <f32>(0.0); }
        for (let l145: i32 = 0; l145 < 8192; l145 = (l145 + 1)) { this.fVec82[l145] = <f32>(0.0); }
        for (let l146: i32 = 0; l146 < 16384; l146 = (l146 + 1)) { this.fVec83[l146] = <f32>(0.0); }
        for (let l147: i32 = 0; l147 < 32768; l147 = (l147 + 1)) { this.fVec84[l147] = <f32>(0.0); }
        for (let l148: i32 = 0; l148 < 65536; l148 = (l148 + 1)) { this.fVec85[l148] = <f32>(0.0); }
        for (let l149: i32 = 0; l149 < 131072; l149 = (l149 + 1)) { this.fVec86[l149] = <f32>(0.0); }
        for (let l150: i32 = 0; l150 < 2; l150 = (l150 + 1)) { this.fVec87[l150] = <f32>(0.0); }
        for (let l151: i32 = 0; l151 < 2; l151 = (l151 + 1)) { this.fRec79[l151] = <f32>(0.0); }
        for (let l152: i32 = 0; l152 < 2; l152 = (l152 + 1)) { this.fRec78[l152] = <f32>(0.0); }
        for (let l153: i32 = 0; l153 < 2; l153 = (l153 + 1)) { this.fVec88[l153] = <f32>(0.0); }
        for (let l154: i32 = 0; l154 < 2; l154 = (l154 + 1)) { this.fRec77[l154] = <f32>(0.0); }
        for (let l155: i32 = 0; l155 < 2; l155 = (l155 + 1)) { this.fRec76[l155] = <f32>(0.0); }
        for (let l156: i32 = 0; l156 < 2; l156 = (l156 + 1)) { this.fVec89[l156] = <f32>(0.0); }
        for (let l157: i32 = 0; l157 < 3; l157 = (l157 + 1)) { this.fVec90[l157] = <f32>(0.0); }
        for (let l158: i32 = 0; l158 < 5; l158 = (l158 + 1)) { this.fVec91[l158] = <f32>(0.0); }
        for (let l159: i32 = 0; l159 < 12; l159 = (l159 + 1)) { this.fVec92[l159] = <f32>(0.0); }
        for (let l160: i32 = 0; l160 < 32; l160 = (l160 + 1)) { this.fVec93[l160] = <f32>(0.0); }
        for (let l161: i32 = 0; l161 < 64; l161 = (l161 + 1)) { this.fVec94[l161] = <f32>(0.0); }
        for (let l162: i32 = 0; l162 < 128; l162 = (l162 + 1)) { this.fVec95[l162] = <f32>(0.0); }
        for (let l163: i32 = 0; l163 < 256; l163 = (l163 + 1)) { this.fVec96[l163] = <f32>(0.0); }
        for (let l164: i32 = 0; l164 < 512; l164 = (l164 + 1)) { this.fVec97[l164] = <f32>(0.0); }
        for (let l165: i32 = 0; l165 < 1024; l165 = (l165 + 1)) { this.fVec98[l165] = <f32>(0.0); }
        for (let l166: i32 = 0; l166 < 2048; l166 = (l166 + 1)) { this.fVec99[l166] = <f32>(0.0); }
        for (let l167: i32 = 0; l167 < 4096; l167 = (l167 + 1)) { this.fVec100[l167] = <f32>(0.0); }
        for (let l168: i32 = 0; l168 < 8192; l168 = (l168 + 1)) { this.fVec101[l168] = <f32>(0.0); }
        for (let l169: i32 = 0; l169 < 16384; l169 = (l169 + 1)) { this.fVec102[l169] = <f32>(0.0); }
        for (let l170: i32 = 0; l170 < 32768; l170 = (l170 + 1)) { this.fVec103[l170] = <f32>(0.0); }
        for (let l171: i32 = 0; l171 < 65536; l171 = (l171 + 1)) { this.fVec104[l171] = <f32>(0.0); }
        for (let l172: i32 = 0; l172 < 131072; l172 = (l172 + 1)) { this.fVec105[l172] = <f32>(0.0); }
        for (let l173: i32 = 0; l173 < 2; l173 = (l173 + 1)) { this.fRec11[l173] = <f32>(0.0); }
        for (let l174: i32 = 0; l174 < 2; l174 = (l174 + 1)) { this.fRec10[l174] = <f32>(0.0); }
        for (let l175: i32 = 0; l175 < 2; l175 = (l175 + 1)) { this.fRec80[l175] = <f32>(0.0); }
        for (let l176: i32 = 0; l176 < 2; l176 = (l176 + 1)) { this.fRec81[l176] = <f32>(0.0); }
        for (let l177: i32 = 0; l177 < 2; l177 = (l177 + 1)) { this.fRec82[l177] = <f32>(0.0); }
        for (let l178: i32 = 0; l178 < 262144; l178 = (l178 + 1)) { this.fRec84[l178] = <f32>(0.0); }
        for (let l179: i32 = 0; l179 < 2; l179 = (l179 + 1)) { this.fRec83[l179] = <f32>(0.0); }
        for (let l180: i32 = 0; l180 < 262144; l180 = (l180 + 1)) { this.fRec86[l180] = <f32>(0.0); }
        for (let l181: i32 = 0; l181 < 2; l181 = (l181 + 1)) { this.fRec85[l181] = <f32>(0.0); }
        for (let l182: i32 = 0; l182 < 2; l182 = (l182 + 1)) { this.fRec87[l182] = <f32>(0.0); }
        for (let l183: i32 = 0; l183 < 3; l183 = (l183 + 1)) { this.fRec91[l183] = <f32>(0.0); }
        for (let l184: i32 = 0; l184 < 3; l184 = (l184 + 1)) { this.fRec90[l184] = <f32>(0.0); }
        for (let l185: i32 = 0; l185 < 3; l185 = (l185 + 1)) { this.fRec89[l185] = <f32>(0.0); }
        for (let l186: i32 = 0; l186 < 2; l186 = (l186 + 1)) { this.fRec88[l186] = <f32>(0.0); }
        for (let l187: i32 = 0; l187 < 3; l187 = (l187 + 1)) { this.fRec95[l187] = <f32>(0.0); }
        for (let l188: i32 = 0; l188 < 3; l188 = (l188 + 1)) { this.fRec94[l188] = <f32>(0.0); }
        for (let l189: i32 = 0; l189 < 3; l189 = (l189 + 1)) { this.fRec93[l189] = <f32>(0.0); }
        for (let l190: i32 = 0; l190 < 2; l190 = (l190 + 1)) { this.fRec92[l190] = <f32>(0.0); }
        for (let l191: i32 = 0; l191 < 3; l191 = (l191 + 1)) { this.fRec326[l191] = <f32>(0.0); }
        for (let l192: i32 = 0; l192 < 3; l192 = (l192 + 1)) { this.fRec325[l192] = <f32>(0.0); }
        for (let l193: i32 = 0; l193 < 3; l193 = (l193 + 1)) { this.fRec324[l193] = <f32>(0.0); }
        for (let l194: i32 = 0; l194 < 3; l194 = (l194 + 1)) { this.fRec323[l194] = <f32>(0.0); }
        for (let l195: i32 = 0; l195 < 3; l195 = (l195 + 1)) { this.fRec322[l195] = <f32>(0.0); }
        for (let l196: i32 = 0; l196 < 3; l196 = (l196 + 1)) { this.fRec321[l196] = <f32>(0.0); }
        for (let l197: i32 = 0; l197 < 3; l197 = (l197 + 1)) { this.fRec320[l197] = <f32>(0.0); }
        for (let l198: i32 = 0; l198 < 3; l198 = (l198 + 1)) { this.fRec319[l198] = <f32>(0.0); }
        for (let l199: i32 = 0; l199 < 3; l199 = (l199 + 1)) { this.fRec318[l199] = <f32>(0.0); }
        for (let l200: i32 = 0; l200 < 3; l200 = (l200 + 1)) { this.fRec317[l200] = <f32>(0.0); }
        for (let l201: i32 = 0; l201 < 3; l201 = (l201 + 1)) { this.fRec316[l201] = <f32>(0.0); }
        for (let l202: i32 = 0; l202 < 3; l202 = (l202 + 1)) { this.fRec315[l202] = <f32>(0.0); }
        for (let l203: i32 = 0; l203 < 3; l203 = (l203 + 1)) { this.fRec314[l203] = <f32>(0.0); }
        for (let l204: i32 = 0; l204 < 3; l204 = (l204 + 1)) { this.fRec313[l204] = <f32>(0.0); }
        for (let l205: i32 = 0; l205 < 3; l205 = (l205 + 1)) { this.fRec312[l205] = <f32>(0.0); }
        for (let l206: i32 = 0; l206 < 3; l206 = (l206 + 1)) { this.fRec311[l206] = <f32>(0.0); }
        for (let l207: i32 = 0; l207 < 3; l207 = (l207 + 1)) { this.fRec310[l207] = <f32>(0.0); }
        for (let l208: i32 = 0; l208 < 3; l208 = (l208 + 1)) { this.fRec309[l208] = <f32>(0.0); }
        for (let l209: i32 = 0; l209 < 3; l209 = (l209 + 1)) { this.fRec308[l209] = <f32>(0.0); }
        for (let l210: i32 = 0; l210 < 3; l210 = (l210 + 1)) { this.fRec307[l210] = <f32>(0.0); }
        for (let l211: i32 = 0; l211 < 2; l211 = (l211 + 1)) { this.fRec306[l211] = <f32>(0.0); }
        for (let l212: i32 = 0; l212 < 3; l212 = (l212 + 1)) { this.fRec347[l212] = <f32>(0.0); }
        for (let l213: i32 = 0; l213 < 3; l213 = (l213 + 1)) { this.fRec346[l213] = <f32>(0.0); }
        for (let l214: i32 = 0; l214 < 3; l214 = (l214 + 1)) { this.fRec345[l214] = <f32>(0.0); }
        for (let l215: i32 = 0; l215 < 3; l215 = (l215 + 1)) { this.fRec344[l215] = <f32>(0.0); }
        for (let l216: i32 = 0; l216 < 3; l216 = (l216 + 1)) { this.fRec343[l216] = <f32>(0.0); }
        for (let l217: i32 = 0; l217 < 3; l217 = (l217 + 1)) { this.fRec342[l217] = <f32>(0.0); }
        for (let l218: i32 = 0; l218 < 3; l218 = (l218 + 1)) { this.fRec341[l218] = <f32>(0.0); }
        for (let l219: i32 = 0; l219 < 3; l219 = (l219 + 1)) { this.fRec340[l219] = <f32>(0.0); }
        for (let l220: i32 = 0; l220 < 3; l220 = (l220 + 1)) { this.fRec339[l220] = <f32>(0.0); }
        for (let l221: i32 = 0; l221 < 3; l221 = (l221 + 1)) { this.fRec338[l221] = <f32>(0.0); }
        for (let l222: i32 = 0; l222 < 3; l222 = (l222 + 1)) { this.fRec337[l222] = <f32>(0.0); }
        for (let l223: i32 = 0; l223 < 3; l223 = (l223 + 1)) { this.fRec336[l223] = <f32>(0.0); }
        for (let l224: i32 = 0; l224 < 3; l224 = (l224 + 1)) { this.fRec335[l224] = <f32>(0.0); }
        for (let l225: i32 = 0; l225 < 3; l225 = (l225 + 1)) { this.fRec334[l225] = <f32>(0.0); }
        for (let l226: i32 = 0; l226 < 3; l226 = (l226 + 1)) { this.fRec333[l226] = <f32>(0.0); }
        for (let l227: i32 = 0; l227 < 3; l227 = (l227 + 1)) { this.fRec332[l227] = <f32>(0.0); }
        for (let l228: i32 = 0; l228 < 3; l228 = (l228 + 1)) { this.fRec331[l228] = <f32>(0.0); }
        for (let l229: i32 = 0; l229 < 3; l229 = (l229 + 1)) { this.fRec330[l229] = <f32>(0.0); }
        for (let l230: i32 = 0; l230 < 3; l230 = (l230 + 1)) { this.fRec329[l230] = <f32>(0.0); }
        for (let l231: i32 = 0; l231 < 3; l231 = (l231 + 1)) { this.fRec328[l231] = <f32>(0.0); }
        for (let l232: i32 = 0; l232 < 2; l232 = (l232 + 1)) { this.fRec327[l232] = <f32>(0.0); }
        for (let l233: i32 = 0; l233 < 2; l233 = (l233 + 1)) { this.fRec301[l233] = <f32>(0.0); }
        for (let l234: i32 = 0; l234 < 2; l234 = (l234 + 1)) { this.fRec302[l234] = <f32>(0.0); }
        for (let l235: i32 = 0; l235 < 2; l235 = (l235 + 1)) { this.fRec296[l235] = <f32>(0.0); }
        for (let l236: i32 = 0; l236 < 2; l236 = (l236 + 1)) { this.fRec297[l236] = <f32>(0.0); }
        for (let l237: i32 = 0; l237 < 2; l237 = (l237 + 1)) { this.fRec291[l237] = <f32>(0.0); }
        for (let l238: i32 = 0; l238 < 2; l238 = (l238 + 1)) { this.fRec292[l238] = <f32>(0.0); }
        for (let l239: i32 = 0; l239 < 3; l239 = (l239 + 1)) { this.fRec350[l239] = <f32>(0.0); }
        for (let l240: i32 = 0; l240 < 3; l240 = (l240 + 1)) { this.fRec349[l240] = <f32>(0.0); }
        for (let l241: i32 = 0; l241 < 2; l241 = (l241 + 1)) { this.fRec348[l241] = <f32>(0.0); }
        for (let l242: i32 = 0; l242 < 3; l242 = (l242 + 1)) { this.fRec353[l242] = <f32>(0.0); }
        for (let l243: i32 = 0; l243 < 3; l243 = (l243 + 1)) { this.fRec352[l243] = <f32>(0.0); }
        for (let l244: i32 = 0; l244 < 2; l244 = (l244 + 1)) { this.fRec351[l244] = <f32>(0.0); }
        for (let l245: i32 = 0; l245 < 2; l245 = (l245 + 1)) { this.fRec286[l245] = <f32>(0.0); }
        for (let l246: i32 = 0; l246 < 2; l246 = (l246 + 1)) { this.fRec287[l246] = <f32>(0.0); }
        for (let l247: i32 = 0; l247 < 2; l247 = (l247 + 1)) { this.fRec281[l247] = <f32>(0.0); }
        for (let l248: i32 = 0; l248 < 2; l248 = (l248 + 1)) { this.fRec282[l248] = <f32>(0.0); }
        for (let l249: i32 = 0; l249 < 2; l249 = (l249 + 1)) { this.fRec276[l249] = <f32>(0.0); }
        for (let l250: i32 = 0; l250 < 2; l250 = (l250 + 1)) { this.fRec277[l250] = <f32>(0.0); }
        for (let l251: i32 = 0; l251 < 2; l251 = (l251 + 1)) { this.fRec271[l251] = <f32>(0.0); }
        for (let l252: i32 = 0; l252 < 2; l252 = (l252 + 1)) { this.fRec272[l252] = <f32>(0.0); }
        for (let l253: i32 = 0; l253 < 2; l253 = (l253 + 1)) { this.fRec266[l253] = <f32>(0.0); }
        for (let l254: i32 = 0; l254 < 2; l254 = (l254 + 1)) { this.fRec267[l254] = <f32>(0.0); }
        for (let l255: i32 = 0; l255 < 2; l255 = (l255 + 1)) { this.fRec261[l255] = <f32>(0.0); }
        for (let l256: i32 = 0; l256 < 2; l256 = (l256 + 1)) { this.fRec262[l256] = <f32>(0.0); }
        for (let l257: i32 = 0; l257 < 3; l257 = (l257 + 1)) { this.fRec356[l257] = <f32>(0.0); }
        for (let l258: i32 = 0; l258 < 3; l258 = (l258 + 1)) { this.fRec355[l258] = <f32>(0.0); }
        for (let l259: i32 = 0; l259 < 2; l259 = (l259 + 1)) { this.fRec354[l259] = <f32>(0.0); }
        for (let l260: i32 = 0; l260 < 3; l260 = (l260 + 1)) { this.fRec359[l260] = <f32>(0.0); }
        for (let l261: i32 = 0; l261 < 3; l261 = (l261 + 1)) { this.fRec358[l261] = <f32>(0.0); }
        for (let l262: i32 = 0; l262 < 2; l262 = (l262 + 1)) { this.fRec357[l262] = <f32>(0.0); }
        for (let l263: i32 = 0; l263 < 2; l263 = (l263 + 1)) { this.fRec256[l263] = <f32>(0.0); }
        for (let l264: i32 = 0; l264 < 2; l264 = (l264 + 1)) { this.fRec257[l264] = <f32>(0.0); }
        for (let l265: i32 = 0; l265 < 2; l265 = (l265 + 1)) { this.fRec251[l265] = <f32>(0.0); }
        for (let l266: i32 = 0; l266 < 2; l266 = (l266 + 1)) { this.fRec252[l266] = <f32>(0.0); }
        for (let l267: i32 = 0; l267 < 2; l267 = (l267 + 1)) { this.fRec246[l267] = <f32>(0.0); }
        for (let l268: i32 = 0; l268 < 2; l268 = (l268 + 1)) { this.fRec247[l268] = <f32>(0.0); }
        for (let l269: i32 = 0; l269 < 2; l269 = (l269 + 1)) { this.fRec241[l269] = <f32>(0.0); }
        for (let l270: i32 = 0; l270 < 2; l270 = (l270 + 1)) { this.fRec242[l270] = <f32>(0.0); }
        for (let l271: i32 = 0; l271 < 2; l271 = (l271 + 1)) { this.fRec236[l271] = <f32>(0.0); }
        for (let l272: i32 = 0; l272 < 2; l272 = (l272 + 1)) { this.fRec237[l272] = <f32>(0.0); }
        for (let l273: i32 = 0; l273 < 2; l273 = (l273 + 1)) { this.fRec231[l273] = <f32>(0.0); }
        for (let l274: i32 = 0; l274 < 2; l274 = (l274 + 1)) { this.fRec232[l274] = <f32>(0.0); }
        for (let l275: i32 = 0; l275 < 3; l275 = (l275 + 1)) { this.fRec362[l275] = <f32>(0.0); }
        for (let l276: i32 = 0; l276 < 3; l276 = (l276 + 1)) { this.fRec361[l276] = <f32>(0.0); }
        for (let l277: i32 = 0; l277 < 2; l277 = (l277 + 1)) { this.fRec360[l277] = <f32>(0.0); }
        for (let l278: i32 = 0; l278 < 3; l278 = (l278 + 1)) { this.fRec365[l278] = <f32>(0.0); }
        for (let l279: i32 = 0; l279 < 3; l279 = (l279 + 1)) { this.fRec364[l279] = <f32>(0.0); }
        for (let l280: i32 = 0; l280 < 2; l280 = (l280 + 1)) { this.fRec363[l280] = <f32>(0.0); }
        for (let l281: i32 = 0; l281 < 2; l281 = (l281 + 1)) { this.fRec226[l281] = <f32>(0.0); }
        for (let l282: i32 = 0; l282 < 2; l282 = (l282 + 1)) { this.fRec227[l282] = <f32>(0.0); }
        for (let l283: i32 = 0; l283 < 2; l283 = (l283 + 1)) { this.fRec221[l283] = <f32>(0.0); }
        for (let l284: i32 = 0; l284 < 2; l284 = (l284 + 1)) { this.fRec222[l284] = <f32>(0.0); }
        for (let l285: i32 = 0; l285 < 2; l285 = (l285 + 1)) { this.fRec216[l285] = <f32>(0.0); }
        for (let l286: i32 = 0; l286 < 2; l286 = (l286 + 1)) { this.fRec217[l286] = <f32>(0.0); }
        for (let l287: i32 = 0; l287 < 2; l287 = (l287 + 1)) { this.fRec211[l287] = <f32>(0.0); }
        for (let l288: i32 = 0; l288 < 2; l288 = (l288 + 1)) { this.fRec212[l288] = <f32>(0.0); }
        for (let l289: i32 = 0; l289 < 2; l289 = (l289 + 1)) { this.fRec206[l289] = <f32>(0.0); }
        for (let l290: i32 = 0; l290 < 2; l290 = (l290 + 1)) { this.fRec207[l290] = <f32>(0.0); }
        for (let l291: i32 = 0; l291 < 2; l291 = (l291 + 1)) { this.fRec201[l291] = <f32>(0.0); }
        for (let l292: i32 = 0; l292 < 2; l292 = (l292 + 1)) { this.fRec202[l292] = <f32>(0.0); }
        for (let l293: i32 = 0; l293 < 3; l293 = (l293 + 1)) { this.fRec368[l293] = <f32>(0.0); }
        for (let l294: i32 = 0; l294 < 3; l294 = (l294 + 1)) { this.fRec367[l294] = <f32>(0.0); }
        for (let l295: i32 = 0; l295 < 2; l295 = (l295 + 1)) { this.fRec366[l295] = <f32>(0.0); }
        for (let l296: i32 = 0; l296 < 3; l296 = (l296 + 1)) { this.fRec371[l296] = <f32>(0.0); }
        for (let l297: i32 = 0; l297 < 3; l297 = (l297 + 1)) { this.fRec370[l297] = <f32>(0.0); }
        for (let l298: i32 = 0; l298 < 2; l298 = (l298 + 1)) { this.fRec369[l298] = <f32>(0.0); }
        for (let l299: i32 = 0; l299 < 2; l299 = (l299 + 1)) { this.fRec196[l299] = <f32>(0.0); }
        for (let l300: i32 = 0; l300 < 2; l300 = (l300 + 1)) { this.fRec197[l300] = <f32>(0.0); }
        for (let l301: i32 = 0; l301 < 2; l301 = (l301 + 1)) { this.fRec191[l301] = <f32>(0.0); }
        for (let l302: i32 = 0; l302 < 2; l302 = (l302 + 1)) { this.fRec192[l302] = <f32>(0.0); }
        for (let l303: i32 = 0; l303 < 2; l303 = (l303 + 1)) { this.fRec186[l303] = <f32>(0.0); }
        for (let l304: i32 = 0; l304 < 2; l304 = (l304 + 1)) { this.fRec187[l304] = <f32>(0.0); }
        for (let l305: i32 = 0; l305 < 2; l305 = (l305 + 1)) { this.fRec181[l305] = <f32>(0.0); }
        for (let l306: i32 = 0; l306 < 2; l306 = (l306 + 1)) { this.fRec182[l306] = <f32>(0.0); }
        for (let l307: i32 = 0; l307 < 2; l307 = (l307 + 1)) { this.fRec176[l307] = <f32>(0.0); }
        for (let l308: i32 = 0; l308 < 2; l308 = (l308 + 1)) { this.fRec177[l308] = <f32>(0.0); }
        for (let l309: i32 = 0; l309 < 2; l309 = (l309 + 1)) { this.fRec171[l309] = <f32>(0.0); }
        for (let l310: i32 = 0; l310 < 2; l310 = (l310 + 1)) { this.fRec172[l310] = <f32>(0.0); }
        for (let l311: i32 = 0; l311 < 3; l311 = (l311 + 1)) { this.fRec374[l311] = <f32>(0.0); }
        for (let l312: i32 = 0; l312 < 3; l312 = (l312 + 1)) { this.fRec373[l312] = <f32>(0.0); }
        for (let l313: i32 = 0; l313 < 2; l313 = (l313 + 1)) { this.fRec372[l313] = <f32>(0.0); }
        for (let l314: i32 = 0; l314 < 3; l314 = (l314 + 1)) { this.fRec377[l314] = <f32>(0.0); }
        for (let l315: i32 = 0; l315 < 3; l315 = (l315 + 1)) { this.fRec376[l315] = <f32>(0.0); }
        for (let l316: i32 = 0; l316 < 2; l316 = (l316 + 1)) { this.fRec375[l316] = <f32>(0.0); }
        for (let l317: i32 = 0; l317 < 2; l317 = (l317 + 1)) { this.fRec166[l317] = <f32>(0.0); }
        for (let l318: i32 = 0; l318 < 2; l318 = (l318 + 1)) { this.fRec167[l318] = <f32>(0.0); }
        for (let l319: i32 = 0; l319 < 2; l319 = (l319 + 1)) { this.fRec161[l319] = <f32>(0.0); }
        for (let l320: i32 = 0; l320 < 2; l320 = (l320 + 1)) { this.fRec162[l320] = <f32>(0.0); }
        for (let l321: i32 = 0; l321 < 2; l321 = (l321 + 1)) { this.fRec156[l321] = <f32>(0.0); }
        for (let l322: i32 = 0; l322 < 2; l322 = (l322 + 1)) { this.fRec157[l322] = <f32>(0.0); }
        for (let l323: i32 = 0; l323 < 2; l323 = (l323 + 1)) { this.fRec151[l323] = <f32>(0.0); }
        for (let l324: i32 = 0; l324 < 2; l324 = (l324 + 1)) { this.fRec152[l324] = <f32>(0.0); }
        for (let l325: i32 = 0; l325 < 2; l325 = (l325 + 1)) { this.fRec146[l325] = <f32>(0.0); }
        for (let l326: i32 = 0; l326 < 2; l326 = (l326 + 1)) { this.fRec147[l326] = <f32>(0.0); }
        for (let l327: i32 = 0; l327 < 2; l327 = (l327 + 1)) { this.fRec141[l327] = <f32>(0.0); }
        for (let l328: i32 = 0; l328 < 2; l328 = (l328 + 1)) { this.fRec142[l328] = <f32>(0.0); }
        for (let l329: i32 = 0; l329 < 3; l329 = (l329 + 1)) { this.fRec380[l329] = <f32>(0.0); }
        for (let l330: i32 = 0; l330 < 3; l330 = (l330 + 1)) { this.fRec379[l330] = <f32>(0.0); }
        for (let l331: i32 = 0; l331 < 2; l331 = (l331 + 1)) { this.fRec378[l331] = <f32>(0.0); }
        for (let l332: i32 = 0; l332 < 3; l332 = (l332 + 1)) { this.fRec383[l332] = <f32>(0.0); }
        for (let l333: i32 = 0; l333 < 3; l333 = (l333 + 1)) { this.fRec382[l333] = <f32>(0.0); }
        for (let l334: i32 = 0; l334 < 2; l334 = (l334 + 1)) { this.fRec381[l334] = <f32>(0.0); }
        for (let l335: i32 = 0; l335 < 2; l335 = (l335 + 1)) { this.fRec136[l335] = <f32>(0.0); }
        for (let l336: i32 = 0; l336 < 2; l336 = (l336 + 1)) { this.fRec137[l336] = <f32>(0.0); }
        for (let l337: i32 = 0; l337 < 2; l337 = (l337 + 1)) { this.fRec131[l337] = <f32>(0.0); }
        for (let l338: i32 = 0; l338 < 2; l338 = (l338 + 1)) { this.fRec132[l338] = <f32>(0.0); }
        for (let l339: i32 = 0; l339 < 2; l339 = (l339 + 1)) { this.fRec126[l339] = <f32>(0.0); }
        for (let l340: i32 = 0; l340 < 2; l340 = (l340 + 1)) { this.fRec127[l340] = <f32>(0.0); }
        for (let l341: i32 = 0; l341 < 2; l341 = (l341 + 1)) { this.fRec121[l341] = <f32>(0.0); }
        for (let l342: i32 = 0; l342 < 2; l342 = (l342 + 1)) { this.fRec122[l342] = <f32>(0.0); }
        for (let l343: i32 = 0; l343 < 2; l343 = (l343 + 1)) { this.fRec116[l343] = <f32>(0.0); }
        for (let l344: i32 = 0; l344 < 2; l344 = (l344 + 1)) { this.fRec117[l344] = <f32>(0.0); }
        for (let l345: i32 = 0; l345 < 2; l345 = (l345 + 1)) { this.fRec111[l345] = <f32>(0.0); }
        for (let l346: i32 = 0; l346 < 2; l346 = (l346 + 1)) { this.fRec112[l346] = <f32>(0.0); }
        for (let l347: i32 = 0; l347 < 2; l347 = (l347 + 1)) { this.fRec106[l347] = <f32>(0.0); }
        for (let l348: i32 = 0; l348 < 2; l348 = (l348 + 1)) { this.fRec107[l348] = <f32>(0.0); }
        for (let l349: i32 = 0; l349 < 2; l349 = (l349 + 1)) { this.fRec101[l349] = <f32>(0.0); }
        for (let l350: i32 = 0; l350 < 2; l350 = (l350 + 1)) { this.fRec102[l350] = <f32>(0.0); }
        for (let l351: i32 = 0; l351 < 2; l351 = (l351 + 1)) { this.fRec96[l351] = <f32>(0.0); }
        for (let l352: i32 = 0; l352 < 2; l352 = (l352 + 1)) { this.fRec97[l352] = <f32>(0.0); }
        for (let l353: i32 = 0; l353 < 2; l353 = (l353 + 1)) { this.fRec589[l353] = <f32>(0.0); }
        for (let l354: i32 = 0; l354 < 2; l354 = (l354 + 1)) { this.fRec590[l354] = <f32>(0.0); }
        for (let l355: i32 = 0; l355 < 2; l355 = (l355 + 1)) { this.fRec584[l355] = <f32>(0.0); }
        for (let l356: i32 = 0; l356 < 2; l356 = (l356 + 1)) { this.fRec585[l356] = <f32>(0.0); }
        for (let l357: i32 = 0; l357 < 2; l357 = (l357 + 1)) { this.fRec579[l357] = <f32>(0.0); }
        for (let l358: i32 = 0; l358 < 2; l358 = (l358 + 1)) { this.fRec580[l358] = <f32>(0.0); }
        for (let l359: i32 = 0; l359 < 2; l359 = (l359 + 1)) { this.fRec574[l359] = <f32>(0.0); }
        for (let l360: i32 = 0; l360 < 2; l360 = (l360 + 1)) { this.fRec575[l360] = <f32>(0.0); }
        for (let l361: i32 = 0; l361 < 2; l361 = (l361 + 1)) { this.fRec569[l361] = <f32>(0.0); }
        for (let l362: i32 = 0; l362 < 2; l362 = (l362 + 1)) { this.fRec570[l362] = <f32>(0.0); }
        for (let l363: i32 = 0; l363 < 2; l363 = (l363 + 1)) { this.fRec564[l363] = <f32>(0.0); }
        for (let l364: i32 = 0; l364 < 2; l364 = (l364 + 1)) { this.fRec565[l364] = <f32>(0.0); }
        for (let l365: i32 = 0; l365 < 2; l365 = (l365 + 1)) { this.fRec559[l365] = <f32>(0.0); }
        for (let l366: i32 = 0; l366 < 2; l366 = (l366 + 1)) { this.fRec560[l366] = <f32>(0.0); }
        for (let l367: i32 = 0; l367 < 2; l367 = (l367 + 1)) { this.fRec554[l367] = <f32>(0.0); }
        for (let l368: i32 = 0; l368 < 2; l368 = (l368 + 1)) { this.fRec555[l368] = <f32>(0.0); }
        for (let l369: i32 = 0; l369 < 2; l369 = (l369 + 1)) { this.fRec549[l369] = <f32>(0.0); }
        for (let l370: i32 = 0; l370 < 2; l370 = (l370 + 1)) { this.fRec550[l370] = <f32>(0.0); }
        for (let l371: i32 = 0; l371 < 2; l371 = (l371 + 1)) { this.fRec544[l371] = <f32>(0.0); }
        for (let l372: i32 = 0; l372 < 2; l372 = (l372 + 1)) { this.fRec545[l372] = <f32>(0.0); }
        for (let l373: i32 = 0; l373 < 2; l373 = (l373 + 1)) { this.fRec539[l373] = <f32>(0.0); }
        for (let l374: i32 = 0; l374 < 2; l374 = (l374 + 1)) { this.fRec540[l374] = <f32>(0.0); }
        for (let l375: i32 = 0; l375 < 2; l375 = (l375 + 1)) { this.fRec534[l375] = <f32>(0.0); }
        for (let l376: i32 = 0; l376 < 2; l376 = (l376 + 1)) { this.fRec535[l376] = <f32>(0.0); }
        for (let l377: i32 = 0; l377 < 2; l377 = (l377 + 1)) { this.fRec529[l377] = <f32>(0.0); }
        for (let l378: i32 = 0; l378 < 2; l378 = (l378 + 1)) { this.fRec530[l378] = <f32>(0.0); }
        for (let l379: i32 = 0; l379 < 2; l379 = (l379 + 1)) { this.fRec524[l379] = <f32>(0.0); }
        for (let l380: i32 = 0; l380 < 2; l380 = (l380 + 1)) { this.fRec525[l380] = <f32>(0.0); }
        for (let l381: i32 = 0; l381 < 2; l381 = (l381 + 1)) { this.fRec519[l381] = <f32>(0.0); }
        for (let l382: i32 = 0; l382 < 2; l382 = (l382 + 1)) { this.fRec520[l382] = <f32>(0.0); }
        for (let l383: i32 = 0; l383 < 2; l383 = (l383 + 1)) { this.fRec514[l383] = <f32>(0.0); }
        for (let l384: i32 = 0; l384 < 2; l384 = (l384 + 1)) { this.fRec515[l384] = <f32>(0.0); }
        for (let l385: i32 = 0; l385 < 2; l385 = (l385 + 1)) { this.fRec509[l385] = <f32>(0.0); }
        for (let l386: i32 = 0; l386 < 2; l386 = (l386 + 1)) { this.fRec510[l386] = <f32>(0.0); }
        for (let l387: i32 = 0; l387 < 2; l387 = (l387 + 1)) { this.fRec504[l387] = <f32>(0.0); }
        for (let l388: i32 = 0; l388 < 2; l388 = (l388 + 1)) { this.fRec505[l388] = <f32>(0.0); }
        for (let l389: i32 = 0; l389 < 2; l389 = (l389 + 1)) { this.fRec499[l389] = <f32>(0.0); }
        for (let l390: i32 = 0; l390 < 2; l390 = (l390 + 1)) { this.fRec500[l390] = <f32>(0.0); }
        for (let l391: i32 = 0; l391 < 2; l391 = (l391 + 1)) { this.fRec494[l391] = <f32>(0.0); }
        for (let l392: i32 = 0; l392 < 2; l392 = (l392 + 1)) { this.fRec495[l392] = <f32>(0.0); }
        for (let l393: i32 = 0; l393 < 2; l393 = (l393 + 1)) { this.fRec489[l393] = <f32>(0.0); }
        for (let l394: i32 = 0; l394 < 2; l394 = (l394 + 1)) { this.fRec490[l394] = <f32>(0.0); }
        for (let l395: i32 = 0; l395 < 2; l395 = (l395 + 1)) { this.fRec484[l395] = <f32>(0.0); }
        for (let l396: i32 = 0; l396 < 2; l396 = (l396 + 1)) { this.fRec485[l396] = <f32>(0.0); }
        for (let l397: i32 = 0; l397 < 2; l397 = (l397 + 1)) { this.fRec479[l397] = <f32>(0.0); }
        for (let l398: i32 = 0; l398 < 2; l398 = (l398 + 1)) { this.fRec480[l398] = <f32>(0.0); }
        for (let l399: i32 = 0; l399 < 2; l399 = (l399 + 1)) { this.fRec474[l399] = <f32>(0.0); }
        for (let l400: i32 = 0; l400 < 2; l400 = (l400 + 1)) { this.fRec475[l400] = <f32>(0.0); }
        for (let l401: i32 = 0; l401 < 2; l401 = (l401 + 1)) { this.fRec469[l401] = <f32>(0.0); }
        for (let l402: i32 = 0; l402 < 2; l402 = (l402 + 1)) { this.fRec470[l402] = <f32>(0.0); }
        for (let l403: i32 = 0; l403 < 2; l403 = (l403 + 1)) { this.fRec464[l403] = <f32>(0.0); }
        for (let l404: i32 = 0; l404 < 2; l404 = (l404 + 1)) { this.fRec465[l404] = <f32>(0.0); }
        for (let l405: i32 = 0; l405 < 2; l405 = (l405 + 1)) { this.fRec459[l405] = <f32>(0.0); }
        for (let l406: i32 = 0; l406 < 2; l406 = (l406 + 1)) { this.fRec460[l406] = <f32>(0.0); }
        for (let l407: i32 = 0; l407 < 2; l407 = (l407 + 1)) { this.fRec454[l407] = <f32>(0.0); }
        for (let l408: i32 = 0; l408 < 2; l408 = (l408 + 1)) { this.fRec455[l408] = <f32>(0.0); }
        for (let l409: i32 = 0; l409 < 2; l409 = (l409 + 1)) { this.fRec449[l409] = <f32>(0.0); }
        for (let l410: i32 = 0; l410 < 2; l410 = (l410 + 1)) { this.fRec450[l410] = <f32>(0.0); }
        for (let l411: i32 = 0; l411 < 2; l411 = (l411 + 1)) { this.fRec444[l411] = <f32>(0.0); }
        for (let l412: i32 = 0; l412 < 2; l412 = (l412 + 1)) { this.fRec445[l412] = <f32>(0.0); }
        for (let l413: i32 = 0; l413 < 2; l413 = (l413 + 1)) { this.fRec439[l413] = <f32>(0.0); }
        for (let l414: i32 = 0; l414 < 2; l414 = (l414 + 1)) { this.fRec440[l414] = <f32>(0.0); }
        for (let l415: i32 = 0; l415 < 2; l415 = (l415 + 1)) { this.fRec434[l415] = <f32>(0.0); }
        for (let l416: i32 = 0; l416 < 2; l416 = (l416 + 1)) { this.fRec435[l416] = <f32>(0.0); }
        for (let l417: i32 = 0; l417 < 2; l417 = (l417 + 1)) { this.fRec429[l417] = <f32>(0.0); }
        for (let l418: i32 = 0; l418 < 2; l418 = (l418 + 1)) { this.fRec430[l418] = <f32>(0.0); }
        for (let l419: i32 = 0; l419 < 2; l419 = (l419 + 1)) { this.fRec424[l419] = <f32>(0.0); }
        for (let l420: i32 = 0; l420 < 2; l420 = (l420 + 1)) { this.fRec425[l420] = <f32>(0.0); }
        for (let l421: i32 = 0; l421 < 2; l421 = (l421 + 1)) { this.fRec419[l421] = <f32>(0.0); }
        for (let l422: i32 = 0; l422 < 2; l422 = (l422 + 1)) { this.fRec420[l422] = <f32>(0.0); }
        for (let l423: i32 = 0; l423 < 2; l423 = (l423 + 1)) { this.fRec414[l423] = <f32>(0.0); }
        for (let l424: i32 = 0; l424 < 2; l424 = (l424 + 1)) { this.fRec415[l424] = <f32>(0.0); }
        for (let l425: i32 = 0; l425 < 2; l425 = (l425 + 1)) { this.fRec409[l425] = <f32>(0.0); }
        for (let l426: i32 = 0; l426 < 2; l426 = (l426 + 1)) { this.fRec410[l426] = <f32>(0.0); }
        for (let l427: i32 = 0; l427 < 2; l427 = (l427 + 1)) { this.fRec404[l427] = <f32>(0.0); }
        for (let l428: i32 = 0; l428 < 2; l428 = (l428 + 1)) { this.fRec405[l428] = <f32>(0.0); }
        for (let l429: i32 = 0; l429 < 2; l429 = (l429 + 1)) { this.fRec399[l429] = <f32>(0.0); }
        for (let l430: i32 = 0; l430 < 2; l430 = (l430 + 1)) { this.fRec400[l430] = <f32>(0.0); }
        for (let l431: i32 = 0; l431 < 2; l431 = (l431 + 1)) { this.fRec394[l431] = <f32>(0.0); }
        for (let l432: i32 = 0; l432 < 2; l432 = (l432 + 1)) { this.fRec395[l432] = <f32>(0.0); }
        for (let l433: i32 = 0; l433 < 2; l433 = (l433 + 1)) { this.fRec389[l433] = <f32>(0.0); }
        for (let l434: i32 = 0; l434 < 2; l434 = (l434 + 1)) { this.fRec390[l434] = <f32>(0.0); }
        for (let l435: i32 = 0; l435 < 2; l435 = (l435 + 1)) { this.fRec384[l435] = <f32>(0.0); }
        for (let l436: i32 = 0; l436 < 2; l436 = (l436 + 1)) { this.fRec385[l436] = <f32>(0.0); }
        for (let l437: i32 = 0; l437 < 131072; l437 = (l437 + 1)) { this.fRec595[l437] = <f32>(0.0); }
        for (let l438: i32 = 0; l438 < 2; l438 = (l438 + 1)) { this.fRec594[l438] = <f32>(0.0); }
        for (let l439: i32 = 0; l439 < 131072; l439 = (l439 + 1)) { this.fRec597[l439] = <f32>(0.0); }
        for (let l440: i32 = 0; l440 < 2; l440 = (l440 + 1)) { this.fRec596[l440] = <f32>(0.0); }
        for (let l441: i32 = 0; l441 < 2; l441 = (l441 + 1)) { this.fRec6[l441] = <f32>(0.0); }
        for (let l442: i32 = 0; l442 < 2; l442 = (l442 + 1)) { this.fRec7[l442] = <f32>(0.0); }
        for (let l443: i32 = 0; l443 < 2; l443 = (l443 + 1)) { this.fRec598[l443] = <f32>(0.0); }
        for (let l444: i32 = 0; l444 < 2; l444 = (l444 + 1)) { this.fRec599[l444] = <f32>(0.0); }
        for (let l445: i32 = 0; l445 < 2; l445 = (l445 + 1)) { this.fRec600[l445] = <f32>(0.0); }
        for (let l446: i32 = 0; l446 < 2; l446 = (l446 + 1)) { this.fRec601[l446] = <f32>(0.0); }
        for (let l447: i32 = 0; l447 < 2; l447 = (l447 + 1)) { this.fRec602[l447] = <f32>(0.0); }
        for (let l448: i32 = 0; l448 < 2; l448 = (l448 + 1)) { this.fRec4[l448] = <f32>(0.0); }
        for (let l449: i32 = 0; l449 < 2; l449 = (l449 + 1)) { this.fRec5[l449] = <f32>(0.0); }
        for (let l450: i32 = 0; l450 < 3; l450 = (l450 + 1)) { this.fRec2[l450] = <f32>(0.0); }
        for (let l451: i32 = 0; l451 < 3; l451 = (l451 + 1)) { this.fRec3[l451] = <f32>(0.0); }
        for (let l452: i32 = 0; l452 < 2; l452 = (l452 + 1)) { this.fVec106[l452] = <f32>(0.0); }
        for (let l453: i32 = 0; l453 < 2; l453 = (l453 + 1)) { this.fRec0[l453] = <f32>(0.0); }
        for (let l454: i32 = 0; l454 < 2; l454 = (l454 + 1)) { this.fVec107[l454] = <f32>(0.0); }
        for (let l455: i32 = 0; l455 < 2; l455 = (l455 + 1)) { this.fRec607[l455] = <f32>(0.0); }
        for (let l456: i32 = 0; l456 < 2; l456 = (l456 + 1)) { this.fRec606[l456] = <f32>(0.0); }
        for (let l457: i32 = 0; l457 < 2; l457 = (l457 + 1)) { this.fVec108[l457] = <f32>(0.0); }
        for (let l458: i32 = 0; l458 < 2; l458 = (l458 + 1)) { this.fRec605[l458] = <f32>(0.0); }
        for (let l459: i32 = 0; l459 < 2; l459 = (l459 + 1)) { this.fRec604[l459] = <f32>(0.0); }
        for (let l460: i32 = 0; l460 < 2; l460 = (l460 + 1)) { this.fVec109[l460] = <f32>(0.0); }
        for (let l461: i32 = 0; l461 < 3; l461 = (l461 + 1)) { this.fVec110[l461] = <f32>(0.0); }
        for (let l462: i32 = 0; l462 < 5; l462 = (l462 + 1)) { this.fVec111[l462] = <f32>(0.0); }
        for (let l463: i32 = 0; l463 < 12; l463 = (l463 + 1)) { this.fVec112[l463] = <f32>(0.0); }
        for (let l464: i32 = 0; l464 < 32; l464 = (l464 + 1)) { this.fVec113[l464] = <f32>(0.0); }
        for (let l465: i32 = 0; l465 < 64; l465 = (l465 + 1)) { this.fVec114[l465] = <f32>(0.0); }
        for (let l466: i32 = 0; l466 < 128; l466 = (l466 + 1)) { this.fVec115[l466] = <f32>(0.0); }
        for (let l467: i32 = 0; l467 < 256; l467 = (l467 + 1)) { this.fVec116[l467] = <f32>(0.0); }
        for (let l468: i32 = 0; l468 < 512; l468 = (l468 + 1)) { this.fVec117[l468] = <f32>(0.0); }
        for (let l469: i32 = 0; l469 < 1024; l469 = (l469 + 1)) { this.fVec118[l469] = <f32>(0.0); }
        for (let l470: i32 = 0; l470 < 2048; l470 = (l470 + 1)) { this.fVec119[l470] = <f32>(0.0); }
        for (let l471: i32 = 0; l471 < 4096; l471 = (l471 + 1)) { this.fVec120[l471] = <f32>(0.0); }
        for (let l472: i32 = 0; l472 < 8192; l472 = (l472 + 1)) { this.fVec121[l472] = <f32>(0.0); }
        for (let l473: i32 = 0; l473 < 16384; l473 = (l473 + 1)) { this.fVec122[l473] = <f32>(0.0); }
        for (let l474: i32 = 0; l474 < 32768; l474 = (l474 + 1)) { this.fVec123[l474] = <f32>(0.0); }
        for (let l475: i32 = 0; l475 < 65536; l475 = (l475 + 1)) { this.fVec124[l475] = <f32>(0.0); }
        for (let l476: i32 = 0; l476 < 131072; l476 = (l476 + 1)) { this.fVec125[l476] = <f32>(0.0); }
        for (let l477: i32 = 0; l477 < 262144; l477 = (l477 + 1)) { this.fVec126[l477] = <f32>(0.0); }
        for (let l478: i32 = 0; l478 < 524288; l478 = (l478 + 1)) { this.fVec127[l478] = <f32>(0.0); }
        for (let l479: i32 = 0; l479 < 1048576; l479 = (l479 + 1)) { this.fVec128[l479] = <f32>(0.0); }
        for (let l480: i32 = 0; l480 < 2; l480 = (l480 + 1)) { this.fVec129[l480] = <f32>(0.0); }
        for (let l481: i32 = 0; l481 < 2; l481 = (l481 + 1)) { this.fVec130[l481] = <f32>(0.0); }
        for (let l482: i32 = 0; l482 < 2; l482 = (l482 + 1)) { this.fRec611[l482] = <f32>(0.0); }
        for (let l483: i32 = 0; l483 < 2; l483 = (l483 + 1)) { this.fRec610[l483] = <f32>(0.0); }
        for (let l484: i32 = 0; l484 < 2; l484 = (l484 + 1)) { this.fVec131[l484] = <f32>(0.0); }
        for (let l485: i32 = 0; l485 < 2; l485 = (l485 + 1)) { this.fRec609[l485] = <f32>(0.0); }
        for (let l486: i32 = 0; l486 < 2; l486 = (l486 + 1)) { this.fRec608[l486] = <f32>(0.0); }
        for (let l487: i32 = 0; l487 < 2; l487 = (l487 + 1)) { this.fVec132[l487] = <f32>(0.0); }
        for (let l488: i32 = 0; l488 < 3; l488 = (l488 + 1)) { this.fVec133[l488] = <f32>(0.0); }
        for (let l489: i32 = 0; l489 < 5; l489 = (l489 + 1)) { this.fVec134[l489] = <f32>(0.0); }
        for (let l490: i32 = 0; l490 < 12; l490 = (l490 + 1)) { this.fVec135[l490] = <f32>(0.0); }
        for (let l491: i32 = 0; l491 < 32; l491 = (l491 + 1)) { this.fVec136[l491] = <f32>(0.0); }
        for (let l492: i32 = 0; l492 < 64; l492 = (l492 + 1)) { this.fVec137[l492] = <f32>(0.0); }
        for (let l493: i32 = 0; l493 < 128; l493 = (l493 + 1)) { this.fVec138[l493] = <f32>(0.0); }
        for (let l494: i32 = 0; l494 < 256; l494 = (l494 + 1)) { this.fVec139[l494] = <f32>(0.0); }
        for (let l495: i32 = 0; l495 < 512; l495 = (l495 + 1)) { this.fVec140[l495] = <f32>(0.0); }
        for (let l496: i32 = 0; l496 < 1024; l496 = (l496 + 1)) { this.fVec141[l496] = <f32>(0.0); }
        for (let l497: i32 = 0; l497 < 2048; l497 = (l497 + 1)) { this.fVec142[l497] = <f32>(0.0); }
        for (let l498: i32 = 0; l498 < 4096; l498 = (l498 + 1)) { this.fVec143[l498] = <f32>(0.0); }
        for (let l499: i32 = 0; l499 < 8192; l499 = (l499 + 1)) { this.fVec144[l499] = <f32>(0.0); }
        for (let l500: i32 = 0; l500 < 16384; l500 = (l500 + 1)) { this.fVec145[l500] = <f32>(0.0); }
        for (let l501: i32 = 0; l501 < 32768; l501 = (l501 + 1)) { this.fVec146[l501] = <f32>(0.0); }
        for (let l502: i32 = 0; l502 < 65536; l502 = (l502 + 1)) { this.fVec147[l502] = <f32>(0.0); }
        for (let l503: i32 = 0; l503 < 131072; l503 = (l503 + 1)) { this.fVec148[l503] = <f32>(0.0); }
        for (let l504: i32 = 0; l504 < 262144; l504 = (l504 + 1)) { this.fVec149[l504] = <f32>(0.0); }
        for (let l505: i32 = 0; l505 < 524288; l505 = (l505 + 1)) { this.fVec150[l505] = <f32>(0.0); }
        for (let l506: i32 = 0; l506 < 1048576; l506 = (l506 + 1)) { this.fVec151[l506] = <f32>(0.0); }
        for (let l507: i32 = 0; l507 < 2; l507 = (l507 + 1)) { this.fRec603[l507] = <f32>(0.0); }
    }

    process(): void {
        const _inL: f32 = outputline.left;
        const _inR: f32 = outputline.right;

        const fSlow0: f32 = (this.fConst2 * this.fCheckbox0);
        const fSlow1: f32 = (this.fConst2 * this.fCheckbox1);
        const fSlow2: f32 = (this.fConst2 * this.fCheckbox2);
        const fSlow3: f32 = (<f32>(106.103294) / this.fVslider0);
        const fSlow4: f32 = (this.fConst2 * this.fCheckbox3);
        const fSlow5: f32 = (<f32>(0.001) * this.fVslider1);
        const fSlow6: f32 = (<f32>(0.001) * this.fVslider2);
        const fSlow7: f32 = min<f32>(fSlow5, fSlow6);
        const iSlow8: i32 = Mathf.abs(fSlow7) < <f32>(1.1920929e-07);
        const fSlow9: f32 = ((iSlow8) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow8) ? <f32>(1.0) : fSlow7)))));
        const fSlow10: f32 = (<f32>(1.0) - fSlow9);
        const fSlow11: f32 = (this.fConst2 * (<f32>(1.0) - this.fCheckbox4));
        const fSlow12: f32 = (this.fConst2 * (<f32>(1.0) - this.fCheckbox5));
        const fSlow13: f32 = this.fCheckbox6;
        const fSlow14: f32 = (fSlow13 - (<f32>(1.0) - fSlow13));
        const fSlow15: f32 = (this.fConst2 * Mathf.pow(<f32>(1e+01), (<f32>(0.05) * this.fVslider3)));
        const fSlow16: f32 = (this.fConst2 * (<f32>(1.0) - this.fCheckbox7));
        const fSlow17: f32 = this.fCheckbox8;
        const fSlow18: f32 = (fSlow17 - (<f32>(1.0) - fSlow17));
        const fSlow19: f32 = Mathf.pow(<f32>(1e+01), (<f32>(0.05) * this.fVslider4));
        const iSlow20: i32 = <i32>((this.fConst69 * this.fVslider5));
        const iSlow21: i32 = Mathf.abs(fSlow6) < <f32>(1.1920929e-07);
        const fSlow22: f32 = ((iSlow21) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow21) ? <f32>(1.0) : fSlow6)))));
        const iSlow23: i32 = Mathf.abs(fSlow5) < <f32>(1.1920929e-07);
        const fSlow24: f32 = ((iSlow23) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow23) ? <f32>(1.0) : fSlow5)))));
        const fSlow25: f32 = (this.fConst2 * this.fCheckbox9);
        const fSlow26: f32 = (<f32>(1.0) / Mathf.tan((this.fConst73 * this.fVslider6)));
        const fSlow27: f32 = (<f32>(1.0) / (fSlow26 + <f32>(1.0)));
        const fSlow28: f32 = (<f32>(1.0) - fSlow26);
        const fSlow29: f32 = (this.fConst2 * this.fVslider7);
        const fSlow30: f32 = this.fVslider8;
        const fSlow31: f32 = this.fVslider9;
        const fSlow32: f32 = Mathf.tan((this.fConst73 * min<f32>(<f32>(8e+03), (fSlow30 * (fSlow31 + <f32>(1.0))))));
        const fSlow33: f32 = Mathf.tan((this.fConst73 * max<f32>(<f32>(5e+01), (fSlow30 * (<f32>(1.0) - fSlow31)))));
        const fSlow34: f32 = (this.fConst2 * this.fVslider10);
        const fSlow35: f32 = this.fVslider11;
        const fSlow36: f32 = (fSlow35 + <f32>(-6.0));
        const fSlow37: f32 = (fSlow35 + <f32>(6.0));
        const fSlow38: f32 = this.fVslider13;
        const fSlow39: f32 = this.fVslider14;
        const fSlow40: f32 = (this.fConst137 * this.fVslider15);
        const fSlow41: f32 = (this.fConst2 * this.fCheckbox10);
        const fSlow42: f32 = (this.fConst2 * this.fVslider16);
        const fSlow43: f32 = this.fVslider17;
        const iSlow44: i32 = max<i32>(<i32>(1), <i32>((this.fConst69 * this.fVslider18)));
        const fSlow45: f32 = (<f32>(1.0) / <f32>(iSlow44));
        const fSlow46: f32 = (<f32>(0.01) * this.fVslider19);
        const fSlow47: f32 = (<f32>(1.0) - fSlow46);
        const iSlow48: i32 = max<i32>(<i32>(0), iSlow44);
        const fSlow49: f32 = (<f32>(0.001) * this.fVslider20);
        const iSlow50: i32 = Mathf.abs(fSlow49) < <f32>(1.1920929e-07);
        const fSlow51: f32 = ((iSlow50) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow50) ? <f32>(1.0) : fSlow49)))));
        const fSlow52: f32 = (fSlow39 + this.fVslider21);
        const fSlow53: f32 = this.fVslider22;
        const fSlow54: f32 = (<f32>(0.5) * fSlow53);
        const fSlow55: f32 = (fSlow52 - fSlow54);
        const fSlow56: f32 = (fSlow52 + fSlow54);
        const fSlow57: f32 = (<f32>(0.5) / max<f32>(<f32>(1.1920929e-07), fSlow53));
        const fSlow58: f32 = this.fVslider23;
        const fSlow59: f32 = (<f32>(0.01) * fSlow43);
        const fSlow60: f32 = (this.fConst2 * Mathf.pow(<f32>(1e+01), (<f32>(0.05) * this.fVslider24)));
        const fSlow61: f32 = this.fVslider25;
        const fSlow62: f32 = (fSlow61 - this.fVslider26);
        const fSlow63: f32 = (<f32>(0.01) * (fSlow61 - fSlow62));
        const fSlow64: f32 = max<f32>(<f32>(1.1920929e-07), this.fVslider27);
        const fSlow65: f32 = Mathf.pow((max<f32>(<f32>(1.1920929e-07), this.fVslider28) / fSlow64), <f32>(0.16666667));
        const fSlow66: f32 = Mathf.tan((this.fConst73 * (fSlow64 * Mathf.pow(fSlow65, <f32>(6.0)))));
        const fSlow67: f32 = Mathf.pow(fSlow66, <f32>(2.0));
        const fSlow68: f32 = (<f32>(1.0) / fSlow66);
        const fSlow69: f32 = (((fSlow68 + <f32>(0.5176381)) / fSlow66) + <f32>(1.0));
        const fSlow70: f32 = (<f32>(1.0) / (fSlow67 * fSlow69));
        const fSlow71: f32 = (((fSlow68 + <f32>(1.4142135)) / fSlow66) + <f32>(1.0));
        const fSlow72: f32 = (<f32>(1.0) / (fSlow67 * fSlow71));
        const fSlow73: f32 = (((fSlow68 + <f32>(1.9318516)) / fSlow66) + <f32>(1.0));
        const fSlow74: f32 = (<f32>(1.0) / (fSlow67 * fSlow73));
        const fSlow75: f32 = (<f32>(1.0) / fSlow73);
        const fSlow76: f32 = (((fSlow68 + <f32>(-1.9318516)) / fSlow66) + <f32>(1.0));
        const fSlow77: f32 = (<f32>(2.0) * (<f32>(1.0) - (<f32>(1.0) / fSlow67)));
        const fSlow78: f32 = (<f32>(1.0) / fSlow71);
        const fSlow79: f32 = (((fSlow68 + <f32>(-1.4142135)) / fSlow66) + <f32>(1.0));
        const fSlow80: f32 = (<f32>(1.0) / fSlow69);
        const fSlow81: f32 = (((fSlow68 + <f32>(-0.5176381)) / fSlow66) + <f32>(1.0));
        const fSlow82: f32 = this.fVslider29;
        const fSlow83: f32 = (fSlow39 + fSlow82);
        const fSlow84: f32 = this.fVslider30;
        const fSlow85: f32 = (<f32>(0.5) * fSlow84);
        const fSlow86: f32 = (fSlow83 - fSlow85);
        const fSlow87: f32 = (fSlow83 + fSlow85);
        const fSlow88: f32 = (<f32>(0.5) / max<f32>(<f32>(1.1920929e-07), fSlow84));
        const fSlow89: f32 = max<f32>(<f32>(1.1920929e-07), (<f32>(0.001) * this.fVslider31));
        const fSlow90: f32 = Mathf.pow((max<f32>(<f32>(1.1920929e-07), (<f32>(0.001) * this.fVslider32)) / fSlow89), <f32>(0.14285715));
        const fSlow91: f32 = (fSlow89 * Mathf.pow(fSlow90, <f32>(7.0)));
        const iSlow92: i32 = Mathf.abs(fSlow91) < <f32>(1.1920929e-07);
        const fSlow93: f32 = ((iSlow92) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow92) ? <f32>(1.0) : fSlow91)))));
        const fSlow94: f32 = max<f32>(<f32>(1.1920929e-07), (<f32>(0.001) * this.fVslider33));
        const fSlow95: f32 = Mathf.pow((max<f32>(<f32>(1.1920929e-07), (<f32>(0.001) * this.fVslider34)) / fSlow94), <f32>(0.14285715));
        const fSlow96: f32 = (fSlow94 * Mathf.pow(fSlow95, <f32>(7.0)));
        const iSlow97: i32 = Mathf.abs(fSlow96) < <f32>(1.1920929e-07);
        const fSlow98: f32 = ((iSlow97) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow97) ? <f32>(1.0) : fSlow96)))));
        const fSlow99: f32 = this.fVslider35;
        const fSlow100: f32 = (fSlow99 - this.fVslider36);
        const fSlow101: f32 = (<f32>(0.01) * (fSlow99 - fSlow100));
        const fSlow102: f32 = Mathf.tan((this.fConst73 * (fSlow64 * Mathf.pow(fSlow65, <f32>(5.0)))));
        const fSlow103: f32 = Mathf.tan((this.fConst73 * (fSlow64 * Mathf.pow(fSlow65, <f32>(4.0)))));
        const fSlow104: f32 = Mathf.tan((this.fConst73 * (fSlow64 * Mathf.pow(fSlow65, <f32>(3.0)))));
        const fSlow105: f32 = Mathf.tan((this.fConst73 * (fSlow64 * Mathf.pow(fSlow65, <f32>(2.0)))));
        const fSlow106: f32 = Mathf.tan((this.fConst73 * (fSlow64 * fSlow65)));
        const fSlow107: f32 = Mathf.tan((this.fConst73 * fSlow64));
        const fSlow108: f32 = (<f32>(0.01) * fSlow61);
        const fSlow109: f32 = (<f32>(1.0) / fSlow107);
        const fSlow110: f32 = (((fSlow109 + <f32>(0.5176381)) / fSlow107) + <f32>(1.0));
        const fSlow111: f32 = (<f32>(1.0) / fSlow110);
        const fSlow112: f32 = (((fSlow109 + <f32>(1.4142135)) / fSlow107) + <f32>(1.0));
        const fSlow113: f32 = (<f32>(1.0) / fSlow112);
        const fSlow114: f32 = (((fSlow109 + <f32>(1.9318516)) / fSlow107) + <f32>(1.0));
        const fSlow115: f32 = (<f32>(1.0) / fSlow114);
        const fSlow116: f32 = (<f32>(1.0) / fSlow106);
        const fSlow117: f32 = (((fSlow116 + <f32>(0.5176381)) / fSlow106) + <f32>(1.0));
        const fSlow118: f32 = (<f32>(1.0) / fSlow117);
        const fSlow119: f32 = (((fSlow116 + <f32>(1.4142135)) / fSlow106) + <f32>(1.0));
        const fSlow120: f32 = (<f32>(1.0) / fSlow119);
        const fSlow121: f32 = (((fSlow116 + <f32>(1.9318516)) / fSlow106) + <f32>(1.0));
        const fSlow122: f32 = (<f32>(1.0) / fSlow121);
        const fSlow123: f32 = (<f32>(1.0) / fSlow105);
        const fSlow124: f32 = (((fSlow123 + <f32>(0.5176381)) / fSlow105) + <f32>(1.0));
        const fSlow125: f32 = (<f32>(1.0) / fSlow124);
        const fSlow126: f32 = (((fSlow123 + <f32>(1.4142135)) / fSlow105) + <f32>(1.0));
        const fSlow127: f32 = (<f32>(1.0) / fSlow126);
        const fSlow128: f32 = (((fSlow123 + <f32>(1.9318516)) / fSlow105) + <f32>(1.0));
        const fSlow129: f32 = (<f32>(1.0) / fSlow128);
        const fSlow130: f32 = (<f32>(1.0) / fSlow104);
        const fSlow131: f32 = (((fSlow130 + <f32>(0.5176381)) / fSlow104) + <f32>(1.0));
        const fSlow132: f32 = (<f32>(1.0) / fSlow131);
        const fSlow133: f32 = (((fSlow130 + <f32>(1.4142135)) / fSlow104) + <f32>(1.0));
        const fSlow134: f32 = (<f32>(1.0) / fSlow133);
        const fSlow135: f32 = (((fSlow130 + <f32>(1.9318516)) / fSlow104) + <f32>(1.0));
        const fSlow136: f32 = (<f32>(1.0) / fSlow135);
        const fSlow137: f32 = (<f32>(1.0) / fSlow103);
        const fSlow138: f32 = (((fSlow137 + <f32>(0.5176381)) / fSlow103) + <f32>(1.0));
        const fSlow139: f32 = (<f32>(1.0) / fSlow138);
        const fSlow140: f32 = (((fSlow137 + <f32>(1.4142135)) / fSlow103) + <f32>(1.0));
        const fSlow141: f32 = (<f32>(1.0) / fSlow140);
        const fSlow142: f32 = (((fSlow137 + <f32>(1.9318516)) / fSlow103) + <f32>(1.0));
        const fSlow143: f32 = (<f32>(1.0) / fSlow142);
        const fSlow144: f32 = (<f32>(1.0) / fSlow102);
        const fSlow145: f32 = (((fSlow144 + <f32>(0.5176381)) / fSlow102) + <f32>(1.0));
        const fSlow146: f32 = (<f32>(1.0) / fSlow145);
        const fSlow147: f32 = (((fSlow144 + <f32>(1.4142135)) / fSlow102) + <f32>(1.0));
        const fSlow148: f32 = (<f32>(1.0) / fSlow147);
        const fSlow149: f32 = (((fSlow144 + <f32>(1.9318516)) / fSlow102) + <f32>(1.0));
        const fSlow150: f32 = (<f32>(1.0) / fSlow149);
        const fSlow151: f32 = (((fSlow144 + <f32>(-1.9318516)) / fSlow102) + <f32>(1.0));
        const fSlow152: f32 = Mathf.pow(fSlow102, <f32>(2.0));
        const fSlow153: f32 = (<f32>(2.0) * (<f32>(1.0) - (<f32>(1.0) / fSlow152)));
        const fSlow154: f32 = (((fSlow144 + <f32>(-1.4142135)) / fSlow102) + <f32>(1.0));
        const fSlow155: f32 = (((fSlow144 + <f32>(-0.5176381)) / fSlow102) + <f32>(1.0));
        const fSlow156: f32 = (((fSlow137 + <f32>(-1.9318516)) / fSlow103) + <f32>(1.0));
        const fSlow157: f32 = Mathf.pow(fSlow103, <f32>(2.0));
        const fSlow158: f32 = (<f32>(2.0) * (<f32>(1.0) - (<f32>(1.0) / fSlow157)));
        const fSlow159: f32 = (((fSlow137 + <f32>(-1.4142135)) / fSlow103) + <f32>(1.0));
        const fSlow160: f32 = (((fSlow137 + <f32>(-0.5176381)) / fSlow103) + <f32>(1.0));
        const fSlow161: f32 = (((fSlow130 + <f32>(-1.9318516)) / fSlow104) + <f32>(1.0));
        const fSlow162: f32 = Mathf.pow(fSlow104, <f32>(2.0));
        const fSlow163: f32 = (<f32>(2.0) * (<f32>(1.0) - (<f32>(1.0) / fSlow162)));
        const fSlow164: f32 = (((fSlow130 + <f32>(-1.4142135)) / fSlow104) + <f32>(1.0));
        const fSlow165: f32 = (((fSlow130 + <f32>(-0.5176381)) / fSlow104) + <f32>(1.0));
        const fSlow166: f32 = (((fSlow123 + <f32>(-1.9318516)) / fSlow105) + <f32>(1.0));
        const fSlow167: f32 = Mathf.pow(fSlow105, <f32>(2.0));
        const fSlow168: f32 = (<f32>(2.0) * (<f32>(1.0) - (<f32>(1.0) / fSlow167)));
        const fSlow169: f32 = (((fSlow123 + <f32>(-1.4142135)) / fSlow105) + <f32>(1.0));
        const fSlow170: f32 = (((fSlow123 + <f32>(-0.5176381)) / fSlow105) + <f32>(1.0));
        const fSlow171: f32 = (((fSlow116 + <f32>(-1.9318516)) / fSlow106) + <f32>(1.0));
        const fSlow172: f32 = Mathf.pow(fSlow106, <f32>(2.0));
        const fSlow173: f32 = (<f32>(2.0) * (<f32>(1.0) - (<f32>(1.0) / fSlow172)));
        const fSlow174: f32 = (((fSlow116 + <f32>(-1.4142135)) / fSlow106) + <f32>(1.0));
        const fSlow175: f32 = (((fSlow116 + <f32>(-0.5176381)) / fSlow106) + <f32>(1.0));
        const fSlow176: f32 = (((fSlow109 + <f32>(-1.9318516)) / fSlow107) + <f32>(1.0));
        const fSlow177: f32 = Mathf.pow(fSlow107, <f32>(2.0));
        const fSlow178: f32 = (<f32>(2.0) * (<f32>(1.0) - (<f32>(1.0) / fSlow177)));
        const fSlow179: f32 = (((fSlow109 + <f32>(-1.4142135)) / fSlow107) + <f32>(1.0));
        const fSlow180: f32 = (((fSlow109 + <f32>(-0.5176381)) / fSlow107) + <f32>(1.0));
        const fSlow181: f32 = this.fVslider37;
        const fSlow182: f32 = (fSlow39 + fSlow181);
        const fSlow183: f32 = this.fVslider38;
        const fSlow184: f32 = (<f32>(0.5) * fSlow183);
        const fSlow185: f32 = (fSlow182 - fSlow184);
        const fSlow186: f32 = (fSlow182 + fSlow184);
        const fSlow187: f32 = (<f32>(0.5) / max<f32>(<f32>(1.1920929e-07), fSlow183));
        const iSlow188: i32 = Mathf.abs(fSlow89) < <f32>(1.1920929e-07);
        const fSlow189: f32 = ((iSlow188) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow188) ? <f32>(1.0) : fSlow89)))));
        const iSlow190: i32 = Mathf.abs(fSlow94) < <f32>(1.1920929e-07);
        const fSlow191: f32 = ((iSlow190) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow190) ? <f32>(1.0) : fSlow94)))));
        const fSlow192: f32 = (<f32>(0.01) * fSlow99);
        const fSlow193: f32 = (fSlow108 - (<f32>(0.0014285714) * fSlow62));
        const fSlow194: f32 = (<f32>(1.0) / (fSlow177 * fSlow110));
        const fSlow195: f32 = (<f32>(1.0) / (fSlow177 * fSlow112));
        const fSlow196: f32 = (<f32>(1.0) / (fSlow177 * fSlow114));
        const fSlow197: f32 = (fSlow82 - fSlow181);
        const fSlow198: f32 = (fSlow182 + (<f32>(0.14285715) * fSlow197));
        const fSlow199: f32 = (fSlow84 - fSlow183);
        const fSlow200: f32 = (fSlow183 + (<f32>(0.14285715) * fSlow199));
        const fSlow201: f32 = (<f32>(0.5) * fSlow200);
        const fSlow202: f32 = (fSlow198 - fSlow201);
        const fSlow203: f32 = (fSlow198 + fSlow201);
        const fSlow204: f32 = (<f32>(0.5) / max<f32>(<f32>(1.1920929e-07), fSlow200));
        const fSlow205: f32 = (fSlow89 * fSlow90);
        const iSlow206: i32 = Mathf.abs(fSlow205) < <f32>(1.1920929e-07);
        const fSlow207: f32 = ((iSlow206) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow206) ? <f32>(1.0) : fSlow205)))));
        const fSlow208: f32 = (fSlow94 * fSlow95);
        const iSlow209: i32 = Mathf.abs(fSlow208) < <f32>(1.1920929e-07);
        const fSlow210: f32 = ((iSlow209) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow209) ? <f32>(1.0) : fSlow208)))));
        const fSlow211: f32 = (fSlow192 - (<f32>(0.0014285714) * fSlow100));
        const fSlow212: f32 = (fSlow108 - (<f32>(0.0028571428) * fSlow62));
        const fSlow213: f32 = (<f32>(1.0) / (fSlow172 * fSlow117));
        const fSlow214: f32 = (<f32>(1.0) / (fSlow172 * fSlow119));
        const fSlow215: f32 = (<f32>(1.0) / (fSlow172 * fSlow121));
        const fSlow216: f32 = (fSlow182 + (<f32>(0.2857143) * fSlow197));
        const fSlow217: f32 = (fSlow183 + (<f32>(0.2857143) * fSlow199));
        const fSlow218: f32 = (<f32>(0.5) * fSlow217);
        const fSlow219: f32 = (fSlow216 - fSlow218);
        const fSlow220: f32 = (fSlow216 + fSlow218);
        const fSlow221: f32 = (<f32>(0.5) / max<f32>(<f32>(1.1920929e-07), fSlow217));
        const fSlow222: f32 = (fSlow89 * Mathf.pow(fSlow90, <f32>(2.0)));
        const iSlow223: i32 = Mathf.abs(fSlow222) < <f32>(1.1920929e-07);
        const fSlow224: f32 = ((iSlow223) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow223) ? <f32>(1.0) : fSlow222)))));
        const fSlow225: f32 = (fSlow94 * Mathf.pow(fSlow95, <f32>(2.0)));
        const iSlow226: i32 = Mathf.abs(fSlow225) < <f32>(1.1920929e-07);
        const fSlow227: f32 = ((iSlow226) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow226) ? <f32>(1.0) : fSlow225)))));
        const fSlow228: f32 = (fSlow192 - (<f32>(0.0028571428) * fSlow100));
        const fSlow229: f32 = (fSlow108 - (<f32>(0.004285714) * fSlow62));
        const fSlow230: f32 = (<f32>(1.0) / (fSlow167 * fSlow124));
        const fSlow231: f32 = (<f32>(1.0) / (fSlow167 * fSlow126));
        const fSlow232: f32 = (<f32>(1.0) / (fSlow167 * fSlow128));
        const fSlow233: f32 = (fSlow182 + (<f32>(0.42857143) * fSlow197));
        const fSlow234: f32 = (fSlow183 + (<f32>(0.42857143) * fSlow199));
        const fSlow235: f32 = (<f32>(0.5) * fSlow234);
        const fSlow236: f32 = (fSlow233 - fSlow235);
        const fSlow237: f32 = (fSlow233 + fSlow235);
        const fSlow238: f32 = (<f32>(0.5) / max<f32>(<f32>(1.1920929e-07), fSlow234));
        const fSlow239: f32 = (fSlow89 * Mathf.pow(fSlow90, <f32>(3.0)));
        const iSlow240: i32 = Mathf.abs(fSlow239) < <f32>(1.1920929e-07);
        const fSlow241: f32 = ((iSlow240) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow240) ? <f32>(1.0) : fSlow239)))));
        const fSlow242: f32 = (fSlow94 * Mathf.pow(fSlow95, <f32>(3.0)));
        const iSlow243: i32 = Mathf.abs(fSlow242) < <f32>(1.1920929e-07);
        const fSlow244: f32 = ((iSlow243) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow243) ? <f32>(1.0) : fSlow242)))));
        const fSlow245: f32 = (fSlow192 - (<f32>(0.004285714) * fSlow100));
        const fSlow246: f32 = (fSlow108 - (<f32>(0.0057142857) * fSlow62));
        const fSlow247: f32 = (<f32>(1.0) / (fSlow162 * fSlow131));
        const fSlow248: f32 = (<f32>(1.0) / (fSlow162 * fSlow133));
        const fSlow249: f32 = (<f32>(1.0) / (fSlow162 * fSlow135));
        const fSlow250: f32 = (fSlow182 + (<f32>(0.5714286) * fSlow197));
        const fSlow251: f32 = (fSlow183 + (<f32>(0.5714286) * fSlow199));
        const fSlow252: f32 = (<f32>(0.5) * fSlow251);
        const fSlow253: f32 = (fSlow250 - fSlow252);
        const fSlow254: f32 = (fSlow250 + fSlow252);
        const fSlow255: f32 = (<f32>(0.5) / max<f32>(<f32>(1.1920929e-07), fSlow251));
        const fSlow256: f32 = (fSlow89 * Mathf.pow(fSlow90, <f32>(4.0)));
        const iSlow257: i32 = Mathf.abs(fSlow256) < <f32>(1.1920929e-07);
        const fSlow258: f32 = ((iSlow257) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow257) ? <f32>(1.0) : fSlow256)))));
        const fSlow259: f32 = (fSlow94 * Mathf.pow(fSlow95, <f32>(4.0)));
        const iSlow260: i32 = Mathf.abs(fSlow259) < <f32>(1.1920929e-07);
        const fSlow261: f32 = ((iSlow260) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow260) ? <f32>(1.0) : fSlow259)))));
        const fSlow262: f32 = (fSlow192 - (<f32>(0.0057142857) * fSlow100));
        const fSlow263: f32 = (fSlow108 - (<f32>(0.007142857) * fSlow62));
        const fSlow264: f32 = (<f32>(1.0) / (fSlow157 * fSlow138));
        const fSlow265: f32 = (<f32>(1.0) / (fSlow157 * fSlow140));
        const fSlow266: f32 = (<f32>(1.0) / (fSlow157 * fSlow142));
        const fSlow267: f32 = (fSlow182 + (<f32>(0.71428573) * fSlow197));
        const fSlow268: f32 = (fSlow183 + (<f32>(0.71428573) * fSlow199));
        const fSlow269: f32 = (<f32>(0.5) * fSlow268);
        const fSlow270: f32 = (fSlow267 - fSlow269);
        const fSlow271: f32 = (fSlow267 + fSlow269);
        const fSlow272: f32 = (<f32>(0.5) / max<f32>(<f32>(1.1920929e-07), fSlow268));
        const fSlow273: f32 = (fSlow89 * Mathf.pow(fSlow90, <f32>(5.0)));
        const iSlow274: i32 = Mathf.abs(fSlow273) < <f32>(1.1920929e-07);
        const fSlow275: f32 = ((iSlow274) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow274) ? <f32>(1.0) : fSlow273)))));
        const fSlow276: f32 = (fSlow94 * Mathf.pow(fSlow95, <f32>(5.0)));
        const iSlow277: i32 = Mathf.abs(fSlow276) < <f32>(1.1920929e-07);
        const fSlow278: f32 = ((iSlow277) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow277) ? <f32>(1.0) : fSlow276)))));
        const fSlow279: f32 = (fSlow192 - (<f32>(0.007142857) * fSlow100));
        const fSlow280: f32 = (fSlow108 - (<f32>(0.008571428) * fSlow62));
        const fSlow281: f32 = (<f32>(1.0) / (fSlow152 * fSlow145));
        const fSlow282: f32 = (<f32>(1.0) / (fSlow152 * fSlow147));
        const fSlow283: f32 = (<f32>(1.0) / (fSlow152 * fSlow149));
        const fSlow284: f32 = (fSlow182 + (<f32>(0.85714287) * fSlow197));
        const fSlow285: f32 = (fSlow183 + (<f32>(0.85714287) * fSlow199));
        const fSlow286: f32 = (<f32>(0.5) * fSlow285);
        const fSlow287: f32 = (fSlow284 - fSlow286);
        const fSlow288: f32 = (fSlow284 + fSlow286);
        const fSlow289: f32 = (<f32>(0.5) / max<f32>(<f32>(1.1920929e-07), fSlow285));
        const fSlow290: f32 = (fSlow89 * Mathf.pow(fSlow90, <f32>(6.0)));
        const iSlow291: i32 = Mathf.abs(fSlow290) < <f32>(1.1920929e-07);
        const fSlow292: f32 = ((iSlow291) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow291) ? <f32>(1.0) : fSlow290)))));
        const fSlow293: f32 = (fSlow94 * Mathf.pow(fSlow95, <f32>(6.0)));
        const iSlow294: i32 = Mathf.abs(fSlow293) < <f32>(1.1920929e-07);
        const fSlow295: f32 = ((iSlow294) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow294) ? <f32>(1.0) : fSlow293)))));
        const fSlow296: f32 = (fSlow192 - (<f32>(0.008571428) * fSlow100));
        const fSlow297: f32 = (<f32>(0.01) * this.fVslider40);
        const fSlow298: f32 = (<f32>(0.01) * (this.fVslider39 * (<f32>(2.0) - fSlow297)));
        const iSlow299: i32 = max<i32>(<i32>(1), <i32>((this.fConst69 * this.fVslider41)));
        const fSlow300: f32 = (<f32>(1.0) / <f32>(iSlow299));
        const iSlow301: i32 = max<i32>(<i32>(0), iSlow299);
        const fSlow302: f32 = (<f32>(0.001) * this.fVslider42);
        const iSlow303: i32 = Mathf.abs(fSlow302) < <f32>(1.1920929e-07);
        const fSlow304: f32 = ((iSlow303) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow303) ? <f32>(1.0) : fSlow302)))));
        const fSlow305: f32 = (fSlow39 + this.fVslider43);
        const fSlow306: f32 = this.fVslider44;
        const fSlow307: f32 = (<f32>(0.5) * fSlow306);
        const fSlow308: f32 = (fSlow305 - fSlow307);
        const fSlow309: f32 = (fSlow305 + fSlow307);
        const fSlow310: f32 = (<f32>(0.5) / max<f32>(<f32>(1.1920929e-07), fSlow306));
        const fSlow311: f32 = (this.fConst2 * Mathf.pow(<f32>(1e+01), (<f32>(0.05) * this.fVslider45)));
        const fSlow312: f32 = (this.fConst2 * this.fCheckbox11);
        const fSlow313: f32 = (this.fConst2 * this.fCheckbox12);
        const fSlow314: f32 = (<f32>(0.001) * this.fVslider46);
        const iSlow315: i32 = Mathf.abs(fSlow314) < <f32>(1.1920929e-07);
        const fSlow316: f32 = ((iSlow315) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iSlow315) ? <f32>(1.0) : fSlow314)))));
        const fSlow317: f32 = this.fVslider47;

        const fTemp0: f32 = _inL;
        this.fRec1[<i32>(0)] = (fSlow0 + (this.fConst3 * this.fRec1[<i32>(1)]));
        this.fRec8[<i32>(0)] = (fSlow1 + (this.fConst3 * this.fRec8[<i32>(1)]));
        this.fRec9[<i32>(0)] = (fSlow2 + (this.fConst3 * this.fRec9[<i32>(1)]));
        this.fRec13[<i32>(0)] = (fSlow4 + (this.fConst3 * this.fRec13[<i32>(1)]));
        this.fRec16[<i32>(0)] = (fSlow11 + (this.fConst3 * this.fRec16[<i32>(1)]));
        this.fRec17[<i32>(0)] = (fSlow12 + (this.fConst3 * this.fRec17[<i32>(1)]));
        this.fRec19[<i32>(0)] = (fSlow15 + (this.fConst3 * this.fRec19[<i32>(1)]));
        const fTemp1: f32 = (fTemp0 * this.fRec19[<i32>(0)]);
        this.fRec18[<i32>(0)] = max<f32>((this.fRec18[<i32>(1)] - this.fConst1), min<f32>(<f32>(1e+01), (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), max<f32>(<f32>(0.00031622776), Mathf.abs(fTemp1)))))));
        this.fVbargraph0 = this.fRec18[<i32>(0)];
        const fTemp2: f32 = fTemp1;
        this.fVec0[<i32>(0)] = fTemp2;
        this.fRec20[<i32>(0)] = (fSlow16 + (this.fConst3 * this.fRec20[<i32>(1)]));
        this.fRec21[<i32>(0)] = (this.fConst7 * ((fTemp2 - this.fVec0[<i32>(1)]) + (this.fConst8 * this.fRec21[<i32>(1)])));
        const fTemp3: f32 = (<f32>(1.0) - this.fRec20[<i32>(0)]);
        const fTemp4: f32 = ((fTemp2 * this.fRec20[<i32>(0)]) + (this.fRec21[<i32>(0)] * fTemp3));
        this.fVec1[<i32>(0)] = ((this.fConst21 * this.fRec25[<i32>(1)]) - (this.fConst23 * this.fVec0[<i32>(1)]));
        this.fRec26[<i32>(0)] = (this.fConst19 * (((this.fConst20 * this.fVec0[<i32>(1)]) - (this.fVec1[<i32>(1)] + (this.fConst24 * this.fRec26[<i32>(1)]))) + (this.fConst25 * fTemp2)));
        this.fRec25[<i32>(0)] = this.fRec26[<i32>(0)];
        this.fVec2[<i32>(0)] = ((<f32>(0.50032705) * this.fRec25[<i32>(1)]) - (this.fConst26 * this.fRec23[<i32>(1)]));
        this.fRec24[<i32>(0)] = (this.fConst15 * (((this.fVec2[<i32>(1)] - (this.fConst27 * this.fRec24[<i32>(1)])) - (<f32>(1.0006541) * this.fRec25[<i32>(1)])) + (<f32>(0.50032705) * this.fRec25[<i32>(0)])));
        this.fRec23[<i32>(0)] = this.fRec24[<i32>(0)];
        const fTemp5: f32 = Mathf.pow(this.fRec23[<i32>(0)], <f32>(2.0));
        this.fVec3[<i32>(0)] = fTemp5;
        const fTemp6: f32 = (fTemp5 + this.fVec3[<i32>(1)]);
        this.fVec4[<i32>(0)] = fTemp6;
        const fTemp7: f32 = (fTemp6 + this.fVec4[<i32>(2)]);
        this.fVec5[<i32>(0)] = fTemp7;
        const fTemp8: f32 = (fTemp7 + this.fVec5[<i32>(4)]);
        this.fVec6[<i32>(0)] = fTemp8;
        const fTemp9: f32 = (fTemp8 + this.fVec6[<i32>(8)]);
        this.fVec7[(this.IOTA0 & <i32>(31))] = fTemp9;
        const fTemp10: f32 = (fTemp9 + this.fVec7[((this.IOTA0 - <i32>(16)) & <i32>(31))]);
        this.fVec8[(this.IOTA0 & <i32>(63))] = fTemp10;
        const fTemp11: f32 = (fTemp10 + this.fVec8[((this.IOTA0 - <i32>(32)) & <i32>(63))]);
        this.fVec9[(this.IOTA0 & <i32>(127))] = fTemp11;
        const fTemp12: f32 = (fTemp11 + this.fVec9[((this.IOTA0 - <i32>(64)) & <i32>(127))]);
        this.fVec10[(this.IOTA0 & <i32>(255))] = fTemp12;
        const fTemp13: f32 = (fTemp12 + this.fVec10[((this.IOTA0 - <i32>(128)) & <i32>(255))]);
        this.fVec11[(this.IOTA0 & <i32>(511))] = fTemp13;
        const fTemp14: f32 = (fTemp13 + this.fVec11[((this.IOTA0 - <i32>(256)) & <i32>(511))]);
        this.fVec12[(this.IOTA0 & <i32>(1023))] = fTemp14;
        const fTemp15: f32 = (fTemp14 + this.fVec12[((this.IOTA0 - <i32>(512)) & <i32>(1023))]);
        this.fVec13[(this.IOTA0 & <i32>(2047))] = fTemp15;
        const fTemp16: f32 = (fTemp15 + this.fVec13[((this.IOTA0 - <i32>(1024)) & <i32>(2047))]);
        this.fVec14[(this.IOTA0 & <i32>(4095))] = fTemp16;
        const fTemp17: f32 = (fTemp16 + this.fVec14[((this.IOTA0 - <i32>(2048)) & <i32>(4095))]);
        this.fVec15[(this.IOTA0 & <i32>(8191))] = fTemp17;
        const fTemp18: f32 = (fTemp17 + this.fVec15[((this.IOTA0 - <i32>(4096)) & <i32>(8191))]);
        this.fVec16[(this.IOTA0 & <i32>(16383))] = fTemp18;
        const fTemp19: f32 = (fTemp18 + this.fVec16[((this.IOTA0 - <i32>(8192)) & <i32>(16383))]);
        this.fVec17[(this.IOTA0 & <i32>(32767))] = fTemp19;
        const fTemp20: f32 = (fTemp19 + this.fVec17[((this.IOTA0 - <i32>(16384)) & <i32>(32767))]);
        this.fVec18[(this.IOTA0 & <i32>(65535))] = fTemp20;
        const fTemp21: f32 = (fTemp20 + this.fVec18[((this.IOTA0 - <i32>(32768)) & <i32>(65535))]);
        this.fVec19[(this.IOTA0 & <i32>(131071))] = fTemp21;
        const fTemp22: f32 = (fTemp21 + this.fVec19[((this.IOTA0 - <i32>(65536)) & <i32>(131071))]);
        this.fVec20[(this.IOTA0 & <i32>(262143))] = fTemp22;
        const fTemp23: f32 = (fTemp22 + this.fVec20[((this.IOTA0 - <i32>(131072)) & <i32>(262143))]);
        this.fVec21[(this.IOTA0 & <i32>(524287))] = fTemp23;
        this.fVec22[(this.IOTA0 & <i32>(1048575))] = (fTemp23 + this.fVec21[((this.IOTA0 - <i32>(262144)) & <i32>(524287))]);
        const fTemp24: f32 = _inR;
        const fTemp25: f32 = (fTemp24 * this.fRec19[<i32>(0)]);
        this.fRec31[<i32>(0)] = max<f32>((this.fRec31[<i32>(1)] - this.fConst1), min<f32>(<f32>(1e+01), (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), max<f32>(<f32>(0.00031622776), Mathf.abs(fTemp25)))))));
        this.fVbargraph1 = this.fRec31[<i32>(0)];
        const fTemp26: f32 = fTemp25;
        this.fVec23[<i32>(0)] = fTemp26;
        this.fVec24[<i32>(0)] = ((this.fConst21 * this.fRec29[<i32>(1)]) - (this.fConst23 * this.fVec23[<i32>(1)]));
        this.fRec30[<i32>(0)] = (this.fConst19 * (((this.fConst20 * this.fVec23[<i32>(1)]) - (this.fVec24[<i32>(1)] + (this.fConst24 * this.fRec30[<i32>(1)]))) + (this.fConst25 * fTemp26)));
        this.fRec29[<i32>(0)] = this.fRec30[<i32>(0)];
        this.fVec25[<i32>(0)] = ((<f32>(0.50032705) * this.fRec29[<i32>(1)]) - (this.fConst26 * this.fRec27[<i32>(1)]));
        this.fRec28[<i32>(0)] = (this.fConst15 * (((this.fVec25[<i32>(1)] - (this.fConst27 * this.fRec28[<i32>(1)])) - (<f32>(1.0006541) * this.fRec29[<i32>(1)])) + (<f32>(0.50032705) * this.fRec29[<i32>(0)])));
        this.fRec27[<i32>(0)] = this.fRec28[<i32>(0)];
        const fTemp27: f32 = Mathf.pow(this.fRec27[<i32>(0)], <f32>(2.0));
        this.fVec26[<i32>(0)] = fTemp27;
        const fTemp28: f32 = (fTemp27 + this.fVec26[<i32>(1)]);
        this.fVec27[<i32>(0)] = fTemp28;
        const fTemp29: f32 = (fTemp28 + this.fVec27[<i32>(2)]);
        this.fVec28[<i32>(0)] = fTemp29;
        const fTemp30: f32 = (fTemp29 + this.fVec28[<i32>(4)]);
        this.fVec29[<i32>(0)] = fTemp30;
        const fTemp31: f32 = (fTemp30 + this.fVec29[<i32>(8)]);
        this.fVec30[(this.IOTA0 & <i32>(31))] = fTemp31;
        const fTemp32: f32 = (fTemp31 + this.fVec30[((this.IOTA0 - <i32>(16)) & <i32>(31))]);
        this.fVec31[(this.IOTA0 & <i32>(63))] = fTemp32;
        const fTemp33: f32 = (fTemp32 + this.fVec31[((this.IOTA0 - <i32>(32)) & <i32>(63))]);
        this.fVec32[(this.IOTA0 & <i32>(127))] = fTemp33;
        const fTemp34: f32 = (fTemp33 + this.fVec32[((this.IOTA0 - <i32>(64)) & <i32>(127))]);
        this.fVec33[(this.IOTA0 & <i32>(255))] = fTemp34;
        const fTemp35: f32 = (fTemp34 + this.fVec33[((this.IOTA0 - <i32>(128)) & <i32>(255))]);
        this.fVec34[(this.IOTA0 & <i32>(511))] = fTemp35;
        const fTemp36: f32 = (fTemp35 + this.fVec34[((this.IOTA0 - <i32>(256)) & <i32>(511))]);
        this.fVec35[(this.IOTA0 & <i32>(1023))] = fTemp36;
        const fTemp37: f32 = (fTemp36 + this.fVec35[((this.IOTA0 - <i32>(512)) & <i32>(1023))]);
        this.fVec36[(this.IOTA0 & <i32>(2047))] = fTemp37;
        const fTemp38: f32 = (fTemp37 + this.fVec36[((this.IOTA0 - <i32>(1024)) & <i32>(2047))]);
        this.fVec37[(this.IOTA0 & <i32>(4095))] = fTemp38;
        const fTemp39: f32 = (fTemp38 + this.fVec37[((this.IOTA0 - <i32>(2048)) & <i32>(4095))]);
        this.fVec38[(this.IOTA0 & <i32>(8191))] = fTemp39;
        const fTemp40: f32 = (fTemp39 + this.fVec38[((this.IOTA0 - <i32>(4096)) & <i32>(8191))]);
        this.fVec39[(this.IOTA0 & <i32>(16383))] = fTemp40;
        const fTemp41: f32 = (fTemp40 + this.fVec39[((this.IOTA0 - <i32>(8192)) & <i32>(16383))]);
        this.fVec40[(this.IOTA0 & <i32>(32767))] = fTemp41;
        const fTemp42: f32 = (fTemp41 + this.fVec40[((this.IOTA0 - <i32>(16384)) & <i32>(32767))]);
        this.fVec41[(this.IOTA0 & <i32>(65535))] = fTemp42;
        const fTemp43: f32 = (fTemp42 + this.fVec41[((this.IOTA0 - <i32>(32768)) & <i32>(65535))]);
        this.fVec42[(this.IOTA0 & <i32>(131071))] = fTemp43;
        const fTemp44: f32 = (fTemp43 + this.fVec42[((this.IOTA0 - <i32>(65536)) & <i32>(131071))]);
        this.fVec43[(this.IOTA0 & <i32>(262143))] = fTemp44;
        const fTemp45: f32 = (fTemp44 + this.fVec43[((this.IOTA0 - <i32>(131072)) & <i32>(262143))]);
        this.fVec44[(this.IOTA0 & <i32>(524287))] = fTemp45;
        this.fVec45[(this.IOTA0 & <i32>(1048575))] = (fTemp45 + this.fVec44[((this.IOTA0 - <i32>(262144)) & <i32>(524287))]);
        this.fVbargraph2 = ((<f32>(4.3429446) * Mathf.log(max<f32>(<f32>(1e-12), (this.fConst10 * ((((this.iConst11) ? this.fVec22[((this.IOTA0 - this.iConst64) & <i32>(1048575))] : <f32>(0.0)) + (((this.iConst63) ? this.fVec21[((this.IOTA0 - this.iConst62) & <i32>(524287))] : <f32>(0.0)) + (((this.iConst61) ? this.fVec20[((this.IOTA0 - this.iConst60) & <i32>(262143))] : <f32>(0.0)) + (((this.iConst59) ? this.fVec19[((this.IOTA0 - this.iConst58) & <i32>(131071))] : <f32>(0.0)) + (((this.iConst57) ? this.fVec18[((this.IOTA0 - this.iConst56) & <i32>(65535))] : <f32>(0.0)) + (((this.iConst55) ? this.fVec17[((this.IOTA0 - this.iConst54) & <i32>(32767))] : <f32>(0.0)) + (((this.iConst53) ? this.fVec16[((this.IOTA0 - this.iConst52) & <i32>(16383))] : <f32>(0.0)) + (((this.iConst51) ? this.fVec15[((this.IOTA0 - this.iConst50) & <i32>(8191))] : <f32>(0.0)) + (((this.iConst49) ? this.fVec14[((this.IOTA0 - this.iConst48) & <i32>(4095))] : <f32>(0.0)) + (((this.iConst47) ? this.fVec13[((this.IOTA0 - this.iConst46) & <i32>(2047))] : <f32>(0.0)) + (((this.iConst45) ? this.fVec12[((this.IOTA0 - this.iConst44) & <i32>(1023))] : <f32>(0.0)) + (((this.iConst43) ? this.fVec11[((this.IOTA0 - this.iConst42) & <i32>(511))] : <f32>(0.0)) + (((this.iConst41) ? this.fVec10[((this.IOTA0 - this.iConst40) & <i32>(255))] : <f32>(0.0)) + (((this.iConst39) ? this.fVec9[((this.IOTA0 - this.iConst38) & <i32>(127))] : <f32>(0.0)) + (((this.iConst37) ? this.fVec8[((this.IOTA0 - this.iConst36) & <i32>(63))] : <f32>(0.0)) + (((this.iConst35) ? this.fVec7[((this.IOTA0 - this.iConst34) & <i32>(31))] : <f32>(0.0)) + (((this.iConst33) ? this.fVec6[this.iConst32] : <f32>(0.0)) + (((this.iConst31) ? this.fVec5[this.iConst30] : <f32>(0.0)) + (((this.iConst28) ? fTemp5 : <f32>(0.0)) + ((this.iConst29) ? this.fVec4[this.iConst28] : <f32>(0.0))))))))))))))))))))) + (((this.iConst11) ? this.fVec45[((this.IOTA0 - this.iConst64) & <i32>(1048575))] : <f32>(0.0)) + (((this.iConst63) ? this.fVec44[((this.IOTA0 - this.iConst62) & <i32>(524287))] : <f32>(0.0)) + (((this.iConst61) ? this.fVec43[((this.IOTA0 - this.iConst60) & <i32>(262143))] : <f32>(0.0)) + (((this.iConst59) ? this.fVec42[((this.IOTA0 - this.iConst58) & <i32>(131071))] : <f32>(0.0)) + (((this.iConst57) ? this.fVec41[((this.IOTA0 - this.iConst56) & <i32>(65535))] : <f32>(0.0)) + (((this.iConst55) ? this.fVec40[((this.IOTA0 - this.iConst54) & <i32>(32767))] : <f32>(0.0)) + (((this.iConst53) ? this.fVec39[((this.IOTA0 - this.iConst52) & <i32>(16383))] : <f32>(0.0)) + (((this.iConst51) ? this.fVec38[((this.IOTA0 - this.iConst50) & <i32>(8191))] : <f32>(0.0)) + (((this.iConst49) ? this.fVec37[((this.IOTA0 - this.iConst48) & <i32>(4095))] : <f32>(0.0)) + (((this.iConst47) ? this.fVec36[((this.IOTA0 - this.iConst46) & <i32>(2047))] : <f32>(0.0)) + (((this.iConst45) ? this.fVec35[((this.IOTA0 - this.iConst44) & <i32>(1023))] : <f32>(0.0)) + (((this.iConst43) ? this.fVec34[((this.IOTA0 - this.iConst42) & <i32>(511))] : <f32>(0.0)) + (((this.iConst41) ? this.fVec33[((this.IOTA0 - this.iConst40) & <i32>(255))] : <f32>(0.0)) + (((this.iConst39) ? this.fVec32[((this.IOTA0 - this.iConst38) & <i32>(127))] : <f32>(0.0)) + (((this.iConst37) ? this.fVec31[((this.IOTA0 - this.iConst36) & <i32>(63))] : <f32>(0.0)) + (((this.iConst35) ? this.fVec30[((this.IOTA0 - this.iConst34) & <i32>(31))] : <f32>(0.0)) + (((this.iConst33) ? this.fVec29[this.iConst32] : <f32>(0.0)) + (((this.iConst31) ? this.fVec28[this.iConst30] : <f32>(0.0)) + (((this.iConst28) ? fTemp27 : <f32>(0.0)) + ((this.iConst29) ? this.fVec27[this.iConst28] : <f32>(0.0)))))))))))))))))))))))))) + <f32>(-0.691));
        const fTemp46: f32 = fTemp26;
        this.fVec46[<i32>(0)] = fTemp46;
        this.fRec22[<i32>(0)] = (this.fConst7 * ((fTemp46 - this.fVec46[<i32>(1)]) + (this.fConst8 * this.fRec22[<i32>(1)])));
        const fTemp47: f32 = ((this.fRec22[<i32>(0)] * fTemp3) + (this.fRec20[<i32>(0)] * fTemp46));
        const fTemp48: f32 = (<f32>(0.5) * ((<f32>(1.0) - this.fRec17[<i32>(0)]) * ((fSlow14 * fTemp4) + (fSlow18 * fTemp47))));
        const fTemp49: f32 = (fTemp48 + (fSlow18 * (this.fRec17[<i32>(0)] * fTemp47)));
        const fTemp50: f32 = (<f32>(1.0) - this.fRec16[<i32>(0)]);
        const fTemp51: f32 = ((fSlow14 * (this.fRec17[<i32>(0)] * fTemp4)) + fTemp48);
        this.fRec35[<i32>(0)] = ((this.fConst67 * this.fRec35[<i32>(1)]) - (this.fConst68 * fTemp51));
        const fTemp52: f32 = (this.fRec35[<i32>(0)] + fTemp51);
        this.fRec36[<i32>(0)] = ((this.fConst67 * this.fRec36[<i32>(1)]) - (this.fConst68 * fTemp49));
        const fTemp53: f32 = (this.fRec36[<i32>(0)] + fTemp49);
        this.fRec34[<i32>(0)] = ((this.fConst67 * this.fRec34[<i32>(1)]) + (this.fConst68 * (fTemp52 * fTemp53)));
        this.fRec37[<i32>(0)] = ((this.fConst67 * this.fRec37[<i32>(1)]) + (this.fConst68 * Mathf.pow(-fTemp52, <f32>(2.0))));
        this.fRec38[<i32>(0)] = ((this.fConst67 * this.fRec38[<i32>(1)]) + (this.fConst68 * Mathf.pow(-fTemp53, <f32>(2.0))));
        const fTemp54: f32 = (this.fRec34[<i32>(0)] / max<f32>(<f32>(1.1920929e-07), (Mathf.sqrt(this.fRec37[<i32>(0)]) * Mathf.sqrt(this.fRec38[<i32>(0)]))));
        this.fRec33[<i32>(0)] = ((this.fConst67 * this.fRec33[<i32>(1)]) + (this.fConst68 * <f32>(fTemp54 > <f32>(0.9999))));
        this.fRec32[<i32>(0)] = ((this.fConst66 * this.fRec33[<i32>(0)]) + (this.fConst65 * this.fRec32[<i32>(1)]));
        const fTemp55: f32 = (fTemp51 + fTemp49);
        this.fRec40[<i32>(0)] = ((this.fConst67 * this.fRec40[<i32>(1)]) + (this.fConst68 * <f32>(fTemp54 < <f32>(-0.9999))));
        this.fRec39[<i32>(0)] = ((this.fConst66 * this.fRec40[<i32>(0)]) + (this.fConst65 * this.fRec39[<i32>(1)]));
        this.fRec42[<i32>(0)] = ((this.fConst67 * this.fRec42[<i32>(1)]) + (this.fConst68 * <f32>((<i32>(fTemp54 < <f32>(0.0001)) & <i32>(fTemp54 > <f32>(-0.0001))))));
        this.fRec41[<i32>(0)] = ((this.fConst66 * this.fRec42[<i32>(0)]) + (this.fConst65 * this.fRec41[<i32>(1)]));
        const fTemp56: f32 = ((<f32>(0.5) * ((this.fRec32[<i32>(0)] * fTemp55) + (this.fRec39[<i32>(0)] * (fTemp51 - fTemp49)))) + (this.fRec41[<i32>(0)] * fTemp55));
        this.fRec44[<i32>(0)] = ((this.fConst67 * this.fRec44[<i32>(1)]) + (this.fConst68 * <f32>((<i32>(fTemp54 > <f32>(0.0001)) & <i32>(fTemp54 < <f32>(0.9999))))));
        this.fRec43[<i32>(0)] = ((this.fConst66 * this.fRec44[<i32>(0)]) + (this.fConst65 * this.fRec43[<i32>(1)]));
        this.fRec46[<i32>(0)] = ((this.fConst67 * this.fRec46[<i32>(1)]) + (this.fConst68 * <f32>((<i32>(fTemp54 > <f32>(-0.9999)) & <i32>(fTemp54 < <f32>(-0.0001))))));
        this.fRec45[<i32>(0)] = ((this.fConst66 * this.fRec46[<i32>(0)]) + (this.fConst65 * this.fRec45[<i32>(1)]));
        const fTemp57: f32 = ((this.fRec16[<i32>(0)] * fTemp49) + (fTemp50 * ((fTemp56 + (this.fRec43[<i32>(0)] * fTemp49)) + (this.fRec45[<i32>(0)] * fTemp49))));
        const fTemp58: f32 = Mathf.abs(-fTemp57);
        const fTemp59: f32 = ((this.fRec16[<i32>(0)] * fTemp51) + (fTemp50 * ((fTemp56 + (this.fRec43[<i32>(0)] * fTemp51)) + (this.fRec45[<i32>(0)] * fTemp51))));
        this.fRec48[<i32>(0)] = ((Mathf.abs((Mathf.abs(-fTemp59) + fTemp58)) * fSlow10) + (this.fRec48[<i32>(1)] * fSlow9));
        const iTemp60: i32 = this.fRec48[<i32>(0)] > fSlow19;
        this.iVec47[<i32>(0)] = iTemp60;
        this.iRec49[<i32>(0)] = max<i32>((iSlow20 * <i32>(iTemp60 < this.iVec47[<i32>(1)])), (this.iRec49[<i32>(1)] + <i32>(-1)));
        const fTemp61: f32 = Mathf.abs(max<f32>(<f32>(iTemp60), <f32>(this.iRec49[<i32>(0)] > <i32>(0))));
        const fTemp62: f32 = ((fTemp61 > this.fRec47[<i32>(1)]) ? fSlow24 : fSlow22);
        this.fRec47[<i32>(0)] = ((fTemp61 * (<f32>(1.0) - fTemp62)) + (this.fRec47[<i32>(1)] * fTemp62));
        this.fVbargraph3 = max<f32>(<f32>(-7e+01), (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), this.fRec47[<i32>(0)]))));
        const fTemp63: f32 = -fTemp59;
        this.fRec15[<i32>(0)] = ((fSlow10 * Mathf.abs((fTemp58 + Mathf.abs(fTemp63)))) + (fSlow9 * this.fRec15[<i32>(1)]));
        const iTemp64: i32 = this.fRec15[<i32>(0)] > fSlow19;
        this.iVec48[<i32>(0)] = iTemp64;
        this.iRec50[<i32>(0)] = max<i32>((iSlow20 * <i32>(iTemp64 < this.iVec48[<i32>(1)])), (this.iRec50[<i32>(1)] + <i32>(-1)));
        const fTemp65: f32 = Mathf.abs(max<f32>(<f32>(iTemp64), <f32>(this.iRec50[<i32>(0)] > <i32>(0))));
        const fTemp66: f32 = ((fTemp65 > this.fRec14[<i32>(1)]) ? fSlow24 : fSlow22);
        this.fRec14[<i32>(0)] = ((fTemp65 * (<f32>(1.0) - fTemp66)) + (this.fRec14[<i32>(1)] * fTemp66));
        this.fRec51[<i32>(0)] = (fSlow25 + (this.fConst3 * this.fRec51[<i32>(1)]));
        const fTemp67: f32 = (this.fRec14[<i32>(0)] * (<f32>(1.0) - this.fRec51[<i32>(0)]));
        const fTemp68: f32 = ((fTemp67 * fTemp63) - (this.fRec51[<i32>(0)] * fTemp59));
        this.fVec49[<i32>(0)] = fTemp68;
        const fTemp69: f32 = (<f32>(1.0) - this.fRec13[<i32>(0)]);
        this.fRec54[<i32>(0)] = -((fSlow27 * ((fSlow28 * this.fRec54[<i32>(1)]) - (fSlow26 * (fTemp68 - this.fVec49[<i32>(1)])))));
        this.fRec53[<i32>(0)] = -((this.fConst71 * ((this.fConst72 * this.fRec53[<i32>(1)]) - (this.fConst70 * (this.fRec54[<i32>(0)] - this.fRec54[<i32>(1)])))));
        this.fRec55[<i32>(0)] = -((this.fConst71 * ((this.fConst72 * this.fRec55[<i32>(1)]) - (this.fRec54[<i32>(0)] + this.fRec54[<i32>(1)]))));
        this.fRec56[<i32>(0)] = (fSlow29 + (this.fConst3 * this.fRec56[<i32>(1)]));
        const fTemp70: f32 = (<f32>(0.05) * this.fRec56[<i32>(0)]);
        const fTemp71: f32 = Mathf.pow(<f32>(1e+01), -fTemp70);
        const fTemp72: f32 = (this.fRec53[<i32>(0)] + (this.fRec55[<i32>(0)] * fTemp71));
        this.fVec50[<i32>(0)] = fTemp72;
        this.fRec52[<i32>(0)] = -((this.fConst71 * ((this.fConst72 * this.fRec52[<i32>(1)]) - (fTemp72 + this.fVec50[<i32>(1)]))));
        this.fRec57[<i32>(0)] = -((this.fConst71 * ((this.fConst72 * this.fRec57[<i32>(1)]) - (this.fConst70 * (fTemp72 - this.fVec50[<i32>(1)])))));
        const fTemp73: f32 = Mathf.pow(<f32>(1e+01), fTemp70);
        const fTemp74: f32 = (this.fRec52[<i32>(0)] + (this.fRec57[<i32>(0)] * fTemp73));
        const fTemp75: f32 = (this.fRec51[<i32>(0)] + fTemp67);
        const fTemp76: f32 = (fTemp57 * fTemp75);
        this.fVec51[<i32>(0)] = fTemp76;
        this.fRec60[<i32>(0)] = -((fSlow27 * ((fSlow28 * this.fRec60[<i32>(1)]) + (fSlow26 * (fTemp76 - this.fVec51[<i32>(1)])))));
        this.fRec59[<i32>(0)] = -((this.fConst71 * ((this.fConst72 * this.fRec59[<i32>(1)]) - (this.fConst70 * (this.fRec60[<i32>(0)] - this.fRec60[<i32>(1)])))));
        this.fRec61[<i32>(0)] = -((this.fConst71 * ((this.fConst72 * this.fRec61[<i32>(1)]) - (this.fRec60[<i32>(0)] + this.fRec60[<i32>(1)]))));
        const fTemp77: f32 = (this.fRec59[<i32>(0)] + (this.fRec61[<i32>(0)] * fTemp71));
        this.fVec52[<i32>(0)] = fTemp77;
        this.fRec58[<i32>(0)] = -((this.fConst71 * ((this.fConst72 * this.fRec58[<i32>(1)]) - (fTemp77 + this.fVec52[<i32>(1)]))));
        this.fRec62[<i32>(0)] = -((this.fConst71 * ((this.fConst72 * this.fRec62[<i32>(1)]) - (this.fConst70 * (fTemp77 - this.fVec52[<i32>(1)])))));
        const fTemp78: f32 = (this.fRec58[<i32>(0)] + (this.fRec62[<i32>(0)] * fTemp73));
        const fTemp79: f32 = (fTemp74 + fTemp78);
        const fTemp80: f32 = (fTemp74 - fTemp78);
        const fTemp81: f32 = (<f32>(0.5) * fTemp80);
        this.fRec71[<i32>(0)] = (fSlow34 + (this.fConst3 * this.fRec71[<i32>(1)]));
        const fTemp82: f32 = (<f32>(0.025) * this.fRec71[<i32>(0)]);
        const fTemp83: f32 = Mathf.pow(<f32>(1e+01), -fTemp82);
        const fTemp84: f32 = Mathf.sqrt(fTemp83);
        const fTemp85: f32 = (this.fRec67[<i32>(1)] + (fSlow33 * ((fTemp81 - this.fRec68[<i32>(1)]) / fTemp84)));
        const fTemp86: f32 = ((fSlow33 * (((fSlow33 / fTemp84) + <f32>(1.4285715)) / fTemp84)) + <f32>(1.0));
        const fTemp87: f32 = (fTemp85 / fTemp86);
        this.fRec67[<i32>(0)] = ((<f32>(2.0) * fTemp87) - this.fRec67[<i32>(1)]);
        const fTemp88: f32 = (this.fRec68[<i32>(1)] + (fSlow33 * (fTemp85 / (fTemp84 * fTemp86))));
        this.fRec68[<i32>(0)] = ((<f32>(2.0) * fTemp88) - this.fRec68[<i32>(1)]);
        const fRec69: f32 = fTemp87;
        const fRec70: f32 = fTemp88;
        const fTemp89: f32 = (fRec69 * (fTemp83 + <f32>(-1.0)));
        const fTemp90: f32 = (fRec70 * (Mathf.pow(fTemp83, <f32>(2.0)) + <f32>(-1.0)));
        const fTemp91: f32 = ((fTemp81 + (<f32>(1.4285715) * fTemp89)) + fTemp90);
        const fTemp92: f32 = Mathf.pow(<f32>(1e+01), fTemp82);
        const fTemp93: f32 = Mathf.sqrt(fTemp92);
        const fTemp94: f32 = (this.fRec63[<i32>(1)] + (fSlow32 * ((fTemp91 - this.fRec64[<i32>(1)]) / fTemp93)));
        const fTemp95: f32 = ((fSlow32 * (((fSlow32 / fTemp93) + <f32>(1.4285715)) / fTemp93)) + <f32>(1.0));
        const fTemp96: f32 = (fTemp94 / fTemp95);
        this.fRec63[<i32>(0)] = ((<f32>(2.0) * fTemp96) - this.fRec63[<i32>(1)]);
        const fTemp97: f32 = (this.fRec64[<i32>(1)] + (fSlow32 * (fTemp94 / (fTemp93 * fTemp95))));
        this.fRec64[<i32>(0)] = ((<f32>(2.0) * fTemp97) - this.fRec64[<i32>(1)]);
        const fRec65: f32 = fTemp96;
        const fRec66: f32 = fTemp97;
        const fTemp98: f32 = ((fRec66 * (Mathf.pow(fTemp92, <f32>(2.0)) + <f32>(-1.0))) + (fTemp90 + (<f32>(1.4285715) * (fTemp89 + (fRec65 * (fTemp92 + <f32>(-1.0)))))));
        const fTemp99: f32 = ((this.fRec13[<i32>(0)] * fTemp68) + (fTemp69 * ((<f32>(0.5) * (fTemp79 + fTemp80)) + fTemp98)));
        const fTemp100: f32 = ((fTemp69 * ((<f32>(0.5) * (fTemp79 - fTemp80)) - fTemp98)) - ((this.fRec13[<i32>(0)] * fTemp57) * fTemp75));
        const fTemp101: f32 = Mathf.abs((Mathf.abs(fTemp99) + Mathf.abs(fTemp100)));
        this.fVec53[<i32>(0)] = fTemp101;
        const fTemp102: f32 = max<f32>(fTemp101, this.fVec53[<i32>(1)]);
        this.fVec54[<i32>(0)] = fTemp102;
        const fTemp103: f32 = max<f32>(fTemp102, this.fVec54[<i32>(2)]);
        this.fVec55[<i32>(0)] = fTemp103;
        const fTemp104: f32 = max<f32>(fTemp103, this.fVec55[<i32>(4)]);
        this.fVec56[<i32>(0)] = fTemp104;
        const fTemp105: f32 = max<f32>(fTemp104, this.fVec56[<i32>(8)]);
        this.fVec57[(this.IOTA0 & <i32>(31))] = fTemp105;
        const fTemp106: f32 = max<f32>(fTemp105, this.fVec57[((this.IOTA0 - <i32>(16)) & <i32>(31))]);
        this.fVec58[(this.IOTA0 & <i32>(63))] = fTemp106;
        const fTemp107: f32 = max<f32>(fTemp106, this.fVec58[((this.IOTA0 - <i32>(32)) & <i32>(63))]);
        this.fVec59[(this.IOTA0 & <i32>(127))] = fTemp107;
        const fTemp108: f32 = max<f32>(fTemp107, this.fVec59[((this.IOTA0 - <i32>(64)) & <i32>(127))]);
        this.fVec60[(this.IOTA0 & <i32>(255))] = fTemp108;
        const fTemp109: f32 = max<f32>(fTemp108, this.fVec60[((this.IOTA0 - <i32>(128)) & <i32>(255))]);
        this.fVec61[(this.IOTA0 & <i32>(511))] = fTemp109;
        const fTemp110: f32 = max<f32>(fTemp109, this.fVec61[((this.IOTA0 - <i32>(256)) & <i32>(511))]);
        this.fVec62[(this.IOTA0 & <i32>(1023))] = fTemp110;
        const fTemp111: f32 = max<f32>(fTemp110, this.fVec62[((this.IOTA0 - <i32>(512)) & <i32>(1023))]);
        this.fVec63[(this.IOTA0 & <i32>(2047))] = fTemp111;
        const fTemp112: f32 = max<f32>(fTemp111, this.fVec63[((this.IOTA0 - <i32>(1024)) & <i32>(2047))]);
        this.fVec64[(this.IOTA0 & <i32>(4095))] = fTemp112;
        const fTemp113: f32 = max<f32>(fTemp112, this.fVec64[((this.IOTA0 - <i32>(2048)) & <i32>(4095))]);
        this.fVec65[(this.IOTA0 & <i32>(8191))] = fTemp113;
        const fTemp114: f32 = max<f32>(fTemp113, this.fVec65[((this.IOTA0 - <i32>(4096)) & <i32>(8191))]);
        this.fVec66[(this.IOTA0 & <i32>(16383))] = fTemp114;
        this.fVec67[(this.IOTA0 & <i32>(32767))] = max<f32>(fTemp114, this.fVec66[((this.IOTA0 - <i32>(8192)) & <i32>(16383))]);
        const fTemp115: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), max<f32>(max<f32>(max<f32>(max<f32>(max<f32>(max<f32>(max<f32>(max<f32>(max<f32>(max<f32>(max<f32>(max<f32>(max<f32>(max<f32>(((this.iConst4) ? fTemp101 : <f32>(-3.4028235e+38)), ((this.iConst74) ? this.fVec54[this.iConst4] : <f32>(-3.4028235e+38))), ((this.iConst75) ? this.fVec55[this.iConst76] : <f32>(-3.4028235e+38))), ((this.iConst77) ? this.fVec56[this.iConst78] : <f32>(-3.4028235e+38))), ((this.iConst79) ? this.fVec57[((this.IOTA0 - this.iConst80) & <i32>(31))] : <f32>(-3.4028235e+38))), ((this.iConst81) ? this.fVec58[((this.IOTA0 - this.iConst82) & <i32>(63))] : <f32>(-3.4028235e+38))), ((this.iConst83) ? this.fVec59[((this.IOTA0 - this.iConst84) & <i32>(127))] : <f32>(-3.4028235e+38))), ((this.iConst85) ? this.fVec60[((this.IOTA0 - this.iConst86) & <i32>(255))] : <f32>(-3.4028235e+38))), ((this.iConst87) ? this.fVec61[((this.IOTA0 - this.iConst88) & <i32>(511))] : <f32>(-3.4028235e+38))), ((this.iConst89) ? this.fVec62[((this.IOTA0 - this.iConst90) & <i32>(1023))] : <f32>(-3.4028235e+38))), ((this.iConst91) ? this.fVec63[((this.IOTA0 - this.iConst92) & <i32>(2047))] : <f32>(-3.4028235e+38))), ((this.iConst93) ? this.fVec64[((this.IOTA0 - this.iConst94) & <i32>(4095))] : <f32>(-3.4028235e+38))), ((this.iConst95) ? this.fVec65[((this.IOTA0 - this.iConst96) & <i32>(8191))] : <f32>(-3.4028235e+38))), ((this.iConst97) ? this.fVec66[((this.IOTA0 - this.iConst98) & <i32>(16383))] : <f32>(-3.4028235e+38))), ((this.iConst99) ? this.fVec67[((this.IOTA0 - this.iConst100) & <i32>(32767))] : <f32>(-3.4028235e+38))))));
        const iTemp116: i32 = (<i32>(fTemp115 > fSlow36) + <i32>(fTemp115 > fSlow37));
        const fTemp117: f32 = max<f32>(<f32>(-1.2e+02), (<f32>(2.0) * ((iTemp116 == <i32>(0)) ? (fTemp115 - fSlow35) : ((iTemp116 == <i32>(1)) ? -((<f32>(0.041666668) * Mathf.pow(((fTemp115 + <f32>(-6.0)) - fSlow35), <f32>(2.0)))) : <f32>(0.0)))));
        const fTemp118: f32 = ((fTemp117 > this.fRec12[<i32>(1)]) ? this.fConst102 : this.fConst101);
        this.fRec12[<i32>(0)] = ((fTemp117 * (<f32>(1.0) - fTemp118)) + (this.fRec12[<i32>(1)] * fTemp118));
        const fTemp119: f32 = min<f32>(<f32>(1.0), max<f32>(<f32>(0.0), Mathf.pow(<f32>(1e+01), (<f32>(0.05) * this.fRec12[<i32>(0)]))));
        this.fVbargraph4 = (<f32>(1e+02) * (<f32>(1.0) - fTemp119));
        const fTemp120: f32 = (fSlow3 / fTemp119);
        const iTemp121: i32 = Mathf.abs(fTemp120) < <f32>(1.1920929e-07);
        const fTemp122: f32 = ((iTemp121) ? <f32>(0.0) : Mathf.exp(-((this.fConst5 / ((iTemp121) ? <f32>(1.0) : fTemp120)))));
        this.fVec68[<i32>(0)] = ((this.fConst21 * this.fRec74[<i32>(1)]) - (this.fConst23 * this.fRec2[<i32>(2)]));
        this.fRec75[<i32>(0)] = (this.fConst19 * (((this.fConst20 * this.fRec2[<i32>(2)]) - (this.fVec68[<i32>(1)] + (this.fConst24 * this.fRec75[<i32>(1)]))) + (this.fConst25 * this.fRec2[<i32>(1)])));
        this.fRec74[<i32>(0)] = this.fRec75[<i32>(0)];
        this.fVec69[<i32>(0)] = ((<f32>(0.50032705) * this.fRec74[<i32>(1)]) - (this.fConst26 * this.fRec72[<i32>(1)]));
        this.fRec73[<i32>(0)] = (this.fConst15 * (((this.fVec69[<i32>(1)] - (this.fConst27 * this.fRec73[<i32>(1)])) - (<f32>(1.0006541) * this.fRec74[<i32>(1)])) + (<f32>(0.50032705) * this.fRec74[<i32>(0)])));
        this.fRec72[<i32>(0)] = this.fRec73[<i32>(0)];
        const fTemp123: f32 = Mathf.pow(this.fRec72[<i32>(0)], <f32>(2.0));
        this.fVec70[<i32>(0)] = fTemp123;
        const fTemp124: f32 = (fTemp123 + this.fVec70[<i32>(1)]);
        this.fVec71[<i32>(0)] = fTemp124;
        const fTemp125: f32 = (fTemp124 + this.fVec71[<i32>(2)]);
        this.fVec72[<i32>(0)] = fTemp125;
        const fTemp126: f32 = (fTemp125 + this.fVec72[<i32>(4)]);
        this.fVec73[<i32>(0)] = fTemp126;
        const fTemp127: f32 = (fTemp126 + this.fVec73[<i32>(8)]);
        this.fVec74[(this.IOTA0 & <i32>(31))] = fTemp127;
        const fTemp128: f32 = (fTemp127 + this.fVec74[((this.IOTA0 - <i32>(16)) & <i32>(31))]);
        this.fVec75[(this.IOTA0 & <i32>(63))] = fTemp128;
        const fTemp129: f32 = (fTemp128 + this.fVec75[((this.IOTA0 - <i32>(32)) & <i32>(63))]);
        this.fVec76[(this.IOTA0 & <i32>(127))] = fTemp129;
        const fTemp130: f32 = (fTemp129 + this.fVec76[((this.IOTA0 - <i32>(64)) & <i32>(127))]);
        this.fVec77[(this.IOTA0 & <i32>(255))] = fTemp130;
        const fTemp131: f32 = (fTemp130 + this.fVec77[((this.IOTA0 - <i32>(128)) & <i32>(255))]);
        this.fVec78[(this.IOTA0 & <i32>(511))] = fTemp131;
        const fTemp132: f32 = (fTemp131 + this.fVec78[((this.IOTA0 - <i32>(256)) & <i32>(511))]);
        this.fVec79[(this.IOTA0 & <i32>(1023))] = fTemp132;
        const fTemp133: f32 = (fTemp132 + this.fVec79[((this.IOTA0 - <i32>(512)) & <i32>(1023))]);
        this.fVec80[(this.IOTA0 & <i32>(2047))] = fTemp133;
        const fTemp134: f32 = (fTemp133 + this.fVec80[((this.IOTA0 - <i32>(1024)) & <i32>(2047))]);
        this.fVec81[(this.IOTA0 & <i32>(4095))] = fTemp134;
        const fTemp135: f32 = (fTemp134 + this.fVec81[((this.IOTA0 - <i32>(2048)) & <i32>(4095))]);
        this.fVec82[(this.IOTA0 & <i32>(8191))] = fTemp135;
        const fTemp136: f32 = (fTemp135 + this.fVec82[((this.IOTA0 - <i32>(4096)) & <i32>(8191))]);
        this.fVec83[(this.IOTA0 & <i32>(16383))] = fTemp136;
        const fTemp137: f32 = (fTemp136 + this.fVec83[((this.IOTA0 - <i32>(8192)) & <i32>(16383))]);
        this.fVec84[(this.IOTA0 & <i32>(32767))] = fTemp137;
        const fTemp138: f32 = (fTemp137 + this.fVec84[((this.IOTA0 - <i32>(16384)) & <i32>(32767))]);
        this.fVec85[(this.IOTA0 & <i32>(65535))] = fTemp138;
        this.fVec86[(this.IOTA0 & <i32>(131071))] = (fTemp138 + this.fVec85[((this.IOTA0 - <i32>(32768)) & <i32>(65535))]);
        this.fVec87[<i32>(0)] = ((this.fConst21 * this.fRec78[<i32>(1)]) - (this.fConst23 * this.fRec3[<i32>(2)]));
        this.fRec79[<i32>(0)] = (this.fConst19 * (((this.fConst20 * this.fRec3[<i32>(2)]) - (this.fVec87[<i32>(1)] + (this.fConst24 * this.fRec79[<i32>(1)]))) + (this.fConst25 * this.fRec3[<i32>(1)])));
        this.fRec78[<i32>(0)] = this.fRec79[<i32>(0)];
        this.fVec88[<i32>(0)] = ((<f32>(0.50032705) * this.fRec78[<i32>(1)]) - (this.fConst26 * this.fRec76[<i32>(1)]));
        this.fRec77[<i32>(0)] = (this.fConst15 * (((this.fVec88[<i32>(1)] - (this.fConst27 * this.fRec77[<i32>(1)])) - (<f32>(1.0006541) * this.fRec78[<i32>(1)])) + (<f32>(0.50032705) * this.fRec78[<i32>(0)])));
        this.fRec76[<i32>(0)] = this.fRec77[<i32>(0)];
        const fTemp139: f32 = Mathf.pow(this.fRec76[<i32>(0)], <f32>(2.0));
        this.fVec89[<i32>(0)] = fTemp139;
        const fTemp140: f32 = (fTemp139 + this.fVec89[<i32>(1)]);
        this.fVec90[<i32>(0)] = fTemp140;
        const fTemp141: f32 = (fTemp140 + this.fVec90[<i32>(2)]);
        this.fVec91[<i32>(0)] = fTemp141;
        const fTemp142: f32 = (fTemp141 + this.fVec91[<i32>(4)]);
        this.fVec92[<i32>(0)] = fTemp142;
        const fTemp143: f32 = (fTemp142 + this.fVec92[<i32>(8)]);
        this.fVec93[(this.IOTA0 & <i32>(31))] = fTemp143;
        const fTemp144: f32 = (fTemp143 + this.fVec93[((this.IOTA0 - <i32>(16)) & <i32>(31))]);
        this.fVec94[(this.IOTA0 & <i32>(63))] = fTemp144;
        const fTemp145: f32 = (fTemp144 + this.fVec94[((this.IOTA0 - <i32>(32)) & <i32>(63))]);
        this.fVec95[(this.IOTA0 & <i32>(127))] = fTemp145;
        const fTemp146: f32 = (fTemp145 + this.fVec95[((this.IOTA0 - <i32>(64)) & <i32>(127))]);
        this.fVec96[(this.IOTA0 & <i32>(255))] = fTemp146;
        const fTemp147: f32 = (fTemp146 + this.fVec96[((this.IOTA0 - <i32>(128)) & <i32>(255))]);
        this.fVec97[(this.IOTA0 & <i32>(511))] = fTemp147;
        const fTemp148: f32 = (fTemp147 + this.fVec97[((this.IOTA0 - <i32>(256)) & <i32>(511))]);
        this.fVec98[(this.IOTA0 & <i32>(1023))] = fTemp148;
        const fTemp149: f32 = (fTemp148 + this.fVec98[((this.IOTA0 - <i32>(512)) & <i32>(1023))]);
        this.fVec99[(this.IOTA0 & <i32>(2047))] = fTemp149;
        const fTemp150: f32 = (fTemp149 + this.fVec99[((this.IOTA0 - <i32>(1024)) & <i32>(2047))]);
        this.fVec100[(this.IOTA0 & <i32>(4095))] = fTemp150;
        const fTemp151: f32 = (fTemp150 + this.fVec100[((this.IOTA0 - <i32>(2048)) & <i32>(4095))]);
        this.fVec101[(this.IOTA0 & <i32>(8191))] = fTemp151;
        const fTemp152: f32 = (fTemp151 + this.fVec101[((this.IOTA0 - <i32>(4096)) & <i32>(8191))]);
        this.fVec102[(this.IOTA0 & <i32>(16383))] = fTemp152;
        const fTemp153: f32 = (fTemp152 + this.fVec102[((this.IOTA0 - <i32>(8192)) & <i32>(16383))]);
        this.fVec103[(this.IOTA0 & <i32>(32767))] = fTemp153;
        const fTemp154: f32 = (fTemp153 + this.fVec103[((this.IOTA0 - <i32>(16384)) & <i32>(32767))]);
        this.fVec104[(this.IOTA0 & <i32>(65535))] = fTemp154;
        this.fVec105[(this.IOTA0 & <i32>(131071))] = (fTemp154 + this.fVec104[((this.IOTA0 - <i32>(32768)) & <i32>(65535))]);
        this.fRec11[<i32>(0)] = (((<f32>(1.0) - fTemp122) * max<f32>(-this.fVslider12, min<f32>(fSlow38, (fSlow39 + (this.fRec10[<i32>(1)] + (<f32>(0.691) - (<f32>(4.3429446) * Mathf.log(max<f32>(<f32>(1e-12), (this.fConst104 * ((((this.iConst105) ? this.fVec86[((this.IOTA0 - this.iConst136) & <i32>(131071))] : <f32>(0.0)) + (((this.iConst135) ? this.fVec85[((this.IOTA0 - this.iConst134) & <i32>(65535))] : <f32>(0.0)) + (((this.iConst133) ? this.fVec84[((this.IOTA0 - this.iConst132) & <i32>(32767))] : <f32>(0.0)) + (((this.iConst131) ? this.fVec83[((this.IOTA0 - this.iConst130) & <i32>(16383))] : <f32>(0.0)) + (((this.iConst129) ? this.fVec82[((this.IOTA0 - this.iConst128) & <i32>(8191))] : <f32>(0.0)) + (((this.iConst127) ? this.fVec81[((this.IOTA0 - this.iConst126) & <i32>(4095))] : <f32>(0.0)) + (((this.iConst125) ? this.fVec80[((this.IOTA0 - this.iConst124) & <i32>(2047))] : <f32>(0.0)) + (((this.iConst123) ? this.fVec79[((this.IOTA0 - this.iConst122) & <i32>(1023))] : <f32>(0.0)) + (((this.iConst121) ? this.fVec78[((this.IOTA0 - this.iConst120) & <i32>(511))] : <f32>(0.0)) + (((this.iConst119) ? this.fVec77[((this.IOTA0 - this.iConst118) & <i32>(255))] : <f32>(0.0)) + (((this.iConst117) ? this.fVec76[((this.IOTA0 - this.iConst116) & <i32>(127))] : <f32>(0.0)) + (((this.iConst115) ? this.fVec75[((this.IOTA0 - this.iConst114) & <i32>(63))] : <f32>(0.0)) + (((this.iConst113) ? this.fVec74[((this.IOTA0 - this.iConst112) & <i32>(31))] : <f32>(0.0)) + (((this.iConst111) ? this.fVec73[this.iConst110] : <f32>(0.0)) + (((this.iConst109) ? this.fVec72[this.iConst108] : <f32>(0.0)) + (((this.iConst106) ? fTemp123 : <f32>(0.0)) + ((this.iConst107) ? this.fVec71[this.iConst106] : <f32>(0.0)))))))))))))))))) + (((this.iConst105) ? this.fVec105[((this.IOTA0 - this.iConst136) & <i32>(131071))] : <f32>(0.0)) + (((this.iConst135) ? this.fVec104[((this.IOTA0 - this.iConst134) & <i32>(65535))] : <f32>(0.0)) + (((this.iConst133) ? this.fVec103[((this.IOTA0 - this.iConst132) & <i32>(32767))] : <f32>(0.0)) + (((this.iConst131) ? this.fVec102[((this.IOTA0 - this.iConst130) & <i32>(16383))] : <f32>(0.0)) + (((this.iConst129) ? this.fVec101[((this.IOTA0 - this.iConst128) & <i32>(8191))] : <f32>(0.0)) + (((this.iConst127) ? this.fVec100[((this.IOTA0 - this.iConst126) & <i32>(4095))] : <f32>(0.0)) + (((this.iConst125) ? this.fVec99[((this.IOTA0 - this.iConst124) & <i32>(2047))] : <f32>(0.0)) + (((this.iConst123) ? this.fVec98[((this.IOTA0 - this.iConst122) & <i32>(1023))] : <f32>(0.0)) + (((this.iConst121) ? this.fVec97[((this.IOTA0 - this.iConst120) & <i32>(511))] : <f32>(0.0)) + (((this.iConst119) ? this.fVec96[((this.IOTA0 - this.iConst118) & <i32>(255))] : <f32>(0.0)) + (((this.iConst117) ? this.fVec95[((this.IOTA0 - this.iConst116) & <i32>(127))] : <f32>(0.0)) + (((this.iConst115) ? this.fVec94[((this.IOTA0 - this.iConst114) & <i32>(63))] : <f32>(0.0)) + (((this.iConst113) ? this.fVec93[((this.IOTA0 - this.iConst112) & <i32>(31))] : <f32>(0.0)) + (((this.iConst111) ? this.fVec92[this.iConst110] : <f32>(0.0)) + (((this.iConst109) ? this.fVec91[this.iConst108] : <f32>(0.0)) + (((this.iConst106) ? fTemp139 : <f32>(0.0)) + ((this.iConst107) ? this.fVec90[this.iConst106] : <f32>(0.0))))))))))))))))))))))))))))) + (fTemp122 * this.fRec11[<i32>(1)]));
        this.fVbargraph5 = this.fRec11[<i32>(0)];
        this.fRec10[<i32>(0)] = this.fVbargraph5;
        const fTemp155: f32 = (this.fRec9[<i32>(0)] + ((<f32>(1.0) - this.fRec9[<i32>(0)]) * Mathf.pow(<f32>(1e+01), (<f32>(0.05) * this.fRec10[<i32>(0)]))));
        const fTemp156: f32 = (this.fRec8[<i32>(0)] * fTemp155);
        this.fRec80[<i32>(0)] = (fSlow40 + (this.fConst3 * this.fRec80[<i32>(1)]));
        this.fRec81[<i32>(0)] = (fSlow41 + (this.fConst3 * this.fRec81[<i32>(1)]));
        const fTemp157: f32 = (<f32>(1.0) - this.fRec81[<i32>(0)]);
        this.fRec82[<i32>(0)] = (fSlow42 + (this.fConst3 * this.fRec82[<i32>(1)]));
        const fTemp158: f32 = ((fSlow46 * this.fRec4[<i32>(1)]) + (fSlow47 * (fTemp99 * fTemp155)));
        const fTemp159: f32 = ((fSlow46 * this.fRec5[<i32>(1)]) + (fSlow47 * (fTemp100 * fTemp155)));
        this.fRec84[(this.IOTA0 & <i32>(262143))] = (this.fRec84[((this.IOTA0 - <i32>(1)) & <i32>(262143))] + Mathf.pow((<f32>(0.5) * (fTemp158 + fTemp159)), <f32>(2.0)));
        const fTemp160: f32 = Mathf.sqrt((fSlow45 * (this.fRec84[(this.IOTA0 & <i32>(262143))] - this.fRec84[((this.IOTA0 - iSlow48) & <i32>(262143))])));
        const fTemp161: f32 = ((fTemp160 > this.fRec83[<i32>(1)]) ? fSlow51 : <f32>(0.0));
        this.fRec83[<i32>(0)] = ((fTemp160 * (<f32>(1.0) - fTemp161)) + (this.fRec83[<i32>(1)] * fTemp161));
        const fTemp162: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), this.fRec83[<i32>(0)])));
        const iTemp163: i32 = (<i32>(fTemp162 > fSlow55) + <i32>(fTemp162 > fSlow56));
        const fTemp164: f32 = (fTemp162 - fSlow52);
        const fTemp165: f32 = max<f32>(<f32>(0.0), ((iTemp163 == <i32>(0)) ? <f32>(0.0) : ((iTemp163 == <i32>(1)) ? (fSlow57 * Mathf.pow((fSlow54 + fTemp164), <f32>(2.0))) : fTemp164)));
        const fTemp166: f32 = (fSlow59 * fTemp165);
        this.fRec86[(this.IOTA0 & <i32>(262143))] = (this.fRec86[((this.IOTA0 - <i32>(1)) & <i32>(262143))] + Mathf.pow((<f32>(0.5) * (fTemp158 - fTemp159)), <f32>(2.0)));
        const fTemp167: f32 = Mathf.sqrt((fSlow45 * (this.fRec86[(this.IOTA0 & <i32>(262143))] - this.fRec86[((this.IOTA0 - iSlow48) & <i32>(262143))])));
        const fTemp168: f32 = ((fTemp167 > this.fRec85[<i32>(1)]) ? fSlow51 : <f32>(0.0));
        this.fRec85[<i32>(0)] = ((fTemp167 * (<f32>(1.0) - fTemp168)) + (this.fRec85[<i32>(1)] * fTemp168));
        const fTemp169: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), this.fRec85[<i32>(0)])));
        const iTemp170: i32 = (<i32>(fTemp169 > fSlow55) + <i32>(fTemp169 > fSlow56));
        const fTemp171: f32 = (fTemp169 - fSlow52);
        const fTemp172: f32 = max<f32>(<f32>(0.0), ((iTemp170 == <i32>(0)) ? <f32>(0.0) : ((iTemp170 == <i32>(1)) ? (fSlow57 * Mathf.pow((fSlow54 + fTemp171), <f32>(2.0))) : fTemp171)));
        const fTemp173: f32 = (fSlow59 * fTemp172);
        const fTemp174: f32 = min<f32>(-fTemp166, -fTemp173);
        const fTemp175: f32 = (<f32>(0.01) * ((fSlow43 * fTemp165) - (fSlow58 * (fTemp166 + fTemp174))));
        this.fVbargraph6 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), -fTemp175));
        const fTemp176: f32 = ((this.fRec81[<i32>(0)] + (fTemp157 * Mathf.pow(<f32>(1e+01), (<f32>(0.05) * (this.fRec82[<i32>(0)] + -fTemp175))))) * (fTemp99 + fTemp100));
        const fTemp177: f32 = (<f32>(0.01) * ((fSlow43 * fTemp172) - (fSlow58 * (fTemp173 + fTemp174))));
        this.fVbargraph7 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), -fTemp177));
        const fTemp178: f32 = ((this.fRec81[<i32>(0)] + (fTemp157 * Mathf.pow(<f32>(1e+01), (<f32>(0.05) * (this.fRec82[<i32>(0)] + -fTemp177))))) * (fTemp99 - fTemp100));
        const fTemp179: f32 = (fTemp99 + (this.fRec80[<i32>(0)] * ((<f32>(0.5) * (fTemp176 + fTemp178)) - fTemp99)));
        this.fRec87[<i32>(0)] = (fSlow60 + (this.fConst3 * this.fRec87[<i32>(1)]));
        const fTemp180: f32 = (this.fRec87[<i32>(0)] * (<f32>(1.0) - this.fRec8[<i32>(0)]));
        const fTemp181: f32 = (fTemp100 + (this.fRec80[<i32>(0)] * ((<f32>(0.5) * (fTemp176 - fTemp178)) - fTemp100)));
        const fTemp182: f32 = (<f32>(0.5) * (fTemp155 * (fTemp179 + fTemp181)));
        this.fRec91[<i32>(0)] = (fTemp182 - (fSlow75 * ((fSlow76 * this.fRec91[<i32>(2)]) + (fSlow77 * this.fRec91[<i32>(1)]))));
        const fTemp183: f32 = (<f32>(2.0) * this.fRec91[<i32>(1)]);
        this.fRec90[<i32>(0)] = ((fSlow74 * (this.fRec91[<i32>(2)] + (this.fRec91[<i32>(0)] - fTemp183))) - (fSlow78 * ((fSlow79 * this.fRec90[<i32>(2)]) + (fSlow77 * this.fRec90[<i32>(1)]))));
        this.fRec89[<i32>(0)] = ((fSlow72 * (this.fRec90[<i32>(2)] + (this.fRec90[<i32>(0)] - (<f32>(2.0) * this.fRec90[<i32>(1)])))) - (fSlow80 * ((fSlow81 * this.fRec89[<i32>(2)]) + (fSlow77 * this.fRec89[<i32>(1)]))));
        const fTemp184: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow70 * (this.fRec89[<i32>(2)] + (this.fRec89[<i32>(0)] - (<f32>(2.0) * this.fRec89[<i32>(1)]))))))));
        const iTemp185: i32 = (<i32>(fTemp184 > fSlow86) + <i32>(fTemp184 > fSlow87));
        const fTemp186: f32 = (fTemp184 - fSlow83);
        const fTemp187: f32 = max<f32>(<f32>(0.0), ((iTemp185 == <i32>(0)) ? <f32>(0.0) : ((iTemp185 == <i32>(1)) ? (fSlow88 * Mathf.pow((fSlow85 + fTemp186), <f32>(2.0))) : fTemp186)));
        const fTemp188: f32 = ((-((fSlow63 * fTemp187)) > this.fRec88[<i32>(1)]) ? fSlow98 : fSlow93);
        this.fRec88[<i32>(0)] = ((this.fRec88[<i32>(1)] * fTemp188) - (fSlow63 * (fTemp187 * (<f32>(1.0) - fTemp188))));
        const fTemp189: f32 = (<f32>(0.5) * (fTemp155 * (fTemp179 - fTemp181)));
        this.fRec95[<i32>(0)] = (fTemp189 - (fSlow75 * ((fSlow76 * this.fRec95[<i32>(2)]) + (fSlow77 * this.fRec95[<i32>(1)]))));
        const fTemp190: f32 = (<f32>(2.0) * this.fRec95[<i32>(1)]);
        this.fRec94[<i32>(0)] = ((fSlow74 * (this.fRec95[<i32>(2)] + (this.fRec95[<i32>(0)] - fTemp190))) - (fSlow78 * ((fSlow79 * this.fRec94[<i32>(2)]) + (fSlow77 * this.fRec94[<i32>(1)]))));
        this.fRec93[<i32>(0)] = ((fSlow72 * (this.fRec94[<i32>(2)] + (this.fRec94[<i32>(0)] - (<f32>(2.0) * this.fRec94[<i32>(1)])))) - (fSlow80 * ((fSlow81 * this.fRec93[<i32>(2)]) + (fSlow77 * this.fRec93[<i32>(1)]))));
        const fTemp191: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow70 * (this.fRec93[<i32>(2)] + (this.fRec93[<i32>(0)] - (<f32>(2.0) * this.fRec93[<i32>(1)]))))))));
        const iTemp192: i32 = (<i32>(fTemp191 > fSlow86) + <i32>(fTemp191 > fSlow87));
        const fTemp193: f32 = (fTemp191 - fSlow83);
        const fTemp194: f32 = max<f32>(<f32>(0.0), ((iTemp192 == <i32>(0)) ? <f32>(0.0) : ((iTemp192 == <i32>(1)) ? (fSlow88 * Mathf.pow((fSlow85 + fTemp193), <f32>(2.0))) : fTemp193)));
        const fTemp195: f32 = ((-((fSlow63 * fTemp194)) > this.fRec92[<i32>(1)]) ? fSlow98 : fSlow93);
        this.fRec92[<i32>(0)] = ((this.fRec92[<i32>(1)] * fTemp195) - (fSlow63 * (fTemp194 * (<f32>(1.0) - fTemp195))));
        const fTemp196: f32 = min<f32>(this.fRec88[<i32>(0)], this.fRec92[<i32>(0)]);
        const fTemp197: f32 = (this.fRec88[<i32>(0)] + (fSlow101 * (fTemp196 - this.fRec88[<i32>(0)])));
        this.fVbargraph8 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp197));
        const fTemp198: f32 = Mathf.pow(<f32>(1e+01), (<f32>(0.008333334) * fTemp197));
        const fTemp199: f32 = Mathf.sqrt(fTemp198);
        this.fRec326[<i32>(0)] = ((fSlow75 * (this.fRec91[<i32>(2)] + (this.fRec91[<i32>(0)] + fTemp183))) - (fSlow78 * ((fSlow79 * this.fRec326[<i32>(2)]) + (fSlow77 * this.fRec326[<i32>(1)]))));
        this.fRec325[<i32>(0)] = ((fSlow78 * (this.fRec326[<i32>(2)] + (this.fRec326[<i32>(0)] + (<f32>(2.0) * this.fRec326[<i32>(1)])))) - (fSlow80 * ((fSlow81 * this.fRec325[<i32>(2)]) + (fSlow77 * this.fRec325[<i32>(1)]))));
        this.fRec324[<i32>(0)] = ((fSlow80 * (this.fRec325[<i32>(2)] + (this.fRec325[<i32>(0)] + (<f32>(2.0) * this.fRec325[<i32>(1)])))) - (fSlow150 * ((fSlow151 * this.fRec324[<i32>(2)]) + (fSlow153 * this.fRec324[<i32>(1)]))));
        const fTemp200: f32 = (<f32>(2.0) * this.fRec324[<i32>(1)]);
        this.fRec323[<i32>(0)] = ((fSlow150 * (this.fRec324[<i32>(2)] + (this.fRec324[<i32>(0)] + fTemp200))) - (fSlow148 * ((fSlow154 * this.fRec323[<i32>(2)]) + (fSlow153 * this.fRec323[<i32>(1)]))));
        this.fRec322[<i32>(0)] = ((fSlow148 * (this.fRec323[<i32>(2)] + (this.fRec323[<i32>(0)] + (<f32>(2.0) * this.fRec323[<i32>(1)])))) - (fSlow146 * ((fSlow155 * this.fRec322[<i32>(2)]) + (fSlow153 * this.fRec322[<i32>(1)]))));
        this.fRec321[<i32>(0)] = ((fSlow146 * (this.fRec322[<i32>(2)] + (this.fRec322[<i32>(0)] + (<f32>(2.0) * this.fRec322[<i32>(1)])))) - (fSlow143 * ((fSlow156 * this.fRec321[<i32>(2)]) + (fSlow158 * this.fRec321[<i32>(1)]))));
        const fTemp201: f32 = (<f32>(2.0) * this.fRec321[<i32>(1)]);
        this.fRec320[<i32>(0)] = ((fSlow143 * (this.fRec321[<i32>(2)] + (this.fRec321[<i32>(0)] + fTemp201))) - (fSlow141 * ((fSlow159 * this.fRec320[<i32>(2)]) + (fSlow158 * this.fRec320[<i32>(1)]))));
        this.fRec319[<i32>(0)] = ((fSlow141 * (this.fRec320[<i32>(2)] + (this.fRec320[<i32>(0)] + (<f32>(2.0) * this.fRec320[<i32>(1)])))) - (fSlow139 * ((fSlow160 * this.fRec319[<i32>(2)]) + (fSlow158 * this.fRec319[<i32>(1)]))));
        this.fRec318[<i32>(0)] = ((fSlow139 * (this.fRec319[<i32>(2)] + (this.fRec319[<i32>(0)] + (<f32>(2.0) * this.fRec319[<i32>(1)])))) - (fSlow136 * ((fSlow161 * this.fRec318[<i32>(2)]) + (fSlow163 * this.fRec318[<i32>(1)]))));
        const fTemp202: f32 = (<f32>(2.0) * this.fRec318[<i32>(1)]);
        this.fRec317[<i32>(0)] = ((fSlow136 * (this.fRec318[<i32>(2)] + (this.fRec318[<i32>(0)] + fTemp202))) - (fSlow134 * ((fSlow164 * this.fRec317[<i32>(2)]) + (fSlow163 * this.fRec317[<i32>(1)]))));
        this.fRec316[<i32>(0)] = ((fSlow134 * (this.fRec317[<i32>(2)] + (this.fRec317[<i32>(0)] + (<f32>(2.0) * this.fRec317[<i32>(1)])))) - (fSlow132 * ((fSlow165 * this.fRec316[<i32>(2)]) + (fSlow163 * this.fRec316[<i32>(1)]))));
        this.fRec315[<i32>(0)] = ((fSlow132 * (this.fRec316[<i32>(2)] + (this.fRec316[<i32>(0)] + (<f32>(2.0) * this.fRec316[<i32>(1)])))) - (fSlow129 * ((fSlow166 * this.fRec315[<i32>(2)]) + (fSlow168 * this.fRec315[<i32>(1)]))));
        const fTemp203: f32 = (<f32>(2.0) * this.fRec315[<i32>(1)]);
        this.fRec314[<i32>(0)] = ((fSlow129 * (this.fRec315[<i32>(2)] + (this.fRec315[<i32>(0)] + fTemp203))) - (fSlow127 * ((fSlow169 * this.fRec314[<i32>(2)]) + (fSlow168 * this.fRec314[<i32>(1)]))));
        this.fRec313[<i32>(0)] = ((fSlow127 * (this.fRec314[<i32>(2)] + (this.fRec314[<i32>(0)] + (<f32>(2.0) * this.fRec314[<i32>(1)])))) - (fSlow125 * ((fSlow170 * this.fRec313[<i32>(2)]) + (fSlow168 * this.fRec313[<i32>(1)]))));
        this.fRec312[<i32>(0)] = ((fSlow125 * (this.fRec313[<i32>(2)] + (this.fRec313[<i32>(0)] + (<f32>(2.0) * this.fRec313[<i32>(1)])))) - (fSlow122 * ((fSlow171 * this.fRec312[<i32>(2)]) + (fSlow173 * this.fRec312[<i32>(1)]))));
        const fTemp204: f32 = (<f32>(2.0) * this.fRec312[<i32>(1)]);
        this.fRec311[<i32>(0)] = ((fSlow122 * (this.fRec312[<i32>(2)] + (this.fRec312[<i32>(0)] + fTemp204))) - (fSlow120 * ((fSlow174 * this.fRec311[<i32>(2)]) + (fSlow173 * this.fRec311[<i32>(1)]))));
        this.fRec310[<i32>(0)] = ((fSlow120 * (this.fRec311[<i32>(2)] + (this.fRec311[<i32>(0)] + (<f32>(2.0) * this.fRec311[<i32>(1)])))) - (fSlow118 * ((fSlow175 * this.fRec310[<i32>(2)]) + (fSlow173 * this.fRec310[<i32>(1)]))));
        this.fRec309[<i32>(0)] = ((fSlow118 * (this.fRec310[<i32>(2)] + (this.fRec310[<i32>(0)] + (<f32>(2.0) * this.fRec310[<i32>(1)])))) - (fSlow115 * ((fSlow176 * this.fRec309[<i32>(2)]) + (fSlow178 * this.fRec309[<i32>(1)]))));
        const fTemp205: f32 = (<f32>(2.0) * this.fRec309[<i32>(1)]);
        this.fRec308[<i32>(0)] = ((fSlow115 * (this.fRec309[<i32>(2)] + (this.fRec309[<i32>(0)] + fTemp205))) - (fSlow113 * ((fSlow179 * this.fRec308[<i32>(2)]) + (fSlow178 * this.fRec308[<i32>(1)]))));
        this.fRec307[<i32>(0)] = ((fSlow113 * (this.fRec308[<i32>(2)] + (this.fRec308[<i32>(0)] + (<f32>(2.0) * this.fRec308[<i32>(1)])))) - (fSlow111 * ((fSlow180 * this.fRec307[<i32>(2)]) + (fSlow178 * this.fRec307[<i32>(1)]))));
        const fTemp206: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow111 * (this.fRec307[<i32>(2)] + (this.fRec307[<i32>(0)] + (<f32>(2.0) * this.fRec307[<i32>(1)]))))))));
        const iTemp207: i32 = (<i32>(fTemp206 > fSlow185) + <i32>(fTemp206 > fSlow186));
        const fTemp208: f32 = (fTemp206 - fSlow182);
        const fTemp209: f32 = max<f32>(<f32>(0.0), ((iTemp207 == <i32>(0)) ? <f32>(0.0) : ((iTemp207 == <i32>(1)) ? (fSlow187 * Mathf.pow((fSlow184 + fTemp208), <f32>(2.0))) : fTemp208)));
        const fTemp210: f32 = ((-((fSlow108 * fTemp209)) > this.fRec306[<i32>(1)]) ? fSlow191 : fSlow189);
        this.fRec306[<i32>(0)] = ((this.fRec306[<i32>(1)] * fTemp210) - (fSlow108 * (fTemp209 * (<f32>(1.0) - fTemp210))));
        this.fRec347[<i32>(0)] = ((fSlow75 * (this.fRec95[<i32>(2)] + (this.fRec95[<i32>(0)] + fTemp190))) - (fSlow78 * ((fSlow79 * this.fRec347[<i32>(2)]) + (fSlow77 * this.fRec347[<i32>(1)]))));
        this.fRec346[<i32>(0)] = ((fSlow78 * (this.fRec347[<i32>(2)] + (this.fRec347[<i32>(0)] + (<f32>(2.0) * this.fRec347[<i32>(1)])))) - (fSlow80 * ((fSlow81 * this.fRec346[<i32>(2)]) + (fSlow77 * this.fRec346[<i32>(1)]))));
        this.fRec345[<i32>(0)] = ((fSlow80 * (this.fRec346[<i32>(2)] + (this.fRec346[<i32>(0)] + (<f32>(2.0) * this.fRec346[<i32>(1)])))) - (fSlow150 * ((fSlow151 * this.fRec345[<i32>(2)]) + (fSlow153 * this.fRec345[<i32>(1)]))));
        const fTemp211: f32 = (<f32>(2.0) * this.fRec345[<i32>(1)]);
        this.fRec344[<i32>(0)] = ((fSlow150 * (this.fRec345[<i32>(2)] + (this.fRec345[<i32>(0)] + fTemp211))) - (fSlow148 * ((fSlow154 * this.fRec344[<i32>(2)]) + (fSlow153 * this.fRec344[<i32>(1)]))));
        this.fRec343[<i32>(0)] = ((fSlow148 * (this.fRec344[<i32>(2)] + (this.fRec344[<i32>(0)] + (<f32>(2.0) * this.fRec344[<i32>(1)])))) - (fSlow146 * ((fSlow155 * this.fRec343[<i32>(2)]) + (fSlow153 * this.fRec343[<i32>(1)]))));
        this.fRec342[<i32>(0)] = ((fSlow146 * (this.fRec343[<i32>(2)] + (this.fRec343[<i32>(0)] + (<f32>(2.0) * this.fRec343[<i32>(1)])))) - (fSlow143 * ((fSlow156 * this.fRec342[<i32>(2)]) + (fSlow158 * this.fRec342[<i32>(1)]))));
        const fTemp212: f32 = (<f32>(2.0) * this.fRec342[<i32>(1)]);
        this.fRec341[<i32>(0)] = ((fSlow143 * (this.fRec342[<i32>(2)] + (this.fRec342[<i32>(0)] + fTemp212))) - (fSlow141 * ((fSlow159 * this.fRec341[<i32>(2)]) + (fSlow158 * this.fRec341[<i32>(1)]))));
        this.fRec340[<i32>(0)] = ((fSlow141 * (this.fRec341[<i32>(2)] + (this.fRec341[<i32>(0)] + (<f32>(2.0) * this.fRec341[<i32>(1)])))) - (fSlow139 * ((fSlow160 * this.fRec340[<i32>(2)]) + (fSlow158 * this.fRec340[<i32>(1)]))));
        this.fRec339[<i32>(0)] = ((fSlow139 * (this.fRec340[<i32>(2)] + (this.fRec340[<i32>(0)] + (<f32>(2.0) * this.fRec340[<i32>(1)])))) - (fSlow136 * ((fSlow161 * this.fRec339[<i32>(2)]) + (fSlow163 * this.fRec339[<i32>(1)]))));
        const fTemp213: f32 = (<f32>(2.0) * this.fRec339[<i32>(1)]);
        this.fRec338[<i32>(0)] = ((fSlow136 * (this.fRec339[<i32>(2)] + (this.fRec339[<i32>(0)] + fTemp213))) - (fSlow134 * ((fSlow164 * this.fRec338[<i32>(2)]) + (fSlow163 * this.fRec338[<i32>(1)]))));
        this.fRec337[<i32>(0)] = ((fSlow134 * (this.fRec338[<i32>(2)] + (this.fRec338[<i32>(0)] + (<f32>(2.0) * this.fRec338[<i32>(1)])))) - (fSlow132 * ((fSlow165 * this.fRec337[<i32>(2)]) + (fSlow163 * this.fRec337[<i32>(1)]))));
        this.fRec336[<i32>(0)] = ((fSlow132 * (this.fRec337[<i32>(2)] + (this.fRec337[<i32>(0)] + (<f32>(2.0) * this.fRec337[<i32>(1)])))) - (fSlow129 * ((fSlow166 * this.fRec336[<i32>(2)]) + (fSlow168 * this.fRec336[<i32>(1)]))));
        const fTemp214: f32 = (<f32>(2.0) * this.fRec336[<i32>(1)]);
        this.fRec335[<i32>(0)] = ((fSlow129 * (this.fRec336[<i32>(2)] + (this.fRec336[<i32>(0)] + fTemp214))) - (fSlow127 * ((fSlow169 * this.fRec335[<i32>(2)]) + (fSlow168 * this.fRec335[<i32>(1)]))));
        this.fRec334[<i32>(0)] = ((fSlow127 * (this.fRec335[<i32>(2)] + (this.fRec335[<i32>(0)] + (<f32>(2.0) * this.fRec335[<i32>(1)])))) - (fSlow125 * ((fSlow170 * this.fRec334[<i32>(2)]) + (fSlow168 * this.fRec334[<i32>(1)]))));
        this.fRec333[<i32>(0)] = ((fSlow125 * (this.fRec334[<i32>(2)] + (this.fRec334[<i32>(0)] + (<f32>(2.0) * this.fRec334[<i32>(1)])))) - (fSlow122 * ((fSlow171 * this.fRec333[<i32>(2)]) + (fSlow173 * this.fRec333[<i32>(1)]))));
        const fTemp215: f32 = (<f32>(2.0) * this.fRec333[<i32>(1)]);
        this.fRec332[<i32>(0)] = ((fSlow122 * (this.fRec333[<i32>(2)] + (this.fRec333[<i32>(0)] + fTemp215))) - (fSlow120 * ((fSlow174 * this.fRec332[<i32>(2)]) + (fSlow173 * this.fRec332[<i32>(1)]))));
        this.fRec331[<i32>(0)] = ((fSlow120 * (this.fRec332[<i32>(2)] + (this.fRec332[<i32>(0)] + (<f32>(2.0) * this.fRec332[<i32>(1)])))) - (fSlow118 * ((fSlow175 * this.fRec331[<i32>(2)]) + (fSlow173 * this.fRec331[<i32>(1)]))));
        this.fRec330[<i32>(0)] = ((fSlow118 * (this.fRec331[<i32>(2)] + (this.fRec331[<i32>(0)] + (<f32>(2.0) * this.fRec331[<i32>(1)])))) - (fSlow115 * ((fSlow176 * this.fRec330[<i32>(2)]) + (fSlow178 * this.fRec330[<i32>(1)]))));
        const fTemp216: f32 = (<f32>(2.0) * this.fRec330[<i32>(1)]);
        this.fRec329[<i32>(0)] = ((fSlow115 * (this.fRec330[<i32>(2)] + (this.fRec330[<i32>(0)] + fTemp216))) - (fSlow113 * ((fSlow179 * this.fRec329[<i32>(2)]) + (fSlow178 * this.fRec329[<i32>(1)]))));
        this.fRec328[<i32>(0)] = ((fSlow113 * (this.fRec329[<i32>(2)] + (this.fRec329[<i32>(0)] + (<f32>(2.0) * this.fRec329[<i32>(1)])))) - (fSlow111 * ((fSlow180 * this.fRec328[<i32>(2)]) + (fSlow178 * this.fRec328[<i32>(1)]))));
        const fTemp217: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow111 * (this.fRec328[<i32>(2)] + (this.fRec328[<i32>(0)] + (<f32>(2.0) * this.fRec328[<i32>(1)]))))))));
        const iTemp218: i32 = (<i32>(fTemp217 > fSlow185) + <i32>(fTemp217 > fSlow186));
        const fTemp219: f32 = (fTemp217 - fSlow182);
        const fTemp220: f32 = max<f32>(<f32>(0.0), ((iTemp218 == <i32>(0)) ? <f32>(0.0) : ((iTemp218 == <i32>(1)) ? (fSlow187 * Mathf.pow((fSlow184 + fTemp219), <f32>(2.0))) : fTemp219)));
        const fTemp221: f32 = ((-((fSlow108 * fTemp220)) > this.fRec327[<i32>(1)]) ? fSlow191 : fSlow189);
        this.fRec327[<i32>(0)] = ((this.fRec327[<i32>(1)] * fTemp221) - (fSlow108 * (fTemp220 * (<f32>(1.0) - fTemp221))));
        const fTemp222: f32 = min<f32>(this.fRec306[<i32>(0)], this.fRec327[<i32>(0)]);
        const fTemp223: f32 = (this.fRec306[<i32>(0)] + (fSlow192 * (fTemp222 - this.fRec306[<i32>(0)])));
        this.fVbargraph9 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp223));
        const fTemp224: f32 = Mathf.pow(<f32>(1e+01), (<f32>(0.008333334) * fTemp223));
        const fTemp225: f32 = Mathf.sqrt(fTemp224);
        const fTemp226: f32 = (this.fRec301[<i32>(1)] + (fSlow107 * ((fTemp182 - this.fRec302[<i32>(1)]) / fTemp225)));
        const fTemp227: f32 = (fSlow107 / fTemp225);
        const fTemp228: f32 = ((fSlow107 * ((fTemp227 + <f32>(2.0)) / fTemp225)) + <f32>(1.0));
        const fTemp229: f32 = (fTemp226 / fTemp228);
        this.fRec301[<i32>(0)] = ((<f32>(2.0) * fTemp229) - this.fRec301[<i32>(1)]);
        const fTemp230: f32 = (this.fRec302[<i32>(1)] + (fSlow107 * (fTemp226 / (fTemp225 * fTemp228))));
        this.fRec302[<i32>(0)] = ((<f32>(2.0) * fTemp230) - this.fRec302[<i32>(1)]);
        const fRec303: f32 = fTemp182;
        const fRec304: f32 = fTemp229;
        const fRec305: f32 = fTemp230;
        const fTemp231: f32 = (fTemp224 + <f32>(-1.0));
        const fTemp232: f32 = (Mathf.pow(fTemp224, <f32>(2.0)) + <f32>(-1.0));
        const fTemp233: f32 = ((fRec303 + (<f32>(2.0) * (fRec304 * fTemp231))) + (fRec305 * fTemp232));
        const fTemp234: f32 = (this.fRec296[<i32>(1)] + (fSlow107 * ((fTemp233 - this.fRec297[<i32>(1)]) / fTemp225)));
        const fTemp235: f32 = ((fSlow107 * ((fTemp227 + <f32>(1.4144272)) / fTemp225)) + <f32>(1.0));
        const fTemp236: f32 = (fTemp234 / fTemp235);
        this.fRec296[<i32>(0)] = ((<f32>(2.0) * fTemp236) - this.fRec296[<i32>(1)]);
        const fTemp237: f32 = (this.fRec297[<i32>(1)] + (fSlow107 * (fTemp234 / (fTemp225 * fTemp235))));
        this.fRec297[<i32>(0)] = ((<f32>(2.0) * fTemp237) - this.fRec297[<i32>(1)]);
        const fRec298: f32 = fTemp233;
        const fRec299: f32 = fTemp236;
        const fRec300: f32 = fTemp237;
        const fTemp238: f32 = ((fRec298 + (<f32>(1.4144272) * (fRec299 * fTemp231))) + (fRec300 * fTemp232));
        const fTemp239: f32 = (this.fRec291[<i32>(1)] + (fSlow107 * ((fTemp238 - this.fRec292[<i32>(1)]) / fTemp225)));
        const fTemp240: f32 = ((fSlow107 * ((fTemp227 + <f32>(0.5)) / fTemp225)) + <f32>(1.0));
        const fTemp241: f32 = (fTemp239 / fTemp240);
        this.fRec291[<i32>(0)] = ((<f32>(2.0) * fTemp241) - this.fRec291[<i32>(1)]);
        const fTemp242: f32 = (this.fRec292[<i32>(1)] + (fSlow107 * (fTemp239 / (fTemp225 * fTemp240))));
        this.fRec292[<i32>(0)] = ((<f32>(2.0) * fTemp242) - this.fRec292[<i32>(1)]);
        const fRec293: f32 = fTemp238;
        const fRec294: f32 = fTemp241;
        const fRec295: f32 = fTemp242;
        const fTemp243: f32 = ((fRec293 + (<f32>(0.5) * (fRec294 * fTemp231))) + (fRec295 * fTemp232));
        this.fRec350[<i32>(0)] = ((fSlow196 * (this.fRec309[<i32>(2)] + (this.fRec309[<i32>(0)] - fTemp205))) - (fSlow113 * ((fSlow179 * this.fRec350[<i32>(2)]) + (fSlow178 * this.fRec350[<i32>(1)]))));
        this.fRec349[<i32>(0)] = ((fSlow195 * (this.fRec350[<i32>(2)] + (this.fRec350[<i32>(0)] - (<f32>(2.0) * this.fRec350[<i32>(1)])))) - (fSlow111 * ((fSlow180 * this.fRec349[<i32>(2)]) + (fSlow178 * this.fRec349[<i32>(1)]))));
        const fTemp244: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow194 * (this.fRec349[<i32>(2)] + (this.fRec349[<i32>(0)] - (<f32>(2.0) * this.fRec349[<i32>(1)]))))))));
        const iTemp245: i32 = (<i32>(fTemp244 > fSlow202) + <i32>(fTemp244 > fSlow203));
        const fTemp246: f32 = (fTemp244 - fSlow198);
        const fTemp247: f32 = max<f32>(<f32>(0.0), ((iTemp245 == <i32>(0)) ? <f32>(0.0) : ((iTemp245 == <i32>(1)) ? (fSlow204 * Mathf.pow((fSlow201 + fTemp246), <f32>(2.0))) : fTemp246)));
        const fTemp248: f32 = ((-((fSlow193 * fTemp247)) > this.fRec348[<i32>(1)]) ? fSlow210 : fSlow207);
        this.fRec348[<i32>(0)] = ((this.fRec348[<i32>(1)] * fTemp248) - (fSlow193 * (fTemp247 * (<f32>(1.0) - fTemp248))));
        this.fRec353[<i32>(0)] = ((fSlow196 * (this.fRec330[<i32>(2)] + (this.fRec330[<i32>(0)] - fTemp216))) - (fSlow113 * ((fSlow179 * this.fRec353[<i32>(2)]) + (fSlow178 * this.fRec353[<i32>(1)]))));
        this.fRec352[<i32>(0)] = ((fSlow195 * (this.fRec353[<i32>(2)] + (this.fRec353[<i32>(0)] - (<f32>(2.0) * this.fRec353[<i32>(1)])))) - (fSlow111 * ((fSlow180 * this.fRec352[<i32>(2)]) + (fSlow178 * this.fRec352[<i32>(1)]))));
        const fTemp249: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow194 * (this.fRec352[<i32>(2)] + (this.fRec352[<i32>(0)] - (<f32>(2.0) * this.fRec352[<i32>(1)]))))))));
        const iTemp250: i32 = (<i32>(fTemp249 > fSlow202) + <i32>(fTemp249 > fSlow203));
        const fTemp251: f32 = (fTemp249 - fSlow198);
        const fTemp252: f32 = max<f32>(<f32>(0.0), ((iTemp250 == <i32>(0)) ? <f32>(0.0) : ((iTemp250 == <i32>(1)) ? (fSlow204 * Mathf.pow((fSlow201 + fTemp251), <f32>(2.0))) : fTemp251)));
        const fTemp253: f32 = ((-((fSlow193 * fTemp252)) > this.fRec351[<i32>(1)]) ? fSlow210 : fSlow207);
        this.fRec351[<i32>(0)] = ((this.fRec351[<i32>(1)] * fTemp253) - (fSlow193 * (fTemp252 * (<f32>(1.0) - fTemp253))));
        const fTemp254: f32 = min<f32>(this.fRec348[<i32>(0)], this.fRec351[<i32>(0)]);
        const fTemp255: f32 = (this.fRec348[<i32>(0)] + (fSlow211 * (fTemp254 - this.fRec348[<i32>(0)])));
        this.fVbargraph10 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp255));
        const fTemp256: f32 = (<f32>(0.008333334) * fTemp255);
        const fTemp257: f32 = Mathf.pow(<f32>(1e+01), -fTemp256);
        const fTemp258: f32 = Mathf.sqrt(fTemp257);
        const fTemp259: f32 = (this.fRec286[<i32>(1)] + (fSlow107 * ((fTemp243 - this.fRec287[<i32>(1)]) / fTemp258)));
        const fTemp260: f32 = (fSlow107 / fTemp258);
        const fTemp261: f32 = ((fSlow107 * ((fTemp260 + <f32>(2.0)) / fTemp258)) + <f32>(1.0));
        const fTemp262: f32 = (fTemp259 / fTemp261);
        this.fRec286[<i32>(0)] = ((<f32>(2.0) * fTemp262) - this.fRec286[<i32>(1)]);
        const fTemp263: f32 = (this.fRec287[<i32>(1)] + (fSlow107 * (fTemp259 / (fTemp258 * fTemp261))));
        this.fRec287[<i32>(0)] = ((<f32>(2.0) * fTemp263) - this.fRec287[<i32>(1)]);
        const fRec288: f32 = fTemp243;
        const fRec289: f32 = fTemp262;
        const fRec290: f32 = fTemp263;
        const fTemp264: f32 = (fTemp257 + <f32>(-1.0));
        const fTemp265: f32 = (Mathf.pow(fTemp257, <f32>(2.0)) + <f32>(-1.0));
        const fTemp266: f32 = ((fRec288 + (<f32>(2.0) * (fRec289 * fTemp264))) + (fRec290 * fTemp265));
        const fTemp267: f32 = (this.fRec281[<i32>(1)] + (fSlow107 * ((fTemp266 - this.fRec282[<i32>(1)]) / fTemp258)));
        const fTemp268: f32 = ((fSlow107 * ((fTemp260 + <f32>(1.4144272)) / fTemp258)) + <f32>(1.0));
        const fTemp269: f32 = (fTemp267 / fTemp268);
        this.fRec281[<i32>(0)] = ((<f32>(2.0) * fTemp269) - this.fRec281[<i32>(1)]);
        const fTemp270: f32 = (this.fRec282[<i32>(1)] + (fSlow107 * (fTemp267 / (fTemp258 * fTemp268))));
        this.fRec282[<i32>(0)] = ((<f32>(2.0) * fTemp270) - this.fRec282[<i32>(1)]);
        const fRec283: f32 = fTemp266;
        const fRec284: f32 = fTemp269;
        const fRec285: f32 = fTemp270;
        const fTemp271: f32 = ((fRec283 + (<f32>(1.4144272) * (fRec284 * fTemp264))) + (fRec285 * fTemp265));
        const fTemp272: f32 = (this.fRec276[<i32>(1)] + (fSlow107 * ((fTemp271 - this.fRec277[<i32>(1)]) / fTemp258)));
        const fTemp273: f32 = ((fSlow107 * ((fTemp260 + <f32>(0.5)) / fTemp258)) + <f32>(1.0));
        const fTemp274: f32 = (fTemp272 / fTemp273);
        this.fRec276[<i32>(0)] = ((<f32>(2.0) * fTemp274) - this.fRec276[<i32>(1)]);
        const fTemp275: f32 = (this.fRec277[<i32>(1)] + (fSlow107 * (fTemp272 / (fTemp258 * fTemp273))));
        this.fRec277[<i32>(0)] = ((<f32>(2.0) * fTemp275) - this.fRec277[<i32>(1)]);
        const fRec278: f32 = fTemp271;
        const fRec279: f32 = fTemp274;
        const fRec280: f32 = fTemp275;
        const fTemp276: f32 = ((fRec278 + (<f32>(0.5) * (fRec279 * fTemp264))) + (fRec280 * fTemp265));
        const fTemp277: f32 = Mathf.pow(<f32>(1e+01), fTemp256);
        const fTemp278: f32 = Mathf.sqrt(fTemp277);
        const fTemp279: f32 = (this.fRec271[<i32>(1)] + (fSlow106 * ((fTemp276 - this.fRec272[<i32>(1)]) / fTemp278)));
        const fTemp280: f32 = (fSlow106 / fTemp278);
        const fTemp281: f32 = ((fSlow106 * ((fTemp280 + <f32>(2.0)) / fTemp278)) + <f32>(1.0));
        const fTemp282: f32 = (fTemp279 / fTemp281);
        this.fRec271[<i32>(0)] = ((<f32>(2.0) * fTemp282) - this.fRec271[<i32>(1)]);
        const fTemp283: f32 = (this.fRec272[<i32>(1)] + (fSlow106 * (fTemp279 / (fTemp278 * fTemp281))));
        this.fRec272[<i32>(0)] = ((<f32>(2.0) * fTemp283) - this.fRec272[<i32>(1)]);
        const fRec273: f32 = fTemp276;
        const fRec274: f32 = fTemp282;
        const fRec275: f32 = fTemp283;
        const fTemp284: f32 = (fTemp277 + <f32>(-1.0));
        const fTemp285: f32 = (Mathf.pow(fTemp277, <f32>(2.0)) + <f32>(-1.0));
        const fTemp286: f32 = ((fRec273 + (<f32>(2.0) * (fRec274 * fTemp284))) + (fRec275 * fTemp285));
        const fTemp287: f32 = (this.fRec266[<i32>(1)] + (fSlow106 * ((fTemp286 - this.fRec267[<i32>(1)]) / fTemp278)));
        const fTemp288: f32 = ((fSlow106 * ((fTemp280 + <f32>(1.4144272)) / fTemp278)) + <f32>(1.0));
        const fTemp289: f32 = (fTemp287 / fTemp288);
        this.fRec266[<i32>(0)] = ((<f32>(2.0) * fTemp289) - this.fRec266[<i32>(1)]);
        const fTemp290: f32 = (this.fRec267[<i32>(1)] + (fSlow106 * (fTemp287 / (fTemp278 * fTemp288))));
        this.fRec267[<i32>(0)] = ((<f32>(2.0) * fTemp290) - this.fRec267[<i32>(1)]);
        const fRec268: f32 = fTemp286;
        const fRec269: f32 = fTemp289;
        const fRec270: f32 = fTemp290;
        const fTemp291: f32 = ((fRec268 + (<f32>(1.4144272) * (fRec269 * fTemp284))) + (fRec270 * fTemp285));
        const fTemp292: f32 = (this.fRec261[<i32>(1)] + (fSlow106 * ((fTemp291 - this.fRec262[<i32>(1)]) / fTemp278)));
        const fTemp293: f32 = ((fSlow106 * ((fTemp280 + <f32>(0.5)) / fTemp278)) + <f32>(1.0));
        const fTemp294: f32 = (fTemp292 / fTemp293);
        this.fRec261[<i32>(0)] = ((<f32>(2.0) * fTemp294) - this.fRec261[<i32>(1)]);
        const fTemp295: f32 = (this.fRec262[<i32>(1)] + (fSlow106 * (fTemp292 / (fTemp278 * fTemp293))));
        this.fRec262[<i32>(0)] = ((<f32>(2.0) * fTemp295) - this.fRec262[<i32>(1)]);
        const fRec263: f32 = fTemp291;
        const fRec264: f32 = fTemp294;
        const fRec265: f32 = fTemp295;
        const fTemp296: f32 = ((fRec263 + (<f32>(0.5) * (fRec264 * fTemp284))) + (fRec265 * fTemp285));
        this.fRec356[<i32>(0)] = ((fSlow215 * (this.fRec312[<i32>(2)] + (this.fRec312[<i32>(0)] - fTemp204))) - (fSlow120 * ((fSlow174 * this.fRec356[<i32>(2)]) + (fSlow173 * this.fRec356[<i32>(1)]))));
        this.fRec355[<i32>(0)] = ((fSlow214 * (this.fRec356[<i32>(2)] + (this.fRec356[<i32>(0)] - (<f32>(2.0) * this.fRec356[<i32>(1)])))) - (fSlow118 * ((fSlow175 * this.fRec355[<i32>(2)]) + (fSlow173 * this.fRec355[<i32>(1)]))));
        const fTemp297: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow213 * (this.fRec355[<i32>(2)] + (this.fRec355[<i32>(0)] - (<f32>(2.0) * this.fRec355[<i32>(1)]))))))));
        const iTemp298: i32 = (<i32>(fTemp297 > fSlow219) + <i32>(fTemp297 > fSlow220));
        const fTemp299: f32 = (fTemp297 - fSlow216);
        const fTemp300: f32 = max<f32>(<f32>(0.0), ((iTemp298 == <i32>(0)) ? <f32>(0.0) : ((iTemp298 == <i32>(1)) ? (fSlow221 * Mathf.pow((fSlow218 + fTemp299), <f32>(2.0))) : fTemp299)));
        const fTemp301: f32 = ((-((fSlow212 * fTemp300)) > this.fRec354[<i32>(1)]) ? fSlow227 : fSlow224);
        this.fRec354[<i32>(0)] = ((this.fRec354[<i32>(1)] * fTemp301) - (fSlow212 * (fTemp300 * (<f32>(1.0) - fTemp301))));
        this.fRec359[<i32>(0)] = ((fSlow215 * (this.fRec333[<i32>(2)] + (this.fRec333[<i32>(0)] - fTemp215))) - (fSlow120 * ((fSlow174 * this.fRec359[<i32>(2)]) + (fSlow173 * this.fRec359[<i32>(1)]))));
        this.fRec358[<i32>(0)] = ((fSlow214 * (this.fRec359[<i32>(2)] + (this.fRec359[<i32>(0)] - (<f32>(2.0) * this.fRec359[<i32>(1)])))) - (fSlow118 * ((fSlow175 * this.fRec358[<i32>(2)]) + (fSlow173 * this.fRec358[<i32>(1)]))));
        const fTemp302: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow213 * (this.fRec358[<i32>(2)] + (this.fRec358[<i32>(0)] - (<f32>(2.0) * this.fRec358[<i32>(1)]))))))));
        const iTemp303: i32 = (<i32>(fTemp302 > fSlow219) + <i32>(fTemp302 > fSlow220));
        const fTemp304: f32 = (fTemp302 - fSlow216);
        const fTemp305: f32 = max<f32>(<f32>(0.0), ((iTemp303 == <i32>(0)) ? <f32>(0.0) : ((iTemp303 == <i32>(1)) ? (fSlow221 * Mathf.pow((fSlow218 + fTemp304), <f32>(2.0))) : fTemp304)));
        const fTemp306: f32 = ((-((fSlow212 * fTemp305)) > this.fRec357[<i32>(1)]) ? fSlow227 : fSlow224);
        this.fRec357[<i32>(0)] = ((this.fRec357[<i32>(1)] * fTemp306) - (fSlow212 * (fTemp305 * (<f32>(1.0) - fTemp306))));
        const fTemp307: f32 = min<f32>(this.fRec354[<i32>(0)], this.fRec357[<i32>(0)]);
        const fTemp308: f32 = (this.fRec354[<i32>(0)] + (fSlow228 * (fTemp307 - this.fRec354[<i32>(0)])));
        this.fVbargraph11 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp308));
        const fTemp309: f32 = (<f32>(0.008333334) * fTemp308);
        const fTemp310: f32 = Mathf.pow(<f32>(1e+01), -fTemp309);
        const fTemp311: f32 = Mathf.sqrt(fTemp310);
        const fTemp312: f32 = (this.fRec256[<i32>(1)] + (fSlow106 * ((fTemp296 - this.fRec257[<i32>(1)]) / fTemp311)));
        const fTemp313: f32 = (fSlow106 / fTemp311);
        const fTemp314: f32 = ((fSlow106 * ((fTemp313 + <f32>(2.0)) / fTemp311)) + <f32>(1.0));
        const fTemp315: f32 = (fTemp312 / fTemp314);
        this.fRec256[<i32>(0)] = ((<f32>(2.0) * fTemp315) - this.fRec256[<i32>(1)]);
        const fTemp316: f32 = (this.fRec257[<i32>(1)] + (fSlow106 * (fTemp312 / (fTemp311 * fTemp314))));
        this.fRec257[<i32>(0)] = ((<f32>(2.0) * fTemp316) - this.fRec257[<i32>(1)]);
        const fRec258: f32 = fTemp296;
        const fRec259: f32 = fTemp315;
        const fRec260: f32 = fTemp316;
        const fTemp317: f32 = (fTemp310 + <f32>(-1.0));
        const fTemp318: f32 = (Mathf.pow(fTemp310, <f32>(2.0)) + <f32>(-1.0));
        const fTemp319: f32 = ((fRec258 + (<f32>(2.0) * (fRec259 * fTemp317))) + (fRec260 * fTemp318));
        const fTemp320: f32 = (this.fRec251[<i32>(1)] + (fSlow106 * ((fTemp319 - this.fRec252[<i32>(1)]) / fTemp311)));
        const fTemp321: f32 = ((fSlow106 * ((fTemp313 + <f32>(1.4144272)) / fTemp311)) + <f32>(1.0));
        const fTemp322: f32 = (fTemp320 / fTemp321);
        this.fRec251[<i32>(0)] = ((<f32>(2.0) * fTemp322) - this.fRec251[<i32>(1)]);
        const fTemp323: f32 = (this.fRec252[<i32>(1)] + (fSlow106 * (fTemp320 / (fTemp311 * fTemp321))));
        this.fRec252[<i32>(0)] = ((<f32>(2.0) * fTemp323) - this.fRec252[<i32>(1)]);
        const fRec253: f32 = fTemp319;
        const fRec254: f32 = fTemp322;
        const fRec255: f32 = fTemp323;
        const fTemp324: f32 = ((fRec253 + (<f32>(1.4144272) * (fRec254 * fTemp317))) + (fRec255 * fTemp318));
        const fTemp325: f32 = (this.fRec246[<i32>(1)] + (fSlow106 * ((fTemp324 - this.fRec247[<i32>(1)]) / fTemp311)));
        const fTemp326: f32 = ((fSlow106 * ((fTemp313 + <f32>(0.5)) / fTemp311)) + <f32>(1.0));
        const fTemp327: f32 = (fTemp325 / fTemp326);
        this.fRec246[<i32>(0)] = ((<f32>(2.0) * fTemp327) - this.fRec246[<i32>(1)]);
        const fTemp328: f32 = (this.fRec247[<i32>(1)] + (fSlow106 * (fTemp325 / (fTemp311 * fTemp326))));
        this.fRec247[<i32>(0)] = ((<f32>(2.0) * fTemp328) - this.fRec247[<i32>(1)]);
        const fRec248: f32 = fTemp324;
        const fRec249: f32 = fTemp327;
        const fRec250: f32 = fTemp328;
        const fTemp329: f32 = ((fRec248 + (<f32>(0.5) * (fRec249 * fTemp317))) + (fRec250 * fTemp318));
        const fTemp330: f32 = Mathf.pow(<f32>(1e+01), fTemp309);
        const fTemp331: f32 = Mathf.sqrt(fTemp330);
        const fTemp332: f32 = (this.fRec241[<i32>(1)] + (fSlow105 * ((fTemp329 - this.fRec242[<i32>(1)]) / fTemp331)));
        const fTemp333: f32 = (fSlow105 / fTemp331);
        const fTemp334: f32 = ((fSlow105 * ((fTemp333 + <f32>(2.0)) / fTemp331)) + <f32>(1.0));
        const fTemp335: f32 = (fTemp332 / fTemp334);
        this.fRec241[<i32>(0)] = ((<f32>(2.0) * fTemp335) - this.fRec241[<i32>(1)]);
        const fTemp336: f32 = (this.fRec242[<i32>(1)] + (fSlow105 * (fTemp332 / (fTemp331 * fTemp334))));
        this.fRec242[<i32>(0)] = ((<f32>(2.0) * fTemp336) - this.fRec242[<i32>(1)]);
        const fRec243: f32 = fTemp329;
        const fRec244: f32 = fTemp335;
        const fRec245: f32 = fTemp336;
        const fTemp337: f32 = (fTemp330 + <f32>(-1.0));
        const fTemp338: f32 = (Mathf.pow(fTemp330, <f32>(2.0)) + <f32>(-1.0));
        const fTemp339: f32 = ((fRec243 + (<f32>(2.0) * (fRec244 * fTemp337))) + (fRec245 * fTemp338));
        const fTemp340: f32 = (this.fRec236[<i32>(1)] + (fSlow105 * ((fTemp339 - this.fRec237[<i32>(1)]) / fTemp331)));
        const fTemp341: f32 = ((fSlow105 * ((fTemp333 + <f32>(1.4144272)) / fTemp331)) + <f32>(1.0));
        const fTemp342: f32 = (fTemp340 / fTemp341);
        this.fRec236[<i32>(0)] = ((<f32>(2.0) * fTemp342) - this.fRec236[<i32>(1)]);
        const fTemp343: f32 = (this.fRec237[<i32>(1)] + (fSlow105 * (fTemp340 / (fTemp331 * fTemp341))));
        this.fRec237[<i32>(0)] = ((<f32>(2.0) * fTemp343) - this.fRec237[<i32>(1)]);
        const fRec238: f32 = fTemp339;
        const fRec239: f32 = fTemp342;
        const fRec240: f32 = fTemp343;
        const fTemp344: f32 = ((fRec238 + (<f32>(1.4144272) * (fRec239 * fTemp337))) + (fRec240 * fTemp338));
        const fTemp345: f32 = (this.fRec231[<i32>(1)] + (fSlow105 * ((fTemp344 - this.fRec232[<i32>(1)]) / fTemp331)));
        const fTemp346: f32 = ((fSlow105 * ((fTemp333 + <f32>(0.5)) / fTemp331)) + <f32>(1.0));
        const fTemp347: f32 = (fTemp345 / fTemp346);
        this.fRec231[<i32>(0)] = ((<f32>(2.0) * fTemp347) - this.fRec231[<i32>(1)]);
        const fTemp348: f32 = (this.fRec232[<i32>(1)] + (fSlow105 * (fTemp345 / (fTemp331 * fTemp346))));
        this.fRec232[<i32>(0)] = ((<f32>(2.0) * fTemp348) - this.fRec232[<i32>(1)]);
        const fRec233: f32 = fTemp344;
        const fRec234: f32 = fTemp347;
        const fRec235: f32 = fTemp348;
        const fTemp349: f32 = ((fRec233 + (<f32>(0.5) * (fRec234 * fTemp337))) + (fRec235 * fTemp338));
        this.fRec362[<i32>(0)] = ((fSlow232 * (this.fRec315[<i32>(2)] + (this.fRec315[<i32>(0)] - fTemp203))) - (fSlow127 * ((fSlow169 * this.fRec362[<i32>(2)]) + (fSlow168 * this.fRec362[<i32>(1)]))));
        this.fRec361[<i32>(0)] = ((fSlow231 * (this.fRec362[<i32>(2)] + (this.fRec362[<i32>(0)] - (<f32>(2.0) * this.fRec362[<i32>(1)])))) - (fSlow125 * ((fSlow170 * this.fRec361[<i32>(2)]) + (fSlow168 * this.fRec361[<i32>(1)]))));
        const fTemp350: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow230 * (this.fRec361[<i32>(2)] + (this.fRec361[<i32>(0)] - (<f32>(2.0) * this.fRec361[<i32>(1)]))))))));
        const iTemp351: i32 = (<i32>(fTemp350 > fSlow236) + <i32>(fTemp350 > fSlow237));
        const fTemp352: f32 = (fTemp350 - fSlow233);
        const fTemp353: f32 = max<f32>(<f32>(0.0), ((iTemp351 == <i32>(0)) ? <f32>(0.0) : ((iTemp351 == <i32>(1)) ? (fSlow238 * Mathf.pow((fSlow235 + fTemp352), <f32>(2.0))) : fTemp352)));
        const fTemp354: f32 = ((-((fSlow229 * fTemp353)) > this.fRec360[<i32>(1)]) ? fSlow244 : fSlow241);
        this.fRec360[<i32>(0)] = ((this.fRec360[<i32>(1)] * fTemp354) - (fSlow229 * (fTemp353 * (<f32>(1.0) - fTemp354))));
        this.fRec365[<i32>(0)] = ((fSlow232 * (this.fRec336[<i32>(2)] + (this.fRec336[<i32>(0)] - fTemp214))) - (fSlow127 * ((fSlow169 * this.fRec365[<i32>(2)]) + (fSlow168 * this.fRec365[<i32>(1)]))));
        this.fRec364[<i32>(0)] = ((fSlow231 * (this.fRec365[<i32>(2)] + (this.fRec365[<i32>(0)] - (<f32>(2.0) * this.fRec365[<i32>(1)])))) - (fSlow125 * ((fSlow170 * this.fRec364[<i32>(2)]) + (fSlow168 * this.fRec364[<i32>(1)]))));
        const fTemp355: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow230 * (this.fRec364[<i32>(2)] + (this.fRec364[<i32>(0)] - (<f32>(2.0) * this.fRec364[<i32>(1)]))))))));
        const iTemp356: i32 = (<i32>(fTemp355 > fSlow236) + <i32>(fTemp355 > fSlow237));
        const fTemp357: f32 = (fTemp355 - fSlow233);
        const fTemp358: f32 = max<f32>(<f32>(0.0), ((iTemp356 == <i32>(0)) ? <f32>(0.0) : ((iTemp356 == <i32>(1)) ? (fSlow238 * Mathf.pow((fSlow235 + fTemp357), <f32>(2.0))) : fTemp357)));
        const fTemp359: f32 = ((-((fSlow229 * fTemp358)) > this.fRec363[<i32>(1)]) ? fSlow244 : fSlow241);
        this.fRec363[<i32>(0)] = ((this.fRec363[<i32>(1)] * fTemp359) - (fSlow229 * (fTemp358 * (<f32>(1.0) - fTemp359))));
        const fTemp360: f32 = min<f32>(this.fRec360[<i32>(0)], this.fRec363[<i32>(0)]);
        const fTemp361: f32 = (this.fRec360[<i32>(0)] + (fSlow245 * (fTemp360 - this.fRec360[<i32>(0)])));
        this.fVbargraph12 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp361));
        const fTemp362: f32 = (<f32>(0.008333334) * fTemp361);
        const fTemp363: f32 = Mathf.pow(<f32>(1e+01), -fTemp362);
        const fTemp364: f32 = Mathf.sqrt(fTemp363);
        const fTemp365: f32 = (this.fRec226[<i32>(1)] + (fSlow105 * ((fTemp349 - this.fRec227[<i32>(1)]) / fTemp364)));
        const fTemp366: f32 = (fSlow105 / fTemp364);
        const fTemp367: f32 = ((fSlow105 * ((fTemp366 + <f32>(2.0)) / fTemp364)) + <f32>(1.0));
        const fTemp368: f32 = (fTemp365 / fTemp367);
        this.fRec226[<i32>(0)] = ((<f32>(2.0) * fTemp368) - this.fRec226[<i32>(1)]);
        const fTemp369: f32 = (this.fRec227[<i32>(1)] + (fSlow105 * (fTemp365 / (fTemp364 * fTemp367))));
        this.fRec227[<i32>(0)] = ((<f32>(2.0) * fTemp369) - this.fRec227[<i32>(1)]);
        const fRec228: f32 = fTemp349;
        const fRec229: f32 = fTemp368;
        const fRec230: f32 = fTemp369;
        const fTemp370: f32 = (fTemp363 + <f32>(-1.0));
        const fTemp371: f32 = (Mathf.pow(fTemp363, <f32>(2.0)) + <f32>(-1.0));
        const fTemp372: f32 = ((fRec228 + (<f32>(2.0) * (fRec229 * fTemp370))) + (fRec230 * fTemp371));
        const fTemp373: f32 = (this.fRec221[<i32>(1)] + (fSlow105 * ((fTemp372 - this.fRec222[<i32>(1)]) / fTemp364)));
        const fTemp374: f32 = ((fSlow105 * ((fTemp366 + <f32>(1.4144272)) / fTemp364)) + <f32>(1.0));
        const fTemp375: f32 = (fTemp373 / fTemp374);
        this.fRec221[<i32>(0)] = ((<f32>(2.0) * fTemp375) - this.fRec221[<i32>(1)]);
        const fTemp376: f32 = (this.fRec222[<i32>(1)] + (fSlow105 * (fTemp373 / (fTemp364 * fTemp374))));
        this.fRec222[<i32>(0)] = ((<f32>(2.0) * fTemp376) - this.fRec222[<i32>(1)]);
        const fRec223: f32 = fTemp372;
        const fRec224: f32 = fTemp375;
        const fRec225: f32 = fTemp376;
        const fTemp377: f32 = ((fRec223 + (<f32>(1.4144272) * (fRec224 * fTemp370))) + (fRec225 * fTemp371));
        const fTemp378: f32 = (this.fRec216[<i32>(1)] + (fSlow105 * ((fTemp377 - this.fRec217[<i32>(1)]) / fTemp364)));
        const fTemp379: f32 = ((fSlow105 * ((fTemp366 + <f32>(0.5)) / fTemp364)) + <f32>(1.0));
        const fTemp380: f32 = (fTemp378 / fTemp379);
        this.fRec216[<i32>(0)] = ((<f32>(2.0) * fTemp380) - this.fRec216[<i32>(1)]);
        const fTemp381: f32 = (this.fRec217[<i32>(1)] + (fSlow105 * (fTemp378 / (fTemp364 * fTemp379))));
        this.fRec217[<i32>(0)] = ((<f32>(2.0) * fTemp381) - this.fRec217[<i32>(1)]);
        const fRec218: f32 = fTemp377;
        const fRec219: f32 = fTemp380;
        const fRec220: f32 = fTemp381;
        const fTemp382: f32 = ((fRec218 + (<f32>(0.5) * (fRec219 * fTemp370))) + (fRec220 * fTemp371));
        const fTemp383: f32 = Mathf.pow(<f32>(1e+01), fTemp362);
        const fTemp384: f32 = Mathf.sqrt(fTemp383);
        const fTemp385: f32 = (this.fRec211[<i32>(1)] + (fSlow104 * ((fTemp382 - this.fRec212[<i32>(1)]) / fTemp384)));
        const fTemp386: f32 = (fSlow104 / fTemp384);
        const fTemp387: f32 = ((fSlow104 * ((fTemp386 + <f32>(2.0)) / fTemp384)) + <f32>(1.0));
        const fTemp388: f32 = (fTemp385 / fTemp387);
        this.fRec211[<i32>(0)] = ((<f32>(2.0) * fTemp388) - this.fRec211[<i32>(1)]);
        const fTemp389: f32 = (this.fRec212[<i32>(1)] + (fSlow104 * (fTemp385 / (fTemp384 * fTemp387))));
        this.fRec212[<i32>(0)] = ((<f32>(2.0) * fTemp389) - this.fRec212[<i32>(1)]);
        const fRec213: f32 = fTemp382;
        const fRec214: f32 = fTemp388;
        const fRec215: f32 = fTemp389;
        const fTemp390: f32 = (fTemp383 + <f32>(-1.0));
        const fTemp391: f32 = (Mathf.pow(fTemp383, <f32>(2.0)) + <f32>(-1.0));
        const fTemp392: f32 = ((fRec213 + (<f32>(2.0) * (fRec214 * fTemp390))) + (fRec215 * fTemp391));
        const fTemp393: f32 = (this.fRec206[<i32>(1)] + (fSlow104 * ((fTemp392 - this.fRec207[<i32>(1)]) / fTemp384)));
        const fTemp394: f32 = ((fSlow104 * ((fTemp386 + <f32>(1.4144272)) / fTemp384)) + <f32>(1.0));
        const fTemp395: f32 = (fTemp393 / fTemp394);
        this.fRec206[<i32>(0)] = ((<f32>(2.0) * fTemp395) - this.fRec206[<i32>(1)]);
        const fTemp396: f32 = (this.fRec207[<i32>(1)] + (fSlow104 * (fTemp393 / (fTemp384 * fTemp394))));
        this.fRec207[<i32>(0)] = ((<f32>(2.0) * fTemp396) - this.fRec207[<i32>(1)]);
        const fRec208: f32 = fTemp392;
        const fRec209: f32 = fTemp395;
        const fRec210: f32 = fTemp396;
        const fTemp397: f32 = ((fRec208 + (<f32>(1.4144272) * (fRec209 * fTemp390))) + (fRec210 * fTemp391));
        const fTemp398: f32 = (this.fRec201[<i32>(1)] + (fSlow104 * ((fTemp397 - this.fRec202[<i32>(1)]) / fTemp384)));
        const fTemp399: f32 = ((fSlow104 * ((fTemp386 + <f32>(0.5)) / fTemp384)) + <f32>(1.0));
        const fTemp400: f32 = (fTemp398 / fTemp399);
        this.fRec201[<i32>(0)] = ((<f32>(2.0) * fTemp400) - this.fRec201[<i32>(1)]);
        const fTemp401: f32 = (this.fRec202[<i32>(1)] + (fSlow104 * (fTemp398 / (fTemp384 * fTemp399))));
        this.fRec202[<i32>(0)] = ((<f32>(2.0) * fTemp401) - this.fRec202[<i32>(1)]);
        const fRec203: f32 = fTemp397;
        const fRec204: f32 = fTemp400;
        const fRec205: f32 = fTemp401;
        const fTemp402: f32 = ((fRec203 + (<f32>(0.5) * (fRec204 * fTemp390))) + (fRec205 * fTemp391));
        this.fRec368[<i32>(0)] = ((fSlow249 * (this.fRec318[<i32>(2)] + (this.fRec318[<i32>(0)] - fTemp202))) - (fSlow134 * ((fSlow164 * this.fRec368[<i32>(2)]) + (fSlow163 * this.fRec368[<i32>(1)]))));
        this.fRec367[<i32>(0)] = ((fSlow248 * (this.fRec368[<i32>(2)] + (this.fRec368[<i32>(0)] - (<f32>(2.0) * this.fRec368[<i32>(1)])))) - (fSlow132 * ((fSlow165 * this.fRec367[<i32>(2)]) + (fSlow163 * this.fRec367[<i32>(1)]))));
        const fTemp403: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow247 * (this.fRec367[<i32>(2)] + (this.fRec367[<i32>(0)] - (<f32>(2.0) * this.fRec367[<i32>(1)]))))))));
        const iTemp404: i32 = (<i32>(fTemp403 > fSlow253) + <i32>(fTemp403 > fSlow254));
        const fTemp405: f32 = (fTemp403 - fSlow250);
        const fTemp406: f32 = max<f32>(<f32>(0.0), ((iTemp404 == <i32>(0)) ? <f32>(0.0) : ((iTemp404 == <i32>(1)) ? (fSlow255 * Mathf.pow((fSlow252 + fTemp405), <f32>(2.0))) : fTemp405)));
        const fTemp407: f32 = ((-((fSlow246 * fTemp406)) > this.fRec366[<i32>(1)]) ? fSlow261 : fSlow258);
        this.fRec366[<i32>(0)] = ((this.fRec366[<i32>(1)] * fTemp407) - (fSlow246 * (fTemp406 * (<f32>(1.0) - fTemp407))));
        this.fRec371[<i32>(0)] = ((fSlow249 * (this.fRec339[<i32>(2)] + (this.fRec339[<i32>(0)] - fTemp213))) - (fSlow134 * ((fSlow164 * this.fRec371[<i32>(2)]) + (fSlow163 * this.fRec371[<i32>(1)]))));
        this.fRec370[<i32>(0)] = ((fSlow248 * (this.fRec371[<i32>(2)] + (this.fRec371[<i32>(0)] - (<f32>(2.0) * this.fRec371[<i32>(1)])))) - (fSlow132 * ((fSlow165 * this.fRec370[<i32>(2)]) + (fSlow163 * this.fRec370[<i32>(1)]))));
        const fTemp408: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow247 * (this.fRec370[<i32>(2)] + (this.fRec370[<i32>(0)] - (<f32>(2.0) * this.fRec370[<i32>(1)]))))))));
        const iTemp409: i32 = (<i32>(fTemp408 > fSlow253) + <i32>(fTemp408 > fSlow254));
        const fTemp410: f32 = (fTemp408 - fSlow250);
        const fTemp411: f32 = max<f32>(<f32>(0.0), ((iTemp409 == <i32>(0)) ? <f32>(0.0) : ((iTemp409 == <i32>(1)) ? (fSlow255 * Mathf.pow((fSlow252 + fTemp410), <f32>(2.0))) : fTemp410)));
        const fTemp412: f32 = ((-((fSlow246 * fTemp411)) > this.fRec369[<i32>(1)]) ? fSlow261 : fSlow258);
        this.fRec369[<i32>(0)] = ((this.fRec369[<i32>(1)] * fTemp412) - (fSlow246 * (fTemp411 * (<f32>(1.0) - fTemp412))));
        const fTemp413: f32 = min<f32>(this.fRec366[<i32>(0)], this.fRec369[<i32>(0)]);
        const fTemp414: f32 = (this.fRec366[<i32>(0)] + (fSlow262 * (fTemp413 - this.fRec366[<i32>(0)])));
        this.fVbargraph13 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp414));
        const fTemp415: f32 = (<f32>(0.008333334) * fTemp414);
        const fTemp416: f32 = Mathf.pow(<f32>(1e+01), -fTemp415);
        const fTemp417: f32 = Mathf.sqrt(fTemp416);
        const fTemp418: f32 = (this.fRec196[<i32>(1)] + (fSlow104 * ((fTemp402 - this.fRec197[<i32>(1)]) / fTemp417)));
        const fTemp419: f32 = (fSlow104 / fTemp417);
        const fTemp420: f32 = ((fSlow104 * ((fTemp419 + <f32>(2.0)) / fTemp417)) + <f32>(1.0));
        const fTemp421: f32 = (fTemp418 / fTemp420);
        this.fRec196[<i32>(0)] = ((<f32>(2.0) * fTemp421) - this.fRec196[<i32>(1)]);
        const fTemp422: f32 = (this.fRec197[<i32>(1)] + (fSlow104 * (fTemp418 / (fTemp417 * fTemp420))));
        this.fRec197[<i32>(0)] = ((<f32>(2.0) * fTemp422) - this.fRec197[<i32>(1)]);
        const fRec198: f32 = fTemp402;
        const fRec199: f32 = fTemp421;
        const fRec200: f32 = fTemp422;
        const fTemp423: f32 = (fTemp416 + <f32>(-1.0));
        const fTemp424: f32 = (Mathf.pow(fTemp416, <f32>(2.0)) + <f32>(-1.0));
        const fTemp425: f32 = ((fRec198 + (<f32>(2.0) * (fRec199 * fTemp423))) + (fRec200 * fTemp424));
        const fTemp426: f32 = (this.fRec191[<i32>(1)] + (fSlow104 * ((fTemp425 - this.fRec192[<i32>(1)]) / fTemp417)));
        const fTemp427: f32 = ((fSlow104 * ((fTemp419 + <f32>(1.4144272)) / fTemp417)) + <f32>(1.0));
        const fTemp428: f32 = (fTemp426 / fTemp427);
        this.fRec191[<i32>(0)] = ((<f32>(2.0) * fTemp428) - this.fRec191[<i32>(1)]);
        const fTemp429: f32 = (this.fRec192[<i32>(1)] + (fSlow104 * (fTemp426 / (fTemp417 * fTemp427))));
        this.fRec192[<i32>(0)] = ((<f32>(2.0) * fTemp429) - this.fRec192[<i32>(1)]);
        const fRec193: f32 = fTemp425;
        const fRec194: f32 = fTemp428;
        const fRec195: f32 = fTemp429;
        const fTemp430: f32 = ((fRec193 + (<f32>(1.4144272) * (fRec194 * fTemp423))) + (fRec195 * fTemp424));
        const fTemp431: f32 = (this.fRec186[<i32>(1)] + (fSlow104 * ((fTemp430 - this.fRec187[<i32>(1)]) / fTemp417)));
        const fTemp432: f32 = ((fSlow104 * ((fTemp419 + <f32>(0.5)) / fTemp417)) + <f32>(1.0));
        const fTemp433: f32 = (fTemp431 / fTemp432);
        this.fRec186[<i32>(0)] = ((<f32>(2.0) * fTemp433) - this.fRec186[<i32>(1)]);
        const fTemp434: f32 = (this.fRec187[<i32>(1)] + (fSlow104 * (fTemp431 / (fTemp417 * fTemp432))));
        this.fRec187[<i32>(0)] = ((<f32>(2.0) * fTemp434) - this.fRec187[<i32>(1)]);
        const fRec188: f32 = fTemp430;
        const fRec189: f32 = fTemp433;
        const fRec190: f32 = fTemp434;
        const fTemp435: f32 = ((fRec188 + (<f32>(0.5) * (fRec189 * fTemp423))) + (fRec190 * fTemp424));
        const fTemp436: f32 = Mathf.pow(<f32>(1e+01), fTemp415);
        const fTemp437: f32 = Mathf.sqrt(fTemp436);
        const fTemp438: f32 = (this.fRec181[<i32>(1)] + (fSlow103 * ((fTemp435 - this.fRec182[<i32>(1)]) / fTemp437)));
        const fTemp439: f32 = (fSlow103 / fTemp437);
        const fTemp440: f32 = ((fSlow103 * ((fTemp439 + <f32>(2.0)) / fTemp437)) + <f32>(1.0));
        const fTemp441: f32 = (fTemp438 / fTemp440);
        this.fRec181[<i32>(0)] = ((<f32>(2.0) * fTemp441) - this.fRec181[<i32>(1)]);
        const fTemp442: f32 = (this.fRec182[<i32>(1)] + (fSlow103 * (fTemp438 / (fTemp437 * fTemp440))));
        this.fRec182[<i32>(0)] = ((<f32>(2.0) * fTemp442) - this.fRec182[<i32>(1)]);
        const fRec183: f32 = fTemp435;
        const fRec184: f32 = fTemp441;
        const fRec185: f32 = fTemp442;
        const fTemp443: f32 = (fTemp436 + <f32>(-1.0));
        const fTemp444: f32 = (Mathf.pow(fTemp436, <f32>(2.0)) + <f32>(-1.0));
        const fTemp445: f32 = ((fRec183 + (<f32>(2.0) * (fRec184 * fTemp443))) + (fRec185 * fTemp444));
        const fTemp446: f32 = (this.fRec176[<i32>(1)] + (fSlow103 * ((fTemp445 - this.fRec177[<i32>(1)]) / fTemp437)));
        const fTemp447: f32 = ((fSlow103 * ((fTemp439 + <f32>(1.4144272)) / fTemp437)) + <f32>(1.0));
        const fTemp448: f32 = (fTemp446 / fTemp447);
        this.fRec176[<i32>(0)] = ((<f32>(2.0) * fTemp448) - this.fRec176[<i32>(1)]);
        const fTemp449: f32 = (this.fRec177[<i32>(1)] + (fSlow103 * (fTemp446 / (fTemp437 * fTemp447))));
        this.fRec177[<i32>(0)] = ((<f32>(2.0) * fTemp449) - this.fRec177[<i32>(1)]);
        const fRec178: f32 = fTemp445;
        const fRec179: f32 = fTemp448;
        const fRec180: f32 = fTemp449;
        const fTemp450: f32 = ((fRec178 + (<f32>(1.4144272) * (fRec179 * fTemp443))) + (fRec180 * fTemp444));
        const fTemp451: f32 = (this.fRec171[<i32>(1)] + (fSlow103 * ((fTemp450 - this.fRec172[<i32>(1)]) / fTemp437)));
        const fTemp452: f32 = ((fSlow103 * ((fTemp439 + <f32>(0.5)) / fTemp437)) + <f32>(1.0));
        const fTemp453: f32 = (fTemp451 / fTemp452);
        this.fRec171[<i32>(0)] = ((<f32>(2.0) * fTemp453) - this.fRec171[<i32>(1)]);
        const fTemp454: f32 = (this.fRec172[<i32>(1)] + (fSlow103 * (fTemp451 / (fTemp437 * fTemp452))));
        this.fRec172[<i32>(0)] = ((<f32>(2.0) * fTemp454) - this.fRec172[<i32>(1)]);
        const fRec173: f32 = fTemp450;
        const fRec174: f32 = fTemp453;
        const fRec175: f32 = fTemp454;
        const fTemp455: f32 = ((fRec173 + (<f32>(0.5) * (fRec174 * fTemp443))) + (fRec175 * fTemp444));
        this.fRec374[<i32>(0)] = ((fSlow266 * (this.fRec321[<i32>(2)] + (this.fRec321[<i32>(0)] - fTemp201))) - (fSlow141 * ((fSlow159 * this.fRec374[<i32>(2)]) + (fSlow158 * this.fRec374[<i32>(1)]))));
        this.fRec373[<i32>(0)] = ((fSlow265 * (this.fRec374[<i32>(2)] + (this.fRec374[<i32>(0)] - (<f32>(2.0) * this.fRec374[<i32>(1)])))) - (fSlow139 * ((fSlow160 * this.fRec373[<i32>(2)]) + (fSlow158 * this.fRec373[<i32>(1)]))));
        const fTemp456: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow264 * (this.fRec373[<i32>(2)] + (this.fRec373[<i32>(0)] - (<f32>(2.0) * this.fRec373[<i32>(1)]))))))));
        const iTemp457: i32 = (<i32>(fTemp456 > fSlow270) + <i32>(fTemp456 > fSlow271));
        const fTemp458: f32 = (fTemp456 - fSlow267);
        const fTemp459: f32 = max<f32>(<f32>(0.0), ((iTemp457 == <i32>(0)) ? <f32>(0.0) : ((iTemp457 == <i32>(1)) ? (fSlow272 * Mathf.pow((fSlow269 + fTemp458), <f32>(2.0))) : fTemp458)));
        const fTemp460: f32 = ((-((fSlow263 * fTemp459)) > this.fRec372[<i32>(1)]) ? fSlow278 : fSlow275);
        this.fRec372[<i32>(0)] = ((this.fRec372[<i32>(1)] * fTemp460) - (fSlow263 * (fTemp459 * (<f32>(1.0) - fTemp460))));
        this.fRec377[<i32>(0)] = ((fSlow266 * (this.fRec342[<i32>(2)] + (this.fRec342[<i32>(0)] - fTemp212))) - (fSlow141 * ((fSlow159 * this.fRec377[<i32>(2)]) + (fSlow158 * this.fRec377[<i32>(1)]))));
        this.fRec376[<i32>(0)] = ((fSlow265 * (this.fRec377[<i32>(2)] + (this.fRec377[<i32>(0)] - (<f32>(2.0) * this.fRec377[<i32>(1)])))) - (fSlow139 * ((fSlow160 * this.fRec376[<i32>(2)]) + (fSlow158 * this.fRec376[<i32>(1)]))));
        const fTemp461: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow264 * (this.fRec376[<i32>(2)] + (this.fRec376[<i32>(0)] - (<f32>(2.0) * this.fRec376[<i32>(1)]))))))));
        const iTemp462: i32 = (<i32>(fTemp461 > fSlow270) + <i32>(fTemp461 > fSlow271));
        const fTemp463: f32 = (fTemp461 - fSlow267);
        const fTemp464: f32 = max<f32>(<f32>(0.0), ((iTemp462 == <i32>(0)) ? <f32>(0.0) : ((iTemp462 == <i32>(1)) ? (fSlow272 * Mathf.pow((fSlow269 + fTemp463), <f32>(2.0))) : fTemp463)));
        const fTemp465: f32 = ((-((fSlow263 * fTemp464)) > this.fRec375[<i32>(1)]) ? fSlow278 : fSlow275);
        this.fRec375[<i32>(0)] = ((this.fRec375[<i32>(1)] * fTemp465) - (fSlow263 * (fTemp464 * (<f32>(1.0) - fTemp465))));
        const fTemp466: f32 = min<f32>(this.fRec372[<i32>(0)], this.fRec375[<i32>(0)]);
        const fTemp467: f32 = (this.fRec372[<i32>(0)] + (fSlow279 * (fTemp466 - this.fRec372[<i32>(0)])));
        this.fVbargraph14 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp467));
        const fTemp468: f32 = (<f32>(0.008333334) * fTemp467);
        const fTemp469: f32 = Mathf.pow(<f32>(1e+01), -fTemp468);
        const fTemp470: f32 = Mathf.sqrt(fTemp469);
        const fTemp471: f32 = (this.fRec166[<i32>(1)] + (fSlow103 * ((fTemp455 - this.fRec167[<i32>(1)]) / fTemp470)));
        const fTemp472: f32 = (fSlow103 / fTemp470);
        const fTemp473: f32 = ((fSlow103 * ((fTemp472 + <f32>(2.0)) / fTemp470)) + <f32>(1.0));
        const fTemp474: f32 = (fTemp471 / fTemp473);
        this.fRec166[<i32>(0)] = ((<f32>(2.0) * fTemp474) - this.fRec166[<i32>(1)]);
        const fTemp475: f32 = (this.fRec167[<i32>(1)] + (fSlow103 * (fTemp471 / (fTemp470 * fTemp473))));
        this.fRec167[<i32>(0)] = ((<f32>(2.0) * fTemp475) - this.fRec167[<i32>(1)]);
        const fRec168: f32 = fTemp455;
        const fRec169: f32 = fTemp474;
        const fRec170: f32 = fTemp475;
        const fTemp476: f32 = (fTemp469 + <f32>(-1.0));
        const fTemp477: f32 = (Mathf.pow(fTemp469, <f32>(2.0)) + <f32>(-1.0));
        const fTemp478: f32 = ((fRec168 + (<f32>(2.0) * (fRec169 * fTemp476))) + (fRec170 * fTemp477));
        const fTemp479: f32 = (this.fRec161[<i32>(1)] + (fSlow103 * ((fTemp478 - this.fRec162[<i32>(1)]) / fTemp470)));
        const fTemp480: f32 = ((fSlow103 * ((fTemp472 + <f32>(1.4144272)) / fTemp470)) + <f32>(1.0));
        const fTemp481: f32 = (fTemp479 / fTemp480);
        this.fRec161[<i32>(0)] = ((<f32>(2.0) * fTemp481) - this.fRec161[<i32>(1)]);
        const fTemp482: f32 = (this.fRec162[<i32>(1)] + (fSlow103 * (fTemp479 / (fTemp470 * fTemp480))));
        this.fRec162[<i32>(0)] = ((<f32>(2.0) * fTemp482) - this.fRec162[<i32>(1)]);
        const fRec163: f32 = fTemp478;
        const fRec164: f32 = fTemp481;
        const fRec165: f32 = fTemp482;
        const fTemp483: f32 = ((fRec163 + (<f32>(1.4144272) * (fRec164 * fTemp476))) + (fRec165 * fTemp477));
        const fTemp484: f32 = (this.fRec156[<i32>(1)] + (fSlow103 * ((fTemp483 - this.fRec157[<i32>(1)]) / fTemp470)));
        const fTemp485: f32 = ((fSlow103 * ((fTemp472 + <f32>(0.5)) / fTemp470)) + <f32>(1.0));
        const fTemp486: f32 = (fTemp484 / fTemp485);
        this.fRec156[<i32>(0)] = ((<f32>(2.0) * fTemp486) - this.fRec156[<i32>(1)]);
        const fTemp487: f32 = (this.fRec157[<i32>(1)] + (fSlow103 * (fTemp484 / (fTemp470 * fTemp485))));
        this.fRec157[<i32>(0)] = ((<f32>(2.0) * fTemp487) - this.fRec157[<i32>(1)]);
        const fRec158: f32 = fTemp483;
        const fRec159: f32 = fTemp486;
        const fRec160: f32 = fTemp487;
        const fTemp488: f32 = ((fRec158 + (<f32>(0.5) * (fRec159 * fTemp476))) + (fRec160 * fTemp477));
        const fTemp489: f32 = Mathf.pow(<f32>(1e+01), fTemp468);
        const fTemp490: f32 = Mathf.sqrt(fTemp489);
        const fTemp491: f32 = (this.fRec151[<i32>(1)] + (fSlow102 * ((fTemp488 - this.fRec152[<i32>(1)]) / fTemp490)));
        const fTemp492: f32 = (fSlow102 / fTemp490);
        const fTemp493: f32 = ((fSlow102 * ((fTemp492 + <f32>(2.0)) / fTemp490)) + <f32>(1.0));
        const fTemp494: f32 = (fTemp491 / fTemp493);
        this.fRec151[<i32>(0)] = ((<f32>(2.0) * fTemp494) - this.fRec151[<i32>(1)]);
        const fTemp495: f32 = (this.fRec152[<i32>(1)] + (fSlow102 * (fTemp491 / (fTemp490 * fTemp493))));
        this.fRec152[<i32>(0)] = ((<f32>(2.0) * fTemp495) - this.fRec152[<i32>(1)]);
        const fRec153: f32 = fTemp488;
        const fRec154: f32 = fTemp494;
        const fRec155: f32 = fTemp495;
        const fTemp496: f32 = (fTemp489 + <f32>(-1.0));
        const fTemp497: f32 = (Mathf.pow(fTemp489, <f32>(2.0)) + <f32>(-1.0));
        const fTemp498: f32 = ((fRec153 + (<f32>(2.0) * (fRec154 * fTemp496))) + (fRec155 * fTemp497));
        const fTemp499: f32 = (this.fRec146[<i32>(1)] + (fSlow102 * ((fTemp498 - this.fRec147[<i32>(1)]) / fTemp490)));
        const fTemp500: f32 = ((fSlow102 * ((fTemp492 + <f32>(1.4144272)) / fTemp490)) + <f32>(1.0));
        const fTemp501: f32 = (fTemp499 / fTemp500);
        this.fRec146[<i32>(0)] = ((<f32>(2.0) * fTemp501) - this.fRec146[<i32>(1)]);
        const fTemp502: f32 = (this.fRec147[<i32>(1)] + (fSlow102 * (fTemp499 / (fTemp490 * fTemp500))));
        this.fRec147[<i32>(0)] = ((<f32>(2.0) * fTemp502) - this.fRec147[<i32>(1)]);
        const fRec148: f32 = fTemp498;
        const fRec149: f32 = fTemp501;
        const fRec150: f32 = fTemp502;
        const fTemp503: f32 = ((fRec148 + (<f32>(1.4144272) * (fRec149 * fTemp496))) + (fRec150 * fTemp497));
        const fTemp504: f32 = (this.fRec141[<i32>(1)] + (fSlow102 * ((fTemp503 - this.fRec142[<i32>(1)]) / fTemp490)));
        const fTemp505: f32 = ((fSlow102 * ((fTemp492 + <f32>(0.5)) / fTemp490)) + <f32>(1.0));
        const fTemp506: f32 = (fTemp504 / fTemp505);
        this.fRec141[<i32>(0)] = ((<f32>(2.0) * fTemp506) - this.fRec141[<i32>(1)]);
        const fTemp507: f32 = (this.fRec142[<i32>(1)] + (fSlow102 * (fTemp504 / (fTemp490 * fTemp505))));
        this.fRec142[<i32>(0)] = ((<f32>(2.0) * fTemp507) - this.fRec142[<i32>(1)]);
        const fRec143: f32 = fTemp503;
        const fRec144: f32 = fTemp506;
        const fRec145: f32 = fTemp507;
        const fTemp508: f32 = ((fRec143 + (<f32>(0.5) * (fRec144 * fTemp496))) + (fRec145 * fTemp497));
        this.fRec380[<i32>(0)] = ((fSlow283 * (this.fRec324[<i32>(2)] + (this.fRec324[<i32>(0)] - fTemp200))) - (fSlow148 * ((fSlow154 * this.fRec380[<i32>(2)]) + (fSlow153 * this.fRec380[<i32>(1)]))));
        this.fRec379[<i32>(0)] = ((fSlow282 * (this.fRec380[<i32>(2)] + (this.fRec380[<i32>(0)] - (<f32>(2.0) * this.fRec380[<i32>(1)])))) - (fSlow146 * ((fSlow155 * this.fRec379[<i32>(2)]) + (fSlow153 * this.fRec379[<i32>(1)]))));
        const fTemp509: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow281 * (this.fRec379[<i32>(2)] + (this.fRec379[<i32>(0)] - (<f32>(2.0) * this.fRec379[<i32>(1)]))))))));
        const iTemp510: i32 = (<i32>(fTemp509 > fSlow287) + <i32>(fTemp509 > fSlow288));
        const fTemp511: f32 = (fTemp509 - fSlow284);
        const fTemp512: f32 = max<f32>(<f32>(0.0), ((iTemp510 == <i32>(0)) ? <f32>(0.0) : ((iTemp510 == <i32>(1)) ? (fSlow289 * Mathf.pow((fSlow286 + fTemp511), <f32>(2.0))) : fTemp511)));
        const fTemp513: f32 = ((-((fSlow280 * fTemp512)) > this.fRec378[<i32>(1)]) ? fSlow295 : fSlow292);
        this.fRec378[<i32>(0)] = ((this.fRec378[<i32>(1)] * fTemp513) - (fSlow280 * (fTemp512 * (<f32>(1.0) - fTemp513))));
        this.fRec383[<i32>(0)] = ((fSlow283 * (this.fRec345[<i32>(2)] + (this.fRec345[<i32>(0)] - fTemp211))) - (fSlow148 * ((fSlow154 * this.fRec383[<i32>(2)]) + (fSlow153 * this.fRec383[<i32>(1)]))));
        this.fRec382[<i32>(0)] = ((fSlow282 * (this.fRec383[<i32>(2)] + (this.fRec383[<i32>(0)] - (<f32>(2.0) * this.fRec383[<i32>(1)])))) - (fSlow146 * ((fSlow155 * this.fRec382[<i32>(2)]) + (fSlow153 * this.fRec382[<i32>(1)]))));
        const fTemp514: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), Mathf.abs((fSlow281 * (this.fRec382[<i32>(2)] + (this.fRec382[<i32>(0)] - (<f32>(2.0) * this.fRec382[<i32>(1)]))))))));
        const iTemp515: i32 = (<i32>(fTemp514 > fSlow287) + <i32>(fTemp514 > fSlow288));
        const fTemp516: f32 = (fTemp514 - fSlow284);
        const fTemp517: f32 = max<f32>(<f32>(0.0), ((iTemp515 == <i32>(0)) ? <f32>(0.0) : ((iTemp515 == <i32>(1)) ? (fSlow289 * Mathf.pow((fSlow286 + fTemp516), <f32>(2.0))) : fTemp516)));
        const fTemp518: f32 = ((-((fSlow280 * fTemp517)) > this.fRec381[<i32>(1)]) ? fSlow295 : fSlow292);
        this.fRec381[<i32>(0)] = ((this.fRec381[<i32>(1)] * fTemp518) - (fSlow280 * (fTemp517 * (<f32>(1.0) - fTemp518))));
        const fTemp519: f32 = min<f32>(this.fRec378[<i32>(0)], this.fRec381[<i32>(0)]);
        const fTemp520: f32 = (this.fRec378[<i32>(0)] + (fSlow296 * (fTemp519 - this.fRec378[<i32>(0)])));
        this.fVbargraph15 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp520));
        const fTemp521: f32 = (<f32>(0.008333334) * fTemp520);
        const fTemp522: f32 = Mathf.pow(<f32>(1e+01), -fTemp521);
        const fTemp523: f32 = Mathf.sqrt(fTemp522);
        const fTemp524: f32 = (this.fRec136[<i32>(1)] + (fSlow102 * ((fTemp508 - this.fRec137[<i32>(1)]) / fTemp523)));
        const fTemp525: f32 = (fSlow102 / fTemp523);
        const fTemp526: f32 = ((fSlow102 * ((fTemp525 + <f32>(2.0)) / fTemp523)) + <f32>(1.0));
        const fTemp527: f32 = (fTemp524 / fTemp526);
        this.fRec136[<i32>(0)] = ((<f32>(2.0) * fTemp527) - this.fRec136[<i32>(1)]);
        const fTemp528: f32 = (this.fRec137[<i32>(1)] + (fSlow102 * (fTemp524 / (fTemp523 * fTemp526))));
        this.fRec137[<i32>(0)] = ((<f32>(2.0) * fTemp528) - this.fRec137[<i32>(1)]);
        const fRec138: f32 = fTemp508;
        const fRec139: f32 = fTemp527;
        const fRec140: f32 = fTemp528;
        const fTemp529: f32 = (fTemp522 + <f32>(-1.0));
        const fTemp530: f32 = (Mathf.pow(fTemp522, <f32>(2.0)) + <f32>(-1.0));
        const fTemp531: f32 = ((fRec138 + (<f32>(2.0) * (fRec139 * fTemp529))) + (fRec140 * fTemp530));
        const fTemp532: f32 = (this.fRec131[<i32>(1)] + (fSlow102 * ((fTemp531 - this.fRec132[<i32>(1)]) / fTemp523)));
        const fTemp533: f32 = ((fSlow102 * ((fTemp525 + <f32>(1.4144272)) / fTemp523)) + <f32>(1.0));
        const fTemp534: f32 = (fTemp532 / fTemp533);
        this.fRec131[<i32>(0)] = ((<f32>(2.0) * fTemp534) - this.fRec131[<i32>(1)]);
        const fTemp535: f32 = (this.fRec132[<i32>(1)] + (fSlow102 * (fTemp532 / (fTemp523 * fTemp533))));
        this.fRec132[<i32>(0)] = ((<f32>(2.0) * fTemp535) - this.fRec132[<i32>(1)]);
        const fRec133: f32 = fTemp531;
        const fRec134: f32 = fTemp534;
        const fRec135: f32 = fTemp535;
        const fTemp536: f32 = ((fRec133 + (<f32>(1.4144272) * (fRec134 * fTemp529))) + (fRec135 * fTemp530));
        const fTemp537: f32 = (this.fRec126[<i32>(1)] + (fSlow102 * ((fTemp536 - this.fRec127[<i32>(1)]) / fTemp523)));
        const fTemp538: f32 = ((fSlow102 * ((fTemp525 + <f32>(0.5)) / fTemp523)) + <f32>(1.0));
        const fTemp539: f32 = (fTemp537 / fTemp538);
        this.fRec126[<i32>(0)] = ((<f32>(2.0) * fTemp539) - this.fRec126[<i32>(1)]);
        const fTemp540: f32 = (this.fRec127[<i32>(1)] + (fSlow102 * (fTemp537 / (fTemp523 * fTemp538))));
        this.fRec127[<i32>(0)] = ((<f32>(2.0) * fTemp540) - this.fRec127[<i32>(1)]);
        const fRec128: f32 = fTemp536;
        const fRec129: f32 = fTemp539;
        const fRec130: f32 = fTemp540;
        const fTemp541: f32 = ((fRec128 + (<f32>(0.5) * (fRec129 * fTemp529))) + (fRec130 * fTemp530));
        const fTemp542: f32 = Mathf.pow(<f32>(1e+01), fTemp521);
        const fTemp543: f32 = Mathf.sqrt(fTemp542);
        const fTemp544: f32 = (this.fRec121[<i32>(1)] + (fSlow66 * ((fTemp541 - this.fRec122[<i32>(1)]) / fTemp543)));
        const fTemp545: f32 = (fSlow66 / fTemp543);
        const fTemp546: f32 = ((fSlow66 * ((fTemp545 + <f32>(2.0)) / fTemp543)) + <f32>(1.0));
        const fTemp547: f32 = (fTemp544 / fTemp546);
        this.fRec121[<i32>(0)] = ((<f32>(2.0) * fTemp547) - this.fRec121[<i32>(1)]);
        const fTemp548: f32 = (this.fRec122[<i32>(1)] + (fSlow66 * (fTemp544 / (fTemp543 * fTemp546))));
        this.fRec122[<i32>(0)] = ((<f32>(2.0) * fTemp548) - this.fRec122[<i32>(1)]);
        const fRec123: f32 = fTemp541;
        const fRec124: f32 = fTemp547;
        const fRec125: f32 = fTemp548;
        const fTemp549: f32 = (fTemp542 + <f32>(-1.0));
        const fTemp550: f32 = (Mathf.pow(fTemp542, <f32>(2.0)) + <f32>(-1.0));
        const fTemp551: f32 = ((fRec123 + (<f32>(2.0) * (fRec124 * fTemp549))) + (fRec125 * fTemp550));
        const fTemp552: f32 = (this.fRec116[<i32>(1)] + (fSlow66 * ((fTemp551 - this.fRec117[<i32>(1)]) / fTemp543)));
        const fTemp553: f32 = ((fSlow66 * ((fTemp545 + <f32>(1.4144272)) / fTemp543)) + <f32>(1.0));
        const fTemp554: f32 = (fTemp552 / fTemp553);
        this.fRec116[<i32>(0)] = ((<f32>(2.0) * fTemp554) - this.fRec116[<i32>(1)]);
        const fTemp555: f32 = (this.fRec117[<i32>(1)] + (fSlow66 * (fTemp552 / (fTemp543 * fTemp553))));
        this.fRec117[<i32>(0)] = ((<f32>(2.0) * fTemp555) - this.fRec117[<i32>(1)]);
        const fRec118: f32 = fTemp551;
        const fRec119: f32 = fTemp554;
        const fRec120: f32 = fTemp555;
        const fTemp556: f32 = ((fRec118 + (<f32>(1.4144272) * (fRec119 * fTemp549))) + (fRec120 * fTemp550));
        const fTemp557: f32 = (this.fRec111[<i32>(1)] + (fSlow66 * ((fTemp556 - this.fRec112[<i32>(1)]) / fTemp543)));
        const fTemp558: f32 = ((fSlow66 * ((fTemp545 + <f32>(0.5)) / fTemp543)) + <f32>(1.0));
        const fTemp559: f32 = (fTemp557 / fTemp558);
        this.fRec111[<i32>(0)] = ((<f32>(2.0) * fTemp559) - this.fRec111[<i32>(1)]);
        const fTemp560: f32 = (this.fRec112[<i32>(1)] + (fSlow66 * (fTemp557 / (fTemp543 * fTemp558))));
        this.fRec112[<i32>(0)] = ((<f32>(2.0) * fTemp560) - this.fRec112[<i32>(1)]);
        const fRec113: f32 = fTemp556;
        const fRec114: f32 = fTemp559;
        const fRec115: f32 = fTemp560;
        const fTemp561: f32 = ((fRec113 + (<f32>(0.5) * (fRec114 * fTemp549))) + (fRec115 * fTemp550));
        const fTemp562: f32 = (this.fRec106[<i32>(1)] + (fSlow66 * (fTemp199 * (fTemp561 - this.fRec107[<i32>(1)]))));
        const fTemp563: f32 = (fSlow66 * fTemp199);
        const fTemp564: f32 = ((fSlow66 * (fTemp199 * (fTemp563 + <f32>(2.0)))) + <f32>(1.0));
        const fTemp565: f32 = (fTemp562 / fTemp564);
        this.fRec106[<i32>(0)] = ((<f32>(2.0) * fTemp565) - this.fRec106[<i32>(1)]);
        const fTemp566: f32 = (this.fRec107[<i32>(1)] + (fSlow66 * ((fTemp199 * fTemp562) / fTemp564)));
        this.fRec107[<i32>(0)] = ((<f32>(2.0) * fTemp566) - this.fRec107[<i32>(1)]);
        const fRec108: f32 = fTemp561;
        const fRec109: f32 = fTemp565;
        const fRec110: f32 = fTemp566;
        const fTemp567: f32 = (<f32>(1.0) - fTemp198);
        const fTemp568: f32 = (<f32>(1.0) - Mathf.pow(fTemp198, <f32>(2.0)));
        const fTemp569: f32 = ((fTemp198 * ((fRec108 * fTemp198) + (<f32>(2.0) * (fRec109 * fTemp567)))) + (fRec110 * fTemp568));
        const fTemp570: f32 = (this.fRec101[<i32>(1)] + (fSlow66 * (fTemp199 * (fTemp569 - this.fRec102[<i32>(1)]))));
        const fTemp571: f32 = ((fSlow66 * (fTemp199 * (fTemp563 + <f32>(1.4144272)))) + <f32>(1.0));
        const fTemp572: f32 = (fTemp570 / fTemp571);
        this.fRec101[<i32>(0)] = ((<f32>(2.0) * fTemp572) - this.fRec101[<i32>(1)]);
        const fTemp573: f32 = (this.fRec102[<i32>(1)] + (fSlow66 * ((fTemp199 * fTemp570) / fTemp571)));
        this.fRec102[<i32>(0)] = ((<f32>(2.0) * fTemp573) - this.fRec102[<i32>(1)]);
        const fRec103: f32 = fTemp569;
        const fRec104: f32 = fTemp572;
        const fRec105: f32 = fTemp573;
        const fTemp574: f32 = ((fTemp198 * ((fRec103 * fTemp198) + (<f32>(1.4144272) * (fRec104 * fTemp567)))) + (fRec105 * fTemp568));
        const fTemp575: f32 = (this.fRec96[<i32>(1)] + (fSlow66 * (fTemp199 * (fTemp574 - this.fRec97[<i32>(1)]))));
        const fTemp576: f32 = ((fSlow66 * (fTemp199 * (fTemp563 + <f32>(0.5)))) + <f32>(1.0));
        const fTemp577: f32 = (fTemp575 / fTemp576);
        this.fRec96[<i32>(0)] = ((<f32>(2.0) * fTemp577) - this.fRec96[<i32>(1)]);
        const fTemp578: f32 = (this.fRec97[<i32>(1)] + (fSlow66 * ((fTemp199 * fTemp575) / fTemp576)));
        this.fRec97[<i32>(0)] = ((<f32>(2.0) * fTemp578) - this.fRec97[<i32>(1)]);
        const fRec98: f32 = fTemp574;
        const fRec99: f32 = fTemp577;
        const fRec100: f32 = fTemp578;
        const fTemp579: f32 = ((fTemp198 * ((fRec98 * fTemp198) + (<f32>(0.5) * (fRec99 * fTemp567)))) + (fRec100 * fTemp568));
        const fTemp580: f32 = (this.fRec92[<i32>(0)] + (fSlow101 * (fTemp196 - this.fRec92[<i32>(0)])));
        this.fVbargraph16 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp580));
        const fTemp581: f32 = Mathf.pow(<f32>(1e+01), (<f32>(0.008333334) * fTemp580));
        const fTemp582: f32 = Mathf.sqrt(fTemp581);
        const fTemp583: f32 = (this.fRec327[<i32>(0)] + (fSlow192 * (fTemp222 - this.fRec327[<i32>(0)])));
        this.fVbargraph17 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp583));
        const fTemp584: f32 = Mathf.pow(<f32>(1e+01), (<f32>(0.008333334) * fTemp583));
        const fTemp585: f32 = Mathf.sqrt(fTemp584);
        const fTemp586: f32 = (this.fRec589[<i32>(1)] + (fSlow107 * ((fTemp189 - this.fRec590[<i32>(1)]) / fTemp585)));
        const fTemp587: f32 = (fSlow107 / fTemp585);
        const fTemp588: f32 = ((fSlow107 * ((fTemp587 + <f32>(2.0)) / fTemp585)) + <f32>(1.0));
        const fTemp589: f32 = (fTemp586 / fTemp588);
        this.fRec589[<i32>(0)] = ((<f32>(2.0) * fTemp589) - this.fRec589[<i32>(1)]);
        const fTemp590: f32 = (this.fRec590[<i32>(1)] + (fSlow107 * (fTemp586 / (fTemp585 * fTemp588))));
        this.fRec590[<i32>(0)] = ((<f32>(2.0) * fTemp590) - this.fRec590[<i32>(1)]);
        const fRec591: f32 = fTemp189;
        const fRec592: f32 = fTemp589;
        const fRec593: f32 = fTemp590;
        const fTemp591: f32 = (fTemp584 + <f32>(-1.0));
        const fTemp592: f32 = (Mathf.pow(fTemp584, <f32>(2.0)) + <f32>(-1.0));
        const fTemp593: f32 = ((fRec591 + (<f32>(2.0) * (fRec592 * fTemp591))) + (fRec593 * fTemp592));
        const fTemp594: f32 = (this.fRec584[<i32>(1)] + (fSlow107 * ((fTemp593 - this.fRec585[<i32>(1)]) / fTemp585)));
        const fTemp595: f32 = ((fSlow107 * ((fTemp587 + <f32>(1.4144272)) / fTemp585)) + <f32>(1.0));
        const fTemp596: f32 = (fTemp594 / fTemp595);
        this.fRec584[<i32>(0)] = ((<f32>(2.0) * fTemp596) - this.fRec584[<i32>(1)]);
        const fTemp597: f32 = (this.fRec585[<i32>(1)] + (fSlow107 * (fTemp594 / (fTemp585 * fTemp595))));
        this.fRec585[<i32>(0)] = ((<f32>(2.0) * fTemp597) - this.fRec585[<i32>(1)]);
        const fRec586: f32 = fTemp593;
        const fRec587: f32 = fTemp596;
        const fRec588: f32 = fTemp597;
        const fTemp598: f32 = ((fRec586 + (<f32>(1.4144272) * (fRec587 * fTemp591))) + (fRec588 * fTemp592));
        const fTemp599: f32 = (this.fRec579[<i32>(1)] + (fSlow107 * ((fTemp598 - this.fRec580[<i32>(1)]) / fTemp585)));
        const fTemp600: f32 = ((fSlow107 * ((fTemp587 + <f32>(0.5)) / fTemp585)) + <f32>(1.0));
        const fTemp601: f32 = (fTemp599 / fTemp600);
        this.fRec579[<i32>(0)] = ((<f32>(2.0) * fTemp601) - this.fRec579[<i32>(1)]);
        const fTemp602: f32 = (this.fRec580[<i32>(1)] + (fSlow107 * (fTemp599 / (fTemp585 * fTemp600))));
        this.fRec580[<i32>(0)] = ((<f32>(2.0) * fTemp602) - this.fRec580[<i32>(1)]);
        const fRec581: f32 = fTemp598;
        const fRec582: f32 = fTemp601;
        const fRec583: f32 = fTemp602;
        const fTemp603: f32 = ((fRec581 + (<f32>(0.5) * (fRec582 * fTemp591))) + (fRec583 * fTemp592));
        const fTemp604: f32 = (this.fRec351[<i32>(0)] + (fSlow211 * (fTemp254 - this.fRec351[<i32>(0)])));
        this.fVbargraph18 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp604));
        const fTemp605: f32 = (<f32>(0.008333334) * fTemp604);
        const fTemp606: f32 = Mathf.pow(<f32>(1e+01), -fTemp605);
        const fTemp607: f32 = Mathf.sqrt(fTemp606);
        const fTemp608: f32 = (this.fRec574[<i32>(1)] + (fSlow107 * ((fTemp603 - this.fRec575[<i32>(1)]) / fTemp607)));
        const fTemp609: f32 = (fSlow107 / fTemp607);
        const fTemp610: f32 = ((fSlow107 * ((fTemp609 + <f32>(2.0)) / fTemp607)) + <f32>(1.0));
        const fTemp611: f32 = (fTemp608 / fTemp610);
        this.fRec574[<i32>(0)] = ((<f32>(2.0) * fTemp611) - this.fRec574[<i32>(1)]);
        const fTemp612: f32 = (this.fRec575[<i32>(1)] + (fSlow107 * (fTemp608 / (fTemp607 * fTemp610))));
        this.fRec575[<i32>(0)] = ((<f32>(2.0) * fTemp612) - this.fRec575[<i32>(1)]);
        const fRec576: f32 = fTemp603;
        const fRec577: f32 = fTemp611;
        const fRec578: f32 = fTemp612;
        const fTemp613: f32 = (fTemp606 + <f32>(-1.0));
        const fTemp614: f32 = (Mathf.pow(fTemp606, <f32>(2.0)) + <f32>(-1.0));
        const fTemp615: f32 = ((fRec576 + (<f32>(2.0) * (fRec577 * fTemp613))) + (fRec578 * fTemp614));
        const fTemp616: f32 = (this.fRec569[<i32>(1)] + (fSlow107 * ((fTemp615 - this.fRec570[<i32>(1)]) / fTemp607)));
        const fTemp617: f32 = ((fSlow107 * ((fTemp609 + <f32>(1.4144272)) / fTemp607)) + <f32>(1.0));
        const fTemp618: f32 = (fTemp616 / fTemp617);
        this.fRec569[<i32>(0)] = ((<f32>(2.0) * fTemp618) - this.fRec569[<i32>(1)]);
        const fTemp619: f32 = (this.fRec570[<i32>(1)] + (fSlow107 * (fTemp616 / (fTemp607 * fTemp617))));
        this.fRec570[<i32>(0)] = ((<f32>(2.0) * fTemp619) - this.fRec570[<i32>(1)]);
        const fRec571: f32 = fTemp615;
        const fRec572: f32 = fTemp618;
        const fRec573: f32 = fTemp619;
        const fTemp620: f32 = ((fRec571 + (<f32>(1.4144272) * (fRec572 * fTemp613))) + (fRec573 * fTemp614));
        const fTemp621: f32 = (this.fRec564[<i32>(1)] + (fSlow107 * ((fTemp620 - this.fRec565[<i32>(1)]) / fTemp607)));
        const fTemp622: f32 = ((fSlow107 * ((fTemp609 + <f32>(0.5)) / fTemp607)) + <f32>(1.0));
        const fTemp623: f32 = (fTemp621 / fTemp622);
        this.fRec564[<i32>(0)] = ((<f32>(2.0) * fTemp623) - this.fRec564[<i32>(1)]);
        const fTemp624: f32 = (this.fRec565[<i32>(1)] + (fSlow107 * (fTemp621 / (fTemp607 * fTemp622))));
        this.fRec565[<i32>(0)] = ((<f32>(2.0) * fTemp624) - this.fRec565[<i32>(1)]);
        const fRec566: f32 = fTemp620;
        const fRec567: f32 = fTemp623;
        const fRec568: f32 = fTemp624;
        const fTemp625: f32 = ((fRec566 + (<f32>(0.5) * (fRec567 * fTemp613))) + (fRec568 * fTemp614));
        const fTemp626: f32 = Mathf.pow(<f32>(1e+01), fTemp605);
        const fTemp627: f32 = Mathf.sqrt(fTemp626);
        const fTemp628: f32 = (this.fRec559[<i32>(1)] + (fSlow106 * ((fTemp625 - this.fRec560[<i32>(1)]) / fTemp627)));
        const fTemp629: f32 = (fSlow106 / fTemp627);
        const fTemp630: f32 = ((fSlow106 * ((fTemp629 + <f32>(2.0)) / fTemp627)) + <f32>(1.0));
        const fTemp631: f32 = (fTemp628 / fTemp630);
        this.fRec559[<i32>(0)] = ((<f32>(2.0) * fTemp631) - this.fRec559[<i32>(1)]);
        const fTemp632: f32 = (this.fRec560[<i32>(1)] + (fSlow106 * (fTemp628 / (fTemp627 * fTemp630))));
        this.fRec560[<i32>(0)] = ((<f32>(2.0) * fTemp632) - this.fRec560[<i32>(1)]);
        const fRec561: f32 = fTemp625;
        const fRec562: f32 = fTemp631;
        const fRec563: f32 = fTemp632;
        const fTemp633: f32 = (fTemp626 + <f32>(-1.0));
        const fTemp634: f32 = (Mathf.pow(fTemp626, <f32>(2.0)) + <f32>(-1.0));
        const fTemp635: f32 = ((fRec561 + (<f32>(2.0) * (fRec562 * fTemp633))) + (fRec563 * fTemp634));
        const fTemp636: f32 = (this.fRec554[<i32>(1)] + (fSlow106 * ((fTemp635 - this.fRec555[<i32>(1)]) / fTemp627)));
        const fTemp637: f32 = ((fSlow106 * ((fTemp629 + <f32>(1.4144272)) / fTemp627)) + <f32>(1.0));
        const fTemp638: f32 = (fTemp636 / fTemp637);
        this.fRec554[<i32>(0)] = ((<f32>(2.0) * fTemp638) - this.fRec554[<i32>(1)]);
        const fTemp639: f32 = (this.fRec555[<i32>(1)] + (fSlow106 * (fTemp636 / (fTemp627 * fTemp637))));
        this.fRec555[<i32>(0)] = ((<f32>(2.0) * fTemp639) - this.fRec555[<i32>(1)]);
        const fRec556: f32 = fTemp635;
        const fRec557: f32 = fTemp638;
        const fRec558: f32 = fTemp639;
        const fTemp640: f32 = ((fRec556 + (<f32>(1.4144272) * (fRec557 * fTemp633))) + (fRec558 * fTemp634));
        const fTemp641: f32 = (this.fRec549[<i32>(1)] + (fSlow106 * ((fTemp640 - this.fRec550[<i32>(1)]) / fTemp627)));
        const fTemp642: f32 = ((fSlow106 * ((fTemp629 + <f32>(0.5)) / fTemp627)) + <f32>(1.0));
        const fTemp643: f32 = (fTemp641 / fTemp642);
        this.fRec549[<i32>(0)] = ((<f32>(2.0) * fTemp643) - this.fRec549[<i32>(1)]);
        const fTemp644: f32 = (this.fRec550[<i32>(1)] + (fSlow106 * (fTemp641 / (fTemp627 * fTemp642))));
        this.fRec550[<i32>(0)] = ((<f32>(2.0) * fTemp644) - this.fRec550[<i32>(1)]);
        const fRec551: f32 = fTemp640;
        const fRec552: f32 = fTemp643;
        const fRec553: f32 = fTemp644;
        const fTemp645: f32 = ((fRec551 + (<f32>(0.5) * (fRec552 * fTemp633))) + (fRec553 * fTemp634));
        const fTemp646: f32 = (this.fRec357[<i32>(0)] + (fSlow228 * (fTemp307 - this.fRec357[<i32>(0)])));
        this.fVbargraph19 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp646));
        const fTemp647: f32 = (<f32>(0.008333334) * fTemp646);
        const fTemp648: f32 = Mathf.pow(<f32>(1e+01), -fTemp647);
        const fTemp649: f32 = Mathf.sqrt(fTemp648);
        const fTemp650: f32 = (this.fRec544[<i32>(1)] + (fSlow106 * ((fTemp645 - this.fRec545[<i32>(1)]) / fTemp649)));
        const fTemp651: f32 = (fSlow106 / fTemp649);
        const fTemp652: f32 = ((fSlow106 * ((fTemp651 + <f32>(2.0)) / fTemp649)) + <f32>(1.0));
        const fTemp653: f32 = (fTemp650 / fTemp652);
        this.fRec544[<i32>(0)] = ((<f32>(2.0) * fTemp653) - this.fRec544[<i32>(1)]);
        const fTemp654: f32 = (this.fRec545[<i32>(1)] + (fSlow106 * (fTemp650 / (fTemp649 * fTemp652))));
        this.fRec545[<i32>(0)] = ((<f32>(2.0) * fTemp654) - this.fRec545[<i32>(1)]);
        const fRec546: f32 = fTemp645;
        const fRec547: f32 = fTemp653;
        const fRec548: f32 = fTemp654;
        const fTemp655: f32 = (fTemp648 + <f32>(-1.0));
        const fTemp656: f32 = (Mathf.pow(fTemp648, <f32>(2.0)) + <f32>(-1.0));
        const fTemp657: f32 = ((fRec546 + (<f32>(2.0) * (fRec547 * fTemp655))) + (fRec548 * fTemp656));
        const fTemp658: f32 = (this.fRec539[<i32>(1)] + (fSlow106 * ((fTemp657 - this.fRec540[<i32>(1)]) / fTemp649)));
        const fTemp659: f32 = ((fSlow106 * ((fTemp651 + <f32>(1.4144272)) / fTemp649)) + <f32>(1.0));
        const fTemp660: f32 = (fTemp658 / fTemp659);
        this.fRec539[<i32>(0)] = ((<f32>(2.0) * fTemp660) - this.fRec539[<i32>(1)]);
        const fTemp661: f32 = (this.fRec540[<i32>(1)] + (fSlow106 * (fTemp658 / (fTemp649 * fTemp659))));
        this.fRec540[<i32>(0)] = ((<f32>(2.0) * fTemp661) - this.fRec540[<i32>(1)]);
        const fRec541: f32 = fTemp657;
        const fRec542: f32 = fTemp660;
        const fRec543: f32 = fTemp661;
        const fTemp662: f32 = ((fRec541 + (<f32>(1.4144272) * (fRec542 * fTemp655))) + (fRec543 * fTemp656));
        const fTemp663: f32 = (this.fRec534[<i32>(1)] + (fSlow106 * ((fTemp662 - this.fRec535[<i32>(1)]) / fTemp649)));
        const fTemp664: f32 = ((fSlow106 * ((fTemp651 + <f32>(0.5)) / fTemp649)) + <f32>(1.0));
        const fTemp665: f32 = (fTemp663 / fTemp664);
        this.fRec534[<i32>(0)] = ((<f32>(2.0) * fTemp665) - this.fRec534[<i32>(1)]);
        const fTemp666: f32 = (this.fRec535[<i32>(1)] + (fSlow106 * (fTemp663 / (fTemp649 * fTemp664))));
        this.fRec535[<i32>(0)] = ((<f32>(2.0) * fTemp666) - this.fRec535[<i32>(1)]);
        const fRec536: f32 = fTemp662;
        const fRec537: f32 = fTemp665;
        const fRec538: f32 = fTemp666;
        const fTemp667: f32 = ((fRec536 + (<f32>(0.5) * (fRec537 * fTemp655))) + (fRec538 * fTemp656));
        const fTemp668: f32 = Mathf.pow(<f32>(1e+01), fTemp647);
        const fTemp669: f32 = Mathf.sqrt(fTemp668);
        const fTemp670: f32 = (this.fRec529[<i32>(1)] + (fSlow105 * ((fTemp667 - this.fRec530[<i32>(1)]) / fTemp669)));
        const fTemp671: f32 = (fSlow105 / fTemp669);
        const fTemp672: f32 = ((fSlow105 * ((fTemp671 + <f32>(2.0)) / fTemp669)) + <f32>(1.0));
        const fTemp673: f32 = (fTemp670 / fTemp672);
        this.fRec529[<i32>(0)] = ((<f32>(2.0) * fTemp673) - this.fRec529[<i32>(1)]);
        const fTemp674: f32 = (this.fRec530[<i32>(1)] + (fSlow105 * (fTemp670 / (fTemp669 * fTemp672))));
        this.fRec530[<i32>(0)] = ((<f32>(2.0) * fTemp674) - this.fRec530[<i32>(1)]);
        const fRec531: f32 = fTemp667;
        const fRec532: f32 = fTemp673;
        const fRec533: f32 = fTemp674;
        const fTemp675: f32 = (fTemp668 + <f32>(-1.0));
        const fTemp676: f32 = (Mathf.pow(fTemp668, <f32>(2.0)) + <f32>(-1.0));
        const fTemp677: f32 = ((fRec531 + (<f32>(2.0) * (fRec532 * fTemp675))) + (fRec533 * fTemp676));
        const fTemp678: f32 = (this.fRec524[<i32>(1)] + (fSlow105 * ((fTemp677 - this.fRec525[<i32>(1)]) / fTemp669)));
        const fTemp679: f32 = ((fSlow105 * ((fTemp671 + <f32>(1.4144272)) / fTemp669)) + <f32>(1.0));
        const fTemp680: f32 = (fTemp678 / fTemp679);
        this.fRec524[<i32>(0)] = ((<f32>(2.0) * fTemp680) - this.fRec524[<i32>(1)]);
        const fTemp681: f32 = (this.fRec525[<i32>(1)] + (fSlow105 * (fTemp678 / (fTemp669 * fTemp679))));
        this.fRec525[<i32>(0)] = ((<f32>(2.0) * fTemp681) - this.fRec525[<i32>(1)]);
        const fRec526: f32 = fTemp677;
        const fRec527: f32 = fTemp680;
        const fRec528: f32 = fTemp681;
        const fTemp682: f32 = ((fRec526 + (<f32>(1.4144272) * (fRec527 * fTemp675))) + (fRec528 * fTemp676));
        const fTemp683: f32 = (this.fRec519[<i32>(1)] + (fSlow105 * ((fTemp682 - this.fRec520[<i32>(1)]) / fTemp669)));
        const fTemp684: f32 = ((fSlow105 * ((fTemp671 + <f32>(0.5)) / fTemp669)) + <f32>(1.0));
        const fTemp685: f32 = (fTemp683 / fTemp684);
        this.fRec519[<i32>(0)] = ((<f32>(2.0) * fTemp685) - this.fRec519[<i32>(1)]);
        const fTemp686: f32 = (this.fRec520[<i32>(1)] + (fSlow105 * (fTemp683 / (fTemp669 * fTemp684))));
        this.fRec520[<i32>(0)] = ((<f32>(2.0) * fTemp686) - this.fRec520[<i32>(1)]);
        const fRec521: f32 = fTemp682;
        const fRec522: f32 = fTemp685;
        const fRec523: f32 = fTemp686;
        const fTemp687: f32 = ((fRec521 + (<f32>(0.5) * (fRec522 * fTemp675))) + (fRec523 * fTemp676));
        const fTemp688: f32 = (this.fRec363[<i32>(0)] + (fSlow245 * (fTemp360 - this.fRec363[<i32>(0)])));
        this.fVbargraph20 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp688));
        const fTemp689: f32 = (<f32>(0.008333334) * fTemp688);
        const fTemp690: f32 = Mathf.pow(<f32>(1e+01), -fTemp689);
        const fTemp691: f32 = Mathf.sqrt(fTemp690);
        const fTemp692: f32 = (this.fRec514[<i32>(1)] + (fSlow105 * ((fTemp687 - this.fRec515[<i32>(1)]) / fTemp691)));
        const fTemp693: f32 = (fSlow105 / fTemp691);
        const fTemp694: f32 = ((fSlow105 * ((fTemp693 + <f32>(2.0)) / fTemp691)) + <f32>(1.0));
        const fTemp695: f32 = (fTemp692 / fTemp694);
        this.fRec514[<i32>(0)] = ((<f32>(2.0) * fTemp695) - this.fRec514[<i32>(1)]);
        const fTemp696: f32 = (this.fRec515[<i32>(1)] + (fSlow105 * (fTemp692 / (fTemp691 * fTemp694))));
        this.fRec515[<i32>(0)] = ((<f32>(2.0) * fTemp696) - this.fRec515[<i32>(1)]);
        const fRec516: f32 = fTemp687;
        const fRec517: f32 = fTemp695;
        const fRec518: f32 = fTemp696;
        const fTemp697: f32 = (fTemp690 + <f32>(-1.0));
        const fTemp698: f32 = (Mathf.pow(fTemp690, <f32>(2.0)) + <f32>(-1.0));
        const fTemp699: f32 = ((fRec516 + (<f32>(2.0) * (fRec517 * fTemp697))) + (fRec518 * fTemp698));
        const fTemp700: f32 = (this.fRec509[<i32>(1)] + (fSlow105 * ((fTemp699 - this.fRec510[<i32>(1)]) / fTemp691)));
        const fTemp701: f32 = ((fSlow105 * ((fTemp693 + <f32>(1.4144272)) / fTemp691)) + <f32>(1.0));
        const fTemp702: f32 = (fTemp700 / fTemp701);
        this.fRec509[<i32>(0)] = ((<f32>(2.0) * fTemp702) - this.fRec509[<i32>(1)]);
        const fTemp703: f32 = (this.fRec510[<i32>(1)] + (fSlow105 * (fTemp700 / (fTemp691 * fTemp701))));
        this.fRec510[<i32>(0)] = ((<f32>(2.0) * fTemp703) - this.fRec510[<i32>(1)]);
        const fRec511: f32 = fTemp699;
        const fRec512: f32 = fTemp702;
        const fRec513: f32 = fTemp703;
        const fTemp704: f32 = ((fRec511 + (<f32>(1.4144272) * (fRec512 * fTemp697))) + (fRec513 * fTemp698));
        const fTemp705: f32 = (this.fRec504[<i32>(1)] + (fSlow105 * ((fTemp704 - this.fRec505[<i32>(1)]) / fTemp691)));
        const fTemp706: f32 = ((fSlow105 * ((fTemp693 + <f32>(0.5)) / fTemp691)) + <f32>(1.0));
        const fTemp707: f32 = (fTemp705 / fTemp706);
        this.fRec504[<i32>(0)] = ((<f32>(2.0) * fTemp707) - this.fRec504[<i32>(1)]);
        const fTemp708: f32 = (this.fRec505[<i32>(1)] + (fSlow105 * (fTemp705 / (fTemp691 * fTemp706))));
        this.fRec505[<i32>(0)] = ((<f32>(2.0) * fTemp708) - this.fRec505[<i32>(1)]);
        const fRec506: f32 = fTemp704;
        const fRec507: f32 = fTemp707;
        const fRec508: f32 = fTemp708;
        const fTemp709: f32 = ((fRec506 + (<f32>(0.5) * (fRec507 * fTemp697))) + (fRec508 * fTemp698));
        const fTemp710: f32 = Mathf.pow(<f32>(1e+01), fTemp689);
        const fTemp711: f32 = Mathf.sqrt(fTemp710);
        const fTemp712: f32 = (this.fRec499[<i32>(1)] + (fSlow104 * ((fTemp709 - this.fRec500[<i32>(1)]) / fTemp711)));
        const fTemp713: f32 = (fSlow104 / fTemp711);
        const fTemp714: f32 = ((fSlow104 * ((fTemp713 + <f32>(2.0)) / fTemp711)) + <f32>(1.0));
        const fTemp715: f32 = (fTemp712 / fTemp714);
        this.fRec499[<i32>(0)] = ((<f32>(2.0) * fTemp715) - this.fRec499[<i32>(1)]);
        const fTemp716: f32 = (this.fRec500[<i32>(1)] + (fSlow104 * (fTemp712 / (fTemp711 * fTemp714))));
        this.fRec500[<i32>(0)] = ((<f32>(2.0) * fTemp716) - this.fRec500[<i32>(1)]);
        const fRec501: f32 = fTemp709;
        const fRec502: f32 = fTemp715;
        const fRec503: f32 = fTemp716;
        const fTemp717: f32 = (fTemp710 + <f32>(-1.0));
        const fTemp718: f32 = (Mathf.pow(fTemp710, <f32>(2.0)) + <f32>(-1.0));
        const fTemp719: f32 = ((fRec501 + (<f32>(2.0) * (fRec502 * fTemp717))) + (fRec503 * fTemp718));
        const fTemp720: f32 = (this.fRec494[<i32>(1)] + (fSlow104 * ((fTemp719 - this.fRec495[<i32>(1)]) / fTemp711)));
        const fTemp721: f32 = ((fSlow104 * ((fTemp713 + <f32>(1.4144272)) / fTemp711)) + <f32>(1.0));
        const fTemp722: f32 = (fTemp720 / fTemp721);
        this.fRec494[<i32>(0)] = ((<f32>(2.0) * fTemp722) - this.fRec494[<i32>(1)]);
        const fTemp723: f32 = (this.fRec495[<i32>(1)] + (fSlow104 * (fTemp720 / (fTemp711 * fTemp721))));
        this.fRec495[<i32>(0)] = ((<f32>(2.0) * fTemp723) - this.fRec495[<i32>(1)]);
        const fRec496: f32 = fTemp719;
        const fRec497: f32 = fTemp722;
        const fRec498: f32 = fTemp723;
        const fTemp724: f32 = ((fRec496 + (<f32>(1.4144272) * (fRec497 * fTemp717))) + (fRec498 * fTemp718));
        const fTemp725: f32 = (this.fRec489[<i32>(1)] + (fSlow104 * ((fTemp724 - this.fRec490[<i32>(1)]) / fTemp711)));
        const fTemp726: f32 = ((fSlow104 * ((fTemp713 + <f32>(0.5)) / fTemp711)) + <f32>(1.0));
        const fTemp727: f32 = (fTemp725 / fTemp726);
        this.fRec489[<i32>(0)] = ((<f32>(2.0) * fTemp727) - this.fRec489[<i32>(1)]);
        const fTemp728: f32 = (this.fRec490[<i32>(1)] + (fSlow104 * (fTemp725 / (fTemp711 * fTemp726))));
        this.fRec490[<i32>(0)] = ((<f32>(2.0) * fTemp728) - this.fRec490[<i32>(1)]);
        const fRec491: f32 = fTemp724;
        const fRec492: f32 = fTemp727;
        const fRec493: f32 = fTemp728;
        const fTemp729: f32 = ((fRec491 + (<f32>(0.5) * (fRec492 * fTemp717))) + (fRec493 * fTemp718));
        const fTemp730: f32 = (this.fRec369[<i32>(0)] + (fSlow262 * (fTemp413 - this.fRec369[<i32>(0)])));
        this.fVbargraph21 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp730));
        const fTemp731: f32 = (<f32>(0.008333334) * fTemp730);
        const fTemp732: f32 = Mathf.pow(<f32>(1e+01), -fTemp731);
        const fTemp733: f32 = Mathf.sqrt(fTemp732);
        const fTemp734: f32 = (this.fRec484[<i32>(1)] + (fSlow104 * ((fTemp729 - this.fRec485[<i32>(1)]) / fTemp733)));
        const fTemp735: f32 = (fSlow104 / fTemp733);
        const fTemp736: f32 = ((fSlow104 * ((fTemp735 + <f32>(2.0)) / fTemp733)) + <f32>(1.0));
        const fTemp737: f32 = (fTemp734 / fTemp736);
        this.fRec484[<i32>(0)] = ((<f32>(2.0) * fTemp737) - this.fRec484[<i32>(1)]);
        const fTemp738: f32 = (this.fRec485[<i32>(1)] + (fSlow104 * (fTemp734 / (fTemp733 * fTemp736))));
        this.fRec485[<i32>(0)] = ((<f32>(2.0) * fTemp738) - this.fRec485[<i32>(1)]);
        const fRec486: f32 = fTemp729;
        const fRec487: f32 = fTemp737;
        const fRec488: f32 = fTemp738;
        const fTemp739: f32 = (fTemp732 + <f32>(-1.0));
        const fTemp740: f32 = (Mathf.pow(fTemp732, <f32>(2.0)) + <f32>(-1.0));
        const fTemp741: f32 = ((fRec486 + (<f32>(2.0) * (fRec487 * fTemp739))) + (fRec488 * fTemp740));
        const fTemp742: f32 = (this.fRec479[<i32>(1)] + (fSlow104 * ((fTemp741 - this.fRec480[<i32>(1)]) / fTemp733)));
        const fTemp743: f32 = ((fSlow104 * ((fTemp735 + <f32>(1.4144272)) / fTemp733)) + <f32>(1.0));
        const fTemp744: f32 = (fTemp742 / fTemp743);
        this.fRec479[<i32>(0)] = ((<f32>(2.0) * fTemp744) - this.fRec479[<i32>(1)]);
        const fTemp745: f32 = (this.fRec480[<i32>(1)] + (fSlow104 * (fTemp742 / (fTemp733 * fTemp743))));
        this.fRec480[<i32>(0)] = ((<f32>(2.0) * fTemp745) - this.fRec480[<i32>(1)]);
        const fRec481: f32 = fTemp741;
        const fRec482: f32 = fTemp744;
        const fRec483: f32 = fTemp745;
        const fTemp746: f32 = ((fRec481 + (<f32>(1.4144272) * (fRec482 * fTemp739))) + (fRec483 * fTemp740));
        const fTemp747: f32 = (this.fRec474[<i32>(1)] + (fSlow104 * ((fTemp746 - this.fRec475[<i32>(1)]) / fTemp733)));
        const fTemp748: f32 = ((fSlow104 * ((fTemp735 + <f32>(0.5)) / fTemp733)) + <f32>(1.0));
        const fTemp749: f32 = (fTemp747 / fTemp748);
        this.fRec474[<i32>(0)] = ((<f32>(2.0) * fTemp749) - this.fRec474[<i32>(1)]);
        const fTemp750: f32 = (this.fRec475[<i32>(1)] + (fSlow104 * (fTemp747 / (fTemp733 * fTemp748))));
        this.fRec475[<i32>(0)] = ((<f32>(2.0) * fTemp750) - this.fRec475[<i32>(1)]);
        const fRec476: f32 = fTemp746;
        const fRec477: f32 = fTemp749;
        const fRec478: f32 = fTemp750;
        const fTemp751: f32 = ((fRec476 + (<f32>(0.5) * (fRec477 * fTemp739))) + (fRec478 * fTemp740));
        const fTemp752: f32 = Mathf.pow(<f32>(1e+01), fTemp731);
        const fTemp753: f32 = Mathf.sqrt(fTemp752);
        const fTemp754: f32 = (this.fRec469[<i32>(1)] + (fSlow103 * ((fTemp751 - this.fRec470[<i32>(1)]) / fTemp753)));
        const fTemp755: f32 = (fSlow103 / fTemp753);
        const fTemp756: f32 = ((fSlow103 * ((fTemp755 + <f32>(2.0)) / fTemp753)) + <f32>(1.0));
        const fTemp757: f32 = (fTemp754 / fTemp756);
        this.fRec469[<i32>(0)] = ((<f32>(2.0) * fTemp757) - this.fRec469[<i32>(1)]);
        const fTemp758: f32 = (this.fRec470[<i32>(1)] + (fSlow103 * (fTemp754 / (fTemp753 * fTemp756))));
        this.fRec470[<i32>(0)] = ((<f32>(2.0) * fTemp758) - this.fRec470[<i32>(1)]);
        const fRec471: f32 = fTemp751;
        const fRec472: f32 = fTemp757;
        const fRec473: f32 = fTemp758;
        const fTemp759: f32 = (fTemp752 + <f32>(-1.0));
        const fTemp760: f32 = (Mathf.pow(fTemp752, <f32>(2.0)) + <f32>(-1.0));
        const fTemp761: f32 = ((fRec471 + (<f32>(2.0) * (fRec472 * fTemp759))) + (fRec473 * fTemp760));
        const fTemp762: f32 = (this.fRec464[<i32>(1)] + (fSlow103 * ((fTemp761 - this.fRec465[<i32>(1)]) / fTemp753)));
        const fTemp763: f32 = ((fSlow103 * ((fTemp755 + <f32>(1.4144272)) / fTemp753)) + <f32>(1.0));
        const fTemp764: f32 = (fTemp762 / fTemp763);
        this.fRec464[<i32>(0)] = ((<f32>(2.0) * fTemp764) - this.fRec464[<i32>(1)]);
        const fTemp765: f32 = (this.fRec465[<i32>(1)] + (fSlow103 * (fTemp762 / (fTemp753 * fTemp763))));
        this.fRec465[<i32>(0)] = ((<f32>(2.0) * fTemp765) - this.fRec465[<i32>(1)]);
        const fRec466: f32 = fTemp761;
        const fRec467: f32 = fTemp764;
        const fRec468: f32 = fTemp765;
        const fTemp766: f32 = ((fRec466 + (<f32>(1.4144272) * (fRec467 * fTemp759))) + (fRec468 * fTemp760));
        const fTemp767: f32 = (this.fRec459[<i32>(1)] + (fSlow103 * ((fTemp766 - this.fRec460[<i32>(1)]) / fTemp753)));
        const fTemp768: f32 = ((fSlow103 * ((fTemp755 + <f32>(0.5)) / fTemp753)) + <f32>(1.0));
        const fTemp769: f32 = (fTemp767 / fTemp768);
        this.fRec459[<i32>(0)] = ((<f32>(2.0) * fTemp769) - this.fRec459[<i32>(1)]);
        const fTemp770: f32 = (this.fRec460[<i32>(1)] + (fSlow103 * (fTemp767 / (fTemp753 * fTemp768))));
        this.fRec460[<i32>(0)] = ((<f32>(2.0) * fTemp770) - this.fRec460[<i32>(1)]);
        const fRec461: f32 = fTemp766;
        const fRec462: f32 = fTemp769;
        const fRec463: f32 = fTemp770;
        const fTemp771: f32 = ((fRec461 + (<f32>(0.5) * (fRec462 * fTemp759))) + (fRec463 * fTemp760));
        const fTemp772: f32 = (this.fRec375[<i32>(0)] + (fSlow279 * (fTemp466 - this.fRec375[<i32>(0)])));
        this.fVbargraph22 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp772));
        const fTemp773: f32 = (<f32>(0.008333334) * fTemp772);
        const fTemp774: f32 = Mathf.pow(<f32>(1e+01), -fTemp773);
        const fTemp775: f32 = Mathf.sqrt(fTemp774);
        const fTemp776: f32 = (this.fRec454[<i32>(1)] + (fSlow103 * ((fTemp771 - this.fRec455[<i32>(1)]) / fTemp775)));
        const fTemp777: f32 = (fSlow103 / fTemp775);
        const fTemp778: f32 = ((fSlow103 * ((fTemp777 + <f32>(2.0)) / fTemp775)) + <f32>(1.0));
        const fTemp779: f32 = (fTemp776 / fTemp778);
        this.fRec454[<i32>(0)] = ((<f32>(2.0) * fTemp779) - this.fRec454[<i32>(1)]);
        const fTemp780: f32 = (this.fRec455[<i32>(1)] + (fSlow103 * (fTemp776 / (fTemp775 * fTemp778))));
        this.fRec455[<i32>(0)] = ((<f32>(2.0) * fTemp780) - this.fRec455[<i32>(1)]);
        const fRec456: f32 = fTemp771;
        const fRec457: f32 = fTemp779;
        const fRec458: f32 = fTemp780;
        const fTemp781: f32 = (fTemp774 + <f32>(-1.0));
        const fTemp782: f32 = (Mathf.pow(fTemp774, <f32>(2.0)) + <f32>(-1.0));
        const fTemp783: f32 = ((fRec456 + (<f32>(2.0) * (fRec457 * fTemp781))) + (fRec458 * fTemp782));
        const fTemp784: f32 = (this.fRec449[<i32>(1)] + (fSlow103 * ((fTemp783 - this.fRec450[<i32>(1)]) / fTemp775)));
        const fTemp785: f32 = ((fSlow103 * ((fTemp777 + <f32>(1.4144272)) / fTemp775)) + <f32>(1.0));
        const fTemp786: f32 = (fTemp784 / fTemp785);
        this.fRec449[<i32>(0)] = ((<f32>(2.0) * fTemp786) - this.fRec449[<i32>(1)]);
        const fTemp787: f32 = (this.fRec450[<i32>(1)] + (fSlow103 * (fTemp784 / (fTemp775 * fTemp785))));
        this.fRec450[<i32>(0)] = ((<f32>(2.0) * fTemp787) - this.fRec450[<i32>(1)]);
        const fRec451: f32 = fTemp783;
        const fRec452: f32 = fTemp786;
        const fRec453: f32 = fTemp787;
        const fTemp788: f32 = ((fRec451 + (<f32>(1.4144272) * (fRec452 * fTemp781))) + (fRec453 * fTemp782));
        const fTemp789: f32 = (this.fRec444[<i32>(1)] + (fSlow103 * ((fTemp788 - this.fRec445[<i32>(1)]) / fTemp775)));
        const fTemp790: f32 = ((fSlow103 * ((fTemp777 + <f32>(0.5)) / fTemp775)) + <f32>(1.0));
        const fTemp791: f32 = (fTemp789 / fTemp790);
        this.fRec444[<i32>(0)] = ((<f32>(2.0) * fTemp791) - this.fRec444[<i32>(1)]);
        const fTemp792: f32 = (this.fRec445[<i32>(1)] + (fSlow103 * (fTemp789 / (fTemp775 * fTemp790))));
        this.fRec445[<i32>(0)] = ((<f32>(2.0) * fTemp792) - this.fRec445[<i32>(1)]);
        const fRec446: f32 = fTemp788;
        const fRec447: f32 = fTemp791;
        const fRec448: f32 = fTemp792;
        const fTemp793: f32 = ((fRec446 + (<f32>(0.5) * (fRec447 * fTemp781))) + (fRec448 * fTemp782));
        const fTemp794: f32 = Mathf.pow(<f32>(1e+01), fTemp773);
        const fTemp795: f32 = Mathf.sqrt(fTemp794);
        const fTemp796: f32 = (this.fRec439[<i32>(1)] + (fSlow102 * ((fTemp793 - this.fRec440[<i32>(1)]) / fTemp795)));
        const fTemp797: f32 = (fSlow102 / fTemp795);
        const fTemp798: f32 = ((fSlow102 * ((fTemp797 + <f32>(2.0)) / fTemp795)) + <f32>(1.0));
        const fTemp799: f32 = (fTemp796 / fTemp798);
        this.fRec439[<i32>(0)] = ((<f32>(2.0) * fTemp799) - this.fRec439[<i32>(1)]);
        const fTemp800: f32 = (this.fRec440[<i32>(1)] + (fSlow102 * (fTemp796 / (fTemp795 * fTemp798))));
        this.fRec440[<i32>(0)] = ((<f32>(2.0) * fTemp800) - this.fRec440[<i32>(1)]);
        const fRec441: f32 = fTemp793;
        const fRec442: f32 = fTemp799;
        const fRec443: f32 = fTemp800;
        const fTemp801: f32 = (fTemp794 + <f32>(-1.0));
        const fTemp802: f32 = (Mathf.pow(fTemp794, <f32>(2.0)) + <f32>(-1.0));
        const fTemp803: f32 = ((fRec441 + (<f32>(2.0) * (fRec442 * fTemp801))) + (fRec443 * fTemp802));
        const fTemp804: f32 = (this.fRec434[<i32>(1)] + (fSlow102 * ((fTemp803 - this.fRec435[<i32>(1)]) / fTemp795)));
        const fTemp805: f32 = ((fSlow102 * ((fTemp797 + <f32>(1.4144272)) / fTemp795)) + <f32>(1.0));
        const fTemp806: f32 = (fTemp804 / fTemp805);
        this.fRec434[<i32>(0)] = ((<f32>(2.0) * fTemp806) - this.fRec434[<i32>(1)]);
        const fTemp807: f32 = (this.fRec435[<i32>(1)] + (fSlow102 * (fTemp804 / (fTemp795 * fTemp805))));
        this.fRec435[<i32>(0)] = ((<f32>(2.0) * fTemp807) - this.fRec435[<i32>(1)]);
        const fRec436: f32 = fTemp803;
        const fRec437: f32 = fTemp806;
        const fRec438: f32 = fTemp807;
        const fTemp808: f32 = ((fRec436 + (<f32>(1.4144272) * (fRec437 * fTemp801))) + (fRec438 * fTemp802));
        const fTemp809: f32 = (this.fRec429[<i32>(1)] + (fSlow102 * ((fTemp808 - this.fRec430[<i32>(1)]) / fTemp795)));
        const fTemp810: f32 = ((fSlow102 * ((fTemp797 + <f32>(0.5)) / fTemp795)) + <f32>(1.0));
        const fTemp811: f32 = (fTemp809 / fTemp810);
        this.fRec429[<i32>(0)] = ((<f32>(2.0) * fTemp811) - this.fRec429[<i32>(1)]);
        const fTemp812: f32 = (this.fRec430[<i32>(1)] + (fSlow102 * (fTemp809 / (fTemp795 * fTemp810))));
        this.fRec430[<i32>(0)] = ((<f32>(2.0) * fTemp812) - this.fRec430[<i32>(1)]);
        const fRec431: f32 = fTemp808;
        const fRec432: f32 = fTemp811;
        const fRec433: f32 = fTemp812;
        const fTemp813: f32 = ((fRec431 + (<f32>(0.5) * (fRec432 * fTemp801))) + (fRec433 * fTemp802));
        const fTemp814: f32 = (this.fRec381[<i32>(0)] + (fSlow296 * (fTemp519 - this.fRec381[<i32>(0)])));
        this.fVbargraph23 = min<f32>(<f32>(0.0), max<f32>(<f32>(-6.0), fTemp814));
        const fTemp815: f32 = (<f32>(0.008333334) * fTemp814);
        const fTemp816: f32 = Mathf.pow(<f32>(1e+01), -fTemp815);
        const fTemp817: f32 = Mathf.sqrt(fTemp816);
        const fTemp818: f32 = (this.fRec424[<i32>(1)] + (fSlow102 * ((fTemp813 - this.fRec425[<i32>(1)]) / fTemp817)));
        const fTemp819: f32 = (fSlow102 / fTemp817);
        const fTemp820: f32 = ((fSlow102 * ((fTemp819 + <f32>(2.0)) / fTemp817)) + <f32>(1.0));
        const fTemp821: f32 = (fTemp818 / fTemp820);
        this.fRec424[<i32>(0)] = ((<f32>(2.0) * fTemp821) - this.fRec424[<i32>(1)]);
        const fTemp822: f32 = (this.fRec425[<i32>(1)] + (fSlow102 * (fTemp818 / (fTemp817 * fTemp820))));
        this.fRec425[<i32>(0)] = ((<f32>(2.0) * fTemp822) - this.fRec425[<i32>(1)]);
        const fRec426: f32 = fTemp813;
        const fRec427: f32 = fTemp821;
        const fRec428: f32 = fTemp822;
        const fTemp823: f32 = (fTemp816 + <f32>(-1.0));
        const fTemp824: f32 = (Mathf.pow(fTemp816, <f32>(2.0)) + <f32>(-1.0));
        const fTemp825: f32 = ((fRec426 + (<f32>(2.0) * (fRec427 * fTemp823))) + (fRec428 * fTemp824));
        const fTemp826: f32 = (this.fRec419[<i32>(1)] + (fSlow102 * ((fTemp825 - this.fRec420[<i32>(1)]) / fTemp817)));
        const fTemp827: f32 = ((fSlow102 * ((fTemp819 + <f32>(1.4144272)) / fTemp817)) + <f32>(1.0));
        const fTemp828: f32 = (fTemp826 / fTemp827);
        this.fRec419[<i32>(0)] = ((<f32>(2.0) * fTemp828) - this.fRec419[<i32>(1)]);
        const fTemp829: f32 = (this.fRec420[<i32>(1)] + (fSlow102 * (fTemp826 / (fTemp817 * fTemp827))));
        this.fRec420[<i32>(0)] = ((<f32>(2.0) * fTemp829) - this.fRec420[<i32>(1)]);
        const fRec421: f32 = fTemp825;
        const fRec422: f32 = fTemp828;
        const fRec423: f32 = fTemp829;
        const fTemp830: f32 = ((fRec421 + (<f32>(1.4144272) * (fRec422 * fTemp823))) + (fRec423 * fTemp824));
        const fTemp831: f32 = (this.fRec414[<i32>(1)] + (fSlow102 * ((fTemp830 - this.fRec415[<i32>(1)]) / fTemp817)));
        const fTemp832: f32 = ((fSlow102 * ((fTemp819 + <f32>(0.5)) / fTemp817)) + <f32>(1.0));
        const fTemp833: f32 = (fTemp831 / fTemp832);
        this.fRec414[<i32>(0)] = ((<f32>(2.0) * fTemp833) - this.fRec414[<i32>(1)]);
        const fTemp834: f32 = (this.fRec415[<i32>(1)] + (fSlow102 * (fTemp831 / (fTemp817 * fTemp832))));
        this.fRec415[<i32>(0)] = ((<f32>(2.0) * fTemp834) - this.fRec415[<i32>(1)]);
        const fRec416: f32 = fTemp830;
        const fRec417: f32 = fTemp833;
        const fRec418: f32 = fTemp834;
        const fTemp835: f32 = ((fRec416 + (<f32>(0.5) * (fRec417 * fTemp823))) + (fRec418 * fTemp824));
        const fTemp836: f32 = Mathf.pow(<f32>(1e+01), fTemp815);
        const fTemp837: f32 = Mathf.sqrt(fTemp836);
        const fTemp838: f32 = (this.fRec409[<i32>(1)] + (fSlow66 * ((fTemp835 - this.fRec410[<i32>(1)]) / fTemp837)));
        const fTemp839: f32 = (fSlow66 / fTemp837);
        const fTemp840: f32 = ((fSlow66 * ((fTemp839 + <f32>(2.0)) / fTemp837)) + <f32>(1.0));
        const fTemp841: f32 = (fTemp838 / fTemp840);
        this.fRec409[<i32>(0)] = ((<f32>(2.0) * fTemp841) - this.fRec409[<i32>(1)]);
        const fTemp842: f32 = (this.fRec410[<i32>(1)] + (fSlow66 * (fTemp838 / (fTemp837 * fTemp840))));
        this.fRec410[<i32>(0)] = ((<f32>(2.0) * fTemp842) - this.fRec410[<i32>(1)]);
        const fRec411: f32 = fTemp835;
        const fRec412: f32 = fTemp841;
        const fRec413: f32 = fTemp842;
        const fTemp843: f32 = (fTemp836 + <f32>(-1.0));
        const fTemp844: f32 = (Mathf.pow(fTemp836, <f32>(2.0)) + <f32>(-1.0));
        const fTemp845: f32 = ((fRec411 + (<f32>(2.0) * (fRec412 * fTemp843))) + (fRec413 * fTemp844));
        const fTemp846: f32 = (this.fRec404[<i32>(1)] + (fSlow66 * ((fTemp845 - this.fRec405[<i32>(1)]) / fTemp837)));
        const fTemp847: f32 = ((fSlow66 * ((fTemp839 + <f32>(1.4144272)) / fTemp837)) + <f32>(1.0));
        const fTemp848: f32 = (fTemp846 / fTemp847);
        this.fRec404[<i32>(0)] = ((<f32>(2.0) * fTemp848) - this.fRec404[<i32>(1)]);
        const fTemp849: f32 = (this.fRec405[<i32>(1)] + (fSlow66 * (fTemp846 / (fTemp837 * fTemp847))));
        this.fRec405[<i32>(0)] = ((<f32>(2.0) * fTemp849) - this.fRec405[<i32>(1)]);
        const fRec406: f32 = fTemp845;
        const fRec407: f32 = fTemp848;
        const fRec408: f32 = fTemp849;
        const fTemp850: f32 = ((fRec406 + (<f32>(1.4144272) * (fRec407 * fTemp843))) + (fRec408 * fTemp844));
        const fTemp851: f32 = (this.fRec399[<i32>(1)] + (fSlow66 * ((fTemp850 - this.fRec400[<i32>(1)]) / fTemp837)));
        const fTemp852: f32 = ((fSlow66 * ((fTemp839 + <f32>(0.5)) / fTemp837)) + <f32>(1.0));
        const fTemp853: f32 = (fTemp851 / fTemp852);
        this.fRec399[<i32>(0)] = ((<f32>(2.0) * fTemp853) - this.fRec399[<i32>(1)]);
        const fTemp854: f32 = (this.fRec400[<i32>(1)] + (fSlow66 * (fTemp851 / (fTemp837 * fTemp852))));
        this.fRec400[<i32>(0)] = ((<f32>(2.0) * fTemp854) - this.fRec400[<i32>(1)]);
        const fRec401: f32 = fTemp850;
        const fRec402: f32 = fTemp853;
        const fRec403: f32 = fTemp854;
        const fTemp855: f32 = ((fRec401 + (<f32>(0.5) * (fRec402 * fTemp843))) + (fRec403 * fTemp844));
        const fTemp856: f32 = (this.fRec394[<i32>(1)] + (fSlow66 * (fTemp582 * (fTemp855 - this.fRec395[<i32>(1)]))));
        const fTemp857: f32 = (fSlow66 * fTemp582);
        const fTemp858: f32 = ((fSlow66 * (fTemp582 * (fTemp857 + <f32>(2.0)))) + <f32>(1.0));
        const fTemp859: f32 = (fTemp856 / fTemp858);
        this.fRec394[<i32>(0)] = ((<f32>(2.0) * fTemp859) - this.fRec394[<i32>(1)]);
        const fTemp860: f32 = (this.fRec395[<i32>(1)] + (fSlow66 * ((fTemp582 * fTemp856) / fTemp858)));
        this.fRec395[<i32>(0)] = ((<f32>(2.0) * fTemp860) - this.fRec395[<i32>(1)]);
        const fRec396: f32 = fTemp855;
        const fRec397: f32 = fTemp859;
        const fRec398: f32 = fTemp860;
        const fTemp861: f32 = (<f32>(1.0) - fTemp581);
        const fTemp862: f32 = (<f32>(1.0) - Mathf.pow(fTemp581, <f32>(2.0)));
        const fTemp863: f32 = ((fTemp581 * ((fRec396 * fTemp581) + (<f32>(2.0) * (fRec397 * fTemp861)))) + (fRec398 * fTemp862));
        const fTemp864: f32 = (this.fRec389[<i32>(1)] + (fSlow66 * (fTemp582 * (fTemp863 - this.fRec390[<i32>(1)]))));
        const fTemp865: f32 = ((fSlow66 * (fTemp582 * (fTemp857 + <f32>(1.4144272)))) + <f32>(1.0));
        const fTemp866: f32 = (fTemp864 / fTemp865);
        this.fRec389[<i32>(0)] = ((<f32>(2.0) * fTemp866) - this.fRec389[<i32>(1)]);
        const fTemp867: f32 = (this.fRec390[<i32>(1)] + (fSlow66 * ((fTemp582 * fTemp864) / fTemp865)));
        this.fRec390[<i32>(0)] = ((<f32>(2.0) * fTemp867) - this.fRec390[<i32>(1)]);
        const fRec391: f32 = fTemp863;
        const fRec392: f32 = fTemp866;
        const fRec393: f32 = fTemp867;
        const fTemp868: f32 = ((fTemp581 * ((fRec391 * fTemp581) + (<f32>(1.4144272) * (fRec392 * fTemp861)))) + (fRec393 * fTemp862));
        const fTemp869: f32 = (this.fRec384[<i32>(1)] + (fSlow66 * (fTemp582 * (fTemp868 - this.fRec385[<i32>(1)]))));
        const fTemp870: f32 = ((fSlow66 * (fTemp582 * (fTemp857 + <f32>(0.5)))) + <f32>(1.0));
        const fTemp871: f32 = (fTemp869 / fTemp870);
        this.fRec384[<i32>(0)] = ((<f32>(2.0) * fTemp871) - this.fRec384[<i32>(1)]);
        const fTemp872: f32 = (this.fRec385[<i32>(1)] + (fSlow66 * ((fTemp582 * fTemp869) / fTemp870)));
        this.fRec385[<i32>(0)] = ((<f32>(2.0) * fTemp872) - this.fRec385[<i32>(1)]);
        const fRec386: f32 = fTemp868;
        const fRec387: f32 = fTemp871;
        const fRec388: f32 = fTemp872;
        const fTemp873: f32 = ((fTemp581 * ((fRec386 * fTemp581) + (<f32>(0.5) * (fRec387 * fTemp861)))) + (fRec388 * fTemp862));
        const fTemp874: f32 = ((fTemp156 * fTemp179) + (fTemp180 * (fTemp579 + fTemp873)));
        const fTemp875: f32 = Mathf.abs(this.fRec6[<i32>(1)]);
        this.fRec595[(this.IOTA0 & <i32>(131071))] = (this.fRec595[((this.IOTA0 - <i32>(1)) & <i32>(131071))] + Mathf.pow((fTemp875 + (fSlow297 * (Mathf.abs(fTemp874) - fTemp875))), <f32>(2.0)));
        const fTemp876: f32 = Mathf.sqrt((fSlow300 * (this.fRec595[(this.IOTA0 & <i32>(131071))] - this.fRec595[((this.IOTA0 - iSlow301) & <i32>(131071))])));
        const fTemp877: f32 = ((fTemp876 > this.fRec594[<i32>(1)]) ? fSlow304 : <f32>(0.0));
        this.fRec594[<i32>(0)] = ((fTemp876 * (<f32>(1.0) - fTemp877)) + (this.fRec594[<i32>(1)] * fTemp877));
        const fTemp878: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), this.fRec594[<i32>(0)])));
        const iTemp879: i32 = (<i32>(fTemp878 > fSlow308) + <i32>(fTemp878 > fSlow309));
        const fTemp880: f32 = (fTemp878 - fSlow305);
        const fTemp881: f32 = Mathf.abs(this.fRec7[<i32>(1)]);
        const fTemp882: f32 = ((fTemp156 * fTemp181) + (fTemp180 * (fTemp579 - fTemp873)));
        this.fRec597[(this.IOTA0 & <i32>(131071))] = (this.fRec597[((this.IOTA0 - <i32>(1)) & <i32>(131071))] + Mathf.pow((fTemp881 + (fSlow297 * (Mathf.abs(fTemp882) - fTemp881))), <f32>(2.0)));
        const fTemp883: f32 = Mathf.sqrt((fSlow300 * (this.fRec597[(this.IOTA0 & <i32>(131071))] - this.fRec597[((this.IOTA0 - iSlow301) & <i32>(131071))])));
        const fTemp884: f32 = ((fTemp883 > this.fRec596[<i32>(1)]) ? fSlow304 : <f32>(0.0));
        this.fRec596[<i32>(0)] = ((fTemp883 * (<f32>(1.0) - fTemp884)) + (this.fRec596[<i32>(1)] * fTemp884));
        const fTemp885: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), this.fRec596[<i32>(0)])));
        const iTemp886: i32 = (<i32>(fTemp885 > fSlow308) + <i32>(fTemp885 > fSlow309));
        const fTemp887: f32 = (fTemp885 - fSlow305);
        const fTemp888: f32 = min<f32>(-((fSlow298 * max<f32>(<f32>(0.0), ((iTemp879 == <i32>(0)) ? <f32>(0.0) : ((iTemp879 == <i32>(1)) ? (fSlow310 * Mathf.pow((fSlow307 + fTemp880), <f32>(2.0))) : fTemp880))))), -((fSlow298 * max<f32>(<f32>(0.0), ((iTemp886 == <i32>(0)) ? <f32>(0.0) : ((iTemp886 == <i32>(1)) ? (fSlow310 * Mathf.pow((fSlow307 + fTemp887), <f32>(2.0))) : fTemp887))))));
        this.fVbargraph24 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), fTemp888)));
        const fTemp889: f32 = Mathf.pow(<f32>(1e+01), (<f32>(0.05) * fTemp888));
        this.fRec6[<i32>(0)] = (fTemp874 * fTemp889);
        this.fRec7[<i32>(0)] = (fTemp882 * fTemp889);
        this.fRec598[<i32>(0)] = (fSlow311 + (this.fConst3 * this.fRec598[<i32>(1)]));
        this.fRec599[<i32>(0)] = (fSlow312 + (this.fConst3 * this.fRec599[<i32>(1)]));
        const fTemp890: f32 = (<f32>(1.0) - this.fRec599[<i32>(0)]);
        const fTemp891: f32 = (((this.fRec6[<i32>(0)] * this.fRec598[<i32>(0)]) * fTemp890) + (this.fRec599[<i32>(0)] * fTemp874));
        this.fRec600[<i32>(0)] = (fSlow313 + (this.fConst3 * this.fRec600[<i32>(1)]));
        const fTemp892: f32 = Mathf.abs(fTemp891);
        const fTemp893: f32 = ((fTemp892 > this.fRec601[<i32>(1)]) ? <f32>(0.0) : fSlow316);
        this.fRec601[<i32>(0)] = ((fTemp892 * (<f32>(1.0) - fTemp893)) + (this.fRec601[<i32>(1)] * fTemp893));
        const fTemp894: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), this.fRec601[<i32>(0)])));
        const iTemp895: i32 = (<i32>(2) * <i32>(fTemp894 > fSlow317));
        const fTemp896: f32 = (fTemp894 - fSlow317);
        const fTemp897: f32 = ((this.fRec599[<i32>(0)] * fTemp882) + ((this.fRec598[<i32>(0)] * this.fRec7[<i32>(0)]) * fTemp890));
        const fTemp898: f32 = Mathf.abs(fTemp897);
        const fTemp899: f32 = ((fTemp898 > this.fRec602[<i32>(1)]) ? <f32>(0.0) : fSlow316);
        this.fRec602[<i32>(0)] = ((fTemp898 * (<f32>(1.0) - fTemp899)) + (this.fRec602[<i32>(1)] * fTemp899));
        const fTemp900: f32 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), this.fRec602[<i32>(0)])));
        const iTemp901: i32 = (<i32>(2) * <i32>(fTemp900 > fSlow317));
        const fTemp902: f32 = (fTemp900 - fSlow317);
        const fTemp903: f32 = min<f32>(-(max<f32>(<f32>(0.0), ((iTemp895 == <i32>(0)) ? <f32>(0.0) : ((iTemp895 == <i32>(1)) ? (<f32>(4194304.0) * Mathf.pow(fTemp896, <f32>(2.0))) : fTemp896)))), -(max<f32>(<f32>(0.0), ((iTemp901 == <i32>(0)) ? <f32>(0.0) : ((iTemp901 == <i32>(1)) ? (<f32>(4194304.0) * Mathf.pow(fTemp902, <f32>(2.0))) : fTemp902)))));
        this.fVbargraph25 = (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), fTemp903)));
        const fTemp904: f32 = (this.fRec600[<i32>(0)] + ((<f32>(1.0) - this.fRec600[<i32>(0)]) * Mathf.pow(<f32>(1e+01), (<f32>(0.05) * fTemp903))));
        this.fRec4[<i32>(0)] = (fTemp891 * fTemp904);
        this.fRec5[<i32>(0)] = (fTemp897 * fTemp904);
        this.fRec2[<i32>(0)] = this.fRec4[<i32>(0)];
        this.fRec3[<i32>(0)] = this.fRec5[<i32>(0)];
        const fTemp905: f32 = (<f32>(1.0) - this.fRec1[<i32>(0)]);
        const fTemp906: f32 = ((fTemp0 * this.fRec1[<i32>(0)]) + (this.fRec2[<i32>(0)] * fTemp905));
        this.fVec106[<i32>(0)] = fTemp906;
        this.fRec0[<i32>(0)] = max<f32>((this.fRec0[<i32>(1)] - this.fConst1), min<f32>(<f32>(1e+01), (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), max<f32>(<f32>(0.00031622776), Mathf.abs(fTemp906)))))));
        this.fVbargraph26 = this.fRec0[<i32>(0)];
        outputline.left = fTemp906;
        this.fVec107[<i32>(0)] = ((this.fConst21 * this.fRec606[<i32>(1)]) - (this.fConst23 * this.fVec106[<i32>(1)]));
        this.fRec607[<i32>(0)] = (this.fConst19 * (((this.fConst20 * this.fVec106[<i32>(1)]) - (this.fVec107[<i32>(1)] + (this.fConst24 * this.fRec607[<i32>(1)]))) + (this.fConst25 * fTemp906)));
        this.fRec606[<i32>(0)] = this.fRec607[<i32>(0)];
        this.fVec108[<i32>(0)] = ((<f32>(0.50032705) * this.fRec606[<i32>(1)]) - (this.fConst26 * this.fRec604[<i32>(1)]));
        this.fRec605[<i32>(0)] = (this.fConst15 * (((this.fVec108[<i32>(1)] - (this.fConst27 * this.fRec605[<i32>(1)])) - (<f32>(1.0006541) * this.fRec606[<i32>(1)])) + (<f32>(0.50032705) * this.fRec606[<i32>(0)])));
        this.fRec604[<i32>(0)] = this.fRec605[<i32>(0)];
        const fTemp907: f32 = Mathf.pow(this.fRec604[<i32>(0)], <f32>(2.0));
        this.fVec109[<i32>(0)] = fTemp907;
        const fTemp908: f32 = (fTemp907 + this.fVec109[<i32>(1)]);
        this.fVec110[<i32>(0)] = fTemp908;
        const fTemp909: f32 = (fTemp908 + this.fVec110[<i32>(2)]);
        this.fVec111[<i32>(0)] = fTemp909;
        const fTemp910: f32 = (fTemp909 + this.fVec111[<i32>(4)]);
        this.fVec112[<i32>(0)] = fTemp910;
        const fTemp911: f32 = (fTemp910 + this.fVec112[<i32>(8)]);
        this.fVec113[(this.IOTA0 & <i32>(31))] = fTemp911;
        const fTemp912: f32 = (fTemp911 + this.fVec113[((this.IOTA0 - <i32>(16)) & <i32>(31))]);
        this.fVec114[(this.IOTA0 & <i32>(63))] = fTemp912;
        const fTemp913: f32 = (fTemp912 + this.fVec114[((this.IOTA0 - <i32>(32)) & <i32>(63))]);
        this.fVec115[(this.IOTA0 & <i32>(127))] = fTemp913;
        const fTemp914: f32 = (fTemp913 + this.fVec115[((this.IOTA0 - <i32>(64)) & <i32>(127))]);
        this.fVec116[(this.IOTA0 & <i32>(255))] = fTemp914;
        const fTemp915: f32 = (fTemp914 + this.fVec116[((this.IOTA0 - <i32>(128)) & <i32>(255))]);
        this.fVec117[(this.IOTA0 & <i32>(511))] = fTemp915;
        const fTemp916: f32 = (fTemp915 + this.fVec117[((this.IOTA0 - <i32>(256)) & <i32>(511))]);
        this.fVec118[(this.IOTA0 & <i32>(1023))] = fTemp916;
        const fTemp917: f32 = (fTemp916 + this.fVec118[((this.IOTA0 - <i32>(512)) & <i32>(1023))]);
        this.fVec119[(this.IOTA0 & <i32>(2047))] = fTemp917;
        const fTemp918: f32 = (fTemp917 + this.fVec119[((this.IOTA0 - <i32>(1024)) & <i32>(2047))]);
        this.fVec120[(this.IOTA0 & <i32>(4095))] = fTemp918;
        const fTemp919: f32 = (fTemp918 + this.fVec120[((this.IOTA0 - <i32>(2048)) & <i32>(4095))]);
        this.fVec121[(this.IOTA0 & <i32>(8191))] = fTemp919;
        const fTemp920: f32 = (fTemp919 + this.fVec121[((this.IOTA0 - <i32>(4096)) & <i32>(8191))]);
        this.fVec122[(this.IOTA0 & <i32>(16383))] = fTemp920;
        const fTemp921: f32 = (fTemp920 + this.fVec122[((this.IOTA0 - <i32>(8192)) & <i32>(16383))]);
        this.fVec123[(this.IOTA0 & <i32>(32767))] = fTemp921;
        const fTemp922: f32 = (fTemp921 + this.fVec123[((this.IOTA0 - <i32>(16384)) & <i32>(32767))]);
        this.fVec124[(this.IOTA0 & <i32>(65535))] = fTemp922;
        const fTemp923: f32 = (fTemp922 + this.fVec124[((this.IOTA0 - <i32>(32768)) & <i32>(65535))]);
        this.fVec125[(this.IOTA0 & <i32>(131071))] = fTemp923;
        const fTemp924: f32 = (fTemp923 + this.fVec125[((this.IOTA0 - <i32>(65536)) & <i32>(131071))]);
        this.fVec126[(this.IOTA0 & <i32>(262143))] = fTemp924;
        const fTemp925: f32 = (fTemp924 + this.fVec126[((this.IOTA0 - <i32>(131072)) & <i32>(262143))]);
        this.fVec127[(this.IOTA0 & <i32>(524287))] = fTemp925;
        this.fVec128[(this.IOTA0 & <i32>(1048575))] = (fTemp925 + this.fVec127[((this.IOTA0 - <i32>(262144)) & <i32>(524287))]);
        const fTemp926: f32 = ((fTemp24 * this.fRec1[<i32>(0)]) + (this.fRec3[<i32>(0)] * fTemp905));
        this.fVec129[<i32>(0)] = fTemp926;
        this.fVec130[<i32>(0)] = ((this.fConst21 * this.fRec610[<i32>(1)]) - (this.fConst23 * this.fVec129[<i32>(1)]));
        this.fRec611[<i32>(0)] = (this.fConst19 * (((this.fConst20 * this.fVec129[<i32>(1)]) - (this.fVec130[<i32>(1)] + (this.fConst24 * this.fRec611[<i32>(1)]))) + (this.fConst25 * fTemp926)));
        this.fRec610[<i32>(0)] = this.fRec611[<i32>(0)];
        this.fVec131[<i32>(0)] = ((<f32>(0.50032705) * this.fRec610[<i32>(1)]) - (this.fConst26 * this.fRec608[<i32>(1)]));
        this.fRec609[<i32>(0)] = (this.fConst15 * (((this.fVec131[<i32>(1)] - (this.fConst27 * this.fRec609[<i32>(1)])) - (<f32>(1.0006541) * this.fRec610[<i32>(1)])) + (<f32>(0.50032705) * this.fRec610[<i32>(0)])));
        this.fRec608[<i32>(0)] = this.fRec609[<i32>(0)];
        const fTemp927: f32 = Mathf.pow(this.fRec608[<i32>(0)], <f32>(2.0));
        this.fVec132[<i32>(0)] = fTemp927;
        const fTemp928: f32 = (fTemp927 + this.fVec132[<i32>(1)]);
        this.fVec133[<i32>(0)] = fTemp928;
        const fTemp929: f32 = (fTemp928 + this.fVec133[<i32>(2)]);
        this.fVec134[<i32>(0)] = fTemp929;
        const fTemp930: f32 = (fTemp929 + this.fVec134[<i32>(4)]);
        this.fVec135[<i32>(0)] = fTemp930;
        const fTemp931: f32 = (fTemp930 + this.fVec135[<i32>(8)]);
        this.fVec136[(this.IOTA0 & <i32>(31))] = fTemp931;
        const fTemp932: f32 = (fTemp931 + this.fVec136[((this.IOTA0 - <i32>(16)) & <i32>(31))]);
        this.fVec137[(this.IOTA0 & <i32>(63))] = fTemp932;
        const fTemp933: f32 = (fTemp932 + this.fVec137[((this.IOTA0 - <i32>(32)) & <i32>(63))]);
        this.fVec138[(this.IOTA0 & <i32>(127))] = fTemp933;
        const fTemp934: f32 = (fTemp933 + this.fVec138[((this.IOTA0 - <i32>(64)) & <i32>(127))]);
        this.fVec139[(this.IOTA0 & <i32>(255))] = fTemp934;
        const fTemp935: f32 = (fTemp934 + this.fVec139[((this.IOTA0 - <i32>(128)) & <i32>(255))]);
        this.fVec140[(this.IOTA0 & <i32>(511))] = fTemp935;
        const fTemp936: f32 = (fTemp935 + this.fVec140[((this.IOTA0 - <i32>(256)) & <i32>(511))]);
        this.fVec141[(this.IOTA0 & <i32>(1023))] = fTemp936;
        const fTemp937: f32 = (fTemp936 + this.fVec141[((this.IOTA0 - <i32>(512)) & <i32>(1023))]);
        this.fVec142[(this.IOTA0 & <i32>(2047))] = fTemp937;
        const fTemp938: f32 = (fTemp937 + this.fVec142[((this.IOTA0 - <i32>(1024)) & <i32>(2047))]);
        this.fVec143[(this.IOTA0 & <i32>(4095))] = fTemp938;
        const fTemp939: f32 = (fTemp938 + this.fVec143[((this.IOTA0 - <i32>(2048)) & <i32>(4095))]);
        this.fVec144[(this.IOTA0 & <i32>(8191))] = fTemp939;
        const fTemp940: f32 = (fTemp939 + this.fVec144[((this.IOTA0 - <i32>(4096)) & <i32>(8191))]);
        this.fVec145[(this.IOTA0 & <i32>(16383))] = fTemp940;
        const fTemp941: f32 = (fTemp940 + this.fVec145[((this.IOTA0 - <i32>(8192)) & <i32>(16383))]);
        this.fVec146[(this.IOTA0 & <i32>(32767))] = fTemp941;
        const fTemp942: f32 = (fTemp941 + this.fVec146[((this.IOTA0 - <i32>(16384)) & <i32>(32767))]);
        this.fVec147[(this.IOTA0 & <i32>(65535))] = fTemp942;
        const fTemp943: f32 = (fTemp942 + this.fVec147[((this.IOTA0 - <i32>(32768)) & <i32>(65535))]);
        this.fVec148[(this.IOTA0 & <i32>(131071))] = fTemp943;
        const fTemp944: f32 = (fTemp943 + this.fVec148[((this.IOTA0 - <i32>(65536)) & <i32>(131071))]);
        this.fVec149[(this.IOTA0 & <i32>(262143))] = fTemp944;
        const fTemp945: f32 = (fTemp944 + this.fVec149[((this.IOTA0 - <i32>(131072)) & <i32>(262143))]);
        this.fVec150[(this.IOTA0 & <i32>(524287))] = fTemp945;
        this.fVec151[(this.IOTA0 & <i32>(1048575))] = (fTemp945 + this.fVec150[((this.IOTA0 - <i32>(262144)) & <i32>(524287))]);
        this.fVbargraph27 = ((<f32>(4.3429446) * Mathf.log(max<f32>(<f32>(1e-12), (this.fConst10 * ((((this.iConst11) ? this.fVec128[((this.IOTA0 - this.iConst64) & <i32>(1048575))] : <f32>(0.0)) + (((this.iConst63) ? this.fVec127[((this.IOTA0 - this.iConst62) & <i32>(524287))] : <f32>(0.0)) + (((this.iConst61) ? this.fVec126[((this.IOTA0 - this.iConst60) & <i32>(262143))] : <f32>(0.0)) + (((this.iConst59) ? this.fVec125[((this.IOTA0 - this.iConst58) & <i32>(131071))] : <f32>(0.0)) + (((this.iConst57) ? this.fVec124[((this.IOTA0 - this.iConst56) & <i32>(65535))] : <f32>(0.0)) + (((this.iConst55) ? this.fVec123[((this.IOTA0 - this.iConst54) & <i32>(32767))] : <f32>(0.0)) + (((this.iConst53) ? this.fVec122[((this.IOTA0 - this.iConst52) & <i32>(16383))] : <f32>(0.0)) + (((this.iConst51) ? this.fVec121[((this.IOTA0 - this.iConst50) & <i32>(8191))] : <f32>(0.0)) + (((this.iConst49) ? this.fVec120[((this.IOTA0 - this.iConst48) & <i32>(4095))] : <f32>(0.0)) + (((this.iConst47) ? this.fVec119[((this.IOTA0 - this.iConst46) & <i32>(2047))] : <f32>(0.0)) + (((this.iConst45) ? this.fVec118[((this.IOTA0 - this.iConst44) & <i32>(1023))] : <f32>(0.0)) + (((this.iConst43) ? this.fVec117[((this.IOTA0 - this.iConst42) & <i32>(511))] : <f32>(0.0)) + (((this.iConst41) ? this.fVec116[((this.IOTA0 - this.iConst40) & <i32>(255))] : <f32>(0.0)) + (((this.iConst39) ? this.fVec115[((this.IOTA0 - this.iConst38) & <i32>(127))] : <f32>(0.0)) + (((this.iConst37) ? this.fVec114[((this.IOTA0 - this.iConst36) & <i32>(63))] : <f32>(0.0)) + (((this.iConst35) ? this.fVec113[((this.IOTA0 - this.iConst34) & <i32>(31))] : <f32>(0.0)) + (((this.iConst33) ? this.fVec112[this.iConst32] : <f32>(0.0)) + (((this.iConst31) ? this.fVec111[this.iConst30] : <f32>(0.0)) + (((this.iConst28) ? fTemp907 : <f32>(0.0)) + ((this.iConst29) ? this.fVec110[this.iConst28] : <f32>(0.0))))))))))))))))))))) + (((this.iConst11) ? this.fVec151[((this.IOTA0 - this.iConst64) & <i32>(1048575))] : <f32>(0.0)) + (((this.iConst63) ? this.fVec150[((this.IOTA0 - this.iConst62) & <i32>(524287))] : <f32>(0.0)) + (((this.iConst61) ? this.fVec149[((this.IOTA0 - this.iConst60) & <i32>(262143))] : <f32>(0.0)) + (((this.iConst59) ? this.fVec148[((this.IOTA0 - this.iConst58) & <i32>(131071))] : <f32>(0.0)) + (((this.iConst57) ? this.fVec147[((this.IOTA0 - this.iConst56) & <i32>(65535))] : <f32>(0.0)) + (((this.iConst55) ? this.fVec146[((this.IOTA0 - this.iConst54) & <i32>(32767))] : <f32>(0.0)) + (((this.iConst53) ? this.fVec145[((this.IOTA0 - this.iConst52) & <i32>(16383))] : <f32>(0.0)) + (((this.iConst51) ? this.fVec144[((this.IOTA0 - this.iConst50) & <i32>(8191))] : <f32>(0.0)) + (((this.iConst49) ? this.fVec143[((this.IOTA0 - this.iConst48) & <i32>(4095))] : <f32>(0.0)) + (((this.iConst47) ? this.fVec142[((this.IOTA0 - this.iConst46) & <i32>(2047))] : <f32>(0.0)) + (((this.iConst45) ? this.fVec141[((this.IOTA0 - this.iConst44) & <i32>(1023))] : <f32>(0.0)) + (((this.iConst43) ? this.fVec140[((this.IOTA0 - this.iConst42) & <i32>(511))] : <f32>(0.0)) + (((this.iConst41) ? this.fVec139[((this.IOTA0 - this.iConst40) & <i32>(255))] : <f32>(0.0)) + (((this.iConst39) ? this.fVec138[((this.IOTA0 - this.iConst38) & <i32>(127))] : <f32>(0.0)) + (((this.iConst37) ? this.fVec137[((this.IOTA0 - this.iConst36) & <i32>(63))] : <f32>(0.0)) + (((this.iConst35) ? this.fVec136[((this.IOTA0 - this.iConst34) & <i32>(31))] : <f32>(0.0)) + (((this.iConst33) ? this.fVec135[this.iConst32] : <f32>(0.0)) + (((this.iConst31) ? this.fVec134[this.iConst30] : <f32>(0.0)) + (((this.iConst28) ? fTemp927 : <f32>(0.0)) + ((this.iConst29) ? this.fVec133[this.iConst28] : <f32>(0.0)))))))))))))))))))))))))) + <f32>(-0.691));
        const fTemp946: f32 = fTemp926;
        this.fRec603[<i32>(0)] = max<f32>((this.fRec603[<i32>(1)] - this.fConst1), min<f32>(<f32>(1e+01), (<f32>(2e+01) * Mathf.log10(max<f32>(<f32>(1.1754944e-38), max<f32>(<f32>(0.00031622776), Mathf.abs(fTemp946)))))));
        this.fVbargraph28 = this.fRec603[<i32>(0)];
        outputline.right = fTemp946;

        this.fRec1[<i32>(1)] = this.fRec1[<i32>(0)];
        this.fRec8[<i32>(1)] = this.fRec8[<i32>(0)];
        this.fRec9[<i32>(1)] = this.fRec9[<i32>(0)];
        this.fRec13[<i32>(1)] = this.fRec13[<i32>(0)];
        this.fRec16[<i32>(1)] = this.fRec16[<i32>(0)];
        this.fRec17[<i32>(1)] = this.fRec17[<i32>(0)];
        this.fRec19[<i32>(1)] = this.fRec19[<i32>(0)];
        this.fRec18[<i32>(1)] = this.fRec18[<i32>(0)];
        this.fVec0[<i32>(1)] = this.fVec0[<i32>(0)];
        this.fRec20[<i32>(1)] = this.fRec20[<i32>(0)];
        this.fRec21[<i32>(1)] = this.fRec21[<i32>(0)];
        this.fVec1[<i32>(1)] = this.fVec1[<i32>(0)];
        this.fRec26[<i32>(1)] = this.fRec26[<i32>(0)];
        this.fRec25[<i32>(1)] = this.fRec25[<i32>(0)];
        this.fVec2[<i32>(1)] = this.fVec2[<i32>(0)];
        this.fRec24[<i32>(1)] = this.fRec24[<i32>(0)];
        this.fRec23[<i32>(1)] = this.fRec23[<i32>(0)];
        this.fVec3[<i32>(1)] = this.fVec3[<i32>(0)];
        this.fVec4[<i32>(2)] = this.fVec4[<i32>(1)];
        this.fVec4[<i32>(1)] = this.fVec4[<i32>(0)];
        for (let j0: i32 = <i32>(4); j0 > <i32>(0); j0 = (j0 - <i32>(1))) {
        this.fVec5[j0] = this.fVec5[(j0 - <i32>(1))];
        }
        for (let j1: i32 = <i32>(11); j1 > <i32>(0); j1 = (j1 - <i32>(1))) {
        this.fVec6[j1] = this.fVec6[(j1 - <i32>(1))];
        }
        this.IOTA0 = (this.IOTA0 + <i32>(1));
        this.fRec31[<i32>(1)] = this.fRec31[<i32>(0)];
        this.fVec23[<i32>(1)] = this.fVec23[<i32>(0)];
        this.fVec24[<i32>(1)] = this.fVec24[<i32>(0)];
        this.fRec30[<i32>(1)] = this.fRec30[<i32>(0)];
        this.fRec29[<i32>(1)] = this.fRec29[<i32>(0)];
        this.fVec25[<i32>(1)] = this.fVec25[<i32>(0)];
        this.fRec28[<i32>(1)] = this.fRec28[<i32>(0)];
        this.fRec27[<i32>(1)] = this.fRec27[<i32>(0)];
        this.fVec26[<i32>(1)] = this.fVec26[<i32>(0)];
        this.fVec27[<i32>(2)] = this.fVec27[<i32>(1)];
        this.fVec27[<i32>(1)] = this.fVec27[<i32>(0)];
        for (let j2: i32 = <i32>(4); j2 > <i32>(0); j2 = (j2 - <i32>(1))) {
        this.fVec28[j2] = this.fVec28[(j2 - <i32>(1))];
        }
        for (let j3: i32 = <i32>(11); j3 > <i32>(0); j3 = (j3 - <i32>(1))) {
        this.fVec29[j3] = this.fVec29[(j3 - <i32>(1))];
        }
        this.fVec46[<i32>(1)] = this.fVec46[<i32>(0)];
        this.fRec22[<i32>(1)] = this.fRec22[<i32>(0)];
        this.fRec35[<i32>(1)] = this.fRec35[<i32>(0)];
        this.fRec36[<i32>(1)] = this.fRec36[<i32>(0)];
        this.fRec34[<i32>(1)] = this.fRec34[<i32>(0)];
        this.fRec37[<i32>(1)] = this.fRec37[<i32>(0)];
        this.fRec38[<i32>(1)] = this.fRec38[<i32>(0)];
        this.fRec33[<i32>(1)] = this.fRec33[<i32>(0)];
        this.fRec32[<i32>(1)] = this.fRec32[<i32>(0)];
        this.fRec40[<i32>(1)] = this.fRec40[<i32>(0)];
        this.fRec39[<i32>(1)] = this.fRec39[<i32>(0)];
        this.fRec42[<i32>(1)] = this.fRec42[<i32>(0)];
        this.fRec41[<i32>(1)] = this.fRec41[<i32>(0)];
        this.fRec44[<i32>(1)] = this.fRec44[<i32>(0)];
        this.fRec43[<i32>(1)] = this.fRec43[<i32>(0)];
        this.fRec46[<i32>(1)] = this.fRec46[<i32>(0)];
        this.fRec45[<i32>(1)] = this.fRec45[<i32>(0)];
        this.fRec48[<i32>(1)] = this.fRec48[<i32>(0)];
        this.iVec47[<i32>(1)] = this.iVec47[<i32>(0)];
        this.iRec49[<i32>(1)] = this.iRec49[<i32>(0)];
        this.fRec47[<i32>(1)] = this.fRec47[<i32>(0)];
        this.fRec15[<i32>(1)] = this.fRec15[<i32>(0)];
        this.iVec48[<i32>(1)] = this.iVec48[<i32>(0)];
        this.iRec50[<i32>(1)] = this.iRec50[<i32>(0)];
        this.fRec14[<i32>(1)] = this.fRec14[<i32>(0)];
        this.fRec51[<i32>(1)] = this.fRec51[<i32>(0)];
        this.fVec49[<i32>(1)] = this.fVec49[<i32>(0)];
        this.fRec54[<i32>(1)] = this.fRec54[<i32>(0)];
        this.fRec53[<i32>(1)] = this.fRec53[<i32>(0)];
        this.fRec55[<i32>(1)] = this.fRec55[<i32>(0)];
        this.fRec56[<i32>(1)] = this.fRec56[<i32>(0)];
        this.fVec50[<i32>(1)] = this.fVec50[<i32>(0)];
        this.fRec52[<i32>(1)] = this.fRec52[<i32>(0)];
        this.fRec57[<i32>(1)] = this.fRec57[<i32>(0)];
        this.fVec51[<i32>(1)] = this.fVec51[<i32>(0)];
        this.fRec60[<i32>(1)] = this.fRec60[<i32>(0)];
        this.fRec59[<i32>(1)] = this.fRec59[<i32>(0)];
        this.fRec61[<i32>(1)] = this.fRec61[<i32>(0)];
        this.fVec52[<i32>(1)] = this.fVec52[<i32>(0)];
        this.fRec58[<i32>(1)] = this.fRec58[<i32>(0)];
        this.fRec62[<i32>(1)] = this.fRec62[<i32>(0)];
        this.fRec71[<i32>(1)] = this.fRec71[<i32>(0)];
        this.fRec67[<i32>(1)] = this.fRec67[<i32>(0)];
        this.fRec68[<i32>(1)] = this.fRec68[<i32>(0)];
        this.fRec63[<i32>(1)] = this.fRec63[<i32>(0)];
        this.fRec64[<i32>(1)] = this.fRec64[<i32>(0)];
        this.fVec53[<i32>(1)] = this.fVec53[<i32>(0)];
        this.fVec54[<i32>(2)] = this.fVec54[<i32>(1)];
        this.fVec54[<i32>(1)] = this.fVec54[<i32>(0)];
        for (let j4: i32 = <i32>(4); j4 > <i32>(0); j4 = (j4 - <i32>(1))) {
        this.fVec55[j4] = this.fVec55[(j4 - <i32>(1))];
        }
        for (let j5: i32 = <i32>(11); j5 > <i32>(0); j5 = (j5 - <i32>(1))) {
        this.fVec56[j5] = this.fVec56[(j5 - <i32>(1))];
        }
        this.fRec12[<i32>(1)] = this.fRec12[<i32>(0)];
        this.fVec68[<i32>(1)] = this.fVec68[<i32>(0)];
        this.fRec75[<i32>(1)] = this.fRec75[<i32>(0)];
        this.fRec74[<i32>(1)] = this.fRec74[<i32>(0)];
        this.fVec69[<i32>(1)] = this.fVec69[<i32>(0)];
        this.fRec73[<i32>(1)] = this.fRec73[<i32>(0)];
        this.fRec72[<i32>(1)] = this.fRec72[<i32>(0)];
        this.fVec70[<i32>(1)] = this.fVec70[<i32>(0)];
        this.fVec71[<i32>(2)] = this.fVec71[<i32>(1)];
        this.fVec71[<i32>(1)] = this.fVec71[<i32>(0)];
        for (let j6: i32 = <i32>(4); j6 > <i32>(0); j6 = (j6 - <i32>(1))) {
        this.fVec72[j6] = this.fVec72[(j6 - <i32>(1))];
        }
        for (let j7: i32 = <i32>(11); j7 > <i32>(0); j7 = (j7 - <i32>(1))) {
        this.fVec73[j7] = this.fVec73[(j7 - <i32>(1))];
        }
        this.fVec87[<i32>(1)] = this.fVec87[<i32>(0)];
        this.fRec79[<i32>(1)] = this.fRec79[<i32>(0)];
        this.fRec78[<i32>(1)] = this.fRec78[<i32>(0)];
        this.fVec88[<i32>(1)] = this.fVec88[<i32>(0)];
        this.fRec77[<i32>(1)] = this.fRec77[<i32>(0)];
        this.fRec76[<i32>(1)] = this.fRec76[<i32>(0)];
        this.fVec89[<i32>(1)] = this.fVec89[<i32>(0)];
        this.fVec90[<i32>(2)] = this.fVec90[<i32>(1)];
        this.fVec90[<i32>(1)] = this.fVec90[<i32>(0)];
        for (let j8: i32 = <i32>(4); j8 > <i32>(0); j8 = (j8 - <i32>(1))) {
        this.fVec91[j8] = this.fVec91[(j8 - <i32>(1))];
        }
        for (let j9: i32 = <i32>(11); j9 > <i32>(0); j9 = (j9 - <i32>(1))) {
        this.fVec92[j9] = this.fVec92[(j9 - <i32>(1))];
        }
        this.fRec11[<i32>(1)] = this.fRec11[<i32>(0)];
        this.fRec10[<i32>(1)] = this.fRec10[<i32>(0)];
        this.fRec80[<i32>(1)] = this.fRec80[<i32>(0)];
        this.fRec81[<i32>(1)] = this.fRec81[<i32>(0)];
        this.fRec82[<i32>(1)] = this.fRec82[<i32>(0)];
        this.fRec83[<i32>(1)] = this.fRec83[<i32>(0)];
        this.fRec85[<i32>(1)] = this.fRec85[<i32>(0)];
        this.fRec87[<i32>(1)] = this.fRec87[<i32>(0)];
        this.fRec91[<i32>(2)] = this.fRec91[<i32>(1)];
        this.fRec91[<i32>(1)] = this.fRec91[<i32>(0)];
        this.fRec90[<i32>(2)] = this.fRec90[<i32>(1)];
        this.fRec90[<i32>(1)] = this.fRec90[<i32>(0)];
        this.fRec89[<i32>(2)] = this.fRec89[<i32>(1)];
        this.fRec89[<i32>(1)] = this.fRec89[<i32>(0)];
        this.fRec88[<i32>(1)] = this.fRec88[<i32>(0)];
        this.fRec95[<i32>(2)] = this.fRec95[<i32>(1)];
        this.fRec95[<i32>(1)] = this.fRec95[<i32>(0)];
        this.fRec94[<i32>(2)] = this.fRec94[<i32>(1)];
        this.fRec94[<i32>(1)] = this.fRec94[<i32>(0)];
        this.fRec93[<i32>(2)] = this.fRec93[<i32>(1)];
        this.fRec93[<i32>(1)] = this.fRec93[<i32>(0)];
        this.fRec92[<i32>(1)] = this.fRec92[<i32>(0)];
        this.fRec326[<i32>(2)] = this.fRec326[<i32>(1)];
        this.fRec326[<i32>(1)] = this.fRec326[<i32>(0)];
        this.fRec325[<i32>(2)] = this.fRec325[<i32>(1)];
        this.fRec325[<i32>(1)] = this.fRec325[<i32>(0)];
        this.fRec324[<i32>(2)] = this.fRec324[<i32>(1)];
        this.fRec324[<i32>(1)] = this.fRec324[<i32>(0)];
        this.fRec323[<i32>(2)] = this.fRec323[<i32>(1)];
        this.fRec323[<i32>(1)] = this.fRec323[<i32>(0)];
        this.fRec322[<i32>(2)] = this.fRec322[<i32>(1)];
        this.fRec322[<i32>(1)] = this.fRec322[<i32>(0)];
        this.fRec321[<i32>(2)] = this.fRec321[<i32>(1)];
        this.fRec321[<i32>(1)] = this.fRec321[<i32>(0)];
        this.fRec320[<i32>(2)] = this.fRec320[<i32>(1)];
        this.fRec320[<i32>(1)] = this.fRec320[<i32>(0)];
        this.fRec319[<i32>(2)] = this.fRec319[<i32>(1)];
        this.fRec319[<i32>(1)] = this.fRec319[<i32>(0)];
        this.fRec318[<i32>(2)] = this.fRec318[<i32>(1)];
        this.fRec318[<i32>(1)] = this.fRec318[<i32>(0)];
        this.fRec317[<i32>(2)] = this.fRec317[<i32>(1)];
        this.fRec317[<i32>(1)] = this.fRec317[<i32>(0)];
        this.fRec316[<i32>(2)] = this.fRec316[<i32>(1)];
        this.fRec316[<i32>(1)] = this.fRec316[<i32>(0)];
        this.fRec315[<i32>(2)] = this.fRec315[<i32>(1)];
        this.fRec315[<i32>(1)] = this.fRec315[<i32>(0)];
        this.fRec314[<i32>(2)] = this.fRec314[<i32>(1)];
        this.fRec314[<i32>(1)] = this.fRec314[<i32>(0)];
        this.fRec313[<i32>(2)] = this.fRec313[<i32>(1)];
        this.fRec313[<i32>(1)] = this.fRec313[<i32>(0)];
        this.fRec312[<i32>(2)] = this.fRec312[<i32>(1)];
        this.fRec312[<i32>(1)] = this.fRec312[<i32>(0)];
        this.fRec311[<i32>(2)] = this.fRec311[<i32>(1)];
        this.fRec311[<i32>(1)] = this.fRec311[<i32>(0)];
        this.fRec310[<i32>(2)] = this.fRec310[<i32>(1)];
        this.fRec310[<i32>(1)] = this.fRec310[<i32>(0)];
        this.fRec309[<i32>(2)] = this.fRec309[<i32>(1)];
        this.fRec309[<i32>(1)] = this.fRec309[<i32>(0)];
        this.fRec308[<i32>(2)] = this.fRec308[<i32>(1)];
        this.fRec308[<i32>(1)] = this.fRec308[<i32>(0)];
        this.fRec307[<i32>(2)] = this.fRec307[<i32>(1)];
        this.fRec307[<i32>(1)] = this.fRec307[<i32>(0)];
        this.fRec306[<i32>(1)] = this.fRec306[<i32>(0)];
        this.fRec347[<i32>(2)] = this.fRec347[<i32>(1)];
        this.fRec347[<i32>(1)] = this.fRec347[<i32>(0)];
        this.fRec346[<i32>(2)] = this.fRec346[<i32>(1)];
        this.fRec346[<i32>(1)] = this.fRec346[<i32>(0)];
        this.fRec345[<i32>(2)] = this.fRec345[<i32>(1)];
        this.fRec345[<i32>(1)] = this.fRec345[<i32>(0)];
        this.fRec344[<i32>(2)] = this.fRec344[<i32>(1)];
        this.fRec344[<i32>(1)] = this.fRec344[<i32>(0)];
        this.fRec343[<i32>(2)] = this.fRec343[<i32>(1)];
        this.fRec343[<i32>(1)] = this.fRec343[<i32>(0)];
        this.fRec342[<i32>(2)] = this.fRec342[<i32>(1)];
        this.fRec342[<i32>(1)] = this.fRec342[<i32>(0)];
        this.fRec341[<i32>(2)] = this.fRec341[<i32>(1)];
        this.fRec341[<i32>(1)] = this.fRec341[<i32>(0)];
        this.fRec340[<i32>(2)] = this.fRec340[<i32>(1)];
        this.fRec340[<i32>(1)] = this.fRec340[<i32>(0)];
        this.fRec339[<i32>(2)] = this.fRec339[<i32>(1)];
        this.fRec339[<i32>(1)] = this.fRec339[<i32>(0)];
        this.fRec338[<i32>(2)] = this.fRec338[<i32>(1)];
        this.fRec338[<i32>(1)] = this.fRec338[<i32>(0)];
        this.fRec337[<i32>(2)] = this.fRec337[<i32>(1)];
        this.fRec337[<i32>(1)] = this.fRec337[<i32>(0)];
        this.fRec336[<i32>(2)] = this.fRec336[<i32>(1)];
        this.fRec336[<i32>(1)] = this.fRec336[<i32>(0)];
        this.fRec335[<i32>(2)] = this.fRec335[<i32>(1)];
        this.fRec335[<i32>(1)] = this.fRec335[<i32>(0)];
        this.fRec334[<i32>(2)] = this.fRec334[<i32>(1)];
        this.fRec334[<i32>(1)] = this.fRec334[<i32>(0)];
        this.fRec333[<i32>(2)] = this.fRec333[<i32>(1)];
        this.fRec333[<i32>(1)] = this.fRec333[<i32>(0)];
        this.fRec332[<i32>(2)] = this.fRec332[<i32>(1)];
        this.fRec332[<i32>(1)] = this.fRec332[<i32>(0)];
        this.fRec331[<i32>(2)] = this.fRec331[<i32>(1)];
        this.fRec331[<i32>(1)] = this.fRec331[<i32>(0)];
        this.fRec330[<i32>(2)] = this.fRec330[<i32>(1)];
        this.fRec330[<i32>(1)] = this.fRec330[<i32>(0)];
        this.fRec329[<i32>(2)] = this.fRec329[<i32>(1)];
        this.fRec329[<i32>(1)] = this.fRec329[<i32>(0)];
        this.fRec328[<i32>(2)] = this.fRec328[<i32>(1)];
        this.fRec328[<i32>(1)] = this.fRec328[<i32>(0)];
        this.fRec327[<i32>(1)] = this.fRec327[<i32>(0)];
        this.fRec301[<i32>(1)] = this.fRec301[<i32>(0)];
        this.fRec302[<i32>(1)] = this.fRec302[<i32>(0)];
        this.fRec296[<i32>(1)] = this.fRec296[<i32>(0)];
        this.fRec297[<i32>(1)] = this.fRec297[<i32>(0)];
        this.fRec291[<i32>(1)] = this.fRec291[<i32>(0)];
        this.fRec292[<i32>(1)] = this.fRec292[<i32>(0)];
        this.fRec350[<i32>(2)] = this.fRec350[<i32>(1)];
        this.fRec350[<i32>(1)] = this.fRec350[<i32>(0)];
        this.fRec349[<i32>(2)] = this.fRec349[<i32>(1)];
        this.fRec349[<i32>(1)] = this.fRec349[<i32>(0)];
        this.fRec348[<i32>(1)] = this.fRec348[<i32>(0)];
        this.fRec353[<i32>(2)] = this.fRec353[<i32>(1)];
        this.fRec353[<i32>(1)] = this.fRec353[<i32>(0)];
        this.fRec352[<i32>(2)] = this.fRec352[<i32>(1)];
        this.fRec352[<i32>(1)] = this.fRec352[<i32>(0)];
        this.fRec351[<i32>(1)] = this.fRec351[<i32>(0)];
        this.fRec286[<i32>(1)] = this.fRec286[<i32>(0)];
        this.fRec287[<i32>(1)] = this.fRec287[<i32>(0)];
        this.fRec281[<i32>(1)] = this.fRec281[<i32>(0)];
        this.fRec282[<i32>(1)] = this.fRec282[<i32>(0)];
        this.fRec276[<i32>(1)] = this.fRec276[<i32>(0)];
        this.fRec277[<i32>(1)] = this.fRec277[<i32>(0)];
        this.fRec271[<i32>(1)] = this.fRec271[<i32>(0)];
        this.fRec272[<i32>(1)] = this.fRec272[<i32>(0)];
        this.fRec266[<i32>(1)] = this.fRec266[<i32>(0)];
        this.fRec267[<i32>(1)] = this.fRec267[<i32>(0)];
        this.fRec261[<i32>(1)] = this.fRec261[<i32>(0)];
        this.fRec262[<i32>(1)] = this.fRec262[<i32>(0)];
        this.fRec356[<i32>(2)] = this.fRec356[<i32>(1)];
        this.fRec356[<i32>(1)] = this.fRec356[<i32>(0)];
        this.fRec355[<i32>(2)] = this.fRec355[<i32>(1)];
        this.fRec355[<i32>(1)] = this.fRec355[<i32>(0)];
        this.fRec354[<i32>(1)] = this.fRec354[<i32>(0)];
        this.fRec359[<i32>(2)] = this.fRec359[<i32>(1)];
        this.fRec359[<i32>(1)] = this.fRec359[<i32>(0)];
        this.fRec358[<i32>(2)] = this.fRec358[<i32>(1)];
        this.fRec358[<i32>(1)] = this.fRec358[<i32>(0)];
        this.fRec357[<i32>(1)] = this.fRec357[<i32>(0)];
        this.fRec256[<i32>(1)] = this.fRec256[<i32>(0)];
        this.fRec257[<i32>(1)] = this.fRec257[<i32>(0)];
        this.fRec251[<i32>(1)] = this.fRec251[<i32>(0)];
        this.fRec252[<i32>(1)] = this.fRec252[<i32>(0)];
        this.fRec246[<i32>(1)] = this.fRec246[<i32>(0)];
        this.fRec247[<i32>(1)] = this.fRec247[<i32>(0)];
        this.fRec241[<i32>(1)] = this.fRec241[<i32>(0)];
        this.fRec242[<i32>(1)] = this.fRec242[<i32>(0)];
        this.fRec236[<i32>(1)] = this.fRec236[<i32>(0)];
        this.fRec237[<i32>(1)] = this.fRec237[<i32>(0)];
        this.fRec231[<i32>(1)] = this.fRec231[<i32>(0)];
        this.fRec232[<i32>(1)] = this.fRec232[<i32>(0)];
        this.fRec362[<i32>(2)] = this.fRec362[<i32>(1)];
        this.fRec362[<i32>(1)] = this.fRec362[<i32>(0)];
        this.fRec361[<i32>(2)] = this.fRec361[<i32>(1)];
        this.fRec361[<i32>(1)] = this.fRec361[<i32>(0)];
        this.fRec360[<i32>(1)] = this.fRec360[<i32>(0)];
        this.fRec365[<i32>(2)] = this.fRec365[<i32>(1)];
        this.fRec365[<i32>(1)] = this.fRec365[<i32>(0)];
        this.fRec364[<i32>(2)] = this.fRec364[<i32>(1)];
        this.fRec364[<i32>(1)] = this.fRec364[<i32>(0)];
        this.fRec363[<i32>(1)] = this.fRec363[<i32>(0)];
        this.fRec226[<i32>(1)] = this.fRec226[<i32>(0)];
        this.fRec227[<i32>(1)] = this.fRec227[<i32>(0)];
        this.fRec221[<i32>(1)] = this.fRec221[<i32>(0)];
        this.fRec222[<i32>(1)] = this.fRec222[<i32>(0)];
        this.fRec216[<i32>(1)] = this.fRec216[<i32>(0)];
        this.fRec217[<i32>(1)] = this.fRec217[<i32>(0)];
        this.fRec211[<i32>(1)] = this.fRec211[<i32>(0)];
        this.fRec212[<i32>(1)] = this.fRec212[<i32>(0)];
        this.fRec206[<i32>(1)] = this.fRec206[<i32>(0)];
        this.fRec207[<i32>(1)] = this.fRec207[<i32>(0)];
        this.fRec201[<i32>(1)] = this.fRec201[<i32>(0)];
        this.fRec202[<i32>(1)] = this.fRec202[<i32>(0)];
        this.fRec368[<i32>(2)] = this.fRec368[<i32>(1)];
        this.fRec368[<i32>(1)] = this.fRec368[<i32>(0)];
        this.fRec367[<i32>(2)] = this.fRec367[<i32>(1)];
        this.fRec367[<i32>(1)] = this.fRec367[<i32>(0)];
        this.fRec366[<i32>(1)] = this.fRec366[<i32>(0)];
        this.fRec371[<i32>(2)] = this.fRec371[<i32>(1)];
        this.fRec371[<i32>(1)] = this.fRec371[<i32>(0)];
        this.fRec370[<i32>(2)] = this.fRec370[<i32>(1)];
        this.fRec370[<i32>(1)] = this.fRec370[<i32>(0)];
        this.fRec369[<i32>(1)] = this.fRec369[<i32>(0)];
        this.fRec196[<i32>(1)] = this.fRec196[<i32>(0)];
        this.fRec197[<i32>(1)] = this.fRec197[<i32>(0)];
        this.fRec191[<i32>(1)] = this.fRec191[<i32>(0)];
        this.fRec192[<i32>(1)] = this.fRec192[<i32>(0)];
        this.fRec186[<i32>(1)] = this.fRec186[<i32>(0)];
        this.fRec187[<i32>(1)] = this.fRec187[<i32>(0)];
        this.fRec181[<i32>(1)] = this.fRec181[<i32>(0)];
        this.fRec182[<i32>(1)] = this.fRec182[<i32>(0)];
        this.fRec176[<i32>(1)] = this.fRec176[<i32>(0)];
        this.fRec177[<i32>(1)] = this.fRec177[<i32>(0)];
        this.fRec171[<i32>(1)] = this.fRec171[<i32>(0)];
        this.fRec172[<i32>(1)] = this.fRec172[<i32>(0)];
        this.fRec374[<i32>(2)] = this.fRec374[<i32>(1)];
        this.fRec374[<i32>(1)] = this.fRec374[<i32>(0)];
        this.fRec373[<i32>(2)] = this.fRec373[<i32>(1)];
        this.fRec373[<i32>(1)] = this.fRec373[<i32>(0)];
        this.fRec372[<i32>(1)] = this.fRec372[<i32>(0)];
        this.fRec377[<i32>(2)] = this.fRec377[<i32>(1)];
        this.fRec377[<i32>(1)] = this.fRec377[<i32>(0)];
        this.fRec376[<i32>(2)] = this.fRec376[<i32>(1)];
        this.fRec376[<i32>(1)] = this.fRec376[<i32>(0)];
        this.fRec375[<i32>(1)] = this.fRec375[<i32>(0)];
        this.fRec166[<i32>(1)] = this.fRec166[<i32>(0)];
        this.fRec167[<i32>(1)] = this.fRec167[<i32>(0)];
        this.fRec161[<i32>(1)] = this.fRec161[<i32>(0)];
        this.fRec162[<i32>(1)] = this.fRec162[<i32>(0)];
        this.fRec156[<i32>(1)] = this.fRec156[<i32>(0)];
        this.fRec157[<i32>(1)] = this.fRec157[<i32>(0)];
        this.fRec151[<i32>(1)] = this.fRec151[<i32>(0)];
        this.fRec152[<i32>(1)] = this.fRec152[<i32>(0)];
        this.fRec146[<i32>(1)] = this.fRec146[<i32>(0)];
        this.fRec147[<i32>(1)] = this.fRec147[<i32>(0)];
        this.fRec141[<i32>(1)] = this.fRec141[<i32>(0)];
        this.fRec142[<i32>(1)] = this.fRec142[<i32>(0)];
        this.fRec380[<i32>(2)] = this.fRec380[<i32>(1)];
        this.fRec380[<i32>(1)] = this.fRec380[<i32>(0)];
        this.fRec379[<i32>(2)] = this.fRec379[<i32>(1)];
        this.fRec379[<i32>(1)] = this.fRec379[<i32>(0)];
        this.fRec378[<i32>(1)] = this.fRec378[<i32>(0)];
        this.fRec383[<i32>(2)] = this.fRec383[<i32>(1)];
        this.fRec383[<i32>(1)] = this.fRec383[<i32>(0)];
        this.fRec382[<i32>(2)] = this.fRec382[<i32>(1)];
        this.fRec382[<i32>(1)] = this.fRec382[<i32>(0)];
        this.fRec381[<i32>(1)] = this.fRec381[<i32>(0)];
        this.fRec136[<i32>(1)] = this.fRec136[<i32>(0)];
        this.fRec137[<i32>(1)] = this.fRec137[<i32>(0)];
        this.fRec131[<i32>(1)] = this.fRec131[<i32>(0)];
        this.fRec132[<i32>(1)] = this.fRec132[<i32>(0)];
        this.fRec126[<i32>(1)] = this.fRec126[<i32>(0)];
        this.fRec127[<i32>(1)] = this.fRec127[<i32>(0)];
        this.fRec121[<i32>(1)] = this.fRec121[<i32>(0)];
        this.fRec122[<i32>(1)] = this.fRec122[<i32>(0)];
        this.fRec116[<i32>(1)] = this.fRec116[<i32>(0)];
        this.fRec117[<i32>(1)] = this.fRec117[<i32>(0)];
        this.fRec111[<i32>(1)] = this.fRec111[<i32>(0)];
        this.fRec112[<i32>(1)] = this.fRec112[<i32>(0)];
        this.fRec106[<i32>(1)] = this.fRec106[<i32>(0)];
        this.fRec107[<i32>(1)] = this.fRec107[<i32>(0)];
        this.fRec101[<i32>(1)] = this.fRec101[<i32>(0)];
        this.fRec102[<i32>(1)] = this.fRec102[<i32>(0)];
        this.fRec96[<i32>(1)] = this.fRec96[<i32>(0)];
        this.fRec97[<i32>(1)] = this.fRec97[<i32>(0)];
        this.fRec589[<i32>(1)] = this.fRec589[<i32>(0)];
        this.fRec590[<i32>(1)] = this.fRec590[<i32>(0)];
        this.fRec584[<i32>(1)] = this.fRec584[<i32>(0)];
        this.fRec585[<i32>(1)] = this.fRec585[<i32>(0)];
        this.fRec579[<i32>(1)] = this.fRec579[<i32>(0)];
        this.fRec580[<i32>(1)] = this.fRec580[<i32>(0)];
        this.fRec574[<i32>(1)] = this.fRec574[<i32>(0)];
        this.fRec575[<i32>(1)] = this.fRec575[<i32>(0)];
        this.fRec569[<i32>(1)] = this.fRec569[<i32>(0)];
        this.fRec570[<i32>(1)] = this.fRec570[<i32>(0)];
        this.fRec564[<i32>(1)] = this.fRec564[<i32>(0)];
        this.fRec565[<i32>(1)] = this.fRec565[<i32>(0)];
        this.fRec559[<i32>(1)] = this.fRec559[<i32>(0)];
        this.fRec560[<i32>(1)] = this.fRec560[<i32>(0)];
        this.fRec554[<i32>(1)] = this.fRec554[<i32>(0)];
        this.fRec555[<i32>(1)] = this.fRec555[<i32>(0)];
        this.fRec549[<i32>(1)] = this.fRec549[<i32>(0)];
        this.fRec550[<i32>(1)] = this.fRec550[<i32>(0)];
        this.fRec544[<i32>(1)] = this.fRec544[<i32>(0)];
        this.fRec545[<i32>(1)] = this.fRec545[<i32>(0)];
        this.fRec539[<i32>(1)] = this.fRec539[<i32>(0)];
        this.fRec540[<i32>(1)] = this.fRec540[<i32>(0)];
        this.fRec534[<i32>(1)] = this.fRec534[<i32>(0)];
        this.fRec535[<i32>(1)] = this.fRec535[<i32>(0)];
        this.fRec529[<i32>(1)] = this.fRec529[<i32>(0)];
        this.fRec530[<i32>(1)] = this.fRec530[<i32>(0)];
        this.fRec524[<i32>(1)] = this.fRec524[<i32>(0)];
        this.fRec525[<i32>(1)] = this.fRec525[<i32>(0)];
        this.fRec519[<i32>(1)] = this.fRec519[<i32>(0)];
        this.fRec520[<i32>(1)] = this.fRec520[<i32>(0)];
        this.fRec514[<i32>(1)] = this.fRec514[<i32>(0)];
        this.fRec515[<i32>(1)] = this.fRec515[<i32>(0)];
        this.fRec509[<i32>(1)] = this.fRec509[<i32>(0)];
        this.fRec510[<i32>(1)] = this.fRec510[<i32>(0)];
        this.fRec504[<i32>(1)] = this.fRec504[<i32>(0)];
        this.fRec505[<i32>(1)] = this.fRec505[<i32>(0)];
        this.fRec499[<i32>(1)] = this.fRec499[<i32>(0)];
        this.fRec500[<i32>(1)] = this.fRec500[<i32>(0)];
        this.fRec494[<i32>(1)] = this.fRec494[<i32>(0)];
        this.fRec495[<i32>(1)] = this.fRec495[<i32>(0)];
        this.fRec489[<i32>(1)] = this.fRec489[<i32>(0)];
        this.fRec490[<i32>(1)] = this.fRec490[<i32>(0)];
        this.fRec484[<i32>(1)] = this.fRec484[<i32>(0)];
        this.fRec485[<i32>(1)] = this.fRec485[<i32>(0)];
        this.fRec479[<i32>(1)] = this.fRec479[<i32>(0)];
        this.fRec480[<i32>(1)] = this.fRec480[<i32>(0)];
        this.fRec474[<i32>(1)] = this.fRec474[<i32>(0)];
        this.fRec475[<i32>(1)] = this.fRec475[<i32>(0)];
        this.fRec469[<i32>(1)] = this.fRec469[<i32>(0)];
        this.fRec470[<i32>(1)] = this.fRec470[<i32>(0)];
        this.fRec464[<i32>(1)] = this.fRec464[<i32>(0)];
        this.fRec465[<i32>(1)] = this.fRec465[<i32>(0)];
        this.fRec459[<i32>(1)] = this.fRec459[<i32>(0)];
        this.fRec460[<i32>(1)] = this.fRec460[<i32>(0)];
        this.fRec454[<i32>(1)] = this.fRec454[<i32>(0)];
        this.fRec455[<i32>(1)] = this.fRec455[<i32>(0)];
        this.fRec449[<i32>(1)] = this.fRec449[<i32>(0)];
        this.fRec450[<i32>(1)] = this.fRec450[<i32>(0)];
        this.fRec444[<i32>(1)] = this.fRec444[<i32>(0)];
        this.fRec445[<i32>(1)] = this.fRec445[<i32>(0)];
        this.fRec439[<i32>(1)] = this.fRec439[<i32>(0)];
        this.fRec440[<i32>(1)] = this.fRec440[<i32>(0)];
        this.fRec434[<i32>(1)] = this.fRec434[<i32>(0)];
        this.fRec435[<i32>(1)] = this.fRec435[<i32>(0)];
        this.fRec429[<i32>(1)] = this.fRec429[<i32>(0)];
        this.fRec430[<i32>(1)] = this.fRec430[<i32>(0)];
        this.fRec424[<i32>(1)] = this.fRec424[<i32>(0)];
        this.fRec425[<i32>(1)] = this.fRec425[<i32>(0)];
        this.fRec419[<i32>(1)] = this.fRec419[<i32>(0)];
        this.fRec420[<i32>(1)] = this.fRec420[<i32>(0)];
        this.fRec414[<i32>(1)] = this.fRec414[<i32>(0)];
        this.fRec415[<i32>(1)] = this.fRec415[<i32>(0)];
        this.fRec409[<i32>(1)] = this.fRec409[<i32>(0)];
        this.fRec410[<i32>(1)] = this.fRec410[<i32>(0)];
        this.fRec404[<i32>(1)] = this.fRec404[<i32>(0)];
        this.fRec405[<i32>(1)] = this.fRec405[<i32>(0)];
        this.fRec399[<i32>(1)] = this.fRec399[<i32>(0)];
        this.fRec400[<i32>(1)] = this.fRec400[<i32>(0)];
        this.fRec394[<i32>(1)] = this.fRec394[<i32>(0)];
        this.fRec395[<i32>(1)] = this.fRec395[<i32>(0)];
        this.fRec389[<i32>(1)] = this.fRec389[<i32>(0)];
        this.fRec390[<i32>(1)] = this.fRec390[<i32>(0)];
        this.fRec384[<i32>(1)] = this.fRec384[<i32>(0)];
        this.fRec385[<i32>(1)] = this.fRec385[<i32>(0)];
        this.fRec594[<i32>(1)] = this.fRec594[<i32>(0)];
        this.fRec596[<i32>(1)] = this.fRec596[<i32>(0)];
        this.fRec6[<i32>(1)] = this.fRec6[<i32>(0)];
        this.fRec7[<i32>(1)] = this.fRec7[<i32>(0)];
        this.fRec598[<i32>(1)] = this.fRec598[<i32>(0)];
        this.fRec599[<i32>(1)] = this.fRec599[<i32>(0)];
        this.fRec600[<i32>(1)] = this.fRec600[<i32>(0)];
        this.fRec601[<i32>(1)] = this.fRec601[<i32>(0)];
        this.fRec602[<i32>(1)] = this.fRec602[<i32>(0)];
        this.fRec4[<i32>(1)] = this.fRec4[<i32>(0)];
        this.fRec5[<i32>(1)] = this.fRec5[<i32>(0)];
        this.fRec2[<i32>(2)] = this.fRec2[<i32>(1)];
        this.fRec2[<i32>(1)] = this.fRec2[<i32>(0)];
        this.fRec3[<i32>(2)] = this.fRec3[<i32>(1)];
        this.fRec3[<i32>(1)] = this.fRec3[<i32>(0)];
        this.fVec106[<i32>(1)] = this.fVec106[<i32>(0)];
        this.fRec0[<i32>(1)] = this.fRec0[<i32>(0)];
        this.fVec107[<i32>(1)] = this.fVec107[<i32>(0)];
        this.fRec607[<i32>(1)] = this.fRec607[<i32>(0)];
        this.fRec606[<i32>(1)] = this.fRec606[<i32>(0)];
        this.fVec108[<i32>(1)] = this.fVec108[<i32>(0)];
        this.fRec605[<i32>(1)] = this.fRec605[<i32>(0)];
        this.fRec604[<i32>(1)] = this.fRec604[<i32>(0)];
        this.fVec109[<i32>(1)] = this.fVec109[<i32>(0)];
        this.fVec110[<i32>(2)] = this.fVec110[<i32>(1)];
        this.fVec110[<i32>(1)] = this.fVec110[<i32>(0)];
        for (let j10: i32 = <i32>(4); j10 > <i32>(0); j10 = (j10 - <i32>(1))) {
        this.fVec111[j10] = this.fVec111[(j10 - <i32>(1))];
        }
        for (let j11: i32 = <i32>(11); j11 > <i32>(0); j11 = (j11 - <i32>(1))) {
        this.fVec112[j11] = this.fVec112[(j11 - <i32>(1))];
        }
        this.fVec129[<i32>(1)] = this.fVec129[<i32>(0)];
        this.fVec130[<i32>(1)] = this.fVec130[<i32>(0)];
        this.fRec611[<i32>(1)] = this.fRec611[<i32>(0)];
        this.fRec610[<i32>(1)] = this.fRec610[<i32>(0)];
        this.fVec131[<i32>(1)] = this.fVec131[<i32>(0)];
        this.fRec609[<i32>(1)] = this.fRec609[<i32>(0)];
        this.fRec608[<i32>(1)] = this.fRec608[<i32>(0)];
        this.fVec132[<i32>(1)] = this.fVec132[<i32>(0)];
        this.fVec133[<i32>(2)] = this.fVec133[<i32>(1)];
        this.fVec133[<i32>(1)] = this.fVec133[<i32>(0)];
        for (let j12: i32 = <i32>(4); j12 > <i32>(0); j12 = (j12 - <i32>(1))) {
        this.fVec134[j12] = this.fVec134[(j12 - <i32>(1))];
        }
        for (let j13: i32 = <i32>(11); j13 > <i32>(0); j13 = (j13 - <i32>(1))) {
        this.fVec135[j13] = this.fVec135[(j13 - <i32>(1))];
        }
        this.fRec603[<i32>(1)] = this.fRec603[<i32>(0)];
    }
}

const masterMe: MasterMe = new MasterMe();

export function initializeMidiSynth(): void {
}

export function postprocess(): void {
    masterMe.process();
}
