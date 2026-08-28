// Manual A/B bench: does the step-pattern lint + honest bar reporting actually
// make a SMALL model finish this task, and finish it in fewer round-trips?
//
// The task is the one that burned a live NEAR AI session: "kick - hihat - snare
// - hihat, loop it, 120 bpm". Instrument authoring is taken out of the way (the
// three voices are declared as already present) so the run measures exactly what
// changed: the song-arithmetic loop.
//
// Real system prompt, real tool semantics (the browser tools' Node equivalents,
// driving the actual QuickJS-sandboxed compileSong), real model over the Agent
// SDK. The only thing that varies between arms is which tools-core/prompt is
// loaded: the working tree (new) or git HEAD (old).
//
//   MODE=new RUNS=5 MODEL=haiku node bench-drums.mjs          # working tree
//   MODE=old BASE=<git-ref> RUNS=5 node bench-drums.mjs        # control arm
//
// The control arm extracts prompt.js/tools-core.js from BASE (default HEAD) into
// a temp dir, so it needs no setup. Per-run songs and the warnings the model
// actually saw are written to <tmp>/bench-<mode>.json for inspection.
//
// Not part of the test suite — a measurement tool, run by hand.

import { z } from 'zod';
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { compileSong } from '../../wasmaudioworklet/midisequencer/songcompiler.js';
// Measurement always uses the current analysis code — it is the yardstick, not
// the thing under test.
import {
  summarizeSongEvents, declaredInstruments, songBpmFromSource
} from '../../wasmaudioworklet/studio-agent/tools-core.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const MODE = process.env.MODE === 'old' ? 'old' : 'new';
const RUNS = Number(process.env.RUNS || 3);
const MODEL = process.env.MODEL || 'haiku';
const BASE = process.env.BASE || 'HEAD';
const OUT_DIR = process.env.OUT_DIR || tmpdir();

// The control arm is the same two modules as they were at BASE. They import
// nothing from the repo, so a plain `git show` into a temp file is enough.
async function baseModule(relpath) {
  const dest = resolve(OUT_DIR, `base-${relpath.split('/').pop().replace('.js', '.mjs')}`);
  writeFileSync(dest, execFileSync('git', ['show', `${BASE}:${relpath}`], { cwd: REPO_ROOT, maxBuffer: 1 << 24 }));
  return import(pathToFileURL(dest).href);
}

const core = MODE === 'old'
  ? await baseModule('wasmaudioworklet/studio-agent/tools-core.js')
  : await import('../../wasmaudioworklet/studio-agent/tools-core.js');
const { SYSTEM_PROMPT } = MODE === 'old'
  ? await baseModule('wasmaudioworklet/studio-agent/prompt.js')
  : await import('../../wasmaudioworklet/studio-agent/prompt.js');

// What the user asks for, minus the instrument authoring.
const TASK = 'I would like a drum track with kick, hihat and snare.\n\n'
  + 'kick - hihat - snare - hihat\n\n( and loop it ).\n\n120 bpm.';

// Starting song document: the three voices exist on channels 0/1/2, nothing plays.
const START_SONG = `setBPM(110);

addInstrument('kick');   // channel 0
addInstrument('snare');  // channel 1
addInstrument('hihat');  // channel 2

loopHere();
`;

