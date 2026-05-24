import { test, expect } from '@playwright/test';
import {
    NEAR_REPO_CONTRACT,
    setupServiceWorker,
    clearOPFS,
    pushBaseline,
    fetchCredentials,
} from './near-git-helpers.js';

// Regression for: bridge-style writes are intentionally left unstaged
// (so "Discard changes" can roll them back) and rely on commitpullpush
// to stage everything at commit time. The first attempt used
// `git add -A`, which the wasm-git lg2 CLI doesn't recognize ("Unsupported
// option -A" on stderr) — the commit would still happen but with only the
// previously-staged content, so any unstaged file silently fell out of
// the commit. The fix runs two passes: `add .` (new + modified) plus
// `add -u .` (deletions of tracked files). This test cycles a worker
// through write → commit → fresh re-clone and asserts the unstaged files
// actually made it into the upstream HEAD.
//
// Requires the NEAR sandbox (`npm run near-sandbox`), like the other
// near-git specs.

const repoName = NEAR_REPO_CONTRACT + '.git';
const repoUrl = `http://localhost:8080/near-repo/${repoName}`;

// Drive the wasm-git worker as a thin callable for the test — same
// pattern pushBaseline uses, factored out so we can run multiple
// command sequences in one spec without copy-pasting boilerplate.
async function withWorker(page, accessToken, username, fn) {
    return await page.evaluate(async ({ repoUrl, accessToken, username, fnSrc }) => {
        const worker = new Worker(new URL('/wasmgit/wasmgitworker.js', location.origin), { type: 'module' });
        let resolveNext;
        const pending = [];
        worker.onmessage = (msg) => {
            if (resolveNext) { const r = resolveNext; resolveNext = null; r(msg.data); }
            else pending.push(msg.data);
        };
        const next = () => pending.length > 0
            ? Promise.resolve(pending.shift())
            : new Promise(r => { resolveNext = r; });
        try {
            worker.postMessage({ accessToken, username, useremail: username });
            await next();
            // eslint-disable-next-line no-new-func
            const body = new Function('worker', 'next', 'repoUrl', `return (${fnSrc})(worker, next, repoUrl);`);
            return await body(worker, next, repoUrl);
        } finally {
            worker.terminate();
        }
    }, { repoUrl, accessToken, username, fnSrc: fn.toString() });
}

test.describe('Commit & Sync stages unstaged + untracked + deleted edits', () => {
    test.afterEach(async ({ page }) => {
        await clearOPFS(page, repoName);
    });

    test('bridge-style unstaged writes land in the commit', async ({ page }) => {
        const consoleMessages = [];
        page.on('console', (m) => consoleMessages.push(`[${m.type()}] ${m.text()}`));
        page.on('pageerror', (e) => consoleMessages.push(`[pageerror] ${e.message}`));

        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, 'baseline\n');

        const creds = await fetchCredentials();
        const accessToken = JSON.stringify({
            accountId: creds.accountId,
            publicKey: creds.publicKey.replace('ed25519:', ''),
            privateKey: creds.secretKey.replace('ed25519:', ''),
        });

        // Drive the worker: clone, do bridge-style writes (stage:false),
        // also create an untracked file, then commitpullpush.
        const commitReply = await withWorker(page, accessToken, creds.accountId, async (worker, next, repoUrl) => {
            worker.postMessage({ command: 'clone', url: repoUrl });
            await next();
            // Unstaged modification of an existing tracked file
            worker.postMessage({
                command: 'writefileandstage',
                filename: 'song.js',
                contents: 'modified by bridge\n',
                binary: false,
                stage: false,
            });
            await next();
            // Unstaged new file (would be "untracked" until staging)
            worker.postMessage({
                command: 'writefileandstage',
                filename: 'bridge-added.txt',
                contents: 'hello from bridge',
                binary: false,
                stage: false,
            });
            await next();
            worker.postMessage({ command: 'commitpullpush', commitmessage: 'unstaged + untracked', id: 1 });
            return await next();
        });

        expect(commitReply.error, `commitpullpush surfaced an error: ${commitReply.error}`).toBeUndefined();
        // The pre-fix breakage was a stderr-only warning, not a fatal
        // commit failure — assert it doesn't leak through either.
        expect(consoleMessages.join('\n')).not.toContain('Unsupported option -A');

        // Wipe OPFS and re-clone fresh from origin. If the changes really
        // made it into the upstream commit, they'll be in the clone.
        await clearOPFS(page, repoName);
        const cloned = await withWorker(page, accessToken, creds.accountId, async (worker, next, repoUrl) => {
            worker.postMessage({ command: 'clone', url: repoUrl });
            const dir = await next();
            worker.postMessage({ command: 'readfile', filename: 'song.js' });
            const songReply = await next();
            worker.postMessage({ command: 'readfile', filename: 'bridge-added.txt' });
            const bridgeReply = await next();
            return {
                files: dir.dircontents,
                song: songReply.filecontents,
                bridgeAdded: bridgeReply.filecontents,
            };
        });

        expect(cloned.files).toContain('bridge-added.txt');
        expect(cloned.bridgeAdded).toBe('hello from bridge');
        expect(cloned.song).toBe('modified by bridge\n');
    });

    test('host-style deletion (unlinkfile) lands in the commit', async ({ page }) => {
        const consoleMessages = [];
        page.on('console', (m) => consoleMessages.push(`[${m.type()}] ${m.text()}`));

        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, 'baseline\n');

        const creds = await fetchCredentials();
        const accessToken = JSON.stringify({
            accountId: creds.accountId,
            publicKey: creds.publicKey.replace('ed25519:', ''),
            privateKey: creds.secretKey.replace('ed25519:', ''),
        });

        // Stage a sibling file in a separate commit, so we have something
        // tracked we can delete.
        await withWorker(page, accessToken, creds.accountId, async (worker, next, repoUrl) => {
            worker.postMessage({ command: 'clone', url: repoUrl });
            await next();
            worker.postMessage({
                command: 'writefileandstage',
                filename: 'to-be-deleted.txt',
                contents: 'doomed\n',
                binary: false,
            });
            await next();
            worker.postMessage({ command: 'commitpullpush', commitmessage: 'seed file for deletion test', id: 1 });
            return await next();
        });

        // Now: bridge-style unlink (working-tree-only, index untouched) +
        // commit. The `add -u .` pass in commitpullpush is what records
        // the deletion; before the fix it was unreachable because lg2
        // rejected `-A`.
        await clearOPFS(page, repoName);
        const commitReply = await withWorker(page, accessToken, creds.accountId, async (worker, next, repoUrl) => {
            worker.postMessage({ command: 'clone', url: repoUrl });
            await next();
            worker.postMessage({ command: 'unlinkfile', filename: 'to-be-deleted.txt' });
            await next();
            worker.postMessage({ command: 'commitpullpush', commitmessage: 'remove file via bridge', id: 1 });
            return await next();
        });

        expect(commitReply.error).toBeUndefined();
        expect(consoleMessages.join('\n')).not.toContain('Unsupported option -A');

        // Verify the deletion really made it upstream.
        await clearOPFS(page, repoName);
        const cloned = await withWorker(page, accessToken, creds.accountId, async (worker, next, repoUrl) => {
            worker.postMessage({ command: 'clone', url: repoUrl });
            const dir = await next();
            return { files: dir.dircontents };
        });

        expect(cloned.files).not.toContain('to-be-deleted.txt');
    });
});
