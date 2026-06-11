# @psalomo/faustwasm-rs

[faust-rs](https://github.com/sletz/faust-rs) — GRAME's Rust port of the
[Faust](https://faust.grame.fr) compiler — built as a single self-contained
`wasm32-unknown-unknown` module with the AssemblyScript (`-lang asc`) backend
enabled. **Binary distribution only**; the faust-rs sources are not yet
published.

Unlike emscripten-based libfaust builds there is no JS loader, no MEMFS and no
`.data` file: the module instantiates with zero imports and the Faust standard
libraries are embedded.

```js
const bytes = await (await fetch(wasmUrl)).arrayBuffer();
const { instance } = await WebAssembly.instantiate(bytes, {});
```

## ABI (summary)

All strings are UTF-8 written into the module memory via
`faust_wasm_alloc`/`faust_wasm_dealloc`.

- `faust_wasm_version_ptr/len` — compiler version string.
- `faust_wasm_generate_aux_files_json(name, source, args) -> handle` — the
  transpile entry point. Returns a text-result handle carrying a JSON array of
  base64-encoded artifacts on success, or the compiler diagnostic on failure
  (`faust_wasm_text_result_is_ok` distinguishes; read via
  `faust_wasm_text_result_ptr/len`, release with `faust_wasm_text_result_free`).
  Recognized args include `-lang asc`, `-cn <class>`, `-o <path>`,
  `-pn <process-name>` (e.g. `-pn effect`), `-I <dir>`, and
  `--virtual-source <path>=<base64>` for sibling `.lib`/`.dsp` sources.
- `faust_wasm_compile_dsp(...)` and related result accessors — Faust → WASM
  DSP compilation (standard faustwasm-style factory path).

See `wasmaudioworklet/faust/faust-rs-transpile.js` in the repository above for
a complete consumer.

## Provenance

Built from the faust-rs and faustlibraries revisions recorded in
`provenance.json`, via:

```
FAUST_RS_EMBEDDED_LIB_ROOT=<faustlibraries> \
  cargo run -p xtask -- build-faustwasm-compiler-module
```

## License

The faust-rs compiler is © GRAME, distributed here in binary form with
permission. The embedded Faust standard libraries are distributed under their
respective licenses (see
[faustlibraries](https://github.com/grame-cncm/faustlibraries)).
