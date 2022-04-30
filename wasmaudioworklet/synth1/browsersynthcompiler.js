const synthcompilerworker = new Worker(new URL('browsercompilerwebworker.js', import.meta.url));

export async function compileWebAssemblySynth(synthsource, song, samplerate, exportmode) {
    synthcompilerworker.postMessage({
        synthsource: synthsource,
        samplerate: samplerate,
        song: song,
        exportmode: exportmode
    });

    const result = await new Promise((resolve) => synthcompilerworker.onmessage = (msg) => resolve(msg));
    if (result.data.binary) {
        console.log('successfully compiled webassembly synth');
        return result.data.binary;
    } else if (result.data.error) {
        throw new Error(result.data.error);
    } else {
        console.log('no changes for webassembly synth');
    }
    return null;
}