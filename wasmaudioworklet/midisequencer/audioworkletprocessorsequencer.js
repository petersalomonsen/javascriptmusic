export function AudioWorkletProcessorSequencerModule() {
  // AudioWorklet render quantum size. Fixed at 128 in the original spec
  // and remains the default in `AudioContext({renderQuantumSize})`; we
  // pull it into a constant so the assumption is named in one place.
  const RENDER_QUANTUM_FRAMES = 128;
  const SEQ_MSG_LOOP = -1;
  const SEQ_MSG_START_RECORDING = -2;
  const SEQ_MSG_STOP_RECORDING = -3;
  const SEQ_MSG_BROADCAST_SEND = -4;
  const SEQ_MSG_BROADCAST_WAIT = -5;

  class MidiSequencer {
    constructor() {
      this.sequence = [];
      this.recorded = {};
      // Name the wait is parked on. Set when onprocess encounters a
      // SEQ_MSG_BROADCAST_WAIT event; while non-null, onprocess no-ops so
      // currentFrame freezes. Cleared when a matching broadcast arrives
      // (the processor's port handler clears it).
      this.waitingForSignal = null;
      // Called by onprocess when a SEQ_MSG_BROADCAST_SEND event fires.
      // The processor wires this to a port.postMessage so the main thread
      // can emit on a BroadcastChannel.
      this.broadcastSender = null;
    }

    clearRecording() {
      this.recorded = {};
    }

    setSequenceData(sequencedata) {
      // A new sequence's wait events haven't been encountered yet, so any
      // pending wait from the old sequence is stale.
      this.waitingForSignal = null;
      if (sequencedata.length > 0) {
        // clear recorded data
        this.clearRecording();
      }
      
      const startRecordingEntry = sequencedata.find(entry => entry.message.length === 1 && entry.message[0] === SEQ_MSG_START_RECORDING);

      if (startRecordingEntry && startRecordingEntry.time <= this.getCurrentTime()) {
        this.recordingActive = true;
      } else {
        this.recordingActive = false;
      }    
      // update sequence
      if (this.sequence.length > 0 && sequencedata.length > 0) {
        // Replace while playing. We want sequenceIndex to point at the
        // first event that is *due to fire on this render quantum or
        // later*. The quantum length in ms is the slop we have to
        // tolerate, otherwise events at currentTime-ε get skipped — when
        // a quantized swap fires at the first quantum past beat N
        // (currentTime ≈ N*60000/bpm + ~2.9ms), the new song's event
        // sitting exactly at the beat boundary is one quantum behind
        // currentTime and would be silently dropped.
        const currentTime = (this.currentFrame / sampleRate) * 1000;
        const quantumMs = RENDER_QUANTUM_FRAMES / sampleRate * 1000;
        this.sequenceIndex = sequencedata.findIndex(evt => evt.time > currentTime - quantumMs);
        if (this.sequenceIndex == -1) {
          this.sequenceIndex = 0;
        }
      } else {
        // Start playing from the beginning
        this.sequenceIndex = 0;
        this.currentFrame = 0;
      }
      this.sequence = sequencedata;
    }

    addMidiReceiver(midireceiver) {
      this.midireceiver = midireceiver;
    }

    onmidi(data) {
      if (this.recordingActive) {
        if (!this.recorded[this.currentFrame]) {
          this.recorded[this.currentFrame] = [];
        }
        this.recorded[this.currentFrame].push([data[0], data[1], data[2]]);
      }
    }

    getRecorded() {
      const eventlist = Object.keys(this.recorded)
        .sort((a, b) => a - b)
        .reduce((prev, frame) =>
          prev.concat(this.recorded[frame].map(event =>
            [frame / sampleRate].concat(event)))
          , []);
      return eventlist;
    }

    getCurrentTime() {
      return (this.currentFrame / sampleRate) * 1000;
    }

    setCurrentTime(time) {
      // Explicit seek clears any pending broadcast wait — the user moved
      // the playhead deliberately, so playback should resume from there.
      this.waitingForSignal = null;
      this.currentFrame = sampleRate * time / 1000;
      let sequenceIndex = 0;
      while (sequenceIndex < this.sequence.length &&
        this.sequence[sequenceIndex] &&
        this.sequence[sequenceIndex].time < time) {
        sequenceIndex++;
      }
      this.sequenceIndex = sequenceIndex;
    }

    onprocess() {
      // Parked on a broadcast wait — freeze the clock and skip event
      // processing entirely. Cleared externally when the matching signal
      // arrives.
      if (this.waitingForSignal) return;

      let currentTime = this.getCurrentTime();

      while (this.sequenceIndex < this.sequence.length &&
        this.sequence[this.sequenceIndex] && // sometimes this is undefined for yet unkown reasons
        this.sequence[this.sequenceIndex].time < currentTime) {

        let loop = false;
        // Meta-event cases (recording markers, broadcast send) advance
        // sequenceIndex from within the switch, so the inner while must
        // re-check bounds — otherwise reading `.message[0]` on `undefined`
        // throws and the exception escapes process(), which Chromium
        // takes as a signal to stop calling the processor.
        while (this.sequenceIndex < this.sequence.length &&
            this.sequence[this.sequenceIndex] &&
            this.sequence[this.sequenceIndex].message[0] < 0 &&
            this.sequence[this.sequenceIndex].time <= currentTime) {
          switch (this.sequence[this.sequenceIndex].message[0]) {
            case SEQ_MSG_LOOP:
              // loop
              loop = true;
              break;
            case SEQ_MSG_START_RECORDING:
              this.recordingActive = true;
              this.sequenceIndex++;
              break;
            case SEQ_MSG_STOP_RECORDING:
              this.recordingActive = false;
              this.sequenceIndex++;
              break;
            case SEQ_MSG_BROADCAST_SEND:
              if (this.broadcastSender) {
                this.broadcastSender(this.sequence[this.sequenceIndex].name);
              }
              this.sequenceIndex++;
              break;
            case SEQ_MSG_BROADCAST_WAIT:
              // Advance past the wait so resume doesn't re-trigger it,
              // then return immediately. currentFrame stays put — the
              // song clock holds until the signal arrives.
              this.waitingForSignal = this.sequence[this.sequenceIndex].name;
              this.sequenceIndex++;
              return;
          }
          if (loop) {
            break;
          }
        }
        if (loop) {
          this.sequenceIndex = 0;
          this.currentFrame = 0;
          break;
        }

        // The inner meta loop above can push sequenceIndex past the end
        // (a broadcast-send / recording marker at the end of the song).
        // If it did, there's no midi event to fire; the outer loop's
        // next iteration will re-check the bounds and exit cleanly.
        if (this.sequenceIndex >= this.sequence.length || !this.sequence[this.sequenceIndex]) {
          break;
        }

        const message = this.sequence[this.sequenceIndex].message;
        this.midireceiver(message[0], message[1], message[2]);
        this.sequenceIndex++;
      }

      if (this.recordingActive && this.recorded[this.currentFrame]) {
        const recorded = this.recorded[this.currentFrame];

        for (let n = 0; n < recorded.length; n++) {
          const message = recorded[n];
          this.midireceiver(message[0], message[1], message[2]);
        }
      }
      this.currentFrame += RENDER_QUANTUM_FRAMES;
    }
  }

  AudioWorkletGlobalScope.midisequencer = new MidiSequencer();
}
