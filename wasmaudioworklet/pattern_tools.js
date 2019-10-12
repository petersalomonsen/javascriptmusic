global.hld = 1;
global.bpm = 100;
global.beats_per_pattern_shift = 2;
global.pattern_size_shift = 4;
global.looptimes = 1;

global.instrumentNames = [];
global.instrumentDefs = {};
const instrumentPatternListArr = [];
const patternsMap = {};
global.instrumentGroupMap = {};
const instrumentsArr = [];
const instrumentIndexMap = {};
const soloMap = {};
const muteMap = {};

let onlyPlayPatternsEnabled = false;
let playPatternsList = [];

let currentPatternPosition = 0;

global.ticksperbeat = () => ( 1 << pattern_size_shift >> beats_per_pattern_shift );

let globalparamdefs;
let globalcmddefs;

let patternAutoNameCount = 0;

global.calculatePatternSize = () => {
	global.patternsize = 1 << global.pattern_size_shift;
};

global.calculatePatternSize();
global.soloInstrument = (name) => {
	soloMap[name] = true;
};

global.muteInstrument = (name) => {
	muteMap[name] = true;
};
global.addInstrument = (name, instrument) => {
    instrumentIndexMap[name] = instrumentsArr.length;
    
    // for 4klang instrument defs
    if(typeof instrument === 'string') {
        instrumentsArr.push(instrument.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .join('\n'));	
    } else {
        instrumentsArr.push(instrument);
    }

    instrumentPatternListArr.push([]);
    global.instrumentNames.push(name);
    global.instrumentDefs[name] = instrument;
};

global.pp = (stepsperbeat, patterndata, channels = 1) => {
	const channelpatterns = pattern(stepsperbeat, patterndata, channels);
	if(channels === 1) {	
		return addPattern(null, channelpatterns);
	} else {
		for(let n=0;n<channels;n++) {
			channelpatterns[n] = addPattern(null, channelpatterns[n]);
		}
		return channelpatterns;
	}
};

global.getPatternByName = (patternName) => {
	return patternsMap[patternName];
};

global.addPattern = (name, pattern) => {	
	if(!name) {
		patternAutoNameCount++;
		name = `.PATTERN${patternAutoNameCount}`
	}
	if(pattern.length > patternsize) {
		for(let n=0;n<pattern.length; n+=patternsize) {
			addPattern(name + '_' + Math.floor(n / patternsize), pattern.slice(n, n + patternsize));			
		}
	} else {
		for(let n=0;n<patternsize; n++) {
			if(pattern[n] === undefined) {
				pattern[n] = 0;
			} else if(typeof pattern[n] === 'function') {
				pattern[n] = pattern[n]();
			}
		}
		patternsMap[name] = pattern;
	}
	return name;
};

global.addInstrumentGroup = (groupName, instrumentNames) => instrumentGroupMap[groupName] = instrumentNames;

const playPatternsFunc = (patterns, incrementPosition = 1) => {		
	Object.keys(patterns).forEach(groupName => {
		if(instrumentGroupMap[groupName]) {
			const groupInstruments = instrumentGroupMap[groupName];
			const groupPatterns = patterns[groupName];
			for(let n=0;n<patterns[groupName].length;n++) {
				patterns[groupInstruments[n]] = groupPatterns[n];
			}
			delete patterns[groupName];
		}
	});
	Object.keys(patterns).forEach(instrumentName => {
		const instrumentIndex = instrumentIndexMap[instrumentName];
		if(instrumentIndex === undefined) {
			console.error('Unknown instrument '+instrumentName);
			return;
		}
		const instrPatternList = instrumentPatternListArr[instrumentIndex];
		let patternName = patterns[instrumentName];

		if(muteMap[instrumentName] || Object.keys(soloMap).length > 0 && !soloMap[instrumentName]) {
			console.log('muted', instrumentName);
			patternName = undefined;
		}
	
		if(patternsMap[patternName]===undefined && patternsMap[patternName + '_0']) {			
			for(let patternIndex = 0; patternsMap[patternName + '_' + patternIndex] !== undefined; patternIndex++) {
				instrPatternList[currentPatternPosition + patternIndex] = patternName + '_' + patternIndex;
			}			
		} else if(patternsMap[patternName]!==undefined) {
			instrPatternList[currentPatternPosition] = patterns[instrumentName];
		} else if(patternName) {
			console.error('Unknown pattern '+patternName);
		}
	});

	// Increment pattern position
	for(let inc = 0; inc < incrementPosition; inc++) {
		for(let n=0;n<instrumentPatternListArr.length;n++) {
			if(instrumentPatternListArr[n][currentPatternPosition]===undefined) {
				// Insert '0' to tracks without pattern data
				instrumentPatternListArr[n][currentPatternPosition] = '0';
			}
		}
		currentPatternPosition ++;
	}
};

