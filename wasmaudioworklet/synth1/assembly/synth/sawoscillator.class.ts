
import { SAMPLERATE } from '../environment';

export class SawOscillator {
    position: u32 = 0;
    frequency: f32 = 0;

    next(): f32 {
      if(this.frequency > 0) {
        let ret = (this.position as f32 / 0x10000 as f32) - 0.5;
        this.position = (((this.position as f32) + (this.frequency/SAMPLERATE)
                            * 0x10000 as f32) as u32) & 0xffff;
        
        
        return ret as f32;
      } else {
        return 0;
      }
    }
  }
  