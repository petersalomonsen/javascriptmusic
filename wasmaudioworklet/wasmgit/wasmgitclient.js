import { initNear, authdata as nearAuthData, ensureAuth as nearEnsureAuth, isNearRepo, logout as nearLogout } from './nearacl.js';
import { toggleSpinner } from '../common/ui/progress-spinner.js';
import { modal, modalPrompt } from '../common/ui/modal.js';

async function registerNearGitServiceWorker() {
    await navigator.serviceWorker.register('/near-git-sw.js', { type: 'module' });
    await navigator.serviceWorker.ready;

    if (!navigator.serviceWorker.controller) {
        await new Promise(resolve => {
            navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
        });
    }
}

export const CONFIG_FILE = 'wasmmusic.config.json';

// The OPFS directory a git url maps to — the last path segment, e.g.
// `…/near-repo/mysong.git` -> `mysong.git`.
export function repoNameFromUrl(url) {
    return url.substring(url.lastIndexOf('/') + 1);
}

export let worker;

let gitrepourl;
// The `?…&remote=<url>` override, if any. Kept so the OPFS directory name can
// stay tied to `?gitrepo=` while the clone still happens FROM the remote.
let gitremoteurl;
// Name of the OPFS directory actually holding the repo, as reported by the
// worker. Normally repoNameFromUrl(gitrepourl), but an older clone (see
// LEGACY note below) may live under the remote-derived name instead.
let localRepoName;
let commitAndPushButton;
let discardChangesButton;
let deleteLocalButton;
let switchSongButton;

const remoteSyncListeners = [];

let workerMessageListeners = [];

let msgId = 1;
async function callAndWaitForWorker(message) {
    return await new Promise((resolve, reject) => {
        workerMessageListeners.push((msg) => {
            if (msg.data.id === message.id) {
                if (msg.data.error) {
                    reject(msg.data);
                } else {
                    resolve(msg.data);
                }
            } else {
                return true;
            }
        });
        message.id = msgId++;
        worker.postMessage(message);
    });
}

// Generic git command passthrough — returns the captured stdout. Used by the
// studio agent to inspect history and restore committed files from OPFS.
export async function gitCommand(command, args = []) {
    const res = await callAndWaitForWorker({ command, args });
    return res.result;
}

// Give the git worker a bring-your-own auth token (e.g. a GitHub fine-grained
// PAT) + commit identity, so "Commit & Sync" can push to a `remote=…/gitproxy/…`
// target. The worker sends it as `Authorization: Bearer <token>`; the CORS proxy
// translates that to the Basic auth GitHub expects. Exposed as window.setGitToken
// for now — a proper token-input UI is a follow-up.
export async function setGitAuthToken(token, { username = 'wasmmusic', useremail = 'wasmmusic@users.noreply.github.com' } = {}) {
    return await new Promise((resolve) => {
        workerMessageListeners.push((msg) => {
            if (msg.data.accessTokenConfigured) { resolve(true); return; }
            return true;
        });
        worker.postMessage({ accessToken: token, username, useremail });
    });
}

// `git log` uses a dedicated worker branch that replies with { log } (no id).
export async function gitLog() {
    return await new Promise((resolve) => {
        workerMessageListeners.push((msg) => {
            if (msg.data.log !== undefined) { resolve(msg.data.log); return; }
            return true;
        });
        worker.postMessage({ command: 'log' });
    });
}

const GIT_TOKEN_KEY = 'git-http-token';

// Apply a stored (or prompted) BYO git token to the worker BEFORE a clone/push,
// so a PRIVATE remote repo can authenticate. Only used for `remote=` (gitproxy)
// repos — NEAR repos use their own credentials.
async function applyStoredGitToken(promptIfMissing) {
    let stored = null;
    try { stored = JSON.parse(sessionStorage.getItem(GIT_TOKEN_KEY) || 'null'); } catch (e) { /* ignore */ }
    if ((!stored || !stored.token) && promptIfMissing) {
        const token = await modalPrompt('GitHub token',
            'Fine-grained PAT (Contents: read/write) to clone/push this repo. Leave empty for a public repo.', '');
        if (token) {
            stored = { token, username: 'wasmmusic', useremail: 'wasmmusic@users.noreply.github.com' };
            try { sessionStorage.setItem(GIT_TOKEN_KEY, JSON.stringify(stored)); } catch (e) { /* ignore */ }
        }
    }
    if (stored && stored.token) { await setGitAuthToken(stored.token, { username: stored.username, useremail: stored.useremail }); return true; }
    return false;
}

