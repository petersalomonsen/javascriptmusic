// YOSHIMI WAM Processor
// Jari Kleimola 2018-19 (jari@webaudiomodules.org)
// Extended by Peter Salomonsen in 2020 to play midi event data

// Firefox does not support importing these from ../midisequencer/sequenceconstants.js
const SEQ_MSG_LOOP = -1;
const SEQ_MSG_START_RECORDING = -2;
const SEQ_MSG_STOP_RECORDING = -3;

class YOSHIMIAWP extends AudioWorkletGlobalScope.WAMProcessor
{
  constructor(options) {
    let awgs = AudioWorkletGlobalScope;
    awgs.WAM = awgs.WAM || {}
    awgs.WAM.YOSHIMI = awgs.WAM.YOSHIMI || { ENVIRONMENT: "WEB" };
    awgs.WAM.YOSHIMI.wasmBinary = new Uint8Array(options.processorOptions.wasm);
    eval(options.processorOptions.js);

    options.mod = AudioWorkletGlobalScope.WAM.YOSHIMI;
    super(options);
    this.numOutChannels = [2];
    this.sequence = [];
    this.recorded = {};
    this.getParametersXML = this.WAM.cwrap("yoshimi_getParametersXML", 'string', []);
  }

  onmessage (e) {
    var msg  = e.data;
    var data = msg.data;
    switch (msg.type) {
      case "midi":
        this.onmidi(data[0], data[1], data[2]);
        if (this.recordingActive) {
          if (!this.recorded[this.currentFrame]) {
            this.recorded[this.currentFrame] = [];
          }
          this.recorded[this.currentFrame].push([data[0], data[1], data[2]]);
        }
      break;
      case "sysex": this.onsysex(data); break;
      case "patch": this.onpatch(data); break;
      case "param": this.onparam(msg.key, msg.value); break;
      case "msg": 
        if (msg.prop === 'seq') {
          // clear recorded data
          this.recorded = {};
          this.recordingActive = false;
          // update sequence
          if (this.sequence.length > 0 && msg.data.length > 0) {
            // Replace while playing
            const currentTime = (this.currentFrame / this.sr) * 1000;
            this.sequenceIndex = msg.data.findIndex(evt => evt.time >= currentTime);
          } else {
            // Start playing from the beginning
            this.sequenceIndex = 0;
            this.currentFrame = 0;
          }
          this.sequence = msg.data;                    
        } else if (msg.prop === 'recorded') {
          this.port.postMessage({ 'recorded': this.recorded });
        } else {
          this.onmsg(msg.verb, msg.prop, msg.data);
          if (msg.prop.startsWith('patch')) {
            this.port.postMessage({ paramsxml: this.getParametersXML(this.inst)});
          } else {
            // ACK
            this.port.postMessage({ type: msg.type }); 
          }
        }        
        break;
    }
  }

  process (inputs,outputs,params) {
    let currentTime = (this.currentFrame / this.sr) * 1000;
    while (this.sequenceIndex < this.sequence.length &&
        this.sequence[this.sequenceIndex].time < currentTime) {

      while ( this.sequence[this.sequenceIndex].message[0] < 0) {
        switch (this.sequence[this.sequenceIndex].message[0]) {
          case SEQ_MSG_LOOP:
            // loop
            this.sequenceIndex = 0;
            this.currentFrame = 0;
            currentTime = 0;
            break;
          case SEQ_MSG_START_RECORDING:
            this.recordingActive = true;
            this.sequenceIndex++;
            break;
          case SEQ_MSG_STOP_RECORDING:
            this.recordingActive = false;
            this.sequenceIndex++;
            break;
        }
      }
      const message = this.sequence[this.sequenceIndex].message;
      this.WAM._wam_onmidi(this.inst, message[0], message[1], message[2]);

      this.sequenceIndex ++;
    }
    if (this.recordingActive && this.recorded[this.currentFrame]) {
      const recorded = this.recorded[this.currentFrame];

      for (let n=0;n<recorded.length; n++) {
        const message = recorded[n];
        this.WAM._wam_onmidi(this.inst, message[0], message[1], message[2])
      }
    }
    this.currentFrame += this.bufsize;
    return super.process(inputs, outputs, params);
  }
}

registerProcessor("YOSHIMI", YOSHIMIAWP);
