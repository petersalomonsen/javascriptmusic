import { SawOscillator, Instrument, Noise, BiQuadFilter, FilterType, 
    StereoSignal,
    Freeverb, SineOscillator, Envelope, notefreq } from "./globalimports";
  import { SAMPLERATE } from '../environment';
  
  export const PATTERN_SIZE_SHIFT: usize = 4;
  export const BEATS_PER_PATTERN_SHIFT: usize = 2;
  
  const mainline = new StereoSignal();
  const reverbline = new StereoSignal();
  const freeverb = new Freeverb();
  
  class Kick extends Instrument {
      private velocity: f32;
      envelope: Envelope = new Envelope(0.0, 0.2, 0, 0.2);
      filterenvelope: Envelope = new Envelope(0.0, 0.05, 0.05, 0.1);
      sawoscillator: SawOscillator = new SawOscillator();
      noise: Noise = new Noise();
      
      filter: BiQuadFilter = new BiQuadFilter();
      
      set note(note: f32) {        
          if(note > 1) {            
              this.sawoscillator.frequency = 150;
              this.velocity = note / 16;   
              this.envelope.attack();           
              this.filterenvelope.attack();             
          } else {
              this.envelope.release();
              this.filterenvelope.release();
          }
      }
  
      next(): void {        
          let env: f32 = this.envelope.next();
          this.sawoscillator.frequency = 20.0 + (env * 150.0);
          
          this.filter.update_coeffecients(FilterType.LowPass, SAMPLERATE, 
              40 + (this.filterenvelope.next() * 2000), 0.2);
  
          let osc1: f32 = this.envelope.next() * this.velocity * this.sawoscillator.next() * 0.8 + this.noise.next();
  
          osc1 = this.filter.process(osc1);
          
            const val = env * osc1;
        
          mainline.left+=val;
          mainline.right+=val;
      } 
  }
  
  class Lead extends Instrument {
    osc: SineOscillator = new SineOscillator();
    env: Envelope = new Envelope(0.1,0.1,1.0,0.1);
    
    set note(note: f32) {
      if(note > 1) {
          this.osc.frequency = notefreq(note);
        this.env.attack();
      } else if (note === 0) {
        this.env.release();
      }
    }
    @inline
    next(): void {
      const val = this.osc.next() * this.env.next() * 0.3;
      mainline.left += val;
      mainline.right += val;
    }
  }
  
  
  const voices: Instrument[] = [
        new Kick(),
      new Lead(),
        new Lead(),
        new Lead(),
        new Lead()
  ];
  
  export function setChannelValue(channel: usize, value: f32): void {
    voices[channel].note = value;
  }
  
  
  @inline
  export function mixernext(leftSampleBufferPtr: usize, rightSampleBufferPtr: usize): void {  
    mainline.clear();
    reverbline.clear();
  
    for(var n=0;n<voices.length;n++) {
      voices[n].next();
    }
  
    freeverb.tick(reverbline);
  
    store<f32>(leftSampleBufferPtr, mainline.left + reverbline.left);
    store<f32>(rightSampleBufferPtr, mainline.right + reverbline.right);    
  }