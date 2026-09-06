// Pure, browser-free logic behind the studio-agent tools, split out so it can be
// unit-tested in Node. The browser client (client.js) wraps these
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

// ---- step-pattern geometry (source lint) ------------------------------------
//
// Two step-array mistakes are invisible in the compiled digest, and together
// they burned a whole live session:
//
//   1. `[c3, , , ]` is THREE slots, not four. JavaScript drops a single
//      trailing comma, so a pattern written to end on a rest comes out short
//      and drifts against every part that got its count right.
//   2. A layered (non-awaited) part longer than the awaited beat-keeper has its
//      tail DISCARDED at loopHere(). The digest then shows fewer notes than
//      were written, with nothing to say why.
//
// Both are decidable from the source before compiling, so report them there.
// The model should never have to do this arithmetic itself — it is exactly the
// arithmetic it gets wrong, and it cannot hear the result.

// Strip comments without disturbing string contents (a `//` inside a URL must
// survive), so prose commas can never be counted as pattern slots.
export function stripComments(source) {
  const src = String(source || '');
  let out = '';
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < src.length && src[j] !== ch) j += src[j] === '\\' ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j;
    } else if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      out += '\n';
    } else if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      i = end === -1 ? src.length : end + 1;
      out += ' ';
    } else {
      out += ch;
    }
  }
  return out;
}

// Walk a bracketed run from its opening char, skipping nested brackets and
// strings. `onComma` sees only depth-1 commas. Returns the closing index.
function scanBrackets(src, openIdx, onComma) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      i++;
      while (i < src.length && src[i] !== ch) i += src[i] === '\\' ? 2 : 1;
    } else if (ch === '[' || ch === '(' || ch === '{') {
      depth++;
    } else if (ch === ']' || ch === ')' || ch === '}') {
      if (--depth === 0) return i;
    } else if (ch === ',' && depth === 1) {
      onComma(i);
    }
  }
  return -1;
}

// Slot count of a step-array literal, counted the way JavaScript counts it:
// holes are slots, but a single trailing comma is NOT a slot.
function scanArrayLiteral(src, openIdx) {
  let commas = 0;
  let lastComma = -1;
  const close = scanBrackets(src, openIdx, (i) => { commas++; lastComma = i; });
  if (close === -1 || src[close] !== ']') return null;
  if (!commas) return { close, slots: src.slice(openIdx + 1, close).trim() ? 1 : 0, trailingEmpty: false };
  const trailingEmpty = !src.slice(lastComma + 1, close).trim();
  return { close, slots: trailingEmpty ? commas : commas + 1, trailingEmpty };
}

// Every `.steps(stepsPerBeat, [ ... ])` written with literal arguments, with the
// length it actually occupies. Calls whose count or pattern comes from a
// variable are skipped rather than guessed at.
export function stepPatternSpans(source) {
  const src = stripComments(source);
  const spans = [];
  const re = /\.\s*steps\s*\(/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const open = re.lastIndex - 1;
    let comma = -1;
    scanBrackets(src, open, (i) => { if (comma === -1) comma = i; });
    if (comma === -1) continue;
    const stepsPerBeat = Number(src.slice(open + 1, comma).trim());
    const tail = src.slice(comma + 1);
    const lead = tail.length - tail.replace(/^\s+/, '').length;
    if (tail[lead] !== '[') continue; // pattern held in a variable — nothing to count
    const arr = scanArrayLiteral(src, comma + 1 + lead);
    if (!arr) continue;

    // `.repeat(n)` appends n FURTHER copies, so n + 1 in total.
    const rep = src.slice(arr.close + 1).match(/^\s*\.\s*repeat\s*\(([^)]*)\)/);
    let copies = 1;
    if (rep) {
      const n = rep[1].trim() === '' ? 1 : Number(rep[1].trim());
      copies = Number.isFinite(n) ? n + 1 : NaN;
    }

    const stmtStart = 1 + Math.max(
      src.lastIndexOf(';', m.index), src.lastIndexOf('\n', m.index),
      src.lastIndexOf('{', m.index), src.lastIndexOf('}', m.index)
    );
    const head = src.slice(stmtStart, m.index);
    const receiver = head.replace(/^\s*await\s+/, '').trim() || 'track';
    spans.push({
      label: `${receiver.slice(-40)}.steps`,
      awaited: /\bawait\b/.test(head),
      stepsPerBeat,
      slots: arr.slots,
      trailingEmpty: arr.trailingEmpty,
      copies,
      beats: (arr.slots / stepsPerBeat) * copies,
      start: stmtStart,
      end: arr.close
    });
  }
  return spans;
}

