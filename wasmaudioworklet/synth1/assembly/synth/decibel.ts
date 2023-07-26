export function decibelToGain(dB: f32): f32 {
    return NativeMathf.pow(10, dB/20.0);
}

export function midiLevelToDecibel(midiLevel: u8): f32 {
    return 40 * NativeMathf.log10(midiLevel as f32/127);
}

export function midiLevelToGain(midiLevel: u8): f32 {
    return decibelToGain(midiLevelToDecibel(midiLevel));
}