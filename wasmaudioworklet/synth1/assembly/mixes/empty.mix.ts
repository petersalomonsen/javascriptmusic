import { Kick2, SawBass, Instrument,
  StereoSignal,
  Freeverb } from "./globalimports";

export const PATTERN_SIZE_SHIFT: usize = 4;
export const BEATS_PER_PATTERN_SHIFT: usize = 2;

const kick = new Kick2();
const sawbass = new SawBass();

export function setChannelValue(channel: usize, value: f32): void {
  ([kick, sawbass] as Instrument[])[channel].note = value;
}

const mainline = new StereoSignal();
const reverbline = new StereoSignal();
const freeverb = new Freeverb();

@inline
export function mixernext(leftSampleBufferPtr: usize, rightSampleBufferPtr: usize): void {  
  mainline.clear();
  reverbline.clear();

  kick.next();
  mainline.addStereoSignal(kick.signal, 0.5, 0.5);

  sawbass.next();
  mainline.addStereoSignal(sawbass.signal, 0.5, 0.5);
  reverbline.addStereoSignal(sawbass.signal, 0.1, 0.5);

  freeverb.tick(reverbline);

  store<f32>(leftSampleBufferPtr, mainline.left + reverbline.left);
  store<f32>(rightSampleBufferPtr, mainline.right + reverbline.right);    
}