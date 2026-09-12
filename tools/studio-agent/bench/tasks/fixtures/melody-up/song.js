setBPM(125);

addInstrument('kick');   // 0
addInstrument('hihat');  // 1
addInstrument('pad');    // 2
addInstrument('bass');   // 3
addInstrument('padlead');// 4
addInstrument('jumppad');// 5
addInstrument('warmpad');// 6



const kick  = createTrack(0, 4);
const hihat = createTrack(1, 4);
const pad   = createTrack(2, 4);
const bass  = createTrack(3, 4);
const padlead = createTrack(4);
const warmpad = createTrack(6);

function playPadlead() {
    padlead.play([[ 2.50, a6(0.53, 72) ],
    [ 3.01, c7(0.48, 94) ],
    [ 4.01, d7(0.94, 97) ],
    [ 4.95, c7(0.45, 83) ],
    [ 5.41, a6(0.54, 75) ],
    [ 5.99, c7(0.69, 88) ],
    [ 6.91, d7(0.56, 82) ],
    [ 7.50, c7(0.60, 98) ],
    [ 10.48, a6(0.47, 83) ],
    [ 10.98, c7(0.58, 94) ],
    [ 12.04, d7(1.08, 100) ],
    [ 13.04, c7(0.36, 77) ],
    [ 13.49, a6(0.40, 60) ],
    [ 13.94, c7(0.64, 78) ],
    [ 14.93, d7(0.44, 87) ],
    [ 15.45, f7(1.11, 95) ],
    [ 17.02, e7(0.42, 87) ],
    [ 18.00, c7(0.56, 97) ],
    [ 18.47, d7(0.54, 87) ],
    [ 19.46, f7(1.08, 92) ],
    [ 20.93, e7(0.50, 93) ],
    [ 21.91, c7(0.53, 98) ],
    [ 22.40, d7(0.65, 87) ],
    [ 23.42, f7(0.92, 88) ],
    [ 24.93, e7(0.62, 92) ],
    [ 25.95, c7(0.45, 94) ],
    [ 26.43, d7(0.71, 87) ],
    [ 27.42, a6(0.68, 89) ],
    [ 28.47, g6(0.73, 93) ],
    [ 29.45, f6(0.37, 68) ],
    [ 30.01, g6(0.50, 87) ],
    [ 30.47, a6(0.54, 83) ],
    [ 31.01, c7(0.62, 97) ]].quantize(4));
}

// Third-below (fourth where the chord needs it) harmony for the lead, used ONLY in the
// last chorus round. Chords per pass: Dm(0-8) F(8-16) G(16-24) A#(24-28) C(28-32).
function playPadleadHarmony() {
    padlead.play([[ 2.50, f6(0.53, 70) ],
    [ 3.01, a6(0.48, 70) ],
    [ 4.01, a6(0.94, 70) ],
    [ 4.95, a6(0.45, 70) ],
    [ 5.41, f6(0.54, 70) ],
    [ 5.99, a6(0.69, 70) ],
    [ 6.91, a6(0.56, 70) ],
    [ 7.50, a6(0.60, 70) ],
    [ 10.48, f6(0.47, 70) ],
    [ 10.98, a6(0.58, 70) ],
    [ 12.04, a6(1.08, 70) ],
    [ 13.04, a6(0.36, 70) ],
    [ 13.49, f6(0.40, 70) ],
    [ 13.94, a6(0.64, 70) ],
    [ 14.93, a6(0.44, 70) ],
    [ 15.45, c7(1.11, 70) ],
    [ 17.02, c7(0.42, 70) ],
    [ 18.00, g6(0.56, 70) ],
    [ 18.47, b6(0.54, 70) ],
    [ 19.46, d7(1.08, 70) ],
    [ 20.93, b6(0.50, 70) ],
    [ 21.91, g6(0.53, 70) ],
    [ 22.40, b6(0.65, 70) ],
    [ 23.42, d7(0.92, 70) ],
    [ 24.93, c7(0.62, 70) ],
    [ 25.95, a6(0.45, 70) ],
    [ 26.43, as6(0.71, 70) ],
    [ 27.42, f6(0.68, 70) ],
    [ 28.47, e6(0.73, 70) ],
    [ 29.45, c6(0.37, 70) ],
    [ 30.01, e6(0.50, 70) ],
    [ 30.47, e6(0.54, 70) ],
    [ 31.01, a6(0.62, 70) ]].quantize(4));
}





// === PART "intro" (bars 1-8): drums + pulsing intro bass, played twice ===
const introKick  = createTrack(0, 4);
const introHihat = createTrack(1, 4);
const introBass  = createTrack(3, 4);

for (let introRep = 0; introRep < 2; introRep++) {
    introBass.steps(4, [
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d3(0.2), d3(0.1), d3(0.2), d3(0.1),
    ].repeat(3));

    introHihat.steps(4, [ , , fs3, null ].repeat(15));
    await introKick.steps(4, [ c2, , , , ].repeat(15));
}

