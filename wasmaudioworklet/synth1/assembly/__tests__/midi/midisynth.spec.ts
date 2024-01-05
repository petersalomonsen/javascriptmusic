import { samplebuffer, sampleBufferFrames, playActiveVoices, cleanupInactiveVoices, shortmessage, activeVoices, MidiVoice, midichannels, MidiChannel, numActiveVoices, fillSampleBuffer, allNotesOff, getActiveVoicesStatusSnapshot } from '../../midi/midisynth';
import { SineOscillator } from '../../synth/sineoscillator.class';
import { Envelope, EnvelopeState } from '../../synth/envelope.class';
import { notefreq } from '../../synth/note';
import { SAMPLERATE } from '../../environment';
import { Pan } from '../../synth/pan.class';

let signal: f32 = 0;

midichannels[1] = midichannels[0];

class TestMidiInstrument extends MidiVoice {
  osc: SineOscillator = new SineOscillator();
  env: Envelope = new Envelope(0.1, 0.0, 1.0, 0.1);

  noteon(note: u8, velocity: u8): void {
    super.noteon(note, velocity);
    this.osc.frequency = notefreq(note);
    this.env.attack();
  }

  noteoff(): void {
    this.env.release();
  }

  isDone(): boolean {
    return this.env.isDone();
  }

  nextframe(): void {
    signal += this.osc.next() * this.env.next();
  }
}

class ShortReleaseMidiInstrument extends MidiVoice {
  osc: SineOscillator = new SineOscillator();
  env: Envelope = new Envelope(0.1, 0.0, 1.0, 0.000001);

  noteon(note: u8, velocity: u8): void {
    super.noteon(note, velocity);
    this.osc.frequency = notefreq(note);
    this.env.attack();
  }

  noteoff(): void {
    this.env.release();
  }

  isDone(): boolean {
    return this.env.isDone();
  }

  nextframe(): void {
    signal += this.osc.next() * this.env.next();
  }
}
class LongReleaseInstrument extends MidiVoice {
  osc: SineOscillator = new SineOscillator();
  env: Envelope = new Envelope(0.05, 0.0, 1.0, 10.0);

  noteon(note: u8, velocity: u8): void {
    super.noteon(note, velocity);
    this.osc.frequency = notefreq(note);
    this.env.attack();
  }

  noteoff(): void {
    this.env.release();
  }

  isDone(): boolean {
    return this.env.isDone();
  }

  nextframe(): void {
    signal = this.osc.next() * this.env.next() * this.velocity / 256;
  }
}

class FlatSignalVoice extends MidiVoice {
  nextframe(): void {
    this.channel.signal.add(1.0, 1.0);
  }
}

class ClipVoice extends MidiVoice {
  nextframe(): void {
    this.channel.signal.add(10.0, -10.0);
  }
}
class FlatVoiceMidiChannel extends MidiChannel {
  preprocess(): void {
    this.signal.left *= 0.5;
    this.signal.right *= 0.5;
  }
}

class LowerKeys extends MidiVoice {
  constructor(channel: MidiChannel) {
    super(channel);
    this.maxnote = 63;
  }

  nextframe(): void {
    this.channel.signal.add(0.6, -0.6);
  }
}

class UpperKeys extends MidiVoice {
  constructor(channel: MidiChannel) {
    super(channel);
    this.minnote = 64;
  }

  nextframe(): void {
    this.channel.signal.add(-0.6, 0.6);
  }
}

