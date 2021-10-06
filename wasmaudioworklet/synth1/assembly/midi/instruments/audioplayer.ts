import { LoPassBiQuadFilter, MidiChannel, Q_BUTTERWORTH } from "../../mixes/globalimports";
import { Envelope } from "../../synth/envelope.class";
import { MidiVoice } from "../midisynth";

const CONTROL_FREQUENCY_CUTOFF = 74;
const MAX_CUTOFF_FREQUENCY: f32 = 20000;
const audioBuffers: Array<StaticArray<f32>> = new Array<StaticArray<f32>>();

export class AudioPlayerChannel extends MidiChannel {
    gain: f32 = 1.0;
    cutoff: f32 = MAX_CUTOFF_FREQUENCY;
    lopassleft: LoPassBiQuadFilter = new LoPassBiQuadFilter();
    lopassright: LoPassBiQuadFilter = new LoPassBiQuadFilter();

    controlchange(controller: u8, value: u8): void {
        super.controlchange(controller, value);
        switch (controller) {
            case CONTROL_FREQUENCY_CUTOFF:
                this.cutoff = value * MAX_CUTOFF_FREQUENCY / 127 as f32;
                this.lopassleft.update(this.cutoff, Q_BUTTERWORTH);
                this.lopassright.update(this.cutoff, Q_BUTTERWORTH);
                break;
        }
    }

    preprocess(): void {
        let left = this.signal.left;
        let right = this.signal.right;
        if (this.cutoff < MAX_CUTOFF_FREQUENCY) {
            left = this.lopassleft.process(left);
            right = this.lopassright.process(right);
        }
        left *= this.gain;
        right *= this.gain;

        this.signal.left = left;
        this.signal.right = right;
    }
}

export class AudioPlayer extends MidiVoice {
    position: i32 = 0;
    velocityLevel: f32;

    constructor(channel: MidiChannel,
        private audioBufferPairNdx: i32,
        private startPosition: i32,
        noteNumber: u8,
        private env: Envelope = new Envelope(0.01, 0.0, 1.0, 0.01)
    ) {
        super(channel);
        this.minnote = noteNumber;
        this.maxnote = noteNumber;
    }

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.velocityLevel = velocity as f32 / 127 as f32;
        this.position = this.startPosition;
        this.env.attack();
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
        return audioBuffers.length == 0 || this.env.isDone();
    }

    nextframe(): void {
        const env = this.env.next();
        const vel = env * this.velocityLevel;

        let pos = this.position;
        const audioBufferNdx = this.audioBufferPairNdx << 1;
        const leftarr = audioBuffers[audioBufferNdx];
        const left = vel * leftarr[pos];
        const right = vel * audioBuffers[audioBufferNdx + 1][pos];
        pos++;
        if (pos == leftarr.length) {
            pos = 0;
        }
        this.position = pos;

        this.channel.signal.left += left;
        this.channel.signal.right += right;
    }
}

export class MonoAudioPlayer {
    position: i32 = 0;

    constructor(private audioBufferNdx: i32) {

    }

    restart(): void {
        this.position = 0;
    }

    get audioBuffer(): StaticArray<f32> {
        return audioBuffers[this.audioBufferNdx];
    }

    nextframe(): f32 {
        return this.audioBuffer[(this.position++) % this.audioBuffer.length];
    }
}

export function allocateAudioBuffer(frames: i32): usize {
    const buf = new StaticArray<f32>(frames);
    audioBuffers.push(buf);
    return changetype<usize>(buf);
}