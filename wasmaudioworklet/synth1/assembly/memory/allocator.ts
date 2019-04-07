let membase: usize = (HEAP_BASE & 0xffffff8) + 8;
let memoffset = 0;

@global export function __memory_allocate(size: usize): usize {
  let currentpage: i32 = memoffset >>> 16;
  
   // check if crossing page
  if(((memoffset + size) >>> 16) > currentpage) {
    // move to next page
    memoffset = (currentpage + 1) << 16;
  }

  let ret = memoffset + membase;
  
  memoffset += size;
  
  if(memoffset & 0x07) {
    // Align to 8 bytes
    memoffset = (memoffset & 0xffffff8) + 8;
  }

  let totalPagesNeeded: i32 = (memoffset >>> 16) + 1;
  let additionalPagesNeeded = totalPagesNeeded - memory.size();

  if (additionalPagesNeeded > 0) {    
    memory.grow(additionalPagesNeeded);
  }

  return ret;
}