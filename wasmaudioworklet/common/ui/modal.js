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