export function AudioWorkletProcessorSequencerModule() {
  const SEQ_MSG_LOOP = -1;
  const SEQ_MSG_START_RECORDING = -2;
  const SEQ_MSG_STOP_RECORDING = -3;
  const SEQ_MSG_BROADCAST_SEND = -4;
  const SEQ_MSG_BROADCAST_WAIT = -5;
  const SEQ_MSG_WAIT_SIGNAL = -6;
  const SEQ_MSG_PART = -7;

  class MidiSequencer {
    constructor() {
      this.sequence = [];
      this.recorded = {};
      // ---- performance mode ----
      // Off: a waitForSignal() event is inert (its `default` applies), so the
      // song is the same deterministic score everywhere. On: reaching the
      // event parks the song — looping its part, or holding the clock — until
      // a signal arrives; a signal may also carry a part to jump to.
      this.performanceMode = false;
      this.parts = {};        // part name -> { time, barMs }, from SEQ_MSG_PART events
      this.wait = null;       // the wait we are parked on, or null
      this.jump = null;       // a quantized jump scheduled by a signal: { at, targetTime, wait, goTo }
      this.onSignalState = null;   // processor hook: (state) => post to the main thread
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
      // pending wait from the old sequence is stale. (A live recompile while
      // looping a part re-enters the wait when it is reached again.)
      this.waitingForSignal = null;
      this.wait = null;
      this.jump = null;
      this.parts = {};
      sequencedata.forEach((evt, index) => {
        if (evt.message && evt.message.length === 1 && evt.message[0] === SEQ_MSG_PART && evt.name) {
          this.parts[evt.name] = { time: evt.time, barMs: evt.barMs || 0, index };
        }
      });
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
        // Replace while playing
        const currentTime = (this.currentFrame / sampleRate) * 1000;
        this.sequenceIndex = sequencedata.findIndex(evt => evt.time >= currentTime);
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
      // Explicit seek clears any pending wait — the user moved the
      // playhead deliberately, so playback should resume from there.
      this.waitingForSignal = null;
      this.wait = null;
      this.jump = null;
      this._seek(time);
    }

    // Move the playhead to `time` (ms): the next event to fire is the first at or after it.
    _seek(time) {
      this.currentFrame = Math.round(sampleRate * time / 1000);
      let sequenceIndex = 0;
      while (sequenceIndex < this.sequence.length &&
        this.sequence[sequenceIndex] &&
        this.sequence[sequenceIndex].time < time) {
        sequenceIndex++;
      }
      this.sequenceIndex = sequenceIndex;
    }

    // ---- performance mode ----
    setPerformanceMode(on) {
      this.performanceMode = !!on;
      if (!on) {
        // leaving performance mode while parked: play on, as the default would
        if (this.wait && this.wait.loop === 'hold') this.waitingForSignal = null;
        this.wait = null;
        this.jump = null;
      }
    }

    _notify(state) {
      if (this.onSignalState) this.onSignalState(state);
    }

    // Jump to a part: at its marker's INDEX, not merely its time — events at
    // the same time that precede the marker (the wait that closes the previous
    // part) must not fire, or the jump would re-enter the old loop.
    _seekToPart(part) {
      this.currentFrame = Math.round(sampleRate * part.time / 1000);
      this.sequenceIndex = part.index + 1;
    }

    // Continue past a wait: the song resumes right after the wait event.
    _continuePast(wait) {
      this._seek(wait.time);
      const idx = this.sequence.indexOf(wait.evt);
      if (idx >= 0) this.sequenceIndex = idx + 1;
    }

    // The part the playhead is in (latest marker at or before now), for the bar grid.
    _currentPart() {
      const now = this.getCurrentTime();
      let best = null;
      for (const [name, p] of Object.entries(this.parts)) {
        if (p.time <= now && (!best || p.time >= best.time)) best = { name, ...p };
      }
      return best;
    }

    // Schedule the jump on the quantize grid: 'bar'/'beat' from gridStart, 'now' at once.
    _scheduleJump({ target, goTo, wait, quantize, gridStart, barMs, beatMs }) {
      const now = this.getCurrentTime();
      const q = quantize === 'bar' ? barMs : quantize === 'beat' ? beatMs : 0;
      let at = now;
      if (q > 0) {
        const k = Math.ceil((now - gridStart) / q - 1e-9);
        at = gridStart + Math.max(0, k) * q;
      }
      // A looping part that is not a whole number of bars wraps before the
      // next bar line: leave at the end of the part then, whichever is first.
      if (wait && wait.loop === 'part' && at > wait.time) at = wait.time;
      this.jump = { at, target: target || null, goTo, wait };
      this._notify({ jumping: goTo || 'next', at, quantize });
    }

    _performJump() {
      const j = this.jump;
      this.jump = null;
      if (j.wait) this.wait = null;
      if (j.target) this._seekToPart(j.target);
      else this._continuePast(j.wait);
      this._notify({ resumed: j.wait ? j.wait.name : null, goTo: j.goTo || null });
    }

    // A signal arrived (from a shader element, MIDI, the agent, another
    // window, a timeout). Returns what happened so the processor can flip
    // playback back on after a hold. `goTo` names a part to jump to.
    signal(name, goTo = null) {
      const target = goTo ? this.parts[goTo] : null;
      if (goTo && !target) return { unknownPart: goTo };
      const w = this.wait;
      const matches = w && (w.name === name || w.name === 'any' || name === 'any');
      if (matches) {
        if (w.loop === 'hold') {
          // the clock is frozen: resume at once
          this.wait = null;
          this.waitingForSignal = null;
          if (target) this._seekToPart(target); else this._continuePast(w);
          this._notify({ resumed: w.name, goTo: goTo || null });
          return { resumed: true, goTo: goTo || null };
        }
        this._scheduleJump({ target, goTo, wait: w, quantize: w.quantize,
          gridStart: w.loopStart, barMs: w.barMs, beatMs: w.beatMs });
        return { resumed: true, goTo: goTo || null, at: this.jump.at };
      }
      if (target && this.performanceMode) {
        // a targeted jump from anywhere: quantized to the current part's bars
        const part = this._currentPart();
        this._scheduleJump({ target, goTo, wait: null, quantize: part && part.barMs ? 'bar' : 'now',
          gridStart: part ? part.time : 0, barMs: part ? part.barMs : 0, beatMs: 0 });
        return { resumed: false, goTo, at: this.jump.at };
      }
      return { resumed: false, ignored: true };
    }

    onprocess() {
      // Parked on a broadcast wait or a 'hold' wait — freeze the clock and
      // skip event processing entirely. Cleared when the signal arrives.
      if (this.waitingForSignal) return;

      let currentTime = this.getCurrentTime();

      // A scheduled (quantized) jump lands here, before any event at/after it fires.
      if (this.jump && currentTime >= this.jump.at) {
        this._performJump();
        currentTime = this.getCurrentTime();
      }
      if (this.wait && this.wait.loop === 'part') {
        // kiosk timeout: nobody interacted for `timeout.bars` bars of looping
        this.wait.waitedFrames += 128;
        if (this.wait.timeoutMs > 0 && !this.jump && (this.wait.waitedFrames / sampleRate) * 1000 >= this.wait.timeoutMs) {
          this.wait.timeoutMs = 0;
          this.signal(this.wait.name, this.wait.timeoutGoTo);
        }
        // loop the part: the wait event marks the loop end (a jump due at the
        // loop end lands first, above, since it is never later than this)
        if (currentTime >= this.wait.time) {
          this._seek(this.wait.loopStart);
          currentTime = this.getCurrentTime();
        }
      }

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
            case SEQ_MSG_PART:
              this.sequenceIndex++;
              break;
            case SEQ_MSG_WAIT_SIGNAL: {
              const evt = this.sequence[this.sequenceIndex];
              this.sequenceIndex++;
              if (!this.performanceMode) {
                // inert: the default applies — continue, or go to a part
                const target = evt.default && evt.default !== 'continue' ? this.parts[evt.default] : null;
                if (target) { this._seekToPart(target); return; }
                break;
              }
              if (!this.wait) {
                this.wait = {
                  evt, name: evt.name || 'go', loop: evt.loop || 'part', quantize: evt.quantize || 'bar',
                  time: evt.time, loopStart: evt.partStart || 0, barMs: evt.barMs || 0, beatMs: evt.beatMs || 0,
                  timeoutMs: evt.timeout && evt.timeout.bars > 0 ? evt.timeout.bars * (evt.barMs || 0) : 0,
                  timeoutGoTo: evt.timeout ? evt.timeout.goTo || null : null,
                  waitedFrames: 0,
                };
                this._notify({ waiting: this.wait.name, loop: this.wait.loop, timeoutMs: this.wait.timeoutMs });
              }
              if (this.wait.loop === 'hold') {
                this.waitingForSignal = this.wait.name;
                return;
              }
              // loop the part from its start; the next pass reaches this wait again
              this._seek(this.wait.loopStart);
              return;
            }
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
        // (a broadcast-send / recording marker at the end of the song), or
        // onto an event that is still in the future (a recording marker
        // followed by a gap — e.g. stopRecording(); await waitDuration(4);
        // loopHere()). Either way there is nothing to fire yet: firing the
        // future event here would play a note early, or swallow the loop
        // marker as a bogus midi message so the song never loops.
        if (this.sequenceIndex >= this.sequence.length ||
            !this.sequence[this.sequenceIndex] ||
            this.sequence[this.sequenceIndex].time >= currentTime) {
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
      this.currentFrame += 128;
    }
  }

  AudioWorkletGlobalScope.midisequencer = new MidiSequencer();
}
