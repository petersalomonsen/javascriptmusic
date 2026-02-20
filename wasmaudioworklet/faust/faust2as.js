#!/usr/bin/env node
// faust2as.js — Faust DSP to AssemblyScript MidiVoice transpiler
//
// Usage: node faust2as.js <input.dsp> [--name ClassName] [--out output.ts]
//
// Runs `faust -lang c` on the input .dsp file, then parses the generated C
// and emits an AssemblyScript MidiVoice subclass.

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
    console.log(`  --name  Class name for the generated MidiVoice (default: derived from filename)`);
    console.log(`  --out   Output .ts file path (default: wasmaudioworklet/synth1/assembly/midi/instruments/<name>.ts)`);
    process.exit(0);
}

const inputDsp = args[0];
let className = null;
let outputPath = null;

for (let i = 1; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) { className = args[++i]; }
    else if (args[i] === '--out' && args[i + 1]) { outputPath = args[++i]; }
}

if (!className) {
    const base = path.basename(inputDsp, '.dsp');
    className = base.charAt(0).toUpperCase() + base.slice(1).replace(/MIDI$/i, '');
}

if (!outputPath) {
    const scriptDir = __dirname;
    outputPath = path.resolve(scriptDir, '..', 'synth1', 'assembly', 'midi', 'instruments', className.toLowerCase() + '.ts');
}

// ---------------------------------------------------------------------------
// Step 1: Run Faust compiler to get C output
// ---------------------------------------------------------------------------

const tmpCFile = `/tmp/faust2as_${className}.c`;
const faustCmd = `faust -lang c -cn ${className} "${path.resolve(inputDsp)}" -o "${tmpCFile}"`;
console.log(`Running: ${faustCmd}`);
try {
    execSync(faustCmd, { stdio: 'inherit' });
} catch (e) {
    console.error('Faust compilation failed');
    process.exit(1);
}

const cSource = fs.readFileSync(tmpCFile, 'utf-8');

// ---------------------------------------------------------------------------
// Step 2: Parse C output
// ---------------------------------------------------------------------------

// --- 2a: Extract helper functions (e.g. faustpower2_f) ---
const helperFnRegex = new RegExp(`static\\s+float\\s+${className}_(\\w+)\\s*\\(([^)]*)\\)\\s*\\{([^}]+)\\}`, 'g');
const helperFns = [];
let m;
while ((m = helperFnRegex.exec(cSource)) !== null) {
    const fnName = m[1];
    const params = m[2];
    const body = m[3].trim();
    helperFns.push({ fnName, params, body });
}

// --- 2b: Extract SIG0 structs and fill functions ---
const sig0Structs = [];
const sig0Tables = [];
const sig0Fills = [];

// Find SIG0 struct definitions
const sig0StructRegex = new RegExp(`typedef\\s+struct\\s*\\{([^}]+)\\}\\s*${className}SIG(\\d+)\\s*;`, 'g');
while ((m = sig0StructRegex.exec(cSource)) !== null) {
    const fields = m[1];
    const sigIndex = m[2];
    sig0Structs.push({ sigIndex, fields });
}

// Find static table declarations: static float ftbl0ClassNameSIG0[65536];
const sig0TableRegex = new RegExp(`static\\s+float\\s+(ftbl\\d+${className}SIG\\d+)\\s*\\[(\\d+)\\]`, 'g');
while ((m = sig0TableRegex.exec(cSource)) !== null) {
    sig0Tables.push({ name: m[1], size: parseInt(m[2]) });
}

// Find fill functions
const sig0FillRegex = new RegExp(
    `static\\s+void\\s+fill${className}SIG(\\d+)\\s*\\(${className}SIG\\d+\\*\\s*dsp,\\s*int\\s+count,\\s*float\\*\\s+table\\)\\s*\\{([\\s\\S]*?)^\\}`,
    'gm'
);
while ((m = sig0FillRegex.exec(cSource)) !== null) {
    sig0Fills.push({ sigIndex: m[1], body: m[2] });
}

// Find instanceInit for SIG0 (zeroes the temp struct fields)
const sig0InitRegex = new RegExp(
    `static\\s+void\\s+instanceInit${className}SIG(\\d+)\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`,
    'gm'
);
const sig0Inits = [];
while ((m = sig0InitRegex.exec(cSource)) !== null) {
    sig0Inits.push({ sigIndex: m[1], body: m[2] });
}

