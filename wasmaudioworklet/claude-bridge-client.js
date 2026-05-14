// WebSocket client that mirrors the OPFS-backed wasm-git working tree to the
// local claude-editor-bridge relay (see tools/claude-bridge/).
//
//   browser -> relay  : tree_dump (on connect / git sync), file_changed (per
//                       editor save), editor_state (cursor/selection)
//   relay   -> browser: apply_file (Claude or external edits in work/)
//
// `attachGitRepo({ listfiles, readfile, writefileandstage })` must be called
// once the wasm-git client is ready. Before that, only editor_state messages
// flow; file content sync is dormant.

const DEFAULT_PORT = 17890;
const RECONNECT_MS = 3000;
const EDITOR_DEBOUNCE_MS = 250;

const BINARY_EXTS = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp',
    'mp3', 'wav', 'ogg', 'flac', 'mid', 'midi',
    'wasm', 'bin', 'zip', 'gz', 'tar',
    'woff', 'woff2', 'ttf', 'otf',
]);
function isLikelyBinary(p) {
    const ext = (p || '').toLowerCase().split('.').pop();
    return BINARY_EXTS.has(ext);
}

class ClaudeBridgeClient {
    constructor() {
        this.ws = null;
        this.editors = new Map(); // id -> { cm, language, getPath }
        this.activeEditorId = null;
        this.reconnectTimer = null;
        this.warned = false;
        this.url = `ws://localhost:${DEFAULT_PORT}`;
        this.git = null; // { listfiles, readfile, writefileandstage }
        this.treeSynced = false;
    }

    start() {
        if (this.ws) return;
        this._connect();
    }

