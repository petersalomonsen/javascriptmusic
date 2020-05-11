import { } from './trackerpattern.js';

describe('trackerpattern', function() {    
    it("should quantize", () => {
        const quantizedEvents = [[ 0, [0x80, 64, 100] ],
            [ 1.1 / 4, [0x80, 64, 100] ],
            [ 2.3 / 4, [0x80, 64, 100] ],
            [ 3.2 / 4, [0x80, 64, 100] ]].quantize(4);
        assert.equal(4, quantizedEvents.length);

        for ( let n = 0; n < quantizedEvents.length; n++) {
            assert.equal(quantizedEvents[n][0], n / 4);
        }
    });
    it("should quantize 50% late events", () => {
        const quantizedEvents = [[ 0, [0x80, 64, 100] ],
            [ 1.1 / 4, [0x80, 64, 100] ],
            [ 2.2 / 4, [0x80, 64, 100] ],
            [ 3.3 / 4, [0x80, 64, 100] ]].quantize(4, 0.5);

        for ( let n = 0; n < quantizedEvents.length; n++) {
            assert.equal(quantizedEvents[n][0], (n / 4) + (n / 80));
        }
    });
    it("should quantize 50% early events", () => {
        const quantizedEvents = [[ 0, [0x80, 64, 100] ],
            [ 0.9 / 4, [0x80, 64, 100] ],
            [ 1.8 / 4, [0x80, 64, 100] ],
            [ 2.7 / 4, [0x80, 64, 100] ]].quantize(4, 0.5);

        for ( let n = 0; n < quantizedEvents.length; n++) {
            assert.equal(quantizedEvents[n][0], (n / 4) - (n / 80));
        }
    });
});