// browser-transpile.js — Faust .dsp → AssemblyScript transpiler for the
// in-browser editor. Lazy-loads @psalomo/faustwasm from jsDelivr, mounts
// any sibling .lib/.dsp files into the libfaust virtual FS, runs faust
// (twice if there's an effect= declaration, or once for a standalone
// stereo effect), then calls the pure transpile-core to assemble the .ts.

import {
    transpileDsp,
    transpileEffect,
    assembleSingleFile,
    toClassName,
} from './transpile-core.js';
import { toggleSpinner } from '../common/ui/progress-spinner.js';

const FAUSTWASM_VERSION = '0.16.1-asc.0';
const CDN_BASE = `https://cdn.jsdelivr.net/npm/@psalomo/faustwasm@${FAUSTWASM_VERSION}`;

let compilerPromise = null;

async function getCompiler() {
    if (compilerPromise) return compilerPromise;
    compilerPromise = (async () => {
        const m = await import(/* webpackIgnore: true */ `${CDN_BASE}/dist/esm/index.js`);
        const faustModule = await m.instantiateFaustModuleFromFile(
            `${CDN_BASE}/libfaust-wasm/libfaust-wasm.js`
        );
        const libFaust = new m.LibFaust(faustModule);
        const compiler = new m.FaustCompiler(libFaust);
        return { compiler, fs: faustModule.FS };
    })();
    return compilerPromise;
}

// Strip the redundant <i32>() casts in for-loop headers that Faust 2.85.3+
// emits in its AS backend output (the CLI has the same regex).
function normalizeASSource(src) {
    return src.replace(
        /for\s*\(\s*let\s+(\w+):\s*i32\s*=\s*<i32>\((\d+)\);\s*\1\s*<\s*<i32>\((\d+)\);\s*\1\s*=\s*\(\1\s*\+\s*<i32>\(1\)\)\)/g,
        'for (let $1: i32 = $2; $1 < $3; $1 = ($1 + 1))'
    );
}

// Mount sibling .lib / .dsp files into /work/ for `library("...")` /
// `import("...")` lookups. relPath is relative to the .dsp's dir.
function mountSiblings(faustFS, libsByPath) {
    try { faustFS.mkdir('/work'); } catch (_) { /* exists */ }
    for (const [relPath, content] of Object.entries(libsByPath || {})) {
        const segments = relPath.split('/');
        let dir = '/work';
        for (let i = 0; i < segments.length - 1; i++) {
            dir += '/' + segments[i];
            try { faustFS.mkdir(dir); } catch (_) { /* exists */ }
        }
        const fullPath = '/work/' + relPath;
        try { faustFS.writeFile(fullPath, content); } catch (_) { /* ignore */ }
    }
}

// Detect mastering vs voice from the AS source's getNumInputs/getNumOutputs.
// 2-in / 2-out is treated as a stereo effect (mastering); anything else is a
// voice (typical 0-in / 1-out).
function isStereoEffect(asSource) {
    const inputsMatch = asSource.match(/getNumInputs\(\)\s*:\s*i32\s*\{[^}]*return\s+(\d+)/);
    const outputsMatch = asSource.match(/getNumOutputs\(\)\s*:\s*i32\s*\{[^}]*return\s+(\d+)/);
    const numIn = inputsMatch ? +inputsMatch[1] : 0;
    const numOut = outputsMatch ? +outputsMatch[1] : 0;
    return numIn === 2 && numOut === 2;
}

// Public API: transpile a .dsp source string to an assembled .ts file string.
//
//   dspSource    — the .dsp source code
//   dspBaseName  — basename like "master_me.dsp", "mysynth.dsp", or a
//                  sub-path like "mysong/dsp/master.dsp" (the part after
//                  the faust/ folder in wasm-git). Only the LEAF segment
//                  is used to derive the class name and the temp output
//                  filename in libfaust's virtual FS.
//   libsByPath   — optional map of path-relative-to-the-source-file →
//                  contents for sibling .lib / .dsp files used by
//                  library() / import().
//
// Returns { ts, className } where:
//   ts        — the assembled AssemblyScript file as a string
//   className — the resolved class name (matches what the synth mix needs to
//               import; the file does `export class <className> ...`)
//
// Throws on faust compilation error.
export async function transpileDspSource(dspSource, dspBaseName, libsByPath = {}) {
    toggleSpinner(true);
    try {
        const { compiler, fs: faustFS } = await getCompiler();
        mountSiblings(faustFS, libsByPath);

        // Derive the class name and faust virtual-FS output path from the
        // LEAF basename only — slashes in the full sub-path would break
        // both toClassName() and faust's `-o` (libfaust can't create
        // intermediate dirs in its virtual FS).
        const leaf = dspBaseName.split('/').pop();
        const leafStem = leaf.replace(/\.dsp$/, '');
        const clsName = toClassName(leafStem);
        const outVirt = `/${leafStem}.out.ts`;
        // The transpiled file lands in the wasm-git repo at
        //   faust/<dspBaseName-without-.dsp>.ts
        // and gets injected into the AS sources map at the same path.
        // The number of '..' segments needed for ../mixes/globalimports
        // and ../environment from there equals 1 + (slashes in dspBaseName).
        const importDepth = 1 + (dspBaseName.match(/\//g) || []).length;

        const ok = compiler.generateAuxFiles(
            leafStem,
            dspSource,
            `-lang asc -cn ${clsName} -I /work -o ${outVirt}`
        );
        if (!ok) {
            throw new Error('faust: ' + (compiler.getErrorMessage() || 'unknown error'));
        }
        const asSource = normalizeASSource(faustFS.readFile(outVirt, { encoding: 'utf8' }));

        if (isStereoEffect(asSource)) {
            const lines = transpileEffect({
                asSource,
                clsName,
                sourceFile: dspBaseName,
                importDepth,
            });
            return { ts: lines.join('\n'), className: clsName };
        }

        // Compile effect= section if present in the source.
        const hasEffect = /^\s*effect\s*=/m.test(dspSource);
        let effectAsSource = null;
        if (hasEffect) {
            const effectName = clsName + 'Effect';
            const effectOut = `/${leafStem}.effect.out.ts`;
            const effOk = compiler.generateAuxFiles(
                leafStem,
                dspSource,
                `-lang asc -cn ${effectName} -pn effect -I /work -o ${effectOut}`
            );
            if (!effOk) {
                throw new Error('faust effect: ' + (compiler.getErrorMessage() || 'unknown error'));
            }
            effectAsSource = normalizeASSource(faustFS.readFile(effectOut, { encoding: 'utf8' }));
        }

        const result = transpileDsp({
            asSource,
            effectAsSource,
            clsName,
            sourceFile: dspBaseName,
            options: {},
        });
        // Editor-context output uses the mixes/globalimports barrel so the
        // generated file can sit alongside the song's other source.
        return {
            ts: assembleSingleFile(result, { forEditor: true, importDepth }).join('\n'),
            className: clsName,
        };
    } finally {
        toggleSpinner(false);
    }
}
