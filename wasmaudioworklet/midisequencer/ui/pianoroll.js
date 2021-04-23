export const COLUMNS_PER_BEAT = 8;

const pianorollrowheight = 16;
const pianorollcolumnwidth = 16;
const rulerheight = 20;
const beatwidth = pianorollcolumnwidth * COLUMNS_PER_BEAT;

const templateHTML = (numrows) => `
<style>
    :host {
        display: inline-block;
        background-color: rgba(0,0,0,0.0);
        font-family: monospace;
        font-size: 30px;
        user-select: none;
        -webkit-user-select: none;
    }
    #container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    #pianorollcontainer {
        overflow: auto;
        display: flex;
    }
    #gridcontainer {
        height: ${numrows * pianorollrowheight}px;
    }
    #grid {
        background:   
            linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${pianorollrowheight - 1}px, #258 ${pianorollrowheight - 1}px),
            linear-gradient(90deg, rgb(0,0,0) 0%, rgb(0,0,0) ${beatwidth - 1}px, #3ac ${beatwidth - 1}px);
        background-size: ${beatwidth}px ${pianorollrowheight}px;
        grid-template-rows: repeat(${numrows}, 1fr);    
        display: grid;
        flex-grow: 1;
        height: ${numrows * pianorollrowheight}px;
        user-select: none;
    }
    .note {
        border: white solid 1px;
        position: relative;
    }
    .note:hover {
        box-shadow: 0px 0px 5px 5px rgba(255, 50, 0, 0.7);
    }
    #toolbar {
        background-color: #358;
        padding: 15px;
        color: white;
        border-top-left-radius: 30px;
        border-top-right-radius: 30px;
    }
    #footer {
        background-color: #358;
        padding: 15px;
        color: white;
        border-bottom-left-radius: 30px;
        border-bottom-right-radius: 30px;
    }
    #toolbar input[name=editmode] {
        opacity: 0;
        width: 0;
        height: 0;
    }
    #toolbar label {
        padding: 10px;
    }
    #toolbar input[type=radio]:checked + label {
        background-color: rgba(0,0,0,0.3);
    }
    #toolbar input[type=checkbox]:checked + label {
        background-color: rgba(0,0,0,0.3);
    }
    #timeIndicator {
        grid-row-start: 1;
        grid-row-end: 127;
        background-color: rgba(255,255,255,0.3);
        width: 2px;
    }
    #editcursor {
        grid-row-start: 1;
        grid-row-end: 127;
        grid-column: 1 / 1;
        background-color: rgba(0,255,255,0.3);
        display: none;
    }
    #notenames {
        position: sticky;
        left: 0px;
        color: white;
        font-size: ${pianorollrowheight - 2}px;
        z-index: 1;
        margin-top: ${rulerheight}px
    }
    .notename {
        padding-left: 2px;
        height: ${pianorollrowheight}px;
        color: black;
        background-color: white;
        border-right: solid white 8px;
        border-left: solid white 5px;
        cursor: pointer;
    }
    .notename:active {
        background-color: #bbb;
        border-color: #ddd;
    }
    .sharp {
        color: white;
        background-color: black;
        border-left: solid black 5px;
    }
    .velocityInput{
        width: 55px;
        position: absolute;
        font-size: ${pianorollrowheight}px;
        top: ${pianorollrowheight + 4}px;
    }
    #ruler {
        position: sticky;
        top: 0;
        display: grid;
        background:   
            linear-gradient(90deg, #222 0%, #222 ${beatwidth - 1}px, #447 ${beatwidth - 1}px);
        background-size: ${beatwidth}px ${rulerheight}px;
        height: ${rulerheight}px;
        width: 100%;
        font-size: ${rulerheight - 2}px;
        font-weight: 100;
        color: #ddd;
    }
    #controllers {
        position: sticky;
        bottom: 0px;
        background:   
            linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${32 - 1}px, #447 ${32 - 1}px),
            linear-gradient(90deg, #222 0%, #222 ${beatwidth - 1}px, #447 ${beatwidth - 1}px);
        background-size: ${beatwidth}px ${32}px;
        width: 100%;
        height: 128px;
        display: none;
        grid-template-rows: 128px;
        align-items: end;
    }
    .controllervalue {
        height: 100%;
        grid-row: 1 / 1;
        display: grid;
        align-items: end;
    }
    .controllervalue div {
        background-color: white;
    }
    .controllervalue:hover {
        box-shadow: 0px 0px 3px 3px rgba(255, 50, 0, 0.7);
    }
    input[type=checkbox] {
        display: none;
    }
</style>
<div id="container">
    <div id="toolbar">
        <input type="radio" id="editmode_draw" name="editmode" value="draw" checked /><label for="editmode_draw">&#9998</label>
        <input type="radio" id="editmode_erase" name="editmode" value="erase" /><label for="editmode_erase">&#8999;</label>
        <select id="controllerselect">
            <option value="">- select controller -</option>
            <option value="7">Volume</option>
            <option value="10">Pan</option>
            <option value="64">Sustain</option>
            <option value="91">Reverb</option>
        </select>
        <select id="snapselect">
            <option value="">- snap -</option>
            <option value="4">1/1</option>
            <option value="2">1/2</option>
            <option value="1">1/4</option>
            <option value="0.5">1/8</option>
            <option value="0.25">1/16</option>
            <option value="0.125">1/32</option>
        </select>
        <input type="checkbox" id="keyboardeditingenabledcheckbox"><label for="keyboardeditingenabledcheckbox">&#9000;</label>
        <span id="titlespan"></span>
    </div>
    <div id="pianorollcontainer" tabindex="1">
        <div id="notenames"></div>
        <div id="gridcontainer">
            <div id="ruler">
            </div>
            <div id="grid"></div>
            <div id="controllers">
            </div>
        </div>
        
    </div>
    <div id="footer">
    </div>
</div>
`;

