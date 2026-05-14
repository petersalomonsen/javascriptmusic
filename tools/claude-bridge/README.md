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

`work/` (gitignored) holds the OPFS git tree at the same paths it has in
the repo — multi-song layouts with several `*.ts` files at the root, or
deep subtrees like `faust/master_me/...`, all stay where they belong:

- `work/song.js`, `work/synth.ts`, `work/shader.glsl`, `work/README.md`, …
- `work/faust/...`
- `work/_state.json` — active editor + cursor + selection per editor.
- `work/tsconfig.json` — minimal IDE config (Node module resolution,
  AS built-in types via `../data/assembly-builtins.d.ts`).

No runtime sources, no symlinks, nothing surprising inside `work/`.

### Making the synth source's imports resolve in the IDE

Files in `work/` import things like `../mixes/globalimports`,
`../environment`, `../faust/...`. TypeScript resolves relative imports via
the filesystem (it does *not* consult `tsconfig.paths` for them), so for
those to resolve the imported files have to actually exist one level
above `work/`.

The relay drops symlinks at the bridge package directory (sibling of
`work/`) at boot, pointing at the on-disk wasm-music engine:

| Symlink at `tools/claude-bridge/`   | → target on disk                                                          |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `environment.ts`                    | `wasmaudioworklet/synth1/assembly/environment.ts`                         |
| `mixes`                             | `wasmaudioworklet/synth1/assembly/mixes`                                  |
| `synth`                             | `wasmaudioworklet/synth1/assembly/synth`                                  |
| `midi`                              | `wasmaudioworklet/synth1/assembly/midi`                                   |
| `common`                            | `wasmaudioworklet/synth1/assembly/common`                                 |
| `instruments`                       | `wasmaudioworklet/synth1/assembly/instruments`                            |
| `math`                              | `wasmaudioworklet/synth1/assembly/math`                                   |
| `fx`                                | `wasmaudioworklet/synth1/assembly/fx`                                     |
| `faust`                             | `work/faust` (so `../faust/...` reaches the OPFS-mirrored Faust files)    |

These are gitignored. Same set of symlinks serves any number of synth files
sitting at the `work/` root.

`data/assembly-builtins.d.ts` declares `f32`, `StaticArray<T>`, `Mathf`,
etc. so the TS language server understands AS built-ins; the
`work/tsconfig.json` references it via `../data/assembly-builtins.d.ts`.

**Caveat**: writes through the runtime symlinks land in the real engine
source on disk. Don't edit `mixes/`, `synth/`, etc. through them unless you
mean to modify the engine. Bridge-owned files (the OPFS mirror in `work/`)
are tracked separately and only those round-trip through `fs.watch` back
to the browser.

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
