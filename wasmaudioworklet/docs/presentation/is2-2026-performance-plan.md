# Agentic Composition, Live — IEEE IS² 2026 performance plan

*A track built from silence in a browser tab, by talking to an agent — with the
music never stopping. Plan for the set proposed to the 7th IEEE International
Symposium on the Internet of Sounds, Cannes, 28–30 October 2026.*

**Duration:** about 11 minutes · **Performer:** Peter Salomonsen · **Rig:** a
laptop, a MIDI keyboard, a browser tab, and a projector.

Section lengths below are targets, not a script. The set is built from a
sequence of asks, and which ones make the final run — and in what order — will
be settled in rehearsal closer to the date.

## The idea

A complete track is built live on stage, from nothing to a full arrangement, by
talking to the [Studio Agent](../agenticcomposition.md) inside the app — and the
music never stops while it happens. There is no DAW, no plugin host and no
pre-rendered audio. The agent writes [Faust](https://faust.grame.fr/) DSP and
JavaScript sequence code; that code compiles to WebAssembly in the page and is
hot-swapped into a running audio graph: the transport never stops, so each new
instrument or section joins the music that is already playing rather than
arriving after a silence.

Partway through I stop talking and play. A lead melody performed on the MIDI
keyboard is captured and inserted back into the song source, where it becomes
editable, versionable code like everything else. At the end the whole piece —
song, synth, Faust instruments, shaders and the agent conversation — is
committed and pushed to a public repository from inside the browser, and the URL
goes on screen so the audience can run the piece on their own devices.

**The agent is an instrument, not a composer.** I decide the arrangement, the
harmony, the order material arrives in and when to strip back; I play the parts.
What the agent gives me is speed — a synthesizer voice in seconds instead of
minutes. Everything it produces is inspectable code, not generated audio. The
audience sees the code and hears the result at the same time.

**Play through the thinking time.** The median ask takes around a minute, and
that minute is performing time, not waiting time: I play over the running
arrangement on the keyboard while the next instrument is being written, adding
notes by hand so the music develops instead of looping unchanged. This is what
keeps the set musical between asks, and it is worth rehearsing as deliberately as
the prompts — knowing which instrument to play over, and in which register, while
each kind of edit lands.

## Set structure

| Section | Target | On stage |
|---|---|---|
| **Cold open** | ~1½ min | Open a near-empty project from a URL; it clones and boots in seconds. Ask for a beat. The agent authors Faust drum voices — kick, snare, hi-hat — compiles them, and the groove starts. First sound inside about a minute. |
| **Harmony** | ~2 min | Ask for a chord progression. The agent writes chords into the sequence (a step slot holding an array of notes) and builds a pad in Faust. The chords join the running loop; the drums never drop out. |
| **Bass** | ~2 min | Ask for a bassline locked to the progression. A new Faust voice, wired in as its own MIDI channel, then refined conversationally — punchier, longer decay, more filter movement — each recompile landing without interrupting playback. |
| **I play** | ~2½ min | Switch from talking to playing: a lead melody performed live over the running arrangement, then **captured back into the song code**. This is the hinge of the set — conversation, to code, to performance, and back to code. |
| **Arrangement & visuals** | ~2½ min | Ask for structure: a break, a variation, a lift. The agent edits the arrangement in place. Song-driven [shader visuals](../shaders.md), also authored as code, react to the same MIDI events driving the sound. |
| **Hand it over** | ~½ min | Commit and push the finished piece from inside the browser — one button in the app, not an agent step. The URL goes on screen; anyone in the room, or watching the stream, can open it and the piece compiles and plays on their machine. Not a recording of tonight — the instrument itself. |

The first four sections are the rehearsed core, budgeted at **8 minutes**
together; the last two add about three more.

## Rehearsal timings (31 July 2026)

A full run of the first four sections on the real rig, timed from the agent's
own session log. Nine conversational turns took **6.3 minutes of agent time
inside 9.8 minutes of wall clock** — the remaining 35% being typing, playing and
listening. Per-turn median 51s, worst 86s.

| Ask | Time | Tool calls |
|---|---|---|
| "give me a beat" | 62s | 13 |
| "add a chord progression, dminor, a#major, c major, g major" | 51s | 7 |
| "add a punchy bass-line, alternate octaves like italo disco" | 46s | 7 |
| "a fat lead that I can play myself on top" | 36s | 6 |
| "an echo on the lead, every 3rd step at 4 steps per beat" | 86s | 4 |
| "insert recording markers" | 21s | 4 |
| *(played a take, pasted it in)* | — | — |
| "see the recording I just inserted" | 17s | 1 |
| "adjust the notes so they're on the beat" | 62s | 3 |

What makes those numbers possible is that the project repo carries an
`AGENT.md` — a **kit** describing its instruments, channel layout and
conventions, loaded into the model's context at the start of every turn. With it
the agent acts immediately; without it, it spends a round-trip discovering the
same facts first. Across 50 tool calls in that run, only two were lookups, and
both were reading the current song before editing it. A tailored kit for the
performance repo is the single highest-leverage piece of preparation.

**Getting to 8 minutes.** The rehearsed run came in at 9.8 minutes against an
8-minute target for these sections. The overrun is concentrated rather than
spread: the echo ask alone was 86 seconds — the worst turn of the run, and the
most musically optional. Dropping it, or pre-baking the effect into the lead,
recovers most of the gap; tightening the kit and cutting one further ask covers
the rest.

## How it works

### Faust as the instrument language

Every instrument in the set is written in Faust, and that is the reason this
works at performance speed. A Faust program expresses a DSP algorithm in a few
declarative lines — a drum voice, a filtered bass, a pad are each a handful of
them — which is small enough for a language model to write correctly and revise
reliably in seconds. Piano-roll editing has nothing this compact.

The pipeline:

```
Faust (.dsp) → faust2as → AssemblyScript → WebAssembly → AudioWorklet
```

The [faust2as transpiler](../../../tools/faust2as/README.md) generates
AssemblyScript classes that are wired into `synth.ts`, which acts purely as a
multitimbral combiner — one Faust voice per MIDI channel. Effects come from the
same place, per-instrument or across the whole mix
(see [Faust effects](../effects.md)).

Two recent additions matter on stage. Structured faust-rs diagnostics are
surfaced to the agent, so DSP that fails to compile comes back as a precise
error the agent repairs itself, without me intervening. And the agent **probes
the compiled synth for actual sound** rather than trusting that a clean compile
means audio — it verifies the song against the compiled MIDI events. It knows
whether what it just built makes a noise.

### The agent

A chat panel drives an LLM agent loop whose tools execute **inside the browser**,
acting on the code editors, the WebAssembly compiler and the audio worklet. The
tools are musical rather than generic file I/O: read, search and *surgically*
edit the song and synth sources; write, read and list Faust instruments; author
shaders; compile. Surgical edits are what let it add a voice to a
14,000-line instrument bundle without rewriting it or dragging it through its
context window.

### Music that never stops

Song scripts run in a QuickJS WebAssembly sandbox, off the audio thread.
Compiling a new synth swaps the WebAssembly module into the running audio graph,
and a new sequence is spliced in at the current playhead — the transport keeps
its position instead of restarting. That is what makes the set continuous: I am
editing a running instrument, not stopping to render.

The splice is immediate rather than quantised to a bar, and it sends an
all-notes-off first, so a sustaining pad is cut at the moment of the swap while
short percussive parts are unaffected. In practice that means recompiling under
drums is seamless and recompiling under a held chord is audible — worth choosing
where in the arrangement each edit lands.

Demonstrated here: [*The agent edits the synth while the music keeps
playing*](https://www.youtube.com/shorts/Zn3m7TlbPck).

### Everything is a URL

The whole work is a git repository, pushed from inside the browser via wasm-git.
Where that repository lives is deliberately not fixed — the app can push to a
conventional hosted git service through a CORS proxy, or to on-chain,
[NEAR-backed storage](../git-hosting.md); the choice for the performance will be
made nearer the date. Either way, opening the app with a repo URL clones and
runs the piece. No server renders audio and there is nothing to install: each
listener's browser compiles the WebAssembly and synthesizes the music locally.
For the symposium's hybrid concert format that means remote attendees are not
limited to watching a stream — they can hold the instrument.

### Beyond the browser

The same WebAssembly instruments load into the native
[DAW plugin](../../../dawplugin/README.md) — JUCE-based, AOT-compiling the `.wasm`
to native code with WasmEdge, with low-latency real-time audio and MIDI and
dynamic instrument switching. An instrument written on stage in Faust is not
trapped in the browser; it is a portable artifact that runs in a professional
production environment too.

## Live capture — verified end to end

The capture-take-to-code step at 5:30–8:00 needed no new development. Rehearsed
on 31 July 2026, the whole loop ran on the existing app:

1. I asked the agent for recording markers; it wrapped the loop in
   `startRecording()` / `stopRecording()`.
2. I played a take against the running arrangement.
3. One button press pasted the captured notes into the song source as a
   `createTrack(5).play([...])` array.
4. I asked the agent to put the notes on the beat; it appended `.quantize(4)`
   to that array and confirmed all 32 notes survived the snap.

The take stays in the source **at its original timing** — quantization is
applied at playback, so removing eleven characters restores the live feel. For a
performance whose one irreplaceable artifact is the take itself, that matters.

One sharp edge to rehearse around: compiling clears the recording buffer, so the
take must be pasted into the source *before* the agent compiles again. Insert
first, then talk to the agent.

## Risk notes

Live agent-driven performance has obvious failure modes. The mitigations:

- **The music keeps playing regardless.** Because edits are hot-swapped into a
  running graph, a slow or failed agent step means the current arrangement
  continues rather than silence.
- **Rehearsed prompt path with fallbacks.** Every step has a known-good
  alternative I can type straight into the editor. The agent is a fast path, not
  a single point of failure — I can always write the code myself, live.
- **No network dependency for the music.** The piece runs fully offline once
  loaded; the network is needed only for the initial clone, inference calls and
  the closing push.
- **Compile failures are caught, not shipped.** Structured Faust diagnostics and
  the audio probe mean broken DSP is repaired rather than silently played as
  silence. In the rehearsal the agent hit one compile error, read it, and fixed
  itself without intervention.
- **A rehearsed kit keeps turns short and predictable.** The 51s median above is
  a property of the project's `AGENT.md`, not of the model — the same asks
  without one historically ran roughly twice as long with a far worse tail.
- **The known sharp edges are the ones to drill**, not the ones to hope about:
  paste a take before the next compile; land recompiles under drums rather than
  under a held chord; keep a fallback commit in the repo that a single
  `load_song_from_file` restores if a step goes wrong.

## Background

- *Converting Faust to AssemblyScript for WebAssembly Music* — paper and talk,
  5th International Faust Conference (IFC-26), Cannes, June 2026.
- *WebAssembly Music* — evening concert, IFC-26, Cannes, 4 June 2026
  ([recording, from 1:27:30](https://www.youtube.com/watch?v=u7ZJreOHOAU&t=5250s)).
- Web Audio Conference 2025 award — WebAssembly Music instrument plugin NFTs.
- [Agentic Composition](../agenticcomposition.md) — the practice this set performs.
