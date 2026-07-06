import { test, expect } from '@playwright/test';
import { setupServiceWorker, waitForAppReady, clearOPFS } from './near-git-helpers.js';

// Regression for issue #151: opening `?gitrepo=<name>` for a repo that can't be
// cloned (unregistered/unreachable remote) must fall back to a PERSISTENT local
// OPFS repo, so edits survive reload instead of being lost to in-memory WASMFS.
//
// No NEAR sandbox needed: the service worker only intercepts /near-repo/*, and
// we don't register it here, so a /near-repo/<name> URL simply 404s on the
// static server — a clean stand-in for "remote can't be cloned".

const REPO = 'local-persistence-test.git';
const REPO_URL = `http://localhost:8080/near-repo/${REPO}`;
const FAUST_FILE = 'faust/mysynth.dsp';
const FAUST_CONTENT = 'import("stdfaust.lib");\nprocess = os.osc(440);\n';

// Minimal worker driver mirroring the shared e2e helpers.
async function driveWorker(page, steps) {
    return await page.evaluate(async ({ repoUrl, steps }) => {
        const worker = new Worker(new URL('/wasmgit/wasmgitworker.js', location.origin), { type: 'module' });
        const pending = [];
        let resolveNext;
        worker.onmessage = (msg) => {
            if (resolveNext) { const r = resolveNext; resolveNext = null; r(msg.data); }
            else pending.push(msg.data);
        };
        const nextRaw = () => pending.length ? Promise.resolve(pending.shift()) : new Promise(r => (resolveNext = r));
        const next = (ms = 15000) => Promise.race([nextRaw(), new Promise(res => setTimeout(() => res({ __timeout: true }), ms))]);

        const out = {};
        let id = 1;
        try {
            for (const step of steps) {
                if (step.cmd === 'synclocal') {
                    worker.postMessage({ command: 'synclocal', url: repoUrl });
                    out.synclocal = await next(8000);
                } else if (step.cmd === 'clone') {
                    worker.postMessage({ command: 'clone', url: repoUrl });
                    out.clone = await next();
                } else if (step.cmd === 'initlocal') {
                    worker.postMessage({ command: 'initlocal', url: repoUrl, remoteUrl: step.remoteUrl });
                    out.initlocal = await next();
                } else if (step.cmd === 'write') {
                    worker.postMessage({ command: 'writefileandstage', filename: step.filename, contents: step.contents });
                    out.write = await next();
                } else if (step.cmd === 'readfile') {
                    worker.postMessage({ command: 'readfile', filename: step.filename });
                    out[`read:${step.filename}`] = await next();
                }
            }
        } finally {
            worker.terminate();
        }
        return out;
    }, { repoUrl: REPO_URL, steps });
}

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.evaluate(async (name) => {
        try { (await navigator.storage.getDirectory()).removeEntry(name, { recursive: true }); } catch (e) {}
    }, REPO);
});

test.afterEach(async ({ page }) => {
    await page.evaluate(async (name) => {
        try { (await navigator.storage.getDirectory()).removeEntry(name, { recursive: true }); } catch (e) {}
    }, REPO);
});

test('uncloneable repo falls back to a persistent local OPFS repo that survives reload', async ({ page }) => {
    // ---- First load: synclocal(null) -> clone(fails) -> initlocal -> write ----
    const first = await driveWorker(page, [
        { cmd: 'synclocal' },
        { cmd: 'clone' },
        { cmd: 'initlocal' },
        { cmd: 'write', filename: FAUST_FILE, contents: FAUST_CONTENT },
    ]);

    expect(first.synclocal.dircontents).toBeNull();          // nothing local yet
    expect(first.clone.dircontents).toBeNull();              // clone reports failure honestly
    expect(first.clone.cloneFailed).toBe(true);
    expect(first.initlocal.dircontents).toContain('.git');   // real repo established
    expect(first.write.dircontents).toContain('faust');      // faust write landed in the tree

    // ---- Simulated reload: fresh worker, synclocal must restore from OPFS ----
    const second = await driveWorker(page, [
        { cmd: 'synclocal' },
        { cmd: 'readfile', filename: FAUST_FILE },
    ]);

    expect(second.synclocal.dircontents).not.toBeNull();     // restored, NOT discarded
    expect(second.synclocal.dircontents).toContain('.git');
    const read = second[`read:${FAUST_FILE}`];
    const contents = typeof read.filecontents === 'string'
        ? read.filecontents
        : new TextDecoder().decode(read.filecontents);
    expect(contents).toBe(FAUST_CONTENT);                    // edit survived the reload
});

