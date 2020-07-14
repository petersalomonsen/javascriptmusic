import { initializeMidiSynth, postprocess } from '../mixes/midi.mix';
import { StereoSignal, Envelope, SineOscillator, notefreq, Freeverb } from '../mixes/globalimports';
import { midiLevelToGain } from '../synth/decibel';

import { Pan } from '../synth/pan.class';

const MAX_ACTIVE_VOICES_SHIFT = 5; // up to 32 voices playing simultaneously
const MAX_ACTIVE_VOICES = 1 << MAX_ACTIVE_VOICES_SHIFT;

export const midichannels = new StaticArray<MidiChannel>(16);
export const activeVoices = new StaticArray<MidiVoice | null>(MAX_ACTIVE_VOICES);
export let numActiveVoices = 0;
export let voiceActivationCount = 0;
export let currentframe = 0;
export const sampleBufferFrames = 128;
export const sampleBufferBytesPerChannel = sampleBufferFrames * 4;
export const sampleBufferChannels = 2;
export const samplebuffer = new StaticArray<f32>(sampleBufferFrames * sampleBufferChannels);
const bufferposstart = changetype<usize>(samplebuffer);
const bufferposend = changetype<usize>(samplebuffer) + sampleBufferBytesPerChannel;

const CONTROL_SUSTAIN: u8 = 64;
const CONTROL_VOLUME: u8 = 7;
const CONTROL_PAN: u8 = 10;
const CONTROL_REVERB: u8 = 91;

const mainline = new StereoSignal();
const reverbline = new StereoSignal();
const freeverb = new Freeverb();
export const outputline = new StereoSignal();

export class MidiChannel {
    controllerValues: StaticArray<u8> = new StaticArray<u8>(128);
    voices: StaticArray<MidiVoice>;
    sustainedVoices: StaticArray<MidiVoice | null> = new StaticArray<MidiVoice | null>(MAX_ACTIVE_VOICES);
    sustainedVoicesIndex: i32 = 0;
    signal: StereoSignal = new StereoSignal();
    volume: f32 = midiLevelToGain(100);
    reverb: f32 = midiLevelToGain(7);
    pan: Pan = new Pan();

    constructor(numvoices: i32, factoryFunc: (channel: MidiChannel, voiceindex: i32) => MidiVoice) {
        this.voices = new StaticArray<MidiVoice>(numvoices);
        for (let n=0; n<numvoices; n++) {
            this.voices[n] = factoryFunc(this, n);
        }
        
    }

    controlchange(controller: u8, value: u8): void {
        this.controllerValues[controller] = value;

        switch (controller) {
            case CONTROL_SUSTAIN:
                // sustain
                if (value < 64) {
                    for (let n = 0; n<MAX_ACTIVE_VOICES; n++) {
                        if (this.sustainedVoices[n] != null) {
                            (this.sustainedVoices[n] as MidiVoice).noteoff();
                            this.sustainedVoices[n] = null;
                        }
                    }
                }
                break;
            case CONTROL_VOLUME:
                this.volume = midiLevelToGain(value);
                break;
            case CONTROL_REVERB:
                this.reverb = midiLevelToGain(value);
                break;
            case CONTROL_PAN:
                this.pan.setPan((value as f32)/ 127.0);
                break;
        }
    }

    noteoff(note: u8): void {
        for(let n = 0; n < this.voices.length; n++) {
            const voice = this.voices[n];
            if (voice.note === note) {
                if (this.controllerValues[CONTROL_SUSTAIN] >= 64 ) {
                    this.sustainedVoices[this.sustainedVoicesIndex++] = voice;
                    this.sustainedVoicesIndex &= ((1 << MAX_ACTIVE_VOICES_SHIFT) - 1);
                } else {
                    voice.noteoff();
                }
                break;
            }
        }
    }

    removeFromSustainedVoices(voice: MidiVoice): void {
        for(let n=0;n<this.sustainedVoices.length;n++) {
            if(this.sustainedVoices[n] === voice) {
                this.sustainedVoices[n] = null;
            }
        }
    }
    
    activateVoice(note: u8): MidiVoice | null {
        for(let n = 0; n<this.voices.length; n++) {
            const voice = this.voices[n];
            if(voice.activeVoicesIndex > -1 && voice.note === note) {
                // Found already active voice for the given note
                voice.activationCount = voiceActivationCount++;
                // must remove from sustained voices
                this.removeFromSustainedVoices(voice);
                return voice;
            }
        }

        if (numActiveVoices === activeVoices.length) {
            return null;
        }

        let activeVoiceIndex: i32 = numActiveVoices;
        
        for(let n = 0; n<this.voices.length; n++) {
            const voice = this.voices[n];
            if (voice.activeVoicesIndex === -1 &&
                note >= voice.minnote &&
                note <= voice.maxnote) {
                const availableVoice = voice as MidiVoice;
                activeVoices[activeVoiceIndex] = availableVoice;
                availableVoice.activeVoicesIndex = activeVoiceIndex;
                numActiveVoices++;
                return availableVoice;
            }
        }

        // no available voices for the current channel, we'll pick the oldest
        let oldestVoice: MidiVoice | null = null;
        for(let n = 0; n<this.voices.length; n++) {
            const voice = this.voices[n];
            if (
                (oldestVoice === null ||
                voice.activationCount <= (oldestVoice as MidiVoice).activationCount) &&
                note >= voice.minnote &&
                note <= voice.maxnote) {
                oldestVoice = voice;
            }
        }
        if (oldestVoice !== null) {
            (oldestVoice as MidiVoice).activationCount = voiceActivationCount++;
            this.removeFromSustainedVoices(oldestVoice);
        }
        return oldestVoice;
    }

