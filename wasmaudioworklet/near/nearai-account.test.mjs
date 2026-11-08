import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildNonce, spendLimit, checkKey, connectWithWallet, storeAccount, loadAccount, forgetAccount,
  SIGN_IN_MESSAGE, SIGN_IN_RECIPIENT,
} from './nearai-account.js';

const json = (status, body) => new Response(body === undefined ? null : JSON.stringify(body), { status });
const NOW = 1_800_000_000_000;
const wallet = {
  signMessage: async () => ({ accountId: 'alice.near', publicKey: 'ed25519:pk', signature: 'c2ln' }),
};

/** A fake NEAR AI. Returns the calls so a test can assert what was sent. */
function fakeApi(overrides = {}) {
  const calls = [];
  const routes = {
    'POST /v1/auth/near': () => json(200, { access_token: 'session-token' }),
    'GET /v1/users/me': () => json(200, { workspaces: [{ id: 'ws1' }] }),
    'POST /v1/workspaces/ws1/api-keys': () => json(201, { id: 'key1', key: 'sk-new' }),
    'POST /v1/check_api_key': () => json(200, {}),
    'GET /v1/users/me/refresh-tokens': () => json(200, [
      { id: 'old', created_at: new Date(NOW - 86400e3).toISOString() },
      { id: 'mine', created_at: new Date(NOW - 1000).toISOString() },
    ]),
    'DELETE /v1/users/me/refresh-tokens/mine': () => json(204),
    'DELETE /v1/users/me/refresh-tokens/old': () => json(204),
    'DELETE /v1/workspaces/ws1/api-keys/prev': () => json(204),
    ...overrides,
  };
  const fetchFn = async (url, init = {}) => {
    const route = `${init.method || 'GET'} ${new URL(url).pathname}`;
    calls.push({ route, auth: init.headers?.Authorization, body: init.body && JSON.parse(init.body) });
    if (!routes[route]) throw new Error(`unexpected ${route}`);
    return routes[route]();
  };
  return { calls, fetchFn, routes: (r) => calls.filter((c) => c.route === r) };
}
const options = (api, extra = {}) => ({ fetchFn: api.fetchFn, nowMs: () => NOW, sleepFn: async () => {}, ...extra });

test('the nonce starts with the big-endian timestamp NEAR AI validates', () => {
  const nonce = buildNonce(NOW);
  assert.equal(nonce.length, 32);
  assert.equal(new DataView(nonce.buffer).getBigUint64(0, false), BigInt(NOW));
});

test('spendLimit converts dollars to nano-dollars and refuses nonsense', () => {
  assert.deepEqual(spendLimit(5), { amount: 5_000_000_000, scale: 9, currency: 'USD' });
  assert.equal(spendLimit('0.1').amount, 100_000_000);
  assert.throws(() => spendLimit(0));
  assert.throws(() => spendLimit('abc'));
});

test('the wallet flow signs exactly what NEAR AI checks, and returns a capped key', async () => {
  const api = fakeApi();
  const signedWith = [];
  const result = await connectWithWallet({
    signMessage: async (m) => { signedWith.push(m); return wallet.signMessage(); },
  }, options(api, { limitUsd: 2 }));

  assert.equal(signedWith.length, 1);
  assert.equal(signedWith[0].message, SIGN_IN_MESSAGE);
  assert.equal(signedWith[0].recipient, SIGN_IN_RECIPIENT);
  const auth = api.routes('POST /v1/auth/near')[0].body;
  assert.equal(auth.payload.nonce.length, 32);
  assert.ok(Array.isArray(auth.payload.nonce), 'a plain array, not base64');
  const created = api.routes('POST /v1/workspaces/ws1/api-keys')[0];
  assert.equal(created.auth, 'Bearer session-token');
  assert.equal(created.body.spendLimit.amount, 2_000_000_000);
  assert.ok(created.body.expires_at);
  assert.deepEqual(
    { key: result.key, keyId: result.keyId, workspaceId: result.workspaceId, status: result.status },
    { key: 'sk-new', keyId: 'key1', workspaceId: 'ws1', status: 'ok' },
  );
});

