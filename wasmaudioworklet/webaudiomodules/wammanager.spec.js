import { getRecordedData, startWAM, wamsynth, exportWAMAudio } from './wammanager.js';
import { waitForAppReady } from '../app.js';
import { compileSong } from '../midisequencer/songcompiler.js';

describe('wammanager', async function() {
    this.timeout(20000);
    let recordedData;
    let sampleRate;

    this.beforeAll(async () => {
        document.documentElement.appendChild(document.createElement('app-javascriptmusic'));
        await waitForAppReady();

        const audioContext = new AudioContext();
        sampleRate = audioContext.sampleRate;

        await startWAM(audioContext);
        wamsynth._waitForMessage = wamsynth.waitForMessage;
        wamsynth.waitForMessage = async function() {            
            const msg = await this._waitForMessage();
            if (msg.recorded) {
                return recordedData;
            }
            return msg;
        }
    });
    this.afterAll(async () => {
        window.stopaudio();
        window.audioworkletnode = undefined;
        document.documentElement.removeChild(document.querySelector('app-javascriptmusic'));
    });
    function transformRecordedDataToSampleRate(recordedData) {
        const recordingDataSampeRate = 44100;
        if (sampleRate !== recordingDataSampeRate) {
            // transform to actual samplerate
            const transformed = {};
            Object.keys(recordedData.recorded).forEach(k => {
                transformed[k * sampleRate / recordingDataSampeRate] = recordedData.recorded[k];
            });
            recordedData.recorded = transformed;
        }
    }
    it('should get recorded data as an array of events', async () => {
        recordedData = {recorded: {"16384":[[144,62,100]],"22784":[[144,62,0]],"32256":[[144,65,100]],"37120":[[144,65,0]],"49920":[[144,69,100]],"53248":[[144,69,0]]}};
        transformRecordedDataToSampleRate(recordedData);
        const eventlist = await getRecordedData();
        assert.equal(eventlist.length, 6);
        const expected = [
                [ 0.37, 144, 62, 100 ],
                [ 0.52, 144, 62, 0 ],
                [ 0.73, 144, 65, 100 ],
                [ 0.84, 144, 65, 0 ],
                [ 1.13, 144, 69, 100 ],
                [ 1.21, 144, 69, 0 ]
            ];
        eventlist.forEach((event, ndx) => assert.equal(
            JSON.stringify(event.map((val, ndx) => ndx > 0 ? val : Math.round(val * 100) / 100)),
            JSON.stringify(expected[ndx])))
    });
    it('should get recorded as an ordered array of events', async () => {
        recordedData = {recorded: {"33024":[[146,60,100]],"33280":[[146,64,100]],"35328":[[146,67,100]],"46336":[[146,60,0]],"46848":[[146,64,0]],"47616":[[146,67,0]],"55040":[[146,62,100]],"56576":[[146,69,100]],"61184":[[146,66,100]],"89344":[[146,66,0]],"89600":[[146,69,0]],"90368":[[146,62,0]],"131072":[[146,60,100]],"138752":[[146,64,100]],"140288":[[146,60,0]],"146944":[[146,67,100]],"148480":[[146,64,0]],"151040":[[146,67,0]],"166144":[[146,72,100]],"169472":[[146,72,0]],"169728":[[146,71,100]],"172800":[[146,71,0]],"193792":[[146,67,100]],"200448":[[146,67,0]],"213504":[[146,64,100]],"218880":[[146,64,0]]}};
        transformRecordedDataToSampleRate(recordedData);
        const eventlist = await getRecordedData();
        for (let n = 1; n < eventlist.length ; n++) {
            assert(eventlist[n -1][0] <= eventlist[n][0], `${eventlist[n -1][0]} > ${eventlist[n][0]}`);
        }
    });
    it('should export song to wav', async () => {
        const eventlist = await compileSong(`setBPM(60);await createTrack(0).steps(4, [c4,d4,e4,f4])`);
        let downloadedLength;
        document._createElementOriginal = document.createElement;
        document.createElement = function(elementType) {
            const createdElement = this._createElementOriginal(elementType);
            if (elementType === 'a') {
                downloadedLength = new Promise(async resolve => {
                    createdElement.click = async () => {                        
                        const sounddata = await (await fetch(createdElement.href)).arrayBuffer();
                        console.log('sounddata length', sounddata.byteLength)
                        resolve(sounddata.byteLength);
                    };
                });
            }
            return createdElement;
        }
        await exportWAMAudio(eventlist, '');
        assert((await downloadedLength) > 44100 * 2 * 2, 'downloaded data length should be more than one second of sound data');
        document.createElement = document._createElementOriginal;
    });

});