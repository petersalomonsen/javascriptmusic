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
// The GainNode currently driving destination. Each save with quantize > 0
// creates a fresh AudioWorkletNode with its own GainNode; sample-accurate
// crossfade between gains lets the new node take over without an
// in-worklet wasm compile blocking the audio thread.
let activeGainNode;

// Tracks the bpm of the song currently producing audio, kept in sync
// with the worklet's `playingBpm` so the beat indicator stays correct
// after song switches.
let activePlayingBpm = 0;
function getActivePlayingBpm() {
    return activePlayingBpm || bpm;
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
    });
    if (bpm) activePlayingBpm = bpm;
    setPaused(!toggleSongPlay);
    visualizeSong(sequencedata);
}

export async function updateSynth(synthwasm, addedAudioInput, quantizeN = 0, songBpm = 0, sequencedata, toggleSongPlay) {
    if (quantizeN === 0) {
        // Legacy immediate replace: suspend, reload wasm into the existing
        // node, resume. Brief audible suspend/resume click but the wasm is
        // guaranteed live before the function returns.
        audioworkletnode.context.suspend();
        await workerMessageHandler.callAndGetResult({
            wasm: synthwasm,
            audio: await Promise.all(addedAudioInput),
            bpm: songBpm,
        }, (msg) => msg.wasmloaded);
        audioworkletnode.context.resume();
        if (songBpm) activePlayingBpm = songBpm;
        return;
    }

    // Quantized save with synth change. Compile on the main thread (V8's
    // off-thread compile worker pool — doesn't block anything) and create
    // a brand-new AudioWorkletNode with the Module passed in via
    // processorOptions. Module structured-clones via processorOptions even
    // on Chrome (chromium issue 40855462 only breaks port postMessage), so
    // the new processor's constructor can synchronously instantiate the
    // Module — microseconds, no audio glitch — and wait silently until the
    // quantize-aligned beat. Then a sample-accurate gain crossfade hands
    // off audio output from the old node to the new one.
    const ctx = audioworkletnode.context;
    const playingBpm = getActivePlayingBpm();
    const swapAtCtxTime = computeNextQuantizeBoundary(ctx.currentTime, playingBpm, quantizeN);

    const wasmModule = await WebAssembly.compile(synthwasm);
    const audio = await Promise.all(addedAudioInput);

    const newNode = new AudioWorkletNode(ctx, 'asc-midisynth-audio-worklet-processor', {
        outputChannelCount: [2],
        processorOptions: {
            wasmModule,
            audio,
            sequencedata,
            toggleSongPlay,
            bpm: songBpm,
            swapAtCtxTime,
        },
    });
    newNode.port.start();

    const newGain = ctx.createGain();
    newGain.gain.value = 0;
    newNode.connect(newGain).connect(ctx.destination);

    // Wire the new node's bpm-tracking + tracing forwarding so the beat
    // indicator and the test continue to receive events after the swap.
    attachWorkletForwarders(newNode);

    // Sample-accurate handoff at swapAtCtxTime.
    const oldGain = activeGainNode;
    const oldNode = audioworkletnode;
    if (oldGain) {
        oldGain.gain.setValueAtTime(oldGain.gain.value, swapAtCtxTime);
        oldGain.gain.setValueAtTime(0, swapAtCtxTime);
    }
    newGain.gain.setValueAtTime(0, swapAtCtxTime);
    newGain.gain.setValueAtTime(1, swapAtCtxTime);

    // Tell the old node to freeze its sequencer at the swap moment so
    // it doesn't keep firing trace noteons (or wasm voice updates) while
    // we wait for cleanup. The audio is silenced by the gain crossfade,
    // but the JS-level event stream needs to stop too.
    if (oldNode && oldNode !== newNode) {
        try { oldNode.port.postMessage({ stopAtCtxTime: swapAtCtxTime }); } catch (e) {}
    }

    // Dispose the old node a little after the swap so the audio graph
    // finishes processing the crossfade quantum first. 200 ms is plenty.
    const cleanupDelayMs = Math.max(0, (swapAtCtxTime - ctx.currentTime) * 1000) + 200;
    setTimeout(() => {
        try {
            oldNode.port.postMessage({ terminate: true });
        } catch (e) { /* port may already be closed */ }
        try { oldNode.disconnect(); } catch (e) {}
        if (oldGain) try { oldGain.disconnect(); } catch (e) {}
    }, cleanupDelayMs);

    audioworkletnode = newNode;
    workerMessageHandler = new WorkerMessageHandler(newNode.port);
    activeGainNode = newGain;
    if (songBpm) activePlayingBpm = songBpm;
    if (sequencedata !== undefined) {
        setPaused(!toggleSongPlay);
        visualizeSong(sequencedata);
    }
}