test('only the session this sign-in created is revoked', async () => {
  const api = fakeApi();
  await connectWithWallet(wallet, options(api));
  assert.equal(api.routes('DELETE /v1/users/me/refresh-tokens/mine').length, 1);
  assert.equal(api.routes('DELETE /v1/users/me/refresh-tokens/old').length, 0);
});

test('the session is revoked even when creating the key fails', async () => {
  const api = fakeApi({ 'POST /v1/workspaces/ws1/api-keys': () => json(403, { error: { message: 'no' } }) });
  await assert.rejects(connectWithWallet(wallet, options(api)), /Could not create a key \(403\): no/);
  assert.equal(api.routes('DELETE /v1/users/me/refresh-tokens/mine').length, 1);
});

test('the previous key is replaced only after the new one exists', async () => {
  const api = fakeApi();
  await connectWithWallet(wallet, options(api, { previous: { keyId: 'prev', workspaceId: 'ws1' } }));
  const order = api.calls.map((c) => c.route);
  assert.ok(order.indexOf('POST /v1/workspaces/ws1/api-keys') < order.indexOf('DELETE /v1/workspaces/ws1/api-keys/prev'));

  const failing = fakeApi({ 'POST /v1/workspaces/ws1/api-keys': () => json(500, {}) });
  await assert.rejects(connectWithWallet(wallet, options(failing, { previous: { keyId: 'prev', workspaceId: 'ws1' } })));
  assert.equal(failing.routes('DELETE /v1/workspaces/ws1/api-keys/prev').length, 0);
});

test('an empty account still connects, and says so', async () => {
  const api = fakeApi({ 'POST /v1/check_api_key': () => json(402, {}) });
  assert.equal((await connectWithWallet(wallet, options(api))).status, 'no-credits');
});

test('a new key reading invalid is waited on while it activates', async () => {
  let checks = 0;
  const api = fakeApi({ 'POST /v1/check_api_key': () => json(++checks < 3 ? 401 : 200, {}) });
  assert.equal((await connectWithWallet(wallet, options(api))).status, 'ok');
  assert.equal(checks, 3);
});

test('a refused sign-in creates nothing', async () => {
  const api = fakeApi({ 'POST /v1/auth/near': () => json(401, { error: { message: 'bad signature' } }) });
  await assert.rejects(connectWithWallet(wallet, options(api)), /refused the sign-in \(401\): bad signature/);
  assert.equal(api.calls.length, 1);
});

test('checkKey maps the outcomes, and a network failure is not "invalid"', async () => {
  const at = (status) => ({ fetchFn: async () => json(status, {}) });
  assert.equal(await checkKey('k', at(200)), 'ok');
  assert.equal(await checkKey('k', at(402)), 'no-credits');
  assert.equal(await checkKey('k', at(401)), 'invalid');
  assert.equal(await checkKey('k', at(500)), 'unknown');
  assert.equal(await checkKey('k', { fetchFn: async () => { throw new Error('offline'); } }), 'unknown');
});

test('storing an account leaves proxy mode, so the key is actually used', () => {
  const data = new Map([['nearai-base-url', '/nearai/v1'], ['nearai-enabled', '1'], ['nearai-key-id', 'stale']]);
  const storage = {
    getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: (k) => data.delete(k),
  };
  storeAccount({ key: 'sk-pasted' }, storage);
  assert.equal(data.has('nearai-base-url'), false);
  assert.equal(data.has('nearai-enabled'), false);
  assert.deepEqual(loadAccount(storage), { key: 'sk-pasted', keyId: null, workspaceId: null });
  forgetAccount(storage);
  assert.equal(loadAccount(storage), null);
});

test('wallet pages drop COOP under both URLs, because Pages redirects x.html to x', () => {
  const headers = readFileSync(new URL('../_headers', import.meta.url), 'utf8');
  for (const page of ['/pay', '/nearai-connect']) {
    for (const url of [page, `${page}.html`]) {
      assert.match(headers, new RegExp(`^${url.replace('.', '\\.')}\\n  ! Cross-Origin-Opener-Policy`, 'm'), url);
    }
  }
});
