import { midichannels, MidiChannel, MidiVoice, SineOscillator, Envelope, notefreq } from './globalimports';
import { Kick } from '../faust/kick';
import { Hihat } from '../faust/hihat';
import { Pad } from '../faust/pad';
import { Bass } from '../faust/bass';
import { Padlead3, Padlead3Channel } from '../faust/padlead3';
import { Jumppad2, Jumppad2Channel } from '../faust/jumppad2';
import { Warmpad } from '../faust/warmpad';
import { Snare } from '../faust/snare';

class Piano extends MidiVoice {
    osc: SineOscillator = new SineOscillator();
    env: Envelope = new Envelope(0.01, 0.1, 0.7, 0.2);

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
        this.channel.signal.add(signal, signal);
    }
}

export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(2, (channel: MidiChannel) => new Kick(channel));
    midichannels[1] = new MidiChannel(3, (channel: MidiChannel) => new Hihat(channel));
    midichannels[2] = new MidiChannel(8, (channel: MidiChannel) => new Pad(channel));
    midichannels[3] = new MidiChannel(8, (channel: MidiChannel) => new Bass(channel));
    midichannels[4] = new Padlead3Channel(8, (channel: MidiChannel) => new Padlead3(channel));
    midichannels[5] = new Jumppad2Channel(8, (channel: MidiChannel) => new Jumppad2(channel));
    midichannels[6] = new MidiChannel(8, (channel: MidiChannel) => new Warmpad(channel));
    midichannels[7] = new MidiChannel(2, (channel: MidiChannel) => new Snare(channel));
}

export function postprocess(): void {}
