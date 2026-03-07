# DX7 FM Synthesizer Example

Yamaha DX7 synthesizer running as a transpiled AssemblyScript instrument via the [faust2as](../../wasmaudioworklet/faust/faust2as.md) transpiler.

## Files

| File | Description |
|---|---|
| `dx7-synth.ts` | Generated multi-algorithm synth bundle (paste into the synth editor) |
| `dx7-sequence.js` | Example sequence with E.Piano, Bass, Strings, Bells, and Drum Kit patches |
| `dsp/` | Faust DSP source files for each algorithm variant |
| `parse-rom.js` | Utility to convert DX7 SysEx ROM files to NRPN patch data |

## How it works

The DX7 Faust implementation uses 6 FM operators with configurable routing (algorithms). Since the algorithm topology is compiled into the DSP, each algorithm variant is a separate Faust source file:

- `dx7_alg2.dsp` — Algorithm 2 (Strings)
- `dx7_alg5.dsp` — Algorithm 5 (E.Piano)
- `dx7_alg5_bells.dsp` — Algorithm 5 (Tubular Bells, separate globals)
- `dx7_alg5_hat.dsp` — Algorithm 5 (JunkHat, separate globals)
- `dx7_alg16.dsp` — Algorithm 16 (Bass)
- `dx7_alg17.dsp` — Algorithm 17 (Beefkick)
- `dx7_alg21.dsp` — Algorithm 21 (MildSnare)

The `faust2as` transpiler compiles these into a single bundle with independent voice classes and NRPN parameter control (138 parameters per algorithm, addressed via MIDI CC 99/98/6).

## Regenerating the synth bundle

```sh
cd wasmaudioworklet
node faust/faust2as.js --bundle \
  ../examples/dx7/dsp/dx7_alg5.dsp \
  ../examples/dx7/dsp/dx7_alg16.dsp \
  ../examples/dx7/dsp/dx7_alg2.dsp \
  ../examples/dx7/dsp/dx7_alg5_bells.dsp \
  ../examples/dx7/dsp/dx7_alg17.dsp \
  ../examples/dx7/dsp/dx7_alg21.dsp \
  ../examples/dx7/dsp/dx7_alg5_hat.dsp \
  --out ../examples/dx7/dx7-synth.ts
```

## Adding patches from DX7 ROM files

The `parse-rom.js` utility converts standard DX7 SysEx bulk dump files (`.syx`, 4104 bytes, 32 voices) into the NRPN format used by `dx7-sequence.js`.

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
