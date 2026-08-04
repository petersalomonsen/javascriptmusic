// In-app client for the local studio-agent (tools/studio-agent).
//
// Connects to the local agent over WebSocket. The agent streams chat text and
// issues tool_call messages; we execute each tool against the running app (the
// editors, the compiler, the audio worklet) and send the result back. This is
// the "full in-app" path: tool calls operate on the browser, not on disk.

import { songsourceeditor, synthsourceeditor, shadersourceeditor } from '../editorcontroller.js';
import { transpileDspSource } from '../faust/faust-rs-transpile.js';
import { formatDiagnosticsForAgent } from '../faust/faust-diagnostics.js';
import { readfile, writefileandstage, listfiles, gitCommand, gitLog } from '../wasmgit/wasmgitclient.js';
import {
  applyEditToText, grepText, normDsp, faustRegistrationHint, songSourceWarnings,
  summarizeSongEvents, formatSongSummary, songEventWarnings, songBpmFromSource, declaredInstruments
} from './tools-core.js';
import { probeNote, probeNotes, probeWarnings } from '../audioprobe/instrumentprobe.js';
import { parseNote, noteName } from '../audioprobe/audioanalysis.js';
import { runAgentTurn, resolveDefaultBaseUrl, DEFAULT_MODEL, SERVERLESS_PROMPT_SUFFIX } from './nearai-core.js';
import { loadPass, clearPass, passRemainingSeconds, HEADER_PASS } from '../near/x402-client.js';

// The same-origin Pages Function. Works in production and, since devserver.js
// runs the Functions too, on localhost.
const PROXY_BASE_URL = '/nearai/v1';
import { SYSTEM_PROMPT } from './prompt.js';
import { loadKit, formatKit } from './kit.js';

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
// Latest compact summary of the SDK session. Persisted to the repo so a clone
// on ANOTHER machine (where the SDK's local session store is absent) can start
// a fresh session seeded with this summary instead of from nothing. Note the
// conversation array itself is NEVER sent to the model — only the latest chat
// text goes out; history lives in the SDK session (kept small by compaction).
let sessionSummary = null;

// Persist the conversation + SDK session id + compact summary into the OPFS
// repo so it survives a reload (and travels with the project). The full
// conversation is kept as project history — it is replay/reference only, so
// its size costs repo bytes, not model context. No-op when not in ?gitrepo= mode.
async function saveSession() {
  try { await writefileandstage(SESSION_FILE, JSON.stringify({ sessionId, summary: sessionSummary, conversation }, null, 1)); }
  catch (e) { /* no OPFS repo — in-memory only */ }
}
async function loadSession() {
  try {
    const data = JSON.parse(await readfile(SESSION_FILE));
    sessionId = data.sessionId || null;
    sessionSummary = data.summary || null;
    conversation = Array.isArray(data.conversation) ? data.conversation : [];
    for (const m of conversation) addLine(m.role === 'user' ? 'user' : 'agent', m.text);
    if (conversation.length) { addLine('tool', `— resumed ${conversation.length} messages —`); }
  } catch (e) { /* no saved session yet */ }
}

// Editor wrappers around the pure logic in tools-core.js.
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

// What the last compiled song schedules but the CURRENT shader document cannot
// show (showText with no uText, setVisual names the shader never declares).
// The app computes the same warnings for the human in the error panel; the
// agent gets them straight in the tool result, where it can act on them.
function shaderWarnings() {
  return window.getVisualWarnings ? window.getVisualWarnings(shadersourceeditor.doc.getValue()) : [];
}

