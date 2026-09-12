// A headless studio: every tool the browser registry offers the agents, in
// Node, over an in-memory project — so the producer and the instrument
// specialist can be run and measured without a browser, a human, or speakers.
//
// It is faithful where fidelity matters: the song compiles in the same QuickJS
// sandbox, Faust transpiles with the same wasm compiler module the app ships,
// the synth compiles with the same asc flags into the same assembly scaffold,
// probing renders the same wasm and measures with the same analysis code, and
// the tool results are worded as client.js words them. What it does not do is
// anything only a browser can: OPFS, git history, GLSL compilation, playback.
//
//   const studio = createHeadlessStudio({ project: { song, synth, faust: { bass: dspSource } } });
//   await studio.call('write_faust', { path: 'lead', source });   // → { ok, result }
//   studio.state.song / .synth / .faust / .events / .wasm          // what the agents made
//   studio.calls                                                   // every tool call, with timing

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileSong } from '../../../wasmaudioworklet/midisequencer/songcompiler.js';
import * as core from '../../../wasmaudioworklet/studio-agent/tools-core.js';
import { runAgentScript, formatScriptResult } from '../../../wasmaudioworklet/studio-agent/script-sandbox.js';
import { probeNote, probeNotes, formatProbeReport } from '../../../wasmaudioworklet/audioprobe/instrumentprobe.js';
import { measureMix } from '../../../wasmaudioworklet/audioprobe/mixprobe.js';
import { formatMixReport, resolveTarget } from '../../../wasmaudioworklet/audioprobe/mixanalysis.js';
import { autoMaster, formatAutoMasterReport } from '../../../wasmaudioworklet/audioprobe/automaster.js';
import { parseNote, noteName } from '../../../wasmaudioworklet/audioprobe/audioanalysis.js';
import { buildSynthWasm, REPO } from '../../instrumenttest/headless.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FAUST2ASC = path.join(REPO, 'tools', 'faust2as', 'faust2asc.js');
// The compiler module the APP ships (the npm package the browser fetches from
// the CDN). faust2asc.js would otherwise prefer a gitignored local drop at
// wasmaudioworklet/faust/faust_wasm_ffi.wasm, and a stale one there produced
// output the browser never produces (table-init functions duplicated into the
// effect preamble → duplicate identifiers at compile). The bench measures what
// users get, so it pins the published module; FAUST_RS_COMPILER_MODULE still
// overrides for developer builds.
const SHIPPED_MODULE = path.join(REPO, 'tools', 'faust2as', 'node_modules', '@psalomo', 'wasm-music-faust', 'faust-compiler-module.wasm');
const compilerEnv = () => ({
  ...process.env,
  ...(process.env.FAUST_RS_COMPILER_MODULE || !fs.existsSync(SHIPPED_MODULE) ? {} : { FAUST_RS_COMPILER_MODULE: SHIPPED_MODULE }),
});
const EMPTY_SYNTH_PATH = path.join(REPO, 'wasmaudioworklet', 'synth1', 'assembly', 'mixes', 'emptymidi.mix.ts');

/** The synth document a fresh project starts with (what the app loads too). */
export const emptySynth = () => fs.readFileSync(EMPTY_SYNTH_PATH, 'utf8');

// The class name the app derives for faust/<stem>.dsp (faust2asc does the same).
const classNameFor = (stem) => stem.charAt(0).toUpperCase() + stem.slice(1).replace(/MIDI$/i, '');

// The bench creates many studios from fixtures that share the same .dsp files;
// a transpile is ~1s, so identical sources are transpiled once per process.
const transpileCache = new Map();

/** Transpile one .dsp with the wasm compiler module; returns the editor-form .ts or throws with the compiler's message. */
export function transpileDsp(stem, dsp) {
  const key = `${stem}\u0000${dsp}`;
  if (transpileCache.has(key)) return transpileCache.get(key);
  const ts = transpileDspUncached(stem, dsp);
  transpileCache.set(key, ts);
  return ts;
}

