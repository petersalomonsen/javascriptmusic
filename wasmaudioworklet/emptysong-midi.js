setBPM(120);

addInstrument('piano');

await createTrack(0).steps(4, [
    c5,, e5,, g5,, e5,,
    c5,, f5,, a5,, f5,,
]);

loopHere();
