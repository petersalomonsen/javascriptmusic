import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDelegateAction, selectRequirements, walletCanPay, payWithTransaction, passAccountId,
  encodeHeader, decodeHeader, passRemainingSeconds, passKey, formatPassDuration,
} from './x402-client.js';
import { paymentRequirements, nearTxRequirements, memoFor, x402Config, encodeHeader as srvEncode } from '../functions/_x402.js';

const CFG = x402Config({ PASS_SECRET: 'x' });
const REQ = paymentRequirements(CFG);
const NEARTX = nearTxRequirements(CFG);
const DELEGATE_WALLET = { manifest: { name: 'Meteor', features: { signDelegateActions: true } } };
const PLAIN_WALLET = { manifest: { name: 'HOT', features: { signDelegateActions: false } } };

test('client and server agree on the header codec', () => {
  const o = { a: 1, s: 'em—dash' };
  assert.deepEqual(decodeHeader(srvEncode(o)), o);
  assert.deepEqual(decodeHeader(encodeHeader(o)), o);
});

test('delegate action is exactly what the exact scheme permits', () => {
  const d = buildDelegateAction(REQ);
  assert.equal(d.receiverId, REQ.asset, 'receiver must be the token contract');
  assert.equal(d.actions.length, 1, 'exactly one action');
  const p = d.actions[0].params;
  assert.equal(d.actions[0].type, 'FunctionCall');
  assert.equal(p.methodName, 'ft_transfer');
  assert.equal(p.deposit, '1', 'exactly 1 yoctoNEAR — the NEP-141 full-access marker');
  assert.equal(p.args.receiver_id, REQ.payTo);
  assert.equal(p.args.amount, REQ.amount);
});

test('ignores non-NEAR options', () => {
  const pr = { accepts: [{ scheme: 'exact', network: 'eip155:8453' }, REQ] };
  assert.equal(selectRequirements(pr).network, 'near:mainnet');
  assert.throws(() => selectRequirements({ accepts: [{ scheme: 'upto', network: 'near:mainnet' }] }), /no NEAR/);
  assert.throws(() => selectRequirements({ accepts: [] }), /no NEAR/);
});

test('prefers near-tx over exact — it works in every wallet', () => {
  const accepts = [{ scheme: 'exact', network: 'near:mainnet' }, NEARTX];
  assert.equal(selectRequirements({ accepts }).scheme, 'near-tx');
  // …even for a wallet that COULD sign delegates: no facilitator is simpler.
  assert.equal(selectRequirements({ accepts }, { wallet: DELEGATE_WALLET }).scheme, 'near-tx');
});

test('falls back to exact only when the wallet can sign delegates', () => {
  const accepts = [{ scheme: 'exact', network: 'near:mainnet' }];
  assert.equal(selectRequirements({ accepts }, { wallet: DELEGATE_WALLET }).scheme, 'exact');
  assert.throws(() => selectRequirements({ accepts }, { wallet: PLAIN_WALLET }),
    /cannot sign delegate actions/);
});

// A wallet that can sign messages but NOT delegate actions — i.e. most of them.
const mockWallet = (over = {}) => ({
  manifest: { name: 'Any Wallet', features: {} },
  signAndSendTransaction: async () => ({ transaction: { hash: 'TX1' } }),
  signMessage: async ({ message }) => ({
    accountId: 'psalomo.near', publicKey: 'ed25519:PUB', signature: 'SIG', message,
  }),
  ...over,
});

test('near-tx payment: ONE prompt, memo shows the price, secret stays off-chain', async () => {
  let sent;
  const wallet = mockWallet({
    signAndSendTransaction: async (tx) => { sent = tx; return { transaction: { hash: 'TX1' } }; },
    signMessage: async () => { throw new Error('must not be called — one prompt only'); },
  });
  const payload = await payWithTransaction(wallet, NEARTX, { accountId: 'psalomo.near' });

  assert.equal(sent.receiverId, NEARTX.asset);
  assert.equal(sent.actions.length, 1);
  const p = sent.actions[0].params;
  assert.equal(p.methodName, 'ft_transfer');
  assert.equal(p.deposit, '1');
  assert.equal(p.args.receiver_id, NEARTX.payTo);
  assert.equal(p.args.amount, NEARTX.amount);

  // The memo is what the payer reads in the wallet, since wallets show that
  // `ft_transfer` is being called without decoding its arguments.
  assert.ok(p.args.memo.startsWith('WebAssembly Music studio AI session pass — 0.01 USDC'),
    `payer would see: ${p.args.memo}`);
  assert.equal(p.args.memo, await memoFor(CFG, payload.payload.secret));
  assert.ok(!JSON.stringify(sent).includes(payload.payload.secret), 'secret must not be on-chain');

  assert.equal(payload.payload.txHash, 'TX1');
  assert.equal(payload.accepted.scheme, 'near-tx');
  assert.equal(payload.payload.auth, undefined, 'the default path signs no second message');
});

