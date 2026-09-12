// Wiring the Mastering chain into a synth document, and reading it back.
//
// Pure text transforms over synth.ts, shared by the in-app auto_master tool,
// the headless bench and the tests. The chain's parameters live in ONE marked
// block inside initializeMidiSynth() so repeated runs replace rather than
// accumulate, and so a human (or the mastering specialist) can see and edit
// every value in the document itself — there is no hidden state.

export const MASTERING_FIELDS = [
    'gainDb', 'highpassHz', 'tiltDb', 'lowMonoHz', 'lowCrossoverHz', 'highCrossoverHz',
    'lowThresholdDb', 'midThresholdDb', 'highThresholdDb', 'compRatio', 'compAttackMs', 'compReleaseMs',
    'compMakeupDb', 'limiterCeilingDb', 'limiterReleaseMs', 'bypass',
];

// Defaults of fx/mastering.dsp, so a report can say which fields were changed.
export const MASTERING_DEFAULTS = {
    gainDb: 0, highpassHz: 25, tiltDb: 0, lowMonoHz: 0, lowCrossoverHz: 150, highCrossoverHz: 3000,
    lowThresholdDb: -18, midThresholdDb: -18, highThresholdDb: -18, compRatio: 2, compAttackMs: 15, compReleaseMs: 150,
    compMakeupDb: 0, limiterCeilingDb: -1.2, limiterReleaseMs: 80, bypass: 0,
};

export const BLOCK_START = '    // --- mastering: set by auto_master / the mastering specialist (probe_mix measures the result) ---';
export const BLOCK_END = '    // --- end mastering ---';

const IMPORT_LINE = "import { Mastering } from '../mixes/globalimports';";
const FIELD_RE = MASTERING_FIELDS.join('|');

/** The Mastering instance in a synth source: its variable name and the field values assigned to it. */
export function readMasteringParams(source) {
    const src = String(source || '');
    const m = /(?:const|let|var)\s+(\w+)\s*(?::\s*Mastering)?\s*=\s*new\s+Mastering\s*\(\s*\)/.exec(src);
    if (!m) return { present: false, instance: null, params: {}, wired: false };
    const instance = m[1];
    const params = {};
    const re = new RegExp(`\\b${instance}\\.(${FIELD_RE})\\s*=\\s*(-?[\\d.]+)\\s*;`, 'g');
    for (const hit of src.matchAll(re)) params[hit[1]] = Number(hit[2]);
    const wired = new RegExp(`\\b${instance}\\.(processOutputline\\s*\\(|process\\s*\\()`).test(src);
    return { present: true, instance, params, wired };
}

function formatValue(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new Error(`mastering parameter is not a number: ${v}`);
    // AssemblyScript infers the literal; keep one decimal so 3 reads as a level, not a count
    return Number.isInteger(n) ? `${n}.0` : String(Math.round(n * 1000) / 1000);
}

/** Index of the `}` closing the function whose `{` is at `open`, or -1. */
function matchBrace(src, open) {
    let depth = 0;
    for (let i = open; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}' && --depth === 0) return i;
    }
    return -1;
}

/**
 * Return the synth source with the Mastering chain wired in and `params` set.
 * Idempotent: an existing import/instance/postprocess call is reused, the
 * parameter block is replaced, stray assignments to the same fields are
 * removed. Fields not in `params` keep the DSP defaults (they are not written).
 */
export function wireMastering(source, params = {}) {
    let src = String(source || '');
    const changed = [];
    for (const k of Object.keys(params)) {
        if (!MASTERING_FIELDS.includes(k)) throw new Error(`unknown Mastering field "${k}"`);
    }
    let { present, instance } = readMasteringParams(src);
    if (!present) {
        instance = 'mastering';
        // the import may already be there as part of a wider import list
        const hasImport = /import\s*\{[^}]*\bMastering\b[^}]*\}\s*from\s*['"][^'"]*globalimports['"]/.test(src);
        src = `${hasImport ? '' : IMPORT_LINE + '\n'}const mastering = new Mastering();\n` + src;
        changed.push('added the Mastering import and instance');
    }
    // drop the old block and any loose assignments, then write one block
    const blockRe = new RegExp(`\\n?${escapeRe(BLOCK_START)}[\\s\\S]*?${escapeRe(BLOCK_END)}\\n?`);
    if (blockRe.test(src)) src = src.replace(blockRe, '\n');
    const looseRe = new RegExp(`^[ \\t]*${instance}\\.(?:${FIELD_RE})\\s*=\\s*-?[\\d.]+\\s*;[^\\n]*\\n`, 'gm');
    src = src.replace(looseRe, '');
    const init = /export\s+function\s+initializeMidiSynth\s*\(\s*\)\s*:\s*void\s*\{/.exec(src);
    if (!init) throw new Error('synth.ts has no `export function initializeMidiSynth(): void {` to put the mastering settings in');
    const lines = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `    ${instance}.${k} = ${formatValue(v)};`);
    const block = [BLOCK_START, ...lines, BLOCK_END].join('\n');
    const at = init.index + init[0].length;
    src = `${src.slice(0, at)}\n${block}${src.slice(at)}`;
    changed.push(`set ${lines.length} mastering field(s)`);
    // the master insert call, last in postprocess()
    const callRe = new RegExp(`\\b${instance}\\.(processOutputline\\s*\\(|process\\s*\\()`);
    if (!callRe.test(src)) {
        const pp = /export\s+function\s+postprocess\s*\(\s*\)\s*:\s*void\s*\{/.exec(src);
        if (pp) {
            const open = pp.index + pp[0].length - 1;
            const close = matchBrace(src, open);
            if (close < 0) throw new Error('postprocess() has no closing brace');
            const body = src.slice(open + 1, close);
            const newBody = body.trim() ? `${body.replace(/\s*$/, '')}\n    ${instance}.processOutputline();\n` : `\n    ${instance}.processOutputline();\n`;
            src = `${src.slice(0, open + 1)}${newBody}${src.slice(close)}`;
        } else {
            src = `${src.replace(/\s*$/, '')}\n\nexport function postprocess(): void {\n    ${instance}.processOutputline();\n}\n`;
        }
        changed.push('added the processOutputline() call to postprocess()');
    }
    return { source: src, instance, changed };
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** `gainDb 3.0, limiterCeilingDb -1.5` — the fields that differ from the DSP defaults. */
export function describeParams(params = {}) {
    const parts = Object.entries(params)
        .filter(([k, v]) => v !== undefined && Number(v) !== MASTERING_DEFAULTS[k])
        .map(([k, v]) => `${k} ${Number(v)}`);
    return parts.length ? parts.join(', ') : '(all defaults)';
}
