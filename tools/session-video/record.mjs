// Record a vertical (9:16) video of a real studio-agent session.
//
// How it works
// ------------
// A mock WebSocket server plays the agent's role, speaking the same protocol as
// tools/studio-agent/server.mjs. The prose is scripted (see cuts/), but the
// TOOL CALLS ARE THE REAL ONES, replayed with their original arguments from the
// session log — so every edit, transpile and compile genuinely happens in the
// browser, and the audio in the video is the actual synth output.
//
// Video + audio are captured by a SINGLE MediaRecorder: tab-capture video plus
// a MediaStreamAudioDestinationNode tapped off the live audio worklet. One
// container, one clock — no A/V sync correction needed.
//
// Requires a headed browser: getDisplayMedia is NotSupportedError in headless.
//
//   node tools/session-video/record.mjs [--cut cuts/x.mjs] [--beats 0,1] [--out x.mp4]

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');

// playwright and ws are dev-dependencies of wasmaudioworklet; resolve them from
// there no matter where this script is run from (same approach as shadertest).
const WAW = path.resolve(HERE, '../../wasmaudioworklet');
let chromium, ws;
try {
    const req = createRequire(path.join(WAW, 'package.json'));
    chromium = req('playwright').chromium;
    ws = req('ws');
} catch {
    try { ({ chromium } = await import('playwright')); ws = (await import('ws')).default; }
    catch {
        console.error('Could not load playwright/ws. Install deps once:  (cd wasmaudioworklet && npm install)');
        process.exit(2);
    }
}

const argv = process.argv.slice(2);
const argOf = (name, dflt) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : dflt;
};

// The CUT is the per-video data: which session log, which prompts, which tool
// calls, in which order. The recorder itself knows nothing about any particular
// session — a new video is a new file in cuts/, not a change in here.
// A relative --cut is resolved against this directory first (so
// `--cut cuts/x.mjs` works from anywhere), then against the cwd.
const cutArg = argOf('--cut', 'cuts/chords-to-full-track.mjs');
const CUT_PATH = [
    path.resolve(HERE, cutArg),
    path.resolve(process.cwd(), cutArg),
].find((p) => fs.existsSync(p)) ?? path.resolve(process.cwd(), cutArg);
const cut = await import(CUT_PATH).catch((e) => {
    console.error(`Could not load cut ${CUT_PATH}: ${e.message}`);
    process.exit(2);
});
const { BEATS, SESSION_LOG } = cut;
if (!Array.isArray(BEATS) || !SESSION_LOG) {
    console.error(`${CUT_PATH} must export BEATS (array) and SESSION_LOG (path relative to the repo root)`);
    process.exit(2);
}
// Which document the viewer should be looking at while a tool runs. A cut can
// override this, but the sensible mapping is a property of the tools, not the cut.
const VIEW_FOR_TOOL = cut.VIEW_FOR_TOOL ?? {
    edit_song: 'song', set_song: 'song',
    edit_synth: 'synth', set_synth: 'synth',
    write_faust: 'faust',
};

const OUTDIR = argOf('--outdir', path.join(HERE, 'out'));
const ONLY_BEATS = argOf('--beats', null)?.split(',').map(Number) ?? null;
const APP_URL = argOf('--url', 'http://localhost:8080/?defaultrepo=1');

fs.mkdirSync(OUTDIR, { recursive: true });
const slug = path.basename(CUT_PATH, '.mjs');
const RAW = path.join(OUTDIR, `${slug}.webm`);
const MP4 = argOf('--out', path.join(OUTDIR, `${slug}.mp4`));

const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

