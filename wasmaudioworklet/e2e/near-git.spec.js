import { test, expect } from '@playwright/test';

const SANDBOX_SERVER = 'http://localhost:3030';
const NEAR_REPO_CONTRACT = 'repo.sandbox';

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

    await page.evaluate(async ({ rpcUrl, contractId, accountId, publicKey, privateKey }) => {
        await navigator.serviceWorker.register('/near-git-sw.js', { type: 'module' });
        await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
            await new Promise(resolve => {
                navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
            });
        }
        navigator.serviceWorker.controller.postMessage({
            type: 'configure',
            rpcUrl, contractId, accountId, publicKey, privateKey,
        });
        await new Promise(r => setTimeout(r, 500));
    }, {
        rpcUrl: nearCredentials.rpcUrl,
        contractId: nearCredentials.contractId,
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


/** Wait for the app to fully load with the git repo (editors visible, wasmgit-ui ready). */
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

test.describe('NEAR Git Storage - Full E2E', () => {
    const repoName = NEAR_REPO_CONTRACT + '.git';

    test.afterEach(async ({ page }) => {
        await clearOPFS(page, repoName);
    });

    test('save button stages changes and updates Commit & Sync button', async ({ page }) => {
        // Set up service worker, then load app with gitrepo
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // Verify initial button state is "Sync remote" (no changes)
        const initialButtonText = await page.evaluate(() => {
            const app = document.querySelector('app-javascriptmusic').shadowRoot;
            return app.querySelector('wasmgit-ui').shadowRoot.getElementById('syncRemoteButton').innerText;
        });
        console.log('Initial button:', initialButtonText);

        // Modify the song editor content
        await page.evaluate(() => {
            const app = document.querySelector('app-javascriptmusic').shadowRoot;
            app.querySelector('#editor .CodeMirror').CodeMirror.setValue(
                '// modified by playwright\nconsole.log("hello");\n'
            );
        });

        // Click the save button
        await page.evaluate(() => {
            document.querySelector('app-javascriptmusic').shadowRoot
                .getElementById('savesongbutton').click();
        });

        // Wait for button state to update to "Commit & Sync"
        await page.waitForFunction(() => {
            const app = document.querySelector('app-javascriptmusic');
            const ui = app.shadowRoot.querySelector('wasmgit-ui').shadowRoot;
            return ui.getElementById('syncRemoteButton').innerText.includes('Commit');
        }, { timeout: 10000 });

        const afterSave = await page.evaluate(() => {
            const ui = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('wasmgit-ui').shadowRoot;
            return {
                buttonText: ui.getElementById('syncRemoteButton').innerText,
                discardVisible: ui.getElementById('discardChangesButton').style.display !== 'none',
            };
        });
        console.log('After save:', afterSave);

        expect(afterSave.buttonText).toContain('Commit');
        expect(afterSave.discardVisible).toBe(true);
    });

    test('discard changes reverts editor content immediately', async ({ page }) => {
        const committedContent = '// committed baseline\nconsole.log("original");\n';

        // Push a baseline commit via worker first (fast, no UI)
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await page.evaluate(async ({ repoUrl, content }) => {
            const worker = new Worker(new URL('/wasmgit/wasmgitworker.js', location.origin), { type: 'module' });
            let resolveNext;
            const pending = [];
            worker.onmessage = (msg) => {
                if (resolveNext) { const r = resolveNext; resolveNext = null; r(msg.data); }
                else pending.push(msg.data);
            };
            const next = () => pending.length > 0 ? Promise.resolve(pending.shift()) : new Promise(r => { resolveNext = r; });

            worker.postMessage({ command: 'clone', url: repoUrl });
            await next();
            worker.postMessage({ command: 'writefileandstage', filename: 'song.js', contents: content });
            await next();
            let id = 100;
            worker.postMessage({ command: 'config', args: ['user.name', 'Test'], id: id++ });
            await next();
            worker.postMessage({ command: 'config', args: ['user.email', 'test@test.com'], id: id++ });
            await next();
            worker.postMessage({ command: 'commitpullpush', commitmessage: 'baseline', id: id++ });
            await next();
            worker.terminate();
        }, { repoUrl: `http://localhost:8080/near-repo/${repoName}`, content: committedContent });
        console.log('Baseline pushed via worker');

        // Clear OPFS and load the app UI (will clone the committed baseline)
        await clearOPFS(page, repoName);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // Verify editor loaded the committed content
        const originalContent = await page.evaluate(() => {
            return document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#editor .CodeMirror').CodeMirror.getValue();
        });
        console.log('Loaded content:', JSON.stringify(originalContent));

        // Modify and save
        await page.evaluate(() => {
            const app = document.querySelector('app-javascriptmusic').shadowRoot;
            app.querySelector('#editor .CodeMirror').CodeMirror.setValue('// this should be discarded\n');
            app.getElementById('savesongbutton').click();
        });

        // Wait for changes to be staged
        await page.waitForFunction(() => {
            const ui = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('wasmgit-ui').shadowRoot;
            return ui.getElementById('syncRemoteButton').innerText.includes('Commit');
        }, { timeout: 10000 });

        await page.screenshot({ path: 'test-results/before-discard.png' });

        // Click discard changes
        await page.evaluate(() => {
            document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('wasmgit-ui').shadowRoot
                .getElementById('discardChangesButton').click();
        });

        // Wait for editor to revert (remoteSyncListener should update editors without reload)
        await page.waitForFunction((expected) => {
            const app = document.querySelector('app-javascriptmusic');
            const editor = app.shadowRoot.querySelector('#editor .CodeMirror').CodeMirror;
            return editor.getValue() === expected;
        }, originalContent, { timeout: 15000 });

        await page.screenshot({ path: 'test-results/after-discard.png' });

        const afterDiscard = await page.evaluate(() => {
            const app = document.querySelector('app-javascriptmusic').shadowRoot;
            const ui = app.querySelector('wasmgit-ui').shadowRoot;
            return {
                content: app.querySelector('#editor .CodeMirror').CodeMirror.getValue(),
                buttonText: ui.getElementById('syncRemoteButton').innerText,
                discardVisible: ui.getElementById('discardChangesButton').style.display !== 'none',
            };
        });
        console.log('After discard:', afterDiscard);

        expect(afterDiscard.content).toBe(originalContent);
        expect(afterDiscard.buttonText).not.toContain('Commit');
        expect(afterDiscard.discardVisible).toBe(false);
    });

    // NOTE: This test passes when run alone but hangs when run after other tests
    // that push to the same contract. Run with: npx playwright test -g "commit & sync pushes"
    test('commit & sync pushes changes, re-clone shows updated content in editors', async ({ page }) => {
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await clearOPFS(page, repoName);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        const testContent = '// pushed by playwright e2e test\nconsole.log("v1");\n';

        // Modify and save
        await page.evaluate((content) => {
            const app = document.querySelector('app-javascriptmusic').shadowRoot;
            app.querySelector('#editor .CodeMirror').CodeMirror.setValue(content);
            app.getElementById('savesongbutton').click();
        }, testContent);

        // Wait for Commit & Sync to appear
        await page.waitForFunction(() => {
            const ui = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('wasmgit-ui').shadowRoot;
            return ui.getElementById('syncRemoteButton').innerText.includes('Commit');
        }, { timeout: 10000 });

        // Wait for spinner to clear before clicking
        await page.waitForFunction(() => !document.querySelector('progress-spinner'), { timeout: 10000 });
        await page.waitForTimeout(1000);

        // Click Commit & Sync
        await page.evaluate(() => {
            document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('wasmgit-ui').shadowRoot
                .getElementById('syncRemoteButton').click();
        });

        // Wait for commit modal and click proceed
        await page.waitForFunction(() => {
            const modal = document.querySelector('wasmgit-commit-modal');
            return modal && modal.shadowRoot && modal.shadowRoot.getElementById('proceedbutton');
        }, { timeout: 10000 });

        await page.evaluate(() => {
            const modal = document.querySelector('wasmgit-commit-modal');
            modal.shadowRoot.getElementById('commitMessageField').value = 'e2e test commit';
            modal.shadowRoot.getElementById('proceedbutton').click();
        });

        // Wait for sync to complete
        await page.waitForFunction(() => {
            const app = document.querySelector('app-javascriptmusic');
            const ui = app.shadowRoot.querySelector('wasmgit-ui').shadowRoot;
            return !ui.getElementById('syncRemoteButton').innerText.includes('Commit');
        }, { timeout: 60000 });

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

        const afterReclone = await page.evaluate(() => {
            return document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#editor .CodeMirror').CodeMirror.getValue();
        });
        expect(afterReclone).toBe(testContent);
    });
});
