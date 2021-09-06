import { initWASMGitClient, readfile, pull } from '../wasmgit/wasmgitclient.js';
import { compileWebAssemblySynth } from '../synth1/browsersynthcompiler.js';
import { compileSong as compileMidiSong } from '../midisequencer/songcompiler.js';
import { getAudioWorkletModuleUrl } from '../common/audioworkletmodules.js';
import { AudioWorkletProcessorSequencerModule } from '../midisequencer/audioworkletprocessorsequencer.js';
import { AssemblyScriptMidiSynthAudioWorkletProcessorModule } from '../synth1/audioworklet/midisynthaudioworkletprocessor.js';

function showStatus(statusstring) {
    const statusspan = document.getElementById('statusspan');
    statusspan.innerHTML = statusstring;
}

async function playMusic() {
    document.getElementById('playMusicButton').disabled = true;

    const audioctx = new AudioContext();
    audioctx.resume();

    showStatus('cloning git repo');

    const gitrepoparam = location.search ? location.search.substring(1).split('&').find(param => param.indexOf('gitrepo=') === 0) : null;
    const gitrepoconfig = await initWASMGitClient(gitrepoparam.split('=')[1]);

    showStatus('pull');
    await pull();

    showStatus('read source code');
    const storedsongcode = await readfile(gitrepoconfig.songfilename);
    const storedsynthcode = await readfile(gitrepoconfig.synthfilename);   
    
    showStatus('compile webassembly synth\n\n'+storedsynthcode);
    const wasmsynth = await compileWebAssemblySynth(storedsynthcode,undefined,audioctx.sampleRate,false);
    
    showStatus('start audioworklet');
    await audioctx.audioWorklet.addModule(getAudioWorkletModuleUrl(AudioWorkletProcessorSequencerModule));
    await audioctx.audioWorklet.addModule(getAudioWorkletModuleUrl(AssemblyScriptMidiSynthAudioWorkletProcessorModule));
    const audioworkletnode = new AudioWorkletNode(audioctx, 'asc-midisynth-audio-worklet-processor', {
        outputChannelCount: [2]
    });
    audioworkletnode.port.start();
    
    const setnumberinput = document.getElementById('setnumberinput');
    let setNumber = setnumberinput.valueAsNumber;

    const compileAndPostSong = async () => {
        const songsource = storedsongcode.replace(/const setNumber = [0-9]+/,`const setNumber = ${setNumber}`);
        showStatus(`compile song with set number ${setNumber}\n\n${songsource}`);
        audioworkletnode.port.postMessage({
            sequencedata: await compileMidiSong(songsource),
            toggleSongPlay: true
        });
    }
    audioworkletnode.port.postMessage({
        samplerate: audioctx.sampleRate,
        wasm: wasmsynth
    });
    
    await compileAndPostSong();
    audioworkletnode.port.postMessage({ currentTime: true });
    audioworkletnode.connect(audioctx.destination);

    let previoustime = 0;

    setnumberinput.onchange = async () => {
        setNumber = setnumberinput.valueAsNumber;
        await compileAndPostSong();
    }

    audioworkletnode.port.onmessage = async (msg) => {
        const t = msg.data.currentTime;
        if (t !== undefined && t < previoustime) {
            setNumber++;
            setnumberinput.value = setNumber.toString();
            compileAndPostSong();            
        }
        previoustime = t;
        audioworkletnode.port.postMessage({ currentTime: true });
    };
}
window.playMusic = playMusic;