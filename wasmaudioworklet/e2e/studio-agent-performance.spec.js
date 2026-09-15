import { test, expect } from '@playwright/test';
import ws from 'ws';
import { waitForAppReady, waitForStudioAgentTools, clearOPFS, specRepo } from './near-git-helpers.js';

// The studio agent on stage (docs/plans/performance-mode.md, the agent
// phase). With performance mode on, the panel dispatches a part name or
// "next" ITSELF — no model, no round trip — through the app's signal bus;
// only an instruction it cannot read goes to the server as a performance
// turn carrying the parts and the stage state. The stage tools answer like
// client.js does. Own local repo; the "agent server" is a mock in this test.
const REPO = specRepo('studio-agent-performance');

const SONG = `setBPM(120);
definePartStart('intro');
await createTrack(0).steps(1, [ c4, , e4, , g4, , c5, , c4, , e4, , g4, , c5, ]);
waitForSignal('go');
definePartStart('verse');
await createTrack(0).steps(1, [ c4, , e4, , g4, , c5, , c4, , e4, , g4, , c5, ]);
waitForSignal('go');
definePartStart('quiet breakdown');
await createTrack(0).steps(1, [ c4, , e4, , g4, , c5, , c4, , e4, , g4, , c5, ]);
waitForSignal('go');
definePartStart('finale');
await createTrack(0).steps(1, [ c4, , e4, , g4, , c5, , c4, , e4, , g4, , c5, ]);
`;

