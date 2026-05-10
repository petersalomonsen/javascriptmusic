import { test, expect } from '@playwright/test';
import {
    NEAR_REPO_CONTRACT,
    setupServiceWorker,
    clearOPFS,
    waitForAppReady,
    pushBaseline,
} from './near-git-helpers.js';

// End-to-end coverage for the in-app Faust editor:
//   - "faust" toolbar toggle reveals the editor area with file dropdown
//   - "New file" creates faust/<name>.dsp in the wasm-git repo
//   - Saving the song transpiles the .dsp to a sibling .ts in the repo
//   - The synth-side AS compiler picks up the transpiled .ts so the
//     mix can `import { ... } from '../faust/<name>';` and compile to wasm
//
// Requires the NEAR sandbox (`npm run near-sandbox`) — same prereq as
// near-git.spec.js.

const repoName = NEAR_REPO_CONTRACT + '.git';

// A trivial sawtooth voice-synth that maps freq/gain/gate to MIDI notes.
const FAUST_SOURCE = `import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
process = os.sawtooth(freq) * gain * en.adsr(0.01, 0.1, 0.7, 0.2, gate) <: _, _;
`;

// Mix file referenced from the synth editor. Pulls in the transpiled module
// from the wasm-git repo's faust/ folder via `'../faust/<basename>'`.
// The literal string "midichannels" must appear in the source for the compiler
// worker's heuristic to route through mixes/midi.mix.ts (otherwise it tries
// to compile against the unrelated newyear mix). Putting it in a comment is
// enough — we don't actually use the import; the transpiled module already does.
const SYNTH_MIX_SOURCE = (basename) => `// uses midichannels (route via midi.mix)
import { initializeMidiSynth, postprocess } from '../faust/${basename}';
export { initializeMidiSynth, postprocess };
`;

const SONG_SOURCE = `setBPM(120);

await createTrack(0).steps(4, [
    c4,, e4,, g4,, c5,,
]);

loopHere();
`;

// --- in-page helpers -------------------------------------------------------

const setSynthEditorContent = (page, content) => page.evaluate((text) => {
    document.querySelector('app-javascriptmusic').shadowRoot
        .querySelector('#assemblyscripteditor .CodeMirror').CodeMirror.setValue(text);
}, content);

const setSongEditorContent = (page, content) => page.evaluate((text) => {
    document.querySelector('app-javascriptmusic').shadowRoot
        .querySelector('#editor .CodeMirror').CodeMirror.setValue(text);
}, content);

const setFaustEditorContent = (page, content) => page.evaluate((text) => {
    document.querySelector('app-javascriptmusic').shadowRoot
        .querySelector('#faustcodemirror .CodeMirror').CodeMirror.setValue(text);
}, content);

const getFaustEditorContent = (page) => page.evaluate(() => {
    return document.querySelector('app-javascriptmusic').shadowRoot
        .querySelector('#faustcodemirror .CodeMirror').CodeMirror.getValue();
});

const getFaustSaveStatus = (page) => page.evaluate(() => {
    return document.querySelector('app-javascriptmusic').shadowRoot
        .getElementById('faustsavestatus').textContent;
});

const getDropdownOptions = (page) => page.evaluate(() => {
    const sel = document.querySelector('app-javascriptmusic').shadowRoot
        .getElementById('faustfileselect');
    return Array.from(sel.options).map(o => o.textContent);
});

// --- spec ------------------------------------------------------------------

