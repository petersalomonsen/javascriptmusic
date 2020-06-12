import { initNear, authdata as nearAuthData, login as nearLogin } from './nearacl.js';
import { toggleSpinner } from '../app.js';

const worker = new Worker('./wasmgit/wasmgitworker.js');

const readyPromise = new Promise((resolve, reject) => worker.onmessage = msg => msg.data.ready ? resolve() : reject(msg));
let gitrepourl;
let commitAndPushButton;

const remoteSyncListeners = [];

export async function initWASMGitClient(gitrepo) {
    gitrepourl = `https://githttpserverdemo.petersalomonsen.usw1.kubesail.io/${gitrepo}`;
        
    let dircontents = await synclocal();
    if (!dircontents) {
        dircontents = await clone();
    }

    updateCommitAndSyncButtonState(await repoHasChanges());

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
    await readyPromise;

    worker.postMessage({
        command: 'clone',
        url: gitrepourl
    });
    return await new Promise((resolve) => worker.onmessage = msg => resolve(msg.data.dircontents));
}

export async function synclocal() {
    await readyPromise;
    worker.postMessage({
        command: 'synclocal',
        url: gitrepourl
    });
    return await new Promise((resolve) => worker.onmessage = msg => resolve(msg.data.dircontents));
}

export async function commitAndSyncRemote(commitmessage) {
    worker.postMessage({
        command: 'commitpullpush',
        commitmessage: commitmessage
    });
    const dircontents = await new Promise((resolve) => worker.onmessage = msg => resolve(msg.data.dircontents));
    remoteSyncListeners.forEach(remoteSyncListener => remoteSyncListener(dircontents));
    return dircontents;
}

export async function readfile(filename) {
    worker.postMessage({
        command: 'readfile',
        filename: filename
    });
    return await new Promise((resolve) => worker.onmessage = msg => resolve(msg.data.filecontents));
}

export function updateCommitAndSyncButtonState(changes) {
    if (commitAndPushButton) {
        if (changes) {
            commitAndPushButton.innerHTML = 'Commit & Sync';
        } else {
            commitAndPushButton.innerHTML = 'Sync remote';
        }
    }
}

export async function writefileandstage(filename, contents) {
    worker.postMessage({
        command: 'writefileandstage',
        filename: filename,
        contents: contents
    });
    const result = await new Promise((resolve) => worker.onmessage = msg => resolve(msg.data));
    updateCommitAndSyncButtonState(result.repoHasChanges);
    return result.filecontents;
}

export async function repoHasChanges() {
    worker.postMessage({command: 'repohaschanges'});
    return await new Promise(resolve => worker.onmessage = msg => resolve(msg.data.repohaschanges));
}

customElements.define('wasmgit-ui',
    class extends HTMLElement {
        constructor() {
            super();
            
            this.attachShadow({mode: 'open'});
            this.init();      
        }

        async init() {
            const uihtml = await fetch('wasmgit/wasmgitui.html').then(r => r.text());
            this.shadowRoot.innerHTML = uihtml;

            commitAndPushButton = this.shadowRoot.getElementById('syncRemoteButton');
            commitAndPushButton.onclick = async () => {
                toggleSpinner(true);
                if (await repoHasChanges()) {
                    const commitModal = document.createElement('wasmgit-commit-modal');
                    document.documentElement.appendChild(commitModal);
                    await commitModal.readyPromise;
                    try {
                        const commitMessage = await commitModal.getCommitMessage();
                        document.documentElement.removeChild(commitModal);
                        await commitAndSyncRemote(commitMessage);                
                    } catch(e) {
                        document.documentElement.removeChild(commitModal);
                    }
                } else {
                    await commitAndSyncRemote();
                }
                toggleSpinner(false);
            };

            await initNear();

            if (nearAuthData) {
                worker.postMessage(nearAuthData);
                this.shadowRoot.getElementById('loggedinuserspan').innerHTML = nearAuthData.username;
                this.shadowRoot.getElementById('loggedinuserspan').style.display = 'block';
            } else {
                this.shadowRoot.getElementById('loginButton').style.display = 'block';
                this.shadowRoot.getElementById('loginButton').onclick = () => {
                    nearLogin();
                };
            }
        }
    });


customElements.define('wasmgit-commit-modal',
    class extends HTMLElement {
        constructor() {
            super();
            
            this.attachShadow({mode: 'open'});
            this.readyPromise = new Promise(async resolve => {
                await this.init();
                resolve();
            });
        }

        async init() {
            const uihtml = await fetch('wasmgit/commitmessagemodal.html').then(r => r.text());
            this.shadowRoot.innerHTML = uihtml;
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
