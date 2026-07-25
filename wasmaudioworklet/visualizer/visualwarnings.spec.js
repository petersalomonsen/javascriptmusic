import { visualWarnings } from './visualwarnings.js';

const TEXT_SHADER = `
    precision highp float;
    uniform sampler2D uText;
    uniform sampler2D uTextPrev;
    uniform float uTextMix;
    uniform float textTransition;
    void main() { gl_FragColor = texture2D(uText, vec2(0.5)) * uTextMix * textTransition; }
`;

describe('visualwarnings', function () {
    it('should warn when the song shows text but the shader has no text layer', () => {
        const warnings = visualWarnings('precision highp float; void main(){}', { hasText: true });
        expect(warnings.length).to.equal(1);
        expect(warnings[0]).to.contain('uText');
    });

    it('should point out a missing shader entirely', () => {
        expect(visualWarnings('', { hasText: true })[0]).to.contain('no fragment shader');
    });

    it('should stay quiet when the shader uses the text layer', () => {
        expect(visualWarnings(TEXT_SHADER, { hasText: true, paramNames: ['textTransition'] }))
            .to.deep.equal([]);
    });

    it('should stay quiet when the song shows no text', () => {
        expect(visualWarnings('void main(){}', { hasText: false })).to.deep.equal([]);
    });

    it('should warn about visual params the shader does not declare', () => {
        const warnings = visualWarnings(TEXT_SHADER, { hasText: true, paramNames: ['textTransition', 'zoom'] });
        expect(warnings.length).to.equal(1);
        expect(warnings[0]).to.contain('zoom');
        expect(warnings[0]).to.not.contain('textTransition');
    });

    it('should accept precision qualifiers on the declaration', () => {
        expect(visualWarnings('uniform mediump float zoom;', { paramNames: ['zoom'] })).to.deep.equal([]);
        // a name that only appears in the body is not a declaration
        expect(visualWarnings('void main(){ float x = zoom; }', { paramNames: ['zoom'] }).length).to.equal(1);
    });
});
