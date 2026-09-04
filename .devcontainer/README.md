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

`devcontainer.json` layers the `node` feature (Node 24, matching CI's
`setup-node`) on top. The base image ships no Node whatsoever, so without
the feature `post-create.sh` dies on `yarn: command not found`. The
feature's `yarn` is a Corepack shim that downloads yarn classic on first
use — `COREPACK_ENABLE_DOWNLOAD_PROMPT=0` in `containerEnv` suppresses
the interactive "Do you want to continue?" that would otherwise hang
`postCreateCommand` (no tty).

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
#
#    Use this instead of `yarn near-sandbox` — that script does a
#    `docker run` and there is no docker daemon inside the container.
#    Both end up serving the same image on localhost:3030.
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

## Running agents inside (no host filesystem)

Use **Dev Containers: Clone Repository in Container Volume…** rather than
"Reopen in Container": the workspace then lives in a Docker volume with
no bind mount of the host checkout. (A bind-mounted container also
rewrites the host's `node_modules` with Linux binaries on `yarn install`,
breaking local builds until you `yarn install` again on the host.)

The workspace mount is not the only host connection, though. By default
the VS Code extension also copies `~/.gitconfig` in, wires the host's git
credential helper into the container, logs the GitHub CLI in with the
host's token, and forwards the host SSH agent. If the container is meant
as a sandbox for agents, turn those off in *host* VS Code settings (they
are not `devcontainer.json` options):

```json
"dev.containers.copyGitConfig": false,
"dev.containers.gitCredentialHelperConfigLocation": "none",
"dev.containers.githubCLILoginWithToken": false,
"dev.containers.dockerCredentialHelper": false
```

Then check `ssh-add -l` inside the container — if it lists host keys, the
SSH agent is still being forwarded.

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
