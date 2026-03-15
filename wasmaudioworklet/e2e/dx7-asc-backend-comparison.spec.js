import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal E.Piano song: sets OP2 Level=82 (key FM modulation param) and plays a note.
// Uses steps() + loopHere() so the event list has a proper duration for export.
const SONG_SOURCE = `
setBPM(60);
addInstrument('DX7 E.Piano');

function nrpn(beat, param, value) {
    return [
      beat, controlchange(99, (param >> 7) & 127),
      beat, controlchange(98, param & 127),
      beat, controlchange(6, value),
    ];
}

// Set NRPN patch parameters at beat 0
createTrack(0).play([
    // Global
    nrpn(0, 0, 109),
    // Op1 (Carrier)
    nrpn(0, 18, 91), nrpn(0, 19, 4),   nrpn(0, 20, 0),
    nrpn(0, 21, 127), nrpn(0, 22, 96), nrpn(0, 23, 0),   nrpn(0, 24, 0),
    nrpn(0, 25, 123), nrpn(0, 26, 32), nrpn(0, 27, 32),  nrpn(0, 28, 86),
    nrpn(0, 29, 127),
    // Op2 (Modulator at 14:1 ratio — 14x coarse frequency)
    nrpn(0, 38, 91), nrpn(0, 39, 57),  nrpn(0, 40, 0),
    nrpn(0, 41, 127), nrpn(0, 42, 96), nrpn(0, 43, 0),   nrpn(0, 44, 0),
    nrpn(0, 45, 122), nrpn(0, 46, 64), nrpn(0, 47, 45),  nrpn(0, 48, 100),
    nrpn(0, 49, 105),  // Op2 Level=82 — FM modulation depth (KEY PARAM)
]);

// Play a note (steps gives proper note-on/note-off timing)
await createTrack(0).steps(4, [c4,,,,]);

loopHere();
`;

async function setEditorContent(page, editorSelector, content) {
    await page.evaluate(({ selector, text }) => {
        const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
        const editorEl = shadowRoot.querySelector(`${selector} .CodeMirror`);
        editorEl.CodeMirror.setValue(text);
    }, { selector: editorSelector, text: content });
}

/**
 * Export to WAV using Playwright's download interception.
 * Intercepts modals to auto-respond: first modal (export type) → 'wav', subsequent → true.
 * Returns path to the downloaded WAV file.
 */
async function exportToWavFile(page) {
    // Set up modal auto-response before triggering export
    await page.evaluate(() => {
        const origCreate = document.createElement.bind(document);
        const modalResponses = ['wav', true, true]; // export type, then clipping (if any)
        document.createElement = function (tagName, opts) {
            const el = origCreate(tagName, opts);
            if (tagName === 'common-modal') {
                const response = modalResponses.shift() ?? true;
                setTimeout(() => el.shadowRoot.result(response), 0);
            }
            return el;
        };
    });

    // Start waiting for download before triggering export
    const downloadPromise = page.waitForEvent('download', { timeout: 300000 });

    // Trigger export (same as clicking the export button)
    page.evaluate(() => window.compileSong(true)); // fire and forget

    const download = await downloadPromise;
    const filePath = path.join('/tmp', `dx7-export-${Date.now()}.wav`);
    await download.saveAs(filePath);
    return filePath;
}

/**
 * Read WAV file and return audio samples (first 2 seconds of left channel).
 */
async function getWavSamples(page, wavFilePath) {
    const wavData = fs.readFileSync(wavFilePath);
    const wavBase64 = wavData.toString('base64');
    const samples = await page.evaluate(async (b64) => {
        const binary = atob(b64);
        const buf = new ArrayBuffer(binary.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);

        const offlineCtx = new OfflineAudioContext(1, 44100 * 2, 44100);
        const decoded = await offlineCtx.decodeAudioData(buf);
        const ch0 = decoded.getChannelData(0);
        return {
            samples: Array.from(ch0.slice(0, Math.min(ch0.length, 44100 * 2))),
            totalSamples: ch0.length,
            duration: decoded.duration,
            sampleRate: decoded.sampleRate
        };
    }, wavBase64);
    return samples;
}

function computeRms(samples) {
    const sum = samples.reduce((acc, v) => acc + v * v, 0);
    return Math.sqrt(sum / samples.length);
}

