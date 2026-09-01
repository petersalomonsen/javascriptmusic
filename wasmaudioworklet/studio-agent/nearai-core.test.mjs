// node --test — unit tests for the browser-runnable OpenAI-compatible agent
// loop (NEAR AI serverless provider). fetch is injected, so no network.
import { test } from 'node:test';
import assert from 'node:assert';
import {
  runAgentTurn, toOpenAiTools, TOOL_DEFS, pruneSupersededReads,
  compactConversation, conversationChars, COMPACT_AT_CHARS,
} from './nearai-core.js';

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

// A thinking model attaches its private reasoning to every answer. Keeping it in
// the history meant re-sending every past thought on every request: in a real
// four-ask session that was 34,745 of 61,612 conversation chars — 59% — and it
// pushed a deployed session past the proxy's 60k cap into a 413. Reasoning is
// regenerated each turn and the providers emitting these fields document that
// they are not to be sent back, so history keeps role/content/tool_calls only.
test('a thinking model’s reasoning is not echoed back on the next request', async () => {
  const bodies = [];
  const messages = [{ role: 'user', content: 'hi' }];
  await runAgentTurn({
    fetchFn: scriptedFetch([
      completion({
        role: 'assistant',
        content: 'working on it',
        reasoning_content: 'X'.repeat(5000),
        reasoning: 'Y'.repeat(5000),
        tool_calls: [{ id: 'c1', type: 'function', function: { name: 'compile', arguments: '{}' } }],
      }),
      completion({ role: 'assistant', content: 'done' }),
    ], bodies),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
    messages, runTool: async () => 'compiled OK',
  });

  // The SECOND request carries the first answer back — without the thinking.
  const sent = JSON.stringify(bodies[1]);
  assert.ok(!sent.includes('XXXXX'), 'reasoning_content must not be re-sent');
  assert.ok(!sent.includes('YYYYY'), 'reasoning must not be re-sent');

  const assistant = bodies[1].messages.find((m) => m.role === 'assistant');
  assert.deepEqual(Object.keys(assistant).sort(), ['content', 'role', 'tool_calls']);
  assert.equal(assistant.content, 'working on it');
  assert.equal(assistant.tool_calls[0].function.name, 'compile');
});

test('an assistant turn with no content keeps the tool_calls and adds no empty fields', async () => {
  const bodies = [];
  const messages = [{ role: 'user', content: 'hi' }];
  await runAgentTurn({
    fetchFn: scriptedFetch([
      completion({ role: 'assistant', content: '', reasoning_content: 'thinking…',
        tool_calls: [{ id: 'c1', type: 'function', function: { name: 'get_song', arguments: '{}' } }] }),
      completion({ role: 'assistant', content: 'ok' }),
    ], bodies),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
    messages, runTool: async () => 'setBPM(120);',
  });
  const assistant = bodies[1].messages.find((m) => m.role === 'assistant');
  assert.deepEqual(Object.keys(assistant).sort(), ['role', 'tool_calls']);
});

// A model can emit a tool call whose arguments are not valid JSON — an empty
// string is the common one. The call itself was already answered with an error,
// but the malformed message stayed in the history, so every LATER request was
// rejected by the provider with "Assistant tool call function.arguments must be
// valid JSON". One bad call bricked the session: no further turn could succeed.
// Reproduced from a real 400, where message #71 held set_song with arguments "".
test('a tool call with unparseable arguments does not poison the history', async () => {
  const bodies = [];
  const messages = [{ role: 'user', content: 'hi' }];
  const results = [];
  await runAgentTurn({
    fetchFn: scriptedFetch([
      completion({
        role: 'assistant',
        tool_calls: [{ id: 'c1', type: 'function', function: { name: 'set_song', arguments: '' } }],
      }),
      completion({ role: 'assistant', content: 'recovered' }),
    ], bodies),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
    messages, runTool: async (name, args) => { results.push(args); return 'ok'; },
  });

  const assistant = bodies[1].messages.find((m) => m.role === 'assistant');
  assert.equal(assistant.tool_calls[0].function.arguments, '{}', 'normalised to valid JSON');
  JSON.parse(assistant.tool_calls[0].function.arguments); // must not throw
  assert.equal(assistant.tool_calls[0].function.name, 'set_song', 'the call itself is preserved');
  // The pairing must survive: an assistant tool_call needs its tool result.
  const toolMsg = bodies[1].messages.find((m) => m.role === 'tool');
  assert.equal(toolMsg.tool_call_id, 'c1');
  // An empty string is FALSY, so the loop reads it as "no arguments" and runs
  // the tool with {}. That was never the bug — only the history was.
  assert.deepEqual(results, [{}]);
  assert.equal(toolMsg.content, 'ok');
});

