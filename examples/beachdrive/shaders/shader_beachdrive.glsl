/*
 * Copyright (c) 2022-2026 Peter Johan Salomonsen ( petersalomonsen.com )
 * Licensed under CC BY-NC 4.0 — see LICENSE
 *
 * Beach drive — a Sega OutRun–style pseudo-3D coastal road (Cannes / Côte
 * d'Azur at golden hour). Drive forward down a road that converges to a
 * vanishing point; the whole scene is shifted LEFT so the SEA fills the right
 * of the frame, with rolling waves, palm trees on the verge, and a low sun.
 *
 * Forward motion is driven by the GAME STATE the song's synth.ts integrates and
 * writes into the `synthState` uniform (carDistance/carSpeed/carX/gameTime) — so
 * the car accelerates, steers and can be driven with the music paused. With no
 * game relay (run as a plain music visualizer) it falls back to a constant cruise
 * off the song `time`. The sea swell always rolls at a constant speed. Music
 * reactivity (via the JS-smoothed note states, so it eases rather than snaps):
 * the PALMS sway/grow (nearest trees react most), the SKY colours shift, the SUN
 * pulses, and the playing note adds extra CURL to the wave crests — a lateral
 * ripple whose frequency follows the note's pitch and strength its level. The
 * note only bends the shape of the waves, never speeds the swell, so the sea
 * stays smooth.
 *
 * Projection: each scanline below the horizon maps to a perspective depth z;
 * road half-width ~ 1/z, a curve offset accumulates with depth; forward motion
 * scrolls z by carDistance (or by time in the no-game fallback).
 */

precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float targetNoteStates[128];
// JS-side smoothed note view (fast attack, slow release) → eased reactivity.
uniform float smoothedNoteStates[128];
// Generic synth → shader state, written by the song's synth.ts (the app assigns
// no meaning to it). The beach-drive synth fills these slots — full-precision
// f32, integrated in the wasm and relayed verbatim (never through MIDI):
//   0 carDistance — accumulated forward position (drives the road scroll)
//   1 carSpeed    — current speed
//   2 carX        — lateral position (-1 left .. +1 right)
//   3 gameTime    — free-running clock for ambient motion (advances even paused)
//   4 roadblock lane, 5 oncoming-car lane, 6 animal lane (0..1; 0 = absent)
// All advance while the music is paused. With no relay (plain-visualizer use)
// gameTime is 0 → the shader falls back to music `time` and the note controls.
uniform float synthState[64];

// Shift the whole scene left so more sea shows on the right (world units).
const float SHIFT = 0.42;
const float HORIZON = 0.52;

float hash11(float p) { return fract(sin(p * 127.1) * 43758.5453); }

// ---- driving-control NOTES (fallback only) ----
// When the song's wasm game relay is active (synthState carries the integrated
// car state), the car is driven by that state — see synthState above. These note
// reads are the FALLBACK used only when there is no relay (this shader run as a
// plain music visualizer): playing the note = pressing the control, velocity =
// how hard, with a ~0.4s coast-down from the JS-smoothed note states. They're
// excluded from the music-reactive aggregates below so steering/throttle don't
// also bend the sea or swing the palms. (The real game lives in the song's
// synth.ts; in the app you drive by selecting the `drive` instrument.)
const int THROTTLE_NOTE = 36;   // c3
const int BRAKE_NOTE    = 38;   // d3
const int STEER_L_NOTE  = 48;   // c4
const int STEER_R_NOTE  = 50;   // d4
bool isControlNote(int i) {
    return i == THROTTLE_NOTE || i == BRAKE_NOTE || i == STEER_L_NOTE || i == STEER_R_NOTE;
}

// Smoothed musical energy 0..1 — drives the palm sway, sky colour and sun.
float noteEnergy() {
    float e = 0.0;
    for (int i = 0; i < 128; i++) {
        if (isControlNote(i)) continue;            // driving inputs aren't "music"
        e += max(0.0, smoothedNoteStates[i] * 0.5 + 0.5);
    }
    return clamp(e / 24.0, 0.0, 1.0);
}

