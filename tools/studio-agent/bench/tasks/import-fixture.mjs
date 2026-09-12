#!/usr/bin/env node
// Vendor a project state (song.js, synth.ts, faust/*.dsp) from a git repo at a
// commit into bench/tasks/fixtures/<name>/, so a task's starting point — and,
// with `--after <commit>`, the human-approved result it was compared against —
// is reproducible without network access.
//
//   node import-fixture.mjs <repo-dir> <commit> <name> [--after <commit>]

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [repo, commit, name, ...rest] = process.argv.slice(2);
if (!repo || !commit || !name) {
  console.error('usage: node import-fixture.mjs <repo-dir> <commit> <name> [--after <commit>]');
  process.exit(2);
}
const after = rest[0] === '--after' ? rest[1] : null;
const git = (...args) => execFileSync('git', ['-C', repo, ...args], { maxBuffer: 1 << 26 }).toString();

function snapshot(ref, dest) {
  fs.mkdirSync(path.join(dest, 'faust'), { recursive: true });
  for (const file of ['song.js', 'synth.ts', 'shader.glsl']) {
    try { fs.writeFileSync(path.join(dest, file), git('show', `${ref}:${file}`)); } catch { /* absent at this ref */ }
  }
  const dsp = git('ls-tree', '--name-only', ref, 'faust/').split('\n').filter((f) => f.endsWith('.dsp'));
  for (const f of dsp) fs.writeFileSync(path.join(dest, f), git('show', `${ref}:${f}`));
  fs.writeFileSync(path.join(dest, 'ORIGIN'), `${git('config', '--get', 'remote.origin.url').trim()}\n${ref} ${git('log', '-1', '--format=%H %s', ref).trim()}\n`);
  return dsp.length;
}

const dest = path.join(__dirname, 'fixtures', name);
const n = snapshot(commit, dest);
console.log(`${name}: ${commit} → ${path.relative(process.cwd(), dest)} (${n} .dsp)`);
if (after) {
  const m = snapshot(after, path.join(dest, 'after'));
  console.log(`${name}/after: ${after} (${m} .dsp)`);
}
