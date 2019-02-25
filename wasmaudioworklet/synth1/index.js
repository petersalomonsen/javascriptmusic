const fs = require("fs");
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

var membuffer = new Uint8Array(instance.memory.buffer);
  
const song = require('./songs/testsong.js');

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
var instrumentpatternslistptr = instance.allocateInstrumentPatternList(songlength);  

for(let instrIndex = 0;
      instrIndex < song.instrumentPatternLists.length; 
      instrIndex++) {
  for(let n=0;n<songlength;n++) {
    membuffer[instrIndex*songlength + n + instrumentpatternslistptr] =
      song.instrumentPatternLists[instrIndex][n];
      
  }
}

const gain = 0.2;

const FRAMES = 8192;
const buffer = new Uint8Array(FRAMES * 4 * 2);
const instancebufferptr = instance.allocateSampleBuffer(FRAMES);
const instancebuffer = new Float32Array(instance.memory.buffer, instancebufferptr, FRAMES * 2);

const dv = new DataView(buffer.buffer);  

async function writeoutput() {
  while(true) {
    
    instance.fillSampleBuffer();
    
    for(let n=0;n<FRAMES * 2;n ++ ) {
      dv.setFloat32(n * 4, instancebuffer[n] * gain, true);
    }
    
    if(!process.stdout.write(buffer)) {      
      await new Promise(resolve => process.stdout.once('drain', () => resolve()));
    }
  }
}
writeoutput();