test('genuinely malformed arguments are answered with an error and stored valid', async () => {
  const bodies = [];
  const messages = [{ role: 'user', content: 'hi' }];
  const results = [];
  await runAgentTurn({
    fetchFn: scriptedFetch([
      completion({
        role: 'assistant',
        tool_calls: [{ id: 'c9', type: 'function', function: { name: 'set_song', arguments: '{"source": ' } }],
      }),
      completion({ role: 'assistant', content: 'recovered' }),
    ], bodies),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
    messages, runTool: async (name, args) => { results.push(args); return 'ok'; },
  });
  const assistant = bodies[1].messages.find((m) => m.role === 'assistant');
  assert.equal(assistant.tool_calls[0].function.arguments, '{}');
  const toolMsg = bodies[1].messages.find((m) => m.role === 'tool');
  assert.match(toolMsg.content, /could not parse tool arguments/);
  assert.deepEqual(results, [], 'the tool is not run with arguments we could not read');
});

// A thinking model can finish a turn having emitted only reasoning: no content,
// no tool calls. The loop returned normally and the chat panel logged "done ✓",
// so the agent looked like it had silently given up mid-task — which is exactly
// how it reads to someone watching tool calls scroll past and then nothing.
test('a turn that produces no answer is reported as such, not as done', async () => {
  const withAnswer = await runAgentTurn({
    fetchFn: scriptedFetch([completion({ role: 'assistant', content: 'here you go' })], []),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
    messages: [{ role: 'user', content: 'hi' }], runTool: async () => 'ok',
  });
  assert.strictEqual(withAnswer.answered, true);

  const silent = await runAgentTurn({
    fetchFn: scriptedFetch([completion({ role: 'assistant', reasoning_content: 'thinking hard…' })], []),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
    messages: [{ role: 'user', content: 'hi' }], runTool: async () => 'ok',
  });
  assert.strictEqual(silent.answered, false);
});

// "no answer" has two causes that need different responses. A model that simply
// stops has nothing more to say; one cut off at the token limit was mid-thought
// and would have carried on. A real turn hit the second: finish_reason "length",
// completion_tokens 2000 against a 2000 cap, reasoning_tokens 2001 — the whole
// output budget spent thinking, 23k of input paid for, nothing returned.
test('a turn cut off at the token limit is distinguishable from one that just stopped', async () => {
  const cutOff = await runAgentTurn({
    fetchFn: async () => ok({
      choices: [{ message: { role: 'assistant', reasoning_content: 'thinking…' }, finish_reason: 'length' }],
      usage: { completion_tokens: 2000, reasoning_tokens: 2001 },
    }),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
    messages: [{ role: 'user', content: 'hi' }], runTool: async () => 'ok',
  });
  assert.strictEqual(cutOff.answered, false);
  assert.strictEqual(cutOff.finishReason, 'length');

  const justStopped = await runAgentTurn({
    fetchFn: async () => ok({ choices: [{ message: { role: 'assistant', content: 'here' }, finish_reason: 'stop' }] }),
    baseUrl: 'https://x/v1', apiKey: 'k', model: 'm',
    messages: [{ role: 'user', content: 'hi' }], runTool: async () => 'ok',
  });
  assert.strictEqual(justStopped.answered, true);
  assert.strictEqual(justStopped.finishReason, 'stop');
});

// A whole-document read returns the entire current document, so a later one
// supersedes every earlier one. A real session carried FOUR full copies of the
// song — 11,754 chars of a 60k budget, three of them stale — and tipped the
// conversation over the proxy's cap. The old copies are not just waste: they
// show the model versions of the file that no longer exist.
const toolCall = (id, name) => ({ role: 'assistant', tool_calls: [{ id, type: 'function', function: { name, arguments: '{}' } }] });

