var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
document.getElementById('editor').style.backgroundColor = 'rgba(0,0,0,0.5)';
const global = window;
let pattern_tools_src;

async function initEditor() {
    const storedsongcode = localStorage.getItem('storedsongcode');
    if(storedsongcode) {
        editor.session.setValue(storedsongcode);
    } else {
        editor.session.setValue(await fetch('emptysong.js').then(r => r.text()));
    }
    editor.commands.addCommand({
        name: 'save',
        bindKey: {win: "Ctrl-S", "mac": "Cmd-S"},
        exec: compileAndPostSong
    });
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
        Object.keys(recordings).forEach(instrumentName => {
            let patterndata = recordings[instrumentName];
            patterndata = patterndata.map(v => {
                if(v > 0) {
                    if(instrumentDefs[instrumentName].type === 'number') {
                        return v + '';
                    } else if(instrumentDefs[instrumentName].type === 'note') {
                        return v > 1 ? window.noteValues[v] : 'hld';
                    }
                } else {
                    return '';
                }
            });
            editor.insert(
                `"${instrumentName}": pp(4, [${patterndata.join(',')}]),\n`
            )
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

window.compileSong = function() {
    const songsource = editor.session.getValue();
    localStorage.setItem('storedsongcode', songsource);
    eval(pattern_tools_src);
    eval(songsource);
    const patterns = generatePatterns();
    const instrumentPatternLists = generateInstrumentPatternLists();
    const song = {instrumentPatternLists: instrumentPatternLists, patterns: patterns};
    // Use as recording buffer
    window.recordedSongData = {
        instrumentPatternLists: song.instrumentPatternLists.map(pl => new Array(pl.length).fill(0)),
        patterns: song.patterns.map(p => new Array(p.length).fill(0))
    };    
    
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
initEditor();