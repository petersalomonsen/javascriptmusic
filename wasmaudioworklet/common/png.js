export function encodeBufferAsPNG(binaryData) {
    const size = binaryData.length + 4;
    const width = Math.pow(2, Math.ceil(Math.sqrt(size)).toString(2).length);
    const height = Math.ceil(size / width);
    const canv = document.createElement('canvas');
    canv.width = width;
    canv.height = height;

    const ctx = canv.getContext('2d');
    const imageBinaryData = new Uint8ClampedArray(width * height * 4);
    imageBinaryData.fill(255);

    imageBinaryData[0] = binaryData.length & 0xff;
    imageBinaryData[1] = imageBinaryData[0];
    imageBinaryData[2] = imageBinaryData[0];

    imageBinaryData[4] = (binaryData.length >> 8) & 0xff;
    imageBinaryData[5] = imageBinaryData[4];
    imageBinaryData[6] = imageBinaryData[4];

    imageBinaryData[8] = (binaryData.length >> 16) & 0xff;
    imageBinaryData[9] = imageBinaryData[8];
    imageBinaryData[10] = imageBinaryData[8];

    imageBinaryData[12] = (binaryData.length >> 24) & 0xff;
    imageBinaryData[13] = imageBinaryData[12];
    imageBinaryData[14] = imageBinaryData[12];

    binaryData.forEach((v, n) => {
        const imageDataNdx = (n + 4) * 4;
        imageBinaryData[imageDataNdx] = v;
        imageBinaryData[imageDataNdx + 1] = v;
        imageBinaryData[imageDataNdx + 2] = v;
    });

    const imagedata = new ImageData(imageBinaryData, width, height);
    ctx.putImageData(imagedata, 0, 0);
    return canv.toDataURL();
}

export async function decodeBufferFromPNG(url) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    await img.decode();
    const canv = document.createElement('canvas');
    canv.width = img.width;
    canv.height = img.height;

    const ctx = canv.getContext('2d');
    // Draw image to canvas
    ctx.drawImage(img, 0, 0);
    // Retrieve RGBA data
    let data = ctx.getImageData(0, 0, img.width, img.height).data;
    // Only return R channel (identical to G and B channels)
    data = data.filter((_, idx) => { return idx % 4 === 0 });
    // Extract byte count from first 4 bytes (32-bit, unsigned, little endian)
    const length = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

    return data.slice(4, length + 4);
}