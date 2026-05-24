import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Focused repro: call browser-transpile.js's transpileDspSource() directly
// in the page context, with the user-reported saxophony.dsp as input.
// No wasm-git / NEAR / service-worker setup — we want to isolate libfaust-wasm
// behavior from the rest of the editor pipeline.

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAXOPHONY_DSP_PATH = resolve(
    __dirname,
    '../../tools/claude-bridge/work/localhost_8080/ifc2026-concert.gitfactory.testnet/faust/physicalmodeling/faust-stk/saxophony.dsp'
);
const SAXOPHONY_DSP = readFileSync(SAXOPHONY_DSP_PATH, 'utf-8');

test('saxophony.dsp transpiles in the browser via libfaust-wasm', async ({ page }) => {
    const consoleMessages = [];
    page.on('console', (m) => consoleMessages.push(`[${m.type()}] ${m.text()}`));
    page.on('pageerror', (e) => consoleMessages.push(`[pageerror] ${e.message}`));

    // Just need an origin that serves browser-transpile.js — no repo flow.
    await page.goto('http://localhost:8080');

    const result = await page.evaluate(async (dspSource) => {
        try {
            const bt = await import('./faust/browser-transpile.js');
            const out = await bt.transpileDspSource(
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
