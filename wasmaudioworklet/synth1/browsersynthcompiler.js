const synthcompilerworker = new Promise(resolve => {
    const worker = new Worker(new URL('moduleworkerloader.js', import.meta.url));
    worker.onmessage = () => resolve(worker);
});

// Serialize concurrent compile requests. The worker only accepts one job at a
// time, and the previous code wrote `worker.onmessage = ...` per call —
// overlapping calls (e.g. save + start clicked back-to-back) would orphan the
// first call's response when the second's onmessage replaced it.
let compileChain = Promise.resolve();

export async function compileWebAssemblySynth(synthsource, song, samplerate, exportmode, faustSources) {
    const worker = await synthcompilerworker;
    const myTurn = compileChain.then(() => runOne());
    compileChain = myTurn.catch(() => { });
    return myTurn;

    function runOne() {
        return new Promise((resolve, reject) => {
            worker.onmessage = (msg) => {
                if (msg.data.binary) {
                    console.log('successfully compiled webassembly synth');
                    resolve(msg.data.binary);
                } else if (msg.data.error) {
                    reject(new Error(msg.data.error));
                } else {
                    console.log('no changes for webassembly synth');
                    resolve(null);
                }
            };
            worker.postMessage({
                synthsource: synthsource,
                samplerate: samplerate,
                song: song,
                exportmode: exportmode,
                // Map of basename -> .ts contents for transpiled faust sources
                // from wasm-git's faust/ folder. Injected as faust/<name>.ts
                // into the AS sources map so the user's mix can do
                // `import { Foo } from '../faust/foo';`.
                faustSources: faustSources || {}
            });
        });
    }
}
