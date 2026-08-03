// Browser half of the x402 payment loop.
//
// Turns a `402 Payment Required` from our own Pages Function into a wallet
// signature and a stored day pass, then replays the original request so the
// purchase is invisible mid-conversation.
//
// Two ways to pay, chosen from what the server offers:
//
//   `near-tx` (preferred) — the user sends the NEP-141 transfer themselves and
//     then signs a NEP-413 proof naming the transaction. No facilitator, no
//     relayer, and it works in EVERY wallet; they pay ~0.0003 NEAR of gas.
//   `exact` — the standard x402 scheme, where the user only signs a NEP-366
//     delegate and a facilitator relays it. Needs a facilitator API key, and
//     only 4 of 12 wallets can sign delegate actions (`walletCanPay`).

export const HEADER_REQUIRED = 'PAYMENT-REQUIRED';
export const HEADER_SIGNATURE = 'PAYMENT-SIGNATURE';
export const HEADER_RESPONSE = 'PAYMENT-RESPONSE';
export const HEADER_PASS = 'X-Studio-Pass';

// One active pass per browser, under one key. It was briefly keyed by account,
// but only the payment page ever knows which account paid — the app itself has
// no wallet connection (COOP; see pay.html). The JWT records the payer in `sub`
// anyway, so keying by account bought nothing and hid the pass from the app.
const PASS_STORAGE_KEY = 'studio-pass';
// ft_transfer is cheap; this is the delegated inner call's budget, prepaid by
// the relayer. 30 TGas is the conventional amount for a NEP-141 transfer.
const FT_TRANSFER_GAS = '30000000000000';

// ---- header codec (must match functions/_x402.js) --------------------------

export function decodeHeader(value) {
  const bin = atob(String(value));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
}

export function encodeHeader(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''));
}

// ---- pass storage ----------------------------------------------------------
//
// Per-browser, which is the known limitation of a stateless pass: clearing site
// data loses the remainder of the day. Keyed by account so switching wallets
// doesn't silently reuse someone else's pass.

export const passKey = () => PASS_STORAGE_KEY;

export function loadPass() {
  try { return localStorage.getItem(PASS_STORAGE_KEY); } catch { return null; }
}

export function storePass(pass) {
  try { localStorage.setItem(PASS_STORAGE_KEY, pass); } catch { /* private mode */ }
}

export function clearPass() {
  try { localStorage.removeItem(PASS_STORAGE_KEY); } catch { /* private mode */ }
}

