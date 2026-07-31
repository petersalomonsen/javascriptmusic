import { test, expect } from '@playwright/test';
import ws from 'ws';
import { waitForAppReady, waitForStudioAgentTools, clearOPFS } from './near-git-helpers.js';

// Stopping a running turn. Nothing in the system could do this before: the
// Agent SDK's own interrupt() is streaming-input only, and the studio agent
// sends a plain prompt, so a turn that went wrong ran to completion. Real
// sessions had turns of 10+ minutes. During a live set that is the difference
// between losing a bar and losing the performance.
//
// These drive the CLIENT half against a mock agent server: the stop button
// appears only while a turn is running, sends `abort`, and a `stopped` reply
// clears the busy state without looking like a failure.
//
// No NEAR sandbox needed: an unregistered `?gitrepo=` falls back to local OPFS.

const REPO = 'abort-e2e-test';

function startMockAgentServer() {
    const wss = new ws.Server({ port: 0 });
    const state = { socket: null, messages: [] };
    wss.on('connection', (socket) => {
        state.socket = socket;
        socket.on('close', () => { if (state.socket === socket) state.socket = null; });
        socket.on('message', (data) => {
            let msg;
            try { msg = JSON.parse(data.toString()); } catch { return; }
            state.messages.push(msg);
        });
    });
    const waitForClient = async (timeoutMs = 30000) => {
        const t0 = Date.now();
        while (!(state.socket && state.socket.readyState === ws.OPEN)) {
            if (Date.now() - t0 > timeoutMs) throw new Error('no live studio-agent client connection');
            await new Promise((r) => setTimeout(r, 100));
        }
    };
    const waitFor = async (type, timeoutMs = 15000) => {
        const t0 = Date.now();
        for (;;) {
            const hit = state.messages.find((m) => m.t === type);
            if (hit) return hit;
            if (Date.now() - t0 > timeoutMs) throw new Error(`client never sent "${type}"`);
            await new Promise((r) => setTimeout(r, 50));
        }
    };
    return {
        state, waitForClient, waitFor,
        send: (obj) => state.socket?.send(JSON.stringify(obj)),
        port: () => wss.address().port,
        close: () => new Promise((resolve) => wss.close(resolve)),
    };
}

const stopButton = (page) => page.locator('#studioagentstop');
const chatLog = (page) => page.locator('#studioagentlog');

async function openChat(page, mock) {
    await page.addInitScript((port) => { window.STUDIO_AGENT_PORT = port; }, mock.port());
    await page.goto(`http://localhost:8080/?gitrepo=${REPO}`);
    await waitForAppReady(page);
    await waitForStudioAgentTools(page);
    await mock.waitForClient();
    await page.evaluate(() => window.toggleStudioAgent(true));
}

async function ask(page, text) {
    await page.evaluate((t) => {
        const shadow = document.querySelector('app-javascriptmusic').shadowRoot;
        shadow.getElementById('studioagentinput').value = t;
        shadow.getElementById('studioagentform').requestSubmit();
    }, text);
}

test.describe('studio-agent stop button', () => {
    let mock;

    test.beforeEach(() => { mock = startMockAgentServer(); });
    test.afterEach(async ({ page }) => {
        await clearOPFS(page, REPO);
        await mock.close();
    });

    test('appears only while a turn is running, and asks the server to stop', async ({ page }) => {
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await openChat(page, mock);

        // Idle: nothing to stop.
        await expect(stopButton(page)).toBeHidden();

        await ask(page, 'build me something slow');
        await mock.waitFor('chat');
        await expect(stopButton(page)).toBeVisible();

        await stopButton(page).click();
        const abort = await mock.waitFor('abort');
        expect(abort.t).toBe('abort');

        // The server confirms the turn ended; the UI must leave the busy state.
        mock.send({ t: 'stopped' });
        await expect(stopButton(page)).toBeHidden();
        await expect(chatLog(page)).toContainText('stopped');
    });

    test('a stopped turn is not reported as an error', async ({ page }) => {
        await openChat(page, mock);
        await ask(page, 'something long');
        await mock.waitFor('chat');
        await stopButton(page).click();
        await mock.waitFor('abort');
        mock.send({ t: 'stopped' });

        await expect(chatLog(page)).toContainText('stopped');
        // "⚠" is the error prefix — a deliberate stop must never render as one.
        await expect(chatLog(page)).not.toContainText('⚠');
    });

    test('work the agent already reported is kept when the turn is stopped', async ({ page }) => {
        await openChat(page, mock);
        await ask(page, 'start explaining');
        await mock.waitFor('chat');

        mock.send({ t: 'text', text: 'Here is what I found so far.' });
        await expect(chatLog(page)).toContainText('Here is what I found so far.');

        await stopButton(page).click();
        await mock.waitFor('abort');
        mock.send({ t: 'stopped' });

        // Stop ends the turn; it does not throw away what was already said.
        await expect(chatLog(page)).toContainText('Here is what I found so far.');
        await expect(stopButton(page)).toBeHidden();
    });

    test('Escape stops the turn without reaching for the mouse', async ({ page }) => {
        await openChat(page, mock);
        await ask(page, 'a long one');
        await mock.waitFor('chat');

        await page.locator('#studioagentinput').press('Escape');
        const abort = await mock.waitFor('abort');
        expect(abort.t).toBe('abort');
    });
});
