import { periodToSampleRatePAL } from './protrackermodwriter.js';

export function resampleAndNormalize(buf) {
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
}

/**
 * Make perfect loop by fading out the end of the loop part and fade in the samples before the loop
 * @param {*} buf 
 * @param {*} loopstart 
 * @param {*} looplength 
 * @param {*} transitionlength 
 */
export function makeClickFreeLoop(buf, loopstart, looplength, transitionlength) {
    buf.slice(loopstart - transitionlength, loopstart)
        .forEach((val, ndx, arr) => {
            const bufndx = loopstart + looplength - transitionlength + ndx;

            const fadeRatio = 1 - Math.log( 1 + (
                    (Math.E - 1) * ((arr.length - ndx) / (arr.length))
                ));
            
            // fade out end of loop part            
            buf[bufndx] *= 1 - fadeRatio;

            // fade in leading samples
            buf[bufndx] += val * fadeRatio;
        });    
}

export function trimsampledata(buf) {
    let zerocount = 0;
    let datafound = false;
    let n = 0;
    for(;n<buf.length;n++) {
        if(datafound && buf[n] === 0) {
            zerocount ++;
            if(zerocount === 20) {
                break;
            }
        } else if(buf[n] !== 0) {
            zerocount = 0;
            datafound = true;
        }
    }
    return buf.slice(0,n);
}

export function createSamples(wasmModulePath, createSampleCallbacks) {
    const compiled = new WebAssembly.Module(wasmModulePath);
    const imports = { 
        environment: {
            SAMPLERATE: periodToSampleRatePAL(a3()[1]) * 2
        },
        env: {
            abort(msgPtr, filePtr, line, column) {
                throw new Error(`index.ts: abort at [${ line }:${ column }]`);
            }
        } 
    };

    const INSTANCE_FRAMES = 16384;

    const samples = [];
    createSampleCallbacks.forEach((createSampleCallBack, sampleno) => {
        const instance = new WebAssembly.Instance(compiled, imports).exports;
        instance.memory.grow(16);
    
        const instancebufferptr = instance.allocateSampleBuffer(INSTANCE_FRAMES);
        instance.toggleSongPlay(false);
    
        const createSampleCallbackOptions = {
            offsetFrames: 0
        };
        const sample = Object.assign({
                finetune: 0,
                volume: 64,
                loopstart: 0,
                looplength: 0,
                looptransitionlength: 0
            }, createSampleCallBack(instance, createSampleCallbackOptions)
        );

        const instancebuffer = new Float32Array(
                    instance.memory.buffer,
                    instancebufferptr + createSampleCallbackOptions.offsetFrames * 4,
                    INSTANCE_FRAMES - createSampleCallbackOptions.offsetFrames);

        if (sample.looptransitionlength) {
            makeClickFreeLoop(instancebuffer, sample.loopstart * 2, sample.looplength * 2, sample.looptransitionlength);
        }

        sample.data = resampleAndNormalize(instancebuffer);
        if (sample.looplength) {
            // delete sample data after loop end
            sample.data = sample.data.slice(0, sample.loopstart + sample.looplength);
        } else {
            sample.data = trimsampledata(sample.data);
        }
        self[sample.funcname] = (note, command, value) => 
            note === undefined ?
            sampleno + 1 :
            typeof note === 'function' ?
                [sampleno +1, note()[1], command, value] :
                note.map((val, ndx, arr) => arr[1] > 0 && ndx === 0 ? sampleno + 1 : val);
        samples.push(sample);
    });
    
    return samples;
}