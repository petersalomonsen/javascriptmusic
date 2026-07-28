// Play a note into the COMPILED synth and measure what comes out.
//
// The agent cannot hear anything, so "it compiled" is the only feedback it gets
// — and a Faust voice that never declares `gate` compiles, registers and plays
// absolute silence. This renders the real wasm offline (no AudioContext, faster
// than realtime) so silence is reported as a fact instead of being discovered
// by the user pressing play.
//
// SECURITY: the wasm rendered here is always the one the app just compiled.
// Nothing may pass wasm bytes in — the same QuickJS sandbox runs songs shared
// by other people, and a host function that instantiated caller-supplied wasm
// would hand any shared song arbitrary code execution in the user's tab.
// Callers choose notes; they never choose the module.

import { measureNote } from './audioanalysis.js';

const FRAMES = 128;                       // samplebuffer frames per fillSampleBuffer()
const RIGHT_OFFSET_BYTES = FRAMES * 4;    // the buffer is planar: left, then right

let cachedModule = null;
let cachedBytes = null;

/** Compile (and cache) the last-compiled synth wasm. */
async function synthModule(bytes) {
    if (!bytes) throw new Error('no compiled synth available — call compile first');
    if (cachedModule && cachedBytes === bytes) return cachedModule;
    cachedModule = await WebAssembly.compile(bytes);
    cachedBytes = bytes;
    return cachedModule;
}

/**
 * Render one note and return its measurements.
 *
 * A FRESH instance per note, deliberately: envelopes and the reverb tail carry
 * over otherwise, and a silent instrument then looks alive because the previous
 * note is still ringing.
 */
export async function probeNote(bytes, {
    note = 60, velocity = 100, channel = 0,
    holdSeconds = 0.4, tailSeconds = 0.3, sampleRate = 44100,
} = {}) {
    const module = await synthModule(bytes);
    const instance = await WebAssembly.instantiate(module, {
        environment: { SAMPLERATE: sampleRate },
        env: {
            abort: () => { throw new Error('wasm abort during probe'); },
            seed: () => 0,
            'Math.random': () => 0.5,
        },
    });
    const ex = instance.exports;
    if (typeof ex.shortmessage !== 'function' || typeof ex.fillSampleBuffer !== 'function') {
        throw new Error('the compiled synth is not a midi synth (no shortmessage/fillSampleBuffer)');
    }
    const mem = new Float32Array(ex.memory.buffer);
    const ptr = Number(ex.samplebuffer);

    const holdBlocks = Math.max(1, Math.round(holdSeconds * sampleRate / FRAMES));
    const tailBlocks = Math.max(1, Math.round(tailSeconds * sampleRate / FRAMES));
    const total = (holdBlocks + tailBlocks) * FRAMES;
    const mono = new Float32Array(total);

    const pull = (block) => {
        ex.fillSampleBuffer();
        const l = ptr / 4;
        const r = (ptr + RIGHT_OFFSET_BYTES) / 4;
        for (let i = 0; i < FRAMES; i++) {
            mono[block * FRAMES + i] = (mem[l + i] + mem[r + i]) / 2;
        }
    };

    ex.shortmessage(0x90 | (channel & 0x0f), note, velocity);
    let block = 0;
    for (let i = 0; i < holdBlocks; i++) pull(block++);
    ex.shortmessage(0x80 | (channel & 0x0f), note, 0);
    for (let i = 0; i < tailBlocks; i++) pull(block++);

    const holdSamples = holdBlocks * FRAMES;
    return {
        channel,
        ...measureNote(mono.subarray(0, holdSamples), mono.subarray(holdSamples), { note, sampleRate }),
    };
}

/** Probe several notes (each on its own instance). */
export async function probeNotes(bytes, notes, opts = {}) {
    const out = [];
    for (const note of notes) out.push(await probeNote(bytes, { ...opts, note }));
    return out;
}

/**
 * Turn probe results into the lines the agent should act on. Reports facts and
 * says which reading applies rather than issuing a verdict: identical audio for
 * every note is CORRECT for a one-drum .dsp and a BUG for a pitched voice, and
 * telling the agent to "fix" a working kick is its own failure mode.
 */
export function probeWarnings(results) {
    const warnings = [];
    const silent = results.filter((r) => r.silent);
    if (silent.length === results.length && results.length) {
        warnings.push(
            `WARNING: channel ${results[0].channel} produced NO SOUND for ${silent.map((r) => r.name).join(', ')}. ` +
            'It compiled and registered, but nothing is audible — do NOT report this as ready. ' +
            'A Faust voice is triggered ONLY by `gate`: if the .dsp declares no `gate` (or drives its envelope from a ' +
            'control of its own naming), no note will ever start it. Check the .dsp, fix, compile and probe again.'
        );
    } else if (silent.length) {
        warnings.push(
            `WARNING: channel ${results[0].channel} is silent on ${silent.map((r) => r.name).join(', ')} ` +
            'while other notes sound — that note range produces nothing.'
        );
    }
    return warnings;
}

// Exposed for tests: reset the module cache between compiles.
export function _resetProbeCache() { cachedModule = null; cachedBytes = null; }
