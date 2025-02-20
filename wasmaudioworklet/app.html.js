export default /*html*/ `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/codemirror.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/dialog/dialog.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/lint/lint.css">
<link rel="stylesheet" type="text/css" href="codemirror-monokai.css">
<link rel="stylesheet" type="text/css" href="style.css">
<div id="appcontainer">
  <div class="toolbar">
    <button id="startaudiobutton" onclick="startaudio()" disabled title="start synth">&#x25B6;</button>
    <button id="stopaudiobutton" onclick="stopaudio()" title="stop synth" style="display: none">&#9724;</button>
    <button id="savesongbutton" disabled title="save song (clears recorded data)">&#x1f4be;</button>
    <button onclick="insertRecording()" title="insert recording at cursor" style="height: 31px">&#128203;</button>

    <label>
      <select id="midichannelmappingselection" title="select instrument"
        onchange="currentMidiChannelMapping=this.value">
      </select>
    </label>

    <input id="vkeyboardinputelement" title="use your computer keyboard to play notes" placeholder="Virtual keyboard" />

    <label title="toggle sequencer">
      <input id="toggleSongPlayCheckbox" type="checkbox" checked onclick="toggleSongPlay(this.checked)" />
      <span>sequencer</span>
    </label>

    &nbsp;

    <label title="toggle screen and audio capture">
      <input id="toggleSongPlayCheckbox" type="checkbox" onclick="toggleCapture(this.checked)" />
      <span>capture</span>
    </label>

    &nbsp;

    <label title="toggle visualizer">
      <input id="toggleVisualizerCheckbox" type="checkbox" onclick="toggleVisualizer(this.checked)" />
      <span>visualizer</span>
    </label>

    <div style="flex-grow: 1"></div>
    <button id="exportbutton" onclick="compileSong(true)" title="Export">&#x21E9;</button>
  </div>
  <br />
  <div id="subtoolbar1" class="subtoolbar">
    <label title="song editor">
      <input type="checkbox" id="songeditortogglecheckbox" checked onclick="toggleEditors('editor', this.checked)" />
      <span>song</span>
    </label>
    <label title="synth editor">
      <input type="checkbox" id="syntheditortogglecheckbox" checked
        onclick="toggleEditors('assemblyscripteditor', this.checked)" />
      <span>synth</span>
    </label>
    <label title="presets">
      <input type="checkbox" id="preseteditortogglecheckbox" onclick="toggleEditors('presetsui', this.checked)" />
      <span>presets</span>
    </label>
    <label title="shader">
      <input type="checkbox" id="shadereditortogglecheckbox" onclick="toggleEditors('shadereditor', this.checked)" />
      <span>shader</span>
    </label>
    <span style="flex-grow: 1"></span>
  </div>
  <div class="editors">
    <div id="editor" class="editor"></div>
    <div id="assemblyscripteditor" class="editor"></div>
    <div id="presetsui" class="editor" style="display: none"><span>Not available</span></div>
    <div id="shadereditor" class="editor"></div>
  </div>

  <div id="errormessages">
    <button style="position: absolute; right: 10px" onclick="this.parentElement.style.display='none'">close</button
      onclick="this.parent.style.display='none'">
    <span></span>
  </div>
  <script>
    window.visualizeNoteOn = function () { }
  </script>
  <canvas id="glCanvas" style="position: absolute;
        bottom: 20px;
        top: 20px;
        left: 0px;
        right: 0px;
        width: 100%;
        height: 100%;
        z-index: -10"></canvas>

  <input id="timeindicator" type="range" value="0" min="0" max="180000" />

  <div class="footer">
    webassembly music experiment - (c) 2019-<span id="copyrighttoyear"></span>&nbsp;peter salomonsen
    <span style="flex-grow: 1"></span>
    <span id="timespan"></span>
  </div>
</div>
`;