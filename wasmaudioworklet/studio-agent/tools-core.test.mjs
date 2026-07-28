import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyEditToText, grepText, normDsp, faustRegistrationHint, songSourceWarnings,
  summarizeSongEvents, formatSongSummary, songEventWarnings, songBpmFromSource, declaredInstruments
} from './tools-core.js';
import { spectrum, measureNote, parseNote, noteName } from '../audioprobe/audioanalysis.js';
import { probeWarnings } from '../audioprobe/instrumentprobe.js';

test('applyEditToText: unique replace', () => {
  assert.deepEqual(applyEditToText('a b c', { old_string: 'b', new_string: 'X' }), { text: 'a X c', count: 1 });
});
test('applyEditToText: not found → error', () => {
  assert.match(applyEditToText('abc', { old_string: 'z', new_string: 'y' }).error, /not found/);
});
test('applyEditToText: non-unique without replace_all → error', () => {
  assert.match(applyEditToText('x x x', { old_string: 'x', new_string: 'y' }).error, /not unique \(3/);
});
test('applyEditToText: replace_all replaces every occurrence', () => {
  assert.deepEqual(applyEditToText('x x x', { old_string: 'x', new_string: 'y', replace_all: true }), { text: 'y y y', count: 3 });
});
test('applyEditToText: identical old/new → error', () => {
  assert.match(applyEditToText('a', { old_string: 'a', new_string: 'a' }).error, /identical/);
});

test('grepText: reports 1-indexed line numbers', () => {
  assert.equal(grepText('foo\nbar\nbaz', { pattern: 'ba' }), '2: bar\n3: baz');
});
test('grepText: includes context lines', () => {
  assert.equal(grepText('a\nHIT\nc', { pattern: 'HIT', context: 1 }), '1: a\n2: HIT\n3: c');
});
test('grepText: no matches', () => {
  assert.equal(grepText('a\nb', { pattern: 'zzz' }), '(no matches)');
});
test('grepText: invalid regex → error', () => {
  assert.match(grepText('a', { pattern: '(' }).error, /bad regex/);
});

test('normDsp: adds .dsp and strips faust/ prefix', () => {
  assert.equal(normDsp('bass'), 'bass.dsp');
  assert.equal(normDsp('faust/lead.dsp'), 'lead.dsp');
});

test('faustRegistrationHint: instrument WITH a channel class uses it', () => {
  const ts = 'export class Pad extends MidiVoice {}\nexport class PadChannel extends MidiChannel {}';
  const h = faustRegistrationHint(ts, 'pad');
  assert.deepEqual(h.classes, ['Pad', 'PadChannel']);
  assert.match(h.message, /new PadChannel\(8/);
});
test('faustRegistrationHint: instrument WITHOUT a channel class uses base MidiChannel (regression for TS2305)', () => {
  const ts = 'export class Bass extends MidiVoice {}';
  const h = faustRegistrationHint(ts, 'bass');
  assert.deepEqual(h.classes, ['Bass']);
  assert.match(h.message, /new MidiChannel\(8, \(channel: MidiChannel\) => new Bass/);
  assert.doesNotMatch(h.message, /new BassChannel/);          // must NOT instantiate a phantom channel class
  assert.doesNotMatch(h.message, /import \{ Bass, BassChannel \}/); // must NOT import one either
});

test('songSourceWarnings: flags async IIFE wrappers', () => {
  const bad = `setBPM(120);\n(async () => {\n  await bass.steps(4, [c2]);\n})();\nloopHere();\n`;
  const warnings = songSourceWarnings(bad);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /async IIFE/);
  assert.match(warnings[0], /top-level/);
});

test('songSourceWarnings: flags async function wrappers too', () => {
  assert.equal(songSourceWarnings('(async function() { await x(); })();').length, 1);
});

test('songSourceWarnings: clean top-level await passes', () => {
  const good = `setBPM(120);\nawait createTrack(0).steps(4, [c2,, c2,,]);\nloopHere();\n`;
  assert.deepEqual(songSourceWarnings(good), []);
});

// ---- compiled-event analysis ------------------------------------------------
// Times are ms; at 120 BPM a beat is 500ms and a bar (4 beats) is 2000ms.
const BPM = 120;
const beat = n => n * 500;
const noteOn = (ch, note, b) => ({ time: beat(b), message: [0x90 + ch, note, 100] });
const noteOff = (ch, note, b) => ({ time: beat(b), message: [0x80 + ch, note, 0] });
const endAt = b => ({ time: beat(b), message: [-1] });

test('summarizeSongEvents: layered parts share bars', () => {
  // kick on every beat, hats on the offbeats — 4 beats, both in bar 1
  const events = [];
  for (let b = 0; b < 4; b++) {
    events.push(noteOn(0, 36, b), noteOff(0, 36, b + 0.5));
    events.push(noteOn(1, 42, b + 0.5), noteOff(1, 42, b + 1));
  }
  events.push(endAt(4));

  const s = summarizeSongEvents(events, BPM);
  assert.equal(s.totalNotes, 8);
  assert.equal(s.sounding.length, 2);
  assert.equal(s.lengthBeats, 4);
  assert.deepEqual(s.disjointPairs, [], 'layered channels must not be reported as disjoint');
  assert.deepEqual(songEventWarnings(s), []);
});

// The exact bug from the session log: kick for 4 beats, THEN hats.
test('summarizeSongEvents: sequential parts are flagged as never overlapping', () => {
  const events = [];
  for (let b = 0; b < 4; b++) events.push(noteOn(0, 36, b), noteOff(0, 36, b + 0.5));
  for (let b = 4; b < 8; b++) events.push(noteOn(1, 42, b), noteOff(1, 42, b + 0.5));
  events.push(endAt(8));

  const s = summarizeSongEvents(events, BPM);
  assert.equal(s.disjointPairs.length, 1);
  const [a, b] = s.disjointPairs[0];
  assert.equal(a.channel, 0);
  assert.equal(b.channel, 1);

  const warnings = songEventWarnings(s);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /NEVER play at the same time/);
  assert.match(warnings[0], /ch0 stops at beat 3 .* before ch1 starts at beat 4/);
  assert.match(warnings[0], /await ONLY the pattern that keeps the beat/);
});

test('summarizeSongEvents: an empty song is reported as having no notes', () => {
  const s = summarizeSongEvents([endAt(0)], BPM);
  assert.equal(s.totalNotes, 0);
  const warnings = songEventWarnings(s);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /NO notes/);
  assert.match(warnings[0], /loopHere\(\) ended the song at beat 0/);
});

