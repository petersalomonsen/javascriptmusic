/**
 * Web worker to compile web assembly synth in the browser
 */

self.require = (name) => self[name];

importScripts('https://cdn.jsdelivr.net/npm/binaryen@101.0.0-nightly.20210904/index.js');
importScripts('https://cdn.jsdelivr.net/npm/assemblyscript@0.19.16/dist/assemblyscript.js');
importScripts('https://cdn.jsdelivr.net/npm/assemblyscript@0.19.16/dist/asc.js');

let mix_source = 'mixes/newyear.mix.ts';
let index_source = 'index.ts';
const wasi_main_src = 'wasi_main.ts';

let assemblyscriptsynthsources;

const EXPORT_MODE_WASI_MAIN = 'wasimain';
const EXPORT_MODE_WASM_LIB = 'libmodule';
const EXPORT_MODE_MIDISYNTH_WASM_LIB = 'midilibmodule';
const EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB = 'midimultipartmodule';

const ready = new Promise(resolve => fetch('wasmsynthassemblyscriptsources.json').then(r => r.json())
    .then(obj => {
        assemblyscriptsynthsources = obj;
        assemblyscriptsynthsources[mix_source] = null; // force compile first 
        resolve(true);
    }));


function createWebAssemblySongData(song, mode = EXPORT_MODE_WASI_MAIN) {
    if (mode === EXPORT_MODE_MIDISYNTH_WASM_LIB) {
        console.log('exporting midisynth WASM lib module');
        assemblyscriptsynthsources['environment.ts'] = `export declare const SAMPLERATE: f32;`
        assemblyscriptsynthsources['midi/sequencer/midiparts.ts'] = `
            import { MidiSequencerPart, MidiSequencerPartSchedule } from "./midisequencerpart";
            export const midiparts: MidiSequencerPart[] = [new MidiSequencerPart([${song.eventlist.map(v => '' + v).join(',')}])];
            export const midipartschedule: MidiSequencerPartSchedule[] = [new MidiSequencerPartSchedule(0, 0)];
        `;
        assemblyscriptsynthsources[wasi_main_src] = `
            export { fillSampleBuffer, samplebuffer, allNotesOff, shortmessage, getActiveVoicesStatusSnapshot } from './midi/midisynth';
            export { seek, playEventsAndFillSampleBuffer, currentTimeMillis } from './midi/sequencer/midisequencer';
            import { midipartschedule } from './midi/sequencer/midiparts';

            export function getDuration(): i32 {
                return midipartschedule[0].endTime;
            }
            `;
    } else if (mode === EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB) {
        console.log('exporting midisynth multipart WASM lib module');
        
        assemblyscriptsynthsources['environment.ts'] = `export declare const SAMPLERATE: f32;`
        assemblyscriptsynthsources['midi/sequencer/midiparts.ts'] = `
            import { MidiSequencerPart, MidiSequencerPartSchedule } from "./midisequencerpart";

            export const midiparts: MidiSequencerPart[] = [${song.map(part => 'new MidiSequencerPart(['+part.eventlist.join(',')+'])')}];            
            export const midipartschedule: MidiSequencerPartSchedule[] = [${
                song.reduce((p, c, ndx) => p.concat(c.startTimes.map(t =>
                        ({startTime: t, patternIndex: ndx})
                    )), []).sort((a, b) => a.startTime - b.startTime)
                    .map(schedule => `new MidiSequencerPartSchedule(${schedule.patternIndex}, ${schedule.startTime})`)
                    .join(',')
            }];
        `;
        assemblyscriptsynthsources[wasi_main_src] = `
            export { fillSampleBuffer, samplebuffer, allNotesOff, shortmessage, getActiveVoicesStatusSnapshot } from './midi/midisynth';
            export { seek, playEventsAndFillSampleBuffer, currentTimeMillis, setMidiPartSchedule } from './midi/sequencer/midisequencer';
        `;
    } else {
        const patternsbuffer = new Array((song.patterns.length + 1) * song.patternsize);
        patternsbuffer.fill(0, 0, song.patternsize);

        for (let patternIndex = 0; patternIndex < song.patterns.length; patternIndex++) {
            for (let n = 0; n < song.patternsize; n++) {
                patternsbuffer[(patternIndex + 1) * song.patternsize + n] =
                    song.patterns[patternIndex][n];
            }
        }

        songlength = song.instrumentPatternLists[0].length;

        instrumentpatternslistsize = song.instrumentPatternLists.length * songlength;
        const instrumentpatternslist = new Array(instrumentpatternslistsize);

        for (let instrIndex = 0;
            instrIndex < song.instrumentPatternLists.length;
            instrIndex++) {
            for (let n = 0; n < songlength; n++) {
                instrumentpatternslist[instrIndex * songlength + n] =
                    song.instrumentPatternLists[instrIndex][n];

            }
        }

        if (mode === EXPORT_MODE_WASI_MAIN) {
            console.log('exporting WASM module with WASI main');
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
        } else if (mode === EXPORT_MODE_WASM_LIB) {
            console.log('exporting WASM lib module');
            assemblyscriptsynthsources[wasi_main_src] = `
    import { allocateSampleBuffer, getTick, setBPM, setPatternsPtr, setInstrumentPatternListPtr, fillSampleBufferInterleaved } from './index';
    export * from './index';

    const patterns: u8[] = [${patternsbuffer.map(v => '' + v).join(',')}];
    const instrumentspatternlists: u8[] = [${instrumentpatternslist.map(v => '' + v).join(',')}];
    setPatternsPtr(load<usize>(changetype<usize>(patterns)));
    setInstrumentPatternListPtr(load<usize>(changetype<usize>(instrumentspatternlists)),
                ${songlength}, ${song.instrumentPatternLists.length});
    setBPM(${song.BPM});

    `;
        }
    }
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

onmessage = async function (msg) {
    console.log(JSON.stringify(msg));
    const synthsource = msg.data.synthsource;
    const samplerate = msg.data.samplerate;
    console.log('wait for assemblyscript sources to be loaded');
    await ready;
    console.log('assemblyscript sources loaded');

    if (synthsource.indexOf('midichannels') > -1) {
        // assume midi synth
        mix_source = 'mixes/midi.mix.ts';
        index_source = 'midi/midisynth.ts';

        let midisynthsource = assemblyscriptsynthsources[index_source];
        if (synthsource.indexOf('AudioPlayer') > -1) {
            midisynthsource = midisynthsource.replace(/\n\/\/ (export.*allocateAudioBuffer[^\n]+)/, '\n$1');
        } else {
            midisynthsource = midisynthsource.replace(/\n(export.*allocateAudioBuffer[^\n]+)/, '\n// $1');
        }
        assemblyscriptsynthsources[index_source] = midisynthsource;
        
    } else {
        mix_source = 'mixes/newyear.mix.ts';
        index_source = 'index.ts';
    }

    if (msg.data.song) {
        assemblyscriptsynthsources[mix_source] = synthsource;
        assemblyscriptsynthsources['environment.ts'] = `export const SAMPLERATE: f32 = 44100;`
        createWebAssemblySongData(msg.data.song, msg.data.exportmode);
        const { stderr, text, binary } = compileAssemblyScript(assemblyscriptsynthsources,
            {
                "runtime": "stub",
                "optimizeLevel": 3,
                "shrinkLevel": 3,
                // "noAssert": "",
                "use": "abort="
            },
            wasi_main_src);

        postMessage({
            error: stderr.toString(),
            downloadWASMurl: binary ? URL.createObjectURL(new Blob([binary], { type: "octet/stream" })) : null
        });
    }

    if (assemblyscriptsynthsources[mix_source] !== synthsource) {
        assemblyscriptsynthsources['environment.ts'] = `export const SAMPLERATE: f32 = ${samplerate};`

        assemblyscriptsynthsources[mix_source] = synthsource;
        const { stderr, text, binary } = compileAssemblyScript(assemblyscriptsynthsources,
            { "runtime": "stub", "optimizeLevel": 0, "shrinkLevel": 0 },
            index_source);

        postMessage({
            error: stderr.toString(),
            binary: binary
        });
    } else {
        postMessage({
            nochanges: true
        });
    }
}