/** Claim from a pass without verifying it — for display only. */
function passClaims(pass) {
  try { return JSON.parse(atob(String(pass).split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); }
  catch { return null; }
}

/** Which account paid for this pass. Display only; the server is authoritative. */
export const passAccountId = (pass) => passClaims(pass)?.sub || null;

/** Is there a pass that has not expired? Cheap check before bothering the user. */
export function hasValidPass(now = Date.now()) {
  return passRemainingSeconds(loadPass(), now) > 0;
}

/** Seconds until the pass expires; 0 if absent or expired. Not a security check
 *  — the server re-verifies — just enough to render "expires in 6h". */
export function passRemainingSeconds(pass, now = Date.now()) {
  const claims = pass && passClaims(pass);
  if (!claims || typeof claims.exp !== 'number') return 0;
  return Math.max(0, Math.floor((claims.exp * 1000 - now) / 1000));
}

// ---- wallet capability -----------------------------------------------------

/** Does this wallet declare delegate-action signing? Checked before offering
 *  to charge, so the user is never walked into an impossible flow. */
export function walletCanPay(wallet) {
  return Boolean(wallet?.manifest?.features?.signDelegateActions);
}

// ---- building the payment --------------------------------------------------

/**
 * The one action the `exact` scheme on NEAR permits: a single NEP-141
 * `ft_transfer` to the payee, with exactly 1 yoctoNEAR attached (the NEP-141
 * marker that forces a full-access key). The relayer prepays that yocto.
 */
export function buildDelegateAction(requirements) {
  return {
    receiverId: requirements.asset,
    actions: [{
      type: 'FunctionCall',
      params: {
        methodName: 'ft_transfer',
        args: { receiver_id: requirements.payTo, amount: requirements.amount },
        gas: FT_TRANSFER_GAS,
        deposit: '1',
      },
    }],
  };
}

/**
 * Pick the entry this wallet can actually pay.
 *
 * `near-tx` is preferred whenever offered: the user sends the transfer
 * themselves, so it works in EVERY wallet and needs no facilitator. `exact`
 * only works in wallets that can sign delegate actions (4 of 12 at the time of
 * writing) and needs a facilitator to relay it.
 */
export function selectRequirements(paymentRequired, { wallet, network } = {}) {
  const accepts = (paymentRequired?.accepts || []).filter((a) => String(a.network).startsWith('near:'));
  const onNetwork = network ? accepts.filter((a) => a.network === network) : accepts;
  const candidates = onNetwork.length ? onNetwork : accepts;

  const byTx = candidates.find((a) => a.scheme === 'near-tx');
  if (byTx) return byTx;

  const exact = candidates.find((a) => a.scheme === 'exact');
  if (exact) {
    if (wallet && !walletCanPay(wallet)) {
      throw new Error(
        `${wallet?.manifest?.name || 'This wallet'} cannot sign delegate actions, and the server `
        + 'only offers the `exact` scheme. Try Meteor Wallet or NEAR Mobile.');
    }
    return exact;
  }
  throw new Error('no NEAR payment option offered that this client can pay');
}

// ---- `near-tx`: pay directly, then show the receipt ------------------------

const b64url = (bytes) => btoa(String.fromCharCode(...bytes))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function walletCanSignMessage(wallet) {
  // 11 of 12 wallets declare this; only Trezu did not, as of 2026-08. Check the
  // method too — this decision is made BEFORE the transfer is sent, and getting
  // it wrong means the user pays and then cannot prove it.
  return typeof wallet?.signMessage === 'function'
    && wallet?.manifest?.features?.signMessage !== false;
}

/**
 * Build a NEP-413 proof that names the transaction. This is what stops anyone
 * else redeeming a payment: transaction hashes are public, but only the payer
 * can sign as the account that sent it.
 */
export async function signPaymentProof(wallet, { txHash, accountId, recipient, purpose }) {
  const nonce = crypto.getRandomValues(new Uint8Array(32));
  // `purpose` binds the proof to what is being bought, so one transfer cannot
  // be redeemed against two different products.
  const message = JSON.stringify({ txHash, purpose, issuedAt: Date.now() });
  const signed = await wallet.signMessage({
    message,
    recipient,
    nonce: Array.from(nonce),
    // some wallets want a Buffer/Uint8Array, others an array — pass through
    // whatever the connector normalises, and read the result back below
  });
  return b64url(new TextEncoder().encode(JSON.stringify({
    accountId: signed.accountId || accountId,
    publicKey: signed.publicKey,
    signature: signed.signature,
    message,
    nonce: btoa(String.fromCharCode(...nonce)),
    recipient,
  })));
}

export async function payWithTransaction(wallet, requirements, { accountId, proof = 'auto' } = {}) {
  // `commitment` is the default, and it is the better trade for a payment made
  // inside the app:
  //   * ONE wallet prompt, not two — a signed proof has to name the
  //     transaction, so it cannot be signed until after the transfer lands.
  //   * the memo carries the product and price as text, which is often the
  //     only place the payer sees what they are paying: wallets show that
  //     `ft_transfer` is being called without decoding its arguments.
  //   * needs no signMessage support, so it works in every wallet.
  // `signature` remains for payments that did NOT originate here, where no
  // memo could have been planned in advance.
  const useSignature = proof === 'signature';

  let secret = null;
  let memo;
  if (useSignature) {
    memo = undefined;
  } else {
    const secretBytes = crypto.getRandomValues(new Uint8Array(32));
    secret = b64url(secretBytes);
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', secretBytes));
    const template = requirements.extra?.memoTemplate;
    if (!template) throw new Error('server did not advertise a memo template');
    memo = template.replace('{commitment}', b64url(digest));
  }

  const outcome = await wallet.signAndSendTransaction({
    network: String(requirements.network).split(':')[1] || 'mainnet',
    signerId: accountId,
    receiverId: requirements.asset,
    actions: [{
      type: 'FunctionCall',
      params: {
        methodName: 'ft_transfer',
        args: memo === undefined
          ? { receiver_id: requirements.payTo, amount: requirements.amount }
          : { receiver_id: requirements.payTo, amount: requirements.amount, memo },
        gas: FT_TRANSFER_GAS,
        // NEP-141 requires exactly 1 yoctoNEAR; the user's own full-access key
        // provides it, which is why no relayer is needed.
        deposit: '1',
      },
    }],
  });

  const txHash = outcome?.transaction?.hash || outcome?.transaction_outcome?.id;
  if (!txHash) throw new Error('wallet returned no transaction hash');

  // The proof is signed AFTER the transfer, because it names the tx hash. If
  // the user dismisses this prompt they have ALREADY PAID, so the error has to
  // carry the hash — the payment is still claimable, it just needs the
  // signature. Losing that hash here would lose the money.
  let auth = null;
  if (useSignature) {
    try {
      auth = await signPaymentProof(wallet, {
        txHash, accountId, purpose: requirements.extra?.purpose,
        recipient: requirements.extra?.authRecipient || requirements.payTo,
      });
    } catch (e) {
      const err = new Error(
        `Payment sent (${txHash}) but not yet claimed: ${e.message}. `
        + 'Sign the proof to claim it — the payment is not lost.');
      err.txHash = txHash;
      err.unclaimed = true;
      throw err;
    }
  }

  return {
    x402Version: 2,
    accepted: requirements,
    payload: { txHash, accountId, ...(auth ? { auth } : { secret }) },
  };
}

/**
 * Ask the wallet to sign, and wrap the result as an x402 v2 PaymentPayload.
 * `signDelegateActions` returns `{ signedDelegateActions: string[] }` — base64
 * Borsh SignedDelegate, which is exactly what the facilitator wants.
 */
/** Dispatch to whichever settlement path the server offered. */
export async function makePayment(wallet, requirements, opts = {}) {
  return requirements.scheme === 'near-tx'
    ? payWithTransaction(wallet, requirements, opts)
    : signPayment(wallet, requirements, opts);
}

export async function signPayment(wallet, requirements, { accountId, resource } = {}) {
  if (!walletCanPay(wallet)) {
    const name = wallet?.manifest?.name || 'this wallet';
    throw new Error(
      `${name} cannot sign delegate actions, which this payment needs. `
      + 'Try Meteor Wallet or NEAR Mobile.');
  }

  const networkId = String(requirements.network).split(':')[1] || 'mainnet';
  const { signedDelegateActions } = await wallet.signDelegateActions({
    network: networkId,
    signerId: accountId,
    delegateActions: [buildDelegateAction(requirements)],
  });

  const signedDelegateAction = signedDelegateActions?.[0];
  if (!signedDelegateAction) throw new Error('wallet returned no signed delegate action');

  return {
    x402Version: 2,
    resource,
    accepted: requirements,
    payload: { signedDelegateAction },
  };
}

// ---- the loop --------------------------------------------------------------

/**
 * A `fetch` that pays when asked to.
 *
 * Wraps any fetch so a 402 triggers: read the terms → sign → retry once with
 * PAYMENT-SIGNATURE → store the pass that comes back. Subsequent calls attach
 * the stored pass and never touch the wallet again until it expires.
 *
 * `confirm` is where the UI asks "pay $0.01?" — return false and the original
 * 402 is passed through untouched, so the caller can render its own paywall.
 */
export function createPaymentFetch({
  wallet,
  accountId,
  fetchFn = globalThis.fetch.bind(globalThis),
  confirm = async () => true,
  onStatus = () => {},
  onScheme = () => {},
} = {}) {
  return async function paymentFetch(url, options = {}) {
    const withPass = (init) => {
      const pass = loadPass();
      if (!pass) return init;
      const headers = new Headers(init.headers || {});
      headers.set(HEADER_PASS, pass);
      return { ...init, headers };
    };

    // The body may be a one-shot stream; keep the original init so the retry
    // sends the identical request rather than an empty one.
    let response = await fetchFn(url, withPass(options));
    if (response.status !== 402) return response;

    const header = response.headers.get(HEADER_REQUIRED);
    if (!header) return response; // a 402 we don't know how to satisfy

    // An expired/rejected pass is dead weight — drop it before re-paying.
    clearPass();

    let required;
    try { required = decodeHeader(header); } catch { return response; }

    const requirements = selectRequirements(required, { wallet });
    onScheme(requirements.scheme);
    if (!(await confirm(requirements, required))) return response;

    onStatus(requirements.scheme === 'near-tx' ? 'paying' : 'signing');
    const payload = await makePayment(wallet, requirements, { accountId, resource: required.resource });

    onStatus('redeeming');
    const headers = new Headers(options.headers || {});
    headers.set(HEADER_SIGNATURE, encodeHeader(payload));
    response = await fetchFn(url, { ...options, headers });

    const minted = response.headers.get(HEADER_PASS);
    if (minted) {
      storePass(minted);
      onStatus('paid');
    } else if (response.status === 402) {
      // Settlement was refused — surface the facilitator's reason, which is the
      // single most useful diagnostic in this whole flow.
      let reason = 'payment was not accepted';
      try { reason = decodeHeader(response.headers.get(HEADER_REQUIRED)).error || reason; } catch { /* keep default */ }
      onStatus('failed', reason);
    }
    return response;
  };
}
