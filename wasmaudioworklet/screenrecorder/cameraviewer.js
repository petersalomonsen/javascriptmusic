export function showCamViewer() {
    const videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.style.position = 'fixed';
    videoElement.style.right = '5px';
    videoElement.style.bottom = '5px';
    videoElement.style.width = '200px';
    videoElement.style.height = '200px';
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