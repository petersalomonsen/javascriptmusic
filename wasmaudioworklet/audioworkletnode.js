import { startWAM, postSong as wamPostSong, pauseWAMSong, onMidi as wamOnMidi, wamsynth, resumeWAMSong } from './webaudiomodules/wammanager.js';
import { createAudioWorklet as createMidiSynthAudioWorklet, onmidi as midiSynthOnMidi } from './synth1/audioworklet/midisynthaudioworklet.js';
import { visualizeNoteOn, clearVisualization, setUseDefaultVisualizer } from './visualizer/defaultvisualizer.js';
import { setPaused } from './visualizer/midieventlistvisualizer.js';
import { attachSeek, detachSeek } from './app.js';
import { recordAudioNode, startVideoRecording, stopVideoRecording } from './screenrecorder/screenrecorder.js';
import { getAudioWorkletModuleUrl } from './common/audioworkletmodules.js';
import { AudioWorkletProcessorSequencerModule } from './midisequencer/audioworkletprocessorsequencer.js';
import { getSointuWasm, isSointuSong } from './sointu/playsointu.js';
// The code in the main global scope.

export function initAudioWorkletNode(componentRoot) {
    let audioworkletnode;
    let onmidi = () => { };
    let playing = false;

    const context = new AudioContext({ sampleRate: 44100 });

    /**
     * Should be called from UI event for Safari / iOS
     */
    window.startaudio = async () => {
        if (playing) {
            return;
        }
        playing = true;

        // For Safari iOS, MUST happen before using "await"
        context.resume();

        const song = await window.compileSong();

        let bytes;

        if (song.eventlist) {
            await context.audioWorklet.addModule(getAudioWorkletModuleUrl(AudioWorkletProcessorSequencerModule));

            if (song.synthwasm || (!audioworkletnode && window.WASM_SYNTH_BYTES)) {
                audioworkletnode = await createMidiSynthAudioWorklet(context,
                    window.WASM_SYNTH_BYTES,
                    song.eventlist,
                    componentRoot.getElementById('toggleSongPlayCheckbox').checked ? true : false
                );
                window.audioworkletnode = audioworkletnode;
                onmidi = midiSynthOnMidi;
            } else if (song.synthsource) {
                await startWAM(context);
                wamPostSong(song.eventlist, song.synthsource);
                onmidi = wamOnMidi;
            }
        } else {
            if (song.modbytes) {
                bytes = await fetch('https://unpkg.com/wasm-mod-player@0.0.3/wasm-mod-player.wasm')
                    .then(r => r.arrayBuffer());

                await context.audioWorklet.addModule(new URL('modaudioworkletprocessor.js', import.meta.url));
                audioworkletnode = new AudioWorkletNode(context, 'mod-audio-worklet-processor', {
                    outputChannelCount: [2]
                });
            } else if (isSointuSong(song)) {
                bytes = window.WASM_SYNTH_BYTES;
                await context.audioWorklet.addModule(new URL('sointu/sointuaudioworkletprocessor.js?' + new Date().getTime(), import.meta.url));
                audioworkletnode = new AudioWorkletNode(context, 'sointu-audio-worklet-processor', {
                    outputChannelCount: [2]
                });
            } else {
                bytes = window.WASM_SYNTH_LOCATION ? await fetch(window.WASM_SYNTH_LOCATION).then(response =>
                    response.arrayBuffer()
                ) : window.WASM_SYNTH_BYTES;

                await context.audioWorklet.addModule('./audioworkletprocessor.js');
                audioworkletnode = new AudioWorkletNode(context, 'pattern-seq-audio-worklet-processor', {
                    outputChannelCount: [2]
                });
            }
            window.audioworkletnode = audioworkletnode;

            audioworkletnode.port.start();
            audioworkletnode.port.postMessage({
                topic: "wasm",
                samplerate: context.sampleRate,
                wasm: bytes,
                song: song,
                toggleSongPlay: componentRoot.getElementById('toggleSongPlayCheckbox').checked ? true : false
            });

            if (song.instrumentPatternLists) {
                const activenotes = new Array(song.instrumentPatternLists.length).fill(0);
                let currentTimePromiseResolve;

                audioworkletnode.port.onmessage = msg => {
                    if (msg.data.channelvalues) {
                        const channelvalues = msg.data.channelvalues;
                        for (let n = 0; n < channelvalues.length; n++) {
                            const note = channelvalues[n];
                            if (note !== 1 && note !== activenotes[n]) {
                                visualizeNoteOn(activenotes[n], 0);
                                activenotes[n] = 0;
                            }
                            if (note > 1) {
                                visualizeNoteOn(note, 127);
                                activenotes[n] = note;
                            }
                        };
                    }
                    if (msg.data.patternData) {
                        window.recordedSongData.patterns[msg.data.recordedPatternNo - 1] = msg.data.patternData;
                        window.recordedSongData.instrumentPatternLists[msg.data.channel][msg.data.instrumentPatternIndex] =
                            msg.data.recordedPatternNo;
                    }

                    if (msg.data.currentTime != undefined) {
                        currentTimePromiseResolve(msg.data.currentTime);
                    }
                };
                attachSeek((time) => audioworkletnode.port.postMessage({ songPositionMillis: time }),
                    async () => {
                        const currentTimePromise = new Promise((resolve) => currentTimePromiseResolve = resolve);
                        audioworkletnode.port.postMessage({ currentTime: true });
                        return await currentTimePromise;
                    },
                    song.instrumentPatternLists[0].length * song.patternsize * 60000 /
                    (song.rowsperbeat * song.BPM)
                );
            }
            audioworkletnode.connect(context.destination);
        }
        recordAudioNode(audioworkletnode);
        componentRoot.getElementById('startaudiobutton').style.display = 'none';
        componentRoot.getElementById('stopaudiobutton').style.display = 'block';
    };

    window.stopaudio = async () => {
        if (audioworkletnode) {
            clearVisualization();
            audioworkletnode.port.postMessage({ terminate: true });
            audioworkletnode.disconnect();
            detachSeek();
            audioworkletnode = null;
            window.audioworkletnode = null;
        }
        playing = false;
        if (wamsynth) {
            pauseWAMSong();
        }

        componentRoot.getElementById('startaudiobutton').style.display = 'block';
        componentRoot.getElementById('stopaudiobutton').style.display = 'none';
    }

    window.toggleSongPlay = (status) => {
        if (audioworkletnode) {
            audioworkletnode.port.postMessage({ toggleSongPlay: status });
            setPaused(!status);
        } else if (wamsynth) {
            if (status) {
                resumeWAMSong();
            } else {
                pauseWAMSong();
            }
        }
    };

    window.toggleCapture = (status) => {
        if (status) {
            startVideoRecording(context);
        } else {
            stopVideoRecording();
        }
    };

    window.toggleVisualizer = (status) => {
        if (status) {
            setUseDefaultVisualizer(true);
        } else {
            setUseDefaultVisualizer(false);
        }
        if (status && !window.getNoteStatusInterval) {
            window.getNoteStatusInterval = setInterval(() => {
                if (audioworkletnode) {
                    audioworkletnode.port.postMessage({ getNoteStatus: true });
                }
            }, 50);
        } else if (!status && window.getNoteStatusInterval) {
            clearInterval(window.getNoteStatusInterval);
            new Array(128).fill(0).map((n, ndx) => ndx).forEach(n => visualizeNoteOn(n, 0));
            window.getNoteStatusInterval = null;
        }
    };

    window.setSongPositionMillis = (songPositionMillis) => {
        if (audioworkletnode) {
            audioworkletnode.port.postMessage({ songPositionMillis: songPositionMillis });
        }
    };

    window.sendNoteToWorklet = (channel, note) => {
        if (audioworkletnode) {
            audioworkletnode.port.postMessage({ channel: channel, note: note });
        }
    }


    const polyphonicmapByNote = {};

    window.sendNoteToWorkletPolyphonic = (minchannel, maxchannel, note, velocity) => {

        if (polyphonicmapByNote[note] !== undefined && velocity === 0) {
            window.sendNoteToWorklet(polyphonicmapByNote[note], 0);
            delete polyphonicmapByNote[note];
        } else if (polyphonicmapByNote[note] !== undefined) {
            return;
        }

        if (velocity > 0) {
            const busyChannels = {};
            Object.keys(polyphonicmapByNote).map(note => polyphonicmapByNote[note]).forEach(ch => busyChannels[ch] = true);
            for (let ch = minchannel; ch <= maxchannel; ch++) {
                if (!busyChannels[ch]) {
                    window.sendNoteToWorklet(ch, note);
                    polyphonicmapByNote[note] = ch;
                    break;
                }
            }
        }
    }

    const channelnotemap = {};

    const sendNoteToWorkletSingle = (channel, note, velocity) => {
        if (velocity > 0) {
            channelnotemap[channel] = note;
            window.sendNoteToWorklet(channel, note);
        } else if (channelnotemap[channel] === note) {
            window.sendNoteToWorklet(channel, 0);
            channelnotemap[channel] = 0;
        }
    };

    window.midichannelmappings = {};

    window.currentMidiChannelMapping = null;

    function processNoteMessage(note, velocity) {
        visualizeNoteOn(note, velocity);

        const mappedChannel = midichannelmappings[currentMidiChannelMapping] ?
            midichannelmappings[currentMidiChannelMapping] : 0;

        if (mappedChannel.min !== undefined) {
            sendNoteToWorkletPolyphonic(mappedChannel.min, mappedChannel.max, note, velocity);
        } else {
            sendNoteToWorkletSingle(mappedChannel, note, velocity);
        }

        onmidi([0x90 + mappedChannel, note, velocity]);
    }

    async function startmidi() {
        const midi = await navigator.requestMIDIAccess();

        for (var input of midi.inputs.values()) {
            input.onmidimessage = (msg) => {
                const msgType = (msg.data[0] & 0xf0);

                const channel = midichannelmappings[currentMidiChannelMapping] ?
                    midichannelmappings[currentMidiChannelMapping] : 0;

                if (msgType === 0x90 || msgType === 0x80) {
                    const note = msg.data[1];
                    const velocity = msgType === 0x80 ? 0 : msg.data[2];

                    processNoteMessage(note, velocity);
                } else {
                    onmidi([msgType + channel, msg.data[1], msg.data[2]]);
                }
            };
        }

        // support https://pypi.org/project/midi-websocket-server/ (useful for firefox)
        const midiws = new WebSocket('ws://localhost:8765');
        midiws.onmessage = (wsmsg) => {
            const msg = { data: JSON.parse(wsmsg.data).content.msg };
            if (!msg.data) {
                return;
            }
            const msgType = (msg.data[0] & 0xf0);

            const channel = midichannelmappings[currentMidiChannelMapping] ?
                midichannelmappings[currentMidiChannelMapping] : 0;

            if (msgType === 0x90 || msgType === 0x80) {
                const note = msg.data[1];
                const velocity = msgType === 0x80 ? 0 : msg.data[2];

                processNoteMessage(note, velocity);
            } else {
                onmidi([msgType + channel, msg.data[1], msg.data[2]]);
            }
        };
    }

    if (typeof navigator.requestMIDIAccess === 'function') {
        startmidi();
    }

    window.lowerkeyboardkeys = ["KeyZ", "KeyS", "KeyX", "KeyD", "KeyC", "KeyV", "KeyG", "KeyB", "KeyH", "KeyN", "KeyJ", "KeyM", "Comma", "KeyL", "Period", "Semicolon", "Slash"];
    window.upperkeyboardkeys = ["KeyQ", "Digit2", "KeyW", "Digit3", "KeyE", "KeyR", "Digit5", "KeyT", "Digit6", "KeyY", "Digit7", "KeyU", "KeyI", "Digit9", "KeyO", "Digit0", "KeyP", "BracketLeft"];

    let basenote = 48;

    const vkeyboardinputelement = componentRoot.getElementById('vkeyboardinputelement');
    const noteNames = new Array(128).fill(null).map((v, ndx) =>
        (['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'])[ndx % 12] + '' + Math.floor(ndx / 12)
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

        const processNote = (note) => {
            if (!keysDown[note]) {
                processNoteMessage(note, 100);
                keysDown[note] = true;
                updateVirtualKeyBoardInputValue();
            }
        };

        if (upperkeyboardindex >= 0) {
            k.preventDefault();
            processNote(basenote + 12 + upperkeyboardindex);
        } else if (lowerkeyboardindex >= 0) {
            k.preventDefault();
            processNote(basenote + lowerkeyboardindex);
        } else if (k.code === 'ArrowRight') {
            k.preventDefault();
            if (basenote < 108) {
                basenote += 12;
            }
        } else if (k.code === 'ArrowLeft') {
            k.preventDefault();
            if (basenote > 12) {
                basenote -= 12;
            }
        }
    };

    vkeyboardinputelement.onkeyup = (k) => {
        let upperkeyboardindex = upperkeyboardkeys.findIndex(code => code === k.code);
        let lowerkeyboardindex = lowerkeyboardkeys.findIndex(code => code === k.code);
        if (upperkeyboardindex >= 0) {
            k.preventDefault();
            const note = basenote + 12 + upperkeyboardindex;
            processNoteMessage(note, 0);
            delete keysDown[note];
            updateVirtualKeyBoardInputValue();
        } else if (lowerkeyboardindex >= 0) {
            k.preventDefault();
            const note = basenote + lowerkeyboardindex;
            processNoteMessage(note, 0);
            delete keysDown[note];
            updateVirtualKeyBoardInputValue();
        }

    };
}