function startMockAgentServer() {
    const wss = new ws.Server({ port: 0 });
    const state = { socket: null, chats: [], nextId: 1, pending: new Map() };
    wss.on('connection', (socket) => {
        state.socket = socket;
        socket.on('close', () => { if (state.socket === socket) state.socket = null; });
        socket.on('message', (data) => {
            let msg; try { msg = JSON.parse(data.toString()); } catch { return; }
            if (msg.t === 'chat') state.chats.push(msg);
            else if (msg.t === 'tool_result') { const p = state.pending.get(msg.id); if (p) { state.pending.delete(msg.id); p(msg); } }
        });
    });
    const waitFor = async (check, timeoutMs = 30000) => { const t0 = Date.now(); while (!check()) { if (Date.now() - t0 > timeoutMs) throw new Error('timeout'); await new Promise((r) => setTimeout(r, 100)); } };
    return {
        state,
        waitForClient: () => waitFor(() => state.socket && state.socket.readyState === ws.OPEN),
        waitForChat: async (n = 1) => { await waitFor(() => state.chats.length >= n); return state.chats[n - 1]; },
        callTool: (name, args) => new Promise((resolve) => { const id = state.nextId++; state.pending.set(id, resolve); state.socket.send(JSON.stringify({ t: 'tool_call', id, name, args: args || {} })); }),
        send: (obj) => state.socket.send(JSON.stringify(obj)),
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
const chatLog = (page) => page.evaluate(() => {
    const app = document.querySelector('app-javascriptmusic');
    const roots = [app.shadowRoot, ...[...app.shadowRoot.querySelectorAll('*')].map((e) => e.shadowRoot).filter(Boolean)];
    for (const r of roots) { const l = r.getElementById && r.getElementById('studioagentlog'); if (l) return [...l.children].map((c) => c.textContent); }
    return [];
});

test.describe('studio-agent performance mode (local repo)', () => {
    let mock;
    test.beforeEach(async ({ page }) => {
        mock = startMockAgentServer();
        await page.addInitScript((port) => { window.STUDIO_AGENT_PORT = port; }, mock.port());
    });
    test.afterEach(async ({ page }) => { await clearOPFS(page, REPO); await mock.close(); });

    test('a part name or "next" is dispatched by the panel without a model; the rest goes to the stage-hand turn', async ({ page }) => {
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.goto(`http://localhost:8080/?gitrepo=${REPO}`);
        await waitForAppReady(page);
        await waitForStudioAgentTools(page);
        await mock.waitForClient();
        const run = (name, args) => page.evaluate(({ name, args }) => window.studioAgentRunTool(name, args), { name, args });
        expect(await run('set_song', { source: SONG })).toContain('song updated');
        expect(String(await run('compile', {}))).toContain('compiled OK');

        // Not playing: signals cannot do anything, and the tools say so.
        expect(String((await mock.callTool('list_parts', {})).result)).toContain('parts in order: intro, verse, quiet breakdown, finale. Not playing yet');
        const notPlaying = await mock.callTool('go_to_part', { part: 'verse' });
        expect(notPlaying.ok).toBe(false);
        expect(String(notPlaying.result)).toContain('press play');

        // Stand in for a running song: the bus is spied on, the sequencer's
        // state arrives as the same DOM event the worklet path dispatches.
        await page.evaluate(() => {
            window.__signals = [];
            window.audioworkletnode = {};
            window.sendSignal = (name, goTo) => { window.__signals.push([name, goTo]); return true; };
            window.songTimeSeconds = () => 9;   // in "verse"
            window.togglePerformanceMode(true);
            window.dispatchEvent(new CustomEvent('wasmmusic-signal', { detail: { waiting: 'go', loop: 'part' } }));
        });
        expect(String((await mock.callTool('list_parts', {})).result)).toContain('Now in "verse", looping until signal "go".');
        expect(String((await mock.callTool('list_parts', {})).result)).toContain('1. intro — 4 bar(s), wait "go" (part)');
        const unknown = await mock.callTool('go_to_part', { part: 'bridge' });
        expect(unknown.ok).toBe(false);
        expect(String(unknown.result)).toContain('no part "bridge". Parts: intro, verse, quiet breakdown, finale');
        expect(String((await mock.callTool('go_to_part', { part: 'Finale' })).result)).toContain('→ "finale": jumping on the next bar line (leaving "verse")');

        // The fast path: typed part names and "next" never reach the server.
        await typeIntoAgentChat(page, 'go to the quiet breakdown');
        await typeIntoAgentChat(page, 'next');
        await typeIntoAgentChat(page, 'Finale');
        await page.waitForFunction(() => window.__signals.length >= 4);
        expect(await page.evaluate(() => window.__signals)).toEqual([['go', 'finale'], ['go', 'quiet breakdown'], ['go', null], ['go', 'finale']]);
        expect(mock.state.chats.length).toBe(0);
        const log = await chatLog(page);
        expect(log.some((l) => /jumping on the next bar line.*no model/.test(l))).toBe(true);

        // Intent the panel cannot read: one performance turn to the server,
        // carrying the parts and the state; the model (mocked) answers with a tool call.
        await typeIntoAgentChat(page, 'take it to the quiet bit');
        const chat = await mock.waitForChat(1);
        expect(chat.mode).toBe('performance');
        expect(chat.parts.map((p) => p.name)).toEqual(['intro', 'verse', 'quiet breakdown', 'finale']);
        expect(chat.state).toContain('Now in "verse", looping until signal "go"');
        expect(chat.kit).toBeUndefined();   // no kit, no session: the stage prompt is self-contained
        const jump = await mock.callTool('go_to_part', { part: 'quiet breakdown' });
        expect(jump.ok).toBe(true);
        mock.send({ t: 'text', text: 'Quiet breakdown, next bar.' });
        mock.send({ t: 'done', subtype: 'success', secs: 1.2 });
        await page.waitForFunction(() => window.__signals.length >= 5);
        expect((await page.evaluate(() => window.__signals)).slice(-1)).toEqual([['go', 'quiet breakdown']]);

        // Off again: the same text is a normal chat to the producer.
        await page.evaluate(() => window.togglePerformanceMode(false));
        await typeIntoAgentChat(page, 'next');
        const normal = await mock.waitForChat(2);
        expect(normal.mode).toBeUndefined();
        expect(normal.text).toBe('next');
    });
});
