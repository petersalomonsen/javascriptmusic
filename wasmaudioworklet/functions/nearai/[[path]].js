// Cloudflare Pages Function — same-origin proxy for NEAR AI Cloud.
//
// cloud-api.near.ai only CORS-allowlists localhost origins, so the deployed
// app (webassemblymusic.pages.dev) can't call it directly from the browser.
// This stateless proxy is same-origin with the app (browser→proxy needs no
// CORS at all) and forwards to exactly ONE upstream host.
//
// Unlike the gitproxy there is no auth gate: the only credential is the
// caller's OWN NEAR AI API key (forwarded verbatim as Bearer), so any usage
// is billed to the caller's key — the proxy adds nothing worth stealing and
// NEVER stores or logs keys.
//
// Route:  /nearai/v1/<path…>   →   https://cloud-api.near.ai/v1/<path…>

export const UPSTREAM = 'https://cloud-api.near.ai';

// Only the OpenAI-compatible v1 API — never an arbitrary upstream path.
const ALLOWED_PATH = /^v1\/[a-z0-9/_.-]*$/i;

// Only browsers on these origins may use the proxy (blocks other web apps
// from piggybacking). Requests with NO Origin header (same-origin GET /
// non-browser) are allowed — non-browser clients can hit upstream directly
// anyway, so nothing is gained by spoofing.
export const ALLOWED_ORIGINS = [
  /^https:\/\/([a-z0-9-]+\.)?webassemblymusic\.pages\.dev$/, // prod + preview deploys
  /^http:\/\/localhost(:\d+)?$/,                             // local dev
];

const isOriginAllowed = (origin) => !origin || ALLOWED_ORIGINS.some((re) => re.test(origin));

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin',
});

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');

  if (!isOriginAllowed(origin)) {
    return new Response('origin not allowed', { status: 403 });
  }
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response('method not allowed', { status: 405, headers: corsHeaders(origin) });
  }

  // Strip the /nearai prefix: /nearai/v1/chat/completions → v1/chat/completions
  const upstreamPath = url.pathname.replace(/^\/nearai\//, '');
  if (!ALLOWED_PATH.test(upstreamPath)) {
    return new Response('path not allowed', { status: 403, headers: corsHeaders(origin) });
  }

  const headers = new Headers();
  const auth = request.headers.get('Authorization');
  if (auth) headers.set('Authorization', auth);
  const contentType = request.headers.get('Content-Type');
  if (contentType) headers.set('Content-Type', contentType);
  headers.set('Accept', request.headers.get('Accept') || 'application/json');

  // Buffer the (small JSON) body rather than streaming — node's fetch would
  // need the duplex option for a stream, and buffering keeps this testable.
  const upstreamResponse = await fetch(`${UPSTREAM}/${upstreamPath}${url.search}`, {
    method: request.method,
    headers,
    body: request.method === 'POST' ? await request.arrayBuffer() : undefined,
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: {
      'Content-Type': upstreamResponse.headers.get('Content-Type') || 'application/json',
      ...corsHeaders(origin),
    },
  });
}
