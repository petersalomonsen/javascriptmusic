// node --test examples/dx7/parse-rom.test.mjs
//
// Exercises parse-rom.js without a ROM file: a synthetic voice object goes
// through generateDsp(), and a synthetic 32-voice bulk dump goes through
// parseSyx(), so the tests never need the (uncommitted) .syx cartridges.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALGORITHM_ROUTINGS, generateDsp, generateNRPN, parseSyx } from './parse-rom.js';

// ---- fixtures ---------------------------------------------------------------

/** A voice in DX7-native units, with every operator distinguishable. */
function syntheticVoice(algorithm = 5) {
    const operators = [];
    for (let i = 0; i < 6; i++) {
        operators.push({
            opNumber: i + 1,
            egR1: 90 + i, egR2: 40 + i, egR3: 30 + i, egR4: 60 + i,
            egL1: 99, egL2: 80 - i, egL3: 10 * i, egL4: 0,
            breakpoint: 39, lDepth: i, rDepth: 2 * i,
            lCurve: i % 4, rCurve: (i + 1) % 4,
            rateScaling: i, detune: 7 + i - 2,   // stored 0-14 → -2..3 after centering
            ampModSens: i % 4, keyVelSens: i,
            level: 99 - 5 * i,
            oscMode: i === 5 ? 1 : 0,
            freqCoarse: i + 1, freqFine: 3 * i,
        });
    }
    return {
        name: 'SYNTH TEST',
        algorithm,
        feedback: 6, oscKeySync: 1,
        pitchEgR1: 94, pitchEgR2: 67, pitchEgR3: 95, pitchEgR4: 60,
        pitchEgL1: 50, pitchEgL2: 50, pitchEgL3: 50, pitchEgL4: 50,
        lfoSpeed: 34, lfoDelay: 33, pmd: 5, amd: 7,
        lfoSync: 0, lfoWave: 4, pModSens: 3,
        transpose: 12,   // stored 0-48 → -12 semitones
        operators,
    };
}

/** Pack a voice the way a DX7 bulk dump does (OP6 first, bit-packed fields). */
function packVoice(voice) {
    const bytes = new Uint8Array(128);
    for (let sysOp = 0; sysOp < 6; sysOp++) {
        const op = voice.operators[5 - sysOp];
        const b = sysOp * 17;
        bytes[b + 0] = op.egR1; bytes[b + 1] = op.egR2; bytes[b + 2] = op.egR3; bytes[b + 3] = op.egR4;
        bytes[b + 4] = op.egL1; bytes[b + 5] = op.egL2; bytes[b + 6] = op.egL3; bytes[b + 7] = op.egL4;
        bytes[b + 8] = op.breakpoint; bytes[b + 9] = op.lDepth; bytes[b + 10] = op.rDepth;
        bytes[b + 11] = op.lCurve | (op.rCurve << 2);
        bytes[b + 12] = op.rateScaling | (op.detune << 3);
        bytes[b + 13] = op.ampModSens | (op.keyVelSens << 2);
        bytes[b + 14] = op.level;
        bytes[b + 15] = op.oscMode | (op.freqCoarse << 1);
        bytes[b + 16] = op.freqFine;
    }
    [voice.pitchEgR1, voice.pitchEgR2, voice.pitchEgR3, voice.pitchEgR4,
        voice.pitchEgL1, voice.pitchEgL2, voice.pitchEgL3, voice.pitchEgL4]
        .forEach((v, i) => { bytes[102 + i] = v; });
    bytes[110] = voice.algorithm - 1;
    bytes[111] = voice.feedback | (voice.oscKeySync << 3);
    bytes[112] = voice.lfoSpeed; bytes[113] = voice.lfoDelay;
    bytes[114] = voice.pmd; bytes[115] = voice.amd;
    bytes[116] = voice.lfoSync | (voice.lfoWave << 1) | (voice.pModSens << 4);
    bytes[117] = voice.transpose;
    const name = voice.name.padEnd(10).slice(0, 10);
    for (let i = 0; i < 10; i++) bytes[118 + i] = name.charCodeAt(i);
    return bytes;
}

