# WebAssembly Music — documentation

Guides for making music and visuals in the app. For building/running the app
itself see the [app README](../README.md); for the monorepo overview see the
[top-level README](../../README.md).

## Authoring a song

- [Song API reference](song-api.md) — complete reference for writing songs in
  JavaScript: tracks, patterns, notes, timing, instruments, audio & video.
- [Animating images & text](animations.md) — frame-by-frame animation, text
  overlays, letterboxing and fades in the visualizer.

## Sharing & hosting

- [Hosting a song project in a NEAR-backed git repo](git-hosting.md) — create
  your own `?gitrepo=` repo and push a project to it (on-chain git storage).

## Other docs in the repo

- [faust2as transpiler](../../tools/faust2as/README.md) — Faust → AssemblyScript.
- [DX7 FM synth example](../../examples/dx7/README.md) — Yamaha DX7 algorithms as transpiled instruments, and porting real ROM (`.syx`) patches into a channel.
- [claude-bridge](../../tools/claude-bridge/README.md) — connect Claude Code to
  the app's editors.
- [DAW plugin](../../dawplugin/README.md) — load exported wasm instruments in a DAW.
- [Roadmap](../../ROADMAP.md)
