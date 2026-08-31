// Minimal typographic visualizer for the 125 BPM house track in this project.
//
// The type is the subject; everything else is lighting for it. Nothing here
// competes with the words — a gradient, one glow, one rule, some grain, and a
// chromatic split that opens on the kick.
//
// Three energy bands, picked from what this song actually plays:
//   low   notes 0-35    kick (c2) and the lower bass octave      -> the pump
//   mid   notes 36-47   snare (d3), hi-hat (fs3), bass octave up -> the rule
//   high  notes 48-127  pad chords and the flute lead            -> the glow
//
// setVisual() knobs the song can turn:
//   accent      0 amber (default) .. 1 magenta
//   textScale   1.0 (default) contains the 16:9 text image without clipping.
//               For bigger type raise showText's own `size`, don't zoom here —
//               zooming crops long lines off both edges.
//
// Headless check:
//   cd wasmaudioworklet
//   node ../tools/shadertest/render.mjs \
//     ../examples/house-track/shaders/shader_housetrack.glsl \
//     --size 1080x1920 --text "give me a beat" --energy 0.8
precision highp float;

uniform vec2 resolution;
uniform float time;
uniform float smoothedNoteStates[128];

uniform sampler2D uText;
uniform sampler2D uTextPrev;
uniform float uTextMix;

uniform float accent;
uniform float textScale;

const float TEXT_ASPECT = 16.0 / 9.0;   // showText()'s image is 1280x720

// ---- music ------------------------------------------------------------------
// One pass over the note states, split into the three bands above. A note that
// is not sounding reads -1, so the +0.5 shift lands silence at 0.
vec3 bands() {
    vec3 e = vec3(0.0);
    for (int i = 0; i < 128; i++) {
        float v = max(0.0, smoothedNoteStates[i] * 0.5 + 0.5);
        if (i < 36) e.x += v;
        else if (i < 48) e.y += v;
        else e.z += v;
    }
    // Divisors are "how many of this band sound at once" — the pad alone is
    // three notes, so the high band needs the loosest normalisation.
    return clamp(e / vec3(2.0, 3.0, 7.0), 0.0, 1.0);
}

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// ---- text -------------------------------------------------------------------
// "Contain" the 16:9 text image in the frame. In a 9:16 frame that resolves to
// fitting by WIDTH, which is what a title card wants on a phone.
vec2 textUv(vec2 uv, float scale) {
    float dstAspect = resolution.x / resolution.y;
    vec2 fit = dstAspect > TEXT_ASPECT
        ? vec2(dstAspect / TEXT_ASPECT, 1.0)
        : vec2(1.0, TEXT_ASPECT / dstAspect);
    vec2 tuv = (uv - 0.5) * fit / max(scale, 0.001) + 0.5;
    return vec2(tuv.x, 1.0 - tuv.y);       // textures upload top-row-first
}

// CLAMP_TO_EDGE would smear the border pixels across the letterbox, so anything
// outside the image is nothing at all.
float textAlpha(sampler2D tex, vec2 tuv) {
    if (tuv.x < 0.0 || tuv.x > 1.0 || tuv.y < 0.0 || tuv.y > 1.0) return 0.0;
    return texture2D(tex, tuv).a;
}

// Sampled three times at slightly different offsets, so the kick opens a red/blue
// fringe on the letterforms. Alpha stays the union — the split colours the edges
// without eating into the glyph.
vec4 textLayer(sampler2D tex, vec2 uv, float scale, float split) {
    vec2 o = vec2(split, 0.0);
    float r = textAlpha(tex, textUv(uv + o, scale));
    float g = textAlpha(tex, textUv(uv, scale));
    float b = textAlpha(tex, textUv(uv - o, scale));
    return vec4(vec3(r, g, b) * 0.35 + vec3(g) * 0.75, max(g, max(r, b)));
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 p = (gl_FragCoord.xy - 0.5 * resolution) / resolution.y;
    vec3 e = bands();
    // 1.0 == contain, which never clips. Zooming past it to enlarge short lines
    // crops long ones off both edges, so type SIZE is showText's job (`size`),
    // not the shader's — the shader only promises to fit what it is given.
    float scale = textScale > 0.0 ? textScale : 1.0;

    vec3 accentCol = mix(vec3(1.00, 0.62, 0.22), vec3(1.00, 0.25, 0.55),
                         clamp(accent, 0.0, 1.0));

    // Base: a near-black that lifts very slightly towards the top.
    vec3 col = mix(vec3(0.020, 0.021, 0.035), vec3(0.055, 0.045, 0.090), uv.y);

    // The only real light in the frame, sitting behind the type and breathing
    // with the pad and lead.
    // Tight: in a 9:16 frame p.x only reaches +/-0.28, so the falloff has to be
    // steep on BOTH axes or the "glow" is just an orange wash over everything.
    float glow = exp(-length(p * vec2(2.4, 2.0)) * 3.4);
    col += accentCol * glow * (0.07 + 0.30 * e.z);

    // A rule under the text. Its width tracks the drums, so it snaps on the
    // backbeat and rides the hats.
    float ruleY = 0.5 - 0.135 / max(scale, 0.001);
    float halfWidth = 0.10 + 0.34 * e.y;
    float rule = smoothstep(0.0018, 0.0, abs(uv.y - ruleY))
               * smoothstep(halfWidth, halfWidth - 0.06, abs(uv.x - 0.5));
    col += accentCol * rule * 0.85;

    // Kick: a slow bloom off the floor of the frame.
    col += accentCol * e.x * 0.10 * smoothstep(0.42, 0.0, uv.y);

    // Type. The outgoing line goes under the incoming one.
    float split = 0.0009 + 0.0075 * e.x;
    vec4 prev = textLayer(uTextPrev, uv, scale, split);
    vec4 cur  = textLayer(uText,     uv, scale, split);
    prev.a *= 1.0 - uTextMix;
    cur.a  *= uTextMix;
    col = mix(col, prev.rgb, prev.a);
    col = mix(col, cur.rgb, cur.a);

    // Vignette, then grain — grain last so it sits on everything evenly and
    // keeps the flat background from banding on a phone screen.
    col *= 1.0 - 1.5 * dot(p, p);
    col += (hash(gl_FragCoord.xy + fract(time) * 100.0) - 0.5) * 0.022;

    gl_FragColor = vec4(col, 1.0);
}
