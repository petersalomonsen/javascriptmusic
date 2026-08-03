# Performance kit — generic starter

This kit is in your context from the start of the session, so the sounds and
wiring below need **no lookup**: write them straight out.

Everything here is verified end to end with `tools/instrumenttest/render.mjs` —
each `.dsp` transpiles, compiles into the real synth, and renders audio. Each
generates only a voice class (no `<Name>Channel`), so all register with the
plain `MidiChannel`.

## Channel map

| ch | name  | faust file        | class   |
|----|-------|-------------------|---------|
| 0  | kick  | `faust/kick.dsp`  | `Kick`  |
| 1  | snare | `faust/snare.dsp` | `Snare` |
| 2  | hihat | `faust/hihat.dsp` | `Hihat` |
| 3  | pad   | `faust/pad.dsp`   | `Pad`   |
| 4  | bass  | `faust/bass.dsp`  | `Bass`  |
| 5  | lead  | `faust/lead.dsp`  | `Lead` + `LeadChannel` |

Build only the channels the user asked for. "Give me a beat" is channels 0-2 and
nothing else — do not add the pad, bass or lead uninvited.

**There is no drum note map here.** Each drum has its own channel, so the note
only sets `freq`: kick and snare pitch follow the note played, and the hihat
ignores pitch entirely (it is filtered noise). Never tell the user "c3 is the
kick" for these voices.

**Octaves: `c4` is middle C, so `c2` is 32.7 Hz and `f1` is 21.8 Hz** — below
audibility on most systems. Keep bass roots at `c2`/32.7 Hz or above.

## Effects belong on the channel, not in the voice

An echo, reverb or chorus written into `process` runs **per voice** and is torn
down when that voice is released and recycled — measured: a 0.4s echo inside the
voice was silent 0.5s after note-off, while the same echo as a channel effect
still rang at 2s. Put it in an `effect = ...` declaration instead, which runs
once over the channel's mixed voices (see `faust/lead.dsp` below). That also
generates a `<Name>Channel` class you must register in place of `MidiChannel`.

Expose timing as an `hslider` rather than hard-coding the BPM: sliders become
channel parameters the song can set, so a tempo change does not mean re-writing
the DSP.

## Saturation

Two saturators both work end to end — pick by taste:

- `ma.tanh` — a true tanh soft clipper. The transpiler emits `Mathf.tanh`, which
  AssemblyScript compiles natively, so `write_faust` → `compile` succeeds.
- `sat(x) = x / (1.0 + abs(x));` — a cheaper soft clipper (one divide, no
  transcendental). This is what the kick/bass/lead below use.

Write `ma.tanh`, **not bare `tanh`** — `tanh` on its own is not a Faust
primitive and fails with `undefined symbol`.

## Instruments (write these verbatim with `write_faust`)

### kick — `write_faust('kick', ...)` → `Kick`
```
import("stdfaust.lib");
freq = hslider("freq", 55, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.8, 0, 1, 0.01);
pitchEnv = en.ar(0.001, 0.055, gate);
ampEnv = en.ar(0.002, 0.32, gate);
body = os.osc(freq + freq * 5 * pitchEnv);
click = no.noise * en.ar(0.0005, 0.012, gate) * 0.35;
sat(x) = x / (1.0 + abs(x));
process = sat((body * ampEnv + click) * gain * 2.2) * 1.5;
```
Punchier: raise the `5` in `body` (bigger pitch drop). Longer tail: raise `0.32`.

### snare — `write_faust('snare', ...)` → `Snare`
```
import("stdfaust.lib");
freq = hslider("freq", 180, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.7, 0, 1, 0.01);
tone = (os.osc(freq) + os.osc(freq * 1.6)) * 0.5 * en.ar(0.001, 0.11, gate);
snap = (no.noise : fi.highpass(2, 1200)) * en.ar(0.001, 0.17, gate);
process = (tone * 0.5 + snap * 0.7) * gain;
```
More crack: raise the `0.7` on `snap`. More body: raise the `0.5` on `tone`.

### hihat — `write_faust('hihat', ...)` → `Hihat`
```
import("stdfaust.lib");
freq = hslider("freq", 8000, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
process = (no.noise : fi.highpass(4, 7000)) * en.ar(0.001, 0.05, gate) * gain;
```
Open hat: raise the release `0.05` to ~0.25. Darker: lower the `7000`.

### pad — `write_faust('pad', ...)` → `Pad`
Detuned triple saw, for chord progressions.
```
import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
det = 1.004;
saws = (os.sawtooth(freq) + os.sawtooth(freq * det) + os.sawtooth(freq / det)) / 3;
env = en.adsr(0.08, 0.3, 0.7, 0.45, gate);
process = (saws : fi.lowpass(2, 1800)) * env * gain * 0.5;
```
Wider: raise `det` toward 1.01. Brighter: raise the `1800`. Slower swell: raise
the attack `0.08`.

### bass — `write_faust('bass', ...)` → `Bass`
Punchy: saw+sine through an envelope-swept resonant lowpass, then saturation.
```
import("stdfaust.lib");
freq = hslider("freq", 55, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.8, 0, 1, 0.01);
env = en.adsr(0.005, 0.12, 0.6, 0.12, gate);
fenv = en.ar(0.005, 0.18, gate);
osc = os.sawtooth(freq) * 0.7 + os.osc(freq) * 0.5;
cutoff = 60 + 2200 * fenv;
sat(x) = x / (1.0 + abs(x));
process = sat((osc : fi.resonlp(cutoff, 3, 1)) * env * gain * 2.4) * 1.1;
```
More punch: raise the `2200` (bigger sweep) or shorten `fenv`'s `0.18`. Dirtier:
raise the `2.4` drive. Longer notes: raise the sustain `0.6`. The 2nd harmonic
sits above the fundamental by design — that is what makes it audible on small
speakers.

