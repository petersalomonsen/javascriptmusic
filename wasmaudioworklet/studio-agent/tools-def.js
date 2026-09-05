// The studio agent's tool set — declared ONCE, for every provider.
//
// Two provider paths consume this:
//   • the local Agent SDK process (tools/studio-agent/server.mjs) turns each
//     def into an in-process MCP tool (JSON Schema -> zod there);
//   • the in-browser NEAR AI loop (nearai-core.js) sends them as
//     OpenAI function-calling definitions — and the Pages Function proxy
//     (functions/nearai/[[path]].js) injects that same list server-side.
//
// It used to be two hand-maintained lists with a "keep them in sync" comment;
// they drifted the first time a tool was added (the shader tools reached the
// SDK path only). Pure data, no imports, so both Node and the browser can read
// it, and tools-def.test.mjs checks it stays coherent.
//
// `where` says who executes the call:
//   'browser'  — proxied to the browser tool registry (client.js)
//   'loadfile' — reads a repo file and pushes it into an editor: server-side
//                from disk in the SDK path, via the jsDelivr CDN in the browser
//   'repofile' — reads a repo reference file for the model. Serverless ONLY;
//                the local SDK agent has its own Read/Glob/Grep instead.

const str = (description) => ({ type: 'string', description });
const num = (description) => ({ type: 'number', description });
const bool = (description) => ({ type: 'boolean', description });
const obj = (properties, required = []) => ({ type: 'object', properties, required });

const editParams = obj({
    old_string: str('exact text to find'),
    new_string: str('replacement text'),
    replace_all: bool('replace every occurrence instead of requiring a unique match'),
}, ['old_string', 'new_string']);

const grepParams = obj({
    pattern: str('regular expression'),
    context: num('lines of surrounding context to include'),
}, ['pattern']);

