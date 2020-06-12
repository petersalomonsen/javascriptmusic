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
});