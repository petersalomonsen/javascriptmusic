// Measuring a rendered MIX: the numbers a mastering engineer (or a mastering
// service) reads before touching anything, and reads again afterwards to know
// whether the touch worked.
//
// Pure functions over stereo sample arrays — no DOM, no wasm, no node builtins —
// shared by the in-app probe_mix tool, the headless bench and the unit tests,
// for the same reason audioanalysis.js is: one implementation, one set of
// numbers.
//
// Loudness follows ITU-R BS.1770-4 (K-weighting, 400 ms gated blocks, the
// -70 LUFS absolute and -10 LU relative gates) and EBU R128 / Tech 3342 for the
// loudness range. True peak is measured on a 4x oversampled signal. Everything
// else (band energies, spectral tilt, correlation) is descriptive.

import { fft } from './audioanalysis.js';

// ---- targets -----------------------------------------------------------------------
// What "mastered" means for a delivery. Streaming services normalise playback
// to about -14 LUFS and turn louder masters DOWN, so louder buys nothing there;
// -1 dBTP leaves headroom for the lossy codecs they transcode to.
export const MASTERING_TARGETS = {
    streaming: { name: 'streaming & video (Spotify, YouTube, Tidal: -14 LUFS, -1 dBTP)', lufs: -14, tolerance: 1, truePeakDb: -1 },
    apple: { name: 'Apple Music / podcasts (-16 LUFS, -1 dBTP)', lufs: -16, tolerance: 1, truePeakDb: -1 },
    club: { name: 'club / DJ master (-8 LUFS, -0.5 dBTP)', lufs: -8, tolerance: 1, truePeakDb: -0.5 },
    broadcast: { name: 'broadcast, EBU R128 (-23 LUFS, -1 dBTP)', lufs: -23, tolerance: 1, truePeakDb: -1 },
};

export function resolveTarget({ target = 'streaming', targetLufs, truePeakDb } = {}) {
    const base = MASTERING_TARGETS[String(target || 'streaming').toLowerCase()] || MASTERING_TARGETS.streaming;
    const t = { ...base };
    if (Number.isFinite(Number(targetLufs))) { t.lufs = Number(targetLufs); t.name = `custom (${t.lufs} LUFS`; }
    if (Number.isFinite(Number(truePeakDb))) { t.truePeakDb = Number(truePeakDb); if (t.name.startsWith('custom')) t.name += `, ${t.truePeakDb} dBTP`; }
    if (t.name.startsWith('custom (') && !t.name.endsWith(')')) t.name += ')';
    return t;
}

// ---- K-weighting (BS.1770-4) ------------------------------------------------------------
// Stage 1: a high shelf (+4 dB above ~1.5 kHz, the head's acoustic effect).
// Stage 2: a high-pass at ~38 Hz. The ITU table gives the coefficients at 48 kHz
// only; these analogue-prototype forms reproduce that table and work at any
// rate (the derivation libebur128 uses).
export function kWeightingCoefficients(sampleRate) {
    // high shelf — the analogue-prototype bilinear form libebur128 uses; it
    // reproduces the ITU table at 48 kHz to 1e-6.
    const f0 = 1681.974450955533, G = 3.999843853973347, Q0 = 0.7071752369554196;
    const K0 = Math.tan(Math.PI * f0 / sampleRate);
    const Vh = Math.pow(10, G / 20), Vb = Math.pow(Vh, 0.4996667741545416);
    const a0 = 1 + K0 / Q0 + K0 * K0;
    const shelf = {
        b0: (Vh + Vb * K0 / Q0 + K0 * K0) / a0,
        b1: 2 * (K0 * K0 - Vh) / a0,
        b2: (Vh - Vb * K0 / Q0 + K0 * K0) / a0,
        a1: 2 * (K0 * K0 - 1) / a0,
        a2: (1 - K0 / Q0 + K0 * K0) / a0,
    };
    // high-pass
    const f1 = 38.13547087602444, Q1 = 0.5003270373238773;
    const K = Math.tan(Math.PI * f1 / sampleRate);
    const d = 1 + K / Q1 + K * K;
    const highpass = { b0: 1, b1: -2, b2: 1, a1: 2 * (K * K - 1) / d, a2: (1 - K / Q1 + K * K) / d };
    return { shelf, highpass };
}

