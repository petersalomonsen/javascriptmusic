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
import { mkdirSync, createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { SYSTEM_PROMPT } from './prompt.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..'); // tools/studio-agent -> repo root
const PORT = process.env.STUDIO_AGENT_PORT || 17891;
const TOOL_TIMEOUT_MS = 120000;
// Optional model override for speed/depth tradeoff, e.g. STUDIO_AGENT_MODEL=sonnet
// (faster) vs opus (deeper). Unset = the SDK/Claude Code default.
const MODEL = process.env.STUDIO_AGENT_MODEL || undefined;

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
  'compile', 'play', 'stop',
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

function callBrowser(ws, name, args) {
  return new Promise((resolveCall, rejectCall) => {
    const id = nextId++;
    pending.set(id, { resolve: resolveCall });
    ws.send(JSON.stringify({ t: 'tool_call', id, name, args: args || {} }));
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        rejectCall(new Error(`browser tool "${name}" timed out`));
      }
    }, TOOL_TIMEOUT_MS);
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
      proxy('compile', 'Compile the current song+synth in the browser. Returns "compiled OK" or the exact compiler error. Call after every edit.', {}),
      proxy('play', 'Start live audio playback in the browser (compiles first).', {}),
      proxy('stop', 'Stop live audio playback.', {}),
    ],
  });
}

// ---- Run one chat turn through the agent -----------------------------------
const t0 = () => new Date().toISOString().slice(11, 23);
const dlog = (...a) => console.log(`  [${t0()}]`, ...a);

async function handleChat(ws, { text, sessionId }) {
  const send = (obj) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj)); };
  const studio = makeStudioServer(ws);
  let sid = sessionId || null;
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
      } else if (m.type === 'assistant') {
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
        logEvent({ kind: 'result', sessionId: sid, subtype: m.subtype, turns: m.num_turns, costUsd: m.total_cost_usd });
        send({ t: 'done', subtype: m.subtype });
      }
    }
    dlog('query loop ended');
  } catch (e) {
    dlog('EXCEPTION', e?.message || e);
    logEvent({ kind: 'error', sessionId: sid, error: String(e?.message || e) });
    send({ t: 'error', error: String(e?.message || e) });
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
      if (p) { pending.delete(msg.id); p.resolve(msg); }
    } else if (msg.t === 'chat') {
      handleChat(ws, msg);
    }
  });
  ws.on('close', () => { clearInterval(keepalive); console.log('  browser disconnected'); });
});

console.log(`\n  studio-agent → ws://localhost:${PORT}`);
console.log(`  repo root:     ${REPO_ROOT}`);
console.log(`  model:         ${MODEL || '(default)'}`);
console.log('  auth:          Claude Code subscription login (no API key)\n');
