// studio-agent — local process that drives the in-browser WebAssembly Music app.
//
// The browser (chat panel) connects over WebSocket. When the user sends a chat
// message we run the Claude Agent SDK; the agent's custom tools (set_song,
// compile, play, …) are proxied back over the SAME socket to execute INSIDE the
// browser (on the editors / compiler / audio worklet). The agent reads example
// files from this repo via its built-in Read/Glob/Grep tools.
//
// AUTH: uses your Claude Code login (Max/Pro subscription). Do NOT set
// ANTHROPIC_API_KEY (it would switch you to per-token API billing).
//
// Run:  npm install && npm start    (listens on ws://localhost:17891)

import { WebSocketServer } from 'ws';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { mkdirSync, createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { SYSTEM_PROMPT, SDK_PROMPT_SUFFIX } from './prompt.mjs';
import { toolDefsFor, sdkToolNames } from '../../wasmaudioworklet/studio-agent/tools-def.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..'); // tools/studio-agent -> repo root
const PORT = process.env.STUDIO_AGENT_PORT || 17891;
// Tool timeouts are measured from when the browser actually STARTS executing a
// call (it acks with tool_started once the serial queue reaches it) — queue
// wait must not count, or a cheap read_faust queued behind a heavy transpile
// gets falsely timed out. Heavy tools (Faust transpile / full compile) run
// 100s+ legitimately on big chains, so they get a much larger run budget.
const TOOL_RUN_TIMEOUT_MS = 120000;            // normal tools, once started
const HEAVY_TOOL_RUN_TIMEOUT_MS = 360000;      // write_faust / compile, once started
const TOOL_START_TIMEOUT_MS = 600000;          // max time waiting in the browser queue
const HEAVY_TOOLS = new Set(['write_faust', 'compile']);
// Optional model override for speed/depth tradeoff, e.g. STUDIO_AGENT_MODEL=sonnet
// (faster) vs opus (deeper). Unset = the SDK/Claude Code default.
const MODEL = process.env.STUDIO_AGENT_MODEL || undefined;
// Reasoning effort. Turn latency here is dominated by the NUMBER of model
// round-trips, not by thinking depth, and lower effort buys fewer and more
// consolidated tool calls plus less preamble — so it is the cheapest latency
// win available. 'medium' keeps musical judgement while trimming the tail;
// raise to 'high'/'xhigh' for gnarlier work, drop to 'low' for a rehearsed set.
const EFFORT = process.env.STUDIO_AGENT_EFFORT || 'medium';
// Proactive compaction threshold (tokens of per-call context). The SDK only
// auto-compacts near the model's context LIMIT (~1M on opus) — far beyond the
// point where every turn is already slow and expensive (a ~570k-token session
// was thinking 35-80s per stretch at $1-6/turn). When a turn ends above this,
// we run /compact on the session right away, while the user reads the reply.
const COMPACT_THRESHOLD = Number(process.env.STUDIO_AGENT_COMPACT_THRESHOLD || 200000);

