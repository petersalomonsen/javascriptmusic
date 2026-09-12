#!/usr/bin/env node
/*
 * Mix measurement from the command line — the `probe_mix` agent tool without
 * the browser. The audio counterpart of tools/instrumenttest/render.mjs for a
 * whole project: compile song.js + synth.ts (+ faust/*.dsp) exactly as the app
 * and the bench do, render the compiled song through the wasm (postprocess()
 * included), and print the mastering report — loudness, true peak, spectrum,
 * stereo, per-section loudness, verdict against a delivery target.
 *
 * Run it from wasmaudioworklet (that is where node_modules/assemblyscript is):
 *
 *   cd wasmaudioworklet
 *   node ../tools/mastertest/probe-mix.mjs <project-dir> [options]
 *
 * <project-dir> holds song.js, synth.ts and optionally faust/*.dsp
 * (examples/house-track is one).
 *
 * Options:
 *   --target <name>     streaming (default) | apple | club | broadcast
 *   --lufs <n>          override the integrated loudness target
 *   --true-peak <n>     override the true-peak ceiling (dBTP)
 *   --tail <s>          seconds rendered after the last event (default 1.5)
 *   --json              print the analysis object instead of the report
 *   --auto              run auto_master: wire the Mastering chain and converge its
 *                       settings by compile + measure; prints the auto_master report
 *   --write             with --auto: write the mastered synth.ts back into <project-dir>
 *
 * Exit code is 1 when the verdict is NOT READY, so it can gate an export.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHeadlessStudio } from '../studio-agent/bench/headless-studio.mjs';
import { renderSong } from '../../wasmaudioworklet/audioprobe/songrender.js';
import { analyzeMix, formatMixReport, mixVerdict, resolveTarget } from '../../wasmaudioworklet/audioprobe/mixanalysis.js';
import { songBpmFromSource } from '../../wasmaudioworklet/studio-agent/tools-core.js';

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : dflt; };
const dir = args.find((a) => !a.startsWith('--') && !['streaming', 'apple', 'club', 'broadcast'].includes(a) && !/^-?[\d.]+$/.test(a));
if (!dir) { console.error('usage: probe-mix.mjs <project-dir> [--target streaming|apple|club|broadcast] [--lufs n] [--true-peak n] [--tail s] [--json]'); process.exit(2); }

const read = (f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8') : '');
const faust = {};
const fdir = path.join(dir, 'faust');
if (fs.existsSync(fdir)) for (const f of fs.readdirSync(fdir)) if (f.endsWith('.dsp')) faust[f.replace(/\.dsp$/, '')] = fs.readFileSync(path.join(fdir, f), 'utf8');
const project = { song: read('song.js'), synth: read('synth.ts'), shader: '', faust };
if (!project.song || !project.synth) { console.error(`${dir}: need song.js and synth.ts`); process.exit(2); }

const studio = createHeadlessStudio({ project });
const t0 = Date.now();
const compiled = await studio.call('compile');
if (!compiled.ok) { console.error(`compile failed:\n${compiled.result}`); process.exit(2); }
console.error(`compiled in ${((Date.now() - t0) / 1000).toFixed(1)} s${/\n/.test(compiled.result) ? `\n${compiled.result.split('\n').slice(1).join('\n')}` : ''}`);

const target = resolveTarget({ target: opt('target', 'streaming'), targetLufs: opt('lufs'), truePeakDb: opt('true-peak') });
if (args.includes('--auto')) {
    const t1 = Date.now();
    const res = await studio.call('auto_master', { target: opt('target', 'streaming'), targetLufs: opt('lufs'), truePeakDb: opt('true-peak') });
    console.error(`auto_master ran in ${((Date.now() - t1) / 1000).toFixed(1)} s`);
    if (!res.ok) { console.error(res.result); process.exit(2); }
    console.log(res.result);
    if (args.includes('--write')) {
        fs.writeFileSync(path.join(dir, 'synth.ts'), studio.state.synth);
        console.error(`wrote ${path.join(dir, 'synth.ts')}`);
    }
    process.exit(/^auto_master: MASTER OK/.test(res.result) ? 0 : 1);
}

const t1 = Date.now();
const tail = Number(opt('tail', 1.5));
const r = await renderSong(studio.state.wasm, studio.state.events, { sampleRate: 44100, tailSeconds: tail });
const a = analyzeMix(r.left, r.right, { sampleRate: r.sampleRate, bpm: songBpmFromSource(project.song), songSeconds: r.songSeconds });
console.error(`rendered + analysed ${r.seconds.toFixed(1)} s in ${((Date.now() - t1) / 1000).toFixed(1)} s`);
if (args.includes('--json')) console.log(JSON.stringify({ target, ...a, verdict: mixVerdict(a, target) }, null, 2));
else console.log(formatMixReport(a, target));
process.exit(mixVerdict(a, target).ok ? 0 : 1);
