// The contract against a real NEAR sandbox: run ./build.sh first, then npm test.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import nearWorkspaces from 'near-workspaces';

const { Worker } = nearWorkspaces;

const KICK = 'import("stdfaust.lib");\nprocess = os.osc(50) * button("gate");\n';
const BASS = 'import("stdfaust.lib");\nprocess = os.sawtooth(hslider("freq",55,20,2000,1)) * button("gate");\n';
const SONG = "setBPM(112);\naddInstrument('kick');\naddInstrument('bass');\n";
const near = (n) => BigInt(Math.round(Number(n) * 1e6)) * 10n ** 18n;
const ONE_YOCTO = '1';
const APPROVAL_DEPOSIT = near('0.01').toString();
const GAS = '300000000000000';
const sha = (s) => createHash('sha256').update(s).digest('hex');

// alice owns `catalogue`, bob owns `other`. market stands in for a marketplace
// contract: it is approved on a token and calls nft_transfer_payout.
let worker, catalogue, other, alice, bob, carol, dave, market;

const call = (who, contract, method, args = {}, attachedDeposit = '0') =>
  who.call(contract, method, args, { attachedDeposit, gas: GAS });
const rejects = (promise, pattern) => assert.rejects(promise, pattern);

let counter = 0;
const unique = (src) => `${src}// ${++counter}\n`;
const instrument = (src = unique(KICK), royalty_bps = 0, who = alice, contract = catalogue) =>
  call(who, contract, 'publish_instrument', { title: 'Instrument', source: src, royalty_bps });
const song = (credits, royalty_bps = 3000, who = alice, contract = catalogue, src = unique(SONG)) =>
  call(who, contract, 'publish_song', { title: 'Song', source: src, credits, royalty_bps });
const local = (token_id) => ({ token_id });
const transfer = (from, token_id, to, contract = catalogue) =>
  call(from, contract, 'nft_transfer', { receiver_id: to.accountId, token_id }, ONE_YOCTO);
const payout = async (token_id, balance = '1000', contract = catalogue) =>
  (await contract.view('nft_payout', { token_id, balance, max_len_payout: 10 })).payout;

before(async () => {
  worker = await Worker.init();
  const root = worker.rootAccount;
  const account = (name) => root.createSubAccount(name, { initialBalance: near('50').toString() });
  [alice, bob, carol, dave, market] = await Promise.all(['alice', 'bob', 'carol', 'dave', 'market'].map(account));
  const wasm = new URL('../out/instrument_nft.wasm', import.meta.url).pathname;
  const deploy = (owner, name, symbol) => root.devDeploy(wasm, {
    method: 'new', args: { owner_id: owner.accountId, name, symbol }, initialBalance: near('20').toString(),
  });
  catalogue = await deploy(alice, "Alice's instruments", 'ALICE');
  other = await deploy(bob, "Bob's instruments", 'BOB');
});
after(async () => { await worker?.tearDown().catch(() => {}); });

// ---- publishing -------------------------------------------------------------

test('each contract is its publisher\'s own collection', async () => {
  assert.equal((await catalogue.view('nft_metadata')).name, "Alice's instruments");
  assert.equal((await other.view('nft_metadata')).symbol, 'BOB');
});

test('publishing stores the public source and proves who published it and when', async () => {
  const id = await instrument(KICK);
  assert.equal(id, `i-${sha(KICK)}`);
  assert.equal(await catalogue.view('source', { token_id: id }), KICK);
  const work = await catalogue.view('work', { token_id: id });
  assert.equal(work.publisher, alice.accountId);
  assert.equal(work.sha256, sha(KICK));
  assert.ok(work.published_at_ms > 1_000_000_000_000);
  assert.equal((await catalogue.view('nft_token', { token_id: id })).owner_id, alice.accountId);
});

test('only the contract owner can publish', async () => {
  await rejects(instrument(unique(KICK), 0, bob), /only the contract owner/);
  await rejects(song([], 0, bob), /only the contract owner/);
});

test('an exact copy is refused, naming the first publisher', async () => {
  await rejects(instrument(KICK), new RegExp(`already published by ${alice.accountId}`));
});

test('the same source in another publisher\'s contract is not detected, as documented', async () => {
  assert.equal(await instrument(KICK, 0, bob, other), `i-${sha(KICK)}`);
});

test('the contract pays for storage, and the publisher attaches nothing', async () => {
  const before = await catalogue.availableBalance();
  await instrument(unique(BASS));
  const after = await catalogue.availableBalance();
  assert.ok(BigInt(after.toString()) < BigInt(before.toString()));
});

