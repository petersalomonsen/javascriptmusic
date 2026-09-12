// measureMix(): the whole-mix analysis, in a Worker where there is one.
//
// One worker, reused, one request at a time in flight per id. In Node (the
// bench, the tests) there is no Worker and the render runs inline — the same
// two functions, so the numbers cannot differ between the paths.
import { renderSong } from './songrender.js';
import { analyzeMix } from './mixanalysis.js';

let worker = null;
let nextId = 1;
const pending = new Map();

function getWorker() {
    if (worker) return worker;
    worker = new Worker(new URL('./mixprobe.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
        const p = pending.get(e.data?.id);
        if (!p) return;
        pending.delete(e.data.id);
        if (e.data.error) p.reject(new Error(e.data.error));
        else p.resolve(e.data.analysis);
    };
    worker.onerror = (e) => {
        const err = new Error(`mix probe worker failed: ${e?.message || e}`);
        for (const p of pending.values()) p.reject(err);
        pending.clear();
        worker.terminate();
        worker = null;
    };
    return worker;
}

/**
 * Render `eventlist` through the synth `bytes` and analyse the result.
 * Returns the analyzeMix() object.
 */
export async function measureMix(bytes, eventlist, { sampleRate = 44100, tailSeconds = 1.5, bpm = 120 } = {}) {
    if (typeof Worker === 'undefined') {
        const r = await renderSong(bytes, eventlist, { sampleRate, tailSeconds });
        return analyzeMix(r.left, r.right, { sampleRate: r.sampleRate, bpm, songSeconds: r.songSeconds });
    }
    return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        // bytes are copied, not transferred: the caller keeps using them (the live synth)
        getWorker().postMessage({ id, bytes, eventlist, sampleRate, tailSeconds, bpm });
    });
}

/** Stop the worker (tests, or to free memory after a long session). */
export function terminateMixProbeWorker() {
    if (worker) { worker.terminate(); worker = null; }
    for (const p of pending.values()) p.reject(new Error('mix probe worker terminated'));
    pending.clear();
}
