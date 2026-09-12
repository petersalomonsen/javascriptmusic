// Automatic mastering: the numeric part of what a mastering service does,
// with no model in the loop.
//
// Given a synth source, a compile function and a measure function, it wires
// the Mastering chain in, then iterates the chain's numeric settings against
// the measurement until the mix meets the delivery target: input gain from the
// loudness difference, the limiter ceiling from the true-peak overshoot,
// low-end mono from the low-band correlation. Each step is a compile + render
// + analysis, so the numbers are the real ones, not a model of the chain.
//
// It deliberately does NOT touch tone (tilt, thresholds) or the mix: those are
// judgement calls the mastering specialist makes from the NOTE lines with the
// brief in hand. This function makes the arithmetic part of that job exact.
//
// Pure over its callbacks: the browser tool compiles in the compile worker and
// measures in the mix-probe worker; the headless bench compiles with asc and
// measures inline; the tests use a fake chain model.

import { mixVerdict, formatMixReport, MASTERING_TARGETS } from './mixanalysis.js';
import { wireMastering, readMasteringParams, describeParams } from './masteringedit.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round1 = (v) => Math.round(v * 10) / 10;

/**
 * @param {object} o
 * @param {string} o.source        the synth document
 * @param {object} o.target        from resolveTarget() — { lufs, tolerance, truePeakDb, name }
 * @param {(source: string) => Promise<Uint8Array>} o.compile
 * @param {(bytes: Uint8Array) => Promise<object>} o.measure   analyzeMix() result
 * @param {number} [o.maxIterations=6]
 * @param {object} [o.params]      starting values that override what the synth has
 * @param {(line: string) => void} [o.log]
 */
