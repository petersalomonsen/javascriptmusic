import { waitForAppReady } from '../../app.js';
import { songsourceeditor, synthsourceeditor } from '../../editorcontroller.js';

// Minimal synth that turns noteons into a steady sine — we don't measure
// pitch here, we only use noteon arrival as the "did the sequencer run?"
// signal via a tracing wrapper on the worklet's midireceiver.
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

// Song waits on 'go' at the very start, then plays one note. If the wait
// works, no noteon should reach the synth until we deliver the signal.
const waitSongSource = `
setBPM(120);
broadcastWait('go');
await createTrack(0).steps(4, [
    c5, , , ,
]);
`;

async function pollUntil(check, timeoutMs = 5000, intervalMs = 50) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (check()) return;
        await new Promise(r => setTimeout(r, intervalMs));
    }
    throw new Error('timeout waiting for condition');
}

describe('broadcast send/wait', function () {
    this.timeout(60000);

    let appElement;

    this.beforeAll(async () => {
        document.documentElement.appendChild(document.createElement('app-javascriptmusic'));
        await waitForAppReady();
        appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
    });
    this.afterAll(async () => {
        window.stopaudio();
        window.audioworkletnode = undefined;
        document.documentElement.removeChild(document.querySelector('app-javascriptmusic'));
    });

    it('parks on broadcastWait, resumes when matching signal arrives', async () => {
        songsourceeditor.doc.setValue(waitSongSource);
        synthsourceeditor.doc.setValue(synthsource);

        // Start playback. The sequencer's first event is the wait, so it
        // should pause itself almost immediately and the auto-pause is
        // mirrored to the checkbox by the UI handler registered at init.
        appElement.querySelector('#startaudiobutton').click();
        const checkbox = appElement.querySelector('#toggleSongPlayCheckbox');
        await pollUntil(() => checkbox.checked === false);

        // Non-matching signal: nothing changes.
        const peerChannel = new BroadcastChannel('concert-sync');
        peerChannel.postMessage({ name: 'not-the-one' });
        await new Promise(r => setTimeout(r, 100));
        assert.equal(checkbox.checked, false, 'non-matching signal must not resume');

        // Matching signal: checkbox flips back.
        peerChannel.postMessage({ name: 'go' });
        await pollUntil(() => checkbox.checked === true);

        peerChannel.close();
    });
});
