import { getRecordedData } from '../webaudiomodules/wammanager.js';
import { RecordConverter } from './recording.js';
import { recordingStartTimeMillis } from './songcompiler.js';

export async function insertMidiRecording(insertStringIntoEditor) {
    insertStringIntoEditor(new RecordConverter(await getRecordedData(), 80,
        recordingStartTimeMillis / 1000).trackerPatternData);
}