
import { SAMPLERATE } from '../environment';
import { sin, PI } from '../math/sin';

export class SineOscillator {
    position: u32 = 0;
    frequency: f32 = 0;

    next(): f32 {
      let ret = sin(PI * 2 * (this.position as f32) / (1 << 16 as f32));
      this.position = (((this.position as f32) + (this.frequency/SAMPLERATE)
                          * 0x10000 as f32) as u32) & 0xffff;
      
      return ret as f32;
    }
  }
  