// ---- the tool registry: tool name -> async fn acting on the app -------------
// Returning an object with `__error` marks a failed tool result.
const registry = {
  get_song: async () => songsourceeditor.doc.getValue(),
  set_song: async ({ source }) => {
    songsourceeditor.doc.setValue(source);
    return ['song updated', ...songSourceWarnings(source)].join(' ');
  },
  get_synth: async () => synthsourceeditor.doc.getValue(),
  set_synth: async ({ source }) => { synthsourceeditor.doc.setValue(source); return 'synth updated'; },
  edit_synth: async (args) => applyEdit(synthsourceeditor, args),
  edit_song: async (args) => {
    const result = applyEdit(songsourceeditor, args);
    if (result && result.__error) return result;
    return [result, ...songSourceWarnings(songsourceeditor.doc.getValue())].join(' ');
  },
  grep_synth: async (args) => grepDoc(synthsourceeditor, args),
  grep_song: async (args) => grepDoc(songsourceeditor, args),

  // ---- the visualizer shader (GLSL) ----
  // The song's visuals only reach the screen through uniforms this document
  // declares, so shader edits and song edits belong to the same job. Every
  // write reports back what the song schedules but the shader can't show.
  get_shader: async () => shadersourceeditor.doc.getValue() || '(no shader — the shader editor is empty)',
  set_shader: async ({ source }) => {
    shadersourceeditor.doc.setValue(source);
    return ['shader updated', ...shaderWarnings()].join('\n');
  },
  edit_shader: async (args) => {
    const result = applyEdit(shadersourceeditor, args);
    if (result && result.__error) return result;
    return [result, ...shaderWarnings()].join('\n');
  },
  grep_shader: async (args) => grepDoc(shadersourceeditor, args),

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
  // Per-step timings are logged + appended to the result: manual runs are ~1s but
  // agent-driven runs have been observed at 47-111s, so we need to see WHICH step
  // stalls (git-worker write? transpile? UI refresh?) and the tab visibility
  // (a hidden tab throttles main-thread work like the faust transpile hard).
  write_faust: async ({ path, source }) => {
    const rel = normDsp(path);
    const stem = rel.replace(/\.dsp$/, '');
    const t0 = performance.now();
    const marks = [`visibility=${document.visibilityState}`];
    let last = t0;
    const mark = (label) => { const now = performance.now(); marks.push(`${label}=${((now - last) / 1000).toFixed(1)}s`); last = now; };
    try {
      await writefileandstage(FAUST_DIR + rel, source);
      mark('write-dsp');
      let ts;
      try {
        ({ ts } = await transpileDspSource(source, rel, {}));
      } catch (e) {
        // Structured compiler diagnostics (error-model v2): give the agent
        // the typed projection — stable code, category, exact location,
        // facts and fixes — instead of one flattened message.
        const structured = e?.faustDiagnostics
          ? formatDiagnosticsForAgent(e.faustDiagnostics, e.faustSource ?? source)
          : '';
        const detail = structured || e?.message || String(e);
        return { __error: `Faust transpile failed for ${rel}:\n${detail}` };
      }
      mark('transpile');
      await writefileandstage(FAUST_DIR + stem + '.ts', ts);
      mark('write-ts');
      // refresh the app's Faust file dropdown so the user sees the new instrument
      if (typeof window.refreshFaustFileList === 'function') { try { await window.refreshFaustFileList(); } catch { /* non-fatal */ } }
      // and reflect the written .dsp in the editor even when it's the file already
      // on screen (dropdown refresh alone won't reload the current selection).
      if (typeof window.showFaustFileInEditor === 'function') { try { await window.showFaustFileInEditor(FAUST_DIR + rel); } catch { /* non-fatal */ } }
      mark('ui-refresh');
      const timing = `${((performance.now() - t0) / 1000).toFixed(1)}s total (${marks.join(', ')})`;
      console.log(`[studio-agent] write_faust ${rel}: ${timing}`);
      return `${faustRegistrationHint(ts, stem).message} [timing: ${timing}]`;
    } catch (e) { return faustUnavailable(e); }
  },
  compile: async () => {
    try {
      // Same as the app's save button: saves + compiles AND applies the new
      // wasm/eventlist to the audio worklet, so a track that is already
      // playing becomes audible with the changes — without starting playback
      // when stopped.
      await window.saveSong();
    } catch (e) {
      return { __error: String(e?.message || e) };
    }
    const err = readErrorPanel();
    // Visuals the song scheduled that the shader can't show are read straight
    // from the app rather than the panel — a later synth warning would
    // otherwise overwrite them there.
    const visual = shaderWarnings();
    // What the song actually PLAYS, read from the compiled event list. The
    // agent cannot hear the result, so anomalies here (nothing sounds at all,
    // instruments that never overlap) are the only signal that a song is
    // structurally wrong despite compiling cleanly.
    const events = songEventAnomalies();
    // Whether anything is actually AUDIBLE. A Faust voice with no `gate`
    // compiles, registers and plays silence, and the agent cannot hear that —
    // so probe the channels the song really plays before it reports success.
    const audio = await silentChannelWarnings();
    if (!err) return ['compiled OK', ...visual, ...events, ...audio].join('\n');
    // The panel also surfaces NON-fatal AssemblyScript warnings (AS233/AS235…)
    // after a successful build — reporting those as an error makes models
    // "fix" working code. Only real ERROR lines fail the tool.
    const text = err.replace(/^Error:\s*/, '');
    const onlyWarnings = /^WARNING/i.test(text) && !/(^|\n)\s*ERROR/.test(text);
    if (onlyWarnings) {
      return ['compiled OK (non-fatal AssemblyScript warnings in the panel — ignore them)', ...visual, ...events, ...audio].join('\n');
    }
    return { __error: err };
  },
  probe_instrument: async ({ channel = 0, notes, hold, velocity } = {}) => {
    const bytes = window.WASM_SYNTH_BYTES;
    if (!bytes) return { __error: 'No compiled synth yet — call compile first.' };
    let noteNumbers;
    try {
      noteNumbers = (notes ? String(notes).split(',') : ['c3', 'c4', 'c5'])
        .map((n) => n.trim()).filter(Boolean).map(parseNote);
    } catch (e) {
      return { __error: String(e.message || e) };
    }
    if (!noteNumbers.length) return { __error: 'no notes to probe' };
    let results;
    try {
      results = await probeNotes(bytes, noteNumbers, {
        channel: Number(channel) || 0,
        holdSeconds: hold > 0 ? Number(hold) : 0.4,
        velocity: velocity > 0 ? Number(velocity) : 100,
      });
    } catch (e) {
      return { __error: `probe failed: ${e.message || e}` };
    }
    const lines = results.map((r) => r.silent
      ? `ch${r.channel} ${r.name}: SILENT — no audio produced`
      : `ch${r.channel} ${r.name}: peak ${r.peak.toFixed(3)}, rms ${r.rms.toFixed(4)}, `
        + `dominant ${r.dominantHz.toFixed(1)}Hz (note is ${r.expectedHz.toFixed(1)}Hz), `
        + `centroid ${r.centroidHz.toFixed(0)}Hz`);
    const audible = results.filter((r) => !r.silent);
    const distinct = new Set(audible.map((r) => `${Math.round(r.dominantHz)}:${Math.round(r.centroidHz / 20)}`));
    if (audible.length > 1 && distinct.size === 1) {
      lines.push('All notes rendered the SAME audio — the instrument ignores the note number. '
        + 'Correct for a fixed-pitch drum; a bug for a pitched voice (declare `freq`) or for a kit meant to map notes to drums.');
    }
    return [...lines, ...probeWarnings(results)].join('\n');
  },
  song_summary: async () => {
    const summary = analyzeCompiledSong();
    if (!summary) {
      return { __error: 'No compiled event list available — call compile first (and note that only the midi-synth path produces one).' };
    }
    return formatSongSummary(summary);
  },
  // NOTE: intentionally NO `play` tool — starting playback is the user's
  // action (play button). The agent saves via `compile`; a playing track
  // picks the changes up live.
  stop: async () => { window.stopaudio(); return 'stopped'; },
};

