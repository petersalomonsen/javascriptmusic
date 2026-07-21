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
import { setSynthState } from '../../visualizer/defaultvisualizer.js';

export let audioworkletnode;

let workerMessageHandler;

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

// Stop path: the processor was told to terminate (it closes its message port),
// so the node and message handler here are dead. They MUST be released —
// posting to the closed port can never get a reply, and updateSynth awaiting
// `wasmloaded` on it would hang forever (deadlocking e.g. the studio-agent's
// serial tool queue behind a save that never resolves).
export function releaseAudioWorklet() {
    audioworkletnode = null;
    workerMessageHandler = null;
}

export async function updateSong(sequencedata, toggleSongPlay) {
    if (!audioworkletnode) return; // audio not running — nothing to update live
    audioworkletnode.port.postMessage({
        sequencedata: sequencedata,
        toggleSongPlay: toggleSongPlay
    });
    setPaused(!toggleSongPlay);
    visualizeSong(sequencedata);
}

export async function updateSynth(synthwasm, addedAudio) {
    // Audio not running: nothing to swap live — the next startaudio picks up
    // window.WASM_SYNTH_BYTES anyway.
    if (!audioworkletnode) return;
    audioworkletnode.context.suspend();
    // Bounded wait: if the worklet can't reply (e.g. it terminated between
    // the check above and the post), fail the save instead of hanging it.
    // The timer MUST be cleared on the normal path — a leftover timeout
    // firing later rejects the losing race promise unhandled, which wedges
    // test runners (Firefox wtr) and pollutes the console.
    let timer = null;
    try {
        await Promise.race([
            workerMessageHandler.callAndGetResult({
                wasm: synthwasm,
                audio: await Promise.all(addedAudio)
            }, (msg) => msg.wasmloaded),
            new Promise((_, reject) => {
                timer = setTimeout(() =>
                    reject(new Error('updateSynth: no wasmloaded reply from the audio worklet within 20s')), 20000);
            })
        ]);
    } finally {
        if (timer) clearTimeout(timer);
        if (audioworkletnode) audioworkletnode.context.resume();
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
            if (e.data.synthstate) {
                // Generic f32 synth state relayed from the wasm → shader uniform.
                setSynthState(e.data.synthstate);
                return;
            }
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
        audio: await Promise.all(addedAudio)
    }, (msg) => msg.wasmloaded);
    toggleSpinner(false);

    if (!(context instanceof (OfflineAudioContext))) {
        setGetCurrentTimeFunction(getCurrentTime);
        attachSeek((time) => awn.port.postMessage({ seek: time }),
            getCurrentTime,
            sequencedata.length ? sequencedata[sequencedata.length - 1].time : 0,
            bpm);
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
    if (!workerMessageHandler) return [];
    return (await workerMessageHandler.callAndGetResult({ recorded: true },
        (msgdata) => msgdata.recorded ? true : false))
        .recorded;
}

export async function getCurrentTime() {
    // A current-time poll may still tick after stopaudio released the worklet.
    // null is the visualizer's "no clock" protocol: it clears the display and
    // stops polling. (Returning a number here replays/holds the STALE song's
    // notes in the visualizer — reporting 0 rewound it to the top and re-lit
    // old notes in the target note states.)
    if (!workerMessageHandler) return null;
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