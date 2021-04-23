export const SERIALIZE_TIME_RESOLUTION = 8;

/**
 * Import events into pianoroll component
 * @param {*} deserializedevents array of events in the deserialized representation
 * @param {*} pianoroll pianoroll component to import into
 */
export function importToPianoroll(deserializedevents, pianoroll) {
    deserializedevents.forEach(evt => {
        if (evt.noteNumber) {
            pianoroll.addNote(evt.noteNumber, evt.start, evt.duration, evt.velocityValue);
        } else {
            pianoroll.addControlEvent(evt.controllerNumber, evt.start, evt.controllerValue);
        }
    });
}

/**
 * Import data from byte array to a representation that can be applied to multiple piano rolls
 * @param {*} pianorolldatabytes 
 * @returns 
 */
export function deserializePianorollsData(pianorolldatabytes) {
    const pianorollsdata = new Array(16);

    let n = 0;
    while (n<pianorolldatabytes.length) {
        const channel = pianorolldatabytes[n];
        const numnotes = pianorolldatabytes[n + 1];
        const numcontrollers = pianorolldatabytes[n + 2];
        pianorollsdata[channel] = [];
        n += 3;
        const controllersndx = n + (numnotes * 4);
        const nextchannelndx = controllersndx + (numcontrollers * 3);
        while (n < controllersndx) {
            const evtstart = pianorolldatabytes[n++] / SERIALIZE_TIME_RESOLUTION;
            const duration = pianorolldatabytes[n++] / SERIALIZE_TIME_RESOLUTION;
            const noteNumber = pianorolldatabytes[n++];
            const velocityValue = pianorolldatabytes[n++];
            pianorollsdata[channel].push({start: evtstart, duration: duration, noteNumber: noteNumber, velocityValue: velocityValue});
        }
        while (n < nextchannelndx) {
            const evtstart = pianorolldatabytes[n++] / SERIALIZE_TIME_RESOLUTION;
            const controllerNumber = pianorolldatabytes[n++];
            const controllerValue = pianorolldatabytes[n++];
            pianorollsdata[channel].push({start: evtstart, controllerNumber: controllerNumber, controllerValue: controllerValue});
        }
    }
    return pianorollsdata;
}

/**
 * Export data from multiple pianorolls into a byte array
 * @param {*} pianorollsdata 
 * @returns 
 */
export function serializePianorollsData(pianorollsdata) {
    const exportabledata = pianorollsdata.map((pianorolldata, channel) => {
        const notesLength = pianorolldata.filter(v => v.noteNumber).length;
        const controllersLength = pianorolldata.length - notesLength;
        const channelarrarr = [channel,notesLength,controllersLength].concat(
            pianorolldata.map(r => r.noteNumber ? 
                [r.start * SERIALIZE_TIME_RESOLUTION, (r.end - r.start) * SERIALIZE_TIME_RESOLUTION, r.noteNumber, r.velocityValue]:
                [r.start * SERIALIZE_TIME_RESOLUTION, r.controllerNumber, r.controllerValue]
        ));
        return channelarrarr;
    }).flat(2);
    return new Uint8Array(exportabledata);
}