### lead — `write_faust('lead', ...)` → `Lead` + `LeadChannel`
Fat: three detuned saws plus a sub square, swept resonant lowpass, saturated,
with a channel-level echo.
```
import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.7, 0, 1, 0.01);
saws = (os.sawtooth(freq) + os.sawtooth(freq * 1.006) + os.sawtooth(freq * 0.994) + os.square(freq * 0.5) * 0.35) / 3.6;
env = en.adsr(0.01, 0.2, 0.75, 0.25, gate);
fenv = en.adsr(0.02, 0.25, 0.5, 0.25, gate);
cutoff = 400 + 5000 * fenv;
sat(x) = x / (1.0 + abs(x));
process = sat((saws : fi.resonlp(cutoff, 4, 1)) * env * gain * 1.6) * 0.7;

echotime = hslider("echotime", 0.402, 0.02, 1.2, 0.001);
echofb = hslider("echofb", 0.5, 0, 0.95, 0.01);
echomix = hslider("echomix", 0.4, 0, 1, 0.01);
echo = + ~ (de.fdelay(131072, echotime * ma.SR) : *(echofb));
effect = _ <: _, (echo : *(echomix)) :> _;
```
Because it declares `effect`, this one DOES generate `LeadChannel` — register it
in place of `MidiChannel` (see the combiner below). `echotime` defaults to a
dotted-8th at 112 BPM; the formula is `3 / stepsPerBeat * 60 / bpm`.
Fatter: push the detune `1.006`/`0.994` further apart. Screamier: raise the
resonance `4`. Softer: lower the `1.6` drive.

**Do not raise the sub-square's `0.35` much.** It is an octave below the note,
and at `0.6` it dominates the three saws — probing then reports a dominant of
exactly half the played pitch (a4 sounds as a3). If you want more weight, widen
the detune instead.

These levels are balanced against each other as written (kick/snare/hihat all
render around peak 0.11). If you change a drive or output scale, expect to
rebalance the others.

## synth.ts — the combiner (only the channels you built)

```typescript
import { midichannels, MidiChannel } from '../mixes/globalimports';
import { Kick } from '../faust/kick';
import { Snare } from '../faust/snare';
import { Hihat } from '../faust/hihat';
import { Pad } from '../faust/pad';
import { Bass } from '../faust/bass';
import { Lead, LeadChannel } from '../faust/lead';

export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(2, (channel: MidiChannel) => new Kick(channel));
    midichannels[1] = new MidiChannel(2, (channel: MidiChannel) => new Snare(channel));
    midichannels[2] = new MidiChannel(3, (channel: MidiChannel) => new Hihat(channel));
    midichannels[3] = new MidiChannel(8, (channel: MidiChannel) => new Pad(channel));
    midichannels[4] = new MidiChannel(2, (channel: MidiChannel) => new Bass(channel));
    midichannels[5] = new LeadChannel(4, (channel: MidiChannel) => new Lead(channel));
}
export function postprocess(): void {}
```

## Song skeleton

Eight bars at 4/4. Dm → A#maj → F → C, one bar each, played twice. Note the
shape: everything that sounds together is a plain call, and the **kick is
awaited and comes last**.

```javascript
setBPM(112);

addInstrument('kick');   // 0
addInstrument('snare');  // 1
addInstrument('hihat');  // 2
addInstrument('pad');    // 3
addInstrument('bass');   // 4
addInstrument('lead');   // 5

const kick  = createTrack(0);
const snare = createTrack(1);
const hihat = createTrack(2);
const pad   = createTrack(3);
const bass  = createTrack(4);

pad.steps(1, [
    [d4(3.95), f4(3.95), a4(3.95)], , , ,
    [as3(3.95), d4(3.95), f4(3.95)], , , ,
    [f3(3.95), a3(3.95), c4(3.95)], , , ,
    [c4(3.95), e4(3.95), g4(3.95)], , , ,
].repeat(1));

bass.steps(2, [
    d2, , d2, , d2, , d2, ,
    as2, , as2, , as2, , as2, ,
    f2, , f2, , f2, , f2, ,
    c2, , c2, , c2, , c2, ,
].repeat(1));

hihat.steps(2, [ , fs3, , fs3, , fs3, , fs3 ].repeat(7));
snare.steps(1, [ , d3, , d3 ].repeat(7));
await kick.steps(1, [ c2, c2, c2, c2 ].repeat(7));

loopHere();
```

All five parts are 32 beats: `.repeat(n)` gives n+1 copies, so `.repeat(7)` on a
4-beat pattern is 8 bars and `.repeat(1)` on a 16-beat pattern is the same 32.
Chord durations are `3.95`, not `4.0`, so a tone held into a chord sharing that
pitch is not cut.

## Workflow

1. `write_faust` each instrument the request needs — one call each, not a batch.
2. `set_synth` the combiner (or `edit_synth` to add one channel to an existing one).
3. Write or edit the song. Adding a part for an instrument that already exists is
   a **song edit only** — do not re-run `write_faust`.
4. `compile`.
5. `probe_instrument` the channel you built and quote the numbers before saying
   it is ready. "compiled OK" is not evidence of sound.
