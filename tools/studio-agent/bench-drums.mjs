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
// Other models go through an OpenAI-compatible endpoint instead of the Agent
// SDK — same system prompt, same tools, same verdict, so the numbers compare:
//
//   BASE_URL=http://localhost:11434/v1 MODEL=gemma4:12b node bench-drums.mjs
//   BASE_URL=https://cloud-api.near.ai/v1 MODEL=Qwen/Qwen3.5-122B-A10B node bench-drums.mjs
//
// The key for a remote endpoint comes from API_KEY or ~/.nearai_api_key.
// Caveat when reading results across backends: this bench exposes the SIX song
// tools it implements, not the app's full 24, so the schema load is ~700 tokens
// rather than ~2.8K. The 10K-token system prompt — the dominant load — is
// identical either way.
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
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { compileSong } from '../../wasmaudioworklet/midisequencer/songcompiler.js';
import { SERVERLESS_PROMPT_SUFFIX } from '../../wasmaudioworklet/studio-agent/nearai-core.js';
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
// Set BASE_URL to drive any OpenAI-compatible server (Ollama, NEAR AI, …)
// instead of the Agent SDK.
const BASE_URL = process.env.BASE_URL || null;
const KEY_FILE = resolve(homedir(), '.nearai_api_key');
const API_KEY = process.env.API_KEY
  || (BASE_URL && !/localhost|127\.0\.0\.1/.test(BASE_URL) && existsSync(KEY_FILE)
      ? readFileSync(KEY_FILE, 'utf8').trim() : '');

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
// Plain async functions returning the tool's text. Both backends drive these:
// the Agent SDK wraps them as MCP tools, the OpenAI path calls them directly.
function toolImpls(state) {
  const summarize = async () => {
    const events = await compileSong(state.song);
    state.events = events;
    return core.summarizeSongEvents(events, core.songBpmFromSource(state.song),
      { instruments: core.declaredInstruments(state.song) });
  };
  return {
    get_song: {
      description: 'Read the current song document.',
      shape: {},
      run: async () => state.song,
    },
    set_song: {
      description: 'Replace the entire song document. Provide the full new source.',
      shape: { source: z.string() },
      run: async ({ source }) => {
        state.song = source ?? '';
        return ['song updated', ...core.songSourceWarnings(state.song)].join(' ');
      },
    },
    edit_song: {
      description: 'Surgically find-and-replace in the song document IN PLACE.',
      shape: { old_string: z.string(), new_string: z.string(), replace_all: z.boolean().optional() },
      run: async (args) => {
        const r = core.applyEditToText(state.song, args);
        if (r.error) throw new Error(r.error);
        state.song = r.text;
        return [`song edited (${r.count} replacement(s))`, ...core.songSourceWarnings(r.text)].join(' ');
      },
    },
    grep_song: {
      description: 'Search the song document for a regex.',
      shape: { pattern: z.string(), context: z.number().optional() },
      run: async (args) => String(core.grepText(state.song, args)),
    },
    compile: {
      description: 'Compile the current song + synth and report problems.',
      shape: {},
      run: async () => ['compiled OK', ...core.songEventWarnings(await summarize())].join('\n'),
    },
    song_summary: {
      description: 'What the song ACTUALLY plays, from the compiled MIDI event list.',
      shape: {},
      run: async () => core.formatSongSummary(await summarize()),
    },
  };
}

// JSON Schema for the OpenAI tool format, from the same zod shapes.
const JSON_SCHEMA = {
  get_song: { type: 'object', properties: {} },
  set_song: { type: 'object', properties: { source: { type: 'string', description: 'full new song source' } }, required: ['source'] },
  edit_song: {
    type: 'object',
    properties: {
      old_string: { type: 'string' }, new_string: { type: 'string' },
      replace_all: { type: 'boolean' },
    },
    required: ['old_string', 'new_string'],
  },
  grep_song: { type: 'object', properties: { pattern: { type: 'string' }, context: { type: 'number' } }, required: ['pattern'] },
  compile: { type: 'object', properties: {} },
  song_summary: { type: 'object', properties: {} },
};

