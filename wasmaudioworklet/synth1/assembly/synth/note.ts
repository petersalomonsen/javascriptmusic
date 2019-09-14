const pitchstep: f64 = 1.0004513695322617; // Math.pow(2, (1/128) / 12);
const c0: f64 = 8.175798915643707; // Math.pow(2, -69 / 12);
let pitchtable = changetype<usize>(new ArrayBuffer(128*128*4));
let pitch: f64 = c0;

for(let n: usize=0;n<(128*128);n++) {    
    store<f32>(pitchtable + (n << 2), pitch as f32);
    pitch *= pitchstep;
}

export function notefreq(note: f32): f32 {
    let pitchtableIndex: usize = (note * 128.0) as usize;    
    return load<f32>(pitchtable + (pitchtableIndex << 2));
}