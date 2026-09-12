// The synth-source wiring and the numeric optimiser, against a fake chain:
// the real chain is exercised end-to-end by tools/mastertest/probe-mix.mjs
// --auto and the Playwright spec; these pin the logic that decides the moves.
//
// Run with: npm run test-agent-tools

import { test } from 'node:test';
import assert from 'node:assert';
import { wireMastering, readMasteringParams, describeParams, BLOCK_START, BLOCK_END } from './masteringedit.js';
import { autoMaster, formatAutoMasterReport } from './automaster.js';
import { MASTERING_TARGETS } from './mixanalysis.js';

const STARTER = `import { midichannels, MidiChannel, outputline } from '../mixes/globalimports';
import { Bass } from '../faust/bass';

export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(6, (channel: MidiChannel) => new Bass(channel));
}

export function postprocess(): void {
    outputline.left = hardclip(outputline.left);
}
`;

test('wireMastering: adds import, instance, a marked block and the postprocess call; idempotent on re-run', () => {
    const { source, changed } = wireMastering(STARTER, { gainDb: 3, limiterCeilingDb: -1.5 });
    assert.ok(source.startsWith("import { Mastering } from '../mixes/globalimports';\nconst mastering = new Mastering();\n"));
    assert.ok(source.includes(`${BLOCK_START}\n    mastering.gainDb = 3.0;\n    mastering.limiterCeilingDb = -1.5;\n${BLOCK_END}`));
    assert.ok(/hardclip\(outputline\.left\);\n    mastering\.processOutputline\(\);\n\}/.test(source), 'call appended LAST in postprocess');
    assert.equal(changed.length, 3);
    const p = readMasteringParams(source);
    assert.deepEqual(p, { present: true, instance: 'mastering', params: { gainDb: 3, limiterCeilingDb: -1.5 }, wired: true });
    // second pass: replaces the block, adds nothing else
    const again = wireMastering(source, { gainDb: 5.25, lowMonoHz: 120 });
    assert.equal((again.source.match(/new Mastering\(\)/g) || []).length, 1);
    assert.equal((again.source.match(/processOutputline/g) || []).length, 1);
    assert.equal((again.source.match(/mastering\.gainDb/g) || []).length, 1);
    assert.deepEqual(readMasteringParams(again.source).params, { gainDb: 5.25, lowMonoHz: 120 });
    assert.equal(again.changed.length, 1);
});

test('wireMastering: reuses a hand-written instance and removes its loose assignments', () => {
    const hand = `import { midichannels, MidiChannel, Mastering } from '../mixes/globalimports';
const master: Mastering = new Mastering();
export function initializeMidiSynth(): void {
    master.gainDb = 9.0;
    master.tiltDb = 1.0;
}
export function postprocess(): void { master.processOutputline(); }
`;
    const before = readMasteringParams(hand);
    assert.deepEqual(before, { present: true, instance: 'master', params: { gainDb: 9, tiltDb: 1 }, wired: true });
    const { source, changed } = wireMastering(hand, { gainDb: 4, tiltDb: 1 });
    assert.ok(!source.includes("import { Mastering } from"), 'no second import');
    assert.equal((source.match(/master\.gainDb/g) || []).length, 1);
    assert.ok(source.includes('    master.gainDb = 4.0;\n    master.tiltDb = 1.0;'));
    assert.deepEqual(changed, ['set 2 mastering field(s)']);
    // an empty postprocess and a missing one both get the call
    const empty = wireMastering('export function initializeMidiSynth(): void {}\nexport function postprocess(): void {}\n', { gainDb: 1 }).source;
    assert.ok(/postprocess\(\): void \{\n    mastering\.processOutputline\(\);\n\}/.test(empty));
    const none = wireMastering('export function initializeMidiSynth(): void {}\n', { gainDb: 1 }).source;
    assert.ok(/\nexport function postprocess\(\): void \{\n    mastering\.processOutputline\(\);\n\}\n$/.test(none));
    assert.throws(() => wireMastering('export function postprocess(): void {}', {}), /initializeMidiSynth/);
    assert.throws(() => wireMastering(STARTER, { volume: 3 }), /unknown Mastering field/);
    assert.equal(describeParams({ gainDb: 3, compRatio: 2, lowMonoHz: 120 }), 'gainDb 3, lowMonoHz 120');
    assert.equal(describeParams({}), '(all defaults)');
});

