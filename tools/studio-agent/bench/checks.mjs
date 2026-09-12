// The objective half of the bench: checks over what the agents MADE — the
// compiled MIDI events, the documents, a probe of the synth, and the
// transcript. Each check returns { ok, why }. They are computed after the run
// and never shown to the model, and they report facts (counts, beats, Hz), so
// a human can see WHY a run failed rather than only that it did.
//
// A check runs with a context:
//   ctx.studio        the headless studio after the run
//   ctx.baseline      { song, synth, faust, events, notes, summary } before the run
//   ctx.events        the compiled MIDI events after the run (null if the final compile failed)
//   ctx.notes         note list after the run (see noteList)
//   ctx.summary       summarizeSongEvents() of the final song
//   ctx.finalCompile  { ok, result } of the compile the runner does at the end
//   ctx.transcript    [{ kind: 'text'|'tool_use'|'tool_result'|'specialist'…, name, sub, text }]
//   ctx.probe(channel, notes?) → parsed probe lines [{ note, silent, peak, dominantHz, expectedHz, centroidHz }]

export const ok = (why = '') => ({ ok: true, why });
export const fail = (why) => ({ ok: false, why });

/** Beats snapped to the nearest 1/q so ms rounding does not split 0.248 from 0.25. */
export const snap = (beat, q = 8) => Math.round(beat * q) / q;

/** Pair note-ons with their note-offs: [{ channel, note, beat, velocity, duration }], beats in song time. */
export function noteList(events, bpm) {
  const msPerBeat = 60000 / bpm;
  const open = new Map();
  const out = [];
  for (const e of events || []) {
    const [status, note, velocity] = e.message || [];
    if (status === undefined) continue;
    const type = status & 0xf0, channel = status & 0x0f;
    const key = `${channel}:${note}`;
    if (type === 0x90 && velocity > 0) {
      const n = { channel, note, beat: e.time / msPerBeat, velocity, duration: null };
      open.set(key, n); out.push(n);
    } else if (type === 0x80 || (type === 0x90 && velocity === 0)) {
      const n = open.get(key);
      if (n) { n.duration = e.time / msPerBeat - n.beat; open.delete(key); }
    }
  }
  return out.sort((a, b) => a.beat - b.beat || a.channel - b.channel || a.note - b.note);
}

export const onChannel = (notes, channel) => notes.filter((n) => n.channel === channel);
export const inRange = (notes, lo, hi) => notes.filter((n) => n.beat >= lo - 1e-6 && n.beat < hi - 1e-6);

/** Same notes (beat, pitch, velocity, duration) within tolerances, order-free. */
export function sameNotes(a, b, { beatTol = 0.02, durTol = 0.06 } = {}) {
  if (a.length !== b.length) return { same: false, why: `${a.length} vs ${b.length} notes` };
  const key = (n) => `${n.channel}:${n.note}`;
  const sortKey = (n) => [n.beat, n.channel, n.note];
  const A = [...a].sort((x, y) => sortKey(x)[0] - sortKey(y)[0] || key(x).localeCompare(key(y)));
  const B = [...b].sort((x, y) => sortKey(x)[0] - sortKey(y)[0] || key(x).localeCompare(key(y)));
  for (let i = 0; i < A.length; i++) {
    const x = A[i], y = B[i];
    if (key(x) !== key(y) || Math.abs(x.beat - y.beat) > beatTol || x.velocity !== y.velocity
      || (x.duration !== null && y.duration !== null && Math.abs(x.duration - y.duration) > durTol)) {
      return { same: false, why: `first difference at beat ${snap(x.beat)}: ch${x.channel} note ${x.note} v${x.velocity} d${x.duration?.toFixed(2)} vs ch${y.channel} note ${y.note} v${y.velocity} d${y.duration?.toFixed(2)}` };
    }
  }
  return { same: true, why: `${a.length} notes identical` };
}

export const named = (name, run) => ({ name, run });

// ---- generic checks ---------------------------------------------------------------
export const compiles = () => named('compiles', ({ finalCompile }) =>
  finalCompile.ok ? ok(finalCompile.result.split('\n')[0]) : fail(finalCompile.result.split('\n')[0]));

export const wholeBars = (beatsPerBar = 4) => named('whole bars', ({ summary }) => {
  if (!summary) return fail('no compiled song');
  const bars = summary.lengthBeats / beatsPerBar;
  return Math.abs(bars - Math.round(bars)) < 0.02 ? ok(`${bars} bars`) : fail(`${summary.lengthBeats} beats = ${bars} bars`);
});

export const bpmIs = (bpm) => named(`bpm is ${bpm}`, ({ studio }) => {
  const m = /setBPM\((\d+)\)/.exec(studio.state.song);
  return m && Number(m[1]) === bpm ? ok() : fail(`setBPM(${m ? m[1] : '?'})`);
});

export const songUnchanged = () => named('song untouched', ({ studio, baseline }) =>
  studio.state.song === baseline.song ? ok() : fail('the song document was modified'));
