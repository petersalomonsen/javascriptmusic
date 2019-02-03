// Taken from https://docs.rs/crate/biquad/0.2.0/source/src/coefficients.rs

export const PI_MAJOR: f32 = 3.1415927;
export const PI_MINOR: f32 = -0.00000008742278;
export const PI: f32 = PI_MAJOR;
export const FRAC_PI_2: f32 = PI_MAJOR / 2;

const COEFF_0:f32 =    -0.10132118;            // x
const COEFF_1:f32 =0.0066208798;        // x^3
const COEFF_2:f32 =-0.00017350505;        // x^5
const COEFF_3:f32 =0.0000025222919;      // x^7
const COEFF_4:f32 =-0.000000023317787;   // x^9
const COEFF_5:f32 = 0.00000000013291342; // x^11

/**
 * 
 * @param x avoid x > PI*2
 */
export function sin(x: f32): f32 {    
    // Horner's rule
    let x2 = x * x;
    let p11 = COEFF_5;
    let p9 = p11 * x2 + COEFF_4;
    let p7 = p9 * x2 + COEFF_3;
    let p5 = p7 * x2 + COEFF_2;
    let p3 = p5 * x2 + COEFF_1;
    let p1 = p3 * x2 + COEFF_0;

    // Remove scaling function
    return (x - PI_MAJOR - PI_MINOR) * (x + PI_MAJOR + PI_MINOR) * p1 * x;
}

export function cos(x: f32): f32 {
    return sin(FRAC_PI_2 - x);
}
