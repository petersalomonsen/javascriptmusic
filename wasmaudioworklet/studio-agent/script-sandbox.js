// The `run_script` tool: run an agent-authored JavaScript snippet inside the
// same QuickJS-in-wasm sandbox that runs songs, over the DATA of the current
// documents.
//
// Why a script tool at all: a recorded take is note data, and an agent with
// only get/set/edit tools transforms data by transcription — it reads 39 note
// rows, works out the chords in its head, and retypes them. That cost one live
// session 22k output tokens and three minutes of thinking, and the rewritten
// chords came back with every velocity set to 72: the performance was gone. A
// twenty-line script does the same job deterministically, keeps what the user
// played, and the note data never passes through the model at all.
//
// Why THIS sandbox: not isolation from the app (the agent already writes every
// document), but the deadline. SANDBOX_TIMEOUT_MS interrupts an agent-written
// `while (true)` instead of freezing the tab, and the guest has no DOM, no
// network and no OPFS, so a mistaken script can at most produce wrong text.
// It also works on the serverless NEAR AI tier, which has no server to run
// anything on.
//
// The boundary is JSON strings, both ways (host -> guest via getScriptInput,
// guest -> host via setDocument). Writes are a HOST FUNCTION the caller opts
// into: runSongInSandbox never registers it, so a song shared by someone else
// cannot gain the ability to rewrite the editors.

import { getCreateQuickJS, SANDBOX_TIMEOUT_MS, SANDBOX_MEMORY_LIMIT } from '../midisequencer/quickjssandbox.js';

export const DOCUMENT_NAMES = ['song', 'synth', 'shader'];
// What the tool result may carry back — a script that prints a whole song
// would otherwise put it straight into the model's context.
export const MAX_OUTPUT_CHARS = 6000;

async function loadText(relpath) {
    const url = new URL(relpath, import.meta.url);
    if (url.protocol === 'file:') {
        return await (await import('fs/promises')).readFile(url, 'utf8');
    }
    return await fetch(url).then((r) => r.text());
}

let guestSourcePromise = null;

// The helpers module is written import-free so it can be dropped into the
// guest as plain source (exports stripped), the same way the song sandbox
// loads the sequencer runtime.
function getGuestSource() {
    if (!guestSourcePromise) {
        guestSourcePromise = loadText('./script-helpers.js').then((helpers) => {
            // The script runs as an AsyncFunction in GLOBAL scope, so the
            // helpers (module scope in the guest) are published on globalThis.
            const names = [...helpers.matchAll(/^export (?:function|const) (\w+)/gm)].map((m) => m[1]);
            return helpers.replace(/^export /gm, '')
                + `\nObject.assign(globalThis, { ${names.join(', ')} });\n`
                + GUEST_WRAPPER;
        });
    }
    return guestSourcePromise;
}

const GUEST_WRAPPER = `
const __out = [];
const __fmt = (v) => (typeof v === 'string' ? v : v === undefined ? 'undefined' : JSON.stringify(v));
globalThis.print = (...args) => { __out.push(args.map(__fmt).join(' ')); };
globalThis.console = { log: print, info: print, warn: print, error: print };

const __writes = [];
async function __setDocument(name, text) {
    if (typeof text !== 'string') throw new Error('set' + name + ': expected a string, got ' + typeof text);
    const raw = await env.callHostAsync({ function_name: 'setDocument', name, text });
    if (raw === null || raw === undefined) throw new Error('writes are not enabled for this script');
    const res = JSON.parse(raw);
    if (res.error) throw new Error(res.error);
    __writes.push(res);
    return res.message;
}
globalThis.setSong = (text) => __setDocument('song', text);
globalThis.setSynth = (text) => __setDocument('synth', text);
globalThis.setShader = (text) => __setDocument('shader', text);

export async function __runScript() {
    const input = JSON.parse(await env.callHostAsync({ function_name: 'getScriptInput' }));
    for (const key of Object.keys(input.values)) globalThis[key] = input.values[key];
    const result = { output: __out, writes: __writes, value: undefined, error: null };
    try {
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
        const value = await new AsyncFunction(input.code)();
        result.value = value === undefined ? undefined : __fmt(value);
    } catch (e) {
        result.error = { message: (e && e.message) || String(e), stack: (e && e.stack) || '' };
    }
    return JSON.stringify(result);
}
`;

