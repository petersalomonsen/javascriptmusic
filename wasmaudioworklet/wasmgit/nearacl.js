import { loadScript } from '../common/scriptloader.js';
import { modal } from '../common/ui/modal.js';


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
    nodeUrl: 'https://rpc.mainnet.fastnear.com',
    walletUrl: 'https://app.mynearwallet.com',
    helperUrl: 'https://helper.mainnet.near.org',
    contractName: 'wasmgit.near',
    deps: {
        keyStore: null
    }
};

export let authdata = null;

// ============================================================================
// Credential Management (Password Manager)
// ============================================================================

async function getCredentials() {
    const credentials = await navigator.credentials.get({
        mediation: 'required',
        password: true,
    });

    if (!credentials) {
        throw new Error('No credentials selected');
    }

    const credentialData = JSON.parse(atob(credentials.password));
    return credentialData;
}

export async function createCredentials() {
    const result = await modal(`
        <h3>Create NEAR Credentials</h3>
        <p>Store a function access key for your NEAR account.</p>
        <p>
            <label>Account ID:</label><br>
            <input type="text" id="accountIdInput" placeholder="myaccount.near" style="width: 100%; box-sizing: border-box;">
        </p>
        <p>
            <label>Function Access Key:</label><br>
            <input type="text" id="accessKeyInput" placeholder="ed25519:..." style="width: 100%; box-sizing: border-box;">
        </p>
        <p>
            <button onclick="getRootNode().result(null)">Cancel</button>
            <button onclick="getRootNode().result({ accountId: getRootNode().getElementById('accountIdInput').value, accessKey: getRootNode().getElementById('accessKeyInput').value })">Save</button>
        </p>
    `);

    if (!result || !result.accountId || !result.accessKey) return;

    try {
        const credentials = await navigator.credentials.create({
            password: {
                id: result.accountId,
                name: `WASM-git: ${result.accountId}`,
                origin: location.origin,
                password: btoa(JSON.stringify({
                    accountId: result.accountId,
                    accessKey: result.accessKey,
                })),
            },
        });

        await navigator.credentials.store(credentials);
        await modal(`
            <h3>Success</h3>
            <p>✅ Credentials stored for ${result.accountId}</p>
            <button onclick="getRootNode().result(null)">OK</button>
        `);
    } catch (error) {
        console.error('Failed to create credentials:', error);
        await modal(`
            <h3>Error</h3>
            <p>Failed to create credentials: ${error.message}</p>
            <button onclick="getRootNode().result(null)">OK</button>
        `);
    }
}

export async function login() {
    try {
        const credentials = await getCredentials();
        // Store credentials in localStorage for auto-login on reload
        localStorage.setItem('wasmgit_credentials', JSON.stringify(credentials));
        await loadAccountData(credentials);
    } catch (error) {
        console.error('Login failed:', error);
        throw new Error('Failed to retrieve credentials. Please create credentials first.');
    }
}

export async function logout() {
    authdata = null;
    localStorage.removeItem('wasmgit_credentials');
}

async function loadAccountData(credentials) {
    const { accountId, accessKey } = credentials;

    // Set up the key in the keystore
    const keyPair = nearApi.utils.KeyPair.fromString(accessKey);
    await nearconfig.deps.keyStore.setKey(nearconfig.networkId, accountId, keyPair);

    const tokenMessage = btoa(JSON.stringify({ accountId: accountId, iat: new Date().getTime() }));
    const signature = await window.near.connection.signer.signMessage(
        new TextEncoder().encode(tokenMessage),
        accountId,
        nearconfig.networkId
    );

    authdata = {
        accessToken: tokenMessage + '.' + btoa(String.fromCharCode(...signature.signature)),
        useremail: accountId,
        username: accountId
    };
}

export async function initNear() {
    await loadScript('https://cdn.jsdelivr.net/npm/near-api-js@0.44.2/dist/near-api-js.min.js');

    nearconfig.networkId = 'mainnet';
    nearconfig.deps.keyStore = new nearApi.keyStores.InMemoryKeyStore();
    window.near = await nearApi.connect(nearconfig);

    // Try to auto-login from stored credentials
    const storedCredentials = localStorage.getItem('wasmgit_credentials');
    if (storedCredentials) {
        try {
            const credentials = JSON.parse(storedCredentials);
            console.log('logged in as', credentials.accountId);
            await loadAccountData(credentials);
        } catch (error) {
            console.log('failed to load stored credentials:', error);
            localStorage.removeItem('wasmgit_credentials');
        }
    } else {
        console.log('no stored credentials');
    }
}
