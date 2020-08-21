import { initVisualizer, getTargetNoteStates } from './80sgrid.js';
import { visualizeSong, setGetCurrentTimeFunction, isVisualizationLoopActive } from './midieventlistvisualizer.js';
import { SEQ_MSG_LOOP } from '../midisequencer/sequenceconstants.js';

describe('midieventlistvisualizer', async function () {
    this.beforeAll(async () => {
        const canvaselement = document.createElement('canvas');
        canvaselement.id = 'glCanvas';
        document.documentElement.appendChild(canvaselement);
    });
    this.afterAll(async () => {
        document.documentElement.removeChild(document.getElementById('glCanvas'));
    });

    it('should visualize midi event list', async () => {
        const eventlist = [
            { time: 0, message: [144, 62, 127 ]},
            { time: 1, message: [144, 62, 0 ]},
            { time: 2, message: [144, 65, 127 ]},
            { time: 3, message: [144, 65, 0 ]}            
        ];

        await initVisualizer(document);
        
        let currentTime = 0;
        const callbackPromise = new Promise((resolve, reject) => setGetCurrentTimeFunction(async () => {
            switch (currentTime) {
                case 0:
                    assert.equal(getTargetNoteStates()[62], -1);
                    break;
                case 1:
                    assert.equal(getTargetNoteStates()[62], 1);
                    break;
                case 2:
                    assert.equal(getTargetNoteStates()[62], -1);
                    break;
                case 3:                    
                    assert.equal(getTargetNoteStates()[65], 1);
                    resolve();
                    break;
                default:
                    throw new Error('should not happen');
            }
            return currentTime++;
        }));

        visualizeSong(eventlist);
        await callbackPromise;
        
        while (getTargetNoteStates().find(v => v > -1)) {
            await new Promise(r => setTimeout(r, 1));
        }
        assert.isUndefined(getTargetNoteStates().find(v => v > -1));
    });
    it('should visualize midi event list with loop', async () => {
        const eventlist = [
            { time: 0, message: [144, 62, 127 ]},
            { time: 1, message: [144, 62, 0 ]},
            { time: 2, message: [144, 65, 127 ]},
            { time: 3, message: [144, 65, 0 ]},
            { time: 4, message: [SEQ_MSG_LOOP]}
        ];

        await initVisualizer(document);
        
        let currentTime = 0;
        let numLoops = 0;
        const callbackPromise = new Promise((resolve) => setGetCurrentTimeFunction(async () => {
            switch (currentTime) {
                case 0:
                    assert.equal(getTargetNoteStates()[62], -1);
                    break;
                case 1:
                    assert.equal(getTargetNoteStates()[62], 1);
                    break;
                case 2:
                    assert.equal(getTargetNoteStates()[62], -1);
                    break;
                case 3:                    
                    assert.equal(getTargetNoteStates()[65], 1);
                    break;
                case 4:
                    assert.equal(getTargetNoteStates()[65], -1);
                    currentTime = 0;
                    numLoops ++;
                    if (numLoops === 5) {
                        resolve();
                        return null;
                    }
            }
            return currentTime++;
        }));

        visualizeSong(eventlist);

        assert.isTrue(isVisualizationLoopActive());

        await callbackPromise;

        assert.isFalse(isVisualizationLoopActive());
        assert.equal(numLoops, 5);

        assert.isUndefined(getTargetNoteStates().find(v => v > -1));
    });
});
