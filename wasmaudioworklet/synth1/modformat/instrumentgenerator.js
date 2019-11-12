import { readFileSync } from 'fs';
import { periodToSampleRatePAL } from './protrackermodwriter.js';

export const resampleAndNormalize = (buf) => {
    buf = buf.filter((val, ndx) => ndx % 2 === 0);
    let max = 0;
    
    buf.forEach(val => {
        const a = Math.abs(val);
        if(a > max) {
            max = a;
        }        
    });
    
    const adjust = 127 / max;
    buf = buf.map(v => Math.round(v * adjust));
    return new Int8Array(buf);
};

export function createSamples(wasmModulePath, createSampleCallbacks) {
    const compiled = new WebAssembly.Module(readFileSync(wasmModulePath));
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

    const instance = new WebAssembly.Instance(compiled, imports).exports;
    instance.memory.grow(16);

    const INSTANCE_FRAMES = 16384;
    const instancebufferptr = instance.allocateSampleBuffer(INSTANCE_FRAMES);
    const instancebuffer = new Float32Array(instance.memory.buffer, instancebufferptr, INSTANCE_FRAMES);
    
    instance.toggleSongPlay(false);
    
    const samples = [];
    createSampleCallbacks.forEach((createSampleCallBack, sampleno) => {
        const sample = Object.assign({
                finetune: 0,
                volume: 64,
                loopstart: 0,
                looplength: 0
            }, createSampleCallBack(instance)
        );
        sample.data = resampleAndNormalize(instancebuffer);
        if (sample.looplength) {
            sample.data = sample.data.slice(0, sample.loopstart + sample.looplength);
        }
        global[sample.funcname] = (note, command, value) => [sampleno +1, note, command, value];
        samples.push(sample);
    });
    
    return samples;
}