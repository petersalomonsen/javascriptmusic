# Devcontainer

Self-contained dev environment for `wasmaudioworklet`: Node + Playwright
browsers + the NEAR git-storage sandbox, all running as plain processes
inside one Ubuntu container. The Playwright e2e suite can run end-to-end
against the sandbox at `localhost:3030` with no `docker run …` from the
test code.

## How it's wired

`Dockerfile` is a multi-stage build that bakes the sandbox artifacts
into the dev image — no docker access needed at runtime, which keeps
the setup working on GitHub Codespaces (no docker-outside-of-docker
needed) as well as locally:

- `FROM ghcr.io/petersalomonsen/near-git-storage/sandbox:main AS sandbox`
  — pulled purely to `COPY --from=…`.
- `FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04` — the actual
  base. Installs `pulseaudio` (Web Audio sink — without it audio-worklet
  code never starts and the broadcast / audio-comparison specs hang on
  the play-toggle check) and copies in the sandbox's `git-server` binary,
  `/app` (which contains `res/*.wasm`), and `.near` state.
- Drops a `near-git-sandbox` launcher onto PATH that chdirs into
  `/opt/near-sandbox` and runs `git-server` on `localhost:3030`.

`post-create.sh` then just does the Node side:

1. Boots `pulseaudio`.
2. `yarn install` + `yarn playwright install chromium` in `wasmaudioworklet/`.
3. `npm install` in `tools/faust2as/` (Faust → AS source generator used
   by `e2e/faust2as-compilation.spec.js`) and `tools/claude-bridge/`
   (relay spawned by `e2e/claude-bridge.spec.js`).

## Running the e2e suite

```sh
# 1. Boot the sandbox (port 3030). Picks up the wasm contracts from
#    /opt/near-sandbox/res/.
near-git-sandbox &

# 2. Regenerate the Faust test sources (only needed when transpiler or
#    upstream Faust examples change — committed output lives under
#    wasmaudioworklet/faust/faust-test-sources.js so this is optional).
node tools/faust2as/generate-test-sources.js

# 3. Run the suite. --workers=1 because the sandbox-using specs share a
#    single NEAR_REPO_CONTRACT; running in parallel causes pushBaseline
#    conflicts.
cd wasmaudioworklet
yarn playwright test --workers=1
```

## Why "sandbox as a process", not a sibling docker container

Earlier iterations of the test setup booted the sandbox image with
`docker run -p 3030:8080` from outside the dev environment. That's fine
on Linux hosts but breaks on macOS:

- Docker Desktop / colima on macOS routes container networking through
  a VM, so `--network host` *doesn't* share the actual host network.
  A container started with `--network host` can't reach a sandbox
  bound on the host's `localhost:3030`.
- The workaround (shared bridge network with named aliases) requires
  rewriting helpers that hard-code `localhost:3030`.

Running the sandbox **inside** the dev container sidesteps all of that:
both the test runner and `git-server` live in the same Linux process
space and just talk over `localhost`. CI does the same thing (the
GitHub workflow `docker run`s the sandbox image alongside, but on a
proper Linux host) — this devcontainer setup matches that behaviour.

## Matching Playwright versions

When using an off-the-shelf playwright Docker image to reproduce CI
locally, the image's playwright version **must** match
`wasmaudioworklet/package.json`'s pinned `playwright` (currently
`1.59.1`). Mismatch surfaces as:

```
Error: browserType.launch: Executable doesn't exist at
       /ms-playwright/chromium_headless_shell-1217/chrome-linux/headless_shell
…  current: mcr.microsoft.com/playwright:v1.60.0-noble
… required: mcr.microsoft.com/playwright:v1.59.1-noble
```

`./node_modules/.bin/playwright install chromium` inside the container
fixes that ad-hoc, but matching the image tag is the cleaner approach.
