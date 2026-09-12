// The task corpus. Each task is a real request (most of them verbatim from a
// session log) with the project state it was made in, and checks over the
// outcome that need no human: structure from the compiled MIDI events, sound
// from a probe, scope from the untouched documents, discipline from the
// transcript. Tasks from the session logs carry the commit their state came
// from; three of them also carry the human-approved RESULT (fixtures/<name>/after),
// which tasks.test.mjs uses to prove the checks pass on the real outcome and
// fail on the untouched start.
//
//   { id, title, source, project(), prompt, checks, after?, followUps? }
//
// followUps: [{ match: /regex on the producer's question/, reply: 'what the
// user would answer' }] — used at most once each, only when a turn ends with a
// question. They are the answers the user actually gave (or would have), not
// hints; the runner counts questions so asking has a visible cost.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as c from '../checks.mjs';
import { snap, onChannel, inRange, sameNotes, named, ok, fail } from '../checks.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(__dirname, 'fixtures');
const REPO = path.resolve(__dirname, '..', '..', '..', '..');

/** A vendored project state → { song, synth, faust: { stem: dsp } }. */
export function fixture(name, sub = '') {
  const dir = path.join(FIX, name, sub);
  const read = (f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8') : '');
  const faust = {};
  const fdir = path.join(dir, 'faust');
  if (fs.existsSync(fdir)) for (const f of fs.readdirSync(fdir)) if (f.endsWith('.dsp')) faust[f.replace(/\.dsp$/, '')] = fs.readFileSync(path.join(fdir, f), 'utf8');
  return { song: read('song.js'), synth: read('synth.ts'), shader: read('shader.glsl'), faust };
}
const drumDsp = () => {
  const { faust } = fixture('house-drums');
  return { kick: faust.kick, snare: faust.snare, hihat: faust.hihat };
};
const EPIANO = fs.readFileSync(path.join(REPO, 'examples/dx7/dsp/epiano.dsp'), 'utf8');

// The finale of the house track: six 32-beat rounds from beat 256; rounds 0-1
// and 4-5 use the intro bass (and finaleHats), rounds 2-3 the italo bass.
const FINALE = 256;
const INTRO_BASS_ROUNDS = [[FINALE, FINALE + 64], [FINALE + 128, FINALE + 192]];

export const TASKS = [
  {
    id: 'drums-basic',
    title: 'kick-hihat-snare-hihat at 120 BPM (instruments exist)',
    source: 'bench-drums.mjs (the task that burned a live NEAR AI session)',
    project: () => ({
      faust: drumDsp(),
      synth: `import { midichannels, MidiChannel } from './globalimports';
import { Kick } from '../faust/kick';
import { Snare } from '../faust/snare';
import { Hihat } from '../faust/hihat';

export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(2, (channel: MidiChannel) => new Kick(channel));
    midichannels[1] = new MidiChannel(2, (channel: MidiChannel) => new Snare(channel));
    midichannels[2] = new MidiChannel(3, (channel: MidiChannel) => new Hihat(channel));
}
export function postprocess(): void {}
`,
      song: `setBPM(110);

addInstrument('kick');   // channel 0
addInstrument('snare');  // channel 1
addInstrument('hihat');  // channel 2

loopHere();
`,
    }),
    prompt: 'I would like a drum track with kick, hihat and snare.\n\nkick - hihat - snare - hihat\n\n( and loop it ).\n\n120 bpm.\n\n(The three instruments already exist: kick on channel 0, snare on channel 1, hihat on channel 2. Only the song needs writing.)',
    checks: [
      c.compiles(), c.bpmIs(120), c.wholeBars(), c.delegations(0), c.synthUnchanged(),
      c.onsetsOnlyAt(0, [0], { label: 'kick on beat 1 of every bar' }),
      c.onsetsOnlyAt(1, [2], { label: 'snare on beat 3' }),
      c.onsetsOnlyAt(2, [1, 3], { label: 'hihat on beats 2 and 4' }),
      named('one kick + one snare + two hihats per bar, every bar', ({ notes, summary }) => {
        if (!notes) return fail('no compiled song');
        const bars = Math.round(summary.lengthBeats / 4);
        const count = (ch) => onChannel(notes, ch).length;
        return count(0) === bars && count(1) === bars && count(2) === 2 * bars
          ? ok(`${bars} bars`) : fail(`${count(0)} kick / ${count(1)} snare / ${count(2)} hihat over ${bars} bars`);
      }),
    ],
  },

  {
    id: 'fm-epiano',
    title: 'a warm FM e-piano for channel 0 (instrument only; song must stay)',
    source: 'the step-1 smoke task',
    project: () => ({
      song: `setBPM(110);

addInstrument('epiano');   // channel 0

const keys = createTrack(0, 4);
await keys.steps(2, [ [c4, e4, g4], , [f4, a4, c5], , [g4, b4, d5], , [c4, e4, g4], null ]);
loopHere();
`,
    }),
    prompt: 'Give me a warm FM electric piano for channel 0 — call it epiano. Something like a DX7 e-piano with a soft attack.',
    checks: [
      c.compiles(), c.delegations(1), c.producerWroteNoDsp(), c.songUnchanged(), c.hasFaust(/epiano/), c.audible(0), c.honest(),
      named('FM character: centroid above the fundamental', async ({ probe }) => {
        const r = (await probe(0, 'c4'))[0];
        if (!r || r.silent) return fail('silent');
        return r.centroidHz > r.expectedHz * 1.2 ? ok(`${r.centroidHz}Hz vs ${r.expectedHz}Hz`) : fail(`${r.centroidHz}Hz ~ fundamental ${r.expectedHz}Hz`);
      }),
    ],
  },

  {
    id: 'drum-kit-scope',
    title: 'make a kick, a snare and a closed hi-hat — the song must not change',
    source: 'seventh pass (the agent once overwrote the song with a demo groove)',
    project: () => ({
      faust: { epiano: EPIANO },
      synth: `import { midichannels, MidiChannel } from './globalimports';
import { Epiano } from '../faust/epiano';

export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(8, (channel: MidiChannel) => new Epiano(channel));
}
export function postprocess(): void {}
`,
      song: `setBPM(120);

addInstrument('epiano');   // channel 0

const keys = createTrack(0, 4);
await keys.steps(2, [ [d4, f4, a4], , [d4, f4, a4], , [c4, e4, g4], , [c4, e4, g4], null ]);
loopHere();
`,
    }),
    prompt: 'Make me a kick, a snare and a closed hi-hat as three instruments so I can write a beat later. Put them on channels 1, 2 and 3.',
    checks: [
      c.compiles(), c.delegations(3), c.producerWroteNoDsp(), c.songUnchanged(), c.honest(),
      c.hasFaust(/kick/), c.hasFaust(/snare/), c.hasFaust(/hat/),
      c.audible(1, 'c3'), c.audible(2, 'c3'), c.audible(3, 'c3'),
      c.centroidBetween(1, 30, 400, 'c3'), c.centroidBetween(3, 3000, 20000, 'c3'),
      named('channel 0 still plays the e-piano (pitch tracks the note)', async ({ probe }) => {
        const [a] = await probe(0, 'c4'); const [b] = await probe(0, 'c5');
        if (!a || !b || a.silent || b.silent) return fail('channel 0 silent');
        // the e-piano's loudest partial is a low HARMONIC of the note (the reference
        // instrument peaks at the octave); a drum's dominant does not move with the note
        const harmonic = (r) => { const q = r.dominantHz / r.expectedHz; const n = Math.round(q); return n >= 1 && n <= 4 && Math.abs(q - n) < 0.06; };
        return harmonic(a) && harmonic(b) ? ok(`${a.dominantHz}Hz / ${b.dominantHz}Hz`) : fail(`dominant ${a.dominantHz}Hz for c4, ${b.dominantHz}Hz for c5 — not the e-piano any more`);
      }),
      // a snare is brighter than a kick; how bright is taste (a real one measured 11 kHz)
      named('snare brighter than the kick', async ({ probe }) => {
        const [k] = await probe(1, 'c3'); const [s] = await probe(2, 'c3');
        if (!k || !s || k.silent || s.silent) return fail('a drum is silent');
        return s.centroidHz > k.centroidHz * 2 && s.centroidHz > 400 ? ok(`kick ${k.centroidHz}Hz, snare ${s.centroidHz}Hz`) : fail(`kick ${k.centroidHz}Hz, snare ${s.centroidHz}Hz`);
      }),
    ],
  },

  {
    id: 'italo-drums',
    title: 'snare on 2 and 4, double hi-hats, in the italo sections (needs a snare instrument)',
    source: 'session 2026-09-06 message 17:00 → wasm-agent-music d524b6e',
    project: () => fixture('italo-drums'),
    after: () => fixture('italo-drums', 'after'),
    prompt: "let's work on drums. for all the italo disco parts, I want a snare on every second beat, and the hihats should also be on the 2/4 and 3/4 beats.",
    followUps: [
      { match: /snare|hi-?hat|beat|channel|instrument|clarif|mean/i, reply: 'Snare on beats 2 and 4 of every bar (the backbeat). Hi-hats on the 2/4 and 3/4 STEPS of every beat, i.e. at .5 and .75 of each beat. There is no snare instrument yet: make one and put it on channel 7. The italo disco parts are the two italo playthroughs and finale rounds 3 and 4 (the ones with the italo bass).' },
    ],
    checks: [
      c.compiles(), c.wholeBars(), c.delegations(1), c.producerWroteNoDsp(), c.honest(),
      c.hasFaust(/snare/), c.audible(7, 'd3'), c.centroidBetween(7, 400, 20000, 'd3'),
      c.onsetsOnlyAt(7, [1, 3], { label: 'snare only on beats 2 and 4' }),
      named('where the snare plays, hats hit the 2/4 and 3/4 of every beat', ({ notes }) => {
        if (!notes) return fail('no compiled song');
        const snare = onChannel(notes, 7);
        if (!snare.length) return fail('no snare');
        const bars = [...new Set(snare.map((n) => Math.floor(snap(n.beat) / 4)))];
        const hats = onChannel(notes, 1);
        const missing = [];
        for (const bar of bars) for (let b = 0; b < 4; b++) for (const pos of [0.5, 0.75]) {
          const t = bar * 4 + b + pos;
          if (!hats.some((n) => Math.abs(snap(n.beat) - t) < 1e-6)) missing.push(t);
        }
        return missing.length ? fail(`${missing.length} missing hat positions, e.g. ${missing.slice(0, 4).join(' ')}`) : ok(`${bars.length} bars`);
      }),
      c.channelsUnchanged([0, 2, 3, 4, 5, 6]),
    ],
  },

  {
    id: 'italo-fills',
    title: 'fill A (one extra snare before the last beat) and fill B (snares follow the hats, no snare on the final downbeat)',
    source: 'session 2026-09-06 messages 17:10 + 17:28 (the clarification) → wasm-agent-music 9ee3a1f',
    project: () => fixture('italo-fills'),
    after: () => fixture('italo-fills', 'after'),
    prompt: 'and in the end of every second italo round, I want a very simple "fill". Just an additional snare 2/4 after the snare that we have on every second beat. I also want an alternative fill with the snares on the italo disco parts that leads to another section, which should be a bit more comprehensive. The snares should follow the hihats on the two last beats, and then we need to skip the "regular" snare on the last beat. (and have only the kick on that beat, since the snares are the same steps as the hihats ).\n\nTo be precise about Fill A: it should be just one additional snare between the 31th and 32th beat in an italo round (the 15th and 16th in a 16-beat round). Fill B is the comprehensive one that leads into a new section.',
    followUps: [
      { match: /fill|snare|round|section|which|where|mean/i, reply: 'Keep the regular snare exactly as it is (beats 2 and 4 of every bar). Fill A: the same, plus ONE extra snare BETWEEN the round\'s last two beats — at 30.5 in a 32-beat round, 14.5 in a 16-beat one (that is half a beat BEFORE the last regular snare, not after it). Fill B: in the round\'s last bar, snares on the .5 and .75 of beats 3 and 4 (where the hats are) and NO snare on beat 4 itself. Use fill B where an italo round hands over to a different section, fill A elsewhere.' },
      { match: /which|where|rounds?|sections?|wire|apply|update|substitute/i, reply: 'Wire them in now: fill B on the rounds that hand over to a new section — the second round of the drop and the second round of the breakdown; fill A on every other italo round, including finale rounds 3 and 4. Then compile.' },
    ],
    checks: [
      c.compiles(), c.wholeBars(), c.delegations(0), c.channelsUnchanged([0, 1, 2, 3, 4, 5, 6]),
      c.onsetsOnlyAt(7, [1, 3, 2.5, 2.75, 3.5, 3.75], { label: 'snare only on backbeats or fill steps' }),
      named('fill A exists: a lone snare between the last two beats of a round', ({ notes, baseline }) => {
        const before = onChannel(baseline.notes, 7).map((n) => snap(n.beat));
        const added = onChannel(notes || [], 7).map((n) => snap(n.beat)).filter((b) => !before.includes(b));
        const fillA = added.filter((b) => b % 4 === 2.5 && !added.includes(b + 0.25));
        return fillA.length ? ok(`at beats ${fillA.join(' ')}`) : fail(`added snare beats: ${added.join(' ') || 'none'}`);
      }),
      named('fill B exists: snares on 2.5/2.75/3.5/3.75 of a bar, no snare on its beat 4', ({ notes }) => {
        const beats = onChannel(notes || [], 7).map((n) => snap(n.beat));
        const has = (t) => beats.includes(t);
        const bars = [...new Set(beats.map((b) => Math.floor(b / 4)))];
        const fillB = bars.filter((bar) => [2.5, 2.75, 3.5, 3.75].every((p) => has(bar * 4 + p)) && !has(bar * 4 + 3));
        return fillB.length ? ok(`bar ${fillB.join(', ')}`) : fail('no bar with the fill-B pattern');
      }),
    ],
  },

  {
    id: 'introbass-hats',
    title: 'in the intro-bass finale rounds: kick, hat (half), hat (normal), hat (half)',
    source: 'session 2026-09-06 message 18:13 → wasm-agent-music 1620127 (the user\'s own edit)',
    project: () => fixture('introbass-hats'),
    after: () => fixture('introbass-hats', 'after'),
    prompt: 'for the real finale sections, when we are using the introbass, we should change the hihats a bit. we should have a hihat on every step that there is no kick - so it should be like: kick, hihat ( half velocity ), hihat ( normal velocity ), hihat ( half velocity ). makes sense?',
    followUps: [
      { match: /load|paste|which|open|editor|rounds?|sections?|only|both|all/i, reply: 'The song is already open in the editor — read it with get_song. It is the house track; the real finale is the six 32-beat rounds at the end, and the intro bass plays in rounds 1, 2, 5 and 6 (the descending-bass rounds are intro-bass rounds too). Change all four.' },
    ],
    checks: [
      c.compiles(), c.wholeBars(), c.delegations(0), c.channelsUnchanged([0, 2, 3, 4, 5, 6, 7]),
      named('intro-bass rounds: hats on .25/.5/.75 of every beat, none on the kick step', ({ notes }) => {
        if (!notes) return fail('no compiled song');
        const hats = onChannel(notes, 1).map((n) => snap(n.beat));
        const missing = [], onKick = [];
        for (const [lo, hi] of INTRO_BASS_ROUNDS) for (let b = lo; b < hi; b++) {
          for (const p of [0.25, 0.5, 0.75]) if (!hats.includes(b + p)) missing.push(b + p);
          if (hats.includes(b)) onKick.push(b);
        }
        if (missing.length) return fail(`${missing.length} missing, e.g. ${missing.slice(0, 4).join(' ')}`);
        if (onKick.length) return fail(`${onKick.length} hats on the kick step, e.g. ${onKick.slice(0, 4).join(' ')}`);
        return ok();
      }),
      named('velocities: the .25 and .75 hats softer than the .5 hat', ({ notes }) => {
        if (!notes) return fail('no compiled song');
        const hats = onChannel(notes, 1);
        const v = (t) => hats.find((n) => Math.abs(snap(n.beat) - t) < 1e-6)?.velocity;
        const bad = [];
        for (const [lo, hi] of INTRO_BASS_ROUNDS) for (let b = lo; b < hi; b++) {
          const a = v(b + 0.25), m = v(b + 0.5), z = v(b + 0.75);
          if (!(a < m && z < m)) bad.push(`${b}:${a}/${m}/${z}`);
        }
        return bad.length ? fail(`${bad.length} beats, e.g. ${bad.slice(0, 3).join(' ')}`) : ok();
      }),
      named('hats outside those rounds unchanged', ({ notes, baseline }) => {
        const outside = (ns) => onChannel(ns, 1).filter((n) => !INTRO_BASS_ROUNDS.some(([lo, hi]) => n.beat >= lo - 1e-6 && n.beat < hi - 1e-6));
        const r = sameNotes(outside(baseline.notes), outside(notes || []));
        return r.same ? ok(r.why) : fail(r.why);
      }),
    ],
  },

  {
    id: 'melody-up',
    title: 'second round of finale 2: the melody climbs with c7 then d7 on the last beat, half a beat each',
    source: 'session 2026-09-06 message 14:22 → wasm-agent-music 2e9133f (bundled with later edits)',
    project: () => fixture('melody-up'),
    prompt: 'in the second round of finale 2 I want the melody to go up with the notes c7 an d7 on the last beat ( each lasting half a beat )',
    checks: [
      c.compiles(), c.delegations(0), c.channelsUnchanged([0, 1, 2, 3, 5, 6]),
      named('channel 4 gains exactly c7 then d7 on the last beat of the song, half a beat each', ({ notes, baseline }) => {
        if (!notes) return fail('no compiled song');
        const before = onChannel(baseline.notes, 4);
        const after = onChannel(notes, 4);
        const key = (n) => `${snap(n.beat)}|${n.note}`;
        const had = new Set(before.map(key));
        const added = after.filter((n) => !had.has(key(n)));
        if (added.length !== 2) return fail(`${added.length} new notes on channel 4 (${added.slice(0, 4).map((n) => `${n.note}@${snap(n.beat)}`).join(' ')})`);
        const L = baseline.summary.lengthBeats;
        const c7 = added.find((n) => n.note === 84), d7 = added.find((n) => n.note === 86);
        if (!c7 || !d7) return fail(`new notes are ${added.map((n) => n.note).join(', ')}, not c7 (84) and d7 (86)`);
        if (Math.abs(c7.beat - (L - 1)) > 0.05 || Math.abs(d7.beat - (L - 0.5)) > 0.05) return fail(`c7 at ${snap(c7.beat)}, d7 at ${snap(d7.beat)}; last beat is ${L - 1}`);
        if (Math.abs(c7.duration - 0.5) > 0.08 || Math.abs(d7.duration - 0.5) > 0.08) return fail(`durations ${c7.duration?.toFixed(2)} / ${d7.duration?.toFixed(2)}`);
        const r = sameNotes(before, after.filter((n) => had.has(key(n))));
        return r.same ? ok() : fail(`the rest of channel 4 changed: ${r.why}`);
      }),
    ],
  },
];

export const taskById = (id) => TASKS.find((t) => t.id === id);
