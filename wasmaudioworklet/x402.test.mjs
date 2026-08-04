import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  x402Config, encodeHeader, decodeHeader, paymentRequired, paymentRequirements,
  mintPass, verifyPass, requirePass, settlementHeaders, describeError,
  HEADER_PASS, HEADER_SIGNATURE, HEADER_REQUIRED, X402_VERSION, USDC_NEAR_MAINNET,
} from './functions/_x402.js';

const CFG = x402Config({ PASS_SECRET: 'test-secret' });
const req = (headers = {}) => new Request('https://app.example/nearai/v1/chat/completions', { method: 'POST', headers });

test('defaults: mainnet USDC, our payee, price in atomic units', () => {
  assert.equal(CFG.network, 'near:mainnet');
  assert.equal(CFG.asset, USDC_NEAR_MAINNET);
  assert.equal(CFG.payTo, 'webassemblymusic.near');
  assert.equal(CFG.amount, '10000'); // $0.01 at 6 decimals — the test price
  assert.match(CFG.facilitator, /^https:\/\//);
});

test('price and payee are configurable without touching code', () => {
  const cfg = x402Config({ X402_AMOUNT: 3000000, X402_PAY_TO: 'pay.example.near', PASS_SECRET: 's' });
  assert.equal(cfg.amount, '3000000'); // $3.00
  assert.equal(cfg.payTo, 'pay.example.near');
});

test('header codec round-trips (base64 of JSON, as @x402/core does it)', () => {
  const obj = { x402Version: 2, accepts: [{ scheme: 'exact', amount: '10000' }] };
  assert.deepEqual(decodeHeader(encodeHeader(obj)), obj);
  // Non-ASCII must survive — our description contains an em dash.
  const uni = { description: 'WebAssembly Music — studio AI day pass' };
  assert.deepEqual(decodeHeader(encodeHeader(uni)), uni);
});

test('PaymentRequirements matches the NEAR exact scheme shape', () => {
  const r = paymentRequirements(CFG);
  assert.deepEqual(Object.keys(r).sort(),
    ['amount', 'asset', 'extra', 'maxTimeoutSeconds', 'network', 'payTo', 'scheme'].sort());
  assert.equal(r.scheme, 'exact');
  assert.equal(typeof r.maxTimeoutSeconds, 'number');
  assert.equal(typeof r.amount, 'string', 'amount must be a decimal STRING in atomic units');
});

test('PaymentRequired declares v2, and offers exactly what is configured', () => {
  const p = paymentRequired(CFG, { url: 'https://app.example/x' });
  assert.equal(p.x402Version, X402_VERSION);
  assert.equal(p.resource.url, 'https://app.example/x');
  assert.deepEqual(p.accepts, [], 'nothing for sale unless X402_SCHEMES says so');
  const selling = x402Config({ PASS_SECRET: 's', X402_SCHEMES: 'near-tx' });
  assert.equal(paymentRequired(selling, {}).accepts.length, 1);
});

test('no pass and no proof → 402 saying how to get in', async () => {
  const gate = await requirePass(CFG, req());
  assert.equal(gate.ok, false);
  assert.equal(gate.response.status, 402);
  const decoded = decodeHeader(gate.response.headers.get(HEADER_REQUIRED));
  assert.equal(decoded.sponsorship.recipient, 'webassemblymusic.near');
  const selling = x402Config({ PASS_SECRET: 'test-secret', X402_SCHEMES: 'near-tx' });
  const paidGate = await requirePass(selling, req());
  assert.equal(decodeHeader(paidGate.response.headers.get(HEADER_REQUIRED)).accepts[0].payTo, 'webassemblymusic.near');
});

test('a valid pass opens the gate', async () => {
  const pass = await mintPass(CFG, { accountId: 'psalomo.near', txHash: 'tx1' });
  const gate = await requirePass(CFG, req({ [HEADER_PASS]: pass }));
  assert.equal(gate.ok, true);
  assert.equal(gate.pass.sub, 'psalomo.near');
  assert.equal(gate.pass.tx, 'tx1');
  assert.equal(gate.pass.v, 1, 'pass carries a format version so a spend cap can be added later');
});

test('Bearer prefix on the pass is tolerated', async () => {
  const pass = await mintPass(CFG, { accountId: 'a.near' });
  const gate = await requirePass(CFG, req({ [HEADER_PASS]: `Bearer ${pass}` }));
  assert.equal(gate.ok, true);
});

test('a pass signed with another secret is refused', async () => {
  const foreign = await mintPass(x402Config({ PASS_SECRET: 'other' }), { accountId: 'a.near' });
  const gate = await requirePass(CFG, req({ [HEADER_PASS]: foreign }));
  assert.equal(gate.ok, false);
  assert.equal(gate.response.status, 402);
});

test('a tampered subject is refused (signature covers the claims)', async () => {
  const pass = await mintPass(CFG, { accountId: 'alice.near' });
  const [h, , s] = pass.split('.');
  const forged = btoa(JSON.stringify({ sub: 'attacker.near', exp: 2 ** 31, v: 1 }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const gate = await requirePass(CFG, req({ [HEADER_PASS]: `${h}.${forged}.${s}` }));
  assert.equal(gate.ok, false);
});

test('an expired pass is refused — and the 402 says why', async () => {
  const expired = x402Config({ PASS_SECRET: 'test-secret', X402_PASS_TTL_MS: -1000 });
  const pass = await mintPass(expired, { accountId: 'a.near' });
  const gate = await requirePass(CFG, req({ [HEADER_PASS]: pass }));
  assert.equal(gate.ok, false);
  assert.match(decodeHeader(gate.response.headers.get(HEADER_REQUIRED)).error, /expired/);
});

test('a malformed PAYMENT-SIGNATURE is a 402, not a crash', async () => {
  const gate = await requirePass(CFG, req({ [HEADER_SIGNATURE]: 'not-base64-json!!' }));
  assert.equal(gate.ok, false);
  assert.equal(gate.response.status, 402);
});

test('minting refuses to run without a configured secret', async () => {
  await assert.rejects(mintPass(x402Config({}), { accountId: 'a.near' }), /secret is not configured/);
});

// --- settlement, with the facilitator mocked ---------------------------------

// `accepted.scheme` is what routes settlement; `exact` means "ask the facilitator".
const payload = { x402Version: 2, accepted: { scheme: 'exact' }, payload: { signedDelegateAction: 'AQAA' } };
const withFacilitator = (impl) => {
  const real = globalThis.fetch;
  globalThis.fetch = impl;
  return () => { globalThis.fetch = real; };
};

test('verify+settle success mints a pass bound to the payer', async () => {
  const restore = withFacilitator(async (url) => {
    if (String(url).endsWith('/verify')) return Response.json({ isValid: true, payer: 'psalomo.near' });
    if (String(url).endsWith('/settle')) return Response.json({ success: true, payer: 'psalomo.near', transaction: 'HASH123', network: 'near:mainnet' });
    throw new Error('unexpected ' + url);
  });
  try {
    const gate = await requirePass(CFG, req({ [HEADER_SIGNATURE]: encodeHeader(payload) }));
    assert.equal(gate.ok, true);
    assert.equal(gate.pass.sub, 'psalomo.near');
    assert.equal(gate.pass.tx, 'HASH123');
    const headers = settlementHeaders(gate);
    assert.ok(headers[HEADER_PASS], 'the minted pass must come back so the client stops paying per call');
    assert.equal(decodeHeader(headers['PAYMENT-RESPONSE']).transaction, 'HASH123');
  } finally { restore(); }
});

test('facilitator says invalid → 402 carrying the reason (never serve unpaid)', async () => {
  const restore = withFacilitator(async () => Response.json({ isValid: false, invalidReason: 'insufficient_funds' }));
  try {
    const gate = await requirePass(CFG, req({ [HEADER_SIGNATURE]: encodeHeader(payload) }));
    assert.equal(gate.ok, false);
    assert.match(decodeHeader(gate.response.headers.get(HEADER_REQUIRED)).error, /insufficient_funds/);
  } finally { restore(); }
});

test('verify passes but settle fails → still 402, no pass minted', async () => {
  const restore = withFacilitator(async (url) => String(url).endsWith('/verify')
    ? Response.json({ isValid: true, payer: 'a.near' })
    : Response.json({ success: false, errorReason: 'delegate_action_expired' }));
  try {
    const gate = await requirePass(CFG, req({ [HEADER_SIGNATURE]: encodeHeader(payload) }));
    assert.equal(gate.ok, false);
    assert.match(decodeHeader(gate.response.headers.get(HEADER_REQUIRED)).error, /delegate_action_expired/);
  } finally { restore(); }
});

test('a facilitator outage is a 402, never an open door', async () => {
  const restore = withFacilitator(async () => { throw new Error('network down'); });
  try {
    const gate = await requirePass(CFG, req({ [HEADER_SIGNATURE]: encodeHeader(payload) }));
    assert.equal(gate.ok, false);
    assert.equal(gate.response.status, 402);
  } finally { restore(); }
});

test('settlementHeaders is empty when a pass was merely presented (nothing settled)', async () => {
  const pass = await mintPass(CFG, { accountId: 'a.near' });
  const gate = await requirePass(CFG, req({ [HEADER_PASS]: pass }));
  assert.deepEqual(settlementHeaders(gate), {});
});

// --- error rendering ---------------------------------------------------------
// Regression: a facilitator 401 rendered as "[object Object]" because the
// reason was nested in `error.code`/`error.message`, which hid the single most
// useful fact (the instance needs an API key) behind a useless string.

test('nested facilitator errors are rendered, never "[object Object]"', () => {
  assert.equal(
    describeError({ error: { code: 'invalid_api_key', message: 'missing or invalid API key' } }),
    'invalid_api_key: missing or invalid API key');
  assert.equal(describeError({ invalidReason: 'insufficient_funds' }), 'insufficient_funds');
  assert.equal(describeError({ errorReason: 'delegate_action_expired' }), 'delegate_action_expired');
  assert.equal(describeError({ error: 'plain string' }), 'plain string');
  for (const junk of [null, undefined, 42, {}]) {
    assert.doesNotMatch(String(describeError(junk)), /\[object/);
  }
});

// --- `near-tx`: settle-it-yourself, verified straight off the chain ----------
// Every assertion here is a hole someone could otherwise walk a free pass
// through, so each check gets its own test.

import { verifyNearTxPayment, commitmentFor, memoFor, memoTemplate, formatAmount, nearTxRequirements, acceptedRequirements, MEMO_PREFIX } from './functions/_x402.js';

const SECRET = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
const TXCFG = x402Config({ PASS_SECRET: 'test-secret' });
const NOW = 1800000000000;
const b64json = (o) => Buffer.from(JSON.stringify(o)).toString('base64');

async function chainWith({ memo, receiverId, methodName = 'ft_transfer', amount = '10000',
                           payTo = 'webassemblymusic.near', success = true, ageMs = 0,
                           actions, signer = 'psalomo.near' } = {}) {
  const m = memo === undefined ? await memoFor(TXCFG, SECRET) : memo;
  return async (_url, opts) => {
    const { method, params } = JSON.parse(opts.body);
    if (method === 'tx') {
      return Response.json({ result: {
        transaction: {
          signer_id: signer, receiver_id: receiverId ?? TXCFG.asset, hash: 'TXHASH',
          actions: actions ?? [{ FunctionCall: { method_name: methodName,
            args: b64json({ receiver_id: payTo, amount, memo: m }) } }],
        },
        status: success ? { SuccessValue: '' } : { Failure: { error_message: 'panicked' } },
        transaction_outcome: { block_hash: 'BLOCK' },
      } });
    }
    if (method === 'block') {
      return Response.json({ result: { header: { timestamp_nanosec: String((NOW - ageMs) * 1e6) } } });
    }
    throw new Error('unexpected rpc ' + method);
  };
}
const onChain = async (opts) => {
  const real = globalThis.fetch;
  globalThis.fetch = await chainWith(opts);
  return () => { globalThis.fetch = real; };
};
const verify = (payload = {}) => verifyNearTxPayment(TXCFG,
  { txHash: 'TXHASH', secret: SECRET, accountId: 'psalomo.near', ...payload }, { now: NOW });

test('near-tx: a correct transfer is accepted and identifies the payer', async () => {
  const restore = await onChain();
  try {
    const paid = await verify();
    assert.equal(paid.accountId, 'psalomo.near');
    assert.equal(paid.txHash, 'TXHASH');
  } finally { restore(); }
});

test('near-tx: the payer comes from the CHAIN, not from the client', async () => {
  // A client claiming to be someone else must not change who the pass is for.
  const restore = await onChain({ signer: 'realpayer.near' });
  try {
    assert.equal((await verify({ accountId: 'liar.near' })).accountId, 'realpayer.near');
  } finally { restore(); }
});

test('near-tx: someone else cannot redeem your payment (commitment)', async () => {
  const restore = await onChain(); // memo commits to SECRET
  try {
    const other = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
    await assert.rejects(verify({ secret: other }), /does not match the transfer memo/);
  } finally { restore(); }
});

test('near-tx: a payment from within the period is still redeemable', async () => {
  // Replay is neutralised by dating the pass from the payment (see below), so
  // this no longer needs a tight window — an hour-old payment is fine, it just
  // buys an hour less.
  const restore = await onChain({ ageMs: 60 * 60 * 1000 });
  try {
    assert.equal((await verify()).accountId, 'psalomo.near');
  } finally { restore(); }
});

test('near-tx: a failed transaction moves no tokens and is refused', async () => {
  const restore = await onChain({ success: false });
  try { await assert.rejects(verify(), /did not succeed/); } finally { restore(); }
});

test('near-tx: paying the wrong recipient is refused', async () => {
  const restore = await onChain({ payTo: 'attacker.near' });
  try { await assert.rejects(verify(), /not webassemblymusic\.near/); } finally { restore(); }
});

test('near-tx: underpaying is refused, overpaying is fine', async () => {
  let restore = await onChain({ amount: '9999' });
  try { await assert.rejects(verify(), /paid 9999, need 10000/); } finally { restore(); }
  restore = await onChain({ amount: '50000' });
  try { assert.equal((await verify()).amount, '50000'); } finally { restore(); }
});

test('near-tx: a transfer of some other token is refused', async () => {
  const restore = await onChain({ receiverId: 'shitcoin.near' });
  try { await assert.rejects(verify(), /wrong token contract/); } finally { restore(); }
});

test('near-tx: a different method on the right token is refused', async () => {
  const restore = await onChain({ methodName: 'ft_transfer_call' });
  try { await assert.rejects(verify(), /wrong method/); } finally { restore(); }
});

test('near-tx: extra actions bundled into the transaction are refused', async () => {
  const restore = await onChain({ actions: [
    { FunctionCall: { method_name: 'ft_transfer', args: b64json({ receiver_id: 'webassemblymusic.near', amount: '10000', memo: 'wam:x' }) } },
    { Transfer: { deposit: '1' } },
  ] });
  try { await assert.rejects(verify(), /exactly one action/); } finally { restore(); }
});

test('near-tx: a memo with no commitment is refused', async () => {
  const restore = await onChain({ memo: 'thanks!' });
  try { await assert.rejects(verify(), /does not match/); } finally { restore(); }
});

test('near-tx: a too-short secret is refused (no trivial preimages)', async () => {
  await assert.rejects(verify({ secret: 'AAAA' }), /too short/);
});

test('near-tx: missing hash or proof fails closed before any RPC', async () => {
  await assert.rejects(verify({ txHash: '' }), /missing transaction hash/);
  await assert.rejects(verify({ secret: '' }), /missing proof of ownership/);
});

test('schemes are opt-in, in the order configured', () => {
  assert.deepEqual(acceptedRequirements(TXCFG).map((r) => r.scheme), []);
  const both = x402Config({ PASS_SECRET: 's', X402_SCHEMES: 'near-tx,exact' });
  assert.deepEqual(acceptedRequirements(both).map((r) => r.scheme), ['near-tx', 'exact']);
  assert.ok(nearTxRequirements(TXCFG).extra.memoTemplate.includes(MEMO_PREFIX));
});

// --- proof by NEP-413 signature (preferred over the memo commitment) ---------

import { serializeNep413Payload, base58Encode, clearKeyCache } from './functions/_nep413.js';

const AUTHCFG = x402Config({ PASS_SECRET: 'test-secret', X402_TX_MAX_AGE_MS: 30 * 60 * 1000 });

async function makeProof({ txHash = 'TXHASH', accountId = 'psalomo.near',
                           recipient = AUTHCFG.authRecipient, issuedAt = NOW,
                           purpose = AUTHCFG.purpose } = {}) {
  const kp = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  const rawPub = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
  const publicKey = 'ed25519:' + base58Encode(rawPub);
  const message = JSON.stringify({ txHash, purpose, issuedAt });
  const nonce = crypto.getRandomValues(new Uint8Array(32));
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256',
    serializeNep413Payload({ message, nonce, recipient })));
  const sig = new Uint8Array(await crypto.subtle.sign('Ed25519', kp.privateKey, digest));
  const b64 = (b) => btoa(String.fromCharCode(...b));
  const token = b64(new TextEncoder().encode(JSON.stringify({
    accountId, publicKey, signature: b64(sig), message, nonce: b64(nonce), recipient,
  })));
  return { auth: token, publicKey, accountId };
}

// Chain mock + an access-key list that contains the proof's key.
const onChainWithKey = async (publicKey, opts = {}) => {
  // The access-key lookup is cached per account for 60s. Tests reuse the same
  // account with different keys, so without this they would pass or fail
  // depending on order.
  clearKeyCache();
  const chain = await chainWith({ memo: undefined, ...opts });
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const { method, params } = JSON.parse(init.body);
    if (method === 'query' && params?.request_type === 'view_access_key_list') {
      return Response.json({ result: { keys: [{ public_key: publicKey }] } });
    }
    return chain(url, init);
  };
  return () => { globalThis.fetch = real; };
};

test('proof: a signed proof naming the tx claims the payment — no memo needed', async () => {
  const { auth, publicKey, accountId } = await makeProof();
  const restore = await onChainWithKey(publicKey, { memo: 'anything at all', signer: accountId });
  try {
    const paid = await verifyNearTxPayment(AUTHCFG, { txHash: 'TXHASH', auth }, { now: NOW });
    assert.equal(paid.accountId, accountId);
  } finally { restore(); }
});

test('proof: cannot be used to claim a DIFFERENT transaction', async () => {
  const { auth, publicKey } = await makeProof({ txHash: 'MY_OWN_TX' });
  const restore = await onChainWithKey(publicKey, { memo: 'x' });
  try {
    await assert.rejects(
      verifyNearTxPayment(AUTHCFG, { txHash: 'SOMEONE_ELSES_TX', auth }, { now: NOW }),
      /does not name this transaction/);
  } finally { restore(); }
});

test("proof: signing does not let you claim someone else's payment", async () => {
  // Mallory signs a valid proof for Alice's tx hash — but the chain says Alice paid.
  const { auth, publicKey } = await makeProof({ accountId: 'mallory.near' });
  const restore = await onChainWithKey(publicKey, { memo: 'x', signer: 'alice.near' });
  try {
    await assert.rejects(
      verifyNearTxPayment(AUTHCFG, { txHash: 'TXHASH', auth }, { now: NOW }),
      /mallory\.near did not send this payment \(alice\.near did\)/);
  } finally { restore(); }
});

test('proof: a key that is not on the account is refused', async () => {
  const { auth } = await makeProof();
  const restore = await onChainWithKey('ed25519:SOME_OTHER_KEY', { memo: 'x' });
  try {
    await assert.rejects(verifyNearTxPayment(AUTHCFG, { txHash: 'TXHASH', auth }, { now: NOW }),
      /signing key is not on that account/);
  } finally { restore(); }
});

test('proof: signed for another app (recipient) is refused', async () => {
  const { auth, publicKey } = await makeProof({ recipient: 'someoneelse.near' });
  const restore = await onChainWithKey(publicKey, { memo: 'x' });
  try {
    await assert.rejects(verifyNearTxPayment(AUTHCFG, { txHash: 'TXHASH', auth }, { now: NOW }),
      /recipient mismatch/);
  } finally { restore(); }
});

test('proof: a stale signature is refused', async () => {
  const { auth, publicKey } = await makeProof({ issuedAt: NOW - 60 * 60 * 1000 });
  const restore = await onChainWithKey(publicKey, { memo: 'x' });
  try {
    await assert.rejects(verifyNearTxPayment(AUTHCFG, { txHash: 'TXHASH', auth }, { now: NOW }),
      /expired/);
  } finally { restore(); }
});

test('proof: presenting neither proof nor secret fails closed', async () => {
  await assert.rejects(verifyNearTxPayment(AUTHCFG, { txHash: 'TXHASH' }, { now: NOW }),
    /missing proof of ownership/);
});

test('the 402 tells the client both proof modes', () => {
  const extra = nearTxRequirements(AUTHCFG).extra;
  assert.equal(extra.proof, 'nep413');           // for out-of-band payments
  assert.equal(extra.authRecipient, AUTHCFG.authRecipient);
  assert.ok(extra.memoTemplate.includes(MEMO_PREFIX)); // the default, in-app
  assert.equal(extra.commitment, 'sha256');
});

// --- replay is worthless, not merely time-limited ----------------------------
// The stateless stand-in for the `exact` scheme's on-chain nonce: a pass is
// dated from the PAYMENT, so redeeming the same transaction again yields the
// same expiry rather than a fresh period.

test('replay: redeeming the same payment twice yields the SAME expiry', async () => {
  const paidAtMs = NOW - 60 * 60 * 1000; // paid an hour ago
  const first = await mintPass(TXCFG, { accountId: 'a.near', txHash: 'T', paidAtMs });
  const later = await mintPass(TXCFG, { accountId: 'a.near', txHash: 'T', paidAtMs });
  const expOf = (p) => JSON.parse(Buffer.from(p.split('.')[1], 'base64url')).exp;
  assert.equal(expOf(first), expOf(later), 'a second redemption must buy nothing');
  // …and that expiry is one period after the PAYMENT, not after redemption.
  assert.equal(expOf(first), Math.floor(paidAtMs / 1000) + TXCFG.passTtlMs / 1000);
});

test('replay: a payment redeemed late gives only the remainder, not a fresh day', async () => {
  const paidAtMs = NOW - 23 * 60 * 60 * 1000; // 23h ago, pass is 24h
  const pass = await mintPass(TXCFG, { accountId: 'a.near', txHash: 'T', paidAtMs });
  const exp = JSON.parse(Buffer.from(pass.split('.')[1], 'base64url')).exp;
  const remainingHours = (exp * 1000 - NOW) / 3600000;
  assert.ok(remainingHours > 0.5 && remainingHours < 1.5, `expected ~1h left, got ${remainingHours}h`);
});

test('replay: a payment older than a whole period is refused outright', async () => {
  const restore = await onChain({ ageMs: 25 * 60 * 60 * 1000 });
  try {
    await assert.rejects(verify(), /pass period has already elapsed/);
  } finally { restore(); }
});

test('replay: the redeemed pass is dated from the chain, not the clock', async () => {
  const paidAtMs = NOW - 2 * 60 * 60 * 1000;
  const restore = await onChain({ ageMs: 2 * 60 * 60 * 1000 });
  try {
    const gate = await requirePass(TXCFG,
      new Request('https://app.example/x', { method: 'POST',
        headers: { [HEADER_SIGNATURE]: encodeHeader({
          x402Version: 2, accepted: { scheme: 'near-tx' },
          payload: { txHash: 'TXHASH', secret: SECRET },
        }) } }));
    assert.equal(gate.ok, true);
    assert.equal(gate.pass.exp, Math.floor(paidAtMs / 1000) + TXCFG.passTtlMs / 1000);
  } finally { restore(); }
});

// --- purpose binding: one payment buys one product ---------------------------

test('purpose: a proof for another product cannot claim this one', async () => {
  const { auth, publicKey } = await makeProof({ purpose: 'some-other-product' });
  const restore = await onChainWithKey(publicKey, { memo: 'x' });
  try {
    await assert.rejects(verifyNearTxPayment(AUTHCFG, { txHash: 'TXHASH', auth }, { now: NOW }),
      /is for "some-other-product", not "studio-day-pass"/);
  } finally { restore(); }
});

test('purpose: a proof that omits the purpose is refused', async () => {
  // `null`, not `undefined` — a default parameter would quietly supply the
  // right value and the test would pass without testing anything.
  const { auth, publicKey } = await makeProof({ purpose: null });
  const restore = await onChainWithKey(publicKey, { memo: 'x' });
  try {
    await assert.rejects(verifyNearTxPayment(AUTHCFG, { txHash: 'TXHASH', auth }, { now: NOW }),
      /not "studio-day-pass"/);
  } finally { restore(); }
});

test('purpose: the memo carries it too', async () => {
  const memo = await memoFor(TXCFG, SECRET);
  assert.match(memo, /wam:studio-day-pass:/);
  // A memo built for a different product does not satisfy this one.
  const other = await memoFor(x402Config({ PASS_SECRET: 's', X402_PURPOSE: 'other-product' }), SECRET);
  assert.notEqual(other, memo);
  const restore = await onChain({ memo: other });
  try { await assert.rejects(verify(), /does not match the transfer memo/); } finally { restore(); }
});

// --- the memo the payer actually sees ----------------------------------------
// Wallets show that `ft_transfer` is being called but do not decode its
// arguments, so for many payers the memo is the ONLY place the price appears.

test('memo: leads with the product and price in readable form', async () => {
  const memo = await memoFor(TXCFG, SECRET);
  assert.ok(memo.startsWith('WebAssembly Music studio AI day pass — 0.01 USDC'),
    `payer would see: ${memo}`);
});

test('memo: amounts format exactly, with no floating point', () => {
  assert.equal(formatAmount('10000', 6), '0.01');
  assert.equal(formatAmount('3000000', 6), '3');
  assert.equal(formatAmount('1', 6), '0.000001');
  assert.equal(formatAmount('0', 6), '0');
  assert.equal(formatAmount('123456789', 6), '123.456789');
  assert.equal(formatAmount('1000000000000000000000000', 24), '1'); // 1 NEAR
});

test('memo: the server dictates the template, the client only fills the blank', async () => {
  // Both sides must produce byte-identical strings; the client never formats
  // a decimal itself, so the two cannot drift.
  const template = memoTemplate(TXCFG);
  assert.ok(template.includes('{commitment}'));
  const filled = template.replace('{commitment}', await commitmentFor(SECRET));
  assert.equal(filled, await memoFor(TXCFG, SECRET));
  const restore = await onChain({ memo: filled });
  try { assert.equal((await verify()).accountId, 'psalomo.near'); } finally { restore(); }
});

test('memo: a template with the price altered is refused', async () => {
  const tampered = (await memoFor(TXCFG, SECRET)).replace('0.01 USDC', '0.00001 USDC');
  const restore = await onChain({ memo: tampered });
  try { await assert.rejects(verify(), /does not match the transfer memo/); } finally { restore(); }
});

// --- RPC fallback across independent providers -------------------------------

test('rpc: config carries several independently-operated endpoints', () => {
  assert.ok(TXCFG.rpcUrls.length >= 3, 'a single endpoint would be a single point of failure');
  const hosts = TXCFG.rpcUrls.map((u) => new URL(u).host);
  assert.equal(new Set(hosts).size, hosts.length, 'endpoints must be distinct');
});

test('rpc: NEAR_RPC_URL overrides the list (comma-separated)', () => {
  const cfg = x402Config({ PASS_SECRET: 's', NEAR_RPC_URL: 'https://a.example, https://b.example' });
  assert.deepEqual(cfg.rpcUrls, ['https://a.example', 'https://b.example']);
});

test('rpc: a dead first endpoint falls through to a working one', async () => {
  const cfg = x402Config({ PASS_SECRET: 'test-secret', NEAR_RPC_URL: 'https://dead.example,https://alive.example' });
  const chain = await chainWith({ memo: await memoFor(cfg, SECRET) });
  const real = globalThis.fetch;
  const tried = [];
  globalThis.fetch = async (url, init) => {
    tried.push(new URL(url).host);
    if (String(url).includes('dead')) throw new Error('ECONNREFUSED');
    return chain(url, init);
  };
  try {
    const paid = await verifyNearTxPayment(cfg, { txHash: 'TXHASH', secret: SECRET }, { now: NOW });
    assert.equal(paid.accountId, 'psalomo.near');
    assert.ok(tried.includes('dead.example') && tried.includes('alive.example'), 'must have tried both');
  } finally { globalThis.fetch = real; }
});

test('rpc: an unknown tx on every endpoint reports one clear error, not N', async () => {
  const cfg = x402Config({ PASS_SECRET: 'test-secret', NEAR_RPC_URL: 'https://a.example,https://b.example,https://c.example' });
  const real = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({ error: { name: 'UNKNOWN_TRANSACTION' } }); };
  try {
    await assert.rejects(verifyNearTxPayment(cfg, { txHash: 'NOPE', secret: SECRET }, { now: NOW }),
      /UNKNOWN_TRANSACTION/);
    assert.equal(calls, 3, 'a lagging node can miss a tx another has — try them all');
  } finally { globalThis.fetch = real; }
});

