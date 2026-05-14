#!/usr/bin/env node
// Local relay that mirrors the web app's OPFS-backed wasm-git working tree to
// `tools/claude-bridge/work/`. Claude Code (or any host-side editor) edits the
// files there with its normal tools; the relay syncs both directions over
// WebSocket.
//
// Protocol (browser <-> relay, JSON over WS):
//   browser -> relay
//     { type: 'tree_dump', files: [{ path, content, binary }] }
//         Full snapshot — sent on connect once the wasm-git client is ready.
//     { type: 'file_changed', path, content, binary }
//         A single file write originating in the browser.
//     { type: 'editor_state', editor, path, cursor, selection, language }
//         Editor cursor/selection metadata. Persisted to `_state.json`.
//   relay -> browser
//     { type: 'apply_file', path, content, binary }
//         A single mirror-file changed in `work/` (e.g. by Claude Code).
//
// Echo prevention: every write records the bytes in `lastWritten`; fs.watch
// events that match are our own work and skipped.

import { WebSocketServer } from 'ws';
import { writeFile, readFile, mkdir, symlink, copyFile, lstat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { dirname, resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORK_DIR = resolve(__dirname, 'work');
const STATE_FILE = join(WORK_DIR, '_state.json');
const WS_PORT = Number(process.env.CLAUDE_BRIDGE_PORT) || 17890;

// Path of the AS runtime on disk (assumed: bridge lives at
// `tools/claude-bridge/` inside the wasm-music repo).
const REPO_ROOT = resolve(__dirname, '../..');
const AS_LIB_ROOT = join(REPO_ROOT, 'wasmaudioworklet/synth1/assembly');
const AS_MIRROR_ROOT = join(WORK_DIR, 'synth1/assembly');
// Subtrees/files of the on-disk AS runtime we symlink into the mirror so the
// IDE can resolve the imports the user's synth source makes.
const AS_SYMLINKS = [
    'environment.ts',
    'common',
    'synth',
    'midi',
    'instruments',
    'math',
    'fx',
    'mixes/globalimports.ts',
];
const BUILTINS_SRC = join(__dirname, 'data/assembly-builtins.d.ts');
const BUILTINS_DST = join(WORK_DIR, 'assembly-builtins.d.ts');

// OPFS path → mirror path inside work/.
// - Anything under faust/ is placed under synth1/assembly/faust/ so the
//   user's synth.ts can resolve `../faust/...` relative to its mirror
//   location.
// - A top-level .ts file is treated as the synth source and placed in
//   synth1/assembly/mixes/ alongside the symlinked globalimports.ts.
// - Everything else (song.js, shader.glsl, README.md, …) stays flat at
//   work/<path>.
function opfsToMirrorPath(opfsPath) {
    if (opfsPath.startsWith('faust/')) return 'synth1/assembly/' + opfsPath;
    if (!opfsPath.includes('/') && opfsPath.endsWith('.ts')) {
        return 'synth1/assembly/mixes/' + opfsPath;
    }
    return opfsPath;
}

// Editor cursor/selection per editor id, persisted to _state.json.
let activeEditor = null;
const editorMeta = {}; // id -> { path, cursor, selection, language, language }
// Echo guard: text content (or base64 for binary) we last wrote per absolute path.
const lastWritten = new Map();
// Mirror files we've written, mapped back to their OPFS path. Watcher events
// for paths NOT in this map (e.g. host edits inside the symlinked AS runtime)
// are ignored — only bridge-owned files round-trip to the browser.
const mirroredFiles = new Map(); // absMirrorPath -> opfsPath

await mkdir(WORK_DIR, { recursive: true });
await setupAsLayout();

async function setupAsLayout() {
    await mkdir(AS_MIRROR_ROOT, { recursive: true });
    await mkdir(join(AS_MIRROR_ROOT, 'mixes'), { recursive: true });
    for (const rel of AS_SYMLINKS) {
        const linkPath = join(AS_MIRROR_ROOT, rel);
        const target = join(AS_LIB_ROOT, rel);
        await mkdir(dirname(linkPath), { recursive: true });
        try {
            const st = await lstat(linkPath).catch(() => null);
            if (st && st.isSymbolicLink()) continue; // already linked
            if (st) continue; // file/dir already exists, leave it
            await symlink(target, linkPath);
        } catch (e) {
            process.stderr.write(`[claude-bridge] symlink ${rel} failed: ${e.message}\n`);
        }
    }
    try {
        await copyFile(BUILTINS_SRC, BUILTINS_DST);
    } catch (e) {
        process.stderr.write(`[claude-bridge] could not install assembly-builtins.d.ts: ${e.message}\n`);
    }
}

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
        try {
            if (msg.type === 'tree_dump') {
                await handleTreeDump(msg);
            } else if (msg.type === 'file_changed') {
                await writeMirrorFile(msg.path, msg.content, !!msg.binary);
            } else if (msg.type === 'editor_state') {
                handleEditorState(msg);
                await writeState();
            }
        } catch (e) {
            process.stderr.write(`[claude-bridge] handler failed (${msg.type}): ${e.message}\n`);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
    });
});

