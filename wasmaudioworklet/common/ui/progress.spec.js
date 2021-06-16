import { setProgressbarValue } from './progress-bar.js';
import { toggleSpinner } from './progress-spinner.js'

describe('progress', function() {
    it('should toggle spinner', async () => {
        toggleSpinner(true);
        assert.equal(document.getElementsByTagName('progress-spinner').length, 1);
        await new Promise(resolve => setTimeout(() => resolve(), 100));
        toggleSpinner(false);
        assert.equal(document.getElementsByTagName('progress-spinner').length, 0);
    });
    it('should set progressbar value', async () => {
        assert.equal(document.getElementsByTagName('progress-bar').length, 0);
        setProgressbarValue(0.25);
        assert.equal(document.getElementsByTagName('progress-bar').length, 1);
        assert.equal(document.querySelector('progress-bar').shadowRoot.querySelector('.progress-fill').style.width, '25%');
        assert.equal(document.querySelector('progress-bar').shadowRoot.querySelector('.progress-text').innerHTML, '25%');
        setProgressbarValue(0.75);
        assert.equal(document.getElementsByTagName('progress-bar').length, 1);
        assert.equal(document.querySelector('progress-bar').shadowRoot.querySelector('.progress-fill').style.width, '75%');
        assert.equal(document.querySelector('progress-bar').shadowRoot.querySelector('.progress-text').innerHTML, '75%');
        setProgressbarValue(null);
        assert.equal(document.getElementsByTagName('progress-bar').length, 0);
    });
});