function makeTools(state) {
  const impls = toolImpls(state);
  const ok = (text) => ({ content: [{ type: 'text', text: text || 'ok' }] });
  const wrap = (name) => tool(name, impls[name].description, impls[name].shape, async (args) => {
    try {
      return ok(await impls[name].run(args ?? {}));
    } catch (e) {
      return { content: [{ type: 'text', text: `ERROR: ${e.message}` }], isError: true };
    }
  });
  return createSdkMcpServer({
    name: 'studio',
    version: '0.0.1',
    tools: Object.keys(impls).map(wrap),
  });
}

const STUDIO = ['get_song', 'set_song', 'edit_song', 'grep_song', 'compile', 'song_summary'];
const ALLOWED = [...STUDIO.map((n) => `mcp__studio__${n}`), 'Read', 'Glob', 'Grep'];

// ---- backend B: any OpenAI-compatible endpoint (Ollama, NEAR AI, ...) -------
// Deliberately a local loop rather than nearai-core's runAgentTurn: that one
// always sends the app's full 24-tool schema, and this bench implements six.
// The system prompt and the tools are otherwise identical to backend A.
async function runOnceOpenAI(index) {
  const state = { song: START_SONG };
  const impls = toolImpls(state);
  const calls = [];
  const warningTexts = [];
  let sawWarning = 0;
  let inp = 0, out = 0;
  let stop = 'done';
  const started = Date.now();

  // Match the real serverless path: it sends SYSTEM_PROMPT + the suffix that
  // tells the model these tools are called by their bare names.
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + SERVERLESS_PROMPT_SUFFIX },
    { role: 'user', content: `${TASK}\n\n(The three instruments already exist: kick on channel 0, snare on channel 1, hihat on channel 2. Only the song needs writing.)` },
  ];
  const tools = Object.entries(impls).map(([name, d]) => ({
    type: 'function',
    function: { name, description: d.description, parameters: JSON_SCHEMA[name] },
  }));
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`;

  for (let i = 0; i < 40; i++) {
    // A local model loading 8GB of weights on the first call can blow past
    // undici's 300s headers timeout. That is a stalled request, not a verdict —
    // record it and end the run rather than crashing the whole sweep.
    // STREAM. A local model that has to load 8GB of weights and prefill 10k
    // tokens can take minutes before the first byte, and a non-streamed request
    // dies on undici's 300s headers timeout with nothing to show for it.
    // Streaming makes the server send headers at once, so the only limit is how
    // long we are willing to wait.
    let res;
    try {
      res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers,
        // include_usage puts a final usage-only chunk on the stream; without it
        // most servers report nothing and the token columns read 0.
        body: JSON.stringify({
          model: MODEL, messages, tools, tool_choice: 'auto',
          stream: true, stream_options: { include_usage: true },
        }),
      });
    } catch (e) {
      stop = `request failed: ${e.cause?.code || e.message}`;
      break;
    }
    if (!res.ok) { stop = `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`; break; }

    const msg = { role: 'assistant', content: '', tool_calls: [] };
    let buf = '';
    try {
      for await (const chunk of res.body) {
        buf += Buffer.from(chunk).toString('utf8');
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          let ev; try { ev = JSON.parse(payload); } catch { continue; }
          if (ev.usage) {
            inp += ev.usage.prompt_tokens ?? 0;
            out += ev.usage.completion_tokens ?? 0;
          }
          const d = ev.choices?.[0]?.delta;
          if (!d) continue;
          if (d.content) msg.content += d.content;
          // Tool calls arrive in fragments keyed by index; the name lands in the
          // first, the JSON arguments accumulate across the rest.
          for (const tc of d.tool_calls ?? []) {
            const i = tc.index ?? 0;
            msg.tool_calls[i] ??= { id: tc.id, type: 'function', function: { name: '', arguments: '' } };
            if (tc.id) msg.tool_calls[i].id = tc.id;
            if (tc.function?.name) msg.tool_calls[i].function.name = tc.function.name;
            if (tc.function?.arguments) msg.tool_calls[i].function.arguments += tc.function.arguments;
          }
        }
      }
    } catch (e) {
      stop = `stream failed: ${e.cause?.code || e.message}`;
      break;
    }
    msg.tool_calls = msg.tool_calls.filter(Boolean);
    // A tool call whose arguments never arrived leaves '' here, which is not
    // valid JSON. Left in the history the provider rejects every LATER request
    // with "Assistant tool call function.arguments must be valid JSON", so one
    // empty call ends the run. Same normalisation as nearai-core's forHistory.
    for (const c of msg.tool_calls) {
      try { JSON.parse(c.function.arguments); } catch { c.function.arguments = '{}'; }
    }
    if (!msg.tool_calls.length) delete msg.tool_calls;
    messages.push(msg);

    if (!msg.tool_calls?.length) { stop = 'answered'; break; }
    for (const call of msg.tool_calls) {
      // Same tolerance as nearai-core: accept the MCP-prefixed form.
      const name = (call.function?.name || '').replace(/^mcp__studio__/, '');
      calls.push(name);
      let text;
      try {
        const args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
        text = impls[name] ? await impls[name].run(args) : `ERROR: no such tool "${name}"`;
      } catch (e) {
        text = `ERROR: ${e.message}`;
      }
      for (const line of String(text).split('\n')) {
        if (line.includes('WARNING')) { sawWarning++; warningTexts.push(line.slice(0, 220)); }
      }
      messages.push({ role: 'tool', tool_call_id: call.id, content: String(text) });
    }
    if (i === 39) stop = 'hit the 40-iteration cap';
  }

  const v = await verdict(state.song);
  console.log(`\n--- ${MODEL} run ${index + 1}/${RUNS} · ${stop} · ${((Date.now() - started) / 1000).toFixed(0)}s`);
  console.log(`    tool calls (${calls.length}): ${calls.join(' → ') || '(none)'}`);
  console.log(`    warnings seen: ${sawWarning} · tokens in ${inp} / out ${out}`);
  console.log(`    ${v.pass ? 'PASS' : 'FAIL'}: ${v.why}`);
  return { pass: v.pass, why: v.why, calls, warnings: sawWarning, warningTexts, out, inp, stop, song: state.song };
}

async function runOnceSdk(index) {
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

console.log(`bench-drums · MODE=${MODE} · model=${MODEL} · runs=${RUNS} · prompt ${SYSTEM_PROMPT.length} chars`
  + (BASE_URL ? ` · endpoint ${BASE_URL}` : ' · Agent SDK'));
const runOnce = BASE_URL ? runOnceOpenAI : runOnceSdk;
const results = [];
for (let i = 0; i < RUNS; i++) results.push(await runOnce(i));

const mean = (f) => (results.reduce((a, r) => a + f(r), 0) / results.length).toFixed(1);
console.log(`\n=== ${MODE}: ${results.filter((r) => r.pass).length}/${RUNS} passed · `
  + `mean ${mean((r) => r.calls.length)} tool calls · mean ${mean((r) => r.out)} output tokens · `
  + `mean ${mean((r) => r.inp)} input tokens`);
results.forEach((r, i) => console.log(`  run ${i + 1}: ${r.pass ? 'PASS' : 'FAIL'} — ${r.why}`));
const jsonPath = resolve(OUT_DIR, `bench-${MODE}-${MODEL.replace(/[^\w.-]+/g, '_')}.json`);
writeFileSync(jsonPath, JSON.stringify({ mode: MODE, model: MODEL, base: MODE === 'old' ? BASE : null, results }, null, 1));
console.log(`per-run songs and warnings: ${jsonPath}`);
results.forEach((r, i) => console.log(`\n--- run ${i + 1} final song (${r.pass ? 'PASS' : 'FAIL'}) ---\n${r.song}`));
