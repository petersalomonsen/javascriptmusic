import { } from './audioworkletpolyfill.js';
import { initAudioWorkletNode } from './audioworkletnode.js';
import { initVisualizer, setCurrentTimeSeconds as setVisualizerCurrentTimeSeconds } from './visualizer/defaultvisualizer.js';
import { initEditor } from './editorcontroller.js';
import { toggleSpinner } from './common/ui/progress-spinner.js';
import { modalAlert } from './common/ui/modal.js';
import apphtml from './app.html.js';

let componentRoot;
let appReadyPromises;
let seekAttached = false;

customElements.define('app-javascriptmusic',
  class extends HTMLElement {
    constructor() {
      super();
      appReadyPromises = [];
      componentRoot = this.attachShadow({ mode: 'open' });
      this.init();
    }

    async init() {
      console.log('initialize app');
      this.shadowRoot.innerHTML = apphtml;
      this.shadowRoot.getElementById('copyrighttoyear').innerHTML = new Date().getFullYear();
      initAudioWorkletNode(this.shadowRoot);
      await initVisualizer(this.shadowRoot);
      try {
        await initEditor(this.shadowRoot);
      } catch (e) {
        // Surface boot failures (stale gitrepo config, OPFS lock, NEAR
        // unreachable, etc.) instead of leaving the spinner up forever.
        console.error('initEditor failed:', e);
        toggleSpinner(false);
        await modalAlert('App failed to initialize',
          (e && e.message ? e.message : String(e)) +
          '\n\nThe spinner is cleared but the editor may not be fully usable. See the console for details.');
      }
      enablePlayAndSaveButtons();

      appReadyPromises.forEach(p => p());
      appReadyPromises = null;
    }
  }
);

export function appendToSubtoolbar1(element) {
  componentRoot.querySelector('#subtoolbar1').appendChild(element);
}

export async function waitForAppReady() {
  return new Promise(resolve => appReadyPromises !== null ? appReadyPromises.push(resolve) : resolve());
}

export function setInstrumentNames(instrumentNames) {
  const instrSelect = componentRoot.getElementById('midichannelmappingselection');
  const selectedIndex = instrSelect.selectedIndex;
  let instrSelectCount = 0;
  instrumentNames.forEach((name, ndx) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.innerText = name;
    window.midichannelmappings[name] = ndx;
    if (instrSelect.childNodes.length <= ndx) {
      instrSelect.appendChild(opt);
    } else if (instrSelect.childNodes[ndx].value !== name) {
      instrSelect.replaceChild(opt, instrSelect.childNodes[ndx]);
    }
    instrSelectCount++;
  });
  if (selectedIndex > -1 && selectedIndex < instrumentNames.length) {
    instrSelect.selectedIndex = selectedIndex;
  }
  return instrSelectCount;
}

export function enablePlayAndSaveButtons() {
  componentRoot.querySelector('#startaudiobutton').disabled = false;
  componentRoot.querySelector('#savesongbutton').disabled = false;
  toggleSpinner(false);
}

function padNumber(num, len) {
  const ret = '0000' + num;
  return ret.substr(ret.length - len);
}

export function formatTime(currentTime) {
  return Math.floor(currentTime / (60 * 1000)) + ':' +
    padNumber(Math.floor(currentTime / (1000)) % 60, 2) + ':' +
    padNumber(Math.floor(currentTime % (1000)), 3);
}

export function attachSeek(seekFunc, getCurrentTimeFunc, max, bpmOrGetter) {
  const timeindicatorelement = componentRoot.querySelector("#timeindicator");
  componentRoot.querySelector("#timeindicator").style.display = 'block';
  componentRoot.querySelector("#timespan").style.display = 'block';
  timeindicatorelement.max = max;
  timeindicatorelement.oninput = () => seekFunc(timeindicatorelement.value);

  // Accept either a static bpm (legacy) or a getter that returns the
  // currently-playing bpm (so the indicator follows tempo across
  // quantized song switches).
  const getBpm = typeof bpmOrGetter === 'function' ? bpmOrGetter : () => bpmOrGetter;
  const timeToBeat = (time) => (time / (60 * 1000)) * getBpm();

  const updateTimeIndicatorLoop = () =>
    requestAnimationFrame(async () => {
      const currentTime = await getCurrentTimeFunc();
      componentRoot.querySelector("#timeindicator").value = Math.round(currentTime);
      componentRoot.querySelector("#timespan").innerHTML = `${formatTime(currentTime)} (${timeToBeat(currentTime).toFixed(2)})`;
      setVisualizerCurrentTimeSeconds(currentTime / 1000);

      if (seekAttached) {
        updateTimeIndicatorLoop();
      }
    });
  seekAttached = true;
  updateTimeIndicatorLoop();
}

export function detachSeek() {
  seekAttached = false;
  componentRoot.querySelector("#timespan").style.display = 'none';
  componentRoot.querySelector("#timeindicator").style.display = 'none';
}