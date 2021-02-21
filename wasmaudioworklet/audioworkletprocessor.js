const SAMPLE_FRAMES = 128;

class PatternSeqAudioWorkletProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.processorActive = true;
    this.port.onmessage = async (msg) => {
        if(msg.data.wasm) {

          let tick = 0; 
          if(this.wasmInstance && msg.data.livewasmreplace) {
            tick = this.wasmInstance.getTick();
          }
          this.wasmInstance = (await WebAssembly.instantiate(msg.data.wasm, {
            environment: { SAMPLERATE: msg.data.samplerate },
            env: {
              abort: () => console.log('webassembly synth abort, should not happen')
            }
          })).instance.exports;
          
          if(this.wasmInstance.setTick) {
            // check for setTick to be present for backward compatibility
            this.wasmInstance.setTick(tick);
          }
        
          this.samplebufferptr = this.wasmInstance.allocateSampleBuffer(SAMPLE_FRAMES);
          
        }
        if(msg.data.song) {
          this.song = msg.data.song;
          this.loadSong();
        }
        if(msg.data.toggleSongPlay!==undefined) {    
          this.wasmInstance.toggleSongPlay(msg.data.toggleSongPlay);
        }

        if (this.wasmInstance) {
          const patternsbuffer = new Uint8Array(this.wasmInstance.memory.buffer, this.patternsbufferptr, this.patternsbuffersize);
          const instrumentpatternslist = new Uint8Array(this.wasmInstance.memory.buffer, this.instrumentpatternslistptr, this.instrumentpatternslistsize);

          if(msg.data.channel!==undefined && msg.data.note!==undefined) {
            if(!this.wasmInstance.isPlaying()) {
              // Just play note
              this.wasmInstance.setChannelValue(msg.data.channel,msg.data.note);
            } else {
              // Record data to pattern
              this.wasmInstance.recordChannelValue(msg.data.channel,msg.data.note);

              const quantizedTick = Math.round(this.wasmInstance.getTick());
              const patternIndex = Math.floor(quantizedTick / this.patternsize) % this.songlength;  
              const patternNoteIndex = quantizedTick % this.patternsize;

              const currentInstrumentPatternIndex = msg.data.channel * this.songlength + patternIndex;
              
              let patternNo = instrumentpatternslist[currentInstrumentPatternIndex];
              
              if(patternNo === 0) {
                patternNo = (this.availablePatternIndex ++);
                instrumentpatternslist[currentInstrumentPatternIndex] = patternNo;
              }
              if(msg.data.note > 0) {
                patternsbuffer[patternNo * this.patternsize + patternNoteIndex]  = msg.data.note;
              }

              // send pattern back to main thread for storing
              this.port.postMessage({
                instrumentPatternIndex: patternIndex,
                channel: msg.data.channel,
                recordedPatternNo: patternNo,
                patternData: Array.from(patternsbuffer.slice(
                      patternNo * this.patternsize,
                      patternNo * this.patternsize + this.patternsize
                    )
                  )
              });
            }
          }
        }
        
        if(msg.data.clearpattern && msg.data.patternIndex !== undefined) {
          for(let n = 0;n<this.patternsize; n++) {
            patternsbuffer[msg.data.patternIndex * this.patternsize + n]  = 0; 
          }
        }

        if(msg.data.getNoteStatus) {
          if(this.wasmInstance) {
            const channelvaluesbuffer = new Float32Array(this.wasmInstance.memory.buffer, 
              this.wasmInstance.getCurrentChannelValuesBufferPtr(),
              this.song.instrumentPatternLists.length);
            const holdchannelvalues = new Float32Array(this.wasmInstance.memory.buffer, 
                    this.wasmInstance.getHoldChannelValuesBufferPtr(),
                    this.song.instrumentPatternLists.length);
            let checksum = 0;
            for(let n=0;n<channelvaluesbuffer.length;n++) {
              checksum += channelvaluesbuffer[n];
              if(channelvaluesbuffer[n]===1) {
                console.log('hold', n);
              }
            }

            if(checksum > 0 && this.channelvalueschecksum !== checksum) {
              this.port.postMessage({channelvalues: channelvaluesbuffer.slice(0)});
            }
            this.channelvalueschecksum = checksum;            

            // Create holding note patterns if notes are held
            for(let channel = 0; channel < holdchannelvalues.length; channel++) {
              if (holdchannelvalues[channel] > 1) {
                const quantizedTick = Math.round(this.wasmInstance.getTick());
                const patternIndex = Math.floor(quantizedTick / this.patternsize);  

                const currentInstrumentPatternIndex = channel * this.songlength + patternIndex;
                let patternNo = instrumentpatternslist[currentInstrumentPatternIndex];

                if(patternNo === 0) {
                  patternNo = (this.availablePatternIndex ++);
                  instrumentpatternslist[currentInstrumentPatternIndex] = patternNo;
                }
                // send pattern back to main thread for storing
                this.port.postMessage({
                  instrumentPatternIndex: patternIndex,
                  channel: channel,
                  recordedPatternNo: patternNo,
                  patternData: Array.from(patternsbuffer.slice(
                        patternNo * this.patternsize,
                        patternNo * this.patternsize + this.patternsize
                      )
                    )
                });
              
              }
            }
          }
        }
        if (msg.data.songPositionMillis) {
          this.wasmInstance.setMilliSecondPosition(msg.data.songPositionMillis);
        }
        if (msg.data.terminate) {
          this.processorActive = false;
        }
    };
    this.port.start();
    
  }  

  loadSong() {
    this.patternsize = this.song.patterns[0].length;
    
    const extrapatterns = 100;
    this.patternsbuffersize = (this.song.patterns.length + extrapatterns) * this.patternsize;
    this.patternsbufferptr = this.wasmInstance.allocatePatterns(this.song.patterns.length + extrapatterns);
    const patternsbuffer = new Uint8Array(this.wasmInstance.memory.buffer, this.patternsbufferptr,
        this.patternsbuffersize);
    
    this.song.patterns.splice(0, 0, new Array(this.patternsize).fill(0));
    this.availablePatternIndex = this.song.patterns.length;
  
    for(let patternIndex = 0; patternIndex < this.song.patterns.length; patternIndex++) {
      for(let n = 0;n<this.patternsize; n++) {
        patternsbuffer[patternIndex * this.patternsize + n] = this.song.patterns[patternIndex][n];
      }
    }
  
    this.songlength = this.song.instrumentPatternLists[0].length;
  
    this.instrumentpatternslistptr = this.wasmInstance.allocateInstrumentPatternList(this.songlength, this.song.instrumentPatternLists.length);
    this.instrumentpatternslistsize = this.song.instrumentPatternLists.length * this.songlength;
    const instrumentpatternslist = new Uint8Array(this.wasmInstance.memory.buffer, 
        this.instrumentpatternslistptr,
        this.instrumentpatternslistsize);  
  
    for(let instrIndex = 0;
          instrIndex < this.song.instrumentPatternLists.length; 
          instrIndex++) {
      for(let n=0;n<this.songlength;n++) {
        instrumentpatternslist[instrIndex*this.songlength + n] =
          this.song.instrumentPatternLists[instrIndex][n];
          
      }
    }
    this.wasmInstance.setBPM(this.song.BPM ? this.song.BPM : 120);
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    
    if(this.wasmInstance) {
      this.wasmInstance.fillSampleBuffer();
      output[0].set(new Float32Array(this.wasmInstance.memory.buffer,
        this.samplebufferptr,
        SAMPLE_FRAMES));
      output[1].set(new Float32Array(this.wasmInstance.memory.buffer,
        this.samplebufferptr + (SAMPLE_FRAMES * 4),
        SAMPLE_FRAMES));      
    }
  
    return this.processorActive;
  }
}

registerProcessor('pattern-seq-audio-worklet-processor', PatternSeqAudioWorkletProcessor);
