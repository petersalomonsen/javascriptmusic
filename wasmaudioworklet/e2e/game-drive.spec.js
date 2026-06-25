import { test, expect } from '@playwright/test';

// End-to-end: a song that is a *game*, with all game logic in its synth.ts and
// nothing game-specific in the app. The engine only relays a generic f32
// `synthState` buffer (written by the synth's postprocess) to the shader, which
// the app exposes for this test as window.getSynthState().
//
// Verifies:
//  1) a throttle note (channel 9, c3=36) integrated in the synth grows the car's
//     distance — note → wasm postprocess → generic relay, end to end in the app;
//  2) gameTime keeps advancing while the *music is paused* — postprocess runs
//     every audio block regardless of the sequencer, so you can drive stopped.

const gameSynth = `
import { midichannels, MidiChannel, MidiVoice, SineOscillator, Envelope, notefreq, synthState } from '../mixes/globalimports';

const DT: f32 = 1.0 / 44100.0;
let throttle: f32 = 0;
let distance: f32 = 0, speed: f32 = 0, gameTime: f32 = 0;

// silent control voice on the game channel
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

// an audible instrument so the song still makes sound on channel 0
class SimpleSine extends MidiVoice {
    osc: SineOscillator = new SineOscillator();
    env: Envelope = new Envelope(0.0, 0.0, 1.0, 0.1);
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.osc.frequency = notefreq(note);
        this.env.attack();
    }
    noteoff(): void { this.env.release(); }
    isDone(): boolean { return this.env.isDone(); }
    nextframe(): void {
        const s = this.osc.next() * this.env.next() * this.velocity / 256;
        this.channel.signal.add(s, s);
    }
}

export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(1, (ch) => new SimpleSine(ch));
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

// Hold throttle (c3=36) on the game channel (9) so the car drives; a melody on
// channel 0 keeps the sequence running. loopHere keeps it alive for polling.
const driveSong = `
setBPM(120);
createTrack(9).play([[ 0, c3(8, 120) ]]);
await createTrack(0).steps(2, [ c4, e4, g4, c5 ]);
loopHere();
`;

async function waitForReady(page) {
    await page.waitForFunction(() => {
        const app = document.querySelector('app-javascriptmusic');
        if (!app || !app.shadowRoot) return false;
        return !!app.shadowRoot.querySelector('#editor .CodeMirror')
            && !!app.shadowRoot.querySelector('#assemblyscripteditor .CodeMirror')
            && !!app.shadowRoot.getElementById('startaudiobutton');
    }, { timeout: 30000 });
}

async function setSongAndSynth(page, song, synth) {
    await page.evaluate(({ song, synth }) => {
        const root = document.querySelector('app-javascriptmusic').shadowRoot;
        root.querySelector('#editor .CodeMirror').CodeMirror.setValue(song);
        root.querySelector('#assemblyscripteditor .CodeMirror').CodeMirror.setValue(synth);
    }, { song, synth });
}

async function clickInsideApp(page, selector) {
    await page.evaluate((sel) => {
        document.querySelector('app-javascriptmusic').shadowRoot
            .querySelector(sel).click();
    }, selector);
}

const synthState = (page) => page.evaluate(() =>
    (typeof window.getSynthState === 'function') ? Array.from(window.getSynthState()) : null);

test.describe('game state in the synth, relayed generically to the shader', () => {
    test('a throttle note drives the car, and the game keeps ticking while paused', async ({ page }) => {
        page.on('console', (m) => console.log('[page]', m.type(), m.text()));
        page.on('pageerror', (e) => console.log('[page-error]', e.message));

        await page.goto('/');
        await waitForReady(page);
        await setSongAndSynth(page, driveSong, gameSynth);

        await clickInsideApp(page, '#startaudiobutton');

        // (1) carDistance (synthState[0]) grows from the throttle note.
        await expect
            .poll(async () => (await synthState(page))?.[0] ?? -1, { timeout: 60000 })
            .toBeGreaterThan(0.5);

        const s = await synthState(page);
        expect(s[1]).toBeGreaterThan(0);    // speed > 0 under throttle
        expect(s[3]).toBeGreaterThan(0);    // gameTime running

        // (2) Pause the music; gameTime keeps advancing (postprocess still runs).
        await clickInsideApp(page, '#toggleSongPlayCheckbox');
        const tBefore = (await synthState(page))[3];
        await page.waitForTimeout(700);
        const tAfter = (await synthState(page))[3];
        expect(tAfter).toBeGreaterThan(tBefore);
    });
});
