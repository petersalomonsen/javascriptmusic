#!/usr/bin/env node
// The bench: run tasks from the corpus through the REAL producer →
// design_instrument → instrument specialist code against the headless studio,
// with a real model, and score each run with checks the model never sees.
//
//   node bench/run.mjs                                   # every task once, Agent SDK, MODEL=haiku (subscription login)
//   node bench/run.mjs --tasks fm-epiano,italo-drums --runs 3
//   node bench/run.mjs --model sonnet --specialist-model haiku
//   node bench/run.mjs --base-url http://localhost:11434/v1 --model gemma4-32k     # any OpenAI-compatible endpoint
//   node bench/run.mjs --base-url https://cloud-api.near.ai/v1 --model Qwen/Qwen3.6-35B-A3B-FP8
//   node bench/run.mjs --prompt-ref HEAD                 # A/B: the prompt modules as they were at a git ref
//
// Every run is written to bench/results/<stamp>/<task>-<n>.json (transcript with
// timings, the documents the model left, the verdict), plus summary.json and a
// table on stdout. Exit code 1 if any run failed.

import fs from 'node:fs';
import path from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHeadlessStudio } from './headless-studio.mjs';
import { baselineOf, verdictOf } from './verdict.mjs';
import { TASKS } from './tasks/index.mjs';
import { REPO } from '../../instrumenttest/headless.mjs';
import { producerQuery, producerSystemPrompt } from '../agent-core.mjs';
import { SDK_PROMPT_SUFFIX } from '../prompt.mjs';
import { runAgentTurn, runSpecialistTurn, toOpenAiTools, SERVERLESS_PROMPT_SUFFIX } from '../../../wasmaudioworklet/studio-agent/nearai-core.js';
import { buildProducerPrompt, buildSpecialistPrompt } from '../../../wasmaudioworklet/studio-agent/prompt.js';
import { toolDefsForRole, toolNamesForRole, specialistRoleForTool } from '../../../wasmaudioworklet/studio-agent/tools-def.js';
import { SPECIALISTS } from '../../../wasmaudioworklet/studio-agent/tools-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- options ------------------------------------------------------------------------
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const TASK_IDS = (opt('tasks', '') || '').split(',').filter(Boolean);
const RUNS = Number(opt('runs', 1));
const MODEL = opt('model', process.env.MODEL || 'haiku');
const SPECIALIST_MODEL = opt('specialist-model', process.env.SPECIALIST_MODEL || '') || undefined;
const BASE_URL = opt('base-url', process.env.BASE_URL || '') || null;
const KEY_FILE = path.resolve(homedir(), '.nearai_api_key');
const API_KEY = opt('api-key', process.env.API_KEY || '')
  || (BASE_URL && !/localhost|127\.0\.0\.1/.test(BASE_URL) && fs.existsSync(KEY_FILE) ? fs.readFileSync(KEY_FILE, 'utf8').trim() : '');
const PROMPT_REF = opt('prompt-ref', '');
const VERBOSE = args.includes('--verbose');
// A model call that hangs must not hang the bench: one run sat 2.8 hours on
// a single turn. Each producer turn (specialist included) is aborted after this.
const TURN_TIMEOUT_MIN = Number(opt('turn-timeout-min', 20));
const OUT = opt('out', path.join(__dirname, 'results', new Date().toISOString().replace(/[:.]/g, '-')));

const tasks = TASK_IDS.length ? TASK_IDS.map((id) => { const t = TASKS.find((x) => x.id === id); if (!t) throw new Error(`no task "${id}" (have: ${TASKS.map((x) => x.id).join(', ')})`); return t; }) : TASKS;

// ---- prompt version under test ----------------------------------------------------
// The default is the working tree. --prompt-ref imports prompt.js (and the two
// modules it needs) as they were at a git ref, so a prompt change can be A/B'd
// against its own past without touching the code under test.
let prompts = { producer: buildProducerPrompt, specialist: (kind) => buildSpecialistPrompt('instrument', { kind }) };
if (PROMPT_REF) {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'bench-prompt-'));
  for (const f of ['prompt.js', 'guides.js', 'tools-core.js']) {
    try { fs.writeFileSync(path.join(dir, f), execFileSync('git', ['show', `${PROMPT_REF}:wasmaudioworklet/studio-agent/${f}`], { cwd: REPO, maxBuffer: 1 << 24 })); }
    catch { /* an older ref may lack guides.js: prompt.js there does not import it */ }
  }
  const mod = await import(pathToFileURL(path.join(dir, 'prompt.js')).href);
  prompts = {
    producer: mod.buildProducerPrompt || (() => mod.SYSTEM_PROMPT),
    specialist: mod.buildSpecialistPrompt ? (kind) => mod.buildSpecialistPrompt('instrument', { kind }) : (() => mod.SYSTEM_PROMPT),
  };
}

