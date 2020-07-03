import { initWASMGitClient, commitAndSyncRemote, repoHasChanges } from './wasmgitclient.js';

describe('wasm-git client', async function() {
    this.timeout(20000);

    it('should resolve synth and song filename from git repository', async () => {                
        document.documentElement.appendChild(document.createElement('wasmgit-ui'));
        const config = await initWASMGitClient('test');
        
        assert.isFalse(await repoHasChanges());

        // get dir contents by calling sync remote        
        const dircontents = await commitAndSyncRemote('no changes');

        assert.equal(dircontents.find(direntry => direntry === '.git'), '.git');
        assert.equal(dircontents.find(direntry => direntry.endsWith('.js')), config.songfilename);
        assert.equal(
            dircontents.find(direntry => direntry.endsWith('.ts')) ||
            dircontents.find(direntry => direntry.endsWith('.xml'))
            , config.synthfilename);
    });

    it('should be able to send token to the worker without waiting for ready message', async () => {
        const worker = new Worker('wasmgit/wasmgitworker.js');
        worker.postMessage({
            accessToken: 'token',
            username: 'abc',
            useremail: 'def@example.com'
        });
        const msg = await new Promise(resolve =>
            worker.onmessage = (msg) => resolve(msg)
        );
        assert.isTrue(msg.data.accessTokenConfigured);
    });
});