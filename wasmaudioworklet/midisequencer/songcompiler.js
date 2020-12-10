import { resetTick, setBPM, nextTick, currentTime, waitForBeat } from './pattern.js';
import { TrackerPattern, pitchbend, controlchange, createNoteFunctions } from './trackerpattern.js';
import { SEQ_MSG_LOOP, SEQ_MSG_START_RECORDING, SEQ_MSG_STOP_RECORDING } from './sequenceconstants.js';

let songmessages = [];
export let instrumentNames = [];
let loopPromise;

export let recordingStartTimeMillis = 0;

const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
const output = {
    sendMessage: (msg) => {

        songmessages.push({
            time: currentTime(),
            message: msg
        });
    }
};

function playFromHere() {
    songmessages = songmessages.filter(evt => (evt.message[0] & 0xf0) === 0xb0) // keep control changes
        .map(evt => Object.assign(evt, { time: 0 }));

    resetTick();
}

async function loopHere() {
    output.sendMessage([SEQ_MSG_LOOP]);
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
    'stopRecording': stopRecording,
    'addInstrument': (instrument) => instrumentNames.push(instrument)
};
Object.assign(songargs, createNoteFunctions());
const songargkeys = Object.keys(songargs);

export async function compileSong(songsource) {
    songmessages = [];
    instrumentNames = [];

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

    console.log('song compiled');
    return songmessages;
}

export function convertEventListToByteArraySequence(eventlist) {
    return new Uint8Array(eventlist
        .filter(evt => (
            evt.message.length === 1 && evt.message[0] === SEQ_MSG_LOOP) ||
            evt.message.length > 1 // short messages            
        )
        .map((evt, ndx, arr) => {
            if (evt.message.length === 1 && evt.message[0] === SEQ_MSG_LOOP) {
                evt.message = [0xff, 0x2f, 0x00];
            }
            return {
                message: evt.message,
                time: evt.time,
                deltatime: ndx > 0 ? evt.time - arr[ndx - 1].time : evt.time
            };
        }).map(evt => {
            const deltatimearr = [];
            let deltatime = evt.deltatime;

            do {
                let deltatimepart = deltatime & 0x7f;
                deltatime = deltatime >> 7;
                if (deltatime > 0) {
                    deltatimepart |= 0x80;
                }
                deltatimearr.push(deltatimepart);
            } while (deltatime > 0)

            return deltatimearr.concat(evt.message);
        }).reduce((prev, curr) => prev.concat(curr), []));
}