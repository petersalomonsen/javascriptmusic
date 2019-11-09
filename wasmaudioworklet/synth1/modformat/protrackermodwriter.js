const fs = require('fs');

/**
 * Convenience functions for creating notes
 */
const periodToSampleRatePAL = (period) => Math.round(7093789.2 / (period * 2));
const periods =  [  856,808,762,720,678,640,604,570,538,508,480,453,
    428,404,381,360,339,320,302,285,269,254,240,226,
    214,202,190,180,170,160,151,143,135,127,120,113];
periods.forEach((period, ndx) => 
    global[['c','cs','d','ds','e','f','fs','g','gs','a','as','b'][ndx%12] + (Math.floor(ndx / 12) + 1)] = period
);

const compiled = new WebAssembly.Module(fs.readFileSync(__dirname + "/../build/index.wasm"));
const imports = { 
  environment: {
    SAMPLERATE: periodToSampleRatePAL(a3) * 2
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

const resampleAndNormalize = (buf) => {
    buf = buf.filter((val, ndx) => ndx % 2 === 0);
    let max = 0;
    
    buf.forEach(val => {
        const a = Math.abs(val);
        if(a > max) {
            max = a;
        }        
    });
    
    const adjust = 127 / max;
    buf = buf.map(v => v * adjust);
    return new Int8Array(buf);
};

const instance = module.exports;
instance.memory.grow(16);

const INSTANCE_FRAMES = 16384;
const instancebufferptr = instance.allocateSampleBuffer(INSTANCE_FRAMES);
const instancebuffer = new Float32Array(instance.memory.buffer, instancebufferptr, INSTANCE_FRAMES);
instance.toggleSongPlay(false);
instance.setChannelValue(0, 69 - (12 ));
instance.fillSampleBuffer();


const samples = [];
samples.push(
    {
        samplename: "bass",
        funcname: "bass",
        finetune: 0,
        volume: 64,
        loopstart: 0,
        loopend: 0,
        data: resampleAndNormalize(instancebuffer)
    });

instance.setChannelValue(0, 0);
instance.fillSampleBuffer();

instance.setChannelValue(1, 69 + (12));
instance.fillSampleBuffer();
samples.push({
        samplename: "lead",
        funcname: "lead",
        finetune: 0,
        volume: 40,
        loopstart: 0,
        loopend: 0,
        data: resampleAndNormalize(instancebuffer)
    }
);

instance.setChannelValue(1, 0);
instance.fillSampleBuffer();
instance.setChannelValue(2, 100);
instance.fillSampleBuffer();
samples.push({
        samplename: "kick",
        funcname: "kick",
        finetune: 0,
        volume: 64,
        loopstart: 0,
        loopend: 0,
        data: resampleAndNormalize(instancebuffer)
    }
);

samples.forEach((sample, sampleno) => global[sample.funcname] = (note, command, value) => [sampleno +1, note, command, value] );

const moduledef = {
    songname: "hello song",
    samples: samples,
    songpositions: [
        // patterns to play
        0,
        0,
        0,
        0
    ],
    patterns: [
        [
            // instrument, period, command, value
            bass(a1, 0x0a, 0x0c),lead(c2, 0, 0),lead(e2, 0, 0),kick(a3, 0, 0),
            ,,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(a2, 0x0a, 0x0c),,,,
            ,,,kick(a3, 0, 0),
            bass(a2, 0x0a, 0x0c),,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,,
            bass(f1),,,kick(a3, 0, 0),
            ,,,,
            ,,,lead(e2, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            ,,lead(a2, 0, 0),kick(a3, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            bass(f1, 0x0a, 0x0c),,,lead(c3, 0, 0),
            ,,,,
            bass(g1),lead(d2, 0, 0),lead(b2, 0, 0),kick(a3, 0, 0),
            ,,,,
            ,,,lead(g2, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            ,,lead(d2, 0, 0),kick(a3, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,lead(e2, 0, 0),
            ,,,kick(a3, 0x0c, 20),
            bass(e1),lead(b1, 0, 0),,kick(a3, 0, 0),
            ,,,,
            bass(e2, 0x0a, 0x0c),,,lead(g2, 0, 0),
            bass(e1, 0x0c, 0x20),,,,
            bass(g1),,,kick(a3, 0, 0),
            ,,lead(a2, 0, 0),,
            bass(g2),,,,
            bass(g1, 0x0d, 0x00),,,,
            
        ]
    ]
};

function str2char(str) {
    const ret = new Uint8Array(str.length);
    for(let n=0; n<str.length; n++) {
        ret[n] = str.charCodeAt(n);
    }
    return ret;
}

function num2word(num) {
    return [ num >> 8, num & 0xff];
}

// http://coppershade.org/articles/More!/Topics/Protracker_File_Format/

const patternsOffset = 1084;
const numPatterns = moduledef.songpositions.reduce((p, c) => c > p ? c : p, 0) + 1;
const output = new Uint8Array(patternsOffset + numPatterns * 1024 + moduledef.samples.reduce((p,c) => p + c.data.length,0));
output.set(str2char(moduledef.songname), 0);

let sampleDataOffset = patternsOffset + numPatterns * 4 * 4 * 64;
moduledef.samples.forEach((sample, ndx) => {
    const offset = ndx * 30 + 20;
    output.set(str2char(sample.samplename), offset);
    output.set(num2word(sample.data.length / 2), offset + 22);
    output.set([sample.finetune], offset + 24);
    output.set([sample.volume], offset + 25,);
    output.set(num2word(sample.loopstart / 2), offset + 26);
    output.set(num2word(sample.loopend / 2), offset + 28);
    output.set(sample.data, sampleDataOffset);
    sampleDataOffset += sample.data.length;
});

// song length
output.set([moduledef.songpositions.length], 950);

/*
  Well... this little byte here is set to 127, so that old
  trackers will search through all patterns when loading.
  Noisetracker uses this byte for restart, but we don't.
 */
output.set([127], 951);

moduledef.songpositions.forEach((val, ndx) => output.set([val], 52 + ndx));
output.set(str2char('M.K.'), 1080);

moduledef.patterns.forEach((pattern, patternNdx) => {
    pattern.forEach((note, noteNdx) => {
        const offset = patternsOffset + patternNdx * 4 * 4 * 64 + noteNdx * 4;
        output.set([
            note[0] & 0xf0 | (note[1] >> 8 & 0x0f),
            note[1], // period
            note[0] << 4 | (note[2] & 0x0f), // instr, effect no
            note[3] // effect value
        ], offset);
    });
});


fs.writeFileSync("test.mod", output, {encoding: 'binary'});