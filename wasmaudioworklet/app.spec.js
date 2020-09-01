import { waitForAppReady, toggleSpinner, setProgressbarValue } from './app.js';

describe('app', function() {
    this.timeout(10000);
    this.beforeAll(async () => {
        document.documentElement.appendChild(document.createElement('app-javascriptmusic'));
        await waitForAppReady();
    });
    this.afterAll(async () => {
        document.documentElement.removeChild(document.querySelector('app-javascriptmusic'));
    });
    it('should start app', async () => {
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
        assert.equal(appElement.querySelector('#startaudiobutton').disabled, false);
        assert.equal(appElement.querySelector('.spinner').style.display, 'none');
    });
    it('should toggle spinner', async () => {
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
        toggleSpinner(true);
        assert.equal(appElement.querySelector('.spinner').style.display, 'block');
        await new Promise(resolve => setTimeout(() => resolve(), 100));
        toggleSpinner(false);
        assert.equal(appElement.querySelector('.spinner').style.display, 'none');
    });
    it('should set progressbar value', async () => {
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;
        assert.notEqual(appElement.querySelector('#main-progress-bar').style.display, 'block');
        setProgressbarValue(0.25);
        assert.equal(appElement.querySelector('#main-progress-bar').style.display, 'block');
        assert.equal(appElement.querySelector('#main-progress-bar .progress-fill').style.width, '25%');
        assert.equal(appElement.querySelector('#main-progress-bar .progress-text').innerHTML, '25%');
        setProgressbarValue(0.75);
        assert.equal(appElement.querySelector('#main-progress-bar').style.display, 'block');
        assert.equal(appElement.querySelector('#main-progress-bar .progress-fill').style.width, '75%');
        assert.equal(appElement.querySelector('#main-progress-bar .progress-text').innerHTML, '75%');
        setProgressbarValue(null);
        assert.equal(appElement.querySelector('#main-progress-bar').style.display, 'none');
    });
});