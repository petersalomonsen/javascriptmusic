import { test, expect } from '@playwright/test';
import ws from 'ws';
import {
    NEAR_REPO_CONTRACT,
    setupServiceWorker,
    clearOPFS,
    waitForAppReady,
    pushBaseline,
} from './near-git-helpers.js';

// Studio-agent CLIENT tests with a MOCKED agent server (and thus a mocked
// model): the test process runs the WebSocket server the in-app client
// connects to, and plays the model's role by issuing tool_call messages.
// This exercises the real browser tool registry end-to-end — OPFS writes,
// Faust transpile, synth compile — without the Agent SDK or an API key.
//
// Motivated by a real session where the tools appeared to take minutes:
// compile deadlocked after a play→stop cycle (updateSynth awaited a
// `wasmloaded` reply from a TERMINATED audio worklet whose port is closed),
// and every queued tool behind it (even an in-memory grep_synth) "ran"
// forever. These tests pin down that agent-driven tool calls stay FAST.
//
// Requires the NEAR sandbox (`npm run near-sandbox`) — same prereq as
// near-git.spec.js.

const repoName = NEAR_REPO_CONTRACT + '.git';

const FAUST_SOURCE = `import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
process = os.sawtooth(freq) * gain * en.adsr(0.01, 0.1, 0.7, 0.2, gate) <: _, _;
`;

const SYNTH_MIX_SOURCE = (basename) => `// uses midichannels (route via midi.mix)
import { initializeMidiSynth, postprocess } from '../faust/${basename}';
export { initializeMidiSynth, postprocess };
`;

const SONG_SOURCE = `setBPM(120);

await createTrack(0).steps(4, [
    c4,, e4,, g4,, c5,,
]);

loopHere();
`;

