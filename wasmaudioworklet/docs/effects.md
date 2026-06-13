# Faust effects: channel & master

Two ways to add a Faust effect in this app, with copy-paste steps. The key idea:

> **`process = …` is the instrument (a *voice*, with NO audio input).
> An effect HAS an audio input, so it never goes in `process`.**
> That's why a chorus/echo put in `process` fails with `Cannot find name 'input0'`.

Pick the pattern by *where* the effect should run:

| Pattern | Runs | Use for | Wired in |
| --- | --- | --- | --- |
| **A. Channel effect** (`effect = …`) | once per channel, on that instrument's mixed voices | per-instrument colour (chorus, flanger, per-synth reverb) | the instrument's `.dsp` |
| **B. Master effect** (standalone class) | once on the whole mix | global send (room reverb, master echo) | `synth.ts` `postprocess()` |

---

## A. Chorus on the SimpleSynth — channel effect (`effect =`)

Faust's convention: `process` = the voice, `effect` = the post-voice channel
processing. faust2as turns `effect` into `<Name>Channel.preprocess()` and feeds
it the voice mix. We **reuse** the upstream chorus via `library(...)` instead of
copy-pasting it.

**1. Copy two files into the song's `faust/` folder** (from the Faust SAM chorus
example):

- `chorus.dsp` — https://github.com/grame-cncm/faust/blob/master-dev/examples/SAM/chorus/chorus.dsp
- `layout2.dsp` — https://github.com/grame-cncm/faust/blob/master-dev/examples/SAM/chorus/layout2.dsp
  (the chorus's UI grouping helpers `ckg`/`csg` — `chorus.dsp` imports it)

Leave both files **as-is** — no editing. `chorus.dsp` has its own
`process = …` and a generic `voices`, but that's fine: we pull it in with
`library()`, which **namespaces** everything behind a prefix so nothing leaks
into or collides with the synth (a plain `import("chorus.dsp")` would dump its
`process`/`voices` into global scope instead).

**2. In `simplesynth.dsp`, add two lines** after the `process = …` line:

```faust
ch = library("chorus.dsp");
effect = ch.chorus_mono(ch.dmax, ch.curdel, ch.rate, ch.sigma, ch.do2, ch.voices);
```

Full file:

```faust
import("stdfaust.lib");

// A minimal subtractive-synth voice: a sawtooth oscillator through a
// resonant low-pass filter, shaped by an ADSR envelope.
// freq / gain / gate are the MIDI note interface; cutoff / resonance
// become tweakable channel parameters (mapped to MIDI CC).

freq = hslider("freq", 440, 20, 20000, 0.01);
gain = hslider("gain", 0.5, 0, 1, 0.01);
gate = button("gate");

cutoff    = hslider("cutoff", 2000, 50, 8000, 1);
resonance = hslider("resonance", 2, 0.7, 25, 0.01);

env = en.adsr(0.01, 0.2, 0.7, 0.3, gate);

process = os.sawtooth(freq) : fi.resonlp(cutoff, resonance, 1) : *(env * gain);
ch = library("chorus.dsp");
effect = ch.chorus_mono(ch.dmax, ch.curdel, ch.rate, ch.sigma, ch.do2, ch.voices);
```

**3. Transpile** `simplesynth.dsp` in the app's Faust editor. It reports
`Detected effect declaration — will generate SimplesynthChannel`. The instrument
class `Simplesynth` has **no `input0`**; the chorus lands in
`SimplesynthChannel.preprocess()`.

**4. Hear it / tweak it** — the chorus params carry `[midi:ctrl N]` tags, so
they're channel CCs. On the SimpleSynth's channel in `synth.ts`:

```ts
midichannels[0].controlchange(3, 70);   // chorus depth     (CC 3)
midichannels[0].controlchange(2, 10);   // chorus rate      (CC 2, slow)
midichannels[0].controlchange(4, 64);   // chorus delay     (CC 4)
midichannels[0].controlchange(58, 45);  // chorus deviation (CC 58)
```

**Gotchas**
- `effect` must live in a `.dsp` that **also** has a `process` voice — an effect
  attaches to a channel that has voices. You can't transpile a lone chorus.
- Don't add a standalone `ChorusChannel` instrument in `synth.ts` — that's the
  `input0` error. The chorus lives *inside* `SimplesynthChannel`.

---

## B. Tapiir echo — master effect (whole mix)

Tapiir is its own class, applied to the final mix in `postprocess()`. This is
already wired in `demo/synth.ts`:

```ts
import { Tapiir } from '../faust/tapiir';
const tapiir = new Tapiir();

export function postprocess(): void {
  tapiir.process(outputline.left, outputline.right);
  outputline.left  = tapiir.signal.left;
  outputline.right = tapiir.signal.right;
}
```

By default every delay-tap output gain is **0**, so only the dry signal passes —
no echo. Set fields on the `tapiir` instance (e.g. in `initializeMidiSynth()`):

```ts
// --- 300 ms echo with feedback, via Tapiir delay-line 0 ---
tapiir.delaySec = 0.3;   // time between repeats, seconds (0..5)
tapiir.tap07    = 0.5;   // delayed line 0 -> LEFT output
tapiir.tap08    = 0.5;   // delayed line 0 -> RIGHT output
tapiir.tap0     = 0.4;   // feedback: line 0 into itself (repeats). 0 = single slap-back. keep < 0.9
```

**Tapiir field map** (6 delay lines × 2 outputs)
- **Delay times**: `delaySec`, `delaySec2` … `delaySec6` — the 6 lines (seconds).
- **To outputs**: `tap07…tap57` → LEFT out; `tap08…tap58` → RIGHT out (lines 0…5).
- **Feedback**: `tap0…tap5` feed lines back into line 0; `tap02…tap52` into
  line 1; etc. So `tap0` = line-0 self-feedback (more = more repeats).
- **Dry passthrough**: `input07/input17` (L) and `input08/input18` (R) are 1.0 —
  the dry signal. For a stereo dry path set `input17 = 0` and `input08 = 0`.

**Why "no echo" at first**: `delaySec` defaults to 0 and all `tapXX` output gains
are 0 → the delayed signal never reaches the output. Set a delay time **and** a
tap output gain.

---

## One-line rule of thumb
- Colour one instrument → **`effect =` in its `.dsp`** (Pattern A).
- Process the whole mix → **standalone class in `postprocess()`** (Pattern B).
- Anything with an audio input is an effect → **never** put it in `process`.

---

## Regression test

The Pattern B wiring above is verified end-to-end by
[e2e/effects-doc.spec.js](../e2e/effects-doc.spec.js): it extracts the
`postprocess()` and field-setting code blocks **from this document**, transpiles
a Tapiir effect in the browser, renders a note to WAV through the app's export
pipeline, and asserts an audible echo tail appears with the settings (and not
with the defaults). If the wiring or field names here drift from what the
transpiler produces, that test fails — so these snippets stay correct.
