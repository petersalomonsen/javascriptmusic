// transpile-core.js — MidiVoice/MidiChannel wrapper codegen around the native
// faust-rs AssemblyScript output.
//
// The DSPs are compiled with the execution options `--ec --os` (external
// control + one-sample), so the native class ships ready-to-use entry points:
//   control()                    — recompute control-rate values from the
//                                  UI zone fields (fHsliderN, fButtonN, ...)
//   frame(inputs, outputs)       — process exactly one sample over flat
//                                  StaticArray<f32> channel arrays
// The old block→one-sample structural reshape (parseComputeBody /
// reshapeASLine / reshapeSIGInit / ...) is gone: the native class is included
// verbatim and thin MidiVoice / MidiChannel wrappers delegate to it.
//
// Native-class naming convention: callers compile the voice DSP with
// `-cn <ClsName>Dsp` and the effect (`-pn effect`) with
// `-cn <ClsName>EffectDsp`, so the wrappers keep the historical public names
// (<ClsName>, <ClsName>Channel).
//
// Public API:
//   toClassName(base)                 — derive a PascalCase class name
//   extractUIFromJSON(asSource)       — parse getJSON() metadata
//   splitNativeSource(asSource, cls)  — split preamble / class, strip getJSON
//   transpileDsp({ asSource, effectAsSource, clsName, sourceFile, options })
//   transpileEffect({ asSource, clsName, sourceFile, importDepth })
//   generateNRPNSetParam(lines, ccParams)
//   generateNRPNDefaults(lines, ccParams, channelIndex)
//   assembleSingleFile(result, { forEditor, importDepth })
//   assembleBundle(results, { forEditor })

// ---------------------------------------------------------------------------
// Class-name helper
// ---------------------------------------------------------------------------

