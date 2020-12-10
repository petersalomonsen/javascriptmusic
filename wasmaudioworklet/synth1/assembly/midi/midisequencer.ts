/**
 * Simple single track midisequencer
 */

import { SAMPLERATE } from "../environment";
import { fillSampleBuffer, sampleBufferFrames, shortmessage } from "./midisynth";

let eventlist: u8[];

export let currentEventTime: i32 = 0;
export let currentEventIndex: i32 = 0;
export let currentTimeMillis: f64 = 0;

export function setEventList(evtlist: u8[]): void {
    eventlist = evtlist;
}

export function playEvents(targetTime: i32): void {
    let ndx = currentEventIndex;

    while (ndx < eventlist.length) {
        let deltaTime: i32 = 0;
        let deltaTimePart: u8;

        let shiftamount: u8 = 0;
        do {
            deltaTimePart = eventlist[ndx++];
            deltaTime += (((deltaTimePart & 0x7f) as i32) << shiftamount);
            shiftamount += 7;
        } while (deltaTimePart & 0x80);

        const newTime = currentEventTime + deltaTime;

        if (newTime <= targetTime) {
            shortmessage(eventlist[ndx++], eventlist[ndx++], eventlist[ndx++]);

            currentEventTime = newTime;
            currentEventIndex = ndx;
        } else {
            break;
        }
    }
}

export function seek(targetTime: i32): void {
    currentEventIndex = 0;
    currentEventTime = 0;
    let ndx = currentEventIndex;

    while (ndx < eventlist.length) {
        let deltaTime: i32 = 0;
        let deltaTimePart: u8;

        let shiftamount: u8 = 0;
        do {
            deltaTimePart = eventlist[ndx++];
            deltaTime += ((deltaTimePart & 0x7f) << shiftamount);
            shiftamount += 7;
        } while (deltaTimePart & 0x80);

        const newTime = currentEventTime + deltaTime;

        if (newTime < targetTime) {
            ndx += 3;
            currentEventTime = newTime;
            currentEventIndex = ndx;
        } else if (newTime === targetTime) {
            currentEventTime = newTime;
        } else {
            break;
        }
    }
    currentTimeMillis = targetTime;
}

export function playEventsAndFillSampleBuffer(): void {
    playEvents(Math.round(currentTimeMillis) as i32);
    fillSampleBuffer();
    currentTimeMillis += ((sampleBufferFrames * 1000) as f64 / SAMPLERATE);
}