test('near-tx: signed-proof mode is still available on request', async () => {
  const payload = await payWithTransaction(mockWallet(), NEARTX,
    { accountId: 'psalomo.near', proof: 'signature' });
  assert.ok(payload.payload.auth, 'explicit opt-in still signs a proof');
  assert.equal(payload.payload.secret, undefined);
  const proof = JSON.parse(Buffer.from(payload.payload.auth, 'base64url').toString());
  assert.equal(JSON.parse(proof.message).txHash, 'TX1');
  assert.equal(JSON.parse(proof.message).purpose, NEARTX.extra.purpose);
  assert.equal(proof.recipient, NEARTX.extra.authRecipient);
});

test('near-tx: works in a wallet that cannot signMessage at all', async () => {
  const wallet = {
    manifest: { name: 'Trezu', features: { signMessage: false } },
    signAndSendTransaction: async () => ({ transaction: { hash: 'TX2' } }),
  };
  const payload = await payWithTransaction(wallet, NEARTX, { accountId: 'psalomo.near' });
  assert.ok(payload.payload.secret);
});

test('near-tx: if a signed proof is refused AFTER paying, the hash survives', async () => {
  // Only reachable in `signature` mode; the money is already gone at that
  // point, so losing the hash would lose it.
  const wallet = mockWallet({ signMessage: async () => { throw new Error('user rejected'); } });
  await assert.rejects(
    payWithTransaction(wallet, NEARTX, { accountId: 'psalomo.near', proof: 'signature' }),
    (e) => e.unclaimed === true && e.txHash === 'TX1' && /not lost/.test(e.message));
});

test('near-tx: each payment uses a fresh secret', async () => {
  const wallet = mockWallet({ signAndSendTransaction: async () => ({ transaction: { hash: 'T' } }) });
  const a = await payWithTransaction(wallet, NEARTX, {});
  const b = await payWithTransaction(wallet, NEARTX, {});
  assert.notEqual(a.payload.secret, b.payload.secret);
});

test('near-tx: a wallet that returns no hash fails loudly', async () => {
  const wallet = mockWallet({ signAndSendTransaction: async () => ({}) });
  await assert.rejects(payWithTransaction(wallet, NEARTX, {}), /no transaction hash/);
});

test('wallet capability gate matches the manifest flag', () => {
  assert.equal(walletCanPay({ manifest: { features: { signDelegateActions: true } } }), true);
  assert.equal(walletCanPay({ manifest: { features: { signDelegateActions: false } } }), false);
  assert.equal(walletCanPay({}), false);
  assert.equal(walletCanPay(undefined), false);
});

test('pass expiry is read from the JWT claims', () => {
  const claims = (exp) => 'h.' + Buffer.from(JSON.stringify({ exp })).toString('base64url') + '.s';
  const soon = Math.floor(Date.now() / 1000) + 3600;
  assert.ok(Math.abs(passRemainingSeconds(claims(soon)) - 3600) < 5);
  assert.equal(passRemainingSeconds(claims(1)), 0, 'expired reads as 0');
  assert.equal(passRemainingSeconds(null), 0);
  assert.equal(passRemainingSeconds('garbage'), 0, 'never throws on junk');
});

test('one pass per browser, and it says who paid', () => {
  // Keyed once, not per account: only the payment page knows the account, and
  // the app that needs to READ the pass has no wallet connection at all.
  assert.equal(passKey(), 'studio-pass');
  const claims = (sub, exp) => 'h.' + Buffer.from(JSON.stringify({ sub, exp })).toString('base64url') + '.s';
  assert.equal(passAccountId(claims('alice.near', 2 ** 31)), 'alice.near');
  assert.equal(passAccountId('rubbish'), null);
});

// Passes are MINUTES long — 30 by default — so the pay page's hours arithmetic
// was the wrong unit throughout: Math.floor(1800/3600) told a buyer they had
// "about 0h left" on a pass just issued, and the claim message rounded the same
// figure up to "1 hours". Singular/plural matters here because the numbers are
// small enough to hit 1 routinely.
test('formatPassDuration reads naturally at the durations passes actually have', () => {
  assert.equal(formatPassDuration(1800), '30 minutes');   // the default pass
  assert.equal(formatPassDuration(60), '1 minute');
  assert.equal(formatPassDuration(90), '2 minutes');
  assert.equal(formatPassDuration(3600), '1 hour');
  assert.equal(formatPassDuration(5400), '1 hour 30 min');
  assert.equal(formatPassDuration(86400), '24 hours');
});

test('formatPassDuration handles the edges without saying "0h"', () => {
  assert.equal(formatPassDuration(0), '0 seconds');
  assert.equal(formatPassDuration(1), '1 second');
  assert.equal(formatPassDuration(45), '45 seconds');
  assert.equal(formatPassDuration(-10), '0 seconds', 'an expired pass never reads as negative');
});
