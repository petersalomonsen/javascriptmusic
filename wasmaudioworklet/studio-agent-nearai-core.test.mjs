// node --test — unit tests for the browser-runnable OpenAI-compatible agent
// loop (NEAR AI serverless provider). fetch is injected, so no network.
import { test } from 'node:test';
import assert from 'node:assert';
import { runAgentTurn, toOpenAiTools, TOOL_DEFS } from './studio-agent-nearai-core.js';

const ok = (payload) => ({ ok: true, json: async () => payload });
const completion = (message, usage) => ok({ choices: [{ message }], usage });

function scriptedFetch(responses, capturedBodies = []) {
  let i = 0;
  return async (url, opts) => {
    capturedBodies.push(JSON.parse(opts.body));
    if (i >= responses.length) throw new Error('fetch called more times than scripted');
    return responses[i++];
  };
}

test('tool schemas: every def maps to an OpenAI function tool', () => {
  const tools = toOpenAiTools();
  assert.equal(tools.length, TOOL_DEFS.length);
  for (const t of tools) {
    assert.equal(t.type, 'function');
    assert.ok(t.function.name && t.function.description && t.function.parameters);
  }
  assert.ok(tools.some((t) => t.function.name === 'compile'));
  assert.ok(!tools.some((t) => t.function.name === 'play'), 'no play tool in serverless mode either');
});

test('text-only response ends the turn and reports usage', async () => {
  const bodies = [];
  const messages = [{ role: 'system', content: 'sys' }, { role: 'user', content: 'hi' }];
  const texts = [];
  const result = await runAgentTurn({
    fetchFn: scriptedFetch([completion({ role: 'assistant', content: 'hello!' }, { total_tokens: 42 })], bodies),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
    messages, runTool: () => { throw new Error('no tools expected'); },
    onText: (t) => texts.push(t),
  });
  assert.deepEqual(texts, ['hello!']);
  assert.equal(result.usage.total_tokens, 42);
  assert.equal(messages.length, 3); // assistant reply appended
  assert.equal(bodies[0].model, 'm');
  assert.ok(bodies[0].tools.length > 0, 'tools are sent');
});

test('tool_calls are executed, results fed back with matching ids, then final text', async () => {
  const calls = [];
  const messages = [{ role: 'user', content: 'edit it' }];
  await runAgentTurn({
    fetchFn: scriptedFetch([
      completion({
        role: 'assistant', content: null, tool_calls: [
          { id: 'call_1', function: { name: 'get_song', arguments: '{}' } },
          { id: 'call_2', function: { name: 'edit_song', arguments: '{"old_string":"a","new_string":"b"}' } },
        ],
      }),
      completion({ role: 'assistant', content: 'done' }),
    ]),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm', messages,
    runTool: async (name, args) => { calls.push([name, args]); return `${name}-result`; },
  });
  assert.deepEqual(calls, [['get_song', {}], ['edit_song', { old_string: 'a', new_string: 'b' }]]);
  const toolMsgs = messages.filter((m) => m.role === 'tool');
  assert.deepEqual(toolMsgs.map((m) => m.tool_call_id), ['call_1', 'call_2']);
  assert.deepEqual(toolMsgs.map((m) => m.content), ['get_song-result', 'edit_song-result']);
});

test('a failing tool feeds an ERROR result back instead of aborting the turn', async () => {
  const messages = [{ role: 'user', content: 'x' }];
  await runAgentTurn({
    fetchFn: scriptedFetch([
      completion({ role: 'assistant', tool_calls: [{ id: 'c1', function: { name: 'compile', arguments: '{}' } }] }),
      completion({ role: 'assistant', content: 'I saw the error' }),
    ]),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm', messages,
    runTool: async () => { throw new Error('TS2305 boom'); },
  });
  const toolMsg = messages.find((m) => m.role === 'tool');
  assert.match(toolMsg.content, /ERROR: TS2305 boom/);
});

test('unparseable tool arguments become an ERROR result without calling the tool', async () => {
  let toolRan = false;
  const messages = [{ role: 'user', content: 'x' }];
  await runAgentTurn({
    fetchFn: scriptedFetch([
      completion({ role: 'assistant', tool_calls: [{ id: 'c1', function: { name: 'set_song', arguments: '{bad json' } }] }),
      completion({ role: 'assistant', content: 'ok' }),
    ]),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm', messages,
    runTool: async () => { toolRan = true; },
  });
  assert.equal(toolRan, false);
  assert.match(messages.find((m) => m.role === 'tool').content, /ERROR: could not parse/);
});

test('proxy mode: no apiKey → no Authorization header; sendTools:false → no tools in body', async () => {
  let captured;
  await runAgentTurn({
    fetchFn: async (url, opts) => { captured = { headers: opts.headers, body: JSON.parse(opts.body) }; return completion({ role: 'assistant', content: 'ok' }); },
    baseUrl: '/nearai/v1', apiKey: null, model: 'm', sendTools: false,
    messages: [{ role: 'user', content: 'hi' }], runTool: () => {},
  });
  assert.equal(captured.headers.Authorization, undefined);
  assert.equal(captured.body.tools, undefined);
  assert.equal(captured.body.model, 'm');
});

test('429 rate limit retries with exponential backoff, then succeeds', async () => {
  const delays = [];
  const retries = [];
  let call = 0;
  const responses = [
    { ok: false, status: 429, text: async () => 'rate limit' },
    { ok: false, status: 429, text: async () => 'rate limit' },
    completion({ role: 'assistant', content: 'recovered' }),
  ];
  const texts = [];
  await runAgentTurn({
    fetchFn: async () => responses[call++],
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
    messages: [{ role: 'user', content: 'x' }], runTool: () => {},
    onText: (t) => texts.push(t),
    onRetry: (status, delayMs, attempt) => retries.push([status, delayMs, attempt]),
    sleepFn: async (ms) => delays.push(ms),
  });
  assert.deepEqual(texts, ['recovered']);
  assert.deepEqual(delays, [1000, 2000]);
  assert.deepEqual(retries, [[429, 1000, 1], [429, 2000, 2]]);
});

test('retries exhausted -> throws the transient error', async () => {
  await assert.rejects(
    runAgentTurn({
      fetchFn: async () => ({ ok: false, status: 503, text: async () => 'down' }),
      baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
      messages: [{ role: 'user', content: 'x' }], runTool: () => {},
      maxRetries: 2, sleepFn: async () => {},
    }),
    /NEAR AI 503: down/,
  );
});

test('HTTP error throws with status and body excerpt', async () => {
  await assert.rejects(
    runAgentTurn({
      fetchFn: async () => ({ ok: false, status: 401, text: async () => '{"error":"bad key"}' }),
      baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
      messages: [{ role: 'user', content: 'x' }], runTool: () => {},
    }),
    /NEAR AI 401: .*bad key/,
  );
});

test('runaway tool loops hit the iteration cap', async () => {
  const always = completion({ role: 'assistant', tool_calls: [{ id: 'c', function: { name: 'get_song', arguments: '{}' } }] });
  await assert.rejects(
    runAgentTurn({
      fetchFn: async () => ({ ok: true, json: async () => ({ choices: [{ message: { role: 'assistant', tool_calls: [{ id: 'c', function: { name: 'get_song', arguments: '{}' } }] } }] }) }),
      baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
      messages: [{ role: 'user', content: 'x' }], runTool: async () => 'r', maxIterations: 3,
    }),
    /did not finish within 3/,
  );
});
