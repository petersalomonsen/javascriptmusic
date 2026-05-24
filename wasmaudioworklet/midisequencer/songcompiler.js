import { resetTick, setBPM, nextTick, currentTime, waitForBeat } from './pattern.js';
import { TrackerPattern, pitchbend, controlchange, createNoteFunctions, noteFunctionKeys } from './trackerpattern.js';
import { SEQ_MSG_LOOP, SEQ_MSG_START_RECORDING, SEQ_MSG_STOP_RECORDING, SEQ_MSG_BROADCAST_SEND, SEQ_MSG_BROADCAST_WAIT } from './sequenceconstants.js';
import { setVideoSchedule } from '../visualizer/videoscheduler.js';

// Map a URL to one suitable for assignment to <img>/<video>.src.
// Repo-relative paths (no protocol, no leading slash) are read via the host-
// registered OPFS reader (see `setOpfsBinaryReader` below) and exposed as
// blob URLs so the browser can load them. Absolute and data: URLs pass
// through unchanged. The reader is injected rather than imported directly
// so the embeddable songcompiler bundle doesn't drag in the wasm-git client.
const MIME_BY_EXT = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4', webm: 'video/webm',
    wav: 'audio/wav', mp3: 'audio/mpeg', flac: 'audio/flac',
    ogg: 'audio/ogg', m4a: 'audio/mp4', aac: 'audio/aac',
};
function isRepoRelative(url) {
    return typeof url === 'string'
        && url.length > 0
        && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url) // no scheme
        && !url.startsWith('/')
        && !url.startsWith('//');
}
let _opfsBinaryReader = null;
// Host registers an OPFS reader: `(path) => Promise<Uint8Array>`. The
// editor wires this up to wasm-git's readfile; the embeddable bundle
// leaves it null and falls through to literal URLs.
export function setOpfsBinaryReader(reader) {
    _opfsBinaryReader = reader;
}
async function resolveMediaUrl(url) {
    if (!isRepoRelative(url) || !_opfsBinaryReader) return url;
    try {
        const bytes = await _opfsBinaryReader(url);
        if (!bytes) return url;
        const ext = url.split('.').pop().toLowerCase();
        const type = MIME_BY_EXT[ext] || 'application/octet-stream';
        return URL.createObjectURL(new Blob([bytes], { type }));
    } catch (e) {
        console.warn(`Could not resolve repo-relative media url '${url}' via OPFS, falling back to literal:`, e.message);
        return url;
    }
}

let songmessages = [];
export let instrumentNames = [];

export let recordingStartTimeMillis = 0;
let muted = {};
let solo = {};
export let addedAudio = [];
export const addedVideo = {};

let trackerPatterns = [];
let songParts = {};

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

function startVideo(name, clipStartTime = 0) {
    addedVideo[name].schedule.push({ startTime: currentTime(), clipStartTime });
}

function stopVideo(name) {
    addedVideo[name].schedule[addedVideo[name].schedule.length - 1].stopTime = currentTime();
}

// Emit a named signal on the BroadcastChannel at the current song time.
// Used together with broadcastWait in another window (or another song) to
// coordinate playback across windows.
function broadcastSend(name) {
    songmessages.push({
        time: currentTime(),
        message: [SEQ_MSG_BROADCAST_SEND],
        name,
    });
}

