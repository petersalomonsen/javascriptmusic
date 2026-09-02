import { test, expect } from '@playwright/test';
import { clearOPFS, waitForAppReady } from './near-git-helpers.js';

// Pushing to a `?…&remote=<gitproxy url>` host needs a bring-your-own PAT, and
// the only place that token was ever asked for was the CLONE at boot. Anyone
// with an existing local repo — commits already made, remote just repointed at
// a newly created GitHub repo — never got asked, so "Commit & Sync" pushed
// anonymously and died on a 401 with nothing but an error modal. The fix:
// the worker reports the HTTP status as its own field, and the client turns a
// 401 into a token prompt + one retry of the push.
//
// Network-free: every gitproxy request is intercepted and answered 401, so no
// real remote (and no NEAR sandbox) is involved.

const REPO = 'push401test';
const GITPROXY_URL = 'http://localhost:8080/gitproxy/github.com/test/push-401-test.git';
const RETRY_TOKEN = 'RETRYTOKEN123';

// Answer every git request with 401, recording what Authorization went out.
async function route401(page, auths) {
    await page.route('**/gitproxy/**', async (route) => {
        auths.push(route.request().headers()['authorization'] ?? null);
        await route.fulfill({ status: 401, contentType: 'text/plain', body: 'Unauthorized' });
    });
}

test.describe('push rejected with 401 asks for a token and retries', () => {
    test.afterEach(async ({ page }) => {
        await clearOPFS(page, `${REPO}.git`);
    });

    test('the worker reports httpStatus 401 alongside the error', async ({ page }) => {
        await page.goto('http://localhost:8080');
        await route401(page, []);

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
                // A local repo whose origin is the (unauthorized) remote — the
                // state you're in after repointing `remote=` at a new repo.
                worker.postMessage({
                    command: 'initlocal',
                    url: `${location.origin}/near-repo/${repo}.git`,
                    repoName: `${repo}.git`,
                    remoteUrl,
                });
                await next(); // dircontents
                worker.postMessage({ command: 'commitpullpush', commitmessage: 'push me', id: 1 });
                return await next();
            } finally {
                worker.terminate();
            }
        }, { repo: REPO, remoteUrl: GITPROXY_URL });

        expect(reply.__timeout).toBeUndefined();
        expect(reply.error).toBeTruthy();
        // The regression this guards: the status was ONLY appended to the error
        // string, so the client had to parse prose to recognise a 401.
        expect(reply.httpStatus).toBe(401);
    });

    test('a 401 on Commit & Sync prompts for a token and the retry sends it', async ({ page }) => {
        test.setTimeout(180000);
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));

        const auths = [];
        await route401(page, auths);
        await page.goto(`http://localhost:8080/?gitrepo=${REPO}&remote=${encodeURIComponent(GITPROXY_URL)}`);

        // Boot asks for a token before cloning; cancel it, which is exactly how
        // a repo ends up local-with-no-token in the first place.
        const bootPrompt = page.locator('common-modal #modal-prompt-input');
        await bootPrompt.waitFor({ timeout: 60000 });
        await page.locator('common-modal button', { hasText: 'Cancel' }).click();

        // Clone 401s, so the app falls back to a local OPFS repo and boots.
        await waitForAppReady(page);
        auths.length = 0;

        await page.evaluate(() => document.querySelector('app-javascriptmusic')
            .shadowRoot.querySelector('wasmgit-ui').shadowRoot
            .getElementById('syncRemoteButton').click());

        // The push 401s -> the token prompt, distinguishable from the boot one.
        const retryPrompt = page.locator('common-modal', { hasText: 'Push was rejected (401)' });
        await retryPrompt.waitFor({ timeout: 60000 });
        expect(auths.every((a) => !a)).toBe(true); // the failed push went out anonymously

        await retryPrompt.locator('#modal-prompt-input').fill(RETRY_TOKEN);
        await retryPrompt.locator('button', { hasText: 'OK' }).click();

        // The retry re-runs fetch/push — this time carrying the token.
        await expect.poll(() => auths.filter((a) => a === `Bearer ${RETRY_TOKEN}`).length,
            { timeout: 60000 }).toBeGreaterThan(0);
    });
});
