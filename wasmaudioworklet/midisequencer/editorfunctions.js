import { getRecordedData as getWAMRecordedData } from '../webaudiomodules/wammanager.js';
import { getRecordedData as getMidiSynthRecordedData } from '../synth1/audioworklet/midisynthaudioworklet.js';
import { RecordConverter } from './recording.js';
import { recordingStartTimeMillis } from './songcompiler.js';
import { bpm } from './pattern.js';

/**
 * Insert the captured take into the song editor as source.
 *
 * `quantizeStepsPerBeat` snaps note starts to that grid on the way in, so a take
 * arrives already on the beat instead of needing a fix-up pass afterwards. Play
 * latency alone makes a grid-perfect capture impossible — a note reaches the
 * sequencer some milliseconds after it is struck — so this is the only way a
 * FIRST take reads as quantized. Omit it to keep the raw timing, which is what
 * the toolbar button does and stays the default. Note lengths and velocities
 * are never touched, so the take still breathes.
 */
export async function insertMidiRecording(insertStringIntoEditor, quantizeStepsPerBeat) {
    let recordedData;
    if (window.audioworkletnode) {
        recordedData = await getMidiSynthRecordedData();
    } else {
        recordedData = await getWAMRecordedData();
    }
    const converter = new RecordConverter(recordedData, bpm, recordingStartTimeMillis / 1000);
    if (quantizeStepsPerBeat > 0) converter.quantize(quantizeStepsPerBeat);
    insertStringIntoEditor(converter.trackerPatternData);
}