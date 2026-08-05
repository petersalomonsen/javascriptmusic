// Cloudflare Pages Function — CORS proxy for browser git (wasm-git / libgit2).
//
// Lets the in-browser git client clone/push a user's OWN git repo (GitHub,
// GitLab, …) without any storage on our side. The browser can't talk to GitHub
// directly (no CORS, and it wants Basic auth), so this stateless proxy:
//   • is same-origin with the app (so browser→proxy needs no CORS), and also
//     sends CORS headers so a self-hosted / cross-origin copy works too;
//   • forwards ONLY the git smart-HTTP endpoints to an ALLOWLISTED host;
//   • translates `Authorization: Bearer <token>` → Basic, which is what
//     GitHub git-over-HTTPS expects (token as the password).
//
// It NEVER stores or logs tokens — it only forwards. The user's token is scoped
// to their own repo (use a GitHub fine-grained PAT, Contents: read/write), so a
// leak's blast radius is that one repo. Don't trust this instance? It's ~1 file:
// deploy your own copy and point the app's `remote=` at it.
//
// Route:  /gitproxy/<host>/<path…>   →   https://<host>/<path…>
// Remote: https://<origin>/gitproxy/github.com/<user>/<repo>.git

export const ALLOWED_HOSTS = new Set([
  'github.com',
  'gist.github.com', // gists are git repos: https://gist.github.com/<id>.git
  'gitlab.com',
  'codeberg.org',
  'bitbucket.org',
]);

// Only browsers on these origins may use the proxy (blocks other web apps from
// piggybacking on it — the realistic abuse vector). A browser can't spoof its
// Origin from JS; non-browser clients can, but they gain nothing here (they'd
// just hit the git host directly). Requests with NO Origin (same-origin GET /
// non-browser) are allowed. Tighten/remove `localhost` for a locked-down prod.
export const ALLOWED_ORIGINS = [
  /^https:\/\/([a-z0-9-]+\.)?webassemblymusic\.pages\.dev$/, // prod + preview deploys
  /^http:\/\/localhost(:\d+)?$/,                             // local dev
];

const isOriginAllowed = (origin) => !origin || ALLOWED_ORIGINS.some((re) => re.test(origin));

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Near-Auth, Content-Type, Accept, Accept-Encoding, Pragma, Cache-Control',
  'Access-Control-Expose-Headers': 'Content-Type, WWW-Authenticate',
  'Access-Control-Max-Age': '600',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Vary': 'Origin',
});

// Only the three git smart-HTTP endpoints — never an arbitrary path.
const GIT_ENDPOINT = /\/(info\/refs|git-upload-pack|git-receive-pack)$/;

// ============================================================================
// NEP-413 auth + NFT-ownership gate (ported from ariz-gateway for the Workers
// runtime: crypto.subtle Ed25519 + base58, no persistence). Gate = prove control
// of a NEAR account (NEP-413 signature) that owns an NFT on NFT_CONTRACT.
// On-chain ownership is the source of truth; the module Maps are best-effort
// caches only, so NO KV / Durable Object is required. Enforcement is behind a
// flag until the app sends the X-Near-Auth header.
// ============================================================================
export const NEP413_TAG = 2147484061;            // 2^31 + 413
const AUTH_RECIPIENT = 'webassemblymusic.near';  // NEP-413 recipient the client signs for
const NFT_CONTRACT = 'webassemblymusic.near';    // NFT ownership grants proxy access
const NEAR_RPC = 'https://rpc.mainnet.fastnear.com';
const AUTH_MAX_AGE_MS = 60 * 60 * 1000;          // 1h signed-message validity
const REQUIRE_NEAR_AUTH = false;                 // flip on once the client sends X-Near-Auth

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
const b64ToBytes = (b64) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
const u32le = (n) => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; };
const concatBytes = (chunks) => { const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0)); let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; } return out; };

