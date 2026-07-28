# Writing songs in JavaScript

*A song is a program you read from top to bottom — and a surprisingly good way
to learn programming.*

Songs in this app are written as JavaScript, but not the tangled kind. The whole
approach was designed around an old-school idea: **a program is a readable
sequence of actions.** Do this. Wait until it's done. Do the next thing.

That's it — that's the shape of every song here:

```
set the tempo
play four beats of drums
wait for them to finish
play the verse
play the chorus
```

You can follow a song like that without knowing how to code, because it reads in
the order it happens. And once you *do* want to go further, the ordinary
programming tools are right there: **loops** to repeat a section, **functions**
to name one and reuse it.

This page walks through all of it. If you've never programmed, you'll pick up
the four ideas that matter most — sequence, repetition, reuse and doing things
at the same time — and you'll hear what each one does, which is a much better
teacher than a textbook.

For the complete list of commands and their arguments, see the
[Song API reference](song-api.md).

---

## 1. Sequence: one thing after another

```javascript
setBPM(100);              // tempo: 100 beats per minute

addInstrument('drums');   // the first instrument added is channel 0

const drums = createTrack(0);   // a track that plays on channel 0

await drums.steps(1, [
    c3, c3, c3, c3
]);

loopHere();               // the song ends here, and loops back to the start
```

Read it downwards: set the tempo, make a drum track, play four kicks, end.

`steps(1, [...])` means "**1 step per beat**", and each entry in the list is one
step — so those four `c3` notes land on beats 0, 1, 2 and 3.

On the drum channel, `c3` is the kick, `d3` the snare, `fs3` the hi-hat.
Elsewhere note names are what they look like: `c4`, `fs3`, `as5` — note letter,
optional `s` for sharp, then the octave.

### The pause: `await`

The one word doing real work above is **`await`**. It means:

> **wait for this to finish before moving to the next line.**