/** Direct-form biquad over a whole array; returns a new Float32Array. */
export function biquad(x, { b0, b1, b2, a1, a2 }) {
    const y = new Float32Array(x.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) {
        const xi = x[i];
        const yi = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
        x2 = x1; x1 = xi; y2 = y1; y1 = yi;
        y[i] = yi;
    }
    return y;
}

export function kWeight(x, sampleRate) {
    const { shelf, highpass } = kWeightingCoefficients(sampleRate);
    return biquad(biquad(x, shelf), highpass);
}

// Prefix sums of squares, so the mean square of any window is two lookups.
function cumulativeEnergy(x) {
    const c = new Float64Array(x.length + 1);
    for (let i = 0; i < x.length; i++) c[i + 1] = c[i] + x[i] * x[i];
    return c;
}

const toLufs = (meanSquareSum) => -0.691 + 10 * Math.log10(Math.max(meanSquareSum, 1e-20));
const db = (v) => 20 * Math.log10(Math.max(v, 1e-12));

/**
 * Loudness per BS.1770-4 / EBU R128.
 * Returns integrated (gated), momentary max (400 ms), short-term max (3 s),
 * range (LRA), and the per-100 ms momentary series for section analysis.
 */
export function loudness(left, right, sampleRate) {
    const n = Math.min(left.length, right.length);
    const kl = kWeight(left.subarray(0, n), sampleRate);
    const kr = kWeight(right.subarray(0, n), sampleRate);
    const cl = cumulativeEnergy(kl), cr = cumulativeEnergy(kr);
    const hop = Math.round(sampleRate * 0.1);
    const meanSquare = (start, len) => {
        const end = Math.min(start + len, n);
        const cnt = end - start;
        if (cnt <= 0) return 0;
        return (cl[end] - cl[start] + cr[end] - cr[start]) / cnt;
    };
    // momentary blocks (400 ms, hop 100 ms)
    const mLen = Math.round(sampleRate * 0.4);
    const momentary = [];   // { start, z } — z = summed channel mean square
    for (let s = 0; s + mLen <= n; s += hop) momentary.push({ start: s, z: meanSquare(s, mLen) });
    if (!momentary.length && n > 0) momentary.push({ start: 0, z: meanSquare(0, n) });
    const momentaryLufs = momentary.map((b) => toLufs(b.z));
    // gating
    const absGated = momentary.filter((b) => toLufs(b.z) > -70);
    let integrated = -Infinity;
    if (absGated.length) {
        const mean1 = absGated.reduce((a, b) => a + b.z, 0) / absGated.length;
        const rel = toLufs(mean1) - 10;
        const relGated = absGated.filter((b) => toLufs(b.z) > rel);
        if (relGated.length) integrated = toLufs(relGated.reduce((a, b) => a + b.z, 0) / relGated.length);
    }
    // short-term (3 s, hop 100 ms)
    const sLen = Math.round(sampleRate * 3);
    const shortTerm = [];
    for (let s = 0; s + sLen <= n; s += hop) shortTerm.push(toLufs(meanSquare(s, sLen)));
    if (!shortTerm.length && n > 0) shortTerm.push(toLufs(meanSquare(0, n)));
    // loudness range (EBU Tech 3342): short-term, -70 abs, -20 relative, 10th..95th percentile
    let range = 0;
    const stAbs = shortTerm.filter((v) => v > -70);
    if (stAbs.length > 1) {
        const lin = stAbs.map((v) => Math.pow(10, (v + 0.691) / 10));
        const rel = toLufs(lin.reduce((a, b) => a + b, 0) / lin.length) - 20;
        const kept = stAbs.filter((v) => v > rel).sort((a, b) => a - b);
        if (kept.length > 1) {
            const q = (p) => kept[Math.min(kept.length - 1, Math.max(0, Math.round(p * (kept.length - 1))))];
            range = q(0.95) - q(0.10);
        }
    }
    const maxOf = (arr) => arr.reduce((m, v) => (v > m ? v : m), -Infinity);   // no spread: a long song has thousands of blocks
    return {
        integrated,
        momentaryMax: maxOf(momentaryLufs),
        shortTermMax: maxOf(shortTerm),
        range,
        momentary: momentaryLufs,
        momentaryHopSeconds: hop / sampleRate,
    };
}

