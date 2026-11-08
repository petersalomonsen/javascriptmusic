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
const DEPOSIT = near('0.1').toString();
const ONE_YOCTO = '1';
const GAS = '300000000000000';
const sha = (s) => createHash('sha256').update(s).digest('hex');

let worker, contract, alice, bob, carol;

const call = (who, method, args = {}, attachedDeposit = '0') =>
  who.call(contract, method, args, { attachedDeposit, gas: GAS });
const rejects = (promise, pattern) => assert.rejects(promise, pattern);
// A call returns before its refunds land, so a balance read straight after one is
// early. The sandbox makes a block a second; three is plenty for those receipts.
const settle = () => new Promise((resolve) => setTimeout(resolve, 3000));
const balance = async (account) => BigInt((await account.availableBalance()).toString());

let counter = 0;
const unique = (src) => `${src}// ${++counter}\n`;
const publishInstrument = (who, src = unique(KICK), title = 'Kick') =>
  call(who, 'publish_instrument', { title, source: src }, DEPOSIT);
async function publishSong(who, instruments, bps = 3000, src = unique(SONG)) {
  return call(who, 'publish_song', { title: 'Song', source: src, instruments, instrument_share_bps: bps }, DEPOSIT);
}

before(async () => {
  worker = await Worker.init();
  const root = worker.rootAccount;
  contract = await root.devDeploy(new URL('../out/instrument_nft.wasm', import.meta.url).pathname, {
    method: 'new', args: { owner_id: root.accountId }, initialBalance: near('30').toString(),
  });
  alice = await root.createSubAccount('alice', { initialBalance: near('50').toString() });
  bob = await root.createSubAccount('bob', { initialBalance: near('50').toString() });
  carol = await root.createSubAccount('carol', { initialBalance: near('50').toString() });
});
after(async () => { await worker?.tearDown().catch(() => {}); });

test('publishing stores the public source and proves who published it and when', async () => {
  const id = await publishInstrument(alice, KICK);
  assert.equal(id, `i-${sha(KICK)}`);
  assert.equal(await contract.view('source', { token_id: id }), KICK);
  const work = await contract.view('work', { token_id: id });
  assert.equal(work.publisher, alice.accountId);
  assert.equal(work.sha256, sha(KICK));
  assert.ok(work.published_at_ms > 1_000_000_000_000);
  assert.equal((await contract.view('nft_token', { token_id: id })).owner_id, alice.accountId);
});

test('an exact copy is refused, naming the first publisher', async () => {
  await rejects(publishInstrument(bob, KICK), new RegExp(`already published by ${alice.accountId}`));
});

test('publishing needs its storage paid, and the surplus comes back', async () => {
  const source = unique(BASS);
  await rejects(call(alice, 'publish_instrument', { title: 'Bass', source }, '1'), /attach at least/);
  const before = await balance(bob);
  await call(bob, 'publish_instrument', { title: 'Bass', source }, near('5').toString());
  const spent = before - (await balance(bob));
  assert.ok(spent < near('0.1'), `kept ${spent} of 5 NEAR`);
});

test('bad input is refused', async () => {
  await rejects(call(alice, 'publish_instrument', { title: 'x', source: '' }, DEPOSIT), /empty source/);
  await rejects(call(alice, 'publish_instrument', { title: 'x', source: 'x'.repeat(64 * 1024 + 1) }, DEPOSIT), /larger than 64 KiB/);
  await rejects(call(alice, 'publish_instrument', { title: '', source: unique(KICK) }, DEPOSIT), /title/);
});

test('a song can only name published instruments, each once', async () => {
  const song = await publishSong(alice, []);
  await rejects(publishSong(alice, ['i-nope']), /not a published instrument/);
  await rejects(publishSong(alice, [song]), /not a published instrument/);
  const kick = await publishInstrument(alice);
  await rejects(publishSong(alice, [kick, kick]), /named twice/);
  await rejects(publishSong(alice, [kick], 10001), /share above 100%/);
});