// Dominant musical pitch + level for the oscilloscope trace on the water.
// Returns vec2(pitch01, level01): pitch01 maps the amplitude-weighted note
// index (~C1..C7) to 0..1, level01 is the peak smoothed amplitude. Silent
// notes read -1 → contribute 0, so they don't drag the pitch down.
vec2 scopeNote() {
    float sumA = 0.0;     // amplitude sum
    float sumAN = 0.0;    // amplitude-weighted note index
    float peak = 0.0;
    for (int i = 0; i < 128; i++) {
        if (isControlNote(i)) continue;            // exclude driving inputs
        float a = max(0.0, smoothedNoteStates[i] * 0.5 + 0.5);
        sumA += a;
        sumAN += a * float(i);
        peak = max(peak, a);
    }
    float noteIdx = sumA > 0.001 ? sumAN / sumA : 48.0;
    float pitch01 = clamp((noteIdx - 24.0) / 72.0, 0.0, 1.0);
    return vec2(pitch01, clamp(peak, 0.0, 1.0));
}

// Palm-tree silhouette in local space `q` (origin at trunk base, +y up), trunk
// height `h`. `sway` bends the trunk/fronds sideways (music-driven, signed so
// the whole tree swings left↔right). `leafScale` grows the fronds + coconut
// cluster (music-driven so loud near palms fan out big leaves). Returns
// vec2(trunkCoverage, frondCoverage) so the caller colours trunk brown, leaves green.
vec2 palm(vec2 q, float h, float sway, float leafScale) {
    // trunk: gentle base curve + signed musical sway, growing toward the top.
    float yN = clamp(q.y / max(h, 1e-3), 0.0, 1.0);
    float lean = 0.05 * h * sin(yN * 2.0) + sway * h * yN * yN;   // sway can be ±
    float trunkW = mix(0.045 * h, 0.022 * h, yN);
    float trunk = smoothstep(trunkW, 0.0, abs(q.x - lean)) * step(0.0, q.y) * step(q.y, h);

    // crown of drooping fronds from the top (lean the whole fan with sway)
    vec2 c = q - vec2(lean, h);
    float fronds = 0.0;
    for (int k = 0; k < 7; k++) {
        float a = (float(k) / 6.0 - 0.5) * 2.6 + sway * 2.5;     // fan tilts with sway
        vec2 dir = vec2(sin(a), cos(a) * 0.6 + 0.2);
        float L = 0.45 * h * leafScale;                          // leaf length grows with the music
        float along = dot(c, normalize(dir));
        vec2 onAxis = normalize(dir) * along;
        float droop = (along * along) / (L * 1.5);
        float perp = abs(dot(c - onAxis, normalize(vec2(dir.y, -dir.x)))) + max(0.0, droop);
        fronds = max(fronds, smoothstep(0.06 * h * leafScale, 0.0, perp) * step(0.0, along) * smoothstep(L, 0.0, along));
    }
    // coconut cluster (counts as crown/green region)
    fronds = max(fronds, smoothstep(0.06 * h * leafScale, 0.0, length(c)) * 0.9);

    // fronds win where they overlap the trunk top
    trunk = clamp(trunk - fronds, 0.0, 1.0);
    return vec2(trunk, clamp(fronds, 0.0, 1.0));
}