test('rpc: total timeout is shared, so N endpoints cannot multiply the wait', async () => {
  const cfg = x402Config({ PASS_SECRET: 'test-secret', X402_RPC_TIMEOUT_MS: 300,
    NEAR_RPC_URL: 'https://a.example,https://b.example,https://c.example,https://d.example' });
  const real = globalThis.fetch;
  globalThis.fetch = (_u, init) => new Promise((_r, reject) => {
    init.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'TimeoutError' })));
  });
  const started = Date.now();
  try {
    await assert.rejects(verifyNearTxPayment(cfg, { txHash: 'T', secret: SECRET }, { now: NOW }), /within 0s|within 1s/);
    assert.ok(Date.now() - started < 1500, `took ${Date.now() - started}ms — budget must be shared, not per-endpoint`);
  } finally { globalThis.fetch = real; }
});

// --- sponsor claim: a free pass for people who funded the project ------------

import { claimSponsorPass, HEADER_SPONSOR } from './functions/_x402.js';
import { clearSponsorCache } from './functions/_sponsors.js';

const sponsorChain = (donors, publicKey) => {
  const real = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    const { params } = JSON.parse(init.body);
    const reply = (v) => Response.json({ result: { result: [...new TextEncoder().encode(JSON.stringify(v))] } });
    if (params?.request_type === 'view_access_key_list') return Response.json({ result: { keys: [{ public_key: publicKey }] } });
    if (params?.method_name === 'get_donations_for_recipient') return reply(donors.map((d) => ({ donor_id: d, ft_id: 'near', total_amount: '1' })));
    if (params?.method_name === 'get_pots') return reply([]);
    return reply([]);
  };
  clearKeyCache(); clearSponsorCache();
  return () => { globalThis.fetch = real; clearKeyCache(); clearSponsorCache(); };
};