// === PART "verse" (bars 9-16, no lead) then PART "chorus" (bars 17-24, adds padlead lead) — progression Dm-F-G-A#-C ===
for (let rep = 0; rep < 4; rep++) {
    if (rep >= 1) playPadlead();
    if (rep === 3) playPadleadHarmony();

    // Section 1: D minor
    hihat.steps(4, [ , , fs3, null ].repeat(7));
    pad.steps(4, [ [d4, f4, a4], , [d4, f4, a4], , ].repeat(7));
    bass.steps(4, [ d2, null, d3, null ].repeat(7));
    await kick.steps(4, [ c2, , , , ].repeat(7));

    // Section 2: F major
    hihat.steps(4, [ , , fs3, null ].repeat(7));
    pad.steps(4, [ [f4, a4, c5], , [f4, a4, c5], , ].repeat(7));
    bass.steps(4, [ f2, null, f3, null ].repeat(7));
    await kick.steps(4, [ c2, , , , ].repeat(7));

    // Section 3: G major
    hihat.steps(4, [ , , fs3, null ].repeat(7));
    pad.steps(4, [ [g4, b4, d5], , [g4, b4, d5], , ].repeat(7));
    bass.steps(4, [ g2, null, g3, null ].repeat(7));
    await kick.steps(4, [ c2, , , , ].repeat(7));

    // Section 4a: A# major
    hihat.steps(4, [ , , fs3, null ].repeat(3));
    pad.steps(4, [ [as4, d5, f5], , [as4, d5, f5], , ].repeat(3));
    bass.steps(4, [ as2, null, as3, null ].repeat(3));
    await kick.steps(4, [ c2, , , , ].repeat(3));

    // Section 4b: C major
    hihat.steps(4, [ , , fs3, null ].repeat(3));
    pad.steps(4, [ [c5, e5, g5], , [c5, e5, g5], , ].repeat(3));
    bass.steps(4, [ c3, null, c4, null ].repeat(3));
    await kick.steps(4, [ c2, , , , ].repeat(3));
}

// === PART "break" (bars 25-32): jumppad chord take over intro bass; then PART "finale" (bars 33-40): same chords + italo-disco bass + recorded padlead lead ===
function playJumpChords() {
    createTrack(5).play([[ 1.04, d6(0.53, 95) ],
    [ 1.03, a5(0.57, 99) ],
    [ 1.04, f5(0.56, 99) ],
    [ 1.98, e5(1.33, 88) ],
    [ 1.97, g5(1.34, 98) ],
    [ 2.00, c6(1.35, 97) ],
    [ 3.97, b5(1.05, 100) ],
    [ 3.98, d5(1.04, 89) ],
    [ 3.97, g5(1.08, 102) ],
    [ 5.41, g5(0.58, 104) ],
    [ 5.44, d5(0.60, 89) ],
    [ 5.43, b5(0.63, 104) ],
    [ 6.43, d5(1.50, 90) ],
    [ 6.41, as5(1.54, 94) ],
    [ 6.42, f5(1.56, 82) ],
    [ 8.91, f5(0.69, 92) ],
    [ 8.91, c5(0.73, 98) ],
    [ 8.90, a5(0.76, 94) ],
    [ 9.97, e5(1.62, 87) ],
    [ 9.95, c5(1.68, 88) ],
    [ 9.94, g5(1.71, 94) ],
    [ 12.06, g5(1.05, 90) ],
    [ 12.05, b4(1.06, 99) ],
    [ 12.03, d5(1.09, 95) ],
    [ 13.48, b4(0.56, 99) ],
    [ 13.50, g5(0.57, 97) ],
    [ 13.47, d5(0.68, 83) ],
    [ 14.46, as4(1.37, 96) ],
    [ 14.45, d5(1.38, 63) ],
    [ 14.48, f5(1.38, 88) ]].quantize(4));
}

function introBassLine() {
    introBass.steps(4, [
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d3(0.2), d3(0.1), d3(0.2), d3(0.1),
    ].repeat(3));
}

// Italo-disco octave-pulse bass, roots following the recorded chords: D C G A# F C G A#
function italoBassLine() {
    bass.steps(2, [
        d2, d3, d2, d3,      c2, c3, c2, c3,
        g2, g3, g2, g3,      as2, as3, as2, as3,
        f2, f3, f2, f3,      c2, c3, c2, c3,
        g2, g3, g2, g3,      as2, as3, as2, as3,
    ]);
}

function introHats() {
    introHihat.steps(4, [ , , fs3, null ].repeat(15));
}

// Playthrough 1 - the recorded take (recording armed for this bar)

playJumpChords();
introHats();
introBassLine();
await introKick.steps(4, [ c2, , , , ].repeat(15));


// Playthrough 2 - repeat as-is (intro bass + drums)
playJumpChords();
introHats();
introBassLine();
await introKick.steps(4, [ c2, , , , ].repeat(15));


