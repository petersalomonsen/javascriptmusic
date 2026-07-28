# JavaScript Sequence API Documentation

This document describes the functions available when writing JavaScript music sequences in the song compiler.

New to this way of writing music? Start with
[Writing songs in JavaScript](writing-songs.md) — a song read as what it is, a
sequence of actions with pauses, plus the loops and functions that keep it
readable. Written for people who don't code. This page is the reference.

## Table of Contents

- [How a song works — the playhead model](#how-a-song-works--the-playhead-model)
- [Global Functions](#global-functions)
- [Track Functions](#track-functions)
- [Note Functions](#note-functions)
- [Video/Audio Functions](#videoaudio-functions)
- [Shader Text & Parameter Functions](#shader-text--parameter-functions)
- [Recording Functions](#recording-functions)
- [Song Structure Functions](#song-structure-functions)
- [Channel Control Functions](#channel-control-functions)
- [TrackerPattern Class](#trackerpattern-class)
- [TrackerPattern Instance Methods](#trackerpattern-instance-methods)
- [Array Extensions](#array-extensions)

---

## How a song works — the playhead model

A song is **not** a program that plays music. It is a program that runs once, at
compile time, and writes down a timeline. Playback happens afterwards, from that
timeline.

The whole model is four sentences:

1. The song source is **one top-level async function**, so `await` works
   directly at top level. Statements run in order.
2. There is a **playhead** — the current song position. It starts at beat 0.
3. **Calling** a pattern (`track.steps(...)`, `track.play(...)`) schedules its
   notes relative to where the playhead is *now*. It does not move the playhead.
4. **`await` is the only thing that moves the playhead.** Awaiting a pattern
   moves it to the end of that pattern.

Musically, that's just: **every statement starts a part playing, and `await`
means "wait for that part to finish before going on."** Which is exactly what
`async`/`await` means in JavaScript generally — this is ordinary concurrency,
running over song time instead of wall-clock time.

That's it. Everything below follows from those four sentences rather than being
a separate rule to remember.

### Playing tracks at the same time

Layering and sequencing are the same mechanism, used two ways: **don't await to
stack parts, await to move past them.**

So to play several parts together, **`await` only the one pattern that keeps the
beat, and call the others plainly.** They all start at the same position; the
awaited one decides how long the section lasts.

```javascript
const kick = createTrack(0);
const hats = createTrack(1);

// hats play alongside the kick — scheduled, not awaited
hats.steps(2, [
    , fs3, , fs3, , fs3, , fs3
].repeat(7));                    // .repeat(7) = 8 copies = 32 beats

// the kick keeps the beat, so it is the one that is awaited
await kick.steps(1, [
    c2, c2, c2, c2
].repeat(7));                    // also 32 beats — same length, so they line up
```

`await`ing both instead is the classic bug: the kick's 32 beats play through to
the end, and *then* the hats start — two parts back to back instead of one
groove.

```javascript
await kick.steps(1, [c2, c2, c2, c2].repeat(7));
await hats.steps(2, [, fs3, , fs3, , fs3, , fs3].repeat(7));   // WRONG — starts at beat 32
```

**Order matters: the awaited pattern goes last.** Everything meant to sound
alongside it must be scheduled *before* it. A pattern written after the `await`
is anchored at the end of the awaited one, so it begins after the section has
finished — and if `loopHere()` comes next, every one of its notes is discarded:

```javascript
await kick.steps(1, [c2, c2, c2, c2]);
hats.steps(2, [, fs3, , fs3, , fs3, , fs3]);   // WRONG — starts at beat 4
loopHere();                                     // …and is cut here. Silent.
```

That failure is easy to misread, because the instrument is fine — probe it and
it sounds. The channel is simply never given any notes. `song_summary` reports
it as *declared with addInstrument but plays NO notes*.

The awaited pattern should also be the **longest** in the group (or equal). A
part longer than it keeps running into whatever comes next, and anything past
`loopHere()` is cut off.

`Promise.all([...])` also works and is equivalent when the parts are the same
length, but it is noisier — prefer awaiting the beat-keeper.

### If nothing is awaited, the song is empty

The playhead never moves, so `loopHere()` marks the end of the song at beat 0
and the entire timeline is discarded. The compiled result is literally just an
end-of-song marker — no notes at all, even though the source is full of them.

This is also why you must **never wrap sequencing in an async IIFE**
(`(async () => { ... })()`) or any other wrapper function. The wrapper is not
awaited, so the playhead is still at 0 when `loopHere()` runs:

```javascript
(async () => {                  // WRONG — nothing awaits this wrapper
    await bass.steps(4, [c2]);
})();
loopHere();                     // runs at beat 0 → empty song
```

It is the same failure as awaiting nothing at all. No wrapper is ever needed:
the source already *is* an async function.

### `loopHere()` marks the playhead

`loopHere()` records "the song ends here" at the current playhead position, and
playback loops from there back to beat 0. It is not a "loop back to *here*"
target. Since it captures wherever the playhead happens to be, it must be the
**last statement** — anything sequenced after it is never reached.

### Moving the playhead directly

Besides awaiting a pattern, you can move the playhead by hand:

- `await waitDuration(beats)` — move **relative** to the current position.
- `await waitForBeat(beat)` — move to an **absolute** beat.

Prefer `waitDuration` for laying out sections back-to-back: each section starts
where the last ended, so inserting or reordering one doesn't force you to
recompute every beat number that follows.

### Held notes must release before the same pitch is played again

A note-off that lands at exactly the next note-on of the **same pitch on the
same channel** cuts that new note: the synth receives an attack and then a
release for one sounding note, and what you hear is a chord tone dropping out.

It shows up when a chord is held into the next chord that shares a pitch —
A#maj7 → F both contain `f5` and `a5`:

```javascript
await piano.play([
    [0,   as4(2.5), d5(2.5), f5(2.5), a5(2.5)],   // WRONG — reaches exactly beat 2.5
    [2.5, f5(1), a5(1), c6(1)],                   // f5 and a5 are cut here
]);
```

Trim each held note by a hair so its release clears the next attack:

```javascript
await piano.play([
    [0,   as4(2.45), d5(2.45), f5(2.45), a5(2.45)],   // ~0.05 beat of daylight
    [2.5, f5(0.95), a5(0.95), c6(0.95)],
]);
```

This applies to **sustained** parts. Short percussive steps in a grid re-trigger
normally — a hi-hat on every eighth has its note-off on the next note-on by
construction, and that is the idiom, not a bug.

### The rule generalises

Anything that occupies time follows the same two-way rule — call it to run it
alongside, await it to advance past it. That covers `steps()`, `play()`,
`controlchange()`, `pitchbend()`, and your own helper functions:

```javascript
for (let n = 0; n < 4; n++) {
    pianos();            // plays along
    bass1();             // plays along
    guitar1();           // plays along
    await basicdrums();  // keeps the beat — sets how long this section is
}
```

That is the whole arrangement structure of `examples/beachdrive/song.js`.

---

## Global Functions

### `setBPM(tempo)`
Sets the tempo of the song in beats per minute.

**Parameters:**
- `tempo` (number): The tempo in BPM

**Example:**
```javascript
setBPM(120);
```

### `waitForBeat(beatNo)`
Waits until the specified beat number is reached.

**Parameters:**
- `beatNo` (number): The beat number to wait for

**Example:**
```javascript
await waitForBeat(4);
```

### `waitDuration(beats)`
Moves the playhead `beats` beats **from the current position** (relative;
`waitForBeat` is absolute). Also available as a track method (`track.waitDuration(...)`).

**Prefer `waitDuration` for sequencing sections back-to-back** — see
[Moving the playhead directly](#moving-the-playhead-directly). Reserve
`waitForBeat` for pinning an event to a specific absolute beat.

**Example:**
```javascript
playIntro();  await waitDuration(16);   // 16 beats of intro
playGroove(); await waitDuration(16);   // then 16 beats of groove — no beat math
```

### `playFromHere()`
Resets playback to start from the current position, keeping only control change messages.

### `loopHere()`
Marks the **end** of the song, at the current playhead position. When playback
reaches this point it loops back to the **start** (beat 0). Anything sequenced
*after* `loopHere()` is discarded and never plays — so call it once, as the last
statement. It is not a "loop back to here" target; the loop always returns to
the beginning. See [`loopHere()` marks the playhead](#loophere-marks-the-playhead).

---

## Track Functions

### `createTrack(channel, stepsperbeat, defaultvelocity)`
Creates a new tracker pattern for sequencing notes.

**Parameters:**
- `channel` (number): MIDI channel (0-15)
- `stepsperbeat` (number): Number of steps per beat (e.g., 4 for 16th notes)
- `defaultvelocity` (number): Default note velocity (0-127)

**Returns:** `TrackerPattern` instance

**Example:**
```javascript
const drums = createTrack(9, 4, 100);
const bass = createTrack(0, 4, 80);
```

### `TrackerPattern`
The TrackerPattern class constructor (also available directly).

---

## Note Functions

Note functions are generated for all 128 MIDI notes using the format: `{notename}{octave}`

**Note names:** `c`, `cs` (C#), `d`, `ds` (D#), `e`, `f`, `fs` (F#), `g`, `gs` (G#), `a`, `as` (A#), `b`

**Octaves:** 0-10

### Basic Note Usage

```javascript
// Play middle C (C4 = note 60)
c4(duration, velocity, offset)

// Play F# in octave 3
fs3(duration, velocity, offset)
```

**Parameters:**
- `duration` (number, optional): Note duration in beats
- `velocity` (number, optional): Note velocity (0-127)
- `offset` (number, optional): Timing offset in beats

### Note Function Methods

#### `.transpose(semitones)`
Returns a note function transposed by the specified semitones.

```javascript
c4.transpose(5)  // Returns f4
```

#### `.fixVelocity(velocity)`
Returns a note function with a fixed velocity.

```javascript
c4.fixVelocity(100)  // Always plays at velocity 100
```

### `note(noteNumber, duration, velocity, offset)`
Generic note function using MIDI note number.

**Parameters:**
- `noteNumber` (number): MIDI note number (0-127)
- `duration` (number): Note duration in beats
- `velocity` (number): Note velocity (0-127)
- `offset` (number): Timing offset in beats

---

## MIDI Control Functions

### `pitchbend(start, target, duration, steps)`
Creates a pitch bend automation.

**Parameters:**
- `start` (number): Starting pitch bend value
- `target` (number): Target pitch bend value
- `duration` (number): Duration in beats
- `steps` (number): Number of interpolation steps

**Example:**
```javascript
pitchbend(8192, 16383, 1, 32)  // Bend up over 1 beat
```

### `controlchange(controller, start, target, duration, steps)`
Creates a control change automation.

**Parameters:**
- `controller` (number): MIDI CC number (0-127)
- `start` (number): Starting value
- `target` (number): Target value (optional, defaults to start)
- `duration` (number): Duration in beats
- `steps` (number): Number of interpolation steps

**Example:**
```javascript
controlchange(1, 0, 127, 2, 16)  // Modulation wheel sweep
```

---

## Video/Audio Functions

### `addAudio(url)`
Loads an audio file from a URL.

**Parameters:**
- `url` (string): URL of the audio file

**Example:**
```javascript
await addAudio('https://example.com/sample.wav');
```

### `addVideo(name, url)`
Adds a video element for playback.

**Parameters:**
- `name` (string): Identifier for the video
- `url` (string): URL of the video file

### `addImage(name, url, cache = true)`
Adds an image element.

**Parameters:**
- `name` (string): Identifier for the image
- `url` (string): URL of the image file
- `cache` (boolean): Whether to cache the image (default: true)

### `startVideo(name, clipStartTime = 0)`
Starts video playback at the current time.

**Parameters:**
- `name` (string): Video identifier
- `clipStartTime` (number): Start time within the video clip (default: 0)

### `stopVideo(name)`
Stops video playback.

**Parameters:**
- `name` (string): Video identifier

---

## Shader Text & Parameter Functions

The sequence can drive the visualizer shader directly: **what** text is on
screen, **when** it appears, and — through a parameter the shader branches on —
**how** it appears. See [shaders.md](shaders.md) for the shader side and
[animations.md](animations.md) for worked examples.

### `showText(text, options = {})`
Shows text at the current song time, on the shader's text layer
(`uText` / `uTextPrev` / `uTextMix`). Each call supersedes the previous text.
The text is rendered to an SVG image — no DOM needed, so it works inside the
song sandbox.

**Parameters:**
- `text` (string | string[]): the text; `\n` or an array gives several lines
- `options` (object):
  - `fade` (number): seconds for `uTextMix` to travel 0 → 1 (default `1.0`; `0` snaps)
  - `transition` (number): sets the `textTransition` visual param, which the
    shader reads to pick a style. Only meaningful if your shader implements it.
  - `size` (number), `color`, `font`, `weight`, `align` (`left`/`center`/`right`),
    `x`, `y` (0..1 anchors), `lineHeight`, `background`, `stroke`, `strokeWidth`,
    `width`, `height` — styling of the generated image (defaults: 1280x720,
    96px bold white sans-serif, centered, transparent background)

**Example:**
```javascript
showText('Første vers', { transition: 1, fade: 0.8 });
showText(['Two lines', 'at once'], { size: 72, stroke: '#000', strokeWidth: 6 });
```

### `hideText(options = {})`
Clears the text layer (an empty image, transitioned like any other text).
Takes the same `fade` / `transition` options.

### `setVisual(name, value, rampSeconds = 0)`
Schedules a named float that the shader reads as `uniform float <name>`. The
app assigns no meaning to the names — the song and its shader agree on them.

**Parameters:**
- `name` (string): must be a valid GLSL identifier (`[A-Za-z_][A-Za-z0-9_]*`)
- `value` (number | boolean): booleans become 1 / 0
- `rampSeconds` (number): interpolate from the previous value over this many
  seconds instead of stepping (default `0`)

Before its first scheduled value a parameter reads `0`. Values are resolved
from song time, so seeking and video export give the same result as playback.

**Example:**
```javascript
setVisual('sceneMode', 2);          // step
setVisual('bloom', 1.0, 4);         // ramp up over 4 seconds
```

---

## Recording Functions

### `startRecording()`
Starts recording MIDI input.

### `stopRecording()`
Stops recording MIDI input.

---

## Cross-Window Sync Functions

Coordinate playback across multiple browser windows of the app via a shared
`BroadcastChannel('concert-sync')`. Useful for splitting a live set across
tabs (each tab has its own AudioContext / audio thread, so wasm compiles
on save don't glitch the other tab's audio).

Only available on the midi-synth path. Manually clicking the play
checkbox or seeking the playhead clears any pending wait — a matching
broadcast is the only thing that auto-resumes.

### `broadcastSend(name)`
Emits a named signal at the current song position. Other windows
listening on the same channel can respond. Same-window listeners do not
receive their own sends.

**Parameters:**
- `name` (string): Identifier for the signal

**Example:**
```javascript
// Played in window A — the very last thing the song does is hand off
// to whatever song is waiting on 'next-up'.
await createTrack(0).steps(4, [c4,,,, e4,,,, g4,,,, c5,,,,]);
broadcastSend('next-up');
```

### `broadcastWait(name)`
Parks the sequencer at this point until a matching `broadcastSend(name)`
arrives. While parked, the play checkbox is unchecked and the song
clock is frozen. Signals that arrived *before* the wait engaged are
ignored — only fresh post-wait signals resume playback.

**Parameters:**
- `name` (string): Identifier of the signal to wait for

**Example:**
```javascript
// In window B — won't play anything until window A (or any other
// listener) emits 'next-up'.
setBPM(120);
broadcastWait('next-up');
await createTrack(0).steps(4, [
    c5, , , ,
]);
```

---

## Song Structure Functions

### `definePartStart(partName)`
Marks the start of a named song part.

**Parameters:**
- `partName` (string): Name of the song part

**Example:**
```javascript
definePartStart('verse');
// ... verse content ...
definePartEnd('verse');
```

### `definePartEnd(partName)`
Marks the end of a named song part.

**Parameters:**
- `partName` (string): Name of the song part

### `addInstrument(instrument)`
Adds an instrument name to the song's instrument list.

**Parameters:**
- `instrument` (string): Instrument name

---

## Channel Control Functions

### `mute(channel)`
Mutes a MIDI channel.

**Parameters:**
- `channel` (number): MIDI channel to mute (0-15)

### `solo(channel)`
Solos a MIDI channel (mutes all others).

**Parameters:**
- `channel` (number): MIDI channel to solo (0-15)

---

## TrackerPattern Class

The `TrackerPattern` class extends `Pattern` and provides step-sequencing capabilities.

### `steps(stepsperbeat, events)`
Plays a sequence of events at regular intervals.

**Parameters:**
- `stepsperbeat` (number): Number of steps per beat
- `events` (array): Array of note functions or arrays of note functions

**Example:**
```javascript
const track = createTrack(0, 4, 100);
await track.steps(4, [
    c4, , e4, ,
    g4, , c5, 
]);
```

Calling it schedules the notes from the current song position; `await` advances
the clock to the end of the pattern. Omit the `await` to have this part play
alongside another one — see
[Playing tracks at the same time](#playing-tracks-at-the-same-time).

### `play(rows, rowbeatcolumnmode)`
Plays events with custom timing.

**Parameters:**
- `rows` (array): Array of [beat, ...events] tuples
- `rowbeatcolumnmode` (number): Timing mode (0 = absolute, 1 = relative)

**Example:**
```javascript
await track.play([
    [0, c4],
    [0.5, e4],
    [1, g4, c5]  // Multiple notes at beat 1
]);
```

---

## TrackerPattern Instance Methods

These methods are available on TrackerPattern instances created with `createTrack()`:

### `setChannel(channel)`
Sets the MIDI channel for subsequent notes.

**Parameters:**
- `channel` (number): MIDI channel (0-15)

**Example:**
```javascript
const track = createTrack(0, 4, 100);
track.setChannel(1);
```

### `waitForBeat(beatNo)`
Waits until a specific beat relative to the pattern's offset.

**Parameters:**
- `beatNo` (number): Beat number relative to pattern start

### `waitForStep(stepno)`
Waits until a specific step number.

**Parameters:**
- `stepno` (number): Step number to wait for

### `waitDuration(duration)`
Waits for a specified duration in beats.

**Parameters:**
- `duration` (number): Duration in beats

### `note(noteNumber, duration)`
Plays a single note on the pattern's current channel.

**Parameters:**
- `noteNumber` (number): MIDI note number (0-127)
- `duration` (number): Duration in beats

### `playNote(note, duration)`
Plays a note using string notation on the pattern's current channel.

**Parameters:**
- `note` (string): Note name (e.g., 'c4', 'f#3')
- `duration` (number): Duration in beats

### `pitchbend(start, target, duration, steps)`
Performs a pitch bend automation on the pattern's channel.

**Parameters:**
- `start` (number): Starting pitch bend value
- `target` (number): Target pitch bend value
- `duration` (number): Duration in beats
- `steps` (number): Number of interpolation steps

### `controlchange(controller, start, target, duration, steps)`
Performs a control change automation on the pattern's channel.

**Parameters:**
- `controller` (number): MIDI CC number (0-127)
- `start` (number): Starting value
- `target` (number): Target value
- `duration` (number): Duration in beats
- `steps` (number): Number of interpolation steps

---

## Array Extensions

These methods are added to arrays for convenience:

### `.quantize(stepsperbeat, percentage = 1)`
Quantizes note timing to a grid.

### `.fixVelocity(velocity)`
Sets fixed velocity for all events in the array.

### `.repeat(times = 1)`
Appends `times` **further** copies of the array — so the result is
`times + 1` copies in total, not `times`.

> **This is NOT `String.prototype.repeat`.** `'ab'.repeat(3)` gives three
> copies; `[c4].repeat(3)` gives **four**. Getting this backwards is the usual
> cause of a part that is one bar longer than everything around it — and if it
> is the awaited beat-keeper, of a section that drifts out of alignment.

To play a one-bar pattern **N times, pass `N - 1`**:

```javascript
[c4, e4, g4].repeat(3)   // 4 copies
[c3, c3, c3, c3].repeat(7)   // 8 copies — a 4-beat bar over 32 beats
[c3, c3, c3, c3].repeat(8)   // 9 copies = 36 beats, probably not what you meant
```

---

## Complete Example

```javascript
setBPM(120);

addInstrument('synth');
addInstrument('drums');

const synth = createTrack(0, 4, 80);
const drums = createTrack(9, 4, 100);

definePartStart('intro');

// The synth part plays along — scheduled, not awaited.
synth.steps(4, [
    c4, , e4, ,
    g4, , c5, 
].repeat(3));

// The drums keep the beat, so they are awaited: this is what
// decides how long the intro lasts.
await drums.steps(4, [
    c2, , , ,
    , , c2, 
].repeat(3));

definePartEnd('intro');

loopHere();
```
