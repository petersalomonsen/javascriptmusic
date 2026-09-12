#!/usr/bin/env node
// DX7 SysEx ROM parser — converts .syx patches into either a self-contained
// Faust instrument (recommended) or an NRPN sequence for the faust2as
// transpiled DX7 synth (legacy).
//
// Usage:
//   node parse-rom.js <file.syx>                    — list all 32 patches
//   node parse-rom.js <file.syx> <number>           — show patch N (1-32) as NRPN
//   node parse-rom.js <file.syx> <name>             — search by name
//   node parse-rom.js <file.syx> <number> --channel N  — output for channel N
//   node parse-rom.js <file.syx> <number|name> --dsp [--name <stem>]
//                                                   — print a self-contained .dsp
//
// As a module: `import { parseSyx, generateNRPN, generateDsp, ALGORITHM_ROUTINGS }`.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── DX7 value → MIDI 0-127 conversion ──────────────────────────

const r99  = v => Math.round(v / 99 * 127);
const r7   = v => Math.round(v / 7 * 127);
const r31  = v => Math.round(v / 31 * 127);
const r3   = v => Math.round(v / 3 * 127);
const r5   = v => Math.round(v / 5 * 127);
const r1   = v => Math.round(v * 127);
const r14  = v => Math.round(v / 14 * 127);  // detune 0-14 (7=center)
const r48  = v => Math.round(v / 48 * 127);  // transpose 0-48 (24=C3)

// ── Parse a packed voice (128 bytes) ────────────────────────────

function parseVoice(data, offset) {
    const voice = { operators: [] };

    // 6 operators: SysEx order is OP6 (byte 0) → OP1 (byte 85)
    for (let sysOp = 0; sysOp < 6; sysOp++) {
        const base = offset + sysOp * 17;
        const b11 = data[base + 11] & 0x0F;
        const b12 = data[base + 12] & 0x7F;
        const b13 = data[base + 13] & 0x1F;
        const b15 = data[base + 15] & 0x3F;

        const op = {
            egR1:         data[base + 0],
            egR2:         data[base + 1],
            egR3:         data[base + 2],
            egR4:         data[base + 3],
            egL1:         data[base + 4],
            egL2:         data[base + 5],
            egL3:         data[base + 6],
            egL4:         data[base + 7],
            breakpoint:   data[base + 8],
            lDepth:       data[base + 9],
            rDepth:       data[base + 10],
            lCurve:       b11 & 3,
            rCurve:       (b11 >> 2) & 3,
            rateScaling:  b12 & 7,
            detune:       (b12 >> 3) & 0xF,   // 0-14, 7=center
            ampModSens:   b13 & 3,
            keyVelSens:   (b13 >> 2) & 7,
            level:        data[base + 14],
            oscMode:      b15 & 1,
            freqCoarse:   (b15 >> 1) & 0x1F,
            freqFine:     data[base + 16],
        };
        // SysEx index 0=OP6, 5=OP1 → map to DX7 operator number
        op.opNumber = 6 - sysOp;
        voice.operators.push(op);
    }

    // Reverse so operators[0]=OP1, operators[5]=OP6
    voice.operators.reverse();

    // Global parameters (bytes 102-127)
    voice.pitchEgR1     = data[offset + 102];
    voice.pitchEgR2     = data[offset + 103];
    voice.pitchEgR3     = data[offset + 104];
    voice.pitchEgR4     = data[offset + 105];
    voice.pitchEgL1     = data[offset + 106];
    voice.pitchEgL2     = data[offset + 107];
    voice.pitchEgL3     = data[offset + 108];
    voice.pitchEgL4     = data[offset + 109];

    const b110 = data[offset + 110] & 0x1F;
    const b111 = data[offset + 111] & 0x0F;
    const b116 = data[offset + 116] & 0x7F;

    voice.algorithm     = b110 + 1;  // display as 1-32
    voice.feedback      = b111 & 7;
    voice.oscKeySync    = (b111 >> 3) & 1;

    voice.lfoSpeed      = data[offset + 112];
    voice.lfoDelay      = data[offset + 113];
    voice.pmd           = data[offset + 114];
    voice.amd           = data[offset + 115];

    voice.lfoSync       = b116 & 1;
    voice.lfoWave       = (b116 >> 1) & 7;
    voice.pModSens      = (b116 >> 4) & 7;

    voice.transpose     = data[offset + 117];

    // Voice name (10 ASCII chars)
    voice.name = '';
    for (let i = 0; i < 10; i++) {
        voice.name += String.fromCharCode(data[offset + 118 + i] & 0x7F);
    }
    voice.name = voice.name.trimEnd();

    return voice;
}

