setBPM(125);

addInstrument('kick');   // 0
addInstrument('hihat');  // 1
addInstrument('pad');    // 2
addInstrument('bass');   // 3
addInstrument('padlead');// 4
addInstrument('jumppad');// 5
addInstrument('warmpad');// 6
addInstrument('snare');  // 7



const kick  = createTrack(0, 4);
const hihat = createTrack(1, 4);
const pad   = createTrack(2, 4);
const bass  = createTrack(3, 4);
const padlead = createTrack(4);
const warmpad = createTrack(6);
const snare = createTrack(7, 1);

// Italo-disco drums: snare on beats 2 & 4, hi-hats on the 2/4 and 3/4 of every beat.
function italoHats(beats) {
    hihat.steps(4, [ , , fs3, fs3 ].repeat(beats - 1));
}
function italoSnare(beats) {
    snare.steps(1, [ , d3, , d3 ].repeat(beats / 4 - 1));
}
// simple end-of-phrase fill: the normal backbeat, plus ONE extra snare between the last two beats of the round
function italoSnareFillA(beats) {
    const n = [];
    for (let b = 1; b < beats; b += 2) n.push([ b, d3 ]);   // backbeats: beats 2, 4, ... (0-indexed odd)
    n.push([ beats - 1.5, d3 ]);                            // extra snare between beat 31 and 32
    snare.play(n);
}
// comprehensive transition fill: last two beats follow the hi-hats (.5 & .75); no snare on the final downbeat (kick only)
function italoSnareFillB(beats) {
    const bars = beats / 4;
    const n = [];
    for (let b = 0; b < bars - 1; b++) n.push([ b * 4 + 1, d3 ], [ b * 4 + 3, d3 ]);
    const L = (bars - 1) * 4;
    n.push([ L + 1, d3 ],
           [ L + 2.5, d3 ], [ L + 2.75, d3 ],
           [ L + 3.5, d3 ], [ L + 3.75, d3 ]);
    snare.play(n);
}

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

// === PART "break" (bars 25-32): jumppad chord take over intro bass; then PART "drop" (bars 33-40): same chords + italo-disco bass + recorded padlead lead ===
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
    italoHats(16);
    if (r === 1) italoSnareFillB(16); else italoSnareFillA(16);   // 2nd round hands off to the breakdown → comprehensive fill; else simple fill
    italoBassLine();
    await introKick.steps(4, [ c2, , , , ].repeat(15));
}

// === PART "breakdown" (played twice): warm low-pass pad chords + padlead melody over the beat ===
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

    // 2nd round only: melody climbs on the last beat — c7 then d7, half a beat each
    if (f2 === 1) {
        createTrack(4).play([[ 15, c7(0.5, 108) ], [ 15.5, d7(0.5, 114) ]]);
    }

    // finale beat (drums + italo bass)
    italoHats(16);
    if (f2 === 1) italoSnareFillB(16); else italoSnareFillA(16);   // 2nd round hands off to the finale → comprehensive fill; else simple fill
    italoBassLine();
    await introKick.steps(4, [ c2, , , , ].repeat(15));
}

// === PART "finale" (the real finale — 6 variation rounds, each 32 beats): built from the recorded warm pad + lead + jumppad takes ===

startRecording();
function finaleLead() {
createTrack(4).play([[ 1.09, d6(0.45, 79) ],
[ 0.56, a5(1.19, 83) ],
[ 1.54, f6(0.47, 92) ],
[ 2.06, e6(0.52, 78) ],
[ 2.56, c6(0.42, 89) ],
[ 2.98, a5(0.48, 78) ],
[ 3.50, d6(1.02, 88) ],
[ 4.46, g5(0.48, 75) ],
[ 4.96, c6(0.57, 74) ],
[ 5.47, d6(0.50, 84) ],
[ 6.05, b5(0.62, 69) ],
[ 6.52, d6(0.45, 67) ],
[ 6.97, g6(0.30, 93) ],
[ 7.50, f6(0.96, 105) ],
[ 8.43, a5(0.54, 63) ],
[ 8.93, d6(0.50, 79) ],
[ 9.42, f6(0.56, 90) ],
[ 9.92, e6(0.47, 84) ],
[ 10.40, c6(0.56, 72) ],
[ 10.91, a5(0.59, 69) ],
[ 11.46, d6(1.02, 92) ],
[ 12.43, g5(0.57, 75) ],
[ 12.98, c6(0.51, 82) ],
[ 13.45, d6(0.56, 83) ],
[ 13.96, g5(0.64, 69) ],
[ 14.48, b5(0.59, 82) ],
[ 15.03, d6(0.45, 83) ],
[ 15.50, a5(0.71, 92) ],
[ 16.46, a5(1.03, 82) ],
[ 16.97, d6(0.58, 72) ],
[ 17.51, f6(0.54, 89) ],
[ 17.98, e6(0.47, 79) ],
[ 18.44, c6(0.59, 79) ],
[ 18.95, a5(0.56, 72) ],
[ 19.50, d6(1.03, 89) ],
[ 20.49, g5(0.52, 72) ],
[ 20.98, b5(0.50, 88) ],
[ 21.43, d6(0.51, 77) ],
[ 21.93, g5(0.51, 72) ],
[ 22.40, b5(0.60, 63) ],
[ 22.95, g6(0.35, 83) ],
[ 23.51, f6(1.06, 93) ],
[ 24.95, d6(0.52, 74) ],
[ 24.44, as5(1.04, 67) ],
[ 25.48, f6(0.52, 87) ],
[ 25.95, d6(0.58, 83) ],
[ 26.46, c6(0.56, 65) ],
[ 26.93, a5(0.51, 77) ],
[ 27.48, d6(0.98, 89) ],
[ 28.41, g5(1.08, 62) ],
[ 28.95, c6(0.54, 87) ],
[ 29.46, d6(0.56, 77) ],
[ 29.98, g5(0.77, 87) ],
[ 30.44, b5(0.59, 74) ],
[ 30.97, d6(0.70, 83) ]].quantize(4));
}

