import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    NEAR_REPO_CONTRACT,
    setupServiceWorker,
    clearOPFS,
    waitForAppReady,
    pushBaseline,
} from './near-git-helpers.js';

// Record/replay harness for the NEAR AI serverless provider with a REAL model.
//
// RECORD mode (needs a NEAR AI API key; never run on CI):
//   RECORD_NEARAI=1 npx playwright test e2e/studio-agent-nearai-live.spec.js
//   The key is read from $NEARAI_API_KEY or ~/.nearai_api_key — it is sent
//   only as a request header and is NEVER written into the recording.
//   Each chat/completions round-trip is captured to e2e/recordings/.
//
// REPLAY mode (default, key-free, deterministic — this is what CI runs):
//   The recorded responses are served back through the same route mock while
//   the REAL app executes the real tools the model asked for. Assertions are
//   behavioral (tools ran, no errors, turn completed) so a re-recording with
//   a different-but-sane model transcript still passes.
//
// Requires the NEAR sandbox (`npm run near-sandbox`) — the model authors
// Faust instruments, which needs the OPFS git working tree (?gitrepo mode).

const repoName = NEAR_REPO_CONTRACT + '.git';
const __dirname = dirname(fileURLToPath(import.meta.url));
const RECORDINGS_DIR = resolve(__dirname, 'recordings');
const MODEL = process.env.NEARAI_MODEL || 'Qwen/Qwen3.5-122B-A10B';
const RECORD = process.env.RECORD_NEARAI === '1';

const SONG_SOURCE = `setBPM(120);

await createTrack(0).steps(4, [
    c3,, c3,, ds3,, c3,,
]);

loopHere();
`;

// freq/gate/gain ONLY — no extra sliders, so the transpiler generates the
// voice class `Sawbass` but NO `SawbassChannel`.
const SIMPLE_SAWBASS_DSP = `import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
process = os.sawtooth(freq) * gain * en.adsr(0.01, 0.1, 0.7, 0.2, gate) <: _, _;
`;

// Deterministic pre-turn synth: the sandbox git repo is SHARED across the
// whole e2e run, so without this the synth editor contains whatever an
// earlier spec pushed — and the recorded transcript's edit anchors miss.
const BASELINE_SYNTH = `// uses midichannels (route via midi.mix)
import { midichannels, MidiChannel } from '../mixes/globalimports';

export function initializeMidiSynth(): void {
}
export function postprocess(): void {}
`;

// The app's most recurring agent mistake: importing a Channel class the
// transpiler never generated → ERROR TS2305 at compile.
const BROKEN_SYNTH = `import { midichannels, MidiChannel } from '../mixes/globalimports';
import { Sawbass, SawbassChannel } from '../faust/sawbass';

export function initializeMidiSynth(): void {
    midichannels[0] = new SawbassChannel(8, (channel: MidiChannel) => new Sawbass(channel));
}
export function postprocess(): void {}
`;

function readApiKey() {
    if (process.env.NEARAI_API_KEY) return process.env.NEARAI_API_KEY.trim();
    const keyFile = resolve(homedir(), '.nearai_api_key');
    if (existsSync(keyFile)) return readFileSync(keyFile, 'utf8').trim();
    return null;
}

const recordingFile = (scenario) =>
    resolve(RECORDINGS_DIR, `nearai-${MODEL.replace(/[^a-zA-Z0-9.-]/g, '_')}-${scenario}.json`);

const getSynthText = (page) => page.evaluate(() => document.querySelector('app-javascriptmusic')
    .shadowRoot.querySelector('#assemblyscripteditor .CodeMirror').CodeMirror.getValue());

// Shared per-scenario setup: skip logic, route record/replay, app boot.
// Returns null when the test was skipped.
async function setupScenario(page, scenario) {
    const apiKey = RECORD ? readApiKey() : 'replay-key';
    if (RECORD && !apiKey) test.skip(true, 'RECORD_NEARAI=1 but no API key in $NEARAI_API_KEY or ~/.nearai_api_key');
    if (!RECORD && !existsSync(recordingFile(scenario))) test.skip(true, `no recording for ${MODEL}/${scenario} — run RECORD_NEARAI=1 with an API key first`);

    page.on('pageerror', (e) => console.log('[browser-error]', e.message));

    const recording = RECORD ? [] : JSON.parse(readFileSync(recordingFile(scenario), 'utf8'));
    let replayIndex = 0;
    await page.route('https://cloud-api.near.ai/**', async (route) => {
        if (RECORD) {
            const response = await route.fetch(); // real API — key rides in the header only
            const body = await response.json();
            recording.push({ request: route.request().postDataJSON(), response: body });
            await route.fulfill({ json: body });
        } else {
            if (replayIndex >= recording.length) throw new Error('replay exhausted: browser made more requests than recorded');
            await route.fulfill({ json: recording[replayIndex++].response });
        }
    });

    // Provider config straight into localStorage (the /nearai command path is
    // covered by studio-agent-nearai.spec.js).
    await page.addInitScript(([key, model]) => {
        localStorage.setItem('nearai-api-key', key);
        localStorage.setItem('nearai-model', model);
    }, [apiKey, MODEL]);

    await page.goto('http://localhost:8080');
    await setupServiceWorker(page);
    await pushBaseline(page, repoName, SONG_SOURCE);
    await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
    await waitForAppReady(page);
    // waitForAppReady is satisfied at the end of initEditor, but
    // initStudioAgent (which defines toggleStudioAgent) runs AFTER it —
    // on slow CI the gap is real.
    await page.waitForFunction(() => typeof window.toggleStudioAgent === 'function', { timeout: 30000 });
    await page.evaluate(() => window.toggleStudioAgent(true));

    // Same starting synth in record AND replay, regardless of what earlier
    // specs left in the shared sandbox repo.
    await page.evaluate((source) =>
        window.studioAgentRunTool('set_synth', { source }), BASELINE_SYNTH);

    return { apiKey, recording };
}