// ---- peaks --------------------------------------------------------------------------------
// 4x oversampled peak: a windowed-sinc interpolator, 3 fractional phases of 12
// taps each. Inter-sample peaks are what clip a DAC or a lossy encoder after a
// limiter has flattened the sample values to exactly the ceiling.
const TP_TAPS = 12;
function interpolationPhases() {
    const phases = [];
    for (let p = 1; p < 4; p++) {
        const frac = p / 4;
        const taps = new Float64Array(TP_TAPS);
        for (let k = 0; k < TP_TAPS; k++) {
            const t = k - (TP_TAPS / 2 - 1) - frac;   // distance from the interpolated point
            const sinc = t === 0 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t);
            const w = 0.42 - 0.5 * Math.cos(2 * Math.PI * (k + 1 - frac) / (TP_TAPS + 1)) + 0.08 * Math.cos(4 * Math.PI * (k + 1 - frac) / (TP_TAPS + 1));
            taps[k] = sinc * Math.max(w, 0);
        }
        phases.push(taps);
    }
    return phases;
}
const PHASES = interpolationPhases();

/** Sample peak and true peak (linear) of one channel. */
export function truePeak(x) {
    let sp = 0;
    for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > sp) sp = a; }
    let tp = sp;
    const half = TP_TAPS / 2;
    for (let i = half; i < x.length - half; i++) {
        // cheap skip: an inter-sample overshoot needs neighbours near the peak
        if (Math.abs(x[i]) < tp * 0.5 && Math.abs(x[i + 1]) < tp * 0.5) continue;
        for (let p = 0; p < 3; p++) {
            const h = PHASES[p];
            let acc = 0;
            for (let k = 0; k < TP_TAPS; k++) acc += x[i - half + 1 + k] * h[k];
            const a = Math.abs(acc);
            if (a > tp) tp = a;
        }
    }
    return { samplePeak: sp, truePeak: tp };
}

export function clipping(x, threshold = 0.999) {
    let count = 0, run = 0, maxRun = 0;
    for (let i = 0; i < x.length; i++) {
        if (Math.abs(x[i]) >= threshold) { count++; run++; if (run > maxRun) maxRun = run; } else run = 0;
    }
    return { count, maxRun };
}

// ---- spectrum -------------------------------------------------------------------------------
export const BANDS = [
    { name: 'sub', lo: 20, hi: 60 },
    { name: 'bass', lo: 60, hi: 250 },
    { name: 'low-mid', lo: 250, hi: 500 },
    { name: 'mid', lo: 500, hi: 2000 },
    { name: 'high-mid', lo: 2000, hi: 6000 },
    { name: 'high', lo: 6000, hi: 20000 },
];

/**
 * Long-term power spectrum of the mono sum (averaged 4096-point Hann frames),
 * energy per band in dB relative to the total, and the spectral tilt: the
 * slope of a straight line through the per-octave power density from 50 Hz to
 * 12.8 kHz, in dB per octave. Pink noise measures -3; a bright, harsh master
 * sits well above that and a dull one well below.
 */
