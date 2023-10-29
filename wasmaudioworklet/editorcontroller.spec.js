import { waitForAppReady } from './app.js';
import { songsourceeditor, synthsourceeditor } from './editorcontroller.js';
import { commitAndSyncRemote, log } from './wasmgit/wasmgitclient.js';
import { songsource as sointutestsong, expectedYaml } from './sointu/sointutestsong.js';

describe('editorcontroller', async function () {
    this.timeout(30000);
    this.beforeAll(async () => {
        document.documentElement.appendChild(document.createElement('app-javascriptmusic'));
        await waitForAppReady();
    });
    this.afterAll(async () => {
        window.stopaudio();
        window.audioworkletnode = undefined;
        document.documentElement.removeChild(document.querySelector('app-javascriptmusic'));
    });

    const synthsource = `
import { Kick2 } from "../instruments/drums/kick2.class";
import { SineOscillator } from '../synth/sineoscillator.class';
import { Envelope } from '../synth/envelope.class';
import { StereoSignal } from "../synth/stereosignal.class";
import { notefreq } from '../synth/note';

export const PATTERN_SIZE_SHIFT: usize = 4;
export const BEATS_PER_PATTERN_SHIFT: usize = 2;

class SineLead {
    private _note: f32;
    
    readonly osc: SineOscillator = new SineOscillator();
    readonly env1: Envelope = new Envelope(0.02, 0.15, 0.5, 0.3);    
    readonly signal: StereoSignal = new StereoSignal();

    set note(note: f32) {        
        if(note > 1) { 
            this.osc.frequency = notefreq(note);
            this._note = note;
            this.env1.attack();           
        } else {
            this.env1.release();            
        }        
    }

    get note(): f32 {
        return this._note;
    }

    next(): void {        
        const env1: f32 = this.env1.next();
                
        let osc: f32 = this.osc.next();        
        osc *= env1;

        const pan = this._note / 127;

        this.signal.left = osc * pan;
        this.signal.right = osc * (1 - pan);                
    } 
}

const kick = new Kick2();
const sinelead = new SineLead();

export function setChannelValue(channel: usize, value: f32): void {
    switch(channel) {
        case 0:
            kick.note = value;
            break;
        case 1:
            sinelead.note = value;
            break;
    }
}

export function mixernext(leftSampleBufferPtr: usize, rightSampleBufferPtr: usize): void {  
    let left: f32 = 0;
    let right: f32 = 0;

    kick.next();
    left += kick.signal.left;
    right += kick.signal.right;
    
    sinelead.next();
    left += sinelead.signal.left;
    right += sinelead.signal.right;
    
  	const gain: f32 = 0.4;
  	left *= gain;
  	right *= gain;
    store<f32>(leftSampleBufferPtr, left);
    store<f32>(rightSampleBufferPtr, right);    
}
        `;

    const songsource = `
        global.bpm = 120;
        global.pattern_size_shift = 4;
        
        addInstrument('kick', {type: 'number'});
        addInstrument('sinelead', {type: 'note'});
        
        playPatterns({
            kick: pp(4, [
                64, , , ,
                64, , , ,
                64, , ,10,
                64, , 30, ,]),
        sinelead: pp(4, [
                d5,,,a4,
                ,a4,,,
                c5,d5,,f5,
                ,f5,d5
        ])
        
        });`

    it('should compile default wasm song source code', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue(synthsource);
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
        let audioWorkletMessage;
        window.audioworkletnode = {
            port: {
                postMessage: msg => audioWorkletMessage = msg
            },
            context: {
                sampleRate: 44100
            }
        };
        appElement.querySelector('#savesongbutton').click();
        while (!audioWorkletMessage) {
            await new Promise((resolve) => setTimeout(() => resolve(), 1000));
        }
        assert.equal(localStorage.getItem('storedsynthcode'), synthsource);
        assert.equal(localStorage.getItem('storedsongcode'), songsource);
        assert.equal(audioWorkletMessage.song.instrumentPatternLists.length, 2);
        assert.equal(audioWorkletMessage.song.patterns.length, 2);
        assert.isAbove(audioWorkletMessage.wasm.length, 1000);
    });

    it('should show compile errors', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue(synthsource+"ocreatcompileerr(\nhello");
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;

        appElement.querySelector('#savesongbutton').click();
        const errorMessagesContentElement = appElement.querySelector('#errormessages span');
        while (!errorMessagesContentElement.innerText) {
            await new Promise((resolve) => setTimeout(() => resolve(), 1000));
        }

        expect(errorMessagesContentElement.innerText).contains(`ERROR TS1005: ')' expected`);
        expect(errorMessagesContentElement.innerText).contains(`hello`);
    });
    it('should compile and export song to wasm with lib functions exported', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue(synthsource);
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
        let audioWorkletMessage;
        window.audioworkletnode = {
            port: {
                postMessage: msg => audioWorkletMessage = msg
            },
            context: {
                sampleRate: 44100
            }
        };
        const downloadPromise = new Promise(resolve => {
            document._createElement = document.createElement;
            document.createElement = function (elementName, options) {
                const elm = this._createElement(elementName, options);

                if (elementName === 'a') {
                    elm.click = () => resolve(elm.href);
                } else if (elementName === 'common-modal') {
                    elm.shadowRoot.result('libmodule');
                }
                return elm;
            }
        });

        appElement.querySelector('#exportbutton').click();
        const url = await downloadPromise;

        const wasmbinary = await fetch(url).then(r => r.arrayBuffer());

        assert.isAbove(wasmbinary.byteLength, 1000);
        assert.isDefined((await WebAssembly.instantiate(wasmbinary)).instance.exports.fillSampleBuffer);
        document.createElement = document._createElement;
    });
});


