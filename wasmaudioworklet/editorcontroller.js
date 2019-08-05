const editor = CodeMirror(document.getElementById("editor"), {
    value: "",
    mode:  "javascript",
    theme: "monokai"
});

const global = window;
let pattern_tools_src;

document.getElementById('savesongbutton').onclick = () => compileAndPostSong();

window.onkeydown = (k) => {
    if((event.ctrlKey || event.metaKey) && event.which == 83) {
        compileAndPostSong();
        event.preventDefault();
        return false;
    }
};

async function initEditor() {
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
            const recordingString = `"${instrumentName}": pp(4, [${patterndata.join(',')}]),\n`;
            
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