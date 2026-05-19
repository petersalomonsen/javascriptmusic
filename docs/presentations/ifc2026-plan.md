# IFC 2026 — Plan

Working document for the **[International Faust Conference 2026](https://ifc26.i3s.univ-cotedazur.fr/)** appearance. Two distinct deliverables:

1. **Talk** — the Faust transpilers (C-backend + ASC-backend).
2. **Concert** — live coding set drawing from the songs at
   `~/neargit/webassemblymusic-songs.gitfactory.testnet`.

---

## 0. Logistics (fill in)

- Dates / location: <!-- e.g. dd–dd Mmm 2026, Université Côte d'Azur, Sophia Antipolis -->
- Talk slot: <!-- date + duration, 20 min? 30 min? -->
- Concert slot: <!-- date + duration; PA + monitoring details -->
- Demo machine: <!-- MacBook details, audio interface, MIDI controller? -->
- Backup plan if internet is unreliable: <!-- record fallback video? offline-capable build? -->
- Stream / recording rights: <!-- IFC publish video? -->

---

## 1. Talk — Faust transpilers

### 1.1 Introduction — What is WebAssembly Music?

**WebAssembly Music** is an open-source, browser-based live-coding environment
for music. Music sequences are written in JavaScript; synthesizers are written
in AssemblyScript and compiled to WebAssembly directly in the browser on every
save. One synth wasm module handles multi-timbral MIDI synthesis with voice
allocation, multiple instrument channels, and sample-by-sample rendering.
AudioWorklet keeps latency low. Synth wasm modules are typically <16 KB.

Architecture diagram: [`wasmaudioworklet/overview.svg`](../../wasmaudioworklet/overview.svg).

#### Why it exists (the pragmatic story)

Origin chain, traceable to the top-level `README.md`:

1. **NodeJS + MIDI controlling ZynAddSubFX.** Songs as JS files. Worked, but
   the synth was a black box — no way to live-edit timbre alongside the notes.
2. **4klang** — a compact-but-powerful synth from the 64K-intro demoscene
   tradition. The README's own framing: *"finally inspired me to attempt
   writing a synth in WebAssembly running entirely in the browser."* The
   4klang aesthetic (tiny binaries, code-as-sound) set the engineering taste
   for what followed.
3. **WebAssembly synth in the browser, written in AssemblyScript.** First
   commits July 2018; AudioWorklet integration Nov 2018.

#### Why AssemblyScript

Fast in-browser compile is the deciding factor — none of the alternatives
close the live-coding loop:

- Rust + wasm-pack / Emscripten + C: toolchain compile times are too slow for
  "edit synth → hear it" iteration. Great for shipped artifacts; not for a
  save-and-listen workflow.
- Hand-written WAT: no abstraction, tedious.
- **AssemblyScript**: compiles in milliseconds, runs in the browser as a
  Worker (no host install for users), and the TypeScript-like syntax doesn't
  hide the wasm — you still control class layout, can drop to raw memory,
  predictable codegen.

This is the choice that makes everything else possible. Without ms-scale
compile, the rest of the project's save-and-hear feedback loop doesn't work.

#### Where Faust fits

Faust is a widely adopted DSP language with a mature library of instruments
(physical models, FM synths, mastering chains). The work in this talk is
about making those available in WebAssembly Music — **as part of the
existing multi-timbral synth engine, not as separate AudioWorklet nodes.**

That distinction matters. Faust IDE and the standard `faustwasm` runtime
approach build each DSP into its own AudioWorklet node with its own
polyphonic voice management. WebAssembly Music has *one* synth module that
does voice allocation and channel routing for all instruments together.
Source-to-source transpilation lets a Faust DSP become an AssemblyScript
`MidiVoice` subclass — it lives alongside hand-written AS instruments,
shares voice allocation, shares reverb/delay sends, and shows up to the JS
sequencer as just another MIDI channel.

#### Where it's been shown

- **WebAssembly Summit 2020** (Google HQ, Mountain View) — [demo video](https://youtu.be/C8j_ieOm4vE)
- **NEARCON 2021** (Lisbon)
- **Web Audio Conference 2025** (Paris)
- Chapter in *Building and Deploying WebAssembly Apps* (BPB Publications, 2025)

This talk is the next iteration: the Faust integration. A previous
music-tooling project (**Frinika**, Java-based) explored similar code+music
ideas in a desktop context.

### 1.2 Submitted abstract

> *"Converting Faust to AssemblyScript for WebAssembly Music"* — abstract at
> `~/Downloads/PeterSalomonsen.pdf`. Headline: `faust2as` transpiles the C
> backend's output into AssemblyScript classes that plug into the WebAssembly
> Music MidiVoice/MidiChannel runtime, preserving the fast in-browser AS
> compile + small-binary pipeline.

The abstract focuses on the **C-backend approach** (`faust2as.js`). Since
submitting, the project has acquired a **second, in-browser** transpilation
path using Faust's AssemblyScript backend (`faust2asc.js` + the pure
`transpile-core.js` reused by `browser-transpile.js`). The talk should cover
both and contrast them.

### 1.3 Talk outline (draft)

| Time | Section | Notes |
| ---- | ------- | ----- |
| ~4 min | **Intro — What is WebAssembly Music + why** (see §1.1) | architecture in one slide, 4klang quote, why AS for live coding, where Faust fits |
| ~2 min | Why source-to-source vs runtime linking for Faust specifically | one wasm module, shared voice allocation, MidiVoice/MidiChannel integration, tiny binaries preserved |
| ~5 min | **`faust2as` — C-backend approach** (the abstract) | `faust -lang c` → AS reshape; offline only (Node CLI) |
| ~5 min | **`faust2asc` + `transpile-core` — ASC-backend approach** (post-abstract work) | `faust -lang asc` via `@psalomo/faustwasm` in the browser → in-place reshape; **no host install needed**; closes the live-coding loop entirely inside the browser |
| ~1 min | What we get for free in both: typed channel fields with doc comments, CC/NRPN auto-mapping, `transpileEffect` standalone-effect path | |
| ~10 min | Live demo (see §1.5) | |
| ~3 min | Q&A | |

### 1.4 The two transpiler paths — at a glance

| | `faust2as.js` (C backend) | `faust2asc.js` + `transpile-core.js` (ASC backend) |
| --- | --- | --- |
| Input | C from `faust -lang c` | AssemblyScript from `faust -lang asc` (via faustwasm `@psalomo/faustwasm`) |
| Where it runs | Node CLI (offline) | Node CLI **and** in-browser (`wasmaudioworklet/faust/browser-transpile.js`) |
| Reshape work | Parse C, rewrite to AS (`dsp->` → `this.`, `fminf` → `Mathf.min`, `(float)` casts, etc.) | Parse AS, restructure fields & methods to fit `MidiVoice`/`MidiChannel`/`Effect` |
| UI metadata source | C `buildUserInterface` calls (`ui_interface->declare(...)` for `[symbol:foo]`) | `getJSON()` embedded in the AS output |
| Generated shape | Same end-state: typed public channel fields with doc comments, `process(...)` / `nextframe()`, CC/NRPN routing | Same |
| Live-coding ergonomics | Save-and-rebuild needed | True hot-reload — save a `.dsp` in the editor and the AS source is regenerated and recompiled in one shot |

The **convergence** is the headline: both paths emit the same shape, share
the `paramDocComment` / `deriveNiceName` helpers in `transpile-core.js`, and
share `transpileEffect` for standalone effects (master_me, zita_rev1, …).
The ASC path is what makes the whole loop closeable inside the browser.

### 1.5 Live demo plan (draft)

The talk gets one MacBook and (hopefully) PA monitoring. Suggested demo
sequence — every step should make a sound, every step should be
explainable from the screen:

1. Open the web app, show the four editors (song, synth, shader, faust).
2. Type a Faust DSP (a sine + envelope), save → watch the editor
   transpile, hear the result.
3. Show the generated AS file: typed channel fields with hover docs.
4. From AS, set a few params on the new channel directly.
5. Drop in a DX7 algorithm (`dx7_alg5_bells.dsp`) — show NRPN mapping
   triggering automatically (>116 params).
6. Add a stereo effect (`master_me.dsp` or `zita_rev1.dsp`) — show
   `transpileEffect` shape and the auto-`postprocess()` wiring.
7. (If time) live tweak: change one DSP block in the .dsp, save, hear
   the synth update mid-song.

Fallback: a pre-recorded screencast of the same steps in case the
projector / audio chain misbehaves.

### 1.6 Slide deck

- [ ] Pick a tool: Reveal.js? Keynote? Quarto/Marp? (Prefer something
      live-codable from this same repo — Reveal-in-this-repo would close
      the loop nicely.)
- [ ] Architecture diagram (one slide). Inputs: `.dsp`, `.js` song, `.glsl`.
      Outputs: WASM synth module + audio.
- [ ] Side-by-side diagram of the two transpiler paths.
- [ ] Code snippets — generated channel class before/after PR #125/#127.
- [ ] Photos / screenshots of past demos for the bio slide.

### 1.7 Open questions / decisions

- [ ] Does the audience want **theory** (how the AS reshape works in
      detail) or **demo** (here are the sounds you can make)? Probably
      lean demo — IFC is a music-making conference.
- [ ] How much of the abstract's specific NRPN/CC discussion to keep vs
      cut now that we have typed fields making CC less central?
- [ ] Reference the `transpileEffect` work (PR #127) — that's new since
      the abstract was submitted; worth mentioning even if briefly.

---

## 2. Concert — seamless multi-song live coding

### 2.1 Set list (candidates, from `~/neargit/webassemblymusic-songs.gitfactory.testnet`)

| Slug | File | Notes / mood |
| ---- | ---- | ------------ |
| `swamp` | `swampsong.js` (+ `swampsynth.ts`) | <!-- describe --> |
| `monstertheme` | `monstertheme/song1.js` | <!-- --> |
| `veronikaswaltz` | `veronikaswaltz.js` | 3/4 piano waltz |
| `beautifulflaws` | `beautifulflaws.js` | <!-- --> |
| `closeproto` | `closeproto/song1.js` (+ `song2.js`, `songcontract.js`?) | <!-- --> |
| `aliensclose` | `aliensclose.js` | <!-- --> |
| `much` | `much.js` | currently the repo's default song |
| `onedayolder` | `onedayolder/song.js` | has its own `synth.ts` |

Decide:

- [ ] Final order (build a story arc — energy, key, tempo)
- [ ] Approximate duration target (e.g. 30 / 45 / 60 minutes)
- [ ] Which songs share a synth (`synth.ts`) and which need their own
      (`swampsynth.ts`, `monstertheme/synth.ts`, `onedayolder/synth.ts`)
      — affects how easily they can transition
- [ ] One backup song outside the main arc, in case of stage issues

### 2.2 Seamless playback — chosen approach: quantized save

Decoupling **compile** from **replacement in the audio worklet**: save
keeps doing what it does today (compile immediately, surface any errors
right away, commit/stage to wasm-git as configured), but the moment the
new wasm becomes audible is quantized to a musically meaningful bar /
beat boundary. While the staged wasm waits for its trigger, the old wasm
keeps playing uninterrupted — the swap is a one-frame pointer flip in
the worklet, not a recompile stall.

This generalises beyond song-switching: it's the same machinery for any
edit (synth, song, shader) where the user wants the change audible *at*
the bar, not in the middle of a phrase. Live-coding idiom borrowed from
Tidal Cycles / Sonic Pi.

#### UI

A small dropdown next to the save button. Value selects the
**quantization divisor `N`**: the swap fires on the next beat whose
beat number satisfies `(beatNumber + 1) % N == 0`.

The engine doesn't know a song's time signature (a "bar" could be 3, 4,
6, … beats), so the labels stay numeric — the user picks the modulus
themselves based on what the current song's meter is:

| Label | N |
| --- | --- |
| Now | 0 (sentinel — immediate, the current behaviour) |
| 1 beat | 1 |
| 2 beats | 2 |
| 3 beats | 3 |
| 4 beats | 4 |
| 6 beats | 6 |
| 8 beats | 8 |
| 12 beats | 12 |
| 16 beats | 16 |
| 32 beats | 32 |

Default is **Now** (preserves current behaviour for any user who doesn't
think about quantization). The dropdown selection is sticky across saves
so the user picks "8 beats" once and every subsequent save fires at the
next beat where `(beat+1) % 8 == 0`.

#### Wiring

- **Save handler** (`compileAndPostSong` in `editorcontroller.js` →
  `audioworkletnode.port.postMessage`): pass `quantizeN` alongside the
  new wasm + eventlist. No change to compile timing.
- **Worklet** (`midisynthaudioworklet.js` / `midisynthaudioworkletprocessor.js`):
  - Receive the new wasm into a `pendingWasm` slot. If a `pendingWasm`
    already exists, replace it (last-save-wins; no queue).
  - Instantiate the new wasm instance immediately into a `pendingInstance`
    so the swap-time work is just a reference flip.
  - On each frame, after rendering the current sample: check
    `(currentBeat + 1) % quantizeN == 0` at the frame where the next
    beat starts → swap `currentInstance ← pendingInstance`, clear
    pending.
- **Beat counter**: the engine already has `BPM` and
  `pattern_size_shift`; the worklet derives sample-to-beat from
  `SAMPLERATE` and `BPM`. The "current beat" at the head of the next
  frame is what gets tested.

#### Multiple synths warm

With the quantized-save model, each save's wasm sits in the worklet's
pending slot. Subsequent saves before the trigger fires *replace* the
pending slot — only the most recent save wins. That's the right
default (the user keeps editing right up to the bar boundary). If
"queue multiple changes in order" turns out to be useful, it can be
added later.

For the concert specifically, this means: load song A, save → A plays.
Pull up song B in the editor, save with quantize=`2 bars` → A keeps
playing for ≤2 bars, then B takes over at the bar. No setlist mode
needed; no `nextSong()` primitive; the existing save button does it.

#### Scope: just the audioworklet swap timing

Nothing else changes. The song switcher behaves exactly as today —
it loads source into the editors and that's it. Compile fires only on
save, also as today. The single new piece is: when the audioworklet
receives the new wasm + event list, it defers the live replacement
until the next beat where `(beat+1) % N == 0`. So for the concert:
pick song B in the switcher, click save with quantize=`8 beats`, and
song A keeps playing for at most 8 beats while song B is compiled and
prepared in the worklet, then the swap fires on the next 8-beat
boundary.

#### Decisions

- [x] Quantization divisor `N` only, no musical labels (engine
      doesn't know the meter).
- [x] Dropdown default: **Now**.
- [x] No unified concert synth.ts.
- [x] No background pre-compile, no song-switcher changes. The only
      new behaviour is in the audioworklet: defer the wasm + eventlist
      replacement until the next beat-divisible-by-N.
- [ ] Build it as its own PR before the concert.

### 2.3 Performance setup

- [ ] Audio path: laptop → audio interface → PA. Stereo only?
- [ ] MIDI controller for live input — what's available at the venue,
      what's worth bringing
- [ ] Screen routing — what does the audience see? Editor live? Just the
      shader visualizer? Both?
- [ ] Lighting / shader sync — does the shader change with each song?
      (See `shader.glsl` at the repo root — single file, switched
      manually today.)

### 2.4 Risks + mitigations

- **Network / NEAR git unavailability**: load all songs locally before
  the show; rely on OPFS state, not on a fresh clone.
- **Compile stall during transition**: pre-compile the next synth in a
  background worker.
- **Out-of-tune drift** between songs in different keys: choose
  transitions that key-modulate naturally, or insert a one-bar pad/swell.
- **Editor mistake breaks audio mid-song**: keep a "panic" reset that
  reloads the last-known-good wasm from a snapshot. (Engine has
  something like this already — verify.)

### 2.5 Open questions

- [ ] Want to live-code anything *new* during the set, or only play
      curated material? (Affects how much editor visibility the audience
      gets.)
- [ ] Will any of the Faust effects (zita_rev1, master_me) be tweaked
      live as part of the performance?
- [ ] Pre-show rehearsal opportunities — at least one full run-through
      with the same stage gear before the concert.

---

## 3. Next actions

- [ ] Confirm IFC 2026 logistics (date, slots) and fill in §0.
- [ ] Decide talk vs demo balance (§1.6).
- [ ] Pick slide tool and draft architecture diagram.
- [ ] Pick songs and order for §2.1.
- [ ] Decide seamless-playback approach (§2.2) and prototype it on this
      repo.
- [ ] Build a unified "concert synth.ts" or commit to a per-song-switch
      strategy.
- [ ] Schedule one full rehearsal end-to-end (talk + concert) at least a
      week before travel.
