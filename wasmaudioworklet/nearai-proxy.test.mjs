// node --test — unit tests for the NEAR AI same-origin Pages Function proxy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from './functions/nearai/[[path]].js';
import { resolveDefaultBaseUrl, DEFAULT_BASE_URL } from './studio-agent-nearai-core.js';

const APP = 'https://webassemblymusic.pages.dev';
const ctx = (method, path, headers = {}, body) => ({
  request: new Request(APP + path, { method, headers, body }),
});

test('OPTIONS preflight → 204 with CORS', async () => {
  const res = await onRequest(ctx('OPTIONS', '/nearai/v1/chat/completions', { Origin: APP }));
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), APP);
  assert.match(res.headers.get('access-control-allow-headers'), /Authorization/);
});

test('POST chat/completions → forwards to cloud-api.near.ai with Bearer passthrough', async () => {
  let captured;
  globalThis.fetch = async (url, opts) => {
    captured = { url, opts, body: opts.body };
    return new Response('{"choices":[]}', { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const res = await onRequest(ctx('POST', '/nearai/v1/chat/completions',
    { Origin: APP, Authorization: 'Bearer USER_KEY', 'Content-Type': 'application/json' },
    '{"model":"m","messages":[]}'));
  assert.equal(res.status, 200);
  assert.equal(captured.url, 'https://cloud-api.near.ai/v1/chat/completions');
  assert.equal(captured.opts.headers.get('authorization'), 'Bearer USER_KEY');
  assert.equal(captured.opts.method, 'POST');
  assert.equal(await res.text(), '{"choices":[]}');
});

test('GET models → forwards with query string', async () => {
  let captured;
  globalThis.fetch = async (url) => { captured = url; return new Response('{"data":[]}', { status: 200 }); };
  const res = await onRequest(ctx('GET', '/nearai/v1/models?limit=5', { Origin: APP }));
  assert.equal(res.status, 200);
  assert.equal(captured, 'https://cloud-api.near.ai/v1/models?limit=5');
});

test('non-v1 path → 403 (not an open proxy)', async () => {
  const res = await onRequest(ctx('GET', '/nearai/admin/keys', { Origin: APP }));
  assert.equal(res.status, 403);
});

test('path traversal → 403', async () => {
  const res = await onRequest(ctx('GET', '/nearai/v1/../secrets', { Origin: APP }));
  assert.equal(res.status, 403);
});

test('foreign origin → 403 (no piggybacking)', async () => {
  const res = await onRequest(ctx('POST', '/nearai/v1/chat/completions', { Origin: 'https://evil.example' }));
  assert.equal(res.status, 403);
});

test('preview-deploy origins are allowed', async () => {
  globalThis.fetch = async () => new Response('{}', { status: 200 });
  const res = await onRequest(ctx('GET', '/nearai/v1/models', { Origin: 'https://abc123.webassemblymusic.pages.dev' }));
  assert.equal(res.status, 200);
});

test('DELETE → 405', async () => {
  const res = await onRequest(ctx('DELETE', '/nearai/v1/models', { Origin: APP }));
  assert.equal(res.status, 405);
});

test('resolveDefaultBaseUrl: direct on localhost, proxy elsewhere', () => {
  assert.equal(resolveDefaultBaseUrl('localhost'), DEFAULT_BASE_URL);
  assert.equal(resolveDefaultBaseUrl('127.0.0.1'), DEFAULT_BASE_URL);
  assert.equal(resolveDefaultBaseUrl('webassemblymusic.pages.dev'), '/nearai/v1');
  assert.equal(resolveDefaultBaseUrl('petersalomonsen.com'), '/nearai/v1');
});
