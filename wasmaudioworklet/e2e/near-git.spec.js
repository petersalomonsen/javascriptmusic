import { test, expect } from '@playwright/test';

const SANDBOX_SERVER = 'http://localhost:3030';
const NEAR_REPO_CONTRACT = 'repo.factory.sandbox';

let nearCredentials;

async function fetchCredentials() {
    if (nearCredentials) return;
    const res = await fetch(`${SANDBOX_SERVER}/near-credentials`);
    nearCredentials = await res.json();
    nearCredentials.rpcUrl = `${SANDBOX_SERVER}/near-rpc`;
    console.log('NEAR credentials:', nearCredentials.accountId, nearCredentials.contractId);
}

async function setupServiceWorker(page) {
    await fetchCredentials();
    const publicKey = nearCredentials.publicKey.replace('ed25519:', '');
    const privateKey = nearCredentials.secretKey.replace('ed25519:', '');

    await page.evaluate(async ({ contractId, accountId, publicKey, privateKey }) => {
        // Seed localStorage so initNear() picks up credentials when the app loads.
        // The stateless service worker reads credentials from each request's
        // Authorization header (set by the wasmgit Web Worker), which the app
        // populates from nearAuthData / localStorage.
        localStorage.setItem(`near-git-key:${contractId}`, JSON.stringify({
            accountId, publicKey, privateKey,
        }));

        await navigator.serviceWorker.register('/near-git-sw.js', { type: 'module' });
        await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
            await new Promise(resolve => {
                navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
            });
        }
    }, {
        contractId: NEAR_REPO_CONTRACT,
        accountId: nearCredentials.accountId,
        publicKey, privateKey,
    });
}

async function clearOPFS(page, repoName) {
    await page.evaluate(async (name) => {
        try {
            const root = await navigator.storage.getDirectory();
            await root.removeEntry(name, { recursive: true });
        } catch (e) { }
    }, repoName);
}

async function waitForAppReady(page) {
    await page.waitForFunction(() => {
        const app = document.querySelector('app-javascriptmusic');
        if (!app || !app.shadowRoot) return false;
        const songEditor = app.shadowRoot.querySelector('#editor .CodeMirror');
        const synthEditor = app.shadowRoot.querySelector('#assemblyscripteditor .CodeMirror');
        const wasmgitUi = app.shadowRoot.querySelector('wasmgit-ui');
        if (!songEditor || !synthEditor || !wasmgitUi || !wasmgitUi.shadowRoot) return false;
        return !!wasmgitUi.shadowRoot.getElementById('syncRemoteButton');
    }, { timeout: 60000 });
}

function setEditorContent(page, content) {
    return page.evaluate((text) => {
        document.querySelector('app-javascriptmusic').shadowRoot
            .querySelector('#editor .CodeMirror').CodeMirror.setValue(text);
    }, content);
}

function getEditorContent(page) {
    return page.evaluate(() => {
        return document.querySelector('app-javascriptmusic').shadowRoot
            .querySelector('#editor .CodeMirror').CodeMirror.getValue();
    });
}

/** Push a baseline commit via worker (fast, no UI). */
async function pushBaseline(page, repoName, content) {
    const publicKey = nearCredentials.publicKey.replace('ed25519:', '');
    const privateKey = nearCredentials.secretKey.replace('ed25519:', '');
    const accessToken = JSON.stringify({
        accountId: nearCredentials.accountId,
        publicKey, privateKey,
    });

    await page.evaluate(async ({ repoUrl, content, accessToken, username }) => {
        const worker = new Worker(new URL('/wasmgit/wasmgitworker.js', location.origin), { type: 'module' });
        let resolveNext;
        const pending = [];
        worker.onmessage = (msg) => {
            if (resolveNext) { const r = resolveNext; resolveNext = null; r(msg.data); }
            else pending.push(msg.data);
        };
        const next = () => pending.length > 0 ? Promise.resolve(pending.shift()) : new Promise(r => { resolveNext = r; });

        // Stateless service worker requires Authorization: Bearer <JSON>
        // on git-receive-pack — give the worker the access token first.
        worker.postMessage({ accessToken, username, useremail: username });
        await next();

        worker.postMessage({ command: 'clone', url: repoUrl });
        await next();

        // Cloning an empty contract leaves no .git — mirror what the app does
        // in initWASMGitClient and run init + remote add so the cwd is a valid repo.
        let id = 100;
        worker.postMessage({ command: 'init', args: ['.'], id: id++ });
        await next();
        worker.postMessage({ command: 'remote', args: ['add', 'origin', repoUrl], id: id++ });
        await next();

        worker.postMessage({ command: 'writefileandstage', filename: 'song.js', contents: content });
        await next();
        worker.postMessage({ command: 'config', args: ['user.name', 'Test'], id: id++ });
        await next();
        worker.postMessage({ command: 'config', args: ['user.email', 'test@test.com'], id: id++ });
        await next();
        worker.postMessage({ command: 'commitpullpush', commitmessage: 'baseline', id: id++ });
        const pushReply = await next();
        worker.terminate();
        if (pushReply && pushReply.error) {
            throw new Error('pushBaseline failed: ' + pushReply.error);
        }
    }, {
        repoUrl: `http://localhost:8080/near-repo/${repoName}`,
        content,
        accessToken,
        username: nearCredentials.accountId,
    });
}

