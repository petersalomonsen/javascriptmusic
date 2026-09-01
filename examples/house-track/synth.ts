import { midichannels, MidiChannel } from '../mixes/globalimports';
import { SAMPLERATE } from '../environment';
import { Kick } from '../faust/kick';
import { Hihat } from '../faust/hihat';
import { Pad } from '../faust/pad';
import { Bass } from '../faust/bass';
import { Snare } from '../faust/snare';
import { Lead } from '../faust/lead';

// Per-channel feedback echo: routes ONLY this channel's signal through a delay
// line in preprocess() (called per frame on the channel's own signal before mixing).
class LeadEchoChannel extends MidiChannel {
    bufSize: i32 = 96000;
    bufL: StaticArray<f32> = new StaticArray<f32>(96000);
    bufR: StaticArray<f32> = new StaticArray<f32>(96000);
    pos: i32 = 0;
    delaySamples: i32 = <i32>(SAMPLERATE * 0.72); // 1.5 beats @125bpm (6 sixteenth-steps)
    feedback: f32 = 0.5;
    mix: f32 = 0.45;

    preprocess(): void {
        let rp = this.pos - this.delaySamples;
        if (rp < 0) rp += this.bufSize;
        const wetL = this.bufL[rp];
        const wetR = this.bufR[rp];
        const inL = this.signal.left;
        const inR = this.signal.right;
        this.bufL[this.pos] = inL + wetL * this.feedback;
        this.bufR[this.pos] = inR + wetR * this.feedback;
        this.signal.left = inL + wetL * this.mix;
        this.signal.right = inR + wetR * this.mix;
        this.pos++;
        if (this.pos >= this.bufSize) this.pos = 0;
    }
}

export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(2, (channel: MidiChannel) => new Kick(channel));
    midichannels[1] = new MidiChannel(3, (channel: MidiChannel) => new Hihat(channel));
    midichannels[2] = new MidiChannel(8, (channel: MidiChannel) => new Pad(channel));
    midichannels[3] = new MidiChannel(2, (channel: MidiChannel) => new Bass(channel));
    midichannels[4] = new MidiChannel(4, (channel: MidiChannel) => new Snare(channel));
    midichannels[5] = new LeadEchoChannel(8, (channel: MidiChannel) => new Lead(channel));
}
export function postprocess(): void {}