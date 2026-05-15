import { loadScript, loadCSS } from './common/scriptloader.js';
import { addedAudio, compileSong as compileMidiSong, convertEventListToByteArraySequence, createMultipatternSequence, getSongParts, instrumentNames as midiInstrumentNames } from './midisequencer/songcompiler.js';
import { insertMidiRecording } from './midisequencer/editorfunctions.js';
import { postSong as wamPostSong, exportWAMAudio } from './webaudiomodules/wammanager.js';
import { insertRecording as insertRecording4klang } from './4klangsequencer/editorfunctions.js';
import './webaudiomodules/preseteditor.js';
import { setInstrumentNames, appendToSubtoolbar1 } from './app.js';
import { toggleSpinner } from './common/ui/progress-spinner.js';

import { readfile, writefileandstage, initWASMGitClient, addRemoteSyncListener, getConfig, listfiles } from './wasmgit/wasmgitclient.js';
import { transpileDspSource } from './faust/browser-transpile.js';
import { createPatternToolsGlobal } from './pattern_tools.js';
import { modal, modalPrompt } from './common/ui/modal.js';
import { updateSong, updateSynth, exportToWav } from './synth1/audioworklet/midisynthaudioworklet.js';
import { bpm as midiBpm } from './midisequencer/pattern.js';
import { compileWebAssemblySynth } from './synth1/browsersynthcompiler.js';

import { exportVideo, setupWebGL } from './visualizer/fragmentshader.js';
import { triggerDownload } from './common/filedownload.js';
import { decodeBufferFromPNG, encodeBufferAsPNG } from './common/png.js';
import { isSointuSong, getSointuWasm, getSointuYaml } from './sointu/playsointu.js';
import { claudeBridge } from './claude-bridge-client.js';
export let songsourceeditor;
export let synthsourceeditor;
export let shadersourceeditor;
export let faustsourceeditor;
let gitrepoconfig = null;
let currentFaustFilename = null;
let lastSavedFaustSource = null;

const SONG_MODE_WASM = 'WASM';
const SONG_MODE_SOINTU = 'sointu';
const SONG_MODE_PROTRACKER = 'protracker';

async function loadCodeMirror() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.55.0/codemirror.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.55.0/mode/javascript/javascript.js');

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/search/search.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/search/searchcursor.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/search/jump-to-line.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/dialog/dialog.js');

    await loadScript('https://unpkg.com/jshint@2.9.6/dist/jshint.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/lint/lint.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/lint/javascript-lint.js');
    await loadCSS('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/lint/lint.css');
}

let webassemblySynthUpdated = false;

