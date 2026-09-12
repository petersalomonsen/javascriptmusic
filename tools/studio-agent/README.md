# studio-agent

A local agent process that drives the in-browser **WebAssembly Music** app
through a chat panel. Unlike [claude-bridge](../claude-bridge/) (which mirrors
files to disk so you drive Claude *locally*), studio-agent is the **full in-app**
path: the agent's tool calls execute **inside the browser** — on the editors,
the wasm compiler, and the audio worklet — so nothing is synced to the
filesystem.

```
browser chat panel ──ws──► studio-agent (Agent SDK)
        ▲                          │  reads examples/docs from the repo (Read/Glob/Grep)
        │  tool_call               │
        └──────────────────────────┘
   set_song / set_synth / compile / play  ← executed in the browser
```

Iteration 1 backs the chat with **Claude via the Agent SDK**, authenticated with
your **Claude Code subscription** (Max/Pro) — no API key, no per-token billing.
Future iterations can add other agent backends behind the same WebSocket
protocol.

## Auth

Uses your existing `claude` login. **Do not** set `ANTHROPIC_API_KEY` — it takes
precedence and switches you to per-token API billing. (`unset ANTHROPIC_API_KEY`
if it's in your environment; the server warns you on start if it is.)

## Run

```sh
cd tools/studio-agent
npm install
npm start            # listens on ws://localhost:17891
```

Then start the web app dev server and open it:

```sh
cd ../../wasmaudioworklet
npm run serve        # http://localhost:8080/
```

Open <http://localhost:8080/?gitrepo=myproject> (the agent only works inside a
project repo — an OPFS working tree for instruments and the session; any name
makes a local-only one), tick the **agent** checkbox in the second toolbar to
reveal the chat panel, and ask for something, e.g.
*"make a four-on-the-floor beat with a simple bassline"*.

The agent writes the synth + song into the editors, compiles, fixes any compile
errors, and applies the result — all in your browser. Playback stays yours.

## Producer + instrument specialist

You always talk to ONE agent, the **producer**: it holds the musical
conversation, the song and the wiring in `synth.ts`. It never writes Faust
itself. Every new sound, and every change to an existing instrument, goes
through the `design_instrument` tool, which runs the **instrument specialist**:
a second agent with its own prompt (the instrument section, the mix section and
a short guide for the kind of sound), only the instrument tools, and a fresh
context — so transpile errors, probes and the reasoning between them never
enter the conversation. It returns a short report, and the tool then probes the
channel itself: the first line of what the producer sees is a measured `OK` or
`FAILED`, never a claim. The panel shows the specialist's steps indented under
the producer's, and the session log records them as `specialist_*` events.

The same flow runs on the in-browser NEAR AI path (a nested loop with the same
prompt and tool subset), and the Pages Function proxy forwards whatever tool
list the app sends instead of injecting its own, which is what lets a
specialist turn offer a narrower set than the producer.

## Tools the agents can call (executed in the browser)

Which agent gets which is decided by `ROLES` in
`wasmaudioworklet/studio-agent/tools-def.js`: the producer gets everything
except the `.dsp` writers plus `design_instrument`; the specialist gets the
Faust tools, `get_synth`/`grep_synth`/`edit_synth`, `compile` and
`probe_instrument`.

| Tool | Effect in the app |
| --- | --- |
| `design_instrument` (producer only) | delegate ONE instrument — brief, kind, channel, name — to the instrument specialist; returns its report plus a probe the tool ran, first line `OK` or `FAILED` |
| `get_song` / `set_song` | read / replace the song editor |
| `get_synth` / `set_synth` | read / replace the synth editor |
| `edit_synth` / `edit_song` | surgical find-and-replace in place (like Edit) — change a large doc (e.g. the 14k-line DX7 bundle) without rewriting it |
| `grep_synth` / `grep_song` | regex-search the current in-browser doc for anchors, without dumping the whole file into context |
| `get_shader` / `set_shader` / `edit_shader` / `grep_shader` | read / replace / surgically edit / search the visualizer shader (GLSL). The song's visuals only reach the screen through uniforms this document declares, so `showText`/`setVisual` work is a shader job as much as a song job — the write tools report back anything the song schedules that the shader still cannot show |
| `render_shader` | the agent's eyes: renders the current shader at up to four song times (note uniforms replayed from the compiled song) and returns one labelled contact sheet as an image plus per-frame numbers — the sheet also appears in the chat panel. SDK path only: the NEAR AI tier cannot take images, so it stays blind |
| `write_faust` / `edit_faust` (specialist only), `read_faust` / `list_faust` | author instruments in **Faust** (`.dsp`) in OPFS `faust/` — `write_faust` also transpiles to AssemblyScript and reports the generated classes |
| `probe_instrument` / `song_summary` / `run_script` | measure a channel's audio offline; digest what the compiled song plays; compute an edit over note data in the sandbox |
| `compile` | `window.saveSong()` (save + compile + apply to a playing worklet), returns "compiled OK" or the compiler error |
| `stop` | `window.stopaudio()` — there is deliberately no `play` tool; starting playback is the user's action |

