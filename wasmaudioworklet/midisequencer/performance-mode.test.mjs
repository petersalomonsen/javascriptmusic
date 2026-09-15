// Performance mode in the worklet sequencer, run in Node: the class is plain
// JS behind two globals (sampleRate, AudioWorkletGlobalScope), so the wait /
// loop / quantize / jump / timeout logic is tested without an audio thread.
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.sampleRate = 44100;
globalThis.AudioWorkletGlobalScope = {};
const { AudioWorkletProcessorSequencerModule } = await import('./audioworkletprocessorsequencer.js');
const { SEQ_MSG_WAIT_SIGNAL, SEQ_MSG_PART, SEQ_MSG_LOOP } = await import('./sequenceconstants.js');

// 120 BPM: beat 500 ms, bar 2000 ms. Part a = 2 bars with a note on each
// bar, then the wait; part b and part c one bar each.
const BAR = 2000, BEAT = 500;
const part = (name, time) => ({ time, message: [SEQ_MSG_PART], name, barMs: BAR });
const on = (time, note) => ({ time, message: [0x90, note, 100] });
const off = (time, note) => ({ time, message: [0x80, note, 0] });
const wait = (time, extra = {}) => ({ time, message: [SEQ_MSG_WAIT_SIGNAL], name: 'go', loop: 'part', quantize: 'bar', default: 'continue', timeout: null, partStart: 0, barMs: BAR, beatMs: BEAT, ...extra });
const song = (waitExtra = {}) => [
  part('a', 0), on(0, 60), off(400, 60), on(2000, 62), off(2400, 62),
  wait(4000, waitExtra),
  part('b', 4000), on(4000, 64), off(4400, 64),
  part('c', 6000), on(6000, 67), off(6400, 67),
  { time: 8000, message: [SEQ_MSG_LOOP] },
];

function makeSeq(sequence, { performance = true } = {}) {
  AudioWorkletProcessorSequencerModule();
  const seq = globalThis.AudioWorkletGlobalScope.midisequencer;
  const fired = [];   // [songTimeMs, note] for note-ons
  seq.addMidiReceiver((s, d1) => { if (s === 0x90) fired.push([Math.round(seq.getCurrentTime()), d1]); });
  const states = [];
  seq.onSignalState = (st) => states.push(st);
  seq.setPerformanceMode(performance);
  seq.setSequenceData(sequence);
  // advance the clock by `ms`, one 128-frame block at a time
  const run = (ms) => { const blocks = Math.ceil(ms * sampleRate / 1000 / 128); for (let i = 0; i < blocks; i++) seq.onprocess(); };
  return { seq, fired, states, run, notes: () => fired.map(f => f[1]) };
}

test('outside performance mode the wait is inert: the song plays straight through', () => {
  const s = makeSeq(song(), { performance: false });
  s.run(7000);
  assert.deepEqual(s.notes(), [60, 62, 64, 67]);
  assert.equal(s.states.length, 0);
});

test('a default naming a part makes the inert wait seek there', () => {
  const s = makeSeq(song({ default: 'c' }), { performance: false });
  s.run(4500);   // the seek moves the clock 2 s ahead, so this ends before the loop marker
  assert.deepEqual(s.notes(), [60, 62, 67]);   // b skipped
});

test('performance mode loops the part until a signal, then leaves on the next bar', () => {
  const s = makeSeq(song());
  s.run(9000);   // more than two passes of part a
  assert.deepEqual(s.notes(), [60, 62, 60, 62, 60], 'part a loops, b never starts');
  assert.deepEqual(s.states[0], { waiting: 'go', loop: 'part', timeoutMs: 0 });
  // now at ~1000 ms into the third pass: signal → jump at the bar line (2000)
  const r = s.seq.signal('go');
  assert.equal(r.resumed, true);
  assert.equal(r.at, 2000);
  s.run(1500);
  // the note at 2000 in part a must NOT fire: we cut to b at the bar line
  assert.deepEqual(s.notes().slice(5), [64]);
  assert.ok(s.states.some(st => st.resumed === 'go'));
  assert.equal(s.seq.wait, null);
  s.run(2500);
  assert.deepEqual(s.notes().slice(5), [64, 67]);   // continues into c, no wait left
});

test('a signal carrying a part jumps there instead of continuing', () => {
  const s = makeSeq(song());
  s.run(4500);   // first pass done, looping
  assert.equal(s.seq.signal('go', 'c').goTo, 'c');
  s.run(2500);
  assert.deepEqual(s.notes().slice(-1), [67]);
  assert.ok(!s.notes().includes(64), 'b was skipped');
});

test("'any' matches whatever signal arrives; a non-matching name is ignored", () => {
  const s = makeSeq(song({ name: 'any' }));
  s.run(4500);
  assert.equal(s.seq.signal('next').resumed, true);
  const t = makeSeq(song());
  t.run(4500);
  assert.deepEqual(t.seq.signal('nope'), { resumed: false, ignored: true });
  t.run(3000);
  assert.ok(!t.notes().includes(64), 'still looping');
});

