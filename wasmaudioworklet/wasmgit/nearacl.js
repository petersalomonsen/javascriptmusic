import { loadScript } from '../common/scriptloader.js';


// configure minimal network settings and key storage
const nearconfig = {
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    contractName: 'acl.testnet',
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

async function logout() {
    await walletConnection.requestSignOut();
}

async function loadAccountData() {
    let currentUser = {
        accountId: walletConnection.getAccountId()
    }
    
    const tokenMessage = btoa(JSON.stringify({accountId: currentUser.accountId, iat: new Date().getTime()}));
    const signature = await walletConnection.account()
        .connection.signer
            .signMessage(new TextEncoder().encode(tokenMessage), currentUser.accountId
    );

    authdata = {
        accessToken: tokenMessage + '.' + btoa(String.fromCharCode(...signature.signature)),
        useremail: currentUser.accountId,
        username: currentUser.accountId
    };
}

export async function initNear() {
    await loadScript('https://cdn.jsdelivr.net/gh/nearprotocol/near-api-js/dist/near-api-js.js');
    
    nearconfig.deps.keyStore = new nearApi.keyStores.BrowserLocalStorageKeyStore();
    window.near = await nearApi.connect(nearconfig);
    const walletConnection = new nearApi.WalletConnection(near);
    window.walletConnection = walletConnection;

    console.log(walletConnection);

    // Load in account data
    if (walletConnection.getAccountId()) {
        await loadAccountData();
    } else {
        console.log('no loggedin user');
    }
}
