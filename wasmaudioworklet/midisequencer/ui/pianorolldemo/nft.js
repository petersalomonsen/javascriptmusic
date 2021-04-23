import { deserializePianorollsData, importToPianoroll, serializePianorollsData } from '../pianorollserialization.js';
import { getMixes, publishMix, buyMix, viewTokenOwner, viewTokenPrice, getMixTokenContent, connectNear } from './nearclient.js';
import { ungzip, gzip } from 'https://unpkg.com/pako@2.0.3/dist/pako.esm.mjs';
import { toggleSpinner } from '../../../common/ui/progress-spinner.js';
import { exportWav } from './pianorolldemo.js';

const existingPublishedMixes = [];
const currentMixOwnerDiv = document.querySelector('#currentMixOwner');

export function base64ToByteArray(base64encoded) {
    return ((str) => new Uint8Array(str.length).map((v, n) => str.charCodeAt(n)))(atob(base64encoded));
}

export function decodeAndDecrunch(base64encoded) {
    try {
        const compressed = base64ToByteArray(base64encoded);
        return ungzip(compressed);
    } catch (e) {
        return null;
    }
}

export function serializeMusic() {
    const pianorollsdata = Array.from(document.querySelectorAll('midi-pianoroll')).map((pianoroll) => pianoroll.getPianorollData());
    const pianorollbytes = serializePianorollsData(pianorollsdata);
    const serialized = new Uint8Array(pianorollbytes.length + 32 + 2);
    serialized.set(pianorollbytes, 0);
    const mixerdata = document.querySelector('midi-mixer').getState();
    let ndx = pianorollbytes.length;
    mixerdata.forEach(v => {
        serialized[ndx++] = v.volume;
        serialized[ndx++] = v.pan;
    });
    serialized[ndx++] = parseInt(document.getElementById('tempoinput').value);
    serialized[ndx++] = parseInt(document.getElementById('beatlengthinput').value);
    return serialized;
}

export function deserializeMusic(musicdata) {
    const pianorolls = Array.from(document.querySelectorAll('midi-pianoroll'));
    const deserializedpianorolldata = deserializePianorollsData(musicdata);
    pianorolls.forEach((pianoroll, ndx) => {
        pianoroll.clearAll();
        if (deserializedpianorolldata[ndx]) {
            importToPianoroll(deserializedpianorolldata[ndx], pianoroll);
        }
    });
    const midimixerelement = document.querySelector('midi-mixer');
    const mixerdatapos = musicdata.length - 34;
    musicdata.slice(mixerdatapos, mixerdatapos + 32)
        .forEach((v, ndx) => {
            const channel = Math.floor(ndx / 2);
            if (ndx % 2 === 0) {
                midimixerelement.setVolume(channel, v);
            } else {
                midimixerelement.setPan(channel, v);
            }
        });
    const tempoinput = document.getElementById('tempoinput');
    tempoinput.value = musicdata[mixerdatapos + 32];
    tempoinput.dispatchEvent(new Event('change'));
    const beatlengthinput = document.getElementById('beatlengthinput');
    beatlengthinput.value = musicdata[mixerdatapos + 32 + 1];
    beatlengthinput.dispatchEvent(new Event('change'));
}

(async () => {
    toggleSpinner(true);
    await connectNear();
    const allmixes = (await getMixes()).map(mix => mix.split(';'));
    toggleSpinner(false);

    const publicmixes = allmixes.filter(m => m[1].indexOf('nft:') === -1)
        .sort((a, b) => parseInt(b[1]) - parseInt(a[1]))
        .map(parts => ({
            content: decodeAndDecrunch(parts[2]),
            timestamp: parts[1],
            author: parts[0],
            identitfier: parts.join(';')
        }));
    const ownedmixes = allmixes.filter(m => m[1].indexOf('nft:') === 0);

    let currentMixElement;

    const latest20element = document.getElementById('latest20mixes');
    const patternElements = document.querySelectorAll('.patternelement');

    const addMixToList = (mix) => {
        existingPublishedMixes.push(mix);
        const listitemcontainer = document.createElement('div');
        listitemcontainer.style.display = 'grid';
        listitemcontainer.style.gridTemplateColumns = 'auto auto';
        const elm = document.createElement('div');
        elm.classList.add('mixlistitem');
        const mixdata = mix.content;
        elm.onclick = async () => {
            if (currentMixElement) {
                currentMixElement.classList.remove('currentmix');
            }
            currentMixElement = elm;
            elm.classList.add('currentmix');

            // restore published music piece
            deserializeMusic(mixdata);
            // buy / sell logic

            if (mix.owner) {
                let ownerHtml = ''

                if (mix.owner === walletConnection.account().accountId) {
                    ownerHtml += `owner: you`;
                    try {
                        const yoctoprice = await viewTokenPrice(mix.token_id);
                        const nftprice = nearApi.utils.format.formatNearAmount(yoctoprice);
                        ownerHtml += `. on sale for ${nftprice}N
                            <button onclick="sellNFT(prompt('Sell for what price?','${nftprice}'), '${mix.token_id}')">Change</button>
                        `;
                    } catch (e) {
                        ownerHtml += `<button onclick="sellNFT(prompt('Sell for what price?','10'), '${mix.token_id}')">Sell</button>`;
                    }
                    ownerHtml += `<button id="exportwavbutton" title="download">&#11015;</button>`;
                } else {
                    ownerHtml += `owner: ${mix.owner} `
                    try {
                        const yoctoprice = await viewTokenPrice(mix.token_id);
                        const nftprice = nearApi.utils.format.formatNearAmount(yoctoprice);
                        ownerHtml += `<button onclick="buyNFT('${mix.token_id}','${yoctoprice}')">Buy ${nftprice}N</button>`;
                    } catch (e) {
                        console.error(e);
                    }
                }
                currentMixOwnerDiv.innerHTML = ownerHtml;
                currentMixOwnerDiv.style.display = 'block';
                const exportwavbutton = document.getElementById('exportwavbutton');
                if (exportwavbutton) {
                    exportwavbutton.addEventListener('click', () => exportWav());
                }
            } else {
                currentMixOwnerDiv.innerHTML = `No owner. <button>Buy 10N</button>`;
                currentMixOwnerDiv.querySelector('button').onclick = () => buyMix(mix.identitfier);
                currentMixOwnerDiv.style.display = 'block';
            }
        };

        elm.innerHTML = `author: ${mix.author}<br />
                <span class="mixlistdate">${new Date(parseInt(mix.timestamp) / 1000000).toLocaleString()}</span><br />
                ${mix.owner ? `owner: ${mix.owner}` : 'no owner'}`;
        listitemcontainer.appendChild(elm);
        latest20element.appendChild(listitemcontainer);
    }


    publicmixes.forEach(m => addMixToList(m));

    if (ownedmixes.length > 0) {
        const ownedMixesContent = (await Promise.all(ownedmixes.map(m => ({
            token_id: m[1].substr('nft:'.length),
            author: m[0]
        })).map(async m => Object.assign(m, {
            owner: await viewTokenOwner(m.token_id),
            content: await getMixTokenContent(m.token_id)
        })))).map(m => Object.assign(m, {
            content: decodeAndDecrunch(m.content.split(';')[3]),
            timestamp: m.content.split(';')[2],
        }));
        ownedMixesContent.forEach(m => addMixToList(m));
    }

    if (ownedmixes.length === 20) {
        document.querySelector('#postmixbutton').style.display = 'none';
    }
    document.getElementById('postmixbutton').addEventListener('click', () => {
        publishMix(gzip(serializeMusic()));
    });
})();
