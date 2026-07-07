// In-app client for the local studio-agent (tools/studio-agent).
//
// Connects to the local agent over WebSocket. The agent streams chat text and
// issues tool_call messages; we execute each tool against the running app (the
// editors, the compiler, the audio worklet) and send the result back. This is
// the "full in-app" path: tool calls operate on the browser, not on disk.

import { songsourceeditor, synthsourceeditor } from './editorcontroller.js';
import { transpileDspSource } from './faust/browser-transpile.js';
import { readfile, writefileandstage, listfiles, gitCommand, gitLog } from './wasmgit/wasmgitclient.js';
import { applyEditToText, grepText, normDsp, faustRegistrationHint } from './studio-agent-tools-core.js';

const DEFAULT_PORT = 17891;
const FAUST_DIR = 'faust/';
const RECONNECT_MS = 3000;
const SESSION_FILE = 'studioagent-session.json'; // conversation stored in the OPFS repo

let shadow = null;
let socket = null;
let sessionId = null;
let agentMsgEl = null; // the in-progress assistant message element
let toolQueue = Promise.resolve(); // serialize tool execution (see tool_call below)
let conversation = []; // [{ role: 'user' | 'agent', text }] persisted to the repo

// Persist the conversation + SDK session id into the OPFS repo so it survives a
// reload (and travels with the project). No-op when not in ?gitrepo= mode.
async function saveSession() {
  try { await writefileandstage(SESSION_FILE, JSON.stringify({ sessionId, conversation }, null, 1)); }
  catch (e) { /* no OPFS repo — in-memory only */ }
}
async function loadSession() {
  try {
    const data = JSON.parse(await readfile(SESSION_FILE));
    sessionId = data.sessionId || null;
    conversation = Array.isArray(data.conversation) ? data.conversation : [];
    for (const m of conversation) addLine(m.role === 'user' ? 'user' : 'agent', m.text);
    if (conversation.length) { addLine('tool', `— resumed ${conversation.length} messages —`); }
  } catch (e) { /* no saved session yet */ }
}

// Editor wrappers around the pure logic in studio-agent-tools-core.js.
function applyEdit(editor, args) {
  const r = applyEditToText(editor.doc.getValue(), args);
  if (r.error) return { __error: r.error };
  editor.doc.setValue(r.text);
  return `applied ${r.count} edit(s)`;
}

function grepDoc(editor, args) {
  const r = grepText(editor.doc.getValue(), args);
  if (r && r.error) return { __error: r.error };
  return r;
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

  // ---- git history (OPFS repo) — inspect commits / restore a committed file ----
  git_log: async () => {
    try { return (await gitLog()) || '(no commits yet)'; }
    catch (e) { return faustUnavailable(e); }
  },
  // Read a file's committed content at a git ref (default HEAD). Use to restore
  // something that was overwritten in the editor but is safe in a commit.
  read_committed: async ({ path, ref = 'HEAD' }) => {
    const spec = `${ref}:${path}`;
    try {
      try { return await gitCommand('show', [spec]); }
      catch { return await gitCommand('cat-file', ['-p', spec]); }
    } catch (e) {
      return { __error: `couldn't read ${spec} from git: ${String(e?.error || e?.message || e)}` };
    }
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
      return faustRegistrationHint(ts, stem).message;
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

// Faust file helpers (normDsp is imported from studio-agent-tools-core.js)
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
  socket.onclose = () => {
    if (activityTimer) { clearInterval(activityTimer); activityTimer = null; setBusy(false); }
    const s = el('studioagentstatus'); if (s) s.classList.remove('working');
    setStatus('disconnected — retrying…');
    setTimeout(connect, RECONNECT_MS);
  };
  socket.onerror = () => setStatus('connection error (is studio-agent running?)');
  socket.onmessage = (ev) => onMessage(JSON.parse(ev.data));
}

async function onMessage(msg) {
  switch (msg.t) {
    case 'session':
      sessionId = msg.sessionId;
      saveSession();
      setPhase('thinking…');
      break;
    case 'text':
      appendAgentText(msg.text);
      setPhase('responding…');
      break;
    case 'tool': // assistant decided to use a tool (informational)
      addLine('tool', `⚙ ${shortName(msg.name)}`);
      setPhase(`running ${shortName(msg.name)}…`);
      break;
    case 'tool_call': // request to EXECUTE a tool in the browser
      // Run STRICTLY one at a time: the agent can fire several tool calls at once,
      // and concurrent heavy ops (faust transpile / wasm-git worker / compile) share
      // single-instance resources and stall if overlapped. Queue keeps arrival order.
      toolQueue = toolQueue.then(() => runTool(msg));
      break;
    case 'done': {
      const agentText = agentMsgEl ? agentMsgEl.textContent : '';
      if (agentText) { conversation.push({ role: 'agent', text: agentText }); saveSession(); }
      finishAgentMessage();
      stopActivity('done ✓');
      setBusy(false);
      break;
    }
    case 'error':
      addLine('error', `⚠ ${msg.error}`);
      finishAgentMessage();
      stopActivity('error ✗');
      setBusy(false);
      break;
  }
}

async function runTool({ id, name, args }) {
  const fn = registry[name];
  if (!fn) return reply(id, false, `unknown tool ${name}`);
  try {
    const result = await fn(args || {});
    if (result && result.__error) {
      addLine('error', `✗ ${shortName(name)}: ${result.__error}`);
      reply(id, false, result.__error);
    } else {
      reply(id, true, result);
    }
  } catch (e) {
    const emsg = String(e?.message || e);
    addLine('error', `✗ ${shortName(name)}: ${emsg}`);
    reply(id, false, emsg);
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
  conversation.push({ role: 'user', text });
  saveSession();
  startAgentMessage();
  setBusy(true);
  startActivity();
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

// ---- activity indicator: shows the agent is alive, what it's doing, elapsed time ----
const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let activityTimer = null;
let turnStartMs = 0;
let activityPhase = '';
let spinIdx = 0;
function startActivity() {
  turnStartMs = Date.now();
  activityPhase = 'thinking…';
  const s = el('studioagentstatus');
  if (s) { s.classList.add('working'); s.classList.remove('idle'); }
  if (activityTimer) clearInterval(activityTimer);
  activityTimer = setInterval(renderActivity, 150);
  renderActivity();
}
function setPhase(p) { activityPhase = p; if (activityTimer) renderActivity(); }
function renderActivity() {
  spinIdx = (spinIdx + 1) % SPIN.length;
  const secs = Math.floor((Date.now() - turnStartMs) / 1000);
  setStatus(`${SPIN[spinIdx]} ${activityPhase}  ${secs}s`);
}
function stopActivity(msg) {
  if (activityTimer) { clearInterval(activityTimer); activityTimer = null; }
  const s = el('studioagentstatus');
  if (s) { s.classList.remove('working'); s.classList.add('idle'); }
  const secs = Math.floor((Date.now() - turnStartMs) / 1000);
  setStatus(`${msg} — ${secs}s`);
}

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

  loadSession(); // restore prior conversation from the OPFS repo (if any)
  connect();
}
