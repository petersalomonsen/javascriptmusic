// WebSocket client that pushes the focused editor's state to the local
// claude-editor-bridge relay. The relay caches the snapshot and serves it to
// Claude Code via MCP. See tools/claude-bridge/.

const DEFAULT_PORT = 17890;
const RECONNECT_MS = 3000;
const STATE_DEBOUNCE_MS = 200;

class ClaudeBridgeClient {
    constructor() {
        this.ws = null;
        this.editors = new Map();
        this.activeEditorId = null;
        this.reconnectTimer = null;
        this.warned = false;
        this.url = `ws://localhost:${DEFAULT_PORT}`;
    }

    start() {
        if (this.ws) return;
        this._connect();
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
            if (this.activeEditorId) this._sendState();
        });
        this.ws.addEventListener('close', () => {
            this.ws = null;
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
    }

    _scheduleReconnect() {
        if (this.reconnectTimer) return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this._connect();
        }, RECONNECT_MS);
    }

    // Register a CodeMirror 5 instance with the bridge. `getName` may be a
    // function (called each time) or a static string.
    registerEditor(cm, { id, editor_type, language, getName }) {
        if (!cm) return;
        const entry = { cm, id, editor_type, language, getName };
        this.editors.set(id, entry);

        cm.on('focus', () => {
            this.activeEditorId = id;
            this._sendState();
        });

        let timer = null;
        const debounced = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                if (this.activeEditorId === id) this._sendState();
            }, STATE_DEBOUNCE_MS);
        };
        cm.on('changes', debounced);
        cm.on('cursorActivity', debounced);
    }

    _sendState() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        if (!this.activeEditorId) return;
        const entry = this.editors.get(this.activeEditorId);
        if (!entry) return;
        const cm = entry.cm;
        const cursor = cm.doc.getCursor();
        const selection = cm.doc.somethingSelected()
            ? {
                  text: cm.doc.getSelection(),
                  from: cm.doc.getCursor('from'),
                  to: cm.doc.getCursor('to'),
              }
            : null;
        const name = typeof entry.getName === 'function' ? entry.getName() : entry.getName;
        try {
            this.ws.send(
                JSON.stringify({
                    type: 'state',
                    editor: {
                        id: entry.id,
                        editor_type: entry.editor_type,
                        language: entry.language,
                        name,
                    },
                    content: cm.doc.getValue(),
                    cursor: { line: cursor.line, ch: cursor.ch },
                    selection,
                })
            );
        } catch (_e) {
            // Ignore — close handler will trigger reconnect.
        }
    }
}

export const claudeBridge = new ClaudeBridgeClient();
