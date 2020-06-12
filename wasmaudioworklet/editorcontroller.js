import { loadScript, loadCSS } from './common/scriptloader.js';
import { compileSong as compileMidiSong } from './midisequencer/songcompiler.js';
import { insertMidiRecording } from './midisequencer/editorfunctions.js';
import { postSong as wamPostSong, exportWAMAudio } from './webaudiomodules/wammanager.js';
import { insertRecording as insertRecording4klang } from './4klangsequencer/editorfunctions.js';
import {} from './webaudiomodules/preseteditor.js';
import { setInstrumentNames, appendToSubtoolbar1, toggleSpinner } from './app.js';
import { readfile, writefileandstage, initWASMGitClient, addRemoteSyncListener } from './wasmgit/wasmgitclient.js';

export let songsourceeditor;
export let synthsourceeditor;
let gitrepoconfig = null;

async function loadCodeMirror() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/codemirror.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/mode/javascript/javascript.js'); 
    
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
const synthcompilerworker = new Worker('synth1/browsercompilerwebworker.js');

async function compileWebAssemblySynth(synthsource, song, samplerate) {
    synthcompilerworker.postMessage({
        synthsource: synthsource,
        samplerate: samplerate,
        song: song
    });
    
    const result = await new Promise((resolve) => synthcompilerworker.onmessage = (msg) => resolve(msg));

    if(result.data.binary) {
        console.log('successfully compiled webassembly synth');
        window.WASM_SYNTH_BYTES = result.data.binary;
        webassemblySynthUpdated = true;
    } else if(result.data.downloadWASMurl) {
        const linkElement = document.createElement('a');
        linkElement.href = result.data.downloadWASMurl;
        linkElement.download = 'song.wasm';
        linkElement.click();
    } else if(result.data.error) {
        throw new Error(result.data.error);
    } else {
        console.log('no changes for webassembly synth');
    }
}

