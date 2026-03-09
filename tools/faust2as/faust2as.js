#!/usr/bin/env node
// faust2as.js — Faust DSP to AssemblyScript MidiVoice transpiler
//
// Usage: node faust2as.js <input.dsp> [--name ClassName] [--out output.ts]
//        node faust2as.js --bundle <dsp1> <dsp2> ... [--out output.ts]
//
// Runs `faust -lang asc` on the input .dsp file, then reshapes the generated
// AssemblyScript class into a MidiVoice subclass for the synth engine.

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: node faust2as.js <input.dsp> [--name ClassName] [--out output.ts]`);
    console.log(`       node faust2as.js --bundle <dsp1> <dsp2> ... [--out output.ts]`);
    console.log(`  --name    Class name for the generated MidiVoice (default: derived from filename)`);
    console.log(`  --out     Output .ts file path`);
    console.log(`  --bundle  Transpile multiple DSPs into a single bundle with initializeMidiSynth()`);
    process.exit(0);
}

const bundleMode = args.includes('--bundle');
const forEditor = args.includes('--for-editor');
let outputPath = null;
let className = null;
const dspFiles = [];

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--bundle') continue;
    if (args[i] === '--for-editor') continue;
    if (args[i] === '--name' && args[i + 1]) { className = args[++i]; continue; }
    if (args[i] === '--out' && args[i + 1]) { outputPath = args[++i]; continue; }
    dspFiles.push(args[i]);
}

if (dspFiles.length === 0) {
    console.error('No .dsp files specified');
    process.exit(1);
}

if (!bundleMode) {
    if (!className) {
        const base = path.basename(dspFiles[0], '.dsp');
        className = base.charAt(0).toUpperCase() + base.slice(1).replace(/MIDI$/i, '');
    }
    if (!outputPath) {
        outputPath = path.resolve(__dirname, '..', '..', 'wasmaudioworklet', 'synth1', 'assembly', 'midi', 'instruments', className.toLowerCase() + '.ts');
    }
} else {
    if (!outputPath) {
        outputPath = path.resolve(__dirname, 'synth_bundle.ts');
    }
}

// ---------------------------------------------------------------------------
// Detect faust binary with AS backend support
// ---------------------------------------------------------------------------

function findFaustBinary() {
    // Check for local build with AS backend first
    const localBuild = path.resolve(__dirname, '..', '..', 'resources', 'faust', 'build', 'bin', 'faust');
    if (fs.existsSync(localBuild)) {
        return localBuild;
    }
    // Fall back to system faust
    return 'faust';
}

const FAUST_BIN = findFaustBinary();

// ---------------------------------------------------------------------------
// Parse UI metadata from getJSON() embedded in AS output
// ---------------------------------------------------------------------------

function extractUIFromJSON(asSource) {
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
// Parse AS source: extract class fields, methods, subcontainers
// ---------------------------------------------------------------------------

function parseASSource(asSource, clsName) {
    // Extract class body from `export class ClassName { ... }`
    const classMatch = asSource.match(new RegExp(`export\\s+class\\s+${clsName}\\s*\\{([\\s\\S]*)\\}\\s*$`, 'm'));
    if (!classMatch) {
        console.error(`Could not find export class ${clsName} in AS output`);
        process.exit(1);
    }
    const classBody = classMatch[1];

    // Extract fields (instance and static)
    const fields = [];
    const staticFields = [];
    const fieldRegex = /^\s+(static\s+)?(\w+):\s*(f32|i32)(\[\])?\s*(?:=\s*([^;]+))?\s*;/gm;
    let m;
    while ((m = fieldRegex.exec(classBody)) !== null) {
        const isStatic = !!m[1];
        const field = {
            name: m[2],
            type: m[3],       // 'f32' or 'i32'
            isArray: !!m[4],   // has []
            initializer: m[5] ? m[5].trim() : null,
        };
        if (isStatic) {
            staticFields.push(field);
        } else {
            fields.push(field);
        }
    }

    // Extract method bodies by name
    function extractMethod(methodName) {
        // Match: methodName(...): returnType { ... }
        // Use brace counting for accurate extraction
        const methodStart = classBody.indexOf(methodName + '(');
        if (methodStart === -1) return '';
        const braceStart = classBody.indexOf('{', methodStart);
        if (braceStart === -1) return '';

        let depth = 0;
        let i = braceStart;
        for (; i < classBody.length; i++) {
            if (classBody[i] === '{') depth++;
            if (classBody[i] === '}') depth--;
            if (depth === 0) break;
        }
        return classBody.substring(braceStart + 1, i).trim();
    }

    const instanceConstants = extractMethod('instanceConstants');
    const instanceClear = extractMethod('instanceClear');
    const instanceResetUI = extractMethod('instanceResetUserInterface');
    const computeBody = extractMethod('compute');

    // Extract defaults from instanceResetUserInterface
    const defaults = {};
    const defaultRegex = /this\.(\w+)\s*=\s*([^;]+);/g;
    while ((m = defaultRegex.exec(instanceResetUI)) !== null) {
        defaults[m[1]] = m[2].trim();
    }

    // Extract subcontainer classes (SIG classes) and their free functions
    // These appear before the main export class
    const mainClassStart = asSource.indexOf(`export class ${clsName}`);
    const preClassSource = asSource.substring(0, mainClassStart);

    // Extract SIG class bodies
    const sigClasses = [];
    const sigClassRegex = /class\s+(\w+SIG\d+)\s*\{([\s\S]*?)\n\}/g;
    while ((m = sigClassRegex.exec(preClassSource)) !== null) {
        sigClasses.push({ name: m[1], body: m[2] });
    }

    // Extract free functions (newXxxSIG0, fillXxxSIG0, etc.)
    const freeFunctions = [];
    const freeFnRegex = /^function\s+(\w+)\s*\([^)]*\)\s*:\s*\w+\s*\{[\s\S]*?\n\}/gm;
    while ((m = freeFnRegex.exec(preClassSource)) !== null) {
        freeFunctions.push({ name: m[1], code: m[0] });
    }

    // Extract classInit body (for SIG table initialization)
    const classInit = extractMethod('static classInit');

    return {
        fields,
        staticFields,
        defaults,
        instanceConstants,
        instanceClear,
        computeBody,
        classInit,
        sigClasses,
        freeFunctions,
        preClassSource,
    };
}

// ---------------------------------------------------------------------------
// Parse compute body into structural sections
// ---------------------------------------------------------------------------

function parseComputeBody(computeBody) {
    const lines = computeBody.split('\n');
    const preLoopDecls = [];     // let output0, output1, fSlow/iSlow declarations
    const loopBodyLines = [];    // lines inside the for loop
    const delayShiftLines = [];  // delay shifts after output assignment
    let inLoop = false;
    let loopBraceDepth = 0;
    let afterOutputAssignment = false;

    // Track brace depth inside the main for loop so we can distinguish
    // the main loop's closing brace from inner for-loop braces (delay shifts)
    let innerForDepth = 0;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Output channel declarations (before loop)
        if (!inLoop && trimmed.match(/^let\s+output\d+:/)) continue;

        // fSlow/iSlow declarations (before loop)
        if (!inLoop && (trimmed.startsWith('let fSlow') || trimmed.startsWith('let iSlow'))) {
            preLoopDecls.push(trimmed);
            continue;
        }

        // Detect main loop start
        if (!inLoop && trimmed.match(/^for\s*\(/)) {
            inLoop = true;
            loopBraceDepth = 0;
            continue;
        }

        if (inLoop) {
            // Track brace depth to know when the main loop ends
            for (const ch of trimmed) {
                if (ch === '{') loopBraceDepth++;
                if (ch === '}') loopBraceDepth--;
            }

            // Skip the main loop's opening/closing braces
            if (loopBraceDepth < 0) break; // main loop closed

            // Output assignments
            if (trimmed.match(/^output[01]\[\w+\]\s*=/)) {
                afterOutputAssignment = true;
                if (trimmed.match(/^output0\[/)) {
                    loopBodyLines.push(trimmed);
                }
                continue;
            }

            if (afterOutputAssignment) {
                // In the delay shift section, inner for loops appear for array shifts
                // e.g. `for (let j0: i32 = 3; j0 > 0; ...) {`
                if (trimmed.match(/^for\s*\(/)) {
                    innerForDepth++;
                    delayShiftLines.push(trimmed);
                    continue;
                }
                if (trimmed === '}' && innerForDepth > 0) {
                    innerForDepth--;
                    delayShiftLines.push(trimmed);
                    continue;
                }
                if (trimmed === '{') continue; // skip standalone opening braces
                delayShiftLines.push(trimmed);
            } else {
                if (trimmed === '{' || trimmed === '}') continue;
                loopBodyLines.push(trimmed);
            }
        }
    }

    return { preLoopDecls, loopBodyLines, delayShiftLines };
}

// ---------------------------------------------------------------------------
// Reshape AS code for MidiVoice context
// ---------------------------------------------------------------------------

function reshapeASLine(line, clsName, globalFields, staticFieldMap) {
    let out = line;

    // Replace this.field → globalName for global UI params
    if (globalFields) {
        for (const [field, globalName] of globalFields) {
            out = out.replace(new RegExp(`this\\.${field}\\b`, 'g'), globalName);
        }
    }

    // Replace ClassName.staticField → shortened name
    if (staticFieldMap) {
        for (const [fullName, shortName] of staticFieldMap) {
            out = out.replace(new RegExp(`${clsName}\\.${fullName}\\b`, 'g'), shortName);
        }
    }

    // Replace <f32>(this.fSampleRate) or this.fSampleRate with SAMPLERATE
    out = out.replace(/<f32>\(this\.fSampleRate\)/g, 'SAMPLERATE');
    out = out.replace(/\bthis\.fSampleRate\b/g, 'SAMPLERATE');

    // Replace Array<T> with StaticArray<T>
    out = out.replace(/new Array<(f32|i32)>/g, 'new StaticArray<$1>');
    out = out.replace(/\b(f32|i32)\[\]/g, 'StaticArray<$1>');

    // Fix Faust AS backend type ambiguities:
    // 1. Inside <f32>(), bare integer literals like `100` are inferred as f32,
    //    causing f32*i32 errors. Add explicit <i32> cast.
    out = out.replace(/<f32>\((\d+) \* \(/g, '<f32>(<i32>$1 * (');
    // 2. Ternary with <i32> true branch and bare `0` false branch inside <f32>()
    //    context: the `0` is inferred as f32, causing type mismatch.
    out = out.replace(/\) : 0\)\)/g, ') : <i32>0))');

    return out;
}

function reshapeInstanceConstants(body, clsName, staticFieldMap) {
    const lines = body.split('\n');
    const result = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        // Skip fSampleRate assignment — we use SAMPLERATE
        if (trimmed.match(/this\.fSampleRate\s*=\s*sample_rate/)) continue;

        let out = reshapeASLine(trimmed, clsName, null, staticFieldMap);

        // Convert `this.fConstN = expr;` to keep `this.` prefix
        // Convert `let fConstN: f32 = expr;` → `const fConstN: f32 = expr;`
        out = out.replace(/^let\s+(fConst\w+)/, 'const $1');

        result.push(out);
    }
    return result;
}

function reshapeInstanceClear(body) {
    const lines = body.split('\n');
    const result = [];
    let inForLoop = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Detect for loop start
        if (trimmed.match(/^for\s*\(/)) {
            // Compact single-line form: for (...) { this.field[i] = 0; }
            let bodyLine = null;
            // Look ahead to find the loop body
            const idx = lines.indexOf(line);
            for (let j = idx + 1; j < lines.length; j++) {
                const inner = lines[j].trim();
                if (!inner) continue;
                if (inner === '}') break;
                bodyLine = inner;
                break;
            }
            if (bodyLine) {
                result.push(`${trimmed.replace(/\{$/, '').trim()} { ${bodyLine} }`);
                inForLoop = true;
            } else {
                result.push(trimmed);
            }
            continue;
        }

        // Skip lines already consumed by the compact form
        if (inForLoop && (trimmed === '}' || trimmed.match(/^this\.\w+\[\w+\]\s*=\s*/))) {
            if (trimmed === '}') inForLoop = false;
            continue;
        }

        inForLoop = false;
        result.push(trimmed);
    }
    return result;
}

// ---------------------------------------------------------------------------
// Reshape SIG subcontainers into flat init functions
// ---------------------------------------------------------------------------

function reshapeSIGInit(parsed, clsName, tablePrefix, sigPrefix) {
    const sigTables = [];
    const sigInit = [];

    // Extract static table declarations from the main class
    for (const sf of parsed.staticFields) {
        const shortName = tablePrefix + sf.name.replace(clsName, '');
        const asType = sf.type;
        if (sf.isArray && sf.initializer) {
            const sizeMatch = sf.initializer.match(/new\s+Array<\w+>\((\d+)\)/);
            if (sizeMatch) {
                sigTables.push(`const ${shortName}: StaticArray<${asType}> = new StaticArray<${asType}>(${sizeMatch[1]});`);
            }
        }
    }

    if (parsed.sigClasses.length === 0) return { sigTables, sigInit, waveDataGlobals: [] };

    sigInit.push(`let ${sigPrefix}_sig0_initialized: bool = false;`);
    sigInit.push('');
    sigInit.push(`function ${sigPrefix}_initSIG0Tables(): void {`);
    sigInit.push(`    if (${sigPrefix}_sig0_initialized) return;`);
    sigInit.push(`    ${sigPrefix}_sig0_initialized = true;`);

    // Extract wave data globals from pre-class source (e.g. let iDX7SIG0Wave0: i32[] = [...])
    const waveDataGlobals = [];
    const waveDataRegex = /^let\s+(\w+Wave\d+):\s*(f32|i32)\[\]\s*=\s*(\[[^\]]*\]);/gm;
    let wm;
    while ((wm = waveDataRegex.exec(parsed.preClassSource)) !== null) {
        const name = wm[1];
        const type = wm[2];
        const data = wm[3];
        waveDataGlobals.push(`const ${name}: StaticArray<${type}> = ${data};`);
    }

    for (const sigClass of parsed.sigClasses) {
        // Extract fields from SIG class (initializer is optional)
        const sigFieldRegex = /^\s+(\w+):\s*(f32|i32)(\[\])?\s*(?:=\s*([^;]+))?;/gm;
        let m;
        while ((m = sigFieldRegex.exec(sigClass.body)) !== null) {
            const fieldName = m[1];
            const type = m[2];
            const isArray = !!m[3];
            const init = m[4] ? m[4].trim() : null;
            if (fieldName === 'fSampleRate') continue;

            const localName = `sig0_${fieldName}`;
            if (isArray && init) {
                const sizeMatch = init.match(/new\s+Array<\w+>\((\d+)\)/);
                if (sizeMatch) {
                    sigInit.push(`    const ${localName}: StaticArray<${type}> = new StaticArray<${type}>(${sizeMatch[1]});`);
                }
            } else {
                sigInit.push(`    let ${localName}: ${type} = 0;`);
            }
        }

        // Extract fill method body
        const fillMatch = sigClass.body.match(/fill\w+\([^)]*\)\s*:\s*void\s*\{([\s\S]*?)\n\s{1,4}\}/);
        if (fillMatch) {
            const tableShortName = sigTables.length > 0
                ? sigTables[sigTables.length - 1].match(/const\s+(\w+):/)?.[1] || 'ftbl0SIG0'
                : 'ftbl0SIG0';

            const fillBody = fillMatch[1];
            const fillLines = fillBody.split('\n');
            let inFillLoop = false;
            for (const line of fillLines) {
                let trimmed = line.trim();
                if (!trimmed) continue;

                // Replace this.field → sig0_field
                trimmed = trimmed.replace(/this\.(\w+)/g, (_match, field) => {
                    if (field === 'fSampleRate') return 'SAMPLERATE';
                    return `sig0_${field}`;
                });

                // Replace table[iN] → shortTableName[i]
                trimmed = trimmed.replace(/table\[\w+\]/g, `${tableShortName}[i]`);

                // Replace for loop header
                const forMatch = trimmed.match(/^for\s*\(\s*let\s+\w+:\s*i32\s*=\s*0;\s*\w+\s*<\s*count;/);
                if (forMatch) {
                    trimmed = trimmed.replace(/for\s*\(\s*let\s+\w+:\s*i32\s*=\s*0;\s*\w+\s*<\s*count;/, `for (let i: i32 = 0; i < ${tableShortName}.length;`);
                    trimmed = trimmed.replace(/(\w+)\s*=\s*\1\s*\+\s*1\)/, 'i = i + 1)');
                    sigInit.push('    ' + trimmed);
                    inFillLoop = true;
                    continue;
                }

                if (inFillLoop) {
                    sigInit.push('        ' + trimmed);
                } else {
                    sigInit.push('    ' + trimmed);
                }
            }
            if (inFillLoop) {
                sigInit.push('    }');
            }
        }
    }

    sigInit.push('}');
    sigInit.push('');

    return { sigTables, sigInit, waveDataGlobals };
}

// ---------------------------------------------------------------------------
// Core transpilation pipeline
// ---------------------------------------------------------------------------

function transpileDsp(inputDsp, clsName, options = {}) {
    const {
        voiceTablePrefix = '',
        effectTablePrefix = '_eff_',
        voiceSigPrefix = '',
        effectSigPrefix = '_eff',
    } = options;

    // === Step 1: Run Faust compiler to get AS output ===

    const dspSource = fs.readFileSync(path.resolve(inputDsp), 'utf-8');
    const hasEffect = /^\s*effect\s*=/m.test(dspSource);

    const tmpASFile = `/tmp/faust2as_${clsName}.ts`;
    const faustCmd = `"${FAUST_BIN}" -lang asc -cn ${clsName} -I /opt/homebrew/share/faust "${path.resolve(inputDsp)}" -o "${tmpASFile}"`;
    console.log(`Running: ${faustCmd}`);
    try {
        execSync(faustCmd, { stdio: 'inherit' });
    } catch (e) {
        console.error('Faust compilation failed');
        process.exit(1);
    }

    const asSource = fs.readFileSync(tmpASFile, 'utf-8');

    let effectASSource = null;
    let tmpEffectASFile = null;
    const effectClassName = clsName + 'Effect';

    if (hasEffect) {
        tmpEffectASFile = `/tmp/faust2as_${effectClassName}.ts`;
        const effectFaustCmd = `"${FAUST_BIN}" -lang asc -cn ${effectClassName} -pn effect -I /opt/homebrew/share/faust "${path.resolve(inputDsp)}" -o "${tmpEffectASFile}"`;
        console.log(`Running: ${effectFaustCmd}`);
        try {
            execSync(effectFaustCmd, { stdio: 'inherit' });
        } catch (e) {
            console.error('Faust effect compilation failed');
            process.exit(1);
        }
        effectASSource = fs.readFileSync(tmpEffectASFile, 'utf-8');
        console.log(`Detected effect declaration — will generate ${clsName}Channel MidiChannel subclass`);
    }

    // === Step 2: Parse AS output ===

    const parsed = parseASSource(asSource, clsName);
    const { uiParams } = extractUIFromJSON(asSource);

    // Build static field name map: ClassName.ftbl0ClassNameSIG0 → ftbl0SIG0
    const staticFieldMap = new Map();
    for (const sf of parsed.staticFields) {
        const shortName = voiceTablePrefix + sf.name.replace(clsName, '');
        staticFieldMap.set(sf.name, shortName);
    }

    // === Step 3: Determine global UI parameters ===

    const freqParam = uiParams.find(p => p.name === 'freq' || p.address.endsWith('/freq'));
    const gateParam = uiParams.find(p => p.isButton && (p.name === 'gate' || p.address.endsWith('/gate')));
    const gainParam = uiParams.find(p => p.name === 'gain' || p.address.endsWith('/gain'));

    const excludedFields = new Set([freqParam, gateParam, gainParam].filter(Boolean).map(p => p.field));
    const ccParams = uiParams.filter(p => !p.isButton && !excludedFields.has(p.field));

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

    const globalPrefix = path.basename(inputDsp, '.dsp') + '_';
    const globalFields = new Map();
    for (const p of ccParams) {
        globalFields.set(p.field, globalPrefix + p.field);
    }

    // === Step 4: Generate SIG tables and init ===

    const { sigTables: voiceSigTables, sigInit: voiceSigInit, waveDataGlobals: voiceWaveData } = reshapeSIGInit(
        parsed, clsName, voiceTablePrefix, voiceSigPrefix
    );

    // === Step 5: Generate voice class ===

    const voiceClass = [];
    voiceClass.push(`export class ${clsName} extends MidiVoice {`);

    // Fields
    for (const field of parsed.fields) {
        if (field.name === 'fSampleRate') continue;
        if (globalFields.has(field.name)) continue;

        if (field.isArray) {
            const sizeMatch = field.initializer ? field.initializer.match(/new\s+Array<\w+>\((\d+)\)/) : null;
            const size = sizeMatch ? sizeMatch[1] : '0';
            voiceClass.push(`    private ${field.name}: StaticArray<${field.type}> = new StaticArray<${field.type}>(${size});`);
        } else if (field.name === 'IOTA0' || field.name.startsWith('IOTA')) {
            voiceClass.push(`    private ${field.name}: i32 = 0;`);
        } else if (parsed.defaults[field.name] !== undefined) {
            voiceClass.push(`    private ${field.name}: f32 = ${parsed.defaults[field.name]};`);
        } else if (field.initializer) {
            voiceClass.push(`    private ${field.name}: ${field.type} = ${field.initializer};`);
        } else {
            voiceClass.push(`    private ${field.name}: ${field.type};`);
        }
    }
    voiceClass.push('    private silentSamples: i32 = 0;');
    voiceClass.push('    private releaseSamples: i32 = 0;');
    voiceClass.push('');

    // Constructor
    voiceClass.push('    constructor(channel: MidiChannel) {');
    voiceClass.push('        super(channel);');
    if (parsed.sigClasses.length > 0) {
        voiceClass.push(`        ${voiceSigPrefix}_initSIG0Tables();`);
    }
    voiceClass.push('        this.instanceConstants();');
    voiceClass.push('        this.instanceClear();');
    voiceClass.push('    }');
    voiceClass.push('');

    // instanceConstants
    voiceClass.push('    private instanceConstants(): void {');
    const constLines = reshapeInstanceConstants(parsed.instanceConstants, clsName, staticFieldMap);
    for (const line of constLines) {
        voiceClass.push('        ' + line);
    }
    voiceClass.push('    }');
    voiceClass.push('');

    // instanceClear
    voiceClass.push('    private instanceClear(): void {');
    const clearLines = reshapeInstanceClear(parsed.instanceClear, clsName);
    for (const line of clearLines) {
        voiceClass.push('        ' + line);
    }
    voiceClass.push('    }');
    voiceClass.push('');

    // noteon / noteoff / isDone
    voiceClass.push('    noteon(note: u8, velocity: u8): void {');
    voiceClass.push('        super.noteon(note, velocity);');
    if (freqParam) {
        voiceClass.push(`        this.${freqParam.field} = notefreq(note);`);
    }
    if (gainParam) {
        voiceClass.push(`        this.${gainParam.field} = <f32>velocity / 127.0;`);
    }
    if (gateParam) {
        voiceClass.push(`        this.${gateParam.field} = 0.0;`);
        voiceClass.push('        this.nextframe();');
        voiceClass.push(`        this.${gateParam.field} = 1.0;`);
    }
    voiceClass.push('        this.silentSamples = 0;');
    voiceClass.push('        this.releaseSamples = 0;');
    voiceClass.push('    }');
    voiceClass.push('');

    voiceClass.push('    noteoff(): void {');
    if (gateParam) {
        voiceClass.push(`        this.${gateParam.field} = 0.0;`);
    }
    voiceClass.push('        this.silentSamples = 0;');
    voiceClass.push('        this.releaseSamples = 0;');
    voiceClass.push('    }');
    voiceClass.push('');

    voiceClass.push('    isDone(): boolean {');
    if (gateParam) {
        voiceClass.push(`        return this.${gateParam.field} == 0.0 && (this.silentSamples > 4410 || this.releaseSamples > 132300);`);
    } else {
        voiceClass.push('        return this.silentSamples > 4410 || this.releaseSamples > 132300;');
    }
    voiceClass.push('    }');
    voiceClass.push('');

    // nextframe
    voiceClass.push('    nextframe(): void {');

    const { preLoopDecls, loopBodyLines, delayShiftLines } = parseComputeBody(parsed.computeBody);

    // Pre-loop declarations (fSlow/iSlow)
    for (const decl of preLoopDecls) {
        let line = reshapeASLine(decl, clsName, globalFields, staticFieldMap);
        // Convert `let` to `const` for fSlow/iSlow
        line = line.replace(/^let\s+(fSlow|iSlow)/, 'const $1');
        voiceClass.push('        ' + line);
    }
    voiceClass.push('');

    // Loop body
    for (const bodyLine of loopBodyLines) {
        let line = reshapeASLine(bodyLine, clsName, globalFields, staticFieldMap);

        // Handle output assignment: output0[i0] = expr; → const output: f32 = expr;
        const outputMatch = line.match(/^output0\[\w+\]\s*=\s*(.*);$/);
        if (outputMatch) {
            voiceClass.push(`        const output: f32 = ${outputMatch[1]};`);
            continue;
        }

        // Convert `let` to `const` for local temp vars (fTemp, iTemp, fRec local assigns)
        line = line.replace(/^let\s+(fTemp|iTemp|fRec\d|iRec\d)/, 'const $1');

        voiceClass.push('        ' + line);
    }
    voiceClass.push('');

    // Delay shifts
    for (const shiftLine of delayShiftLines) {
        const line = reshapeASLine(shiftLine, clsName, globalFields, staticFieldMap);
        voiceClass.push('        ' + line);
    }

    voiceClass.push('');
    voiceClass.push('        if (Mathf.abs(output) < 0.001) {');
    voiceClass.push('            this.silentSamples++;');
    voiceClass.push('        } else {');
    voiceClass.push('            this.silentSamples = 0;');
    voiceClass.push('        }');
    if (gateParam) {
        voiceClass.push(`        if (this.${gateParam.field} == 0.0) this.releaseSamples++;`);
    }
    voiceClass.push('');
    voiceClass.push('        this.channel.signal.addMonoSignal(output, 0.5, 0.5);');
    voiceClass.push('    }');
    voiceClass.push('}');

    // === Step 6: Generate global variable declarations ===

    const voiceGlobals = [];
    for (const p of ccParams) {
        const globalName = globalFields.get(p.field);
        const def = parsed.defaults[p.field] || '0.0';
        const label = p.name.replace(/_/g, ' ');
        let mappingComment = '';
        if (useNRPN && p.nrpn !== undefined) {
            mappingComment = ` (NRPN ${p.nrpn})`;
        } else if (p.cc !== undefined) {
            mappingComment = ` (CC ${p.cc})`;
        }
        voiceGlobals.push(`// ${label}${mappingComment}`);
        voiceGlobals.push(`let ${globalName}: f32 = ${def};`);
    }

    if (ccParams.length > 0) {
        if (useNRPN) {
            console.log(`  ${ccParams.length} params mapped to NRPN (0–${ccParams.length - 1})`);
        } else {
            const mappedCount = ccParams.filter(p => p.cc !== undefined).length;
            console.log(`  ${mappedCount}/${ccParams.length} params mapped to MIDI CC (max CC ${MAX_SAFE_CC})`);
        }
    }

    // === Step 7: Generate effect code sections ===

    const effectWaveData = [];
    const effectSigTables = [];
    const effectSigInit = [];
    const effectHelpers = [];
    const effectClass = [];

    if (hasEffect && effectASSource) {
        const effParsed = parseASSource(effectASSource, effectClassName);
        const effUI = extractUIFromJSON(effectASSource);

        const effStaticFieldMap = new Map();
        for (const sf of effParsed.staticFields) {
            const shortName = effectTablePrefix + sf.name.replace(effectClassName, '');
            effStaticFieldMap.set(sf.name, shortName);
        }

        // Effect SIG tables
        const effSIG = reshapeSIGInit(effParsed, effectClassName, effectTablePrefix, effectSigPrefix);
        effectSigTables.push(...effSIG.sigTables);
        effectSigInit.push(...effSIG.sigInit);
        effectWaveData.push(...effSIG.waveDataGlobals);

        // Effect MidiChannel subclass
        const channelClassName = clsName + 'Channel';
        effectClass.push(`export class ${channelClassName} extends MidiChannel {`);

        for (const field of effParsed.fields) {
            if (field.name === 'fSampleRate') continue;

            if (field.isArray) {
                const sizeMatch = field.initializer ? field.initializer.match(/new\s+Array<\w+>\((\d+)\)/) : null;
                const size = sizeMatch ? sizeMatch[1] : '0';
                effectClass.push(`    private ${field.name}: StaticArray<${field.type}> = new StaticArray<${field.type}>(${size});`);
            } else if (field.name === 'IOTA0' || field.name.startsWith('IOTA')) {
                effectClass.push(`    private ${field.name}: i32 = 0;`);
            } else if (effParsed.defaults[field.name] !== undefined) {
                effectClass.push(`    private ${field.name}: f32 = ${effParsed.defaults[field.name]};`);
            } else if (field.initializer) {
                effectClass.push(`    private ${field.name}: ${field.type} = ${field.initializer};`);
            } else {
                effectClass.push(`    private ${field.name}: ${field.type};`);
            }
        }
        effectClass.push('');

        // Constructor
        effectClass.push('    constructor(numvoices: i32, factoryFunc: (channel: MidiChannel, voiceindex: i32) => MidiVoice) {');
        effectClass.push('        super(numvoices, factoryFunc);');
        if (effParsed.sigClasses.length > 0) {
            effectClass.push(`        ${effectSigPrefix}_initSIG0Tables();`);
        }
        effectClass.push('        this._effectInstanceConstants();');
        effectClass.push('        this._effectInstanceClear();');
        effectClass.push('    }');
        effectClass.push('');

        // _effectInstanceConstants
        effectClass.push('    private _effectInstanceConstants(): void {');
        const effConstLines = reshapeInstanceConstants(effParsed.instanceConstants, effectClassName, effStaticFieldMap);
        for (const line of effConstLines) {
            effectClass.push('        ' + line);
        }
        effectClass.push('    }');
        effectClass.push('');

        // _effectInstanceClear
        effectClass.push('    private _effectInstanceClear(): void {');
        const effClearLines = reshapeInstanceClear(effParsed.instanceClear, effectClassName);
        for (const line of effClearLines) {
            effectClass.push('        ' + line);
        }
        effectClass.push('    }');
        effectClass.push('');

        // preprocess()
        effectClass.push('    preprocess(): void {');
        const effCompute = parseComputeBody(effParsed.computeBody);

        for (const decl of effCompute.preLoopDecls) {
            let line = reshapeASLine(decl, effectClassName, null, effStaticFieldMap);
            line = line.replace(/^let\s+(fSlow|iSlow)/, 'const $1');
            effectClass.push('        ' + line);
        }
        if (effCompute.preLoopDecls.length > 0) effectClass.push('');

        for (const bodyLine of effCompute.loopBodyLines) {
            let line = reshapeASLine(bodyLine, effectClassName, null, effStaticFieldMap);

            // Handle input references
            line = line.replace(/input0\[\w+\]/g, 'this.signal.left');
            line = line.replace(/input1\[\w+\]/g, 'this.signal.right');

            // Handle output assignments
            const out0Match = line.match(/^output0\[\w+\]\s*=\s*(.*);$/);
            if (out0Match) {
                effectClass.push(`        this.signal.left = ${out0Match[1]};`);
                continue;
            }
            const out1Match = line.match(/^output1\[\w+\]\s*=\s*(.*);$/);
            if (out1Match) {
                effectClass.push(`        this.signal.right = ${out1Match[1]};`);
                continue;
            }

            line = line.replace(/^let\s+(fTemp|iTemp)/, 'const $1');
            effectClass.push('        ' + line);
        }
        effectClass.push('');

        for (const shiftLine of effCompute.delayShiftLines) {
            const line = reshapeASLine(shiftLine, effectClassName, null, effStaticFieldMap);
            effectClass.push('        ' + line);
        }

        effectClass.push('    }');

        // controlchange()
        const ccMappings = [];
        for (const param of effUI.uiParams) {
            if (param.midi && param.midi.midi) {
                const ccMatch = param.midi.midi.match(/ctrl\s+(\d+)/);
                if (ccMatch) {
                    ccMappings.push({
                        cc: parseInt(ccMatch[1]),
                        field: param.field,
                        min: param.min,
                        max: param.max,
                    });
                }
            }
        }
        const voiceCCParams = ccParams.filter(p => p.cc !== undefined);
        if (useNRPN && ccParams.length > 0) {
            effectClass.push('');
            effectClass.push('    private _nrpnMsb: u8 = 127;');
            effectClass.push('    private _nrpnLsb: u8 = 127;');
            effectClass.push('');
            effectClass.push('    controlchange(controller: u8, value: u8): void {');
            effectClass.push('        super.controlchange(controller, value);');
            effectClass.push('        switch (controller) {');
            for (const cc of ccMappings) {
                effectClass.push(`            case ${cc.cc}:`);
                effectClass.push(`                this.${cc.field} = ${cc.min} + (<f32>value / 127.0) * ${cc.max - cc.min};`);
                effectClass.push('                break;');
            }
            effectClass.push('            case 99: this._nrpnMsb = value; break;');
            effectClass.push('            case 98: this._nrpnLsb = value; break;');
            effectClass.push('            case 6:');
            effectClass.push('                this._setParam(<u16>this._nrpnMsb * 128 + <u16>this._nrpnLsb, value);');
            effectClass.push('                break;');
            effectClass.push('        }');
            effectClass.push('    }');
            effectClass.push('');
            generateNRPNSetParam(effectClass, ccParams, globalFields);
        } else if (ccMappings.length > 0 || voiceCCParams.length > 0) {
            effectClass.push('');
            effectClass.push('    controlchange(controller: u8, value: u8): void {');
            effectClass.push('        super.controlchange(controller, value);');
            effectClass.push('        switch (controller) {');
            for (const cc of ccMappings) {
                effectClass.push(`            case ${cc.cc}:`);
                effectClass.push(`                this.${cc.field} = ${cc.min} + (<f32>value / 127.0) * ${cc.max - cc.min};`);
                effectClass.push('                break;');
            }
            for (const p of voiceCCParams) {
                const globalName = globalFields.get(p.field);
                const range = p.max - p.min;
                const minStr = p.min === 0 ? '' : `${p.min} + `;
                const rangeStr = range === 1 ? '' : ` * ${range}`;
                effectClass.push(`            case ${p.cc}:`);
                effectClass.push(`                ${globalName} = ${minStr}<f32>value / 127.0${rangeStr};`);
                effectClass.push('                break;');
            }
            effectClass.push('        }');
            effectClass.push('    }');
        }

        effectClass.push('}');
    }

    // === Step 8: Generate channel class for voice CC params (no-effect case) ===

    const voiceChannelClass = [];
    const voiceCCParams = ccParams.filter(p => p.cc !== undefined);
    if (!hasEffect && (voiceCCParams.length > 0 || (useNRPN && ccParams.length > 0))) {
        const channelClassName = clsName + 'Channel';
        if (useNRPN) {
            voiceChannelClass.push(`export class ${channelClassName} extends MidiChannel {`);
            voiceChannelClass.push('    private _nrpnMsb: u8 = 127;');
            voiceChannelClass.push('    private _nrpnLsb: u8 = 127;');
            voiceChannelClass.push('');
            voiceChannelClass.push('    controlchange(controller: u8, value: u8): void {');
            voiceChannelClass.push('        super.controlchange(controller, value);');
            voiceChannelClass.push('        switch (controller) {');
            voiceChannelClass.push('            case 99: this._nrpnMsb = value; break;');
            voiceChannelClass.push('            case 98: this._nrpnLsb = value; break;');
            voiceChannelClass.push('            case 6:');
            voiceChannelClass.push('                this._setParam(<u16>this._nrpnMsb * 128 + <u16>this._nrpnLsb, value);');
            voiceChannelClass.push('                break;');
            voiceChannelClass.push('        }');
            voiceChannelClass.push('    }');
            voiceChannelClass.push('');
            generateNRPNSetParam(voiceChannelClass, ccParams, globalFields);
            voiceChannelClass.push('}');
        } else {
            voiceChannelClass.push(`export class ${channelClassName} extends MidiChannel {`);
            voiceChannelClass.push('    controlchange(controller: u8, value: u8): void {');
            voiceChannelClass.push('        super.controlchange(controller, value);');
            voiceChannelClass.push('        switch (controller) {');
            for (const p of voiceCCParams) {
                const globalName = globalFields.get(p.field);
                const range = p.max - p.min;
                const minStr = p.min === 0 ? '' : `${p.min} + `;
                const rangeStr = range === 1 ? '' : ` * ${range}`;
                voiceChannelClass.push(`            case ${p.cc}:`);
                voiceChannelClass.push(`                ${globalName} = ${minStr}<f32>value / 127.0${rangeStr};`);
                voiceChannelClass.push('                break;');
            }
            voiceChannelClass.push('        }');
            voiceChannelClass.push('    }');
            voiceChannelClass.push('}');
        }
    }

    // Clean up temp files
    try { fs.unlinkSync(tmpASFile); } catch (e) {}
    if (tmpEffectASFile) {
        try { fs.unlinkSync(tmpEffectASFile); } catch (e) {}
    }

    const hasChannelClass = hasEffect || voiceCCParams.length > 0 || (useNRPN && ccParams.length > 0);

    return {
        className: clsName,
        sourceFile: path.basename(inputDsp),
        hasEffect,
        hasChannelClass,
        useNRPN,
        ccParams,
        globalPrefix,
        externalFunctions: new Map(),
        uiParams,
        voice: {
            globals: voiceGlobals,
            waveData: voiceWaveData,
            sigTables: voiceSigTables,
            sigInit: voiceSigInit,
            helpers: [],
            classCode: voiceClass,
            channelClass: voiceChannelClass,
        },
        effect: {
            waveData: effectWaveData,
            sigTables: effectSigTables,
            sigInit: effectSigInit,
            helpers: effectHelpers,
            classCode: effectClass,
        },
    };
}

// ---------------------------------------------------------------------------
// NRPN helpers
// ---------------------------------------------------------------------------

function generateNRPNSetParam(lines, ccParams, globalFields) {
    lines.push('    private _setParam(param: u16, value: u8): void {');
    lines.push('        switch (param) {');
    for (const p of ccParams) {
        if (p.nrpn === undefined) continue;
        const globalName = globalFields.get(p.field);
        const range = p.max - p.min;
        const minStr = p.min === 0 ? '' : `${p.min} + `;
        const rangeStr = range === 1 ? '' : ` * ${range}`;
        lines.push(`            case ${p.nrpn}: ${globalName} = ${minStr}<f32>value / 127.0${rangeStr}; break;`);
    }
    lines.push('        }');
    lines.push('    }');
}

function generateNRPNDefaults(lines, ccParams, channelIndex) {
    for (const p of ccParams) {
        if (p.nrpn === undefined) continue;
        const ccDefault = Math.round((p.init - p.min) / (p.max - p.min) * 127);
        const label = p.name.replace(/_/g, ' ');
        const msb = Math.floor(p.nrpn / 128);
        const lsb = p.nrpn % 128;
        lines.push(`    // ${label} (NRPN ${p.nrpn}, range: ${p.min}\u2013${p.max}, default: ${p.init})`);
        lines.push(`    midichannels[${channelIndex}].controlchange(99, ${msb});`);
        lines.push(`    midichannels[${channelIndex}].controlchange(98, ${lsb});`);
        lines.push(`    midichannels[${channelIndex}].controlchange(6, ${ccDefault});`);
    }
}

// ---------------------------------------------------------------------------
// Assembly: Single-file mode
// ---------------------------------------------------------------------------

function assembleSingleFile(result) {
    const out = [];

    out.push(`// Faust-generated ${result.className}`);
    out.push(`// Auto-transpiled from Faust DSP by faust2as.js (AS backend)`);
    out.push(`// Source: ${result.sourceFile}`);
    out.push('');

    if (forEditor) {
        out.push("import { notefreq, midichannels, MidiChannel, MidiVoice } from '../mixes/globalimports';");
        out.push("import { SAMPLERATE } from '../environment';");
    } else {
        out.push("import { MidiVoice, MidiChannel, midichannels } from '../midisynth';");
        out.push("import { notefreq } from '../../synth/note';");
        out.push("import { SAMPLERATE } from '../../environment';");
    }
    out.push('');

    // External lookup table functions (from ffunction headers)
    if (result.externalFunctions.size > 0) {
        const emittedTables = new Set();
        for (const [fnName, info] of result.externalFunctions) {
            const lines = generateLookupTableAS(fnName, info, '');
            for (const line of lines) {
                if (line.startsWith('const ') && emittedTables.has(line)) continue;
                if (line.startsWith('const ')) emittedTables.add(line);
                out.push(line);
            }
        }
        out.push('');
    }

    // Voice wave data
    out.push(...result.voice.waveData);
    if (result.voice.waveData.length > 0) out.push('');

    // Voice SIG tables + init
    out.push(...result.voice.sigTables);
    out.push(...result.voice.sigInit);

    // Voice helper functions
    for (const h of result.voice.helpers) out.push(h.code);
    if (result.voice.helpers.length > 0) out.push('');

    // Global variables for shared DSP parameters
    if (result.voice.globals.length > 0) {
        out.push(...result.voice.globals);
        out.push('');
    }

    // Voice class
    out.push(...result.voice.classCode);
    out.push('');

    // Voice channel class (no-effect case with CC params)
    if (result.voice.channelClass.length > 0) {
        out.push(...result.voice.channelClass);
        out.push('');
    }

    // Effect sections
    if (result.hasEffect) {
        out.push(...result.effect.waveData);
        if (result.effect.waveData.length > 0) out.push('');

        out.push(...result.effect.sigTables);
        out.push(...result.effect.sigInit);

        const voiceHelperNames = new Set(result.voice.helpers.map(h => h.fnName));
        const uniqueEffectHelpers = result.effect.helpers.filter(h => !voiceHelperNames.has(h.fnName));
        for (const h of uniqueEffectHelpers) out.push(h.code);
        if (uniqueEffectHelpers.length > 0) out.push('');

        out.push(...result.effect.classCode);
        out.push('');
    }

    // initializeMidiSynth()
    const channelClass = result.hasChannelClass ? `${result.className}Channel` : 'MidiChannel';
    out.push('export function initializeMidiSynth(): void {');
    out.push(`    midichannels[0] = new ${channelClass}(10, (channel: MidiChannel) => new ${result.className}(channel));`);
    out.push(`    midichannels[0].controlchange(7, 100);`);
    out.push(`    midichannels[0].controlchange(10, 64);`);
    out.push(`    midichannels[0].controlchange(91, 10);`);

    if (result.useNRPN && (result.ccParams || []).length > 0) {
        out.push('');
        generateNRPNDefaults(out, result.ccParams, 0);
    } else {
        const ccMapped = (result.ccParams || []).filter(p => p.cc !== undefined);
        if (ccMapped.length > 0) {
            out.push('');
            for (const p of ccMapped) {
                const ccDefault = Math.round((p.init - p.min) / (p.max - p.min) * 127);
                const label = p.name.replace(/_/g, ' ');
                out.push(`    // ${label} (CC ${p.cc}, range: ${p.min}\u2013${p.max}, default: ${p.init})`);
                out.push(`    midichannels[0].controlchange(${p.cc}, ${ccDefault});`);
            }
        }
    }

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

function assembleBundle(results) {
    const out = [];

    out.push('// Faust-generated synth bundle');
    out.push('// Auto-transpiled from Faust DSP by faust2as.js (AS backend)');
    out.push(`// Sources: ${results.map(r => r.sourceFile).join(', ')}`);
    out.push('');

    if (forEditor) {
        out.push("import { notefreq, midichannels, MidiChannel, MidiVoice } from '../mixes/globalimports';");
        out.push("import { SAMPLERATE } from '../environment';");
    } else {
        out.push("import { MidiVoice, MidiChannel, midichannels } from '../midisynth';");
        out.push("import { notefreq } from '../../synth/note';");
        out.push("import { SAMPLERATE } from '../../environment';");
    }
    out.push('');

    // Deduplicated helper functions
    const allHelpers = new Map();
    for (const r of results) {
        for (const h of [...r.voice.helpers, ...r.effect.helpers]) {
            if (!allHelpers.has(h.fnName)) allHelpers.set(h.fnName, h.code);
        }
    }
    for (const code of allHelpers.values()) out.push(code);
    if (allHelpers.size > 0) out.push('');

    // Per-DSP: globals, wave data, SIG tables, SIG init, classes
    for (const r of results) {
        if (r.voice.globals.length > 0) {
            out.push(...r.voice.globals);
            out.push('');
        }

        out.push(...r.voice.waveData);
        if (r.voice.waveData.length > 0) out.push('');

        out.push(...r.voice.sigTables);
        out.push(...r.voice.sigInit);

        out.push(...r.voice.classCode);
        out.push('');

        if (r.voice.channelClass.length > 0) {
            out.push(...r.voice.channelClass);
            out.push('');
        }

        if (r.hasEffect) {
            out.push(...r.effect.waveData);
            if (r.effect.waveData.length > 0) out.push('');

            out.push(...r.effect.sigTables);
            out.push(...r.effect.sigInit);

            out.push(...r.effect.classCode);
            out.push('');
        }
    }

    // initializeMidiSynth()
    out.push('export function initializeMidiSynth(): void {');
    results.forEach((r, i) => {
        const channelClass = r.hasChannelClass ? `${r.className}Channel` : 'MidiChannel';
        out.push(`    midichannels[${i}] = new ${channelClass}(10, (channel: MidiChannel) => new ${r.className}(channel));`);
        out.push(`    midichannels[${i}].controlchange(7, 100);`);
        out.push(`    midichannels[${i}].controlchange(10, 64);`);
        out.push(`    midichannels[${i}].controlchange(91, 10);`);

        if (r.useNRPN && (r.ccParams || []).length > 0) {
            out.push('');
            generateNRPNDefaults(out, r.ccParams, i);
        } else {
            const ccMapped = (r.ccParams || []).filter(p => p.cc !== undefined);
            if (ccMapped.length > 0) {
                out.push('');
                for (const p of ccMapped) {
                    const ccDefault = Math.round((p.init - p.min) / (p.max - p.min) * 127);
                    const label = p.name.replace(/_/g, ' ');
                    out.push(`    // ${label} (CC ${p.cc}, range: ${p.min}\u2013${p.max}, default: ${p.init})`);
                    out.push(`    midichannels[${i}].controlchange(${p.cc}, ${ccDefault});`);
                }
            }
        }

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
// Main: Execute
// ---------------------------------------------------------------------------

let output;
if (bundleMode) {
    const results = dspFiles.map(dsp => {
        const base = path.basename(dsp, '.dsp');
        const name = base.charAt(0).toUpperCase() + base.slice(1).replace(/MIDI$/i, '');
        return transpileDsp(dsp, name, {
            voiceTablePrefix: name + '_',
            voiceWavePrefix: name,
            effectTablePrefix: name + '_eff_',
            effectWavePrefix: name + '_eff',
            voiceSigPrefix: '_' + name,
            effectSigPrefix: '_' + name + '_eff',
        });
    });
    output = assembleBundle(results);
} else {
    const result = transpileDsp(dspFiles[0], className, {});
    output = assembleSingleFile(result);
}

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, output.join('\n'));
console.log(`Generated: ${outputPath}`);
