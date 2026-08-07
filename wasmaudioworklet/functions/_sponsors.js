// Who gets a session pass for free: people who have funded this project.
//
// First iteration of paid AI, deliberately narrow. Rather than settle pricing,
// per-user spend caps and the resale question all at once, the studio AI is
// opened to project sponsors only. They spend from a shared pool of NEAR AI
// credits until it runs out; staking NEAR tops it back up on its own.
//
// Sponsorship is a fact on chain, not a list we maintain. Nothing to
// administer, nobody added quietly, and no indexer in the trust path.
//
// It takes more than one contract, which is the trap here. Direct donations
// live on the donation contract, but money given through a MATCHING ROUND is
// recorded by that round's own pot contract. For this project the split is 7
// direct against 44 across three pots — so reading only direct donations would
// recognise 4 of 39 supporters and look like it worked.
//
//   donate.potlock.near      :: get_donations_for_recipient(recipient_id)
//   v1.potfactory.potlock.near :: get_pots()            -> every round
//   <pot>                    :: get_donations_for_project(project_id)
//
// The pot list is read from the factory rather than configured, so a new
// funding round is picked up without a deploy. There were 10 pots in total when
// this was written, so the whole sweep is ~12 view calls, cached for minutes.

export const DEFAULT_DONATION_CONTRACT = 'donate.potlock.near';
export const DEFAULT_POT_FACTORY = 'v1.potfactory.potlock.near';
export const DEFAULT_RECIPIENT = 'webassemblymusic.near';

// The list changes rarely and a stale answer only delays a pass, so a few
// minutes of caching saves an RPC round trip on every claim.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

export function sponsorConfig(env = {}) {
  return {
    contract: env.SPONSOR_CONTRACT || DEFAULT_DONATION_CONTRACT,
    potFactory: env.SPONSOR_POT_FACTORY || DEFAULT_POT_FACTORY,
    recipient: env.SPONSOR_RECIPIENT || DEFAULT_RECIPIENT,
    // Any donation counts by default. Raise it (yocto, as a decimal string) to
    // require a minimum, summed across all of an account's donations.
    minTotal: BigInt(env.SPONSOR_MIN_YOCTO || '0'),
    enabled: env.SPONSORS_ENABLED !== 'false',
  };
}

/** Drop the cached sponsor list — used by tests, and after a config change. */
export const clearSponsorCache = () => cache.clear();

async function viewCall(rpcUrls, { contract, method, args, timeoutMs = 10000 }) {
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
        body: JSON.stringify({
          jsonrpc: '2.0', id: 'sponsors', method: 'query',
          params: {
            request_type: 'call_function', finality: 'final',
            account_id: contract, method_name: method,
            args_base64: btoa(JSON.stringify(args)),
          },
        }),
        signal: AbortSignal.timeout(remaining),
      });
      const json = await res.json();
      if (json.error) { firstError = firstError || new Error(JSON.stringify(json.error).slice(0, 160)); continue; }
      return JSON.parse(new TextDecoder().decode(new Uint8Array(json.result.result)));
    } catch (e) {
      firstError = firstError || e;
      if (e?.name === 'TimeoutError' || e?.name === 'AbortError') break;
    }
  }
  throw firstError || new Error('could not reach the donation contract');
}

/** Fold one contract's donations into the running per-account totals. */
function tally(totals, donations) {
  for (const d of Array.isArray(donations) ? donations : []) {
    if (!d || !d.donor_id) continue;
    // `ft_id` is "near" for native donations; a token donation is denominated
    // in that token and cannot be summed with NEAR. It still counts as
    // sponsorship, it just adds nothing to the NEAR total.
    const amount = d.ft_id === 'near' || d.ft_id == null ? BigInt(d.total_amount || '0') : 0n;
    totals.set(d.donor_id, (totals.get(d.donor_id) || 0n) + amount);
  }
}

/**
 * Everyone who has funded the project — direct donations and every matching
 * round — as a Map of accountId -> total yocto of native NEAR.
 *
 * The direct-donation call must succeed; a single pot failing only costs us the
 * sponsors in that round, so the sweep continues rather than denying everyone.
 */
export async function fetchSponsors(cfg, rpcUrls, { now = Date.now(), limit = 300 } = {}) {
  const key = `${cfg.contract}:${cfg.potFactory}:${cfg.recipient}`;
  const hit = cache.get(key);
  if (hit && hit.exp > now) return hit.totals;

  const totals = new Map();

  tally(totals, await viewCall(rpcUrls, {
    contract: cfg.contract,
    method: 'get_donations_for_recipient',
    args: { recipient_id: cfg.recipient, from_index: 0, limit },
  }));

  let pots = [];
  try {
    pots = await viewCall(rpcUrls, { contract: cfg.potFactory, method: 'get_pots', args: {} });
  } catch { pots = []; }

  const potIds = (Array.isArray(pots) ? pots : []).map((p) => p?.id || p).filter((x) => typeof x === 'string');
  const perPot = await Promise.all(potIds.map((potId) => viewCall(rpcUrls, {
    contract: potId,
    method: 'get_donations_for_project',
    args: { project_id: cfg.recipient, from_index: 0, limit },
  }).catch(() => null)));
  for (const donations of perPot) tally(totals, donations);

  cache.set(key, { totals, exp: now + CACHE_TTL_MS });
  return totals;
}

/** Has this account funded the project? */
export async function isSponsor(accountId, cfg, rpcUrls, opts = {}) {
  if (!cfg.enabled || !accountId) return false;
  const totals = await fetchSponsors(cfg, rpcUrls, opts);
  if (!totals.has(accountId)) return false;
  return totals.get(accountId) >= cfg.minTotal;
}
