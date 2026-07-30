// A CUT: one curated video, made from one real studio-agent session.
//
// 2026-07-29 session — a track built from a broken starting point: NEAR AI had
// arpeggiated the chords instead of stacking them. Chords → A♯ fix → repeat
// counts → fat Faust lead → drums → reverb → bass. Runs ~2:00.
//
// Source of truth is the session log itself — every tool call is replayed with
// its ORIGINAL arguments, so the music you hear in the video is the actual
// output of the actual edits, not a re-enactment. Only the prose is edited:
// prompts are trimmed to their essence and the agent's replies are cut down to
// what fits on a phone screen (the full replies are paragraphs of verification
// detail — accurate, but unreadable at Shorts pace).
//
// `tools` are ordinals into the session's mcp__studio__ tool calls, in order.
// Verification calls (song_summary / probe_instrument) are left out: they are
// the agent checking its work, they make no sound, and they cost ~10s each.

// Path is relative to the repo root. Session logs are not committed, so a cut
// only replays on a machine that has the log it names.
export const SESSION_LOG =
    'tools/studio-agent/logs/session-2026-07-29T18-12-05-213Z.jsonl';

export const BEATS = [
    {
        title: 'chords',
        prompt: 'replace the piano track with chords: d minor (octave 5), a# major '
            + '(first inversion, keeping d in the bottom), f major (second inversion, '
            + 'c in the bottom), c major. staccato chords on every half beat.',
        say: [
            'On it — reading the current song first so I only touch the piano track.',
            'Found it: NEAR AI **arpeggiated** each chord — one note per step — instead of stacking them.\n\n'
            + 'Each step slot can be an array, so all three notes fire together on the same half beat. Replacing that track with real stacked chords:',
        ],
        tools: [12, 13],
        // said after the edit lands, before compiling
        sayThen: ['Compiling — this applies straight to the running track.'],
        thenTools: [14],
        outro: 'Done. 8 beats, 16 steps × 3-note chords — stacked, not arpeggiated.',
    },
    {
        title: 'a-sharp fix',
        prompt: '(and i meant a-sharp major instead of b major)',
        say: [
            'That makes much more sense — **A♯ major, 1st inversion** is D–F–A♯, so D natural sits '
            + 'in the bass, exactly the "keeping d in the bottom" you meant. Only the top note moves, a5→as5.',
        ],
        tools: [17, 18],
        outro: 'Fixed — smooth voice leading from Dm now.',
    },
    {
        title: 'repeat counts',
        prompt: 'i wanted the d minor 3 times, the a# major 5 times, f major 3 times, '
            + 'and c major 5 times. (repeat the staccato chords)',
        say: [
            'Got it — 3 + 5 + 3 + 5 = **16 hits**, which at `steps(2)` is exactly 8 beats. Same length, no `.repeat` needed.',
        ],
        tools: [21, 22],
        outro: 'Voicings pulled into named helpers so the repeat counts read directly.',
    },
    {
        title: 'fat lead',
        prompt: 'that chord goes well with a fat lead. melody: d4, d5, c5, d5, a4, g4, f4, g4 — '
            + 'the c5 lands with the a# major, the a4 when f major starts, the g when c major enters. '
            + 'fat sawtooth chorused synth? (multiple detuned layers)',
        say: [
            'Love it. Building a detuned-saw lead in Faust, then wiring it to channel 1 and placing the melody so it locks to your chord changes.',
        ],
        tools: [25, 26],
        sayThen: ['Transpiled. Now register it as channel 1, keeping the piano on 0:'],
        thenTools: [27, 28, 29, 30, 31],
        // the compile above FAILS — the agent misread its own transpiler hint.
        // Keeping it: self-correction is the most honest thing in the session.
        sayAfterFail: [
            'The transpiler hint was backwards — `FatleadDsp` is the raw DSP, `Fatlead` is the MidiVoice wrapper. Fixing:',
        ],
        failFixTools: [32, 33],
        outro: '5 detuned saw layers, two slow LFOs drifting the detune. In tune and layered over the chords.',
    },
    {
        title: 'drums',
        prompt: "let's create some powerful kick and snare. kick on the first beat, snare on the "
            + 'second, wait one and a half beat for the kick again, then snare on the fourth beat.',
        say: [
            'Two new instruments on channels 2 & 3, layered over the piano and lead. Kick first — pitch-swept sine with a click transient:',
        ],
        tools: [36],
        sayThen: ['Now the snare — tonal body plus a bandpassed noise burst:'],
        thenTools: [37, 38, 39, 40, 41, 42],
        outro: 'Kick at beats 0, 2.5, 4, 6.5 · snare at 1, 3, 5, 7.',
    },
    {
        title: 'reverb',
        prompt: 'place some heavy reverb on those drums.',
        say: [
            'The framework already has a shared **freeverb** bus — every channel has a `.reverb` send into it. '
            + 'No need to hand-roll one in `postprocess`; I just open the send on the drums.',
        ],
        tools: [52, 53, 54],
        outro: 'Kick and snare pushed into the global reverb bus.',
    },
    {
        title: 'bass',
        prompt: 'we need a bass. can you create a fat synth bass too? notes d3, as2, f3, c3, with '
            + 'variations in between, hitting the 3rd and 11th beat when the chords change.',
        say: [
            'Last layer — a fat synth bass on channel 4, roots following your chord changes.',
        ],
        tools: [68],
        sayThen: ['Transpiled. Wiring channel 4 and writing the bass line:'],
        thenTools: [69, 70, 71, 72, 73],
        outro: 'That is the full track: chords, lead, drums, reverb and bass — all from the browser.',
    },
];
