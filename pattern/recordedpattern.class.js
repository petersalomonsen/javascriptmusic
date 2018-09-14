const fs = require('fs');
module.exports = class RecordedPattern {
    constructor(output, midimessages) {
        this.output = output;
        
        if(typeof midimessages === 'string') {
            try {
                midimessages = JSON.parse(fs.readFileSync(midimessages));
            } catch(e) {
                console.log('Unable to open',midimessages,e);
                midimessages = [];
            }
        }
        this.midimessages = midimessages;
        this.playIndex = 0;
    }
    
    play(msg) {
        if(msg) {
            this.output.sendMessage(msg);
        } else {
            this.accumulatedDeltaTime = Date.now();
            this.playIndex = 0;
        }

        if(this.playIndex < this.midimessages.length) {
            const evt = this.midimessages[this.playIndex++];
            const deltatime = evt[0];
            const nextmessage = evt[1];        
            
            this.accumulatedDeltaTime += deltatime * 1000;
            setTimeout(() => this.play(nextmessage), this.accumulatedDeltaTime - Date.now());
        }        
    }
}