// Returns the next ctx.currentTime value that lines up with a beat
// divisible by quantizeN at the given bpm. Uses a `currentTime - epoch`
// reference so we don't drift across saves: the epoch is captured at
// startaudio (`audioStartCtxTime`) so beat 0 == audioStartCtxTime.
let audioStartCtxTime = 0;
function computeNextQuantizeBoundary(nowCtxTime, beatBpm, quantizeN) {
    if (!beatBpm || beatBpm <= 0) beatBpm = 110;
    const elapsedSec = nowCtxTime - audioStartCtxTime;
    const elapsedBeats = elapsedSec * beatBpm / 60;
    // Add a tiny epsilon so saving exactly on a boundary still waits for
    // the next one (otherwise the swap would fire ~immediately).
    const nextAlignedBeat = Math.ceil((elapsedBeats + 0.001) / quantizeN) * quantizeN;
    return audioStartCtxTime + nextAlignedBeat * 60 / beatBpm;
}

function attachWorkletForwarders(node) {
    // Each save creates a new AudioWorkletNode (so its constructor can
    // receive a pre-compiled wasm Module via processorOptions —
    // chromium#40855462 prevents Modules from arriving via port.postMessage).
    // That means subscribers on a specific node's port miss events fired
    // by later nodes. Re-broadcast through a stable target (`window`) so
    // listeners (beat indicator, tests) don't have to rebind on every save.
    node.port.addEventListener('message', (e) => {
        if (!e.data) return;
        if (e.data.quantizedSwapApplied) {
            if (e.data.bpm) activePlayingBpm = e.data.bpm;
            // Reset the beat-0 reference to this swap's audio-context time
            // so the next quantized save measures its own bpm-elapsed beats
            // from when *this* song started, not from the original audio
            // start. Otherwise, after a tempo change, the elapsed-beats
            // count grows at the new bpm but is anchored to the wrong
            // moment, and the next quantize boundary lands too late.
            if (typeof e.data.ct === 'number') {
                audioStartCtxTime = e.data.ct / 1000;
            }
        }
        if (typeof window !== 'undefined') {
            if (e.data.quantizedSwapApplied) {
                window.dispatchEvent(new CustomEvent('worklet:swap', { detail: e.data }));
            }
            if (e.data._trace_noteon) {
                window.dispatchEvent(new CustomEvent('worklet:noteon', { detail: e.data._trace_noteon }));
            }
        }
    });
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
    audioStartCtxTime = context.currentTime;

    attachWorkletForwarders(awn);

    toggleSpinner(false);

    if (!(context instanceof (OfflineAudioContext))) {
        setGetCurrentTimeFunction(getCurrentTime);
        attachSeek((time) => audioworkletnode.port.postMessage({ seek: time }),
            getCurrentTime,
            sequencedata.length ? sequencedata[sequencedata.length - 1].time : 0,
            getActivePlayingBpm);
    }

    // Insert a per-node GainNode so we can swap it out by crossfading on a
    // future quantized save. Keep gain at 1 for the playing path.
    const gain = context.createGain();
    gain.gain.value = 1;
    awn.connect(gain).connect(context.destination);
    if (!(context instanceof (OfflineAudioContext))) {
        context.resume();
    }
    return { audioworkletnode: awn, workerMessageHandler: wmh, gainNode: gain };
}

export async function createAudioWorklet(context, wasm_synth_bytes, sequencedata, toggleSongPlay) {
    const audioWorkletObjects = await connectAudioWorklet(context, wasm_synth_bytes, sequencedata, toggleSongPlay);

    audioworkletnode = audioWorkletObjects.audioworkletnode;
    workerMessageHandler = audioWorkletObjects.workerMessageHandler;
    activeGainNode = audioWorkletObjects.gainNode;

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