    /**
     * Process channel signal before sending to outputs
     */
    preprocess(): void {

    }
}

export abstract class MidiVoice {
    channel: MidiChannel;
    note: u8;
    velocity: u8;
    activeVoicesIndex: i32 = -1;
    activationCount: i32 = (voiceActivationCount++);
    minnote: u8 = 0;
    maxnote: u8 = 127;

    constructor(channel: MidiChannel) {
        this.channel = channel;
    }

    /**
     * If you override this (e.g. to trigger attacks on envelopes), make sure you call super.noteon
     * @param note 
     * @param velocity 
     */
    noteon(note: u8, velocity: u8): void {
        this.note = note;
        this.velocity = velocity;
    }

    /**
     * Override this to e.g. trigger releases on envelopes
     */
    noteoff(): void {
        this.velocity = 0;
    }

    /**
     * This will be called repeatedly as long as the voice is active
     * 
     * Override it to add checks for e.g. envelope to be fully released
     */
    isDone(): boolean {
        return this.velocity === 0;
    }

    deactivate(): void {
        activeVoices[this.activeVoicesIndex] = null;
        this.activeVoicesIndex = -1;
    }

    /**
     * Will be called for rendering an audio frame
     */
    abstract nextframe(): void;
}

export function shortmessage(val1: u8, val2: u8, val3: u8): void {
    const channel = val1 & 0xf;
    const command = val1 & 0xf0;

    if(command === 0x90 && val3 > 0) {
        const activatedVoice = midichannels[channel].activateVoice(val2);
        if(activatedVoice!==null) {
            const voice = activatedVoice as MidiVoice;
            voice.noteon(val2, val3);
        }
    } else if(
        (command === 0x80 ||
        (command === 0x90 && val3 === 0)) // 
    ) {
        // note off
        midichannels[channel].noteoff(val2);
    } else if(command === 0xb0) {
        // control change
        midichannels[channel].controlchange(val2, val3);
    }
}

export function allNotesOff(): void {
    for (let n=0; n<numActiveVoices; n++) {
        const voice = activeVoices[n] as MidiVoice;
        voice.noteoff();
    }
}

export function cleanupInactiveVoices(): void {
    for (let n=0; n<numActiveVoices; n++) {
        const voice = activeVoices[n] as MidiVoice;
        if (voice.isDone()) {
            voice.deactivate();
            for (let r = n+1; r < numActiveVoices; r++) {
                const nextVoice = activeVoices[r] as MidiVoice;
                nextVoice.activeVoicesIndex--;
                activeVoices[r-1] = nextVoice;
                activeVoices[r] = null;
            }
            numActiveVoices--;
            n--;
        }
    }
}

export function playActiveVoices(): void {
    for (let n=0; n<numActiveVoices; n++) {
        (activeVoices[n] as MidiVoice).nextframe();
    }
}

export function fillSampleBuffer(): void {      
    cleanupInactiveVoices();

    for(let bufferpos = bufferposstart; bufferpos<bufferposend; bufferpos+=4) {
        playActiveVoices();

        for(let ch = 0; ch < 16; ch++) {            
            const midichannel = midichannels[ch];
            midichannel.preprocess();
            const channelsignal = midichannel.signal;
            channelsignal.left *= midichannel.pan.leftLevel * midichannel.volume;
            channelsignal.right *= midichannel.pan.rightLevel * midichannel.volume;
            
            const reverb = midichannel.reverb;

            mainline.add(channelsignal.left, channelsignal.right);
            reverbline.add(channelsignal.left*reverb, channelsignal.right*reverb);
            midichannel.signal.clear();
        }

        freeverb.tick(reverbline);

        outputline.add(
            mainline.left + reverbline.left,
            mainline.right + reverbline.right
        );

        postprocess();

        store<f32>(bufferpos, outputline.left);
        store<f32>(bufferpos + sampleBufferBytesPerChannel, outputline.right);

        mainline.clear();
        reverbline.clear();
        outputline.clear();
    }
}

class DefaultInstrument extends MidiVoice {
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
const defaultMidiChannel = new MidiChannel(1, (channel: MidiChannel) => new DefaultInstrument(channel));

for(let ch = 0; ch < 16; ch++) {
    midichannels[ch] = defaultMidiChannel;
}

initializeMidiSynth();

