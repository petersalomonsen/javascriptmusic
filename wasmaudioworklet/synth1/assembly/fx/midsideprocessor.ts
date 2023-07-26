import { StereoSignal } from "../synth/stereosignal.class";

export class MidSideProcessor {
  signal: StereoSignal = new StereoSignal();

  constructor(private side_level: f32) {

  }

  process(left: f32, right: f32): void {
    // Mid-side processing
    let mid: f32 = (left + right) / 2.0;
    let side: f32 = (left - right) / 2.0;

    side *= this.side_level;
    this.signal.left = mid + side;
    this.signal.right = mid - side;
  }
}