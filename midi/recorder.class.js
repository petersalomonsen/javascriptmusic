const midi = require('midi');
const fs = require('fs');

// create a readable stream
const stream1 = midi.createReadStream();
const input = new midi.input();

let inputIndex;

for(let n=0;n<input.getPortCount(); n++) {
    console.log(input.getPortName(n));
    if(input.getPortName(n) === 'K-Board' || input.getPortName(n).indexOf('MIDIMATE II 24:0')===0 || input.getPortName(n).indexOf('UM-1')===0) {             
        inputIndex = n;
    }
}
if(inputIndex >= 0) {
    console.log("Opening",input.getPortName(inputIndex));        
    input.openPort(inputIndex);
}


class Recorder {
    

    constructor() {
        this.folder = 'recordings';
        this.takeNo = 1;
        this.midimessages = [];        

        input.on('message', (deltatime, msg) => {            
            const now = new Date().getTime();
            this.midimessages.push([
                (now - this.previousTime) / 1000
                , msg]);
                console.log(msg);
            this.previousTime = now;            
        });
    }

    start() {        
        this.midimessages = [];
        this.previousTime = new Date().getTime();
    }

    save() {
        if(this.midimessages.length > 0) {
            fs.writeFile(`${this.folder}/recording_take${this.takeNo}.json`, JSON.stringify(this.midimessages));
            console.log('Recording ended take', this.takeNo);
            this.takeNo ++;
        }        
    }    
}
module.exports = Recorder;
