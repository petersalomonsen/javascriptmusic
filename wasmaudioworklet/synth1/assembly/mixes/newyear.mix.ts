/**
 * Mix for "WASM song"
 */
import { EQBand } from "../fx/eqband";
import { Envelope } from '../synth/envelope.class';
import { Snare } from "../instruments/snare.class";
import { SawBass3 } from "../instruments/bass/sawbass3";
import { Eftang } from "../instruments/lead/eftang";
import { StereoSignal } from "../synth/stereosignal.class";
import { Kick } from "../instruments/kick.class";
import { BrassyLead } from "../instruments/lead/brassy";
import { Hihat } from "../instruments/hihat.class";
import { WaveShaper } from '../synth/shaper';
import { createInstrumentArray } from '../common/mixcommon';
import { Freeverb } from "../fx/freeverb";
import { DelayLine } from "../fx/delayline";
import { SAMPLERATE } from "../environment";
import { BiQuadFilter, FilterType, Q_BUTTERWORTH } from '../synth/biquad';
import { notefreq } from '../synth/note';
import { SineOscillator } from '../synth/sineoscillator.class';
import { SawOscillator } from '../synth/sawoscillator.class';
import { TriBandStereoCompressor } from "../fx/tribandstereocompressor";

export const PATTERN_SIZE_SHIFT: usize = 4;
export const BEATS_PER_PATTERN_SHIFT: usize = 2;

const tribandstereocompressor = new TriBandStereoCompressor(0.05, 25,150,1500,20000);
const ENABLE_MULTIBAND_COMPRESSOR = true;

const gain: f32 = 0.5;

const bass = new SawBass3();
const lead = new Eftang();
const kick = new Kick();
const snare = new Snare();
const hihat = new Hihat();


export class FlatPad {
    private _note: f32;
    readonly envelope: Envelope = new Envelope(0.01, 0.1, 1.0, 0.1);
    readonly filterenvelope: Envelope = new Envelope(0.001, 1.0, 1.0, 0.1);
    readonly hipassfilterenvelope: Envelope = new Envelope(0.02, 3, 0.2, 2.0);
    readonly sawoscillator: SawOscillator = new SawOscillator();
    readonly sawoscillator2: SawOscillator = new SawOscillator();
    readonly sawoscillator3: SawOscillator = new SawOscillator();
    readonly sawoscillator4: SawOscillator = new SawOscillator();
    readonly sawoscillator5: SawOscillator = new SawOscillator();
    readonly lfo: SineOscillator = new SineOscillator();
    
    readonly filterl: BiQuadFilter = new BiQuadFilter();
    readonly filterr: BiQuadFilter = new BiQuadFilter();
    readonly signal: StereoSignal = new StereoSignal();
  
    set note(note: f32) {        
        if(note > 1) {            
            this.lfo.frequency = 1;
            this.lfo.position = 0;
            this.sawoscillator.frequency = notefreq(note);
            this.sawoscillator2.frequency = notefreq(note + 0.03);
            this.sawoscillator3.frequency = notefreq(note - 0.03);
            this.sawoscillator4.frequency = notefreq(note + 0.06);
            this.sawoscillator5.frequency = notefreq(note - 0.06);
            
            this.envelope.attack();           
            this.filterenvelope.attack();             
            this.hipassfilterenvelope.attack();  
            this._note = note;       
        } else {
            this.envelope.release();
            this.filterenvelope.release();
            this.hipassfilterenvelope.release();   
        }
        
    }

    get note(): f32 {
        return this._note;
    }

