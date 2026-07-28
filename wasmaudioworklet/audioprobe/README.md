# audioprobe

Render the compiled synth offline and measure what comes out. Used by the studio
agent's `probe_instrument` tool and by the CLI harness in
`tools/instrumenttest/render.mjs` — it lives here, rather than under
`studio-agent/`, because both depend on it.

- `audioanalysis.js` — pure measurement over sample arrays: peak, RMS, radix-2
  FFT, dominant frequency and spectral centroid. No DOM, no wasm, no node
  builtins, so the browser, the CLI and the unit tests share one implementation.
- `instrumentprobe.js` — plays MIDI notes into an already-compiled synth wasm
  (no AudioContext, far faster than realtime) and measures the result.

## Why

A Faust voice that declares no `gate` transpiles, registers and compiles
perfectly, and is **silent**. Nothing else in the toolchain notices, and the
agent cannot hear it — so it reports success and the user presses play to
nothing. Rendering a note and measuring it is the only check that catches this.

The spectral centroid is what makes drums distinguishable without listening: a
kick sits near 100Hz, a hi-hat above 10kHz. Two notes with the same centroid are
the same sound — which is how you verify that a note actually selects a drum.

**The caller never supplies wasm.** The module always comes from the last
compile. The same QuickJS sandbox runs songs shared by other people, and a host
function that instantiated caller-supplied wasm would hand any shared song
arbitrary code execution in the user's tab.
