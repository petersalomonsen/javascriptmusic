import { test, expect } from '@playwright/test';
import { buildProducerPrompt } from '../studio-agent/prompt.js';
import { specRepo, clearOPFS, waitForAppReady } from './near-git-helpers.js';

// The agent only works inside a project repo (OPFS working tree), so every
// test boots one — local-only, no NEAR sandbox needed.
const REPO = specRepo('studio-agent-nearai');

// NEAR AI serverless provider: the agent loop runs IN THE BROWSER against an
// OpenAI-compatible API (no local studio-agent process). The API is mocked
// with route interception, so this exercises the real client wiring end to
// end: /nearai command handling, localStorage config, the fetch loop,
// tool_call dispatch into the real registry, and chat panel updates.

const chatInput = (page) => page.locator('#studioagentinput');
const chatLog = (page) => page.locator('#studioagentlog');

async function bootApp(page) {
    await page.goto(`/?gitrepo=${REPO}`);
    await waitForAppReady(page);
    // The chat input exists in the DOM before initStudioAgent runs — wait for
    // toggleStudioAgent (defined at the END of app boot) to avoid a CI race.
    await page.waitForFunction(() => typeof window.toggleStudioAgent === 'function', { timeout: 30000 });
    await page.evaluate(() => window.toggleStudioAgent(true));
}

test.afterEach(async ({ page }) => { await clearOPFS(page, REPO); });

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
    await sendChat(page, '/nearai test-api-key Qwen/Qwen3.6-35B-A3B-FP8');
    await expect(chatLog(page)).toContainText('NEAR AI mode ON (model Qwen/Qwen3.6-35B-A3B-FP8)');

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
    expect(requests[0].model).toBe('Qwen/Qwen3.6-35B-A3B-FP8');
    // The PRODUCER's tool list: it delegates instrument design, so it offers
    // design_instrument and not the .dsp writers.
    const names = requests[0].tools.map((t) => t.function.name);
    expect(names).toContain('design_instrument');
    expect(names).toContain('set_song');
    expect(names).not.toContain('write_faust');
    expect(names).not.toContain('edit_faust');
    const toolMsg = requests[1].messages.find((m) => m.role === 'tool');
    expect(toolMsg.tool_call_id).toBe('call_1');
    expect(toolMsg.content).toBe('song updated');
    // The API key never enters the conversation/messages.
    expect(JSON.stringify(requests)).not.toContain('test-api-key');
});

test('proxy mode (/nearai on): no key sent; the app sends its own system prompt AND its tool list', async ({ page }) => {
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
    // The tool list is the app's too: the proxy forwards it (bounded) and
    // injects nothing, which is what lets a specialist turn offer a subset.
    expect(requests[0].body.tools.some((t) => t.function.name === 'design_instrument')).toBe(true);
    // The PROMPT, unlike the key, is the app's: the proxy forwards whatever it
    // is sent and only falls back to its own copy when a client sends none.
    // That is what lets a prompt fix ship with the app instead of waiting on a
    // Pages redeploy.
    const system = requests[0].body.messages.filter((m) => m.role === 'system');
    expect(system.length).toBe(1);
    expect(system[0].content.startsWith(buildProducerPrompt().slice(0, 60))).toBe(true);
    // The project kit still rides in on the FIRST user turn rather than as a
    // second system message, which keeps the history strictly alternating —
    // and repo content carries user authority anyway.
    const last = requests[0].body.messages.at(-1);
    expect(last.role).toBe('user');
    expect(last.content.endsWith('hello there')).toBe(true);
    expect(last.content).toContain('Performance kit');
});

