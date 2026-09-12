# Mastering: measure, process, measure again

Mastering here works the way automatic mastering services do: the finished mix
is rendered, measured, run through a fixed chain whose settings are derived
from the measurements, and measured again until it meets a delivery target.
Nothing in it listens. Everything is a number, which is exactly what lets the
studio agent do it — and lets you check what it did.

There are three pieces:

| Piece | What it is | Where |
| --- | --- | --- |
| **The measurement** | Offline render of the compiled song through the real synth, analysed to loudness, peaks, spectrum, stereo and per-section numbers — in a Worker, so the app never freezes | `audioprobe/songrender.js`, `audioprobe/mixanalysis.js`, `audioprobe/mixprobe.js` (+ `.worker.js`); the `probe_mix` agent tool; `tools/mastertest/probe-mix.mjs` on the command line |
| **The chain** | A Faust stereo effect (high-pass, tilt EQ, low-end mono, 3-band compressor, brickwall limiter) generated to AssemblyScript as the `Mastering` class and run from `postprocess()` | `synth1/assembly/fx/mastering.dsp` → `fx/mastering.ts`, exported from `mixes/globalimports` |
| **The optimiser** | `auto_master`: wires the chain into synth.ts and converges its numeric settings by compile + measure, no model involved | `audioprobe/automaster.js`, `audioprobe/masteringedit.js`; the `auto_master` agent tool; `probe-mix.mjs --auto` |
| **The loop** | The mastering specialist: a nested agent run the producer delegates to with `master_mix`; it runs `auto_master`, then makes the tone and mix judgement calls from the NOTE lines | `studio-agent/prompt.js` (the `mastering` section), `guides.js`, `tools-core.js` (`SPECIALISTS`) |

## What the measurement reports

`probe_mix` renders the compiled event list through the compiled wasm — the
same `fillSampleBuffer()` that plays live, `postprocess()` included — and adds
1.5 s of tail after the last event so releases and reverb are measured too.
In the browser this happens in a module Worker (`mixprobe.worker.js`): a
three-minute song is a few seconds of rendering, and the editors and the
playing track stay responsive meanwhile. The report is one fact per line:

```
NOT READY for streaming & video (Spotify, YouTube, Tidal: -14 LUFS, -1 dBTP) — 2 problems
render: 16.0 s sequenced (8.0 bars at 120 BPM) + tail, 44100 Hz
loudness: integrated -11.2 LUFS (target -14 ±1)  short-term max -11.1  momentary max -10.5  range 0.1 LU
peaks: true peak 0.7 dBTP (ceiling -1)  sample peak -0.3 dBFS  clipped samples 0
dynamics: PLR 11.9 dB (true peak − integrated)  crest 13.7 dB
spectrum (dB of total): sub -16.3  bass -6.8  low-mid -3.4  mid -6.3  high-mid -13.1  high -16.8;  tilt -4.6 dB/oct (pink = -3)
stereo: correlation 1.00  side/mid -52.8 dB  low-end (<120 Hz) correlation 1.00  L/R balance -0.0 dB
sections (bars: LUFS): 1-4: -11.1 | 5-8: -11.2  → quietest 5-8 (-11.2), loudest 1-4 (-11.1)
edges: 0.0 s leading silence; level in the last 100 ms of the sequence -15.2 dBFS
PROBLEM: integrated loudness -11.2 LUFS is 2.8 LU ABOVE the -14 LUFS target (…lower gainDb by about 2.8 dB)
PROBLEM: true peak 0.7 dBTP is over the -1 dBTP ceiling by 1.7 dB (lower limiterCeilingDb by that much, or more)
NOTE: the sequenced part ends at -15.2 dBFS — an export stops at the loop point, so a tail is cut; …
```

- **Loudness** follows ITU-R BS.1770-4: K-weighted, 400 ms blocks, the −70 LUFS
  absolute and −10 LU relative gates. Integrated is the number a streaming
  service normalises on. Short-term (3 s) and momentary (400 ms) maxima show
  how far the loud moments sit above it. The loudness range (EBU Tech 3342) is
  how dynamic the piece is: under 5 LU is flat, over 15 LU is very dynamic.
- **True peak** is measured on a 4× oversampled signal. A limiter flattens
  *sample* values to its ceiling; the waveform between samples still
  overshoots, and that is what clips a DAC or a lossy encoder. The sample peak
  and the clipped-sample count are reported next to it.
- **PLR** (true peak minus integrated loudness) is the honest dynamics number
  for a master: 8–12 dB is typical for streaming, under 6 dB is squashed.
- **Spectrum**: energy per band in dB relative to the total (20 Hz–20 kHz),
  and the spectral tilt — the slope of a line through the per-octave power
  density from 50 Hz to 12.8 kHz. Pink noise is −3 dB/oct; finished masters
  usually measure somewhere between −4 and −7. Treat it as a hint about
  harshness or dullness, not a target.
