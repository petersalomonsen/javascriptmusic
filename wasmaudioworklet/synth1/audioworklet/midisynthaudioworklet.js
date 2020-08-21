import { visualizeSong, setGetCurrentTimeFunction, setPaused } from '../../visualizer/midieventlistvisualizer.js';
import { WorkerMessageHandler } from '../../common/workermessagehandler.js';

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

export async function createAudioWorklet(context, wasm_synth_bytes, sequencedata, toggleSongPlay) {
    await context.audioWorklet.addModule('./synth1/audioworklet/midisynthaudioworkletprocessor.js');
    audioworkletnode = new AudioWorkletNode(context, 'asc-midisynth-audio-worklet-processor', {
        outputChannelCount: [2]
    });
    audioworkletnode.port.start();
    audioworkletnode.port.postMessage({
        samplerate: context.sampleRate, 
        wasm: wasm_synth_bytes, 
        sequencedata: sequencedata,
        toggleSongPlay: toggleSongPlay
    });
    audioworkletnode.connect(context.destination);
    
    workerMessageHandler = new WorkerMessageHandler(audioworkletnode.port);

    setGetCurrentTimeFunction(getCurrentTime);

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