// design_instrument runs a SECOND agent loop in the browser with the specialist
// prompt and only the instrument tools; afterwards the tool probes the channel
// itself. This scripts both loops and pins the protocol: what the specialist
// is sent, what it may call, and that the producer gets a MEASURED verdict.
test('design_instrument runs the instrument specialist as a nested loop and returns a measured verdict', async ({ page }) => {
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    const requests = [];
    const responses = [
        // 1 — the producer delegates
        { choices: [{ message: { role: 'assistant', content: null, tool_calls: [{ id: 'call_d', type: 'function', function: { name: 'design_instrument', arguments: JSON.stringify({ brief: 'a short bright FM bell', kind: 'fm', channel: 2, name: 'bell' }) } }] } }] },
        // 2 — the specialist answers with its report straight away (no tools)
        { choices: [{ message: { role: 'assistant', content: 'REPORT\nfile: faust/bell.dsp\nclass: Bell\nchannel: 2\nprobe: (skipped in this scripted run)\nnotes: scripted specialist' } }] },
        // 3 — the producer reads the verdict and answers the user
        { choices: [{ message: { role: 'assistant', content: 'The bell could not be verified.' } }], usage: { total_tokens: 99 } },
    ];
    await page.route('https://cloud-api.near.ai/**', async (route) => {
        requests.push(route.request().postDataJSON());
        await route.fulfill({ json: responses[requests.length - 1] });
    });
    await bootApp(page);
    await sendChat(page, '/nearai test-api-key Qwen/Qwen3.6-35B-A3B-FP8');
    await expect(chatLog(page)).toContainText('NEAR AI mode ON');

    await sendChat(page, 'make me a bell');
    await expect(chatLog(page)).toContainText('The bell could not be verified.', { timeout: 20000 });
    expect(requests.length).toBe(3);

    // The specialist's request: its own prompt, the brief as its task, only the instrument tools.
    const sp = requests[1];
    expect(sp.messages[0].role).toBe('system');
    expect(sp.messages[0].content.startsWith('You are the INSTRUMENT SPECIALIST')).toBe(true);
    expect(sp.messages[0].content).toContain('### Guide: FM');
    expect(sp.messages[0].content).not.toContain('## SONG format');
    expect(sp.messages[1].role).toBe('user');
    expect(sp.messages[1].content.startsWith('BRIEF: a short bright FM bell')).toBe(true);
    expect(sp.messages[1].content).toContain('MIDI channel 2');
    const spTools = sp.tools.map((t) => t.function.name);
    expect(spTools).toContain('write_faust');
    expect(spTools).toContain('probe_instrument');
    expect(spTools).not.toContain('get_song');
    expect(spTools).not.toContain('design_instrument');

    // The producer gets the report AND the tool's own probe; with nothing
    // compiled the verdict is FAILED in the first line — measured, not claimed.
    const toolMsg = requests[2].messages.find((m) => m.role === 'tool');
    expect(toolMsg.tool_call_id).toBe('call_d');
    expect(toolMsg.content).toMatch(/^design_instrument "bell" on channel 2: FAILED/);
    expect(toolMsg.content).toContain('SPECIALIST REPORT:\nREPORT\nfile: faust/bell.dsp');
    expect(toolMsg.content).toContain('VERIFIED PROBE');
    // …and the chat shows the specialist's life cycle.
    await expect(chatLog(page)).toContainText('— instrument specialist started (bell) —');
    await expect(chatLog(page)).toContainText('— instrument specialist finished: FAILED —');
});

