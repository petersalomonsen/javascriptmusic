import { loadScript, loadCSS } from './common/scriptloader.js';
import { addedAudio, compileSong as compileMidiSong, convertEventListToByteArraySequence, createMultipatternSequence, instrumentNames as midiInstrumentNames } from './midisequencer/songcompiler.js';
import { insertMidiRecording } from './midisequencer/editorfunctions.js';
import { postSong as wamPostSong, exportWAMAudio } from './webaudiomodules/wammanager.js';
import { insertRecording as insertRecording4klang } from './4klangsequencer/editorfunctions.js';
import { } from './webaudiomodules/preseteditor.js';
import { setInstrumentNames, appendToSubtoolbar1 } from './app.js';
import { toggleSpinner } from './common/ui/progress-spinner.js';

import { readfile, writefileandstage, initWASMGitClient, addRemoteSyncListener } from './wasmgit/wasmgitclient.js';
import { createPatternToolsGlobal } from './pattern_tools.js';
import { modal } from './common/ui/modal.js';
import { updateSong, exportToWav } from './synth1/audioworklet/midisynthaudioworklet.js';
import { compileWebAssemblySynth } from './synth1/browsersynthcompiler.js';

export let songsourceeditor;
export let synthsourceeditor;
let gitrepoconfig = null;

