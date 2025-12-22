# JavaScript Sequence API Documentation

This document describes the functions available when writing JavaScript music sequences in the song compiler.

## Table of Contents

- [Global Functions](#global-functions)
- [Track Functions](#track-functions)
- [Note Functions](#note-functions)
- [Video/Audio Functions](#videoaudio-functions)
- [Recording Functions](#recording-functions)
- [Song Structure Functions](#song-structure-functions)
- [Channel Control Functions](#channel-control-functions)
- [TrackerPattern Class](#trackerpattern-class)
- [Pattern Class Methods](#pattern-class-methods)

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

### `playFromHere()`
Resets playback to start from the current position, keeping only control change messages.

### `loopHere()`
Marks the current position as a loop point.

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

## Pattern Class Methods

These methods are available on TrackerPattern instances:

### `note(noteNumber, duration)`
Plays a single note.

**Parameters:**
- `noteNumber` (number): MIDI note number (0-127)
- `duration` (number): Duration in beats

### `playNote(note, duration)`
Plays a note using string notation.

**Parameters:**
- `note` (string): Note name (e.g., 'c4', 'f#3')
- `duration` (number): Duration in beats

### `setChannel(channel)`
Sets the MIDI channel.

**Parameters:**
- `channel` (number): MIDI channel (0-15)

### `waitForBeat(beatNo)`
Waits until a specific beat relative to the pattern's offset.

### `waitForStep(stepno)`
Waits until a specific step number.

### `waitDuration(duration)`
Waits for a specified duration in beats.

### `pitchbend(start, target, duration, steps)`
Performs a pitch bend automation (see MIDI Control Functions).

### `controlchange(controller, start, target, duration, steps)`
Performs a control change automation (see MIDI Control Functions).

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
