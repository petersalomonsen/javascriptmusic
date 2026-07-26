// Warn when a song schedules visuals its shader cannot show.
//
// showText() and setVisual() only reach the screen through uniforms the
// fragment shader declares; a shader that never mentions `uText` silently
// drops every word the song shows, which looks exactly like a broken feature.
// Checked at compile time in editorcontroller.js — pure string work, so it can
// be tested on its own.

const TEXT_DOC_HINT = 'See wasmaudioworklet/docs/shaders.md (uniform contract) or examples/textoverlay.';

export function visualWarnings(shaderSource, { hasText = false, paramNames = [] } = {}) {
    const source = shaderSource || '';
    const warnings = [];

    // Declaring the uniforms is not enough: GLSL drops uniforms that are never
    // read, so a shader that declares uText without sampling it renders nothing
    // and reports no error. Check for a reference OUTSIDE the declarations.
    const body = source.replace(/uniform[^;]*;/g, '');
    if (hasText && !/\buText\b/.test(body)) {
        warnings.push(source.trim().length === 0
            ? `Warning: the song calls showText(), but there is no fragment shader to show it on. ${TEXT_DOC_HINT}`
            : /\buText\b/.test(source)
                ? 'Warning: the shader declares `uText` but never samples it, so the song\'s text still renders ' +
                'nothing (GLSL drops unused uniforms). Composite it in main() with 0..1 coordinates: ' +
                '`vec2 tuv = gl_FragCoord.xy / resolution; tuv.y = 1.0 - tuv.y;` then mix ' +
                `texture2D(uText, tuv) over your colour by its alpha. ${TEXT_DOC_HINT}`
                : 'Warning: the song calls showText(), but the shader never uses `uText` — ' +
                'declare `uniform sampler2D uText; uniform sampler2D uTextPrev; uniform float uTextMix;` ' +
                `and composite them, or the text stays invisible. ${TEXT_DOC_HINT}`);
    }

    // Names are validated as GLSL identifiers when scheduled, so they are safe
    // to put in a pattern.
    const missing = paramNames.filter(name =>
        !new RegExp(`uniform\\s+(?:lowp\\s+|mediump\\s+|highp\\s+)?float\\s+${name}\\s*;`).test(source));
    if (missing.length) {
        warnings.push(`Warning: setVisual(${missing.map(n => `'${n}'`).join(', ')}) ` +
            `${missing.length === 1 ? 'has' : 'have'} no effect — the shader does not declare ` +
            `${missing.map(n => `\`uniform float ${n};\``).join(', ')}.`);
    }

    return warnings;
}
