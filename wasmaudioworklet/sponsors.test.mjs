import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sponsorConfig, fetchSponsors, isSponsor, clearSponsorCache,
  DEFAULT_DONATION_CONTRACT, DEFAULT_POT_FACTORY, DEFAULT_RECIPIENT,
} from './functions/_sponsors.js';

const RPC = ['https://rpc.example'];
const CFG = sponsorConfig({});

/**
 * Fake the chain. `direct` are donations on the donation contract; `pots` maps
 * a pot account to the donations it recorded for our project.
 */
function onChain({ direct = [], pots = {}, failPots = [], failFactory = false } = {}) {
  const real = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (_url, init) => {
    const { params } = JSON.parse(init.body);
    const { account_id, method_name } = params;
    calls.push(`${account_id}:${method_name}`);
    const reply = (v) => Response.json({ result: { result: [...new TextEncoder().encode(JSON.stringify(v))] } });
    if (method_name === 'get_donations_for_recipient') return reply(direct);
    if (method_name === 'get_pots') {
      if (failFactory) return Response.json({ error: { message: 'factory down' } });
      return reply(Object.keys(pots).map((id) => ({ id })));
    }
    if (method_name === 'get_donations_for_project') {
      if (failPots.includes(account_id)) return Response.json({ error: { message: 'pot down' } });
      return reply(pots[account_id] || []);
    }
    throw new Error('unexpected ' + method_name);
  };
  clearSponsorCache();
  return { calls, restore: () => { globalThis.fetch = real; clearSponsorCache(); } };
}

const gave = (donor_id, near) => ({ donor_id, ft_id: 'near', total_amount: String(BigInt(near) * 10n ** 24n) });

test('defaults point at PotLock mainnet and this project', () => {
  assert.equal(CFG.contract, DEFAULT_DONATION_CONTRACT);
  assert.equal(CFG.potFactory, DEFAULT_POT_FACTORY);
  assert.equal(CFG.recipient, DEFAULT_RECIPIENT);
  assert.equal(CFG.recipient, 'webassemblymusic.near');
});

// THE bug this module exists to avoid: most of this project's funding arrived
// through matching rounds, not direct donations. Reading only the donation
// contract found 4 of 39 supporters — a plausible number, silently wrong.
test('a pot-only donor is a sponsor', async () => {
  const { restore } = onChain({
    direct: [gave('mike.near', 19)],
    pots: { 'build.v1.potfactory.potlock.near': [gave('ziomek.near', 1)] },
  });
  try {
    assert.equal(await isSponsor('ziomek.near', CFG, RPC), true, 'pot donations must count');
    assert.equal(await isSponsor('mike.near', CFG, RPC), true);
    assert.equal(await isSponsor('stranger.near', CFG, RPC), false);
  } finally { restore(); }
});

test('every pot is swept, and totals are summed across all of them', async () => {
  const { calls, restore } = onChain({
    direct: [gave('a.near', 1)],
    pots: {
      'p1.potfactory.potlock.near': [gave('a.near', 2), gave('b.near', 3)],
      'p2.potfactory.potlock.near': [gave('c.near', 4)],
    },
  });
  try {
    const totals = await fetchSponsors(CFG, RPC);
    assert.deepEqual([...totals.keys()].sort(), ['a.near', 'b.near', 'c.near']);
    assert.equal(totals.get('a.near'), 3n * 10n ** 24n, 'direct + pot for the same donor');
    assert.ok(calls.includes('p1.potfactory.potlock.near:get_donations_for_project'));
    assert.ok(calls.includes('p2.potfactory.potlock.near:get_donations_for_project'));
  } finally { restore(); }
});

test('the pot list comes from the factory, so a new round needs no deploy', async () => {
  const { calls, restore } = onChain({ pots: { 'brand-new-round.potfactory.potlock.near': [gave('newbie.near', 1)] } });
  try {
    assert.ok(calls.length === 0);
    assert.equal(await isSponsor('newbie.near', CFG, RPC), true);
    assert.ok(calls.some((c) => c.startsWith(DEFAULT_POT_FACTORY)), 'must ask the factory');
  } finally { restore(); }
});

test('one broken pot costs only that round, not everyone', async () => {
  const { restore } = onChain({
    direct: [gave('a.near', 1)],
    pots: { 'ok.potfactory.potlock.near': [gave('b.near', 1)], 'broken.potfactory.potlock.near': [gave('c.near', 1)] },
    failPots: ['broken.potfactory.potlock.near'],
  });
  try {
    assert.equal(await isSponsor('a.near', CFG, RPC), true);
    assert.equal(await isSponsor('b.near', CFG, RPC), true);
    assert.equal(await isSponsor('c.near', CFG, RPC), false, 'unreachable pot fails closed');
  } finally { restore(); }
});

test('a broken factory still honours direct donations', async () => {
  const { restore } = onChain({ direct: [gave('a.near', 1)], failFactory: true });
  try { assert.equal(await isSponsor('a.near', CFG, RPC), true); } finally { restore(); }
});

test('if the donation contract itself is unreachable, it throws — never grants', async () => {
  const real = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('network down'); };
  clearSponsorCache();
  try {
    await assert.rejects(isSponsor('a.near', CFG, RPC), /network down|could not reach/);
  } finally { globalThis.fetch = real; clearSponsorCache(); }
});

test('token donations count as sponsorship but add nothing to a NEAR total', async () => {
  const { restore } = onChain({ direct: [{ donor_id: 'tok.near', ft_id: 'usdc.near', total_amount: '5000000' }] });
  try {
    const totals = await fetchSponsors(CFG, RPC);
    assert.equal(totals.get('tok.near'), 0n);
    assert.equal(await isSponsor('tok.near', CFG, RPC), true);
  } finally { restore(); }
});

test('a minimum can be required, summed across rounds', async () => {
  const cfg = sponsorConfig({ SPONSOR_MIN_YOCTO: String(2n * 10n ** 24n) });
  const { restore } = onChain({
    direct: [gave('small.near', 1), gave('big.near', 1)],
    pots: { 'p.potfactory.potlock.near': [gave('big.near', 1)] },
  });
  try {
    assert.equal(await isSponsor('big.near', cfg, RPC), true, '1 + 1 meets the minimum');
    assert.equal(await isSponsor('small.near', cfg, RPC), false);
  } finally { restore(); }
});

test('the sweep is cached — claims should not re-read the chain every time', async () => {
  const { calls, restore } = onChain({ direct: [gave('a.near', 1)], pots: { 'p.potfactory.potlock.near': [] } });
  try {
    await isSponsor('a.near', CFG, RPC);
    const first = calls.length;
    await isSponsor('a.near', CFG, RPC);
    await isSponsor('b.near', CFG, RPC);
    assert.equal(calls.length, first, 'later checks must hit the cache');
  } finally { restore(); }
});

test('sponsorship can be switched off entirely', async () => {
  const cfg = sponsorConfig({ SPONSORS_ENABLED: 'false' });
  const { calls, restore } = onChain({ direct: [gave('a.near', 1)] });
  try {
    assert.equal(await isSponsor('a.near', cfg, RPC), false);
    assert.equal(calls.length, 0, 'and it should not even look');
  } finally { restore(); }
});
