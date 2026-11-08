setBPM(112);

addInstrument('kick');   // 0

const kick = createTrack(0);

await kick.steps(1, [ c2, c2, c2, c2 ].repeat(7));

loopHere();