async function handleTreeDump(msg) {
    if (!Array.isArray(msg.files)) return;
    let written = 0;
    for (const f of msg.files) {
        if (!isSafeRelPath(f.path)) continue;
        try {
            await writeMirrorFile(f.path, f.content, !!f.binary);
            written++;
        } catch (e) {
            process.stderr.write(`[claude-bridge] tree_dump: skipped ${f.path}: ${e.message}\n`);
        }
    }
    process.stderr.write(`[claude-bridge] tree_dump: wrote ${written}/${msg.files.length} file(s)\n`);
}

function handleEditorState(msg) {
    if (!msg.editor) return;
    editorMeta[msg.editor] = {
        path: msg.path ?? null,
        cursor: msg.cursor ?? null,
        selection: msg.selection ?? null,
        language: msg.language ?? null,
    };
    activeEditor = msg.editor;
}

// Reject paths that escape WORK_DIR or use Windows separators / abs paths.
function isSafeRelPath(p) {
    if (typeof p !== 'string' || p.length === 0) return false;
    if (p.startsWith('/') || p.includes('\\')) return false;
    if (p.split('/').some((part) => part === '..' || part === '')) return false;
    return true;
}

async function writeMirrorFile(opfsPath, content, binary) {
    if (!isSafeRelPath(opfsPath)) throw new Error(`unsafe path: ${opfsPath}`);
    const mirrorRel = opfsToMirrorPath(opfsPath);
    const filePath = join(WORK_DIR, mirrorRel);
    await mkdir(dirname(filePath), { recursive: true });
    if (binary) {
        const buf = Buffer.from(content, 'base64');
        lastWritten.set(filePath, content); // store base64 form for compare
        mirroredFiles.set(filePath, opfsPath);
        await writeFile(filePath, buf);
    } else {
        lastWritten.set(filePath, content);
        mirroredFiles.set(filePath, opfsPath);
        await writeFile(filePath, content);
    }
}

async function writeState() {
    const state = { activeEditor, editors: editorMeta };
    try {
        await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (e) {
        process.stderr.write(`[claude-bridge] state write failed: ${e.message}\n`);
    }
}

// Recursive watch of WORK_DIR. macOS supports recursive natively; on Linux,
// fs.watch with recursive is best-effort. Only paths in `mirroredFiles`
// round-trip — anything else under work/ (notably the symlinked AS runtime)
// is host-only and we leave it alone.
watch(WORK_DIR, { recursive: true }, async (_eventType, filename) => {
    if (!filename) return;
    const relPath = filename.split(sep).join('/');
    if (relPath === '_state.json' || relPath === 'assembly-builtins.d.ts') return;
    if (!isSafeRelPath(relPath)) return;

    const filePath = join(WORK_DIR, relPath);
    const opfsPath = mirroredFiles.get(filePath);
    if (!opfsPath) return; // not a bridge-owned file (e.g. symlinked AS source)

    let buf;
    try {
        buf = await readFile(filePath);
    } catch (_e) {
        return; // file may have been deleted/replaced mid-event
    }

    const binary = isLikelyBinary(opfsPath);
    const encoded = binary ? buf.toString('base64') : buf.toString('utf8');
    if (lastWritten.get(filePath) === encoded) return; // our own write
    lastWritten.set(filePath, encoded);
    broadcastApplyFile(opfsPath, encoded, binary);
});

const BINARY_EXTS = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp',
    'mp3', 'wav', 'ogg', 'flac', 'mid', 'midi',
    'wasm', 'bin', 'zip', 'gz', 'tar',
    'woff', 'woff2', 'ttf', 'otf',
]);
function isLikelyBinary(p) {
    const ext = p.toLowerCase().split('.').pop();
    return BINARY_EXTS.has(ext);
}

function broadcastApplyFile(path, content, binary) {
    const payload = JSON.stringify({ type: 'apply_file', path, content, binary });
    let delivered = 0;
    for (const c of clients) {
        if (c.readyState !== c.OPEN) continue;
        c.send(payload);
        delivered++;
    }
    process.stderr.write(`[claude-bridge] apply_file ${path} → ${delivered} client(s)\n`);
}
