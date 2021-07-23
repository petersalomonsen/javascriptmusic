import { Envelope } from "../../synth/envelope.class";
import { notefreq } from "../../synth/note";
import { SineOscillator } from "../../synth/sineoscillator.class";
import { MidiVoice } from "../midisynth";

export class DefaultInstrument extends MidiVoice {
    osc: SineOscillator = new SineOscillator();
    env: Envelope = new Envelope(0.01, 0.0, 1.0, 0.01);

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.osc.frequency = notefreq(note);
        this.env.attack();
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
        return this.env.isDone();
    }

    nextframe(): void {
        const signal = this.osc.next() * this.env.next() * this.velocity / 256;
        this.channel.signal.addMonoSignal(signal, 0.2, 0.5);
    }
}