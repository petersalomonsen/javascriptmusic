#!/usr/bin/env node
// faust2asc.js — Faust DSP to AssemblyScript MidiVoice transpiler (ASC backend)
//
// Usage: node faust2asc.js <input.dsp> [--name ClassName] [--out output.ts]
//        node faust2asc.js --bundle <dsp1> <dsp2> ... [--out output.ts]
//
// Runs `faust -lang asc --ec --os` through the plain wasm32 compiler module
// (same module and ABI as the browser editor path in faust-rs-transpile.js;
// the Faust standard libraries are embedded in the module). The native class
// ships control()/frame() entry points; the wrapper codegen lives in
//   ../../wasmaudioworklet/faust/transpile-core.js
// so the browser-side Faust editor reuses it.
//
// Compiler module resolution order:
//   1. $FAUST_RS_COMPILER_MODULE            (explicit path, developer builds)
//   2. wasmaudioworklet/faust/faust_wasm_ffi.wasm  (gitignored local drop)
//   3. @psalomo/faustwasm/faust-compiler-module.wasm (npm package)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    toClassName,
    transpileDsp as transpileDspPure,
    transpileEffect as transpileEffectPure,
    assembleSingleFile,
    assembleBundle,
} from '../../wasmaudioworklet/faust/transpile-core.js';
import { formatDiagnosticsForHumans } from '../../wasmaudioworklet/faust/faust-diagnostics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: node faust2as.js <input.dsp> [--name ClassName] [--out output.ts]`);
    console.log(`       node faust2as.js --bundle <dsp1> <dsp2> ... [--out output.ts]`);
    console.log(`  --name      Class name for the generated MidiVoice (default: derived from filename)`);
    console.log(`  --out       Output .ts file path`);
    console.log(`  --bundle    Transpile multiple DSPs into a single bundle with initializeMidiSynth()`);
    console.log(`  --effect    Generate a standalone Effect class (stereo in/out) with a default singleton wired into postprocess() on outputline`);
    process.exit(0);
}

const bundleMode = args.includes('--bundle');
const forEditor = args.includes('--for-editor');
const effectMode = args.includes('--effect');
let outputPath = null;
let className = null;
const dspFiles = [];

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--bundle') continue;
    if (args[i] === '--for-editor') continue;
    if (args[i] === '--effect') continue;
    if (args[i] === '--name' && args[i + 1]) { className = args[++i]; continue; }
    if (args[i] === '--out' && args[i + 1]) { outputPath = args[++i]; continue; }
    dspFiles.push(args[i]);
}

if (dspFiles.length === 0) {
    console.error('No .dsp files specified');
    process.exit(1);
}

if (effectMode) {
    if (!className) {
        className = toClassName(path.basename(dspFiles[0], '.dsp'));
    }
    if (!outputPath) {
        outputPath = path.resolve(__dirname, '..', '..', 'wasmaudioworklet', 'synth1', 'assembly', 'midi', 'instruments', className.toLowerCase() + '.ts');
    }
} else if (!bundleMode) {
    if (!className) {
        const base = path.basename(dspFiles[0], '.dsp');
        className = base.charAt(0).toUpperCase() + base.slice(1).replace(/MIDI$/i, '');
    }
    if (!outputPath) {
        outputPath = path.resolve(__dirname, '..', '..', 'wasmaudioworklet', 'synth1', 'assembly', 'midi', 'instruments', className.toLowerCase() + '.ts');
    }
} else {
    if (!outputPath) {
        outputPath = path.resolve(__dirname, 'synth_bundle.ts');
    }
}

// ---------------------------------------------------------------------------
// faust-rs wasm compiler module bootstrap + sync compile-to-AS helper
// ---------------------------------------------------------------------------