/** A 4104-byte 32-voice bulk dump whose voice N uses algorithm (N % 32) + 1. */
function syntheticSyx() {
    const syx = new Uint8Array(4104);
    syx.set([0xF0, 0x43, 0x00, 0x09, 0x20, 0x00], 0);
    for (let i = 0; i < 32; i++) syx.set(packVoice(syntheticVoice((i % 32) + 1)), 6 + i * 128);
    syx[4103] = 0xF7;
    return syx;
}

// The generated file's declared ranges, DX7 units (mirrors operator.lib).
const GLOBAL_RANGES = {
    feedback: [0, 7], transpose: [-24, 24], oscKeySync: [0, 1],
    pitchEgR1: [0, 99], pitchEgR2: [0, 99], pitchEgR3: [0, 99], pitchEgR4: [0, 99],
    pitchEgL1: [0, 99], pitchEgL2: [0, 99], pitchEgL3: [0, 99], pitchEgL4: [0, 99],
    lfoWave: [0, 5], lfoSpeed: [0, 99], lfoDelay: [0, 99], lfoPMD: [0, 99], lfoAMD: [0, 99],
    lfoSync: [0, 1], lfoPitchModSens: [0, 7],
};
const OPERATOR_RANGES = {
    freqMode: [0, 1], freqCoarse: [0, 31], freqFine: [0, 99], detune: [-7, 7], outLevel: [0, 99],
    egR1: [0, 99], egR2: [0, 99], egR3: [0, 99], egR4: [0, 99],
    egL1: [0, 99], egL2: [0, 99], egL3: [0, 99], egL4: [0, 99],
    keyVelSens: [0, 7], ampModSens: [0, 3], rateScale: [0, 7],
    breakpoint: [0, 99], breakpointLDepth: [0, 99], breakpointRDepth: [0, 99],
    breakpointLCurve: [0, 3], breakpointRCurve: [0, 3],
};

/** Pull `name = value;` globals and `name(i) = ba.take(i+1, (...));` lists out of a .dsp. */
function parseDspConstants(dsp) {
    const globals = {};
    const lists = {};
    for (const line of dsp.split('\n')) {
        let m = line.match(/^(\w+)\s*=\s*(-?\d+);/);
        if (m) { globals[m[1]] = Number(m[2]); continue; }
        m = line.match(/^(\w+)\(i\)\s*=\s*ba\.take\(i\+1,\s*\(([^)]*)\)\);/);
        if (m) lists[m[1]] = m[2].split(',').map(s => s.trim());
    }
    return { globals, lists };
}

// ---- routing table -----------------------------------------------------------

test('routing table covers all 32 DX7 algorithms', () => {
    const keys = Object.keys(ALGORITHM_ROUTINGS).map(Number).sort((a, b) => a - b);
    assert.equal(keys.length, 32);
    assert.deepEqual(keys, Array.from({ length: 32 }, (_, i) => i + 1));
    for (const n of keys) {
        const { routing, unmodulated } = ALGORITHM_ROUTINGS[n];
        for (let op = 1; op <= 6; op++) assert.match(routing, new RegExp(`\\bop${op}\\b`), `alg ${n} lacks op${op}`);
        assert.match(routing, /:> (_|op1 : _)$/, `alg ${n} does not sum to one output`);
        assert.match(routing, /~\*\(feedbackAmp2?\)/, `alg ${n} has no feedback path`);
        assert.ok(unmodulated.length >= 1 && unmodulated.every(o => o >= 1 && o <= 6), `alg ${n} unmodulated`);
        assert.equal(new Set(unmodulated).size, unmodulated.length, `alg ${n} duplicate unmodulated`);
    }
    // The lib uses the second feedback scaling only for these three.
    for (let n = 1; n <= 32; n++) {
        assert.equal(ALGORITHM_ROUTINGS[n].routing.includes('feedbackAmp2'), [4, 6, 32].includes(n), `alg ${n} feedback scaling`);
    }
});

// ---- generateDsp -------------------------------------------------------------