// --- 2c: Extract main struct fields ---
const structRegex = new RegExp(`typedef\\s+struct\\s*\\{([^{}]*)\\}\\s*${className}\\s*;`);
const structMatch = cSource.match(structRegex);
if (!structMatch) {
    console.error(`Could not find main struct for ${className}`);
    process.exit(1);
}

const structBody = structMatch[1];
const fields = [];
const fieldRegex = /\s*(FAUSTFLOAT|float|int)\s+(\w+)(?:\[(\d+)\])?\s*;/g;
while ((m = fieldRegex.exec(structBody)) !== null) {
    const type = m[1];
    const name = m[2];
    const arraySize = m[3] ? parseInt(m[3]) : null;
    if (name === 'fSampleRate') continue; // skip sample rate field
    fields.push({ type, name, arraySize });
}

// --- 2d: Extract instanceResetUserInterface (default values) ---
const resetUIRegex = new RegExp(
    `void\\s+instanceResetUserInterface${className}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`,
    'gm'
);
const resetUIMatch = resetUIRegex.exec(cSource);
const defaults = {};
if (resetUIMatch) {
    const defaultRegex = /dsp->(\w+)\s*=\s*\(FAUSTFLOAT\)([\d.eE+-]+f?)/g;
    while ((m = defaultRegex.exec(resetUIMatch[1])) !== null) {
        let val = m[2].replace(/f$/, '');
        // Normalize "0.80000000000000004" to "0.8"
        val = parseFloat(val).toString();
        defaults[m[1]] = val;
    }
}

// --- 2e: Extract instanceClear ---
const clearRegex = new RegExp(
    `void\\s+instanceClear${className}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`,
    'gm'
);
const clearMatch = clearRegex.exec(cSource);
const clearBody = clearMatch ? clearMatch[1] : '';

// --- 2f: Extract instanceConstants ---
const constRegex = new RegExp(
    `void\\s+instanceConstants${className}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`,
    'gm'
);
const constMatch = constRegex.exec(cSource);
const constBody = constMatch ? constMatch[1] : '';

// --- 2g: Extract buildUserInterface ---
const buildUIRegex = new RegExp(
    `void\\s+buildUserInterface${className}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`,
    'gm'
);
const buildUIMatch = buildUIRegex.exec(cSource);
const buildUIBody = buildUIMatch ? buildUIMatch[1] : '';

// Parse UI declarations to map parameter names to fields
// We need to track declare() calls to find MIDI metadata
const uiParams = [];

// Parse declare() calls for MIDI metadata: declare(ui, &dsp->field, "midi", "ctrl 64")
const declareRegex = /ui_interface->declare\([^,]+,\s*&dsp->(\w+),\s*"(\w+)",\s*"([^"]+)"\)/g;
const midiMeta = {}; // field -> { midi: "ctrl 64", ... }
while ((m = declareRegex.exec(buildUIBody)) !== null) {
    const field = m[1];
    const key = m[2];
    const value = m[3];
    if (!midiMeta[field]) midiMeta[field] = {};
    midiMeta[field][key] = value;
}

// Parse addHorizontalSlider/addVerticalSlider/addButton
const sliderRegex = /ui_interface->add(?:Horizontal|Vertical)Slider\([^,]+,\s*"(\w+)",\s*&dsp->(\w+),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?)\)/g;
while ((m = sliderRegex.exec(buildUIBody)) !== null) {
    uiParams.push({
        name: m[1],
        field: m[2],
        init: parseFloat(m[3]),
        min: parseFloat(m[4]),
        max: parseFloat(m[5]),
        step: parseFloat(m[6]),
        midi: midiMeta[m[2]] || {}
    });
}
const buttonRegex = /ui_interface->addButton\([^,]+,\s*"(\w+)",\s*&dsp->(\w+)\)/g;
while ((m = buttonRegex.exec(buildUIBody)) !== null) {
    uiParams.push({
        name: m[1],
        field: m[2],
        init: 0, min: 0, max: 1, step: 1,
        isButton: true,
        midi: midiMeta[m[2]] || {}
    });
}

// --- 2h: Extract compute body ---
const computeRegex = new RegExp(
    `void\\s+compute${className}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}\\s*(?:#ifdef|$)`,
    'gm'
);
const computeMatch = computeRegex.exec(cSource);
if (!computeMatch) {
    console.error(`Could not find compute function for ${className}`);
    process.exit(1);
}
const computeBody = computeMatch[1];

