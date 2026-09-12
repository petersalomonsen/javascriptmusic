// Build the check context for a task: the BASELINE (the project as the model
// found it, compiled) and the VERDICT (the project as the model left it,
// recompiled here, probed on demand) — shared by the runner and the corpus test.

import * as core from '../../../wasmaudioworklet/studio-agent/tools-core.js';
import { noteList, parseProbe, runChecks } from './checks.mjs';

function analysed(studio) {
  const song = studio.state.song;
  const bpm = core.songBpmFromSource(song);
  const events = studio.state.events;
  return {
    events,
    notes: noteList(events, bpm),
    summary: core.summarizeSongEvents(events, bpm, { instruments: core.declaredInstruments(song), playFromHereLine: core.playFromHereLine(song) }),
  };
}

/** Compile the untouched project and remember what it was. Throws if it does not compile: a task must start from a working project. */
export async function baselineOf(studio) {
  const compile = await studio.call('compile');
  if (!compile.ok) throw new Error(`baseline does not compile: ${compile.result}`);
  return {
    song: studio.state.song, synth: studio.state.synth,
    faust: Object.fromEntries([...studio.state.faust].map(([k, f]) => [k, f.dsp])),
    ...analysed(studio),
  };
}

/** Recompile what the model left, then run the task's checks over it. */
export async function verdictOf(task, studio, baseline, transcript) {
  const finalCompile = await studio.call('compile');
  const final = finalCompile.ok ? analysed(studio) : { events: null, notes: null, summary: null };
  const probeCache = new Map();
  const probe = async (channel, notes = 'c4') => {
    const key = `${channel}:${notes}`;
    if (!probeCache.has(key)) {
      const r = await studio.call('probe_instrument', { channel, notes });
      probeCache.set(key, r.ok ? parseProbe(r.result) : []);
    }
    return probeCache.get(key);
  };
  const ctx = { studio, baseline, transcript, finalCompile, probe, ...final };
  return runChecks(task.checks, ctx);
}