export async function initEditor(componentRoot) {
    toggleSpinner(true);
    await loadCodeMirror();

    songsourceeditor = CodeMirror(componentRoot.getElementById("editor"), {
        value: "",
        mode:  "javascript",
        theme: "monokai",
        lineNumbers: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: {
            'esversion': '8',
            'elision': true,
            'laxcomma': true
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
        componentRoot.getElementById(editorid).style.display = checked ? 'block': 'none';
        const editors = componentRoot.querySelectorAll('.editor');
        let visibleEditors = [];
        for (let n=0; n<editors.length; n++) {
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
    
    const global = window;
    let pattern_tools_src;
    let synthsource;

    componentRoot.getElementById('savesongbutton').onclick = () => compileAndPostSong();

    window.compileSong = async function(exportwasm=false) {
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
        
        let songmode = 'WASM';
        if (songsource.indexOf('SONGMODE=PROTRACKER') >= 0) {
            // special mode: we are building an amiga protracker module
            songmode = 'protracker';
        } else if (songsource.indexOf('SONGMODE=YOSHIMI') >= 0) {
            // special mode: yoshimi midi synth
            songmode = 'yoshimi';
            if( !componentRoot.querySelector('wam-preseteditor')) {
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
                if (exportwasm) {
                    await exportWAMAudio(eventlist, synthsource);
                }    
                return { eventlist: eventlist, synthsource: synthsource };
            } catch(e) {
                errorMessagesContentElement.innerText = e;
                errorMessagesElement.style.display = 'block';
                throw e;
            }
        } else {
            window.insertRecording = () => insertRecording4klang(insertStringIntoEditor);
        }

        
        eval(pattern_tools_src);
        try {
            window.WASM_SYNTH_LOCATION = null;
            if (songmode === 'WASM') {
                eval(songsource);
            }
        } catch(e) {
            errorMessagesContentElement.innerText = e;
            errorMessagesElement.style.display = 'block';
            throw e;
        }
        const patterns = generatePatterns();
        const instrumentPatternLists = generateInstrumentPatternLists();
        const song = {
                instrumentPatternLists: instrumentPatternLists,
                patterns: patterns, BPM: window.bpm,
                patternsize: 1 << window.pattern_size_shift
        };

        const spinner = componentRoot.querySelector('.spinner');
        try {
            if (!window.WASM_SYNTH_LOCATION) {
                // if not a precompiled wasm file available in WASM_SYNTH_LOCATION              
                spinner.style.display = 'block';
                await compileWebAssemblySynth(synthsource,
                        exportwasm && songmode === 'WASM' ? song: undefined,
                        songmode === 'protracker' ? 55856:
                        new AudioContext().sampleRate                        
                    );                
            }
        } catch(e) {
            errorMessagesContentElement.innerText = e;
            errorMessagesElement.style.display = 'block';
            throw e;
        }
        spinner.style.display = 'none';
        console.log('song mode', songmode);

        if (songmode === 'protracker') {
            const songworker = new Worker(
                URL.createObjectURL(new Blob([
                    songsource.split("from './lib/").join(`from '${location.origin}${location.pathname === '/' ? '' : location.pathname}/synth1/modformat/lib/`)
                ],{type: "application/javascript"})), {type: "module"}
            );
            const modreciever = new Promise((resolve => songworker.onmessage = msg => resolve(
                    msg.data
                )
            ));
            songworker.postMessage({WASM_SYNTH_BYTES: WASM_SYNTH_BYTES});
            
            const song = await modreciever;
            if(exportwasm) {
                const linkElement = document.createElement('a');
                linkElement.href = URL.createObjectURL(new Blob([song.modbytes]), 'application/octet-stream');
                linkElement.download = `${song.name.replace(/[^A-Za-z0-9]+/g,'_').toLowerCase()}.mod`;
                linkElement.click();
            }
            return song;
        }

        // Use as recording buffer
        window.recordedSongData = {
            instrumentPatternLists: song.instrumentPatternLists.map(pl => new Array(pl.length).fill(0)),
            patterns: song.patterns.map(p => new Array(p.length).fill(0))
        };    
        
        let instrSelectCount = setInstrumentNames(instrumentNames);
        
        const instrSelect = componentRoot.getElementById('midichannelmappingselection');
        Object.keys(instrumentGroupMap).forEach(groupname => {            
            const groupinstruments = instrumentGroupMap[groupname];
            window.midichannelmappings[groupname] = {
                min: window.midichannelmappings[groupinstruments[0]],
                max: window.midichannelmappings[groupinstruments[groupinstruments.length - 1]]
            };
            
            const opt = document.createElement('option');
            opt.value = groupname;
            opt.innerText = groupname;
            if(instrSelect.childNodes.length <= instrSelectCount) {
                instrSelect.appendChild(opt);
            } else if(instrSelect.childNodes[instrSelectCount].value !== groupname) {
                instrSelect.replaceChild(opt, instrSelect.childNodes[instrSelectCount]);
            }
            instrSelectCount++;
        });

        for(let n=instrSelectCount; n < instrSelect.childNodes.length; n++) {
            instrSelect.removeChild(instrSelect.childNodes[n]);
        }
        return song;
    }

    async function compileAndPostSong() {
        try {
            const song = await compileSong();

            if (song.eventlist) {
                await wamPostSong(song.eventlist, song.synthsource);
            } else if(window.audioworkletnode) {
                audioworkletnode.port.postMessage({
                    song: song,
                    samplerate: window.audioworkletnode.context.sampleRate, 
                    toggleSongPlay: componentRoot.getElementById('toggleSongPlayCheckbox').checked ? true: false,
                    livewasmreplace: webassemblySynthUpdated,
                    wasm: webassemblySynthUpdated ? window.WASM_SYNTH_BYTES : undefined
                });
                webassemblySynthUpdated = false;
            }
        } catch(e) {
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
        if(synthfilename) {
            console.log(`found synth code in ${synthfilename}`);
            storedsynthcode = gist.files[synthfilename].content;
        }

        console.log(`loaded from gist ${gistid}: ${songfilename}`);
    } else if (gitrepoparam) {
        appendToSubtoolbar1(document.createElement('wasmgit-ui'));
        gitrepoconfig = await initWASMGitClient(gitrepoparam.split('=')[1]);
        
        addRemoteSyncListener(async () => {
            storedsongcode = await readfile(gitrepoconfig.songfilename);
            storedsynthcode = await readfile(gitrepoconfig.synthfilename);
            songsourceeditor.doc.setValue(storedsongcode);
            synthsourceeditor.doc.setValue(storedsynthcode);
        });
        storedsongcode = await readfile(gitrepoconfig.songfilename);
        storedsynthcode = await readfile(gitrepoconfig.synthfilename);
    }

    if(storedsongcode) {
        songsourceeditor.doc.setValue(storedsongcode);
    } else {
        songsourceeditor.doc.setValue(await fetch('emptysong.js').then(r => r.text()));
    }

    if(storedsynthcode) {
        synthsourceeditor.doc.setValue(storedsynthcode);
    } else {
        synthsourceeditor.doc.setValue(await fetch('synth1/assembly/mixes/empty.mix.ts').then(r => r.text()));
    }
    CodeMirror.commands.save = compileAndPostSong;
    
    const insertStringIntoEditor = (str) => {

        const selection = songsourceeditor.getSelection();

        if(selection.length>0){
            songsourceeditor.replaceSelection(str);
        }
        else{

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

    pattern_tools_src = await fetch('pattern_tools.js').then(r => r.text());
}
