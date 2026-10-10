// A CUT: the 2026-10-10 Internet of Sounds rehearsal — a whole piece composed
// on stage from an empty part, for TikTok / Shorts.
//
// 120 BPM: bass guitar → kick, hats → piano stabs → flute → snare, open hat →
// choir → a choir-and-bass section → an ending. 21 asks plus two part jumps,
// every one typed while the song plays, every change heard on the next loop.
//
// The session ran in the concert repo, not the default project: its twelve
// instruments ("monster is close" ports, faust/*.ts + synth.ts) only exist
// there. So the app boots that repo through the local devserver's gitproxy,
// with the PAT from a file. The remote's master (2026-10-05) predates the
// session and has the exact synth and instruments it played.
//
// Every tool call is replayed with its ORIGINAL arguments from the session log.
// The prompts and replies are the real ones, word for word. They were already
// phone-sized, because on stage the agent answers in one line. Left out: the
// opening grep_song/get_song, the agent reading before it edits. They make
// no sound.
//
// run_script edits the song too, so it shows the song editor like edit_song.
//
// The two part jumps ("go to choir", "go to ending") are `local` beats: on
// stage the app answers a part name itself, with no model turn. The song is
// playing and has parts by then, so typing them goes down the same fast path
// as it did live.
//
// NOT replayed: at some point after the session the player commented out
// pianoChords() and fluteMelody() by hand (they are commented out in the
// committed song.js). That is not in the log, so the video keeps them playing.

export const SESSION_LOG =
    'tools/studio-agent/logs/session-2026-10-03T14-46-04-342Z.jsonl';

export const APP_URL = 'http://localhost:8080/?gitrepo=internet-of-sounds-2026-performance'
    + '&remote=http://localhost:8080/gitproxy/github.com/petersalomonsen/internet-of-sounds-2026-performance.git';
export const GIT_TOKEN_FILE = '~/.internet_of_sounds_2026_performance_pat';
// The repo restores its last rehearsal's chat; start on an empty panel.
export const CLEAR_CHAT = true;

export const VIEW_FOR_TOOL = {
    edit_song: 'song', set_song: 'song', run_script: 'song',
    edit_synth: 'synth', set_synth: 'synth',
    write_faust: 'faust',
};

// The transport is held at boot and started by the first beat, so playback
// begins at the very top of the song the moment the bass exists, and every
// later change lands in a song that has been playing from the start.
export const START_PAUSED = true;

// The ending is 4 beats after the choir part plays out (≤ 2 bars), and then the
// whole song WRAPS to the top: the ending has no loopHere(), so the bass part
// starts again. The 2026-10-10 render was cut by hand at that restart:
//   ffmpeg -i out/<slug>.webm -t 213.45 -vf "scale=1080:1920,fade=t=out:st=212.65:d=0.8"
//          -af "afade=t=out:st=212.65:d=0.8" …
// When the restart lands depends on where the loop was, so check the end of a
// new render (hi-hats returning) before posting it.
export const OUTRO_MS = 9000;

// The song the session started from: the concert repo's "Empty track and agent
// chat" (e669f7a). The log's own get_song result is truncated at 1000 chars.
export const START_SONG = `
// Internet of Sounds 2026 — composed live on stage, from an empty part.
// Every part is a \`definePartStart\`, its LAYER FUNCTIONS, ONE awaited beat-keeper
// that spans it, and a \`waitForSignal\`. Comment out a layer line to drop it.
setBPM(90);

addInstrument('mdrums');     // 0 — kit: c5 kick, d5 snare, fs5 hat, gs5 open hat, f5 g5 a5 b5 toms, cs6 cymbal
addInstrument('mbass');      // 1
addInstrument('mguitar');    // 2
addInstrument('mpiano');     // 3
addInstrument('mflute');     // 4
addInstrument('jumppad');    // 5
addInstrument('warmpad');    // 6
addInstrument('mstrings');   // 7
addInstrument('mchoir');     // 8
addInstrument('bassguitar'); // 9
addInstrument('mbrass');     // 10
addInstrument('mpadsynth');  // 11

const kick       = createTrack(0, 4);
const hihat      = createTrack(0, 4);
const snare      = createTrack(0, 4);
const drums      = createTrack(0, 4);
const bass       = createTrack(1);
const guitar     = createTrack(2);
const piano      = createTrack(3);
const flute      = createTrack(4);
const jumppad    = createTrack(5);
const warmpad    = createTrack(6);
const strings    = createTrack(7);
const choir      = createTrack(8);
const bassguitar = createTrack(9);
const brass      = createTrack(10);
const padsynth   = createTrack(11);



`.trimStart();