export function spectrumProfile(left, right, sampleRate) {
    const size = 4096;
    const n = Math.min(left.length, right.length);
    const power = new Float64Array(size / 2);
    const re = new Float64Array(size), im = new Float64Array(size);
    let frames = 0;
    for (let s = 0; s + size <= n; s += size) {
        for (let i = 0; i < size; i++) {
            re[i] = 0.5 * (left[s + i] + right[s + i]) * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (size - 1)));
            im[i] = 0;
        }
        fft(re, im);
        for (let k = 0; k < size / 2; k++) power[k] += re[k] * re[k] + im[k] * im[k];
        frames++;
    }
    if (!frames) return { bands: BANDS.map((b) => ({ ...b, db: -Infinity })), tiltDbPerOctave: 0, frames: 0 };
    const hzPerBin = sampleRate / size;
    // "total" is the audible range the bands cover, so they sum to ~100 %
    let total = 0;
    for (let k = Math.max(1, Math.ceil(20 / hzPerBin)); k < Math.min(size / 2, 20000 / hzPerBin); k++) total += power[k];
    const bandPower = (lo, hi) => {
        let sum = 0;
        for (let k = Math.max(1, Math.ceil(lo / hzPerBin)); k < Math.min(size / 2, hi / hzPerBin); k++) sum += power[k];
        return sum;
    };
    const bands = BANDS.map((b) => ({ ...b, db: 10 * Math.log10(Math.max(bandPower(b.lo, b.hi), 1e-30) / Math.max(total, 1e-30)) }));
    // tilt: octave bands 50-100 … 6400-12800, power density (per bin) vs log2(f)
    const xs = [], ys = [];
    for (let lo = 50; lo < 12800 && lo * 2 <= sampleRate / 2; lo *= 2) {
        const bins = Math.floor(lo * 2 / hzPerBin) - Math.ceil(lo / hzPerBin);
        if (bins < 1) continue;
        const p = bandPower(lo, lo * 2) / bins;
        if (p <= 0) continue;
        xs.push(Math.log2(lo * Math.SQRT2));
        ys.push(10 * Math.log10(p));
    }
    let tilt = 0;
    if (xs.length >= 2) {
        const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
        let num = 0, den = 0;
        for (let i = 0; i < xs.length; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
        tilt = den > 0 ? num / den : 0;
    }
    return { bands, tiltDbPerOctave: tilt, frames };
}

// ---- stereo ----------------------------------------------------------------------------------
function correlation(a, b) {
    let sab = 0, saa = 0, sbb = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) { sab += a[i] * b[i]; saa += a[i] * a[i]; sbb += b[i] * b[i]; }
    const d = Math.sqrt(saa * sbb);
    return d > 0 ? sab / d : 1;
}

function lowpassCoefficients(fc, sampleRate) {
    const w0 = 2 * Math.PI * fc / sampleRate, cw = Math.cos(w0), alpha = Math.sin(w0) / (2 * Math.SQRT1_2);
    const a0 = 1 + alpha;
    return { b0: (1 - cw) / 2 / a0, b1: (1 - cw) / a0, b2: (1 - cw) / 2 / a0, a1: -2 * cw / a0, a2: (1 - alpha) / a0 };
}

export function stereoProfile(left, right, sampleRate, { lowHz = 120 } = {}) {
    const n = Math.min(left.length, right.length);
    let sm = 0, ss = 0, sl = 0, sr = 0, dl = 0, dr = 0;
    for (let i = 0; i < n; i++) {
        const l = left[i], r = right[i], m = (l + r) / 2, s = (l - r) / 2;
        sm += m * m; ss += s * s; sl += l * l; sr += r * r; dl += l; dr += r;
    }
    const lp = lowpassCoefficients(lowHz, sampleRate);
    const lowCorrelation = correlation(biquad(left.subarray(0, n), lp), biquad(right.subarray(0, n), lp));
    return {
        correlation: correlation(left, right),
        sideToMidDb: 10 * Math.log10(Math.max(ss, 1e-30) / Math.max(sm, 1e-30)),
        lowCorrelation,
        lowHz,
        balanceDb: 10 * Math.log10(Math.max(sl, 1e-30) / Math.max(sr, 1e-30)),  // + = left louder
        dcLeft: n ? dl / n : 0,
        dcRight: n ? dr / n : 0,
    };
}

