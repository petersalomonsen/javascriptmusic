/*
 * Copyright (c) 2026 - Peter Johan Salomonsen
 */


setBPM(120);

addInstrument('DX7 E.Piano');   // Channel 0 — Algorithm 5
addInstrument('DX7 Bass');      // Channel 1 — Algorithm 16
addInstrument('DX7 Strings');   // Channel 2 — Algorithm 2
addInstrument('DX7 Bells');     // Channel 3 — Algorithm 5
addInstrument('DX7 Drums');     // Channel 4 — Drum Kit (Kick=c2, Snare=d2, Hat=fs3)

// NRPN helper: sends CC 99 (MSB) + CC 98 (LSB) + CC 6 (value)
function nrpn(beat, param, value) {
    return [
      beat, controlchange(99, (param >> 7) & 127),
      beat, controlchange(98, param & 127),
      beat, controlchange(6, value),
     ];
}

// Channel 0: E.PIANO 1 (DX7 ROM1A) — Algorithm 5
// [Op2]→[Op1]→out, [Op6(fb)]→[Op5]→[Op4]→[Op3]→out
createTrack(0).play([
    // --- Global / LFO ---
    nrpn(0, 0, 109),   // Feedback=6
    nrpn(0, 1, 64),    // Transpose=0
    nrpn(0, 2, 127),   // Osc Key Sync=1
    nrpn(0, 3, 64),    // Pitch EG L1=50
    nrpn(0, 4, 64),    // Pitch EG L2=50
    nrpn(0, 5, 64),    // Pitch EG L3=50
    nrpn(0, 6, 64),    // Pitch EG L4=50
    nrpn(0, 7, 127),   // Pitch EG R1=99
    nrpn(0, 8, 127),   // Pitch EG R2=99
    nrpn(0, 9, 127),   // Pitch EG R3=99
    nrpn(0, 10, 127),  // Pitch EG R4=99
    nrpn(0, 11, 0),    // LFO Wave=Triangle
    nrpn(0, 12, 45),   // LFO Speed=35
    nrpn(0, 13, 0),    // LFO Delay=0
    nrpn(0, 14, 0),    // PMD=0
    nrpn(0, 15, 0),    // AMD=0
    nrpn(0, 16, 127),  // LFO Sync=1
    nrpn(0, 17, 54),   // P Mod Sens=3

    // --- Op1 (Carrier - tine fundamental, ratio 1:1) ---
    nrpn(0, 18, 91),   // Detune=+3
    nrpn(0, 19, 4),    // Coarse=1
    nrpn(0, 20, 0),    // Fine=0
    nrpn(0, 21, 127),  // EG L1=99 (full attack)
    nrpn(0, 22, 96),   // EG L2=75 (sustain drops)
    nrpn(0, 23, 0),    // EG L3=0
    nrpn(0, 24, 0),    // EG L4=0
    nrpn(0, 25, 123),  // EG R1=96 (fast attack)
    nrpn(0, 26, 32),   // EG R2=25 (moderate decay)
    nrpn(0, 27, 32),   // EG R3=25
    nrpn(0, 28, 86),   // EG R4=67 (moderate release)
    nrpn(0, 29, 127),  // Level=99 (full carrier output)
    nrpn(0, 30, 36),   // Key Vel=2
    nrpn(0, 31, 0),    // A Mod Sens=0
    nrpn(0, 32, 54),   // Rate Scaling=3
    nrpn(0, 33, 50),   // Breakpoint=C3
    nrpn(0, 34, 0),    // L Depth=0
    nrpn(0, 35, 0),    // R Depth=0
    nrpn(0, 36, 0),    // L Curve=0
    nrpn(0, 37, 0),    // R Curve=0

    // --- Op2 (Modulator for Op1 - bell "ding" at 14:1) ---
    nrpn(0, 38, 91),   // Detune=+3
    nrpn(0, 39, 57),   // Coarse=14 (14th harmonic!)
    nrpn(0, 40, 0),    // Fine=0
    nrpn(0, 41, 127),  // EG L1=99
    nrpn(0, 42, 96),   // EG L2=75
    nrpn(0, 43, 0),    // EG L3=0
    nrpn(0, 44, 0),    // EG L4=0
    nrpn(0, 45, 122),  // EG R1=95
    nrpn(0, 46, 64),   // EG R2=50
    nrpn(0, 47, 45),   // EG R3=35
    nrpn(0, 48, 100),  // EG R4=78
    nrpn(0, 49, 105),  // Level=82 (modulation depth)
    nrpn(0, 50, 73),   // Key Vel=4 (bell louder when played harder)
    nrpn(0, 51, 0),    // A Mod Sens=0
    nrpn(0, 52, 54),   // Rate Scaling=3
    nrpn(0, 53, 50),   // Breakpoint=C3
    nrpn(0, 54, 0),    // L Depth=0
    nrpn(0, 55, 0),    // R Depth=0
    nrpn(0, 56, 0),    // L Curve=0
    nrpn(0, 57, 0),    // R Curve=0

    // --- Op3 (Carrier - warm body tone, ratio 1:1) ---
    nrpn(0, 58, 64),   // Detune=0
    nrpn(0, 59, 4),    // Coarse=1
    nrpn(0, 60, 0),    // Fine=0
    nrpn(0, 61, 127),  // EG L1=99
    nrpn(0, 62, 122),  // EG L2=95 (long sustain for warmth)
    nrpn(0, 63, 0),    // EG L3=0
    nrpn(0, 64, 0),    // EG L4=0
    nrpn(0, 65, 122),  // EG R1=95
    nrpn(0, 66, 26),   // EG R2=20 (slow decay)
    nrpn(0, 67, 26),   // EG R3=20
    nrpn(0, 68, 64),   // EG R4=50
    nrpn(0, 69, 110),  // Level=86
    nrpn(0, 70, 0),    // Key Vel=0 (constant warmth)
    nrpn(0, 71, 0),    // A Mod Sens=0
    nrpn(0, 72, 18),   // Rate Scaling=1
    nrpn(0, 73, 50),   // Breakpoint=C3
    nrpn(0, 74, 0),    // L Depth=0
    nrpn(0, 75, 0),    // R Depth=0
    nrpn(0, 76, 0),    // L Curve=0
    nrpn(0, 77, 0),    // R Curve=0

    // --- Op4 (Modulator for Op3 - harmonic richness) ---
    nrpn(0, 78, 64),   // Detune=0
    nrpn(0, 79, 4),    // Coarse=1
    nrpn(0, 80, 0),    // Fine=0
    nrpn(0, 81, 127),  // EG L1=99
    nrpn(0, 82, 74),   // EG L2=58
    nrpn(0, 83, 0),    // EG L3=0
    nrpn(0, 84, 0),    // EG L4=0
    nrpn(0, 85, 122),  // EG R1=95
    nrpn(0, 86, 37),   // EG R2=29
    nrpn(0, 87, 26),   // EG R3=20
    nrpn(0, 88, 64),   // EG R4=50
    nrpn(0, 89, 110),  // Level=86
    nrpn(0, 90, 73),   // Key Vel=4
    nrpn(0, 91, 0),    // A Mod Sens=0
    nrpn(0, 92, 18),   // Rate Scaling=1
    nrpn(0, 93, 50),   // Breakpoint=C3
    nrpn(0, 94, 0),    // L Depth=0
    nrpn(0, 95, 0),    // R Depth=0
    nrpn(0, 96, 0),    // L Curve=0
    nrpn(0, 97, 0),    // R Curve=0

    // --- Op5 (Modulator - transient excitation) ---
    nrpn(0, 98, 64),   // Detune=0
    nrpn(0, 99, 4),    // Coarse=1
    nrpn(0, 100, 0),   // Fine=0
    nrpn(0, 101, 127), // EG L1=99 (full attack burst)
    nrpn(0, 102, 0),   // EG L2=0 (fast decay to zero)
    nrpn(0, 103, 0),   // EG L3=0
    nrpn(0, 104, 0),   // EG L4=0
    nrpn(0, 105, 127), // EG R1=99 (instant attack)
    nrpn(0, 106, 122), // EG R2=95 (fast decay)
    nrpn(0, 107, 0),   // EG R3=0
    nrpn(0, 108, 0),   // EG R4=0
    nrpn(0, 109, 110), // Level=86
    nrpn(0, 110, 0),   // Key Vel=0
    nrpn(0, 111, 0),   // A Mod Sens=0
    nrpn(0, 112, 0),   // Rate Scaling=0
    nrpn(0, 113, 50),  // Breakpoint=C3
    nrpn(0, 114, 0),   // L Depth=0
    nrpn(0, 115, 0),   // R Depth=0
    nrpn(0, 116, 0),   // L Curve=0
    nrpn(0, 117, 0),   // R Curve=0

    // --- Op6 (Feedback modulator - noise excitation) ---
    nrpn(0, 118, 64),  // Detune=0
    nrpn(0, 119, 4),   // Coarse=1
    nrpn(0, 120, 0),   // Fine=0
    nrpn(0, 121, 127), // EG L1=99
    nrpn(0, 122, 0),   // EG L2=0
    nrpn(0, 123, 0),   // EG L3=0
    nrpn(0, 124, 0),   // EG L4=0
    nrpn(0, 125, 127), // EG R1=99
    nrpn(0, 126, 122), // EG R2=95
    nrpn(0, 127, 0),   // EG R3=0
    nrpn(0, 128, 0),   // EG R4=0
    nrpn(0, 129, 110), // Level=86
    nrpn(0, 130, 0),   // Key Vel=0
    nrpn(0, 131, 0),   // A Mod Sens=0
    nrpn(0, 132, 0),   // Rate Scaling=0
    nrpn(0, 133, 50),  // Breakpoint=C3
    nrpn(0, 134, 0),   // L Depth=0
    nrpn(0, 135, 0),   // R Depth=0
    nrpn(0, 136, 0),   // L Curve=0
    nrpn(0, 137, 0),   // R Curve=0
]);

