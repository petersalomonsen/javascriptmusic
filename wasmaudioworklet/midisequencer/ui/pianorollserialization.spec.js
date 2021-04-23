import './pianoroll.js';
import { SERIALIZE_TIME_RESOLUTION, deserializePianorollsData, serializePianorollsData } from './pianorollserialization.js';

describe('pianorollserialization', function() {
    it('should create pianorolls, serialize data and deserialize it', () => {
        const numpianorolls = 5;
        const sequenceLengthBeats = 8;
        const originaldata = new Array(numpianorolls);
        for (let n = 0; n<numpianorolls; n++) {
            const numnoteevents = Math.floor(Math.random(100) + 10);
            const numcontrolevents = Math.floor(Math.random(200) + 20);
            
            const pianorollelement = document.createElement('midi-pianoroll');
            pianorollelement.setAttribute('data-columns', `${sequenceLengthBeats * 32}`);
            pianorollelement.setAttribute('data-title', `channel${n}`);
            pianorollelement.channel = n;
            document.documentElement.appendChild(pianorollelement);
            const randomseqtime = () => Math.floor(Math.random() * sequenceLengthBeats * SERIALIZE_TIME_RESOLUTION) / SERIALIZE_TIME_RESOLUTION;

            originaldata[n] = {
                controlevents: Array.from(new Array(numcontrolevents).keys()).map(n => ({
                    controllerNumber: Math.floor(Math.random() * 127), // controllerNumber
                    start: randomseqtime(), // time
                    controllerValue: Math.floor(Math.random() * 127) // value
                })),
                notes: Array.from(new Array(numnoteevents).keys()).map(n => ({
                    noteNumber: Math.floor(Math.random() * 88) + 21, // notenumber
                    start: randomseqtime(), // time
                    duration:  randomseqtime(), // duration
                    velocityValue: Math.floor(Math.random() * 126) + 1 // velocity
                }))
            };

            originaldata[n].controlevents.forEach(evt =>
                pianorollelement.addControlEvent(
                    evt.controllerNumber,
                    evt.start,
                    evt.controllerValue
                )
            );
            originaldata[n].notes.forEach(evt =>
                pianorollelement.addNote(
                    evt.noteNumber,
                    evt.start,
                    evt.duration,
                    evt.velocityValue
                )
            );
        }

        const serialized = serializePianorollsData(Array.from(document.querySelectorAll('midi-pianoroll')).map((pianoroll) =>
            pianoroll.getPianorollData()));

        const deserialized = deserializePianorollsData(serialized);
        originaldata.forEach((originalchanneldata, ndx) => {
            const channeldata = deserialized[ndx];
            
            assert.equal(channeldata.length, 
                    originalchanneldata.notes.length +
                    originalchanneldata.controlevents.length);
            
            const deserializedNotes = channeldata.filter(n => n.noteNumber !== undefined);
            assert.equal(deserializedNotes.length, originalchanneldata.notes.length);
            
            const deserializedNotesSorted = deserializedNotes.sort((a, b) =>
                a.start - b.start ||
                a.noteNumber - b.noteNumber ||
                a.velocityValue - b.velocityValue
            );
            const originalNotesSorted = originalchanneldata.notes.sort((a, b) =>
                a.start - b.start ||
                a.noteNumber - b.noteNumber ||
                a.velocityValue - b.velocityValue
            );
            deserializedNotesSorted.forEach((evt, ndx) => {
                assert.equal(evt.start, originalNotesSorted[ndx].start);
                assert.equal(evt.duration, originalNotesSorted[ndx].duration);
                assert.equal(evt.noteNumber, originalNotesSorted[ndx].noteNumber );
                assert.equal(evt.velocityValue, originalNotesSorted[ndx].velocityValue );
            });

            const deserializedControlEvents = channeldata.filter(n => n.controllerNumber !== undefined);
            assert.equal(deserializedControlEvents.length, originalchanneldata.controlevents.length);

            const deserializedControlSorted = deserializedControlEvents.sort((a, b) =>
                a.start - b.start ||
                a.controllerNumber - b.controllerNumber ||
                a.controllerValue - b.controllerValue
            );
            const originalControlSorted = originalchanneldata.controlevents.sort((a, b) =>
                a.start - b.start ||
                a.controllerNumber - b.controllerNumber ||
                a.controllerValue - b.controllerValue
            );
            deserializedControlSorted.forEach((evt, ndx) => {
                assert.equal(evt.start, originalControlSorted[ndx].start);
                assert.equal(evt.controllerNumber, originalControlSorted[ndx].controllerNumber );
                assert.equal(evt.controllerValue, originalControlSorted[ndx].controllerValue );
            });            
        });
    });
});