// "finale" lead melody (recorded on padlead, ch4), spans bars 33-40
createTrack(4).play([[ 0.56, d6(0.44, 69) ],
[ 0.55, d7(0.46, 74) ],
[ 1.03, f6(0.41, 70) ],
[ 1.03, f7(0.48, 77) ],
[ 1.51, g7(0.51, 84) ],
[ 1.49, g6(0.59, 67) ],
[ 6.52, f7(0.40, 70) ],
[ 6.54, f6(0.41, 59) ],
[ 7.00, g7(0.40, 79) ],
[ 6.96, g6(0.48, 78) ],
[ 7.49, a7(0.31, 69) ],
[ 7.50, a6(0.44, 89) ],
[ 8.45, c7(0.54, 82) ],
[ 8.45, c8(0.56, 84) ],
[ 8.97, a7(0.40, 77) ],
[ 9.00, a6(0.44, 78) ],
[ 9.48, g7(0.45, 87) ],
[ 9.49, g6(0.48, 70) ],
[ 14.01, as6(0.42, 83) ],
[ 14.03, as7(0.53, 104) ],
[ 14.47, a7(0.47, 78) ],
[ 14.53, a6(0.46, 62) ],
[ 15.01, g6(0.44, 72) ],
[ 14.95, g7(0.50, 87) ],
[ 15.49, f6(0.40, 79) ],
[ 15.46, f7(0.42, 84) ],
[ 16.45, d6(0.50, 69) ],
[ 16.44, d7(0.53, 75) ],
[ 17.00, f6(0.42, 82) ],
[ 16.99, f7(0.50, 88) ],
[ 17.43, g7(0.64, 95) ],
[ 17.45, g6(0.65, 87) ],
[ 22.55, f6(0.42, 67) ],
[ 22.52, f7(0.51, 60) ],
[ 23.04, g7(0.44, 92) ],
[ 23.03, g6(0.45, 72) ],
[ 23.53, a7(0.52, 75) ],
[ 23.50, a6(0.57, 79) ],
[ 24.48, c7(0.47, 84) ],
[ 24.47, c8(0.52, 100) ],
[ 24.97, a6(0.45, 87) ],
[ 24.96, a7(0.46, 89) ],
[ 25.41, g7(0.64, 84) ],
[ 25.44, g6(0.63, 70) ],
[ 29.56, g7(0.73, 105) ],
[ 29.59, g6(0.74, 82) ],
[ 30.47, a6(0.37, 67) ],
[ 30.46, a7(0.44, 79) ],
[ 31.00, c8(0.39, 97) ],
[ 30.97, c7(0.45, 82) ],
[ 31.45, d7(0.37, 90) ],
[ 31.44, d8(0.41, 107) ]].quantize(4));


// Playthroughs 3 & 4 - italo-disco bass instead of intro bass
for (let r = 0; r < 2; r++) {
    playJumpChords();
    introHats();
    italoBassLine();
    await introKick.steps(4, [ c2, , , , ].repeat(15));
}

// === PART "finale2" (played twice): warm low-pass pad chords + padlead melody over the finale beat ===
for (let f2 = 0; f2 < 2; f2++) {
    // finale2 CHORDS -> WARM PAD (ch6), one octave up, tidied to the 2-beat grid
    warmpad.play([
        [ 0,  d6(1.9, 72), f6(1.9, 72), a6(1.9, 72) ],    // Dm
        [ 2,  c6(1.9, 72), e6(1.9, 72), g6(1.9, 72) ],    // C
        [ 4,  g5(1.9, 72), b5(1.9, 72), d6(1.9, 72) ],    // G
        [ 6,  as5(1.9, 72), d6(1.9, 72), f6(1.9, 72) ],   // A#/Bb
        [ 8,  f6(1.9, 72), a6(1.9, 72), c7(1.9, 72) ],    // F
        [ 10, c6(1.9, 72), e6(1.9, 72), g6(1.9, 72) ],    // C
        [ 12, g5(1.9, 72), b5(1.9, 72), d6(1.9, 72) ],    // G
        [ 14, as5(1.9, 72), d6(1.9, 72), f6(1.9, 72) ],   // A#/Bb
    ]);

    // finale2 MELODY -> PADLEAD (ch4), quantized to fix the off-beat timing
    createTrack(4).play([[ 0.60, f7(0.56, 79) ],
    [ 1.03, e7(0.47, 89) ],
    [ 1.49, c7(0.50, 98) ],
    [ 1.97, g6(4.51, 88) ],
    [ 6.49, f6(0.56, 83) ],
    [ 7.01, g6(0.40, 102) ],
    [ 7.43, a6(1.00, 100) ],
    [ 8.48, c7(0.56, 108) ],
    [ 8.98, a6(0.44, 97) ],
    [ 9.45, g6(0.99, 103) ],
    [ 10.47, c6(0.73, 78) ],
    [ 11.46, d6(1.02, 103) ],
    [ 12.47, f6(0.99, 94) ],
    [ 13.50, g6(0.98, 110) ],
    [ 14.52, a6(0.91, 114) ]].quantize(4));

    // finale beat (drums + italo bass); recording armed so padlead can be re-taken
    startRecording();
    introHats();
    italoBassLine();
    await introKick.steps(4, [ c2, , , , ].repeat(15));
    stopRecording();
}

loopHere();