// Channel 1: BASS 1 (DX7 ROM1A) — Algorithm 16
createTrack(1).play([
    // --- Global / LFO ---
    nrpn(0, 0, 127),   // Feedback=7
    nrpn(0, 1, 32),    // Transpose=-12 (one octave down)
    nrpn(0, 2, 127),   // Osc Key Sync=1
    nrpn(0, 3, 64),    // Pitch EG L1=50
    nrpn(0, 4, 64),    // Pitch EG L2=50
    nrpn(0, 5, 64),    // Pitch EG L3=50
    nrpn(0, 6, 64),    // Pitch EG L4=50
    nrpn(0, 7, 121),   // Pitch EG R1=94
    nrpn(0, 8, 86),    // Pitch EG R2=67
    nrpn(0, 9, 122),   // Pitch EG R3=95
    nrpn(0, 10, 77),   // Pitch EG R4=60
    nrpn(0, 11, 0),    // LFO Wave=Triangle
    nrpn(0, 12, 45),   // LFO Speed=35
    nrpn(0, 13, 0),    // LFO Delay=0
    nrpn(0, 14, 0),    // PMD=0
    nrpn(0, 15, 0),    // AMD=0
    nrpn(0, 16, 0),    // LFO Sync=0
    nrpn(0, 17, 54),   // P Mod Sens=3

    // --- Op1 (Carrier, ratio 0.5:1) ---
    nrpn(0, 18, 64),   // Detune=0
    nrpn(0, 19, 0),    // Coarse=0 (ratio 0.5)
    nrpn(0, 20, 0),    // Fine=0
    nrpn(0, 21, 127),  // EG L1=99
    nrpn(0, 22, 122),  // EG L2=95
    nrpn(0, 23, 41),   // EG L3=32
    nrpn(0, 24, 0),    // EG L4=0
    nrpn(0, 25, 122),  // EG R1=95
    nrpn(0, 26, 80),   // EG R2=62
    nrpn(0, 27, 22),   // EG R3=17
    nrpn(0, 28, 74),   // EG R4=58
    nrpn(0, 29, 127),  // Level=99
    nrpn(0, 30, 0),    // Key Vel=0
    nrpn(0, 31, 0),    // A Mod Sens=0
    nrpn(0, 32, 127),  // Rate Scaling=7
    nrpn(0, 33, 46),   // Breakpoint=A2
    nrpn(0, 34, 73),   // L Depth=57
    nrpn(0, 35, 18),   // R Depth=14
    nrpn(0, 36, 127),  // L Curve=+LIN
    nrpn(0, 37, 0),    // R Curve=-LIN

    // --- Op2 (Modulator, ratio 0.5:1) ---
    nrpn(0, 38, 64),   // Detune=0
    nrpn(0, 39, 0),    // Coarse=0 (ratio 0.5)
    nrpn(0, 40, 0),    // Fine=0
    nrpn(0, 41, 127),  // EG L1=99
    nrpn(0, 42, 0),    // EG L2=0
    nrpn(0, 43, 0),    // EG L3=0
    nrpn(0, 44, 0),    // EG L4=0
    nrpn(0, 45, 127),  // EG R1=99
    nrpn(0, 46, 26),   // EG R2=20
    nrpn(0, 47, 0),    // EG R3=0
    nrpn(0, 48, 0),    // EG R4=0
    nrpn(0, 49, 103),  // Level=80
    nrpn(0, 50, 0),    // Key Vel=0
    nrpn(0, 51, 0),    // A Mod Sens=0
    nrpn(0, 52, 127),  // Rate Scaling=7
    nrpn(0, 53, 53),   // Breakpoint=D3
    nrpn(0, 54, 0),    // L Depth=0
    nrpn(0, 55, 0),    // R Depth=0
    nrpn(0, 56, 0),    // L Curve=0
    nrpn(0, 57, 0),    // R Curve=0

    // --- Op3 (Carrier, ratio 0.5:1) ---
    nrpn(0, 58, 64),   // Detune=0
    nrpn(0, 59, 0),    // Coarse=0 (ratio 0.5)
    nrpn(0, 60, 0),    // Fine=0
    nrpn(0, 61, 101),  // EG L1=79
    nrpn(0, 62, 83),   // EG L2=65
    nrpn(0, 63, 0),    // EG L3=0
    nrpn(0, 64, 0),    // EG L4=0
    nrpn(0, 65, 113),  // EG R1=88
    nrpn(0, 66, 123),  // EG R2=96
    nrpn(0, 67, 41),   // EG R3=32
    nrpn(0, 68, 38),   // EG R4=30
    nrpn(0, 69, 127),  // Level=99
    nrpn(0, 70, 54),   // Key Vel=3
    nrpn(0, 71, 0),    // A Mod Sens=0
    nrpn(0, 72, 109),  // Rate Scaling=6
    nrpn(0, 73, 0),    // Breakpoint=A-1
    nrpn(0, 74, 0),    // L Depth=0
    nrpn(0, 75, 0),    // R Depth=0
    nrpn(0, 76, 0),    // L Curve=0
    nrpn(0, 77, 0),    // R Curve=0

    // --- Op4 (Modulator, ratio 5:1) ---
    nrpn(0, 78, 64),   // Detune=0
    nrpn(0, 79, 20),   // Coarse=5
    nrpn(0, 80, 0),    // Fine=0
    nrpn(0, 81, 115),  // EG L1=90
    nrpn(0, 82, 38),   // EG L2=30
    nrpn(0, 83, 0),    // EG L3=0
    nrpn(0, 84, 0),    // EG L4=0
    nrpn(0, 85, 115),  // EG R1=90
    nrpn(0, 86, 54),   // EG R2=42
    nrpn(0, 87, 9),    // EG R3=7
    nrpn(0, 88, 71),   // EG R4=55
    nrpn(0, 89, 119),  // Level=93
    nrpn(0, 90, 91),   // Key Vel=5
    nrpn(0, 91, 0),    // A Mod Sens=0
    nrpn(0, 92, 91),   // Rate Scaling=5
    nrpn(0, 93, 0),    // Breakpoint=A-1
    nrpn(0, 94, 0),    // L Depth=0
    nrpn(0, 95, 0),    // R Depth=0
    nrpn(0, 96, 0),    // L Curve=0
    nrpn(0, 97, 0),    // R Curve=0

    // --- Op5 (Carrier, ratio 0.5:1) ---
    nrpn(0, 98, 64),   // Detune=0
    nrpn(0, 99, 0),    // Coarse=0 (ratio 0.5)
    nrpn(0, 100, 0),   // Fine=0
    nrpn(0, 101, 127), // EG L1=99
    nrpn(0, 102, 0),   // EG L2=0
    nrpn(0, 103, 0),   // EG L3=0
    nrpn(0, 104, 0),   // EG L4=0
    nrpn(0, 105, 127), // EG R1=99
    nrpn(0, 106, 0),   // EG R2=0
    nrpn(0, 107, 0),   // EG R3=0
    nrpn(0, 108, 0),   // EG R4=0
    nrpn(0, 109, 80),  // Level=62
    nrpn(0, 110, 54),  // Key Vel=3
    nrpn(0, 111, 0),   // A Mod Sens=0
    nrpn(0, 112, 127), // Rate Scaling=7
    nrpn(0, 113, 67),  // Breakpoint=C#4
    nrpn(0, 114, 96),  // L Depth=75
    nrpn(0, 115, 0),   // R Depth=0
    nrpn(0, 116, 0),   // L Curve=0
    nrpn(0, 117, 0),   // R Curve=0

    // --- Op6 (Feedback modulator, ratio 9:1) ---
    nrpn(0, 118, 64),  // Detune=0
    nrpn(0, 119, 37),  // Coarse=9
    nrpn(0, 120, 0),   // Fine=0
    nrpn(0, 121, 119), // EG L1=93
    nrpn(0, 122, 36),  // EG L2=28
    nrpn(0, 123, 0),   // EG L3=0
    nrpn(0, 124, 0),   // EG L4=0
    nrpn(0, 125, 121), // EG R1=94
    nrpn(0, 126, 72),  // EG R2=56
    nrpn(0, 127, 31),  // EG R3=24
    nrpn(0, 128, 71),  // EG R4=55
    nrpn(0, 129, 109), // Level=85
    nrpn(0, 130, 127), // Key Vel=7
    nrpn(0, 131, 0),   // A Mod Sens=0
    nrpn(0, 132, 18),  // Rate Scaling=1
    nrpn(0, 133, 0),   // Breakpoint=A-1
    nrpn(0, 134, 0),   // L Depth=0
    nrpn(0, 135, 0),   // R Depth=0
    nrpn(0, 136, 0),   // L Curve=0
    nrpn(0, 137, 0),   // R Curve=0
]);

