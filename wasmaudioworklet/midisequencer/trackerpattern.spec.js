import { createNoteFunctions, TrackerPattern } from './trackerpattern.js';
import { nextTick } from './pattern.js';

describe('trackerpattern', function () {
    it("should quantize", () => {
        const quantizedEvents = [[0, [0x80, 64, 100]],
        [1.1 / 4, [0x80, 64, 100]],
        [2.3 / 4, [0x80, 64, 100]],
        [3.2 / 4, [0x80, 64, 100]]].quantize(4);
        assert.equal(4, quantizedEvents.length);

        for (let n = 0; n < quantizedEvents.length; n++) {
            assert.equal(quantizedEvents[n][0], n / 4);
        }
    });
    it("should quantize 50% late events", () => {
        const quantizedEvents = [[0, [0x80, 64, 100]],
        [1.1 / 4, [0x80, 64, 100]],
        [2.2 / 4, [0x80, 64, 100]],
        [3.3 / 4, [0x80, 64, 100]]].quantize(4, 0.5);

        for (let n = 0; n < quantizedEvents.length; n++) {
            assert.equal(quantizedEvents[n][0], (n / 4) + (n / 80));
        }
    });
    it("should quantize 50% early events", () => {
        const quantizedEvents = [[0, [0x80, 64, 100]],
        [0.9 / 4, [0x80, 64, 100]],
        [1.8 / 4, [0x80, 64, 100]],
        [2.7 / 4, [0x80, 64, 100]]].quantize(4, 0.5);

        for (let n = 0; n < quantizedEvents.length; n++) {
            assert.equal(quantizedEvents[n][0], (n / 4) - (n / 80));
        }
    });
    it("should transpose notes without parameters", async () => {
        const noteFunctions = createNoteFunctions();

        assert.equal(noteFunctions.c6, noteFunctions.c5.transpose(12));
        assert.equal(noteFunctions.c4, noteFunctions.c5.transpose(-12));
    });
    it("should transpose notes with parameters", async () => {
        const noteFunctions = createNoteFunctions();

        const events = [];

        const pattern = new TrackerPattern({
            sendMessage: (msg) => events.push(msg)
        }, 0, 1, 100);
        pattern.steps(1, [
            noteFunctions.c5(2)
        ].map(n => n.transpose(12))
            .concat([noteFunctions.c5(2)])
        );
        await nextTick();
        await nextTick();

        assert.equal(events[0][1], events[1][1] + 12);
    });
    it("should fix velocities on notes with and without parameters", async () => {
        const noteFunctions = createNoteFunctions();

        const events = [];

        const pattern = new TrackerPattern({
            sendMessage: (msg) => events.push(msg)
        }, 0, 1, 100);
        pattern.steps(1, [
            noteFunctions.c5(2),
            noteFunctions.d5(2, 33),
            noteFunctions.e5(2, 88),
            noteFunctions.f5
        ].fixVelocity(66));
        while (events.length < 8) {
            await nextTick();
        }
        const noteOnEvents = events.filter(evt => evt[0] === 144);
        assert.equal(noteOnEvents.length, 4);
        for (var n = 0; n < noteOnEvents.length; n++) {
            assert.equal(noteOnEvents[n][2], 66);
        }
    });
});