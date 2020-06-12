import { StereoSignal } from "../synth/stereosignal.class";

export abstract class Instrument {
    abstract set note(note: f32);
    readonly signal: StereoSignal = new StereoSignal();
    abstract next(): void;
}