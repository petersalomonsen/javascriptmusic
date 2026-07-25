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

    if (hasText && !/\buText\b/.test(source)) {
        warnings.push(source.trim().length === 0
            ? `Warning: the song calls showText(), but there is no fragment shader to show it on. ${TEXT_DOC_HINT}`
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
