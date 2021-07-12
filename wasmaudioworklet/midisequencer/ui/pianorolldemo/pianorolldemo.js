import { COLUMNS_PER_BEAT } from '../pianoroll.js';
import '../midimixer.js';
import '../partschedule.js';
import { WorkerMessageHandler } from '../../../common/workermessagehandler.js';
import { SEQ_MSG_LOOP, SEQ_MSG_START_RECORDING, SEQ_MSG_STOP_RECORDING } from '../../sequenceconstants.js';
import { extractNotes, convertToBeats } from '../../recording.js';
import { startVideoRecording, stopVideoRecording } from '../../../screenrecorder/screenrecorder.js';
import { getTokenContent, byteArrayToBase64 } from './nearclient.js';
import { decodeAndDecrunch, serializeMusic, deserializeMusic, base64ToByteArray, showPublishButton } from './nft.js';
import { exportToWav } from './exportwav.js';
import { modal, modalYesNo } from '../../../common/ui/modal.js';
import { getAudioWorkletModuleUrl } from '../../../common/audioworkletmodules.js';
import { AssemblyScriptMidiSynthAudioWorkletProcessorModule } from '../../../synth1/audioworklet/midisynthaudioworkletprocessor.js';
import { AudioWorkletProcessorSequencerModule } from '../../audioworkletprocessorsequencer.js';

let audioWorkletNode;
let audioCtx;
let workerMsgHandler;
let playing = false;
let recordingEnabled = false;
let bpm = 100;
let wasm_synth_bytes;

const pianorollsdiv = document.querySelector('#pianorolls');
const midipartselect = document.querySelector('#midipartselect');
const partscheduler = document.querySelector('midi-part-scheduler');

let sequenceEndTime;

const channelNames = ['piano', 'strings', 'drums', 'guitar', 'bass', 'flute'];
let partsPerChannel = {};
let pianoroll;

export function addPianoroll(channel) {
    if(!partsPerChannel[channel]) {
        partsPerChannel[channel] = 1;
    }
    const name = channelNames[channel]+' '+(partsPerChannel[channel]++);
    const pianoroll = document.createElement('midi-pianoroll');
    pianoroll.setAttribute('data-title', name);
    pianoroll.setAttribute('data-columns', 4 * COLUMNS_PER_BEAT);
    pianoroll.style.display = 'none';
    pianoroll.channel = channel;
    pianorollsdiv.appendChild(pianoroll);
    const selectoption = document.createElement('option');
    selectoption.value = pianorollsdiv.childElementCount - 1;
    selectoption.innerHTML = name;
    midipartselect.appendChild(selectoption);
    partscheduler.setAttribute('data-parts', Array.from(midipartselect.childNodes).map(opt => opt.innerHTML));
    return pianoroll;
}

const onpianokey = (evt) => {
    audioWorkletNode.port.postMessage({midishortmsg: [0x90 + evt.target.channel, evt.detail.note, evt.detail.velocity]});
};

midipartselect.addEventListener('change', e => selectPianoroll(e.target.value));

export function selectPianoroll(pianorollndx) {
    if (pianoroll) {
        pianoroll.style.display = 'none';
        pianoroll.removeEventListener('change', updateSequence);
        pianoroll.removeEventListener('pianokey', onpianokey);
    }
    document.querySelector('#midipartselect').value = pianorollndx;
    pianoroll = pianorollsdiv.childNodes[pianorollndx];
    pianoroll.style.display = 'block';
    
    pianoroll.addEventListener('change', updateSequence);
    pianoroll.addEventListener('pianokey', onpianokey);
}

function convertPianorollsDataToEventList() {
    const pianorollsdata = Array.from(pianorollsdiv.childNodes).map((pianoroll) => ({
        channel: pianoroll.channel,
        length: parseInt(pianoroll.dataset.columns) / COLUMNS_PER_BEAT,
        pianorolldata: pianoroll.getPianorollData()
    }));

    const parts = pianorollsdata.map((pianorolldata) =>
            pianorolldata.pianorolldata.map(r => r.noteNumber ? [{
                time: r.start,
                message: [0x90 + pianorolldata.channel, r.noteNumber, r.velocityValue]
            },{
                time: r.end - 0.01,
                message: [0x90 + pianorolldata.channel, r.noteNumber, 0]
            }]: {
                time: r.start,
                message: [0xb0 + pianorolldata.channel, r.controllerNumber, r.controllerValue]
            }
        ).flat(1)
    )

    const partschedules = partscheduler.getState();

    let sequenceLengthBeats = 0;
    const sequence = partschedules.map(sch => {
        const playTimes = 1 + sch.repeat;
        const partLength = pianorollsdata[sch.part].length;

        const partEndBeat = sch.beat + partLength * playTimes;
        if (partEndBeat > sequenceLengthBeats) {
            sequenceLengthBeats = partEndBeat;
        }
        const partevents = [];
        for (let n=0; n<playTimes; n++) {
            parts[sch.part].forEach(evt =>
                partevents.push(Object.assign({}, evt, {time: (partLength * n + evt.time + sch.beat) * 60000 / bpm}))
            );
        }
        return partevents;
    }).flat(1);

    sequenceEndTime = sequenceLengthBeats * 60000 / bpm;

    document.getElementById('timeindicator').max = sequenceEndTime;

    return sequence.sort((a,b) => a.time - b.time);
}

