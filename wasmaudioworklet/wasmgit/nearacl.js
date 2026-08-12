// NEAR credentials for git push.
//
// Only PUSH needs a key. Clone, pull, the song list and every local operation
// are view calls or pure OPFS, and the key this creates is scoped to `push` on
// one repo contract. So there is no sign-in step and no sign-in button: the
// push path calls `ensureAuth()` at the moment the permission is actually
// required, exactly as the studio pass is offered when a turn needs one.
//
// The network follows the CONTRACT ID (see ../near/network.js) rather than a
// user-facing switch, so a stored key, an RPC URL and a contract can never
// disagree about which chain they are on.

import { networkById, networkIdForAccountId } from '../near/network.js';

const KEY_STORAGE_PREFIX = 'near-git-key:';

export let authdata = null;

// Kept as a live export (updated by initNear) so callers always read the
// network of the repo currently open, not a hardcoded one.
export let nearconfig = networkById('testnet');

let currentContractId = null;

/**
 * Is this repo backed by a NEAR contract at all?
 *
 * `workspace` — the local OPFS repo a first-time visitor lands in — is not, and
 * neither is any other suffix-less name. Those must NEVER be asked to sign in:
 * there is no contract to sign in to. This is deliberately an explicit suffix
 * test rather than `networkIdForAccountId`, which falls back to mainnet for
 * unknown ids and would answer "mainnet" for `workspace`.
 */
export function isNearRepo(contractId = currentContractId) {
    const id = String(contractId || '');
    return id.endsWith('.near') || id.endsWith('.testnet') || id.endsWith('.sandbox');
}

function getStoredKey(contractId) {
    const stored = localStorage.getItem(KEY_STORAGE_PREFIX + contractId);
    if (stored) {
        try { return JSON.parse(stored); } catch (e) { }
    }
    return null;
}

function adoptStoredKey(contractId) {
    const storedKey = getStoredKey(contractId);
    if (!storedKey) return false;
    authdata = {
        username: storedKey.accountId,
        useremail: storedKey.accountId,
        publicKey: storedKey.publicKey,
        privateKey: storedKey.privateKey,
    };
    return true;
}

export async function initNear(contractId) {
    currentContractId = contractId;
    nearconfig = networkById(networkIdForAccountId(contractId, 'testnet'));

    if (adoptStoredKey(contractId)) {
        console.log('Restored auth for', authdata.username);
    } else {
        console.log('no loggedin user');
    }
}

/**
 * Open the wallet in a POPUP and resolve once a key for this repo shows up.
 *
 * A popup rather than the old full-page redirect: the redirect worked (the
 * commit is already in OPFS before the push, so nothing was lost) but it
 * reloaded the app mid-action and left the user to work out what happened.
 * /login.html is COOP-exempt precisely so the wallet's `window.opener`
 * survives — the same reason /pay.html exists.
 *
 * @returns {Promise<boolean>} true once credentials are stored.
 */
export function login() {
    return new Promise((resolve) => {
        if (!currentContractId || !isNearRepo(currentContractId)) {
            resolve(false);
            return;
        }
        const storageKey = KEY_STORAGE_PREFIX + currentContractId;
        let settled = false;
        let poll = null;

        const finish = (ok) => {
            if (settled) return;
            settled = true;
            window.removeEventListener('storage', onStorage);
            if (poll) clearInterval(poll);
            if (ok) adoptStoredKey(currentContractId);
            resolve(ok);
        };
        const check = () => { if (getStoredKey(currentContractId)) finish(true); };
        // `storage` only fires in OTHER documents, and COOP may have severed
        // the opener link, so polling is the mechanism and the event is a hint.
        const onStorage = (e) => { if (e.key === storageKey) check(); };
        window.addEventListener('storage', onStorage);

        const walletNetwork = networkById(
            networkIdForAccountId(currentContractId, 'testnet')).walletNetworkId;
        const url = `/login.html?contractId=${encodeURIComponent(currentContractId)}`
            + `&network=${encodeURIComponent(walletNetwork)}&popup=1`;
        const win = window.open(url, 'near-git-login', 'width=460,height=680');
        if (!win) {
            // Popup blocked, which is likely rather than exotic here: the commit
            // MESSAGE modal is awaited before this runs, so the click that
            // started the sync may no longer count as user activation. Fall back
            // to the old full-page redirect — it is disruptive but it works, and
            // the commit is already in OPFS so nothing is lost. The timeout is
            // only a safety net for a navigation that never happens; normally
            // this document is gone before it fires.
            location.href = `${url}&returnUrl=${encodeURIComponent(location.href)}`;
            setTimeout(() => finish(false), 5000);
            return;
        }
        poll = setInterval(() => {
            check();
            if (win.closed) finish(Boolean(getStoredKey(currentContractId)));
        }, 700);
    });
}

/**
 * Credentials for the current repo, asking for them only if this is a NEAR
 * repo that does not have them yet. Returns null when the repo needs no NEAR
 * auth at all (local workspace, or a `remote=` host using a PAT instead).
 */
export async function ensureAuth() {
    if (!isNearRepo(currentContractId)) return null;
    if (authdata) return authdata;
    return (await login()) ? authdata : null;
}

export function logout() {
    if (currentContractId) {
        localStorage.removeItem(KEY_STORAGE_PREFIX + currentContractId);
    }
    authdata = null;
    location.reload();
}
