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
    { name: 'set_song', where: 'browser', description: 'Replace the entire song document. Provide the full new source.', parameters: obj({ source: str('full new song source') }, ['source']) },
    { name: 'edit_song', where: 'browser', description: 'Surgically find-and-replace in the song document IN PLACE. old_string must match exactly and be unique unless replace_all is true.', parameters: editParams },
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
    { name: 'read_faust', where: 'browser', description: 'Read a Faust .dsp instrument source from the browser OPFS faust/ folder.', parameters: obj({ path: str('faust file basename') }, ['path']) },
    { name: 'list_faust', where: 'browser', description: 'List the .dsp Faust instruments in the browser OPFS faust/ folder.', parameters: obj({}) },

    // ---- git history of the in-browser OPFS repo ----
    { name: 'git_log', where: 'browser', description: 'Show the commit history of the in-browser OPFS repo (the user commits their work here). Use it to find a commit to restore a file from.', parameters: obj({}) },
    { name: 'read_committed', where: 'browser', description: 'Read the COMMITTED content of a file from the OPFS git repo at a ref (default HEAD). Path is repo-relative (e.g. "song.js", "faust/bass.dsp"). Use to restore something overwritten in the editor: read_committed then set_song/set_synth it back.', parameters: obj({ path: str('repo-relative path'), ref: str('git ref, default HEAD') }, ['path']) },

    // ---- build / transport ----
    { name: 'compile', where: 'browser', description: "SAVE + compile the current song+synth in the browser (same as the app's save button). If a track is already playing, the changes are applied and audible immediately. Returns \"compiled OK\" or the exact compiler error. Call after every edit. There is NO play tool — the user starts playback themselves.", parameters: obj({}) },
    { name: 'probe_instrument', where: 'browser', description: "Play notes into the COMPILED synth offline and measure the audio (run compile first). Returns peak, RMS, dominant frequency and spectral centroid per note — or SILENT. This is the ONLY way to know a sound exists: a Faust voice with no `gate` compiles, registers and plays nothing. Also verifies note mapping: if two notes return the same spectrum they are the same sound, so there is no per-note drum mapping. Use it before telling the user an instrument is ready.", parameters: obj({ channel: num('MIDI channel to play (default 0)'), notes: str('comma-separated notes, e.g. "c3,fs3" (default c3,c4,c5)'), hold: num('seconds to hold the note (default 0.4)'), velocity: num('note-on velocity 1-127 (default 100)') }) },
    { name: 'song_summary', where: 'browser', description: "What the song ACTUALLY plays, read from the compiled MIDI event list (run compile first). Returns a compact digest: song length, and per channel the note count, beat range and bars it sounds in — plus any pair of channels that NEVER sound in the same bar. This is how you VERIFY a song without hearing it: if the user asked for instruments to play together, their bars must overlap here. Reports facts about structure only — it says nothing about how anything SOUNDS.", parameters: obj({}) },
    { name: 'stop', where: 'browser', description: "Stop live audio playback. Only on the user's request.", parameters: obj({}) },

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