export function toClassName(base) {
    return base.split(/[_\-]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('').replace(/MIDI$/i, '');
}

// ---------------------------------------------------------------------------
// Parse UI metadata from getJSON() embedded in AS output
// ---------------------------------------------------------------------------

export function extractUIFromJSON(asSource) {
    const getJSONMatch = asSource.match(/getJSON\(\)\s*:\s*string\s*\{[\s\S]*?return\s+"((?:[^"\\]|\\.)*)"\s*;/m);
    if (!getJSONMatch) return { uiParams: [], numInputs: 0, numOutputs: 0 };

    // Decode escaped string content
    const normalized = getJSONMatch[1].replace(/\\'/g, "'");
    let json;
    try {
        json = JSON.parse(JSON.parse(`"${normalized}"`));
    } catch (e) {
        console.warn('Warning: Could not parse getJSON() metadata');
        return { uiParams: [], numInputs: 0, numOutputs: 0 };
    }

    const numInputs = json.inputs || 0;
    const numOutputs = json.outputs || 0;
    const uiParams = [];

    function walkUI(items) {
        for (const item of items || []) {
            if (item.type === 'vgroup' || item.type === 'hgroup' || item.type === 'tgroup') {
                walkUI(item.items || []);
            } else if (item.varname) {
                const param = {
                    name: item.label,
                    field: item.varname,
                    address: item.address || '',
                    init: item.init ?? 0,
                    min: item.min ?? 0,
                    max: item.max ?? 1,
                    step: item.step ?? 0.01,
                    isButton: item.type === 'button',
                    isCheckbox: item.type === 'checkbox',
                    midi: {},
                };
                // Extract midi metadata from meta array
                if (item.meta) {
                    for (const m of item.meta) {
                        for (const [key, val] of Object.entries(m)) {
                            param.midi[key] = val;
                        }
                    }
                }
                uiParams.push(param);
            }
        }
    }
    walkUI(json.ui || []);

    return { uiParams, numInputs, numOutputs };
}

// ---------------------------------------------------------------------------
// Split the native faust-rs output into preamble + class source
// ---------------------------------------------------------------------------

// The native output is: a preamble of module-level math helpers (_fmodf,
// _rintf, ... — identical for every DSP compiled by the same module) and
// soundfile @external declarations, followed by one `export class X { ... }`.
//
// Returns { preamble, classSource } where classSource is the full class
// with the (potentially very large) getJSON() method stripped.
export function splitNativeSource(asSource, dspClassName) {
    const marker = `export class ${dspClassName} {`;
    const classStart = asSource.indexOf(marker);
    if (classStart === -1) {
        throw new Error(`Could not find export class ${dspClassName} in native AS output`);
    }

    let preamble = asSource.substring(0, classStart).trim();
    let classSource = asSource.substring(classStart).trim();

    // Drop the per-DSP header comment block (// Code generated with faust-rs
    // ... // name: <dsp>) so the remaining helper preamble is byte-identical
    // across DSPs and bundle assembly can deduplicate it.
    preamble = preamble
        .split('\n')
        .filter(line => !/^\s*\/\//.test(line))
        .join('\n')
        .trim();

    // Strip the embedded JSON string (parsed separately via
    // extractUIFromJSON) to keep the shipped source and data segment small.
    classSource = classSource.replace(
        /\n\s*getJSON\(\)\s*:\s*string\s*\{\s*\n\s*return\s+"(?:[^"\\]|\\.)*"\s*;\s*\n\s*\}/,
        ''
    );

    // Soundfile primitives need host-provided env imports the synth engine
    // does not supply — reject clearly instead of failing at instantiation.
    if (/\b_soundfile(?:Length|Rate|Buffer)\s*\(/.test(classSource)) {
        throw new Error('Faust soundfile primitives are not supported by the MidiVoice transpiler');
    }

    // The @external soundfile declares would become mandatory wasm imports —
    // strip them (they are unused after the check above).
    preamble = preamble
        .replace(/@external\("env",\s*"_soundfile\w+"\)\s*\n\s*declare function _soundfile\w+\([^)]*\)\s*:\s*\w+;\s*/g, '')
        .trim();

    return { preamble, classSource };
}

// ---------------------------------------------------------------------------
// Param naming helpers
// ---------------------------------------------------------------------------

const RESERVED_FIELD_NAMES = new Set([
    'channel', 'signal', 'voices', 'voiceindex', 'numvoices', 'note', 'velocity',
    'freq', 'gate', 'gain', 'isDone', 'noteon', 'noteoff', 'nextframe', 'preprocess',
    'postprocess', 'controlchange', 'silentSamples', 'releaseSamples', 'typedChannel',
    'constructor', 'class', 'super', 'this', 'instanceConstants', 'instanceClear',
    'dsp', 'effectDsp', 'applyParams', 'process',
    // Inherited MidiChannel / MidiVoice members (an accessor cannot override
    // a plain base-class property in AssemblyScript).
    'volume', 'reverb', 'pan', 'controllerValues', 'sustainedVoices',
    'voiceTransitionBuffer', 'activateVoice', 'removeFromSustainedVoices',
    'channelNo', 'activeVoicesIndex', 'activationCount', 'minnote', 'maxnote',
    'deactivate',
]);

function slugifyLabel(label) {
    const words = (label || '')
        .replace(/[^A-Za-z0-9 _-]/g, ' ')
        .split(/[\s_-]+/)
        .filter(Boolean);
    if (words.length === 0) return '';
    return words
        .map((w, i) => i === 0
            ? w.charAt(0).toLowerCase() + w.slice(1)
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}

function deriveNiceName(param, taken) {
    let base = param.midi && param.midi.symbol ? param.midi.symbol : slugifyLabel(param.name);
    if (!base || !/^[A-Za-z_]/.test(base)) base = 'p' + param.field;
    let name = base;
    let n = 2;
    while (taken.has(name) || RESERVED_FIELD_NAMES.has(name)) {
        name = base + n;
        n++;
    }
    taken.add(name);
    return name;
}

function paramDocComment(p) {
    const bits = [`init: ${p.init}`, `min: ${p.min}`, `max: ${p.max}`];
    if (p.step != null && p.step !== 0) bits.push(`step: ${p.step}`);
    const unit = p.midi && p.midi.unit;
    if (unit) bits.push(`unit: ${unit}`);
    let mapping = '';
    if (p.nrpn !== undefined) mapping = ` · NRPN ${p.nrpn}`;
    else if (p.cc !== undefined) mapping = ` · CC ${p.cc}`;
    return `    /** ${p.name} [${bits.join(', ')}]${mapping} */`;
}

// Public accessor pair backed by `_<niceName>`: writing the param marks the
// owner dirty so zone sync + control() happen before the next processed
// frame. This keeps the old "assign the field and it takes effect" contract
// for songs that poke params directly, without paying control() per write.
function pushParamAccessor(lines, p) {
    lines.push(`    private _${p.niceName}: f32 = <f32>(${p.init});`);
    lines.push(paramDocComment(p));
    lines.push(`    get ${p.niceName}(): f32 { return this._${p.niceName}; }`);
    lines.push(`    set ${p.niceName}(value: f32) { this._${p.niceName} = value; this._paramsDirty = true; }`);
}

// ---------------------------------------------------------------------------
// Core transpilation pipeline (pure)
// ---------------------------------------------------------------------------

// transpileDsp({ asSource, effectAsSource, clsName, sourceFile, options })
//   asSource       — native AS output for the voice DSP
//                    (compiled with `-cn <clsName>Dsp --ec --os`)
//   effectAsSource — native AS output for the effect (compiled with
//                    `-cn <clsName>EffectDsp -pn effect --ec --os`), or null
//   clsName        — public voice class name
//   sourceFile     — basename of the .dsp source (header comment only)
//   options        — legacy table/sig prefix options, accepted and ignored
//                    (native static tables are class-scoped, so bundling
//                    needs no renaming)
export function transpileDsp({ asSource, effectAsSource = null, clsName, sourceFile, options = {} }) {
    void options;

    const hasEffect = !!effectAsSource;
    const dspClassName = clsName + 'Dsp';
    const effectDspClassName = clsName + 'EffectDsp';
    const channelClassName = clsName + 'Channel';

    const { uiParams, numInputs, numOutputs } = extractUIFromJSON(asSource);
    const native = splitNativeSource(asSource, dspClassName);

    // === Determine global UI parameters ===

    const freqParam = uiParams.find(p => p.name === 'freq' || p.address.endsWith('/freq'));
    const gateParam = uiParams.find(p => p.isButton && (p.name === 'gate' || p.address.endsWith('/gate')));
    const gainParam = uiParams.find(p => p.name === 'gain' || p.address.endsWith('/gain'));

    const excludedFields = new Set([freqParam, gateParam, gainParam].filter(Boolean).map(p => p.field));
    const ccParams = uiParams.filter(p => !p.isButton && !excludedFields.has(p.field));
    // Sort checkboxes to end to match C backend NRPN layout (freq mode = NRPN 138-143)
    ccParams.sort((a, b) => (a.isCheckbox ? 1 : 0) - (b.isCheckbox ? 1 : 0));

    const MAX_SAFE_CC = 119;
    const RESERVED_CCS = new Set([7, 10, 64, 91]);
    let usableCCCount = 0;
    for (let i = 0; i <= MAX_SAFE_CC; i++) {
        if (!RESERVED_CCS.has(i)) usableCCCount++;
    }

    const useNRPN = ccParams.length > usableCCCount;

    if (useNRPN) {
        for (let i = 0; i < ccParams.length; i++) {
            ccParams[i].nrpn = i;
        }
    } else {
        let ccIndex = 0;
        for (const p of ccParams) {
            while (ccIndex <= MAX_SAFE_CC && RESERVED_CCS.has(ccIndex)) ccIndex++;
            if (ccIndex > MAX_SAFE_CC) break;
            p.cc = ccIndex;
            ccIndex++;
        }
    }

    // Derive an AS-friendly field name for each CC/NRPN-controlled UI param.
    const takenNames = new Set();
    for (const p of ccParams) {
        p.niceName = deriveNiceName(p, takenNames);
    }

    const hasChannelClass = hasEffect || ccParams.length > 0;

    // === Voice wrapper class ===

    const voiceClass = [];
    voiceClass.push(`export class ${clsName} extends MidiVoice {`);
    voiceClass.push(`    readonly dsp: ${dspClassName} = new ${dspClassName}();`);
    voiceClass.push(`    private fin: StaticArray<f32> = new StaticArray<f32>(${numInputs});`);
    voiceClass.push(`    private fout: StaticArray<f32> = new StaticArray<f32>(${Math.max(numOutputs, 1)});`);
    voiceClass.push('    private silentSamples: i32 = 0;');
    voiceClass.push('    private releaseSamples: i32 = 0;');
    if (hasChannelClass) {
        // Typed back-reference so param sync can read per-channel UI params
        // without a virtual call. Zero-cost reinterpret cast.
        voiceClass.push(`    typedChannel!: ${channelClassName};`);
    }
    voiceClass.push('');

    voiceClass.push('    constructor(channel: MidiChannel) {');
    voiceClass.push('        super(channel);');
    if (hasChannelClass) {
        voiceClass.push(`        this.typedChannel = changetype<${channelClassName}>(changetype<usize>(channel));`);
    }
    voiceClass.push('        this.dsp.init(<i32>SAMPLERATE);');
    voiceClass.push('    }');
    voiceClass.push('');

    if (ccParams.length > 0) {
        voiceClass.push('    // Copy channel-level params into the DSP UI zones and refresh');
        voiceClass.push('    // control-rate state. Invoked from the channel when params change.');
        voiceClass.push('    applyParams(): void {');
        for (const p of ccParams) {
            voiceClass.push(`        this.dsp.${p.field} = this.typedChannel.${p.niceName};`);
        }
        voiceClass.push('        this.dsp.control();');
        voiceClass.push('    }');
        voiceClass.push('');
    }

    voiceClass.push('    noteon(note: u8, velocity: u8): void {');
    voiceClass.push('        super.noteon(note, velocity);');
    if (freqParam) {
        voiceClass.push(`        this.dsp.${freqParam.field} = notefreq(note);`);
    }
    if (gainParam) {
        voiceClass.push(`        this.dsp.${gainParam.field} = <f32>velocity / 127.0;`);
    }
    for (const p of ccParams) {
        voiceClass.push(`        this.dsp.${p.field} = this.typedChannel.${p.niceName};`);
    }
    if (gateParam) {
        // Retrigger: run one silent frame with the gate closed so envelopes
        // restart cleanly when the voice is being reused.
        voiceClass.push(`        this.dsp.${gateParam.field} = 0.0;`);
        voiceClass.push('        this.dsp.control();');
        voiceClass.push('        this.dsp.frame(this.fin, this.fout);');
        voiceClass.push(`        this.dsp.${gateParam.field} = 1.0;`);
    }
    voiceClass.push('        this.dsp.control();');
    voiceClass.push('        this.silentSamples = 0;');
    voiceClass.push('        this.releaseSamples = 0;');
    voiceClass.push('    }');
    voiceClass.push('');

    voiceClass.push('    noteoff(): void {');
    if (gateParam) {
        voiceClass.push(`        this.dsp.${gateParam.field} = 0.0;`);
        voiceClass.push('        this.dsp.control();');
    }
    voiceClass.push('        this.silentSamples = 0;');
    voiceClass.push('        this.releaseSamples = 0;');
    voiceClass.push('    }');
    voiceClass.push('');

    voiceClass.push('    isDone(): boolean {');
    if (gateParam) {
        voiceClass.push(`        return this.dsp.${gateParam.field} == 0.0 && (this.silentSamples > 4410 || this.releaseSamples > 132300);`);
    } else {
        voiceClass.push('        return this.silentSamples > 4410 || this.releaseSamples > 132300;');
    }
    voiceClass.push('    }');
    voiceClass.push('');

    voiceClass.push('    nextframe(): void {');
    voiceClass.push('        this.dsp.frame(this.fin, this.fout);');
    voiceClass.push('        const output: f32 = this.fout[0];');
    voiceClass.push('        if (Mathf.abs(output) < 0.001) {');
    voiceClass.push('            this.silentSamples++;');
    voiceClass.push('        } else {');
    voiceClass.push('            this.silentSamples = 0;');
    voiceClass.push('        }');
    if (gateParam) {
        voiceClass.push(`        if (this.dsp.${gateParam.field} == 0.0) this.releaseSamples++;`);
    }
    voiceClass.push('        this.channel.signal.addMonoSignal(output, 0.5, 0.5);');
    voiceClass.push('    }');
    voiceClass.push('}');

    // === Channel class (effect and/or CC params) ===

    let effectNative = null;
    let effUIParams = [];
    let effNumInputs = 0;
    let effNumOutputs = 0;

    const channelClass = [];
    const voiceCCParams = ccParams.filter(p => p.cc !== undefined);
    if (hasChannelClass) {
        if (hasEffect) {
            const effUI = extractUIFromJSON(effectAsSource);
            effUIParams = effUI.uiParams;
            effNumInputs = effUI.numInputs;
            effNumOutputs = effUI.numOutputs;
            effectNative = splitNativeSource(effectAsSource, effectDspClassName);

            // Derive nice names for the effect's own UI params (sharing the
            // `takenNames` set with voice ccParams since both live on the same
            // channel class). Hoist any direct CC mapping onto p.cc so doc
            // comments can show it.
            for (const p of effUIParams) {
                if (p.midi && p.midi.midi) {
                    const m = p.midi.midi.match(/ctrl\s+(\d+)/);
                    if (m) p.cc = parseInt(m[1]);
                }
                p.niceName = deriveNiceName(p, takenNames);
            }
        }

        channelClass.push(`export class ${channelClassName} extends MidiChannel {`);
        channelClass.push('    private _paramsDirty: bool = true;');
        channelClass.push('');
        for (const p of ccParams) {
            pushParamAccessor(channelClass, p);
        }
        for (const p of effUIParams) {
            pushParamAccessor(channelClass, p);
        }
        channelClass.push('');

        if (hasEffect) {
            channelClass.push(`    readonly effectDsp: ${effectDspClassName} = new ${effectDspClassName}();`);
            channelClass.push(`    private efin: StaticArray<f32> = new StaticArray<f32>(${effNumInputs});`);
            channelClass.push(`    private efout: StaticArray<f32> = new StaticArray<f32>(${Math.max(effNumOutputs, 1)});`);
            channelClass.push('');
            channelClass.push('    constructor(numvoices: i32, factoryFunc: (channel: MidiChannel, voiceindex: i32) => MidiVoice) {');
            channelClass.push('        super(numvoices, factoryFunc);');
            channelClass.push('        this.effectDsp.init(<i32>SAMPLERATE);');
            channelClass.push('    }');
            channelClass.push('');
        }

        // Dirty-param sync: runs once per changed-param batch, before the
        // next processed frame.
        channelClass.push('    private applyParams(): void {');
        if (ccParams.length > 0) {
            channelClass.push('        for (let n = 0; n < this.voices.length; n++) {');
            channelClass.push(`            (this.voices[n] as ${clsName}).applyParams();`);
            channelClass.push('        }');
        }
        for (const p of effUIParams) {
            channelClass.push(`        this.effectDsp.${p.field} = this._${p.niceName};`);
        }
        if (hasEffect) {
            channelClass.push('        this.effectDsp.control();');
        }
        channelClass.push('    }');
        channelClass.push('');

        channelClass.push('    preprocess(): void {');
        channelClass.push('        if (this._paramsDirty) {');
        channelClass.push('            this._paramsDirty = false;');
        channelClass.push('            this.applyParams();');
        channelClass.push('        }');
        if (hasEffect) {
            if (effNumInputs > 0) {
                channelClass.push('        this.efin[0] = this.signal.left;');
            }
            if (effNumInputs > 1) {
                channelClass.push('        this.efin[1] = this.signal.right;');
            }
            channelClass.push('        this.effectDsp.frame(this.efin, this.efout);');
            channelClass.push('        this.signal.left = this.efout[0];');
            channelClass.push(effNumOutputs > 1
                ? '        this.signal.right = this.efout[1];'
                : '        this.signal.right = this.efout[0];');
        }
        channelClass.push('    }');

        // controlchange(): map CCs / NRPN onto the param accessors.
        const effCCMappings = effUIParams.filter(p => p.cc !== undefined);
        if (useNRPN && ccParams.length > 0) {
            channelClass.push('');
            channelClass.push('    private _nrpnMsb: u8 = 127;');
            channelClass.push('    private _nrpnLsb: u8 = 127;');
            channelClass.push('');
            channelClass.push('    controlchange(controller: u8, value: u8): void {');
            channelClass.push('        super.controlchange(controller, value);');
            channelClass.push('        switch (controller) {');
            for (const p of effCCMappings) {
                channelClass.push(`            case ${p.cc}:`);
                channelClass.push(`                this.${p.niceName} = ${p.min} + (<f32>value / 127.0) * ${p.max - p.min};`);
                channelClass.push('                break;');
            }
            channelClass.push('            case 99: this._nrpnMsb = value; break;');
            channelClass.push('            case 98: this._nrpnLsb = value; break;');
            channelClass.push('            case 6:');
            channelClass.push('                this._setParam(<u16>this._nrpnMsb * 128 + <u16>this._nrpnLsb, value);');
            channelClass.push('                break;');
            channelClass.push('        }');
            channelClass.push('    }');
            channelClass.push('');
            generateNRPNSetParam(channelClass, ccParams);
        } else if (voiceCCParams.length > 0 || effCCMappings.length > 0) {
            channelClass.push('');
            channelClass.push('    controlchange(controller: u8, value: u8): void {');
            channelClass.push('        super.controlchange(controller, value);');
            channelClass.push('        switch (controller) {');
            for (const p of effCCMappings) {
                channelClass.push(`            case ${p.cc}:`);
                channelClass.push(`                this.${p.niceName} = ${p.min} + (<f32>value / 127.0) * ${p.max - p.min};`);
                channelClass.push('                break;');
            }
            for (const p of voiceCCParams) {
                const range = p.max - p.min;
                const minStr = p.min === 0 ? '' : `${p.min} + `;
                const rangeStr = range === 1 ? '' : ` * ${range}`;
                channelClass.push(`            case ${p.cc}:`);
                channelClass.push(`                this.${p.niceName} = ${minStr}<f32>value / 127.0${rangeStr};`);
                channelClass.push('                break;');
            }
            channelClass.push('        }');
            channelClass.push('    }');
        }
        channelClass.push('}');
    }

    return {
        className: clsName,
        sourceFile,
        hasEffect,
        hasChannelClass,
        useNRPN,
        ccParams,
        uiParams,
        voice: {
            preamble: native.preamble,
            nativeClass: native.classSource,
            classCode: voiceClass,
            channelClass,
        },
        effect: {
            preamble: effectNative ? effectNative.preamble : '',
            nativeClass: effectNative ? effectNative.classSource : '',
        },
    };
}

// ---------------------------------------------------------------------------
// NRPN helpers
// ---------------------------------------------------------------------------

export function generateNRPNSetParam(lines, ccParams) {
    lines.push('    private _setParam(param: u16, value: u8): void {');
    lines.push('        switch (param) {');
    for (const p of ccParams) {
        if (p.nrpn === undefined) continue;
        const range = p.max - p.min;
        const minStr = p.min === 0 ? '' : `${p.min} + `;
        const rangeStr = range === 1 ? '' : ` * ${range}`;
        lines.push(`            case ${p.nrpn}: this.${p.niceName} = ${minStr}<f32>value / 127.0${rangeStr}; break;`);
    }
    lines.push('        }');
    lines.push('    }');
}

export function generateNRPNDefaults(lines, ccParams, channelIndex) {
    for (const p of ccParams) {
        if (p.nrpn === undefined) continue;
        const ccDefault = Math.round((p.init - p.min) / (p.max - p.min) * 127);
        const label = p.name.replace(/_/g, ' ');
        const msb = Math.floor(p.nrpn / 128);
        const lsb = p.nrpn % 128;
        lines.push(`    // ${label} (NRPN ${p.nrpn}, range: ${p.min}–${p.max}, default: ${p.init})`);
        lines.push(`    midichannels[${channelIndex}].controlchange(99, ${msb});`);
        lines.push(`    midichannels[${channelIndex}].controlchange(98, ${lsb});`);
        lines.push(`    midichannels[${channelIndex}].controlchange(6, ${ccDefault});`);
    }
}

// ---------------------------------------------------------------------------
// Shared assembly helpers
// ---------------------------------------------------------------------------

// The native preamble (math helpers) is identical for every DSP produced by
// the same compiler module — emit each distinct preamble once per file.
function pushPreambleOnce(out, seen, preamble) {
    if (!preamble || seen.has(preamble)) return;
    seen.add(preamble);
    out.push(preamble);
    out.push('');
}

function pushChannelDefaults(out, result, channelIndex) {
    if (result.useNRPN && (result.ccParams || []).length > 0) {
        out.push('');
        generateNRPNDefaults(out, result.ccParams, channelIndex);
    } else {
        const ccMapped = (result.ccParams || []).filter(p => p.cc !== undefined);
        if (ccMapped.length > 0) {
            out.push('');
            for (const p of ccMapped) {
                const ccDefault = Math.round((p.init - p.min) / (p.max - p.min) * 127);
                const label = p.name.replace(/_/g, ' ');
                out.push(`    // ${label} (CC ${p.cc}, range: ${p.min}–${p.max}, default: ${p.init})`);
                out.push(`    midichannels[${channelIndex}].controlchange(${p.cc}, ${ccDefault});`);
            }
        }
    }
}

function pushResultSections(out, result, seenPreambles) {
    pushPreambleOnce(out, seenPreambles, result.voice.preamble);
    out.push(result.voice.nativeClass);
    out.push('');
    out.push(...result.voice.classCode);
    out.push('');
    if (result.hasEffect) {
        pushPreambleOnce(out, seenPreambles, result.effect.preamble);
        out.push(result.effect.nativeClass);
        out.push('');
    }
    if (result.voice.channelClass.length > 0) {
        out.push(...result.voice.channelClass);
        out.push('');
    }
}

// ---------------------------------------------------------------------------
// Assembly: Single-file mode
// ---------------------------------------------------------------------------

export function assembleSingleFile(result, { forEditor = false, importDepth = 1 } = {}) {
    const out = [];

    out.push(`// Faust-generated ${result.className}`);
    out.push(`// Auto-transpiled from Faust DSP by faust2as.js (AS backend, native control/frame)`);
    out.push(`// Source: ${result.sourceFile}`);
    out.push('');

    // forEditor mode: the file lives in faust/<sub-path>/<name>.ts, so the
    // imports for ../mixes/globalimports etc. need one '../' per directory
    // segment above the assembly/ root (importDepth = number of segments).
    // Default importDepth=1 matches the historical placement faust/<name>.ts.
    if (forEditor) {
        const up = '../'.repeat(importDepth);
        out.push(`import { notefreq, midichannels, MidiChannel, MidiVoice } from '${up}mixes/globalimports';`);
        out.push(`import { SAMPLERATE } from '${up}environment';`);
    } else {
        out.push("import { MidiVoice, MidiChannel, midichannels } from '../midisynth';");
        out.push("import { notefreq } from '../../synth/note';");
        out.push("import { SAMPLERATE } from '../../environment';");
    }
    out.push('');

    const seenPreambles = new Set();
    pushResultSections(out, result, seenPreambles);

    // initializeMidiSynth()
    const channelClass = result.hasChannelClass ? `${result.className}Channel` : 'MidiChannel';
    out.push('export function initializeMidiSynth(): void {');
    out.push(`    midichannels[0] = new ${channelClass}(10, (channel: MidiChannel) => new ${result.className}(channel));`);
    out.push(`    midichannels[0].controlchange(7, 100);`);
    out.push(`    midichannels[0].controlchange(10, 64);`);
    out.push(`    midichannels[0].controlchange(91, 10);`);
    pushChannelDefaults(out, result, 0);
    out.push('}');
    out.push('');
    out.push('export function postprocess(): void {');
    out.push('}');
    out.push('');

    return out;
}

// ---------------------------------------------------------------------------
// Assembly: Bundle mode
// ---------------------------------------------------------------------------

export function assembleBundle(results, { forEditor = false } = {}) {
    const out = [];

    out.push('// Faust-generated synth bundle');
    out.push('// Auto-transpiled from Faust DSP by faust2as.js (AS backend, native control/frame)');
    out.push(`// Sources: ${results.map(r => r.sourceFile).join(', ')}`);
    out.push('');

    // Bundle output is consumed via the editor/mixes path: emit globalimports
    // even when forEditor is false, matching the original CLI's `forEditor || bundleMode`.
    out.push("import { notefreq, midichannels, MidiChannel, MidiVoice } from '../mixes/globalimports';");
    out.push("import { SAMPLERATE } from '../environment';");
    void forEditor;
    out.push('');

    const seenPreambles = new Set();
    for (const r of results) {
        pushResultSections(out, r, seenPreambles);
    }

    // initializeMidiSynth()
    out.push('export function initializeMidiSynth(): void {');
    results.forEach((r, i) => {
        const channelClass = r.hasChannelClass ? `${r.className}Channel` : 'MidiChannel';
        out.push(`    midichannels[${i}] = new ${channelClass}(10, (channel: MidiChannel) => new ${r.className}(channel));`);
        out.push(`    midichannels[${i}].controlchange(7, 100);`);
        out.push(`    midichannels[${i}].controlchange(10, 64);`);
        out.push(`    midichannels[${i}].controlchange(91, 10);`);
        pushChannelDefaults(out, r, i);
        if (i < results.length - 1) out.push('');
    });
    out.push('}');
    out.push('');
    out.push('export function postprocess(): void {');
    out.push('}');
    out.push('');

    return out;
}

// ---------------------------------------------------------------------------
// Standalone Effect class: stereo-in/stereo-out, public named params, and a
// generic `process(left, right): void` that writes to `this.signal`. A
// default singleton + `postprocess()` hook is also generated so the effect
// auto-mastering the outputline still works without any caller changes.
// ---------------------------------------------------------------------------

// transpileEffect({ asSource, clsName, sourceFile, importDepth })
//   asSource   — native AS output for a stereo effect
//                (compiled with `-cn <clsName>Dsp --ec --os`)
//   clsName    — class name for the generated mastering class
//   sourceFile — basename of the .dsp source; header comment only
//
// Returns the array of output lines (caller joins with '\n').
export function transpileEffect({ asSource, clsName, sourceFile, importDepth = 1 }) {
    const dspClassName = clsName + 'Dsp';
    const { uiParams, numInputs, numOutputs } = extractUIFromJSON(asSource);

    if (numInputs !== 2 || numOutputs !== 2) {
        throw new Error(`Mastering mode requires stereo I/O (2 in, 2 out). Got ${numInputs} in, ${numOutputs} out.`);
    }

    const native = splitNativeSource(asSource, dspClassName);

    const takenNames = new Set();
    for (const p of uiParams) {
        p.niceName = deriveNiceName(p, takenNames);
    }

    const out = [];
    out.push(`// Mastering effect: ${clsName}`);
    out.push(`// Auto-transpiled from Faust DSP by faust2asc.js (--effect, native control/frame)`);
    out.push(`// Source: ${sourceFile}`);
    out.push('');
    // importDepth = number of '..' segments above the assembly/ root
    // (default 1 matches faust/<name>.ts; 3 for faust/sub/dir/<name>.ts).
    const up = '../'.repeat(importDepth);
    out.push(`import { outputline, midichannels, StereoSignal } from '${up}mixes/globalimports';`);
    out.push(`import { SAMPLERATE } from '${up}environment';`);
    out.push('');

    out.push(native.preamble);
    out.push('');
    out.push(native.classSource);
    out.push('');

    out.push(`export class ${clsName} {`);
    // Public output bus — process(left, right) writes here.
    out.push('    signal: StereoSignal = new StereoSignal();');
    out.push(`    readonly dsp: ${dspClassName} = new ${dspClassName}();`);
    out.push('    private fin: StaticArray<f32> = new StaticArray<f32>(2);');
    out.push('    private fout: StaticArray<f32> = new StaticArray<f32>(2);');
    out.push('    private _paramsDirty: bool = true;');
    out.push('');
    for (const p of uiParams) {
        pushParamAccessor(out, p);
    }
    if (uiParams.length > 0) out.push('');

    out.push('    constructor() {');
    out.push('        this.dsp.init(<i32>SAMPLERATE);');
    out.push('    }');
    out.push('');

    out.push('    process(inL: f32, inR: f32): void {');
    out.push('        if (this._paramsDirty) {');
    out.push('            this._paramsDirty = false;');
    for (const p of uiParams) {
        out.push(`            this.dsp.${p.field} = this._${p.niceName};`);
    }
    out.push('            this.dsp.control();');
    out.push('        }');
    out.push('        this.fin[0] = inL;');
    out.push('        this.fin[1] = inR;');
    out.push('        this.dsp.frame(this.fin, this.fout);');
    out.push('        this.signal.left = this.fout[0];');
    out.push('        this.signal.right = this.fout[1];');
    out.push('    }');
    out.push('}');
    out.push('');

    // Backwards-compat: keep the synth engine's `initializeMidiSynth` /
    // `postprocess` hooks pointing at a singleton that mastering-processes
    // the outputline, so existing songs keep working. Custom signal-routing
    // callers should instantiate the class themselves and call
    // `master.process(left, right)` with their own inputs.
    const instanceVar = clsName.charAt(0).toLowerCase() + clsName.slice(1);
    out.push(`const ${instanceVar}: ${clsName} = new ${clsName}();`);
    out.push('');
    out.push('export function initializeMidiSynth(): void {');
    out.push('}');
    out.push('');
    out.push('export function postprocess(): void {');
    out.push(`    ${instanceVar}.process(outputline.left, outputline.right);`);
    out.push(`    outputline.left = ${instanceVar}.signal.left;`);
    out.push(`    outputline.right = ${instanceVar}.signal.right;`);
    out.push('}');
    out.push('');

    return out;
}
