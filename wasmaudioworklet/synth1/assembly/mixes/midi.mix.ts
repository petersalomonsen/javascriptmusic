import { midichannels, MidiChannel, MidiVoice, SineOscillator, Envelope, notefreq } from './globalimports';
import { outputline } from '../midi/midisynth';
import { hardclip } from '../synth/clip';

class SimpleSine extends MidiVoice {
    osc: SineOscillator = new SineOscillator();
    env: Envelope = new Envelope(0.1, 0.0, 1.0, 0.1);

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
        this.channel.signal.addMonoSignal(signal, 0.2, 0.7);
    }
}

export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(6, (channel: MidiChannel) => new SimpleSine(channel));
}

export function postprocess(): void {
    outputline.left = hardclip(outputline.left);
    outputline.right = hardclip(outputline.right);
}