// ---- time structure ------------------------------------------------------------------------------
/** Loudness per section of `barsPerSection` bars from the momentary series. */
export function sectionLoudness(loud, { bpm = 120, beatsPerBar = 4, barsPerSection = 4, sampleRate = 44100, length = 0 } = {}) {
    const secSeconds = barsPerSection * beatsPerBar * 60 / bpm;
    const hopSeconds = loud.momentaryHopSeconds;
    const total = length / sampleRate;
    const sections = [];
    for (let start = 0, bar = 1; start < total - 0.05; start += secSeconds, bar += barsPerSection) {
        const i0 = Math.floor(start / hopSeconds), i1 = Math.min(loud.momentary.length, Math.ceil((start + secSeconds) / hopSeconds));
        const blocks = loud.momentary.slice(i0, i1).filter((v) => v > -90);
        let lufs = -Infinity;
        if (blocks.length) {
            const lin = blocks.map((v) => Math.pow(10, (v + 0.691) / 10));
            lufs = toLufs(lin.reduce((a, b) => a + b, 0) / lin.length);
        }
        sections.push({ fromBar: bar, toBar: Math.min(bar + barsPerSection - 1, Math.ceil(total / (beatsPerBar * 60 / bpm))), lufs });
    }
    return sections;
}

function rmsDb(x, from, to) {
    let s = 0, c = 0;
    for (let i = Math.max(0, from); i < Math.min(x.length, to); i++) { s += x[i] * x[i]; c++; }
    return c ? 10 * Math.log10(Math.max(s / c, 1e-20)) : -Infinity;
}

// ---- the whole picture ---------------------------------------------------------------------------
/**
 * Analyse a stereo render. `bpm`/`beatsPerBar` give the sections bar numbers;
 * `songSeconds` is the sequenced length (the render may carry a tail after it).
 */
export function analyzeMix(left, right, { sampleRate = 44100, bpm = 120, beatsPerBar = 4, songSeconds } = {}) {
    const n = Math.min(left.length, right.length);
    const seconds = n / sampleRate;
    const loud = loudness(left, right, sampleRate);
    const pl = truePeak(left), pr = truePeak(right);
    const truePeakLin = Math.max(pl.truePeak, pr.truePeak);
    const samplePeakLin = Math.max(pl.samplePeak, pr.samplePeak);
    const cl = clipping(left), cr = clipping(right);
    const spec = spectrumProfile(left, right, sampleRate);
    const stereo = stereoProfile(left, right, sampleRate);
    // leading silence and how the sequenced part ends
    const thresh = 1e-3; // -60 dBFS
    let first = 0;
    while (first < n && Math.abs(left[first]) < thresh && Math.abs(right[first]) < thresh) first++;
    const songEnd = Math.min(n, Math.round((songSeconds ?? seconds) * sampleRate));
    const endWindow = Math.round(sampleRate * 0.1);
    const endLevelDb = Math.max(rmsDb(left, songEnd - endWindow, songEnd), rmsDb(right, songEnd - endWindow, songEnd));
    // overall rms for the crest factor
    let e = 0;
    for (let i = 0; i < n; i++) e += left[i] * left[i] + right[i] * right[i];
    const rmsLin = Math.sqrt(e / Math.max(1, 2 * n));
    return {
        sampleRate, seconds, songSeconds: songSeconds ?? seconds, bpm, beatsPerBar,
        bars: (songSeconds ?? seconds) * bpm / 60 / beatsPerBar,
        integratedLufs: loud.integrated,
        shortTermMaxLufs: loud.shortTermMax,
        momentaryMaxLufs: loud.momentaryMax,
        loudnessRange: loud.range,
        truePeakDb: db(truePeakLin),
        samplePeakDb: db(samplePeakLin),
        clippedSamples: cl.count + cr.count,
        longestClipRun: Math.max(cl.maxRun, cr.maxRun),
        plrDb: db(truePeakLin) - loud.integrated,
        crestDb: db(samplePeakLin) - db(rmsLin),
        bands: spec.bands,
        tiltDbPerOctave: spec.tiltDbPerOctave,
        stereo,
        sections: sectionLoudness(loud, { bpm, beatsPerBar, sampleRate, length: songEnd }),
        leadingSilenceSeconds: first / sampleRate,
        endLevelDb,
        silent: samplePeakLin < 1e-4,
    };
}

