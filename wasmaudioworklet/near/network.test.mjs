import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NETWORKS, DEFAULT_NETWORK_ID, isNetworkId,
  networkById, networkIdForAccountId, rpcUrlForAccountId,
} from './network.js';

test('network is derived from the account id suffix', () => {
  assert.equal(networkIdForAccountId('repo.gitfactory.near'), 'mainnet');
  assert.equal(networkIdForAccountId('webassemblymusic.near'), 'mainnet');
  assert.equal(networkIdForAccountId('repo.gitfactory.testnet'), 'testnet');
  assert.equal(networkIdForAccountId('alice.test.near'), 'testnet');
  assert.equal(networkIdForAccountId('repo.factory.sandbox'), 'sandbox');
});

test('.test.near is testnet, not mainnet (suffix order matters)', () => {
  // Both suffixes match `.near`; the testnet one has to win.
  assert.equal(networkIdForAccountId('foo.test.near'), 'testnet');
});

test('ambiguous ids use the fallback — implicit accounts exist on both networks', () => {
  const implicit = 'a'.repeat(64);
  assert.equal(networkIdForAccountId(implicit), DEFAULT_NETWORK_ID);
  assert.equal(networkIdForAccountId(implicit, 'testnet'), 'testnet');
  // A bogus fallback must not leak through as a network id.
  assert.equal(networkIdForAccountId(implicit, 'nonsense'), DEFAULT_NETWORK_ID);
});

test('empty / missing account id does not throw', () => {
  assert.equal(networkIdForAccountId(undefined), DEFAULT_NETWORK_ID);
  assert.equal(networkIdForAccountId(''), DEFAULT_NETWORK_ID);
  assert.equal(networkIdForAccountId(null, 'testnet'), 'testnet');
});

test('the local sandbox routes to the docker RPC proxy, never a live network', () => {
  const url = rpcUrlForAccountId('repo.factory.sandbox', { archival: true });
  assert.equal(url, 'http://localhost:3030/near-rpc');
  assert.equal(rpcUrlForAccountId('repo.factory.sandbox'), 'http://localhost:3030/near-rpc');
});

test('archival endpoints are used for the git-storage path', () => {
  assert.match(rpcUrlForAccountId('r.gitfactory.testnet', { archival: true }), /^https:\/\/archival-rpc\.testnet\./);
  assert.match(rpcUrlForAccountId('r.gitfactory.near', { archival: true }), /^https:\/\/archival-rpc\.mainnet\./);
  // Non-archival is a different endpoint (used by the proxy's view calls).
  assert.notEqual(
    rpcUrlForAccountId('r.gitfactory.near'),
    rpcUrlForAccountId('r.gitfactory.near', { archival: true }),
  );
});

test('every network config is complete', () => {
  for (const [id, net] of Object.entries(NETWORKS)) {
    assert.equal(net.networkId, id, `${id}: networkId must match its key`);
    for (const field of ['nodeUrl', 'archivalNodeUrl', 'walletNetworkId']) {
      assert.ok(net[field], `${id}: missing ${field}`);
    }
    // near-connect only knows mainnet/testnet.
    assert.ok(['mainnet', 'testnet'].includes(net.walletNetworkId), `${id}: unusable walletNetworkId`);
  }
});

test('networkById falls back instead of returning undefined', () => {
  assert.equal(networkById('testnet').networkId, 'testnet');
  assert.equal(networkById('no-such-network').networkId, DEFAULT_NETWORK_ID);
  assert.equal(networkById('no-such-network', 'testnet').networkId, 'testnet');
  assert.ok(isNetworkId('sandbox'));
  assert.ok(!isNetworkId('no-such-network'));
  // Inherited Object properties must not read as network ids.
  assert.ok(!isNetworkId('toString'));
  assert.ok(!isNetworkId('constructor'));
});
