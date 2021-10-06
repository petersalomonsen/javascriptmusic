import { allocateAudioBuffer, MonoAudioPlayer } from "../../../mixes/globalimports";

describe("audioplayer", () => {
    it("should allocate audio buffer and reference it in the audioplayer", () => {
        const audioBufPtr = allocateAudioBuffer(1024);
        const audioPlayer = new MonoAudioPlayer(0);
        expect(changetype<usize>(audioPlayer.audioBuffer)).toBe(audioBufPtr);
    });
});
