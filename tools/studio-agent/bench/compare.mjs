#!/usr/bin/env node
// Side-by-side table of bench result directories (each holding a summary.json
// written by run.mjs): one column per arm, one row per task, cells "passed/runs"
// with median seconds — so a prompt version or a model can be compared at a
// glance. Cost and questions asked follow in a second table.
//
//   node bench/compare.mjs bench/results/haiku-x3 bench/results/sonnet-x1 [more dirs…]
//   node bench/compare.mjs                          # every results/*/summary.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let dirs = process.argv.slice(2);
if (!dirs.length) {
  const root = path.join(__dirname, 'results');
  dirs = fs.readdirSync(root).map((d) => path.join(root, d)).filter((d) => fs.existsSync(path.join(d, 'summary.json')));
}
const arms = dirs.map((d) => {
  const s = JSON.parse(fs.readFileSync(path.join(d, 'summary.json'), 'utf8'));
  const label = `${path.basename(d)}`;
  return { label, arm: s.arm, promptRef: s.promptRef, byTask: Object.fromEntries(s.summary.map((t) => [t.task, t])) };
});
const tasks = [...new Set(arms.flatMap((a) => Object.keys(a.byTask)))];
const w = Math.max(14, ...tasks.map((t) => t.length)) + 2;
const cw = Math.max(16, ...arms.map((a) => a.label.length)) + 2;

console.log('pass/runs · median s'.padEnd(w) + arms.map((a) => a.label.padStart(cw)).join(''));
for (const t of tasks) {
  console.log(t.padEnd(w) + arms.map((a) => {
    const s = a.byTask[t];
    return (s ? `${s.passed}/${s.runs} · ${s.medianSecs.toFixed(0)}s` : '-').padStart(cw);
  }).join(''));
}
console.log('');
console.log('cost $ · asked'.padEnd(w) + arms.map((a) => a.label.padStart(cw)).join(''));
for (const t of tasks) {
  console.log(t.padEnd(w) + arms.map((a) => {
    const s = a.byTask[t];
    return (s ? `${s.meanCostUsd == null ? '-' : s.meanCostUsd.toFixed(2)} · ${s.questions ?? 0}` : '-').padStart(cw);
  }).join(''));
}
console.log('');
for (const a of arms) console.log(`${a.label}: ${a.arm}${a.promptRef ? ` · prompt @ ${a.promptRef}` : ''} · ${Object.values(a.byTask).reduce((n, s) => n + s.passed, 0)}/${Object.values(a.byTask).reduce((n, s) => n + s.runs, 0)} passed`);