// ---- the objective verdict, computed here and never shown to the model ------
// "kick - hihat - snare - hihat, looped" means: a whole number of bars, all
// three channels sounding across all of them, and in every bar the kick on beat
// 1, hihat on 2 and 4, snare on 3. Note NUMBERS are the instrument's business,
// so only channel and beat position are checked.
async function verdict(source) {
  const fail = (why) => ({ pass: false, why });
  if (!source.trim()) return fail('song document is empty');
  let events;
  try {
    events = await compileSong(source);
  } catch (e) {
    return fail(`does not compile: ${e.message}`);
  }
  const bpm = songBpmFromSource(source);
  if (bpm !== 120) return fail(`BPM is ${bpm}, not 120`);
  const s = summarizeSongEvents(events, bpm, { instruments: declaredInstruments(source) });
  const bars = s.lengthBeats / 4;
  if (!s.lengthBeats) return fail('song has zero length');
  if (Math.abs(bars - Math.round(bars)) > 0.02) return fail(`${s.lengthBeats} beats = ${bars} bars, not whole bars`);

  const msPerBeat = 60000 / bpm;
  const hits = { 0: [], 1: [], 2: [] };
  for (const e of events) {
    const [status, , velocity] = e.message || [];
    if ((status & 0xf0) !== 0x90 || !(velocity > 0)) continue;
    const ch = status & 0x0f;
    if (hits[ch]) hits[ch].push(e.time / msPerBeat);
  }
  for (const ch of [0, 1, 2]) if (!hits[ch].length) return fail(`channel ${ch} plays nothing`);

  const at = (beat) => Math.round(beat * 4) / 4;          // snap ms rounding
  const wrong = [];
  const check = (ch, allowed) => hits[ch]
    .filter((b) => !allowed.includes(at(b) % 4))
    .forEach((b) => wrong.push(`ch${ch}@${at(b)}`));
  check(0, [0]);       // kick   — beat 1 of the bar
  check(1, [2]);       // snare  — beat 3
  check(2, [1, 3]);    // hihat  — beats 2 and 4
  if (wrong.length) return fail(`notes off the kick-hihat-snare-hihat grid: ${wrong.slice(0, 6).join(' ')}`);

  const n = Math.round(bars);
  if (hits[0].length !== n) return fail(`${hits[0].length} kicks over ${n} bars`);
  if (hits[1].length !== n) return fail(`${hits[1].length} snares over ${n} bars`);
  if (hits[2].length !== 2 * n) return fail(`${hits[2].length} hihats over ${n} bars (want ${2 * n})`);
  return { pass: true, why: `${n} bars · ${hits[0].length} kick / ${hits[1].length} snare / ${hits[2].length} hihat` };
}

// ---- the studio tools, Node-side, faithful to client.js's return strings ----
function makeTools(state) {
  const summarize = async () => {
    const events = await compileSong(state.song);
    state.events = events;
    return core.summarizeSongEvents(events, core.songBpmFromSource(state.song),
      { instruments: core.declaredInstruments(state.song) });
  };
  const ok = (text) => ({ content: [{ type: 'text', text: text || 'ok' }] });

  return createSdkMcpServer({
    name: 'studio',
    version: '0.0.1',
    tools: [
      tool('get_song', 'Read the current song document.', {}, async () => ok(state.song)),
      tool('set_song', 'Replace the entire song document. Provide the full new source.',
        { source: z.string() }, async ({ source }) => {
          state.song = source;
          return ok(['song updated', ...core.songSourceWarnings(source)].join(' '));
        }),
      tool('edit_song', 'Surgically find-and-replace in the song document IN PLACE.',
        { old_string: z.string(), new_string: z.string(), replace_all: z.boolean().optional() },
        async (args) => {
          const r = core.applyEditToText(state.song, args);
          if (r.error) return { content: [{ type: 'text', text: `ERROR: ${r.error}` }], isError: true };
          state.song = r.text;
          return ok([`song edited (${r.count} replacement(s))`, ...core.songSourceWarnings(r.text)].join(' '));
        }),
      tool('grep_song', 'Search the song document for a regex.',
        { pattern: z.string(), context: z.number().optional() },
        async (args) => ok(String(core.grepText(state.song, args)))),
      tool('compile', 'Compile the current song + synth and report problems.', {}, async () => {
        try {
          const s = await summarize();
          return ok(['compiled OK', ...core.songEventWarnings(s)].join('\n'));
        } catch (e) {
          return { content: [{ type: 'text', text: `ERROR: ${e.message}` }], isError: true };
        }
      }),
      tool('song_summary', 'What the song ACTUALLY plays, from the compiled MIDI event list.', {},
        async () => {
          try {
            return ok(core.formatSongSummary(await summarize()));
          } catch (e) {
            return { content: [{ type: 'text', text: `ERROR: ${e.message}` }], isError: true };
          }
        }),
    ],
  });
}

