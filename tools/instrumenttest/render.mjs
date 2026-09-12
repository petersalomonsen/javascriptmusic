#!/usr/bin/env node
/*
 * Instrument test harness — does this Faust instrument actually make a sound,
 * and does it respond to MIDI notes?
 *
 * The audio counterpart of tools/shadertest/render.mjs. It transpiles a .dsp,
 * compiles it into the real AssemblyScript midisynth, instantiates that wasm in
 * Node, sends actual MIDI note-on/note-off messages, renders the samples and
 * measures them. No browser, no speakers, no human.
 *
 * This exists because nothing else catches the most damaging Faust mistake: an
 * instrument that transpiles, registers and compiles perfectly and is SILENT.
 * A voice only receives `gate`, `freq` and `gain` from a note, so a DSP built
 * around controls of its own naming never gets triggered — and every other
 * check in the toolchain reports success. Static analysis cannot find this:
 * a working instrument may take freq/gate/gain from an imported library
 * (examples/dx7/dsp/dx7_alg5.dsp is just `process = dx.algorithm(5) <: _,_;`),
 * so the only reliable question is whether audio comes out.
 *
 * Run it from wasmaudioworklet (that is where node_modules/assemblyscript is):
 *
 *   cd wasmaudioworklet
 *   node ../tools/instrumenttest/render.mjs <instrument.dsp> [options]
 *
 * Options:
 *   --notes <list>    notes to play, names or MIDI numbers (default c3,c4,c5)
 *   --hold <s>        how long the note is held, seconds (default 0.5)
 *   --tail <s>        how long to keep rendering after note-off (default 0.5)
 *   --velocity <n>    note-on velocity 1-127 (default 100)
 *   --channel <n>     MIDI channel to play (default 0)
 *   --ts <file>       skip transpiling: use this already-generated .ts as the mix
 *   --wav <dir>       also write each note's render to <dir>/<name>_<note>.wav
 *   --json            emit the report as JSON instead of text
 *   --keep            keep the temporary build directory (prints its path)
 *
 * Exit code is 1 when any requested note produced no sound, so it can be used
 * as a check and not just a report.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// The compile scaffold and the note renderer are shared with the studio-agent
// bench's headless studio (tools/studio-agent/bench), so both measure the same way.
import { buildSynthWasm, renderNote, SAMPLERATE, REPO } from './headless.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Shared with the in-app probe (wasmaudioworklet/audioprobe/instrumentprobe.js) so the
// harness and the agent's tool report the same numbers.
const { rms, peak, spectrum, noteName, midiToFreq, parseNote } =
    await import(path.join(REPO, 'wasmaudioworklet', 'audioprobe', 'audioanalysis.js'));
const FAUST2AS = path.join(REPO, 'tools', 'faust2as', 'faust2as.js');

// ---- build -----------------------------------------------------------------
// The instrument under test IS the mix: midisynth.ts imports `../mixes/midi.mix`,
// so its own initializeMidiSynth() wires it onto a channel exactly as in the app.
function buildWasm(instrumentTs, { keep }) {
    return buildSynthWasm({ 'mixes/midi.mix.ts': instrumentTs }, { keep }).bytes;
}

// ---- wav out ---------------------------------------------------------------
function writeWav(file, left, right, sampleRate = SAMPLERATE) {
    const frames = left.length;
    const buf = Buffer.alloc(44 + frames * 4);
    buf.write('RIFF', 0); buf.writeUInt32LE(36 + frames * 4, 4); buf.write('WAVE', 8);
    buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
    buf.writeUInt16LE(2, 22); buf.writeUInt32LE(sampleRate, 24);
    buf.writeUInt32LE(sampleRate * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
    buf.write('data', 36); buf.writeUInt32LE(frames * 4, 40);
    const clamp = (v) => Math.max(-1, Math.min(1, v)) * 32767;
    for (let i = 0; i < frames; i++) {
        buf.writeInt16LE(clamp(left[i]), 44 + i * 4);
        buf.writeInt16LE(clamp(right[i]), 46 + i * 4);
    }
    fs.writeFileSync(file, buf);
}

// ---- main ------------------------------------------------------------------
function parseArgs(argv) {
    const opts = {
        notes: 'c3,c4,c5', hold: 0.5, tail: 0.5, velocity: 100, channel: 0,
        json: false, keep: false, wav: null, ts: null, input: null,
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--json') opts.json = true;
        else if (a === '--keep') opts.keep = true;
        else if (a === '--notes') opts.notes = argv[++i];
        else if (a === '--hold') opts.hold = Number(argv[++i]);
        else if (a === '--tail') opts.tail = Number(argv[++i]);
        else if (a === '--velocity') opts.velocity = Number(argv[++i]);
        else if (a === '--channel') opts.channel = Number(argv[++i]);
        else if (a === '--wav') opts.wav = argv[++i];
        else if (a === '--ts') opts.ts = argv[++i];
        else if (!a.startsWith('--')) opts.input = a;
    }
    return opts;
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    if (!opts.input && !opts.ts) {
        console.error('usage: node render.mjs <instrument.dsp> [--notes c3,fs3] [--hold 0.5] [--json]');
        process.exit(2);
    }
    const name = path.basename(opts.ts || opts.input).replace(/\.(dsp|ts)$/, '');

    let instrumentTs;
    if (opts.ts) {
        instrumentTs = fs.readFileSync(opts.ts, 'utf8');
    } else {
        const tsOut = path.join(os.tmpdir(), `instrumenttest-${name}-${process.pid}.ts`);
        try {
            execFileSync('node', [FAUST2AS, path.resolve(opts.input), '--out', tsOut], { stdio: 'pipe' });
        } catch (e) {
            console.error(`Faust transpile failed:\n${`${e.stdout || ''}${e.stderr || ''}`.trim()}`);
            process.exit(1);
        }
        instrumentTs = fs.readFileSync(tsOut, 'utf8');
        fs.unlinkSync(tsOut);
    }
    if (!/export function initializeMidiSynth/.test(instrumentTs)) {
        console.error('This .ts has no initializeMidiSynth() — it is not a playable instrument mix.');
        process.exit(1);
    }

    const wasm = buildWasm(instrumentTs, opts);
    const notes = opts.notes.split(',').filter(Boolean).map(parseNote);
    const results = [];
    for (const note of notes) {
        const { mono, left, right, holdSamples } = await renderNote(wasm, {
            note, velocity: opts.velocity, channel: opts.channel,
            holdSeconds: opts.hold, tailSeconds: opts.tail,
        });
        const held = mono.subarray(0, holdSamples);
        const tail = mono.subarray(holdSamples);
        const { dominantHz, centroidHz } = spectrum(held);
        results.push({
            note, name: noteName(note), expectedHz: midiToFreq(note),
            peak: peak(held), rms: rms(held), tailRms: rms(tail),
            dominantHz, centroidHz, silent: peak(held) < 1e-4,
        });
        if (opts.wav) {
            fs.mkdirSync(opts.wav, { recursive: true });
            writeWav(path.join(opts.wav, `${name}_${noteName(note)}.wav`), left, right);
        }
    }

    const silent = results.filter((r) => r.silent);
    const audible = results.filter((r) => !r.silent);
    // Do the notes actually differ? Two uses: for a pitched instrument, identical
    // notes mean `freq` is missing. For a drum kit meant to live on ONE channel,
    // this is the mapping check — if c3 and fs3 render the same audio, there is
    // no kick/hi-hat mapping, whatever the song claims.
    const distinct = new Set(audible.map((r) => `${Math.round(r.dominantHz)}:${Math.round(r.centroidHz / 20)}`));
    const report = {
        instrument: name,
        notes: results,
        allSilent: silent.length === results.length,
        silentNotes: silent.map((r) => r.name),
        notesDistinguishable: distinct.size > 1,
        pitchTracksNote: audible.length > 1 && audible.every(
            (r) => r.dominantHz / r.expectedHz > 0.94 && r.dominantHz / r.expectedHz < 1.06),
    };

    if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
    } else {
        console.log(`instrument: ${name}`);
        for (const r of results) {
            if (r.silent) { console.log(`  ${r.name.padEnd(5)} SILENT — no audio produced`); continue; }
            const ratio = r.dominantHz > 0 ? r.dominantHz / r.expectedHz : 0;
            const tracks = ratio > 0.94 && ratio < 1.06 ? ' (matches note pitch)' : '';
            console.log(`  ${r.name.padEnd(5)} peak ${r.peak.toFixed(3)}  rms ${r.rms.toFixed(4)}  `
                + `dominant ${r.dominantHz.toFixed(1)}Hz (note is ${r.expectedHz.toFixed(1)}Hz)${tracks}  `
                + `centroid ${r.centroidHz.toFixed(0)}Hz`);
        }
        if (report.allSilent) {
            console.log('\nSILENT: no note produced any audio. A voice is triggered only by `gate`,');
            console.log('and pitched only by `freq` — a control of your own naming is never pressed by a note.');
        } else if (silent.length) {
            console.log(`\nSILENT on ${report.silentNotes.join(', ')} while other notes sound.`);
        } else if (results.length > 1 && !report.notesDistinguishable) {
            console.log('\nAll notes rendered the SAME audio — this instrument ignores the note number.');
            console.log('  • Correct for fixed-pitch percussion (one .dsp = one drum, played from any note).');
            console.log('  • A BUG for a pitched instrument: declare `freq` and derive the pitch from it.');
            console.log('  • A BUG for a drum KIT on one channel: there is no per-note mapping here, so');
            console.log('    c3 and fs3 are the same sound. Branch on `freq`, or use one channel per drum.');
        } else if (report.pitchTracksNote) {
            console.log('\nPitch tracks the note across all notes played.');
        }
    }
    process.exit(report.allSilent || silent.length ? 1 : 0);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
