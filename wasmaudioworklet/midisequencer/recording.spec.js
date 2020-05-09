import assert from 'assert';
import { RecordConverter } from './recording.js';
import { setBPM, beatToTimeMillis } from './pattern.js';
import { compileSong } from './songcompiler.js';

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
    it("should include control changes in code generated from recording", async () => {
        const eventlist = [[0.024671201814058463,146,60,68],[0.07691609977324276,242,null,null],[0.07691609977324276,146,64,57],[0.3497505668934249,242,null,null],[0.6283900226757382,242,null,null],[0.9012244897959185,242,null,null],[1.1798639455782318,242,null,null],[1.452698412698414,242,null,null],[1.7313378684807255,242,null,null],[2.0099773242630388,242,null,null],[2.282811791383221,242,null,null],[2.5614512471655324,242,null,null],[2.8342857142857145,242,null,null],[3.112925170068028,242,null,null],[3.350929705215419,146,57,0],[3.385759637188208,242,null,null],[3.420589569160999,146,64,0],[3.4438095238095237,146,60,0],[3.6643990929705215,242,null,null],[3.9024036281179146,146,65,97],[3.908208616780046,146,53,0],[3.9372335600907036,242,null,null],[4.215873015873017,242,null,null],[4.256507936507937,146,38,0],[4.302947845804988,146,65,0],[4.355192743764173,146,64,78],[4.488707482993197,242,null,null],[4.709297052154195,146,64,0],[4.7673469387755105,242,null,null],[4.773151927437642,146,62,67],[4.778956916099773,146,58,78],[4.790566893424037,146,57,77],[4.796371882086168,146,31,65],[4.819591836734695,178,64,0],[5.045986394557824,242,null,null],[5.318820861678004,242,null,null],[5.423310657596373,178,64,127],[5.5974603174603175,242,null,null],[5.8702947845805,242,null,null],[6.148934240362813,242,null,null],[6.421768707482995,242,null,null],[6.613333333333335,146,65,83],[6.630748299319729,146,58,0],[6.63655328798186,146,62,0],[6.642358276643991,146,57,0],[6.7004081632653065,242,null,null],[6.857142857142856,146,31,0],[6.920997732426303,146,65,0],[6.973242630385487,242,null,null],[7.1531972789115645,146,59,79],[7.170612244897958,146,55,72],[7.170612244897958,146,33,58],[7.182222222222224,146,64,54],[7.205442176870749,146,60,75],[7.222857142857142,146,59,0],[7.251882086167802,242,null,null],[7.263492063492064,178,64,0],[7.5305215419501135,242,null,null],[7.803356009070294,242,null,null],[8.081995464852609,242,null,null],[8.35482993197279,242,null,null],[8.6334693877551,242,null,null],[8.906303854875285,242,null,null],[9.184943310657596,242,null,null],[9.446167800453514,146,33,0],[9.457777777777777,242,null,null],[9.463582766439911,146,55,0],[9.475192743764174,146,60,0],[9.480997732426305,146,64,0]];
        const bpm = 100;
        setBPM(bpm);
        const recordingStartTimeSecs = 0;

        const converted = new RecordConverter(eventlist, bpm, recordingStartTimeSecs).trackerPatternData;

        const compiledEventList = await compileSong(`setBPM(100);
        await ${converted};
        await waitForBeat(32)`);
        
        const matchedEvents = compiledEventList.map(compiledEvent =>
            eventlist.find(recordedEvent =>
                    Math.abs((recordedEvent[0] * 1000) - compiledEvent.time) < 10 &&
                    recordedEvent[2] === compiledEvent.message[1] &&
                    recordedEvent[3] === compiledEvent.message[2]
        ));
        const unmatchedEvents = eventlist
            .filter(evt => !matchedEvents.find(mevt => mevt === evt))
            .filter(e => e[1] !== 242);
        
        unmatchedEvents.forEach(evt => {
            if ((evt[1] & 0xf0) === 0x90 && evt[3] === 0) {
                assert(!eventlist.find(e => e[0] < evt[0] &&
                    (e[1] & 0xf0) === 0x90 &&
                    e[2] === evt[2] &&
                    e[3] > 0
                    ), 'unmatched event ' + evt);
            } else if ((evt[1] & 0xf0) === 0xb0) {
                assert (false, 'unmatched control change event ' + evt);
            }
        });
    });
});