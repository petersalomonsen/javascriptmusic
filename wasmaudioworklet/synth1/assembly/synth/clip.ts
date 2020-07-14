// From https://ccrma.stanford.edu/~jos/pasp/Soft_Clipping.html#29695

/**
 * soft clip signal with 1/3 headroom as result
 * @param signal signal to be clipped
 */
export function softclip(signal: f32): f32 {
    if(signal > 1.0) {
        return 2.0/3.0;
    } else if(signal < -1.0) {
        return -2.0/3.0;
    } else {
        return (signal - ((signal * signal * signal) / 3.0));
    }
}

export function hardclip(signal: f32): f32 {
    if(signal > 1.0) {
        return 1.0;
    } else if(signal < -1.0) {
        return -1.0;
    } else {
        return signal;
    }
}