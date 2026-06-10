import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Audio-level regression test for the faust-rs Faust→AssemblyScript path:
// transpile a DX7 algorithm in the browser, apply an E.Piano-style patch via
// NRPN, render a note to WAV through the app's export pipeline, and assert
// the sound BEHAVES like a piano. Two specific regressions are encoded:
//
//   1. Sustain (anti-"kick"): when widget identity collapses in the signal
//      path (controls aliased across operator groups), most envelope
//      parameters stay at their init values and the note decays to silence
//      almost immediately — a percussive thump instead of a piano tone.
//   2. Pitch stability (anti-"pitch bend"): when parameter enumeration order
//      drifts from the C++ compiler, patch values land in the Pitch EG and
//      every note glides upward at a constant rate.
//
// Skips when faust_wasm_ffi.wasm isn't built (see faust-rs-transpile.spec.js
// header for build instructions).

const WASM_PATH = path.join(__dirname, '..', 'faust', 'faust_wasm_ffi.wasm');

// E.Piano-flavored patch on the transpiled dx7_alg5 channel: NRPN numbers are
// the generated channel's sequential parameter indices (identical to the
// libfaust-era numbering — that equivalence is itself part of the regression
// surface). Carrier ops get full sustain levels; modulator op gets a
// moderate level; Pitch EG stays at center (no values written near it must
// drift pitch).
const SONG_SOURCE = `
setBPM(60);

function nrpn(beat, param, value) {
    return [
      beat, controlchange(99, (param >> 7) & 127),
      beat, controlchange(98, param & 127),
      beat, controlchange(6, value),
    ];
}

createTrack(0).play([
    // Global: algorithm feedback moderate
    nrpn(0, 0, 109),
    // Op1 (carrier): envelope levels high, slow-ish release
    nrpn(0, 18, 91), nrpn(0, 19, 4),   nrpn(0, 20, 0),
    nrpn(0, 21, 127), nrpn(0, 22, 96), nrpn(0, 23, 0),   nrpn(0, 24, 0),
    nrpn(0, 25, 123), nrpn(0, 26, 32), nrpn(0, 27, 32),  nrpn(0, 28, 86),
    nrpn(0, 29, 127),
    // Op2 (modulator): FM depth
    nrpn(0, 38, 91), nrpn(0, 39, 57),  nrpn(0, 40, 0),
    nrpn(0, 41, 127), nrpn(0, 42, 96), nrpn(0, 43, 0),   nrpn(0, 44, 0),
    nrpn(0, 45, 122), nrpn(0, 46, 64), nrpn(0, 47, 45),  nrpn(0, 48, 100),
    nrpn(0, 49, 105),
]);

await createTrack(0).steps(4, [c4,,,,]);

loopHere();
`;

async function setEditorContent(page, editorSelector, content) {
    await page.evaluate(({ selector, text }) => {
        const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
        shadowRoot.querySelector(`${selector} .CodeMirror`).CodeMirror.setValue(text);
    }, { selector: editorSelector, text: content });
}

async function exportToWavFile(page) {
    await page.evaluate(() => {
        const origCreate = document.createElement.bind(document);
        const modalResponses = ['wav', true, true];
        document.createElement = function (tagName, opts) {
            const el = origCreate(tagName, opts);
            if (tagName === 'common-modal') {
                const response = modalResponses.shift() ?? true;
                setTimeout(() => el.shadowRoot.result(response), 0);
            }
            return el;
        };
    });
    const downloadPromise = page.waitForEvent('download', { timeout: 300000 });
    page.evaluate(() => window.compileSong(true));
    const download = await downloadPromise;
    const filePath = path.join('/tmp', `faust-rs-dx7-${Date.now()}.wav`);
    await download.saveAs(filePath);
    return filePath;
}

