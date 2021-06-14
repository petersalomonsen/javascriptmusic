import { midiparts, midipartschedule } from "./midiparts";
import { shortmessage } from "../midisynth";

export class MidiSequencerPart {
    currentEventTime: i32 = 0;
    currentEventIndex: i32 = 0;
    previousTargetTime: i32 = 0;
    lastEventTime: i32 = 0;

    constructor(public eventlist: Array<u8>) {
        this.findLastEventTime();
    }

    public changeEventListLength(newLength: i32): void {
        this.eventlist.length = newLength;
        this.findLastEventTime();
    }

    public setEventListValueAt(ndx: i32, val: u8): void {
        this.eventlist[ndx] = val;
    }

    public findLastEventTime(): void {
        let lastEventTime = 0;
        for (let ndx = 0; ndx < this.eventlist.length;ndx += 3) {
            let deltaTime: i32 = 0;
            let deltaTimePart: u8;

            let shiftamount: u8 = 0;
            do {
                deltaTimePart = this.eventlist[ndx++];
                deltaTime += (((deltaTimePart & 0x7f) as i32) << shiftamount);
                shiftamount += 7;
            } while (deltaTimePart & 0x80);

            lastEventTime = lastEventTime + deltaTime;
        }
        this.lastEventTime = lastEventTime;
    }

    playEvents(targetTime: i32): void {
        if (targetTime < this.previousTargetTime) {
            this.currentEventTime = 0;
            this.currentEventIndex = 0;
        }
        this.previousTargetTime = targetTime;
        let ndx = this.currentEventIndex;

        while (ndx < this.eventlist.length) {
            let deltaTime: i32 = 0;
            let deltaTimePart: u8;

            let shiftamount: u8 = 0;
            do {
                deltaTimePart = this.eventlist[ndx++];
                deltaTime += (((deltaTimePart & 0x7f) as i32) << shiftamount);
                shiftamount += 7;
            } while (deltaTimePart & 0x80);

            const newTime = this.currentEventTime + deltaTime;

            if (newTime <= targetTime) {
                shortmessage(this.eventlist[ndx++], this.eventlist[ndx++], this.eventlist[ndx++]);

                this.currentEventTime = newTime;
                this.currentEventIndex = ndx;
            } else {
                break;
            }
        }
    }

    seek(targetTime: i32): void {
        this.currentEventIndex = 0;
        this.currentEventTime = 0;
        let ndx = this.currentEventIndex;

        while (ndx < this.eventlist.length) {
            let deltaTime: i32 = 0;
            let deltaTimePart: u8;

            let shiftamount: u8 = 0;
            do {
                deltaTimePart = this.eventlist[ndx++];
                deltaTime += ((deltaTimePart & 0x7f) << shiftamount);
                shiftamount += 7;
            } while (deltaTimePart & 0x80);

            const newTime = this.currentEventTime + deltaTime;

            if (newTime < targetTime) {
                ndx += 3;
                this.currentEventTime = newTime;
                this.currentEventIndex = ndx;
            } else if (newTime === targetTime) {
                this.currentEventTime = newTime;
            } else {
                break;
            }
        }
    }
}

export class MidiSequencerPartSchedule {
    public endTime: i32

    constructor(
        public midipartindex: i32,
        public startTime: i32) {
            this.endTime = midiparts[midipartindex].lastEventTime + startTime;
    }

    updateEndTime(midipartindex: i32, startTime: i32): void {
        this.startTime = startTime;
        this.midipartindex = midipartindex;
        this.endTime = midiparts[midipartindex].lastEventTime + startTime;
    }
}
