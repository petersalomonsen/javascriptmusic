// node --test — unit tests for the locked-down NEAR AI Pages Function proxy:
// server-side key (NEARAI_API_KEY secret), server-chosen model, server-enforced
// tools, size caps, and the x402 paywall. The system PROMPT is the client's —
// see the forwarding test below for why. NOT an open relay, and not free.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest, MODEL, modelFor } from './functions/nearai/[[path]].js';
import { resolveDefaultBaseUrl, DEFAULT_BASE_URL, DEFAULT_MODEL, toOpenAiTools } from './studio-agent/nearai-core.js';
import { SYSTEM_PROMPT } from './studio-agent/prompt.js';
import { x402Config, mintPass, HEADER_PASS } from './functions/_x402.js';
import { runAgentTurn } from './studio-agent/nearai-core.js';

const APP = 'https://webassemblymusic.pages.dev';
const ENV = { NEARAI_API_KEY: 'SERVER_KEY', PASS_SECRET: 'TEST_PASS_SECRET' };
const ctx = (method, path, headers = {}, body, env = ENV) => ({
  env,
  request: new Request(APP + path, { method, headers, body }),
});

// Every chat test needs a paid pass now — the proxy runs on OUR credits, so
// there is no unpaid path to the upstream. The paywall itself is covered in
// x402.test.mjs; here it is just the ticket through the door.
const PASS = await mintPass(x402Config(ENV), { accountId: 'tester.near' });

const chat = (body, headers = {}) => ctx('POST', '/nearai/v1/chat/completions',
  { Origin: APP, 'Content-Type': 'application/json', [HEADER_PASS]: PASS, ...headers }, JSON.stringify(body));

function captureFetch(response = new Response('{"choices":[]}', { status: 200, headers: { 'content-type': 'application/json' } })) {
  const captured = {};
  globalThis.fetch = async (url, opts = {}) => {
    captured.url = url;
    captured.opts = opts;
    captured.body = opts.body ? JSON.parse(opts.body) : null;
    return response;
  };
  return captured;
}

test('OPTIONS preflight → 204 with CORS', async () => {
  const res = await onRequest(ctx('OPTIONS', '/nearai/v1/chat/completions', { Origin: APP }));
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), APP);
});

test('an unpaid request gets 402 even when the server key is missing', async () => {
  // Ordering matters: a 503 here would leak configuration to unpaid callers,
  // and would make the paywall untestable without a real NEAR AI key.
  const res = await onRequest(ctx('POST', '/nearai/v1/chat/completions',
    { Origin: APP, 'Content-Type': 'application/json' },
    JSON.stringify({ messages: [] }), { PASS_SECRET: 'TEST_PASS_SECRET' }));
  assert.equal(res.status, 402);
  assert.ok(res.headers.get('PAYMENT-REQUIRED'));
});

test('paid but no NEARAI_API_KEY secret → 503 with a clear message', async () => {
  // A PAYING caller deserves to know the server is misconfigured; an unpaid
  // one gets a 402 and learns nothing (previous test).
  const res = await onRequest(ctx('POST', '/nearai/v1/chat/completions',
    { Origin: APP, 'Content-Type': 'application/json', [HEADER_PASS]: PASS },
    '{"messages":[]}', { PASS_SECRET: 'TEST_PASS_SECRET' }));
  assert.equal(res.status, 503);
  assert.match(await res.text(), /NEARAI_API_KEY/);
});

test('chat/completions: server key used, client Authorization ignored', async () => {
  const captured = captureFetch();
  const res = await onRequest(chat({ model: DEFAULT_MODEL, messages: [{ role: 'user', content: 'hi' }] },
    { Authorization: 'Bearer CLIENT_KEY' }));
  assert.equal(res.status, 200);
  assert.equal(captured.url, 'https://cloud-api.near.ai/v1/chat/completions');
  assert.equal(captured.opts.headers.Authorization, 'Bearer SERVER_KEY');
  assert.ok(!JSON.stringify(captured.body).includes('CLIENT_KEY'));
});

