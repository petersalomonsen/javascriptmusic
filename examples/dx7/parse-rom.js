#!/usr/bin/env node
// DX7 SysEx ROM parser — converts .syx patches to NRPN sequences
// for use with the faust2as transpiled DX7 synth.
//
// Usage:
//   node parse-rom.js <file.syx>                    — list all 32 patches
//   node parse-rom.js <file.syx> <number>           — show patch N (1-32) as NRPN
//   node parse-rom.js <file.syx> <name>             — search by name
//   node parse-rom.js <file.syx> <number> --channel N  — output for channel N

import fs from 'fs';

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

function parseSyx(filePath) {
    const buf = fs.readFileSync(filePath);
    const data = new Uint8Array(buf);

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
            console.error('Not a DX7 32-voice bulk dump SysEx file.');
            process.exit(1);
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

function generateNRPN(voice, channel) {
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

    lines.push(']);');
    return lines.join('\n');
}

// ── CLI ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('DX7 SysEx ROM parser — converts patches to NRPN sequences');
    console.log('');
    console.log('Usage:');
    console.log('  node parse-rom.js <file.syx>                       List all 32 patches');
    console.log('  node parse-rom.js <file.syx> <number>              Show patch as NRPN (1-32)');
    console.log('  node parse-rom.js <file.syx> <name>                Search by name');
    console.log('  node parse-rom.js <file.syx> <number> --channel N  Output for channel N');
    process.exit(0);
}

const filePath = args[0];
if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

const voices = parseSyx(filePath);

// Parse --channel flag
let channel;
const channelIdx = args.indexOf('--channel');
if (channelIdx !== -1 && args[channelIdx + 1] !== undefined) {
    channel = parseInt(args[channelIdx + 1], 10);
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
    const patchArg = args[1];
    let patchIndex;

    if (!isNaN(parseInt(patchArg, 10))) {
        patchIndex = parseInt(patchArg, 10) - 1;
        if (patchIndex < 0 || patchIndex >= 32) {
            console.error('Patch number must be 1-32');
            process.exit(1);
        }
    } else {
        // Search by name
        const search = patchArg.toLowerCase();
        patchIndex = voices.findIndex(v => v.name.toLowerCase().includes(search));
        if (patchIndex === -1) {
            console.error(`No patch found matching "${patchArg}"`);
            process.exit(1);
        }
    }

    const voice = voices[patchIndex];
    console.log(`\n// Patch ${patchIndex + 1}: ${voice.name} (Algorithm ${voice.algorithm})`);
    console.log(`// Requires: dsp/dx7_alg${voice.algorithm}.dsp\n`);
    console.log(generateNRPN(voice, channel));
    console.log('');
}
