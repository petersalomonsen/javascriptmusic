const synthcompilerworker = new Promise(resolve => {
    const worker = new Worker(new URL('moduleworkerloader.js', import.meta.url));
    worker.onmessage = () => resolve(worker);
});

export async function compileWebAssemblySynth(synthsource, song, samplerate, exportmode, faustSources) {
    const worker = await synthcompilerworker;
    worker.postMessage({
        synthsource: synthsource,
        samplerate: samplerate,
        song: song,
        exportmode: exportmode,
        // Map of basename -> .ts contents for transpiled faust sources from
        // wasm-git's faust/ folder. Injected as `faust/<name>.ts` into the
        // AS sources map so the user's mix can do `import { Foo } from
        // '../faust/foo';`.
        faustSources: faustSources || {}
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