// Channel 2: STRINGS 1 (DX7 ROM1A) — Algorithm 2
createTrack(2).play([
    // --- Global / LFO ---
    nrpn(0, 0, 127),   // Feedback=7
    nrpn(0, 1, 64),    // Transpose=0
    nrpn(0, 2, 127),   // Osc Key Sync=1
    nrpn(0, 3, 64),    // Pitch EG L1=50
    nrpn(0, 4, 64),    // Pitch EG L2=50
    nrpn(0, 5, 64),    // Pitch EG L3=50
    nrpn(0, 6, 64),    // Pitch EG L4=50
    nrpn(0, 7, 121),   // Pitch EG R1=94
    nrpn(0, 8, 86),    // Pitch EG R2=67
    nrpn(0, 9, 122),   // Pitch EG R3=95
    nrpn(0, 10, 77),   // Pitch EG R4=60
    nrpn(0, 11, 0),    // LFO Wave=Triangle
    nrpn(0, 12, 38),   // LFO Speed=30
    nrpn(0, 13, 0),    // LFO Delay=0
    nrpn(0, 14, 10),   // PMD=8 (vibrato)
    nrpn(0, 15, 0),    // AMD=0
    nrpn(0, 16, 0),    // LFO Sync=0
    nrpn(0, 17, 36),   // P Mod Sens=2

    // --- Op1 (Carrier, ratio 1:1) ---
    nrpn(0, 18, 64),   // Detune=0
    nrpn(0, 19, 4),    // Coarse=1
    nrpn(0, 20, 0),    // Fine=0
    nrpn(0, 21, 127),  // EG L1=99
    nrpn(0, 22, 109),  // EG L2=85
    nrpn(0, 23, 90),   // EG L3=70
    nrpn(0, 24, 0),    // EG L4=0
    nrpn(0, 25, 58),   // EG R1=45 (slow attack)
    nrpn(0, 26, 31),   // EG R2=24
    nrpn(0, 27, 26),   // EG R3=20
    nrpn(0, 28, 53),   // EG R4=41
    nrpn(0, 29, 127),  // Level=99
    nrpn(0, 30, 54),   // Key Vel=3
    nrpn(0, 31, 0),    // A Mod Sens=0
    nrpn(0, 32, 36),   // Rate Scaling=2
    nrpn(0, 33, 0),    // Breakpoint=A-1
    nrpn(0, 34, 0),    // L Depth=0
    nrpn(0, 35, 0),    // R Depth=0
    nrpn(0, 36, 0),    // L Curve=0
    nrpn(0, 37, 0),    // R Curve=0

    // --- Op2 (Modulator for Op1, ratio 1:1) ---
    nrpn(0, 38, 64),   // Detune=0
    nrpn(0, 39, 4),    // Coarse=1
    nrpn(0, 40, 0),    // Fine=0
    nrpn(0, 41, 105),  // EG L1=82
    nrpn(0, 42, 118),  // EG L2=92
    nrpn(0, 43, 80),   // EG L3=62
    nrpn(0, 44, 0),    // EG L4=0
    nrpn(0, 45, 96),   // EG R1=75
    nrpn(0, 46, 91),   // EG R2=71
    nrpn(0, 47, 22),   // EG R3=17
    nrpn(0, 48, 63),   // EG R4=49
    nrpn(0, 49, 106),  // Level=83
    nrpn(0, 50, 0),    // Key Vel=0
    nrpn(0, 51, 0),    // A Mod Sens=0
    nrpn(0, 52, 18),   // Rate Scaling=1
    nrpn(0, 53, 69),   // Breakpoint=D#4
    nrpn(0, 54, 0),    // L Depth=0
    nrpn(0, 55, 0),    // R Depth=0
    nrpn(0, 56, 0),    // L Curve=0
    nrpn(0, 57, 0),    // R Curve=0

    // --- Op3 (Carrier, ratio 1:1) ---
    nrpn(0, 58, 64),   // Detune=0
    nrpn(0, 59, 4),    // Coarse=1
    nrpn(0, 60, 0),    // Fine=0
    nrpn(0, 61, 127),  // EG L1=99
    nrpn(0, 62, 109),  // EG L2=85
    nrpn(0, 63, 105),  // EG L3=82
    nrpn(0, 64, 0),    // EG L4=0
    nrpn(0, 65, 56),   // EG R1=44
    nrpn(0, 66, 58),   // EG R2=45
    nrpn(0, 67, 26),   // EG R3=20
    nrpn(0, 68, 69),   // EG R4=54
    nrpn(0, 69, 110),  // Level=86
    nrpn(0, 70, 127),  // Key Vel=7
    nrpn(0, 71, 0),    // A Mod Sens=0
    nrpn(0, 72, 0),    // Rate Scaling=0
    nrpn(0, 73, 72),   // Breakpoint=F4
    nrpn(0, 74, 0),    // L Depth=0
    nrpn(0, 75, 124),  // R Depth=97
    nrpn(0, 76, 0),    // L Curve=0
    nrpn(0, 77, 0),    // R Curve=0

    // --- Op4 (Modulator for Op3, ratio 1:1) ---
    nrpn(0, 78, 64),   // Detune=0
    nrpn(0, 79, 4),    // Coarse=1
    nrpn(0, 80, 0),    // Fine=0
    nrpn(0, 81, 127),  // EG L1=99
    nrpn(0, 82, 118),  // EG L2=92
    nrpn(0, 83, 110),  // EG L3=86
    nrpn(0, 84, 0),    // EG L4=0
    nrpn(0, 85, 123),  // EG R1=96
    nrpn(0, 86, 24),   // EG R2=19
    nrpn(0, 87, 26),   // EG R3=20
    nrpn(0, 88, 69),   // EG R4=54
    nrpn(0, 89, 99),   // Level=77
    nrpn(0, 90, 36),   // Key Vel=2
    nrpn(0, 91, 0),    // A Mod Sens=0
    nrpn(0, 92, 36),   // Rate Scaling=2
    nrpn(0, 93, 0),    // Breakpoint=A-1
    nrpn(0, 94, 0),    // L Depth=0
    nrpn(0, 95, 0),    // R Depth=0
    nrpn(0, 96, 0),    // L Curve=0
    nrpn(0, 97, 0),    // R Curve=0

    // --- Op5 (Modulator, ratio 3:1) ---
    nrpn(0, 98, 64),   // Detune=0
    nrpn(0, 99, 12),   // Coarse=3
    nrpn(0, 100, 0),   // Fine=0
    nrpn(0, 101, 110), // EG L1=86
    nrpn(0, 102, 118), // EG L2=92
    nrpn(0, 103, 110), // EG L3=86
    nrpn(0, 104, 0),   // EG L4=0
    nrpn(0, 105, 68),  // EG R1=53
    nrpn(0, 106, 24),  // EG R2=19
    nrpn(0, 107, 26),  // EG R3=20
    nrpn(0, 108, 69),  // EG R4=54
    nrpn(0, 109, 108), // Level=84
    nrpn(0, 110, 36),  // Key Vel=2
    nrpn(0, 111, 0),   // A Mod Sens=0
    nrpn(0, 112, 36),  // Rate Scaling=2
    nrpn(0, 113, 0),   // Breakpoint=A-1
    nrpn(0, 114, 0),   // L Depth=0
    nrpn(0, 115, 0),   // R Depth=0
    nrpn(0, 116, 0),   // L Curve=0
    nrpn(0, 117, 0),   // R Curve=0

    // --- Op6 (Feedback modulator, ratio 14:1) ---
    nrpn(0, 118, 64),  // Detune=0
    nrpn(0, 119, 57),  // Coarse=14
    nrpn(0, 120, 0),   // Fine=0
    nrpn(0, 121, 127), // EG L1=99
    nrpn(0, 122, 118), // EG L2=92
    nrpn(0, 123, 110), // EG L3=86
    nrpn(0, 124, 0),   // EG L4=0
    nrpn(0, 125, 68),  // EG R1=53
    nrpn(0, 126, 24),  // EG R2=19
    nrpn(0, 127, 26),  // EG R3=20
    nrpn(0, 128, 69),  // EG R4=54
    nrpn(0, 129, 68),  // Level=53
    nrpn(0, 130, 36),  // Key Vel=2
    nrpn(0, 131, 0),   // A Mod Sens=0
    nrpn(0, 132, 36),  // Rate Scaling=2
    nrpn(0, 133, 0),   // Breakpoint=A-1
    nrpn(0, 134, 0),   // L Depth=0
    nrpn(0, 135, 0),   // R Depth=0
    nrpn(0, 136, 0),   // L Curve=0
    nrpn(0, 137, 0),   // R Curve=0
]);

