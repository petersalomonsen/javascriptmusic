import { compileSong, convertEventListToByteArraySequence } from './songcompiler.js';

describe('songcompiler', async function () {
    it('should compile a simple song', async () => {
        const bpm = 80;
        const songsource = `
setBPM(${bpm});

await createTrack(0).steps(4, [
    [c3,gs3(1,30)],,gs3(1,10),,
    [c3,gs3(1,30)],,gs3(1,10),gs3(1,2),
]);

loopHere();
`;
        const beatTime = beatNo => Math.floor((beatNo / bpm) * 60 * 1000);

        const eventlist = await compileSong(songsource);
        assert.equal(eventlist[0].time, 0);
        assert.equal(eventlist[1].time, 0);
        assert.equal(eventlist[2].time, beatTime(2 / 4));
        assert.equal(eventlist[3].time, beatTime(4 / 4));
        assert.equal(eventlist[4].time, beatTime(4 / 4));
        assert.equal(eventlist[5].time, beatTime(4 / 4));
        assert.equal(eventlist[6].time, beatTime(4 / 4));
        assert.equal(eventlist[7].time, beatTime(6 / 4));
        assert.equal(eventlist[8].time, beatTime(6 / 4));
        assert.equal(eventlist[9].time, beatTime(7 / 4));
        assert.equal(eventlist[eventlist.length - 2].time, beatTime(2));
        assert.equal(eventlist[eventlist.length - 1].time, beatTime(2));
        assert.equal(eventlist[eventlist.length - 1].message[0], -1);
    }
    );
    it('should not hang when writing wrong code', async () => {
        let hasError = false;
        try {
            await compileSong(`createTrack(5).steps(4,[controlChange(91, 100)]);`);
        } catch (e) {
            assert.equal('controlChange is not defined', e.message);
            hasError = true;
        }
        assert.equal(hasError, true);
    });
    it('should convert eventlist to a bytearray sequence for using in exported wasm files', async () => {
        const bpm = 80;
        const songsource = `
setBPM(${bpm});

await createTrack(0).steps(4, [
    [c3,gs3(1,30)],,gs3(1,10),,
    [c3,gs3(1,30)],,gs3(1,10),gs3(1,2),
]);

loopHere();
`;
        const beatTime = beatNo => Math.floor((beatNo / bpm) * 60 * 1000);

        const origEventList = await compileSong(songsource);
        const eventbytes = convertEventListToByteArraySequence(origEventList);
        const reconstructedEventlist = [];

        let ndx = 0;
        let currentEventTime = 0;
        while (ndx < eventbytes.length) {
            let deltaTime = 0;
            let deltaTimePart = 0;

            let shiftamount = 0;
            do {
                deltaTimePart = eventbytes[ndx++];
                deltaTime += ((deltaTimePart & 0x7f) << shiftamount);
                shiftamount += 7;
            } while (deltaTimePart & 0x80);

            currentEventTime = currentEventTime + deltaTime;

            reconstructedEventlist.push({
                time: currentEventTime,
                message: eventbytes.subarray(ndx, ndx + 3)
            });
            ndx += 3;
        }

        for (let n = 0; n < reconstructedEventlist.length; n++) {
            assert.equal(origEventList[n].time, reconstructedEventlist[n].time);
            assert.equal(origEventList[n].message[0], reconstructedEventlist[n].message[0]);
            assert.equal(origEventList[n].message[1], reconstructedEventlist[n].message[1]);
            assert.equal(origEventList[n].message[2], reconstructedEventlist[n].message[2]);
        }
    });
    it('should keep the latest controller state when using playFromHere', async () => {
        const bpm = 80;
        const songsource = `
setBPM(${bpm});

createTrack(0).steps(4, [
    controlchange(7, 23),
    controlchange(90, 25),
]);
await createTrack(0).steps(4, [
    [d3,g3(1,30)],,a3(1,10),,
    [d3,g3(1,30)],,a3(1,10),g3(1,2),
]);

playFromHere();
await createTrack(0).steps(4, [
    [c3,gs3(1,30)],,gs3(1,10),,
    [c3,gs3(1,30)],,gs3(1,10),gs3(1,2),
]);


loopHere();
`;
        const beatTime = beatNo => Math.floor((beatNo / bpm) * 60 * 1000);

        const eventlist = await compileSong(songsource);
        assert.equal(eventlist[0].time, 0);
        assert.equal(eventlist[1].time, 0);

        assert.deepEqual(eventlist[0].message, [0xb0, 7, 23], eventlist[0].message);
        assert.deepEqual(eventlist[1].message, [0xb0, 90, 25], eventlist[1].message);

        assert.equal(eventlist[2].time, 0);
        assert.equal(eventlist[3].time, 0);
        assert.equal(eventlist[4].time, beatTime(2 / 4));
        assert.equal(eventlist[5].time, beatTime(4 / 4));
        assert.equal(eventlist[6].time, beatTime(4 / 4));
        assert.equal(eventlist[7].time, beatTime(4 / 4));
        assert.equal(eventlist[8].time, beatTime(4 / 4));
        assert.equal(eventlist[9].time, beatTime(6 / 4));
        assert.equal(eventlist[10].time, beatTime(6 / 4));
        assert.equal(eventlist[11].time, beatTime(7 / 4));
        assert.equal(eventlist[eventlist.length - 2].time, beatTime(2));
        assert.equal(eventlist[eventlist.length - 1].time, beatTime(2));
        assert.equal(eventlist[eventlist.length - 1].message[0], -1);
    }
    );

    it('should loop in the middle of the song', async () => {
        const bpm = 110;
        const songsource = `
        setBPM(${bpm});
    
        async function kickbeat() {
            return createTrack(1).steps(4, [
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,c5(1/8,30),
              [c5],,,,
        
            ].repeat(1));
        }
        
        createTrack(1).steps(4,[
          ,,,,
          ,,,,
          ,,,,
          ,,,,
          ,,,,
          ,,,,
          ,,,,
          ,,,,
          ,,,,
          ,,,,
          ,,,,
          ,,,,
          ,,b5,,
          b5,,,
          b5,,,a5,
          a5(5),,g5(5,33),,
          f5,,,,
          f5]);
        await kickbeat();
        
        loopHere();

        await kickbeat();
        
        loopHere();

`;
        const beatTime = beatNo => Math.floor((beatNo / bpm) * 60 * 1000);

        const eventlist = await compileSong(songsource);
        assert.equal(eventlist[0].time, 0);
        assert.equal(eventlist[1].time, beatTime(1));
        assert.notEqual(eventlist.find(evt => evt.time === beatTime(16) && evt.message[0] === -1), undefined);
    }
    );
}
);