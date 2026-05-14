# claude-editor-bridge

Local relay that mirrors the [wasmaudioworklet](../../wasmaudioworklet/) web app
editor buffers to a working folder so Claude Code can edit them as ordinary
files.

```
browser editors  <— WebSocket —>  relay  <— filesystem —>  tools/claude-bridge/work/
                                                            ^ Claude Code edits here
```

No MCP server, no custom edit ops — Claude Code just uses `Read` / `Edit` /
`Glob` / `Grep` on the mirror files like any other source tree.

## Mirror layout

`work/` (gitignored) is populated as you focus editors in the web app:

| File              | Backed by                     |
| ----------------- | ----------------------------- |
| `song.js`         | song editor                   |
| `synth.ts`        | synth editor (AssemblyScript) |
| `shader.glsl`     | fragment shader editor        |
| `faust.dsp`       | currently-open Faust .dsp     |
| `_state.json`     | active editor + cursor + selection metadata, per editor |

## Usage

```sh
cd tools/claude-bridge
npm install
npm start            # listens on ws://localhost:17890
```

Open the web app — it auto-connects to the relay (see
`wasmaudioworklet/claude-bridge-client.js`). Focus an editor; the mirror file
appears in `work/`. Edit it with Claude Code; the web app's editor updates in
place.

## Configuration

- `CLAUDE_BRIDGE_PORT` — WebSocket port (default `17890`).

## v1 caveats

- **Last writer wins.** If you type in the browser at the same instant Claude
  is writing, one side overwrites the other. The lock-during-edit-session model
  (see the project memory) is the planned fix.
- **One Faust file at a time.** `faust.dsp` reflects whichever .dsp is open in
  the editor. Switching files in the browser replaces the mirror content.