function finaleWarmpad() {
createTrack(6).play([[ 0.88, a5(0.92, 72) ],
[ 0.89, d6(0.99, 62) ],
[ 0.91, f6(1.03, 67) ],
[ 2.02, g5(1.23, 75) ],
[ 1.98, e6(1.28, 74) ],
[ 1.97, c6(1.32, 88) ],
[ 3.53, c6(1.67, 74) ],
[ 3.58, g5(1.73, 78) ],
[ 5.51, g5(2.54, 72) ],
[ 5.53, b5(2.61, 83) ],
[ 3.57, d6(4.58, 88) ],
[ 8.97, a5(0.69, 84) ],
[ 8.97, f6(0.73, 87) ],
[ 8.96, d6(0.85, 79) ],
[ 9.98, g5(1.15, 84) ],
[ 9.97, c6(1.17, 83) ],
[ 9.99, e6(1.15, 79) ],
[ 12.02, g5(1.14, 82) ],
[ 12.01, c6(1.15, 84) ],
[ 12.01, d6(1.19, 82) ],
[ 13.45, g5(2.35, 74) ],
[ 13.45, b5(2.38, 88) ],
[ 13.44, d6(2.48, 70) ],
[ 16.93, a5(0.73, 83) ],
[ 16.92, f6(0.79, 84) ],
[ 16.92, d6(0.83, 79) ],
[ 17.97, g5(1.22, 87) ],
[ 17.95, c6(1.29, 89) ],
[ 17.95, e6(1.33, 87) ],
[ 20.06, c6(1.15, 84) ],
[ 20.05, g5(1.22, 89) ],
[ 20.08, d6(1.25, 83) ],
[ 21.56, g5(2.26, 65) ],
[ 21.56, b5(2.33, 79) ],
[ 21.55, d6(2.37, 59) ],
[ 24.95, as5(0.63, 92) ],
[ 24.96, f6(0.70, 90) ],
[ 24.94, d6(0.79, 89) ],
[ 25.98, g5(1.43, 87) ],
[ 25.95, c6(1.49, 89) ],
[ 25.97, e6(1.66, 88) ],
[ 28.06, g6(1.17, 88) ],
[ 28.03, c6(1.26, 92) ],
[ 28.06, d6(1.27, 83) ],
[ 29.56, g6(2.23, 88) ],
[ 29.54, b5(2.27, 93) ],
[ 29.54, d6(2.36, 83) ]].quantize(4));
}

