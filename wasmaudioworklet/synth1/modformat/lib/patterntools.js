
export function createSampleEcho(pattern, sampleno,
            delaysteps, echostartvolume, decreaseval,
            allowedchannels, // array of channels to receive echo
            maxlastrow = 64, fadeechoednotes = 0) {    
    pattern.forEach((val, ndx, arr) => {
        if(val[0] === sampleno &&
            val[2] !== 0x01 && val[2] !== 0x02 // don't echo pitch bends ( we need space for 0xc command )
        ) {
            // echo effect
            let row = (ndx >> 2) + delaysteps;
            if(row < maxlastrow) {
                for(let allowedChannelNdx = 0; allowedChannelNdx < allowedchannels.length; allowedChannelNdx++) {
                    const ch = allowedchannels[allowedChannelNdx];
                    if(!arr[row * 4 + ch]) {               
                        const newVal = val[2] !== 0x0c ? echostartvolume : val[3] - decreaseval; 
                        if(newVal > 0 ) {
                            arr[row * 4 + ch] = [val[0], val[1], 0x0c, newVal];

                            // fade echoed notes
                            row++;
                            if (
                                row < maxlastrow &&
                                fadeechoednotes > 0 &&
                                (!arr[row * 4 + ch] ||
                                !arr[row * 4 + ch][0])
                            ) {
                                arr[row * 4 + ch] = [0, 0, 0x0a, fadeechoednotes];
                            }
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
    array.createSampleEcho = (sampleno, delaysteps, echostartvolume, decreaseval, allowedchannels, maxlastrow, fadeechoednotes) =>
        createSampleEcho(array.map(v => v), sampleno, delaysteps, echostartvolume, decreaseval, allowedchannels, maxlastrow, fadeechoednotes);
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

// call the input function with the current array as parameter to return a new transformed array
Array.prototype.transform = function(transformfunc) {
    return transformfunc(this);
}