// ── Parse a .syx file ───────────────────────────────────────────

/**
 * Parse a DX7 32-voice bulk dump. `source` is a file path or the raw bytes.
 * Returns 32 voice objects in DX7-native units (operators[0] = OP1).
 * Throws if no bulk dump header is found.
 */
export function parseSyx(source) {
    const data = typeof source === 'string'
        ? new Uint8Array(fs.readFileSync(source))
        : new Uint8Array(source);

    // Validate header
    if (data[0] !== 0xF0 || data[1] !== 0x43 || data[3] !== 0x09) {
        // Try to find a bulk dump header anywhere in the file
        let headerOffset = -1;
        for (let i = 0; i < data.length - 4103; i++) {
            if (data[i] === 0xF0 && data[i + 1] === 0x43 && data[i + 3] === 0x09) {
                headerOffset = i;
                break;
            }
        }
        if (headerOffset === -1) {
            throw new Error('Not a DX7 32-voice bulk dump SysEx file.');
        }
        // Re-slice from header
        const voices = [];
        for (let i = 0; i < 32; i++) {
            voices.push(parseVoice(data, headerOffset + 6 + i * 128));
        }
        return voices;
    }

    const voices = [];
    for (let i = 0; i < 32; i++) {
        voices.push(parseVoice(data, 6 + i * 128));
    }
    return voices;
}

// ── Generate NRPN output ────────────────────────────────────────

const LFO_WAVE_NAMES = ['Triangle', 'Saw Down', 'Saw Up', 'Square', 'Sine', 'S&H'];
const CURVE_NAMES = ['-LIN', '-EXP', '+EXP', '+LIN'];

function noteNameFromBreakpoint(bp) {
    const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    // bp=0 → A-1, bp=39 → C3 (middle C)
    const noteIndex = bp % 12;
    const octave = Math.floor(bp / 12) - 1;
    return notes[noteIndex] + octave;
}

