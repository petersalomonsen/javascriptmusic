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

// --- Song variants ---------------------------------------------------------

const waitAtStartThenNotes = (name) => `
setBPM(120);
broadcastWait('${name}');
await createTrack(0).steps(4, [c5, , , ,]);
`;

const notesThenSend = (name) => `
setBPM(120);
await createTrack(0).steps(4, [c5, , , ,]);
broadcastSend('${name}');
`;

const notesSendMidThenMore = (name) => `
setBPM(120);
await createTrack(0).steps(4, [c5, , , ,]);
broadcastSend('${name}');
await createTrack(0).steps(4, [e5, , , ,]);
`;

const notesWaitMidThenMore = (name) => `
setBPM(120);
await createTrack(0).steps(4, [c5, , , ,]);
broadcastWait('${name}');
await createTrack(0).steps(4, [e5, , , ,]);
`;

const plainNotes = `
setBPM(120);
await createTrack(0).steps(4, [c5, , , ,]);
`;

// --- helpers ---------------------------------------------------------------

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

async function setSongOnly(page, song) {
    await page.evaluate((song) => {
        document.querySelector('app-javascriptmusic').shadowRoot
            .querySelector('#editor .CodeMirror').CodeMirror.setValue(song);
    }, song);
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

// Set up a parallel BroadcastChannel listener in the page that captures
// every message — useful for asserting send timing or counting.
async function startBroadcastTap(page) {
    await page.evaluate(() => {
        window.__broadcastTap = [];
        window.__broadcastChannel = new BroadcastChannel('concert-sync');
        window.__broadcastChannel.onmessage = (e) => {
            window.__broadcastTap.push({ name: e.data && e.data.name, at: performance.now() });
        };
    });
}

async function getBroadcastTap(page) {
    return page.evaluate(() => window.__broadcastTap.slice());
}

// Start both tabs on the same shared app and have them both reach the
// "audio worklet is up and song is loaded" state. The synth is the same
// in both — but on the second tab the compile worker may say "no
// changes" (it's still a fresh worker per tab so it actually compiles
// once per page, but content-addressed cache lookups can short-circuit).
async function bootBothTabs(context, baseURL, receiverSong, senderSong) {
    const receiver = await context.newPage();
    const sender = await context.newPage();

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

    return { receiver, sender };
}

// --- specs -----------------------------------------------------------------

test.describe('broadcast send/wait across windows', () => {
    test('receiver waits at start, sender emits at end of song, receiver resumes', async ({ context, baseURL }) => {
        const { receiver, sender } = await bootBothTabs(
            context, baseURL,
            waitAtStartThenNotes('go'),
            notesThenSend('go'),
        );

        await clickInsideApp(receiver, '#startaudiobutton');
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(false);

        await receiver.waitForTimeout(500);
        expect(await isPlayChecked(receiver)).toBe(false);

        await clickInsideApp(sender, '#startaudiobutton');
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(true);
    });

    test('sender emits mid-song (not at end), receiver still resumes', async ({ context, baseURL }) => {
        // Sender plays 4 notes, sends 'go', plays 4 more notes. The send
        // fires in the middle so we verify the signal isn't tied to
        // sender's song completion.
        const { receiver, sender } = await bootBothTabs(
            context, baseURL,
            waitAtStartThenNotes('go'),
            notesSendMidThenMore('go'),
        );

        await clickInsideApp(receiver, '#startaudiobutton');
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(false);

        await clickInsideApp(sender, '#startaudiobutton');
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(true);
    });

    test('receiver waits mid-song (after some notes), sender emits at end', async ({ context, baseURL }) => {
        // Receiver plays 4 notes, then parks on wait. So the auto-pause
        // doesn't happen immediately; we have to wait for the notes to
        // play first (~500ms at 120 BPM) before the checkbox flips off.
        const { receiver, sender } = await bootBothTabs(
            context, baseURL,
            notesWaitMidThenMore('go'),
            notesThenSend('go'),
        );

        await clickInsideApp(receiver, '#startaudiobutton');
        // Should auto-uncheck *eventually* (after the first 4 notes play).
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(false);

        await clickInsideApp(sender, '#startaudiobutton');
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(true);
    });

    test('stale send (before wait engaged) is ignored, fresh send after wait resumes', async ({ context, baseURL }) => {
        // Sender song is just bare notes — no broadcast — so we drive the
        // broadcast manually from the test to control timing precisely.
        const { receiver, sender } = await bootBothTabs(
            context, baseURL,
            waitAtStartThenNotes('go'),
            plainNotes,
        );

        // Emit 'go' from a *third* page-level BroadcastChannel BEFORE
        // receiver has started — the receiver hasn't engaged its wait
        // yet, so this must be discarded.
        await startBroadcastTap(receiver);
        await sender.evaluate(() => {
            const ch = new BroadcastChannel('concert-sync');
            ch.postMessage({ name: 'go' });
            ch.close();
        });
        await receiver.waitForTimeout(200);

        // Now start receiver. It should park on wait — proving the stale
        // signal didn't auto-resume it.
        await clickInsideApp(receiver, '#startaudiobutton');
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(false);
        await receiver.waitForTimeout(500);
        expect(await isPlayChecked(receiver)).toBe(false);

        // Fresh signal *after* the wait engaged — receiver resumes.
        await sender.evaluate(() => {
            const ch = new BroadcastChannel('concert-sync');
            ch.postMessage({ name: 'go' });
            ch.close();
        });
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(true);
    });

    test('manual play (checkbox toggle) overrides a pending wait', async ({ context, baseURL }) => {
        const { receiver, sender } = await bootBothTabs(
            context, baseURL,
            waitAtStartThenNotes('go'),
            plainNotes,
        );

        await clickInsideApp(receiver, '#startaudiobutton');
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(false);

        // Toggle the play checkbox manually. Should bypass the wait.
        await receiver.evaluate(() => {
            const cb = document.querySelector('app-javascriptmusic').shadowRoot
                .getElementById('toggleSongPlayCheckbox');
            cb.checked = true;
            cb.dispatchEvent(new Event('click'));
        });
        // The checkbox is now checked — manual override active.
        await expect.poll(() => isPlayChecked(receiver), { timeout: 5000 }).toBe(true);

        // A *later* matching signal must NOT cause anything weird (the
        // wait has already been cleared by the manual override, the
        // sequencer is playing through the song).
        await sender.evaluate(() => {
            const ch = new BroadcastChannel('concert-sync');
            ch.postMessage({ name: 'go' });
            ch.close();
        });
        await receiver.waitForTimeout(500);
        expect(await isPlayChecked(receiver)).toBe(true);
    });

    test('alternating handoff: A→B→A→B over multiple rounds via cold-start cycle', async ({ context, baseURL }) => {
        // Two windows. Round 1: A plays + sends 'r1', B waits on 'r1'
        // then plays. Round 2: same names but roles swapped via hot-save.
        // This is the user's reported flow — moving broadcastSend to the
        // next and broadcastWait to the previous, switching in turns.
        const { receiver: tabB, sender: tabA } = await bootBothTabs(
            context, baseURL,
            waitAtStartThenNotes('r1'),
            notesThenSend('r1'),
        );

        // --- Round 1: A is sender, B is waiter ---
        await clickInsideApp(tabB, '#startaudiobutton');
        await expect.poll(() => isPlayChecked(tabB), { timeout: 60000 }).toBe(false);

        await clickInsideApp(tabA, '#startaudiobutton');
        await expect.poll(() => isPlayChecked(tabB), { timeout: 60000 }).toBe(true);

        // Wait for both songs to wind down to a steady state.
        await tabA.waitForTimeout(1500);
        await tabB.waitForTimeout(1500);

        // --- Round 2: hot-save with roles swapped ---
        // Tab A now becomes the waiter, Tab B the sender. New signal name
        // to avoid any chance of stale-signal interference. Save the
        // waiter first so the wait engages before the sender's signal
        // can fire (otherwise the signal arrives while waitingForSignal
        // is still null and is dropped).
        await setSongOnly(tabA, waitAtStartThenNotes('r2'));
        await setSongOnly(tabB, notesThenSend('r2'));

        await clickInsideApp(tabA, '#savesongbutton');
        await expect.poll(() => isPlayChecked(tabA), { timeout: 60000 }).toBe(false);

        await clickInsideApp(tabB, '#savesongbutton');
        await expect.poll(() => isPlayChecked(tabA), { timeout: 60000 }).toBe(true);
    });

    test('hot-save: replace a non-broadcast song with a wait song, then signal arrives', async ({ context, baseURL }) => {
        // Tab is playing a plain song. User saves with a wait song
        // mid-play. The save flow must result in a parked sequencer
        // (regardless of whether currentFrame had passed time 0).
        const { receiver, sender } = await bootBothTabs(
            context, baseURL,
            plainNotes,
            plainNotes,
        );

        await clickInsideApp(receiver, '#startaudiobutton');
        await clickInsideApp(sender, '#startaudiobutton');

        // Let the songs play through entirely so currentFrame is past
        // any events in the wait-song that's about to be saved in.
        await receiver.waitForTimeout(2000);

        // Now save a wait song into the receiver and a send song into
        // the sender.
        await setSongOnly(receiver, waitAtStartThenNotes('hot'));
        await clickInsideApp(receiver, '#savesongbutton');
        // We want the wait to engage despite currentFrame being past
        // time 0. Should auto-uncheck.
        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(false);

        await setSongOnly(sender, notesThenSend('hot'));
        await clickInsideApp(sender, '#savesongbutton');

        await expect.poll(() => isPlayChecked(receiver), { timeout: 60000 }).toBe(true);
    });
});
