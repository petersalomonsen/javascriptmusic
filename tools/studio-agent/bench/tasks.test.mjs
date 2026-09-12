// The corpus checks itself before any model runs: for every task, the checks
// must FAIL on the untouched starting project (or a no-op run would pass) and
// PASS on a known-good result — the human-approved commit where there is one,
// a hand-made edit where there is not. A check that cannot tell the two apart
// is not a check.
//
// Run with: npm run test-tasks   (in tools/studio-agent; ~3-4 min: it compiles every fixture)

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { createHeadlessStudio } from './headless-studio.mjs';
import { baselineOf, verdictOf } from './verdict.mjs';
import { TASKS, taskById, fixture } from './tasks/index.mjs';
import { REPO } from '../../instrumenttest/headless.mjs';

const delegated = (n) => Array.from({ length: n }, () => ({ kind: 'tool_use', name: 'design_instrument' }));
const failing = (v) => v.results.filter((r) => !r.ok).map((r) => `${r.name}: ${r.why}`).join('\n  ');

async function expectVerdict(task, project, transcript, shouldPass, label) {
  const studio = createHeadlessStudio({ project });
  const baseline = await baselineOf(createHeadlessStudio({ project: task.project() }));
  const v = await verdictOf(task, studio, baseline, transcript);
  assert.equal(v.pass, shouldPass, `${task.id} ${label}: expected ${shouldPass ? 'PASS' : 'FAIL'}\n  ${failing(v) || '(all checks passed)'}`);
  return v;
}

for (const task of TASKS) {
  test(`${task.id}: the untouched start fails its checks`, { timeout: 600000 }, async () => {
    const v = await expectVerdict(task, task.project(), [], false, 'untouched');
    // …and fails for a STRUCTURAL reason, not only because nothing was delegated
    const structural = v.results.filter((r) => !r.ok && !/design_instrument called/.test(r.name));
    assert.ok(structural.length, `${task.id}: only the delegation count failed on the untouched start`);
  });
}

for (const task of TASKS.filter((t) => t.after)) {
  test(`${task.id}: the human-approved result passes its checks`, { timeout: 600000 }, async () => {
    const n = task.checks.find((c) => /design_instrument called (\d+)/.test(c.name));
    const count = n ? Number(/(\d+)×/.exec(n.name)[1]) : 0;
    await expectVerdict(task, task.after(), delegated(count), true, 'approved result');
  });
}

test('drums-basic: the known-good beat passes', { timeout: 600000 }, async () => {
  const task = taskById('drums-basic');
  const project = task.project();
  project.song = `setBPM(120);

addInstrument('kick');   // channel 0
addInstrument('snare');  // channel 1
addInstrument('hihat');  // channel 2

const kick = createTrack(0, 4);
const snare = createTrack(1, 4);
const hihat = createTrack(2, 4);

hihat.steps(1, [ , fs3, , fs3 ].repeat(7));
snare.steps(1, [ , , d3, null ].repeat(7));
await kick.steps(1, [ c3, , , null ].repeat(7));
loopHere();
`;
  await expectVerdict(task, project, [], true, 'known-good beat');
});

test('fm-epiano: the shipped e-piano wired to channel 0 passes', { timeout: 600000 }, async () => {
  const task = taskById('fm-epiano');
  const project = task.project();
  project.faust = { epiano: fs.readFileSync(path.join(REPO, 'examples/dx7/dsp/epiano.dsp'), 'utf8') };
  project.synth = `import { midichannels, MidiChannel } from './globalimports';
import { Epiano } from '../faust/epiano';
export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(8, (channel: MidiChannel) => new Epiano(channel));
}
export function postprocess(): void {}
`;
  await expectVerdict(task, project, delegated(1), true, 'epiano wired');
});

test('drum-kit-scope: three real drums on channels 1-3 pass; the same with the song rewritten fails', { timeout: 600000 }, async () => {
  const task = taskById('drum-kit-scope');
  const { faust } = fixture('house-drums');
  const project = task.project();
  project.faust = { ...project.faust, kick: faust.kick, snare: faust.snare, hihat: faust.hihat };
  project.synth = `import { midichannels, MidiChannel } from './globalimports';
import { Epiano } from '../faust/epiano';
import { Kick } from '../faust/kick';
import { Snare } from '../faust/snare';
import { Hihat } from '../faust/hihat';
export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(8, (channel: MidiChannel) => new Epiano(channel));
    midichannels[1] = new MidiChannel(2, (channel: MidiChannel) => new Kick(channel));
    midichannels[2] = new MidiChannel(2, (channel: MidiChannel) => new Snare(channel));
    midichannels[3] = new MidiChannel(3, (channel: MidiChannel) => new Hihat(channel));
}
export function postprocess(): void {}
`;
  await expectVerdict(task, project, delegated(3), true, 'three drums');
  const rewritten = { ...project, song: project.song.replace('setBPM(120);', 'setBPM(120);\n// demo beat\n') };
  const v = await expectVerdict(task, rewritten, delegated(3), false, 'song rewritten');
  assert.ok(v.results.some((r) => r.name === 'song untouched' && !r.ok));
});

test('melody-up: the edit the session made passes', { timeout: 600000 }, async () => {
  const task = taskById('melody-up');
  const project = task.project();
  const anchor = '    [ 14.52, a6(0.91, 114) ]].quantize(4));';
  assert.ok(project.song.includes(anchor), 'the fixture has the melody block the session edited');
  project.song = project.song.replace(anchor, `${anchor}\n\n    if (f2 === 1) {\n        createTrack(4).play([[ 15, c7(0.5, 108) ], [ 15.5, d7(0.5, 114) ]]);\n    }`);
  await expectVerdict(task, project, [], true, 'session edit');
});
