// In-app client for the local studio-agent (tools/studio-agent).
//
// Connects to the local agent over WebSocket. The agent streams chat text and
// issues tool_call messages; we execute each tool against the running app (the
// editors, the compiler, the audio worklet) and send the result back. This is
// the "full in-app" path: tool calls operate on the browser, not on disk.

import { songsourceeditor, synthsourceeditor } from './editorcontroller.js';
import { transpileDspSource } from './faust/browser-transpile.js';
import { readfile, writefileandstage, listfiles } from './wasmgit/wasmgitclient.js';

const DEFAULT_PORT = 17891;
const FAUST_DIR = 'faust/';
const RECONNECT_MS = 3000;

let shadow = null;
let socket = null;
let sessionId = null;
let agentMsgEl = null; // the in-progress assistant message element

// Surgical find-and-replace on an editor doc — mirrors the Edit tool's semantics
// so the agent can change a large document (e.g. the 14k-line DX7 bundle) without
// rewriting the whole thing.
function applyEdit(editor, { old_string, new_string, replace_all }) {
  const cur = editor.doc.getValue();
  if (old_string === new_string) return { __error: 'old_string and new_string are identical' };
  const count = old_string ? cur.split(old_string).length - 1 : 0;
  if (count === 0) return { __error: 'old_string not found in the document' };
  if (count > 1 && !replace_all) return { __error: `old_string is not unique (${count} matches); add more surrounding context or set replace_all` };
  const next = replace_all ? cur.split(old_string).join(new_string) : cur.replace(old_string, new_string);
  editor.doc.setValue(next);
  return `applied ${replace_all ? count : 1} edit(s)`;
}

// Grep the in-browser doc so the agent can locate anchors in a big document
// without pulling the whole thing into context.
function grepDoc(editor, { pattern, context = 0 }) {
  let re;
  try { re = new RegExp(pattern, 'i'); } catch (e) { return { __error: `bad regex: ${e.message}` }; }
  const lines = editor.doc.getValue().split('\n');
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

// ---- the tool registry: tool name -> async fn acting on the app -------------
// Returning an object with `__error` marks a failed tool result.
const registry = {
  get_song: async () => songsourceeditor.doc.getValue(),
  set_song: async ({ source }) => { songsourceeditor.doc.setValue(source); return 'song updated'; },
  get_synth: async () => synthsourceeditor.doc.getValue(),
  set_synth: async ({ source }) => { synthsourceeditor.doc.setValue(source); return 'synth updated'; },
  edit_synth: async (args) => applyEdit(synthsourceeditor, args),
  edit_song: async (args) => applyEdit(songsourceeditor, args),
  grep_synth: async (args) => grepDoc(synthsourceeditor, args),
  grep_song: async (args) => grepDoc(songsourceeditor, args),

  // ---- Faust instrument authoring (OPFS faust/ folder; needs ?gitrepo= mode) ----
  list_faust: async () => {
    try {
      const all = await listfiles(FAUST_DIR);
      const dsp = all.filter((f) => f.endsWith('.dsp')).map((f) => f.slice(FAUST_DIR.length));
      return dsp.length ? dsp.join('\n') : '(no .dsp instruments yet)';
    } catch (e) { return faustUnavailable(e); }
  },
  read_faust: async ({ path }) => {
    try { return await readfile(FAUST_DIR + normDsp(path)); }
    catch (e) { return faustUnavailable(e); }
  },
  // Write a .dsp AND transpile it to AssemblyScript (same as the app's faust save):
  // persists faust/<name>.dsp + faust/<name>.ts and reports the generated classes.
  write_faust: async ({ path, source }) => {
    const rel = normDsp(path);
    const stem = rel.replace(/\.dsp$/, '');
    try {
      await writefileandstage(FAUST_DIR + rel, source);
      let ts;
      try {
        ({ ts } = await transpileDspSource(source, rel, {}));
      } catch (e) {
        return { __error: `Faust transpile failed for ${rel}: ${e?.message || e}` };
      }
      await writefileandstage(FAUST_DIR + stem + '.ts', ts);
      // refresh the app's Faust file dropdown so the user sees the new instrument
      if (typeof window.refreshFaustFileList === 'function') { try { await window.refreshFaustFileList(); } catch { /* non-fatal */ } }
      const classes = [...ts.matchAll(/export class (\w+)/g)].map((m) => m[1]);
      return `transpiled OK → faust/${stem}.ts exports: ${classes.join(', ') || '(none)'}. ` +
        `In synth.ts: import { ${classes.join(', ')} } from '../faust/${stem}'; ` +
        `then register e.g. midichannels[N] = new ${classes.find((c) => /Channel$/.test(c)) || 'XxxChannel'}(8, (ch) => new ${classes.find((c) => !/Channel$/.test(c)) || 'Xxx'}(ch));`;
    } catch (e) { return faustUnavailable(e); }
  },
  compile: async () => {
    try {
      await window.compileSong();
    } catch (e) {
      return { __error: String(e?.message || e) };
    }
    const err = readErrorPanel();
    return err ? { __error: err } : 'compiled OK';
  },
  play: async () => { await window.startaudio(); return 'playing'; },
  stop: async () => { window.stopaudio(); return 'stopped'; },
};

// Faust file helpers
function normDsp(path) {
  let rel = String(path || '').replace(/^faust\//, '');
  if (!rel.endsWith('.dsp')) rel += '.dsp';
  return rel;
}
function faustUnavailable(e) {
  const msg = String(e?.message || e);
  return { __error: `Faust/OPFS not available (${msg}). The app must be opened with a ?gitrepo=… URL so the OPFS git working tree exists.` };
}

function readErrorPanel() {
  const el = shadow && shadow.getElementById('errormessages');
  if (!el || el.style.display === 'none') return '';
  const span = el.querySelector('span');
  return span ? span.innerText.trim() : '';
}

// ---- WebSocket lifecycle ----------------------------------------------------
function connect() {
  const port = window.STUDIO_AGENT_PORT || DEFAULT_PORT;
  setStatus(`connecting to ws://localhost:${port}…`);
  socket = new WebSocket(`ws://localhost:${port}`);

  socket.onopen = () => setStatus('connected');
  socket.onclose = () => { setStatus('disconnected — retrying…'); setTimeout(connect, RECONNECT_MS); };
  socket.onerror = () => setStatus('connection error (is studio-agent running?)');
  socket.onmessage = (ev) => onMessage(JSON.parse(ev.data));
}

async function onMessage(msg) {
  switch (msg.t) {
    case 'session':
      sessionId = msg.sessionId;
      break;
    case 'text':
      appendAgentText(msg.text);
      break;
    case 'tool': // assistant decided to use a tool (informational)
      addLine('tool', `⚙ ${shortName(msg.name)}`);
      break;
    case 'tool_call': // request to EXECUTE a tool in the browser
      await runTool(msg);
      break;
    case 'done':
      finishAgentMessage();
      setBusy(false);
      break;
    case 'error':
      addLine('error', `⚠ ${msg.error}`);
      finishAgentMessage();
      setBusy(false);
      break;
  }
}

async function runTool({ id, name, args }) {
  const fn = registry[name];
  if (!fn) return reply(id, false, `unknown tool ${name}`);
  try {
    const result = await fn(args || {});
    if (result && result.__error) reply(id, false, result.__error);
    else reply(id, true, result);
  } catch (e) {
    reply(id, false, String(e?.message || e));
  }
}

function reply(id, ok, result) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ t: 'tool_result', id, ok, result }));
  }
}