- **Stereo**: L/R correlation (1 = mono, 0 = wide, negative = phase trouble),
  side-to-mid energy, the correlation of the band below 120 Hz (a wide bass
  thins out on mono playback and phone speakers), the L/R balance and any DC
  offset.
- **Sections**: loudness per 4 bars, so a breakdown or a part that is 8 LU
  under the rest is visible. A quiet section is often a *mix* problem the
  master should not be asked to fix.
- **Edges**: leading silence, and the level in the last 100 ms of the
  sequenced part. The song's length is its loop point, so an export cuts
  whatever still sounds there.

The **verdict** on the first line compares against a delivery target
(`MASTERING_TARGETS` in `mixanalysis.js`):

| Target | Integrated | True peak | Why |
| --- | --- | --- | --- |
| `streaming` (default; also video) | −14 LUFS ±1 | ≤ −1 dBTP | Spotify, YouTube, Tidal normalise to about −14 and turn louder masters *down*; −1 dBTP leaves headroom for their codecs |
| `apple` | −16 LUFS ±1 | ≤ −1 dBTP | Apple Music's Sound Check level, also podcasts |
| `club` | −8 LUFS ±1 | ≤ −0.5 dBTP | DJ use, no normalisation |
| `broadcast` | −23 LUFS ±1 | ≤ −1 dBTP | EBU R128 |

`PROBLEM` lines fail the verdict and name the `Mastering` field and the amount;
`NOTE` lines are things worth a look that a brief may legitimately overrule.

### From the command line

```sh
cd wasmaudioworklet
node ../tools/mastertest/probe-mix.mjs ../examples/house-track            # song.js + synth.ts + faust/ in a directory
node ../tools/mastertest/probe-mix.mjs ../examples/house-track --target apple --json
node ../tools/mastertest/probe-mix.mjs ../examples/house-track --auto     # master it: prints the auto_master report
node ../tools/mastertest/probe-mix.mjs ../examples/house-track --auto --write   # …and write the mastered synth.ts back
```

It compiles the song and the synth exactly as the app and the bench do, so it
also serves as a check that a project's master insert compiles at all.

## The chain

`fx/mastering.dsp` is a deliberately small chain, in the order of a
conventional mastering insert:

```
gain → high-pass → tilt EQ → low-end mono → 3-band compressor → brickwall limiter → clip
```

Every `hslider` becomes a public field on the generated `Mastering` class, so
the values are set from `synth.ts` and can be iterated on against
measurements. There is no adaptive leveler on purpose: a fixed gain the loop
adjusts converges predictably, a feedback leveler pumps and hides what it did.

| Field | Default | Meaning |
| --- | --- | --- |
| `gainDb` | 0 | input gain — set to *target − measured integrated*, then let the limiter catch peaks |
| `highpassHz` | 25 | 2nd-order high-pass for DC and sub-rumble |
| `tiltDb` | 0 | high shelf +tilt / low shelf −tilt around 630 Hz; positive = brighter |
| `lowMonoHz` | 0 (off) | everything below is summed to mono (LR4 split); 100–150 keeps the bass centred |
| `lowCrossoverHz`, `highCrossoverHz` | 150, 3000 | the three bands (Linkwitz-Riley 4th order, phase-aligned so they recombine flat) |
| `lowThresholdDb`, `midThresholdDb`, `highThresholdDb` | −18 | per-band compressor thresholds; lower = more gain reduction in that band |
| `compRatio`, `compAttackMs`, `compReleaseMs` | 2, 15, 150 | shared by the three bands (`co.compressor_stereo`, stereo-linked) |
| `compMakeupDb` | 0 | after the bands are summed |
| `limiterCeilingDb`, `limiterReleaseMs` | −1.2, 80 | brickwall look-ahead limiter, 5 ms window (so 5 ms latency): the gain is the mean over the window of the reduction each sample needs, so a *sample* peak never exceeds the ceiling; inter-sample (true) peaks can still ride 0.3–0.8 dB above it |
| `bypass` | 0 | 1 passes the mix through untouched, for A/B |

`auto_master` wires it for you (below); by hand it is three lines in the synth
document:

```ts
import { midichannels, MidiChannel, Mastering } from '../mixes/globalimports';
const mastering = new Mastering();

export function initializeMidiSynth(): void {
    // ...channel wiring...
    mastering.gainDb = 4.0;
    mastering.lowMonoHz = 120;
    mastering.limiterCeilingDb = -1.5;
}
export function postprocess(): void { mastering.processOutputline(); }
```

`processOutputline()` reads `outputline`, processes it and writes it back —
the whole of a master-insert `postprocess()`. Any stereo effect transpiled by
faust2as gets this method (see [effects.md](effects.md) for master effects in
general and [examples/master_me](../../examples/master_me/) for a far larger
chain).

### Regenerating the class

The `.ts` next to the `.dsp` is generated and committed, together with the
browser source bundle that makes it importable from `globalimports`:

