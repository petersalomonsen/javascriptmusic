#!/bin/bash
# Devcontainer one-time setup. Sandbox artifacts are already baked into
# the image (see ./Dockerfile), so all we have to do here is install the
# Node-side deps and Playwright browsers.
#
# Once this completes, you should be able to:
#     near-git-sandbox &
#     cd wasmaudioworklet && yarn playwright test --workers=1
set -euo pipefail

pulseaudio -D --exit-idle-time=-1 || true  # already running on rerun

(cd wasmaudioworklet && yarn install --frozen-lockfile)
(cd wasmaudioworklet && yarn playwright install-deps && yarn playwright install chromium)

# tools/faust2as drives the Faust → AssemblyScript transpiler used by both
# the dev app and the e2e source-generator.
(cd tools/faust2as && npm install --no-audit --no-fund)
# tools/claude-bridge ships the relay that claude-bridge.spec.js spawns.
(cd tools/claude-bridge && npm install --no-audit --no-fund)
