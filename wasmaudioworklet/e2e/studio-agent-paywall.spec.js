import { test, expect } from '@playwright/test';

// The day pass, from the app's side.
//
// The agent runs on OUR NEAR AI credits, so the proxy answers 402 until a pass
// is presented. The app never pays — paying needs a wallet, and this document
// sets COOP (for SharedArrayBuffer), which severs window.opener and breaks
// wallet popups. So the app's job is only: attach the pass, and turn a 402 into
// an offer rather than an error.
//
// The proxy is mocked here so no money moves and no wallet is needed; the real
// payment path has its own unit tests plus a verified mainnet settlement.

const chatInput = (page) => page.locator('#studioagentinput');
const chatLog = (page) => page.locator('#studioagentlog');

async function bootApp(page) {
    await page.goto('/');
    await page.waitForFunction(() => typeof window.toggleStudioAgent === 'function', { timeout: 30000 });
    await page.evaluate(() => window.toggleStudioAgent(true));
}

const sendChat = async (page, text) => {
    await chatInput(page).fill(text);
    await chatInput(page).press('Enter');
};

/** A pass shaped like the real one. Only the app reads it; the proxy is mocked. */
const makePass = (expSecondsFromNow) => {
    const b64url = (o) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${b64url({ alg: 'HS256', typ: 'JWT' })}.`
        + `${b64url({ sub: 'psalomo.near', exp: Math.floor(Date.now() / 1000) + expSecondsFromNow, v: 1 })}.sig`;
};

/**
 * Mock the paywalled proxy: 402 unless the request carries a pass.
 * Returns the recorded requests so a test can assert what was sent.
 */
async function mockPaidProxy(page, { reply = 'Done.' } = {}) {
    const seen = [];
    await page.route('**/nearai/v1/chat/completions', async (route) => {
        const pass = route.request().headers()['x-studio-pass'];
        seen.push({ pass: pass || null });
        // Reject an EXPIRED pass exactly as the real server does — otherwise
        // the expiry test would pass without testing anything.
        let live = false;
        if (pass) {
            try {
                const claims = JSON.parse(Buffer.from(pass.split('.')[1], 'base64url').toString());
                live = claims.exp * 1000 > Date.now();
            } catch { live = false; }
        }
        if (!live) {
            await route.fulfill({
                status: 402,
                headers: { 'PAYMENT-REQUIRED': btoa(JSON.stringify({ x402Version: 2, accepts: [] })) },
                json: { x402Version: 2, accepts: [] },
            });
            return;
        }
        await route.fulfill({ json: { choices: [{ message: { role: 'assistant', content: reply } }], usage: { total_tokens: 12 } } });
    });
    return seen;
}

test('an unpaid turn offers a day pass instead of failing', async ({ page }) => {
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    const seen = await mockPaidProxy(page);
    await bootApp(page);
    await page.evaluate(() => { localStorage.removeItem('studio-pass'); localStorage.setItem('nearai-enabled', '1'); });

    await sendChat(page, '/nearai on');
    await sendChat(page, 'make a kick drum');

    // The offer, with a button — not a red error line.
    const offer = chatLog(page).locator('text=needs a session pass');
    await expect(offer).toBeVisible({ timeout: 15000 });
    await expect(chatLog(page).getByRole('button', { name: /session pass/i })).toBeVisible();
    await expect(chatLog(page).locator('.sa-msg-error')).toHaveCount(0);

    expect(seen.length).toBeGreaterThan(0);
    expect(seen[0].pass).toBeNull();
});

test('a stored pass is attached, and the turn just runs', async ({ page }) => {
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    const seen = await mockPaidProxy(page, { reply: 'Kick drum added.' });
    await bootApp(page);
    await page.evaluate((pass) => {
        localStorage.setItem('studio-pass', pass);
        localStorage.setItem('nearai-enabled', '1');
    }, makePass(3600));

    await sendChat(page, '/nearai on');
    await sendChat(page, 'make a kick drum');

    await expect(chatLog(page).locator('text=Kick drum added.')).toBeVisible({ timeout: 15000 });
    await expect(chatLog(page).locator('text=needs a session pass')).toHaveCount(0);
    expect(seen[0].pass).toBeTruthy();
});

test('an expired pass is treated as no pass, and re-offered', async ({ page }) => {
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    await mockPaidProxy(page);
    await bootApp(page);
    // The app attaches it anyway — the SERVER is the authority on expiry — and
    // the 402 that comes back has to surface as an offer, not an error.
    await page.evaluate((pass) => {
        localStorage.setItem('studio-pass', pass);
        localStorage.setItem('nearai-enabled', '1');
    }, makePass(-60));

    await sendChat(page, '/nearai on');
    await sendChat(page, 'make a kick drum');

    await expect(chatLog(page).locator('text=needs a session pass')).toBeVisible({ timeout: 15000 });
    await expect(chatLog(page).locator('.sa-msg-error')).toHaveCount(0);
});

test('buying a pass resumes the message that was typed', async ({ page }) => {
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    const seen = await mockPaidProxy(page, { reply: 'Resumed and answered.' });
    await bootApp(page);
    await page.evaluate(() => { localStorage.removeItem('studio-pass'); localStorage.setItem('nearai-enabled', '1'); });

    // Don't actually open the payment window in a test.
    await page.evaluate(() => { window.open = () => ({ closed: false }); });

    await sendChat(page, '/nearai on');
    await sendChat(page, 'make a kick drum');
    await expect(chatLog(page).locator('text=needs a session pass')).toBeVisible({ timeout: 15000 });

    await chatLog(page).getByRole('button', { name: /session pass/i }).click();
    // The payment page would write this; here we simulate it landing.
    await page.evaluate((pass) => localStorage.setItem('studio-pass', pass), makePass(3600));

    // The turn resumes on its own — the typed message was not lost.
    await expect(chatLog(page).locator('text=Resumed and answered.')).toBeVisible({ timeout: 20000 });
    expect(seen.some((r) => r.pass)).toBe(true);
});

test('a pass arriving from another tab retires the offer button', async ({ page }) => {
    // The button knows nothing about a claim made elsewhere — a stale "Get a day
    // pass" after you already have one invites paying twice.
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    const seen = await mockPaidProxy(page, { reply: 'Answered after the claim.' });
    await bootApp(page);
    await page.evaluate(() => { localStorage.removeItem('studio-pass'); localStorage.setItem('nearai-enabled', '1'); });

    await sendChat(page, '/nearai on');
    await sendChat(page, 'make a kick drum');
    await expect(chatLog(page).getByRole('button', { name: /session pass/i })).toBeVisible({ timeout: 15000 });

    // Simulate the claim landing in a DIFFERENT tab: `storage` fires here, and
    // the button was never clicked.
    await page.evaluate((pass) => {
        localStorage.setItem('studio-pass', pass);
        window.dispatchEvent(new StorageEvent('storage', { key: 'studio-pass', newValue: pass }));
    }, makePass(3600));

    await expect(chatLog(page).locator('text=session pass active')).toBeVisible({ timeout: 10000 });
    await expect(chatLog(page).getByRole('button', { name: /Get a session pass/i })).toHaveCount(0);
    // …and the turn that was waiting goes through on its own.
    await expect(chatLog(page).locator('text=Answered after the claim.')).toBeVisible({ timeout: 20000 });
    expect(seen.some((r) => r.pass)).toBe(true);
});

test('an empty credit pool keeps the pass and says so', async ({ page }) => {
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    await page.route('**/nearai/v1/chat/completions', (route) => route.fulfill({
        status: 503,
        json: { error: 'out_of_credits', message: 'The shared pool of AI credits has run out. It refills as NEAR is staked — your pass is still valid, so try again later.' },
    }));
    await bootApp(page);
    const pass = makePass(3600);
    await page.evaluate((p) => { localStorage.setItem('studio-pass', p); localStorage.setItem('nearai-enabled', '1'); }, pass);

    await sendChat(page, '/nearai on');
    await sendChat(page, 'make a kick drum');

    await expect(chatLog(page).locator('text=credits has run out')).toBeVisible({ timeout: 15000 });
    // The pass must survive: it is not the reason this failed.
    expect(await page.evaluate(() => localStorage.getItem('studio-pass'))).toBe(pass);
    await expect(chatLog(page).getByRole('button', { name: /session pass/i })).toHaveCount(0);
});

test('the payment page is exempt from COOP, or the wallet popup would break', async ({ page }) => {
    // This is why payment lives on its own page rather than inside the app.
    const pay = await page.request.get('/pay.html');
    expect(pay.status()).toBe(200);
    expect(pay.headers()['cross-origin-opener-policy']).toBeUndefined();

    const app = await page.request.get('/index.html');
    expect(app.headers()['cross-origin-opener-policy']).toBe('same-origin');
});