export function generateNRPN(voice, channel) {
    const lines = [];
    const ch = channel !== undefined ? channel : 'N';

    lines.push(`// ${voice.name} (DX7 ROM) — Algorithm ${voice.algorithm}`);
    lines.push(`createTrack(${ch}).play([`);

    // Global params
    lines.push('    // --- Global / LFO ---');
    lines.push(`    nrpn(0, 0, ${r7(voice.feedback)}),   // Feedback=${voice.feedback}`);
    lines.push(`    nrpn(0, 1, ${r48(voice.transpose)}),   // Transpose=${voice.transpose - 24}`);
    lines.push(`    nrpn(0, 2, ${r1(voice.oscKeySync)}),   // Osc Key Sync=${voice.oscKeySync}`);
    lines.push(`    nrpn(0, 3, ${r99(voice.pitchEgL1)}),   // Pitch EG L1=${voice.pitchEgL1}`);
    lines.push(`    nrpn(0, 4, ${r99(voice.pitchEgL2)}),   // Pitch EG L2=${voice.pitchEgL2}`);
    lines.push(`    nrpn(0, 5, ${r99(voice.pitchEgL3)}),   // Pitch EG L3=${voice.pitchEgL3}`);
    lines.push(`    nrpn(0, 6, ${r99(voice.pitchEgL4)}),   // Pitch EG L4=${voice.pitchEgL4}`);
    lines.push(`    nrpn(0, 7, ${r99(voice.pitchEgR1)}),   // Pitch EG R1=${voice.pitchEgR1}`);
    lines.push(`    nrpn(0, 8, ${r99(voice.pitchEgR2)}),   // Pitch EG R2=${voice.pitchEgR2}`);
    lines.push(`    nrpn(0, 9, ${r99(voice.pitchEgR3)}),   // Pitch EG R3=${voice.pitchEgR3}`);
    lines.push(`    nrpn(0, 10, ${r99(voice.pitchEgR4)}),  // Pitch EG R4=${voice.pitchEgR4}`);
    lines.push(`    nrpn(0, 11, ${r5(voice.lfoWave)}),   // LFO Wave=${LFO_WAVE_NAMES[voice.lfoWave]}`);
    lines.push(`    nrpn(0, 12, ${r99(voice.lfoSpeed)}),   // LFO Speed=${voice.lfoSpeed}`);
    lines.push(`    nrpn(0, 13, ${r99(voice.lfoDelay)}),   // LFO Delay=${voice.lfoDelay}`);
    lines.push(`    nrpn(0, 14, ${r99(voice.pmd)}),   // PMD=${voice.pmd}`);
    lines.push(`    nrpn(0, 15, ${r99(voice.amd)}),   // AMD=${voice.amd}`);
    lines.push(`    nrpn(0, 16, ${r1(voice.lfoSync)}),   // LFO Sync=${voice.lfoSync}`);
    lines.push(`    nrpn(0, 17, ${r7(voice.pModSens)}),   // P Mod Sens=${voice.pModSens}`);

    // Per operator — operators[0]=OP1 → NRPN 18-37, operators[5]=OP6 → NRPN 118-137
    for (let i = 0; i < 6; i++) {
        const op = voice.operators[i];
        const base = 18 + i * 20;
        const ratio = op.freqCoarse === 0 ? '0.5' : String(op.freqCoarse);
        const modeStr = op.oscMode ? 'fixed' : `ratio ${ratio}:1`;
        const detuneActual = op.detune - 7;
        const detuneStr = detuneActual >= 0 ? `+${detuneActual}` : String(detuneActual);

        lines.push('');
        lines.push(`    // --- Op${i + 1} (${modeStr}) ---`);
        lines.push(`    nrpn(0, ${base + 0}, ${r14(op.detune)}),   // Detune=${detuneStr}`);
        lines.push(`    nrpn(0, ${base + 1}, ${r31(op.freqCoarse)}),   // Coarse=${op.freqCoarse}`);
        lines.push(`    nrpn(0, ${base + 2}, ${r99(op.freqFine)}),   // Fine=${op.freqFine}`);
        lines.push(`    nrpn(0, ${base + 3}, ${r99(op.egL1)}),  // EG L1=${op.egL1}`);
        lines.push(`    nrpn(0, ${base + 4}, ${r99(op.egL2)}),  // EG L2=${op.egL2}`);
        lines.push(`    nrpn(0, ${base + 5}, ${r99(op.egL3)}),  // EG L3=${op.egL3}`);
        lines.push(`    nrpn(0, ${base + 6}, ${r99(op.egL4)}),  // EG L4=${op.egL4}`);
        lines.push(`    nrpn(0, ${base + 7}, ${r99(op.egR1)}),  // EG R1=${op.egR1}`);
        lines.push(`    nrpn(0, ${base + 8}, ${r99(op.egR2)}),  // EG R2=${op.egR2}`);
        lines.push(`    nrpn(0, ${base + 9}, ${r99(op.egR3)}),  // EG R3=${op.egR3}`);
        lines.push(`    nrpn(0, ${base + 10}, ${r99(op.egR4)}), // EG R4=${op.egR4}`);
        lines.push(`    nrpn(0, ${base + 11}, ${r99(op.level)}), // Level=${op.level}`);
        lines.push(`    nrpn(0, ${base + 12}, ${r7(op.keyVelSens)}), // Key Vel=${op.keyVelSens}`);
        lines.push(`    nrpn(0, ${base + 13}, ${r3(op.ampModSens)}), // A Mod Sens=${op.ampModSens}`);
        lines.push(`    nrpn(0, ${base + 14}, ${r7(op.rateScaling)}), // Rate Scaling=${op.rateScaling}`);
        lines.push(`    nrpn(0, ${base + 15}, ${r99(op.breakpoint)}), // Breakpoint=${noteNameFromBreakpoint(op.breakpoint)}`);
        lines.push(`    nrpn(0, ${base + 16}, ${r99(op.lDepth)}), // L Depth=${op.lDepth}`);
        lines.push(`    nrpn(0, ${base + 17}, ${r99(op.rDepth)}), // R Depth=${op.rDepth}`);
        lines.push(`    nrpn(0, ${base + 18}, ${r3(op.lCurve)}), // L Curve=${CURVE_NAMES[op.lCurve]}`);
        lines.push(`    nrpn(0, ${base + 19}, ${r3(op.rCurve)}), // R Curve=${CURVE_NAMES[op.rCurve]}`);
    }

    // Freq Mode per operator — NRPN 138-143 (Op1-Op6)
    lines.push('');
    lines.push('    // --- Freq Mode (0=ratio, 1=fixed) ---');
    for (let i = 0; i < 6; i++) {
        const op = voice.operators[i];
        lines.push(`    nrpn(0, ${138 + i}, ${r1(op.oscMode)}), // Op${i + 1} Freq Mode=${op.oscMode ? 'fixed' : 'ratio'}`);
    }

    lines.push(']);');
    return lines.join('\n');
}