const STUDIO = ['get_song', 'set_song', 'edit_song', 'grep_song', 'compile', 'song_summary'];
const ALLOWED = [...STUDIO.map((n) => `mcp__studio__${n}`), 'Read', 'Glob', 'Grep'];

async function runOnce(index) {
  const state = { song: START_SONG };
  const calls = [];
  const warningTexts = [];
  let sawWarning = 0;
  let usage = null;
  let subtype = 'unknown';
  const started = Date.now();

  for await (const m of query({
    prompt: `${TASK}\n\n(The three instruments already exist: kick on channel 0, snare on channel 1, hihat on channel 2. Only the song needs writing.)`,
    options: {
      model: MODEL,
      effort: 'medium',
      cwd: REPO_ROOT,
      systemPrompt: SYSTEM_PROMPT,
      mcpServers: { studio: makeTools(state) },
      allowedTools: ALLOWED,
      disallowedTools: ['Bash', 'Write', 'Edit', 'MultiEdit', 'Agent', 'Task', 'WebSearch', 'WebFetch', 'AskUserQuestion'],
      maxTurns: 40,
    },
  })) {
    if (m.type === 'assistant') {
      for (const c of m.message.content || []) {
        if (c.type === 'tool_use') calls.push(c.name.replace('mcp__studio__', ''));
      }
    } else if (m.type === 'user') {
      for (const c of m.message?.content || []) {
        if (c.type === 'tool_result') {
          const text = Array.isArray(c.content) ? c.content.map((x) => x.text || '').join('') : String(c.content || '');
          for (const line of text.split('\n')) if (line.includes('WARNING')) { sawWarning++; warningTexts.push(line.slice(0, 220)); }
        }
      }
    } else if (m.type === 'result') {
      subtype = m.subtype;
      usage = m.usage;
    }
  }

  const v = await verdict(state.song);
  const out = usage ? usage.output_tokens : 0;
  const inp = usage ? (usage.input_tokens + (usage.cache_read_input_tokens || 0) + (usage.cache_creation_input_tokens || 0)) : 0;
  console.log(`\n--- ${MODE} run ${index + 1}/${RUNS} · ${subtype} · ${((Date.now() - started) / 1000).toFixed(0)}s`);
  console.log(`    tool calls (${calls.length}): ${calls.join(' → ')}`);
  console.log(`    warnings seen: ${sawWarning} · tokens in ${inp} / out ${out}`);
  console.log(`    ${v.pass ? 'PASS' : 'FAIL'}: ${v.why}`);
  return { pass: v.pass, why: v.why, calls, warnings: sawWarning, warningTexts, out, inp, song: state.song };
}

console.log(`bench-drums · MODE=${MODE} · model=${MODEL} · runs=${RUNS} · prompt ${SYSTEM_PROMPT.length} chars`);
const results = [];
for (let i = 0; i < RUNS; i++) results.push(await runOnce(i));

const mean = (f) => (results.reduce((a, r) => a + f(r), 0) / results.length).toFixed(1);
console.log(`\n=== ${MODE}: ${results.filter((r) => r.pass).length}/${RUNS} passed · `
  + `mean ${mean((r) => r.calls.length)} tool calls · mean ${mean((r) => r.out)} output tokens · `
  + `mean ${mean((r) => r.inp)} input tokens`);
results.forEach((r, i) => console.log(`  run ${i + 1}: ${r.pass ? 'PASS' : 'FAIL'} — ${r.why}`));
const jsonPath = resolve(OUT_DIR, `bench-${MODE}.json`);
writeFileSync(jsonPath, JSON.stringify({ mode: MODE, model: MODEL, base: MODE === 'old' ? BASE : null, results }, null, 1));
console.log(`per-run songs and warnings: ${jsonPath}`);
results.forEach((r, i) => console.log(`\n--- run ${i + 1} final song (${r.pass ? 'PASS' : 'FAIL'}) ---\n${r.song}`));
