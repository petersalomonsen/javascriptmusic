// NEP-413 `signMessage` verification — proving control of a NEAR account.
//
// Extracted from functions/gitproxy so the payment gate can share it: proving
// "I am alice.near" is the same problem whether it gates the git proxy or
// claims a payment. Ported from ariz-gateway's verifier to the Workers runtime
// (crypto.subtle Ed25519 + a small base58 decoder, no Node built-ins).
//
// A token is base64(JSON{accountId, publicKey, signature, message, nonce,
// recipient}) — what a wallet's signMessage returns, plus the account id.

export const NEP413_TAG = 2147484061;   // 2^31 + 413
export const DEFAULT_MAX_AGE_MS = 60 * 60 * 1000;

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function base58Decode(s) {
  const map = {}; for (let i = 0; i < B58.length; i++) map[B58[i]] = i;
  const bytes = [0];
  for (const ch of s) {
    const val = map[ch]; if (val === undefined) throw new Error('bad base58');
    let carry = val;
    for (let j = 0; j < bytes.length; j++) { carry += bytes[j] * 58; bytes[j] = carry & 0xff; carry >>= 8; }
    while (carry) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  for (let k = 0; k < s.length && s[k] === '1'; k++) bytes.push(0);
  return new Uint8Array(bytes.reverse());
}

export function base58Encode(bytes) {
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) { carry += digits[j] << 8; digits[j] = carry % 58; carry = (carry / 58) | 0; }
    while (carry) { digits.push(carry % 58); carry = (carry / 58) | 0; }
  }
  let str = '';
  for (let k = 0; k < bytes.length && bytes[k] === 0; k++) str += '1';
  for (let q = digits.length - 1; q >= 0; q--) str += B58[digits[q]];
  return str;
}

export const b64ToBytes = (b64) => {
  const bin = atob(b64); const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
};
const u32le = (n) => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; };
const concatBytes = (chunks) => {
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
};

export function serializeNep413Payload({ message, nonce, recipient, callbackUrl = null }) {
  if (!(nonce instanceof Uint8Array) || nonce.length !== 32) throw new Error('nonce must be 32 bytes');
  const enc = new TextEncoder();
  const str = (s) => { const b = enc.encode(s); return [u32le(b.length), b]; };
  const chunks = [u32le(NEP413_TAG), ...str(message), nonce, ...str(recipient),
    callbackUrl == null ? new Uint8Array([0]) : new Uint8Array([1])];
  if (callbackUrl != null) chunks.push(...str(callbackUrl));
  return concatBytes(chunks);
}

/**
 * Verify the CRYPTO + freshness of a NEP-413 bearer token. Returns
 * { accountId, publicKey, message } or throws. Whether that key is actually on
 * the account is a separate, on-chain question — see accountHasKey.
 */
export async function verifyNep413Crypto(token, { recipient, now = Date.now(), maxAgeMs = DEFAULT_MAX_AGE_MS } = {}) {
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(b64ToBytes(token))); }
  catch { throw new Error('failed to parse token'); }
  const { accountId, publicKey, signature, message, nonce, recipient: rcpt, callbackUrl } = payload;
  if (!accountId || !publicKey || !signature || !message || !nonce || !rcpt) throw new Error('incomplete token');
  if (rcpt !== recipient) throw new Error('recipient mismatch');
  let claims;
  try { claims = JSON.parse(message); } catch { throw new Error('bad message'); }
  const { issuedAt } = claims;
  if (!(typeof issuedAt === 'number' && issuedAt <= now && issuedAt > now - maxAgeMs)) throw new Error('token expired');
  const serialized = serializeNep413Payload({ message, nonce: b64ToBytes(nonce), recipient: rcpt, callbackUrl: callbackUrl ?? null });
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', serialized));
  const rawPub = base58Decode(publicKey.replace(/^ed25519:/, ''));
  const key = await crypto.subtle.importKey('raw', rawPub, { name: 'Ed25519' }, false, ['verify']);
  if (!(await crypto.subtle.verify('Ed25519', key, b64ToBytes(signature), digest))) throw new Error('invalid signature');
  return { accountId, publicKey, message, claims };
}

/**
 * Is this public key on this account, on this network? Cached briefly — the
 * cache key includes the network because the same account id can exist on both.
 *
 * The TTL is deliberately short: a key added to an account moments ago would
 * otherwise read as absent, which for a payment proof means a spurious refusal.
 */
const keyCache = new Map();

/** Drop the cached access-key lists. Exported for tests, which reuse one
 *  account id with different keys. */
export const clearKeyCache = () => keyCache.clear();
export async function accountHasKey(accountId, publicKey, { networkId, rpcUrl, ttlMs = 60000, now = Date.now() }) {
  const cacheKey = `${networkId}:${accountId}`;
  const cached = keyCache.get(cacheKey);
  let keys = cached && cached.exp > now ? cached.keys : null;
  if (!keys) {
    const res = await fetch(rpcUrl, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 'nep413', method: 'query',
        params: { request_type: 'view_access_key_list', finality: 'final', account_id: accountId },
      }),
    });
    const json = await res.json();
    if (json.error) throw new Error('rpc error: ' + JSON.stringify(json.error).slice(0, 160));
    keys = json.result?.keys || [];
    keyCache.set(cacheKey, { keys, exp: now + ttlMs });
  }
  return keys.some((k) => k.public_key === publicKey);
}
