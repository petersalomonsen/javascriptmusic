// Shared helpers for Playwright specs that exercise the wasm-git editor flow
// against the local NEAR sandbox (`npm run near-sandbox`).

export const SANDBOX_SERVER = 'http://localhost:3030';
export const NEAR_REPO_CONTRACT = 'repo.factory.sandbox';

let cachedCredentials = null;

export async function fetchCredentials() {
    if (cachedCredentials) return cachedCredentials;
    const res = await fetch(`${SANDBOX_SERVER}/near-credentials`);
    cachedCredentials = await res.json();
    cachedCredentials.rpcUrl = `${SANDBOX_SERVER}/near-rpc`;
    return cachedCredentials;
}

export async function setupServiceWorker(page) {
    const creds = await fetchCredentials();
    const publicKey = creds.publicKey.replace('ed25519:', '');
    const privateKey = creds.secretKey.replace('ed25519:', '');

    await page.evaluate(async ({ contractId, accountId, publicKey, privateKey }) => {
        // Seed localStorage so initNear() picks up credentials when the app loads.
        // The stateless service worker reads credentials from each request's
        // Authorization header (set by the wasmgit Web Worker).
        localStorage.setItem(`near-git-key:${contractId}`, JSON.stringify({
            accountId, publicKey, privateKey,
        }));

        await navigator.serviceWorker.register('/near-git-sw.js', { type: 'module' });
        await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
            await new Promise(resolve => {
                navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
            });
        }
    }, {
        contractId: NEAR_REPO_CONTRACT,
        accountId: creds.accountId,
        publicKey, privateKey,
    });
}

/**
 * An isolated, purely LOCAL repo for one spec file — PREFER THIS FOR NEW SPECS.
 *
 * A `?gitrepo=` name the sandbox cannot clone falls back to a persistent local
 * OPFS repo keyed on that name (see local-repo-persistence.spec.js), so a name
 * nobody else uses gives complete isolation with no setup, no sandbox and no
 * remote. Everything that needs `?gitrepo=` mode — the faust/ folder, the studio
 * agent's OPFS tools, git history — works exactly as it does against the real
 * remote.
 *
 *   await page.goto(`http://localhost:8080/?gitrepo=${specRepo('my-feature')}`);
 *
 * Why it matters: the shared sandbox repo (NEAR_REPO_CONTRACT) is mutated by
 * every spec that touches it and is only recreated once per CI job. clearOPFS
 * does NOT undo that — it clears the browser copy, and the app then re-clones
 * from the sandbox. So a test killed part-way (a CI retry, an interrupted local
 * run) leaves broken state that fails whichever spec runs next: a
 * deliberately-broken faust fixture from faust-editor.spec.js surfaced as
 * "missing `process` definition" inside studio-agent-mock.spec.js, which shares
 * none of its code. Reproduced locally — an interrupted run failed 4 tests, and
 * recreating the sandbox container restored all 12. pushBaseline now wipes the
 * tree before it pushes, which covers the specs that call it, but a spec that
 * drives the worker itself still leaves its files behind for the next one.
 *
 * Use the shared sandbox repo ONLY when the test genuinely exercises the NEAR
 * remote: cloning, commit & sync, push, or delete-local behaviour.
 */
export function specRepo(specName) {
    return `spec-${specName}.local`;
}

export async function clearOPFS(page, repoName) {
    await page.evaluate(async (name) => {
        try {
            const root = await navigator.storage.getDirectory();
            await root.removeEntry(name, { recursive: true });
        } catch (e) { }
    }, repoName);
}

export async function waitForAppReady(page) {
    await page.waitForFunction(() => {
        const app = document.querySelector('app-javascriptmusic');
        if (!app || !app.shadowRoot) return false;
        const songEditor = app.shadowRoot.querySelector('#editor .CodeMirror');
        const synthEditor = app.shadowRoot.querySelector('#assemblyscripteditor .CodeMirror');
        const wasmgitUi = app.shadowRoot.querySelector('wasmgit-ui');
        if (!songEditor || !synthEditor || !wasmgitUi || !wasmgitUi.shadowRoot) return false;
        return !!wasmgitUi.shadowRoot.getElementById('syncRemoteButton');
    }, { timeout: 60000 });
}

/**
 * Wait for the studio-agent tool hook.
 *
 * initStudioAgent() installs window.studioAgentRunTool as its LAST step, after
 * the editors and wasmgit-ui that waitForAppReady looks for — so a spec that
 * calls a tool right after waitForAppReady can win the race and see
 * "studioAgentRunTool is not a function". It only shows up on a loaded runner:
 * the same test passes locally and passed in CI until the runners got slower.
 */
export async function waitForStudioAgentTools(page) {
    await page.waitForFunction(() => typeof window.studioAgentRunTool === 'function', { timeout: 60000 });
}

