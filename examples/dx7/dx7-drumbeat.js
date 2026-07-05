/*
 * DX7 drum-kit beat — self-contained and ready to play.
 *
 * IMPORTANT: the DX7 drum patches (Beefkick / MildSnare / JunkHat) are programmed
 * by the NRPN block below. The synth bundle (dx7-synth.ts) only zeroes channel-4
 * defaults in initializeMidiSynth() — which sound like a plain sine — so this NRPN
 * block MUST stay in the song. To change the beat, edit setBPM and the steps()
 * pattern at the BOTTOM; leave the NRPN patch block untouched.
 *
 * Pairs with: examples/dx7/dx7-synth.ts  (load that as the synth).
 */

setBPM(90);

addInstrument('DX7 E.Piano');   // Channel 0 — Algorithm 5
addInstrument('DX7 Bass');      // Channel 1 — Algorithm 16
addInstrument('DX7 Strings');   // Channel 2 — Algorithm 2
addInstrument('DX7 Bells');     // Channel 3 — Algorithm 5
addInstrument('DX7 Drums');     // Channel 4 — Drum Kit (Kick=c3, Snare=d3, Hat=fs3)

// NRPN helper: sends CC 99 (MSB) + CC 98 (LSB) + CC 6 (value)
function nrpn(beat, param, value) {
    return [
      beat, controlchange(99, (param >> 7) & 127),
      beat, controlchange(98, param & 127),
      beat, controlchange(6, value),
     ];
}

