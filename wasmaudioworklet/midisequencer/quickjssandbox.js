// Run a song script inside a QuickJS WebAssembly sandbox instead of the
// host JS engine, so shared/untrusted songs cannot reach the app origin
// (fetch, localStorage, OPFS, DOM). The whole sequencer runtime — the real
// sources of pattern.js, trackerpattern.js and songcompiler.js — executes
// inside the guest; only the song source goes in (via an async host
// function) and a JSON snapshot of the resulting state comes out. Media
// loading (addAudio/addVideo/addImage) touches the DOM/network and is
// therefore only *recorded* in the guest — the host replays the recorded
// specs through the real implementations afterwards (see compileSong in
// songcompiler.js).
// quickjs-wasm is loaded from jsDelivr in the browser (jseval.wasm resolves
// relative to quickjs.js's own import.meta.url, so it comes from the CDN
// too — CORS/CORP headers verified compatible with this app's COEP), and
// from the installed npm package in Node (Node cannot import https: URLs).
// Keep the version in sync with the quickjs-wasm devDependency in
// package.json.
const QUICKJS_WASM_VERSION = '0.0.4';

async function getCreateQuickJS() {
    const { createQuickJS } = (typeof process !== 'undefined' && process.versions && process.versions.node)
        ? await import('quickjs-wasm')
        : await import(`https://cdn.jsdelivr.net/npm/quickjs-wasm@${QUICKJS_WASM_VERSION}/js/quickjs.js`);
    return createQuickJS;
}

// Interrupts a runaway song (while(true){}) instead of hanging the tab.
const SANDBOX_TIMEOUT_MS = 20000;
const SANDBOX_MEMORY_LIMIT = 64 * 1024 * 1024;

const GUEST_SOURCE_FILES = [
    'sequenceconstants.js',
    'pattern.js',
    'trackerpattern.js',
    'songcompiler.js',
];

// Declarations for host-side imports stripped from songcompiler.js, plus a
// console for the guest. Must precede the stripped sources.
const GUEST_PRELUDE = `
globalThis.console = { log: print, warn: print, error: print };
const setVideoSchedule = () => {};
`;

// Appended in the same module scope as the stripped sources: replace the
// host-touching media functions with recorders, and expose the entry point
// returning the state snapshot. compileSongUnsafe is the native
// AsyncFunction path of songcompiler.js — inside the guest that is exactly
// what we want: the untrusted song compiles against QuickJS's own
// Function constructor.
const GUEST_WRAPPER = `
const __audioUrls = [];
songargs.addAudio = async (url) => {
    if (!__audioUrls.includes(url)) __audioUrls.push(url);
};
songargs.addVideo = async (name, url) => {
    if (!addedVideo[name]) addedVideo[name] = { url, schedule: [] };
};
songargs.addImage = async (name, url, cache = true) => {
    if (!cache || !addedVideo[name]) addedVideo[name] = { url, isImage: true, schedule: [] };
};

export async function __runSong() {
    const songsource = await env.callHostAsync({ function_name: 'getSongSource' });
    const result = { error: null };
    try {
        result.events = await compileSongUnsafe(songsource);
    } catch (e) {
        result.error = {
            message: (e && e.message) || String(e),
            stack: (e && e.stack) || ''
        };
        return JSON.stringify(result);
    }
    result.instrumentNames = instrumentNames;
    result.recordingStartTimeMillis = recordingStartTimeMillis;
    result.songParts = Object.fromEntries(Object.entries(songParts)
        .map(([name, part]) => [name, { startTime: part.startTime, endTime: part.endTime }]));
    result.trackerPatterns = trackerPatterns.filter(p => p).map(p => ({
        channel: p.channel,
        output: { startTime: p.output.startTime, midievents: p.output.midievents }
    }));
    result.audioUrls = __audioUrls;
    result.visual = Object.fromEntries(Object.entries(addedVideo)
        .map(([name, v]) => [name, {
            url: v.url,
            isImage: !!v.isImage,
            schedule: v.schedule.map(s => ({
                startTime: s.startTime,
                stopTime: s.stopTime,
                clipStartTime: s.clipStartTime
            }))
        }]));
    return JSON.stringify(result);
}
`;

async function loadText(relpath) {
    const url = new URL(relpath, import.meta.url);
    if (url.protocol === 'file:') {
        return await (await import('fs/promises')).readFile(url, 'utf8');
    }
    return await fetch(url).then(r => r.text());
}

let guestSourcePromise = null;

function getGuestSource() {
    if (!guestSourcePromise) {
        guestSourcePromise = Promise.all(GUEST_SOURCE_FILES.map(f => loadText('./' + f)))
            .then(sources => GUEST_PRELUDE + sources.map(src => src
                .replace(/^import .*$/gm, '')
                .replace(/^export /gm, '')
            ).join('\n') + GUEST_WRAPPER);
    }
    return guestSourcePromise;
}

export async function runSongInSandbox(songsource, timeoutMs = SANDBOX_TIMEOUT_MS) {
    const guestSource = await getGuestSource();
    const quickjs = await (await getCreateQuickJS())();
    quickjs.setMemoryLimit(SANDBOX_MEMORY_LIMIT);
    quickjs.hostFunctions['getSongSource'] = async () =>
        quickjs.allocateJSstring(songsource);

    const bytecode = quickjs.compileToByteCode(guestSource, 'songcompiler-sandbox.js');
    const mod = quickjs.loadByteCode(bytecode);
    const promise = quickjs.callModFunction(mod, '__runSong', timeoutMs);
    // The song actually runs when the getSongSource promise resolves back
    // into the guest, which is outside the callModFunction deadline window —
    // arm the deadline again for that resumption.
    quickjs.wasmInstance.set_eval_deadline(Date.now() + timeoutMs);
    try {
        await quickjs.waitForPendingAsyncInvocations();
    } finally {
        quickjs.wasmInstance.clear_interrupt();
    }

    const resultJson = quickjs.getPromiseResult(promise);
    if (typeof resultJson !== 'string') {
        throw new Error(`Song execution did not complete (timed out after ${timeoutMs}ms, or was interrupted)`);
    }
    const result = JSON.parse(resultJson);
    if (result.error) {
        const error = new Error(result.error.message);
        error.stack = result.error.stack;
        throw error;
    }
    return result;
}
