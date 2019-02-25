// The entry file of your WebAssembly module.
import './memory/allocator';
import { SAMPLERATE } from './environment';
import { mixernext, instrumentNotesUpdated, signal, NUM_INSTRUMENTS } from './mixes/testmix.class';
import { setNote } from './control/instrumentnotebuffer';

export const PATTERN_SIZE_SHIFT:usize = 4;
const PATTERN_LENGTH: f32 = (1 << PATTERN_SIZE_SHIFT) as f32;

let patternsPtr: usize;
let instrumentPatternListsPtr: usize;
let sampleBufferPtr: usize;
let sampleBufferFrames: usize;
let songlength: usize = 0;

let tick: f32 = 0;
const ticksPerBeat: f32 = 4;
const bpm: f32 = 120;

const ticksPerSec = ticksPerBeat * bpm / 60;
let ticksPerSample = ticksPerSec / SAMPLERATE;

let previousPatternNoteIndex: usize = -1;

function updateInstrumentNotes(): void {
  let songlengthf32: f32 = songlength as f32;

  if((tick / PATTERN_LENGTH) > songlengthf32) {
    tick -= (songlengthf32 * PATTERN_LENGTH);    
  }

  let patternIndexf32: f32 = (tick / PATTERN_LENGTH);
  let patternIndex: usize = patternIndexf32 as usize;  
  let patternNoteIndex: usize = ((patternIndexf32 - (patternIndex as f32)) * PATTERN_LENGTH) as usize;;

  
  if(patternNoteIndex===previousPatternNoteIndex) {
    return;
  }

  previousPatternNoteIndex = patternNoteIndex;
  
  for(let n=0;n<NUM_INSTRUMENTS;n++) {    
    let instrumentPatternIndex = load<u8>(instrumentPatternListsPtr +
        n * songlength +
        patternIndex);
    setNote(n, (load<u8>(patternsPtr + (instrumentPatternIndex << PATTERN_SIZE_SHIFT) 
                            + patternNoteIndex)) as f32);
  }
  instrumentNotesUpdated();
}

export function allocatePatterns(numpatterns: i32): usize {
  patternsPtr = memory.allocate(numpatterns << PATTERN_SIZE_SHIFT);
  return patternsPtr;
}

export function allocateInstrumentPatternList(songpatternslength: i32): usize {
  songlength = songpatternslength;
  instrumentPatternListsPtr = memory.allocate(songpatternslength * NUM_INSTRUMENTS);
  return instrumentPatternListsPtr;
}

export function allocateSampleBuffer(frames: usize): usize {
  sampleBufferFrames = frames;
  sampleBufferPtr = memory.allocate(frames * 2 * 4);
  return sampleBufferPtr;
}

export function fillSampleBuffer(): void {      
  for(let n: usize=0;n<sampleBufferFrames;n++) {
    updateInstrumentNotes();
    mixernext();    
    tick += ticksPerSample;
    store<f32>(sampleBufferPtr + (n * 4 * 2), signal.left);
    store<f32>(sampleBufferPtr + (n * 4 * 2) + 4, signal.right);
  }
}