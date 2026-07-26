// Text overlay demo — the song decides what text appears, when, and how.
// Pair it with shaders/shader_textoverlay.glsl. See README.md.
setBPM(96);

// A plain setVisual param: the shader reads it as `uniform float textScale`.
// Nothing about the name is built into the app — the song and the shader agree.
setVisual('textScale', 1.0);

// --- visuals ---------------------------------------------------------------
// Channel 15 sounds nothing, so this track is purely a visual timeline. Each
// showText supersedes the previous one; `transition` is the style the shader
// branches on, `fade` is how long uTextMix takes to travel 0 -> 1.
createTrack(15).steps(1, [
    () => showText('Text from the sequencer', { transition: 0, fade: 1.5 }),
    ,,,,
    () => showText(['Fade, wipe, rise, dissolve', 'picked per line'],
        { transition: 1, fade: 1.2, size: 80 }),
    ,,,,
    () => showText('…this one rises', { transition: 2, fade: 1.2 }),
    ,,,,
    () => showText('…and this one dissolves', { transition: 3, fade: 1.6, size: 84 }),
    ,,,,
    // Ramped param: the shader zooms the text out over 2 seconds.
    () => setVisual('textScale', 1.6, 2.0),
    ,,,,
    () => hideText({ transition: 0, fade: 2.0 }),
]);

// --- music -----------------------------------------------------------------
// A slow pad on channel 0 (whatever instrument the project has there), four
// beats per chord, so the visuals have something to breathe with.
const chords = [
    [c3(4), ds3(4), g3(4)],
    [as2(4), d3(4), f3(4)],
    [gs2(4), c3(4), ds3(4)],
    [as2(4), d3(4), g3(4)],
];
// 7 chords = 28 beats — the song must outlast the visual track above, or its
// pending steps are dropped when the main sequence returns.
for (let repeat = 0; repeat < 7; repeat++) {
    await createTrack(0, 1, 80).steps(0.25, [chords[repeat % chords.length]]);
}