// ---- session logging: one JSONL file per server boot, for later review ------
const LOG_DIR = resolve(__dirname, 'logs');
mkdirSync(LOG_DIR, { recursive: true });
const LOG_PATH = resolve(LOG_DIR, `session-${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`);
const logStream = createWriteStream(LOG_PATH, { flags: 'a' });
const trunc = (s, n = 2000) => (typeof s === 'string' && s.length > n ? `${s.slice(0, n)}…[+${s.length - n} chars]` : s);
const truncInput = (input) => {
  if (!input || typeof input !== 'object') return input;
  const o = {};
  for (const k of Object.keys(input)) o[k] = trunc(input[k]);
  return o;
};
function logEvent(obj) {
  try { logStream.write(JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n'); } catch { /* never let logging break a turn */ }
}

if (process.env.ANTHROPIC_API_KEY) {
  console.warn(
    '\n⚠️  ANTHROPIC_API_KEY is set — the SDK will bill per-token, NOT your\n' +
    '   Max subscription. Run `unset ANTHROPIC_API_KEY` to use the subscription.\n'
  );
}

// Tools the agent may use: our browser-proxied studio tools + read-only repo
// access. The tool set itself is declared once in
// wasmaudioworklet/studio-agent/tools-def.js and shared with the in-browser
// NEAR AI provider, so adding a tool cannot reach only one of them.
const STUDIO_TOOLS = sdkToolNames();
const ALLOWED = new Set([
  ...STUDIO_TOOLS.map((n) => `mcp__studio__${n}`),
  'Read', 'Glob', 'Grep',
]);
// Built-in tools that cause the agent to thrash on this task — keep it focused.
const DISALLOWED = ['Bash', 'BashOutput', 'KillShell', 'Agent', 'Task', 'Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'WebSearch', 'WebFetch', 'AskUserQuestion'];

function safeResolve(p) {
  const full = resolve(REPO_ROOT, p);
  if (full !== REPO_ROOT && !full.startsWith(REPO_ROOT + '/')) throw new Error(`path "${p}" escapes the repo`);
  return full;
}

// ---- WebSocket plumbing: one browser at a time -----------------------------
let pending = new Map();   // id -> { resolve, started, fail }
let nextId = 1;
let chatChain = Promise.resolve(); // serialize chat turns (and post-turn auto-compact)
// The turn currently in flight, so the browser's stop button can end it. A live
// set cannot wait out a turn that has gone wrong: the SDK's own interrupt() is
// streaming-input only, but Options.abortController works with a plain prompt.
let currentTurn = null;    // { controller, aborted }

// Abort the running turn: tear down the query, then settle every tool call
// still waiting on the browser. Without that second half the SDK's tool handler
// keeps awaiting a promise that will never resolve.
function abortCurrentTurn() {
  if (!currentTurn || currentTurn.aborted) return false;
  currentTurn.aborted = true;
  try { currentTurn.controller.abort(); } catch { /* already torn down */ }
  for (const entry of [...pending.values()]) entry.fail('turn stopped by the user');
  return true;
}

function callBrowser(ws, name, args) {
  return new Promise((resolveCall, rejectCall) => {
    const id = nextId++;
    const runBudgetMs = HEAVY_TOOLS.has(name) ? HEAVY_TOOL_RUN_TIMEOUT_MS : TOOL_RUN_TIMEOUT_MS;
    let timer = null;
    const fail = (msg) => {
      if (!pending.has(id)) return;
      pending.delete(id);
      rejectCall(new Error(msg));
    };
    const entry = {
      fail: (msg) => { if (timer) clearTimeout(timer); fail(msg); },
      resolve: (res) => { if (timer) clearTimeout(timer); pending.delete(id); resolveCall(res); },
      // Browser acked that execution began (the serial queue reached this call):
      // swap the queue-wait timer for the per-tool run timer.
      started: () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fail(
          `browser tool "${name}" timed out after ${runBudgetMs / 1000}s of execution. The browser may STILL be finishing it — do NOT resend the same call; verify the result first (e.g. read_faust / grep).`
        ), runBudgetMs);
      },
    };
    pending.set(id, entry);
    ws.send(JSON.stringify({ t: 'tool_call', id, name, args: args || {} }));
    timer = setTimeout(() => fail(
      `browser tool "${name}" did not start within ${TOOL_START_TIMEOUT_MS / 1000}s — earlier tool calls are still running in the browser queue. Do NOT retry; wait for them to finish.`
    ), TOOL_START_TIMEOUT_MS);
  });
}

// The shared tool defs carry JSON Schema (what the OpenAI-compatible NEAR AI
// path sends); the Agent SDK wants a zod shape. Only the primitive types the
// defs actually use are supported — anything else is a mistake worth throwing on.
function zodShape(parameters) {
  const required = new Set(parameters.required || []);
  const shape = {};
  for (const [name, spec] of Object.entries(parameters.properties || {})) {
    let field;
    if (spec.type === 'string') field = z.string();
    else if (spec.type === 'number') field = z.number();
    else if (spec.type === 'boolean') field = z.boolean();
    else throw new Error(`studio tool schema: unsupported type "${spec.type}" for "${name}"`);
    if (spec.description) field = field.describe(spec.description);
    shape[name] = required.has(name) ? field : field.optional();
  }
  return shape;
}

// ---- Build the in-process MCP tools, bound to one browser socket -----------
function makeStudioServer(ws) {
  const proxy = (name, description, shape) =>
    tool(name, description, shape, async (args) => {
      try {
        const res = await callBrowser(ws, name, args);
        if (!res.ok) {
          return { content: [{ type: 'text', text: `ERROR: ${res.result ?? 'tool failed'}` }], isError: true };
        }
        const text = typeof res.result === 'string' ? res.result : JSON.stringify(res.result);
        return { content: [{ type: 'text', text: text || 'ok' }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `ERROR: ${e?.message || e}` }], isError: true };
      }
    });

  // Load a repo file straight into an editor: the bytes are read server-side and
  // pushed to the browser, so a huge bundle never has to pass through the model.
  const loadInto = (def) =>
    tool(def.name, `${def.description} The file content is read here and sent to the browser for you.`,
      zodShape(def.parameters),
      async ({ path }) => {
        try {
          const content = await readFile(safeResolve(path), 'utf8');
          const res = await callBrowser(ws, def.target === 'synth' ? 'set_synth' : 'set_song', { source: content });
          if (!res.ok) return { content: [{ type: 'text', text: `ERROR: ${res.result ?? 'load failed'}` }], isError: true };
          return { content: [{ type: 'text', text: `loaded ${path} (${content.split('\n').length} lines) into the ${def.target} editor` }] };
        } catch (e) {
          return { content: [{ type: 'text', text: `ERROR: ${e?.message || e}` }], isError: true };
        }
      });

  return createSdkMcpServer({
    name: 'studio',
    version: '1.0.0',
    // Pin the studio tool schemas into the turn-1 prompt instead of letting
    // them sit behind tool search. Deferred schemas cost an extra ToolSearch
    // round-trip before the agent can act at all — measured at ~1.4x the
    // median turn and a much worse tail on real sessions.
    alwaysLoad: true,
    tools: [
      ...toolDefsFor('browser').map((d) => proxy(d.name, d.description, zodShape(d.parameters))),
      ...toolDefsFor('loadfile').map((d) => loadInto(d)),
    ],
  });
}

