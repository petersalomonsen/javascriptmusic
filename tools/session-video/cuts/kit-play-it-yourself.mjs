// A CUT: the ~1 minute version of the 2026-07-31 rehearsal.
//
// The long cut (kit-zero-to-track.mjs) walks through every instrument. This one
// keeps only the loop that matters for the IEEE IS² 2026 set: ask → it plays →
// build the thing I want to play → play it → it becomes code I can edit.
//
// The agent's tool calls are replayed from the session log with their ORIGINAL
// arguments. The PLAYER's half is re-enacted, because a log cannot hold it:
//
//   • The take is performed live through `window.playNoteMessage`, the same
//     `processNoteMessage` the virtual keyboard and a real MIDI keyboard both
//     reach — so it hits the synth, the visualizer and the sequencer's recorder
//     exactly as a human performance does. Notes and velocities are the real
//     ones, lifted from the take in the finished song.
//   • The paste is the app's own insert-recording button.
//   • The quantize is a real `edit_song` tool call, but its arguments are
//     computed at runtime: it has to anchor on notes that do not exist until
//     the take has been played.
//
// Two liberties, both for the minute:
//   • The take is an EXCERPT — the phrase from beat 16.2 of the original, with
//     its four-bar lead-in trimmed, replayed from zero.
//   • The lead is demonstrated by the take itself rather than twice.
//
// Every ask from the session is kept, run in `quick` mode. Dropping the chords
// and bass asks to save time does NOT work: later edits anchor on text those
// asks create (`import { Bass } …`, `const bass = createTrack(4)`), so skipping
// them leaves the lead unwired and the take with no channel to land on.

export const SESSION_LOG =
    'tools/studio-agent/logs/session-2026-07-31T10-25-31-918Z.jsonl';

// Started from an empty repo — nothing to seed, keep the app's own default.
export const START_SONG = null;

export const OUTRO_MS = 6000;

const BPM = 112;

// The real take, from the finished song. App note names map to MIDI as
// `<name><octave>` → octave*12 + semitone, so a6 = 81, c7 = 84, d7 = 86.
// [ beat, midi, durationBeats, velocity ] — offset so the phrase starts at 0.
const TAKE = [
    [0.00, 81, 0.50, 78], [0.52, 84, 0.38, 99], [0.98, 86, 0.19, 75],
    [1.49, 86, 0.37, 97], [1.92, 81, 0.50, 65], [2.45, 84, 0.46, 87],
    [2.92, 86, 0.14, 77], [3.20, 86, 0.20, 90], [3.69, 86, 0.21, 82],
    [3.92, 84, 0.32, 82], [4.40, 81, 0.39, 95], [5.39, 79, 0.34, 94],
    [5.85, 77, 0.39, 60], [6.38, 79, 0.36, 94], [6.88, 81, 0.42, 82],
];

export const BEATS = [
    {
        title: 'beat',
        prompt: 'give me a beat',
        // Jump cut: three Faust drum voices, wired and compiled, no waiting.
        quick: true,
        tools: [0, 1, 2, 6, 4, 8, 9],
        showAfter: 'song',
        showMs: 4000,
        holdMs: 600,
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
        showMs: 2500,
        holdMs: 400,
    },
    {
        title: 'lead',
        prompt: 'now a fat lead I can play myself',
        say: ['Three detuned saws and a sub, on channel 5. No melody — that part is yours.'],
        quick: true,
        tools: [27, 28, 29, 30, 31],
        showAfter: 'faust',
        showMs: 2500,
        holdMs: 400,
    },
    {
        title: 'echo',
        prompt: 'give it an echo, every 3rd step at 4 steps per beat',
        say: ['0.75 of a beat — 402 ms at 112 BPM.'],
        quick: true,
        tools: [33, 34],
        holdMs: 600,
    },
    {
        title: 'record',
        prompt: 'add recording markers, I want to play the lead',
        say: ['Wrapping the loop in `startRecording()` / `stopRecording()`.'],
        quick: true,
        tools: [37, 38, 39, 40],
        // Now the player takes over: select the lead, play it, paste it, fix it.
        perform: { instrument: 'lead', notes: TAKE, bpm: BPM },
        pasteRecording: true,
        quantizeTake: 4,
        outro: 'Played live — now it is code.',
        holdMs: 1200,
    },
];
