export function showCamViewer() {
    const videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.style.position = 'fixed';
    videoElement.style.right = '5px';
    videoElement.style.bottom = '5px';
    videoElement.style.width = '250px';
    videoElement.style.height = '250px';
    videoElement.style.zIndex = 9999999;
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
window.showCamViewer = showCamViewer;