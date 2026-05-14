# claude-editor-bridge

Local relay that mirrors the [wasmaudioworklet](../../wasmaudioworklet/) web
app's OPFS-backed wasm-git working tree to a host filesystem folder so Claude
Code (and any other host-side editor) can edit it as ordinary files.

```
browser editors / wasm-git OPFS  <— WebSocket —>  relay  <— filesystem —>  tools/claude-bridge/work/
                                                                          ^ Claude Code, VSCode, vim, etc. edit here
```

No MCP server, no custom edit ops — Claude Code uses `Read` / `Edit` / `Glob`
/ `Grep` on the mirror tree like any other source folder.

## What gets mirrored

`work/` (gitignored) holds the OPFS git tree but laid out to match the
**AssemblyScript compile-time path structure**, so editor IntelliSense works
naturally on the mirror files:

- `work/synth1/assembly/mixes/synth.ts` ← the user's synth editor source.
- `work/synth1/assembly/faust/...` ← the `faust/` subtree from OPFS.
- `work/song.js`, `work/shader.glsl`, `work/README.md`, …  ← everything else stays flat.
- `work/_state.json` ← active editor + cursor + selection per editor.

In addition, the relay symlinks the **on-disk AS runtime** from this repo
into the mirror so the synth source's imports resolve:

| Mirror path                                    | → Symlink target (on disk)                                  |
| ---------------------------------------------- | ----------------------------------------------------------- |
| `synth1/assembly/environment.ts`               | `wasmaudioworklet/synth1/assembly/environment.ts`           |
| `synth1/assembly/mixes/globalimports.ts`       | `wasmaudioworklet/synth1/assembly/mixes/globalimports.ts`   |
| `synth1/assembly/common`                       | `wasmaudioworklet/synth1/assembly/common`                   |
| `synth1/assembly/synth`                        | `wasmaudioworklet/synth1/assembly/synth`                    |
| `synth1/assembly/midi`                         | `wasmaudioworklet/synth1/assembly/midi`                     |
| `synth1/assembly/instruments`                  | `wasmaudioworklet/synth1/assembly/instruments`              |
| `synth1/assembly/math`                         | `wasmaudioworklet/synth1/assembly/math`                     |
| `synth1/assembly/fx`                           | `wasmaudioworklet/synth1/assembly/fx`                       |

Plus `work/assembly-builtins.d.ts` (copied at boot from `tools/claude-bridge/
data/`) declares the AS built-ins (`f32`, `StaticArray`, `Mathf`, …) so the
TS language server stops complaining.

**Caveat on the symlinks**: writes through them go to the real source files
on disk. Don't edit the symlinked runtime through `work/` unless you mean to
modify the engine source. Bridge-owned mirror files (the ones the relay
wrote from browser pushes) are tracked separately and only those round-trip
through `fs.watch` back to the browser.

The mirror only populates when the web app is opened with a `?gitrepo=...`
URL — the OPFS-backed wasm-git client is the source of truth for the tree
sync.

For now: text files only, `.git/` excluded, no deletes. Binary files
(samples, PNGs, .wasm) are skipped — they'd need base64 framing and a way
to pull raw OPFS bytes that wasm-git's text-only `readfile` doesn't yet
expose.

## Setup

```sh
cd tools/claude-bridge
npm install
npm start            # listens on ws://localhost:17890
```

Open the web app with a git repo (e.g. `?gitrepo=…`). The relay logs
`tree_dump: wrote N file(s)` once the wasm-git client is ready. From then on:

- **Browser edit → host**: each editor change pushes a `file_changed` →
  relay writes the mirror.
- **Host edit → browser**: any change to a mirror file fires `fs.watch` →
  relay broadcasts `apply_file` → client writes back to OPFS via wasm-git's
  `writefileandstage`, and if an editor is currently showing that path,
  refreshes the buffer in place.

## Configuration

- `CLAUDE_BRIDGE_PORT` — WebSocket port (default `17890`).

## Caveats

- **Last writer wins.** Simultaneous edits on the same file from both sides
  race. The lock-during-edit-session model (see project memory) is the
  planned fix.
- **No `.git`** in the mirror, so host-side `git status` / `git diff`
  don't reflect the wasm-git repo's actual state. Including the `.git`
  directory is the next obvious extension — needs careful handling because
  git operations generate event storms on `fs.watch`.
- **No binary files**: until wasm-git exposes raw byte reads of OPFS
  entries.
- **No deletes** propagate from host → OPFS yet — only creates/updates.
