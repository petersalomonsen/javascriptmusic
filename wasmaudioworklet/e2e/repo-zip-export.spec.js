import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { waitForAppReady, clearOPFS } from './near-git-helpers.js';

// Downloading the OPFS repo as a zip. A project that exists only in a browser's
// origin-private storage is a project you can lose — there is no file on disk to
// back up, and clearing site data takes it with no warning.
//
// The unit tests (wasmgit/repozip.test.mjs) prove the archive is well formed.
// This proves the parts only a browser has: that wasm-git can list `.git`,
// that binary reads come back as bytes rather than mangled UTF-8, and that the
// download actually reaches the user.
//
// No NEAR sandbox needed: an unregistered `?gitrepo=` falls back to local OPFS.

const REPO = 'zip-export-test';

test.describe('export the repo as a zip', () => {
    // Fail fast: a wasm-git call that never answers should not burn 10 minutes.
    test.setTimeout(180000);
    test.afterEach(async ({ page }) => { await clearOPFS(page, REPO); });

    test('produces a zip containing the working tree and the git history', async ({ page }) => {
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.goto(`http://localhost:8080/?gitrepo=${REPO}`);
        await waitForAppReady(page);

        // A freshly-initialised local repo has `.git` but an empty working tree.
        // Staging two files gives us both halves — and staging writes real git
        // BLOB OBJECTS, which are zlib-compressed binary. Those are exactly what
        // a UTF-8 read would corrupt, and exactly what `git fsck` will catch.
        await page.evaluate(async () => {
            const git = await import('/wasmgit/wasmgitclient.js');
            await git.writefileandstage('song.js', 'setBPM(112);\n\nloopHere();\n');
            await git.writefileandstage('faust/kick.dsp', 'import("stdfaust.lib");\nprocess = os.osc(55);\n');
        });

        const listed = await page.evaluate(async () => {
            const git = await import('/wasmgit/wasmgitclient.js');
            const withGit = await git.listfiles('', { includeGit: true });
            const withoutGit = await git.listfiles('');
            return {
                withGit: withGit.filter((f) => f.startsWith('.git/')).length,
                withoutGit: withoutGit.filter((f) => f.startsWith('.git/')).length,
                total: withGit.length,
            };
        });
        // The default (working tree) must stay clean; the opt-in must add history.
        expect(listed.withoutGit).toBe(0);
        expect(listed.withGit).toBeGreaterThan(0);
        expect(listed.total).toBeGreaterThan(listed.withGit);

        const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
        await page.evaluate(async () => {
            const git = await import('/wasmgit/wasmgitclient.js');
            const { zipRepo, downloadBlob } = await import('/wasmgit/repozip.js');
            const { blob } = await zipRepo({ listfiles: git.listfiles, readfile: git.readfile });
            downloadBlob(blob, 'zip-export-test.zip');
        });
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe('zip-export-test.zip');

        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zipexport-'));
        const zipPath = path.join(dir, 'repo.zip');
        await download.saveAs(zipPath);
        expect(fs.statSync(zipPath).size).toBeGreaterThan(0);

        // Read it with a real zip tool, not our own parser.
        const listing = execFileSync('unzip', ['-l', zipPath], { encoding: 'utf8' });
        expect(listing).toMatch(/\.git\//);          // history came along
        expect(listing).toMatch(/song\.js/);         // and so did the working tree
        expect(execFileSync('unzip', ['-t', zipPath], { encoding: 'utf8' }))
            .toMatch(/No errors detected/);

        // A git object read as UTF-8 instead of bytes still extracts — it is
        // just silently corrupt. Extract and let git itself be the judge.
        const out = path.join(dir, 'out');
        execFileSync('unzip', ['-o', '-q', zipPath, '-d', out]);
        const fsck = execFileSync('git', ['fsck', '--no-progress', '--strict'], {
            cwd: out, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
        });
        expect(fsck).not.toMatch(/error|corrupt|invalid|bad/i);
        // git must also agree the staged content is what we put in — proof the
        // blob objects survived the round trip as bytes.
        const staged = execFileSync('git', ['ls-files', '--stage'], { cwd: out, encoding: 'utf8' });
        expect(staged).toMatch(/song\.js/);
        expect(staged).toMatch(/faust\/kick\.dsp/);
        const blob = execFileSync('git', ['cat-file', '-p', ':song.js'], { cwd: out, encoding: 'utf8' });
        expect(blob).toBe('setBPM(112);\n\nloopHere();\n');

        fs.rmSync(dir, { recursive: true, force: true });
    });
});