// ---- one run: Agent SDK --------------------------------------------------------------
async function runSdk(task, studio, transcript, log, { prompt = task.prompt, sessionId = null } = {}) {
  const backend = { call: (name, a) => studio.call(name, a), repoRoot: REPO };
  const hooks = {
    send: (o) => {
      if (o.t === 'tool') { transcript.push({ kind: 'tool_use', name: o.name, input: o.input, sub: o.sub, t: Date.now() }); log(`     ↳ ${o.name.replace(/^mcp__studio__/, '')} ${JSON.stringify(o.input).slice(0, 80)}`); }
      if (o.t === 'specialist') transcript.push({ kind: 'specialist', ...o, t: Date.now() });
    },
    log: (o) => { if (/^specialist_(text|tool_result|result|error)$/.test(o.kind)) transcript.push({ ...o, sub: 'instrument', t: Date.now() }); },
    dlog: (...a) => { if (VERBOSE) console.log('   ', ...a); },
  };
  const config = { model: MODEL, effort: 'medium', cwd: REPO, specialistModel: SPECIALIST_MODEL, specialistMaxTurns: 40, specialistPrompt: prompts.specialist };
  const systemPrompt = PROMPT_REF ? prompts.producer() + SDK_PROMPT_SUFFIX : producerSystemPrompt('');
  const stats = { turns: 0, costUsd: 0, usage: null, sessionId };
  const controller = new AbortController();
  const timer = setTimeout(() => { console.log(`  TIMEOUT after ${TURN_TIMEOUT_MIN} min — aborting the turn`); controller.abort(); }, TURN_TIMEOUT_MIN * 60000);
  try {
  for await (const m of producerQuery({ prompt, sessionId, systemPrompt, abortController: controller, backend, hooks, config })) {
    if (m.type === 'system' && m.subtype === 'init') stats.sessionId = m.session_id || stats.sessionId;
    if (m.type === 'assistant') {
      for (const b of m.message?.content ?? []) {
        if (b.type === 'text' && b.text) { transcript.push({ kind: 'text', text: b.text, t: Date.now() }); log(`  producer: ${b.text.slice(0, 160).replace(/\n/g, ' ')}`); }
        else if (b.type === 'tool_use') { transcript.push({ kind: 'tool_use', name: b.name, input: b.input, t: Date.now() }); log(`  ⚙ ${b.name.replace(/^mcp__studio__/, '')} ${JSON.stringify(b.input).slice(0, 100)}`); }
      }
    } else if (m.type === 'user') {
      for (const b of m.message?.content ?? []) if (b.type === 'tool_result') {
        const text = Array.isArray(b.content) ? b.content.map((x) => x.text || '').join('') : String(b.content || '');
        transcript.push({ kind: 'tool_result', text, isError: !!b.is_error, t: Date.now() });
        if (/^(design_instrument |master_mix:)/.test(text)) log(`  ↩ ${text.split('\n')[0]}`);
      }
    } else if (m.type === 'result') { stats.turns = m.num_turns; stats.costUsd = m.total_cost_usd; stats.usage = m.usage; }
  }
  } finally {
    clearTimeout(timer);
  }
  if (controller.signal.aborted) stats.error = `turn timed out after ${TURN_TIMEOUT_MIN} min`;
  return stats;
}

