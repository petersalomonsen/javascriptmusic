import { waitForAppReady } from '../../app.js';
import { songsourceeditor, synthsourceeditor } from '../../editorcontroller.js';
import { getCurrentTime } from './midisynthaudioworklet.js';

const synthsource = `
import { midichannels, MidiChannel, MidiVoice , SineOscillator, Envelope, notefreq } from './globalimports';

class SimpleSine extends MidiVoice {
    osc: SineOscillator = new SineOscillator();
    env: Envelope = new Envelope(0.0, 0.0, 1.0, 0.1);

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
        this.channel.signal.add(signal, signal);
    }
}
export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(1, (ch) => new SimpleSine(ch));
}
export function postprocess(): void {
}
`;

function songFor(bpm, note, beats) {
    const stepGroup = `${note},,,,`;
    return `
setBPM(${bpm});
await createTrack(0).steps(4, [
${new Array(beats).fill(stepGroup).join('\n')}
]);
loopHere();
`;
}

// Note names follow this app's notemap convention: ndx 60 = "c5", ndx 72 = "c6".
const NOTE = { c6: 72, e6: 76, g6: 79 };

describe('quantized save', function () {
    this.timeout(60000);

    let appElement;
    let stream; // ordered stream of { type: 'noteon'|'swap', ... }

    this.beforeAll(async () => {
        document.documentElement.appendChild(document.createElement('app-javascriptmusic'));
        await waitForAppReady();
        appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
    });

    this.afterAll(async () => {
        if (window.audioworkletnode) window.stopaudio();
        window.audioworkletnode = undefined;
        document.documentElement.removeChild(document.querySelector('app-javascriptmusic'));
    });

    async function waitUntilWorkletTime(ms) {
        let t = await getCurrentTime();
        while (t < ms) {
            await new Promise(r => setTimeout(r, 20));
            t = await getCurrentTime();
        }
        return t;
    }

    async function waitForStreamLength(n, timeoutMs = 30000) {
        const start = performance.now();
        while (stream.length < n) {
            if (performance.now() - start > timeoutMs) return false;
            await new Promise(r => setTimeout(r, 20));
        }
        return true;
    }

    it('defers song+synth swap to the next beat divisible by N', async () => {
        songsourceeditor.doc.setValue(songFor(100, 'c6', 16));
        synthsourceeditor.doc.setValue(synthsource);

        appElement.querySelector('#startaudiobutton').click();
        while (!window.audioworkletnode) {
            await new Promise(r => setTimeout(r, 50));
        }

        stream = [];
        window.audioworkletnode.port.addEventListener('message', (e) => {
            if (!e.data) return;
            if (e.data.quantizedSwapApplied) {
                stream.push({ type: 'swap', beat: e.data.beat, ct: e.data.ct, bpm: e.data.bpm });
            }
            if (e.data._trace_noteon) {
                stream.push({ type: 'noteon', ...e.data._trace_noteon });
            }
        });

        // Phase 1: c6 plays each beat at 100 BPM. Wait until past beat 2.
        await waitUntilWorkletTime(1300);
        const earlyC6 = stream.filter(e => e.type === 'noteon' && e.note === NOTE.c6).length;
        assert.isAtLeast(earlyC6, 2, `should have heard ≥2 c6 noteons by ct=1300, got ${earlyC6}`);
        assert.lengthOf(stream.filter(e => e.type === 'swap'), 0, 'no swap before first save');

        // Save 1: change to 150 BPM e6, N=8 → swap at next 8-aligned beat.
        // Beat 8 in playingBpm=100 lands at currentTime 4800 ms.
        appElement.querySelector('#saveQuantizeSelect').value = '8';
        songsourceeditor.doc.setValue(songFor(150, 'e6', 32));
        synthsourceeditor.doc.setValue(synthsource + '\n// save 1\n');
        const ctBeforeSave1 = await getCurrentTime();
        console.log(`[test] save 1 clicked at ct=${ctBeforeSave1.toFixed(0)} ms`);
        appElement.querySelector('#savesongbutton').click();

        // Wait long enough for the swap to fire (beat 8 at 100 BPM = 4800 ms
        // plus headroom for the trace to arrive).
        const swapTimeoutMs = 9000;
        const beforeWall = performance.now();
        while (
            performance.now() - beforeWall < swapTimeoutMs &&
            stream.findIndex(e => e.type === 'swap') === -1
        ) {
            await new Promise(r => setTimeout(r, 20));
        }
        const swap1 = stream.find(e => e.type === 'swap');
        assert.isDefined(swap1, 'first swap event should fire within 9s of save');

        // Swap must land at beat 8 (currentTime ~4800 ms in old playingBpm=100).
        assert.strictEqual(swap1.beat, 8, `first swap should fire on beat 8, fired on beat ${swap1.beat}`);
        assert.closeTo(swap1.ct, 4800, 50,
            `first swap should fire near ct=4800 ms (beat 8 @ 100 BPM), fired at ct=${swap1.ct.toFixed(0)}`);

        // No e6 noteon BEFORE the swap event in the stream.
        const swap1Index = stream.indexOf(swap1);
        const e6BeforeSwap = stream.slice(0, swap1Index).filter(e =>
            e.type === 'noteon' && e.note === NOTE.e6);
        assert.lengthOf(e6BeforeSwap, 0,
            `no e6 noteon should appear before the first swap, got ${e6BeforeSwap.length}`);

        // No c6 noteon AFTER the swap event.
        const c6AfterSwap = stream.slice(swap1Index).filter(e =>
            e.type === 'noteon' && e.note === NOTE.c6);
        assert.lengthOf(c6AfterSwap, 0,
            `no c6 noteon should appear after the first swap, got ${c6AfterSwap.length}`);

        // Phase 2: collect a handful of e6 noteons. They reset the trace ct
        // to ≈ 0 (the swap resets the sequencer's currentFrame), then
        // proceed at intervals of 400 ms (one beat at 150 BPM).
        // Wait for at least 5 e6 noteons to land.
        let e6Notes;
        for (let attempts = 0; attempts < 250; attempts++) {
            e6Notes = stream.slice(swap1Index).filter(e =>
                e.type === 'noteon' && e.note === NOTE.e6);
            if (e6Notes.length >= 5) break;
            await new Promise(r => setTimeout(r, 20));
        }
        console.log(`[test] e6 noteons post-swap (post-reset ct): ${e6Notes.map(e => e.ct.toFixed(0)).join(', ')}`);
        assert.isAtLeast(e6Notes.length, 5, `expected ≥5 e6 noteons after first swap, got ${e6Notes.length}`);
        // Intervals between consecutive e6 noteons must be ≈ 400 ms.
        for (let i = 1; i < e6Notes.length; i++) {
            const interval = e6Notes[i].ct - e6Notes[i - 1].ct;
            assert.closeTo(interval, 400, 50,
                `e6 noteon interval ${i}: expected ~400 ms at 150 BPM, got ${interval.toFixed(0)} ms`);
        }
        // The first e6 should be at ct ≈ 0 (just after the reset).
        assert.isAtMost(e6Notes[0].ct, 50,
            `first e6 should fire essentially at the swap moment (post-reset ct ≈ 0), fired at ct=${e6Notes[0].ct.toFixed(0)}`);

        // Save 2: switch to 120 BPM g6. Playback is now at 150 BPM in the
        // post-first-swap frame, so beat math uses playingBpm=150.
        // Wait until we're past a few beats of the new song.
        await waitUntilWorkletTime(2500);
        const ctBeforeSave2 = await getCurrentTime();
        const beatAtSecondSave = ctBeforeSave2 * 150 / 60000;
        const nextEightBeat = Math.ceil((beatAtSecondSave + 0.001) / 8) * 8;
        const expectedSwap2Ct = nextEightBeat * 60000 / 150;
        console.log(`[test] save 2 at ct=${ctBeforeSave2.toFixed(0)}, beat=${beatAtSecondSave.toFixed(2)}, expecting swap at ct=${expectedSwap2Ct.toFixed(0)}`);

        songsourceeditor.doc.setValue(songFor(120, 'g6', 32));
        synthsourceeditor.doc.setValue(synthsource + '\n// save 2\n');
        appElement.querySelector('#savesongbutton').click();

        // Wait for the second swap event.
        const beforeWall2 = performance.now();
        while (
            performance.now() - beforeWall2 < swapTimeoutMs &&
            stream.filter(e => e.type === 'swap').length < 2
        ) {
            await new Promise(r => setTimeout(r, 20));
        }
        const swaps = stream.filter(e => e.type === 'swap');
        assert.lengthOf(swaps, 2, `expected 2 swap events, got ${swaps.length}`);
        const swap2 = swaps[1];
        const swap2Index = stream.indexOf(swap2);

        assert.strictEqual(swap2.beat, nextEightBeat,
            `second swap should fire on beat ${nextEightBeat}, fired on beat ${swap2.beat}`);
        assert.closeTo(swap2.ct, expectedSwap2Ct, 50,
            `second swap should fire near ct=${expectedSwap2Ct.toFixed(0)}, fired at ct=${swap2.ct.toFixed(0)}`);

        // No g6 noteon before, no e6 noteon after swap 2.
        const g6BeforeSwap2 = stream.slice(0, swap2Index).filter(e =>
            e.type === 'noteon' && e.note === NOTE.g6);
        assert.lengthOf(g6BeforeSwap2, 0, `no g6 before swap 2, got ${g6BeforeSwap2.length}`);
        const e6AfterSwap2 = stream.slice(swap2Index).filter(e =>
            e.type === 'noteon' && e.note === NOTE.e6);
        assert.lengthOf(e6AfterSwap2, 0, `no e6 after swap 2, got ${e6AfterSwap2.length}`);

        // Wait for a few g6 noteons, then check the new tempo intervals (120 BPM = 500 ms).
        let g6Notes;
        for (let attempts = 0; attempts < 250; attempts++) {
            g6Notes = stream.slice(swap2Index).filter(e =>
                e.type === 'noteon' && e.note === NOTE.g6);
            if (g6Notes.length >= 4) break;
            await new Promise(r => setTimeout(r, 20));
        }
        console.log(`[test] g6 noteons post-swap (post-reset ct): ${g6Notes.map(e => e.ct.toFixed(0)).join(', ')}`);
        assert.isAtLeast(g6Notes.length, 4, `expected ≥4 g6 noteons after second swap, got ${g6Notes.length}`);
        for (let i = 1; i < g6Notes.length; i++) {
            const interval = g6Notes[i].ct - g6Notes[i - 1].ct;
            assert.closeTo(interval, 500, 50,
                `g6 noteon interval ${i}: expected ~500 ms at 120 BPM, got ${interval.toFixed(0)} ms`);
        }
        assert.isAtMost(g6Notes[0].ct, 50,
            `first g6 should fire essentially at swap (post-reset ct ≈ 0), fired at ct=${g6Notes[0].ct.toFixed(0)}`);

        // Beat indicator should follow the currently-playing tempo across
        // swaps. After both swaps the indicator's bpm reference must read
        // 120 (the current playing bpm), so displayedBeat == ct * 120/60000.
        // The bug it guards against: attachSeek captures bpm in a closure
        // at startup, so without dynamic-bpm support the indicator would
        // still read at 100 BPM (the first song's tempo).
        await new Promise(r => setTimeout(r, 500));
        const ctAtCheck = await getCurrentTime();
        const timespanText = appElement.querySelector('#timespan').innerText;
        const beatMatch = timespanText.match(/\(([\d.]+)\)/);
        assert.isNotNull(beatMatch, `expected beat counter in timespan, got "${timespanText}"`);
        const displayedBeat = parseFloat(beatMatch[1]);
        const expectedBeat120 = ctAtCheck * 120 / 60000;
        assert.closeTo(displayedBeat, expectedBeat120, 0.5,
            `beat indicator should reflect 120 BPM (got ${displayedBeat}, expected ~${expectedBeat120.toFixed(2)} at ct=${ctAtCheck.toFixed(0)})`);
    });
});
