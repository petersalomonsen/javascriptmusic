import { test, expect } from '@playwright/test';
import ws from 'ws';
import { waitForAppReady, waitForStudioAgentTools, clearOPFS, specRepo } from './near-git-helpers.js';

// The studio agent on stage (docs/plans/performance-mode.md, the agent
// phase). With performance mode on, the panel dispatches a part name or
// "next" ITSELF — no model, no round trip — through the app's signal bus;
// anything else goes to the server as a PRODUCER turn on stage (mode:
// 'performance', with the kit, the parts and the stage state). The
// performance checkbox also switches SESSIONS: the composition conversation
// is archived into sessions/ and a fresh performance session starts. Own
// local repo; the "agent server" is a mock in this test.
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
// The repo's working tree in OPFS: <repo>.git/… Read from the main thread
// while the git worker owns the tree can miss for a moment (the worker writes
// through sync access handles), so a read polls until the file is there.
const readRepoFile = async (page, name) => {
    const t0 = Date.now();
    for (;;) {
        const text = await page.evaluate(async ({ repo, name }) => {
            try {
                const root = await navigator.storage.getDirectory();
                let dir = await root.getDirectoryHandle(repo + '.git');
                const segs = name.split('/');
                for (const s of segs.slice(0, -1)) dir = await dir.getDirectoryHandle(s);
                return await (await (await dir.getFileHandle(segs[segs.length - 1])).getFile()).text();
            } catch { return null; }
        }, { repo: REPO, name });
        if (text) return text;
        if (Date.now() - t0 > 15000) throw new Error(`repo file ${name} did not appear`);
        await page.waitForTimeout(200);
    }
};
const listRepoDir = (page, dirName) => page.evaluate(async ({ repo, dirName }) => {
    const root = await navigator.storage.getDirectory();
    try { const dir = await (await root.getDirectoryHandle(repo + '.git')).getDirectoryHandle(dirName); const out = []; for await (const [n] of dir.entries()) out.push(n); return out.sort(); } catch { return []; }
}, { repo: REPO, dirName });
// A directory listing from the main thread can lag the worker's write by a
// moment: wait for the archive to show up rather than asserting at once.
const waitForRepoDir = async (page, dirName, expected) => {
    await page.waitForFunction(async ({ repo, dirName, expected }) => {
        const root = await navigator.storage.getDirectory();
        try { const dir = await (await root.getDirectoryHandle(repo + '.git')).getDirectoryHandle(dirName); const out = []; for await (const [n] of dir.entries()) out.push(n); return JSON.stringify(out.sort()) === JSON.stringify(expected); } catch { return expected.length === 0; }
    }, { repo: REPO, dirName, expected }, { timeout: 15000 });
};
// Wait until the panel's session file says what we expect (session switches are async).
const waitForSession = (page, check) => page.waitForFunction(async ({ repo, check }) => {
    const root = await navigator.storage.getDirectory();
    try { const t = await (await (await (await root.getDirectoryHandle(repo + '.git')).getFileHandle('studioagent-session.json')).getFile()).text(); const d = JSON.parse(t); return new Function('d', 'return ' + check)(d); } catch { return false; }
}, { repo: REPO, check }, { timeout: 15000 });

