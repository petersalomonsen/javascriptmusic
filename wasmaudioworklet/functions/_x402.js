// x402 v2 payment gate — shared by the Pages Functions.
//
// Sells access to a feature of THIS app for a fixed time ("a day pass"), never
// AI access as a commodity (see docs/near-auth-and-payments-plan.md §5.11).
//
// Flow:
//   1. request with no pass          → 402 + PAYMENT-REQUIRED header
//   2. client pays (see the two schemes below)
//   3. request with PAYMENT-SIGNATURE → we confirm the payment
//   4. we mint a pass (HS256 JWT) and return it in PAYMENT-RESPONSE
//
// Two settlement schemes are supported, and the 402 can advertise both:
//
//   `near-tx`  (default) — the payer sends the NEP-141 transfer themselves and
//                shows us the receipt; we read it off the chain. No
//                facilitator, no relayer, no credential, and it works in EVERY
//                wallet. They pay their own gas (~0.0003 NEAR).
//   `exact`    — the standard x402 scheme: the payer only signs a NEP-366
//                authorisation and a facilitator relays it, sponsoring gas.
//                Needs a facilitator API key and a wallet that can sign
//                delegate actions (4 of 12 could, as of 2026-08).
//
// Everything here is stateless: the pass carries its own expiry, and replay is
// bounded by a commitment + a freshness window rather than by stored state.
//
// Wire format matches @x402/core: header value = base64(JSON), header names
// PAYMENT-REQUIRED / PAYMENT-SIGNATURE / PAYMENT-RESPONSE.

import { networkById, rpcUrlsFor } from '../near/network.js';
import { verifyNep413Crypto, accountHasKey } from './_nep413.js';
import { sponsorConfig, isSponsor } from './_sponsors.js';

export const X402_VERSION = 2;
export const HEADER_REQUIRED = 'PAYMENT-REQUIRED';
export const HEADER_SIGNATURE = 'PAYMENT-SIGNATURE';
export const HEADER_RESPONSE = 'PAYMENT-RESPONSE';
export const HEADER_PASS = 'X-Studio-Pass';
export const HEADER_SPONSOR = 'X-Sponsor-Auth';

// Circle-native USDC on NEAR mainnet, 6 decimals (verified via ft_metadata).
export const USDC_NEAR_MAINNET =
  '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1';

// The only hosted facilitator that settles NEAR is mainnet-only
// (relayer x402-relayer2.mike.near). x402.org and PayAI carry no NEAR at all.
export const DEFAULT_FACILITATOR = 'https://x402.mikedotexe.com';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Everything the gate needs, all overridable per deployment so the price can be
 * dropped to a cent for a live test without touching code.
 */