test.describe('NEAR Git Storage - Full E2E', () => {
    const repoName = NEAR_REPO_CONTRACT + '.git';

    const saveButton = page => page.locator('#savesongbutton');
    const syncButton = page => page.locator('#syncRemoteButton');
    const discardButton = page => page.locator('#discardChangesButton');
    const spinner = page => page.locator('progress-spinner');
    const commitMessage = page => page.locator('#commitMessageField');
    const proceedButton = page => page.locator('#proceedbutton');

    test.afterEach(async ({ page }) => {
        await clearOPFS(page, repoName);
    });

    test('save button stages changes and updates Commit & Sync button', async ({ page }) => {
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // Modify the song editor content
        await setEditorContent(page, '// modified by playwright\nconsole.log("hello");\n');

        // Click the save button
        await saveButton(page).click();

        // Wait for Commit & Sync to appear
        await expect(syncButton(page)).toHaveText('Commit & Sync', { timeout: 10000 });
        await expect(discardButton(page)).toBeVisible();
    });

    test('discard changes reverts editor content immediately', async ({ page }) => {
        const committedContent = '// committed baseline\nconsole.log("original");\n';

        // Push a baseline via worker
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, committedContent);
        console.log('Baseline pushed via worker');

        // Clear OPFS and load the app UI
        await clearOPFS(page, repoName);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // Wait for editor to load the committed content
        await page.waitForFunction((expected) => {
            const app = document.querySelector('app-javascriptmusic');
            if (!app || !app.shadowRoot) return false;
            const editor = app.shadowRoot.querySelector('#editor .CodeMirror');
            if (!editor || !editor.CodeMirror) return false;
            return editor.CodeMirror.getValue() === expected;
        }, committedContent, { timeout: 15000 });
        console.log('Loaded content:', JSON.stringify(committedContent));

        // Modify and save
        await setEditorContent(page, '// this should be discarded\n');
        await saveButton(page).click();

        // Wait for changes to be staged
        await expect(syncButton(page)).toHaveText('Commit & Sync', { timeout: 10000 });

        // Click discard
        await discardButton(page).click();

        // Wait for editor to revert
        await page.waitForFunction((expected) => {
            const app = document.querySelector('app-javascriptmusic');
            const editor = app.shadowRoot.querySelector('#editor .CodeMirror');
            return editor && editor.CodeMirror && editor.CodeMirror.getValue() === expected;
        }, committedContent, { timeout: 15000 });

        const afterContent = await getEditorContent(page);
        expect(afterContent).toBe(committedContent);
        await expect(syncButton(page)).not.toHaveText('Commit & Sync');
        await expect(discardButton(page)).not.toBeVisible();
    });

    test('commit & sync pushes changes, re-clone shows updated content in editors', async ({ page }) => {
        const initialContent = '// initial for commit test\n';
        const testContent = '// pushed by playwright e2e test\nconsole.log("v1");\n';

        // Ensure the contract has a baseline commit
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, initialContent);
        console.log('Commit test: baseline pushed');

        await clearOPFS(page, repoName);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // Modify and save
        await setEditorContent(page, testContent);
        await saveButton(page).click();

        // Wait for spinner from compileSong to clear, then for button to update
        await expect(spinner(page)).not.toBeAttached({ timeout: 30000 });
        await expect(syncButton(page)).toHaveText('Commit & Sync', { timeout: 15000 });

        // Click Commit & Sync
        await syncButton(page).click();

        // Wait for commit modal, fill message, click proceed
        await expect(proceedButton(page)).toBeVisible({ timeout: 10000 });
        await commitMessage(page).fill('e2e test commit');
        await proceedButton(page).click();

        // Wait for spinner to appear then disappear (sync in progress → complete)
        await expect(spinner(page)).toBeAttached({ timeout: 5000 });
        await expect(spinner(page)).not.toBeAttached({ timeout: 60000 });

        // Verify sync completed — button should no longer say "Commit & Sync"
        await expect(syncButton(page)).not.toHaveText('Commit & Sync', { timeout: 5000 });

        // Clear OPFS and reload — should clone from contract and show pushed content
        await clearOPFS(page, repoName);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // Wait for editor to have the pushed content
        await page.waitForFunction((expected) => {
            const app = document.querySelector('app-javascriptmusic');
            const editor = app.shadowRoot.querySelector('#editor .CodeMirror');
            return editor && editor.CodeMirror && editor.CodeMirror.getValue() === expected;
        }, testContent, { timeout: 30000 });

        const afterReclone = await getEditorContent(page);
        expect(afterReclone).toBe(testContent);
    });
});
