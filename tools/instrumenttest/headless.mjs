// Headless synth: compile a mix (+ faust voices) to wasm and render notes
// through it, in Node — no browser, no AudioContext, faster than realtime.
//
// This is the piece the render harness (render.mjs) and the studio-agent bench's
// headless studio share: the same scaffold the app compiles (the real assembly
// sources, with the project's own files dropped in), the same asc flags, the
// same way of pulling samples out of the module. The scaffold symlinks every
// shared source and writes only the project's files for real, so a build costs
// one asc run and nothing else.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(__dirname, '..', '..');
export const ASSEMBLY = path.join(REPO, 'wasmaudioworklet', 'synth1', 'assembly');
export const SYNTH1 = path.join(REPO, 'wasmaudioworklet', 'synth1');

export const SAMPLERATE = 44100;
export const FRAMES = 128;                 // samplebuffer frames per fillSampleBuffer call
const RIGHT_OFFSET_BYTES = FRAMES * 4;

/**
 * Compile a synth to wasm.
 *
 * `files` maps paths under assembly/ to source text — at least
 * `mixes/midi.mix.ts` (the project's synth.ts: midisynth.ts imports
 * `../mixes/midi.mix`, so the mix's own initializeMidiSynth() wires the voices
 * exactly as it would in the app) and, for Faust instruments, `faust/<stem>.ts`
 * (what write_faust transpiles; synth.ts imports `../faust/<stem>`).
 *
 * Returns the wasm bytes. With `keep`, the build directory survives and its
 * path is returned too, for looking at what was compiled.
 */
export function buildSynthWasm(files, { keep = false } = {}) {
    if (!files['mixes/midi.mix.ts']) throw new Error('buildSynthWasm: files must include mixes/midi.mix.ts (the synth)');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'headless-synth-'));
    const asm = path.join(dir, 'assembly');
    fs.mkdirSync(asm);
    // Directories that get real files are created for real, with everything
    // else inside them symlinked; all other top-level entries are symlinks.
    const realDirs = new Set(Object.keys(files).map((f) => f.split('/')[0]));
    for (const entry of fs.readdirSync(ASSEMBLY)) {
        if (realDirs.has(entry)) continue;
        fs.symlinkSync(path.join(ASSEMBLY, entry), path.join(asm, entry));
    }
    for (const d of realDirs) {
        const target = path.join(asm, d);
        fs.mkdirSync(target, { recursive: true });
        const shared = path.join(ASSEMBLY, d);
        if (fs.existsSync(shared)) {
            for (const entry of fs.readdirSync(shared)) {
                if (files[`${d}/${entry}`] !== undefined) continue;
                fs.symlinkSync(path.join(shared, entry), path.join(target, entry));
            }
        }
    }
    for (const [rel, source] of Object.entries(files)) {
        const p = path.join(asm, rel);
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, source);
    }
    const wasm = path.join(dir, 'synth.wasm');
    try {
        execFileSync('npx', ['asc', path.join(asm, 'midi', 'midisynth.ts'),
            '--runtime', 'stub', '-o', wasm, '-Ospeed', '--exportRuntime'],
            { cwd: SYNTH1, stdio: 'pipe' });
    } catch (e) {
        const out = `${e.stdout || ''}${e.stderr || ''}`;
        if (!keep) fs.rmSync(dir, { recursive: true, force: true });
        throw new Error(`AssemblyScript compile failed:\n${out.trim()}`);
    }
    const bytes = fs.readFileSync(wasm);
    if (keep) console.error(`build dir kept: ${dir}`);
    else fs.rmSync(dir, { recursive: true, force: true });
    return { bytes, dir: keep ? dir : null };
}

/**
 * Render one note through a compiled synth (bytes or a .wasm path).
 *
 * A fresh instance per note, deliberately: voices, envelopes and reverb tails
 * must not leak between notes, or a silent instrument can look alive from the
 * previous one.
 */
export async function renderNote(wasm, { note, velocity = 100, channel = 0, holdSeconds = 0.5, tailSeconds = 0.5 }) {
    const bytes = typeof wasm === 'string' ? fs.readFileSync(wasm) : wasm;
    const { instance } = await WebAssembly.instantiate(bytes, {
        environment: { SAMPLERATE },
        env: {
            abort: (msg, file, line, col) => { throw new Error(`wasm abort at ${line}:${col}`); },
            seed: () => 0,
            'Math.random': () => 0.5,
        },
    });
    const ex = instance.exports;
    const mem = new Float32Array(ex.memory.buffer);
    const bufPtr = ex.samplebuffer.valueOf ? ex.samplebuffer.valueOf() : ex.samplebuffer;

    const holdFrames = Math.round(holdSeconds * SAMPLERATE / FRAMES);
    const tailFrames = Math.round(tailSeconds * SAMPLERATE / FRAMES);
    const left = new Float32Array((holdFrames + tailFrames) * FRAMES);
    const right = new Float32Array(left.length);

    const pull = (blockIndex) => {
        ex.fillSampleBuffer();
        const base = bufPtr / 4;
        const rbase = (bufPtr + RIGHT_OFFSET_BYTES) / 4;
        for (let i = 0; i < FRAMES; i++) {
            left[blockIndex * FRAMES + i] = mem[base + i];
            right[blockIndex * FRAMES + i] = mem[rbase + i];
        }
    };

    ex.shortmessage(0x90 | (channel & 0x0f), note, velocity);
    let block = 0;
    for (let i = 0; i < holdFrames; i++) pull(block++);
    ex.shortmessage(0x80 | (channel & 0x0f), note, 0);
    for (let i = 0; i < tailFrames; i++) pull(block++);

    const mono = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) mono[i] = (left[i] + right[i]) / 2;
    return { mono, left, right, holdSamples: holdFrames * FRAMES };
}
