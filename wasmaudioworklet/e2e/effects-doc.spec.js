import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    NEAR_REPO_CONTRACT,
    setupServiceWorker,
    clearOPFS,
    waitForAppReady,
    fetchCredentials,
} from './near-git-helpers.js';

// Documentation-as-regression-test for docs/effects.md "Pattern B" (master
// effect in postprocess()). The doc is the SINGLE SOURCE OF TRUTH: this test
// extracts the postprocess() wiring and the echo field-settings straight out of
// the markdown, transpiles a Tapiir effect in the browser, renders a note to
// WAV through the app's export pipeline, and asserts the doc's two claims:
//
//   1. With the field settings, an audible echo tail appears.
//   2. With the defaults, the tail is essentially gone (dry passthrough only).
//
// If the wiring or the Tapiir field names in the doc drift from what the
// transpiler actually produces, the assembled synth.ts fails to compile or the
// echo never appears, and this test fails — keeping the doc honest.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoName = NEAR_REPO_CONTRACT + '.git';
const DOC_PATH = path.join(__dirname, '..', 'docs', 'effects.md');

// --- Extract Pattern B code blocks from the documentation -------------------
function extractTsBlocks(md) {
    return [...md.matchAll(/```ts\n([\s\S]*?)```/g)].map((m) => m[1]);
}
const DOC = fs.readFileSync(DOC_PATH, 'utf8');
const TS_BLOCKS = extractTsBlocks(DOC);
const POSTPROCESS_BLOCK = TS_BLOCKS.find(
    (b) => b.includes('export function postprocess') && b.includes('tapiir.process'));
const FIELD_BLOCK = TS_BLOCKS.find((b) => b.includes('tapiir.delaySec'));

if (!POSTPROCESS_BLOCK || !FIELD_BLOCK) {
    throw new Error('docs/effects.md: could not extract the Pattern B `ts` code blocks '
        + '(postprocess wiring and/or tapiir field settings). Did the doc structure change?');
}

// Assemble a synth.ts mix file from the doc blocks. `withEcho` toggles the
// field-settings block — that toggle IS the doc's claim under test.
//
// The doc's Pattern B snippet is just the postprocess() wiring; it assumes the
// rest of synth.ts is a normal midi mix. So we drop the snippet into a realistic
// mix that wires the voice onto channel 0 (exactly like the demo's synth.ts).
// The literal "midichannels" is also how the compiler detects a midi synth
// (browsercompilerwebworker.js) and places this at mixes/midi.mix.ts.
function assembleSynthTs(withEcho) {
    const lines = POSTPROCESS_BLOCK.split('\n');
    const docImports = lines.filter((l) => l.trim().startsWith('import '));
    const docBody = lines.filter((l) => !l.trim().startsWith('import ')).join('\n').trim();
    // Drop the echo field settings right after the tapiir instance is created.
    const body = docBody.replace(/const tapiir = new Tapiir\(\);/,
        (m) => (withEcho ? `${m}\n${FIELD_BLOCK.trim()}` : m));
    return [
        // The emitted comment below must contain "midichannels": that literal
        // is how the compiler detects a midi synth (browsercompilerwebworker.js)
        // and places this file at mixes/midi.mix.ts — same trick as
        // faust-save-then-play. The voice transpiles its own initializeMidiSynth
        // (wires itself onto channel 0); we re-export it and add the doc's
        // master-effect postprocess on top.
        `// midi mix: route voices via midichannels, then apply the master effect`,
        `import { initializeMidiSynth } from '../faust/simplesynth';`,
        `import { outputline } from '../mixes/globalimports';`,
        ...docImports, // import { Tapiir } from '../faust/tapiir';  (from the doc)
        `export { initializeMidiSynth };`,
        '',
        body, // const tapiir = ...; (echo fields); export function postprocess()
        '',
    ].join('\n');
}

// --- Fixtures ---------------------------------------------------------------
// A minimal subtractive voice — short release so the dry note is silent well
// before the echo-tail measurement window.
const VOICE_DSP = `import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gain = hslider("gain", 0.5, 0, 1, 0.01);
gate = button("gate");
env = en.adsr(0.01, 0.1, 0.7, 0.15, gate);
process = os.sawtooth(freq) * gain * env;
`;