export function serializeNep413Payload({ message, nonce, recipient, callbackUrl = null }) {
  if (!(nonce instanceof Uint8Array) || nonce.length !== 32) throw new Error('nonce must be 32 bytes');
  const enc = new TextEncoder();
  const str = (s) => { const b = enc.encode(s); return [u32le(b.length), b]; };
  const chunks = [u32le(NEP413_TAG), ...str(message), nonce, ...str(recipient),
    callbackUrl == null ? new Uint8Array([0]) : new Uint8Array([1])];
  if (callbackUrl != null) chunks.push(...str(callbackUrl));
  return concatBytes(chunks);
}

// Verify the CRYPTO + freshness of a NEP-413 bearer token (base64 JSON). Returns
// { accountId, publicKey } or throws. Account/NFT RPC checks are done separately.
export async function verifyNep413Crypto(token, { recipient, now = Date.now(), maxAgeMs = AUTH_MAX_AGE_MS } = {}) {
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(b64ToBytes(token))); }
  catch { throw new Error('failed to parse token'); }
  const { accountId, publicKey, signature, message, nonce, recipient: rcpt, callbackUrl } = payload;
  if (!accountId || !publicKey || !signature || !message || !nonce || !rcpt) throw new Error('incomplete token');
  if (rcpt !== recipient) throw new Error('recipient mismatch');
  let issuedAt; try { issuedAt = JSON.parse(message).issuedAt; } catch { throw new Error('bad message'); }
  if (!(typeof issuedAt === 'number' && issuedAt <= now && issuedAt > now - maxAgeMs)) throw new Error('token expired');
  const serialized = serializeNep413Payload({ message, nonce: b64ToBytes(nonce), recipient: rcpt, callbackUrl: callbackUrl ?? null });
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', serialized));
  const rawPub = base58Decode(publicKey.replace(/^ed25519:/, ''));
  const key = await crypto.subtle.importKey('raw', rawPub, { name: 'Ed25519' }, false, ['verify']);
  if (!(await crypto.subtle.verify('Ed25519', key, b64ToBytes(signature), digest))) throw new Error('invalid signature');
  return { accountId, publicKey };
}

async function nearQuery(params) {
  const res = await fetch(NEAR_RPC, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 'gitproxy', method: 'query', params }) });
  const j = await res.json();
  if (j.error) throw new Error('rpc error: ' + JSON.stringify(j.error));
  return j.result;
}
const keyCache = new Map();
async function accountHasKey(accountId, publicKey) {
  const c = keyCache.get(accountId);
  let keys = c && c.exp > Date.now() ? c.keys : null;
  if (!keys) { const r = await nearQuery({ request_type: 'view_access_key_list', finality: 'final', account_id: accountId }); keys = r.keys || []; keyCache.set(accountId, { keys, exp: Date.now() + 60000 }); }
  return keys.some((k) => k.public_key === publicKey);
}
const nftCache = new Map();
async function ownsNft(accountId) {
  const c = nftCache.get(accountId);
  if (c && c.exp > Date.now()) return c.owns;
  const args = btoa(JSON.stringify({ account_id: accountId, from_index: '0', limit: 1 }));
  const r = await nearQuery({ request_type: 'call_function', finality: 'final', account_id: NFT_CONTRACT, method_name: 'nft_tokens_for_owner', args_base64: args });
  let owns = false;
  try { const arr = JSON.parse(new TextDecoder().decode(new Uint8Array(r.result))); owns = Array.isArray(arr) && arr.length > 0; } catch { owns = false; }
  nftCache.set(accountId, { owns, exp: Date.now() + 300000 });
  return owns;
}

// Full gate: token crypto → key bound to account → account owns the NFT.
export async function authorizeNearNft(token) {
  const { accountId, publicKey } = await verifyNep413Crypto(token, { recipient: AUTH_RECIPIENT });
  if (!(await accountHasKey(accountId, publicKey))) throw new Error('public key not on account');
  if (!(await ownsNft(accountId))) throw new Error(`account ${accountId} owns no ${NFT_CONTRACT} NFT`);
  return { accountId };
}

