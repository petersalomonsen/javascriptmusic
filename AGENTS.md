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
- **Visualizer shaders**: compile + render frames headlessly with
  `tools/shadertest/render.mjs` — see
  [docs/shaders.md](wasmaudioworklet/docs/shaders.md). Always compile-check after
  an edit; render frames at a few times/energies and read the PNGs before
  claiming a shader works.
- **Songs (`song.js`)**: it's ESM with top-level `await`; a quick
  `node --check` catches syntax errors before loading in the app.
- **Faust / AssemblyScript / near-git**: Playwright suites under
  `wasmaudioworklet/e2e` (`npm run test-faust`, `test-near-git`, etc.).

## Key guides
- [Song API](wasmaudioworklet/docs/song-api.md), [Animations](wasmaudioworklet/docs/animations.md),
  [Shaders](wasmaudioworklet/docs/shaders.md)
- [faust2as](tools/faust2as/README.md), [claude-bridge](tools/claude-bridge/README.md)

## Conventions
- AssemblyScript synth code: `--runtime stub` (no GC), `StaticArray`, `f32` audio,
  `Mathf.*`, sample-by-sample `nextframe()`.
- Don't commit or push unless asked. If on the default branch, branch first.