// ===== Channel 4 drum-kit patch programming (Kick 0-143, Snare 144-287, Hat 288-431) =====
createTrack(4).play([
    // ========== Kick: Beefkick (Coffeeshopped) — Algorithm 17, NRPN 0–143 ==========
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
    nrpn(0, 30, 73),   // Key Vel=4
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

    // --- Kick Freq Mode (0=ratio, 1=fixed) ---
    nrpn(0, 138, 127), // Op1 Freq Mode=fixed
    nrpn(0, 139, 127), // Op2 Freq Mode=fixed
    nrpn(0, 140, 127), // Op3 Freq Mode=fixed
    nrpn(0, 141, 127), // Op4 Freq Mode=fixed
    nrpn(0, 142, 127), // Op5 Freq Mode=fixed
    nrpn(0, 143, 127), // Op6 Freq Mode=fixed

    // ========== Snare: MildSnare (Coffeeshopped) — Algorithm 21, NRPN 144–287 ==========
    // --- Snare Global / LFO ---
    nrpn(0, 144, 127),   // Feedback=7
    nrpn(0, 145, 64),    // Transpose=0
    nrpn(0, 146, 0),     // Osc Key Sync=0
    nrpn(0, 147, 64),    // Pitch EG L1=50
    nrpn(0, 148, 64),    // Pitch EG L2=50
    nrpn(0, 149, 64),    // Pitch EG L3=50
    nrpn(0, 150, 64),    // Pitch EG L4=50
    nrpn(0, 151, 121),   // Pitch EG R1=94
    nrpn(0, 152, 86),    // Pitch EG R2=67
    nrpn(0, 153, 122),   // Pitch EG R3=95
    nrpn(0, 154, 77),   // Pitch EG R4=60
    nrpn(0, 155, 102),  // LFO Wave=Sine
    nrpn(0, 156, 41),   // LFO Speed=32
    nrpn(0, 157, 42),   // LFO Delay=33
    nrpn(0, 158, 0),    // PMD=0
    nrpn(0, 159, 0),    // AMD=0
    nrpn(0, 160, 0),    // LFO Sync=0
    nrpn(0, 161, 54),   // P Mod Sens=3

    // --- Snare Op1 (ratio 0.5:1) ---
    nrpn(0, 162, 0),    // Detune=-7
    nrpn(0, 163, 0),    // Coarse=0
    nrpn(0, 164, 0),    // Fine=0
    nrpn(0, 165, 127),  // EG L1=99
    nrpn(0, 166, 0),    // EG L2=0
    nrpn(0, 167, 0),    // EG L3=0
    nrpn(0, 168, 0),    // EG L4=0
    nrpn(0, 169, 122),  // EG R1=95
    nrpn(0, 170, 82),   // EG R2=64
    nrpn(0, 171, 26),   // EG R3=20
    nrpn(0, 172, 77),   // EG R4=60
    nrpn(0, 173, 115),  // Level=90
    nrpn(0, 174, 73),   // Key Vel=4
    nrpn(0, 175, 0),    // A Mod Sens=0
    nrpn(0, 176, 54),   // Rate Scaling=3
    nrpn(0, 177, 0),    // Breakpoint=A-1
    nrpn(0, 178, 0),    // L Depth=0
    nrpn(0, 179, 0),    // R Depth=0
    nrpn(0, 180, 0),    // L Curve=0
    nrpn(0, 181, 0),    // R Curve=0

    // --- Snare Op2 (ratio 23:1) ---
    nrpn(0, 182, 64),   // Detune=0
    nrpn(0, 183, 94),   // Coarse=23
    nrpn(0, 184, 3),    // Fine=2
    nrpn(0, 185, 127),  // EG L1=99
    nrpn(0, 186, 0),    // EG L2=0
    nrpn(0, 187, 0),    // EG L3=0
    nrpn(0, 188, 0),    // EG L4=0
    nrpn(0, 189, 122),  // EG R1=95
    nrpn(0, 190, 82),   // EG R2=64
    nrpn(0, 191, 26),   // EG R3=20
    nrpn(0, 192, 81),   // EG R4=63
    nrpn(0, 193, 76),   // Level=59
    nrpn(0, 194, 73),   // Key Vel=4
    nrpn(0, 195, 0),    // A Mod Sens=0
    nrpn(0, 196, 54),   // Rate Scaling=3
    nrpn(0, 197, 0),    // Breakpoint=A-1
    nrpn(0, 198, 0),    // L Depth=0
    nrpn(0, 199, 0),    // R Depth=0
    nrpn(0, 200, 0),    // L Curve=0
    nrpn(0, 201, 0),    // R Curve=0

    // --- Snare Op3 (ratio 0.5:1) ---
    nrpn(0, 202, 127),  // Detune=+7
    nrpn(0, 203, 0),    // Coarse=0
    nrpn(0, 204, 26),   // Fine=20
    nrpn(0, 205, 127),  // EG L1=99
    nrpn(0, 206, 127),  // EG L2=99
    nrpn(0, 207, 127),  // EG L3=99
    nrpn(0, 208, 127),  // EG L4=99
    nrpn(0, 209, 127),  // EG R1=99
    nrpn(0, 210, 26),   // EG R2=20
    nrpn(0, 211, 26),   // EG R3=20
    nrpn(0, 212, 127),  // EG R4=99
    nrpn(0, 213, 126),  // Level=98
    nrpn(0, 214, 18),   // Key Vel=1
    nrpn(0, 215, 0),    // A Mod Sens=0
    nrpn(0, 216, 0),    // Rate Scaling=0
    nrpn(0, 217, 0),    // Breakpoint=A-1
    nrpn(0, 218, 0),    // L Depth=0
    nrpn(0, 219, 0),    // R Depth=0
    nrpn(0, 220, 0),    // L Curve=0
    nrpn(0, 221, 0),    // R Curve=0

    // --- Snare Op4 (fixed, coarse 14) ---
    nrpn(0, 222, 64),   // Detune=0
    nrpn(0, 223, 57),   // Coarse=14
    nrpn(0, 224, 28),   // Fine=22
    nrpn(0, 225, 127),  // EG L1=99
    nrpn(0, 226, 0),    // EG L2=0
    nrpn(0, 227, 0),    // EG L3=0
    nrpn(0, 228, 0),    // EG L4=0
    nrpn(0, 229, 122),  // EG R1=95
    nrpn(0, 230, 76),   // EG R2=59
    nrpn(0, 231, 26),   // EG R3=20
    nrpn(0, 232, 73),   // EG R4=57
    nrpn(0, 233, 127),  // Level=99
    nrpn(0, 234, 73),   // Key Vel=4
    nrpn(0, 235, 0),    // A Mod Sens=0
    nrpn(0, 236, 54),   // Rate Scaling=3
    nrpn(0, 237, 0),    // Breakpoint=A-1
    nrpn(0, 238, 0),    // L Depth=0
    nrpn(0, 239, 0),    // R Depth=0
    nrpn(0, 240, 0),    // L Curve=0
    nrpn(0, 241, 0),    // R Curve=0

    // --- Snare Op5 (fixed, coarse 2) ---
    nrpn(0, 242, 91),   // Detune=+3
    nrpn(0, 243, 8),    // Coarse=2
    nrpn(0, 244, 60),  // Fine=47
    nrpn(0, 245, 127), // EG L1=99
    nrpn(0, 246, 0),   // EG L2=0
    nrpn(0, 247, 0),   // EG L3=0
    nrpn(0, 248, 0),   // EG L4=0
    nrpn(0, 249, 122), // EG R1=95
    nrpn(0, 250, 76),  // EG R2=59
    nrpn(0, 251, 26),  // EG R3=20
    nrpn(0, 252, 76),  // EG R4=59
    nrpn(0, 253, 115), // Level=90
    nrpn(0, 254, 73),  // Key Vel=4
    nrpn(0, 255, 0),   // A Mod Sens=0
    nrpn(0, 256, 54),  // Rate Scaling=3
    nrpn(0, 257, 0),   // Breakpoint=A-1
    nrpn(0, 258, 0),   // L Depth=0
    nrpn(0, 259, 0),   // R Depth=0
    nrpn(0, 260, 0),   // L Curve=0
    nrpn(0, 261, 0),   // R Curve=0

    // --- Snare Op6 (ratio 12:1) ---
    nrpn(0, 262, 0),   // Detune=-7
    nrpn(0, 263, 49),  // Coarse=12
    nrpn(0, 264, 54),  // Fine=42
    nrpn(0, 265, 127), // EG L1=99
    nrpn(0, 266, 0),   // EG L2=0
    nrpn(0, 267, 0),   // EG L3=0
    nrpn(0, 268, 0),   // EG L4=0
    nrpn(0, 269, 122), // EG R1=95
    nrpn(0, 270, 99),  // EG R2=77
    nrpn(0, 271, 26),  // EG R3=20
    nrpn(0, 272, 127), // EG R4=99
    nrpn(0, 273, 41),  // Level=32
    nrpn(0, 274, 0),   // Key Vel=0
    nrpn(0, 275, 0),   // A Mod Sens=0
    nrpn(0, 276, 0),   // Rate Scaling=0
    nrpn(0, 277, 5),   // Breakpoint=C#-1
    nrpn(0, 278, 8),   // L Depth=6
    nrpn(0, 279, 44),  // R Depth=34
    nrpn(0, 280, 42),  // L Curve=-EXP
    nrpn(0, 281, 0),   // R Curve=0

    // --- Snare Freq Mode (0=ratio, 1=fixed) ---
    nrpn(0, 282, 127), // Op1 Freq Mode=fixed
    nrpn(0, 283, 127), // Op2 Freq Mode=fixed
    nrpn(0, 284, 127), // Op3 Freq Mode=fixed
    nrpn(0, 285, 127), // Op4 Freq Mode=fixed
    nrpn(0, 286, 127), // Op5 Freq Mode=fixed
    nrpn(0, 287, 127), // Op6 Freq Mode=fixed

    // ========== Hat: JunkHat (Coffeeshopped) — Algorithm 5, NRPN 288–431 ==========
    // --- Hat Global / LFO ---
    nrpn(0, 288, 127),   // Feedback=7
    nrpn(0, 289, 64),    // Transpose=0
    nrpn(0, 290, 127),   // Osc Key Sync=1
    nrpn(0, 291, 64),    // Pitch EG L1=50
    nrpn(0, 292, 64),    // Pitch EG L2=50
    nrpn(0, 293, 64),    // Pitch EG L3=50
    nrpn(0, 294, 64),    // Pitch EG L4=50
    nrpn(0, 295, 126),   // Pitch EG R1=98
    nrpn(0, 296, 126),   // Pitch EG R2=98
    nrpn(0, 297, 126),   // Pitch EG R3=98
    nrpn(0, 298, 126),  // Pitch EG R4=98
    nrpn(0, 299, 0),    // LFO Wave=Triangle
    nrpn(0, 300, 45),   // LFO Speed=35
    nrpn(0, 301, 0),    // LFO Delay=0
    nrpn(0, 302, 0),    // PMD=0
    nrpn(0, 303, 0),    // AMD=0
    nrpn(0, 304, 127),  // LFO Sync=1
    nrpn(0, 305, 54),   // P Mod Sens=3

    // --- Hat Op1 (fixed, coarse 31) ---
    nrpn(0, 306, 64),   // Detune=0
    nrpn(0, 307, 127),  // Coarse=31
    nrpn(0, 308, 49),   // Fine=38
    nrpn(0, 309, 127),  // EG L1=99
    nrpn(0, 310, 0),    // EG L2=0
    nrpn(0, 311, 0),    // EG L3=0
    nrpn(0, 312, 0),    // EG L4=0
    nrpn(0, 313, 127),  // EG R1=99
    nrpn(0, 314, 67),   // EG R2=52
    nrpn(0, 315, 127),  // EG R3=99
    nrpn(0, 316, 63),   // EG R4=49
    nrpn(0, 317, 119),  // Level=93
    nrpn(0, 318, 73),   // Key Vel=4
    nrpn(0, 319, 0),    // A Mod Sens=0
    nrpn(0, 320, 127),  // Rate Scaling=7
    nrpn(0, 321, 0),    // Breakpoint=A-1
    nrpn(0, 322, 0),    // L Depth=0
    nrpn(0, 323, 0),    // R Depth=0
    nrpn(0, 324, 0),    // L Curve=0
    nrpn(0, 325, 0),    // R Curve=0

    // --- Hat Op2 (fixed, coarse 31) ---
    nrpn(0, 326, 64),   // Detune=0
    nrpn(0, 327, 127),  // Coarse=31
    nrpn(0, 328, 119),  // Fine=93
    nrpn(0, 329, 127),  // EG L1=99
    nrpn(0, 330, 127),  // EG L2=99
    nrpn(0, 331, 127),  // EG L3=99
    nrpn(0, 332, 0),    // EG L4=0
    nrpn(0, 333, 127),  // EG R1=99
    nrpn(0, 334, 38),   // EG R2=30
    nrpn(0, 335, 127),  // EG R3=99
    nrpn(0, 336, 46),   // EG R4=36
    nrpn(0, 337, 127),  // Level=99
    nrpn(0, 338, 0),    // Key Vel=0
    nrpn(0, 339, 0),    // A Mod Sens=0
    nrpn(0, 340, 127),  // Rate Scaling=7
    nrpn(0, 341, 0),    // Breakpoint=A-1
    nrpn(0, 342, 0),    // L Depth=0
    nrpn(0, 343, 0),    // R Depth=0
    nrpn(0, 344, 0),    // L Curve=0
    nrpn(0, 345, 0),    // R Curve=0

    // --- Hat Op3 (fixed, coarse 31) ---
    nrpn(0, 346, 64),   // Detune=0
    nrpn(0, 347, 127),  // Coarse=31
    nrpn(0, 348, 27),   // Fine=21
    nrpn(0, 349, 127),  // EG L1=99
    nrpn(0, 350, 0),    // EG L2=0
    nrpn(0, 351, 0),    // EG L3=0
    nrpn(0, 352, 0),    // EG L4=0
    nrpn(0, 353, 127),  // EG R1=99
    nrpn(0, 354, 65),   // EG R2=51
    nrpn(0, 355, 127),  // EG R3=99
    nrpn(0, 356, 63),   // EG R4=49
    nrpn(0, 357, 117),  // Level=91
    nrpn(0, 358, 73),   // Key Vel=4
    nrpn(0, 359, 0),    // A Mod Sens=0
    nrpn(0, 360, 127),  // Rate Scaling=7
    nrpn(0, 361, 0),    // Breakpoint=A-1
    nrpn(0, 362, 0),    // L Depth=0
    nrpn(0, 363, 0),    // R Depth=0
    nrpn(0, 364, 0),    // L Curve=0
    nrpn(0, 365, 0),    // R Curve=0

    // --- Hat Op4 (fixed, coarse 31) ---
    nrpn(0, 366, 64),   // Detune=0
    nrpn(0, 367, 127),  // Coarse=31
    nrpn(0, 368, 127),  // Fine=99
    nrpn(0, 369, 127),  // EG L1=99
    nrpn(0, 370, 127),  // EG L2=99
    nrpn(0, 371, 127),  // EG L3=99
    nrpn(0, 372, 0),    // EG L4=0
    nrpn(0, 373, 127),  // EG R1=99
    nrpn(0, 374, 38),   // EG R2=30
    nrpn(0, 375, 127),  // EG R3=99
    nrpn(0, 376, 46),   // EG R4=36
    nrpn(0, 377, 127),  // Level=99
    nrpn(0, 378, 0),    // Key Vel=0
    nrpn(0, 379, 0),    // A Mod Sens=0
    nrpn(0, 380, 127),  // Rate Scaling=7
    nrpn(0, 381, 0),    // Breakpoint=A-1
    nrpn(0, 382, 0),    // L Depth=0
    nrpn(0, 383, 0),    // R Depth=0
    nrpn(0, 384, 0),    // L Curve=0
    nrpn(0, 385, 0),    // R Curve=0

    // --- Hat Op5 (fixed, coarse 31) ---
    nrpn(0, 386, 64),   // Detune=0
    nrpn(0, 387, 127),  // Coarse=31
    nrpn(0, 388, 122), // Fine=95
    nrpn(0, 389, 127), // EG L1=99
    nrpn(0, 390, 0),   // EG L2=0
    nrpn(0, 391, 0),   // EG L3=0
    nrpn(0, 392, 0),   // EG L4=0
    nrpn(0, 393, 127), // EG R1=99
    nrpn(0, 394, 69),  // EG R2=54
    nrpn(0, 395, 127), // EG R3=99
    nrpn(0, 396, 76),  // EG R4=59
    nrpn(0, 397, 127), // Level=99
    nrpn(0, 398, 73),  // Key Vel=4
    nrpn(0, 399, 0),   // A Mod Sens=0
    nrpn(0, 400, 127), // Rate Scaling=7
    nrpn(0, 401, 0),   // Breakpoint=A-1
    nrpn(0, 402, 0),   // L Depth=0
    nrpn(0, 403, 0),   // R Depth=0
    nrpn(0, 404, 0),   // L Curve=0
    nrpn(0, 405, 0),   // R Curve=0

    // --- Hat Op6 (fixed, coarse 31) ---
    nrpn(0, 406, 64),  // Detune=0
    nrpn(0, 407, 127), // Coarse=31
    nrpn(0, 408, 123), // Fine=96
    nrpn(0, 409, 127), // EG L1=99
    nrpn(0, 410, 127), // EG L2=99
    nrpn(0, 411, 127), // EG L3=99
    nrpn(0, 412, 0),   // EG L4=0
    nrpn(0, 413, 127), // EG R1=99
    nrpn(0, 414, 26),  // EG R2=20
    nrpn(0, 415, 26),  // EG R3=20
    nrpn(0, 416, 23),  // EG R4=18
    nrpn(0, 417, 127), // Level=99
    nrpn(0, 418, 0),   // Key Vel=0
    nrpn(0, 419, 0),   // A Mod Sens=0
    nrpn(0, 420, 127), // Rate Scaling=7
    nrpn(0, 421, 0),   // Breakpoint=A-1
    nrpn(0, 422, 0),   // L Depth=0
    nrpn(0, 423, 0),   // R Depth=0
    nrpn(0, 424, 0),   // L Curve=0
    nrpn(0, 425, 0),   // R Curve=0

    // --- Hat Freq Mode (0=ratio, 1=fixed) ---
    nrpn(0, 426, 127), // Op1 Freq Mode=fixed
    nrpn(0, 427, 127), // Op2 Freq Mode=fixed
    nrpn(0, 428, 127), // Op3 Freq Mode=fixed
    nrpn(0, 429, 127), // Op4 Freq Mode=fixed
    nrpn(0, 430, 127), // Op5 Freq Mode=fixed
    nrpn(0, 431, 127), // Op6 Freq Mode=fixed
]);

// ===== The beat — EDIT THIS PART =====
// channel 4 drum notes: c3 = kick, d3 = snare, fs3 = hi-hat
createTrack(4).steps(4, [
  c3, , , ,   d3, , , ,   , , c3, ,   d3, , , ,
  c3, , , ,   d3, , , ,   c3, , c3, , d3, , , ,
]);
await createTrack(4).steps(2, [
  fs3, fs3(0.1, 20), fs3, fs3(0.1, 20),
  fs3, fs3(0.1, 20), fs3, fs3(0.1, 20),
  fs3, fs3(0.1, 20), fs3, fs3(0.1, 20),
  fs3, fs3(0.1, 20), fs3, fs3(0.1, 20),
]);

loopHere();
