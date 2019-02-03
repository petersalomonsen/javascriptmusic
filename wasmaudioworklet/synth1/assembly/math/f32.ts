
@inline export function min(v1: f32, v2: f32): f32 {
    return select<f32>( v2, v1, v1 > v2);
}

@inline export function abs(v: f32): f32 {
    return select<f32>( v, -v, v > 0);
}