// Parts scheduled at the same playhead position: a run of plain calls, normally
// closed by the one awaited call that keeps the beat. A trailing run with
// nothing awaited is still a group — its parts must agree with each other even
// when the playhead is moved by something else (`await waitDuration(32)` is a
// beat-keeper the slot arithmetic cannot see). It just has no length to be
// measured against, so only the sibling comparison applies to it.
function stepPatternGroups(spans) {
  const groups = [];
  let current = [];
  for (const span of spans) {
    current.push(span);
    if (span.awaited) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length) groups.push(current);
  return groups;
}

// Anything that makes the flat "layer, layer, await the beat-keeper" reading
// unsound: a loop repeating the awaited part (examples/textoverlay/song.js
// awaits 4 beats seven times), or patterns wrapped in callbacks scheduled
// elsewhere (songs/upbeat.js drives steps() from play() rows).
const RESCHEDULES = /\b(for|while|function)\b|=>/;

const EPS = 1e-9;
const droppedCommaWarning = (s, target) =>
  `WARNING: ${s.label}(${s.stepsPerBeat}, [...]) has ${s.slots} slots, not ${s.slots + 1} — ` +
  'the pattern ENDS ON AN EMPTY SLOT and JavaScript drops a single trailing comma, so `[c3, , , ]` is THREE slots. ' +
  `It therefore spans ${round(s.beats)} beats where ${round(target)} was clearly meant, and drifts against every part that got its count right. ` +
  'Write the last rest explicitly (`[c3, , , null]`) or add one more comma (`[c3, , , ,]`).';

export function stepPatternWarnings(source) {
  const src = stripComments(source);
  const spans = stepPatternSpans(source);
  const warnings = [];
  const named = new Set(); // spans already reported as a dropped comma

  // Parts layered at one playhead position must be the same length. When one is
  // SHORT by exactly the slot a trailing comma would have eaten, that is the
  // bug — and naming it beats naming the symptom: told only that the hi-hat
  // overruns the kick, a model shortens the hi-hat and locks in a 3-beat bar.
  for (const group of stepPatternGroups(spans)) {
    const keeper = group[group.length - 1];
    if (RESCHEDULES.test(src.slice(group[0].start, keeper.end))) continue;
    const lengths = group.filter((s) => Number.isFinite(s.beats)).map((s) => s.beats);
    if (!lengths.length) continue;
    const longest = Math.max(...lengths);

    for (const s of group) {
      if (!s.trailingEmpty || !Number.isFinite(s.beats) || s.beats >= longest - EPS) continue;
      if (Math.abs(((s.slots + 1) / s.stepsPerBeat) * s.copies - longest) > EPS) continue;
      warnings.push(droppedCommaWarning(s, longest));
      named.add(s);
    }
    // With the short part named, the overrun it caused needs no separate report.
    if (group.some((s) => named.has(s))) continue;
    // Measuring an overrun needs a beat-keeper of known length to overrun.
    if (!keeper.awaited || !Number.isFinite(keeper.beats)) continue;

    for (const s of group.slice(0, -1)) {
      if (!Number.isFinite(s.beats) || s.beats <= keeper.beats + EPS) continue;
      warnings.push(
        `WARNING: ${s.label} spans ${round(s.beats)} beats but the awaited beat-keeper ${keeper.label} spans only ${round(keeper.beats)}. ` +
          `The song ends where the beat-keeper ends, so the last ${round(s.beats - keeper.beats)} beats of ${s.label} are DISCARDED at loopHere() ` +
          'and that part sounds truncated — it plays FEWER notes than written, which the compiled digest shows as a count you did not expect. ' +
          'Await the LONGEST pattern of the group, or shorten the layered part to match.'
      );
    }
  }

  // A pattern with no sibling to measure against, whose slots do not even come
  // out to whole beats. A deliberate 15-slot pattern ending on a NOTE is a real
  // authoring style (songs/yoshimibrowsertest.js) and must stay quiet.
  for (const s of spans) {
    if (named.has(s) || !(s.stepsPerBeat > 0) || !s.slots || !s.trailingEmpty) continue;
    if (s.slots % s.stepsPerBeat === 0) continue;
    warnings.push(droppedCommaWarning(s, ((s.slots + 1) / s.stepsPerBeat) * s.copies));
  }
  return warnings;
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
  warnings.push(...stepPatternWarnings(source));
  return warnings;
}

