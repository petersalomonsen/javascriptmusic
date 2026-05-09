# master_me Mastering Example

[master_me](https://github.com/trummerschlunk/master_me) is an automatic mastering chain (gate, EQ, leveler, multiband compressor, limiter, brickwall) written in Faust by Klaus Scheuermann. This example transpiles it to AssemblyScript via [faust2asc.js](../../tools/faust2as/faust2asc.js) and wires it into the synth's `postprocess()` so every sample written to `outputline` is run through the mastering chain.

## Files

| File | Description |
|---|---|
| `master_me-synth.ts` | Generated AssemblyScript bundle (loadable in the synth code editor) |
| `dsp/master_me.dsp` | Faust source — top-level mastering chain |
| `dsp/lib/ebur128.dsp` | ITU-R BS.1770-4 prefilter used by the LUFS meters |
| `dsp/expanders.lib` | Expander helpers used by the leveler |
| `LICENSE.master_me` | Upstream GPLv3 license from the master_me repo |

## How it works

The other examples (e.g. `examples/dx7`) generate `MidiVoice` subclasses — instruments that produce audio per-note. `master_me` is different: it has stereo input and stereo output and acts on the final mix, so the transpiler is invoked in `--mastering` mode.

The mastering pipeline runs once per sample frame from `postprocess()` in [midisynth.ts](../../wasmaudioworklet/synth1/assembly/midi/midisynth.ts). At that point the per-channel signals (voices, reverb) have already been summed into `outputline`. The generated `MasterMe.process()` reads `outputline.left`/`outputline.right`, runs them through the master_me chain, and writes the processed result back into `outputline` before the sample is stored.

```
voices → channels → mainline + reverbline → outputline → postprocess() → store
                                                            └── master_me.process()
```

`initializeMidiSynth()` is left empty — channels stay at the default sine `DefaultInstrument`, so any sequence will produce mastered audio out of the box. Add channel/voice setup there if you want a richer sound source.

## Regenerating the bundle

```sh
node tools/faust2as/faust2asc.js --mastering \
  --name MasterMe \
  --out examples/master_me/master_me-synth.ts \
  examples/master_me/dsp/master_me.dsp
```

The transpiler runs `faust -lang asc` via [`@psalomo/faustwasm`](https://www.npmjs.com/package/@psalomo/faustwasm) — a wasm-compiled libfaust with the AssemblyScript backend enabled — so no native Faust install is required. Run `npm install` in `tools/faust2as/` once. The transpiler parses the generated class and emits a standalone class plus `initializeMidiSynth()` / `postprocess()` exports.

## Parameters

master_me exposes ~80 mastering parameters (gate, EQ, leveler target, knee comp, multiband comp, limiter, brickwall ceiling). They are stored as private fields initialized to the defaults from the DSP and currently aren't exposed to MIDI CC — runtime control would mean adding setters or an NRPN-mapped channel; the defaults give a usable mastering chain as-is.

## Notes

- master_me's authors recommend `-double` precision; this example compiles at single precision (`f32`) like the rest of the synth, which is enough to demonstrate the chain but may affect the LUFS meter accuracy at extreme levels.
- The compiled WASM grows by roughly 100 KB with master_me wired in.
