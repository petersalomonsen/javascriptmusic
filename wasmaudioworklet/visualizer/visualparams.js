// Scheduled named float uniforms — the song's control channel into the shader.
//
// A song calls setVisual(name, value, rampSeconds) at a point in the sequence.
// The calls are collected at compile time into a schedule stamped with song
// time (milliseconds), and the renderer sets `uniform float <name>` to the
// value active at the current playback time each frame (see fragmentshader.js).
// A shader that doesn't declare a name simply never sees it —
// getUniformLocation returns null and the write is skipped.
//
// Pure logic (no DOM, no WebGL) so it can be scheduled from the song compiler
// and unit tested on its own.

let paramsByName = new Map();
// Reused across frames — getActiveVisualParams is called on every render tick.
const active = new Map();

export function setVisualParamSchedule(entries) {
    paramsByName = new Map();
    for (const entry of entries || []) {
        if (!paramsByName.has(entry.name)) {
            paramsByName.set(entry.name, []);
        }
        paramsByName.get(entry.name).push({
            time: entry.time,
            value: entry.value,
            ramp: entry.ramp > 0 ? entry.ramp : 0,
        });
    }
    paramsByName.forEach(list => list.sort((a, b) => a.time - b.time));
}

export function getVisualParamNames() {
    return [...paramsByName.keys()];
}

export function clearVisualParams() {
    paramsByName = new Map();
}

// Index of the last entry with time <= milliseconds, or -1 if none.
function lastIndexBefore(list, milliseconds) {
    let lo = 0;
    let hi = list.length - 1;
    let found = -1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (list[mid].time <= milliseconds) {
            found = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return found;
}

// Values active at the given song time, as a name -> value Map. The Map
// instance is reused between calls — read it before the next call.
export function getActiveVisualParams(milliseconds) {
    active.clear();
    paramsByName.forEach((list, name) => {
        const ndx = lastIndexBefore(list, milliseconds);
        if (ndx < 0) {
            // Before its first scheduled value a param reads 0 (the GL
            // default), so seeking backwards is deterministic.
            active.set(name, 0);
            return;
        }
        const entry = list[ndx];
        let value = entry.value;
        if (entry.ramp > 0 && milliseconds < entry.time + entry.ramp) {
            // Ramp from the previous scheduled value (0 before the first one).
            // Overlapping ramps start from the previous target, not from the
            // half-ramped value — songs rarely stack ramps on one name.
            const from = ndx > 0 ? list[ndx - 1].value : 0;
            value = from + (value - from) * ((milliseconds - entry.time) / entry.ramp);
        }
        active.set(name, value);
    });
    return active;
}
