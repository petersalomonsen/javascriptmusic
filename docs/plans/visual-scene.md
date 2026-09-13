# Animated text, figures and diagrams — plan

*Status: proposal (2026-09-13). Companion to [headless-studio.md](headless-studio.md).
Nothing here is built; `render_shader` (PR #232) is the feedback loop it
assumes.*

## Goal

The song should be able to put text, figures and diagrams on screen and
**animate** them: labels that move, boxes that slide and connections that
follow, a diagram the camera orbits or zooms into, text seen from an angle,
a diagram in 3D. All of it sequenced from the song with the same `await
waitForBeat()` as the notes, deterministic under seeking and video export,
and safe to run from a cloned repo.

## What exists today, and where it stops

The song already has a visual sub-language: `showText` / `hideText` (one text
layer, rendered by the host to a texture), `setVisual(name, float, ramp)`
(named uniforms with ramps), `addImage` / `startVideo` (an image layer). The
shader composites those layers and draws anything else itself — the "Much"
dancers are pure GLSL: joints projected through a hand-written camera, limbs
as signed-distance segments, no geometry, no canvas.

It stops at: **one** text at a time with position baked into the image;
floats only, so a camera position is three calls; and no way to feed the
shader more than a few hundred numbers (uniform slots; note states already
take 256). A diagram with labelled boxes that move independently is not
expressible.

## The decision: shaders stay the programmable layer

Two routes were weighed.

**A scene engine (Three.js)** — scene graph, camera, fat lines, SDF text via
troika, renders on its own canvas and is composited as a `uScene` texture.
Standard and well known to every model. But: the song runs in QuickJS with a
JSON boundary (see the headless plan, "The song still runs in QuickJS"), so
the song could never touch Three objects — we would wrap Three in a small
data API of our own, and the song would get *our* feature set, not Three's.
Three would only be saving host implementation effort, at the cost of a
second engine, a second GL context and a per-frame texture copy.

**Self-contained shaders driven by data** — the architecture today. GLSL is
a safe language to accept from a repository; JavaScript is not. The shader
is the code, the song sends data. The dancer shows camera, projection,
figures and animation all fit in a fragment shader. What is missing are three
*data feeds* from the host, not orchestration.

Decision: **shaders, with three host-side data feeds, on WebGL2.** Three.js
stays the deferred alternative for the day a scene needs hundreds of lit
objects, loaded models or shadows; it would slot in as one more texture
source without changing the song API.

## The three data feeds

1. **Vectors with ramps.** `setVisual(name, [x, y, z], rampSeconds)` — the
   same scheduler as today (`visualizer/visualparams.js`, overlapping ramps
   already handled), now for `vec2`/`vec3`/`vec4` uniforms. A camera move or
   a box position is one ramped call.
2. **An element table in a data texture.** `setElements(name, rows,
   rampSeconds)` where each row is a small fixed record (position, size,
   colour, label index, flags). The host packs the interpolated table into a
   float texture (`RGBA32F`, WebGL2) and the shader reads element `i` with
   `texelFetch`. Unlimited boxes, joints, particles; rows ramp like uniforms.
3. **Named labels in a texture array.** `setLabel(name, text, options)` —
   the existing text-to-texture path (`midisequencer/textimage.js`) rendered
   into one `sampler2DArray` slice per label, plus a uniform table of label
   sizes. A shader samples label `i` onto a billboard, a box face or a
   floating title. `showText` stays as the single-layer convenience on top.

Everything else — boxes, arrows that follow their endpoints, rotating text,
zooming into a component, a 3D diagram — is signed-distance functions and
camera math in GLSL. The song never runs code on the host.

## A GLSL include library, shipped and skill-documented

So the agent does not rewrite the dancer's camera every time, the host
preprocesses `#include "wasmmusic/<name>.glsl"` (string substitution before
compile; a nested include is an error). First contents:

- `camera.glsl` — look-at camera from `uCamPos`/`uCamTarget`/`uCamFov`
  vectors, orthographic and perspective, project a world point to screen.
- `sdf.glsl` — box, rounded box, segment, capsule, circle, ring, arrow head,
  smooth-min; screen-space anti-aliasing helper.
- `elements.glsl` — read a row of the element table; draw a labelled box; a
  connection between two elements with an arrow; a billboard label.
- `text.glsl` — sample a label slice with contain/cover fitting.

The same library is a project-agnostic skill for the agent (see the
headless plan's skills convention), with a worked example project:
`examples/diagram` — a component diagram whose boxes slide and whose camera
orbits, on the beat.

## WebGL2

A WebGL2 context runs GLSL ES 1.00 shaders unchanged, so every existing
shader keeps working; new shaders opt into `#version 300 es`. Feeds 2 and 3
need it (`texelFetch`, float textures, `sampler2DArray`). Three
`getContext` sites change (the visualizer, the offscreen renderer, the
headless harness), each with a WebGL1 fallback that simply lacks the new
feeds. Old-context extension enums (float textures) are the one thing to
check when moving.

## Agent side

- `render_shader` is the eyes for all of this: it goes through the same
  `drawFrame`, so labels, element tables and vectors at song time are in the
  sheet. Nothing to add.
- The visual-warning loop extends: a label or element table the song sets
  that the shader never declares → the same "the shader can't show this"
  warning as `showText` without `uText` today.
- Prompt: the shader section gains one paragraph on the three feeds and the
  include library; the song section documents the three calls. No specialist
  until sessions show the producer's context bloating on long scene work; if
  it does, a visuals specialist on the mastering pattern (song + shader +
  render tools, measured verdict: compiles, not blank, differs over time,
  reacts).
- An optional second sandboxed document, `visuals.js`, concatenated into the
  same QuickJS guest, for helpers like `buildDiagram()` — orchestration stays
  in the song, definitions get their own file. Data out, never host code.

## Sandboxed scene code: bake, don't run live

Could Three.js run in QuickJS? Its scene graph, matrices, cameras and
procedural geometry are plain JavaScript and would; its renderer needs GL
and would not — and text, fat lines, materials and lighting live in the
renderer. Three in the sandbox therefore buys an authoring API whose
serialized output is the element table anyway.

The song runs once at compile time and produces a schedule; that model
stays. Sandboxed scene code fits it by **baking**: run over the whole song
inside QuickJS, emit keyframes into the element table. Deterministic under
seek and export, the guest stays one-shot. Useful beyond Three: a
force-directed or layered **diagram layout** computed in the sandbox at
compile time, positions out as data. A live guest called once per frame
during playback is possible but not worth it for visuals — seeking would
mean re-simulating from zero, and every frame is a deadline-bounded call
across the wasm boundary.

## Interactivity: an on-screen knob is a virtual MIDI controller

Knobs and sliders drawn by the shader that change the music, and the
visuals back, fit the design without running repo code on the host:

- The song declares the control as **data** in the element table: a row
  with a `control` field naming a MIDI channel, a controller number and a
  range (this is why the row layout must be fixed early).
- The host already packs that table, so it **hit-tests** pointer drags
  against the row's position and size and sends the resulting control
  change to the live synth — the same path a hardware controller takes.
- The shader draws the knob from the element table and its position from
  `synthState`, which the synth already relays back as a uniform. The loop
  closes through the synth: pointer → CC → synth → uniform → pixels.
  Hardware knobs and on-screen knobs are indistinguishable.
- Because it is a control change it is **recordable**: turned while
  recording, it lands in the song like any performance; afterwards playback
  moves the knob and the sound deterministically, seek and export work, and
  the headless studio plays the recorded values with no pointer at all.
- Visual-only controls take the same route on a spare channel, or a value
  written into a live uniform.

Not covered: picking arbitrary shader-drawn shapes that are not in the
table. That would need an ID render target (WebGL2 multiple render
targets) if it is ever wanted.

## Phases

1. **WebGL2 + vectors.** Context switch with fallback; `setVisual` vectors
   with ramps; docs; tests through the harness.
2. **Labels + elements.** Texture array of labels; element table as a float
   texture; the warning loop; `examples/diagram`.
3. **Include library + skill.** The four includes, preprocessing, the skill
   file, the prompt paragraph; the agent verified on "add a labelled box and
   slide it on the chorus" through `render_shader`.
4. **`visuals.js`** (optional) — second sandboxed document and editor tab.

## Sizes

| Piece | Rough size |
|---|---|
| WebGL2 switch + fallback, three sites | 50 lines |
| Vector visuals with ramps (scheduler, uniform upload, docs) | 150 lines |
| Label texture array + size table | 200 lines |
| Element table → float texture, ramped | 250 lines |
| Include preprocessing + four includes | 300 lines GLSL/JS |
| Warnings, prompt, docs, example project | 300 lines + docs |

Roughly half of the Three.js route, with one engine instead of two.

## Open questions

- Label resolution when the camera zooms far in: render slices at 2× and
  accept softness beyond, or SDF glyphs later.
- Row layout of the element table (how many texels per element, where the
  `control` fields go) — fix it early, shaders will hard-code it.
- Whether `setElements` ramps whole tables or only rows that changed.
- WebGL1 fallback scope: silently lacking the feeds, or a visible warning.
