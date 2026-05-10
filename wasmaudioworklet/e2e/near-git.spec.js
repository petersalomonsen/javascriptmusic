import { test, expect } from '@playwright/test';
import {
    NEAR_REPO_CONTRACT,
    setupServiceWorker,
    clearOPFS,
    waitForAppReady,
    pushBaseline,
} from './near-git-helpers.js';

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

        // Wait for the app to finish loading the baseline into the editor —
        // waitForAppReady only checks the wasmgit-ui's button is in the DOM, but
        // editorcontroller.js continues async to readfile(song.js) and then
        // songsourceeditor.doc.setValue(...). On slow CI that setValue can race
        // with the test's setEditorContent below: the app's later write
        // overwrites the test's content, save rewrites the unchanged baseline,
        // diff is empty, and the button stays "Sync remote".
        await page.waitForFunction((expected) => {
            const app = document.querySelector('app-javascriptmusic');
            const editor = app && app.shadowRoot && app.shadowRoot.querySelector('#editor .CodeMirror');
            return editor && editor.CodeMirror && editor.CodeMirror.getValue() === expected;
        }, initialContent, { timeout: 15000 });

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
