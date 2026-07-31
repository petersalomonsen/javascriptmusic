# faust-compiler-module

Build and release tooling for **`@psalomo/wasm-music-faust`** — the npm package
holding the Faust compiler this app runs.

That package ships exactly one artifact, `faust-compiler-module.wasm`: the
[faust-rs](https://github.com/grame-cncm/faust-rs) compiler built for
`wasm32-unknown-unknown` with the AssemblyScript backend and the Faust standard
libraries embedded. No JavaScript — the browser loads it with a bare
`WebAssembly.instantiate(bytes, {})` from
[faust-rs-transpile.js](../../wasmaudioworklet/faust/faust-rs-transpile.js), and
node reads it off disk in [faust2asc.js](../faust2as/faust2asc.js). It resolves
in this order:

1. `$FAUST_RS_COMPILER_MODULE` (node only)
2. `wasmaudioworklet/faust/faust_wasm_ffi.wasm` — gitignored local drop
3. `@psalomo/wasm-music-faust@$COMPILER_MODULE_VERSION` from jsDelivr

So a compiler release is: build the module, validate it, wrap it in the
package, publish, then point `COMPILER_MODULE_VERSION` at the new version.

> This replaced `@psalomo/faustwasm` (dist-tag `asc`), a fork of
> grame-cncm/faustwasm that shipped 19 MB of JS, emscripten blobs and tests to
> deliver one 10 MB file none of it was used with. Owning a purpose-built
> package also gives it its own npm *trusted publisher* slot — a package can
> have only one, and the fork's belongs to petersalomonsen/faustwasm.

## Releasing

Run the **Publish faust compiler module** workflow
([.github/workflows/publish-faust-compiler-module.yml](../../.github/workflows/publish-faust-compiler-module.yml)).
Start with `dry_run: true` — it builds, validates, packs and attaches the
tarball to the run without publishing. Publishing uses OIDC trusted publishing:
no npm token exists anywhere in this repository.

The scripts it calls work the same on a laptop:

```bash
# 1. Build the module (in a grame-cncm/faust-rs checkout)
rustup target add wasm32-unknown-unknown
FAUST_RS_EMBEDDED_LIB_ROOT=<faustlibraries-checkout> \
  cargo run --release -p xtask -- build-faustwasm-compiler-module
# → target/wasm32-unknown-unknown/release/libfaust-rs.wasm

# 2. Validate it — never publish a module that has not passed this
node tools/faust-compiler-module/validate-module.mjs <faust-rs>/target/wasm32-unknown-unknown/release/libfaust-rs.wasm

# 3. Build the package around it
node tools/faust-compiler-module/build-package.mjs \
  --module <faust-rs>/target/wasm32-unknown-unknown/release/libfaust-rs.wasm \
  --license <faust-rs>/LICENSE \
  --out staging/package --version 0.1.1 \
  --faust-rs-commit $(git -C <faust-rs> rev-parse HEAD) \
  --faustlibraries-commit $(git -C <faustlibraries> rev-parse HEAD)

# 4. Pack, then check the tarball that will actually ship
(cd staging/package && npm pack --pack-destination ../out)
mkdir -p staging/repacked && tar -xzf staging/out/*.tgz -C staging/repacked
node tools/faust-compiler-module/verify-package.mjs \
  staging/repacked/package 0.1.1 <faust-rs>/target/wasm32-unknown-unknown/release/libfaust-rs.wasm

# 5. Publish
npm publish staging/out/*.tgz --access public
```

`FAUST_RS_EMBEDDED_LIB_ROOT` must point at a checkout of
`grame-cncm/faustlibraries`: the standard `.lib` files are embedded into the
module at build time, and without it the module still builds but
`import("stdfaust.lib")` fails at runtime. `validate-module.mjs` catches that.

Note that faust-rs's own CI pins an exact faustlibraries revision rather than
tracking `master` — a lagging standard library once broke its `dx.algorithm`
budget test. Pass that SHA as `faustlibraries_ref` when you want exactly the
library the compiler was tested against.

## The scripts

| | |
|---|---|
| `validate-module.mjs <module.wasm>` | The release gate: full ABI surface, `--ec --os` producing a native `control()`/`frame()` class, structured diagnostics on a bad compile, and a compile-time budget for `dx.algorithm(5)`. Each check maps to a regression that has actually happened — see the script header. |
| `build-package.mjs` | Assembles the package: generated package.json (with the faust-rs and faustlibraries commits recorded), the module, a generated README, and faust-rs's own LICENSE. |
| `verify-package.mjs <extractedDir> <version> <module.wasm>` | Checks the packed tarball: exactly four files, the module byte-identical to the validated build, and the metadata npm depends on — including the `repository` field, which provenance rejects with a 422 if it does not match this repository. |

## Testing the branch that is waiting on the release

A branch that needs a compiler feature can be tested against the new module
*before* it is published — set the workflow's `e2e_ref` input to that branch and
leave `dry_run` on. The Playwright transpile spec then runs from that branch,
against the build from this run, and nothing is published.

This works because the local module drop outranks the CDN in the resolution
order above: the branch can already pin an unpublished
`COMPILER_MODULE_VERSION`, and the fallback URL is simply never used. So the
order is *validate the consumer, then publish* — not the other way round.

## Trusted publishing setup

Publishing authenticates with a short-lived OIDC token from GitHub. There is no
`NPM_TOKEN` secret. Configured once, on npmjs.com → the package → Settings →
Trusted Publisher → GitHub Actions:

```
Organization or user:  petersalomonsen
Repository:            javascriptmusic
Workflow filename:     publish-faust-compiler-module.yml
```

All fields are case-sensitive, and npm does not validate them when you save —
a typo shows up only as a failed publish.

Two consequences worth knowing:

- **A package must exist before a trusted publisher can be configured for it.**
  The first release is therefore published by hand from the workflow's dry-run
  tarball; every release after that is token-free.
- **Provenance is generated automatically** for trusted publishes and requires
  package.json's `repository` to match this repository exactly. That is why
  `build-package.mjs` sets it to petersalomonsen/javascriptmusic and
  `verify-package.mjs` asserts it.

Trusted publishing needs npm ≥ 11.5.1 on Node ≥ 22, newer than the runner
default, so the publish step installs it.

## After publishing

1. Bump `COMPILER_MODULE_VERSION` in
   [faust-rs-transpile.js](../../wasmaudioworklet/faust/faust-rs-transpile.js) —
   the CDN fallback URL is derived from it.
2. Bump the `@psalomo/wasm-music-faust` dependency in
   [tools/faust2as/package.json](../faust2as/package.json).
3. Check that the CDN serves the new file (jsDelivr lags a publish by minutes):
   `https://cdn.jsdelivr.net/npm/@psalomo/wasm-music-faust@<version>/faust-compiler-module.wasm`
