// The mix measurements are what the mastering loop steers by, so they are
// pinned to published reference values rather than to themselves.
//
// Run with: npm run test-agent-tools

import { test } from 'node:test';
import assert from 'node:assert';
import {
    kWeightingCoefficients, loudness, truePeak, clipping, spectrumProfile, stereoProfile,
    analyzeMix, mixVerdict, formatMixReport, resolveTarget, MASTERING_TARGETS,
} from './mixanalysis.js';

const SR = 48000;
const sine = (hz, seconds, amp, sr = SR, phase = 0) => {
    const x = new Float32Array(Math.round(seconds * sr));
    for (let i = 0; i < x.length; i++) x[i] = amp * Math.sin(2 * Math.PI * hz * i / sr + phase);
    return x;
};
const dbfs = (db) => Math.pow(10, db / 20);
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (±${tol})`);

test('K-weighting at 48 kHz reproduces the ITU-R BS.1770-4 coefficient table', () => {
    const { shelf, highpass } = kWeightingCoefficients(48000);
    // Table 1 (stage 1) and Table 2 (stage 2) of BS.1770-4
    near(shelf.b0, 1.53512485958697, 1e-6, 'shelf b0');
    near(shelf.b1, -2.69169618940638, 1e-6, 'shelf b1');
    near(shelf.b2, 1.19839281085285, 1e-6, 'shelf b2');
    near(shelf.a1, -1.69065929318241, 1e-6, 'shelf a1');
    near(shelf.a2, 0.73248077421585, 1e-6, 'shelf a2');
    near(highpass.a1, -1.99004745483398, 1e-6, 'hp a1');
    near(highpass.a2, 0.99007225036621, 1e-6, 'hp a2');
});

test('EBU Tech 3341 reference: a 1 kHz stereo sine at -23 dBFS reads -23 LUFS', () => {
    const x = sine(1000, 6, dbfs(-23));
    const l = loudness(x, x, SR);
    near(l.integrated, -23, 0.1, 'integrated');
    near(l.shortTermMax, -23, 0.1, 'short-term');
    near(l.momentaryMax, -23, 0.1, 'momentary');
    assert.ok(l.range < 0.5, `a steady tone has no loudness range (${l.range})`);
    // and it holds at the synth's own rate
    near(loudness(sine(1000, 6, dbfs(-23), 44100), sine(1000, 6, dbfs(-23), 44100), 44100).integrated, -23, 0.1, '44.1k');
});

test('gating: silence between bursts does not drag the integrated loudness down', () => {
    // Tech 3341 case 3-style: -23 dBFS tone with long silent gaps must still read -23.
    // (blocks straddling a tone/silence edge are partially filled and still pass
    // the relative gate — every real meter reads a little low here too)
    const tone = sine(1000, 10, dbfs(-23));
    const gap = new Float32Array(SR * 4);
    const x = new Float32Array(tone.length * 2 + gap.length);
    x.set(tone, 0); x.set(gap, tone.length); x.set(tone, tone.length + gap.length);
    near(loudness(x, x, SR).integrated, -23, 0.3, 'gated integrated');
    assert.strictEqual(loudness(gap, gap, SR).integrated, -Infinity, 'pure silence is below the gate');
});

test('true peak sees the inter-sample overshoot that the sample peak misses', () => {
    // A full-scale sine whose samples straddle the crest: the sample peak is
    // below 1 while the waveform itself reaches 1 between samples.
    const x = sine(SR / 4, 0.5, 1.0, SR, Math.PI / 4);   // samples at ±0.707
    const p = truePeak(x);
    near(p.samplePeak, Math.SQRT1_2, 1e-3, 'sample peak');
    assert.ok(p.truePeak > 0.95 && p.truePeak <= 1.05, `true peak recovers the crest (${p.truePeak})`);
    // a plain low-frequency sine: true peak ≈ sample peak
    const s = truePeak(sine(100, 0.5, 0.5));
    near(s.truePeak, 0.5, 0.01, 'low-frequency true peak');
});

test('clipping counts samples at or above the threshold and the longest run', () => {
    const x = new Float32Array([0, 0.5, 1, 1, 1, 0.2, -1, 0.999, 0.3]);
    assert.deepStrictEqual(clipping(x), { count: 5, maxRun: 3 });
});

test('spectral tilt: white noise is flat, pink noise falls about 3 dB per octave', () => {
    let seed = 12345;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 - 0.5; };
    const white = new Float32Array(SR * 4);
    for (let i = 0; i < white.length; i++) white[i] = rnd();
    const w = spectrumProfile(white, white, SR);
    near(w.tiltDbPerOctave, 0, 0.7, 'white tilt');
    // pink via Paul Kellet's filter
    const pink = new Float32Array(SR * 4);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < pink.length; i++) {
        const wv = rnd();
        b0 = 0.99886 * b0 + wv * 0.0555179; b1 = 0.99332 * b1 + wv * 0.0750759; b2 = 0.96900 * b2 + wv * 0.1538520;
        b3 = 0.86650 * b3 + wv * 0.3104856; b4 = 0.55000 * b4 + wv * 0.5329522; b5 = -0.7616 * b5 - wv * 0.0168980;
        pink[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + wv * 0.5362) * 0.11;
        b6 = wv * 0.115926;
    }
    const p = spectrumProfile(pink, pink, SR);
    near(p.tiltDbPerOctave, -3, 0.8, 'pink tilt');
    // band energies sum to (about) everything
    const total = p.bands.reduce((s, b) => s + Math.pow(10, b.db / 10), 0);
    near(total, 1, 0.05, 'bands cover the spectrum');
});

test('stereo profile: identical channels correlate 1, inverted channels -1, a wide bass is caught', () => {
    const a = sine(80, 2, 0.5), b = sine(80, 2, 0.5, SR, Math.PI);
    assert.ok(stereoProfile(a, a, SR).correlation > 0.999);
    assert.ok(stereoProfile(a, b, SR).correlation < -0.999);
    assert.ok(stereoProfile(a, b, SR).lowCorrelation < -0.9, 'the low band sees the phase flip');
    assert.ok(stereoProfile(a, a, SR).sideToMidDb < -60, 'no side signal');
    near(stereoProfile(sine(1000, 1, 0.5), sine(1000, 1, 0.25), SR).balanceDb, 6, 0.1, 'left louder by 6 dB');
});

test('analyzeMix + verdict: too loud and over the ceiling fails, in-range passes, silence is named', () => {
    const loud = sine(1000, 16, dbfs(-0.5));
    const a = analyzeMix(loud, loud, { sampleRate: SR, bpm: 120 });
    const v = mixVerdict(a, MASTERING_TARGETS.streaming);
    assert.ok(!v.ok);
    assert.ok(v.problems.some((p) => /ABOVE the -14 LUFS target/.test(p)), v.problems.join('|'));
    assert.ok(v.problems.some((p) => /true peak .* over the -1 dBTP ceiling/.test(p)), v.problems.join('|'));
    near(a.bars, 8, 0.01, '16 s at 120 BPM is 8 bars');
    assert.ok(a.sections.length === 2, `two 4-bar sections (${a.sections.length})`);

    const ok = sine(1000, 8, dbfs(-14));
    const b = analyzeMix(ok, ok, { sampleRate: SR, bpm: 120 });
    assert.ok(mixVerdict(b).ok, mixVerdict(b).problems.join('|'));
    const report = formatMixReport(b);
    assert.ok(report.startsWith('MASTER OK for streaming'), report.split('\n')[0]);
    assert.ok(/integrated -14\.0 LUFS/.test(report));

    const silent = new Float32Array(SR * 2);
    const s = analyzeMix(silent, silent, { sampleRate: SR });
    assert.ok(s.silent);
    assert.ok(formatMixReport(s).includes('SILENT'));
});

test('targets resolve by name with overrides', () => {
    assert.strictEqual(resolveTarget({}).lufs, -14);
    assert.strictEqual(resolveTarget({ target: 'APPLE' }).lufs, -16);
    assert.strictEqual(resolveTarget({ target: 'nonsense' }).lufs, -14);
    const c = resolveTarget({ targetLufs: -10, truePeakDb: -0.5 });
    assert.strictEqual(c.lufs, -10);
    assert.strictEqual(c.truePeakDb, -0.5);
    assert.ok(c.name.startsWith('custom'));
});
