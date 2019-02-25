let instance;
let membuffer;

let gain = 0.5;

const loadSong = (song) => {
  const patternsptr = instance.allocatePatterns(song.patterns.length + 1);
  const patternsize = song.patterns[0].length;
  song.patterns.splice(0, 0, new Array(patternsize).fill(0));

  for(let patternIndex = 0; patternIndex < song.patterns.length; patternIndex++) {
    for(let n = 0;n<patternsize; n++) {
      membuffer[patternIndex * patternsize + n + patternsptr] =
        song.patterns[patternIndex][n];
    }
  }

  const songlength = song.instrumentPatternLists[0].length;
  var instrumentpatternslistptr = instance.allocateInstrumentPatternList(songlength);  

  for(let instrIndex = 0;
        instrIndex < song.instrumentPatternLists.length; 
        instrIndex++) {
    for(let n=0;n<songlength;n++) {
      membuffer[instrIndex*songlength + n + instrumentpatternslistptr] =
        song.instrumentPatternLists[instrIndex][n];
        
    }
  }
}

class MyWorkletProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.port.onmessage = async (msg) => {
        instance = (await WebAssembly.instantiate(msg.data.wasm, {
          environment: { SAMPLERATE: msg.data.samplerate }
        })).instance.exports;
        membuffer = new Uint8Array(instance.memory.buffer);
  
        loadSong(msg.data.song);
    };
    this.port.start();
    
  }  

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    
    const leftchanneldata = output[0];
    const rightchanneldata = output[1];
    
    if(!this.instancesamplebuffer) {
      this.instancesamplebuffer = new Float32Array(instance.memory.buffer, instance.allocateSampleBuffer(leftchanneldata.length), leftchanneldata.length*2);
    }
    instance.fillSampleBuffer();
    
    for(let n = 0; n < leftchanneldata.length; n++) {                
        leftchanneldata[n] = this.instancesamplebuffer[n*2] * gain;
        rightchanneldata[n] = this.instancesamplebuffer[(n*2)+1] * gain;        
    }
  
    return true;
  }
}

registerProcessor('my-worklet-processor', MyWorkletProcessor);