It also has read-only `Read`/`Glob`/`Grep` over this repo so it can learn from
`examples/` (incl. the DX7 FM synth), `songs/`, and `wasmaudioworklet/docs/`.

## Config

- `STUDIO_AGENT_PORT` — WebSocket port (default `17891`). The browser side reads
  `window.STUDIO_AGENT_PORT` if you need to override it there too.
- `STUDIO_AGENT_MODEL` — model override for the speed/depth tradeoff, e.g.
  `STUDIO_AGENT_MODEL=sonnet npm start` for faster replies, or `opus` for deeper
  reasoning. Unset uses the Claude Code default. Shown at startup.
- `STUDIO_AGENT_SPECIALIST_MODEL` / `STUDIO_AGENT_SPECIALIST_MAX_TURNS` — the
  instrument specialist's model (defaults to the producer's) and its turn cap
  (default 40). A cheaper specialist model is the natural first experiment.

## Bench: the same agents against a headless studio

`agent-core.mjs` holds who the agents are (prompts, tool subsets per role, the
nested specialist run and the probe that turns its report into a verdict)
behind a small backend interface; `server.mjs` is only the WebSocket backend.
`bench/headless-studio.mjs` is a second backend: every studio tool in Node over
an in-memory project — the song compiles in the same QuickJS sandbox, Faust
transpiles with the same wasm compiler module, the synth compiles with the same
asc flags into the same assembly scaffold, and probing renders the same wasm.
So a task can run end to end through the real producer → `design_instrument`
→ specialist code with a real model and no browser, and be judged by numbers.

```sh
npm test               # the studio itself, no model (transpile, compile, probe, script sandbox)
npm run test-tasks     # the corpus checks itself: every task fails on its untouched start and passes on a known-good result
npm run smoke          # one task (fm-epiano) through the real producer + specialist, Agent SDK, haiku
npm run bench          # every task once; see below for options
```

**Tasks** live in `bench/tasks/index.mjs`. Most are real requests from the
session logs, verbatim, with the project state they were made in vendored
under `bench/tasks/fixtures/<task>/` (`import-fixture.mjs` pulls one from a git
repo at a commit); three also carry the human-approved result (`after/`), which
`test-tasks` uses to prove the checks pass on the real outcome and fail on the
untouched start. Checks (`bench/checks.mjs`) are functions over the compiled
MIDI events, a probe of the synth, the documents and the transcript: onsets on
the right steps, velocities, channels unchanged, instruments audible with a
plausible spectrum, the producer having delegated the right number of times and
written no .dsp itself, a FAILED verdict relayed honestly. A task can carry
`followUps`: the answers the user would give if the producer ends a turn with a
question, each used at most once; the runner counts questions asked, so a
model that asks where the human did not need to is visible in the table.

```sh
node bench/run.mjs --tasks fm-epiano,italo-drums --runs 3
node bench/run.mjs --model sonnet --specialist-model haiku
node bench/run.mjs --base-url http://localhost:11434/v1 --model gemma4-32k      # any OpenAI-compatible endpoint
node bench/run.mjs --base-url https://cloud-api.near.ai/v1 --model Qwen/Qwen3.6-35B-A3B-FP8
node bench/run.mjs --prompt-ref HEAD~3                                          # A/B a prompt version
```

Each run writes its transcript, tool timings, documents and verdict to
`bench/results/<stamp>/` (gitignored) with a summary table on stdout: pass
rate, median seconds, tool calls and cost per task. `npm run compare
bench/results/<a> bench/results/<b> …` prints the arms side by side, one
column each — how a model or a prompt version compares on the same tasks. The drum-only
`bench-drums.mjs` predates all this and keeps its own six-tool studio.

Fidelity note: the headless studio transpiles with the compiler module the app
ships (the npm package), not the gitignored local drop `faust_wasm_ffi.wasm`
that `faust2asc.js` would otherwise prefer — a stale drop there once produced
output the browser never does.

## Session logs

Every server run writes a JSONL transcript to `logs/session-<timestamp>.jsonl`
(gitignored) — one line per event: the user's `chat` prompts, the agent's `text`,
each `tool_use` (with truncated input), `tool_result`s, and the final `result`
(turns + cost). These exist so the agent's behaviour can be reviewed and improved
after a session — e.g. "look at my last session" reads the newest file. Delete
the `logs/` folder anytime to clear them.

## Status / limits (iteration 1)

- One browser connection at a time.
- Conversation continuity via the SDK `resume` session id.
- No locking yet: if you hand-edit while the agent is mid-edit, last write wins.
- Claude-only backend so far; the WS protocol (`chat` / `text` / `tool_call` /
  `tool_result` / `done`) is provider-neutral by design.
