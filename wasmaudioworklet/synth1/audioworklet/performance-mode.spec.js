import { waitForAppReady } from '../../app.js';
import { songsourceeditor, synthsourceeditor } from '../../editorcontroller.js';
import { getCurrentTime } from './midisynthaudioworklet.js';

// Performance mode through the REAL audio worklet: a song with two parts and
// a waitForSignal between them loops the first part until window.sendSignal,
// then leaves on the bar line into the second part. Without performance mode
// the same song plays straight through. The sequencer logic itself is unit
// tested in midisequencer/performance-mode.test.mjs; this pins the wiring —
// the compiler's events, the worklet messages, the window API and the DOM
// events the UI and the agent listen to.

const synthsource = `
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

// 120 BPM: part a is one bar (2 s), then the wait, then part b (one bar).
const songsource = `
setBPM(120);
definePartStart('a');
await createTrack(0).steps(1, [ c5, , e5, ]);
waitForSignal('go', { loop: 'part', quantize: 'bar' });
definePartStart('b');
await createTrack(0).steps(1, [ g5, , c6, ]);
`;

async function pollUntil(check, timeoutMs = 8000, intervalMs = 50) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (await check()) return;
        await new Promise(r => setTimeout(r, intervalMs));
    }
    throw new Error('timeout waiting for condition');
}

describe('performance mode', function () {
    this.timeout(60000);
    let appElement;

    this.beforeAll(async () => {
        document.documentElement.appendChild(document.createElement('app-javascriptmusic'));
        await waitForAppReady();
        appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
    });
    this.afterAll(async () => {
        window.togglePerformanceMode(false);
        window.stopaudio();
        window.audioworkletnode = undefined;
        document.documentElement.removeChild(document.querySelector('app-javascriptmusic'));
    });

    it('loops the part until a signal, then leaves on the bar line; off, the wait is inert', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue(synthsource);
        const events = [];
        const listener = (e) => events.push(e.detail);
        window.addEventListener('wasmmusic-signal', listener);

        // the checkbox is the UI; togglePerformanceMode is what it calls
        appElement.querySelector('#performanceModeCheckbox').checked = true;
        window.togglePerformanceMode(true);
        appElement.querySelector('#startaudiobutton').click();
        // the synth compiles first — generous, CI runs several spec files at once
        await pollUntil(async () => (await getCurrentTime()) > 500, 30000);

        // three seconds of playback never get past the wait at 2000 ms
        const seen = [];
        const t0 = Date.now();
        while (Date.now() - t0 < 3000) {
            seen.push(await getCurrentTime());
            await new Promise(r => setTimeout(r, 100));
        }
        assert.ok(Math.max(...seen) < 2100, `looping part a: playhead stayed under the wait, max ${Math.max(...seen)}`);
        assert.ok(events.some(d => d.waiting === 'go' && d.loop === 'part'), 'the UI was told about the wait');

        // the signal: leave on the next bar line into part b
        assert.equal(window.sendSignal('go'), true);
        await pollUntil(async () => (await getCurrentTime()) > 2000);
        assert.ok(events.some(d => d.resumed === 'go'), 'the UI was told about the resume');

        // off: the song plays straight through (restart from the top)
        window.togglePerformanceMode(false);
        window.toggleSongPlay(false);
        await new Promise(r => setTimeout(r, 200));
        window.stopaudio();
        window.audioworkletnode = undefined;
        appElement.querySelector('#startaudiobutton').click();
        await pollUntil(async () => (await getCurrentTime()) > 2500, 15000);
        window.removeEventListener('wasmmusic-signal', listener);
    });
});
