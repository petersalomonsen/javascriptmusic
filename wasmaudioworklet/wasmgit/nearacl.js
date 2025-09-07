import { loadScript } from '../common/scriptloader.js';


// configure minimal network settings and key storage
const nearconfig_testnet = {
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    contractName: 'acl.testnet',
    deps: {
        keyStore: null
    }
};

export const nearconfig = {
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://wallet.near.org',
    helperUrl: 'https://helper.mainnet.near.org',
    contractName: 'wasmgit.near',
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

    authdata = {
        accessToken: tokenMessage + '.' + btoa(String.fromCharCode(...signature.signature)),
        useremail: currentUser.accountId,
        username: currentUser.accountId
    };
}

export async function initNear() {
    await loadScript('https://cdn.jsdelivr.net/npm/near-api-js@1.1.0/dist/near-api-js.min.js');

    nearconfig.deps.keyStore = new nearApi.keyStores.BrowserLocalStorageKeyStore();
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
