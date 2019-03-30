
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
    readonly envelope: Envelope = new Envelope(0.1, 1.0, 1.0, 0.2);
    readonly sawoscillator: SawOscillator = new SawOscillator();
    readonly shaper: WaveShaper = new WaveShaper();
    readonly signal: StereoSignal = new StereoSignal();

    set note(note: f32) {        
        if(note > 1) {   
            this.shaper.drive = 0.6;         
            this.sawoscillator.frequency = notefreq(note);
            this.envelope.attack();                        
        } else {
            this.envelope.release();
        }
        this._note = note;
    }

    get note(): f32 {
        return this._note;
    }

    next(): void {        
        let ret: f32 = this.envelope.next();
        if(ret===0) {
            this.signal.clear();
            return;
        }
        ret *= this.sawoscillator.next();
        ret = this.shaper.process(ret);
        

        this.signal.left = this.signal.right / 1.2;
        this.signal.right = this.signal.left / 1.2;
        this.signal.addMonoSignal(ret, 0.6, 0.5);        
    } 
}
  