import { toggleSpinner } from '../../../common/ui/progress-spinner.js';

const nearconfig = {
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://wallet.mainnet.near.org',
    helperUrl: 'https://helper.mainnet.near.org',
    networkId: 'mainnet',
    contractName: 'psalomo.near',
    deps: {
        keyStore: null
    }
};

const token_id = '7';

/*const nearconfig = {
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    networkId: 'testnet',
    contractName: 'sellnft.testnet',
    deps: {
        keyStore: null
    }
};

const token_id = '34';*/

export let currentTokenPrice = null;
export let listeningPrice = null;
export let tokenOwner = null;

// open a connection to the NEAR platform

export async function login() {
    await walletConnection.requestSignIn(
        nearconfig.contractName,
        'wasm-music'
    );
    await loadAccountData();
}

window.login = login;

async function logout() {
    await walletConnection.signOut();
    location.reload();
}

window.logout = logout;

function convertNearToYocto(near) {
    const milliNear = near * 1000;
    return new BN(10, 10).pow(new BN(21, 10)).mul(new BN(milliNear, 10)).toString();
}

export async function getMixTokenContent(id) {
    const result = await walletConnection.account()
            .viewFunction(nearconfig.contractName, 'view_remix_content', { token_id: id });
    return result;
}

export async function getTokenContent() {
    try {
        const result = await walletConnection.account()
            .viewFunction(nearconfig.contractName, 'view_token_content_base64', { token_id: token_id });
        return result;
    } catch(e) {
        if (e.message.indexOf('requires payment') > -1) {
            await walletConnection.account().functionCall(nearconfig.contractName, 'request_listening', { token_id: token_id },undefined, listeningPrice);
        } else {
            alert(e.message);
            toggleSpinner(false);
            throw(e);
        }
    }
}
export async function viewTokenPrice(id = token_id) {
    currentTokenPrice = await walletConnection.account().viewFunction(nearconfig.contractName, 'view_price', { token_id: id });
    return currentTokenPrice;
}

export async function viewListeningPrice() {
    listeningPrice = await walletConnection.account().viewFunction(nearconfig.contractName, 'get_listening_price', { token_id: token_id });
    return listeningPrice;
}

export async function viewTokenOwner(id = token_id) {
    tokenOwner = await walletConnection.account().viewFunction(nearconfig.contractName, 'get_token_owner', { token_id: id });
    return tokenOwner;
}

export async function buy(id = token_id, deposit = currentTokenPrice) {
    toggleSpinner(true);
    try {
        if (!walletConnection.getAccountId()) {
            login();
        }
        const result = await walletConnection.account().functionCall(nearconfig.contractName, 'buy_token', { token_id: id }, '100000000000000', deposit);
        console.log('succeeded buying', result);
    } catch (e) {
        alert(e.message);
    }
    toggleSpinner(false);
}
window.buyNFT = buy;

export async function sell(price, id = token_id) {
    toggleSpinner(true);
    console.log('selling for', convertNearToYocto(price));
    if (price) {
        const result = await walletConnection.account().functionCall(nearconfig.contractName, 'sell_token', { token_id: id, price: convertNearToYocto(price) });
        console.log('token is now for sale', result);
        alert('token is now for sale');
    } else {
        await walletConnection.account().functionCall(nearconfig.contractName, 'remove_token_from_sale', { token_id: id });
        alert('token is no longer for sale');
    }
    toggleSpinner(false);
    location.reload();
}
window.sellNFT = sell;

export async function byteArrayToBase64(data) {
    return await new Promise(r => {
        const fr = new FileReader();
        fr.onload = () => r(fr.result.split('base64,')[1]);
        fr.readAsDataURL(new Blob([data]));
    });
}

export async function publishMix(mix) {
    toggleSpinner(true);
    const base64encoded = await byteArrayToBase64(mix);
    await walletConnection.account().functionCall(nearconfig.contractName, 'publish_token_mix_base64',
        { token_id: token_id, mixbase64: base64encoded }, 300000000000000);
    toggleSpinner(false);
    location.reload();
}

export async function buyMix(mix) {
    if (!walletConnection.getAccountId()) {
        alert('Please log in first');
        return;
    }
    toggleSpinner(true);
    await walletConnection.account().functionCall(nearconfig.contractName, 'buy_mix', { original_token_id: token_id, mix: mix }, 300000000000000, nearApi.utils.format.parseNearAmount('10'));
    toggleSpinner(false);
}

export async function getMixes() {
    return await walletConnection.account().viewFunction(nearconfig.contractName, 'get_token_mixes', { token_id: token_id });
}

export async function initNear() {
    nearconfig.deps.keyStore = new nearApi.keyStores.BrowserLocalStorageKeyStore();
    window.near = await nearApi.connect(nearconfig);
    const walletConnection = new nearApi.WalletConnection(near);
    window.walletConnection = walletConnection;

    // Load in account data
    if (!walletConnection.getAccountId()) {
        console.log('no loggedin user');
    } else {
        document.getElementById('loggedinuserspan').innerHTML = walletConnection.getAccountId();
        document.getElementById('logoutbutton').style.display = 'block';
    }
}

export async function connectNear() {
    await initNear();
    if (!walletConnection.getAccountId()) {
        document.getElementById('logginbutton').style.display = 'block';        
    } else {
        document.querySelectorAll('.requireslogin').forEach(elm => elm.style.display = 'block');
    }
    if (false) {
        // No sale yet of the instrument NFT
        const tokenOwner = await viewTokenOwner();
        document.getElementById('ownerspan').innerHTML = tokenOwner;

        try {
            document.getElementById('pricespan').innerHTML = nearApi.utils.format.formatNearAmount(await viewTokenPrice());
            document.getElementById('buyarea').style.display = 'block';
        } catch (e) {
            //console.log(e);
        }

        if (tokenOwner === walletConnection.getAccountId()) {
            document.getElementById('sellarea').style.display = 'block';
        }
    }
};
