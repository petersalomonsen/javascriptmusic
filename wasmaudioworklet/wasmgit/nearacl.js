import { networkById, networkIdForAccountId, isNetworkId, DEFAULT_NETWORK_ID } from '../near/network.js';

// Resolved in initNear() from the repo contract id, so a `.near` repo talks to
// mainnet and a `.testnet` repo to testnet without any separate switch.
export let nearconfig = networkById(DEFAULT_NETWORK_ID);

export let authdata = null;

let currentContractId = null;
let currentNetworkId = DEFAULT_NETWORK_ID;

// NOT namespaced by network on purpose: the contract id already determines the
// network (see near/network.js), so `repo.x.testnet` and `repo.x.near` are
// distinct keys anyway. Adding the network would only invalidate every key
// already stored.
const KEY_STORAGE_PREFIX = 'near-git-key:';

function getStoredKey(contractId) {
    const stored = localStorage.getItem(KEY_STORAGE_PREFIX + contractId);
    if (stored) {
        try { return JSON.parse(stored); } catch (e) { }
    }
    return null;
}

export function getNetworkId() {
    return currentNetworkId;
}

export async function initNear(contractId, { network } = {}) {
    currentContractId = contractId;
    // An explicit network only matters for ids that don't carry one (implicit
    // 64-hex accounts); otherwise the contract id wins.
    currentNetworkId = networkIdForAccountId(
        contractId,
        isNetworkId(network) ? network : DEFAULT_NETWORK_ID,
    );
    nearconfig = networkById(currentNetworkId);

    const storedKey = getStoredKey(contractId);
    if (storedKey) {
        authdata = {
            username: storedKey.accountId,
            useremail: storedKey.accountId,
            publicKey: storedKey.publicKey,
            privateKey: storedKey.privateKey,
        };
        console.log('Restored auth for', storedKey.accountId, 'on', currentNetworkId);
    } else {
        console.log('no loggedin user');
    }
}

export function login() {
    const returnUrl = location.href;
    location.href = `/login.html?contractId=${encodeURIComponent(currentContractId)}`
        + `&network=${encodeURIComponent(currentNetworkId)}`
        + `&returnUrl=${encodeURIComponent(returnUrl)}`;
}

export function logout() {
    if (currentContractId) {
        localStorage.removeItem(KEY_STORAGE_PREFIX + currentContractId);
    }
    authdata = null;
    location.reload();
}
