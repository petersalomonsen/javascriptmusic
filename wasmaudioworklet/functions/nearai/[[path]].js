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
//   • the model must be on a curated allowlist of cheap TEE-hosted models
//     (the catalog also proxies gpt-5/claude/gemini — NOT on our key);
//   • origin-allowlisted; request size capped.
//
// The key comes from the NEARAI_API_KEY secret (dashboard: Settings →
// Variables and Secrets → add Secret; or `wrangler pages secret put`).
// Spending is additionally bounded by the key's own limit on cloud.near.ai.
// Future billing/gating: the gitproxy's NEP-413 + NFT gate is ready to port.

import { SYSTEM_PROMPT } from '../../studio-agent/prompt.js';
import { toOpenAiTools, SERVERLESS_PROMPT_SUFFIX, DEFAULT_MODEL } from '../../studio-agent/nearai-core.js';
import {
  x402Config, requirePass, settlementHeaders,
  HEADER_PASS, HEADER_SIGNATURE, HEADER_REQUIRED, HEADER_RESPONSE,
} from '../_x402.js';

export const UPSTREAM = 'https://cloud-api.near.ai';

// Cheap TEE-hosted, tools-capable models only.
export const ALLOWED_MODELS = new Set([
  'Qwen/Qwen3.5-122B-A10B',
  'deepseek-ai/DeepSeek-V4-Flash',
  'moonshotai/kimi-k2.6',
  'openai/gpt-oss-120b',
  'zai-org/GLM-5.1-FP8',
]);

// Conversation size cap (chars of serialized messages) — bounds per-request
// input cost; the app's own turns stay far below this.
const MAX_MESSAGES_CHARS = 300000;

export const ALLOWED_ORIGINS = [
  /^https:\/\/([a-z0-9-]+\.)?webassemblymusic\.pages\.dev$/, // prod + preview deploys
  /^http:\/\/localhost(:\d+)?$/,                             // local dev
];

const isOriginAllowed = (origin) => !origin || ALLOWED_ORIGINS.some((re) => re.test(origin));

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': `Content-Type, Accept, ${HEADER_PASS}, ${HEADER_SIGNATURE}`,
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

  // Read-only model catalog (for display; the model used is enforced below).
  if (request.method === 'GET' && upstreamPath === 'v1/models') {
    if (!apiKey) return notConfigured();
    const upstreamResponse = await fetch(`${UPSTREAM}/v1/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  }

  if (request.method !== 'POST' || upstreamPath !== 'v1/chat/completions') {
    return new Response('not allowed', { status: 403, headers: corsHeaders(origin) });
  }

  // ---- the paywall -------------------------------------------------------
  // Inference runs on OUR credits, so it is never free and never relayed on
  // someone else's key. Exactly two outcomes: a valid pass, or a 402. There is
  // deliberately no third branch that could fall through to the server key.
  const x402 = x402Config(env || {});
  const gate = await requirePass(x402, request, {
    url: url.toString(),
    description: 'WebAssembly Music — studio AI day pass',
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
    model: ALLOWED_MODELS.has(body.model) ? body.model : DEFAULT_MODEL,
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
