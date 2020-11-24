const noteStringToNoteNumberMap =
    new Array(128).fill(null).map((v, ndx) =>
        (['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'])[ndx % 12] + '' + Math.floor(ndx / 12)
    ).reduce((prev, curr, ndx) => {
        prev[curr] = ndx;
        return prev;
    }, {});

let tick = 0;

export function currentTime() {
    return tick;
}

export let startTime = currentTime();
export let bpm = 110;
export const setBPM = (tempo) => bpm = tempo;

export const currentBeat = () =>
    ((currentTime() -
        startTime) /
        (60 * 1000)
    ) * bpm;

let pendingEvents = [];

function pushPendingEvent(timeout) {
    return new Promise(resolve =>
        pendingEvents.push({
            targetTime: Math.round(currentTime() + timeout),
            resolve: resolve
        })
    );
}

export function resetTick() {
    tick = 0;
}

export async function nextTick() {
    const minPendingTick = pendingEvents.reduce((prev, event) =>
        event.targetTime < prev || prev === -1 ? event.targetTime : prev, -1);
    const resolvedEvents = [];

    pendingEvents
        .filter(event => event.targetTime === minPendingTick)
        .forEach(event => resolvedEvents.push(event.resolve()));
    pendingEvents = pendingEvents.filter(event => event.targetTime > tick);

    tick = minPendingTick;
    await Promise.all(resolvedEvents);
}

export function beatToTimeMillis(beatNo) {
    return ((beatNo / bpm) * 60 * 1000) + startTime;
}

export async function waitForBeat(beatNo) {
    let timeout = Math.floor((((beatNo) / bpm) * (60 * 1000)) -
        (currentTime() -
            startTime));

    if (timeout < 0) {
        timeout = 0;
    }

    return pushPendingEvent(timeout);
}

export class Pattern {
    constructor(output) {
        this.output = output;
        this.channel = 0;
        this.velocity = 100;
        this.offset = 0;
        this.stepsperbeat = 16;
    }

    setChannel(channel) {
        this.channel = channel;
    }

    async waitForStep(stepno) {
        return this.waitForBeat(stepno / this.stepsperbeat);
    }

    async waitForBeat(beatNo) {
        let timeout = Math.floor((((beatNo + this.offset) / bpm) * (60 * 1000)) -
            (currentTime() -
                startTime));

        if (timeout < 0) {
            return;
        } else {
            return pushPendingEvent(timeout);
        }
    }

    toNoteNumber(note) {
        return noteStringToNoteNumberMap[note];
    }

    async waitDuration(duration) {
        const timeout = (duration * 60 * 1000) / bpm;

        return pushPendingEvent(timeout);
    }

    async pitchbend(start, target, duration, steps) {
        const stepdiff = (target - start) / steps;
        let currentValue = start;
        for (let step = 0; step < steps; step++) {

            const rounded = Math.round(currentValue);
            this.output.sendMessage([0xe0 + this.channel, 0x007f & rounded, (0x3f80 & rounded) >> 7]);

            currentValue += stepdiff;

            await this.waitDuration(duration / steps);
        }
        this.output.sendMessage([0xe0 + this.channel, 0x007f & target, (0x3f80 & target) >> 7]);
    }

    async controlchange(controller, start, target, duration, steps) {
        const stepdiff = (target - start) / steps;
        let currentValue = start;
        for (let step = 0; step < steps; step++) {

            const rounded = Math.round(currentValue);
            this.output.sendMessage([0xb0 + this.channel, controller, rounded]);

            currentValue += stepdiff;

            await this.waitDuration(duration / steps);
        }
        this.output.sendMessage([0xb0 + this.channel, controller, 0x7f & target]);
    }

    async note(noteNumber, duration) {
        this.output.sendMessage([0x90 + this.channel, noteNumber, this.velocity]);

        await this.waitDuration(duration);
        this.output.sendMessage([0x80 + this.channel, noteNumber, 0]);
    }

    async playNote(note, duration) {
        this.output.sendMessage([0x90 + this.channel, noteStringToNoteNumberMap[note], this.velocity]);

        await this.waitDuration(duration);
        this.output.sendMessage([0x80 + this.channel, noteStringToNoteNumberMap[note], 0]);
    }
}
