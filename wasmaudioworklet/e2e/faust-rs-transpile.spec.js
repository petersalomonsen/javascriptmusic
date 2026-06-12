import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-browser smoke test for the experimental faust-rs (Rust) compiler path
// (faust/faust-rs-transpile.js + faust_wasm_ffi.wasm).
//
// The compiler module loads from the local gitignored build when present,
// otherwise from the published CDN package (so this also runs in CI).
// To test a fresh local build:
//   FAUST_RS_EMBEDDED_LIB_ROOT=<faustlibraries> \
//     cargo run -p xtask -- build-faustwasm-compiler-module
//   cp target/wasm32-unknown-unknown/release/faust_wasm_ffi.wasm \
//      wasmaudioworklet/faust/faust_wasm_ffi.wasm
//
// The fixture intentionally exercises everything the in-app editor path
// needs: an `import("stdfaust.lib")` (resolved from the libraries embedded in
// the module), a sibling file pulled in via `library("helper.dsp")` (the
// virtual-file ABI), and an `effect =` declaration (the `-pn effect` path).


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

    await page.goto('/');

    const result = await page.evaluate(async ({ mainDsp, helperDsp }) => {
        // The app bundle may already have defined custom elements that the
        // source modules also define — make duplicate defines harmless.
        const origDefine = customElements.define.bind(customElements);
        customElements.define = (name, ctor, opts) => {
            try { origDefine(name, ctor, opts); } catch (e) { /* already defined */ }
        };
        // Import the app's default transpile entry point — on this branch it
        // delegates to the faust-rs module.
        const m = await import('/faust/browser-transpile.js');
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
    // the `effect =` declaration (compiled via -pn effect, helper.dsp via the
    // virtual-file ABI) becomes the channel class's preprocess()
    expect(result.ts).toContain('class TestsynthChannel');
    expect(result.ts).toContain('preprocess()');
    // assembled editor-context single file
    expect(result.ts).toContain('initializeMidiSynth');
    expect(result.ts).toContain('postprocess');
    // UI params flow through the getJSON() snapshot (the effect's wet slider
    // becomes a named field on the generated channel class)
    expect(result.ts).toContain('wet: f32');
});

test('faust-rs resolves dx7.lib from the embedded library bundle', async ({ page }) => {

    await page.goto('/');

    const result = await page.evaluate(async () => {
        const origDefine = customElements.define.bind(customElements);
        customElements.define = (name, ctor, opts) => {
            try { origDefine(name, ctor, opts); } catch (e) { /* already defined */ }
        };
        const m = await import('/faust/browser-transpile.js');
        // dx.algorithm pulls dx7.lib, which lives in a faustlibraries
        // subdirectory — regression check for the flattened embed aliases.
        const { ts, className } = await m.transpileDspSource(
            'import("stdfaust.lib");\nprocess = dx.algorithm(5) <: _,_;\n',
            'dx7/dx7_alg5.dsp',
            {}
        );
        return { length: ts.length, className, hasClass: ts.includes('class Dx7Alg5') };
    });

    expect(result.className).toBe('Dx7Alg5');
    expect(result.hasClass).toBe(true);
    expect(result.length).toBeGreaterThan(10000);
});

// Full user scenario: transpile a DX7 algorithm in the browser (faust-rs
// path), assign per-channel patch params the way mixes/midi.mix.ts does
// (epiano.r12 = ..., epiano.tune2 = ...), and compile the result to WASM with
// the app's AssemblyScript compiler. Regression for:
//   - getJSON()-driven UI params (fields like r12/tune2 must exist on the
//     generated channel class — they were missing when getJSON was absent)
//   - method ordering (classInit/instanceInit extraction grabbed the wrong
//     bodies when definitions followed their call sites)
test('dx7 transpile + patch params + in-app AS compile', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('/');
    await page.waitForFunction(() => {
        const app = document.querySelector('app-javascriptmusic');
        return app && app.shadowRoot && app.shadowRoot.getElementById('startaudiobutton');
    }, { timeout: 30000 });

    // 1. Transpile in-browser through the default (faust-rs) path.
    const transpiled = await page.evaluate(async () => {
        const origDefine = customElements.define.bind(customElements);
        customElements.define = (name, ctor, opts) => {
            try { origDefine(name, ctor, opts); } catch (e) { /* already defined */ }
        };
        const m = await import('/faust/browser-transpile.js');
        const { ts, className } = await m.transpileDspSource(
            'import("stdfaust.lib");\nprocess = dx.algorithm(5) <: _,_;\n',
            'dx7_alg5.dsp',
            {}
        );
        return { ts, className };
    });
    expect(transpiled.className).toBe('Dx7Alg5');

    // Param-order parity tripwire: with C++-faust UI ordering, the bare `l1`
    // field is the GLOBAL Pitch EG L1 (init 50 = center). If UI ordering ever
    // regresses, an operator Amp EG L1 (init 99) grabs the name instead —
    // which scrambles every named patch assignment and NRPN number (heard as
    // pitch glides, since patch values land in the Pitch EG).
    expect(transpiled.ts).toMatch(/\/\*\* L1 \[init: 50,[^\n]*\n\s+l1: f32 = 50/);

    // 2. Inject midi.mix-style patch assignments on the typed channel.
    const construction = 'midichannels[0] = new Dx7Alg5Channel(10, (channel: MidiChannel) => new Dx7Alg5(channel));';
    expect(transpiled.ts).toContain(construction);
    const patched = transpiled.ts.replace(construction, [
        'const epiano = new Dx7Alg5Channel(10, (channel: MidiChannel) => new Dx7Alg5(channel));',
        '    midichannels[0] = epiano;',
        '    epiano.r12 = <f32>95.8819;',
        '    epiano.tune2 = <f32>3.0315;',
        '    epiano.coarse2 = <f32>13.9134;',
        '    epiano.l23 = <f32>74.8346;',
        '    epiano.keyVel2 = <f32>4.0236;',
        '    epiano.rateScaling3 = <f32>0.9921;',
        '    epiano.breakpoint2 = <f32>38.9764;',
        '    epiano.level3 = <f32>85.748;',
    ].join('\n'));

    // 3. Compile in-app: paste into the synth editor, set a song, save.
    await page.evaluate(({ synth, song }) => {
        const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
        shadowRoot.querySelector('#assemblyscripteditor .CodeMirror').CodeMirror.setValue(synth);
        shadowRoot.querySelector('#editor .CodeMirror').CodeMirror.setValue(song);
    }, {
        synth: patched,
        song: 'setBPM(120);\n\nawait createTrack(0).steps(4, [\n    c4,,e4,,\n    g4,,c5,,\n]);\n\nloopHere();\n',
    });

    const result = await page.evaluate(async (timeout) => {
        window.WASM_SYNTH_BYTES = null;
        const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
        shadowRoot.getElementById('savesongbutton').click();
        const errorElement = shadowRoot.querySelector('#errormessages span');
        const start = Date.now();
        while (Date.now() - start < timeout) {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (window.WASM_SYNTH_BYTES) {
                return { wasmLength: window.WASM_SYNTH_BYTES.length };
            }
            if (errorElement && errorElement.innerText) {
                return { error: errorElement.innerText };
            }
        }
        return { error: 'Timed out waiting for compilation result' };
    }, 90000);

    expect(result.error).toBeUndefined();
    expect(result.wasmLength).toBeGreaterThan(10000);
});
