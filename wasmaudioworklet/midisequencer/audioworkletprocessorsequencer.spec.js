import { AudioWorkletProcessorSequencerModule } from './audioworkletprocessorsequencer.js';
import { SEQ_MSG_LOOP, SEQ_MSG_STOP_RECORDING } from './sequenceconstants.js';

// Drive the worklet-side sequencer outside an AudioWorklet: it only needs
// the AudioWorkletGlobalScope object it registers itself on and a sampleRate.
function createSequencer(sequence) {
    globalThis.AudioWorkletGlobalScope = {};
    globalThis.sampleRate = 44100;
    AudioWorkletProcessorSequencerModule();
    const seq = AudioWorkletGlobalScope.midisequencer;
    const fired = [];
    seq.midireceiver = (a, b, c) => fired.push({ message: [a, b, c], time: Math.round(seq.getCurrentTime()) });
    seq.setSequenceData(sequence);
    return { seq, fired };
}

// Run 128-frame blocks until the sequencer wraps to frame 0, or give up.
function playUntilLoop(seq, maxMillis) {
    for (let n = 0; n * 128 / sampleRate * 1000 < maxMillis; n++) {
        const before = seq.currentFrame;
        seq.onprocess();
        if (seq.currentFrame < before) {
            return true;
        }
    }
    return false;
}

describe('audioworkletprocessorsequencer', function () {
    it('should loop when a recording marker is followed by a gap before loopHere', () => {
        // stopRecording(); await waitDuration(4); loopHere();  (4 beats @ 125 bpm = 1920 ms)
        const { seq, fired } = createSequencer([
            { time: 0, message: [0x90, 60, 100] },
            { time: 500, message: [0x80, 60, 0] },
            { time: 1000, message: [SEQ_MSG_STOP_RECORDING] },
            { time: 2920, message: [SEQ_MSG_LOOP] },
        ]);
        assert.isTrue(playUntilLoop(seq, 5000), 'song should loop at the loop marker');
        assert.deepEqual(fired.map(f => f.message), [[0x90, 60, 100], [0x80, 60, 0]],
            'the loop marker must not be sent to the synth as a midi message');
        assert.isFalse(seq.recordingActive);
    });

    it('should not fire a note early when it follows a recording marker after a gap', () => {
        const { seq, fired } = createSequencer([
            { time: 1000, message: [SEQ_MSG_STOP_RECORDING] },
            { time: 1960, message: [0x90, 60, 100] },
            { time: 2200, message: [0x80, 60, 0] },
            { time: 2920, message: [SEQ_MSG_LOOP] },
        ]);
        assert.isTrue(playUntilLoop(seq, 5000));
        assert.equal(fired.length, 2);
        assert.closeTo(fired[0].time, 1960, 5, 'note on should fire at its own time, not at the marker');
        assert.closeTo(fired[1].time, 2200, 5);
    });

    it('should still loop when the marker and loopHere share a timestamp', () => {
        const { seq, fired } = createSequencer([
            { time: 0, message: [0x90, 60, 100] },
            { time: 1000, message: [SEQ_MSG_STOP_RECORDING] },
            { time: 1000, message: [SEQ_MSG_LOOP] },
        ]);
        assert.isTrue(playUntilLoop(seq, 3000));
        assert.equal(fired.length, 1);
    });
});