// Analyse the event list stashed by the last compile (editorcontroller.js).
function analyzeCompiledSong() {
  const eventlist = window.lastCompiledEventList;
  if (!eventlist || !eventlist.length) return null;
  const source = songsourceeditor.doc.getValue();
  return summarizeSongEvents(eventlist, songBpmFromSource(source), { instruments: declaredInstruments(source) });
}

// Probe every channel the song actually plays, using a note it really uses, and
// report the ones that make no sound.
//
// STRICTLY BUDGETED. Rendering is synchronous and blocks the main thread, and
// `compile` is already the slowest tool there is (a full asc build). On a loaded
// CI runner the two together blew the agent harness's 30s tool timeout — the
// tool queue is serialized, so a slow compile stalls everything behind it.
// So: a short render (an envelope opens within milliseconds — 0.2s is ample to
// tell sound from silence), a cap on channels, a wall-clock budget, and a yield
// between probes so the socket keeps pumping. Verification must never be the
// reason a compile appears to hang.
const PROBE_BUDGET_MS = 2000;
const PROBE_MAX_CHANNELS = 4;

const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve, 0));

async function silentChannelWarnings() {
  try {
    const bytes = window.WASM_SYNTH_BYTES;
    const summary = analyzeCompiledSong();
    if (!bytes || !summary || !summary.sounding.length) return [];
    const warnings = [];
    const deadline = Date.now() + PROBE_BUDGET_MS;
    let probed = 0;
    for (const channel of summary.sounding) {
      if (probed >= PROBE_MAX_CHANNELS || Date.now() > deadline) {
        warnings.push(`(audio probe stopped after ${probed} channel(s) to keep compile responsive — `
          + 'run probe_instrument on the rest if you need to check them)');
        break;
      }
      const note = firstNoteOnChannel(channel.channel);
      if (note === null) continue;
      await yieldToEventLoop();
      probed++;
      const result = await probeNote(bytes, { channel: channel.channel, note, holdSeconds: 0.2, tailSeconds: 0.15 });
      if (result.silent) {
        warnings.push(
          `WARNING: channel ${channel.channel} plays ${channel.notes} note(s) but produces NO SOUND `
          + `(probed ${noteName(note)}). It compiled and registered — do NOT report this as ready. `
          + 'A Faust voice is triggered ONLY by `gate`: an instrument that declares none, or drives its envelope from a '
          + 'control of its own naming, is silent however good the DSP is. Fix the .dsp, compile, and probe again.'
        );
      }
    }
    return warnings;
  } catch (e) {
    console.error('instrument probe failed', e);
    return [];
  }
}

