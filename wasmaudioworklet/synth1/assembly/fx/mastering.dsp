// Mastering chain for the WebAssembly Music master bus.
//
// Stereo in, stereo out; runs once per sample frame from the synth's
// postprocess() on `outputline`. Every hslider below becomes a public field on
// the generated `Mastering` class (fx/mastering.ts), so the values are set from
// synth.ts and iterated on by the mastering specialist against measurements
// (probe_mix): this chain has no adaptive leveler on purpose — a fixed gain
// that the loop adjusts converges predictably, a feedback leveler pumps.
//
// Regenerate the AssemblyScript (from the repo root, after `npm install` in
// tools/faust2as):
//
//   node tools/faust2as/faust2asc.js --effect --library --name Mastering \
//     --out wasmaudioworklet/synth1/assembly/fx/mastering.ts \
//     wasmaudioworklet/synth1/assembly/fx/mastering.dsp
//   (cd wasmaudioworklet/synth1 && node createbrowsertsbundle.js)
//
// Order of the chain (the order of a conventional mastering insert):
//   gain → high-pass → tilt EQ → low-end mono → 3-band compressor → brickwall limiter → clip

declare name "mastering";
declare author "Peter Salomonsen";
declare license "GPLv3";

import("stdfaust.lib");

// ---- controls -----------------------------------------------------------------
// Input gain before everything else. The specialist sets this from the measured
// integrated loudness: target minus measured, then lets the limiter catch peaks.
gainDb = hslider("gainDb [unit:dB]", 0, -24, 24, 0.1);
// Removes DC and sub-rumble no speaker reproduces; 2nd-order Butterworth.
highpassHz = hslider("highpassHz [unit:Hz]", 25, 10, 120, 1);
// Spectral tilt around 630 Hz: +tiltDb high shelf, -tiltDb low shelf. Positive = brighter.
tiltDb = hslider("tiltDb [unit:dB]", 0, -6, 6, 0.1);
// Everything below this frequency is summed to mono (0 = off). Keeps the bass
// centred and stable on phone speakers and lossy codecs.
lowMonoHz = hslider("lowMonoHz [unit:Hz]", 0, 0, 300, 1);
// Multiband compressor: crossover frequencies and per-band thresholds, one
// ratio/attack/release for all bands, makeup after the bands are summed.
lowCrossoverHz = hslider("lowCrossoverHz [unit:Hz]", 150, 40, 500, 1);
highCrossoverHz = hslider("highCrossoverHz [unit:Hz]", 3000, 1000, 10000, 10);
lowThresholdDb = hslider("lowThresholdDb [unit:dB]", -18, -60, 0, 0.5);
midThresholdDb = hslider("midThresholdDb [unit:dB]", -18, -60, 0, 0.5);
highThresholdDb = hslider("highThresholdDb [unit:dB]", -18, -60, 0, 0.5);
compRatio = hslider("compRatio", 2, 1, 10, 0.1);
compAttackMs = hslider("compAttackMs [unit:ms]", 15, 0.1, 100, 0.1);
compReleaseMs = hslider("compReleaseMs [unit:ms]", 150, 10, 1000, 1);
compMakeupDb = hslider("compMakeupDb [unit:dB]", 0, 0, 24, 0.1);
// Brickwall look-ahead limiter (5 ms look-ahead, so 5 ms of latency). The
// ceiling is a SAMPLE peak and is never exceeded; true peak can still sit a
// little above it between samples — probe_mix reports dBTP, lower the ceiling
// if it is above the target.
limiterCeilingDb = hslider("limiterCeilingDb [unit:dB]", -1.2, -12, 0, 0.1);
limiterReleaseMs = hslider("limiterReleaseMs [unit:ms]", 80, 10, 1000, 1);
// 1 = pass the mix through untouched (A/B against the mastered result).
bypass = hslider("bypass", 0, 0, 1, 1);

