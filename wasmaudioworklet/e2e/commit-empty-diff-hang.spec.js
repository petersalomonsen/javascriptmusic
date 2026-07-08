import { test, expect } from '@playwright/test';

// Regression for issue #160: the client's diff() (and log()) resolved their
// worker-reply promise only on a *truthy* value — `msg.data.diff ? resolve : true`.
// When the only pending changes are new/untracked files, `git diff HEAD` is empty,
// so the worker posts { diff: '' }. The empty string is falsy, so the listener
// stayed registered forever and diff() never resolved — the commit modal's
// readyPromise hung and the Commit & Sync spinner spun indefinitely.
//
// This drives the app's already-initialised wasmgit client and feeds it the exact
// empty reply the worker sends. The real diff()/log() must RESOLVE (to '') rather
// than hang. (The fix: resolve on the reply key being present, not truthy.)

const GITREPO = 'diff-empty-hang-test';
const REMOTE = 'http://localhost:8080/no-such-remote-diff-hang-test.git'; // 404 → clone fails → local repo
const APP_URL = `http://localhost:8080/?gitrepo=${GITREPO}&remote=${encodeURIComponent(REMOTE)}`;
const OPFS_DIRS = [`${GITREPO}.git`, 'no-such-remote-diff-hang-test.git'];

async function clearOPFS(page) {
    await page.evaluate(async (names) => {
        const root = await navigator.storage.getDirectory();
        for (const n of names) { try { await root.removeEntry(n, { recursive: true }); } catch (e) {} }
    }, OPFS_DIRS);
}

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await clearOPFS(page);
    // Pre-seed a token so boot doesn't open the "GitHub token" prompt.
    await page.evaluate(() => sessionStorage.setItem('git-http-token',
        JSON.stringify({ token: 'x', username: 'tester', useremail: 'tester@example.com' })));
});

test.afterEach(async ({ page }) => {
    await clearOPFS(page);
});

test('diff() and log() resolve on an empty worker reply instead of hanging', async ({ page }) => {
    await page.goto(APP_URL);

    // Wait until the app has booted the git client (editor live ⇒ initWASMGitClient
    // has run and `worker` is set).
    await page.waitForFunction(() => {
        const app = document.querySelector('app-javascriptmusic');
        const ed = app && app.shadowRoot && app.shadowRoot.querySelector('#editor .CodeMirror');
        return !!(ed && ed.CodeMirror);
    }, { timeout: 60000 });

    const outcome = await page.evaluate(async () => {
        const git = await import('/wasmgit/wasmgitclient.js'); // same module instance the app uses
        const HUNG = '__HUNG__';
        const race = (p, ms = 5000) => Promise.race([p, new Promise((r) => setTimeout(() => r(HUNG), ms))]);

        // diff(): register the listener, then deliver the worker's empty reply.
        const dp = git.diff();
        git.worker.onmessage({ data: { diff: '' } });
        const diffResult = await race(dp);

        // log(): same empty-string trap.
        const lp = git.log();
        git.worker.onmessage({ data: { log: '' } });
        const logResult = await race(lp);

        return { diffResult, logResult };
    });

    expect(outcome.diffResult).toBe('');   // pre-fix: never resolves → '__HUNG__'
    expect(outcome.logResult).toBe('');
});
