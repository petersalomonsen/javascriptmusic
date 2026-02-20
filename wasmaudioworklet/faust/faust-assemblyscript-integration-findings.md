# Faust Instruments in the AssemblyScript MidiSynth: Research Findings

## Table of Contents
1. [AssemblyScript MidiSynth Architecture](#1-assemblyscript-midisynth-architecture)
2. [Current Faust Integration (Standalone, Not Integrated)](#2-current-faust-integration-standalone-not-integrated)
3. [Path A: Enhance Standalone Faust to Match MidiSynth Capabilities](#3-path-a-enhance-standalone-faust-to-match-midisynth-capabilities)
4. [Path B: Transpile Faust DSP to AssemblyScript MidiVoice](#4-path-b-transpile-faust-dsp-to-assemblyscript-midivoice)
5. [Key File References](#5-key-file-references)

---

## 1. AssemblyScript MidiSynth Architecture

The AssemblyScript MidiSynth is the reference architecture both paths should aim to match.

### 1.1 MidiVoice Base Class

**File:** `wasmaudioworklet/synth1/assembly/midi/midisynth.ts:166-215`

```typescript
export abstract class MidiVoice {
    channel: MidiChannel;
    note: u8;
    velocity: u8;
    activeVoicesIndex: i32 = -1;
    minnote: u8 = 0;
    maxnote: u8 = 127;

    noteon(note: u8, velocity: u8): void;   // trigger attack
    noteoff(): void;                         // trigger release
    isDone(): boolean;                       // true when voice can be recycled
    abstract nextframe(): void;              // generate ONE stereo sample frame
}
```

Key contract:
- `noteon()` - set frequency from MIDI note, trigger envelope attack
- `noteoff()` - trigger envelope release
- `isDone()` - return true when envelope is fully released (voice recyclable)
- `nextframe()` - generate one sample and add it to `this.channel.signal`

### 1.2 Example: DefaultInstrument

**File:** `wasmaudioworklet/synth1/assembly/midi/instruments/defaultinstrument.ts`

```typescript
export class DefaultInstrument extends MidiVoice {
    osc: SineOscillator = new SineOscillator();
    env: Envelope = new Envelope(0.01, 0.0, 1.0, 0.01);

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.osc.frequency = notefreq(note);
        this.env.attack();
    }
    noteoff(): void { this.env.release(); }
    isDone(): boolean { return this.env.isDone(); }

    nextframe(): void {
        const signal = this.osc.next() * this.env.next() * this.velocity / 256;
        this.channel.signal.addMonoSignal(signal, 0.2, 0.5);
    }
}
```

### 1.3 Multi-Timbral Channel Management

**File:** `wasmaudioworklet/synth1/assembly/midi/midisynth.ts:34-164`

- 16 `MidiChannel` instances, each with its own voice pool and instrument type
- Each channel has: volume (CC7), pan (CC10), sustain (CC64), reverb send (CC91)
- Voice stealing with crossfade when all voices in a channel are busy
- Max 32 active voices across all 16 channels

**File:** `wasmaudioworklet/synth1/assembly/mixes/midi.mix.ts`

```typescript
export function initializeMidiSynth(): void {
    // Different instruments on different MIDI channels
    midichannels[0] = new MidiChannel(8, (ch) => new DefaultInstrument(ch));
    // midichannels[1] = new MidiChannel(4, (ch) => new PadInstrument(ch));
    // etc.
}
```

### 1.4 MIDI Message Handling

**File:** `wasmaudioworklet/synth1/assembly/midi/midisynth.ts:217-237`

```typescript
export function shortmessage(val1: u8, val2: u8, val3: u8): void {
    const channel = val1 & 0xf;       // routes to correct MidiChannel
    const command = val1 & 0xf0;
    if (command === 0x90 && val3 > 0) {
        midichannels[channel].activateVoice(val2, channel);
    } else if (command === 0x80 || (command === 0x90 && val3 === 0)) {
        midichannels[channel].noteoff(val2);
    } else if (command === 0xb0) {
        midichannels[channel].controlchange(val2, val3);
    }
}
```

### 1.5 Audio Rendering

**File:** `wasmaudioworklet/synth1/assembly/midi/midisynth.ts:286-338`

Per 128-sample buffer:
1. `cleanupInactiveVoices()` - recycle voices where `isDone() === true`
2. For each sample frame:
   - `playActiveVoices()` - calls `nextframe()` on every active MidiVoice
   - Per channel: apply pan, volume, reverb send
   - Freeverb on wet signal
   - `postprocess()` (compression/limiting)
   - Store L/R to `samplebuffer`

### 1.6 AudioWorkletProcessor

**File:** `wasmaudioworklet/synth1/audioworklet/midisynthaudioworkletprocessor.js`

Extremely simple - the WASM does all the work:
```javascript
process(inputs, outputs) {
    if (this.wasmInstance) {
        midisequencer.onprocess();              // dispatch queued MIDI events
        this.wasmInstance.fillSampleBuffer();    // generate 128 stereo samples in WASM
        output[0].set(new Float32Array(memory, samplebuffer, 128));       // L
        output[1].set(new Float32Array(memory, samplebuffer + 512, 128)); // R
    }
}
```

### 1.7 Key Capabilities to Match

- **Multi-timbral**: different instrument on each of 16 MIDI channels
- **Polyphonic per channel**: configurable voice count per channel
- **Per-channel mixing**: volume, pan, reverb send via MIDI CC
- **Voice lifecycle**: noteon/noteoff/isDone with voice stealing
- **Single WASM binary**: everything compiled together
- **Simple AudioWorkletProcessor**: just passes MIDI in and pulls samples out
- **MIDI sequencer integration**: queued events dispatched in audio thread

---

## 2. Current Faust Integration (Standalone, Not Integrated)

**File:** `wasmaudioworklet/faust/faustcompiler.js`

The existing Faust integration is a **completely separate system** from the AssemblyScript MidiSynth:

- Loads `@grame/faustwasm` from CDN, compiles Faust DSP to its own WASM
- `FaustPolyDspGenerator.createNode()` creates a **standalone AudioWorklet node** with its own processor
- MIDI sent directly via `faustNode.midiMessage()`
- The Faust node connects directly to `audioContext.destination`

**What it lacks vs the AS MidiSynth:**
- **Not multi-timbral**: one DSP algorithm across all voices, MIDI channel parameter is explicitly ignored in `keyOn()` (faustwasm `FaustWebAudioDsp.ts:2519` - comment: "not used for now")
- **No per-channel mixing**: no independent volume/pan/reverb per MIDI channel
- **No voice stealing with crossfade**: simpler voice allocation
- **Heavy AudioWorkletProcessor**: the processor contains the entire DSP engine, voice manager, parameter system

---

## 3. Path A: Enhance Standalone Faust to Match MidiSynth Capabilities

### 3.1 Concept

Build a new multi-timbral Faust AudioWorklet system that mirrors the AS MidiSynth architecture, but implemented in JavaScript/WASM rather than AssemblyScript. Multiple Faust-compiled WASM modules (one per instrument) would be loaded into a single AudioWorkletProcessor that handles MIDI routing, per-channel mixing, and voice management.

### 3.2 Architecture

```
                        AudioWorkletProcessor
                  ┌──────────────────────────────────┐
                  │                                  │
  MIDI in ──────► │  MIDI Router (by channel)        │
                  │    │                             │
                  │    ├─ Ch 0 ─► VoicePool[0]       │
                  │    │          (Faust WASM A)      │
                  │    │          voices × N          │
                  │    │                             │
                  │    ├─ Ch 1 ─► VoicePool[1]       │
                  │    │          (Faust WASM B)      │
                  │    │          voices × N          │
                  │    │                             │
                  │    └─ Ch 9 ─► VoicePool[9]       │
                  │               (Faust WASM C)     │
                  │               voices × N         │
                  │                                  │
                  │  Per-Channel Mixer:               │
                  │    volume, pan, reverb send       │
                  │                                  │
                  │  Master Effects:                  │
                  │    reverb, compression            │
                  │                                  │ ──────► Audio Out
                  └──────────────────────────────────┘
```

### 3.3 What Needs To Be Built

**1. Multi-timbral voice manager (in JS, runs in AudioWorklet)**
- 16 channel slots, each assignable to a different Faust WASM module
- Per-channel voice pool: allocate/free voices, voice stealing
- MIDI routing: `shortmessage()` equivalent dispatching by channel
- Per-voice parameter setting: `freq`, `gate`, `gain` via `setParamValue()`

**2. Per-channel mixing (in JS)**
- Volume, pan, reverb send per channel (responding to MIDI CC)
- Mix all voice outputs per channel, then mix channels

**3. Master effects**
- Reverb (could use another Faust DSP or a JS implementation)
- Compression/limiting

**4. Custom AudioWorkletProcessor**
- Load multiple Faust WASM modules
- Manage voice pools per channel
- Call `compute()` per active voice per buffer
- Mix and output

### 3.4 How Faust Voice Instances Work

Each Faust WASM module can host multiple voice instances in its linear memory:

```javascript
// Voice N's DSP struct starts at offset N * dspSize
const dspSize = JSON.parse(factory.json).size;

// Initialize each voice
for (let i = 0; i < numVoices; i++) {
    faustExports.init(i * dspSize, sampleRate);
}

// Trigger note on voice 3
faustExports.setParamValue(3 * dspSize, freqParamIndex, 440.0);
faustExports.setParamValue(3 * dspSize, gateParamIndex, 1.0);
faustExports.setParamValue(3 * dspSize, gainParamIndex, 0.8);

// Render voice 3
faustExports.compute(3 * dspSize, 128, inputsPtr, outputsPtr);
```

The metadata JSON from compilation tells us:
- `size`: bytes per DSP instance
- `inputs` / `outputs`: channel count
- UI items with `index` field: byte offset of each parameter within the DSP struct

### 3.5 Pros and Cons

**Pros:**
- Hot-swappable instruments (load new Faust WASM at runtime)
- Uses Faust's optimized WASM `compute()` directly
- Can use any Faust DSP library instrument
- No AssemblyScript compilation needed for instrument changes
- Leverages existing faustwasm compilation pipeline

**Cons:**
- Significant JS code needed in AudioWorkletProcessor (voice management, mixing, effects)
- Multiple WASM instances (one per instrument type) - more memory
- Mixing/effects in JS rather than WASM - potentially slower
- Duplicates much of what the AS MidiSynth already does, but in JS

### 3.6 Effort Estimate

- Voice manager + MIDI router: moderate (can reference faustwasm's existing `FaustPolyWebAudioDsp`)
- Per-channel mixer: straightforward
- Master effects: moderate (reverb is the main one)
- Custom AudioWorkletProcessor: moderate
- Testing multi-timbral with sequences: moderate

---

## 4. Path B: Transpile Faust DSP to AssemblyScript MidiVoice

### 4.1 Concept

Use Faust's code generation to produce AssemblyScript source code that implements the `MidiVoice` interface directly. The generated code compiles alongside the existing AS synth into a single WASM binary.

### 4.2 Faust's Existing Code Generation Architecture

Faust already has **19 code generation backends** including C, C++, Rust, Java, C#, D, Julia, JAX, JSFX, Cmajor, WASM binary, WASM text, and more.

**All text-based backends follow the same pattern:**

```
Faust DSP → Signal Graph → FIR (Faust Imperative Representation) → Target Code
```

**FIR** (`resources/faust/compiler/generator/instructions.hh`, 3930 lines) is a universal intermediate representation:
- `FloatNumInst`, `Int32NumInst` - literals
- `LoadVarInst`, `StoreVarInst` - memory access
- `BinopInst` - arithmetic/logic operators
- `ForLoopInst`, `IfInst`, `SwitchInst` - control flow
- `FunCallInst` - function calls (math library etc.)
- `DeclareVarInst` - variable declarations

**Each backend consists of 3 files:**
1. `*_code_container.hh` - class hierarchy (generates DSP class structure)
2. `*_code_container.cpp` - produces the class (init, compute, UI methods)
3. `*_instructions.hh` - `InstVisitor` subclass that maps FIR → target language syntax

**There is even a template backend** (`resources/faust/compiler/generator/template/README.md`) that serves as a tutorial for adding new backends.

### 4.3 How Close Are Existing Backends?

The **Rust backend** is the best starting point for AssemblyScript:

| Aspect | Rust | AssemblyScript | Similarity |
|--------|------|----------------|-----------|
| Type system | `i32`, `f32`, `f64` | `i32`, `f32`, `f64` | Identical |
| Arrays | `Vec<f32>` / `[f32; N]` | `StaticArray<f32>` | Very close |
| Math | `f32::sin()` etc. | `Mathf.sin()` / `Math.sin()` | Easy mapping |
| Classes/structs | `struct` + `impl` | `class` | Syntactic diff |
| Memory | Stack + heap | `--runtime stub`, no GC, raw `changetype<usize>()` pointers | Very close |
| Generics | Yes | Yes | Similar |
| Exports | `pub fn` | `export function` | Syntactic diff |

**Rust backend files to adapt:**
- `resources/faust/compiler/generator/rust/rust_instructions.hh` (896 lines)
- `resources/faust/compiler/generator/rust/rust_code_container.cpp` (1450 lines)
- `resources/faust/compiler/generator/rust/rust_code_container.hh` (132 lines)

### 4.4 What an AssemblyScript Backend Would Generate

Given this Faust input:
```faust
import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
process = os.sawtooth(freq) : fi.lowpass(2, freq*4)
        : *(en.adsr(0.01, 0.1, 0.7, 0.3, gate)) : *(gain);
```

The backend would generate something like:

```typescript
import { MidiVoice } from "../midisynth";
import { notefreq } from "../../synth/note";

export class FaustSawSynth extends MidiVoice {
    // DSP state (from Faust's compute variables)
    private fRec0: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec1: StaticArray<f32> = new StaticArray<f32>(2);
    private fRec2: StaticArray<f32> = new StaticArray<f32>(3);
    // ... more state arrays from Faust

    // Parameters (from Faust UI declarations)
    private fFreq: f32 = 440.0;
    private fGate: f32 = 0.0;
    private fGain: f32 = 0.5;

    // Sample rate dependent constants
    private fConst0: f32;
    private fConst1: f32;

    constructor(channel: MidiChannel) {
        super(channel);
        this.instanceConstants(SAMPLERATE);
        this.instanceClear();
    }

    private instanceConstants(sampleRate: i32): void {
        this.fConst0 = 1.0 / <f32>sampleRate;
        this.fConst1 = Mathf.exp(0.0 - (100.0 / <f32>sampleRate));
        // ... more constants
    }

    private instanceClear(): void {
        for (let i = 0; i < 2; i++) { this.fRec0[i] = 0; }
        for (let i = 0; i < 2; i++) { this.fRec1[i] = 0; }
        for (let i = 0; i < 3; i++) { this.fRec2[i] = 0; }
    }

    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        this.fFreq = notefreq(note);
        this.fGate = 1.0;
        this.fGain = <f32>velocity / 127.0;
    }

    noteoff(): void {
        this.fGate = 0.0;
    }

    isDone(): boolean {
        // Check if ADSR envelope has fully released
        return this.fGate == 0.0 && this.fRec1[0] < 0.0001;
    }

    nextframe(): void {
        // --- Faust compute() logic for ONE sample ---
        // (translated from the Faust-generated C++ compute loop body)

        // Sawtooth oscillator
        this.fRec0[0] = this.fConst0 * this.fFreq + (this.fRec0[1] - Mathf.floor(this.fRec0[1]));
        const fSaw: f32 = 2.0 * this.fRec0[0] - 1.0;

        // Lowpass filter
        // ... filter state update ...

        // ADSR envelope
        // ... envelope state update ...

        const output: f32 = fFiltered * fEnvelope * this.fGain;

        // Shift delay lines
        this.fRec0[1] = this.fRec0[0];
        this.fRec1[1] = this.fRec1[0];
        // ...

        // Add to channel signal (mono signal with level and pan)
        this.channel.signal.addMonoSignal(output, 0.5, 0.5);
    }
}
```

### 4.5 AssemblyScript Runtime: No GC

The AS MidiSynth is compiled with `--runtime stub` and `"use": "abort="` — **no garbage collector, no managed runtime**. This is deliberate to avoid GC pauses in the audio thread. Key implications for generated code:

- All allocations use `StaticArray<T>` (fixed-size, no GC overhead) — never `Array<T>`
- Raw pointer access via `changetype<usize>()` and `store<f32>()` / `load<f32>()`
- All objects are allocated at initialization time, never during audio rendering
- No closures or dynamic dispatch in hot paths

This actually makes the transpilation **easier** — the generated code is closer to C-style: fixed arrays, direct memory access, no heap allocation in `nextframe()`.

### 4.6 Creating a Faust AssemblyScript Backend

**Steps to add `-lang assemblyscript` to the Faust compiler:**

1. **Create backend files** in `resources/faust/compiler/generator/assemblyscript/`:
   - `assemblyscript_instructions.hh` (~900 lines, adapt from Rust)
   - `assemblyscript_code_container.hh` (~130 lines, adapt from Rust)
   - `assemblyscript_code_container.cpp` (~1500 lines, adapt from Rust)

2. **Key mappings in `assemblyscript_instructions.hh`:**
   ```cpp
   // Type mappings
   fTypeManager->fTypeDirectTable[Typed::kFloat]  = "f32";
   fTypeManager->fTypeDirectTable[Typed::kInt32]   = "i32";
   fTypeManager->fTypeDirectTable[Typed::kDouble]  = "f64";
   fTypeManager->fTypeDirectTable[Typed::kBool]    = "bool";

   // Math function mappings
   fMathLibTable["fabsf"]  = "Mathf.abs";
   fMathLibTable["sinf"]   = "Mathf.sin";
   fMathLibTable["cosf"]   = "Mathf.cos";
   fMathLibTable["expf"]   = "Mathf.exp";
   fMathLibTable["logf"]   = "Mathf.log";
   fMathLibTable["floorf"] = "Mathf.floor";
   fMathLibTable["powf"]   = "Mathf.pow";
   fMathLibTable["fminf"]  = "Mathf.min";
   fMathLibTable["fmaxf"]  = "Mathf.max";
   fMathLibTable["sqrtf"]  = "Mathf.sqrt";
   fMathLibTable["tanf"]   = "Mathf.tan";
   // etc.

   // Array declarations — use StaticArray (no GC)
   // Rust: let mut fRec0: [F32; 2] = [0.0; 2];
   // AS:   fRec0: StaticArray<f32> = new StaticArray<f32>(2);
   ```

3. **Register in `libcode.cpp`** (line ~1088):
   ```cpp
   else if (gGlobal->gOutputLang == "assemblyscript") {
       compileAssemblyScript(signals, numInputs, numOutputs, gDst.get());
   }
   ```

4. **Wrap output as MidiVoice subclass** in the code container's `produceClass()`:
   - Generate the class extending `MidiVoice`
   - Map `freq`/`gate`/`gain` parameters to `noteon()`/`noteoff()` methods
   - Unroll `compute()` loop to single-sample `nextframe()` method
   - Generate `isDone()` based on gate state + envelope level
   - All arrays as `StaticArray<T>` (no GC)
   - No allocations inside `nextframe()`

### 4.7 Alternative: Lightweight Transpiler (Without Modifying Faust)

Instead of modifying the Faust compiler itself, we could:

1. **Use Faust's existing Rust output** (`faust -lang rust`)
2. **Write a Rust-to-AssemblyScript transpiler** - the languages are similar enough that a relatively simple AST-level transformation would work
3. **Or use Faust's C output** (`faust -lang c`) and write a C-to-AS transpiler

The C output is the simplest (no ownership/lifetime complexity):

```bash
faust -lang c -cn MySynth mysynth.dsp -o mysynth.c
```

This produces a C file with:
- `typedef struct { ... } MySynth;` - state struct
- `void compute(MySynth* dsp, int count, float** inputs, float** outputs)` - audio loop
- `void init(MySynth* dsp, int sample_rate)` - initialization

This C code maps almost directly to AssemblyScript with simple search-and-replace rules.

### 4.8 Pros and Cons

**Pros:**
- True `MidiVoice` integration - instruments participate in the full mixing chain (per-channel volume, pan, reverb send, master reverb, compression)
- Single WASM binary, maximum performance
- Voice management handled by existing `MidiChannel`/`MidiVoice` system
- Sample-by-sample processing matches the AS architecture perfectly
- Multi-timbral for free (assign different Faust instruments to different channels)
- All existing MidiSynth features work (sustain pedal, voice stealing, MIDI sequences)

**Cons:**
- Each new instrument requires transpilation + AS recompilation
- No runtime hot-swap of instruments (compile-time decision)
- Faust compiler modification (Path B1) or custom transpiler (Path B2) needed upfront
- Generated code may need manual tuning for edge cases

### 4.9 Effort Estimate

**Path B1 (Faust backend):** ~5-7 days
- Core `InstVisitor` for AssemblyScript: 2-3 days
- Code container with `MidiVoice` wrapping: 2-3 days
- Testing + build integration: 1 day

**Path B2 (C-to-AS transpiler):** ~3-5 days
- Parse Faust C output (relatively simple, structured): 1-2 days
- Generate AssemblyScript `MidiVoice` class: 1-2 days
- Testing + refinement: 1 day

---

## 5. Key File References

### AssemblyScript MidiSynth
| File | Description |
|------|-------------|
| `synth1/assembly/midi/midisynth.ts:166-215` | MidiVoice abstract class |
| `synth1/assembly/midi/midisynth.ts:34-164` | MidiChannel (voice management, CC handling) |
| `synth1/assembly/midi/midisynth.ts:217-237` | `shortmessage()` - MIDI routing by channel |
| `synth1/assembly/midi/midisynth.ts:286-338` | `fillSampleBuffer()` - render loop |
| `synth1/assembly/midi/instruments/defaultinstrument.ts` | Example MidiVoice implementation |
| `synth1/assembly/mixes/midi.mix.ts` | MIDI channel/instrument initialization |
| `synth1/audioworklet/midisynthaudioworkletprocessor.js` | Simple AudioWorkletProcessor |

### Current Faust Integration (Standalone)
| File | Description |
|------|-------------|
| `faust/faustcompiler.js` | Faust compilation via CDN faustwasm |
| `faust/faustsequencer.js` | MIDI sequencer for standalone Faust node |

### faustwasm Library
| File | Description |
|------|-------------|
| `resources/faustwasm/src/FaustCompiler.ts` | Compilation pipeline |
| `resources/faustwasm/src/FaustDspInstance.ts` | WASM export interface (11 functions) |
| `resources/faustwasm/src/FaustWebAudioDsp.ts:2519` | `keyOn()` - channel ignored, no multi-timbral |

### Faust Compiler Code Generation
| File | Description |
|------|-------------|
| `resources/faust/compiler/generator/instructions.hh` | FIR instruction set (3930 lines) |
| `resources/faust/compiler/generator/text_instructions.hh` | Base visitor for text backends |
| `resources/faust/compiler/generator/rust/rust_instructions.hh` | Rust backend (896 lines, best AS starting point) |
| `resources/faust/compiler/generator/rust/rust_code_container.cpp` | Rust code container (1450 lines) |
| `resources/faust/compiler/generator/c/c_instructions.hh` | C backend (simpler alternative starting point) |
| `resources/faust/compiler/generator/template/README.md` | Tutorial for adding new backends |
| `resources/faust/compiler/libcode.cpp:1066-1117` | Backend selection / `-lang` dispatch |
