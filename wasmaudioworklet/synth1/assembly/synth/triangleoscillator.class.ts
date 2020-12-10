import { SAMPLERATE } from '../environment';

export class TriangleOscillator {
    position: i32 = 0;
    frequency: f32 = 0;

    next(): f32 {
        if (this.frequency > 0) {
            const pos: i32 = this.position;
            let ret: f32;
            if (pos < 0x8000) {
                ret = (pos as f32 / 0x8000 as f32);
            } else {
                ret = (- (pos - 0x8000) as f32 / 0x8000 as f32) + 1.0;
            }

            this.position = (((this.position as f32) + (this.frequency / SAMPLERATE)
                * 0x10000 as f32) as i32) & 0xffff;

            return ret * 2 - 1 as f32;
        } else {
            return 0;
        }
    }
}
