# house-track — a 125 BPM track built entirely through the studio agent

Six Faust instruments, a custom `MidiChannel` with its own delay line, and a
minimal typographic visualiser. Nothing here was written by hand: every file is
what came out of one conversation with the studio agent, in one sitting.

| | |
| --- | --- |
| `song.js` | 125 BPM, 8 bars, six channels — kick, hi-hat, pad, bass, snare, flute lead |
| `synth.ts` | the combiner, plus `LeadEchoChannel`: a channel that routes its own signal through a shared delay line |
| `faust/` | one `.dsp` per instrument |
| `shaders/shader_housetrack.glsl` | the visualiser |

## Playing it

Load `song.js` into the song editor and `synth.ts` into the synth editor, with
the `.dsp` files in the project's `faust/` folder, then compile. The shader goes
in the shader editor.

## What is interesting in here

**`LeadEchoChannel` is the payoff.** The ask was "an echo on the flute"; a
per-voice effect gave every note its own delay line, which is not an echo. What
the channel does instead is `preprocess()` — the whole channel's mixed signal
through one delay — which is what a send effect actually is:

```ts
class LeadEchoChannel extends MidiChannel {
    delaySamples: i32 = <i32>(SAMPLERATE * 0.72);   // 1.5 beats at 125 BPM
    preprocess(): void { /* read the delay line, mix, write back */ }
}
```

**The pad plays sus4 into major.** Each chord opens on its suspended fourth and
resolves a beat later — `[d5,g5,a5]` then `[d5,f5,a5]` — which is where most of
the character comes from.

**The shader takes its energy from what this song actually plays**: kick and low
bass open a chromatic split on the letterforms, snare and hats set the width of
the rule, pad and lead breathe the glow. Check it without a GPU in front of you:

```sh
cd wasmaudioworklet
node ../tools/shadertest/render.mjs ../examples/house-track/shaders/shader_housetrack.glsl \
     --size 1080x1920 --text "give me a beat" --energy 0.8
```

## The conversation that produced it

Kept whole, with every tool call, in
[tools/studio-agent/reference-sessions/2026-08-29-house-track](../../tools/studio-agent/reference-sessions/2026-08-29-house-track/)
— fourteen asks, and the record of what a model has to get right to build this.
