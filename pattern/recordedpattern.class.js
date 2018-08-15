const fs = require('fs');
module.exports = class RecordedPattern {
    constructor(output, midimessages) {
        this.output = output;
        
        if(typeof midimessages === 'string') {
            midimessages = JSON.parse(fs.readFileSync(midimessages));
        }
        this.midimessages = midimessages;
    }
    
    play(msg) {
        if(msg) {
            this.output.sendMessage(msg);
        } else {
            this.accumulatedDeltaTime = Date.now();
        }

        if(this.midimessages.length>0) {
            const evt = this.midimessages.shift();
            const deltatime = evt[0];
            const nextmessage = evt[1];        
            
            this.accumulatedDeltaTime += deltatime * 1000;
            setTimeout(() => this.play(nextmessage), this.accumulatedDeltaTime - Date.now());
        }        
    }
}