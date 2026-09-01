# Reference sessions

Real studio-agent sessions, kept whole, so a **different model can be given the
same asks and judged against what actually happened**.

`tools/studio-agent/logs/` is gitignored — those are working logs that come and
go. A session that turned out well gets promoted here instead, and stops being
machine-local.

Each session directory holds:

| | |
| --- | --- |
| `session.jsonl` | the full log: every prompt, every tool call **with its original arguments**, every tool result, and the per-turn cost/token/turn counts |
| `prompts.md` | just the user's asks, in order, verbatim — the script to replay |

What a session *produced* lives with the rest of the examples, so it can be
loaded and played rather than only read.

## Using one

Read `prompts.md`, feed the asks one at a time to whatever model is under test
(`STUDIO_AGENT_MODEL=…` for the local agent, `/nearai model …` for the
serverless path), and compare.

Compare on what is mechanical: does each ask end in a compiling song, how many
turns did it take, how many tool calls, does the channel count grow. Do not
diff the output against the reference — two models will not write the same song
and should not.

`session.jsonl` is also the ground truth for a video cut — see
[tools/session-video](../../session-video/), which replays the tool calls with
their original arguments so the music in the video is the real output of the
real edits.

## Sessions

### `2026-08-29-house-track` — six instruments and a custom effect, in 14 asks

Opus, one sitting: an empty project to a finished 125 BPM track. Kick, hi-hat,
pad, bass, snare and a flute lead, all authored as Faust, plus a hand-written
`MidiChannel` subclass with a delay line when a plain per-voice echo turned out
not to be what the user meant. The result is
[examples/house-track](../../../examples/house-track/).

| | |
| --- | --- |
| prompts | 14 |
| model turns | 112 |
| tool calls | 98 (83 studio, 15 repo Read/Grep) |
| cost | $5.87 |

**What it found when a smaller model was actually run against it.** The first two
asks were replayed through the live app against `Qwen/Qwen3.6-35B-A3B` on NEAR AI:

- *"create a kick beat track (125 bpm)"* — **50s**, 12 tool calls: three Faust
  instruments authored, synth wired, song written, compiled, voices probed.
- *"and between the kicks I want a hihat"* — **20s**, 2 tool calls.

So the **mechanics are not the hard part** — a small hosted model drives the
tools fine. What diverged was judgement. "Between the kicks" became straight
eighths, putting hats *on* the kicks as well as between them; it invented a
snare nobody asked for; and compile reported `1 note CUT by the previous note's
note-off`, which the reference session's agent noticed and fixed unprompted and
this one read and moved past.

That is the useful shape of the comparison: tool-driving is cheap, musical
reading and acting on your own warnings are not.

Worth knowing before replaying it:

- **The asks are conversational and often corrective** — *"did not like the
  fill. just remove it"*, *"not hearing the echo, i thinnk it should be a global
  effect that the channel is routed to"*. Typos included. A model is being
  judged on reading intent, not on parsing a spec.
- **It contains a live recording.** At prompt 10 the user records the lead melody
  themselves; prompt 11 asks the agent to look at the take. That take survives in
  the log as the result of the `get_song` that follows it, so the arc is
  replayable — but a model under test cannot produce it, so treat prompts 10-11
  as a seeded starting point rather than something to reproduce.
- **The last two asks are the hard ones.** The echo lands only when the agent
  stops treating it as a per-voice effect and writes a channel that routes
  through a shared delay line. Getting there took reading the repo's own effects
  docs. A smaller model failing anywhere will most likely fail here.