function firstNoteOnChannel(channel) {
  const eventlist = window.lastCompiledEventList || [];
  for (const evt of eventlist) {
    const [status, note, velocity] = evt.message || [];
    if (status === undefined) continue;
    if ((status & 0xf0) === 0x90 && velocity > 0 && (status & 0x0f) === channel) return note;
  }
  return null;
}

function songEventAnomalies() {
  try {
    const summary = analyzeCompiledSong();
    return summary ? songEventWarnings(summary) : [];
  } catch (e) {
    console.error('song event analysis failed', e);
    return [];
  }
}

// Faust file helpers (normDsp is imported from tools-core.js)
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
  // In NEAR AI mode the local agent isn't used: don't run the reconnect loop —
  // its onclose fired every 3s, killing the activity spinner and stomping the
  // status line ("connecting to ws://…") while a NEAR AI request was in flight.
  if (nearaiConfig()) {
    socket = null;
    setStatus(`NEAR AI: ${nearaiConfig().model}`);
    setTimeout(connect, RECONNECT_MS * 4); // re-check in case /nearai off
    return;
  }
  const port = window.STUDIO_AGENT_PORT || DEFAULT_PORT;
  setStatus(`connecting to ws://localhost:${port}…`);
  socket = new WebSocket(`ws://localhost:${port}`);

  socket.onopen = () => setStatus('connected');
  socket.onclose = () => {
    if (nearaiConfig()) { setTimeout(connect, RECONNECT_MS); return; } // switched provider — leave UI alone
    if (activityTimer) { clearInterval(activityTimer); activityTimer = null; setBusy(false); }
    const s = el('studioagentstatus'); if (s) s.classList.remove('working');
    setStatus('disconnected — retrying…');
    setTimeout(connect, RECONNECT_MS);
  };
  socket.onerror = () => { if (!nearaiConfig()) setStatus('connection error (is studio-agent running?)'); };
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
    case 'compacting': // server-initiated proactive /compact of a large session
      addLine('tool', `— auto-compacting conversation (~${Math.round((msg.tokens || 0) / 1000)}k tokens of context)… —`);
      break;
    case 'compact': // the SDK compacted the session (auto, or the user sent /compact)
      addLine('tool', `— conversation compacted (${msg.metadata?.trigger || 'auto'}) —`);
      break;
    case 'summary': // the compact summary text — persist it with the session
      sessionSummary = msg.text || null;
      saveSession();
      break;
    case 'freshsession': // resume failed (e.g. repo opened on another machine)
      addLine('tool', '— previous session not on this machine; started fresh from the saved summary —');
      break;
    case 'aborted': // the server acknowledged the stop request
      if (!msg.stopped) addLine('tool', '— nothing was running —');
      break;
    case 'stopped': { // the turn actually ended because it was stopped
      // Keep whatever the agent had already said: the work it completed before
      // the stop is real, and losing it would make Stop feel destructive.
      const partial = agentMsgEl ? agentMsgEl.textContent : '';
      if (partial) { conversation.push({ role: 'agent', text: partial }); saveSession(); }
      addLine('tool', '— stopped —');
      finishAgentMessage();
      stopActivity('stopped');
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
  // Tell the server execution has actually begun (the serial queue may have
  // held this call for a while) — its run-timeout is armed from this moment,
  // so a call waiting behind a heavy Faust transpile isn't falsely timed out.
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ t: 'tool_started', id }));
  }
  // Timing diagnostics: agent-driven tools have been observed 50-100x slower
  // than the same operations run manually — log duration + tab visibility per
  // tool so the stalling layer is identifiable in the browser console.
  const t0 = performance.now();
  const vis0 = document.visibilityState;
  const finish = (ok) => {
    const secs = (performance.now() - t0) / 1000;
    if (secs > 2) console.warn(`[studio-agent] ${shortName(name)} took ${secs.toFixed(1)}s (${ok ? 'ok' : 'error'}, visibility ${vis0}→${document.visibilityState})`);
    // The tool is done in the browser — anything from here on is the model
    // reading the result. Without this, the status keeps blaming the last
    // tool ("running grep_song… 51s") for what is model thinking time.
    setPhase('thinking…');
  };
  try {
    const result = await fn(args || {});
    if (result && result.__error) {
      finish(false);
      addLine('error', `✗ ${shortName(name)}: ${result.__error}`);
      reply(id, false, result.__error);
    } else {
      finish(true);
      reply(id, true, result);
    }
  } catch (e) {
    finish(false);
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

async function sendChat(text) {
  // /nearai provider commands are handled locally and never enter the
  // conversation (the API key must not be persisted into the OPFS repo).
  if (text.startsWith('/nearai')) { handleNearaiCommand(text); return; }

  if (nearaiConfig()) {
    addLine('user', text);
    conversation.push({ role: 'user', text });
    saveSession();
    startAgentMessage();
    setBusy(true);
    startActivity();
    runNearaiTurn(text);
    return;
  }

  if (!socket || socket.readyState !== WebSocket.OPEN) { setStatus('not connected'); return; }
  addLine('user', text);
  conversation.push({ role: 'user', text });
  saveSession();
  startAgentMessage();
  setBusy(true);
  startActivity();
  // The server has no view of OPFS, so the project's kit has to travel from
  // here. It rides on EVERY turn: the server builds the system prompt per
  // query, and an unchanged prompt keeps the cached prefix intact.
  const kit = (await loadKit()).text;
  // summary rides along so the server can seed a FRESH session from it when
  // the sessionId can't be resumed (SDK sessions are per-machine).
  socket.send(JSON.stringify({ t: 'chat', text, sessionId, summary: sessionSummary, kit }));
}

// ---- NEAR AI serverless provider (no local studio-agent process) ------------
// Config lives in localStorage ONLY (never in the OPFS repo — it would get
// committed and pushed with the project).
function nearaiConfig() {
  const apiKey = localStorage.getItem('nearai-api-key');
  const enabled = apiKey || localStorage.getItem('nearai-enabled');
  if (!enabled) return null;
  const baseUrl = localStorage.getItem('nearai-base-url') || resolveDefaultBaseUrl(location.hostname);
  // The Pages Function proxy holds the API key AND injects the system prompt +
  // tools server-side. Normally it is same-origin (a relative base URL), but an
  // absolute .../nearai/v1 also counts — that lets a locally served app drive a
  // deployed proxy (it origin-allowlists localhost), which is how the NEAR AI
  // path gets exercised without handing a key to the browser.
  const proxy = baseUrl.startsWith('/') || (!apiKey && /\/nearai\/v1\/?$/.test(baseUrl));
  if (!proxy && !apiKey) return null; // direct upstream needs the user's key
  return {
    apiKey: proxy ? null : apiKey,
    proxy,
    model: localStorage.getItem('nearai-model') || DEFAULT_MODEL,
    baseUrl,
  };
}

function handleNearaiCommand(text) {
  const parts = text.trim().split(/\s+/).slice(1);
  const activate = () => {
    nearaiMessages = null; // fresh model context on (re)configure
    if (socket) { try { socket.onclose = null; socket.close(); } catch { /* */ } socket = null; }
    const cfg = nearaiConfig();
    setStatus(`NEAR AI: ${cfg.model}${cfg.proxy ? ' (via proxy)' : ''}`);
    addLine('tool', `— NEAR AI mode ON (model ${cfg.model}${cfg.proxy ? ', server-side key via same-origin proxy' : ''}). '/nearai off' to switch back, '/nearai model <id>' to change model —`);
  };
  if (parts[0] === 'off') {
    localStorage.removeItem('nearai-api-key');
    localStorage.removeItem('nearai-enabled');
    localStorage.removeItem('nearai-base-url');
    addLine('tool', '— NEAR AI mode off; using the local studio-agent —');
    if (!socket) connect();
  } else if (parts[0] === 'model' && parts[1]) {
    localStorage.setItem('nearai-model', parts[1]);
    addLine('tool', `— NEAR AI model set to ${parts[1]} —`);
  } else if (parts[0] === 'on') {
    // Key-free mode: go through the same-origin Pages Function, which carries
    // the server key and charges for it. Say so explicitly rather than infer
    // it from the hostname — devserver.js now serves the Functions locally, so
    // "am I on localhost" stopped being the same question as "is there a proxy".
    localStorage.setItem('nearai-enabled', '1');
    localStorage.setItem('nearai-base-url', PROXY_BASE_URL);
    localStorage.removeItem('nearai-api-key'); // proxy mode ignores it anyway
    activate();
  } else if (parts[0]) {
    // A user's own key talks to the API directly, so drop any proxy base URL a
    // previous `/nearai on` left behind — otherwise the key is silently ignored.
    localStorage.setItem('nearai-api-key', parts[0]);
    localStorage.removeItem('nearai-base-url');
    if (parts[1]) localStorage.setItem('nearai-model', parts[1]);
    activate();
  } else {
    const cfg = nearaiConfig();
    addLine('tool', cfg
      ? `— NEAR AI mode ON: ${cfg.model} @ ${cfg.baseUrl}${cfg.proxy ? ' (server-side key)' : ''} —`
      : `— NEAR AI mode off. Usage: /nearai on (server-side key) · /nearai <api-key> [model] · /nearai model <id> · /nearai off —`);
  }
}

// Serverless replacements for the local agent's repo-file access: fetch from
// the public GitHub repo via jsDelivr instead of local disk.
const REPO_CDN = 'https://cdn.jsdelivr.net/gh/petersalomonsen/javascriptmusic@master/';
async function fetchRepoFile(path) {
  const res = await fetch(REPO_CDN + path.replace(/^\/+/, ''));
  if (!res.ok) throw new Error(`could not fetch ${path} (${res.status})`);
  return res.text();
}

async function runNearaiServerlessTool(name, args) {
  if (registry[name]) {
    const result = await registry[name](args || {});
    if (result && result.__error) throw new Error(result.__error);
    return result;
  }
  if (name === 'read_repo_file') {
    const text = await fetchRepoFile(args.path);
    return text.length > 100000 ? `${text.slice(0, 100000)}\n…[truncated — file is ${text.length} chars; use load_synth_from_file/load_song_from_file for large bundles]` : text;
  }
  if (name === 'load_synth_from_file' || name === 'load_song_from_file') {
    const content = await fetchRepoFile(args.path);
    await registry[name === 'load_synth_from_file' ? 'set_synth' : 'set_song']({ source: content });
    return `loaded ${args.path} (${content.split('\n').length} lines) into the ${name === 'load_synth_from_file' ? 'synth' : 'song'} editor`;
  }
  throw new Error(`unknown tool ${name}`);
}

let nearaiMessages = null; // model-visible history (in-memory for iteration 1)
let nearaiAbort = null;    // AbortController for the turn in flight

// ---- the day pass -----------------------------------------------------------
//
// Inference runs on OUR NEAR AI credits, so the proxy charges for it. The app
// only ever ATTACHES a pass — it never pays. Paying needs a wallet, and this
// document sets COOP (for SharedArrayBuffer), which severs window.opener and
// breaks wallet popups. So payment happens on /pay.html, exactly as sign-in
// already happens on /login.html.

/** Add the pass to a request, if we have one. */
function withPass(init = {}) {
  const pass = loadPass();
  if (!pass) return init;
  const headers = new Headers(init.headers || {});
  headers.set(HEADER_PASS, pass);
  return { ...init, headers };
}

let payWindow = null;

/** Open the payment page and resolve once a pass shows up (or the user gives up). */
function buyPass() {
  return new Promise((resolve) => {
    let done = false;
    const finish = (pass) => {
      if (done) return;
      done = true;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('message', onMessage);
      clearInterval(poll);
      resolve(pass || null);
    };
    const check = () => { const p = loadPass(); if (passRemainingSeconds(p) > 0) finish(p); };
    const onStorage = (e) => { if (e.key === 'studio-pass') check(); };
    // `storage` fires in OTHER tabs only, and COOP may have severed opener, so
    // postMessage is a hint rather than the mechanism — poll as the backstop.
    const onMessage = (e) => { if (e.origin === location.origin && e.data?.type === 'studio-pass') check(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('message', onMessage);
    const poll = setInterval(() => {
      check();
      if (payWindow && payWindow.closed) { check(); finish(loadPass()); }
    }, 700);

    payWindow = window.open('/pay.html', 'studio-pass', 'width=460,height=640');
    if (!payWindow) { finish(null); }
  });
}

// Offers still on screen waiting for a pass. A pass can arrive by routes an
// individual offer knows nothing about — another tab, a direct visit to
// /pay.html, a second window — and a button that still says "Get a session pass"
// after you have one is worse than useless: it invites you to buy twice.
const pendingOffers = new Set();

/** A pass turned up from somewhere: settle every offer waiting on one. */
function passArrived() {
  if (!(passRemainingSeconds(loadPass()) > 0)) return;
  for (const offer of [...pendingOffers]) offer.settle();
}

// `storage` fires in the OTHER tabs, which is exactly the case the offer's own
// polling cannot see.
window.addEventListener('storage', (e) => { if (e.key === 'studio-pass') passArrived(); });
// …and a claim made in a window this tab never opened only shows up on return.
window.addEventListener('focus', passArrived);

/** Render the gate as an offer with a button, not as an error. */
function offerPass(onBought) {
  const line = addLine('tool', '');
  line.textContent = '— the studio AI needs a session pass — ';
  const btn = document.createElement('button');
  btn.textContent = 'Get a session pass';
  btn.style.cssText = 'font:inherit;padding:.2rem .6rem;border-radius:.3rem;border:1px solid #4a4;background:#1a2a1a;color:#8f8;cursor:pointer';

  let settled = false;
  const offer = {
    settle() {
      if (settled) return;          // the button and `storage` can both fire
      settled = true;
      pendingOffers.delete(offer);
      line.textContent = '— session pass active —';   // replaces the button too
      onBought();
    },
  };
  pendingOffers.add(offer);

  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = 'waiting…';
    await buyPass();
    if (passRemainingSeconds(loadPass()) > 0) offer.settle();
    else if (!settled) { btn.disabled = false; btn.textContent = 'Get a session pass'; }
  };
  line.appendChild(btn);
  return line;
}

async function runNearaiTurn(text) {
  const cfg = nearaiConfig();
  nearaiAbort = new AbortController();
  let content = text;
  if (!nearaiMessages) {
    // In proxy mode the server injects the system prompt (and tools) —
    // sending them from here would be stripped anyway.
    nearaiMessages = cfg.proxy ? [] : [{ role: 'system', content: SYSTEM_PROMPT + SERVERLESS_PROMPT_SUFFIX }];
    // ...and that includes a system message carrying the project kit, so the
    // kit rides in as part of the FIRST user turn instead. That is its honest
    // authority level anyway (repo content is the user talking), and merging
    // it into the turn keeps the history strictly alternating.
    const kit = formatKit((await loadKit()).text);
    if (kit) content = `${kit}\n\n---\n\n${text}`;
  }
  nearaiMessages.push({ role: 'user', content });
  setPhase(`${cfg.model.split('/').pop()} thinking…`);
  try {
    const { usage } = await runAgentTurn({
      // The signal rides on every request of the turn, so Stop lands mid-loop
      // rather than only between tool calls.
      // The pass rides on every request of the turn; a 402 mid-turn (expiry,
      // or spending it in another tab) is caught below and offered, not thrown.
      fetchFn: async (url, init) => {
        const res = await fetch(url, { ...withPass(init), signal: nearaiAbort.signal });
        if (res.status === 402) {
          // The server is the authority on validity, so a rejected pass is
          // dead weight — drop it rather than resend it on every retry.
          clearPass();
          throw Object.assign(new Error('payment required'), { paymentRequired: true });
        }
        return res;
      },
      baseUrl: cfg.baseUrl,
      apiKey: cfg.apiKey,
      model: cfg.model,
      sendTools: !cfg.proxy,
      messages: nearaiMessages,
      runTool: (name, args) => new Promise((resolve, reject) => {
        // reuse the same serialization as WS tool calls; once the tool is
        // done, everything after is the model reading the result — reset the
        // phase so its time isn't blamed on the tool ("running compile… 49s").
        toolQueue = toolQueue.then(() => runNearaiServerlessTool(name, args)
          .then(resolve, reject)
          .finally(() => setPhase(`${cfg.model.split('/').pop()} thinking…`)));
      }),
      onText: (t) => { appendAgentText(t); setPhase('responding…'); },
      onToolCall: (name, args) => { addLine('tool', `⚙ ${name}`); setPhase(`running ${name}…`); },
      onRetry: (status, delayMs, attempt) => { addLine('tool', `— ${status === 429 ? 'rate limited' : `upstream ${status}`}; retry ${attempt} in ${delayMs / 1000}s —`); setPhase(`retrying (${status})…`); },
    });
    const agentText = agentMsgEl ? agentMsgEl.textContent : '';
    if (agentText) { conversation.push({ role: 'agent', text: agentText }); saveSession(); }
    finishAgentMessage();
    stopActivity(`done ✓ (${usage?.total_tokens ?? '?'} tokens)`);
  } catch (e) {
    // A user-requested stop is not a failure — don't report it as one.
    if (e?.name === 'AbortError' || nearaiAbort?.signal.aborted) {
      addLine('tool', '— stopped —');
      finishAgentMessage();
      stopActivity('stopped');
    } else if (e?.paymentRequired) {
      // Not an error either: the turn is simply waiting to be paid for. The
      // typed message is kept so buying a pass resumes it instead of losing it.
      nearaiMessages.pop();
      finishAgentMessage();
      stopActivity('needs a session pass');
      offerPass(() => { setBusy(true); runNearaiTurn(text); });
      nearaiAbort = null;
      return;
    } else {
      addLine('error', `⚠ ${e?.message || e}`);
      finishAgentMessage();
      stopActivity('error ✗');
    }
  }
  nearaiAbort = null;
  setBusy(false);
}

// ---- tiny UI helpers --------------------------------------------------------
const shortName = (n) => (n || '').replace(/^mcp__studio__/, '');

function el(id) { return shadow.getElementById(id); }
function setStatus(s) { const e = el('studioagentstatus'); if (e) e.textContent = `agent: ${s}`; }
function setBusy(b) {
  const send = el('studioagentsend');
  if (send) { send.disabled = b; send.textContent = b ? '…' : 'Send'; }
  // Stop is only offered while a turn is actually running.
  const stop = el('studioagentstop');
  if (stop) { stop.style.display = b ? '' : 'none'; stop.disabled = false; stop.textContent = 'Stop'; }
}

// Stop the running turn. The audio graph is untouched — whatever is playing
// keeps playing; only the agent's turn ends. That is the whole point on stage:
// a turn that has gone wrong costs a bar of vamping, not the performance.
function abortTurn() {
  const stop = el('studioagentstop');
  if (stop) { stop.disabled = true; stop.textContent = 'stopping…'; }
  if (nearaiConfig()) {
    if (nearaiAbort) nearaiAbort.abort();
    return;
  }
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ t: 'abort' }));
  }
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
let phaseStartMs = 0;
let activityPhase = '';
let spinIdx = 0;
function startActivity() {
  turnStartMs = Date.now();
  phaseStartMs = turnStartMs;
  activityPhase = 'thinking…';
  const s = el('studioagentstatus');
  if (s) { s.classList.add('working'); s.classList.remove('idle'); }
  if (activityTimer) clearInterval(activityTimer);
  activityTimer = setInterval(renderActivity, 150);
  renderActivity();
}
function setPhase(p) { activityPhase = p; phaseStartMs = Date.now(); if (activityTimer) renderActivity(); }
function renderActivity() {
  spinIdx = (spinIdx + 1) % SPIN.length;
  const secs = Math.floor((Date.now() - turnStartMs) / 1000);
  const phaseSecs = Math.floor((Date.now() - phaseStartMs) / 1000);
  // Per-phase elapsed first (what THIS step has taken), turn total after —
  // "running compile… 751s" used to show turn time under the last tool's name.
  setStatus(`${SPIN[spinIdx]} ${activityPhase} ${phaseSecs}s · ${secs}s total`);
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
    // Escape stops a running turn without reaching for the mouse — the one
    // interaction worth having a shortcut for when a set is in progress.
    if (e.key === 'Escape') { e.preventDefault(); abortTurn(); }
  });
  el('studioagentstop').addEventListener('click', abortTurn);

  loadSession(); // restore prior conversation from the OPFS repo (if any)
  connect();

  // Test hook: lets e2e specs invoke the agent's browser tools exactly as a
  // tool_call from the server would (e.g. write_faust editor-refresh spec).
  window.studioAgentRunTool = (name, args) => registry[name]?.(args || {});
}