    next(): void {        
        let env: f32 = this.envelope.next();
        if(env === 0) {
            this.signal.clear();
            return;
        
        }

        const lfo: f32 = this.lfo.next();

        const note = this.note;
        if(note<2) {
            return;
        }
        this.sawoscillator2.frequency = notefreq(note + 0.05 + (0.02 * lfo));
        this.sawoscillator3.frequency = notefreq(note - 0.05 - (0.02 * lfo));
        this.sawoscillator4.frequency = notefreq(note + 0.1 + (0.03 * lfo));
        this.sawoscillator5.frequency = notefreq(note - 0.1 - (0.03 * lfo));
        
        
        let osc: f32 = this.sawoscillator.next();
        let osc2: f32 = this.sawoscillator2.next();
        let osc3: f32 = this.sawoscillator3.next();
        let osc4: f32 = this.sawoscillator4.next();
        let osc5: f32 = this.sawoscillator5.next();
        
        let left = env * (osc + osc2 + osc5);
        let right = env * (osc + osc3 + osc4 );

        const filterlfo: f32 = (lfo * 0.9) + 1;
        this.filterl.update_coeffecients(FilterType.LowPass, SAMPLERATE, 
            200 + this.filterenvelope.next() * filterlfo * 10000 + 20 * (127 - this.note), Q_BUTTERWORTH);
        
        this.filterr.update_coeffecients(FilterType.LowPass, SAMPLERATE, 
                200 + this.filterenvelope.next() * filterlfo * 10000 + 20 * (this.note), Q_BUTTERWORTH);
            
        this.signal.left = this.filterl.process(left );
        this.signal.right = this.filterr.process(right );
    } 
}
  
const pads: FlatPad[] = createInstrumentArray<FlatPad>(10, () => new FlatPad());
let padsVolume: f32 = 1.0;

class SineLead {
    private _note: f32;
    
    readonly osc: SineOscillator = new SineOscillator();
    readonly env1: Envelope = new Envelope(0.02, 0.15, 0.5, 0.3);    
    readonly signal: StereoSignal = new StereoSignal();


    set note(note: f32) {        
        if(note > 1) { 
            this.osc.frequency = notefreq(note);
            this._note = note;
            this.env1.attack();           
        } else {
            this.env1.release();            
        }        
    }

    get note(): f32 {
        return this._note;
    }

    next(): void {        
        const env1: f32 = this.env1.next();
                
        let osc: f32 = this.osc.next();        
        osc *= env1;

        const pan = this._note / 127;

        this.signal.left = osc * pan;
        this.signal.right = osc * (1 - pan);                
    } 
}

export class DriveLead {
    private _note: f32;
    readonly envelope: Envelope = new Envelope(0.03, 1.0, 0.6, 0.2);
    readonly sawoscillatorl: SawOscillator = new SawOscillator();
    readonly sawoscillatorr: SawOscillator = new SawOscillator();
    readonly shaper: WaveShaper = new WaveShaper();
    readonly signal: StereoSignal = new StereoSignal();
    readonly lfoenvelope: Envelope = new Envelope(1.0, 0, 1.0, 0.1);
    readonly lfo: SineOscillator = new SineOscillator();
    private baseFrequency : f32;
    private pitchbend: f32 = 0;

    set note(note: f32) {        
        if(note > 1) {   
            this.shaper.drive = 0.5;         
            this.baseFrequency = notefreq(note + this.pitchbend);
            this.lfo.frequency = 8;
            this.envelope.attack();    
            this.lfoenvelope.attack();                    
            this._note = note;
        } else {
            this.envelope.release();
            this.lfoenvelope.release();
        }
        
    }

    get note(): f32 {
        return this._note;
    }

    setPitchbend(bend: f32): void {
      	this.pitchbend = bend;
      	this.baseFrequency = notefreq(this._note + bend);              	
    }

    next(): void {        
        let env: f32 = this.envelope.next();
        if(env===0) {
            this.signal.clear();
            return;
        }       
        
        let lfo: f32 = this.lfo.next() * 3 * this.lfoenvelope.next();
        this.sawoscillatorl.frequency = this.baseFrequency + lfo + 0.5;
        this.sawoscillatorr.frequency = this.baseFrequency + lfo - 0.5;
        
        let left = env* this.sawoscillatorl.next() + this.signal.right * 0.5;
        left = this.shaper.process(left);
        
        let right = env* this.sawoscillatorr.next() + this.signal.left * 0.5;
        right = this.shaper.process(right);
        
        this.signal.left = left * 0.5 + right;
        this.signal.right = right * 0.5 + left;  
    } 
}

const sinelead = new SineLead();
const drivelead = new DriveLead();

