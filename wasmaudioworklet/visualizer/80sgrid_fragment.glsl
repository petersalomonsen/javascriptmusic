// fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default
precision mediump float;

void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = vec4(gl_FragCoord.x * 0.01, gl_FragCoord.y * 0.01, 0.6, 1); // return redish-purple
}