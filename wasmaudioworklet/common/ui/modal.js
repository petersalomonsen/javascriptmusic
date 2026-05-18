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

// Drop-in replacement for window.alert() that uses the in-app modal so
// the message renders inside the app shell (and doesn't get blocked by
// browser auto-dismiss heuristics or cross-tab focus rules).
export async function modalAlert(title, message) {
    const safeTitle = String(title).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const safeMessage = String(message)
        .replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
        .replace(/\n/g, '<br>');
    return modal(`
    <h3>${safeTitle}</h3>
    <p>${safeMessage}</p>
    <p>
        <button onclick="getRootNode().result(true)">OK</button>
    </p>`);
}

export async function modalOkCancel(title, info, cancelText, okText) {
    return modal(`
    <h3>${title}</h3>
    <p>${info}</p>
    <p>
        <button onclick="getRootNode().result(false)">${cancelText}</button>
        <button onclick="getRootNode().result(true)">${okText}</button>
    </p>`);
}

// Resolves with the entered string, or null if cancelled.
export async function modalPrompt(title, label, defaultValue = '') {
    const safeDefault = String(defaultValue).replace(/"/g, '&quot;');
    const modalElement = document.createElement('common-modal');
    modalElement.shadowRoot.innerHTML = modalTemplate(`
    <h3>${title}</h3>
    <p>${label}</p>
    <p><input id="modal-prompt-input" type="text" value="${safeDefault}"
        style="font-family: monospace; font-size: 18px; padding: 8px; min-width: 320px; background: #cfc; color: #050; border: 1px solid #4a4; border-radius: 4px;"
        onkeydown="if (event.key === 'Enter') { getRootNode().result(this.value); event.preventDefault(); } else if (event.key === 'Escape') { getRootNode().result(null); event.preventDefault(); }" /></p>
    <p>
        <button onclick="getRootNode().result(null)">Cancel</button>
        <button onclick="getRootNode().result(getRootNode().getElementById('modal-prompt-input').value)">OK</button>
    </p>`);
    document.documentElement.appendChild(modalElement);
    requestAnimationFrame(() => {
        const input = modalElement.shadowRoot.getElementById('modal-prompt-input');
        if (input) { input.focus(); input.select(); }
    });
    const result = await modalElement.resultPromise;
    document.documentElement.removeChild(modalElement);
    return result;
}