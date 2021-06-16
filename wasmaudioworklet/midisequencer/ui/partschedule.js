const html = `
    <style>
        :host {
            height: inherit;
        }
        input {
            width: 40px;
        }
        #tablediv {
            max-height: 90%;
            overflow: scroll;
        }
    </style>
    <template id="partschedulerowtemplate">
        <tr>
            <td><input class="beatinput" min="0" type="number" onchange="getRootNode().notifyChange()" /></td>
            <td>
                <select class="partselect" onchange="getRootNode().notifyChange()"></select>
            </td>
            <td><input class="repeatinput" type="number" value="1" onchange="getRootNode().notifyChange()" /></td>
            <td><button onclick="this.closest('tr').remove()">&#128465;</button></td>
        </tr>
    </template>
    <div id="tablediv">
        <table id="partscheduletable">
            <thead>
                <tr>
                    <th>beat</th>
                    <th>part</th>
                    <th>repeat</th>
                </tr>
            </thead>
            <tbody>
                
            </tbody>
        </table>
    </div>
    <button id="addbutton">add</button>
`;

customElements.define('midi-part-scheduler',
    class extends HTMLElement {
        static get observedAttributes() {
            return ['data-parts'];
        }

        constructor() {
            super();

            this.attachShadow({ mode: 'open' });

            this.shadowRoot.innerHTML = html;

            this.scheduletablebody = this.shadowRoot.querySelector('#partscheduletable tbody');
            this.shadowRoot.getElementById('addbutton').addEventListener('click', () => {
                this.addRow('', 0, '');

                const tablediv = this.shadowRoot.querySelector('#tablediv');
                tablediv.scrollTop = tablediv.scrollHeight;
            });
            this.shadowRoot.notifyChange = () => this.notifyChange();
        }

        addRow(beat, part, repeat) {
            const partschedulerowtemplate = this.shadowRoot.getElementById('partschedulerowtemplate');
            const newpartrow = document.importNode(partschedulerowtemplate.content, true);
            newpartrow.querySelector('.partselect').innerHTML = this.parts.map((part, ndx) => `<option value="${ndx}">${part}</option>`);
            newpartrow.querySelector('.beatinput').value = beat;
            newpartrow.querySelector('.partselect').value = part;
            newpartrow.querySelector('.repeatinput').value = repeat;
            this.scheduletablebody.appendChild(newpartrow);
            this.notifyChange();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case 'data-parts':
                    this.parts = newValue.split(',');
                    Array.from(this.shadowRoot.querySelectorAll('.partselect')).forEach(partselect => {
                        const currentSelectedPart = partselect.value;
                        partselect.innerHTML = this.parts.map((part, ndx) => `<option value="${ndx}">${part}</option>`);
                        partselect.value = currentSelectedPart;
                    });
            }
        }

        notifyChange() {
            const sortedSchedules = Array.from(this.scheduletablebody.children).sort((a, b) =>
                parseInt(a.querySelector('.beatinput').value) -
                parseInt(b.querySelector('.beatinput').value)
            );

            sortedSchedules.forEach((sch, ndx) => {
                const current = this.scheduletablebody.children[ndx];
                if (current && current !== sch) {
                    this.scheduletablebody.replaceChild(sch, current);
                } else if (!current) {
                    this.scheduletablebody.appendChild(sch);
                }
            });

            this.dispatchEvent(new CustomEvent('change'));
        }

        getState() {
            return Array.from(this.scheduletablebody.children).map(tr => {
                const repeat = parseInt(tr.querySelector('.repeatinput').value);
                return {
                    beat: parseInt(tr.querySelector('.beatinput').value),
                    part: parseInt(tr.querySelector('.partselect').value),
                    repeat: !isNaN(repeat) ? repeat : 0
                }
            }).filter(partschedule => !isNaN(partschedule.beat));
        }

        setState(state) {
            while (this.scheduletablebody.children.length > 0) {
                this.scheduletablebody.firstChild.remove();
            }
            state.forEach(partschedule => {
                this.addRow(partschedule.beat, partschedule.part, partschedule.repeat);
            });
        }
    }
);