export function updateSequence() {
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
        if (await modalYesNo('keep recording?', '')) {
            const schedules = partscheduler.getState().filter(sch => sch.part == midipartselect.value);
            
            convertToBeats(extractNotes(recordeddata), bpm).forEach(e => {
                const beatpos = e[3];
                const beatoffset = (arr => arr.length ? arr[arr.length-1].beat : -1)(schedules.filter(sch => sch.beat < beatpos));
                if(beatoffset >= 0) {
                    const adjustedbeatpos = beatpos - beatoffset;
                    
                    if(e[1] >= 0) {
                        pianoroll.addNote(e[1], adjustedbeatpos, e[4], e[2]);
                    } else {
                        pianoroll.addControlEvent(e[4], adjustedbeatpos, e[2]);
                    }
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

    audioCtx = new AudioContext({ sampleRate: 44100 });
    audioCtx.resume();

    const encoded = await getTokenContent();
    wasm_synth_bytes = decodeAndDecrunch(encoded);

    await audioCtx.audioWorklet.addModule(getAudioWorkletModuleUrl(AudioWorkletProcessorSequencerModule));
    await audioCtx.audioWorklet.addModule(getAudioWorkletModuleUrl(AssemblyScriptMidiSynthAudioWorkletProcessorModule));
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
                    data[0] = (data[0] & 0xff) + parseInt(pianorollsdiv.childNodes[midipartselect.value].channel);
                    audioWorkletNode.port.postMessage({midishortmsg: data});
                }
            };
        }
    } catch (e) {
        console.log('no midi');
    }

    const updateTimeIndicator = async () => {
        let currentTime = (await workerMsgHandler.callAndGetResult({currentTime: true}, msg => msg.currentTime !== undefined)).currentTime;
        const beatpos = currentTime * bpm / 60000
        const schedules = partscheduler.getState().filter(sch => sch.part == midipartselect.value);
        const beatoffset = (arr => arr.length ? arr[arr.length-1].beat : -1)(schedules.filter(sch => sch.beat < beatpos));
        if(beatoffset >= 0) {
            const adjustedbeatpos = beatpos - beatoffset;
            pianoroll.setTimeIndicatorPos(adjustedbeatpos);
        }
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

export function clearAll() {
    Array.from(document.querySelectorAll('midi-pianoroll')).forEach(pianoroll => pianoroll.remove());
    Array.from(midipartselect.childNodes).forEach(s => s.remove());
    document.querySelector('midi-part-scheduler').setState([]);
    partsPerChannel = {};
    updateSequence();
}

window.clearAll = async () => {
    if (await modalYesNo('Really delete everything?','')) {
        clearAll();
        showPublishButton();
    }
};

document.getElementById('tempoinput').addEventListener('change', (ev) => {
    bpm = parseInt(ev.target.value);
    updateSequence();
});
document.getElementById('addmidipartbutton').addEventListener('click', async (ev) => {
    const channel = await modal(`
        <h3>Select instrument</h3>
        <p>
        <select id="channelselect">
            ${channelNames.map((ch, ndx) => `<option value="${ndx}">${ch}</option>`)}
        </select>
        </p>
        <button onclick="getRootNode().result(-1)">Cancel</button>
        <button onclick="getRootNode().result(parseInt(getRootNode().querySelector('#channelselect').value))">Ok</button>
    `);
    if (channel>=0) {
        addPianoroll(channel);
        selectPianoroll(pianorollsdiv.childNodes.length - 1);
    }
});

partscheduler.addEventListener('change', () => updateSequence());

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
    const eventlist = document.querySelector('midi-mixer').getState().map((v, ch) => [{
            time: 0,
            message: [
                0xb0 + ch, 7, v.volume
            ]
        },
        {
            time: 0,
            message: [
                    0xb0 + ch, 10, v.pan
                ]
        }]).flat(1).concat(convertPianorollsDataToEventList());
    exportToWav(eventlist,wasm_synth_bytes);    
};

window.saveToLocalStorage = async () => {
    localStorage.setItem('lastSavedMusicPiece', await byteArrayToBase64(serializeMusic()));
};


const lastsaved = localStorage.getItem('lastSavedMusicPiece')
if (lastsaved) {
    deserializeMusic(base64ToByteArray(lastsaved));
}
