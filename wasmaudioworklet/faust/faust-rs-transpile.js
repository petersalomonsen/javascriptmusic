// faust-rs-transpile.js — Faust .dsp → AssemblyScript transpiler backed by the
// faust-rs (Rust) compiler compiled to a plain wasm32-unknown-unknown module
// (faust_wasm_ffi.wasm). Public API: transpileDspSource().
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
import { formatDiagnosticsForHumans } from './faust-diagnostics.js';

// Local build first (developer workflow: drop a fresh faust_wasm_ffi.wasm
// next to this file), CDN-published binary as the fallback for deployments
// where the gitignored local artifact doesn't exist.
const WASM_URL = new URL('./faust_wasm_ffi.wasm', import.meta.url);
// 0.16.1-asc.4: adds the structured diagnostics-v2 exports on compile
// failures (faust_wasm_text_result_diagnostics_ptr/len). 0.16.1-asc.3 was
// the first module honoring the `--ec --os` execution options.
const COMPILER_MODULE_VERSION = '0.16.1-asc.4';
const WASM_CDN_URL = `https://cdn.jsdelivr.net/npm/@psalomo/faustwasm@${COMPILER_MODULE_VERSION}/faust-compiler-module.wasm`;

let modulePromise = null;

// `\0asm` — SPA hosts (e.g. Cloudflare Pages) answer missing paths with
// 200 + index.html, so a status check alone can't tell whether the local
// module exists.
function isWasm(buffer) {
    const bytes = new Uint8Array(buffer);
    return bytes.length > 4
        && bytes[0] === 0x00 && bytes[1] === 0x61
        && bytes[2] === 0x73 && bytes[3] === 0x6d;
}

async function fetchWasmBytes() {
    try {
        const response = await fetch(WASM_URL);
        if (response.ok) {
            const buffer = await response.arrayBuffer();
            if (isWasm(buffer)) return buffer;
        }
    } catch (e) { /* fall through to CDN */ }
    console.log('faust compiler: local module not available, loading from CDN');
    const response = await fetch(WASM_CDN_URL);
    if (!response.ok) {
        throw new Error(`faust compiler: could not load module (local missing, CDN ${response.status})`);
    }
    const buffer = await response.arrayBuffer();
    if (!isWasm(buffer)) {
        throw new Error('faust compiler: CDN response is not a wasm module');
    }
    return buffer;
}

