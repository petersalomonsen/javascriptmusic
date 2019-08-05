// The code in the main global scope.

export function initAudioWorkletNode(componentRoot) {
    let audioworkletnode;
    let playing = false;
    window.recordedmidi = [];

    /**
     * Should be called from UI event for Safari / iOS
     */
    window.startaudio = async () => {
        if(playing) {
            return;
        }
        playing = true;
    
        const song = compileSong();

        const context = new AudioContext();
        context.resume(); // For Safari iOS
        
        if(!window.WASM_SYNTH_LOCATION) {
            window.WASM_SYNTH_LOCATION = 'synth1/build/index.wasm';
        }
        
        const bytes = await fetch(window.WASM_SYNTH_LOCATION).then(response =>
            response.arrayBuffer()
        );                    
        
        await context.audioWorklet.addModule('audioworkletprocessor.js');
        audioworkletnode = new AudioWorkletNode(context, 'my-worklet-processor',
            {outputChannelCount: [2]});
        window.audioworkletnode = audioworkletnode;
        audioworkletnode.port.start();
        audioworkletnode.port.postMessage({ topic: "wasm", 
            samplerate: context.sampleRate, 
            wasm: bytes, 
            song: song,
            toggleSongPlay: componentRoot.getElementById('toggleSongPlayCheckbox').checked ? true: false
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
                window.recordedSongData.patterns[msg.data.recordedPatternNo - 1] = msg.data.patternData;
                window.recordedSongData.instrumentPatternLists[msg.data.channel][msg.data.instrumentPatternIndex] =
                                msg.data.recordedPatternNo;
            }
        };
        audioworkletnode.connect(context.destination);
        window.getNoteStatusInterval = setInterval(() =>
            audioworkletnode.port.postMessage({ getNoteStatus: true }), 50);
        componentRoot.getElementById('startaudiobutton').style.display = 'none';
        componentRoot.getElementById('stopaudiobutton').style.display = 'block';
    };

    window.stopaudio = async () => {
        if(audioworkletnode) {
            
            new Array(128).fill(0).map((n,ndx) => ndx).forEach(n => visualizeNoteOn(n, 0));
            audioworkletnode.disconnect();
            audioworkletnode = null;
            clearInterval(window.getNoteStatusInterval);
        }
        playing = false;
        componentRoot.getElementById('startaudiobutton').style.display = 'block';
        componentRoot.getElementById('stopaudiobutton').style.display = 'none';
    }

    window.toggleSongPlay = (status) => {
        if(audioworkletnode) {        
            audioworkletnode.port.postMessage({ toggleSongPlay: status});
        }
    };

    window.setSongPositionMillis = (songPositionMillis) => {
        if(audioworkletnode) {        
            audioworkletnode.port.postMessage({ songPositionMillis: songPositionMillis});
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

    window.midichannelmappings = {};

    window.currentMidiChannelMapping = 'piano';

    window.clearRecording = function() {    
        const recorded = window.recordedSongData;        
        recorded.instrumentPatternLists.forEach((patterinIndexList, instrumentIndex) => {
            patterinIndexList.forEach(patternIndex => {
                console.log('clear pattern', patternIndex);
                audioworkletnode.port.postMessage({ patternIndex: patternIndex, clearpattern: true});
            })
        });
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

    if(typeof navigator.requestMIDIAccess === 'function') {
        startmidi();
    }

    window.lowerkeyboardkeys = ["KeyZ","KeyS","KeyX","KeyD","KeyC","KeyV","KeyG","KeyB","KeyH","KeyN","KeyJ","KeyM","Comma","KeyL","Period","Semicolon","Slash"];
    window.upperkeyboardkeys = ["KeyQ","Digit2","KeyW","Digit3","KeyE","KeyR","Digit5","KeyT","Digit6","KeyY","Digit7","KeyU","KeyI","Digit9","KeyO","Digit0","KeyP","BracketLeft"];

    let basenote = 48;

    const vkeyboardinputelement = componentRoot.getElementById('vkeyboardinputelement');
    const noteNames = new Array(128).fill(null).map((v, ndx) => 
        (['c','cs','d','ds','e','f','fs','g','gs','a','as','b'])[ndx%12]+''+Math.floor(ndx/12)
    );
    const keysDown = {};
    const updateVirtualKeyBoardInputValue = () => {
        vkeyboardinputelement.value = Object.keys(keysDown).map(note => noteNames[note]).join(',');
    };

    vkeyboardinputelement.onblur = () => {
        Object.keys(keysDown).forEach(note => {
            processNoteMessage(note, 0);
            delete keysDown[note];
        });
        updateVirtualKeyBoardInputValue();
    };

    vkeyboardinputelement.onkeydown = (k) => {
        let upperkeyboardindex = upperkeyboardkeys.findIndex(code => code === k.code);
        let lowerkeyboardindex = lowerkeyboardkeys.findIndex(code => code === k.code);
        if(upperkeyboardindex >= 0) {
            k.preventDefault();
            const note = basenote + 12 + upperkeyboardindex;
            processNoteMessage(note, 100);
            keysDown[note] = true;
            updateVirtualKeyBoardInputValue();
        } else if(lowerkeyboardindex >= 0) {
            k.preventDefault();
            const note = basenote + lowerkeyboardindex;
            processNoteMessage(note, 100);
            keysDown[note] = true;
            updateVirtualKeyBoardInputValue();
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

    vkeyboardinputelement.onkeyup = (k) => {
        let upperkeyboardindex = upperkeyboardkeys.findIndex(code => code === k.code);
        let lowerkeyboardindex = lowerkeyboardkeys.findIndex(code => code === k.code);
        if(upperkeyboardindex >= 0) {
            k.preventDefault();
            const note = basenote + 12 + upperkeyboardindex;
            processNoteMessage(note, 0);
            delete keysDown[note];
            updateVirtualKeyBoardInputValue();
        } else if(lowerkeyboardindex >= 0) {
            k.preventDefault();
            const note = basenote + lowerkeyboardindex;
            processNoteMessage(note, 0);
            delete keysDown[note];
            updateVirtualKeyBoardInputValue();
        } 
        
    };
}