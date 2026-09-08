import { test, expect } from '@playwright/test';
import { clearOPFS, waitForAppReady } from './near-git-helpers.js';

// Issue #224: every first visit to a `?…&remote=<gitproxy url>` link opened a
// "GitHub token" prompt BEFORE cloning, even for a public repo where no token
// is needed — anyone following a shared link had to work out that "Cancel" was
// the right answer. Cloning needs no credentials until the remote says so:
// clone anonymously, and only a 401 (a private repo) asks for a PAT and retries.
//
// Network-free: every gitproxy request is intercepted, so no real remote is
// involved.

const GITPROXY_URL = (repo) => `http://localhost:8080/gitproxy/github.com/test/${repo}.git`;
const TOKEN = 'CLONETOKEN123';

// Answer every git request with `status`, recording what Authorization went out.
async function routeStatus(page, status, auths) {
    await page.route('**/gitproxy/**', async (route) => {
        auths.push(route.request().headers()['authorization'] ?? null);
        await route.fulfill({ status, contentType: 'text/plain', body: `status ${status}` });
    });
}

test.describe('cloning from a remote= host asks for a token only on 401', () => {
    test('the worker reports httpStatus alongside a failed clone', async ({ page }) => {
        const repo = 'clone401worker';
        await page.goto('http://localhost:8080');
        await routeStatus(page, 401, []);

        const reply = await page.evaluate(async ({ repo, remoteUrl }) => {
            const worker = new Worker(new URL('/wasmgit/wasmgitworker.js', location.origin), { type: 'module' });
            const pending = [];
            let resolveNext = null;
            worker.onmessage = (m) => {
                if (resolveNext) { const r = resolveNext; resolveNext = null; r(m.data); }
                else pending.push(m.data);
            };
            const nextRaw = () => pending.length ? Promise.resolve(pending.shift()) : new Promise(r => (resolveNext = r));
            const next = (ms = 20000) => Promise.race([nextRaw(), new Promise(res => setTimeout(() => res({ __timeout: true }), ms))]);
            try {
                worker.postMessage({ command: 'clone', url: remoteUrl, repoName: `${repo}.git` });
                return await next();
            } finally {
                worker.terminate();
            }
        }, { repo, remoteUrl: GITPROXY_URL(repo) });

        expect(reply.__timeout).toBeUndefined();
        expect(reply.cloneFailed).toBe(true);
        expect(reply.dircontents).toBeNull();
        expect(reply.httpStatus).toBe(401);
    });

    test('a public (or missing) repo never prompts: clone goes out anonymously and the app boots', async ({ page }) => {
        test.setTimeout(180000);
        const repo = 'clone404public';
        const auths = [];
        await routeStatus(page, 404, auths);
        await page.goto(`http://localhost:8080/?gitrepo=${repo}&remote=${encodeURIComponent(GITPROXY_URL(repo))}`);

        // Boot must reach the editor without a token modal ever appearing: a
        // modal blocks init, so the app being ready proves none was opened.
        await waitForAppReady(page);
        await expect(page.locator('common-modal #modal-prompt-input')).toHaveCount(0);
        expect(auths.length).toBeGreaterThan(0);
        expect(auths.every((a) => !a)).toBe(true); // anonymous
        await clearOPFS(page, `${repo}.git`);
    });

    test('a 401 on pull is reported with its status and prompts for a token', async ({ page }) => {
        test.setTimeout(180000);
        const repo = 'pull401private';
        const auths = [];
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        // Boot: the remote 404s, so the app lands on a local repo whose origin
        // is the remote — the state after `remote=` was repointed at a repo that
        // has since been made private.
        await routeStatus(page, 404, auths);
        await page.goto(`http://localhost:8080/?gitrepo=${repo}&remote=${encodeURIComponent(GITPROXY_URL(repo))}`);
        await waitForAppReady(page);
        await page.unroute('**/gitproxy/**');
        auths.length = 0;
        await routeStatus(page, 401, auths);

        const pulled = page.evaluate(async () => {
            const git = await import('/wasmgit/wasmgitclient.js');
            try { await git.pull(); return 'ok'; } catch (e) { return 'error:' + e.httpStatus; }
        });

        const prompt = page.locator('common-modal', { hasText: 'Pull was rejected (401)' });
        await prompt.waitFor({ timeout: 60000 });
        expect(auths.every((a) => !a)).toBe(true); // the failed fetch went out anonymously
        await prompt.locator('#modal-prompt-input').fill(TOKEN);
        await prompt.locator('button', { hasText: 'OK' }).click();

        // The retry carries the token; it 401s again, and pull() rejects with
        // the status rather than hanging.
        expect(await pulled).toBe('error:401');
        expect(auths.filter((a) => a === `Bearer ${TOKEN}`).length).toBeGreaterThan(0);
        await clearOPFS(page, `${repo}.git`);
    });

    test('a 401 on clone prompts for a token and the retry sends it', async ({ page }) => {
        test.setTimeout(180000);
        const repo = 'clone401private';
        const auths = [];
        await routeStatus(page, 401, auths);
        await page.goto(`http://localhost:8080/?gitrepo=${repo}&remote=${encodeURIComponent(GITPROXY_URL(repo))}`);

        const prompt = page.locator('common-modal', { hasText: 'Clone was rejected (401)' });
        await prompt.waitFor({ timeout: 60000 });
        // The first attempt went out with no credentials at all.
        expect(auths.length).toBeGreaterThan(0);
        expect(auths.every((a) => !a)).toBe(true);
        auths.length = 0;

        await prompt.locator('#modal-prompt-input').fill(TOKEN);
        await prompt.locator('button', { hasText: 'OK' }).click();

        // The retry carries the token…
        await expect.poll(() => auths.filter((a) => a === `Bearer ${TOKEN}`).length,
            { timeout: 60000 }).toBeGreaterThan(0);
        // …and since it 401s again, the app falls back to a local repo and boots
        // rather than looping on the prompt.
        await waitForAppReady(page);
        await expect(page.locator('common-modal #modal-prompt-input')).toHaveCount(0);
        await clearOPFS(page, `${repo}.git`);
    });
});
