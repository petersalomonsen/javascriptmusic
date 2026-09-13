// The visualizer's WebGL context, created in ONE place.
//
// The shader canvas (#glCanvas) is shared by the default visualizer, the
// fragment-shader visualizer and the note meter, and a canvas can hold only
// one kind of context: whoever asks first decides, and a later
// getContext('webgl') on a canvas that already has a WebGL2 context returns
// null. So every module asks through here.
//
// WebGL2 when the browser has it (every current browser), WebGL1 otherwise.
// A WebGL2 context runs GLSL ES 1.00 shaders unchanged, so every existing
// shader keeps working; a shader whose first directive is `#version 300 es`
// opts into GLSL ES 3.00 (texelFetch, sampler2DArray, dynamic loop bounds,
// integer math) and gets a matching vertex shader.

export function getGLContext(canvas, attributes) {
    return canvas.getContext('webgl2', attributes) || canvas.getContext('webgl', attributes);
}

export function isWebGL2(gl) {
    return typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
}

// The browser's compiler requires #version on the FIRST LINE of the source —
// not after a comment, not after a blank line (only spaces on that line).
export function usesGlsl300(fragmentSource) {
    return /^[ \t]*#version[ \t]+300[ \t]+es\b/.test(String(fragmentSource || ''));
}

const VERTEX_100 = `
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`;

const VERTEX_300 = `#version 300 es
in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/** The full-screen-quad vertex shader matching the fragment shader's GLSL version. */
export function vertexShaderFor(fragmentSource) {
    return usesGlsl300(fragmentSource) ? VERTEX_300 : VERTEX_100;
}
