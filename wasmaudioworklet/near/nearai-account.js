// Connecting a user's own NEAR AI account, so the studio agent runs on their
// credits and talks to NEAR AI directly from the browser.
//
// A wallet sign-in only yields a session, and inference accepts API keys only,
// so the session is used once: create a capped, expiring key, then revoke the
// session. The app never keeps full access to the account.
//
// The sign-in message, recipient and nonce shape are checked by NEAR AI, and the
// wallet signs over them, so they must match exactly.

export const NEARAI_API = 'https://cloud-api.near.ai';
export const SIGN_IN_MESSAGE = 'Sign in to NEAR AI Cloud';
export const SIGN_IN_RECIPIENT = 'cloud.near.ai';
export const DEFAULT_LIMIT_USD = 5;

const KEY_NAME = 'WebAssembly Music';
const KEY_LIFETIME_MS = 90 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'nearai-api-key';
const STORAGE_KEY_ID = 'nearai-key-id';
const STORAGE_WORKSPACE = 'nearai-key-workspace';

/** 8 bytes of big-endian epoch milliseconds, then 24 random bytes. */
export function buildNonce(nowMs = Date.now()) {
  const nonce = new Uint8Array(32);
  new DataView(nonce.buffer).setBigUint64(0, BigInt(nowMs), false);
  crypto.getRandomValues(nonce.subarray(8));
  return nonce;
}

/** $ to the API's nano-dollar price, without going through a binary fraction. */
export function spendLimit(usd) {
  const cents = Math.round(Number(usd) * 100);
  if (!Number.isFinite(cents) || cents <= 0) throw new Error('The spending limit must be above zero.');
  return { amount: cents * 10_000_000, scale: 9, currency: 'USD' };
}

const request = async (fetchFn, path, token, init = {}) => fetchFn(NEARAI_API + path, {
  ...init,
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
});

/**
 * 'ok', 'no-credits', 'invalid', or 'unknown' when NEAR AI could not say. This
 * spends nothing, since the check endpoint runs no inference.
 */
export async function checkKey(key, { fetchFn = fetch } = {}) {
  try {
    const res = await request(fetchFn, '/v1/check_api_key', key, { method: 'POST' });
    if (res.ok) return 'ok';
    if (res.status === 402) return 'no-credits';
    if (res.status === 401 || res.status === 403) return 'invalid';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/** A new key takes up to 10 s to activate, and reads as invalid until then. */
async function checkNewKey(key, { fetchFn, sleepFn }) {
  let status = 'unknown';
  for (let attempt = 0; attempt < 8; attempt++) {
    status = await checkKey(key, { fetchFn });
    if (status !== 'invalid') return status;
    await sleepFn(2000);
  }
  return status;
}

async function revokeThisSession(session, { fetchFn, nowMs }) {
  const res = await request(fetchFn, '/v1/users/me/refresh-tokens', session);
  if (!res.ok) return;
  const sessions = await res.json();
  const newest = sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  // Never another device's session: only one created by this sign-in.
  if (newest && nowMs() - new Date(newest.created_at).getTime() < 10 * 60 * 1000) {
    await request(fetchFn, `/v1/users/me/refresh-tokens/${newest.id}`, session, { method: 'DELETE' });
  }
}

const describeFailure = async (what, res) => {
  const body = await res.json().catch(() => ({}));
  return new Error(`${what} (${res.status})${body?.error?.message ? `: ${body.error.message}` : ''}`);
};

/**
 * Sign in with a wallet and create this app's key. Returns the key for the caller
 * to store. One wallet prompt, no transaction.
 */
export async function connectWithWallet(wallet, {
  limitUsd = DEFAULT_LIMIT_USD, previous = null, fetchFn = fetch,
  sleepFn = (ms) => new Promise((r) => setTimeout(r, ms)), nowMs = () => Date.now(), onStatus = () => {},
} = {}) {
  const limit = spendLimit(limitUsd);
  const nonce = buildNonce(nowMs());
  onStatus('signing');
  const signed = await wallet.signMessage({ message: SIGN_IN_MESSAGE, recipient: SIGN_IN_RECIPIENT, nonce });

  onStatus('signing-in');
  const auth = await request(fetchFn, '/v1/auth/near', null, {
    method: 'POST',
    body: JSON.stringify({
      signed_message: { accountId: signed.accountId, publicKey: signed.publicKey, signature: signed.signature },
      payload: { message: SIGN_IN_MESSAGE, nonce: Array.from(nonce), recipient: SIGN_IN_RECIPIENT },
    }),
  });
  if (!auth.ok) throw await describeFailure('NEAR AI refused the sign-in', auth);
  const session = (await auth.json()).access_token;

  try {
    const me = await request(fetchFn, '/v1/users/me', session);
    if (!me.ok) throw await describeFailure('Could not read your NEAR AI account', me);
    const workspaceId = (await me.json()).workspaces?.[0]?.id;
    if (!workspaceId) throw new Error('Your NEAR AI account has no workspace to create a key in.');

    onStatus('creating-key');
    const created = await request(fetchFn, `/v1/workspaces/${workspaceId}/api-keys`, session, {
      method: 'POST',
      body: JSON.stringify({
        name: KEY_NAME, spendLimit: limit, expires_at: new Date(nowMs() + KEY_LIFETIME_MS).toISOString(),
      }),
    });
    if (!created.ok) throw await describeFailure('Could not create a key', created);
    const { key, id } = await created.json();
    if (!key) throw new Error('NEAR AI did not return the new key.');

    // The key this browser made last time is replaced, not left active. A failed
    // delete loses nothing: that key is capped and expires on its own.
    if (previous?.keyId && previous.workspaceId === workspaceId) {
      await request(fetchFn, `/v1/workspaces/${workspaceId}/api-keys/${previous.keyId}`, session, { method: 'DELETE' }).catch(() => {});
    }

    onStatus('checking');
    const status = await checkNewKey(key, { fetchFn, sleepFn });
    return { key, keyId: id, workspaceId, accountId: signed.accountId, status };
  } finally {
    await revokeThisSession(session, { fetchFn, nowMs }).catch(() => {});
  }
}

export function loadAccount(storage = localStorage) {
  const key = storage.getItem(STORAGE_KEY);
  if (!key) return null;
  return { key, keyId: storage.getItem(STORAGE_KEY_ID), workspaceId: storage.getItem(STORAGE_WORKSPACE) };
}

/** Local to this browser. It must never reach the OPFS repo, which gets pushed. */
export function storeAccount({ key, keyId = null, workspaceId = null }, storage = localStorage) {
  // Own-account mode replaces proxy mode, or the key would be silently ignored.
  storage.removeItem('nearai-base-url');
  storage.removeItem('nearai-enabled');
  for (const [name, value] of [[STORAGE_KEY_ID, keyId], [STORAGE_WORKSPACE, workspaceId]]) {
    if (value) storage.setItem(name, value); else storage.removeItem(name);
  }
  storage.setItem(STORAGE_KEY, key);
}

export function forgetAccount(storage = localStorage) {
  for (const name of [STORAGE_KEY, STORAGE_KEY_ID, STORAGE_WORKSPACE]) storage.removeItem(name);
}
