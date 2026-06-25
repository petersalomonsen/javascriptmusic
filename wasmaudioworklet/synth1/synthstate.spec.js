import { compileSong, createMultipatternSequence } from '../midisequencer/songcompiler.js';
import { compileWebAssemblySynth } from './browsersynthcompiler.js';

// The generic synth → shader state channel. The engine offers a fixed f32
// buffer (getSynthStateSnapshot) and the per-sample postprocess() hook; a song's
// synth.ts owns all meaning. Here a tiny "game" synth captures a control note
// (channel 9) and integrates speed/distance in postprocess(), writing the
// generic synthState — verified read-back through the export. The engine knows
// nothing about cars: this is exactly what beachdrive's synth.ts does.
const gameSynth = `
import { midichannels, MidiChannel, MidiVoice, synthState } from '../mixes/globalimports';

const DT: f32 = 1.0 / 44100.0;
let throttle: f32 = 0;
let distance: f32 = 0, speed: f32 = 0, gameTime: f32 = 0;

class CarControlVoice extends MidiVoice {
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        if (note == 36) throttle = (velocity as f32) / 127.0;
    }
    noteoff(): void {
        if (this.note == 36) throttle = 0;
        super.noteoff();
    }
    nextframe(): void {}
}

export function initializeMidiSynth(): void {
    midichannels[9] = new MidiChannel(8, (ch) => new CarControlVoice(ch));
}

export function postprocess(): void {
    gameTime += DT;
    speed += (10.0 * throttle - 4.0) * DT;
    if (speed < 0) speed = 0;
    if (speed > 14.0) speed = 14.0;
    distance += speed * DT;
    synthState[0] = distance;
    synthState[1] = speed;
    synthState[3] = gameTime;
}
`;

describe('synth state relay (generic synth → shader channel)', function () {
    this.timeout(30000);

    it('a game synth integrates state in postprocess and exposes it via getSynthStateSnapshot', async () => {
        await compileSong(`setBPM(120); loopHere();`);
        const sequence = createMultipatternSequence();
        const wasmbytes = await compileWebAssemblySynth(gameSynth, sequence, 44100, 'midimultipartmodule');
        const wasm = (await WebAssembly.instantiate(wasmbytes, {
            environment: { SAMPLERATE: 44100 }
        })).instance.exports;

        const state = () => new Float32Array(wasm.memory.buffer, wasm.getSynthStateSnapshot(), 64);

        // Idle: distance/speed stay 0 (drag), but gameTime advances every block —
        // postprocess runs regardless of the sequencer (drive-while-paused).
        for (let i = 0; i < 10; i++) wasm.fillSampleBuffer();
        let s = state();
        assert.equal(s[0], 0, 'distance 0 while idle');
        assert.equal(s[1], 0, 'speed 0 while idle');
        assert.ok(s[3] > 0, 'gameTime advances while idle/paused');

        // Hold throttle (note 36) on the game channel (0x90 | 9 = 0x99).
        wasm.shortmessage(0x99, 36, 127);
        for (let i = 0; i < 400; i++) wasm.fillSampleBuffer();   // ~1.16s
        s = state();
        assert.ok(s[1] > 0, 'speed increases under throttle');
        assert.ok(s[0] > 0, 'distance accumulates while moving');

        // Release → speed decays.
        const moving = s[1];
        wasm.shortmessage(0x89, 36, 0);
        for (let i = 0; i < 400; i++) wasm.fillSampleBuffer();
        s = state();
        assert.ok(s[1] < moving, 'speed decays after releasing throttle');
    });
});
