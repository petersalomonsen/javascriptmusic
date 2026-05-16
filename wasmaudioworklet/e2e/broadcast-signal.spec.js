import { test, expect } from '@playwright/test';

// Two-tab end-to-end coverage for broadcastSend / broadcastWait.
// Both tabs run the app on the same origin, so they share a
// BroadcastChannel('concert-sync') space. One tab parks on a wait, the
// other emits the matching signal from its song, and we observe the
// receiver's play checkbox flip back on as the resume side-effect.

const synthSource = `
import { midichannels, MidiChannel, MidiVoice, SineOscillator, Envelope, notefreq } from './globalimports';

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
        const signal = this.osc.next() * this.env.next() * this.velocity / 256;
        this.channel.signal.add(signal, signal);
    }
}
export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(1, (ch) => new SimpleSine(ch));
}
export function postprocess(): void {}
`;

// Sender song plays through, then emits 'go' at the end — the realistic
// concert flow where one song finishes and hands off to the next.
const senderSong = `
setBPM(120);
await createTrack(0).steps(4, [
    c5, , , ,
]);
broadcastSend('go');
`;

// Receiver song parks on 'go' as its first event.
const receiverSong = `
setBPM(120);
broadcastWait('go');
await createTrack(0).steps(4, [
    c5, , , ,
]);
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

async function isPlayChecked(page) {
    return page.evaluate(() =>
        document.querySelector('app-javascriptmusic').shadowRoot
            .getElementById('toggleSongPlayCheckbox').checked
    );
}

async function clickInsideApp(page, selector) {
    await page.evaluate((sel) => {
        document.querySelector('app-javascriptmusic').shadowRoot
            .querySelector(sel).click();
    }, selector);
}

test.describe('broadcast send/wait across windows', () => {
    test('receiver parks on broadcastWait, sender emits matching signal, receiver resumes', async ({ context, baseURL }) => {
        const receiver = await context.newPage();
        const sender = await context.newPage();

        // Surface page logs (and stamp them so the two streams don't blur).
        receiver.on('console', (m) => console.log('[recv]', m.type(), m.text()));
        receiver.on('pageerror', (e) => console.log('[recv-error]', e.message));
        sender.on('console', (m) => console.log('[send]', m.type(), m.text()));
        sender.on('pageerror', (e) => console.log('[send-error]', e.message));

        await receiver.goto(baseURL);
        await sender.goto(baseURL);
        await waitForReady(receiver);
        await waitForReady(sender);

        await setSongAndSynth(receiver, receiverSong, synthSource);
        await setSongAndSynth(sender, senderSong, synthSource);

        // Start receiver first. It'll compile the synth (slow on first
        // run), then the sequencer's very first event is the wait — so
        // the play checkbox should auto-uncheck as the worklet hits it.
        await clickInsideApp(receiver, '#startaudiobutton');
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(false);

        // Sanity: receiver stays parked until *something* sends 'go'.
        // Give it a beat to make sure no spurious resume happens.
        await receiver.waitForTimeout(500);
        expect(await isPlayChecked(receiver)).toBe(false);

        // Start sender. Its song plays through its 4 steps (~500ms at
        // 120 BPM) and the final event is broadcastSend('go'), which
        // travels: worklet → main thread → BroadcastChannel → receiver's
        // main thread → receiver's worklet. Receiver's wait clears,
        // playMidiSequence flips back true, broadcastResumed is posted,
        // the UI handler re-checks the box.
        await clickInsideApp(sender, '#startaudiobutton');
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(true);
    });
});
