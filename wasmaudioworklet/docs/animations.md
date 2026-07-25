# Animating images & text in a song

The visualizer can show images in time with the music. An **animation** is just
a sequence of image frames flipped fast enough to read as motion. This doc
explains the mechanism and gives copy-paste recipes.

## How it works

Three pieces cooperate:

1. **`addImage(name, url)`** (song API) registers an image under a name. URLs
   resolve against the song repo, e.g. `'images/frame0.jpg'` (sync the files to
   OPFS via the claude-bridge — they're gitignored).
2. **`startVideo(name)`** (song API) schedules that image to become the active
   frame *at the current song time*. (Images and video share the same
   schedule; `startVideo` is the "show this now" call for both.)
3. **The renderer** ([visualizer/videoscheduler.js](../visualizer/videoscheduler.js))
   picks the active frame for the current time and uploads it to the `uSampler`
   texture each render tick; the fragment shader samples `uSampler`.

Key detail: the schedule is sorted so the **latest `startTime` ≤ now wins**. So
you do **not** need to set a stop time — each `startVideo` simply supersedes the
previous frame. Rapid successive calls = animation.

Before the first `startVideo` — and in a song with no images at all — `uSampler`
and `uSamplerPrev` hold a fully **transparent** pixel, so a shader that
composites the image layer by its alpha (`mix(col, card.rgb, card.a)`) just
shows its own output.

## Frame rate

`startVideo` stamps the *current song time*, so frame spacing is driven by the
sequencer grid. The easiest driver is a `steps()` track:

```js
createTrack(15).steps(8, frameCalls);   // 8 frames per beat
```

At a given BPM, `stepsperbeat` sets the rate:

| stepsperbeat | at 92 BPM |
| --- | --- |
| 4  | ~6 fps  |
| 8  | ~12 fps |
| 16 | ~24 fps |

Use a spare channel (e.g. 15) for the animation track so it runs concurrently
with the music, and don't `await` it if you want the music to proceed.

## Crossfade vs. snap

The default image renderer crossfades between successive images over ~1.5s
([TRANSITION_DURATION_SECONDS](../visualizer/fragmentshader.js)). That's nice for
slow slideshow-style image changes, but it **smears fast animation into mush**.

For frame-by-frame animation, make the shader *snap* to the current frame by
ignoring the crossfade in its image sampler:

```glsl
uniform sampler2D uSampler;
uniform sampler2D uSamplerPrev;   // keep declared — renderer binds it
uniform float uMix;               // keep declared

vec3 sampleImage(vec2 uv) {
  vec3 cur = texture2D(uSampler, uv).rgb;
  vec3 prv = texture2D(uSamplerPrev, uv).rgb;
  return mix(cur, prv, 0.0 * uMix);   // snap: always show current frame
}
```

Keep `uSamplerPrev`/`uMix` referenced (weighted to zero) so the GLSL compiler
doesn't optimise the uniforms away — the renderer always binds them.

## Recipe: a looping flip-book

```js
// Register frames 0..N-1
const FRAMES = 9;
for (let i = 0; i < FRAMES; i++) addImage('walk' + i, 'images/walk' + i + '.jpg');

// Play `frames` of `name` over `beats`, looping, on a concurrent visual track.
const animate = (name, frames, beats, stepsperbeat = 8) => {
  const totalSteps = Math.round(beats * stepsperbeat);
  const steps = [];
  for (let s = 0; s < totalSteps; s++) {
    const f = s % frames;
    steps.push(() => startVideo(name + f));
  }
  createTrack(15).steps(stepsperbeat, steps);   // channel 15 = visuals only
};

// ...later, in a section:
animate('walk', FRAMES, 8);   // walk cycle for 8 beats, ~12 fps
```

## Letterboxing (square / portrait source images)

If your frames aren't 16:9, letterbox them in the shader so they aren't
stretched. Compute a margin from the source aspect ratio and the viewport, and
output black outside it:

```glsl
float yvsxratio = SRC_W / SRC_H;                 // e.g. 1152.0/1280.0
float width  = resolution.y / yvsxratio;
float margin = ((resolution.x - width) * 0.5) / resolution.x;
float x = gl_FragCoord.x / resolution.x;
if (x >= margin && x < (1.0 - margin)) {
  float offset = -margin * (resolution.x / width);
  vec2 ratio = vec2(width, resolution.y);
  vec3 col = texture2D(uSampler, (gl_FragCoord.xy / ratio) * vec2(1.0, -1.0) + vec2(offset, 1.0)).rgb;
  gl_FragColor = vec4(col, 1.0);
} else {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);   // letterbox bars
}
```

## Text overlays

`showText(text, options)` puts text on screen at the current song time. It
renders the text to an SVG image internally — pure string work, so it runs
inside the song sandbox (there is **no** `document` or canvas at song-compile
time).

```js
showText('My Song', { transition: 0, fade: 1.5 });
// ...later
showText(['Second verse', 'starts here'], { size: 72, transition: 1 });
// ...and away
hideText({ fade: 2 });
```

Text goes on its **own layer** — `uText` / `uTextPrev` / `uTextMix` — not the
image layer, so it composites over an image slideshow, a video or a purely
generative shader. **The shader must declare and composite those uniforms** or
the text never appears (the app warns at compile time if it doesn't).
`uTextMix` runs 0 → 1 over `fade` seconds; the shader decides what to do with it:

```glsl
uniform sampler2D uText;
uniform sampler2D uTextPrev;
uniform float uTextMix;
uniform float textTransition;   // showText's `transition` option (via setVisual)

vec2 tuv = vec2(uv.x, 1.0 - uv.y);          // texture rows upload top-first
vec4 t = mix(texture2D(uTextPrev, tuv), texture2D(uText, tuv), uTextMix);
col = mix(col, t.rgb, t.a);
```

Style options: `size`, `color`, `font`, `weight`, `align`, `x`, `y`,
`lineHeight`, `background`, `stroke`, `strokeWidth`, `width`, `height` — see
[song-api.md](song-api.md#shader-text--parameter-functions).

`examples/textoverlay` is a complete song + shader pair showing fade, wipe,
rise and dissolve transitions selected from the sequence.

## Anything else the song wants to control

`setVisual(name, value, rampSeconds)` schedules any named float the shader
declares as `uniform float <name>` — the transition style above, a zoom, a
scene index, a colour. Values step by default, or ramp over `rampSeconds`:

```js
setVisual('bloom', 0.0);
// ...at the drop
setVisual('bloom', 1.0, 2);   // ramp up over two seconds
```

## Fades

For a clean intro/outro, drive an alpha in the shader from the `time` uniform
(seconds since the shader started), multiplying the sampled colour:

```glsl
float a = clamp(time / 4.0, 0.0, 1.0);          // 4s fade-in
gl_FragColor = vec4(col * a, 1.0);
```

## See also

- [Song API reference](song-api.md) — the full song API.
- `monstertheme` (in the demo repos) — a worked example combining a walk-cycle
  animation, the snap shader, and audio-reactive effects.