// ── DX7 algorithm routings ──────────────────────────────────────
//
// The 32 operator routings, verbatim from the `dx7_algo(N)` definitions in
// Faust's dx7.lib (David Braun, dx7.lib 2.0.0). They live inside the closed
// `dx.algorithm()` function in the library, so a self-contained instrument
// has to restate them. `unmodulated` lists the operators (1-6) that the lib
// declares as `op(i, 0)` — no modulator input; every other operator is
// partially applied as `op(i)` and takes its phase modulation from the
// routing. Algorithms 4, 6 and 32 use `feedbackAmp2` (dx.fdbkscalef2).
//
// Extracted mechanically from the lib, not hand-typed — regenerate the same
// way rather than editing by hand.

export const ALGORITHM_ROUTINGS = {
     1: { routing: "(op2 : op1),(op6~*(feedbackAmp) : op5 : op4 : op3) :> _", unmodulated: [2] },
     2: { routing: "(op2~*(feedbackAmp) : op1),(op6 : op5 : op4 : op3) :> _", unmodulated: [6] },
     3: { routing: "(op3 : op2 : op1),(op6~*(feedbackAmp) : op5 : op4) :> _", unmodulated: [3] },
     4: { routing: "(op3 : op2 : op1),(op6 : op5 : op4)~*(feedbackAmp2) :> _", unmodulated: [3] },
     5: { routing: "(op2 : op1),(op4 : op3),(op6~*(feedbackAmp) : op5) :> _", unmodulated: [2, 4] },
     6: { routing: "(op2 : op1),(op4 : op3),(op6 : op5)~*(feedbackAmp2) :> _", unmodulated: [2, 4] },
     7: { routing: "(op2 : op1),(op4,(op6~*(feedbackAmp) : op5) :> op3) :> _", unmodulated: [2, 4] },
     8: { routing: "(op2 : op1),(op4~*(feedbackAmp),(op6 : op5) :> op3) :> _", unmodulated: [2, 6] },
     9: { routing: "(op2~*(feedbackAmp) : op1),(op4,(op6 : op5) :> op3) :> _", unmodulated: [4, 6] },
    10: { routing: "(op5,op6 :> op4),(op3~*(feedbackAmp) : op2 : op1) :> _", unmodulated: [5, 6] },
    11: { routing: "(op5,op6~*(feedbackAmp) :> op4),(op3 : op2 : op1) :> _", unmodulated: [3, 5] },
    12: { routing: "(op4,op5,op6 :> op3),(op2~*(feedbackAmp) : op1) :> _", unmodulated: [4, 5, 6] },
    13: { routing: "(op4,op5,op6~*(feedbackAmp) :> op3),(op2 : op1) :> _", unmodulated: [2, 4, 5] },
    14: { routing: "(op2 : op1),(op5,op6~*(feedbackAmp) :> op4 : op3) :> _", unmodulated: [2, 5] },
    15: { routing: "(op2~*(feedbackAmp) : op1),(op5,op6 :> op4 : op3) :> _", unmodulated: [5, 6] },
    16: { routing: "op2,(op4 : op3),(op6~*(feedbackAmp) : op5) :> op1 : _", unmodulated: [2, 4] },
    17: { routing: "op2~*(feedbackAmp),(op4 : op3),(op6 : op5) :> op1 : _", unmodulated: [4, 6] },
    18: { routing: "op2,op3~*(feedbackAmp),(op6 : op5 : op4) :> op1 : _", unmodulated: [2, 6] },
    19: { routing: "(op3 : op2 : op1),(op6~*(feedbackAmp) <: op4,op5) :> _", unmodulated: [3] },
    20: { routing: "(op3~*(feedbackAmp) <: op1,op2),(op5,op6 :> op4) :> _", unmodulated: [5, 6] },
    21: { routing: "(op3~*(feedbackAmp) <: op1,op2),(op6 <: op4,op5) :> _", unmodulated: [6] },
    22: { routing: "(op2 : op1),(op6~*(feedbackAmp) <: op3,op4,op5) :> _", unmodulated: [2] },
    23: { routing: "op1,(op3 : op2),(op6~*(feedbackAmp) <: op4,op5) :> _", unmodulated: [1, 3] },
    24: { routing: "op1,op2,(op6~*(feedbackAmp) <: op3,op4,op5) :> _", unmodulated: [1, 2] },
    25: { routing: "op1,op2,op3,(op6~*(feedbackAmp) <: op4,op5) :> _", unmodulated: [1, 2, 3] },
    26: { routing: "op1,(op3 : op2),(op5,op6~*(feedbackAmp) :> op4) :> _", unmodulated: [1, 3, 5] },
    27: { routing: "op1,(op3~*(feedbackAmp) : op2),(op5,op6 :> op4) :> _", unmodulated: [1, 5, 6] },
    28: { routing: "(op2 : op1),(op5~*(feedbackAmp) : op4 : op3),op6 :> _", unmodulated: [2, 6] },
    29: { routing: "op1,op2,(op4 : op3),(op6~*(feedbackAmp) : op5) :> _", unmodulated: [1, 2, 4] },
    30: { routing: "op1,op2,(op5~*(feedbackAmp) : op4 : op3),op6 :> _", unmodulated: [1, 2, 6] },
    31: { routing: "op1,op2,op3,op4,(op6~*(feedbackAmp) : op5) :> _", unmodulated: [1, 2, 3, 4] },
    32: { routing: "op1,op2,op3,op4,op5,(op6~*(feedbackAmp2)) :> _", unmodulated: [1, 2, 3, 4, 5] },
};