function transpileDspUncached(stem, dsp) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'headless-faust-'));
  const dspPath = path.join(dir, `${stem}.dsp`);
  const tsPath = path.join(dir, `${stem}.ts`);
  fs.writeFileSync(dspPath, dsp);
  try {
    execFileSync('node', [FAUST2ASC, dspPath, '--name', classNameFor(stem), '--for-editor', '--out', tsPath], { stdio: 'pipe', env: compilerEnv() });
    return fs.readFileSync(tsPath, 'utf8');
  } catch (e) {
    const out = `${e.stdout || ''}${e.stderr || ''}`.trim();
    throw new Error(out || e.message);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export function createHeadlessStudio({ project = {}, repoRoot = REPO } = {}) {
  const state = {
    song: project.song ?? '',
    synth: project.synth ?? emptySynth(),
    shader: project.shader ?? '',
    faust: new Map(),        // stem → { dsp, ts }
    events: null,            // the last compiled MIDI event list
    wasm: null,              // the last compiled synth (bytes)
  };
  for (const [stem, dsp] of Object.entries(project.faust ?? {})) {
    state.faust.set(core.normDsp(stem).replace(/\.dsp$/, ''), { dsp, ts: transpileDsp(stem.replace(/\.dsp$/, ''), dsp) });
  }
  const calls = [];

  const editDoc = (which, args) => {
    const r = core.applyEditToText(state[which], args);
    if (r.error) return { __error: r.error };
    state[which] = r.text;
    return r;
  };
  const grepDoc = (which, args) => String(core.grepText(state[which], args));
  const summary = () => core.summarizeSongEvents(state.events, core.songBpmFromSource(state.song), {
    instruments: core.declaredInstruments(state.song),
    playFromHereLine: core.playFromHereLine(state.song),
  });
  const firstNoteOn = (channel) => {
    for (const evt of state.events || []) {
      const [status, note, velocity] = evt.message || [];
      if (status !== undefined && (status & 0xf0) === 0x90 && velocity > 0 && (status & 0x0f) === channel) return note;
    }
    return null;
  };
  const repoFile = (p) => {
    const full = path.resolve(repoRoot, String(p || '').replace(/^\/+/, ''));
    if (!full.startsWith(repoRoot + path.sep)) throw new Error(`path escapes the repository: ${p}`);
    return fs.readFileSync(full, 'utf8');
  };
  const faustFiles = () => Object.fromEntries([...state.faust].filter(([, f]) => f.ts).map(([stem, f]) => [`faust/${stem}.ts`, f.ts]));

  const tools = {
    // ---- song ----
    get_song: async () => state.song,
    set_song: async ({ source }) => { state.song = source ?? ''; return ['song updated', ...core.songSourceWarnings(state.song)].join(' '); },
    edit_song: async (args) => { const r = editDoc('song', args); if (r.__error) return r; return [`song edited (${r.count} replacement(s))`, ...core.songSourceWarnings(state.song)].join(' '); },
    grep_song: async (args) => grepDoc('song', args),
    // ---- synth ----
    get_synth: async () => state.synth,
    set_synth: async ({ source }) => { state.synth = source ?? ''; return 'synth updated'; },
    edit_synth: async (args) => { const r = editDoc('synth', args); if (r.__error) return r; return `synth edited (${r.count} replacement(s))`; },
    grep_synth: async (args) => grepDoc('synth', args),
    // ---- shader (text only: no GLSL compiler here) ----
    get_shader: async () => state.shader || '(no shader — the shader editor is empty)',
    set_shader: async ({ source }) => { state.shader = source ?? ''; return 'shader updated'; },
    edit_shader: async (args) => { const r = editDoc('shader', args); if (r.__error) return r; return `shader edited (${r.count} replacement(s))`; },
    grep_shader: async (args) => grepDoc('shader', args),
    render_shader: async () => ({ __error: 'render_shader needs a browser (WebGL) — the headless studio cannot render frames' }),
    // ---- faust ----
    list_faust: async () => { const names = [...state.faust.keys()].map((s) => `${s}.dsp`); return names.length ? names.join('\n') : '(no .dsp instruments yet)'; },
    read_faust: async ({ path: p }) => { const f = state.faust.get(core.normDsp(p).replace(/\.dsp$/, '')); return f ? f.dsp : { __error: `no such instrument: ${core.normDsp(p)}` }; },
    write_faust: async ({ path: p, source }) => {
      const rel = core.normDsp(p);
      const stem = rel.replace(/\.dsp$/, '');
      const t0 = Date.now();
      let ts;
      try { ts = transpileDsp(stem, source); } catch (e) { return { __error: `Faust transpile failed for ${rel}:\n${e.message}` }; }
      state.faust.set(stem, { dsp: source, ts });
      return `${core.faustRegistrationHint(ts, stem).message} [timing: ${((Date.now() - t0) / 1000).toFixed(1)}s total (headless)]`;
    },
    edit_faust: async ({ path: p, old_string, new_string, replace_all }) => {
      const rel = core.normDsp(p);
      const f = state.faust.get(rel.replace(/\.dsp$/, ''));
      if (!f) return { __error: `edit_faust ${rel}: no such instrument` };
      const edited = core.applyEditToText(f.dsp, { old_string, new_string, replace_all });
      if (edited.error) return { __error: `edit_faust ${rel}: ${edited.error}` };
      const result = await tools.write_faust({ path: rel, source: edited.text });
      if (result && result.__error) return result;
      return `${rel} edited (${edited.count} replacement(s)) and re-transpiled. ${result}`;
    },
    // ---- git (none here) ----
    git_log: async () => '(no git history in the headless studio)',
    read_committed: async ({ path: p }) => ({ __error: `no git history in the headless studio (asked for ${p})` }),
    // ---- build ----
    compile: async () => {
      try { state.events = await compileSong(state.song); }
      catch (e) { return { __error: `song: ${e?.message || e}` }; }
      try { state.wasm = buildSynthWasm({ 'mixes/midi.mix.ts': state.synth, ...faustFiles() }).bytes; }
      catch (e) { return { __error: String(e?.message || e) }; }
      const s = summary();
      const warnings = core.songEventWarnings(s);
      // Whether anything is actually AUDIBLE — the same check the app makes.
      let probed = 0;
      for (const channel of s.sounding || []) {
        if (probed >= 4) { warnings.push(`(audio probe stopped after ${probed} channel(s) — run probe_instrument on the rest if you need to check them)`); break; }
        const note = firstNoteOn(channel.channel);
        if (note === null) continue;
        probed++;
        const r = await probeNote(state.wasm, { channel: channel.channel, note, holdSeconds: 0.2, tailSeconds: 0.15 });
        if (r.silent) {
          warnings.push(`WARNING: channel ${channel.channel} plays ${channel.notes} note(s) but produces NO SOUND `
            + `(probed ${noteName(note)}). It compiled and registered — do NOT report this as ready. `
            + 'A Faust voice is triggered ONLY by `gate`: an instrument that declares none, or drives its envelope from a '
            + 'control of its own naming, is silent however good the DSP is. Fix the .dsp, compile, and probe again.');
        }
      }
      return ['compiled OK', ...warnings].join('\n');
    },
    probe_instrument: async ({ channel = 0, notes, hold, velocity } = {}) => {
      if (!state.wasm) return { __error: 'No compiled synth yet — call compile first.' };
      let noteNumbers;
      try { noteNumbers = (notes ? String(notes).split(',') : ['c3', 'c4', 'c5']).map((n) => n.trim()).filter(Boolean).map(parseNote); }
      catch (e) { return { __error: String(e.message || e) }; }
      if (!noteNumbers.length) return { __error: 'no notes to probe' };
      let results;
      try {
        results = await probeNotes(state.wasm, noteNumbers, { channel: Number(channel) || 0, holdSeconds: hold > 0 ? Number(hold) : 0.4, velocity: velocity > 0 ? Number(velocity) : 100 });
      } catch (e) { return { __error: `probe failed: ${e.message || e}` }; }
      return formatProbeReport(results);
    },
    probe_mix: async ({ target, targetLufs, truePeakDb, tail } = {}) => {
      if (!state.wasm) return { __error: 'No compiled synth yet — call compile first.' };
      if (!state.events || !state.events.length) return { __error: 'No compiled song yet — call compile first.' };
      try {
        const a = await measureMix(state.wasm, state.events, { sampleRate: 44100, tailSeconds: tail > 0 ? Number(tail) : 1.5, bpm: core.songBpmFromSource(state.song) });
        return formatMixReport(a, resolveTarget({ target, targetLufs, truePeakDb }));
      } catch (e) { return { __error: `mix probe failed: ${e?.message || e}` }; }
    },
    auto_master: async ({ target, targetLufs, truePeakDb, maxIterations } = {}) => {
      if (!state.events || !state.events.length) return { __error: 'No compiled song yet — call compile first.' };
      const t = resolveTarget({ target, targetLufs, truePeakDb });
      const bpm = core.songBpmFromSource(state.song);
      const build = (src) => buildSynthWasm({ 'mixes/midi.mix.ts': src, ...faustFiles() }).bytes;
      let r;
      try {
        r = await autoMaster({
          source: state.synth, target: t,
          compile: async (src) => build(src),
          measure: (bytes) => measureMix(bytes, state.events, { sampleRate: 44100, tailSeconds: 1.5, bpm }),
          maxIterations: maxIterations > 0 ? Number(maxIterations) : 6,
        });
      } catch (e) { return { __error: `auto_master failed: ${e?.message || e}` }; }
      if (r.final && r.source !== state.synth) {
        state.synth = r.source;
        try { state.wasm = build(state.synth); } catch (e) { return { __error: String(e?.message || e) }; }
      }
      return formatAutoMasterReport(r) + (r.final ? '\n\nsynth.ts updated and compiled.' : '');
    },
    song_summary: async () => {
      if (!state.events) return { __error: 'No compiled song yet — call compile first.' };
      return core.formatSongSummary(summary());
    },
    stop: async () => 'stopped',
    // ---- scripting ----
    run_script: async ({ code }) => {
      const values = { song: state.song, synth: state.synth, shader: state.shader, events: state.events, bpm: core.songBpmFromSource(state.song) };
      const write = async (name, text) => {
        const before = state[name].split('\n').length;
        state[name] = text;
        return { message: `${name} updated (${before} → ${text.split('\n').length} lines)`, warnings: name === 'song' ? core.songSourceWarnings(text) : [] };
      };
      let result;
      try { result = await runAgentScript(String(code || ''), values, { write }); }
      catch (e) { return { __error: String(e?.message || e) }; }
      const text = formatScriptResult(result);
      return result.error ? { __error: text } : text;
    },
    // ---- repository files (the OpenAI path runs these in the studio; the SDK path reads them server-side) ----
    read_repo_file: async ({ path: p }) => { const t = repoFile(p); return t.length > 100000 ? `${t.slice(0, 100000)}\n…[truncated — file is ${t.length} chars]` : t; },
    load_synth_from_file: async ({ path: p }) => { const c = repoFile(p); state.synth = c; return `loaded ${p} (${c.split('\n').length} lines) into the synth editor`; },
    load_song_from_file: async ({ path: p }) => { const c = repoFile(p); state.song = c; return `loaded ${p} (${c.split('\n').length} lines) into the song editor`; },
  };

  /** Run one tool the way the WS protocol answers: { ok, result }. Records every call. */
  async function call(name, args = {}) {
    const fn = tools[name];
    const t0 = Date.now();
    const entry = { name, args, ms: 0, ok: false };
    calls.push(entry);
    if (!fn) { entry.result = `unknown tool ${name}`; entry.ms = Date.now() - t0; return { ok: false, result: entry.result }; }
    try {
      const r = await fn(args || {});
      entry.ms = Date.now() - t0;
      if (r && r.__error) { entry.result = r.__error; return { ok: false, result: r.__error }; }
      entry.ok = true;
      entry.result = typeof r === 'string' ? r : JSON.stringify(r);
      return { ok: true, result: entry.result };
    } catch (e) {
      entry.ms = Date.now() - t0;
      entry.result = String(e?.message || e);
      return { ok: false, result: entry.result };
    }
  }

  /** The OpenAI-path signature: returns the text, throws on failure. */
  async function runTool(name, args) {
    const r = await call(name, args);
    if (!r.ok) throw new Error(r.result);
    return r.result;
  }

  return { state, calls, call, runTool, repoRoot, toolNames: Object.keys(tools) };
}
