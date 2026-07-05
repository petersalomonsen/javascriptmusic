# DX7 FM Synthesizer Example

Yamaha DX7 synthesizer running as a transpiled AssemblyScript instrument via the [faust2as](../../wasmaudioworklet/faust/faust2as.md) transpiler.

## Files

| File | Description |
|---|---|
| `dx7-synth.ts` | Generated synth bundle using C backend transpiler |
| `dx7-synth-asc-backend.ts` | Generated synth bundle using ASC backend transpiler |
| `dx7-sequence.js` | Example sequence with E.Piano, Bass, Strings, Bells, and Drum Kit patches |
| `dx7-drumbeat.js` | Minimal, self-contained drums-only beat — embeds the channel-4 kick/snare/hat NRPN patch block, then a `steps()` groove. Load it alongside `dx7-synth.ts` and edit `setBPM`/the `steps()` pattern to make a beat. (Reminder: the patches MUST stay in the song — `initializeMidiSynth()` only zeroes defaults, which sound like a sine.) |
| `dsp/` | Faust DSP source files for each algorithm variant |
| `parse-rom.js` | Utility to convert DX7 SysEx ROM (`.syx`) files to NRPN patch data |
| `sequence-to-patches.js` | Utility to convert an NRPN sequence into typed-field assignments for the modular per-algorithm `.ts` files (see "Porting a ROM patch into a modular channel" below) |

## How it works

The DX7 Faust implementation uses 6 FM operators with configurable routing (algorithms). Since the algorithm topology is compiled into the DSP, each algorithm variant is a separate Faust source file:

- `dx7_alg2.dsp` — Algorithm 2 (Strings)
- `dx7_alg5.dsp` — Algorithm 5 (E.Piano)
- `dx7_alg5_bells.dsp` — Algorithm 5 (Tubular Bells, separate globals)
- `dx7_alg5_hat.dsp` — Algorithm 5 (JunkHat, separate globals)
- `dx7_alg16.dsp` — Algorithm 16 (Bass)
- `dx7_alg17.dsp` — Algorithm 17 (Beefkick)
- `dx7_alg18.dsp` — Algorithm 18 (Syn-Lead)
- `dx7_alg21.dsp` — Algorithm 21 (MildSnare)

The `faust2as` transpiler compiles these into a single bundle with independent voice classes and NRPN parameter control (144 parameters per algorithm, addressed via MIDI CC 99/98/6).

## Regenerating the synth bundle

**C backend** (`faust2as.js` — uses `faust -lang c`):

```sh
node tools/faust2as/faust2as.js --bundle \
  examples/dx7/dsp/dx7_alg5.dsp \
  examples/dx7/dsp/dx7_alg16.dsp \
  examples/dx7/dsp/dx7_alg2.dsp \
  examples/dx7/dsp/dx7_alg5_bells.dsp \
  examples/dx7/dsp/dx7_alg17.dsp \
  examples/dx7/dsp/dx7_alg21.dsp \
  examples/dx7/dsp/dx7_alg5_hat.dsp \
  --out examples/dx7/dx7-synth.ts
```

