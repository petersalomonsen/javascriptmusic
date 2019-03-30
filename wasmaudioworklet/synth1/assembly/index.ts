// The entry file of your WebAssembly module.
import './memory/allocator';
import { SAMPLERATE } from './environment';
import { mixernext, signal, setChannelValue } from './mixes/testmix.class';
export { setChannelValue } from './mixes/testmix.class';

export const PATTERN_SIZE_SHIFT:usize = 4;
const PATTERN_LENGTH: f32 = (1 << PATTERN_SIZE_SHIFT) as f32;

let NUM_INSTRUMENTS: i32;

let currentChannelValuesBufferPtr: usize;
let patternsPtr: usize;
let instrumentPatternListsPtr: usize;
let sampleBufferPtr: usize;
let sampleBufferFrames: usize;
let songlength: usize = 0;

let patternIndexf32: f32 = 0;
let patternIndex: usize = 0;  
let patternNoteIndex: usize = -1;

let tick: f32 = 0;
const ticksPerBeat: f32 = 4;
const bpm: f32 = 120;

const ticksPerSec = ticksPerBeat * bpm / 60;
let ticksPerSample = ticksPerSec / SAMPLERATE;

let playOrPause: boolean = true;

export function getTick(): f32 {
  return tick;
}

export function getPatternIndex(): usize {
  return patternIndex;
}

export function getPatternNoteIndex(): usize {
  return patternNoteIndex;
}

export function toggleSongPlay(status: boolean): void {
  if(!status && playOrPause) {
    for(let n=0;n<NUM_INSTRUMENTS;n++) {    
      setChannelValue(n, 0 as f32);
    }
  }
  playOrPause = status;
}

function updateInstrumentNotes(): void {
  if(!playOrPause) {
    return;
  }
  let songlengthf32: f32 = songlength as f32;

  if((tick / PATTERN_LENGTH) > songlengthf32) {
    tick -= (songlengthf32 * PATTERN_LENGTH);    
  }

  patternIndexf32 = (tick / PATTERN_LENGTH);
  patternIndex = patternIndexf32 as usize;  
  let newPatternNoteIndex: usize = ((patternIndexf32 - (patternIndex as f32)) * PATTERN_LENGTH) as usize;;

  if(newPatternNoteIndex===patternNoteIndex) {
    return;
  }

  patternNoteIndex = newPatternNoteIndex;
  
  for(let n=0;n<NUM_INSTRUMENTS;n++) {    
    let instrumentPatternIndex = load<u8>(instrumentPatternListsPtr +
        n * songlength +
        patternIndex);
    
    let channelValue: f32 = (load<u8>(patternsPtr + (instrumentPatternIndex << PATTERN_SIZE_SHIFT) 
        + patternNoteIndex)) as f32
    
    if(currentChannelValuesBufferPtr) {
      store<f32>(currentChannelValuesBufferPtr + n*4, channelValue);
    }

    setChannelValue(n, channelValue);
  }
}

export function allocatePatterns(numpatterns: i32): usize {
  patternsPtr = memory.allocate(numpatterns << PATTERN_SIZE_SHIFT);
  return patternsPtr;
}

export function allocateInstrumentPatternList(songpatternslength: i32, numinstruments: i32): usize {
  NUM_INSTRUMENTS = numinstruments;
  songlength = songpatternslength;
  instrumentPatternListsPtr = memory.allocate(songpatternslength * NUM_INSTRUMENTS);
  return instrumentPatternListsPtr;
}

export function allocateSampleBuffer(frames: usize): usize {
  sampleBufferFrames = frames;
  sampleBufferPtr = memory.allocate(frames * 2 * 4);
  return sampleBufferPtr;
}

export function getCurrentChannelValuesBufferPtr(): usize {
  if(!currentChannelValuesBufferPtr) {
    currentChannelValuesBufferPtr = memory.allocate(NUM_INSTRUMENTS * 4);
  }
  return currentChannelValuesBufferPtr;
}

export function fillSampleBuffer(): void {      
  updateInstrumentNotes();
  for(let n: usize=0;n<sampleBufferFrames;n++) {    
    mixernext();    
    tick += ticksPerSample;
    store<f32>(sampleBufferPtr + (n * 4), signal.left);
    store<f32>(sampleBufferPtr + (n * 4) + (sampleBufferFrames * 4), signal.right);    
  }
}