function sendChat(text) {
  if (!socket || socket.readyState !== WebSocket.OPEN) { setStatus('not connected'); return; }
  addLine('user', text);
  startAgentMessage();
  setBusy(true);
  socket.send(JSON.stringify({ t: 'chat', text, sessionId }));
}

// ---- tiny UI helpers --------------------------------------------------------
const shortName = (n) => (n || '').replace(/^mcp__studio__/, '');

function el(id) { return shadow.getElementById(id); }
function setStatus(s) { const e = el('studioagentstatus'); if (e) e.textContent = `agent: ${s}`; }
function setBusy(b) {
  const send = el('studioagentsend');
  if (send) { send.disabled = b; send.textContent = b ? '…' : 'Send'; }
}

function addLine(kind, text) {
  const log = el('studioagentlog');
  const line = document.createElement('div');
  line.className = `sa-msg-${kind}`;
  line.textContent = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
  return line;
}
function startAgentMessage() { agentMsgEl = addLine('agent', ''); }
function appendAgentText(t) {
  if (!agentMsgEl) startAgentMessage();
  agentMsgEl.textContent += t;
  const log = el('studioagentlog');
  log.scrollTop = log.scrollHeight;
}
function finishAgentMessage() { agentMsgEl = null; }

// ---- public init (called from app.js once the editors exist) ----------------
export function initStudioAgent(shadowRoot) {
  shadow = shadowRoot;
  const panel = el('studioagentpanel');
  const form = el('studioagentform');
  const input = el('studioagentinput');

  window.toggleStudioAgent = (checked) => {
    panel.style.display = checked ? 'flex' : 'none';
    if (checked) input.focus();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendChat(text);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });

  connect();
}
