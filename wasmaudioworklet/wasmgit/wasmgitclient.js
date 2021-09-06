import { initNear, authdata as nearAuthData, login as nearLogin, logout as nearLogout, login } from './nearacl.js';
import { toggleSpinner } from '../common/ui/progress-spinner.js';

import { modal } from '../common/ui/modal.js';

export let worker;

let gitrepourl;
let commitAndPushButton;
let discardChangesButton;
let deleteLocalButton;

const remoteSyncListeners = [];

let workerMessageListeners = [];

let msgId = 1;
async function callAndWaitForWorker(message) {
    message.id = msgId++;
    worker.postMessage(message);
    return await new Promise((resolve, reject) =>
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
        })
    );
}

export async function initWASMGitClient(gitrepo) {
    worker = new Worker(new URL('wasmgitworker.js', import.meta.url));
    worker.onmessage = (msg) => {
        workerMessageListeners = workerMessageListeners.filter(listener => listener(msg) === true);
    }

    gitrepourl = `https://wasm-git.petersalomonsen.com/${gitrepo}`;

    try {
        await initNear();
    } catch (e) {
        console.error('Failed to initialize near', e);
    }
    if (nearAuthData) {
        worker.postMessage(nearAuthData);
        const result = await new Promise((resolve) =>
            workerMessageListeners.push((msg) => msg.data.accessTokenConfigured ? resolve(msg.data.accessTokenConfigured) : true)
        );
        console.log('Already logged in to near', result);
    }

    let dircontents = await synclocal();

    if (!dircontents) {
        dircontents = await clone();
    } else {
        console.log('Repository is already local');
    }

    const config = {
        songfilename: dircontents.find(filename => filename.endsWith('.js')),
        synthfilename: dircontents.find(filename => filename.endsWith('.ts')) ||
            dircontents.find(filename => filename.endsWith('.xml'))
    };
    return config;
}

export function addRemoteSyncListener(remoteSyncListener) {
    remoteSyncListeners.push(remoteSyncListener);
}

export async function clone() {
    worker.postMessage({
        command: 'clone',
        url: gitrepourl
    });
    return await awaitDirContents();
}

async function awaitDirContents() {
    return await new Promise((resolve) =>
        workerMessageListeners.push((msg) => msg.data.dircontents !== undefined ? resolve(msg.data.dircontents) : true)
    );
}
export async function synclocal() {
    worker.postMessage({
        command: 'synclocal',
        url: gitrepourl
    });
    return await awaitDirContents();
}

export async function deletelocal() {
    await callAndWaitForWorker({ command: 'deletelocal' });

    if (await modal(`<p>Local clone deleted</p>
            <button onclick="getRootNode().result(null)">Dismiss</button>
            <button onclick="getRootNode().result(true)">Reload</button>
    `)) {
        location.reload();
    }
}

export async function pull() {
    await callAndWaitForWorker({
        command: 'pull'
    });
}

export async function commitAndSyncRemote(commitmessage) {
    const dircontents = await callAndWaitForWorker({
        command: 'commitpullpush',
        commitmessage: commitmessage
    });

    remoteSyncListeners.forEach(remoteSyncListener => remoteSyncListener(dircontents));
    await repoHasChanges(); // update buttons after sync
    return dircontents;
}

export async function readfile(filename) {
    worker.postMessage({
        command: 'readfile',
        filename: filename
    });
    return await new Promise((resolve) =>
        workerMessageListeners.push((msg) => msg.data.filename === filename ? resolve(msg.data.filecontents) : true)
    );
}

export async function diff() {
    worker.postMessage({
        command: 'diff'
    });
    const result = await new Promise((resolve) =>
        workerMessageListeners.push((msg) => msg.data.diff ? resolve(msg.data.diff) : true)
    );
    return result;
}

export async function log() {
    worker.postMessage({
        command: 'log'
    });
    const result = await new Promise((resolve) =>
        workerMessageListeners.push((msg) => msg.data.log ? resolve(msg.data.log) : true)
    );
    return result;
}

export async function discardchanges(filenames) {
    worker.postMessage({
        command: 'discardchanges',
        filenames: filenames
    });
    const result = await new Promise((resolve) =>
        workerMessageListeners.push((msg) => msg.data.dircontents && msg.data.repoHasChanges !== undefined ? resolve(msg.data) : true)
    );
    updateCommitAndSyncButtonState(result.repoHasChanges);
    remoteSyncListeners.forEach(remoteSyncListener => remoteSyncListener(result.dircontents));
    return result;
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

export async function writefileandstage(filename, contents) {
    worker.postMessage({
        command: 'writefileandstage',
        filename: filename,
        contents: contents
    });
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
            discardChangesButton.onclick = async () => {
                discardchanges(['song.js', 'synth.ts']);
            };
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
            if (nearAuthData) {
                this.shadowRoot.getElementById('loggedinuserspan').innerHTML = nearAuthData.username;
                this.shadowRoot.getElementById('loggedinuserspan').style.display = 'block';
                this.shadowRoot.getElementById('logoutButton').style.display = 'block';
                this.shadowRoot.getElementById('logoutButton').onclick = async () => {
                    await nearLogout();
                    location.reload();
                };
            } else {
                this.shadowRoot.getElementById('loginButton').style.display = 'block';
                this.shadowRoot.getElementById('logoutButton').style.display = 'none';
                this.shadowRoot.getElementById('loggedinuserspan').style.display = 'none';
                this.shadowRoot.getElementById('loginButton').onclick = () => {
                    nearLogin();
                };
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
