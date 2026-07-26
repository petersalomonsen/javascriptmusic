import { test, expect } from '@playwright/test';

// Regression for issue #183: with `?gitrepo=A&remote=…/B.git` the local OPFS
// directory used to be named after the REMOTE (B.git) while synclocal and
// "Delete local" both looked for the `?gitrepo=` name (A.git). The result was a
// delete that removed nothing yet reported "Local clone deleted", plus a doomed
// re-clone on every boot whose failure was masked by the existing directory.
//
// No remote server needed: the OPFS directory name is decided before any
// network traffic, and `initlocal` takes the same repoName path as `clone`.

const GITREPO = 'july26song';                       // ?gitrepo=
const NEAR_URL = `http://localhost:8080/near-repo/${GITREPO}.git`;
// A remote whose basename deliberately differs from the ?gitrepo= name.
const REMOTE_URL = 'http://localhost:8080/gitproxy/github.com/petersalomonsen/wasm-music-2026.git';
const CANONICAL_DIR = `${GITREPO}.git`;
const LEGACY_DIR = 'wasm-music-2026.git';

// Drive the git worker directly with the same messages wasmgitclient sends.
async function driveWorker(page, steps) {
    return await page.evaluate(async ({ steps }) => {
        const worker = new Worker(new URL('/wasmgit/wasmgitworker.js', location.origin), { type: 'module' });
        const pending = [];
        let resolveNext;
        worker.onmessage = (msg) => {
            if (resolveNext) { const r = resolveNext; resolveNext = null; r(msg.data); }
            else pending.push(msg.data);
        };
        const nextRaw = () => pending.length ? Promise.resolve(pending.shift()) : new Promise(r => (resolveNext = r));
        const next = (ms) => Promise.race([nextRaw(), new Promise(res => setTimeout(() => res({ __timeout: true }), ms))]);

        const out = {};
        try {
            for (const step of steps) {
                worker.postMessage(step.msg);
                out[step.name] = await next(step.ms || 20000);
            }
        } finally {
            worker.terminate();
        }
        return out;
    }, { steps });
}

const listOPFS = (page) => page.evaluate(async () => {
    const names = [];
    for await (const [name] of (await navigator.storage.getDirectory()).entries()) names.push(name);
    return names.sort();
});

const clearOPFS = (page) => page.evaluate(async () => {
    const root = await navigator.storage.getDirectory();
    for await (const [name] of root.entries()) {
        try { await root.removeEntry(name, { recursive: true }); } catch (e) { /* ignore */ }
    }
});

// What deletelocal() ultimately does, given the directory name it resolved.
const removeOPFSEntry = (page, repoName) => page.evaluate(async (name) => {
    try {
        await (await navigator.storage.getDirectory()).removeEntry(name, { recursive: true });
        return { ok: true };
    } catch (e) {
        return { ok: false, error: `${e.name}: ${e.message}` };
    }
}, repoName);

