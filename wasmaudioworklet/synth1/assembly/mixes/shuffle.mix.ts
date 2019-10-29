import { StereoSignal } from "../synth/stereosignal.class";

import { Freeverb } from "../fx/freeverb";
import { DelayLine } from "../fx/delayline";
import { SAMPLERATE } from "../environment";

import { TriBandStereoCompressor } from "../fx/tribandstereocompressor";
import { EQBand } from "../fx/eqband";
import { SubPiano } from "../instruments/piano/subpiano";
import { Kick2 } from "../instruments/drums/kick2.class";
import { Snare } from "../instruments/snare.class";
import { DeepBass } from "../instruments/bass/deepbass";
import { Eftang } from "../instruments/lead/eftang";
import { SoftPad } from "../instruments/pad/softpad.class";
import { Hihat } from "../instruments/hihat.class";
import { SineLead } from "../instruments/lead/sinelead";
import { DriveLead } from "../instruments/drivelead.class";

export const PATTERN_SIZE_SHIFT: usize = 3;
export const BEATS_PER_PATTERN_SHIFT: usize = 0;

const gain: f32 = 0.13;
const ENABLE_MULTIBAND_COMPRESSOR = false;

let freeverb = new Freeverb();

const delayframes = (SAMPLERATE * (3/8) * 60 / 70) as usize;
let delayLeft: DelayLine = new DelayLine(delayframes);
let delayRight: DelayLine = new DelayLine(delayframes);
    
let echoline = new StereoSignal();
let reverbline = new StereoSignal();
let mainline = new StereoSignal();

let tribandstereocompressor = new TriBandStereoCompressor(20,500,7000,19500);
let eqbandl = new EQBand(20, 19500);
let eqbandr = new EQBand(20, 19500);

function createInstrumentArray<T>(length: i32, factoryFunc: () => T): T[] {
    const arr = new Array<T>(length);
    for(let n  = 0; n < length;n++) {
        arr[n] = factoryFunc();
    }
    return arr;
}

const pianos: SubPiano[] = createInstrumentArray<SubPiano>(8, () => new SubPiano());
const pads: SoftPad[] = createInstrumentArray<SoftPad>(8, () => new SoftPad());
const driveleads: DriveLead[] = createInstrumentArray<DriveLead>(3, () => new DriveLead());

const kick = new Kick2();
const bass = new DeepBass();
const eftang = new Eftang();
const snare = new Snare();
const hihat = new Hihat();
const sinelead = new SineLead();

export function setChannelValue(channel: usize, value: f32): void {
    switch(true) {
        case (channel < 8):
            pianos[channel].note = value;
            break;
        case channel === 8:
            kick.note = value;
            break;
        case channel === 9:
            snare.note = value;
            break;
        case channel === 10:
            hihat.note = value;
            break;
        case channel === 11:
            bass.note = value
            break;
        case channel === 12:
            eftang.note = value;
            break;
        case channel < 21:
            pads[channel - 13].note = value;
            break;
        case channel === 21:
            sinelead.note = value;
            break;
        case channel < 25:
            driveleads[channel - 22].note = value;
            break;
        case channel === 25:
            if(value > 1) {
                for(let n = 0; n<driveleads.length; n++) {
                    driveleads[n].setPitchbend(value - 64);
                }
            }
            break;
    }
}

export function mixernext(leftSampleBufferPtr: usize, rightSampleBufferPtr: usize): void {  
    mainline.clear()
    reverbline.clear();
    echoline.clear();
    
    for(let n = 0;n<pianos.length;n++) {
        const piano = pianos[n];
        piano.next();
        mainline.addStereoSignal(piano.signal, 0.4, 0.5);
        reverbline.addStereoSignal(piano.signal, 0.1, 0.5);    
    }
    for(let n = 0;n<pads.length;n++) {
        const pad = pads[n];
        pad.next();
        mainline.addStereoSignal(pad.signal, 0.4, 0.5);
        echoline.addStereoSignal(pad.signal, 0.4, 0.5);    
    }

    for(let n = 0;n<driveleads.length;n++) {
        const drivelead = driveleads[n];
        drivelead.next();
        
        const pan = ((n + 1) * 0.25) as f32;
        mainline.addStereoSignal(drivelead.signal, 0.1, pan);
        echoline.addStereoSignal(drivelead.signal, 0.45, 1 - pan);    
    }

    kick.next();
    mainline.addStereoSignal(kick.signal, 1.5, 0.5);
    reverbline.addStereoSignal(kick.signal, 0.2, 0.5); 

    hihat.next();
    mainline.addStereoSignal(hihat.signal, 1.5, 0.5);
    // reverbline.addStereoSignal(hihat.signal, 0.0, 0.5); 

    bass.next();
    mainline.addStereoSignal(bass.signal, 4.5, 0.5);
    reverbline.addStereoSignal(bass.signal, 0.3, 0.5);    

    eftang.next();
    mainline.addStereoSignal(eftang.signal, 2.1, 0.5);
    echoline.addStereoSignal(eftang.signal, 1.8, 0.5);    

    sinelead.next();
    mainline.addStereoSignal(sinelead.signal, 2.4, 0.5);
    echoline.addStereoSignal(sinelead.signal, 2.0, 0.5);    

    snare.next();
    mainline.addStereoSignal(snare.signal, 1.0, 0.5);
    reverbline.addStereoSignal(snare.signal, 0.01, 0.5); 

    echoline.left += delayRight.read() * 0.7;
    echoline.right += delayLeft.read() * 0.7;
        
    delayLeft.write_and_advance(echoline.left);
    delayRight.write_and_advance(echoline.right);

    reverbline.addStereoSignal(echoline, 0.5, 0.5);
    
    freeverb.tick(reverbline);
        
    let left = gain * (mainline.left + echoline.left + reverbline.left);
    let right = gain * (mainline.right + echoline.right + reverbline.right);

    if (ENABLE_MULTIBAND_COMPRESSOR) {
        tribandstereocompressor.process(left,right,0.45, 1.0, 0.9 , 1.3, 1.05, 1.0);
        left = tribandstereocompressor.stereosignal.left;
        right  = tribandstereocompressor.stereosignal.right;
    } else {
        left = eqbandl.process(left);
        right = eqbandr.process(right);
    }

    // clip
    if (Math.abs(left) > 1.0) {
        left = 1.0;
    }

    if (Math.abs(right) > 1.0) {
        right = 1.0;
    }

    store<f32>(leftSampleBufferPtr, left);
    store<f32>(rightSampleBufferPtr, right);    
}