// Run one chat turn and wait for completion (send button re-enabled).
async function runTurn(page, prompt) {
    await page.locator('#studioagentinput').fill(prompt);
    await page.locator('#studioagentinput').press('Enter');
    await expect(page.locator('#studioagentsend')).toHaveText('Send', { timeout: RECORD ? 540000 : 120000 });
    const log = await page.locator('#studioagentlog').innerText();
    console.log('--- transcript tail ---\n' + log.split('\n').slice(-14).join('\n'));
    return log;
}

function saveRecording(scenario, recording, apiKey) {
    if (!RECORD) return;
    mkdirSync(RECORDINGS_DIR, { recursive: true });
    // Slim the fixture: the system prompt (22k chars, recoverable from
    // studio-agent-prompt.js) rides in EVERY request — strip it; replay
    // only needs the responses, requests are kept for debugging.
    const slim = recording.map((r) => ({
        request: { model: r.request.model, messages: r.request.messages.filter((m) => m.role !== 'system') },
        response: r.response,
    }));
    writeFileSync(recordingFile(scenario), JSON.stringify(slim, null, 1));
    const written = readFileSync(recordingFile(scenario), 'utf8');
    expect(written).not.toContain(apiKey); // key must never enter the fixture
    console.log(`recorded ${recording.length} round-trips → ${recordingFile(scenario)} (${Math.round(written.length / 1024)}kB)`);
}

test('real-model transcript: sawtooth bass via the browser agent loop', async ({ page }) => {
    test.setTimeout(RECORD ? 600000 : 180000);
    const ctx = await setupScenario(page, 'sawtooth-bass');

    const initialSynth = await getSynthText(page);
    const log = await runTurn(page, 'make a simple sawtooth bass instrument on channel 0 and write a short bassline for it');

    // Behavioral assertions — hold for any sane model transcript:
    expect(log).not.toContain('⚠');                         // no errors surfaced
    expect(log).toMatch(/⚙ (write_faust|set_synth|edit_synth)/); // it built an instrument
    expect(await getSynthText(page)).not.toBe(initialSynth); // the synth actually changed

    saveRecording('sawtooth-bass', ctx.recording, ctx.apiKey);
    await clearOPFS(page, repoName);
});

test('real-model transcript: compile error (TS2305) is diagnosed and fixed', async ({ page }) => {
    test.setTimeout(RECORD ? 600000 : 180000);
    const ctx = await setupScenario(page, 'fix-compile-error');

    // Construct the broken state deterministically with the studio tools:
    // a .dsp that generates NO Channel class + a synth importing one anyway.
    const wf = await page.evaluate((source) =>
        window.studioAgentRunTool('write_faust', { path: 'sawbass', source }), SIMPLE_SAWBASS_DSP);
    expect(String(wf)).toContain('transpiled OK');
    // Precondition: the transpiler generated NO Channel class (the hint says so).
    expect(String(wf)).toContain('no SawbassChannel was generated');
    await page.evaluate((source) =>
        window.studioAgentRunTool('set_synth', { source }), BROKEN_SYNTH);
    // Precondition: this really is the TS2305 broken state.
    const brokenCompile = await page.evaluate(() => window.studioAgentRunTool('compile'));
    expect(String(brokenCompile.__error || brokenCompile)).toContain('TS2305');

    const log = await runTurn(page, 'the synth does not compile — find the error and fix it');

    // The model must have compiled (seeing the error) and edited the synth.
    expect(log).toMatch(/⚙ compile/);
    expect(log).toMatch(/⚙ (edit_synth|set_synth)/);
    expect(log).not.toContain('⚠'); // the agent loop itself never errored
    // The fix: no more ungenerated Channel import, and the synth compiles.
    const fixedSynth = await getSynthText(page);
    expect(fixedSynth).not.toContain('SawbassChannel');
    const finalCompile = await page.evaluate(() => window.studioAgentRunTool('compile'));
    expect(String(finalCompile)).toContain('compiled OK');

    saveRecording('fix-compile-error', ctx.recording, ctx.apiKey);
    await clearOPFS(page, repoName);
});