export function x402Config(env = {}) {
  return {
    network: env.X402_NETWORK || 'near:mainnet',
    asset: env.X402_ASSET || USDC_NEAR_MAINNET,
    payTo: env.X402_PAY_TO || 'webassemblymusic.near',
    // Atomic units of `asset`. USDC has 6 decimals → 10000 = $0.01, 3000000 = $3.
    amount: String(env.X402_AMOUNT || '10000'),
    // The scheme maps this to a block window: timeoutBlocks = ceil(seconds / 1).
    // The facilitator REJECTS a delegate whose own max_block_height window is
    // wider than this — and the *wallet* picks that window, not us. A tight 60s
    // would therefore fail against any wallet that defaults to a longer one.
    // An hour is generous without being unbounded; a stale delegate is harmless
    // anyway, since it authorises one fixed transfer and the on-chain access-key
    // nonce stops it being replayed.
    maxTimeoutSeconds: Number(env.X402_TIMEOUT_SECONDS || 3600),
    facilitator: (env.X402_FACILITATOR || DEFAULT_FACILITATOR).replace(/\/$/, ''),
    // Both public reference instances (x402.mikedotexe.com and Solvador) answer
    // /verify and /settle with 401 `invalid_api_key` unless credentialed —
    // /supported and /readyz stay open, which makes the requirement easy to
    // miss until the first real payment. Credentials are issued per network,
    // asset, payee and resource-server instance.
    facilitatorApiKey: env.X402_FACILITATOR_API_KEY || '',
    passTtlMs: Number(env.X402_PASS_TTL_MS || DAY_MS),
    passSecret: env.PASS_SECRET || '',
    // `near-tx` settlement: we read the payment off the chain ourselves.
    // Several endpoints, run by different operators, tried in order — taking
    // money must not hinge on one provider being up. NEAR_RPC_URL (comma-
    // separated) overrides the list entirely.
    rpcUrls: env.NEAR_RPC_URL
      ? String(env.NEAR_RPC_URL).split(',').map((u) => u.trim()).filter(Boolean)
      : rpcUrlsFor(String(env.X402_NETWORK || 'near:mainnet').split(':')[1] || 'mainnet'),
    // Kept for the `exact` path and as a tighter optional bound; `near-tx`
    // replay is handled by dating the pass from the payment (see mintPass).
    txMaxAgeMs: Number(env.X402_TX_MAX_AGE_MS || 30 * 60 * 1000),
    rpcTimeoutMs: Number(env.X402_RPC_TIMEOUT_MS || 15000),
    // NEP-413 `recipient` the payment proof must be signed for. Binding it to
    // us stops a signature collected by some other app being replayed here.
    authRecipient: env.NEAR_AUTH_RECIPIENT || 'webassemblymusic.near',
    // What this payment buys. Bound into the proof so a single transfer can
    // only ever claim ONE product — the day we sell a second thing, one
    // payment must not be redeemable for both.
    purpose: env.X402_PURPOSE || 'studio-day-pass',
    // Used only to render the amount inside the transfer memo. Wallets show
    // the memo but not always the decoded ft_transfer amount, so this is often
    // the only place the payer sees what they are actually paying.
    assetSymbol: env.X402_ASSET_SYMBOL || 'USDC',
    assetDecimals: Number(env.X402_ASSET_DECIMALS || 6),
    productName: env.X402_PRODUCT_NAME || 'WebAssembly Music studio AI day pass',
    // Which settlement paths this deployment offers, in preference order.
    // Both can be advertised at once: browsers take `near-tx` (any wallet, no
    // relayer), x402 SDK clients take `exact` if a facilitator is configured.
    // Empty by default: the first iteration gives passes to project sponsors
    // rather than selling them, so nothing is for sale yet. Set X402_SCHEMES to
    // turn payment back on — the whole rail is built and tested.
    schemes: String(env.X402_SCHEMES || '').split(',').map((s) => s.trim()).filter(Boolean),
    sponsors: sponsorConfig(env),
  };
}

// ---- header codec (base64 of JSON, exactly as @x402/core does it) ----------

export function encodeHeader(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''));
}

