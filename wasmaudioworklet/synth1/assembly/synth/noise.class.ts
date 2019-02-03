let x: i32 = 123456789;
let y: i32=234567891;
let z: i32=345678912;
let w: i32=456789123;
let c: i32=0; 

export class Noise {
    
    next(): f32 {            
      y ^= (y<<5); y ^= (y>>7); y ^= (y<<22); 

      let t = z+w+c; z = w;
      c = t < 0 ? 1 : 0;
      w = t & 2147483647; 
  
      x += 1411392427; 
  
      let rnd: f32 = ((x + y + w) & 0xffff) as f32;
      return ((rnd / (1 << 16 as f32))) - 0.5;
    }
  }
  