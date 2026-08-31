setBPM(125);

addInstrument('kick');   // 0
addInstrument('hihat');  // 1
addInstrument('pad');    // 2
addInstrument('bass');   // 3
addInstrument('snare');  // 4
addInstrument('lead');  // 5

const kick = createTrack(0);
const hihat = createTrack(1);
const pad = createTrack(2);
const bass = createTrack(3);
const snare = createTrack(4);

// arpeggio from your note palette (c5 d5 f5 g5 a5 c6 d6), one chord per 2 beats
const arp = [
    d5(0.45), f5(0.45), a5(0.45), d6(0.45),   // Dm
    f5(0.45), d5(0.45), f5(0.45), d6(0.45),   // A#maj
    f5(0.45), a5(0.45), c6(0.45), a5(0.45),   // F
    c5(0.45), g5(0.45), c6(0.45), g5(0.45),   // C
].repeat(3);

const lead = createTrack(5, 2, 105);
lead.steps(2, arp);

// backbeat (2nd & 4th beat of each bar)
const snbar = [ , , , , d3(0.4), , , , , , , , d3(0.4), , , null ];
snare.steps(4, snbar.repeat(7));

// follows the kick; roots d, A#, f, c — alternating octaves per chord
bass.steps(2, [
    d2(0.9), , d3(0.9), , as2(0.9), , as3(0.9), ,
    f2(0.9), , f3(0.9), , c2(0.9), , c3(0.4), c3(0.4),
].repeat(3));

pad.steps(4, [
    // Dm: sus4 then minor
    [d5(0.7),g5(0.7),a5(0.7)], , , [d5(0.7),f5(0.7),a5(0.7)], , , , ,
    // A#maj: sus4 then major
    [as4(0.7),ds5(0.7),f5(0.7)], , , [as4(0.7),d5(0.7),f5(0.7)], , , , ,
    // Fmaj: sus4 then major
    [f5(0.7),as5(0.7),c6(0.7)], , , [f5(0.7),a5(0.7),c6(0.7)], , , , ,
    // Cmaj: sus4 then major
    [c5(0.7),f5(0.7),g5(0.7)], , , [c5(0.7),e5(0.7),g5(0.7)], , , , null,
].repeat(3));

hihat.steps(2, [ , fs3(0.25), , fs3(0.25), , fs3(0.25), , fs3(0.25) ].repeat(7));
await kick.steps(2, [
    c2(0.45), , c2(0.45), , c2(0.45), , c2(0.45), ,
    c2(0.45), , c2(0.45), , c2(0.45), , c2(0.45), c2(0.45),
].repeat(3));

loopHere();