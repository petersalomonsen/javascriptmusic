// Embeddable bundle entry: exports the native (non-sandboxed) compile so the
// bundle stays self-contained — rollup tree-shakes the unused sandboxed
// compileSong away, so neither quickjssandbox.js nor the QuickJS wasm end up
// referenced from the bundle. Sandboxing the embeddable players is a
// follow-up.
export { compileSongUnsafe as compileSong, generateSong, songargkeys } from './songcompiler.js';
