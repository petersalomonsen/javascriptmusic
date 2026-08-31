// A CUT: one curated video, made from one real studio-agent session.
//
// 2026-08-29 — an empty project to a 125 BPM house track: kick, hi-hat, an
// off-beat push, a sus4 pad, an octave bass, a snare, and a flute arpeggio.
// Nine asks, six Faust instruments, all in one sitting.
//
// Source of truth is the session log, which is COMMITTED for this one — see
// tools/studio-agent/reference-sessions/2026-08-29-house-track/. Every tool call
// below is replayed with its ORIGINAL arguments, so the music is the actual
// output of the actual edits. Only the prose is edited.
//
// `tools` are ordinals into that log's mcp__studio__ calls, in order. Left out,
// per the house style: song_summary and probe_instrument (the agent checking its
// own work — no sound, ~10s each), and the intermediate compiles that only exist
// because the agent compiled, looked, and edited again.
//
// PACE. Every beat runs `quick`, so the tool calls fire back to back with no
// pause to admire each one, and the beat lands on `showAfter` for a couple of
// seconds instead. That is the difference between a 2:20 video and a 1:10 one:
// non-quick spends ~2s of deliberate pause on EACH of the 43 calls. You no
// longer watch every edit arrive, but you see the document it produced, which is
// the part worth reading.
//
// The video opens on the kick. START_PAUSED holds the transport at boot so it
// cannot open on the app's default song, and beat 1 starts it the moment there
// is a kick to hear.
//
// The session ran to fourteen asks. This cut stops at the arpeggio, and skips
// three things on the way:
//
// 1. The snare ask also asked for "a fill on every eigth", and the next ask
//    removed it again. Both the fill and its removal are replayed — ordinal 47
//    is still in beat 8 — but the prompt is trimmed to the snare, so the video
//    shows the result the player kept rather than a detour it does not need.
// 2. Asks 10-11 are the player recording the lead melody themselves and the
//    agent tidying the take. A take is the human's half of the loop — the log
//    holds the agent's calls, not the player's — and this one arrived through
//    the app's paste button, which no replay reproduces.
// 3. Because of that, ordinal 61 (the arpeggio) anchors its `old_string` on the
//    recorded take, so it cannot match in a document that never had one. Beat 9
//    authors the same edit against the document we DO have. The arpeggio source
//    in `new_string` is byte-identical to what the agent wrote — only the anchor
//    differs, and the `addInstrument('lead')` line it needs came in during those
//    same skipped asks, so it is authored here too.
//
// The last two asks — a per-voice echo, then "make it a global effect the
// channel routes to", which is where the agent writes a MidiChannel with its own
// delay line — are the best engineering in the session and the worst television:
// most of it is the agent reading the repo's effects docs. They are in the log
// for anyone replaying it against another model.

export const SESSION_LOG =
    'tools/studio-agent/reference-sessions/2026-08-29-house-track/session.jsonl';

// The session opened on an empty project and its first act is a set_song, so
// there is nothing to seed. null keeps the app's own default until then.
export const START_SONG = null;

// Hold the transport at boot. Without this the video opens on whatever the app
// booted with, playing, before a single note of this track exists.
export const START_PAUSED = true;

// Authored in beat 9 — see note 3 above.
const ARP = `const lead = createTrack(5);

// arpeggio from your note palette (c5 d5 f5 g5 a5 c6 d6), one chord per 2 beats
lead.steps(2, [
    d5(0.45), f5(0.45), a5(0.45), d6(0.45),   // Dm
    f5(0.45), d5(0.45), f5(0.45), d6(0.45),   // A#maj
    f5(0.45), a5(0.45), c6(0.45), a5(0.45),   // F
    c5(0.45), g5(0.45), c6(0.45), g5(0.45),   // C
].repeat(3));`;

