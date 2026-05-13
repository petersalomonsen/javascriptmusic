# claude-editor-bridge

Local relay that bridges the [wasmaudioworklet](../../wasmaudioworklet/) web app
editors to Claude Code:

- Web app ↔ relay over **WebSocket** (default `ws://localhost:17890`)
- Claude Code ↔ relay over **MCP** on **stdio**

The web app proactively pushes editor state (active editor, content, cursor,
selection) on focus and edit events. The relay caches the latest snapshot and
serves MCP tool calls from cache, so Claude tool calls don't round-trip.

## v1 scope

- Protocol carries `editor_type` (`faust` / `song` / `synth` / `shader`) so
  Claude can apply syntax-appropriate edits even though only one editor is
  wired (Faust) in v1.
- One MCP tool: `get_active_buffer`.

## Setup

```sh
cd tools/claude-bridge
npm install
```

Register the relay with Claude Code (e.g. in `~/.claude/settings.json` or
`.claude.json`):

```jsonc
{
  "mcpServers": {
    "editor-bridge": {
      "command": "node",
      "args": ["/absolute/path/to/javascriptmusic/tools/claude-bridge/relay.js"]
    }
  }
}
```

Then start Claude Code as usual — it spawns the relay on stdio. The relay
opens the WebSocket port for the web app to connect to.

## Configuration

- `CLAUDE_BRIDGE_PORT` — WebSocket port (default `17890`).

## Status

WIP — `get_active_buffer` only. Next: `replace_range`, `insert_at_cursor`,
editor lock, runtime context (audio errors, playhead).