export function decodeHeader(value) {
  const bin = atob(String(value));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

// ---- 402 -------------------------------------------------------------------

export function paymentRequirements(cfg) {
  return {
    scheme: 'exact',
    network: cfg.network,
    asset: cfg.asset,
    amount: cfg.amount,
    payTo: cfg.payTo,
    maxTimeoutSeconds: cfg.maxTimeoutSeconds,
    extra: {},
  };
}

// ---- `near-tx`: settle it yourself, no facilitator --------------------------
//
// The `exact` scheme needs a facilitator to relay a NEP-366 delegate action —
// which means an API key from someone else, and a wallet that can sign
// delegates (only 4 of 12 can). Since gas for an `ft_transfer` is ~0.0003 NEAR
// and the payer already has a NEAR account, sponsoring gas buys little.
//
// So: the user just sends the transfer themselves and shows us the receipt. We
// read the transaction straight off the chain. No facilitator, no relayer, no
// credential — and `signAndSendTransaction` works in EVERY wallet.
//
// Two attacks this has to stop, both without any stored state:
//
//   1. Someone else redeems your payment. Transaction hashes are public, so a
//      bystander could present yours and receive a bearer pass. Closed by
//      PROVING OWNERSHIP of the paying account, two ways:
//        • preferred — a NEP-413 signature naming the tx hash. Same primitive
//          as the git-proxy gate, and it needs no memo, so the transfer is a
//          plain ft_transfer that could even have been made outside the app.
//        • fallback — the preimage of a SHA-256 commitment placed in the memo,
//          for wallets that cannot signMessage. One less prompt, but the memo
//          must be planned before paying.
//   2. Redeeming one payment twice. Closed by DATING THE PASS FROM THE PAYMENT:
//      the pass expires `passTtl` after the transaction's block, not after
//      redemption, so presenting the same transaction again returns a pass with
//      the *same* expiry — worth nothing extra. This is the stateless stand-in
//      for the on-chain nonce that makes the `exact` scheme one-shot.

export const MEMO_PREFIX = 'wam:';
export const COMMITMENT_PLACEHOLDER = '{commitment}';

/** Atomic units -> a decimal string, without floating point. */
export function formatAmount(atomic, decimals) {
  const s = String(atomic).padStart(decimals + 1, '0');
  const whole = s.slice(0, s.length - decimals) || '0';
  const frac = decimals ? s.slice(s.length - decimals).replace(/0+$/, '') : '';
  return frac ? `${whole}.${frac}` : whole;
}

/**
 * The exact memo the transfer must carry, with {commitment} left for the client
 * to fill in.
 *
 * The leading text is not decoration. NEAR Mobile (and others) show that an
 * `ft_transfer` is being called but do not decode its arguments, so the payer
 * is asked to approve a contract call without seeing the amount. Putting the
 * product and price in the memo gives wallets something human-readable to show.
 *
 * The SERVER dictates the whole template so both sides produce byte-identical
 * strings — the client only substitutes the commitment, and nothing depends on
 * two implementations formatting a decimal the same way.
 */
export function memoTemplate(cfg) {
  const price = `${formatAmount(cfg.amount, cfg.assetDecimals)} ${cfg.assetSymbol}`;
  return `${cfg.productName} — ${price} | ${MEMO_PREFIX}${cfg.purpose}:${COMMITMENT_PLACEHOLDER}`;
}

export function nearTxRequirements(cfg) {
  return {
    scheme: 'near-tx',
    network: cfg.network,
    asset: cfg.asset,
    amount: cfg.amount,
    payTo: cfg.payTo,
    maxTimeoutSeconds: cfg.maxTimeoutSeconds,
    extra: {
      // How the client must build the transfer for us to accept it.
      // Preferred: sign a NEP-413 proof naming the tx hash, for this recipient.
      // No memo needed, so the transfer is a plain ft_transfer.
      proof: 'nep413',
      authRecipient: cfg.authRecipient,
      purpose: cfg.purpose,
      // The commitment path: the memo carries SHA-256(secret) alongside text
      // the payer can actually read. One wallet prompt instead of two, and it
      // needs no signMessage support — but the memo must be decided before
      // paying, so the template is advertised here.
      memoTemplate: memoTemplate(cfg),
      commitment: 'sha256',
      maxAgeSeconds: Math.floor(cfg.txMaxAgeMs / 1000),
    },
  };
}

const b64urlOf = (bytes) => btoa(String.fromCharCode(...bytes))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** SHA-256 of the payer's secret, base64url — the value that goes in the memo. */
export async function commitmentFor(secretB64url) {
  const raw = b64urlToBytes(secretB64url);
  if (raw.length < 16) throw new Error('commitment secret is too short');
  return b64urlOf(new Uint8Array(await crypto.subtle.digest('SHA-256', raw)));
}

/** The full memo for a given secret: the server's template, filled in. */
export async function memoFor(cfg, secretB64url) {
  return memoTemplate(cfg).replace(COMMITMENT_PLACEHOLDER, await commitmentFor(secretB64url));
}

/**
 * Call the NEAR RPC, falling through a list of independently-operated
 * endpoints.
 *
 * `timeoutMs` is a TOTAL budget across all attempts, not per attempt: a
 * nonexistent transaction fails on every endpoint, and `wait_until` makes each
 * one BLOCK until finality, so a per-attempt timeout would multiply into a
 * free denial-of-service. Bounded once, shared by all.
 *
 * A JSON-RPC error is retried on the next endpoint too — a lagging node can
 * answer UNKNOWN_TRANSACTION for a transaction another node already has. The
 * first error is what gets reported if every endpoint fails.
 */
async function nearRpc(rpcUrls, method, params, { timeoutMs = 15000 } = {}) {
  const urls = Array.isArray(rpcUrls) ? rpcUrls : [rpcUrls];
  const deadline = Date.now() + timeoutMs;
  let firstError = null;

  for (const url of urls) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 'pass', method, params }),
        signal: AbortSignal.timeout(remaining),
      });
      const json = await res.json();
      if (json.error) {
        firstError = firstError || new Error(`rpc ${method}: ${describeError(json.error) || JSON.stringify(json.error).slice(0, 160)}`);
        continue;
      }
      return json.result;
    } catch (e) {
      firstError = firstError || e;
      // Timeout means the shared budget is spent; nothing left for the rest.
      if (e?.name === 'TimeoutError' || e?.name === 'AbortError') break;
    }
  }

  if (firstError && !(firstError.name === 'TimeoutError' || firstError.name === 'AbortError')) throw firstError;
  throw new Error(`could not confirm the payment within ${Math.round(timeoutMs / 1000)}s — if the transfer just landed, try again`);
}