async function getWavSamples(page, wavFilePath, seconds) {
    const wavBase64 = fs.readFileSync(wavFilePath).toString('base64');
    return await page.evaluate(async ({ b64, seconds }) => {
        const binary = atob(b64);
        const buf = new ArrayBuffer(binary.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
        const offlineCtx = new OfflineAudioContext(1, 44100 * seconds, 44100);
        const decoded = await offlineCtx.decodeAudioData(buf);
        const ch0 = decoded.getChannelData(0);
        return {
            samples: Array.from(ch0.slice(0, Math.min(ch0.length, 44100 * seconds))),
            sampleRate: decoded.sampleRate,
        };
    }, { b64: wavBase64, seconds });
}

function rms(samples) {
    return Math.sqrt(samples.reduce((acc, v) => acc + v * v, 0) / samples.length);
}

// Autocorrelation pitch estimate over one window.
function estimatePitch(samples, sampleRate) {
    const mean = samples.reduce((a, v) => a + v, 0) / samples.length;
    const x = samples.map(v => v - mean);
    const lagMin = Math.floor(sampleRate / 1500);
    const lagMax = Math.floor(sampleRate / 60);
    let best = -1, bestLag = 0;
    for (let lag = lagMin; lag < Math.min(lagMax, x.length - 1); lag++) {
        let s = 0;
        for (let i = 0; i + lag < x.length; i++) s += x[i] * x[i + lag];
        if (s > best) { best = s; bestLag = lag; }
    }
    return bestLag > 0 ? sampleRate / bestLag : 0;
}

test('faust-rs dx7 renders a sustained, pitch-stable piano note', async ({ page }) => {
    test.skip(!fs.existsSync(WASM_PATH), 'faust_wasm_ffi.wasm not built');
    test.setTimeout(300000);

    await page.goto('/');
    await page.waitForFunction(() => {
        const app = document.querySelector('app-javascriptmusic');
        return app && app.shadowRoot && app.shadowRoot.getElementById('startaudiobutton');
    }, { timeout: 30000 });

    // Transpile dx7_alg5 in-browser through the default (faust-rs) path.
    const transpiled = await page.evaluate(async () => {
        const origDefine = customElements.define.bind(customElements);
        customElements.define = (name, ctor, opts) => {
            try { origDefine(name, ctor, opts); } catch (e) { /* already defined */ }
        };
        const m = await import('/faust/browser-transpile.js');
        const { ts } = await m.transpileDspSource(
            'import("stdfaust.lib");\nprocess = dx.algorithm(5) <: _,_;\n',
            'dx7_alg5.dsp',
            {}
        );
        return ts;
    });

    await setEditorContent(page, '#assemblyscripteditor', transpiled);
    await setEditorContent(page, '#editor', SONG_SOURCE);

    const wavPath = await exportToWavFile(page);
    const { samples, sampleRate } = await getWavSamples(page, wavPath, 2);

    const win = (t0, t1) => samples.slice(Math.floor(t0 * sampleRate), Math.floor(t1 * sampleRate));

    const attack = rms(win(0.0, 0.1));
    const sustain = rms(win(0.4, 0.5));
    console.log(`attack RMS=${attack.toFixed(5)}, sustain RMS=${sustain.toFixed(5)}, ratio=${(sustain / attack).toFixed(3)}`);

    // Audible at all
    expect(attack).toBeGreaterThan(0.005);
    // Anti-kick: a piano note still carries substantial energy at 0.4–0.5s.
    // The widget-collapse regression decayed to near-silence within ~100ms
    // (ratio ≈ 0.01); a healthy E.Piano patch holds well above 25%.
    expect(sustain / attack).toBeGreaterThan(0.25);

    // Anti-pitch-bend: compare pitch early vs late in the note. The Pitch EG
    // regression ramped ~6 semitones/second — at 0.35s apart that's > 200
    // cents. Allow 30 cents for vibrato/estimation noise.
    const pitchEarly = estimatePitch(win(0.10, 0.15), sampleRate);
    const pitchLate = estimatePitch(win(0.45, 0.50), sampleRate);
    const cents = 1200 * Math.log2(pitchLate / pitchEarly);
    console.log(`pitch early=${pitchEarly.toFixed(1)}Hz, late=${pitchLate.toFixed(1)}Hz, drift=${cents.toFixed(1)} cents`);
    expect(pitchEarly).toBeGreaterThan(100);
    expect(Math.abs(cents)).toBeLessThan(30);

    fs.unlinkSync(wavPath);
});