test.describe('DX7 ASC backend vs C backend audio comparison', () => {
    let cBackendSource;
    let ascBackendSource;

    test.beforeAll(() => {
        const cBackendPath = path.join(__dirname, '..', '..', 'examples', 'dx7', 'dx7-synth.ts');
        const ascBackendPath = path.join(__dirname, '..', '..', 'examples', 'dx7', 'dx7-synth-asc-backend.ts');

        if (!fs.existsSync(cBackendPath)) {
            throw new Error(`C backend not found: ${cBackendPath}`);
        }
        if (!fs.existsSync(ascBackendPath)) {
            throw new Error(`ASC backend not found: ${ascBackendPath}\nRun: node tools/faust2as/faust2asc.js`);
        }

        cBackendSource = fs.readFileSync(cBackendPath, 'utf-8');
        ascBackendSource = fs.readFileSync(ascBackendPath, 'utf-8');
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => {
            const app = document.querySelector('app-javascriptmusic');
            return app && app.shadowRoot && app.shadowRoot.getElementById('startaudiobutton');
        }, { timeout: 30000 });
    });

    test('C backend should produce audio output', async ({ page }) => {
        await setEditorContent(page, '#editor', SONG_SOURCE);
        await setEditorContent(page, '#assemblyscripteditor', cBackendSource);

        const wavPath = await exportToWavFile(page);
        console.log(`C backend WAV saved to: ${wavPath}`);

        const result = await getWavSamples(page, wavPath);
        const rms = computeRms(result.samples);
        console.log(`C backend: duration=${result.duration}s, RMS=${rms.toFixed(6)}`);

        // Log first few non-zero sample values
        const firstNonZero = result.samples.findIndex(v => Math.abs(v) > 0.001);
        if (firstNonZero >= 0) {
            console.log(`First non-zero sample: index=${firstNonZero}, value=${result.samples[firstNonZero].toFixed(6)}`);
            const checkPoints = [firstNonZero, firstNonZero + 100, firstNonZero + 1000, firstNonZero + 10000];
            for (const i of checkPoints) {
                if (i < result.samples.length) {
                    console.log(`  sample[${i}]=${result.samples[i].toFixed(6)}`);
                }
            }
        } else {
            console.log('WARNING: No non-zero samples found!');
        }

        expect(result.duration).toBeGreaterThan(0);
        expect(rms).toBeGreaterThan(0.01); // C backend should produce loud FM audio
    });

    test('ASC backend should produce audio output', async ({ page }) => {
        await setEditorContent(page, '#editor', SONG_SOURCE);
        await setEditorContent(page, '#assemblyscripteditor', ascBackendSource);

        const wavPath = await exportToWavFile(page);
        console.log(`ASC backend WAV saved to: ${wavPath}`);

        const result = await getWavSamples(page, wavPath);
        const rms = computeRms(result.samples);
        console.log(`ASC backend: duration=${result.duration}s, RMS=${rms.toFixed(6)}`);

        const firstNonZero = result.samples.findIndex(v => Math.abs(v) > 0.001);
        if (firstNonZero >= 0) {
            console.log(`First non-zero sample: index=${firstNonZero}, value=${result.samples[firstNonZero].toFixed(6)}`);
            const checkPoints = [firstNonZero, firstNonZero + 100, firstNonZero + 1000, firstNonZero + 10000];
            for (const i of checkPoints) {
                if (i < result.samples.length) {
                    console.log(`  sample[${i}]=${result.samples[i].toFixed(6)}`);
                }
            }
        } else {
            console.log('WARNING: No non-zero samples found!');
        }

        expect(result.duration).toBeGreaterThan(0);
        expect(rms).toBeGreaterThan(0.01); // ASC backend should also produce loud FM audio
    });

    test('ASC and C backend should produce similar audio', async ({ page }) => {
        // Render C backend
        await setEditorContent(page, '#editor', SONG_SOURCE);
        await setEditorContent(page, '#assemblyscripteditor', cBackendSource);
        const cWavPath = await exportToWavFile(page);
        const cResult = await getWavSamples(page, cWavPath);
        const cRms = computeRms(cResult.samples);
        console.log(`C backend: duration=${cResult.duration}s, RMS=${cRms.toFixed(6)}`);

        // Reload page for clean state
        await page.goto('/');
        await page.waitForFunction(() => {
            const app = document.querySelector('app-javascriptmusic');
            return app && app.shadowRoot && app.shadowRoot.getElementById('startaudiobutton');
        }, { timeout: 30000 });

        // Render ASC backend
        await setEditorContent(page, '#editor', SONG_SOURCE);
        await setEditorContent(page, '#assemblyscripteditor', ascBackendSource);
        const ascWavPath = await exportToWavFile(page);
        const ascResult = await getWavSamples(page, ascWavPath);
        const ascRms = computeRms(ascResult.samples);
        console.log(`ASC backend: duration=${ascResult.duration}s, RMS=${ascRms.toFixed(6)}`);

        // Compare
        const len = Math.min(cResult.samples.length, ascResult.samples.length, 44100); // first second
        let maxDiff = 0;
        let sumDiff = 0;
        for (let i = 0; i < len; i++) {
            const d = Math.abs(cResult.samples[i] - ascResult.samples[i]);
            maxDiff = Math.max(maxDiff, d);
            sumDiff += d;
        }
        const meanDiff = sumDiff / len;
        const rmsDiff = Math.abs(cRms - ascRms) / Math.max(cRms, 0.0001);

        console.log(`Comparison (first 1s): maxDiff=${maxDiff.toFixed(6)}, meanDiff=${meanDiff.toFixed(6)}, RMS diff=${(rmsDiff * 100).toFixed(2)}%`);

        // Log sample values at key points for inspection
        const checkPoints = [0, 100, 1000, 5000, 10000, 22050, 44099];
        console.log('Sample comparison:');
        for (const i of checkPoints) {
            if (i < cResult.samples.length && i < ascResult.samples.length) {
                const d = Math.abs(cResult.samples[i] - ascResult.samples[i]);
                console.log(`  [${i}]: C=${cResult.samples[i].toFixed(6)}, ASC=${ascResult.samples[i].toFixed(6)}, diff=${d.toFixed(6)}`);
            }
        }

        expect(cRms).toBeGreaterThan(0.001);
        expect(ascRms).toBeGreaterThan(0.001);
        expect(rmsDiff).toBeLessThan(0.1); // RMS within 10%
        expect(maxDiff).toBeLessThan(0.1); // No sample differs by more than 0.1
    });
});