// The agent works only inside a project repo: instruments, the session file and
// the specialist's .dsp writes all live in the OPFS working tree. Without one
// the panel says so and sends nothing, instead of failing tool by tool.
test('without a project repo the agent refuses to start a turn and says why', async ({ page }) => {
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    let requests = 0;
    await page.route('https://cloud-api.near.ai/**', async (route) => { requests++; await route.fulfill({ json: { choices: [{ message: { role: 'assistant', content: 'should not happen' } }] } }); });
    await page.addInitScript(() => {
        localStorage.setItem('nearai-api-key', 'test-api-key');
        localStorage.setItem('nearai-model', 'Qwen/Qwen3.6-35B-A3B-FP8');
    });
    await page.goto('/');   // localhost: the classic no-repo boot
    await page.waitForFunction(() => typeof window.toggleStudioAgent === 'function', { timeout: 30000 });
    await page.evaluate(() => window.toggleStudioAgent(true));
    await sendChat(page, 'hello');
    await expect(chatLog(page)).toContainText('needs a project repo');
    await expect(chatLog(page)).toContainText('?gitrepo=');
    expect(requests).toBe(0);
    // the typed text is kept for the user to resend after opening a repo
    expect(await chatInput(page).inputValue()).toBe('hello');
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

// setBusy() disables the Send BUTTON, but Enter calls form.requestSubmit(),
// which a disabled button does not stop. So typing a follow-up into a running
// turn started a second one on top of it: both shared nearaiMessages and wrote
// into the same agent bubble, producing back-to-back user messages with no
// assistant turn between them — malformed for a tool-calling conversation — and
// one reply rendered several times. Watching that, the agent looks like it
// stopped mid-task and never came back.
test('a second message cannot start a turn while one is running', async ({ page }) => {
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    const requests = [];
    await page.route('https://cloud-api.near.ai/**', async (route) => {
        requests.push(route.request().postDataJSON());
        await new Promise((r) => setTimeout(r, 3000));   // a turn that takes a while
        await route.fulfill({ json: { choices: [{ message: { role: 'assistant', content: 'done' } }], usage: { total_tokens: 7 } } });
    });
    await page.addInitScript(() => {
        localStorage.setItem('nearai-api-key', 'test-api-key');
        localStorage.setItem('nearai-model', 'Qwen/Qwen3.6-35B-A3B-FP8');
    });
    await bootApp(page);

    await sendChat(page, 'first');
    await page.waitForTimeout(600);           // the turn is now in flight
    await chatInput(page).fill('did it stop?');
    await chatInput(page).press('Enter');

    await expect(chatLog(page)).toContainText('a turn is still running', { timeout: 5000 });
    // The refused message stays in the box rather than being swallowed.
    await expect(chatInput(page)).toHaveValue('did it stop?');

    await expect(chatLog(page)).toContainText('done', { timeout: 15000 });
    expect(requests.length).toBe(1);
    // One user turn reached the model, not two in a row.
    expect(requests[0].messages.filter((m) => m.role === 'user').length).toBe(1);
});

// The proxy refuses a conversation over 60k chars outright, so a long session
// simply stops working — one real one reached 60,892 with no waste left in it.
// The app compacts BEFORE a turn rather than after: arriving at the cap
// mid-turn loses that turn.
test('a long conversation is compacted before the next turn, not after it fails', async ({ page }) => {
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    const asks = [];
    await page.route('https://cloud-api.near.ai/**', async (route) => {
        const body = route.request().postDataJSON();
        const last = body.messages.at(-1)?.content ?? '';
        asks.push(last.slice(0, 40));
        // The compaction request is recognisable by what it asks for.
        const isSummary = /Summarise this session/.test(last);
        const reply = isSummary
            ? 'kick on ch0, hihat on ch1; user hand-tuned the echo feedback'
            // A reply large enough to push the history past the threshold.
            : 'x'.repeat(45000);
        await route.fulfill({ json: { choices: [{ message: { role: 'assistant', content: reply } }], usage: { total_tokens: 9 } } });
    });
    await page.addInitScript(() => {
        localStorage.setItem('nearai-api-key', 'test-api-key');
        localStorage.setItem('nearai-model', 'Qwen/Qwen3.6-35B-A3B-FP8');
    });
    await bootApp(page);

    await sendChat(page, 'make a kick');
    await expect(page.locator('#studioagentstatus')).toHaveClass(/idle/, { timeout: 20000 });

    await sendChat(page, 'now a hihat');
    await expect(chatLog(page)).toContainText('compacting the conversation', { timeout: 20000 });
    await expect(chatLog(page)).toContainText('compacted to', { timeout: 20000 });

    // The summary was actually requested, and the turn carried on afterwards.
    expect(asks.some((a) => /Summarise this session/.test(a))).toBe(true);
    await expect(page.locator('#studioagentstatus')).toHaveClass(/idle/, { timeout: 20000 });
});