test('buying a song credits its instruments and pays the seller the rest', async () => {
  const kick = await publishInstrument(alice);
  const bass = await publishInstrument(bob);
  const song = await publishSong(carol, [kick, bass], 3000);
  await call(carol, 'list_for_sale', { token_id: song, price: near(10).toString() }, ONE_YOCTO);

  await settle();
  const sellerBefore = await balance(carol);
  const buyerBefore = await balance(alice);
  await rejects(call(alice, 'buy', { token_id: song }, near(9).toString()), /attach at least/);
  await call(alice, 'buy', { token_id: song }, near(12).toString());
  await settle();

  assert.equal((await contract.view('nft_token', { token_id: song })).owner_id, alice.accountId);
  assert.equal(await contract.view('earnings', { token_id: kick }), near('1.5').toString());
  assert.equal(await contract.view('earnings', { token_id: bass }), near('1.5').toString());
  const sellerGot = (await balance(carol)) - sellerBefore;
  assert.equal(sellerGot, near(7));
  const buyerPaid = buyerBefore - (await balance(alice));
  assert.ok(buyerPaid >= near(10) && buyerPaid < near('10.1'), `buyer paid ${buyerPaid}`);
  assert.equal(await contract.view('listing', { token_id: song }), null);
});

test('earnings belong to the token: its current owner collects them, nobody else', async () => {
  const kick = await publishInstrument(alice);
  await call(carol, 'pay_token', { token_id: kick }, near(2).toString());
  assert.equal(await contract.view('earnings', { token_id: kick }), near(2).toString());

  await rejects(call(bob, 'withdraw_earnings', { token_id: kick }, ONE_YOCTO), /only the token owner/);
  await call(alice, 'nft_transfer', { receiver_id: bob.accountId, token_id: kick }, ONE_YOCTO);
  await rejects(call(alice, 'withdraw_earnings', { token_id: kick }, ONE_YOCTO), /only the token owner/);

  const before = await balance(bob);
  await call(bob, 'withdraw_earnings', { token_id: kick }, ONE_YOCTO);
  assert.ok((await balance(bob)) - before > near('1.99'));
  assert.equal(await contract.view('earnings', { token_id: kick }), '0');
  await rejects(call(bob, 'withdraw_earnings', { token_id: kick }, ONE_YOCTO), /nothing to withdraw/);
});

test('a listing left behind by a plain transfer cannot sell the new owner\'s token', async () => {
  const kick = await publishInstrument(alice);
  await call(alice, 'list_for_sale', { token_id: kick, price: near(1).toString() }, ONE_YOCTO);
  await call(alice, 'nft_transfer', { receiver_id: bob.accountId, token_id: kick }, ONE_YOCTO);
  assert.equal(await contract.view('listing', { token_id: kick }), null);
  await rejects(call(carol, 'buy', { token_id: kick }, near(1).toString()), /not for sale/);
});

test('only the owner can list, and listing needs a full-access signature', async () => {
  const kick = await publishInstrument(alice);
  await rejects(call(bob, 'list_for_sale', { token_id: kick, price: '1' }, ONE_YOCTO), /only the token owner/);
  await rejects(call(alice, 'list_for_sale', { token_id: kick, price: '1' }), /1 yoctoNEAR/);
});

test('NEP-199: an outside marketplace pays instrument owners directly', async () => {
  const kick = await publishInstrument(alice);
  const bass = await publishInstrument(bob);
  const song = await publishSong(carol, [kick, bass], 2000);
  const { payout } = await contract.view('nft_payout', { token_id: song, balance: '1000', max_len_payout: 10 });
  assert.deepEqual(payout, { [alice.accountId]: '100', [bob.accountId]: '100', [carol.accountId]: '800' });
  await rejects(contract.view('nft_payout', { token_id: song, balance: '1000', max_len_payout: 2 }), /payout too long/);
});

// ---- JS runs last: posting it changes the policy for every later sale ------

const sale = async (instruments) => {
  const song = await publishSong(carol, instruments, 3000);
  await call(carol, 'list_for_sale', { token_id: song, price: near(1).toString() }, ONE_YOCTO);
  return song;
};
const post = (javascript) => call(worker.rootAccount, 'post_javascript', { javascript });

