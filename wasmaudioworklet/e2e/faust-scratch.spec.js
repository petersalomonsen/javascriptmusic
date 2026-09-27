import { test, expect } from '@playwright/test';
import { waitForAppReady, waitForStudioAgentTools, clearOPFS, specRepo } from './near-git-helpers.js';

// faust/scratch/ is where experiments go: a file there imports the project's
// .dsp/.lib as if it sat next to them, nothing in it is ever committed, and
// clear_scratch removes it in one go. The logic is unit-tested in
// faust/faust-files.test.mjs; this pins what only the real app can show —
// the Faust compiler resolving a project library from scratch/, and wasm-git
// keeping the folder out of `add .` (the staging step of Commit & Sync).
//
// No NEAR sandbox needed: specRepo() is a local OPFS repo.

const REPO = specRepo('faust-scratch');

const LIB = `import("stdfaust.lib");
tone(f) = os.sawtooth(f);
`;

const PROBE = `import("stdfaust.lib");
import("tones.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
process = tone(freq) * gain * en.asr(0.01, 1, 0.1, gate);
`;

const git = (page, command, args = []) => page.evaluate(async ({ command, args }) => {
    try { return await (await import('/wasmgit/wasmgitclient.js')).gitCommand(command, args); }
    catch (e) { return 'ERR ' + JSON.stringify(e); }
}, { command, args });

const run = (page, name, args) => page.evaluate(({ name, args }) => window.studioAgentRunTool(name, args), { name, args });

test.describe('faust/scratch/', () => {
    test.afterEach(async ({ page }) => {
        await clearOPFS(page, REPO);
    });

    test('an experiment imports the project library, stays out of the commit, and clear_scratch removes it', async ({ page }) => {
        await page.goto(`http://localhost:8080/?gitrepo=${REPO}`);
        await waitForAppReady(page);
        await waitForStudioAgentTools(page);

        expect(await run(page, 'write_faust', { path: 'tones.lib', source: LIB })).not.toHaveProperty('__error');
        const probe = await run(page, 'write_faust', { path: 'scratch/probe', source: PROBE });
        expect(probe).not.toHaveProperty('__error');
        expect(probe).toContain('Probe');

        const files = await page.evaluate(async () => (await import('/wasmgit/wasmgitclient.js')).listfiles('faust/'));
        expect(files).toEqual(expect.arrayContaining(['faust/tones.lib', 'faust/scratch/probe.dsp', 'faust/scratch/probe.ts']));
        expect(await run(page, 'list_faust')).toContain('scratch/probe.dsp  (scratch)');

        // what Commit & Sync commits: the library, never the experiment
        await git(page, 'add', ['.']);
        await git(page, 'config', ['user.name', 'spec']);
        await git(page, 'config', ['user.email', 'spec@example.com']);
        await git(page, 'commit', ['-m', 'scratch spec']);
        expect(await git(page, 'cat-file', ['-p', 'HEAD:faust/tones.lib'])).toContain('tone(f)');
        expect(await git(page, 'cat-file', ['-p', 'HEAD:faust/scratch/probe.dsp'])).toMatch(/^ERR/);
        expect(await git(page, 'status')).not.toContain('scratch');

        // refused while synth.ts still uses the experiment
        await run(page, 'set_synth', { source: "import { Probe } from '../faust/scratch/probe';\n" });
        const refused = await run(page, 'clear_scratch');
        expect(refused.__error).toContain("../faust/scratch/probe");

        await run(page, 'set_synth', { source: '// nothing from scratch\n' });
        expect(await run(page, 'clear_scratch')).toBe('cleared faust/scratch/: scratch/probe.dsp');
        const after = await page.evaluate(async () => (await import('/wasmgit/wasmgitclient.js')).listfiles('faust/'));
        expect(after.filter((p) => p.includes('scratch'))).toEqual([]);
        expect(after).toContain('faust/tones.lib');
    });
});
