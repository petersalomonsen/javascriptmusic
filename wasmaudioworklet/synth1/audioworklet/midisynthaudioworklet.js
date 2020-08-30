import { visualizeSong, setGetCurrentTimeFunction, setPaused } from '../../visualizer/midieventlistvisualizer.js';
import { WorkerMessageHandler } from '../../common/workermessagehandler.js';
import { toggleSpinner, setProgressbarValue } from '../../app.js';
import { audioBufferToWav } from '../../common/audiobuffertowav.js';

export let audioworkletnode;

let workerMessageHandler;

export function onmidi(data) {
    audioworkletnode.port.postMessage({ 
        midishortmsg: data
    });
}

export async function updateSong(sequencedata, toggleSongPlay) {
    audioworkletnode.port.postMessage({
        sequencedata: sequencedata,
        toggleSongPlay: toggleSongPlay
    });
    setPaused(!toggleSongPlay);
    visualizeSong(sequencedata);
}

async function connectAudioWorklet(context, wasm_synth_bytes, sequencedata, toggleSongPlay) {
    await context.audioWorklet.addModule('./synth1/audioworklet/midisynthaudioworkletprocessor.js');
    const awn = new AudioWorkletNode(context, 'asc-midisynth-audio-worklet-processor', {
        outputChannelCount: [2]
    });
    awn.port.start();    
    
    const wmh = new WorkerMessageHandler(awn.port);
    await wmh.callAndGetResult({
            samplerate: context.sampleRate, 
            wasm: wasm_synth_bytes, 
            sequencedata: sequencedata,
            toggleSongPlay: toggleSongPlay
        }, (msg) => msg.wasmloaded);
    setGetCurrentTimeFunction(getCurrentTime);

    awn.connect(context.destination);

    return {audioworkletnode: awn, workerMessageHandler: wmh};
}

export async function createAudioWorklet(context, wasm_synth_bytes, sequencedata, toggleSongPlay) {
    const audioWorkletObjects = await connectAudioWorklet(context, wasm_synth_bytes, sequencedata, toggleSongPlay);

    audioworkletnode = audioWorkletObjects.audioworkletnode;
    workerMessageHandler = audioWorkletObjects.workerMessageHandler;

    setPaused(!toggleSongPlay);
    visualizeSong(sequencedata);
    return audioworkletnode;
}

export async function getRecordedData() {
    return (await workerMessageHandler.callAndGetResult({recorded: true},
            (msgdata) => msgdata.recorded ? true : false))
        .recorded;
}

export async function getCurrentTime() {
    return (await workerMessageHandler.callAndGetResult({currentTime: true},
            (msgdata) => msgdata.currentTime !== undefined ? true : false))
        .currentTime;
}

export async function exportToWav(eventlist, wasm_synth_bytes) {
    toggleSpinner(true);
    const renderSampleRate = 44100;
    const duration = eventlist[eventlist.length-1].time / 1000;
    const offlineCtx = new OfflineAudioContext(2,
            duration * renderSampleRate,
            renderSampleRate);
    
    await offlineCtx.audioWorklet.addModule('./midisequencer/audioworkletprocessorsequencer.js');
    await connectAudioWorklet(offlineCtx, wasm_synth_bytes, eventlist, true);

    console.log('rendering audio');

    let rendering = true;

    const updateSpinner = () => requestAnimationFrame(() => {
        setProgressbarValue(offlineCtx.currentTime / duration);
        if (rendering) {
            updateSpinner();
        } else {
            setProgressbarValue(null);
        }
    });
    updateSpinner();

    const renderedBuffer = await offlineCtx.startRendering();

    const blob = new Blob([audioBufferToWav(renderedBuffer)], {
        type: "application/octet-stream"
    });

    rendering = false;
    toggleSpinner(false);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "exportedsong.wav";
    a.click();
    window.URL.revokeObjectURL(url);
}