// Split compute into: output declarations, fSlow declarations, and loop body
const computeLines = computeBody.split('\n');

const fSlowDecls = [];
const loopBodyLines = [];
const delayShiftLines = [];
let inLoop = false;
let loopBraceDepth = 0;
let foundOutputDecl = false;
let afterOutputAssignment = false;

for (let i = 0; i < computeLines.length; i++) {
    const line = computeLines[i];
    const trimmed = line.trim();

    // Skip output pointer declarations
    if (trimmed.startsWith('FAUSTFLOAT* output')) continue;

    // fSlow declarations (before the loop)
    if (!inLoop && (trimmed.startsWith('float fSlow') || trimmed.startsWith('int iSlow'))) {
        fSlowDecls.push(trimmed);
        continue;
    }

    // Detect loop start
    if (!inLoop && trimmed.match(/for\s*\(\w+\s*=\s*0/)) {
        inLoop = true;
        loopBraceDepth = 0;
        // Skip the for line itself and its opening brace
        continue;
    }

    if (inLoop) {
        // Track brace depth within the loop
        for (const ch of trimmed) {
            if (ch === '{') loopBraceDepth++;
            if (ch === '}') loopBraceDepth--;
        }

        // Skip empty lines, comments, standalone braces, and loop-only constructs
        if (trimmed === '' || trimmed === '{' || trimmed === '}') continue;
        if (trimmed.startsWith('/*') || trimmed.startsWith('//')) continue;
        if (trimmed.match(/^int\s+[ij]\d+\s*;$/)) continue; // loop variable declaration
        if (trimmed.match(/^for\s*\(\s*[ij]\d+\s*=\s*0/)) continue; // inner for(...) line

        // output assignment
        if (trimmed.match(/output[01]\[/)) {
            afterOutputAssignment = true;
            if (trimmed.match(/output0\[/)) {
                loopBodyLines.push(trimmed);
            }
            // Skip output1 lines
            continue;
        }

        if (afterOutputAssignment) {
            delayShiftLines.push(trimmed);
        } else {
            loopBodyLines.push(trimmed);
        }
    }
}

// Also detect inner C99 loops in the delay shifts (for arrays > 3 elements)
// These look like: for (j0 = 3; (j0 > 0); j0 = (j0 - 1)) { dsp->fRec33[j0] = dsp->fRec33[(j0 - 1)]; }
// We'll handle them during transpilation

// ---------------------------------------------------------------------------
// Step 3: Transpile C expressions to AssemblyScript
// ---------------------------------------------------------------------------

function transpileExpr(expr) {
    let out = expr;

    // Remove trailing semicolon for processing (we'll add it back)
    const hasSemicolon = out.endsWith(';');
    if (hasSemicolon) out = out.slice(0, -1);

    // dsp-> → this.
    out = out.replace(/dsp->/g, 'this.');

    // (float)this.fSampleRate → SAMPLERATE
    out = out.replace(/\(float\)\s*this\.fSampleRate/g, 'SAMPLERATE');

    // ClassName_faustpower2_f → faustpower2_f (etc.)
    for (const h of helperFns) {
        out = out.replace(new RegExp(`${className}_${h.fnName}`, 'g'), h.fnName);
    }

    // SIG0 static table names: ftbl0ClassNameSIG0 → ftbl0SIG0
    for (const table of sig0Tables) {
        const shortName = table.name.replace(className, '');
        if (shortName !== table.name) {
            out = out.replace(new RegExp(table.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), shortName);
        }
    }

    // Math functions: fminf(a,b) → Mathf.min(a,b), etc.
    const mathMap = {
        'fminf': 'Mathf.min', 'fmaxf': 'Mathf.max', 'floorf': 'Mathf.floor',
        'sinf': 'Mathf.sin', 'cosf': 'Mathf.cos', 'tanf': 'Mathf.tan',
        'expf': 'Mathf.exp', 'logf': 'Mathf.log', 'log10f': 'Mathf.log10',
        'powf': 'Mathf.pow', 'sqrtf': 'Mathf.sqrt', 'fabsf': 'Mathf.abs',
        'rintf': 'Mathf.round', 'ceilf': 'Mathf.ceil',
        'atanf': 'Mathf.atan', 'atan2f': 'Mathf.atan2',
        'asinf': 'Mathf.asin', 'acosf': 'Mathf.acos',
    };
    for (const [cFn, asFn] of Object.entries(mathMap)) {
        out = out.replace(new RegExp(`\\b${cFn}\\(`, 'g'), `${asFn}(`);
    }

    // Boolean-to-int wrapping: MUST happen BEFORE type cast replacement
    // so that (int) and (float) casts are not confused with < > comparisons.
    // In C, comparisons return int (0 or 1). In AS, they return bool.
    // When comparisons are used in arithmetic (bitwise OR, multiplication, addition),
    // they need explicit ? 1 : 0 wrapping.
    // Pass 1: Simple comparisons where both sides have no nested parens
    out = out.replace(/\(([^()]+?)\s*(==|!=|<=|>=|<|>)\s*([^()]+?)\)/g,
        (match, lhs, op, rhs) => {
            if (lhs.trim() === 'int' || lhs.trim() === 'float') return match;
            return `(${lhs.trim()} ${op} ${rhs.trim()} ? 1 : 0)`;
        });
    // Pass 2: Comparisons where LHS is a function call like (func(args) op value)
    out = out.replace(/\(([\w.]+\([^)]*\))\s*(==|!=|<=|>=|<|>)\s*([^()]+?)\)/g,
        (match, lhs, op, rhs) => `(${lhs} ${op} ${rhs.trim()} ? 1 : 0)`);
    // Pass 3: Comparisons where RHS is a function call like (value op func(args))
    out = out.replace(/\(([^()]+?)\s*(==|!=|<=|>=|<|>)\s*([\w.]+\([^)]*\))\)/g,
        (match, lhs, op, rhs) => `(${lhs.trim()} ${op} ${rhs} ? 1 : 0)`);

    // Type casts: (float)expr → <f32>(expr), (int)expr → <i32>(expr)
    // Handle (float)(expr) and (int)(expr)
    out = out.replace(/\(float\)\(/g, '<f32>(');
    out = out.replace(/\(int\)\(/g, '<i32>(');
    // Handle (float)simple_var and (int)simple_var
    out = out.replace(/\(float\)(\w[\w.[\]]*)/g, '<f32>$1');
    out = out.replace(/\(int\)(\w[\w.[\]]*)/g, '<i32>$1');

    // FAUSTFLOAT cast
    out = out.replace(/\(FAUSTFLOAT\)/g, '');

    // float suffix: 0.5f → 0.5
    out = out.replace(/(\d+\.\d+(?:e[+-]?\d+)?)f\b/gi, '$1');

    if (hasSemicolon) out += ';';
    return out;
}

function transpileStatement(stmt) {
    const trimmed = stmt.trim();

    // Variable declarations: float varname = expr;
    const floatDeclMatch = trimmed.match(/^float\s+(\w+)\s*=\s*(.*);$/);
    if (floatDeclMatch) {
        const varName = floatDeclMatch[1];
        const expr = transpileExpr(floatDeclMatch[2]);
        return `const ${varName}: f32 = ${expr};`;
    }

    // int variable declarations: int varname = expr;
    const intDeclMatch = trimmed.match(/^int\s+(\w+)\s*=\s*(.*);$/);
    if (intDeclMatch) {
        const varName = intDeclMatch[1];
        const expr = transpileExpr(intDeclMatch[2]);
        return `const ${varName}: i32 = ${expr};`;
    }

    // Assignment: dsp->field = expr;
    const assignMatch = trimmed.match(/^(dsp->\S+)\s*=\s*(.*);$/);
    if (assignMatch) {
        let lhs = transpileExpr(assignMatch[1]);
        let rhs = transpileExpr(assignMatch[2]);
        return `${lhs} = ${rhs};`;
    }

    // output0[i0] = expr; → this.channel.signal.addMonoSignal(expr, 0.5, 0.5);
    const outputMatch = trimmed.match(/^output0\[\w+\]\s*=\s*(.*);$/);
    if (outputMatch) {
        const expr = transpileExpr(outputMatch[1]);
        return `__OUTPUT_ASSIGN__ = ${expr};`;
    }

    // Fallback: just transpile
    return transpileExpr(trimmed);
}

// Transpile the delay shift section — may contain inline C99 loops
function transpileDelayShifts(lines) {
    const result = [];
    let i = 0;
    while (i < lines.length) {
        const trimmed = lines[i].trim();

        // Inner C99 loop for arrays > 3: for (j0 = 3; (j0 > 0); j0 = (j0 - 1)) {
        const loopMatch = trimmed.match(/^for\s*\(\s*(\w+)\s*=\s*(\d+);\s*\(\s*\1\s*>\s*0\s*\);\s*\1\s*=\s*\(\s*\1\s*-\s*1\s*\)\s*\)\s*\{$/);
        if (loopMatch) {
            const varName = loopMatch[1];
            const start = parseInt(loopMatch[2]);
            // Next line is the assignment: dsp->fRec33[j0] = dsp->fRec33[(j0 - 1)];
            i++;
            const assignLine = lines[i] ? lines[i].trim() : '';
            // Extract array name from: dsp->fRecN[j0] = dsp->fRecN[(j0 - 1)];
            const arrMatch = assignLine.match(/dsp->(\w+)\[(\w+)\]\s*=\s*dsp->(\w+)\[\(\s*\2\s*-\s*1\s*\)\]/);
            if (arrMatch) {
                // Unroll: this.fRec33[3] = this.fRec33[2]; this.fRec33[2] = this.fRec33[1]; this.fRec33[1] = this.fRec33[0];
                for (let j = start; j > 0; j--) {
                    result.push(`this.${arrMatch[1]}[${j}] = this.${arrMatch[1]}[${j - 1}];`);
                }
            }
            // Skip closing brace
            i++;
            if (lines[i] && lines[i].trim() === '}') i++;
            continue;
        }

        // Regular delay shift: dsp->fRec29[1] = dsp->fRec29[0];
        if (trimmed && trimmed !== '{' && trimmed !== '}') {
            result.push(transpileStatement(trimmed));
        }
        i++;
    }
    return result;
}

// Transpile instanceClear body
function transpileInstanceClear(body) {
    const lines = body.split('\n');
    const result = [];
    let i = 0;
    while (i < lines.length) {
        const trimmed = lines[i].trim();

        // IOTA assignment: dsp->IOTA = 0;
        if (trimmed.match(/dsp->IOTA\s*=\s*0/)) {
            result.push('this.IOTA = 0;');
            i++;
            continue;
        }

        // C99 loop for zeroing arrays
        const forMatch = trimmed.match(/for\s*\(\s*\w+\s*=\s*0;\s*\(\s*\w+\s*<\s*(\d+)\s*\);\s*\w+\s*=\s*\(\s*\w+\s*\+\s*1\s*\)\s*\)/);
        if (forMatch) {
            const count = parseInt(forMatch[1]);
            // Look ahead for the assignment line
            for (let j = i + 1; j < lines.length && j < i + 5; j++) {
                const innerLine = lines[j].trim();
                const assignMatch = innerLine.match(/dsp->(\w+)\[\w+\]\s*=\s*([0-9.]+f?)\s*;/);
                if (assignMatch) {
                    const arrName = assignMatch[1];
                    const val = assignMatch[2].replace(/f$/, '');
                    result.push(`for (let i = 0; i < ${count}; i++) { this.${arrName}[i] = ${val}; }`);
                    break;
                }
            }
        }
        i++;
    }
    return result;
}

// Transpile instanceConstants body
function transpileInstanceConstants(body) {
    const lines = body.split('\n');
    const result = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === '{' || trimmed === '}') continue;
        if (trimmed.startsWith('dsp->fSampleRate')) continue; // skip sample rate assignment

        // Local variable: float fConstN = expr;
        const localMatch = trimmed.match(/^float\s+(\w+)\s*=\s*(.*);$/);
        if (localMatch) {
            const expr = transpileExpr(localMatch[2]);
            result.push(`const ${localMatch[1]}: f32 = ${expr};`);
            continue;
        }

        // Assignment: dsp->fConstN = expr;
        const assignMatch = trimmed.match(/^dsp->(\w+)\s*=\s*(.*);$/);
        if (assignMatch) {
            const expr = transpileExpr(assignMatch[2]);
            result.push(`this.${assignMatch[1]} = ${expr};`);
            continue;
        }
    }
    return result;
}

// Transpile SIG0 fill function
function transpileSig0Fill(fillBody, tableName) {
    const lines = fillBody.split('\n');
    const result = [];
    let inLoop = false;

    // We need temporary variables for the SIG0 struct fields
    const tempVars = {};

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === '{' || trimmed === '}') continue;
        if (trimmed.startsWith('/*') || trimmed.startsWith('//')) continue;
        if (trimmed.match(/^int\s+\w+\s*;$/)) continue; // loop var declaration

        // for loop start
        if (trimmed.match(/^for\s*\(/)) {
            const forMatch = trimmed.match(/for\s*\(\s*\w+\s*=\s*0;\s*\(\s*\w+\s*<\s*count\s*\);\s*\w+\s*=\s*\(\s*\w+\s*\+\s*1\s*\)\s*\)/);
            if (forMatch) {
                result.push(`for (let i = 0; i < ${tableName}.length; i++) {`);
                inLoop = true;
                continue;
            }
        }

        if (inLoop) {
            // dsp->field[0] = expr; → sig0Field0 = expr;
            let transpiled = trimmed;
            transpiled = transpiled.replace(/dsp->/g, '');
            transpiled = transpiled.replace(/table\[i1\]/g, `${tableName}[i]`);
            transpiled = transpiled.replace(/table\[\w+\]/g, `${tableName}[i]`);
            transpiled = transpileExpr(transpiled);
            result.push('    ' + transpiled);
        }
    }
    if (inLoop) result.push('}');

    return result;
}

// ---------------------------------------------------------------------------
// Step 4: Generate AssemblyScript
// ---------------------------------------------------------------------------

const out = [];

// File header
out.push(`// Faust-generated ${className}`);
out.push(`// Auto-transpiled from Faust DSP by faust2as.js`);
out.push(`// Source: ${path.basename(inputDsp)}`);
out.push('');

// Imports
out.push('import { MidiVoice, MidiChannel } from "../midisynth";');
out.push('import { notefreq } from "../../synth/note";');
out.push('import { SAMPLERATE } from "../../environment";');
out.push('');

// Module-level SIG0 tables with lazy initialization
for (const table of sig0Tables) {
    const shortName = table.name.replace(className, '');
    out.push(`const ${shortName}: StaticArray<f32> = new StaticArray<f32>(${table.size});`);
}

if (sig0Fills.length > 0) {
    out.push('let _sig0_initialized: bool = false;');
    out.push('');
    out.push('function _initSIG0Tables(): void {');
    out.push('    if (_sig0_initialized) return;');
    out.push('    _sig0_initialized = true;');

    for (let idx = 0; idx < sig0Fills.length; idx++) {
        const fill = sig0Fills[idx];
        const table = sig0Tables[idx];
        const shortTableName = table ? table.name.replace(className, '') : `ftbl${idx}SIG${fill.sigIndex}`;

        // Declare temp variables for SIG0 struct fields
        const sig0Struct = sig0Structs[idx];
        if (sig0Struct) {
            const sigFieldRegex = /\s*(int|float)\s+(\w+)\s*\[(\d+)\]\s*;/g;
            let fm;
            while ((fm = sigFieldRegex.exec(sig0Struct.fields)) !== null) {
                const asType = fm[1] === 'float' ? 'f32' : 'i32';
                out.push(`    const sig${fill.sigIndex}_${fm[2]}: StaticArray<${asType}> = new StaticArray<${asType}>(${fm[3]});`);
            }
        }

        const fillLines = transpileSig0Fill(fill.body, shortTableName);
        // Replace dsp struct field accesses with our temp arrays
        for (let line of fillLines) {
            if (sig0Struct) {
                const sigFieldRegex2 = /\s*(int|float)\s+(\w+)\s*\[(\d+)\]\s*;/g;
                let fm2;
                while ((fm2 = sigFieldRegex2.exec(sig0Struct.fields)) !== null) {
                    line = line.replace(new RegExp(`\\b${fm2[2]}\\b`, 'g'), `sig${fill.sigIndex}_${fm2[2]}`);
                }
            }
            out.push('    ' + line);
        }
    }
    out.push('}');
    out.push('');
}

// Helper functions
for (const h of helperFns) {
    const asParams = h.params.replace(/float\s+(\w+)/g, '$1: f32').replace(/int\s+(\w+)/g, '$1: i32');
    const asBody = transpileExpr(h.body);
    out.push(`function ${h.fnName}(${asParams}): f32 { ${asBody} }`);
}
if (helperFns.length > 0) out.push('');

// Class declaration
out.push(`export class ${className} extends MidiVoice {`);

// Fields
// Determine which fields are UI params (have defaults) vs state
const uiFieldNames = new Set(uiParams.map(p => p.field));

for (const field of fields) {
    const isUI = field.type === 'FAUSTFLOAT';
    if (field.arraySize) {
        const asType = (field.type === 'int') ? 'i32' : 'f32';
        out.push(`    private ${field.name}: StaticArray<${asType}> = new StaticArray<${asType}>(${field.arraySize});`);
    } else if (field.name === 'IOTA') {
        out.push(`    private IOTA: i32 = 0;`);
    } else if (isUI) {
        const def = defaults[field.name] || '0.0';
        out.push(`    private ${field.name}: f32 = ${def};`);
    } else {
        const asType = (field.type === 'int') ? 'i32' : 'f32';
        out.push(`    private ${field.name}: ${asType};`);
    }
}

// silentSamples for isDone tracking
out.push(`    private silentSamples: i32 = 0;`);
out.push('');

// Constructor
out.push('    constructor(channel: MidiChannel) {');
out.push('        super(channel);');
if (sig0Fills.length > 0) {
    out.push('        _initSIG0Tables();');
}
out.push('        this.instanceConstants();');
out.push('        this.instanceClear();');
out.push('    }');
out.push('');

// instanceConstants
out.push('    private instanceConstants(): void {');
const constLines = transpileInstanceConstants(constBody);
for (const line of constLines) {
    out.push('        ' + line);
}
out.push('    }');
out.push('');

// instanceClear
out.push('    private instanceClear(): void {');
const clearLines = transpileInstanceClear(clearBody);
for (const line of clearLines) {
    out.push('        ' + line);
}
out.push('    }');
out.push('');

// --- noteon / noteoff / isDone ---

// Find freq, gate, gain parameters
const freqParam = uiParams.find(p => p.name === 'freq');
const gateParam = uiParams.find(p => p.isButton && p.name === 'gate');
const gainParam = uiParams.find(p => p.name === 'gain');

out.push('    noteon(note: u8, velocity: u8): void {');
out.push('        super.noteon(note, velocity);');
if (freqParam) {
    out.push(`        this.${freqParam.field} = notefreq(note);`);
}
if (gateParam) {
    out.push(`        this.${gateParam.field} = 1.0;`);
}
if (gainParam) {
    out.push(`        this.${gainParam.field} = <f32>velocity / 127.0;`);
}
out.push('        this.silentSamples = 0;');
out.push('    }');
out.push('');

out.push('    noteoff(): void {');
if (gateParam) {
    out.push(`        this.${gateParam.field} = 0.0;`);
}
out.push('    }');
out.push('');

out.push('    isDone(): boolean {');
if (gateParam) {
    out.push(`        return this.${gateParam.field} == 0.0 && this.silentSamples > 4410;`);
} else {
    out.push('        return this.silentSamples > 4410;');
}
out.push('    }');
out.push('');

// --- nextframe ---
out.push('    nextframe(): void {');

// fSlow declarations
for (const decl of fSlowDecls) {
    let transpiled = transpileStatement(decl);
    // For int iSlow declarations, ensure boolean wrapping
    if (decl.startsWith('int ')) {
        transpiled = transpiled; // already handled in transpileStatement
    }
    out.push('        ' + transpiled);
}

out.push('');

// Loop body
for (const line of loopBodyLines) {
    let transpiled = transpileStatement(line);

    // Replace output assignment placeholder
    if (transpiled.includes('__OUTPUT_ASSIGN__')) {
        const exprMatch = transpiled.match(/__OUTPUT_ASSIGN__\s*=\s*(.*);$/);
        if (exprMatch) {
            // Extract final output variable name for silence tracking
            const outputExpr = exprMatch[1];
            out.push(`        const output: f32 = ${outputExpr};`);
        }
        continue;
    }

    out.push('        ' + transpiled);
}

out.push('');

// Delay shifts
const delayLines = transpileDelayShifts(delayShiftLines);
for (const line of delayLines) {
    out.push('        ' + line);
}

out.push('');

// Silence tracking
out.push('        if (Mathf.abs(output) < 0.00001) {');
out.push('            this.silentSamples++;');
out.push('        } else {');
out.push('            this.silentSamples = 0;');
out.push('        }');
out.push('');
out.push('        this.channel.signal.addMonoSignal(output, 0.5, 0.5);');

out.push('    }');
out.push('}');
out.push('');

// ---------------------------------------------------------------------------
// Step 5: Write output
// ---------------------------------------------------------------------------

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, out.join('\n'));
console.log(`Generated: ${outputPath}`);

// Clean up temp file
try { fs.unlinkSync(tmpCFile); } catch (e) {}
