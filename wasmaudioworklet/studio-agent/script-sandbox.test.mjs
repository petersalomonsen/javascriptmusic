// run_script's sandbox: agent snippets run in QuickJS-wasm over the document
// text, with the helpers in scope, writes only through the opt-in host
// function, and the deadline actually interrupting a runaway script.
// Needs the quickjs-wasm devDependency. Run with: npm run test-quickjs-sandbox

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runAgentScript, formatScriptResult } from './script-sandbox.js';

const TAKE = `[[ 0.60, f7(0.56, 79) ],
[ 0.07, f5(1.58, 69) ],
[ 0.08, d5(1.57, 63) ],
[ 0.07, a5(1.60, 78) ],
[ 1.49, c7(0.50, 98) ]]`;
const SONG = `setBPM(125);\nconst pad = createTrack(2);\nstartRecording();\ncreateTrack(4).play(${TAKE});\nstopRecording();\nloopHere();\n`;

test('prints, returns a value, and sees the documents and helpers', async () => {
    const r = await runAgentScript(`
        const blocks = findPlayBlocks(song);
        print('blocks', blocks.length, 'notes', blocks[0].notes.length, 'bpm', bpm);
        console.log(noteName(noteNumber('as4') + 12));
        return { synth: synth.length, shader, events };
    `, { song: SONG, synth: 'export {}', shader: '', events: null, bpm: 125 });
    assert.equal(r.error, null);
    assert.deepEqual(r.output, ['blocks 1 notes 5 bpm 125', 'as5']);
    assert.equal(r.value, '{"synth":9,"shader":"","events":null}');
    assert.deepEqual(r.writes, []);
});

test('a chord/melody split written back through setSong reaches the host write callback', async () => {
    const written = [];
    const r = await runAgentScript(`
        const take = findPlayBlocks(song)[0];
        const groups = groupByBeat(take.notes);
        const chords = groups.filter(g => g.length > 1).flat()
            .map(n => ({ ...n, note: n.note + 12, beat: quantizeBeat(n.beat, 2) }));
        const melody = groups.filter(g => g.length === 1).flat()
            .map(n => ({ ...n, beat: quantizeBeat(n.beat, 4) }));
        const replacement = 'pad.play([' + formatNotes(chords, { chords: true }) + ']);\\n'
            + 'createTrack(4).play([' + formatNotes(melody) + '])';
        const message = await setSong(song.slice(0, take.start) + replacement + song.slice(take.end));
        print(message);
        return { chords: chords.length, melody: melody.length };
    `, { song: SONG }, {
        write: async (name, text) => { written.push({ name, text }); return { message: `${name} updated`, warnings: ['WARNING: x'] }; },
    });
    assert.equal(r.error, null, r.error && r.error.message);
    assert.equal(written.length, 1);
    assert.equal(written[0].name, 'song');
    // chord members keep their played order (f5 and a5 at 0.07 before d5 at 0.08)
    assert.match(written[0].text, /pad\.play\(\[\[ 0\.00, f6\(1\.58, 69\), a6\(1\.60, 78\), d6\(1\.57, 63\) \]\]\);/);
    assert.match(written[0].text, /createTrack\(4\)\.play\(\[\[ 0\.50, f7\(0\.56, 79\) \],\n\[ 1\.50, c7\(0\.50, 98\) \]\]\)/);
    assert.match(written[0].text, /^setBPM\(125\);/); // everything around the take survived
    assert.match(written[0].text, /stopRecording\(\);\nloopHere\(\);\n$/);
    assert.deepEqual(r.output, ['song updated']);
    assert.equal(r.value, '{"chords":3,"melody":2}');
    assert.deepEqual(r.writes, [{ message: 'song updated', warnings: ['WARNING: x'] }]);
    const text = formatScriptResult(r);
    assert.match(text, /song updated\nWARNING: x/);
});

test('several writes in one run all land, each re-arming the deadline', async () => {
    const written = [];
    const r = await runAgentScript(`
        await setSong('a'); await setSynth('b'); await setShader('c');
        return 'done';
    `, {}, { write: async (name, text) => { written.push(name + text); return { message: name }; } });
    assert.equal(r.error, null);
    assert.deepEqual(written, ['songa', 'synthb', 'shaderc']);
    assert.equal(r.value, 'done');
});

test('without a write callback the writers throw and nothing is written', async () => {
    const r = await runAgentScript(`await setSong('x');`, { song: 'y' });
    assert.match(r.error.message, /writes are not enabled/);
});

test('a write error surfaces as the script error, an unknown document is refused', async () => {
    const r = await runAgentScript(`
        try { await setSong(42); } catch (e) { print('caught: ' + e.message); }
        // (awaited directly: in quickjs-wasm 0.0.5 a .then chain on the RAW host
        // promise followed by another host call leaves the guest unsettled —
        // the setSong/setSynth/setShader wrappers are not affected, see below)
        const raw = await env.callHostAsync({ function_name: 'setDocument', name: 'faust', text: 'x' });
        print(JSON.parse(raw).error);
        await setSong('boom');
    `, {}, { write: async () => { throw new Error('editor gone'); } });
    assert.deepEqual(r.output, ['caught: setsong: expected a string, got number', 'unknown document "faust" (one of song, synth, shader)']);
    assert.match(r.error.message, /editor gone/);
});

test('promise chains on the writers followed by more writes all settle', async () => {
    const written = [];
    const r = await runAgentScript(`
        await setSong('a').then((m) => print('then ' + m));
        setSong('b').catch(() => {});
        await setSong('c');
        return 'done';
    `, {}, { write: async (name, text) => { written.push(text); return { message: text }; } });
    assert.equal(r.error, null, r.error && r.error.message);
    assert.deepEqual(written, ['a', 'b', 'c']);
    assert.deepEqual(r.output, ['then a']);
});

test('a script error reports the message and the printed output so far', async () => {
    const r = await runAgentScript(`print('before'); nope.x = 1;`);
    assert.deepEqual(r.output, ['before']);
    assert.match(r.error.message, /nope/);
    assert.match(formatScriptResult(r), /^before\nERROR: .*nope/);
});

test('the guest has no host globals', async () => {
    const r = await runAgentScript(`return [typeof fetch, typeof document, typeof localStorage, typeof globalThis.process];`);
    assert.equal(r.value, '["undefined","undefined","undefined","undefined"]');
});

test('an endless loop is interrupted instead of hanging', async () => {
    const r = await runAgentScript(`print('started'); while (true) {}`, {}, { timeoutMs: 1000 });
    assert.match(r.error.message, /did not finish within 1s/);
    assert.deepEqual(r.output, ['started']);
});

test('an endless loop AFTER a write is interrupted too, and the write stays applied', async () => {
    const written = [];
    const r = await runAgentScript(`await setSong('kept'); while (true) {}`, {}, { timeoutMs: 1000, write: async (name, text) => { written.push(text); return { message: 'ok' }; } });
    assert.match(r.error.message, /did not finish/);
    assert.deepEqual(written, ['kept']);
    assert.deepEqual(r.writes, [{ message: 'ok' }]);
});

test('formatScriptResult caps the output and says so', async () => {
    const r = await runAgentScript(`for (let i = 0; i < 2000; i++) print('line ' + i);`);
    const text = formatScriptResult(r);
    assert.ok(text.length < 6200, `too long: ${text.length}`);
    assert.match(text, /chars truncated — print less/);
    assert.equal(formatScriptResult({ output: [], writes: [], value: undefined, error: null }), '(script produced no output — print() what you want to see)');
});
