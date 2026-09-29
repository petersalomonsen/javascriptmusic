#!/usr/bin/env node
/*
 * Compare instruments note by note — is the port the same instrument as the
 * original? Is the redesign brighter, longer, louder, still in tune?
 *
 * render.mjs answers "does it sound at all". This answers "how does it differ
 * from that one": each build plays the same notes, and per note you get level,
 * pitch (YIN), spectral centroid and the decay curve side by side, with the
 * differences against the first build.
 *
 * Every hit of a note goes through ONE instance, one after another. That
 * matters for noise-excited instruments (plucks, drums, bowed strings): each
 * hit is a different noise draw, and a single hit can mislead by 3x. render.mjs
 * starts a fresh instance per note, so its hits are all the same draw; here the
 * numbers are averaged over --hits of them. Voice reuse (a voice played again
 * after it finished) is exercised the same way.
 *
 * The reverb send is set to 0 on the played channel, so a tail is the
 * instrument's own.
 *
 *   cd wasmaudioworklet
 *   node ../tools/instrumenttest/compare.mjs <a> <b> [...] [options]
 *
 * Each build is `<file>[:channel]`:
 *   x.dsp        transpiled like render.mjs (its initializeMidiSynth puts it on
 *                channel 0); sibling .lib imports resolve next to it
 *   x.ts         a mix with initializeMidiSynth(); e.g. a song's synth.ts — then
 *                pass --faust <dir> so its ../faust/*.ts imports are found
 *   file:5       play channel 5 of that build (default 0)
 *
 * Options:
 *   --notes <list>    names or MIDI numbers (default c3,c4,c5)
 *   --hits <n>        hits per note, averaged (default 8)
 *   --hold <s>        note length, seconds (default 0.6)
 *   --gap <s>         rendering after note-off before the next hit (default 0.6)
 *   --velocity <n>    note-on velocity (default 100)
 *   --faust <dir>     compile every <dir>/*.ts as faust/<name>.ts with each build
 *   --json            emit JSON
 *
 * A caveat for exact ports: the test mix a .dsp gets sends every slider default
 * as a 7-bit CC, so a default that is not on a CC step is quantized (3500 in a
 * 500-20000 slider plays as 3571). A song's synth.ts that creates the channel
 * itself does not do that. Put defaults on a CC step, or compare .ts builds.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildSynthWasm, SAMPLERATE, FRAMES, REPO } from './headless.mjs';

const { rms, peak, spectrum, noteName, midiToFreq, parseNote } =
    await import(path.join(REPO, 'wasmaudioworklet', 'audioprobe', 'audioanalysis.js'));
const FAUST2AS = path.join(REPO, 'tools', 'faust2as', 'faust2as.js');

function parseArgs(argv) {
    const opts = { notes: 'c3,c4,c5', hits: 8, hold: 0.6, gap: 0.6, velocity: 100, faust: null, json: false, builds: [] };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--json') opts.json = true;
        else if (a === '--notes') opts.notes = argv[++i];
        else if (a === '--hits') opts.hits = Number(argv[++i]);
        else if (a === '--hold') opts.hold = Number(argv[++i]);
        else if (a === '--gap') opts.gap = Number(argv[++i]);
        else if (a === '--velocity') opts.velocity = Number(argv[++i]);
        else if (a === '--faust') opts.faust = argv[++i];
        else if (!a.startsWith('--')) opts.builds.push(a);
    }
    return opts;
}

function loadMix(file) {
    if (file.endsWith('.ts')) return fs.readFileSync(file, 'utf8');
    const tsOut = path.join(os.tmpdir(), `instrumentcompare-${path.basename(file, '.dsp')}-${process.pid}.ts`);
    try {
        execFileSync('node', [FAUST2AS, path.resolve(file), '--out', tsOut], { stdio: 'pipe' });
    } catch (e) {
        throw new Error(`Faust transpile of ${file} failed:\n${`${e.stdout || ''}${e.stderr || ''}`.trim()}`);
    }
    const ts = fs.readFileSync(tsOut, 'utf8');
    fs.unlinkSync(tsOut);
    return ts;
}

// YIN (de Cheveigné & Kawahara): cumulative-mean-normalized difference, first
// dip under 0.15, parabolic refinement. Autocorrelation peaks pick octaves on
// low, harmonic-rich notes; this does not.
function yinF0(x) {
    const maxLag = Math.min(Math.floor(SAMPLERATE / 25), Math.floor(x.length / 2) - 2);
    const minLag = Math.floor(SAMPLERATE / 2500);
    const W = x.length - maxLag - 2;
    if (W < 64) return 0;
    const c = new Float64Array(maxLag + 2);
    let run = 0;
    for (let l = 1; l <= maxLag + 1; l++) {
        let s = 0;
        for (let i = 0; i < W; i++) { const v = x[i] - x[i + l]; s += v * v; }
        run += s;
        c[l] = run > 0 ? s * l / run : 1;
    }
    let bl = -1;
    for (let l = minLag; l <= maxLag; l++) {
        if (c[l] < 0.15) { while (l < maxLag && c[l + 1] < c[l]) l++; bl = l; break; }
    }
    if (bl < 0) return 0;   // no periodicity: noise, or silence
    const y0 = c[bl - 1], y1 = c[bl], y2 = c[bl + 1], den = y0 - 2 * y1 + y2;
    return SAMPLERATE / (bl + (den ? (y0 - y2) / (2 * den) : 0));
}

async function measure(spec, files, notes, opts) {
    const m = /^(.*?)(?::(\d+))?$/.exec(spec);
    const file = m[1], channel = Number(m[2] || 0);
    const { bytes } = buildSynthWasm({ ...files, 'mixes/midi.mix.ts': loadMix(file) });
    const { instance } = await WebAssembly.instantiate(bytes, {
        environment: { SAMPLERATE },
        env: { abort: (msg, f, line, col) => { throw new Error(`wasm abort at ${line}:${col}`); }, seed: () => 0, 'Math.random': () => 0.5 },
    });
    const ex = instance.exports;
    const ptr = ex.samplebuffer.valueOf ? ex.samplebuffer.valueOf() : ex.samplebuffer;
    const holdBlocks = Math.round(opts.hold * SAMPLERATE / FRAMES);
    const gapBlocks = Math.round(opts.gap * SAMPLERATE / FRAMES);
    const len = (holdBlocks + gapBlocks) * FRAMES;
    const win = Math.round(0.05 * SAMPLERATE);
    ex.shortmessage(0xB0 | channel, 91, 0);   // dry: the tail is the instrument's own

    const out = {};
    for (const note of notes) {
        const power = new Float64Array(len);
        const peaks = [], f0s = [], centroids = [], levels = [];
        for (let h = 0; h < opts.hits; h++) {
            ex.shortmessage(0x90 | channel, note, opts.velocity);
            const mono = new Float32Array(len);
            for (let b = 0; b < holdBlocks + gapBlocks; b++) {
                if (b === holdBlocks) ex.shortmessage(0x80 | channel, note, 0);
                ex.fillSampleBuffer();
                const mem = new Float32Array(ex.memory.buffer);
                for (let i = 0; i < FRAMES; i++) {
                    mono[b * FRAMES + i] = (mem[ptr / 4 + i] + mem[ptr / 4 + FRAMES + i]) / 2;
                }
            }
            for (let i = 0; i < len; i++) power[i] += mono[i] * mono[i] / opts.hits;
            const held = mono.subarray(0, holdBlocks * FRAMES);
            peaks.push(peak(held));
            levels.push(rms(held));
            centroids.push(spectrum(held.subarray(Math.round(0.02 * SAMPLERATE))).centroidHz);
            // pitch after the attack, where the tone has settled
            f0s.push(yinF0(held.subarray(Math.round(Math.min(0.15, opts.hold / 3) * SAMPLERATE))));
        }
        const decay = [];
        for (let f = 0; (f + 1) * win <= len; f++) {
            let s = 0;
            for (let i = f * win; i < (f + 1) * win; i++) s += power[i];
            decay.push(Math.sqrt(s / win));
        }
        let heldPower = 0;
        for (let i = 0; i < holdBlocks * FRAMES; i++) heldPower += power[i];
        const median = (v) => [...v].sort((a, b) => a - b)[v.length >> 1];
        const mean = (v) => v.reduce((a, b) => a + b, 0) / v.length;
        const sd = (v) => Math.sqrt(mean(v.map((x) => (x - mean(v)) ** 2)));
        out[note] = {
            rms: Math.sqrt(heldPower / (holdBlocks * FRAMES)),
            // standard error of the mean level: how far two averages can differ by chance
            rmsSpreadDb: 20 * Math.log10(1 + sd(levels) / Math.sqrt(levels.length) / (mean(levels) || 1)),
            peak: median(peaks),
            f0: median(f0s),
            centroidHz: median(centroids),
            decay,
        };
    }
    return { build: spec, channel, notes: out };
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    if (opts.builds.length < 1) {
        console.error('usage: node compare.mjs <a.dsp|a.ts[:ch]> <b.dsp|b.ts[:ch]> [--notes c3,c4] [--hits 8] [--faust dir]');
        process.exit(2);
    }
    const files = {};
    if (opts.faust) {
        for (const f of fs.readdirSync(opts.faust)) {
            if (f.endsWith('.ts')) files[`faust/${f}`] = fs.readFileSync(path.join(opts.faust, f), 'utf8');
        }
    }
    const notes = opts.notes.split(',').filter(Boolean).map(parseNote);
    const results = [];
    for (const b of opts.builds) results.push(await measure(b, files, notes, opts));

    if (opts.json) {
        console.log(JSON.stringify({ hits: opts.hits, hold: opts.hold, gap: opts.gap, results }, null, 2));
        return;
    }
    const db = (x) => 20 * Math.log10(x);
    const cents = (f, ref) => (f > 0 && ref > 0 ? 1200 * Math.log2(f / ref) : NaN);
    const label = (s) => path.basename(s).slice(0, 22).padEnd(22);
    console.log(`${opts.hits} hits per note, ${opts.hold}s held + ${opts.gap}s after note-off, dry; decay = rms per 50 ms`);
    for (const note of notes) {
        const hz = midiToFreq(note);
        console.log(`\n${noteName(note)} (${note}, ${hz.toFixed(1)} Hz)`);
        const ref = results[0].notes[note];
        for (const r of results) {
            const x = r.notes[note];
            const pitch = x.f0 > 0 ? `f0 ${x.f0.toFixed(1).padStart(7)} Hz ${cents(x.f0, hz).toFixed(0).padStart(5)} ct` : 'f0       —          ';
            let line = `  ${label(r.build)} rms ${db(x.rms).toFixed(1).padStart(6)} dB ±${x.rmsSpreadDb.toFixed(1)}  ${pitch}  centroid ${x.centroidHz.toFixed(0).padStart(5)} Hz`;
            if (r !== results[0]) {
                const dl = db(x.rms / ref.rms), dc = cents(x.f0, ref.f0);
                line += `   vs first: ${dl >= 0 ? '+' : ''}${dl.toFixed(1)} dB`
                    + (Number.isFinite(dc) ? `, ${dc >= 0 ? '+' : ''}${dc.toFixed(0)} ct` : '')
                    + `, centroid ×${(x.centroidHz / (ref.centroidHz || 1)).toFixed(2)}`;
            }
            console.log(line);
            console.log(`  ${''.padEnd(22)} decay ${x.decay.map((v) => v.toFixed(3).replace(/^0\./, '.')).join(' ')}`);
        }
    }
    console.log('\n±: standard error of the averaged level. For noise-excited instruments a level');
    console.log('difference within about twice that is two noise draws, not two instruments;');
    console.log('raise --hits to tell. Pitch and decay shape are not blurred that way.');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