// ---- Run one chat turn through the agent -----------------------------------
const t0 = () => new Date().toISOString().slice(11, 23);
const dlog = (...a) => console.log(`  [${t0()}]`, ...a);

// The project's kit (its AGENT.md, or the shipped default) arrives from the
// browser — the server has no view of OPFS. It goes into the SYSTEM PROMPT so
// the model has the project's instruments and conventions from turn 0 instead
// of spending a round-trip discovering them. Identical text every turn keeps
// the cached prefix intact; a changed kit costs one cold turn, as it should.
function systemPromptWith(kit) {
  // This path drives the tools over MCP, so it owns the mcp__studio__ naming rule.
  const base = SYSTEM_PROMPT + SDK_PROMPT_SUFFIX;
  if (!kit || !kit.trim()) return base;
  return `${base}\n\n## Project kit (from the project's AGENT.md)\n\n` +
    `These are the user's instructions for THIS project — instrument sources, ` +
    `channel layout and conventions. Prefer them over generic defaults, and use ` +
    `them directly instead of searching the repository for the same information.` +
    `\n\n${kit}`;
}

async function handleChat(ws, { text, sessionId, summary, kit }, isRetry = false) {
  const send = (obj) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj)); };
  const studio = makeStudioServer(ws);
  const systemPrompt = systemPromptWith(kit);
  let sid = sessionId || null;
  let contextTokens = 0; // last model call's input size (fresh + cached)
  dlog('chat:', JSON.stringify(text).slice(0, 100), sessionId ? `(resume ${sessionId.slice(0, 8)})` : '(new)',
    kit ? `kit ${kit.length} chars` : 'NO KIT');
  logEvent({ kind: 'chat', sessionId: sid, resumed: !!sessionId, text, kitChars: kit ? kit.length : 0 });

  // One controller per turn; the stop button aborts through it. A retry reuses
  // the same slot, so an abort during the retry still lands.
  const controller = new AbortController();
  currentTurn = { controller, aborted: false };

  try {
    for await (const m of query({
      prompt: text,
      options: {
        abortController: controller,
        resume: sessionId || undefined,
        model: MODEL,
        effort: EFFORT,
        cwd: REPO_ROOT,
        systemPrompt,
        mcpServers: { studio },
        allowedTools: [...ALLOWED],
        disallowedTools: DISALLOWED,
        canUseTool: async (name, input) => {
          const ok = ALLOWED.has(name);
          dlog(ok ? 'ALLOW' : 'DENY ', name, ok ? '' : '(not in allowlist)');
          return ok
            ? { behavior: 'allow', updatedInput: input }
            : { behavior: 'deny', message: `${name} is not available to the studio agent; use only Read/Glob/Grep and the studio tools (set_synth/set_song/compile/play/stop).` };
        },
        maxTurns: 60,
      },
    })) {
      if (m.type === 'system' && m.subtype === 'init') {
        sid = m.session_id || sid;
        dlog('session init', m.session_id?.slice(0, 8), 'tools:', (m.tools || []).length);
        logEvent({ kind: 'session', sessionId: sid, toolCount: (m.tools || []).length });
        send({ t: 'session', sessionId: m.session_id });
      } else if (m.type === 'system' && m.subtype === 'compact_boundary') {
        // The SDK compacted the conversation (auto near the context limit, or
        // the user sent /compact). Surface it in the chat panel.
        dlog('context compacted', JSON.stringify(m.compact_metadata || {}));
        logEvent({ kind: 'compact', sessionId: sid, metadata: m.compact_metadata });
        send({ t: 'compact', metadata: m.compact_metadata });
        await sendCompactSummary(send, sid);
      } else if (m.type === 'assistant') {
        // Each assistant message's usage reports THIS call's full input size
        // (fresh + cached) — i.e. the session's current context footprint.
        const u = m.message?.usage;
        if (u) contextTokens = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
        for (const block of m.message?.content ?? []) {
          if (block.type === 'text' && block.text) { dlog('text:', block.text.slice(0, 80).replace(/\n/g, ' ')); logEvent({ kind: 'text', sessionId: sid, text: block.text }); send({ t: 'text', text: block.text }); }
          else if (block.type === 'tool_use') { dlog('tool_use →', block.name, JSON.stringify(block.input).slice(0, 80)); logEvent({ kind: 'tool_use', sessionId: sid, name: block.name, input: truncInput(block.input) }); send({ t: 'tool', name: block.name, input: block.input }); }
        }
      } else if (m.type === 'user') {
        for (const block of m.message?.content ?? []) {
          if (block.type === 'tool_result') {
            const txt = Array.isArray(block.content) ? block.content.map(c => c.text || '').join('') : String(block.content || '');
            dlog('tool_result', block.is_error ? '(ERROR)' : '', txt.slice(0, 80).replace(/\n/g, ' '));
            logEvent({ kind: 'tool_result', sessionId: sid, isError: !!block.is_error, text: trunc(txt, 1000) });
          }
        }
      } else if (m.type === 'result') {
        dlog('RESULT', m.subtype, 'turns:', m.num_turns, 'cost:', m.total_cost_usd);
        // usage carries the per-turn token counts (input incl. cache reads) —
        // logged so growing context is visible when reviewing a session.
        logEvent({ kind: 'result', sessionId: sid, subtype: m.subtype, turns: m.num_turns, costUsd: m.total_cost_usd, usage: m.usage });
        send({ t: 'done', subtype: m.subtype });
      }
    }
    dlog('query loop ended');
    // An aborted query can simply END rather than throw, so the stopped case is
    // handled here as well as in the catch below.
    if (currentTurn?.aborted) {
      dlog('turn stopped by the user');
      send({ t: 'stopped', sessionId: sid });
      return;
    }
    if (sid && contextTokens > COMPACT_THRESHOLD) {
      await autoCompact(send, sid, contextTokens, systemPrompt);
    }
  } catch (e) {
    const emsg = String(e?.message || e);
    // A stop is not a failure: report it as one and the agent looks broken, and
    // the chat fills with an error the user deliberately caused.
    if (currentTurn?.aborted) {
      dlog('turn stopped by the user (query threw:', emsg.slice(0, 60), ')');
      logEvent({ kind: 'stopped', sessionId: sid });
      send({ t: 'stopped', sessionId: sid });
      return;
    }
    // SDK sessions are per-machine: a repo opened on another machine carries a
    // sessionId this machine has never seen. Start FRESH, seeded with the
    // compact summary the browser keeps in the repo (studioagent-session.json).
    if (!isRetry && sessionId && /no conversation found/i.test(emsg)) {
      dlog('resume failed — starting a fresh session' + (summary ? ' from the saved summary' : ''));
      logEvent({ kind: 'freshsession', sessionId, hadSummary: !!summary });
      send({ t: 'freshsession' });
      const prompt = summary
        ? `A previous session (possibly on another machine) was compacted to this summary:\n\n${summary}\n\n---\nContinue from that context. The user's request:\n${text}`
        : text;
      return handleChat(ws, { text: prompt, sessionId: null, kit }, true);
    }
    dlog('EXCEPTION', emsg);
    logEvent({ kind: 'error', sessionId: sid, error: emsg });
    send({ t: 'error', error: emsg });
  } finally {
    // Only clear the slot if this turn still owns it — a retry replaced it.
    if (currentTurn?.controller === controller) currentTurn = null;
  }
}

