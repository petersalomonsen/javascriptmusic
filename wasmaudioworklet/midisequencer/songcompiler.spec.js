import { getActiveVideo, getActiveText } from '../visualizer/videoscheduler.js';
import { getActiveVisualParams } from '../visualizer/visualparams.js';
import { compileSong, convertEventListToByteArraySequence, createMultipatternSequence, addedVideo, getSongParts, reassembleSongParts } from './songcompiler.js';

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
    // Documents the concurrency rule in docs/song-api.md ("Playing tracks at the
    // same time"): CALLING steps() schedules its notes from the current song
    // position; only AWAITING it advances the shared clock. So the beat-keeping
    // pattern is awaited and the ones playing along with it are not.
    it('should play tracks simultaneously when only the beat-keeping pattern is awaited', async () => {
        const bpm = 125;
        const beatTime = beatNo => Math.floor((beatNo / bpm) * 60 * 1000);
        const noteOns = eventlist => eventlist
            .filter(evt => (evt.message[0] & 0xf0) === 0x90 && evt.message[2] > 0)
            .map(evt => [evt.message[0] & 0x0f, evt.time]);

        const simultaneous = await compileSong(`
setBPM(${bpm});

const kick = createTrack(0);
const hats = createTrack(1);

// hats play ALONGSIDE the kick - scheduled, not awaited
hats.steps(2, [, fs3, , fs3]);
// the kick keeps the beat, so it is the one that is awaited
await kick.steps(1, [c2, c2]);

loopHere();
`);
        // kick on beats 0 and 1, hats interleaved on the offbeats 0.5 and 1.5
        assert.deepEqual(noteOns(simultaneous), [
            [0, beatTime(0)],
            [1, beatTime(0.5)],
            [0, beatTime(1)],
            [1, beatTime(1.5)]
        ]);

        // Awaiting both plays them one after the other instead - the bug this rule prevents.
        const sequential = await compileSong(`
setBPM(${bpm});

const kick = createTrack(0);
const hats = createTrack(1);

await kick.steps(1, [c2, c2]);
await hats.steps(2, [, fs3, , fs3]);

loopHere();
`);
        assert.deepEqual(noteOns(sequential), [
            [0, beatTime(0)],
            [0, beatTime(1)],
            [1, beatTime(2.5)],
            [1, beatTime(3.5)]
        ]);
    });
    // `.repeat(n)` appends n FURTHER copies, so the result is n+1 — unlike
    // String.prototype.repeat. Pinned here with the exact numbers the docs and
    // the studio-agent prompt quote, because getting it backwards makes a part
    // one bar longer than everything around it.
    it('should repeat a pattern n+1 times, not n', async () => {
        const bpm = 120;
        const lengthBeats = async (repeatArg) => {
            const eventlist = await compileSong(`
setBPM(${bpm});
await createTrack(0).steps(1, [ c2, c2, c2, c2 ].repeat(${repeatArg}));
loopHere();
`);
            const noteOns = eventlist.filter(e => (e.message[0] & 0xf0) === 0x90 && e.message[2] > 0);
            return { notes: noteOns.length, beats: eventlist[eventlist.length - 1].time / ((60 / bpm) * 1000) };
        };

        assert.deepEqual(await lengthBeats(1), { notes: 8, beats: 8 });    // 2 copies
        assert.deepEqual(await lengthBeats(3), { notes: 16, beats: 16 });  // 4 copies
        assert.deepEqual(await lengthBeats(7), { notes: 32, beats: 32 });  // 8 copies — a bar over 32 beats
        assert.deepEqual(await lengthBeats(8), { notes: 36, beats: 36 });  // 9 copies, NOT 8
    });
    it('should not hang when writing wrong code', async () => {
        let hasError = false;
        try {
            await compileSong(`createTrack(5).steps(4,[controlChange(91, 100)]);`);
        } catch (e) {
            // Chromium / WebKit / QuickJS-sandbox message variants
            assert.isTrue(e.message === 'controlChange is not defined' ||
                e.message === "Can't find variable: controlChange" ||
                e.message === "'controlChange' is not defined");
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
    it('should create multipattern sequence', async () => {
        const bpm = 110;
        const songsource = `
        setBPM(${bpm});
    
        const kickbeat = () => createTrack(1).steps(4, [
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,c5(1/8,30),
              [c5],,,,        
            ]);
        
        const blabla = () => createTrack(0).steps(4, [
           c1,c2,c3    
            ]);
        
        const tralala = () => createTrack(0).steps(4, [
                d4,c3,c1,f6    
                 ]);
             
        const hohoho = () => createTrack(0).steps(4, [
            d3,d2,d1   
        ]);
        blabla();
        await kickbeat();
        tralala();
        await kickbeat();
        hohoho();
        await kickbeat();
        loopHere();
`;
        await compileSong(songsource);
        const multipatternsequence = createMultipatternSequence();
        console.log(multipatternsequence[1].startTimes);
        assert.equal(multipatternsequence.length, 4);
        assert.equal(multipatternsequence[0].startTimes.length, 1);
        assert.equal(multipatternsequence[1].startTimes.length, 3);
        assert.equal(multipatternsequence[2].startTimes.length, 1);
        assert.equal(multipatternsequence[3].startTimes.length, 1);
    }
    );
    it('should define song parts', async () => {
        const bpm = 110;
        const songsource = `
        setBPM(${bpm});
    
        const kickbeat = () => createTrack(1).steps(4, [
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,c5(1/8,30),
              [c5],,,,        
            ]);
        
        const blabla = () => createTrack(0).steps(4, [
           c1,c2,c3    
            ]);
        
        const tralala = () => createTrack(0).steps(4, [
                d4,c3,c1,f6    
                 ]);
             
        const hohoho = () => createTrack(0).steps(4, [
            d3,d2,d1   
        ]);
        definePartStart('blabla');
        blabla();
        await kickbeat();
        definePartEnd('blabla');
        definePartStart('tralala');
        tralala();
        await kickbeat();
        definePartStart('hohoho');
        hohoho();
        await kickbeat();
        definePartEnd('tralala');
        definePartEnd('hohoho');
        loopHere();
`;
        await compileSong(songsource);
        const parts = getSongParts().songParts;
        expect(Object.keys(parts)).to.eql(['blabla', 'tralala', 'hohoho']);
        expect(parts.blabla.startTime).to.eql(0);
        expect(parts.tralala.startTime).equal(Math.floor(60 * 1000 * 8 / bpm));
        expect(parts.blabla.endTime).equal(Math.floor(60 * 1000 * 8 / bpm));
        expect(parts.hohoho.startTime).equal(Math.floor(60 * 1000 * 16 / bpm));
        expect(parts.hohoho.endTime).equal(Math.floor(60 * 1000 * 24 / bpm));
        expect(parts.tralala.endTime).equal(Math.floor(60 * 1000 * 24 / bpm));
        Object.values(parts).forEach(part => {
            part.patterns.forEach(pattern => {
                pattern.startTimes.forEach(startTime => {
                    expect(startTime).to.be.within(part.startTime, part.endTime);
                })
            });
        });
    });
    it('should be able to reassemble song parts', async () => {
        const bpm = 110;
        const songsource = `
        setBPM(${bpm});
    
        const kickbeat = () => createTrack(1).steps(4, [
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,c5(1/8,30),
              [c5],,,,        
            ]);
        
        const blabla = () => createTrack(0).steps(4, [
           c1,c2,c3    
            ]);
        
        const tralala = () => createTrack(2).steps(4, [
                d4,c3,c1,f6    
                 ]);
             
        const hohoho = () => createTrack(3).steps(4, [
            d3,d2,d1   
        ]);
        definePartStart('blabla');
        blabla();
        await kickbeat();
        definePartEnd('blabla');
        definePartStart('tralala');
        tralala();
        await kickbeat();
        definePartEnd('tralala');
        definePartStart('hohoho');
        hohoho();
        await kickbeat();        
        hohoho();
        await kickbeat();
        definePartEnd('hohoho');
        loopHere();
`;
        const eventlist = await compileSong(songsource);
        const parts = getSongParts();
        const reassembledPartsEventList = reassembleSongParts(parts,[{
            songPartName: 'blabla',
            selectedChannels: [0,1]
        }, {
            songPartName: 'tralala',
            selectedChannels: [1,2]
        },
        {
            songPartName: 'hohoho',
            selectedChannels: [1,3]
        }]);

        const compareObj = (a,b) => JSON.stringify(a) == JSON.stringify(b);

        eventlist.filter(e => e.message.length == 3).forEach(originalEvent => {
            const ndx = reassembledPartsEventList.findIndex(e => compareObj(e.message, originalEvent.message));
            expect(ndx).not.to.lt(0);
            expect(Math.abs(reassembledPartsEventList[ndx].time - originalEvent.time)).lt(2);
            reassembledPartsEventList.splice(ndx, 1);
        });
        expect(reassembledPartsEventList.length).to.equal(0);
    });
    it('should be able to reassemble selected song parts or channels', async () => {
        const bpm = 110;
        const songsource = `
        setBPM(${bpm});
    
        const kickbeat = () => createTrack(1).steps(4, [
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,c5(1/8,30),
              [c5],,,,        
            ]);
        
        const blabla = () => createTrack(0).steps(4, [
           c1,c2,c3    
            ]);
        
        const tralala = () => createTrack(2).steps(4, [
                d4,c3,c1,f6    
                 ]);
             
        const hohoho = () => createTrack(3).steps(4, [
            d3,d2,d1   
        ]);
        definePartStart('blabla');
        blabla();
        await kickbeat();
        definePartEnd('blabla');
        definePartStart('tralala');
        tralala();
        await kickbeat();
        definePartEnd('tralala');
        definePartStart('hohoho');
        hohoho();
        await kickbeat();        
        hohoho();
        await kickbeat();
        definePartEnd('hohoho');
        loopHere();
`;
        const eventlist = await compileSong(songsource);
        const parts = getSongParts();
        const reassembledPartsEventList = reassembleSongParts(parts, [{
            songPartName: 'blabla',
            selectedChannels: [0]
        },{
            songPartName: 'hohoho',
            selectedChannels: [3]
        }]);

        expect(reassembledPartsEventList.filter(e => [1].findIndex(ch => ch == (e.message[0] & 0xf)) > -1).length).to.equal(0);

        const compareObj = (a,b) => JSON.stringify(a) == JSON.stringify(b);

        const partTralalaDuration = parts.songParts['tralala'].endTime - parts.songParts['tralala'].startTime;

        eventlist.filter(e => e.message.length == 3)
            .filter(e => [0,3].findIndex(ch => ch == (e.message[0] & 0xf)) > -1)
            .forEach(originalEvent => {
            const ndx = reassembledPartsEventList.findIndex(e => compareObj(e.message, originalEvent.message));
            expect(ndx).not.to.lt(0);
            const reassembledEvent = reassembledPartsEventList[ndx];
            if ((reassembledEvent.message[0] & 0x0f) == 3) {
                originalEvent.time-=partTralalaDuration;
            }
            expect(Math.abs(reassembledEvent.time - originalEvent.time)).lt(2);
            reassembledPartsEventList.splice(ndx, 1);
        });
        expect(reassembledPartsEventList.length).to.equal(0);
    });
    it('should be able to schedule video', async () => {
        const bpm = 120;
        const img1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mMMXBFYDwAEZwHL1c3acAAAAABJRU5ErkJggg==';
        const img2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNcURRYDwAFIQHsvNeWdwAAAABJRU5ErkJggg==';
        const img3 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mMMbFhRDwAEnQH6sTtwiwAAAABJRU5ErkJggg==';
        const img4 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNcETi9HgAFSgIR+S1DRAAAAABJRU5ErkJggg==';
        const songsource = `
        setBPM(${bpm});
    
        addImage('img1', '${img1}');
        addImage('img2', '${img2}');
        addImage('img3', '${img3}');
        addImage('img4', '${img4}');
        await createTrack(0).steps(4, [
              () => startVideo('img1'),,,,
              () => startVideo('img2'),,,,
              () => startVideo('img3'),,,,
              () => startVideo('img4'),,,,
            ]);
        loopHere();
`;
        await compileSong(songsource);
        await Promise.all(Object.values(addedVideo).map(vid => new Promise(resolve => vid.imageElement.onload = () => resolve())));

        expect(getActiveVideo(0).src).to.equal(img1);
        expect(getActiveVideo(500).src).to.equal(img2);
        expect(getActiveVideo(1000).src).to.equal(img3);
        expect(getActiveVideo(1500).src).to.equal(img4);
    });
    it('should schedule text and visual params from the song', async () => {
        const songsource = `
        setBPM(120);

        setVisual('glow', 0.25);
        showText('Hello', { fade: 0.5 });
        await createTrack(0).steps(4, [c3,,,,]);
        setVisual('glow', 1, 1);
        showText('World', { transition: 2, fade: 0 });
        await createTrack(0).steps(4, [c3,,,,]);
        hideText();
        loopHere();
`;
        await compileSong(songsource);

        // one beat at 120bpm = 500ms
        const first = getActiveText(0);
        expect(first.fade).to.equal(0.5);
        expect(decodeURIComponent(first.video.imageElement.src)).to.contain('>Hello<');
        expect(decodeURIComponent(getActiveText(700).video.imageElement.src)).to.contain('>World<');
        // hideText renders an image without any text element
        expect(decodeURIComponent(getActiveText(1200).video.imageElement.src)).to.not.contain('<text');

        // text goes on its own layer — the image/video schedule stays empty
        expect(getActiveVideo(700)).to.equal(undefined);

        expect(getActiveVisualParams(0).get('glow')).to.equal(0.25);
        // ramped over 1s from 500ms
        expect(getActiveVisualParams(1000).get('glow')).to.be.closeTo(0.625, 1e-9);
        expect(getActiveVisualParams(1500).get('glow')).to.equal(1);
        // showText's transition rides on the same channel
        expect(getActiveVisualParams(0).get('textTransition')).to.equal(0);
        expect(getActiveVisualParams(700).get('textTransition')).to.equal(2);
    });
}
);