let videoElement;

function setSmallVideoElementSize() {
    videoElement.style.right = '5px';
    videoElement.style.bottom = '5px';
    videoElement.style.width = '250px';
    videoElement.style.height = '250px';
}

export function isCameraActive() {
    return videoElement ? true : false;
}

export function toggleCamViewer() {
    if (videoElement) {
        videoElement.remove();
        videoElement = null;
    } else {
        videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.style.position = 'fixed';
        videoElement.style.right = '5px';
        videoElement.style.bottom = '5px';
        videoElement.style.width = '250px';
        videoElement.style.height = '250px';
        videoElement.style.zIndex = 9999999;
        videoElement.style.transition = 'all 0.5s ease-in-out';
        document.documentElement.appendChild(videoElement);

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    videoElement.srcObject = stream;
                })
                .catch(function (err) {
                    console.error(err);
                });
        }
    }
}
document.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
        if (event.ctrlKey) {
            toggleCamViewer();
        } else if (videoElement) {
            if (videoElement.style.width === '100%' ) {
                setSmallVideoElementSize();
            } else {
                videoElement.style.position = 'fixed';
                videoElement.style.right = '0px';
                videoElement.style.bottom = '0px';
                videoElement.style.width = '100%';
                videoElement.style.height = '100%';
            }
        }
    }
});
