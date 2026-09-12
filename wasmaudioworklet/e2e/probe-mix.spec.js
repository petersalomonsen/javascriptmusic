import { test, expect } from '@playwright/test';
import { waitForAppReady, waitForStudioAgentTools } from './near-git-helpers.js';

// The whole-mix measurement the mastering specialist steers by, run in the
// real app: the starter workspace song compiled with the Mastering chain wired
// into postprocess(), then probe_mix through the browser tool registry. This
// pins three things the Node tests cannot: the generated fx/mastering.ts is in
// the browser source bundle and compiles there, the offline render reads the
// compiled event list the app publishes, and the report reaches the agent as
// text. Needs NO NEAR sandbox: the workspace repo is purely local.

const editorValue = (page, selector) => page.evaluate((sel) => document.querySelector('app-javascriptmusic')
    .shadowRoot.querySelector(`${sel} .CodeMirror`).CodeMirror.getValue(), selector);
const setEditor = (page, selector, value) => page.evaluate(([sel, v]) => document.querySelector('app-javascriptmusic')
    .shadowRoot.querySelector(`${sel} .CodeMirror`).CodeMirror.setValue(v), [selector, value]);

test('probe_mix measures the compiled song, and the Mastering chain in postprocess() moves the numbers', async ({ page }) => {
    test.setTimeout(300000);
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));
    await page.goto('http://localhost:8080/?defaultrepo=1');
    await waitForAppReady(page);
    await waitForStudioAgentTools(page);

    // Before anything is compiled the tool says so instead of guessing.
    await page.evaluate(() => { window.WASM_SYNTH_BYTES = null; window.lastCompiledEventList = null; });
    const early = await page.evaluate(() => window.studioAgentRunTool('probe_mix', {}));
    expect(early.__error).toMatch(/compile first/);

    // The starter as it is: compile, measure.
    await page.locator('#savesongbutton').click();
    await page.waitForFunction(() => window.WASM_SYNTH_BYTES != null && window.lastCompiledEventList != null, { timeout: 120000 });
    const before = await page.evaluate(() => window.studioAgentRunTool('probe_mix', {}));
    console.log('[probe_mix before]\n' + before);
    expect(typeof before).toBe('string');
    expect(before).toMatch(/^(MASTER OK|NOT READY) for streaming & video/);
    expect(before).toMatch(/\nloudness: integrated -?[\d.]+ LUFS/);
    expect(before).toMatch(/\npeaks: true peak -?[\d.]+ dBTP/);
    expect(before).toMatch(/\nsections \(bars: LUFS\):/);
    const lufs = (report) => Number(/integrated (-?[\d.]+) LUFS/.exec(report)[1]);
    expect(Number.isFinite(lufs(before))).toBe(true);

    // Wire the Mastering chain into the starter synth exactly as the mastering
    // specialist would, with a large gain so the change is unmistakable.
    const synth = await editorValue(page, '#assemblyscripteditor');
    expect(synth).toContain('export function postprocess(): void {');
    const mastered = (`import { Mastering } from '../mixes/globalimports';\nconst mastering = new Mastering();\n` + synth)
        .replace('export function initializeMidiSynth(): void {', 'export function initializeMidiSynth(): void {\n    mastering.gainDb = 24.0;\n    mastering.limiterCeilingDb = -3.0;\n    mastering.lowMonoHz = 120;')
        .replace(/export function postprocess\(\): void \{[^}]*\}/, 'export function postprocess(): void { mastering.processOutputline(); }');
    expect(mastered).toContain('mastering.processOutputline()');
    await setEditor(page, '#assemblyscripteditor', mastered);
    // compile through the agent's tool: a compiler error comes back as text instead of a silent stall
    const compiled = await page.evaluate(() => window.studioAgentRunTool('compile', {}));
    console.log('[compile]\n' + (typeof compiled === 'string' ? compiled : JSON.stringify(compiled)));
    expect(compiled.__error, compiled.__error).toBeUndefined();
    expect(compiled).toMatch(/compiled OK/);

    const after = await page.evaluate(() => window.studioAgentRunTool('probe_mix', { target: 'streaming' }));
    console.log('[probe_mix after]\n' + after);
    expect(typeof after).toBe('string');
    // 24 dB in against a -3 dB brickwall: louder than before (the 2:1 compressor
    // takes most of the gain), the sample peak pinned exactly at the ceiling, nothing clipped.
    expect(lufs(after)).toBeGreaterThan(lufs(before) + 1);
    const samplePeak = Number(/sample peak (-?[\d.]+) dBFS/.exec(after)[1]);
    expect(samplePeak).toBeLessThanOrEqual(-2.9);
    expect(samplePeak).toBeGreaterThan(-3.2);
    expect(after).toMatch(/clipped samples 0/);

    // auto_master: from the hand-wired (too hot) state, converge by compile + measure
    // in the app — trial builds through the compile worker, measurements in the mix
    // probe worker — and write the settings back into the editor, saved.
    const auto = await page.evaluate(() => window.studioAgentRunTool('auto_master', { target: 'streaming' }));
    console.log('[auto_master]\n' + (typeof auto === 'string' ? auto : JSON.stringify(auto)));
    expect(auto.__error, auto.__error).toBeUndefined();
    expect(auto).toMatch(/^auto_master: MASTER OK for streaming & video/);
    expect(auto).toMatch(/settings written to synth\.ts: gainDb -?[\d.]+, limiterCeilingDb -1\.5/);
    expect(auto).toMatch(/synth\.ts updated and saved/);
    const finalSynth = await editorValue(page, '#assemblyscripteditor');
    expect(finalSynth).toContain('// --- mastering: set by auto_master');
    expect(finalSynth).toContain('mastering.processOutputline()');
    expect((finalSynth.match(/new Mastering\(\)/g) || []).length).toBe(1);
    // and the live build agrees with the report
    const verify = await page.evaluate(() => window.studioAgentRunTool('probe_mix', { target: 'streaming' }));
    expect(verify).toMatch(/^MASTER OK for streaming & video/);
});
