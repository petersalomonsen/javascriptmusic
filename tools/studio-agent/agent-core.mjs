// The producer + specialist agents (instrument, mastering) over the Claude
// Agent SDK, with the studio they act on behind a small BACKEND interface:
//
//   backend.call(name, args) → Promise<{ ok, result }>   run one studio tool
//   backend.repoRoot                                    for the file loaders
//
// server.mjs supplies a backend that proxies each call to the browser over the
// WebSocket; the bench (tools/studio-agent/bench) supplies a headless studio
// that compiles and probes in Node. Everything about WHO the agents are — the
// prompts, the tool subsets per role, the nested specialist run and the probe
// that turns its report into a measured verdict — lives here, once, so the
// bench exercises the code the app runs.
//
// hooks: { send(obj), log(obj), dlog(...), isAborted() } — all optional.
// config: { model, effort, cwd, specialistModel, specialistMaxTurns,
//           specialistPrompt(kind) — optional override of buildSpecialistPrompt (the bench A/Bs prompt versions) }.

import { z } from 'zod';
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { SDK_PROMPT_SUFFIX, buildProducerPrompt, buildSpecialistPrompt } from './prompt.mjs';
import { toolDefsForRole, toolNamesForRole } from '../../wasmaudioworklet/studio-agent/tools-def.js';
import { SPECIALISTS } from '../../wasmaudioworklet/studio-agent/tools-core.js';