// After a compaction, pull the summary text out of the SDK's session store so
// the browser can persist it into the OPFS repo: SDK sessions are per-machine,
// so a repo cloned elsewhere can't resume the sessionId — but it CAN seed a
// fresh session from this summary. The session jsonl marks the summary entry
// with isCompactSummary: true.
async function extractCompactSummary(sid) {
  try {
    const projDir = resolve(homedir(), '.claude', 'projects', REPO_ROOT.replace(/[/.]/g, '-'));
    const lines = (await readFile(resolve(projDir, `${sid}.jsonl`), 'utf8')).trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      let e;
      try { e = JSON.parse(lines[i]); } catch { continue; }
      if (e.isCompactSummary) {
        const c = e.message?.content;
        return typeof c === 'string' ? c : (Array.isArray(c) ? c.map((b) => b.text || '').join('') : null);
      }
    }
  } catch (e) {
    dlog('could not extract compact summary:', e?.message || e);
  }
  return null;
}

async function sendCompactSummary(send, sid) {
  const summary = await extractCompactSummary(sid);
  if (summary) {
    dlog(`compact summary extracted (${summary.length} chars) → browser`);
    send({ t: 'summary', text: summary });
  }
}

// Run /compact on the session between turns (chats are serialized through
// chatChain, so a message the user sends meanwhile simply waits for this).
async function autoCompact(send, sid, contextTokens, systemPrompt = SYSTEM_PROMPT + SDK_PROMPT_SUFFIX) {
  dlog(`auto-compact: context ~${Math.round(contextTokens / 1000)}k tokens > ${Math.round(COMPACT_THRESHOLD / 1000)}k threshold`);
  send({ t: 'compacting', tokens: contextTokens });
  logEvent({ kind: 'autocompact', sessionId: sid, contextTokens });
  try {
    for await (const m of query({
      prompt: '/compact',
      // Same system prompt as the chat turns — a different one here would
      // invalidate the cached prefix for the whole session.
      options: { resume: sid, model: MODEL, effort: EFFORT, cwd: REPO_ROOT, systemPrompt, maxTurns: 2 },
    })) {
      if (m.type === 'system' && m.subtype === 'compact_boundary') {
        dlog('context compacted', JSON.stringify(m.compact_metadata || {}));
        logEvent({ kind: 'compact', sessionId: sid, metadata: m.compact_metadata });
        send({ t: 'compact', metadata: m.compact_metadata });
        await sendCompactSummary(send, sid);
      } else if (m.type === 'result') {
        logEvent({ kind: 'result', sessionId: sid, subtype: 'autocompact-' + m.subtype, turns: m.num_turns, costUsd: m.total_cost_usd, usage: m.usage });
      }
    }
  } catch (e) {
    dlog('auto-compact failed', e?.message || e);
    logEvent({ kind: 'error', sessionId: sid, error: 'auto-compact: ' + String(e?.message || e) });
  }
}

