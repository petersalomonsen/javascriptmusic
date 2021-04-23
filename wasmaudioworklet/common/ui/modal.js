import { modalTemplate } from './modal.html.js';

customElements.define('common-modal',
    class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({mode: 'open'});
            this.resultPromise = new Promise(resolve => this.shadowRoot.result = resolve);
        }
    });

export async function modal(modalContent) {
    const modalElement = document.createElement('common-modal');
    modalElement.shadowRoot.innerHTML = modalTemplate(modalContent);
    document.documentElement.appendChild(modalElement);
    const result = await modalElement.resultPromise;
    document.documentElement.removeChild(modalElement);
    return result;
}

export async function modalYesNo(title, question) {
    return modal(`
    <h3>${title}</h3>
    <p>${question}</p>
    <p>
        <button onclick="getRootNode().result(false)">No</button>
        <button onclick="getRootNode().result(true)">Yes</button>
    </p>`);
}