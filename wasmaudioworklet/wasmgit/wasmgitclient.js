import { initNear, authdata as nearAuthData, login as nearLogin } from './nearacl.js';
import { toggleSpinner } from '../app.js';

export let worker;

let gitrepourl;
let commitAndPushButton;

const remoteSyncListeners = [];

let workerMessageListeners = [];

export async function initWASMGitClient(gitrepo) {
    worker = new Worker('./wasmgit/wasmgitworker.js');
    worker.onmessage = (msg) => {
        workerMessageListeners = workerMessageListeners.filter(listener => listener(msg) === true);
    }

    gitrepourl = `https://githttpserverdemo.petersalomonsen.usw1.kubesail.io/${gitrepo}`;
        
    await initNear();
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
        workerMessageListeners.push((msg) => msg.data.dircontents!==undefined ? resolve(msg.data.dircontents) : true)
    );
}
export async function synclocal() {
    worker.postMessage({
        command: 'synclocal',
        url: gitrepourl
    });
    return await awaitDirContents();    
}

export async function commitAndSyncRemote(commitmessage) {
    worker.postMessage({
        command: 'commitpullpush',
        commitmessage: commitmessage
    });
    const dircontents = await awaitDirContents();
    remoteSyncListeners.forEach(remoteSyncListener => remoteSyncListener(dircontents));
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
    const result = await new Promise((resolve) =>
        workerMessageListeners.push((msg) => msg.data.dircontents && msg.data.repoHasChanges!==undefined ? resolve(msg.data) : true)
    );
    updateCommitAndSyncButtonState(result.repoHasChanges);
    return result.dircontents;
}

export async function repoHasChanges() {
    worker.postMessage({command: 'repohaschanges'});
    const result =  await new Promise((resolve) =>
        workerMessageListeners.push((msg) => msg.data.repohaschanges !== undefined ? resolve(msg.data.repohaschanges) : true)
    );
    updateCommitAndSyncButtonState(result);
    return result;
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
                        toggleSpinner(false);
                        const commitMessage = await commitModal.getCommitMessage();
                        document.documentElement.removeChild(commitModal);
                        toggleSpinner(true);
                        await commitAndSyncRemote(commitMessage);                
                    } catch(e) {
                        document.documentElement.removeChild(commitModal);
                    }
                } else {
                    await commitAndSyncRemote();
                }
                toggleSpinner(false);
            };

            if (nearAuthData) {
                this.shadowRoot.getElementById('loggedinuserspan').innerHTML = nearAuthData.username;
                this.shadowRoot.getElementById('loggedinuserspan').style.display = 'block';
            } else {
                this.shadowRoot.getElementById('loginButton').style.display = 'block';
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