/**
 * Verify an on-chain NEP-141 transfer and return the payer.
 *
 * Every check here is load-bearing; a missing one is a way to get a free pass.
 * Fails closed on anything it cannot establish.
 */
export async function verifyNearTxPayment(cfg, { txHash, secret, auth, accountId }, { now = Date.now() } = {}) {
  if (!txHash) throw new Error('missing transaction hash');
  if (!secret && !auth) throw new Error('missing proof of ownership (auth or secret)');

  // Whoever claims the payment must prove the payment is THEIRS. Two ways:
  //
  //  `auth`   — a NEP-413 signature over {txHash}. Proves control of the
  //             account directly, needs no special memo, and reuses the same
  //             primitive as the git-proxy gate. PREFERRED.
  //  `secret` — the preimage of a SHA-256 commitment placed in the transfer
  //             memo. One less wallet prompt, but the memo has to be planned
  //             at payment time, so it only works for payments made in-app.
  //
  // Either way the answer must agree with the transaction's on-chain signer.
  let provenAccountId = null;
  let expectedMemo = null;

  if (auth) {
    const verified = await verifyNep413Crypto(auth, {
      recipient: cfg.authRecipient, now, maxAgeMs: cfg.txMaxAgeMs,
    });
    // The signature must name THIS transaction, or a signature captured for
    // any other purpose could be replayed to claim someone else's payment.
    if (verified.claims?.txHash !== txHash) {
      throw new Error('the signed proof does not name this transaction');
    }
    if (verified.claims?.purpose !== cfg.purpose) {
      throw new Error(`the signed proof is for "${verified.claims?.purpose}", not "${cfg.purpose}"`);
    }
    if (!(await accountHasKey(verified.accountId, verified.publicKey, {
      networkId: String(cfg.network).split(':')[1] || 'mainnet', rpcUrl: cfg.rpcUrls[0], now,
    }))) {
      throw new Error('the signing key is not on that account');
    }
    provenAccountId = verified.accountId;
  } else {
    expectedMemo = await memoFor(cfg, secret);
  }

  const result = await nearRpc(cfg.rpcUrls, 'tx', {
    tx_hash: txHash,
    // The RPC needs *an* account to locate the shard; the real signer is read
    // back off the transaction, so a wrong hint cannot forge anything.
    sender_account_id: provenAccountId || accountId || cfg.payTo,
    // EXECUTED_OPTIMISTIC returns as soon as the receipts have run, rather
    // than waiting for finality. The transfer is already irreversible in
    // practice at that point, and it keeps redemption snappy; the freshness
    // and success checks below are what actually protect us.
    wait_until: 'EXECUTED_OPTIMISTIC',
  }, { timeoutMs: cfg.rpcTimeoutMs });

  const tx = result?.transaction;
  if (!tx) throw new Error('transaction not found');

  // 1. It succeeded. A failed ft_transfer moves no tokens.
  if (result.status?.SuccessValue === undefined) {
    throw new Error(`transaction did not succeed: ${JSON.stringify(result.status).slice(0, 120)}`);
  }

  // 2. It is a single call to the token contract we asked for.
  if (tx.receiver_id !== cfg.asset) throw new Error(`wrong token contract: ${tx.receiver_id}`);
  const actions = tx.actions || [];
  if (actions.length !== 1) throw new Error(`expected exactly one action, got ${actions.length}`);
  const call = actions[0].FunctionCall;
  if (!call) throw new Error('action is not a FunctionCall');
  if (call.method_name !== 'ft_transfer') throw new Error(`wrong method: ${call.method_name}`);

  // 3. It pays us, enough, and carries the commitment.
  let args;
  try {
    args = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(call.args), (c) => c.charCodeAt(0))));
  } catch { throw new Error('could not decode ft_transfer args'); }
  if (args.receiver_id !== cfg.payTo) throw new Error(`paid ${args.receiver_id}, not ${cfg.payTo}`);
  if (BigInt(args.amount || '0') < BigInt(cfg.amount)) {
    throw new Error(`paid ${args.amount}, need ${cfg.amount}`);
  }
  if (expectedMemo !== null && args.memo !== expectedMemo) {
    throw new Error('payment secret does not match the transfer memo');
  }

  // The claimant must be the payer. Without this, a valid signature from any
  // account could be paired with somebody else's transaction.
  if (provenAccountId !== null && tx.signer_id !== provenAccountId) {
    throw new Error(`${provenAccountId} did not send this payment (${tx.signer_id} did)`);
  }

  // 4. It is recent. Without this, one payment could be redeemed forever.
  const blockHash = result.transaction_outcome?.block_hash;
  if (!blockHash) throw new Error('cannot establish when the transaction landed');
  const block = await nearRpc(cfg.rpcUrls, 'block', { block_id: blockHash }, { timeoutMs: cfg.rpcTimeoutMs });
  const timestampMs = Number(BigInt(block?.header?.timestamp_nanosec || '0') / 1000000n);
  if (!timestampMs) throw new Error('cannot establish when the transaction landed');
  // A payment older than a whole pass period would only mint an already-expired
  // pass, so reject it with a message that says what actually happened rather
  // than handing back something useless.
  const ageMs = now - timestampMs;
  if (ageMs >= cfg.passTtlMs) {
    throw new Error(`this payment is ${Math.floor(ageMs / 3600000)}h old — its pass period has already elapsed`);
  }

  return { accountId: tx.signer_id, txHash: tx.hash || txHash, amount: args.amount, paidAtMs: timestampMs };
}