// Tools an agent may use: its ROLE's share of the studio tools + read-only repo
// access. The tool set itself is declared once in tools-def.js and shared with
// the in-browser NEAR AI provider, and the roles (who gets what) live there
// too. Three roles run here: the PRODUCER (the conversation; delegates
// instrument design and mastering), the INSTRUMENT specialist (one brief, its
// own nested run, only the instrument tools) and the MASTERING specialist (the
// master insert, the mix-level song edits, the whole-mix probe). Nobody gets
// write_faust AND design_instrument.
const mcpNames = (role) => toolNamesForRole(role, ['browser', 'loadfile', 'agent']).map((n) => `mcp__studio__${n}`);
export const ALLOWED_BY_ROLE = {
  producer: new Set([...mcpNames('producer'), 'Read', 'Glob', 'Grep']),
  instrument: new Set([...mcpNames('instrument'), 'Read', 'Glob', 'Grep']),
  mastering: new Set([...mcpNames('mastering'), 'Read', 'Glob', 'Grep']),
};
// Built-in tools that cause the agent to thrash on this task — keep it focused.
export const DISALLOWED = ['Bash', 'BashOutput', 'KillShell', 'Agent', 'Task', 'Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'WebSearch', 'WebFetch', 'AskUserQuestion'];

const canUse = (allowed, dlog) => async (name, input) => {
  const ok = allowed.has(name);
  dlog(ok ? 'ALLOW' : 'DENY ', name, ok ? '' : "(not in this role's allowlist)");
  return ok
    ? { behavior: 'allow', updatedInput: input }
    : { behavior: 'deny', message: `${name} is not available to this agent; use only Read/Glob/Grep and the studio tools you were given.` };
};

// The specialist runs as a nested query inside the producer's design_instrument
// tool call, so that call lasts as long as the specialist does — minutes, with
// transpiles and probes inside. Raise the SDK's MCP tool timeout in case it
// applies to in-process servers; the backend's own per-tool timeouts still
// bound each individual step.
process.env.MCP_TOOL_TIMEOUT ||= String(30 * 60 * 1000);

const noop = () => {};
const withDefaults = (hooks = {}) => ({ send: noop, log: noop, dlog: noop, isAborted: () => false, ...hooks });

/** A repo-relative path resolved inside the repo, or an error. */
export function safeResolve(repoRoot, p) {
  const full = resolve(repoRoot, String(p || ''));
  if (full !== repoRoot && !full.startsWith(repoRoot + sep)) throw new Error(`path escapes the repository: ${p}`);
  return full;
}

// The shared tool defs carry JSON Schema (what the OpenAI-compatible NEAR AI
// path sends); the Agent SDK wants a zod shape. Only the primitive types the
// defs actually use are supported — anything else is a mistake worth throwing on.
export function zodShape(parameters) {
  const required = new Set(parameters.required || []);
  const shape = {};
  for (const [name, spec] of Object.entries(parameters.properties || {})) {
    let field;
    if (spec.type === 'string') field = z.string();
    else if (spec.type === 'number') field = z.number();
    else if (spec.type === 'boolean') field = z.boolean();
    else throw new Error(`studio tool schema: unsupported type "${spec.type}" for "${name}"`);
    if (spec.description) field = field.describe(spec.description);
    shape[name] = required.has(name) ? field : field.optional();
  }
  return shape;
}

/** The producer's system prompt, with the project's kit (its AGENT.md) appended when there is one. */
export function producerSystemPrompt(kit) {
  const base = buildProducerPrompt() + SDK_PROMPT_SUFFIX;
  if (!kit || !kit.trim()) return base;
  return `${base}\n\n## Project kit (from the project's AGENT.md)\n\n` +
    `These are the user's instructions for THIS project — instrument sources, ` +
    `channel layout and conventions. Prefer them over generic defaults, and use ` +
    `them directly instead of searching the repository for the same information.` +
    `\n\n${kit}`;
}

// ---- The in-process MCP tools, bound to one backend -----------------------
// `role` picks the tool subset (tools-def.js ROLES); the producer's server also
// carries design_instrument, which runs the specialist against the same backend.
export function makeStudioServer(backend, role = 'producer', hooks = {}, config = {}) {
  const h = withDefaults(hooks);
  const text = (t) => ({ content: [{ type: 'text', text: t || 'ok' }] });
  const error = (t) => ({ content: [{ type: 'text', text: `ERROR: ${t}` }], isError: true });
  // A browser tool answers with a string, a JSON-able value, or — render_shader —
  // { text, image (base64), mimeType }: the picture goes to the model as an
  // image block after the text, which is how the agent gets to SEE a frame.
  const toolResult = (r) => {
    if (r && typeof r === 'object' && typeof r.image === 'string') {
      return { content: [{ type: 'text', text: r.text || 'ok' }, { type: 'image', data: r.image, mimeType: r.mimeType || 'image/jpeg' }] };
    }
    return text(typeof r === 'string' ? r : JSON.stringify(r));
  };

  const proxy = (d) => tool(d.name, d.description, zodShape(d.parameters), async (args) => {
    try {
      const res = await backend.call(d.name, args);
      if (!res.ok) return error(res.result ?? 'tool failed');
      return toolResult(res.result);
    } catch (e) {
      return error(e?.message || e);
    }
  });

  // Load a repo file straight into an editor: the bytes are read here and
  // pushed to the studio, so a huge bundle never has to pass through the model.
  const loadInto = (d) => tool(d.name, `${d.description} The file content is read here and sent to the browser for you.`,
    zodShape(d.parameters),
    async ({ path }) => {
      try {
        const content = await readFile(safeResolve(backend.repoRoot, path), 'utf8');
        const res = await backend.call(d.target === 'synth' ? 'set_synth' : 'set_song', { source: content });
        if (!res.ok) return error(res.result ?? 'load failed');
        return text(`loaded ${path} (${content.split('\n').length} lines) into the ${d.target} editor`);
      } catch (e) {
        return error(e?.message || e);
      }
    });

  return createSdkMcpServer({
    name: 'studio',
    version: '1.0.0',
    // Pin the studio tool schemas into the turn-1 prompt instead of letting
    // them sit behind tool search. Deferred schemas cost an extra ToolSearch
    // round-trip before the agent can act at all — measured at ~1.4x the
    // median turn and a much worse tail on real sessions.
    alwaysLoad: true,
    tools: [
      ...toolDefsForRole(role, ['browser']).map(proxy),
      ...toolDefsForRole(role, ['loadfile']).map(loadInto),
      ...toolDefsForRole(role, ['agent']).map((d) =>
        tool(d.name, d.description, zodShape(d.parameters), (args) => runSpecialist(backend, d.role, args, h, config))),
    ],
  });
}

// ---- A specialist: a nested run inside one tool call -----------------------------
//
// design_instrument → the instrument specialist, master_mix → the mastering
// specialist. What differs per role (prompt, brief, the probe the tool runs
// afterwards, the verdict) comes from SPECIALISTS in tools-core.js; the loop,
// the abort handling and the logging are shared. The paragraph below describes
// the instrument case; the mastering one differs only in what is measured.
//
// design_instrument is an ordinary MCP tool to the producer. Behind it a second
// query() runs with the SPECIALIST prompt (the instrument + mix sections and a
// guide for the kind of sound, nothing about the song), only the instrument
// tools, and its own fresh context — so the transpile errors, the probes and
// the reasoning between them never enter the producer's conversation. What
// comes back is the specialist's report AND a probe this code runs itself
// afterwards: the verdict in the first line is measured, not claimed.
const running = new Set(); // AbortControllers of specialists in flight

/** Abort every specialist currently running (the producer's turn is stopping). */
export function abortSpecialists() {
  for (const c of running) { try { c.abort(); } catch { /* already done */ } }
  running.clear();
}

export async function runSpecialist(backend, role, args, hooks = {}, config = {}) {
  const h = withDefaults(hooks);
  const spec = SPECIALISTS[role];
  if (!spec) throw new Error(`unknown specialist role "${role}"`);
  args = args || {};
  const { brief, name } = args;
  const kind = spec.kind(args);
  const t0ms = Date.now();
  const controller = new AbortController();
  running.add(controller);
  const allowed = ALLOWED_BY_ROLE[role];
  const studio = makeStudioServer(backend, role, h, config);
  // config.specialistPrompt A/Bs the INSTRUMENT specialist's prompt (the bench); the others use the working tree's.
  const systemPrompt = (role === 'instrument' && config.specialistPrompt ? config.specialistPrompt(kind) : buildSpecialistPrompt(role, { kind })) + SDK_PROMPT_SUFFIX;
  const prompt = spec.brief(args);
  let report = '';
  let subSid = null;
  const stats = { turns: 0, costUsd: 0, toolCalls: 0 };
  h.dlog('specialist ▶', role, kind || '(kind unset)', JSON.stringify(brief || '').slice(0, 80));
  h.log({ kind: 'specialist_start', role, input: args });
  h.send({ t: 'specialist', state: 'start', role, name: name || null });
  try {
    for await (const m of query({
      prompt,
      options: {
        abortController: controller,
        model: config.specialistModel || config.model,
        effort: config.effort,
        cwd: config.cwd,
        systemPrompt,
        mcpServers: { studio },
        allowedTools: [...allowed],
        disallowedTools: DISALLOWED,
        canUseTool: canUse(allowed, h.dlog),
        maxTurns: config.specialistMaxTurns || 40,
      },
    })) {
      if (m.type === 'system' && m.subtype === 'init') {
        subSid = m.session_id || null;
        h.log({ kind: 'specialist_session', sessionId: subSid, toolCount: (m.tools || []).length });
      } else if (m.type === 'assistant') {
        for (const block of m.message?.content ?? []) {
          if (block.type === 'text' && block.text) {
            report = block.text; // the LAST text is the report
            h.log({ kind: 'specialist_text', sessionId: subSid, text: block.text });
          } else if (block.type === 'tool_use') {
            stats.toolCalls++;
            h.dlog('  specialist tool_use →', block.name, JSON.stringify(block.input).slice(0, 60));
            h.log({ kind: 'specialist_tool_use', sessionId: subSid, name: block.name, input: block.input });
            h.send({ t: 'tool', name: block.name, input: block.input, sub: role });
          }
        }
      } else if (m.type === 'user') {
        for (const block of m.message?.content ?? []) {
          if (block.type === 'tool_result') {
            const txt = Array.isArray(block.content) ? block.content.map((c) => c.text || '').join('') : String(block.content || '');
            h.log({ kind: 'specialist_tool_result', sessionId: subSid, isError: !!block.is_error, text: txt });
          }
        }
      } else if (m.type === 'result') {
        stats.turns = m.num_turns; stats.costUsd = m.total_cost_usd; stats.usage = m.usage;
        h.log({ kind: 'specialist_result', sessionId: subSid, subtype: m.subtype, turns: m.num_turns, costUsd: m.total_cost_usd, usage: m.usage });
        if (typeof m.result === 'string' && m.result.trim()) report = m.result;
      }
    }
  } catch (e) {
    if (h.isAborted()) throw e; // the whole turn is stopping; let the tool fail with it
    const emsg = String(e?.message || e);
    h.dlog('specialist EXCEPTION', emsg);
    h.log({ kind: 'specialist_error', sessionId: subSid, error: emsg });
    report = `${report}\n\n(the specialist run ended with an error: ${emsg})`.trim();
  } finally {
    running.delete(controller);
  }

  // Verify independently of what the report says: probe the channel the
  // instrument should be on, or measure the whole mix for a master. Nothing to
  // probe (no channel known) → cannot verify → FAILED, by design.
  const probeArgs = spec.probeArgs(args, report);
  let probeText;
  if (!probeArgs) {
    probeText = spec.noProbe;
  } else {
    try {
      const res = await backend.call(spec.probeTool, probeArgs);
      probeText = res.ok ? String(res.result ?? '') : `ERROR: ${res.result ?? 'probe failed'}`;
    } catch (e) {
      probeText = `ERROR: ${e?.message || e}`;
    }
  }
  const text = spec.result({ report, probeText, args, probeArgs });
  const ok = text.split('\n')[0].includes(': OK');
  h.dlog('specialist ◀', ok ? 'OK' : 'FAILED', `${((Date.now() - t0ms) / 1000).toFixed(0)}s`);
  h.log({ kind: 'specialist_end', sessionId: subSid, ok, ms: Date.now() - t0ms, ...stats, firstLine: text.split('\n')[0] });
  h.send({ t: 'specialist', state: 'end', role, name: name || null, ok });
  // A FAILED result is information the producer must relay, not a tool error.
  return { content: [{ type: 'text', text }] };
}

/** The instrument specialist, by its old name. */
export const designInstrument = (backend, args, hooks, config) => runSpecialist(backend, 'instrument', args, hooks, config);

// ---- One producer turn ------------------------------------------------------
// Returns the SDK's message stream for the caller to consume (the server
// forwards it to the browser and logs it; the bench records it).
export function producerQuery({ prompt, sessionId = null, systemPrompt, abortController, backend, hooks = {}, config = {}, maxTurns = 60 }) {
  const h = withDefaults(hooks);
  const studio = makeStudioServer(backend, 'producer', h, config);
  return query({
    prompt,
    options: {
      abortController,
      resume: sessionId || undefined,
      model: config.model,
      effort: config.effort,
      cwd: config.cwd,
      systemPrompt: systemPrompt ?? producerSystemPrompt(''),
      mcpServers: { studio },
      allowedTools: [...ALLOWED_BY_ROLE.producer],
      disallowedTools: DISALLOWED,
      canUseTool: canUse(ALLOWED_BY_ROLE.producer, h.dlog),
      maxTurns,
    },
  });
}
