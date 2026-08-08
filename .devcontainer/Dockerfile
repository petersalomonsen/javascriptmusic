# Devcontainer image: a standard "base:ubuntu" devcontainer + the NEAR
# git-storage sandbox artifacts copied straight from the published image.
#
# Using `COPY --from=…` (multi-stage) means the sandbox binaries and
# compiled wasm contracts are baked into this image at build time — no
# docker access needed at runtime. The container can run the sandbox as
# a plain process (`near-git-sandbox` launcher below) and the e2e suite
# talks to it over localhost.
FROM ghcr.io/petersalomonsen/near-git-storage/sandbox:main AS sandbox

FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Web Audio in headless Chromium needs an output sink, otherwise the
# audio-worklet code never starts and the broadcast / audio-comparison
# specs hang on the play-toggle check.
RUN apt-get update \
    && apt-get install -y --no-install-recommends pulseaudio \
    && rm -rf /var/lib/apt/lists/*

# Sandbox artifacts: near-sandbox binary, the git-server wrapper, and
# the compiled wasm contracts the factory boot script needs.
COPY --from=sandbox /usr/local/bin/git-server /usr/local/bin/git-server
COPY --from=sandbox /app                      /opt/near-sandbox
COPY --from=sandbox /root/.near               /opt/near-sandbox/.near

# Launcher: chdir into /opt/near-sandbox so git-server finds its res/*.wasm,
# point .near at the bundled state, default the listen address to the port
# the e2e helpers expect.
RUN cat <<'WRAPPER' > /usr/local/bin/near-git-sandbox && chmod +x /usr/local/bin/near-git-sandbox
#!/bin/bash
exec env \
    LISTEN_ADDR="${LISTEN_ADDR:-0.0.0.0:3030}" \
    HOME="${HOME:-/opt/near-sandbox}" \
    bash -c 'cd /opt/near-sandbox && exec git-server "$@"' near-git-sandbox "$@"
WRAPPER