```sh
node tools/faust2as/faust2asc.js --effect --library --name Mastering \
  --out wasmaudioworklet/synth1/assembly/fx/mastering.ts \
  wasmaudioworklet/synth1/assembly/fx/mastering.dsp
(cd wasmaudioworklet/synth1 && node createbrowsertsbundle.js)
```

`--library` emits only the class: without it the transpiler also emits a
default singleton with `initializeMidiSynth()`/`postprocess()` so the file can
*be* the mix entry, which is right for a one-off effect in `faust/` but wrong
for a class re-exported from `globalimports`.

## The optimiser (`auto_master`)

The arithmetic of mastering — how much gain, where the ceiling goes, whether
the bass needs to be mono — is done by measurement, not by a model:

1. Measure the synth as it is (the *before*). Silence stops the run.
2. Wire the chain if it is not there, and start from the numbers: `gainDb` =
   target − measured integrated loudness, `limiterCeilingDb` = target true
   peak − 0.5 dB, `lowMonoHz` = 120 if the low-band correlation is under 0.8.
   Existing values in the block are kept (tone settings in particular);
   `bypass` is cleared.
3. Compile, render, analyse. Loudness off by more than half the tolerance →
   move `gainDb` by the difference. True peak over the ceiling or any clipped
   sample → lower `limiterCeilingDb`. Repeat until the verdict is
   `MASTER OK`, a field hits its limit, or the loudness gap stops shrinking
   (the compressor absorbing the gain) — at most 6 rounds, a few seconds each.
4. Write the best round's settings into synth.ts in the marked block, compile
   and save, so the live synth has exactly what the report says.

```
    // --- mastering: set by auto_master / the mastering specialist (probe_mix measures the result) ---
    mastering.gainDb = 13.4;
    mastering.limiterCeilingDb = -1.5;
    // --- end mastering ---
```

In the browser the trial builds go through the compile worker and the
measurements through the mix-probe worker; nothing touches the editors until
the result is written. `examples/house-track` goes from −22 to −14.7 LUFS in
three rounds and about twelve seconds.

`auto_master` leaves tone (`tiltDb`, the thresholds) and the mix alone on
purpose — those are judgement calls that depend on the brief.

## The loop (the mastering specialist)

The producer agent never sets `Mastering` fields itself. When the user asks for
mastering, loudness, "make it louder" or a mix that is ready for
streaming/video, it calls `master_mix(brief?, target?)`. That runs the
**mastering specialist** in its own context, with only what mastering needs:
`get_synth`/`grep_synth`/`edit_synth`, `get_song`/`grep_song`/`edit_song`,
`compile`, `probe_mix`, `auto_master`, `song_summary`, `read_repo_file`.

1. `compile`, `probe_mix` — the *before*. A silent mix stops the run: mastering
   cannot fix an empty song.
2. `auto_master` with the target: gain, ceiling and low-end mono converged by
   measurement.
3. The judgement calls, from the `NOTE` lines with the brief in hand: tilt,
   an over-squashed result, a sub-heavy low end, and mix problems. One or two
   changes, then `auto_master` again — gain and ceiling must be re-found after
   any tone or mix change.
4. Stop when `auto_master` says `MASTER OK` and no note contradicts the brief,
   or after about three rounds, and report what is still off.

The one thing a mastering service cannot do, this specialist can: **change the
mix**. A section 8 LU under the rest that is not a breakdown, a channel that
clips before the chain, a bass panned off-centre — those are fixed at the
source with `controlchange(7|10|91, value)` in that channel's track, never on
the master, and every such change is listed under `mix notes:` in the report.

The result the producer receives is the specialist's report followed by a
`probe_mix` **the tool ran itself** after the specialist finished. Its first
line is `master_mix: OK: MASTER OK …` or `master_mix: FAILED: NOT READY …` —
measured, not claimed — and the producer is told to relay it as such.

## Limits worth knowing

- Only the AssemblyScript synth path runs `postprocess()`. Yoshimi and MOD
  playback connect straight to the output and are not mastered.
- The chain runs in single precision like the rest of the synth, and the
  limiter's ceiling is a sample peak; the loop compensates by reading the true
  peak and lowering the ceiling, which is why the default sits at −1.2 dB.
  (The standard-library look-ahead limiters were tried first: they smooth the
  gain with a one-pole, reach only ~63 % of the reduction within one attack
  time, and overshot by up to 1.5 dB on transients — hence the sliding-max
  design in `mastering.dsp`.)
- The measurement renders at 44.1 kHz whatever the live context rate; the
  numbers are rate-independent to well within the ±1 LU tolerance.
- `auto_master` compiles per round. On a large generated synth bundle that is
  the dominant cost (tens of seconds a round in the browser); the compile
  worker's usual optimisation level applies.
- Section loudness assumes 4/4 and the song's `setBPM()`.
