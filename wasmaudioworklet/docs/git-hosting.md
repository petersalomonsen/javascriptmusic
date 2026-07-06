# Hosting a song project in a NEAR-backed git repo (`?gitrepo=`)

WebAssembly Music can load a whole song/synth project straight from a git
repository that lives **on the NEAR blockchain**, by adding `?gitrepo=` to the
app URL:

```
https://webassemblymusic.pages.dev/?gitrepo=<name>.gitfactory.testnet
```

This document explains how the feature works and how to create your own repo
and push a project to it. The on-chain git storage is provided by the separate
[`near-git-storage`](https://github.com/petersalomonsen/near-git-storage)
project; the code in this folder (`wasmgit/`) is the browser client.

> **Use the `pages.dev` deployment.** The git client clones into OPFS (Origin
> Private File System). `webassemblymusic.pages.dev` supports it;
> `petersalomonsen.com/webassemblymusic/...` does **not**, so `?gitrepo=` will
> silently fail to load there.

## Local-only repos (no NEAR registration)

You can also open `?gitrepo=<name>` with a name that is **not** a registered
NEAR repo (e.g. `?gitrepo=mysketch`). When the clone fails because there is
nothing to clone, the app falls back to a **persistent local git repo in OPFS**:
`git init`, no remote round-trip. Edits — including the `faust/` folder — are
committed/saved into that OPFS repo and **survive reload**. "Commit & Sync"
still commits locally; the push half just fails until a reachable remote exists.

This is the registration-free path for scratch projects and
Studio-Agent-authored instruments. To attach a remote and push later, set one
with the `remote=` param below.

### Point a local repo at any remote — `&remote=<url>`

Add `&remote=<url>` to override the git `origin` for pushing, e.g. a local git
server:

```
http://localhost:8080/?gitrepo=mysketch&remote=http://localhost:9418/mysketch.git
```

The URL is written into `.git/config` (which lives in OPFS), so it **persists
across reloads** — you only need the param once. `origin` still defaults to the
NEAR url for `<name>` when `remote=` is omitted.

> **Non-NEAR remotes need CORS + git-over-HTTP.** Only `/near-repo/*` requests
> go through the NEAR service worker; any other remote is a normal browser
> `fetch`, so the target server must speak the git smart-HTTP protocol and send
> permissive CORS headers. Persisting locally and *configuring* the remote work
> regardless; whether a given server accepts the push depends on that server.

## How it works

- `?gitrepo=<name>.gitfactory.testnet` is resolved to `<origin>/near-repo/<name>.git`
  ([`wasmgitclient.js`](../wasmgit/wasmgitclient.js)).
- A service worker (from `near-git-storage`) intercepts those git HTTP requests
  and translates them into NEAR RPC calls — there is no server. Transaction
  signing happens in the browser; the private key never leaves the client.
- wasm-git clones the repo into OPFS and the editor loads the song/synth/shader
  from it. The in-app **commit / pull / push** UI ([`wasmgitui.html`](../wasmgit/wasmgitui.html))
  writes changes back to the chain.

## 1. Create the repo contract

Each repo is a NEAR sub-account of the `gitfactory.testnet` factory. Create one
from the web UI (no CLI needed):

- <https://near-git-storage.pages.dev/create-repo> (or <https://gitfactory.testnet.page/>)
- Connect your NEAR wallet — **this account becomes the repo owner; only the
  owner can push.**
- Enter a **repository name**: lowercase letters, digits and hyphens only (no
  dots, no uppercase). It becomes `<name>.gitfactory.testnet`.
- The form attaches ~1 NEAR to cover account creation, a 0.1 NEAR service fee,
  and initial storage.

## 2. Repository layout

Minimum the app needs is a song and a synth at the repo **root**:

```
song.js      # the sequence (JavaScript)
synth.ts     # the synth (AssemblyScript)
```

With no config file these are auto-detected (first `*.js` → song, first `*.ts`
→ synth, first `*.glsl` → shader, scanning the repo root). Add a
`wasmmusic.config.json` to be explicit and to ship multiple songs:

```json
{
  "songfilename": "mysong/song.js",
  "synthfilename": "mysong/synth.ts",
  "fragmentshader": "shaders/myshader.glsl",
  "allsongs": [
    { "name": "My song", "songfilename": "mysong/song.js",
      "synthfilename": "mysong/synth.ts", "fragmentshader": "shaders/myshader.glsl" }
  ],
  "name": "My song"
}
```

Optional folders:

- `faust/**/*.dsp` (+ transpiled `*.ts`) — Faust instruments/effects. The Faust
  editor lists `faust/**/*.dsp`; the compiler injects `faust/**/*.ts`.
- `shaders/*.glsl` — visualizer shaders.

**Import paths.** `synth.ts` is compiled in the engine's `mixes/` context (as
`mixes/midi.mix.ts`), regardless of where it sits in the repo. So it imports:

```ts
import { midichannels, MidiChannel } from '../mixes/globalimports';
import { SAMPLERATE } from '../environment';
import { MyInstrument, MyInstrumentChannel } from '../faust/myinstrument';
```

## 3. Push with `git-remote-near` (CLI)

You can push from the in-app UI, or from the command line with the
`git-remote-near` helper:

```sh
# one-time: install the remote helper from the near-git-storage repo
cargo install --path git-remote-near

# in your project directory
git init -b main
git add -A && git commit -m "initial song"
git remote add origin near://<name>.gitfactory.testnet
git push -u origin main
```

`git-remote-near` signs as the **repo owner**, reading the key from
`~/.near-credentials/testnet/<owner>.json` (or the `NEAR_SIGNER_ACCOUNT` /
`NEAR_SIGNER_KEY` env vars). Pushes use thin packfiles with delta compression,
so incremental edits are tiny.

## 4. Funding (storage staking)

On-chain storage is **staked** against the repo account's balance. If a push
fails with `LackBalanceForState`, top the account up:

```sh
near tokens <your-account> send-near <name>.gitfactory.testnet '1 NEAR' \
  network-config testnet sign-with-legacy-keychain send
```

Rough guide: roughly ~1 NEAR per ~100 KB of stored packfile.

## 5. Resetting a repo

NEAR git storage is **append-only** — `git push -f` does *not* reclaim old
objects (the helper only diffs against the remote ref and appends a pack). To
wipe everything and start clean, call the contract's owner-only
`clear_storage()`, then push fresh:

```sh
near contract call-function as-transaction <name>.gitfactory.testnet \
  clear_storage json-args '{}' prepaid-gas '100.0 Tgas' attached-deposit '0 NEAR' \
  sign-as <owner> network-config testnet sign-with-legacy-keychain send
```

For a clean history afterwards, re-init the local repo (`rm -rf .git && git init`)
so a single fresh commit is pushed rather than the whole prior history.

## 6. Load it

```
https://webassemblymusic.pages.dev/?gitrepo=<name>.gitfactory.testnet
```

## Faust instruments — note

A `.dsp` is **not** transpiled during the synth compile. Open `faust/<name>.dsp`
in the Faust editor and save it; that transpiles it to a sibling
`faust/<name>.ts` (which `synth.ts` imports) and commits both. On a fresh repo,
do this once before the synth will compile. Class names derive from the
filename: `simplesynth.dsp` → `Simplesynth` / `SimplesynthChannel`.

---

For a tiny end-to-end example, see the repo
`ifc2026-faust2as.gitfactory.testnet` (3 files: `faust/simplesynth.dsp`,
`synth.ts`, `song.js`) loaded via
<https://webassemblymusic.pages.dev/?gitrepo=ifc2026-faust2as.gitfactory.testnet>.