test('only the newest whole-document read is kept', () => {
  const messages = [
    { role: 'system', content: 'sys' },
    { role: 'user', content: 'go' },
    toolCall('a', 'get_song'), { role: 'tool', tool_call_id: 'a', content: 'SONG VERSION ONE' },
    toolCall('b', 'get_song'), { role: 'tool', tool_call_id: 'b', content: 'SONG VERSION TWO' },
    toolCall('c', 'get_song'), { role: 'tool', tool_call_id: 'c', content: 'SONG VERSION THREE' },
  ];
  const out = pruneSupersededReads(messages);

  assert.equal(out.length, messages.length, 'a tool result must keep its assistant call');
  assert.match(out.find((m) => m.tool_call_id === 'a').content, /superseded/);
  assert.match(out.find((m) => m.tool_call_id === 'b').content, /superseded/);
  assert.equal(out.find((m) => m.tool_call_id === 'c').content, 'SONG VERSION THREE',
    'the newest read survives intact');
  assert.deepEqual(messages.find((m) => m.tool_call_id === 'a').content, 'SONG VERSION ONE',
    'the caller’s array is not mutated');
});

test('documents are superseded independently, and only whole-document reads are', () => {
  const messages = [
    toolCall('a', 'get_song'), { role: 'tool', tool_call_id: 'a', content: 'old song' },
    toolCall('b', 'get_synth'), { role: 'tool', tool_call_id: 'b', content: 'the synth' },
    toolCall('c', 'get_song'), { role: 'tool', tool_call_id: 'c', content: 'new song' },
    // read_faust is per-PATH and grep_song per-PATTERN: a later call answers a
    // different question, so it supersedes nothing.
    toolCall('d', 'read_faust'), { role: 'tool', tool_call_id: 'd', content: 'kick.dsp' },
    toolCall('e', 'read_faust'), { role: 'tool', tool_call_id: 'e', content: 'hihat.dsp' },
    toolCall('f', 'grep_song'), { role: 'tool', tool_call_id: 'f', content: 'match one' },
    toolCall('g', 'grep_song'), { role: 'tool', tool_call_id: 'g', content: 'match two' },
  ];
  const out = pruneSupersededReads(messages);
  const at = (id) => out.find((m) => m.tool_call_id === id).content;

  assert.match(at('a'), /superseded/);
  assert.equal(at('c'), 'new song');
  assert.equal(at('b'), 'the synth', 'a different document is untouched');
  assert.equal(at('d'), 'kick.dsp');
  assert.equal(at('e'), 'hihat.dsp');
  assert.equal(at('f'), 'match one');
  assert.equal(at('g'), 'match two');
});

// The proxy refuses a conversation over 60k chars, and a working session reaches
// that with no waste in it — one real one arrived at 60,892 across 84 messages of
// genuine work, after the reasoning and the stale document copies were already
// gone. Pruning buys a fixed slice; only compaction bounds a session.
test('compaction replaces a long history with a summary of it', async () => {
  const sent = [];
  const fetchFn = async (url, opts) => {
    sent.push(JSON.parse(opts.body));
    return ok({ choices: [{ message: { role: 'assistant', content: 'built a kick on ch0; user hand-tuned the echo' } }] });
  };
  const messages = [
    { role: 'system', content: 'SYSTEM' },
    { role: 'user', content: 'make a kick' },
    { role: 'assistant', tool_calls: [{ id: 'a', type: 'function', function: { name: 'set_song', arguments: '{}' } }] },
    { role: 'tool', tool_call_id: 'a', content: 'song updated' },
    { role: 'assistant', content: 'done' },
  ];

  const out = await compactConversation({ fetchFn, baseUrl: 'https://x/v1', apiKey: 'k', model: 'm', messages });

  // The summary request carries the WHOLE history — that is what it summarises.
  assert.equal(sent[0].messages.length, messages.length + 1);
  assert.match(sent[0].messages.at(-1).content, /Summarise this session/);

  // What comes back is a fresh, short history that keeps the system prompt.
  assert.equal(out.messages[0].content, 'SYSTEM');
  assert.equal(out.messages.length, 2);
  assert.equal(out.messages[1].role, 'user', 'the summary is context we supply, not something the model claimed');
  assert.match(out.messages[1].content, /hand-tuned the echo/);
  assert.ok(conversationChars(out.messages) < conversationChars(messages));
  assert.match(out.summary, /kick/);
});

test('the compaction threshold leaves room under the proxy cap', () => {
  // 60000 is MAX_MESSAGES_CHARS in functions/nearai. Compacting AT the cap would
  // be too late: the turn that triggers it still has to fit.
  assert.ok(COMPACT_AT_CHARS < 60000);
  assert.ok(COMPACT_AT_CHARS > 20000, 'compacting too eagerly throws away context that still fits');
  assert.equal(conversationChars([{ role: 'system', content: 'x'.repeat(50000) }]), 2,
    'the system prompt is not part of the conversation budget');
});
