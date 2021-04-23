import { COLUMNS_PER_BEAT } from '../pianoroll.js';
import '../midimixer.js';
import { WorkerMessageHandler } from '../../../common/workermessagehandler.js';
import { SEQ_MSG_LOOP, SEQ_MSG_START_RECORDING, SEQ_MSG_STOP_RECORDING } from '../../sequenceconstants.js';
import { extractNotes, convertToBeats } from '../../recording.js';
import { startVideoRecording, stopVideoRecording } from '../../../screenrecorder/screenrecorder.js';
import { getTokenContent, byteArrayToBase64 } from './nearclient.js';
import { decodeAndDecrunch, serializeMusic, deserializeMusic, base64ToByteArray } from './nft.js';
import { exportToWav } from './exportwav.js';
import { applyPolyfill, browserSupportsAudioWorklet } from '../../../audioworkletpolyfill.js';
import { modalYesNo } from '../../../common/ui/modal.js';

let audioWorkletNode;
let audioCtx;
let workerMsgHandler;
let playing = false;
let recordingEnabled = false;
let bpm = 100;
let wasm_synth_bytes;

const beatlengthinput = document.getElementById('beatlengthinput');
let sequenceLengthBeats = parseInt(beatlengthinput.value);
let sequenceEndTime = sequenceLengthBeats * 60000 / bpm;
document.getElementById('timeindicator').max = sequenceEndTime;

const pianorollsdiv = document.querySelector('#pianorolls');
const midipartselect = document.querySelector('#midipartselect');

['piano', 'strings', 'drums', 'guitar', 'bass', 'flute'].forEach((name, ndx) => {
    const pianoroll = document.createElement('midi-pianoroll');
    pianoroll.setAttribute('data-columns', `${sequenceLengthBeats * COLUMNS_PER_BEAT}`);
    pianoroll.setAttribute('data-title', name);
    pianoroll.style.display = 'none';
    pianoroll.channel = ndx;
    pianorollsdiv.appendChild(pianoroll);
    const selectoption = document.createElement('option');
    selectoption.value = ndx;
    selectoption.innerHTML = name;
    midipartselect.appendChild(selectoption);
});

const onpianokey = (evt) => {
    audioWorkletNode.port.postMessage({midishortmsg: [0x90 + evt.target.channel, evt.detail.note, evt.detail.velocity]});
};

let currentVisiblePart = 0;
let pianoroll = pianorollsdiv.firstChild;
pianoroll.addEventListener('change', updateSequence);
pianoroll.addEventListener('pianokey', onpianokey);
pianoroll.style.display = 'block';

midipartselect.addEventListener('change', e => {
    pianoroll.style.display = 'none';
    pianoroll.removeEventListener('change', updateSequence);
    pianoroll.removeEventListener('pianokey', onpianokey);
    currentVisiblePart = e.target.value;
    pianoroll = pianorollsdiv.childNodes[currentVisiblePart];
    pianoroll.style.display = 'block';
    
    pianoroll.addEventListener('change', updateSequence);
    pianoroll.addEventListener('pianokey', onpianokey);
});

function convertPianorollsDataToEventList() {
    const pianorollsdata = Array.from(pianorollsdiv.childNodes).map((pianoroll) => pianoroll.getPianorollData());    

    return pianorollsdata.map((pianorolldata, channel) =>
        pianorolldata.map(r => r.noteNumber ? [{
        time: r.start * 60000 / bpm,
        message: [0x90 + channel, r.noteNumber, r.velocityValue]
    },{
        time: r.end * 60000 / bpm,
        message: [0x90 + channel, r.noteNumber, 0]
    }]: {
        time: r.start * 60000 / bpm,
        message: [0xb0 + channel, r.controllerNumber, r.controllerValue]
    })).flat(2).sort((a,b) => a.time - b.time);
}

function updateSequence() {
    if (!audioCtx) {
        return;
    }
    const seqdata = convertPianorollsDataToEventList();

    if (recordingEnabled) {
        seqdata.splice(0, 0, {time: 0, message: [SEQ_MSG_START_RECORDING]});
        seqdata.push({time: sequenceEndTime, message: [SEQ_MSG_STOP_RECORDING]});
    }
    seqdata.push({time: sequenceEndTime, message: [SEQ_MSG_LOOP]});
    audioWorkletNode.port.postMessage({sequencedata: seqdata});
}

window.toggleRecording = async function() {
    recordingEnabled = !recordingEnabled;
    if (!recordingEnabled) {
        document.getElementById('recordingbutton').classList.remove('toggled');
        const recordeddata = (await workerMsgHandler.callAndGetResult({
            recorded: true
        }, (msg) => msg.recorded !== undefined)).recorded;
        if (confirm('keep recording?')) {
            convertToBeats(extractNotes(recordeddata), bpm).forEach(e => {
                if(e[1] >= 0) {
                    pianoroll.addNote(e[1], e[3], e[4], e[2]);
                } else {
                    pianoroll.addControlEvent(e[4], e[3], e[2]);
                }
            });
        }
    } else {
        document.getElementById('recordingbutton').classList.add('toggled');
    }
    updateSequence();
};