// Channel 3: TUB BELLS (DX7 ROM1A) — Algorithm 5
// [Op2]→[Op1]→out, [Op4]→[Op3]→out, [Op6(fb)]→[Op5]→out
createTrack(3).play([
    // --- Global / LFO ---
    nrpn(0, 0, 127),   // Feedback=7
    nrpn(0, 1, 64),    // Transpose=0
    nrpn(0, 2, 0),     // Osc Key Sync=0
    nrpn(0, 3, 64),    // Pitch EG L1=50
    nrpn(0, 4, 64),    // Pitch EG L2=50
    nrpn(0, 5, 64),    // Pitch EG L3=50
    nrpn(0, 6, 64),    // Pitch EG L4=50
    nrpn(0, 7, 86),    // Pitch EG R1=67
    nrpn(0, 8, 122),   // Pitch EG R2=95
    nrpn(0, 9, 122),   // Pitch EG R3=95
    nrpn(0, 10, 77),   // Pitch EG R4=60
    nrpn(0, 11, 25),   // LFO Wave=Saw Down
    nrpn(0, 12, 45),   // LFO Speed=35
    nrpn(0, 13, 0),    // LFO Delay=0
    nrpn(0, 14, 0),    // PMD=0
    nrpn(0, 15, 0),    // AMD=0
    nrpn(0, 16, 0),    // LFO Sync=0
    nrpn(0, 17, 18),   // P Mod Sens=1

    // --- Op1 (Carrier, ratio 1:1) ---
    nrpn(0, 18, 82),   // Detune=+2
    nrpn(0, 19, 4),    // Coarse=1
    nrpn(0, 20, 0),    // Fine=0
    nrpn(0, 21, 127),  // EG L1=99
    nrpn(0, 22, 0),    // EG L2=0
    nrpn(0, 23, 41),   // EG L3=32
    nrpn(0, 24, 0),    // EG L4=0
    nrpn(0, 25, 122),  // EG R1=95
    nrpn(0, 26, 42),   // EG R2=33
    nrpn(0, 27, 91),   // EG R3=71
    nrpn(0, 28, 32),   // EG R4=25
    nrpn(0, 29, 122),  // Level=95
    nrpn(0, 30, 0),    // Key Vel=0
    nrpn(0, 31, 0),    // A Mod Sens=0
    nrpn(0, 32, 36),   // Rate Scaling=2
    nrpn(0, 33, 0),    // Breakpoint=A-1
    nrpn(0, 34, 0),    // L Depth=0
    nrpn(0, 35, 0),    // R Depth=0
    nrpn(0, 36, 0),    // L Curve=0
    nrpn(0, 37, 0),    // R Curve=0

    // --- Op2 (Modulator for Op1, ratio 2.75:1 - inharmonic) ---
    nrpn(0, 38, 91),   // Detune=+3
    nrpn(0, 39, 8),    // Coarse=2
    nrpn(0, 40, 96),   // Fine=75
    nrpn(0, 41, 127),  // EG L1=99
    nrpn(0, 42, 0),    // EG L2=0
    nrpn(0, 43, 41),   // EG L3=32
    nrpn(0, 44, 0),    // EG L4=0
    nrpn(0, 45, 126),  // EG R1=98
    nrpn(0, 46, 15),   // EG R2=12
    nrpn(0, 47, 91),   // EG R3=71
    nrpn(0, 48, 36),   // EG R4=28
    nrpn(0, 49, 100),  // Level=78
    nrpn(0, 50, 0),    // Key Vel=0
    nrpn(0, 51, 0),    // A Mod Sens=0
    nrpn(0, 52, 36),   // Rate Scaling=2
    nrpn(0, 53, 0),    // Breakpoint=A-1
    nrpn(0, 54, 0),    // L Depth=0
    nrpn(0, 55, 0),    // R Depth=0
    nrpn(0, 56, 0),    // L Curve=0
    nrpn(0, 57, 0),    // R Curve=0

    // --- Op3 (Carrier, ratio 1:1) ---
    nrpn(0, 58, 18),   // Detune=-5
    nrpn(0, 59, 4),    // Coarse=1
    nrpn(0, 60, 0),    // Fine=0
    nrpn(0, 61, 127),  // EG L1=99
    nrpn(0, 62, 0),    // EG L2=0
    nrpn(0, 63, 41),   // EG L3=32
    nrpn(0, 64, 0),    // EG L4=0
    nrpn(0, 65, 122),  // EG R1=95
    nrpn(0, 66, 42),   // EG R2=33
    nrpn(0, 67, 91),   // EG R3=71
    nrpn(0, 68, 32),   // EG R4=25
    nrpn(0, 69, 127),  // Level=99
    nrpn(0, 70, 0),    // Key Vel=0
    nrpn(0, 71, 0),    // A Mod Sens=0
    nrpn(0, 72, 36),   // Rate Scaling=2
    nrpn(0, 73, 0),    // Breakpoint=A-1
    nrpn(0, 74, 0),    // L Depth=0
    nrpn(0, 75, 0),    // R Depth=0
    nrpn(0, 76, 0),    // L Curve=0
    nrpn(0, 77, 0),    // R Curve=0

    // --- Op4 (Modulator for Op3, ratio 2.75:1 - inharmonic) ---
    nrpn(0, 78, 45),   // Detune=-2
    nrpn(0, 79, 8),    // Coarse=2
    nrpn(0, 80, 96),   // Fine=75
    nrpn(0, 81, 127),  // EG L1=99
    nrpn(0, 82, 0),    // EG L2=0
    nrpn(0, 83, 41),   // EG L3=32
    nrpn(0, 84, 0),    // EG L4=0
    nrpn(0, 85, 126),  // EG R1=98
    nrpn(0, 86, 15),   // EG R2=12
    nrpn(0, 87, 91),   // EG R3=71
    nrpn(0, 88, 36),   // EG R4=28
    nrpn(0, 89, 96),   // Level=75
    nrpn(0, 90, 0),    // Key Vel=0
    nrpn(0, 91, 0),    // A Mod Sens=0
    nrpn(0, 92, 36),   // Rate Scaling=2
    nrpn(0, 93, 0),    // Breakpoint=A-1
    nrpn(0, 94, 0),    // L Depth=0
    nrpn(0, 95, 0),    // R Depth=0
    nrpn(0, 96, 0),    // L Curve=0
    nrpn(0, 97, 0),    // R Curve=0

    // --- Op5 (Carrier, ratio ~2.51 - shimmer) ---
    nrpn(0, 98, 64),   // Detune=0
    nrpn(0, 99, 8),    // Coarse=2
    nrpn(0, 100, 65),  // Fine=51
    nrpn(0, 101, 127), // EG L1=99
    nrpn(0, 102, 0),   // EG L2=0
    nrpn(0, 103, 0),   // EG L3=0
    nrpn(0, 104, 0),   // EG L4=0
    nrpn(0, 105, 97),  // EG R1=76
    nrpn(0, 106, 100), // EG R2=78
    nrpn(0, 107, 91),  // EG R3=71
    nrpn(0, 108, 90),  // EG R4=70
    nrpn(0, 109, 127), // Level=99
    nrpn(0, 110, 91),  // Key Vel=5
    nrpn(0, 111, 0),   // A Mod Sens=0
    nrpn(0, 112, 36),  // Rate Scaling=2
    nrpn(0, 113, 0),   // Breakpoint=A-1
    nrpn(0, 114, 0),   // L Depth=0
    nrpn(0, 115, 0),   // R Depth=0
    nrpn(0, 116, 0),   // L Curve=0
    nrpn(0, 117, 0),   // R Curve=0

    // --- Op6 (Feedback modulator, ratio 2:1) ---
    nrpn(0, 118, 0),   // Detune=-7
    nrpn(0, 119, 8),   // Coarse=2
    nrpn(0, 120, 0),   // Fine=0
    nrpn(0, 121, 127), // EG L1=99
    nrpn(0, 122, 0),   // EG L2=0
    nrpn(0, 123, 0),   // EG L3=0
    nrpn(0, 124, 0),   // EG L4=0
    nrpn(0, 125, 126), // EG R1=98
    nrpn(0, 126, 117), // EG R2=91
    nrpn(0, 127, 0),   // EG R3=0
    nrpn(0, 128, 36),  // EG R4=28
    nrpn(0, 129, 109), // Level=85
    nrpn(0, 130, 0),   // Key Vel=0
    nrpn(0, 131, 0),   // A Mod Sens=0
    nrpn(0, 132, 36),  // Rate Scaling=2
    nrpn(0, 133, 0),   // Breakpoint=A-1
    nrpn(0, 134, 0),   // L Depth=0
    nrpn(0, 135, 0),   // R Depth=0
    nrpn(0, 136, 0),   // L Curve=0
    nrpn(0, 137, 0),   // R Curve=0
]);