function resolveCompilerModulePath() {
    const candidates = [];
    if (process.env.FAUST_RS_COMPILER_MODULE) {
        candidates.push(process.env.FAUST_RS_COMPILER_MODULE);
    }
    candidates.push(path.resolve(__dirname, '..', '..', 'wasmaudioworklet', 'faust', 'faust_wasm_ffi.wasm'));
    try {
        const faustwasmDir = path.dirname(
            fileURLToPath(import.meta.resolve('@psalomo/faustwasm/package.json'))
        );
        candidates.push(path.join(faustwasmDir, 'faust-compiler-module.wasm'));
    } catch (_) { /* package not installed */ }
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) return candidate;
    }
    console.error('faust compiler module not found. Tried:\n  ' + candidates.join('\n  '));
    process.exit(1);
}

const modulePath = resolveCompilerModulePath();
const { instance } = await WebAssembly.instantiate(fs.readFileSync(modulePath), {});
const wasmExports = instance.exports;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const wasmMem = () => new Uint8Array(wasmExports.memory.buffer);

function writeWasmString(s) {
    const bytes = textEncoder.encode(s);
    const ptr = wasmExports.faust_wasm_alloc(bytes.length);
    wasmMem().set(bytes, ptr);
    return [ptr, bytes.length];
}

// generateAuxFiles(name, source, args) → generated AS text; throws with the
// compiler's error message on failure. Same JSON-array export protocol as
// the browser path (faust-rs-transpile.js).
function generateAuxFiles(name, source, args) {
    const [np, nl] = writeWasmString(name);
    const [sp, sl] = writeWasmString(source);
    const [ap, al] = writeWasmString(args);
    let handle;
    try {
        handle = wasmExports.faust_wasm_generate_aux_files_json(np, nl, sp, sl, ap, al);
    } catch (err) {
        throw new Error('faust compiler crashed: ' + err);
    } finally {
        wasmExports.faust_wasm_dealloc(np, nl);
        wasmExports.faust_wasm_dealloc(sp, sl);
        wasmExports.faust_wasm_dealloc(ap, al);
    }
    const ok = wasmExports.faust_wasm_text_result_is_ok(handle);
    const ptr = wasmExports.faust_wasm_text_result_ptr(handle);
    const len = wasmExports.faust_wasm_text_result_len(handle);
    const text = textDecoder.decode(wasmMem().slice(ptr, ptr + len));
    // Structured diagnostics-v2 report retained by compiler failures
    // (modules >= 0.16.1-asc.4; older modules lack the exports).
    let diagnostics = null;
    if (!ok && typeof wasmExports.faust_wasm_text_result_diagnostics_len === 'function') {
        const dlen = wasmExports.faust_wasm_text_result_diagnostics_len(handle);
        if (dlen > 0) {
            const dptr = wasmExports.faust_wasm_text_result_diagnostics_ptr(handle);
            try {
                diagnostics = JSON.parse(textDecoder.decode(wasmMem().slice(dptr, dptr + dlen)));
            } catch (err) { /* malformed payload — keep the message */ }
        }
    }
    wasmExports.faust_wasm_text_result_free(handle);
    if (!ok) {
        const human = diagnostics ? formatDiagnosticsForHumans(diagnostics, source) : '';
        const error = new Error('faust: ' + (human || text || 'compilation failed'));
        error.faustDiagnostics = diagnostics;
        throw error;
    }
    const files = JSON.parse(text);
    const file = files.find(f => !f.binary);
    if (!file) {
        throw new Error('faust: no textual artifact in generateAuxFiles result');
    }
    return Buffer.from(file.content_base64, 'base64').toString('utf-8');
}

// Sibling .dsp/.lib files travel inline in the argv as
// `--virtual-source <relPath>=<base64>` entries so `library("lib/foo.dsp")`
// and `import("siblings.lib")` resolve against the embedded stdlib bundle.
const virtualSourceCache = new Map();
function virtualSourceArgsFor(dspDir) {
    if (virtualSourceCache.has(dspDir)) return virtualSourceCache.get(dspDir);
    const parts = [];
    function walk(dir, relBase) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const hostPath = path.join(dir, entry.name);
            const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                walk(hostPath, relPath);
            } else if (/\.(dsp|lib)$/.test(entry.name)) {
                const b64 = fs.readFileSync(hostPath).toString('base64');
                parts.push(`--virtual-source ${relPath}=${b64}`);
            }
        }
    }
    walk(dspDir, '');
    const argsString = parts.join(' ');
    virtualSourceCache.set(dspDir, argsString);
    return argsString;
}