export async function initEditor(componentRoot) {
    toggleSpinner(true);
    await loadCodeMirror();

    songsourceeditor = CodeMirror(componentRoot.getElementById("editor"), {
        value: "",
        mode: "javascript",
        theme: "monokai",
        lineNumbers: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: {
            'esversion': 6,
            'elision': true
        }
    });

    synthsourceeditor = CodeMirror(componentRoot.getElementById("assemblyscripteditor"), {
        value: "",
        mode: "text/typescript",
        theme: "monokai",
        lineNumbers: true,
        gutters: ["CodeMirror-lint-markers"]
    });

    shadersourceeditor = CodeMirror(componentRoot.getElementById("shadereditor"), {
        value: "",
        mode: "text/glsl",
        theme: "monokai",
        lineNumbers: true,
        gutters: ["CodeMirror-lint-markers"]
    });

    faustsourceeditor = CodeMirror(componentRoot.getElementById("faustcodemirror"), {
        value: "",
        // No native Faust mode in our CodeMirror 5 build — plain text is fine.
        mode: "text/plain",
        theme: "monokai",
        lineNumbers: true,
    });

    // Register editors with the bridge so it can route apply_file messages.
    // The WS connection itself is only opened once a git repo is loaded
    // (see the gitrepoparam branch below) — otherwise there's nothing to
    // sync and the constant reconnect attempts add noise (and time, in
    // Firefox enough to blow the WTR timeout).
    claudeBridge.registerEditor(songsourceeditor, {
        id: 'song',
        language: 'javascript',
        getPath: () => gitrepoconfig?.songfilename || null,
    });
    claudeBridge.registerEditor(synthsourceeditor, {
        id: 'synth',
        language: 'assemblyscript',
        getPath: () => gitrepoconfig?.synthfilename || null,
    });
    claudeBridge.registerEditor(shadersourceeditor, {
        id: 'shader',
        language: 'glsl',
        getPath: () => gitrepoconfig?.fragmentshader || null,
    });
    claudeBridge.registerEditor(faustsourceeditor, {
        id: 'faust',
        language: 'faust',
        getPath: () => currentFaustFilename || null,
    });

    window.toggleEditors = (editorid, checked) => {
        componentRoot.getElementById(editorid).style.display = checked ? 'block' : 'none';
        const editors = componentRoot.querySelectorAll('.editor');
        let visibleEditors = [];
        for (let n = 0; n < editors.length; n++) {
            if (editors[n].style.display !== 'none') {
                visibleEditors.push(editors[n]);
            }
        }
        // equal width for each editor
        visibleEditors.forEach(editor =>
            editor.style.width = Math.round((1 / visibleEditors.length) * 100) + '%'
        );
    };

    toggleEditors('presetsui', false);
    // Faust editor stays hidden until the toggle or a populated dropdown shows it.
    toggleEditors('fausteditor', false);

    let synthsource;
    let shadersource;

    // ----- Faust editor wiring -----------------------------------------

    const errorMessagesElement = componentRoot.querySelector('#errormessages');
    const errorMessagesContentElement = errorMessagesElement.querySelector('span');
    const displayFaustError = (err) => {
        errorMessagesContentElement.innerText = err;
        errorMessagesElement.style.display = 'block';
    };

    const faustFileSelect = componentRoot.getElementById('faustfileselect');
    const faustNewFileButton = componentRoot.getElementById('faustnewfilebutton');
    const faustSaveStatus = componentRoot.getElementById('faustsavestatus');

    const FAUST_DIR = 'faust/';
    const FAUST_STUB = `import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
process = os.sawtooth(freq) * gain * en.adsr(0.01, 0.1, 0.7, 0.2, gate);
`;

    async function refreshFaustFileList() {
        if (!gitrepoconfig) return;
        try {
            const all = await listfiles(FAUST_DIR);
            const dspFiles = all.filter(f => f.endsWith('.dsp'));
            faustFileSelect.innerHTML = '';
            if (dspFiles.length === 0) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = '(no .dsp files yet)';
                faustFileSelect.appendChild(opt);
            } else {
                for (const f of dspFiles) {
                    const opt = document.createElement('option');
                    opt.value = f;
                    opt.textContent = f.substring(FAUST_DIR.length);
                    if (f === currentFaustFilename) opt.selected = true;
                    faustFileSelect.appendChild(opt);
                }
                if (!currentFaustFilename || !dspFiles.includes(currentFaustFilename)) {
                    currentFaustFilename = dspFiles[0];
                    faustFileSelect.value = currentFaustFilename;
                    await loadFaustFile(currentFaustFilename);
                }
            }
        } catch (e) {
            console.warn('Failed to list faust files', e);
        }
    }

    async function loadFaustFile(path) {
        try {
            const contents = await readfile(path);
            faustsourceeditor.doc.setValue(contents || '');
            currentFaustFilename = path;
            lastSavedFaustSource = contents || '';
            faustSaveStatus.textContent = '';
        } catch (e) {
            console.warn('Failed to read faust file', path, e);
        }
    }

    faustFileSelect.addEventListener('change', async () => {
        if (faustFileSelect.value) {
            await loadFaustFile(faustFileSelect.value);
        }
    });

    faustNewFileButton.addEventListener('click', async () => {
        const entered = await modalPrompt(
            'New Faust file',
            'Basename, with optional sub-folders (e.g. <code>mysynth</code> or <code>mysong/dsp/master</code>). <code>.dsp</code> is added automatically.',
            ''
        );
        if (entered === null) return;
        const raw = entered.trim();
        if (!raw) return;
        const basename = raw.endsWith('.dsp') ? raw : raw + '.dsp';
        // Accept sub-folders (segments separated by /), each segment alphanumeric/_/-.
        if (!/^([A-Za-z0-9_\-]+\/)*[A-Za-z0-9_\-]+\.dsp$/.test(basename)) {
            displayFaustError('Faust filename must be alphanumeric segments separated by slashes, e.g. mysynth.dsp or mysong/dsp/master.dsp');
            return;
        }
        const fullPath = FAUST_DIR + basename;
        try {
            await writefileandstage(fullPath, FAUST_STUB);
            currentFaustFilename = fullPath;
            await refreshFaustFileList();
            faustFileSelect.value = fullPath;
            await loadFaustFile(fullPath);
            // Show editor if hidden so the user sees the new file.
            const cb = componentRoot.querySelector('#fausteditortogglecheckbox');
            if (cb && !cb.checked) {
                cb.checked = true;
                toggleEditors('fausteditor', true);
            }
        } catch (e) {
            displayFaustError('Failed to create file: ' + (e && e.message ? e.message : e));
        }
    });

    // Walk the source file's directory in wasm-git and gather every .dsp/.lib
    // file *except the source itself* into a map keyed by its path relative
    // to that directory — so `library("lib/ebur128.dsp")` and
    // `library("expanders.lib")` resolve via the libfaust virtual FS.
    async function collectSiblingLibs(sourcePath) {
        const sourceDir = sourcePath.substring(0, sourcePath.lastIndexOf('/') + 1);
        const all = await listfiles(sourceDir);
        const libs = {};
        await Promise.all(all.map(async (p) => {
            if (p === sourcePath) return;
            if (!/\.(dsp|lib)$/.test(p)) return;
            const relPath = p.substring(sourceDir.length);
            try { libs[relPath] = await readfile(p); } catch (_) { /* skip */ }
        }));
        return libs;
    }

    // Save callback used by both the save button and CodeMirror's Cmd-S.
    // Returns true when a save+transpile actually happened (so the caller
    // can decide to also kick off an AS recompile so the new module is
    // picked up immediately).
    async function saveFaustIfChanged() {
        if (!gitrepoconfig || !currentFaustFilename) return false;
        const source = faustsourceeditor.doc.getValue();
        if (source === lastSavedFaustSource) return false;
        const basename = currentFaustFilename.substring(FAUST_DIR.length);
        const stem = basename.replace(/\.dsp$/, '');
        try {
            faustSaveStatus.textContent = 'Transpiling...';
            const libs = await collectSiblingLibs(currentFaustFilename);
            const { ts, className } = await transpileDspSource(source, basename, libs);
            const tsPath = currentFaustFilename.replace(/\.dsp$/, '.ts');
            await writefileandstage(currentFaustFilename, source);
            await writefileandstage(tsPath, ts);
            lastSavedFaustSource = source;
            // Surface the ready-to-paste import line — works regardless of
            // how deep the .dsp lives under faust/.
            const importPath = '../faust/' + stem;
            const libsCount = Object.keys(libs).length;
            faustSaveStatus.textContent =
                `Saved ${basename}` +
                (libsCount ? ` (+${libsCount} sibling lib${libsCount === 1 ? '' : 's'})` : '') +
                `  →  import { ${className} } from '${importPath}';`;
            return true;
        } catch (e) {
            faustSaveStatus.textContent = '';
            displayFaustError('Faust transpile failed: ' + (e && e.message ? e.message : e));
            throw e;
        }
    }
    // Expose so compileAndPostSong (defined below) can call it.
    window.__saveFaustIfChanged = saveFaustIfChanged;

    // Read every .ts file under faust/ in the wasm-git repo and return a
    // map keyed by the path relative to faust/ (preserving sub-folders, so
    // `faust/master_me/dsp/master_me.ts` is keyed as
    // `master_me/dsp/master_me.ts`). The AS compiler worker injects these
    // back under `faust/<key>` so the user's mix can do e.g.
    //   `import { MasterMe } from '../faust/master_me/dsp/master_me';`
    async function loadFaustSourcesFromRepo() {
        if (!gitrepoconfig) return {};
        try {
            const all = await listfiles(FAUST_DIR);
            const tsFiles = all.filter(f => f.endsWith('.ts'));
            const out = {};
            await Promise.all(tsFiles.map(async (path) => {
                const relPath = path.substring(FAUST_DIR.length);
                out[relPath] = await readfile(path);
            }));
            return out;
        } catch (e) {
            console.warn('Failed to load faust/*.ts sources from repo', e);
            return {};
        }
    }

    componentRoot.getElementById('savesongbutton').onclick = () => compileAndPostSong();

    window.compileSong = async function (exportProject = false) {
        const errorMessagesElement = componentRoot.querySelector('#errormessages');
        const errorMessagesContentElement = errorMessagesElement.querySelector('span');
        errorMessagesContentElement.innerText = '';
        errorMessagesElement.style.display = 'none';

        const displayError = (err) => {
            errorMessagesContentElement.innerText = err;
            errorMessagesElement.style.display = 'block';
        };

        const songsource = songsourceeditor.doc.getValue();
        const newsynthsource = synthsourceeditor.doc.getValue();
        const newshadersource = shadersourceeditor.doc.getValue();

        let synthsourceupdated = false;
        let shadersourceupdated = false;
        if (synthsource !== newsynthsource) {
            synthsource = newsynthsource;
            synthsourceupdated = true;
        }
        if (shadersource !== newshadersource) {
            shadersource = newshadersource;
            shadersourceupdated = true;
        }

        if (gitrepoconfig) {
            // Store to git repository
            (async () => {
                if (!gitrepoconfig.songfilename) {
                    gitrepoconfig.songfilename = 'song.js';
                }
                if (!gitrepoconfig.synthfilename) {
                    if (synthsource.startsWith('<?xml')) {
                        gitrepoconfig.synthfilename = 'synth.xml';
                    } else {
                        gitrepoconfig.synthfilename = 'synth.ts';
                    }
                }
                if (!gitrepoconfig.fragmentshader) {
                    gitrepoconfig.fragmentshader = 'shader.glsl';
                }
                // Save asynchronously so that we don't have to wait for it
                writefileandstage(gitrepoconfig.songfilename, songsource);
                if (synthsourceupdated) {
                    writefileandstage(gitrepoconfig.synthfilename, synthsource);
                }
                if (shadersourceupdated) {
                    writefileandstage(gitrepoconfig.fragmentshader, shadersource);
                }
            })();
        } else {
            // Store to localstorage
            localStorage.setItem('storedsongcode', songsource);

            if (synthsourceupdated) {
                synthsource = newsynthsource;
                localStorage.setItem('storedsynthcode', synthsource);
            }
        }

        if (shadersourceupdated) {
            try {
                setupWebGL(shadersource, componentRoot.querySelector("#glCanvas"));
            } catch (e) {
                displayError(`Error compiling shader:\n\n${e.message}`);
            }
        }

        let songmode = 'midi';
        if (songsource.indexOf('SONGMODE=PROTRACKER') >= 0) {
            // special mode: we are building an amiga protracker module
            songmode = SONG_MODE_PROTRACKER;
        } else if (
            songsource.indexOf('global.pattern_size_shift') > -1 ||
            songsource.indexOf('global.bpm') > -1) {
            songmode = SONG_MODE_WASM;
            window.insertRecording = () => insertRecording4klang(insertStringIntoEditor);
        } else {
            const synthSourceIsXML = synthsource.startsWith('<?xml');
            if (synthSourceIsXML && !componentRoot.querySelector('wam-preseteditor')) {
                const presetsui = componentRoot.querySelector('#presetsui');
                presetsui.replaceChild(document.createElement('wam-preseteditor'), presetsui.firstChild);
                toggleEditors('assemblyscripteditor', false);
                componentRoot.querySelector('#syntheditortogglecheckbox').checked = false;
                toggleEditors('presetsui', true);
                componentRoot.querySelector('#preseteditortogglecheckbox').checked = true;
            }
            window.insertRecording = () => insertMidiRecording(insertStringIntoEditor);
            try {
                const eventlist = await compileMidiSong(songsource);
                if (midiInstrumentNames.length > 0) {
                    setInstrumentNames(midiInstrumentNames);
                }
                if (synthSourceIsXML && exportProject) {
                    await exportWAMAudio(eventlist, synthsource);
                }

                if (!synthSourceIsXML) {
                    toggleSpinner(true);
                    const systemSampleRate = new AudioContext().sampleRate;
                    const faustSources = await loadFaustSourcesFromRepo();
                    const synthwasm = await compileWebAssemblySynth(synthsource,
                        undefined,
                        systemSampleRate,
                        false,
                        faustSources
                    );
                    if (synthwasm) {
                        window.WASM_SYNTH_BYTES = synthwasm;
                        webassemblySynthUpdated = true;
                    }
                    if (exportProject) {
                        toggleSpinner(false);
                        const EXPORT_MODE_MIDISYNTH_WASM_LIB = 'midilibmodule';
                        const EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB = 'midimultipartmodule';
                        const EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB_PNG = 'midimultipartmodulepng';
                        const EXPORT_MODE_MIDIPARTS_JSON = 'midipartsjson';

                        exportProject = await modal(`
                            <h3>Select export</h3>
                            <p>
                                <form>
                                    <label><input type="radio" name="exporttype" value="wav48k" checked="checked">WAV (48kHz samplerate)</label><br />
                                    <label><input type="radio" name="exporttype" value="wav">WAV (44.1kHz samplerate)</label><br />
                                    <label><input type="radio" name="exporttype" value="${EXPORT_MODE_MIDISYNTH_WASM_LIB}">WASM Library module</label><br />
                                    <label><input type="radio" name="exporttype" value="${EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB}">WASM midi-multipart module</label><br />
                                    <label><input type="radio" name="exporttype" value="${EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB_PNG}">PNG compressed WASM midi-multipart module</label><br />
                                    <label><input type="radio" name="exporttype" value="${EXPORT_MODE_MIDIPARTS_JSON}">MIDI parts as JSON</label><br />
                                    <label><input type="radio" name="exporttype" value="pngsources">source code as PNG image</label><br />
                                    <label><input type="radio" name="exporttype" value="video">Shader video (without sound)</label><br />
                                </form>
                            </p>
                            <button onclick="getRootNode().result(null)">Cancel</button>
                            <button onclick="getRootNode().result(new FormData(getRootNode().querySelector('form')).get('exporttype'))">
                                Export
                            </button>
                        `);

                        toggleSpinner(true);
                        if (exportProject === 'wav' || exportProject === 'wav48k') {
                            const exportSampleRate = exportProject === 'wav48k' ? 48000 : 44100;
                            const wasmBytes = await compileWebAssemblySynth(
                                synthsource + '\n',
                                undefined,
                                exportSampleRate,
                                false,
                                faustSources
                            );
                            await exportToWav(eventlist, wasmBytes, exportSampleRate);
                        } else if (exportProject === EXPORT_MODE_MIDISYNTH_WASM_LIB) {
                            const wasmbytes = await compileWebAssemblySynth(synthsource,
                                { eventlist: convertEventListToByteArraySequence(eventlist) },
                                44100,
                                exportProject,
                                faustSources
                            );
                            triggerDownload(URL.createObjectURL(new Blob([wasmbytes], { type: "octet/stream" })), 'song.wasm');
                        } else if (
                            exportProject === EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB ||
                            exportProject === EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB_PNG) {
                            const multipartsequence = createMultipatternSequence();
                            const wasmbytes = await compileWebAssemblySynth(synthsource,
                                multipartsequence,
                                44100,
                                EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB,
                                faustSources
                            );
                            if (exportProject === EXPORT_MODE_MIDISYNTH_MULTIPART_WASM_LIB_PNG) {
                                const pngdataurl = encodeBufferAsPNG(wasmbytes);
                                console.log(pngdataurl);
                                console.log((await decodeBufferFromPNG(pngdataurl)).length, wasmbytes.length);
                                triggerDownload(pngdataurl, 'song.wasm.png');
                            } else {
                                triggerDownload(URL.createObjectURL(new Blob([wasmbytes], { type: "octet/stream" })), 'song.wasm');
                            }
                        } else if (exportProject === 'pngsources') {
                            const sourcesbytes = Buffer.from(JSON.stringify({
                                song: songsource,
                                synth: synthsource,
                                shader: shadersource
                            }));
                            triggerDownload(encodeBufferAsPNG(sourcesbytes), 'wasmstuff.png');
                        } else if (exportProject === 'video') {
                            await exportVideo(shadersource, eventlist);
                        } else if (exportProject === EXPORT_MODE_MIDIPARTS_JSON) {
                            const songParts = getSongParts();
                            triggerDownload(URL.createObjectURL(new Blob([JSON.stringify(songParts)],
                                { type: "application/json" })), 'songmidiparts.json');
                        }
                    }
                    toggleSpinner(false);

                    return { eventlist: eventlist, synthwasm: synthwasm };
                } else {
                    window.WASM_SYNTH_BYTES = null;
                    return { eventlist: eventlist, synthsource: synthsource };
                }
            } catch (e) {
                toggleSpinner(false);
                displayError(e);
                throw e;
            }
        }

        const patternToolsGlobal = createPatternToolsGlobal();
        try {
            window.WASM_SYNTH_LOCATION = null;
            if (songmode == SONG_MODE_WASM) {
                const songfunc = new Function(
                    ['global'].concat(Object.keys(patternToolsGlobal)),
                    songsource);
                songfunc.apply(patternToolsGlobal,
                    [patternToolsGlobal].concat(Object.values(patternToolsGlobal)));
            }
        } catch (e) {
            errorMessagesContentElement.innerText = e;
            errorMessagesElement.style.display = 'block';
            throw e;
        }
        const patterns = patternToolsGlobal.generatePatterns();
        const instrumentPatternLists = patternToolsGlobal.generateInstrumentPatternLists();

        const song = {
            instrumentPatternLists: instrumentPatternLists,
            patterns: patterns, BPM: patternToolsGlobal.bpm,
            patternsize: 1 << patternToolsGlobal.pattern_size_shift,
            rowsperbeat: 1 << patternToolsGlobal.pattern_size_shift >> patternToolsGlobal.beats_per_pattern_shift,
            instruments: patternToolsGlobal.instrumentNames.map(instrumentName => patternToolsGlobal.instrumentDefs[instrumentName])
        };

        globalThis.instrumentNames = patternToolsGlobal.instrumentNames;
        globalThis.instrumentDefs = patternToolsGlobal.instrumentDefs;
        globalThis.instrumentGroupMap = patternToolsGlobal.instrumentGroupMap;
        globalThis.ticksperbeat = patternToolsGlobal.ticksperbeat;
        globalThis.noteValues = patternToolsGlobal.noteValues;

        try {
            if (!window.WASM_SYNTH_LOCATION) {
                // if not a precompiled wasm file available in WASM_SYNTH_LOCATION              
                toggleSpinner(true);

                if (isSointuSong(song)) {
                    songmode = SONG_MODE_SOINTU;
                    toggleEditors('assemblyscripteditor', false);
                }
    
                if (exportProject) {
                    toggleSpinner(false);
                    if (songmode == SONG_MODE_WASM) {
                        exportProject = await modal(`
                            <h3>Select WASM module type to export</h3>
                            <p>
                                <form>
                                <label><input type="radio" name="exporttype" value="libmodule">Library module</label><br />
                                </form>
                            </p>
                            <button onclick="getRootNode().result(null)">Cancel</button>
                            <button onclick="getRootNode().result(new FormData(getRootNode().querySelector('form')).get('exporttype'))">
                                Generate WASM module
                            </button>
                        `);
                    } else if (songmode == SONG_MODE_SOINTU) {
                        exportProject = await modal(`
                            <h3>Select export type</h3>
                            <p>
                                <form>
                                <label><input type="radio" name="exporttype" value="wasmmodule" checked="checked">Wasm module</label><br />
                                <label><input type="radio" name="exporttype" value="sointuyaml">Sointu YAML</label><br />
                                </form>
                            </p>
                            <button onclick="getRootNode().result(null)">Cancel</button>
                            <button onclick="getRootNode().result(new FormData(getRootNode().querySelector('form')).get('exporttype'))">
                                Export
                            </button>
                        `);
                    } else if (songmode == SONG_MODE_PROTRACKER) {
                        exportProject = await modal(`
                            <h3>Select export type</h3>
                            <p>
                                <form>
                                <label><input type="radio" name="exporttype" value="protrackermodule" checked="checked">Protracker module</label><br />
                                </form>
                            </p>
                            <button onclick="getRootNode().result(null)">Cancel</button>
                            <button onclick="getRootNode().result(new FormData(getRootNode().querySelector('form')).get('exporttype'))">
                                Export
                            </button>
                        `);
                    }
                    toggleSpinner(true);
                }

                let synthwasm;

                if (songmode == SONG_MODE_SOINTU) {
                    synthwasm = await getSointuWasm(song);
                } else {
                    const faustSources = await loadFaustSourcesFromRepo();
                    synthwasm = await compileWebAssemblySynth(synthsource,
                        exportProject && songmode === SONG_MODE_WASM ? song : undefined,
                        songmode === SONG_MODE_PROTRACKER ? 55856 :
                            new AudioContext().sampleRate,
                        exportProject,
                        faustSources
                    );
                }

                if (synthwasm) {
                    if (exportProject == 'sointuyaml') {
                        triggerDownload(URL.createObjectURL(new Blob([await getSointuYaml(song)], { type: 'application/yaml' })), 'song.yaml');
                    } if (exportProject) {
                        triggerDownload(URL.createObjectURL(new Blob([synthwasm], { type: 'application/octet-stream' })), 'song.wasm');
                    } else {
                        window.WASM_SYNTH_BYTES = synthwasm;
                        webassemblySynthUpdated = true;
                    }
                }
            }
        } catch (e) {
            errorMessagesContentElement.innerText = e;
            errorMessagesElement.style.display = 'block';
            toggleSpinner(false);
            throw e;
        }
        toggleSpinner(false);
        console.log('song mode', songmode);

        if (songmode === SONG_MODE_PROTRACKER) {
            const songworker = new Worker(
                URL.createObjectURL(new Blob([
                    songsource.split("from './lib/").join(`from '${location.origin}${location.pathname === '/' ? '' : location.pathname}/synth1/modformat/lib/`)
                ], { type: "application/javascript" })), { type: "module" }
            );
            const modreciever = new Promise((resolve => songworker.onmessage = msg => resolve(
                msg.data
            )
            ));
            songworker.postMessage({ WASM_SYNTH_BYTES: WASM_SYNTH_BYTES });

            const song = await modreciever;
            if (exportProject) {
                const linkElement = document.createElement('a');
                linkElement.href = URL.createObjectURL(new Blob([song.modbytes], { type: 'application/octet-stream' }));
                linkElement.download = `${song.name.replace(/[^A-Za-z0-9]+/g, '_').toLowerCase()}.mod`;
                linkElement.click();
            }
            return song;
        }

        // Use as recording buffer
        window.recordedSongData = {
            instrumentPatternLists: song.instrumentPatternLists.map(pl => new Array(pl.length).fill(0)),
            patterns: song.patterns.map(p => new Array(p.length).fill(0))
        };

        let instrSelectCount = setInstrumentNames(patternToolsGlobal.instrumentNames);

        const instrSelect = componentRoot.getElementById('midichannelmappingselection');
        Object.keys(patternToolsGlobal.instrumentGroupMap).forEach(groupname => {
            const groupinstruments = patternToolsGlobal.instrumentGroupMap[groupname];
            window.midichannelmappings[groupname] = {
                min: window.midichannelmappings[groupinstruments[0]],
                max: window.midichannelmappings[groupinstruments[groupinstruments.length - 1]]
            };

            const opt = document.createElement('option');
            opt.value = groupname;
            opt.innerText = groupname;
            if (instrSelect.childNodes.length <= instrSelectCount) {
                instrSelect.appendChild(opt);
            } else if (instrSelect.childNodes[instrSelectCount].value !== groupname) {
                instrSelect.replaceChild(opt, instrSelect.childNodes[instrSelectCount]);
            }
            instrSelectCount++;
        });

        for (let n = instrSelectCount; n < instrSelect.childNodes.length; n++) {
            instrSelect.removeChild(instrSelect.childNodes[n]);
        }
        return song;
    }

    async function compileAndPostSong() {
        try {
            // If the Faust editor has unsaved changes, transpile + write
            // the .dsp and the generated .ts to the wasm-git repo first.
            // Errors here are surfaced via #errormessages and abort the save.
            try {
                await saveFaustIfChanged();
            } catch (e) {
                console.error(e);
                return;
            }

            const song = await compileSong();

            // Quantize the wasm + sequencedata swap to the next beat
            // divisible by N. N=0 means "Now" — legacy immediate swap with
            // a brief audible suspend/resume; N>0 stashes in the worklet
            // and swaps live at the bar boundary. Sticky across saves.
            const quantizeSelect = componentRoot.getElementById('saveQuantizeSelect');
            const quantizeN = quantizeSelect ? parseInt(quantizeSelect.value, 10) || 0 : 0;
            const songBpm = midiBpm || 0;

            if (song.synthwasm) {
                await updateSynth(song.synthwasm, addedAudio, quantizeN, songBpm);
            }

            if (song.eventlist) {
                if (song.synthsource) {
                    await wamPostSong(song.eventlist, song.synthsource);
                } else {
                    updateSong(
                        song.eventlist,
                        componentRoot.getElementById('toggleSongPlayCheckbox').checked ? true : false,
                        quantizeN,
                        songBpm,
                    );
                    webassemblySynthUpdated = false;
                }
            } else if (window.audioworkletnode) {
                audioworkletnode.port.postMessage({
                    song: song,
                    samplerate: window.audioworkletnode.context.sampleRate,
                    toggleSongPlay: componentRoot.getElementById('toggleSongPlayCheckbox').checked ? true : false,
                    livewasmreplace: webassemblySynthUpdated,
                    wasm: webassemblySynthUpdated ? window.WASM_SYNTH_BYTES : undefined,
                    quantizeN: quantizeN,
                    bpm: songBpm,
                });
                webassemblySynthUpdated = false;
            }
        } catch (e) {
            console.error(e);
        }
    }

    let storedsongcode = localStorage.getItem('storedsongcode');
    let storedsynthcode = localStorage.getItem('storedsynthcode');
    let storedshadercode = null;

    const gistparam = location.search ? location.search.substring(1).split('&').find(param => param.indexOf('gist=') === 0) : null;
    const gitrepoparam = location.search ? location.search.substring(1).split('&').find(param => param.indexOf('gitrepo=') === 0) : null;
    const pngurlparam = location.search ? location.search.substring(1).split('&').find(param => param.indexOf('pngurl=') === 0) : null;

    if (gistparam) {
        const gistid = gistparam.split('=')[1];

        const gist = await fetch(`https://api.github.com/gists/${gistid}`).then(r => r.json());
        const songfilename = Object.keys(gist.files).find(filename => filename.endsWith('.js'));
        storedsongcode = gist.files[songfilename].content;

        const synthfilename = Object.keys(gist.files).find(filename =>
            filename.endsWith('.ts') ||
            filename.endsWith('.xml') ||
            filename.endsWith('.dsp'));
        if (synthfilename) {
            console.log(`found synth code in ${synthfilename}`);
            storedsynthcode = gist.files[synthfilename].content;
        }

        console.log(`loaded from gist ${gistid}: ${songfilename}`);
    } else if (gitrepoparam) {
        gitrepoconfig = await initWASMGitClient(gitrepoparam.split('=')[1]);
        appendToSubtoolbar1(document.createElement('wasmgit-ui'));
        // wasm-git is ready — connect the bridge and pull the full tree.
        claudeBridge.start();
        claudeBridge.attachGitRepo({ listfiles, readfile, writefileandstage });

        addRemoteSyncListener(async () => {
            // After a pull/commit, re-sync the bridge's mirror.
            claudeBridge.resyncTree().catch((e) => console.warn('bridge resync failed', e));
            try {
                const newconfig = await getConfig();
                if (newconfig && newconfig.songfilename) {
                    gitrepoconfig = newconfig;
                }
            } catch (e) {
                console.warn('Failed to read config, using existing', e);
            }
            try {
                if (gitrepoconfig.songfilename) {
                    storedsongcode = await readfile(gitrepoconfig.songfilename);
                    songsourceeditor.doc.setValue(storedsongcode);
                }
            } catch (e) { }
            try {
                if (gitrepoconfig.synthfilename) {
                    storedsynthcode = await readfile(gitrepoconfig.synthfilename);
                    synthsourceeditor.doc.setValue(storedsynthcode);
                }
            } catch (e) { }
            try {
                if (gitrepoconfig.fragmentshader) {
                    storedshadercode = await readfile(gitrepoconfig.fragmentshader);
                    shadersourceeditor.doc.setValue(storedshadercode);
                }
            } catch (e) { }
        });
        storedsongcode = await readfile(gitrepoconfig.songfilename);
        storedsynthcode = await readfile(gitrepoconfig.synthfilename);
        storedshadercode = await readfile(gitrepoconfig.fragmentshader);

        // Populate the Faust editor's file dropdown from the wasm-git repo
        // (silent if there's no faust/ folder yet).
        refreshFaustFileList().catch(e => console.warn('faust list failed', e));
    } else if (pngurlparam) {
        const pngurl = pngurlparam.split('=')[1];
        const obj = JSON.parse(new TextDecoder().decode(await decodeBufferFromPNG(pngurl)));
        storedsongcode = obj.song;
        storedsynthcode = obj.synth;
        storedshadercode = obj.shader;
    }

    if (storedsongcode) {
        songsourceeditor.doc.setValue(storedsongcode);
    } else {
        songsourceeditor.doc.setValue(await fetch('emptysong.js').then(r => r.text()));
    }

    if (storedsynthcode) {
        synthsourceeditor.doc.setValue(storedsynthcode);
    } else {
        synthsourceeditor.doc.setValue(await fetch('synth1/assembly/mixes/empty.mix.ts').then(r => r.text()));
    }
    if (storedshadercode) {
        shadersourceeditor.doc.setValue(storedshadercode);
        componentRoot.querySelector('#shadereditortogglecheckbox').checked = true;
    } else {
        toggleEditors('shadereditor', false);
    }
    CodeMirror.commands.save = compileAndPostSong;

    const insertStringIntoEditor = (str) => {

        const selection = songsourceeditor.getSelection();

        if (selection.length > 0) {
            songsourceeditor.replaceSelection(str);
        }
        else {

            const doc = songsourceeditor.doc;
            const cursor = doc.getCursor();

            const pos = {
                line: cursor.line,
                ch: cursor.ch
            }

            doc.replaceRange(str, pos);
        }
    }

    window.editoractive = true;
}