// ---- the session log: real tool calls, indexed by ordinal --------------------
function loadTools() {
    const lines = fs.readFileSync(path.join(REPO, SESSION_LOG), 'utf8')
        .trim().split('\n').map((l) => JSON.parse(l));
    const tools = [];
    let ord = 0;
    for (const o of lines) {
        if (o.kind !== 'tool_use') continue;
        tools[ord] = { ord, name: o.name.replace('mcp__studio__', ''), args: o.input };
        ord++;
    }
    // The song the session started from is whatever get_song first returned —
    // which only works if the session opened by reading an existing song. A cut
    // whose session started from an empty repo states START_SONG itself.
    const gi = lines.findIndex((o) => o.kind === 'tool_use' && o.name === 'mcp__studio__get_song');
    const startSong = gi < 0 ? '' : (lines.slice(gi + 1).find((o) => o.kind === 'tool_result')?.text ?? '');
    return { tools, startSong };
}

// ---- mock agent server ------------------------------------------------------
function startMockServer() {
    const wss = new ws.Server({ port: 0 });
    const state = { socket: null, nextId: 1, pending: new Map() };
    wss.on('connection', (socket) => {
        state.socket = socket;
        socket.on('close', () => { if (state.socket === socket) state.socket = null; });
        socket.on('message', (data) => {
            let msg; try { msg = JSON.parse(data.toString()); } catch { return; }
            if (msg.t === 'tool_result') {
                const p = state.pending.get(msg.id);
                if (p) { state.pending.delete(msg.id); p(msg); }
            }
        });
    });
    const send = (obj) => state.socket?.send(JSON.stringify(obj));
    const waitForClient = async (timeoutMs = 30000) => {
        const t0 = Date.now();
        while (!(state.socket && state.socket.readyState === 1)) {
            if (Date.now() - t0 > timeoutMs) throw new Error('studio-agent client never connected');
            await sleep(100);
        }
    };
    const callTool = (name, args, timeoutMs = 180000) => new Promise((resolve, reject) => {
        const id = state.nextId++;
        const timer = setTimeout(() => {
            state.pending.delete(id);
            reject(new Error(`tool ${name} (#${id}) timed out after ${timeoutMs / 1000}s`));
        }, timeoutMs);
        state.pending.set(id, (msg) => { clearTimeout(timer); resolve(msg); });
        send({ t: 'tool_call', id, name, args: args || {} });
    });
    return { send, waitForClient, callTool, port: () => wss.address().port, close: () => wss.close() };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- in-page helpers --------------------------------------------------------
const SR = `document.querySelector('app-javascriptmusic').shadowRoot`;

async function showOnly(page, view) {
    await page.evaluate((v) => {
        const sr = document.querySelector('app-javascriptmusic').shadowRoot;
        const set = (id, cbId, on) => {
            window.toggleEditors(id, on);
            const cb = sr.getElementById(cbId);
            if (cb) cb.checked = on;
        };
        const agentOn = v === 'agent';
        window.toggleStudioAgent(agentOn);
        const acb = sr.getElementById('studioagenttogglecheckbox');
        if (acb) acb.checked = agentOn;
        set('editor', 'songeditortogglecheckbox', v === 'song');
        set('assemblyscripteditor', 'syntheditortogglecheckbox', v === 'synth');
        set('fausteditor', 'fausteditortogglecheckbox', v === 'faust');
    }, view);
}

// The toolbar was built for a desktop width; at 432px the labels clip mid-word.
// Recording-only cosmetics — nothing here changes app behaviour.
const RECORDING_CSS = `
  /* Strip the toolbar down to transport + the document toggles: at 432px the
     rest wraps into an unreadable pile. Nothing here changes behaviour. */
  #vkeyboardinputelement,
  #exportbutton,
  wasmgit-ui,
  .toolbar label:has(#midichannelmappingselection),
  .toolbar label[title="toggle sequencer"],
  .toolbar label[title="toggle screen and audio capture"],
  .toolbar label[title="toggle visualizer"],
  .toolbar label[title^="optimize"] { display: none !important; }
  .toolbar { white-space: nowrap; }
  .subtoolbar label span { font-size: 13px; }
  /* Full width, not 90vw — the leftover strip of a hidden editor just looks broken. */
  #studioagentpanel { width: 100% !important; max-width: 100% !important; }
  .sa-log { font-size: 15px; line-height: 1.5; }
  .sa-msg-user { color: #9ecbff; font-weight: bold; }
  /* 13px keeps trailing // comments on screen at 432px instead of clipping them. */
  .CodeMirror { font-size: 13px !important; }
`;

async function streamText(mock, text, msPerChunk = 14, chunk = 3) {
    for (let i = 0; i < text.length; i += chunk) {
        mock.send({ t: 'text', text: text.slice(i, i + chunk) });
        await sleep(msPerChunk);
    }
}

// ---- main -------------------------------------------------------------------
const { tools, startSong: songFromLog } = loadTools();
// A cut may state the starting song itself: `null` keeps whatever the app boots
// with, which is what a session that began from an EMPTY repo started from.
const startSong = 'START_SONG' in cut ? cut.START_SONG : songFromLog;
if (startSong === undefined || (startSong === '' && !('START_SONG' in cut))) {
    throw new Error('could not recover the starting song from the session log — '
        + 'set START_SONG in the cut (null keeps the app default)');
}
// Session logs cap tool results at 1000 chars, so a longer starting song comes
// back mangled and would seed a syntax error rather than a song.
if (startSong && /…\[\+\d+ chars\]$/.test(startSong.trimEnd())) {
    throw new Error('the starting song recovered from the session log is TRUNCATED — '
        + 'set START_SONG in the cut with the real source');
}
log(`loaded ${tools.filter(Boolean).length} tool calls; starting song `
    + (startSong ? `${startSong.length} bytes` : '(app default)'));

const mock = startMockServer();
log('mock agent server on port', mock.port());

const browser = await chromium.launch({
    headless: false, // getDisplayMedia is unavailable headless
    args: [
        '--autoplay-policy=no-user-gesture-required',
        '--auto-accept-this-tab-capture',
    ],
});
// 432x768 CSS px @ 2.5 = 1080x1920 device px = 9:16
const context = await browser.newContext({
    viewport: { width: 432, height: 768 },
    deviceScaleFactor: 2.5,
});
const page = await context.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('  [page]', m.text().slice(0, 200)); });
page.on('pageerror', (e) => console.log('  [pageerror]', e.message.slice(0, 200)));

