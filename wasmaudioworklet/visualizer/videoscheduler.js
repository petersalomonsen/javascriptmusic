let videoSchedule = [];

export function setVideoSchedule(schedule) {
    videoSchedule = schedule;
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