/** Everything this deployment will accept, in preference order. */
export function acceptedRequirements(cfg) {
  const byScheme = { 'near-tx': nearTxRequirements, exact: paymentRequirements };
  return cfg.schemes.map((s) => byScheme[s]).filter(Boolean).map((f) => f(cfg));
}

export function paymentRequired(cfg, { url, description, error } = {}) {
  const body = {
    x402Version: X402_VERSION,
    resource: {
      url: url || '',
      description: description || 'WebAssembly Music — studio AI day pass',
      mimeType: 'application/json',
    },
    accepts: acceptedRequirements(cfg),
  };
  // With nothing for sale, `accepts` is empty and a client would be left
  // guessing. Say who can get in, and how.
  if (cfg.sponsors.enabled) {
    body.sponsorship = {
      recipient: cfg.sponsors.recipient,
      contract: cfg.sponsors.contract,
      authRecipient: cfg.authRecipient,
      purpose: cfg.purpose,
      hint: `The studio AI is currently for people who have funded ${cfg.sponsors.recipient}. `
        + 'Sign in with that NEAR account to claim a day pass.',
    };
  }
  if (error) body.error = error;
  return body;
}

/** A ready-to-return 402 Response. `extraHeaders` carries CORS. */
export function paymentRequiredResponse(cfg, { url, description, error, extraHeaders = {} } = {}) {
  const required = paymentRequired(cfg, { url, description, error });
  return new Response(JSON.stringify(required), {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      [HEADER_REQUIRED]: encodeHeader(required),
      ...extraHeaders,
    },
  });
}

// ---- facilitator -----------------------------------------------------------

/** Pull a human-readable reason out of whatever shape the facilitator used. */
export function describeError(json) {
  if (!json || typeof json !== 'object') return typeof json === 'string' ? json : '';
  const direct = json.invalidReason || json.errorReason || json.invalidMessage || json.errorMessage;
  if (typeof direct === 'string') return direct;
  const err = json.error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const code = err.code ? `${err.code}` : '';
    const msg = err.message ? `${err.message}` : '';
    if (code || msg) return [code, msg].filter(Boolean).join(': ');
  }
  return JSON.stringify(json).slice(0, 200);
}