**ASC backend** (`faust2asc.js` — uses `faust -lang asc` via [`@psalomo/faustwasm`](https://www.npmjs.com/package/@psalomo/faustwasm); `npm install` once in `tools/faust2as/`):

```sh
node tools/faust2as/faust2asc.js --bundle \
  examples/dx7/dsp/dx7_alg5.dsp \
  examples/dx7/dsp/dx7_alg16.dsp \
  examples/dx7/dsp/dx7_alg2.dsp \
  examples/dx7/dsp/dx7_alg5_bells.dsp \
  examples/dx7/dsp/dx7_alg17.dsp \
  examples/dx7/dsp/dx7_alg21.dsp \
  examples/dx7/dsp/dx7_alg5_hat.dsp \
  --out examples/dx7/dx7-synth-asc-backend.ts
```

### Adding the drum kit

After regenerating, the last three DSPs (alg17, alg21, alg5\_hat) are placed on separate MIDI channels. To combine them into a single drum kit channel, manually add the `Dx7DrumKitChannel` class and replace the three separate channel initializations with a single channel 4. See `dx7-synth.ts` for the reference implementation — the drum kit code is identical for both backends.

## Adding patches from DX7 ROM files

The `parse-rom.js` utility converts standard DX7 SysEx bulk dump files (`.syx`, 4104 bytes, 32 voices) into the NRPN format used by `dx7-sequence.js`.

Factory ROM cartridges (`ROM1A.syx` … `ROM4B.syx`) are freely distributed — e.g. [WouterVanNifterick/DX7](https://github.com/WouterVanNifterick/DX7) (`ROM1A.SYX`). Download one to follow these examples; the binary isn't committed here.

```sh
# List all 32 patches in a ROM file
node parse-rom.js ROM1A.syx

# Output patch #15 (BASS 1) as NRPN for channel 1
node parse-rom.js ROM1A.syx 15 --channel 1

# Search by name
node parse-rom.js ROM1A.syx "strings"
```

The output tells you which algorithm DSP file the patch requires. If you need an algorithm not already compiled, create a new DSP file:

```
import("stdfaust.lib");
process = dx.algorithm(N) <: _,_;
```

Then add it to the bundle compilation command and regenerate.

## Porting a ROM patch into a modular channel

The bundle workflow above sets patches via `nrpn(beat, idx, value)` calls inside the song. The **modular** layout used by the live app (one `.ts` per algorithm under `faust/dx7/`, transpiled with `faust2asc.js --for-editor`) instead keeps the song purely musical and sets each patch as **typed-field assignments** in `synth.ts` — e.g. `lead.feedback = <f32>7.0;`. The field value is the NRPN value scaled to the parameter's native range (`min + value/127 * (max-min)`); assigning a raw 0–127 to a 0–7 field would crash the DSP on the first note.

`sequence-to-patches.js` automates that scaling. It reads an NRPN sequence and the transpiled `.ts` files, then emits ready-to-paste field assignments.

**Worked example — porting SYN-LEAD 1 (ROM1A #14, Algorithm 18) onto channel 5:**

```sh
# 1. Algorithm 18 isn't compiled by default — transpile it once.
#    (writes the .ts next to the other faust/dx7/*.ts in your song repo)
echo 'import("stdfaust.lib");
process = dx.algorithm(18) <: _,_;' > dsp/dx7_alg18.dsp
node ../../tools/faust2as/faust2asc.js dsp/dx7_alg18.dsp \
  --name Dx7Alg18 --for-editor --out /path/to/repo/faust/dx7/dx7_alg18.ts

# 2. Dump the ROM patch as an NRPN sequence on channel 5.
node parse-rom.js ROM1A.syx 14 --channel 5 > synlead.seq.js

# 3. Convert that sequence to typed-field assignments for the modular .ts.
node sequence-to-patches.js \
  --src synlead.seq.js \
  --faust /path/to/repo/faust/dx7 \
  --map '5:lead:dx7_alg18:Dx7Alg18' \
  --drum ''
```

Step 3 prints a `const lead = new Dx7Alg18Channel(...)` block plus 144 `lead.<field> = <f32>...;` lines. Paste it into `initializeMidiSynth()` in `synth.ts`, add a matching `addInstrument('...')` in `song.js` (instrument order = channel index), and the patch is live.

> `--for-editor` emits depth-1 imports (`../mixes/...`); files placed in `faust/dx7/` need depth-2 (`../../mixes/...`). `sequence-to-patches.js` reads the channel class regardless, but fix the import depth in the generated `.ts` before compiling.

## Channel layout

| Channel | Voice Class(es) | Patch | Algorithm |
|---|---|---|---|
| 0 | `Dx7_alg5` | E.Piano 1 | 5 |
| 1 | `Dx7_alg16` | Bass 1 | 16 |
| 2 | `Dx7_alg2` | Strings 1 | 2 |
| 3 | `Dx7_alg5_bells` | Tubular Bells | 5 |
| 4 | `Dx7_alg17` / `Dx7_alg21` / `Dx7_alg5_hat` | Drum Kit | 17, 21, 5 |

Channel 4 is a drum kit with three DX7 voices mapped to standard GM drum notes (all operators use fixed-frequency mode):

| Note | MIDI | Drum | Source |
|---|---|---|---|
| `c3` | 36 | Kick (Beefkick) | Coffeeshopped DX7 Drums, Algorithm 17 |
| `d3` | 38 | Snare (MildSnare) | Coffeeshopped DX7 Drums, Algorithm 21 |
| `fs3` | 42 | Hi-hat (JunkHat) | Coffeeshopped DX7 Drums, Algorithm 5 |

Each channel has its own set of global parameters, so patches on different channels are fully independent. The drum kit uses NRPN ranges: kick 0-143, snare 144-287, hat 288-431.

## NRPN parameter map

All 144 parameters per algorithm are addressed via NRPN (Non-Registered Parameter Number):

```js
// Send NRPN: CC 99 = MSB, CC 98 = LSB, CC 6 = value
function nrpn(beat, param, value) {
    return [
      beat, controlchange(99, (param >> 7) & 127),
      beat, controlchange(98, param & 127),
      beat, controlchange(6, value),
    ];
}
```

| NRPN | Parameter | Range |
|---|---|---|
| 0 | Feedback | 0–7 |
| 1 | Transpose | -24–+24 semitones |
| 2 | Osc Key Sync | 0–1 |
| 3–6 | Pitch EG Level 1–4 | 0–99 |
| 7–10 | Pitch EG Rate 1–4 | 0–99 |
| 11 | LFO Waveform | 0–5 |
| 12–13 | LFO Speed, Delay | 0–99 |
| 14–15 | Pitch/Amp Mod Depth | 0–99 |
| 16 | LFO Sync | 0–1 |
| 17 | Pitch Mod Sensitivity | 0–7 |
| 18–37 | Operator 1 | (see below) |
| 38–57 | Operator 2 | |
| 58–77 | Operator 3 | |
| 78–97 | Operator 4 | |
| 98–117 | Operator 5 | |
| 118–137 | Operator 6 | |
| 138–143 | Freq Mode Op 1–6 | 0–1 (0=ratio, 1=fixed) |

**Per operator** (20 parameters, offset from operator base):

| +Offset | Parameter | Range |
|---|---|---|
| +0 | Detune | -7–+7 |
| +1 | Freq Coarse | 0–31 |
| +2 | Freq Fine | 0–99 |
| +3–6 | EG Level 1–4 | 0–99 |
| +7–10 | EG Rate 1–4 | 0–99 |
| +11 | Output Level | 0–99 |
| +12 | Key Velocity Sensitivity | 0–7 |
| +13 | Amp Mod Sensitivity | 0–3 |
| +14 | Rate Scaling | 0–7 |
| +15 | KLS Breakpoint | 0–99 |
| +16–17 | KLS Left/Right Depth | 0–99 |
| +18–19 | KLS Left/Right Curve | 0–3 |