That's the pause in "do this, wait, do the next thing". Without it the song
would rush on to the next line immediately — which turns out to be useful, and
is [section 4](#4-at-the-same-time-the-one-idea).

### Finer grids and rests

Change the number and you change the grid. `steps(2, [...])` is two steps per
beat (eighth notes), `steps(4, [...])` is four (sixteenths).

A **gap in the list is a rest** — just leave the slot empty:

```javascript
await drums.steps(2, [
    c3, , c3, , c3, , c3, ,
]);
```

Eight steps at two per beat = four beats, with a kick on each beat and a rest on
each "and" in between. Writing the rests out keeps the grid lined up visually,
which is the whole point — you can *see* the rhythm in the shape of the text.

---

## 2. Repetition: loops

Music repeats. So rather than copying a bar out sixteen times, say it once and
repeat it.

For a pattern, add `.repeat()`:

```javascript
await drums.steps(1, [ c3, c3, c3, c3 ].repeat(3));   // the bar, four times total
```

(`.repeat(3)` means "three more times" — four in total.)

Watch out for that one: `.repeat` here adds *extra* copies, so you get one more
than the number you write. **To play a bar N times, ask for `N - 1`** —
`.repeat(7)` for eight bars. If a part ever comes out one bar longer than
everything else, this is why.

For a whole section, use a **loop**. This plays the bar four times over:

```javascript
for (let n = 0; n < 4; n++) {
    await drums.steps(1, [ c3, c3, c3, c3 ]);
}
```

`for (let n = 0; n < 4; n++)` reads as: start with `n` at 0, keep going while
`n` is under 4, add one each time round. So the body runs four times.

The reason this beats copy-paste is that you can make one time round
*different* — a fill on the last bar, say:

```javascript
for (let n = 0; n < 4; n++) {
    if (n === 3) {
        await drums.steps(2, [ c3, , c3, , d3, d3, d3, d3 ]);   // fill on the last bar
    } else {
        await drums.steps(1, [ c3, c3, c3, c3 ]);
    }
}
```

That's a real musical idea — a four-bar phrase with a fill — expressed with a
loop and an `if`. It's also exactly how the arrangement in
[examples/beachdrive/song.js](../../examples/beachdrive/song.js) is built.

---

## 3. Reuse: functions

A **function** is just a name for a chunk of song, so you can refer to it later
instead of writing it out again:

```javascript
async function verse() {
    await drums.steps(1, [ c3, c3, c3, c3 ].repeat(3));
}

async function chorus() {
    await drums.steps(2, [ c3, , c3, d3 ].repeat(7));
}
```

Then the song itself becomes something anyone can read, coder or not:

```javascript
await verse();
await chorus();
await verse();
await chorus();

loopHere();
```

That top-to-bottom readability is the entire point of the approach. The detail
lives inside the named pieces; the arrangement stays a plain list of what
happens next.

> **Why `async function`?** Any function that contains an `await` inside it has
> to be marked `async`. Think of it as labelling the function "this one takes
> musical time". You'll use `async function` for song sections almost always.

---

## 4. At the same time: the one idea

Everything so far has been one thing after another. But music is mostly things
happening **together** — bass under drums, hats between kicks.

Here's the whole trick, and it follows from what `await` already means:

> **Each command starts a part playing. `await` means wait for it to finish
> before going on. So leave the `await` off and the next line starts straight
> away — on top of what's already playing.**

Want hi-hats playing *with* the kick? Start the hats, don't wait for them, then
play the kick:

```javascript
setBPM(100);

addInstrument('drums');   // channel 0
addInstrument('hats');    // channel 1

const drums = createTrack(0);
const hats  = createTrack(1);

// hats play along — no await, so we don't wait for them
hats.steps(2, [
    , fs3, , fs3, , fs3, , fs3
]);

// the kick keeps the beat — awaited, so the song moves on after it
await drums.steps(1, [
    c3, c3, c3, c3
]);

loopHere();
```

Both parts are four beats long and both start at the same moment, so they sound
together: kick on every beat, hats on the off-beats between them.

The rule of thumb, worth memorising in these words:

> **`await` only the part that keeps the beat. Let the others play along.**

Usually the beat-keeper is the drums — whatever decides how long the section is.
Everything layered on top gets started and left to run.

And it composes with sections, exactly as in section 3:

```javascript
bassline();      // starts, plays along
melody();        // starts, plays along
await beat();    // keeps the beat — decides how long this section lasts
```

### What happens if you await everything

This is *the* classic mistake:

```javascript
await drums.steps(1, [ c3, c3, c3, c3 ]);              // wait for all four beats...
await hats.steps(2, [ , fs3, , fs3, , fs3, , fs3 ]);   // ...only then start the hats
```

Now the drums play four beats and *then* the hats start — two parts one after
the other instead of a groove. If you ever hear instruments playing separately
when you meant them together, this is why: take the `await` off everything
except the beat-keeper.

One catch: the awaited part should be the **longest** of the group, since it's
the one deciding where the section ends. A part longer than it runs over into
whatever comes next.

### Moving the clock by hand

Sometimes you want a pause, or an exact position, without a pattern:

```javascript
await waitDuration(16);   // move forward 16 beats from wherever we are
await waitForBeat(64);    // jump to beat 64 exactly
```

Prefer `waitDuration` — because it's relative, you can insert or reorder a
section without recalculating every number after it.

---

## Three things that surprise everyone

Under the hood, your song code doesn't play music: it runs once, top to bottom,
writing down a timeline that gets played afterwards. That's why starting a part
without waiting for it works at all — and it explains all three of these, which
are really the same thing seen from different angles.

**1. If you `await` nothing, you get silence.** Nothing ever waits, so the song
reaches `loopHere()` still at beat 0 — and a song that ends at beat 0 contains
nothing. Every note is discarded. A song needs at least one awaited part to have
any length at all.

**2. Don't wrap your song in a function.** Some programming habits say to wrap
code in `(async () => { ... })()`. Here that breaks everything, for the reason
above: nothing awaits the wrapper, so `loopHere()` runs at beat 0 and you get an
empty song. You never need a wrapper — the song file already is one, which is
why `await` works at the top level.

**3. `loopHere()` goes last.** It means "the song ends here", not "loop back to
this spot" — playback always returns to the very beginning. Anything written
after it is never reached.

---

## What you've actually learned

Look back at the four sections. They are, in order, the four ideas every
introduction to programming tries to teach:

| | in programming | in your song |
|---|---|---|
| 1 | **sequence** — statements run in order | do this, then the next thing |
| 2 | **iteration** — loops repeat work | play the bar four times, with a fill on the last |
| 3 | **abstraction** — functions name and reuse | `verse()`, `chorus()` |
| 4 | **concurrency** — things run at the same time | bass under drums |

The fourth is the one people find hardest, and it's normally taught with network
requests — where you're told that awaiting things one at a time is slower than
starting them together, but nothing you can perceive actually changes.

Here you *hear* it. Await everything and the instruments play one after another;
start them together and they play as a band. Same rule, audible.

So a musician already has the intuition that trips up most people learning to
program: parts play at the same time, and sometimes you wait for one to end
before the next begins.

### For programmers

None of this is special-cased for music — it is plain JavaScript `async`/`await`
semantics. Calling an async function starts it and hands you a promise; the code
carries on, so several run concurrently. `await` pauses until one settles.

Two details specific to this sequencer:

- The concurrency is over **song time**, not wall-clock time. `await` drives a
  virtual clock the sequencer ticks forward; the whole song compiles in
  milliseconds, long before you hear a note.
- So an un-awaited call isn't fire-and-forget in the usual risky sense. A
  pattern queues its note events against that clock as soon as it's called, and
  its promise resolves at the pattern's *end*. Ignoring the promise means "run
  this concurrently in song time" — which is exactly what layering is.
- `await Promise.all([...])` works too and is equivalent for equal-length parts,
  but awaiting the beat-keeper reads better and handles unequal lengths
  sensibly.

---

## Where next

- [Song API reference](song-api.md) — every command, with exact arguments.
- [Agentic Composition](agenticcomposition.md) — making a track by talking to
  the in-app AI agent.
- [Animating images & text](animations.md) and [shaders](shaders.md) — driving
  the visuals from the song.
- [Faust effects](effects.md) — per-instrument and master effects.
