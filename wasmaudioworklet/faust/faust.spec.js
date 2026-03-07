import { waitForAppReady } from '../app.js';
import { songsourceeditor, synthsourceeditor } from '../editorcontroller.js';

const faustSynthSource = `import("stdfaust.lib");

freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);

process = os.sawtooth(freq)
    : fi.lowpass(2, freq * 4)
    : *(en.adsr(0.01, 0.1, 0.7, 0.3, gate))
    : *(gain);
`;

const faustSynthSourceOctaveUp = `import("stdfaust.lib");

freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);

process = os.sawtooth(freq * 2)
    : fi.lowpass(2, freq * 4)
    : *(en.adsr(0.01, 0.1, 0.7, 0.3, gate))
    : *(gain);
`;

const songsource = `
setBPM(100);
`;

// 69 (A4) = 440 Hz
const noteNumberToFreq = (notenumber) => 440 * Math.pow(2, (notenumber - 69) / 12);

describe('faust synth', async function () {
    this.timeout(120000);

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
    it('should compile faust dsp and play a note', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue(faustSynthSource);

        appElement.querySelector('#startaudiobutton').click();
        while (!window.audioworkletnode) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        assert.isDefined(window.audioworkletnode);
        assert.isNotNull(window.audioworkletnode);

        audioCtx = window.audioworkletnode.context;
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32768;
        dataArray = new Float32Array(analyser.frequencyBinCount);
        window.audioworkletnode.connect(analyser);

        // Send note-on for A4 (MIDI note 69) via the Faust poly node
        window.audioworkletnode.midiMessage([0x90, 69, 100]);

        let loudestfrequency = 0;

        while (Math.abs(loudestfrequency - 440) > 2) {
            await new Promise(resolve => setTimeout(resolve, 200));
            analyser.getFloatFrequencyData(dataArray);
            const loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx : prev, 0);
            loudestfrequency = (audioCtx.sampleRate / 2) * ((1 + loudestfrequencyindex) / dataArray.length);
        }

        console.log('faust note frequency', loudestfrequency);
        assert.closeTo(loudestfrequency, 440, 2);

        // Note off
        window.audioworkletnode.midiMessage([0x80, 69, 0]);
    });
    it('should hotswap the faust synth while playing', async () => {
        // Change synth to play one octave up (freq * 2)
        synthsourceeditor.doc.setValue(faustSynthSourceOctaveUp);
        appElement.querySelector('#savesongbutton').click();

        // Wait for recompilation and node replacement
        console.log('waiting for faust hotswap to complete');
        let level = 0;
        while (level > -60) {
            await new Promise(resolve => setTimeout(resolve, 200));
            analyser.getFloatFrequencyData(dataArray);
            const loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx : prev, 0);
            level = dataArray[loudestfrequencyindex];
        }

        // Reconnect analyser to the new node
        analyser.disconnect();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32768;
        dataArray = new Float32Array(analyser.frequencyBinCount);
        window.audioworkletnode.connect(analyser);

        // Play A4 again — should now sound at 880 Hz (octave up)
        window.audioworkletnode.midiMessage([0x90, 69, 100]);

        let loudestfrequency = 0;

        console.log('waiting for faust octave-up note');
        while (Math.abs(loudestfrequency - 880) > 2) {
            await new Promise(resolve => setTimeout(resolve, 200));
            analyser.getFloatFrequencyData(dataArray);
            const loudestfrequencyindex = dataArray.reduce((prev, level, ndx) => level > dataArray[prev] ? ndx : prev, 0);
            loudestfrequency = (audioCtx.sampleRate / 2) * ((1 + loudestfrequencyindex) / dataArray.length);
            console.log('faust hotswap frequency', loudestfrequency);
        }

        assert.closeTo(loudestfrequency, 880, 2,
            'Note frequency should be one octave up after Faust hotswap');

        window.audioworkletnode.midiMessage([0x80, 69, 0]);
    });
});
