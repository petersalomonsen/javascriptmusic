// Measuring rendered audio: the numbers that answer "did this actually make a
// sound, and what kind?".
//
// Pure functions over sample arrays — no DOM, no wasm, no node builtins — so
// the browser probe (instrumentprobe.js), the offline harness
// (tools/instrumenttest/render.mjs) and the unit tests all share ONE
// implementation. Two copies of an FFT that disagree is exactly the kind of
// drift that makes a verification tool worthless.

export function rms(samples) {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
    return Math.sqrt(sum / (samples.length || 1));
}

export function peak(samples) {
    let p = 0;
    for (let i = 0; i < samples.length; i++) {
        const a = Math.abs(samples[i]);
        if (a > p) p = a;
    }
    return p;
}

/** In-place iterative radix-2 FFT. re/im are Float64Array of length 2^k. */
export function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
        let bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) {
            let t = re[i]; re[i] = re[j]; re[j] = t;
            t = im[i]; im[i] = im[j]; im[j] = t;
        }
    }
    for (let len = 2; len <= n; len <<= 1) {
        const ang = -2 * Math.PI / len;
        const wr = Math.cos(ang), wi = Math.sin(ang);
        for (let i = 0; i < n; i += len) {
            let cr = 1, ci = 0;
            for (let k = 0; k < len / 2; k++) {
                const ur = re[i + k], ui = im[i + k];
                const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
                const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
                re[i + k] = ur + vr; im[i + k] = ui + vi;
                re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
                const ncr = cr * wr - ci * wi;
                ci = cr * wi + ci * wr; cr = ncr;
            }
        }
    }
}

/**
 * Dominant frequency and spectral centroid of a window (Hann-windowed FFT).
 *
 * The centroid is a cheap "how bright is it" number, and it is what makes drums
 * distinguishable without listening: a kick sits near 100Hz, a hi-hat above
 * 10kHz. Comparing two notes' centroids is how you check that a note actually
 * selects a different drum.
 */
export function spectrum(samples, sampleRate = 44100) {
    let size = 1;
    while (size * 2 <= samples.length && size < 16384) size *= 2;
    if (size < 64) return { dominantHz: 0, centroidHz: 0 };
    const re = new Float64Array(size);
    const im = new Float64Array(size);
    for (let i = 0; i < size; i++) {
        re[i] = samples[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (size - 1)));
    }
    fft(re, im);
    let bestHz = 0, bestMag = 0, magSum = 0, weighted = 0;
    for (let k = 1; k < size / 2; k++) {
        const mag = Math.hypot(re[k], im[k]);
        const hz = k * sampleRate / size;
        if (mag > bestMag) { bestMag = mag; bestHz = hz; }
        magSum += mag;
        weighted += mag * hz;
    }
    return { dominantHz: bestHz, centroidHz: magSum > 0 ? weighted / magSum : 0 };
}

// Below this peak nothing is audible — treat it as silence rather than
// "very quiet", so a voice that never opens its envelope is reported plainly.
export const SILENCE_PEAK = 1e-4;

// The sequencer's note naming: note 60 is c5 (name + floor(n / 12)).
export const NOTE_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
export const noteName = (n) => NOTE_NAMES[n % 12] + Math.floor(n / 12);
export const midiToFreq = (n) => 440 * Math.pow(2, (n - 69) / 12);

export function parseNote(token) {
    const t = String(token).trim();
    if (/^\d+$/.test(t)) return Number(t);
    const m = /^([a-g]s?)(\d{1,2})$/i.exec(t);
    if (!m) throw new Error(`unrecognised note "${token}" (use c3, fs3, or a MIDI number)`);
    const ndx = NOTE_NAMES.indexOf(m[1].toLowerCase());
    if (ndx < 0) throw new Error(`unrecognised note name "${m[1]}"`);
    return ndx + Number(m[2]) * 12;
}

/** Measure one rendered note. `held`/`tail` are the sustain and release windows. */
export function measureNote(held, tail, { note, sampleRate = 44100 } = {}) {
    const { dominantHz, centroidHz } = spectrum(held, sampleRate);
    const p = peak(held);
    return {
        note,
        name: note === undefined ? undefined : noteName(note),
        expectedHz: note === undefined ? undefined : midiToFreq(note),
        peak: p,
        rms: rms(held),
        tailRms: rms(tail),
        dominantHz,
        centroidHz,
        silent: p < SILENCE_PEAK,
    };
}