// ---- verdict and report --------------------------------------------------------------------------
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : '-inf');
const signed = (v) => (v >= 0 ? '+' : '') + f1(v);

/**
 * Problems and advisories against a target. `problems` fail the master;
 * `notes` are things worth a look. Both are plain sentences for the report.
 */
export function mixVerdict(a, target = MASTERING_TARGETS.streaming) {
    const problems = [], notes = [];
    if (a.silent) { problems.push('the render is SILENT — nothing to master; check the song and the instruments first'); return { ok: false, problems, notes }; }
    const dl = a.integratedLufs - target.lufs;
    if (!Number.isFinite(a.integratedLufs)) problems.push('integrated loudness is below the -70 LUFS gate — the mix is practically silent');
    else if (dl > target.tolerance) problems.push(`integrated loudness ${f1(a.integratedLufs)} LUFS is ${f1(dl)} LU ABOVE the ${target.lufs} LUFS target (the service will turn it down; lower gainDb by about ${f1(dl)} dB)`);
    else if (dl < -target.tolerance) problems.push(`integrated loudness ${f1(a.integratedLufs)} LUFS is ${f1(-dl)} LU BELOW the ${target.lufs} LUFS target (raise gainDb by about ${f1(-dl)} dB and let the limiter catch the peaks)`);
    if (a.truePeakDb > target.truePeakDb + 0.1) problems.push(`true peak ${f1(a.truePeakDb)} dBTP is over the ${target.truePeakDb} dBTP ceiling by ${f1(a.truePeakDb - target.truePeakDb)} dB (lower limiterCeilingDb by that much, or more)`);
    if (a.clippedSamples > 0) problems.push(`${a.clippedSamples} clipped samples (longest run ${a.longestClipRun}) — the limiter is not catching everything, or the limiter is bypassed`);
    if (Number.isFinite(a.plrDb) && a.plrDb < 6) notes.push(`peak-to-loudness ratio ${f1(a.plrDb)} dB is very low — the master is squashed flat; back off compression or the input gain`);
    if (a.loudnessRange > 15) notes.push(`loudness range ${f1(a.loudnessRange)} LU is wide — quiet parts will sit far under the loud ones on a phone; more compression, or lift the quiet sections in the mix`);
    if (a.stereo.lowCorrelation < 0.5) notes.push(`low end (<${a.stereo.lowHz} Hz) correlation ${a.stereo.lowCorrelation.toFixed(2)} — the bass is wide/out of phase and will thin out in mono; set lowMonoHz (e.g. 120)`);
    if (Math.abs(a.stereo.balanceDb) > 1.5) notes.push(`L/R balance ${signed(a.stereo.balanceDb)} dB — the mix leans ${a.stereo.balanceDb > 0 ? 'left' : 'right'}; check the pans`);
    if (Math.abs(a.stereo.dcLeft) > 0.01 || Math.abs(a.stereo.dcRight) > 0.01) notes.push('DC offset present — the high-pass should remove it; check an instrument is not outputting a constant');
    if (a.tiltDbPerOctave > -3.5) notes.push(`spectral tilt ${f1(a.tiltDbPerOctave)} dB/oct is bright/harsh territory (pink noise is -3; finished masters usually fall between about -4 and -7) — consider tiltDb -1..-2 or a lower highThresholdDb`);
    else if (a.tiltDbPerOctave < -8) notes.push(`spectral tilt ${f1(a.tiltDbPerOctave)} dB/oct is dull (finished masters usually fall between about -4 and -7) — consider tiltDb +1..+2`);
    const sub = a.bands.find((b) => b.name === 'sub');
    if (sub && sub.db > -4) notes.push(`sub band (20-60 Hz) carries ${f1(sub.db)} dB of the total energy — a lot even for bass-heavy music; raise highpassHz to 30-40 or tame lowThresholdDb`);
    const quiet = a.sections.filter((s) => Number.isFinite(s.lufs) && Number.isFinite(a.integratedLufs) && s.lufs < a.integratedLufs - 8);
    if (quiet.length) notes.push(`sections well under the average (>8 LU below): bars ${quiet.map((s) => `${s.fromBar}-${s.toBar}`).join(', ')} — intended breakdowns are fine; otherwise raise those parts in the mix`);
    if (a.endLevelDb > -40) notes.push(`the sequenced part ends at ${f1(a.endLevelDb)} dBFS — an export stops at the loop point, so a tail is cut; fine for a loop, otherwise end the song with a release`);
    return { ok: problems.length === 0, problems, notes };
}

