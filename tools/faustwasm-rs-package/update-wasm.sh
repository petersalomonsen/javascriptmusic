#!/bin/sh
# Rebuilds faust_wasm_ffi.wasm from the local faust-rs checkout (origin/main)
# and refreshes provenance.json. Run before `npm publish`.
set -e
FAUST_RS=${FAUST_RS:-$HOME/git/faust-rs}
FAUSTLIBRARIES=${FAUSTLIBRARIES:-/tmp/faustlibraries}
HERE=$(cd "$(dirname "$0")" && pwd)

cd "$FAUST_RS"
FAUST_RS_SHA=$(git rev-parse HEAD)
FAUST_RS_EMBEDDED_LIB_ROOT="$FAUSTLIBRARIES" cargo run -p xtask -- build-faustwasm-compiler-module
cp target/wasm32-unknown-unknown/release/faust_wasm_ffi.wasm "$HERE/faust_wasm_ffi.wasm"

LIBS_SHA=$(git -C "$FAUSTLIBRARIES" rev-parse HEAD 2>/dev/null || echo unknown)
cat > "$HERE/provenance.json" <<JSON
{
  "faust-rs": "$FAUST_RS_SHA",
  "faustlibraries": "$LIBS_SHA",
  "built": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON
echo "wasm + provenance updated (faust-rs $FAUST_RS_SHA)"