// ---- Session JWT (HS256) — issued by /gittoken after NEP-413+NFT verification,
// then presented on every git request so the proxy needs no NEAR RPC per call.
// `iat` only; the server decides the validity window. Secret lives in CF env.
export const JWT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlToBytes = (s) => b64ToBytes(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
const hmacKey = (secret) => crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

export async function jwtSign(claims, secret) {
  const enc = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { iat: Math.floor(Date.now() / 1000), ...claims };
  const signingInput = b64url(enc.encode(JSON.stringify(header))) + '.' + b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(signingInput)));
  return signingInput + '.' + b64url(sig);
}
export async function jwtVerify(token, secret, { maxAgeMs = JWT_MAX_AGE_MS, now = Date.now() } = {}) {
  const parts = String(token).split('.');
  if (parts.length !== 3) throw new Error('malformed jwt');
  const enc = new TextEncoder();
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), b64urlToBytes(parts[2]), enc.encode(parts[0] + '.' + parts[1]));
  if (!ok) throw new Error('bad jwt signature');
  let payload; try { payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1]))); } catch { throw new Error('bad jwt payload'); }
  const iatMs = (payload.iat || 0) * 1000;
  if (!(iatMs <= now && iatMs > now - maxAgeMs)) throw new Error('jwt expired');
  return payload;
}

export async function onRequest(context) {
  const { request } = context;
  const origin = request.headers.get('Origin');
  const CORS = corsHeaders(origin);

  if (!isOriginAllowed(origin)) {
    return new Response(`git-cors-proxy: origin not allowed: ${origin}`, { status: 403 });
  }
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // NEP-413 + NFT-ownership gate (flagged off until the app sends X-Near-Auth).
  if (REQUIRE_NEAR_AUTH) {
    const token = (request.headers.get('X-Near-Auth') || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return new Response('git-cors-proxy: X-Near-Auth (NEP-413) required', { status: 401, headers: CORS });
    try { await authorizeNearNft(token); }
    catch (e) { return new Response('git-cors-proxy: NEAR auth failed: ' + e.message, { status: 401, headers: CORS }); }
  }

  const url = new URL(request.url);
  const targetPath = url.pathname.replace(/^\/gitproxy\//, '');
  const host = targetPath.split('/')[0];

  if (!ALLOWED_HOSTS.has(host)) {
    return new Response(`git-cors-proxy: host not allowed: ${host}\nallowed: ${[...ALLOWED_HOSTS].join(', ')}`,
      { status: 403, headers: CORS });
  }
  if (!GIT_ENDPOINT.test(url.pathname)) {
    return new Response('git-cors-proxy: only git smart-HTTP endpoints are proxied',
      { status: 403, headers: CORS });
  }

  const targetUrl = `https://${targetPath}${url.search}`;

  // Forward headers, dropping hop-by-hop / origin-revealing ones. Translate a
  // Bearer token to Basic (GitHub/GitLab git-HTTP want the token as password).
  const headers = new Headers();
  const DROP = new Set(['host', 'origin', 'referer', 'cookie', 'connection', 'content-length']);
  for (const [k, v] of request.headers) {
    if (!DROP.has(k.toLowerCase())) headers.set(k, v);
  }
  const auth = request.headers.get('Authorization');
  if (auth && /^Bearer\s+/i.test(auth)) {
    const token = auth.replace(/^Bearer\s+/i, '');
    headers.set('Authorization', 'Basic ' + btoa(`x-access-token:${token}`));
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const resp = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: 'manual',
  });

  // Stream the response back. Forward only content-type (git needs it); let the
  // runtime handle transfer/encoding to avoid gzip/length mismatches.
  const outHeaders = new Headers(CORS);
  const ct = resp.headers.get('content-type');
  if (ct) outHeaders.set('Content-Type', ct);
  const www = resp.headers.get('www-authenticate');
  if (www) outHeaders.set('WWW-Authenticate', www);

  return new Response(resp.body, { status: resp.status, headers: outHeaders });
}
