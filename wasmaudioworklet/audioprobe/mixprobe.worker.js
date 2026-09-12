// The mix measurement off the main thread: render the compiled song through
// the synth wasm and analyse it, in a module Worker. A three-minute song is a
// few seconds of work — on the main thread that froze the editors and the
// playing audio's UI while the agent waited. Messages: { id, bytes, eventlist,
// sampleRate, tailSeconds, bpm } in; { id, analysis } or { id, error } out.
import { renderSong } from './songrender.js';
import { analyzeMix } from './mixanalysis.js';

self.onmessage = async (e) => {
    const { id, bytes, eventlist, sampleRate = 44100, tailSeconds = 1.5, bpm = 120 } = e.data || {};
    try {
        const r = await renderSong(bytes, eventlist, { sampleRate, tailSeconds });
        const analysis = analyzeMix(r.left, r.right, { sampleRate: r.sampleRate, bpm, songSeconds: r.songSeconds });
        self.postMessage({ id, analysis });
    } catch (err) {
        self.postMessage({ id, error: String(err?.message || err) });
    }
};
