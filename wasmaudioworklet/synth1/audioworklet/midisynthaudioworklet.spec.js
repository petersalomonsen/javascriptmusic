import { waitForAppReady } from '../../app.js';
import { songsourceeditor, synthsourceeditor } from '../../editorcontroller.js';
import { getCurrentTime, exportToWav } from './midisynthaudioworklet.js';
import { getTargetNoteStates } from '../../visualizer/80sgrid.js';
import { compileWebAssemblySynth } from '../browsersynthcompiler.js';
import { compileSong as compileMidiSong } from '../../midisequencer/songcompiler.js';

const synthsource = `
import { midichannels, MidiChannel, MidiVoice , SineOscillator, Envelope, notefreq } from './globalimports';

class SimpleSine extends MidiVoice {
    osc: SineOscillator = new SineOscillator();
    env: Envelope = new Envelope(0.0, 0.0, 1.0, 0.1);

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.osc.frequency = notefreq(note);
        this.env.attack();
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
        return this.env.isDone();
    }

    nextframe(): void {
        const signal = this.osc.next() * this.env.next() * this.velocity / 256;
        this.channel.signal.add(signal, signal);
    }
}
export function initializeMidiSynth(): void {
    midichannels[0] = new MidiChannel(1, (ch) => new SimpleSine(ch));
}
export function postprocess(): void {
}
`;

const songsource = `
setBPM(100);
`;

// 69 (A4) = 440 Hz
const noteNumberToFreq = (notenumber) => 440 * Math.pow(2, (notenumber - 69)/12);

const notemap = {};
new Array(128).fill(null).map((v, ndx) => 
        (['c','cs','d','ds','e','f','fs','g','gs','a','as','b'])[ndx%12]+''+Math.floor(ndx/12)
    ).forEach((note, ndx) => notemap[note] = ndx);