export const TOOL_DEFS = [
    // ---- song ----
    { name: 'get_song', where: 'browser', description: 'Return the current song document (JavaScript sequencer DSL).', parameters: obj({}) },
    { name: 'set_song', where: 'browser', description: 'Replace the entire song document. Provide the full new source. The result carries any step-pattern warnings found in the new source (miscounted slots, a layered part that outruns the awaited beat-keeper) — read them before compiling.', parameters: obj({ source: str('full new song source') }, ['source']) },
    { name: 'edit_song', where: 'browser', description: 'Surgically find-and-replace in the song document IN PLACE. old_string must match exactly and be unique unless replace_all is true. The result carries any step-pattern warnings found in the edited source — read them before compiling.', parameters: editParams },
    { name: 'grep_song', where: 'browser', description: 'Search the CURRENT in-browser song document for a regex; returns matching line numbers + text.', parameters: grepParams },

    // ---- synth ----
    { name: 'get_synth', where: 'browser', description: 'Return the current synth document (AssemblyScript).', parameters: obj({}) },
    { name: 'set_synth', where: 'browser', description: 'Replace the entire synth document. Provide the full new source.', parameters: obj({ source: str('full new synth source') }, ['source']) },
    { name: 'edit_synth', where: 'browser', description: 'Surgically find-and-replace in the synth document IN PLACE (like the Edit tool). Use this to add a voice/channel to a large synth (e.g. the DX7 bundle) WITHOUT rewriting it. old_string must match exactly and be unique unless replace_all is true.', parameters: editParams },
    { name: 'grep_synth', where: 'browser', description: 'Search the CURRENT in-browser synth document for a regex; returns matching line numbers + text (optionally with surrounding context lines). Use to find exact anchors for edit_synth in a large synth without dumping the whole file.', parameters: grepParams },

    // ---- visualizer shader ----
    { name: 'get_shader', where: 'browser', description: "Return the current visualizer shader document (GLSL ES 1.00 fragment shader). This is what the song's visuals actually render through — read it before concluding anything about what is or is not on screen.", parameters: obj({}) },
    { name: 'set_shader', where: 'browser', description: 'Replace the entire visualizer shader document. Provide the full new GLSL source. Reports back any visuals the song schedules that the new shader still cannot show.', parameters: obj({ source: str('full new GLSL fragment shader source') }, ['source']) },
    { name: 'edit_shader', where: 'browser', description: 'Surgically find-and-replace in the visualizer shader document IN PLACE. old_string must match exactly and be unique unless replace_all is true. Reports back any visuals the song schedules that the shader still cannot show.', parameters: editParams },
    { name: 'grep_shader', where: 'browser', description: 'Search the CURRENT in-browser shader document for a regex; returns matching line numbers + text. Use it to check which uniforms the shader declares (e.g. "uText|uSampler|uniform float") before editing the song\'s visuals.', parameters: grepParams },

    // ---- Faust instruments (OPFS faust/ folder; needs ?gitrepo= mode) ----
    { name: 'write_faust', where: 'browser', description: 'Author an INSTRUMENT in Faust: write faust/<path>.dsp AND transpile it to AssemblyScript in one step (persists faust/<name>.dsp + faust/<name>.ts in the browser OPFS). Returns the generated class names to import into synth.ts, or the exact transpile error. This is the primary way to create instrument DSP — do NOT hand-write DSP in AssemblyScript.', parameters: obj({ path: str('faust file basename, e.g. "bass"'), source: str('faust dsp source') }, ['path', 'source']) },
    { name: 'edit_faust', where: 'browser', description: "Surgically find-and-replace inside a Faust .dsp AND re-transpile it, exactly as write_faust does. PREFER THIS over write_faust for any instrument that already exists: write_faust replaces the whole file, so composing one from what you wrote earlier discards any hand edit the user has made since. old_string must match exactly and be unique unless replace_all is true.", parameters: obj({ path: str('instrument name or faust/<name>.dsp'), old_string: str('exact text to find'), new_string: str('replacement text'), replace_all: bool('replace every occurrence instead of requiring a unique match') }, ['path', 'old_string', 'new_string']) },
    { name: 'read_faust', where: 'browser', description: 'Read a Faust .dsp instrument source from the browser OPFS faust/ folder.', parameters: obj({ path: str('faust file basename') }, ['path']) },
    { name: 'list_faust', where: 'browser', description: 'List the .dsp Faust instruments in the browser OPFS faust/ folder.', parameters: obj({}) },

    // ---- git history of the in-browser OPFS repo ----
    { name: 'git_log', where: 'browser', description: 'Show the commit history of the in-browser OPFS repo (the user commits their work here). Use it to find a commit to restore a file from.', parameters: obj({}) },
    { name: 'read_committed', where: 'browser', description: 'Read the COMMITTED content of a file from the OPFS git repo at a ref (default HEAD). Path is repo-relative (e.g. "song.js", "faust/bass.dsp"). Use ONLY when the user says something was lost: read_committed then set_song/set_synth it back. An editor that differs from HEAD is the normal state of someone working — do not offer to restore a difference the user has not complained about.', parameters: obj({ path: str('repo-relative path'), ref: str('git ref, default HEAD') }, ['path']) },

    // ---- build / transport ----
    { name: 'compile', where: 'browser', description: "SAVE + compile the current song+synth in the browser (same as the app's save button). If a track is already playing, the changes are applied and audible immediately. Returns \"compiled OK\" or the exact compiler error. Call after every edit. There is NO play tool — the user starts playback themselves.", parameters: obj({}) },
    { name: 'probe_instrument', where: 'browser', description: "Play notes into the COMPILED synth offline and measure the audio (run compile first). Returns peak, RMS, dominant frequency and spectral centroid per note — or SILENT. This is the ONLY way to know a sound exists: a Faust voice with no `gate` compiles, registers and plays nothing. Also verifies note mapping: if two notes return the same spectrum they are the same sound, so there is no per-note drum mapping. Use it before telling the user an instrument is ready.", parameters: obj({ channel: num('MIDI channel to play (default 0)'), notes: str('comma-separated notes, e.g. "c3,fs3" (default c3,c4,c5)'), hold: num('seconds to hold the note (default 0.4)'), velocity: num('note-on velocity 1-127 (default 100)') }) },
    { name: 'song_summary', where: 'browser', description: "What the song ACTUALLY plays, read from the compiled MIDI event list (run compile first). Returns a compact digest: song length (flagged when it is not a whole number of bars, or when the last sound lands well before the end — both mean a pattern did not add up), and per channel the note count, beat range and bars it sounds in — plus any pair of channels that NEVER sound in the same bar. This is how you VERIFY a song without hearing it: if the user asked for instruments to play together, their bars must overlap here. Reports facts about structure only — it says nothing about how anything SOUNDS.", parameters: obj({}) },
    { name: 'stop', where: 'browser', description: "Stop live audio playback. Only on the user's request.", parameters: obj({}) },

    // ---- scripting: compute an edit instead of retyping note data ----
    { name: 'run_script', where: 'browser', description: "Run a small JavaScript program in the browser sandbox to COMPUTE an edit from the documents instead of retyping note data by hand. `code` is the body of an async function. In scope: `song`, `synth`, `shader` (the current documents as strings), `events` (the last compiled MIDI event list [{time ms, message:[status,data1,data2]}] or null), `bpm`; helpers `findPlayBlocks(text)` (every `<track>.play(...)` call: {track, start, end, text, inner, notes}), `parseNotes(text)` ([{beat, note, name, duration, velocity}] — a row with several notes is a chord; control changes come as {beat, cc, value}), `formatNotes(notes, {indent, chords})` (back to `[ beat, name(dur, vel) ]` rows), `groupByBeat(notes, tolerance)` (notes that start together — 2+ = a chord, 1 = melody), `quantizeBeat(beat, stepsPerBeat, pct)`, `noteNumber(name)`, `noteName(n)`; `print(...)` to report; `await setSong(text)` / `setSynth(text)` / `setShader(text)` to write a document back (the song write reports step-pattern warnings). Returns what you printed, the return value, and what was written. USE IT for anything derived from existing notes — separating chords from a melody, quantizing, moving or transposing a take, velocity changes, harmonizing against a chord map, doubling a part — and whenever more than a handful of notes would otherwise pass through your context: a script keeps the user's velocities and durations, a retype does not. 20s limit, no network, no DOM; small literal edits still belong to edit_song.", parameters: obj({ code: str('JavaScript source — the body of an async function (top-level await and return allowed)') }, ['code']) },

    // ---- repository files ----
    { name: 'load_synth_from_file', where: 'loadfile', target: 'synth', description: 'Load a repository file DIRECTLY into the synth editor without reading it into context. Use this for large bundles (e.g. examples/dx7/dx7-synth.ts) — pass a repo-relative path.', parameters: obj({ path: str('repo-relative path') }, ['path']) },
    { name: 'load_song_from_file', where: 'loadfile', target: 'song', description: 'Load a repository file DIRECTLY into the song editor without reading it into context — pass a repo-relative path.', parameters: obj({ path: str('repo-relative path') }, ['path']) },
    { name: 'read_repo_file', where: 'repofile', description: 'Read a reference file from the javascriptmusic repository (examples, docs). Path is repo-relative, e.g. "wasmaudioworklet/docs/song-api.md" or "examples/beachdrive/song.js". Do NOT use for huge bundles — use load_synth_from_file for those.', parameters: obj({ path: str('repo-relative path') }, ['path']) },
];

export const browserToolNames = () => TOOL_DEFS.filter((d) => d.where === 'browser').map((d) => d.name);
export const toolDefsFor = (where) => TOOL_DEFS.filter((d) => d.where === where);

// Every tool the SDK path exposes: browser-proxied + the server-side file
// loaders. read_repo_file is excluded — that path has built-in Read/Glob/Grep.
export const sdkToolNames = () =>
    TOOL_DEFS.filter((d) => d.where === 'browser' || d.where === 'loadfile').map((d) => d.name);
