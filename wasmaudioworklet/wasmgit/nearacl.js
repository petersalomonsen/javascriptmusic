export const nearconfig = {
    nodeUrl: 'https://archival-rpc.testnet.fastnear.com',
    networkId: 'testnet',
};

export let authdata = null;

let connector, wallet, currentContractId;

const KEY_STORAGE_PREFIX = 'near-git-key:';

function getStoredKey(contractId) {
    const stored = localStorage.getItem(KEY_STORAGE_PREFIX + contractId);
    if (stored) {
        try { return JSON.parse(stored); } catch (e) { }
    }
    return null;
}

function storeKey(contractId, keyData) {
    localStorage.setItem(KEY_STORAGE_PREFIX + contractId, JSON.stringify(keyData));
}

function clearKey(contractId) {
    localStorage.removeItem(KEY_STORAGE_PREFIX + contractId);
}

export async function initNear(contractId) {
    currentContractId = contractId;

    const { NearConnector } = await import('https://cdn.jsdelivr.net/npm/@hot-labs/near-connect@0.11.1/+esm');
    connector = new NearConnector({ network: nearconfig.networkId });

    // Check if we have a stored key from a previous session
    const storedKey = getStoredKey(contractId);
    if (storedKey) {
        authdata = {
            username: storedKey.accountId,
            useremail: storedKey.accountId,
            publicKey: storedKey.publicKey,
            privateKey: storedKey.privateKey,
        };
        console.log('Restored auth for', storedKey.accountId);
    }

    connector.on('wallet:signIn', async (event) => {
        const accounts = event.accounts || [];
        if (accounts.length > 0) {
            wallet = event.wallet || await connector.wallet();
            const accountId = accounts[0].accountId;
            console.log('Wallet connected:', accountId);
            await createFunctionCallKey(accountId);
        }
    });

    connector.on('wallet:signOut', () => {
        authdata = null;
        wallet = null;
    });
}

async function createFunctionCallKey(accountId) {
    // Check if we already have a working key for this contract
    const existing = getStoredKey(currentContractId);
    if (existing && existing.accountId === accountId) {
        authdata = {
            username: accountId,
            useremail: accountId,
            publicKey: existing.publicKey,
            privateKey: existing.privateKey,
        };
        return;
    }

    // Generate a new ed25519 keypair using the service worker's WASM
    // We use the Web Crypto API to generate the key
    const keyPair = await generateEd25519KeyPair();

    // Use the wallet to add this key as a function call access key
    try {
        await wallet.signAndSendTransaction({
            receiverId: accountId,
            actions: [{
                type: 'AddKey',
                params: {
                    publicKey: 'ed25519:' + keyPair.publicKey,
                    accessKey: {
                        permission: {
                            receiverId: currentContractId,
                            methodNames: ['push_objects', 'register_push'],
                            allowance: '250000000000000000000000', // 0.25 NEAR
                        },
                    },
                },
            }],
        });

        // Store the keypair locally
        const keyData = {
            accountId,
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey,
        };
        storeKey(currentContractId, keyData);

        authdata = {
            username: accountId,
            useremail: accountId,
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey,
        };
        console.log('Function call access key created for', currentContractId);
    } catch (err) {
        console.error('Failed to add function call key:', err);
    }
}

async function generateEd25519KeyPair() {
    // Use near-api-js KeyPairEd25519 if available, otherwise use tweetnacl via CDN
    try {
        // Try using tweetnacl for ed25519 key generation
        const nacl = await import('https://cdn.jsdelivr.net/npm/tweetnacl@1.0.3/+esm');
        const pair = nacl.sign.keyPair();
        // near-api-js format: public key is 32 bytes, private key is 64 bytes (seed + public)
        const publicKey = base58Encode(pair.publicKey);
        const privateKey = base58Encode(pair.secretKey);
        return { publicKey, privateKey };
    } catch (e) {
        console.error('Failed to generate key pair:', e);
        throw e;
    }
}

function base58Encode(bytes) {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    let num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
    while (num > 0n) {
        result = ALPHABET[Number(num % 58n)] + result;
        num = num / 58n;
    }
    // Leading zeros
    for (const byte of bytes) {
        if (byte === 0) result = '1' + result;
        else break;
    }
    return result;
}

export async function login() {
    if (!connector) throw new Error('Call initNear first');
    return new Promise((resolve, reject) => {
        const onSignIn = () => {
            // Wait a tick for createFunctionCallKey to complete
            const check = () => {
                if (authdata) { resolve(authdata); }
                else { setTimeout(check, 100); }
            };
            check();
        };
        connector.on('wallet:signIn', onSignIn);
        connector.connect().catch(reject);
    });
}

export async function logout() {
    if (currentContractId) clearKey(currentContractId);
    authdata = null;
    if (connector) {
        try { await connector.disconnect(); } catch (e) { }
    }
}