test.describe('Faust editor — create, transpile, import, compile', () => {
    test.afterEach(async ({ page }) => {
        await clearOPFS(page, repoName);
    });

    test('faust toggle reveals the editor with empty dropdown when no .dsp files exist', async ({ page }) => {
        page.on('console', (m) => console.log('[browser]', m.type(), m.text()));
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, '// empty\n');
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // Toggle on
        const toggle = page.locator('#fausteditortogglecheckbox');
        await toggle.check();

        const editor = page.locator('#fausteditor');
        await expect(editor).toBeVisible();

        // Dropdown placeholder appears (no .dsp files yet)
        // refreshFaustFileList() is fire-and-forget post-init — give it a moment.
        await expect(page.locator('#faustfileselect option')).toHaveText(['(no .dsp files yet)'], { timeout: 15000 });
    });

    test('New file creates faust/<name>.dsp seeded with stdfaust template and opens editor', async ({ page }) => {
        page.on('console', (m) => {
            if (m.type() === 'error' || m.type() === 'warning') console.log('[browser]', m.type(), m.text());
        });
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, '// empty\n');
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        await page.locator('#fausteditortogglecheckbox').check();

        await page.locator('#faustnewfilename').fill('phase3test');
        await page.locator('#faustnewfilebutton').click();

        // Editor visible with the seeded template
        await expect(page.locator('#fausteditor')).toBeVisible();
        await page.waitForFunction(() => {
            const cm = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#faustcodemirror .CodeMirror');
            return cm && cm.CodeMirror.getValue().includes('import("stdfaust.lib")');
        }, { timeout: 10000 });

        // The seeded source contains the stdfaust template
        const inEditor = await getFaustEditorContent(page);
        expect(inEditor).toContain('import("stdfaust.lib")');

        // Dropdown lists the new .dsp (proves listfiles() saw the write)
        const opts = await getDropdownOptions(page);
        expect(opts).toEqual(['phase3test.dsp']);
    });

    test('save song transpiles .dsp → .ts and the AS compiler picks it up', async ({ page }) => {
        // Surface page console output for debugging
        page.on('console', (m) => console.log('[browser]', m.type(), m.text()));
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));

        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, SONG_SOURCE);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // 1. Create a fresh .dsp via the Faust editor
        await page.locator('#fausteditortogglecheckbox').check();
        await page.locator('#faustnewfilename').fill('phase3saw');
        await page.locator('#faustnewfilebutton').click();
        await page.waitForFunction(() => {
            const cm = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#faustcodemirror .CodeMirror');
            return cm && cm.CodeMirror.getValue().length > 0;
        }, { timeout: 10000 });

        // 2. Replace the seeded stub with our known DSP
        await setFaustEditorContent(page, FAUST_SOURCE);

        // 3. Wire the synth editor to import from the not-yet-transpiled module
        await setSynthEditorContent(page, SYNTH_MIX_SOURCE('phase3saw'));
        await setSongEditorContent(page, SONG_SOURCE);

        // 4. Save: this triggers saveFaustIfChanged → write .dsp + .ts → compile
        await page.evaluate(() => { window.WASM_SYNTH_BYTES = null; });
        await page.locator('#savesongbutton').click();

        // 5. Wait for the transpile-then-compile pipeline to finish.
        //    The status surfaces a ready-to-paste import line.
        await page.waitForFunction(() => {
            const status = document.querySelector('app-javascriptmusic').shadowRoot
                .getElementById('faustsavestatus').textContent || '';
            return /import \{ Phase3saw \} from '\.\.\/faust\/phase3saw';/.test(status);
        }, { timeout: 60000 });

        // 6. The AS compiler produced a wasm — proves faust/*.ts was
        //    transpiled, written, picked up by the compiler worker, and
        //    successfully resolved as `import { ... } from '../faust/phase3saw';`.
        await page.waitForFunction(() => window.WASM_SYNTH_BYTES != null,
            { timeout: 60000 });
        const wasmLength = await page.evaluate(() =>
            window.WASM_SYNTH_BYTES ? window.WASM_SYNTH_BYTES.length : 0);
        expect(wasmLength).toBeGreaterThan(1000);

        // 7. Auto-recompile on Faust-only edit: change *only* the .dsp
        //    (synth source unchanged) and save again. The worker now
        //    fingerprints the injected faust sources, so the wasm bytes
        //    must change between the two compiles.
        const firstWasmLen = wasmLength;
        await page.evaluate(() => { window.WASM_SYNTH_BYTES = null; });
        await setFaustEditorContent(page,
            FAUST_SOURCE.replace('os.sawtooth(freq)', 'os.square(freq)'));
        await page.locator('#savesongbutton').click();
        await page.waitForFunction(() => window.WASM_SYNTH_BYTES != null,
            { timeout: 60000 });
        const secondWasmLen = await page.evaluate(() =>
            window.WASM_SYNTH_BYTES ? window.WASM_SYNTH_BYTES.length : 0);
        expect(secondWasmLen).toBeGreaterThan(1000);
        // Different DSP → different generated AS → different wasm size (the
        // sawtooth and square families compile to different code paths).
        expect(secondWasmLen).not.toBe(firstWasmLen);
    });

    test('sub-folder layout: faust/<dir>/<dir>/main.dsp transpile + import works', async ({ page }) => {
        // Mirrors the user's vscode-prepared repo shape: a Faust file
        // nested several directories deep (e.g. faust/mysong/dsp/main.dsp).
        // Verifies that:
        //   * "New file" accepts slash-separated paths
        //   * the worker injects the transpiled .ts under faust/<full-rel-path>.ts
        //     (preserving sub-folders, not flattening to basename)
        //   * the resulting wasm compiles when the synth imports via the
        //     sub-folder path
        page.on('console', (m) => {
            if (m.type() === 'error' || m.type() === 'warning') console.log('[browser]', m.type(), m.text());
        });
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));

        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, SONG_SOURCE);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        await page.locator('#fausteditortogglecheckbox').check();
        await page.locator('#faustnewfilename').fill('mysong/dsp/main');
        await page.locator('#faustnewfilebutton').click();
        await page.waitForFunction(() => {
            const cm = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#faustcodemirror .CodeMirror');
            return cm && cm.CodeMirror.getValue().length > 0;
        }, { timeout: 10000 });
        await setFaustEditorContent(page, FAUST_SOURCE);

        const synthSrc = `// uses midichannels (route via midi.mix)
import { initializeMidiSynth, postprocess } from '../faust/mysong/dsp/main';
export { initializeMidiSynth, postprocess };
`;
        await setSynthEditorContent(page, synthSrc);
        await setSongEditorContent(page, SONG_SOURCE);

        await page.evaluate(() => { window.WASM_SYNTH_BYTES = null; });
        await page.locator('#savesongbutton').click();

        // Status surfaces the exact import line for the sub-folder path.
        await page.waitForFunction(() => {
            const status = document.querySelector('app-javascriptmusic').shadowRoot
                .getElementById('faustsavestatus').textContent || '';
            return /import \{ Main \} from '\.\.\/faust\/mysong\/dsp\/main';/.test(status);
        }, { timeout: 60000 });

        // Wasm produced — proves the worker injected
        // assemblyscriptsynthsources['faust/mysong/dsp/main.ts'] correctly.
        await page.waitForFunction(() => window.WASM_SYNTH_BYTES != null,
            { timeout: 60000 });
        const wasmLen = await page.evaluate(() =>
            window.WASM_SYNTH_BYTES ? window.WASM_SYNTH_BYTES.length : 0);
        expect(wasmLen).toBeGreaterThan(1000);
    });
});