describe("midisynth", () => {
  it("should activate and deactivate one midivoice", () => {
    const channel = midichannels[0] = new MidiChannel(1, (channel: MidiChannel) => new TestMidiInstrument(channel));
    const availableVoice = channel.voices[0];

    midichannels[0] = channel;

    expect<MidiVoice | null>(activeVoices[0]).toBe(null, 'should be no active voices');
    shortmessage(0x90, 69, 100);

    expect<MidiVoice | null>(activeVoices[0]).toBe(availableVoice, 'should be one active voice');

    const activeVoice: TestMidiInstrument = activeVoices[0] as TestMidiInstrument;
    expect<i32>(activeVoice.note).toBe(69, "note is 69");
    expect<i32>(activeVoice.velocity).toBe(100, "velocity is 100");
    expect<f32>(activeVoice.osc.frequency).toBe(440, "frequency is 440");

    expect<EnvelopeState>(activeVoice.env.state).toBe(EnvelopeState.ATTACK);
    let attackFrameCount = 0;
    while (activeVoice.env.state === EnvelopeState.ATTACK) {
      playActiveVoices();
      attackFrameCount++;
    }
    cleanupInactiveVoices();
    expect<f32>(attackFrameCount as f32 / SAMPLERATE).toBeCloseTo(0.1 as f32);
    expect<EnvelopeState>(activeVoice.env.state).toBe(EnvelopeState.DECAY);

    // note off
    shortmessage(0x90, 69, 0);
    expect<EnvelopeState>(activeVoice.env.state).toBe(EnvelopeState.RELEASE);
    let releaseFrameCount = 0;
    while (activeVoice.env.state === EnvelopeState.RELEASE) {
      expect<MidiVoice | null>(activeVoices[0]).toBe(availableVoice, 'voice should be active as long as it is in the release state');
      playActiveVoices();
      releaseFrameCount++;
    }

    cleanupInactiveVoices();
    expect<EnvelopeState>(activeVoice.env.state).toBe(EnvelopeState.DONE);
    expect<f32>(releaseFrameCount as f32 / SAMPLERATE).toBeCloseTo(0.1 as f32);
    expect<i32>(activeVoice.activeVoicesIndex).toBe(-1);
    expect<MidiVoice | null>(activeVoices[0]).toBe(null, 'should be no active voices');
  });
  it("should keep a list of active voices without holes when adding/removing multiple voices", () => {
    const channel = midichannels[0] = new MidiChannel(3, (channel: MidiChannel) => new TestMidiInstrument(channel));

    expect<i32>(numActiveVoices).toBe(0);

    shortmessage(0x90, 69, 100);
    shortmessage(0x90, 72, 100);
    shortmessage(0x90, 76, 100);

    expect<i32>(numActiveVoices).toBe(3);
    expect<MidiVoice | null>(activeVoices[0]).toBe(channel.voices[0], 'voice 1 should be active');
    expect<MidiVoice | null>(activeVoices[1]).toBe(channel.voices[1], 'voice 2 should be active');
    expect<MidiVoice | null>(activeVoices[2]).toBe(channel.voices[2], 'voice 3 should be active');

    shortmessage(0x90, 72, 0);
    while ((activeVoices[1] as TestMidiInstrument).env.state !== EnvelopeState.DONE) {
      playActiveVoices();
      expect<MidiVoice | null>(activeVoices[1]).toBe(channel.voices[1], 'voice 2 should be active');
    }

    cleanupInactiveVoices();
    expect<i32>(numActiveVoices).toBe(2);
    expect<MidiVoice | null>(activeVoices[0]).toBe(channel.voices[0], 'voice 1 should be active');
    expect<MidiVoice | null>(activeVoices[1]).toBe(channel.voices[2], 'voice 3 should be active');

    shortmessage(0x90, 73, 100);
    cleanupInactiveVoices();

    expect<i32>(numActiveVoices).toBe(3);
    expect<MidiVoice | null>(activeVoices[0]).toBe(channel.voices[0], 'voice 1 should be active');
    expect<MidiVoice | null>(activeVoices[1]).toBe(channel.voices[2], 'voice 3 should be active');
    expect<MidiVoice | null>(activeVoices[2]).toBe(channel.voices[1], 'voice 2 should be active');

    shortmessage(0x90, 69, 0);
    cleanupInactiveVoices();

    while ((activeVoices[0] as TestMidiInstrument).env.state !== EnvelopeState.DONE) {
      playActiveVoices();
    }
    cleanupInactiveVoices();
    expect<i32>(numActiveVoices).toBe(2);
    expect<MidiVoice | null>(activeVoices[0]).toBe(channel.voices[2], 'voice 3 should be active');
    expect<MidiVoice | null>(activeVoices[1]).toBe(channel.voices[1], 'voice 2 should be active');

    shortmessage(0x90, 73, 0);
    shortmessage(0x90, 76, 0);
    while (
      (activeVoices[0] as TestMidiInstrument).env.state !== EnvelopeState.DONE ||
      (activeVoices[1] as TestMidiInstrument).env.state !== EnvelopeState.DONE) {
      playActiveVoices();
    }
    cleanupInactiveVoices();

    expect<i32>(numActiveVoices).toBe(0, 'should be no active voices');
    expect<MidiVoice | null>(activeVoices[0]).toBe(null, 'voice 1 should be inactive');
    expect<MidiVoice | null>(activeVoices[1]).toBe(null, 'voice 2 should be inactive');
    expect<MidiVoice | null>(activeVoices[2]).toBe(null, 'voice 3 should be inactive');

  });
  it("should not activate more than one voice for a note (per channel)", () => {
    const channel = midichannels[0] = new MidiChannel(3, (channel: MidiChannel) => new TestMidiInstrument(channel));

    midichannels[0] = channel;

    expect<i32>(numActiveVoices).toBe(0);

    shortmessage(0x90, 69, 100);
    shortmessage(0x90, 69, 100);
    shortmessage(0x90, 69, 100);

    expect<i32>(numActiveVoices).toBe(1, 'should be only one active voice');
    expect<MidiVoice | null>(activeVoices[0]).toBe(channel.voices[0], 'voice 1 should be active');
    expect<MidiVoice | null>(activeVoices[1]).toBe(null, 'voice 2 should be inactive');
    expect<MidiVoice | null>(activeVoices[2]).toBe(null, 'voice 3 should be inactive');

    while (
      (activeVoices[0] as TestMidiInstrument).env.state !== EnvelopeState.DECAY) {
      playActiveVoices();
    }
    shortmessage(0x80, 69, 0);
    expect<EnvelopeState>((activeVoices[0] as TestMidiInstrument).env.state).toBe(EnvelopeState.RELEASE);
    expect<i32>(numActiveVoices).toBe(1, 'should be one active voice');
    shortmessage(0x90, 69, 80);
    expect<EnvelopeState>((activeVoices[0] as TestMidiInstrument).env.state).toBe(EnvelopeState.ATTACK);
    while (
      (activeVoices[0] as TestMidiInstrument).env.state !== EnvelopeState.DECAY) {
      playActiveVoices();
    }
    expect<EnvelopeState>((activeVoices[0] as TestMidiInstrument).env.state).toBe(EnvelopeState.DECAY);
    shortmessage(0x80, 69, 0);
    while (
      (activeVoices[0] as TestMidiInstrument).env.state !== EnvelopeState.DONE) {
      playActiveVoices();
    }
    cleanupInactiveVoices();
    expect<i32>(numActiveVoices).toBe(0, 'should be no active voices');
  });
  it("should produce sound", () => {
    fillSampleBuffer();
    for (let n = 0; n < samplebuffer.length; n++) {
      expect<f32>(samplebuffer[n]).toBe(0);
    }
    shortmessage(0x91, 69, 100);

    expect<i32>(numActiveVoices).toBe(1, 'should be one active voice');

    fillSampleBuffer();
    for (let n = 1; n < samplebuffer.length; n++) {
      expect<f32>(samplebuffer[n]).not.toBe(samplebuffer[n - 1], 'signal should be changing');
    }

    shortmessage(0x91, 69, 0);

    while (
      numActiveVoices > 0) {
      fillSampleBuffer();
    }

    for (let n = 0; n < samplebuffer.length; n++) {
      expect<f32>(samplebuffer[n]).toBe(0, 'signal should be quiet');
    }
  });
  it("should be able to turn voices on and off without waiting for release when there is only one available voice", () => {
    const channel = midichannels[0] = new MidiChannel(1, (channel: MidiChannel) => new TestMidiInstrument(channel));

    midichannels[0] = channel;
    shortmessage(0x90, 69, 100);

    expect<i32>(numActiveVoices).toBe(1, 'should be one active voice');
    fillSampleBuffer();
    fillSampleBuffer();

    shortmessage(0x90, 69, 0);
    shortmessage(0x90, 71, 100);
    expect<u8>((activeVoices[0] as MidiVoice).note).toBe(71, 'should be the second note');
    fillSampleBuffer();
    fillSampleBuffer();

    shortmessage(0x90, 71, 0);
    shortmessage(0x90, 73, 100);
    expect<u8>((activeVoices[0] as MidiVoice).note).toBe(73, 'should still be the third note');

    fillSampleBuffer();
    shortmessage(0x90, 73, 0);
    while (
      (activeVoices[0] as TestMidiInstrument).env.state !== EnvelopeState.DONE) {
      fillSampleBuffer();
    }
    fillSampleBuffer();
    expect<i32>(numActiveVoices).toBe(0, 'should be no active voices after release');
  });
  it("should take over the oldest voice if all voices for a channel are active", () => {
    const channel = midichannels[0] = new MidiChannel(3, (channel: MidiChannel) => new TestMidiInstrument(channel));

    midichannels[0] = channel;
    shortmessage(0x90, 69, 100);

    expect<i32>(numActiveVoices).toBe(1, 'should be one active voice');
    fillSampleBuffer();
    fillSampleBuffer();


    shortmessage(0x90, 71, 100);
    expect<i32>(numActiveVoices).toBe(2, 'should be two active voices');
    expect<u8>((activeVoices[0] as MidiVoice).note).toBe(69, 'voice 1 should be the first note');
    expect<u8>((activeVoices[1] as MidiVoice).note).toBe(71, 'voice 2 should be the second note');
    fillSampleBuffer();

    shortmessage(0x90, 73, 100);
    expect<i32>(numActiveVoices).toBe(3, 'should be three active voices');
    expect<u8>((activeVoices[0] as MidiVoice).note).toBe(69, 'voice 1 should be the first note');
    expect<u8>((activeVoices[1] as MidiVoice).note).toBe(71, 'voice 2 should be the second note');
    expect<u8>((activeVoices[2] as MidiVoice).note).toBe(73, 'voice 3 should be the third note');
    fillSampleBuffer();

    shortmessage(0x90, 75, 100);
    expect<u8>((activeVoices[0] as MidiVoice).note).toBe(75, 'voice 1 should be the fourth note');
    expect<u8>((activeVoices[1] as MidiVoice).note).toBe(71, 'voice 2 should be the second note');
    expect<u8>((activeVoices[2] as MidiVoice).note).toBe(73, 'voice 3 should be the third note');
    fillSampleBuffer();

    shortmessage(0x90, 77, 100);
    expect<u8>((activeVoices[0] as MidiVoice).note).toBe(75, 'voice 1 should be the fourth note');
    expect<u8>((activeVoices[1] as MidiVoice).note).toBe(77, 'voice 2 should be the fifth note');
    expect<u8>((activeVoices[2] as MidiVoice).note).toBe(73, 'voice 3 should be the second note');
    fillSampleBuffer();

    shortmessage(0x90, 79, 100);
    expect<u8>((activeVoices[0] as MidiVoice).note).toBe(75, 'voice 1 should be the fourth note');
    expect<u8>((activeVoices[1] as MidiVoice).note).toBe(77, 'voice 2 should be the fifth note');
    expect<u8>((activeVoices[2] as MidiVoice).note).toBe(79, 'voice 3 should be the sixth note');
    fillSampleBuffer();

    shortmessage(0x90, 81, 100);
    expect<u8>((activeVoices[0] as MidiVoice).note).toBe(81, 'voice 1 should be the seventh note');
    expect<u8>((activeVoices[1] as MidiVoice).note).toBe(77, 'voice 2 should be the fifth note');
    expect<u8>((activeVoices[2] as MidiVoice).note).toBe(79, 'voice 3 should be the sixth note');
    fillSampleBuffer();

    shortmessage(0x90, 81, 0);
    shortmessage(0x90, 77, 0);
    shortmessage(0x90, 79, 0);

    while (
      (activeVoices[0] as TestMidiInstrument).env.state !== EnvelopeState.DONE) {
      fillSampleBuffer();
    }
    fillSampleBuffer();
    expect<i32>(numActiveVoices).toBe(0, 'should be no active voices after release');
  });
  it("should play all the notes being passed to a long release instrument", () => {
    midichannels[0] = new MidiChannel(2, (channel: MidiChannel) => new LongReleaseInstrument(channel));

    for (let n = 1; n < 126; n++) {
      const note: u8 = n as u8;

      shortmessage(0x90, note, 100);
      let noteVoice: LongReleaseInstrument | null = null;

      for (let voiceIndex = 0; voiceIndex < numActiveVoices; voiceIndex++) {
        if ((activeVoices[voiceIndex] as MidiVoice).note === note) {
          noteVoice = activeVoices[voiceIndex] as LongReleaseInstrument;
        }
      }

      if (noteVoice) {
        expect<EnvelopeState>(noteVoice.env.state).toBe(EnvelopeState.ATTACK, 'expected note to be triggered');

        while (noteVoice.env.state === EnvelopeState.ATTACK) {
          fillSampleBuffer();
        }

        shortmessage(0x80, note, 0);
        fillSampleBuffer();
        expect<EnvelopeState>(noteVoice.env.state).toBe(EnvelopeState.RELEASE, 'expected note to be released');
      }
      expect(noteVoice).not.toBeNull();
    }
  });
  it("should deactivate all voices after all notes off", () => {
    midichannels[0] = new MidiChannel(60, (channel: MidiChannel) => new LongReleaseInstrument(channel));

    for (let n = 1; n < 127; n++) {
      const note: u8 = n as u8;

      shortmessage(0x90, note, 100);
    }
    expect<i32>(numActiveVoices).toBe(activeVoices.length, 'all voices should be active');

    allNotesOff();
    expect<i32>(numActiveVoices).toBe(activeVoices.length, 'all voices should be active before release');

    while (numActiveVoices > 0) {
      fillSampleBuffer();
    }

    expect<i32>(numActiveVoices).toBe(0, 'all voices should be deactivated after release');
  });
  it("should sustain notes on a channel", () => {
    midichannels[0] = midichannels[0] = new MidiChannel(20, (channel: MidiChannel) => new TestMidiInstrument(channel));

    for (let n = 1; n < 11; n++) {
      const note: u8 = n as u8;
      shortmessage(0x90, note, 100);
    }
    fillSampleBuffer();
    shortmessage(0xb0, 64, 127); // sustain control change

    expect<i32>(numActiveVoices).toBe(10, 'should be active voices');
    expect<u8>(midichannels[0].controllerValues[64]).toBe(127);

    fillSampleBuffer();

    for (let n = 1; n < 11; n++) {
      const note: u8 = n as u8;
      shortmessage(0x90, note, 0); // all notes off
    }

    fillSampleBuffer();

    for (let n = 1; n < 11; n++) {
      const note: u8 = n as u8;
      expect<MidiVoice | null>(midichannels[0].sustainedVoices[n]).not.toBe(null);
    }

    for (let n = 0; n < numActiveVoices; n++) {
      expect<EnvelopeState>((activeVoices[n] as TestMidiInstrument).env.state)
        .not.toBe(EnvelopeState.RELEASE, 'notes should not be in release');
    }

    fillSampleBuffer();
    shortmessage(0x90, 10, 100); // reactivate note 10, and expect it not to be released
    expect<MidiVoice | null>(midichannels[0].sustainedVoices[10]).toBe(null);

    shortmessage(0xb0, 64, 0); // release all held by sustain
    expect<u8>(midichannels[0].controllerValues[64]).toBe(0);
    for (let n = 1; n < 11; n++) {
      const note: u8 = n as u8;
      expect<MidiVoice | null>(midichannels[0].sustainedVoices[n]).toBe(null);
    }

    expect<i32>(numActiveVoices).toBe(10, 'should be active voices');

    for (let n = 0; n < numActiveVoices - 1; n++) {
      expect<EnvelopeState>((activeVoices[n] as TestMidiInstrument).env.state)
        .toBe(EnvelopeState.RELEASE, 'notes should be in release');
    }
    expect<EnvelopeState>((activeVoices[numActiveVoices - 1] as TestMidiInstrument).env.state)
      .toBe(EnvelopeState.ATTACK, 'one note should be in attack');

    while (numActiveVoices > 1) {
      fillSampleBuffer();
    }

    expect<i32>(numActiveVoices).toBe(1, 'all voices but one should be deactivated after release');

    while ((activeVoices[0] as TestMidiInstrument).env.state !== EnvelopeState.SUSTAIN) {
      fillSampleBuffer();
    }

    expect<EnvelopeState>((activeVoices[0] as TestMidiInstrument).env.state)
      .toBe(EnvelopeState.SUSTAIN, 'one note should be in sustain');

    shortmessage(0xb0, 64, 127); // sustain control change
    shortmessage(0x90, 10, 0); // note 10 off, and expect it to be sustained
    fillSampleBuffer();

    expect<EnvelopeState>((activeVoices[0] as TestMidiInstrument).env.state)
      .toBe(EnvelopeState.SUSTAIN, 'one note should be in sustain');

    shortmessage(0xb0, 64, 0); // release sustained

    while (numActiveVoices > 0) {
      fillSampleBuffer();
    }

    expect<i32>(numActiveVoices).toBe(0, 'all voices should be deactivated after release');
  });
  it("should handle midi volume control change", () => {
    midichannels[0] = new MidiChannel(1, (channel: MidiChannel) => new FlatSignalVoice(channel));
    shortmessage(0x90, 64, 127);
    fillSampleBuffer();

    const pan = new Pan();
    expect<f32>(samplebuffer[0]).toBe(NativeMathf.pow(10, 40 * NativeMathf.log10(100 / 127) / 20) * pan.leftLevel);
    expect<f32>(samplebuffer[sampleBufferFrames]).toBeCloseTo(NativeMathf.pow(10, 40 * NativeMathf.log10(100 / 127) / 20) * pan.rightLevel);

    shortmessage(0xb0, 7, 127);
    fillSampleBuffer();
    expect<f32>(samplebuffer[0]).toBe(1 * pan.leftLevel);
    expect<f32>(samplebuffer[sampleBufferFrames]).toBeCloseTo(1 * pan.rightLevel);

    shortmessage(0xb0, 7, 64);
    fillSampleBuffer();
    expect<f32>(samplebuffer[0]).toBe(NativeMathf.pow(10, 40 * NativeMathf.log10(64 / 127) / 20) * pan.leftLevel);
    expect<f32>(samplebuffer[sampleBufferFrames]).toBeCloseTo(NativeMathf.pow(10, 40 * NativeMathf.log10(64 / 127) / 20) * pan.rightLevel);

    shortmessage(0xb0, 7, 32);
    fillSampleBuffer();
    expect<f32>(samplebuffer[0]).toBe(NativeMathf.pow(10, 40 * NativeMathf.log10(32 / 127) / 20) * pan.leftLevel);
    expect<f32>(samplebuffer[sampleBufferFrames]).toBeCloseTo(NativeMathf.pow(10, 40 * NativeMathf.log10(32 / 127) / 20) * pan.rightLevel);
  });
  it("should handle midi pan control change", () => {
    midichannels[0] = new MidiChannel(1, (channel: MidiChannel) => new FlatSignalVoice(channel));

    shortmessage(0x90, 10, 127);
    shortmessage(0xb0, 7, 127);
    shortmessage(0xb0, 10, 0);
    fillSampleBuffer();
    expect<f32>(samplebuffer[0]).toBeCloseTo(1.0);
    expect<f32>(samplebuffer[sampleBufferFrames]).toBeCloseTo(0.0);

    shortmessage(0xb0, 10, 127);
    fillSampleBuffer();
    expect<f32>(samplebuffer[0]).toBeCloseTo(0.0);
    expect<f32>(samplebuffer[sampleBufferFrames]).toBeCloseTo(1.0);

    shortmessage(0xb0, 10, 64);
    fillSampleBuffer();
    expect<f32>(samplebuffer[0]).toBeCloseTo(NativeMathf.sqrt(1 / 2));
    expect<f32>(samplebuffer[sampleBufferFrames]).toBeCloseTo(NativeMathf.sqrt(1 / 2));
  });
  it("channel preprocess", () => {
    midichannels[0] = new FlatVoiceMidiChannel(1, (channel: MidiChannel) => new FlatSignalVoice(channel));
    shortmessage(0xb0, 7, 127);
    shortmessage(0x90, 10, 127);

    fillSampleBuffer();
    expect<f32>(samplebuffer[0]).toBeCloseTo(NativeMathf.sqrt(1 / 2) / 2);

  });
  it("global postprocess", () => {
    midichannels[0] = new MidiChannel(1, (channel: MidiChannel) => new ClipVoice(channel));

    shortmessage(0x90, 10, 127);

    fillSampleBuffer();

    expect<f32>(samplebuffer[0]).toBeCloseTo(1);
    expect<f32>(samplebuffer[sampleBufferFrames]).toBeCloseTo(-1);
  });
  it("should be able to use multiple different voices for channel", () => {
    midichannels[0] = new MidiChannel(2, (ch, n) => {
      switch (n) {
        case 0:
          return new LowerKeys(ch);
        default:
          return new UpperKeys(ch);
      }
    });

    shortmessage(0x90, 10, 127);
    shortmessage(0xb0, 7, 127);

    fillSampleBuffer();

    expect<f32>(samplebuffer[0]).toBeCloseTo(0.6 * NativeMathf.sqrt(1 / 2));
    expect<f32>(samplebuffer[sampleBufferFrames]).toBeCloseTo(-0.6 * NativeMathf.sqrt(1 / 2));

    shortmessage(0x90, 10, 0);
    shortmessage(0x90, 64, 127);

    fillSampleBuffer();
    fillSampleBuffer();

    expect<f32>(samplebuffer[0]).toBeCloseTo(-0.6 * NativeMathf.sqrt(1 / 2));
    expect<f32>(samplebuffer[sampleBufferFrames]).toBeCloseTo(0.6 * NativeMathf.sqrt(1 / 2));

    shortmessage(0x90, 65, 127);

    fillSampleBuffer();
    fillSampleBuffer();

    expect<f32>(samplebuffer[0]).toBeCloseTo(-0.6 * NativeMathf.sqrt(1 / 2));
    expect<f32>(samplebuffer[sampleBufferFrames]).toBeCloseTo(0.6 * NativeMathf.sqrt(1 / 2));
    allNotesOff();
    while (activeVoices[0] != null) {
      fillSampleBuffer();
    }
  });
  it("should provide shapshot of active voices", () => {
    midichannels[0] = new MidiChannel(1, (channel: MidiChannel) => new ShortReleaseMidiInstrument(channel));
    midichannels[1] = new MidiChannel(2, (channel: MidiChannel) => new ShortReleaseMidiInstrument(channel));

    expect<MidiVoice | null>(activeVoices[0]).toBe(null, 'should be no active voices');
    shortmessage(0x90, 69, 100);

    const activeVoicesShapshotLocation = changetype<usize>(getActiveVoicesStatusSnapshot());
    expect<u8>(load<u8>(activeVoicesShapshotLocation)).toBe(0, "channel is 0");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 1)).toBe(69, "note is 69");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 2)).toBe(100, "velocity is 100");

    // note off
    shortmessage(0x90, 69, 0);
    fillSampleBuffer();
    fillSampleBuffer();
    getActiveVoicesStatusSnapshot();
    expect<u8>(load<u8>(activeVoicesShapshotLocation)).toBe(0, "channel is 0");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 1)).toBe(0, "note is 0");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 2)).toBe(0, "velocity is 0");

    shortmessage(0x90, 69, 100);

    shortmessage(0x91, 69, 100);
    shortmessage(0x91, 70, 101);

    getActiveVoicesStatusSnapshot();
    expect<u8>(load<u8>(activeVoicesShapshotLocation)).toBe(0, "channel is 0");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 1)).toBe(69, "note is 69");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 2)).toBe(100, "velocity is 100");

    expect<u8>(load<u8>(activeVoicesShapshotLocation + 3)).toBe(1, "channel is 1");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 4)).toBe(69, "note is 69");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 5)).toBe(100, "velocity is 100");

    expect<u8>(load<u8>(activeVoicesShapshotLocation + 6)).toBe(1, "channel is 1");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 7)).toBe(70, "note is 70");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 8)).toBe(101, "velocity is 101");

    allNotesOff();
    fillSampleBuffer();
    fillSampleBuffer();

    getActiveVoicesStatusSnapshot();
    expect<u8>(load<u8>(activeVoicesShapshotLocation)).toBe(0);
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 1)).toBe(0, "note 0 should be 0");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 2)).toBe(0, "vel 0 should be 0");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 3)).toBe(0, "ch 1 should be 0");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 4)).toBe(0, "note 1 should be 0");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 5)).toBe(0, "vel 1 should be 0");
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 6)).toBe(0);
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 7)).toBe(0);
    expect<u8>(load<u8>(activeVoicesShapshotLocation + 8)).toBe(0);
  });
});  