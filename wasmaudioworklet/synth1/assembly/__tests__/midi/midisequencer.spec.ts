import { SAMPLERATE } from "../../environment";
import { currentEventIndex, currentEventTime, currentTimeMillis, playEvents, setEventList, seek, playEventsAndFillSampleBuffer } from "../../midi/midisequencer";
import { samplebuffer } from "../../midi/midisynth";

describe("midisynth", () => {
    it("should play the sequencer", () => {
        const eventlist: u8[] = [
            0x00, 0x90, 0x40, 0x64,
            0x80, 0x01, 0x80, 0x40, 0x00, // time = 0x80
            0x40, 0x90, 0x40, 0x64, // time = 0xc0
            0x80, 0x01, 0x80, 0x40, 0x00 // time = 0x140
        ];

        setEventList(eventlist);

        playEvents(0x40);

        expect(currentEventTime).toBe(0);
        expect(currentEventIndex).toBe(4);

        playEvents(0x80);
        expect(currentEventTime).toBe(0x80);
        expect(currentEventIndex).toBe(9);

        playEvents(0xa0);
        expect(currentEventTime).toBe(0x80);
        expect(currentEventIndex).toBe(9);

        playEvents(0xc0);
        expect(currentEventTime).toBe(0xc0);
        expect(currentEventIndex).toBe(13);

        playEvents(0x141);
        expect(currentEventTime).toBe(0x140);
        expect(currentEventIndex).toBe(18);

    });

    it("should seek", () => {
        const eventlist: u8[] = [
            0x00, 0x90, 0x40, 0x64,
            0x80, 0x01, 0x80, 0x40, 0x00, // time = 0x80, ndx 4
            0x40, 0x90, 0x40, 0x64, // time = 0xc0, ndx 9
            0x80, 0x01, 0x80, 0x40, 0x00 // time = 0x140, ndx 13
        ]; // ndx = 18

        setEventList(eventlist);

        seek(0x40);

        expect(currentEventTime).toBe(0);
        expect(currentEventIndex).toBe(4);

        seek(0x80);
        expect(currentEventTime).toBe(0x80);
        expect(currentEventIndex).toBe(4);

        seek(0x40);

        expect(currentEventTime).toBe(0);
        expect(currentEventIndex).toBe(4);

        seek(0xa0);
        expect(currentEventTime).toBe(0x80);
        expect(currentEventIndex).toBe(9);
        expect(currentTimeMillis).toBe(0xa0);

        seek(0xc0);
        expect(currentEventTime).toBe(0xc0);
        expect(currentEventIndex).toBe(9);

        seek(0x140);
        expect(currentEventTime).toBe(0x140);
        expect(currentEventIndex).toBe(13);

        seek(0xa0);
        expect(currentEventTime).toBe(0x80);
        expect(currentEventIndex).toBe(9);

        seek(0x0);
        expect(currentEventIndex).toBe(0);
        expect(currentEventTime).toBe(0);
    });
    it('should play the song and fill the samplebuffer', () => {
        seek(0x0);
        expect(currentTimeMillis).toBe(0);
        expect(samplebuffer[1]).toBe(0);
        playEventsAndFillSampleBuffer();
        expect(currentTimeMillis).toBeCloseTo(128 * 1000 / SAMPLERATE);
        expect(samplebuffer[1]).not.toBe(0);
    });
});