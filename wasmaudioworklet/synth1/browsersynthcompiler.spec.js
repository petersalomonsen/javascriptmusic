import { compileSong, createMultipatternSequence } from '../midisequencer/songcompiler.js';
import { compileWebAssemblySynth } from './browsersynthcompiler.js';

describe('browsersynthcompiler', function () {
    this.timeout(20000);
    it('should compile to wasm midi multipart module', async ()=> {
        const synthsource = ``;
        const bpm = 60;
        const songsource = `
        setBPM(${bpm});
    
        const kickbeat = () => createTrack(1).steps(4, [
              c5,,,,
              ,,,,
              ,,,,
              ,,,,
            ]);
        
        const blabla = () => createTrack(0).steps(4, [
           c1    
            ]);
        
        const tralala = () => createTrack(0).steps(4, [
                d4
                 ]);
             
        const hohoho = () => createTrack(0).steps(4, [
            c3 
        ]);
        blabla();
        await kickbeat();
        tralala();
        await kickbeat();
        hohoho();
        await kickbeat();
        loopHere();
        `;
        await compileSong(songsource);

        const multiPatternSequence = createMultipatternSequence();
        const wasmbytes = await (await fetch(await compileWebAssemblySynth(synthsource,
                        multiPatternSequence, 44100,
                        'midimultipartmodule', true))).arrayBuffer();
        console.log('wasm file length is '+wasmbytes.byteLength);
        const SAMPLERATE = 44100;
        const wasminstance = (await WebAssembly.instantiate(wasmbytes, {
            environment: {
                SAMPLERATE: SAMPLERATE
            }
        })).instance.exports;

        assert.equal(wasminstance.currentTimeMillis.value, 0);
        wasminstance.playEventsAndFillSampleBuffer();
        
        const activeVoicesStatusSnapshot = new Uint8Array(wasminstance.memory.buffer,wasminstance.getActiveVoicesStatusSnapshot(),32*3);
        assert.equal(activeVoicesStatusSnapshot[0], 0);
        assert.equal(activeVoicesStatusSnapshot[1], 12);
        assert.equal(activeVoicesStatusSnapshot[2], 100);
        assert.equal(activeVoicesStatusSnapshot[3], 1);
        assert.equal(activeVoicesStatusSnapshot[4], 60);
        assert.equal(activeVoicesStatusSnapshot[5], 100);
        assert.equal(wasminstance.currentTimeMillis.value, 128 * 1000 / SAMPLERATE);

        while(wasminstance.currentTimeMillis.value < 4005) {
            wasminstance.playEventsAndFillSampleBuffer();
        }
        console.log(wasminstance.currentTimeMillis.value );
        
        wasminstance.getActiveVoicesStatusSnapshot();
        assert.ok(activeVoicesStatusSnapshot.findIndex((v, n, arr) =>
            v === 0 && arr[n + 1] === 4*12+2 && arr[n + 2] === 100) > -1);
        
        assert.ok(activeVoicesStatusSnapshot.findIndex((v, n, arr) =>
            v === 1 && arr[n + 1] === 60 && arr[n + 2] === 100) > -1);
                
        while(wasminstance.currentTimeMillis.value < 8005) {
            wasminstance.playEventsAndFillSampleBuffer();
        }
        console.log(wasminstance.currentTimeMillis.value );

        wasminstance.getActiveVoicesStatusSnapshot();
        assert.ok(activeVoicesStatusSnapshot.findIndex((v, n, arr) =>
            v === 0 && arr[n + 1] === 3*12 && arr[n + 2] === 100) > -1);
        
        assert.ok(activeVoicesStatusSnapshot.findIndex((v, n, arr) =>
            v === 1 && arr[n + 1] === 60 && arr[n + 2] === 100) > -1);
        
        while(wasminstance.currentTimeMillis.value < 12005) {
            wasminstance.playEventsAndFillSampleBuffer();
        }
        console.log(wasminstance.currentTimeMillis.value );
    });
});