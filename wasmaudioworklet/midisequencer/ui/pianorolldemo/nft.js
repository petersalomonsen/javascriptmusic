import { deserializePianorollsData, importToPianoroll, serializePianorollsData } from '../pianorollserialization.js';
import { getMixes, publishMix, buyMix, viewTokenOwner, viewTokenPrice, getMixTokenContent, connectNear } from './nearclient.js';
import { ungzip, gzip } from 'https://unpkg.com/pako@2.0.3/dist/pako.esm.mjs';
import { toggleSpinner } from '../../../common/ui/progress-spinner.js';
import { exportWav, addPianoroll, clearAll, selectPianoroll, updateSequence } from './pianorolldemo.js';
import { COLUMNS_PER_BEAT } from '../pianoroll.js';
import { modalYesNo } from '../../../common/ui/modal.js';

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
    const pianorollsdata = Array.from(document.querySelectorAll('midi-pianoroll')).map((pianoroll) => ({
        channel: pianoroll.channel,
        length: pianoroll.dataset.columns / COLUMNS_PER_BEAT,
        pianorolldata: pianoroll.getPianorollData()
    }));
    const pianorollbytes = serializePianorollsData(pianorollsdata);
    const schedulestate = document.getElementsByTagName('midi-part-scheduler')[0].getState();

    const serialized = new Uint8Array(
            1 + // number of parts
            pianorollbytes.length + // pianoroll data
            + 32 // mixer states
            + 2 // tempo, default beatlength
            + 1 // number of schedules
            + schedulestate.length * 3 // schedule data
            + pianorollsdata.length // parts lengths
        );
    serialized[0] = pianorollsdata.length;
    serialized.set(pianorollbytes, 1);
    const mixerdata = document.querySelector('midi-mixer').getState();
    let ndx = pianorollbytes.length + 1;
    mixerdata.forEach(v => {
        serialized[ndx++] = v.volume;
        serialized[ndx++] = v.pan;
    });
    serialized[ndx++] = parseInt(document.getElementById('tempoinput').value);
    ndx++; // beatlengthinput not in use anymore

    serialized[ndx++] = schedulestate.length;

    schedulestate.forEach(partSchedule => {
        serialized[ndx++] = partSchedule.beat;
        serialized[ndx++] = partSchedule.part;
        serialized[ndx++] = partSchedule.repeat;
    });

    pianorollsdata.forEach(pianorolldata => 
        serialized[ndx++] = pianorolldata.length
    );
    return serialized;
}

export function deserializeMusic(musicdata) {
    clearAll();
    let numParts = 6;
    if (musicdata[0] > 0) {
        // version 2 can have any number of parts
        numParts = musicdata[0];
        musicdata = musicdata.slice(1);
    }
    const {pianorollsdata, deserializedbytecount} = deserializePianorollsData(musicdata, numParts);

    const pianorolls = [];
    for (let n=0;n<numParts;n++) {
        const pianoroll = addPianoroll(pianorollsdata[n].channel);
        importToPianoroll(pianorollsdata[n].pianorolldata, pianoroll);
        pianorolls.push(pianoroll);
    }
    const midimixerelement = document.querySelector('midi-mixer');
    const mixerdatapos = deserializedbytecount;
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
    const legacyBeatLength = musicdata[mixerdatapos + 33];
    tempoinput.dispatchEvent(new Event('change'));
    const partscheduler = document.querySelector('midi-part-scheduler');

    if (musicdata.length > mixerdatapos + 34) {
        let partschedulelength = musicdata[mixerdatapos + 34];
        let partschedulendx = mixerdatapos + 35;

        const partschedulestate = [];
        for (var n = 0; n < partschedulelength; n++) {
            partschedulestate.push({
                beat: musicdata[partschedulendx++],
                part: musicdata[partschedulendx++],
                repeat: musicdata[partschedulendx++]
            });
        }
        partscheduler.setState(partschedulestate);

        let partlengthsndx = partschedulendx;
        pianorolls.forEach((pianoroll) => {
            pianoroll.dataset.columns = musicdata[partlengthsndx++] * COLUMNS_PER_BEAT;
        });
    } else {
        // first version did not have part schedules
        partscheduler.setAttribute('data-parts', pianorolls.map(pr => pr.dataset.title).join(','));
        partscheduler.setState([
            {part: 0, beat: 0, repeat:0 },
            {part: 1, beat: 0, repeat:0 },
            {part: 2, beat: 0, repeat:0 },
            {part: 3, beat: 0, repeat:0 },
            {part: 4, beat: 0, repeat:0 },
            {part: 5, beat: 0, repeat:0 }
        ]);
        pianorolls.forEach((pianoroll, ndx) => {
            pianoroll.channel = ndx;
            pianoroll.dataset.columns = legacyBeatLength * COLUMNS_PER_BEAT;
        });        
    }
    selectPianoroll(0);
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
            hidePublishButton();
            if (currentMixElement) {
                currentMixElement.classList.remove('currentmix');
            }
            currentMixElement = elm;
            elm.classList.add('currentmix');

            // restore published music piece
            deserializeMusic(mixdata);
            updateSequence();
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

    publicmixes.forEach(m => addMixToList(m));

    if (ownedmixes.length === 20) {
        hidePublishButton();
    }
    document.getElementById('postmixbutton').addEventListener('click', async () => {
        if (await modalYesNo('Publish your track?', `
            <ul style="text-align: left; font-size: 14px;">
            <li>Your track will be listed on top of this page, and for sale for 10N</li>
            <li>You will get 4N if sold ( the rest goes to the instrument NFT owner and platform )</li>
            <li>The first owner will be able to export to wav, and can also resell for any price</li>
            <li>You will get 2% on re-sales, the owner will get 95% when selling</li>
            </ul>
        `)) {
            publishMix(gzip(serializeMusic()));
        }
    });
})();

export function hidePublishButton() {
    document.querySelector('#savebutton').style.display = 'none';
    document.querySelector('#postmixbutton').style.display = 'none';
}

export function showPublishButton() {
    document.querySelector('#postmixbutton').style.display = 'block';
    document.querySelector('#savebutton').style.display = 'block';
}
