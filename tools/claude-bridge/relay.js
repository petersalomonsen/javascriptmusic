#!/usr/bin/env node
// Local relay that mirrors each browser tab's OPFS-backed wasm-git working
// tree to a per-tab subfolder under `tools/claude-bridge/work/`. Claude
// Code (or any host-side editor) edits the files there with its normal
// tools; the relay syncs both directions over WebSocket.
//
// Per-tab isolation: the layout is
//     work/<origin>/<repoName>/<repo-tree>
// where `origin` is the browser host:port and `repoName` is the OPFS repo
// directory (typically the gitrepo URL query). The client sends both as a
// `hello` message immediately on connect; the relay derives the subdir
// from that and any further messages for that client are scoped to it.
// Tabs on different origins or repos therefore can't trample each other.
//
// OPFS is the source of truth. The host mirror is a view on it. Both
// sides can edit, both sides can delete — the relay propagates either
// direction:
//   - host write/delete → relay → client → OPFS
//   - OPFS write/delete → client tree_dump → relay → host mirror
//
// Protocol (browser <-> relay, JSON over WS):
//   browser -> relay
//     { type: 'hello', origin, repoName }
//         First message; assigns this connection a subdir.
//     { type: 'tree_dump', files: [{ path, content, binary }] }
//         Full snapshot of the OPFS tree. The relay diffs against the
//         subdir's previously-known path set and removes any host files
//         that have dropped out of OPFS — that's how OPFS deletions
//         propagate.
//     { type: 'file_changed', path, content, binary }
//         A single file write originating in the browser.
//     { type: 'editor_state', editor, path, cursor, selection, language }
//         Editor cursor/selection metadata. Persisted to `_state.json`.
//   relay -> browser
//     { type: 'apply_file', path, content, binary }
//         A single mirror file changed in this client's subdir.
//     { type: 'apply_delete', path }
//         A single mirror file was deleted in this client's subdir.
//
// Echo prevention: every write records the bytes in `lastWritten`; fs.watch
// events that match are our own work and skipped. Likewise, `recentDeletes`
// holds paths we removed in response to an OPFS-side drop, so the matching
// fs.watch unlink event doesn't bounce back as `apply_delete`.

