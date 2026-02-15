import { visualizeSong, setGetCurrentTimeFunction, setPaused } from '../visualizer/midieventlistvisualizer.js';
import { attachSeek } from '../app.js';
import { bpm } from '../midisequencer/pattern.js';

const SEQ_MSG_LOOP = -1;

let schedulerInterval;
let currentFaustNode;

export function stopFaustSequencer() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
    }
}

export function startFaustSequencer(faustNode, eventlist, audioContext) {
    stopFaustSequencer();
    currentFaustNode = faustNode;

    let sequenceIndex = 0;
    let startTime = audioContext.currentTime;

    function getCurrentTime() {
        return Promise.resolve((audioContext.currentTime - startTime) * 1000);
    }

    function schedule() {
        const currentTimeMs = (audioContext.currentTime - startTime) * 1000;

        while (sequenceIndex < eventlist.length &&
            eventlist[sequenceIndex].time <= currentTimeMs) {
            const evt = eventlist[sequenceIndex];
            const msg = evt.message;

            if (msg.length === 1 && msg[0] === SEQ_MSG_LOOP) {
                sequenceIndex = 0;
                startTime = audioContext.currentTime;
                break;
            }

            if (msg[0] >= 0) {
                faustNode.midiMessage(msg);
            }
            sequenceIndex++;
        }
    }

    schedulerInterval = setInterval(schedule, 10);

    if (eventlist.length > 0) {
        const lastEventTime = eventlist[eventlist.length - 1].time;
        setGetCurrentTimeFunction(getCurrentTime);
        attachSeek((time) => {
            const newTimeSeconds = time / 1000;
            startTime = audioContext.currentTime - newTimeSeconds;
            sequenceIndex = eventlist.findIndex(evt => evt.time >= time) || 0;
        }, getCurrentTime, lastEventTime, bpm);
    }

    visualizeSong(eventlist);
    setPaused(false);
}

export function faustOnMidi(msg) {
    if (currentFaustNode) {
        currentFaustNode.midiMessage(msg);
    }
}
