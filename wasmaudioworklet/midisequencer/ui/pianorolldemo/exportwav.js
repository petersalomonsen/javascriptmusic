import { WorkerMessageHandler } from '../../../common/workermessagehandler.js';
import { audioBufferToWav } from '../../../common/audiobuffertowav.js';
import { toggleSpinner } from '../../../common/ui/progress-spinner.js';
import { setProgressbarValue } from '../../../common/ui/progress-bar.js';

export async function exportToWav(eventlist, wasm_synth_bytes) {
    toggleSpinner(true);
    const renderSampleRate = 44100;
    const duration = eventlist[eventlist.length - 1].time / 1000;
    const offlineCtx = new OfflineAudioContext(2,
        duration * renderSampleRate,
        renderSampleRate);

    await offlineCtx.audioWorklet.addModule('./audioworkletprocessor.js');
    const audioWorkletNode = new AudioWorkletNode(offlineCtx, 'asc-midisynth-audio-worklet-processor', {
        outputChannelCount: [2]
    });
    audioWorkletNode.port.start();
    console.log('audioworklet node started');
    const workerMsgHandler = new WorkerMessageHandler(audioWorkletNode.port);
    await workerMsgHandler.callAndGetResult({
            samplerate: offlineCtx.sampleRate,
            wasm: wasm_synth_bytes,
            sequencedata: eventlist,
            toggleSongPlay: true
        }, (msg) => msg.wasmloaded);
    console.log('audioworklet node loaded');
    audioWorkletNode.connect(offlineCtx.destination);

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
    console.log('finished rendering');

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