function finaleJump() {
createTrack(5).play([[ 1.00, f6(0.73, 92) ],
[ 0.99, a5(0.74, 92) ],
[ 0.97, d6(0.81, 84) ],
[ 2.57, c6(0.86, 95) ],
[ 2.58, e6(0.87, 89) ],
[ 2.59, a5(0.86, 95) ],
[ 4.06, g5(0.89, 98) ],
[ 4.05, c6(0.92, 99) ],
[ 4.06, d6(0.96, 94) ],
[ 5.51, g5(0.69, 87) ],
[ 5.48, d6(0.74, 79) ],
[ 5.50, b5(0.74, 87) ],
[ 6.54, g5(0.80, 90) ],
[ 6.51, b5(0.85, 87) ],
[ 6.52, d6(0.87, 75) ],
[ 7.99, d6(0.51, 102) ],
[ 8.00, a5(0.50, 103) ],
[ 8.01, f6(0.48, 102) ],
[ 8.99, f6(0.73, 102) ],
[ 8.99, a5(0.74, 98) ],
[ 8.98, d6(0.77, 98) ],
[ 10.54, c6(0.65, 98) ],
[ 10.55, a5(0.68, 102) ],
[ 10.55, e6(0.71, 94) ],
[ 12.04, g6(0.98, 98) ],
[ 12.03, c6(1.04, 95) ],
[ 12.05, d6(1.04, 92) ],
[ 13.47, b5(0.67, 97) ],
[ 13.49, g6(0.65, 95) ],
[ 13.47, d6(0.70, 90) ],
[ 14.53, g6(0.77, 98) ],
[ 14.51, b5(0.85, 94) ],
[ 14.52, d6(0.87, 83) ],
[ 16.02, a5(0.41, 97) ],
[ 15.99, d6(0.45, 93) ],
[ 16.02, f6(0.44, 94) ],
[ 17.00, a5(0.59, 98) ],
[ 17.00, f6(0.62, 100) ],
[ 16.97, d6(0.65, 94) ],
[ 18.58, a5(0.52, 102) ],
[ 18.58, e6(0.58, 94) ],
[ 18.57, c6(0.59, 99) ],
[ 20.06, g5(0.92, 102) ],
[ 20.07, c6(0.91, 98) ],
[ 20.07, d6(0.92, 97) ],
[ 21.57, g5(0.50, 92) ],
[ 21.57, b5(0.53, 89) ],
[ 21.56, d6(0.54, 87) ],
[ 22.60, g5(0.56, 99) ],
[ 22.59, b5(0.62, 103) ],
[ 22.59, d6(0.63, 97) ],
[ 24.04, as5(0.37, 101) ],
[ 24.04, f6(0.46, 94) ],
[ 24.02, d6(0.51, 92) ],
[ 25.00, f6(0.96, 94) ],
[ 24.99, as5(0.98, 99) ],
[ 25.00, d6(1.04, 87) ],
[ 26.58, c6(0.99, 99) ],
[ 26.55, g5(1.03, 100) ],
[ 26.58, e6(1.00, 100) ],
[ 28.03, g5(1.08, 100) ],
[ 28.02, c6(1.10, 93) ],
[ 28.02, d6(1.15, 95) ],
[ 29.55, g5(1.66, 98) ],
[ 29.54, d6(1.69, 95) ],
[ 29.55, b5(1.72, 99) ]].quantize(4));
}

// --- beat + bass builders for the finale variations (each spans 32 beats = one round) ---
function finaleHats() {
    hihat.steps(4, [ , , fs3, null ].repeat(31));
}
function finaleKick() {
    return kick.steps(4, [ c2, , , , ].repeat(31));   // awaited beat-keeper, 32 beats
}
// italo-disco octave-pulse bass following the finale chords: Dm C G (x3), then A# C G
function finaleItaloBass() {
    bass.steps(2, [
        d2, d3, d2, d3,     c2, c3, c2, c3,     g2, g3, g2, g3,     g2, g3, g2, g3,
        d2, d3, d2, d3,     c2, c3, c2, c3,     g2, g3, g2, g3,     g2, g3, g2, g3,
        d2, d3, d2, d3,     c2, c3, c2, c3,     g2, g3, g2, g3,     g2, g3, g2, g3,
        as2, as3, as2, as3, c2, c3, c2, c3,     g2, g3, g2, g3,     g2, g3, g2, g3,
    ]);
}
// intro-style D pedal for 6 bars, then descending A#, C, G to close the round
function finaleDescBass() {
    const dbar = [
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d3(0.2), d3(0.1), d3(0.2), d3(0.1),
    ];
    const closebars = [
        as2(0.2), as2(0.1), as2(0.2), as2(0.1),
        as2(0.2), as2(0.1), as2(0.2), as2(0.1),
        c2(0.2), c2(0.1), c2(0.2), c2(0.1),
        c2(0.2), c2(0.1), c2(0.2), c2(0.1),
        g2(0.2), g2(0.1), g2(0.2), g2(0.1),
        g2(0.2), g2(0.1), g2(0.2), g2(0.1),
        g2(0.2), g2(0.1), g2(0.2), g2(0.1),
        g3(0.2), g3(0.1), g3(0.2), g3(0.1),
    ];
    bass.steps(4, [ ...dbar, ...dbar, ...dbar, ...dbar, ...dbar, ...dbar, ...closebars ]);
}

// plain intro-style D pedal for a full round (32 beats)
function finaleIntroBass() {
    bass.steps(4, [
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d2(0.2), d2(0.1), d2(0.2), d2(0.1),
        d3(0.2), d3(0.1), d3(0.2), d3(0.1),
    ].repeat(7));
}

// === 6 variation rounds (all with drums) ===
// 1-2: warm pad + lead + intro D bass · 2 adds jumppad · 3-4: italo bass (chords) · 5-6: intro D bass, descending A# C G
for (let round = 0; round < 6; round++) {
    finaleWarmpad();
    finaleLead();
    if (round >= 1) finaleJump();
    if (round <= 1) {
        finaleHats();
        finaleIntroBass();
    } else if (round <= 3) {
        italoHats(32);
        italoSnareFillA(32);   // both italo rounds get the simple fill (neither hands off to a new section)
        finaleItaloBass();
    } else {
        finaleHats();
        finaleDescBass();
    }
    await finaleKick();
}
stopRecording();

loopHere();