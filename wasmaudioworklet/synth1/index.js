const fs = require("fs");
require('../pattern_tools.js');

const compiled = new WebAssembly.Module(fs.readFileSync(__dirname + "/build/index.wasm"));
const imports = { 
  environment: {
    SAMPLERATE: 44100
  },
  env: {
    abort(msgPtr, filePtr, line, column) {
      throw new Error(`index.ts: abort at [${ line }:${ column }]`);
    }
  } 
};
Object.defineProperty(module, "exports", {
  get: () => new WebAssembly.Instance(compiled, imports).exports
});
const instance = module.exports;
instance.memory.grow(16);
var membuffer = new Uint8Array(instance.memory.buffer);
  
const songsource = fs.readFileSync('./songs/shuffle.js').toString();

eval(songsource);

const patterns = generatePatterns();
const instrumentPatternLists = generateInstrumentPatternLists();
const song = {instrumentPatternLists: instrumentPatternLists, patterns: patterns};

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
// console.error('song length', songlength);
// console.error('patternlists', song.instrumentPatternLists);
// console.error('patterns', song.patterns);
var instrumentpatternslistptr = instance.allocateInstrumentPatternList(songlength, song.instrumentPatternLists.length);  

for(let instrIndex = 0;
      instrIndex < song.instrumentPatternLists.length; 
      instrIndex++) {
  for(let n=0;n<songlength;n++) {
    membuffer[instrIndex*songlength + n + instrumentpatternslistptr] =
      song.instrumentPatternLists[instrIndex][n];      
  }
}

instance.setBPM(global.bpm ? global.bpm : 120);

const INSTANCE_FRAMES = 128;
const BUFFERS = 32;
const buffer = new Uint8Array(INSTANCE_FRAMES * BUFFERS * 4 * 2);
const instancebufferptr = instance.allocateSampleBuffer(INSTANCE_FRAMES);
const instancebuffer = new Float32Array(instance.memory.buffer, instancebufferptr, INSTANCE_FRAMES * 2);

const dv = new DataView(buffer.buffer);  

async function writeoutput() {
  while(true) {
    let previousTick = instance.getTick();
    for(let b = 0; b<BUFFERS; b++) {
      instance.fillSampleBuffer();
      const bufoffset = b * INSTANCE_FRAMES * 4 * 2;

      for(let n=0;n<INSTANCE_FRAMES;n ++ ) {
        dv.setFloat32(bufoffset + n * 4 * 2, instancebuffer[n], true);
        dv.setFloat32(bufoffset + n * 4 * 2 + 4, instancebuffer[n + INSTANCE_FRAMES], true);
      }
    }

    if(!process.stdout.write(buffer)) {      
      await new Promise(resolve => process.stdout.once('drain', () => resolve()));
    }

    if(instance.getTick() < previousTick) {
      // Song finished
      return;
    }
  }
}
writeoutput();