export const BEATS = [
    {
        title: 'kick',
        prompt: 'create a kick beat track ( 125 bpm )',
        say: ['A kick is a pitch sweep with a click on the front. Writing it in Faust, wiring it to channel 0, four on the floor at 125:'],
        // The compile is in here, not in thenTools, so the transport starts on a
        // song that already has a kick in it.
        tools: [0, 1, 2, 4, 5],
        quick: true,
        startPlayback: true,
        showAfter: 'song',
        showMs: 4000,
        outro: 'Eight bars, looping.',
        holdMs: 1200,
    },
    {
        title: 'hihat',
        prompt: 'and between the kicks I want a hihat',
        say: ['Highpassed noise, very short decay, channel 1. "Between the kicks" is the off-beats:'],
        tools: [7, 8, 9, 10, 11, 13, 14],
        quick: true,
        showAfter: 'song',
        showMs: 3500,
        holdMs: 1000,
    },
    {
        title: 'push',
        prompt: 'and after every 8th kick I also want a kick on the off beat',
        say: ['Eight kicks is two bars, so the grid becomes a 2-bar pattern with an extra kick on the last "&":'],
        tools: [16, 17],
        quick: true,
        showAfter: 'song',
        showMs: 3000,
        outro: 'A push into every third bar.',
        holdMs: 1000,
    },
    {
        title: 'pad',
        prompt: 'a fat pad — d minor, A# major, F major, C major. sus4 first, then plain major',
        say: ['Detuned saws, slow attack. Chords go in as arrays inside the step grid — one slot holding three notes fires all three:'],
        tools: [19, 20, 21, 22, 23, 24],
        quick: true,
        showAfter: 'song',
        showMs: 4000,
        outro: 'Each chord opens on its sus4 and resolves a beat later.',
        holdMs: 1000,
    },
    {
        title: 'bass',
        prompt: 'add a fat bass with the same notes, but following the kick. alternating octaves',
        say: ['Envelope-swept lowpass, channel 3. Roots d, A#, f, c — root, octave up, under each chord:'],
        tools: [27, 28, 29, 30, 31, 32],
        quick: true,
        showAfter: 'song',
        showMs: 4000,
        holdMs: 1000,
    },
    {
        title: 'longer',
        prompt: 'want the bass notes to sustain a bit longer',
        say: ['Note durations, not the instrument — 0.45 to 0.9 of a step:'],
        tools: [34, 35],
        quick: true,
        showAfter: 'song',
        showMs: 2500,
        holdMs: 800,
    },
    {
        title: 'rounder',
        prompt: 'make the bass less crisp on the attack, more of the bass character',
        say: ['That one IS the instrument. Slower attack, lower cutoff, less resonance:'],
        tools: [36, 37],
        quick: true,
        showAfter: 'faust',
        showMs: 3000,
        outro: 'Rounder — it sits under the kick now instead of on top of it.',
        holdMs: 1000,
    },
    {
        title: 'snare',
        prompt: 'add a snare on every second beat',
        say: ['Tone plus filtered noise, channel 4, on 2 and 4:'],
        // 47 removes the fill that the full ask ordered — see note 1.
        tools: [39, 40, 41, 42, 43, 44, 47],
        quick: true,
        showAfter: 'song',
        showMs: 3000,
        holdMs: 1000,
    },
    {
        title: 'flute',
        prompt: 'give me a lead instrument, flute like. and a melody — arpeggiate those chords',
        say: ['Flute-like means breath and almost no harmonics — a filtered pulse with a soft attack. Then an arpeggio over your progression, one chord per two beats:'],
        tools: [48, 49, 50, 51],
        quick: true,
        // runEdit compiles by itself once the authored edits land.
        edits: [
            {
                old_string: "addInstrument('snare');  // 4",
                new_string: "addInstrument('snare');  // 4\naddInstrument('lead');  // 5",
            },
            {
                old_string: 'const snare = createTrack(4);\n\n// backbeat',
                new_string: `const snare = createTrack(4);\n\n${ARP}\n\n// backbeat`,
            },
        ],
        showAfter: 'song',
        showMs: 5000,
        outro: 'Six instruments, all Faust, all written in this conversation.',
        holdMs: 7000,
    },
];
