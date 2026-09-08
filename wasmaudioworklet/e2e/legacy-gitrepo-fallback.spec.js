import { test, expect } from '@playwright/test';
import { clearOPFS, waitForAppReady } from './near-git-helpers.js';

// Issue #224: `?gitrepo=wasmsummit2` (no `remote=`) used to mean a repo on the
// original wasm-git http server. Since NEAR storage it resolves to a NEAR
// contract of that name, which can't exist for a suffix-less name, so the link
// "doesn't load". Such names now clone from the legacy host instead, while the
// local-only names (`workspace`, `*.local`) and NEAR names never touch it.
//
// Network-free: the legacy host is intercepted and answered 404, so the app
// falls through to its local repo either way; what's asserted is WHERE the
// clone was attempted.

const LEGACY = 'https://wasm-git.petersalomonsen.com';

async function routeLegacy(page, requests, status = 404) {
    await page.route(`${LEGACY}/**`, async (route) => {
        requests.push(new URL(route.request().url()).pathname);
        await route.fulfill({ status, contentType: 'text/plain', body: `status ${status}` });
    });
}

test.describe('a suffix-less ?gitrepo= name is looked up on the legacy wasm-git host', () => {
    test('legacyRemoteFor picks exactly the pre-NEAR names', async ({ page }) => {
        await page.goto('http://localhost:8080');
        const got = await page.evaluate(async () => {
            const { legacyRemoteFor } = await import('/wasmgit/wasmgitclient.js');
            return ['wasmsummit2', 'workspace', 'spec-x.local', 'foo.gitfactory.testnet', 'bar.near', 'baz.sandbox', '']
                .map((n) => [n, legacyRemoteFor(n)]);
        });
        expect(Object.fromEntries(got)).toEqual({
            'wasmsummit2': `${LEGACY}/wasmsummit2`,
            'workspace': null,
            'spec-x.local': null,
            'foo.gitfactory.testnet': null,
            'bar.near': null,
            'baz.sandbox': null,
            '': null,
        });
    });

    test('?gitrepo=<legacy name> clones from the legacy host and still boots when it is gone', async ({ page }) => {
        test.setTimeout(180000);
        const repo = 'legacy-fallback-test';
        const requests = [];
        await routeLegacy(page, requests);
        await page.goto(`http://localhost:8080/?gitrepo=${repo}`);
        await waitForAppReady(page);
        expect(requests.some((p) => p.startsWith(`/${repo}/info/refs`))).toBe(true);
        await expect(page.locator('common-modal #modal-prompt-input')).toHaveCount(0);
        await clearOPFS(page, `${repo}.git`);
    });

    test('local-only names never contact the legacy host', async ({ page }) => {
        test.setTimeout(180000);
        const requests = [];
        await routeLegacy(page, requests);
        for (const repo of ['workspace', 'spec-legacy-fallback.local']) {
            await page.goto(`http://localhost:8080/?gitrepo=${repo}`);
            await waitForAppReady(page);
            await clearOPFS(page, `${repo}.git`);
        }
        expect(requests).toEqual([]);
    });
});