/**
 * Reset the shared sandbox repo to a known baseline and push it (fast, no UI).
 *
 * This is a RESET, not just a `song.js` write. The sandbox repo is recreated
 * once per CI job and every spec that touches it commits into the same tree, so
 * without a wipe a spec inherits whatever the previous one left: a `synth.ts`
 * importing `../faust/<something>`, a half-written `faust/*.dsp`, a
 * `shader.glsl`. That is not hypothetical — `studio-agent-mock.spec.js`'s
 * shader test, which never calls `set_synth`, has failed with
 * "missing `process` definition" because it cloned a Faust-backed `synth.ts`
 * pushed by `faust-save-then-play-bug.spec.js` and `compile` then transpiled a
 * dsp the test never set up.
 *
 * So: every file in the working tree is unlinked, and only `song.js` is written
 * back. `synth.ts` intentionally does NOT survive — with no stored synth the
 * app falls back to `synth1/assembly/mixes/emptymidi.mix.ts`, a plain
 * AssemblyScript mix that compiles, and no `faust/` folder means the Faust
 * editor has no file selected and `compile` skips the transpile entirely.
 *
 * Specs that do not need the NEAR remote should still prefer {@link specRepo}.
 */
export async function pushBaseline(page, repoName, content) {
    const creds = await fetchCredentials();
    const publicKey = creds.publicKey.replace('ed25519:', '');
    const privateKey = creds.secretKey.replace('ed25519:', '');
    const accessToken = JSON.stringify({
        accountId: creds.accountId,
        publicKey, privateKey,
    });

    await page.evaluate(async ({ repoUrl, content, accessToken, username }) => {
        const worker = new Worker(new URL('/wasmgit/wasmgitworker.js', location.origin), { type: 'module' });
        let resolveNext;
        const pending = [];
        worker.onmessage = (msg) => {
            if (resolveNext) { const r = resolveNext; resolveNext = null; r(msg.data); }
            else pending.push(msg.data);
        };
        const next = () => pending.length > 0 ? Promise.resolve(pending.shift()) : new Promise(r => { resolveNext = r; });

        worker.postMessage({ accessToken, username, useremail: username });
        await next();

        worker.postMessage({ command: 'clone', url: repoUrl });
        await next();

        let id = 100;
        worker.postMessage({ command: 'init', args: ['.'], id: id++ });
        await next();
        worker.postMessage({ command: 'remote', args: ['add', 'origin', repoUrl], id: id++ });
        await next();

        // Wipe whatever the previous spec left behind. `unlinkfile` only
        // removes from the working tree; the deletion is staged at commit
        // time by commitpullpush's `add --update .`, so it lands in the push.
        worker.postMessage({ command: 'listfiles', id: id++ });
        const listReply = await next();
        for (const filename of (listReply.files || [])) {
            if (filename === 'song.js') continue; // rewritten below anyway
            worker.postMessage({ command: 'unlinkfile', filename });
            await next();
        }

        worker.postMessage({ command: 'writefileandstage', filename: 'song.js', contents: content });
        await next();
        worker.postMessage({ command: 'config', args: ['user.name', 'Test'], id: id++ });
        await next();
        worker.postMessage({ command: 'config', args: ['user.email', 'test@test.com'], id: id++ });
        await next();
        worker.postMessage({ command: 'commitpullpush', commitmessage: 'baseline', id: id++ });
        const pushReply = await next();
        worker.terminate();
        if (pushReply && pushReply.error) {
            let swError = '';
            try {
                const dbg = await caches.open('near-git-debug');
                const resp = await dbg.match('/last-push-error');
                if (resp) swError = ' | SW: ' + await resp.text();
            } catch (e) { }
            throw new Error('pushBaseline failed: ' + pushReply.error + swError);
        }
    }, {
        repoUrl: `http://localhost:8080/near-repo/${repoName}`,
        content,
        accessToken,
        username: creds.accountId,
    });
}

/** Read a single file from the repo via the wasmgit web worker. */
export async function readRepoFile(page, repoName, filename) {
    return await page.evaluate(async ({ repoUrl, filename }) => {
        const worker = new Worker(new URL('/wasmgit/wasmgitworker.js', location.origin), { type: 'module' });
        let resolveNext;
        const pending = [];
        worker.onmessage = (msg) => {
            if (resolveNext) { const r = resolveNext; resolveNext = null; r(msg.data); }
            else pending.push(msg.data);
        };
        const next = () => pending.length > 0 ? Promise.resolve(pending.shift()) : new Promise(r => { resolveNext = r; });
        try {
            // The repo is already in OPFS from the page's editor session.
            // Use synclocal to attach this fresh worker to the existing OPFS
            // repo (clone would fail because the directory already exists).
            // No auth handshake here: reading from local OPFS needs no token,
            // and an empty-string accessToken is falsy in the worker, so it
            // would never reply and this await would hang.
            worker.postMessage({ command: 'synclocal', url: repoUrl });
            const sync = await next();
            if (!sync || !sync.dircontents) {
                return null; // repo not present in OPFS
            }
            worker.postMessage({ command: 'readfile', filename });
            const reply = await next();
            if (!reply || reply.error) {
                return null; // file not found
            }
            return typeof reply.filecontents === 'string'
                ? reply.filecontents
                : new TextDecoder().decode(reply.filecontents);
        } finally {
            worker.terminate();
        }
    }, {
        repoUrl: `http://localhost:8080/near-repo/${repoName}`,
        filename,
    });
}