// ── Generate a self-contained Faust instrument ──────────────────

// Parameter ranges in DX7 units, as dx.operator expects them. A value outside
// its range would not fail at compile time — it would misbehave on the first
// note — so a corrupt or mis-parsed voice is rejected here instead.
const GLOBAL_PARAMS = [
    // [dsp name, voice field → value, min, max, comment]
    ['feedback',        v => v.feedback,        0,   7,  '0-7, operator self-modulation depth'],
    ['transpose',       v => v.transpose - 24, -24,  24, 'semitones, -24..24 (ROM stores 0-48, 24 = 0)'],
    ['oscKeySync',      v => v.oscKeySync,      0,   1,  '0/1, restart oscillator phase on key-on'],
    ['pitchEgR1',       v => v.pitchEgR1,       0,  99,  'pitch EG rates 0-99'],
    ['pitchEgR2',       v => v.pitchEgR2,       0,  99,  ''],
    ['pitchEgR3',       v => v.pitchEgR3,       0,  99,  ''],
    ['pitchEgR4',       v => v.pitchEgR4,       0,  99,  ''],
    ['pitchEgL1',       v => v.pitchEgL1,       0,  99,  'pitch EG levels 0-99 (50 = no pitch change)'],
    ['pitchEgL2',       v => v.pitchEgL2,       0,  99,  ''],
    ['pitchEgL3',       v => v.pitchEgL3,       0,  99,  ''],
    ['pitchEgL4',       v => v.pitchEgL4,       0,  99,  ''],
    ['lfoWave',         v => v.lfoWave,         0,   5,  '0=Triangle 1=Saw Down 2=Saw Up 3=Square 4=Sine 5=S&H'],
    ['lfoSpeed',        v => v.lfoSpeed,        0,  99,  '0-99'],
    ['lfoDelay',        v => v.lfoDelay,        0,  99,  '0-99'],
    ['lfoPMD',          v => v.pmd,             0,  99,  'LFO pitch modulation depth 0-99'],
    ['lfoAMD',          v => v.amd,             0,  99,  'LFO amplitude modulation depth 0-99'],
    ['lfoSync',         v => v.lfoSync,         0,   1,  '0/1, restart LFO on key-on'],
    ['lfoPitchModSens', v => v.pModSens,        0,   7,  '0-7'],
];

