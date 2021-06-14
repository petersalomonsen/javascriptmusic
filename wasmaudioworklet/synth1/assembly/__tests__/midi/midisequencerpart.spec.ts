import { addMidiPart, changeMidiPartEventListLength, getDuration, setMidiPartEventListValueAt, setMidiPartSchedule } from "../../midi/sequencer/midisequencer";
import { MidiSequencerPart } from "../../midi/sequencer/midisequencerpart";

describe("midiparts", () => {
    it("should update midiparts in the sequencer", () => {
        const eventlist: u8[] = [
            0x00, 0x90, 0x40, 0x64,
            0x80, 0x01, 0x80, 0x40, 0x00, // time = 0x80
            0x40, 0x90, 0x40, 0x64, // time = 0xc0
            0x80, 0x01, 0x80, 0x40, 0x00 // time = 0x140
        ];
        const midiSequencerPart = new MidiSequencerPart(eventlist);

        midiSequencerPart.playEvents(0x40);

        expect(midiSequencerPart.currentEventTime).toBe(0);
        expect(midiSequencerPart.currentEventIndex).toBe(4);

        midiSequencerPart.playEvents(0x80);
        expect(midiSequencerPart.currentEventTime).toBe(0x80);
        expect(midiSequencerPart.currentEventIndex).toBe(9);

        midiSequencerPart.playEvents(0xa0);
        expect(midiSequencerPart.currentEventTime).toBe(0x80);
        expect(midiSequencerPart.currentEventIndex).toBe(9);

        midiSequencerPart.playEvents(0xc0);
        expect(midiSequencerPart.currentEventTime).toBe(0xc0);
        expect(midiSequencerPart.currentEventIndex).toBe(13);

        midiSequencerPart.playEvents(0x141);
        expect(midiSequencerPart.currentEventTime).toBe(0x140);
        expect(midiSequencerPart.currentEventIndex).toBe(18);

        const eventlist2: u8[] = [
            0x00, 0x90, 0x40, 0x64,
            0x01, 0x80, 0x40, 0x00, // time = 0x01
            0x03, 0x90, 0x40, 0x64, // time = 0x04
            0x05, 0x80, 0x40, 0x00 // time = 0x09
        ];

        for (let n = 0; n < eventlist2.length; n++) {
            midiSequencerPart.setEventListValueAt(n, eventlist2[n]);
        }
        midiSequencerPart.changeEventListLength(eventlist2.length);
        expect(midiSequencerPart.eventlist.length).toBe(eventlist2.length);

        midiSequencerPart.playEvents(0x02);

        expect(midiSequencerPart.currentEventTime).toBe(1);
        expect(midiSequencerPart.currentEventIndex).toBe(8);

        midiSequencerPart.playEvents(0x09);
        expect(midiSequencerPart.currentEventTime).toBe(0x09);
        expect(midiSequencerPart.currentEventIndex).toBe(16);

        const eventlist3: u8[] = [
            0x00, 0x90, 0x40, 0x64,
            0x01, 0x80, 0x40, 0x00, // time = 0x01
            0x03, 0x90, 0x40, 0x64, // time = 0x04
            0x05, 0x80, 0x40, 0x00, // time = 0x09
            0x07, 0x90, 0x40, 0x64, // time = 0x10
            0x80, 0x01, 0x80, 0x40, 0x00, // time = 0x90
            0x40, 0x90, 0x40, 0x64, // time = 0xd0
            0x80, 0x01, 0x80, 0x40, 0x00 // time = 0x150
        ];
        
        for (let n = 0; n < eventlist3.length; n++) {
            midiSequencerPart.setEventListValueAt(n, eventlist3[n]);
        }
        expect(midiSequencerPart.eventlist.length).toBe(eventlist3.length);
        midiSequencerPart.findLastEventTime();

        midiSequencerPart.playEvents(0x02);

        expect(midiSequencerPart.currentEventTime).toBe(1);
        expect(midiSequencerPart.currentEventIndex).toBe(8);

        midiSequencerPart.playEvents(0x09);
        expect(midiSequencerPart.currentEventTime).toBe(0x09);
        expect(midiSequencerPart.currentEventIndex).toBe(16);

        midiSequencerPart.playEvents(0x40 + 0x10);

        expect(midiSequencerPart.currentEventTime).toBe(0 + 0x10);
        expect(midiSequencerPart.currentEventIndex).toBe(4 + 16);

        midiSequencerPart.playEvents(0x80 + 0x10);
        expect(midiSequencerPart.currentEventTime).toBe(0x80 + 0x10);
        expect(midiSequencerPart.currentEventIndex).toBe(9 + 16);

        midiSequencerPart.playEvents(0xa0 + 0x10);
        expect(midiSequencerPart.currentEventTime).toBe(0x80 + 0x10);
        expect(midiSequencerPart.currentEventIndex).toBe(9 + 16);

        midiSequencerPart.playEvents(0xc0 + 0x10);
        expect(midiSequencerPart.currentEventTime).toBe(0xc0 + 0x10);
        expect(midiSequencerPart.currentEventIndex).toBe(13 + 16);

        midiSequencerPart.playEvents(0x141 + 0x10);
        expect(midiSequencerPart.currentEventTime).toBe(0x140 + 0x10);
        expect(midiSequencerPart.currentEventIndex).toBe(18 + 16);

        expect(midiSequencerPart.lastEventTime).toBe(0x140 + 0x10);
    });
    it("should add midiparts", () => {
        const midipartindex = addMidiPart(8);
        setMidiPartSchedule(0, midipartindex, 0);
        expect(getDuration()).toBe(0);
        const eventlist2: u8[] = [
            0x00, 0x90, 0x40, 0x64,
            0x01, 0x80, 0x40, 0x00, // time = 0x01
            0x03, 0x90, 0x40, 0x64, // time = 0x04
            0x05, 0x80, 0x40, 0x00 // time = 0x09
        ];
        for (let n = 0; n < eventlist2.length; n++) {
            setMidiPartEventListValueAt(midipartindex, n, eventlist2[n]);
        }
        changeMidiPartEventListLength(midipartindex, eventlist2.length);
        setMidiPartSchedule(0, midipartindex, 0);
        expect(getDuration()).toBe(0x09);
    });
});