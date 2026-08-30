// Browser-runnable agent loop against an OpenAI-compatible chat-completions
// API (NEAR AI Cloud: https://cloud-api.near.ai/v1). Pure logic — no DOM, no
// globals — so it can be unit-tested in Node with an injected fetch.
//
// This is the "serverless" provider tier: the model + tool loop run without
// the local studio-agent process. The tools themselves are the same browser
// registry the WS agent uses (studio-agent/client.js) plus a few repo-file
// tools backed by the jsDelivr CDN instead of local disk.

export const DEFAULT_BASE_URL = 'https://cloud-api.near.ai/v1';
// ONE model, picked for being the lightest that still does the job. Measured on
// the drum bench (tools/studio-agent/bench-drums.mjs), 2 runs each:
//
//   Qwen3.6-35B-A3B   2/2   6.0 tool calls    22-32s     <- this
//   qwen3.5-397b-a17b 2/2  11.0 tool calls    56-350s
//   Qwen3.8-27B       1/2   6.5 tool calls    81-113s
//
// It is a 35B MoE with only ~3B active, which is why it answers in a third of
// the time of the dense 27B and still passed both runs. Re-run the bench before
// changing this — the previous default outlived its own catalogue entry and
// every request 400'd with "Model not found" until someone noticed.
export const DEFAULT_MODEL = 'Qwen/Qwen3.6-35B-A3B-FP8';

// cloud-api.near.ai only CORS-allowlists localhost origins — anywhere else
// (webassemblymusic.pages.dev etc.) goes through the same-origin Pages
// Function proxy at /nearai/v1 (functions/nearai/[[path]].js).
export function resolveDefaultBaseUrl(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
    ? DEFAULT_BASE_URL
    : '/nearai/v1';
}

// The tool set is declared once in tools-def.js and shared with
// the local Agent SDK path; here it is only reshaped into OpenAI
// function-calling format. Serverless mode gets every tool including the
// repo-file readers (there is no built-in Read here).
export { TOOL_DEFS } from './tools-def.js';
import { TOOL_DEFS as SHARED_TOOL_DEFS } from './tools-def.js';

export function toOpenAiTools(defs = SHARED_TOOL_DEFS) {
  return defs.map((d) => ({ type: 'function', function: { name: d.name, description: d.description, parameters: d.parameters } }));
}

// Extra system-prompt section for serverless mode: the local agent's built-in
// Read/Glob/Grep tools don't exist here.
export const SERVERLESS_PROMPT_SUFFIX = `

## Serverless mode adjustments
- Call every tool by its BARE name (\`set_song\`, \`compile\`). There is no \`mcp__\` prefix here; a prefixed name is not a tool and will fail.
- Read/Glob/Grep are NOT available. To read repository reference files (examples, docs) use read_repo_file(path) with a repo-relative path.
- Keep replies short; each tool call is a full network round-trip.`;

// Run ONE user turn: call the model, execute tool calls against runTool, feed
// results back, repeat until the model answers without tool calls (or the
// iteration cap is hit). Mutates and returns `messages` (the caller owns and
// persists it — this is the full model-visible history).
export async function runAgentTurn({
  fetchFn,
  baseUrl,
  apiKey,
  model,
  messages,
  runTool,
  onText = () => {},
  onToolCall = () => {},
  onRetry = () => {},
  maxIterations = 25,
  maxRetries = 4,
  // Proxy mode: the same-origin Pages Function injects auth, system prompt
  // and tools server-side — the client then sends neither key nor tools.
  sendTools = true,
  sleepFn = (ms) => new Promise((r) => setTimeout(r, ms)),
}) {
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const bodyBase = sendTools ? { model, tools: toOpenAiTools(), tool_choice: 'auto' } : { model };
  for (let i = 0; i < maxIterations; i++) {
    let response;
    // Transient failures (rate limits, upstream 5xx) must not kill the turn —
    // a live session died mid-work on a 429 "retry with exponential backoff".
    for (let attempt = 0; ; attempt++) {
      response = await fetchFn(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...bodyBase, messages }),
      });
      const retryable = response.status === 429 || response.status >= 500;
      if (response.ok || !retryable || attempt >= maxRetries) break;
      const delayMs = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s, 8s
      onRetry(response.status, delayMs, attempt + 1);
      await sleepFn(delayMs);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`NEAR AI ${response.status}: ${body.slice(0, 300)}`);
    }
    const data = await response.json();
    const msg = data.choices?.[0]?.message;
    if (!msg) throw new Error('NEAR AI: empty response (no choices[0].message)');
    messages.push(msg);

    if (msg.content) onText(msg.content);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return { messages, usage: data.usage };
    }
    for (const call of msg.tool_calls) {
      // Belt and braces: the tools are registered bare here, but the MCP-style
      // prefix is all over this project's own transcripts and docs, so a model
      // may still reach for it. Accept it rather than answering "no such tool".
      const name = (call.function?.name || '').replace(/^mcp__studio__/, '');
      let args = {};
      let result;
      try {
        args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
      } catch (e) {
        result = `ERROR: could not parse tool arguments as JSON: ${e.message}`;
      }
      if (result === undefined) {
        onToolCall(name, args);
        try {
          result = await runTool(name, args);
        } catch (e) {
          result = `ERROR: ${e?.message || e}`;
        }
      }
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: typeof result === 'string' ? result : JSON.stringify(result ?? 'ok'),
      });
    }
  }
  throw new Error(`NEAR AI: turn did not finish within ${maxIterations} model iterations`);
}
