# faust2as — Faust DSP to AssemblyScript Transpiler

Transpiles Faust `.dsp` physical model instruments into AssemblyScript `MidiVoice` classes that plug directly into the MidiSynth architecture.

## Quick Start

```bash
cd wasmaudioworklet
node faust/faust2as.js <input.dsp> [--name ClassName] [--out output.ts]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--name` | Class name for the generated voice | Derived from filename |
| `--out` | Output `.ts` file path | `synth1/assembly/midi/instruments/<name>.ts` |

### Example

```bash
node faust/faust2as.js ../resources/faust/examples/physicalModeling/faust-stk/bowed.dsp \
  --name Bowed --out /tmp/bowed.ts
```

## Prerequisites

- **Faust compiler** installed and on `PATH` (`faust --version` to verify)
- The `.dsp` file must be a MIDI instrument with `freq`, `gain`, and `gate` parameters

## What It Does

1. Runs `faust -lang c` on the input `.dsp` file
2. Parses the generated C code (struct fields, `instanceConstants`, `instanceClear`, `compute` body)
3. Emits an AssemblyScript `MidiVoice` subclass with `noteon()`, `noteoff()`, `isDone()`, and `nextframe()`

The generated voice maps Faust's `freq`/`gain`/`gate` convention to MIDI note-on/note-off events, and writes stereo output into the channel's signal bus.

## Effect Support

If the `.dsp` source contains a top-level `effect = ...` declaration, the transpiler automatically:

1. Compiles the effect separately using Faust's `-pn effect` flag
2. Generates a `{ClassName}Channel extends MidiChannel` subclass alongside the voice
3. The channel's `preprocess()` method applies the effect to the mixed voice output

This is the standard Faust convention for post-processing effects like reverb that should run once per channel, not per voice. The transpiler does not modify the DSP source — it only generates the effect class when the declaration already exists. For an example of a DSP with this pattern, see `examples/bela/simpleSynth_FX.dsp` which separates `process = synth` from `effect = ... flanger : panno : reverb`.

## Using the Generated Code

```typescript
import { Bowed } from '../midi/instruments/bowed';

midichannels[0] = new MidiChannel(6, (channel: MidiChannel) => new Bowed(channel));
```

The first argument (`6`) is the polyphony — the number of simultaneous voices.

If the DSP has an `effect = ...` declaration, the transpiler also generates a `{ClassName}Channel extends MidiChannel` subclass. Use it in place of `MidiChannel` to apply the effect:

```typescript
import { Bowed, BowedChannel } from '../midi/instruments/bowed';

midichannels[0] = new BowedChannel(6, (channel: MidiChannel) => new Bowed(channel));
```

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
| `soundfile` primitives | No |

## Tested Instruments

The following Faust-STK instruments from `resources/faust/examples/physicalModeling/faust-stk/` have been transpiled and verified:

| Instrument | DSP file | Notes |
|------------|----------|-------|
| Electric Guitar | `elecGuitarMIDI.dsp` | Plucked string |
| Guitar | `guitarMIDI.dsp` | Plucked string |
| Clarinet | `clarinet.dsp` | Reverb baked into `process` |
| Piano | `piano1.dsp` | Reverb baked into `process` (large output ~3000 lines) |
| Bowed String | `bowed.dsp` | Reverb baked into `process` |
| SimpleSynth FX | `simpleSynth_FX.dsp` | Uses `effect = ...` (flanger + panner + reverb) |

## Troubleshooting

**Faust compilation fails**: Make sure the `.dsp` file compiles with `faust -lang c` on its own. The Faust standard libraries must be installed (typically at `/usr/local/share/faust/`).

**Generated code doesn't compile**: Run `npm run fastbuild` in the `wasmaudioworklet` directory to check for AssemblyScript errors. The most common issue is unsupported Faust features (like `soundfile`).

**No sound**: Verify the instrument uses `freq`/`gain`/`gate` parameters. The transpiler maps `gate` to note-on/note-off, `freq` to MIDI note frequency, and `gain` to velocity.