window.togglePlay = async function() {
    if (!audioCtx) {
        await startAudio();
    }
    playing = !playing;
    audioWorkletNode.port.postMessage({
        toggleSongPlay: playing
    });
    if (playing) {
        const mixerdata = document.querySelector('midi-mixer').getState();
        mixerdata.forEach((v, ch) => {
            audioWorkletNode.port.postMessage({
                midishortmsg: [
                    0xb0 + ch, 7, v.volume
                ]
            });
            audioWorkletNode.port.postMessage({
                midishortmsg: [
                    0xb0 + ch, 10, v.pan
                ]
            });
        });
        updateSequence();
        document.getElementById('playbutton').classList.add('toggled');
    } else {
        document.getElementById('playbutton').classList.remove('toggled');
    }
};
window.startAudio = async function() {
    if (audioCtx) {
        return;
    }

    const audiobutton = document.getElementById('audiobutton')
    audiobutton.classList.add('toggled');
    audiobutton.disabled = true;

    if (browserSupportsAudioWorklet && !(await modalYesNo('Use AudioWorklet technology?', `
        Music played here is synthesized in real time, and may be demanding on computing resources.
        <br />
        AudioWorklet provides the best experience if your browser / device support it well.
        In some browsers audio playback may be more stable without it.
    `))) {
        audioCtx = new AudioContext({ sampleRate: 22050 });
        audioCtx.resume();    
        applyPolyfill(audioCtx);
    } else {
        audioCtx = new AudioContext({ sampleRate: 44100 });
        audioCtx.resume();
    }

    const encoded = await getTokenContent();
    wasm_synth_bytes = decodeAndDecrunch(encoded);

    await audioCtx.audioWorklet.addModule('./audioworkletprocessor.js');

    audioWorkletNode = new AudioWorkletNode(audioCtx, 'asc-midisynth-audio-worklet-processor', {
        outputChannelCount: [2]
    });
    audioWorkletNode.port.start();
    console.log('audioworklet node started');
    workerMsgHandler = new WorkerMessageHandler(audioWorkletNode.port);
    await workerMsgHandler.callAndGetResult({
            samplerate: audioCtx.sampleRate,
            wasm: wasm_synth_bytes,
            sequencedata: [],
            toggleSongPlay: false
        }, (msg) => msg.wasmloaded);
    console.log('audioworklet node loaded');
    audioWorkletNode.connect(audioCtx.destination);

    try {
        const midi = await navigator.requestMIDIAccess();

        for (var input of midi.inputs.values()) {
            input.onmidimessage = (msg) => {
                const data = msg.data;
                if (data.length === 3 && (
                        (data[0] & 0xf0) === 0x80 ||
                        (data[0] & 0xf0) === 0x90 ||
                        (data[0] & 0xf0) === 0xb0
                    )
                ) {
                    data[0] = (data[0] & 0xff) + parseInt(midipartselect.value);
                    audioWorkletNode.port.postMessage({midishortmsg: data});
                }
            };
        }
    } catch (e) {
        console.log('no midi');
    }

    const updateTimeIndicator = async () => {
        let currentTime = (await workerMsgHandler.callAndGetResult({currentTime: true}, msg => msg.currentTime !== undefined)).currentTime;
        pianoroll.setTimeIndicatorPos(currentTime * bpm / 60000);
        const timeIndicatorElement = document.getElementById('timeindicator');
        const timeIndicatorMax = parseInt(timeIndicatorElement.max);

        if (currentTime > (timeIndicatorMax+ 100)) {
            currentTime %= timeIndicatorMax;
            seek(currentTime);
        }
        timeIndicatorElement.value = currentTime;
        requestAnimationFrame(updateTimeIndicator);
    };
    requestAnimationFrame(updateTimeIndicator);
    function seek(val) {
        audioWorkletNode.port.postMessage({ seek: val });
    }
    window.seek = seek;    
};

function mixerchange(evt) {
    if (!audioWorkletNode) {
        return;
    }
    audioWorkletNode.port.postMessage({
        midishortmsg: [
            0xb0 + evt.detail.channel, evt.detail.controller, evt.detail.value
        ]
    });
}
window.mixerchange = mixerchange;

window.clearAll = () => {
    if (confirm('Really delete everything?')) {
        Array.from(document.querySelectorAll('midi-pianoroll')).forEach(pianoroll => pianoroll.clearAll());
        updateSequence();
    }
};
document.getElementById('tempoinput').addEventListener('change', (ev) => {
    bpm = parseInt(ev.target.value);
    sequenceEndTime = sequenceLengthBeats * 60000 / bpm;
    document.getElementById('timeindicator').max = sequenceEndTime;
    updateSequence();
});

beatlengthinput.addEventListener('change', (ev) => {
    const newValue = parseInt(ev.target.value);
    if ( newValue > beatlengthinput.max) {
        ev.target.value = beatlengthinput.max;
    } else if (newValue < beatlengthinput.min) {
        ev.target.value = beatlengthinput.min;
    }
    Array.from(pianorollsdiv.childNodes).forEach((pianoroll) => {
        sequenceLengthBeats = parseInt(ev.target.value);
        pianoroll.setAttribute('data-columns', `${sequenceLengthBeats * COLUMNS_PER_BEAT}`);
        
        sequenceEndTime = sequenceLengthBeats * 60000 / bpm;
        document.getElementById('timeindicator').max = sequenceEndTime;
    });
    updateSequence();
});
const recordVideoButton = document.getElementById('recordvideobutton');
recordVideoButton.addEventListener('click', async () => {
    if (!audioCtx) {
        return;
    }

    if (!recordVideoButton.classList.contains('toggled')) {
        recordVideoButton.classList.add('toggled');
        await startVideoRecording(audioCtx, audioWorkletNode);
    } else {
        stopVideoRecording();
        recordVideoButton.classList.remove('toggled');        
    }
});

export const exportWav = () => {
    exportToWav(convertPianorollsDataToEventList(),wasm_synth_bytes);    
};

window.saveToLocalStorage = async () => {
    localStorage.setItem('lastSavedMusicPiece', await byteArrayToBase64(serializeMusic()));
};

try {
    deserializeMusic(base64ToByteArray(localStorage.getItem('lastSavedMusicPiece')));
} catch(e) { console.log('no saved music was found in local storage', e); }
