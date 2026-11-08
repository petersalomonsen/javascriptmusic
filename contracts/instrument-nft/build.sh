#!/bin/bash
# Builds out/instrument_nft.wasm. The JS engine comes from a pinned checkout of
# quickjs-rust-near, placed in ../.build/ (gitignored). Set QUICKJS_RUST_NEAR to a
# local checkout that has emsdk/ and quickjs-*/ to reuse them instead of installing.
set -euo pipefail
cd "$(dirname "$0")"

QJS_REV=53481b2
QUICKJS=quickjs-2026-06-04
QJS=../.build/quickjs-rust-near
if [ ! -d "$QJS/.git" ]; then
  mkdir -p ../.build
  git clone --quiet https://github.com/petersalomonsen/quickjs-rust-near.git "$QJS"
fi
git -C "$QJS" checkout --quiet "$QJS_REV"

if [ -n "${QUICKJS_RUST_NEAR:-}" ]; then
  ln -sfn "$QUICKJS_RUST_NEAR/emsdk" "$QJS/emsdk"
  ln -sfn "$QUICKJS_RUST_NEAR/$QUICKJS" "$QJS/$QUICKJS"
fi
# The engine's build.rs links libquickjs.a from this folder, at the checkout's root.
if [ ! -d "$QJS/$QUICKJS" ]; then
  curl -fsSL "https://bellard.org/quickjs/$QUICKJS.tar.xz" | tar -xJ -C "$QJS"
fi
if ! command -v emcc > /dev/null; then
  if [ ! -d "$QJS/emsdk" ]; then
    git clone --quiet https://github.com/emscripten-core/emsdk.git "$QJS/emsdk"
    (cd "$QJS/emsdk" && git checkout --quiet 3.1.74 && ./emsdk install 3.1.74 && ./emsdk activate 3.1.74)
  fi
  set +u; source "$QJS/emsdk/emsdk_env.sh"; set -u
fi

cargo build --target=wasm32-unknown-unknown --release
mkdir -p out
FEATURES="--enable-sign-ext --enable-bulk-memory --enable-nontrapping-float-to-int --enable-mutable-globals"
wasm-metadce $FEATURES -f meta-dce.json target/wasm32-unknown-unknown/release/instrument_nft.wasm -o out/instrument_nft.wasm
# NEAR's runtime lacks these post-MVP features, so they are lowered away.
wasm-opt $FEATURES --signext-lowering --llvm-nontrapping-fptoint-lowering --llvm-memory-copy-fill-lowering --converge -Oz out/instrument_nft.wasm -o out/instrument_nft.wasm
ls -l out/instrument_nft.wasm
