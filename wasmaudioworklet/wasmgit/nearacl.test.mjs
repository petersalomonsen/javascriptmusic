// The rule that decides who is asked to sign in.
//
// This is the whole point of removing the login button: a visitor who never
// touches a NEAR repo must never see a wallet. Getting `isNearRepo` wrong in
// the permissive direction brings the old always-visible prompt back by
// another route — for a local OPFS repo there is not even a contract to sign
// in to — so every id shape gets a case here.

import { test } from 'node:test';
import assert from 'node:assert';

import { isNearRepo, nearconfig } from './nearacl.js';

test('local workspace repos are never NEAR repos', () => {
    // `workspace` is what a first-time visitor lands in: OPFS only, no chain,
    // no contract. networkIdForAccountId would answer "mainnet" here via its
    // fallback, which is exactly why isNearRepo does its own suffix test.
    assert.equal(isNearRepo('workspace'), false);
    assert.equal(isNearRepo('my-local-project'), false);
});

test('chain-backed repos are recognised on every network', () => {
    assert.equal(isNearRepo('mygitrepo.gitfactory.testnet'), true);
    assert.equal(isNearRepo('repo.gitfactory.near'), true);
    // The e2e harness's local sandbox suffix — a real contract, just not a
    // public network, so it still needs credentials to push.
    assert.equal(isNearRepo('testrepo.gitfactory.sandbox'), true);
});

test('missing or empty ids do not prompt', () => {
    assert.equal(isNearRepo(''), false);
    assert.equal(isNearRepo(null), false);
    assert.equal(isNearRepo(undefined), false);
});

test('a suffix that merely CONTAINS a network name is not a NEAR repo', () => {
    // Guards the difference between endsWith and includes: these are ordinary
    // local names that happen to embed a network word.
    assert.equal(isNearRepo('near'), false);
    assert.equal(isNearRepo('testnet-experiments'), false);
    assert.equal(isNearRepo('sandbox-notes'), false);
});

test('nearconfig defaults to a real network config before any repo is opened', () => {
    // initNear() replaces this per repo; the default only has to be coherent
    // rather than correct, but it must not be undefined — the git worker reads
    // it when deciding which RPC to talk to.
    assert.ok(nearconfig.nodeUrl, 'nodeUrl is set');
    assert.ok(nearconfig.networkId, 'networkId is set');
});
