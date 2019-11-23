
export function createSampleEcho(pattern, sampleno, delaysteps, echostartvolume, decreaseval, allowedchannels) {    
    pattern.forEach((val, ndx, arr) => {
        if(val[0] === sampleno && val[2] !== 0x01 && val[2] !== 0x02) {
            // echo effect
            const row = (ndx >> 2) + delaysteps;
            if(row < 64) {
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
        }
    });
    return toPatternArray(pattern);
}

/**
 * Insert notes with one sample into pattern at given position / channel
 * @param {*} instrFunc 
 * @param {*} pattern 
 * @param {*} position 
 * @param {*} channel 
 * @param {*} notes 
 */
export function insertNotesIntoPattern(sampleFunc, pattern, position, channel, notes) {
    notes.forEach((note, ndx) => {
        if(position * 4 + ndx * 4 < 64 * 4) {
            pattern[position * 4 + ndx * 4 + channel] = sampleFunc(note);
        }
    });
    return toPatternArray(pattern);
}

/**
 * Insert notes with different samples into pattern at given position / channel
 * @param {*} pattern 
 * @param {*} position 
 * @param {*} channel 
 * @param {*} sampleNotes 
 */
export function insertSampleNotesIntoPattern(pattern, position, channel, sampleNotes) {
    sampleNotes.forEach((sampleNote, ndx) => {
        if(position * 4 + ndx * 4 < 64 * 4) {
            pattern[position * 4 + ndx * 4 + channel] = sampleNote;
        }
    });
    return toPatternArray(pattern);
}

export function toPatternArray(array) {
    array.insertNotes = (sampleFunc, position, channel, notes) =>
        insertNotesIntoPattern(sampleFunc, array.map(v => v), position, channel, notes);
    array.insertSampleNotes = (position, channel, sampleNotes) =>
        insertSampleNotesIntoPattern(array.map(v => v), position, channel, sampleNotes);
    array.createSampleEcho = (sampleno, delaysteps, echostartvolume, decreaseval, allowedchannels) =>
        createSampleEcho(array.map(v => v), sampleno, delaysteps, echostartvolume, decreaseval, allowedchannels);
    return array;
}

export function createEmptyPatternArray() {
    return toPatternArray(new Array(64 * 4));
}

Array.prototype.repeat = function(times = 1) {
    const arrToRepat = this.slice(0);
    let arr = this;
    for(let n = 0 ; n < times ; n++ ) {
        arr = arr.concat(arrToRepat);
    }
    return arr;    
}