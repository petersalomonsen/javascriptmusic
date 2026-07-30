#!/usr/bin/env node
// validate-module.mjs — gate a freshly built faust-rs compiler module before
// it is repackaged as @psalomo/faustwasm and published.
//
//   node tools/faust-compiler-module/validate-module.mjs <faust-compiler-module.wasm>
//
// The module is loaded exactly the way the app loads it: a bare
// `WebAssembly.instantiate(bytes, {})`, no emscripten loader, no MEMFS
// (see wasmaudioworklet/faust/faust-rs-transpile.js and tools/faust2as/faust2asc.js
// for the ABI). Every check below has a corresponding way of failing that has
// actually happened, so none of them are decorative:
//
//   1. exports        — the whole ABI the two callers use must be present,
//                       including the diagnostics-v2 exports (0.16.1-asc.4+).
//   2. execution opts  — `--ec --os` must produce a native control()/frame()
//                       class. Older modules silently ignored the flags and
//                       emitted the classic block-compute class instead. The
//                       fixture imports stdfaust.lib, so this also proves the
//                       Faust standard libraries got embedded into the module
//                       (build without FAUST_RS_EMBEDDED_LIB_ROOT → fails here).
//   3. diagnostics     — a compile failure must carry a structured
//                       diagnostics-v2 report, not just a message string.
//   4. compile budget  — a real-world heavy DSP (dx.algorithm) must transpile
//                       well inside the budget; front-end perf blow-ups in
//                       this class have shipped before.
//
// Exit code 0 = all checks passed, 1 = at least one failed (all checks run, so
// one run reports every problem).

import fs from 'fs';
import path from 'path';

const modulePath = process.argv[2];
if (!modulePath) {
    console.error('Usage: node validate-module.mjs <faust-compiler-module.wasm>');
    process.exit(2);
}
if (!fs.existsSync(modulePath)) {
    console.error(`Compiler module not found: ${modulePath}`);
    process.exit(2);
}

// Budget for check 4. Overridable so a slow/loaded runner can be given room
// without editing the script; the default is the CI value.
const BUDGET_MS = Number(process.env.FAUST_MODULE_BUDGET_MS || 30000);

const REQUIRED_EXPORTS = [
    'memory',
    'faust_wasm_alloc',
    'faust_wasm_dealloc',
    'faust_wasm_generate_aux_files_json',
    'faust_wasm_text_result_is_ok',
    'faust_wasm_text_result_ptr',
    'faust_wasm_text_result_len',
    'faust_wasm_text_result_free',
    'faust_wasm_version_ptr',
    'faust_wasm_version_len',
    // diagnostics-v2 (0.16.1-asc.4 and later)
    'faust_wasm_text_result_diagnostics_ptr',
    'faust_wasm_text_result_diagnostics_len',
];

const failures = [];
function check(name, fn) {
    try {
        const detail = fn();
        console.log(`  ok   ${name}${detail ? ` — ${detail}` : ''}`);
    } catch (err) {
        failures.push(name);
        console.log(`  FAIL ${name} — ${err.message}`);
    }
}
function assert(condition, message) {
    if (!condition) throw new Error(message);
}

const bytes = fs.readFileSync(modulePath);
assert(
    bytes.length > 4 && bytes[0] === 0x00 && bytes[1] === 0x61 && bytes[2] === 0x73 && bytes[3] === 0x6d,
    `${modulePath} does not start with the \\0asm magic`
);
console.log(`Validating ${path.resolve(modulePath)} (${(bytes.length / 1048576).toFixed(2)} MiB)\n`);

const { instance } = await WebAssembly.instantiate(bytes, {});
const e = instance.exports;

const encoder = new TextEncoder();
const decoder = new TextDecoder();
// Re-read the view on every use: the module grows its memory during a compile,
// which detaches any previously taken Uint8Array.
const mem = () => new Uint8Array(e.memory.buffer);

function writeString(s) {
    const b = encoder.encode(s);
    const ptr = e.faust_wasm_alloc(b.length);
    mem().set(b, ptr);
    return [ptr, b.length];
}

// One generateAuxFiles call, returning everything the callers can observe:
// success flag, the textual artifact (already base64-decoded) or the error
// message, and the structured diagnostics payload when the compiler retained one.
function compile(name, source, args) {
    const [np, nl] = writeString(name);
    const [sp, sl] = writeString(source);
    const [ap, al] = writeString(args);
    let handle;
    try {
        handle = e.faust_wasm_generate_aux_files_json(np, nl, sp, sl, ap, al);
    } finally {
        e.faust_wasm_dealloc(np, nl);
        e.faust_wasm_dealloc(sp, sl);
        e.faust_wasm_dealloc(ap, al);
    }
    const ok = !!e.faust_wasm_text_result_is_ok(handle);
    const ptr = e.faust_wasm_text_result_ptr(handle);
    const len = e.faust_wasm_text_result_len(handle);
    const text = decoder.decode(mem().slice(ptr, ptr + len));
    let diagnostics = null;
    // Guarded the same way the callers guard it, so a pre-diagnostics module
    // fails only the checks that are actually about diagnostics.
    if (typeof e.faust_wasm_text_result_diagnostics_len === 'function') {
        const dlen = e.faust_wasm_text_result_diagnostics_len(handle);
        if (dlen > 0) {
            const dptr = e.faust_wasm_text_result_diagnostics_ptr(handle);
            diagnostics = decoder.decode(mem().slice(dptr, dptr + dlen));
        }
    }
    e.faust_wasm_text_result_free(handle);

    if (!ok) return { ok, error: text, diagnostics };
    const files = JSON.parse(text);
    const file = files.find(f => !f.binary);
    assert(file, 'no textual artifact in the generateAuxFiles result');
    return { ok, source: Buffer.from(file.content_base64, 'base64').toString('utf-8'), diagnostics };
}

