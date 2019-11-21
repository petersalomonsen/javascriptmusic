
export function createSampleEcho(pattern, sampleno, delaysteps, echostartvolume, decreaseval, allowedchannels) {    
    pattern.forEach((val, ndx, arr) => {
        if(val[0] === sampleno && val[2] !== 0x01 && val[2] !== 0x02) {
            // echo effect
            const row = (ndx >> 2) + delaysteps;     
            for(let allowedChannelNdx = 0; allowedChannelNdx < allowedchannels.length; allowedChannelNdx++) {
                const ch = allowedchannels[allowedChannelNdx];
                if(!arr[row * 4 + ch]) {               
                    const newVal = val[2] !== 0x0c ? echostartvolume : val[3] - decreaseval; 
                    if(newVal > 0 ) {
                        arr[row * 4 + ch] = [val[0], val[1], 0x0c, newVal];                
                    }
                    break;
                }
            }
            
        }
    });
}