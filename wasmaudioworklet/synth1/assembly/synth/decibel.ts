@inline export function decibelToGain(dB: f32): f32 {
    return NativeMathf.pow(10, dB/20.0);
}

@inline export function midiLevelToDecibel(midiLevel: u8): f32 {
    return 40 * NativeMathf.log10(midiLevel as f32/127);
}

@inline export function midiLevelToGain(midiLevel: u8): f32 {
    return decibelToGain(midiLevelToDecibel(midiLevel));
}