// The client owns the system prompt. It was enforced here once, on the theory
// that it kept the endpoint from being a general-purpose LLM — but a pass-holder
// writes every user turn anyway, so it never bought that. The pass, the size
// caps and the server-chosen model are what bound this endpoint.
test('the client system prompt is forwarded, not stripped', async () => {
  const captured = captureFetch();
  await onRequest(chat({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: 'PROJECT RULES: only write house music' },
      { role: 'user', content: 'hi' },
    ],
  }));
  const msgs = captured.body.messages;
  assert.equal(msgs[0].role, 'system');
  assert.equal(msgs[0].content, 'PROJECT RULES: only write house music');
  assert.deepEqual(msgs.slice(1), [{ role: 'user', content: 'hi' }]);
});

test('a client that sends no system prompt still gets the app default', async () => {
  const captured = captureFetch();
  await onRequest(chat({ model: DEFAULT_MODEL, messages: [{ role: 'user', content: 'hi' }] }));
  const msgs = captured.body.messages;
  assert.equal(msgs[0].role, 'system');
  assert.ok(msgs[0].content.startsWith(SYSTEM_PROMPT.slice(0, 40)));
  assert.deepEqual(msgs.slice(1), [{ role: 'user', content: 'hi' }]);
});

test('an oversized system prompt is refused, not forwarded', async () => {
  const captured = captureFetch();
  const res = await onRequest(chat({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: 'x'.repeat(80001) },
      { role: 'user', content: 'hi' },
    ],
  }));
  assert.equal(res.status, 413);
  assert.match((await res.json()).error, /system prompt too large/);
  assert.equal(captured.body, undefined, 'nothing should reach the upstream');
});

test('the model stays ours even though the prompt does not', async () => {
  const captured = captureFetch();
  await onRequest(chat({
    model: 'something/expensive',
    messages: [
      { role: 'system', content: 'my own prompt' },
      { role: 'user', content: 'hi' },
    ],
  }));
  assert.notEqual(captured.body.model, 'something/expensive');
});

test('tools are enforced server-side; client tools ignored', async () => {
  const captured = captureFetch();
  await onRequest(chat({
    model: DEFAULT_MODEL,
    messages: [{ role: 'user', content: 'hi' }],
    tools: [{ type: 'function', function: { name: 'evil_tool', parameters: {} } }],
  }));
  assert.equal(captured.body.tools.length, toOpenAiTools().length);
  assert.ok(!JSON.stringify(captured.body.tools).includes('evil_tool'));
});

test('the client cannot choose the model — we pay, so we choose', async () => {
  const captured = captureFetch();
  // Not even a cheap, plausible one: the proxy offers OUR model or nothing.
  await onRequest(chat({ model: 'openai/gpt-5.5', messages: [{ role: 'user', content: 'hi' }] }));
  assert.equal(captured.body.model, MODEL);
  await onRequest(chat({ model: 'deepseek-ai/DeepSeek-V4-Flash', messages: [{ role: 'user', content: 'hi' }] }));
  assert.equal(captured.body.model, MODEL);
});

test('the deployment can pick the model without a code change', async () => {
  const captured = captureFetch();
  await onRequest(ctx('POST', '/nearai/v1/chat/completions',
    { Origin: APP, 'Content-Type': 'application/json', [HEADER_PASS]: PASS },
    JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
    { ...ENV, NEARAI_MODEL: 'openai/gpt-oss-120b' }));
  assert.equal(captured.body.model, 'openai/gpt-oss-120b');
  assert.equal(modelFor({ NEARAI_MODEL: 'x' }), 'x');
  assert.equal(modelFor({}), MODEL);
});

// Bounded, but not so tight that a thinking model spends the whole budget on
// reasoning and returns nothing — a real turn came back with finish_reason
// "length", completion_tokens 2000 of a 2000 cap and reasoning_tokens 2001,
// having burned 23k of paid input for no output at all. A cap that forces the
// user to send it all again is not bounding spend, it is doubling it. So the
// floor matters as much as the ceiling here.
test('completion length is capped, with room for thinking AND an answer', async () => {
  const captured = captureFetch();
  await onRequest(chat({ messages: [{ role: 'user', content: 'hi' }] }));
  assert.equal(typeof captured.body.max_tokens, 'number');
  assert.ok(captured.body.max_tokens >= 4000,
    `too tight for a reasoning model to finish a turn: ${captured.body.max_tokens}`);
  assert.ok(captured.body.max_tokens <= 32000,
    `unbounded or absurd max_tokens: ${captured.body.max_tokens}`);
});