/** The probe_mix report: compact, one fact per line, verdict first. */
export function formatMixReport(a, target = MASTERING_TARGETS.streaming) {
    const v = mixVerdict(a, target);
    const lines = [];
    lines.push(`${v.ok ? 'MASTER OK' : 'NOT READY'} for ${target.name}${v.ok ? '' : ` — ${v.problems.length} problem${v.problems.length === 1 ? '' : 's'}`}`);
    lines.push(`render: ${f1(a.songSeconds)} s sequenced (${a.bars.toFixed(1)} bars at ${a.bpm} BPM) + tail, ${a.sampleRate} Hz`);
    if (a.silent) { lines.push('audio: SILENT'); lines.push(...v.problems.map((p) => `PROBLEM: ${p}`)); return lines.join('\n'); }
    lines.push(`loudness: integrated ${f1(a.integratedLufs)} LUFS (target ${target.lufs} ±${target.tolerance})  short-term max ${f1(a.shortTermMaxLufs)}  momentary max ${f1(a.momentaryMaxLufs)}  range ${f1(a.loudnessRange)} LU`);
    lines.push(`peaks: true peak ${f1(a.truePeakDb)} dBTP (ceiling ${target.truePeakDb})  sample peak ${f1(a.samplePeakDb)} dBFS  clipped samples ${a.clippedSamples}`);
    lines.push(`dynamics: PLR ${f1(a.plrDb)} dB (true peak − integrated)  crest ${f1(a.crestDb)} dB`);
    lines.push(`spectrum (dB of total): ${a.bands.map((b) => `${b.name} ${f1(b.db)}`).join('  ')};  tilt ${f1(a.tiltDbPerOctave)} dB/oct (pink = -3)`);
    lines.push(`stereo: correlation ${a.stereo.correlation.toFixed(2)}  side/mid ${f1(a.stereo.sideToMidDb)} dB  low-end (<${a.stereo.lowHz} Hz) correlation ${a.stereo.lowCorrelation.toFixed(2)}  L/R balance ${signed(a.stereo.balanceDb)} dB`);
    if (a.sections.length) {
        const per = a.sections.length > 24 ? 2 : 1;   // long songs: every other section
        const shown = a.sections.filter((_, i) => i % per === 0).map((s) => `${s.fromBar}-${s.toBar}: ${f1(s.lufs)}`);
        const finite = a.sections.filter((s) => Number.isFinite(s.lufs));
        const q = finite.length ? finite.reduce((m, s) => (s.lufs < m.lufs ? s : m)) : null;
        const l = finite.length ? finite.reduce((m, s) => (s.lufs > m.lufs ? s : m)) : null;
        lines.push(`sections (bars: LUFS): ${shown.join(' | ')}${q && l ? `  → quietest ${q.fromBar}-${q.toBar} (${f1(q.lufs)}), loudest ${l.fromBar}-${l.toBar} (${f1(l.lufs)})` : ''}`);
    }
    lines.push(`edges: ${f1(a.leadingSilenceSeconds)} s leading silence; level in the last 100 ms of the sequence ${f1(a.endLevelDb)} dBFS`);
    for (const p of v.problems) lines.push(`PROBLEM: ${p}`);
    for (const n of v.notes) lines.push(`NOTE: ${n}`);
    return lines.join('\n');
}
