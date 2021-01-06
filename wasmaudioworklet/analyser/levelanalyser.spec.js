import { connectLevelAnalyser } from './levelanalysernode.js';

describe('levelanalyser', async function () {
    this.timeout(10000);
    it('should analyse levels of audio input', async () => {
        const renderSampleRate = 44100;
        const duration = 5;
        const offlineCtx = new OfflineAudioContext(2,
            duration * renderSampleRate,
            renderSampleRate);

        const oscNode = new OscillatorNode(offlineCtx, {
            frequency: 440, channelCount: 2,
            type: "sine"
        });
        oscNode.start(0);

        const gainNode = offlineCtx.createGain();
        gainNode.gain.setValueAtTime(1, 0);
        oscNode.connect(gainNode);

        const getStats = await connectLevelAnalyser(gainNode);

        await offlineCtx.startRendering();

        const stats = await getStats();
        console.log('found', stats.clips.length, 'clips. latest timestamp:',
            stats.clips[stats.clips.length - 1].currentTime, stats.clips[stats.clips.length - 1].time);
        assert(stats.clips.length > 0);
    });
});