// faust-rs-transpile.js — Faust .dsp → AssemblyScript transpiler backed by the
// faust-rs (Rust) compiler compiled to a plain wasm32-unknown-unknown module
// (faust_wasm_ffi.wasm), instead of the emscripten libfaust used by
// browser-transpile.js. Same public API: transpileDspSource().
//
// The module is loaded with a bare `WebAssembly.instantiate(bytes, {})` —
// no emscripten loader, no MEMFS. Sibling .lib/.dsp files travel inline in
// the args as `--virtual-source <path>=<base64>` entries, and `-pn effect`
// selects the `effect =` declaration just like the C++ faust path.
//
// The wasm artifact is built from the faust-rs workspace (gitignored here):
//   FAUST_RS_EMBEDDED_LIB_ROOT=<faustlibraries> \
//     cargo run -p xtask -- build-faustwasm-compiler-module
// then copy target/wasm32-unknown-unknown/release/faust_wasm_ffi.wasm to
// this folder. The Faust standard libraries are embedded in the module.

import {
    transpileDsp,
    transpileEffect,
    assembleSingleFile,
    toClassName,
} from './transpile-core.js';
import { toggleSpinner } from '../common/ui/progress-spinner.js';

const WASM_URL = new URL('./faust_wasm_ffi.wasm', import.meta.url);

let modulePromise = null;

async function getFaustRs() {
    if (modulePromise) return modulePromise;
    modulePromise = (async () => {
        const bytes = await (await fetch(WASM_URL)).arrayBuffer();
        const { instance } = await WebAssembly.instantiate(bytes, {});
        const e = instance.exports;
        const enc = new TextEncoder();
        const dec = new TextDecoder();
        const mem = () => new Uint8Array(e.memory.buffer);

        const writeStr = (s) => {
            const b = enc.encode(s);
            const p = e.faust_wasm_alloc(b.length);
            mem().set(b, p);
            return [p, b.length];
        };

        const version = dec.decode(
            mem().slice(
                e.faust_wasm_version_ptr(),
                e.faust_wasm_version_ptr() + e.faust_wasm_version_len()
            )
        );

        const readTextResult = (handle) => {
            const ok = e.faust_wasm_text_result_is_ok(handle);
            const ptr = e.faust_wasm_text_result_ptr(handle);
            const len = e.faust_wasm_text_result_len(handle);
            const text = dec.decode(mem().slice(ptr, ptr + len));
            e.faust_wasm_text_result_free(handle);
            return { ok, text };
        };

        // generateAuxFiles(name, source, args) → generated AS text; throws
        // with the compiler's error message on failure. Uses the JSON-array
        // export (each artifact base64-encoded) and returns the first
        // textual artifact.
        const generateAuxFiles = (name, source, args) => {
            const [np, nl] = writeStr(name);
            const [sp, sl] = writeStr(source);
            const [ap, al] = writeStr(args);
            let handle;
            try {
                handle = e.faust_wasm_generate_aux_files_json(np, nl, sp, sl, ap, al);
            } catch (err) {
                // A wasm trap (e.g. stack exhaustion) aborts the call itself.
                throw new Error('faust-rs: compiler crashed: ' + err);
            } finally {
                e.faust_wasm_dealloc(np, nl);
                e.faust_wasm_dealloc(sp, sl);
                e.faust_wasm_dealloc(ap, al);
            }
            const { ok, text } = readTextResult(handle);
            if (!ok) {
                throw new Error('faust-rs: ' + (text || 'compilation failed'));
            }
            const files = JSON.parse(text);
            const file = files.find(f => !f.binary);
            if (!file) {
                throw new Error('faust-rs: no textual artifact in generateAuxFiles result');
            }
            return base64DecodeUtf8(file.content_base64);
        };

        console.log('faust-rs compiler module loaded:', version);
        return { generateAuxFiles, version };
    })();
    return modulePromise;
}

// UTF-8 safe base64 helpers (sibling sources can contain any text).
function base64EncodeUtf8(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary);
}

function base64DecodeUtf8(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
}

// mountSiblings equivalent: sibling .lib/.dsp files travel inline in the
// argv string as `--virtual-source <path>=<base64>` entries (registered
// under both the -I /work spelling and the bare relative path).
function virtualSourceArgs(libsByPath) {
    const args = [];
    for (const [relPath, content] of Object.entries(libsByPath || {})) {
        const b64 = base64EncodeUtf8(content);
        for (const p of ['/work/' + relPath, relPath]) {
            args.push(`--virtual-source ${p}=${b64}`);
        }
    }
    return args.join(' ');
}

// faust-rs's asc backend doesn't emit the redundant <i32>() loop-header casts,
// but keep the same normalization as browser-transpile.js for safety.
function normalizeASSource(src) {
    return src.replace(
        /for\s*\(\s*let\s+(\w+):\s*i32\s*=\s*<i32>\((\d+)\);\s*\1\s*<\s*<i32>\((\d+)\);\s*\1\s*=\s*\(\1\s*\+\s*<i32>\(1\)\)\)/g,
        'for (let $1: i32 = $2; $1 < $3; $1 = ($1 + 1))'
    );
}

// Detect mastering vs voice from the AS source's getNumInputs/getNumOutputs
// (same heuristic as browser-transpile.js).
function isStereoEffect(asSource) {
    const inputsMatch = asSource.match(/getNumInputs\(\)\s*:\s*i32\s*\{[^}]*return\s+(\d+)/);
    const outputsMatch = asSource.match(/getNumOutputs\(\)\s*:\s*i32\s*\{[^}]*return\s+(\d+)/);
    const numIn = inputsMatch ? +inputsMatch[1] : 0;
    const numOut = outputsMatch ? +outputsMatch[1] : 0;
    return numIn === 2 && numOut === 2;
}

// Public API — same contract as browser-transpile.js's transpileDspSource().
export async function transpileDspSource(dspSource, dspBaseName, libsByPath = {}) {
    toggleSpinner(true);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
        const { generateAuxFiles } = await getFaustRs();
        const vsArgs = virtualSourceArgs(libsByPath);

        const leaf = dspBaseName.split('/').pop();
        const leafStem = leaf.replace(/\.dsp$/, '');
        const clsName = toClassName(leafStem);
        const importDepth = 1 + (dspBaseName.match(/\//g) || []).length;

        const asSource = normalizeASSource(generateAuxFiles(
            leafStem,
            dspSource,
            `-lang asc -cn ${clsName} -I /work ${vsArgs} -o /${leafStem}.out.ts`
        ));

        if (isStereoEffect(asSource)) {
            const lines = transpileEffect({
                asSource,
                clsName,
                sourceFile: dspBaseName,
                importDepth,
            });
            return { ts: lines.join('\n'), className: clsName };
        }

        const hasEffect = /^\s*effect\s*=/m.test(dspSource);
        let effectAsSource = null;
        if (hasEffect) {
            const effectName = clsName + 'Effect';
            effectAsSource = normalizeASSource(generateAuxFiles(
                leafStem,
                dspSource,
                `-lang asc -cn ${effectName} -pn effect -I /work ${vsArgs} -o /${leafStem}.effect.out.ts`
            ));
        }

        const result = transpileDsp({
            asSource,
            effectAsSource,
            clsName,
            sourceFile: dspBaseName,
            options: {},
        });
        return {
            ts: assembleSingleFile(result, { forEditor: true, importDepth }).join('\n'),
            className: clsName,
        };
    } finally {
        toggleSpinner(false);
    }
}