test('claim: a sponsor gets a pass with no payment at all', async () => {
  const { auth, publicKey, accountId } = await makeProof({ txHash: undefined, issuedAt: Date.now() });
  const restore = sponsorChain([accountId], publicKey);
  try {
    const gate = await requirePass(AUTHCFG, req({ [HEADER_SPONSOR]: auth }));
    assert.equal(gate.ok, true);
    assert.equal(gate.pass.sub, accountId);
    assert.equal(gate.settle.sponsor, true);
    assert.ok(gate.minted, 'a pass must be issued');
  } finally { restore(); }
});

test('claim: a non-sponsor is refused, and told why', async () => {
  const { auth, publicKey } = await makeProof({ accountId: 'freeloader.near', txHash: undefined, issuedAt: Date.now() });
  const restore = sponsorChain(['someone-else.near'], publicKey);
  try {
    const gate = await requirePass(AUTHCFG, req({ [HEADER_SPONSOR]: auth }));
    assert.equal(gate.ok, false);
    assert.match(decodeHeader(gate.response.headers.get(HEADER_REQUIRED)).error, /has not funded/);
  } finally { restore(); }
});

test('claim: a signature from a key not on the account is refused', async () => {
  const { auth, accountId } = await makeProof({ txHash: undefined, issuedAt: Date.now() });
  const restore = sponsorChain([accountId], 'ed25519:SOMEONE_ELSES_KEY');
  try {
    const gate = await requirePass(AUTHCFG, req({ [HEADER_SPONSOR]: auth }));
    assert.equal(gate.ok, false);
    assert.match(decodeHeader(gate.response.headers.get(HEADER_REQUIRED)).error, /not on that account/);
  } finally { restore(); }
});