test('quantize beat and now', () => {
  const s = makeSeq(song({ quantize: 'beat' }));
  s.run(4700);   // ~700 ms into pass 2 → next beat at 1000
  assert.equal(s.seq.signal('go').at, 1000);
  const n = makeSeq(song({ quantize: 'now' }));
  n.run(4700);
  const r = n.seq.signal('go');
  assert.ok(Math.abs(r.at - n.seq.getCurrentTime()) < 1);
  n.run(300);
  assert.equal(n.notes().slice(-1)[0], 64);
});

test('a part shorter than a bar line leaves at the end of the part, not at a bar line it never reaches', () => {
  // part a is 3 beats (1500 ms), bars are 2000 ms: the wait at 1500 wraps before bar 2
  const seq = [part('a', 0), on(0, 60), off(400, 60), on(1000, 62), off(1400, 62),
    wait(1500), part('b', 1500), on(1500, 64), off(1900, 64), { time: 4000, message: [SEQ_MSG_LOOP] }];
  const s = makeSeq(seq);
  s.run(1500 + 700);   // looping; 700 ms into pass 2
  const r = s.seq.signal('go');
  assert.equal(r.at, 1500, 'clamped to the loop end');
  s.run(1000);
  assert.deepEqual(s.notes(), [60, 62, 60, 62, 64]);   // the rest of the part plays, then b
});

test("loop: 'hold' freezes the clock; the signal resumes at once", () => {
  const s = makeSeq(song({ loop: 'hold' }));
  s.run(6000);
  assert.deepEqual(s.notes(), [60, 62]);
  assert.equal(s.seq.waitingForSignal, 'go');
  assert.ok(Math.abs(s.seq.getCurrentTime() - 4000) < 5, 'clock held at the wait (one 128-frame block of slack)');
  assert.equal(s.seq.signal('go').resumed, true);
  assert.equal(s.seq.waitingForSignal, null);
  s.run(500);
  assert.deepEqual(s.notes(), [60, 62, 64]);
});

test('kiosk timeout: after `bars` of looping the wait signals itself, to its goTo part', () => {
  const s = makeSeq(song({ timeout: { bars: 1, goTo: 'c' } }));
  s.run(4000 + 2000 + 1000);   // pass 1, one bar of looping, then the jump at the next bar line (clock jumps 2 s)
  assert.deepEqual(s.notes(), [60, 62, 60, 67]);
});

test('a targeted signal outside any wait jumps at the current part\'s next bar line', () => {
  const s = makeSeq(song());
  s.run(700);    // in part a, bar 1
  const r = s.seq.signal('goto', 'b');
  assert.equal(r.at, 2000);
  s.run(1500);
  assert.deepEqual(s.notes(), [60, 64]);
  assert.deepEqual(s.seq.signal('goto', 'zzz'), { unknownPart: 'zzz' });
});

test('leaving performance mode while looping plays on; a live recompile re-enters the wait when reached', () => {
  const s = makeSeq(song());
  s.run(5000);
  s.seq.setPerformanceMode(false);
  s.run(6000);
  assert.ok(s.notes().includes(64) && s.notes().includes(67));
  const t = makeSeq(song());
  t.run(5000);
  t.seq.setSequenceData(song());   // hot-swap while looping: position kept, wait re-armed on reach
  assert.equal(t.seq.wait, null);
  t.run(4000);
  assert.ok(!t.notes().includes(64), 'looping again after the swap');
});

test('a part whose marker shares its time with the previous wait loops from the marker, not into that wait', () => {
  // a | wait | b | wait | c — the docs' pattern: every part after the first
  // starts at the same time as the wait closing the one before it.
  const seq = [
    part('a', 0), on(0, 60), off(400, 60),
    wait(2000, { partStart: 0 }),
    part('b', 2000), on(2000, 64), off(2400, 64), on(3000, 65), off(3400, 65),
    wait(4000, { partStart: 2000 }),
    part('c', 4000), on(4000, 67), off(4400, 67),
    { time: 6000, message: [SEQ_MSG_LOOP] },
  ];
  const s = makeSeq(seq);
  s.run(2500);                  // a, then its wait wraps it: 60 twice
  s.seq.signal('go');           // leave a at its loop end — b starts from its own marker
  s.run(4500);                  // b plays (64, 65) and wraps: 64 again
  assert.deepEqual(s.notes(), [60, 60, 64, 65, 64]);
  assert.ok(s.seq.getCurrentTime() > 2100, 'the clock keeps running while b loops (it froze at the wait before)');
  assert.ok(!s.notes().includes(67), 'still looping b');
  s.seq.signal('go');
  s.run(2500);
  assert.equal(s.notes().slice(-1)[0], 67);
});

test('a jump reports itself through onJump (the processor silences held notes); a loop wrap does not', () => {
  const s = makeSeq(song());
  let jumps = 0;
  s.seq.onJump = () => jumps++;
  s.run(6500);              // pass 1 and a wrap
  assert.equal(jumps, 0, 'a loop wrap is not a jump');
  s.seq.signal('go');
  s.run(2500);              // left a for b at the bar line
  assert.equal(jumps, 1);
  s.seq.signal('goto', 'a');   // targeted jump outside a wait
  s.run(2500);
  assert.equal(jumps, 2);
  const d = makeSeq(song({ default: 'c' }), { performance: false });
  let inertJumps = 0;
  d.seq.onJump = () => inertJumps++;
  d.run(4500);
  assert.equal(inertJumps, 1, 'an inert default-to-part seek is a jump too');
});
