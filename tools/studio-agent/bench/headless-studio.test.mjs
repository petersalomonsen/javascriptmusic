// The headless studio must behave like the browser registry for what the
// agents rely on: a .dsp becomes a voice class, the synth compiles with it, a
// probe hears it, and the song tools report the way client.js does. This is
// the deterministic half of the bench — no model, no browser.
//
// Run with: npm test   (in tools/studio-agent; needs the app's node_modules for asc)

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { createHeadlessStudio, emptySynth } from './headless-studio.mjs';
import { REPO } from '../../instrumenttest/headless.mjs';

const EPIANO = fs.readFileSync(path.join(REPO, 'examples/dx7/dsp/epiano.dsp'), 'utf8');
const SONG = `setBPM(120);
addInstrument('epiano');
await createTrack(0, 4).steps(4, [ c4, , e4, , g4, , c5, null ]);
loopHere();
`;
const SYNTH = `import { midichannels, MidiChannel } from './globalimports';
import { Epiano } from '../faust/epiano';

export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(8, (channel: MidiChannel) => new Epiano(channel));
}
export function postprocess(): void {}
`;

test('write_faust → set_synth → compile → probe: an instrument is heard end to end', { timeout: 180000 }, async () => {
    const s = createHeadlessStudio({ project: { song: SONG } });
    assert.equal(s.state.synth, emptySynth());

    const w = await s.call('write_faust', { path: 'epiano', source: EPIANO });
    assert.equal(w.ok, true, w.result);
    assert.match(w.result, /transpiled OK → faust\/epiano\.ts exports: Epiano/);
    assert.deepEqual((await s.call('list_faust')).result, 'epiano.dsp');
    assert.equal((await s.call('read_faust', { path: 'epiano' })).result, EPIANO);

    assert.equal((await s.call('set_synth', { source: SYNTH })).result, 'synth updated');
    const c = await s.call('compile');
    assert.equal(c.ok, true, c.result);
    assert.match(c.result, /^compiled OK/);
    assert.ok(!/NO SOUND/.test(c.result), c.result);
    assert.ok(s.state.wasm && s.state.wasm.length > 1000);

    const p = await s.call('probe_instrument', { channel: 0, notes: 'c3,c4' });
    assert.equal(p.ok, true, p.result);
    assert.match(p.result, /^ch0 c3: peak 0\.\d+, rms/);
    assert.ok(!/SILENT/.test(p.result));

    const d = await s.call('song_summary');
    assert.equal(d.ok, true, d.result);
    // 8 slots at 4 steps per beat is TWO BEATS, and the digest says so the way the app does
    assert.match(d.result, /song: 2 beats \(0\.5 bars — NOT a whole number of bars\)/);
    assert.match(d.result, /ch0: 4 notes/);

    // a probe before any compile is an error, not a silent pass
    const fresh = createHeadlessStudio({ project: { song: SONG } });
    assert.equal((await fresh.call('probe_instrument', { channel: 0 })).ok, false);
});

test('a broken .dsp fails write_faust with the compiler\'s message and leaves the instrument unchanged', { timeout: 60000 }, async () => {
    const s = createHeadlessStudio({ project: { faust: { bass: 'import("stdfaust.lib");\nfreq = hslider("freq", 440, 20, 20000, 0.01); gate = button("gate"); gain = hslider("gain", 0.5, 0, 1, 0.01);\nprocess = os.sawtooth(freq) * gain * en.adsr(0.01, 0.1, 0.7, 0.2, gate);\n' } } });
    assert.ok(s.state.faust.get('bass').ts.includes('export class Bass'));
    const bad = await s.call('write_faust', { path: 'bass', source: 'process = nonsense(;' });
    assert.equal(bad.ok, false);
    assert.match(bad.result, /^Faust transpile failed for bass\.dsp/);
    assert.ok(s.state.faust.get('bass').ts.includes('export class Bass'), 'the previous transpile survives a failed write');
    // edit_faust applies to the CURRENT source and re-transpiles
    const e = await s.call('edit_faust', { path: 'bass', old_string: 'os.sawtooth(freq)', new_string: 'os.square(freq)' });
    assert.equal(e.ok, true, e.result);
    assert.match(e.result, /bass\.dsp edited \(1 replacement\(s\)\) and re-transpiled/);
    assert.ok(s.state.faust.get('bass').dsp.includes('os.square'));
});

test('song, synth and shader tools answer like the browser; the script sandbox works', { timeout: 60000 }, async () => {
    const s = createHeadlessStudio({ project: { song: SONG } });
    assert.equal((await s.call('get_song')).result, SONG);
    const e = await s.call('edit_song', { old_string: 'setBPM(120)', new_string: 'setBPM(125)' });
    assert.match(e.result, /^song edited \(1 replacement\(s\)\)/);
    assert.ok(s.state.song.startsWith('setBPM(125)'));
    // a step array ending on a rest is warned about, as in the app
    const w = await s.call('set_song', { source: 'setBPM(120);\naddInstrument("x");\nawait createTrack(0).steps(4, [ c4, , , ]);\nloopHere();\n' });
    assert.match(w.result, /^song updated/);
    assert.ok(/slot|comma|short/i.test(w.result), w.result);
    assert.match((await s.call('grep_song', { pattern: 'setBPM' })).result, /1: setBPM/);
    assert.equal((await s.call('get_shader')).result, '(no shader — the shader editor is empty)');
    assert.equal((await s.call('set_shader', { source: 'void main(){}' })).result, 'shader updated');
    assert.equal((await s.call('stop')).result, 'stopped');
    assert.equal((await s.call('read_committed', { path: 'song.js' })).ok, false);
    assert.equal((await s.call('no_such_tool')).ok, false);

    const r = await s.call('run_script', { code: 'print(bpm); return findPlayBlocks(song).length;' });
    assert.equal(r.ok, true, r.result);
    assert.match(r.result, /120/);
    // a script write lands in the document
    const wr = await s.call('run_script', { code: "await setSong(song.replace('setBPM(120)', 'setBPM(99)')); print('done');" });
    assert.equal(wr.ok, true, wr.result);
    assert.ok(s.state.song.startsWith('setBPM(99)'));
    // repo files are readable, but not outside the repo
    assert.match((await s.call('read_repo_file', { path: 'examples/dx7/dsp/epiano.dsp' })).result, /dx\.operator/);
    assert.equal((await s.call('read_repo_file', { path: '../../etc/passwd' })).ok, false);
    // every call is recorded with its timing
    assert.ok(s.calls.length > 10 && s.calls.every((c) => typeof c.ms === 'number'));
});