export async function autoMaster({ source, target = MASTERING_TARGETS.streaming, compile, measure, maxIterations = 6, params: overrides = {}, log = () => {} }) {
    const t0 = Date.now();
    const before = await measure(await compile(source));
    const beforeVerdict = mixVerdict(before, target);
    const result = { target, before, beforeVerdict, iterations: [], ok: false, source, params: {}, stopped: '', ms: 0 };
    if (before.silent || !Number.isFinite(before.integratedLufs)) {
        result.stopped = 'the mix is silent — nothing to master';
        result.ms = Date.now() - t0;
        return result;
    }
    const existing = readMasteringParams(source);
    const params = { ...existing.params, ...overrides };
    if (params.bypass) params.bypass = 0;
    // starting point: the whole loudness gap on the input gain (the compressor
    // will take a share back — the loop corrects that), the ceiling a little
    // under the true-peak target, low-end mono when the bass is wide
    const gap = target.lufs - before.integratedLufs;
    params.gainDb = clamp(round1((existing.wired ? (params.gainDb ?? 0) : 0) + gap), -24, 24);
    // a ceiling above the target cannot pass; one far below it throws away headroom — both restart at target − 0.5
    if (params.limiterCeilingDb === undefined || params.limiterCeilingDb > target.truePeakDb || params.limiterCeilingDb < target.truePeakDb - 1.5) params.limiterCeilingDb = round1(target.truePeakDb - 0.5);
    if (params.lowMonoHz === undefined && before.stereo.lowCorrelation < 0.8) params.lowMonoHz = 120;
    log(`before: ${before.integratedLufs.toFixed(1)} LUFS, ${before.truePeakDb.toFixed(1)} dBTP → start ${describeParams(params)}`);

    let best = null;
    const score = (a, v) => (v.ok ? -1 : Math.abs(a.integratedLufs - target.lufs) + 2 * Math.max(0, a.truePeakDb - target.truePeakDb) + (a.clippedSamples > 0 ? 10 : 0));
    let lastGap = Infinity;
    for (let i = 0; i < maxIterations; i++) {
        const wired = wireMastering(source, params).source;
        const analysis = await measure(await compile(wired));
        const verdict = mixVerdict(analysis, target);
        const step = { n: i + 1, params: { ...params }, analysis, verdict, source: wired };
        result.iterations.push(step);
        log(`#${step.n} ${describeParams(params)} → ${analysis.integratedLufs.toFixed(1)} LUFS, ${analysis.truePeakDb.toFixed(1)} dBTP, clipped ${analysis.clippedSamples}${verdict.ok ? ' — OK' : ''}`);
        if (!best || score(analysis, verdict) < score(best.analysis, best.verdict)) best = step;
        if (verdict.ok) { result.stopped = `met the target after ${step.n} iteration${step.n === 1 ? '' : 's'}`; break; }
        if (analysis.silent) { result.stopped = 'the mastered render is silent — check bypass and the postprocess() wiring'; break; }
        // --- the moves ---
        const dl = analysis.integratedLufs - target.lufs;
        const tpOver = analysis.truePeakDb - target.truePeakDb;
        let moved = false;
        if (Math.abs(dl) > target.tolerance / 2) {
            const next = clamp(round1(params.gainDb - dl), -24, 24);
            if (next !== params.gainDb) { params.gainDb = next; moved = true; }
            else result.stopped = `gainDb is at its limit (${params.gainDb}) and the mix is still ${Math.abs(dl).toFixed(1)} LU ${dl > 0 ? 'above' : 'below'} the target — the source mix itself is too ${dl > 0 ? 'hot' : 'quiet'}`;
        }
        if (tpOver > 0.1 || analysis.clippedSamples > 0) {
            const next = clamp(round1(params.limiterCeilingDb - Math.max(tpOver, 0) - 0.2 - (analysis.clippedSamples > 0 ? 0.5 : 0)), -12, 0);
            if (next !== params.limiterCeilingDb) { params.limiterCeilingDb = next; moved = true; }
        }
        if (!moved) { result.stopped = result.stopped || 'no numeric move left — what remains is a NOTE for the specialist'; break; }
        // convergence guard: the loudness gap must keep shrinking
        if (Math.abs(dl) >= lastGap - 0.05 && i >= 2) { result.stopped = `the loudness gap stopped shrinking at ${Math.abs(dl).toFixed(1)} LU — the compressor/limiter are absorbing the gain; lower the thresholds or the source level instead`; break; }
        lastGap = Math.abs(dl);
    }
    if (!result.stopped) result.stopped = `stopped after ${maxIterations} iterations`;
    result.ok = !!best?.verdict.ok;
    result.final = best;
    result.source = best ? best.source : source;
    result.params = best ? best.params : params;
    result.ms = Date.now() - t0;
    return result;
}

const pick = (report, prefix) => report.split('\n').find((l) => l.startsWith(prefix)) || '';

/** The auto_master tool result: verdict first, the path it took, the final measurement in full. */
export function formatAutoMasterReport(r) {
    const t = r.target;
    const lines = [];
    const last = r.final?.analysis;
    if (!last) {
        lines.push(`auto_master: FAILED — ${r.stopped}`);
        lines.push('', 'BEFORE (as the synth was):', formatMixReport(r.before, t));
        return lines.join('\n');
    }
    const finalVerdict = r.final.verdict;
    lines.push(`auto_master: ${r.ok ? 'MASTER OK' : 'NOT READY'} for ${t.name} — ${r.stopped}${r.ok ? '' : `; ${finalVerdict.problems.join('; ')}`}`);
    lines.push(`settings written to synth.ts: ${describeParams(r.params)}`);
    const beforeReport = formatMixReport(r.before, t);
    lines.push(`before: ${pick(beforeReport, 'loudness:')}`);
    lines.push(`        ${pick(beforeReport, 'peaks:')}`);
    for (const s of r.iterations) {
        lines.push(`#${s.n}: ${describeParams(s.params)} → integrated ${s.analysis.integratedLufs.toFixed(1)} LUFS, true peak ${s.analysis.truePeakDb.toFixed(1)} dBTP, clipped ${s.analysis.clippedSamples}${s.verdict.ok ? '  ✓' : ''}`);
    }
    lines.push('', 'AFTER (probe_mix of the written settings):', formatMixReport(last, t));
    return lines.join('\n');
}
