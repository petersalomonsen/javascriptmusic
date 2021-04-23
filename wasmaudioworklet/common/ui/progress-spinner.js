const spinnerHtml = `<style type="text/css">
:host {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    background-color: rgba(255, 255, 255, 0.7);
}
.loader {
    border: 16px solid #f3f3f3;
    /* Light grey */
    border-top: 16px solid #3498db;
    /* Blue */
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: loaderspin 2s linear infinite;
}
#loaderprogress {
    display: none;
    position: inherit;
    background-color: #444;
    padding: 5px;
    border-radius: 4px;
}
@keyframes loaderspin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
<div id="loadercontainer">
    <div class="loader"></div>
    <div id="loaderprogress"></div>
</div>`;

customElements.define('progress-spinner', class Spinner extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = spinnerHtml;
    }
});

export function toggleSpinner(state) {
    if (state) {
        document.documentElement.appendChild(document.createElement('progress-spinner'));
    } else {
        document.getElementsByTagName('progress-spinner')[0].remove();
    }
}