test('bad input is refused', async () => {
  const publish = (title, source, royalty_bps = 0) => call(alice, catalogue, 'publish_instrument', { title, source, royalty_bps });
  await rejects(publish('x', ''), /empty source/);
  await rejects(publish('x', 'x'.repeat(64 * 1024 + 1)), /larger than 64 KiB/);
  await rejects(publish('', unique(KICK)), /title/);
  await rejects(publish('x', unique(KICK), 10001), /royalty above 100%/);
});

test('a song can only credit real instruments, each once', async () => {
  const songId = await song([]);
  await rejects(song([local('i-nope')]), /not a published instrument/);
  await rejects(song([local(songId)]), /not a published instrument/);
  const kick = await instrument();
  await rejects(song([local(kick), local(kick)]), /credited twice/);
  await rejects(song([{ token_id: kick, payee: bob.accountId }]), /pays its owner/);
  await rejects(song([{ token_id: 'i-x', contract: other.accountId }]), /needs a payee/);
  await rejects(song([{ token_id: kick, contract: catalogue.accountId, payee: bob.accountId }]), /leave out contract/);
  await rejects(song(Array.from({ length: 10 }, (_, i) => ({ token_id: `i-${i}`, contract: other.accountId, payee: bob.accountId }))), /too many credits/);
});

// ---- payouts ----------------------------------------------------------------

test('with no credits the royalty goes to the publisher and the seller gets the rest', async () => {
  const id = await instrument(unique(KICK), 1000);
  assert.deepEqual(await payout(id), { [alice.accountId]: '1000' });   // first sale: alice is both
  await transfer(alice, id, carol);
  assert.deepEqual(await payout(id), { [alice.accountId]: '100', [carol.accountId]: '900' });
});

test('credited instruments share the royalty, and it follows their current owner', async () => {
  const kick = await instrument();
  const bass = await instrument(unique(BASS));
  const songId = await song([local(kick), local(bass)], 2000);
  await transfer(alice, songId, carol);
  assert.deepEqual(await payout(songId), { [alice.accountId]: '200', [carol.accountId]: '800' });

  await transfer(alice, kick, bob);
  assert.deepEqual(await payout(songId), { [alice.accountId]: '100', [bob.accountId]: '100', [carol.accountId]: '800' });
});

test('an instrument in another contract pays the fixed payee', async () => {
  const theirs = await instrument(unique(BASS), 0, bob, other);
  const songId = await song([{ token_id: theirs, contract: other.accountId, payee: bob.accountId }], 2000);
  await transfer(alice, songId, carol);
  assert.deepEqual(await payout(songId), { [bob.accountId]: '200', [carol.accountId]: '800' });

  // Selling the instrument over there does not move the royalty: a view can't see it.
  await transfer(bob, theirs, dave, other);
  assert.deepEqual(await payout(songId), { [bob.accountId]: '200', [carol.accountId]: '800' });
});

test('a marketplace sells through an approval and gets the payout', async () => {
  const kick = await instrument();
  const songId = await song([local(kick)], 3000);
  await transfer(alice, songId, carol);
  const sale = { receiver_id: dave.accountId, token_id: songId, balance: near(10).toString(), max_len_payout: 10 };

  await rejects(call(market, catalogue, 'nft_transfer_payout', { ...sale, approval_id: 0 }, ONE_YOCTO), /Sender not approved|Unauthorized/i);
  await call(carol, catalogue, 'nft_approve', { token_id: songId, account_id: market.accountId }, APPROVAL_DEPOSIT);
  const { approved_account_ids } = await catalogue.view('nft_token', { token_id: songId });
  const approval_id = approved_account_ids[market.accountId];

  await rejects(call(market, catalogue, 'nft_transfer_payout', { ...sale, approval_id }), /yoctoNEAR/);
  await rejects(call(market, catalogue, 'nft_transfer_payout', { ...sale, approval_id, max_len_payout: 1 }, ONE_YOCTO), /payout too long/);

  const result = await call(market, catalogue, 'nft_transfer_payout', { ...sale, approval_id }, ONE_YOCTO);
  assert.deepEqual(result.payout, { [alice.accountId]: near(3).toString(), [carol.accountId]: near(7).toString() });
  const token = await catalogue.view('nft_token', { token_id: songId });
  assert.equal(token.owner_id, dave.accountId);
  assert.deepEqual(token.approved_account_ids, {});
  // The approval died with the sale.
  await rejects(call(market, catalogue, 'nft_transfer_payout', { ...sale, approval_id }, ONE_YOCTO), /Sender not approved|Unauthorized/i);
});