// Channel 4: DX7 Drum Kit — Kick (NRPN 0–137), Snare (NRPN 138–275), Hat (NRPN 276–413)
// Notes: c2=kick, d2=snare, fs3=hat
createTrack(4).play([
    // ========== Kick: Beefkick (Coffeeshopped) — Algorithm 17, NRPN 0–137 ==========
    // --- Global / LFO ---
    nrpn(0, 0, 73),    // Feedback=4
    nrpn(0, 1, 64),    // Transpose=0
    nrpn(0, 2, 127),   // Osc Key Sync=1
    nrpn(0, 3, 127),   // Pitch EG L1=99
    nrpn(0, 4, 127),   // Pitch EG L2=99
    nrpn(0, 5, 64),    // Pitch EG L3=50
    nrpn(0, 6, 64),    // Pitch EG L4=50
    nrpn(0, 7, 127),   // Pitch EG R1=99
    nrpn(0, 8, 127),   // Pitch EG R2=99
    nrpn(0, 9, 13),    // Pitch EG R3=10
    nrpn(0, 10, 13),   // Pitch EG R4=10
    nrpn(0, 11, 102),  // LFO Wave=Sine
    nrpn(0, 12, 44),   // LFO Speed=34
    nrpn(0, 13, 42),   // LFO Delay=33
    nrpn(0, 14, 0),    // PMD=0
    nrpn(0, 15, 0),    // AMD=0
    nrpn(0, 16, 127),  // LFO Sync=1
    nrpn(0, 17, 54),   // P Mod Sens=3

    // --- Op1 (fixed) ---
    nrpn(0, 18, 64),   // Detune=0
    nrpn(0, 19, 20),   // Coarse=5
    nrpn(0, 20, 86),   // Fine=67
    nrpn(0, 21, 127),  // EG L1=99
    nrpn(0, 22, 0),    // EG L2=0
    nrpn(0, 23, 0),    // EG L3=0
    nrpn(0, 24, 0),    // EG L4=0
    nrpn(0, 25, 127),  // EG R1=99
    nrpn(0, 26, 64),   // EG R2=50
    nrpn(0, 27, 0),    // EG R3=0
    nrpn(0, 28, 74),   // EG R4=58
    nrpn(0, 29, 127),  // Level=99
    nrpn(0, 30, 54),   // Key Vel=3
    nrpn(0, 31, 0),    // A Mod Sens=0
    nrpn(0, 32, 0),    // Rate Scaling=0
    nrpn(0, 33, 0),    // Breakpoint=A-1
    nrpn(0, 34, 0),    // L Depth=0
    nrpn(0, 35, 0),    // R Depth=0
    nrpn(0, 36, 0),    // L Curve=0
    nrpn(0, 37, 0),    // R Curve=0

    // --- Op2 (fixed) ---
    nrpn(0, 38, 64),   // Detune=0
    nrpn(0, 39, 4),    // Coarse=1
    nrpn(0, 40, 86),   // Fine=67
    nrpn(0, 41, 127),  // EG L1=99
    nrpn(0, 42, 0),    // EG L2=0
    nrpn(0, 43, 0),    // EG L3=0
    nrpn(0, 44, 0),    // EG L4=0
    nrpn(0, 45, 126),  // EG R1=98
    nrpn(0, 46, 64),   // EG R2=50
    nrpn(0, 47, 0),    // EG R3=0
    nrpn(0, 48, 74),   // EG R4=58
    nrpn(0, 49, 81),   // Level=63
    nrpn(0, 50, 127),  // Key Vel=7
    nrpn(0, 51, 0),    // A Mod Sens=0
    nrpn(0, 52, 0),    // Rate Scaling=0
    nrpn(0, 53, 0),    // Breakpoint=A-1
    nrpn(0, 54, 0),    // L Depth=0
    nrpn(0, 55, 0),    // R Depth=0
    nrpn(0, 56, 0),    // L Curve=0
    nrpn(0, 57, 0),    // R Curve=0

    // --- Op3 (fixed) ---
    nrpn(0, 58, 64),   // Detune=0
    nrpn(0, 59, 4),    // Coarse=1
    nrpn(0, 60, 73),   // Fine=57
    nrpn(0, 61, 127),  // EG L1=99
    nrpn(0, 62, 0),    // EG L2=0
    nrpn(0, 63, 0),    // EG L3=0
    nrpn(0, 64, 0),    // EG L4=0
    nrpn(0, 65, 127),  // EG R1=99
    nrpn(0, 66, 89),   // EG R2=69
    nrpn(0, 67, 0),    // EG R3=0
    nrpn(0, 68, 74),   // EG R4=58
    nrpn(0, 69, 108),  // Level=84
    nrpn(0, 70, 127),  // Key Vel=7
    nrpn(0, 71, 0),    // A Mod Sens=0
    nrpn(0, 72, 0),    // Rate Scaling=0
    nrpn(0, 73, 0),    // Breakpoint=A-1
    nrpn(0, 74, 0),    // L Depth=0
    nrpn(0, 75, 0),    // R Depth=0
    nrpn(0, 76, 0),    // L Curve=0
    nrpn(0, 77, 0),    // R Curve=0

    // --- Op4 (ratio 2:1) ---
    nrpn(0, 78, 64),   // Detune=0
    nrpn(0, 79, 8),    // Coarse=2
    nrpn(0, 80, 0),    // Fine=0
    nrpn(0, 81, 127),  // EG L1=99
    nrpn(0, 82, 0),    // EG L2=0
    nrpn(0, 83, 0),    // EG L3=0
    nrpn(0, 84, 0),    // EG L4=0
    nrpn(0, 85, 127),  // EG R1=99
    nrpn(0, 86, 89),   // EG R2=69
    nrpn(0, 87, 55),   // EG R3=43
    nrpn(0, 88, 89),   // EG R4=69
    nrpn(0, 89, 0),    // Level=0
    nrpn(0, 90, 127),  // Key Vel=7
    nrpn(0, 91, 0),    // A Mod Sens=0
    nrpn(0, 92, 54),   // Rate Scaling=3
    nrpn(0, 93, 0),    // Breakpoint=A-1
    nrpn(0, 94, 0),    // L Depth=0
    nrpn(0, 95, 0),    // R Depth=0
    nrpn(0, 96, 0),    // L Curve=0
    nrpn(0, 97, 0),    // R Curve=0

    // --- Op5 (ratio 3:1) ---
    nrpn(0, 98, 91),   // Detune=+3
    nrpn(0, 99, 12),   // Coarse=3
    nrpn(0, 100, 0),   // Fine=0
    nrpn(0, 101, 127), // EG L1=99
    nrpn(0, 102, 65),  // EG L2=51
    nrpn(0, 103, 0),   // EG L3=0
    nrpn(0, 104, 0),   // EG L4=0
    nrpn(0, 105, 127), // EG R1=99
    nrpn(0, 106, 62),  // EG R2=48
    nrpn(0, 107, 59),  // EG R3=46
    nrpn(0, 108, 63),  // EG R4=49
    nrpn(0, 109, 0),   // Level=0
    nrpn(0, 110, 127), // Key Vel=7
    nrpn(0, 111, 0),   // A Mod Sens=0
    nrpn(0, 112, 127), // Rate Scaling=7
    nrpn(0, 113, 0),   // Breakpoint=A-1
    nrpn(0, 114, 0),   // L Depth=0
    nrpn(0, 115, 0),   // R Depth=0
    nrpn(0, 116, 0),   // L Curve=0
    nrpn(0, 117, 0),   // R Curve=0

    // --- Op6 (ratio 13:1) ---
    nrpn(0, 118, 0),   // Detune=-7
    nrpn(0, 119, 53),  // Coarse=13
    nrpn(0, 120, 65),  // Fine=51
    nrpn(0, 121, 127), // EG L1=99
    nrpn(0, 122, 0),   // EG L2=0
    nrpn(0, 123, 0),   // EG L3=0
    nrpn(0, 124, 0),   // EG L4=0
    nrpn(0, 125, 127), // EG R1=99
    nrpn(0, 126, 63),  // EG R2=49
    nrpn(0, 127, 26),  // EG R3=20
    nrpn(0, 128, 40),  // EG R4=31
    nrpn(0, 129, 127), // Level=99
    nrpn(0, 130, 127), // Key Vel=7
    nrpn(0, 131, 0),   // A Mod Sens=0
    nrpn(0, 132, 127), // Rate Scaling=7
    nrpn(0, 133, 5),   // Breakpoint=C#-1
    nrpn(0, 134, 0),   // L Depth=0
    nrpn(0, 135, 0),   // R Depth=0
    nrpn(0, 136, 42),  // L Curve=-EXP
    nrpn(0, 137, 0),   // R Curve=0

    // ========== Snare: MildSnare (Coffeeshopped) — Algorithm 21, NRPN 138–275 ==========
    // --- Snare Global / LFO ---
    nrpn(0, 138, 127),   // Feedback=7
    nrpn(0, 139, 64),    // Transpose=0
    nrpn(0, 140, 0),     // Osc Key Sync=0
    nrpn(0, 141, 64),    // Pitch EG L1=50
    nrpn(0, 142, 64),    // Pitch EG L2=50
    nrpn(0, 143, 64),    // Pitch EG L3=50
    nrpn(0, 144, 64),    // Pitch EG L4=50
    nrpn(0, 145, 121),   // Pitch EG R1=94
    nrpn(0, 146, 86),    // Pitch EG R2=67
    nrpn(0, 147, 122),   // Pitch EG R3=95
    nrpn(0, 148, 77),   // Pitch EG R4=60
    nrpn(0, 149, 102),  // LFO Wave=Sine
    nrpn(0, 150, 41),   // LFO Speed=32
    nrpn(0, 151, 42),   // LFO Delay=33
    nrpn(0, 152, 0),    // PMD=0
    nrpn(0, 153, 0),    // AMD=0
    nrpn(0, 154, 0),    // LFO Sync=0
    nrpn(0, 155, 54),   // P Mod Sens=3

    // --- Snare Op1 (ratio 0.5:1) ---
    nrpn(0, 156, 0),    // Detune=-7
    nrpn(0, 157, 0),    // Coarse=0
    nrpn(0, 158, 0),    // Fine=0
    nrpn(0, 159, 127),  // EG L1=99
    nrpn(0, 160, 0),    // EG L2=0
    nrpn(0, 161, 0),    // EG L3=0
    nrpn(0, 162, 0),    // EG L4=0
    nrpn(0, 163, 122),  // EG R1=95
    nrpn(0, 164, 82),   // EG R2=64
    nrpn(0, 165, 26),   // EG R3=20
    nrpn(0, 166, 77),   // EG R4=60
    nrpn(0, 167, 115),  // Level=90
    nrpn(0, 168, 0),    // Key Vel=0
    nrpn(0, 169, 0),    // A Mod Sens=0
    nrpn(0, 170, 54),   // Rate Scaling=3
    nrpn(0, 171, 0),    // Breakpoint=A-1
    nrpn(0, 172, 0),    // L Depth=0
    nrpn(0, 173, 0),    // R Depth=0
    nrpn(0, 174, 0),    // L Curve=0
    nrpn(0, 175, 0),    // R Curve=0

    // --- Snare Op2 (ratio 23:1) ---
    nrpn(0, 176, 64),   // Detune=0
    nrpn(0, 177, 94),   // Coarse=23
    nrpn(0, 178, 3),    // Fine=2
    nrpn(0, 179, 127),  // EG L1=99
    nrpn(0, 180, 0),    // EG L2=0
    nrpn(0, 181, 0),    // EG L3=0
    nrpn(0, 182, 0),    // EG L4=0
    nrpn(0, 183, 122),  // EG R1=95
    nrpn(0, 184, 82),   // EG R2=64
    nrpn(0, 185, 26),   // EG R3=20
    nrpn(0, 186, 81),   // EG R4=63
    nrpn(0, 187, 76),   // Level=59
    nrpn(0, 188, 0),    // Key Vel=0
    nrpn(0, 189, 0),    // A Mod Sens=0
    nrpn(0, 190, 54),   // Rate Scaling=3
    nrpn(0, 191, 0),    // Breakpoint=A-1
    nrpn(0, 192, 0),    // L Depth=0
    nrpn(0, 193, 0),    // R Depth=0
    nrpn(0, 194, 0),    // L Curve=0
    nrpn(0, 195, 0),    // R Curve=0

    // --- Snare Op3 (ratio 0.5:1) ---
    nrpn(0, 196, 127),  // Detune=+7
    nrpn(0, 197, 0),    // Coarse=0
    nrpn(0, 198, 26),   // Fine=20
    nrpn(0, 199, 127),  // EG L1=99
    nrpn(0, 200, 127),  // EG L2=99
    nrpn(0, 201, 127),  // EG L3=99
    nrpn(0, 202, 127),  // EG L4=99
    nrpn(0, 203, 127),  // EG R1=99
    nrpn(0, 204, 26),   // EG R2=20
    nrpn(0, 205, 26),   // EG R3=20
    nrpn(0, 206, 127),  // EG R4=99
    nrpn(0, 207, 126),  // Level=98
    nrpn(0, 208, 18),   // Key Vel=1
    nrpn(0, 209, 0),    // A Mod Sens=0
    nrpn(0, 210, 0),    // Rate Scaling=0
    nrpn(0, 211, 0),    // Breakpoint=A-1
    nrpn(0, 212, 0),    // L Depth=0
    nrpn(0, 213, 0),    // R Depth=0
    nrpn(0, 214, 0),    // L Curve=0
    nrpn(0, 215, 0),    // R Curve=0

    // --- Snare Op4 (fixed, coarse 14) ---
    nrpn(0, 216, 64),   // Detune=0
    nrpn(0, 217, 57),   // Coarse=14
    nrpn(0, 218, 28),   // Fine=22
    nrpn(0, 219, 127),  // EG L1=99
    nrpn(0, 220, 0),    // EG L2=0
    nrpn(0, 221, 0),    // EG L3=0
    nrpn(0, 222, 0),    // EG L4=0
    nrpn(0, 223, 122),  // EG R1=95
    nrpn(0, 224, 76),   // EG R2=59
    nrpn(0, 225, 26),   // EG R3=20
    nrpn(0, 226, 73),   // EG R4=57
    nrpn(0, 227, 127),  // Level=99
    nrpn(0, 228, 36),   // Key Vel=2
    nrpn(0, 229, 0),    // A Mod Sens=0
    nrpn(0, 230, 54),   // Rate Scaling=3
    nrpn(0, 231, 0),    // Breakpoint=A-1
    nrpn(0, 232, 0),    // L Depth=0
    nrpn(0, 233, 0),    // R Depth=0
    nrpn(0, 234, 0),    // L Curve=0
    nrpn(0, 235, 0),    // R Curve=0

    // --- Snare Op5 (fixed, coarse 2) ---
    nrpn(0, 236, 91),   // Detune=+3
    nrpn(0, 237, 8),    // Coarse=2
    nrpn(0, 238, 60),  // Fine=47
    nrpn(0, 239, 127), // EG L1=99
    nrpn(0, 240, 0),   // EG L2=0
    nrpn(0, 241, 0),   // EG L3=0
    nrpn(0, 242, 0),   // EG L4=0
    nrpn(0, 243, 122), // EG R1=95
    nrpn(0, 244, 76),  // EG R2=59
    nrpn(0, 245, 26),  // EG R3=20
    nrpn(0, 246, 76),  // EG R4=59
    nrpn(0, 247, 115), // Level=90
    nrpn(0, 248, 36),  // Key Vel=2
    nrpn(0, 249, 0),   // A Mod Sens=0
    nrpn(0, 250, 54),  // Rate Scaling=3
    nrpn(0, 251, 0),   // Breakpoint=A-1
    nrpn(0, 252, 0),   // L Depth=0
    nrpn(0, 253, 0),   // R Depth=0
    nrpn(0, 254, 0),   // L Curve=0
    nrpn(0, 255, 0),   // R Curve=0

    // --- Snare Op6 (ratio 12:1) ---
    nrpn(0, 256, 0),   // Detune=-7
    nrpn(0, 257, 49),  // Coarse=12
    nrpn(0, 258, 54),  // Fine=42
    nrpn(0, 259, 127), // EG L1=99
    nrpn(0, 260, 0),   // EG L2=0
    nrpn(0, 261, 0),   // EG L3=0
    nrpn(0, 262, 0),   // EG L4=0
    nrpn(0, 263, 122), // EG R1=95
    nrpn(0, 264, 99),  // EG R2=77
    nrpn(0, 265, 26),  // EG R3=20
    nrpn(0, 266, 127), // EG R4=99
    nrpn(0, 267, 41),  // Level=32
    nrpn(0, 268, 0),   // Key Vel=0
    nrpn(0, 269, 0),   // A Mod Sens=0
    nrpn(0, 270, 0),   // Rate Scaling=0
    nrpn(0, 271, 5),   // Breakpoint=C#-1
    nrpn(0, 272, 8),   // L Depth=6
    nrpn(0, 273, 44),  // R Depth=34
    nrpn(0, 274, 42),  // L Curve=-EXP
    nrpn(0, 275, 0),   // R Curve=0

    // ========== Hat: JunkHat (Coffeeshopped) — Algorithm 5, NRPN 276–413 ==========
    // --- Hat Global / LFO ---
    nrpn(0, 276, 127),   // Feedback=7
    nrpn(0, 277, 64),    // Transpose=0
    nrpn(0, 278, 127),   // Osc Key Sync=1
    nrpn(0, 279, 64),    // Pitch EG L1=50
    nrpn(0, 280, 64),    // Pitch EG L2=50
    nrpn(0, 281, 64),    // Pitch EG L3=50
    nrpn(0, 282, 64),    // Pitch EG L4=50
    nrpn(0, 283, 126),   // Pitch EG R1=98
    nrpn(0, 284, 126),   // Pitch EG R2=98
    nrpn(0, 285, 126),   // Pitch EG R3=98
    nrpn(0, 286, 126),  // Pitch EG R4=98
    nrpn(0, 287, 0),    // LFO Wave=Triangle
    nrpn(0, 288, 45),   // LFO Speed=35
    nrpn(0, 289, 0),    // LFO Delay=0
    nrpn(0, 290, 0),    // PMD=0
    nrpn(0, 291, 0),    // AMD=0
    nrpn(0, 292, 127),  // LFO Sync=1
    nrpn(0, 293, 54),   // P Mod Sens=3

    // --- Hat Op1 (fixed, coarse 31) ---
    nrpn(0, 294, 64),   // Detune=0
    nrpn(0, 295, 127),  // Coarse=31
    nrpn(0, 296, 49),   // Fine=38
    nrpn(0, 297, 127),  // EG L1=99
    nrpn(0, 298, 0),    // EG L2=0
    nrpn(0, 299, 0),    // EG L3=0
    nrpn(0, 300, 0),    // EG L4=0
    nrpn(0, 301, 127),  // EG R1=99
    nrpn(0, 302, 67),   // EG R2=52
    nrpn(0, 303, 127),  // EG R3=99
    nrpn(0, 304, 63),   // EG R4=49
    nrpn(0, 305, 119),  // Level=93
    nrpn(0, 306, 0),    // Key Vel=0
    nrpn(0, 307, 0),    // A Mod Sens=0
    nrpn(0, 308, 127),  // Rate Scaling=7
    nrpn(0, 309, 0),    // Breakpoint=A-1
    nrpn(0, 310, 0),    // L Depth=0
    nrpn(0, 311, 0),    // R Depth=0
    nrpn(0, 312, 0),    // L Curve=0
    nrpn(0, 313, 0),    // R Curve=0

    // --- Hat Op2 (fixed, coarse 31) ---
    nrpn(0, 314, 64),   // Detune=0
    nrpn(0, 315, 127),  // Coarse=31
    nrpn(0, 316, 119),  // Fine=93
    nrpn(0, 317, 127),  // EG L1=99
    nrpn(0, 318, 127),  // EG L2=99
    nrpn(0, 319, 127),  // EG L3=99
    nrpn(0, 320, 0),    // EG L4=0
    nrpn(0, 321, 127),  // EG R1=99
    nrpn(0, 322, 38),   // EG R2=30
    nrpn(0, 323, 127),  // EG R3=99
    nrpn(0, 324, 46),   // EG R4=36
    nrpn(0, 325, 127),  // Level=99
    nrpn(0, 326, 0),    // Key Vel=0
    nrpn(0, 327, 0),    // A Mod Sens=0
    nrpn(0, 328, 127),  // Rate Scaling=7
    nrpn(0, 329, 0),    // Breakpoint=A-1
    nrpn(0, 330, 0),    // L Depth=0
    nrpn(0, 331, 0),    // R Depth=0
    nrpn(0, 332, 0),    // L Curve=0
    nrpn(0, 333, 0),    // R Curve=0

    // --- Hat Op3 (fixed, coarse 31) ---
    nrpn(0, 334, 64),   // Detune=0
    nrpn(0, 335, 127),  // Coarse=31
    nrpn(0, 336, 27),   // Fine=21
    nrpn(0, 337, 127),  // EG L1=99
    nrpn(0, 338, 0),    // EG L2=0
    nrpn(0, 339, 0),    // EG L3=0
    nrpn(0, 340, 0),    // EG L4=0
    nrpn(0, 341, 127),  // EG R1=99
    nrpn(0, 342, 65),   // EG R2=51
    nrpn(0, 343, 127),  // EG R3=99
    nrpn(0, 344, 63),   // EG R4=49
    nrpn(0, 345, 117),  // Level=91
    nrpn(0, 346, 0),    // Key Vel=0
    nrpn(0, 347, 0),    // A Mod Sens=0
    nrpn(0, 348, 127),  // Rate Scaling=7
    nrpn(0, 349, 0),    // Breakpoint=A-1
    nrpn(0, 350, 0),    // L Depth=0
    nrpn(0, 351, 0),    // R Depth=0
    nrpn(0, 352, 0),    // L Curve=0
    nrpn(0, 353, 0),    // R Curve=0

    // --- Hat Op4 (fixed, coarse 31) ---
    nrpn(0, 354, 64),   // Detune=0
    nrpn(0, 355, 127),  // Coarse=31
    nrpn(0, 356, 127),  // Fine=99
    nrpn(0, 357, 127),  // EG L1=99
    nrpn(0, 358, 127),  // EG L2=99
    nrpn(0, 359, 127),  // EG L3=99
    nrpn(0, 360, 0),    // EG L4=0
    nrpn(0, 361, 127),  // EG R1=99
    nrpn(0, 362, 38),   // EG R2=30
    nrpn(0, 363, 127),  // EG R3=99
    nrpn(0, 364, 46),   // EG R4=36
    nrpn(0, 365, 127),  // Level=99
    nrpn(0, 366, 0),    // Key Vel=0
    nrpn(0, 367, 0),    // A Mod Sens=0
    nrpn(0, 368, 127),  // Rate Scaling=7
    nrpn(0, 369, 0),    // Breakpoint=A-1
    nrpn(0, 370, 0),    // L Depth=0
    nrpn(0, 371, 0),    // R Depth=0
    nrpn(0, 372, 0),    // L Curve=0
    nrpn(0, 373, 0),    // R Curve=0

    // --- Hat Op5 (fixed, coarse 31) ---
    nrpn(0, 374, 64),   // Detune=0
    nrpn(0, 375, 127),  // Coarse=31
    nrpn(0, 376, 122), // Fine=95
    nrpn(0, 377, 127), // EG L1=99
    nrpn(0, 378, 0),   // EG L2=0
    nrpn(0, 379, 0),   // EG L3=0
    nrpn(0, 380, 0),   // EG L4=0
    nrpn(0, 381, 127), // EG R1=99
    nrpn(0, 382, 69),  // EG R2=54
    nrpn(0, 383, 127), // EG R3=99
    nrpn(0, 384, 76),  // EG R4=59
    nrpn(0, 385, 127), // Level=99
    nrpn(0, 386, 0),   // Key Vel=0
    nrpn(0, 387, 0),   // A Mod Sens=0
    nrpn(0, 388, 127), // Rate Scaling=7
    nrpn(0, 389, 0),   // Breakpoint=A-1
    nrpn(0, 390, 0),   // L Depth=0
    nrpn(0, 391, 0),   // R Depth=0
    nrpn(0, 392, 0),   // L Curve=0
    nrpn(0, 393, 0),   // R Curve=0

    // --- Hat Op6 (fixed, coarse 31) ---
    nrpn(0, 394, 64),  // Detune=0
    nrpn(0, 395, 127), // Coarse=31
    nrpn(0, 396, 123), // Fine=96
    nrpn(0, 397, 127), // EG L1=99
    nrpn(0, 398, 127), // EG L2=99
    nrpn(0, 399, 127), // EG L3=99
    nrpn(0, 400, 0),   // EG L4=0
    nrpn(0, 401, 127), // EG R1=99
    nrpn(0, 402, 26),  // EG R2=20
    nrpn(0, 403, 26),  // EG R3=20
    nrpn(0, 404, 23),  // EG R4=18
    nrpn(0, 405, 127), // Level=99
    nrpn(0, 406, 0),   // Key Vel=0
    nrpn(0, 407, 0),   // A Mod Sens=0
    nrpn(0, 408, 127), // Rate Scaling=7
    nrpn(0, 409, 0),   // Breakpoint=A-1
    nrpn(0, 410, 0),   // L Depth=0
    nrpn(0, 411, 0),   // R Depth=0
    nrpn(0, 412, 0),   // L Curve=0
    nrpn(0, 413, 0),   // R Curve=0
]);