    attachGitRepo({ listfiles, readfile, writefileandstage }) {
        this.git = { listfiles, readfile, writefileandstage };
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this._sendTreeDump().catch((e) => console.warn('[claude-bridge] tree_dump failed', e));
        }
    }

    // Call after a remote sync (pull/commit) to refresh Claude's view.
    async resyncTree() {
        if (!this.git) return;
        this.treeSynced = false;
        await this._sendTreeDump();
    }

    // Register a CodeMirror 5 editor with the bridge. `getPath` returns the
    // OPFS-relative path currently shown in this editor (may be null).
    registerEditor(cm, { id, language, getPath }) {
        if (!cm) return;
        this.editors.set(id, { cm, language, getPath });

        cm.on('focus', () => {
            this.activeEditorId = id;
            this._scheduleEditorSync(id);
        });

        let timer = null;
        const debounced = (kind) => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => this._editorSync(id, kind), EDITOR_DEBOUNCE_MS);
        };
        cm.on('changes', () => debounced('changes'));
        cm.on('cursorActivity', () => debounced('cursor'));
    }

    _connect() {
        try {
            this.ws = new WebSocket(this.url);
        } catch (_e) {
            this._scheduleReconnect();
            return;
        }
        this.ws.addEventListener('open', () => {
            this.warned = false;
            this.treeSynced = false;
            if (this.git) {
                this._sendTreeDump().catch((e) => console.warn('[claude-bridge] tree_dump failed', e));
            }
            if (this.activeEditorId) this._editorSync(this.activeEditorId, 'reconnect');
        });
        this.ws.addEventListener('close', () => {
            this.ws = null;
            this.treeSynced = false;
            this._scheduleReconnect();
        });
        this.ws.addEventListener('error', () => {
            if (!this.warned) {
                console.info(
                    `[claude-bridge] not connected (${this.url}) — start the relay if you want Claude Code integration`
                );
                this.warned = true;
            }
        });
        this.ws.addEventListener('message', (ev) => {
            let msg;
            try { msg = JSON.parse(ev.data); } catch (_e) { return; }
            if (msg.type === 'apply_file') this._applyFile(msg).catch((e) => console.warn('[claude-bridge] apply_file failed', e));
        });
    }

    _scheduleReconnect() {
        if (this.reconnectTimer) return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this._connect();
        }, RECONNECT_MS);
    }

    async _sendTreeDump() {
        if (!this.git || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        const allPaths = await this.git.listfiles('');
        // Skip .git for now — change-storm risk and most users don't want it in scope.
        const paths = allPaths.filter((p) => !p.startsWith('.git/') && p !== '.git');
        const files = [];
        for (const path of paths) {
            try {
                const binary = isLikelyBinary(path);
                if (binary) {
                    // wasm-git readfile returns strings; skip binaries until we
                    // have a clean way to pull raw bytes from OPFS.
                    continue;
                }
                const content = await this.git.readfile(path);
                if (typeof content !== 'string') continue;
                files.push({ path, content, binary: false });
            } catch (e) {
                console.warn('[claude-bridge] tree_dump skip', path, e?.message || e);
            }
        }
        try {
            this.ws.send(JSON.stringify({ type: 'tree_dump', files }));
            this.treeSynced = true;
            console.info(`[claude-bridge] tree_dump sent — ${files.length} file(s)`);
        } catch (e) {
            console.warn('[claude-bridge] tree_dump send failed', e);
        }
    }

    // Send editor_state (always) and file_changed (if content for this editor's
    // path has actually changed since the last send).
    _scheduleEditorSync(id) {
        // Immediate sync on focus — pairs with the cursor-activity debounce.
        this._editorSync(id, 'focus');
    }

    _lastSentForEditor = new Map(); // id -> { path, content }

    _editorSync(id, _kind) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        const entry = this.editors.get(id);
        if (!entry) return;
        const cm = entry.cm;
        const path = typeof entry.getPath === 'function' ? entry.getPath() : entry.getPath;
        const cursor = cm.doc.getCursor();
        const selection = cm.doc.somethingSelected()
            ? {
                  text: cm.doc.getSelection(),
                  from: cm.doc.getCursor('from'),
                  to: cm.doc.getCursor('to'),
              }
            : null;
        try {
            this.ws.send(JSON.stringify({
                type: 'editor_state',
                editor: id,
                path,
                cursor: { line: cursor.line, ch: cursor.ch },
                selection,
                language: entry.language,
            }));
        } catch (_e) { /* close handler will reconnect */ }

        if (!path || !this.treeSynced) return;
        const content = cm.doc.getValue();
        const prev = this._lastSentForEditor.get(id);
        if (prev && prev.path === path && prev.content === content) return;
        this._lastSentForEditor.set(id, { path, content });
        try {
            this.ws.send(JSON.stringify({
                type: 'file_changed',
                path,
                content,
                binary: false,
            }));
        } catch (_e) { /* ditto */ }
    }

    // A mirror file changed in work/ — write it back into OPFS and, if any
    // open editor is showing that path, refresh its buffer.
    async _applyFile(msg) {
        const path = msg.path;
        if (!path) return;
        // Update OPFS via wasm-git (text only for now).
        if (this.git && !msg.binary) {
            try {
                await this.git.writefileandstage(path, msg.content);
            } catch (e) {
                console.warn('[claude-bridge] writefileandstage failed', path, e?.message || e);
            }
        }
        // Refresh any editor currently showing this path.
        for (const [id, entry] of this.editors) {
            const editorPath = typeof entry.getPath === 'function' ? entry.getPath() : entry.getPath;
            if (editorPath !== path) continue;
            const cm = entry.cm;
            if (cm.doc.getValue() === msg.content) continue;
            const sels = cm.doc.listSelections();
            cm.doc.setValue(msg.content);
            try { cm.doc.setSelections(sels); } catch (_e) { /* positions may no longer be valid */ }
            // Avoid immediate echo back as file_changed.
            this._lastSentForEditor.set(id, { path, content: msg.content });
        }
    }
}

export const claudeBridge = new ClaudeBridgeClient();
