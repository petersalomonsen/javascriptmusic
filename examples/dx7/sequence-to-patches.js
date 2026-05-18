#!/usr/bin/env node
// DX7 NRPN sequence → typed-field patch generator.
//
// Read an existing song that uses `nrpn(beat, idx, value)` blocks to load
// DX7 patches (e.g. examples/dx7/dx7-sequence.js or its descendants),
// and emit the equivalent typed-field assignments for the per-algorithm
// .ts files produced by `faust2asc.js` in --for-editor mode (modular,
// one .ts per .dsp — see faust/dx7/).
//
// Why bother:
//   - The old `--bundle` workflow set patches via `nrpn(beat, idx, val)`
//     calls inside the song. Each call resolves to controlchange(99, MSB)
//     + controlchange(98, LSB) + controlchange(6, value), and the
//     bundle's switch scales `value` to the field's Faust-native range
//     internally (e.g. 0-127 → 0-7 for feedback).
//   - In the modular workflow the song just plays notes, and patches go
//     in synth.ts as direct field assignments. Each assignment must use
//     the *scaled* value, not the raw NRPN value — assigning 0-127 to a
//     0-7 field crashes the DSP with `unreachable` on the first note.
//
// What this does:
//   1. Parse `nrpn(0, IDX, VAL)` calls per `createTrack(N).play([...])`
//      block in the source song to get the raw NRPN settings per channel.
//   2. Parse each algorithm's transpiled .ts to extract the per-NRPN
//      scaling expression from its `_setParam` switch (e.g.
//      `<f32>value / 127.0 * 7`).
//   3. Evaluate the scaling expression at codegen time with the raw
//      value, skip params whose scaled value matches the field's init
//      default, and emit `channel.fieldName = <f32>SCALED;`.
//
// Output goes to stdout. Pipe / paste into synth.ts (inside
// `initializeMidiSynth()`). The script doesn't write to your repo
// directly — you stitch its output together with the surrounding mix
// boilerplate (imports, masterMe, drum-kit factory, postprocess).
//
// Usage:
//   node sequence-to-patches.js \
//       --src   path/to/source-song.js \
//       --faust path/to/repo/faust/dx7 \
//       [--map  '0:epiano:dx7_alg5:Dx7Alg5,1:bass:dx7_alg16:Dx7Alg16,...']
//       [--drum '4:0=kickRouter:dx7_alg17:Dx7Alg17,4:144=snareRouter:...,4:288=hatRouter:...']
//
// Defaults reproduce the dx7template / IFC concert layout: ch 0-3 are
// melodic, ch 4 is a combined drum kit with kick/snare/hat router
// channels at NRPN offsets 0/144/288 in the source.

import fs from 'fs';
import path from 'path';

// ── CLI parsing ────────────────────────────────────────────────

function getArg(name, fallback = null) {
    const idx = process.argv.indexOf(name);
    if (idx < 0) return fallback;
    return process.argv[idx + 1] ?? fallback;
}

const SRC = getArg('--src', path.join(import.meta.dirname, 'dx7-sequence.js'));
const FAUST_DIR = getArg('--faust', null);
if (!FAUST_DIR) {
    console.error('error: --faust <dir> required (path to repo\'s faust/dx7/ folder with the transpiled .ts files)');
    process.exit(1);
}

const DEFAULT_MAP = '0:epiano:dx7_alg5:Dx7Alg5,1:bass:dx7_alg16:Dx7Alg16,2:strings:dx7_alg2:Dx7Alg2,3:bells:dx7_alg5_bells:Dx7Alg5Bells';
const DEFAULT_DRUM = '4:0=kickRouter:dx7_alg17:Dx7Alg17,4:144=snareRouter:dx7_alg21:Dx7Alg21,4:288=hatRouter:dx7_alg5_hat:Dx7Alg5Hat';

const melodic = getArg('--map', DEFAULT_MAP).split(',').map(s => {
    const [ch, name, alg, cls] = s.split(':');
    return { ch: +ch, name, alg, cls, srcChannel: +ch, isRouter: false };
});
const drums = getArg('--drum', DEFAULT_DRUM).split(',').map(s => {
    // shape: "<srcCh>:<offset>=<name>:<alg>:<cls>"
    const [head, alg, cls] = s.split(':');
    // wait — colons are also separators for the head. parse manually:
    const parts = s.split(':');
    const srcChannel = +parts[0];
    const offsetEq = parts[1];                                // e.g. "0=kickRouter"
    const eq = offsetEq.indexOf('=');
    const nrpnOffset = +offsetEq.slice(0, eq);
    const name = offsetEq.slice(eq + 1);
    return { srcChannel, nrpnOffset, name, alg: parts[2], cls: parts[3], isRouter: true };
});

