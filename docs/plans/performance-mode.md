# Performance mode — plan

*Status: proposal (2026-09-13). Companion to [headless-studio.md](headless-studio.md)
and [visual-scene.md](visual-scene.md). Nothing here is built.*

## Goal

In a concert, a presentation or an unattended installation ("kiosk"), the
song should be able to **hold or loop within a section and move on when
told** — by a touch on a shader-drawn element, by a MIDI event, or by
talking to the agent — and the move may go to *any* section, not only the
next. The song stays a deterministic score for export, headless rendering
and the agent's frames; performance mode is where the waits become real.

## What exists

- **`broadcastWait(name)` / `broadcastSend(name)`** — the sequencer parks
  the song clock at a point until a named signal arrives (today over a
  `BroadcastChannel`, meant for multi-window sets). Stale signals are
  ignored; play/seek clears a pending wait. This is the core primitive.
- **`definePartStart(name)`** — named sections in the timeline.
- **`loopHere()`** — loop the whole song from the start.
- **Seeking** — the sequencer can jump the playhead; every visual schedule
  (`setVisual`, `showText`, images, the planned element table) resolves
  from song time, so a seek moves the visuals consistently.
- **MIDI → control** — beachdrive maps notes to game controls; MIDI input
  reaches the synth live and is recordable.
- **The studio agent** — a chat panel with a tool set chosen per role.

## The model: one timeline, signals in, seeks and loops out

No live song guest is needed (the song still compiles once in QuickJS to
one linear event list — see the headless plan). Three sequencer additions
cover the whole feature:

1. **Wait with a policy.** `waitForSignal(name, options)` generalises
   `broadcastWait`:
   - `loop: 'part' | 'hold'` — while waiting, loop the current part (from
     its `definePartStart`) or freeze the clock as today.
   - `quantize: 'bar' | 'beat' | 'now'` — leave on the next bar line.
   - `default: 'continue' | 'skip' | <partName>` — what a non-performance
     render does (export, headless, `render_shader`): continue after one
     pass by default, so the song remains a deterministic score.
   - `timeout: { bars, goTo }` — kiosk fallback when nobody interacts.
2. **Signals with a target.** A signal may carry a part name; the sequencer
   **seeks** to that part's marker (quantized). "Go to bridge" works from
   anywhere, not only at a wait.
3. **Loop with a start.** `SEQ_MSG_LOOP` gains a start time (the current
   part's marker) so a part loops in place instead of from zero.

Implementation is in `audioworkletprocessorsequencer.js` (the wait/loop
cases already exist; `waitingForSignal` becomes a policy object) and
`songcompiler.js` (the recorders). A **signal bus** on the main thread
replaces the direct BroadcastChannel wiring: every source posts to the bus,
the bus resolves targets and forwards to the worklet. `broadcastWait` stays
as the multi-window special case of the same bus.

```javascript
definePartStart('intro');
await intro();
await waitForSignal('go', { loop: 'part', quantize: 'bar' });   // default: continue
definePartStart('verse');
await verse();
await waitForSignal('go', { loop: 'part', timeout: { bars: 16, goTo: 'idle' } });
definePartStart('chorus');
...
definePartStart('idle');       // the kiosk attractor
await idle();
await waitForSignal('any', { loop: 'part' });
```

## Event sources

| Source | How it reaches the bus | Declared where |
|---|---|---|
| Shader element | element-table row with a `signal` name; same hit test as knobs/keys ([visual-scene](visual-scene.md)) | the song, as data |
| MIDI | note or controller mapped to a signal (like beachdrive's note → control), applied in the app's MIDI input path | the song, as data (`mapSignal({ note: 36 }, 'go')`) |
| Agent | performance-mode tools (below) | the app |
| Other window | `broadcastSend` as today | the song |
| Timeout | the wait's own `timeout` | the song |

Every signal is also **recordable** as a sequencer meta-event, so a
performance can be captured and replayed exactly, including its jumps.

## The agent in performance mode

Pressing play in performance mode switches the studio agent panel to a
**performance role**: a tiny tool set and no editing.

- `list_parts` (names, lengths, which one is playing, pending waits and
  their signals), `send_signal(name, target?)`, `go_to_part(name)`,
  `set_control(channel, cc, value)`.
- Prompt: interpret an instruction as one of these; never edit, never
  compile; answer in a few words. Part names and signal names are in the
  prompt from the kit, so nothing needs a lookup.
- **Fast path without the model**: an instruction that exactly names a part
  or a signal is dispatched directly by the panel — a model turn is seconds,
  a quantized jump hides that, but "chorus" should not wait for a model.
- **Speech**: the browser's speech recognition feeding the same input; the
  fast path makes single-word cues instant.
- The role is one more entry in `tools-def.js` ROLES, so both providers
  (local SDK, NEAR AI) get it; the NEAR AI tier is the natural fit here,
  being zero-install on stage.

## Visuals while waiting

- Looping a part keeps song `time` advancing, so shader animation continues.
- A jump steps `time` to the target part; shaders animating purely on
  `time` cut at the jump. Add a wall-clock uniform (`uWallTime`) for
  shaders that want continuity across jumps; the docs say which to use.
- Pending waits are visible: a `uWaiting` uniform (or an element-table
  flag) so a shader can show "touch to continue" or pulse the button.

## Headless

`wasm-music play` (headless plan) accepts signals on stdin and through the
MCP `send_signal` tool, so a performance can be rehearsed and tested without
a browser; `wasm-music render` uses the waits' defaults and is deterministic.

## Phases

1. **Sequencer**: wait policies (loop/hold, quantize, default, timeout),
   targeted signals as seeks, loop-with-start; the signal bus with
   `broadcastSend` on it; song API + docs; tests in the sequencer specs.
2. **Sources**: MIDI → signal mapping in the app; element-row signals once
   the element table lands (visual-scene phase 2).
3. **Agent**: the performance role, fast path, prompt; verified with the
   Playwright agent harness ("go to the chorus" → `go_to_part`).
4. **Stage polish**: speech input, `uWallTime`/`uWaiting`, kiosk timeout
   tested unattended, recording of signals.

## Sizes

| Piece | Rough size |
|---|---|
| Sequencer wait policies, targeted seek, loop-with-start, bus | 300 lines + tests |
| Song API recorders + docs | 100 lines + docs |
| MIDI → signal mapping | 80 lines |
| Performance role: defs, prompt, panel fast path | 200 lines |
| Speech input, uniforms, kiosk timeout | 150 lines |

## Open questions

- Quantize granularity per wait vs one song-wide setting.
- Whether a targeted jump should also carry a transition (fade the part's
  visuals) or leave that to the shader via `uWaiting`.
- Recording format for signal events so `insertRecording` can write them
  back into the song as `waitForSignal` defaults.
- Whether the performance role should ever be allowed `set_control` on
  channels the song did not declare as performable.
