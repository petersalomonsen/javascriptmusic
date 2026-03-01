/*
 * Copyright (c) 2022 - Peter Johan Salomonsen
 */

setBPM(92);

addInstrument('DX7');

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

await createTrack(0).steps(4,[,,,]);
loopHere();