async function getFaustRs() {
    if (modulePromise) return modulePromise;
    modulePromise = (async () => {
        const bytes = await fetchWasmBytes();
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
            // Structured diagnostics-v2 report retained by compiler failures
            // (modules >= 0.16.1-asc.4; older modules lack the exports).
            let diagnostics = null;
            if (!ok && typeof e.faust_wasm_text_result_diagnostics_len === 'function') {
                const dlen = e.faust_wasm_text_result_diagnostics_len(handle);
                if (dlen > 0) {
                    const dptr = e.faust_wasm_text_result_diagnostics_ptr(handle);
                    try {
                        diagnostics = JSON.parse(dec.decode(mem().slice(dptr, dptr + dlen)));
                    } catch (err) { /* malformed payload — keep the message */ }
                }
            }
            e.faust_wasm_text_result_free(handle);
            return { ok, text, diagnostics };
        };

        // generateAuxFiles(name, source, args) → generated AS text; throws
        // with the compiler's error message on failure. Uses the JSON-array
        // export (each artifact base64-encoded) and returns the first
        // textual artifact. On failure the thrown Error carries the complete
        // diagnostics-v2 payload as `error.faustDiagnostics` (see
        // faust-diagnostics.js for renderers).
        const generateAuxFiles = (name, source, args) => {
            const [np, nl] = writeStr(name);
            const [sp, sl] = writeStr(source);
            const [ap, al] = writeStr(args);
            let handle;
            try {
                handle = e.faust_wasm_generate_aux_files_json(np, nl, sp, sl, ap, al);
            } catch (err) {
                // A wasm trap (e.g. stack exhaustion) aborts the call itself.
                throw new Error('faust compiler crashed: ' + err);
            } finally {
                e.faust_wasm_dealloc(np, nl);
                e.faust_wasm_dealloc(sp, sl);
                e.faust_wasm_dealloc(ap, al);
            }
            const { ok, text, diagnostics } = readTextResult(handle);
            if (!ok) {
                const human = diagnostics ? formatDiagnosticsForHumans(diagnostics, source) : '';
                const error = new Error('faust: ' + (human || text || 'compilation failed'));
                error.faustDiagnostics = diagnostics;
                error.faustSource = source;
                throw error;
            }
            const files = JSON.parse(text);
            const file = files.find(f => !f.binary);
            if (!file) {
                throw new Error('faust: no textual artifact in generateAuxFiles result');
            }
            return base64DecodeUtf8(file.content_base64);
        };

        console.log('faust compiler module loaded');
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
// argv string as `--virtual-source <path>=<base64>` entries, keyed by their
// path relative to the .dsp's directory — the same spelling the source uses
// in `library("...")` / `import("...")`. They are registered at the bare
// relative path (NOT under a `/work/` prefix) so that a sibling resolved this
// way keeps an empty base directory, and its own `import("stdfaust.lib")` /
// `import("sibling.dsp")` resolve against the embedded stdlib and the other
// bare-registered siblings — exactly as the top-level source does. (Putting
// them under `/work/` + `-I /work` made the importing file's directory
// `/work/`, where neither the embedded stdlib nor the siblings live.)
function virtualSourceArgs(libsByPath) {
    const args = [];
    for (const [relPath, content] of Object.entries(libsByPath || {})) {
        args.push(`--virtual-source ${relPath}=${base64EncodeUtf8(content)}`);
    }
    return args.join(' ');
}

// faust-rs's asc backend doesn't emit the redundant <i32>() loop-header casts,
// but keep the legacy normalization for safety.
function normalizeASSource(src) {
    return src.replace(
        /for\s*\(\s*let\s+(\w+):\s*i32\s*=\s*<i32>\((\d+)\);\s*\1\s*<\s*<i32>\((\d+)\);\s*\1\s*=\s*\(\1\s*\+\s*<i32>\(1\)\)\)/g,
        'for (let $1: i32 = $2; $1 < $3; $1 = ($1 + 1))'
    );
}

// Detect mastering vs voice from the AS source's getNumInputs/getNumOutputs
// (getNumInputs/getNumOutputs heuristic on the native source).
function isStereoEffect(asSource) {
    const inputsMatch = asSource.match(/getNumInputs\(\)\s*:\s*i32\s*\{[^}]*return\s+(\d+)/);
    const outputsMatch = asSource.match(/getNumOutputs\(\)\s*:\s*i32\s*\{[^}]*return\s+(\d+)/);
    const numIn = inputsMatch ? +inputsMatch[1] : 0;
    const numOut = outputsMatch ? +outputsMatch[1] : 0;
    return numIn === 2 && numOut === 2;
}

// Public API.
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

        // `--ec --os`: the native class exposes control()/frame() so the
        // transpile-core wrappers delegate instead of reshaping compute().
        // `-cn ${clsName}Dsp` keeps the public wrapper names (${clsName},
        // ${clsName}Channel) free — see transpile-core.js naming convention.
        const asSource = normalizeASSource(generateAuxFiles(
            leafStem,
            dspSource,
            `-lang asc -cn ${clsName}Dsp --ec --os ${vsArgs} -o /${leafStem}.out.ts`
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
            effectAsSource = normalizeASSource(generateAuxFiles(
                leafStem,
                dspSource,
                `-lang asc -cn ${clsName}EffectDsp -pn effect --ec --os ${vsArgs} -o /${leafStem}.effect.out.ts`
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
