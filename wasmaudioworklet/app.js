import {} from './audioworkletpolyfill.js';
import { initAudioWorkletNode } from './audioworkletnode.js';
import { initVisualizer } from './visualizer/80sgrid.js';
import { initEditor } from './editorcontroller.js';
import { clone } from './wasmgit/wasmgitclient.js';

let componentRoot;
let appReadyPromises;

customElements.define('app-javascriptmusic',
  class extends HTMLElement {
    constructor() {
      super();
      appReadyPromises = [];
      componentRoot = this.attachShadow({mode: 'open'});
      this.init();      
    }

    async init() {
      console.log('initialize app');
      const apphtml = await fetch('app.html').then(r => r.text());
      this.shadowRoot.innerHTML = apphtml;
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
      if(instrSelect.childNodes.length <= ndx) {
          instrSelect.appendChild(opt);
      } else if(instrSelect.childNodes[ndx].value !== name) {
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