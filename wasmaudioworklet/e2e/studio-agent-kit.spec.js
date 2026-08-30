import { test, expect } from '@playwright/test';
import ws from 'ws';
import { waitForAppReady, waitForStudioAgentTools, clearOPFS } from './near-git-helpers.js';

// The project KIT (its AGENT.md, or the shipped default) has to reach the model
// as context at the START of a turn — never as something the agent discovers
// with a tool call. Measured over real sessions, turns that opened with a
// discovery call ran about twice the median and roughly three times the p90 of
// turns that could act immediately, so a regression here is a silent
// performance cliff rather than a visible break.
//
// This spec pins the WIRING: browser reads the kit → ships it on the chat
// message → the agent server can put it in the system prompt. The selection
// rules (repo file wins, fallback, truncation, caching) are unit-tested in
// studio-agent/kit.test.mjs.
//
// No NEAR sandbox needed: an unregistered `?gitrepo=` name fails to clone and
// falls back to a local OPFS repo, which is also the "no AGENT.md" case.

const REPO = 'kit-e2e-test';

// Mock agent server — only needs to capture what the client sends.
function startMockAgentServer() {
    const wss = new ws.Server({ port: 0 });
    const state = { socket: null, chats: [] };
    wss.on('connection', (socket) => {
        state.socket = socket;
        socket.on('close', () => { if (state.socket === socket) state.socket = null; });
        socket.on('message', (data) => {
            let msg;
            try { msg = JSON.parse(data.toString()); } catch { return; }
            // Answer the turn. The client runs strictly one turn at a time, so a
            // mock that only records and never replies leaves it busy forever and
            // the next send is (correctly) refused.
            if (msg.t === 'chat') {
                state.chats.push(msg);
                socket.send(JSON.stringify({ t: 'text', text: 'ok' }));
                socket.send(JSON.stringify({ t: 'done' }));
            }
        });
    });
    const waitForClient = async (timeoutMs = 30000) => {
        const t0 = Date.now();
        while (!(state.socket && state.socket.readyState === ws.OPEN)) {
            if (Date.now() - t0 > timeoutMs) throw new Error('no live studio-agent client connection');
            await new Promise((r) => setTimeout(r, 100));
        }
    };
    const waitForChat = async (timeoutMs = 30000) => {
        const t0 = Date.now();
        while (state.chats.length === 0) {
            if (Date.now() - t0 > timeoutMs) throw new Error('client never sent a chat message');
            await new Promise((r) => setTimeout(r, 100));
        }
        return state.chats[0];
    };
    return {
        state, waitForClient, waitForChat,
        port: () => wss.address().port,
        close: () => new Promise((resolve) => wss.close(resolve)),
    };
}

async function typeIntoAgentChat(page, text) {
    await page.evaluate((t) => {
        const shadow = document.querySelector('app-javascriptmusic').shadowRoot;
        window.toggleStudioAgent(true);
        const input = shadow.getElementById('studioagentinput');
        input.value = t;
        shadow.getElementById('studioagentform').requestSubmit();
    }, text);
}

test.describe('studio-agent project kit', () => {
    let mock;

    test.beforeEach(async ({ page }) => {
        mock = startMockAgentServer();
        await page.addInitScript((port) => { window.STUDIO_AGENT_PORT = port; }, mock.port());
    });
    test.afterEach(async ({ page }) => {
        await clearOPFS(page, REPO);
        await mock.close();
    });

    test('a chat message carries the kit, so the agent never has to look it up', async ({ page }) => {
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.goto(`http://localhost:8080/?gitrepo=${REPO}`);
        await waitForAppReady(page);
        await waitForStudioAgentTools(page);
        await mock.waitForClient();

        await typeIntoAgentChat(page, 'give me a beat');
        const chat = await mock.waitForChat();

        expect(chat.text).toBe('give me a beat');
        // A fresh repo has no AGENT.md, so this is the shipped default kit.
        expect(typeof chat.kit).toBe('string');
        expect(chat.kit.length).toBeGreaterThan(1000);
        expect(chat.kit).toContain('Performance kit');
    });

    test('the default kit carries what the agent needs to build without lookups', async ({ page }) => {
        await page.goto(`http://localhost:8080/?gitrepo=${REPO}`);
        await waitForAppReady(page);
        await waitForStudioAgentTools(page);
        await mock.waitForClient();

        await typeIntoAgentChat(page, 'hello');
        const { kit } = await mock.waitForChat();

        // The channel map and a runnable source for each instrument — without
        // these the agent has to go and find them, which is the cost this
        // whole mechanism exists to avoid.
        for (const instrument of ['kick', 'snare', 'hihat', 'pad', 'bass', 'lead']) {
            expect(kit, `kit should describe ${instrument}`).toContain(instrument);
        }
        expect(kit).toContain('import("stdfaust.lib")');
        expect(kit).toContain('initializeMidiSynth');
        // Saturation options the agent should have without a lookup: ma.tanh
        // (transpiles to Mathf.tanh) and the cheaper sat() soft clipper.
        expect(kit, 'must document ma.tanh as a saturator').toContain('ma.tanh');
        expect(kit, 'must document the sat() soft clipper').toContain('sat(x) = x / (1.0 + abs(x))');
    });

    test('every turn carries the kit, not just the first', async ({ page }) => {
        await page.goto(`http://localhost:8080/?gitrepo=${REPO}`);
        await waitForAppReady(page);
        await waitForStudioAgentTools(page);
        await mock.waitForClient();

        await typeIntoAgentChat(page, 'first');
        await mock.waitForChat();
        // Wait for the turn to FINISH, not merely to arrive: a second message
        // sent into a running turn is refused, which is the point of the guard.
        await expect(page.locator('#studioagentstatus')).toHaveClass(/idle/, { timeout: 15000 });
        await typeIntoAgentChat(page, 'second');
        await expect.poll(() => mock.state.chats.length).toBe(2);

        // The server rebuilds the system prompt per turn; identical kit text
        // each time is what keeps the cached prompt prefix intact.
        const [a, b] = mock.state.chats;
        expect(b.kit).toBe(a.kit);
        expect(b.kit.length).toBeGreaterThan(1000);
    });
});
