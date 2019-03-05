// By Max Graey ( https://github.com/petersalomonsen/javascriptmusic/issues/2#issuecomment-469419609 )

export const PI: f32 = 3.141592653589793;
export function sin(x: f32): f32 {
  var y: f32, z: f32;
  x *= 1 / PI;
  y  = floor(x);
  z  = x - y;
  z *= 1.0 - z;
  z *= 3.6 * z + 3.1;
  return select(-z, z, <i32>y & 1);
}

export function cos(x: f32): f32 {
  return sin(x + PI * .5);
}