// Each change is heard on the next 2-bar loop (4 s at 120 BPM); hold long
// enough on the reply to hear it land before the next ask.
const HOLD = 3500;

export const BEATS = [
    {
        prompt: "120bpm. bassguitar on every beat c2,c3,d2,d3,e2,e3,b1,b2",
        tools: [434, 435, 436],
        startPlayback: true,
        outro: "Part \"bass\" is in at 120bpm — bassguitar quarter notes c2 c3 d2 d3 e2 e3 b1 b2, 2 bars of 4/4, looping. Heard next round.",
        holdMs: HOLD,
    },
    {
        prompt: "for the note on the upper octave also repeat it on the semi-quaver before the next beat ( short note )",
        tools: [437, 438],
        outro: "Each upper-octave note now gets a short repeat on the 16th before the next beat — heard next round.",
        holdMs: HOLD,
    },
    {
        prompt: "move the upper octave beat note one semiquaver before",
        tools: [439, 440],
        outro: "Upper-octave note now lands a 16th early (anticipated), short repeat still before the next beat — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "kick on every beat",
        tools: [441, 442],
        outro: "Kick on all 8 beats of the part — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "hihats on every semi quaver between the beat 1/4,1/1,1/4 velocity",
        tools: [443, 444],
        outro: "Hats on the three 16ths between beats, velocities 32 / 127 / 32 — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "piano chords on every beat cmajor, dmajor, eminor, bminor. octave 5, first inversion on the eminor",
        tools: [445, 446, 447],
        outro: "Piano hits every beat: C, C, D, D, Em (g5-b5-e6, 1st inv), Em, Bm, Bm — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "make the piano chords short duration ( semi-quaver )",
        tools: [448, 449],
        outro: "Piano chords now 16th-length stabs — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "move the 2nd beat chords one semi quaver before",
        tools: [450, 451],
        outro: "Second chord of each pair now anticipates by a 16th — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "also make the velocity of it half",
        tools: [452, 453],
        outro: "Anticipated chord now at velocity 50 against 100 on the beat — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "add another piano chord with 1/4 velocity 3 semi quavers after the one we just adjusted",
        tools: [454, 455],
        outro: "Third chord stab added 3 sixteenths later at velocity 25 — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "add a flute with melody on quavers e6,g6,a6 ( starting on the first quaver after beat 1 )",
        tools: [456, 457, 458],
        outro: "Flute added: quaver line e6-g6-a6 cycling, entering on the quaver after beat 1 — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "don't repeat it",
        tools: [459, 460],
        outro: "Flute plays e6-g6-a6 once, then silence for the rest of the part — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "same melody based on the beat when eminor starts, but instead of a6: b6",
        tools: [461, 462],
        outro: "Second flute phrase e6-g6-b6 starting a quaver after the Em beat — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "snare on every 2nd beat",
        tools: [463, 464],
        outro: "Snare on beats 2 and 4 of each bar — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "open hihat on beat 5 1/2",
        tools: [465, 466],
        outro: "Open hat (gs5) on beat 5½ — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "make the open hihat duration a semi quaver",
        tools: [467, 468],
        outro: "Open hat shortened to a 16th — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "now let's have choir chords on octave 7. holding to the next",
        tools: [469, 470, 471],
        outro: "Choir added: C, D, Em, Bm in octave 7, each held two beats into the next — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "invert the dmajor chord so that f# is the upper note",
        tools: [472, 473],
        outro: "Choir D now voiced a6-d7-fs7 with F# on top — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "also the eminor so that g is the upper",
        tools: [474, 475],
        outro: "Choir Em now b6-e7-g7 with G on top — next round.",
        holdMs: HOLD,
    },
    {
        prompt: "now create a new section only with the choir and a bass holding the notes.",
        tools: [476, 477],
        outro: "New part \"choir\": choir chords plus held bass roots c2, d2, e2, b1 — 2 bars of 4/4, after the bass part.",
        holdMs: HOLD,
    },
    // the app answers this itself: jump once "bass" has played out
    { prompt: 'go to choir', local: true, holdMs: 6000 },
    {
        prompt: "and a final section that does not have a loop that just plays the chord and bass in eminor",
        tools: [478, 479],
        outro: "Final part \"ending\": one held Em (b6-e7-g7) + e2 bass, 4 beats, no signal wait — plays out straight.",
        holdMs: HOLD,
    },
    { prompt: 'go to ending', local: true, holdMs: 1000 },
];
