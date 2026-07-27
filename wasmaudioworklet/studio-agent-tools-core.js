// Pure, browser-free logic behind the studio-agent tools, split out so it can be
// unit-tested in Node. The browser client (studio-agent-client.js) wraps these
// for CodeMirror editors / OPFS.

// Surgical find-and-replace (mirrors the Edit tool). Returns { text, count } on
// success or { error } on failure.
export function applyEditToText(cur, { old_string, new_string, replace_all }) {
  if (old_string === new_string) return { error: 'old_string and new_string are identical' };
  const count = old_string ? cur.split(old_string).length - 1 : 0;
  if (count === 0) return { error: 'old_string not found in the document' };
  if (count > 1 && !replace_all) return { error: `old_string is not unique (${count} matches); add more surrounding context or set replace_all` };
  const text = replace_all ? cur.split(old_string).join(new_string) : cur.replace(old_string, new_string);
  return { text, count: replace_all ? count : 1 };
}

// Regex-grep over text. Returns "line: content" lines (with optional context),
// capped at 120 output lines, or { error } on a bad pattern.
export function grepText(text, { pattern, context = 0 }) {
  let re;
  try { re = new RegExp(pattern, 'i'); } catch (e) { return { error: `bad regex: ${e.message}` }; }
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length && out.length < 120; i++) {
    if (re.test(lines[i])) {
      for (let j = Math.max(0, i - context); j <= Math.min(lines.length - 1, i + context); j++) {
        out.push(`${j + 1}: ${lines[j].slice(0, 200)}`);
      }
    }
  }
  return out.length ? out.join('\n') : '(no matches)';
}

