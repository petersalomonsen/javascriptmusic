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

There's no text primitive — render text to a canvas and use it as an image
frame. Build a data-URL once, register it with `addImage`, and `startVideo` it
when you want it on screen:

```js
function textImage(lines) {
  const c = document.createElement('canvas');
  c.width = 1152; c.height = 1280;
  const ctx = c.getContext('2d');
  ctx.font = '70px Arial';
  ctx.fillStyle = '#fff';
  lines.forEach((t, i) => {
    const w = ctx.measureText(t).width;
    ctx.fillText(t, (c.width - w) / 2, 400 + i * 100);
  });
  return c.toDataURL();
}

addImage('title', textImage(['My Song', 'by me']));
// ...
startVideo('title');   // show the title card
```

(Note: in the browser song editor, `document` is available at song-compile
time, so building a canvas data-URL like this works.)

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
