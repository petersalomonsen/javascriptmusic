// The code in the main global scope.

let audioworkletnode;
window.recordedmidi = [];

const localstoragesongcache_default = 'localstoragesongcache_default';
window.onload = () => {
    if(!localStorage.getItem(localstoragesongcache_default)) {
        document.querySelector('#songselection').value = 'testsong';
    }
}

window.startaudio = async () => {          
    const bytes = await fetch('synth1/build/index.wasm').then(response =>
        response.arrayBuffer()
    );
      
    const songid = document.querySelector('#songselection').value;  
    let song;
    if(!songid || songid.indexOf('localstoragesongcache_') === 0) {
        
        console.log('getting song from localstorage', songid);
        song = JSON.parse(localStorage.getItem(songid));
        if(!song) {
            song = {"patterns":[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],"instrumentPatternLists":[[0],[0],[0],[0],[0],[1],[0],[0],[0]]};
        }
    } else {
        song = JSON.parse(await fetch('synth1/songs/'+songid+'.json').then(response =>
            response.text()
        ));
    }
    
    let context = new AudioContext();

    await context.audioWorklet.addModule('testprocessors.js');
    audioworkletnode = new AudioWorkletNode(context, 'my-worklet-processor',
        {outputChannelCount: [2]});
    
    audioworkletnode.port.start();
    audioworkletnode.port.postMessage({ topic: "wasm", 
        samplerate: context.sampleRate, 
        wasm: bytes, 
        song: song,
        toggleSongPlay: document.getElementById('toggleSongPlayCheckbox').checked ? true: false
    });
    const activenotes = new Array(song.instrumentPatternLists.length).fill(0);
    
    audioworkletnode.port.onmessage = msg => {
        if(msg.data.channelvalues) {
            const channelvalues = msg.data.channelvalues;
            for(let n=0;n<channelvalues.length;n++) {
                const note = channelvalues[n];            
                if(note !==1 && note!==activenotes[n]) {                
                    visualizeNoteOn(activenotes[n], 0);
                    activenotes[n] = 0;
                } 
                if(note > 1) {                
                    visualizeNoteOn(note, 127);
                    activenotes[n] = note;
                }            
            };
        }
        if(msg.data.patternData) {
            song.patterns[msg.data.recordedPatternNo - 1] = msg.data.patternData;
            song.instrumentPatternLists[msg.data.channel][msg.data.instrumentPatternIndex] = msg.data.recordedPatternNo;
            localStorage.setItem(localstoragesongcache_default, JSON.stringify(song));
        }
    };
    audioworkletnode.connect(context.destination);
};

window.stopaudio = async () => {
    if(audioworkletnode) {
        new Array(128).fill(0).map((n,ndx) => ndx).forEach(n => visualizeNoteOn(n, 0));
        audioworkletnode.disconnect();
        audioworkletnode = null;
    }
}

window.restartaudio = async () => {
    await stopaudio();
    await startaudio();
};

window.toggleSongPlay = (status) => {
    if(audioworkletnode) {        
        audioworkletnode.port.postMessage({ toggleSongPlay: status});
    }
};

window.sendNoteToWorklet = (channel, note) => {
    if(audioworkletnode) {        
        audioworkletnode.port.postMessage({ channel: channel, note: note});
    }
}


const polyphonicmapByNote = {};

window.sendNoteToWorkletPolyphonic = (minchannel, maxchannel, note, velocity) => {
    
    if(polyphonicmapByNote[note]!==undefined && velocity === 0) {
        window.sendNoteToWorklet(polyphonicmapByNote[note], 0);
        delete polyphonicmapByNote[note];
    } else if(polyphonicmapByNote[note]!==undefined) {
        return;
    }

    if(velocity > 0) {
        const busyChannels = {};
        Object.keys(polyphonicmapByNote).map(note => polyphonicmapByNote[note]).forEach(ch => busyChannels[ch] = true);
        for(let ch = minchannel; ch<=maxchannel ; ch++) {
            if(!busyChannels[ch]) {
                window.sendNoteToWorklet(ch, note);
                polyphonicmapByNote[note] = ch;
                break;
            }
        }
    }
}