// A real session is a conversation: when the producer ends a turn with a
// question, a task can script the user's answer (`followUps`) and the run
// continues on the same session. Each answer is used at most once; the
// number of questions asked is recorded, so a model that asks where the
// human did not need to is visible even when it gets there in the end.
// A turn "asks" when its final message has a line ending in a question mark —
// models often follow their questions with a plan, so the text as a whole
// rarely ends with one.
const endsWithQuestion = (transcript) => {
  const last = [...transcript].reverse().find((t) => t.kind === 'text' && !t.sub);
  // trailing markdown (bold, italics, a closing bracket) must not hide the question mark
  return !!last && last.text.split('\n').some((line) => /\?[\s*_)\]]*$/.test(line.trim()));
};
async function withFollowUps(task, transcript, runTurn) {
  let stats = await runTurn(task.prompt, null);
  const used = new Set();
  let questions = 0;
  while (endsWithQuestion(transcript)) {
    const last = [...transcript].reverse().find((t) => t.kind === 'text' && !t.sub).text;
    const fu = (task.followUps || []).find((f, i) => !used.has(i) && f.match.test(last) && used.add(i));
    if (!fu) break;
    questions++;
    transcript.push({ kind: 'user', text: fu.reply, t: Date.now() });
    console.log(`  user: ${fu.reply.slice(0, 160).replace(/\n/g, ' ')}`);
    const next = await runTurn(fu.reply, stats.sessionId ?? null);
    stats = { ...next, turns: (stats.turns || 0) + (next.turns || 0), costUsd: (stats.costUsd || 0) + (next.costUsd || 0) };
  }
  return { ...stats, questions };
}

// ---- one run: OpenAI-compatible endpoint ------------------------------------------------
async function runOpenAI(task, studio, transcript, log, { prompt = task.prompt, messages = null } = {}) {
  const roleTool = (role) => async (name, a) => {
    if (!toolNamesForRole(role).includes(name)) throw new Error(`tool ${name} is not available to the ${role}`);
    return studio.runTool(name, a);
  };
  messages = messages || [{ role: 'system', content: prompts.producer() + SERVERLESS_PROMPT_SUFFIX }];
  messages.push({ role: 'user', content: prompt });
  const deadline = AbortSignal.timeout(TURN_TIMEOUT_MIN * 60000);
  const fetchWithDeadline = (url, init) => fetch(url, { ...init, signal: deadline });
  const { usage } = await runAgentTurn({
    fetchFn: fetchWithDeadline, baseUrl: BASE_URL, apiKey: API_KEY, model: MODEL, messages,
    tools: toOpenAiTools(toolDefsForRole('producer')),
    runTool: async (name, a) => {
      transcript.push({ kind: 'tool_use', name, input: a, t: Date.now() });
      log(`  ⚙ ${name} ${JSON.stringify(a).slice(0, 100)}`);
      const specialistRole = specialistRoleForTool(name);
      if (specialistRole) {
        transcript.push({ kind: 'specialist', state: 'start', role: specialistRole, t: Date.now() });
        const r = await runSpecialistTurn({
          fetchFn: fetchWithDeadline, baseUrl: BASE_URL, apiKey: API_KEY, model: SPECIALIST_MODEL || MODEL, role: specialistRole, args: a,
          // --prompt-ref A/Bs the INSTRUMENT specialist's prompt; the mastering one is the working tree's
          systemPrompt: PROMPT_REF && specialistRole === 'instrument' ? prompts.specialist(a?.kind || '') : null,
          runTool: (n, x, role) => { transcript.push({ kind: 'tool_use', name: n, input: x, sub: role, t: Date.now() }); log(`     ↳ ${n} ${JSON.stringify(x).slice(0, 80)}`); return roleTool(role)(n, x); },
          probe: (p) => studio.runTool(SPECIALISTS[specialistRole].probeTool, p),
          onText: (t) => transcript.push({ kind: 'specialist_text', text: t, sub: specialistRole, t: Date.now() }),
        });
        transcript.push({ kind: 'specialist', state: 'end', ok: r.ok, t: Date.now() });
        transcript.push({ kind: 'tool_result', text: r.text, t: Date.now() });
        log(`  ↩ ${r.text.split('\n')[0]}`);
        return r.text;
      }
      return roleTool('producer')(name, a);
    },
    onText: (t) => { transcript.push({ kind: 'text', text: t, t: Date.now() }); log(`  producer: ${t.slice(0, 160).replace(/\n/g, ' ')}`); },
  });
  return { usage, costUsd: null, turns: null, messages };
}