test('generated .dsp restates the routing of the voice algorithm', () => {
    const dsp = generateDsp(syntheticVoice(5));
    assert.ok(dsp.includes('process = (op2 : op1),(op4 : op3),(op6~*(feedbackAmp) : op5) :> _'));
    // Algorithm 5: OP2 and OP4 have no modulator input, the rest are partially applied.
    assert.ok(dsp.includes('op1 = op(0);'));
    assert.ok(dsp.includes('op2 = op(1, 0);'));
    assert.ok(dsp.includes('op3 = op(2);'));
    assert.ok(dsp.includes('op4 = op(3, 0);'));
    assert.ok(dsp.includes('op5 = op(4);'));
    assert.ok(dsp.includes('op6 = op(5);'));
    assert.ok(dsp.includes('feedbackAmp = dx.fdbkscalef(feedback);'));
    assert.ok(!dsp.includes('feedbackAmp2'));
});

test('generated .dsp is self-contained: dx.operator, three controls, no other UI', () => {
    const dsp = generateDsp(syntheticVoice(5));
    assert.ok(dsp.includes('import("stdfaust.lib");'));
    assert.ok(dsp.includes('op(i, phase_mod) = dx.operator('));
    assert.ok(dsp.includes('freq = hslider("freq", 440, 20, 20000, 0.01);'));
    assert.ok(dsp.includes('gate = button("gate");'));
    assert.ok(dsp.includes('gain = hslider("gain", 0.5, 0, 1, 0.01);'));
    const uiElements = dsp.match(/\b(hslider|vslider|nentry|button|checkbox)\(/g);
    assert.deepEqual(uiElements, ['hslider(', 'button(', 'hslider('], 'only freq/gate/gain may be UI controls');
    assert.ok(!dsp.includes('dx.algorithm('), 'must not depend on the closed dx.algorithm function');
});

test('generated .dsp has six-element per-operator lists with in-range integers', () => {
    const { lists } = parseDspConstants(generateDsp(syntheticVoice(5)));
    assert.deepEqual(Object.keys(lists).sort(), Object.keys(OPERATOR_RANGES).sort());
    for (const [name, values] of Object.entries(lists)) {
        assert.equal(values.length, 6, `${name} must list OP1..OP6`);
        const [min, max] = OPERATOR_RANGES[name];
        for (const v of values) {
            assert.match(v, /^-?\d+$/, `${name}: "${v}" is not an integer`);
            const n = Number(v);
            assert.ok(n >= min && n <= max, `${name} = ${n} outside ${min}..${max}`);
        }
    }
});

test('generated .dsp has every global constant as an in-range integer', () => {
    const { globals } = parseDspConstants(generateDsp(syntheticVoice(5)));
    for (const [name, [min, max]] of Object.entries(GLOBAL_RANGES)) {
        assert.ok(name in globals, `missing global ${name}`);
        assert.ok(Number.isInteger(globals[name]), `${name} not an integer`);
        assert.ok(globals[name] >= min && globals[name] <= max, `${name} = ${globals[name]} outside ${min}..${max}`);
    }
});

test('generated .dsp carries the voice values in DX7 units, operator order OP1..OP6', () => {
    const voice = syntheticVoice(5);
    const { globals, lists } = parseDspConstants(generateDsp(voice));
    // Global conversions: transpose 0-48 → semitones, everything else verbatim.
    assert.equal(globals.transpose, -12);
    assert.equal(globals.feedback, 6);
    assert.equal(globals.lfoWave, 4);
    assert.equal(globals.lfoPMD, 5);
    assert.equal(globals.lfoAMD, 7);
    assert.equal(globals.lfoPitchModSens, 3);
    assert.equal(globals.pitchEgR1, 94);
    // Per operator: detune 0-14 → -7..7, everything else verbatim, column i = OP(i+1).
    assert.deepEqual(lists.detune.map(Number), [-2, -1, 0, 1, 2, 3]);
    assert.deepEqual(lists.freqCoarse.map(Number), [1, 2, 3, 4, 5, 6]);
    assert.deepEqual(lists.freqMode.map(Number), [0, 0, 0, 0, 0, 1]);
    assert.deepEqual(lists.outLevel.map(Number), voice.operators.map(op => op.level));
    assert.deepEqual(lists.egR1.map(Number), voice.operators.map(op => op.egR1));
    assert.deepEqual(lists.egL2.map(Number), voice.operators.map(op => op.egL2));
    assert.deepEqual(lists.keyVelSens.map(Number), [0, 1, 2, 3, 4, 5]);
    assert.deepEqual(lists.breakpointRCurve.map(Number), [1, 2, 3, 0, 1, 2]);
});

test('algorithms 4, 6 and 32 use the second feedback scaling', () => {
    for (const alg of [4, 6, 32]) {
        const dsp = generateDsp(syntheticVoice(alg));
        assert.ok(dsp.includes(`process = ${ALGORITHM_ROUTINGS[alg].routing} <: _,_`));
        assert.ok(dsp.includes('feedbackAmp2 = dx.fdbkscalef2(feedback);'), `alg ${alg}`);
        assert.ok(!/^feedbackAmp = /m.test(dsp), `alg ${alg} must not define the unused feedbackAmp`);
    }
});

test('every algorithm generates, and each unmodulated operator is op(i, 0)', () => {
    for (let alg = 1; alg <= 32; alg++) {
        const dsp = generateDsp(syntheticVoice(alg));
        assert.ok(dsp.includes(`// Algorithm ${alg}\n`));
        const { unmodulated } = ALGORITHM_ROUTINGS[alg];
        for (let op = 1; op <= 6; op++) {
            const expected = unmodulated.includes(op) ? `op${op} = op(${op - 1}, 0);` : `op${op} = op(${op - 1});`;
            assert.ok(dsp.includes(expected), `alg ${alg}: ${expected}`);
        }
    }
});

test('header records patch identity and the regenerate command', () => {
    const dsp = generateDsp(syntheticVoice(5), { romFile: 'ROM1A.syx', patchNumber: 11, name: 'epiano' });
    assert.ok(dsp.startsWith('// SYNTH TEST — Yamaha DX7 patch'));
    assert.ok(dsp.includes('//   ROM file:   ROM1A.syx'));
    assert.ok(dsp.includes('//   Patch:      #11 "SYNTH TEST"'));
    assert.ok(dsp.includes('//   Algorithm:  5'));
    assert.ok(dsp.includes('node parse-rom.js ROM1A.syx 11 --dsp --name epiano > dsp/epiano.dsp'));
    assert.ok(dsp.includes('faust/epiano.dsp'));
    assert.ok(dsp.includes('`Epiano` voice class'));
    // Without --name the stem is derived from the patch name.
    assert.ok(generateDsp(syntheticVoice(5)).includes('faust/synthtest.dsp'));
});

test('out-of-range or malformed voices are rejected rather than emitted', () => {
    const bad = syntheticVoice(5); bad.feedback = 9;
    assert.throws(() => generateDsp(bad), /feedback = 9 is outside 0\.\.7/);
    const badOp = syntheticVoice(5); badOp.operators[2].freqCoarse = 32;
    assert.throws(() => generateDsp(badOp), /OP3 freqCoarse = 32 is outside 0\.\.31/);
    const badAlg = syntheticVoice(33);
    assert.throws(() => generateDsp(badAlg), /Algorithm 33 is not 1-32/);
    const fewOps = syntheticVoice(5); fewOps.operators.pop();
    assert.throws(() => generateDsp(fewOps), /6 entries/);
});

// ---- parseSyx / generateNRPN --------------------------------------------------

test('parseSyx round-trips a synthetic bulk dump into the same voice values', () => {
    const voices = parseSyx(syntheticSyx());
    assert.equal(voices.length, 32);
    for (let i = 0; i < 32; i++) {
        const expected = syntheticVoice((i % 32) + 1);
        const got = voices[i];
        assert.equal(got.name, expected.name);
        assert.equal(got.algorithm, expected.algorithm);
        for (const k of Object.keys(expected)) {
            if (k === 'operators') continue;
            assert.equal(got[k], expected[k], `voice ${i} ${k}`);
        }
        assert.deepEqual(got.operators, expected.operators, `voice ${i} operators`);
    }
    assert.throws(() => parseSyx(new Uint8Array(4104)), /Not a DX7 32-voice bulk dump/);
});

test('generateNRPN still produces the 144-parameter block for the legacy workflow', () => {
    const seq = generateNRPN(syntheticVoice(5), 3);
    assert.ok(seq.startsWith('// SYNTH TEST (DX7 ROM) — Algorithm 5\ncreateTrack(3).play(['));
    assert.equal((seq.match(/nrpn\(0, \d+, \d+\)/g) || []).length, 144);
    assert.ok(seq.includes('nrpn(0, 1, 32),   // Transpose=-12'));
});