// ---- building blocks ------------------------------------------------------------
// Linkwitz-Riley 4th order: two cascaded 2nd-order Butterworths. LP + HP of the
// same frequency sum to an all-pass, so the bands recombine flat.
lr4lp(f) = fi.lowpass(2, f) : fi.lowpass(2, f);
lr4hp(f) = fi.highpass(2, f) : fi.highpass(2, f);
lr4ap(f) = _ <: lr4lp(f) + lr4hp(f);

// ---- stages -----------------------------------------------------------------------
pregain = par(i, 2, *(g)) with { g = gainDb : ba.db2linear : si.smoo; };

highpass = par(i, 2, fi.highpass(2, highpassHz));

tilt = par(i, 2, fi.lowshelf(1, 0 - t, 630) : fi.highshelf(1, t, 630)) with { t = tiltDb : si.smoo; };

// Split at lowMonoHz, replace the low band of both channels with their average
// (crossfaded by `m`, so 0 leaves the stereo image alone), add the highs back.
lowmono(l, r) = lowL * (1 - m) + mono * m + hiL, lowR * (1 - m) + mono * m + hiR
with {
    f = max(lowMonoHz, 20);
    m = (lowMonoHz > 0) : si.smoo;
    lowL = l : lr4lp(f);
    lowR = r : lr4lp(f);
    hiL = l : lr4hp(f);
    hiR = r : lr4hp(f);
    mono = (lowL + lowR) * 0.5;
};

// Three bands with phase-aligned recombination: the low band also passes the
// high crossover's all-pass so the sum of all three is flat.
multiband = split : bands : recombine : makeup
with {
    f1 = lowCrossoverHz;
    f2 = highCrossoverHz;
    att = compAttackMs * 0.001;
    rel = compReleaseMs * 0.001;
    // (l, r) -> (lowL, lowR, midL, midR, highL, highR)
    split(l, r) = (l : lr4lp(f1) : lr4ap(f2)), (r : lr4lp(f1) : lr4ap(f2)),
                  (l : lr4hp(f1) : lr4lp(f2)), (r : lr4hp(f1) : lr4lp(f2)),
                  (l : lr4hp(f1) : lr4hp(f2)), (r : lr4hp(f1) : lr4hp(f2));
    bands = co.compressor_stereo(compRatio, lowThresholdDb, att, rel),
            co.compressor_stereo(compRatio, midThresholdDb, att, rel),
            co.compressor_stereo(compRatio, highThresholdDb, att, rel);
    recombine(ll, lr, ml, mr, hl, hr) = ll + ml + hl, lr + mr + hr;
    makeup = par(i, 2, *(g)) with { g = compMakeupDb : ba.db2linear : si.smoo; };
};

// A limiter that cannot overshoot: the gain at the moment a sample leaves is
// the MEAN over the look-ahead window of 1 / (reduction needed), and every
// reduction in that window already accounts for this sample (sliding max), so
// |out| <= ceiling by construction. The mean gives a linear attack ramp of one
// window; the release is a one-pole decay of the reduction back to 1.
// Library look-ahead limiters smooth the gain with a one-pole instead, which
// reaches only ~63 % of the reduction within one attack time — they overshoot.
limiter(l, r) = (l @ (N - 1)) * gain, (r @ (N - 1)) * gain
with {
    N = int(0.005 * ma.SR);                  // look-ahead window, samples
    MAXN = 1024;                             // upper bound for the sliding windows (96 kHz: 480)
    ceiling = limiterCeilingDb : ba.db2linear;
    pole = ba.tau2pole(limiterReleaseMs * 0.001);
    peak = max(abs(l), abs(r)) : ba.slidingMax(N, MAXN);
    need = max(1.0, peak / ceiling);         // gain reduction required, as a factor >= 1
    // release: fall back toward 1 with the release time constant, but never below what is needed now
    held = need : (max ~ (-(1.0) : *(pole) : +(1.0)));
    gain = 1.0 / held : ba.slidingMeanp(N, MAXN);
};

// Nothing past full scale, whatever the settings.
clip = par(i, 2, max(-1.0) : min(1.0));

chain = pregain : highpass : tilt : lowmono : multiband : limiter : clip;

process = ba.bypass2(bypass, chain);
