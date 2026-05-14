#!/usr/bin/env node
// Local relay that mirrors web-app editor buffers to a working folder.
// Claude Code edits the files in that folder with its usual Read/Edit tools;
// the relay propagates those changes back into the browser via WebSocket.
//
//   Browser → relay  : `state` WS message → write `<id>.<ext>` in work/
//   Relay   → browser: fs.watch fires → `replace_buffer` WS message
//
// Echo prevention: every file write records the content in `lastWritten`;
// when fs.watch fires with matching content, the change is ours and skipped.

import { WebSocketServer } from 'ws';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { watch } from 'node:fs';
import { dirname, resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORK_DIR = resolve(__dirname, 'work');
const STATE_FILE = join(WORK_DIR, '_state.json');
const WS_PORT = Number(process.env.CLAUDE_BRIDGE_PORT) || 17890;

// One mirror file per editor id, named `<id>.<ext>`. `faust.dsp` always
// reflects whichever .dsp file is currently open in the Faust editor — the
// "real" path lives in _state.json.
const EXTENSIONS = {
    song: 'js',
    synth: 'ts',
    shader: 'glsl',
    faust: 'dsp',
};

function pathForId(id) {
    const ext = EXTENSIONS[id] || 'txt';
    return join(WORK_DIR, `${id}.${ext}`);
}

function idForFilename(filename) {
    for (const [id, ext] of Object.entries(EXTENSIONS)) {
        if (filename === `${id}.${ext}`) return id;
    }
    return null;
}

// In-memory state.
const editorMeta = {}; // id -> { file (real path), cursor, selection, name, editor_type, language }
let activeEditor = null;
const lastWritten = new Map(); // absolute path -> content

await mkdir(WORK_DIR, { recursive: true });

const clients = new Set();
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('listening', () => {
    process.stderr.write(`[claude-bridge] WS on ws://localhost:${WS_PORT}\n`);
    process.stderr.write(`[claude-bridge] mirror dir: ${WORK_DIR}\n`);
});

wss.on('connection', (ws) => {
    clients.add(ws);
    process.stderr.write(`[claude-bridge] client connected (${clients.size} total)\n`);

    ws.on('message', async (data) => {
        let msg;
        try {
            msg = JSON.parse(data.toString());
        } catch (e) {
            process.stderr.write(`[claude-bridge] bad message: ${e.message}\n`);
            return;
        }
        if (msg.type === 'state') {
            await handleStatePush(msg);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
    });
});

async function handleStatePush(msg) {
    const id = msg.editor?.id;
    if (!id || !(id in EXTENSIONS)) return;
    const filePath = pathForId(id);
    editorMeta[id] = {
        mirror: basename(filePath),
        file: msg.editor.name,
        editor_type: msg.editor.editor_type,
        language: msg.editor.language,
        cursor: msg.cursor,
        selection: msg.selection,
    };
    activeEditor = id;
    lastWritten.set(filePath, msg.content);
    try {
        await writeFile(filePath, msg.content);
    } catch (e) {
        process.stderr.write(`[claude-bridge] write failed ${filePath}: ${e.message}\n`);
    }
    await writeState();
}

async function writeState() {
    const state = { activeEditor, editors: editorMeta };
    try {
        await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (e) {
        process.stderr.write(`[claude-bridge] state write failed: ${e.message}\n`);
    }
}

// Watch the mirror dir for Claude's edits. fs.watch may fire multiple events
// per change on some platforms; we dedupe via content comparison against
// `lastWritten`.
watch(WORK_DIR, async (_eventType, filename) => {
    if (!filename || filename === '_state.json') return;
    const id = idForFilename(filename);
    if (!id) return;
    const filePath = join(WORK_DIR, filename);
    let content;
    try {
        content = await readFile(filePath, 'utf8');
    } catch (_e) {
        return; // file may have been deleted/replaced mid-event
    }
    if (lastWritten.get(filePath) === content) return; // our own write
    lastWritten.set(filePath, content);
    broadcastReplaceBuffer(id, content);
});

function broadcastReplaceBuffer(id, content) {
    const payload = JSON.stringify({ type: 'replace_buffer', id, content });
    let delivered = 0;
    for (const c of clients) {
        if (c.readyState !== c.OPEN) continue;
        c.send(payload);
        delivered++;
    }
    process.stderr.write(`[claude-bridge] replace_buffer ${id} → ${delivered} client(s)\n`);
}
