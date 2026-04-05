export const nearconfig = {
    nodeUrl: 'https://archival-rpc.testnet.fastnear.com',
    networkId: 'testnet',
};

export let authdata = null;

let currentContractId = null;

const KEY_STORAGE_PREFIX = 'near-git-key:';

function getStoredKey(contractId) {
    const stored = localStorage.getItem(KEY_STORAGE_PREFIX + contractId);
    if (stored) {
        try { return JSON.parse(stored); } catch (e) { }
    }
    return null;
}

export async function initNear(contractId) {
    currentContractId = contractId;

    const storedKey = getStoredKey(contractId);
    if (storedKey) {
        authdata = {
            username: storedKey.accountId,
            useremail: storedKey.accountId,
            publicKey: storedKey.publicKey,
            privateKey: storedKey.privateKey,
        };
        console.log('Restored auth for', storedKey.accountId);
    } else {
        console.log('no loggedin user');
    }
}

export function login() {
    const returnUrl = location.href;
    location.href = `/login.html?contractId=${encodeURIComponent(currentContractId)}&returnUrl=${encodeURIComponent(returnUrl)}`;
}

export function logout() {
    if (currentContractId) {
        localStorage.removeItem(KEY_STORAGE_PREFIX + currentContractId);
    }
    authdata = null;
    location.reload();
}
