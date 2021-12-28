import {
    initWASMGitClient, commitAndSyncRemote, repoHasChanges,
    writefileandstage, worker, readfile, diff, discardchanges, log
} from './wasmgitclient.js';

describe('wasm-git client', async function () {
    this.timeout(20000);

    it('should resolve synth and song filename from git repository', async () => {
        const config = await initWASMGitClient('test');

        document.documentElement.appendChild(document.createElement('wasmgit-ui'));

        assert.isFalse(await repoHasChanges());

        // get dir contents by calling sync remote        
        let dircontents;
        try {
            dircontents = await commitAndSyncRemote('no changes');
        } catch (e) {
            dircontents = e.dircontents;
        }

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

    it('should not overwrite uncommitted changes on reload', async () => {
        assert.isFalse(await repoHasChanges());
        const contentToWrite = 'blabla';
        const filename = 'blabla.txt';
        await writefileandstage(filename, contentToWrite);
        worker.terminate();
        await initWASMGitClient('test');
        assert.isTrue(await repoHasChanges());
        assert.equal(await readfile(filename), contentToWrite);
    });
    it('should be able to handle simultanous actions', async () => {
        const contentToWrite = 'blabla2';
        const filename = 'blabla2.txt';
        const file1promise = writefileandstage(filename, contentToWrite);
        const readfile1promise = readfile(filename);

        const contentToWrite2 = 'ababab3';
        const filename2 = 'ababab2.txt';
        const file2promise = writefileandstage(filename2, contentToWrite2);
        const readfile2promise = readfile(filename2);

        assert.equal((await file1promise).find(fn => fn === filename), filename);
        assert.equal((await file2promise).find(fn => fn === filename2), filename2);
        assert.equal(await readfile1promise, contentToWrite);
        assert.equal(await readfile2promise, contentToWrite2);
    });
    it('should show diff', async () => {
        assert.isTrue(await repoHasChanges());
        const difftxt = await diff();
        assert.match(difftxt, /.*\n\+ababab3\n.*/);
    });
    it('should discard changes', async () => {
        assert.isTrue(await repoHasChanges());
        await discardchanges();
        assert.isFalse(await repoHasChanges());
    });
    it('should be possible to create an empty repo', async () => {
        worker.terminate();
        window.indexedDB.deleteDatabase(`/nonexistingtest`);
        const config = await initWASMGitClient('nonexistingtest');

        assert.isFalse(await repoHasChanges());

        const contentToWrite = 'blabla';
        const filename = 'blabla.txt';
        await writefileandstage(filename, contentToWrite);
        assert.isTrue(await repoHasChanges());
        assert.equal(await readfile(filename), contentToWrite);
        const difftxt = await diff();
        assert.match(difftxt, /.*On branch Not currently on any branch.*/);
        assert.match(difftxt, /.*new file:   blabla.txt\n.*/);

        try {
            await commitAndSyncRemote('first commit');
            assert.isTrue(false, 'should not be able to push to remote');
        } catch (e) {
            assert(e.error.indexOf('http status: 404') > -1, 'should receieve http status 404 from remote. received: '+e.error);
            assert.isFalse(await repoHasChanges());

            const logResult = await log();
            assert.match(logResult, /.*first commit.*/);
            assert.match(logResult, /.*\nAuthor: ANONYMOUS <anonymous>.*/);
        }
    });
    it('should use near account to sign commits', async () => {
        const keypair = nearApi.utils.KeyPairEd25519.fromRandom();
        const accessobj = {
            accountId: 'wasmmusictestaccount.near',
            allKeys: [
                keypair.toString()
            ]
        };
        localStorage.setItem('undefined_wallet_auth_key', JSON.stringify(accessobj));
        walletConnection._keyStore.setKey(undefined, accessobj.accountId, keypair);
        const config = await initWASMGitClient('test');
        const contentToWrite = 'blabla';
        const filename = 'blabla.txt';
        await writefileandstage(filename, contentToWrite);
        
        try {
            await commitAndSyncRemote('commit with test account');
            assert.isTrue(false, 'should not be able to push to remote');
        } catch (e) {
            assert(e.error.indexOf('http status: 403') > -1, 'should receieve http status 403 from remote. received: '+e.error);
            assert.isFalse(await repoHasChanges());

            const latestCommitFromLog = (await log()).split(/\ncommit [0-9a-f]+/)[0];
            assert.match(latestCommitFromLog, /.*\nAuthor: wasmmusictestaccount\.near <wasmmusictestaccount\.near>.*/);
        }
    });
});