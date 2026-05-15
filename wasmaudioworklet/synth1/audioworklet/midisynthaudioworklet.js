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

// TEMPORARY: filled in by the audio worklet's onmessage-entry ping; used
// to measure clone+delivery time for glitch diagnosis.
let _onMessageEnteredTime = null;

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
        // work across browsers (Chromium silently dropped the whole
        // message in our testing). One uniform path is simpler than
        // branching on engine capability.
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
        // TEMPORARY: log around postMessage so we can correlate audio
        // thread gap timing with main-thread send/ack timing.
        const tBeforePost = performance.now();
        const ctBeforePost = audioworkletnode.context.currentTime;
        const seqLen = sequencedata ? sequencedata.length : 0;
        // Capture the moment the worklet's onmessage handler enters; the
        // worklet posts an `_onMessageEntered: true` ping for this. The
        // wall-clock delta from `tBeforePost` to that ping = structured-
        // clone deserialization on the audio thread.
        _onMessageEnteredTime = null;
        console.log(`[updateSynth] posting bundled msg: wasmBytes=${synthwasm.byteLength} seqEvents=${seqLen} ` +
            `ctx.currentTime=${ctBeforePost.toFixed(4)}s perf=${tBeforePost.toFixed(0)}ms`);
        await workerMessageHandler.callAndGetResult(msg, (m) => m.pendingWasmReady);
        const tAfterAck = performance.now();
        const cloneMs = _onMessageEnteredTime !== null
            ? (_onMessageEnteredTime - tBeforePost).toFixed(0)
            : '??';
        console.log(`[updateSynth] ack received: ` +
            `ctx.currentTime=${audioworkletnode.context.currentTime.toFixed(4)}s ` +
            `perf=${tAfterAck.toFixed(0)}ms ` +
            `wallElapsed=${(tAfterAck - tBeforePost).toFixed(0)}ms ` +
            `(of which clone+delivery=${cloneMs}ms)`);
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
        if (!e.data) return;
        if (e.data.quantizedSwapApplied && e.data.bpm) {
            activePlayingBpm = e.data.bpm;
        }
        // TEMPORARY: log per-save swap-receive timing for glitch diagnosis.
        if (e.data._swapTiming) {
            const t = e.data._swapTiming;
            console.log(`[swap-timing] wasmBytes=${t.wasmBytes} audio=${t.audioItems} ` +
                `instantiate=${t.instantiateMs}ms loadAudio=${t.loadAudioMs}ms ` +
                `stash=${t.stashMs}ms total=${t.totalMs}ms ` +
                `process()-during-instantiate: expected=${t.expectedProcessCallsDuringInstantiate} ` +
                `actual=${t.actualProcessCallsDuringInstantiate} ` +
                `missed=${t.missedDuringInstantiate}`);
        }
        // TEMPORARY: capture the moment the audio thread entered onmessage.
        if (e.data._onMessageEntered) {
            _onMessageEnteredTime = performance.now();
        }
        // TEMPORARY: continuous render-quantum gap monitor.
        if (e.data._processGap) {
            const g = e.data._processGap;
            console.log(`[process-gap] gap=${g.gapMs}ms (expected ~${g.expectedMs}ms) ` +
                `missedQuanta=${g.missedQuanta} atCtx.currentTime=${g.atCurrentTime}s`);
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