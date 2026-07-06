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

Open <http://localhost:8080/>, tick the **agent** checkbox in the second toolbar
to reveal the chat panel, and ask for something, e.g.
*"make a song with a four-on-the-floor beat and a simple bassline, then play it"*.

The agent writes the synth + song into the editors, compiles, fixes any compile
errors, and starts playback — all in your browser.

## Tools the agent can call (executed in the browser)

| Tool | Effect in the app |
| --- | --- |
| `get_song` / `set_song` | read / replace the song editor |
| `get_synth` / `set_synth` | read / replace the synth editor |
| `edit_synth` / `edit_song` | surgical find-and-replace in place (like Edit) — change a large doc (e.g. the 14k-line DX7 bundle) without rewriting it |
| `grep_synth` / `grep_song` | regex-search the current in-browser doc for anchors, without dumping the whole file into context |
| `write_faust` / `read_faust` / `list_faust` | author instruments in **Faust** (`.dsp`) in OPFS `faust/` — `write_faust` also transpiles to AssemblyScript and reports the generated classes (needs `?gitrepo=` mode) |
| `compile` | `window.compileSong()`, returns "compiled OK" or the compiler error |
| `play` / `stop` | `window.startaudio()` / `window.stopaudio()` |

It also has read-only `Read`/`Glob`/`Grep` over this repo so it can learn from
`examples/` (incl. the DX7 FM synth), `songs/`, and `wasmaudioworklet/docs/`.

## Config

- `STUDIO_AGENT_PORT` — WebSocket port (default `17891`). The browser side reads
  `window.STUDIO_AGENT_PORT` if you need to override it there too.
- `STUDIO_AGENT_MODEL` — model override for the speed/depth tradeoff, e.g.
  `STUDIO_AGENT_MODEL=sonnet npm start` for faster replies, or `opus` for deeper
  reasoning. Unset uses the Claude Code default. Shown at startup.

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
