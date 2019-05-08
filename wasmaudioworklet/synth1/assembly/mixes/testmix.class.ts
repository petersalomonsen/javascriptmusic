import { StereoSignal } from "../synth/stereosignal.class";

import { Freeverb } from "../fx/freeverb";
import { TestInstrument } from "../instruments/testinstrument.class";
import { SawBass } from "../instruments/sawbass.class";
import { Pad } from "../instruments/pad.class";
import { Kick } from "../instruments/kick.class";
import { Snare } from "../instruments/snare.class";
import { DriveLead } from "../instruments/drivelead.class";

import { Hihat } from "../instruments/hihat.class";
import { DelayLine } from "../fx/delayline";
import { SAMPLERATE } from "../environment";
import { SquareLead } from "../instruments/squarelead.class";

import { TriBandStereoCompressor } from "../fx/tribandstereocompressor";

const gain: f32 = 0.21;

let flute = new TestInstrument();
let drivelead = new DriveLead();
let bass = new SawBass();
let pad1 = new Pad();
let pad2 = new Pad();
let pad3 = new Pad();
let kick = new Kick();
let snare = new Snare();
let hihat = new Hihat();
let squarelead = new SquareLead();

let freeverb = new Freeverb();

let delayLeft: DelayLine = new DelayLine(SAMPLERATE * 0.5 as usize);
let delayRight: DelayLine = new DelayLine(SAMPLERATE * 0.5 as usize);
    
let echoline = new StereoSignal();
let reverbline = new StereoSignal();
let mainline = new StereoSignal();

let tribandstereocompressor = new TriBandStereoCompressor(15,500,8000,19000);

export let signal: StereoSignal = new StereoSignal();

export function setChannelValue(channel: usize, value: f32): void {
    switch(channel) {
        case 0:
            flute.note = value;
            break;
        case 1:
            bass.note = value;
            break;
        case 2:
            pad1.note = value;
            break;
        case 3:
            pad2.note = value;
            break;
        case 4:
            pad3.note = value;
            break;
        case 5:
            kick.note = value;
            break;
        case 6:
            snare.note = value;
            break;
        case 7:
            drivelead.note = value;
            break;
        case 8:
            hihat.note = value;
            break;
        case 9:
            squarelead.note = value;
            break;
    }
    
}

export function mixernext(): void {  
    mainline.clear()
    reverbline.clear();
    echoline.clear();
    
    flute.next();
    pad1.next(); 
    pad2.next();
    pad3.next(); 
    kick.next();
    snare.next();
    hihat.next();
    bass.next(); 
    drivelead.next();
    squarelead.next();

    mainline.addStereoSignal(flute.signal, 0.7, 0.0);
    echoline.addStereoSignal(flute.signal, 0.6, 1.0);
    
    mainline.addStereoSignal(pad1.signal, 0.58, 0.25);
    echoline.addStereoSignal(pad1.signal, 0.35, 0.25); 
    mainline.addStereoSignal(pad2.signal, 0.58, 0.5);
    echoline.addStereoSignal(pad2.signal, 0.30, 0.5);
    mainline.addStereoSignal(pad3.signal, 0.58, 0.75);
    echoline.addStereoSignal(pad3.signal, 0.30, 0.75);

    mainline.addStereoSignal(kick.signal, 1.6, 0.5);
    reverbline.addStereoSignal(kick.signal, 0.05, 0.0);
    
    mainline.addStereoSignal(snare.signal, 0.38, 0.6);
    echoline.addStereoSignal(snare.signal, 0.1, 0.4);
   
    mainline.addStereoSignal(hihat.signal, 0.7, 0.4);
    reverbline.addStereoSignal(hihat.signal, 0.05, 0.6);

    mainline.addStereoSignal(bass.signal, 1.2, 0.5);
    reverbline.addStereoSignal(bass.signal, 0.1, 0.0);

    mainline.addStereoSignal(drivelead.signal, 0.17, 0.4);
    echoline.addStereoSignal(drivelead.signal, 0.4, 0.6);

    mainline.addStereoSignal(squarelead.signal,0.6, 0.6);
    echoline.addStereoSignal(squarelead.signal, 0.6, 0.0);

    echoline.left += delayRight.read() * 0.5;
    echoline.right += delayLeft.read() * 0.5;
        
    delayLeft.write_and_advance(echoline.left);
    delayRight.write_and_advance(echoline.right);

    reverbline.addStereoSignal(echoline, 0.5, 0.5);
    
    freeverb.tick(reverbline);
        
    let left = gain * (mainline.left + echoline.left + reverbline.left);
    let right = gain * (mainline.right + echoline.right + reverbline.right);

    tribandstereocompressor.process(left,right,0.3, 0.3, 0.5 , 2.0, 0.80, 0.9);
    signal.left = tribandstereocompressor.stereosignal.left;
    signal.right = tribandstereocompressor.stereosignal.right;
}