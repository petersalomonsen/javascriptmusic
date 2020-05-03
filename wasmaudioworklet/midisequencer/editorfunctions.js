import { getRecordedData } from '../webaudiomodules/wammanager.js';
import { RecordConverter } from './recording.js';
import { recordingStartTimeMillis } from './songcompiler.js';
import { bpm } from './pattern.js';

export async function insertMidiRecording(insertStringIntoEditor) {
    insertStringIntoEditor(new RecordConverter(await getRecordedData(), bpm,
        recordingStartTimeMillis / 1000).trackerPatternData);
}