test('the contract has no sale of its own and no way to hold earnings', async () => {
  for (const method of ['buy', 'list_for_sale', 'unlist', 'pay_token', 'withdraw_earnings', 'earnings']) {
    await rejects(call(alice, catalogue, method, { token_id: 'x' }), /MethodNotFound|MethodResolveError/);
  }
});

// ---- JS runs last: posting it changes the policy for every later payout -----

const post = (javascript, who = alice, contract = catalogue) => call(who, contract, 'post_javascript', { javascript });
const DEFAULT_POLICY = 'export function unused() {}';

test('only the contract owner can post JavaScript', async () => {
  await rejects(post('export function x() {}', bob), /only the contract owner/);
  await rejects(post('export function x() {}', alice, other), /only the contract owner/);
});

test('JS divides the royalty, and can pay anyone', async () => {
  const kick = await instrument();
  const songId = await song([local(kick)], 3000);
  await transfer(alice, songId, carol);
  await post(`export function payout() {
    const { royalty, publisher, credits } = JSON.parse(env.sale_context());
    const half = BigInt(royalty) / 2n;
    return JSON.stringify({ [publisher]: half.toString(), '${dave.accountId}': (BigInt(royalty) - half).toString() });
  }`);
  assert.deepEqual(await payout(songId), { [alice.accountId]: '150', [dave.accountId]: '150', [carol.accountId]: '700' });
  await post(DEFAULT_POLICY);
  assert.deepEqual(await payout(songId), { [alice.accountId]: '300', [carol.accountId]: '700' });
});

test('JS cannot take more than the work declared, whatever it returns', async () => {
  const songId = await song([], 3000);
  await transfer(alice, songId, carol);
  await post(`export function payout() {
    const { balance, publisher } = JSON.parse(env.sale_context());
    return JSON.stringify({ [publisher]: balance });
  }`);
  await rejects(payout(songId), /exceed what the work declared/);
  await post(`export function payout() { return 'nonsense'; }`);
  await rejects(payout(songId), /must return/);
  await post(DEFAULT_POLICY);
});

test('a broken script only affects its own contract', async () => {
  const mine = await song([], 1000);
  const theirs = await song([], 1000, bob, other);
  await post(`export function payout() { throw new Error('broken'); }`);
  await rejects(payout(mine));
  assert.deepEqual(await payout(theirs, '1000', other), { [bob.accountId]: '1000' });
  await post(DEFAULT_POLICY);
});

test('JS has no way to write storage or send money', async () => {
  await post(`export function probe() {
    const names = ['storage_write', 'storage_remove', 'set_data', 'clear_data', 'ft_transfer_internal', 'promise_create', 'transfer'];
    env.value_return(JSON.stringify(names.filter((n) => typeof env[n] !== 'undefined')));
  }`);
  assert.deepEqual(await catalogue.view('call_js_func', { function_name: 'probe' }), []);
  await post(DEFAULT_POLICY);
});

test('reports what the main calls cost', async () => {
  const tgas = (r) => (Number(r.result.transaction_outcome.outcome.gas_burnt) + r.result.receipts_outcome.reduce((s, o) => s + Number(o.outcome.gas_burnt), 0)) / 1e12;
  const options = { gas: GAS };
  const publish = await alice.callRaw(catalogue, 'publish_instrument', { title: 'Kick', source: unique(KICK), royalty_bps: 0 }, options);
  const kick = publish.parseResult();
  const sale = async () => {
    const id = await song([local(kick)]);
    await call(alice, catalogue, 'nft_approve', { token_id: id, account_id: market.accountId }, APPROVAL_DEPOSIT);
    const { approved_account_ids } = await catalogue.view('nft_token', { token_id: id });
    return market.callRaw(catalogue, 'nft_transfer_payout', {
      receiver_id: carol.accountId, token_id: id, approval_id: approved_account_ids[market.accountId],
      balance: near(1).toString(), max_len_payout: 10,
    }, { attachedDeposit: ONE_YOCTO, gas: GAS });
  };
  const rustSale = await sale();
  await post(`export function payout() {
    const { royalty, publisher } = JSON.parse(env.sale_context());
    return JSON.stringify({ [publisher]: royalty });
  }`);
  const jsSale = await sale();
  await post(DEFAULT_POLICY);
  console.log(`gas: publish_instrument ${tgas(publish).toFixed(1)} TGas, nft_transfer_payout (Rust) ${tgas(rustSale).toFixed(1)} TGas, nft_transfer_payout (JS) ${tgas(jsSale).toFixed(1)} TGas`);
  assert.ok(tgas(rustSale) < 300 && tgas(jsSale) < 300);
});
