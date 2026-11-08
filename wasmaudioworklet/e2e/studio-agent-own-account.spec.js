import { test, expect } from '@playwright/test';
import { specRepo, waitForAppReady } from './near-git-helpers.js';

// The studio agent on the user's own NEAR AI account: requests go straight to
// NEAR AI on their key, and account problems are about their account, not our
// session pass. NEAR AI is mocked, so no credits move.
const REPO = specRepo('studio-agent-own-account');
const chatInput = (page) => page.locator('#studioagentinput');
const chatLog = (page) => page.locator('#studioagentlog');

async function bootApp(page) {
    await page.goto(`/?gitrepo=${REPO}`);
    await waitForAppReady(page);
    await page.waitForFunction(() => typeof window.toggleStudioAgent === 'function', { timeout: 30000 });
    await page.evaluate(() => window.toggleStudioAgent(true));
}
const send = async (page, text) => {
    await chatInput(page).fill(text);
    await chatInput(page).press('Enter');
};
const reply = (content) => ({ json: { choices: [{ message: { role: 'assistant', content } }], usage: { total_tokens: 3 } } });

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        if (sessionStorage.getItem('seeded')) return;
        sessionStorage.setItem('seeded', '1');
        localStorage.setItem('nearai-api-key', 'sk-users-own');
        localStorage.setItem('studio-pass', 'our-pass-token');
    });
});

test('requests go direct on the user key, and our pass stays home', async ({ page }) => {
    const seen = [];
    await page.route('https://cloud-api.near.ai/v1/chat/completions', async (route) => {
        seen.push(route.request().headers());
        await route.fulfill(reply('Hello from your account.'));
    });
    let proxied = 0;
    await page.route('**/nearai/v1/**', async (route) => { proxied++; await route.abort(); });

    await bootApp(page);
    await send(page, 'hello');
    await expect(chatLog(page)).toContainText('Hello from your account.', { timeout: 15000 });

    expect(seen[0].authorization).toBe('Bearer sk-users-own');
    expect(seen[0]['x-studio-pass']).toBeUndefined();
    expect(proxied).toBe(0);
});

test('an empty account says so, keeps the pass, and Try again resumes the message', async ({ page }) => {
    let credits = false;
    const asks = [];
    await page.route('https://cloud-api.near.ai/v1/chat/completions', async (route) => {
        asks.push(route.request().postDataJSON().messages.at(-1).content);
        if (!credits) {
            await route.fulfill({ status: 402, json: { error: { type: 'no_limit_configured', message: 'No spending limit configured.' } } });
        } else {
            await route.fulfill(reply('Topped up.'));
        }
    });

    await bootApp(page);
    await send(page, 'make a bassline');
    await expect(chatLog(page)).toContainText('out of credits', { timeout: 15000 });
    await expect(chatLog(page).getByRole('button', { name: 'Manage account' })).toBeVisible();
    await expect(chatLog(page)).not.toContainText('session pass');
    expect(await page.evaluate(() => localStorage.getItem('studio-pass'))).toBe('our-pass-token');

    credits = true;
    await chatLog(page).getByRole('button', { name: 'Try again' }).click();
    await expect(chatLog(page)).toContainText('Topped up.', { timeout: 15000 });
    expect(asks.at(-1)).toContain('make a bassline');
    // Only one copy of the message in the history, not one per attempt.
    const lastBody = asks.filter((a) => a.includes('make a bassline'));
    expect(lastBody.length).toBe(2);
});

test('a rejected key is reported and offers the account page', async ({ page }) => {
    await page.route('https://cloud-api.near.ai/v1/chat/completions', (route) =>
        route.fulfill({ status: 401, json: { error: { message: 'Invalid or expired API key' } } }));
    await bootApp(page);
    await send(page, 'hello');
    await expect(chatLog(page)).toContainText('NEAR AI 401', { timeout: 15000 });
    await expect(chatLog(page).getByRole('button', { name: 'Manage account' })).toBeVisible();
});

test('the account page checks a pasted key, then the app uses it', async ({ page }) => {
    await page.route('https://cloud-api.near.ai/v1/check_api_key', async (route) => {
        const good = route.request().headers().authorization === 'Bearer sk-good';
        await route.fulfill({ status: good ? 200 : 401, json: {} });
    });
    await page.goto('/nearai-connect.html');
    await page.evaluate(() => {
        localStorage.setItem('nearai-enabled', '1');
        localStorage.setItem('nearai-base-url', '/nearai/v1');
        localStorage.removeItem('nearai-api-key');
    });

    await page.fill('#key', 'sk-bad');
    await page.click('#keyform button');
    await expect(page.locator('#msg')).toContainText('did not accept');
    expect(await page.evaluate(() => localStorage.getItem('nearai-api-key'))).toBeNull();

    await page.fill('#key', 'sk-good');
    await page.click('#keyform button');
    await expect(page.locator('#msg')).toContainText('Connected');
    expect(await page.evaluate(() => [
        localStorage.getItem('nearai-api-key'), localStorage.getItem('nearai-base-url'), localStorage.getItem('nearai-enabled'),
    ])).toEqual(['sk-good', null, null]);
    expect(await page.inputValue('#key')).toBe('');

    await page.click('#disconnect');
    expect(await page.evaluate(() => localStorage.getItem('nearai-api-key'))).toBeNull();
});

test('the account page is exempt from COOP, or wallet popups would break', async ({ page }) => {
    const res = await page.request.get('/nearai-connect.html');
    expect(res.status()).toBe(200);
    expect(res.headers()['cross-origin-opener-policy']).toBeUndefined();
});

test('the panel button opens the account page', async ({ page, context }) => {
    await page.route('https://cloud-api.near.ai/**', (route) => route.fulfill({ json: {} }));
    await bootApp(page);
    const popup = context.waitForEvent('page');
    await page.locator('#studioagentaccount').click();
    expect((await popup).url()).toContain('/nearai-connect');
});