/**
 * Hand NEAR credentials to the git worker, which turns them into the
 * Authorization header the repo contract's `push` expects. Called at init when
 * a key is already stored, and again straight after a just-in-time sign-in.
 */
async function sendNearCredentials(auth) {
    await new Promise(resolve => {
        workerMessageListeners.push((msg) => {
            if (msg.data.accessTokenConfigured) { resolve(); }
            else { return true; }
        });
        worker.postMessage({
            accessToken: JSON.stringify({
                accountId: auth.username,
                publicKey: auth.publicKey,
                privateKey: auth.privateKey,
            }),
            username: auth.username,
            useremail: auth.useremail || auth.username,
        });
    });
}

export async function initWASMGitClient(gitrepo, remoteUrl) {
    worker = new Worker(new URL('wasmgitworker.js', import.meta.url));
    worker.onmessage = (msg) => {
        workerMessageListeners = workerMessageListeners.filter(listener => listener(msg) === true);
    }

    // BYO-host auth hook: from the console,
    //   setGitToken('<github-fine-grained-PAT>', 'yourname', 'you@example.com')
    // Persisted in sessionStorage so it's applied BEFORE the clone on reload —
    // needed to clone/push a PRIVATE repo through a `remote=…/gitproxy/…` target.
    window.setGitToken = (token, username, useremail) => {
        try { sessionStorage.setItem(GIT_TOKEN_KEY, JSON.stringify({ token, username, useremail })); } catch (e) { /* private mode */ }
        return setGitAuthToken(token, { username, useremail });
    };

    try {
        await initNear(gitrepo);
    } catch (e) {
        console.error('Failed to initialize near', e);
    }
    await registerNearGitServiceWorker();

    // Send NEAR credentials to the git worker so they're included as
    // Authorization headers. Only possible when a key already exists — a repo
    // whose key is created later (at push time) delivers them via
    // sendNearCredentials() from there.
    if (nearAuthData) {
        await sendNearCredentials(nearAuthData);
    }

    gitrepourl = `${location.origin}/near-repo/${gitrepo}.git`;
    gitremoteurl = remoteUrl;
    localRepoName = repoNameFromUrl(gitrepourl);

    let dircontents = await synclocal();

    if (!dircontents) {
        // Nothing local yet. With a `remote=` (e.g. GitHub via the CORS proxy),
        // clone from THAT remote — authenticating first so a private repo works.
        // Otherwise clone the NEAR url. A failed/unreachable clone returns null;
        // fall back to a persistent local OPFS repo so edits survive reload (#151).
        try {
            if (remoteUrl) {
                await applyStoredGitToken(true);
                dircontents = await clone(remoteUrl);
            } else {
                dircontents = await clone();
            }
        } catch (e) {
            console.warn('clone failed, falling back to local repo', e);
            dircontents = null;
        }
        if (!dircontents) {
            console.log('no remote to clone — initializing a local OPFS repo');
            dircontents = await initlocal(remoteUrl);
        }
    } else {
        console.log('Repository is already local');
    }
    console.log('dircontents', dircontents);
    if (dircontents.indexOf('.git') === -1) {
        console.log('no repository');
        await callAndWaitForWorker({ command: 'init', args: ['.'] });
        await callAndWaitForWorker({
            command: 'remote',
            args: ['add', 'origin', gitrepourl]
        });
    }
    // A `?…&remote=<url>` param overrides origin so "Commit & Sync" pushes to
    // an arbitrary remote (e.g. a local git server) instead of the NEAR
    // default. Persisted in .git/config (OPFS), so it survives reload.
    if (remoteUrl && remoteUrl !== gitrepourl) {
        await setremote(remoteUrl);
    }
    if (dircontents.indexOf(CONFIG_FILE) > -1) {
        try {
            return JSON.parse(await readfile(CONFIG_FILE));
        } catch(e) {
            console.error(e);
        }
    }
    return {
        songfilename: dircontents.find(filename => filename.endsWith('.js')),
        synthfilename: dircontents.find(filename => filename.endsWith('.ts')) ||
            dircontents.find(filename => filename.endsWith('.xml')) ||
            dircontents.find(filename => filename.endsWith('.dsp')),
        fragmentshader: dircontents.find(filename => filename.endsWith('.glsl'))
    };
}

