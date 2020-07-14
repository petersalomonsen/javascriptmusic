import { waitForAppReady } from '../../app.js';
import { songsourceeditor, synthsourceeditor } from '../../editorcontroller.js';
import { getCurrentTime } from './midisynthaudioworklet.js';

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
            midishortmsg: [0x90, 69, 100]
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
        let level = -100;
        while (loudestfrequency < 400 || level < -30) {
            await new Promise(resolve => setTimeout(resolve, 200));
            analyser.getFloatFrequencyData(dataArray);
            const loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx: prev,0);
            loudestfrequency = (audioCtx.sampleRate / 2) * ( (1 + loudestfrequencyindex) / dataArray.length);
            level = dataArray[loudestfrequencyindex];
        }
        console.log(loudestfrequency, audioCtx.sampleRate);
        assert.closeTo(loudestfrequency, 440, 0.1);
    });
    it('should hotswap the midisynth wasm binary', async () => {
        synthsourceeditor.doc.setValue(synthsource.replace('notefreq(note)','notefreq(note+12)'));
        appElement.querySelector('#savesongbutton').click();

        let level = 0;
        console.log('waiting for audio to stop after WASM hotswap');
        while (level > -30) {
            await new Promise(resolve => setTimeout(resolve, 200));
            analyser.getFloatFrequencyData(dataArray);
            const loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx: prev,0);
            level = dataArray[loudestfrequencyindex];
        }
        assert.isBelow(level, -30, 'note should be stopped on WASM hotswap');
        
        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 69, 100]
        });
        let loudestfrequency = 440;

        console.log('waiting for audio to start after WASM hotswap')
        while (loudestfrequency < 500) {
            await new Promise(resolve => setTimeout(resolve, 200));
            analyser.getFloatFrequencyData(dataArray);
            const loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx: prev,0);
            loudestfrequency = (audioCtx.sampleRate / 2) * ( (1 + loudestfrequencyindex) / dataArray.length);
        }
        console.log(loudestfrequency);
        assert.closeTo(loudestfrequency,
            880, 0.2,
            'Note frequency should be one octave up after WASM hotswap');

        window.audioworkletnode.port.postMessage({
            midishortmsg: [0x90, 69, 0]
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
        
        // 69 (A4) = 440 Hz
        const noteNumberToFreq = (notenumber) => 440 * Math.pow(2, (notenumber - 69)/12);

        const expectedFrequencies = [
            noteNumberToFreq( 69 + 12 + 3 ), // c6
            noteNumberToFreq( 69 + 12 + 3 + 4 ), // e6
            noteNumberToFreq( 69 + 12 + 3 + 7 ), // g6
            noteNumberToFreq( 69 + 12 + 3 + 10 ) // a#6
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
            noteNumberToFreq( 69 + 12 + 12 + 3 ), // c7
            noteNumberToFreq( 69 + 12 + 12+ 3 + 4 ), // e7
            noteNumberToFreq( 69 + 12 + 12+ 3 + 7 ), // g7
            noteNumberToFreq( 69 + 12 + 12+ 3 + 10 ) // a#7
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
            noteNumberToFreq( 69 + 12 + 12 + 3 ), // c7
            noteNumberToFreq( 69 + 12 + 12+ 3 + 4 ), // e7
            noteNumberToFreq( 69 + 12 + 12+ 3 + 7 ), // g7
            noteNumberToFreq( 69 + 12 + 12+ 3 + 10 ) // a#7
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
        do {
            await new Promise(resolve => setTimeout(resolve,20));
            currentTime = await getCurrentTime();
            console.log('waiting for loop', currentTime);
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
})