// ---------------------------------------------------------------------------
// 1. ABI exports
// ---------------------------------------------------------------------------
check('exports: full ABI present', () => {
    const missing = REQUIRED_EXPORTS.filter(name => !(name in e));
    assert(missing.length === 0, `missing exports: ${missing.join(', ')}`);
    const version = decoder.decode(
        mem().slice(e.faust_wasm_version_ptr(), e.faust_wasm_version_ptr() + e.faust_wasm_version_len())
    );
    return version;
});

// ---------------------------------------------------------------------------
// 2. Execution options + embedded standard libraries
// ---------------------------------------------------------------------------
check('execution options: -lang asc --ec --os emits control()/frame()', () => {
    const result = compile(
        'validation',
        'import("stdfaust.lib");\n'
        + 'freq = hslider("freq", 440, 20, 20000, 0.01);\n'
        + 'gain = hslider("gain", 0.5, 0, 1, 0.01);\n'
        + 'process = os.osc(freq) * gain;\n',
        '-lang asc -cn TDsp --ec --os -o /validation.out.ts'
    );
    assert(result.ok, `compilation failed: ${result.error}`);
    assert(result.source.includes('class TDsp'), '-cn TDsp did not name the generated class');
    assert(result.source.includes('control(): void {'), 'no control() in the generated class (--ec ignored?)');
    assert(
        result.source.includes('frame(inputs: StaticArray<f32>, outputs: StaticArray<f32>): void {'),
        'no frame(inputs, outputs) in the generated class (--os ignored?)'
    );
    return `${result.source.length} chars, stdfaust.lib resolved from the embedded bundle`;
});

// ---------------------------------------------------------------------------
// 3. Structured diagnostics on failure
// ---------------------------------------------------------------------------
check('diagnostics: misspelled identifier yields a structured report', () => {
    const result = compile(
        'validation',
        'import("stdfaust.lib");\nprocess = os.osccc(440);\n',
        '-lang asc -cn TDsp --ec --os -o /validation.out.ts'
    );
    assert(!result.ok, 'compiling a misspelled identifier unexpectedly succeeded');
    assert(result.diagnostics, 'no diagnostics payload retained (diagnostics_len was 0)');
    let payload;
    try {
        payload = JSON.parse(result.diagnostics);
    } catch (err) {
        throw new Error(`diagnostics payload is not valid JSON: ${err.message}`);
    }
    const diagnostics = payload.diagnostics || [];
    assert(diagnostics.length > 0, 'diagnostics payload carries an empty diagnostics array');
    const first = diagnostics[0];
    assert(
        first.code === 'FRS-EVAL-0002',
        `expected the undefined-symbol code FRS-EVAL-0002, got ${JSON.stringify(first.code)}`
    );
    assert(
        first.category === 'user_code',
        `expected category "user_code", got ${JSON.stringify(first.category)}`
    );
    return `schema_version ${payload.schema_version}, ${diagnostics.length} diagnostic(s), ${first.code}`;
});

// ---------------------------------------------------------------------------
// 4. Compile-time budget
// ---------------------------------------------------------------------------
check(`compile budget: dx.algorithm(5) under ${BUDGET_MS} ms`, () => {
    const started = process.hrtime.bigint();
    const result = compile(
        'dx7_alg5',
        'import("stdfaust.lib");\nprocess = dx.algorithm(5) <: _,_;\n',
        '-lang asc -cn Dx7Alg5Dsp --ec --os -o /dx7_alg5.out.ts'
    );
    const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
    assert(result.ok, `compilation failed: ${result.error}`);
    // dx7.lib lives in a faustlibraries subdirectory — a regression in the
    // flattened embed aliases shows up here rather than in check 2.
    assert(result.source.includes('class Dx7Alg5Dsp'), 'dx.algorithm(5) produced no Dx7Alg5Dsp class');
    assert(
        elapsedMs < BUDGET_MS,
        `took ${elapsedMs.toFixed(0)} ms, over the ${BUDGET_MS} ms budget`
    );
    return `${elapsedMs.toFixed(0)} ms, ${result.source.length} chars`;
});

console.log('');
if (failures.length > 0) {
    console.error(`Module validation FAILED: ${failures.length} check(s) — ${failures.join('; ')}`);
    process.exit(1);
}
console.log('Module validation passed.');