void main() {
    vec2 frag = gl_FragCoord.xy / resolution.xy;       // 0..1
    float aspect = resolution.x / resolution.y;
    float drive = noteEnergy();                        // smoothed; palms + sky only

    // unpack the song's game state from the generic synthState buffer
    float carDistance = synthState[0];
    float carSpeed    = synthState[1];
    float carX        = synthState[2];
    float gameTime    = synthState[3];

    // --- game clock & forward motion ---
    // When the wasm game relay is live (gameTime advances), forward motion comes
    // from the integrated carDistance and ambient animation from gameTime — both
    // keep going while the music is paused. With no relay, fall back to the song
    // `time` so this still works as a plain music visualizer.
    bool gameActive = gameTime > 0.0;
    float atime = gameActive ? gameTime : time;        // ambient animation clock
    float t = gameActive ? carDistance : time * 8.0;   // forward distance (road scroll)

    // fallback note controls — used only when the game relay is off (see above).
    float throttle = clamp(smoothedNoteStates[THROTTLE_NOTE] * 0.5 + 0.5, 0.0, 1.0);
    float brake    = clamp(smoothedNoteStates[BRAKE_NOTE]    * 0.5 + 0.5, 0.0, 1.0);
    float steerL   = clamp(smoothedNoteStates[STEER_L_NOTE]  * 0.5 + 0.5, 0.0, 1.0);
    float steerR   = clamp(smoothedNoteStates[STEER_R_NOTE]  * 0.5 + 0.5, 0.0, 1.0);

    // lateral car offset (world units): the wasm-integrated carX when the game
    // is live (it holds its line / eases back in the synth), else the fallback
    // note steer. steer right → car right → world shifts left.
    float carLateral = (gameActive ? carX : (steerL - steerR)) * 0.45;
    // throttle "rush" intensity: real speed when driving, else the note.
    float rush = gameActive ? clamp(carSpeed / 14.0, 0.0, 1.0) : throttle;

    float sx = (frag.x - 0.5) * aspect + SHIFT - carLateral; // shifted-left scene x (+ steering)

    vec3 col;

    if (frag.y >= HORIZON) {
        // ---------- SKY (colour reacts to music) ----------
        float s = (frag.y - HORIZON) / (1.0 - HORIZON);
        // Warmer, more saturated low sky as the music swells; cooler blue when calm.
        // Strong colour shift: calm = mellow orange/blue dusk; loud = hot
        // magenta/violet synthwave sky.
        vec3 lowSky  = mix(vec3(0.92, 0.52, 0.26), vec3(1.00, 0.28, 0.58), drive);  // orange→hot pink
        vec3 highSky = mix(vec3(0.12, 0.26, 0.62), vec3(0.42, 0.08, 0.62), drive);  // blue→deep violet
        col = mix(lowSky, highSky, pow(s, 0.65));

        // low sun over the sea (shifted left with the scene). Its DISC grows
        // and GLOW swells strongly with the (smoothed) music — pulses with the song.
        vec2 sun = vec2(0.5 - SHIFT / aspect, HORIZON + 0.10);
        float d = length((frag - sun) * vec2(aspect, 1.0));
        float sunR = 0.055 + 0.15 * drive;                  // disc radius: 2× note impact
        col += vec3(1.0, 0.72, 0.42) * smoothstep(sunR + 0.16 + 0.36 * drive, 0.0, d) * (0.6 + 2.2 * drive); // glow, 2× impact
        col = mix(col, vec3(1.0, 0.93, 0.78), smoothstep(sunR + 0.02, sunR, d));               // disc
        col = mix(col, col * 0.7, smoothstep(sunR + 0.02, sunR, d) * step(0.5, fract(frag.y * 60.0)));

        // distant clouds
        float cl = smoothstep(0.55, 1.0, sin(frag.x * 6.0 + 1.3) * 0.5 + 0.5 + sin(frag.x * 13.0) * 0.2)
                 * smoothstep(HORIZON + 0.33, HORIZON + 0.10, frag.y) * 0.18;
        col += vec3(cl);
    } else {
        // ---------- GROUND (perspective) ----------
        float p = (HORIZON - frag.y) / HORIZON;        // 0 horizon → 1 bottom
        float z = 1.0 / (p + 0.045);
        float zt = z + t;

        float curve = sin(zt * 0.05) * 0.5 + sin(zt * 0.021 + 1.0);
        float roadX = curve * (1.0 - p) * (1.0 - p) * 0.35;
        float halfW = 0.16 / (z * 0.10 + 0.12);

        float d = (sx - roadX) / halfW;                // ±1 = road edges
        float ad = abs(d);

        float seg = fract(zt * 0.20);
        float stripe = step(0.5, seg);

        // base ground: land (left) → beach → SEA (right). Sea starts closer now
        // so it dominates the right of the frame.
        float sea   = smoothstep(1.25, 1.7, d);
        float beach = smoothstep(0.95, 1.3, d) * (1.0 - sea);
        vec3 grass = mix(vec3(0.30, 0.52, 0.22), vec3(0.24, 0.45, 0.18), stripe);
        vec3 sandCol = mix(vec3(0.88, 0.80, 0.56), vec3(0.84, 0.75, 0.52), stripe);

        // --- SEA with rolling waves ---
        // base water colour, deeper toward the horizon
        vec3 seaCol = mix(vec3(0.08, 0.40, 0.60), vec3(0.14, 0.52, 0.70), p);
        // wave crests: bands in depth that scroll toward shore at a CONSTANT
        // speed (independent of the music, so the swell never lurches), with
        // along-shore wobble so they aren't dead straight. The playing note adds
        // extra CURL to the crests: a lateral ripple whose frequency follows the
        // note's pitch and whose strength follows its level — it bends the shape
        // of the existing waves (not a separate line), so higher/louder notes
        // make the water more intricate while the base swell rolls on unchanged.
        vec2 sn = scopeNote();
        // ease-in on the note level so the curl GROWS in rather than snapping to
        // shape (the upstream note smoothing has a fast attack; squaring softens
        // the onset as far as a stateless shader can — a true time-eased attack
        // would need the app's global note smoothing to attack more slowly).
        float lvl = sn.y * sn.y;
        float noteRipple = lvl * sin(d * mix(8.0, 42.0, sn.x) - atime * 3.0);
        float waves = sin(p * 38.0 - atime * 2.5 + sin(d * 3.0 + atime) * 1.2 + noteRipple * 0.11); // subtle note curl (1/10th)
        float crest = smoothstep(0.5, 1.0, waves);
        seaCol = mix(seaCol, vec3(0.22, 0.62, 0.78), crest * 0.5);            // lighter crest face
        float foam = smoothstep(0.92, 1.0, waves) * (0.5 + 0.5 * p);
        seaCol += vec3(0.9, 0.97, 1.0) * foam * 0.7;                          // white foam
        // sun glitter path on the water (steady, not music-driven)
        float glit = smoothstep(0.55, 0.0, abs(sx - (roadX + 0.0)))         // near the sun column
                   * smoothstep(0.6, 1.0, sin(p * 60.0 - atime * 4.0) * 0.5 + 0.5) * (1.0 - p);
        seaCol += vec3(1.0, 0.85, 0.6) * glit * 0.5;

        vec3 ground = grass;
        ground = mix(ground, sandCol, beach);
        ground = mix(ground, seaCol, sea);

        // --- road ---
        vec3 roadCol = mix(vec3(0.32, 0.32, 0.34), vec3(0.27, 0.27, 0.29), stripe);
        float onRoad = smoothstep(1.02, 0.98, ad);
        col = mix(ground, roadCol, onRoad);

        float rumbleZone = smoothstep(1.18, 1.02, ad) * (1.0 - onRoad);
        col = mix(col, mix(vec3(0.9), vec3(0.85, 0.12, 0.12), stripe), rumbleZone);
        col = mix(col, vec3(1.0), smoothstep(0.06, 0.0, abs(ad - 0.92)) * onRoad);
        col = mix(col, vec3(1.0, 0.95, 0.7),
                  smoothstep(0.07, 0.0, ad) * step(0.5, seg) * onRoad);

        // --- sequence-placed obstacles (synthState[4..6], written by synth.ts) ---
        // Each obstacle's value (0..1) chooses its lane (0 = absent). The song's
        // synth.ts reads its obstacle CCs and writes these slots; we read them
        // here. A fixed world length in z is perspective-correct (near obstacles
        // cover more scanlines), and d is already road-relative so a fixed lane
        // width scales with distance. Obstacles ride the same forward distance
        // `t` as the road, so they approach as you drive and FREEZE when you
        // stop (carDistance frozen).
        float tobs = t;
        float ccBlock = synthState[4];
        if (ccBlock > 0.0) {
            float lane = (ccBlock * 2.0 - 1.0) * 0.7;
            float dist = 18.0 - mod(tobs, 18.0);                 // far → near, looping
            float cov = smoothstep(0.8, 0.0, abs(z - dist)) * smoothstep(0.30, 0.0, abs(d - lane));
            vec3 bar = mix(vec3(0.95), vec3(0.85, 0.10, 0.10), step(0.5, fract(d * 6.0 + 0.5)));
            col = mix(col, bar, cov);
        }
        float ccCar = synthState[5];
        if (ccCar > 0.0) {
            float lane = (ccCar * 2.0 - 1.0) * 0.7;
            float dist = 18.0 - mod(tobs + 9.0, 18.0);           // phase-offset from the block
            float cov = smoothstep(0.7, 0.0, abs(z - dist)) * smoothstep(0.26, 0.0, abs(d - lane));
            col = mix(col, vec3(0.10, 0.18, 0.85), cov);
        }
        float ccAnimal = synthState[6];
        if (ccAnimal > 0.0) {
            float lane = (ccAnimal * 2.0 - 1.0) * 0.7;
            float dist = 18.0 - mod(tobs + 4.5, 18.0);
            float cov = smoothstep(0.5, 0.0, abs(z - dist)) * smoothstep(0.18, 0.0, abs(d - lane));
            col = mix(col, vec3(0.5, 0.32, 0.12), cov);
        }

        // golden distance haze toward the horizon
        col = mix(vec3(1.0, 0.72, 0.45), col, clamp(p * 1.5, 0.0, 1.0));
    }

    // ---------- PALMS on the right verge (drawn after the sky/ground split so
    // their crowns can rise above the horizon without being clipped; they SWAY
    // to the music) ----------
    {
        float sxp = (frag.x - 0.5) * aspect + SHIFT - carLateral;   // steer with the scene
        for (int i = 0; i < 8; i++) {
            float slot = float(i);
            float pzWorld = (slot * 2.2) - mod(t, 2.2);
            if (pzWorld < 0.4) continue;
            float zc = pzWorld + 0.6;
            float pc = 1.0 / zc - 0.045;
            if (pc <= 0.02 || pc >= 0.98) continue;
            float baseY = HORIZON - pc * HORIZON;
            float curveC = sin((zc + t) * 0.05) * 0.5 + sin((zc + t) * 0.021 + 1.0);
            float roadXc = curveC * (1.0 - pc) * (1.0 - pc) * 0.35;
            float palmX = roadXc + (0.10 + 0.45 * pc) * aspect + hash11(slot) * 0.05;
            // music impact is strongest on the NEAREST palms and fades out with
            // distance — foreground trees dance, far ones stay calm.
            float near = smoothstep(0.10, 0.55, pc);
            float react = drive * near;
            // trunk height, swing AND leaf size all grow with the (near-weighted)
            // music — close palms stretch tall, swing hard and fan out big leaves.
            float h = (0.06 + 0.34 * pc) * (0.45 + 2.6 * react);
            float sway = (0.05 + 1.2 * react) * sin(atime * 1.6 + slot * 1.7);
            float leafScale = 0.7 + 1.3 * react;
            vec2 q = vec2(sxp - palmX, frag.y - baseY);
            // widened bounds so the taller / harder-swinging / bigger-leaved crown isn't clipped
            if (abs(q.x) > h * 3.2 || q.y < -0.02 || q.y > h * 2.4) continue;
            vec2 cov = palm(q, h, sway, leafScale);      // x=trunk, y=fronds
            float fade = smoothstep(0.02, 0.10, pc) * smoothstep(0.98, 0.80, pc);
            // brown trunk, green leaves — both darken slightly toward the horizon.
            vec3 trunkCol  = mix(vec3(0.40, 0.26, 0.13), vec3(0.30, 0.20, 0.10), pc);
            vec3 frondCol  = mix(vec3(0.16, 0.45, 0.14), vec3(0.10, 0.32, 0.10), pc);
            col = mix(col, trunkCol, cov.x * fade);
            col = mix(col, frondCol, cov.y * fade);
        }
    }

    // ---- speed "rush" + brake glow (visual speed cues) ----
    // Radial speed lines streaming out of the road's vanishing point; denser and
    // faster with `rush` (= real carSpeed when the game is live, else the
    // throttle note). The forward scroll itself is the integrated carDistance.
    {
        vec2 vp = vec2(0.5 - SHIFT / aspect + carLateral / aspect, HORIZON);
        vec2 d2 = (frag - vp) * vec2(aspect, 1.0);
        float rad = length(d2);
        float ang = atan(d2.y, d2.x);
        float streaks = sin(ang * 60.0) * 0.5 + 0.5;
        streaks *= sin(rad * 26.0 - atime * 30.0 * (0.6 + rush)) * 0.5 + 0.5;
        streaks *= smoothstep(0.12, 0.6, rad);          // nothing at the centre
        col = mix(col, vec3(1.0), smoothstep(0.6, 1.0, streaks) * rush * 0.35);
        // brake: red wash creeping in from the edges
        col = mix(col, vec3(1.0, 0.12, 0.06), smoothstep(0.45, 1.05, rad) * brake * 0.5);
    }

    // vignette + fade-in
    float vig = smoothstep(1.3, 0.35, length((frag - 0.5) * vec2(aspect, 1.0)));
    col *= mix(0.78, 1.0, vig);
    col *= clamp(atime / 2.0, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
}
