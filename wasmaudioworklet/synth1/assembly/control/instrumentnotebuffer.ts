let instrumentNoteBufferPtr: usize;

export function allocateInstrumentNoteBuffer(num_instruments: usize): void {
    instrumentNoteBufferPtr = memory.allocate(num_instruments * 4);
}

@inline export function setNote(slot: usize, note: f32): void{
    store<f32>(instrumentNoteBufferPtr + (slot * 4), note);
}

@inline export function getNote(slot: usize): f32 {
    return load<f32>(instrumentNoteBufferPtr + (slot * 4));
}