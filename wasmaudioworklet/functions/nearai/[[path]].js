// Cloudflare Pages Function — locked-down same-origin proxy for NEAR AI Cloud.
//
// cloud-api.near.ai only CORS-allowlists localhost origins, so the deployed
// app can't call it browser-direct. This proxy is same-origin with the app
// (no CORS involved) AND carries the server-side API key — users need no key
// of their own. That makes it a paid resource, so it is NOT an open relay:
//
//   • ONLY POST /nearai/v1/chat/completions (+ GET /v1/models for display);
//   • the SYSTEM PROMPT and TOOLS are enforced SERVER-SIDE — imported from
//     the same modules the app uses (single source of truth, deployed
//     together). Client-sent system messages are stripped; client tools are
//     ignored. The proxy only forwards the user/assistant/tool conversation.
//   • ONE model, chosen here — the client cannot pick, because we pay;
//   • origin-allowlisted; request and completion size capped;
//   • and it is NOT free: an x402 day pass is required (see _x402.js).
//
// The key comes from the NEARAI_API_KEY secret (dashboard: Settings →
// Variables and Secrets → add Secret; or `wrangler pages secret put`).
// Spending is additionally bounded by the key's own limit on cloud.near.ai.
// Future billing/gating: the gitproxy's NEP-413 + NFT gate is ready to port.

import { SYSTEM_PROMPT } from '../../studio-agent/prompt.js';
import { toOpenAiTools, SERVERLESS_PROMPT_SUFFIX, DEFAULT_MODEL } from '../../studio-agent/nearai-core.js';
import {
  x402Config, requirePass, settlementHeaders, passRemainingSeconds,
  HEADER_PASS, HEADER_SIGNATURE, HEADER_REQUIRED, HEADER_RESPONSE, HEADER_SPONSOR,
} from '../_x402.js';

export const UPSTREAM = 'https://cloud-api.near.ai';

// ONE model, chosen by us, on our credits. Not an allowlist: an allowlist
// implies the client picks, and this proxy offers our model with our prompt or
// nothing. A user who wants a different model runs their own proxy — the local
// studio-agent, or `/nearai <their-key>` straight to NEAR AI. Our terms here,
// their terms there, one code path each.
export const MODEL = (typeof globalThis.NEARAI_MODEL === 'string' && globalThis.NEARAI_MODEL) || DEFAULT_MODEL;
export const modelFor = (env = {}) => env.NEARAI_MODEL || MODEL;

// Conversation size cap (chars of serialized messages). The app's own turns run
// far below this; it exists to bound what a single request can cost us, so it
// is set near real usage rather than at the context limit. 60k chars ~ 15k
// tokens, on top of a ~11.6k-token system prompt and tool schemas.
const MAX_MESSAGES_CHARS = 60000;

// Bounds the expensive half of a request. Output costs several times input on
// every model we would consider, and was previously unbounded.
const MAX_COMPLETION_TOKENS = 2000;

export const ALLOWED_ORIGINS = [
  /^https:\/\/([a-z0-9-]+\.)?webassemblymusic\.pages\.dev$/, // prod + preview deploys
  /^http:\/\/localhost(:\d+)?$/,                             // local dev
];

const isOriginAllowed = (origin) => !origin || ALLOWED_ORIGINS.some((re) => re.test(origin));

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': `Content-Type, Accept, ${HEADER_PASS}, ${HEADER_SIGNATURE}, ${HEADER_SPONSOR}`,
  // The browser cannot read a response header it was not told about, and the
  // whole payment loop depends on the client reading these back.
  'Access-Control-Expose-Headers': `${HEADER_REQUIRED}, ${HEADER_RESPONSE}, ${HEADER_PASS}`,
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin',
});

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');

  if (!isOriginAllowed(origin)) {
    return new Response('origin not allowed', { status: 403 });
  }
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const apiKey = env && env.NEARAI_API_KEY;
  const notConfigured = () => new Response(
    JSON.stringify({ error: 'NEARAI_API_KEY secret is not configured on the server' }),
    { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });

  const upstreamPath = url.pathname.replace(/^\/nearai\//, '');
  const x402 = x402Config(env || {});

  // Claim a pass without spending anything. Running the gate against a real
  // completion would burn inference just to find out whether you are allowed
  // any — and for a sponsor claim, which costs nothing, that is absurd.
  if (request.method === 'POST' && upstreamPath === 'pass') {
    const claim = await requirePass(x402, request, {
      url: url.toString(), extraHeaders: corsHeaders(origin),
    });
    if (!claim.ok) return claim.response;
    const pass = claim.minted || (request.headers.get(HEADER_PASS) || '').replace(/^Bearer\s+/i, '').trim();
    return new Response(JSON.stringify({
      pass,
      accountId: claim.pass?.sub || null,
      expiresAt: claim.pass?.exp ? new Date(claim.pass.exp * 1000).toISOString() : null,
      secondsRemaining: passRemainingSeconds(pass),
      sponsor: Boolean(claim.settle?.sponsor),
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin), ...settlementHeaders(claim) },
    });
  }

  if (request.method !== 'POST' || upstreamPath !== 'v1/chat/completions') {
    return new Response('not allowed', { status: 403, headers: corsHeaders(origin) });
  }

  // ---- the paywall -------------------------------------------------------
  // Inference runs on OUR credits, so it is never free and never relayed on
  // someone else's key. Exactly two outcomes: a valid pass, or a 402. There is
  // deliberately no third branch that could fall through to the server key.
  const gate = await requirePass(x402, request, {
    url: url.toString(),
    description: 'WebAssembly Music — studio AI session pass',
    extraHeaders: corsHeaders(origin),
  });
  if (!gate.ok) return gate.response;
  const paidHeaders = settlementHeaders(gate);

  // Deliberately AFTER the paywall: an unpaid caller gets a 402 and learns
  // nothing about how this server is configured. It also means the paywall can
  // be exercised end-to-end without a NEAR AI key at all.
  if (!apiKey) return notConfigured();

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('invalid JSON', { status: 400, headers: corsHeaders(origin) });
  }

  const clientMessages = Array.isArray(body.messages) ? body.messages : [];
  // The proxy ONLY forwards the conversation — never a client system prompt.
  const conversation = clientMessages.filter((m) => m && m.role !== 'system');
  if (JSON.stringify(conversation).length > MAX_MESSAGES_CHARS) {
    return new Response(JSON.stringify({ error: 'conversation too large' }),
      { status: 413, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
  }

  const upstreamBody = {
    // The client's `model` is ignored: we pay, so we choose.
    model: modelFor(env || {}),
    max_tokens: MAX_COMPLETION_TOKENS,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + SERVERLESS_PROMPT_SUFFIX },
      ...conversation,
    ],
    tools: toOpenAiTools(),
    tool_choice: 'auto',
    stream: body.stream === true,
  };

  const upstreamResponse = await fetch(`${UPSTREAM}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(upstreamBody),
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: {
      'Content-Type': upstreamResponse.headers.get('Content-Type') || 'application/json',
      ...corsHeaders(origin),
      // Present only when a payment settled on THIS request, so the client can
      // store the freshly minted pass and stop paying per call.
      ...paidHeaders,
    },
  });
}
