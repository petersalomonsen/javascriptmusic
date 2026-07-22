import { test, expect } from '@playwright/test';
import { clearOPFS, waitForAppReady, readRepoFile } from './near-git-helpers.js';

// Landing with no content source (no ?gitrepo/?gist, empty localStorage)
// boots a local-only OPFS "workspace" repo seeded with the MIDI-sequencer
// starter — the format the studio agent is tuned for — instead of the old
// storage-less pattern-sequencer default. On localhost this behavior is
// opt-in via ?defaultrepo (production hosts get it automatically), so the
// other suites keep the classic boot. Needs NO NEAR sandbox: the workspace
// repo is purely local.

test('first visit boots a workspace repo with the MIDI starter; work survives reload', async ({ page }) => {
    test.setTimeout(240000);
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));

    await page.goto('http://localhost:8080/?defaultrepo=1');
    // wasmgit-ui appearing proves the workspace repo mode engaged.
    await waitForAppReady(page);

    // MIDI-sequencer starter in both editors (not the legacy pattern format).
    const song = await page.evaluate(() => document.querySelector('app-javascriptmusic')
        .shadowRoot.querySelector('#editor .CodeMirror').CodeMirror.getValue());
    expect(song).toContain('setBPM');
    expect(song).toContain('createTrack');
    expect(song).not.toContain('playPatterns');
    const synth = await page.evaluate(() => document.querySelector('app-javascriptmusic')
        .shadowRoot.querySelector('#assemblyscripteditor .CodeMirror').CodeMirror.getValue());
    expect(synth).toContain('midichannels');
    expect(synth).toContain('initializeMidiSynth');

    // The starter actually compiles to a synth wasm.
    await page.evaluate(() => { window.WASM_SYNTH_BYTES = null; });
    await page.locator('#savesongbutton').click();
    await page.waitForFunction(() => window.WASM_SYNTH_BYTES != null, { timeout: 120000 });
    expect(await page.evaluate(() => window.WASM_SYNTH_BYTES.length)).toBeGreaterThan(1000);

    // Edit + save → persists in the OPFS repo across a reload (localStorage
    // is NOT involved in repo mode — this is real workspace persistence).
    await page.evaluate(() => document.querySelector('app-javascriptmusic')
        .shadowRoot.querySelector('#editor .CodeMirror').CodeMirror
        .setValue('setBPM(95); // my persistent workspace edit\n\nawait createTrack(0).steps(4, [c5,,,,]);\n\nloopHere();\n'));
    await page.locator('#savesongbutton').click();
    // The OPFS write inside compileSong is fire-and-forget — poll the repo
    // file (via a fresh worker, like the near-git specs) until it landed
    // before reloading, or the write could be lost mid-flight on slow CI.
    await expect.poll(async () =>
        (await readRepoFile(page, 'workspace', 'song.js'))
        || (await readRepoFile(page, 'workspace.git', 'song.js'))
        || '',
    { timeout: 60000, intervals: [1000] }).toContain('my persistent workspace edit');

    await page.goto('http://localhost:8080/?defaultrepo=1');
    await waitForAppReady(page);
    // Boot populates the editor asynchronously — wait for content.
    await page.waitForFunction(() => {
        const cm = document.querySelector('app-javascriptmusic')
            .shadowRoot.querySelector('#editor .CodeMirror');
        return cm && cm.CodeMirror.getValue().length > 0;
    }, { timeout: 30000 });
    const reloaded = await page.evaluate(() => document.querySelector('app-javascriptmusic')
        .shadowRoot.querySelector('#editor .CodeMirror').CodeMirror.getValue());
    expect(reloaded).toContain('my persistent workspace edit');

    await clearOPFS(page, 'workspace.git');
    await clearOPFS(page, 'workspace');
});

test('without the opt-in, localhost keeps the classic no-repo boot with the MIDI starter', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    await page.waitForFunction(() => {
        const app = document.querySelector('app-javascriptmusic');
        return app && app.shadowRoot && app.shadowRoot.querySelector('#editor .CodeMirror');
    }, { timeout: 30000 });
    // give the async default-template fetch a moment
    await page.waitForFunction(() => document.querySelector('app-javascriptmusic')
        .shadowRoot.querySelector('#editor .CodeMirror').CodeMirror.getValue().length > 0, { timeout: 15000 });

    const song = await page.evaluate(() => document.querySelector('app-javascriptmusic')
        .shadowRoot.querySelector('#editor .CodeMirror').CodeMirror.getValue());
    expect(song).toContain('setBPM');          // midi starter here too
    expect(song).not.toContain('playPatterns');
    // no repo UI in classic mode
    expect(await page.evaluate(() => !!document.querySelector('app-javascriptmusic')
        .shadowRoot.querySelector('wasmgit-ui'))).toBe(false);
});
