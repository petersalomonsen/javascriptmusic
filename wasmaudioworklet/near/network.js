// One source of truth for "which NEAR network is this, and where is its RPC?".
//
// The network follows the ACCOUNT ID: `repo.gitfactory.testnet` is testnet,
// `repo.gitfactory.near` is mainnet. That is what near-git-sw.js has always
// done, and deriving it beats carrying a separate network switch — a stored
// key, an RPC URL and a contract can then never disagree about which chain
// they are on, which is exactly the bug a parallel switch invites.
//
// Only genuinely ambiguous ids need to be told: 64-hex implicit accounts exist
// on both networks, so those fall back to the caller's choice.
//
// No DOM and no Node built-ins — this runs unchanged in the browser, in a
// module service worker, and in a Cloudflare Pages Function.

// `nodeUrls` are tried in order. They are run by DIFFERENT operators on
// purpose: payment redemption reads the chain, so a single endpoint would be a
// single point of failure for taking money. All entries were verified to answer
// `tx` (with `wait_until`) and `block` by hash, which is all we need.
// `nodeUrl` stays as the first entry so existing callers are unaffected.
export const NETWORKS = {
  mainnet: {
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.fastnear.com',
    nodeUrls: [
      'https://rpc.mainnet.fastnear.com', // FASTNEAR
      'https://rpc.mainnet.near.org',     // NEAR
      'https://near.drpc.org',            // dRPC
      'https://near.lava.build',          // Lava
    ],
    archivalNodeUrl: 'https://archival-rpc.mainnet.fastnear.com',
    walletNetworkId: 'mainnet',
  },
  testnet: {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.fastnear.com',
    nodeUrls: [
      'https://rpc.testnet.fastnear.com',
      'https://rpc.testnet.near.org',
      'https://near-testnet.drpc.org',
    ],
    archivalNodeUrl: 'https://archival-rpc.testnet.fastnear.com',
    walletNetworkId: 'testnet',
  },
  // `.sandbox` is a non-real suffix used by the e2e harness; it routes to the
  // local docker sandbox RPC proxy so tests never touch a live network. There
  // is no wallet for a local sandbox, so wallet flows fall back to testnet.
  sandbox: {
    networkId: 'sandbox',
    nodeUrl: 'http://localhost:3030/near-rpc',
    nodeUrls: ['http://localhost:3030/near-rpc'],
    archivalNodeUrl: 'http://localhost:3030/near-rpc',
    walletNetworkId: 'testnet',
  },
};

export const DEFAULT_NETWORK_ID = 'mainnet';

export const isNetworkId = (id) => Object.prototype.hasOwnProperty.call(NETWORKS, id);

/** Config for a network id; unknown ids fall back rather than throwing. */
export function networkById(networkId, fallback = DEFAULT_NETWORK_ID) {
  return NETWORKS[networkId] || NETWORKS[fallback] || NETWORKS[DEFAULT_NETWORK_ID];
}

/**
 * Which network does this account live on? `fallback` covers implicit
 * (64-hex) accounts and anything else without a network-bearing suffix.
 */
export function networkIdForAccountId(accountId, fallback = DEFAULT_NETWORK_ID) {
  const id = String(accountId || '');
  if (id.endsWith('.sandbox')) return 'sandbox';
  if (id.endsWith('.testnet') || id.endsWith('.test.near')) return 'testnet';
  if (id.endsWith('.near')) return 'mainnet';
  return isNetworkId(fallback) ? fallback : DEFAULT_NETWORK_ID;
}

/** All RPC endpoints for a network, in preference order. */
export function rpcUrlsFor(networkId, fallback = DEFAULT_NETWORK_ID) {
  const net = networkById(networkId, fallback);
  return net.nodeUrls && net.nodeUrls.length ? net.nodeUrls : [net.nodeUrl];
}

/**
 * RPC endpoint for whichever network the account is on. Pass
 * `{ archival: true }` for the git-storage path, which reads packs from blocks
 * old enough that a regular node may have pruned them.
 */
export function rpcUrlForAccountId(accountId, { archival = false, fallback = DEFAULT_NETWORK_ID } = {}) {
  const net = networkById(networkIdForAccountId(accountId, fallback));
  return archival ? net.archivalNodeUrl : net.nodeUrl;
}