export function addRemoteSyncListener(remoteSyncListener) {
    remoteSyncListeners.push(remoteSyncListener);
}

// `url` is where we clone FROM (the `?…&remote=` target when there is one),
// while `repoName` is where it lands in OPFS. These must stay decoupled: the
// local directory is keyed on `?gitrepo=` so that synclocal and "Delete local"
// can find the repo again on the next boot, regardless of what the remote
// happens to be called. See PR #183.
export async function clone(url = gitrepourl) {
    worker.postMessage({
        command: 'clone',
        url,
        repoName: repoNameFromUrl(gitrepourl)
    });
    return await awaitDirContents();
}

async function awaitDirContents(timeoutMs = 30000) {
    // Worker can fail silently (clone error, OPFS lock, etc.) and never
    // post a dircontents reply, which would otherwise hang the boot
    // spinner forever. Reject after timeoutMs so the caller can surface
    // the failure instead of blocking the UI.
    return await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`wasm-git worker did not respond with dircontents within ${timeoutMs}ms`));
        }, timeoutMs);
        workerMessageListeners.push((msg) => {
            if (msg.data.dircontents !== undefined) {
                clearTimeout(timer);
                // Track where the repo actually lives, so "Delete local"
                // targets the real directory even when it's a legacy one.
                if (msg.data.repoName) {
                    localRepoName = msg.data.repoName;
                }
                resolve(msg.data.dircontents);
            } else {
                return true;
            }
        });
    });
}
export async function synclocal() {
    worker.postMessage({
        command: 'synclocal',
        url: gitrepourl,
        repoName: repoNameFromUrl(gitrepourl),
        // LEGACY: before the fix for #183, a `?…&remote=` clone landed in a
        // directory named after the REMOTE url instead of `?gitrepo=`. Existing
        // users still have their work there, so adopt it when the canonical
        // directory is absent.
        legacyRepoName: gitremoteurl ? repoNameFromUrl(gitremoteurl) : undefined
    });
    return await awaitDirContents();
}

// Create a persistent local OPFS repo (no clone) when the remote can't be
// cloned. origin defaults to the NEAR url for this repo, or `remoteUrl` when
// a `?…&remote=<url>` param was supplied. See issue #151.
export async function initlocal(remoteUrl) {
    worker.postMessage({
        command: 'initlocal',
        url: gitrepourl,
        repoName: repoNameFromUrl(gitrepourl),
        remoteUrl: remoteUrl || gitrepourl,
    });
    return await awaitDirContents();
}

// Point origin at an arbitrary URL and persist it to .git/config (OPFS).
export async function setremote(url) {
    return await callAndWaitForWorker({ command: 'setremote', url });
}