/**
 * Run `code` (the body of an async function) with `values` as globals.
 *
 * `write(name, text)` — optional. When given, the guest's setSong/setSynth/
 * setShader reach it; it returns { message, warnings } or { error }. When
 * omitted the guest's writers throw, and nothing else in the guest can reach
 * the host.
 *
 * Resolves to { output: [lines], value, writes: [...], error: null | { message, stack } };
 * rejects when the script is interrupted by the deadline.
 */
export async function runAgentScript(code, values = {}, { write = null, timeoutMs = SANDBOX_TIMEOUT_MS } = {}) {
    const guestSource = await getGuestSource();
    const quickjs = await (await getCreateQuickJS())();
    quickjs.setMemoryLimit(SANDBOX_MEMORY_LIMIT);

    // One ABSOLUTE deadline for the whole run. The guest resumes after every
    // host call outside callModFunction's own deadline window (see
    // runSongInSandbox), and a script may call setSong several times — so the
    // same deadline is re-armed before each resumption.
    const deadline = Date.now() + timeoutMs;
    const arm = () => quickjs.wasmInstance.set_eval_deadline(deadline);

    quickjs.hostFunctions['getScriptInput'] = async () => {
        arm();
        return quickjs.allocateJSstring(JSON.stringify({ code: String(code), values }));
    };
    // Always registered: a host function the guest calls but the host has not
    // registered never settles the guest's promise (quickjs-wasm answers it
    // with a null it cannot pass to wasm), and the run would sit until the
    // deadline. Without `write` the writers simply get an error back.
    quickjs.hostFunctions['setDocument'] = async (params) => {
        const name = quickjs.getObjectPropertyValue(params, 'name');
        const text = quickjs.getObjectPropertyValue(params, 'text');
        let res;
        try {
            if (!write) res = { error: 'writes are not enabled for this script' };
            else if (!DOCUMENT_NAMES.includes(name)) res = { error: `unknown document "${name}" (one of ${DOCUMENT_NAMES.join(', ')})` };
            else res = (await write(name, text)) || { message: `${name} updated` };
        } catch (e) {
            res = { error: String((e && e.message) || e) };
        }
        arm();
        return quickjs.allocateJSstring(JSON.stringify(res));
    };

    const bytecode = quickjs.compileToByteCode(guestSource, 'agent-script-sandbox.js');
    const mod = quickjs.loadByteCode(bytecode);
    const promise = quickjs.callModFunction(mod, '__runScript', timeoutMs);
    arm();
    try {
        await quickjs.waitForPendingAsyncInvocations();
    } finally {
        quickjs.wasmInstance.clear_interrupt();
    }

    const resultJson = quickjs.getPromiseResult(promise);
    if (typeof resultJson !== 'string') {
        throw new Error(`script did not settle within ${timeoutMs / 1000}s (a host call never returned)`);
    }
    const result = JSON.parse(resultJson);
    // Hitting the deadline raises an InternalError("interrupted") inside the
    // guest, which the wrapper's catch records like any other error. Say what
    // it really was — and that earlier writes stand.
    if (result.error && /interrupt/i.test(result.error.message)) {
        result.error = { message: `script did not finish within ${timeoutMs / 1000}s and was interrupted — an endless loop? Any setSong/setSynth/setShader it completed before that HAS been applied.`, stack: '' };
    }
    return result;
}

const truncate = (s, max) => (s.length > max ? `${s.slice(0, max)}\n…[+${s.length - max} chars truncated — print less]` : s);

// The tool result text. Printed lines first, then the return value, then what
// was written (with any lint warnings), then the error — so a failing script
// still shows everything it managed to report before it died.
export function formatScriptResult(result) {
    const lines = [];
    if (result.output.length) lines.push(truncate(result.output.join('\n'), MAX_OUTPUT_CHARS));
    if (result.value !== undefined) lines.push(`returned: ${truncate(String(result.value), MAX_OUTPUT_CHARS)}`);
    for (const w of result.writes) {
        lines.push(w.message);
        for (const warning of w.warnings || []) lines.push(warning);
    }
    if (!lines.length && !result.error) lines.push('(script produced no output — print() what you want to see)');
    if (result.error) {
        const stack = String(result.error.stack || '').split('\n').filter((l) => /<anonymous>|agent-script/.test(l)).slice(0, 3).join('\n');
        lines.push(`ERROR: ${result.error.message}${stack ? `\n${stack}` : ''}`);
    }
    return lines.join('\n');
}
