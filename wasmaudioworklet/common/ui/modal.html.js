export const modalTemplate = (modalcontent) => `<style>
    :host {
        position: fixed;
        display: flex;
        top:0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        z-index: 1000;
        background-color: rgba(255, 255, 255, 0.7);
    }
    .modaldiv {
        margin: auto;
        text-align: center;
        padding: 20px;
        background-color: rgba(0, 0, 0, 0.8);
        border: #4a4 solid 5px;
        color: #4a4;
        font-family: monospace;
        font-size: 20px;
        max-width: 800px;
        border-radius: 50px;
    }
    button, textarea {
        font-family: monospace;
        background-color: #cfc;
        border-color: #4a4;
        border-width: 1px;
        color:#050;
        padding: 10px;
        font-size: 20px;
        
        border-radius: 4px;
        white-space: nowrap;
        
        margin: 2px;
        user-select: none;
    }
    textarea {
        width: 80%;
        height: 80px;
    }
</style>
<div class="modaldiv">
    ${modalcontent}
</div>`;