startRecording();
createTrack(0).play([[ 0.15, controlchange(64, 127) ],
[ 0.15, controlchange(64, 0) ],
[ 0.02, a4(0.82, 92) ],
[ 0.52, c5(0.44, 70) ],
[ 0.03, f3(0.95, 78) ],
[ 0.98, f5(0.49, 82) ],
[ 1.98, controlchange(64, 0) ],
[ 2.20, controlchange(64, 127) ],
[ 2.01, c3(0.94, 63) ],
[ 1.47, g4(1.50, 94) ],
[ 2.47, c5(0.52, 75) ],
[ 2.98, e5(0.42, 72) ],
[ 4.00, controlchange(64, 0) ],
[ 4.20, controlchange(64, 127) ],
[ 3.42, a4(1.15, 88) ],
[ 3.98, g3(1.03, 77) ],
[ 4.45, as4(0.56, 82) ],
[ 4.99, f5(0.51, 84) ],
[ 6.05, controlchange(64, 0) ],
[ 6.25, controlchange(64, 127) ],
[ 6.02, as2(1.49, 68) ],
[ 5.45, as4(2.10, 81) ],
[ 6.96, f5(0.62, 79) ],
[ 6.47, c5(1.11, 79) ]].quantize(4));

createTrack(2).play([[ 0.0, a5(1.78, 87) ],
[ 0.0, f5(1.86, 89) ],
[ 0.0, c5(3.48, 98) ],
[ 1.94, g5(1.76, 75) ],
[ 1.97, e5(1.75, 83) ],
[ 3.94, as4(3.99, 81) ],
[ 3.93, d5(4.02, 77) ],
[ 3.93, f5(4.03, 79) ]].quantize(4));


await createTrack(4).steps(1,[
  fs3,fs3,fs3,fs3,
  fs3,fs3,fs3,fs3
]);
stopRecording();
loopHere();
