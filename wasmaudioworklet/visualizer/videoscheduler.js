let videoSchedule = [];
// The text layer is a second, independent image schedule (showText in the song
// API). It renders to its own texture pair so a song can put text over a photo,
// a video or a purely generative shader without fighting for uSampler.
let textSchedule = [];

export function setVideoSchedule(schedule) {
    videoSchedule = schedule;
}

export function setTextSchedule(schedule) {
    textSchedule = schedule;
}

// Did the song schedule any showText? Used to warn when the shader has no
// text layer to show it on.
export function hasScheduledText() {
    return textSchedule.length > 0;
}

// The text entry active at the given time — the latest one started, since
// each showText supersedes the previous (schedules are sorted descending).
// Returns the schedule entry itself ({ startTime, fade, video }) so the
// renderer can time the fade from song time.
export function getActiveText(milliseconds) {
    return textSchedule.find(sch => sch.startTime <= milliseconds) ?? null;
}

export function exportVideoSchedule() {
    const exportObj = videoSchedule.map(sch => ({
        startTime: sch.startTime,
        stopTime: sch.stopTime,
        clipStartTime: sch.clipStartTime,
        videoUrl: sch.video.videoElement?.src ?? undefined,
        imageUrl: sch.video.imageElement?.src ?? undefined,
    }));
    return JSON.stringify(exportObj, null, 1);
}

export function getActiveVideo(milliseconds) {
    const activeSchedule = videoSchedule.find(sch => {
        if (sch.startTime <= milliseconds && (!sch.stopTime || sch.stopTime > milliseconds)) {
            return true;
        } else {
            return false;
        }
    });
    if (activeSchedule) {
        if (activeSchedule.video.AsyncFunctionvideoElement) {
            activeSchedule.video.videoElement.currentTime = ((milliseconds - activeSchedule.startTime + activeSchedule.clipStartTime) / 1000).toFixed(2);
            return activeSchedule.video.videoElement;
        } else if (activeSchedule.video.imageElement && activeSchedule.video.imageElement.complete) {
            return activeSchedule.video.imageElement;
        }
    }
}
