import { Kick2 } from "../instruments/drums/kick2.class";
import { SineOscillator } from '../synth/sineoscillator.class';
import { Envelope } from '../synth/envelope.class';
import { StereoSignal } from "../synth/stereosignal.class";
import { notefreq } from '../synth/note';

export const PATTERN_SIZE_SHIFT: usize = 4;
export const BEATS_PER_PATTERN_SHIFT: usize = 2;

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

const kick = new Kick2();
const sinelead = new SineLead();

export function setChannelValue(channel: usize, value: f32): void {
    switch(channel) {
        case 0:
            kick.note = value;
            break;
        case 1:
            sinelead.note = value;
            break;
    }
}

export function mixernext(leftSampleBufferPtr: usize, rightSampleBufferPtr: usize): void {  
    let left: f32 = 0;
    let right: f32 = 0;

    kick.next();
    left += kick.signal.left;
    right += kick.signal.right;
    
    sinelead.next();
    left += sinelead.signal.left;
    right += sinelead.signal.right;
    
  	const gain: f32 = 0.4;
  	left *= gain;
  	right *= gain;
    store<f32>(leftSampleBufferPtr, left);
    store<f32>(rightSampleBufferPtr, right);    
}