export async function deletelocal() {
    // The directory the worker reported working in — NOT a name re-derived from
    // a url. With `?…&remote=`, those differ, and deleting the re-derived name
    // silently removed nothing while reporting success (PR #183).
    const repoName = localRepoName || repoNameFromUrl(gitrepourl);

    // Terminate the worker so it releases the OPFS lock
    worker.terminate();

    // Clear OPFS from the main thread (worker no longer holds the lock)
    let error = null;
    try {
        const opfsRoot = await navigator.storage.getDirectory();
        await opfsRoot.removeEntry(repoName, { recursive: true });
        console.log('Deleted OPFS entry', repoName);
    } catch (e) {
        error = e;
        console.error('Error deleting from OPFS', repoName, e);
    }

    // Report honestly: a failed delete used to still say "Local clone deleted",
    // which is what hid #183 for weeks. repoName comes from the `?gitrepo=`
    // param, so escape it like modalAlert does rather than injecting raw HTML.
    const escape = (s) => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const message = error
        ? `<p>Could not delete the local clone <code>${escape(repoName)}</code></p>
           <p>${escape(error.name)}: ${escape(error.message)}</p>`
        : `<p>Local clone deleted</p>`;

    if (await modal(`${message}
            <button onclick="getRootNode().result(null)">Dismiss</button>
            <button onclick="getRootNode().result(true)">Reload</button>
    `)) {
        location.reload();
    }
}

export async function pull() {
    const result = await callAndWaitForWorker({
        command: 'pull'
    });
    remoteSyncListeners.forEach(remoteSyncListener => remoteSyncListener(result));
    await repoHasChanges();
    return result;
}

export async function commitAndSyncRemote(commitmessage) {
    // Push is the ONLY operation that needs a NEAR key — clone, pull and the
    // song list are view calls — so this is where we ask for one, rather than
    // greeting every visitor with a sign-in button. A local `workspace` repo
    // and a `remote=` host (which uses a PAT) both answer false to isNearRepo
    // and are never prompted.
    if (isNearRepo() && !nearAuthData) {
        const auth = await nearEnsureAuth();
        if (!auth) {
            throw new Error('Sign-in required to push to this NEAR repository');
        }
        await sendNearCredentials(auth);
    }

    const dircontents = await callAndWaitForWorker({
        command: 'commitpullpush',
        commitmessage: commitmessage
    });

    remoteSyncListeners.forEach(remoteSyncListener => remoteSyncListener(dircontents));
    await repoHasChanges(); // update buttons after sync
    return dircontents;
}

export async function readfile(filename, timeoutMs = 10000, { binary = false } = {}) {
    worker.postMessage({
        command: 'readfile',
        filename: filename,
        binary
    });
    return await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`readfile(${filename}) timed out after ${timeoutMs}ms — worker not responding`));
        }, timeoutMs);
        workerMessageListeners.push((msg) => {
            if (msg.data.filename === filename) {
                clearTimeout(timer);
                if (msg.data.error) {
                    reject(new Error(msg.data.error));
                } else {
                    resolve(msg.data.filecontents);
                }
            } else {
                return true;
            }
        });
    });
}

export async function diff() {
    worker.postMessage({
        command: 'diff'
    });
    const result = await new Promise((resolve) =>
        // Resolve on the `diff` key being PRESENT, not truthy: a commit of only
        // new (untracked) files produces an empty `git diff HEAD`, so the worker
        // posts { diff: '' }. Testing `msg.data.diff` treated that empty string as
        // falsy and never resolved — hanging the commit modal's spinner forever.
        workerMessageListeners.push((msg) => msg.data.diff !== undefined ? resolve(msg.data.diff) : true)
    );
    return result;
}

export async function log() {
    worker.postMessage({
        command: 'log'
    });
    const result = await new Promise((resolve) =>
        // Same empty-string trap as diff(): resolve on the key being present so an
        // empty log (e.g. a fresh repo) doesn't hang the caller.
        workerMessageListeners.push((msg) => msg.data.log !== undefined ? resolve(msg.data.log) : true)
    );
    return result;
}

export async function discardchanges() {
    await callAndWaitForWorker({ command: 'reset', args: ['--hard', 'HEAD'] });
    updateCommitAndSyncButtonState(await repoHasChanges());
    remoteSyncListeners.forEach(async remoteSyncListener => remoteSyncListener(await callAndWaitForWorker({ command: 'dir' })));
}

export function updateCommitAndSyncButtonState(changes) {
    if (commitAndPushButton) {
        if (changes) {
            commitAndPushButton.innerHTML = 'Commit & Sync';
            discardChangesButton.style.display = 'block';
        } else {
            commitAndPushButton.innerHTML = 'Sync remote';
            discardChangesButton.style.display = 'none';
        }
    }
}

