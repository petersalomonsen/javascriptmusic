# Notes for AI agents

Orientation for agents working in this repo (a WebAssembly music + visuals app).
Humans: see [README.md](README.md) and [wasmaudioworklet/docs](wasmaudioworklet/docs/README.md).

## Where things are
- `wasmaudioworklet/` — the app (synth engine, sequencer, visualizer, web UI).
- `wasmaudioworklet/docs/` — authoring & dev guides (start at its README).
- `tools/` — dev tooling: `faust2as` (Faust→AssemblyScript), `claude-bridge`
  (connect an agent to the app's editors), `shadertest` (shader harness).
- Songs/visuals are usually authored in separate NEAR-backed git repos loaded
  via `?gitrepo=` (see [git-hosting](wasmaudioworklet/docs/git-hosting.md)); a
  song project holds `song.js`, `synth.ts`, `shaders/`, `images/` and
  `wasmmusic.config.json`.

## Use the feedback loops (don't guess — verify)
You can't see the canvas or hear the audio, so lean on the headless checks:
- **Faust instruments**: render one headlessly and measure it with
  `tools/instrumenttest/render.mjs` — it transpiles the `.dsp`, compiles it into
  the real midisynth, sends actual MIDI notes to the wasm and reports peak/RMS
  and spectrum per note (exit 1 if anything is silent):
  `cd wasmaudioworklet && node ../tools/instrumenttest/render.mjs faust/kick.dsp --notes c3,fs3`.
  This is the only check that catches the worst Faust mistake — an instrument
  that transpiles, registers and compiles perfectly and makes **no sound**
  (usually a missing `gate`). It also answers whether notes map to different
  drums: same spectrum for every note means there is no mapping.
- **Visualizer shaders**: compile + render frames headlessly with
  `tools/shadertest/render.mjs` — see
  [docs/shaders.md](wasmaudioworklet/docs/shaders.md). Always compile-check after
  an edit; render frames at a few times/energies and read the PNGs before
  claiming a shader works.
- **Songs (`song.js`)**: compiling a song yields a MIDI event list — the ground
  truth for what it actually plays, and checkable without hearing it. Whether
  two instruments play together is a fact there: compile and compare note
  ranges per channel (the studio agent gets this as `song_summary`; see
  `summarizeSongEvents` in `wasmaudioworklet/studio-agent/tools-core.js`).
  It's ESM with top-level `await`, so a quick
  `node --check` catches syntax errors before loading in the app. Timing follows
  one model — calling a pattern schedules it at the playhead, `await` is the only
  thing that moves the playhead — so parts that sound together are plain calls
  and only the beat-keeper is awaited. Read
  [the playhead model](wasmaudioworklet/docs/song-api.md#how-a-song-works--the-playhead-model)
  before editing a song; the layering, `loopHere()` and wrapper-function rules
  are all consequences of it.
- **Faust / AssemblyScript / near-git**: Playwright suites under
  `wasmaudioworklet/e2e` (`npm run test-faust`, `test-near-git`, etc.).
  **New specs should take their own repo**: `?gitrepo=${specRepo('my-feature')}`
  gives an isolated local OPFS repo — a name the sandbox can't clone falls back
  to a persistent local one, and everything needing `?gitrepo=` mode (faust/,
  the agent's OPFS tools, git history) still works. The shared sandbox repo is
  mutated by every spec that uses it, and since CI retries failed tests, a
  half-finished attempt can strand state that breaks an unrelated spec later in
  the run. Use the shared repo only to exercise the real remote (clone, commit
  & sync, push).

## Key guides
- [Song API](wasmaudioworklet/docs/song-api.md), [Animations](wasmaudioworklet/docs/animations.md),
  [Shaders](wasmaudioworklet/docs/shaders.md)
- [faust2as](tools/faust2as/README.md), [claude-bridge](tools/claude-bridge/README.md)

## Conventions
- AssemblyScript synth code: `--runtime stub` (no GC), `StaticArray`, `f32` audio,
  `Mathf.*`, sample-by-sample `nextframe()`.
- Don't commit or push unless asked. If on the default branch, branch first.