// ---- playFromHere() ---------------------------------------------------------
//
// `playFromHere()` drops every note scheduled before it and restarts the
// clock (midisequencer/songcompiler.js), so the compiled song — and therefore
// every digest and warning below — covers ONLY what follows it. The app never
// inserts it: it is there because the USER typed it to audition or record one
// section. Without knowing that, the digest reads as a catastrophe (a 60-bar
// song "collapsed" to 16 beats, an instrument that "plays NO notes") and the
// agent removes the user's marker to "fix" it — which is what happened in a
// live session. So the marker is named wherever the digest could mislead.

// 1-based line of the first live `playFromHere()` call, or null. Comments are
// skipped (a `// playFromHere()` left behind must not count).
export function playFromHereLine(source) {
  const lines = String(source || '').split('\n');
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (inBlock) {
      const end = line.indexOf('*/');
      if (end === -1) continue;
      inBlock = false;
      line = line.slice(end + 2);
    }
    line = line.replace(/\/\*.*?\*\//g, ' ');
    const open = line.indexOf('/*');
    if (open !== -1) { inBlock = true; line = line.slice(0, open); }
    line = line.replace(/\/\/.*$/, '');
    if (/\bplayFromHere\s*\(/.test(line)) return i + 1;
  }
  return null;
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
const NOTE_OFF = 0x80;
const CONTROL_CHANGE = 0xb0;
const END_OF_SONG = -1;
// The sequencer encodes its own control messages as NEGATIVE single-byte
// statuses: -1 loop/end, -2 startRecording, -3 stopRecording, -4 broadcastSend,
// -5 broadcastWait (midisequencer/audioworkletprocessorsequencer.js). They are
// not MIDI, so `status & 0x0f` on them mints phantom channels — a song with
// recording markers reported ch13 and ch14 "no notes" (-3 & 0x0f = 13,
// -2 & 0x0f = 14), and broadcast sync would add ch11/ch12.
const isSequencerControl = (status) => status < 0;

// eventlist: [{ time (ms), message: [status, data1, data2] }], as returned by
// compileSong. bpm is needed to express times in beats; song BPM lives inside
// the sandboxed compile, so callers pass it (see songBpmFromSource).
export function summarizeSongEvents(eventlist, bpm = 110, { beatsPerBar = 4, instruments = [], playFromHereLine = null } = {}) {
  const msPerBeat = (60 * 1000) / (bpm > 0 ? bpm : 110);
  const toBeat = (ms) => ms / msPerBeat;
  const byChannel = new Map();
  let lengthBeats = 0;
  let lastSoundBeat = 0;

  for (const evt of eventlist || []) {
    const [status, , velocity] = evt.message || [];
    if (status === undefined) continue;
    const beat = toBeat(evt.time);
    lengthBeats = Math.max(lengthBeats, beat);
    // Control messages still extend the song's length, but must not become channels.
    if (isSequencerControl(status)) continue;

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
      lastSoundBeat = Math.max(lastSoundBeat, beat);
    } else if ((status & 0xf0) === NOTE_OFF || (status & 0xf0) === NOTE_ON) {
      // A note-off is where sound actually STOPS — a song ending on a held
      // chord is finished at its release, not at its last attack.
      lastSoundBeat = Math.max(lastSoundBeat, beat);
    } else if ((status & 0xf0) === CONTROL_CHANGE) {
      c.ccs++;
    }
  }

  const channels = [...byChannel.values()].sort((a, b) => a.channel - b.channel);
  const sounding = channels.filter((c) => c.notes > 0);
  const noteCollisions = findNoteCollisions(eventlist || [], toBeat);

  // An instrument the song DECLARED but that emits nothing. Its channel has no
  // events at all, so it is absent from the list above and simply goes
  // unmentioned — the agent then sees a tidy digest and hunts for the fault in
  // the instrument, which probes perfectly fine. Name it instead.
  const declaredSilent = instruments
    .map((name, channel) => ({ channel, name }))
    .filter(({ channel }) => !sounding.some((c) => c.channel === channel));

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
    lastSoundBeat,
    totalNotes: sounding.reduce((sum, c) => sum + c.notes, 0),
    channels,
    sounding,
    disjointPairs,
    noteCollisions,
    declaredSilent,
    playFromHereLine
  };
}

