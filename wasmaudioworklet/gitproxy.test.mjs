import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from './functions/gitproxy/[[path]].js';

const APP = 'https://app.example';
const ctx = (method, path, headers = {}) => ({ request: new Request(APP + path, { method, headers }) });

test('OPTIONS preflight → 204 with CORS', async () => {
  const res = await onRequest(ctx('OPTIONS', '/gitproxy/github.com/u/r.git/info/refs'));
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  assert.match(res.headers.get('access-control-allow-headers'), /Authorization/);
});

test('disallowed host → 403 (not an open proxy)', async () => {
  const res = await onRequest(ctx('GET', '/gitproxy/evil.example/x.git/info/refs?service=git-upload-pack'));
  assert.equal(res.status, 403);
});

test('non-git endpoint on an allowed host → 403', async () => {
  const res = await onRequest(ctx('GET', '/gitproxy/github.com/u/r.git/some/other/path'));
  assert.equal(res.status, 403);
});

test('GET info/refs → forwards to GitHub, Bearer→Basic, CORS + content-type passed', async () => {
  let captured;
  globalThis.fetch = async (url, opts) => {
    captured = { url, opts };
    return new Response('# refs', { status: 200, headers: { 'content-type': 'application/x-git-upload-pack-advertisement' } });
  };
  const res = await onRequest(ctx('GET', '/gitproxy/github.com/u/r.git/info/refs?service=git-upload-pack', { Authorization: 'Bearer TKN123' }));
  assert.equal(res.status, 200);
  assert.equal(captured.url, 'https://github.com/u/r.git/info/refs?service=git-upload-pack');
  const fwdAuth = captured.opts.headers.get('authorization');
  assert.match(fwdAuth, /^Basic /);
  assert.equal(Buffer.from(fwdAuth.slice(6), 'base64').toString(), 'x-access-token:TKN123');
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  assert.equal(res.headers.get('content-type'), 'application/x-git-upload-pack-advertisement');
});

test('POST git-receive-pack (push) is allowed and forwarded', async () => {
  let method;
  globalThis.fetch = async (_url, opts) => { method = opts.method; return new Response('ok', { status: 200 }); };
  const res = await onRequest(ctx('POST', '/gitproxy/github.com/u/r.git/git-receive-pack', { 'content-type': 'application/x-git-receive-pack-request' }));
  assert.equal(res.status, 200);
  assert.equal(method, 'POST');
});

test('non-Bearer Authorization is passed through unchanged', async () => {
  let fwd;
  globalThis.fetch = async (_url, opts) => { fwd = opts.headers.get('authorization'); return new Response('', { status: 200 }); };
  await onRequest(ctx('GET', '/gitproxy/gitlab.com/u/r.git/info/refs?service=git-upload-pack', { Authorization: 'Basic already' }));
  assert.equal(fwd, 'Basic already');
});