await page.addInitScript((port) => { window.STUDIO_AGENT_PORT = port; }, mock.port());
await page.goto(APP_URL);
await page.waitForFunction(() => {
    const app = document.querySelector('app-javascriptmusic');
    if (!app?.shadowRoot) return false;
    return !!app.shadowRoot.querySelector('#editor .CodeMirror')
        && !!app.shadowRoot.querySelector('#assemblyscripteditor .CodeMirror')
        && !!app.shadowRoot.querySelector('wasmgit-ui');
}, { timeout: 120000 });
log('app ready');

await page.evaluate((css) => {
    const sr = document.querySelector('app-javascriptmusic').shadowRoot;
    const s = document.createElement('style');
    s.textContent = css;
    sr.appendChild(s);
}, RECORDING_CSS);

// Seed the exact song the session started from, unless the cut says the session
// began from the app's own default (an empty repo).
if (startSong) {
    await page.evaluate((text) => {
        document.querySelector('app-javascriptmusic').shadowRoot
            .querySelector('#editor .CodeMirror').CodeMirror.setValue(text);
    }, startSong);
    log('seeded starting song');
} else {
    log('no starting song seeded — using the app default');
}

await mock.waitForClient();
log('agent client connected');

// Start playback — the video opens on the "wrong" arpeggiated version playing.
await page.evaluate(() => {
    document.querySelector('app-javascriptmusic').shadowRoot.getElementById('startaudiobutton').click();
});
await page.waitForFunction(() => !!window.audioworkletnode, { timeout: 180000 });
await page.waitForFunction(() => window.WASM_SYNTH_BYTES != null, { timeout: 180000 });
log('audio running');
// The audio graph has to be live before capture can tap it, but the SEQUENCER
// does not. A cut that opens on an empty project pauses it here and starts the
// transport from a beat, so the video does not open on the default song.
if (cut.START_PAUSED) {
    await page.evaluate(() => {
        window.toggleSongPlay(false);
        const box = document.querySelector('app-javascriptmusic').shadowRoot
            .getElementById('toggleSongPlayCheckbox');
        if (box) box.checked = false;
    });
    log('sequencer paused — waiting for a beat to exist');
}
await sleep(2000);