global.logCurrentSongTime = () => {
	const elapsedTicks = (currentPatternPosition * patternsize);
	const elapsedBeats = elapsedTicks / ticksperbeat();
	const minutes = elapsedBeats / bpm;
	console.error(currentPatternPosition, Math.floor(minutes) + ':' + Math.floor((minutes * 60) % 60));
};

global.playPatterns = (patterns, incrementPosition = 1, logPosition = false) => { 
	if(onlyPlayPatternsEnabled) {
		return;
	}
	playPatternsList.push(() => {
		if(logPosition) {
			logCurrentSongTime();
		}
		playPatternsFunc(patterns, incrementPosition);
	});
};
global.onlyplayPatterns = (patterns, incrementPosition = 1) => { 
	if(!onlyPlayPatternsEnabled) {
		playPatternsList = [];
	}
	onlyPlayPatternsEnabled = true;
	playPatternsList.push(() => playPatternsFunc(patterns, incrementPosition));
};
global.playFromHere = () => { 
	playPatternsList = [];	
};
global.loopHere = () => {
	onlyPlayPatternsEnabled = true;
};

global.repeatSection = (times, func, initial=0) => {
	for(let n=initial;n<times;n++) {
		func(n);
	}
}
global.noteValues = new Array(128).fill(null).map((v, ndx) => 
    (['c','cs','d','ds','e','f','fs','g','gs','a','as','b'])[ndx%12]+''+Math.floor(ndx/12)
);
global.noteValues.forEach((note, ndx) => global[note] = (duration, velocity) => {
	if(duration) {
		let roundedDuration = Math.round(duration);
		if (roundedDuration === 0) {
			roundedDuration = 1;
		}
		return () => new Array(roundedDuration * ticksperbeat()).fill(null).map((v, n) => n===0 ? ndx : hld);
	} else {
		return ndx;
	}
});

global.pattern = (stepsperbeat, notearray, channels = 1) => {
	const inc = ticksperbeat() / stepsperbeat;

	const channelPatterns = [];
	
	for(let n=0;n<channels;n++) {
		channelPatterns.push([]);
	}
	
	let pattern = channelPatterns[0];

	for(let n = 0;n < notearray.length; n++) {
		const notefunc = notearray[n];
		
		const quantizedpos = Math.round(n*inc);

		const processNote = (note) => {
			if(note && note.constructor && note.constructor.name === 'Function') {			
				const notearr = note();
				if(Array.isArray(notearr)) {
					for(let en = 0; en < notearr.length ; en++) {
						pattern[quantizedpos + en] = notearr[en];
					}
				} else {
					pattern[quantizedpos] = note;
				}
			} else if(note !== undefined) {
				pattern[quantizedpos] = note;
			}
		};

		if(Array.isArray(notefunc) && channels > 1) {
			for(let c = 0;c<notefunc.length;c++) {
				pattern = channelPatterns[c];
				processNote(notefunc[c]);
			}			
			pattern = channelPatterns[0];
		} else {
			processNote(notefunc);
		}				
	}
	if(channels === 1) {
		return pattern;
	} else {
		return channelPatterns;
	}	
};

const patternNameToIndexMap = { '0': 0 };
global.max_patterns = 0;


global.generatePatterns = () => {
		playPatternsList.forEach((playFunc) => playFunc());

		const patternStringMap = {};
		patternStringMap[new Array(patternsize).fill(0).join(', ')] = 0;
		
		let patterns = [];
		let patternNo = 1;
		Object.keys(patternsMap).forEach((patternName) => {
			const patternString = patternsMap[patternName].join(', ');
			if(patternStringMap[patternString] !== undefined) {
				patternNameToIndexMap[patternName] = patternStringMap[patternString];
				// console.log('Reusing pattern', patternName, patternString);
			} else {
				patternStringMap[patternString] = patternNo;
				patternNameToIndexMap[patternName] = patternNo;
				patterns.push(patternsMap[patternName]);				

				patternNo++;
			}
		});
		return patterns;
    };
    
global.generateInstrumentPatternLists = () => {
		let instrumentPatternLists = [];
            
		instrumentPatternListArr.forEach((instrumentPatternList, ndx) => {
            if(instrumentPatternList.length > max_patterns) {
				max_patterns = instrumentPatternList.length;
			}			
		});
                
		for(let n = 0;n < instrumentsArr.length; n++) {
			let instrumentPatternList = instrumentPatternListArr[n];
			
			if(instrumentPatternList === undefined) {
				instrumentPatternList = [];
            }

			if(instrumentPatternList.length < max_patterns) {
				for(let ndx = instrumentPatternList.length; ndx < max_patterns; ndx++) {
					instrumentPatternList.push(0);
				}
			}
			
			instrumentPatternLists.push(instrumentPatternList.map(patternName => patternNameToIndexMap[patternName]));
        }
		return instrumentPatternLists;
    };