// Upstream Tapiir (Grame, BSD) — the file the doc tells you to copy into faust/.
const TAPIIR_DSP = `declare name 		"tapiir";
declare version 	"1.0";
declare author 		"Grame";
declare license 	"BSD";
declare copyright 	"(c)GRAME 2006";

import("stdfaust.lib");

dsize = 524288;

tap(n) = vslider("tap %n", 0,0,1,0.1);
in(n) = vslider("input %n", 1,0,1,0.1);
gain = vslider("gain", 1,0,1,0.1);
del = vslider("delay (sec)", 0, 0, 5, 0.01) * ma.SR;

mixer(taps,lines) = par(i,taps,*(tap(i))), par(i,lines,*(in(i))) :> *(gain);

matrix(taps,lines) = (si.bus(lines+taps)
                        <: tgroup("",
                        par(i, taps, hgroup("Tap %i", mixer(taps,lines) : de.delay(dsize,del))))
                    ) ~ si.bus(taps);

tapiir(taps,lines) = vgroup("Tapiir",
                            si.bus(lines)
                            <: (matrix(taps,lines), si.bus(lines))
                            <: vgroup("outputs", par(i, lines, hgroup("output %i", mixer(taps,lines))))
                            );

process = tapiir(6,2);
`;

// Play c4 near t=0, then idle to ~2s so the WAV render (length = last event
// time) is long enough to capture the echo repeats.
const SONG_SOURCE = `setBPM(120);
await createTrack(0).steps(4, [c4,,,,]);
await waitForBeat(4);
loopHere();
`;

// --- Helpers (mirrors faust-rs-dx7-audio.spec.js audio harness) -------------
async function transpile(page, src, filename) {
    return await page.evaluate(async ({ src, filename }) => {
        const origDefine = customElements.define.bind(customElements);
        customElements.define = (name, ctor, opts) => {
            try { origDefine(name, ctor, opts); } catch (e) { /* already defined */ }
        };
        const m = await import('/faust/browser-transpile.js');
        const { ts } = await m.transpileDspSource(src, filename, {});
        return ts;
    }, { src, filename });
}

async function setupRepo(page, files) {
    const creds = await fetchCredentials();
    const accessToken = JSON.stringify({
        accountId: creds.accountId,
        publicKey: creds.publicKey.replace('ed25519:', ''),
        privateKey: creds.secretKey.replace('ed25519:', ''),
    });
    const repoUrl = `http://localhost:8080/near-repo/${repoName}`;
    await page.evaluate(async ({ repoUrl, accessToken, username, files }) => {
        const worker = new Worker(new URL('/wasmgit/wasmgitworker.js', location.origin), { type: 'module' });
        let resolveNext;
        const pending = [];
        worker.onmessage = (msg) => {
            if (resolveNext) { const r = resolveNext; resolveNext = null; r(msg.data); }
            else pending.push(msg.data);
        };
        const next = () => pending.length > 0 ? Promise.resolve(pending.shift()) : new Promise((r) => { resolveNext = r; });

        worker.postMessage({ accessToken, username, useremail: username });
        await next();
        worker.postMessage({ command: 'clone', url: repoUrl });
        await next();
        let id = 100;
        worker.postMessage({ command: 'init', args: ['.'], id: id++ });
        await next();
        worker.postMessage({ command: 'remote', args: ['add', 'origin', repoUrl], id: id++ });
        await next();
        for (const [filename, contents] of Object.entries(files)) {
            worker.postMessage({ command: 'writefileandstage', filename, contents });
            await next();
        }
        worker.postMessage({ command: 'config', args: ['user.name', 'Test'], id: id++ });
        await next();
        worker.postMessage({ command: 'config', args: ['user.email', 'test@test.com'], id: id++ });
        await next();
        worker.postMessage({ command: 'commitpullpush', commitmessage: 'effects-doc test fixture', id: id++ });
        await next();
        worker.terminate();
    }, { repoUrl, accessToken, username: creds.accountId, files });
}

