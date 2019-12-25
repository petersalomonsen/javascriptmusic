// The entry file of the synth WebAssembly module.

// --- Replace with your own mix implementation here
import { mixernext, setChannelValue, PATTERN_SIZE_SHIFT, BEATS_PER_PATTERN_SHIFT } from './mixes/shuffle.mix';
export { setChannelValue } from './mixes/shuffle.mix';
// -------------------------------------------------

import { SAMPLERATE } from './environment';

const PATTERN_LENGTH: f32 = (1 << PATTERN_SIZE_SHIFT) as f32;

let NUM_INSTRUMENTS: i32;

let holdChannelValuesBufferPtr: usize;
let currentChannelValuesBufferPtr: usize;
let patternsPtr: usize;
let instrumentPatternListsPtr: usize;
let sampleBufferPtr: usize;
let sampleBufferFrames: usize;
let songlength: usize = 0;

let patternIndexf64: f64 = 0;
let patternIndex: usize = 0;  
let patternNoteIndex: usize = -1;

let tick: f64 = 0;
let ticksPerBeat: f32 = (1 << PATTERN_SIZE_SHIFT >> BEATS_PER_PATTERN_SHIFT) as f32;
let bpm: f32 = 120;

let ticksPerSec = ticksPerBeat * bpm / 60;
let ticksPerSample = ticksPerSec / SAMPLERATE;

let playOrPause: boolean = true;

export function setBPM(BPM: f32): void {
  bpm = BPM;
  ticksPerSec = ticksPerBeat * BPM / 60;
  ticksPerSample = ticksPerSec / SAMPLERATE;
}

export function getTick(): f64 {
  return tick;
}

export function setMilliSecondPosition(millis: f64): void {
  let newtick: f64 = millis * ticksPerSec / 1000;
  let ticklength = songlength as f64 * PATTERN_LENGTH;

  newtick -= (floor(newtick / ticklength) * ticklength);
  if(abs(newtick - tick) > 1) {
    tick = newtick;
  }
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

export function isPlaying(): boolean {
  return playOrPause;
}

function updateInstrumentNotes(): void {
  if(!playOrPause) {
    return;
  }
  let songlengthf64: f64 = songlength as f64;

  if((tick / PATTERN_LENGTH) > songlengthf64) {
    tick -= (songlengthf64 * PATTERN_LENGTH);    
  }

  patternIndexf64 = (tick / PATTERN_LENGTH) as f64;
  patternIndex = patternIndexf64 as usize;  
  let newPatternNoteIndex: usize = ((patternIndexf64 - (patternIndex as f64)) * PATTERN_LENGTH) as usize;

  if(newPatternNoteIndex===patternNoteIndex) {
    return;
  }

  patternNoteIndex = newPatternNoteIndex;
  
  for(let n=0;n<NUM_INSTRUMENTS;n++) {    
    let instrumentPatternIndex = load<u8>(instrumentPatternListsPtr +
        n * songlength +
        patternIndex) as usize;
    
    let channelValue: f32 = load<u8>(patternsPtr + (instrumentPatternIndex << PATTERN_SIZE_SHIFT)
        + patternNoteIndex) as f32;
    
    let holdChannelValue: f32 = load<f32>(holdChannelValuesBufferPtr + n * 4);
    if(holdChannelValue > 0 && channelValue !== 1 && channelValue !== holdChannelValue) {
      // Hold value
      channelValue = 1;
      store<u8>(patternsPtr + (instrumentPatternIndex << PATTERN_SIZE_SHIFT)
        + patternNoteIndex, 1 as u8);
    }

    // 1 means HOLD value - no change to the visualizer     
    if(channelValue !== 1) {   
      // For external visualizer to monitor channel values currently been played by the sequencer            
      store<f32>(currentChannelValuesBufferPtr + n*4, channelValue);
      setChannelValue(n, channelValue);
    }    
  }
}

export function getHoldChannelValuesBufferPtr(): usize {
  return holdChannelValuesBufferPtr;
}

export function recordChannelValue(channel: usize, value: f32): void {
  store<f32>(holdChannelValuesBufferPtr + channel * 4, value);
  setChannelValue(channel, value);
}

export function allocatePatterns(numpatterns: i32): usize {
  patternsPtr = __alloc(numpatterns << PATTERN_SIZE_SHIFT, idof<Array<u32>>());
  return patternsPtr;
}

export function allocateInstrumentPatternList(songpatternslength: i32, numinstruments: i32): usize {
  NUM_INSTRUMENTS = numinstruments;
  songlength = songpatternslength;
  
  currentChannelValuesBufferPtr = __alloc(NUM_INSTRUMENTS * 4, idof<Array<f32>>());
  holdChannelValuesBufferPtr = __alloc(NUM_INSTRUMENTS * 4, idof<Array<f32>>());
  instrumentPatternListsPtr = __alloc(songpatternslength * NUM_INSTRUMENTS, idof<Array<u32>>());

  return instrumentPatternListsPtr;
}

export function allocateSampleBuffer(frames: usize): usize {
  sampleBufferFrames = frames;
  sampleBufferPtr = __alloc(frames * 2 * 4, idof<Array<f32>>());
  return sampleBufferPtr;
}

export function getCurrentChannelValuesBufferPtr(): usize {
  return currentChannelValuesBufferPtr;
}

export function fillSampleBuffer(): void {      
  updateInstrumentNotes();
  for(let n: usize = 0;n<sampleBufferFrames;n++) {   
    let sampleNdx: usize = n << 2; 
    mixernext(sampleBufferPtr + sampleNdx, sampleBufferPtr + sampleNdx + (sampleBufferFrames << 2));    
    tick += ticksPerSample;
  }
}