// Park the sequencer at this point until a matching broadcastSend arrives.
// Stale signals received before the wait engages are ignored. Manually
// clicking the play checkbox also bypasses the wait.
function broadcastWait(name) {
    songmessages.push({
        time: currentTime(),
        message: [SEQ_MSG_BROADCAST_WAIT],
        name,
    });
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
    'startVideo': startVideo,
    'stopVideo': stopVideo,
    'broadcastSend': broadcastSend,
    'broadcastWait': broadcastWait,
    'definePartStart': (partName) => songParts[partName] = { startTime: currentTime() },
    'definePartEnd': (partName) => songParts[partName].endTime = currentTime(),
    'mute': (channel) => muted[channel] = true,
    'solo': (channel) => solo[channel] = true,
    'addInstrument': (instrument) => instrumentNames.push(instrument),
    'addAudio': async (url) => {
        if (!(await addedAudio.find(async audioPromise => (await audioPromise).url === url))) {
            addedAudio.push(new Promise(async (resolve, reject) => {
                const audioObj = { url: url };
                try {
                    const buf = await fetch(await resolveMediaUrl(url))
                        .then(response => response.arrayBuffer())
                        .then(buffer => new AudioContext().decodeAudioData(buffer));

                    audioObj.leftbuffer = buf.getChannelData(0).buffer;
                    audioObj.rightbuffer = buf.getChannelData(1).buffer;
                    console.log('loaded', url);
                    resolve(audioObj);
                } catch (e) {
                    reject(e);
                }
            }));
        }
    },
    'addVideo': async (name, url) => {
        if (!addedVideo[name]) {
            const videoElement = document.createElement('video');
            videoElement.crossOrigin = 'anonymous';
            videoElement.autoplay = false;
            videoElement.muted = true;
            // Register the entry before awaiting so sync startVideo() calls
            // later in the song can find { schedule: [] } even if the OPFS
            // blob-URL resolve hasn't settled yet.
            addedVideo[name] = { videoElement, schedule: [] };
            videoElement.src = await resolveMediaUrl(url);
        }
    },
    'addImage': async (name, url, cache = true) => {
        if (!cache || !addedVideo[name]) {
            const imageElement = new Image();
            imageElement.crossOrigin = 'anonymous';
            addedVideo[name] = { imageElement, schedule: [] };
            imageElement.src = await resolveMediaUrl(url);
        }
    },
    'note': (noteNumber, duration, velocity, offset) =>
        noteFunctions[noteFunctionKeys[noteNumber]](duration, velocity, offset)
};
Object.assign(songargs, noteFunctions);
export const songargkeys = Object.keys(songargs);

export async function compileSong(songsource) {
    return await generateSong(new AsyncFunction(songargkeys, songsource));
}

export async function generateSong(songfunc) {
    songmessages = [];
    instrumentNames = [];
    trackerPatterns = [];
    const videoSchedule = [];
    Object.values(addedVideo).forEach(vid => vid.schedule = []);
    muted = {};
    solo = {};
    songParts = {};

    resetTick();

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

    Object.values(addedVideo).forEach(vid =>
        vid.schedule.forEach(sch => {
            sch.video = vid;
            videoSchedule.push(sch);
        })
    );
    videoSchedule.sort((a, b) => b.startTime - a.startTime);
    setVideoSchedule(videoSchedule);

    const loopMessageIndex = songmessages.findIndex(evt => evt.message == SEQ_MSG_LOOP);
    if (loopMessageIndex > -1) {
        songmessages = songmessages.slice(0, loopMessageIndex + 1);
    }
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
                eventlistuncompressed: pattern.output.midievents,
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
    return outputPatterns;
}

export function getSongParts() {
    const multiPatternSequence = createMultipatternSequence();
    Object.values(songParts).forEach(part => {
        part.patterns = []
        multiPatternSequence.forEach((pattern, patternNdx) => {
            const patternStartTimes = pattern.startTimes.filter(startTime =>
                startTime >= part.startTime &&
                startTime < part.endTime
            );
            if (patternStartTimes.length > 0) {
                part.patterns.push({
                    patternIndex: patternNdx,
                    startTimes: patternStartTimes
                });
            }
        });
    });
    multiPatternSequence.forEach(pattern => {
        delete pattern.eventlist;
        delete pattern.startTimes;
    });
    return { multiPatternSequence: multiPatternSequence, songParts };
}

export function reassembleSongParts(parts, partsArrangement) {
    const songParts = parts.songParts;
    const eventList = [];
    let lastPartEndTime = 0;
    partsArrangement.forEach(arrangedPart => {
        const songPart = songParts[arrangedPart.songPartName];
        const songPartDuration = songPart.endTime - songPart.startTime;
        const songPartStartTime = lastPartEndTime;
        lastPartEndTime += songPartDuration;
        songPart.patterns.forEach(patternref => {
            patternref.startTimes.forEach(startTime => {
                const patternData = parts.multiPatternSequence[patternref.patternIndex];
                const selectedChannels = arrangedPart.selectedChannels;
                if (selectedChannels.findIndex(ch => ch == patternData.channel) > -1) {
                    const patternEvents = patternData.eventlistuncompressed.map(evt => ({
                        time: evt.time + startTime - songPart.startTime + songPartStartTime,
                        message: evt.message
                    }));
                    eventList.push(...patternEvents);
                }
            });
        });
    });
    eventList.sort((a, b) => a.time - b.time);
    return eventList;
}


