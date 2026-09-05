#!/bin/bash
# Clone the repo into a Docker volume and start the devcontainer on it,
# from the terminal. The CLI equivalent of VS Code's "Clone Repository in
# Container Volume…": nothing on the host is bind-mounted, and the
# devcontainer CLI (unlike the VS Code extension) forwards no gitconfig,
# credential helper, gh token or SSH agent — a sandbox fit for running
# agents in.
#
#     npm install -g @devcontainers/cli          # once
#     .devcontainer/volume-up.sh [branch] [volume]
#
# Re-running starts the existing container, and leaves the clone alone if
# the volume already holds one. Shell in with the `devcontainer exec` line
# printed at the end.
set -euo pipefail

BRANCH="${1:-master}"
VOLUME="${2:-javascriptmusic-agent}"
REPO="${REPO:-https://github.com/petersalomonsen/javascriptmusic.git}"
# The volume is mounted at /workspaces (as VS Code does it), with the
# clone inside it — so the workspace folder is a subdirectory, not the
# mount point.
WORKSPACE=/workspaces/javascriptmusic
# Host-side scratch holding only the clone's .devcontainer/ (Dockerfile +
# config), so the image is built from the branch you cloned rather than
# whatever checkout is on the host. Stable path: the CLI keys the
# container off this folder, so it has to be the same on every run.
CFG="${XDG_CACHE_HOME:-$HOME/.cache}/javascriptmusic-devcontainer/$VOLUME"

docker volume create "$VOLUME" >/dev/null
if docker run --rm -v "$VOLUME":/w alpine test -e /w/javascriptmusic/.git; then
    echo "volume $VOLUME already holds a clone, leaving it as is"
else
    docker run --rm -v "$VOLUME":/w -w /w alpine/git clone --branch "$BRANCH" "$REPO" javascriptmusic
    # Hand the tree to the container user: vscode is uid 1000 in the
    # image, except on a Linux host where the CLI remaps it to your uid.
    OWNER=1000; [ "$(uname)" = Linux ] && OWNER="$(id -u)"
    docker run --rm -v "$VOLUME":/w alpine chown -R "$OWNER:$OWNER" /w
fi

rm -rf "$CFG" && mkdir -p "$CFG"
docker run --rm -v "$VOLUME":/w alpine tar -C /w/javascriptmusic -cf - .devcontainer | tar -xf - -C "$CFG"
# Swap the CLI's default bind mount of the host folder for the volume.
# read-configuration parses the commented JSON for us; its JSON is the
# last stdout line. Via a temp file: `> devcontainer.json` would truncate
# the input before read-configuration gets to it.
devcontainer read-configuration --workspace-folder "$CFG" | tail -1 | node -e '
    const cfg = JSON.parse(require("fs").readFileSync(0, "utf8")).configuration;
    delete cfg.configFilePath;
    cfg.workspaceMount = `source=${process.argv[1]},target=/workspaces,type=volume`;
    cfg.workspaceFolder = process.argv[2];
    console.log(JSON.stringify(cfg, null, 2));
' "$VOLUME" "$WORKSPACE" > "$CFG/.devcontainer/devcontainer.json.tmp"
mv "$CFG/.devcontainer/devcontainer.json.tmp" "$CFG/.devcontainer/devcontainer.json"

devcontainer up --workspace-folder "$CFG"

cat <<MSG

Shell into it with:
    devcontainer exec --workspace-folder "$CFG" bash
MSG
