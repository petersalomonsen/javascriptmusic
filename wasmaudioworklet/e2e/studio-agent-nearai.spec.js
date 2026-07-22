import { test, expect } from '@playwright/test';

// NEAR AI serverless provider: the agent loop runs IN THE BROWSER against an
// OpenAI-compatible API (no local studio-agent process). The API is mocked
// with route interception, so this exercises the real client wiring end to
// end: /nearai command handling, localStorage config, the fetch loop,
// tool_call dispatch into the real registry, and chat panel updates.

const chatInput = (page) => page.locator('#studioagentinput');
const chatLog = (page) => page.locator('#studioagentlog');

async function bootApp(page) {
    await page.goto('/');
    // The chat input exists in the DOM before initStudioAgent runs — wait for
    // toggleStudioAgent (defined at the END of app boot) to avoid a CI race.
    await page.waitForFunction(() => typeof window.toggleStudioAgent === 'function', { timeout: 30000 });
    await page.evaluate(() => window.toggleStudioAgent(true));
}

async function sendChat(page, text) {
    await chatInput(page).fill(text);
    await chatInput(page).press('Enter');
}

test('browser agent loop drives tools against a mocked NEAR AI API', async ({ page }) => {
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));

    const requests = [];
    // Scripted model: first a set_song tool call, then a final text answer.
    const responses = [
        { choices: [{ message: { role: 'assistant', content: null, tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'set_song', arguments: JSON.stringify({ source: 'setBPM(123);\n' }) } }] } }] },
        { choices: [{ message: { role: 'assistant', content: 'Song replaced — BPM is now 123.' } }], usage: { total_tokens: 321 } },
    ];
    await page.route('https://cloud-api.near.ai/**', async (route) => {
        requests.push(route.request().postDataJSON());
        await route.fulfill({ json: responses[requests.length - 1] });
    });

    await bootApp(page);

    // Configure the provider through the chat command (stored in localStorage,
    // never in the conversation).
    await sendChat(page, '/nearai test-api-key Qwen/Qwen3.5-122B-A10B');
    await expect(chatLog(page)).toContainText('NEAR AI mode ON (model Qwen/Qwen3.5-122B-A10B)');

    await sendChat(page, 'set the bpm to 123');

    // Final text lands in the chat…
    await expect(chatLog(page)).toContainText('Song replaced — BPM is now 123.', { timeout: 15000 });
    // …the tool call was surfaced…
    await expect(chatLog(page)).toContainText('⚙ set_song');
    // …and actually executed against the real song editor.
    const song = await page.evaluate(() => document.querySelector('app-javascriptmusic')
        .shadowRoot.querySelector('#editor .CodeMirror').CodeMirror.getValue());
    expect(song).toBe('setBPM(123);\n');

    // Protocol details: auth header + tools sent + tool result fed back.
    expect(requests.length).toBe(2);
    expect(requests[0].model).toBe('Qwen/Qwen3.5-122B-A10B');
    expect(requests[0].tools.some((t) => t.function.name === 'write_faust')).toBe(true);
    const toolMsg = requests[1].messages.find((m) => m.role === 'tool');
    expect(toolMsg.tool_call_id).toBe('call_1');
    expect(toolMsg.content).toBe('song updated');
    // The API key never enters the conversation/messages.
    expect(JSON.stringify(requests)).not.toContain('test-api-key');
});

test('proxy mode (/nearai on): no key, no system prompt, no tools sent — server enforces them', async ({ page }) => {
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    const requests = [];
    // Same-origin proxy path (on localhost the default is direct, so the test
    // overrides the base URL the way resolveDefaultBaseUrl does on pages.dev).
    await page.route('**/nearai/v1/chat/completions', async (route) => {
        requests.push({ headers: route.request().headers(), body: route.request().postDataJSON() });
        await route.fulfill({ json: { choices: [{ message: { role: 'assistant', content: 'via proxy!' } }] } });
    });
    await page.addInitScript(() => {
        localStorage.setItem('nearai-enabled', '1');
        localStorage.setItem('nearai-base-url', '/nearai/v1');
    });
    await bootApp(page);

    await sendChat(page, 'hello there');
    await expect(chatLog(page)).toContainText('via proxy!', { timeout: 15000 });

    expect(requests.length).toBe(1);
    expect(requests[0].headers.authorization).toBeUndefined();      // server holds the key
    expect(requests[0].body.tools).toBeUndefined();                  // server injects tools
    expect(requests[0].body.messages.some((m) => m.role === 'system')).toBe(false); // server injects the prompt
    expect(requests[0].body.messages.at(-1)).toEqual({ role: 'user', content: 'hello there' });
});

test('API errors surface in the chat and /nearai off restores the local agent path', async ({ page }) => {
    await page.route('https://cloud-api.near.ai/**', (route) =>
        route.fulfill({ status: 401, json: { error: 'invalid api key' } }));

    await bootApp(page);
    await sendChat(page, '/nearai bad-key');
    await sendChat(page, 'hello');
    await expect(chatLog(page)).toContainText('NEAR AI 401', { timeout: 15000 });

    await sendChat(page, '/nearai off');
    await expect(chatLog(page)).toContainText('NEAR AI mode off');
    expect(await page.evaluate(() => localStorage.getItem('nearai-api-key'))).toBeNull();
});