test('only the contract owner can post JavaScript', async () => {
  await rejects(call(alice, 'post_javascript', { javascript: 'export function x() {}' }), /Unauthorized/);
});

test('JS customizes the split', async () => {
  const kick = await publishInstrument(alice);
  const bass = await publishInstrument(bob);
  const song = await sale([kick, bass]);
  await post(`export function song_split() {
    const { price, instruments } = JSON.parse(env.sale_context());
    return JSON.stringify({ [instruments[0]]: (BigInt(price) / 2n).toString() });
  }`);
  await call(alice, 'buy', { token_id: song }, near(1).toString());
  assert.equal(await contract.view('earnings', { token_id: kick }), near('0.5').toString());
  assert.equal(await contract.view('earnings', { token_id: bass }), '0');
});

test('hostile JS cannot move money: Rust refuses outsiders and overdrafts', async () => {
  const kick = await publishInstrument(alice);
  const song = await sale([kick]);
  const stranger = await publishInstrument(bob);

  await post(`export function song_split() { return JSON.stringify({ '${stranger}': '1' }); }`);
  await rejects(call(alice, 'buy', { token_id: song }, near(1).toString()), /does not use/);

  await post(`export function song_split() {
    const { price, instruments } = JSON.parse(env.sale_context());
    return JSON.stringify({ [instruments[0]]: (BigInt(price) * 2n).toString() });
  }`);
  await rejects(call(alice, 'buy', { token_id: song }, near(1).toString()), /exceeds the price/);

  await post(`export function song_split() { return 'nonsense'; }`);
  await rejects(call(alice, 'buy', { token_id: song }, near(1).toString()), /must return/);

  // The failed attempts left everything as it was.
  assert.equal((await contract.view('nft_token', { token_id: song })).owner_id, carol.accountId);
  assert.equal(await contract.view('earnings', { token_id: kick }), '0');
});

test('JS has no way to write storage or send money', async () => {
  await post(`export function probe() {
    const names = ['storage_write', 'storage_remove', 'set_data', 'clear_data', 'ft_transfer_internal', 'promise_create', 'transfer'];
    env.value_return(JSON.stringify(names.filter((n) => typeof env[n] !== 'undefined')));
  }`);
  assert.deepEqual(await contract.view('call_js_func', { function_name: 'probe' }), []);
});

test('reports what the main calls cost', async () => {
  await post('export function unused() {}');   // back to the Rust default split
  const kick = await alice.callRaw(contract, 'publish_instrument', { title: 'Kick', source: unique(KICK) }, { attachedDeposit: DEPOSIT, gas: GAS });
  const kickId = kick.parseResult();
  const song = await publishSong(carol, [kickId]);
  await call(carol, 'list_for_sale', { token_id: song, price: near(1).toString() }, ONE_YOCTO);
  const rawBuy = await alice.callRaw(contract, 'buy', { token_id: song }, { attachedDeposit: near(1).toString(), gas: GAS });
  const tgas = (r) => (Number(r.result.transaction_outcome.outcome.gas_burnt) + r.result.receipts_outcome.reduce((s, o) => s + Number(o.outcome.gas_burnt), 0)) / 1e12;
  await post(`export function song_split() {
    const { price, instruments } = JSON.parse(env.sale_context());
    return JSON.stringify({ [instruments[0]]: (BigInt(price) / 2n).toString() });
  }`);
  const song2 = await publishSong(carol, [kickId]);
  await call(carol, 'list_for_sale', { token_id: song2, price: near(1).toString() }, ONE_YOCTO);
  const jsBuy = await alice.callRaw(contract, 'buy', { token_id: song2 }, { attachedDeposit: near(1).toString(), gas: GAS });
  console.log(`gas: publish_instrument ${tgas(kick).toFixed(1)} TGas, buy (Rust split) ${tgas(rawBuy).toFixed(1)} TGas, buy (JS split) ${tgas(jsBuy).toFixed(1)} TGas`);
  assert.ok(tgas(rawBuy) < 300 && tgas(jsBuy) < 300);
});
