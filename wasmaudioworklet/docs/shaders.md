# Developing & testing visualizer shaders

The visualizer renders a full-screen **fragment shader** (WebGL1 / GLSL ES 1.00)
behind the music. Shaders live in a song project's `shaders/` folder and are
selected per song in `wasmmusic.config.json` (`fragmentshader`, plus the
`availableShaders` picker list). This guide is the contract every shader must
follow and the headless feedback loop for building one without a GPU in front of
you — useful for humans and essential for agents (which can't see the canvas).

For images/video, text overlays and frame-by-frame animation that a shader
samples, see [animations.md](animations.md). This doc is about the shader itself.

## Uniform contract

The renderer binds these uniforms. Declare the ones you use; unused ones can be
omitted (but keep `uSampler`/`uSamplerPrev`/`uMix` referenced if you sample
images — see animations.md):

```glsl
precision highp float;
uniform vec2  resolution;              // framebuffer size in pixels
uniform float time;                    // seconds since the shader started (~song time)
uniform float targetNoteStates[128];   // per MIDI note 0..127, value in -1..1
                                       //   -1 == "no note". A sounding note maps from
                                       //   velocity: value ≈ velocity/127*2 - 1.
uniform float smoothedNoteStates[128]; // JS-smoothed view of the above: FAST attack
                                       //   (snaps up on note-on), SLOW release.
uniform sampler2D uSampler;            // active image/video frame (image shaders)
uniform sampler2D uSamplerPrev;        // previous frame (crossfade pair)
uniform float uMix;                    // 0..1 crossfade; pinned to 1 outside transitions
```

Common idioms:

```glsl
// aspect-correct, centered coords, y up:
vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;

// aggregate note energy 0..1 (only sounding notes contribute, since -1 -> 0):
float e = 0.0;
for (int i = 0; i < 128; i++) e += max(0.0, smoothedNoteStates[i] * 0.5 + 0.5);
e = clamp(e / 24.0, 0.0, 1.0);
```

- Use `smoothedNoteStates` for eased/visual reactions; use the raw
  `targetNoteStates` for sharp note-on gates (it falls back to -1 quickly).
- Split the 0..127 range into bass/mid/treble bands if you want frequency-ish
  reactions (low indices ≈ bass).
- Note: the smoothing **attack is instant** (it snaps on note-on). There is no
  per-clip / tempo clock uniform — if you need tempo-locked motion, derive it
  from `time` (e.g. `beat = time * BPM/60`).

## The test harness

[`tools/shadertest/render.mjs`](../../tools/shadertest/render.mjs) compiles a
shader in headless WebGL and renders PNG frames with the uniforms above. It uses
Playwright (a dev-dependency of this package), so run it from `wasmaudioworklet`:

```sh
cd wasmaudioworklet
npm install                                   # once, to get Playwright

# compile-check only (fast; non-zero exit on failure → good for pre-commit/CI):
node ../tools/shadertest/render.mjs path/to/shader.glsl --compile-only

# render a frame at a given time and fake "music energy":
node ../tools/shadertest/render.mjs path/to/shader.glsl --time 6 --energy 0.7

# render several frames (e.g. across a beat or a camera move):
node ../tools/shadertest/render.mjs path/to/shader.glsl --frames 3,18,30 --energy 0.8
```

Options: `--time <s>`, `--frames <t1,t2,..>`, `--energy <0..1>` (fills a band of
note states so reactive shaders light up), `--size <WxH>`, `--out <file.png>`,
`--outdir <dir>`, `--compile-only`. On a compile error it prints the GLSL info
log and exits non-zero. Each rendered frame prints a `lit=NN%` metric (fraction
of non-black pixels) — a quick "did anything draw" sanity check.

The loop that works well:

1. **Compile-check** after every edit — catches the dumb GLSL errors instantly.
2. **Render** a few frames at representative times / energies and look at the
   PNGs (open them, or an agent reads them back).
3. For objective checks, extend the harness to `readPixels` and **measure** —
   e.g. count bright pixels in a region to confirm a reaction scales with
   `--energy`, or compare a calm vs loud frame — rather than only eyeballing.

## Adding a shader to a song

1. Put `shader_<name>.glsl` in the song project's `shaders/` folder.
2. Implement the uniform contract above.
3. In `wasmmusic.config.json`: set the song's `fragmentshader` to
   `shaders/shader_<name>.glsl`, and add an entry to `availableShaders` so it
   shows in the picker.
4. Verify with the harness before loading it in the app.
