const midi = require('midi');
const fs = require('fs');

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
    

    constructor(channel = -1, output) {
        this.folder = 'recordings';
        this.takeNo = 1;
        this.midimessages = [];        

        
        input.on('message', (deltatime, msg) => {    
            const now = new Date().getTime();
            if(channel > -1) {
                msg[0] = (msg[0] & 0xf0) + channel;
            }
            this.midimessages.push([
                (now - this.previousTime) / 1000
                , msg]);
            // console.log(msg);
            this.previousTime = now;         
            if(output) {
                output.sendMessage(msg);
            }
        });
    }

    start() {        
        console.log("recording start");
        this.midimessages = [];
        this.previousTime = new Date().getTime();
    }

    save() {
        if(this.midimessages.length > 0) {
            const filename = `${this.folder}/recording_take${this.takeNo}.json`;
            fs.writeFile(filename, JSON.stringify(this.midimessages), 
                (filename) => console.log('saved', filename));
            console.log('Recording ended take', this.takeNo);
            this.takeNo ++;
        }        
    }    
}
module.exports = Recorder;