export const synthUnchanged = () => named('synth untouched', ({ studio, baseline }) =>
  studio.state.synth === baseline.synth ? ok() : fail('synth.ts was modified'));

/** These channels play exactly what they played before (the scope check for a targeted edit). */
export const channelsUnchanged = (channels) => named(`channels ${channels.join(',')} unchanged`, ({ notes, baseline }) => {
  if (!notes) return fail('no compiled song');
  for (const ch of channels) {
    const r = sameNotes(onChannel(baseline.notes, ch), onChannel(notes, ch));
    if (!r.same) return fail(`channel ${ch}: ${r.why}`);
  }
  return ok();
});

/** design_instrument was called exactly n times (0 for a song-only task: delegating there is scope creep). */
export const delegations = (n) => named(`design_instrument called ${n}×`, ({ transcript }) => {
  const count = transcript.filter((t) => t.kind === 'tool_use' && !t.sub && t.name.replace(/^mcp__studio__/, '') === 'design_instrument').length;
  return count === n ? ok() : fail(`called ${count}×`);
});

export const producerWroteNoDsp = () => named('producer wrote no .dsp', ({ transcript }) =>
  transcript.some((t) => t.kind === 'tool_use' && !t.sub && /write_faust|edit_faust/.test(t.name)) ? fail('the producer called a .dsp writer itself') : ok());

/** If a design_instrument result said FAILED, the final message must say so. */
export const honest = () => named('honest about failures', ({ transcript }) => {
  const failed = transcript.filter((t) => t.kind === 'tool_result' && /^design_instrument .*: FAILED/.test(t.text || ''));
  if (!failed.length) return ok('nothing failed');
  const finalText = [...transcript].reverse().find((t) => t.kind === 'text' && !t.sub)?.text || '';
  return /fail|could not|couldn't|not verified|silent|unable|didn't work|did not work/i.test(finalText) ? ok('failure relayed') : fail('a FAILED verdict was not relayed in the final message');
});

export const hasFaust = (pattern) => named(`faust/${pattern} exists`, ({ studio }) => {
  const re = pattern instanceof RegExp ? pattern : new RegExp(`^${pattern}$`);
  const hit = [...studio.state.faust.keys()].find((k) => re.test(k));
  return hit ? ok(`faust/${hit}.dsp`) : fail(`instruments: ${[...studio.state.faust.keys()].join(', ') || 'none'}`);
});

export const audible = (channel, note = 'c4') => named(`channel ${channel} audible`, async ({ probe }) => {
  const r = (await probe(channel, note))[0];
  if (!r) return fail('no probe result');
  return r.silent ? fail('SILENT') : ok(`peak ${r.peak}`);
});

export const centroidBetween = (channel, lo, hi, note = 'c4') => named(`channel ${channel} centroid in ${lo}-${hi}Hz`, async ({ probe }) => {
  const r = (await probe(channel, note))[0];
  if (!r || r.silent) return fail(r ? 'SILENT' : 'no probe result');
  return r.centroidHz >= lo && r.centroidHz <= hi ? ok(`${r.centroidHz}Hz`) : fail(`${r.centroidHz}Hz`);
});

/** Every note-on of a channel sits at one of the allowed positions within the bar (mod 4), optionally within a beat range. */
export const onsetsOnlyAt = (channel, allowed, { lo = -Infinity, hi = Infinity, label } = {}) => named(label || `ch${channel} onsets only at ${allowed.join('/')} of the bar`, ({ notes }) => {
  if (!notes) return fail('no compiled song');
  const ns = inRange(onChannel(notes, channel), lo, hi);
  if (!ns.length) return fail(`channel ${channel} plays nothing`);
  const wrong = ns.filter((n) => !allowed.some((a) => Math.abs(((snap(n.beat) % 4) + 4) % 4 - a) < 1e-6));
  return wrong.length ? fail(`${wrong.length} off-grid: ${wrong.slice(0, 5).map((n) => snap(n.beat)).join(' ')}`) : ok(`${ns.length} notes`);
});

/** Parse the text of probe_instrument into numbers. */
export function parseProbe(text) {
  return String(text || '').split('\n').map((line) => {
    const silent = /^ch(\d+) (\S+): SILENT/.exec(line);
    if (silent) return { channel: +silent[1], note: silent[2], silent: true };
    const m = /^ch(\d+) (\S+): peak ([\d.]+), rms ([\d.]+), dominant ([\d.]+)Hz \(note is ([\d.]+)Hz\), centroid (\d+)Hz/.exec(line);
    if (!m) return null;
    return { channel: +m[1], note: m[2], silent: false, peak: +m[3], rms: +m[4], dominantHz: +m[5], expectedHz: +m[6], centroidHz: +m[7] };
  }).filter(Boolean);
}

/** Run a task's checks; returns { pass, results: [{ name, ok, why }] }. */
export async function runChecks(checks, ctx) {
  const results = [];
  for (const c of checks) {
    let r;
    try { r = await c.run(ctx); } catch (e) { r = fail(`check threw: ${e?.message || e}`); }
    results.push({ name: c.name, ...r });
  }
  return { pass: results.every((r) => r.ok), results };
}
