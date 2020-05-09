import { resetTick, setBPM, nextTick, currentTime, releasePendingEvents, waitForBeat } from './pattern.js';
import { TrackerPattern, pitchbend, controlchange, createNoteFunctions } from './trackerpattern.js';
import { SEQ_MSG_LOOP, SEQ_MSG_START_RECORDING, SEQ_MSG_STOP_RECORDING } from './sequenceconstants.js';

let songmessages = [];
let loopPromise;
export let recordingStartTimeMillis = 0;

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
const output = { sendMessage: (msg) => {
    songmessages.push({
        time: currentTime(),
        message: msg
    })
} };

function playFromHere() {
    songmessages = [];
    resetTick();
}

async function loopHere() {
    let loopPromiseResolve;
    // if user don't "await" for loopHere, keep the promise so that we can wait for it
    loopPromise = new Promise(resolve => loopPromiseResolve = resolve);
    await releasePendingEvents();
    output.sendMessage([SEQ_MSG_LOOP]);    
    loopPromiseResolve();
}

function startRecording() {
    recordingStartTimeMillis = currentTime();
    output.sendMessage([SEQ_MSG_START_RECORDING]);
}

function stopRecording() {
    output.sendMessage([SEQ_MSG_STOP_RECORDING]);
}

const songargs = {
    'output': output,
    'setBPM': setBPM,
    'TrackerPattern': TrackerPattern,
    'createTrack': (channel, stepsperbeat, defaultvelocity) =>
            new TrackerPattern(output, channel, stepsperbeat, defaultvelocity),
    'playFromHere': playFromHere,
    'loopHere': loopHere,
    'pitchbend': pitchbend,
    'controlchange': controlchange,
    'waitForBeat': waitForBeat,
    'startRecording': startRecording,
    'stopRecording': stopRecording
};
Object.assign(songargs, createNoteFunctions());
const songargkeys = Object.keys(songargs);

export async function compileSong(songsource) {
    songmessages = [];

    console.log('compile song');
    resetTick();
    const songfunc = new AsyncFunction(songargkeys, songsource);
    
    let playing = true;
    let err;

    songfunc.apply(
        null,
        songargkeys.map(k => songargs[k])
    ).then(() => playing = false).catch(e => {
        err = e;
    });

    while (playing) {
        if (err) {
            throw err;
        }
        await nextTick();
    }

    if ( loopPromise ) {
        console.log('wait for loop');
        await loopPromise;
    }
    console.log('song compiled');
    return songmessages;
}