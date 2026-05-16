import { waitForAppReady } from '../../app.js';
import { songsourceeditor, synthsourceeditor } from '../../editorcontroller.js';

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
    let stream; // ordered stream of { type: 'noteon'|'swap', ct, ... }
    let listenersAttached = false;

    function ensureListeners() {
        if (listenersAttached) return;
        listenersAttached = true;
        // Forwarded by midisynthaudioworklet.js — these CustomEvents are
        // the stable subscription point that survives the per-save
        // AudioWorkletNode swap (the underlying port changes each save).
        window.addEventListener('worklet:noteon', (e) => {
            stream.push({ type: 'noteon', ...e.detail });
        });
        window.addEventListener('worklet:swap', (e) => {
            stream.push({ type: 'swap', ...e.detail });
        });
    }

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

    function ctx() { return window.audioworkletnode.context; }

    async function waitForCtxTime(targetCt) {
        while (ctx().currentTime < targetCt) {
            await new Promise(r => setTimeout(r, 20));
        }
    }

    async function waitForStreamPredicate(predicate, timeoutMs) {
        const start = performance.now();
        while (performance.now() - start < timeoutMs) {
            if (predicate(stream)) return true;
            await new Promise(r => setTimeout(r, 20));
        }
        return false;
    }

    it('hands off song+synth to a new AudioWorkletNode at the next beat divisible by N', async () => {
        songsourceeditor.doc.setValue(songFor(100, 'c6', 16));
        synthsourceeditor.doc.setValue(synthsource);

        appElement.querySelector('#startaudiobutton').click();
        while (!window.audioworkletnode) {
            await new Promise(r => setTimeout(r, 50));
        }
        stream = [];
        ensureListeners();

        const audioStartCt = ctx().currentTime;

        // Phase 1: c6 plays each beat at 100 BPM. Wait until past beat 2
        // of the playing song (in audio-context-time).
        await waitForCtxTime(audioStartCt + 1.3);
        const earlyC6 = stream.filter(e => e.type === 'noteon' && e.note === NOTE.c6).length;
        assert.isAtLeast(earlyC6, 2, `should have heard ≥2 c6 noteons by 1.3s after audio start, got ${earlyC6}`);
        assert.lengthOf(stream.filter(e => e.type === 'swap'), 0, 'no swap before first save');

        // Save 1: change to 150 BPM e6, N=8 → swap should land at the
        // next beat divisible by 8 in the *currently playing* bpm (100).
        // That's beat 8, at audioStartCt + 4.8s of audio-context-time.
        appElement.querySelector('#saveQuantizeSelect').value = '8';
        songsourceeditor.doc.setValue(songFor(150, 'e6', 32));
        synthsourceeditor.doc.setValue(synthsource + '\n// save 1\n');
        const ctAtSave1 = ctx().currentTime;
        const expectedSwap1Ct = audioStartCt + 4.8;
        console.log(`[test] save 1 at ctx.currentTime=${ctAtSave1.toFixed(3)}s, expecting swap at ~${expectedSwap1Ct.toFixed(3)}s`);
        appElement.querySelector('#savesongbutton').click();

        // Wait for the swap event.
        const swapArrived = await waitForStreamPredicate(
            s => s.find(e => e.type === 'swap'),
            9000,
        );
        assert.isTrue(swapArrived, 'first swap event should arrive within 9s of save');
        const swap1 = stream.find(e => e.type === 'swap');
        const swap1Index = stream.indexOf(swap1);

        // swap.ct is currentTime in the worklet's reference frame, which
        // is ctx.currentTime in seconds * 1000. The test's audioStartCt
        // is captured after the worklet is exposed to window, which lags
        // the main-thread audioStartCtxTime capture by 50–100 ms of
        // startup work, so the tolerance has to swallow that.
        assert.closeTo(swap1.ct, expectedSwap1Ct * 1000, 200,
            `first swap should fire near ctx.currentTime=${expectedSwap1Ct.toFixed(3)}s, fired at ${(swap1.ct / 1000).toFixed(3)}s`);

        // No e6 noteon before the swap; no c6 noteon after.
        const e6BeforeSwap = stream.slice(0, swap1Index).filter(e =>
            e.type === 'noteon' && e.note === NOTE.e6);
        assert.lengthOf(e6BeforeSwap, 0,
            `no e6 noteon should appear before the first swap, got ${e6BeforeSwap.length}`);
        const c6AfterSwap = stream.slice(swap1Index).filter(e =>
            e.type === 'noteon' && e.note === NOTE.c6);
        assert.lengthOf(c6AfterSwap, 0,
            `no c6 noteon should appear after the first swap, got ${c6AfterSwap.length}`);

        // Wait for ≥5 e6 noteons. The new processor's sequencer starts at
        // currentFrame=0 and only advances after swapAtCtxTime, so its
        // noteon ct values restart from ~0 and go up at 150 BPM (400 ms).
        const got5e6 = await waitForStreamPredicate(
            s => s.slice(swap1Index).filter(e => e.type === 'noteon' && e.note === NOTE.e6).length >= 5,
            5000,
        );
        assert.isTrue(got5e6, 'expected ≥5 e6 noteons within 5s of swap');
        const e6Notes = stream.slice(swap1Index).filter(e => e.type === 'noteon' && e.note === NOTE.e6);
        console.log(`[test] e6 noteons post-swap (post-reset ct): ${e6Notes.map(e => e.ct.toFixed(0)).join(', ')}`);

        for (let i = 1; i < e6Notes.length; i++) {
            const interval = e6Notes[i].ct - e6Notes[i - 1].ct;
            assert.closeTo(interval, 400, 50,
                `e6 noteon interval ${i}: expected ~400 ms at 150 BPM, got ${interval.toFixed(0)} ms`);
        }
        // First e6 should fire essentially at the new sequencer's frame 0.
        assert.isAtMost(e6Notes[0].ct, 50,
            `first e6 should fire at post-reset ct ≈ 0, fired at ct=${e6Notes[0].ct.toFixed(0)}`);

        // Save 2: switch to 120 BPM g6. The currently-playing bpm is 150.
        // Compute the next 8-aligned beat in audio-context-time.
        const ctAtSave2 = ctx().currentTime;
        const elapsedBeats150 = (ctAtSave2 - swap1.ct / 1000) * 150 / 60;
        const nextEightBeat = Math.ceil((elapsedBeats150 + 0.001) / 8) * 8;
        const expectedSwap2Ct = swap1.ct / 1000 + nextEightBeat * 60 / 150;
        console.log(`[test] save 2 at ctx.currentTime=${ctAtSave2.toFixed(3)}s, beats-since-swap1=${elapsedBeats150.toFixed(2)}, expecting swap at ~${expectedSwap2Ct.toFixed(3)}s`);

        songsourceeditor.doc.setValue(songFor(120, 'g6', 32));
        synthsourceeditor.doc.setValue(synthsource + '\n// save 2\n');
        appElement.querySelector('#savesongbutton').click();

        const swap2Arrived = await waitForStreamPredicate(
            s => s.filter(e => e.type === 'swap').length >= 2,
            9000,
        );
        assert.isTrue(swap2Arrived, 'second swap event should arrive within 9s of save 2');
        const swaps = stream.filter(e => e.type === 'swap');
        const swap2 = swaps[1];
        const swap2Index = stream.indexOf(swap2);
        assert.closeTo(swap2.ct, expectedSwap2Ct * 1000, 80,
            `second swap should fire near ${expectedSwap2Ct.toFixed(3)}s, fired at ${(swap2.ct / 1000).toFixed(3)}s`);

        const g6BeforeSwap2 = stream.slice(0, swap2Index).filter(e =>
            e.type === 'noteon' && e.note === NOTE.g6);
        assert.lengthOf(g6BeforeSwap2, 0, `no g6 before swap 2, got ${g6BeforeSwap2.length}`);
        const e6AfterSwap2 = stream.slice(swap2Index).filter(e =>
            e.type === 'noteon' && e.note === NOTE.e6);
        assert.lengthOf(e6AfterSwap2, 0, `no e6 after swap 2, got ${e6AfterSwap2.length}`);

        const got4g6 = await waitForStreamPredicate(
            s => s.slice(swap2Index).filter(e => e.type === 'noteon' && e.note === NOTE.g6).length >= 4,
            5000,
        );
        assert.isTrue(got4g6, 'expected ≥4 g6 noteons within 5s of swap 2');
        const g6Notes = stream.slice(swap2Index).filter(e => e.type === 'noteon' && e.note === NOTE.g6);
        console.log(`[test] g6 noteons post-swap (post-reset ct): ${g6Notes.map(e => e.ct.toFixed(0)).join(', ')}`);
        for (let i = 1; i < g6Notes.length; i++) {
            const interval = g6Notes[i].ct - g6Notes[i - 1].ct;
            assert.closeTo(interval, 500, 50,
                `g6 noteon interval ${i}: expected ~500 ms at 120 BPM, got ${interval.toFixed(0)} ms`);
        }
        assert.isAtMost(g6Notes[0].ct, 50,
            `first g6 should fire at post-reset ct ≈ 0, fired at ct=${g6Notes[0].ct.toFixed(0)}`);

        // Beat indicator should reflect the currently-playing tempo (120).
        await new Promise(r => setTimeout(r, 500));
        const timespanText = appElement.querySelector('#timespan').innerText;
        const beatMatch = timespanText.match(/\(([\d.]+)\)/);
        assert.isNotNull(beatMatch, `expected beat counter in timespan, got "${timespanText}"`);
        const displayedBeat = parseFloat(beatMatch[1]);
        // The displayed beat is computed from the new node's sequencer
        // currentTime * activePlayingBpm / 60000. After ~500ms past swap2
        // at 120 BPM, that's ~1 beat — but we mostly just want to confirm
        // it's small (post-reset) and uses the new bpm, not the original 100.
        assert.isAtMost(displayedBeat, 6,
            `beat indicator should be small post-reset (within first few beats of new song), got ${displayedBeat}`);
    });
});
