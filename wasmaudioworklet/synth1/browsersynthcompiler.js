const synthcompilerworker = new Promise(resolve => {
    const worker = new Worker(new URL('moduleworkerloader.js', import.meta.url));
    worker.onmessage = () => resolve(worker);
});

export async function compileWebAssemblySynth(synthsource, song, samplerate, exportmode) {
    const worker = await synthcompilerworker;
    worker.postMessage({
        synthsource: synthsource,
        samplerate: samplerate,
        song: song,
        exportmode: exportmode
    });

    const result = await new Promise((resolve) => worker.onmessage = (msg) => resolve(msg));
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