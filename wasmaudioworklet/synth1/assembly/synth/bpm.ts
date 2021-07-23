import { SAMPLERATE } from "../environment";

export function beatToFrame(beat: f64, bpm: f32): usize {
    return (SAMPLERATE * beat * 60 / bpm) as usize;
}
