let memoffset: usize = (HEAP_BASE & 0xffffff8) + 8;

memory.grow(8);
@global export function __memory_allocate(size: usize): usize {
  let ret = memoffset;
  memoffset += size;
  
  if(memoffset & 0x07) {
    memoffset = (memoffset & 0xffffff8) + 8;
  }

  return ret;
}