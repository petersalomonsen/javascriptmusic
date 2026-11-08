import { midichannels, MidiChannel } from './globalimports';
import { Kick } from '../faust/kick';

export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(2, (channel: MidiChannel) => new Kick(channel));
}

export function postprocess(): void {}
