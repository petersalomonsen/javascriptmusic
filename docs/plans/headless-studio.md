# Headless studio — plan

*Status: proposal (2026-09-13). Nothing here is built yet except the pieces
listed under "What exists". Written to see the agent infrastructure as one
picture before it grows further.*

## The idea in one paragraph

A song project (song, synth, Faust instruments, shaders, images) is a git
repo. In the browser it lives in OPFS and the studio agent works on it through
the app's tools. Cloned to disk, the same repo should be workable by any agent
or human in a terminal: compile the song, build the synth, probe an instrument,
measure the mix, render a shader frame, play the result — all without the
browser. The **headless studio** is that: the app's measured tools packaged as
a library and CLI that a project pulls in through its own `package.json`.
Agent knowledge travels with the project using standard conventions: a
top-level `AGENTS.md` and a skills folder. Git is the sync between the two
worlds; nothing else needs to be.

## Lineage: this is where the repo started

The root commit (2018-07-15, then a Bitbucket repo called *nodemusic*) is a
headless Node composition tool: a `package.json` whose only dependency is
`midi`, `record.js` capturing a K-Board into `recording.json`, and
`playback.js` replaying it over a virtual MIDI port into ZynAddSubFX. Four
days later "Async await based pattern" introduced `waitForBeat` and
`playNote`; two months later the `steps()` tracker method. Both are still
the song API. The browser only arrived (2018-11-27, "web assembly audio
worklet") because the synth moved inside the process as wasm, and the
`midi` dependency did not leave `package.json` until 2021.

So the headless studio is the original shape with the one gap filled: in
2018 the terminal had the sequencer but not the sound. Now the sound is a
wasm module, and `node-web-audio-api` gives Node the worklet interface the
browser has, playing the role the `midi` package and an external synth played
then. The song still runs as JavaScript in both worlds.

## What exists

| Piece | Where | Runs without a browser? |
|---|---|---|
| Song compile (QuickJS sandbox) | `wasmaudioworklet/midisequencer/songcompiler.js` | yes |
| Faust → AssemblyScript | `@psalomo/wasm-music-faust` (published from CI) | yes |
| Synth build (asc, same scaffold as the app) | `tools/instrumenttest/headless.mjs` | yes |
| Instrument probe, mix probe, auto-master | `wasmaudioworklet/audioprobe/` | yes |
| Every studio tool, in memory | `tools/studio-agent/bench/headless-studio.mjs` | yes, except OPFS, git, GLSL, playback |
| Producer + specialists over a `backend.call(name, args)` interface | `tools/studio-agent/agent-core.mjs` | yes (the bench does it) |
| Shader compile + frame render | `tools/shadertest/render.mjs` (Playwright) | yes, via headless Chromium |
| `render_shader` (offscreen contact sheet, note uniforms from the song) | `wasmaudioworklet/visualizer/fragmentshader.js` | browser module; loadable in headless Chromium |
| Project kit (`AGENT.md` in the repo → system prompt) | `wasmaudioworklet/studio-agent/kit.js` | app only |
| Clone a NEAR-hosted project | `git-remote-near` | yes |
| Realtime playback of a compiled wasm in Node | [wasmmusicnode](https://github.com/petersalomonsen/wasmmusicnode) (`node-web-audio-api`) | yes |

So the headless studio is mostly an adapter over code that already runs in
Node. The gaps are: a project on disk instead of in memory, a package a repo
can depend on, playback, GLSL, and the conventions for instructions and skills.

## Target picture

```
  song project repo (git)                       javascriptmusic (the app repo)
  ├── song.js, synth.ts, faust/, shaders/       ├── wasmaudioworklet/   (app + engine)
  ├── wasmmusic.config.json                     ├── tools/studio-agent/ (producer, specialists, bench)
  ├── AGENTS.md            ← top-level agent    └── packages/wasm-music-headless/  ← NEW: library + CLI
  ├── .claude/skills/*/SKILL.md ← on-demand         (or published from wasmaudioworklet itself)
  └── package.json         ← depends on the headless package, scripts: compile/probe/render/play

  in the browser                                in a terminal (clone)
  ─────────────                                 ────────────────────
  studio agent (producer + specialists)         Claude Code / any agent in the clone
    tools → client.js registry                    files → Read/Edit/Bash (native)
    kit  ← AGENTS.md from OPFS                     instructions ← AGENTS.md (native)
    skills ← list_skills / read_skill (OPFS)       skills ← .claude/skills (native)
                                                  measured tools ← `wasm-music` CLI, or the MCP server
             ⇅ git (NEAR / GitHub via the CORS proxy) ⇅
```

Two consumers, one project layout, one tool implementation. The browser tier
keeps its own agent because the browser has no shell; the terminal tier does
not need a second producer, because the agent host already has files,
instructions and skills — it only lacks the *measured* tools, and those are
the part worth packaging.

## Conventions the project repo adopts

- **`AGENTS.md`** at the top level: the always-on instructions (what the
  app calls the kit today). Claude Code, Codex and most hosts read this name
  natively. The app's kit loader reads `AGENTS.md` first and falls back to
  `AGENT.md` so existing repos keep working. Stays under the current 20k-char
  cap: it is resent every turn.
- **`.claude/skills/<name>/SKILL.md`**: on-demand knowledge with the usual
  frontmatter (`name`, `description`). Claude Code discovers them natively in a
  clone. In the app, two small tools read the same files from OPFS:
  `list_skills` (names + descriptions, also listed in the kit so the agent
  knows they exist) and `read_skill(name)`. Candidates: the visual language of a
  piece ("Much": stage, dancer skeleton, camera moves), a motif catalogue, a
  mixing convention, per-instrument notes too long for the kit.
- **`package.json`** written by the app when it creates a repo (and offered
  to existing ones): a dependency on the headless package plus scripts.
  `node_modules` is gitignored; OPFS never installs it — the file is inert in
  the browser and only matters after a clone.
- **Shipped specialists vs project skills.** The instrument, mastering and
  (later) shader specialists are generic craft and stay in the app code. Project
  skills are the piece's own conventions and taste and live in the repo.
  `AGENTS.md` is the bridge: it says which skills exist and when to reach for
  them. Neither side needs the other's internals.

## The headless package

Working name `wasm-music-headless` (package name to decide; `wasm-music` is
the app package's name already). Published from CI by trusted publishing like
the Faust compiler module. Exports the functions the bench already has, plus a
`bin`:

```
wasm-music compile            # song → event list; the same warnings the app prints
wasm-music summary            # song_summary digest
wasm-music build              # synth (+ faust) → wasm, same asc flags as the app
wasm-music probe <ch> [notes] # probe_instrument
wasm-music mix [--target]     # probe_mix / auto_master
wasm-music script <file.js>   # run_script in the same sandbox, over the project files
wasm-music render --wav out.wav [--from s --to s]   # offline render (measureMix already renders)
wasm-music play [--from s]    # realtime playback (see below)
wasm-music shader --times 1,9,30 [--out sheet.jpg]  # render_shader; --compile-only
wasm-music mcp                # the same tools as an MCP server over stdio
```

Each command prints exactly the text the browser tool returns, so a session
transcript reads the same in both worlds and the prompt guidance stays true.

**Project on disk.** `createHeadlessStudio({ project })` gets a sibling
`createFsStudio(dir)`: reads `wasmmusic.config.json` to find the song, synth
and shader, reads and writes `faust/*.dsp`, and never touches git (git is the
user's or the agent's). Everything else is the existing in-memory studio.

**Playback.** wasmmusicnode shows the way: `node-web-audio-api` implements
`AudioWorkletNode`, so the app's own worklet processor runs in Node close to
unchanged, driven by the same compiled wasm and event list. That gives
`wasm-music play` for the human listening in the terminal, and it is the same
path the browser uses, so what plays is what the app would play.

**Shaders.** Headless Chromium through Playwright, as `tools/shadertest` does
today, but loading `visualizer/fragmentshader.js` itself so `render_shader`
headless is the same offscreen renderer with the same note-uniform replay.
Playwright is an optional dependency: everything audio works without it.

## Tools for the terminal agent: CLI first, MCP as a thin wrapper

The earlier editor bridge tried MCP and dropped it (2026-05): the server
wrapped *editing* ops that reinvented Edit, and it needed a live relay into
the browser, so every change meant restarting the relay, the browser and the
CLI. Neither applies here. The files are real files, so the agent edits them
natively; the server would expose only the measured tools; and it is
stateless per project directory, started by the host on demand over stdio.

Still, the CLI comes first. An agent with a shell and an `AGENTS.md` line per
command can already do everything, with zero configuration. `wasm-music mcp`
is then a few dozen lines over the same functions, for hosts that want typed
schemas and results (and the `render_shader` image as an image block, which a
CLI cannot give). The tool definitions come from `tools-def.js`, as they do for
the two providers today, so the three surfaces cannot drift.

## What stays in the browser

- Recording a performance (MIDI in, the human playing).
- The live UI: editors, playhead, visualizer on screen, the marketplace.
- OPFS itself. A clone is the terminal's OPFS.
- Video export (could move to headless later on the same drawFrame path).

## Phases

1. **Project on disk + CLI** — `createFsStudio`, the `bin` with compile,
   summary, build, probe, mix, script, render. Mostly moving the bench's studio
   behind a directory. Test: the bench's headless tests against a temp clone.
2. **Package + scaffold** — publish the package; the app writes `package.json`,
   `AGENTS.md` (from the current kit) and an empty skills folder into new
   repos; the kit loader learns `AGENTS.md`.
3. **Skills in the app** — `list_skills` / `read_skill` over OPFS; kit lists
   them. Same files work in Claude Code with no extra work.
4. **Shader headless** — `wasm-music shader`, Playwright optional dep, the
   real `renderShaderFrames`.
5. **Playback** — `wasm-music play` on `node-web-audio-api`, wasmmusicnode as
   the reference implementation.
6. **MCP wrapper** — `wasm-music mcp` over the same functions and defs.
7. **Studio agent in the terminal** (optional) — the producer + specialists
   over the fs backend, for bench parity and for hosts without their own agent.
   Not needed for Claude Code, which brings its own.

Phases 1–3 make a clone useful; 4–6 make it complete; 7 is a convenience.

## Open questions

- Package name and whether the app package itself is published (it carries
  the whole UI) or a slimmer `packages/` entry that imports the engine parts.
- Node version: CI is Node 20, local is 26; the package must state an engine
  range and be tested at the low end.
- `assemblyscript` as a project dependency is heavy but unavoidable for
  `build`; check install time on a fresh clone.
- Where the kit's 20k cap lives once `AGENTS.md` is also read natively by
  hosts that have no such cap — probably keep the cap only in the app loader.
- Whether `wasmmusic.config.json` should name the skills folder, or the
  convention is fixed.

## Not in scope

Live mirroring of editor buffers to disk (the claude-bridge). It remains a
separate, optional path for a human editing in the browser while an agent
works beside them; the headless studio is for work that starts from a clone.
