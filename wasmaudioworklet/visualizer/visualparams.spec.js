import { setVisualParamSchedule, getActiveVisualParams, getVisualParamNames, clearVisualParams } from './visualparams.js';

describe('visualparams', function () {
    this.afterEach(() => clearVisualParams());

    it('should hold the value scheduled at or before the given song time', () => {
        setVisualParamSchedule([
            { time: 0, name: 'mode', value: 1 },
            { time: 2000, name: 'mode', value: 3 },
            { time: 1000, name: 'mode', value: 2 },
        ]);
        expect(getActiveVisualParams(0).get('mode')).to.equal(1);
        expect(getActiveVisualParams(999).get('mode')).to.equal(1);
        expect(getActiveVisualParams(1000).get('mode')).to.equal(2);
        expect(getActiveVisualParams(5000).get('mode')).to.equal(3);
        // seeking backwards must give the same answer as playing forwards
        expect(getActiveVisualParams(1000).get('mode')).to.equal(2);
    });

    it('should read 0 before the first scheduled value', () => {
        setVisualParamSchedule([{ time: 4000, name: 'glow', value: 1 }]);
        expect(getActiveVisualParams(0).get('glow')).to.equal(0);
        expect(getActiveVisualParams(4000).get('glow')).to.equal(1);
    });

    it('should interpolate over a ramp and hold the target afterwards', () => {
        setVisualParamSchedule([
            { time: 0, name: 'zoom', value: 1 },
            { time: 1000, name: 'zoom', value: 2, ramp: 1000 },
        ]);
        expect(getActiveVisualParams(1000).get('zoom')).to.equal(1);
        expect(getActiveVisualParams(1500).get('zoom')).to.be.closeTo(1.5, 1e-9);
        expect(getActiveVisualParams(2000).get('zoom')).to.equal(2);
        expect(getActiveVisualParams(9000).get('zoom')).to.equal(2);
    });

    it('should ramp from 0 when there is no previous value', () => {
        setVisualParamSchedule([{ time: 0, name: 'fadein', value: 1, ramp: 2000 }]);
        expect(getActiveVisualParams(0).get('fadein')).to.equal(0);
        expect(getActiveVisualParams(1000).get('fadein')).to.be.closeTo(0.5, 1e-9);
        expect(getActiveVisualParams(2000).get('fadein')).to.equal(1);
    });

    it('should keep parameters independent', () => {
        setVisualParamSchedule([
            { time: 0, name: 'a', value: 1 },
            { time: 500, name: 'b', value: 7 },
        ]);
        expect(getVisualParamNames()).to.deep.equal(['a', 'b']);
        const params = getActiveVisualParams(600);
        expect(params.get('a')).to.equal(1);
        expect(params.get('b')).to.equal(7);
    });
});
