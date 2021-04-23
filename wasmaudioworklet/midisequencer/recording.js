const noteNumberArray = new Array(128).fill(null).map((v, ndx) => 
(['c','cs','d','ds','e','f','fs','g','gs','a','as','b'])[ndx%12]+''+Math.floor(ndx/12)
);

const NOTEARRAY_CONTROL_CHANGE = -1;

export function extractNotes(data) {
    const notes = [];
    const ongoingNoteMap = {};
    const notekey = (msg) => ((msg[0] & 0x0f) << 8) + msg[1];

    data.forEach(r => {
        const currentTime = r[0];
        const msg = r.slice(1);

        if((msg[0] & 0xf0) === 0x90 && msg[2] > 0) {
            // Note on
            ongoingNoteMap[notekey(msg)] = {startTime: currentTime, velocity: msg[2]};            
        } else if(
            ((msg[0] & 0xf0) === 0x80 || // note off message
            ((msg[0] & 0xf0) === 0x90 && msg[2] === 0)) // note on with 0 velocity
            &&
            ongoingNoteMap[notekey(msg)]
            ) {
            // note off
            const key = notekey(msg);
            const startMsg = ongoingNoteMap[key];
            const timestamp = startMsg.startTime;
            const duration = currentTime - timestamp;
            delete ongoingNoteMap[key];
            const notenumber = (key & 0xff);
            const channel = (key & 0xf00) >> 8;
            notes.push([channel, notenumber, startMsg.velocity, timestamp, duration]);
        } else if ((msg[0] & 0xf0) === 0xb0) {
            // control change
            const channel = msg[0] & 0xf;
            const controlNumber = msg[1];
            const controlValue = msg[2];
            notes.push([channel, NOTEARRAY_CONTROL_CHANGE, controlValue, currentTime, controlNumber]);
        }
    });
    return notes;
}

export function convertToBeats(notes, bpm) {
    return notes.map(note => [note[0], 
                note[1], note[2], 
                (note[3] * bpm) / 60 , 
                note[1] < 0 ? note[4] : (note[4] * bpm) / 60  ])
            ;
}

function quantize(notes, stepsperbeat   ) {
    notes.forEach(note => note[3] = Math.round(note[3] * stepsperbeat) / stepsperbeat );
    return notes;
}

function toTrackerPattern(notes) {
    const perchannel = {};
    notes.forEach(note => {
        if (!perchannel[note[0]]) {
            perchannel[note[0]] = [];
        }
        perchannel[note[0]].push(note);
    });
    return Object.keys(perchannel).map(channel =>
        `createTrack(${channel}).play([` +
            perchannel[channel].map(note => {
                switch(note[1]) {
                    case NOTEARRAY_CONTROL_CHANGE:
                        return `[ ${note[3].toFixed(2)}, controlchange(${note[4]}, ${note[2]}) ]`;
                    default:
                        return `[ ${note[3].toFixed(2)}, ${noteNumberArray[note[1]]}(${note[4].toFixed(2)}, ${note[2]}) ]`
                }
            }).join(',\n') + ']);\n'
    ).join('\n');
}

export class RecordConverter {
    constructor(recordeddata, bpm, recordingStartTime = 0) {
        this.recordeddata = recordeddata.map(event => [event[0] - recordingStartTime].concat(event.slice(1)));
        this.notes = extractNotes(this.recordeddata);
        this.notesByBeat = convertToBeats(this.notes, bpm);
        this.trackerPatternData = toTrackerPattern(this.notesByBeat);
    }
    
    quantize(stepsperbeat) {
        this.notesByBeat = quantize(this.notesByBeat, stepsperbeat);
        this.trackerPatternData = toTrackerPattern(this.notesByBeat);
    }
    
}