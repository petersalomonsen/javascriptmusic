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
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, Accept-Encoding, Pragma, Cache-Control',
  'Access-Control-Expose-Headers': 'Content-Type, WWW-Authenticate',
  'Access-Control-Max-Age': '600',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Vary': 'Origin',
});

// Only the three git smart-HTTP endpoints — never an arbitrary path.
const GIT_ENDPOINT = /\/(info\/refs|git-upload-pack|git-receive-pack)$/;

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