test('the conversation cap is near real usage, not at the context limit', async () => {
  // 300k chars (~75k tokens) let a single turn cost ~$1. Real turns are far
  // below this, so the cap should bind on abuse, not on normal work.
  const res = await onRequest(chat({ messages: [{ role: 'user', content: 'x'.repeat(70000) }] }));
  assert.equal(res.status, 413);
  const ok = captureFetch();
  await onRequest(chat({ messages: [{ role: 'user', content: 'x'.repeat(20000) }] }));
  assert.ok(ok.url, 'a normal-sized turn must still go through');
});

test('the model catalog is no longer proxied — nothing to choose from', async () => {
  // It existed so a client could pick a model, and spent a request on our key
  // doing it.
  const res = await onRequest(ctx('GET', '/nearai/v1/models', { Origin: APP }));
  assert.equal(res.status, 403);
});

test('any other path/method → 403', async () => {
  assert.equal((await onRequest(ctx('POST', '/nearai/v1/embeddings', { Origin: APP }, '{}'))).status, 403);
  assert.equal((await onRequest(ctx('GET', '/nearai/v1/chat/completions', { Origin: APP }))).status, 403);
  assert.equal((await onRequest(ctx('DELETE', '/nearai/v1/models', { Origin: APP }))).status, 403);
  assert.equal((await onRequest(ctx('GET', '/nearai/v1/models', { Origin: APP }))).status, 403);
});

test('foreign origin → 403 (no piggybacking on the server key)', async () => {
  const res = await onRequest(ctx('POST', '/nearai/v1/chat/completions', { Origin: 'https://evil.example' }, '{}'));
  assert.equal(res.status, 403);
});

test('resolveDefaultBaseUrl: direct on localhost, proxy elsewhere', () => {
  assert.equal(resolveDefaultBaseUrl('localhost'), DEFAULT_BASE_URL);
  assert.equal(resolveDefaultBaseUrl('127.0.0.1'), DEFAULT_BASE_URL);
  assert.equal(resolveDefaultBaseUrl('webassemblymusic.pages.dev'), '/nearai/v1');
});

// --- the paywall, from the proxy's side --------------------------------------

test('no pass → 402, and the server key is NEVER used', async () => {
  const captured = captureFetch();
  const res = await onRequest(ctx('POST', '/nearai/v1/chat/completions',
    { Origin: APP, 'Content-Type': 'application/json' },
    JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] })));
  assert.equal(res.status, 402);
  assert.ok(res.headers.get('PAYMENT-REQUIRED'), 'must tell the client how to pay');
  assert.equal(captured.url, undefined, 'a 402 must not reach NEAR AI on our key');
});

test('an unpaid request cannot fall through to the free behaviour', async () => {
  // The bypass this guards: "send nothing, get served on our budget".
  for (const headers of [{}, { [HEADER_PASS]: 'garbage' }, { Authorization: 'Bearer sk-someone-elses-key' }]) {
    const res = await onRequest(ctx('POST', '/nearai/v1/chat/completions',
      { Origin: APP, 'Content-Type': 'application/json', ...headers },
      JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] })));
    assert.equal(res.status, 402, `expected 402 for ${JSON.stringify(headers)}`);
  }
});

test('a pass minted for a different deployment secret is refused', async () => {
  const foreign = await mintPass(x402Config({ PASS_SECRET: 'OTHER' }), { accountId: 'tester.near' });
  const res = await onRequest(ctx('POST', '/nearai/v1/chat/completions',
    { Origin: APP, 'Content-Type': 'application/json', [HEADER_PASS]: foreign },
    JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] })));
  assert.equal(res.status, 402);
});

test('CORS exposes the payment headers, or the browser cannot complete the loop', async () => {
  const res = await onRequest(ctx('OPTIONS', '/nearai/v1/chat/completions', { Origin: APP }));
  const expose = res.headers.get('access-control-expose-headers') || '';
  assert.match(expose, /PAYMENT-REQUIRED/);
  assert.match(expose, /X-Studio-Pass/);
  assert.match(res.headers.get('access-control-allow-headers') || '', /X-Studio-Pass/);
});

test('an exhausted credit pool is NOT reported as "you need a pass"', async () => {
  // NEAR AI answers 402 when our credits run out. Passing that through would
  // collide with our own 402 and make the client discard a valid pass.
  captureFetch(new Response('{"error":{"message":"insufficient credits"}}', { status: 402 }));
  const res = await onRequest(chat({ messages: [{ role: 'user', content: 'hi' }] }));
  assert.notEqual(res.status, 402, 'must not look like a paywall response');
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.error, 'out_of_credits');
  assert.match(body.message, /still valid/, 'the user should keep their pass');
});