async function setEditorContent(page, editorSelector, content) {
    await page.evaluate(({ selector, text }) => {
        const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
        shadowRoot.querySelector(`${selector} .CodeMirror`).CodeMirror.setValue(text);
    }, { selector: editorSelector, text: content });
}

async function exportToWavFile(page) {
    // Auto-answer the export-type modal with "wav", and any follow-up modal
    // (e.g. a clipping warning) with true. Restore document.createElement
    // afterwards so repeated exports don't stack wrappers.
    await page.evaluate(() => {
        const origCreate = document.createElement.bind(document);
        window.__origCreateElement = origCreate;
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
    try {
        const downloadPromise = page.waitForEvent('download', { timeout: 240000 });
        page.evaluate(() => window.compileSong(true));
        const download = await downloadPromise;
        const filePath = path.join('/tmp', `effects-doc-${repoName}-${process.hrtime.bigint()}.wav`);
        await download.saveAs(filePath);
        return filePath;
    } finally {
        await page.evaluate(() => {
            if (window.__origCreateElement) document.createElement = window.__origCreateElement;
        });
    }
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

test.describe('docs/effects.md — Pattern B (Tapiir master effect)', () => {
    test.afterEach(async ({ page }) => {
        await clearOPFS(page, repoName);
    });

    test('echo wiring from the doc produces an audible echo tail; defaults do not', async ({ page }) => {
        // Two full asc compiles (optimizeLevel 3) + two offline renders.
        test.setTimeout(600000);
        page.on('console', (m) => { if (m.type() === 'error') console.log('[browser]', m.text()); });
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));

        // 1. Load the app shell and transpile the voice + Tapiir effect in-browser.
        await page.goto('http://localhost:8080');
        await clearOPFS(page, repoName);
        await setupServiceWorker(page);
        await page.waitForFunction(() => {
            const app = document.querySelector('app-javascriptmusic');
            return app && app.shadowRoot && app.shadowRoot.getElementById('startaudiobutton');
        }, { timeout: 30000 });

        const voiceTs = await transpile(page, VOICE_DSP, 'simplesynth.dsp');
        const tapiirTs = await transpile(page, TAPIIR_DSP, 'tapiir.dsp');

        // 2. Push a project: song, both transpiled faust .ts, and the echo
        //    synth.ts assembled from the doc blocks.
        await setupRepo(page, {
            'song.js': SONG_SOURCE,
            'synth.ts': assembleSynthTs(true),
            'faust/simplesynth.ts': voiceTs,
            'faust/tapiir.ts': tapiirTs,
        });

        // 3. Open the project.
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        async function render(synthTs) {
            await setEditorContent(page, '#assemblyscripteditor', synthTs);
            await setEditorContent(page, '#editor', SONG_SOURCE);
            const wavPath = await exportToWavFile(page);
            const { samples, sampleRate } = await getWavSamples(page, wavPath, 2);
            fs.unlinkSync(wavPath);
            const win = (t0, t1) => samples.slice(Math.floor(t0 * sampleRate), Math.floor(t1 * sampleRate));
            // note window: the dry note; tail window: well after the voice's
            // release, so any energy there can only be the echo.
            return { note: rms(win(0.0, 0.3)), tail: rms(win(0.7, 1.9)) };
        }

        const echo = await render(assembleSynthTs(true));
        const dry = await render(assembleSynthTs(false));
        console.log(`echo: note=${echo.note.toFixed(5)} tail=${echo.tail.toFixed(5)} | `
            + `dry: note=${dry.note.toFixed(5)} tail=${dry.tail.toFixed(5)}`);

        // The voice is audible in both renders (sanity: dry passthrough works).
        expect(echo.note).toBeGreaterThan(0.005);
        expect(dry.note).toBeGreaterThan(0.005);
        // Doc claim 1: the field settings produce an audible echo tail.
        expect(echo.tail).toBeGreaterThan(0.003);
        // Doc claim 2: with defaults the tail is essentially gone.
        expect(echo.tail).toBeGreaterThan(dry.tail * 5);
    });
});
