# Text overlay — text on screen, driven from the sequencer

A song that shows text in time with the music and picks **how** each line
appears. The app renders text on a dedicated shader layer; the sequence decides
the content, the moment and the style.

## Files

| File | Description |
|---|---|
| `song.js` | The sequence. `showText(...)` per line, `setVisual('textScale', ...)` for a ramped zoom, a slow pad on channel 0. |
| `shaders/shader_textoverlay.glsl` | Music-reactive backdrop plus four text transitions (fade, wipe, rise, dissolve) selected by the `textTransition` uniform. |

There's no `synth.ts` here — the chords play on channel 0 of whatever synth the
project already has. Drop `song.js` and the shader into any song project (set
`fragmentshader` in `wasmmusic.config.json` to the shader).

## How it fits together

```
song.js                         app                          shader
────────────────────────────────────────────────────────────────────────
showText('Refrenget',    →   text image scheduled    →   uText / uTextPrev
        { transition: 1,     at that song time;          uTextMix 0→1 over `fade`
          fade: 1.2 })       transition rides on     →   textTransition
                             the setVisual channel
setVisual('textScale',   →   named float, ramped     →   textScale
          1.6, 2.0)          over 2 seconds
```

The song never touches GLSL and the shader never knows what the text says —
they meet at `uText` (what) and the named params (how). Adding a fifth
transition is a shader edit plus a number in the song.

## Render it headlessly

From `wasmaudioworklet` (see [shaders.md](../../wasmaudioworklet/docs/shaders.md)):

```sh
# compile-check
node ../tools/shadertest/render.mjs ../examples/textoverlay/shaders/shader_textoverlay.glsl --compile-only

# a finished line
node ../tools/shadertest/render.mjs ../examples/textoverlay/shaders/shader_textoverlay.glsl \
  --text "Første vers\nandre linje" --textmix 1 --visual textTransition=0 --visual textScale=1

# mid-transition between two lines — try textTransition 0..3
node ../tools/shadertest/render.mjs ../examples/textoverlay/shaders/shader_textoverlay.glsl \
  --text "Refrenget" --textprev "Første vers" --textmix 0.45 \
  --visual textTransition=1 --visual textScale=1
```

## Transitions in this shader

| `transition` | Effect |
|---|---|
| `0` | Crossfade — both lines overlap; the classic dissolve-in |
| `1` | Wipe left→right; the new line owns everything left of the edge |
| `2` | Rise into place — new text comes up from below, old text leaves upward |
| `3` | Pixel dissolve, sequential: the old line breaks up over the first half of the fade, the new one forms over the second |

`textScale` scales the text image around the centre (1.0 = fitted to the
viewport height). Both names are this example's own convention — `setVisual`
puts any name you like into the shader.

## Notes

- The text image is 1280×720 and letterboxed to fit, so lines keep their
  proportions on any window shape.
- Text is rendered as SVG inside the song sandbox — no DOM needed, and
  non-ASCII (æøå) works.
- Keep the visual track shorter than the music: pending steps on a concurrent
  track are dropped when the main sequence returns.