// ---- main ------------------------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true });
const arm = BASE_URL ? `${BASE_URL} · ${MODEL}` : `Agent SDK · ${MODEL}`;
console.log(`bench · ${arm}${SPECIALIST_MODEL ? ` · specialist ${SPECIALIST_MODEL}` : ''}${PROMPT_REF ? ` · prompt @ ${PROMPT_REF}` : ''} · ${tasks.length} task(s) × ${RUNS} run(s)\n`);
const summary = [];
for (const task of tasks) {
  const rows = [];
  for (let i = 0; i < RUNS; i++) {
    console.log(`▶ ${task.id} (${i + 1}/${RUNS}): ${task.title}`);
    const log = (line) => console.log(line);
    const studio = createHeadlessStudio({ project: task.project() });
    const baseline = await baselineOf(studio);
    const callsBefore = studio.calls.length;
    const transcript = [];
    const started = Date.now();
    let stats = {};
    try {
      stats = await withFollowUps(task, transcript, BASE_URL
        ? (prompt, _sid) => runOpenAI(task, studio, transcript, log, { prompt, messages: stats.messages || null }).then((r) => { stats.messages = r.messages; return r; })
        : (prompt, sessionId) => runSdk(task, studio, transcript, log, { prompt, sessionId }));
    } catch (e) {
      stats = { error: String(e?.message || e) };
      console.log(`  RUN ERROR: ${stats.error}`);
    }
    const secs = (Date.now() - started) / 1000;
    const toolCalls = studio.calls.length - callsBefore;
    const v = await verdictOf(task, studio, baseline, transcript);
    const spec = transcript.filter((t) => t.kind === 'specialist_result');
    const row = { task: task.id, run: i + 1, pass: v.pass, secs, toolCalls, turns: stats.turns ?? null, costUsd: stats.costUsd ?? null, questions: stats.questions || 0,
      specialistRuns: spec.length, specialistTurns: spec.reduce((s, x) => s + (x.turns || 0), 0), specialistCostUsd: spec.reduce((s, x) => s + (x.costUsd || 0), 0),
      error: stats.error || null, checks: v.results };
    rows.push(row);
    console.log(`  ${v.pass ? 'PASS' : 'FAIL'} · ${secs.toFixed(0)}s · ${toolCalls} tool calls${row.turns != null ? ` · ${row.turns} turns` : ''}${row.questions ? ` · ${row.questions} question(s) asked` : ''}${row.costUsd != null ? ` · $${(row.costUsd + row.specialistCostUsd).toFixed(2)}` : ''}`);
    for (const r of v.results) if (!r.ok) console.log(`    ✗ ${r.name}: ${r.why}`);
    fs.writeFileSync(path.join(OUT, `${task.id}-${i + 1}.json`), JSON.stringify({
      ...row, model: MODEL, specialistModel: SPECIALIST_MODEL || null, baseUrl: BASE_URL, promptRef: PROMPT_REF || null, prompt: task.prompt,
      usage: stats.usage || null, transcript,
      toolCallLog: studio.calls.slice(callsBefore).map((c) => ({ name: c.name, ms: c.ms, ok: c.ok, result: String(c.result).slice(0, 300) })),
      documents: { song: studio.state.song, synth: studio.state.synth, faust: Object.fromEntries([...studio.state.faust].map(([k, f]) => [k, f.dsp])) },
    }, null, 1));
    console.log('');
  }
  summary.push({ task: task.id, passed: rows.filter((r) => r.pass).length, runs: rows.length,
    medianSecs: rows.map((r) => r.secs).sort((a, b) => a - b)[Math.floor(rows.length / 2)],
    meanToolCalls: rows.reduce((s, r) => s + r.toolCalls, 0) / rows.length,
    questions: rows.reduce((s, r) => s + (r.questions || 0), 0),
    meanCostUsd: rows.every((r) => r.costUsd != null) ? rows.reduce((s, r) => s + r.costUsd + r.specialistCostUsd, 0) / rows.length : null,
    rows });
}

console.log(`=== ${arm}${PROMPT_REF ? ` · prompt @ ${PROMPT_REF}` : ''}`);
console.log('task'.padEnd(18) + 'pass'.padStart(7) + 'median s'.padStart(10) + 'tool calls'.padStart(12) + 'asked'.padStart(7) + 'cost $'.padStart(9));
for (const s of summary) {
  console.log(s.task.padEnd(18) + `${s.passed}/${s.runs}`.padStart(7) + s.medianSecs.toFixed(0).padStart(10) + s.meanToolCalls.toFixed(1).padStart(12) + String(s.questions).padStart(7) + (s.meanCostUsd == null ? '-' : s.meanCostUsd.toFixed(2)).padStart(9));
}
fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify({ arm, model: MODEL, specialistModel: SPECIALIST_MODEL || null, baseUrl: BASE_URL, promptRef: PROMPT_REF || null, runs: RUNS, summary }, null, 1));
console.log(`\nresults: ${path.relative(REPO, OUT)}`);
process.exit(summary.every((s) => s.passed === s.runs) ? 0 : 1);