import { WebSocketServer } from 'ws';
import { writeFile, readFile, mkdir, symlink, lstat, rm } from 'node:fs/promises';
import { watch } from 'node:fs';
import { dirname, resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORK_DIR = resolve(__dirname, 'work');
const WS_PORT = Number(process.env.CLAUDE_BRIDGE_PORT) || 17890;

// Engine source root. Per-subdir symlinks point at these so user files
// like `synth.ts` can do `import {…} from '../mixes/globalimports'` and
// have it resolve in the editor.
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
// Names the bridge owns at the root of each subdir — never round-trip
// these to OPFS, and skip them in fs.watch.
const BRIDGE_PRIVATE = new Set([
    ...RUNTIME_LINKS,
    '_state.json',
    'tsconfig.json',
]);

await mkdir(WORK_DIR, { recursive: true });

// Per-subdir state shared across all tabs of the same origin+repo.
//   knownFromOpfs : paths the relay knows are (or have been) in OPFS, so it
//                   can detect host-side deletions of OPFS-managed files
//                   vs. host-only files (never round-tripped) and tell
//                   them apart.
//   clients       : set of WS connections bound to this subdir.
const subdirState = new Map(); // absSubdir -> { knownFromOpfs, clients, editorMeta, activeEditor }
// Per-WS connection metadata — assigned on `hello`.
const wsMeta = new WeakMap(); // ws -> { subdir, origin, repoName }

// Echo guards. fs.watch fires after our own writes; skip those.
const lastWritten = new Map(); // absPath -> encoded content
const recentDeletes = new Set(); // absPath set briefly after our own unlinks

// macOS/Linux differ on what filenames are safe. Strip the few characters
// that cause path-handling headaches; everything else passes through.
function sanitizeSegment(s) {
    return String(s).replace(/[/\\:*?"<>|]/g, '_').replace(/^\.+/, '_');
}

function getOrCreateSubdirState(absSubdir) {
    let s = subdirState.get(absSubdir);
    if (!s) {
        s = {
            knownFromOpfs: new Set(),
            clients: new Set(),
            editorMeta: {},
            activeEditor: null,
        };
        subdirState.set(absSubdir, s);
    }
    return s;
}

// Drop runtime symlinks + tsconfig + .gitignore into a subdir at first use
// so the IDE can resolve `../mixes/…` etc. from files inside.
async function setupSubdirScaffolding(absSubdir) {
    await mkdir(absSubdir, { recursive: true });

    for (const rel of RUNTIME_LINKS) {
        const link = join(absSubdir, rel);
        const st = await lstat(link).catch(() => null);
        if (st) continue;
        try {
            await symlink(join(AS_LIB_ROOT, rel), link);
        } catch (e) {
            process.stderr.write(`[claude-bridge] symlink ${rel} failed in ${absSubdir}: ${e.message}\n`);
        }
    }

    const tsconfigPath = join(absSubdir, 'tsconfig.json');
    // Absolute path to the AS std declarations — `f32`, `StaticArray<T>`,
    // `Mathf`, etc. The previous relative form was off by one
    // (`../../../..` landed in `tools/`, missing the repo root), so the
    // IDE saw none of the AS built-ins and lit every file up with errors.
    // work/ is gitignored so absolute paths don't hurt portability.
    const asTypesPath = resolve(REPO_ROOT, 'wasmaudioworklet/node_modules/assemblyscript/std/assembly/index.d.ts');
    const tsconfig = {
        compilerOptions: {
            baseUrl: '.',
            allowJs: true,
            checkJs: false,
            noEmit: true,
            moduleResolution: 'node',
            target: 'es2020',
            strict: false,
            skipLibCheck: true,
            // Preserve symlinks so files reached via the per-subdir
            // mixes/synth/etc. symlinks keep that path for THEIR own
            // imports — otherwise TS resolves through to the real engine
            // tree and `../mixes/…` from those files no longer lines up.
            preserveSymlinks: true,
        },
        include: ['**/*.ts', '**/*.d.ts'],
        files: [asTypesPath],
        exclude: ['node_modules'],
    };
    const desired = JSON.stringify(tsconfig, null, 2);
    // Idempotent overwrite — fixes drift if a previous bridge version
    // wrote a stale/incorrect path.
    let existing = null;
    try { existing = await readFile(tsconfigPath, 'utf8'); } catch (_) {}
    if (existing !== desired) {
        try {
            await writeFile(tsconfigPath, desired);
        } catch (e) {
            process.stderr.write(`[claude-bridge] tsconfig write failed in ${absSubdir}: ${e.message}\n`);
        }
    }
}

const wss = new WebSocketServer({ port: WS_PORT });

wss.on('listening', () => {
    process.stderr.write(`[claude-bridge] WS on ws://localhost:${WS_PORT}\n`);
    process.stderr.write(`[claude-bridge] mirror dir: ${WORK_DIR}\n`);
});

wss.on('connection', (ws) => {
    process.stderr.write(`[claude-bridge] client connected (awaiting hello)\n`);

    ws.on('message', async (data) => {
        let msg;
        try {
            msg = JSON.parse(data.toString());
        } catch (e) {
            process.stderr.write(`[claude-bridge] bad message: ${e.message}\n`);
            return;
        }
        try {
            if (msg.type === 'hello') {
                await handleHello(ws, msg);
                return;
            }
            const meta = wsMeta.get(ws);
            if (!meta) {
                process.stderr.write(`[claude-bridge] message before hello: ${msg.type}\n`);
                return;
            }
            if (msg.type === 'tree_dump') {
                await handleTreeDump(meta.subdir, msg);
            } else if (msg.type === 'file_changed') {
                await handleFileChanged(meta.subdir, msg);
            } else if (msg.type === 'editor_state') {
                handleEditorState(meta.subdir, msg);
                await writeState(meta.subdir);
            }
        } catch (e) {
            process.stderr.write(`[claude-bridge] handler failed (${msg.type}): ${e.message}\n`);
        }
    });

    ws.on('close', () => {
        const meta = wsMeta.get(ws);
        if (meta) {
            const s = subdirState.get(meta.subdir);
            if (s) s.clients.delete(ws);
            wsMeta.delete(ws);
        }
    });
});

async function handleHello(ws, msg) {
    const origin = sanitizeSegment(msg.origin || '_unknown_origin');
    const repoName = sanitizeSegment(msg.repoName || '_unknown_repo');
    const subdir = join(WORK_DIR, origin, repoName);
    await setupSubdirScaffolding(subdir);
    const s = getOrCreateSubdirState(subdir);
    s.clients.add(ws);
    wsMeta.set(ws, { subdir, origin, repoName });
    process.stderr.write(`[claude-bridge] hello — ${origin}/${repoName} (${s.clients.size} client(s) in subdir)\n`);
}

async function handleTreeDump(subdir, msg) {
    if (!Array.isArray(msg.files)) return;
    const s = getOrCreateSubdirState(subdir);
    const newPaths = new Set();
    let written = 0;
    let unchanged = 0;
    for (const f of msg.files) {
        if (!isSafeRelPath(f.path)) continue;
        if (BRIDGE_PRIVATE.has(f.path.split('/')[0])) continue; // refuse to overwrite scaffolding
        newPaths.add(f.path);
        try {
            const wrote = await writeMirrorFile(subdir, f.path, f.content, !!f.binary);
            if (wrote) written++; else unchanged++;
        } catch (e) {
            process.stderr.write(`[claude-bridge] tree_dump: skipped ${f.path}: ${e.message}\n`);
        }
    }
    // OPFS → host deletion: anything we previously knew about but isn't in
    // this dump has been removed from OPFS. Delete from the mirror too.
    let deleted = 0;
    for (const oldPath of s.knownFromOpfs) {
        if (newPaths.has(oldPath)) continue;
        try {
            const abs = join(subdir, oldPath);
            recentDeletes.add(abs);
            setTimeout(() => recentDeletes.delete(abs), 1000);
            await rm(abs, { force: true });
            deleted++;
        } catch (e) {
            process.stderr.write(`[claude-bridge] tree_dump: could not delete ${oldPath}: ${e.message}\n`);
        }
    }
    s.knownFromOpfs = newPaths;
    process.stderr.write(
        `[claude-bridge] tree_dump: ${msg.files.length} files (wrote ${written}, unchanged ${unchanged}, deleted ${deleted})\n`
    );
}

async function handleFileChanged(subdir, msg) {
    if (!isSafeRelPath(msg.path)) return;
    if (BRIDGE_PRIVATE.has(msg.path.split('/')[0])) return;
    const s = getOrCreateSubdirState(subdir);
    s.knownFromOpfs.add(msg.path);
    await writeMirrorFile(subdir, msg.path, msg.content, !!msg.binary);
}

function handleEditorState(subdir, msg) {
    if (!msg.editor) return;
    const s = getOrCreateSubdirState(subdir);
    s.editorMeta[msg.editor] = {
        path: msg.path ?? null,
        cursor: msg.cursor ?? null,
        selection: msg.selection ?? null,
        language: msg.language ?? null,
    };
    s.activeEditor = msg.editor;
}

// Reject paths that escape the subdir or use Windows separators / abs paths.
function isSafeRelPath(p) {
    if (typeof p !== 'string' || p.length === 0) return false;
    if (p.startsWith('/') || p.includes('\\')) return false;
    if (p.split('/').some((part) => part === '..' || part === '')) return false;
    return true;
}

async function writeMirrorFile(subdir, opfsPath, content, binary) {
    if (!isSafeRelPath(opfsPath)) throw new Error(`unsafe path: ${opfsPath}`);
    const filePath = join(subdir, opfsPath);
    // Skip identical re-writes so we don't touch mode/mtime — otherwise
    // wasm-git would show spurious "modified" entries in git status.
    const existing = await readFile(filePath).catch(() => null);
    const existingEncoded = existing
        ? (binary ? existing.toString('base64') : existing.toString('utf8'))
        : null;
    if (existingEncoded === content) {
        lastWritten.set(filePath, content);
        return false;
    }
    await mkdir(dirname(filePath), { recursive: true });
    lastWritten.set(filePath, content);
    await writeFile(filePath, binary ? Buffer.from(content, 'base64') : content);
    return true;
}

async function writeState(subdir) {
    const s = getOrCreateSubdirState(subdir);
    const state = { activeEditor: s.activeEditor, editors: s.editorMeta };
    try {
        await writeFile(join(subdir, '_state.json'), JSON.stringify(state, null, 2));
    } catch (e) {
        process.stderr.write(`[claude-bridge] state write failed: ${e.message}\n`);
    }
}

// Recursive watch of WORK_DIR. Each event's filename is relative to
// WORK_DIR — first two segments are <origin>/<repoName>. We look up the
// subdir's state and broadcast to its clients only.
watch(WORK_DIR, { recursive: true }, async (_eventType, filename) => {
    if (!filename) return;
    const relPath = filename.split(sep).join('/');
    const parts = relPath.split('/');
    if (parts.length < 3) return; // events at work/, work/<origin>/ — no subdir yet
    const subdir = join(WORK_DIR, parts[0], parts[1]);
    const opfsPath = parts.slice(2).join('/');
    if (!isSafeRelPath(opfsPath)) return;
    if (BRIDGE_PRIVATE.has(opfsPath.split('/')[0])) return;

    const filePath = join(subdir, opfsPath);
    const s = subdirState.get(subdir);
    if (!s) return; // no client has identified itself for this subdir yet

    if (recentDeletes.has(filePath)) return; // our own delete

    let buf;
    try {
        buf = await readFile(filePath);
    } catch (_e) {
        // File no longer exists → treat as delete.
        if (lastWritten.has(filePath)) lastWritten.delete(filePath);
        if (!s.knownFromOpfs.has(opfsPath)) return; // host-only file, never sent to OPFS
        s.knownFromOpfs.delete(opfsPath);
        broadcastApplyDelete(s, opfsPath);
        return;
    }

    const binary = isLikelyBinary(opfsPath);
    const encoded = binary ? buf.toString('base64') : buf.toString('utf8');
    if (lastWritten.get(filePath) === encoded) return; // our own write
    lastWritten.set(filePath, encoded);
    s.knownFromOpfs.add(opfsPath);
    broadcastApplyFile(s, opfsPath, encoded, binary);
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

function broadcastApplyFile(s, path, content, binary) {
    const payload = JSON.stringify({ type: 'apply_file', path, content, binary });
    let delivered = 0;
    for (const c of s.clients) {
        if (c.readyState !== c.OPEN) continue;
        c.send(payload);
        delivered++;
    }
    process.stderr.write(`[claude-bridge] apply_file ${path} → ${delivered} client(s)\n`);
}

function broadcastApplyDelete(s, path) {
    const payload = JSON.stringify({ type: 'apply_delete', path });
    let delivered = 0;
    for (const c of s.clients) {
        if (c.readyState !== c.OPEN) continue;
        c.send(payload);
        delivered++;
    }
    process.stderr.write(`[claude-bridge] apply_delete ${path} → ${delivered} client(s)\n`);
}