const lowerkeyboardkeys = ["KeyZ", "KeyS", "KeyX", "KeyD", "KeyC", "KeyV", "KeyG", "KeyB", "KeyH", "KeyN", "KeyJ", "KeyM", "Comma", "KeyL", "Period", "Semicolon", "Slash"];
const upperkeyboardkeys = ["KeyQ", "Digit2", "KeyW", "Digit3", "KeyE", "KeyR", "Digit5", "KeyT", "Digit6", "KeyY", "Digit7", "KeyU", "KeyI", "Digit9", "KeyO", "Digit0", "KeyP", "BracketLeft"];

const NUMROWS = 88; // Number of keys on the piano roll
const FIRST_NOTE_NUMBER = 21; // starting at A0
const noteNames =
    new Array(NUMROWS).fill(null).map((v, ndx) =>
        (['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'])[ndx % 12] + '' + Math.floor((ndx + 9) / 12)
    ).filter((v, ndx) => v).reverse();

function noteNumberToRow(noteNumber) {
    return NUMROWS - (noteNumber - (FIRST_NOTE_NUMBER));
}

function rowToNoteNumber(row) {
    return NUMROWS - row + (FIRST_NOTE_NUMBER);
}

customElements.define('midi-pianoroll',
    class extends HTMLElement {
        static get observedAttributes() {
            return ['data-columns', 'data-title'];
        }

        constructor() {
            super();
            this.lastDuration = COLUMNS_PER_BEAT;
            this.lastVelocity = 100;

            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = templateHTML(NUMROWS);
            this.gridcontainer = this.shadowRoot.getElementById('gridcontainer');
            this.pianorollcontainer = this.shadowRoot.getElementById('pianorollcontainer');
            this.grid = this.shadowRoot.getElementById('grid');
            this.grid.addEventListener('click', (e) => {
                if (this.getEditMode() !== 'draw') {
                    return;
                }
                if (!this.existingNoteClicked) {
                    const row = this.offsetYToNoteNumber(e.pageY - this.grid.offsetTop + this.pianorollcontainer.scrollTop);
                    let start = this.offsetXToTimePosition(e.offsetX);
                    if (this.snap) {
                        start = 1 + Math.floor((start - 1) / (COLUMNS_PER_BEAT * this.snap)) * (COLUMNS_PER_BEAT * this.snap);
                    }
                    this.addNoteInternal(
                        row,
                        start,
                        this.lastDuration
                    );
                    this.dispatchNoteOn(row);
                    setTimeout(() => this.dispatchNoteOff(row), 500);
                } else if (!this.hasMovedWhileDown) {
                    if (this.velocityInput) {
                        this.velocityInput.parentElement.removeChild(this.velocityInput);
                    }
                    const parentNoteDiv = this.existingNoteClicked;
                    const velocityInput = document.createElement('input');
                    velocityInput.classList.add('velocityinput');
                    velocityInput.onmousedown = (e) => e.stopPropagation();
                    velocityInput.onclick = (e) => e.stopPropagation();
                    velocityInput.type = 'number';
                    velocityInput.max = 127;
                    velocityInput.min = 1;
                    velocityInput.value = parentNoteDiv.velocityValue;

                    velocityInput.oninput = () => {
                        let velocity = parseInt(velocityInput.value);
                        if (velocity > 127) {
                            velocity = 127;
                        } else if (velocity < 1) {
                            velocity = 1;
                        }
                        this.lastVelocity = velocity;
                        parentNoteDiv.velocityValue = velocity;
                        parentNoteDiv.style.backgroundColor = `rgba(255,255,255,${velocity / 127})`;
                    };

                    velocityInput.onkeydown = e => {
                        if (
                            (e.code === 'Escape') ||
                            (e.code === 'Tab')
                        ) {
                            this.velocityInput.blur();
                            e.preventDefault();
                        }
                        e.stopPropagation();
                    };
                    velocityInput.onblur = e => {
                        velocityInput.remove();
                        this.velocityInput = null;
                    };
                    parentNoteDiv.appendChild(velocityInput);
                    this.velocityInput = velocityInput;
                    velocityInput.focus();
                    velocityInput.select();
                }
                this.existingNoteClicked = null;
                this.hasMovedWhileDown = false;
            });

            // Time indicator when playing
            const timeIndicator = document.createElement('div');
            timeIndicator.id = 'timeIndicator';
            this.grid.appendChild(timeIndicator);
            this.timeIndicator = timeIndicator;

            // Piano keys
            const notenamesdiv = this.shadowRoot.getElementById('notenames');
            noteNames.forEach((notename, ndx) => {
                const notenamediv = document.createElement('div');
                notenamediv.classList.add('notename');
                if (notename.charAt(1) === '#') {
                    notenamediv.classList.add('sharp');
                }
                notenamediv.addEventListener('mousedown', () => this.dispatchNoteOn(ndx + 1));
                notenamediv.addEventListener('mouseup', () => this.dispatchNoteOff(ndx + 1));
                notenamediv.addEventListener('mouseleave', () => this.dispatchNoteOff(ndx + 1));
                notenamediv.innerHTML = notename;
                notenamediv.tabIndex = 1000 + ndx;
                notenamesdiv.appendChild(notenamediv);
            });

            // Cursor for keyboard editing

            const editcursor = document.createElement('div');
            editcursor.id = 'editcursor';
            editcursor.setPosition = (pos) => {
                if (this.snap) {
                    const numColumnsSnap = (this.snap * COLUMNS_PER_BEAT);
                    pos -= ((pos - 1) % numColumnsSnap);
                    editcursor.style.gridColumnStart = pos;
                    editcursor.style.gridColumnEnd = pos + (this.snap * COLUMNS_PER_BEAT);
                }
            }
            this.grid.appendChild(editcursor);
            const keyboardEditorListener = (ev) => {
                const currentEditCursorPosition = parseInt(editcursor.style.gridColumnStart);
                const editCursorInterval = COLUMNS_PER_BEAT * this.snap;
                if (this.snap && ev.code === 'ArrowLeft') {
                    if (ev.shiftKey) {
                        const columnStart = parseInt(editcursor.style.gridColumnStart);
                        const columnEnd = parseInt(editcursor.style.gridColumnEnd);
                        if (columnEnd > (columnStart + editCursorInterval)) {
                            editcursor.style.gridColumnEnd = columnEnd - editCursorInterval;
                        }
                    } else if (currentEditCursorPosition > editCursorInterval) {
                        const newPosition = currentEditCursorPosition - editCursorInterval;
                        editcursor.setPosition(newPosition);
                        const newPositionPixels = newPosition * pianorollcolumnwidth;
                        if (newPositionPixels < this.pianorollcontainer.scrollLeft) {
                            this.pianorollcontainer.scrollLeft = newPositionPixels;
                        }
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                } else if (this.snap && ev.code === 'ArrowRight' && currentEditCursorPosition < this.dataset.columns - editCursorInterval) {
                    const newPosition = parseInt(editcursor.style.gridColumnEnd);
                    if (ev.shiftKey) {
                        editcursor.style.gridColumnEnd = newPosition + editCursorInterval;
                    } else {
                        editcursor.setPosition(newPosition);
                    }
                    const endPositionPixels = (newPosition + editCursorInterval * 2) * pianorollcolumnwidth;
                    if (endPositionPixels >= (this.pianorollcontainer.scrollLeft + this.pianorollcontainer.offsetWidth)) {
                        this.pianorollcontainer.scrollLeft = endPositionPixels - this.pianorollcontainer.offsetWidth;
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                } else if (this.snap && ev.code === 'Backspace') {
                    // Delete selection
                    Array.from(this.grid.querySelectorAll('.note')).filter(note =>
                        parseInt(note.style.gridColumnStart) >= parseInt(editcursor.style.gridColumnStart) &&
                        parseInt(note.style.gridColumnStart) < parseInt(editcursor.style.gridColumnEnd)
                    ).forEach(note => note.remove());
                    this.dispatchChangeEvent();
                    ev.preventDefault();
                    ev.stopPropagation();
                } else if (this.snap && ev.code === 'Space') {
                    // Copy selection and paste right after
                    const cursorstart = parseInt(editcursor.style.gridColumnStart);
                    const cursorend = parseInt(editcursor.style.gridColumnEnd);
                    const cursorwidth = cursorend - cursorstart;
                    Array.from(this.grid.querySelectorAll('.note')).filter(note =>
                        parseInt(note.style.gridColumnStart) >= cursorstart &&
                        parseInt(note.style.gridColumnStart) < cursorend
                    ).forEach(note => {
                        const noteNumber = parseInt(note.style.gridRowStart);
                        const start = parseInt(note.style.gridColumnStart) + cursorwidth;
                        const duration = parseInt(note.style.gridColumnEnd) - parseInt(note.style.gridColumnStart);

                        this.addNoteInternal(noteNumber,
                            start, duration, note.velocityValue, true
                        );
                    });
                    this.dispatchChangeEvent();
                    ev.preventDefault();
                    ev.stopPropagation();
                } else if (!ev.repeat) {
                    const topOctave = Math.floor(
                        (this.pianorollcontainer.scrollHeight - this.pianorollcontainer.scrollTop) /
                        (pianorollrowheight * 12)
                    );
                    const lowerkeyboardindex = lowerkeyboardkeys.findIndex(k => k === ev.code);
                    let notenumber = -1;
                    if (lowerkeyboardindex > -1) {
                        notenumber = (topOctave) * 12 + lowerkeyboardindex;

                    } else {
                        const upperkeyboardindex = upperkeyboardkeys.findIndex(k => k === ev.code);
                        if (upperkeyboardindex > -1) {
                            notenumber = (topOctave + 1) * 12 + upperkeyboardindex;
                        }
                    }
                    if (notenumber >= 0 && notenumber < 128) {
                        const gridcolumnstart = parseInt(editcursor.style.gridColumnStart);
                        const gridrow = noteNumberToRow(notenumber);
                        ev.preventDefault();
                        ev.stopPropagation();
                        if (this.shadowRoot.getElementById('keyboardeditingenabledcheckbox').checked && this.snap) {
                            let existingnote = Array.from(this.grid.querySelectorAll('.note')).find(note =>
                                parseInt(note.style.gridColumnStart) === gridcolumnstart &&
                                parseInt(note.style.gridRowStart) === gridrow);
                            if (!existingnote && !ev.shiftKey) {
                                this.addNoteInternal(gridrow, gridcolumnstart, this.lastDuration);
                            } else if (existingnote && ev.shiftKey) {
                                existingnote.remove();
                            }
                        }
                        this.dispatchNoteOn(gridrow);

                        notenamesdiv.childNodes[gridrow - 1].focus();

                        document.addEventListener('keyup', () => {
                            this.dispatchNoteOff(gridrow);
                            notenamesdiv.childNodes[gridrow - 1].blur();
                            document.removeEventListener('keyup', this);
                        });

                    }
                }
            };
            this.editcursor = editcursor;

            this.addEventListener('mouseenter', () => {
                document.addEventListener('keydown', keyboardEditorListener);
                this.pianorollcontainer.focus();
            });
            this.addEventListener('mouseleave', () => {
                document.removeEventListener('keydown', keyboardEditorListener);
                this.pianorollcontainer.blur();
            });
            this.addEventListener('show', () => {
                // Scroll to middle
                console.log('show')
                this.pianorollcontainer.scrollTop = `${pianorollrowheight * 64}`;
            });

            // Controllers

            const controllerselect = this.shadowRoot.getElementById('controllerselect');
            this.controllers = this.shadowRoot.querySelector('#controllers');

            this.controllers.addEventListener('mousedown', (e) => {
                const offsetX = e.offsetX;
                const offsetY = e.offsetY;

                if (this.getEditMode() === 'draw') {
                    let start = this.offsetXToTimePosition(offsetX);
                    this.addControlEventInternal(parseInt(controllerselect.value), start, 128 - offsetY);
                }
            });
            this.controllers.addEventListener('mouseup', (e) => {
                this.dispatchChangeEvent();
            });

            this.allcontrollerdivs = [];
            controllerselect.addEventListener('change', (e) => {
                if (!e.target.value) {
                    this.controllers.style.display = 'none';
                    return;
                } else {
                    this.controllers.style.display = 'grid';
                }
                const newControllerNumber = parseInt(e.target.value);
                while (this.controllers.hasChildNodes()) {
                    this.controllers.lastChild.remove();
                }
                this.allcontrollerdivs.filter(d => d.controllerNumber === newControllerNumber)
                    .forEach(d => this.controllers.appendChild(d));
            });

            this.shadowRoot.querySelector('#snapselect').addEventListener('change', (e) => {
                if (e.target.value) {
                    this.snap = parseFloat(e.target.value);
                    editcursor.style.display = 'block';
                    editcursor.setPosition(parseInt(editcursor.style.gridColumnStart ? editcursor.style.gridColumnStart : 1));
                    this.pianorollcontainer.focus();
                } else {
                    this.snap = null;
                    editcursor.style.display = 'none';
                }
            }
            );
        }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case 'data-columns':
                    const numcolumns = parseInt(newValue);
                    // grid
                    this.grid.style.gridTemplateColumns = `repeat(${numcolumns}, ${pianorollcolumnwidth}px)`;
                    // controllers
                    this.controllers.style.gridTemplateColumns = `repeat(${numcolumns}, ${pianorollcolumnwidth}px)`;
                    this.configureRuler(numcolumns);
                    break;
                case 'data-title':
                    this.shadowRoot.getElementById('titlespan').innerHTML = newValue;
                    break;
            }
        }

        configureRuler(numcolumns) {
            const ruler = this.shadowRoot.querySelector('#ruler');
            ruler.style.gridTemplateColumns = `repeat(${numcolumns}, ${pianorollcolumnwidth}px)`;
            Array.from(ruler.childNodes).forEach(elm => elm.remove());

            for (let n = 0; n < numcolumns; n++) {
                const rulerElement = document.createElement('div');
                if (n % (COLUMNS_PER_BEAT) === 0) {
                    rulerElement.innerHTML = (n / COLUMNS_PER_BEAT) + '';

                }
                ruler.appendChild(rulerElement);
            }
        }
        dispatchNoteOn(row) {
            this.dispatchEvent(
                new CustomEvent('pianokey', {
                    detail: {
                        note: rowToNoteNumber(row),
                        velocity: 100
                    }
                }
                )
            );
        }

        dispatchNoteOff(row) {
            this.dispatchEvent(
                new CustomEvent('pianokey', {
                    detail: {
                        note: rowToNoteNumber(row),
                        velocity: 0
                    }
                }
                )
            );
        }

        dispatchChangeEvent() {
            this.dispatchEvent(new CustomEvent('change', {
                detail: {

                }
            }));
        }

        setTimeIndicatorPos(pos) {
            pos = Math.floor(pos * COLUMNS_PER_BEAT) + 1;
            this.timeIndicator.style.gridColumnStart = pos;
            this.timeIndicator.style.gridColumnEnd = pos;
        }

        offsetXToTimePosition(offsetX) {
            return Math.floor(offsetX / pianorollcolumnwidth) + 1;
        }

        offsetYToNoteNumber(offsetY) {
            return Math.floor(offsetY / pianorollrowheight) + 1;
        }

        clearAll() {
            Array.from(this.shadowRoot.querySelectorAll('.note')).map(note => note.remove());
            this.allcontrollerdivs.forEach(controller => controller.remove());
            this.allcontrollerdivs = [];
        }

        getEditMode() {
            return this.shadowRoot.querySelector('input[name=editmode]:checked').value;
        }

        addControlEvent(controllerNumber, time, value) {
            this.addControlEventInternal(controllerNumber, Math.round(time * COLUMNS_PER_BEAT) + 1, value);
        }

        addControlEventInternal(controllerNumber, time, value) {
            const controllerdiv = document.createElement('div');
            const filldiv = document.createElement('div');
            filldiv.style.height = `${value + 1}px`;
            controllerdiv.appendChild(filldiv);
            controllerdiv.style.gridColumnStart = time;
            controllerdiv.style.gridColumnEnd = time;
            controllerdiv.controllerNumber = controllerNumber;
            controllerdiv.classList.add('controllervalue');
            this.controllers.appendChild(controllerdiv);
            this.allcontrollerdivs.push(controllerdiv);

            const onMoveOrTouch = (e) => {
                if (this.getEditMode() === 'erase' || e.shiftKey) {
                    controllerdiv.remove();
                    this.allcontrollerdivs = this.allcontrollerdivs.filter(d => d !== controllerdiv);
                    this.pianorollcontainer.focus();
                } else {
                    const offsetY = e.pageY - this.controllers.offsetTop + this.pianorollcontainer.scrollTop;
                    filldiv.style.height = `${(128 - offsetY) + 1}px`;
                }
                e.stopPropagation();
                e.preventDefault();
            };

            controllerdiv.addEventListener('mousedown', (e) => onMoveOrTouch(e));
            controllerdiv.addEventListener('mousemove', (e) => {
                if (e.buttons) {
                    onMoveOrTouch(e);
                }
            });
        }

        addNote(noteNumber, start, duration, velocity) {
            this.addNoteInternal(noteNumberToRow(noteNumber), Math.round(start * COLUMNS_PER_BEAT) + 1, Math.round(duration * COLUMNS_PER_BEAT), velocity, false);
        }

        addNoteInternal(noteNumber, start, duration, velocity = this.lastVelocity, internal = true) {
            const notediv = document.createElement('div');
            notediv.velocityValue = velocity;
            notediv.style.backgroundColor = `rgba(255,255,255,${notediv.velocityValue / 127})`;
            notediv.classList.add('note');

            const positionNote = () => {
                notediv.style.gridColumnStart = start;
                notediv.style.gridColumnEnd = start + duration;
                notediv.style.gridRowStart = noteNumber;
                notediv.style.gridRowEnd = noteNumber;
            }
            positionNote();
            this.grid.appendChild(notediv);
            if (internal) {
                this.dispatchChangeEvent();
                this.editcursor.setPosition(start);
            }

            notediv.addEventListener('mousedown', (mousedownevt) => {
                if (this.getEditMode() === 'erase' || mousedownevt.shiftKey) {
                    this.grid.removeChild(notediv);
                    this.dispatchChangeEvent();
                    return;
                }
                const offsetInside = mousedownevt.offsetX;
                let changeDuration = false;

                if (offsetInside / pianorollcolumnwidth >= duration * 0.6) {
                    changeDuration = true;
                }
                this.existingNoteClicked = notediv;
                const mousemove = (mousemoveevt) => {
                    this.hasMovedWhileDown = true;
                    const offsetX = mousemoveevt.pageX - this.gridcontainer.offsetLeft + this.pianorollcontainer.scrollLeft;
                    const offsetY = mousemoveevt.pageY - this.grid.offsetTop + this.pianorollcontainer.scrollTop;

                    if (changeDuration) {
                        duration = this.offsetXToTimePosition(offsetX) - start;
                        if (duration < 0) {
                            duration = 1;
                        }
                        if (this.snap) {
                            duration = Math.round((duration) / (COLUMNS_PER_BEAT * this.snap)) * (COLUMNS_PER_BEAT * this.snap);
                            if (duration === 0) {
                                duration = (COLUMNS_PER_BEAT * this.snap);
                            }
                        }
                        this.lastDuration = duration;
                    } else {
                        start = this.offsetXToTimePosition(offsetX - offsetInside);
                        if (start < 1) {
                            start = 1;
                        }
                        if (this.snap) {
                            start = 1 + Math.round((start - 1) / (COLUMNS_PER_BEAT * this.snap)) * (COLUMNS_PER_BEAT * this.snap);
                            this.editcursor.setPosition(start);
                        }
                        noteNumber = this.offsetYToNoteNumber(offsetY);
                    }
                    positionNote();
                    this.dispatchChangeEvent();
                };
                window.addEventListener('mousemove', mousemove);
                const mouseup = () => {
                    window.removeEventListener('mousemove', mousemove);
                    window.removeEventListener('mouseup', mouseup);
                }
                window.addEventListener('mouseup', mouseup);
            });
        }

        getPianorollData() {
            return Array.from(this.shadowRoot.querySelectorAll('.note')).map(note => ({
                start: (parseInt(note.style.gridColumnStart) - 1) / COLUMNS_PER_BEAT,
                end: (parseInt(note.style.gridColumnEnd) - 1) / COLUMNS_PER_BEAT,
                noteNumber: rowToNoteNumber(parseInt(note.style.gridRowStart)) & 0x7f,
                velocityValue: note.velocityValue & 0x7f
            })).concat(
                this.allcontrollerdivs.map(ctrl => ({
                    start: (parseInt(ctrl.style.gridColumnStart) - 1) / COLUMNS_PER_BEAT,
                    controllerValue: (parseInt(ctrl.firstChild.style.height) - 1) & 0x7f,
                    controllerNumber: ctrl.controllerNumber & 0x7f
                }))
            );
        }
    }
);