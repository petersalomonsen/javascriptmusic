
let mediaRecorder;
let captureStream;

export async function startVideoRecording(audioContext, audioNodeToRecord) {    
    try {
        const videostream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });

        const audioStreamDestination = audioContext.createMediaStreamDestination();
        audioNodeToRecord.connect(audioStreamDestination);
            
        const tracks = [
            ...videostream.getVideoTracks(), 
            ...audioStreamDestination.stream.getAudioTracks()
        ];
        captureStream = new MediaStream(tracks);

        mediaRecorder = new MediaRecorder(captureStream);
        mediaRecorder.ondataavailable = (event) => { 
            if (event.data.size > 0) {                
                var blob = new Blob([event.data], {
                    type: "video/webm"
                });
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = "test.webm";
                a.click();
                window.URL.revokeObjectURL(url);
            }
        };
        mediaRecorder.start();
    } catch(err) {
      console.error("Error: " + err);
    }
}

export function stopVideoRecording() {
    captureStream.getVideoTracks().forEach(t => t.stop());
    mediaRecorder.stop();
}
