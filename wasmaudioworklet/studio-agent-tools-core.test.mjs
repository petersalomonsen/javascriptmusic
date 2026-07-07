import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyEditToText, grepText, normDsp, faustRegistrationHint } from './studio-agent-tools-core.js';

test('applyEditToText: unique replace', () => {
  assert.deepEqual(applyEditToText('a b c', { old_string: 'b', new_string: 'X' }), { text: 'a X c', count: 1 });
});
test('applyEditToText: not found → error', () => {
  assert.match(applyEditToText('abc', { old_string: 'z', new_string: 'y' }).error, /not found/);
});
test('applyEditToText: non-unique without replace_all → error', () => {
  assert.match(applyEditToText('x x x', { old_string: 'x', new_string: 'y' }).error, /not unique \(3/);
});
test('applyEditToText: replace_all replaces every occurrence', () => {
  assert.deepEqual(applyEditToText('x x x', { old_string: 'x', new_string: 'y', replace_all: true }), { text: 'y y y', count: 3 });
});
test('applyEditToText: identical old/new → error', () => {
  assert.match(applyEditToText('a', { old_string: 'a', new_string: 'a' }).error, /identical/);
});

test('grepText: reports 1-indexed line numbers', () => {
  assert.equal(grepText('foo\nbar\nbaz', { pattern: 'ba' }), '2: bar\n3: baz');
});
test('grepText: includes context lines', () => {
  assert.equal(grepText('a\nHIT\nc', { pattern: 'HIT', context: 1 }), '1: a\n2: HIT\n3: c');
});
test('grepText: no matches', () => {
  assert.equal(grepText('a\nb', { pattern: 'zzz' }), '(no matches)');
});
test('grepText: invalid regex → error', () => {
  assert.match(grepText('a', { pattern: '(' }).error, /bad regex/);
});

test('normDsp: adds .dsp and strips faust/ prefix', () => {
  assert.equal(normDsp('bass'), 'bass.dsp');
  assert.equal(normDsp('faust/lead.dsp'), 'lead.dsp');
});

test('faustRegistrationHint: instrument WITH a channel class uses it', () => {
  const ts = 'export class Pad extends MidiVoice {}\nexport class PadChannel extends MidiChannel {}';
  const h = faustRegistrationHint(ts, 'pad');
  assert.deepEqual(h.classes, ['Pad', 'PadChannel']);
  assert.match(h.message, /new PadChannel\(8/);
});
test('faustRegistrationHint: instrument WITHOUT a channel class uses base MidiChannel (regression for TS2305)', () => {
  const ts = 'export class Bass extends MidiVoice {}';
  const h = faustRegistrationHint(ts, 'bass');
  assert.deepEqual(h.classes, ['Bass']);
  assert.match(h.message, /new MidiChannel\(8, \(channel: MidiChannel\) => new Bass/);
  assert.doesNotMatch(h.message, /new BassChannel/);          // must NOT instantiate a phantom channel class
  assert.doesNotMatch(h.message, /import \{ Bass, BassChannel \}/); // must NOT import one either
});
