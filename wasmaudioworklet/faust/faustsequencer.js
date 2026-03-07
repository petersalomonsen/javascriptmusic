import { visualizeSong, setGetCurrentTimeFunction, setPaused } from '../visualizer/midieventlistvisualizer.js';
import { attachSeek } from '../app.js';
import { bpm } from '../midisequencer/pattern.js';

const SEQ_MSG_LOOP = -1;

let schedulerInterval;
let currentFaustNode;
let currentEventlist;
let currentAudioContext;
let sequenceIndex = 0;
let startTime = 0;

function getCurrentTime() {
    return Promise.resolve((currentAudioContext.currentTime - startTime) * 1000);
}

function schedule() {
    const currentTimeMs = (currentAudioContext.currentTime - startTime) * 1000;

    while (sequenceIndex < currentEventlist.length &&
        currentEventlist[sequenceIndex].time <= currentTimeMs) {
        const evt = currentEventlist[sequenceIndex];
        const msg = evt.message;

        if (msg.length === 1 && msg[0] === SEQ_MSG_LOOP) {
            sequenceIndex = 0;
            startTime = currentAudioContext.currentTime;
            break;
        }

        if (msg[0] >= 0) {
            currentFaustNode.midiMessage(msg);
        }
        sequenceIndex++;
    }
}

export function stopFaustSequencer() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
    }
}

export function startFaustSequencer(faustNode, eventlist, audioContext) {
    stopFaustSequencer();
    currentFaustNode = faustNode;
    currentEventlist = eventlist;
    currentAudioContext = audioContext;
    sequenceIndex = 0;
    startTime = audioContext.currentTime;

    schedulerInterval = setInterval(schedule, 10);

    setupVisualization();
}

export function pauseFaustSequencer() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
    }
    setPaused(true);
}

export function resumeFaustSequencer() {
    if (!schedulerInterval && currentEventlist && currentAudioContext) {
        schedulerInterval = setInterval(schedule, 10);
        setPaused(false);
    }
}

export function updateFaustNode(faustNode) {
    currentFaustNode = faustNode;
}

export function updateFaustSequence(eventlist) {
    const currentTimeMs = currentAudioContext ? (currentAudioContext.currentTime - startTime) * 1000 : 0;
    currentEventlist = eventlist;
    sequenceIndex = currentEventlist.findIndex(evt => evt.time > currentTimeMs);
    if (sequenceIndex === -1) sequenceIndex = 0;

    setupVisualization();
}

function setupVisualization() {
    if (currentEventlist && currentEventlist.length > 0) {
        const lastEventTime = currentEventlist[currentEventlist.length - 1].time;
        setGetCurrentTimeFunction(getCurrentTime);
        attachSeek((time) => {
            startTime = currentAudioContext.currentTime - time / 1000;
            sequenceIndex = currentEventlist.findIndex(evt => evt.time >= time) || 0;
        }, getCurrentTime, lastEventTime, bpm);
    }
    visualizeSong(currentEventlist);
    setPaused(false);
}

export function faustOnMidi(msg) {
    if (currentFaustNode) {
        currentFaustNode.midiMessage(msg);
    }
}