describe('editorcontroller with sointu source', async function () {
    this.timeout(30000);
    this.beforeAll(async () => {
        document.documentElement.appendChild(document.createElement('app-javascriptmusic'));
        await waitForAppReady();
    });
    this.afterAll(async () => {
        window.stopaudio();
        window.audioworkletnode = undefined;
        document.documentElement.removeChild(document.querySelector('app-javascriptmusic'));
    });

    const songsource = sointutestsong;

    it('should compile sointu test song', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue('');
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
        let audioWorkletMessage;
        window.audioworkletnode = {
            port: {
                postMessage: msg => audioWorkletMessage = msg
            },
            context: {
                sampleRate: 44100
            }
        };
        appElement.querySelector('#savesongbutton').click();
        while (!audioWorkletMessage) {
            await new Promise((resolve) => setTimeout(() => resolve(), 1000));
        }
        assert.equal(localStorage.getItem('storedsynthcode'), '');
        assert.equal(localStorage.getItem('storedsongcode'), songsource);
        assert.equal(audioWorkletMessage.song.instrumentPatternLists.length, 5);
        assert.equal(audioWorkletMessage.song.patterns.length, 4);
        assert.equal(appElement.getElementById('assemblyscripteditor').style.display, 'none');
    });

    it('should compile and export song to sointu yaml', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue('');
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
        let audioWorkletMessage;
        window.audioworkletnode = {
            port: {
                postMessage: msg => audioWorkletMessage = msg
            },
            context: {
                sampleRate: 44100
            }
        };
        const downloadPromise = new Promise(resolve => {
            document._createElement = document.createElement;
            document.createElement = function (elementName, options) {
                const elm = this._createElement(elementName, options);
                if (elementName === 'a') {
                    elm.click = () => resolve(elm.href);
                } else if (elementName === 'common-modal') {
                    elm.shadowRoot.result('sointuyaml');
                }
                return elm;
            }
        });

        appElement.querySelector('#exportbutton').click();
        const url = await downloadPromise;

        const sointuyaml = await fetch(url).then(r => r.text());
        
        assert.equal(sointuyaml, expectedYaml);
        document.createElement = document._createElement;
    });
    it('should compile and export song to wasm with lib functions exported', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue('');
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
        let audioWorkletMessage;
        window.audioworkletnode = {
            port: {
                postMessage: msg => audioWorkletMessage = msg
            },
            context: {
                sampleRate: 44100
            }
        };
        const downloadPromise = new Promise(resolve => {
            document._createElement = document.createElement;
            document.createElement = function (elementName, options) {
                const elm = this._createElement(elementName, options);

                if (elementName === 'a') {
                    elm.click = () => resolve(elm.href);
                } else if (elementName === 'common-modal') {
                    elm.shadowRoot.result('wasmmodule');
                }
                return elm;
            }
        });

        appElement.querySelector('#exportbutton').click();
        const url = await downloadPromise;

        const wasmbinary = await fetch(url).then(r => r.arrayBuffer());

        assert.isAbove(wasmbinary.byteLength, 1000);
        assert.isDefined((await WebAssembly.instantiate(wasmbinary)).instance.exports.render_128_samples);
        document.createElement = document._createElement;
    });
});

describe('editorcontroller with git', async function () {
    this.timeout(60000);
    const gitrepo = 'test5512331';
    this.afterAll(async () => {
        document.documentElement.removeChild(document.querySelector('app-javascriptmusic'));
        window.history.pushState({}, '', '?');
        assert.equal(location.search, '');
        window.indexedDB.deleteDatabase(`/${gitrepo}`);
    });
    it('gitrepoparam in query string should use git', async () => {
        window.indexedDB.deleteDatabase(`/${gitrepo}`);
        window.history.pushState({}, '', `?gitrepo=${gitrepo}`);
        assert.equal(`?gitrepo=${gitrepo}`, location.search);

        document.documentElement.appendChild(document.createElement('app-javascriptmusic'));
        await waitForAppReady();

        let wasmgitui = null;

        do {
            console.log('waiting for wasm git to be ready');
            await new Promise(resolve => setTimeout(resolve, 500));
            wasmgitui = document.querySelector('app-javascriptmusic')
                .shadowRoot.querySelector('wasmgit-ui');
        } while (wasmgitui === null);

        assert.isOk(wasmgitui);

        let dircontents;
        try {
            dircontents = await commitAndSyncRemote('no changes');
            assert.isTrue(false, 'expected repository to not exist remotely');
        } catch (e) {
            dircontents = e.dircontents;
        }
        console.log('should be no song data');
        assert.isUndefined(dircontents.find(direntry => direntry.endsWith('.js')));

        console.log('should be a file with name song.js');
        await window.compileSong();

        const commitComment = 'added synth and song';
        try {
            await commitAndSyncRemote(commitComment);
            assert.isTrue(false, 'expecting not to be able to push to remote');
        } catch (e) {
            dircontents = e.dircontents;
            assert.equal(dircontents.find(direntry => direntry.endsWith('.js')), 'song.js');
            assert.equal(dircontents.find(direntry => direntry.endsWith('.ts')), 'synth.ts');
        }
        assert.isTrue((await log()).indexOf(commitComment) > -1, 'expecting to find commit comment in log');

        const idbrequest = indexedDB.open(`/${gitrepo}`);
        const db = await new Promise(resolve =>
            idbrequest.onsuccess = (e) => resolve(e.target.result)
        );
        assert.isTrue(db.objectStoreNames.contains('FILE_DATA'), 'file system should have been persisted');
    });
});