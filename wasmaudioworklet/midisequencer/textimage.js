// Render song text to an SVG data URL.
//
// The song script runs inside the QuickJS sandbox (see quickjssandbox.js), so
// it has no DOM — no canvas, no document. Building an SVG document is pure
// string work, which the sandbox allows, and the host turns the resulting
// data: URL into an <img> exactly like any other image (see showText in
// songcompiler.js). This module is part of the guest source bundle, so keep it
// free of imports and browser APIs.

export const DEFAULT_TEXT_OPTIONS = {
    width: 1280,          // texture size; the shader maps it with its own uv
    height: 720,
    size: 96,             // font size in px, relative to width/height above
    font: 'sans-serif',   // system fonts only — no webfont fetch from an <img>
    weight: 'bold',
    color: '#ffffff',
    align: 'center',      // left | center | right
    x: 0.5,               // horizontal anchor, 0..1 of width
    y: 0.5,               // vertical centre of the text block, 0..1 of height
    lineHeight: 1.25,
    background: null,     // e.g. 'rgba(0,0,0,0.4)'; transparent when null
    stroke: null,         // outline colour — legibility over busy visuals
    strokeWidth: 0,
};

const TEXT_ANCHOR = { left: 'start', center: 'middle', right: 'end' };

function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export function textToLines(text) {
    if (text === null || text === undefined) return [];
    const lines = (Array.isArray(text) ? text : String(text).split('\n'))
        .map(line => String(line));
    // A single empty string means "no text" (hideText) — an empty, fully
    // transparent image rather than a blank line.
    return lines.length === 1 && lines[0] === '' ? [] : lines;
}

export function textToSvg(text, options = {}) {
    const o = { ...DEFAULT_TEXT_OPTIONS, ...options };
    const lines = textToLines(text);
    const anchor = TEXT_ANCHOR[o.align] || 'middle';
    const x = o.x * o.width;
    const step = o.size * o.lineHeight;
    // Centre the block on o.y, then offset to the first baseline (roughly the
    // cap height of the first line).
    const firstBaseline = o.y * o.height - (lines.length - 1) * step / 2 + o.size * 0.35;

    const parts = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${o.width}" height="${o.height}" viewBox="0 0 ${o.width} ${o.height}">`,
    ];
    if (o.background) {
        parts.push(`<rect width="${o.width}" height="${o.height}" fill="${escapeXml(o.background)}"/>`);
    }
    const strokeAttrs = o.stroke && o.strokeWidth > 0
        // paint-order puts the outline behind the fill so it doesn't eat the glyphs
        ? ` stroke="${escapeXml(o.stroke)}" stroke-width="${o.strokeWidth}" stroke-linejoin="round" paint-order="stroke"`
        : '';
    lines.forEach((line, ndx) => {
        parts.push(
            `<text x="${x}" y="${firstBaseline + ndx * step}"` +
            ` font-family="${escapeXml(o.font)}" font-size="${o.size}" font-weight="${escapeXml(o.weight)}"` +
            ` fill="${escapeXml(o.color)}" text-anchor="${anchor}"${strokeAttrs}>${escapeXml(line)}</text>`
        );
    });
    parts.push('</svg>');
    return parts.join('');
}

export function textToSvgDataUrl(text, options = {}) {
    // encodeURIComponent keeps this valid for characters an SVG data URL can't
    // carry raw (#, %, non-ASCII like æøå).
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(textToSvg(text, options));
}