// A fake chain: the render's loudness is the source loudness plus the gain,
// minus what a 2:1 compressor above -18 dB takes; the true peak follows the
// gain until the limiter pins it 0.4 dB above its ceiling (inter-sample
// overshoot). Good enough to make the optimiser's moves visible.
function fakeStudio({ sourceLufs = -22, sourcePeak = -8, lowCorr = 1, silent = false } = {}) {
    const compiles = [];
    const compile = async (src) => { compiles.push(src); return new TextEncoder().encode(src); };
    const measure = async (bytes) => {
        const src = new TextDecoder().decode(bytes);
        const p = readMasteringParams(src);
        const wired = p.wired && !p.params.bypass;
        const gain = wired ? (p.params.gainDb ?? 0) : 0;
        const ceiling = wired ? (p.params.limiterCeilingDb ?? -1.2) : Infinity;
        const raw = sourceLufs + gain;
        const over = Math.max(0, raw - (-18));
        const lufs = wired ? raw - over / 2 : raw;
        const peakRaw = sourcePeak + gain - (wired ? over / 2 : 0);
        const tp = Math.min(peakRaw, ceiling + 0.4);
        return {
            silent, integratedLufs: silent ? -Infinity : lufs, truePeakDb: tp, samplePeakDb: Math.min(peakRaw, ceiling), clippedSamples: tp > 0 ? 3 : 0, longestClipRun: 0,
            plrDb: tp - lufs, loudnessRange: 5, shortTermMaxLufs: lufs, momentaryMaxLufs: lufs, crestDb: 12,
            bands: [], tiltDbPerOctave: -5, stereo: { correlation: 1, sideToMidDb: -40, lowCorrelation: lowCorr, lowHz: 120, balanceDb: 0, dcLeft: 0, dcRight: 0 },
            sections: [], leadingSilenceSeconds: 0, endLevelDb: -60, sampleRate: 44100, seconds: 10, songSeconds: 10, bpm: 120, bars: 5,
        };
    };
    return { compile, measure, compiles };
}

test('autoMaster: wires the chain, converges gain and ceiling in a few iterations, writes the block', async () => {
    const s = fakeStudio({ sourceLufs: -22, sourcePeak: -8 });
    const log = [];
    const r = await autoMaster({ source: STARTER, target: MASTERING_TARGETS.streaming, compile: s.compile, measure: s.measure, log: (l) => log.push(l) });
    assert.equal(r.ok, true, log.join('\n'));
    assert.ok(r.iterations.length >= 2 && r.iterations.length <= 4, `iterations: ${r.iterations.length}`);
    assert.ok(Math.abs(r.final.analysis.integratedLufs + 14) <= 1);
    assert.ok(r.final.analysis.truePeakDb <= -1);
    // the first gain step is the whole gap; later steps add what the compressor took
    assert.equal(r.iterations[0].params.gainDb, 8);
    assert.ok(r.iterations[r.iterations.length - 1].params.gainDb > 8);
    assert.deepEqual(readMasteringParams(r.source).params, r.params);
    assert.ok(r.source.includes(BLOCK_START) && r.source.includes('mastering.processOutputline()'));
    const report = formatAutoMasterReport(r);
    assert.ok(report.startsWith('auto_master: MASTER OK for streaming & video'), report.split('\n')[0]);
    assert.ok(/settings written to synth\.ts: gainDb [\d.]+, limiterCeilingDb -1\.5/.test(report), report.split('\n')[1]);
    assert.ok(report.includes('#1: ') && report.includes('AFTER (probe_mix'));
});

test('autoMaster: a wide bass gets lowMonoHz, an already-wired chain is corrected not duplicated', async () => {
    const s = fakeStudio({ lowCorr: 0.3 });
    const r = await autoMaster({ source: STARTER, target: MASTERING_TARGETS.streaming, compile: s.compile, measure: s.measure });
    assert.equal(r.params.lowMonoHz, 120);
    // start from a synth that already has the chain, too hot
    const hot = wireMastering(STARTER, { gainDb: 20, limiterCeilingDb: -0.3, bypass: 1 }).source;
    const s2 = fakeStudio({});
    const r2 = await autoMaster({ source: hot, target: MASTERING_TARGETS.streaming, compile: s2.compile, measure: s2.measure });
    assert.equal(r2.ok, true, r2.stopped);
    assert.equal(r2.params.bypass, 0);
    assert.ok(r2.params.limiterCeilingDb <= -1.5);
    assert.equal((r2.source.match(/new Mastering\(\)/g) || []).length, 1);
});

test('autoMaster: silence stops before any wiring; an unreachable target says why', async () => {
    const s = fakeStudio({ silent: true });
    const r = await autoMaster({ source: STARTER, compile: s.compile, measure: s.measure });
    assert.equal(r.ok, false);
    assert.match(r.stopped, /silent/);
    assert.equal(r.iterations.length, 0);
    assert.ok(formatAutoMasterReport(r).startsWith('auto_master: FAILED — the mix is silent'));
    // -60 LUFS source: +24 dB is not enough
    const q = fakeStudio({ sourceLufs: -60, sourcePeak: -45 });
    const r2 = await autoMaster({ source: STARTER, compile: q.compile, measure: q.measure });
    assert.equal(r2.ok, false);
    assert.match(r2.stopped, /gainDb is at its limit/);
    assert.equal(r2.params.gainDb, 24);
    assert.ok(formatAutoMasterReport(r2).startsWith('auto_master: NOT READY'));
});
