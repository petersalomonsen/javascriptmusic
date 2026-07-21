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
import { SYSTEM_PROMPT } from './prompt.mjs';

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

// Tools the agent may use: our browser-proxied studio tools + read-only repo access.
const STUDIO_TOOLS = [
  'get_song', 'set_song', 'get_synth', 'set_synth',
  'edit_synth', 'edit_song', 'grep_synth', 'grep_song',
  'write_faust', 'read_faust', 'list_faust',
  'git_log', 'read_committed',
  'load_synth_from_file', 'load_song_from_file',
  'compile', 'stop',
];
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
let pending = new Map();   // id -> { resolve }
let nextId = 1;
let chatChain = Promise.resolve(); // serialize chat turns (and post-turn auto-compact)

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
  const loadInto = (toolName, browserOp, label) =>
    tool(toolName,
      `Load a repository file DIRECTLY into the ${label} editor without reading it into context. Use this for large bundles (e.g. examples/dx7/dx7-synth.ts) — pass a repo-relative path; the file content is sent to the browser for you.`,
      { path: z.string() },
      async ({ path }) => {
        try {
          const content = await readFile(safeResolve(path), 'utf8');
          const res = await callBrowser(ws, browserOp, { source: content });
          if (!res.ok) return { content: [{ type: 'text', text: `ERROR: ${res.result ?? 'load failed'}` }], isError: true };
          return { content: [{ type: 'text', text: `loaded ${path} (${content.split('\n').length} lines) into the ${label} editor` }] };
        } catch (e) {
          return { content: [{ type: 'text', text: `ERROR: ${e?.message || e}` }], isError: true };
        }
      });

  return createSdkMcpServer({
    name: 'studio',
    version: '1.0.0',
    tools: [
      proxy('get_song', 'Return the current song document (JavaScript sequencer DSL).', {}),
      proxy('set_song', 'Replace the entire song document. Provide the full new source.', { source: z.string() }),
      proxy('get_synth', 'Return the current synth document (AssemblyScript).', {}),
      proxy('set_synth', 'Replace the entire synth document. Provide the full new source.', { source: z.string() }),
      proxy('edit_synth', 'Surgically find-and-replace in the synth document IN PLACE (like the Edit tool). Use this to add a voice/channel to a large synth (e.g. the DX7 bundle) WITHOUT rewriting it. old_string must match exactly and be unique unless replace_all is true.', { old_string: z.string(), new_string: z.string(), replace_all: z.boolean().optional() }),
      proxy('edit_song', 'Surgically find-and-replace in the song document IN PLACE. old_string must match exactly and be unique unless replace_all is true.', { old_string: z.string(), new_string: z.string(), replace_all: z.boolean().optional() }),
      proxy('grep_synth', 'Search the CURRENT in-browser synth document for a regex; returns matching line numbers + text (optionally with surrounding context lines). Use to find exact anchors for edit_synth in a large synth without dumping the whole file.', { pattern: z.string(), context: z.number().optional() }),
      proxy('grep_song', 'Search the CURRENT in-browser song document for a regex; returns matching line numbers + text.', { pattern: z.string(), context: z.number().optional() }),
      proxy('write_faust', 'Author an INSTRUMENT in Faust: write faust/<path>.dsp AND transpile it to AssemblyScript in one step (persists faust/<name>.dsp + faust/<name>.ts in the browser OPFS). Returns the generated class names to import into synth.ts, or the exact transpile error. This is the primary way to create instrument DSP — do NOT hand-write DSP in AssemblyScript.', { path: z.string(), source: z.string() }),
      proxy('read_faust', 'Read a Faust .dsp instrument source from the browser OPFS faust/ folder.', { path: z.string() }),
      proxy('list_faust', 'List the .dsp Faust instruments in the browser OPFS faust/ folder.', {}),
      proxy('git_log', 'Show the commit history of the in-browser OPFS repo (the user commits their work here). Use it to find a commit to restore a file from.', {}),
      proxy('read_committed', 'Read the COMMITTED content of a file from the OPFS git repo at a ref (default HEAD). Path is repo-relative (e.g. "song.js", "faust/bass.dsp"). Use to restore something overwritten in the editor: read_committed then set_song/set_synth it back.', { path: z.string(), ref: z.string().optional() }),
      loadInto('load_synth_from_file', 'set_synth', 'synth'),
      loadInto('load_song_from_file', 'set_song', 'song'),
      proxy('compile', 'SAVE + compile the current song+synth in the browser (same as the app\'s save button). If a track is already playing, the changes are applied and audible immediately. Returns "compiled OK" or the exact compiler error. Call after every edit. There is NO play tool — the user starts playback themselves.', {}),
      proxy('stop', 'Stop live audio playback. Only on the user\'s request.', {}),
    ],
  });
}

// ---- Run one chat turn through the agent -----------------------------------
const t0 = () => new Date().toISOString().slice(11, 23);
const dlog = (...a) => console.log(`  [${t0()}]`, ...a);

async function handleChat(ws, { text, sessionId, summary }, isRetry = false) {
  const send = (obj) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj)); };
  const studio = makeStudioServer(ws);
  let sid = sessionId || null;
  let contextTokens = 0; // last model call's input size (fresh + cached)
  dlog('chat:', JSON.stringify(text).slice(0, 100), sessionId ? `(resume ${sessionId.slice(0, 8)})` : '(new)');
  logEvent({ kind: 'chat', sessionId: sid, resumed: !!sessionId, text });

  try {
    for await (const m of query({
      prompt: text,
      options: {
        resume: sessionId || undefined,
        model: MODEL,
        cwd: REPO_ROOT,
        systemPrompt: SYSTEM_PROMPT,
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
    if (sid && contextTokens > COMPACT_THRESHOLD) {
      await autoCompact(send, sid, contextTokens);
    }
  } catch (e) {
    const emsg = String(e?.message || e);
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
      return handleChat(ws, { text: prompt, sessionId: null }, true);
    }
    dlog('EXCEPTION', emsg);
    logEvent({ kind: 'error', sessionId: sid, error: emsg });
    send({ t: 'error', error: emsg });
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
async function autoCompact(send, sid, contextTokens) {
  dlog(`auto-compact: context ~${Math.round(contextTokens / 1000)}k tokens > ${Math.round(COMPACT_THRESHOLD / 1000)}k threshold`);
  send({ t: 'compacting', tokens: contextTokens });
  logEvent({ kind: 'autocompact', sessionId: sid, contextTokens });
  try {
    for await (const m of query({
      prompt: '/compact',
      options: { resume: sid, model: MODEL, cwd: REPO_ROOT, systemPrompt: SYSTEM_PROMPT, maxTurns: 2 },
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
    }
  });
  ws.on('close', () => { clearInterval(keepalive); console.log('  browser disconnected'); });
});

console.log(`\n  studio-agent → ws://localhost:${PORT}`);
console.log(`  repo root:     ${REPO_ROOT}`);
console.log(`  model:         ${MODEL || '(default)'}`);
console.log('  auth:          Claude Code subscription login (no API key)\n');
