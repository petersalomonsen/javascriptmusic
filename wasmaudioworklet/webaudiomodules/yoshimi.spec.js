import { waitForAppReady } from '../app.js';
import { songsourceeditor, synthsourceeditor } from '../editorcontroller.js';
import { wamsynth } from '../webaudiomodules/wammanager.js';

const songsource = `//SONGMODE=YOSHIMI
setBPM(100);
await createTrack(0).steps(1,[c5,e5,]);
loopHere();`;

const synthsource = `<?xml version="1.0" encoding="UTF-8"?>`;

// 69 (A4) = 220 Hz ( special for YOSHIMI, normally it's 440 Hz)
const noteNumberToFreq = (notenumber) => 220 * Math.pow(2, (notenumber - 69)/12);

describe("yoshimi", function() {
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

    it('should play the yoshimi synth', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue(synthsource);

        appElement.querySelector('#startaudiobutton').click();
        while (!wamsynth) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        assert.isDefined(wamsynth);
        assert.isNotNull(wamsynth);
        
        const expectedFrequencies = [
            noteNumberToFreq( 69 + 3 ), // c5
            noteNumberToFreq( 69 + 3 + 4) // e5
        ];

        audioCtx = wamsynth.context;
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32768;
        dataArray = new Float32Array(analyser.frequencyBinCount);
        wamsynth.connect(analyser);

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
});