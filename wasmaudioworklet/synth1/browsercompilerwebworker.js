/**
 * Web worker to compile web assembly synth in the browser
 */

importScripts('https://cdn.jsdelivr.net/gh/AssemblyScript/binaryen.js@90.0.0-nightly.20200214/index.js');
importScripts('https://cdn.jsdelivr.net/gh/AssemblyScript/AssemblyScript@0.9.2/dist/assemblyscript.js');
importScripts('https://cdn.jsdelivr.net/gh/AssemblyScript/AssemblyScript@0.9.2/dist/asc.js');

const default_mix_source = 'mixes/newyear.mix.ts';
const wasi_main_src = 'wasi_main.ts';

let assemblyscriptsynthsources;

fetch('wasmsynthassemblyscriptsources.json').then(r => r.json())
    .then(obj => {
        assemblyscriptsynthsources = obj;
        assemblyscriptsynthsources[default_mix_source] = null; // force compile first time
});


function createWebAssemblySongData(song) {
    const patternsbuffer = new Array((song.patterns.length + 1) * song.patternsize);
    patternsbuffer.fill(0, 0, song.patternsize);

    for(let patternIndex = 0; patternIndex < song.patterns.length; patternIndex++) {
        for(let n = 0;n<song.patternsize; n++) {
            patternsbuffer[(patternIndex + 1) * song.patternsize + n] =
                song.patterns[patternIndex][n];
        }
    }

    songlength = song.instrumentPatternLists[0].length;

    instrumentpatternslistsize = song.instrumentPatternLists.length * songlength;
    const instrumentpatternslist = new Array(instrumentpatternslistsize);  

    for(let instrIndex = 0;
            instrIndex < song.instrumentPatternLists.length; 
            instrIndex++) {
        for(let n=0;n<songlength;n++) {
        instrumentpatternslist[instrIndex*songlength + n] =
            song.instrumentPatternLists[instrIndex][n];
            
        }
    }

    assemblyscriptsynthsources[wasi_main_src] = `
import { fd_write, iovec} from 'bindings/wasi';
import { allocateSampleBuffer, getTick, setBPM, setPatternsPtr, setInstrumentPatternListPtr, fillSampleBufferInterleaved } from './index';

const patterns: u8[] = [${patternsbuffer.map(v => '' + v).join(',')}];
const instrumentspatternlists: u8[] = [${instrumentpatternslist.map(v => '' + v).join(',')}];

export function _start(): void {
    const samplebuf = allocateSampleBuffer(128);
    setPatternsPtr(load<usize>(changetype<usize>(patterns)));
    setInstrumentPatternListPtr(load<usize>(changetype<usize>(instrumentspatternlists)),
                ${songlength}, ${song.instrumentPatternLists.length});
    setBPM(${song.BPM});
    
    const iov = new iovec();
    iov.buf = samplebuf;
    iov.buf_len = 128 * 8;
    
    const written_ptr = changetype<usize>(new ArrayBuffer(sizeof<usize>()));
    
    let previousTick: f64;
    do {
        previousTick = getTick();
        fillSampleBufferInterleaved();
        fd_write(1, changetype<usize>(iov), 1, written_ptr);
    } while(previousTick < getTick())
}    
`;
}

function compileAssemblyScript(sources, options, entrypoint) {
    if (typeof sources === "string") sources = { "input.ts": sources };
    const output = Object.create({
        stdout: asc.createMemoryStream(),
        stderr: asc.createMemoryStream()
    });
    var argv = [
        "--binaryFile", "binary",
        "--textFile", "text",
    ];
    Object.keys(options || {}).forEach(key => {
        var val = options[key];
        if (Array.isArray(val)) val.forEach(val => argv.push("--" + key, String(val)));
        else argv.push("--" + key, String(val));
    });
    asc.main(entrypoint ? argv.concat(entrypoint) : argv.concat(Object.keys(sources)), {
        stdout: output.stdout,
        stderr: output.stderr,
        readFile: name => sources.hasOwnProperty(name) ? sources[name] : null,
        writeFile: (name, contents) => output[name] = contents,
        listFiles: () => []
    });
    
    return output;
}

onmessage = function (msg) {
    const synthsource = msg.data.synthsource;
    const samplerate = msg.data.samplerate;
    
    if(msg.data.song) {
        assemblyscriptsynthsources[default_mix_source] = synthsource;
        assemblyscriptsynthsources['environment.ts'] = `export const SAMPLERATE: f32 = 44100;`
        createWebAssemblySongData(msg.data.song);
        const {stderr, text, binary} = compileAssemblyScript(assemblyscriptsynthsources,
            {
                "runtime": "none",
                "optimizeLevel": 3,
                "shrinkLevel": 3,
                // "noAssert": "",
                "use": "abort="
            },
            wasi_main_src);
        
        
        const errors = stderr.toString();
        if(errors) {
            postMessage({
                error: errors
            });
        } else {
            postMessage({    
                downloadWASMurl: URL.createObjectURL(new Blob([binary], {type: "octet/stream"}))
            });
        }
    }

    if(assemblyscriptsynthsources[default_mix_source] !== synthsource) {
        assemblyscriptsynthsources['environment.ts'] = `export const SAMPLERATE: f32 = ${samplerate};`

        assemblyscriptsynthsources[default_mix_source] = synthsource;
        const {stderr, text, binary} = compileAssemblyScript(assemblyscriptsynthsources,
                { "runtime": "none", "optimizeLevel": 0, "shrinkLevel": 0},
                'index.ts');
        const errors = stderr.toString();
        if(errors) {
            postMessage({
                error: errors
            });
        } else {
            this.postMessage({
                binary: binary
            });            
        }
    } else {
        postMessage({
            nochanges: true
        });
    }
}
