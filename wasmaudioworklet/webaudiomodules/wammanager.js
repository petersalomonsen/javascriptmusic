import { loadScript } from '../common/scriptloader.js';

let wamstarted = false;
let previousSynthSource;
export let wamsynth;

let wamPaused;
let lastPostedSong = [];
let samplerate;

export async function startWAM(actx) {
    wamPaused = false;
    if (!wamstarted) {    
        wamstarted = true;
        console.log('starting WAM synth');
        await loadScript("https://unpkg.com/wasm-yoshimi@0.0.1/libs/wam-controller.js");
        await loadScript("https://unpkg.com/wasm-yoshimi@0.0.1/libs/gunzip.js")
        await loadScript("webaudiomodules/yoshimi.js");
        await WAM.YOSHIMI.importScripts(actx);
        wamsynth = new WAM.YOSHIMI(actx);
        wamsynth.connect(actx.destination);
        samplerate = actx.sampleRate;

        console.log('WAM synth started');
    }
}

export async function postSong(eventlist, synthsource) {
    lastPostedSong = eventlist;

    if (wamPaused) {
        return;
    }
    if (synthsource !== previousSynthSource) {
        previousSynthSource = synthsource;
        await wamsynth.postSynthSource(synthsource);
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