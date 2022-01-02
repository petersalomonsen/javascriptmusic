import { decodeBufferFromPNG, encodeBufferAsPNG } from './png.js';

describe("png", function () {
    this.timeout(20000);

    it("should encode small binary content as png, and be able to decode it back again", async () => {
        const binaryData = new Uint8Array(16 * 1024 + Math.random() * 32 * 1024);
        binaryData.forEach((v, n, arr) => arr[n] = Math.random() * 255);
        const encodedDataUrl = encodeBufferAsPNG(binaryData);

        const afterDecoded = await decodeBufferFromPNG(encodedDataUrl);
        assert.equal(afterDecoded.length, binaryData.length);

        for (let n = 0; n < binaryData.length; n++) {
            assert.equal(afterDecoded[n], binaryData[n], `data not matching at index ${n}`);
        }
    });
    it("should encode larger binary content as png, and be able to decode it back again", async () => {
        const binaryData = new Uint8Array(128 * 1024 + Math.random() * 128 * 1024);
        binaryData.forEach((v, n, arr) => arr[n] = Math.random() * 255);
        const encodedDataUrl = encodeBufferAsPNG(binaryData);

        const afterDecoded = await decodeBufferFromPNG(encodedDataUrl);
        assert.equal(afterDecoded.length, binaryData.length);

        for (let n = 0; n < binaryData.length; n++) {
            assert.equal(afterDecoded[n], binaryData[n], `data not matching at index ${n}`);
        }
    });
});