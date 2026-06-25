# Beach Drive — a driving game built as a *song*

A Sega OutRun–style pseudo-3D coastal road (Côte d'Azur at golden hour),
rendered in a single full-screen fragment shader. It started as a music-reactive
visualizer and is now a **MIDI-controllable driving game** — and the whole game
lives in the **song** (its `synth.ts` + shader). The app stays game-agnostic.

## Files

This is the complete, playable song (a snapshot of the live concert version):

| File | Description |
|---|---|
| `song.js` | The sequence (the music). Registers the silent `drive` instrument that owns the game channel. Obstacles would be placed here via `controlchange` on the `drive` track — none currently. |
| `synth.ts` | The synth + **the whole game** — the `// Beach-drive game logic` block near the top (control voice, state, `gameTick()`) is wired into `initializeMidiSynth()` and `postprocess()`. |
| `shaders/shader_beachdrive.glsl` | The scene shader. Pseudo-3D road, sea, palms, sun; reads game state from `synthState[]`. |

> `synth.ts` imports a Faust-generated master effect (`../faust/dsp/master_me`)
> from the song repo, so it compiles in the app (which injects the faust
> sources), not standalone. The game logic itself has no such dependency.

Compile-check / render the shader headlessly (see
[shaders.md](../../wasmaudioworklet/docs/shaders.md)):

```sh
cd wasmaudioworklet
node ../tools/shadertest/render.mjs ../examples/beachdrive/shaders/shader_beachdrive.glsl --compile-only
```

## Design: the game is the song, not the app

The pivotal constraints, and how they're resolved:

- **A fragment shader is stateless** — a pure function of its uniforms, nothing
  persists between frames. So it can *render* a game but not hold one. Game state
  (speed, position, score) must live elsewhere and be fed in as a uniform.
- **That elsewhere is the synth (wasm), not JS.** A song's `synth.ts` is
  AssemblyScript compiled into the same wasm as the engine, and the engine calls
  its `postprocess()` **once per sample on every audio block — even while the
  sequencer is paused**. That's the game tick; integrate state there and you can
  drive with the music stopped.

The app exposes exactly **one** generic capability for this (everything else is
song-side): a synth → shader float channel.

> The engine has a fixed `f32[]` buffer, `synthState`, exposed via
> `getSynthStateSnapshot()`. The worklet relays it verbatim to the shader's
> `uniform float synthState[N]`. The app assigns **no meaning** to the slots —
> the song's `synth.ts` writes them and the song's shader reads them.

A WebGL uniform can only be written from JS, so *some* JS relay is unavoidable —
but it's game-agnostic (just "ferry a float array to a uniform"). Live input is
already generic too (MIDI notes/CCs flow into the synth via the existing input).

### What lives where

| Concern | Where |
|---|---|
| Car state + integration (speed/distance/steer) | song `synth.ts` → `postprocess()` |
| Control input | song: silent voices on a game MIDI channel capture the control notes |
| Obstacle placement | song: `controlchange` in `song.js`; synth reads `midichannels[ch].controllerValues` |
| State → shader | **app (generic)**: `synthState` buffer → `uniform float synthState[]` |
| Rendering / semantics | song shader: reads `synthState[]` |

Nothing in the engine or app mentions cars, throttle, or obstacles.

## How beachdrive uses it

- **Game I/O channel: 7.** It's a normal instrument named `drive` —
  `addInstrument('drive')` is the 8th instrument, and channels are assigned by
  `addInstrument` order, so `drive` → channel 7. `synth.ts`'s `GAME_CHANNEL`
  **must match that index** (7). Control NOTES (velocity = how hard), played
  live: `c3`(36)=throttle, `d3`(38)=brake, `c4`(48)=steer-left,
  `d4`(50)=steer-right. A silent `CarControlVoice` turns held notes into gates
  (they make no sound).
- **Obstacles**: CCs on the game channel — `20`=roadblock, `21`=oncoming car,
  `22`=animal; value `1..127` = lane, `0` = absent. The synth reads them in
  `gameTick()` and the shader renders them. *This song doesn't place any yet*
  (the mechanism is wired end-to-end; add `controlchange(20, …)` etc. on the
  `drive` track to spawn them).
- **`gameTick()` in `postprocess()`** integrates throttle/brake → `carSpeed` →
  `carDistance`, steer → `carX` (eases back to centre), advances a free-running
  `gameTime`, and writes the generic buffer (layout shared with the shader):

  | slot | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
  |---|---|---|---|---|---|---|---|
  | meaning | carDistance | carSpeed | carX | gameTime | roadblock lane | car lane | animal lane |

- **Shader** drives the forward scroll from `carDistance` (obstacles ride it, so
  they freeze when you stop), steers with `carX`, shows a speed-line rush from
  `carSpeed`, and animates ambient (waves/palms/sun) from `gameTime` so the scene
  stays alive at a standstill. With no relay (plain-visualizer use) it falls back
  to the song `time` and note-derived controls.

State is full-precision **f32** read straight from wasm memory — never carried
over MIDI/NRPN, so there's no quantization of the accumulating position.

## Playing it

1. **Start audio.**
2. In the instrument selector, choose **drive** — that routes your keyboard /
   MIDI input to the game channel (the app routes live input to the selected
   instrument's channel).
3. Play `c3`/`d3`/`c4`/`d4` = throttle/brake/steer-left/steer-right (velocity =
   how hard). Forward (`c3`) accelerates the car and scrolls the road.

You can **pause** (uncheck play) and keep driving — the synth keeps ticking. Just
don't **Stop**, which tears down the audio engine (then the relay stops and the
shader falls back to the frozen music clock).

## Status / next steps

- [x] Music-reactive shader (the visualizer it grew from).
- [x] Generic app primitive: `synthState` buffer → `uniform float synthState[]` (tested).
- [x] Game logic moved into the song: `synth.ts` holds state, integrates in `postprocess()`, writes `synthState`.
- [x] Control via live MIDI notes on the game channel (select the `drive` instrument).
- [x] Drive with the music paused; shader renders the car (and obstacles when the sequence places them).
- [ ] Collision detection + score/lives — in the song's `gameTick()` (compare carX/carDistance vs obstacle lanes, expose a hit in `synthState`).
- [ ] Standalone game player: load only the `.wasm`.