const OPERATOR_PARAMS = [
    // [dsp name, operator field → value, min, max, comment]
    ['freqMode',         op => op.oscMode,        0,  1,  '0 = ratio of the note, 1 = fixed frequency'],
    ['freqCoarse',       op => op.freqCoarse,     0, 31,  'ratio 0-31 (0 = 0.5); fixed: 1/10/100/1000 Hz'],
    ['freqFine',         op => op.freqFine,       0, 99,  '0-99'],
    ['detune',           op => op.detune - 7,    -7,  7,  '-7..7 (ROM stores 0-14, 7 = center)'],
    ['outLevel',         op => op.level,          0, 99,  'output level 0-99'],
    ['egR1',             op => op.egR1,           0, 99,  'amp EG rates 0-99'],
    ['egR2',             op => op.egR2,           0, 99,  ''],
    ['egR3',             op => op.egR3,           0, 99,  ''],
    ['egR4',             op => op.egR4,           0, 99,  ''],
    ['egL1',             op => op.egL1,           0, 99,  'amp EG levels 0-99'],
    ['egL2',             op => op.egL2,           0, 99,  ''],
    ['egL3',             op => op.egL3,           0, 99,  ''],
    ['egL4',             op => op.egL4,           0, 99,  ''],
    ['keyVelSens',       op => op.keyVelSens,     0,  7,  'key velocity sensitivity 0-7'],
    ['ampModSens',       op => op.ampModSens,     0,  3,  'amplitude modulation sensitivity 0-3'],
    ['rateScale',        op => op.rateScaling,    0,  7,  'EG rate scaling 0-7'],
    ['breakpoint',       op => op.breakpoint,     0, 99,  'keyboard level scaling breakpoint 0-99 (39 = C3)'],
    ['breakpointLDepth', op => op.lDepth,         0, 99,  'level scaling depth left of breakpoint 0-99'],
    ['breakpointRDepth', op => op.rDepth,         0, 99,  'level scaling depth right of breakpoint 0-99'],
    ['breakpointLCurve', op => op.lCurve,         0,  3,  'curves 0-3: -LIN -EXP +EXP +LIN'],
    ['breakpointRCurve', op => op.rCurve,         0,  3,  ''],
];

function checkRange(label, value, min, max) {
    if (!Number.isInteger(value) || value < min || value > max) {
        throw new Error(`${label} = ${value} is outside ${min}..${max}`);
    }
    return value;
}

/** Faust-safe file stem from a patch name: "E.PIANO 1" → "epiano1". */
function stemFromName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'dx7patch';
}

/**
 * Generate a self-contained Faust instrument for one voice: every patch
 * parameter is a constant, the only controls are freq/gate/gain, and the
 * operator routing of the voice's algorithm is restated from the table above.
 *
 * opts.romFile      – file name for the header comment (default "<rom>.syx")
 * opts.patchNumber  – 1-32, for the header comment and regenerate command
 * opts.name         – file/class stem (default derived from the patch name)
 */
