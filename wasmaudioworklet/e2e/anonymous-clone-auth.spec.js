import { test, expect } from '@playwright/test';

// Regression for issue #162: the git worker sent `Authorization: Bearer <token>`
// on EVERY request, with the token defaulting to the sentinel 'ANONYMOUS'. That
// made an unauthenticated clone send `Bearer ANONYMOUS`, which the CORS proxy
// forwards as bogus Basic credentials — GitHub then 401s even a PUBLIC repo
// (anonymous access needs NO Authorization header). The fix only attaches the
// header when a real token is set.
//
// We assert the header CONTRACT directly, network-free: intercept the outgoing
// git request and inspect what the worker actually sent. No real remote needed —
// the interception fulfils a dummy response so the clone fails fast.

const GITPROXY_URL = 'http://localhost:8080/gitproxy/github.com/test/anon-clone-test.git';

// Drive a fresh worker: optionally configure a token, then clone GITPROXY_URL.
// Returns the array of Authorization header values seen on git requests.
async function cloneAndCaptureAuth(page, { token = null } = {}) {
    const auths = [];
    await page.route('**/gitproxy/**', async (route) => {
        auths.push(route.request().headers()['authorization'] ?? null);
        // Not a valid git ref advertisement → wasm-git fails fast and the clone
        // reports failure, so the driver doesn't wait the full timeout.
        await route.fulfill({
            status: 200,
            contentType: 'application/x-git-upload-pack-advertisement',
            body: '0000',
        });
    });

    await page.evaluate(async ({ url, token }) => {
        const worker = new Worker(new URL('/wasmgit/wasmgitworker.js', location.origin), { type: 'module' });
        const pending = [];
        let resolveNext = null;
        worker.onmessage = (m) => {
            if (resolveNext) { const r = resolveNext; resolveNext = null; r(m.data); }
            else pending.push(m.data);
        };
        const nextRaw = () => pending.length ? Promise.resolve(pending.shift()) : new Promise(r => (resolveNext = r));
        const next = (ms = 15000) => Promise.race([nextRaw(), new Promise(res => setTimeout(() => res({ __timeout: true }), ms))]);

        try {
            if (token) {
                worker.postMessage({ accessToken: token, username: 'u', useremail: 'e' });
                await next(8000); // accessTokenConfigured
            }
            worker.postMessage({ command: 'clone', url });
            await next(); // dircontents (null + cloneFailed) — we only need the request to have fired
        } finally {
            worker.terminate();
        }
    }, { url: GITPROXY_URL, token });

    await page.unroute('**/gitproxy/**');
    return auths;
}

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
});

test('unauthenticated clone sends NO Authorization header (public repo works anonymously)', async ({ page }) => {
    const auths = await cloneAndCaptureAuth(page, { token: null });

    expect(auths.length).toBeGreaterThan(0);                 // the git request actually fired
    // The regression: this used to be 'Bearer ANONYMOUS'.
    for (const a of auths) expect(a ?? '').not.toContain('ANONYMOUS');
    expect(auths[0]).toBeFalsy();                            // no Authorization header at all
});

test('an explicit token IS sent as Authorization: Bearer <token>', async ({ page }) => {
    const auths = await cloneAndCaptureAuth(page, { token: 'TESTTOKEN123' });

    expect(auths.length).toBeGreaterThan(0);
    expect(auths[0]).toBe('Bearer TESTTOKEN123');            // real token still authenticates (private repos/push)
});
