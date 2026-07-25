import { test, expect } from '@playwright/test';

// Focused repro: call faust-rs-transpile.js's transpileDspSource() directly
// in the page context, with the upstream saxophony.dsp as input. No
// wasm-git / NEAR / service-worker setup — we want to isolate the compiler
// module behavior from the rest of the editor pipeline.

// Source from upstream Faust so the test runs in any checkout (CI, fresh
// clone, etc.) without depending on a local wasm-git work directory.
const SAXOPHONY_DSP_URL =
    'https://raw.githubusercontent.com/grame-cncm/faust/master-dev/examples/physicalModeling/faust-stk/saxophony.dsp';
test('saxophony.dsp transpiles in the browser via the faust-rs module', async ({ page }) => {
    const res = await fetch(SAXOPHONY_DSP_URL);
    if (!res.ok) throw new Error(`failed to fetch saxophony.dsp: ${res.status}`);
    const SAXOPHONY_DSP = await res.text();

    const consoleMessages = [];
    page.on('console', (m) => consoleMessages.push(`[${m.type()}] ${m.text()}`));
    page.on('pageerror', (e) => consoleMessages.push(`[pageerror] ${e.message}`));

    // Just need an origin that serves faust-rs-transpile.js — no repo flow.
    await page.goto('http://localhost:8080');

    const result = await page.evaluate(async (dspSource) => {
        try {
            const bt = await import('./faust/faust-rs-transpile.js');
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

    // Native execution-options output: the DSP class ships control()/frame()
    // and the MidiVoice wrapper delegates to them (no compute() reshape).
    expect(result.ts).toContain('export class SaxophonyDsp');
    expect(result.ts).toContain('control(): void {');
    expect(result.ts).toContain('frame(inputs: StaticArray<f32>, outputs: StaticArray<f32>): void {');
    expect(result.ts).toContain('export class Saxophony extends MidiVoice');
    expect(result.ts).toContain('this.dsp.frame(this.fin, this.fout);');
});