// ---- start capture: tab video + synth audio into ONE recorder ---------------
const capture = await page.evaluate(async () => {
    const vstream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 }, audio: false, preferCurrentTab: true,
    });
    const node = window.audioworkletnode;
    const ctx = node.context;
    if (ctx.state === 'suspended') await ctx.resume();
    const dest = ctx.createMediaStreamDestination();
    node.connect(dest);
    const mixed = new MediaStream([...vstream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
    window.__chunks = [];
    const rec = new MediaRecorder(mixed, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 6_000_000,
        audioBitsPerSecond: 192_000,
    });
    rec.ondataavailable = (e) => { if (e.data.size) window.__chunks.push(e.data); };
    window.__rec = rec;
    rec.start(2000); // emit every 2s so Node can drain instead of hoarding
    return vstream.getVideoTracks()[0].getSettings();
});
log('capturing', `${capture.width}x${capture.height} @${capture.frameRate}fps`);

fs.writeFileSync(RAW, Buffer.alloc(0));
let draining = false;
const drain = async () => {
    if (draining) return;
    draining = true;
    try {
        const b64 = await page.evaluate(async () => {
            const chunks = window.__chunks.splice(0, window.__chunks.length);
            if (!chunks.length) return '';
            const buf = new Uint8Array(await new Blob(chunks).arrayBuffer());
            let s = '';
            for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
            return btoa(s);
        });
        if (b64) fs.appendFileSync(RAW, Buffer.from(b64, 'base64'));
    } catch (e) { log('drain error (continuing):', e.message.slice(0, 120)); }
    draining = false;
};
const drainTimer = setInterval(drain, 5000);

// ---- replay the session ------------------------------------------------------
// At 432px only ONE thing fits on screen at a time — either a single editor or
// the agent chat, never both. showOnly() enforces that; `null` here so the very
// first setView actually applies it (the app boots with song+synth side by side).
let currentView = null;
const setView = async (v) => { if (v !== currentView) { await showOnly(page, v); currentView = v; } };

// `quick` runs the call without the deliberate look-at-the-code pauses — for a
// jump cut, where the point is the RESULT rather than watching each edit land.
async function runTool(ord, { quick = false } = {}) {
    const t = tools[ord];
    if (!t) throw new Error(`no tool #${ord} in the log`);
    if (quick) {
        mock.send({ t: 'tool', name: t.name });
        const res = await mock.callTool(t.name, t.args);
        log(`  #${ord} ${t.name} → ${res.ok ? 'ok' : 'ERROR'} (quick)`);
        return res;
    }
    // Watch the document being edited; stay put through the compile that applies it.
    const want = VIEW_FOR_TOOL[t.name];
    if (want) { await setView(want); await sleep(600); }
    else if (t.name !== 'compile') { await setView('agent'); }

    mock.send({ t: 'tool', name: t.name });
    const t0 = Date.now();
    const res = await mock.callTool(t.name, t.args);
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    log(`  #${ord} ${t.name} → ${res.ok ? 'ok' : 'ERROR'} (${secs}s)`);
    if (want) await sleep(1400); // let the edit be read on screen
    return res;
}

// ---- live actions: things the PLAYER does, which no log can replay ----------
// A session log holds the agent's tool calls, not the human's. Playing a take
// and pasting it are the player's half of the loop, so they are re-enacted here
// against the running app rather than replayed.

