import { visualizeSong, setGetCurrentTimeFunction, setPaused } from '../../visualizer/midieventlistvisualizer.js';
import { WorkerMessageHandler } from '../../common/workermessagehandler.js';
import { toggleSpinner } from '../../common/ui/progress-spinner.js';
import { setProgressbarValue } from '../../common/ui/progress-bar.js';
import { attachSeek, formatTime } from '../../app.js';
import { audioBufferToWav } from '../../common/audiobuffertowav.js';
import { connectLevelAnalyser, skipClipsWithinCentiSeconds } from '../../analyser/levelanalysernode.js';
import { modal } from '../../common/ui/modal.js';
import { getAudioWorkletModuleUrl } from '../../common/audioworkletmodules.js';
import { AssemblyScriptMidiSynthAudioWorkletProcessorModule } from './midisynthaudioworkletprocessor.js';
import { AudioWorkletProcessorSequencerModule } from '../../midisequencer/audioworkletprocessorsequencer.js';
import { addedAudio } from '../../midisequencer/songcompiler.js';
import { bpm } from '../../midisequencer/pattern.js';

export let audioworkletnode;

let workerMessageHandler;
// Tracks the bpm of the song currently producing audio, kept in sync
// with the worklet's `playingBpm` so the beat indicator stays correct
// after song switches. Initialized to the imported `bpm` binding (the
// first song's BPM) and updated whenever the worklet announces a swap
// (or whenever an N=0 immediate replace bakes a new bpm into the live
// instance).
let activePlayingBpm = 0;
function getActivePlayingBpm() {
    return activePlayingBpm || bpm;
}

// Handlers the host can register to react to broadcast wait/resume events
// emitted by the worklet. Registered before startaudio runs, so the port
// listener attached inside connectAudioWorklet can dispatch immediately
// (otherwise the broadcastWaiting message at song start can fire before
// the host has a chance to attach its own listener).
let broadcastWaitingHandler = null;
let broadcastResumedHandler = null;
export function setBroadcastUiHandlers(onWaiting, onResumed) {
    broadcastWaitingHandler = onWaiting;
    broadcastResumedHandler = onResumed;
}

export function onmidi(data) {
    audioworkletnode.port.postMessage({
        midishortmsg: data
    });
}

export async function updateSong(sequencedata, toggleSongPlay, quantizeN = 0, bpm = 0) {
    audioworkletnode.port.postMessage({
        sequencedata: sequencedata,
        toggleSongPlay: toggleSongPlay,
        quantizeN: quantizeN,
        bpm: bpm,
    });
    setPaused(!toggleSongPlay);
    visualizeSong(sequencedata);
}

export async function updateSynth(synthwasm, addedAudio, quantizeN = 0, bpm = 0, sequencedata, toggleSongPlay) {
    // quantizeN === 0 keeps the legacy suspend/instantiate/resume cycle —
    // a brief audible pause but the wasm is guaranteed live before the
    // function returns. quantizeN > 0 stashes the new wasm in the
    // worklet's pending slot without suspending; the worklet swaps it
    // in atomically at the next beat where `currentBeat % quantizeN == 0`.
    //
    // When N>0 we also accept the new sequencedata + toggleSongPlay in the
    // SAME message, so all three pending fields land atomically. Splitting
    // them across two messages opens a race: the wasm-only ack takes
    // 50–300 ms, during which a beat boundary can fire a swap that only
    // includes the new wasm but not the new sequencedata, leaving the
    // listener hearing the old song's notes through the new synth — which
    // looks like "the song didn't replace, I had to save again".
    if (quantizeN === 0) {
        audioworkletnode.context.suspend();
        await workerMessageHandler.callAndGetResult({
            wasm: synthwasm,
            audio: await Promise.all(addedAudio),
            bpm: bpm,
        }, (msg) => msg.wasmloaded);
        audioworkletnode.context.resume();
        // N=0 path is immediate — the worklet's playingBpm has just been
        // updated to the new song's bpm. Mirror that on the main thread so
        // the beat indicator switches with it.
        if (bpm) activePlayingBpm = bpm;
    } else {
        // Send raw bytes; the worklet does `await WebAssembly.instantiate`
        // inside its onmessage handler. We considered pre-compiling to a
        // Module on the main thread and transferring it, but Module
        // structured-clone over AudioWorkletNode.port doesn't reliably
        // work across browsers — Chromium silently drops every Module
        // message. The trade-off is a short audible glitch on save when
        // the in-worklet wasm compile blocks the audio thread.
        // See issue #129 for the diagnostic write-up and possible fixes.
        const msg = {
            pendingWasmBytes: synthwasm,
            audio: await Promise.all(addedAudio),
            quantizeN: quantizeN,
            bpm: bpm,
        };
        if (sequencedata !== undefined) {
            msg.pendingSequencedata = sequencedata;
            msg.pendingToggleSongPlay = toggleSongPlay;
        }
        await workerMessageHandler.callAndGetResult(msg, (m) => m.pendingWasmReady);
        if (sequencedata !== undefined) {
            setPaused(!toggleSongPlay);
            visualizeSong(sequencedata);
        }
    }
}

