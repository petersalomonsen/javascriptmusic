// Render a whole compiled song offline, straight from the synth wasm.
//
// The app's WAV export goes through an OfflineAudioContext and the sequencer
// AudioWorklet; that needs a browser. This does the same job against a bare
// wasm instance — the event list is fed to `shortmessage()` at the block each
// event falls in and `fillSampleBuffer()` is pulled block by block — so the
// mastering probe measures the exact sample stream `postprocess()` produces,
// in the browser AND in Node (bench, tests), with nothing in between.
//
// Kept separate from instrumentprobe.js on purpose: a note probe wants a fresh
// instance per note and a mono sum; a mix wants one continuous stereo run.

const FRAMES = 128;                       // samplebuffer frames per fillSampleBuffer()
const RIGHT_OFFSET_BYTES = FRAMES * 4;    // planar buffer: left block, then right block

let cachedModule = null, cachedBytes = null;
async function synthModule(bytes) {
    if (cachedModule && cachedBytes === bytes) return cachedModule;
    cachedModule = await WebAssembly.compile(bytes);
    cachedBytes = bytes;
    return cachedModule;
}

export async function instantiateSynth(bytes, sampleRate) {
    const module = await synthModule(bytes);
    const instance = await WebAssembly.instantiate(module, {
        environment: { SAMPLERATE: sampleRate },
        env: {
            abort: () => { throw new Error('wasm abort during render'); },
            seed: () => 0,
            'Math.random': () => 0.5,
        },
    });
    const ex = instance.exports;
    if (typeof ex.shortmessage !== 'function' || typeof ex.fillSampleBuffer !== 'function') {
        throw new Error('the compiled synth is not a midi synth (no shortmessage/fillSampleBuffer)');
    }
    return ex;
}

/** The sequenced length in seconds: the time of the last event (the loop marker). */
export function songLengthSeconds(eventlist) {
    let last = 0;
    for (const e of eventlist || []) if (e && e.time > last) last = e.time;
    return last / 1000;
}

/**
 * Render `eventlist` ({time ms, message:[status, d1, d2]}) through the synth.
 * Single-byte messages are sequencer control codes (loop, recording markers)
 * and are skipped. Returns planar Float32Arrays plus the timing.
 *
 * `tailSeconds` of extra render after the last event catches releases and
 * reverb; `maxSeconds` guards against a runaway song length.
 */
export async function renderSong(bytes, eventlist, {
    sampleRate = 44100, tailSeconds = 1.5, maxSeconds = 900, onProgress = null,
} = {}) {
    const events = (eventlist || [])
        .filter((e) => e && Array.isArray(e.message) && e.message.length >= 3)
        .slice()
        .sort((a, b) => a.time - b.time);
    const songSeconds = songLengthSeconds(eventlist);
    if (!events.length) throw new Error('the event list has no MIDI messages — the song plays nothing');
    const seconds = Math.min(songSeconds + tailSeconds, maxSeconds);
    const totalBlocks = Math.ceil(seconds * sampleRate / FRAMES);
    const total = totalBlocks * FRAMES;

    const ex = await instantiateSynth(bytes, sampleRate);
    const ptr = Number(ex.samplebuffer);
    const left = new Float32Array(total);
    const right = new Float32Array(total);

    let next = 0;
    for (let block = 0; block < totalBlocks; block++) {
        const blockEndMs = (block + 1) * FRAMES / sampleRate * 1000;
        while (next < events.length && events[next].time < blockEndMs) {
            const m = events[next++].message;
            ex.shortmessage(m[0] & 0xff, m[1] & 0x7f, m[2] & 0x7f);
        }
        ex.fillSampleBuffer();
        // the memory may have grown — re-view it per block
        const mem = new Float32Array(ex.memory.buffer);
        const l = ptr / 4, r = (ptr + RIGHT_OFFSET_BYTES) / 4;
        left.set(mem.subarray(l, l + FRAMES), block * FRAMES);
        right.set(mem.subarray(r, r + FRAMES), block * FRAMES);
        if (onProgress && (block & 1023) === 0) onProgress(block / totalBlocks);
    }
    return { left, right, sampleRate, seconds, songSeconds, truncated: seconds < songSeconds + tailSeconds };
}

export function _resetRenderCache() { cachedModule = null; cachedBytes = null; }