// ---- the mock agent server --------------------------------------------------
// Speaks the same protocol as tools/studio-agent/server.mjs: sends tool_call,
// receives tool_started acks and tool_result replies.
function startMockAgentServer() {
    const wss = new ws.Server({ port: 0 });
    const state = { socket: null, nextId: 1, pending: new Map(), startedIds: new Set() };
    // The app navigates twice during setup (service-worker boot, then the
    // ?gitrepo= load), so the client connects twice — always track the newest
    // socket and forget it when it closes, and let callers WAIT for a live one.
    wss.on('connection', (socket) => {
        state.socket = socket;
        socket.on('close', () => { if (state.socket === socket) state.socket = null; });
        socket.on('message', (data) => {
            let msg;
            try { msg = JSON.parse(data.toString()); } catch { return; }
            if (msg.t === 'tool_result') {
                const p = state.pending.get(msg.id);
                if (p) { state.pending.delete(msg.id); p.resolve(msg); }
            } else if (msg.t === 'tool_started') {
                state.startedIds.add(msg.id);
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
    // Call a browser tool like the agent would; fails fast (default 30s) so a
    // deadlocked tool queue surfaces as a clear assertion, not a spec timeout.
    const callTool = (name, args, timeoutMs = 30000) => {
        const id = state.nextId++;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                state.pending.delete(id);
                reject(new Error(`tool ${name} (id ${id}) did not reply within ${timeoutMs / 1000}s — browser tool queue is stuck`));
            }, timeoutMs);
            state.pending.set(id, { resolve: (msg) => { clearTimeout(timer); resolve(msg); } });
            state.socket.send(JSON.stringify({ t: 'tool_call', id, name, args: args || {} }));
        });
    };
    return {
        wss, state, waitForClient, callTool,
        port: () => wss.address().port,
        close: () => new Promise((resolve) => wss.close(resolve)),
    };
}

// Timed tool call: returns { msg, secs }.
async function timedCall(mock, name, args, timeoutMs) {
    const t0 = Date.now();
    const msg = await mock.callTool(name, args, timeoutMs);
    return { msg, secs: (Date.now() - t0) / 1000 };
}

async function openAppWithMockAgent(page, mock) {
    // The client reads window.STUDIO_AGENT_PORT before connecting.
    await page.addInitScript((port) => { window.STUDIO_AGENT_PORT = port; }, mock.port());
    await page.goto('http://localhost:8080');
    await setupServiceWorker(page);
    await pushBaseline(page, repoName, SONG_SOURCE);
    await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
    await waitForAppReady(page);
    await mock.waitForClient();
}

test.describe('studio-agent client with mocked agent server', () => {
    let mock;

    test.beforeEach(() => { mock = startMockAgentServer(); });
    test.afterEach(async ({ page }) => {
        await clearOPFS(page, repoName);
        await mock.close();
    });

    test('faust edit → transpile → compile → grep all complete fast', async ({ page }) => {
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await openAppWithMockAgent(page, mock);

        // The model "edits the faust dsp": write_faust transpiles in-browser.
        const wf = await timedCall(mock, 'write_faust', { path: 'mockmaster', source: FAUST_SOURCE });
        expect(wf.msg.ok).toBe(true);
        expect(String(wf.msg.result)).toContain('transpiled OK');
        expect(wf.secs).toBeLessThan(30);

        expect((await mock.callTool('set_synth', { source: SYNTH_MIX_SOURCE('mockmaster') })).ok).toBe(true);
        expect((await mock.callTool('set_song', { source: SONG_SOURCE })).ok).toBe(true);

        // compile = the app's save path; must return promptly.
        const c = await timedCall(mock, 'compile', {});
        expect(c.msg.ok).toBe(true);
        expect(c.msg.result).toBe('compiled OK');
        expect(c.secs).toBeLessThan(20);

        // grep_synth is an in-memory regex — anything above a couple of
        // seconds means the tool queue is blocked by an earlier call.
        const g = await timedCall(mock, 'grep_synth', { pattern: 'initializeMidiSynth' });
        expect(g.msg.ok).toBe(true);
        expect(g.secs).toBeLessThan(3);

        // The client acks execution start for every call (the server's
        // queue-aware timeout depends on it).
        expect(mock.state.startedIds.size).toBeGreaterThanOrEqual(5);
    });

    test('compile after a play→stop cycle does not deadlock the tool queue', async ({ page }) => {
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await openAppWithMockAgent(page, mock);

        expect((await mock.callTool('write_faust', { path: 'mockmaster', source: FAUST_SOURCE })).ok).toBe(true);
        expect((await mock.callTool('set_synth', { source: SYNTH_MIX_SOURCE('mockmaster') })).ok).toBe(true);
        expect((await mock.callTool('set_song', { source: SONG_SOURCE })).ok).toBe(true);
        expect((await mock.callTool('compile', {})).result).toBe('compiled OK');

        // Start playback like the user does, then stop — stop terminates the
        // worklet processor (which closes its message port).
        await page.locator('#startaudiobutton').click();
        await page.waitForFunction(() => !!window.audioworkletnode, { timeout: 30000 });
        await page.locator('#stopaudiobutton').click();
        await page.waitForFunction(() => !window.audioworkletnode, { timeout: 10000 });

        // Change the instrument so the next compile produces a NEW synth wasm —
        // that's what routes the save through updateSynth (an unchanged synth
        // skips it, hiding the bug). Mirrors the real session: the user's .dsp
        // edit, then compile.
        expect((await mock.callTool('write_faust', {
            path: 'mockmaster',
            source: FAUST_SOURCE.replace('os.sawtooth(freq)', 'os.square(freq)'),
        })).ok).toBe(true);

        // Regression: this compile used to await a wasmloaded reply from the
        // terminated worklet forever, deadlocking every tool queued after it.
        const c = await timedCall(mock, 'compile', {});
        expect(c.msg.ok).toBe(true);
        expect(c.msg.result).toBe('compiled OK');
        expect(c.secs).toBeLessThan(20);

        // ...and the queue behind it stays responsive.
        const g = await timedCall(mock, 'grep_synth', { pattern: 'initializeMidiSynth' }, 10000);
        expect(g.msg.ok).toBe(true);
        expect(g.secs).toBeLessThan(3);

        // Saving must not have (re)started playback.
        expect(await page.evaluate(() => !!window.audioworkletnode)).toBe(false);
    });

    test('there is no play tool — the agent cannot start playback', async ({ page }) => {
        await openAppWithMockAgent(page, mock);
        const res = await mock.callTool('play', {});
        expect(res.ok).toBe(false);
        expect(String(res.result)).toContain('unknown tool');
        expect(await page.evaluate(() => !!window.audioworkletnode)).toBe(false);
    });
});
