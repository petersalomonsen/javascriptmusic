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
import { writeFile, readFile, mkdir, symlink, lstat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { dirname, resolve, join, sep, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORK_DIR = resolve(__dirname, 'work');
const STATE_FILE = join(WORK_DIR, '_state.json');
const WS_PORT = Number(process.env.CLAUDE_BRIDGE_PORT) || 17890;

// On-disk location of the wasm-music AS runtime. The synth source at
// `work/<name>.ts` imports things like `../mixes/globalimports`, and TS
// does NOT consult tsconfig `paths` for relative imports — so to make
// those resolve we drop a few symlinks one level above `work/` (i.e. into
// the bridge package directory itself), and the user's file's `..`
// traversal lands on them. work/ itself stays a clean OPFS mirror.
const REPO_ROOT = resolve(__dirname, '../..');
const AS_LIB_ROOT = resolve(REPO_ROOT, 'wasmaudioworklet/synth1/assembly');
const RUNTIME_LINKS = [
    'environment.ts',
    'common',
    'synth',
    'midi',
    'instruments',
    'math',
    'fx',
    'mixes',
];

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
await setupRuntimeLinks();
await writeTsconfig();

// Drop symlinks for the AS runtime modules at the bridge-package level —
// one directory above WORK_DIR — so relative imports like
// `../mixes/globalimports` from `work/<synth>.ts` land on them. Symlinks
// for things that change (the faust mirror) point back into work/.
async function setupRuntimeLinks() {
    for (const rel of RUNTIME_LINKS) {
        const link = join(__dirname, rel);
        const target = join(AS_LIB_ROOT, rel);
        const st = await lstat(link).catch(() => null);
        if (st) continue; // already in place (symlink, dir, or file) — don't overwrite
        try {
            await symlink(target, link);
        } catch (e) {
            process.stderr.write(`[claude-bridge] symlink ${rel} failed: ${e.message}\n`);
        }
    }
    // faust/ lives inside work/ as part of the OPFS mirror. Make it
    // reachable via `..` from work/ files too.
    const faustLink = join(__dirname, 'faust');
    const stFaust = await lstat(faustLink).catch(() => null);
    if (!stFaust) {
        try {
            await symlink(join(WORK_DIR, 'faust'), faustLink);
        } catch (e) {
            process.stderr.write(`[claude-bridge] faust symlink failed: ${e.message}\n`);
        }
    }
}

// Minimal tsconfig.json so the editor picks up the AS built-in types
// (straight from the upstream `assemblyscript` package's declaration
// file — no hand-maintained shim) and uses Node module resolution. No
// `paths` — TS ignores them for relative imports; the symlinks one
// level above work/ do the resolution.
async function writeTsconfig() {
    const tsconfig = {
        compilerOptions: {
            baseUrl: '.',
            allowJs: true,
            checkJs: false,
            noEmit: true,
            moduleResolution: 'node',
            target: 'es2020',
            // AS allows things TS rejects (boolean<->number casts, etc.);
            // we want IntelliSense, not a strict TS lint of AS source.
            strict: false,
            skipLibCheck: true,
            // Preserve symlinks so a file reached through
            // `tools/claude-bridge/faust/...` (sibling symlink) keeps that
            // path for its OWN relative imports — otherwise TS resolves
            // it back to `work/faust/...` and `../../../mixes/...` no
            // longer points at the on-disk AS runtime.
            preserveSymlinks: true,
        },
        include: ['**/*.ts', '**/*.d.ts'],
        // Pull in AS's own type declarations for f32 / StaticArray / Mathf
        // / etc. straight from the engine's installed `assemblyscript`
        // package.
        files: ['../../../wasmaudioworklet/node_modules/assemblyscript/std/assembly/index.d.ts'],
        exclude: ['node_modules'],
    };
    try {
        await writeFile(join(WORK_DIR, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
    } catch (e) {
        process.stderr.write(`[claude-bridge] could not write tsconfig.json: ${e.message}\n`);
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
    // Upsert only — don't wipe. Files added to work/ from the host side
    // (gitignored binaries, user notes, etc.) would otherwise vanish on the
    // next tree_dump if OPFS doesn't have them. Trade-off: stale files from
    // an earlier song/repo stick around until manually removed.
    let written = 0;
    let unchanged = 0;
    for (const f of msg.files) {
        if (!isSafeRelPath(f.path)) continue;
        try {
            const wrote = await writeMirrorFile(f.path, f.content, !!f.binary);
            if (wrote) written++; else unchanged++;
        } catch (e) {
            process.stderr.write(`[claude-bridge] tree_dump: skipped ${f.path}: ${e.message}\n`);
        }
    }
    process.stderr.write(`[claude-bridge] tree_dump: wrote ${written}, unchanged ${unchanged}, of ${msg.files.length}\n`);
}

// Paths in work/ that the bridge considers OPFS-managed (i.e. round-trip
// to the browser). Bridge-private files like _state.json, tsconfig.json
// — plus anything under synth1/assembly/ if a stray host-side write
// somehow lands there — stay out.
function isOpfsManagedPath(relPath) {
    if (relPath === '_state.json' || relPath === 'tsconfig.json') return false;
    if (relPath.startsWith('synth1/assembly/') || relPath === 'synth1/assembly') return false;
    return true;
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
    const filePath = join(WORK_DIR, opfsPath);
    // Skip identical re-writes so we don't touch mode/mtime — otherwise
    // wasm-git shows spurious "modified" entries in git status.
    const existing = await readFile(filePath).catch(() => null);
    const existingEncoded = existing
        ? (binary ? existing.toString('base64') : existing.toString('utf8'))
        : null;
    mirroredFiles.set(filePath, opfsPath);
    if (existingEncoded === content) {
        lastWritten.set(filePath, content);
        return false;
    }
    await mkdir(dirname(filePath), { recursive: true });
    lastWritten.set(filePath, content);
    await writeFile(filePath, binary ? Buffer.from(content, 'base64') : content);
    return true;
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
// fs.watch with recursive is best-effort. Files already tracked in
// `mirroredFiles` round-trip back to the browser; new files dropped into
// the OPFS namespace by the host (e.g. a new `.dsp` in `work/faust/...`)
// are adopted and broadcast too. Anything outside the OPFS namespace
// (private bridge files, synth1/assembly/* if anything slips in) is
// ignored.
watch(WORK_DIR, { recursive: true }, async (_eventType, filename) => {
    if (!filename) return;
    const relPath = filename.split(sep).join('/');
    if (!isSafeRelPath(relPath)) return;
    if (!isOpfsManagedPath(relPath)) return;

    const filePath = join(WORK_DIR, relPath);
    let opfsPath = mirroredFiles.get(filePath);
    if (!opfsPath) {
        // New host-side file — adopt it under its mirror path.
        opfsPath = relPath;
    }

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
    mirroredFiles.set(filePath, opfsPath);
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