async function loadCodeMirror() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.55.0/codemirror.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.55.0/mode/javascript/javascript.js');

    await loadScript('https://codemirror.net/addon/search/search.js');
    await loadScript('https://codemirror.net/addon/search/searchcursor.js');
    await loadScript('https://codemirror.net/addon/search/jump-to-line.js');
    await loadScript('https://codemirror.net/addon/dialog/dialog.js');

    await loadScript('https://unpkg.com/jshint@2.9.6/dist/jshint.js');
    await loadScript('https://codemirror.net/addon/lint/lint.js');
    await loadScript('https://codemirror.net/addon/lint/javascript-lint.js');
    await loadCSS('https://codemirror.net/addon/lint/lint.css');
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

    let synthsource;

    componentRoot.getElementById('savesongbutton').onclick = () => compileAndPostSong();

    window.compileSong = async function (exportwasm = false) {
        const errorMessagesElement = componentRoot.querySelector('#errormessages');
        const errorMessagesContentElement = errorMessagesElement.querySelector('span');
        errorMessagesContentElement.innerText = '';
        errorMessagesElement.style.display = 'none';

        const songsource = songsourceeditor.doc.getValue();
        const newsynthsource = synthsourceeditor.doc.getValue();

        if (gitrepoconfig) {
            let synthsourceupdated = false;
            if (synthsource !== newsynthsource) {
                synthsource = newsynthsource;
                synthsourceupdated = true;
            }
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

                // Save asynchronously so that we don't have to wait for it
                await writefileandstage(gitrepoconfig.songfilename, songsource);

                if (synthsourceupdated) {
                    writefileandstage(gitrepoconfig.synthfilename, synthsource);
                }
            })();
        } else {
            // Store to localstorage
            localStorage.setItem('storedsongcode', songsource);

            if (newsynthsource !== synthsource) {
                synthsource = newsynthsource;
                localStorage.setItem('storedsynthcode', synthsource);
            }
        }

        let songmode = 'midi';
        if (songsource.indexOf('SONGMODE=PROTRACKER') >= 0) {
            // special mode: we are building an amiga protracker module
            songmode = 'protracker';
        } else if (
            songsource.indexOf('global.pattern_size_shift') > -1 ||
            songsource.indexOf('global.bpm') > -1) {
            songmode = 'WASM';
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
                if (synthSourceIsXML && exportwasm) {
                    await exportWAMAudio(eventlist, synthsource);
                }

                if (!synthSourceIsXML) {
                    toggleSpinner(true);
                    const systemSampleRate = new AudioContext().sampleRate;
                    const synthwasm = await compileWebAssemblySynth(synthsource,
                        undefined,
                        systemSampleRate,
                        false
                    );
                    if (synthwasm) {
                        window.WASM_SYNTH_BYTES = synthwasm;
                        webassemblySynthUpdated = true;
                    }
                    if (exportwasm) {
                        toggleSpinner(false);
                        exportwasm = await modal(`
                            <h3>Select export</h3>
                            <p>
                                <form>
                                <label><input type="radio" name="exporttype" value="wav48k" checked="checked">WAV (48kHz samplerate)</label><br />
                                <label><input type="radio" name="exporttype" value="wav">WAV (44.1kHz samplerate)</label><br />                                
                                <label><input type="radio" name="exporttype" value="midilibmodule">WASM Library module</label><br />
                                <label><input type="radio" name="exporttype" value="midimultipartmodule">WASM midi-multipart module</label><br />
                                </form>
                            </p>
                            <button onclick="getRootNode().result(null)">Cancel</button>
                            <button onclick="getRootNode().result(new FormData(getRootNode().querySelector('form')).get('exporttype'))">
                                Export
                            </button>
                        `);

                        if (exportwasm === 'wav' || exportwasm === 'wav48k') {
                            toggleSpinner(true);
                            const exportSampleRate = exportwasm === 'wav48k' ? 48000 : 44100;
                            const wasmBytes = await compileWebAssemblySynth(
                                synthsource + '\n',
                                undefined,
                                exportSampleRate,
                                false
                            );
                            await exportToWav(eventlist, wasmBytes, exportSampleRate);
                        } else if (exportwasm === 'midilibmodule') {
                            toggleSpinner(true);
                            await compileWebAssemblySynth(synthsource,
                                { eventlist: convertEventListToByteArraySequence(eventlist) },
                                44100,
                                exportwasm
                            );
                        } else if (exportwasm === 'midimultipartmodule') {
                            toggleSpinner(true);
                            const multipartsequence = createMultipatternSequence();
                            await compileWebAssemblySynth(synthsource,
                                multipartsequence,
                                44100,
                                exportwasm
                            );
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
                errorMessagesContentElement.innerText = e;
                errorMessagesElement.style.display = 'block';
                throw e;
            }
        }

        const patternToolsGlobal = createPatternToolsGlobal();
        try {
            window.WASM_SYNTH_LOCATION = null;
            if (songmode === 'WASM') {
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
            patternsize: 1 << patternToolsGlobal.pattern_size_shift
        };

        try {
            if (!window.WASM_SYNTH_LOCATION) {
                // if not a precompiled wasm file available in WASM_SYNTH_LOCATION              
                toggleSpinner(true);

                if (exportwasm) {
                    toggleSpinner(false);
                    exportwasm = await modal(`
                        <h3>Select WASM module type to export</h3>
                        <p>
                            <form>
                            <label><input type="radio" name="exporttype" value="wasimain" checked="checked">Self executable WASI module</label><br />
                            <label><input type="radio" name="exporttype" value="libmodule">Library module</label><br />
                            </form>
                        </p>
                        <button onclick="getRootNode().result(null)">Cancel</button>
                        <button onclick="getRootNode().result(new FormData(getRootNode().querySelector('form')).get('exporttype'))">
                            Generate WASM module
                        </button>
                    `);
                    toggleSpinner(true);
                }

                const synthwasm = await compileWebAssemblySynth(synthsource,
                    exportwasm && songmode === 'WASM' ? song : undefined,
                    songmode === 'protracker' ? 55856 :
                        new AudioContext().sampleRate,
                    exportwasm
                );
                if (synthwasm) {
                    window.WASM_SYNTH_BYTES = synthwasm;
                    webassemblySynthUpdated = true;
                }
            }
        } catch (e) {
            errorMessagesContentElement.innerText = e;
            errorMessagesElement.style.display = 'block';
            throw e;
        }
        toggleSpinner(false);
        console.log('song mode', songmode);

        if (songmode === 'protracker') {
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
            if (exportwasm) {
                const linkElement = document.createElement('a');
                linkElement.href = URL.createObjectURL(new Blob([song.modbytes]), 'application/octet-stream');
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
            const song = await compileSong();

            if (song.synthwasm) {
                audioworkletnode.port.postMessage({
                    wasm: song.synthwasm,
                    audio: addedAudio
                });
            }

            if (song.eventlist) {
                if (song.synthsource) {
                    await wamPostSong(song.eventlist, song.synthsource);
                } else {
                    updateSong(song.eventlist, componentRoot.getElementById('toggleSongPlayCheckbox').checked ? true : false);
                    webassemblySynthUpdated = false;
                }
            } else if (window.audioworkletnode) {
                audioworkletnode.port.postMessage({
                    song: song,
                    samplerate: window.audioworkletnode.context.sampleRate,
                    toggleSongPlay: componentRoot.getElementById('toggleSongPlayCheckbox').checked ? true : false,
                    livewasmreplace: webassemblySynthUpdated,
                    wasm: webassemblySynthUpdated ? window.WASM_SYNTH_BYTES : undefined
                });
                webassemblySynthUpdated = false;
            }
        } catch (e) {
            console.error(e);
        }
    }

    let storedsongcode = localStorage.getItem('storedsongcode');
    let storedsynthcode = localStorage.getItem('storedsynthcode');

    const gistparam = location.search ? location.search.substring(1).split('&').find(param => param.indexOf('gist=') === 0) : null;
    const gitrepoparam = location.search ? location.search.substring(1).split('&').find(param => param.indexOf('gitrepo=') === 0) : null;

    if (gistparam) {
        const gistid = gistparam.split('=')[1];

        const gist = await fetch(`https://api.github.com/gists/${gistid}`).then(r => r.json());
        const songfilename = Object.keys(gist.files).find(filename => filename.endsWith('.js'));
        storedsongcode = gist.files[songfilename].content;

        const synthfilename = Object.keys(gist.files).find(filename =>
            filename.endsWith('.ts') ||
            filename.endsWith('.xml'));
        if (synthfilename) {
            console.log(`found synth code in ${synthfilename}`);
            storedsynthcode = gist.files[synthfilename].content;
        }

        console.log(`loaded from gist ${gistid}: ${songfilename}`);
    } else if (gitrepoparam) {
        gitrepoconfig = await initWASMGitClient(gitrepoparam.split('=')[1]);
        appendToSubtoolbar1(document.createElement('wasmgit-ui'));

        addRemoteSyncListener(async () => {
            storedsongcode = await readfile(gitrepoconfig.songfilename);
            storedsynthcode = await readfile(gitrepoconfig.synthfilename);
            songsourceeditor.doc.setValue(storedsongcode);
            synthsourceeditor.doc.setValue(storedsynthcode);
        });
        storedsongcode = await readfile(gitrepoconfig.songfilename);
        storedsynthcode = await readfile(gitrepoconfig.synthfilename);
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
