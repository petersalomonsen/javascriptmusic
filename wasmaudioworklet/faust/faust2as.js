#!/usr/bin/env node
// faust2as.js — Faust DSP to AssemblyScript MidiVoice transpiler
//
// Usage: node faust2as.js <input.dsp> [--name ClassName] [--out output.ts]
//        node faust2as.js --bundle <dsp1> <dsp2> ... [--out output.ts]
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
    console.log(`       node faust2as.js --bundle <dsp1> <dsp2> ... [--out output.ts]`);
    console.log(`  --name    Class name for the generated MidiVoice (default: derived from filename)`);
    console.log(`  --out     Output .ts file path`);
    console.log(`  --bundle  Transpile multiple DSPs into a single bundle with initializeMidiSynth()`);
    process.exit(0);
}

const bundleMode = args.includes('--bundle');
let outputPath = null;
let className = null;
const dspFiles = [];

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--bundle') continue;
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
        outputPath = path.resolve(__dirname, '..', 'synth1', 'assembly', 'midi', 'instruments', className.toLowerCase() + '.ts');
    }
} else {
    if (!outputPath) {
        outputPath = path.resolve(__dirname, 'synth_bundle.ts');
    }
}

// ---------------------------------------------------------------------------
// Transpile C expressions to AssemblyScript
// ---------------------------------------------------------------------------

