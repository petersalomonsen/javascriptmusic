import { initNear, authdata as nearAuthData, login as nearLogin, logout as nearLogout } from './nearacl.js';
import { toggleSpinner } from '../common/ui/progress-spinner.js';
import { modal } from '../common/ui/modal.js';

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

export let worker;

let gitrepourl;
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

export async function initWASMGitClient(gitrepo) {
    worker = new Worker(new URL('wasmgitworker.js', import.meta.url));
    worker.onmessage = (msg) => {
        workerMessageListeners = workerMessageListeners.filter(listener => listener(msg) === true);
    }

    try {
        await initNear(gitrepo);
    } catch (e) {
        console.error('Failed to initialize near', e);
    }
    await registerNearGitServiceWorker();

    // Send NEAR credentials to the git worker so they're included as Authorization headers
    if (nearAuthData) {
        await new Promise(resolve => {
            workerMessageListeners.push((msg) => {
                if (msg.data.accessTokenConfigured) { resolve(); }
                else { return true; }
            });
            worker.postMessage({
                accessToken: JSON.stringify({
                    accountId: nearAuthData.username,
                    publicKey: nearAuthData.publicKey,
                    privateKey: nearAuthData.privateKey,
                }),
                username: nearAuthData.username,
                useremail: nearAuthData.useremail || nearAuthData.username,
            });
        });
    }

    gitrepourl = `${location.origin}/near-repo/${gitrepo}.git`;

    let dircontents = await synclocal();

    if (!dircontents) {
        dircontents = await clone();
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
    // Extract repo name from URL
    const repoName = gitrepourl.substring(gitrepourl.lastIndexOf('/') + 1);

    // Terminate the worker so it releases the OPFS lock
    worker.terminate();

    // Clear OPFS from the main thread (worker no longer holds the lock)
    try {
        const opfsRoot = await navigator.storage.getDirectory();
        await opfsRoot.removeEntry(repoName, { recursive: true });
        console.log('Deleted OPFS entry', repoName);
    } catch (e) {
        console.error('Error deleting from OPFS', repoName, e);
    }

    if (await modal(`<p>Local clone deleted</p>
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
    return await new Promise((resolve, reject) =>
        workerMessageListeners.push((msg) => {
            if (msg.data.filename === filename) {
                resolve(msg.data.filecontents);
            } else if (msg.data.error && !msg.data.id) {
                reject(new Error(msg.data.error));
            } else {
                return true;
            }
        })
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
            if (nearAuthData) {
                this.shadowRoot.getElementById('loggedinuserspan').innerHTML = nearAuthData.username;
                this.shadowRoot.getElementById('loggedinuserspan').style.display = 'block';
                this.shadowRoot.getElementById('logoutButton').style.display = 'block';
                this.shadowRoot.getElementById('loginButton').style.display = 'none';
                this.shadowRoot.getElementById('logoutButton').onclick = () => nearLogout();
            } else {
                this.shadowRoot.getElementById('loginButton').style.display = 'block';
                this.shadowRoot.getElementById('logoutButton').style.display = 'none';
                this.shadowRoot.getElementById('loggedinuserspan').style.display = 'none';
                this.shadowRoot.getElementById('loginButton').onclick = () => nearLogin();
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
