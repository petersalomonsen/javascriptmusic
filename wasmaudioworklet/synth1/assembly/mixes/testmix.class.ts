import { StereoSignal } from "../synth/stereosignal.class";
import { SAMPLERATE } from "../environment";
import { Freeverb } from "../fx/freeverb";
import { TestInstrument } from "../instruments/testinstrument.class";
import { SawBass } from "../instruments/sawbass.class";
import { Pad } from "../instruments/pad.class";
import { Kick } from "../instruments/kick.class";
import { Snare } from "../instruments/snare.class";
import { DriveLead } from "../instruments/drivelead.class";
import { allocateInstrumentNoteBuffer, getNote } from "../control/instrumentnotebuffer";
import { Hihat } from "../instruments/hihat.class";

export const NUM_INSTRUMENTS = 9;
allocateInstrumentNoteBuffer(NUM_INSTRUMENTS);

let flute = new TestInstrument();
let drivelead = new DriveLead();
let bass = new SawBass();
let pad1 = new Pad();
let pad2 = new Pad();
let pad3 = new Pad();
let kick = new Kick();
let snare = new Snare();
let hihat = new Hihat();

let freeverb = new Freeverb();
let reverbline = new StereoSignal();
let mainline = new StereoSignal();

export let signal: StereoSignal = new StereoSignal();

@inline export function instrumentNotesUpdated(): void {
    flute.note = getNote(0);
    bass.note = getNote(1);
    pad1.note = getNote(2);
    pad2.note = getNote(3);
    pad3.note = getNote(4);
    kick.note = getNote(5);
    snare.note = getNote(6);
    drivelead.note = getNote(7);
    hihat.note = getNote(8);
}

let freq: f32 = 50;
@inline export function mixernext(): void {  
    mainline.left = 0;
    mainline.right = 0;
    reverbline.left = 0;
    reverbline.right = 0;
    
    flute.next();
    mainline.addStereoSignal(flute.signal, 0.7, 0.4);
    reverbline.addStereoSignal(flute.signal, 0.3, 0.4);
    
    bass.next(); 
    mainline.addStereoSignal(bass.signal, 1, 0.6);
    reverbline.addStereoSignal(bass.signal, 0.1, 0.6);
    
    pad1.next(); 
    mainline.addStereoSignal(pad1.signal, 0.6, 0.5);
    reverbline.addStereoSignal(pad1.signal, 0.4, 0.5);
    pad2.next(); 
    mainline.addStereoSignal(pad2.signal, 0.6, 0.4);
    reverbline.addStereoSignal(pad2.signal, 0.4, 0.4);
    pad3.next(); 
    mainline.addStereoSignal(pad3.signal, 0.6, 0.6);
    reverbline.addStereoSignal(pad3.signal, 0.4, 0.6);

    drivelead.next();
    mainline.addStereoSignal(drivelead.signal, 1.0, 0.4);
    reverbline.addStereoSignal(drivelead.signal, 0.5, 0.6);
    
    
    kick.next();
    mainline.addStereoSignal(kick.signal, 1.5, 0.5);
    reverbline.addStereoSignal(kick.signal, 0.1, 0.5);
    
    snare.next();
    mainline.addStereoSignal(snare.signal, 1.0, 0.5);
    reverbline.addStereoSignal(snare.signal, 0.1, 0.5);
    
    
    hihat.next();
    mainline.addStereoSignal(hihat.signal, 1.0, 0.5);
    reverbline.addStereoSignal(hihat.signal, 0.1, 0.5);
    
    freeverb.tick(reverbline);
    
    signal.left = mainline.left + reverbline.left;
    signal.right = mainline.right + reverbline.right;
}