// ---- Server ----------------------------------------------------------------
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  console.log('  browser connected');
  // Keep idle connections alive so a tool call after a long pause isn't stranded
  // on a half-dead socket (browsers/proxies drop silent TCP after a few minutes).
  const keepalive = setInterval(() => { if (ws.readyState === ws.OPEN) ws.ping(); }, 25000);
  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }
    if (msg.t === 'tool_result') {
      const p = pending.get(msg.id);
      if (p) p.resolve(msg);
    } else if (msg.t === 'tool_started') {
      const p = pending.get(msg.id);
      if (p && typeof p.started === 'function') p.started();
    } else if (msg.t === 'chat') {
      chatChain = chatChain.then(() => handleChat(ws, msg));
    } else if (msg.t === 'abort') {
      const stopped = abortCurrentTurn();
      dlog(stopped ? 'ABORT requested by user' : 'abort requested but no turn is running');
      logEvent({ kind: 'abort', requested: true, stopped });
      if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ t: 'aborted', stopped }));
    }
  });
  ws.on('close', () => { clearInterval(keepalive); console.log('  browser disconnected'); });
});

console.log(`\n  studio-agent → ws://localhost:${PORT}`);
console.log(`  repo root:     ${REPO_ROOT}`);
console.log(`  model:         ${MODEL || '(default)'}`);
console.log(`  effort:        ${EFFORT}`);
console.log('  auth:          Claude Code subscription login (no API key)\n');
