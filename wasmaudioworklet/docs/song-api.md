# JavaScript Sequence API Documentation

This document describes the functions available when writing JavaScript music sequences in the song compiler.

**The song source runs as one top-level async function** — `await` works directly at top level:

```javascript
setBPM(120);
await createTrack(0).steps(4, [c2,, c2,, ds2,, c2,,]);
loopHere();
```

Never wrap sequencing in an async IIFE (`(async () => { ... })()`) or any other wrapper function: the wrapper is not awaited, so code after it — including `loopHere()` — executes at beat 0 before any notes are scheduled, and the song breaks.

## Table of Contents

- [Global Functions](#global-functions)
- [Track Functions](#track-functions)
- [Note Functions](#note-functions)
- [Video/Audio Functions](#videoaudio-functions)
- [Recording Functions](#recording-functions)
- [Song Structure Functions](#song-structure-functions)
- [Channel Control Functions](#channel-control-functions)
- [TrackerPattern Class](#trackerpattern-class)
- [TrackerPattern Instance Methods](#trackerpattern-instance-methods)
- [Array Extensions](#array-extensions)

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
Advances the shared clock by `beats` beats **from the current position** (relative;
`waitForBeat` is absolute). Also available as a track method (`track.waitDuration(...)`).

**Prefer `waitDuration` for sequencing sections back-to-back.** Because each wait
is relative to where the previous section ended, inserting, removing, or
reordering a section doesn't force you to recompute every following beat — unlike
`waitForBeat`, where absolute numbers (64 → 80 → 96 …) all shift. Reserve
`waitForBeat` for pinning an event to a specific absolute beat.

**Example:**
```javascript
playIntro();  await waitDuration(16);   // 16 beats of intro
playGroove(); await waitDuration(16);   // then 16 beats of groove — no beat math
```

### `playFromHere()`
Resets playback to start from the current position, keeping only control change messages.

### `loopHere()`
Marks the **end** of the song. When playback reaches this point it loops back to
the **start** (beat 0). Anything sequenced *after* `loopHere()` is discarded and
never plays — so call it once, as the last statement. It is not a "loop back to
here" target; the loop always returns to the beginning.

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
Repeats the array contents.

**Example:**
```javascript
[c4, e4, g4].repeat(3)  // Plays the pattern 4 times total
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

await Promise.all([
    synth.steps(4, [
        c4, , e4, ,
        g4, , c5, 
    ].repeat(3)),
    
    drums.steps(4, [
        c2, , , ,
        , , c2, 
    ].repeat(3))
]);

definePartEnd('intro');

loopHere();
```
