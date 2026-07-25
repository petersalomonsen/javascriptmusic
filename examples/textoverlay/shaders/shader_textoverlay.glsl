// Text overlay demo — the song decides WHAT text to show (showText), WHEN
// (song time) and HOW (setVisual('textTransition', n) picks the style below).
//
// Uniforms from the app:
//   uText / uTextPrev  the current and outgoing text images (alpha = coverage)
//   uTextMix           0..1 progress of the current text's fade
//   textTransition     set by the song: 0 fade, 1 wipe, 2 rise, 3 dissolve
//   textScale          set by the song: 1.0 = text image fills the height
//
// Headless check:
//   node ../tools/shadertest/render.mjs ../examples/textoverlay/shaders/shader_textoverlay.glsl \
//        --text "Første vers" --textmix 0.4 --visual textTransition=1
precision highp float;

uniform vec2 resolution;
uniform float time;
uniform float smoothedNoteStates[128];

uniform sampler2D uText;
uniform sampler2D uTextPrev;
uniform float uTextMix;

uniform float textTransition;
uniform float textScale;

const float TEXT_ASPECT = 16.0 / 9.0;   // showText's default image is 1280x720

float noteEnergy() {
    float e = 0.0;
    for (int i = 0; i < 128; i++) {
        e += max(0.0, smoothedNoteStates[i] * 0.5 + 0.5);
    }
    return clamp(e / 16.0, 0.0, 1.0);
}

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Music-reactive backdrop, so the text has something to sit on top of.
vec3 background(vec2 uv, float energy) {
    float d = length(uv - 0.5);
    float waves = sin(uv.x * 8.0 + time * 0.7) * 0.5 + sin(uv.y * 6.0 - time * 0.5) * 0.5;
    vec3 deep = vec3(0.03, 0.05, 0.12);
    vec3 glow = vec3(0.25, 0.12, 0.45) + vec3(0.35, 0.15, 0.0) * energy;
    return mix(deep, glow, clamp(0.5 + 0.5 * waves - d * 1.2 + energy * 0.4, 0.0, 1.0));
}

// Fit the text image inside the viewport without stretching it ("contain").
vec2 textUv(vec2 uv, float scale) {
    float dstAspect = resolution.x / resolution.y;
    vec2 fit = dstAspect > TEXT_ASPECT
        ? vec2(dstAspect / TEXT_ASPECT, 1.0)
        : vec2(1.0, TEXT_ASPECT / dstAspect);
    vec2 tuv = (uv - 0.5) * fit / max(scale, 0.001) + 0.5;
    return vec2(tuv.x, 1.0 - tuv.y);   // textures upload top-row-first
}

vec4 sampleText(sampler2D tex, vec2 tuv) {
    // Outside the image: nothing. CLAMP_TO_EDGE would otherwise smear the
    // border pixels across the letterbox area.
    if (tuv.x < 0.0 || tuv.x > 1.0 || tuv.y < 0.0 || tuv.y > 1.0) {
        return vec4(0.0);
    }
    return texture2D(tex, tuv);
}

// One text layer under a transition. `p` runs 0..1 as the layer comes IN;
// pass 1.0 - uTextMix and `outgoing = true` for the layer going out.
vec4 transitionedText(sampler2D tex, vec2 uv, float p, bool outgoing) {
    float mode = floor(textTransition + 0.5);
    vec2 offset = vec2(0.0);
    float alpha = 1.0;

    if (mode < 0.5) {                       // 0: crossfade
        alpha = p;
    } else if (mode < 1.5) {                // 1: wipe left→right
        // Both layers share the same edge: the new text owns everything left
        // of it, the old text everything right of it.
        float edge = outgoing ? 1.0 - p : p;
        float reveal = smoothstep(edge + 0.12, edge - 0.12, uv.x);
        alpha = outgoing ? 1.0 - reveal : reveal;
    } else if (mode < 2.5) {                // 2: rise into place
        offset.y = (1.0 - p) * (outgoing ? -0.12 : 0.12);
        alpha = smoothstep(0.0, 0.6, p);
    } else {                                // 3: pixel dissolve
        // Sequential, not simultaneous: the old text dissolves away over the
        // first half of the fade, the new one materialises over the second.
        // Two texts dissolving at once is unreadable mush.
        float block = hash(floor(uv * vec2(90.0, 50.0)));
        alpha = step(block, clamp(2.0 * p - 1.0, 0.0, 1.0));
    }

    vec4 texel = sampleText(tex, textUv(uv + offset, textScale > 0.0 ? textScale : 1.0));
    texel.a *= clamp(alpha, 0.0, 1.0);
    return texel;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float energy = noteEnergy();
    vec3 col = background(uv, energy);

    // Outgoing text first, incoming over it.
    vec4 prev = transitionedText(uTextPrev, uv, 1.0 - uTextMix, true);
    vec4 cur = transitionedText(uText, uv, uTextMix, false);

    col = mix(col, prev.rgb, prev.a);
    col = mix(col, cur.rgb, cur.a);

    gl_FragColor = vec4(col, 1.0);
}
