import {
    initWASMGitClient, commitAndSyncRemote, repoHasChanges,
    writefileandstage, worker, readfile, diff, discardchanges, log, changeCurrentSong, getConfig, listSongs
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
            assert(e.error.indexOf('http status: 404') > -1, 'should receieve http status 404 from remote. received: ' + e.error);
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
            assert(e.error.indexOf('http status: 403') > -1, 'should receieve http status 403 from remote. received: ' + e.error);
            assert.isFalse(await repoHasChanges());

            const latestCommitFromLog = (await log()).split(/\ncommit [0-9a-f]+/)[0];
            assert.match(latestCommitFromLog, /.*\nAuthor: wasmmusictestaccount\.near <wasmmusictestaccount\.near>.*/);
        }
    });
    it('should be able to have multiple songs in a git repository', async () => {
        const existingWasmGitUI = document.documentElement.getElementsByTagName('wasmgit-ui');
        if (existingWasmGitUI.length > 0) {
            existingWasmGitUI.item(0).remove();
        }
        window.indexedDB.deleteDatabase(`/multiplesongstest`);
        await initWASMGitClient('multiplesongstest');

        assert.isFalse(await repoHasChanges());

        const configobj = {
            "songfilename": "fall/song.js",
            "synthfilename": "fall/synth.ts",
            "allsongs": [{
                "name": "Fall",
                "songfilename": "fall/song.js",
                "synthfilename": "fall/synth.ts"
            }, {
                "name": "Noise and madness",
                "songfilename": "noiseandmadness/song.js",
                "synthfilename": "noiseandmadness/synth.ts",
            },
            {
                "name": "Good times",
                "songfilename": "goodtimes/song.js",
                "synthfilename": "goodtimes/synth.ts",
            },
            {
                "name": "Groove is in the code",
                "songfilename": "grooveisinthecode/song.js",
                "synthfilename": "grooveisinthecode/synth.ts",
            }]
        };
        const contentToWrite = JSON.stringify(configobj);
        const filename = 'wasmmusic.config.json';
        await writefileandstage(filename, contentToWrite);
        worker.terminate();
        await initWASMGitClient('multiplesongstest');
        await changeCurrentSong(1);
        const config = await getConfig();
        expect(config.songfilename).to.equal(config.allsongs[1].songfilename);
        expect(config.synthfilename).to.equal(config.allsongs[1].synthfilename);
        const songs = await listSongs();
        expect(songs.length).to.equal(4);
        expect(songs[3].name).to.equal("Groove is in the code");

        const wasmGuiElement = document.documentElement.appendChild(document.createElement('wasmgit-ui'));

        const switchSongButton = await new Promise(resolve => {
            const observer = new MutationObserver((mutationList, observer) => {
                const btn = wasmGuiElement.shadowRoot.getElementById('switchSongButton');
                if (btn) {
                    resolve(btn);
                }
            });
            observer.observe(wasmGuiElement.shadowRoot, { childList: true, subtree: true });
        });
        switchSongButton.click();
        const songselect = await new Promise(resolve => {
            const observer = new MutationObserver((mutationList, observer) => {
                const modal = document.querySelector('common-modal');
                const songselect = modal.shadowRoot.getElementById('songselect');

                if (songselect) {
                    resolve(songselect);
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        });
        const options = songselect.querySelectorAll('option');

        expect(options.length).to.equal(configobj.allsongs.length);
        configobj.allsongs.forEach((song, ndx) => {
            expect(options.item(ndx).innerHTML).to.equal(song.name);
        });
    });
});