test.describe('local repo directory naming with ?remote=', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8080/');
        await clearOPFS(page);
    });

    test.afterEach(async ({ page }) => await clearOPFS(page));

    test('the OPFS directory is named after ?gitrepo=, not the remote url', async ({ page }) => {
        const out = await driveWorker(page, [
            { name: 'synclocal', msg: { command: 'synclocal', url: NEAR_URL, repoName: CANONICAL_DIR }, ms: 8000 },
            // The client passes the REMOTE url to clone from, but the canonical
            // repoName for where it lands. initlocal takes the same path and
            // needs no reachable server.
            { name: 'initlocal', msg: { command: 'initlocal', url: NEAR_URL, repoName: CANONICAL_DIR, remoteUrl: REMOTE_URL } },
        ]);

        expect(out.synclocal.dircontents).toBeNull();
        expect(out.initlocal.dircontents).toContain('.git');
        expect(out.initlocal.repoName).toBe(CANONICAL_DIR);

        expect(await listOPFS(page)).toEqual([CANONICAL_DIR]);
        expect(await listOPFS(page)).not.toContain(LEGACY_DIR);
    });

    test('a clone lands in the ?gitrepo= directory even when cloning from another url', async ({ page }) => {
        // The remote 404s, so the clone fails — but the failure message names
        // the target directory, which is what this test is about.
        const messages = [];
        page.on('console', m => messages.push(m.text()));

        await driveWorker(page, [
            { name: 'clone', msg: { command: 'clone', url: REMOTE_URL, repoName: CANONICAL_DIR }, ms: 20000 },
        ]);

        expect(messages.some(m => m.includes(`/opfs/${CANONICAL_DIR}`))).toBe(true);
        expect(messages.some(m => m.includes(`/opfs/${LEGACY_DIR}`))).toBe(false);
    });

    test('synclocal finds the repo again on the next boot, so no re-clone is attempted', async ({ page }) => {
        await driveWorker(page, [
            { name: 'initlocal', msg: { command: 'initlocal', url: NEAR_URL, repoName: CANONICAL_DIR, remoteUrl: REMOTE_URL } },
            { name: 'write', msg: { command: 'writefileandstage', filename: 'song.js', contents: '// my work\n' } },
        ]);

        // Fresh worker == reload. Before the fix this returned null (it looked
        // for the ?gitrepo= name while the clone sat under the remote name),
        // sending every boot into a clone that only "succeeded" by adopting the
        // directory already in the way.
        const out = await driveWorker(page, [
            { name: 'synclocal', msg: { command: 'synclocal', url: NEAR_URL, repoName: CANONICAL_DIR, legacyRepoName: LEGACY_DIR }, ms: 8000 },
        ]);

        expect(out.synclocal.dircontents).not.toBeNull();
        expect(out.synclocal.dircontents).toContain('song.js');
        expect(out.synclocal.repoName).toBe(CANONICAL_DIR);
    });

    test('delete local removes the directory the worker actually used', async ({ page }) => {
        const out = await driveWorker(page, [
            { name: 'initlocal', msg: { command: 'initlocal', url: NEAR_URL, repoName: CANONICAL_DIR, remoteUrl: REMOTE_URL } },
        ]);

        // deletelocal() targets the name the worker reported, NOT a name
        // re-derived from a url — that mismatch is the bug.
        expect(await removeOPFSEntry(page, out.initlocal.repoName)).toEqual({ ok: true });
        expect(await listOPFS(page)).toEqual([]);
    });

    test('LEGACY: a pre-fix clone under the remote-derived name is adopted, and deletable', async ({ page }) => {
        // Recreate the old on-disk state: repo sitting in the remote-derived
        // directory, because that is where pre-#183 builds put it.
        await driveWorker(page, [
            { name: 'initlocal', msg: { command: 'initlocal', url: REMOTE_URL, remoteUrl: REMOTE_URL } },
            { name: 'write', msg: { command: 'writefileandstage', filename: 'song.js', contents: '// work from before the fix\n' } },
        ]);
        expect(await listOPFS(page)).toEqual([LEGACY_DIR]);

        // Boot with the fix: the canonical directory is absent, so the legacy
        // one must be adopted rather than left orphaned beside a fresh clone.
        const out = await driveWorker(page, [
            { name: 'synclocal', msg: { command: 'synclocal', url: NEAR_URL, repoName: CANONICAL_DIR, legacyRepoName: LEGACY_DIR }, ms: 8000 },
            { name: 'read', msg: { command: 'readfile', filename: 'song.js' } },
        ]);

        expect(out.synclocal.dircontents).toContain('song.js');
        expect(out.synclocal.repoName).toBe(LEGACY_DIR);     // reported honestly
        const read = out.read.filecontents;
        const contents = typeof read === 'string' ? read : new TextDecoder().decode(read);
        expect(contents).toBe('// work from before the fix\n');

        // …and "Delete local" must then remove THAT directory.
        expect(await removeOPFSEntry(page, out.synclocal.repoName)).toEqual({ ok: true });
        expect(await listOPFS(page)).toEqual([]);
    });
});