test('remote param sets origin url in persisted .git/config', async ({ page }) => {
    const CUSTOM_REMOTE = 'http://localhost:9418/mygitserver/song.git';

    await driveWorker(page, [
        { cmd: 'synclocal' },
        { cmd: 'clone' },
        { cmd: 'initlocal', remoteUrl: CUSTOM_REMOTE },
    ]);

    // Fresh worker (reload): the origin url must have persisted in .git/config.
    const after = await driveWorker(page, [
        { cmd: 'synclocal' },
        { cmd: 'readfile', filename: '.git/config' },
    ]);
    const cfg = after['read:.git/config'];
    const text = typeof cfg.filecontents === 'string'
        ? cfg.filecontents
        : new TextDecoder().decode(cfg.filecontents);
    expect(text).toContain(CUSTOM_REMOTE);
});

// Full app-level proof: boot the real app with an unregistered `?gitrepo=` name
// (routes to the local sandbox RPC, get_refs fails → clone fails). Before the
// fix this hung the boot spinner forever; now it must boot, and a saved edit
// must survive a reload. Needs the near-git sandbox (`npm run near-sandbox`).
test('app boots on an unregistered ?gitrepo= and the edit survives reload', async ({ page }) => {
    // A `.sandbox` name the SW routes to the local RPC but which is NOT a
    // registered repo contract, so get_refs errors and the clone fails.
    const UNREGISTERED = 'unregistered-local-sketch.sandbox';
    const OPFS_NAME = `${UNREGISTERED}.git`;
    const url = `http://localhost:8080/?gitrepo=${UNREGISTERED}`;
    const edited = '// authored offline in a local-only repo\nconsole.log("local");\n';

    const setEditor = (p, text) => p.evaluate((t) => {
        document.querySelector('app-javascriptmusic').shadowRoot
            .querySelector('#editor .CodeMirror').CodeMirror.setValue(t);
    }, text);
    const getEditor = (p) => p.evaluate(() => document.querySelector('app-javascriptmusic')
        .shadowRoot.querySelector('#editor .CodeMirror').CodeMirror.getValue());

    await page.goto('http://localhost:8080');
    await setupServiceWorker(page);
    await clearOPFS(page, OPFS_NAME);

    // First load: must NOT hang — boot completes with the local fallback repo.
    await page.goto(url);
    await waitForAppReady(page);

    // Edit + save (writes song.js into the local OPFS repo).
    await setEditor(page, edited);
    await page.locator('#savesongbutton').click();
    await expect(page.locator('progress-spinner')).not.toBeAttached({ timeout: 30000 });
    await expect(page.locator('#syncRemoteButton')).toHaveText('Commit & Sync', { timeout: 15000 });

    // Reload WITHOUT clearing OPFS — synclocal must restore the saved edit.
    await page.goto(url);
    await waitForAppReady(page);
    await page.waitForFunction((expected) => {
        const app = document.querySelector('app-javascriptmusic');
        const editor = app && app.shadowRoot && app.shadowRoot.querySelector('#editor .CodeMirror');
        return editor && editor.CodeMirror && editor.CodeMirror.getValue() === expected;
    }, edited, { timeout: 30000 });

    expect(await getEditor(page)).toBe(edited);

    await clearOPFS(page, OPFS_NAME);
});