// ── Per-algorithm scaling map ──────────────────────────────────

function readChannelMap(tsPath) {
    const src = fs.readFileSync(tsPath, 'utf8');
    const map = {};
    // Capture field declarations: doc comment with init + NRPN, then the
    // typed field on the next line.
    const fieldRe = /\/\*\* ([^\[]+)\[init: (-?[0-9.e+\-]+),[^\*]*· NRPN (\d+) \*\/\s*\n\s*(\w+):\s*f32/g;
    let m;
    while ((m = fieldRe.exec(src))) {
        map[+m[3]] = { name: m[4], init: parseFloat(m[2]), scaleExpr: null };
    }
    // Scaling lives in `private _setParam(param: u16, value: u8)` — not
    // the outer controlchange switch (which handles CC 99/98/6 and would
    // collide with NRPN indices like 99 in our case-statement match).
    const setParamStart = src.indexOf('private _setParam(');
    if (setParamStart < 0) throw new Error(`no _setParam in ${tsPath}`);
    const setParamRegion = src.slice(setParamStart);
    const caseRe = /case (\d+): this\.(\w+) = ([^;]+); break;/g;
    while ((m = caseRe.exec(setParamRegion))) {
        const nrpn = +m[1];
        const expr = m[3].replace(/<f32>/g, '');
        if (map[nrpn]) {
            if (map[nrpn].name !== m[2]) throw new Error(`NRPN ${nrpn}: field name mismatch ${map[nrpn].name} vs ${m[2]}`);
            map[nrpn].scaleExpr = expr;
        }
    }
    return map;
}

const evalScale = (expr, value) => Function('value', `return ${expr};`)(value);

// ── Source NRPN block per channel ──────────────────────────────

function readChannelNrpnBlock(seqSrc, channel) {
    const startMarker = `createTrack(${channel}).play([`;
    const start = seqSrc.indexOf(startMarker);
    if (start < 0) return {};       // channel not configured via play() block — likely no NRPN setup
    const end = seqSrc.indexOf(']);', start);
    const block = seqSrc.slice(start, end);
    const re = /nrpn\(\s*0\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
    const out = {};
    let m;
    while ((m = re.exec(block))) out[+m[1]] = +m[2];
    return out;
}

// ── Emit ───────────────────────────────────────────────────────

const seqSrc = fs.readFileSync(SRC, 'utf8');
const EPS = 0.001;

function fmt(n) {
    return Math.abs(n - Math.round(n)) < 1e-3
        ? String(Math.round(n))
        : n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

function emitBlock(spec) {
    const map = readChannelMap(path.join(FAUST_DIR, spec.alg + '.ts'));
    const srcNrpns = readChannelNrpnBlock(seqSrc, spec.srcChannel);
    const offset = spec.nrpnOffset || 0;
    if (spec.isRouter) {
        console.log(`    // ${spec.name.replace(/Router$/, '')} patch (${spec.cls}, params on ${spec.name}):`);
    } else {
        console.log(`    // --- ch ${spec.ch}: ${spec.name} (${spec.cls}) ---`);
        console.log(`    const ${spec.name} = new ${spec.cls}Channel(10, (ch: MidiChannel) => new ${spec.cls}(ch));`);
        console.log(`    midichannels[${spec.ch}] = ${spec.name};`);
    }
    let n = 0;
    for (const idx of Object.keys(srcNrpns).map(Number).sort((a, b) => a - b)) {
        const local = idx - offset;
        const slot = map[local];
        if (!slot || !slot.scaleExpr) continue;
        const scaled = evalScale(slot.scaleExpr, srcNrpns[idx]);
        if (Math.abs(scaled - slot.init) < EPS) continue;
        console.log(`    ${spec.name}.${slot.name} = <f32>${fmt(scaled)};`);
        n++;
    }
    console.log(`    // (${n} non-default params)`);
    console.log('');
}

for (const spec of melodic) emitBlock(spec);
for (const spec of drums)   emitBlock(spec);
