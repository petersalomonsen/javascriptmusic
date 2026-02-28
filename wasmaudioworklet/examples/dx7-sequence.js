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



createTrack(0).play([

// E.PIANO 1 (DX7 ROM1A) — Algorithm 5
// [Op2]→[Op1]→out, [Op6(fb)]→[Op5]→[Op4]→[Op3]→out
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
await createTrack(0).steps(4,[,,,]);
loopHere();
