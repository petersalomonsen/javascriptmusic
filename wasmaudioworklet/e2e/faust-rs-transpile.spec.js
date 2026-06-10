import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-browser smoke test for the experimental faust-rs (Rust) compiler path
// (faust/faust-rs-transpile.js + faust_wasm_ffi.wasm).
//
// The wasm artifact is built from the faust-rs workspace and is gitignored
// here, so the test SKIPS when it's absent (e.g. CI). Build + copy:
//   FAUST_RS_EMBEDDED_LIB_ROOT=<faustlibraries> \
//     cargo run -p xtask -- build-faustwasm-compiler-module
//   cp target/wasm32-unknown-unknown/release/faust_wasm_ffi.wasm \
//      wasmaudioworklet/faust/faust_wasm_ffi.wasm
//
// The fixture intentionally exercises everything the in-app editor path
// needs: an `import("stdfaust.lib")` (resolved from the libraries embedded in
// the module), a sibling file pulled in via `library("helper.dsp")` (the
// virtual-file ABI), and an `effect =` declaration (the `-pn effect` path).

const WASM_PATH = path.join(__dirname, '..', 'faust', 'faust_wasm_ffi.wasm');

const HELPER_DSP = `mono2stereo(g) = _ <: _*g, _*g;
wet = hslider("wet", 0.5, 0, 1, 0.01);
`;

const MAIN_DSP = `import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
process = os.osc(freq) * gain * gate;
h = library("helper.dsp");
effect = h.mono2stereo(h.wet);
`;

test('faust-rs wasm module transpiles voice + library() sibling + effect=', async ({ page }) => {
    test.skip(!fs.existsSync(WASM_PATH), 'faust_wasm_ffi.wasm not built (see header comment)');

    await page.goto('/');

    const result = await page.evaluate(async ({ mainDsp, helperDsp }) => {
        // The app bundle may already have defined custom elements that the
        // source modules also define — make duplicate defines harmless.
        const origDefine = customElements.define.bind(customElements);
        customElements.define = (name, ctor, opts) => {
            try { origDefine(name, ctor, opts); } catch (e) { /* already defined */ }
        };
        const m = await import('/faust/faust-rs-transpile.js');
        const { ts, className } = await m.transpileDspSource(
            mainDsp,
            'testsynth.dsp',
            { 'helper.dsp': helperDsp }
        );
        return { ts, className };
    }, { mainDsp: MAIN_DSP, helperDsp: HELPER_DSP });

    expect(result.className).toBe('Testsynth');
    // voice class from `process`
    expect(result.ts).toContain('class Testsynth');
    // effect class from `effect =` (compiled via -pn effect, helper.dsp via
    // the virtual-file ABI)
    expect(result.ts).toContain('TestsynthEffect');
    // assembled editor-context single file
    expect(result.ts).toContain('initializeMidiSynth');
    expect(result.ts).toContain('postprocess');
});
