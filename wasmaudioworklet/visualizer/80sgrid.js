"use strict";
const fragmentShaderSource = `
precision mediump float;

void main() {
    gl_FragColor = vec4(gl_FragCoord.x * 0.01, gl_FragCoord.y * 0.01, 0.6, 1); // return redish-purple
}`;

const vertexShaderSource = `
attribute vec4 a_position;

void main() {
    gl_Position = a_position;    
}
`;

const targetNoteStates = new Array(128).fill(-1);
let animationFrameRequest = null;
let gl;

const positions = new Float32Array( 128 * 9);
for(let note = 0; note < 128; note ++) {
    const x = ((note * 2) / 128) - 1;
    const ndx = note * 9;
    positions[ndx] = x-0.1;
    positions[ndx + 1] = -1;
    positions[ndx + 2] = 1;
    positions[ndx + 3] = x;      
    positions[ndx + 4] = -1;
    positions[ndx + 5] = 1;     
    positions[ndx + 6] = x + 0.1;      
    positions[ndx + 7] = -1;
    positions[ndx + 8] = 1;       
}

export async function initVisualizer(componentRoot) {    
    const canvas = componentRoot.querySelector("#glCanvas");
    // Initialize the GL context
    gl = canvas.getContext("webgl");

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
        return shader;
        }

        gl.deleteShader(shader);
    }

    function createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
        return program;
        }

        gl.deleteProgram(program);
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);    
    gl.enableVertexAttribArray(positionAttributeLocation);

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Bind the position buffer.
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer

    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);
}

function repaint() {
    animationFrameRequest = null;
    let hasLevelsAboveZero = false;
    for (let noteIndex=0; noteIndex<128; noteIndex++) {
        const levelIndex = noteIndex * 9 + 4;
        
        if(targetNoteStates[noteIndex]>positions[levelIndex]) {
            const inc = (targetNoteStates[noteIndex] - positions[levelIndex]) / 2;
            positions[levelIndex] += inc;
            hasLevelsAboveZero = true;
        } else if(targetNoteStates[noteIndex]<positions[levelIndex] &&
            positions[levelIndex] > -1
            ) {
            positions[levelIndex] -= 0.02;
            hasLevelsAboveZero = true;
        }
    }

    if(hasLevelsAboveZero) {
    
        // Bind the position buffer.
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);
        animationFrameRequest = requestAnimationFrame(repaint);
    }
}

export function visualizeNoteOn(note, velocity) {
    targetNoteStates[note] = ((velocity / 127 ) * 2 - 1);
    
    if(!animationFrameRequest) {
        animationFrameRequest = requestAnimationFrame(repaint);
    }
}

export function clearVisualization() {
    targetNoteStates.fill(-1);
}

export function getTargetNoteStates() {
    return targetNoteStates;
}