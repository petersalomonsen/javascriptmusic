
import { SAMPLERATE } from '../environment';
import { SineOscillator } from '../synth/sineoscillator.class';
import { StereoSignal } from '../synth/stereosignal.class';
import { Envelope } from '../synth/envelope.class';
import { SawOscillator } from '../synth/sawoscillator.class';
import { Noise } from '../synth/noise.class';
import { WaveShaper } from '../synth/shaper';
import { notefreq } from '../synth/note';


export class DriveLead {
    private _note: f32;
    readonly envelope: Envelope = new Envelope(0.1, 1.0, 0.6, 0.2);
    readonly sawoscillatorl: SawOscillator = new SawOscillator();
    readonly sawoscillatorr: SawOscillator = new SawOscillator();
    readonly shaper: WaveShaper = new WaveShaper();
    readonly signal: StereoSignal = new StereoSignal();
    readonly lfoenvelope: Envelope = new Envelope(1.0, 0, 1.0, 0.1);
    readonly lfo: SineOscillator = new SineOscillator();
    baseFrequency : f32;
    pitchbend: f32 = 0;

    set note(note: f32) {        
        if(note > 1) {   
            this.shaper.drive = 0.5;         
            this.baseFrequency = notefreq(note);
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
    }

    next(): void {        
        let env: f32 = this.envelope.next();
        if(env===0) {
            this.signal.clear();
            return;
        }
        
        const pitchbend: f32 = this.pitchbend;
        if (Math.abs(pitchbend) > 0.01) {
            // Simple pitchbend that always will return to base note
            this.baseFrequency = notefreq(this._note + pitchbend);
            this.pitchbend = pitchbend * 0.9999;
        } else if(pitchbend !==0 ) {
            this.pitchbend = 0;
            this.baseFrequency = notefreq(this._note);
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
  