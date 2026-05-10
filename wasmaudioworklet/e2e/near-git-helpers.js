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

/** Push a baseline commit via worker (fast, no UI). */
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
            throw new Error('pushBaseline failed: ' + pushReply.error);
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
            // Replay just enough to get the worker into the right cwd.
            worker.postMessage({ accessToken: '', username: '', useremail: '' });
            await next();
            worker.postMessage({ command: 'clone', url: repoUrl });
            await next();
            let id = 200;
            worker.postMessage({ command: 'readfile', filename, id: id++ });
            const reply = await next();
            return reply && reply.contents;
        } finally {
            worker.terminate();
        }
    }, {
        repoUrl: `http://localhost:8080/near-repo/${repoName}`,
        filename,
    });
}