// A part that enters late still overlaps, and must stay quiet.
test('summarizeSongEvents: a part entering later still counts as overlapping', () => {
  const events = [];
  for (let b = 0; b < 16; b++) events.push(noteOn(0, 36, b));        // drums throughout
  for (let b = 8; b < 16; b++) events.push(noteOn(1, 40, b));        // bass from bar 3
  events.push(endAt(16));

  const s = summarizeSongEvents(events, BPM);
  assert.deepEqual(s.disjointPairs, []);
  assert.deepEqual(songEventWarnings(s), []);
});

// Regression: bar-by-bar comparison flagged examples/beachdrive/song.js, where
// a guitar answers a lead — overlapping ranges, but never the same bar.
test('summarizeSongEvents: instruments alternating bars are NOT flagged', () => {
  const events = [];
  for (let bar = 0; bar < 16; bar++) {
    const ch = bar % 2 === 0 ? 4 : 6;          // call and response, bar by bar
    events.push(noteOn(ch, 60, bar * 4), noteOn(ch, 64, bar * 4 + 2));
  }
  events.push(endAt(64));

  const s = summarizeSongEvents(events, BPM);
  assert.equal(s.sounding.length, 2);
  assert.deepEqual(s.disjointPairs, [], 'alternating parts overlap in range and must stay quiet');
  assert.deepEqual(songEventWarnings(s), []);
});

test('summarizeSongEvents: control changes are counted but do not make a channel sound', () => {
  const s = summarizeSongEvents([
    { time: 0, message: [0xb0, 99, 1] },
    { time: 0, message: [0xb0, 98, 2] },
    endAt(0)
  ], BPM);
  assert.equal(s.sounding.length, 0);
  assert.equal(s.channels[0].ccs, 2);
  assert.equal(s.channels[0].notes, 0);
});

