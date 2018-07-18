const midi = require('midi');

// Set up a new output.
const output = new midi.output();
let outputIndex;
for(var n=0;n<output.getPortCount(); n++) {
    if(output.getPortName(n) === 'virtual1') {
        outputIndex = n;
    }
}
output.openPort(outputIndex);

const noteStringToNoteNumberMap = 
    new Array(128).fill(null).map((v, ndx) => 
        (['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'])[ndx%12]+''+Math.floor(ndx/12)
    ).reduce((prev, curr, ndx) => {
        prev[curr] = ndx;
        return prev;
    }, {});

const drums = [
    [0, 'c3'],
    [0, 'g#3'],
    [4, 'e3'],
    [0, 'g#3'],
    [1, 'c3'],
    [3, 'g#3'],
    [2, 'c3'],
    [2, 'e3'],
    [0, 'g#3'],
    [3, 'c3']
].map(v => [v[0]*0.15, [0x91, noteStringToNoteNumberMap[v[1]], 127]]);

const strings = [
    [0, 'c3'],
    [0, 'e3'],
    [0, 'g3'],
].map(v => [v[0]*0.15, [0x92, noteStringToNoteNumberMap[v[1]], 127]]);

const mixtracks = (track1, track2) => {
    const mixed = [];
    let track1index = 0;
    let track2index = 0;
    while(track1index<track1.length || track2index<track2.length) {
       
    }
    return mixed;
};


let accumulatedDeltaTime = Date.now();

let msgindex = 0;

const playEvent = (msg) => {
    if(msg) {
        output.sendMessage(msg);
    }

    if(msgindex<midimessages.length) {
        const evt = midimessages[msgindex++];
        msgindex = msgindex % midimessages.length;

        const deltatime = evt[0];
        const nextmessage = evt[1];        
        
        accumulatedDeltaTime += deltatime * 1000;
        setTimeout(() => playEvent(nextmessage), accumulatedDeltaTime - Date.now());
    }     
};

playEvent();