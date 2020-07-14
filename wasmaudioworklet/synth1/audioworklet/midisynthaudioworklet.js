export let audioworkletnode;

let recordedDataPromiseResolve;
let currentTimePromiseResolve;

export function onmidi(data) {
    audioworkletnode.port.postMessage({ 
        midishortmsg: data
    });
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
    
    audioworkletnode.port.onmessage = (msg) => {
        if (msg.data.recorded) {
            recordedDataPromiseResolve(msg.data.recorded);
        }
        if (msg.data.currentTime) {
            currentTimePromiseResolve(msg.data.currentTime)
        }
    };
    return audioworkletnode;
}

export async function getRecordedData() {
    audioworkletnode.port.postMessage({recorded: true});
    return await new Promise(resolve => recordedDataPromiseResolve = resolve);
}

export async function getCurrentTime() {
    audioworkletnode.port.postMessage({currentTime: true});
    return await new Promise(resolve => currentTimePromiseResolve = resolve);
}