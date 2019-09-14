import { loadScript } from './common/scriptloader.js';

async function loadCodeMirror() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/codemirror.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/mode/javascript/javascript.js');
    loadScript('https://codemirror.net/addon/search/search.js');
    loadScript('https://codemirror.net/addon/search/searchcursor.js');
    loadScript('https://codemirror.net/addon/search/jump-to-line.js');
    loadScript('https://codemirror.net/addon/dialog/dialog.js');
}

export async function initEditor(componentRoot) {
    await loadCodeMirror();

    const editor = CodeMirror(componentRoot.getElementById("editor"), {
        value: "",
        mode:  "javascript",
        theme: "monokai"
    });

    const global = window;
    let pattern_tools_src;

    componentRoot.getElementById('savesongbutton').onclick = () => compileAndPostSong();

    window.onkeydown = (k) => {
        if((event.ctrlKey || event.metaKey) && event.which == 83) {
            compileAndPostSong();
            event.preventDefault();
            return false;
        }
    };

    window.compileSong = function() {
        const songsource = editor.doc.getValue();
        localStorage.setItem('storedsongcode', songsource);
        eval(pattern_tools_src);
        eval(songsource);
        const patterns = generatePatterns();
        const instrumentPatternLists = generateInstrumentPatternLists();
        const song = {instrumentPatternLists: instrumentPatternLists, patterns: patterns, BPM: window.bpm};
        // Use as recording buffer
        window.recordedSongData = {
            instrumentPatternLists: song.instrumentPatternLists.map(pl => new Array(pl.length).fill(0)),
            patterns: song.patterns.map(p => new Array(p.length).fill(0))
        };    
        
        const instrSelect = componentRoot.getElementById('midichannelmappingselection');
        let instrSelectCount = 0;
        instrumentNames.forEach((name,ndx) => {            
            const opt = document.createElement('option');
            opt.value = name;
            opt.innerText = name;            
            window.midichannelmappings[name] = ndx;
            if(instrSelect.childNodes.length <= ndx) {
                instrSelect.appendChild(opt);
            } else if(instrSelect.childNodes[ndx].value !== name) {
                instrSelect.replaceChild(opt, instrSelect.childNodes[ndx]);
            }
            instrSelectCount++;
        });
        
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

    function compileAndPostSong() {
        try {
            const song =  compileSong();
            
            audioworkletnode.port.postMessage({
                song: song
            });
        } catch(e) {
            console.error(e);
        }
    }

    let storedsongcode = localStorage.getItem('storedsongcode');
        
        const gistparam = location.search ? location.search.substring(1).split('&').find(param => param.indexOf('gist=') === 0) : null;

        if(gistparam) {
            const gistid = gistparam.split('=')[1];
            
            const gist = await fetch(`https://api.github.com/gists/${gistid}`).then(r => r.json());
            const songfilename = Object.keys(gist.files).find(filename => filename.endsWith('.js'));
            storedsongcode = gist.files[songfilename].content;
            console.log(`loaded from gist ${gistid}: ${songfilename}`);
        }

        if(storedsongcode) {
            editor.doc.setValue(storedsongcode);
        } else {
            editor.doc.setValue(await fetch('emptysong.js').then(r => r.text()));
        }
        CodeMirror.commands.save = compileAndPostSong;
        
        const insertStringIntoEditor = (str) => {

            const selection = editor.getSelection();

            if(selection.length>0){
                editor.replaceSelection(str);
            }
            else{

                const doc = editor.doc;
                const cursor = doc.getCursor();

                const pos = {
                line: cursor.line,
                ch: cursor.ch
                }

                doc.replaceRange(str, pos);
            }
        }

        window.insertRecording = () => {
        const recorded = window.recordedSongData;
        
        const recordings = {};
        recorded.instrumentPatternLists.forEach((patterinIndexList, instrumentIndex) => {
            patterinIndexList.forEach(patternIndex => {
                if(patternIndex > 0 && !recordings[instrumentNames[instrumentIndex]]) {
                    recordings[instrumentNames[instrumentIndex]] = [];
                }
                if(patternIndex > 0 && recordings[instrumentNames[instrumentIndex]]) {
                    recorded.patterns[patternIndex-1].forEach(val => 
                        recordings[instrumentNames[instrumentIndex]].push(val)
                    );                        
                }
            })
        });
        const groupRecordings = {};
        Object.keys(recordings).forEach(instrumentName => {
            let patterndata = recordings[instrumentName];

            patterndata = patterndata.map((v, ndx) => {
                if(v > 0) {
                    if(instrumentDefs[instrumentName].type === 'number') {
                        return v + '';
                    } else if(instrumentDefs[instrumentName].type === 'note') {
                        let noteLen = 1;
                        while(patterndata[ndx + noteLen] === 1) {
                            noteLen ++;
                        }
                        const beatLength = global.ticksperbeat();
                        let divisor = beatLength;
                        while ( (noteLen %2) === 0 && (divisor % 2) === 0) {
                            noteLen /= 2;
                            divisor /= 2;
                        }

                        const lengthExpression = noteLen === 1 && divisor === beatLength ? '' :
                            divisor === 1 ? `(${noteLen})` : `(${noteLen}/${divisor})`;

                        return v > 1 ? `${window.noteValues[v]}${lengthExpression}` : '';
                    }
                } else {
                    return '';
                }
            });
            
            let groupInstrumentIndex;
            const groupName = Object.keys(instrumentGroupMap).find(groupname => {
                groupInstrumentIndex = instrumentGroupMap[groupname].findIndex(instr => instr === instrumentName);
                return groupInstrumentIndex > -1;
            });

            
            
            if(groupName) {
                if(!groupRecordings[groupName]) {
                    groupRecordings[groupName] = new Array(instrumentGroupMap[groupName].length);
                }    
                groupRecordings[groupName][groupInstrumentIndex] = patterndata;
            } else {
                const recordingString = `"${instrumentName}": pp(4, [${patterndata.join(',')}]),\n`;            
                insertStringIntoEditor(recordingString);
            }            
        });
        Object.keys(groupRecordings).forEach(group => {
            const recordings = groupRecordings[group];
            const recordingArr = [];
            recordings.forEach((recording, instrIndex) => {
                recording.forEach((val, ndx) => {
                    if(!recordingArr[ndx]) {
                        recordingArr[ndx] = [];
                    }
                    recordingArr[ndx][instrIndex] = val;
                });
            });
            const recordingdatastring = recordingArr.map(values => {
                    if(values.filter(val => val ? true: false).length === 0) {
                        return '';
                    } else if(values[0] && values.filter(val => val ? true: false).length === 1) {
                        return values[0];
                    } else {
                        return `[${values.join(',')}]`;
                    }
                }).join(',');
            const recordingString = `"${group}": pp(4, [${recordingdatastring}], ${recordings.length}),\n`;
            insertStringIntoEditor(recordingString);
        });

        // Clear recordings
        window.recordedSongData = {
            instrumentPatternLists: recorded.instrumentPatternLists.map(pl => new Array(pl.length).fill(0)),
            patterns: recorded.patterns.map(p => new Array(p.length).fill(0))
        };    
    };
    window.editoractive = true;

    pattern_tools_src = await fetch('pattern_tools.js').then(r => r.text());
}