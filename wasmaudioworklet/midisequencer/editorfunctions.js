import { getRecordedData as getWAMRecordedData } from '../webaudiomodules/wammanager.js';
import { getRecordedData as getMidiSynthRecordedData } from '../synth1/audioworklet/midisynthaudioworklet.js';
import { RecordConverter } from './recording.js';
import { recordingStartTimeMillis } from './songcompiler.js';
import { bpm } from './pattern.js';

export async function insertMidiRecording(insertStringIntoEditor) {
    let recordedData;
    if (window.audioworkletnode) {
        recordedData = await getMidiSynthRecordedData();
    } else {
        recordedData = await getWAMRecordedData();
    }
    insertStringIntoEditor(new RecordConverter(recordedData, bpm,
        recordingStartTimeMillis / 1000).trackerPatternData);
}