describe('midisynth audio worklet', async function() {
    this.timeout(20000);

    let appElement;
    let analyser;
    let audioCtx;
    let dataArray;

    this.beforeAll(async () => {
        document.documentElement.appendChild(document.createElement('app-javascriptmusic'));
        await waitForAppReady();
        appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
    });
    this.afterAll(async () => {
        window.stopaudio();
        window.audioworkletnode = undefined;
        document.documentElement.removeChild(document.querySelector('app-javascriptmusic'));
    });
    it('should create the midisynth and play a note', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue(synthsource);

        appElement.querySelector('#startaudiobutton').click();
        while (!window.audioworkletnode) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        assert.isDefined(window.audioworkletnode);
        assert.isNotNull(window.audioworkletnode);
        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 69, 127]
        });
        window.audioworkletnode.port.postMessage({
            midishortmsg: [0xb0, 7, 127]
        });
        audioCtx = window.audioworkletnode.context;
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32768;
        dataArray = new Float32Array(analyser.frequencyBinCount);
        window.audioworkletnode.connect(analyser);

        let loudestfrequency = 0;
        
        while (Math.abs(loudestfrequency - 440) > 0.1) {
            await new Promise(resolve => setTimeout(resolve, 200));
            analyser.getFloatFrequencyData(dataArray);
            const loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx: prev,0);
            loudestfrequency = (audioCtx.sampleRate / 2) * ( (1 + loudestfrequencyindex) / dataArray.length);
        }

        console.log(loudestfrequency, audioCtx.sampleRate);
        assert.closeTo(loudestfrequency, 440, 0.1);
    });
    it('should hotswap the midisynth wasm binary', async () => {
        synthsourceeditor.doc.setValue(synthsource.replace('notefreq(note)','notefreq(note+12)'));
        appElement.querySelector('#savesongbutton').click();

        let level = 0;
        console.log('waiting for audio to stop after WASM hotswap');
        while (level > -60) {
            await new Promise(resolve => setTimeout(resolve, 200));
            analyser.getFloatFrequencyData(dataArray);
            const loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx: prev,0);
            level = dataArray[loudestfrequencyindex];
            console.log((audioCtx.sampleRate / 2) * ( (1 + loudestfrequencyindex) / dataArray.length), level);
        }
        assert.isBelow(level, -60, 'note should be stopped on WASM hotswap');
        
        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 69, 127]
        });
        let loudestfrequency = 440;

        console.log('waiting for audio to start after WASM hotswap');
        while (Math.abs(loudestfrequency - 880) > 0.5 || level < -35) {
            await new Promise(resolve => setTimeout(resolve, 200));
            analyser.getFloatFrequencyData(dataArray);
            const loudestfrequencyindex = dataArray.reduce((prev, lv, ndx) => lv > dataArray[prev] ? ndx: prev,0);
            level = dataArray[loudestfrequencyindex];
            loudestfrequency = (audioCtx.sampleRate / 2) * ( (1 + loudestfrequencyindex) / dataArray.length);
            console.log(loudestfrequency, level);
        }
        console.log('frequency after hotswap', loudestfrequency, level);
        assert.closeTo(loudestfrequency,
            880, 0.5,
            'Note frequency should be one octave up after WASM hotswap');

        synthsourceeditor.doc.setValue(synthsource.replace('notefreq(note+12)','notefreq(note)'));
        appElement.querySelector('#savesongbutton').click();

        console.log('waiting for audio to stop after WASM hotswap (reverted changes)');

        while (level > -40) {
            await new Promise(resolve => setTimeout(resolve, 200));
            analyser.getFloatFrequencyData(dataArray);
            const loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx: prev,0);
            level = dataArray[loudestfrequencyindex];
        }
        assert.isBelow(level, -40, 'note should be stopped on WASM hotswap (reverted changes)');

        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 57, 127]
        });

        while (level < -30) {
            await new Promise(resolve => setTimeout(resolve, 200));
            analyser.getFloatFrequencyData(dataArray);
            const loudestfrequencyindex = dataArray.reduce((prev, lv, ndx) => lv > dataArray[prev] ? ndx: prev,0);
            level = dataArray[loudestfrequencyindex];
            loudestfrequency = (audioCtx.sampleRate / 2) * ( (1 + loudestfrequencyindex) / dataArray.length);
        }
        assert.closeTo(loudestfrequency,
            220, 1.0,
            'Note frequency should be 220 after WASM hotswap revert');

        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 57, 0]
        });    
    });
    it('should be able to play a sequence', async () => {
        songsourceeditor.doc.setValue(`
            setBPM(100);

            await createTrack(0).steps(4, [
                c6,,e6,,g6,,as6,
                ,,,,
            ]);

            loopHere();
        `);
        appElement.querySelector('#savesongbutton').click();
        
        const expectedNotes = [
            notemap['c6'],
            notemap['e6'],
            notemap['g6'],
            notemap['as6']
        ];

        while(expectedNotes.length > 0) {
            let loudestfrequency = 0;
            let loudestfrequencyindex = 0;
            const nextExpectedFrequency = noteNumberToFreq(expectedNotes.shift());

            while (loudestfrequency < nextExpectedFrequency) {
                await new Promise(resolve => setTimeout(resolve, 50));
                analyser.getFloatFrequencyData(dataArray);
                loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx: prev,0);
                loudestfrequency = (audioCtx.sampleRate / 2) * ( (1 + loudestfrequencyindex) / dataArray.length);
            }

            assert.closeTo(loudestfrequency, nextExpectedFrequency, 5.0, 'Expected note to have frequency close to ' + nextExpectedFrequency);
        }
    });
    it('should be able to modify a sequence while playing', async () => {
        songsourceeditor.doc.setValue(`
            setBPM(100);

            await createTrack(0).steps(4, [
                c7,,e7,,g7,,as7,
                ,,,,
            ]);

            loopHere();
        `);
        appElement.querySelector('#savesongbutton').click();
        console.log('waiting for updated song to take effect');

        const expectedFrequencies = [
            noteNumberToFreq( notemap['c7'] ),
            noteNumberToFreq( notemap['e7'] ),
            noteNumberToFreq( notemap['g7'] ),
            noteNumberToFreq( notemap['as7'])
        ];

        while(expectedFrequencies.length > 0) {
            let loudestfrequency = 0;
            let loudestfrequencyindex = 0;
            const nextExpectedFrequency = expectedFrequencies.shift();

            while (loudestfrequency < nextExpectedFrequency) {
                await new Promise(resolve => setTimeout(resolve, 50));
                analyser.getFloatFrequencyData(dataArray);
                loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx: prev,0);
                loudestfrequency = (audioCtx.sampleRate / 2) * ( (1 + loudestfrequencyindex) / dataArray.length);
            }

            assert.closeTo(loudestfrequency, nextExpectedFrequency, 5.0, 'Expected note to have frequency close to ' + nextExpectedFrequency);
        }
    });
    it('should be able to stop and restart playing without modifying the webassembly synth', async () => {
        appElement.querySelector('#stopaudiobutton').click();
        console.log('waiting for audioworklet to stop');

        while (window.audioworkletnode) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        appElement.querySelector('#startaudiobutton').click();

        console.log('waiting for song to start playing');

        while (!window.audioworkletnode) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        const expectedFrequencies = [
            noteNumberToFreq( notemap['c7'] ),
            noteNumberToFreq( notemap['e7'] ),
            noteNumberToFreq( notemap['g7'] ),
            noteNumberToFreq( notemap['as7'])
        ];

        audioCtx = window.audioworkletnode.context;
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32768;
        dataArray = new Float32Array(analyser.frequencyBinCount);
        window.audioworkletnode.connect(analyser);

        while(expectedFrequencies.length > 0) {
            let loudestfrequency = 0;
            let loudestfrequencyindex = 0;
            const nextExpectedFrequency = expectedFrequencies.shift();

            console.log('expecting frequency',nextExpectedFrequency);
            while (Math.abs(loudestfrequency - nextExpectedFrequency) > 5.0 ) {
                await new Promise(resolve => setTimeout(resolve, 50));
                analyser.getFloatFrequencyData(dataArray);
                loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx: prev,0);
                loudestfrequency = (audioCtx.sampleRate / 2) * ( (1 + loudestfrequencyindex) / dataArray.length);
            }

            assert.closeTo(loudestfrequency, nextExpectedFrequency, 5.0, 'Expected note to have frequency close to ' + nextExpectedFrequency);
        }
    });
    it('should record midi', async () => {
        songsourceeditor.doc.setValue(`
            setBPM(120);

            startRecording();
            await createTrack(0,1).steps(4, [
                c3,,,,
                e3,,,,
                g3,,,,
                e3,,,,
            ]);
            stopRecording();
            loopHere();
        `);
        appElement.querySelector('#savesongbutton').click();

        const firstTimeStamp = await getCurrentTime();
        let currentTime = firstTimeStamp;
        console.log('waiting for loop');
        do {
            currentTime = await getCurrentTime();
        } while (currentTime >= firstTimeStamp);

        console.log('sending midi events');
        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 69, 91]
        });
        await new Promise(resolve => setTimeout(resolve,500));
        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 69, 0]
        });
        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 72, 92]
        });
        await new Promise(resolve => setTimeout(resolve,500));
        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 72, 0]
        });
        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 76, 93]
        });
        await new Promise(resolve => setTimeout(resolve,500));
        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 76, 0]
        });
        
        await new Promise(resolve => setTimeout(resolve,500));

        console.log('insert recording');
        window.insertRecording();
        
        let songsource;
        do {
            songsource = songsourceeditor.doc.getValue();
            console.log(songsource);
            await new Promise(resolve => setTimeout(resolve, 500));
        } while (songsource.indexOf('createTrack(0).play(') === -1)

        assert.isTrue(songsource.indexOf('a5(') > -1);
        assert.isTrue(songsource.indexOf('c6(') > -1);
        assert.isTrue(songsource.indexOf('e6(') > -1);
    });
    it('should be able to visualize a sequence when playing', async () => {
        appElement.querySelector('#stopaudiobutton').click();
        console.log('waiting for audioworklet to stop');

        while (window.audioworkletnode) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        songsourceeditor.doc.setValue(`
            setBPM(30);

            await createTrack(0).steps(2, [
                c6(1,127),e6(1,127),g6(1,127),as6(1,127)
                ,,,,
                ,,,,
                ,,,,
            ]);
        `);
        appElement.querySelector('#savesongbutton').click();
        appElement.querySelector('#startaudiobutton').click();

        const expectedNotes = [
            notemap['c6'],
            notemap['e6'],
            notemap['g6'],
            notemap['as6']
        ];

        for (let n = 0; n<expectedNotes.length; n++) {
            const nextExpectedNote = expectedNotes[n];
            console.log('expecting note in visualizer', nextExpectedNote);
            while (getTargetNoteStates()[nextExpectedNote] === -1) {
                await new Promise(r => setTimeout(r, 0));                
            }
            assert.approximately(getTargetNoteStates()[nextExpectedNote], 1.0, 0.1);
        }
        while (getTargetNoteStates().find(v => v > -1)) {
            await new Promise(r => setTimeout(r, 100));
        }
        getTargetNoteStates().forEach(v => assert.equal(v, -1));
    });
    it('should export song to wav', async () => {
        const eventlist = await compileMidiSong(`setBPM(60);await createTrack(0).steps(1, [c4,d4,e4,f4])`);
        const wasm_synth_bytes = await compileWebAssemblySynth(synthsource + '\n', null, 44100, null);

        let soundFileDataPromise;

        document._createElementOriginal = document.createElement;
        document.createElement = function(elementType) {
            const createdElement = this._createElementOriginal(elementType);
            if (elementType === 'a') {
                soundFileDataPromise = new Promise(async resolve => {
                    createdElement.click = async () => {                        
                        const sounddata = await (await fetch(createdElement.href)).arrayBuffer();
                        console.log('sounddata length', sounddata.byteLength)
                        resolve(sounddata);
                    };
                });
            }
            return createdElement;
        }
        await exportToWav(eventlist, wasm_synth_bytes);
        
        const soundfiledata = await soundFileDataPromise;
        
        const audioCtx = new AudioContext();

        const analyser = audioCtx.createAnalyser();
        
        analyser.fftSize = 32768;
        dataArray = new Float32Array(analyser.frequencyBinCount);
        const decodeddata = await audioCtx.decodeAudioData(soundfiledata);

        assert.equal(decodeddata.duration, 4);
        assert.isTrue(decodeddata.getChannelData(0).find(v => v > 0) !== undefined);

        const src = audioCtx.createBufferSource();
        src.buffer = decodeddata;

        src.connect(analyser);
        src.connect(audioCtx.destination);
        src.start(0);

        const expectedNotes = [
            notemap['c4'],
            notemap['d4'],
            notemap['e4'],
            notemap['f4']
        ];

        while(expectedNotes.length > 0) {
            let loudestfrequency = 0;
            let loudestfrequencyindex = 0;
            const nextExpectedNote = expectedNotes.shift();
            const nextExpectedFrequency = noteNumberToFreq(nextExpectedNote);

            console.log('waiting for note in export', nextExpectedNote, nextExpectedFrequency);

            while (Math.abs(loudestfrequency - nextExpectedFrequency) > 5.0) {
                await new Promise(resolve => setTimeout(resolve, 50));
                analyser.getFloatFrequencyData(dataArray);
                loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx: prev,0);
                loudestfrequency = (audioCtx.sampleRate / 2) * ( (1 + loudestfrequencyindex) / dataArray.length);
            }

            assert.closeTo(loudestfrequency, nextExpectedFrequency, 5.0, 'Expected note to have frequency close to ' + nextExpectedFrequency);
        }
        document.createElement = document._createElementOriginal;
    });
});
