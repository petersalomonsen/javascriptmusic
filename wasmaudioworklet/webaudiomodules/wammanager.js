import { loadScript } from '../common/scriptloader.js';
import { toggleSpinner, setProgressbarValue } from '../app.js';
import { audioBufferToWav } from '../common/audiobuffertowav.js';

let wamloaded = false;
let wamstarted = false;
let previousSynthSource;
export let wamsynth;

let wamPaused;
let lastPostedSong = [];
let samplerate;

export async function loadWAM() {
    if (wamloaded) {
        return wamloaded;
    }
    wamloaded = new Promise(async resolve => {
        await loadScript("https://unpkg.com/wasm-yoshimi@0.0.1/libs/wam-controller.js");
        await loadScript("https://unpkg.com/wasm-yoshimi@0.0.1/libs/gunzip.js")
        await loadScript("webaudiomodules/yoshimi.js");
        resolve(true);
    });
    return wamloaded;
}

export async function startWAM(actx) {
    wamPaused = false;
    if (!wamstarted) {
        toggleSpinner(true);
        wamstarted = true;
        console.log('starting WAM synth');
        await loadWAM();
        await WAM.YOSHIMI.importScripts(actx);
        wamsynth = new WAM.YOSHIMI(actx);
        wamsynth.connect(actx.destination);
        samplerate = actx.sampleRate;
        toggleSpinner(false);
        console.log('WAM synth started');
    }
}

export async function postSong(eventlist, synthsource) {
    lastPostedSong = eventlist;

    if (wamPaused) {
        return;
    }
    if (synthsource !== previousSynthSource) {
        toggleSpinner(true);
        previousSynthSource = synthsource;
        await wamsynth.postSynthSource(synthsource);
        toggleSpinner(false);
    }

    wamsynth.sendMessage("set", "seq", eventlist);    
}

export function stopWAMSong() {
    wamsynth.sendMessage("set", "seq", []);
    for (let channel = 0; channel < 16; channel++) {
        wamsynth.onMidi([0xb0 + channel, 123, 0]);
    }
}

export function pauseWAMSong() {
    if (wamsynth) {
        stopWAMSong();
        wamPaused = true;
    }
}

export function resumeWAMSong() {
    wamsynth.sendMessage("set", "seq", lastPostedSong);
}

export async function getRecordedData() {
    wamsynth.sendMessage("get", "recorded");
    const recorded = (await wamsynth.waitForMessage()).recorded;
    const eventlist = Object.keys(recorded)
                .sort((a, b) => a - b)
                .reduce((prev, frame) =>
        prev.concat(recorded[frame].map(event =>
            [frame / samplerate].concat(event)))
        , []);
    
    return eventlist;
}

export function onMidi(msg) {
    if (wamsynth) {
        wamsynth.onMidi(msg);
    }
}

export async function exportWAMAudio(eventlist, synthsource) {
    toggleSpinner(true);
    const renderSampleRate = 44100;
    const duration = eventlist[eventlist.length-1].time / 1000;
    const offlineCtx = new OfflineAudioContext(2,
            duration * renderSampleRate,
            renderSampleRate);
    await loadWAM();
    await WAM.YOSHIMI.importScripts(offlineCtx);
    const offlineWAMSynth = new WAM.YOSHIMI(offlineCtx);
    
    await offlineWAMSynth.postSynthSource(synthsource);
    console.log('sending sequence');
    offlineWAMSynth.sendMessage("set", "seq", eventlist);    

    offlineWAMSynth.connect(offlineCtx.destination);

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