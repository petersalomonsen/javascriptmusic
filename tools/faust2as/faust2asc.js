#!/usr/bin/env node
// faust2asc.js — Faust DSP to AssemblyScript MidiVoice transpiler (ASC backend)
//
// Usage: node faust2asc.js <input.dsp> [--name ClassName] [--out output.ts]
//        node faust2asc.js --bundle <dsp1> <dsp2> ... [--out output.ts]
//
// Runs `faust -lang asc` (via @psalomo/faustwasm — wasm-compiled libfaust with
// the AssemblyScript backend enabled) on the input .dsp, then reshapes the
// generated AssemblyScript class into a MidiVoice subclass for the synth engine.
//
// Pure reshape/codegen logic lives in
//   ../../wasmaudioworklet/faust/transpile-core.js
// so the browser-side Faust editor can reuse it.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    instantiateFaustModuleFromFile,
    LibFaust,
    FaustCompiler,
} from '@psalomo/faustwasm/dist/esm/index.js';
import {
    toClassName,
    transpileDsp as transpileDspPure,
    transpileEffect as transpileEffectPure,
    assembleSingleFile,
    assembleBundle,
} from '../../wasmaudioworklet/faust/transpile-core.js';

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
// libfaust-wasm bootstrap + sync compile-to-AS helper
// ---------------------------------------------------------------------------

const faustwasmDir = path.dirname(
    fileURLToPath(import.meta.resolve('@psalomo/faustwasm/package.json'))
);
const libfaustJs = path.join(faustwasmDir, 'libfaust-wasm', 'libfaust-wasm.js');

const faustModule = await instantiateFaustModuleFromFile(libfaustJs);
const libFaust = new LibFaust(faustModule);
const faustCompiler = new FaustCompiler(libFaust);
const faustFS = faustModule.FS;

// Mirror the host directory containing inputDsp into the libfaust virtual FS at
// /work/, so that `library("lib/foo.dsp")` and `import("siblings.lib")`
// resolve. Re-mounts on every call (overwrites are cheap).
const mountedDirs = new Set();
function mountDspDir(hostDir) {
    if (mountedDirs.has(hostDir)) return;
    function walk(dir, virtBase) {
        try { faustFS.mkdir(virtBase); } catch (_) { /* exists */ }
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const hostPath = path.join(dir, entry.name);
            const virtPath = `${virtBase}/${entry.name}`;
            if (entry.isDirectory()) {
                walk(hostPath, virtPath);
            } else if (/\.(dsp|lib)$/.test(entry.name)) {
                faustFS.writeFile(virtPath, fs.readFileSync(hostPath));
            }
        }
    }
    walk(hostDir, '/work');
    mountedDirs.add(hostDir);
}

// Compile a Faust .dsp file to AssemblyScript source via libfaust-wasm.
// argsTail is the rest of the faust args (e.g. "-cn MyClass" or "-cn MyClass -pn effect").
// Returns the AS source as a string. Throws on failure.
function compileFaustToAS(inputDsp, argsTail) {
    const dspPath = path.resolve(inputDsp);
    const dspDir = path.dirname(dspPath);
    const dspBase = path.basename(dspPath);

    mountDspDir(dspDir);

    const dspSource = fs.readFileSync(dspPath, 'utf-8');
    const outVirt = `/${dspBase}.out.ts`;
    const args = `${argsTail} -I /work -o ${outVirt}`;

    const ok = faustCompiler.generateAuxFiles(dspBase, dspSource, args);
    if (!ok) {
        const err = faustCompiler.getErrorMessage() || '(no error message)';
        console.error(`Faust compilation failed for ${inputDsp}:\n${err}`);
        process.exit(1);
    }

    let asSource = faustFS.readFile(outVirt, { encoding: 'utf8' });
    // Strip redundant <i32>() casts in for-loop headers (Faust 2.85.3+):
    // "for (let x: i32 = <i32>(0); x < <i32>(N); x = (x + <i32>(1)))"
    asSource = asSource.replace(
        /for\s*\(\s*let\s+(\w+):\s*i32\s*=\s*<i32>\((\d+)\);\s*\1\s*<\s*<i32>\((\d+)\);\s*\1\s*=\s*\(\1\s*\+\s*<i32>\(1\)\)\)/g,
        'for (let $1: i32 = $2; $1 < $3; $1 = ($1 + 1))'
    );
    return asSource;
}

// ---------------------------------------------------------------------------
// CLI wrappers around the pure transpile-core functions
// ---------------------------------------------------------------------------

// Read the .dsp, run faust (twice if effect=...), then call the pure
// transpileDsp from transpile-core.js.
function transpileDsp(inputDsp, clsName, options = {}) {
    const dspSource = fs.readFileSync(path.resolve(inputDsp), 'utf-8');
    const hasEffect = /^\s*effect\s*=/m.test(dspSource);

    console.log(`Compiling ${path.basename(inputDsp)} -> ${clsName} (asc)`);
    const asSource = compileFaustToAS(inputDsp, `-lang asc -cn ${clsName}`);

    let effectAsSource = null;
    if (hasEffect) {
        const effectClassName = clsName + 'Effect';
        console.log(`Compiling ${path.basename(inputDsp)} effect -> ${effectClassName} (asc)`);
        effectAsSource = compileFaustToAS(inputDsp, `-lang asc -cn ${effectClassName} -pn effect`);
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
    const asSource = compileFaustToAS(inputDsp, `-lang asc -cn ${clsName}`);
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