async function facilitatorCall(cfg, path, payload) {
  const res = await fetch(`${cfg.facilitator}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cfg.facilitatorApiKey ? { Authorization: `Bearer ${cfg.facilitatorApiKey}` } : {}),
    },
    body: JSON.stringify({
      x402Version: X402_VERSION,
      paymentPayload: payload,
      paymentRequirements: paymentRequirements(cfg),
    }),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    // Surface the facilitator's own reason — it is the most useful diagnostic
    // we get (missing API key, insufficient balance, unregistered payee,
    // expired delegate…). Facilitators nest it inconsistently, and an object
    // rendered as "[object Object]" hides exactly the message you need.
    throw new Error(`facilitator ${path} ${res.status}: ${describeError(json) || text.slice(0, 200)}`);
  }
  return json;
}

export async function facilitatorSupported(cfg) {
  const res = await fetch(`${cfg.facilitator}/supported`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`facilitator /supported ${res.status}`);
  return res.json();
}

export const facilitatorVerify = (cfg, payload) => facilitatorCall(cfg, '/verify', payload);
export const facilitatorSettle = (cfg, payload) => facilitatorCall(cfg, '/settle', payload);

// ---- pass (HS256 JWT, stateless) -------------------------------------------
// Moved here from functions/gitproxy so both proxies mint the same kind of pass.

const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlToBytes = (s) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
const hmacKey = (secret) => crypto.subtle.importKey(
  'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

export async function jwtSign(claims, secret) {
  if (!secret) throw new Error('pass secret is not configured');
  const enc = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { iat: Math.floor(Date.now() / 1000), ...claims };
  const signingInput = b64url(enc.encode(JSON.stringify(header))) + '.' + b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(signingInput)));
  return signingInput + '.' + b64url(sig);
}

export async function jwtVerify(token, secret, { now = Date.now() } = {}) {
  if (!secret) throw new Error('pass secret is not configured');
  const parts = String(token).split('.');
  if (parts.length !== 3) throw new Error('malformed pass');
  const enc = new TextEncoder();
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), b64urlToBytes(parts[2]), enc.encode(parts[0] + '.' + parts[1]));
  if (!ok) throw new Error('bad pass signature');
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1]))); } catch { throw new Error('bad pass payload'); }
  // `exp` is authoritative and is set by us at mint time.
  if (!(typeof payload.exp === 'number' && payload.exp * 1000 > now)) throw new Error('pass expired');
  return payload;
}

/**
 * Mint a pass for a payer. `sub` binds it to the paying NEAR account.
 *
 * The expiry is measured from when the PAYMENT LANDED, not from now. That one
 * choice makes redeeming the same transaction twice provably worthless: every
 * redemption yields the same expiry, so a payment is worth exactly one pass
 * period no matter how many times it is presented. It buys statelessly what
 * the `exact` scheme gets from NEAR's on-chain access-key nonce — with no
 * relayer, no journal, and no stored set of spent hashes.
 */
export async function mintPass(cfg, { accountId, txHash, paidAtMs }) {
  const fromMs = paidAtMs || Date.now();
  return jwtSign({
    sub: accountId || 'anonymous',
    exp: Math.floor(fromMs / 1000) + Math.floor(cfg.passTtlMs / 1000),
    tx: txHash || undefined,
    v: 1, // pass format version — lets us add a spend cap later without a break
  }, cfg.passSecret);
}

/** Seconds left on a pass, read without verifying. Display only. */
export function passRemainingSeconds(pass, now = Date.now()) {
  try {
    const c = JSON.parse(new TextDecoder().decode(b64urlToBytes(String(pass).split('.')[1])));
    return Math.max(0, Math.floor((c.exp * 1000 - now) / 1000));
  } catch { return 0; }
}

export async function verifyPass(cfg, token) {
  return jwtVerify(token, cfg.passSecret);
}

/**
 * The gate. Returns:
 *   { ok: true, pass }                 — a valid pass was presented
 *   { ok: true, pass, minted, settle } — payment settled just now
 *   { ok: false, response }            — a 402 the caller should return
 */
/**
 * Claim a free pass by proving control of a sponsoring account.
 *
 * The proof is the same NEP-413 signature the git proxy uses — one wallet
 * prompt, no money, no chain writes.
 */
export async function claimSponsorPass(cfg, auth, { now = Date.now() } = {}) {
  const verified = await verifyNep413Crypto(auth, {
    recipient: cfg.authRecipient, now, maxAgeMs: cfg.txMaxAgeMs,
  });
  if (verified.claims?.purpose !== cfg.purpose) {
    throw new Error(`the signed proof is for "${verified.claims?.purpose}", not "${cfg.purpose}"`);
  }
  if (!(await accountHasKey(verified.accountId, verified.publicKey, {
    networkId: String(cfg.network).split(':')[1] || 'mainnet', rpcUrl: cfg.rpcUrls[0], now,
  }))) {
    throw new Error('the signing key is not on that account');
  }
  if (!(await isSponsor(verified.accountId, cfg.sponsors, cfg.rpcUrls, { now }))) {
    throw new Error(`${verified.accountId} has not funded ${cfg.sponsors.recipient}`);
  }
  return { accountId: verified.accountId };
}

export async function requirePass(cfg, request, { extraHeaders = {}, url, description } = {}) {
  const presented = request.headers.get(HEADER_PASS);
  if (presented) {
    try {
      return { ok: true, pass: await verifyPass(cfg, presented.replace(/^Bearer\s+/i, '').trim()) };
    } catch (e) {
      // Fall through to 402 — an expired or forged pass is not an error state,
      // it is an invitation to pay.
      return {
        ok: false,
        response: paymentRequiredResponse(cfg, { url, description, error: e.message, extraHeaders }),
      };
    }
  }

  // A sponsor proves who they are and gets a pass; no payment involved.
  const sponsorAuth = (request.headers.get(HEADER_SPONSOR) || '').replace(/^Bearer\s+/i, '').trim();
  if (sponsorAuth) {
    try {
      const { accountId } = await claimSponsorPass(cfg, sponsorAuth);
      const pass = await mintPass(cfg, { accountId });
      return {
        ok: true,
        minted: pass,
        settle: { success: true, payer: accountId, sponsor: true, network: cfg.network },
        pass: await verifyPass(cfg, pass),
      };
    } catch (e) {
      return {
        ok: false,
        response: paymentRequiredResponse(cfg, { url, description, error: e.message, extraHeaders }),
      };
    }
  }

  const signature = request.headers.get(HEADER_SIGNATURE);
  if (!signature) {
    return { ok: false, response: paymentRequiredResponse(cfg, { url, description, extraHeaders }) };
  }

  let payload;
  try {
    payload = decodeHeader(signature);
  } catch {
    return {
      ok: false,
      response: paymentRequiredResponse(cfg, { url, description, error: 'malformed PAYMENT-SIGNATURE', extraHeaders }),
    };
  }

  try {
    const scheme = payload?.accepted?.scheme || 'near-tx';
    let settled;

    if (scheme === 'near-tx') {
      // Settled by the payer already — we only read the receipt off the chain.
      const paid = await verifyNearTxPayment(cfg, payload.payload || {});
      settled = {
        success: true,
        payer: paid.accountId,
        transaction: paid.txHash,
        network: cfg.network,
        amount: paid.amount,
        paidAtMs: paid.paidAtMs,
      };
    } else {
      // `exact`: the payer only authorised; a facilitator must relay it.
      const verified = await facilitatorVerify(cfg, payload);
      if (verified.isValid === false) {
        throw new Error(describeError(verified) || 'payment not valid');
      }
      settled = await facilitatorSettle(cfg, payload);
      if (settled.success === false) throw new Error(describeError(settled) || 'settlement failed');
      settled.payer = settled.payer || verified.payer;
    }

    const pass = await mintPass(cfg, {
      accountId: settled.payer, txHash: settled.transaction, paidAtMs: settled.paidAtMs,
    });
    return { ok: true, minted: pass, settle: settled, pass: await verifyPass(cfg, pass) };
  } catch (e) {
    return {
      ok: false,
      response: paymentRequiredResponse(cfg, { url, description, error: e.message, extraHeaders }),
    };
  }
}

/** Headers to attach to a successful response when a payment just settled. */
export function settlementHeaders(result) {
  if (!result.minted) return {};
  return {
    [HEADER_RESPONSE]: encodeHeader(result.settle),
    [HEADER_PASS]: result.minted,
  };
}