// Normalize a faust path to a repo-relative .dsp filename.
export function normDsp(path) {
  let rel = String(path || '').replace(/^faust\//, '');
  if (!rel.endsWith('.dsp')) rel += '.dsp';
  return rel;
}

// Lint a song source for known agent mistakes; returns warning strings to
// append to set_song/edit_song tool results. The song runs as ONE top-level
// async function, so an async IIFE wrapper is never needed — and because it
// is NOT awaited, loopHere() after it runs at beat 0 before any notes are
// scheduled, silently breaking the song.
export function songSourceWarnings(source) {
  const warnings = [];
  if (/\(\s*async\s*(\(|function)/.test(source)) {
    warnings.push(
      'WARNING: the song contains an async IIFE wrapper — it is NOT awaited, so loopHere()/code after it runs before the notes are scheduled and the song breaks. The song source is already one top-level async function: use plain top-level `await track.steps(...)` statements and remove the wrapper.'
    );
  }
  return warnings;
}

// ---- compiled-event analysis ------------------------------------------------
//
// Compiling a song produces a MIDI event list — note on/off, CC, at exact
// times. That is the ground truth for what the song actually DOES, and the
// agent cannot hear anything, so it is the only way for it to check its work.
// Whether two instruments play together is a FACT here, not a guess: either
// their notes fall in the same bars or they don't.
//
// Deliberately reports facts rather than grading a supplied expectation: an
// agent that misunderstands the timing model would write an expectation
// matching its own bug and mark it passed. The digest is compared against what
// the USER asked for, which the agent did not author.

const NOTE_ON = 0x90;
const CONTROL_CHANGE = 0xb0;
const END_OF_SONG = -1;

// eventlist: [{ time (ms), message: [status, data1, data2] }], as returned by
// compileSong. bpm is needed to express times in beats; song BPM lives inside
// the sandboxed compile, so callers pass it (see songBpmFromSource).
export function summarizeSongEvents(eventlist, bpm = 110, { beatsPerBar = 4 } = {}) {
  const msPerBeat = (60 * 1000) / (bpm > 0 ? bpm : 110);
  const toBeat = (ms) => ms / msPerBeat;
  const byChannel = new Map();
  let lengthBeats = 0;

  for (const evt of eventlist || []) {
    const [status, , velocity] = evt.message || [];
    if (status === undefined) continue;
    const beat = toBeat(evt.time);
    lengthBeats = Math.max(lengthBeats, beat);
    if (status === END_OF_SONG) continue;

    const channel = status & 0x0f;
    let c = byChannel.get(channel);
    if (!c) {
      c = { channel, notes: 0, ccs: 0, firstBeat: Infinity, lastBeat: -Infinity, bars: new Set() };
      byChannel.set(channel, c);
    }
    if ((status & 0xf0) === NOTE_ON && velocity > 0) {
      c.notes++;
      c.firstBeat = Math.min(c.firstBeat, beat);
      c.lastBeat = Math.max(c.lastBeat, beat);
      c.bars.add(Math.floor(beat / beatsPerBar));
    } else if ((status & 0xf0) === CONTROL_CHANGE) {
      c.ccs++;
    }
  }

  const channels = [...byChannel.values()].sort((a, b) => a.channel - b.channel);
  const sounding = channels.filter((c) => c.notes > 0);

  // The bug this catches is one part playing straight AFTER another: it ends
  // before the other begins. Test the note ranges, not bar-by-bar occupancy —
  // instruments that alternate bars (call and response, a guitar answering a
  // lead) share no single bar yet are perfectly normal music. examples/
  // beachdrive/song.js has exactly that, and bar-set comparison flagged it.
  const disjointPairs = [];
  for (let i = 0; i < sounding.length; i++) {
    for (let j = i + 1; j < sounding.length; j++) {
      const [a, b] = [sounding[i], sounding[j]];
      const [first, second] = a.firstBeat <= b.firstBeat ? [a, b] : [b, a];
      if (first.lastBeat < second.firstBeat) disjointPairs.push([first, second]);
    }
  }

  return {
    bpm,
    beatsPerBar,
    lengthBeats,
    totalNotes: sounding.reduce((sum, c) => sum + c.notes, 0),
    channels,
    sounding,
    disjointPairs
  };
}

const round = (n) => Math.round(n * 100) / 100;
const barRange = (c) => {
  const bars = [...c.bars].sort((a, b) => a - b);
  return bars.length === 1 ? `bar ${bars[0] + 1}` : `bars ${bars[0] + 1}-${bars[bars.length - 1] + 1}`;
};

// Compact digest — a fixed handful of lines whatever the song's size. Never
// dump the event list itself: a few minutes of music is thousands of events.
export function formatSongSummary(s) {
  const bars = Math.ceil(s.lengthBeats / s.beatsPerBar);
  const lines = [
    `song: ${round(s.lengthBeats)} beats (${bars} bars) at ${s.bpm} BPM · ` +
      `${s.sounding.length} sounding channel(s) · ${s.totalNotes} notes`
  ];
  if (!s.sounding.length) {
    lines.push('(no notes at all)');
  }
  for (const c of s.channels) {
    lines.push(
      c.notes
        ? `ch${c.channel}: ${c.notes} notes, beats ${round(c.firstBeat)}-${round(c.lastBeat)}, ` +
          `${barRange(c)}${c.ccs ? `, ${c.ccs} CC` : ''}`
        : `ch${c.channel}: no notes${c.ccs ? ` (${c.ccs} CC only)` : ''}`
    );
  }
  for (const [a, b] of s.disjointPairs) {
    lines.push(
      `ch${a.channel} and ch${b.channel} NEVER overlap: ch${a.channel} stops at beat ${round(a.lastBeat)} ` +
        `before ch${b.channel} starts at beat ${round(b.firstBeat)}`
    );
  }
  return lines.join('\n');
}

// Anomalies worth interrupting the agent with, appended to compile results the
// way shader warnings already are. Only things that are almost certainly wrong.
export function songEventWarnings(s) {
  const warnings = [];
  if (!s.sounding.length) {
    warnings.push(
      'WARNING: the compiled song contains NO notes. Nothing moved the playhead, so loopHere() ended the song at beat 0 and every note was discarded. ' +
        'Check that at least one pattern is awaited, and that no sequencing is wrapped in a function that is never awaited.'
    );
  }
  for (const [a, b] of s.disjointPairs) {
    warnings.push(
      `WARNING: channels ${a.channel} and ${b.channel} NEVER play at the same time — ` +
        `ch${a.channel} stops at beat ${round(a.lastBeat)} (${barRange(a)}) before ch${b.channel} starts at beat ${round(b.firstBeat)} (${barRange(b)}). ` +
        'If the user asked for these instruments TOGETHER, this is the await bug: await ONLY the pattern that keeps the beat and call the others plainly. ' +
        'Ignore this if they really are separate sections.'
    );
  }
  return warnings;
}

// The song compiles inside the QuickJS sandbox, so its BPM is not readable
// from the host — take it from the source. Structural findings (note counts,
// which channels overlap) do not depend on this; only the beat/bar labels do.
export function songBpmFromSource(source, fallback = 110) {
  const m = /setBPM\s*\(\s*([\d.]+)\s*\)/.exec(String(source || ''));
  const bpm = m ? Number(m[1]) : NaN;
  return Number.isFinite(bpm) && bpm > 0 ? bpm : fallback;
}

// Build the write_faust success hint from a transpiled .ts: which classes to
// import and how to register the channel. Uses the base MidiChannel when no
// <Name>Channel was generated (fixes the recurring "no exported member" error).
export function faustRegistrationHint(ts, stem) {
  const classes = [...ts.matchAll(/export class (\w+)/g)].map((m) => m[1]);
  const voice = classes.find((c) => !/Channel$/.test(c)) || 'Xxx';
  const chan = classes.find((c) => /Channel$/.test(c));
  const reg = chan
    ? `midichannels[N] = new ${chan}(8, (channel: MidiChannel) => new ${voice}(channel));`
    : `midichannels[N] = new MidiChannel(8, (channel: MidiChannel) => new ${voice}(channel));   // no ${voice}Channel was generated — use the base MidiChannel`;
  const message =
    `transpiled OK → faust/${stem}.ts exports: ${classes.join(', ') || '(none)'}. ` +
    `In synth.ts: import { ${classes.join(', ')} } from '../faust/${stem}';  (import ONLY these exact names) ` +
    `then ${reg}`;
  return { classes, voice, chan, message };
}
