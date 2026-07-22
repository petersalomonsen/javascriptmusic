// Browser-runnable agent loop against an OpenAI-compatible chat-completions
// API (NEAR AI Cloud: https://cloud-api.near.ai/v1). Pure logic — no DOM, no
// globals — so it can be unit-tested in Node with an injected fetch.
//
// This is the "serverless" provider tier: the model + tool loop run without
// the local studio-agent process. The tools themselves are the same browser
// registry the WS agent uses (studio-agent-client.js) plus a few repo-file
// tools backed by the jsDelivr CDN instead of local disk.

export const DEFAULT_BASE_URL = 'https://cloud-api.near.ai/v1';
export const DEFAULT_MODEL = 'Qwen/Qwen3.5-122B-A10B';

// cloud-api.near.ai only CORS-allowlists localhost origins — anywhere else
// (webassemblymusic.pages.dev etc.) goes through the same-origin Pages
// Function proxy at /nearai/v1 (functions/nearai/[[path]].js).
export function resolveDefaultBaseUrl(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
    ? DEFAULT_BASE_URL
    : '/nearai/v1';
}

// Tool definitions in OpenAI function-calling format. Descriptions mirror
// tools/studio-agent/server.mjs — keep them in sync when tools change.
const str = (description) => ({ type: 'string', description });
const opt = (props, required) => ({ type: 'object', properties: props, required });

export const TOOL_DEFS = [
  { name: 'get_song', description: 'Return the current song document (JavaScript sequencer DSL).', parameters: opt({}, []) },
  { name: 'set_song', description: 'Replace the entire song document. Provide the full new source.', parameters: opt({ source: str('full new song source') }, ['source']) },
  { name: 'get_synth', description: 'Return the current synth document (AssemblyScript).', parameters: opt({}, []) },
  { name: 'set_synth', description: 'Replace the entire synth document. Provide the full new source.', parameters: opt({ source: str('full new synth source') }, ['source']) },
  { name: 'edit_synth', description: 'Surgically find-and-replace in the synth document IN PLACE. old_string must match exactly and be unique unless replace_all is true.', parameters: opt({ old_string: str('exact text to find'), new_string: str('replacement text'), replace_all: { type: 'boolean' } }, ['old_string', 'new_string']) },
  { name: 'edit_song', description: 'Surgically find-and-replace in the song document IN PLACE. old_string must match exactly and be unique unless replace_all is true.', parameters: opt({ old_string: str('exact text to find'), new_string: str('replacement text'), replace_all: { type: 'boolean' } }, ['old_string', 'new_string']) },
  { name: 'grep_synth', description: 'Regex-search the CURRENT synth document; returns matching line numbers + text.', parameters: opt({ pattern: str('regex pattern'), context: { type: 'number' } }, ['pattern']) },
  { name: 'grep_song', description: 'Regex-search the CURRENT song document; returns matching line numbers + text.', parameters: opt({ pattern: str('regex pattern'), context: { type: 'number' } }, ['pattern']) },
  { name: 'write_faust', description: 'Author an INSTRUMENT in Faust: write faust/<path>.dsp AND transpile it to AssemblyScript in one step. Returns the generated class names to import into synth.ts, or the exact transpile error.', parameters: opt({ path: str('faust file basename'), source: str('faust dsp source') }, ['path', 'source']) },
  { name: 'read_faust', description: 'Read a Faust .dsp instrument source from the browser OPFS faust/ folder.', parameters: opt({ path: str('faust file basename') }, ['path']) },
  { name: 'list_faust', description: 'List the .dsp Faust instruments in the browser OPFS faust/ folder.', parameters: opt({}, []) },
  { name: 'git_log', description: 'Show the commit history of the in-browser OPFS repo.', parameters: opt({}, []) },
  { name: 'read_committed', description: 'Read the COMMITTED content of a file from the OPFS git repo at a ref (default HEAD).', parameters: opt({ path: str('repo-relative path'), ref: str('git ref, default HEAD') }, ['path']) },
  { name: 'compile', description: "SAVE + compile the current song+synth in the browser (same as the app's save button). If a track is already playing, the changes are applied and audible immediately. Returns 'compiled OK' or the exact compiler error. Call after every edit. There is NO play tool — the user starts playback themselves.", parameters: opt({}, []) },
  { name: 'stop', description: "Stop live audio playback. Only on the user's request.", parameters: opt({}, []) },
  // Serverless replacements for the local agent's repo-file access (fetched
  // from the public GitHub repo via jsDelivr instead of local disk):
  { name: 'read_repo_file', description: 'Read a reference file from the javascriptmusic repository (examples, docs). Path is repo-relative, e.g. "wasmaudioworklet/docs/song-api.md" or "examples/beachdrive/song.js". Do NOT use for huge bundles — use load_synth_from_file for those.', parameters: opt({ path: str('repo-relative path') }, ['path']) },
  { name: 'load_synth_from_file', description: 'Load a repository file DIRECTLY into the synth editor without reading it into context. Use this for large bundles (e.g. examples/dx7/dx7-synth.ts).', parameters: opt({ path: str('repo-relative path') }, ['path']) },
  { name: 'load_song_from_file', description: 'Load a repository file DIRECTLY into the song editor without reading it into context.', parameters: opt({ path: str('repo-relative path') }, ['path']) },
];

export function toOpenAiTools(defs = TOOL_DEFS) {
  return defs.map((d) => ({ type: 'function', function: { name: d.name, description: d.description, parameters: d.parameters } }));
}

// Extra system-prompt section for serverless mode: the local agent's built-in
// Read/Glob/Grep tools don't exist here.
export const SERVERLESS_PROMPT_SUFFIX = `

## Serverless mode adjustments
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
      const name = call.function?.name;
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