// Compile a Faust .dsp file to native AssemblyScript source (with the
// `--ec --os` execution options, so the class exposes control()/frame()).
// argsTail carries the per-call options (e.g. "-cn MyClassDsp" or
// "-cn MyClassEffectDsp -pn effect"). Throws on failure.
function compileFaustToAS(inputDsp, argsTail) {
    const dspPath = path.resolve(inputDsp);
    const dspBase = path.basename(dspPath);
    const dspSource = fs.readFileSync(dspPath, 'utf-8');
    const vsArgs = virtualSourceArgsFor(path.dirname(dspPath));
    try {
        return generateAuxFiles(
            dspBase.replace(/\.dsp$/, ''),
            dspSource,
            `-lang asc ${argsTail} --ec --os ${vsArgs} -o /${dspBase}.out.ts`
        );
    } catch (err) {
        console.error(`Faust compilation failed for ${inputDsp}:\n${err.message}`);
        process.exit(1);
    }
}

// ---------------------------------------------------------------------------
// CLI wrappers around the pure transpile-core functions
// ---------------------------------------------------------------------------

// Read the .dsp, run faust (twice if effect=...), then call the pure
// transpileDsp from transpile-core.js.
function transpileDsp(inputDsp, clsName, options = {}) {
    const dspSource = fs.readFileSync(path.resolve(inputDsp), 'utf-8');
    const hasEffect = /^\s*effect\s*=/m.test(dspSource);

    console.log(`Compiling ${path.basename(inputDsp)} -> ${clsName} (asc, native control/frame)`);
    const asSource = compileFaustToAS(inputDsp, `-cn ${clsName}Dsp`);

    let effectAsSource = null;
    if (hasEffect) {
        console.log(`Compiling ${path.basename(inputDsp)} effect -> ${clsName}EffectDsp (asc)`);
        effectAsSource = compileFaustToAS(inputDsp, `-cn ${clsName}EffectDsp -pn effect`);
        console.log(`Detected effect declaration — will generate ${clsName}Channel MidiChannel subclass`);
    }

    const result = transpileDspPure({
        asSource,
        effectAsSource,
        clsName,
        sourceFile: path.basename(inputDsp),
        options,
    });

    if (result.ccParams.length > 0) {
        if (result.useNRPN) {
            console.log(`  ${result.ccParams.length} params mapped to NRPN (0–${result.ccParams.length - 1})`);
        } else {
            const mappedCount = result.ccParams.filter(p => p.cc !== undefined).length;
            console.log(`  ${mappedCount}/${result.ccParams.length} params mapped to MIDI CC (max CC 119)`);
        }
    }

    return result;
}

function transpileEffect(inputDsp, clsName) {
    console.log(`Compiling ${path.basename(inputDsp)} -> ${clsName} (asc, effect)`);
    const asSource = compileFaustToAS(inputDsp, `-cn ${clsName}Dsp`);
    return transpileEffectPure({
        asSource,
        clsName,
        sourceFile: path.basename(inputDsp),
    });
}

// ---------------------------------------------------------------------------
// Main: Execute
// ---------------------------------------------------------------------------

let output;
if (effectMode) {
    output = transpileEffect(dspFiles[0], className);
} else if (bundleMode) {
    const results = dspFiles.map(dsp => {
        const base = path.basename(dsp, '.dsp');
        const name = base.charAt(0).toUpperCase() + base.slice(1).replace(/MIDI$/i, '');
        return transpileDsp(dsp, name, {
            voiceTablePrefix: name + '_',
            voiceWavePrefix: name,
            effectTablePrefix: name + '_eff_',
            effectWavePrefix: name + '_eff',
            voiceSigPrefix: '_' + name,
            effectSigPrefix: '_' + name + '_eff',
        });
    });
    output = assembleBundle(results, { forEditor });
} else {
    const result = transpileDsp(dspFiles[0], className, {});
    output = assembleSingleFile(result, { forEditor });
}

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, output.join('\n'));
console.log(`Generated: ${outputPath}`);
