import { SAMPLERATE } from "../../environment";
import { midiparts, midipartschedule } from "./midiparts";
import { fillSampleBuffer, sampleBufferFrames } from "../midisynth";
import { MidiSequencerPart, MidiSequencerPartSchedule } from "./midisequencerpart";

const PLAY_EVENT_INTERVAL = ((sampleBufferFrames * 1000) as f64 / SAMPLERATE);

export let currentTimeMillis: f64 = 0;

export function seek(time: i32): void {
    currentTimeMillis = time as f64;

    for (let ndx = 0;
        ndx < midipartschedule.length;
        ndx++) {
        const scheduleEntry = midipartschedule[ndx];
        const midiSequencerPart = midiparts[scheduleEntry.midipartindex];
        if (scheduleEntry.endTime >= currentTimeMillis && scheduleEntry.startTime <= currentTimeMillis) {
            midiSequencerPart.seek(Math.round(currentTimeMillis) as i32 - scheduleEntry.startTime);
        } else {
            midiSequencerPart.seek(0);
        }
    }
}

export function playMidiPartEvents(): void {
    for (let ndx = 0;
        ndx < midipartschedule.length;
        ndx++) {
        const scheduleEntry = midipartschedule[ndx];        
        if (scheduleEntry.startTime > currentTimeMillis) {
            break;
        }
        const midiSequencerPart = midiparts[scheduleEntry.midipartindex];
        if (currentTimeMillis <= (scheduleEntry.endTime + PLAY_EVENT_INTERVAL)) {
            midiSequencerPart.playEvents(Math.round(currentTimeMillis) as i32 - scheduleEntry.startTime);
        }
    }
}

export function playEventsAndFillSampleBuffer(): void {
    playMidiPartEvents();
    fillSampleBuffer();
    currentTimeMillis += PLAY_EVENT_INTERVAL;
}

export function setMidiPartSchedule(ndx: i32, midipartindex: i32, startTime: i32): void {
    if (ndx>=midipartschedule.length) {
        midipartschedule[ndx] = new MidiSequencerPartSchedule(midipartindex, startTime);
    } else {
        midipartschedule[ndx].updateEndTime(midipartindex, startTime);
    }
}

export function setMidiPartEventListValueAt(midipartindex: i32, eventlistindex: i32, value: u8): void {
    midiparts[midipartindex].setEventListValueAt(eventlistindex, value);
}

export function changeMidiPartEventListLength(midipartindex: i32, length: i32): void {
    midiparts[midipartindex].changeEventListLength(length);
}

export function addMidiPart(eventlistlength: i32): i32 {
    return midiparts.push(new MidiSequencerPart(new Array<u8>(eventlistlength))) - 1;
}

export function getDuration(): i32 {
    let duration: i32 = 0;
    for (let n = 0;n<midipartschedule.length; n++) {
        if (midipartschedule[n].endTime > duration) {
            duration = midipartschedule[n].endTime;
        }
    }
    return duration;
}