// Pass a string for text files or a Uint8Array (or ArrayBuffer) for binary files.
// The worker writes the bytes verbatim and (by default) runs `git add`, which
// is a silent no-op for paths matched by the repo's .gitignore.
// Pass `{ stage: false }` to skip the auto-stage — used by the claude-bridge
// so bridge-side edits show up as unstaged changes that "Discard changes"
// can roll back via `git reset --hard HEAD`.
export async function writefileandstage(filename, contents, { stage = true } = {}) {
    const isBinary = contents instanceof Uint8Array || contents instanceof ArrayBuffer;
    const payload = isBinary && contents instanceof ArrayBuffer ? new Uint8Array(contents) : contents;
    worker.postMessage({
        command: 'writefileandstage',
        filename: filename,
        contents: payload,
        binary: isBinary,
        stage,
    });
    const result = await new Promise((resolve) =>
        workerMessageListeners.push((msg) => msg.data.dircontents && msg.data.repoHasChanges !== undefined ? resolve(msg.data) : true)
    );
    updateCommitAndSyncButtonState(result.repoHasChanges);
    return result.dircontents;
}

// Remove a file from OPFS. Idempotent — silent if the file doesn't exist.
// The deletion is left unstaged; `git add -A` at commit time picks it up,
// and "Discard changes" (git reset --hard HEAD) can restore the file. Used
// by the claude-bridge for host→OPFS delete propagation.
export async function unlinkfile(filename) {
    worker.postMessage({ command: 'unlinkfile', filename });
    const result = await new Promise((resolve) =>
        workerMessageListeners.push((msg) => msg.data.dircontents && msg.data.repoHasChanges !== undefined ? resolve(msg.data) : true)
    );
    updateCommitAndSyncButtonState(result.repoHasChanges);
    return result.dircontents;
}

export async function repoHasChanges() {
    worker.postMessage({ command: 'repohaschanges' });
    const result = await new Promise((resolve) =>
        workerMessageListeners.push((msg) => msg.data.repohaschanges !== undefined ? resolve(msg.data.repohaschanges) : true)
    );
    updateCommitAndSyncButtonState(result);
    return result;
}

export async function getConfig() {
    const config = await readfile(CONFIG_FILE);
    if (config) {
        return JSON.parse(config);
    } else {
        return [];
    }
}

export async function listSongs() {
    return await getConfig().then(c => c.allsongs);
}

// `includeDirs` appends directory paths with a trailing slash, so a caller that
// must reproduce the tree faithfully (the zip export) does not silently drop
// empty directories — `.git/refs` in a fresh repo being the one that matters.
export async function listfiles(prefix = '', { includeGit = false, includeDirs = false } = {}) {
    const result = await callAndWaitForWorker({
        command: 'listfiles',
        prefix,
        includeGit,
        includeDirs,
    });
    return result.files || [];
}

export async function changeCurrentSong(songNdx) {
    const config = JSON.parse(await readfile(CONFIG_FILE));
    Object.assign(config, config.allsongs[songNdx]);
    await writefileandstage(CONFIG_FILE, JSON.stringify(config, null, 1));
    remoteSyncListeners.forEach(async remoteSyncListener => remoteSyncListener(await callAndWaitForWorker({ command: 'dir' })));
}

