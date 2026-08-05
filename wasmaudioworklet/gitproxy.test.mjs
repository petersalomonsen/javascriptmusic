import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest, base58Encode, base58Decode, serializeNep413Payload, verifyNep413Crypto, jwtSign, jwtVerify } from './functions/gitproxy/[[path]].js';

const b64 = (bytes) => btoa(String.fromCharCode(...bytes));
// Build a NEP-413 bearer token the way a NEAR wallet's signMessage would.
async function makeNep413Token({ issuedAt = Date.now(), recipient = 'webassemblymusic.near', accountId = 'alice.near', kp } = {}) {
  kp = kp || await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  const rawPub = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
  const publicKey = 'ed25519:' + base58Encode(rawPub);
  const message = JSON.stringify({ issuedAt });
  const nonce = crypto.getRandomValues(new Uint8Array(32));
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', serializeNep413Payload({ message, nonce, recipient })));
  const signature = b64(new Uint8Array(await crypto.subtle.sign('Ed25519', kp.privateKey, digest)));
  const payload = { accountId, publicKey, signature, message, nonce: b64(nonce), recipient };
  return { token: b64(new TextEncoder().encode(JSON.stringify(payload))), publicKey, accountId, kp };
}

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

test('request from a disallowed Origin → 403 (blocks other web apps)', async () => {
  const res = await onRequest(ctx('GET', '/gitproxy/github.com/u/r.git/info/refs?service=git-upload-pack', { Origin: 'https://evil.example' }));
  assert.equal(res.status, 403);
});

test('request from an allowed Origin → forwarded, ACAO echoes the origin', async () => {
  globalThis.fetch = async () => new Response('# refs', { status: 200, headers: { 'content-type': 'application/x-git-upload-pack-advertisement' } });
  const res = await onRequest(ctx('GET', '/gitproxy/github.com/u/r.git/info/refs?service=git-upload-pack', { Origin: 'https://webassemblymusic.pages.dev' }));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), 'https://webassemblymusic.pages.dev');
});

test('preview subdomain origin is allowed', async () => {
  globalThis.fetch = async () => new Response('', { status: 200 });
  const res = await onRequest(ctx('GET', '/gitproxy/github.com/u/r.git/info/refs?service=git-upload-pack', { Origin: 'https://git-cors-proxy.webassemblymusic.pages.dev' }));
  assert.equal(res.status, 200);
});

test('gist.github.com is allowed (gists are git repos)', async () => {
  let url;
  globalThis.fetch = async (u) => { url = u; return new Response('# refs', { status: 200 }); };
  const res = await onRequest(ctx('GET', '/gitproxy/gist.github.com/abc123.git/info/refs?service=git-upload-pack'));
  assert.equal(res.status, 200);
  assert.equal(url, 'https://gist.github.com/abc123.git/info/refs?service=git-upload-pack');
});

test('non-Bearer Authorization is passed through unchanged', async () => {
  let fwd;
  globalThis.fetch = async (_url, opts) => { fwd = opts.headers.get('authorization'); return new Response('', { status: 200 }); };
  await onRequest(ctx('GET', '/gitproxy/gitlab.com/u/r.git/info/refs?service=git-upload-pack', { Authorization: 'Basic already' }));
  assert.equal(fwd, 'Basic already');
});

test('base58 round-trips (encode/decode)', () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  assert.deepEqual(base58Decode(base58Encode(bytes)), bytes);
});

test('NEP-413: a valid signed token verifies (crypto round-trip)', async () => {
  const { token, accountId, publicKey } = await makeNep413Token();
  const res = await verifyNep413Crypto(token, { recipient: 'webassemblymusic.near' });
  assert.deepEqual(res, { accountId, publicKey });
});

test('NEP-413: expired token is rejected', async () => {
  const { token } = await makeNep413Token({ issuedAt: Date.now() - 2 * 60 * 60 * 1000 });
  await assert.rejects(verifyNep413Crypto(token, { recipient: 'webassemblymusic.near' }), /expired/);
});

test('NEP-413: recipient mismatch is rejected', async () => {
  const { token } = await makeNep413Token({ recipient: 'someone.else.near' });
  await assert.rejects(verifyNep413Crypto(token, { recipient: 'webassemblymusic.near' }), /recipient mismatch/);
});

test('NEP-413: tampered signature is rejected', async () => {
  const { token } = await makeNep413Token();
  const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(token), (c) => c.charCodeAt(0))));
  payload.signature = btoa(String.fromCharCode(...new Uint8Array(64))); // 64 zero bytes
  const bad = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(payload))));
  await assert.rejects(verifyNep413Crypto(bad, { recipient: 'webassemblymusic.near' }), /invalid signature/);
});

// --- session JWT (HS256), issued after NEP-413+NFT verification ---
test('JWT: sign then verify round-trips with iat + claims', async () => {
  const jwt = await jwtSign({ sub: 'alice.near' }, 'secret-key');
  const payload = await jwtVerify(jwt, 'secret-key');
  assert.equal(payload.sub, 'alice.near');
  assert.equal(typeof payload.iat, 'number');
});

test('JWT: wrong secret is rejected', async () => {
  const jwt = await jwtSign({ sub: 'alice.near' }, 'secret-key');
  await assert.rejects(jwtVerify(jwt, 'other-key'), /bad jwt signature/);
});

test('JWT: tampered payload is rejected', async () => {
  const jwt = await jwtSign({ sub: 'alice.near' }, 'secret-key');
  const parts = jwt.split('.');
  const forged = btoa(JSON.stringify({ sub: 'attacker.near', iat: Math.floor(Date.now() / 1000) })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  await assert.rejects(jwtVerify(`${parts[0]}.${forged}.${parts[2]}`, 'secret-key'), /bad jwt signature/);
});

test('JWT: expired token is rejected (server-decided window)', async () => {
  const jwt = await jwtSign({ sub: 'alice.near' }, 'secret-key');
  await assert.rejects(jwtVerify(jwt, 'secret-key', { maxAgeMs: -1 }), /expired/);
});