// ---- the whole serverless path, end to end, with no network -----------------
//
// Every proxy test above hands onRequest a body written by hand. Nothing ran the
// CLIENT LOOP through it, and that gap let three bugs reach a user before they
// reached a test:
//
//   #207  the loop echoed the model's reasoning back, and a session 413'd
//   #208  a tool call with empty arguments poisoned the history for good
//   #212  max_tokens was too small for a thinking model to finish a turn
//
// None was findable from the direct-key path, which sets no max_tokens and
// enforces no caps. So: drive runAgentTurn against onRequest, mock only the
// upstream, and assert on what actually arrives there.
function upstreamScript(...completions) {
  const seen = [];
  let i = 0;
  globalThis.fetch = async (url, opts = {}) => {
    seen.push(JSON.parse(opts.body));
    const body = completions[Math.min(i++, completions.length - 1)];
    return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  return seen;
}

const assistant = (extra) => ({ choices: [{ message: { role: 'assistant', ...extra }, finish_reason: extra.tool_calls ? 'tool_calls' : 'stop' }], usage: { total_tokens: 10 } });
const call = (id, name, args) => ({ id, type: 'function', function: { name, arguments: args } });

test('the client loop through the proxy sends nothing the upstream would reject', async () => {
  const upstream = upstreamScript(
    // A thinking model, with a tool call whose arguments never arrived.
    assistant({ reasoning_content: 'R'.repeat(9000), tool_calls: [call('c1', 'get_song', '')] }),
    assistant({ reasoning_content: 'R'.repeat(9000), content: 'done' }),
  );

  const messages = [{ role: 'user', content: 'make a kick' }];
  await runAgentTurn({
    // The client's fetch, but pointed at the real Pages Function.
    fetchFn: async (url, opts) => onRequest(chat(JSON.parse(opts.body))),
    baseUrl: '/nearai/v1', apiKey: '', model: 'ignored-by-proxy',
    sendTools: false, messages, runTool: async () => 'setBPM(120);',
  });

  assert.ok(upstream.length >= 2, 'the loop should have taken more than one trip');
  for (const [n, body] of upstream.entries()) {
    // #212 — a budget the model can actually finish a turn inside.
    assert.ok(body.max_tokens >= 4000, `request ${n}: max_tokens ${body.max_tokens}`);
    // #207 — the model's own thinking must not be handed back to it.
    assert.ok(!JSON.stringify(body.messages).includes('RRRRR'),
      `request ${n} carries reasoning back to the upstream`);
    for (const m of body.messages) {
      // #208 — an unparseable arguments string rejects the WHOLE conversation.
      for (const c of m.tool_calls ?? []) {
        assert.doesNotThrow(() => JSON.parse(c.function.arguments),
          `request ${n}: ${c.function.name} has invalid JSON arguments`);
      }
    }
    assert.equal(body.messages[0].role, 'system', `request ${n} lost its system prompt`);
  }
});

test('a long session stays inside the proxy cap the direct path never enforces', async () => {
  // Ten trips, each answering with a document-sized tool result — the shape that
  // grew a real session past 60k and 413'd it.
  const upstream = upstreamScript(
    ...Array.from({ length: 9 }, (_, i) => assistant({
      reasoning_content: 'R'.repeat(4000),
      tool_calls: [call(`c${i}`, 'get_song', '{}')],
    })),
    assistant({ content: 'finished' }),
  );

  const messages = [{ role: 'user', content: 'build a track' }];
  const { messages: after } = await runAgentTurn({
    fetchFn: async (url, opts) => {
      const res = await onRequest(chat(JSON.parse(opts.body)));
      assert.notEqual(res.status, 413, 'the conversation outgrew the proxy cap');
      return res;
    },
    baseUrl: '/nearai/v1', apiKey: '', model: 'm',
    sendTools: false, messages,
    runTool: async () => 'setBPM(125);\n' + 'x'.repeat(2500),
  });

  assert.ok(upstream.length >= 10, `expected the full loop, got ${upstream.length} trips`);
  assert.ok(after.length > 10, 'history should hold every turn');
});
