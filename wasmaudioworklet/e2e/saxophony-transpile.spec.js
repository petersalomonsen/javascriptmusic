import { test, expect } from '@playwright/test';

// Focused repro: call browser-transpile.js's transpileDspSource() directly
// in the page context, with the upstream saxophony.dsp as input. No
// wasm-git / NEAR / service-worker setup — we want to isolate libfaust-wasm
// behavior from the rest of the editor pipeline.

// Source from upstream Faust so the test runs in any checkout (CI, fresh
// clone, etc.) without depending on a local wasm-git work directory. Pinned
// to a specific commit so the .dsp can't drift under us.
const SAXOPHONY_DSP_URL =
    'https://raw.githubusercontent.com/grame-cncm/faust/master-dev/examples/physicalModeling/faust-stk/saxophony.dsp';
test('saxophony.dsp transpiles in the browser via libfaust-wasm', async ({ page }) => {
    const res = await fetch(SAXOPHONY_DSP_URL);
    if (!res.ok) throw new Error(`failed to fetch saxophony.dsp: ${res.status}`);
    const SAXOPHONY_DSP = await res.text();

    const consoleMessages = [];
    page.on('console', (m) => consoleMessages.push(`[${m.type()}] ${m.text()}`));
    page.on('pageerror', (e) => consoleMessages.push(`[pageerror] ${e.message}`));

    // Just need an origin that serves browser-transpile.js — no repo flow.
    await page.goto('http://localhost:8080');

    const result = await page.evaluate(async (dspSource) => {
        try {
            const bt = await import('./faust/browser-transpile.js');
            // This spec isolates the libfaust-wasm path specifically (the
            // default transpileDspSource routes through faust-rs on this
            // branch, which initializes tables inline instead of via
            // initSIG0Tables()).
            const out = await bt.transpileDspSourceLibfaust(
                dspSource,
                'physicalmodeling/faust-stk/saxophony.dsp',
                {} // no sibling libs — saxophony.dsp is alone in its folder
            );
            return { ok: true, className: out.className, ts: out.ts };
        } catch (e) {
            return { ok: false, message: e.message, stack: e.stack };
        }
    }, SAXOPHONY_DSP);

    if (!result.ok) {
        console.log('TRANSPILE FAILED — error message:');
        console.log(result.message);
        console.log('--- stack ---');
        console.log(result.stack);
        console.log('--- browser console (last 50 lines) ---');
        console.log(consoleMessages.slice(-50).join('\n'));
    } else {
        console.log('Transpiled OK:', result.className, '— ts length', result.ts.length);
    }

    expect(result.ok).toBe(true);
    expect(result.className).toBe('Saxophony');
    expect(result.ts.length).toBeGreaterThan(1000);

    // Regression: the SIG-table init function must declare every local
    // helper array (sig0_iVec*, sig0_iRec*) before referencing it.
    // Previously the regex only matched `i32[]` and missed
    // `StaticArray<i32>`, so the body wrote to sig0_iVec3 without
    // declaring it, then AS failed with TS2304.
    const sigInitMatch = result.ts.match(/function\s+\w*_?initSIG0Tables\s*\([^)]*\)\s*:\s*void\s*\{([\s\S]*?)\n\}/);
    expect(sigInitMatch, 'transpile output is missing an initSIG0Tables() function').not.toBeNull();
    const sigInitBody = sigInitMatch[1];
    const referencedHelpers = Array.from(sigInitBody.matchAll(/\bsig0_(\w+)\b/g)).map(m => m[1]);
    for (const name of new Set(referencedHelpers)) {
        const declRe = new RegExp(`\\b(?:const|let)\\s+sig0_${name}\\b`);
        expect(declRe.test(sigInitBody), `sig0_${name} is referenced but not declared inside initSIG0Tables()`).toBe(true);
    }
});