const CM = () => document.querySelector('app-javascriptmusic').shadowRoot
    .querySelector('#editor .CodeMirror').CodeMirror;

// Play a phrase through the app's live-input path — the same `processNoteMessage`
// the virtual keyboard and a real MIDI keyboard both reach — so the sequencer
// captures it exactly as it would a human performance.
async function performPhrase({ instrument, notes, bpm, syncToBeats }) {
    await setView('song');
    if (instrument) {
        await page.evaluate((name) => {
            const root = document.querySelector('app-javascriptmusic').shadowRoot;
            const sel = root.getElementById('midichannelmappingselection');
            sel.value = name;
            window.currentMidiChannelMapping = name;
            sel.dispatchEvent(new Event('change'));
            root.getElementById('vkeyboardinputelement').focus();
        }, instrument);
        log(`  instrument → ${instrument}`);
        await sleep(600);
    }
    // Wait for the sequencer's playhead to reach a beat boundary before the
    // first note. Without this the phrase starts wherever the loop happens to
    // be, and every captured time carries that arbitrary offset — so a take
    // played exactly on the grid still pastes as ragged numbers.
    if (syncToBeats) {
        await page.evaluate(async ({ unitSeconds }) => {
            const nap = (ms) => new Promise((r) => setTimeout(r, ms));
            const now = window.songTimeSeconds();
            if (typeof now !== 'number') return;
            const next = Math.ceil((now + 0.08) / unitSeconds) * unitSeconds;
            await nap((next - now) * 1000);
        }, { unitSeconds: (60 / bpm) * syncToBeats });
    }
    const t0 = Date.now();
    await page.evaluate(async ({ notes, msPerBeat }) => {
        const root = document.querySelector('app-javascriptmusic').shadowRoot;
        const vk = root.getElementById('vkeyboardinputelement');
        const names = new Array(128).fill(null).map((v, n) =>
            ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'][n % 12] + Math.floor(n / 12));
        const nap = (ms) => new Promise((r) => setTimeout(r, ms));
        const held = new Set();
        const show = () => { vk.value = [...held].map((n) => names[n]).join(','); };
        const start = performance.now();
        await Promise.all(notes.map(async ([beat, note, durBeats, vel]) => {
            await nap(Math.max(0, start + beat * msPerBeat - performance.now()));
            window.playNoteMessage(note, vel);
            held.add(note); show();
            await nap(durBeats * msPerBeat);
            window.playNoteMessage(note, 0);
            held.delete(note); show();
        }));
        vk.value = '';
    }, { notes, msPerBeat: 60000 / bpm });
    log(`  performed ${notes.length} notes in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

// The app's insert-recording button: turns the captured take into song source.
// Put the cursor inside the recording markers first, where a player would.
async function pasteRecording({ quantize } = {}) {
    await setView('song');
    await page.evaluate(() => {
        const cm = document.querySelector('app-javascriptmusic').shadowRoot
            .querySelector('#editor .CodeMirror').CodeMirror;
        const line = cm.getValue().split('\n').findIndex((l) => l.includes('startRecording()'));
        cm.setCursor({ line: line < 0 ? 0 : line + 1, ch: 0 });
    });
    await sleep(400);
    await page.evaluate((q) => window.insertRecording(q), quantize);
    log(`  pasted the recorded take into the song${quantize ? ` (quantized to 1/${quantize} beat)` : ''}`);
    await sleep(1600);
}

// Quantize the take that was just pasted. This is a REAL edit_song tool call —
// only its arguments are computed here, because they have to anchor on notes
// that did not exist until the take was played.
async function quantizeTake(stepsPerBeat) {
    const tail = await page.evaluate(() => {
        const cm = document.querySelector('app-javascriptmusic').shadowRoot
            .querySelector('#editor .CodeMirror').CodeMirror;
        const lines = cm.getValue().split('\n');
        const i = lines.findIndex((l) => l.includes('.play([') && l.includes('createTrack('));
        if (i < 0) return null;
        for (let j = i; j < lines.length; j++) if (lines[j].trimEnd().endsWith(']);')) return lines[j];
        return null;
    });
    if (!tail) {
        // Losing the last beat should not throw away the whole render — the
        // usual cause is an empty take, which the log above makes obvious.
        log('  WARNING: no recorded take found to quantize — skipping');
        return null;
    }
    await setView('song');
    mock.send({ t: 'tool', name: 'edit_song' });
    const res = await mock.callTool('edit_song', {
        old_string: tail,
        new_string: tail.replace(/\]\);\s*$/, `].quantize(${stepsPerBeat}));`),
    });
    log(`  quantize(${stepsPerBeat}) → ${res.ok ? 'ok' : 'ERROR'}`);
    await sleep(1400);
    return res;
}

const beats = ONLY_BEATS ? ONLY_BEATS.map((i) => BEATS[i]) : BEATS;

for (const [n, beat] of beats.entries()) {
    log(`beat ${n + 1}/${beats.length}: ${beat.title}`);
    await setView('agent');
    await sleep(700);

    await page.locator('#studioagentinput').pressSequentially(beat.prompt, { delay: 18 });
    await sleep(350);
    await page.locator('#studioagentsend').click();
    await sleep(700);

    for (const line of beat.say ?? []) { await streamText(mock, line + '\n\n'); await sleep(250); }
    for (const ord of beat.tools ?? []) await runTool(ord, { quick: beat.quick });
    // Start the transport only once there is something to hear.
    if (beat.startPlayback) {
        await page.evaluate(() => {
            window.toggleSongPlay(true);
            const box = document.querySelector('app-javascriptmusic').shadowRoot
                .getElementById('toggleSongPlayCheckbox');
            if (box) box.checked = true;
        });
        log('  transport started');
    }
    // Jump cut: after a quick run, land on the result and let it play.
    if (beat.quick && beat.showAfter) { await setView(beat.showAfter); await sleep(beat.showMs ?? 3000); }

    for (const line of beat.sayThen ?? []) { await setView('agent'); await streamText(mock, line + '\n\n'); await sleep(250); }
    for (const ord of beat.thenTools ?? []) await runTool(ord, { quick: beat.quick });

    for (const line of beat.sayAfterFail ?? []) { await setView('agent'); await streamText(mock, line + '\n\n'); await sleep(250); }
    for (const ord of beat.failFixTools ?? []) await runTool(ord);

    // The player's half of the loop: perform, paste, quantize.
    if (beat.perform) await performPhrase(beat.perform);
    if (beat.pasteRecording) await pasteRecording(beat.pasteRecording === true ? {} : beat.pasteRecording);
    if (beat.quantizeTake) await quantizeTake(beat.quantizeTake);

    if (beat.outro) { await setView('agent'); await streamText(mock, beat.outro + '\n'); }
    mock.send({ t: 'done' });
    await sleep(beat.holdMs ?? 1800);
}

// Play the finished track out over the song
log('outro');
await setView('song');
await sleep(cut.OUTRO_MS ?? 12000);

// ---- stop + mux --------------------------------------------------------------
clearInterval(drainTimer);
await page.evaluate(async () => {
    await new Promise((res) => { window.__rec.onstop = res; window.__rec.stop(); });
});
await drain();
log('raw capture:', (fs.statSync(RAW).size / 1e6).toFixed(1), 'MB');

await context.close();
await browser.close();
mock.close();

execFileSync('ffmpeg', [
    '-y', '-v', 'error',
    '-i', RAW,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart',
    MP4,
], { stdio: 'inherit' });

const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries',
    'stream=codec_type,codec_name,width,height:format=duration,size', '-of', 'default=nw=1', MP4]).toString();
log('done →', MP4);
console.log(probe);
