import { visualizeNoteOn, clearVisualization } from './defaultvisualizer.js';
import { SEQ_MSG_LOOP } from '../midisequencer/sequenceconstants.js';
let visualizeEventIndex = 0;

let lastPostedSong = [];
let paused = false;
let getCurrentTimeFunction = function() {};

let visualizeSongTimeout = null;

export function setPaused(newPauseStatus) {
    paused = newPauseStatus;
    if (!paused) {
        triggerVisualizationLoop();
    }
}

export function setGetCurrentTimeFunction(func) {
    getCurrentTimeFunction = func;
}


export async function visualizeSong(neweventlist) {
    if (neweventlist !== undefined) {
        visualizeEventIndex = 0;
        
        lastPostedSong = neweventlist;
    }
    triggerVisualizationLoop();
}

export function isVisualizationLoopActive() {
    return visualizeSongTimeout !== null;
}

function triggerVisualizationLoop(timeout = 0) {
    if (!visualizeSongTimeout) {
        if (timeout < 0) {
            timeout = 0;
        }
        visualizeSongTimeout = setTimeout(visualizeSongCallback, timeout);
    }
}

async function visualizeSongCallback() {
    visualizeSongTimeout = null;
    if (paused || lastPostedSong.length === 0) {
        clearVisualization();
        return;
    }
    const eventlist = lastPostedSong;
    const currentTime = await getCurrentTimeFunction();

    if (currentTime === null) {
        clearVisualization();
        return;
    }

    if (currentTime < eventlist[visualizeEventIndex].time) {
        visualizeEventIndex = 0;
    }

    while (
            visualizeEventIndex < eventlist.length &&
            eventlist[visualizeEventIndex].time <= currentTime
        ) {
        const msg = eventlist[visualizeEventIndex++].message;
        const msgType = (msg[0] & 0xf0);
        if (msgType === 0x90 || msgType === 0x80) {
            visualizeNoteOn(msg[1], msg[2]);
        } else if (msg[0] === SEQ_MSG_LOOP) {
            visualizeEventIndex = 0;
            break;
        }
    }

    if (visualizeEventIndex < eventlist.length) {        
        triggerVisualizationLoop(
            Math.round(eventlist[visualizeEventIndex].time - currentTime)
        );
    }
}
