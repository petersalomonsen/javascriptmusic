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

#### Bring-your-own GitHub/GitLab via the built-in CORS proxy

GitHub/GitLab don't send CORS headers and expect Basic auth, so the browser
can't push to them directly. The site ships a tiny **stateless** proxy — a
Cloudflare Pages Function at `functions/gitproxy/[[path]].js` — that fixes both:
it forwards only the git smart-HTTP endpoints to an **allowlisted** host, and
translates the `Authorization: Bearer <token>` the git client sends into the
Basic auth GitHub expects. It never stores or logs tokens.

Point `remote=` at it (same origin as the app):

```
https://<origin>/?gitrepo=mysketch&remote=https://<origin>/gitproxy/github.com/<user>/<repo>.git
```

- Use a **GitHub fine-grained PAT** scoped to just that repo (Contents:
  read/write). If it ever leaks, the blast radius is that one repo. The token is
  sent by the browser and only transits the proxy — which is first-party and
  open-source, so it's within the same trust boundary as the app itself.
- **Don't trust this instance?** The proxy is one self-contained file — deploy
  your own copy and point `remote=` at it.
- **Quick check** that the proxy + auth + host round-trip works, before wiring
  the app:

  ```sh
  curl -H "Authorization: Bearer <your-fine-grained-PAT>" \
    "https://<origin>/gitproxy/github.com/<user>/<repo>.git/info/refs?service=git-upload-pack"
  ```

  A git ref advertisement in the response means it works.

> Allowed hosts: github.com, gist.github.com, gitlab.com, codeberg.org,
> bitbucket.org (edit `ALLOWED_HOSTS` in the function to change). Unit tests:
> `npm run test-gitproxy`.

#### Pushing from the app (step by step)

1. Create the destination on GitHub: an empty **repo** (or a **gist** — gists are
   git repos at `gist.github.com/<id>.git`), and a **fine-grained PAT** scoped to
   it (Contents: read/write).
2. Open the app with your local repo and the proxy as the remote — the proxy can
   be any deployment (the app on `localhost` can use the deployed proxy
   cross-origin; CORS is handled):
   ```
   http://localhost:8080/?gitrepo=mysketch&remote=https://<proxy-origin>/gitproxy/github.com/<user>/<repo>.git
   ```
3. Hand the git worker your token — in the browser console:
   ```js
   setGitToken('<your-fine-grained-PAT>', 'yourname', 'you@example.com')
   ```
   (A proper token-input UI is a follow-up; this console hook is the current way.)
4. Click **Commit & Sync**. The worker pushes with `Authorization: Bearer <token>`;
   the proxy rewrites it to Basic and forwards to GitHub.

To a **gist** instead, use `…/gitproxy/gist.github.com/<gist-id>.git` in step 2.

Validated live (2026-07): `GET info/refs` against `github.com` through the
deployed proxy returns the ref advertisement with CORS headers — so clone works;
authenticated push follows the same path with the token from step 3.

#### Preventing abuse

You can't cryptographically restrict a *client-side* app's proxy to "only my
users" without a user-auth backend (any secret shipped to the browser is
extractable). But the exposure is narrow and cheaply bounded:

- **Host allowlist** — the proxy only reaches git hosts (`ALLOWED_HOSTS`), so it
  can't be a general open proxy, and only the three git smart-HTTP endpoints.
- **Origin allowlist** (`ALLOWED_ORIGINS`) — only browsers on our origins may use
  it, which blocks other **web apps** from piggybacking (the realistic vector; a
  browser can't spoof its `Origin`). Non-browser clients can bypass it, but they
  gain nothing — the proxy only adds CORS + a Basic-auth tweak, so a script would
  just hit the git host directly. Remove `localhost` from the list for a
  locked-down production proxy.
- **Rate limiting** — add a Cloudflare rate-limit rule (dashboard → Security →
  WAF → Rate limiting) on `/gitproxy/*` to cap request volume per IP. Bounds cost
  from any source, no code needed.

If real abuse ever appears and you need true per-user gating, that requires a
backend that authenticates users and issues short-lived signed tokens the proxy
verifies (or reuse the NEAR login for a signature) — overkill until it's needed.

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