customElements.define('wasmgit-ui',
    class extends HTMLElement {
        constructor() {
            super();

            this.attachShadow({ mode: 'open' });
            this.init();
        }

        async displayErrorModal(err) {
            await modal(`<p>${err}</p>
                        <button onclick="getRootNode().result(null)">Dismiss</button>
                `);
        }

        async init() {
            const uihtml = await fetch('wasmgit/wasmgitui.html').then(r => r.text());
            this.shadowRoot.innerHTML = uihtml;

            commitAndPushButton = this.shadowRoot.getElementById('syncRemoteButton');
            commitAndPushButton.onclick = async () => {
                toggleSpinner(true);
                let commitMessage = null;
                let commitCancelled = false;
                if (await repoHasChanges()) {
                    const commitModal = document.createElement('wasmgit-commit-modal');
                    document.documentElement.appendChild(commitModal);
                    await commitModal.readyPromise;
                    try {
                        toggleSpinner(false);
                        commitMessage = await commitModal.getCommitMessage();
                        document.documentElement.removeChild(commitModal);
                    } catch (e) {
                        document.documentElement.removeChild(commitModal);
                        commitCancelled = true;
                    }
                }
                if (!commitCancelled) {
                    toggleSpinner(true);
                    try {
                        await commitAndSyncRemote(commitMessage);
                        toggleSpinner(false);
                    } catch (e) {
                        toggleSpinner(false);
                        await this.displayErrorModal(e.error);
                    }
                }
            };

            discardChangesButton = this.shadowRoot.getElementById('discardChangesButton');
            discardChangesButton.onclick = () => discardchanges();

            deleteLocalButton = this.shadowRoot.getElementById('deleteLocalButton');
            deleteLocalButton.onclick = async () => {
                if (await modal(`<h3>Are you sure?</h3>
                    <p>This will delete the local clone of the git repository</p>
                    <button onclick="getRootNode().result(null)">No</button>
                    <button onclick="getRootNode().result(true)">Yes</button>
                `)) {
                    deletelocal();
                }
            };

            switchSongButton = this.shadowRoot.getElementById('switchSongButton');
            switchSongButton.addEventListener('click', async () => {
                const config = await getConfig();
                const songs = config.allsongs;
                const currentSelectedSongNdx = songs.findIndex(song => song.songfilename == config.songfilename);
                const selectedSongNdx = await modal(`<h3>Switch to another song</h3>                
                    <p>
                    <select id="songselect">
                        ${songs.map((song, ndx) => `<option value="${ndx}" ${currentSelectedSongNdx==ndx ? 'selected' : ''}>${song.name}</option>`)}
                    </select>
                    </p>
                    <button onclick="getRootNode().result(null)">Cancel</button>
                    <button id="songSelectOkButton" onclick="getRootNode().result(getRootNode().querySelector('#songselect').value)">Ok</button>
                `);
                if (selectedSongNdx != null) {
                    await changeCurrentSong(selectedSongNdx);                    
                }
            });
            // Identity is shown only once you HAVE signed in. There is nothing
            // to click when you have not: the wallet opens from "Commit & Sync",
            // which is the one action that actually needs a key.
            if (nearAuthData) {
                this.shadowRoot.getElementById('loggedinuserspan').innerHTML = nearAuthData.username;
                this.shadowRoot.getElementById('loggedinuserspan').style.display = 'block';
                this.shadowRoot.getElementById('logoutButton').style.display = 'block';
                this.shadowRoot.getElementById('logoutButton').onclick = () => nearLogout();
            } else {
                this.shadowRoot.getElementById('logoutButton').style.display = 'none';
                this.shadowRoot.getElementById('loggedinuserspan').style.display = 'none';
            }
            updateCommitAndSyncButtonState(await repoHasChanges());
        }
    });


customElements.define('wasmgit-commit-modal',
    class extends HTMLElement {
        constructor() {
            super();

            this.attachShadow({ mode: 'open' });
            this.readyPromise = new Promise(async resolve => {
                await this.init();
                resolve();
            });
        }

        async init() {
            const uihtml = await fetch('wasmgit/commitmessagemodal.html').then(r => r.text());
            this.shadowRoot.innerHTML = uihtml;
            this.shadowRoot.getElementById('diffarea').innerHTML = await diff();
            this.proceedButtonPromise = new Promise((resolve, reject) => {
                this.shadowRoot.getElementById('proceedbutton').onclick = resolve
                this.shadowRoot.getElementById('cancelbutton').onclick = reject;
            });
        }

        async getCommitMessage() {
            await this.proceedButtonPromise;
            return this.shadowRoot.getElementById('commitMessageField').value;
        }
    });
