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
const RECORDING_FILE = resolve(RECORDINGS_DIR, `nearai-${MODEL.replace(/[^a-zA-Z0-9.-]/g, '_')}-sawtooth-bass.json`);
const RECORD = process.env.RECORD_NEARAI === '1';

const PROMPT = 'make a simple sawtooth bass instrument on channel 0 and write a short bassline for it';

const SONG_SOURCE = `setBPM(120);

await createTrack(0).steps(4, [
    c3,, c3,, ds3,, c3,,
]);

loopHere();
`;

function readApiKey() {
    if (process.env.NEARAI_API_KEY) return process.env.NEARAI_API_KEY.trim();
    const keyFile = resolve(homedir(), '.nearai_api_key');
    if (existsSync(keyFile)) return readFileSync(keyFile, 'utf8').trim();
    return null;
}

test('real-model transcript: sawtooth bass via the browser agent loop', async ({ page }) => {
    test.setTimeout(RECORD ? 600000 : 180000);
    const apiKey = RECORD ? readApiKey() : 'replay-key';
    if (RECORD && !apiKey) test.skip(true, 'RECORD_NEARAI=1 but no API key in $NEARAI_API_KEY or ~/.nearai_api_key');
    if (!RECORD && !existsSync(RECORDING_FILE)) test.skip(true, `no recording for ${MODEL} — run RECORD_NEARAI=1 with an API key first`);

    page.on('pageerror', (e) => console.log('[browser-error]', e.message));

    const recording = RECORD ? [] : JSON.parse(readFileSync(RECORDING_FILE, 'utf8'));
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
    await page.evaluate(() => window.toggleStudioAgent(true));

    const initialSynth = await page.evaluate(() => document.querySelector('app-javascriptmusic')
        .shadowRoot.querySelector('#assemblyscripteditor .CodeMirror').CodeMirror.getValue());

    await page.locator('#studioagentinput').fill(PROMPT);
    await page.locator('#studioagentinput').press('Enter');

    // Turn completion = send button re-enabled ("…" while busy).
    await expect(page.locator('#studioagentsend')).toHaveText('Send', { timeout: RECORD ? 540000 : 120000 });

    const log = await page.locator('#studioagentlog').innerText();
    console.log('--- transcript tail ---\n' + log.split('\n').slice(-14).join('\n'));

    // Behavioral assertions — hold for any sane model transcript:
    expect(log).not.toContain('⚠');                         // no errors surfaced
    expect(log).toMatch(/⚙ (write_faust|set_synth|edit_synth)/); // it built an instrument
    const synth = await page.evaluate(() => document.querySelector('app-javascriptmusic')
        .shadowRoot.querySelector('#assemblyscripteditor .CodeMirror').CodeMirror.getValue());
    expect(synth).not.toBe(initialSynth);                    // the synth actually changed

    if (RECORD) {
        mkdirSync(RECORDINGS_DIR, { recursive: true });
        // Slim the fixture: the system prompt (22k chars, recoverable from
        // studio-agent-prompt.js) rides in EVERY request — strip it; replay
        // only needs the responses, requests are kept for debugging.
        const slim = recording.map((r) => ({
            request: { model: r.request.model, messages: r.request.messages.filter((m) => m.role !== 'system') },
            response: r.response,
        }));
        writeFileSync(RECORDING_FILE, JSON.stringify(slim, null, 1));
        const written = readFileSync(RECORDING_FILE, 'utf8');
        expect(written).not.toContain(apiKey); // key must never enter the fixture
        console.log(`recorded ${recording.length} round-trips → ${RECORDING_FILE} (${Math.round(written.length / 1024)}kB)`);
    }

    await clearOPFS(page, repoName);
});
