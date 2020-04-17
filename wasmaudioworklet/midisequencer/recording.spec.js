import assert from 'assert';
import { RecordConverter } from './recording.js';
import { setBPM, beatToTimeMillis } from './pattern.js';

const recorded = [
    [ 0.37151927437641724, 144, 62, 100 ],
    [ 0.5166439909297053, 144, 62, 0 ],
    [ 0.7314285714285714, 144, 65, 100 ],
    [ 0.8417233560090703, 144, 65, 0 ],
    [ 1.1319727891156464, 144, 69, 100 ],
    [ 1.207437641723356, 144, 69, 0 ]
  ];

describe('recording', function() {    
    it("should convert eventlist to list of notes with durations", () => {
        const converted = new RecordConverter(recorded, 80).notesByBeat;        
        const expected = [[ 0, 62, 100, 0.4953590325018897, 0.1934996220710507 ],
                        [ 0, 65, 100, 0.9752380952380952, 0.14705971277399854 ],
                        [ 0, 69, 100, 1.5092970521541953, 0.10061980347694632 ]];
        assert.equal(converted.length, expected.length);
        converted.forEach((note, ndx) => assert.equal(JSON.stringify(converted[ndx]), JSON.stringify(expected[ndx])));        
    });
    it("should convert eventlist to code", () => {
        const converted = new RecordConverter(recorded, 80).trackerPatternData;        
        const expected = 'createTrack(0).play([[ 0.50, d5(0.19, 100) ],\n[ 0.98, f5(0.15, 100) ],\n[ 1.51, a5(0.10, 100) ]]);\n'
        assert.equal(converted, expected);
    });
    it("should convert eventlist to code adjusted for starttime", () => {
        const eventlist = [[6.353560090702948,146,76,100],[6.475464852607709,146,76,0],[6.725079365079365,146,81,100],[6.893424036281179,146,81,0],[7.079183673469387,146,84,100],[7.224308390022676,146,84,0],[7.357823129251701,146,83,100],[7.491337868480725,146,83,0],[7.723537414965986,146,79,100],[7.868662131519274,146,79,0],[8.124081632653061,146,81,100],[8.245986394557823,146,81,0],[8.61170068027211,146,76,100],[8.797460317460317,146,76,0],[8.99482993197279,146,79,100],[9.209614512471655,146,79,0],[9.656598639455781,146,74,100],[9.813333333333333,146,74,0],[9.848163265306123,146,76,100],[9.975873015873017,146,76,0],[10.271927437641724,146,72,100],[10.446077097505668,146,72,0]];
        const bpm = 80;
        setBPM(bpm);
        const recordingStartTimeSecs = beatToTimeMillis(8) / 1000;

        const converted = new RecordConverter(eventlist, bpm, recordingStartTimeSecs).trackerPatternData;        
        const expected = `createTrack(2).play([[ 0.47, e6(0.16, 100) ],
[ 0.97, a6(0.22, 100) ],
[ 1.44, c7(0.19, 100) ],
[ 1.81, b6(0.18, 100) ],
[ 2.30, g6(0.19, 100) ],
[ 2.83, a6(0.16, 100) ],
[ 3.48, e6(0.25, 100) ],
[ 3.99, g6(0.29, 100) ],
[ 4.88, d6(0.21, 100) ],
[ 5.13, e6(0.17, 100) ],
[ 5.70, c6(0.23, 100) ]]);
`;
        assert.equal(converted, expected);
    });

});