// The data view of song note rows that agent scripts work over (run_script).
// Run with: npm run test-agent-tools

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    noteName, noteNumber, quantizeBeat, parseNotes, formatNotes, findPlayBlocks, groupByBeat
} from './script-helpers.js';

// A take exactly as midisequencer/recording.js writes it: one row per note,
// chords as consecutive rows at (nearly) the same beat, in note-off order.
const TAKE = `createTrack(4).play([[ 0.60, f7(0.56, 79) ],
[ 1.03, e7(0.47, 89) ],
[ 0.07, f5(1.58, 69) ],
[ 0.08, d5(1.57, 63) ],
[ 0.07, a5(1.60, 78) ],
[ 1.49, c7(0.50, 98) ]]);`;

test('noteNumber/noteName use the sequencer\'s naming (c5 = 60)', () => {
    assert.equal(noteNumber('c5'), 60);
    assert.equal(noteNumber('as4'), 58);
    assert.equal(noteName(60), 'c5');
    assert.equal(noteName(58), 'as4');
    assert.equal(noteNumber('h4'), null);
    assert.equal(noteNumber('kick'), null);
    for (let n = 0; n < 128; n++) assert.equal(noteNumber(noteName(n)), n);
});

test('quantizeBeat snaps to the grid, partially with pct', () => {
    assert.equal(quantizeBeat(1.03, 4), 1);
    assert.equal(quantizeBeat(0.60, 2), 0.5);
    assert.equal(quantizeBeat(1.1, 1, 0.5), 1.05);
});

test('parseNotes reads the recorder\'s row format into plain objects', () => {
    const notes = parseNotes(TAKE);
    assert.equal(notes.length, 6);
    assert.deepEqual(notes[0], { beat: 0.6, note: 89, name: 'f7', duration: 0.56, velocity: 79 });
    assert.deepEqual(notes[3], { beat: 0.08, note: 62, name: 'd5', duration: 1.57, velocity: 63 });
});

test('parseNotes: a row with several notes is a chord; bare names and control changes', () => {
    const notes = parseNotes(`pad.play([
        [ 0, d6(1.9, 72), f6(1.9, 72), a6 ],
        [ 2, controlchange(7, 100), c6(1.9) ],
    ]);`);
    assert.deepEqual(notes.map((n) => n.beat), [0, 0, 0, 2, 2]);
    assert.deepEqual(notes[2], { beat: 0, note: 81, name: 'a6', duration: null, velocity: null });
    assert.deepEqual(notes[3], { beat: 2, cc: 7, value: 100 });
    assert.deepEqual(notes[4], { beat: 2, note: 72, name: 'c6', duration: 1.9, velocity: null });
});

test('parseNotes ignores step arrays (no leading beat number)', () => {
    assert.deepEqual(parseNotes('kick.steps(4, [ c2, , , , ].repeat(15));'), []);
    assert.deepEqual(parseNotes('piano.steps(4, [ [d5,f5,a5], , [d5,f5,a5], , ]);'), []);
});

test('formatNotes writes the recorder\'s format back, transposition included', () => {
    const notes = parseNotes(TAKE).map((n) => ({ ...n, note: n.note + 12 }));
    const text = formatNotes(notes.slice(0, 2));
    assert.equal(text, '[ 0.60, f8(0.56, 79) ],\n[ 1.03, e8(0.47, 89) ]');
    // round trip
    assert.deepEqual(parseNotes(`x.play([${formatNotes(notes)}])`).map((n) => n.note), notes.map((n) => n.note));
});

test('formatNotes: chords on one row, indentation, bare notes and CCs', () => {
    const chord = [
        { beat: 0, note: 74, duration: 1.9, velocity: 72 },
        { beat: 0, note: 77, duration: 1.9, velocity: 72 },
        { beat: 2, note: 72, duration: null, velocity: null },
        { beat: 2, cc: 7, value: 100 },
    ];
    assert.equal(formatNotes(chord, { chords: true, indent: '    ' }),
        '[ 0.00, d6(1.90, 72), f6(1.90, 72) ],\n    [ 2.00, c6 ],\n    [ 2.00, controlchange(7, 100) ]');
    // without chords: one row per note, as recorded
    assert.equal(formatNotes(chord.slice(0, 2)), '[ 0.00, d6(1.90, 72) ],\n[ 0.00, f6(1.90, 72) ]');
});

test('findPlayBlocks locates every play() call with splice-able ranges', () => {
    const song = `setBPM(125);
const pad = createTrack(2, 4);
function intro() { pad.play([[ 0, c5(1, 80) ]].quantize(4)); }
startRecording();
${TAKE}
stopRecording();
loopHere();
`;
    const blocks = findPlayBlocks(song);
    assert.equal(blocks.length, 2);
    assert.equal(blocks[0].track, 'pad');
    assert.equal(blocks[0].inner, '[[ 0, c5(1, 80) ]].quantize(4)');
    assert.equal(blocks[0].notes.length, 1);
    assert.equal(blocks[1].track, 'createTrack(4)');
    assert.equal(blocks[1].text, TAKE.slice(0, -1)); // the call, without the trailing ';'
    assert.equal(song.slice(blocks[1].start, blocks[1].end), blocks[1].text);
    assert.equal(blocks[1].notes.length, 6);
    // splicing a rewrite back in keeps everything around it
    const rewritten = song.slice(0, blocks[1].start) + 'padlead.play([])' + song.slice(blocks[1].end);
    assert.match(rewritten, /startRecording\(\);\npadlead\.play\(\[\]\);\nstopRecording/);
});

test('groupByBeat separates chords (2+ notes together) from single melody notes', () => {
    const groups = groupByBeat(parseNotes(TAKE));
    assert.deepEqual(groups.map((g) => g.map((n) => n.name)), [['f5', 'a5', 'd5'], ['f7'], ['e7'], ['c7']]);
    const chords = groups.filter((g) => g.length > 1);
    const melody = groups.filter((g) => g.length === 1).flat();
    assert.equal(chords.length, 1);
    assert.deepEqual(melody.map((n) => n.name), ['f7', 'e7', 'c7']);
});