test('claim: a proof signed for another app is refused', async () => {
  const { auth, publicKey, accountId } = await makeProof({ recipient: 'other.near', txHash: undefined, issuedAt: Date.now() });
  const restore = sponsorChain([accountId], publicKey);
  try {
    const gate = await requirePass(AUTHCFG, req({ [HEADER_SPONSOR]: auth }));
    assert.equal(gate.ok, false);
    assert.match(decodeHeader(gate.response.headers.get(HEADER_REQUIRED)).error, /recipient mismatch/);
  } finally { restore(); }
});

test('nothing is for sale by default — the 402 explains sponsorship instead', () => {
  const cfg = x402Config({ PASS_SECRET: 's' });
  const pr = paymentRequired(cfg, { url: 'https://app.example/x' });
  assert.deepEqual(pr.accepts, [], 'no payment offered in the first iteration');
  assert.equal(pr.sponsorship.recipient, 'webassemblymusic.near');
  assert.match(pr.sponsorship.hint, /funded webassemblymusic\.near/);
});

test('payment can be switched back on without touching code', () => {
  const cfg = x402Config({ PASS_SECRET: 's', X402_SCHEMES: 'near-tx' });
  assert.deepEqual(paymentRequired(cfg, {}).accepts.map((a) => a.scheme), ['near-tx']);
});
