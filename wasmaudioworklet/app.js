import { } from './audioworkletpolyfill.js';
import { initAudioWorkletNode } from './audioworkletnode.js';
import { initVisualizer } from './visualizer/80sgrid.js';
import { initEditor } from './editorcontroller.js';

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
      const apphtml = await fetch('app.html').then(r => r.text());
      this.shadowRoot.innerHTML = apphtml;
      this.shadowRoot.getElementById('copyrighttoyear').innerHTML = new Date().getFullYear();
      initAudioWorkletNode(this.shadowRoot);
      await initVisualizer(this.shadowRoot);
      await initEditor(this.shadowRoot);
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

export function toggleSpinner(state) {
  const spinner = componentRoot.querySelector('.spinner');
  const exportbutton = componentRoot.querySelector('#exportbutton');

  if (state === undefined) {
    state = spinner.style.display === 'block' ? false : true;
  }

  if (state) {
    spinner.style.display = 'block';
    exportbutton.style.display = 'none';
  } else {
    spinner.style.display = 'none';
    exportbutton.style.display = 'block';
  }
}

export function setProgressbarValue(val) {
  const progressbar = componentRoot.querySelector('#main-progress-bar');
  if (val !== null) {
    progressbar.style.display = 'block';
    progressbar.querySelector('.progress-text').innerHTML = `${(val * 100).toFixed(0)}%`;
    progressbar.querySelector('.progress-fill').style.width = `${(val * 100).toFixed(2)}%`;
  } else {
    progressbar.style.display = 'none';
  }
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

export function attachSeek(seekFunc, getCurrentTimeFunc, max) {
  const timeindicatorelement = componentRoot.querySelector("#timeindicator");
  componentRoot.querySelector("#timeindicator").style.display = 'block';
  componentRoot.querySelector("#timespan").style.display = 'block';
  timeindicatorelement.max = max;
  timeindicatorelement.oninput = () => seekFunc(timeindicatorelement.value);

  const updateTimeIndicatorLoop = () =>
    requestAnimationFrame(async () => {
      const currentTime = await getCurrentTimeFunc();
      componentRoot.querySelector("#timeindicator").value = Math.round(currentTime);
      componentRoot.querySelector("#timespan").innerHTML = formatTime(currentTime);

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