const channelnotemap = {};

const sendNoteToWorkletSingle = (channel, note, velocity) => {
    if(velocity > 0) {
        channelnotemap[channel] = note;
        window.sendNoteToWorklet(channel, note);
    } else if(channelnotemap[channel]===note) {
        window.sendNoteToWorklet(channel, 0);
        channelnotemap[channel] = 0;
    }
};

const midichannelmappings = {    
    'polyphonicpads': {min: 2, max: 4},
    'bell': 0,
    'bass': 1,
    'kick': 5,
    'snare': 6,
    'hihat': 8,
    'drivelead': 7
};

window.currentMidiChannelMapping = 'bell';

window.clearPattern = function() {    
    const mappedChannel = midichannelmappings[currentMidiChannelMapping];
    const min = mappedChannel.min !== undefined ? mappedChannel.min : mappedChannel;
    const max = mappedChannel.max !== undefined ? mappedChannel.max : mappedChannel;
    for(let ch = min ; ch <= max; ch++) {
        audioworkletnode.port.postMessage({ channel: ch, clearpattern: true});
    }    
}

function processNoteMessage(note, velocity) {
    visualizeNoteOn(note, velocity);

    const mappedChannel = midichannelmappings[currentMidiChannelMapping];
    if(mappedChannel.min !== undefined) {
        sendNoteToWorkletPolyphonic(mappedChannel.min, mappedChannel.max, note,velocity);
    } else {
        sendNoteToWorkletSingle(mappedChannel,note,velocity);
    }   
}

async function startmidi() {
    const midi = await navigator.requestMIDIAccess();
    
    for (var input of midi.inputs.values()) {
        input.onmidimessage = (msg) => {
            const msgType = (msg.data[0] & 0xf0);
            if(msgType === 0x90 || msgType === 0x80) {                
                // const channel = msg.data[0] & 0x0f;
                const note = msg.data[1];
                const velocity = msgType === 0x80 ? 0 : msg.data[2];                    
                
                processNoteMessage(note, velocity);
                
                window.recordedmidi.push([new Date().getTime()].concat(msg.data));
            }
        };
    }
}

startmidi();

window.lowerkeyboardkeys = ["KeyZ","KeyS","KeyX","KeyD","KeyC","KeyV","KeyG","KeyB","KeyH","KeyN","KeyJ","KeyM","Comma","KeyL","Period","Semicolon","Slash"];
window.upperkeyboardkeys = ["KeyQ","Digit2","KeyW","Digit3","KeyE","KeyR","Digit5","KeyT","Digit6","KeyY","Digit7","KeyU","KeyI","Digit9","KeyO","Digit0","KeyP","BracketLeft"];

let basenote = 48;

window.onkeydown = (k) => {
    let upperkeyboardindex = upperkeyboardkeys.findIndex(code => code === k.code);
    let lowerkeyboardindex = lowerkeyboardkeys.findIndex(code => code === k.code);
    if(upperkeyboardindex >= 0) {
        k.preventDefault();
        processNoteMessage(basenote + 12 + upperkeyboardindex, 100);
    } else if(lowerkeyboardindex >= 0) {
        k.preventDefault();
        processNoteMessage(basenote + lowerkeyboardindex, 100);
    } else if(k.code === 'ArrowRight') {
        k.preventDefault();
        if(basenote<108) {
            basenote += 12;
        }
    } else if(k.code === 'ArrowLeft') {
        k.preventDefault();
        if(basenote > 12) {
            basenote -= 12;
        }
    }
};

window.onkeyup = (k) => {
    let upperkeyboardindex = upperkeyboardkeys.findIndex(code => code === k.code);
    let lowerkeyboardindex = lowerkeyboardkeys.findIndex(code => code === k.code);
    if(upperkeyboardindex >= 0) {
        k.preventDefault();
        processNoteMessage(basenote + 12 + upperkeyboardindex, 0);
    } else if(lowerkeyboardindex >= 0) {
        k.preventDefault();
        processNoteMessage(basenote + lowerkeyboardindex, 0);
    } 
    
};