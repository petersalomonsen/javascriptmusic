"use strict";

export async function initVisualizer(componentRoot) {
    const vertexShaderSource = await fetch('visualizer/80sgrid_vertex.glsl').then(res => res.text());
    const fragmentShaderSource = await fetch('visualizer/80sgrid_fragment.glsl').then(res => res.text());

    const canvas = componentRoot.querySelector("#glCanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");

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

        console.log(gl.getShaderInfoLog(shader));
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

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);    
    gl.enableVertexAttribArray(positionAttributeLocation);

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

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = positions.length / 3;

    const targetNoteStates = new Array(128).fill(-1);

    let animationFrameRequest = null;
    const repaint = () => {
        animationFrameRequest = null;
        let hasLevelsAboveZero = false;
        for(let noteIndex=0;noteIndex<128;noteIndex++) {
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
            gl.drawArrays(primitiveType, offset, count);
            animationFrameRequest = requestAnimationFrame(repaint);
        }
    };

    window.visualizeNoteOn = (note, velocity) => {
        targetNoteStates[note] = ((velocity / 128 ) * 2 - 1);
        
        if(!animationFrameRequest) {
            animationFrameRequest = requestAnimationFrame(repaint);
        }
    };
}