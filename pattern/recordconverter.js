const fs = require('fs');

const noteNumberArray = new Array(128).fill(null).map((v, ndx) => 
(['c','cs','d','ds','e','f','fs','g','gs','a','as','b'])[ndx%12]+''+Math.floor(ndx/12)
);

function extractNotes(data) {        
    const notes = [];
    const ongoingNoteMap = {};
    const notekey = (msg) => ((msg[0] & 0x0f) << 8) + msg[1];

    let currentTime = 0;
    data.forEach(r => {
        const timedelta = r[0];
        currentTime+=timedelta;
        const msg = r[1];
        
        if((msg[0] & 0xf0) === 0x90) {
            // Note on
            ongoingNoteMap[notekey(msg)] = {startTime: currentTime, velocity: msg[2]};
            
        } else if((msg[0] & 0xf0) === 0x80 && ongoingNoteMap[notekey(msg)]) {
            // note off
            const key = notekey(msg);
            const startMsg = ongoingNoteMap[key];
            const timestamp = startMsg.startTime;
            const duration = currentTime - timestamp;
            delete ongoingNoteMap[key];
            const notenumber = (key & 0xff);
            const channel = (key & 0xf00) >> 8;
            notes.push([channel,notenumber,startMsg.velocity,timestamp,duration]);
        }
    });
    return notes;
}

function convertToBeats(notes, bpm) {
    return notes.map(note => [note[0], 
                note[1], note[2], 
                (note[3] * bpm) / 60 , 
                (note[4] * bpm) / 60  ])
            ;
}

function quantize(notes, stepsperbeat) {
    notes.forEach(note => note[3] = Math.round(note[3] * stepsperbeat) / stepsperbeat );
    return notes;
}

function toTrackerPattern(notes) {
    return 'const playpattern = () => instrument.play([' + 
            notes.map(note => `[ ${note[3]}, ${noteNumberArray[note[1]]}(${note[4]}, ${note[2]}) ]`)
                .join(',\n')
                + ']);';
}

class RecordConverter {
    constructor(recordeddata) {
        if(typeof recordeddata === 'string') {
            try {
                recordeddata = JSON.parse(fs.readFileSync(recordeddata));
            } catch(e) {
                console.log('Unable to open',recordeddata,e);
                recordeddata = [];
            }
        }
        this.recordeddata = recordeddata;
        this.notes = extractNotes(recordeddata);
        this.notesByBeat = convertToBeats(this.notes, global.bpm);
        this.trackerPatternData = toTrackerPattern(this.notesByBeat);
    }
    
    quantize(stepsperbeat) {
        this.notesByBeat = quantize(this.notesByBeat, stepsperbeat);
        this.trackerPatternData = toTrackerPattern(this.notesByBeat);
    }
    
}

module.exports = RecordConverter;