function transpileExpr(expr, ctx) {
    let out = expr;

    // Remove trailing semicolon for processing (we'll add it back)
    const hasSemicolon = out.endsWith(';');
    if (hasSemicolon) out = out.slice(0, -1);

    // dsp-> → this.
    out = out.replace(/dsp->/g, 'this.');

    // Replace this.field → globalName for global UI params (shared across voices)
    if (ctx.globalFields) {
        for (const [field, globalName] of ctx.globalFields) {
            out = out.replace(new RegExp(`this\\.${field}\\b`, 'g'), globalName);
        }
    }

    // (float)this.fSampleRate or (float)(this.fSampleRate) → SAMPLERATE
    out = out.replace(/\(float\)\s*\(?this\.fSampleRate\)?/g, 'SAMPLERATE');

    // ClassName_faustpower2_f → faustpower2_f (etc.)
    for (const h of ctx.helperFns) {
        out = out.replace(new RegExp(`${ctx.className}_${h.fnName}`, 'g'), h.fnName);
    }

    // SIG0 static table names: ftbl0ClassNameSIG0 → ftbl0SIG0
    for (const table of ctx.sig0Tables) {
        const shortName = table.name.replace(ctx.className, '');
        if (shortName !== table.name) {
            out = out.replace(new RegExp(table.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ctx.tablePrefix + shortName);
        }
    }

    // Wave data array names: fClassNameSIG0Wave0 → _wave_SIG0Wave0 (also iClassName for int waves)
    // Use \b word boundary to avoid matching fPianoSIG0Wave0 inside fPianoSIG0Wave0_idx
    for (const wave of ctx.sigWaveArrays) {
        const prefix = wave.isInt ? 'i' : 'f';
        const shortName = wave.name.replace(`${prefix}${ctx.className}`, ctx.wavePrefix + '_wave_');
        if (shortName !== wave.name) {
            out = out.replace(new RegExp(`\\b${wave.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), shortName);
        }
    }

    // Math functions: fminf(a,b) → Mathf.min(a,b), etc.
    const mathMap = {
        'fminf': 'Mathf.min', 'fmaxf': 'Mathf.max', 'floorf': 'Mathf.floor',
        'sinf': 'Mathf.sin', 'cosf': 'Mathf.cos', 'tanf': 'Mathf.tan',
        'expf': 'Mathf.exp', 'logf': 'Mathf.log', 'log10f': 'Mathf.log10',
        'powf': 'Mathf.pow', 'sqrtf': 'Mathf.sqrt', 'fabsf': 'Mathf.abs',
        'rintf': 'Mathf.round', 'roundf': 'Mathf.round', 'ceilf': 'Mathf.ceil',
        'atanf': 'Mathf.atan', 'atan2f': 'Mathf.atan2',
        'asinf': 'Mathf.asin', 'acosf': 'Mathf.acos',
    };
    for (const [cFn, asFn] of Object.entries(mathMap)) {
        out = out.replace(new RegExp(`\\b${cFn}\\(`, 'g'), `${asFn}(`);
    }

    // Integer math helpers: min_i/max_i → min<i32>/max<i32> (AS built-ins)
    out = out.replace(/\bmin_i\(/g, 'min<i32>(');
    out = out.replace(/\bmax_i\(/g, 'max<i32>(');

    // Boolean-to-int wrapping: MUST happen BEFORE type cast replacement
    // so that (int) and (float) casts are not confused with < > comparisons.
    // In C, comparisons return int (0 or 1). In AS, they return bool.
    // When comparisons are used in arithmetic (bitwise OR, multiplication, addition),
    // they need explicit ? 1 : 0 wrapping.
    // Protect bitwise shift operators from being split by comparison matching
    out = out.replace(/>>/g, '__RSHIFT__');
    out = out.replace(/<</g, '__LSHIFT__');
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
    // Restore shift operators
    out = out.replace(/__RSHIFT__/g, '>>');
    out = out.replace(/__LSHIFT__/g, '<<');

    // Type casts: (float)(expr) → _fcast(expr), (int)(expr) → _icast(expr)
    // Uses generic inline helpers to avoid AS contextual typing issues:
    // <f32>(100 * iSlow) would contextually type 100 as f32, causing f32*i32 error.
    // _fcast(100 * iSlow) evaluates the arg at its natural type (i32), then converts.
    out = out.replace(/\(float\)\(/g, '_fcast(');
    out = out.replace(/\(int\)\(/g, '_icast(');
    // Handle (float)simple_var and (int)simple_var
    out = out.replace(/\(float\)(\w[\w.[\]]*)/g, '<f32>$1');
    out = out.replace(/\(int\)(\w[\w.[\]]*)/g, '<i32>$1');

    // FAUSTFLOAT cast
    out = out.replace(/\(FAUSTFLOAT\)/g, '');

    // float suffix: 0.5f → 0.5, 1e+01f → 1e+01, 1.0e+01f → 1.0e+01
    out = out.replace(/(\d+\.?\d*(?:e[+-]?\d+)?)f\b/gi, '$1');

    if (hasSemicolon) out += ';';
    return out;
}

function transpileStatement(stmt, ctx) {
    const trimmed = stmt.trim();

    // Variable declarations: float varname = expr;
    const floatDeclMatch = trimmed.match(/^float\s+(\w+)\s*=\s*(.*);$/);
    if (floatDeclMatch) {
        const varName = floatDeclMatch[1];
        const expr = transpileExpr(floatDeclMatch[2], ctx);
        return `const ${varName}: f32 = ${expr};`;
    }

    // int variable declarations: int varname = expr;
    const intDeclMatch = trimmed.match(/^int\s+(\w+)\s*=\s*(.*);$/);
    if (intDeclMatch) {
        const varName = intDeclMatch[1];
        const expr = transpileExpr(intDeclMatch[2], ctx);
        return `const ${varName}: i32 = ${expr};`;
    }

    // Assignment: dsp->field = expr;
    const assignMatch = trimmed.match(/^(dsp->\S+)\s*=\s*(.*);$/);
    if (assignMatch) {
        let lhs = transpileExpr(assignMatch[1], ctx);
        let rhs = transpileExpr(assignMatch[2], ctx);
        return `${lhs} = ${rhs};`;
    }

    // output0[i0] = expr; → placeholder for voice output
    const outputMatch = trimmed.match(/^output0\[\w+\]\s*=\s*(.*);$/);
    if (outputMatch) {
        const expr = transpileExpr(outputMatch[1], ctx);
        return `__OUTPUT_ASSIGN__ = ${expr};`;
    }

    // Fallback: just transpile
    return transpileExpr(trimmed, ctx);
}

// Transpile the delay shift section — may contain inline C99 loops
function transpileDelayShifts(lines, ctx) {
    const result = [];
    let i = 0;
    while (i < lines.length) {
        const trimmed = lines[i].trim();

        // Inner C99 loop for arrays > 3: for (j0 = 3; (j0 > 0); j0 = (j0 - 1)) {
        // Also handles non-parenthesized: for (j0 = 3; j0 > 0; j0 = j0 - 1) {
        const loopMatch = trimmed.match(/^for\s*\(\s*(\w+)\s*=\s*(\d+);\s*\(?\s*\1\s*>\s*0\s*\)?;\s*\1\s*=\s*\(?\s*\1\s*-\s*1\s*\)?\s*\)\s*\{$/);
        if (loopMatch) {
            const varName = loopMatch[1];
            const start = parseInt(loopMatch[2]);
            // Next line is the assignment: dsp->fRec33[j0] = dsp->fRec33[(j0 - 1)];
            // Also handles non-parenthesized: dsp->fRec33[j0 - 1]
            i++;
            const assignLine = lines[i] ? lines[i].trim() : '';
            // Extract array name from: dsp->fRecN[j0] = dsp->fRecN[(j0 - 1)] or dsp->fRecN[j0 - 1];
            const arrMatch = assignLine.match(/dsp->(\w+)\[(\w+)\]\s*=\s*dsp->(\w+)\[\(?\s*\2\s*-\s*1\s*\)?]/);
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
            result.push(transpileStatement(trimmed, ctx));
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
        if (trimmed.match(/dsp->IOTA\S*\s*=\s*0/)) {
            const iotaMatch = trimmed.match(/dsp->(\w+)\s*=\s*0/);
            result.push(`this.${iotaMatch[1]} = 0;`);
            i++;
            continue;
        }

        // C99 loop for zeroing arrays
        // Handles both: for (l0 = 0; (l0 < 2); l0 = (l0 + 1)) and for (l0 = 0; l0 < 2; l0 = l0 + 1)
        const forMatch = trimmed.match(/for\s*\(\s*\w+\s*=\s*0;\s*\(?\s*\w+\s*<\s*(\d+)\s*\)?;\s*\w+\s*=\s*\(?\s*\w+\s*\+\s*1\s*\)?\s*\)/);
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
function transpileInstanceConstants(body, ctx) {
    const lines = body.split('\n');
    const result = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === '{' || trimmed === '}') continue;
        if (trimmed.startsWith('dsp->fSampleRate')) continue; // skip sample rate assignment

        // Local variable: float fConstN = expr;
        const localMatch = trimmed.match(/^float\s+(\w+)\s*=\s*(.*);$/);
        if (localMatch) {
            const expr = transpileExpr(localMatch[2], ctx);
            result.push(`const ${localMatch[1]}: f32 = ${expr};`);
            continue;
        }

        // Assignment: dsp->fConstN = expr;
        const assignMatch = trimmed.match(/^dsp->(\w+)\s*=\s*(.*);$/);
        if (assignMatch) {
            const expr = transpileExpr(assignMatch[2], ctx);
            result.push(`this.${assignMatch[1]} = ${expr};`);
            continue;
        }
    }
    return result;
}

// Transpile SIG0 fill function
function transpileSig0Fill(fillBody, tableName, ctx) {
    const lines = fillBody.split('\n');
    const result = [];
    let inLoop = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === '{' || trimmed === '}') continue;
        if (trimmed.startsWith('/*') || trimmed.startsWith('//')) continue;
        if (trimmed.match(/^int\s+\w+\s*;$/)) continue; // loop var declaration

        // for loop start
        if (trimmed.match(/^for\s*\(/)) {
            const forMatch = trimmed.match(/for\s*\(\s*\w+\s*=\s*0;\s*\(?\s*\w+\s*<\s*count\s*\)?;\s*\w+\s*=\s*\(?\s*\w+\s*\+\s*1\s*\)?\s*\)/);
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
            transpiled = transpileExpr(transpiled, ctx);
            result.push('    ' + transpiled);
        }
    }
    if (inLoop) result.push('}');

    return result;
}

// ---------------------------------------------------------------------------
// Helper: Parse effect C source (reuses same patterns as voice parsing)
// ---------------------------------------------------------------------------

function parseEffectC(cSrc, clsName) {
    let m;

    // Helper functions
    const helperFnRegex = new RegExp(`static\\s+float\\s+${clsName}_(\\w+)\\s*\\(([^)]*)\\)\\s*\\{([^}]+)\\}`, 'g');
    const helperFns = [];
    while ((m = helperFnRegex.exec(cSrc)) !== null) {
        helperFns.push({ fnName: m[1], params: m[2], body: m[3].trim() });
    }

    // Wave data arrays (float and int)
    const sigWaveRegex = new RegExp(
        `static\\s+(float|int)\\s+([fi]${clsName}SIG\\d+Wave\\d+)\\s*\\[(\\d+)\\]\\s*=\\s*\\{([^}]+)\\}`, 'g'
    );
    const sigWaveArrays = [];
    while ((m = sigWaveRegex.exec(cSrc)) !== null) {
        const isInt = m[1] === 'int';
        const values = m[4].split(',').map(v => v.trim().replace(/f$/i, ''));
        sigWaveArrays.push({ name: m[2], size: parseInt(m[3]), values, isInt });
    }

    // SIG struct definitions
    const sig0StructRegex = new RegExp(`typedef\\s+struct\\s*\\{([^}]+)\\}\\s*${clsName}SIG(\\d+)\\s*;`, 'g');
    const sig0Structs = [];
    while ((m = sig0StructRegex.exec(cSrc)) !== null) {
        sig0Structs.push({ sigIndex: m[2], fields: m[1] });
    }

    // SIG table declarations (float and int)
    const sig0TableRegex = new RegExp(`static\\s+(float|int)\\s+([fi]tbl\\d+${clsName}SIG\\d+)\\s*\\[(\\d+)\\]\\s*;`, 'g');
    const sig0Tables = [];
    while ((m = sig0TableRegex.exec(cSrc)) !== null) {
        sig0Tables.push({ name: m[2], size: parseInt(m[3]), isInt: m[1] === 'int' });
    }

    // SIG fill functions (float* table or int* table)
    const sig0FillRegex = new RegExp(
        `static\\s+void\\s+fill${clsName}SIG(\\d+)\\s*\\(${clsName}SIG\\d+\\*\\s*dsp,\\s*int\\s+count,\\s*(?:float|int)\\*\\s+table\\)\\s*\\{([\\s\\S]*?)^\\}`, 'gm'
    );
    const sig0Fills = [];
    while ((m = sig0FillRegex.exec(cSrc)) !== null) {
        sig0Fills.push({ sigIndex: m[1], body: m[2] });
    }

    // SIG init functions
    const sig0InitRegex = new RegExp(
        `static\\s+void\\s+instanceInit${clsName}SIG(\\d+)\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`, 'gm'
    );
    const sig0Inits = [];
    while ((m = sig0InitRegex.exec(cSrc)) !== null) {
        sig0Inits.push({ sigIndex: m[1], body: m[2] });
    }

    // Main struct fields
    const structRegex = new RegExp(`typedef\\s+struct\\s*\\{([^{}]*)\\}\\s*${clsName}\\s*;`);
    const structMatch = cSrc.match(structRegex);
    if (!structMatch) {
        console.error(`Could not find main struct for effect ${clsName}`);
        process.exit(1);
    }
    const fields = [];
    const fieldRegex = /\s*(FAUSTFLOAT|float|int)\s+(\w+)(?:\[(\d+)\])?\s*;/g;
    while ((m = fieldRegex.exec(structMatch[1])) !== null) {
        if (m[2] === 'fSampleRate') continue;
        fields.push({ type: m[1], name: m[2], arraySize: m[3] ? parseInt(m[3]) : null });
    }

    // Default values
    const resetUIRegex = new RegExp(
        `void\\s+instanceResetUserInterface${clsName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`, 'gm'
    );
    const resetUIMatch = resetUIRegex.exec(cSrc);
    const defaults = {};
    if (resetUIMatch) {
        const defaultRegex = /dsp->(\w+)\s*=\s*\(FAUSTFLOAT\)\(?([\d.eE+-]+f?)\)?/g;
        while ((m = defaultRegex.exec(resetUIMatch[1])) !== null) {
            let val = m[2].replace(/f$/, '');
            val = parseFloat(val).toString();
            defaults[m[1]] = val;
        }
    }

    // instanceClear
    const clearRegex = new RegExp(
        `void\\s+instanceClear${clsName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`, 'gm'
    );
    const clearMatch = clearRegex.exec(cSrc);
    const clearBody = clearMatch ? clearMatch[1] : '';

    // instanceConstants
    const constRegex = new RegExp(
        `void\\s+instanceConstants${clsName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`, 'gm'
    );
    const constMatch = constRegex.exec(cSrc);
    const constBody = constMatch ? constMatch[1] : '';

    // buildUserInterface (for MIDI CC metadata on effect params)
    const buildUIRegex = new RegExp(
        `void\\s+buildUserInterface${clsName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`, 'gm'
    );
    const buildUIMatch = buildUIRegex.exec(cSrc);
    const buildUIBody = buildUIMatch ? buildUIMatch[1] : '';

    const uiParams = [];
    const declareRegex = /ui_interface->declare\([^,]+,\s*&dsp->(\w+),\s*"(\w+)",\s*"([^"]+)"\)/g;
    const midiMeta = {};
    while ((m = declareRegex.exec(buildUIBody)) !== null) {
        if (!midiMeta[m[1]]) midiMeta[m[1]] = {};
        midiMeta[m[1]][m[2]] = m[3];
    }
    const sliderRegex = /ui_interface->(?:add(?:Horizontal|Vertical)Slider|addNumEntry)\([^,]+,\s*"([^"]+)",\s*&dsp->(\w+),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?)\)/g;
    while ((m = sliderRegex.exec(buildUIBody)) !== null) {
        uiParams.push({
            name: m[1], field: m[2],
            init: parseFloat(m[3]), min: parseFloat(m[4]), max: parseFloat(m[5]), step: parseFloat(m[6]),
            midi: midiMeta[m[2]] || {}
        });
    }

    // Compute body — parse with effect-aware input/output handling
    const computeRegex = new RegExp(
        `void\\s+compute${clsName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}\\s*(?:#ifdef|$)`, 'gm'
    );
    const computeMatch = computeRegex.exec(cSrc);
    if (!computeMatch) {
        console.error(`Could not find compute function for effect ${clsName}`);
        process.exit(1);
    }

    const computeLines = computeMatch[1].split('\n');
    const fSlowDecls = [];
    const loopBodyLines = [];
    const delayShiftLines = [];
    let inLoop = false;
    let loopBraceDepth = 0;
    let afterLastOutput = false;
    let numInputs = 0;
    let numOutputs = 0;

    for (let i = 0; i < computeLines.length; i++) {
        const line = computeLines[i];
        const trimmed = line.trim();

        // Count input/output declarations
        if (trimmed.match(/FAUSTFLOAT\*\s+input\d+/)) { numInputs++; continue; }
        if (trimmed.startsWith('FAUSTFLOAT* output')) { numOutputs++; continue; }

        // fSlow/iSlow declarations (before the loop)
        if (!inLoop && (trimmed.startsWith('float fSlow') || trimmed.startsWith('int iSlow'))) {
            fSlowDecls.push(trimmed);
            continue;
        }

        // Detect loop start
        if (!inLoop && trimmed.match(/for\s*\(\w+\s*=\s*0/)) {
            inLoop = true;
            loopBraceDepth = 0;
            continue;
        }

        if (inLoop) {
            for (const ch of trimmed) {
                if (ch === '{') loopBraceDepth++;
                if (ch === '}') loopBraceDepth--;
            }

            if (trimmed === '' || trimmed === '{' || trimmed === '}') continue;
            if (trimmed.startsWith('/*') || trimmed.startsWith('//')) continue;
            if (trimmed.match(/^int\s+[ij]\d+\s*;$/)) continue;
            if (trimmed.match(/^for\s*\(\s*[ij]\d+\s*=\s*0/)) continue;

            // For effects: keep BOTH output0 and output1 in loopBodyLines
            // afterLastOutput is set after output1 (or output0 if only 1 output)
            if (trimmed.match(/output[01]\[/)) {
                loopBodyLines.push(trimmed);
                const isLastOutput = (numOutputs >= 2 && trimmed.match(/output1\[/)) ||
                                     (numOutputs === 1 && trimmed.match(/output0\[/));
                if (isLastOutput) afterLastOutput = true;
                continue;
            }

            if (afterLastOutput) {
                delayShiftLines.push(trimmed);
            } else {
                loopBodyLines.push(trimmed);
            }
        }
    }

    return {
        helperFns, sigWaveArrays, sig0Structs, sig0Tables, sig0Fills, sig0Inits,
        fields, defaults, clearBody, constBody, uiParams,
        fSlowDecls, loopBodyLines, delayShiftLines,
        numInputs, numOutputs,
    };
}

// ---------------------------------------------------------------------------
// Helper: Pre-process effect input references in C lines
// ---------------------------------------------------------------------------

function preprocessEffectInputs(line, numInputs) {
    let out = line;
    if (numInputs >= 2) {
        out = out.replace(/\(float\)\(?input0\[\w+\]\)?/g, 'this.signal.left');
        out = out.replace(/\(float\)\(?input1\[\w+\]\)?/g, 'this.signal.right');
    } else if (numInputs === 1) {
        out = out.replace(/\(float\)\(?input0\[\w+\]\)?/g, '((this.signal.left + this.signal.right) * 0.5)');
    }
    return out;
}

// ---------------------------------------------------------------------------
// External header (ffunction) support — LookupTable parsing
// ---------------------------------------------------------------------------

const SYSTEM_HEADERS = new Set(['math.h', 'stdint.h', 'stdlib.h', 'string.h', 'stdio.h']);

function parseExternalHeader(headerPath) {
    const src = fs.readFileSync(headerPath, 'utf-8');
    const functions = new Map();

    // 1. Extract point arrays: double tableName_points[N*2] = { ... };
    const pointArrays = new Map();
    const pointRegex = /double\s+(\w+_points)\s*\[\s*\d+\s*\*\s*2\s*\]\s*=\s*\{([^}]+)\}/g;
    let m;
    while ((m = pointRegex.exec(src)) !== null) {
        const values = m[2].split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        pointArrays.set(m[1], values);
    }

    // 2. Extract LookupTable declarations: LookupTable tableName(&pointsName[0], N);
    const tableMap = new Map(); // tableName → { pointsArrayName, nPoints }
    const tableRegex = /LookupTable\s+(\w+)\s*\(\s*&\s*(\w+_points)\s*\[\s*0\s*\]\s*,\s*(\d+)\s*\)/g;
    while ((m = tableRegex.exec(src)) !== null) {
        tableMap.set(m[1], { pointsArrayName: m[2], nPoints: parseInt(m[3]) });
    }

    // 3. Extract getter functions: float getValueXxx(float index) { return tableName.getValue(index); }
    const getterRegex = /float\s+(getValue\w+|getvalue\w+|getValuer\w+)\s*\(\s*float\s+\w+\s*\)\s*\{\s*return\s+(\w+)\.getValue\s*\(\s*\w+\s*\)\s*;\s*\}/g;
    while ((m = getterRegex.exec(src)) !== null) {
        const fnName = m[1];
        const tableName = m[2];
        const tableInfo = tableMap.get(tableName);
        if (tableInfo) {
            const points = pointArrays.get(tableInfo.pointsArrayName);
            if (points) {
                functions.set(fnName, {
                    tableName,
                    points,
                    nPoints: tableInfo.nPoints,
                });
            }
        }
    }

    // 4. Extract simple array readers: float readXxx(int index) { ... return arrayName[index]; }
    // (for modalBar-style tables — not LookupTable-based)
    const arrayReaderRegex = /float\s+(read\w+)\s*\(\s*int\s+\w+\s*\)\s*\{[^}]*static\s+float\s+(\w+)\s*\[\s*[^\]]+\]\s*=\s*\{([^}]+)\}[^}]*return\s+\w+\[\s*\w+\s*\]\s*;/gs;
    while ((m = arrayReaderRegex.exec(src)) !== null) {
        const fnName = m[1];
        const values = m[3].split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        functions.set(fnName, {
            tableName: m[2],
            points: values,
            nPoints: -1, // flag: simple array, not LookupTable
        });
    }

    return { functions };
}

function generateLookupTableAS(fnName, tableInfo, prefix) {
    const lines = [];
    const arrayName = `${prefix}${tableInfo.tableName}_points`;

    if (tableInfo.nPoints === -1) {
        // Simple array reader (e.g. readMarmstk1)
        lines.push(`const ${arrayName}: StaticArray<f32> = StaticArray.fromArray<f32>([${tableInfo.points.join(', ')}]);`);
        lines.push(`function ${fnName}(index: i32): f32 { return ${arrayName}[index]; }`);
    } else {
        // LookupTable with linear interpolation
        const ptsStr = tableInfo.points.map(v => v.toString()).join(', ');
        lines.push(`const ${arrayName}: StaticArray<f64> = StaticArray.fromArray<f64>([${ptsStr}]);`);
        lines.push(`function ${fnName}(x: f32): f32 {`);
        lines.push(`    const pts = ${arrayName};`);
        lines.push(`    const n: i32 = ${tableInfo.nPoints};`);
        lines.push(`    let i: i32 = 0;`);
        lines.push(`    while (<f64>x > pts[i * 2]) {`);
        lines.push(`        i++;`);
        lines.push(`        if (i >= n) return <f32>pts[(n - 1) * 2 + 1];`);
        lines.push(`    }`);
        lines.push(`    if (i == 0) return <f32>pts[1];`);
        lines.push(`    const ratio: f64 = (<f64>x - pts[(i - 1) * 2]) / (pts[i * 2] - pts[(i - 1) * 2]);`);
        lines.push(`    return <f32>(pts[(i - 1) * 2 + 1] * (1.0 - ratio) + pts[i * 2 + 1] * ratio);`);
        lines.push(`}`);
    }
    return lines;
}

function detectExternalHeaders(cSource, inputDsp) {
    const headers = [];
    const headerRegex = /#include\s+<(\w+\.h)>/g;
    let m;
    while ((m = headerRegex.exec(cSource)) !== null) {
        if (!SYSTEM_HEADERS.has(m[1])) {
            const headerPath = path.resolve(path.dirname(inputDsp), m[1]);
            if (fs.existsSync(headerPath)) {
                headers.push({ name: m[1], path: headerPath });
            } else {
                console.warn(`Warning: External header ${m[1]} referenced but not found at ${headerPath}`);
            }
        }
    }
    return headers;
}

// ---------------------------------------------------------------------------
// Core transpilation pipeline
// ---------------------------------------------------------------------------

function transpileDsp(inputDsp, clsName, options = {}) {
    const {
        voiceTablePrefix = '',
        voiceWavePrefix = '',
        effectTablePrefix = '_eff_',
        effectWavePrefix = '_eff_',
        voiceSigPrefix = '',
        effectSigPrefix = '_eff',
    } = options;

    let m;

    // === Step 1: Run Faust compiler to get C output ===

    const dspSource = fs.readFileSync(path.resolve(inputDsp), 'utf-8');
    const hasEffect = /^\s*effect\s*=/m.test(dspSource);

    const tmpCFile = `/tmp/faust2as_${clsName}.c`;
    const faustCmd = `faust -lang c -cn ${clsName} "${path.resolve(inputDsp)}" -o "${tmpCFile}"`;
    console.log(`Running: ${faustCmd}`);
    try {
        execSync(faustCmd, { stdio: 'inherit' });
    } catch (e) {
        console.error('Faust compilation failed');
        process.exit(1);
    }

    const cSource = fs.readFileSync(tmpCFile, 'utf-8');

    const effectClassName = clsName + 'Effect';
    let effectCSource = null;
    let tmpEffectCFile = null;

    if (hasEffect) {
        tmpEffectCFile = `/tmp/faust2as_${effectClassName}.c`;
        const effectFaustCmd = `faust -lang c -cn ${effectClassName} -pn effect "${path.resolve(inputDsp)}" -o "${tmpEffectCFile}"`;
        console.log(`Running: ${effectFaustCmd}`);
        try {
            execSync(effectFaustCmd, { stdio: 'inherit' });
        } catch (e) {
            console.error('Faust effect compilation failed');
            process.exit(1);
        }
        effectCSource = fs.readFileSync(tmpEffectCFile, 'utf-8');
        console.log(`Detected effect declaration — will generate ${clsName}Channel MidiChannel subclass`);
    }

    // === Step 1b: Detect and parse external header files (ffunction support) ===
    const externalFunctions = new Map(); // fnName → tableInfo
    const allExternalHeaders = [
        ...detectExternalHeaders(cSource, inputDsp),
        ...(effectCSource ? detectExternalHeaders(effectCSource, inputDsp) : []),
    ];
    const parsedHeaders = new Set();
    for (const header of allExternalHeaders) {
        if (parsedHeaders.has(header.path)) continue;
        parsedHeaders.add(header.path);
        console.log(`Parsing external header: ${header.name}`);
        const parsed = parseExternalHeader(header.path);
        for (const [fnName, info] of parsed.functions) {
            if (!externalFunctions.has(fnName)) {
                externalFunctions.set(fnName, info);
            }
        }
    }
    if (externalFunctions.size > 0) {
        console.log(`Found ${externalFunctions.size} external lookup table functions: ${[...externalFunctions.keys()].join(', ')}`);
    }

    // === Step 2: Parse C output ===

    // --- 2a: Extract helper functions (e.g. faustpower2_f) ---
    const helperFnRegex = new RegExp(`static\\s+float\\s+${clsName}_(\\w+)\\s*\\(([^)]*)\\)\\s*\\{([^}]+)\\}`, 'g');
    const helperFns = [];
    while ((m = helperFnRegex.exec(cSource)) !== null) {
        helperFns.push({ fnName: m[1], params: m[2], body: m[3].trim() });
    }

    // --- 2b: Extract SIG structs, fill functions, and wave data arrays ---
    const sig0Structs = [];
    const sig0Tables = [];
    const sig0Fills = [];
    const sigWaveArrays = [];

    const sigWaveRegex = new RegExp(
        `static\\s+(float|int)\\s+([fi]${clsName}SIG\\d+Wave\\d+)\\s*\\[(\\d+)\\]\\s*=\\s*\\{([^}]+)\\}`,
        'g'
    );
    while ((m = sigWaveRegex.exec(cSource)) !== null) {
        const values = m[4].split(',').map(v => v.trim().replace(/f$/i, ''));
        sigWaveArrays.push({ name: m[2], size: parseInt(m[3]), values, isInt: m[1] === 'int' });
    }

    const sig0StructRegex = new RegExp(`typedef\\s+struct\\s*\\{([^}]+)\\}\\s*${clsName}SIG(\\d+)\\s*;`, 'g');
    while ((m = sig0StructRegex.exec(cSource)) !== null) {
        sig0Structs.push({ sigIndex: m[2], fields: m[1] });
    }

    const sig0TableRegex = new RegExp(`static\\s+(float|int)\\s+([fi]tbl\\d+${clsName}SIG\\d+)\\s*\\[(\\d+)\\]\\s*;`, 'g');
    while ((m = sig0TableRegex.exec(cSource)) !== null) {
        sig0Tables.push({ name: m[2], size: parseInt(m[3]), isInt: m[1] === 'int' });
    }

    const sig0FillRegex = new RegExp(
        `static\\s+void\\s+fill${clsName}SIG(\\d+)\\s*\\(${clsName}SIG\\d+\\*\\s*dsp,\\s*int\\s+count,\\s*(?:float|int)\\*\\s+table\\)\\s*\\{([\\s\\S]*?)^\\}`,
        'gm'
    );
    while ((m = sig0FillRegex.exec(cSource)) !== null) {
        sig0Fills.push({ sigIndex: m[1], body: m[2] });
    }

    const sig0InitRegex = new RegExp(
        `static\\s+void\\s+instanceInit${clsName}SIG(\\d+)\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`,
        'gm'
    );
    const sig0Inits = [];
    while ((m = sig0InitRegex.exec(cSource)) !== null) {
        sig0Inits.push({ sigIndex: m[1], body: m[2] });
    }

    // --- 2c: Extract main struct fields ---
    const structRegex = new RegExp(`typedef\\s+struct\\s*\\{([^{}]*)\\}\\s*${clsName}\\s*;`);
    const structMatch = cSource.match(structRegex);
    if (!structMatch) {
        console.error(`Could not find main struct for ${clsName}`);
        process.exit(1);
    }

    const structBody = structMatch[1];
    const fields = [];
    const fieldRegex = /\s*(FAUSTFLOAT|float|int)\s+(\w+)(?:\[(\d+)\])?\s*;/g;
    while ((m = fieldRegex.exec(structBody)) !== null) {
        if (m[2] === 'fSampleRate') continue;
        fields.push({ type: m[1], name: m[2], arraySize: m[3] ? parseInt(m[3]) : null });
    }

    // --- 2d: Extract instanceResetUserInterface (default values) ---
    const resetUIRegex = new RegExp(
        `void\\s+instanceResetUserInterface${clsName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`,
        'gm'
    );
    const resetUIMatch = resetUIRegex.exec(cSource);
    const defaults = {};
    if (resetUIMatch) {
        const defaultRegex = /dsp->(\w+)\s*=\s*\(FAUSTFLOAT\)\(?([\d.eE+-]+f?)\)?/g;
        while ((m = defaultRegex.exec(resetUIMatch[1])) !== null) {
            let val = m[2].replace(/f$/, '');
            val = parseFloat(val).toString();
            defaults[m[1]] = val;
        }
    }

    // --- 2e: Extract instanceClear ---
    const clearRegex = new RegExp(
        `void\\s+instanceClear${clsName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`,
        'gm'
    );
    const clearMatch = clearRegex.exec(cSource);
    const clearBody = clearMatch ? clearMatch[1] : '';

    // --- 2f: Extract instanceConstants ---
    const constRegex = new RegExp(
        `void\\s+instanceConstants${clsName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`,
        'gm'
    );
    const constMatch = constRegex.exec(cSource);
    const constBody = constMatch ? constMatch[1] : '';

    // --- 2g: Extract buildUserInterface ---
    const buildUIRegex = new RegExp(
        `void\\s+buildUserInterface${clsName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}`,
        'gm'
    );
    const buildUIMatch = buildUIRegex.exec(cSource);
    const buildUIBody = buildUIMatch ? buildUIMatch[1] : '';

    const uiParams = [];
    const declareRegex = /ui_interface->declare\([^,]+,\s*&dsp->(\w+),\s*"(\w+)",\s*"([^"]+)"\)/g;
    const midiMeta = {};
    while ((m = declareRegex.exec(buildUIBody)) !== null) {
        if (!midiMeta[m[1]]) midiMeta[m[1]] = {};
        midiMeta[m[1]][m[2]] = m[3];
    }

    const sliderRegex = /ui_interface->(?:add(?:Horizontal|Vertical)Slider|addNumEntry)\([^,]+,\s*"([^"]+)",\s*&dsp->(\w+),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?),\s*\(FAUSTFLOAT\)([\d.eE+-]+f?)\)/g;
    while ((m = sliderRegex.exec(buildUIBody)) !== null) {
        uiParams.push({
            name: m[1], field: m[2],
            init: parseFloat(m[3]), min: parseFloat(m[4]), max: parseFloat(m[5]), step: parseFloat(m[6]),
            midi: midiMeta[m[2]] || {}
        });
    }
    const buttonRegex = /ui_interface->addButton\([^,]+,\s*"([^"]+)",\s*&dsp->(\w+)\)/g;
    while ((m = buttonRegex.exec(buildUIBody)) !== null) {
        uiParams.push({
            name: m[1], field: m[2],
            init: 0, min: 0, max: 1, step: 1,
            isButton: true,
            midi: midiMeta[m[2]] || {}
        });
    }

    // --- 2h: Extract compute body ---
    const computeRegex = new RegExp(
        `void\\s+compute${clsName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)^\\}\\s*(?:#ifdef|$)`,
        'gm'
    );
    const computeMatch = computeRegex.exec(cSource);
    if (!computeMatch) {
        console.error(`Could not find compute function for ${clsName}`);
        process.exit(1);
    }
    const computeBody = computeMatch[1];

    const computeLines = computeBody.split('\n');
    const fSlowDecls = [];
    const loopBodyLines = [];
    const delayShiftLines = [];
    let inLoop = false;
    let loopBraceDepth = 0;
    let afterOutputAssignment = false;

    for (let i = 0; i < computeLines.length; i++) {
        const line = computeLines[i];
        const trimmed = line.trim();

        if (trimmed.startsWith('FAUSTFLOAT* output')) continue;

        if (!inLoop && (trimmed.startsWith('float fSlow') || trimmed.startsWith('int iSlow'))) {
            fSlowDecls.push(trimmed);
            continue;
        }

        if (!inLoop && trimmed.match(/for\s*\(\w+\s*=\s*0/)) {
            inLoop = true;
            loopBraceDepth = 0;
            continue;
        }

        if (inLoop) {
            for (const ch of trimmed) {
                if (ch === '{') loopBraceDepth++;
                if (ch === '}') loopBraceDepth--;
            }

            if (trimmed === '' || trimmed === '{' || trimmed === '}') continue;
            if (trimmed.startsWith('/*') || trimmed.startsWith('//')) continue;
            if (trimmed.match(/^int\s+[ij]\d+\s*;$/)) continue;
            if (trimmed.match(/^for\s*\(\s*[ij]\d+\s*=\s*0/)) continue;

            if (trimmed.match(/output[01]\[/)) {
                afterOutputAssignment = true;
                if (trimmed.match(/output0\[/)) {
                    loopBodyLines.push(trimmed);
                }
                continue;
            }

            if (afterOutputAssignment) {
                delayShiftLines.push(trimmed);
            } else {
                loopBodyLines.push(trimmed);
            }
        }
    }

    // === Determine global UI parameters ===

    // freq/gate/gain are standard Faust MIDI polyphony params — they stay per-voice
    const freqParam = uiParams.find(p => p.name === 'freq');
    const gateParam = uiParams.find(p => p.isButton && p.name === 'gate');
    const gainParam = uiParams.find(p => p.name === 'gain');

    // All other non-button UI params become global variables shared across voices
    const excludedFields = new Set([freqParam, gateParam, gainParam].filter(Boolean).map(p => p.field));
    const ccParams = uiParams.filter(p => !p.isButton && !excludedFields.has(p.field));

    // Safe CC range: 0-119 (CCs 120-127 are MIDI Channel Mode Messages)
    const MAX_SAFE_CC = 119;
    const RESERVED_CCS = new Set([7, 10, 64, 91]); // volume, pan, sustain, reverb
    let usableCCCount = 0;
    for (let i = 0; i <= MAX_SAFE_CC; i++) {
        if (!RESERVED_CCS.has(i)) usableCCCount++;
    }

    // If params exceed safe CC range, use NRPN addressing for all params
    const useNRPN = ccParams.length > usableCCCount;

    if (useNRPN) {
        // NRPN mode: assign sequential param indices
        for (let i = 0; i < ccParams.length; i++) {
            ccParams[i].nrpn = i;
        }
    } else {
        // Direct CC mode: sequential assignment, capped at MAX_SAFE_CC
        let ccIndex = 0;
        for (const p of ccParams) {
            while (ccIndex <= MAX_SAFE_CC && RESERVED_CCS.has(ccIndex)) ccIndex++;
            if (ccIndex > MAX_SAFE_CC) break;
            p.cc = ccIndex;
            ccIndex++;
        }
    }

    // Global variable prefix: lowercase DSP filename
    const globalPrefix = path.basename(inputDsp, '.dsp') + '_';

    // Map UI param fields → global variable names (except per-voice freq/gain/gate)
    const globalFields = new Map();
    for (const p of ccParams) {
        globalFields.set(p.field, globalPrefix + p.field);
    }

    // === Generate voice code sections ===

    const voiceCtx = {
        className: clsName,
        helperFns,
        sig0Tables,
        sigWaveArrays,
        tablePrefix: voiceTablePrefix,
        wavePrefix: voiceWavePrefix,
        globalFields,
    };

    // Voice wave data
    const voiceWaveData = [];
    for (const wave of sigWaveArrays) {
        const prefix = wave.isInt ? 'i' : 'f';
        const shortName = wave.name.replace(`${prefix}${clsName}`, voiceWavePrefix + '_wave_');
        const asType = wave.isInt ? 'i32' : 'f32';
        voiceWaveData.push(`const ${shortName}: StaticArray<${asType}> = StaticArray.fromArray<${asType}>([${wave.values.join(', ')}]);`);
    }

    // Voice SIG tables
    const voiceSigTables = [];
    for (const table of sig0Tables) {
        const shortName = voiceTablePrefix + table.name.replace(clsName, '');
        const asType = table.isInt ? 'i32' : 'f32';
        voiceSigTables.push(`const ${shortName}: StaticArray<${asType}> = new StaticArray<${asType}>(${table.size});`);
    }

    // Voice SIG init function
    const voiceSigInit = [];
    if (sig0Fills.length > 0) {
        voiceSigInit.push(`let ${voiceSigPrefix}_sig0_initialized: bool = false;`);
        voiceSigInit.push('');
        voiceSigInit.push(`function ${voiceSigPrefix}_initSIG0Tables(): void {`);
        voiceSigInit.push(`    if (${voiceSigPrefix}_sig0_initialized) return;`);
        voiceSigInit.push(`    ${voiceSigPrefix}_sig0_initialized = true;`);

        for (let idx = 0; idx < sig0Fills.length; idx++) {
            const fill = sig0Fills[idx];
            const table = sig0Tables[idx];
            const shortTableName = table
                ? voiceTablePrefix + table.name.replace(clsName, '')
                : `${voiceTablePrefix}ftbl${idx}SIG${fill.sigIndex}`;

            const sig0Struct = sig0Structs[idx];
            const sigFields = [];
            if (sig0Struct) {
                const sigFieldRegex = /\s*(int|float)\s+(\w+)(?:\[(\d+)\])?\s*;/g;
                let fm;
                while ((fm = sigFieldRegex.exec(sig0Struct.fields)) !== null) {
                    sigFields.push({ type: fm[1], name: fm[2], arraySize: fm[3] ? parseInt(fm[3]) : null });
                }

                for (const sf of sigFields) {
                    const asType = sf.type === 'float' ? 'f32' : 'i32';
                    if (sf.arraySize) {
                        voiceSigInit.push(`    const sig${fill.sigIndex}_${sf.name}: StaticArray<${asType}> = new StaticArray<${asType}>(${sf.arraySize});`);
                    } else {
                        voiceSigInit.push(`    let sig${fill.sigIndex}_${sf.name}: ${asType} = 0;`);
                    }
                }
            }

            const fillLines = transpileSig0Fill(fill.body, shortTableName, voiceCtx);
            for (let line of fillLines) {
                for (const sf of sigFields) {
                    line = line.replace(new RegExp(`\\b${sf.name}\\b`, 'g'), `sig${fill.sigIndex}_${sf.name}`);
                }
                voiceSigInit.push('    ' + line);
            }
        }
        voiceSigInit.push('}');
        voiceSigInit.push('');
    }

    // Voice helper functions
    const voiceHelpers = [];
    for (const h of helperFns) {
        const asParams = h.params.replace(/float\s+(\w+)/g, '$1: f32').replace(/int\s+(\w+)/g, '$1: i32');
        const asBody = transpileExpr(h.body, voiceCtx);
        voiceHelpers.push({ fnName: h.fnName, code: `function ${h.fnName}(${asParams}): f32 { ${asBody} }` });
    }

    // Voice class
    const voiceClass = [];

    voiceClass.push(`export class ${clsName} extends MidiVoice {`);

    for (const field of fields) {
        const isUI = field.type === 'FAUSTFLOAT';
        // Skip global UI params — they're emitted as module-level variables
        if (isUI && globalFields.has(field.name)) continue;
        if (field.arraySize) {
            const asType = (field.type === 'int') ? 'i32' : 'f32';
            voiceClass.push(`    private ${field.name}: StaticArray<${asType}> = new StaticArray<${asType}>(${field.arraySize});`);
        } else if (field.name === 'IOTA' || field.name.startsWith('IOTA')) {
            voiceClass.push(`    private ${field.name}: i32 = 0;`);
        } else if (isUI) {
            const def = defaults[field.name] || '0.0';
            voiceClass.push(`    private ${field.name}: f32 = ${def};`);
        } else {
            const asType = (field.type === 'int') ? 'i32' : 'f32';
            voiceClass.push(`    private ${field.name}: ${asType};`);
        }
    }

    voiceClass.push(`    private silentSamples: i32 = 0;`);
    voiceClass.push('');

    // Constructor
    voiceClass.push('    constructor(channel: MidiChannel) {');
    voiceClass.push('        super(channel);');
    if (sig0Fills.length > 0) {
        voiceClass.push(`        ${voiceSigPrefix}_initSIG0Tables();`);
    }
    voiceClass.push('        this.instanceConstants();');
    voiceClass.push('        this.instanceClear();');
    voiceClass.push('    }');
    voiceClass.push('');

    // instanceConstants
    voiceClass.push('    private instanceConstants(): void {');
    const constLines = transpileInstanceConstants(constBody, voiceCtx);
    for (const line of constLines) {
        voiceClass.push('        ' + line);
    }
    voiceClass.push('    }');
    voiceClass.push('');

    // instanceClear
    voiceClass.push('    private instanceClear(): void {');
    const clearLines = transpileInstanceClear(clearBody);
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
        // Force gate 0→1 transition so Faust envelope edge detection retriggers.
        // Without this, a sustained voice (noteoff never called due to sustain pedal)
        // would not retrigger because gate stays at 1.0 and the DSP sees no rising edge.
        voiceClass.push(`        this.${gateParam.field} = 0.0;`);
        voiceClass.push('        this.nextframe();');
        voiceClass.push(`        this.${gateParam.field} = 1.0;`);
    }
    voiceClass.push('        this.silentSamples = 0;');
    voiceClass.push('    }');
    voiceClass.push('');

    voiceClass.push('    noteoff(): void {');
    if (gateParam) {
        voiceClass.push(`        this.${gateParam.field} = 0.0;`);
    }
    voiceClass.push('    }');
    voiceClass.push('');

    voiceClass.push('    isDone(): boolean {');
    if (gateParam) {
        voiceClass.push(`        return this.${gateParam.field} == 0.0 && this.silentSamples > 4410;`);
    } else {
        voiceClass.push('        return this.silentSamples > 4410;');
    }
    voiceClass.push('    }');
    voiceClass.push('');

    // nextframe
    voiceClass.push('    nextframe(): void {');

    for (const decl of fSlowDecls) {
        const transpiled = transpileStatement(decl, voiceCtx);
        voiceClass.push('        ' + transpiled);
    }
    voiceClass.push('');

    for (const line of loopBodyLines) {
        let transpiled = transpileStatement(line, voiceCtx);

        if (transpiled.includes('__OUTPUT_ASSIGN__')) {
            const exprMatch = transpiled.match(/__OUTPUT_ASSIGN__\s*=\s*(.*);$/);
            if (exprMatch) {
                voiceClass.push(`        const output: f32 = ${exprMatch[1]};`);
            }
            continue;
        }

        voiceClass.push('        ' + transpiled);
    }

    voiceClass.push('');

    const delayLines = transpileDelayShifts(delayShiftLines, voiceCtx);
    for (const line of delayLines) {
        voiceClass.push('        ' + line);
    }

    voiceClass.push('');
    voiceClass.push('        if (Mathf.abs(output) < 0.00001) {');
    voiceClass.push('            this.silentSamples++;');
    voiceClass.push('        } else {');
    voiceClass.push('            this.silentSamples = 0;');
    voiceClass.push('        }');
    voiceClass.push('');
    voiceClass.push('        this.channel.signal.addMonoSignal(output, 0.5, 0.5);');
    voiceClass.push('    }');
    voiceClass.push('}');

    // === Generate global variable declarations for shared UI params ===
    const voiceGlobals = [];
    for (const p of ccParams) {
        const globalName = globalFields.get(p.field);
        const def = defaults[p.field] || '0.0';
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

    // Log CC/NRPN allocation stats
    if (ccParams.length > 0) {
        if (useNRPN) {
            console.log(`  ${ccParams.length} params mapped to NRPN (0–${ccParams.length - 1})`);
        } else {
            const mappedCount = ccParams.filter(p => p.cc !== undefined).length;
            console.log(`  ${mappedCount}/${ccParams.length} params mapped to MIDI CC (max CC ${MAX_SAFE_CC})`);
        }
    }

    // === Generate effect code sections ===

    const effectWaveData = [];
    const effectSigTables = [];
    const effectSigInit = [];
    const effectHelpers = [];
    const effectClass = [];

    if (hasEffect && effectCSource) {
        const eff = parseEffectC(effectCSource, effectClassName);

        const effectCtx = {
            className: effectClassName,
            helperFns: eff.helperFns,
            sig0Tables: eff.sig0Tables,
            sigWaveArrays: eff.sigWaveArrays,
            tablePrefix: effectTablePrefix,
            wavePrefix: effectWavePrefix,
        };

        // Effect wave data
        for (const wave of eff.sigWaveArrays) {
            const prefix = wave.isInt ? 'i' : 'f';
            const shortName = wave.name.replace(`${prefix}${effectClassName}`, effectWavePrefix + '_wave_');
            const asType = wave.isInt ? 'i32' : 'f32';
            effectWaveData.push(`const ${shortName}: StaticArray<${asType}> = StaticArray.fromArray<${asType}>([${wave.values.join(', ')}]);`);
        }

        // Effect SIG tables
        for (const table of eff.sig0Tables) {
            const shortName = effectTablePrefix + table.name.replace(effectClassName, '');
            const asType = table.isInt ? 'i32' : 'f32';
            effectSigTables.push(`const ${shortName}: StaticArray<${asType}> = new StaticArray<${asType}>(${table.size});`);
        }

        // Effect SIG init function
        if (eff.sig0Fills.length > 0) {
            effectSigInit.push(`let ${effectSigPrefix}_sig0_initialized: bool = false;`);
            effectSigInit.push('');
            effectSigInit.push(`function ${effectSigPrefix}_initSIG0Tables(): void {`);
            effectSigInit.push(`    if (${effectSigPrefix}_sig0_initialized) return;`);
            effectSigInit.push(`    ${effectSigPrefix}_sig0_initialized = true;`);

            for (let idx = 0; idx < eff.sig0Fills.length; idx++) {
                const fill = eff.sig0Fills[idx];
                const table = eff.sig0Tables[idx];
                const shortTableName = table
                    ? effectTablePrefix + table.name.replace(effectClassName, '')
                    : `${effectTablePrefix}ftbl${idx}SIG${fill.sigIndex}`;

                const sig0Struct = eff.sig0Structs[idx];
                const sigFields = [];
                if (sig0Struct) {
                    const sigFieldRegex = /\s*(int|float)\s+(\w+)(?:\[(\d+)\])?\s*;/g;
                    let fm;
                    while ((fm = sigFieldRegex.exec(sig0Struct.fields)) !== null) {
                        sigFields.push({ type: fm[1], name: fm[2], arraySize: fm[3] ? parseInt(fm[3]) : null });
                    }
                    for (const sf of sigFields) {
                        const asType = sf.type === 'float' ? 'f32' : 'i32';
                        if (sf.arraySize) {
                            effectSigInit.push(`    const sig${fill.sigIndex}_${sf.name}: StaticArray<${asType}> = new StaticArray<${asType}>(${sf.arraySize});`);
                        } else {
                            effectSigInit.push(`    let sig${fill.sigIndex}_${sf.name}: ${asType} = 0;`);
                        }
                    }
                }

                const fillLines = transpileSig0Fill(fill.body, shortTableName, effectCtx);
                for (let line of fillLines) {
                    for (const sf of sigFields) {
                        line = line.replace(new RegExp(`\\b${sf.name}\\b`, 'g'), `sig${fill.sigIndex}_${sf.name}`);
                    }
                    effectSigInit.push('    ' + line);
                }
            }
            effectSigInit.push('}');
            effectSigInit.push('');
        }

        // Effect helper functions
        for (const h of eff.helperFns) {
            const asParams = h.params.replace(/float\s+(\w+)/g, '$1: f32').replace(/int\s+(\w+)/g, '$1: i32');
            const asBody = transpileExpr(h.body, effectCtx);
            effectHelpers.push({ fnName: h.fnName, code: `function ${h.fnName}(${asParams}): f32 { ${asBody} }` });
        }

        // Effect MidiChannel subclass
        const channelClassName = clsName + 'Channel';
        effectClass.push(`export class ${channelClassName} extends MidiChannel {`);

        for (const field of eff.fields) {
            const isUI = field.type === 'FAUSTFLOAT';
            if (field.arraySize) {
                const asType = (field.type === 'int') ? 'i32' : 'f32';
                effectClass.push(`    private ${field.name}: StaticArray<${asType}> = new StaticArray<${asType}>(${field.arraySize});`);
            } else if (field.name === 'IOTA' || field.name.startsWith('IOTA')) {
                effectClass.push(`    private ${field.name}: i32 = 0;`);
            } else if (isUI) {
                const def = eff.defaults[field.name] || '0.0';
                effectClass.push(`    private ${field.name}: f32 = ${def};`);
            } else {
                const asType = (field.type === 'int') ? 'i32' : 'f32';
                effectClass.push(`    private ${field.name}: ${asType};`);
            }
        }
        effectClass.push('');

        // Constructor
        effectClass.push('    constructor(numvoices: i32, factoryFunc: (channel: MidiChannel, voiceindex: i32) => MidiVoice) {');
        effectClass.push('        super(numvoices, factoryFunc);');
        if (eff.sig0Fills.length > 0) {
            effectClass.push(`        ${effectSigPrefix}_initSIG0Tables();`);
        }
        effectClass.push('        this._effectInstanceConstants();');
        effectClass.push('        this._effectInstanceClear();');
        effectClass.push('    }');
        effectClass.push('');

        // _effectInstanceConstants
        effectClass.push('    private _effectInstanceConstants(): void {');
        const effConstLines = transpileInstanceConstants(eff.constBody, effectCtx);
        for (const line of effConstLines) {
            effectClass.push('        ' + line);
        }
        effectClass.push('    }');
        effectClass.push('');

        // _effectInstanceClear
        effectClass.push('    private _effectInstanceClear(): void {');
        const effClearLines = transpileInstanceClear(eff.clearBody);
        for (const line of effClearLines) {
            effectClass.push('        ' + line);
        }
        effectClass.push('    }');
        effectClass.push('');

        // preprocess()
        effectClass.push('    preprocess(): void {');

        for (const decl of eff.fSlowDecls) {
            let line = preprocessEffectInputs(decl, eff.numInputs);
            effectClass.push('        ' + transpileStatement(line, effectCtx));
        }
        if (eff.fSlowDecls.length > 0) effectClass.push('');

        for (const line of eff.loopBodyLines) {
            const preprocessed = preprocessEffectInputs(line, eff.numInputs);

            const out0Match = preprocessed.match(/^output0\[\w+\]\s*=\s*\(FAUSTFLOAT\)(.*);$/);
            if (out0Match) {
                const expr = transpileExpr(out0Match[1], effectCtx);
                effectClass.push(`        this.signal.left = ${expr};`);
                continue;
            }
            const out1Match = preprocessed.match(/^output1\[\w+\]\s*=\s*\(FAUSTFLOAT\)(.*);$/);
            if (out1Match) {
                const expr = transpileExpr(out1Match[1], effectCtx);
                effectClass.push(`        this.signal.right = ${expr};`);
                continue;
            }

            effectClass.push('        ' + transpileStatement(preprocessed, effectCtx));
        }
        effectClass.push('');

        const effDelayLines = transpileDelayShifts(eff.delayShiftLines, effectCtx);
        for (const line of effDelayLines) {
            effectClass.push('        ' + line);
        }

        effectClass.push('    }');

        // controlchange() — merge effect CC mappings + voice global CC mappings
        const ccMappings = [];
        for (const param of eff.uiParams) {
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
            // NRPN mode: effect CC mappings via direct switch, voice params via NRPN state machine
            // Warn if effect CCs conflict with NRPN control CCs
            for (const cc of ccMappings) {
                if (cc.cc === 6 || cc.cc === 98 || cc.cc === 99) {
                    console.warn(`  WARNING: Effect CC ${cc.cc} conflicts with NRPN control CC`);
                }
            }
            effectClass.push('');
            effectClass.push('    private _nrpnMsb: u8 = 127;');
            effectClass.push('    private _nrpnLsb: u8 = 127;');
            effectClass.push('');
            effectClass.push('    controlchange(controller: u8, value: u8): void {');
            effectClass.push('        super.controlchange(controller, value);');
            effectClass.push('        switch (controller) {');
            // Effect's own direct CC mappings (from Faust [midi:ctrl N] metadata)
            for (const cc of ccMappings) {
                effectClass.push(`            case ${cc.cc}:`);
                effectClass.push(`                this.${cc.field} = ${cc.min} + (<f32>value / 127.0) * ${cc.max - cc.min};`);
                effectClass.push('                break;');
            }
            // NRPN state machine CCs
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
            // Direct CC mode
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

    // === Generate channel class for voice CC params (no-effect case) ===
    const voiceChannelClass = [];
    const voiceCCParams = ccParams.filter(p => p.cc !== undefined);
    if (!hasEffect && (voiceCCParams.length > 0 || (useNRPN && ccParams.length > 0))) {
        const channelClassName = clsName + 'Channel';
        if (useNRPN) {
            // NRPN mode: state machine for CC 99/98/6 sequence
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
            // Direct CC mode
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
    try { fs.unlinkSync(tmpCFile); } catch (e) {}
    if (tmpEffectCFile) {
        try { fs.unlinkSync(tmpEffectCFile); } catch (e) {}
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
        externalFunctions, // Map<fnName, { tableName, points, nPoints }>
        uiParams, // Array of { name, field, init, min, max, step, isButton?, midi }
        voice: {
            globals: voiceGlobals,
            waveData: voiceWaveData,
            sigTables: voiceSigTables,
            sigInit: voiceSigInit,
            helpers: voiceHelpers,
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

/**
 * Generate the _setParam() method body for NRPN channel classes.
 * Maps NRPN param indices to global variable assignments.
 */
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

/**
 * Generate NRPN default CC sequences for initializeMidiSynth.
 * Each param requires 3 CC sends: CC 99 (MSB), CC 98 (LSB), CC 6 (value).
 */
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

    // Header
    out.push(`// Faust-generated ${result.className}`);
    out.push(`// Auto-transpiled from Faust DSP by faust2as.js`);
    out.push(`// Source: ${result.sourceFile}`);
    out.push('');

    // Imports
    out.push("import { notefreq, midichannels, MidiChannel, MidiVoice } from '../mixes/globalimports';");
    out.push("import { SAMPLERATE } from '../environment';");
    out.push('');

    // Generic cast helpers — avoid AS contextual typing issues with <f32>/<i32>
    out.push('@inline function _fcast<T>(x: T): f32 { return <f32>x; }');
    out.push('@inline function _icast<T>(x: T): i32 { return <i32>x; }');
    out.push('');

    // External lookup table functions (from ffunction headers like piano.h)
    if (result.externalFunctions.size > 0) {
        const emittedTables = new Set();
        for (const [fnName, info] of result.externalFunctions) {
            const lines = generateLookupTableAS(fnName, info, '');
            for (const line of lines) {
                // Deduplicate: avoid emitting same table data array twice if shared
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
        // Effect wave data
        out.push(...result.effect.waveData);
        if (result.effect.waveData.length > 0) out.push('');

        // Effect SIG tables + init
        out.push(...result.effect.sigTables);
        out.push(...result.effect.sigInit);

        // Effect helpers (deduplicated against voice helpers)
        const voiceHelperNames = new Set(result.voice.helpers.map(h => h.fnName));
        const uniqueEffectHelpers = result.effect.helpers.filter(h => !voiceHelperNames.has(h.fnName));
        for (const h of uniqueEffectHelpers) out.push(h.code);
        if (uniqueEffectHelpers.length > 0) out.push('');

        // Effect channel class (includes voice CC handling)
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

    // Emit defaults for tweakable DSP parameters
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

    // Header
    out.push('// Faust-generated synth bundle');
    out.push('// Auto-transpiled from Faust DSP by faust2as.js');
    out.push(`// Sources: ${results.map(r => r.sourceFile).join(', ')}`);
    out.push('');

    // Bundle imports
    out.push("import { notefreq, midichannels, MidiChannel, MidiVoice } from '../mixes/globalimports';");
    out.push("import { SAMPLERATE } from '../environment';");
    out.push('');

    // Generic cast helpers — avoid AS contextual typing issues with <f32>/<i32>
    out.push('@inline function _fcast<T>(x: T): f32 { return <f32>x; }');
    out.push('@inline function _icast<T>(x: T): i32 { return <i32>x; }');
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

    // Deduplicated external lookup table functions (ffunction headers)
    const emittedExternalFns = new Set();
    const emittedExternalTables = new Set();
    for (const r of results) {
        if (r.externalFunctions.size > 0) {
            for (const [fnName, info] of r.externalFunctions) {
                if (emittedExternalFns.has(fnName)) continue;
                emittedExternalFns.add(fnName);
                const prefix = r.className + '_';
                const lines = generateLookupTableAS(fnName, info, prefix);
                for (const line of lines) {
                    if (line.startsWith('const ') && emittedExternalTables.has(line)) continue;
                    if (line.startsWith('const ')) emittedExternalTables.add(line);
                    out.push(line);
                }
            }
        }
    }
    if (emittedExternalFns.size > 0) out.push('');

    // Per-DSP: globals, wave data, SIG tables, SIG init, classes
    for (const r of results) {
        // Global variables for shared DSP parameters
        if (r.voice.globals.length > 0) {
            out.push(...r.voice.globals);
            out.push('');
        }

        // Voice wave data
        out.push(...r.voice.waveData);
        if (r.voice.waveData.length > 0) out.push('');

        // Voice SIG tables + init
        out.push(...r.voice.sigTables);
        out.push(...r.voice.sigInit);

        // Voice class
        out.push(...r.voice.classCode);
        out.push('');

        // Voice channel class (no-effect case with CC params)
        if (r.voice.channelClass.length > 0) {
            out.push(...r.voice.channelClass);
            out.push('');
        }

        // Effect sections
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

        // Emit defaults for tweakable DSP parameters
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
