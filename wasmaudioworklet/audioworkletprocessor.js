let instance;
let leftsamplebuffer;
let rightsamplebuffer;
let holdchannelvalues;
let membuffer;
let channelvaluesbuffer;
let channelvalueschecksum = 0;
let patternsbuffer;
let instrumentpatternslist;
let songlength;
let patternsize;
let availablePatternIndex;

const loadSong = (song) => {
  patternsize = song.patterns[0].length;

  const extrapatterns = 100;

  patternsbuffer = new Uint8Array(membuffer.buffer,
    instance.allocatePatterns(song.patterns.length + extrapatterns),
      (song.patterns.length + extrapatterns) * patternsize);
  
  song.patterns.splice(0, 0, new Array(patternsize).fill(0));
  availablePatternIndex = song.patterns.length;

  for(let patternIndex = 0; patternIndex < song.patterns.length; patternIndex++) {
    for(let n = 0;n<patternsize; n++) {
      patternsbuffer[patternIndex * patternsize + n] = song.patterns[patternIndex][n];
    }
  }

  songlength = song.instrumentPatternLists[0].length;
  instrumentpatternslist = new Uint8Array(membuffer.buffer, 
      instance.allocateInstrumentPatternList(songlength, song.instrumentPatternLists.length),
      song.instrumentPatternLists.length * songlength);  

  for(let instrIndex = 0;
        instrIndex < song.instrumentPatternLists.length; 
        instrIndex++) {
    for(let n=0;n<songlength;n++) {
      instrumentpatternslist[instrIndex*songlength + n] =
        song.instrumentPatternLists[instrIndex][n];
        
    }
  }

  channelvaluesbuffer = new Float32Array(instance.memory.buffer, 
          instance.getCurrentChannelValuesBufferPtr(),
          song.instrumentPatternLists.length);
  holdchannelvalues = new Float32Array(instance.memory.buffer, 
          instance.getHoldChannelValuesBufferPtr(),
          song.instrumentPatternLists.length);
  instance.setBPM(song.BPM ? song.BPM : 120);
}

class MyWorkletProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.port.onmessage = async (msg) => {
        if(msg.data.wasm) {
          instance = (await WebAssembly.instantiate(msg.data.wasm, {
            environment: { SAMPLERATE: msg.data.samplerate },
            env: {
              abort: () => console.log(abort)
            }
          })).instance.exports;
          membuffer = new Uint8Array(instance.memory.buffer);
          
          // Is this really always 128??? 
          const SAMPLE_FRAMES = 128;
        
          const samplebufferptr = instance.allocateSampleBuffer(SAMPLE_FRAMES);
          leftsamplebuffer = new Float32Array(instance.memory.buffer,
              samplebufferptr,
              SAMPLE_FRAMES);
          rightsamplebuffer = new Float32Array(instance.memory.buffer,
              samplebufferptr + (SAMPLE_FRAMES * 4),
              SAMPLE_FRAMES);  
        }
        if(msg.data.song) {
          loadSong(msg.data.song);
        }
        if(msg.data.toggleSongPlay!==undefined) {    
          console.log('toggle song play', msg.data.toggleSongPlay);
          instance.toggleSongPlay(msg.data.toggleSongPlay);
        }
        if(msg.data.channel!==undefined && msg.data.note!==undefined) {                              
          if(!instance.isPlaying()) {
            // Just play note
            instance.setChannelValue(msg.data.channel,msg.data.note);
          } else {
            // Record data to pattern
            instance.recordChannelValue(msg.data.channel,msg.data.note);

            const quantizedTick = Math.round(instance.getTick());
            const patternIndex = Math.floor(quantizedTick / patternsize);  
            const patternNoteIndex = quantizedTick % patternsize;

            const currentInstrumentPatternIndex = msg.data.channel * songlength + patternIndex;
            let patternNo = instrumentpatternslist[currentInstrumentPatternIndex];
            if(patternNo === 0) {
              patternNo = (availablePatternIndex ++);
              instrumentpatternslist[currentInstrumentPatternIndex] = patternNo;
            }
            if(msg.data.note > 0) {
              patternsbuffer[patternNo * patternsize + patternNoteIndex]  = msg.data.note;
            }

            // send pattern back to main thread for storing
            this.port.postMessage({
              instrumentPatternIndex: patternIndex,
              channel: msg.data.channel,
              recordedPatternNo: patternNo,
              patternData: Array.from(patternsbuffer.slice(
                    patternNo * patternsize,
                    patternNo * patternsize + patternsize
                  )
                )
            });
          }
        }
        
        if(msg.data.clearpattern && msg.data.patternIndex !== undefined) {
          for(let n = 0;n<patternsize; n++) {
            patternsbuffer[msg.data.patternIndex * patternsize + n]  = 0; 
          }
        }

        if(msg.data.getNoteStatus) {
          if(channelvaluesbuffer) {
            let checksum = 0;
            for(let n=0;n<channelvaluesbuffer.length;n++) {
              checksum += channelvaluesbuffer[n];
              if(channelvaluesbuffer[n]===1) {
                console.log('hold', n);
              }
            }
            
            if(checksum > 0 && channelvalueschecksum !== checksum) {
              this.port.postMessage({channelvalues: channelvaluesbuffer});
            }
            channelvalueschecksum = checksum;            

            // Create holding note patterns if notes are held
            for(let channel = 0; channel < holdchannelvalues.length; channel++) {
              if (holdchannelvalues[channel] > 1) {
                const quantizedTick = Math.round(instance.getTick());
                const patternIndex = Math.floor(quantizedTick / patternsize);  

                const currentInstrumentPatternIndex = channel * songlength + patternIndex;
                let patternNo = instrumentpatternslist[currentInstrumentPatternIndex];

                if(patternNo === 0) {
                  patternNo = (availablePatternIndex ++);
                  instrumentpatternslist[currentInstrumentPatternIndex] = patternNo;
                }
                // send pattern back to main thread for storing
                this.port.postMessage({
                  instrumentPatternIndex: patternIndex,
                  channel: channel,
                  recordedPatternNo: patternNo,
                  patternData: Array.from(patternsbuffer.slice(
                        patternNo * patternsize,
                        patternNo * patternsize + patternsize
                      )
                    )
                });
              
              }
            }
          }
        }
        if(msg.data.songPositionMillis) {
          instance.setMilliSecondPosition(msg.data.songPositionMillis);
        }
    };
    this.port.start();
    
  }  

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    
    if(instance) {
      instance.fillSampleBuffer();
      
      output[0].set(leftsamplebuffer);
      output[1].set(rightsamplebuffer);      
    }
  
    return true;
  }
}

registerProcessor('my-worklet-processor', MyWorkletProcessor);
