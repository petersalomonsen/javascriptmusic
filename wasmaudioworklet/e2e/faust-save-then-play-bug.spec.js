import { test, expect } from '@playwright/test';
import {
    NEAR_REPO_CONTRACT,
    setupServiceWorker,
    clearOPFS,
    waitForAppReady,
    pushBaseline,
    readRepoFile,
} from './near-git-helpers.js';
import { fetchCredentials } from './near-git-helpers.js';

const repoName = NEAR_REPO_CONTRACT + '.git';

const SIMPLESYNTH_DSP = `import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
process = os.sawtooth(freq) * gain * en.adsr(0.01, 0.1, 0.7, 0.2, gate);
`;

const SYNTH_MIX_SOURCE = `// uses midichannels (route via midi.mix)
import { initializeMidiSynth, postprocess } from '../faust/simplesynth';
export { initializeMidiSynth, postprocess };
`;

const SONG_SOURCE = `setBPM(120);

await createTrack(0).steps(4, [
    c4,, e4,,
]);

loopHere();
`;

// Helper to set up repo with song.js, synth.ts, and faust/simplesynth.dsp but NO faust/simplesynth.ts
async function setupInitialRepo(page) {
    await pushBaseline(page, repoName, SONG_SOURCE);
    
    const creds = await fetchCredentials();
    const accessToken = JSON.stringify({
        accountId: creds.accountId,
        publicKey: creds.publicKey.replace('ed25519:', ''),
        privateKey: creds.secretKey.replace('ed25519:', ''),
    });

    await page.evaluate(async ({ repoUrl, accessToken, username, synthMixSource, simplesynthDsp }) => {
        const worker = new Worker(new URL('/wasmgit/wasmgitworker.js', location.origin), { type: 'module' });
        let resolveNext;
        const pending = [];
        worker.onmessage = (msg) => {
            if (resolveNext) { const r = resolveNext; resolveNext = null; r(msg.data); }
            else pending.push(msg.data);
        };
        const next = () => pending.length > 0 ? Promise.resolve(pending.shift()) : new Promise(r => { resolveNext = r; });

        worker.postMessage({ accessToken, username, useremail: username });
        await next();
        worker.postMessage({ command: 'clone', url: repoUrl });
        await next();

        let id = 100;
        worker.postMessage({ command: 'init', args: ['.'], id: id++ });
        await next();
        worker.postMessage({ command: 'remote', args: ['add', 'origin', repoUrl], id: id++ });
        await next();

        // Write synth.ts
        worker.postMessage({ command: 'writefileandstage', filename: 'synth.ts', contents: synthMixSource });
        await next();
        
        // Create faust directory and write simplesynth.dsp
        worker.postMessage({ command: 'mkdir', args: ['faust'], id: id++ });
        await next();
        worker.postMessage({ command: 'writefileandstage', filename: 'faust/simplesynth.dsp', contents: simplesynthDsp });
        await next();

        worker.postMessage({ command: 'config', args: ['user.name', 'Test'], id: id++ });
        await next();
        worker.postMessage({ command: 'config', args: ['user.email', 'test@test.com'], id: id++ });
        await next();
        worker.postMessage({ command: 'commitpullpush', commitmessage: 'initial: dsp without ts', id: id++ });
        await next();
        worker.terminate();
    }, {
        repoUrl: `http://localhost:8080/near-repo/${repoName}`,
        accessToken,
        username: creds.accountId,
        synthMixSource: SYNTH_MIX_SOURCE,
        simplesynthDsp: SIMPLESYNTH_DSP,
    });
}

test.describe('Faust: save DSP then play bug - playing flag fix', () => {
    test.beforeEach(async ({ page }) => {
        await clearOPFS(page, repoName);
    });
    test.afterEach(async ({ page }) => {
        await clearOPFS(page, repoName);
    });

    test('After Faust DSP is saved, play works without page reload', async ({ page }) => {
        page.on('console', (m) => { if (m.type() === 'error') console.log('[browser]', m.text()); });
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));

        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await setupInitialRepo(page);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // Step 1: Click play (start button) - should fail because faust/simplesynth.ts doesn't exist yet
        await page.locator('#startaudiobutton').click();
        await page.waitForTimeout(5000); // Wait for compilation to complete (and fail)
        
        // Verify compilation failed (WASM_SYNTH_BYTES should be null/undefined)
        const wasmBefore = await page.evaluate(() => window.WASM_SYNTH_BYTES);
        expect(wasmBefore).toBeFalsy();

        // Step 2: Open Faust editor
        await page.locator('#fausteditortogglecheckbox').check();
        
        // Wait for Faust file list to populate
        await page.waitForFunction(() => {
            const sel = document.querySelector('app-javascriptmusic').shadowRoot
                .getElementById('faustfileselect');
            return sel && Array.from(sel.options).some(opt => opt.value === 'faust/simplesynth.dsp');
        }, { timeout: 10000 });

        // Select simplesynth.dsp
        await page.evaluate(() => {
            const root = document.querySelector('app-javascriptmusic').shadowRoot;
            const sel = root.getElementById('faustfileselect');
            sel.value = 'faust/simplesynth.dsp';
            sel.dispatchEvent(new Event('change'));
        });
        
        // Wait for file to load
        await page.waitForFunction(() => {
            const cm = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#faustcodemirror .CodeMirror');
            return cm && cm.CodeMirror.getValue().includes('hslider');
        }, { timeout: 10000 });

        // Make a small change to trigger transpilation
        await page.evaluate(() => {
            const cm = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#faustcodemirror .CodeMirror');
            const current = cm.CodeMirror.getValue();
            cm.CodeMirror.setValue(current + '\n// test');
        });

        // Save the Faust file - this creates faust/simplesynth.ts
        await page.evaluate(async () => {
            await window.__saveFaustIfChanged();
        });
        
        // Verify the .ts file was created by checking the save status
        const saveStatus = await page.evaluate(() => {
            return document.querySelector('app-javascriptmusic').shadowRoot
                .getElementById('faustsavestatus').textContent;
        });
        // The save status shows the basename without the faust/ prefix
        expect(saveStatus).toContain('Saved simplesynth.dsp');
        expect(saveStatus).toContain("import { Simplesynth } from '../faust/simplesynth'");
        
        // Wait a moment for the file to be committed
        await page.waitForTimeout(2000);
        
        // Verify the .ts file exists in the repo
        const tsExists = await readRepoFile(page, repoName, 'faust/simplesynth.ts');
        expect(tsExists).toBeTruthy();

        // Step 3: Click play again - this SHOULD work without page reload
        // The fix: reset window.WASM_SYNTH_BYTES to ensure fresh compilation
        await page.evaluate(() => { window.WASM_SYNTH_BYTES = null; });
        await page.locator('#startaudiobutton').click();
        
        // Wait for compilation to complete
        await page.waitForTimeout(15000);
        
        // Check if WASM_SYNTH_BYTES was set (compilation succeeded)
        const wasmAfter = await page.evaluate(() => window.WASM_SYNTH_BYTES);
        
        // With the fix (try-catch resetting playing flag), this should succeed
        expect(wasmAfter).toBeTruthy();
        const wasmBytes = await page.evaluate(() => window.WASM_SYNTH_BYTES ? window.WASM_SYNTH_BYTES.byteLength : 0);
        expect(wasmBytes).toBeGreaterThan(1000);
    });
});
