import { test, expect } from '@playwright/test';
import ws from 'ws';
import {
    NEAR_REPO_CONTRACT,
    setupServiceWorker,
    clearOPFS,
    waitForAppReady,
    waitForStudioAgentTools,
    pushBaseline,
    specRepo,
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

// One BAR: eight slots at two steps per beat. A fixture that does not land on a
// bar line makes compile report the mismatch, and these tests want compile's
// result to be exactly "compiled OK" so a spurious warning would show up here.
const SONG_SOURCE = `setBPM(120);

await createTrack(0).steps(2, [
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

    test('shader tools: the agent can see and fix a shader that cannot show the song visuals', async ({ page }) => {
        await openAppWithMockAgent(page, mock);

        // A song that shows text, and a shader with no text layer — the
        // combination that silently renders nothing.
        expect((await mock.callTool('set_song', {
            source: `setBPM(120);\nshowText('hello', { fade: 1 });\nawait createTrack(0).steps(4, [c4,,,,]);\nloopHere();\n`,
        })).ok).toBe(true);
        const noTextLayer = `precision highp float;
uniform vec2 resolution;
uniform float time;
void main() { gl_FragColor = vec4(gl_FragCoord.xy / resolution, abs(sin(time)), 1.0); }
`;
        const set = await mock.callTool('set_shader', { source: noTextLayer });
        expect(set.ok).toBe(true);
        // Every shader write reports what the song schedules but this shader can't show.
        expect(String(set.result)).toContain('uText');

        expect((await mock.callTool('compile', {})).result).toContain('compiled OK');
        // ...and so does compile, so the agent cannot miss it.
        expect(String((await mock.callTool('compile', {})).result)).toContain('showText');

        // grep_shader is how the agent inspects what the shader supports.
        const grep = await mock.callTool('grep_shader', { pattern: 'uniform' });
        expect(grep.ok).toBe(true);
        expect(String(grep.result)).toContain('uniform vec2 resolution');

        // edit_shader adds the text layer in place; the warning then clears.
        const edit = await mock.callTool('edit_shader', {
            old_string: 'uniform float time;',
            new_string: `uniform float time;
uniform sampler2D uText;
uniform sampler2D uTextPrev;
uniform float uTextMix;`,
        });
        expect(edit.ok).toBe(true);
        expect(String(edit.result)).toContain('applied 1 edit');
        expect(String(edit.result)).not.toContain('uText;'); // no warning left

        const shader = await mock.callTool('get_shader', {});
        expect(String(shader.result)).toContain('uniform sampler2D uTextPrev;');
        expect(String((await mock.callTool('compile', {})).result)).not.toContain('showText');
    });

    test('there is no play tool — the agent cannot start playback', async ({ page }) => {
        await openAppWithMockAgent(page, mock);
        const res = await mock.callTool('play', {});
        expect(res.ok).toBe(false);
        expect(String(res.result)).toContain('unknown tool');
        expect(await page.evaluate(() => !!window.audioworkletnode)).toBe(false);
    });
});

// ---- run_script -------------------------------------------------------------
// The agent's "shell": a snippet in the QuickJS song sandbox over the document
// text, writing back through the opt-in host function. The unit tests cover
// the sandbox in Node; this pins the BROWSER path — quickjs-wasm from the CDN,
// the editors as the write target, the tool queue surviving an interrupted
// script. Its own local repo, so no NEAR sandbox is needed.

const SCRIPT_REPO = specRepo('studio-agent-run-script');

// A song with a recorded take exactly as the recorder writes it (one row per
// note, chords as consecutive rows at nearly the same beat), between record
// markers, with the rest of the song around it.
const TAKE_SONG = `setBPM(125);
const pad = createTrack(1, 4);
startRecording();
createTrack(2).play([[ 0.60, f7(0.56, 79) ],
[ 0.07, f5(1.58, 69) ],
[ 0.08, d5(1.57, 63) ],
[ 0.07, a5(1.60, 78) ],
[ 1.49, c7(0.50, 98) ]]);
stopRecording();
await waitDuration(4);
loopHere();
`;

// The prompt's own worked example: chords to the pad an octave up on the
// 2-beat grid, melody quantized to 16ths, velocities and durations kept.
const SPLIT_SCRIPT = `
const take = findPlayBlocks(song).find(b => b.track === 'createTrack(2)');
const groups = groupByBeat(take.notes, 0.1);
const chords = groups.filter(g => g.length > 1).flat()
  .map(n => ({ ...n, note: n.note + 12, beat: quantizeBeat(n.beat, 0.5) }));
const melody = groups.filter(g => g.length === 1).flat()
  .map(n => ({ ...n, beat: quantizeBeat(n.beat, 4) }));
const replacement = 'pad.play([\\n' + formatNotes(chords, { chords: true }) + ']);\\n'
  + 'createTrack(2).play([\\n' + formatNotes(melody) + '])';
await setSong(song.slice(0, take.start) + replacement + song.slice(take.end));
print(take.notes.length + ' notes: ' + chords.length + ' chord notes to pad (+12), ' + melody.length + ' melody notes quantized');
`;

test.describe('studio-agent run_script (local repo)', () => {
    let mock;

    test.beforeEach(() => { mock = startMockAgentServer(); });
    test.afterEach(async ({ page }) => {
        await clearOPFS(page, SCRIPT_REPO);
        await mock.close();
    });

    test('a recorded take is split in the sandbox and written back, the notes never leaving the browser', async ({ page }) => {
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.addInitScript((port) => { window.STUDIO_AGENT_PORT = port; }, mock.port());
        await page.goto(`http://localhost:8080/?gitrepo=${SCRIPT_REPO}`);
        await waitForAppReady(page);
        await waitForStudioAgentTools(page);
        await mock.waitForClient();

        expect((await mock.callTool('set_song', { source: TAKE_SONG })).ok).toBe(true);

        const run = await timedCall(mock, 'run_script', { code: SPLIT_SCRIPT });
        expect(run.msg.ok).toBe(true);
        expect(run.secs).toBeLessThan(15);
        // The tool result is the script's own report plus what was written —
        // not the notes.
        expect(String(run.msg.result)).toContain('5 notes: 3 chord notes to pad (+12), 2 melody notes quantized');
        expect(String(run.msg.result)).toContain('song updated (12 → 12 lines)');
        expect(String(run.msg.result)).not.toContain('f6(1.58');

        const song = String((await mock.callTool('get_song', {})).result);
        // chords: pad, an octave up, on the grid, played order and velocities kept
        expect(song).toContain('pad.play([\n[ 0.00, f6(1.58, 69), a6(1.60, 78), d6(1.57, 63) ]]);');
        // melody: same channel, quantized, velocities kept
        expect(song).toContain('createTrack(2).play([\n[ 0.50, f7(0.56, 79) ],\n[ 1.50, c7(0.50, 98) ]]);');
        expect(song).not.toContain('f5(1.58');
        // everything around the take survived the splice
        expect(song).toMatch(/^setBPM\(125\);\nconst pad = createTrack\(1, 4\);\nstartRecording\(\);\n/);
        expect(song).toMatch(/\nstopRecording\(\);\nawait waitDuration\(4\);\nloopHere\(\);\n$/);

        // A script with no write callback path: reading only.
        const read = await mock.callTool('run_script', { code: `return findPlayBlocks(song).map(b => b.track + ':' + b.notes.length);` });
        expect(read.ok).toBe(true);
        expect(String(read.result)).toBe('returned: ["pad:3","createTrack(2):2"]');

        // A broken script fails the tool with the error, and the document is untouched.
        const bad = await mock.callTool('run_script', { code: `print('x'); nope();` });
        expect(bad.ok).toBe(false);
        expect(String(bad.result)).toMatch(/^x\nERROR: .*nope/);
        expect(String((await mock.callTool('get_song', {})).result)).toBe(song);
    });

    test('a runaway script is interrupted and the tool queue stays responsive', async ({ page }) => {
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.addInitScript((port) => { window.STUDIO_AGENT_PORT = port; }, mock.port());
        await page.goto(`http://localhost:8080/?gitrepo=${SCRIPT_REPO}`);
        await waitForAppReady(page);
        await waitForStudioAgentTools(page);
        await mock.waitForClient();

        expect((await mock.callTool('set_song', { source: TAKE_SONG })).ok).toBe(true);
        const loop = await timedCall(mock, 'run_script', { code: `await setSong(song + '// touched\\n'); while (true) {}` }, 60000);
        expect(loop.msg.ok).toBe(false);
        expect(String(loop.msg.result)).toContain('did not finish within 20s');
        expect(String(loop.msg.result)).toContain('song updated'); // the write before the loop stands
        expect(loop.secs).toBeGreaterThan(15);
        expect(loop.secs).toBeLessThan(40);

        const g = await timedCall(mock, 'grep_song', { pattern: 'touched' }, 10000);
        expect(g.msg.ok).toBe(true);
        expect(String(g.msg.result)).toContain('// touched');
        expect(g.secs).toBeLessThan(3);
    });
});