test.describe('studio-agent performance mode (local repo)', () => {
    let mock;
    test.beforeEach(async ({ page }) => {
        mock = startMockAgentServer();
        await page.addInitScript((port) => { window.STUDIO_AGENT_PORT = port; }, mock.port());
    });
    test.afterEach(async ({ page }) => { await clearOPFS(page, REPO); await mock.close(); });

    test('sessions: /new archives into sessions/, /sessions lists, /resume swaps back; the performance checkbox switches by itself', async ({ page }) => {
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.goto(`http://localhost:8080/?gitrepo=${REPO}`);
        await waitForAppReady(page);
        await waitForStudioAgentTools(page);
        await mock.waitForClient();

        // A composition conversation: one message (the mock answers with a text and done).
        await typeIntoAgentChat(page, 'give me a beat');
        await mock.waitForChat(1);
        mock.send({ t: 'text', text: 'Beat is in.' }); mock.send({ t: 'done', subtype: 'success' });
        await waitForSession(page, "d.conversation.length === 2 && (d.label || 'composition') === 'composition'");
        const today = new Date().toISOString().slice(0, 10);

        // /new archives it under sessions/<date>-composition.json and starts fresh.
        await typeIntoAgentChat(page, '/new sketches');
        await waitForSession(page, "d.conversation.length === 0 && d.label === 'sketches'");
        await waitForRepoDir(page, 'sessions', [`${today}-composition.json`]);
        expect(JSON.parse(await readRepoFile(page, `sessions/${today}-composition.json`)).conversation.map((m) => m.text)).toEqual(['give me a beat', 'Beat is in.']);
        expect(mock.state.chats.length).toBe(1);   // commands never reach the server

        // /sessions lists the archive; /resume brings it back (archiving "sketches" — empty, so nothing written).
        await typeIntoAgentChat(page, '/sessions');
        // the listing reads every archived file through the git worker: poll for it
        await page.waitForFunction((needle) => {
            const app = document.querySelector('app-javascriptmusic');
            const roots = [app.shadowRoot, ...[...app.shadowRoot.querySelectorAll('*')].map((e) => e.shadowRoot).filter(Boolean)];
            for (const r of roots) { const l = r.getElementById && r.getElementById('studioagentlog'); if (l) return [...l.children].some((c) => c.textContent.includes(needle)); }
            return false;
        }, `${today}-composition: 2 messages, composition`, { timeout: 15000 });
        await typeIntoAgentChat(page, `/resume ${today}-composition`);
        await waitForSession(page, "d.conversation.length === 2 && d.label === 'composition'");

        // The performance checkbox: the composition session is archived, a fresh
        // "performance" session starts; off again, the composition comes back.
        await page.evaluate(() => { window.audioworkletnode = {}; window.sendSignal = () => true; window.togglePerformanceMode(true); });
        await waitForSession(page, "d.label === 'performance' && d.conversation.length === 0");
        await waitForRepoDir(page, 'sessions', [`${today}-composition.json`]);
        await page.evaluate(() => window.togglePerformanceMode(false));
        await waitForSession(page, "d.label === 'composition' && d.conversation.length === 2");
        // an empty performance session is not archived; a used one would be (next test)
        await waitForRepoDir(page, 'sessions', [`${today}-composition.json`]);
    });

    test('a part name or "next" is dispatched by the panel without a model; the rest is a producer turn on stage with kit, parts and state', async ({ page }) => {
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
        await waitForSession(page, "d.label === 'performance'");
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

        // Intent the panel cannot read: a PRODUCER turn on stage — mode, parts, state,
        // the kit, and the performance session (fresh: no sessionId).
        await typeIntoAgentChat(page, 'italo hats in the verse');
        const chat = await mock.waitForChat(1);
        expect(chat.mode).toBe('performance');
        expect(chat.parts.map((p) => p.name)).toEqual(['intro', 'verse', 'quiet breakdown', 'finale']);
        expect(chat.state).toContain('Now in "verse", looping until signal "go"');
        expect(typeof chat.kit).toBe('string');
        expect(chat.kit.length).toBeGreaterThan(100);   // the default kit: the repo has no AGENT.md
        expect(chat.sessionId).toBeNull();
        expect(chat.text).toBe('italo hats in the verse');
        mock.send({ t: 'text', text: 'Hats swapped, next round.' }); mock.send({ t: 'done', subtype: 'success', secs: 1.2 });
        await waitForSession(page, "d.label === 'performance' && d.conversation.length >= 2");

        // Off again: the performance session is archived (it has messages) and the
        // same text is a normal chat to the producer.
        await page.evaluate(() => window.togglePerformanceMode(false));
        await waitForSession(page, "(d.label || 'composition') === 'composition'");
        const today = new Date().toISOString().slice(0, 10);
        await waitForRepoDir(page, 'sessions', [`${today}-performance.json`]);
        const perf = JSON.parse(await readRepoFile(page, `sessions/${today}-performance.json`));
        expect(perf.conversation.map((m) => m.text)[0]).toBe('go to the quiet breakdown');
        await typeIntoAgentChat(page, 'next');
        const normal = await mock.waitForChat(2);
        expect(normal.mode).toBeUndefined();
        expect(normal.text).toBe('next');
    });
});
