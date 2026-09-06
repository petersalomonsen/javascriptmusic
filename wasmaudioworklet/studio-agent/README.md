# Studio agent

The in-app AI that edits the song, the synth, the Faust instruments and the
shader by driving the app's own tools. Two providers share everything here:

- **local Agent SDK** — `tools/studio-agent/server.mjs` over a WebSocket
- **NEAR AI serverless** — the in-browser loop in `nearai-core.js`, with the
  Pages Function at `functions/nearai/[[path]].js` injecting the same tool list

| file | what it is |
|---|---|
| `prompt.js` | the system prompt — single source of truth for both providers |
| `tools-def.js` | every tool declared ONCE, with `where` saying who executes it |
| `tools-core.js` | pure logic behind the tools (edits, grep, song-event analysis), unit-tested in Node |
| `client.js` | the browser side: the tool registry acting on the editors, compiler and OPFS repo |
| `script-sandbox.js` | `run_script`: an agent snippet run in the QuickJS song sandbox over the documents' text, writing back through an opt-in host function |
| `script-helpers.js` | the data view of note rows for those scripts (`parseNotes`, `formatNotes`, `findPlayBlocks`, `groupByBeat`…), import-free so it loads into the guest |
| `nearai-core.js` | the serverless agent loop and OpenAI tool conversion |

Run the unit tests with `npm run test-agent-tools` (from `wasmaudioworklet/`).

## Why the feedback loops matter

The agent cannot hear the music or see the canvas, so "it compiled" is nearly
all it gets — and the failures that follow are silent ones. Each tool therefore
reports back what it can actually establish:

- `compile` appends anomalies from the compiled MIDI events (an instrument
  declared but never played, parts that never overlap, notes cut by a previous
  note-off) and probes the channels the song plays for **audible sound**
- `song_summary` reports what the song really emits, per channel
- `probe_instrument` renders notes through the compiled wasm and measures them
  (see `../audioprobe/`)

The prompt's ASSURANCE section ties these together: each check proves one thing,
and none of them may be reported as proof of a higher one.

## Why the agent has a script tool

A recorded take is note data. With only get/set/edit tools the agent transforms
it by transcription — reading the rows, working out the chords in its head and
retyping them — which is slow, expensive, unverifiable, and loses the
performance (every retyped velocity comes out the same). `run_script` gives it
the equivalent of a shell: a twenty-line snippet in the song sandbox does the
same job deterministically, keeps what the user played, and the notes never
pass through the model. The sandbox is the right vehicle for its deadline, not
for isolation: an agent-written endless loop is interrupted instead of freezing
the tab, and it works on the serverless NEAR AI tier, which has no server.
