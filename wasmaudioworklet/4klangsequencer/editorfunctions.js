export function insertRecording(insertStringIntoEditor) {
    const recorded = window.recordedSongData;
        
    const recordings = {};
    
    // find first song position with recorded data
    const firstSongPositionWithData = recorded.instrumentPatternLists
        .map(patternIndexList =>
                patternIndexList.findIndex(patternIndex => patternIndex > 0))
        .filter(songPosition => songPosition > -1)
        .sort()[0];
    
    // find last song position with recorded data
    const lastSongPositionWithData = recorded.instrumentPatternLists
        .map(patternIndexList =>
            patternIndexList.reduce(
                // using reduce to find last element with value > 0
                (currentSongPosition, patternIndex, songPosition) =>
                    patternIndex > 0 ? songPosition : currentSongPosition,
                -1
            )
        )
        .filter(songPosition => songPosition > -1)
        .sort((a, b) => b - a)[0];

    recorded.instrumentPatternLists.forEach((instrumentPatternList, instrumentIndex) => {            
        if(instrumentPatternList.find(patternIndex => patternIndex > 0)) {
            // go through pattern list for each instrument that has recorded data:
            instrumentPatternList.forEach((patternIndex, songPosition) => {                                        
                if(!recordings[instrumentNames[instrumentIndex]]) {
                    recordings[instrumentNames[instrumentIndex]] = [];
                }

                if( songPosition >= firstSongPositionWithData &&
                    songPosition <= lastSongPositionWithData 
                    ) {
                    // start with an empty pattern
                    let patternData = new Array(recorded.patterns[0].length).fill(0);

                    if (patternIndex > 0 ) {
                        // get data from recorded pattern ( if there is one )
                        patternData = recorded.patterns[patternIndex-1];
                    }
                    
                    patternData.forEach(val =>
                        // push each note from recorded pattern to recordings array per instrument
                        recordings[instrumentNames[instrumentIndex]].push(val)
                    );                        
                }
            })
        }
    });
    
    const groupRecordings = {};
    Object.keys(recordings).forEach(instrumentName => {
        let patterndata = recordings[instrumentName];

        patterndata = patterndata.map((v, ndx) => {
            if(v > 0) {
                if(instrumentDefs[instrumentName].type === 'number') {
                    return v + '';
                } else if(instrumentDefs[instrumentName].type === 'note') {
                    let noteLen = 1;
                    while(patterndata[ndx + noteLen] === 1 &&
                        (ndx + noteLen) < patterndata.length
                        ) {
                        // Detect how long the note is held
                        noteLen ++;
                    }
                    const beatLength = window.ticksperbeat();
                    let divisor = beatLength;
                    while ( (noteLen %2) === 0 && (divisor % 2) === 0) {
                        noteLen /= 2;
                        divisor /= 2;
                    }

                    const lengthExpression = noteLen === 1 && divisor === beatLength ? '' :
                        divisor === 1 ? `(${noteLen})` : `(${noteLen}/${divisor})`;

                    return v > 1 ? `${window.noteValues[v]}${lengthExpression}` : '';
                }
            } else {
                return '';
            }
        });
        
        let groupInstrumentIndex;
        const groupName = Object.keys(instrumentGroupMap).find(groupname => {
            groupInstrumentIndex = instrumentGroupMap[groupname].findIndex(instr => instr === instrumentName);
            return groupInstrumentIndex > -1;
        }); 
        
        if(groupName) {
            if(!groupRecordings[groupName]) {
                groupRecordings[groupName] = new Array(instrumentGroupMap[groupName].length);
            }    
            groupRecordings[groupName][groupInstrumentIndex] = patterndata;
        } else {
            const stepsPerBeat = ticksperbeat();
            const recordingString = `"${instrumentName}": pp(${stepsPerBeat}, [${
                    patterndata
                        .map((val, ndx) => ndx > 0 && ndx % stepsPerBeat === 0 ? `\n${val}` : val)
                        .join(',')
            }]),\n`;            
            insertStringIntoEditor(recordingString);
        }            
    });
    Object.keys(groupRecordings).forEach(group => {
        const recordings = groupRecordings[group];
        const recordingArr = [];
        recordings.forEach((recording, instrIndex) => {
            recording.forEach((val, ndx) => {
                if(!recordingArr[ndx]) {
                    recordingArr[ndx] = [];
                }
                recordingArr[ndx][instrIndex] = val;
            });
        });
        const stepsPerBeat = ticksperbeat();
        const recordingdatastring = recordingArr.map((values, ndx) => {
                let newLine = '';
                if(ndx > 0 && ndx % stepsPerBeat === 0) {
                    newLine = '\n';
                }
                if(values.filter(val => val ? true: false).length === 0) {
                    return `${newLine}`;
                } else if(values[0] && values.filter(val => val ? true: false).length === 1) {
                    return `${newLine}${values[0]}`;
                } else {
                    return `${newLine}[${values.join(',')}]`;
                }
            }).join(',');
        
        const recordingString = `"${group}": pp(${stepsPerBeat}, [${recordingdatastring}], ${recordings.length}),\n`;
        insertStringIntoEditor(recordingString);
    });

    // Clear recordings
    window.recordedSongData = {
        instrumentPatternLists: recorded.instrumentPatternLists.map(pl => new Array(pl.length).fill(0)),
        patterns: recorded.patterns.map(p => new Array(p.length).fill(0))
    };   
}