export function setChannelValue(channel: usize, value: f32): void {
  const setChannelValueFunctions: usize[] = [
    changetype<usize>((value:f32): void => {bass.note = value;}),
    changetype<usize>((value:f32): void => {lead.note = value;}),
    changetype<usize>((value:f32): void => {sinelead.note = value;}),
    changetype<usize>((value:f32): void => {kick.note = value;}),
    changetype<usize>((value:f32): void => {snare.note = value;}),
    changetype<usize>((value:f32): void => {hihat.note = value;}),
    changetype<usize>((value:f32): void => {pads[0].note = value;}),
    changetype<usize>((value:f32): void => {pads[1].note = value;}),
    changetype<usize>((value:f32): void => {pads[2].note = value;}),
    changetype<usize>((value:f32): void => {pads[3].note = value;}),    
    changetype<usize>((value:f32): void => {pads[4].note = value;}),    
    changetype<usize>((value:f32): void => {pads[5].note = value;}),
    changetype<usize>((value:f32): void => {pads[6].note = value;}),
    changetype<usize>((value:f32): void => {pads[7].note = value;}),
    changetype<usize>((value:f32): void => {pads[8].note = value;}),
    changetype<usize>((value:f32): void => {pads[9].note = value;}),
    changetype<usize>((value:f32): void => {
      if(value >  0) {
	      padsVolume = value / 100.0;
      }
    }),
    changetype<usize>((value:f32): void => {drivelead.note = value;}),
    changetype<usize>((value:f32): void => {
      if(value > 0) {
	      drivelead.setPitchbend((value - 64) / 32);
      }
    })
    
  ];

  changetype<(val: f32) => void>(setChannelValueFunctions[channel])(value);
}


const mainline = new StereoSignal();
const reverbline = new StereoSignal();
const freeverb = new Freeverb();

const delayframes = (SAMPLERATE * (6/8) * 60 / 120) as usize;
let delayLeft: DelayLine = new DelayLine(delayframes);
let delayRight: DelayLine = new DelayLine(delayframes);
    
let echoline = new StereoSignal();


let eqbandl = new EQBand(20, 19500);
let eqbandr = new EQBand(20, 19500);

export function mixernext(leftSampleBufferPtr: usize, rightSampleBufferPtr: usize): void {  
    let left: f32 = 0;
    let right: f32 = 0;

    mainline.clear();
    reverbline.clear();
    echoline.clear();

    bass.next();
    mainline.addStereoSignal(bass.signal, 1.0, 0.5);
    reverbline.addStereoSignal(bass.signal, 0.0, 0.5);

    lead.next();
    mainline.addStereoSignal(lead.signal, 0.8, 0.5);
    echoline.addStereoSignal(lead.signal, 0.8, 0.5);

  	drivelead.next();
    mainline.addStereoSignal(drivelead.signal, 0.1, 0.5);
    echoline.addStereoSignal(drivelead.signal, 0.4, 0.5);

  	sinelead.next();
    mainline.addStereoSignal(sinelead.signal, 1.0, 0.5);
    echoline.addStereoSignal(sinelead.signal, 1.2, 0.5);

    kick.next();
    mainline.addStereoSignal(kick.signal, 0.8, 0.5);

    snare.next();
    mainline.addStereoSignal(snare.signal, 0.8, 0.5);   

    hihat.next();
    mainline.addStereoSignal(hihat.signal, 0.8, 0.5);

    pads.forEach(pad => {
        pad.next();
        mainline.addStereoSignal(pad.signal, 0.45 * padsVolume, 0.5);
    });
    
    echoline.left += delayRight.read() * 0.7;
    echoline.right += delayLeft.read() * 0.7;

    delayLeft.write_and_advance(echoline.left);
    delayRight.write_and_advance(echoline.right);

    freeverb.tick(reverbline);

    left = gain * (mainline.left + reverbline.left + echoline.left);
    right = gain * (mainline.right + reverbline.right + echoline.right);

  	if (ENABLE_MULTIBAND_COMPRESSOR) {
        tribandstereocompressor.process(left,right,0.45, 0.6, 0.9 , 1.20, 1.05, 1.0);
        left = tribandstereocompressor.stereosignal.left;
        right  = tribandstereocompressor.stereosignal.right;
    } else {
        left = eqbandl.process(left);
        right = eqbandr.process(right);
    }

    store<f32>(leftSampleBufferPtr, left);
    store<f32>(rightSampleBufferPtr, right);    
}