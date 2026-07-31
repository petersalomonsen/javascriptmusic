// faust-diagnostics.js — render the faust-rs diagnostics-v2 payload.
//
// The compiler module retains a complete structured report for every compile
// failure (see faust-rs docs/faust-error-model-en.md). This module turns that
// payload into two views:
//
//   formatDiagnosticsForHumans(payload, sourceText)
//     — a short terminal/editor rendering: location header, source line with
//       carets, first help line. (The "concise" level of the error model.)
//
//   formatDiagnosticsForAgent(payload, sourceText)
//     — a complete plain-text projection for an LLM writing Faust code:
//       stable code, category/stage, every label with its source line, typed
//       facts as data, fixes with applicability, notes and help — plus the
//       category-based guidance from the error model's agent contract
//       ("branch on category first, fix the first error, re-check").
//
// Both work from typed fields only; the free-form `message`/`notes`/`help`
// strings are displayed but never parsed. Unknown fields are ignored and
// missing ones degrade gracefully, per the schema's compatibility rules.

function sourceLines(sourceText) {
    return typeof sourceText === 'string' ? sourceText.split('\n') : null;
}

// One "  3 | process = ..." block with a caret line, from a label's
// compatibility_span. Returns [] when the span or the source line is missing.
function sourceExcerpt(label, lines) {
    const span = label && label.compatibility_span;
    if (!span || !lines || !span.line || span.line < 1 || span.line > lines.length) return [];
    const text = lines[span.line - 1];
    const gutter = String(span.line);
    const col = Math.max(1, span.col || 1);
    const endCol = span.end_line === span.line && span.end_col > col ? span.end_col : col + 1;
    const caretCount = Math.max(1, endCol - col);
    const out = [`  ${gutter} | ${text}`];
    const caretLine = ' '.repeat(gutter.length + 3) + '| ' + ' '.repeat(col - 1) + '^'.repeat(caretCount);
    out.push(label.message ? `${caretLine} ${label.message}` : caretLine);
    return out;
}

function primaryLabel(diagnostic) {
    const labels = diagnostic.labels || [];
    return labels.find(l => l.style === 'primary') || labels[0] || null;
}

function locationHeader(diagnostic) {
    const span = primaryLabel(diagnostic)?.compatibility_span;
    const where = span ? `${span.file}:${span.line}:${span.col}: ` : '';
    const code = diagnostic.code ? ` [${diagnostic.code}]` : '';
    return `${where}${diagnostic.severity || 'error'}${code} ${diagnostic.message || ''}`.trimEnd();
}

// Renders one typed fact value compactly; long lists are elided.
function factValue(fact) {
    if (fact == null) return 'null';
    let value = fact.value !== undefined ? fact.value : fact;
    if (Array.isArray(value) && value.length > 12) {
        return JSON.stringify(value.slice(0, 12)).replace(/\]$/, `,"…+${value.length - 12}"]`);
    }
    return JSON.stringify(value);
}

// Internal IR previews and scope dumps: kept in the JSON payload for tools,
// but dropped from the agent text — the same data travels as typed facts and
// the previews are debug-verbosity material.
function isNoiseNote(note) {
    return /^(node_id=|box_expr=|expr=|scope\.)/.test(note);
}

// One source excerpt per distinct source line, with every label's caret line
// under it (three labels on one line must not repeat the line three times).
function groupedExcerpts(labels, lines) {
    const out = [];
    const seen = new Map();
    for (const label of labels || []) {
        const span = label.compatibility_span;
        if (!span || !lines || !span.line || span.line < 1 || span.line > lines.length) {
            if (span) out.push(`  at ${span.file}:${span.line}:${span.col} — ${label.message || label.role || ''}`);
            continue;
        }
        const key = `${span.file}:${span.line}`;
        const excerpt = sourceExcerpt(label, lines);
        if (seen.has(key)) {
            seen.get(key).push(excerpt[1]);
        } else {
            const block = [...excerpt];
            seen.set(key, block);
            out.push(block);
        }
    }
    return out.flat();
}

export function formatDiagnosticsForHumans(payload, sourceText) {
    const diagnostics = payload?.diagnostics || [];
    if (diagnostics.length === 0) return '';
    const lines = sourceLines(sourceText);
    const out = [];
    for (const d of diagnostics) {
        out.push(locationHeader(d));
        out.push(...sourceExcerpt(primaryLabel(d), lines));
        const help = (d.help || [])[0];
        if (help) out.push(`  = help: ${help}`);
    }
    return out.join('\n');
}

export function formatDiagnosticsForAgent(payload, sourceText) {
    const diagnostics = payload?.diagnostics || [];
    if (diagnostics.length === 0) return '';
    const lines = sourceLines(sourceText);
    const out = [];

    diagnostics.forEach((d, i) => {
        if (i > 0) out.push('');
        out.push(locationHeader(d));
        out.push(`  category: ${d.category || 'unknown'} | stage: ${d.stage || 'unknown'}`);
        out.push(...groupedExcerpts(d.labels, lines));
        const facts = d.facts || {};
        const factKeys = Object.keys(facts);
        if (factKeys.length > 0) {
            out.push('  facts: ' + factKeys.map(k => `${k}=${factValue(facts[k])}`).join('; '));
        }
        for (const fix of d.fixes || []) {
            out.push(`  fix (${fix.applicability || 'manual'}): ${fix.title}`);
            if (fix.explanation) out.push(`    ${fix.explanation}`);
        }
        for (const note of d.notes || []) {
            if (!isNoiseNote(note)) out.push(`  note: ${note}`);
        }
        for (const help of d.help || []) out.push(`  help: ${help}`);
    });

    // Category-based guidance (error model §5: branch on category first).
    const category = diagnostics[0].category;
    const guidance = {
        user_code: 'the Faust source is wrong — edit the DSP at the labeled location',
        unsupported_feature: 'valid Faust that this backend/option path cannot lower — change options or rewrite the construct, the DSP syntax itself is not at fault',
        invalid_options: 'the compiler invocation is inconsistent — fix the options, not the DSP',
        environment: 'a file or import is missing — fix paths/imports, the DSP may be correct',
        cancelled: 'compilation was cancelled — retry',
        compiler_bug: 'internal compiler error — do not edit the DSP to work around it; report it',
    }[category];
    if (guidance) out.push('', `Guidance: category=${category} → ${guidance}.`);
    if (diagnostics.length > 1) {
        out.push('Later diagnostics are often consequences of the first: fix the first error, then re-check.');
    }
    return out.join('\n');
}
