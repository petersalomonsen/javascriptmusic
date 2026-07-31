// A CUT: one curated video, made from one real studio-agent session.
//
// 2026-07-31 session — an EMPTY repo to a full track in six asks, then
// recording markers so the lead can be played live. This was the rehearsal for
// the IEEE IS² 2026 set (see wasmaudioworklet/docs/presentation/), and the
// first run with a project KIT: the repo's AGENT.md sits in the model's context
// from turn 0, so the agent writes instruments straight out instead of spending
// a round-trip looking up how. Nine turns, 51s median, 2 discovery calls in 50.
//
// Source of truth is the session log itself — every tool call is replayed with
// its ORIGINAL arguments, so the music you hear is the actual output of the
// actual edits, not a re-enactment. Only the prose is edited.
//
// `tools` are ordinals into the session's mcp__studio__ tool calls, in order.
// Left out, per the house style: song_summary and probe_instrument (the agent
// checking its own work — no sound, ~10s each).
//
// Two deliberate omissions beyond that:
//
// 1. Ordinals 3 and 5 are a set_synth that imported `KickDsp` and the compile
//    that failed on it. That was a real bug in write_faust's own hint — it
//    reported the internal Faust class alongside the public wrapper — and it is
//    FIXED as of this branch. Replaying it would advertise behaviour that no
//    longer exists, so beat 1 jumps to the corrected set_synth at ordinal 6.
// 2. The session continued past beat 6: a take played live on the lead, pasted
//    in with the app's insert button, then quantized. That paste is a UI action,
//    not a tool call, so a replay cannot produce it — and the quantize edit
//    anchors on text only the take provides. The video ends where the player
//    takes over, which is the better ending anyway.

// Path is relative to the repo root. Session logs are not committed, so a cut
// only replays on a machine that has the log it names.
export const SESSION_LOG =
    'tools/studio-agent/logs/session-2026-07-31T10-25-31-918Z.jsonl';

// This session opened on an EMPTY repo, so there is no starting song to seed and
// no early get_song to recover one from — null keeps the app's own default.
export const START_SONG = null;

export const BEATS = [
    {
        title: 'beat',
        prompt: 'give me a beat',
        say: [
            'Empty repo — but the project ships an `AGENT.md`, so I already know its six instruments and channel layout. No lookups needed.\n\n'
            + 'Three Faust drum voices, one file each:',
        ],
        tools: [0, 1, 2],
        sayThen: [
            'Kick is a pitch-swept sine with a click; snare is tone plus filtered noise; hi-hat is highpassed noise.\n\n'
            + 'Wiring them to channels 0-2 and writing the pattern:',
        ],
        thenTools: [6, 4, 8, 9],
        outro: '112 BPM, eight bars. Kick on every beat, snare on 2 and 4, hats on the offbeats.',
    },
    {
        title: 'chords',
        prompt: 'add a chord progression, dminor, a#major, c major, g major',
        say: [
            'A detuned triple-saw pad on channel 3. The chords go in as **arrays inside the step grid** — a slot holding `[d4, f4, a4]` fires all three together.',
        ],
        tools: [13],
        sayThen: ['Registering the channel and writing the progression, one bar each:'],
        thenTools: [14, 15, 16, 17],
        outro: 'Dm → A♯ → C → G, held across the beat that is already running.',
    },
    {
        title: 'bass',
        prompt: 'can you add a punchy bass-line on that. alternate the bass notes with octaves like italo disco',
        say: [
            'Punchy means an envelope-swept resonant lowpass and a bit of saturation. Channel 4:',
        ],
        tools: [20],
        sayThen: ['Now the octave alternation — root, octave up, root, octave up, in eighths under each chord:'],
        thenTools: [21, 22, 23, 24],
        outro: '64 notes across the eight bars, roots following the progression.',
    },
    {
        title: 'lead',
        prompt: 'now I need a fat lead that I can play myself on top.',
        say: [
            'Fat = three detuned saws plus a sub square, through a swept resonant filter.\n\n'
            + 'You said *you* will play it — so I am building the instrument and declaring the channel, and **not** writing a melody over it.',
        ],
        tools: [27],
        sayThen: ['Channel 5, and one line in the song so the channel exists for you to play into:'],
        thenTools: [28, 29, 30, 31],
        outro: 'Instrument ready, channel empty — that part is yours.',
    },
    {
        title: 'echo',
        prompt: 'can you have an echo effect on the lead. it should echo every 3rd step given 4 steps per beat',
        say: [
            'Three steps at four steps per beat is 0.75 of a beat — at 112 BPM, a 402 ms delay. Adding it to the lead:',
        ],
        tools: [33, 34],
        outro: 'Dotted-eighth echo, locked to the tempo.',
    },
    {
        title: 'over to me',
        prompt: 'can you insert recording markers in the beginning and end, and I will record a pattern with the lead.',
        say: [
            'Wrapping the loop in `startRecording()` / `stopRecording()`. Whatever you play on channel 5 between them gets captured — and pastes back into the song as code you can edit.',
        ],
        tools: [37, 38, 39, 40],
        outro: 'Built from silence in six asks. The music never stopped — and now I play.',
    },
];
