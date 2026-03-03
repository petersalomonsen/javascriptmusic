# faust2as — Faust DSP to AssemblyScript Transpiler

Transpiles Faust `.dsp` physical model instruments into AssemblyScript `MidiVoice` classes that plug directly into the MidiSynth architecture.

## Quick Start

### Single-file mode

Generates one `.ts` file per DSP with the voice class, channel class, `initializeMidiSynth()` and `postprocess()`. The output can be pasted directly into the web app's AssemblyScript code editor.

```bash
node tools/faust2as/faust2as.js <input.dsp> [--name ClassName] [--out output.ts]
```

### Bundle mode

Combines multiple DSPs into a single file with all voice/channel classes, a shared `initializeMidiSynth()` that wires each DSP to a MIDI channel, and an empty `postprocess()`. Also suitable for pasting into the web app.

```bash
node tools/faust2as/faust2as.js --bundle <dsp1.dsp> [dsp2.dsp ...] [--out output.ts]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--name` | Class name for the generated voice (single-file only) | Derived from filename |
| `--out` | Output `.ts` file path | `wasmaudioworklet/synth1/assembly/midi/instruments/<name>.ts` |
| `--bundle` | Bundle multiple DSPs into one file | Off |

### Examples

```bash
# Single instrument (from repo root)
node tools/faust2as/faust2as.js resources/faust/examples/generator/dx7.dsp

# Single instrument with custom output
node tools/faust2as/faust2as.js resources/faust/examples/physicalModeling/clarinetMIDI.dsp \
  --out wasmaudioworklet/synth1/assembly/midi/instruments/clarinet.ts

# Bundle: DX7 + Clarinet on MIDI channels 0 and 1
node tools/faust2as/faust2as.js --bundle \
  resources/faust/examples/generator/dx7.dsp \
  resources/faust/examples/physicalModeling/clarinetMIDI.dsp \
  --out /tmp/faust_bundle.ts
```

## Prerequisites

- **Faust compiler** installed and on `PATH` (`faust --version` to verify)
- The `.dsp` file must be a MIDI instrument with `freq`, `gain`, and `gate` parameters

## What It Does

1. Runs `faust -lang c` on the input `.dsp` file
2. Parses the generated C code (struct fields, `instanceConstants`, `instanceClear`, `compute` body)
3. Emits an AssemblyScript `MidiVoice` subclass with `noteon()`, `noteoff()`, `isDone()`, and `nextframe()`
4. Generates `initializeMidiSynth()` and `postprocess()` exports (required by `midisynth.ts`)

The generated voice maps Faust's `freq`/`gain`/`gate` convention to MIDI note-on/note-off events, and writes stereo output into the channel's signal bus.

## Import Paths

Both single-file and bundle modes generate imports relative to the `mixes/` directory:

```typescript
import { notefreq, midichannels, MidiChannel, MidiVoice } from '../mixes/globalimports';
import { SAMPLERATE } from '../environment';
```

This is because the web app's AssemblyScript code editor compiles code from the `mixes/` directory context. The generated files can be pasted directly into the editor.

## MIDI CC Parameter Mapping

Tweakable UI parameters (everything except `freq`/`gain`/`gate`) are emitted as module-level global variables prefixed with the DSP name (e.g. `dx7_fHslider0`). These are mapped to MIDI CC numbers sequentially from CC 0, skipping reserved CCs (7=volume, 10=pan, 64=sustain, 91=reverb, 120-127=channel mode).

A `{Name}Channel extends MidiChannel` class is generated with a `controlchange()` override that routes CC values to the global variables. The `initializeMidiSynth()` function emits CC defaults for all mapped parameters.

## Effect Support

If the `.dsp` source contains a top-level `effect = ...` declaration, the transpiler automatically:

1. Compiles the effect separately using Faust's `-pn effect` flag
2. Generates a `{ClassName}Channel extends MidiChannel` subclass alongside the voice
3. The channel's `preprocess()` method applies the effect to the mixed voice output

This is the standard Faust convention for post-processing effects like reverb that should run once per channel, not per voice. The transpiler does not modify the DSP source — it only generates the effect class when the declaration already exists.

## Supported Faust Features

| Feature | Support |
|---------|---------|
| Basic arithmetic, math functions | Yes |
| Delay lines (`fRec`, `fVec`, `IOTA`) | Yes |
| Lookup tables (`ftbl`, `rdtable`) | Yes |
| `waveform` declarations | Yes |
| Multiple SIG fill functions | Yes |
| `nentry` / `hslider` / `button` UI elements | Yes |
| `effect = ...` declarations | Yes (generates MidiChannel subclass) |
| `ffunction` external headers (e.g. piano.h) | Yes (generates lookup tables) |
| `soundfile` primitives | No |

## Tested Instruments

| Instrument | DSP file | Notes |
|------------|----------|-------|
| DX7 | `generator/dx7.dsp` | FM synth, 138 params (124 CC-mapped) |
| Electric Guitar | `faust-stk/elecGuitarMIDI.dsp` | Plucked string |
| Guitar | `faust-stk/guitarMIDI.dsp` | Plucked string |
| Clarinet | `physicalModeling/clarinetMIDI.dsp` | 8 CC-mapped params |
| Piano | `physicalModeling/faust-stk/piano1.dsp` | External header lookup tables (~3000 lines) |
| Bowed String | `faust-stk/bowed.dsp` | Reverb baked into `process` |
| SimpleSynth FX | `bela/simpleSynth_FX.dsp` | Uses `effect = ...` (flanger + panner + reverb) |

## Troubleshooting

**Faust compilation fails**: Make sure the `.dsp` file compiles with `faust -lang c` on its own. The Faust standard libraries must be installed (typically at `/usr/local/share/faust/`).

**Generated code doesn't compile**: Run `npm run fastbuild` in the `wasmaudioworklet` directory to check for AssemblyScript errors. The most common issue is unsupported Faust features (like `soundfile`).

**No sound**: Verify the instrument uses `freq`/`gain`/`gate` parameters. The transpiler maps `gate` to note-on/note-off, `freq` to MIDI note frequency, and `gain` to velocity.