// `addInstrument('name')` in call order: the Nth call is channel N.
export function declaredInstruments(source) {
  const clean = String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  return [...clean.matchAll(/addInstrument\s*\(\s*['"`]([^'"`]*)['"`]\s*\)/g)].map((m) => m[1]);
}

// Note-off and note-on land on the same millisecond (times are rounded ints).
const COINCIDENT_MS = 1;
const NOTE_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
export const noteName = (n) => NOTE_NAMES[n % 12] + Math.floor(n / 12);

// A note whose note-OFF lands at or after the next note-ON of the SAME pitch on
// the SAME channel. The synth gets "attack, then release" for one sounding
// note, so the new note is cut instead of played — audible as a chord tone
// dropping out when it is held over into the next chord. The fix is always to
// shorten the earlier note's duration slightly, so its release clears the next
// attack. Not detectable from the source: it depends on durations, positions
// and which voicings happen to share a pitch.
function findNoteCollisions(eventlist, toBeat, minHeldBeats = 1) {
  const byKey = new Map();
  for (const evt of eventlist) {
    const [status, note, velocity] = evt.message || [];
    if (status === undefined || isSequencerControl(status)) continue;
    const type = status & 0xf0;
    const isOn = type === NOTE_ON && velocity > 0;
    const isOff = type === 0x80 || (type === NOTE_ON && velocity === 0);
    if (!isOn && !isOff) continue;
    const key = `${status & 0x0f}:${note}`;
    if (!byKey.has(key)) byKey.set(key, { channel: status & 0x0f, note, ons: [], offs: [] });
    byKey.get(key)[isOn ? 'ons' : 'offs'].push(evt.time);
  }

  const collisions = [];
  for (const { channel, note, ons, offs } of byKey.values()) {
    const onTimes = [...ons].sort((a, b) => a - b);
    const offTimes = [...offs].sort((a, b) => a - b);
    for (let i = 0; i < onTimes.length - 1; i++) {
      // the release that ends the note started at onTimes[i]
      const off = offTimes.find((t) => t >= onTimes[i]);
      if (off === undefined || off < onTimes[i + 1]) continue;
      // Only SUSTAINED notes. In a step grid every note lasts exactly one step,
      // so consecutive hits of the same drum always collide — 209 of them in
      // examples/beachdrive/song.js, which sounds fine. The audible failure is
      // a held note (a chord tone) being re-attacked and cut.
      if (toBeat(off - onTimes[i]) < minHeldBeats) continue;
      // Only EXACT coincidence: a duration written to land precisely on the
      // next onset. That is an authoring artefact — the case where a chord is
      // given a round length that happens to meet the next chord. Recorded
      // takes overlap by ragged amounts (beachdrive has held notes running 0.06
      // beats past the next attack) and are left alone.
      if (Math.abs(off - onTimes[i + 1]) > COINCIDENT_MS) continue;
      collisions.push({
        channel,
        note,
        name: noteName(note),
        onBeat: toBeat(onTimes[i + 1]),
        offBeat: toBeat(off),
        heldBeats: toBeat(off - onTimes[i])
      });
    }
  }
  return collisions.sort((a, b) => a.onBeat - b.onBeat);
}

const round = (n) => Math.round(n * 100) / 100;

// Song length in bars. A song is normally a whole number of bars; a fractional
// length means a pattern did not add up (an off-by-one slot count, a `.repeat()`
// miscount) and is the single most useful tell the digest can carry. Reporting
// `Math.ceil` here once hid a 1.5-bar song as "2 bars" and a model spent a whole
// session hunting the missing notes. Times are rounded to whole ms, so allow a
// hair of drift before calling a length fractional.
const WHOLE_BAR_EPSILON_BEATS = 0.05;
export function songBars(lengthBeats, beatsPerBar = 4) {
  const bars = lengthBeats / beatsPerBar;
  const off = Math.abs(bars - Math.round(bars)) * beatsPerBar;
  return { bars, whole: off <= WHOLE_BAR_EPSILON_BEATS };
}

// Dead air between the last sound and the end marker. The song still runs
// through it and only then loops, so the user hears a hole. It is what
// "4 slots at 4 steps per beat" looks like from the outside: the parts are one
// BEAT long each, the playhead was advanced by a bar's worth, and the rest of
// the song is nothing. Real music does leave a tail (examples/beachdrive/song.js
// releases its last note 5.4 beats before the end), so a gap only counts when
// it is both a whole bar and a third of the entire song.
export function trailingSilence(s) {
  const beats = s.sounding.length ? s.lengthBeats - s.lastSoundBeat : 0;
  return {
    beats,
    bars: beats / s.beatsPerBar,
    significant: beats >= s.beatsPerBar && beats >= s.lengthBeats / 3
  };
}

const barsText = (s) => {
  const { bars, whole } = songBars(s.lengthBeats, s.beatsPerBar);
  return whole
    ? `${Math.round(bars)} bars`
    : `${round(bars)} bars — NOT a whole number of bars`;
};

const barRange = (c) => {
  const bars = [...c.bars].sort((a, b) => a - b);
  return bars.length === 1 ? `bar ${bars[0] + 1}` : `bars ${bars[0] + 1}-${bars[bars.length - 1] + 1}`;
};

// Compact digest — a fixed handful of lines whatever the song's size. Never
// dump the event list itself: a few minutes of music is thousands of events.
export function formatSongSummary(s) {
  const lines = [
    `song: ${round(s.lengthBeats)} beats (${barsText(s)}) at ${s.bpm} BPM · ` +
      `${s.sounding.length} sounding channel(s) · ${s.totalNotes} notes`
  ];
  if (s.playFromHereLine) {
    lines.push(`playFromHere() at line ${s.playFromHereLine} — the user's audition marker: this digest covers ONLY what follows it. `
      + 'Earlier parts are absent by design, not lost; leave the marker in place.');
  }
  if (!s.sounding.length) {
    lines.push(s.playFromHereLine ? '(no notes after playFromHere())' : '(no notes at all)');
  }
  const silence = trailingSilence(s);
  if (silence.significant) {
    lines.push(`last sound at beat ${round(s.lastSoundBeat)} — the remaining `
      + `${round(silence.beats)} beats (${round(silence.bars)} bars) are SILENT before the loop`);
  }
  for (const c of s.channels) {
    lines.push(
      c.notes
        ? `ch${c.channel}: ${c.notes} notes, beats ${round(c.firstBeat)}-${round(c.lastBeat)}, ` +
          `${barRange(c)}${c.ccs ? `, ${c.ccs} CC` : ''}`
        : `ch${c.channel}: no notes${c.ccs ? ` (${c.ccs} CC only)` : ''}`
    );
  }
  for (const { channel, name } of s.declaredSilent) {
    lines.push(s.playFromHereLine
      ? `ch${channel} ('${name}'): no notes after playFromHere() — it may well play in the part before it`
      : `ch${channel} ('${name}'): DECLARED but plays NO notes — nothing of it reaches the timeline`);
  }
  for (const [a, b] of s.disjointPairs) {
    lines.push(
      `ch${a.channel} and ch${b.channel} NEVER overlap: ch${a.channel} stops at beat ${round(a.lastBeat)} ` +
        `before ch${b.channel} starts at beat ${round(b.firstBeat)}`
    );
  }
  if (s.noteCollisions.length) {
    lines.push(`${s.noteCollisions.length} note(s) cut by the previous note's note-off: ${collisionExamples(s)}`);
  }
  return lines.join('\n');
}

const collisionExamples = (s, limit = 3) =>
  s.noteCollisions.slice(0, limit)
    .map((c) => `ch${c.channel} ${c.name} at beat ${round(c.onBeat)} (off at ${round(c.offBeat)})`)
    .join('; ') + (s.noteCollisions.length > limit ? `, +${s.noteCollisions.length - limit} more` : '');

// Anomalies worth interrupting the agent with, appended to compile results the
// way shader warnings already are. Only things that are almost certainly wrong.
export function songEventWarnings(s) {
  const warnings = [];
  if (s.playFromHereLine) {
    warnings.push(
      `NOTE: playFromHere() at line ${s.playFromHereLine} — the user is auditioning from there, so the compiled song contains ONLY what follows it ` +
        '(everything scheduled before it is dropped and the clock restarts). That is intended: leave the marker in place, do not treat the earlier parts as missing, ' +
        'and read the length and channel figures as those of that section alone.'
    );
  }
  if (!s.sounding.length && s.playFromHereLine) {
    warnings.push(
      `WARNING: no notes after playFromHere() (line ${s.playFromHereLine}) — the section the user is auditioning schedules nothing after the marker.`
    );
  } else if (!s.sounding.length) {
    warnings.push(
      'WARNING: the compiled song contains NO notes. Nothing moved the playhead, so loopHere() ended the song at beat 0 and every note was discarded. ' +
        'Check that at least one pattern is awaited, and that no sequencing is wrapped in a function that is never awaited.'
    );
  }
  // An instrument with no notes AFTER the marker is not a bug — it plays earlier.
  for (const { channel, name } of s.playFromHereLine ? [] : s.declaredSilent) {
    warnings.push(
      `WARNING: '${name}' (channel ${channel}) is declared with addInstrument but plays NO notes — its part never reaches the timeline. ` +
        'This is a SONG bug, NOT an instrument bug: probing that instrument will show it works perfectly. ' +
        'Almost always the pattern is written AFTER the awaited beat-keeper, so it starts past the end of the song and `loopHere()` discards it. ' +
        'Parts that sound TOGETHER must be scheduled BEFORE the pattern you await — the awaited one comes LAST: ' +
        '`hats.steps(...); bass.steps(...); await kick.steps(...);`'
    );
  }
  const { bars, whole } = songBars(s.lengthBeats, s.beatsPerBar);
  if (s.sounding.length && !whole) {
    warnings.push(
      `WARNING: the song is ${round(s.lengthBeats)} beats — ${round(bars)} bars, NOT a whole number of bars. ` +
        'A looping song that does not end on a bar line makes the loop stumble, and it almost always means a pattern ' +
        'has the wrong number of slots. Check the AWAITED pattern first: it sets the song length. ' +
        'Count its slots (a trailing empty slot does NOT count — JavaScript drops a single trailing comma, ' +
        'so `[c3, , , ]` is THREE slots) and remember `.repeat(n)` gives n+1 copies: slots ÷ stepsPerBeat × (n+1) = beats.'
    );
  }
  const silence = trailingSilence(s);
  if (silence.significant) {
    warnings.push(
      `WARNING: the last sound is at beat ${round(s.lastSoundBeat)} but the song runs to beat ${round(s.lengthBeats)} — ` +
        `${round(silence.beats)} beats (${round(silence.bars)} bars) of SILENCE before it loops. ` +
        'The playhead was advanced further than the parts actually play. Usually the patterns are shorter than intended: ' +
        'at N steps per beat an array of N slots is ONE BEAT, not one bar — a 4/4 bar needs 4×N slots ' +
        '(`steps(4, [...16 slots])`), or use `steps(1, [...4 slots])` for one slot per beat. ' +
        'Check the pattern lengths before adding more repeats.'
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
  if (s.noteCollisions.length) {
    warnings.push(
      `WARNING: ${s.noteCollisions.length} note(s) are CUT by the previous note's note-off — the same pitch is re-attacked ` +
        `on the same channel before its earlier note-off, so the synth gets attack-then-release and the new note does not sound: ` +
        `${collisionExamples(s)}. This happens when a note is held into the next chord that contains the same pitch. ` +
        "Fix it by SHORTENING the earlier note's duration slightly (e.g. 2 → 1.95) so its release clears the next attack."
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
  const exported = [...ts.matchAll(/export class (\w+)/g)].map((m) => m[1]);
  // The transpiler compiles the native Faust class as `<Name>Dsp` (and
  // `<Name>EffectDsp`) so the thin wrappers can keep the public names
  // `<Name>`/`<Name>Channel` — see faust/transpile-core.js. Both are exported,
  // but only the wrappers are the API. Reporting the internal one first made
  // the agent register `new KickDsp(channel)`, which fails to compile with
  // "TS2554: Expected 0 arguments, but got 1". Drop a `*Dsp` name only when
  // its public wrapper is actually present, so an instrument genuinely called
  // e.g. "mydsp" still reports its own class.
  const classes = exported.filter((c) => {
    const m = /^(\w+?)(?:Effect)?Dsp$/.exec(c);
    return !(m && exported.includes(m[1]));
  });
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
