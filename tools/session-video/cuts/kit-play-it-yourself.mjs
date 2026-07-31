// A CUT: the ~1 minute version of the 2026-07-31 rehearsal.
//
// The long cut (kit-zero-to-track.mjs) walks through every instrument. This one
// keeps only the loop that matters for the IEEE IS² 2026 set: ask → it plays →
// build the thing I want to play → play it → it becomes code I can edit.
//
// The agent's tool calls are replayed from the session log with their ORIGINAL
// arguments. The PLAYER's half is re-enacted, because a log cannot hold it:
//
//   • Phrases are performed live through `window.playNoteMessage`, the same
//     `processNoteMessage` the virtual keyboard and a real MIDI keyboard both
//     reach — so they hit the synth, the visualizer and the sequencer's recorder
//     exactly as a human performance does. Notes and velocities are the real
//     ones, lifted from the take in the finished song.
//   • The paste is the app's own insert-recording button.
//
// The video opens SILENT: the audio graph has to be live for the capture to tap
// it, but the transport only starts once the first beat exists.
//
// The lead is played twice before it is recorded — once dry, once through the
// echo — so you can hear what the effect actually did.
//
// Liberties, all for the minute:
//   • The take is an EXCERPT — the phrase from beat 16.2 of the original, with
//     its four-bar lead-in trimmed, replayed from zero.
//   • It is played on the 16th grid and starts on a bar line
//     (`syncToBeats: 4`), and the paste snaps it (`quantize: 4`). Play latency
//     means even a perfectly-played take lands a few milliseconds late, so
//     snapping on the way in is the only way a FIRST take reads as quantized —
//     the session's separate quantize step is dropped entirely. Velocities and
//     note lengths are untouched, so it still breathes.
//
// Every ask from the session is kept, run in `quick` mode. Dropping the chords
// and bass asks to save time does NOT work: later edits anchor on text those
// asks create (`import { Bass } …`, `const bass = createTrack(4)`), so skipping
// them leaves the lead unwired and the take with no channel to land on.

export const SESSION_LOG =
    'tools/studio-agent/logs/session-2026-07-31T10-25-31-918Z.jsonl';

// Started from an empty repo — nothing to seed, keep the app's own default.
export const START_SONG = null;

// Open on silence; the first beat starts the transport.
export const START_PAUSED = true;

export const OUTRO_MS = 6000;

const BPM = 112;

// The real take, from the finished song. App note names map to MIDI as
// `<name><octave>` → octave*12 + semitone, so a6 = 81, c7 = 84, d7 = 86.
// [ beat, midi, durationBeats, velocity ] — beats snapped to the 16th grid,
// velocities and lengths exactly as played.
const TAKE = [
    [0.00, 81, 0.50, 78], [0.50, 84, 0.38, 99], [1.00, 86, 0.19, 75],
    [1.50, 86, 0.37, 97], [2.00, 81, 0.50, 65], [2.50, 84, 0.46, 87],
    [3.00, 86, 0.14, 77], [3.25, 86, 0.20, 90], [3.75, 86, 0.21, 82],
    [4.00, 84, 0.32, 82], [4.50, 81, 0.39, 95], [5.50, 79, 0.34, 94],
    [5.75, 77, 0.39, 60], [6.50, 79, 0.36, 94], [7.00, 81, 0.42, 82],
];

// A short figure from the same phrase, for hearing the lead on its own.
const DEMO = [
    [0.00, 81, 0.45, 78], [0.50, 84, 0.38, 99],
    [1.00, 86, 0.40, 90], [1.75, 81, 0.60, 82],
];

export const BEATS = [
    {
        title: 'beat',
        prompt: 'give me a beat',
        // Jump cut: three Faust drum voices, wired and compiled, no waiting.
        quick: true,
        tools: [0, 1, 2, 6, 4, 8, 9],
        startPlayback: true,
        showAfter: 'song',
        showMs: 4000,
        holdMs: 500,
    },
    {
        title: 'chords',
        prompt: 'add chords: dminor, a#major, c major, g major',
        say: ['Detuned-saw pad on channel 3.'],
        quick: true,
        tools: [13, 14, 15, 16, 17],
        holdMs: 400,
    },
    {
        title: 'bass',
        prompt: 'a punchy bass, octaves like italo disco',
        say: ['Filter-swept and saturated, channel 4.'],
        quick: true,
        tools: [20, 21, 22, 23, 24],
        showAfter: 'song',
        showMs: 2000,
        holdMs: 400,
    },
    {
        title: 'lead (dry)',
        prompt: 'now a fat lead I can play myself',
        say: ['Three detuned saws and a sub, on channel 5. No melody — that part is yours.'],
        quick: true,
        tools: [27, 28, 29, 30, 31],
        perform: { instrument: 'lead', notes: DEMO, bpm: BPM },
        holdMs: 400,
    },
    {
        title: 'echo (wet)',
        prompt: 'give it an echo, every 3rd step at 4 steps per beat',
        say: ['0.75 of a beat — 402 ms at 112 BPM. Same phrase again:'],
        quick: true,
        tools: [33, 34],
        perform: { instrument: 'lead', notes: DEMO, bpm: BPM },
        holdMs: 600,
    },
    {
        title: 'record',
        prompt: 'add recording markers, I want to play the lead',
        say: ['Wrapping the loop in `startRecording()` / `stopRecording()`.'],
        quick: true,
        tools: [37, 38, 39, 40],
        // Start on a bar line so the captured take lands on the grid.
        perform: { instrument: 'lead', notes: TAKE, bpm: BPM, syncToBeats: 4 },
        // Snap on the way in — a first take that reads as played, on the grid.
        pasteRecording: { quantize: 4 },
        outro: 'Played live — now it is code.',
        holdMs: 1200,
    },
];
