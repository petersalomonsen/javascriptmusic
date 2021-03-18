import { SAMPLERATE } from "../../environment";
import { seek, playEventsAndFillSampleBuffer, currentTimeMillis } from "../../midi/sequencer/midisequencer";
import { MidiSequencerPartSchedule } from "../../midi/sequencer/midisequencerpart";
import { midiparts, midipartschedule } from "../../midi/sequencer/midiparts";
import { samplebuffer } from "../../midi/midisynth";
import { MidiSequencerPart } from "../../midi/sequencer/midisequencerpart";

describe("midisequencer", () => {
    it("should play the sequencer", () => {
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

    });

    it("should seek", () => {
        const bpm = 70;
        const eventlist: u8[] = [
            0x00, 0x90, 0x40, 0x64,
            0x80, 0x01, 0x80, 0x40, 0x00, // time = 0x80, ndx 4
            0x40, 0x90, 0x40, 0x64, // time = 0xc0, ndx 9
            0x80, 0x01, 0x80, 0x40, 0x00 // time = 0x140, ndx 13
        ]; // ndx = 18

        const midiSequencerPart = new MidiSequencerPart(eventlist);

        midiSequencerPart.seek(0x40);

        expect(midiSequencerPart.currentEventTime).toBe(0);
        expect(midiSequencerPart.currentEventIndex).toBe(4);

        midiSequencerPart.seek(0x80);
        expect(midiSequencerPart.currentEventTime).toBe(0x80);
        expect(midiSequencerPart.currentEventIndex).toBe(4);

        midiSequencerPart.seek(0x40);

        expect(midiSequencerPart.currentEventTime).toBe(0);
        expect(midiSequencerPart.currentEventIndex).toBe(4);

        midiSequencerPart.seek(0xa0);
        expect(midiSequencerPart.currentEventTime).toBe(0x80);
        expect(midiSequencerPart.currentEventIndex).toBe(9);

        midiSequencerPart.seek(0xc0);
        expect(midiSequencerPart.currentEventTime).toBe(0xc0);
        expect(midiSequencerPart.currentEventIndex).toBe(9);

        midiSequencerPart.seek(0x140);
        expect(midiSequencerPart.currentEventTime).toBe(0x140);
        expect(midiSequencerPart.currentEventIndex).toBe(13);

        midiSequencerPart.seek(0xa0);
        expect(midiSequencerPart.currentEventTime).toBe(0x80);
        expect(midiSequencerPart.currentEventIndex).toBe(9);

        midiSequencerPart.seek(0x0);
        expect(midiSequencerPart.currentEventIndex).toBe(0);
        expect(midiSequencerPart.currentEventTime).toBe(0);
    });
    it('should play the song and fill the samplebuffer', () => {
        const eventlist: u8[] = [
            0x00, 0x90, 0x40, 0x64,
            0x80, 0x01, 0x80, 0x40, 0x00, // time = 0x80, ndx 4
            0x40, 0x90, 0x40, 0x64, // time = 0xc0, ndx 9
            0x80, 0x01, 0x80, 0x40, 0x00 // time = 0x140, ndx 13
        ]; // ndx = 18

        const midiSequencerPart = new MidiSequencerPart(eventlist);
        midiparts.push(midiSequencerPart);
        midipartschedule.push(new MidiSequencerPartSchedule(0, 0));
        expect(midiparts.length).toBe(1);
        expect(midipartschedule.length).toBe(1);

        seek(0x0);
        expect(currentTimeMillis).toBe(0);
        expect(samplebuffer[1]).toBe(0);
        playEventsAndFillSampleBuffer();
        expect(currentTimeMillis).toBeCloseTo(128 * 1000 / SAMPLERATE);
        expect(samplebuffer[1]).not.toBe(0);
    });
    it('should play 8 metronome clicks', () => {
        const eventlist: u8[] = [
            0, 145, 66, 100,
            217, 6, 129, 66, 0, // 857 msecs
            0, 145, 66, 100,
            217, 6, 129, 66, 0, // 857 msecs
            0, 145, 66, 100,
            217, 6, 129, 66, 0,
            0, 145, 66, 100,
            217, 6, 129, 66, 0,
            0, 145, 66, 100,
            217, 6, 129, 66, 0,
            0, 145, 66, 100,
            217, 6, 129, 66, 0,
            0, 145, 66, 100,
            217, 6, 129, 66, 0,
            10, 145, 66, 100,
            217, 6, 129, 66, 0
        ];
        const millisecondsBetweenEvents = 857;
        const midiSequencerPart = new MidiSequencerPart(eventlist);
        midiparts[0] = midiSequencerPart;
        midipartschedule[0] = new MidiSequencerPartSchedule(0, 0);
        expect(midiparts.length).toBe(1);
        expect(midipartschedule.length).toBe(1);
        expect(midipartschedule[0].endTime).toBe(midiSequencerPart.lastEventTime);
        expect(midiSequencerPart.lastEventTime).toBe(millisecondsBetweenEvents * 8 + 10);

        const expectedTimesAndIndices = [
            857 * 0, 4,
            857 * 1, 13,
            857 * 2, 22,
            857 * 3, 31,
            857 * 4, 40,
            857 * 5, 49,
            857 * 6, 58,
            857 * 7, 63,
            857 * 7 + 10, 67,
            857 * 8 + 10, midiSequencerPart.eventlist.length
        ];
        
        let expectedNdx = 0;
        seek(0x0);
        for (let n = 0; currentTimeMillis < midiSequencerPart.lastEventTime * 2; n++) {
            const expectedCurrentTime = (((n * 128.0) / SAMPLERATE) * 1000.0);

            expect(currentTimeMillis).toBeCloseTo(expectedCurrentTime);
            const previousEventIndex = midiSequencerPart.currentEventIndex;
            playEventsAndFillSampleBuffer();
            if (previousEventIndex !== midiSequencerPart.currentEventIndex) {
                expect(midiSequencerPart.currentEventIndex).toBe(expectedTimesAndIndices[expectedNdx+1],'event index not matching');
                expect(Math.abs(expectedCurrentTime - expectedTimesAndIndices[expectedNdx])).toBeLessThan(3);
                expectedNdx += 2;
            }            
        }
        expect(expectedNdx).toBe(expectedTimesAndIndices.length, 'not expected events passed');
    });
    it('should schedule midi part twice', () => {        
        const millisecondsBetweenEvents = 857;
        
        const midiSequencerPart = midiparts[0];
        midipartschedule.push(new MidiSequencerPartSchedule(0, midipartschedule[0].endTime));

        expect(midiparts.length).toBe(1);
        expect(midipartschedule.length).toBe(2);

        expect(midipartschedule[0].endTime).toBe(midiSequencerPart.lastEventTime);
        expect(midipartschedule[1].endTime).toBe(midiSequencerPart.lastEventTime + midipartschedule[0].endTime);
        expect(midiSequencerPart.lastEventTime).toBe(millisecondsBetweenEvents * 8 + 10);

        const expectedTimesAndIndices = [
            857 * 0, 4,
            857 * 1, 13,
            857 * 2, 22,
            857 * 3, 31,
            857 * 4, 40,
            857 * 5, 49,
            857 * 6, 58,
            857 * 7, 63,
            857 * 7 + 10, 67,
            857 * 8 + 10, 4,
            857 * 9 + 10, 13,
            857 * 10 + 10, 22,
            857 * 11 + 10, 31,
            857 * 12 + 10, 40,
            857 * 13 + 10, 49,
            857 * 14 + 10, 58,
            857 * 15 + 10, 63,
            857 * 15 + 20, 67,
            857 * 16 + 20, midiSequencerPart.eventlist.length
        ];
        
        let expectedNdx = 0;
        seek(0x0);
        for (let n = 0; currentTimeMillis < midiSequencerPart.lastEventTime * 3; n++) {
            const expectedCurrentTime = (((n * 128.0) / SAMPLERATE) * 1000.0);

            expect(currentTimeMillis).toBeCloseTo(expectedCurrentTime);
            const previousEventIndex = midiSequencerPart.currentEventIndex;
            playEventsAndFillSampleBuffer();
            if (previousEventIndex !== midiSequencerPart.currentEventIndex) {
                expect(midiSequencerPart.currentEventIndex).toBe(expectedTimesAndIndices[expectedNdx+1],'event index not matching');
                expect(Math.abs(expectedCurrentTime - expectedTimesAndIndices[expectedNdx])).toBeLessThan(3);
                expectedNdx += 2;
            }            
        }
        expect(expectedNdx).toBe(expectedTimesAndIndices.length, 'not expected events passed');
    });
    it('should schedule midi parts simultaneously', () => {
        const millisecondsBetweenEvents = 857;
        const eventlist: u8[] = [
            50, 145, 66, 100,
            138, 10, 129, 66, 0, // 1290
            50, 145, 66, 100,
            148, 10, 129, 66, 0 // 1300
        ];
        const otherMidiSequencerPart = new MidiSequencerPart(eventlist);
        const midiSequencerPart = midiparts[0];
        midiparts.push(otherMidiSequencerPart);
        midipartschedule.push(new MidiSequencerPartSchedule(1, midiparts[0].lastEventTime));

        expect(midiparts.length).toBe(2);
        expect(midipartschedule.length).toBe(3);

        expect(midipartschedule[0].endTime).toBe(midiSequencerPart.lastEventTime);
        expect(midipartschedule[1].endTime).toBe(midiSequencerPart.lastEventTime + midipartschedule[0].endTime);
        expect(midiSequencerPart.lastEventTime).toBe(millisecondsBetweenEvents * 8 + 10);
        expect(midipartschedule[2].endTime).toBe(midipartschedule[0].endTime + midiparts[1].lastEventTime);

        const expectedTimesAndIndices2 = [
            midiSequencerPart.lastEventTime + 50, 4,
            midiSequencerPart.lastEventTime + 1290 + 50, 9,
            midiSequencerPart.lastEventTime + 1290 + 50 + 50, 13,
            midiSequencerPart.lastEventTime + 1290 + 50 + 50 + 1300, 18
        ];

        const expectedTimesAndIndices = [
            857 * 0, 4,
            857 * 1, 13,
            857 * 2, 22,
            857 * 3, 31,
            857 * 4, 40,
            857 * 5, 49,
            857 * 6, 58,
            857 * 7, 63,
            857 * 7 + 10, 67,
            857 * 8 + 10, 4,
            857 * 9 + 10, 13,
            857 * 10 + 10, 22,
            857 * 11 + 10, 31,
            857 * 12 + 10, 40,
            857 * 13 + 10, 49,
            857 * 14 + 10, 58,
            857 * 15 + 10, 63,
            857 * 15 + 20, 67,
            857 * 16 + 20, midiSequencerPart.eventlist.length
        ];
        
        let expectedNdx = 0;
        let otherExpectedNdx = 0;
        seek(0x0);
        for (let n = 0; currentTimeMillis < midiSequencerPart.lastEventTime * 4; n++) {
            const expectedCurrentTime = (((n * 128.0) / SAMPLERATE) * 1000.0);

            expect(currentTimeMillis).toBeCloseTo(expectedCurrentTime);
            const previousEventIndex = midiSequencerPart.currentEventIndex;
            const otherPreviousEventIndex = otherMidiSequencerPart.currentEventIndex;
            playEventsAndFillSampleBuffer();
            if (previousEventIndex !== midiSequencerPart.currentEventIndex) {
                expect(midiSequencerPart.currentEventIndex).toBe(expectedTimesAndIndices[expectedNdx+1],'event index not matching');
                expect(Math.abs(expectedCurrentTime - expectedTimesAndIndices[expectedNdx])).toBeLessThan(3);
                expectedNdx += 2;
            }
            if (otherPreviousEventIndex !== otherMidiSequencerPart.currentEventIndex) {
                expect(otherMidiSequencerPart.currentEventIndex).toBe(expectedTimesAndIndices2[otherExpectedNdx+1],'event index not matching 2. current time '+expectedCurrentTime.toString());
                expect(Math.abs(expectedCurrentTime - expectedTimesAndIndices2[otherExpectedNdx])).toBeLessThan(3);
                otherExpectedNdx += 2;
            }
        }
        expect(expectedNdx).toBe(expectedTimesAndIndices.length, 'number of expected events not matching');
        expect(otherExpectedNdx).toBe(expectedTimesAndIndices2.length, 'number of expected events not matching 2');
    });    
});