// A chord tone held into the next chord that repeats the same pitch: the synth
// gets note-on then note-off for one sounding note, and the new note is cut.
test('summarizeSongEvents: a held note re-attacked at its own note-off is flagged', () => {
  const held = (ch, note, from, to) => [noteOn(ch, note, from), noteOff(ch, note, to)];
  const events = [
    ...held(0, 70, 0, 2.5),      // as4 in A#maj7
    ...held(0, 65, 0, 2.5),      // f5  held...
    ...held(0, 65, 2.5, 3.5),    // ...and repeated in F at the exact note-off
    endAt(4)
  ];
  const s = summarizeSongEvents(events, BPM);
  assert.equal(s.noteCollisions.length, 1);
  assert.equal(s.noteCollisions[0].name, 'f5');
  assert.equal(s.noteCollisions[0].onBeat, 2.5);

  const warning = songEventWarnings(s).find(w => /CUT by/.test(w));
  assert.ok(warning, 'a collision must produce a warning');
  assert.match(warning, /f5 at beat 2\.5/);
  assert.match(warning, /SHORTENING the earlier note's duration/);
});

test('summarizeSongEvents: trimming the held note clears the collision', () => {
  const events = [
    noteOn(0, 65, 0), noteOff(0, 65, 2.45),   // released just before the next attack
    noteOn(0, 65, 2.5), noteOff(0, 65, 3.45),
    endAt(4)
  ];
  assert.deepEqual(summarizeSongEvents(events, BPM).noteCollisions, []);
});

// Every note in a step grid lasts exactly one step, so repeated drum hits always
// coincide. beachdrive has 209 of them and sounds fine — percussive retriggers
// are the idiom, not a bug.
test('summarizeSongEvents: repeated short drum hits are NOT flagged', () => {
  const events = [];
  for (let b = 0; b < 8; b += 0.5) {
    events.push(noteOn(9, 42, b), noteOff(9, 42, b + 0.5));   // hats, note-off meets next note-on
  }
  events.push(endAt(8));
  assert.deepEqual(summarizeSongEvents(events, BPM).noteCollisions, []);
  assert.deepEqual(songEventWarnings(summarizeSongEvents(events, BPM)), []);
});

// Recorded playing overlaps by ragged amounts; only durations written to land
// exactly on the next onset are an authoring artefact worth reporting.
test('summarizeSongEvents: a ragged recorded overlap is NOT flagged', () => {
  const events = [
    noteOn(1, 64, 0), noteOff(1, 64, 4.06),   // held 0.06 beats past the next attack
    noteOn(1, 64, 4), noteOff(1, 64, 8),
    endAt(8)
  ];
  assert.deepEqual(summarizeSongEvents(events, BPM).noteCollisions, []);
});

test('formatSongSummary: compact digest names channels, bars and the overlap failure', () => {
  const events = [];
  for (let b = 0; b < 4; b++) events.push(noteOn(0, 36, b));
  for (let b = 4; b < 8; b++) events.push(noteOn(1, 42, b));
  events.push(endAt(8));

  const text = formatSongSummary(summarizeSongEvents(events, BPM));
  assert.match(text, /8 beats \(2 bars\) at 120 BPM/);
  assert.match(text, /ch0: 4 notes, beats 0-3, bar 1/);
  assert.match(text, /ch1: 4 notes, beats 4-7, bar 2/);
  assert.match(text, /ch0 and ch1 NEVER overlap/);
  assert.ok(text.split('\n').length < 8, 'digest must stay compact');
});

test('songBpmFromSource: reads setBPM, falls back when absent', () => {
  assert.equal(songBpmFromSource('setBPM(125);\nawait t.steps(1,[c2]);'), 125);
  assert.equal(songBpmFromSource('setBPM( 93.5 )'), 93.5);
  assert.equal(songBpmFromSource('no tempo here'), 110);
  assert.equal(songBpmFromSource(''), 110);
});

// ---- audio analysis (shared by the in-app probe and tools/instrumenttest) ----
test('spectrum: finds the dominant frequency of a sine', () => {
  const sr = 44100, hz = 440;
  const buf = new Float32Array(8192);
  for (let i = 0; i < buf.length; i++) buf[i] = Math.sin(2 * Math.PI * hz * i / sr);
  const { dominantHz, centroidHz } = spectrum(buf, sr);
  assert.ok(Math.abs(dominantHz - hz) < 15, `dominant ${dominantHz} should be ~${hz}`);
  assert.ok(Math.abs(centroidHz - hz) < 100, 'a pure sine centroid sits at its own frequency');
});

test('spectrum: a bright source has a far higher centroid than a low sine', () => {
  const sr = 44100;
  const low = new Float32Array(8192);
  const high = new Float32Array(8192);
  for (let i = 0; i < low.length; i++) {
    low[i] = Math.sin(2 * Math.PI * 60 * i / sr);       // kick-ish
    high[i] = Math.sin(2 * Math.PI * 12000 * i / sr);   // hat-ish
  }
  // This gap is what distinguishes drums without listening.
  assert.ok(spectrum(high, sr).centroidHz > spectrum(low, sr).centroidHz * 10);
});

test('measureNote: silence is reported as silent, not merely quiet', () => {
  const quiet = new Float32Array(4096);   // all zeros
  const m = measureNote(quiet, quiet, { note: 36 });
  assert.equal(m.silent, true);
  assert.equal(m.peak, 0);
  assert.equal(m.name, 'c3');
});

test('measureNote: an audible note is not silent and carries its expected pitch', () => {
  const sr = 44100;
  const buf = new Float32Array(8192);
  for (let i = 0; i < buf.length; i++) buf[i] = 0.5 * Math.sin(2 * Math.PI * 65.4 * i / sr);
  const m = measureNote(buf, new Float32Array(512), { note: 36, sampleRate: sr });
  assert.equal(m.silent, false);
  assert.ok(m.peak > 0.4);
  assert.ok(Math.abs(m.expectedHz - 65.4) < 0.5, 'c3 is ~65.4Hz');
});

test('parseNote: names and numbers, matching the sequencer convention', () => {
  assert.equal(parseNote('c3'), 36);
  assert.equal(parseNote('fs3'), 42);
  assert.equal(parseNote('60'), 60);
  assert.equal(noteName(60), 'c5');
  assert.throws(() => parseNote('h9'), /unrecognised note/);
});

test('probeWarnings: a fully silent channel must not be reported as ready', () => {
  const silent = [{ channel: 0, name: 'c3', silent: true }, { channel: 0, name: 'fs3', silent: true }];
  const w = probeWarnings(silent);
  assert.equal(w.length, 1);
  assert.match(w[0], /NO SOUND/);
  assert.match(w[0], /do NOT report this as ready/);
  assert.match(w[0], /`gate`/);
});

test('probeWarnings: audible notes produce no warning', () => {
  assert.deepEqual(probeWarnings([{ channel: 0, name: 'c3', silent: false }]), []);
});

// A part scheduled AFTER the awaited beat-keeper starts past the end of the
// song and loopHere() discards it. The channel then has no events at all, so it
// vanishes from the digest entirely — the agent sees a tidy summary and hunts
// the fault in the instrument, which probes perfectly fine. Reproduces a live
// session where the agent looped on probe_instrument for exactly this.
test('summarizeSongEvents: an instrument declared but never played is named', () => {
  const events = [];
  for (let b = 0; b < 4; b++) events.push(noteOn(0, 60, b), noteOn(1, 36, b));
  events.push(endAt(4));

  const s = summarizeSongEvents(events, BPM, { instruments: ['piano', 'kick', 'hihat'] });
  assert.equal(s.declaredSilent.length, 1);
  assert.deepEqual(s.declaredSilent[0], { channel: 2, name: 'hihat' });

  const w = songEventWarnings(s).find((x) => /hihat/.test(x));
  assert.ok(w, 'a declared-but-silent instrument must warn');
  assert.match(w, /plays NO notes/);
  assert.match(w, /SONG bug, NOT an instrument bug/);
  assert.match(w, /BEFORE the pattern you await/);
  assert.match(formatSongSummary(s), /ch2 \('hihat'\): DECLARED but plays NO notes/);
});

test('summarizeSongEvents: instruments that all play produce no declared-silent warning', () => {
  const events = [noteOn(0, 60, 0), noteOn(1, 36, 0), endAt(4)];
  const s = summarizeSongEvents(events, BPM, { instruments: ['piano', 'kick'] });
  assert.deepEqual(s.declaredSilent, []);
  assert.equal(songEventWarnings(s).filter((w) => /declared/.test(w)).length, 0);
});

test('declaredInstruments: reads addInstrument in channel order, ignoring comments', () => {
  const src = `setBPM(125);
addInstrument('piano');
// addInstrument('ghost');
addInstrument("kick");
/* addInstrument('other'); */
addInstrument('hihat');`;
  assert.deepEqual(declaredInstruments(src), ['piano', 'kick', 'hihat']);
  assert.deepEqual(declaredInstruments(''), []);
});
