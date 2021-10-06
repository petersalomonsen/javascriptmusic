import { resetTick, setBPM, nextTick, currentTime, waitForBeat } from './pattern.js';
import { TrackerPattern, pitchbend, controlchange, createNoteFunctions, noteFunctionKeys } from './trackerpattern.js';
import { SEQ_MSG_LOOP, SEQ_MSG_START_RECORDING, SEQ_MSG_STOP_RECORDING } from './sequenceconstants.js';

let songmessages = [];
export let instrumentNames = [];

export let recordingStartTimeMillis = 0;
let muted = {};
let solo = {};
export let addedAudio = [];

let trackerPatterns = [];

const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
const output = {
    sendMessage: (msg) => {
        const ch = msg[0] & 0x0f;
        if (msg.length !== 3 ||
            (!muted[ch] && !Object.keys(solo).length || solo[ch])
        ) {
            songmessages.push({
                time: currentTime(),
                message: msg
            });
        }
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

const noteFunctions = createNoteFunctions();
const songargs = {
    'output': output,
    'setBPM': setBPM,
    'TrackerPattern': TrackerPattern,
    'createTrack': (channel, stepsperbeat, defaultvelocity) => {
        const trackerPattern = new TrackerPattern({
            startTime: currentTime(),
            midievents: [],
            sendMessage: function (msg) {
                this.midievents.push({
                    time: currentTime() - this.startTime,
                    message: msg
                });
                output.sendMessage(msg);
            }
        }, channel, stepsperbeat, defaultvelocity);
        trackerPatterns.push(trackerPattern);
        return trackerPattern;
    },
    'playFromHere': playFromHere,
    'loopHere': loopHere,
    'pitchbend': pitchbend,
    'controlchange': controlchange,
    'waitForBeat': waitForBeat,
    'startRecording': startRecording,
    'stopRecording': stopRecording,
    'mute': (channel) => muted[channel] = true,
    'solo': (channel) => solo[channel] = true,
    'addInstrument': (instrument) => instrumentNames.push(instrument),
    'addAudio': async (url) => {
        if (!(await addedAudio.find(async audioPromise => (await audioPromise).url === url))) {
            addedAudio.push(new Promise(async (resolve, reject) => {
                const audioObj = { url: url };
                try {
                    const buf = await fetch(url)
                        .then(response => response.arrayBuffer())
                        .then(buffer => new AudioContext().decodeAudioData(buffer));

                    audioObj.leftbuffer = buf.getChannelData(0).buffer;
                    audioObj.rightbuffer = buf.getChannelData(1).buffer;
                    console.log('loaded', url);
                    resolve(audioObj);
                } catch(e) {
                    reject(e);
                }
            }));            
        }
    },
    'note': (noteNumber, duration, velocity, offset) =>
        noteFunctions[noteFunctionKeys[noteNumber]](duration, velocity, offset)
};
Object.assign(songargs, noteFunctions);
const songargkeys = Object.keys(songargs);

export async function compileSong(songsource) {
    songmessages = [];
    instrumentNames = [];
    trackerPatterns = [];
    muted = {};
    solo = {};

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

export function createMultipatternSequence() {
    const outputPatterns = [];
    for (let n = 0; n < trackerPatterns.length; n++) {
        if (trackerPatterns[n]) {
            const pattern = trackerPatterns[n];
            const outputPattern = {
                eventlist: convertEventListToByteArraySequence(pattern.output.midievents),
                startTimes: [pattern.output.startTime],
                channel: pattern.channel
            };
            trackerPatterns.forEach((p, ndx) => {
                if (ndx > n &&
                    p &&
                    p.output.midievents.length === pattern.output.midievents.length &&
                    p.output.midievents.reduce((prevstate, midievent, midievtndx) =>
                        prevstate &&
                        (midievent.time - pattern.output.midievents[midievtndx].time) < 2,
                        true)
                ) {
                    const noteCheckMap = {};
                    const p1 = p.output.midievents;
                    const p2 = pattern.output.midievents;
                    for (let i = 0; i < p1.length; i++) {
                        const note1 = p1[i].message.join(',');
                        const note2 = p2[i].message.join(',');

                        if (!noteCheckMap[note1]) {
                            noteCheckMap[note1] = true;
                        } else {
                            delete noteCheckMap[note1];
                        }
                        if (!noteCheckMap[note2]) {
                            noteCheckMap[note2] = true;
                        } else {
                            delete noteCheckMap[note2];
                        }
                    }
                    if (Object.keys(noteCheckMap).length === 0) {
                        trackerPatterns[ndx] = null;
                        outputPattern.startTimes.push(p.output.startTime);
                    }
                }
            });
            outputPatterns.push(outputPattern);
        }
    }
    const patternmap = {};
    outputPatterns.forEach((pattern, ndx) => {
        if (!patternmap[pattern.channel]) {
            patternmap[pattern.channel] = [0];
        }
        if (ndx > 0) {
            patternmap[pattern.channel].push(ndx);
        }
    });
    console.log(outputPatterns);
    console.log('created multipartsequence. Here is the patternmap', JSON.stringify(patternmap));
    return outputPatterns;
}