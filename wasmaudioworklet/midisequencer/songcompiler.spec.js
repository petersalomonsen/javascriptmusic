import { compileSong } from './songcompiler.js';

describe('songcompiler', async function() {
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
        assert.equal(eventlist[2].time, beatTime(2/4));
        assert.equal(eventlist[3].time, beatTime(4/4));
        assert.equal(eventlist[4].time, beatTime(4/4));
        assert.equal(eventlist[5].time, beatTime(4/4));
        assert.equal(eventlist[6].time, beatTime(4/4));
        assert.equal(eventlist[7].time, beatTime(6/4));
        assert.equal(eventlist[8].time, beatTime(6/4));
        assert.equal(eventlist[9].time, beatTime(7/4));
        assert.equal(eventlist[eventlist.length-2].time, beatTime(2));
        assert.equal(eventlist[eventlist.length-1].time, beatTime(2));
        assert.equal(eventlist[eventlist.length-1].message[0], -1);
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
}
);