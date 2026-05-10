import asc from 'assemblyscript/asc';

let mix_source = 'mixes/newyear.mix.ts';
let index_source = 'index.ts';
const wasi_main_src = 'wasi_main.ts';

let assemblyscriptsynthsources;
let lastFaustFingerprint = '';

const EXPORT_MODE_WASM_LIB = 'libmodule';
const EXPORT_MODE_MIDISYNTH_WASM_LIB = 'midilibmodule';
const EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB = 'midimultipartmodule';

const ready = new Promise(resolve => fetch('wasmsynthassemblyscriptsources.json').then(r => r.json())
    .then(obj => {
        assemblyscriptsynthsources = obj;
        assemblyscriptsynthsources[mix_source] = null; // force compile first 
        resolve(true);
    }));


function createWebAssemblySongData(song, mode = EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB) {
    if (mode === EXPORT_MODE_MIDISYNTH_WASM_LIB) {
        console.log('exporting midisynth WASM lib module');
        assemblyscriptsynthsources['environment.ts'] = `export declare const SAMPLERATE: f32;`
        assemblyscriptsynthsources['midi/sequencer/midiparts.ts'] = `
            import { MidiSequencerPart, MidiSequencerPartSchedule } from "./midisequencerpart";
            export const midiparts: MidiSequencerPart[] = [new MidiSequencerPart([${song.eventlist.map(v => '' + v).join(',')}])];
            export const midipartschedule: MidiSequencerPartSchedule[] = [new MidiSequencerPartSchedule(0, 0)];
        `;
        assemblyscriptsynthsources[wasi_main_src] = `
            export { fillSampleBuffer, fillSampleBufferWithNumSamples, samplebuffer, allNotesOff, shortmessage, getActiveVoicesStatusSnapshot } from './midi/midisynth';
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

            export const midiparts: MidiSequencerPart[] = [${song.map(part => 'new MidiSequencerPart([' + part.eventlist.join(',') + '])')}];            
            export const midipartschedule: MidiSequencerPartSchedule[] = [${song.reduce((p, c, ndx) => p.concat(c.startTimes.map(t =>
            ({ startTime: t, patternIndex: ndx })
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

        const songlength = song.instrumentPatternLists[0].length;

        const instrumentpatternslistsize = song.instrumentPatternLists.length * songlength;
        const instrumentpatternslist = new Array(instrumentpatternslistsize);

        for (let instrIndex = 0;
            instrIndex < song.instrumentPatternLists.length;
            instrIndex++) {
            for (let n = 0; n < songlength; n++) {
                instrumentpatternslist[instrIndex * songlength + n] =
                    song.instrumentPatternLists[instrIndex][n];

            }
        }

        if (mode === EXPORT_MODE_WASM_LIB) {
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

async function compileAssemblyScript(sources, options, entrypoint) {
    if (typeof sources === "string") sources = { "input.ts": sources };
    const output = Object.create({
        stdout: asc.createMemoryStream(),
        stderr: asc.createMemoryStream()
    });
    var argv = [
        "--outFile", "binary",
        "--textFile", "text",
    ];
    Object.keys(options || {}).forEach(key => {
        var val = options[key];
        if (Array.isArray(val)) val.forEach(val => argv.push("--" + key, String(val)));
        else argv.push("--" + key, String(val));
    });
    await asc.main(entrypoint ? argv.concat(entrypoint) : argv.concat(Object.keys(sources)), {
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
    const faustSources = msg.data.faustSources || {};
    console.log('wait for assemblyscript sources to be loaded');
    await ready;
    console.log('assemblyscript sources loaded');

    // Inject any transpiled faust/*.ts files from the wasm-git repo so the
    // mix can do `import { Foo } from '../faust/foo';` from mixes/midi.mix.ts.
    // Wipe any previously-injected faust/ entries first so a deletion in the
    // repo doesn't keep a stale module compiled in.
    for (const k of Object.keys(assemblyscriptsynthsources)) {
        if (k.startsWith('faust/')) delete assemblyscriptsynthsources[k];
    }
    for (const [basename, contents] of Object.entries(faustSources)) {
        const stem = basename.replace(/\.ts$/, '').replace(/\.dsp$/, '');
        assemblyscriptsynthsources['faust/' + stem + '.ts'] = contents;
    }
    // Fingerprint the injected faust/* sources so we can tell when they
    // change between requests — the synth-source string is otherwise stable
    // and would hit the "no changes" early-return below.
    const faustFingerprint = Object.entries(faustSources)
        .map(([k, v]) => `${k}:${(v || '').length}:${(v || '').slice(0, 40)}`)
        .sort().join('|');

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

    try {
        if (msg.data.song) {
            // Fully optimize if including song
            assemblyscriptsynthsources[mix_source] = synthsource;
            assemblyscriptsynthsources['environment.ts'] = `export const SAMPLERATE: f32 = 44100;`
            console.log(msg.data.song, msg.data.exportmode);
            createWebAssemblySongData(msg.data.song, msg.data.exportmode);
            const { stderr, text, binary } = await compileAssemblyScript(assemblyscriptsynthsources,
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
                binary: binary
            }, binary ? [binary.buffer] : []);
        } else if (assemblyscriptsynthsources[mix_source] !== synthsource
                   || faustFingerprint !== lastFaustFingerprint) {
            assemblyscriptsynthsources['environment.ts'] = `export const SAMPLERATE: f32 = ${samplerate};`

            assemblyscriptsynthsources[mix_source] = synthsource;
            lastFaustFingerprint = faustFingerprint;
            const { stderr, text, binary } = await compileAssemblyScript(assemblyscriptsynthsources,
                { "runtime": "stub", "optimizeLevel": 0, "shrinkLevel": 0 },
                index_source);

            postMessage({
                error: stderr.toString(),
                binary: binary
            }, binary ? [binary.buffer] : []);
        } else {
            postMessage({
                nochanges: true
            });
        }
    } catch (err) {
        this.postMessage({
            error: err.message
        });
    }
}
