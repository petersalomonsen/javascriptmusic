// Pure, browser-free logic behind the studio-agent tools, split out so it can be
// unit-tested in Node. The browser client (studio-agent-client.js) wraps these
// for CodeMirror editors / OPFS.

// Surgical find-and-replace (mirrors the Edit tool). Returns { text, count } on
// success or { error } on failure.
export function applyEditToText(cur, { old_string, new_string, replace_all }) {
  if (old_string === new_string) return { error: 'old_string and new_string are identical' };
  const count = old_string ? cur.split(old_string).length - 1 : 0;
  if (count === 0) return { error: 'old_string not found in the document' };
  if (count > 1 && !replace_all) return { error: `old_string is not unique (${count} matches); add more surrounding context or set replace_all` };
  const text = replace_all ? cur.split(old_string).join(new_string) : cur.replace(old_string, new_string);
  return { text, count: replace_all ? count : 1 };
}

// Regex-grep over text. Returns "line: content" lines (with optional context),
// capped at 120 output lines, or { error } on a bad pattern.
export function grepText(text, { pattern, context = 0 }) {
  let re;
  try { re = new RegExp(pattern, 'i'); } catch (e) { return { error: `bad regex: ${e.message}` }; }
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length && out.length < 120; i++) {
    if (re.test(lines[i])) {
      for (let j = Math.max(0, i - context); j <= Math.min(lines.length - 1, i + context); j++) {
        out.push(`${j + 1}: ${lines[j].slice(0, 200)}`);
      }
    }
  }
  return out.length ? out.join('\n') : '(no matches)';
}

// Normalize a faust path to a repo-relative .dsp filename.
export function normDsp(path) {
  let rel = String(path || '').replace(/^faust\//, '');
  if (!rel.endsWith('.dsp')) rel += '.dsp';
  return rel;
}

// Build the write_faust success hint from a transpiled .ts: which classes to
// import and how to register the channel. Uses the base MidiChannel when no
// <Name>Channel was generated (fixes the recurring "no exported member" error).
export function faustRegistrationHint(ts, stem) {
  const classes = [...ts.matchAll(/export class (\w+)/g)].map((m) => m[1]);
  const voice = classes.find((c) => !/Channel$/.test(c)) || 'Xxx';
  const chan = classes.find((c) => /Channel$/.test(c));
  const reg = chan
    ? `midichannels[N] = new ${chan}(8, (channel: MidiChannel) => new ${voice}(channel));`
    : `midichannels[N] = new MidiChannel(8, (channel: MidiChannel) => new ${voice}(channel));   // no ${voice}Channel was generated — use the base MidiChannel`;
  const message =
    `transpiled OK → faust/${stem}.ts exports: ${classes.join(', ') || '(none)'}. ` +
    `In synth.ts: import { ${classes.join(', ')} } from '../faust/${stem}';  (import ONLY these exact names) ` +
    `then ${reg}`;
  return { classes, voice, chan, message };
}
