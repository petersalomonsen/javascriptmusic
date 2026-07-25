import { textToSvg, textToSvgDataUrl, textToLines } from './textimage.js';

describe('textimage', function () {
    it('should split lines from a string or an array', () => {
        expect(textToLines('one\ntwo')).to.deep.equal(['one', 'two']);
        expect(textToLines(['one', 'two'])).to.deep.equal(['one', 'two']);
        // hideText() shows an empty image, not a blank line
        expect(textToLines('')).to.deep.equal([]);
        expect(textToLines(null)).to.deep.equal([]);
    });

    it('should render one text element per line', () => {
        const svg = textToSvg(['first', 'second']);
        expect(svg.match(/<text /g).length).to.equal(2);
        expect(svg).to.contain('>first<');
        expect(svg).to.contain('>second<');
        expect(svg).to.contain('width="1280" height="720"');
    });

    it('should escape markup in the text', () => {
        const svg = textToSvg('rock & <roll>');
        expect(svg).to.contain('rock &amp; &lt;roll&gt;');
    });

    it('should apply style options', () => {
        const svg = textToSvg('styled', {
            size: 40, color: '#ff0000', align: 'left', font: 'monospace',
            background: 'black', stroke: '#000', strokeWidth: 3,
        });
        expect(svg).to.contain('font-size="40"');
        expect(svg).to.contain('fill="#ff0000"');
        expect(svg).to.contain('text-anchor="start"');
        expect(svg).to.contain('font-family="monospace"');
        expect(svg).to.contain('<rect');
        expect(svg).to.contain('stroke-width="3"');
    });

    it('should produce an image data url a browser can decode', async () => {
        const url = textToSvgDataUrl('Første vers');
        expect(url.startsWith('data:image/svg+xml;charset=utf-8,')).to.equal(true);
        const image = new Image();
        image.src = url;
        await image.decode();
        expect(image.naturalWidth).to.equal(1280);
        expect(image.naturalHeight).to.equal(720);
    });

    it('should produce an empty but valid image for no text', async () => {
        const image = new Image();
        image.src = textToSvgDataUrl('');
        await image.decode();
        expect(image.naturalWidth).to.equal(1280);
    });
});
