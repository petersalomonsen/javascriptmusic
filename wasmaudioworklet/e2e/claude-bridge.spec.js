// End-to-end test for the claude-editor-bridge: confirms that file edits
// propagate both directions between the host filesystem (`tools/claude-bridge/
// work/`) and the in-browser editor backed by wasm-git's OPFS.
//
// Requires:
//   - NEAR sandbox running on :3030 (`npm run near-sandbox`) — same as the
//     existing near-git tests.
//   - Port 17890 free. The test kills any process bound there before booting
//     its own relay.

import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFile, writeFile, rm, stat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    NEAR_REPO_CONTRACT,
    setupServiceWorker,
    clearOPFS,
    waitForAppReady,
    pushBaseline,
} from './near-git-helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRIDGE_DIR = resolve(__dirname, '../../tools/claude-bridge');
const RELAY_PATH = join(BRIDGE_DIR, 'relay.js');
const WORK_DIR = join(BRIDGE_DIR, 'work');

let relay = null;

async function killExistingRelay() {
    await new Promise((resolveP) => {
        const p = spawn('sh', ['-c', 'lsof -ti :17890 | xargs kill 2>/dev/null; true']);
        p.on('exit', () => resolveP());
    });
    // Give the OS a moment to release the port.
    await new Promise((r) => setTimeout(r, 200));
}

async function startRelay() {
    relay = spawn('node', [RELAY_PATH], { stdio: ['ignore', 'pipe', 'pipe'], cwd: BRIDGE_DIR });
    let ready = false;
    return await new Promise((resolveP, rejectP) => {
        const timeout = setTimeout(() => {
            if (!ready) rejectP(new Error('relay did not become ready in 5s'));
        }, 5000);
        relay.stderr.on('data', (chunk) => {
            const s = chunk.toString();
            process.stdout.write('[relay] ' + s);
            if (!ready && s.includes('WS on ws://')) {
                ready = true;
                clearTimeout(timeout);
                resolveP();
            }
        });
        relay.on('exit', (code) => {
            if (!ready) rejectP(new Error(`relay exited early with code ${code}`));
        });
    });
}

async function stopRelay() {
    if (!relay) return;
    relay.kill('SIGTERM');
    await new Promise((r) => relay.on('exit', r));
    relay = null;
}

async function waitForFileContent(path, expected, timeout = 10000) {
    const deadline = Date.now() + timeout;
    let lastSeen = '<no file>';
    while (Date.now() < deadline) {
        try {
            const content = await readFile(path, 'utf8');
            lastSeen = content;
            if (content === expected) return;
        } catch (_e) { /* not present yet */ }
        await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(
        `waitForFileContent timeout for ${path}\n` +
        `expected: ${JSON.stringify(expected).slice(0, 120)}\n` +
        `last seen: ${JSON.stringify(lastSeen).slice(0, 120)}`,
    );
}

function getEditorContent(page) {
    return page.evaluate(() => {
        return document.querySelector('app-javascriptmusic').shadowRoot
            .querySelector('#editor .CodeMirror').CodeMirror.getValue();
    });
}

function setEditorContent(page, content) {
    return page.evaluate((text) => {
        const cm = document.querySelector('app-javascriptmusic').shadowRoot
            .querySelector('#editor .CodeMirror').CodeMirror;
        cm.setValue(text);
    }, content);
}

test.describe('claude-editor-bridge OPFS tree sync', () => {
    const repoName = NEAR_REPO_CONTRACT + '.git';
    const songPath = join(WORK_DIR, 'song.js');

    test.beforeAll(async () => {
        await killExistingRelay();
        await rm(WORK_DIR, { recursive: true, force: true });
        await startRelay();
    });

    test.afterAll(async () => {
        await stopRelay();
        await rm(WORK_DIR, { recursive: true, force: true });
    });

    test.afterEach(async ({ page }) => {
        await clearOPFS(page, repoName);
    });

    test('host edit on work/song.js propagates to the browser editor', async ({ page }) => {
        const baseline = '// bridge test baseline\nlet x = 1;\n';

        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, baseline);

        await clearOPFS(page, repoName);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // Editor loads the baseline …
        await expect.poll(() => getEditorContent(page), { timeout: 15000 })
            .toBe(baseline);

        // … and the bridge mirrors it to work/song.js (= tree_dump finished).
        await waitForFileContent(songPath, baseline, 15000);

        // Host writes new content directly to the mirror.
        const fromHost = '// written by the test from the host fs\nlet y = 42;\n';
        await writeFile(songPath, fromHost);

        // Bridge should deliver apply_file → browser editor.
        await expect.poll(() => getEditorContent(page), { timeout: 10000 })
            .toBe(fromHost);
    });

    test('browser edit in #editor propagates to work/song.js', async ({ page }) => {
        const baseline = '// bridge test baseline\nlet x = 1;\n';

        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, baseline);

        await clearOPFS(page, repoName);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        await expect.poll(() => getEditorContent(page), { timeout: 15000 })
            .toBe(baseline);
        await waitForFileContent(songPath, baseline, 15000);

        // Edit in the browser → file_changed → mirror file updates.
        const fromBrowser = '// written from the browser editor\nlet z = 99;\n';
        await setEditorContent(page, fromBrowser);

        await waitForFileContent(songPath, fromBrowser, 10000);
    });
});