async function connectAudioWorklet(context, wasm_synth_bytes, sequencedata, toggleSongPlay) {
    if (!(context instanceof (OfflineAudioContext)) && context.suspend) {
        context.suspend();
    }
    await context.audioWorklet.addModule(getAudioWorkletModuleUrl(AssemblyScriptMidiSynthAudioWorkletProcessorModule));
    const awn = new AudioWorkletNode(context, 'asc-midisynth-audio-worklet-processor', {
        outputChannelCount: [2]
    });
    awn.port.start();

    // BroadcastChannel coordinates broadcastSend/broadcastWait events
    // across windows so e.g. one song can hold on a `waitForSignal`
    // until another window emits the matching name. Skip in offline
    // rendering — no other window is listening, and offline render uses
    // a fresh worklet per export.
    // The port listener for *all* broadcast traffic (channel-out, UI-in)
    // is attached here, before wasm is sent — by the time the worklet
    // hits its first wait it may already be the very first onprocess()
    // tick, so a listener attached later (e.g. after createAudioWorklet
    // returns) would miss the message.
    if (!(context instanceof (OfflineAudioContext))) {
        const channel = new BroadcastChannel('concert-sync');
        channel.onmessage = (e) => {
            if (e.data && typeof e.data.name === 'string') {
                awn.port.postMessage({ broadcastReceived: e.data.name });
            }
        };
        awn.port.addEventListener('message', (e) => {
            if (!e.data) return;
            if (typeof e.data.broadcastSend === 'string') {
                channel.postMessage({ name: e.data.broadcastSend });
            } else if (typeof e.data.broadcastWaiting === 'string' && broadcastWaitingHandler) {
                broadcastWaitingHandler(e.data.broadcastWaiting);
            } else if (typeof e.data.broadcastResumed === 'string' && broadcastResumedHandler) {
                broadcastResumedHandler(e.data.broadcastResumed);
            }
        });
    }

    const wmh = new WorkerMessageHandler(awn.port);

    toggleSpinner(true);
    await wmh.callAndGetResult({
        samplerate: context.sampleRate,
        wasm: wasm_synth_bytes,
        sequencedata: sequencedata,
        toggleSongPlay: toggleSongPlay,
        audio: await Promise.all(addedAudio),
        bpm: bpm,
    }, (msg) => msg.wasmloaded);
    activePlayingBpm = bpm;

    // Update activePlayingBpm whenever the worklet reports a quantized
    // swap, so the beat indicator follows the audible tempo after a
    // song-and-tempo switch. Adding via addEventListener doesn't conflict
    // with the WorkerMessageHandler's onmessage handler.
    awn.port.addEventListener('message', (e) => {
        if (e.data && e.data.quantizedSwapApplied && e.data.bpm) {
            activePlayingBpm = e.data.bpm;
        }
    });

    toggleSpinner(false);

    if (!(context instanceof (OfflineAudioContext))) {
        setGetCurrentTimeFunction(getCurrentTime);
        attachSeek((time) => awn.port.postMessage({ seek: time }),
            getCurrentTime,
            sequencedata.length ? sequencedata[sequencedata.length - 1].time : 0,
            getActivePlayingBpm);
    }
    awn.connect(context.destination);
    if (!(context instanceof (OfflineAudioContext))) {
        context.resume();
    }
    return { audioworkletnode: awn, workerMessageHandler: wmh };
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
    return (await workerMessageHandler.callAndGetResult({ recorded: true },
        (msgdata) => msgdata.recorded ? true : false))
        .recorded;
}

export async function getCurrentTime() {
    const currentTime = (await workerMessageHandler.callAndGetResult({ currentTime: true },
        (msgdata) => msgdata.currentTime !== undefined ? true : false))
        .currentTime;
    return currentTime;
}

export async function exportToWav(eventlist, wasm_synth_bytes, renderSampleRate = 44100) {
    toggleSpinner(true);
    const duration = eventlist[eventlist.length - 1].time / 1000;
    const offlineCtx = new OfflineAudioContext(2,
        duration * renderSampleRate,
        renderSampleRate);

    await offlineCtx.audioWorklet.addModule(getAudioWorkletModuleUrl(AudioWorkletProcessorSequencerModule));
    const audioworkletcontainer = await connectAudioWorklet(offlineCtx, wasm_synth_bytes, eventlist, true);
    const statfunc = await connectLevelAnalyser(audioworkletcontainer.audioworkletnode);

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
    const exportstats = await statfunc();

    const clips = skipClipsWithinCentiSeconds(exportstats.clips);
    if (clips.length > 0) {
        rendering = false;

        toggleSpinner(false);

        const maxClipsToShow = 1000;
        if (!await modal(`
            <h3>Warning: clipping in exported audio</h3>
            <p>${clips.length} clips ${clips.length > maxClipsToShow ? `, showing the first ${maxClipsToShow}` : ''}</p>
            <div style="height: 80px; overflow: auto">
                <table>
                    ${clips.slice(0, 100).map(clip => `<tr>
                        <td>${formatTime(clip.time * 1000)}</td>
                        <td>${clip.channel ? 'right' : 'left'}: ${clip.value}</td>
                    </tr>`).join('')
            }
                </table>
            </div>
            <button onclick="getRootNode().result(null)">Cancel</button>
            <button onclick="getRootNode().result(true)">
                Save exported file
            </button>
        `)) {
            console.log('export wav cancelled');
            return;
        }
    }
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