export function generateDsp(voice, opts = {}) {
    const algorithm = voice.algorithm;
    const routing = ALGORITHM_ROUTINGS[algorithm];
    if (!routing) throw new Error(`Algorithm ${algorithm} is not 1-32`);
    if (!Array.isArray(voice.operators) || voice.operators.length !== 6) {
        throw new Error('voice.operators must have 6 entries');
    }

    const stem = opts.name || stemFromName(voice.name);
    const romFile = opts.romFile || '<rom>.syx';
    const patchRef = opts.patchNumber !== undefined ? opts.patchNumber : '<patch>';
    const className = stem.charAt(0).toUpperCase() + stem.slice(1);
    const nameFlag = opts.name ? ` --name ${opts.name}` : '';
    const usesFeedback2 = routing.routing.includes('feedbackAmp2');

    const L = [];
    L.push(`// ${voice.name} — Yamaha DX7 patch as a self-contained Faust instrument`);
    L.push(`//`);
    L.push(`//   ROM file:   ${romFile}`);
    L.push(`//   Patch:      #${patchRef} "${voice.name}"`);
    L.push(`//   Algorithm:  ${algorithm}`);
    L.push(`//`);
    L.push(`// Every patch parameter is a constant in this file. The only MIDI-facing`);
    L.push(`// controls are freq, gate and gain, so the song carries no NRPN patch data.`);
    L.push(`// Drop it into a project as faust/${stem}.dsp and import the generated`);
    L.push(`// \`${className}\` voice class in synth.ts. To automate a parameter from the song,`);
    L.push(`// replace its constant with an hslider of the same range.`);
    L.push(`//`);
    L.push(`// Generated by examples/dx7/parse-rom.js. Regenerate with:`);
    L.push(`//   node parse-rom.js ${romFile} ${patchRef} --dsp${nameFlag} > dsp/${stem}.dsp`);
    L.push(`//`);
    L.push(`// Values are in the DX7's own units, as dx.operator expects them. The`);
    L.push(`// operator routing is dx7_algo(${algorithm}) from Faust's dx7.lib (David Braun, 2.0.0);`);
    L.push(`// op(i, 0) marks an operator with no modulator input.`);
    L.push(``);
    L.push(`import("stdfaust.lib");`);
    L.push(``);
    L.push(`freq = hslider("freq", 440, 20, 20000, 0.01);`);
    L.push(`gate = button("gate");`);
    L.push(`gain = hslider("gain", 0.5, 0, 1, 0.01);`);
    L.push(``);
    L.push(`// ---- Global ----------------------------------------------------------------`);
    for (const [name, get, min, max, comment] of GLOBAL_PARAMS) {
        const value = checkRange(name, get(voice), min, max);
        L.push(`${name.padEnd(16)}= ${String(value).padStart(3)};${comment ? `  // ${comment}` : ''}`);
    }
    L.push(``);
    L.push(`// ---- Per operator ------------------------------------------------------------`);
    L.push(`//                                OP1  OP2  OP3  OP4  OP5  OP6`);
    for (const [name, get, min, max, comment] of OPERATOR_PARAMS) {
        const values = voice.operators.map((op, i) => checkRange(`OP${i + 1} ${name}`, get(op), min, max));
        const list = values.map(v => String(v).padStart(3)).join(', ');
        L.push(`${`${name}(i)`.padEnd(20)}= ba.take(i+1, (${list}));${comment ? `  // ${comment}` : ''}`);
    }
    L.push(``);
    L.push(`// dx.operator argument order is fixed by operator.lib — do not reorder.`);
    L.push(`op(i, phase_mod) = dx.operator(`);
    L.push(`    freqMode(i), freqCoarse(i), freqFine(i), detune(i), outLevel(i),`);
    L.push(`    egR1(i), egR2(i), egR3(i), egR4(i),`);
    L.push(`    egL1(i), egL2(i), egL3(i), egL4(i),`);
    L.push(`    keyVelSens(i), ampModSens(i), rateScale(i),`);
    L.push(`    breakpoint(i), breakpointLDepth(i), breakpointRDepth(i), breakpointLCurve(i), breakpointRCurve(i),`);
    L.push(`    lfoWave, lfoSpeed, lfoDelay, lfoPMD, lfoAMD, lfoSync, lfoPitchModSens,`);
    L.push(`    oscKeySync,`);
    L.push(`    pitchEgR1, pitchEgR2, pitchEgR3, pitchEgR4,`);
    L.push(`    pitchEgL1, pitchEgL2, pitchEgL3, pitchEgL4,`);
    L.push(`    transpose, phase_mod, freq, gain, gate`);
    L.push(`);`);
    L.push(``);
    if (usesFeedback2) {
        L.push(`feedbackAmp2 = dx.fdbkscalef2(feedback);  // algorithms 4, 6 and 32 use the second scaling`);
    } else {
        L.push(`feedbackAmp = dx.fdbkscalef(feedback);`);
    }
    L.push(``);
    L.push(`// Algorithm ${algorithm}`);
    L.push(`process = ${routing.routing} <: _,_`);
    L.push(`with {`);
    for (let n = 1; n <= 6; n++) {
        const args = routing.unmodulated.includes(n) ? `${n - 1}, 0` : `${n - 1}`;
        L.push(`    op${n} = op(${args});`);
    }
    L.push(`};`);
    return L.join('\n') + '\n';
}

// ── CLI ─────────────────────────────────────────────────────────

function resolvePatchIndex(voices, patchArg) {
    if (!isNaN(parseInt(patchArg, 10))) {
        const patchIndex = parseInt(patchArg, 10) - 1;
        if (patchIndex < 0 || patchIndex >= 32) {
            console.error('Patch number must be 1-32');
            process.exit(1);
        }
        return patchIndex;
    }
    // Search by name
    const search = String(patchArg).toLowerCase();
    const patchIndex = voices.findIndex(v => v.name.toLowerCase().includes(search));
    if (patchIndex === -1) {
        console.error(`No patch found matching "${patchArg}"`);
        process.exit(1);
    }
    return patchIndex;
}

function main(args) {
    if (args.length === 0) {
        console.log('DX7 SysEx ROM parser — converts patches to Faust instruments or NRPN sequences');
        console.log('');
        console.log('Usage:');
        console.log('  node parse-rom.js <file.syx>                       List all 32 patches');
        console.log('  node parse-rom.js <file.syx> <number>              Show patch as NRPN (1-32)');
        console.log('  node parse-rom.js <file.syx> <name>                Search by name');
        console.log('  node parse-rom.js <file.syx> <number> --channel N  Output for channel N');
        console.log('  node parse-rom.js <file.syx> <number|name> --dsp [--name <stem>]');
        console.log('                                                     Print a self-contained .dsp');
        process.exit(0);
    }

    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    let voices;
    try {
        voices = parseSyx(filePath);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }

    // Parse --channel flag
    let channel;
    const channelIdx = args.indexOf('--channel');
    if (channelIdx !== -1 && args[channelIdx + 1] !== undefined) {
        channel = parseInt(args[channelIdx + 1], 10);
    }

    if (args.includes('--dsp')) {
        // Self-contained Faust instrument
        const nameIdx = args.indexOf('--name');
        const name = nameIdx !== -1 ? args[nameIdx + 1] : undefined;
        const positional = args.slice(1).filter((a, i, all) =>
            !a.startsWith('--') && all[i - 1] !== '--name' && all[i - 1] !== '--channel');
        if (positional.length === 0) {
            console.error('--dsp needs a patch number (1-32) or name');
            process.exit(1);
        }
        const patchIndex = resolvePatchIndex(voices, positional[0]);
        process.stdout.write(generateDsp(voices[patchIndex], {
            romFile: path.basename(filePath),
            patchNumber: patchIndex + 1,
            name,
        }));
        return;
    }

    if (args.length === 1 || (args.length === 2 && isNaN(parseInt(args[1], 10)) && args[1] !== '--channel')) {
        // List mode or search mode
        const search = args[1]?.toLowerCase();

        console.log(`\n  #  Name           Algorithm  Feedback  Transpose`);
        console.log(`  -  ----           ---------  --------  ---------`);
        for (let i = 0; i < voices.length; i++) {
            const v = voices[i];
            if (search && !v.name.toLowerCase().includes(search)) continue;
            const num = String(i + 1).padStart(2);
            const name = v.name.padEnd(14);
            const alg = String(v.algorithm).padStart(2);
            const fb = String(v.feedback);
            const tr = String(v.transpose - 24);
            console.log(`  ${num} ${name}   ${alg}          ${fb}        ${tr}`);
        }
        console.log('');
    } else {
        // Single patch output
        const patchIndex = resolvePatchIndex(voices, args[1]);
        const voice = voices[patchIndex];
        console.log(`\n// Patch ${patchIndex + 1}: ${voice.name} (Algorithm ${voice.algorithm})`);
        console.log(`// Requires: dsp/dx7_alg${voice.algorithm}.dsp\n`);
        console.log(generateNRPN(voice, channel));
        console.log('');
    }
}

const isEntryPoint = process.argv[1]
    && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) {
    main(process.argv.slice(2));
}
