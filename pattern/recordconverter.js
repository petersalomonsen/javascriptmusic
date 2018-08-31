
const extractNotes = (data) => {
    const noteNumberArray = new Array(128).fill(null).map((v, ndx) => 
        (['c','cs','d','ds','e','f','fs','g','gs','a','as','b'])[ndx%12]+''+Math.floor(ndx/12)
    );
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
            ongoingNoteMap[notekey(msg)] = currentTime;
            
        } else if((msg[0] & 0xf0) === 0x80 && ongoingNoteMap[notekey(msg)]) {
            // note off
            const key = notekey(msg);
            const timestamp = ongoingNoteMap[key];
            const duration = currentTime - timestamp;
            delete ongoingNoteMap[key];
            notes.push([noteNumberArray[(key & 0xff)],timestamp,duration]);
        }
    });
    return notes;
};

console.log(extractNotes(JSON.parse(require('fs').readFileSync('./recordings/take1.json'))));
