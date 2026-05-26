import { test, expect } from '@playwright/test';

// Regression: progress spinner is invisible on the *second* (and later)
// transpileDspSource() calls because the libfaust compiler promise is
// cached at module scope. On the first call, fetching/instantiating
// libfaust-wasm yields to the event loop multiple times, so the spinner
// element is appended, laid out, painted. On subsequent calls the entire
// transpile completes in microtasks: the <progress-spinner> is appended
// and removed inside the same animation frame and the browser never paints
// it. The fix forces one paint frame after toggleSpinner(true).
//
// No NEAR sandbox / git needed here — we call transpileDspSource() directly
// from the page via dynamic import. A ResizeObserver on the spinner element
// is our "did the browser actually lay it out" probe.

const DSP_A = `import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
process = os.sawtooth(freq) * gain * en.adsr(0.01, 0.1, 0.7, 0.2, gate) <: _, _;
`;

const DSP_B = DSP_A.replace('os.sawtooth(freq)', 'os.square(freq)');

const installSpinnerObserver = (page) => page.evaluate(() => {
    window.__spinnerAdds = 0;
    window.__spinnerPainted = 0;
    const ro = new ResizeObserver((entries) => {
        for (const e of entries) {
            if (e.contentRect.width > 0 && e.contentRect.height > 0) {
                window.__spinnerPainted++;
            }
        }
    });
    const mo = new MutationObserver((muts) => {
        for (const m of muts) {
            for (const n of m.addedNodes) {
                if (n.nodeType === 1 && n.tagName && n.tagName.toLowerCase() === 'progress-spinner') {
                    window.__spinnerAdds++;
                    ro.observe(n);
                }
            }
        }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    window.__stopSpinnerObserver = () => { mo.disconnect(); ro.disconnect(); };
});

const readSpinnerStats = (page) => page.evaluate(() => ({
    adds: window.__spinnerAdds || 0,
    painted: window.__spinnerPainted || 0,
}));

test('progress-spinner paints during every faust transpile, not just the first', async ({ page }) => {
    page.on('console', (m) => {
        if (m.type() === 'error' || m.type() === 'warning') console.log('[browser]', m.type(), m.text());
    });
    page.on('pageerror', (e) => console.log('[browser-error]', e.message));

    await page.goto('http://localhost:8080');
    // Wait until the app is far enough along that <progress-spinner> is a
    // registered custom element (defined in common/ui/progress-spinner.js).
    await page.waitForFunction(() => !!customElements.get('progress-spinner'),
        { timeout: 30000 });

    // First transpile — compiler not yet cached, libfaust-wasm fetches.
    await installSpinnerObserver(page);
    await page.evaluate(async (src) => {
        const m = await import('/faust/browser-transpile.js');
        await m.transpileDspSource(src, 'spinnertest.dsp', {});
    }, DSP_A);
    const first = await readSpinnerStats(page);
    await page.evaluate(() => window.__stopSpinnerObserver && window.__stopSpinnerObserver());

    // Second transpile — compiler cached. Without the fix the spinner
    // toggle-on / toggle-off happens entirely in microtasks and the user
    // never sees it.
    await installSpinnerObserver(page);
    await page.evaluate(async (src) => {
        const m = await import('/faust/browser-transpile.js');
        await m.transpileDspSource(src, 'spinnertest.dsp', {});
    }, DSP_B);
    const second = await readSpinnerStats(page);
    await page.evaluate(() => window.__stopSpinnerObserver && window.__stopSpinnerObserver());

    console.log('first:', first, 'second:', second);

    expect(first.adds).toBeGreaterThan(0);
    expect(first.painted).toBeGreaterThan(0);
    expect(second.adds).toBeGreaterThan(0);
    expect(second.painted).toBeGreaterThan(0);
});
