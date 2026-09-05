// Helpers available to an agent script (the `run_script` tool) — the DATA view
// of a song's note rows.
//
// The song DSL's note functions (`f7(0.56, 79)`) return closures for the
// sequencer to call, so a script cannot read a pitch or a velocity back out of
// one. Recorded takes, and every `.play([...])` block, are written in ONE fixed
// row form — `[ beat, name(duration, velocity) ]`, straight from
// midisequencer/recording.js — so this module parses that text into plain
// objects, and formats the objects back into the same text.
//
// PURE and IMPORT-FREE on purpose: the file is loaded into the QuickJS guest as
// source text (exports stripped, see script-sandbox.js) AND imported by Node for
// its unit tests, so nothing here may touch a host API.

const NOTE_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];

// MIDI note number -> the DSL's name ('c5' is 60, as in the sequencer).
export const noteName = (n) => NOTE_NAMES[((n % 12) + 12) % 12] + Math.floor(n / 12);

// DSL name -> MIDI note number, or null when it is not a note name.
export function noteNumber(name) {
    const m = /^([a-g])(s?)(\d{1,2})$/.exec(String(name || '').trim());
    if (!m) return null;
    const idx = NOTE_NAMES.indexOf(m[1] + m[2]);
    if (idx < 0) return null;
    return Number(m[3]) * 12 + idx;
}

// Snap a beat position to a grid: `pct` < 1 moves it only part of the way,
// like the DSL's own `.quantize(stepsPerBeat, pct)`.
export function quantizeBeat(beat, stepsPerBeat, pct = 1) {
    const scaled = beat * stepsPerBeat;
    const diff = (scaled - Math.round(scaled)) * pct;
    return (scaled - diff) / stepsPerBeat;
}

const NOTE_ROW = /\[\s*(-?\d+(?:\.\d+)?)\s*,([^\[\]]*)\]/g;
const NOTE_COL = /\b([a-g]s?\d{1,2})\b(?:\s*\(([^()]*)\))?/g;
const CC_COL = /controlchange\s*\(([^()]*)\)/g;

const numOrNull = (s) => {
    if (s === undefined || s === null) return null;
    const t = String(s).trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
};

// Every note (and control change) row in a piece of song text, in source
// order. A row holding several notes — a chord — yields one object per note,
// all at the same beat. Notes written bare (`c4`) have null duration/velocity.
//   [{ beat, note, name, duration, velocity }]  or  { beat, cc, value }
export function parseNotes(text) {
    const notes = [];
    for (const row of String(text || '').matchAll(NOTE_ROW)) {
        const beat = Number(row[1]);
        const cols = row[2];
        for (const cc of cols.matchAll(CC_COL)) {
            const [controller, value] = cc[1].split(',').map(numOrNull);
            notes.push({ beat, cc: controller, value });
        }
        // Control changes are removed before the note scan so a CC's own
        // arguments are never read as a note.
        for (const m of cols.replace(CC_COL, '').matchAll(NOTE_COL)) {
            const note = noteNumber(m[1]);
            if (note === null) continue;
            const args = m[2] === undefined ? [] : m[2].split(',');
            notes.push({
                beat,
                note,
                name: m[1],
                duration: numOrNull(args[0]),
                velocity: numOrNull(args[1]),
            });
        }
    }
    return notes;
}

const fmt = (n) => Number(n).toFixed(2);

function noteText(n) {
    const name = n.name !== undefined && noteNumber(n.name) === n.note ? n.name : noteName(n.note);
    if (n.duration === null || n.duration === undefined) return name;
    const vel = n.velocity === null || n.velocity === undefined ? '' : `, ${Math.round(n.velocity)}`;
    return `${name}(${fmt(n.duration)}${vel})`;
}

const colText = (n) => (n.cc !== undefined ? `controlchange(${n.cc}, ${n.value})` : noteText(n));

// Objects back to DSL rows — the recorder's own format, so a rewritten take
// reads like a recorded one. `chords: true` puts notes that share a beat on
// one row; `indent` prefixes every row after the first.
//   "[ 0.60, f7(0.56, 79) ],\n[ 1.03, e7(0.47, 89) ]"
export function formatNotes(notes, { indent = '', chords = false } = {}) {
    const rows = [];
    for (const n of notes) {
        const last = rows[rows.length - 1];
        if (chords && last && last.beat === n.beat && n.cc === undefined) last.cols.push(colText(n));
        else rows.push({ beat: n.beat, cols: [colText(n)] });
    }
    return rows.map((r) => `[ ${fmt(r.beat)}, ${r.cols.join(', ')} ]`).join(`,\n${indent}`);
}

// Closing index of the bracket run opening at `openIdx`, skipping nested
// brackets and string contents; -1 when unbalanced.
function matchBracket(src, openIdx) {
    let depth = 0;
    for (let i = openIdx; i < src.length; i++) {
        const ch = src[i];
        if (ch === '"' || ch === "'" || ch === '`') {
            i++;
            while (i < src.length && src[i] !== ch) i += src[i] === '\\' ? 2 : 1;
        } else if (ch === '[' || ch === '(' || ch === '{') {
            depth++;
        } else if (ch === ']' || ch === ')' || ch === '}') {
            if (--depth === 0) return i;
        }
    }
    return -1;
}

// Every `<track>.play( ... )` call in the text with the character range it
// occupies, so a script can splice a rewritten block back into the document:
//   { track, start, end, text, inner, notes }
// `start`/`end` bracket the whole call (`createTrack(4).play([...])`), `inner`
// is what sits between `play(` and its closing `)` — including any chained
// `.quantize(4)` — and `notes` is parseNotes(inner).
export function findPlayBlocks(text) {
    const src = String(text || '');
    const blocks = [];
    const re = /([A-Za-z_$][\w$]*(?:\s*\(\s*[^()]*\))?)\s*\.play\s*\(/g;
    for (const m of src.matchAll(re)) {
        const open = m.index + m[0].length - 1;
        const close = matchBracket(src, open);
        if (close === -1) continue;
        const inner = src.slice(open + 1, close);
        blocks.push({
            track: m[1].replace(/\s+/g, ''),
            start: m.index,
            end: close + 1,
            text: src.slice(m.index, close + 1),
            inner,
            notes: parseNotes(inner),
        });
        re.lastIndex = close + 1;
    }
    return blocks;
}

// Notes that start together, as played: consecutive notes whose beats fall
// within `tolerance` of the group's first note form one group. A group of
// two or more is a chord; a group of one is a melody note. Input is sorted by
// beat first, so row order in the take does not matter.
export function groupByBeat(notes, tolerance = 0.1) {
    const sorted = [...notes].filter((n) => n.cc === undefined).sort((a, b) => a.beat - b.beat);
    const groups = [];
    for (const n of sorted) {
        const g = groups[groups.length - 1];
        if (g && n.beat - g[0].beat <= tolerance) g.push(n);
        else groups.push([n]);
    }
    return groups;
}
