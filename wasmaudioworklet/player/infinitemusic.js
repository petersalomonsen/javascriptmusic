import { initWASMGitClient, readfile, pull } from '../wasmgit/wasmgitclient.js';
import { compileWebAssemblySynth } from '../synth1/browsersynthcompiler.js';
import { compileSong as compileMidiSong } from '../midisequencer/songcompiler.js';
import { getAudioWorkletModuleUrl } from '../common/audioworkletmodules.js';
import { AudioWorkletProcessorSequencerModule } from '../midisequencer/audioworkletprocessorsequencer.js';
import { AssemblyScriptMidiSynthAudioWorkletProcessorModule } from '../synth1/audioworklet/midisynthaudioworkletprocessor.js';
import { setupWebGL } from '../visualizer/fragmentshader.js';

function showStatus(statusstring) {
    const statusspan = document.getElementById('statusspan');
    statusspan.innerHTML = statusstring;
}

async function playMusic() {
    document.getElementById('playMusicButton').remove();

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
    if (setNumber<1 || isNaN(setNumber)) {
        setNumber = 1;
    }
    console.log(setNumber);

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

    setnumberinput.oninput = async () => {        
        if (setnumberinput.valueAsNumber > 0 && !isNaN(setnumberinput.valueAsNumber)) {
            setNumber = setnumberinput.valueAsNumber;
            await compileAndPostSong();
            showStatus(`play song with set number ${setNumber}`);
        } else {
            showStatus(`invalid set number`);
        }
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
    
    if (gitrepoconfig.fragmentshader) {
        const shadercode = await readfile(gitrepoconfig.fragmentshader);
        let animatedSetNumber = setNumber;
        await setupWebGL(shadercode, document.documentElement, () => {
            animatedSetNumber += (setNumber - animatedSetNumber) / 2.0;
            return (((animatedSetNumber * 60) % 86400 ) + previoustime / 1000.0);
        });
        showStatus(`set up shader\n${shadercode}`);
    }
    showStatus(`play song with set number ${setNumber}`);
}
window.playMusic = playMusic;