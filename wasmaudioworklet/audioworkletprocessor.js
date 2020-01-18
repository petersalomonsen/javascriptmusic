let instance;
let song;
let channelvalueschecksum = 0;
let patternsbufferptr, patternsbuffersize;
let instrumentpatternslistptr, instrumentpatternslistsize;
let songlength;
let patternsize;
let availablePatternIndex;
let samplebufferptr;
const SAMPLE_FRAMES = 128;

const loadSong = () => {
  patternsize = song.patterns[0].length;
  
  const extrapatterns = 100;
  patternsbuffersize = (song.patterns.length + extrapatterns) * patternsize;
  patternsbufferptr = instance.allocatePatterns(song.patterns.length + extrapatterns);
  const patternsbuffer = new Uint8Array(instance.memory.buffer, patternsbufferptr,
      patternsbuffersize);
  
  song.patterns.splice(0, 0, new Array(patternsize).fill(0));
  availablePatternIndex = song.patterns.length;

  for(let patternIndex = 0; patternIndex < song.patterns.length; patternIndex++) {
    for(let n = 0;n<patternsize; n++) {
      patternsbuffer[patternIndex * patternsize + n] = song.patterns[patternIndex][n];
    }
  }

  songlength = song.instrumentPatternLists[0].length;

  instrumentpatternslistptr = instance.allocateInstrumentPatternList(songlength, song.instrumentPatternLists.length);
  instrumentpatternslistsize = song.instrumentPatternLists.length * songlength;
  const instrumentpatternslist = new Uint8Array(instance.memory.buffer, 
      instrumentpatternslistptr,
      instrumentpatternslistsize);  

  for(let instrIndex = 0;
        instrIndex < song.instrumentPatternLists.length; 
        instrIndex++) {
    for(let n=0;n<songlength;n++) {
      instrumentpatternslist[instrIndex*songlength + n] =
        song.instrumentPatternLists[instrIndex][n];
        
    }
  }
  instance.setBPM(song.BPM ? song.BPM : 120);
}

class MyWorkletProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.port.onmessage = async (msg) => {
        if(msg.data.wasm) {

          let tick = 0; 
          if(instance && msg.data.livewasmreplace) {
            tick = instance.getTick();
          }
          instance = (await WebAssembly.instantiate(msg.data.wasm, {
            environment: { SAMPLERATE: msg.data.samplerate },
            env: {
              abort: () => console.log(abort)
            }
          })).instance.exports;
          
          if(instance.setTick) {
            // check for setTick to be present for backward compatibility
            instance.setTick(tick);
          }
        
          samplebufferptr = instance.allocateSampleBuffer(SAMPLE_FRAMES);
          
        }
        if(msg.data.song) {
          song = msg.data.song;
          loadSong();
        }
        if(msg.data.toggleSongPlay!==undefined) {    
          instance.toggleSongPlay(msg.data.toggleSongPlay);
        }

        const patternsbuffer = new Uint8Array(instance.memory.buffer, patternsbufferptr, patternsbuffersize);
        const instrumentpatternslist = new Uint8Array(instance.memory.buffer, instrumentpatternslistptr, instrumentpatternslistsize);

        if(msg.data.channel!==undefined && msg.data.note!==undefined) {
          if(!instance.isPlaying()) {
            // Just play note
            instance.setChannelValue(msg.data.channel,msg.data.note);
          } else {
            // Record data to pattern
            instance.recordChannelValue(msg.data.channel,msg.data.note);

            const quantizedTick = Math.round(instance.getTick());
            const patternIndex = Math.floor(quantizedTick / patternsize) % songlength;  
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
          
          
          if(instance) {
            const channelvaluesbuffer = new Float32Array(instance.memory.buffer, 
              instance.getCurrentChannelValuesBufferPtr(),
              song.instrumentPatternLists.length);
            const holdchannelvalues = new Float32Array(instance.memory.buffer, 
                    instance.getHoldChannelValuesBufferPtr(),
                    song.instrumentPatternLists.length);
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
      
      output[0].set(new Float32Array(instance.memory.buffer,
        samplebufferptr,
        SAMPLE_FRAMES));
      output[1].set(new Float32Array(instance.memory.buffer,
        samplebufferptr + (SAMPLE_FRAMES * 4),
        SAMPLE_FRAMES));      
    }
  
    return true;
  }
}

registerProcessor('my-worklet-processor', MyWorkletProcessor);
