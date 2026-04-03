import { loadScript } from '../common/scriptloader.js';


export const nearconfig = {
    nodeUrl: 'https://archival-rpc.testnet.fastnear.com',
    walletUrl: 'https://testnet.mynearwallet.com',
    helperUrl: 'https://helper.testnet.near.org',
    contractName: 'wasmgitmusic.testnet',
    deps: {
        keyStore: null
    }
};

export let authdata = null;

// open a connection to the NEAR platform

export async function login() {
    await walletConnection.requestSignIn(
        nearconfig.contractName,
        'WASM-git'
    );
    await loadAccountData();
}

export async function logout() {
    await walletConnection.signOut();
    authdata = null;
}

async function loadAccountData() {
    const currentUser = {
        accountId: (await walletConnection.account()).accountId
    }

    const tokenMessage = btoa(JSON.stringify({ accountId: currentUser.accountId, iat: new Date().getTime() }));
    const signature = await walletConnection.account()
        .connection.signer
        .signMessage(new TextEncoder().encode(tokenMessage), currentUser.accountId, nearconfig.networkId);

    // Extract ed25519 key pair from keystore for service worker signing
    const keyPair = await nearconfig.deps.keyStore.getKey(nearconfig.networkId || 'testnet', currentUser.accountId);
    const publicKeyB58 = keyPair.getPublicKey().toString().replace('ed25519:', '');
    const privateKeyB58 = keyPair.toString().replace('ed25519:', '');

    authdata = {
        accessToken: tokenMessage + '.' + btoa(String.fromCharCode(...signature.signature)),
        useremail: currentUser.accountId,
        username: currentUser.accountId,
        // Keys for near-git service worker
        publicKey: publicKeyB58,
        privateKey: privateKeyB58,
    };
}

export async function initNear() {
    await loadScript('https://cdn.jsdelivr.net/npm/near-api-js@0.44.2/dist/near-api-js.min.js');

    nearconfig.deps.keyStore = new nearApi.keyStores.BrowserLocalStorageKeyStore();
    nearconfig.networkId = 'testnet';
    window.near = await nearApi.connect(nearconfig);
    const walletConnection = new nearApi.WalletConnection(near);
    window.walletConnection = walletConnection;

    // Load in account data
    const accountId = (await walletConnection.account()).accountId;
    if (accountId) {
        console.log('logged in as', accountId);
        await loadAccountData();
    } else {
        console.log('no loggedin user');
    }
}
